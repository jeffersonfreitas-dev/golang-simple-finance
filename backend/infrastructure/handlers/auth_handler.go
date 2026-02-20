package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/domain/entities"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/domain/repositories"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/infrastructure/auth"
	"github.com/jeffersonfreitas-dev/golang-simple-finance/backend/internal/interfaces/dto"
	"github.com/sirupsen/logrus"
	"gorm.io/gorm"
)

type AuthHandler struct {
	userRepo   repositories.UserRepository
	jwtService auth.JWTService
}

func NewAuthHandler(db *gorm.DB, jwtService auth.JWTService) *AuthHandler {
	return &AuthHandler{
		userRepo:   repositories.NewUserRepository(db),
		jwtService: jwtService,
	}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Invalid request", Message: err.Error()})
		return
	}

	if err := dto.ValidateRequest(req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Validation failed", Message: err.Error()})
		return
	}

	existingUser, _ := h.userRepo.FindByEmail(req.Email)
	if existingUser != nil {
		c.JSON(http.StatusConflict, dto.ErrorResponse{Error: "User already exists"})
		return
	}

	user := &entities.User{
		Name:     req.Name,
		Email:    req.Email,
		Password: req.Password,
		Role:     entities.RoleUser,
		Active:   true,
	}

	if err := h.userRepo.Create(user); err != nil {
		logrus.WithError(err).Error("Failed to create user")
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to create user"})
		return
	}

	token, err := h.jwtService.GenerateToken(user.ID, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to generate token"})
		return
	}

	response := dto.LoginResponse{
		Token: token,
		User: dto.UserDTO{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			Role:      string(user.Role),
			CreatedAt: user.CreatedAt.Format(time.RFC3339),
		},
	}

	c.JSON(http.StatusCreated, response)

}

func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "invalid request", Message: err.Error()})
		return
	}

	user, err := h.userRepo.FindByEmail(req.Email)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "invalid credentials"})
		return
	}

	if !user.Active {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "user is inactive"})
		return
	}

	if err := user.ComparePassword(req.Password); err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "invalid credentials"})
		return
	}

	_ = h.userRepo.UpdateLastLogin(user.ID)

	token, err := h.jwtService.GenerateToken(user.ID, string(user.Role))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "failed to generate token"})
		return
	}

	response := dto.LoginResponse{
		Token: token,
		User: dto.UserDTO{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			Role:      string(user.Role),
			CreatedAt: user.CreatedAt.Format(time.RFC3339),
		},
	}

	c.JSON(http.StatusOK, response)
}
