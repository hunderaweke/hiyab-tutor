package controllers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"hiyab-tutor/internal/database"
	"hiyab-tutor/internal/domain"
	"hiyab-tutor/internal/usecases"

	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func TestPartnerController_CRUD(t *testing.T) {
	gin.SetMode(gin.TestMode)
	db := database.TestDB()
	require.NotNil(t, db)
	require.NoError(t, db.AutoMigrate(&domain.Partner{}))

	uc := usecases.NewPartnerUsecase(db)
	ctrl := NewPartnerController(uc)

	r := gin.New()
	r.POST("/partners", ctrl.Create)
	r.GET("/partners", ctrl.GetAll)
	r.GET("/partners/:id", ctrl.GetByID)
	r.PUT("/partners/:id", ctrl.Update)
	r.DELETE("/partners/:id", ctrl.Delete)

	// Create
	payload := domain.CreatePartnerRequest{Name: "Acme", ImageURL: "http://img", WebsiteURL: "http://acme"}
	body, _ := json.Marshal(payload)
	req, _ := http.NewRequest(http.MethodPost, "/partners", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	require.Equal(t, http.StatusCreated, rr.Code)
	var created domain.PartnerResponse
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &created))
	require.NotZero(t, created.ID)

	// GetByID
	req, _ = http.NewRequest(http.MethodGet, "/partners/"+toStr(created.ID), nil)
	rr = httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	require.Equal(t, http.StatusOK, rr.Code)

	// Update
	upd := domain.UpdatePartnerRequest{Name: "New Name", ImageURL: "http://img", WebsiteURL: "http://acme"}
	body, _ = json.Marshal(upd)
	req, _ = http.NewRequest(http.MethodPut, "/partners/"+toStr(created.ID), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr = httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	require.Equal(t, http.StatusOK, rr.Code)

	// Delete
	req, _ = http.NewRequest(http.MethodDelete, "/partners/"+toStr(created.ID), nil)
	rr = httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	require.Equal(t, http.StatusNoContent, rr.Code)

	// GetAll
	req, _ = http.NewRequest(http.MethodGet, "/partners", nil)
	rr = httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	require.Equal(t, http.StatusOK, rr.Code)

	sqlDB, _ := db.DB()
	_ = sqlDB.Close()
}

func toStr(u uint) string { return fmt.Sprintf("%d", u) }
