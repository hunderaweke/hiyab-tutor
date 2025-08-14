package domain

// swagger:model ErrorResponse
type ErrorResponse struct {
	Message string `json:"message"`
}

// swagger:model MessageResponse
type MessageResponse struct {
	Message string `json:"message"`
}

// swagger:model SuccessResponse
type SuccessResponse struct {
	Message string `json:"message"`
}

// swagger:model LoginResponse
type LoginAndRegisterResponse struct {
	// example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
	AccessToken string `json:"access_token"`
	// The user object
	User Admin `json:"user"`
}

// swagger:model TokenResponse
type TokenResponse struct {
	RefreshToken string `json:"refresh_token"`
	AccessToken  string `json:"access_token"`
}

// swagger:model PartnerResponse
type PartnerResponse struct {
	ID         uint   `json:"id"`
	Name       string `json:"name"`
	ImageURL   string `json:"image_url"`
	WebsiteURL string `json:"website_url"`
}

// swagger:model MultiplePartnersResponse
type MultiplePartnersResponse struct {
	Data []PartnerResponse `json:"data"`
	Meta Pagination        `json:"meta"`
}

// swagger:model TestimonialTranslationResponse
type TestimonialTranslationResponse struct {
	LanguageCode string `json:"language_code"`
	Text         string `json:"name"`
}

// swagger:model TestimonialResponse
type TestimonialResponse struct {
	ID           uint                             `json:"id"`
	Name         string                           `json:"name"`
	Role         string                           `json:"role"`
	Video        string                           `json:"video"`
	Thumbnail    string                           `json:"thumbnail"`
	Translations []TestimonialTranslationResponse `json:"languages"`
}

// swagger:model MultipleTestimonialsResponse
type MultipleTestimonialsResponse struct {
	Data []TestimonialResponse `json:"data"`
	Meta Pagination            `json:"meta"`
}
