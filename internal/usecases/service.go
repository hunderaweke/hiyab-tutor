package usecases

import (
	"hiyab-tutor/internal/domain"
	"hiyab-tutor/internal/repository"

	"gorm.io/gorm"
)

type otherServiceService struct {
	repo domain.OtherServiceRepository
}

func NewOtherServiceService(db *gorm.DB) domain.OtherServiceUsecase {
	return &otherServiceService{
		repo: repository.NewServiceRepository(db),
	}
}

func (s *otherServiceService) CreateService(service *domain.OtherService) (*domain.OtherService, error) {
	return s.repo.Create(service)
}
func (s *otherServiceService) GetAllServices(filter *domain.ServiceFilter) (*domain.MultipleOtherServices, error) {
	return s.repo.GetAll(filter)
}
func (s *otherServiceService) GetServiceByID(id uint, languageCodes []string) (*domain.OtherService, error) {
	return s.repo.GetByID(id, languageCodes)
}
func (s *otherServiceService) DeleteService(id uint) error {
	return s.repo.Delete(id)
}
func (s *otherServiceService) UpdateService(service *domain.OtherService) (*domain.OtherService, error) {
	return s.repo.Update(service)
}
