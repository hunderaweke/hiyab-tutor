package server

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"hiyab-tutor/internal/database"
)

type Server struct {
	port int

	DB database.Service
}

func NewServer() *http.Server {
	port, _ := strconv.Atoi(os.Getenv("SERVER_PORT"))
	newServer := &Server{
		port: port,

		DB: database.New(),
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", newServer.port),
		Handler:      newServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
