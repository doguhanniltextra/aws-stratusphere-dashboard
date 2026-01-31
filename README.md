<div align="center">
  <img src="./appicon.png" alt="Stratusphere Logo" width="200"/>
  
  # Stratusphere
  
  **Cloud Infrastructure Visualization & Management**
  
  A powerful desktop application for visualizing and managing AWS cloud infrastructure with interactive topology maps, comprehensive resource management, and Infrastructure-as-Code generation.
</div>

## 📖 Overview

Stratusphere provides a unified interface to your AWS environment. Unlike the standard AWS Management Console, Stratusphere allows you to:
- **Visualize** relationships between resources (VPCs, Subnets, EC2, etc.) in an interactive graph.
- **Export** existing infrastructure to Terraform code instantly.
- **Manage** resources across multiple services from a single dashboard.

## 🚀 Getting Started

### Prerequisites

To build and run from source, you need:
- [Go](https://go.dev/) 1.21+
- [Node.js](https://nodejs.org/) 16+
- [Wails CLI](https://wails.io/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/doguhanniltextra/aws-terminal-sdk.git
   cd aws-terminal-sdk
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Run in Development Mode**
   ```bash
   wails dev
   ```

4. **Build for Production**
   ```bash
   wails build
   ```
   The executable will be generated in the `build/bin` directory.

---

## ⚙️ Configuration & Setup

### First Launch & Credentials

Stratusphere processes all data locally on your machine. No keys are sent to any third-party server.

1. Launch the application.
2. You will be presented with the **Setup Screen**.
3. Enter your AWS Credentials:
   - **Access Key ID**
   - **Secret Access Key**
   - **Region** (e.g., `us-east-1`)
4. Click **Test Connection** to verify permissions.
5. Click **Save & Continue**. Credentials are encrypted and stored locally.

> **Note**: To reset credentials later, use the "Logout" button in the sidebar.

---

## 🖥️ Usage Guide

### 1. Resource Dashboard
Navigate through your infrastructure using the sidebar. Supported resources include:
- **Network**: VPCs, Subnets, Route Tables, NAT Gateways, Elastic IPs.
- **Compute**: EC2 Instances, ECS Clusters, Lambda Functions.
- **Storage & Database**: S3 Buckets, RDS Databases.
- **Load Balancing**: Application Load Balancers, Target Groups.

### 2. Interactive Topology
Click on the **Topology** tab to see a visual graph of your infrastructure.
- **Nodes** represent resources (EC2, RDS, etc.).
- **Edges** represent relationships (e.g., EC2 -> Subnet -> VPC).
- **Interact**: Drag nodes to rearrange the view. Zoom in/out for details.

### 3. Terraform Gen (Export to IaC)
Turn your existing setup into reproducible code.
1. Navigate to the **Terraform Gen** section.
2. Review the detected resources.
3. Click **Generate Terraform Code**.
4. The application will generate full `.tf` configuration files.
5. Click **Save to File** to export them to your local machine.

---

## 🔒 Security & Permissions

### IAM Policy
To function correctly, the IAM User for Stratusphere requires the following permissions. You can attach this policy to your user:

<details>
<summary><strong>View Required IAM Policy (JSON)</strong></summary>

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "StratuspherePermissions",
            "Effect": "Allow",
            "Action": [
                "ec2:Describe*",
                "ec2:CreateVpc", "ec2:DeleteVpc", "ec2:ModifyVpcAttribute",
                "ec2:CreateSubnet", "ec2:DeleteSubnet",
                "ec2:CreateInternetGateway", "ec2:DeleteInternetGateway", "ec2:AttachInternetGateway", "ec2:DetachInternetGateway",
                "ec2:CreateNatGateway", "ec2:DeleteNatGateway",
                "ec2:AllocateAddress", "ec2:ReleaseAddress",
                "ec2:CreateRouteTable", "ec2:DeleteRouteTable", "ec2:CreateRoute", "ec2:AssociateRouteTable", "ec2:DisassociateRouteTable",
                "ec2:CreateSecurityGroup", "ec2:DeleteSecurityGroup", "ec2:AuthorizeSecurityGroupIngress", "ec2:RevokeSecurityGroupIngress", "ec2:AuthorizeSecurityGroupEgress", "ec2:RevokeSecurityGroupEgress",
                "ec2:RunInstances", "ec2:TerminateInstances", "ec2:StopInstances", "ec2:StartInstances",
                "ec2:CreateTags", "ec2:DeleteTags",
                "ec2:CreateKeyPair", "ec2:DeleteKeyPair",
                "rds:Describe*", "rds:CreateDBInstance", "rds:DeleteDBInstance", "rds:ModifyDBInstance",
                "rds:CreateDBSubnetGroup", "rds:DeleteDBSubnetGroup",
                "elasticloadbalancing:Describe*", "elasticloadbalancing:Create*", "elasticloadbalancing:Delete*", "elasticloadbalancing:Modify*", "elasticloadbalancing:RegisterTargets", "elasticloadbalancing:DeregisterTargets",
                "s3:ListAllMyBuckets", "s3:GetBucketLocation", "s3:CreateBucket", "s3:DeleteBucket",
                "lambda:GetFunction", "lambda:CreateFunction", "lambda:DeleteFunction", "lambda:UpdateFunction*", "lambda:ListFunctions",
                "iam:GetRole", "iam:CreateRole", "iam:DeleteRole", "iam:PassRole", "iam:AttachRolePolicy", "iam:DetachRolePolicy", "iam:ListAttachedRolePolicies"
            ],
            "Resource": "*"
        }
    ]
}
```
</details>

### Data Privacy
- **Local Execution**: All API calls originate from your local IP.
- **Encryption**: Credentials are encrypted before saving to disk.

---

## ❓ Troubleshooting

**Connection Failed?**
- Verify your PC clock is synced (AWS rejects requests with skewed timestamps).
- Check if your IAM User has the policy listed above.
- Ensure you have an active internet connection.

**Resources Not Showing?**
- Confirm you selected the correct **Region** during setup.
- Verify `Describe*` permissions are allowed in your policy.

---

## 📄 License

MIT License
