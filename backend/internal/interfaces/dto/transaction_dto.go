package dto

import (
	"time"

	"github.com/google/uuid"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/internal/domain/entities"
)

type TransactionResponse struct {
	ID          uuid.UUID                  `json:"id"`
	UserID      uuid.UUID                  `json:"user_id"`
	Type        entities.TransactionType   `json:"type"`
	Description string                     `json:"description"`
	Amount      float64                    `json:"amount"`
	Status      entities.TransactionStatus `json:"status"`
	DueDate     time.Time                  `json:"dueDate"`
	PaidAt      *time.Time                 `json:"paidAt"`
	Category    string                     `json:"category"`
	Notes       string                     `json:"notes"`
	CreatedAt   time.Time                  `json:"createdAt"`
}

type CreateTransactionRequest struct {
	Type        string  `json:"type" validate:"required,oneof=payable receivable"`
	Description string  `json:"description" validate:"required"`
	Amount      float64 `json:"amount" validate:"required,gt=0"`
	DueDate     string  `json:"dueDate" validate:"required"`
	Category    string  `json:"category"`
	Notes       string  `json:"notes"`
	PaidAt      string  `json:"paidAt"`
}

type TransactionListResponse struct {
	Data       []TransactionResponse `json:"data"`
	Total      int64                 `json:"total"`
	Page       int                   `json:"page"`
	Limit      int                   `json:"limit"`
	TotalPages int                   `json:"total_pages"`
}

type DailyBalanceResponse struct {
	Date           string  `json:"date"`
	OpeningBalance float64 `json:"openingBalance"`
	Incoming       float64 `json:"incoming"`
	Outgoing       float64 `json:"outgoing"`
	ClosingBalance float64 `json:"closingBalance"`
}

type DailyExtractResponse struct {
	Date         string                `json:"date"`
	Balance      DailyBalanceResponse  `json:"balance"`
	Transactions []TransactionResponse `json:"transactions"`
}
