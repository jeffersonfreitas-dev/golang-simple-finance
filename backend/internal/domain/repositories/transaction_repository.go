package repositories

import (
	"time"

	"github.com/google/uuid"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/internal/domain/entities"
	"gorm.io/gorm"
)

type TransactionRepository interface {
	Save(transaction *entities.Transaction) error
	FindByUserID(userID uuid.UUID, filters TransactionFilters) ([]entities.Transaction, int64, error)
	FindByID(id uuid.UUID) (*entities.Transaction, error)
	Delete(id uuid.UUID) error
	GetSummary(userID uuid.UUID, startDate, endDate time.Time) (*FinancialSummary, error)
	GetDailyExtract(userID uuid.UUID, date time.Time) ([]entities.Transaction, error)
	GetDailyBalance(userID uuid.UUID, date time.Time) (*DailyBalance, error)
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

func (h *transactionRepository) GetDailyExtract(userID uuid.UUID, date time.Time) ([]entities.Transaction, error) {
	startOfDAy := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDaty := startOfDAy.Add(24 * time.Hour)

	var transactions []entities.Transaction
	err := h.db.Where("user_id = ? AND ((status = 'paid' AND paid_at BETWEEN ? AND ?) OR due_date BETWEEN ? AND ?)",
		userID, startOfDAy, endOfDaty, startOfDAy, endOfDaty).Order("due_date, created_at").
		Find(&transactions).Error

	return transactions, err
}

func (r *transactionRepository) GetDailyBalance(userID uuid.UUID, date time.Time) (*DailyBalance, error) {
	startOfDay := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())
	endOfDay := startOfDay.Add(24 * time.Hour)

	var balance DailyBalance
	balance.Date = startOfDay

	// Get opening balance (previous day's closing balance)
	var openingBalance float64
	r.db.Raw(`
        SELECT COALESCE(SUM(
            CASE 
                WHEN type = 'receivable' AND status = 'paid' THEN amount
                WHEN type = 'payable' AND status = 'paid' THEN -amount
                ELSE 0
            END
        ), 0)
        FROM transactions
        WHERE user_id = ? AND paid_at < ?
    `, userID, startOfDay).Scan(&openingBalance)
	balance.OpeningBalance = openingBalance

	// Get incoming (paid receivables)
	r.db.Raw(`
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions
        WHERE user_id = ? AND type = 'receivable' AND status = 'paid' AND paid_at BETWEEN ? AND ?
    `, userID, startOfDay, endOfDay).Scan(&balance.Incoming)

	// Get outgoing (paid payables)
	r.db.Raw(`
        SELECT COALESCE(SUM(amount), 0)
        FROM transactions
        WHERE user_id = ? AND type = 'payable' AND status = 'paid' AND paid_at BETWEEN ? AND ?
    `, userID, startOfDay, endOfDay).Scan(&balance.Outgoing)

	balance.ClosingBalance = balance.OpeningBalance + balance.Incoming - balance.Outgoing

	return &balance, nil
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

type DailyBalance struct {
	Date           time.Time `json:"date"`
	OpeningBalance float64   `json:"openingBalance"`
	Incoming       float64   `json:"incoming"`
	Outgoing       float64   `json:"outgoing"`
	ClosingBalance float64   `json:"closingBalance"`
}
