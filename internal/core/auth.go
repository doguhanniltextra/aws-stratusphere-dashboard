package core

import (
	"errors"

	"aws-terminal-sdk-v1/internal/auth"
	"aws-terminal-sdk-v1/internal/models"
)

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

	creds := &models.AWSCredentials{
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

	creds := &models.AWSCredentials{
		AccessKeyID:     accessKey,
		SecretAccessKey: secretKey,
		Region:          region,
	}

	// Try to initialize a temporary client
	_, err := a.initializeAWSClient(a.ctx, creds)
	return err
}
