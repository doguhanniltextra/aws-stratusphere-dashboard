package aws

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	ec2Types "github.com/aws/aws-sdk-go-v2/service/ec2/types"
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
