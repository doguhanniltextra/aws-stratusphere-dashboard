import * as state from './state.js';

export function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    let csv = headers.join(',') + '\n';
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            // Handle arrays
            if (Array.isArray(value)) {
                return `"${value.join('; ')}"`;
            }
            // Handle objects
            if (typeof value === 'object' && value !== null) {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            }
            // Handle strings with commas or quotes
            const stringValue = String(value || '');
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        });
        csv += values.join(',') + '\n';
    });

    downloadFile(csv, filename, 'text/csv');
}

export function exportToJSON(data, filename) {
    if (!data || data.length === 0) {
        alert('No data to export');
        return;
    }

    const json = JSON.stringify(data, null, 2);
    downloadFile(json, filename, 'application/json');
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function initExport() {
    const csvBtn = document.getElementById('exportCSV');
    const jsonBtn = document.getElementById('exportJSON');

    if (!csvBtn || !jsonBtn) return;

    csvBtn.addEventListener('click', () => {
        const currentPage = state.currentPage;
        const timestamp = new Date().toISOString().split('T')[0];

        switch (currentPage) {
            case 'vpc-list':
                exportToCSV(state.filteredVPCs, `vpcs-${timestamp}.csv`);
                break;
            case 'ec2-list':
                exportToCSV(state.filteredEC2Instances, `ec2-instances-${timestamp}.csv`);
                break;
            case 'ecs-list':
                exportToCSV(state.filteredECSClusters, `ecs-clusters-${timestamp}.csv`);
                break;
            case 'subnet-list':
                exportToCSV(state.filteredSubnets, `subnets-${timestamp}.csv`);
                break;
            case 'securitygroup-list':
                exportToCSV(state.filteredSecurityGroups, `security-groups-${timestamp}.csv`);
                break;
            case 'natgateway-list':
                exportToCSV(state.filteredNATGateways, `nat-gateways-${timestamp}.csv`);
                break;
            case 'routetable-list':
                exportToCSV(state.filteredRouteTables, `route-tables-${timestamp}.csv`);
                break;
            case 's3-list':
                exportToCSV(state.filteredS3Buckets, `s3-buckets-${timestamp}.csv`);
                break;
            case 'targetgroup-list':
                exportToCSV(state.filteredTargetGroups, `target-groups-${timestamp}.csv`);
                break;
            case 'loadbalancer-list':
                exportToCSV(state.filteredLoadBalancers, `load-balancers-${timestamp}.csv`);
                break;
            case 'elasticip-list':
                exportToCSV(state.filteredElasticIPs, `elastic-ips-${timestamp}.csv`);
                break;
            case 'lambda-list':
                exportToCSV(state.filteredLambdaFunctions, `lambda-functions-${timestamp}.csv`);
                break;
            case 'rds-list':
                exportToCSV(state.filteredRDSInstances, `rds-instances-${timestamp}.csv`);
                break;
            default:
                alert('No data to export from current view');
        }
    });

    jsonBtn.addEventListener('click', () => {
        const currentPage = state.currentPage;
        const timestamp = new Date().toISOString().split('T')[0];

        switch (currentPage) {
            case 'vpc-list':
                exportToJSON(state.filteredVPCs, `vpcs-${timestamp}.json`);
                break;
            case 'ec2-list':
                exportToJSON(state.filteredEC2Instances, `ec2-instances-${timestamp}.json`);
                break;
            case 'ecs-list':
                exportToJSON(state.filteredECSClusters, `ecs-clusters-${timestamp}.json`);
                break;
            case 'subnet-list':
                exportToJSON(state.filteredSubnets, `subnets-${timestamp}.json`);
                break;
            case 'securitygroup-list':
                exportToJSON(state.filteredSecurityGroups, `security-groups-${timestamp}.json`);
                break;
            case 'natgateway-list':
                exportToJSON(state.filteredNATGateways, `nat-gateways-${timestamp}.json`);
                break;
            case 'routetable-list':
                exportToJSON(state.filteredRouteTables, `route-tables-${timestamp}.json`);
                break;
            case 's3-list':
                exportToJSON(state.filteredS3Buckets, `s3-buckets-${timestamp}.json`);
                break;
            case 'targetgroup-list':
                exportToJSON(state.filteredTargetGroups, `target-groups-${timestamp}.json`);
                break;
            case 'loadbalancer-list':
                exportToJSON(state.filteredLoadBalancers, `load-balancers-${timestamp}.json`);
                break;
            case 'elasticip-list':
                exportToJSON(state.filteredElasticIPs, `elastic-ips-${timestamp}.json`);
                break;
            case 'lambda-list':
                exportToJSON(state.filteredLambdaFunctions, `lambda-functions-${timestamp}.json`);
                break;
            case 'rds-list':
                exportToJSON(state.filteredRDSInstances, `rds-instances-${timestamp}.json`);
                break;
            default:
                alert('No data to export from current view');
        }
    });
}
