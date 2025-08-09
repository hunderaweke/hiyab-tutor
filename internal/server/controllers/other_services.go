package controllers

import (
	"net/http"
	"strconv"
	"strings"

	"hiyab-tutor/internal/domain"

	"github.com/gin-gonic/gin"
)

type OtherServiceController struct {
	usecase domain.OtherServiceUsecase
}

func NewOtherServiceController(u domain.OtherServiceUsecase) *OtherServiceController {
	return &OtherServiceController{usecase: u}
}

// Create creates a new other service
// @Summary Create a new other service
// @Description Create a new other service with translations
// @Tags Other Services
// @Accept json
// @Produce json
// @Param service body domain.OtherService true "Other service payload"
// @Success 201 {object} domain.OtherService
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security JWT
// @Router /other-services [post]
func (c *OtherServiceController) Create(ctx *gin.Context) {
	var service domain.OtherService
	if err := ctx.ShouldBindJSON(&service); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	created, err := c.usecase.CreateService(&service)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create service"})
		return
	}
	ctx.JSON(http.StatusCreated, created)
}

// GetByID returns a service by ID
// @Summary Get a service by ID
// @Description Get a service by ID, optionally filtering translations by language codes
// @Tags Other Services
// @Produce json
// @Param id path int true "Service ID"
// @Param language_codes query []string false "Language codes (comma-separated or repeated)"
// @Success 200 {object} domain.OtherService
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /other-services/{id} [get]
func (c *OtherServiceController) GetByID(ctx *gin.Context) {
	idUint, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	languages := ctx.QueryArray("language_codes")
	if len(languages) == 0 {
		if raw, ok := ctx.GetQuery("language_codes"); ok && raw != "" {
			languages = strings.Split(raw, ",")
		}
	}
	svc, err := c.usecase.GetServiceByID(uint(idUint), languages)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}
	ctx.JSON(http.StatusOK, svc)
}

// GetAll lists services with optional filters
// @Summary Get all other services
// @Description Get all other services with pagination, search, sorting, and language filters
// @Tags Other Services
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Number of services per page"
// @Param search query string false "Search term"
// @Param sort_by query string false "Sort by field"
// @Param sort_order query string false "Sort order (asc/desc)"
// @Param language_codes query []string false "Language codes (comma-separated or repeated)"
// @Success 200 {object} domain.MultipleOtherServices
// @Failure 500 {object} map[string]string
// @Router /other-services [get]
func (c *OtherServiceController) GetAll(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.Query("page"))
	limit, _ := strconv.Atoi(ctx.Query("limit"))
	search := ctx.Query("search")
	sortBy := ctx.Query("sort_by")
	sortOrder := ctx.Query("sort_order")
	languages := ctx.QueryArray("language_codes")
	if len(languages) == 0 {
		if raw, ok := ctx.GetQuery("language_codes"); ok && raw != "" {
			languages = strings.Split(raw, ",")
		}
	}
	filter := &domain.ServiceFilter{
		Page:          page,
		Limit:         limit,
		Search:        search,
		SortBy:        sortBy,
		SortOrder:     sortOrder,
		LanguageCodes: languages,
	}
	result, err := c.usecase.GetAllServices(filter)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch services"})
		return
	}
	ctx.JSON(http.StatusOK, result)
}

// Update updates an existing service
// @Summary Update an other service
// @Description Update an existing other service
// @Tags Other Services
// @Accept json
// @Produce json
// @Param id path int true "Service ID"
// @Param service body domain.OtherService true "Updated service payload"
// @Success 200 {object} domain.OtherService
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Security JWT
// @Router /other-services/{id} [put]
func (c *OtherServiceController) Update(ctx *gin.Context) {
	idUint, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	var service domain.OtherService
	if err := ctx.ShouldBindJSON(&service); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
		return
	}
	service.ID = uint(idUint)
	updated, err := c.usecase.UpdateService(&service)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}
	ctx.JSON(http.StatusOK, updated)
}

// Delete removes a service by ID
// @Summary Delete an other service
// @Description Delete an other service by ID
// @Tags Other Services
// @Produce json
// @Param id path int true "Service ID"
// @Success 204
// @Failure 400 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Security JWT
// @Router /other-services/{id} [delete]
func (c *OtherServiceController) Delete(ctx *gin.Context) {
	idUint, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	if err := c.usecase.DeleteService(uint(idUint)); err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "Service not found"})
		return
	}
	ctx.Status(http.StatusNoContent)
}
