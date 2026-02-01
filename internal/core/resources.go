package core

import (
	"context"
	"fmt"

	"aws-terminal-sdk-v1/internal/models"
)

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

// GetECSMetrics returns CloudWatch metrics for a specific ECS cluster
func (a *App) GetECSMetrics(clusterName string, period int32) (*models.ResourceMetrics, error) {
	if a.awsClient == nil {
		return nil, nil
	}

	dimensions := map[string]string{
		"ClusterName": clusterName,
	}

	metricsToFetch := []string{"CPUUtilization", "MemoryUtilization", "NetworkIn", "NetworkOut"}
	allMetrics := &models.ResourceMetrics{
		Metrics: make([]models.MetricData, 0),
	}

	for _, mName := range metricsToFetch {
		data, err := a.awsClient.FetchResourceMetrics(context.Background(), "AWS/ECS", mName, dimensions, period)
		if err != nil {
			// Log error but continue with other metrics
			fmt.Printf("Error fetching metric %s: %v\n", mName, err)
			continue
		}
		if data != nil {
			allMetrics.Metrics = append(allMetrics.Metrics, data.Metrics...)
		}
	}

	return allMetrics, nil
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
