package routes

import (
	"hiyab-tutor/internal/repository"
	"hiyab-tutor/internal/server/controllers"
	"hiyab-tutor/internal/server/middlewares"
	"hiyab-tutor/internal/usecases"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupTutorRoutes(r *gin.Engine, db *gorm.DB) {
	tutorRepo := repository.NewTutorRepository(db)
	tutorUsecase := usecases.NewTutorUsecase(tutorRepo)
	controller := controllers.NewTutorController(tutorUsecase)

	api := r.Group("/api/v1/tutors")
	api.POST("/", controller.Create)
	api.GET("/", controller.GetAll)
	api.GET("/:id", controller.GetByID)
	api.Use(middlewares.AuthMiddleware(), middlewares.IsAdminMiddleware())
	{
		api.PUT("/:id", controller.Update)
		api.DELETE("/:id", controller.Delete)
		api.PUT("/:id/verify", controller.Verify)
	}
}
