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

	api := r.Group("/api/v1/bookings")
	// Public route
	api.POST("/", controller.Create)
	// Protected routes (add auth middleware as needed)
	api.Use(middlewares.AuthMiddleware(), middlewares.IsSuperAdminMiddleware())
	{
		api.GET("/", controller.GetAll)
		api.GET("/:id", controller.GetByID)
		api.PUT("/:id/assign", controller.Assign)
	}
}
