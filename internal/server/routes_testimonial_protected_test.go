package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"hiyab-tutor/internal/database"
	"hiyab-tutor/internal/domain"
	serverRoutes "hiyab-tutor/internal/server/routes"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/require"
)

func writeTestConfigFile(t *testing.T, username, password, jwtSecret string) func() {
	t.Helper()
	content := []byte("JWT_SECRET: \"" + jwtSecret + "\"\nADMIN_USERNAME: \"" + username + "\"\nADMIN_PASSWORD: \"" + password + "\"\nWEB_APP_URL: \"http://localhost:3000\"\n")
	if err := os.WriteFile("config.yaml", content, 0644); err != nil {
		t.Fatalf("failed to write config.yaml: %v", err)
	}
	return func() { _ = os.Remove("config.yaml") }
}

func TestTestimonialRoutes_ProtectedCRUD(t *testing.T) {
	gin.SetMode(gin.TestMode)

	cleanup := writeTestConfigFile(t, "superadmin", "superpass123", "test-secret")
	defer cleanup()

	db := database.TestDB()
	require.NotNil(t, db)
	require.NoError(t, db.AutoMigrate(&domain.Testimonial{}, &domain.TestimonialTranslation{}))

	r := gin.New()
	// Register both admin and testimonial routes to obtain token and call protected endpoints
	serverRoutes.SetupAdminRoutes(r, db)
	serverRoutes.SetupTestimonialRoutes(r, db)

	// Login to get access token
	creds := map[string]string{"username": "superadmin", "password": "superpass123"}
	body, _ := json.Marshal(creds)
	req, _ := http.NewRequest(http.MethodPost, "/api/v1/admin/login", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	require.Equal(t, http.StatusOK, rr.Code)
	var loginResp struct {
		AccessToken string `json:"access_token"`
	}
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &loginResp))
	require.NotEmpty(t, loginResp.AccessToken)

	authReq := func(method, path string, payload any) *httptest.ResponseRecorder {
		var body bytes.Buffer
		mw := multipart.NewWriter(&body)
		_ = mw.WriteField("name", "John Doe")
		_ = mw.WriteField("role", "Student")
		_ = mw.WriteField("thumbnail", "http://thumb")
		_ = mw.WriteField("languages", `[{"language_code":"en","name":"Great!"}]`)
		fw, _ := mw.CreateFormFile("video", "v.mp4")
		_, _ = fw.Write([]byte("vid"))
		_ = mw.Close()
		req, _ := http.NewRequest(method, path, &body)
		req.Header.Set("Content-Type", mw.FormDataContentType())
		req.Header.Set("Authorization", "Bearer "+loginResp.AccessToken)
		rr := httptest.NewRecorder()
		r.ServeHTTP(rr, req)
		return rr
	}

	// Create (unauthorized should fail)
	var unauthorizedBody bytes.Buffer
	umw := multipart.NewWriter(&unauthorizedBody)
	_ = umw.WriteField("name", "John Doe")
	_ = umw.WriteField("role", "Student")
	_ = umw.WriteField("thumbnail", "http://thumb")
	_ = umw.WriteField("languages", `[{"language_code":"en","name":"Great!"}]`)
	ufw, _ := umw.CreateFormFile("video", "v.mp4")
	_, _ = ufw.Write([]byte("vid"))
	_ = umw.Close()
	req, _ = http.NewRequest(http.MethodPost, "/api/v1/testimonials/", &unauthorizedBody)
	req.Header.Set("Content-Type", umw.FormDataContentType())
	rr = httptest.NewRecorder()
	r.ServeHTTP(rr, req)
	require.Equal(t, http.StatusUnauthorized, rr.Code)

	// Create (authorized)
	rr = authReq(http.MethodPost, "/api/v1/testimonials/", nil)
	require.Equal(t, http.StatusCreated, rr.Code)
	var created domain.TestimonialResponse
	require.NoError(t, json.Unmarshal(rr.Body.Bytes(), &created))
	require.NotZero(t, created.ID)

	// Update (authorized)
	rr = authReq(http.MethodPut, "/api/v1/testimonials/"+fmt.Sprintf("%d", created.ID), nil)
	require.Equal(t, http.StatusOK, rr.Code)

	// Delete (authorized)
	rr = authReq(http.MethodDelete, "/api/v1/testimonials/"+fmt.Sprintf("%d", created.ID), nil)
	require.Equal(t, http.StatusNoContent, rr.Code)

	sqlDB, _ := db.DB()
	_ = sqlDB.Close()
	if err := os.Remove("uploads"); err != nil {
		t.Log(err)
	}
}
