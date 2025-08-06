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
	// The refresh token
	// example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
	RefreshToken string `json:"refresh_token"`
	// The access token
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
