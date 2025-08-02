package domain

import "gorm.io/gorm"

type Testimonial struct {
	gorm.Model
	Name      string `json:"name"`
	Role      string `json:"role"`
	VideoURL  string `json:"video_url"`
	Text      string `json:"content"`
	Thumbnail string `json:"thumbnail"`
}

type TestimonialRepository interface {
	Create(testimonial *Testimonial) (*Testimonial, error)
	GetAll() ([]Testimonial, error)
	GetByID(id uint) (*Testimonial, error)
	Delete(id uint) error
	Update(testimonial *Testimonial) (*Testimonial, error)
	Search(query string) ([]Testimonial, error)
}

type TestimonialService interface {
	CreateTestimonial(testimonial *Testimonial) (*Testimonial, error)
	GetAllTestimonials() ([]Testimonial, error)
	GetTestimonialByID(id uint) (*Testimonial, error)
	DeleteTestimonial(id uint) error
	UpdateTestimonial(testimonial *Testimonial) (*Testimonial, error)
	SearchTestimonials(query string) ([]Testimonial, error)
}
