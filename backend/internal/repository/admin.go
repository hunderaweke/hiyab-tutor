package repository

import (
	"hiyab-tutor/internal/domain"

	"gorm.io/gorm"
)

type adminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) domain.AdminRepository {
	return &adminRepository{db: db}
}
func (r *adminRepository) Create(admin *domain.Admin) (*domain.Admin, error) {
	if err := r.db.Create(admin).Error; err != nil {
		return nil, err
	}
	return admin, nil
}
func (r *adminRepository) GetByID(id uint) (*domain.Admin, error) {
	var admin domain.Admin
	if err := r.db.First(&admin, id).Error; err != nil {
		return nil, err
	}
	return &admin, nil
}
func (r *adminRepository) GetByUsername(username string) (*domain.Admin, error) {
	var admin domain.Admin
	if err := r.db.Where("username = ?", username).First(&admin).Error; err != nil {
		return nil, err
	}
	return &admin, nil
}
func (r *adminRepository) GetAll(f *domain.AdminFilter) (*domain.MultipleAdmins, error) {
	var admins []domain.Admin
	query := r.db.Model(&domain.Admin{})
	if f == nil {
		f = &domain.AdminFilter{
			Page:   1,
			Limit:  10,
			Offset: 0,
		}
		query = query.Order("created_at DESC")
	} else {
		if f.Limit == 0 {
			f.Limit = 10
		}
		f.Offset = (f.Page - 1) * f.Limit
		if f.Search != "" {
			q := "%" + f.Search + "%"
			query = query.Where("username LIKE ? OR email LIKE ? OR name LIKE ?", q, q, q)
		}
	}
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, err
	}
	// Apply safe ordering if provided
	if f.SortBy != "" {
		allowed := map[string]bool{
			"username":   true,
			"email":      true,
			"name":       true,
			"created_at": true,
		}
		if allowed[f.SortBy] {
			order := "ASC"
			if f.SortOrder == "desc" || f.SortOrder == "DESC" {
				order = "DESC"
			}
			query = query.Order(f.SortBy + " " + order)
		}
	}
	if err := query.Offset(f.Offset).Limit(f.Limit).Find(&admins).Error; err != nil {
		return nil, err
	}
	return &domain.MultipleAdmins{Admins: admins,
		Pagination: domain.Pagination{
			Total:        int(total),
			Page:         f.Page,
			Limit:        f.Limit,
			PreviousPage: f.Page - 1,
			NextPage:     f.Page + 1,
			Offset:       f.Offset,
		},
	}, nil
}
func (r *adminRepository) Update(admin *domain.Admin) (*domain.Admin, error) {
	if err := r.db.Save(admin).Error; err != nil {
		return nil, err
	}
	return admin, nil
}
func (r *adminRepository) Delete(id uint) error {
	if err := r.db.Delete(&domain.Admin{}, id).Error; err != nil {
		return err
	}
	return nil
}
