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

type PartnerController struct {
	u domain.PartnerUsecase
}

// NewPartnerController creates a new PartnerController
func NewPartnerController(u domain.PartnerUsecase) *PartnerController {
	return &PartnerController{
		u: u,
	}
}

// Get All Partners
// @Summary Get all partners
// @Description Get all partners
// @Tags Partners
// @Produce json
// @Success 200 {object} domain.MultiplePartnersResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /partners [get]
func (c *PartnerController) GetAll(ctx *gin.Context) {
	filter := &domain.PartnerFilter{}
	if q, ok := ctx.GetQuery("page"); ok {
		page, err := strconv.Atoi(q)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid page number"})
			return
		}
		filter.Page = page
	}
	if q, ok := ctx.GetQuery("limit"); ok {
		limit, err := strconv.Atoi(q)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid limit number"})
			return
		}
		filter.Limit = limit
	}
	if q, ok := ctx.GetQuery("search"); ok {
		filter.Search = q
	}
	if q, ok := ctx.GetQuery("sort_by"); ok {
		filter.SortBy = q
	}
	if q, ok := ctx.GetQuery("sort_order"); ok {
		filter.SortOrder = q
	}
	if q, ok := ctx.GetQuery("offset"); ok {
		offset, err := strconv.Atoi(q)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset number"})
			return
		}
		filter.Offset = offset
	}

	partners, err := c.u.GetAllPartners(filter)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: err.Error()})
		return
	}
	resp := domain.MultiplePartnersResponse{
		Data: make([]domain.PartnerResponse, 0, len(partners.Partners)),
		Meta: partners.Pagination,
	}
	for _, p := range partners.Partners {
		resp.Data = append(resp.Data, domain.PartnerResponse{ID: p.ID, Name: p.Name, ImageURL: p.ImageURL, WebsiteURL: p.WebsiteURL})
	}
	ctx.JSON(http.StatusOK, resp)
}

// Get Partner by ID
// @Summary Get a partner by ID
// @Description Get a partner by ID
// @Tags Partners
// @Produce json
// @Param id path int true "Partner ID"
// @Success 200 {object} domain.PartnerResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /partners/{id} [get]
func (c *PartnerController) GetByID(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid partner ID"})
		return
	}
	partner, err := c.u.GetPartnerByID(uint(id))
	if err != nil {
		if err == domain.ErrNotFound {
			ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "Partner not found"})
		} else {
			ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: err.Error()})
		}
		return
	}
	ctx.JSON(http.StatusOK, domain.PartnerResponse{ID: partner.ID, Name: partner.Name, ImageURL: partner.ImageURL, WebsiteURL: partner.WebsiteURL})
}

// Create Partner
// @Summary Create a partner with Image and description
// @Tags Partners
// @Accept json
// @Produce json
// @Param partner body domain.CreatePartnerRequest true "Partner details"
// @Success 201 {object} domain.PartnerResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /partners [post]
func (c *PartnerController) Create(ctx *gin.Context) {
	var req domain.CreatePartnerRequest
	if err := ctx.ShouldBind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid input"})
		return
	}
	imageFile, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "error parsing image"})
		return
	}
	fileName := fmt.Sprintf("partners-%d%s", time.Now().Unix(), path.Ext(imageFile.Filename))
	imageURL := path.Join("uploads", "images", fileName)
	if err := ctx.SaveUploadedFile(imageFile, imageURL); err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "error uploading the image"})
		return
	}
	createdPartner, err := c.u.CreatePartner(&domain.Partner{
		Name:       req.Name,
		ImageURL:   imageURL,
		WebsiteURL: req.WebsiteURL,
	})
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to create partner"})
		return
	}
	ctx.JSON(http.StatusCreated, domain.PartnerResponse{ID: createdPartner.ID, Name: createdPartner.Name, ImageURL: createdPartner.ImageURL, WebsiteURL: createdPartner.WebsiteURL})
}

// Update Partner
// @Summary Update a partner with Image and description
// @Tags Partners
// @Accept json
// @Produce json
// @Param id path int true "Partner ID"
// @Param partner body domain.UpdatePartnerRequest true "Partner details"
// @Success 200 {object} domain.PartnerResponse
// @Failure 400 {object} domain.ErrorResponse
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /partners/{id} [put]
func (c *PartnerController) Update(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid partner ID"})
		return
	}
	_, err = c.u.GetPartnerByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "partner not found"})
		return
	}
	var req domain.UpdatePartnerRequest
	if err := ctx.ShouldBind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid input"})
		return
	}
	partner := &domain.Partner{Model: domain.Model{ID: uint(id)}, Name: req.Name, WebsiteURL: req.WebsiteURL}
	imageFile, err := ctx.FormFile("image")
	if err != nil && err != http.ErrMissingFile {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "error parsing image"})
		return
	}
	if imageFile != nil {
		fileName := fmt.Sprintf("partners-%d%s", time.Now().Unix(), path.Ext(imageFile.Filename))
		imageURL := path.Join("uploads", "images", fileName)
		if err := ctx.SaveUploadedFile(imageFile, imageURL); err != nil {
			ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "error uploading the image"})
			return
		}
		partner.ImageURL = imageURL
	}
	updatedPartner, err := c.u.UpdatePartner(partner)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to update partner"})
		return
	}
	ctx.JSON(http.StatusOK, domain.PartnerResponse{ID: updatedPartner.ID, Name: updatedPartner.Name, ImageURL: updatedPartner.ImageURL, WebsiteURL: updatedPartner.WebsiteURL})
}

// Delete Partner
// @Summary Delete a partner by ID
// @Tags Partners
// @Produce json
// @Param id path int true "Partner ID"
// @Success 204
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /partners/{id} [delete]
func (c *PartnerController) Delete(ctx *gin.Context) {
	id, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid partner ID"})
		return
	}
	err = c.u.DeletePartner(uint(id))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to delete partner"})
		return
	}
	ctx.Status(http.StatusNoContent)
}
