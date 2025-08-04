package repository

import (
	"hiyab-tutor/internal/domain"

	"gorm.io/gorm"
)

type serviceRepository struct {
	db *gorm.DB
}

func NewServiceRepository(db *gorm.DB) domain.OtherServiceRepository {
	return &serviceRepository{db: db}
}

func (r *serviceRepository) Create(service *domain.OtherService) (*domain.OtherService, error) {
	tx := r.db.Model(&domain.OtherService{}).Create(service)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return service, nil
}
func (r *serviceRepository) GetByID(id uint, languageCodes []string) (*domain.OtherService, error) {
	var service *domain.OtherService
	var tx *gorm.DB
	if len(languageCodes) > 0 {
		tx = r.db.Model(&domain.OtherService{}).Where("id = ?", id).Preload("Translations", "language_code IN ?", languageCodes).First(&service)
	} else {
		tx = r.db.Model(&domain.OtherService{}).Where("id = ?", id).Preload("Translations").First(&service)
	}
	if tx.Error != nil {
		return nil, tx.Error
	}
	return service, nil
}
func (r *serviceRepository) GetAll(filter *domain.ServiceFilter) (*domain.MultipleOtherServices, error) {
	var services []domain.OtherService
	var total int64
	query := r.db.Model(&domain.OtherService{}).Joins("JOIN other_service_translations ON other_service_translations.service_id = other_services.id")
	if filter == nil {
		filter = &domain.ServiceFilter{
			Page:   1,
			Limit:  10,
			Offset: 0,
		}
	} else {
		if filter.Limit == 0 {
			filter.Limit = 10
		}
		filter.Offset = (filter.Page - 1) * filter.Limit
		if filter.Search != "" {
			q := "%" + filter.Search + "%"
			query = query.Where("other_service_translations.name LIKE ? OR other_service_translations.description LIKE ? OR other_service_translations.name LIKE ? OR other_service_translations.tag_line LIKE ?", q, q, q, q)
		}
		if filter.SortBy != "" {
			switch filter.SortOrder {
			case "desc":
				query = query.Order("other_services." + filter.SortBy + " DESC")
			case "asc":
				query = query.Order("other_services." + filter.SortBy + " ASC")
			}
		} else {
			query = query.Order("other_services.created_at DESC") // Default sorting by created_at in descending order
		}
		if len(filter.LanguageCodes) > 0 {
			query = query.Preload("Translations", "language_code IN ?", filter.LanguageCodes)
		} else {
			query = query.Preload("Translations")
		}
	}
	query = query.Group("other_services.id").Limit(filter.Limit).Offset(filter.Offset)
	query.Count(&total)
	if err := query.Find(&services).Error; err != nil {
		return nil, err
	}
	return &domain.MultipleOtherServices{
		OtherServicesList: services,
		Pagination:        domain.Pagination{Total: int(total), Page: filter.Page, Limit: filter.Limit},
	}, nil
}
func (r *serviceRepository) Update(service *domain.OtherService) (*domain.OtherService, error) {
	tx := r.db.Model(&domain.OtherService{}).Where("id = ?", service.ID).Preload("Translations").Updates(service)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return service, nil
}
func (r *serviceRepository) Delete(id uint) error {
	return r.db.Model(&domain.OtherService{}).Where("id = ?", id).Preload("Translations").Delete(&domain.OtherService{}).Error
}
