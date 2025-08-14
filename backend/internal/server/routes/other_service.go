package routes

import (
	"hiyab-tutor/internal/domain"
	"hiyab-tutor/internal/server/controllers"
	"hiyab-tutor/internal/server/middlewares"
	"hiyab-tutor/internal/usecases"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupOtherServiceRoutes(r *gin.Engine, db *gorm.DB) {
	// Auto-migrate service and translations
	_ = db.AutoMigrate(&domain.OtherService{}, &domain.OtherServiceTranslation{})

	// Initialize usecase and controller
	usecase := usecases.NewOtherServiceService(db)
	controller := controllers.NewOtherServiceController(usecase)

	// Public endpoints
	public := r.Group("/api/v1/other-services")
	{
		public.GET("/", controller.GetAll)
		public.GET("/:id", controller.GetByID)
	}

	// Protected endpoints (admin/superadmin)
	protected := r.Group("/api/v1/other-services")
	protected.Use(middlewares.AuthMiddleware(), middlewares.IsAdminMiddleware())
	{
		protected.POST("/", controller.Create)
		protected.PUT("/:id", controller.Update)
		protected.DELETE("/:id", controller.Delete)
		protected.POST("/:id/translations", controller.AddTranslation)
	}
}
