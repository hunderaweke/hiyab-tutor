package domain

type Booking struct {
	Model
	FirstName   string `json:"first_name"`
	LastName    string `json:"last_name"`
	Gender      string `json:"gender"`
	Grade       int    `json:"grade"`
	Address     string `json:"address"`
	PhoneNumber string `json:"phone_number"`
	DayPerWeek  int    `json:"day_per_week"`
	HrPerDay    int    `json:"hr_per_day"`
	Assigned    bool   `json:"assigned"`
	Age         int    `json:"age"`
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
	// Pagination & sorting
	Page      int
	Limit     int
	SortBy    string
	SortOrder string
}
type BookingRepository interface {
	Create(*Booking) (*Booking, error)
	GetAll(*BookingFilter) (MultipleBookingResponse, error)
	GetByID(uint) (*Booking, error)
	Update(uint, *Booking) (*Booking, error)
	Delete(uint) error
}
type BookingUsecase interface {
	Create(*Booking) (*Booking, error)
	GetAll(*BookingFilter) (MultipleBookingResponse, error)
	GetByID(uint) (*Booking, error)
	Update(uint, *Booking) (*Booking, error)
	Delete(uint) error
	Assign(uint) error
}

type MultipleBookingResponse struct {
	Data       []Booking  `json:"data,omitempty"`
	Pagination Pagination `json:"pagination,omitempty"`
}
