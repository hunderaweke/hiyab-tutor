package domain

import "errors"

var (
	ErrNotFound       = errors.New("resource not found")
	ErrInvalidInput   = errors.New("invalid input")
	ErrUnauthorized   = errors.New("unauthorized")
	ErrInternalServer = errors.New("internal server error")
	ErrCreateFailed   = errors.New("failed to create resource")
	ErrUpdateFailed   = errors.New("failed to update resource")
	ErrDeleteFailed   = errors.New("failed to delete resource")
	ErrSearchFailed   = errors.New("failed to search resources")
	ErrDatabase       = errors.New("database error")
)
