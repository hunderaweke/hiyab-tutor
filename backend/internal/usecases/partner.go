package usecases

import (
	"hiyab-tutor/internal/domain"
	"hiyab-tutor/internal/repository"

	"gorm.io/gorm"
)

type partnerUsecase struct {
	repo domain.PartnerRepository
}

func NewPartnerUsecase(db *gorm.DB) domain.PartnerUsecase {
	return &partnerUsecase{
		repo: repository.NewPartnerRepository(db),
	}
}
func (u *partnerUsecase) CreatePartner(partner *domain.Partner) (*domain.Partner, error) {
	return u.repo.Create(partner)
}
func (u *partnerUsecase) GetAllPartners(filter *domain.PartnerFilter) (*domain.MultiplePartners, error) {
	return u.repo.GetAll(filter)
}
func (u *partnerUsecase) GetPartnerByID(id uint) (*domain.Partner, error) {
	return u.repo.GetByID(id)
}
func (u *partnerUsecase) DeletePartner(id uint) error {
	return u.repo.Delete(id)
}
func (u *partnerUsecase) UpdatePartner(partner *domain.Partner) (*domain.Partner, error) {
	return u.repo.Update(partner)
}
