package database

import (
	"fmt"
	"os"
	"time"

	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/domain/entities"
	"github.com/sirupsen/logrus"
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
