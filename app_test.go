package main

import (
	"context"
	"errors"
	"testing"

	"aws-terminal-sdk-v1/internal/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockAWSClient is a mock of AWSClient interface
type MockAWSClient struct {
	mock.Mock
}

func (m *MockAWSClient) FetchVPCs(ctx context.Context) ([]models.VPCInfo, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.VPCInfo), args.Error(1)
}

func (m *MockAWSClient) FetchEC2Instances(ctx context.Context) ([]models.EC2InstanceInfo, error) {
	args := m.Called(ctx)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).([]models.EC2InstanceInfo), args.Error(1)
}

// ... Implement other methods as needed for compilation (Go interfaces need full implementation)
func (m *MockAWSClient) FetchECSClusters(ctx context.Context) ([]models.ECSClusterInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.ECSClusterInfo), args.Error(1)
}
func (m *MockAWSClient) FetchSubnets(ctx context.Context) ([]models.SubnetInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.SubnetInfo), args.Error(1)
}
func (m *MockAWSClient) FetchSecurityGroups(ctx context.Context) ([]models.SecurityGroupInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.SecurityGroupInfo), args.Error(1)
}
func (m *MockAWSClient) FetchNATGateways(ctx context.Context) ([]models.NATGatewayInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.NATGatewayInfo), args.Error(1)
}
func (m *MockAWSClient) FetchRouteTables(ctx context.Context) ([]models.RouteTableInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.RouteTableInfo), args.Error(1)
}
func (m *MockAWSClient) FetchS3Buckets(ctx context.Context) ([]models.S3BucketInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.S3BucketInfo), args.Error(1)
}
func (m *MockAWSClient) FetchTargetGroups(ctx context.Context) ([]models.TargetGroupInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.TargetGroupInfo), args.Error(1)
}
func (m *MockAWSClient) FetchLoadBalancers(ctx context.Context) ([]models.LoadBalancerInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.LoadBalancerInfo), args.Error(1)
}
func (m *MockAWSClient) FetchElasticIPs(ctx context.Context) ([]models.ElasticIPInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.ElasticIPInfo), args.Error(1)
}
func (m *MockAWSClient) FetchLambdaFunctions(ctx context.Context) ([]models.LambdaFunctionInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.LambdaFunctionInfo), args.Error(1)
}
func (m *MockAWSClient) FetchRDSInstances(ctx context.Context) ([]models.RDSInstanceInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.RDSInstanceInfo), args.Error(1)
}
func (m *MockAWSClient) FetchConfiguration(ctx context.Context) (models.ConfigurationInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).(models.ConfigurationInfo), args.Error(1)
}
func (m *MockAWSClient) VerifyPermissions(ctx context.Context) ([]models.PermissionStatus, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.PermissionStatus), args.Error(1)
}

func TestGetVPCs(t *testing.T) {
	mockClient := new(MockAWSClient)
	app := &App{
		awsClient: mockClient,
	}

	expectedVPCs := []models.VPCInfo{{ID: "vpc-1", Name: "TestVPC"}}

	// Expectations
	mockClient.On("FetchVPCs", mock.Anything).Return(expectedVPCs, nil).Once()

	// Execute
	vpcs, err := app.GetVPCs()

	// Assert
	assert.NoError(t, err)
	assert.Equal(t, expectedVPCs, vpcs)
	mockClient.AssertExpectations(t)
}

func TestGetVPCs_Error(t *testing.T) {
	mockClient := new(MockAWSClient)
	app := &App{
		awsClient: mockClient,
	}

	// Expectations
	mockClient.On("FetchVPCs", mock.Anything).Return(([]models.VPCInfo)(nil), errors.New("failed")).Once()

	// Execute
	vpcs, err := app.GetVPCs()

	// Assert
	assert.Error(t, err)
	assert.Nil(t, vpcs)
	mockClient.AssertExpectations(t)
}

func TestGetEC2Instances_NilClient(t *testing.T) {
	app := &App{
		awsClient: nil,
	}

	instances, err := app.GetEC2Instances()
	assert.NoError(t, err)
	assert.Nil(t, instances)
}
