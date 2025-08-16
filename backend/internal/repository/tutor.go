package repository

import (
	"hiyab-tutor/internal/domain"

	"gorm.io/gorm"
)

type tutorRepo struct {
	db *gorm.DB
}

func NewTutorRepository(db *gorm.DB) domain.TutorRepository {
	db.AutoMigrate(&domain.Tutor{})
	return &tutorRepo{db: db}
}

func (r *tutorRepo) Create(t *domain.Tutor) (*domain.Tutor, error) {
	if err := r.db.Create(t).Error; err != nil {
		return nil, err
	}
	return t, nil
}

func (r *tutorRepo) GetAll(filter *domain.TutorFilter) (domain.MultipleTutorResponse, error) {
	var tutors []domain.Tutor
	var total int64
	query := r.db.Model(&domain.Tutor{})
	if filter != nil {
		if filter.EducationLevel != "" {
			query = query.Where("education_level LIKE ?", "%"+filter.EducationLevel+"%")
		}
		if filter.Verified {
			query = query.Where("verified = ?", filter.Verified)
		}
		if filter.MinDayPerWeek > 0 {
			query = query.Where("day_per_week >= ?", filter.MinDayPerWeek)
		}
		if filter.MaxDayPerWeek > 0 {
			query = query.Where("day_per_week <= ?", filter.MaxDayPerWeek)
		}
		if filter.MinHrPerDay > 0 {
			query = query.Where("hr_per_day >= ?", filter.MinHrPerDay)
		}
		if filter.MaxHrPerDay > 0 {
			query = query.Where("hr_per_day <= ?", filter.MaxHrPerDay)
		}
		if filter.Query != "" {
			q := "%" + filter.Query + "%"
			query = query.Where("first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone_number LIKE ?", q, q, q, q)
		}
	}
	query.Count(&total)
	// Pagination: default limit 10, page 1
	limit := 10
	page := 1
	if filter != nil {
		if filter.Limit > 0 {
			limit = filter.Limit
		}
		if filter.Page > 0 {
			page = filter.Page
		}
	}
	offset := (page - 1) * limit
	query = query.Limit(limit).Offset(offset)
	// Apply safe ordering if provided
	if filter != nil && filter.SortBy != "" {
		// whitelist sortable columns to avoid SQL injection
		allowed := map[string]bool{
			"first_name":      true,
			"last_name":       true,
			"day_per_week":    true,
			"hr_per_day":      true,
			"created_at":      true,
			"education_level": true,
		}
		if allowed[filter.SortBy] {
			order := "asc"
			if filter.SortOrder == "desc" {
				order = "desc"
			}
			query = query.Order(filter.SortBy + " " + order)
		}
	}
	if err := query.Find(&tutors).Error; err != nil {
		return domain.MultipleTutorResponse{}, err
	}
	return domain.MultipleTutorResponse{
		Data: tutors,
		Pagination: domain.Pagination{
			Page:   page,
			Limit:  limit,
			Offset: offset,
			Total:  int(total),
		},
	}, nil
}

func (r *tutorRepo) GetByID(id uint) (*domain.Tutor, error) {
	var t domain.Tutor
	if err := r.db.First(&t, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}
	return &t, nil
}

func (r *tutorRepo) Update(id uint, t *domain.Tutor) (*domain.Tutor, error) {
	var tutor domain.Tutor
	if err := r.db.First(&tutor, id).Error; err != nil {
		return nil, err
	}
	// Update all fields based on domain.Tutor
	tutor.FirstName = t.FirstName
	tutor.EducationLevel = t.EducationLevel
	tutor.Document = t.Document
	tutor.PhoneNumber = t.PhoneNumber
	tutor.DayPerWeek = t.DayPerWeek
	tutor.HrPerDay = t.HrPerDay
	tutor.Verified = t.Verified
	tutor.Email = t.Email
	if err := r.db.Save(&tutor).Error; err != nil {
		return nil, err
	}
	return &tutor, nil
}

func (r *tutorRepo) Delete(id uint) error {
	if err := r.db.Delete(&domain.Tutor{}, id).Error; err != nil {
		return err
	}
	return nil
}
