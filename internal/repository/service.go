package repository

import (
	"hiyab-tutor/internal/domain"

	"gorm.io/gorm"
)

type serviceRepository struct {
	db *gorm.DB
}

func NewServiceRepository(db *gorm.DB) domain.ServiceRepository {
	return &serviceRepository{db: db}
}

func (r *serviceRepository) Create(service *domain.Service) (*domain.Service, error) {
	tx := r.db.Model(&domain.Service{}).Create(service)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return service, nil
}
func (r *serviceRepository) GetByID(id uint, languageCodes []string) (*domain.Service, error) {
	var service *domain.Service
	var tx *gorm.DB
	if len(languageCodes) > 0 {
		tx = r.db.Model(&domain.Service{}).Where("id = ?", id).Preload("Translations", "language_code IN ?", languageCodes).First(&service)
	} else {
		tx = r.db.Model(&domain.Service{}).Where("id = ?", id).Preload("Translations").First(&service)
	}
	if tx.Error != nil {
		return nil, tx.Error
	}
	return service, nil
}
func (r *serviceRepository) GetAll(filter *domain.ServiceFilter) (*domain.MultipleServices, error) {
	var services []domain.Service
	var total int64
	query := r.db.Model(&domain.Service{}).Joins("JOIN service_translations ON service_translations.service_id = services.id")
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
			query = query.Where("service_translations.name LIKE ? OR service_translations.description LIKE ? OR service_translations.name LIKE ? OR service_translations.tag_line LIKE ?", q, q, q, q)
		}
		if filter.SortBy != "" {
			switch filter.SortOrder {
			case "desc":
				query = query.Order("services." + filter.SortBy + " DESC")
			case "asc":
				query = query.Order("services." + filter.SortBy + " ASC")
			}
		} else {
			query = query.Order("services.created_at DESC") // Default sorting by created_at in descending order
		}
		if len(filter.LanguageCodes) > 0 {
			query = query.Preload("Translations", "language_code IN ?", filter.LanguageCodes)
		} else {
			query = query.Preload("Translations")
		}
	}
	query = query.Group("services.id").Limit(filter.Limit).Offset(filter.Offset)
	query.Count(&total)
	if err := query.Find(&services).Error; err != nil {
		return nil, err
	}
	return &domain.MultipleServices{
		Services:   services,
		Pagination: domain.Pagination{Total: int(total), Page: filter.Page, Limit: filter.Limit},
	}, nil
}
func (r *serviceRepository) Update(service *domain.Service) (*domain.Service, error) {
	tx := r.db.Model(&domain.Service{}).Where("id = ?", service.ID).Preload("Translations").Updates(service)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return service, nil
}
func (r *serviceRepository) Delete(id uint) error {
	return r.db.Model(&domain.Service{}).Where("id = ?", id).Preload("Translations").Delete(&domain.Service{}).Error
}
