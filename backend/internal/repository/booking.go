package repository

import (
	"hiyab-tutor/internal/domain"

	"gorm.io/gorm"
)

type BookingRepository interface {
}

type bookingRepo struct {
	db *gorm.DB
}

func NewBookingRepository(db *gorm.DB) domain.BookingRepository {
	db.AutoMigrate(&domain.Booking{})
	return &bookingRepo{db: db}
}

func (r *bookingRepo) Create(b *domain.Booking) (*domain.Booking, error) {
	if err := r.db.Model(&domain.Booking{}).Create(b).Error; err != nil {
		return nil, err
	}
	return b, nil
}
func (r *bookingRepo) GetAll(filter *domain.BookingFilter) (domain.MultipleBookingResponse, error) {
	var bookings []*domain.Booking
	var total int64
	query := r.db.Model(&domain.Booking{})
	// Filtering
	if filter != nil {
		if filter.Gender != "" {
			query = query.Where("gender = ?", filter.Gender)
		}
		if filter.Address != "" {
			query = query.Where("address LIKE ?", "%"+filter.Address+"%")
		}
		if filter.MinGrade > 0 {
			query = query.Where("grade >= ?", filter.MinGrade)
		}
		if filter.MaxGrade > 0 {
			query = query.Where("grade <= ?", filter.MaxGrade)
		}
		if filter.Query != "" {
			q := "%" + filter.Query + "%"
			query = query.Where("first_name LIKE ? OR last_name LIKE ? OR phone_number LIKE ? OR address LIKE ?", q, q, q, q)
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
		// Assigned filter: only filter if explicitly set (not default false)
		if filter.Assigned {
			query = query.Where("assigned = ?", filter.Assigned)
		}
	}
	// Count total matching
	if err := query.Count(&total).Error; err != nil {
		return domain.MultipleBookingResponse{}, err
	}

	// Pagination defaults
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
	if err := query.Find(&bookings).Error; err != nil {
		return domain.MultipleBookingResponse{}, err
	}

	// convert []*domain.Booking to []domain.Booking
	data := make([]domain.Booking, 0, len(bookings))
	for _, b := range bookings {
		data = append(data, *b)
	}

	resp := domain.MultipleBookingResponse{
		Data: data,
		Pagination: domain.Pagination{
			Page:   page,
			Limit:  limit,
			Offset: offset,
			Total:  int(total),
		},
	}
	return resp, nil
}
func (r *bookingRepo) GetByID(id uint) (*domain.Booking, error) {
	var b domain.Booking
	if err := r.db.First(&b, id).Error; err != nil {
		return nil, err
	}
	return &b, nil
}
func (r *bookingRepo) Update(id uint, b *domain.Booking) (*domain.Booking, error) {
	// Find the booking by ID
	var booking domain.Booking
	if err := r.db.First(&booking, id).Error; err != nil {
		return nil, err
	}
	// Update all fields
	booking.FirstName = b.FirstName
	booking.LastName = b.LastName
	booking.Grade = b.Grade
	booking.Address = b.Address
	booking.Gender = b.Gender
	booking.PhoneNumber = b.PhoneNumber
	booking.DayPerWeek = b.DayPerWeek
	booking.HrPerDay = b.HrPerDay
	booking.Assigned = b.Assigned
	if err := r.db.Save(&booking).Error; err != nil {
		return nil, err
	}
	return &booking, nil
}
func (r *bookingRepo) Delete(id uint) error {
	if err := r.db.Delete(&domain.Booking{}, id).Error; err != nil {
		return err
	}
	return nil
}
