package server

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"hiyab-tutor/internal/database"
	"hiyab-tutor/internal/domain"
	serverRoutes "hiyab-tutor/internal/server/routes"

	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestTestimonialRoutes_GetAllAndGetByID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db := database.TestDB()
	require.NotNil(t, db)
	require.NoError(t, db.AutoMigrate(&domain.Testimonial{}, &domain.TestimonialTranslation{}))

	r := gin.New()
	serverRoutes.SetupTestimonialRoutes(r, db)

	// Seed directly via DB to avoid auth in this public-routes test
	seed := &domain.Testimonial{
		Name: "John Doe", Role: "Student", Video: "http://video", Thumbnail: "http://thumb",
		Translations: []domain.TestimonialTranslation{{LanguageCode: "en", Text: "Great!"}},
	}
	res := db.Create(seed)
	require.NoError(t, res.Error)

	// GET /api/v1/testimonials/
	t.Run("GetAll", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/testimonials/", nil)
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)
		require.Equal(t, http.StatusOK, rr.Code)

		var list domain.MultipleTestimonialsResponse
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &list))
		require.GreaterOrEqual(t, len(list.Data), 1)
		require.Equal(t, seed.Name, list.Data[0].Name)
	})

	// GET /api/v1/testimonials/:id
	t.Run("GetByID", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/testimonials/%d", seed.ID), nil)
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)
		require.Equal(t, http.StatusOK, rr.Code)

		var got domain.TestimonialResponse
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &got))
		require.Equal(t, seed.ID, got.ID)
		require.Equal(t, seed.Name, got.Name)
	})

	// Close DB
	sqlDB, _ := db.DB()
	_ = sqlDB.Close()
}
