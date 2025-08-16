package controllers

import (
	"bytes"
	"encoding/json"
	"hiyab-tutor/internal/domain"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"strconv"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

type TutorControllerTestSuite struct {
	suite.Suite
	router  *gin.Engine
	usecase *mockTutorUsecase
	ctrl    *TutorController
}

type mockTutorUsecase struct {
	tutors map[uint]*domain.Tutor
	lastID uint
}

func (m *mockTutorUsecase) Create(t *domain.Tutor) (*domain.Tutor, error) {
	if t == nil || t.FirstName == "" {
		return nil, domain.ErrInvalidInput
	}
	m.lastID++
	t.ID = m.lastID
	m.tutors[t.ID] = t
	return t, nil
}
func (m *mockTutorUsecase) GetAll(filter *domain.TutorFilter) (domain.MultipleTutorResponse, error) {
	var result []domain.Tutor
	for _, t := range m.tutors {
		if filter != nil && filter.EducationLevel != "" && t.EducationLevel != filter.EducationLevel {
			continue
		}
		result = append(result, *t)
	}
	return domain.MultipleTutorResponse{Data: result, Pagination: domain.Pagination{Total: len(result)}}, nil
}
func (m *mockTutorUsecase) GetByID(id uint) (*domain.Tutor, error) {
	t, ok := m.tutors[id]
	if !ok {
		return nil, domain.ErrNotFound
	}
	return t, nil
}
func (m *mockTutorUsecase) Update(id uint, t *domain.Tutor) (*domain.Tutor, error) {
	if _, ok := m.tutors[id]; !ok {
		return nil, domain.ErrNotFound
	}
	t.ID = id
	m.tutors[id] = t
	return t, nil
}
func (m *mockTutorUsecase) Delete(id uint) error {
	if _, ok := m.tutors[id]; !ok {
		return domain.ErrNotFound
	}
	delete(m.tutors, id)
	return nil
}
func (m *mockTutorUsecase) Verify(id uint) error {
	t, ok := m.tutors[id]
	if !ok {
		return domain.ErrNotFound
	}
	t.Verified = true
	return nil
}

func TestTutorController(t *testing.T) {
	suite.Run(t, new(TutorControllerTestSuite))
}

func (s *TutorControllerTestSuite) SetupTest() {
	gin.SetMode(gin.TestMode)
	s.usecase = &mockTutorUsecase{tutors: make(map[uint]*domain.Tutor)}
	s.ctrl = NewTutorController(s.usecase)
	s.router = gin.New()
	s.router.POST("/tutors", s.ctrl.Create)
	s.router.GET("/tutors", s.ctrl.GetAll)
	s.router.GET("/tutors/:id", s.ctrl.GetByID)
	s.router.PUT("/tutors/:id", s.ctrl.Update)
	s.router.DELETE("/tutors/:id", s.ctrl.Delete)
	s.router.PUT("/tutors/:id/verify", s.ctrl.Verify)
}

func (s *TutorControllerTestSuite) TestCreateTutor() {
	// Create a temp file to simulate document upload
	tmpFile, err := os.CreateTemp("", "testdoc*.pdf")
	s.Require().NoError(err)
	tmpImage, err := os.CreateTemp("", "test*.png")
	s.Require().NoError(err)
	defer os.Remove(tmpFile.Name())
	_, err = tmpFile.Write([]byte("dummy pdf content"))
	s.Require().NoError(err)
	tmpFile.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("first_name", "Test Tutor")
	writer.WriteField("education_level", "Degree")
	writer.WriteField("email", "test@example.com")
	docField, err := writer.CreateFormFile("document", "testdoc.pdf")
	s.Require().NoError(err)
	imageField, err := writer.CreateFormFile("image", "image.png")
	s.Require().NoError(err)
	docFile, err := os.Open(tmpFile.Name())
	s.Require().NoError(err)
	imageFile, err := os.Open(tmpImage.Name())
	s.Require().NoError(err)
	io.Copy(docField, docFile)
	io.Copy(imageField, imageFile)
	docFile.Close()
	writer.Close()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/tutors", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	s.router.ServeHTTP(w, req)
	s.Equal(http.StatusCreated, w.Code)
	s.T().Log(w.Body.String())
	var resp domain.Tutor
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.Equal("Test Tutor", resp.FirstName)
	s.Contains(resp.Document, "uploads/documents/")
}

func (s *TutorControllerTestSuite) TestGetAllTutors() {
	t1 := &domain.Tutor{FirstName: "Alice", EducationLevel: "Degree", Email: "alice@example.com"}
	t2 := &domain.Tutor{FirstName: "Bob", EducationLevel: "Diploma", Email: "bob@example.com"}
	s.usecase.Create(t1)
	s.usecase.Create(t2)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/tutors", nil)
	s.router.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var resp domain.MultipleTutorResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.Len(resp.Data, 2)
}

func (s *TutorControllerTestSuite) TestGetTutorByID() {
	t := &domain.Tutor{FirstName: "Test Tutor", EducationLevel: "Degree", Email: "test@example.com"}
	created, _ := s.usecase.Create(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/tutors/"+strconv.Itoa(int(created.ID)), nil)
	s.router.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var resp domain.Tutor
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.Equal(created.FirstName, resp.FirstName)
}

func (s *TutorControllerTestSuite) TestUpdateTutor() {
	t := &domain.Tutor{FirstName: "Old Name", EducationLevel: "Diploma", Email: "old@example.com"}
	created, _ := s.usecase.Create(t)
	// send payload matching UpdateTutorRequest (uses full_name JSON key)
	updated := map[string]interface{}{"full_name": "New Name", "education_level": "Degree", "email": "new@example.com"}
	body, _ := json.Marshal(updated)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/tutors/"+strconv.Itoa(int(created.ID)), bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	s.router.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var resp domain.Tutor
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.Equal("New Name", resp.FirstName)
}

func (s *TutorControllerTestSuite) TestDeleteTutor() {
	t := &domain.Tutor{FirstName: "ToDelete", EducationLevel: "Degree", Email: "delete@example.com"}
	created, _ := s.usecase.Create(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("DELETE", "/tutors/"+strconv.Itoa(int(created.ID)), nil)
	s.router.ServeHTTP(w, req)
	s.Equal(http.StatusNoContent, w.Code)
}

func (s *TutorControllerTestSuite) TestVerifyTutor() {
	t := &domain.Tutor{FirstName: "VerifyMe", EducationLevel: "Degree", Verified: false, Email: "verify@example.com"}
	created, _ := s.usecase.Create(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/tutors/"+strconv.Itoa(int(created.ID))+"/verify", nil)
	s.router.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var resp domain.Tutor
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.True(resp.Verified)
}
