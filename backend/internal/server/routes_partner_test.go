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

func TestPartnerRoutes_GetAllAndGetByID(t *testing.T) {
	gin.SetMode(gin.TestMode)

	db := database.TestDB()
	require.NotNil(t, db)
	require.NoError(t, db.AutoMigrate(&domain.Partner{}))

	// Seed a partner
	seed := &domain.Partner{Name: "Acme", ImageURL: "http://img", WebsiteURL: "http://acme"}
	res := db.Create(seed)
	require.NoError(t, res.Error)

	r := gin.New()
	serverRoutes.SetupPartnerRoutes(r, db)

	// GET /api/v1/partners/
	t.Run("GetAll", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, "/api/v1/partners/", nil)
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)
		require.Equal(t, http.StatusOK, rr.Code)

		var list domain.MultiplePartners
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &list))
		require.GreaterOrEqual(t, len(list.Partners), 1)
		require.Equal(t, seed.Name, list.Partners[0].Name)
	})

	// GET /api/v1/partners/:id
	t.Run("GetByID", func(t *testing.T) {
		req, _ := http.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/partners/%d", seed.ID), nil)
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)
		require.Equal(t, http.StatusOK, rr.Code)

		var got domain.Partner
		require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &got))
		require.Equal(t, seed.ID, got.ID)
		require.Equal(t, seed.Name, got.Name)
	})

	// Close DB
	sqlDB, _ := db.DB()
	_ = sqlDB.Close()
}
