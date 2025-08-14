package server

import (
	"hiyab-tutor/docs"
	"hiyab-tutor/internal/config"
	"hiyab-tutor/internal/server/routes"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

func (s *Server) RegisterRoutes() http.Handler {
	c, err := config.LoadConfig()
	if err != nil {
		panic("Failed to load config")
	}
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{c.WebAppUrl}, // Add your frontend URL
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"},
		AllowHeaders:     []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true, // Enable cookies/auth
	}))

	r.GET("/", s.HelloWorldHandler)

	r.GET("/health", s.healthHandler)
	r.Static("/api/v1/uploads/", "./uploads")
	docs.SwaggerInfo.BasePath = "/api/v1"
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler, ginSwagger.DefaultModelsExpandDepth(10)))
	// Admin routes
	routes.SetupAdminRoutes(r, s.DB.Gorm())
	// Other services routes
	routes.SetupOtherServiceRoutes(r, s.DB.Gorm())
	// Partners routes
	routes.SetupPartnerRoutes(r, s.DB.Gorm())
	// Testimonials routes
	routes.SetupTestimonialRoutes(r, s.DB.Gorm())
	// Booking routes
	routes.SetupBookingRoutes(r, s.DB.Gorm())

	return r
}

func (s *Server) HelloWorldHandler(c *gin.Context) {
	resp := make(map[string]string)
	resp["message"] = "Hello World"

	c.JSON(http.StatusOK, resp)
}

func (s *Server) healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, s.DB.Health())
}
