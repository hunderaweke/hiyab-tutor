package controllers

import (
	"fmt"
	"hiyab-tutor/internal/domain"
	"net/http"
	"os"
	"path"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type TestimonialController struct {
	// Add any dependencies needed for the controller
	u domain.TestimonialUsecase
}

func NewTestimonialController(u domain.TestimonialUsecase) *TestimonialController {
	return &TestimonialController{
		u: u,
	}
}

func NewTestimonialControllerWithStorage(u domain.TestimonialUsecase) *TestimonialController {
	return &TestimonialController{
		u: u,
	}
}

// Create handles the creation of a new testimonial
// @Summary Create a new testimonial
// @Description Create a new testimonial
// @Tags Testimonials
// @Accept multipart/form-data
// @Produce json
// @Security JWT
// @Param name formData string true "Name"
// @Param role formData string true "Role"
// @Param thumbnail formData string true "Thumbnail URL"
// @Param languages formData string true "JSON array of translations"
// @Param video formData file true "Video file"
// @Success 201 {object} domain.TestimonialResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /testimonials [post]
func (c *TestimonialController) Create(ctx *gin.Context) {
	var req domain.CreateTestimonialRequest
	if err := ctx.ShouldBind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Failed to bind request"})
		return
	}
	var videoURL string
	if video, err := ctx.FormFile("video"); err == nil {
		fileName := fmt.Sprintf("%d%s", time.Now().Unix(), path.Ext(video.Filename))
		videoURL = path.Join("uploads", "videos", fileName)
		if err := ctx.SaveUploadedFile(video, videoURL); err != nil {
			ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to save video"})
			return
		}
	}
	var thumbnailURL string
	if thumbnail, err := ctx.FormFile("thumbnail"); err == nil {
		fileName := fmt.Sprintf("%d%s", time.Now().Unix(), path.Ext(thumbnail.Filename))
		thumbnailURL = path.Join("uploads", "thumbnails", fileName)
		if err := ctx.SaveUploadedFile(thumbnail, thumbnailURL); err != nil {
			ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to save thumbnail"})
			return
		}
	}
	testimonial := &domain.Testimonial{
		Name:      req.Name,
		Role:      req.Role,
		Video:     videoURL,
		Thumbnail: thumbnailURL,
	}
	createdTestimonial, err := c.u.CreateTestimonial(testimonial)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to create testimonial"})
		return
	}

	ctx.JSON(http.StatusCreated, createdTestimonial)
}

// GetByID handles fetching a testimonial by ID
// @Summary Get a testimonial by ID
// @Description Get a testimonial by ID
// @Tags Testimonials
// @Accept json
// @Produce json
// @Param id path int true "Testimonial ID"
// @Success 200 {object} domain.TestimonialResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /testimonials/{id} [get]
func (c *TestimonialController) GetByID(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.ParseUint(strId, 10, 32)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid ID"})
		return
	}

	testimonial, err := c.u.GetTestimonialByID(uint(id))
	if err != nil {
		ctx.JSON(404, domain.ErrorResponse{Message: "Testimonial not found"})
		return
	}
	ctx.JSON(200, testimonial)
}

// GetAll handles fetching all testimonials with optional filters
// @Summary Get all testimonials
// @Description Get all testimonials with optional filters
// @Tags Testimonials
// @Accept json
// @Produce json
// @Param page query int false "Page number"
// @Param limit query int false "Number of testimonials per page"
// @Success 200 {object} domain.MultipleTestimonialsResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /testimonials [get]
func (c *TestimonialController) GetAll(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.Query("page"))
	limit, _ := strconv.Atoi(ctx.Query("limit"))
	query, _ := ctx.GetQuery("search")
	sortBy, _ := ctx.GetQuery("sort_by")
	sortOrder, _ := ctx.GetQuery("sort_order")
	filter := &domain.TestimonialFilter{}
	if page > 0 {
		filter.Page = page
	}
	if limit > 0 {
		filter.Limit = limit
	}
	if query != "" {
		filter.Query = query
	}
	if sortBy != "" {
		filter.SortBy = sortBy
	}
	if sortOrder != "" {
		filter.SortOrder = sortOrder
	}
	resp, err := c.u.GetAllTestimonials(filter)
	if err != nil {
		ctx.JSON(500, domain.ErrorResponse{Message: "Failed to fetch testimonials"})
		return
	}
	ctx.JSON(http.StatusOK, resp)
}

// Update handles updating an existing testimonial
// @Summary Update an existing testimonial
// @Description Update an existing testimonial
// @Tags Testimonials
// @Accept multipart/form-data
// @Produce json
// @Security JWT
// @Param id path int true "Testimonial ID"
// @Param name formData string true "Name"
// @Param role formData string true "Role"
// @Param thumbnail formData string true "Thumbnail URL"
// @Param languages formData string true "JSON array of translations"
// @Param video formData file false "Video file"
// @Success 200 {object} domain.TestimonialResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /testimonials/{id} [put]
func (c *TestimonialController) Update(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.ParseUint(strId, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID"})
		return
	}
	var req domain.UpdateTestimonialRequest
	if err := ctx.ShouldBind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: err.Error()})
		return
	}
	testimonial, err := c.u.GetTestimonialByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "Testimonial not found"})
		return
	}
	var videoURL string
	if ctx.Request.MultipartForm != nil {
		videoFile, err := ctx.FormFile("video")
		if err == nil {
			if testimonial.Video != "" {
				err := os.Remove(testimonial.Video)
				if err != nil {
					ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "failed to remove old video"})
					return
				}
			}
			fileName := fmt.Sprintf("%d%s", time.Now().Unix(), path.Ext(videoFile.Filename))
			videoURL = path.Join("uploads", "videos", fileName)
			if err = ctx.SaveUploadedFile(videoFile, videoURL); err != nil {
				ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "failed to upload video"})
				return
			}
		}
	}
	var thumbnailURL string
	if ctx.Request.MultipartForm != nil {
		videoFile, err := ctx.FormFile("thumbnail")
		if err == nil {
			if testimonial.Thumbnail != "" {
				err := os.Remove(testimonial.Thumbnail)
				if err != nil {
					ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "failed to remove old thumbnail"})
					return
				}
			}
			fileName := fmt.Sprintf("%d%s", time.Now().Unix(), path.Ext(videoFile.Filename))
			thumbnailURL = path.Join("uploads", "thumbnails", fileName)
			if err = ctx.SaveUploadedFile(videoFile, thumbnailURL); err != nil {
				ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "failed to upload thumbnail"})
				return
			}
		}
	}
	t := domain.Testimonial{Model: domain.Model{ID: uint(id)}, Name: req.Name, Role: req.Role}
	if videoURL != "" {
		t.Video = videoURL
	}
	if thumbnailURL != "" {
		t.Thumbnail = thumbnailURL
	}
	updated, err := c.u.UpdateTestimonial(&t)
	if err != nil {
		ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "Testimonial not found"})
		return
	}
	ctx.JSON(http.StatusOK, updated)
}

// Delete handles deleting a testimonial by ID
// @Summary Delete a testimonial by ID
// @Description Delete a testimonial by ID
// @Tags Testimonials
// @Accept json
// @Produce json
// @Param id path int true "Testimonial ID"
// @Success 204
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /testimonials/{id} [delete]
func (c *TestimonialController) Delete(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.ParseUint(strId, 10, 32)
	if err != nil {
		ctx.JSON(400, gin.H{"error": "Invalid ID"})
		return
	}

	err = c.u.DeleteTestimonial(uint(id))
	if err != nil {
		ctx.JSON(404, domain.ErrorResponse{Message: "Testimonial not found"})
		return
	}

	ctx.Status(http.StatusNoContent) // No Content
}

// AddTranslations adding a translation to a testimonial
// @Summary Add a translation to a testimonial
// @Description Add a translation to a testimonial
// @Tags Testimonials
// @Security JWT
// @Param id path int true "Testimonial ID"
// @Param translation body domain.TestimonialTranslation true "Translation"
// @Success 200 {object} domain.TestimonialResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /testimonials/{id}/translations [post]
func (c *TestimonialController) AddTranslation(ctx *gin.Context) {
	var translation domain.TestimonialTranslation
	if err := ctx.ShouldBindJSON(&translation); err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid request payload"})
		return
	}

	strId := ctx.Param("id")
	id, err := strconv.ParseUint(strId, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}

	updated, err := c.u.AddTranslation(uint(id), &translation)
	if err != nil {
		ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "Testimonial not found"})
		return
	}
	ctx.JSON(http.StatusOK, updated)
}
