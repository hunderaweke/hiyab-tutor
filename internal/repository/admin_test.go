package repository

import (
	"hiyab-tutor/internal/database"
	"hiyab-tutor/internal/domain"
	"testing"

	"github.com/stretchr/testify/suite"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type AdminRepositoryTestSuite struct {
	suite.Suite
	adminRepo domain.AdminRepository
	db        *gorm.DB
}

func TestAdminRepository(t *testing.T) {
	suite.Run(t, new(AdminRepositoryTestSuite))
}
func (suite *AdminRepositoryTestSuite) SetupSuite() {
	// Create DB connection once for the entire suite
	db := database.TestDB()
	if db == nil {
		suite.T().Fatal("Failed to initialize database connection")
	}
	suite.db = db
	suite.db.Debug()
	suite.Assert().NoError(suite.db.AutoMigrate(&domain.Admin{}))
}
func (suite *AdminRepositoryTestSuite) SetupTest() {
	suite.db.Exec("DELETE FROM admins")
	suite.adminRepo = NewAdminRepository(suite.db)
}
func (suite *AdminRepositoryTestSuite) TearDownSuite() {
	db, _ := suite.db.DB()

	if err := db.Close(); err != nil {
		suite.T().Fatalf("Failed to close database connection: %v", err)
	}
}

func (suite *AdminRepositoryTestSuite) TestCreateAdmin() {
	admin := &domain.Admin{
		Username: "testadmin",
		Password: "password",
		Email:    "testadmin@example.com",
		Role:     "admin",
		Name:     "Test Admin",
	}
	createdAdmin, err := suite.adminRepo.Create(admin)
	if err != nil {
		suite.T().Fatalf("Failed to create admin: %v", err)
	}
	suite.NotNil(createdAdmin)
	suite.Equal(admin.Username, createdAdmin.Username)
	suite.Equal(admin.Email, createdAdmin.Email)
	suite.Equal(admin.Name, createdAdmin.Name)
	suite.Equal(admin.Role, createdAdmin.Role)
	suite.NotEmpty(createdAdmin.Password) // Password should be hashed
	bcryptErr := bcrypt.CompareHashAndPassword([]byte(createdAdmin.Password), []byte("password"))
	suite.NoError(bcryptErr, "Password hashing failed")
}

func (suite *AdminRepositoryTestSuite) TestGetByID() {
	admin := &domain.Admin{
		Username: "testadmin",
		Password: "password",
		Email:    "testadmin@example.com",
		Role:     "admin",
		Name:     "Test Admin",
	}
	createdAdmin, err := suite.adminRepo.Create(admin)
	if err != nil {
		suite.T().Fatalf("Failed to create admin: %v", err)
	}
	retrievedAdmin, err := suite.adminRepo.GetByID(createdAdmin.ID)
	suite.NoError(err)
	suite.NotNil(retrievedAdmin)
	suite.Equal(createdAdmin.ID, retrievedAdmin.ID)
	suite.Equal(createdAdmin.Username, retrievedAdmin.Username)
	suite.Equal(createdAdmin.Email, retrievedAdmin.Email)
	suite.Equal(createdAdmin.Role, retrievedAdmin.Role)
	suite.Equal(createdAdmin.Name, retrievedAdmin.Name)
	suite.NotEmpty(retrievedAdmin.Password) // Password should be hashed
	bcryptErr := bcrypt.CompareHashAndPassword([]byte(retrievedAdmin.Password), []byte("password"))
	suite.NoError(bcryptErr, "Password hashing failed")
}

func (suite *AdminRepositoryTestSuite) TestGetByUsername() {
	admin := &domain.Admin{
		Username: "testadmin",
		Password: "password",
		Email:    "testadmin@example.com",
		Role:     "admin",
		Name:     "Test Admin",
	}
	createdAdmin, err := suite.adminRepo.Create(admin)
	if err != nil {
		suite.T().Fatalf("Failed to create admin: %v", err)
	}
	retrievedAdmin, err := suite.adminRepo.GetByUsername(createdAdmin.Username)
	suite.NoError(err)
	suite.NotNil(retrievedAdmin)
	suite.Equal(createdAdmin.ID, retrievedAdmin.ID)
	suite.Equal(createdAdmin.Username, retrievedAdmin.Username)
	suite.Equal(createdAdmin.Email, retrievedAdmin.Email)
	suite.Equal(createdAdmin.Role, retrievedAdmin.Role)
	suite.Equal(createdAdmin.Name, retrievedAdmin.Name)
	suite.NotEmpty(retrievedAdmin.Password) // Password should be hashed
	bcryptErr := bcrypt.CompareHashAndPassword([]byte(retrievedAdmin.Password), []byte("password"))
	suite.NoError(bcryptErr, "Password hashing failed")
}

func (suite *AdminRepositoryTestSuite) TestUpdate() {
	admin := &domain.Admin{
		Username: "testadmin",
		Password: "password",
		Email:    "testadmin@example.com",
		Role:     "admin",
		Name:     "Test Admin",
	}
	createdAdmin, err := suite.adminRepo.Create(admin)
	if err != nil {
		suite.T().Fatalf("Failed to create admin: %v", err)
	}
	updatedAdmin := &domain.Admin{
		Model:    gorm.Model{ID: createdAdmin.ID},
		Username: "testadmin_updated",
		Password: "password_updated",
		Email:    "testadmin_updated@example.com",
		Role:     "admin",
		Name:     "Test Admin Updated",
	}
	_, err = suite.adminRepo.Update(updatedAdmin)
	if err != nil {
		suite.T().Fatalf("Failed to update admin: %v", err)
	}
	retrievedAdmin, err := suite.adminRepo.GetByID(createdAdmin.ID)
	suite.NoError(err)
	suite.NotNil(retrievedAdmin)
	suite.Equal(updatedAdmin.ID, retrievedAdmin.ID)
	suite.Equal(updatedAdmin.Username, retrievedAdmin.Username)
	suite.Equal(updatedAdmin.Email, retrievedAdmin.Email)
	suite.Equal(updatedAdmin.Role, retrievedAdmin.Role)
	suite.Equal(updatedAdmin.Name, retrievedAdmin.Name)
	suite.NotEmpty(retrievedAdmin.Password)
	suite.T().Log(retrievedAdmin.Password) // Password should be hashed
	bcryptErr := bcrypt.CompareHashAndPassword([]byte(retrievedAdmin.Password), []byte("password_updated"))
	suite.NoError(bcryptErr, "Password hashing failed")
}

func (suite *AdminRepositoryTestSuite) TestDelete() {
	admin := &domain.Admin{
		Username: "testadmin",
		Password: "password",
		Email:    "testadmin@example.com",
		Role:     "admin",
		Name:     "Test Admin",
	}
	createdAdmin, err := suite.adminRepo.Create(admin)
	if err != nil {
		suite.T().Fatalf("Failed to create admin: %v", err)
	}
	err = suite.adminRepo.Delete(createdAdmin.ID)
	if err != nil {
		suite.T().Fatalf("Failed to delete admin: %v", err)
	}
	retrievedAdmin, err := suite.adminRepo.GetByID(createdAdmin.ID)
	suite.Error(err)
	suite.Nil(retrievedAdmin)
}
func (suite *AdminRepositoryTestSuite) TestGetAll() {
	admin1 := &domain.Admin{
		Username: "admin1",
		Password: "password1",
		Email:    "admin1@example.com",
		Role:     "admin",
		Name:     "Admin One",
	}
	admin2 := &domain.Admin{
		Username: "admin2",
		Password: "password2",
		Email:    "admin2@example.com",
		Role:     "admin",
		Name:     "Admin Two",
	}
	_, err := suite.adminRepo.Create(admin1)
	if err != nil {
		suite.T().Fatalf("Failed to create admin1: %v", err)
	}
	_, err = suite.adminRepo.Create(admin2)
	if err != nil {
		suite.T().Fatalf("Failed to create admin2: %v", err)
	}
	admins, err := suite.adminRepo.GetAll(&domain.AdminFilter{SortBy: "created_at", SortOrder: "asc"})
	suite.NoError(err)
	suite.Len(admins.Admins, 2)
	suite.Equal(admin1.Username, admins.Admins[0].Username)
	suite.Equal(admin2.Username, admins.Admins[1].Username)
}
