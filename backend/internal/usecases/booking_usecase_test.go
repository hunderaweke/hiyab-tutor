package usecases

import (
	"hiyab-tutor/internal/domain"
	"testing"

	"github.com/stretchr/testify/suite"
)

type BookingUsecaseTestSuite struct {
	suite.Suite
	usecase domain.BookingUsecase
	repo    *mockBookingRepository
}

type mockBookingRepository struct {
	bookings map[uint]*domain.Booking
	lastID   uint
}

func (m *mockBookingRepository) Create(b *domain.Booking) (*domain.Booking, error) {
	m.lastID++
	b.ID = m.lastID
	m.bookings[b.ID] = b
	return b, nil
}
func (m *mockBookingRepository) GetAll(filter *domain.BookingFilter) ([]*domain.Booking, error) {
	var result []*domain.Booking
	for _, b := range m.bookings {
		result = append(result, b)
	}
	return result, nil
}
func (m *mockBookingRepository) GetByID(id uint) (*domain.Booking, error) {
	b, ok := m.bookings[id]
	if !ok {
		return nil, domain.ErrNotFound
	}
	return b, nil
}
func (m *mockBookingRepository) Update(id uint, b *domain.Booking) (*domain.Booking, error) {
	if _, ok := m.bookings[id]; !ok {
		return nil, domain.ErrNotFound
	}
	b.ID = id
	m.bookings[id] = b
	return b, nil
}
func (m *mockBookingRepository) Delete(id uint) error {
	if _, ok := m.bookings[id]; !ok {
		return domain.ErrNotFound
	}
	delete(m.bookings, id)
	return nil
}

func TestBookingUsecase(t *testing.T) {
	suite.Run(t, new(BookingUsecaseTestSuite))
}

func (s *BookingUsecaseTestSuite) SetupTest() {
	s.repo = &mockBookingRepository{bookings: make(map[uint]*domain.Booking)}
	s.usecase = NewBookingUsecase(s.repo)
}

func (s *BookingUsecaseTestSuite) TestCreateAndGetByID() {
	b := &domain.Booking{FullName: "Test"}
	created, err := s.usecase.Create(b)
	s.NoError(err)
	s.NotNil(created)
	fetched, err := s.usecase.GetByID(created.ID)
	s.NoError(err)
	s.Equal(created.FullName, fetched.FullName)
}

func (s *BookingUsecaseTestSuite) TestGetAll() {
	b1 := &domain.Booking{FullName: "A"}
	b2 := &domain.Booking{FullName: "B"}
	s.usecase.Create(b1)
	s.usecase.Create(b2)
	all, err := s.usecase.GetAll(&domain.BookingFilter{})
	s.NoError(err)
	s.Len(all, 2)
}

func (s *BookingUsecaseTestSuite) TestUpdate() {
	b := &domain.Booking{FullName: "Old"}
	created, _ := s.usecase.Create(b)
	updated := &domain.Booking{FullName: "New"}
	result, err := s.usecase.Update(created.ID, updated)
	s.NoError(err)
	s.Equal("New", result.FullName)
}

func (s *BookingUsecaseTestSuite) TestDelete() {
	b := &domain.Booking{FullName: "ToDelete"}
	created, _ := s.usecase.Create(b)
	err := s.usecase.Delete(created.ID)
	s.NoError(err)
	fetched, err := s.usecase.GetByID(created.ID)
	s.Error(err)
	s.Nil(fetched)
}

func (s *BookingUsecaseTestSuite) TestAssign() {
	b := &domain.Booking{FullName: "AssignMe", Assigned: false}
	created, _ := s.usecase.Create(b)
	err := s.usecase.Assign(created.ID)
	s.NoError(err)
	fetched, _ := s.usecase.GetByID(created.ID)
	s.True(fetched.Assigned)
}
