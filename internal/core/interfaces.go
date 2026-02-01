package core

import (
	"context"

	"aws-terminal-sdk-v1/internal/models"
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
