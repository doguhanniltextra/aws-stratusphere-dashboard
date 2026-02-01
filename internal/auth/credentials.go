package auth

import (
	"aws-terminal-sdk-v1/internal/models"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"io"
	"os"
	"path/filepath"
	"runtime"
)

// AWSCredentials stores AWS authentication information

// GetCredentialsPath returns the path to the credentials file
func GetCredentialsPath() (string, error) {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return "", err
	}

	credDir := filepath.Join(homeDir, ".stratusphere")
	if err := os.MkdirAll(credDir, 0700); err != nil {
		return "", err
	}

	return filepath.Join(credDir, "credentials.enc"), nil
}

// GetMachineID generates a machine-specific identifier for encryption
func GetMachineID() string {
	// Use hostname + OS as machine identifier
	hostname, _ := os.Hostname()
	machineID := hostname + runtime.GOOS + runtime.GOARCH

	// Hash it for consistent length
	hash := sha256.Sum256([]byte(machineID))
	return string(hash[:32])
}

func EncryptCredentials(data []byte) ([]byte, error) {
	key := []byte(GetMachineID())

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	// Create GCM mode
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	// Generate nonce
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, err
	}

	// Encrypt and prepend nonce
	ciphertext := gcm.Seal(nonce, nonce, data, nil)
	return ciphertext, nil
}

func DecryptCredentials(data []byte) ([]byte, error) {
	key := []byte(GetMachineID())

	block, err := aes.NewCipher(key)
	if err != nil {
		return nil, err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return nil, err
	}

	nonceSize := gcm.NonceSize()
	if len(data) < nonceSize {
		return nil, errors.New("ciphertext too short")
	}

	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return nil, err
	}

	return plaintext, nil
}

func SaveCredentials(creds *models.AWSCredentials) error {
	data, err := json.Marshal(creds)
	if err != nil {
		return err
	}

	// Encrypt
	encrypted, err := EncryptCredentials(data)
	if err != nil {
		return err
	}

	// Get credentials path
	credPath, err := GetCredentialsPath()
	if err != nil {
		return err
	}

	return os.WriteFile(credPath, encrypted, 0600)
}

func LoadCredentials() (*models.AWSCredentials, error) {
	credPath, err := GetCredentialsPath()
	if err != nil {
		return nil, err
	}

	// Read encrypted file
	encrypted, err := os.ReadFile(credPath)
	if err != nil {
		return nil, err
	}

	// Decrypt
	decrypted, err := DecryptCredentials(encrypted)
	if err != nil {
		return nil, err
	}

	// Unmarshal JSON
	var creds models.AWSCredentials
	if err := json.Unmarshal(decrypted, &creds); err != nil {
		return nil, err
	}

	return &creds, nil
}

func CredentialsExist() bool {
	credPath, err := GetCredentialsPath()
	if err != nil {
		return false
	}

	_, err = os.Stat(credPath)
	return err == nil
}

func DeleteCredentials() error {
	credPath, err := GetCredentialsPath()
	if err != nil {
		return err
	}

	return os.Remove(credPath)
}
