package main

import (
	"aws-terminal-sdk-v1/internal/logger"
	"embed"
	"log"
	"log/slog"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Setup logger
	if err := logger.Setup(); err != nil {
		log.Fatalf("Failed to setup logger: %v", err)
	}
	slog.Info("Starting Stratusphere application")

	// Panic recovery
	defer func() {
		if r := recover(); r != nil {
			slog.Error("Application panic recovered", "error", r)
		}
	}()

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Stratusphere",
		Width:  1400,
		Height: 900,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app,
		},
	})

	if err != nil {
		slog.Error("Error starting application", "error", err)
		log.Fatal("Error:", err.Error())
	}
}
