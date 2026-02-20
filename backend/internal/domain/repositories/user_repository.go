package repositories

import (
	"errors"

	"github.com/google/uuid"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/domain/entities"
	"gorm.io/gorm"
)

type UserRepository interface {
	Create(user *entities.User) error
	FindByEmail(email string) (*entities.User, error)
	UpdateLastLogin(id uuid.UUID) error
}

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) Create(user *entities.User) error {
	return r.db.Create(user).Error
}

func (r *userRepository) FindByEmail(email string) (*entities.User, error) {
	var user entities.User
	err := r.db.First(&user, "email = ?", email).Error
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, nil
	}
	return &user, err
}

func (r *userRepository) UpdateLastLogin(id uuid.UUID) error {
	return r.db.Model(&entities.User{}).Where("id = ?", id).
		Update("last_login_at", gorm.Expr("NOW()")).Error
}
