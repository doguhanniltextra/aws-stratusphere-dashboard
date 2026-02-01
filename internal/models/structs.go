package models

// ConfigurationInfo holds general AWS configuration
type ConfigurationInfo struct {
	Region    string
	AccountID string
	UserARN   string
	IsAdmin   bool
}

type PermissionStatus struct {
	Action  string
	Allowed bool
	Reason  string
}

// NAT Gateway Info
type NATGatewayInfo struct {
	ID               string
	Name             string
	State            string
	SubnetID         string
	VPCID            string
	PublicIP         string
	PrivateIP        string
	ConnectivityType string
}

// Route Table Info
type RouteTableInfo struct {
	ID        string
	Name      string
	VPCID     string
	IsMain    bool
	Routes    int
	Subnets   int
	SubnetIDs []string
}

// S3 Bucket Info
type S3BucketInfo struct {
	Name         string
	Region       string
	CreationDate string
	Versioning   string
	PublicAccess bool
	Encryption   bool
}

// Target Group Info
type TargetGroupInfo struct {
	Name            string
	ARN             string
	Protocol        string
	Port            int32
	TargetType      string
	VPCID           string
	HealthyCount    int
	UnhealthyCount  int
	HealthCheckPath string
}

// Load Balancer Info
type LoadBalancerInfo struct {
	Name              string
	ARN               string
	DNSName           string
	Type              string
	Scheme            string
	State             string
	VPCID             string
	AvailabilityZones []string
}

type SecurityGroupInfo struct {
	ID           string
	Name         string
	Description  string
	VPCID        string
	IngressRules []SecurityGroupRule
	EgressRules  []SecurityGroupRule
}

type SecurityGroupRule struct {
	Protocol    string
	FromPort    int32
	ToPort      int32
	CIDR        string
	Description string
}

type SubnetInfo struct {
	ID                      string
	CIDRBlock               string
	Name                    string
	VPCID                   string
	AvailabilityZone        string
	State                   string
	MapPublicIPOnLaunch     bool
	AvailableIpAddressCount int32
}

// EC2InstanceInfo represents an EC2 instance with its essential information
type EC2InstanceInfo struct {
	ID               string
	Name             string // From Name tag
	InstanceType     string
	State            string
	PublicIPAddress  string
	PrivateIPAddress string
	LaunchTime       string
	VPCID            string
	SubnetID         string
	SecurityGroups   []string
	KeyName          string
	Platform         string
	Architecture     string
}

// VPCInfo represents a VPC with its essential information
type VPCInfo struct {
	ID              string
	Name            string // From Name tag
	CIDRBlock       string
	IsDefault       bool
	IsMain          bool
	State           string
	OwnerId         string
	DhcpOptionsId   string
	InstanceTenancy string
}

// AccountHomeInfo aggregates metadata and cost information for the Home dashboard
type AccountHomeInfo struct {
	AccountID    string `json:"account_id"`
	AccountAlias string `json:"account_alias"`
	UserARN      string `json:"user_arn"`
	Region       string `json:"region"`
	CreationDate string `json:"creation_date"`
	MFAEnabled   bool   `json:"mfa_enabled"`

	CostYesterday   float64 `json:"cost_yesterday"`
	CostMonthToDate float64 `json:"cost_month_to_date"`
	CostLastMonth   float64 `json:"cost_last_month"`
	Currency        string  `json:"currency"`

	// Quotas/Limits summary
	VPCLimit      int `json:"vpc_limit"`
	VPCUsage      int `json:"vpc_usage"`
	InstanceLimit int `json:"instance_limit"`
	InstanceUsage int `json:"instance_usage"`
	EIPLimit      int `json:"eip_limit"`
	EIPUsage      int `json:"eip_usage"`
	NatLimit      int `json:"nat_limit"`
	NatUsage      int `json:"nat_usage"`
	LambdaLimit   int `json:"lambda_limit"`
	LambdaUsage   int `json:"lambda_usage"`
	S3Limit       int `json:"s3_limit"`
	S3Usage       int `json:"s3_usage"`
}
