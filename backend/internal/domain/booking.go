package domain

type Booking struct {
	Model
	FullName    string `json:"full_name,omitempty"`
	Gender      string `json:"gender,omitempty"`
	Grade       int    `json:"grade,omitempty"`
	Address     string `json:"address,omitempty"`
	PhoneNumber string `json:"phone_number,omitempty"`
	DayPerWeek  int    `json:"day_per_week,omitempty"`
	HrPerDay    int    `json:"hr_per_day,omitempty"`
	Assigned    bool   `json:"assigned,omitempty"`
}

type BookingFilter struct {
	Gender        string
	MinGrade      int
	MaxGrade      int
	Address       string
	Query         string
	Assigned      bool
	MinDayPerWeek int
	MaxDayPerWeek int
	MinHrPerDay   int
	MaxHrPerDay   int
}
type BookingRepository interface {
	Create(*Booking) (*Booking, error)
	GetAll(*BookingFilter) ([]*Booking, error)
	GetByID(uint) (*Booking, error)
	Update(uint, *Booking) (*Booking, error)
	Delete(uint) error
}
type BookingUsecase interface {
	Create(*Booking) (*Booking, error)
	GetAll(*BookingFilter) ([]*Booking, error)
	GetByID(uint) (*Booking, error)
	Update(uint, *Booking) (*Booking, error)
	Delete(uint) error
	Assign(uint) error
}
