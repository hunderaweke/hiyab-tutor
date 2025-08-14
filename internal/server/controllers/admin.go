package controllers

import (
	"hiyab-tutor/internal/auth"
	"hiyab-tutor/internal/domain"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type AdminController struct {
	u domain.AdminUsecase
}

func NewAdminController(u domain.AdminUsecase) *AdminController {
	return &AdminController{
		u: u,
	}
}

// CreateAdmin creates a new admin
// @Summary Create Admin
// @Description Create a new admin with the provided details
// @Tags Admin
// @Accept json
// @Produce json
// @Security JWT
// @Param admin body domain.CreateAdminRequest true "Admin details"
// @Success 201 {object} domain.Admin
// @Failure 400 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin [post]
func (c *AdminController) Create(ctx *gin.Context) {
	var request domain.CreateAdminRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid input"})
		return
	}

	createdAdmin, err := c.u.Create(&domain.Admin{
		Username: request.Username,
		Password: request.Password,
		Role:     request.Role,
		Name:     request.Name,
	})
	if err != nil {
		ctx.JSON(500, domain.ErrorResponse{Message: "Failed to create admin"})
		return
	}

	ctx.JSON(201, createdAdmin)
}

// GetAdminByID retrieves an admin by ID
// @Summary Get Admin by ID
// @Description Retrieve an admin by their ID
// @Tags Admin
// @Produce json
// @Param id path uint true "Admin ID"
// @Success 200 {object} domain.Admin
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /admin/{id} [get]
// @Security JWT
func (c *AdminController) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}

	admin, err := c.u.GetByID(uint(id))
	if err != nil {
		ctx.JSON(404, domain.ErrorResponse{Message: "Admin not found"})
		return
	}

	ctx.JSON(200, admin)
}

// GetAllAdmins retrieves all admins with optional filters
// @Summary Get All Admins
// @Description Retrieve all admins with optional filters
// @Tags Admin
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Number of results per page"
// @Param search query string false "Search term"
// @Param sort_by query string false "Sort by field"
// @Param sort_order query string false "Sort order (asc/desc)"
// @Success 200 {object} domain.MultipleAdmins
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /admin [get]
func (c *AdminController) GetAll(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.Query("page"))
	limit, _ := strconv.Atoi(ctx.Query("limit"))
	search := ctx.Query("search")
	sortBy := ctx.Query("sort_by")
	sortOrder := ctx.Query("sort_order")

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	if sortBy == "" {
		sortBy = "created_at"
	}
	if sortOrder == "" {
		sortOrder = "desc"
	}
	if sortOrder != "asc" && sortOrder != "desc" {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid sort order"})
		return
	}
	filter := &domain.AdminFilter{
		Page:      page,
		Limit:     limit,
		Search:    search,
		SortBy:    sortBy,
		SortOrder: sortOrder,
	}

	admins, err := c.u.GetAll(filter)
	if err != nil {
		ctx.JSON(500, domain.ErrorResponse{Message: "Failed to retrieve admins"})
		return
	}

	ctx.JSON(200, admins)
}

// UpdateAdmin updates an existing admin
// @Summary Update Admin
// @Description Update an admin's details
// @Tags Admin
// @Accept json
// @Produce json
// @Param id path uint true "Admin ID"
// @Param admin body domain.UpdateAdminRequest true "Updated admin details"
// @Success 200 {object} domain.Admin
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /admin/{id} [put]
func (c *AdminController) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}

	var request domain.UpdateAdminRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid input"})
		return
	}

	updatedAdmin, err := c.u.Update(&domain.Admin{
		Model: domain.Model{ID: uint(id)},
		Role:  request.Role,
		Name:  request.Name,
	})
	if err != nil {
		ctx.JSON(404, domain.ErrorResponse{Message: "Admin not found"})
		return
	}

	ctx.JSON(200, updatedAdmin)
}

// DeleteAdmin deletes an admin by ID
// @Summary Delete Admin
// @Description Delete an admin by their ID
// @Tags Admin
// @Produce json
// @Param id path uint true "Admin ID"
// @Success 204
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /admin/{id} [delete]
func (c *AdminController) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}
	admin, err := c.u.GetByID(uint(id))
	if err != nil {
		ctx.JSON(404, domain.ErrorResponse{Message: "Admin not found"})
		return
	}
	if admin.Username == "superadmin" || admin.Role == "superadmin" {
		ctx.JSON(403, domain.ErrorResponse{Message: "Cannot delete superadmin"})
		return
	}
	if err := c.u.Delete(uint(id)); err != nil {
		ctx.JSON(404, domain.ErrorResponse{Message: "Admin not found"})
		return
	}

	ctx.Status(204) // No Content
}

// LoginAdmin logs in an admin
// @Summary Admin Login
// @Description Logs in an admin and returns a token
// @Tags Admin
// @Accept json
// @Produce json
// @Param credentials body domain.LoginRequest true "Admin login credentials"
// @Success 200 {object} domain.LoginAndRegisterResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 401 {object} domain.ErrorResponse
// @Router /admin/login [post]
func (c *AdminController) Login(ctx *gin.Context) {
	var request domain.LoginRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid input"})
		return
	}

	admin, err := c.u.Login(request.Username, request.Password)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusUnauthorized, domain.ErrorResponse{Message: "Invalid credentials"})
		return
	}
	refreshToken, err := auth.GenerateToken(admin, auth.TokenTypeRefresh)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to generate token"})
		return
	}
	accessToken, err := auth.GenerateToken(admin, auth.TokenTypeAccess)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to generate token"})
		return
	}
	ctx.SetCookie("refresh_token", refreshToken, 60*60*24*7, "/auth", "localhost", true, true)
	ctx.JSON(http.StatusOK, domain.LoginAndRegisterResponse{
		AccessToken: accessToken,
		User:        *admin,
	})
}

// ResetPassword resets an admin's password
// @Summary Reset Admin Password
// @Description Resets an admin's password
// @Tags Admin
// @Accept json
// @Produce json
// @Param id path uint true "Admin ID"
// @Param new_password body domain.ResetPasswordRequest true "New password"
// @Success 200 {object} domain.SuccessResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /admin/{id}/reset-password [put]
func (c *AdminController) ResetPassword(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}

	var request domain.ResetPasswordRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid input"})
		return
	}

	if err := c.u.ResetPassword(uint(id), request.NewPassword); err != nil {
		ctx.JSON(404, domain.ErrorResponse{Message: "Admin not found"})
		return
	}

	ctx.JSON(200, domain.MessageResponse{Message: "Password reset successfully"})
}

// ChangePassword changes an admin's password
// @Summary Change Admin Password
// @Description Changes an admin's password
// @Tags Admin
// @Accept json
// @Produce json
// @Param change_password body domain.ChangePasswordRequest true "Change password details"
// @Success 200 {object} domain.SuccessResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /admin/change-password [put]
func (c *AdminController) ChangePassword(ctx *gin.Context) {
	strID, ok := ctx.Get("userID")
	if !ok {
		ctx.JSON(400, domain.ErrorResponse{Message: "ID not found in context"})
		return
	}
	id, ok := strID.(uint)
	if !ok {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}

	var request domain.ChangePasswordRequest
	if err := ctx.ShouldBindJSON(&request); err != nil {
		ctx.JSON(400, domain.ErrorResponse{Message: "Invalid input"})
		return
	}

	if err := c.u.ChangePassword(uint(id), request.OldPassword, request.NewPassword); err != nil {
		ctx.JSON(404, domain.ErrorResponse{Message: "Admin not found or invalid credentials"})
		return
	}

	ctx.JSON(200, domain.MessageResponse{Message: "Password changed successfully"})
}

// GetCurrentAdmin retrieves the currently logged-in admin
// @Summary Get Current Admin
// @Description Retrieves the currently logged-in admin's details
// @Tags Admin
// @Produce json
// @Success 200 {object} domain.Admin
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /admin/me [get]
func (c *AdminController) GetCurrentAdmin(ctx *gin.Context) {
	userID, exists := ctx.Get("userID")
	if !exists {
		ctx.JSON(401, domain.ErrorResponse{Message: "Unauthorized"})
		return
	}

	admin, err := c.u.GetByID(userID.(uint))
	if err != nil {
		ctx.JSON(500, domain.ErrorResponse{Message: "Failed to retrieve admin"})
		return
	}

	ctx.JSON(200, admin)
}

// @Summary Refresh Access Token
// @Description Refreshes currenct access token and creates and new one for the user
// @Tags Admin
// @Produce json
// @Success 200 {object} domain.LoginAndRegisterResponse
// @Failure 401 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Route /admin/refresh [post]
func (c *AdminController) RefreshToken(ctx *gin.Context) {
	refreshToken, err := ctx.Cookie("refresh_token")
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusUnauthorized, domain.ErrorResponse{Message: "Unauthorized to make the request"})
		return
	}
	claims, err := auth.ValidateToken(refreshToken, auth.TokenTypeRefresh)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "invalid token"})
		return
	}
	user, err := c.u.GetByID(claims.UserID)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "invalid token"})
		return
	}
	accessToken, err := auth.GenerateToken(user, auth.TokenTypeAccess)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "error generating token"})
		return
	}
	refreshToken, err = auth.GenerateToken(user, auth.TokenTypeRefresh)
	if err != nil {
		log.Println(err)
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "error generating token"})
		return
	}
	
	ctx.SetCookie("refresh_token", refreshToken, 60*60*24*7, "/auth", "localhost", true, true)
	ctx.JSON(http.StatusOK, domain.LoginAndRegisterResponse{
		AccessToken: accessToken,
		User:        *user,
	})
}
