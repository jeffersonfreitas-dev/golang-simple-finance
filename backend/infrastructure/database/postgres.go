package database

import (
	"fmt"
	"math/rand"
	"os"
	"time"

	"github.com/google/uuid"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/internal/domain/entities"
	"github.com/sirupsen/logrus"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewPostgresConnection() (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	config := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	db, err := gorm.Open(postgres.Open(dsn), config)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	return db, nil
}

func RunMigrations(db *gorm.DB) error {
	logrus.Info("Running database migrations...")

	err := db.AutoMigrate(
		&entities.User{},
		&entities.Transaction{},
	)

	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}

	if err := createAdminUser(db); err != nil {
		logrus.Warnf("failed to create admin user: %v", err)
	}

	if os.Getenv("APP_ENV") == "development" || os.Getenv("APP_ENV") == "local" {
		if err := createMockUsers(db); err != nil {
			logrus.Warnf("failed to create mock users: %v", err)
		}

		if err := createMockTransactions(db); err != nil {
			logrus.Warnf("failed to create mock transactions: %v", err)
		}
	}

	logrus.Info("Migrations completed successfully")
	return nil
}

func createAdminUser(db *gorm.DB) error {
	adminEmail := os.Getenv("ADMIN_EMAIL")
	adminPassword := os.Getenv("ADMIN_PASSWORD")

	if adminEmail == "" || adminPassword == "" {
		return nil
	}

	var count int64
	db.Model(&entities.User{}).Where("role = ?", entities.RoleAdmin).Count(&count)

	if count == 0 {
		admin := &entities.User{
			Email:    adminEmail,
			Password: adminPassword,
			Name:     "Administrator",
			Role:     entities.RoleAdmin,
			Active:   true,
		}

		if err := db.Create(admin).Error; err != nil {
			return err
		}

		logrus.Info("Admin user created successfully")
	}

	return nil
}

func createMockUsers(db *gorm.DB) error {
	logrus.Info("Creating mock users...")

	var count int64
	db.Model(&entities.User{}).Where("role != ?", entities.RoleAdmin).Count(&count)

	if count > 0 {
		logrus.Info("Mock users already exist, skipping...")
		return nil
	}

	mockUsers := []entities.User{
		{
			Email:  "jefferson.dev21@gmail.com",
			Name:   "Jefferson Freitas",
			Role:   entities.RoleUser,
			Active: true,
		},
	}

	defaultPassword := "abcABC123*"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	for _, user := range mockUsers {
		user.Password = string(hashedPassword)
		user.ID = uuid.New()

		if err := db.Create(&user).Error; err != nil {
			logrus.Warnf("failed to create mock user %s: %v", user.Email, err)
		} else {
			logrus.Infof("Mock user created: %s (password: %s)", user.Email, defaultPassword)
		}
	}
	return nil
}

func createMockTransactions(db *gorm.DB) error {
	logrus.Info("Creating mock transactions...")

	var count int64
	db.Model(&entities.Transaction{}).Count(&count)

	if count > 0 {
		logrus.Info("Mock transactions already exist, skipping...")
		return nil
	}

	var users []entities.User
	if err := db.Where("active = ?", true).Find(&users).Error; err != nil {
		return fmt.Errorf("failed to fetch users: %w", err)
	}

	if len(users) == 0 {
		logrus.Warn("No active users found for creating mock transactions")
		return nil
	}

	categories := []string{
		"Alimentação", "Transporte", "Moradia", "Saúde",
		"Educação", "Lazer", "Salário", "Investimentos",
		"Outros",
	}

	receivableDescriptions := []string{
		"Salário mensal", "Freelance", "Venda de produto",
		"Reembolso", "Dividendos", "Aluguel recebido",
		"Bônus", "Comissão", "Presente", "Prêmio",
	}

	payableDescriptions := []string{
		"Supermercado", "Conta de luz", "Conta de água",
		"Internet", "Telefone", "Aluguel", "Condomínio",
		"Faculdade", "Academia", "Plano de saúde",
		"Restaurante", "Cinema", "Uber", "Gasolina",
		"Manutenção do carro", "Roupas", "Presente",
	}

	for _, user := range users {
		numTransactions := rand.Intn(10) + 5

		for i := 0; i < numTransactions; i++ {
			isReceivable := rand.Float32() < 0.4

			transaction := entities.Transaction{
				ID:          uuid.New(),
				UserID:      user.ID,
				Type:        getTransactionType(isReceivable),
				Description: getTransactionDescription(isReceivable, receivableDescriptions, payableDescriptions),
				Amount:      generateRandomAmount(isReceivable),
				Status:      generateRandomStatus(),
				DueDate:     generateRandomDueDate(),
				Category:    categories[rand.Intn(len(categories))],
				Notes:       generateRandomNotes(),
			}

			if transaction.Status == entities.StatusPaid {
				paidAt := transaction.DueDate.AddDate(0, 0, rand.Intn(5)-2)
				if paidAt.After(time.Now()) {
					paidAt = time.Now()
				}
				transaction.PaidAt = &paidAt
			}

			if transaction.Status == entities.StatusOverdue {
				transaction.DueDate = time.Now().AddDate(0, 0, -rand.Intn(30))
			}

			if err := db.Create(&transaction).Error; err != nil {
				logrus.Warnf("failed to create mock transaction for user %s: %v", user.Email, err)
			}
		}
	}

	var totalTransactions int64
	db.Model(&entities.Transaction{}).Count(&totalTransactions)
	logrus.Infof("Created %d mock transactions", totalTransactions)

	return nil
}

func getTransactionType(isReceivable bool) entities.TransactionType {
	if isReceivable {
		return entities.TransactionReceivable
	}
	return entities.TransactionPayable
}

func getTransactionDescription(isReceivable bool, receivableDescs, payableDescs []string) string {
	if isReceivable {
		return receivableDescs[rand.Intn(len(receivableDescs))]
	}
	return payableDescs[rand.Intn(len(payableDescs))]
}

func generateRandomAmount(isReceivable bool) float64 {
	var amount float64

	if isReceivable {
		amount = float64(rand.Intn(4900) + 100)
	} else {
		amount = float64(rand.Intn(990) + 10)
	}

	amount += float64(rand.Intn(99)) / 100

	return amount
}

func generateRandomStatus() entities.TransactionStatus {
	statuses := []entities.TransactionStatus{
		entities.StatusPending, entities.StatusPending, entities.StatusPending, entities.StatusPending, entities.StatusPending,
		entities.StatusPaid, entities.StatusPaid, entities.StatusPaid,
		entities.StatusOverdue, entities.StatusOverdue,
		entities.StatusCancelled,
	}

	return statuses[rand.Intn(len(statuses))]
}

func generateRandomDueDate() time.Time {
	daysOffset := rand.Intn(61) - 30 // -30 a +30 dias
	return time.Now().AddDate(0, 0, daysOffset)
}

func generateRandomNotes() string {
	notes := []string{
		"",
		"Pagar com urgência",
		"Confirmar pagamento",
		"Aguardando confirmação",
		"Já combinado com fornecedor",
		"Parcelado em 3x",
		"Desconto de 10% à vista",
		"Nota fiscal pendente",
		"Cliente antigo",
		"Primeira compra",
	}

	if rand.Float32() < 0.6 {
		return notes[rand.Intn(len(notes))]
	}
	return ""
}

func ResetMockData(db *gorm.DB) error {
	logrus.Warn("Resetting mock data...")

	if err := db.Where("user_id NOT IN (SELECT id FROM users WHERE role = ?)", entities.RoleAdmin).Delete(&entities.Transaction{}).Error; err != nil {
		return err
	}

	if err := db.Where("role != ?", entities.RoleAdmin).Delete(&entities.User{}).Error; err != nil {
		return err
	}

	logrus.Info("Mock data reset successfully")
	return nil
}
