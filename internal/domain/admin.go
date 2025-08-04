package domain

import (
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type Admin struct {
	gorm.Model
	Username string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
	Role     string `json:"role"` // e.g., "superadmin", "admin"
}

func (a *Admin) BeforeCreate(tx *gorm.DB) (err error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(a.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	a.Password = string(hashedPassword)
	return nil
}

type AdminFilter struct {
	Page      int    `json:"page"`
	Limit     int    `json:"limit"`
	Offset    int    `json:"offset"`
	Search    string `json:"search"`
	SortBy    string `json:"sort_by"`
	SortOrder string `json:"sort_order"` // "asc" or "desc"
	Role      string `json:"role"`       // Filter by role if needed
}

type MultipleAdmins struct {
	Admins     []Admin    `json:"data"`
	Pagination Pagination `json:"meta"`
}
type AdminRepository interface {
	Create(admin *Admin) (*Admin, error)
	GetByID(id uint) (*Admin, error)
	GetByUsername(username string) (*Admin, error)
	GetAll(f *AdminFilter) (*MultipleAdmins, error)
	Update(admin *Admin) (*Admin, error)
	Delete(id uint) error
}
