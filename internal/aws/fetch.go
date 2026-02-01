package aws

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cloudwatch"
	cwTypes "github.com/aws/aws-sdk-go-v2/service/cloudwatch/types"
	"github.com/aws/aws-sdk-go-v2/service/costexplorer"
	costexplorerTypes "github.com/aws/aws-sdk-go-v2/service/costexplorer/types"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	ec2Types "github.com/aws/aws-sdk-go-v2/service/ec2/types"
	"github.com/aws/aws-sdk-go-v2/service/ecs"
	ecsTypes "github.com/aws/aws-sdk-go-v2/service/ecs/types"
	"github.com/aws/aws-sdk-go-v2/service/elasticloadbalancingv2"
	elbv2 "github.com/aws/aws-sdk-go-v2/service/elasticloadbalancingv2"
	"github.com/aws/aws-sdk-go-v2/service/iam"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
	"github.com/aws/aws-sdk-go-v2/service/rds"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/securityhub"
	securityhubTypes "github.com/aws/aws-sdk-go-v2/service/securityhub/types"
	"github.com/aws/aws-sdk-go-v2/service/servicequotas"
	"github.com/aws/aws-sdk-go-v2/service/sts"
	"github.com/aws/aws-sdk-go-v2/service/support"

	"aws-terminal-sdk-v1/internal/models"
)

// safeString safely dereferences a string pointer
func safeString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// Client wraps the AWS clients
type Client struct {
	ec2Client     EC2ClientAPI
	ecsClient     ECSClientAPI
	elbv2Client   ELBv2ClientAPI
	iamClient     IAMClientAPI
	lambdaClient  LambdaClientAPI
	rdsClient     RDSClientAPI
	s3Client      S3ClientAPI
	stsClient     STSClientAPI
	cwClient      CloudWatchClientAPI
	ceClient      CostExplorerClientAPI
	sqClient      ServiceQuotasClientAPI
	shClient      SecurityHubClientAPI
	supportClient SupportClientAPI
	region        string
	cfg           aws.Config // Store config for Cost Explorer
}

// NewClient creates a new AWS client with default configuration
func NewClient(ctx context.Context) (*Client, error) {
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	return &Client{
		ec2Client:     ec2.NewFromConfig(cfg),
		ecsClient:     ecs.NewFromConfig(cfg),
		elbv2Client:   elasticloadbalancingv2.NewFromConfig(cfg),
		iamClient:     iam.NewFromConfig(cfg),
		lambdaClient:  lambda.NewFromConfig(cfg),
		rdsClient:     rds.NewFromConfig(cfg),
		s3Client:      s3.NewFromConfig(cfg),
		stsClient:     sts.NewFromConfig(cfg),
		cwClient:      cloudwatch.NewFromConfig(cfg),
		ceClient:      costexplorer.NewFromConfig(cfg),
		sqClient:      servicequotas.NewFromConfig(cfg),
		shClient:      securityhub.NewFromConfig(cfg),
		supportClient: support.NewFromConfig(cfg),
		region:        cfg.Region,
		cfg:           cfg,
	}, nil
}

// NewClientWithConfig creates a new AWS client with provided configuration
func NewClientWithConfig(ctx context.Context, cfg aws.Config) (*Client, error) {
	return &Client{
		ec2Client:     ec2.NewFromConfig(cfg),
		ecsClient:     ecs.NewFromConfig(cfg),
		elbv2Client:   elasticloadbalancingv2.NewFromConfig(cfg),
		iamClient:     iam.NewFromConfig(cfg),
		lambdaClient:  lambda.NewFromConfig(cfg),
		rdsClient:     rds.NewFromConfig(cfg),
		s3Client:      s3.NewFromConfig(cfg),
		stsClient:     sts.NewFromConfig(cfg),
		cwClient:      cloudwatch.NewFromConfig(cfg),
		ceClient:      costexplorer.NewFromConfig(cfg),
		sqClient:      servicequotas.NewFromConfig(cfg),
		shClient:      securityhub.NewFromConfig(cfg),
		supportClient: support.NewFromConfig(cfg),
		region:        cfg.Region,
		cfg:           cfg,
	}, nil
}

// GetRegion returns the configured AWS region
func (c *Client) GetRegion() string {
	return c.region
}

// FetchSecurityGroups retrieves all Security Groups from AWS
func (c *Client) FetchSecurityGroups(ctx context.Context) ([]models.SecurityGroupInfo, error) {
	output, err := c.ec2Client.DescribeSecurityGroups(ctx, &ec2.DescribeSecurityGroupsInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to describe security groups: %w", err)
	}

	securityGroups := make([]models.SecurityGroupInfo, 0, len(output.SecurityGroups))
	for _, securityGroup := range output.SecurityGroups {
		securityGroups = append(securityGroups, models.FromAWSSecurityGroup(securityGroup))
	}

	return securityGroups, nil
}

// FetchVPCs retrieves all VPCs from AWS
func (c *Client) FetchVPCs(ctx context.Context) ([]models.VPCInfo, error) {
	output, err := c.ec2Client.DescribeVpcs(ctx, &ec2.DescribeVpcsInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to describe VPCs: %w", err)
	}

	vpcs := make([]models.VPCInfo, 0, len(output.Vpcs))
	for _, vpc := range output.Vpcs {
		vpcs = append(vpcs, models.FromAWSVPC(vpc))
	}

	return vpcs, nil
}

func (c *Client) FetchEC2Instances(ctx context.Context) ([]models.EC2InstanceInfo, error) {
	output, err := c.ec2Client.DescribeInstances(ctx, &ec2.DescribeInstancesInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to describe EC2 instances: %w", err)
	}

	instances := make([]models.EC2InstanceInfo, 0, len(output.Reservations))
	for _, reservation := range output.Reservations {
		for _, instance := range reservation.Instances {
			instances = append(instances, models.FromAWSEC2Instance(instance))
		}
	}

	return instances, nil
}

// FetchECSClusters retrieves all ECS clusters from AWS
func (c *Client) FetchECSClusters(ctx context.Context) ([]models.ECSClusterInfo, error) {
	// First, list all cluster ARNs
	listOutput, err := c.ecsClient.ListClusters(ctx, &ecs.ListClustersInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to list ECS clusters: %w", err)
	}

	if len(listOutput.ClusterArns) == 0 {
		return []models.ECSClusterInfo{}, nil
	}

	// Then, describe clusters to get detailed information
	describeOutput, err := c.ecsClient.DescribeClusters(ctx, &ecs.DescribeClustersInput{
		Clusters: listOutput.ClusterArns,
		Include:  []ecsTypes.ClusterField{ecsTypes.ClusterFieldStatistics},
	})
	if err != nil {
		return nil, fmt.Errorf("failed to describe ECS clusters: %w", err)
	}

	clusters := make([]models.ECSClusterInfo, 0, len(describeOutput.Clusters))
	for _, cluster := range describeOutput.Clusters {
		clusters = append(clusters, models.FromAWSECSCluster(cluster))
	}

	return clusters, nil
}

func (c *Client) FetchSubnets(ctx context.Context) ([]models.SubnetInfo, error) {
	output, err := c.ec2Client.DescribeSubnets(ctx, &ec2.DescribeSubnetsInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to describe subnets: %w", err)
	}

	subnets := make([]models.SubnetInfo, 0, len(output.Subnets))
	for _, subnet := range output.Subnets {
		subnets = append(subnets, models.FromAWSSubnet(subnet))
	}

	return subnets, nil
}

func (c *Client) FetchNATGateways(ctx context.Context) ([]models.NATGatewayInfo, error) {
	output, err := c.ec2Client.DescribeNatGateways(ctx, &ec2.DescribeNatGatewaysInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to describe NAT gateways: %w", err)
	}

	natGateways := make([]models.NATGatewayInfo, 0, len(output.NatGateways))
	for _, nat := range output.NatGateways {
		natGateways = append(natGateways, models.FromAWSNATGateway(nat))
	}

	return natGateways, nil
}

func (c *Client) FetchRouteTables(ctx context.Context) ([]models.RouteTableInfo, error) {
	output, err := c.ec2Client.DescribeRouteTables(ctx, &ec2.DescribeRouteTablesInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to describe route tables: %w", err)
	}

	routeTables := make([]models.RouteTableInfo, 0, len(output.RouteTables))
	for _, rt := range output.RouteTables {
		routeTables = append(routeTables, models.FromAWSRouteTable(rt))
	}

	return routeTables, nil
}

func (c *Client) FetchS3Buckets(ctx context.Context) ([]models.S3BucketInfo, error) {
	// List all buckets
	listOutput, err := c.s3Client.ListBuckets(ctx, &s3.ListBucketsInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to list S3 buckets: %w", err)
	}

	if len(listOutput.Buckets) == 0 {
		return []models.S3BucketInfo{}, nil
	}

	cfg, _ := config.LoadDefaultConfig(ctx)
	region := cfg.Region

	s3Buckets := make([]models.S3BucketInfo, 0, len(listOutput.Buckets))
	for _, bucket := range listOutput.Buckets {
		s3Buckets = append(s3Buckets, models.FromAWSS3Bucket(bucket, region))
	}

	return s3Buckets, nil
}

func (c *Client) FetchTargetGroups(ctx context.Context) ([]models.TargetGroupInfo, error) {
	// List all target groups
	listOutput, err := c.elbv2Client.DescribeTargetGroups(ctx, &elbv2.DescribeTargetGroupsInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to describe target groups: %w", err)
	}

	targetGroups := make([]models.TargetGroupInfo, 0, len(listOutput.TargetGroups))
	for _, tg := range listOutput.TargetGroups {
		targetGroups = append(targetGroups, models.FromAWSTargetGroup(tg))
	}

	return targetGroups, nil
}

func (c *Client) FetchLoadBalancers(ctx context.Context) ([]models.LoadBalancerInfo, error) {
	// List all load balancers
	listOutput, err := c.elbv2Client.DescribeLoadBalancers(ctx, &elbv2.DescribeLoadBalancersInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to describe load balancers: %w", err)
	}

	loadBalancers := make([]models.LoadBalancerInfo, 0, len(listOutput.LoadBalancers))
	for _, lb := range listOutput.LoadBalancers {
		loadBalancers = append(loadBalancers, models.FromAWSLoadBalancer(lb))
	}

	return loadBalancers, nil
}

func (c *Client) FetchElasticIPs(ctx context.Context) ([]models.ElasticIPInfo, error) {
	output, err := c.ec2Client.DescribeAddresses(ctx, &ec2.DescribeAddressesInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to describe elastic IPs: %w", err)
	}

	eips := make([]models.ElasticIPInfo, 0, len(output.Addresses))
	for _, addr := range output.Addresses {
		eips = append(eips, models.FromAWSElasticIP(addr))
	}

	return eips, nil
}

func (c *Client) FetchLambdaFunctions(ctx context.Context) ([]models.LambdaFunctionInfo, error) {
	output, err := c.lambdaClient.ListFunctions(ctx, &lambda.ListFunctionsInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to list lambda functions: %w", err)
	}

	functions := make([]models.LambdaFunctionInfo, 0, len(output.Functions))
	for _, fn := range output.Functions {
		functions = append(functions, models.FromAWSLambdaFunction(fn))
	}

	return functions, nil
}

func (c *Client) FetchRDSInstances(ctx context.Context) ([]models.RDSInstanceInfo, error) {
	output, err := c.rdsClient.DescribeDBInstances(ctx, &rds.DescribeDBInstancesInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to describe DB instances: %w", err)
	}

	instances := make([]models.RDSInstanceInfo, 0, len(output.DBInstances))
	for _, db := range output.DBInstances {
		instances = append(instances, models.FromAWSRDSInstance(db))
	}

	return instances, nil
}

func (c *Client) FetchConfiguration(ctx context.Context) (models.ConfigurationInfo, error) {
	config := models.ConfigurationInfo{
		Region: c.region,
	}

	// Get access key info
	identity, err := c.stsClient.GetCallerIdentity(ctx, &sts.GetCallerIdentityInput{})
	if err == nil {
		if identity.Account != nil {
			config.AccountID = *identity.Account
		}
		if identity.Arn != nil {
			config.UserARN = *identity.Arn
			// Check for admin privileges
			config.IsAdmin = c.checkAdminPrivileges(ctx, *identity.Arn)
		}
	} else {
		fmt.Printf("Error getting caller identity: %v\n", err)
	}

	return config, nil
}

// checkAdminPrivileges checks if the current user/role has AdministratorAccess
func (c *Client) checkAdminPrivileges(ctx context.Context, arn string) bool {
	// Simple identifier parsing
	// Format 1: arn:aws:iam::account:user/username
	// Format 2: arn:aws:sts::account:assumed-role/rolename/session

	if strings.Contains(arn, ":user/") {
		parts := strings.Split(arn, ":user/")
		if len(parts) == 2 {
			username := parts[1]
			return c.checkUserPolicies(ctx, username)
		}
	} else if strings.Contains(arn, ":assumed-role/") {
		parts := strings.Split(arn, ":assumed-role/")
		if len(parts) == 2 {
			// rolename/session
			roleParts := strings.Split(parts[1], "/")
			if len(roleParts) >= 1 {
				roleName := roleParts[0]
				return c.checkRolePolicies(ctx, roleName)
			}
		}
	}

	return false
}

func (c *Client) checkUserPolicies(ctx context.Context, username string) bool {
	// Check attached managed policies
	paginator := iam.NewListAttachedUserPoliciesPaginator(c.iamClient, &iam.ListAttachedUserPoliciesInput{
		UserName: &username,
	})

	for paginator.HasMorePages() {
		output, err := paginator.NextPage(ctx)
		if err != nil {
			fmt.Printf("Error listing user policies: %v\n", err)
			return false
		}
		for _, policy := range output.AttachedPolicies {
			if policy.PolicyName != nil && *policy.PolicyName == "AdministratorAccess" {
				return true
			}
		}
	}
	return false
}

func (c *Client) checkRolePolicies(ctx context.Context, roleName string) bool {
	// Check attached managed policies
	paginator := iam.NewListAttachedRolePoliciesPaginator(c.iamClient, &iam.ListAttachedRolePoliciesInput{
		RoleName: &roleName,
	})

	for paginator.HasMorePages() {
		output, err := paginator.NextPage(ctx)
		if err != nil {
			fmt.Printf("Error listing role policies: %v\n", err)
			return false
		}
		for _, policy := range output.AttachedPolicies {
			if policy.PolicyName != nil && *policy.PolicyName == "AdministratorAccess" {
				return true
			}
		}
	}
	return false
}

// VerifyPermissions checks if the current principal has the required actions
func (c *Client) VerifyPermissions(ctx context.Context) ([]models.PermissionStatus, error) {
	requiredActions := []string{
		"ec2:DescribeInstances",
		"ec2:DescribeVpcs",
		"ec2:DescribeSubnets",
		"ec2:DescribeSecurityGroups",
		"ec2:DescribeNatGateways",
		"ec2:DescribeRouteTables",
		"ecs:ListClusters",
		"ecs:DescribeClusters",
		"elasticloadbalancing:DescribeLoadBalancers",
		"elasticloadbalancing:DescribeTargetGroups",
		"s3:ListBuckets",
		"sts:GetCallerIdentity",
		"iam:ListAttachedUserPolicies",
		"iam:ListAttachedRolePolicies",
	}

	// 1. Get Current Identity
	identity, err := c.stsClient.GetCallerIdentity(ctx, &sts.GetCallerIdentityInput{})
	if err != nil {
		return nil, fmt.Errorf("failed to get caller identity: %w", err)
	}

	var policySourceArn string
	arn := *identity.Arn

	// 2. Determine Policy Source ARN (Role or User)
	if strings.Contains(arn, ":assumed-role/") {
		parts := strings.Split(arn, ":assumed-role/")
		if len(parts) == 2 {
			baseArn := parts[0]
			accountPart := strings.Replace(baseArn, ":sts:", ":iam:", 1)
			roleName := strings.Split(parts[1], "/")[0]
			policySourceArn = fmt.Sprintf("%s:role/%s", accountPart, roleName)
		}
	} else if strings.Contains(arn, ":user/") {
		policySourceArn = arn
	} else {
		// Fallback or root (root can do everything, but let's try strict check if possible or strict allow)
		if strings.HasSuffix(arn, ":root") {
			// Root user
			results := make([]models.PermissionStatus, len(requiredActions))
			for i, action := range requiredActions {
				results[i] = models.PermissionStatus{Action: action, Allowed: true, Reason: "Root User"}
			}
			return results, nil
		}
		return nil, fmt.Errorf("unsupported principal type: %s", arn)
	}

	// 3. Simulate Policy
	// Note: We batch actions. Max items per call is likely enough for our list.
	input := &iam.SimulatePrincipalPolicyInput{
		PolicySourceArn: &policySourceArn,
		ActionNames:     requiredActions,
	}

	output, err := c.iamClient.SimulatePrincipalPolicy(ctx, input)
	if err != nil {
		// Fallback: If we assume we don't have permission to simulate, we might return error
		// But better to return a "Unknown" status or fail.
		return nil, fmt.Errorf("failed to simulate policy (missing iam:SimulatePrincipalPolicy?): %w", err)
	}

	results := make([]models.PermissionStatus, 0, len(output.EvaluationResults))
	for _, eval := range output.EvaluationResults {
		allowed := eval.EvalDecision == "allowed"
		reason := "Implicit Deny"
		if allowed {
			reason = "Explicit Allow" // Simplified
		} else {
			// Try to find unmatched statements if useful, but 'Implicit Deny' is usually enough
		}

		results = append(results, models.PermissionStatus{
			Action:  *eval.EvalActionName,
			Allowed: allowed,
			Reason:  reason,
		})
	}

	return results, nil
}

// FetchResourceMetrics gets metrics for a specific AWS resource
func (c *Client) FetchResourceMetrics(ctx context.Context, namespace, metricName string, dimensions map[string]string, period int32) (*models.ResourceMetrics, error) {
	endTime := time.Now()
	startTime := endTime.Add(-24 * time.Hour)

	var cwDimensions []cwTypes.Dimension
	for k, v := range dimensions {
		cwDimensions = append(cwDimensions, cwTypes.Dimension{
			Name:  aws.String(k),
			Value: aws.String(v),
		})
	}

	input := &cloudwatch.GetMetricDataInput{
		MetricDataQueries: []cwTypes.MetricDataQuery{
			{
				Id: aws.String("m1"),
				MetricStat: &cwTypes.MetricStat{
					Metric: &cwTypes.Metric{
						Namespace:  aws.String(namespace),
						MetricName: aws.String(metricName),
						Dimensions: cwDimensions,
					},
					Period: aws.Int32(period),
					Stat:   aws.String("Average"),
				},
				ReturnData: aws.Bool(true),
			},
		},
		StartTime: aws.Time(startTime),
		EndTime:   aws.Time(endTime),
	}

	output, err := c.cwClient.GetMetricData(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to get metric data: %w", err)
	}

	metrics := &models.ResourceMetrics{
		Metrics: make([]models.MetricData, 0),
	}

	for _, result := range output.MetricDataResults {
		values := result.Values
		if values == nil {
			values = []float64{}
		}
		data := models.MetricData{
			Label:  aws.ToString(result.Label),
			Values: values,
			Times:  make([]string, len(result.Timestamps)),
		}
		for i, ts := range result.Timestamps {
			data.Times[i] = ts.Format("2006-01-02 15:04")
		}
		metrics.Metrics = append(metrics.Metrics, data)
	}

	return metrics, nil
}

// FetchAccountHomeInfo gathers comprehensive account metadata and cost information
func (c *Client) FetchAccountHomeInfo(ctx context.Context) (*models.AccountHomeInfo, error) {
	info := &models.AccountHomeInfo{
		Region:   c.region,
		Currency: "USD",
	}

	// 1. Get Caller Identity (AccountID, UserARN)
	identity, err := c.stsClient.GetCallerIdentity(ctx, &sts.GetCallerIdentityInput{})
	if err == nil && identity != nil {
		info.AccountID = safeString(identity.Account)
		info.UserARN = safeString(identity.Arn)
	}

	// 2. Get Account Alias
	aliases, err := c.iamClient.ListAccountAliases(ctx, &iam.ListAccountAliasesInput{})
	if err == nil && aliases != nil && len(aliases.AccountAliases) > 0 {
		info.AccountAlias = aliases.AccountAliases[0]
	}

	// 3. MFA Status
	mfa, err := c.iamClient.ListMFADevices(ctx, &iam.ListMFADevicesInput{})
	if err == nil && mfa != nil {
		info.MFAEnabled = len(mfa.MFADevices) > 0
	}

	// 4. Costs (Yesterday, MTD, Last Month)
	now := time.Now().UTC()
	today := now.Format("2006-01-02")
	yesterday := now.AddDate(0, 0, -1).Format("2006-01-02")
	firstOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC).Format("2006-01-02")

	// Dates for last month
	lastMonthTime := now.AddDate(0, -1, 0)
	lastMonthStart := time.Date(lastMonthTime.Year(), lastMonthTime.Month(), 1, 0, 0, 0, 0, time.UTC).Format("2006-01-02")
	lastMonthEnd := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC).Format("2006-01-02")

	// Yesterday's Cost
	yCost, _ := c.getCost(ctx, yesterday, today)
	info.CostYesterday = yCost

	// MTD Cost
	mtdCost, _ := c.getCost(ctx, firstOfMonth, today)
	info.CostMonthToDate = mtdCost

	// Last Month Cost
	lmCost, _ := c.getCost(ctx, lastMonthStart, lastMonthEnd)
	info.CostLastMonth = lmCost

	// 5. Service Usage & Quotas
	info.VPCUsage = c.getUsageCount(ctx, "vpc")
	info.InstanceUsage = c.getUsageCount(ctx, "ec2")
	info.EIPUsage = c.getUsageCount(ctx, "eip")
	info.NatUsage = c.getUsageCount(ctx, "nat")
	info.LambdaUsage = c.getUsageCount(ctx, "lambda")
	info.S3Usage = c.getUsageCount(ctx, "s3")

	// Quotas
	info.VPCLimit = c.getQuota(ctx, "vpc", "L-F678F1CE", 5)
	info.InstanceLimit = c.getQuota(ctx, "ec2", "L-1216D691", 20)
	info.EIPLimit = c.getQuota(ctx, "ec2", "L-0263D0A3", 5)
	info.NatLimit = c.getQuota(ctx, "vpc", "L-FE5A3305", 5)
	info.LambdaLimit = c.getQuota(ctx, "lambda", "L-B99A9384", 1000)
	info.S3Limit = c.getQuota(ctx, "s3", "L-DC2B2D3D", 100)

	// 6. Security Findings (Critical & High)
	findings, err := c.FetchSecurityFindings(ctx)
	info.TopFindings = findings
	info.SecurityHubEnabled = true
	if err != nil && strings.Contains(err.Error(), "SubscriptionRequiredException") {
		info.SecurityHubEnabled = false
	}

	for _, f := range findings {
		if f.Severity == "CRITICAL" {
			info.CriticalFindings++
		} else if f.Severity == "HIGH" {
			info.HighFindings++
		}
	}

	// 7. Trusted Advisor Recommendations
	recs, err := c.FetchTrustedAdvisorRecommendations(ctx)
	info.Recommendations = recs
	info.SupportAccessEnabled = true
	if err != nil && (strings.Contains(err.Error(), "SubscriptionRequiredException") || strings.Contains(err.Error(), "AccessDenied")) {
		info.SupportAccessEnabled = false
	}

	for _, r := range recs {
		if r.Category == "Cost Optimization" && r.Status == "Red" {
			info.PotentialSavings += r.EstimatedSavings
		}
	}

	return info, nil
}

// FetchSecurityFindings retrieves the top high-severity security issues
func (c *Client) FetchSecurityFindings(ctx context.Context) ([]models.SecurityFinding, error) {
	// Filter for CRITICAL and HIGH severity
	input := &securityhub.GetFindingsInput{
		Filters: &securityhubTypes.AwsSecurityFindingFilters{
			SeverityLabel: []securityhubTypes.StringFilter{
				{Value: aws.String("CRITICAL"), Comparison: "EQUALS"},
				{Value: aws.String("HIGH"), Comparison: "EQUALS"},
			},
			RecordState: []securityhubTypes.StringFilter{
				{Value: aws.String("ACTIVE"), Comparison: "EQUALS"},
			},
		},
		MaxResults: aws.Int32(5), // Top 5
	}

	output, err := c.shClient.GetFindings(ctx, input)
	if err != nil {
		fmt.Printf("Warning: Could not fetch Security Hub findings: %v\n", err)
		return []models.SecurityFinding{}, err // Return error to be caught by caller
	}

	findings := make([]models.SecurityFinding, 0, len(output.Findings))
	for _, f := range output.Findings {
		resourceID := "Multiple Resources"
		if len(f.Resources) > 0 {
			resourceID = safeString(f.Resources[0].Id)
		}

		findings = append(findings, models.SecurityFinding{
			Title:      safeString(f.Title),
			Severity:   string(f.Severity.Label),
			ResourceID: resourceID,
			Category:   safeString(f.Description),
			UpdatedAt:  safeString(f.UpdatedAt),
		})
	}

	return findings, nil
}

// FetchTrustedAdvisorRecommendations fetches key cost and security tips
func (c *Client) FetchTrustedAdvisorRecommendations(ctx context.Context) ([]models.TrustedAdvisorRecommendation, error) {
	// We check a subset of known high-value checks
	// Note: Fully dynamic listing requires advanced logic, we target common cost winners
	checkIDs := []string{
		"eW7uY9STB8", // Idle Load Balancers
		"DAvU99Dc4C", // Unused EBS Volumes
		"Q7v9un9STB", // Underutilized EC2 Instances (Requires Business Support)
	}

	recommendations := make([]models.TrustedAdvisorRecommendation, 0)

	for _, id := range checkIDs {
		output, err := c.supportClient.DescribeTrustedAdvisorCheckResult(ctx, &support.DescribeTrustedAdvisorCheckResultInput{
			CheckId: aws.String(id),
		})

		if err != nil {
			// Handle AccessDenied for basic support plans
			continue
		}

		if output.Result == nil || output.Result.Status == aws.String("Green") {
			continue
		}

		// Basic mapping of check IDs to names for this demo
		name := "Resource Optimization"
		category := "Cost Optimization"
		if id == "eW7uY9STB8" {
			name = "Idle Load Balancers"
		} else if id == "DAvU99Dc4C" {
			name = "Unused EBS Volumes"
		}

		recommendations = append(recommendations, models.TrustedAdvisorRecommendation{
			CheckName:        name,
			Category:         category,
			Status:           safeString(output.Result.Status),
			EstimatedSavings: 0, // In real world, parse from output.Result.Resources metadata
		})
	}

	return recommendations, nil
}

// getUsageCount is a helper to count active resources
func (c *Client) getUsageCount(ctx context.Context, service string) int {
	switch service {
	case "vpc":
		vpcs, err := c.ec2Client.DescribeVpcs(ctx, &ec2.DescribeVpcsInput{})
		if err == nil && vpcs != nil {
			return len(vpcs.Vpcs)
		}
	case "ec2":
		// Count running instances
		instances, err := c.ec2Client.DescribeInstances(ctx, &ec2.DescribeInstancesInput{
			Filters: []ec2Types.Filter{
				{
					Name:   aws.String("instance-state-name"),
					Values: []string{"running"},
				},
			},
		})
		if err == nil && instances != nil {
			count := 0
			for _, res := range instances.Reservations {
				count += len(res.Instances)
			}
			return count
		}
	case "eip":
		ips, err := c.ec2Client.DescribeAddresses(ctx, &ec2.DescribeAddressesInput{})
		if err == nil && ips != nil {
			return len(ips.Addresses)
		}
	case "nat":
		nats, err := c.ec2Client.DescribeNatGateways(ctx, &ec2.DescribeNatGatewaysInput{})
		if err == nil && nats != nil {
			return len(nats.NatGateways)
		}
	case "lambda":
		lambdas, err := c.lambdaClient.ListFunctions(ctx, &lambda.ListFunctionsInput{})
		if err == nil && lambdas != nil {
			return len(lambdas.Functions)
		}
	case "s3":
		buckets, err := c.s3Client.ListBuckets(ctx, &s3.ListBucketsInput{})
		if err == nil && buckets != nil {
			return len(buckets.Buckets)
		}
	}
	return 0
}

// getQuota is a helper to fetch a specific service quota with a fallback
func (c *Client) getQuota(ctx context.Context, serviceCode, quotaCode string, fallback int) int {
	quota, err := c.sqClient.GetServiceQuota(ctx, &servicequotas.GetServiceQuotaInput{
		ServiceCode: aws.String(serviceCode),
		QuotaCode:   aws.String(quotaCode),
	})
	if err == nil && quota != nil && quota.Quota != nil {
		return int(*quota.Quota.Value)
	}
	return fallback
}

// getCost is a helper to fetch blended costs for a specific range
func (c *Client) getCost(ctx context.Context, start, end string) (float64, error) {
	if start == end {
		return 0, nil
	}

	output, err := c.ceClient.GetCostAndUsage(ctx, &costexplorer.GetCostAndUsageInput{
		TimePeriod: &costexplorerTypes.DateInterval{
			Start: aws.String(start),
			End:   aws.String(end),
		},
		Granularity: costexplorerTypes.GranularityDaily,
		Metrics:     []string{"BlendedCost"},
	})

	if err != nil || len(output.ResultsByTime) == 0 {
		return 0, err
	}

	var totalCost float64
	for _, result := range output.ResultsByTime {
		if result.Total != nil {
			if costMetric, ok := result.Total["BlendedCost"]; ok {
				var cost float64
				fmt.Sscanf(*costMetric.Amount, "%f", &cost)
				totalCost += cost
			}
		}
	}

	return totalCost, nil
}
