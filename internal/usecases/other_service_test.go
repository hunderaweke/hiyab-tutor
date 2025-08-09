package usecases

import (
	"hiyab-tutor/internal/domain"
	"testing"
)

func TestAddOtherServiceTranslation(t *testing.T) {
	mockRepo := &domain.OtherServiceRepositoryMock{
		UpdateFunc: func(service *domain.OtherService) (*domain.OtherService, error) {
			return service, nil
		},
		GetByIDFunc: func(id uint, languageCodes []string) (*domain.OtherService, error) {
			return &domain.OtherService{
				Model: domain.Model{
					ID: id,
				},
			}, nil
		},
	}
	service := &otherServiceService{repo: mockRepo}
	translation := &domain.OtherServiceTranslation{
		LanguageCode: "fr",
		Name:         "Service Test",
		Description:  "Ceci est un service de test",
		TagLine:      "Slogan de test",
	}
	serviceID := uint(1)
	updatedService, err := service.AddTranslation(serviceID, translation)
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(updatedService.Translations) != 1 {
		t.Fatalf("expected 1 translation, got %d", len(updatedService.Translations))
	}
	if updatedService.Translations[0].LanguageCode != translation.LanguageCode {
		t.Fatalf("expected language code %q, got %q", translation.LanguageCode, updatedService.Translations[0].LanguageCode)
	}
	if updatedService.Translations[0].Name != translation.Name {
		t.Fatalf("expected name %q, got %q", translation.Name, updatedService.Translations[0].Name)
	}
	if updatedService.Translations[0].Description != translation.Description {
		t.Fatalf("expected description %q, got %q", translation.Description, updatedService.Translations[0].Description)
	}
	if updatedService.Translations[0].TagLine != translation.TagLine {
		t.Fatalf("expected tagline %q, got %q", translation.TagLine, updatedService.Translations[0].TagLine)
	}
}
