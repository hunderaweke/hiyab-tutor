package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"testing"

	"net/http"
	"net/http/httptest"

	"hiyab-tutor/internal/database"
	serverRoutes "hiyab-tutor/internal/server/routes"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

type loginResponse struct {
	AccessToken  string      `json:"access_token"`
	RefreshToken string      `json:"refresh_token"`
	User         interface{} `json:"user"`
}

func writeTestConfig(t *testing.T, username, password, jwtSecret string) func() {
	t.Helper()
	content := []byte("JWT_SECRET: \"" + jwtSecret + "\"\nADMIN_USERNAME: \"" + username + "\"\nADMIN_PASSWORD: \"" + password + "\"\n")
	if err := os.WriteFile("config.yaml", content, 0644); err != nil {
		t.Fatalf("failed to write config.yaml: %v", err)
	}
	return func() { _ = os.Remove("config.yaml") }
}

func TestAdminRoutes_AuthorizedFlow(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// Prepare config for LoadConfig (JWT + admin seed)
	cleanup := writeTestConfig(t, "superadmin", "superpass123", "test-secret")
	defer cleanup()

	// DB
	db := database.TestDB()
	require.NotNil(t, db)

	// Router and routes
	r := gin.New()
	serverRoutes.SetupAdminRoutes(r, db)

	// Login
	creds := map[string]string{"username": "superadmin", "password": "superpass123"}
	body, _ := json.Marshal(creds)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/admin/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	require.Equal(t, http.StatusOK, rr.Code)

	var tokens loginResponse
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &tokens))
	require.NotEmpty(t, tokens.AccessToken)

	// Helper to auth request
	authReq := func(method, path string, body []byte) *httptest.ResponseRecorder {
		req, _ := http.NewRequest(method, path, bytes.NewReader(body))
		if body != nil {
			req.Header.Set("Content-Type", "application/json")
		}
		req.Header.Set("Authorization", "Bearer "+tokens.AccessToken)
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)
		return rr
	}

	// Get current admin
	rr = authReq(http.MethodGet, "/api/v1/admin/me", nil)
	require.Equal(t, http.StatusOK, rr.Code)

	// Create admin (superadmin-only)
	newAdmin := map[string]string{"username": "admin1", "password": "pass123456", "role": "admin", "name": "Admin One"}
	body, _ = json.Marshal(newAdmin)
	rr = authReq(http.MethodPost, "/api/v1/admin/", body)
	require.Equal(t, http.StatusCreated, rr.Code)

	// List admins
	rr = authReq(http.MethodGet, "/api/v1/admin/", nil)
	require.Equal(t, http.StatusOK, rr.Code)

	// Update admin
	// Find created admin ID by listing (simple parse just to get an ID)
	var list struct {
		Data []struct {
			ID       uint   `json:"id"`
			Username string `json:"username"`
		} `json:"data"`
	}
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &list))
	var createdID uint
	for _, a := range list.Data {
		if a.Username == "admin1" {
			createdID = a.ID
			break
		}
	}
	require.NotZero(t, createdID)

	upd := map[string]string{"name": "Admin Uno", "role": "admin"}
	body, _ = json.Marshal(upd)
	rr = authReq(http.MethodPut, "/api/v1/admin/"+itoa(createdID), body)
	require.Equal(t, http.StatusOK, rr.Code)

	// Reset password (superadmin-only)
	reset := map[string]string{"new_password": "anotherPass123"}
	body, _ = json.Marshal(reset)
	rr = authReq(http.MethodPut, "/api/v1/admin/"+itoa(createdID)+"/reset-password", body)
	require.Equal(t, http.StatusOK, rr.Code)

	// Delete admin (superadmin-only)
	rr = authReq(http.MethodDelete, "/api/v1/admin/"+itoa(createdID), nil)
	require.Equal(t, http.StatusNoContent, rr.Code)

	// Change password (current user)
	change := map[string]string{"old_password": "superpass123", "new_password": "superpass456"}
	body, _ = json.Marshal(change)
	rr = authReq(http.MethodPut, "/api/v1/admin/change-password", body)
	require.Equal(t, http.StatusOK, rr.Code)

	// Close DB
	sqlDB, _ := db.DB()
	_ = sqlDB.Close()
}

func itoa(u uint) string { return fmt.Sprintf("%d", u) }
