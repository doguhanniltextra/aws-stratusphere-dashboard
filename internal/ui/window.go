package ui

import (
	"context"
	"fmt"

	"fyne.io/fyne/v2"

	"aws-terminal-sdk-v1/internal/aws"
	"aws-terminal-sdk-v1/internal/models"
)

// WindowManager manages the application window and UI state
type WindowManager struct {
	window     fyne.Window
	components *LayoutComponents
	awsClient  *aws.Client
}

// NewWindowManager creates a new window manager
func NewWindowManager(app fyne.App, awsClient *aws.Client) *WindowManager {
	window := app.NewWindow("Stratusphere")
	window.Resize(fyne.NewSize(1000, 700))

	wm := &WindowManager{
		window:    window,
		awsClient: awsClient,
	}

	// Build UI components with refresh callback
	wm.components = BuildMainLayout(wm.RefreshData)

	// Assemble and set content
	window.SetContent(AssembleLayout(wm.components))

	return wm
}

// RefreshData fetches AWS data and updates the UI
func (wm *WindowManager) RefreshData() {
	// Clear old cards
	wm.components.ContentGrid.Objects = nil
	wm.components.ContentGrid.Refresh()

	// Show loading state
	wm.components.ProgressBar.Show()
	wm.components.StatusLabel.SetText("Connecting to AWS...")

	// Fetch data in background
	go func() {
		ctx := context.Background()
		vpcs, err := wm.awsClient.FetchVPCs(ctx)

		// Update UI on main thread
		fyne.Do(func() {
			wm.components.ProgressBar.Hide()

			if err != nil {
				wm.handleError(err)
				return
			}

			wm.displayVPCs(vpcs)
		})
	}()
}

// handleError displays error information in the UI
func (wm *WindowManager) handleError(err error) {
	wm.components.StatusLabel.SetText("Data fetch error!")
	errorCard := NewErrorCard("Error", err.Error())
	wm.components.ContentGrid.Add(errorCard)
	wm.components.ContentGrid.Refresh()
}

// displayVPCs populates the UI with VPC cards
func (wm *WindowManager) displayVPCs(vpcs []models.VPCInfo) {
	wm.components.StatusLabel.SetText(fmt.Sprintf("%d VPC(s) found and listed.", len(vpcs)))

	// Create a card for each VPC and add to grid
	for _, vpc := range vpcs {
		card := CreateVPCCard(vpc)
		wm.components.ContentGrid.Add(card)
	}
	wm.components.ContentGrid.Refresh()
}

// Show displays the window
func (wm *WindowManager) Show() {
	wm.window.Show()
}

// ShowAndRun displays the window and runs the application
func (wm *WindowManager) ShowAndRun() {
	// Fetch data on startup
	wm.RefreshData()
	wm.window.ShowAndRun()
}
