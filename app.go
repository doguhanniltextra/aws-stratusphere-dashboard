package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"strings"

	"aws-terminal-sdk-v1/internal/auth"
	"aws-terminal-sdk-v1/internal/aws"
	"aws-terminal-sdk-v1/internal/models"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// AWSClient defines the interface for the AWS client wrapper
type AWSClient interface {
	FetchVPCs(ctx context.Context) ([]models.VPCInfo, error)
	FetchEC2Instances(ctx context.Context) ([]models.EC2InstanceInfo, error)
	FetchECSClusters(ctx context.Context) ([]models.ECSClusterInfo, error)
	FetchSubnets(ctx context.Context) ([]models.SubnetInfo, error)
	FetchSecurityGroups(ctx context.Context) ([]models.SecurityGroupInfo, error)
	FetchNATGateways(ctx context.Context) ([]models.NATGatewayInfo, error)
	FetchRouteTables(ctx context.Context) ([]models.RouteTableInfo, error)
	FetchS3Buckets(ctx context.Context) ([]models.S3BucketInfo, error)
	FetchTargetGroups(ctx context.Context) ([]models.TargetGroupInfo, error)
	FetchLoadBalancers(ctx context.Context) ([]models.LoadBalancerInfo, error)
	FetchElasticIPs(ctx context.Context) ([]models.ElasticIPInfo, error)
	FetchLambdaFunctions(ctx context.Context) ([]models.LambdaFunctionInfo, error)
	FetchRDSInstances(ctx context.Context) ([]models.RDSInstanceInfo, error)
	FetchConfiguration(ctx context.Context) (models.ConfigurationInfo, error)
	VerifyPermissions(ctx context.Context) ([]models.PermissionStatus, error)
}

// App struct
type App struct {
	ctx       context.Context
	awsClient AWSClient
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// Check if credentials exist before initializing AWS client
	if !auth.CredentialsExist() {
		slog.Warn("No credentials found - user will need to configure")
		return
	}

	// Load credentials and initialize AWS client
	creds, err := auth.LoadCredentials()
	if err != nil {
		slog.Error("Failed to load credentials", "error", err)
		return
	}

	// Initialize AWS client with loaded credentials
	client, err := a.initializeAWSClient(ctx, creds)
	if err != nil {
		slog.Error("Failed to initialize AWS client", "error", err)
		return
	}
	a.awsClient = client
}

// GetVPCs returns the list of VPCs from AWS
func (a *App) GetVPCs() ([]models.VPCInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchVPCs(context.Background())
}

// GetEC2Instances returns the list of EC2 instances from AWS
func (a *App) GetEC2Instances() ([]models.EC2InstanceInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchEC2Instances(context.Background())
}

// GetECSClusters returns the list of ECS clusters from AWS
func (a *App) GetECSClusters() ([]models.ECSClusterInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchECSClusters(context.Background())
}

// GetSubnets returns the list of Subnets from AWS
func (a *App) GetSubnets() ([]models.SubnetInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchSubnets(context.Background())
}

// GetSecurityGroups returns the list of Security Groups from AWS
func (a *App) GetSecurityGroups() ([]models.SecurityGroupInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchSecurityGroups(context.Background())
}

// GetNATGateways returns the list of NAT Gateways from AWS
func (a *App) GetNATGateways() ([]models.NATGatewayInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchNATGateways(context.Background())
}

// GetRouteTables returns the list of Route Tables from AWS
func (a *App) GetRouteTables() ([]models.RouteTableInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchRouteTables(context.Background())
}

// GetS3Buckets returns the list of S3 Buckets from AWS
func (a *App) GetS3Buckets() ([]models.S3BucketInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchS3Buckets(context.Background())
}

// GetTargetGroups returns the list of Target Groups from AWS
func (a *App) GetTargetGroups() ([]models.TargetGroupInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchTargetGroups(context.Background())
}

// GetLoadBalancers returns the list of Load Balancers from AWS
func (a *App) GetLoadBalancers() ([]models.LoadBalancerInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchLoadBalancers(context.Background())
}

// GetElasticIPs returns the list of Elastic IPs from AWS
func (a *App) GetElasticIPs() ([]models.ElasticIPInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	return a.awsClient.FetchElasticIPs(context.Background())
}

func (a *App) GetLambdaFunctions() ([]models.LambdaFunctionInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}
	return a.awsClient.FetchLambdaFunctions(context.Background())
}

func (a *App) GetRDSInstances() ([]models.RDSInstanceInfo, error) {
	if a.awsClient == nil {
		return nil, nil
	}
	return a.awsClient.FetchRDSInstances(context.Background())
}

func (a *App) GetConfiguration() (models.ConfigurationInfo, error) {
	if a.awsClient == nil {
		return models.ConfigurationInfo{}, nil
	}
	return a.awsClient.FetchConfiguration(context.Background())
}

// CheckCredentials checks if AWS credentials are configured
func (a *App) CheckCredentials() bool {
	return auth.CredentialsExist()
}

// Logout deletes stored credentials and resets the AWS client
func (a *App) Logout() error {
	// Delete credentials file
	if err := auth.DeleteCredentials(); err != nil {
		return err
	}

	// Reset AWS client
	a.awsClient = nil

	return nil
}

// SaveAWSCredentials saves AWS credentials to encrypted file
func (a *App) SaveAWSCredentials(accessKey, secretKey, region string) error {
	if accessKey == "" || secretKey == "" || region == "" {
		return errors.New("all fields are required")
	}

	creds := &auth.AWSCredentials{
		AccessKeyID:     accessKey,
		SecretAccessKey: secretKey,
		Region:          region,
	}

	if err := auth.SaveCredentials(creds); err != nil {
		return err
	}

	// Initialize AWS client with new credentials
	client, err := a.initializeAWSClient(a.ctx, creds)
	if err != nil {
		// Rollback - delete saved credentials if client init fails
		auth.DeleteCredentials()
		return err
	}

	a.awsClient = client
	return nil
}

// TestAWSConnection tests if AWS credentials are valid
func (a *App) TestAWSConnection(accessKey, secretKey, region string) error {
	if accessKey == "" || secretKey == "" || region == "" {
		return errors.New("all fields are required")
	}

	creds := &auth.AWSCredentials{
		AccessKeyID:     accessKey,
		SecretAccessKey: secretKey,
		Region:          region,
	}

	// Try to initialize a temporary client
	_, err := a.initializeAWSClient(a.ctx, creds)
	return err
}

// initializeAWSClient creates an AWS client with given credentials
func (a *App) initializeAWSClient(ctx context.Context, creds *auth.AWSCredentials) (AWSClient, error) {
	// Create AWS config with static credentials
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(creds.Region),
		config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
			creds.AccessKeyID,
			creds.SecretAccessKey,
			"",
		)),
	)
	if err != nil {
		return nil, err
	}

	// Create and return AWS client
	return aws.NewClientWithConfig(ctx, cfg)
}

// VerifyPermissions checks if the current user has the required permissions
func (a *App) VerifyPermissions() ([]models.PermissionStatus, error) {
	if a.awsClient == nil {
		return nil, nil
	}
	return a.awsClient.VerifyPermissions(context.Background())
}

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
