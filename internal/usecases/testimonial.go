package usecases

import (
	"hiyab-tutor/internal/domain"
	"hiyab-tutor/internal/repository"

	"gorm.io/gorm"
)

type testimonialService struct {
	repo domain.TestimonialRepository
}

func NewTestimonialService(db *gorm.DB) domain.TestimonialUsecase {
	return &testimonialService{
		repo: repository.NewTestimonialRepository(db),
	}
}

func (s *testimonialService) CreateTestimonial(testimonial *domain.Testimonial) (*domain.Testimonial, error) {
	return s.repo.Create(testimonial)
}
func (s *testimonialService) GetAllTestimonials(filter *domain.TestimonialFilter) (*domain.MultipleTestimonialResponse, error) {
	return s.repo.GetAll(filter)
}
func (s *testimonialService) GetTestimonialByID(id uint) (*domain.Testimonial, error) {
	return s.repo.GetByID(id, nil)
}
func (s *testimonialService) DeleteTestimonial(id uint) error {
	return s.repo.Delete(id)
}
func (s *testimonialService) UpdateTestimonial(testimonial *domain.Testimonial) (*domain.Testimonial, error) {
	return s.repo.Update(testimonial)
}
func (s *testimonialService) AddTranslation(testimonialID uint, translation *domain.TestimonialTranslation) (*domain.Testimonial, error) {
	testimonial, err := s.repo.GetByID(testimonialID, nil)
	if err != nil {
		return nil, err
	}
	translation.TestimonialID = testimonial.ID
	testimonial.Translations = append(testimonial.Translations, *translation)
	return s.repo.Update(testimonial)
}
