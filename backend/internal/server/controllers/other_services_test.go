package controllers

import (
	"bytes"
	"hiyab-tutor/internal/domain"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

type TestOtherServicesSuite struct {
	suite.Suite
}

func TestOtherServicesController(t *testing.T) {
	suite.Run(t, new(TestOtherServicesSuite))
}

func (s *TestOtherServicesSuite) TestCreate() {
	mockUsecase := domain.OtherServiceUsecaseMock{
		CreateServiceFunc: func(service *domain.OtherService) (*domain.OtherService, error) {
			return service, nil
		},
	}
	controller := NewOtherServiceController(&mockUsecase)
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("website_url", "https://somename.com")
	image, _ := writer.CreateFormFile("image", "image.png")
	image.Write([]byte("dummy data"))
	writer.Close()
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/other-services", controller.Create)

	req := httptest.NewRequest("POST", "/other-services", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)
	s.Equal(http.StatusCreated, w.Code)
}
