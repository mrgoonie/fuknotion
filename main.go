package main

import (
	"embed"
	"log"

	"fuknotion/backend/app"

	"github.com/joho/godotenv"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Load .env file if it exists
	envErr := godotenv.Load()
	if envErr != nil {
		log.Printf("Warning: .env file not found or could not be loaded: %v", envErr)
	} else {
		log.Println(".env file loaded successfully")
	}

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
