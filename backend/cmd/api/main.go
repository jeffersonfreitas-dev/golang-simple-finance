package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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
		logrus.Fatalf("No .env file found: ", err)
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

	srv := &http.Server{
		Addr:         ":" + os.Getenv("PORT"),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		logrus.Printf("Server starting on port %s", os.Getenv("PORT"))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logrus.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logrus.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		logrus.Fatal("Server forced to shutdown:", err)
	}

	logrus.Println("Server exiting")

}
