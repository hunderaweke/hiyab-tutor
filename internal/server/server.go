package server

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"hiyab-tutor/internal/config"
	"hiyab-tutor/internal/database"
)

type Server struct {
	port int

	DB database.Service
}

func NewServer() *http.Server {
	c, err := config.LoadConfig()
	if err != nil {
		panic("Failed to load config")
	}
	port, _ := strconv.Atoi(c.ServerPort)
	NewServer := &Server{
		port: port,

		DB: database.New(),
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
