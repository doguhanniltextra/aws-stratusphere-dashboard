package core

import (
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// GenerateTerraform generates Terraform code from infrastructure resources
func (a *App) GenerateTerraform(resourcesJSON string) (string, error) {
	// Parse JSON
	var resources []map[string]interface{}
	if err := json.Unmarshal([]byte(resourcesJSON), &resources); err != nil {
		return "", fmt.Errorf("failed to parse resources: %w", err)
	}

	var output strings.Builder

	// Write provider configuration
	output.WriteString("terraform {\n")
	output.WriteString("  required_providers {\n")
	output.WriteString("    aws = {\n")
	output.WriteString("      source  = \"hashicorp/aws\"\n")
	output.WriteString("      version = \"~> 5.0\"\n")
	output.WriteString("    }\n")
	output.WriteString("  }\n")
	output.WriteString("}\n\n")
	output.WriteString("provider \"aws\" {\n")
	output.WriteString("  region = \"us-east-1\"\n")
	output.WriteString("}\n\n")

	// Generate resources in dependency order
	sortedResources := sortResourcesByDependency(resources)

	for _, resource := range sortedResources {
		resourceType, _ := resource["type"].(string)
		resourceID, _ := resource["id"].(string)
		properties, _ := resource["properties"].(map[string]interface{})

		switch resourceType {
		case "VPC":
			output.WriteString(generateVPC(resourceID, properties))
		case "Subnet":
			parentID, _ := resource["parent"].(string)
			output.WriteString(generateSubnet(resourceID, properties, parentID))
		case "EC2":
			parentID, _ := resource["parent"].(string)
			output.WriteString(generateEC2(resourceID, properties, parentID))
		case "RDS":
			parentID, _ := resource["parent"].(string)
			output.WriteString(generateRDS(resourceID, properties, parentID))
		case "S3":
			output.WriteString(generateS3(resourceID, properties))
		case "Lambda":
			output.WriteString(generateLambda(resourceID, properties))
		case "SecurityGroup":
			parentID, _ := resource["parent"].(string)
			output.WriteString(generateSecurityGroup(resourceID, properties, parentID))
		}
		output.WriteString("\n")
	}

	return output.String(), nil
}

// SaveTerraformFile prompts the user to save the Terraform content to a file
func (a *App) SaveTerraformFile(content string) (string, error) {
	// Open Save Dialog
	filename, err := runtime.SaveFileDialog(a.ctx, runtime.SaveDialogOptions{
		Title:           "Save Terraform File",
		DefaultFilename: "main.tf",
		Filters: []runtime.FileFilter{
			{
				DisplayName: "Terraform Files (*.tf)",
				Pattern:     "*.tf",
			},
		},
	})

	if err != nil {
		return "", err
	}

	if filename == "" {
		// User cancelled
		return "", nil
	}

	// Write file
	err = os.WriteFile(filename, []byte(content), 0644)
	if err != nil {
		return "", fmt.Errorf("failed to write file: %w", err)
	}

	return filename, nil
}

func sortResourcesByDependency(resources []map[string]interface{}) []map[string]interface{} {
	// Simple sort: resources without parents first, then their children
	var sorted []map[string]interface{}
	var remaining = make([]map[string]interface{}, len(resources))
	copy(remaining, resources)

	for len(remaining) > 0 {
		var added bool
		for i, resource := range remaining {
			parent, hasParent := resource["parent"].(string)
			if !hasParent || parent == "" {
				// No parent, add it
				sorted = append(sorted, resource)
				remaining = append(remaining[:i], remaining[i+1:]...)
				added = true
				break
			} else {
				// Check if parent is already in sorted
				parentExists := false
				for _, s := range sorted {
					if s["id"] == parent {
						parentExists = true
						break
					}
				}
				if parentExists {
					sorted = append(sorted, resource)
					remaining = append(remaining[:i], remaining[i+1:]...)
					added = true
					break
				}
			}
		}
		if !added && len(remaining) > 0 {
			// Deadlock, just add first one
			sorted = append(sorted, remaining[0])
			remaining = remaining[1:]
		}
	}

	return sorted
}

func generateVPC(id string, props map[string]interface{}) string {
	name, _ := props["name"].(string)
	cidr, _ := props["cidr_block"].(string)
	dnsHostnames, _ := props["enable_dns_hostnames"].(bool)

	safeName := strings.ReplaceAll(name, "-", "_")

	return fmt.Sprintf(`resource "aws_vpc" "%s" {
  cidr_block           = "%s"
  enable_dns_hostnames = %t

  tags = {
    Name = "%s"
  }
}
`, safeName, cidr, dnsHostnames, name)
}

func generateSubnet(id string, props map[string]interface{}, parentID string) string {
	name, _ := props["name"].(string)
	cidr, _ := props["cidr_block"].(string)
	az, _ := props["availability_zone"].(string)
	mapPublicIP, _ := props["map_public_ip_on_launch"].(bool)

	safeName := strings.ReplaceAll(name, "-", "_")

	return fmt.Sprintf(`resource "aws_subnet" "%s" {
  vpc_id                  = aws_vpc.%s.id
  cidr_block              = "%s"
  availability_zone       = "%s"
  map_public_ip_on_launch = %t

  tags = {
    Name = "%s"
  }
}
`, safeName, strings.ReplaceAll(parentID, "-", "_"), cidr, az, mapPublicIP, name)
}

func generateEC2(id string, props map[string]interface{}, parentID string) string {
	name, _ := props["name"].(string)
	instanceType, _ := props["instance_type"].(string)
	ami, _ := props["ami"].(string)

	safeName := strings.ReplaceAll(name, "-", "_")

	return fmt.Sprintf(`resource "aws_instance" "%s" {
  ami           = "%s"
  instance_type = "%s"
  subnet_id     = aws_subnet.%s.id

  tags = {
    Name = "%s"
  }
}
`, safeName, ami, instanceType, strings.ReplaceAll(parentID, "-", "_"), name)
}

func generateRDS(id string, props map[string]interface{}, parentID string) string {
	name, _ := props["name"].(string)
	engine, _ := props["engine"].(string)
	instanceClass, _ := props["instance_class"].(string)

	safeName := strings.ReplaceAll(name, "-", "_")

	return fmt.Sprintf(`resource "aws_db_instance" "%s" {
  identifier     = "%s"
  engine         = "%s"
  instance_class = "%s"
  db_subnet_group_name = aws_db_subnet_group.%s_subnet_group.name
  skip_final_snapshot  = true

  tags = {
    Name = "%s"
  }
}
`, safeName, name, engine, instanceClass, safeName, name)
}

func generateS3(id string, props map[string]interface{}) string {
	bucketName, _ := props["bucket_name"].(string)
	versioning, _ := props["versioning"].(bool)

	safeName := strings.ReplaceAll(bucketName, "-", "_")

	versioningBlock := ""
	if versioning {
		versioningBlock = `
  versioning {
    enabled = true
  }
`
	}

	return fmt.Sprintf(`resource "aws_s3_bucket" "%s" {
  bucket = "%s"%s

  tags = {
    Name = "%s"
  }
}
`, safeName, bucketName, versioningBlock, bucketName)
}

func generateLambda(id string, props map[string]interface{}) string {
	functionName, _ := props["function_name"].(string)
	runtime, _ := props["runtime"].(string)
	memorySize, _ := props["memory_size"].(string)

	safeName := strings.ReplaceAll(functionName, "-", "_")

	return fmt.Sprintf(`resource "aws_lambda_function" "%s" {
  function_name = "%s"
  runtime       = "%s"
  memory_size   = %s
  handler       = "index.handler"
  role          = aws_iam_role.%s_role.arn
  filename      = "function.zip"

  tags = {
    Name = "%s"
  }
}
`, safeName, functionName, runtime, memorySize, safeName, functionName)
}

func generateSecurityGroup(id string, props map[string]interface{}, parentID string) string {
	name, _ := props["name"].(string)
	description, _ := props["description"].(string)

	safeName := strings.ReplaceAll(name, "-", "_")

	return fmt.Sprintf(`resource "aws_security_group" "%s" {
  name        = "%s"
  description = "%s"
  vpc_id      = aws_vpc.%s.id

  tags = {
    Name = "%s"
  }
}
`, safeName, name, description, strings.ReplaceAll(parentID, "-", "_"), name)
}
