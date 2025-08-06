package domain

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
