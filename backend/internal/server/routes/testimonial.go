package routes

import (
	"hiyab-tutor/internal/domain"
	"hiyab-tutor/internal/server/controllers"
	"hiyab-tutor/internal/server/middlewares"
	"hiyab-tutor/internal/usecases"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupTestimonialRoutes(r *gin.Engine, db *gorm.DB) {
	// Allow reasonably large multipart forms (e.g., video uploads)
	r.MaxMultipartMemory = 128 << 20 // 128 MiB
	_ = db.AutoMigrate(&domain.Testimonial{}, &domain.TestimonialTranslation{})

	usecase := usecases.NewTestimonialService(db)
	controller := controllers.NewTestimonialControllerWithStorage(usecase)

	public := r.Group("/api/v1/testimonials")
	{
		public.GET("/", controller.GetAll)
		public.GET("/:id", controller.GetByID)
	}

	protected := r.Group("/api/v1/testimonials")
	protected.Use(middlewares.AuthMiddleware(), middlewares.IsAdminMiddleware())
	{
		protected.POST("/", controller.Create)
		protected.PUT("/:id", controller.Update)
		protected.DELETE("/:id", controller.Delete)
	}
}
