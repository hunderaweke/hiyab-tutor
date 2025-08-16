package controllers

import (
	"fmt"
	"hiyab-tutor/internal/domain"
	"net/http"
	"path"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type TutorController struct {
	u domain.TutorUsecase
}

func NewTutorController(u domain.TutorUsecase) *TutorController {
	return &TutorController{u: u}
}

// Create handles the creation of a new tutor
// @Summary Create a new tutor
// @Description Create a new tutor
// @Tags Tutors
// @Accept json
// @Produce json
// @Param tutor body domain.Tutor true "Tutor"
// @Success 201 {object} domain.Tutor
// @Failure 400 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /tutors [post]
func (c *TutorController) Create(ctx *gin.Context) {
	var req domain.Tutor
	if err := ctx.ShouldBind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid request"})
		return
	}
	document, err := ctx.FormFile("document")
	if err != nil {
		ctx.JSON(http.StatusNotAcceptable, domain.ErrorResponse{Message: "Document is required"})
		return
	}
	documentName := fmt.Sprintf("tutor-%d%s", time.Now().Unix(), path.Ext(document.Filename))
	documentPath := path.Join("uploads", "documents", documentName)
	if err := ctx.SaveUploadedFile(document, documentPath); err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to Upload the document"})
		return
	}
	image, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusNotAcceptable, domain.ErrorResponse{Message: "Image is required"})
		return
	}
	imageName := fmt.Sprintf("tutor-%d%s", time.Now().Unix(), path.Ext(image.Filename))
	imagePath := path.Join("uploads", "images", imageName)
	if err := ctx.SaveUploadedFile(image, imagePath); err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to Upload the document"})
		return
	}
	req.Document = documentPath
	req.Image = imagePath
	created, err := c.u.Create(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to create tutor"})
		return
	}
	ctx.JSON(http.StatusCreated, created)
}

// GetAll handles fetching all tutors with optional filters
// @Summary Get all tutors
// @Description Get all tutors with optional filters
// @Tags Tutors
// @Accept json
// @Produce json
// @Param education_level query string false "Education Level"
// @Param verified query bool false "Verified"
// @Param query query string false "Search query"
// @Param min_day_per_week query int false "Min Day Per Week"
// @Param max_day_per_week query int false "Max Day Per Week"
// @Param min_hr_per_day query int false "Min Hr Per Day"
// @Param max_hr_per_day query int false "Max Hr Per Day"
// @Success 200 {object} domain.MultipleTutorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /tutors [get]
func (c *TutorController) GetAll(ctx *gin.Context) {
	filter := &domain.TutorFilter{}
	if v := ctx.Query("education_level"); v != "" {
		filter.EducationLevel = v
	}
	if v := ctx.Query("verified"); v != "" {
		filter.Verified = v == "true"
	}
	// support both `query` and `search` from frontend
	if v := ctx.Query("query"); v != "" {
		filter.Query = v
	}
	if v := ctx.Query("search"); v != "" {
		filter.Query = v
	}
	// pagination
	if v := ctx.Query("page"); v != "" {
		if val, err := strconv.Atoi(v); err == nil {
			filter.Page = val
		}
	}
	if v := ctx.Query("limit"); v != "" {
		if val, err := strconv.Atoi(v); err == nil {
			filter.Limit = val
		}
	}
	// sorting
	if v := ctx.Query("sort_by"); v != "" {
		filter.SortBy = v
	}
	if v := ctx.Query("sort_order"); v != "" {
		filter.SortOrder = v
	}
	if v := ctx.Query("min_day_per_week"); v != "" {
		if val, err := strconv.Atoi(v); err == nil {
			filter.MinDayPerWeek = val
		}
	}
	if v := ctx.Query("max_day_per_week"); v != "" {
		if val, err := strconv.Atoi(v); err == nil {
			filter.MaxDayPerWeek = val
		}
	}
	if v := ctx.Query("min_hr_per_day"); v != "" {
		if val, err := strconv.Atoi(v); err == nil {
			filter.MinHrPerDay = val
		}
	}
	if v := ctx.Query("max_hr_per_day"); v != "" {
		if val, err := strconv.Atoi(v); err == nil {
			filter.MaxHrPerDay = val
		}
	}
	resp, err := c.u.GetAll(filter)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to fetch tutors"})
		return
	}
	ctx.JSON(http.StatusOK, resp)
}

// GetByID handles fetching a tutor by ID
// @Summary Get a tutor by ID
// @Description Get a tutor by ID
// @Tags Tutors
// @Accept json
// @Produce json
// @Param id path int true "Tutor ID"
// @Success 200 {object} domain.Tutor
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /tutors/{id} [get]
func (c *TutorController) GetByID(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.ParseUint(strId, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}
	tutor, err := c.u.GetByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "Tutor not found"})
		return
	}
	ctx.JSON(http.StatusOK, tutor)
}

// Update handles updating an existing tutor
// @Summary Update an existing tutor
// @Description Update an existing tutor
// @Tags Tutors
// @Accept json
// @Produce json
// @Param id path int true "Tutor ID"
// @Param tutor body domain.Tutor true "Tutor"
// @Success 200 {object} domain.Tutor
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /tutors/{id} [put]
func (c *TutorController) Update(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.ParseUint(strId, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}
	_, err = c.u.GetByID(uint(id))
	if err != nil {
		if err == domain.ErrNotFound {
			ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "error finding the tutor"})
		return
	}

	var req domain.UpdateTutorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid request"})
		return
	}
	updated, err := c.u.Update(uint(id), &domain.Tutor{
		FirstName:      req.FullName,
		Email:          req.Email,
		EducationLevel: req.EducationLevel,
		DayPerWeek:     req.DayPerWeek,
		HrPerDay:       req.HrPerDay,
		Verified:       req.Verified,
		PhoneNumber:    req.PhoneNumber,
	})
	if err != nil {
		ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "Tutor not found"})
		return
	}
	ctx.JSON(http.StatusOK, updated)
}

// Delete handles deleting a tutor by ID
// @Summary Delete a tutor by ID
// @Description Delete a tutor by ID
// @Tags Tutors
// @Accept json
// @Produce json
// @Param id path int true "Tutor ID"
// @Success 204
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /tutors/{id} [delete]
func (c *TutorController) Delete(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.ParseUint(strId, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}
	err = c.u.Delete(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "Tutor not found"})
		return
	}
	ctx.Status(http.StatusNoContent)
}

// Verify handles verifying a tutor
// @Summary Verify a tutor
// @Description Verify a tutor
// @Tags Tutors
// @Accept json
// @Produce json
// @Param id path int true "Tutor ID"
// @Success 200 {object} domain.Tutor
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /tutors/{id}/verify [put]
func (c *TutorController) Verify(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.ParseUint(strId, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}
	_, err = c.u.GetByID(uint(id))
	if err != nil {
		if err == domain.ErrNotFound {
			ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: err.Error()})
			return
		}
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "error finding the tutor"})
		return
	}
	if err := c.u.Verify(uint(id)); err != nil {
		ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "Tutor not found or failed to verify"})
		return
	}
	tutor, _ := c.u.GetByID(uint(id))
	ctx.JSON(http.StatusOK, tutor)
}
