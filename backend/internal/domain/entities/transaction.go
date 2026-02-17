package entities

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TransactionType string

const (
	TransactionPayable    TransactionType = "payable"
	TransactionReceivable TransactionType = "receivable"
)

type TransactionStatus string

const (
	StatusPending   TransactionStatus = "pending"
	StatusPaid      TransactionStatus = "paid"
	StatusOverdue   TransactionStatus = "overdue"
	StatusCancelled TransactionStatus = "cancelled"
)

type Transaction struct {
	ID          uuid.UUID         `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID         `gorm:"type:uuid;not null;index" json:"user_id"`
	User        User              `gorm:"foreignKey:UserID" json:"-"`
	Type        TransactionType   `gorm:"type:varchar(20);not null" json:"type"`
	Description string            `gorm:"not null" json:"description" validate:"required"`
	Amount      float64           `gorm:"type:decimal(15,2);not null" json:"amount" validate:"required,gt=0"`
	Status      TransactionStatus `gorm:"type:varchar(20);not null;default:'pending'" json:"status"`
	DueDate     time.Time         `gorm:"not null;index" json:"due_date"`
	PaidAt      *time.Time        `json:"paid_at"`
	Category    string            `json:"category"`
	Notes       string            `json:"notes"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
	DeletedAt   gorm.DeletedAt    `gorm:"index" json:"-"`
}

func (t *Transaction) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

func (t *Transaction) MarkAsPaid() {
	now := time.Now()
	t.Status = StatusPaid
	t.PaidAt = &now
}

func (t *Transaction) IsOverdue() bool {
	return t.Status == StatusPending && time.Now().After(t.DueDate)
}
