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
	suite.db.Logger.LogMode(1) // Enable query logging
	suite.db.AutoMigrate(&domain.Testimonial{}, &domain.TestimonialTranslations{})
	// Clear database tables
	suite.db.Exec("DELETE FROM testimonials")
	suite.db.Exec("DELETE FROM testimonial_translations")
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
		Thumbnail: "http://example.com/thumbnail.jpg",
		Translations: []domain.TestimonialTranslations{
			{
				LanguageCode: "en",
				Text:         "This is a testimonial.",
			},
			{
				LanguageCode: "am",
				Text:         "ይህ አንደኛ መልእክት ነው።",
			},
		},
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

func (suite *TestimonialTestSuite) TestGetAllTestimonials() {
	testimonials := []*domain.Testimonial{
		{Name: "John Doe", Role: "Student", VideoURL: "http://example.com/video.mp4", Translations: []domain.TestimonialTranslations{
			{LanguageCode: "en", Text: "This is a testimonial."},
			{LanguageCode: "am", Text: "ይህ አንደኛ መልእክት ነው።"}}, Thumbnail: "http://example.com/thumbnail.jpg"},
		{Name: "John Doe", Role: "Student", VideoURL: "http://example.com/video.mp4", Translations: []domain.TestimonialTranslations{
			{LanguageCode: "en", Text: "This is a testimonial."},
			{LanguageCode: "am", Text: "ይህ አንደኛ መልእክት ነው።"}}, Thumbnail: "http://example.com/thumbnail.jpg"},
		{Name: "John Doe", Role: "Student", VideoURL: "http://example.com/video.mp4", Translations: []domain.TestimonialTranslations{
			{LanguageCode: "en", Text: "This is a testimonial."},
			{LanguageCode: "am", Text: "ይህ አንደኛ መልእክት ነው።"}}, Thumbnail: "http://example.com/thumbnail.jpg"},
		{Name: "John Doe", Role: "Student", VideoURL: "http://example.com/video.mp4", Translations: []domain.TestimonialTranslations{
			{LanguageCode: "en", Text: "This is a testimonial."},
			{LanguageCode: "am", Text: "ይህ አንደኛ መልእክት ነው።"}}, Thumbnail: "http://example.com/thumbnail.jpg"},
	}
	for _, t := range testimonials {
		_, err := suite.testimonialRepo.Create(t)
		suite.Assert().NoError(err)
	}
	suite.Run("Get All without filter", func() {
		found, err := suite.testimonialRepo.GetAll(nil)
		if err != nil {
			suite.T().Fatalf("Failed to get testimonials: %v", err)
		}
		suite.Assert().NotEmpty(found.Testimonials, "Expected non-empty testimonials list")
		suite.Assert().Len(found.Testimonials, len(testimonials), "Expected the number of testimonials to match")
		for i, t := range found.Testimonials {
			suite.Assert().Equal(t.Name, testimonials[i].Name, "Expected testimonial names to match")
			suite.Assert().Equal(t.Role, testimonials[i].Role, "Expected testimonial roles to match")
			suite.Assert().Equal(t.VideoURL, testimonials[i].VideoURL, "Expected testimonial video URLs to match")
			suite.Assert().Equal(t.Thumbnail, testimonials[i].Thumbnail, "Expected testimonial thumbnails to match")
			suite.Assert().Len(t.Translations, len(testimonials[i].Translations), "Expected number of translations to match")
		}
	})
	suite.Run("Get All with filter", func() {
		filter := &domain.TestimonialFilter{
			LanguageCodes: []string{"en"},
		}
		found, err := suite.testimonialRepo.GetAll(filter)
		if err != nil {
			suite.T().Fatalf("Failed to get testimonials: %v", err)
		}
		suite.Assert().NotNil(found, "Expected found to be non-nil")
		suite.Assert().NotEmpty(found.Testimonials, "Expected non-empty testimonials list")
		suite.Assert().Len(found.Testimonials, len(testimonials), "Expected the number of testimonials to match")
		for i, t := range found.Testimonials {
			suite.Assert().Contains(filter.LanguageCodes, t.Translations[0].LanguageCode, "Expected language code to match")
			for j, translation := range t.Translations {
				suite.Assert().Equal(filter.LanguageCodes[j], translation.LanguageCode, "Expected language codes to match")
				suite.Assert().NotEmpty(translation.Text, "Expected translation text to be non-empty")
				suite.Assert().Equal(translation.Text, testimonials[i].Translations[j].Text, "Expected translation texts to match")
			}
			suite.Assert().Equal(t.Name, testimonials[i].Name, "Expected testimonial names to match")
			suite.Assert().Equal(t.Role, testimonials[i].Role, "Expected testimonial roles to match")
			suite.Assert().Equal(t.VideoURL, testimonials[i].VideoURL, "Expected testimonial video URLs to match")
			suite.Assert().Equal(t.Thumbnail, testimonials[i].Thumbnail, "Expected testimonial thumbnails to match")
		}
	})

}
func (suite *TestimonialTestSuite) TestGetTestimonialByID() {
	testimonial := &domain.Testimonial{
		Name:     "John Doe",
		Role:     "Developer",
		VideoURL: "http://example.com/video.mp4",
		Translations: []domain.TestimonialTranslations{
			{LanguageCode: "en", Text: "This is a testimonial."},
			{LanguageCode: "am", Text: "ይህ አንደኛ መልእክት ነው።"},
		},
		Thumbnail: "http://example.com/thumbnail.jpg",
	}

	createdTestimonial, err := suite.testimonialRepo.Create(testimonial)
	if err != nil {
		suite.T().Fatalf("Failed to create testimonial: %v", err)
	}

	foundTestimonial, err := suite.testimonialRepo.GetByID(createdTestimonial.Model.ID)
	if err != nil {
		suite.T().Fatalf("Failed to get testimonial by ID: %v", err)
	}

	suite.Assert().NotNil(foundTestimonial, "Expected testimonial to be found")
	suite.Assert().Equal(createdTestimonial.Model.ID, foundTestimonial.Model.ID, "Expected IDs to match")
	suite.Assert().Equal(createdTestimonial.Name, foundTestimonial.Name, "Expected names to match")
	suite.Assert().Equal(createdTestimonial.Role, foundTestimonial.Role, "Expected roles to match")
	suite.Assert().Equal(createdTestimonial.VideoURL, foundTestimonial.VideoURL, "Expected video URLs to match")
	suite.Assert().Equal(createdTestimonial.Thumbnail, foundTestimonial.Thumbnail, "Expected thumbnails to match")
	suite.Assert().Len(foundTestimonial.Translations, len(createdTestimonial.Translations), "Expected number of translations to match")
	for i, translation := range foundTestimonial.Translations {
		suite.Assert().Equal(createdTestimonial.Translations[i].LanguageCode, translation.LanguageCode, "Expected language codes to match")
		suite.Assert().Equal(createdTestimonial.Translations[i].Text, translation.Text, "Expected translation texts to match")
	}
}

func (suite *TestimonialTestSuite) TestDeleteTestimonial() {
	testimonial := &domain.Testimonial{
		Name:     "John Doe",
		Role:     "Developer",
		VideoURL: "http://example.com/video.mp4",
		Translations: []domain.TestimonialTranslations{
			{LanguageCode: "en", Text: "This is a testimonial."},
			{LanguageCode: "am", Text: "ይህ አንደኛ መልእክት ነው።"},
		},
		Thumbnail: "http://example.com/thumbnail.jpg",
	}

	createdTestimonial, err := suite.testimonialRepo.Create(testimonial)
	if err != nil {
		suite.T().Fatalf("Failed to create testimonial: %v", err)
	}
	suite.T().Log("Created testimonial with ID:", createdTestimonial.Model.ID)
	err = suite.testimonialRepo.Delete(createdTestimonial.Model.ID)
	if err != nil {
		suite.T().Fatalf("Failed to delete testimonial: %v", err)
	}

	foundTestimonial, err := suite.testimonialRepo.GetByID(createdTestimonial.Model.ID)
	suite.Assert().Error(err, "Expected error when getting deleted testimonial")
	suite.Assert().Nil(foundTestimonial, "Expected testimonial to be nil after deletion")
}
func (suite *TestimonialTestSuite) TestUpdateTestimonial() {
	testimonial := &domain.Testimonial{
		Name:     "John Doe",
		Role:     "Developer",
		VideoURL: "http://example.com/video.mp4",
		Translations: []domain.TestimonialTranslations{
			{LanguageCode: "en", Text: "This is a testimonial."},
			{LanguageCode: "am", Text: "ይህ አንደኛ መልእክት ነው።"},
		},
		Thumbnail: "http://example.com/thumbnail.jpg",
	}

	createdTestimonial, err := suite.testimonialRepo.Create(testimonial)
	if err != nil {
		suite.T().Fatalf("Failed to create testimonial: %v", err)
	}

	createdTestimonial.Translations[0].Text = "Updated testimonial content"
	updatedTestimonial, err := suite.testimonialRepo.Update(createdTestimonial)
	if err != nil {
		suite.T().Fatalf("Failed to update testimonial: %v", err)
	}

	suite.Assert().NotNil(updatedTestimonial, "Expected updated testimonial to be non-nil")
	suite.Assert().Equal(createdTestimonial.Translations[0].Text, updatedTestimonial.Translations[0].Text, "Expected updated content to match")
}
