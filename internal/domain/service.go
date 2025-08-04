package domain

import "gorm.io/gorm"

type Service struct {
	gorm.Model
	WebsiteURL   string                `json:"website_url"`
	ImageURL     string                `json:"image_url"`
	Translations []ServiceTranslations `json:"languages" gorm:"foreignKey:ServiceID"`
}

type ServiceTranslations struct {
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
type MultipleServices struct {
	Services   []Service  `json:"data"`
	Pagination Pagination `json:"meta"`
}

type ServiceRepository interface {
	Create(service *Service) (*Service, error)
	GetByID(id uint, languageCodes []string) (*Service, error)
	GetAll(filter *ServiceFilter) (*MultipleServices, error)
	Update(service *Service) (*Service, error)
	Delete(id uint) error
}
