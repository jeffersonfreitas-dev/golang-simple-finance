package repositories

import (
	"time"

	"github.com/google/uuid"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/domain/entities"
	"gorm.io/gorm"
)

type TransactionRepository interface {
	Save(transaction *entities.Transaction) error
	FindByUserID(userID uuid.UUID, filters TransactionFilters) ([]entities.Transaction, int64, error)
	FindByID(id uuid.UUID) (*entities.Transaction, error)
	Delete(id uuid.UUID) error
	GetSummary(userID uuid.UUID, startDate, endDate time.Time) (*FinancialSummary, error)
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db: db}
}

func (h *transactionRepository) Save(transaction *entities.Transaction) error {
	return h.db.Save(transaction).Error
}

func (h *transactionRepository) FindByUserID(userID uuid.UUID, filters TransactionFilters) ([]entities.Transaction, int64, error) {
	var transactions []entities.Transaction
	var total int64

	query := h.db.Model(&entities.Transaction{}).Where("user_id = ?", userID)
	if filters.Type != nil {
		query = query.Where("type = ?", *filters.Type)
	}

	if filters.Status != nil {
		query = query.Where("status = ?", *filters.Status)
	}

	if filters.StartDate != nil {
		query = query.Where("due_date >= ?", *filters.StartDate)
	}

	if filters.EndDate != nil {
		query = query.Where("due_date <= ?", *filters.EndDate)
	}

	if filters.Search != "" {
		query.Where("description like ?", "%"+filters.Search+"%")
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	err := query.Limit(filters.Limit).Offset(filters.Offset).
		Order("due_date DESC, created_at DESC").
		Find(&transactions).Error

	return transactions, total, err
}

func (h *transactionRepository) FindByID(id uuid.UUID) (*entities.Transaction, error) {
	var transaction entities.Transaction
	err := h.db.First(&transaction, "id = ?", id).Error
	return &transaction, err
}

func (h *transactionRepository) Delete(id uuid.UUID) error {
	return h.db.Delete(&entities.Transaction{}, "id = ?", id).Error
}

func (h *transactionRepository) GetSummary(userID uuid.UUID, startDate, endDate time.Time) (*FinancialSummary, error) {
	var summary FinancialSummary

	err := h.db.Raw(`
		SELECT
			COALESCE(SUM(CASE WHEN type = 'receivable' AND status != 'cancelled' AND deleted_at IS NULL THEN amount ELSE 0 END), 0) as total_receivables,
			COALESCE(SUM(CASE WHEN type = 'payable' AND status != 'cancelled' AND deleted_at IS NULL THEN amount ELSE 0 END), 0) as total_payables,
			COALESCE(SUM(CASE WHEN type = 'receivable' AND status = 'paid' AND deleted_at IS NULL THEN amount ELSE 0 END), 0) as paid_receivables,
			COALESCE(SUM(CASE WHEN type = 'payable' AND status = 'paid' AND deleted_at IS NULL THEN amount ELSE 0 END), 0) as paid_payables,
			COUNT(CASE WHEN status = 'pending' AND due_date < NOW() AND deleted_at IS NULL THEN 1 END) as overdue_count
		FROM transactions
        WHERE user_id = ? AND due_date BETWEEN ? AND ?
	`, userID, startDate, endDate).Scan(&summary).Error

	if err != nil {
		return nil, err
	}

	summary.Balance = summary.TotalReceivables - summary.TotalPayables

	return &summary, nil
}

type TransactionFilters struct {
	Type      *entities.TransactionType
	Status    *entities.TransactionStatus
	StartDate *time.Time
	EndDate   *time.Time
	Search    string
	Limit     int
	Offset    int
}

type FinancialSummary struct {
	TotalReceivables float64 `json:"totalReceivables"`
	TotalPayables    float64 `json:"totalPayables"`
	Balance          float64 `json:"balance"`
	PaidReceivables  float64 `json:"paidReceivables"`
	PaidPayables     float64 `json:"paidPayables"`
	OverdueCount     int64   `json:"overdueCount"`
}
