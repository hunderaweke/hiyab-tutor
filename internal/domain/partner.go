package domain

import "gorm.io/gorm"

type Partner struct {
	gorm.Model
	Name       string `json:"name"`
	ImageURL   string `json:"image_url"`
	WebsiteURL string `json:"website_url"`
}

type PartnerFilter struct {
	Page      int    `json:"page"`
	Limit     int    `json:"limit"`
	Offset    int    `json:"offset"`
	Search    string `json:"search"`
	SortBy    string `json:"sort_by"`
	SortOrder string `json:"sort_order"` // "asc" or "desc"
}
type MultiplePartners struct {
	Partners   []Partner  `json:"data"`
	Pagination Pagination `json:"meta"`
}
type PartnerRepository interface {
	Create(partner *Partner) (*Partner, error)
	GetByID(id uint) (*Partner, error)
	GetAll(filter *PartnerFilter) (*MultiplePartners, error)
	Update(partner *Partner) (*Partner, error)
	Delete(id uint) error
}
