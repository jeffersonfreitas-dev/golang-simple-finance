package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

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

	fmt.Print(req.DueDate)
	loc, err := time.LoadLocation("America/Fortaleza")
	if err != nil {
		fmt.Println(err.Error())
	}
	dueDate, err := time.ParseInLocation("2006-01-02", req.DueDate, loc)
	if err != nil {
		fmt.Println(err.Error())
	}

	transaction := &entities.Transaction{
		UserID:      userID.(uuid.UUID),
		Type:        entities.TransactionType(req.Type),
		Description: req.Description,
		Amount:      req.Amount,
		DueDate:     dueDate,
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

func (h *TransactionHandler) ListTransactions(c *gin.Context) {
	userID, _ := c.Get("user_id")

	fmt.Print(c)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	offset := (page - 1) * limit

	filters := repositories.TransactionFilters{
		Limit:  limit,
		Offset: offset,
	}

	if sh := c.Query("search"); sh != "" {
		filters.Search = sh
	}

	if t := c.Query("type"); t != "" {
		tt := entities.TransactionType(t)
		filters.Type = &tt
	}

	if s := c.Query("status"); s != "" {
		ts := entities.TransactionStatus(s)
		filters.Status = &ts
	}

	if sd := c.Query("startDate"); sd != "" {
		startDate, err := time.Parse(time.RFC3339, sd)
		if err == nil {
			filters.StartDate = &startDate
		}
	}

	if ed := c.Query("endDate"); ed != "" {
		endDate, err := time.Parse(time.RFC3339, ed)
		if err == nil {
			filters.EndDate = &endDate
		}
	}

	transactions, total, err := h.transactionRepo.FindByUserID(userID.(uuid.UUID), filters)
	if err != nil {
		logrus.WithError(err).Error("Failed to list transactions")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to list transactions"})
		return
	}

	data := make([]dto.TransactionResponse, len(transactions))
	for i, t := range transactions {
		data[i] = toTransactionResponse(&t)
	}

	response := dto.TransactionListResponse{
		Data:       data,
		Total:      total,
		Page:       page,
		Limit:      limit,
		TotalPages: (int(total) + limit - 1) / limit,
	}

	c.JSON(http.StatusOK, response)
}

func (h *TransactionHandler) DeleteTransaction(c *gin.Context) {
	userID, _ := c.Get("user_id")
	role, _ := c.Get("user_role")

	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Invalid transaction id"})
		return
	}

	transaction, err := h.transactionRepo.FindByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "Transaction not found"})
		return
	}

	if transaction.UserID != userID && role != "admin" {
		c.JSON(http.StatusForbidden, dto.ErrorResponse{Error: "Access denied"})
		return
	}

	if err := h.transactionRepo.Delete(id); err != nil {
		logrus.WithError(err).Error("Failed to delete transaction")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to delete transaction"})
		return
	}

	c.Status(http.StatusNoContent)
}

func (h *TransactionHandler) GetSummary(c *gin.Context) {
	userID, _ := c.Get("user_id")

	startDate, err := time.Parse(time.RFC3339, c.Query("startDate"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Invalid start_date"})
		return
	}

	endDate, err := time.Parse(time.RFC3339, c.Query("endDate"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Invalid end_date"})
		return
	}

	summary, err := h.transactionRepo.GetSummary(userID.(uuid.UUID), startDate, endDate)
	if err != nil {
		logrus.WithError(err).Error("Failed to get summary")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to get summary"})
		return
	}

	c.JSON(http.StatusOK, summary)
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
