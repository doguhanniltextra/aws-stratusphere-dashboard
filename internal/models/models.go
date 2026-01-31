package models

import (
	"github.com/aws/aws-sdk-go-v2/service/ec2/types"
	ecsTypes "github.com/aws/aws-sdk-go-v2/service/ecs/types"
	lambdaTypes "github.com/aws/aws-sdk-go-v2/service/lambda/types"
	rdsTypes "github.com/aws/aws-sdk-go-v2/service/rds/types"
)

// IsAvailable returns true if the VPC is in available state
func (v *VPCInfo) IsAvailable() bool {
	return v.State == "available"
}

// FromAWSVPC converts an AWS SDK VPC type to our internal VPCInfo model
func FromAWSVPC(vpc types.Vpc) VPCInfo {
	vpcInfo := VPCInfo{
		ID:              safeString(vpc.VpcId),
		CIDRBlock:       safeString(vpc.CidrBlock),
		IsDefault:       safeBool(vpc.IsDefault),
		IsMain:          safeBool(vpc.IsDefault),
		State:           string(vpc.State),
		OwnerId:         safeString(vpc.OwnerId),
		DhcpOptionsId:   safeString(vpc.DhcpOptionsId),
		InstanceTenancy: string(vpc.InstanceTenancy),
	}

	// Extract Name from tags
	for _, tag := range vpc.Tags {
		if tag.Key != nil && *tag.Key == "Name" {
			vpcInfo.Name = safeString(tag.Value)
			break
		}
	}

	return vpcInfo
}

// safeString safely dereferences a string pointer
func safeString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// safeBool safely dereferences a bool pointer
func safeBool(b *bool) bool {
	if b == nil {
		return false
	}
	return *b
}

func FromAWSEC2Instance(instance types.Instance) EC2InstanceInfo {
	Platform := "Linux"
	if instance.PlatformDetails != nil {
		Platform = *instance.PlatformDetails
	} else if instance.Platform == types.PlatformValuesWindows {
		Platform = "Windows"
	}

	instanceInfo := EC2InstanceInfo{
		ID:               safeString(instance.InstanceId),
		InstanceType:     string(instance.InstanceType),
		State:            string(instance.State.Name),
		PublicIPAddress:  safeString(instance.PublicIpAddress),
		PrivateIPAddress: safeString(instance.PrivateIpAddress),
		LaunchTime:       instance.LaunchTime.Format("2006-01-02 15:04:05"),
		VPCID:            safeString(instance.VpcId),
		SubnetID:         safeString(instance.SubnetId),
		KeyName:          safeString(instance.KeyName),
		Architecture:     string(instance.Architecture),
		Platform:         Platform,
	}

	// Extract Security Groups
	for _, sg := range instance.SecurityGroups {
		instanceInfo.SecurityGroups = append(instanceInfo.SecurityGroups, safeString(sg.GroupName))
	}

	// Extract Name from tags
	for _, tag := range instance.Tags {
		if tag.Key != nil && *tag.Key == "Name" {
			instanceInfo.Name = safeString(tag.Value)
			break
		}
	}

	return instanceInfo
}

// ECSClusterInfo represents an ECS cluster with its essential information
type ECSClusterInfo struct {
	ClusterName         string
	ClusterArn          string
	Status              string
	RegisteredInstances int32
	RunningTasks        int32
	PendingTasks        int32
	ActiveServices      int32
}

// FromAWSECSCluster converts an AWS SDK ECS Cluster type to our internal model
func FromAWSECSCluster(cluster ecsTypes.Cluster) ECSClusterInfo {
	clusterInfo := ECSClusterInfo{
		ClusterName:         safeString(cluster.ClusterName),
		ClusterArn:          safeString(cluster.ClusterArn),
		Status:              safeString(cluster.Status),
		RegisteredInstances: cluster.RegisteredContainerInstancesCount,
		RunningTasks:        cluster.RunningTasksCount,
		PendingTasks:        cluster.PendingTasksCount,
		ActiveServices:      cluster.ActiveServicesCount,
	}

	return clusterInfo
}

func FromAWSSubnet(subnet types.Subnet) SubnetInfo {
	subnetInfo := SubnetInfo{
		ID:                      safeString(subnet.SubnetId),
		CIDRBlock:               safeString(subnet.CidrBlock),
		VPCID:                   safeString(subnet.VpcId),
		AvailabilityZone:        safeString(subnet.AvailabilityZone),
		State:                   string(subnet.State),
		MapPublicIPOnLaunch:     safeBool(subnet.MapPublicIpOnLaunch),
		AvailableIpAddressCount: safeInt32(subnet.AvailableIpAddressCount),
	}

	// Extract Name from tags
	for _, tag := range subnet.Tags {
		if tag.Key != nil && *tag.Key == "Name" {
			subnetInfo.Name = safeString(tag.Value)
			break
		}
	}

	return subnetInfo
}

func FromAWSSecurityGroup(securityGroup types.SecurityGroup) SecurityGroupInfo {
	securityGroupInfo := SecurityGroupInfo{
		ID:          safeString(securityGroup.GroupId),
		Name:        safeString(securityGroup.GroupName),
		Description: safeString(securityGroup.Description),
		VPCID:       safeString(securityGroup.VpcId),
	}

	// Extract Name from tags
	for _, tag := range securityGroup.Tags {
		if tag.Key != nil && *tag.Key == "Name" {
			securityGroupInfo.Name = safeString(tag.Value)
			break
		}
	}

	return securityGroupInfo
}

// ElasticIPInfo represents an AWS Elastic IP
type ElasticIPInfo struct {
	PublicIP                string
	AllocationID            string
	AssociationID           string
	InstanceID              string
	PrivateIP               string
	NetworkInterfaceID      string
	NetworkInterfaceOwnerID string
	Tags                    map[string]string
}

// FromAWSElasticIP converts an AWS SDK Address type to our internal model
func FromAWSElasticIP(addr types.Address) ElasticIPInfo {
	eip := ElasticIPInfo{
		PublicIP:                safeString(addr.PublicIp),
		AllocationID:            safeString(addr.AllocationId),
		AssociationID:           safeString(addr.AssociationId),
		InstanceID:              safeString(addr.InstanceId),
		PrivateIP:               safeString(addr.PrivateIpAddress),
		NetworkInterfaceID:      safeString(addr.NetworkInterfaceId),
		NetworkInterfaceOwnerID: safeString(addr.NetworkInterfaceOwnerId),
		Tags:                    make(map[string]string),
	}

	for _, tag := range addr.Tags {
		if tag.Key != nil && tag.Value != nil {
			eip.Tags[*tag.Key] = *tag.Value
		}
	}

	return eip
}

// LambdaFunctionInfo represents an AWS Lambda Function
type LambdaFunctionInfo struct {
	FunctionName string
	Runtime      string
	MemorySize   int32
	LastModified string
	Handler      string
	Description  string
	Arn          string
	State        string
}

// FromAWSLambdaFunction converts an AWS SDK Lambda Function type to our internal model
func FromAWSLambdaFunction(fn lambdaTypes.FunctionConfiguration) LambdaFunctionInfo {
	return LambdaFunctionInfo{
		FunctionName: safeString(fn.FunctionName),
		Runtime:      string(fn.Runtime),
		MemorySize:   safeInt32(fn.MemorySize),
		LastModified: safeString(fn.LastModified),
		Handler:      safeString(fn.Handler),
		Description:  safeString(fn.Description),
		Arn:          safeString(fn.FunctionArn),
		State:        string(fn.State),
	}
}

// safeInt32 safely dereferences an int32 pointer
func safeInt32(i *int32) int32 {
	if i == nil {
		return 0
	}
	return *i
}

// RDSInstanceInfo represents an AWS RDS Instance
type RDSInstanceInfo struct {
	DBInstanceIdentifier string
	Engine               string
	EngineVersion        string
	DBInstanceStatus     string
	Endpoint             string
	AllocatedStorage     int32
	DBInstanceClass      string
	VpcId                string
	AvailabilityZone     string
	MultiAZ              bool
	PubliclyAccessible   bool
	MasterUsername       string
}

// FromAWSRDSInstance converts an AWS SDK RDS Instance type to our internal model
func FromAWSRDSInstance(db rdsTypes.DBInstance) RDSInstanceInfo {
	endpoint := ""
	if db.Endpoint != nil && db.Endpoint.Address != nil {
		endpoint = *db.Endpoint.Address
	}

	vpcId := ""
	if db.DBSubnetGroup != nil {
		vpcId = safeString(db.DBSubnetGroup.VpcId)
	}

	return RDSInstanceInfo{
		DBInstanceIdentifier: safeString(db.DBInstanceIdentifier),
		Engine:               safeString(db.Engine),
		EngineVersion:        safeString(db.EngineVersion),
		DBInstanceStatus:     safeString(db.DBInstanceStatus),
		Endpoint:             endpoint,
		AllocatedStorage:     safeInt32(db.AllocatedStorage),
		DBInstanceClass:      safeString(db.DBInstanceClass),
		VpcId:                vpcId,
		AvailabilityZone:     safeString(db.AvailabilityZone),
		MultiAZ:              safeBool(db.MultiAZ),
		PubliclyAccessible:   safeBool(db.PubliclyAccessible),
		MasterUsername:       safeString(db.MasterUsername),
	}
}
