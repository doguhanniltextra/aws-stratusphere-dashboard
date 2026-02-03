package constants

// AWS Configuration
const (
	AWSDefaultRegion   = "us-east-1"
	AWSProviderVersion = "~> 5.0"
	AWSCurrency        = "USD"
)

// File System
const (
	DefaultTerraformFile = "main.tf"
	TerraformFilePattern = "*.tf"
	FilePermReadWrite    = 0644
	FilePermSecure       = 0600
	DirPermSecure        = 0700
	ConfigDirName        = ".stratusphere"
	CredsFileName        = "credentials.enc"
	LambdaHandler        = "index.handler"
	LambdaZipFile        = "function.zip"
)

// AWS Quotas & Limits
const (
	QuotaCodeVPC      = "L-F678F1CE"
	QuotaCodeInstance = "L-1216D691"
	QuotaCodeEIP      = "L-0263D0A3"
	QuotaCodeNAT      = "L-FE5A3305"
	QuotaCodeLambda   = "L-B99A9384"
	QuotaCodeS3       = "L-DC2B2D3D"

	DefaultLimitVPC      = 5
	DefaultLimitInstance = 20
	DefaultLimitEIP      = 5
	DefaultLimitNAT      = 5
	DefaultLimitLambda   = 1000
	DefaultLimitS3       = 100
)

// Security Hub
const (
	SecurityHubSeverityCritical = "CRITICAL"
	SecurityHubSeverityHigh     = "HIGH"
	SecurityHubStateActive      = "ACTIVE"
)

// Trusted Advisor
const (
	TACheckIDIdleLoadBalancers = "eW7uY9STB8"
	TACheckIDUnusedEBSVolumes  = "DAvU99Dc4C"
	TACheckIDUnderutilizedEC2  = "Q7v9un9STB"

	TACategoryCostOptimization = "Cost Optimization"
)

// Models
const (
	TagName       = "Name"
	DateFormat    = "2006-01-02"
	S3VerDisabled = "Disabled"
)
