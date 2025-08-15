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
	if t == nil || t.FullName == "" {
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
	defer os.Remove(tmpFile.Name())
	_, err = tmpFile.Write([]byte("dummy pdf content"))
	s.Require().NoError(err)
	tmpFile.Close()

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("full_name", "Test Tutor")
	writer.WriteField("education_level", "Degree")
	writer.WriteField("email", "test@example.com")
	docField, err := writer.CreateFormFile("document", "testdoc.pdf")
	s.Require().NoError(err)
	docFile, err := os.Open(tmpFile.Name())
	s.Require().NoError(err)
	io.Copy(docField, docFile)
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
	s.Equal("Test Tutor", resp.FullName)
	s.Contains(resp.Document, "uploads/documents/")
}

func (s *TutorControllerTestSuite) TestGetAllTutors() {
	t1 := &domain.Tutor{FullName: "Alice", EducationLevel: "Degree", Email: "alice@example.com"}
	t2 := &domain.Tutor{FullName: "Bob", EducationLevel: "Diploma", Email: "bob@example.com"}
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
	t := &domain.Tutor{FullName: "Test Tutor", EducationLevel: "Degree", Email: "test@example.com"}
	created, _ := s.usecase.Create(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/tutors/"+strconv.Itoa(int(created.ID)), nil)
	s.router.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var resp domain.Tutor
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.Equal(created.FullName, resp.FullName)
}

func (s *TutorControllerTestSuite) TestUpdateTutor() {
	t := &domain.Tutor{FullName: "Old Name", EducationLevel: "Diploma", Email: "old@example.com"}
	created, _ := s.usecase.Create(t)
	updated := domain.Tutor{FullName: "New Name", EducationLevel: "Degree", Email: "new@example.com"}
	body, _ := json.Marshal(updated)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/tutors/"+strconv.Itoa(int(created.ID)), bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	s.router.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var resp domain.Tutor
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.Equal("New Name", resp.FullName)
}

func (s *TutorControllerTestSuite) TestDeleteTutor() {
	t := &domain.Tutor{FullName: "ToDelete", EducationLevel: "Degree", Email: "delete@example.com"}
	created, _ := s.usecase.Create(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("DELETE", "/tutors/"+strconv.Itoa(int(created.ID)), nil)
	s.router.ServeHTTP(w, req)
	s.Equal(http.StatusNoContent, w.Code)
}

func (s *TutorControllerTestSuite) TestVerifyTutor() {
	t := &domain.Tutor{FullName: "VerifyMe", EducationLevel: "Degree", Verified: false, Email: "verify@example.com"}
	created, _ := s.usecase.Create(t)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("PUT", "/tutors/"+strconv.Itoa(int(created.ID))+"/verify", nil)
	s.router.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var resp domain.Tutor
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.True(resp.Verified)
}
