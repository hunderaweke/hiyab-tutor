package repository

import (
	"fmt"
	"hiyab-tutor/internal/domain"

	"gorm.io/gorm"
)

type testimonialRepository struct {
	db *gorm.DB
}

func NewTestimonialRepository(db *gorm.DB) domain.TestimonialRepository {
	return &testimonialRepository{db: db}
}
func (r *testimonialRepository) Create(testimonial *domain.Testimonial) (*domain.Testimonial, error) {

	tx := r.db.Model(&domain.Testimonial{}).Create(testimonial)
	if tx.Error != nil {
		return nil, fmt.Errorf("failed to create testimonial: %w", tx.Error)
	}
	return testimonial, nil
}
func (r *testimonialRepository) GetAll() ([]domain.Testimonial, error) {
	return nil, nil
}
func (r *testimonialRepository) GetByID(id uint) (*domain.Testimonial, error) {
	return nil, nil
}
func (r *testimonialRepository) Delete(id uint) error {
	return nil
}
func (r *testimonialRepository) Update(testimonial *domain.Testimonial) (*domain.Testimonial, error) {
	return testimonial, nil
}
func (r *testimonialRepository) Search(query string) ([]domain.Testimonial, error) {
	return nil, nil
}
