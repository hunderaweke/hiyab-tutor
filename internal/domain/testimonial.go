package domain

type Testimonial struct {
	Model
	Name         string                    `json:"name"`
	Role         string                    `json:"role"`
	VideoURL     string                    `json:"video_url"`
	Thumbnail    string                    `json:"thumbnail"`
	Translations []TestimonialTranslations `json:"languages" gorm:"foreignKey:TestimonialID;constraint:OnDelete:CASCADE"`
}

type TestimonialTranslations struct {
	Model
	LanguageCode  string `json:"language_code"`
	TestimonialID uint   `json:"testimonial_id"`
	Text          string `json:"name"`
}
type TestimonialFilter struct {
	LanguageCodes []string `json:"language_codes"`
	Page          int      `json:"page"`
	Limit         int      `json:"limit"`
	Offset        int      `json:"offset"`
	Query         string   `json:"query"`
	SortBy        string   `json:"sort_by"`
	SortOrder     string   `json:"sort_order"` // "asc" or "desc"
}
type MultipleTestimonialResponse struct {
	Testimonials []*Testimonial `json:"data"`
	Pagination   Pagination     `json:"meta"`
}
type TestimonialRepository interface {
	Create(testimonial *Testimonial) (*Testimonial, error)
	GetAll(filter *TestimonialFilter) (*MultipleTestimonialResponse, error)
	GetByID(id uint, languageCodes []string) (*Testimonial, error)
	Delete(id uint) error
	Update(testimonial *Testimonial) (*Testimonial, error)
}

type TestimonialUsecase interface {
	CreateTestimonial(testimonial *Testimonial) (*Testimonial, error)
	GetAllTestimonials(filter *TestimonialFilter) (*MultipleTestimonialResponse, error)
	GetTestimonialByID(id uint) (*Testimonial, error)
	DeleteTestimonial(id uint) error
	UpdateTestimonial(testimonial *Testimonial) (*Testimonial, error)
}
