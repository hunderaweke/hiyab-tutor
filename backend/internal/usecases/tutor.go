package usecases

import "hiyab-tutor/internal/domain"

type tutorUsecase struct {
	repo domain.TutorRepository
}

func NewTutorUsecase(repo domain.TutorRepository) domain.TutorUsecase {
	return &tutorUsecase{repo: repo}
}

func (u *tutorUsecase) Create(t *domain.Tutor) (*domain.Tutor, error) {
	if t == nil {
		return nil, domain.ErrInvalidInput
	}
	if t.FullName == "" || t.EducationLevel == "" || t.Email == "" {
		return nil, domain.ErrInvalidInput
	}
	return u.repo.Create(t)
}

func (u *tutorUsecase) GetAll(filter *domain.TutorFilter) (domain.MultipleTutorResponse, error) {
	if filter == nil {
		filter = &domain.TutorFilter{}
	}
	return u.repo.GetAll(filter)
}

func (u *tutorUsecase) GetByID(id uint) (*domain.Tutor, error) {
	if id == 0 {
		return nil, domain.ErrInvalidInput
	}
	return u.repo.GetByID(id)
}

func (u *tutorUsecase) Update(id uint, t *domain.Tutor) (*domain.Tutor, error) {
	if id == 0 || t == nil {
		return nil, domain.ErrInvalidInput
	}
	return u.repo.Update(id, t)
}

func (u *tutorUsecase) Delete(id uint) error {
	if id == 0 {
		return domain.ErrInvalidInput
	}
	return u.repo.Delete(id)
}

func (u *tutorUsecase) Verify(id uint) error {
	if id == 0 {
		return domain.ErrInvalidInput
	}
	tutor, err := u.repo.GetByID(id)
	if err != nil {
		return err
	}
	tutor.Verified = true
	_, err = u.repo.Update(id, tutor)
	return err
}
