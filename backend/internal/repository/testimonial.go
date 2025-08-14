package repository

import (
	"fmt"
	"hiyab-tutor/internal/domain"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type testimonialRepository struct {
	db *gorm.DB
}

func NewTestimonialRepository(db *gorm.DB) domain.TestimonialRepository {
	db.AutoMigrate(&domain.Testimonial{})
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
	query = query.Joins("LEFT JOIN testimonial_translations ON testimonial_translations.testimonial_id = testimonials.id")
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
			allowedSortFields := map[string]bool{
				"id":         true,
				"name":       true,
				"role":       true,
				"created_at": true,
			}
			sortBy := filter.SortBy
			if !allowedSortFields[sortBy] {
				sortBy = "created_at"
			}
			switch filter.SortOrder {
			case "asc":
				query = query.Order(clause.OrderByColumn{Column: clause.Column{Name: fmt.Sprintf("testimonials.%s", filter.SortBy)}, Desc: false})
			default:
				query = query.Order(clause.OrderByColumn{Column: clause.Column{Name: fmt.Sprintf("testimonials.%s", filter.SortBy)}, Desc: true})
			}
		} else {
			filter.SortBy = "created_at"
			query = query.Order(clause.OrderByColumn{Column: clause.Column{Name: fmt.Sprintf("testimonials.%s", filter.SortBy)}, Desc: true})
		}
		if filter.LanguageCodes != nil {
			query = query.Preload("Translations", "language_code IN ?", filter.LanguageCodes)
		} else {
			query = query.Preload("Translations")
		}
	}
	query = query.Group("testimonials.id")
	query.Count(&total)
	query = query.Limit(filter.Limit).Offset(filter.Offset)
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
	if err := r.db.Where("testimonial_id = ?", id).Delete(&domain.TestimonialTranslation{}).Error; err != nil {
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

func (r *testimonialRepository) AddTranslation(translation *domain.TestimonialTranslation) error {
	return r.db.Model(&domain.TestimonialTranslation{}).Create(translation).Error
}
