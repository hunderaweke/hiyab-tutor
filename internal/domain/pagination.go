package domain

type Pagination struct {
	Page         int `json:"page"`
	Limit        int `json:"limit"`
	Offset       int `json:"offset"`
	Total        int `json:"total"`
	PreviousPage int `json:"previous_page"`
	NextPage     int `json:"next_page"`
}
