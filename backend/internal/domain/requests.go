package domain

import "mime/multipart"

// swagger:model CreateAdminRequest
type CreateAdminRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
	Role     string `json:"role" binding:"required,oneof=admin superadmin"`
	Name     string `json:"name" binding:"required"`
}

// swagger:model UpdateAdminRequest
type UpdateAdminRequest struct {
	Name string `json:"name" binding:"required"`
	Role string `json:"role" binding:"required,oneof=admin superadmin"`
}

// swagger:model ChangePasswordRequest
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" binding:"required"`
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

// swagger:model ResetPasswordRequest
type ResetPasswordRequest struct {
	NewPassword string `json:"new_password" binding:"required,min=8"`
}

// swagger:model LoginRequest
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// swagger:model CreatePartnerRequest
type CreatePartnerRequest struct {
	Name       string `form:"name" json:"name" binding:"required"`
	WebsiteURL string `form:"website_url,omitempty" json:"website_url,omitempty"`
}

// swagger:model UpdatePartnerRequest
type UpdatePartnerRequest struct {
	Name       string `form:"name" json:"name"`
	WebsiteURL string `form:"website_url" json:"website_url"`
}

// swagger:model CreateTestimonialRequest
type CreateTestimonialRequest struct {
	Name string `form:"name" json:"name" binding:"required"`
	Role string `form:"role" json:"role" binding:"required"`
}

// swagger:model UpdateTestimonialRequest
type UpdateTestimonialRequest struct {
	Name string `form:"name" json:"name"`
	Role string `form:"role" json:"role"`
}

// swagger:model CreateTestimonialTranslationRequest
type CreateTestimonialTranslationRequest struct {
	LanguageCode string `json:"language_code" binding:"required"`
	Text         string `json:"name" binding:"required"`
}

// swagger:model UpdateTestimonialTranslationRequest
type UpdateTestimonialTranslationRequest struct {
	LanguageCode string `json:"language_code" binding:"required"`
	Text         string `json:"name" binding:"required"`
}

// swagger:model CreateOtherService
type CreateOtherService struct {
	WebsiteURL string                `form:"website_url"`
	Image      *multipart.FileHeader `form:"image"`
}
