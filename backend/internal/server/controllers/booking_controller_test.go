package controllers

import (
	"bytes"
	"encoding/json"
	"hiyab-tutor/internal/domain"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/suite"
)

type BookingControllerTestSuite struct {
	suite.Suite
	controller *BookingController
	usecase    *mockBookingUsecase
	engine     *gin.Engine
}

type mockBookingUsecase struct {
	bookings map[uint]*domain.Booking
	lastID   uint
}

func (m *mockBookingUsecase) Create(b *domain.Booking) (*domain.Booking, error) {
	m.lastID++
	b.ID = m.lastID
	m.bookings[b.ID] = b
	return b, nil
}
func (m *mockBookingUsecase) GetAll(filter *domain.BookingFilter) (domain.MultipleBookingResponse, error) {
	var result []domain.Booking
	for _, b := range m.bookings {
		result = append(result, *b)
	}
	resp := domain.MultipleBookingResponse{
		Data: result,
		Pagination: domain.Pagination{
			Page:   1,
			Limit:  len(result),
			Offset: 0,
			Total:  len(result),
		},
	}
	return resp, nil
}
func (m *mockBookingUsecase) GetByID(id uint) (*domain.Booking, error) {
	b, ok := m.bookings[id]
	if !ok {
		return nil, domain.ErrNotFound
	}
	return b, nil
}
func (m *mockBookingUsecase) Update(id uint, b *domain.Booking) (*domain.Booking, error) {
	if _, ok := m.bookings[id]; !ok {
		return nil, domain.ErrNotFound
	}
	b.ID = id
	m.bookings[id] = b
	return b, nil
}
func (m *mockBookingUsecase) Delete(id uint) error {
	if _, ok := m.bookings[id]; !ok {
		return domain.ErrNotFound
	}
	delete(m.bookings, id)
	return nil
}
func (m *mockBookingUsecase) Assign(id uint) error {
	b, ok := m.bookings[id]
	if !ok {
		return domain.ErrNotFound
	}
	b.Assigned = true
	return nil
}

func TestBookingController(t *testing.T) {
	suite.Run(t, new(BookingControllerTestSuite))
}

func (s *BookingControllerTestSuite) SetupTest() {
	gin.SetMode(gin.TestMode)
	s.usecase = &mockBookingUsecase{bookings: make(map[uint]*domain.Booking)}
	s.controller = NewBookingController(s.usecase)
	s.engine = gin.Default()
	s.engine.POST("/bookings", s.controller.Create)
	s.engine.GET("/bookings", s.controller.GetAll)
	s.engine.GET("/bookings/:id", s.controller.GetByID)
	s.engine.PUT("/bookings/:id/assign", s.controller.Assign)
}

func (s *BookingControllerTestSuite) TestCreateBooking() {
	b := &domain.Booking{FirstName: "Test User"}
	body, _ := json.Marshal(b)
	req := httptest.NewRequest("POST", "/bookings", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	s.engine.ServeHTTP(w, req)
	s.Equal(http.StatusCreated, w.Code)
	var resp domain.Booking
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.Equal("Test User", resp.FirstName)
}

func (s *BookingControllerTestSuite) TestGetAllBookings() {
	b1 := &domain.Booking{FirstName: "A"}
	b2 := &domain.Booking{FirstName: "B"}
	s.usecase.Create(b1)
	s.usecase.Create(b2)
	req := httptest.NewRequest("GET", "/bookings", nil)
	w := httptest.NewRecorder()
	s.engine.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var resp domain.MultipleBookingResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.Len(resp.Data, 2)
}

func (s *BookingControllerTestSuite) TestGetBookingByID() {
	b := &domain.Booking{FirstName: "FindMe"}
	created, _ := s.usecase.Create(b)
	req := httptest.NewRequest("GET", "/bookings/1", nil)
	w := httptest.NewRecorder()
	s.engine.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var resp domain.Booking
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.Equal(created.FirstName, resp.FirstName)
}

func (s *BookingControllerTestSuite) TestAssignBooking() {
	b := &domain.Booking{FirstName: "AssignMe", Assigned: false}
	s.usecase.Create(b)
	req := httptest.NewRequest("PUT", "/bookings/1/assign", nil)
	w := httptest.NewRecorder()
	s.engine.ServeHTTP(w, req)
	s.Equal(http.StatusOK, w.Code)
	var resp domain.Booking
	json.Unmarshal(w.Body.Bytes(), &resp)
	s.True(resp.Assigned)
}

func (s *BookingControllerTestSuite) TestGetBookingNotFound() {
	req := httptest.NewRequest("GET", "/bookings/999", nil)
	w := httptest.NewRecorder()
	s.engine.ServeHTTP(w, req)
	s.Equal(http.StatusNotFound, w.Code)
}

func (s *BookingControllerTestSuite) TestAssignBookingNotFound() {
	req := httptest.NewRequest("PUT", "/bookings/999/assign", nil)
	w := httptest.NewRecorder()
	s.engine.ServeHTTP(w, req)
	s.Equal(http.StatusNotFound, w.Code)
}
