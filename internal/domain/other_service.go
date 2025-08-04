package domain

import "gorm.io/gorm"

type OtherService struct {
	gorm.Model
	WebsiteURL   string                     `json:"website_url"`
	ImageURL     string                     `json:"image_url"`
	Translations []OtherServiceTranslations `json:"languages" gorm:"foreignKey:ServiceID"`
}

type OtherServiceTranslations struct {
	gorm.Model
	LanguageCode string `json:"language_code"`
	ServiceID    uint   `json:"service_id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	TagLine      string `json:"tag_line"`
}

type ServiceFilter struct {
	Page          int      `json:"page"`
	Limit         int      `json:"limit"`
	Offset        int      `json:"offset"`
	Search        string   `json:"search"`
	SortBy        string   `json:"sort_by"`
	SortOrder     string   `json:"sort_order"`
	LanguageCodes []string `json:"language_codes"`
}
type MultipleOtherServices struct {
	OtherServicesList []OtherService `json:"data"`
	Pagination        Pagination     `json:"meta"`
}

type OtherServiceRepository interface {
	Create(service *OtherService) (*OtherService, error)
	GetByID(id uint, languageCodes []string) (*OtherService, error)
	GetAll(filter *ServiceFilter) (*MultipleOtherServices, error)
	Update(service *OtherService) (*OtherService, error)
	Delete(id uint) error
}
type OtherServiceUsecase interface {
	CreateService(service *OtherService) (*OtherService, error)
	GetAllServices(filter *ServiceFilter) (*MultipleOtherServices, error)
	GetServiceByID(id uint, languageCodes []string) (*OtherService, error)
	DeleteService(id uint) error
	UpdateService(service *OtherService) (*OtherService, error)
}
