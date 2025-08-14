package usecases

import (
	"hiyab-tutor/internal/domain"
)

type bookingUsecase struct {
	repo domain.BookingRepository
}

func NewBookingUsecase(repo domain.BookingRepository) domain.BookingUsecase {
	return &bookingUsecase{repo: repo}
}

func (u *bookingUsecase) Create(b *domain.Booking) (*domain.Booking, error) {
	return u.repo.Create(b)
}

func (u *bookingUsecase) GetAll(filter *domain.BookingFilter) ([]*domain.Booking, error) {
	return u.repo.GetAll(filter)
}

func (u *bookingUsecase) GetByID(id uint) (*domain.Booking, error) {
	return u.repo.GetByID(id)
}

func (u *bookingUsecase) Update(id uint, b *domain.Booking) (*domain.Booking, error) {
	return u.repo.Update(id, b)
}

func (u *bookingUsecase) Delete(id uint) error {
	return u.repo.Delete(id)
}

func (u *bookingUsecase) Assign(id uint) error {
	booking, err := u.repo.GetByID(id)
	if err != nil {
		return err
	}
	booking.Assigned = true
	_, err = u.repo.Update(id, booking)
	return err
}
