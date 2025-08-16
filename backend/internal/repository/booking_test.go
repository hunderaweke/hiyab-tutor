package repository

import (
	"hiyab-tutor/internal/database"
	"hiyab-tutor/internal/domain"
	"testing"

	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

type BookingRepoTestSuite struct {
	suite.Suite
	bookingRepo domain.BookingRepository
	db          *gorm.DB
}

func TestBookingRepository(t *testing.T) {
	suite.Run(t, new(BookingRepoTestSuite))
}

func (s *BookingRepoTestSuite) SetupSuite() {
	db := database.TestDB()
	if db == nil {
		s.T().Fatal("creating test database issue")
	}
	s.db = db
	s.db.Debug()
	s.Assert().NoError(s.db.AutoMigrate(&domain.Booking{}))
}

func (s *BookingRepoTestSuite) SetupTest() {
	s.bookingRepo = NewBookingRepository(s.db)
}
func (s *BookingRepoTestSuite) TearDownTest() {
	s.db.Exec("DELETE FROM bookings")
}
func (s *BookingRepoTestSuite) TearDownSuite() {
	db, _ := s.db.DB()
	if err := db.Close(); err != nil {
		s.T().Log("failed to close the database connection")
	}
}
func (s *BookingRepoTestSuite) TestCreate() {
	b := &domain.Booking{
		FirstName:   "Hundera",
		LastName:    "Awoke",
		Grade:       10,
		Address:     "Adama,Bole",
		Gender:      "Male",
		PhoneNumber: "+251987654321",
		DayPerWeek:  3,
		HrPerDay:    2,
		Assigned:    false,
	}
	createdBooking, err := s.bookingRepo.Create(b)
	s.NoError(err)
	s.NotNil(createdBooking)
	s.Equal(createdBooking.ID, uint(1))
	s.Equal(createdBooking.FirstName, b.FirstName)
	s.Equal(createdBooking.Grade, b.Grade)
	s.Equal(createdBooking.Address, b.Address)
	s.Equal(createdBooking.Gender, b.Gender)
	s.Equal(createdBooking.PhoneNumber, b.PhoneNumber)
	s.Equal(createdBooking.DayPerWeek, b.DayPerWeek)
	s.Equal(createdBooking.HrPerDay, b.HrPerDay)
	s.Equal(createdBooking.Assigned, b.Assigned)
}
func (s *BookingRepoTestSuite) TestGetByID() {
	b := &domain.Booking{
		FirstName:   "Hundera Awoke",
		Grade:       10,
		Address:     "Adama,Bole",
		Gender:      "Male",
		PhoneNumber: "+251987654321",
		DayPerWeek:  3,
		HrPerDay:    2,
		Assigned:    false,
	}
	created, err := s.bookingRepo.Create(b)
	s.NoError(err)
	booking, err := s.bookingRepo.GetByID(created.ID)
	s.NoError(err)
	s.NotNil(booking)
	s.Equal(booking.FirstName, b.FirstName)
	s.Equal(booking.Grade, b.Grade)
	s.Equal(booking.Address, b.Address)
	s.Equal(booking.Gender, b.Gender)
	s.Equal(booking.PhoneNumber, b.PhoneNumber)
	s.Equal(booking.DayPerWeek, b.DayPerWeek)
	s.Equal(booking.HrPerDay, b.HrPerDay)
	s.Equal(booking.Assigned, b.Assigned)
}

func (s *BookingRepoTestSuite) TestGetAll_NoFilter() {
	// Insert 15 bookings
	for i := 1; i <= 15; i++ {
		b := &domain.Booking{
			FirstName:   "User" + string(rune(i)),
			Grade:       i,
			Address:     "Address" + string(rune(i)),
			Gender:      "Male",
			PhoneNumber: "1234567890",
			DayPerWeek:  i % 7,
			HrPerDay:    i % 5,
			Assigned:    i%2 == 0,
		}
		_, err := s.bookingRepo.Create(b)
		s.NoError(err)
	}
	// Should return only 10 due to pagination
	resp, err := s.bookingRepo.GetAll(&domain.BookingFilter{})
	s.NoError(err)
	s.Len(resp.Data, 10)
}

func (s *BookingRepoTestSuite) TestGetAll_FilterByGender() {
	b1 := &domain.Booking{FirstName: "A", Gender: "Male"}
	b2 := &domain.Booking{FirstName: "B", Gender: "Female"}
	_, err := s.bookingRepo.Create(b1)
	s.NoError(err)
	_, err = s.bookingRepo.Create(b2)
	s.NoError(err)
	resp, err := s.bookingRepo.GetAll(&domain.BookingFilter{Gender: "Female"})
	s.NoError(err)
	s.Len(resp.Data, 1)
	s.Equal("Female", resp.Data[0].Gender)
}

func (s *BookingRepoTestSuite) TestGetAll_FilterByGradeRange() {
	for i := 1; i <= 5; i++ {
		b := &domain.Booking{FirstName: "User", Grade: i}
		_, err := s.bookingRepo.Create(b)
		s.NoError(err)
	}
	resp, err := s.bookingRepo.GetAll(&domain.BookingFilter{MinGrade: 2, MaxGrade: 4})
	s.NoError(err)
	for _, b := range resp.Data {
		s.True(b.Grade >= 2 && b.Grade <= 4)
	}
}

func (s *BookingRepoTestSuite) TestGetAll_QuerySearch() {
	b1 := &domain.Booking{FirstName: "Alice", Address: "Wonderland", PhoneNumber: "111"}
	b2 := &domain.Booking{FirstName: "Bob", Address: "Builder", PhoneNumber: "222"}
	_, err := s.bookingRepo.Create(b1)
	s.NoError(err)
	_, err = s.bookingRepo.Create(b2)
	s.NoError(err)
	resp, err := s.bookingRepo.GetAll(&domain.BookingFilter{Query: "Alice"})
	s.NoError(err)
	s.Len(resp.Data, 1)
	s.Equal("Alice", resp.Data[0].FirstName)
}

func (s *BookingRepoTestSuite) TestUpdate() {
	b := &domain.Booking{
		FirstName:   "Hundera Awoke",
		Grade:       10,
		Address:     "Adama,Bole",
		Gender:      "Male",
		PhoneNumber: "+251987654321",
		DayPerWeek:  3,
		HrPerDay:    2,
		Assigned:    false,
	}
	created, err := s.bookingRepo.Create(b)
	s.NoError(err)
	updated := &domain.Booking{
		FirstName:   "Updated Name",
		Grade:       12,
		Address:     "Addis Ababa",
		Gender:      "Female",
		PhoneNumber: "+251123456789",
		DayPerWeek:  5,
		HrPerDay:    4,
		Assigned:    true,
	}
	result, err := s.bookingRepo.Update(created.ID, updated)
	s.NoError(err)
	s.NotNil(result)
	s.Equal(result.FirstName, updated.FirstName)
	s.Equal(result.Grade, updated.Grade)
	s.Equal(result.Address, updated.Address)
	s.Equal(result.Gender, updated.Gender)
	s.Equal(result.PhoneNumber, updated.PhoneNumber)
	s.Equal(result.DayPerWeek, updated.DayPerWeek)
	s.Equal(result.HrPerDay, updated.HrPerDay)
	s.Equal(result.Assigned, updated.Assigned)
}

func (s *BookingRepoTestSuite) TestDelete() {
	b := &domain.Booking{
		FirstName:   "Hundera Awoke",
		Grade:       10,
		Address:     "Adama,Bole",
		Gender:      "Male",
		PhoneNumber: "+251987654321",
		DayPerWeek:  3,
		HrPerDay:    2,
		Assigned:    false,
	}
	_, err := s.bookingRepo.Create(b)
	s.NoError(err)
	err = s.bookingRepo.Delete(1)
	s.NoError(err)
	deleted, err := s.bookingRepo.GetByID(1)
	s.Error(err)
	s.Nil(deleted)
}
func (s *BookingRepoTestSuite) TestGetAll_EdgeCases() {
	// No bookings
	resp, err := s.bookingRepo.GetAll(&domain.BookingFilter{Gender: "Nonexistent"})
	s.NoError(err)
	s.Len(resp.Data, 0)

	// Large grade range
	for i := 1; i <= 20; i++ {
		b := &domain.Booking{FirstName: "User", Grade: i}
		_, err := s.bookingRepo.Create(b)
		s.NoError(err)
	}
	resp, err = s.bookingRepo.GetAll(&domain.BookingFilter{MinGrade: 100, MaxGrade: 200})
	s.NoError(err)
	s.Len(resp.Data, 0)

	// Assigned true/false
	b1 := &domain.Booking{FirstName: "AssignedTrue", Assigned: true}
	b2 := &domain.Booking{FirstName: "AssignedFalse", Assigned: false}
	_, err = s.bookingRepo.Create(b1)
	s.NoError(err)
	_, err = s.bookingRepo.Create(b2)
	s.NoError(err)
	resp, err = s.bookingRepo.GetAll(&domain.BookingFilter{Assigned: true})
	s.NoError(err)
	s.True(len(resp.Data) > 0)
	for _, b := range resp.Data {
		s.True(b.Assigned)
	}
}
