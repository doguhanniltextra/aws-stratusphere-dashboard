package core

import (
	"context"
)

// App struct
type App struct {
	ctx       context.Context
	awsClient AWSClient
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}
