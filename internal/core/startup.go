package core

import (
	"context"
	"log/slog"

	"aws-terminal-sdk-v1/internal/auth"
	"aws-terminal-sdk-v1/internal/aws"
	"aws-terminal-sdk-v1/internal/models"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
)

// Startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
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

// initializeAWSClient creates an AWS client with given credentials
func (a *App) initializeAWSClient(ctx context.Context, creds *models.AWSCredentials) (AWSClient, error) {
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
