package domain

import (
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

const (
	RoleAdmin      = "admin"
	RoleSuperAdmin = "superadmin"
)

// swagger:model Admin
type Admin struct {
	Model
	Username string `json:"username" binding:"required"`
	Password string `json:"-" binding:"required"`
	Role     string `json:"role" binding:"required" validate:"oneof=admin superadmin"`
	Name     string `json:"name" binding:"required"`
}

func (a *Admin) BeforeCreate(tx *gorm.DB) (err error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(a.Password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	a.Password = string(hashedPassword)
	log.Println(a)
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

// swagger:model MultipleAdmins
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

type AdminUsecase interface {
	Create(admin *Admin) (*Admin, error)
	GetByID(id uint) (*Admin, error)
	GetByUsername(username string) (*Admin, error)
	GetAll(f *AdminFilter) (*MultipleAdmins, error)
	Update(admin *Admin) (*Admin, error)
	Delete(id uint) error
	ResetPassword(id uint, newPassword string) error
	ChangePassword(id uint, oldPassword, newPassword string) error
	Login(username, password string) (*Admin, error)
}
