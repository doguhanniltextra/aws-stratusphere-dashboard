package aws

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch"
	cwTypes "github.com/aws/aws-sdk-go-v2/service/cloudwatch/types"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	ec2Types "github.com/aws/aws-sdk-go-v2/service/ec2/types"
	"github.com/aws/aws-sdk-go-v2/service/ecs"
	ecsTypes "github.com/aws/aws-sdk-go-v2/service/ecs/types"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	lambdaTypes "github.com/aws/aws-sdk-go-v2/service/lambda/types"
	"github.com/aws/aws-sdk-go-v2/service/rds"
	rdsTypes "github.com/aws/aws-sdk-go-v2/service/rds/types"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	s3Types "github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestFetchVPCs(t *testing.T) {
	mockEC2 := new(MockEC2Client)
	client := &Client{
		ec2Client: mockEC2,
	}

	// Test Case 1: Success
	mockEC2.On("DescribeVpcs", mock.Anything, mock.Anything, mock.Anything).Return(&ec2.DescribeVpcsOutput{
		Vpcs: []ec2Types.Vpc{
			{
				VpcId:     aws.String("vpc-123"),
				CidrBlock: aws.String("10.0.0.0/16"),
				Tags: []ec2Types.Tag{
					{Key: aws.String("Name"), Value: aws.String("TestVPC")},
				},
			},
		},
	}, nil).Once()

	vpcs, err := client.FetchVPCs(context.Background())
	assert.NoError(t, err)
	assert.Len(t, vpcs, 1)
	assert.Equal(t, "vpc-123", vpcs[0].ID)
	assert.Equal(t, "10.0.0.0/16", vpcs[0].CIDRBlock)
	assert.Equal(t, "TestVPC", vpcs[0].Name)

	// Test Case 2: Error
	mockEC2.On("DescribeVpcs", mock.Anything, mock.Anything, mock.Anything).Return(nil, errors.New("AWS Error")).Once()

	vpcs, err = client.FetchVPCs(context.Background())
	assert.Error(t, err)
	assert.Nil(t, vpcs)
	assert.Contains(t, err.Error(), "AWS Error")
}

func TestFetchEC2Instances(t *testing.T) {
	mockEC2 := new(MockEC2Client)
	client := &Client{
		ec2Client: mockEC2,
	}

	// Test Case: Success
	now := time.Now()
	mockEC2.On("DescribeInstances", mock.Anything, mock.Anything, mock.Anything).Return(&ec2.DescribeInstancesOutput{
		Reservations: []ec2Types.Reservation{
			{
				Instances: []ec2Types.Instance{
					{
						InstanceId:   aws.String("i-1234567890abcdef0"),
						InstanceType: ec2Types.InstanceTypeT2Micro,
						State: &ec2Types.InstanceState{
							Name: ec2Types.InstanceStateNameRunning,
						},
						Tags: []ec2Types.Tag{
							{Key: aws.String("Name"), Value: aws.String("MyServer")},
						},
						LaunchTime: aws.Time(now),
					},
				},
			},
		},
	}, nil).Once()

	instances, err := client.FetchEC2Instances(context.Background())
	assert.NoError(t, err)
	assert.Len(t, instances, 1)
	assert.Equal(t, "i-1234567890abcdef0", instances[0].ID)
	assert.Equal(t, "t2.micro", instances[0].InstanceType)
	assert.Equal(t, "running", instances[0].State)
	assert.Equal(t, "MyServer", instances[0].Name)
}

func TestFetchECSClusters(t *testing.T) {
	mockECS := new(MockECSClient)
	client := &Client{
		ecsClient: mockECS,
	}

	// Test Case: Success
	mockECS.On("ListClusters", mock.Anything, mock.Anything, mock.Anything).Return(&ecs.ListClustersOutput{
		ClusterArns: []string{"arn:aws:ecs:us-east-1:123456789012:cluster/test-cluster"},
	}, nil).Once()

	mockECS.On("DescribeClusters", mock.Anything, mock.Anything, mock.Anything).Return(&ecs.DescribeClustersOutput{
		Clusters: []ecsTypes.Cluster{
			{
				ClusterName:                       aws.String("test-cluster"),
				ClusterArn:                        aws.String("arn:aws:ecs:us-east-1:123456789012:cluster/test-cluster"),
				Status:                            aws.String("ACTIVE"),
				RunningTasksCount:                 10,
				PendingTasksCount:                 2,
				ActiveServicesCount:               5,
				RegisteredContainerInstancesCount: 3,
			},
		},
	}, nil).Once()

	clusters, err := client.FetchECSClusters(context.Background())
	assert.NoError(t, err)
	assert.Len(t, clusters, 1)
	assert.Equal(t, "test-cluster", clusters[0].ClusterName)
	assert.Equal(t, int32(10), clusters[0].RunningTasks)
}

func TestFetchResourceMetrics(t *testing.T) {
	mockCW := new(MockCloudWatchClient)
	client := &Client{
		cwClient: mockCW,
	}

	// Test Case: Success
	now := time.Now()
	mockCW.On("GetMetricData", mock.Anything, mock.Anything, mock.Anything).Return(&cloudwatch.GetMetricDataOutput{
		MetricDataResults: []cwTypes.MetricDataResult{
			{
				Label:      aws.String("CPUUtilization"),
				Values:     []float64{75.5, 80.0},
				Timestamps: []time.Time{now, now.Add(-1 * time.Hour)},
			},
		},
	}, nil).Once()

	metrics, err := client.FetchResourceMetrics(context.Background(), "AWS/ECS", "CPUUtilization", map[string]string{"ClusterName": "test"}, 3600)
	assert.NoError(t, err)
	assert.NotNil(t, metrics)
	assert.Len(t, metrics.Metrics, 1)
	assert.Equal(t, "CPUUtilization", metrics.Metrics[0].Label)
	assert.Len(t, metrics.Metrics[0].Values, 2)
}

func TestFetchSubnets(t *testing.T) {
	mockEC2 := new(MockEC2Client)
	client := &Client{ec2Client: mockEC2}

	mockEC2.On("DescribeSubnets", mock.Anything, mock.Anything, mock.Anything).Return(&ec2.DescribeSubnetsOutput{
		Subnets: []ec2Types.Subnet{
			{
				SubnetId:         aws.String("subnet-1"),
				CidrBlock:        aws.String("10.0.1.0/24"),
				AvailabilityZone: aws.String("us-east-1a"),
				VpcId:            aws.String("vpc-1"),
			},
		},
	}, nil).Once()

	subnets, err := client.FetchSubnets(context.Background())
	assert.NoError(t, err)
	assert.Len(t, subnets, 1)
	assert.Equal(t, "subnet-1", subnets[0].ID)
}

func TestFetchSecurityGroups(t *testing.T) {
	mockEC2 := new(MockEC2Client)
	client := &Client{ec2Client: mockEC2}

	mockEC2.On("DescribeSecurityGroups", mock.Anything, mock.Anything, mock.Anything).Return(&ec2.DescribeSecurityGroupsOutput{
		SecurityGroups: []ec2Types.SecurityGroup{
			{
				GroupId:   aws.String("sg-1"),
				GroupName: aws.String("default"),
				VpcId:     aws.String("vpc-1"),
			},
		},
	}, nil).Once()

	sgs, err := client.FetchSecurityGroups(context.Background())
	assert.NoError(t, err)
	assert.Len(t, sgs, 1)
	assert.Equal(t, "sg-1", sgs[0].ID)
}

func TestFetchNATGateways(t *testing.T) {
	mockEC2 := new(MockEC2Client)
	client := &Client{ec2Client: mockEC2}

	mockEC2.On("DescribeNatGateways", mock.Anything, mock.Anything, mock.Anything).Return(&ec2.DescribeNatGatewaysOutput{
		NatGateways: []ec2Types.NatGateway{
			{
				NatGatewayId: aws.String("nat-1"),
				State:        ec2Types.NatGatewayStateAvailable,
				VpcId:        aws.String("vpc-1"),
			},
		},
	}, nil).Once()

	nats, err := client.FetchNATGateways(context.Background())
	assert.NoError(t, err)
	assert.Len(t, nats, 1)
	assert.Equal(t, "nat-1", nats[0].ID)
}

func TestFetchRouteTables(t *testing.T) {
	mockEC2 := new(MockEC2Client)
	client := &Client{ec2Client: mockEC2}

	mockEC2.On("DescribeRouteTables", mock.Anything, mock.Anything, mock.Anything).Return(&ec2.DescribeRouteTablesOutput{
		RouteTables: []ec2Types.RouteTable{
			{
				RouteTableId: aws.String("rt-1"),
				VpcId:        aws.String("vpc-1"),
			},
		},
	}, nil).Once()

	rts, err := client.FetchRouteTables(context.Background())
	assert.NoError(t, err)
	assert.Len(t, rts, 1)
	assert.Equal(t, "rt-1", rts[0].ID)
}

func TestFetchS3Buckets(t *testing.T) {
	mockS3 := new(MockS3Client)
	client := &Client{s3Client: mockS3}

	mockS3.On("ListBuckets", mock.Anything, mock.Anything, mock.Anything).Return(&s3.ListBucketsOutput{
		Buckets: []s3Types.Bucket{
			{
				Name:         aws.String("test-bucket"),
				CreationDate: aws.Time(time.Now()),
			},
		},
	}, nil).Once()

	buckets, err := client.FetchS3Buckets(context.Background())
	assert.NoError(t, err)
	assert.Len(t, buckets, 1)
	assert.Equal(t, "test-bucket", buckets[0].Name)
}

func TestFetchRDSInstances(t *testing.T) {
	mockRDS := new(MockRDSClient)
	client := &Client{rdsClient: mockRDS}

	mockRDS.On("DescribeDBInstances", mock.Anything, mock.Anything, mock.Anything).Return(&rds.DescribeDBInstancesOutput{
		DBInstances: []rdsTypes.DBInstance{
			{
				DBInstanceIdentifier: aws.String("test-db"),
				DBInstanceClass:      aws.String("db.t3.micro"),
				DBInstanceStatus:     aws.String("available"),
				Engine:               aws.String("postgres"),
			},
		},
	}, nil).Once()

	instances, err := client.FetchRDSInstances(context.Background())
	assert.NoError(t, err)
	assert.Len(t, instances, 1)
	assert.Equal(t, "test-db", instances[0].DBInstanceIdentifier)
}

func TestFetchLambdaFunctions(t *testing.T) {
	mockLambda := new(MockLambdaClient)
	client := &Client{lambdaClient: mockLambda}

	mockLambda.On("ListFunctions", mock.Anything, mock.Anything, mock.Anything).Return(&lambda.ListFunctionsOutput{
		Functions: []lambdaTypes.FunctionConfiguration{
			{
				FunctionName: aws.String("test-func"),
				Runtime:      lambdaTypes.RuntimeGo1x,
				Handler:      aws.String("main"),
				MemorySize:   aws.Int32(128),
			},
		},
	}, nil).Once()

	funcs, err := client.FetchLambdaFunctions(context.Background())
	assert.NoError(t, err)
	assert.Len(t, funcs, 1)
	assert.Equal(t, "test-func", funcs[0].FunctionName)
}
