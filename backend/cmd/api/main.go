package main

import (
	"os"

	"github.com/gin-gonic/gin"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/infrastructure/database"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/infrastructure/auth"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/infrastructure/middleware"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/interfaces/routes"
	"github.com/joho/godotenv"
	"github.com/sirupsen/logrus"
)

func main() {

	err := godotenv.Load()

	if err != nil {
		logrus.Fatalf("No .env file found")
	}

	logrus.SetFormatter(&logrus.JSONFormatter{})
	logrus.SetOutput(os.Stdout)

	db, err := database.NewPostgresConnection()
	if err != nil {
		logrus.Fatalf("Failed to connect to database: %v", err)
	}

	if err := database.RunMigrations(db); err != nil {
		logrus.Fatalf("Failed to run migrations: %v", err)
	}

	jwtService := auth.NewJWTService()

	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.Logger())
	router.Use(middleware.CORS())

	routes.SetupRoutes(router, db, jwtService)

}
