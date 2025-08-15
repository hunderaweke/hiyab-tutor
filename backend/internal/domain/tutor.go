package domain

type Tutor struct {
	Model
	FullName       string `form:"full_name" json:"full_name,omitempty"`
	EducationLevel string `form:"education_level" json:"education_level,omitempty"`
	Document       string `json:"document,omitempty"`
	PhoneNumber    string `form:"phone_number" json:"phone_number,omitempty"`
	DayPerWeek     int    `form:"day_per_week" json:"day_per_week,omitempty"`
	HrPerDay       int    `form:"hr_per_day" json:"hr_per_day,omitempty"`
	Verified       bool   `form:"verified" json:"verified,omitempty"`
	Email          string `form:"email" json:"email,omitempty"`
}

type TutorFilter struct {
	EducationLevel string
	MinDayPerWeek  int
	MaxDayPerWeek  int
	Verified       bool
	Query          string
	MinHrPerDay    int
	MaxHrPerDay    int
}

type MultipleTutorResponse struct {
	Data       []Tutor
	Pagination Pagination
}

type TutorRepository interface {
	Create(*Tutor) (*Tutor, error)
	GetAll(*TutorFilter) (MultipleTutorResponse, error)
	GetByID(uint) (*Tutor, error)
	Update(uint, *Tutor) (*Tutor, error)
	Delete(uint) error
}
type TutorUsecase interface {
	Create(*Tutor) (*Tutor, error)
	GetAll(*TutorFilter) (MultipleTutorResponse, error)
	GetByID(uint) (*Tutor, error)
	Update(uint, *Tutor) (*Tutor, error)
	Delete(uint) error
	Verify(uint) error
}
