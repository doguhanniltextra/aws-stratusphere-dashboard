<div align="center">
  <img src="./appicon.png" alt="Stratusphere Logo" width="200"/>
  
  # Stratusphere
  
  **AWS Infrastructure Visualization & Terraform Code Generation Platform**
  
  A cross-platform desktop application built with Wails v2 and Go 1.24, providing real-time AWS resource discovery, interactive topology visualization, and reverse-engineering capabilities for Infrastructure-as-Code generation.
</div>

---

## 🏗️ Architecture Overview

### Technology Stack

**Backend (Go 1.24.6)**
- **Framework**: [Wails v2.11.0](https://wails.io/) - Native desktop application framework with Go backend and web frontend
- **AWS SDK**: AWS SDK for Go v2 (modular architecture)
- **Logging**: `log/slog` with `lumberjack.v2` for log rotation
- **Cryptography**: AES-256-GCM encryption for credential storage
- **Testing**: `testify` for unit and integration tests

**Frontend**
- **Architecture**: Vanilla JavaScript with embedded assets (`embed.FS`)
- **Rendering**: HTML5 + CSS3 with WebView2 (Windows) / WebKit (macOS/Linux)
- **Communication**: Wails runtime bridge for Go ↔ JavaScript IPC

**Build System**
- **Compiler**: Go 1.24.6 with CGO enabled
- **Bundler**: Wails CLI (`wails build`)
- **Output**: Native executables (Windows: `.exe`, macOS: `.app`, Linux: binary)

### Project Structure

```
aws-stratusphere-dashboard/
├── main.go                          # Application entry point
├── internal/
│   ├── core/                        # Core application logic
│   │   ├── app.go                   # Main App struct and lifecycle
│   │   ├── app_resources.go         # Resource fetching methods (Get*)
│   │   ├── app_terraform.go         # Terraform generation logic
│   │   ├── auth.go                  # Authentication handlers
│   │   ├── config/                  # Wails configuration
│   │   └── terraform.go             # Terraform code generation engine
│   ├── aws/                         # AWS SDK integration layer
│   │   ├── client.go                # AWS client initialization
│   │   ├── fetch.go                 # Resource fetching (EC2, VPC, RDS, etc.)
│   │   ├── conversions.go           # AWS SDK → internal model conversions
│   │   └── topology.go              # Resource relationship graph builder
│   ├── auth/                        # Credential management
│   │   └── credentials.go           # AES-256-GCM encryption/decryption
│   ├── models/                      # Data models
│   │   ├── structs.go               # Resource info structs
│   │   ├── models.go                # Core domain models
│   │   └── conversions.go           # Type conversions
│   ├── constants/                   # Application constants
│   │   └── constants.go             # Hard-coded values (regions, timeouts, etc.)
│   └── logger/                      # Logging infrastructure
│       ├── logger.go                # Logger setup
│       └── config.go                # Log rotation configuration
├── frontend/
│   ├── dist/                        # Compiled frontend assets
│   └── wailsjs/                     # Auto-generated Wails bindings
├── build/                           # Build artifacts
│   └── bin/                         # Compiled executables
├── wails.json                       # Wails project configuration
├── go.mod                           # Go module dependencies
└── permissions.json                 # IAM policy template
```

---

## 🔧 Technical Implementation

### 1. AWS Client Architecture

**Initialization Flow**
```go
// internal/core/app.go
func (a *App) initializeAWSClient(ctx context.Context, creds *models.AWSCredentials) (*aws.AWSClient, error)
```

**Client Lifecycle**
1. **Credential Loading**: AES-256-GCM decryption from `~/.stratusphere/credentials.enc`
2. **SDK Configuration**: Static credentials provider with region override
3. **Service Clients**: Lazy initialization of AWS service clients (EC2, RDS, S3, etc.)
4. **Connection Validation**: STS `GetCallerIdentity` API call for credential verification

**Supported AWS Services**
- **EC2**: `github.com/aws/aws-sdk-go-v2/service/ec2` - Compute, VPC, Networking
- **RDS**: `github.com/aws/aws-sdk-go-v2/service/rds` - Relational databases
- **S3**: `github.com/aws/aws-sdk-go-v2/service/s3` - Object storage
- **ELBv2**: `github.com/aws/aws-sdk-go-v2/service/elasticloadbalancingv2` - Load balancers
- **Lambda**: `github.com/aws/aws-sdk-go-v2/service/lambda` - Serverless functions
- **ECS**: `github.com/aws/aws-sdk-go-v2/service/ecs` - Container orchestration
- **IAM**: `github.com/aws/aws-sdk-go-v2/service/iam` - Identity management
- **STS**: `github.com/aws/aws-sdk-go-v2/service/sts` - Security token service
- **CloudWatch**: `github.com/aws/aws-sdk-go-v2/service/cloudwatch` - Metrics
- **Cost Explorer**: `github.com/aws/aws-sdk-go-v2/service/costexplorer` - Cost analysis
- **Security Hub**: `github.com/aws/aws-sdk-go-v2/service/securityhub` - Security findings
- **Service Quotas**: `github.com/aws/aws-sdk-go-v2/service/servicequotas` - Quota management

### 2. Resource Discovery Engine

**Parallel Fetching Strategy**
```go
// internal/aws/fetch.go
func (c *AWSClient) FetchAllResources(ctx context.Context) (*ResourceSnapshot, error)
```

**Implementation Details**
- **Concurrency**: Goroutines with `sync.WaitGroup` for parallel API calls
- **Error Handling**: Partial failure tolerance (continue on individual service errors)
- **Pagination**: Automatic handling of AWS API pagination tokens
- **Rate Limiting**: Exponential backoff for `RequestLimitExceeded` errors

**Resource Types**
| Category | Resource | API Call | Model Struct |
|----------|----------|----------|--------------|
| **Network** | VPC | `DescribeVpcs` | `VPCInfo` |
| | Subnet | `DescribeSubnets` | `SubnetInfo` |
| | Route Table | `DescribeRouteTables` | `RouteTableInfo` |
| | NAT Gateway | `DescribeNatGateways` | `NATGatewayInfo` |
| | Elastic IP | `DescribeAddresses` | `ElasticIPInfo` |
| | Security Group | `DescribeSecurityGroups` | `SecurityGroupInfo` |
| **Compute** | EC2 Instance | `DescribeInstances` | `EC2InstanceInfo` |
| | ECS Cluster | `DescribeClusters` | `ECSClusterInfo` |
| | Lambda Function | `ListFunctions` | `LambdaFunctionInfo` |
| **Storage** | S3 Bucket | `ListBuckets` | `S3BucketInfo` |
| | RDS Instance | `DescribeDBInstances` | `RDSInstanceInfo` |
| **Load Balancing** | ALB/NLB | `DescribeLoadBalancers` | `LoadBalancerInfo` |
| | Target Group | `DescribeTargetGroups` | `TargetGroupInfo` |

### 3. Topology Graph Generation

**Graph Construction Algorithm**
```go
// internal/aws/topology.go
func BuildTopologyGraph(resources *ResourceSnapshot) *TopologyGraph
```

**Node Types**
- **VPC**: Root node for network hierarchy
- **Subnet**: Child of VPC, parent of instances
- **EC2/RDS/Lambda**: Leaf nodes attached to subnets
- **Security Group**: Cross-cutting edges (many-to-many)
- **Load Balancer**: Aggregation nodes with target group edges

**Edge Relationships**
```
VPC → Subnet (1:N)
Subnet → EC2 Instance (1:N)
EC2 Instance → Security Group (N:M)
Load Balancer → Target Group (1:N)
Target Group → EC2 Instance (N:M)
RDS Instance → Subnet (N:1)
NAT Gateway → Subnet (1:1)
```

**Frontend Rendering**
- **Library**: D3.js force-directed graph
- **Layout**: Hierarchical with collision detection
- **Interactions**: Drag, zoom, pan, node selection

### 4. Terraform Code Generation

**Reverse Engineering Pipeline**
```go
// internal/core/terraform.go
func GenerateTerraformCode(resources *ResourceSnapshot) (map[string]string, error)
```

**Generation Stages**
1. **Resource Normalization**: Convert AWS SDK types → Terraform resource schemas
2. **Dependency Resolution**: Build DAG of resource dependencies
3. **HCL Serialization**: Generate `.tf` files with proper syntax
4. **Variable Extraction**: Parameterize common values (CIDR blocks, instance types)
5. **State File Generation**: Create `terraform.tfstate` skeleton

**Supported Terraform Resources**
```hcl
# Network
resource "aws_vpc" "main" { ... }
resource "aws_subnet" "public" { ... }
resource "aws_internet_gateway" "igw" { ... }
resource "aws_nat_gateway" "nat" { ... }
resource "aws_route_table" "public" { ... }
resource "aws_security_group" "web" { ... }

# Compute
resource "aws_instance" "app" { ... }
resource "aws_lambda_function" "processor" { ... }

# Storage
resource "aws_s3_bucket" "data" { ... }
resource "aws_db_instance" "postgres" { ... }

# Load Balancing
resource "aws_lb" "alb" { ... }
resource "aws_lb_target_group" "tg" { ... }
```

**Output Format**
```
terraform/
├── main.tf           # Provider configuration
├── vpc.tf            # Network resources
├── compute.tf        # EC2, Lambda
├── storage.tf        # S3, RDS
├── loadbalancer.tf   # ALB, Target Groups
├── variables.tf      # Input variables
└── outputs.tf        # Output values
```

### 5. Credential Security

**Encryption Scheme**
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: 32-byte random salt per credential file
- **Nonce**: 12-byte random nonce per encryption operation

**Storage Location**
- **Windows**: `%APPDATA%\.stratusphere\credentials.enc`
- **macOS**: `~/Library/Application Support/stratusphere/credentials.enc`
- **Linux**: `~/.config/stratusphere/credentials.enc`

**Implementation**
```go
// internal/auth/credentials.go
func SaveCredentials(creds *models.AWSCredentials) error
func LoadCredentials() (*models.AWSCredentials, error)
func DeleteCredentials() error
```

---

## 🚀 Development Setup

### Prerequisites

| Dependency | Version | Purpose |
|------------|---------|---------|
| **Go** | 1.24.6+ | Backend runtime |
| **Wails CLI** | 2.11.0+ | Build toolchain |
| **GCC/MinGW** | Latest | CGO compilation (Windows) |
| **Node.js** | 16+ | Frontend tooling (optional) |

### Installation

```bash
# Clone repository
git clone https://github.com/doguhanniltextra/aws-stratusphere-dashboard.git
cd aws-stratusphere-dashboard

# Install Go dependencies
go mod download

# Install Wails CLI (if not installed)
go install github.com/wailsapp/wails/v2/cmd/wails@latest

# Verify installation
wails doctor
```

### Build Commands

**Development Mode** (Hot Reload)
```bash
wails dev
```
- Starts development server on `http://localhost:34115`
- Auto-reloads on Go/JS file changes
- Enables Chrome DevTools

**Production Build**
```bash
wails build
```
- Output: `build/bin/Stratusphere.exe` (Windows)
- Optimizations: `-ldflags="-s -w"` (strip debug symbols)
- Compression: UPX (optional)

**Platform-Specific Builds**
```bash
# Windows
wails build -platform windows/amd64

# macOS (Universal Binary)
wails build -platform darwin/universal

# Linux
wails build -platform linux/amd64
```

**Build Flags**
```bash
# Debug build with verbose logging
wails build -debug -v

# Production build with custom icon
wails build -ldflags "-s -w" -icon appicon.png

# Skip frontend build (use pre-built assets)
wails build -skipbindings
```

### Testing

**Unit Tests**
```bash
# Run all tests
go test ./...

# Run with coverage
go test -cover ./...

# Generate coverage report
go test -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

**Integration Tests**
```bash
# Requires AWS credentials in environment
export AWS_ACCESS_KEY_ID=xxx
export AWS_SECRET_ACCESS_KEY=yyy
export AWS_REGION=us-east-1

go test -tags=integration ./internal/aws/...
```

**Mocking AWS SDK**
```go
// internal/aws/client_test.go
type mockEC2Client struct {
    ec2.DescribeInstancesAPIClient
}

func (m *mockEC2Client) DescribeInstances(ctx context.Context, params *ec2.DescribeInstancesInput, optFns ...func(*ec2.Options)) (*ec2.DescribeInstancesOutput, error) {
    // Mock implementation
}
```

---

## 📊 Data Models

### Core Structs

**VPCInfo** (`internal/models/structs.go`)
```go
type VPCInfo struct {
    ID              string  // vpc-xxxxx
    Name            string  // From "Name" tag
    CIDRBlock       string  // 10.0.0.0/16
    IsDefault       bool    // AWS default VPC flag
    State           string  // available | pending
    OwnerId         string  // AWS account ID
    DhcpOptionsId   string  // dopt-xxxxx
    InstanceTenancy string  // default | dedicated
}
```

**EC2InstanceInfo**
```go
type EC2InstanceInfo struct {
    ID               string    // i-xxxxx
    Name             string    // From "Name" tag
    InstanceType     string    // t3.micro, m5.large, etc.
    State            string    // running | stopped | terminated
    PublicIPAddress  string    // 54.x.x.x
    PrivateIPAddress string    // 10.0.x.x
    LaunchTime       string    // RFC3339 timestamp
    VPCID            string    // vpc-xxxxx
    SubnetID         string    // subnet-xxxxx
    SecurityGroups   []string  // [sg-xxxxx, sg-yyyyy]
    KeyName          string    // SSH key pair name
    Platform         string    // windows | linux
    Architecture     string    // x86_64 | arm64
}
```

**SecurityGroupInfo**
```go
type SecurityGroupInfo struct {
    ID           string               // sg-xxxxx
    Name         string               // web-server-sg
    Description  string               // Security group description
    VPCID        string               // vpc-xxxxx
    IngressRules []SecurityGroupRule  // Inbound rules
    EgressRules  []SecurityGroupRule  // Outbound rules
}

type SecurityGroupRule struct {
    Protocol    string  // tcp | udp | icmp | -1 (all)
    FromPort    int32   // 80
    ToPort      int32   // 80
    CIDR        string  // 0.0.0.0/0 | sg-xxxxx
    Description string  // Allow HTTP traffic
}
```

**AccountHomeInfo** (Dashboard Aggregation)
```go
type AccountHomeInfo struct {
    // Account Metadata
    AccountID    string  // 123456789012
    AccountAlias string  // my-aws-account
    UserARN      string  // arn:aws:iam::123456789012:user/admin
    Region       string  // us-east-1
    
    // Cost Analysis (AWS Cost Explorer API)
    CostYesterday   float64  // 45.23 USD
    CostMonthToDate float64  // 1234.56 USD
    CostLastMonth   float64  // 2345.67 USD
    Currency        string   // USD
    
    // Service Quotas (AWS Service Quotas API)
    VPCLimit      int  // 5
    VPCUsage      int  // 3
    InstanceLimit int  // 20
    InstanceUsage int  // 12
    
    // Security Posture (AWS Security Hub)
    SecurityHubEnabled   bool              // true
    CriticalFindings     int               // 2
    HighFindings         int               // 5
    TopFindings          []SecurityFinding // Top 5 findings
    
    // Cost Optimization (AWS Trusted Advisor)
    PotentialSavings float64                        // 234.56 USD/month
    Recommendations  []TrustedAdvisorRecommendation // Idle resources, etc.
}
```

---

## 🔐 Security & IAM

### Minimum IAM Policy

**Read-Only Mode** (Visualization + Terraform Export)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StratusphereReadOnly",
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "rds:Describe*",
        "s3:ListAllMyBuckets",
        "s3:GetBucketLocation",
        "elasticloadbalancing:Describe*",
        "lambda:ListFunctions",
        "lambda:GetFunction",
        "ecs:DescribeClusters",
        "ecs:ListClusters",
        "iam:GetUser",
        "iam:GetAccountSummary",
        "sts:GetCallerIdentity",
        "cloudwatch:GetMetricStatistics",
        "ce:GetCostAndUsage",
        "servicequotas:GetServiceQuota",
        "servicequotas:ListServiceQuotas",
        "securityhub:GetFindings",
        "support:DescribeTrustedAdvisorChecks"
      ],
      "Resource": "*"
    }
  ]
}
```

**Full Access Mode** (Resource Management)
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "StratusphereFullAccess",
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "rds:*",
        "s3:*",
        "elasticloadbalancing:*",
        "lambda:*",
        "ecs:*",
        "iam:PassRole",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:AttachRolePolicy"
      ],
      "Resource": "*"
    }
  ]
}
```

### Credential Storage Security

**Threat Model**
- ✅ **Protected Against**: Disk theft (encrypted at rest)
- ✅ **Protected Against**: Memory dumps (credentials cleared after use)
- ❌ **NOT Protected Against**: Root/admin access to running process
- ❌ **NOT Protected Against**: Malware with process injection capabilities

**Best Practices**
1. Use IAM roles with temporary credentials (STS AssumeRole)
2. Enable MFA for IAM users
3. Rotate access keys every 90 days
4. Use least-privilege IAM policies
5. Enable CloudTrail for API call auditing

---

## 🐛 Troubleshooting

### Common Issues

**1. Build Fails with CGO Errors**
```
# github.com/wailsapp/wails/v2
cgo: C compiler "gcc" not found
```

**Solution (Windows)**:
```bash
# Install MinGW-w64
choco install mingw

# Or download from: https://www.mingw-w64.org/
```

**Solution (macOS)**:
```bash
xcode-select --install
```

**2. AWS API Rate Limiting**
```
RequestLimitExceeded: Rate exceeded
```

**Solution**: Implement exponential backoff (already implemented in `internal/aws/fetch.go`)

**3. Credentials Not Loading**
```
Error: failed to load credentials: cipher: message authentication failed
```

**Causes**:
- Corrupted credentials file
- Wrong encryption key (file modified externally)

**Solution**:
```bash
# Delete credentials file and re-authenticate
rm ~/.config/stratusphere/credentials.enc  # Linux/macOS
del %APPDATA%\.stratusphere\credentials.enc  # Windows
```

**4. Missing Resources in UI**
```
VPCs showing but no EC2 instances
```

**Checklist**:
- ✅ Correct region selected?
- ✅ IAM policy includes `ec2:DescribeInstances`?
- ✅ Instances exist in the selected region?
- ✅ Check application logs: `~/.stratusphere/logs/app.log`

**5. Terraform Generation Fails**
```
Error: unsupported resource type: aws_ecs_service
```

**Cause**: Resource type not yet implemented in Terraform generator

**Workaround**: Manually add resource to generated `.tf` files

---

## 📈 Performance Optimization

### Resource Fetching
- **Parallel API Calls**: 10-15 concurrent goroutines
- **Caching**: 5-minute TTL for resource snapshots
- **Pagination**: Automatic handling of 1000+ resources

### Memory Usage
- **Baseline**: ~50 MB (idle)
- **Peak**: ~200 MB (1000+ resources loaded)
- **Optimization**: Struct field alignment, pointer reuse

### Startup Time
- **Cold Start**: ~2 seconds (credential decryption + AWS client init)
- **Warm Start**: ~500 ms (cached credentials)

---

## 🧪 Testing Strategy

### Unit Tests
- **Coverage Target**: 80%+
- **Mocking**: AWS SDK clients with interfaces
- **Test Files**: `*_test.go` alongside implementation

### Integration Tests
- **Tag**: `-tags=integration`
- **Requirements**: Live AWS account with test resources
- **Cleanup**: Automatic resource deletion after tests

### E2E Tests
- **Framework**: Wails test harness
- **Scenarios**: Login flow, resource fetching, Terraform export
- **CI/CD**: GitHub Actions with AWS credentials in secrets

---

## 📦 Deployment

### Release Process
1. **Version Bump**: Update `wails.json` → `productVersion`
2. **Build**: `wails build -clean -platform windows/amd64,darwin/universal,linux/amd64`
3. **Sign**: Code signing (Windows: Authenticode, macOS: notarization)
4. **Package**: Create installers (NSIS for Windows, DMG for macOS)
5. **Publish**: GitHub Releases with auto-update manifest

### Auto-Update Configuration
```json
{
  "version": "1.0.0",
  "url": "https://github.com/doguhanniltextra/aws-stratusphere-dashboard/releases/download/v1.0.0/Stratusphere-windows-amd64.exe",
  "sha256": "abc123..."
}
```

---

## 🤝 Contributing

### Code Style
- **Go**: `gofmt` + `golangci-lint`
- **JavaScript**: ESLint with Airbnb config
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`)

### Pull Request Checklist
- [ ] Tests pass (`go test ./...`)
- [ ] Linting passes (`golangci-lint run`)
- [ ] Documentation updated
- [ ] CHANGELOG.md entry added

---

## 📄 License

MIT License - See [LICENSE.md](LICENSE.md)

---

## 🔗 References

- **Wails Documentation**: https://wails.io/docs/introduction
- **AWS SDK for Go v2**: https://aws.github.io/aws-sdk-go-v2/docs/
- **Terraform Provider AWS**: https://registry.terraform.io/providers/hashicorp/aws/latest/docs
