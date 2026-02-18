package repositories

import (
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/domain/entities"
	"gorm.io/gorm"
)

type TransactionRepository interface {
	Create(transaction *entities.Transaction) error
}

type transactionRepository struct {
	db *gorm.DB
}

func NewTransactionRepository(db *gorm.DB) TransactionRepository {
	return &transactionRepository{db: db}
}

func (h *transactionRepository) Create(transaction *entities.Transaction) error {
	return h.db.Create(transaction).Error
}
