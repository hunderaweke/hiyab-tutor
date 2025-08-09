package usecases

import (
	"hiyab-tutor/internal/domain"
	"testing"
)

func TestAddTestimonialTranslation(t *testing.T) {
	mockRepo := &domain.TestimonialRepositoryMock{
		UpdateFunc: func(testimonial *domain.Testimonial) (*domain.Testimonial, error) {
			return testimonial, nil
		},
		GetByIDFunc: func(id uint, languageCodes []string) (*domain.Testimonial, error) {
			return &domain.Testimonial{
				Model: domain.Model{
					ID: id,
				},
			}, nil
		},
	}
	service := &testimonialService{repo: mockRepo}
	translation := &domain.TestimonialTranslation{
		LanguageCode: "fr",
		Text:         "Ceci est un témoignage.",
	}
	testimonialID := uint(1)
	updatedTestimonial, err := service.AddTranslation(testimonialID, translation)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(updatedTestimonial.Translations) != 1 {
		t.Fatalf("expected 1 translation, got %d", len(updatedTestimonial.Translations))
	}
	if updatedTestimonial.Translations[0].LanguageCode != translation.LanguageCode {
		t.Fatalf("expected language code %q, got %q", translation.LanguageCode, updatedTestimonial.Translations[0].LanguageCode)
	}
	if updatedTestimonial.Translations[0].Text != translation.Text {
		t.Fatalf("expected text %q, got %q", translation.Text, updatedTestimonial.Translations[0].Text)
	}
}
