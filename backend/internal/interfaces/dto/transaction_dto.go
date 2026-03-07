package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/domain/entities"
)

type TransactionResponse struct {
	ID          uuid.UUID                  `json:"id"`
	UserID      uuid.UUID                  `json:"user_id"`
	Type        entities.TransactionType   `json:"type"`
	Description string                     `json:"description"`
	Amount      float64                    `json:"amount"`
	Status      entities.TransactionStatus `json:"status"`
	DueDate     time.Time                  `json:"dueDate"`
	PaidAt      *time.Time                 `json:"paid_at"`
	Category    string                     `json:"category"`
	Notes       string                     `json:"notes"`
	CreatedAt   time.Time                  `json:"created_at"`
}

type CreateTransactionRequest struct {
	Type        string  `json:"type" validate:"required,oneof=payable receivable"`
	Description string  `json:"description" validate:"required"`
	Amount      float64 `json:"amount" validate:"required,gt=0"`
	DueDate     string  `json:"dueDate" validate:"required"`
	Category    string  `json:"category"`
	Notes       string  `json:"notes"`
}

type TransactionListResponse struct {
	Data       []TransactionResponse `json:"data"`
	Total      int64                 `json:"total"`
	Page       int                   `json:"page"`
	Limit      int                   `json:"limit"`
	TotalPages int                   `json:"total_pages"`
}
