package domain

type Testimonial struct {
	Model
	Name         string                   `form:"name" json:"name"`
	Role         string                   `form:"role" json:"role"`
	Video        string                   `form:"video" json:"video"`
	Thumbnail    string                   `form:"thumbnail" json:"thumbnail"`
	Translations []TestimonialTranslation `form:"translations" json:"translations" gorm:"foreignKey:TestimonialID;constraint:OnDelete:CASCADE"`
}
type TestimonialTranslation struct {
	Model
	LanguageCode  string `form:"language_code" json:"language_code"`
	TestimonialID uint   `form:"testimonial_id" json:"testimonial_id"`
	Text          string `form:"name" json:"name"`
}
type TestimonialFilter struct {
	LanguageCodes []string `form:"language_codes" json:"language_codes"`
	Page          int      `form:"page" json:"page"`
	Limit         int      `form:"limit" json:"limit"`
	Offset        int      `form:"offset" json:"offset"`
	Query         string   `form:"query" json:"query"`
	SortBy        string   `form:"sort_by" json:"sort_by"`
	SortOrder     string   `form:"sort_order" json:"sort_order"` // "asc" or "desc"
}
type MultipleTestimonialResponse struct {
	Testimonials []*Testimonial `json:"data"`
	Pagination   Pagination     `json:"meta"`
}

//go:generate moq -out testimonial_service_mock.go . TestimonialRepository TestimonialUsecase
type TestimonialRepository interface {
	Create(testimonial *Testimonial) (*Testimonial, error)
	GetAll(filter *TestimonialFilter) (*MultipleTestimonialResponse, error)
	GetByID(id uint, languageCodes []string) (*Testimonial, error)
	Delete(id uint) error
	Update(testimonial *Testimonial) (*Testimonial, error)
	AddTranslation(translation *TestimonialTranslation) error
}

type TestimonialUsecase interface {
	CreateTestimonial(testimonial *Testimonial) (*Testimonial, error)
	GetAllTestimonials(filter *TestimonialFilter) (*MultipleTestimonialResponse, error)
	GetTestimonialByID(id uint) (*Testimonial, error)
	DeleteTestimonial(id uint) error
	UpdateTestimonial(testimonial *Testimonial) (*Testimonial, error)
	AddTranslation(testimonialID uint, translation *TestimonialTranslation) (*Testimonial, error)
}
