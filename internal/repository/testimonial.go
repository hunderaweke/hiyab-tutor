package repository

import (
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
		return nil, domain.ErrCreateFailed
	}
	return testimonial, nil
}
func (r *testimonialRepository) GetAll(filter *domain.TestimonialFilter) (*domain.MultipleTestimonialResponse, error) {
	var testimonials []*domain.Testimonial
	var total int64
	query := r.db.Model(&domain.Testimonial{})

	query = query.Joins("JOIN testimonial_translations ON testimonial_translations.testimonial_id = testimonials.id")
	if filter == nil {
		filter = &domain.TestimonialFilter{
			Page:   1,
			Limit:  10,
			Offset: 0,
		}
	} else {
		if filter.Limit == 0 {
			filter.Limit = 10
		}
		filter.Offset = (filter.Page - 1) * filter.Limit
		if filter.Query != "" {
			q := "%" + filter.Query + "%"
			query = query.Where("testimonials.name LIKE ? OR testimonials.role LIKE ? OR testimonial_translations.text LIKE ?", q, q, q)
		}
		if filter.SortBy != "" {
			switch filter.SortOrder {
			case "desc":
				query = query.Order("testimonials." + filter.SortBy + " DESC")
			case "asc":
				query = query.Order("testimonials." + filter.SortBy + " ASC")
			}
		} else {
			query = query.Order("testimonials.created_at DESC") // Default sorting by created_at in descending order
		}
		if filter.LanguageCodes != nil {
			query = query.Preload("Translations", "language_code IN ?", filter.LanguageCodes)
		} else {
			query = query.Preload("Translations")
		}
	}
	query = query.Group("testimonials.id").Limit(filter.Limit).Offset(filter.Offset)
	query.Count(&total)
	if err := query.Find(&testimonials).Error; err != nil {
		return nil, domain.ErrSearchFailed
	}

	return &domain.MultipleTestimonialResponse{
		Testimonials: testimonials,
		Pagination: domain.Pagination{
			Page:   filter.Page,
			Limit:  filter.Limit,
			Offset: filter.Offset,
			Total:  int(total),
		},
	}, nil
}
func (r *testimonialRepository) GetByID(id uint, languageCodes []string) (*domain.Testimonial, error) {
	var t domain.Testimonial
	var tx *gorm.DB
	if len(languageCodes) > 0 {
		tx = r.db.Model(&domain.Testimonial{}).Preload("Translations", "language_code IN ?", languageCodes).First(&t, id)
	} else {
		tx = r.db.Model(&domain.Testimonial{}).Preload("Translations").First(&t, id)
	}
	if tx.Error != nil {
		return nil, domain.ErrNotFound
	}
	return &t, nil
}
func (r *testimonialRepository) Delete(id uint) error {
	// delete associated translations first
	if err := r.db.Where("testimonial_id = ?", id).Delete(&domain.TestimonialTranslations{}).Error; err != nil {
		return err
	}
	if err := r.db.Delete(&domain.Testimonial{}, id).Error; err != nil {
		return err
	}
	return nil
}
func (r *testimonialRepository) Update(testimonial *domain.Testimonial) (*domain.Testimonial, error) {
	tx := r.db.Model(&domain.Testimonial{}).Where("id = ?", testimonial.ID).Updates(testimonial)
	if tx.Error != nil {
		return nil, domain.ErrUpdateFailed
	}
	if tx.RowsAffected == 0 {
		return nil, domain.ErrNotFound
	}
	if tx.RowsAffected != 1 {
		return nil, domain.ErrUpdateFailed
	}
	return testimonial, nil
}
