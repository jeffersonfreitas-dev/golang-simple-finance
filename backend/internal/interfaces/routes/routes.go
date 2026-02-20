package routes

import (
	"github.com/gin-gonic/gin"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/infrastructure/handlers"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/infrastructure/auth"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/infrastructure/middleware"
	"gorm.io/gorm"
)

func SetupRoutes(router *gin.Engine, db *gorm.DB, jwtService auth.JWTService) {
	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Public routes
	public := router.Group("/api/v1")
	{
		authHandler := handlers.NewAuthHandler(db, jwtService)
		public.POST("/auth/register", authHandler.Register)
		public.POST("/auth/login", authHandler.Login)
	}

	// Protected routes
	protected := router.Group("/api/v1")
	protected.Use(middleware.AuthMiddleware(jwtService))
	{
		transactionHandler := handlers.NewTransactionHandler(db)

		// Transactions
		protected.POST("/transactions", transactionHandler.CreateTransaction)
		// protected.GET("/transactions", transactionHandler.ListTransactions)
		// protected.GET("/transactions/:id", transactionHandler.GetTransaction)
		// protected.PUT("/transactions/:id", transactionHandler.UpdateTransaction)
		// protected.DELETE("/transactions/:id", transactionHandler.DeleteTransaction)

		// Reports
		// protected.GET("/reports/daily-extract", transactionHandler.GetDailyExtract)
		// protected.GET("/reports/summary", transactionHandler.GetSummary)
	}

	// Admin routes
	admin := protected.Group("/admin")
	admin.Use(middleware.AdminMiddleware())
	{
		// Admin only endpoints
		// admin.GET("/users", userHandler.ListUsers)
	}
}
