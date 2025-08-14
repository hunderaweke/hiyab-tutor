package controllers

import (
	"hiyab-tutor/internal/domain"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type BookingController struct {
	u domain.BookingUsecase
}

func NewBookingController(u domain.BookingUsecase) *BookingController {
	return &BookingController{u: u}
}

// Create handles public booking creation
// @Summary Create a new booking
// @Description Create a new booking
// @Tags Bookings
// @Accept json
// @Produce json
// @Param booking body domain.Booking true "Booking"
// @Success 201 {object} domain.Booking
// @Failure 400 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Router /bookings [post]
func (c *BookingController) Create(ctx *gin.Context) {
	var req domain.Booking
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid request"})
		return
	}
	created, err := c.u.Create(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to create booking"})
		return
	}
	ctx.JSON(http.StatusCreated, created)
}

// GetAll handles protected viewing of all bookings
// @Summary Get all bookings
// @Description Get all bookings (protected)
// @Tags Bookings
// @Accept json
// @Produce json
// @Param page query int false "Page number"
// @Param gender query string false "Gender"
// @Param assigned query bool false "Assigned"
// @Success 200 {array} domain.Booking
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /bookings [get]
func (c *BookingController) GetAll(ctx *gin.Context) {
	filter := &domain.BookingFilter{}
	if v := ctx.Query("gender"); v != "" {
		filter.Gender = v
	}
	if v := ctx.Query("assigned"); v != "" {
		filter.Assigned = v == "true"
	}
	bookings, err := c.u.GetAll(filter)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, domain.ErrorResponse{Message: "Failed to fetch bookings"})
		return
	}
	ctx.JSON(http.StatusOK, bookings)
}

// GetByID handles protected viewing of a single booking
// @Summary Get a booking by ID
// @Description Get a booking by ID (protected)
// @Tags Bookings
// @Accept json
// @Produce json
// @Param id path int true "Booking ID"
// @Success 200 {object} domain.Booking
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /bookings/{id} [get]
func (c *BookingController) GetByID(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.ParseUint(strId, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}
	booking, err := c.u.GetByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "Booking not found"})
		return
	}
	ctx.JSON(http.StatusOK, booking)
}

// Assign handles protected assignment of a booking
// @Summary Assign a booking
// @Description Assign a booking (protected)
// @Tags Bookings
// @Accept json
// @Produce json
// @Param id path int true "Booking ID"
// @Success 200 {object} domain.Booking
// @Failure 404 {object} domain.ErrorResponse
// @Failure 500 {object} domain.ErrorResponse
// @Security JWT
// @Router /bookings/{id}/assign [put]
func (c *BookingController) Assign(ctx *gin.Context) {
	strId := ctx.Param("id")
	id, err := strconv.ParseUint(strId, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, domain.ErrorResponse{Message: "Invalid ID"})
		return
	}
	if err := c.u.Assign(uint(id)); err != nil {
		ctx.JSON(http.StatusNotFound, domain.ErrorResponse{Message: "Booking not found or failed to assign"})
		return
	}
	booking, _ := c.u.GetByID(uint(id))
	ctx.JSON(http.StatusOK, booking)
}
