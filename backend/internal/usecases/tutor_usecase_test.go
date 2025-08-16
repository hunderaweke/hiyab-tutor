package usecases

import (
	"hiyab-tutor/internal/domain"
	"testing"

	"github.com/stretchr/testify/suite"
)

type TutorUsecaseTestSuite struct {
	suite.Suite
	usecase domain.TutorUsecase
	repo    *mockTutorRepository
}

type mockTutorRepository struct {
	tutors map[uint]*domain.Tutor
	lastID uint
}

func (m *mockTutorRepository) Create(t *domain.Tutor) (*domain.Tutor, error) {
	if t == nil {
		return nil, domain.ErrInvalidInput
	}
	m.lastID++
	t.ID = m.lastID
	m.tutors[t.ID] = t
	return t, nil
}
func (m *mockTutorRepository) GetAll(filter *domain.TutorFilter) (domain.MultipleTutorResponse, error) {
	var result []domain.Tutor
	for _, t := range m.tutors {
		if filter != nil {
			if filter.EducationLevel != "" && t.EducationLevel != filter.EducationLevel {
				continue
			}
			if filter.Verified && !t.Verified {
				continue
			}
			if filter.Query != "" && t.FirstName != filter.Query {
				continue
			}
		}
		result = append(result, *t)
	}
	return domain.MultipleTutorResponse{
		Data:       result,
		Pagination: domain.Pagination{Total: len(result)},
	}, nil
}
func (m *mockTutorRepository) GetByID(id uint) (*domain.Tutor, error) {
	t, ok := m.tutors[id]
	if !ok {
		return nil, domain.ErrNotFound
	}
	return t, nil
}
func (m *mockTutorRepository) Update(id uint, t *domain.Tutor) (*domain.Tutor, error) {
	if _, ok := m.tutors[id]; !ok {
		return nil, domain.ErrNotFound
	}
	t.ID = id
	m.tutors[id] = t
	return t, nil
}
func (m *mockTutorRepository) Delete(id uint) error {
	if _, ok := m.tutors[id]; !ok {
		return domain.ErrNotFound
	}
	delete(m.tutors, id)
	return nil
}
func (m *mockTutorRepository) Verify(id uint) error {
	t, ok := m.tutors[id]
	if !ok {
		return domain.ErrNotFound
	}
	t.Verified = true
	return nil
}

func TestTutorUsecase(t *testing.T) {
	suite.Run(t, new(TutorUsecaseTestSuite))
}

func (s *TutorUsecaseTestSuite) SetupTest() {
	s.repo = &mockTutorRepository{tutors: make(map[uint]*domain.Tutor)}
	s.usecase = NewTutorUsecase(s.repo)
}

func (s *TutorUsecaseTestSuite) TestCreate_Valid() {
	t := &domain.Tutor{FirstName: "Test Tutor", EducationLevel: "Degree", Email: "test@example.com"}
	created, err := s.usecase.Create(t)
	s.NoError(err)
	s.NotNil(created)
	s.Equal("Test Tutor", created.FirstName)
}

func (s *TutorUsecaseTestSuite) TestCreate_Invalid() {
	_, err := s.usecase.Create(nil)
	s.Error(err)
	_, err = s.usecase.Create(&domain.Tutor{FirstName: "", EducationLevel: "", Email: ""})
	s.Error(err)
}

func (s *TutorUsecaseTestSuite) TestGetAll_Filtered() {
	t1 := &domain.Tutor{FirstName: "Alice", EducationLevel: "Degree", Verified: true, Email: "alice@example.com"}
	t2 := &domain.Tutor{FirstName: "Bob", EducationLevel: "Diploma", Verified: false, Email: "bob@example.com"}
	t3 := &domain.Tutor{FirstName: "Charlie", EducationLevel: "Degree", Verified: true, Email: "charlie@example.com"}
	s.usecase.Create(t1)
	s.usecase.Create(t2)
	s.usecase.Create(t3)
	filter := &domain.TutorFilter{EducationLevel: "Degree", Verified: true}
	resp, err := s.usecase.GetAll(filter)
	s.NoError(err)
	s.Len(resp.Data, 2)
}

func (s *TutorUsecaseTestSuite) TestGetByID_ValidAndInvalid() {
	t := &domain.Tutor{FirstName: "Test Tutor", EducationLevel: "Degree", Email: "test@example.com"}
	created, _ := s.usecase.Create(t)
	fetched, err := s.usecase.GetByID(created.ID)
	s.NoError(err)
	s.Equal(created.FirstName, fetched.FirstName)
	fetched, err = s.usecase.GetByID(999)
	s.Error(err)
	s.Nil(fetched)
}

func (s *TutorUsecaseTestSuite) TestUpdate_ValidAndInvalid() {
	t := &domain.Tutor{FirstName: "Old Name", EducationLevel: "Diploma", Email: "old@example.com"}
	created, _ := s.usecase.Create(t)
	updated := &domain.Tutor{FirstName: "New Name", EducationLevel: "Degree", Email: "new@example.com"}
	result, err := s.usecase.Update(created.ID, updated)
	s.NoError(err)
	s.Equal("New Name", result.FirstName)
	_, err = s.usecase.Update(999, updated)
	s.Error(err)
}

func (s *TutorUsecaseTestSuite) TestDelete_ValidAndInvalid() {
	t := &domain.Tutor{FirstName: "ToDelete", EducationLevel: "Degree", Email: "delete@example.com"}
	created, _ := s.usecase.Create(t)
	err := s.usecase.Delete(created.ID)
	s.NoError(err)
	err = s.usecase.Delete(999)
	s.Error(err)
}

func (s *TutorUsecaseTestSuite) TestVerify_ValidAndInvalid() {
	t := &domain.Tutor{FirstName: "VerifyMe", EducationLevel: "Degree", Verified: false, Email: "verify@example.com"}
	created, _ := s.usecase.Create(t)
	err := s.usecase.Verify(created.ID)
	s.NoError(err)
	fetched, _ := s.usecase.GetByID(created.ID)
	s.True(fetched.Verified)
	err = s.usecase.Verify(999)
	s.Error(err)
}
