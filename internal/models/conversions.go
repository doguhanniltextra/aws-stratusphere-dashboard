package models

import (
	"aws-terminal-sdk-v1/internal/constants"

	"github.com/aws/aws-sdk-go-v2/service/ec2/types"
	elbv2Types "github.com/aws/aws-sdk-go-v2/service/elasticloadbalancingv2/types"
	s3Types "github.com/aws/aws-sdk-go-v2/service/s3/types"
)

// FromAWSNATGateway converts AWS NAT Gateway to our model
func FromAWSNATGateway(nat types.NatGateway) NATGatewayInfo {
	natInfo := NATGatewayInfo{
		ID:               safeString(nat.NatGatewayId),
		State:            string(nat.State),
		SubnetID:         safeString(nat.SubnetId),
		VPCID:            safeString(nat.VpcId),
		ConnectivityType: string(nat.ConnectivityType),
	}

	// Extract IPs
	if len(nat.NatGatewayAddresses) > 0 {
		natInfo.PublicIP = safeString(nat.NatGatewayAddresses[0].PublicIp)
		natInfo.PrivateIP = safeString(nat.NatGatewayAddresses[0].PrivateIp)
	}

	// Extract Name from tags
	for _, tag := range nat.Tags {
		if tag.Key != nil && *tag.Key == constants.TagName {
			natInfo.Name = safeString(tag.Value)
			break
		}
	}

	return natInfo
}

// FromAWSRouteTable converts AWS Route Table to our model
func FromAWSRouteTable(rt types.RouteTable) RouteTableInfo {
	rtInfo := RouteTableInfo{
		ID:      safeString(rt.RouteTableId),
		VPCID:   safeString(rt.VpcId),
		IsMain:  false,
		Routes:  len(rt.Routes),
		Subnets: len(rt.Associations),
	}

	// Check if main route table and extract subnet IDs
	for _, assoc := range rt.Associations {
		if assoc.Main != nil && *assoc.Main {
			rtInfo.IsMain = true
		}
		if assoc.SubnetId != nil {
			rtInfo.SubnetIDs = append(rtInfo.SubnetIDs, safeString(assoc.SubnetId))
		}
	}

	// Extract Name from tags
	for _, tag := range rt.Tags {
		if tag.Key != nil && *tag.Key == constants.TagName {
			rtInfo.Name = safeString(tag.Value)
			break
		}
	}

	return rtInfo
}

// FromAWSS3Bucket converts AWS S3 Bucket to our model
func FromAWSS3Bucket(bucket s3Types.Bucket, region string) S3BucketInfo {
	s3Info := S3BucketInfo{
		Name:         safeString(bucket.Name),
		Region:       region,
		CreationDate: bucket.CreationDate.Format(constants.DateFormat),
		Versioning:   constants.S3VerDisabled,
		PublicAccess: false,
		Encryption:   false,
	}

	return s3Info
}

// FromAWSTargetGroup converts AWS Target Group to our model
func FromAWSTargetGroup(tg elbv2Types.TargetGroup) TargetGroupInfo {
	tgInfo := TargetGroupInfo{
		Name:            safeString(tg.TargetGroupName),
		ARN:             safeString(tg.TargetGroupArn),
		Protocol:        string(tg.Protocol),
		Port:            safeInt32(tg.Port),
		TargetType:      string(tg.TargetType),
		VPCID:           safeString(tg.VpcId),
		HealthCheckPath: safeString(tg.HealthCheckPath),
	}

	return tgInfo
}

// FromAWSLoadBalancer converts AWS Load Balancer to our model
func FromAWSLoadBalancer(lb elbv2Types.LoadBalancer) LoadBalancerInfo {
	lbInfo := LoadBalancerInfo{
		Name:    safeString(lb.LoadBalancerName),
		ARN:     safeString(lb.LoadBalancerArn),
		DNSName: safeString(lb.DNSName),
		Type:    string(lb.Type),
		Scheme:  string(lb.Scheme),
		State:   string(lb.State.Code),
		VPCID:   safeString(lb.VpcId),
	}

	// Extract AZs
	for _, az := range lb.AvailabilityZones {
		lbInfo.AvailabilityZones = append(lbInfo.AvailabilityZones, safeString(az.ZoneName))
	}

	return lbInfo
}
