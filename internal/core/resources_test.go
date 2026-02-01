package core

import (
	"context"
	"testing"

	"aws-terminal-sdk-v1/internal/models"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockAWSClient is a mock of core.AWSClient interface
type MockAWSClient struct {
	mock.Mock
}

func (m *MockAWSClient) FetchVPCs(ctx context.Context) ([]models.VPCInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.VPCInfo), args.Error(1)
}

func (m *MockAWSClient) FetchEC2Instances(ctx context.Context) ([]models.EC2InstanceInfo, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.EC2InstanceInfo), args.Error(1)
}

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

func (m *MockAWSClient) FetchResourceMetrics(ctx context.Context, ns, mName string, dims map[string]string, period int32) (*models.ResourceMetrics, error) {
	args := m.Called(ctx, ns, mName, dims, period)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*models.ResourceMetrics), args.Error(1)
}

func (m *MockAWSClient) VerifyPermissions(ctx context.Context) ([]models.PermissionStatus, error) {
	args := m.Called(ctx)
	return args.Get(0).([]models.PermissionStatus), args.Error(1)
}

func TestAppGetVPCs(t *testing.T) {
	mockClient := new(MockAWSClient)
	app := &App{awsClient: mockClient}

	mockClient.On("FetchVPCs", mock.Anything).Return([]models.VPCInfo{{ID: "vpc-1"}}, nil)

	vpcs, err := app.GetVPCs()
	assert.NoError(t, err)
	assert.Len(t, vpcs, 1)
	assert.Equal(t, "vpc-1", vpcs[0].ID)
}

func TestAppGetECSMetrics(t *testing.T) {
	mockClient := new(MockAWSClient)
	app := &App{awsClient: mockClient}

	mockClient.On("FetchResourceMetrics", mock.Anything, "AWS/ECS", mock.Anything, mock.Anything, int32(3600)).Return(&models.ResourceMetrics{
		Metrics: []models.MetricData{{Label: "CPUUtilization", Values: []float64{50.0}}},
	}, nil)

	metrics, err := app.GetECSMetrics("test-cluster", 3600)
	assert.NoError(t, err)
	assert.NotNil(t, metrics)
	// GetECSMetrics calls FetchResourceMetrics 4 times (CPU, Memory, NetworkIn, NetworkOut)
	mockClient.AssertNumberOfCalls(t, "FetchResourceMetrics", 4)
}
