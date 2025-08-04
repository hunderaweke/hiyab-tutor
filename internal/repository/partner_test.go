package repository

import (
	"hiyab-tutor/internal/database"
	"hiyab-tutor/internal/domain"
	"testing"

	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

type PartnerTestSuite struct {
	suite.Suite
	partnerRepo domain.PartnerRepository
	db          *gorm.DB
}

func TestPartnersRepository(t *testing.T) {
	suite.Run(t, new(PartnerTestSuite))
}
func (suite *PartnerTestSuite) SetupSuite() {
	// Create DB connection once for the entire suite
	db := database.TestDB()
	if db == nil {
		suite.T().Fatal("Failed to initialize database connection")
	}
	suite.db = db
	suite.db.Debug()
	suite.Assert().NoError(suite.db.AutoMigrate(&domain.Partner{}))
}
func (suite *PartnerTestSuite) SetupTest() {
	suite.db.Exec("DELETE FROM partners")
	suite.db.Exec("DELETE FROM partner_translations")
	suite.partnerRepo = NewPartnerRepository(suite.db)
}
func (suite *PartnerTestSuite) TearDownSuite() {
	db, _ := suite.db.DB()

	if err := db.Close(); err != nil {
		suite.T().Fatalf("Failed to close database connection: %v", err)
	}
}

func (suite *PartnerTestSuite) TestCreatePartner() {
	partner := &domain.Partner{
		Name:       "Test Partner",
		ImageURL:   "http://example.com/image.jpg",
		WebsiteURL: "http://example.com",
	}

	createdPartner, err := suite.partnerRepo.Create(partner)
	suite.NoError(err)
	suite.NotNil(createdPartner)
	suite.Equal(partner.Name, createdPartner.Name)
	suite.Equal(partner.ImageURL, createdPartner.ImageURL)
	suite.Equal(partner.WebsiteURL, createdPartner.WebsiteURL)
}
func (suite *PartnerTestSuite) TestGetByID() {
	partner := &domain.Partner{
		Name:       "Test Partner",
		ImageURL:   "http://example.com/image.jpg",
		WebsiteURL: "http://example.com",
	}

	createdPartner, err := suite.partnerRepo.Create(partner)
	suite.NoError(err)

	retrievedPartner, err := suite.partnerRepo.GetByID(createdPartner.ID)
	suite.NoError(err)
	suite.NotNil(retrievedPartner)
	suite.Equal(createdPartner.ID, retrievedPartner.ID)
	suite.Equal(createdPartner.Name, retrievedPartner.Name)
	suite.Equal(createdPartner.ImageURL, retrievedPartner.ImageURL)
	suite.Equal(createdPartner.WebsiteURL, retrievedPartner.WebsiteURL)
}
func (suite *PartnerTestSuite) TestGetAll() {
	filter := &domain.PartnerFilter{
		Page:   1,
		Limit:  10,
		Offset: 0,
	}

	partners, err := suite.partnerRepo.GetAll(filter)
	suite.NoError(err)
	suite.NotNil(partners)
	suite.Empty(partners.Partners) // Initially, no partners should be present
}

func (suite *PartnerTestSuite) TestUpdatePartner() {
	partner := &domain.Partner{
		Name:       "Test Partner",
		ImageURL:   "http://example.com/image.jpg",
		WebsiteURL: "http://example.com",
	}

	createdPartner, err := suite.partnerRepo.Create(partner)
	suite.NoError(err)

	// Update the partner's name
	createdPartner.Name = "Updated Partner"
	updatedPartner, err := suite.partnerRepo.Update(createdPartner)
	suite.NoError(err)
	suite.NotNil(updatedPartner)
	suite.Equal("Updated Partner", updatedPartner.Name)
}
func (suite *PartnerTestSuite) TestDeletePartner() {
	partner := &domain.Partner{
		Name:       "Test Partner",
		ImageURL:   "http://example.com/image.jpg",
		WebsiteURL: "http://example.com",
	}

	createdPartner, err := suite.partnerRepo.Create(partner)
	suite.NoError(err)

	err = suite.partnerRepo.Delete(createdPartner.ID)
	suite.NoError(err)

	// Try to retrieve the deleted partner
	retrievedPartner, err := suite.partnerRepo.GetByID(createdPartner.ID)
	suite.NoError(err)
	suite.Nil(retrievedPartner)
}
