package controllers

import (
	"bytes"
	"encoding/json"
	"hiyab-tutor/internal/domain"
	"log"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

func TestTestimonialController(t *testing.T) {
	suite.Run(t, new(TestTestimonialControllerSuite))
}

type TestTestimonialControllerSuite struct {
	suite.Suite
	c           *TestimonialController
	mockUsecase domain.TestimonialUsecase
}

func (s *TestTestimonialControllerSuite) TearDownTestSuite() {
	if err := os.Remove("uploads"); err != nil {
		log.Fatal(err)
	}
}

func (s *TestTestimonialControllerSuite) TestCreate() {
	testimonial := &domain.Testimonial{
		Name: "Test Name",
		Role: "Test Role",
	}
	s.mockUsecase = &domain.TestimonialUsecaseMock{
		CreateTestimonialFunc: func(testimonial *domain.Testimonial) (*domain.Testimonial, error) {
			return testimonial, nil
		},
	} // Assuming you have a mock usecase
	s.c = NewTestimonialController(s.mockUsecase)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/testimonials", s.c.Create)
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	_ = writer.WriteField("name", testimonial.Name)
	_ = writer.WriteField("role", testimonial.Role)

	videoPart, _ := writer.CreateFormFile("video", "test.mp4")
	videoContent := []byte("dummy video content")
	videoPart.Write(videoContent)

	// Add thumbnail file (optional)
	thumbPart, _ := writer.CreateFormFile("thumbnail", "thumb.jpg")
	thumbContent := []byte("dummy thumbnail content")
	thumbPart.Write(thumbContent)

	writer.Close()

	req := httptest.NewRequest("POST", "/testimonials", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)
	var createdTestimonial *domain.Testimonial
	err := json.Unmarshal(w.Body.Bytes(), &createdTestimonial)
	s.NoError(err)
	s.Equal(http.StatusCreated, w.Code)
	s.Equal(testimonial.Name, createdTestimonial.Name)
	s.Equal(testimonial.Role, createdTestimonial.Role)
	s.NotEmpty(createdTestimonial.Video)
	s.NotEmpty(createdTestimonial.Thumbnail)
}

func (s *TestTestimonialControllerSuite) TestGetAll() {
	now := time.Now()
	testimonials := []*domain.Testimonial{
		{Model: domain.Model{ID: 1, CreatedAt: now, UpdatedAt: now}, Name: "Testimonial 1", Role: "Role 1", Video: "http://video1", Thumbnail: "http://thumb1"},
		{Model: domain.Model{ID: 2, CreatedAt: now, UpdatedAt: now}, Name: "Testimonial 2", Role: "Role 2", Video: "http://video2", Thumbnail: "http://thumb2"},
	}
	s.mockUsecase = &domain.TestimonialUsecaseMock{
		GetAllTestimonialsFunc: func(filter *domain.TestimonialFilter) (*domain.MultipleTestimonialResponse, error) {
			return &domain.MultipleTestimonialResponse{
				Testimonials: testimonials,
			}, nil
		},
	}
	s.c = NewTestimonialController(s.mockUsecase)
	expectedResponse := &domain.MultipleTestimonialResponse{
		Testimonials: testimonials,
	}
	expectedJSON, _ := json.Marshal(expectedResponse)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/testimonials", s.c.GetAll)
	req := httptest.NewRequest("GET", "/testimonials", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	s.Equal(http.StatusOK, w.Code)
	s.JSONEq(string(expectedJSON), w.Body.String())
}
func (s *TestTestimonialControllerSuite) TestGetByID() {
	testimonial := &domain.Testimonial{
		Model: domain.Model{ID: 1},
		Name:  "Testimonial Name",
		Role:  "Testimonial Role",
	}
	testimonialJSON, _ := json.Marshal(testimonial)
	s.mockUsecase = &domain.TestimonialUsecaseMock{
		GetTestimonialByIDFunc: func(id uint) (*domain.Testimonial, error) {
			return testimonial, nil
		},
	}
	s.c = NewTestimonialController(s.mockUsecase)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/testimonials/:id", s.c.GetByID)
	req := httptest.NewRequest("GET", "/testimonials/1", nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	var response *domain.Testimonial
	err := json.Unmarshal(w.Body.Bytes(), &response)
	s.NoError(err)
	s.Equal(http.StatusOK, w.Code)
	s.JSONEq(string(testimonialJSON), w.Body.String())
}

func (s *TestTestimonialControllerSuite) TestUpdate() {
	updateRequest := &domain.UpdateTestimonialRequest{
		Name: "Updated Name",
		Role: "updated Role",
	}
	s.mockUsecase = &domain.TestimonialUsecaseMock{
		UpdateTestimonialFunc: func(testimonial *domain.Testimonial) (*domain.Testimonial, error) {
			return testimonial, nil
		},
		GetTestimonialByIDFunc: func(id uint) (*domain.Testimonial, error) {
			return &domain.Testimonial{Name: "Name", Role: "Role"}, nil
		},
	}
	s.c = NewTestimonialController(s.mockUsecase)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.PUT("/testimonials/:id", s.c.Update)
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	writer.WriteField("name", updateRequest.Name)
	writer.WriteField("role", updateRequest.Role)
	videoPart, _ := writer.CreateFormFile("video", "video.mp4")
	videoContent := []byte("dummy video")
	videoPart.Write(videoContent)
	thumbnailPart, _ := writer.CreateFormFile("thumbnail", "thumb.jpg")
	thumbnailPart.Write([]byte("dummy thumbnail"))
	writer.Close()
	req := httptest.NewRequest("PUT", "/testimonials/1", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var updatedTestimonial domain.Testimonial
	json.Unmarshal(w.Body.Bytes(), &updatedTestimonial)
	s.Equal(updateRequest.Name, updatedTestimonial.Name)
	s.Equal(updateRequest.Role, updatedTestimonial.Role)
	os.Remove(updatedTestimonial.Video)
	os.Remove(updatedTestimonial.Thumbnail)
}

func (s *TestTestimonialControllerSuite) TestDelete() {
	strId := "1"
	s.mockUsecase = &domain.TestimonialUsecaseMock{
		DeleteTestimonialFunc: func(id uint) error {
			return nil
		},
	}
	s.c = NewTestimonialController(s.mockUsecase)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.DELETE("/testimonials/:id", s.c.Delete)
	req := httptest.NewRequest("DELETE", "/testimonials/"+strId, nil)
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	s.Equal(http.StatusNoContent, w.Code)
}
func (s *TestTestimonialControllerSuite) TestAddTranslation() {
	testimonial := &domain.Testimonial{
		Model: domain.Model{ID: 1},
		Name:  "Testimonial Name",
		Role:  "Testimonial Role",
	}
	testimonialJSON, _ := json.Marshal(testimonial)
	s.mockUsecase = &domain.TestimonialUsecaseMock{
		AddTranslationFunc: func(testimonialID uint, translation *domain.TestimonialTranslation) (*domain.Testimonial, error) {
			testimonial.Translations = append(testimonial.Translations, *translation)
			return testimonial, nil
		},
	}
	s.c = NewTestimonialController(s.mockUsecase)
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/testimonials/:id/translations", s.c.AddTranslation)
	req := httptest.NewRequest("POST", "/testimonials/1/translations", bytes.NewBuffer(testimonialJSON))
	w := httptest.NewRecorder()

	router.ServeHTTP(w, req)

	s.Equal(http.StatusOK, w.Code)
}
