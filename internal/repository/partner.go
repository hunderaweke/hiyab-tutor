package repository

import (
	"hiyab-tutor/internal/domain"

	"gorm.io/gorm"
)

type partnerRepository struct {
	db *gorm.DB
}

func NewPartnerRepository(db *gorm.DB) domain.PartnerRepository {
	return &partnerRepository{db: db}
}

func (r *partnerRepository) Create(partner *domain.Partner) (*domain.Partner, error) {
	tx := r.db.Model(&domain.Partner{}).Create(partner)
	if tx.Error != nil {
		return nil, tx.Error
	}
	return partner, nil
}
func (r *partnerRepository) GetByID(id uint) (*domain.Partner, error) {
	var partner *domain.Partner
	tx := r.db.Model(&domain.Partner{}).Where("id = ?", id).First(&partner)
	if tx.Error != nil {
		if tx.Error == gorm.ErrRecordNotFound {
			return nil, nil // Return nil if not found
		}
		return nil, tx.Error // Return error if any other issue
	}
	return partner, nil
}
func (r *partnerRepository) GetAll(filter *domain.PartnerFilter) (*domain.MultiplePartners, error) {
	if filter == nil {
		filter = &domain.PartnerFilter{
			Page:   1,
			Limit:  10,
			Offset: 0,
		}
	} else {
		if filter.Limit == 0 {
			filter.Limit = 10
		}
		filter.Offset = (filter.Page - 1) * filter.Limit
	}
	query := r.db.Model(&domain.Partner{}).Offset(filter.Offset).Limit(filter.Limit)
	if filter.Search != "" {
		query = query.Where("name LIKE ?", "%"+filter.Search+"%")
	}
	if filter.SortBy != "" {
		switch filter.SortOrder {
		case "asc":
			query = query.Order(filter.SortBy + " ASC")
		case "desc":
			query = query.Order(filter.SortBy + " DESC")
		}
	}
	var total int64
	query.Count(&total)
	var partners []domain.Partner
	if err := query.Find(&partners).Error; err != nil {
		return nil, err
	}

	return &domain.MultiplePartners{Partners: partners, Pagination: domain.Pagination{Page: filter.Page, Limit: filter.Limit, Total: int(total)}}, nil
}
func (r *partnerRepository) Update(partner *domain.Partner) (*domain.Partner, error) {
	tx := r.db.Model(&domain.Partner{}).Where("id = ?", partner.ID).Updates(partner)
	if tx.Error != nil {
		return nil, tx.Error
	}
	if tx.RowsAffected == 0 {
		return nil, domain.ErrNotFound // Return error if no rows were updated
	}
	return partner, nil
}
func (r *partnerRepository) Delete(id uint) error {
	tx := r.db.Model(&domain.Partner{}).Where("id = ?", id).Delete(&domain.Partner{})
	if tx.Error != nil {
		return tx.Error
	}
	if tx.RowsAffected == 0 {
		return domain.ErrNotFound
	}
	return nil
}
