package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/domain/entities"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/domain/repositories"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/interfaces/dto"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type TransactionHandler struct {
	transactionRepo repositories.TransactionRepository
}

func NewTransactionHandler(db *gorm.DB) *TransactionHandler {
	return &TransactionHandler{
		transactionRepo: repositories.NewTransactionRepository(db),
	}
}

// CreateTransaction godoc
// @Summary Create a new transaction
// @Security BearerAuth
// @Tags Transactions
// @Accept json
// @Produce json
// @Param request body dto.CreateTransactionRequest true "Transaction data"
// @Success 201 {object} dto.TransactionResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /transactions [post]
func (h *TransactionHandler) CreateTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")

	var req dto.CreateTransactionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Invalid request", Message: err.Error()})
		return
	}

	if err := dto.ValidateRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Validation failed", Message: err.Error()})
		return
	}

	transaction := &entities.Transaction{
		UserID:      userID.(uuid.UUID),
		Type:        entities.TransactionType(req.Type),
		Description: req.Description,
		Amount:      req.Amount,
		DueDate:     req.DueDate,
		Category:    req.Category,
		Notes:       req.Notes,
	}

	if err := h.transactionRepo.Create(transaction); err != nil {
		logrus.WithError(err).Error("Failed to create transaction")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to create transaction"})
		return
	}

	response := toTransactionResponse(transaction)
	c.JSON(http.StatusCreated, response)
}

func toTransactionResponse(t *entities.Transaction) dto.TransactionResponse {
	return dto.TransactionResponse{
		ID:          t.ID,
		UserID:      t.UserID,
		Type:        t.Type,
		Description: t.Description,
		Amount:      t.Amount,
		Status:      t.Status,
		DueDate:     t.DueDate,
		PaidAt:      t.PaidAt,
		Category:    t.Category,
		Notes:       t.Notes,
		CreatedAt:   t.CreatedAt,
	}
}
