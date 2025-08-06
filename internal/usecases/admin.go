package usecases

import (
	"hiyab-tutor/internal/domain"
	"hiyab-tutor/internal/repository"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type adminUsecase struct {
	repo domain.AdminRepository
}

func NewAdminUsecase(db *gorm.DB) *adminUsecase {
	return &adminUsecase{
		repo: repository.NewAdminRepository(db),
	}
}
func (u *adminUsecase) Create(admin *domain.Admin) (*domain.Admin, error) {
	return u.repo.Create(admin)

}
func (u *adminUsecase) GetByID(id uint) (*domain.Admin, error) {
	return u.repo.GetByID(id)
}
func (u *adminUsecase) GetByUsername(username string) (*domain.Admin, error) {
	return u.repo.GetByUsername(username)
}
func (u *adminUsecase) GetAll(f *domain.AdminFilter) (*domain.MultipleAdmins, error) {
	return u.repo.GetAll(f)
}
func (u *adminUsecase) Update(admin *domain.Admin) (*domain.Admin, error) {
	if admin.ID == 0 {
		return nil, domain.ErrInvalidID
	}
	existingAdmin, err := u.repo.GetByID(admin.ID)
	if err != nil {
		return nil, err
	}
	existingAdmin.Name = admin.Name
	existingAdmin.Role = admin.Role
	return u.repo.Update(existingAdmin)
}
func (u *adminUsecase) Delete(id uint) error {
	return u.repo.Delete(id)
}
func (u *adminUsecase) ResetPassword(id uint, newPassword string) error {
	admin, err := u.repo.GetByID(id)
	if err != nil {
		return err
	}
	admin.Password = newPassword
	_, err = u.repo.Update(admin)
	return err
}
func (u *adminUsecase) Login(username, password string) (*domain.Admin, error) {
	admin, err := u.repo.GetByUsername(username)
	if err != nil {
		return nil, err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(password)); err != nil {
		return nil, domain.ErrInvalidCredentials
	}
	return admin, nil
}
func (u *adminUsecase) ChangePassword(id uint, oldPassword, newPassword string) error {
	admin, err := u.repo.GetByID(id)
	if err != nil {
		return err
	}
	if err := bcrypt.CompareHashAndPassword([]byte(admin.Password), []byte(oldPassword)); err != nil {
		return domain.ErrInvalidCredentials
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	admin.Password = string(hashedPassword)
	_, err = u.repo.Update(admin)
	return err
}
