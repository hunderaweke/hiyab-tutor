package repository

import (
	"hiyab-tutor/internal/database"
	"hiyab-tutor/internal/domain"
	"testing"

	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

type TutorRepoTestSuite struct {
	suite.Suite
	tutorRepo domain.TutorRepository
	db        *gorm.DB
}

func TestTutorRepository(t *testing.T) {
	suite.Run(t, new(TutorRepoTestSuite))
}

func (s *TutorRepoTestSuite) SetupSuite() {
	db := database.TestDB()
	if db == nil {
		s.T().Fatal("creating test database issue")
	}
	s.db = db
	s.db.Debug()
	s.Assert().NoError(s.db.AutoMigrate(&domain.Tutor{}))
}

func (s *TutorRepoTestSuite) SetupTest() {
	s.db.Exec("DELETE FROM tutors")
	s.tutorRepo = NewTutorRepository(s.db)
}

func (s *TutorRepoTestSuite) TearDownSuite() {
	db, _ := s.db.DB()
	if err := db.Close(); err != nil {
		s.T().Log("failed to close the database connection")
	}
}

func (s *TutorRepoTestSuite) TestCreateAndGetByID() {
	t := &domain.Tutor{
		FirstName:      "Test Tutor",
		EducationLevel: "Degree",
		Document:       "doc.pdf",
		PhoneNumber:    "123456789",
		DayPerWeek:     5,
		HrPerDay:       2,
		Verified:       true,
		Email:          "test@example.com",
	}
	created, err := s.tutorRepo.Create(t)
	s.NoError(err)
	s.NotNil(created)
	fetched, err := s.tutorRepo.GetByID(created.ID)
	s.NoError(err)
	s.Equal(created.FirstName, fetched.FirstName)
	s.Equal(created.EducationLevel, fetched.EducationLevel)
	s.Equal(created.Document, fetched.Document)
	s.Equal(created.PhoneNumber, fetched.PhoneNumber)
	s.Equal(created.DayPerWeek, fetched.DayPerWeek)
	s.Equal(created.HrPerDay, fetched.HrPerDay)
	s.Equal(created.Verified, fetched.Verified)
	s.Equal(created.Email, fetched.Email)
}

func (s *TutorRepoTestSuite) TestGetAllWithFilter() {
	t1 := &domain.Tutor{FirstName: "Alice", EducationLevel: "Degree", DayPerWeek: 5, HrPerDay: 2, Verified: true, Email: "alice@example.com"}
	t2 := &domain.Tutor{FirstName: "Bob", EducationLevel: "Diploma", DayPerWeek: 3, HrPerDay: 1, Verified: false, Email: "bob@example.com"}
	t3 := &domain.Tutor{FirstName: "Charlie", EducationLevel: "Degree", DayPerWeek: 6, HrPerDay: 3, Verified: true, Email: "charlie@example.com"}
	s.tutorRepo.Create(t1)
	s.tutorRepo.Create(t2)
	s.tutorRepo.Create(t3)

	filter := &domain.TutorFilter{
		EducationLevel: "Degree",
		MinDayPerWeek:  5,
		Verified:       true,
		Query:          "Charlie",
	}
	resp, err := s.tutorRepo.GetAll(filter)
	s.NoError(err)
	s.Len(resp.Data, 1)
	s.Equal("Charlie", resp.Data[0].FirstName)
	s.Equal("Degree", resp.Data[0].EducationLevel)
	s.True(resp.Data[0].Verified)
	s.Equal("charlie@example.com", resp.Data[0].Email)
	s.Equal(1, resp.Pagination.Total)
}

func (s *TutorRepoTestSuite) TestUpdate() {
	t := &domain.Tutor{FirstName: "Old Name", EducationLevel: "Diploma", DayPerWeek: 3, HrPerDay: 1, Verified: false, Email: "old@example.com"}
	created, _ := s.tutorRepo.Create(t)
	updated := &domain.Tutor{FirstName: "New Name", EducationLevel: "Degree", DayPerWeek: 5, HrPerDay: 2, Verified: true, Email: "new@example.com"}
	result, err := s.tutorRepo.Update(created.ID, updated)
	s.NoError(err)
	s.Equal("New Name", result.FirstName)
	s.Equal("Degree", result.EducationLevel)
	s.Equal(5, result.DayPerWeek)
	s.Equal(2, result.HrPerDay)
	s.True(result.Verified)
	s.Equal("new@example.com", result.Email)
}

func (s *TutorRepoTestSuite) TestDelete() {
	t := &domain.Tutor{FirstName: "ToDelete", EducationLevel: "Degree", Email: "delete@example.com"}
	created, _ := s.tutorRepo.Create(t)
	err := s.tutorRepo.Delete(created.ID)
	s.NoError(err)
	fetched, err := s.tutorRepo.GetByID(created.ID)
	s.Error(err)
	s.Nil(fetched)
}
