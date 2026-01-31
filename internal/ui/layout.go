package ui

import (
	"fmt"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/layout"
	"fyne.io/fyne/v2/theme"
	"fyne.io/fyne/v2/widget"
)

// LayoutComponents holds all the UI components for the main layout
type LayoutComponents struct {
	ContentGrid   *fyne.Container
	ContentScroll *container.Scroll
	ProgressBar   *widget.ProgressBarInfinite
	StatusLabel   *widget.Label
	Toolbar       *widget.Toolbar
	Sidebar       *fyne.Container
}

// BuildMainLayout creates and returns all the UI components for the application
func BuildMainLayout(onRefresh func()) *LayoutComponents {
	// Content area where VPC cards will be displayed
	contentGrid := container.NewGridWrap(fyne.NewSize(420, 200))
	contentScroll := container.NewVScroll(container.NewPadded(contentGrid))

	// Loading Progress Bar
	progressBar := widget.NewProgressBarInfinite()
	progressBar.Hide()

	// Status Label
	statusLabel := widget.NewLabel("System Ready")
	statusLabel.TextStyle = fyne.TextStyle{Italic: true}

	// Toolbar (Top Bar)
	toolbar := widget.NewToolbar(
		widget.NewToolbarAction(theme.ViewRefreshIcon(), onRefresh),
		widget.NewToolbarSpacer(),
		widget.NewToolbarAction(theme.SettingsIcon(), func() {
			fmt.Println("Settings clicked")
		}),
	)

	// Sidebar (Left Menu)
	sidebar := container.NewVBox(
		widget.NewLabelWithStyle("MENU", fyne.TextAlignCenter, fyne.TextStyle{Bold: true}),
		widget.NewButtonWithIcon("Dashboard", theme.HomeIcon(), func() {}),
		widget.NewButtonWithIcon("VPC List", theme.StorageIcon(), func() {}),
		widget.NewButtonWithIcon("EC2 Instances", theme.ComputerIcon(), func() {}),
		layout.NewSpacer(),
		widget.NewLabel("v1.0.0"),
	)

	return &LayoutComponents{
		ContentGrid:   contentGrid,
		ContentScroll: contentScroll,
		ProgressBar:   progressBar,
		StatusLabel:   statusLabel,
		Toolbar:       toolbar,
		Sidebar:       sidebar,
	}
}

// AssembleLayout assembles all components into the final layout
func AssembleLayout(components *LayoutComponents) fyne.CanvasObject {
	sidebarContainer := container.NewPadded(components.Sidebar)

	// Border Layout: Top Toolbar, Left Sidebar, Center Scrollable Content, Bottom Status
	mainLayout := container.NewBorder(
		container.NewVBox(components.Toolbar, components.ProgressBar), // Top
		components.StatusLabel,   // Bottom
		sidebarContainer,         // Left
		nil,                      // Right
		components.ContentScroll, // Center
	)

	return mainLayout
}
