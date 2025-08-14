package routes

import (
	"hiyab-tutor/internal/domain"
	"hiyab-tutor/internal/server/controllers"
	"hiyab-tutor/internal/server/middlewares"
	"hiyab-tutor/internal/usecases"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupPartnerRoutes(r *gin.Engine, db *gorm.DB) {
	_ = db.AutoMigrate(&domain.Partner{})

	usecase := usecases.NewPartnerUsecase(db)
	controller := controllers.NewPartnerController(usecase)

	public := r.Group("/api/v1/partners")
	{
		public.GET("/", controller.GetAll)
		public.GET("/:id", controller.GetByID)
	}

	protected := r.Group("/api/v1/partners")
	protected.Use(middlewares.AuthMiddleware(), middlewares.IsAdminMiddleware())
	{
		protected.POST("/", controller.Create)
		protected.PUT("/:id", controller.Update)
		protected.DELETE("/:id", controller.Delete)
	}
}
