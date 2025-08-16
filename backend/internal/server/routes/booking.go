package routes

import (
	"hiyab-tutor/internal/repository"
	"hiyab-tutor/internal/server/controllers"
	"hiyab-tutor/internal/server/middlewares"
	"hiyab-tutor/internal/usecases"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupBookingRoutes(r *gin.Engine, db *gorm.DB) {
	bookingRepo := repository.NewBookingRepository(db)
	bookingUsecase := usecases.NewBookingUsecase(bookingRepo)
	controller := controllers.NewBookingController(bookingUsecase)

	api := r.Group("/api/v1")
	// Public route
	api.POST("/bookings", controller.Create)
	// Protected routes (add auth middleware as needed)
	api.Use(middlewares.AuthMiddleware(), middlewares.IsSuperAdminMiddleware())
	{
		api.GET("/bookings", controller.GetAll)
		api.GET("/bookings/:id", controller.GetByID)
		api.PUT("/bookings/:id/assign", controller.Assign)
	}
}
