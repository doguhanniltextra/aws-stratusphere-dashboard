package ui

import (
	"fmt"
	"image/color"

	"fyne.io/fyne/v2"
	"fyne.io/fyne/v2/canvas"
	"fyne.io/fyne/v2/container"
	"fyne.io/fyne/v2/widget"

	"aws-terminal-sdk-v1/internal/models"
)

func CreateSecurityNetworkCard(network models.SecurityGroupInfo) fyne.CanvasObject {
	// Security Network Name or ID as title
	titleText := network.ID
	if network.Name != "" {
		titleText = network.Name
	}
	title := widget.NewLabelWithStyle(titleText, fyne.TextAlignLeading, fyne.TextStyle{Bold: true})
	title.Wrapping = fyne.TextWrapWord

	// Security Network ID (if different from title)
	var idLabel fyne.CanvasObject
	if network.Name != "" {
		shortened := shortenID(network.ID)
		idLabel = widget.NewLabelWithStyle("ID: "+shortened, fyne.TextAlignLeading, fyne.TextStyle{Italic: true})
	}

	// Status Indicator (Colored Dot)
	statusColor := color.RGBA{R: 200, G: 200, B: 200, A: 255} // Default Gray
	statusDot := canvas.NewCircle(statusColor)
	statusDot.Resize(fyne.NewSize(10, 10))

	statusBox := container.NewHBox(
		statusDot,
		widget.NewLabel(network.Name),
	)

	// Build content dynamically
	content := []fyne.CanvasObject{title}

	if idLabel != nil {
		content = append(content, idLabel)
	}

	content = append(content, statusBox)

	// Additional info (optional, show if exists)
	if network.Description != "" {
		content = append(content, createWrappingLabel("Description: "+network.Description))
	}
	if network.VPCID != "" {
		content = append(content, createWrappingLabel("VPC ID: "+network.VPCID))
	}

	if len(network.IngressRules) > 0 {
		content = append(content, createWrappingLabel("Ingress Rules: "+fmt.Sprintf("%d", len(network.IngressRules))))
	}

	if len(network.EgressRules) > 0 {
		content = append(content, createWrappingLabel("Egress Rules: "+fmt.Sprintf("%d", len(network.EgressRules))))
	}

	cardContent := container.NewVBox(content...)

	// Fyne Card Component
	card := widget.NewCard("", "", cardContent)
	return card
}

func CreateSubnetCard(subnet models.SubnetInfo) fyne.CanvasObject {
	// Subnet Name or ID as title
	titleText := subnet.ID
	if subnet.Name != "" {
		titleText = subnet.Name
	}
	title := widget.NewLabelWithStyle(titleText, fyne.TextAlignLeading, fyne.TextStyle{Bold: true})
	title.Wrapping = fyne.TextWrapWord

	// Subnet ID (if different from title)
	var idLabel fyne.CanvasObject
	if subnet.Name != "" {
		shortened := shortenID(subnet.ID)
		idLabel = widget.NewLabelWithStyle("ID: "+shortened, fyne.TextAlignLeading, fyne.TextStyle{Italic: true})
	}

	// Status Indicator (Colored Dot)
	statusColor := color.RGBA{R: 200, G: 200, B: 200, A: 255} // Default Gray
	statusDot := canvas.NewCircle(statusColor)
	statusDot.Resize(fyne.NewSize(10, 10))

	statusBox := container.NewHBox(
		statusDot,
		widget.NewLabel(subnet.State),
	)

	// Build content dynamically
	content := []fyne.CanvasObject{title}

	if idLabel != nil {
		content = append(content, idLabel)
	}

	content = append(content, statusBox)

	// Additional info (optional, show if exists)
	if subnet.CIDRBlock != "" {
		content = append(content, createWrappingLabel("CIDR: "+subnet.CIDRBlock))
	}
	if subnet.VPCID != "" {
		content = append(content, createWrappingLabel("VPC ID: "+subnet.VPCID))
	}
	if subnet.AvailabilityZone != "" {
		content = append(content, createWrappingLabel("Availability Zone: "+subnet.AvailabilityZone))
	}

	cardContent := container.NewVBox(content...)

	// Fyne Card Component
	card := widget.NewCard("", "", cardContent)
	return card
}

func CreateEC2Card(instance models.EC2InstanceInfo) fyne.CanvasObject {
	// EC2 Instance Name or ID as title
	titleText := instance.ID
	if instance.Name != "" {
		titleText = instance.Name
	}
	title := widget.NewLabelWithStyle(titleText, fyne.TextAlignLeading, fyne.TextStyle{Bold: true})
	title.Wrapping = fyne.TextWrapWord

	// EC2 Instance ID (if different from title)
	var idLabel fyne.CanvasObject
	if instance.Name != "" {
		shortened := shortenID(instance.ID)
		idLabel = widget.NewLabelWithStyle("ID: "+shortened, fyne.TextAlignLeading, fyne.TextStyle{Italic: true})
	}

	// Status Indicator (Colored Dot)
	statusColor := color.RGBA{R: 200, G: 200, B: 200, A: 255} // Default Gray
	statusDot := canvas.NewCircle(statusColor)
	statusDot.Resize(fyne.NewSize(10, 10))

	statusBox := container.NewHBox(
		statusDot,
		widget.NewLabel(instance.State),
	)

	// Build content dynamically
	content := []fyne.CanvasObject{title}

	if idLabel != nil {
		content = append(content, idLabel)
	}

	content = append(content,
		widget.NewSeparator(),
		createWrappingLabel("Instance Type: "+instance.InstanceType),
		createWrappingLabel("State: "+instance.State),
		createWrappingLabel("Image ID: "+instance.Name),
		createWrappingLabel("Public IP: "+instance.PublicIPAddress),
		createWrappingLabel("Private IP: "+instance.PrivateIPAddress),
		createWrappingLabel("Launch Time: "+instance.LaunchTime),
		createWrappingLabel("VPC ID: "+instance.VPCID),
		createWrappingLabel("Subnet ID: "+instance.SubnetID),
		statusBox,
	)

	// Additional info (optional, show if exists)
	if instance.InstanceType != "" && instance.InstanceType != "Not Found" {
		content = append(content, createWrappingLabel("Instance Type: "+instance.InstanceType))
	}
	if instance.Name != "" {
		// Show only last 4 digits of owner ID to save space
		ownerDisplay := instance.Name
		if len(ownerDisplay) > 6 {
			ownerDisplay = "..." + ownerDisplay[len(ownerDisplay)-4:]
		}
		ownerLabel := widget.NewLabel("Name: " + ownerDisplay)
		content = append(content, ownerLabel)
	}

	cardContent := container.NewVBox(content...)

	// Fyne Card Component
	card := widget.NewCard("", "", cardContent)
	return card
}

// CreateVPCCard creates a card widget for displaying VPC information
func CreateVPCCard(vpc models.VPCInfo) fyne.CanvasObject {
	// VPC Name or ID as title
	titleText := vpc.ID
	if vpc.Name != "" {
		titleText = vpc.Name
	}
	title := widget.NewLabelWithStyle(titleText, fyne.TextAlignLeading, fyne.TextStyle{Bold: true})
	title.Wrapping = fyne.TextWrapWord

	// VPC ID (if different from title)
	var idLabel fyne.CanvasObject
	if vpc.Name != "" {
		shortened := shortenID(vpc.ID)
		idLabel = widget.NewLabelWithStyle("ID: "+shortened, fyne.TextAlignLeading, fyne.TextStyle{Italic: true})
	}

	// Status Indicator (Colored Dot)
	statusColor := color.RGBA{R: 200, G: 200, B: 200, A: 255} // Default Gray
	if vpc.IsAvailable() {
		statusColor = color.RGBA{R: 46, G: 204, B: 113, A: 255} // Green
	}
	statusDot := canvas.NewCircle(statusColor)
	statusDot.Resize(fyne.NewSize(10, 10))

	statusBox := container.NewHBox(
		statusDot,
		widget.NewLabel(vpc.State),
	)

	// Build content dynamically
	content := []fyne.CanvasObject{title}

	if idLabel != nil {
		content = append(content, idLabel)
	}

	content = append(content,
		widget.NewSeparator(),
		createWrappingLabel("CIDR: "+vpc.CIDRBlock),
		statusBox,
	)

	// Add badges for Default/Main if applicable
	if vpc.IsDefault {
		content = append(content, widget.NewLabelWithStyle("✓ Default VPC", fyne.TextAlignLeading, fyne.TextStyle{Italic: true}))
	}

	// Additional info (optional, show if exists)
	if vpc.InstanceTenancy != "" && vpc.InstanceTenancy != "default" {
		content = append(content, createWrappingLabel("Tenancy: "+vpc.InstanceTenancy))
	}
	if vpc.OwnerId != "" {
		// Show only last 4 digits of owner ID to save space
		ownerDisplay := vpc.OwnerId
		if len(ownerDisplay) > 6 {
			ownerDisplay = "..." + ownerDisplay[len(ownerDisplay)-4:]
		}
		ownerLabel := widget.NewLabel("Owner: " + ownerDisplay)
		content = append(content, ownerLabel)
	}

	cardContent := container.NewVBox(content...)

	// Fyne Card Component
	card := widget.NewCard("", "", cardContent)
	return card
}

// createWrappingLabel creates a label with word wrapping enabled
func createWrappingLabel(text string) *widget.Label {
	label := widget.NewLabel(text)
	label.Wrapping = fyne.TextWrapWord
	return label
}

// shortenID shortens long AWS IDs to fit in cards (vpc-xxxxx... -> vpc-xxx...xxx)
func shortenID(id string) string {
	if len(id) <= 20 {
		return id
	}
	// Show first 12 and last 6 characters with ... in middle
	return id[:12] + "..." + id[len(id)-6:]
}
