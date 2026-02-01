package config

import (
	"aws-terminal-sdk-v1/internal/core"

	"context"

	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

type WailsConfig struct {
	Title            string
	Width            int
	Height           int
	AssetServer      *assetserver.Options
	BackgroundColour *options.RGBA
	OnStartup        func(context.Context)
	Bind             []interface{}
}

func NewWailsConfig(app *core.App) *WailsConfig {
	title, width, height := GetWailsParameters()
	return &WailsConfig{
		Title:            title,
		Width:            width,
		Height:           height,
		AssetServer:      &assetserver.Options{},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		OnStartup:        app.Startup,
		Bind:             []interface{}{app},
	}
}

func ConvertWailsConfigToOptions(wailsConfig *WailsConfig) *options.App {
	return &options.App{
		Title:            wailsConfig.Title,
		Width:            wailsConfig.Width,
		Height:           wailsConfig.Height,
		AssetServer:      wailsConfig.AssetServer,
		BackgroundColour: wailsConfig.BackgroundColour,
		OnStartup:        wailsConfig.OnStartup,
		Bind:             wailsConfig.Bind,
	}
}
