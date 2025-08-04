package repository

import (
	"hiyab-tutor/internal/database"
	"hiyab-tutor/internal/domain"
	"testing"

	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

type ServiceRepositoryTestSuite struct {
	suite.Suite
	serviceRepo domain.OtherServiceRepository
	db          *gorm.DB
}

func TestServiceRepository(t *testing.T) {
	suite.Run(t, new(ServiceRepositoryTestSuite))
}
func (suite *ServiceRepositoryTestSuite) SetupSuite() {
	// Create DB connection once for the entire suite
	db := database.TestDB()
	if db == nil {
		suite.T().Fatal("Failed to initialize database connection")
	}
	suite.db = db
	suite.db.Debug()
	suite.Assert().NoError(suite.db.AutoMigrate(&domain.OtherService{}, &domain.OtherServiceTranslations{}))
}
func (suite *ServiceRepositoryTestSuite) SetupTest() {
	suite.db.Exec("DELETE FROM other_service_translations")
	suite.db.Exec("DELETE FROM other_services")
	suite.serviceRepo = NewServiceRepository(suite.db)
}
func (suite *ServiceRepositoryTestSuite) TearDownSuite() {
	db, _ := suite.db.DB()

	if err := db.Close(); err != nil {
		suite.T().Fatalf("Failed to close database connection: %v", err)
	}
}

func (suite *ServiceRepositoryTestSuite) TestCreateService() {
	service := &domain.OtherService{
		WebsiteURL: "http://example.com",
		ImageURL:   "http://example.com/image.jpg",
		Translations: []domain.OtherServiceTranslations{
			{LanguageCode: "en", Name: "Test Service", Description: "This is a test service", TagLine: "Test Tagline"},
			{LanguageCode: "fr", Name: "Service Test", Description: "Ceci est un service de test", TagLine: "Slogan de test"},
		},
	}

	createdService, err := suite.serviceRepo.Create(service)
	suite.NoError(err)
	suite.NotNil(createdService)
	suite.Equal(service.WebsiteURL, createdService.WebsiteURL)
	suite.Equal(service.ImageURL, createdService.ImageURL)
	for i, translation := range service.Translations {
		suite.Equal(translation.LanguageCode, createdService.Translations[i].LanguageCode)
		suite.Equal(translation.Name, createdService.Translations[i].Name)
		suite.Equal(translation.Description, createdService.Translations[i].Description)
		suite.Equal(translation.TagLine, createdService.Translations[i].TagLine)
	}
}
func (suite *ServiceRepositoryTestSuite) TestGetByID() {
	service := &domain.OtherService{
		WebsiteURL: "http://example.com",
		ImageURL:   "http://example.com/image.jpg",
		Translations: []domain.OtherServiceTranslations{
			{LanguageCode: "en", Name: "Test Service", Description: "This is a test service", TagLine: "Test Tagline"},
			{LanguageCode: "fr", Name: "Service Test", Description: "Ceci est un service de test", TagLine: "Slogan de test"},
		},
	}

	createdService, err := suite.serviceRepo.Create(service)
	suite.NoError(err)

	fetchedService, err := suite.serviceRepo.GetByID(createdService.ID, nil)
	suite.NoError(err)
	suite.NotNil(fetchedService)
	suite.Equal(createdService.ID, fetchedService.ID)
	suite.Equal(createdService.WebsiteURL, fetchedService.WebsiteURL)
	suite.Equal(createdService.ImageURL, fetchedService.ImageURL)
	for i, translation := range createdService.Translations {
		suite.Equal(translation.LanguageCode, fetchedService.Translations[i].LanguageCode)
		suite.Equal(translation.Name, fetchedService.Translations[i].Name)
		suite.Equal(translation.Description, fetchedService.Translations[i].Description)
		suite.Equal(translation.TagLine, fetchedService.Translations[i].TagLine)
	}
}

func (suite *ServiceRepositoryTestSuite) TestGetAllServices() {
	services := []*domain.OtherService{
		{ImageURL: "http://example.com/image1.jpg", WebsiteURL: "http://example.com/1", Translations: []domain.OtherServiceTranslations{
			{LanguageCode: "en", Name: "Service 1", Description: "Description 1", TagLine: "Tagline 1"},
			{LanguageCode: "fr", Name: "Service 1 FR", Description: "Description 1 FR", TagLine: "Tagline 1 FR"},
		}},
		{ImageURL: "http://example.com/image2.jpg", WebsiteURL: "http://example.com/2", Translations: []domain.OtherServiceTranslations{
			{LanguageCode: "en", Name: "Service 2", Description: "Description 2", TagLine: "Tagline 2"},
			{LanguageCode: "fr", Name: "Service 2 FR", Description: "Description 2 FR", TagLine: "Tagline 2 FR"},
		}},
		{ImageURL: "http://example.com/image3.jpg", WebsiteURL: "http://example.com/3", Translations: []domain.OtherServiceTranslations{
			{LanguageCode: "en", Name: "Service 3", Description: "Description 3", TagLine: "Tagline 3"},
			{LanguageCode: "fr", Name: "Service 3 FR", Description: "Description 3 FR", TagLine: "Tagline 3 FR"},
		}},
		{ImageURL: "http://example.com/image4.jpg", WebsiteURL: "http://example.com/4", Translations: []domain.OtherServiceTranslations{
			{LanguageCode: "en", Name: "Service 4", Description: "Description 4", TagLine: "Tagline 4"},
			{LanguageCode: "fr", Name: "Service 4 FR", Description: "Description 4 FR", TagLine: "Tagline 4 FR"},
		}},
		{ImageURL: "http://example.com/image5.jpg", WebsiteURL: "http://example.com/5", Translations: []domain.OtherServiceTranslations{
			{LanguageCode: "en", Name: "Service 5", Description: "Description 5", TagLine: "Tagline 5"},
			{LanguageCode: "fr", Name: "Service 5 FR", Description: "Description 5 FR", TagLine: "Tagline 5 FR"},
		}},
	}
	for _, svc := range services {
		_, err := suite.serviceRepo.Create(svc)
		suite.NoError(err)
	}
	filter := &domain.ServiceFilter{
		Page:      1,
		Limit:     10,
		SortBy:    "created_at",
		SortOrder: "asc",
	}

	response, err := suite.serviceRepo.GetAll(filter)
	suite.NoError(err)
	suite.NotNil(response)
	suite.Greater(len(response.OtherServicesList), 0)
	suite.Equal(filter.Page, response.Pagination.Page)
	suite.Equal(filter.Limit, response.Pagination.Limit)
	suite.Equal(response.Pagination.Total, len(services))
	for i, svc := range response.OtherServicesList {
		suite.Equal(services[i].ImageURL, svc.ImageURL)
		suite.Equal(services[i].WebsiteURL, svc.WebsiteURL)
		for j, translation := range services[i].Translations {
			suite.Equal(translation.LanguageCode, svc.Translations[j].LanguageCode)
			suite.Equal(translation.Name, svc.Translations[j].Name)
			suite.Equal(translation.Description, svc.Translations[j].Description)
			suite.Equal(translation.TagLine, svc.Translations[j].TagLine)
		}
	}
}

func (suite *ServiceRepositoryTestSuite) TestUpdateService() {
	service := &domain.OtherService{
		WebsiteURL: "http://example.com",
		ImageURL:   "http://example.com/image.jpg",
		Translations: []domain.OtherServiceTranslations{
			{LanguageCode: "en", Name: "Test Service", Description: "This is a test service", TagLine: "Test Tagline"},
			{LanguageCode: "fr", Name: "Service Test", Description: "Ceci est un service de test", TagLine: "Slogan de test"},
		},
	}

	createdService, err := suite.serviceRepo.Create(service)
	suite.NoError(err)

	// Update the service's name
	createdService.Translations[0].Name = "Updated Service"
	updatedService, err := suite.serviceRepo.Update(createdService)
	suite.NoError(err)
	suite.NotNil(updatedService)
	suite.Equal("Updated Service", updatedService.Translations[0].Name)
}

func (suite *ServiceRepositoryTestSuite) TestDeleteService() {
	service := &domain.OtherService{
		WebsiteURL: "http://example.com",
		ImageURL:   "http://example.com/image.jpg",
		Translations: []domain.OtherServiceTranslations{
			{LanguageCode: "en", Name: "Test Service", Description: "This is a test service", TagLine: "Test Tagline"},
			{LanguageCode: "fr", Name: "Service Test", Description: "Ceci est un service de test", TagLine: "Slogan de test"},
		},
	}

	createdService, err := suite.serviceRepo.Create(service)
	suite.NoError(err)

	err = suite.serviceRepo.Delete(createdService.ID)
	suite.NoError(err)

	deletedService, err := suite.serviceRepo.GetByID(createdService.ID, nil)
	suite.Error(err)
	suite.Nil(deletedService)
}
