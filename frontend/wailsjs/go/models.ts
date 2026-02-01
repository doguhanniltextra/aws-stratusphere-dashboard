export namespace models {
	
	export class SecurityFinding {
	    title: string;
	    severity: string;
	    resource_id: string;
	    category: string;
	    updated_at: string;
	
	    static createFrom(source: any = {}) {
	        return new SecurityFinding(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.title = source["title"];
	        this.severity = source["severity"];
	        this.resource_id = source["resource_id"];
	        this.category = source["category"];
	        this.updated_at = source["updated_at"];
	    }
	}
	export class TrustedAdvisorRecommendation {
	    check_name: string;
	    category: string;
	    status: string;
	    estimated_savings: number;
	
	    static createFrom(source: any = {}) {
	        return new TrustedAdvisorRecommendation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.check_name = source["check_name"];
	        this.category = source["category"];
	        this.status = source["status"];
	        this.estimated_savings = source["estimated_savings"];
	    }
	}
	export class AccountHomeInfo {
	    account_id: string;
	    account_alias: string;
	    user_arn: string;
	    region: string;
	    creation_date: string;
	    mfa_enabled: boolean;
	    cost_yesterday: number;
	    cost_month_to_date: number;
	    cost_last_month: number;
	    currency: string;
	    vpc_limit: number;
	    vpc_usage: number;
	    instance_limit: number;
	    instance_usage: number;
	    eip_limit: number;
	    eip_usage: number;
	    nat_limit: number;
	    nat_usage: number;
	    lambda_limit: number;
	    lambda_usage: number;
	    s3_limit: number;
	    s3_usage: number;
	    security_hub_enabled: boolean;
	    support_access_enabled: boolean;
	    critical_findings: number;
	    high_findings: number;
	    potential_savings: number;
	    recommendations: TrustedAdvisorRecommendation[];
	    top_findings: SecurityFinding[];
	
	    static createFrom(source: any = {}) {
	        return new AccountHomeInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.account_id = source["account_id"];
	        this.account_alias = source["account_alias"];
	        this.user_arn = source["user_arn"];
	        this.region = source["region"];
	        this.creation_date = source["creation_date"];
	        this.mfa_enabled = source["mfa_enabled"];
	        this.cost_yesterday = source["cost_yesterday"];
	        this.cost_month_to_date = source["cost_month_to_date"];
	        this.cost_last_month = source["cost_last_month"];
	        this.currency = source["currency"];
	        this.vpc_limit = source["vpc_limit"];
	        this.vpc_usage = source["vpc_usage"];
	        this.instance_limit = source["instance_limit"];
	        this.instance_usage = source["instance_usage"];
	        this.eip_limit = source["eip_limit"];
	        this.eip_usage = source["eip_usage"];
	        this.nat_limit = source["nat_limit"];
	        this.nat_usage = source["nat_usage"];
	        this.lambda_limit = source["lambda_limit"];
	        this.lambda_usage = source["lambda_usage"];
	        this.s3_limit = source["s3_limit"];
	        this.s3_usage = source["s3_usage"];
	        this.security_hub_enabled = source["security_hub_enabled"];
	        this.support_access_enabled = source["support_access_enabled"];
	        this.critical_findings = source["critical_findings"];
	        this.high_findings = source["high_findings"];
	        this.potential_savings = source["potential_savings"];
	        this.recommendations = this.convertValues(source["recommendations"], TrustedAdvisorRecommendation);
	        this.top_findings = this.convertValues(source["top_findings"], SecurityFinding);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ConfigurationInfo {
	    Region: string;
	    AccountID: string;
	    UserARN: string;
	    IsAdmin: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ConfigurationInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Region = source["Region"];
	        this.AccountID = source["AccountID"];
	        this.UserARN = source["UserARN"];
	        this.IsAdmin = source["IsAdmin"];
	    }
	}
	export class EC2InstanceInfo {
	    ID: string;
	    Name: string;
	    InstanceType: string;
	    State: string;
	    PublicIPAddress: string;
	    PrivateIPAddress: string;
	    LaunchTime: string;
	    VPCID: string;
	    SubnetID: string;
	    SecurityGroups: string[];
	    KeyName: string;
	    Platform: string;
	    Architecture: string;
	
	    static createFrom(source: any = {}) {
	        return new EC2InstanceInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	        this.InstanceType = source["InstanceType"];
	        this.State = source["State"];
	        this.PublicIPAddress = source["PublicIPAddress"];
	        this.PrivateIPAddress = source["PrivateIPAddress"];
	        this.LaunchTime = source["LaunchTime"];
	        this.VPCID = source["VPCID"];
	        this.SubnetID = source["SubnetID"];
	        this.SecurityGroups = source["SecurityGroups"];
	        this.KeyName = source["KeyName"];
	        this.Platform = source["Platform"];
	        this.Architecture = source["Architecture"];
	    }
	}
	export class ECSClusterInfo {
	    ClusterName: string;
	    ClusterArn: string;
	    Status: string;
	    RegisteredInstances: number;
	    RunningTasks: number;
	    PendingTasks: number;
	    ActiveServices: number;
	
	    static createFrom(source: any = {}) {
	        return new ECSClusterInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ClusterName = source["ClusterName"];
	        this.ClusterArn = source["ClusterArn"];
	        this.Status = source["Status"];
	        this.RegisteredInstances = source["RegisteredInstances"];
	        this.RunningTasks = source["RunningTasks"];
	        this.PendingTasks = source["PendingTasks"];
	        this.ActiveServices = source["ActiveServices"];
	    }
	}
	export class ElasticIPInfo {
	    PublicIP: string;
	    AllocationID: string;
	    AssociationID: string;
	    InstanceID: string;
	    PrivateIP: string;
	    NetworkInterfaceID: string;
	    NetworkInterfaceOwnerID: string;
	    Tags: Record<string, string>;
	
	    static createFrom(source: any = {}) {
	        return new ElasticIPInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.PublicIP = source["PublicIP"];
	        this.AllocationID = source["AllocationID"];
	        this.AssociationID = source["AssociationID"];
	        this.InstanceID = source["InstanceID"];
	        this.PrivateIP = source["PrivateIP"];
	        this.NetworkInterfaceID = source["NetworkInterfaceID"];
	        this.NetworkInterfaceOwnerID = source["NetworkInterfaceOwnerID"];
	        this.Tags = source["Tags"];
	    }
	}
	export class LambdaFunctionInfo {
	    FunctionName: string;
	    Runtime: string;
	    MemorySize: number;
	    LastModified: string;
	    Handler: string;
	    Description: string;
	    Arn: string;
	    State: string;
	
	    static createFrom(source: any = {}) {
	        return new LambdaFunctionInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.FunctionName = source["FunctionName"];
	        this.Runtime = source["Runtime"];
	        this.MemorySize = source["MemorySize"];
	        this.LastModified = source["LastModified"];
	        this.Handler = source["Handler"];
	        this.Description = source["Description"];
	        this.Arn = source["Arn"];
	        this.State = source["State"];
	    }
	}
	export class LoadBalancerInfo {
	    Name: string;
	    ARN: string;
	    DNSName: string;
	    Type: string;
	    Scheme: string;
	    State: string;
	    VPCID: string;
	    AvailabilityZones: string[];
	
	    static createFrom(source: any = {}) {
	        return new LoadBalancerInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.ARN = source["ARN"];
	        this.DNSName = source["DNSName"];
	        this.Type = source["Type"];
	        this.Scheme = source["Scheme"];
	        this.State = source["State"];
	        this.VPCID = source["VPCID"];
	        this.AvailabilityZones = source["AvailabilityZones"];
	    }
	}
	export class MetricData {
	    label: string;
	    values: number[];
	    times: string[];
	
	    static createFrom(source: any = {}) {
	        return new MetricData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.label = source["label"];
	        this.values = source["values"];
	        this.times = source["times"];
	    }
	}
	export class NATGatewayInfo {
	    ID: string;
	    Name: string;
	    State: string;
	    SubnetID: string;
	    VPCID: string;
	    PublicIP: string;
	    PrivateIP: string;
	    ConnectivityType: string;
	
	    static createFrom(source: any = {}) {
	        return new NATGatewayInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	        this.State = source["State"];
	        this.SubnetID = source["SubnetID"];
	        this.VPCID = source["VPCID"];
	        this.PublicIP = source["PublicIP"];
	        this.PrivateIP = source["PrivateIP"];
	        this.ConnectivityType = source["ConnectivityType"];
	    }
	}
	export class PermissionStatus {
	    Action: string;
	    Allowed: boolean;
	    Reason: string;
	
	    static createFrom(source: any = {}) {
	        return new PermissionStatus(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Action = source["Action"];
	        this.Allowed = source["Allowed"];
	        this.Reason = source["Reason"];
	    }
	}
	export class RDSInstanceInfo {
	    DBInstanceIdentifier: string;
	    Engine: string;
	    EngineVersion: string;
	    DBInstanceStatus: string;
	    Endpoint: string;
	    AllocatedStorage: number;
	    DBInstanceClass: string;
	    VpcId: string;
	    AvailabilityZone: string;
	    MultiAZ: boolean;
	    PubliclyAccessible: boolean;
	    MasterUsername: string;
	
	    static createFrom(source: any = {}) {
	        return new RDSInstanceInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.DBInstanceIdentifier = source["DBInstanceIdentifier"];
	        this.Engine = source["Engine"];
	        this.EngineVersion = source["EngineVersion"];
	        this.DBInstanceStatus = source["DBInstanceStatus"];
	        this.Endpoint = source["Endpoint"];
	        this.AllocatedStorage = source["AllocatedStorage"];
	        this.DBInstanceClass = source["DBInstanceClass"];
	        this.VpcId = source["VpcId"];
	        this.AvailabilityZone = source["AvailabilityZone"];
	        this.MultiAZ = source["MultiAZ"];
	        this.PubliclyAccessible = source["PubliclyAccessible"];
	        this.MasterUsername = source["MasterUsername"];
	    }
	}
	export class ResourceMetrics {
	    metrics: MetricData[];
	
	    static createFrom(source: any = {}) {
	        return new ResourceMetrics(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.metrics = this.convertValues(source["metrics"], MetricData);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RouteTableInfo {
	    ID: string;
	    Name: string;
	    VPCID: string;
	    IsMain: boolean;
	    Routes: number;
	    Subnets: number;
	    SubnetIDs: string[];
	
	    static createFrom(source: any = {}) {
	        return new RouteTableInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	        this.VPCID = source["VPCID"];
	        this.IsMain = source["IsMain"];
	        this.Routes = source["Routes"];
	        this.Subnets = source["Subnets"];
	        this.SubnetIDs = source["SubnetIDs"];
	    }
	}
	export class S3BucketInfo {
	    Name: string;
	    Region: string;
	    CreationDate: string;
	    Versioning: string;
	    PublicAccess: boolean;
	    Encryption: boolean;
	
	    static createFrom(source: any = {}) {
	        return new S3BucketInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.Region = source["Region"];
	        this.CreationDate = source["CreationDate"];
	        this.Versioning = source["Versioning"];
	        this.PublicAccess = source["PublicAccess"];
	        this.Encryption = source["Encryption"];
	    }
	}
	
	export class SecurityGroupRule {
	    Protocol: string;
	    FromPort: number;
	    ToPort: number;
	    CIDR: string;
	    Description: string;
	
	    static createFrom(source: any = {}) {
	        return new SecurityGroupRule(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Protocol = source["Protocol"];
	        this.FromPort = source["FromPort"];
	        this.ToPort = source["ToPort"];
	        this.CIDR = source["CIDR"];
	        this.Description = source["Description"];
	    }
	}
	export class SecurityGroupInfo {
	    ID: string;
	    Name: string;
	    Description: string;
	    VPCID: string;
	    IngressRules: SecurityGroupRule[];
	    EgressRules: SecurityGroupRule[];
	
	    static createFrom(source: any = {}) {
	        return new SecurityGroupInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	        this.Description = source["Description"];
	        this.VPCID = source["VPCID"];
	        this.IngressRules = this.convertValues(source["IngressRules"], SecurityGroupRule);
	        this.EgressRules = this.convertValues(source["EgressRules"], SecurityGroupRule);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class SubnetInfo {
	    ID: string;
	    CIDRBlock: string;
	    Name: string;
	    VPCID: string;
	    AvailabilityZone: string;
	    State: string;
	    MapPublicIPOnLaunch: boolean;
	    AvailableIpAddressCount: number;
	
	    static createFrom(source: any = {}) {
	        return new SubnetInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.CIDRBlock = source["CIDRBlock"];
	        this.Name = source["Name"];
	        this.VPCID = source["VPCID"];
	        this.AvailabilityZone = source["AvailabilityZone"];
	        this.State = source["State"];
	        this.MapPublicIPOnLaunch = source["MapPublicIPOnLaunch"];
	        this.AvailableIpAddressCount = source["AvailableIpAddressCount"];
	    }
	}
	export class TargetGroupInfo {
	    Name: string;
	    ARN: string;
	    Protocol: string;
	    Port: number;
	    TargetType: string;
	    VPCID: string;
	    HealthyCount: number;
	    UnhealthyCount: number;
	    HealthCheckPath: string;
	
	    static createFrom(source: any = {}) {
	        return new TargetGroupInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Name = source["Name"];
	        this.ARN = source["ARN"];
	        this.Protocol = source["Protocol"];
	        this.Port = source["Port"];
	        this.TargetType = source["TargetType"];
	        this.VPCID = source["VPCID"];
	        this.HealthyCount = source["HealthyCount"];
	        this.UnhealthyCount = source["UnhealthyCount"];
	        this.HealthCheckPath = source["HealthCheckPath"];
	    }
	}
	
	export class VPCInfo {
	    ID: string;
	    Name: string;
	    CIDRBlock: string;
	    IsDefault: boolean;
	    IsMain: boolean;
	    State: string;
	    OwnerId: string;
	    DhcpOptionsId: string;
	    InstanceTenancy: string;
	
	    static createFrom(source: any = {}) {
	        return new VPCInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Name = source["Name"];
	        this.CIDRBlock = source["CIDRBlock"];
	        this.IsDefault = source["IsDefault"];
	        this.IsMain = source["IsMain"];
	        this.State = source["State"];
	        this.OwnerId = source["OwnerId"];
	        this.DhcpOptionsId = source["DhcpOptionsId"];
	        this.InstanceTenancy = source["InstanceTenancy"];
	    }
	}

}

