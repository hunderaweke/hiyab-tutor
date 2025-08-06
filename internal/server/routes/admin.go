package routes

import (
	"hiyab-tutor/internal/config"
	"hiyab-tutor/internal/domain"
	"hiyab-tutor/internal/server/controllers"
	"hiyab-tutor/internal/server/middlewares"
	"hiyab-tutor/internal/usecases"
	"log"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func SetupAdminRoutes(r *gin.Engine, db *gorm.DB) {
	db.AutoMigrate(&domain.Admin{})
	adminUsecase := usecases.NewAdminUsecase(db)
	adminController := controllers.NewAdminController(adminUsecase)
	c, err := config.LoadConfig()
	if err != nil {
		panic("Failed to load config")
	}
	superAdmin, err := adminUsecase.GetByUsername(c.AdminUsername)
	if err != nil && err != gorm.ErrRecordNotFound {
		log.Fatal(err)
	}
	if superAdmin == nil {
		superAdmin = &domain.Admin{
			Username: c.AdminUsername,
			Password: c.AdminPassword,
			Role:     "superadmin",
			Name:     "Super Admin",
		}
		_, err = adminUsecase.Create(superAdmin)
		if err != nil {
			panic("Failed to create super admin")
		}
	}
	adminGroup := r.Group("/api/v1/admin")
	adminGroup.POST("/login", adminController.Login)
	adminGroup.Use(middlewares.AuthMiddleware(), middlewares.IsAdminMiddleware())
	{
		adminGroup.POST("/", middlewares.IsSuperAdminMiddleware(), adminController.Create)
		adminGroup.GET("/:id", adminController.GetByID)
		adminGroup.GET("/", adminController.GetAll)
		adminGroup.PUT("/:id", adminController.Update)
		adminGroup.DELETE("/:id", middlewares.IsSuperAdminMiddleware(), adminController.Delete)
		adminGroup.PUT("/:id/reset-password", middlewares.IsSuperAdminMiddleware(), adminController.ResetPassword)
		adminGroup.PUT("/change-password", adminController.ChangePassword)
		adminGroup.GET("/me", adminController.GetCurrentAdmin)
	}
}
