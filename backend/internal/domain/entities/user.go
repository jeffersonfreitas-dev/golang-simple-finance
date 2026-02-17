package entities

import (
	"time"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleAdmin UserRole = "admin"
	RoleUser  UserRole = "user"
)

type User struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Email       string         `gorm:"uniqueIndex;not null" json:"email" validate:"required,email"`
	Password    string         `gorm:"not null" json:"-" validate:"required,min=6"`
	Name        string         `gorm:"not null" json:"name" validate:"required"`
	Role        UserRole       `gorm:"type:varchar(20);not null;default:'user'" json:"role"`
	Active      bool           `gorm:"default:true" json:"active"`
	LastLoginAt *time.Time     `json:"last_login_at"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	u.Password = string(hashedPassword)
	return nil
}

func (u *User) ComparePassword(pass string) error {
	return bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(pass))
}

func (u *User) IsAdmin() bool {
	return u.Role == RoleAdmin
}
