package main

import (
	"embed"
	"log"

	"fuknotion/backend/internal/app"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

// Note: Wails will handle asset embedding during build
// For now, we'll use a simple initialization
var assets embed.FS

func main() {
	// Create an instance of the app structure
	myApp := app.NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "Fuknotion",
		Width:  1200,
		Height: 800,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 255, G: 255, B: 255, A: 255},
		OnStartup:        myApp.Startup,
		OnShutdown:       myApp.Shutdown,
		Bind: []interface{}{
			myApp,
		},
	})

	if err != nil {
		log.Fatal("Error:", err)
	}
}
