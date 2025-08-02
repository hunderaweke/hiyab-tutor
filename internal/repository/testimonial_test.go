package repository

import (
	"hiyab-tutor/internal/database"
	"hiyab-tutor/internal/domain"
	"testing"

	"github.com/stretchr/testify/suite"
	"gorm.io/gorm"
)

type TestimonialTestSuite struct {
	suite.Suite
	testimonialRepo domain.TestimonialRepository
	db              *gorm.DB
}

func TestTestimonialsRepository(t *testing.T) {
	suite.Run(t, new(TestimonialTestSuite))
}

func (suite *TestimonialTestSuite) SetupTest() {
	db := database.TestDB()
	if db == nil {
		suite.T().Fatal("Failed to initialize database connection")
	}
	suite.db = db
	suite.db.AutoMigrate(&domain.Testimonial{})
	suite.testimonialRepo = NewTestimonialRepository(suite.db)
}
func (suite *TestimonialTestSuite) TearDownTest() {
	db, _ := suite.db.DB()
	if err := db.Close(); err != nil {
		suite.T().Fatalf("Failed to close database connection: %v", err)
	}
}
func (suite *TestimonialTestSuite) TestCreateTestimonial() {
	testimonial := &domain.Testimonial{
		Name:      "John Doe",
		Role:      "Developer",
		VideoURL:  "http://example.com/video.mp4",
		Text:      "This is a testimonial.",
		Thumbnail: "http://example.com/thumbnail.jpg",
	}

	createdTestimonial, err := suite.testimonialRepo.Create(testimonial)
	if err != nil {
		suite.T().Fatalf("Failed to create testimonial: %v", err)
	}

	if createdTestimonial == nil {
		suite.T().Fatal("Created testimonial is nil")
	}
	if createdTestimonial.Name != testimonial.Name {
		suite.T().Fatalf("Expected name %s, got %s", testimonial.Name, createdTestimonial.Name)
	}
	suite.Assert().Equal(createdTestimonial.Model.ID, uint(1))
	suite.Assert().Equal(createdTestimonial, testimonial, "Created testimonial should match the input")
}
