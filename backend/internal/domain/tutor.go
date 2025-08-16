package domain

type Tutor struct {
	Model
	FirstName      string `form:"first_name" json:"first_name,omitempty"`
	LastName       string `form:"last_name" json:"last_name,omitempty"`
	EducationLevel string `form:"education_level" json:"education_level,omitempty"`
	Document       string `json:"document,omitempty"`
	Image          string `json:"image,omitempty"`
	PhoneNumber    string `form:"phone_number" json:"phone_number,omitempty"`
	DayPerWeek     int    `form:"day_per_week" json:"day_per_week,omitempty"`
	HrPerDay       int    `form:"hr_per_day" json:"hr_per_day,omitempty"`
	Verified       bool   `form:"verified" json:"verified,omitempty"`
	Email          string `form:"email" json:"email,omitempty"`
	Address        string `form:"address" json:"address"`
}

type TutorFilter struct {
	EducationLevel string
	MinDayPerWeek  int
	MaxDayPerWeek  int
	Verified       bool
	Query          string
	MinHrPerDay    int
	MaxHrPerDay    int
	// Pagination & sorting
	Page      int
	Limit     int
	SortBy    string
	SortOrder string
}

type MultipleTutorResponse struct {
	Data       []Tutor    `json:"data,omitempty"`
	Pagination Pagination `json:"pagination,omitempty"`
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
