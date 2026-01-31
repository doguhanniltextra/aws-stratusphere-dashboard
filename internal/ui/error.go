package ui

import "fyne.io/fyne/v2/widget"

// NewErrorCard creates an error card widget
func NewErrorCard(title, message string) *widget.Card {
	return widget.NewCard(title, message, nil)
}
