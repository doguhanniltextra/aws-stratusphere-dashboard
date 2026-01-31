
export const vpcGrid = document.getElementById('vpcGrid');
export const vpcTableContainer = document.getElementById('vpcTable');
export const vpcTableBody = document.getElementById('vpcTableBody');
// New Table Containers
export const natTableContainer = document.getElementById('natTable');
export const natTableBody = document.getElementById('natTableBody');
export const routeTableContainer = document.getElementById('routeTable');
export const routeTableBody = document.getElementById('routeTableBody');
export const s3TableContainer = document.getElementById('s3Table');
export const s3TableBody = document.getElementById('s3TableBody');
export const tgTableContainer = document.getElementById('targetGroupTable');
export const tgTableBody = document.getElementById('targetGroupTableBody');
export const lbTableContainer = document.getElementById('lbTable');
export const lbTableBody = document.getElementById('lbTableBody');
export const securityGroupTableContainer = document.getElementById('securityGroupTable');
export const securityGroupTableBody = document.getElementById('securityGroupTableBody');
export const eipTableContainer = document.getElementById('eipTable');
export const eipTableBody = document.getElementById('eipTableBody');
export const lambdaTableContainer = document.getElementById('lambdaTable');
export const lambdaTableBody = document.getElementById('lambdaTableBody');
export const rdsTableContainer = document.getElementById('rdsTable');
export const rdsTableBody = document.getElementById('rdsTableBody');

export const statusText = document.getElementById('statusText');
export const loadingBar = document.getElementById('loadingBar');
export const refreshBtn = document.getElementById('refreshBtn');
export const searchInput = document.getElementById('searchInput');
export const cardViewBtn = document.getElementById('cardViewBtn');
export const tableViewBtn = document.getElementById('tableViewBtn');

export let currentPage = 'vpc-list';
export let currentView = 'cards'; // 'cards' or 'table'
export let allVPCs = []; // Store all VPCs for filtering
export let filteredVPCs = []; // Currently displayed VPCs
export let allSubnets = []; // Store all subnets for filtering
export let filteredSubnets = []; // Currently displayed subnets
export let allSecurityGroups = []; // Store all security groups for filtering
export let filteredSecurityGroups = []; // Currently displayed security groups
export let allNATGateways = [];
export let filteredNATGateways = [];
export let allRouteTables = [];
export let filteredRouteTables = [];
export let allS3Buckets = [];
export let filteredS3Buckets = [];
export let allTargetGroups = [];
export let filteredTargetGroups = [];
export let allLoadBalancers = [];
export let filteredLoadBalancers = [];
export let allEC2Instances = []; // Store all EC2 instances for filtering
export let filteredEC2Instances = []; // Currently displayed EC2 instances
export let allECSClusters = []; // Store all ECS clusters for filtering
export let filteredECSClusters = []; // Currently displayed ECS clusters
export let allElasticIPs = [];
export let filteredElasticIPs = [];
export let allLambdaFunctions = [];
export let filteredLambdaFunctions = [];
export let allRDSInstances = [];
export let filteredRDSInstances = [];

export function setCurrentPage(page) {
    currentPage = page;
}

export function setCurrentView(view) {
    currentView = view;
}

export function setAllVPCs(vpcs) {
    allVPCs = vpcs;
}

export function setFilteredVPCs(vpcs) {
    filteredVPCs = vpcs;
}

export function setAllSubnets(subnets) {
    allSubnets = subnets;
}

export function setFilteredSubnets(subnets) {
    filteredSubnets = subnets;
}

export function setAllEC2Instances(instances) {
    allEC2Instances = instances;
}

export function setFilteredEC2Instances(instances) {
    filteredEC2Instances = instances;
}

export function setAllECSClusters(clusters) {
    allECSClusters = clusters;
}

export function setFilteredECSClusters(clusters) {
    filteredECSClusters = clusters;
}

export function setAllSecurityGroups(groups) {
    allSecurityGroups = groups;
}

export function setFilteredSecurityGroups(groups) {
    filteredSecurityGroups = groups;
}

export function setAllNATGateways(gateways) {
    allNATGateways = gateways;
}

export function setFilteredNATGateways(gateways) {
    filteredNATGateways = gateways;
}

export function setAllRouteTables(tables) {
    allRouteTables = tables;
}

export function setFilteredRouteTables(tables) {
    filteredRouteTables = tables;
}

export function setAllS3Buckets(buckets) {
    allS3Buckets = buckets;
}

export function setFilteredS3Buckets(buckets) {
    filteredS3Buckets = buckets;
}

export function setAllTargetGroups(groups) {
    allTargetGroups = groups;
}

export function setFilteredTargetGroups(groups) {
    filteredTargetGroups = groups;
}

export function setAllLoadBalancers(balancers) {
    allLoadBalancers = balancers;
}

export function setFilteredLoadBalancers(balancers) {
    filteredLoadBalancers = balancers;
}

export function setAllElasticIPs(ips) {
    allElasticIPs = ips;
}

export function setFilteredElasticIPs(ips) {
    filteredElasticIPs = ips;
}

export function setAllLambdaFunctions(functions) {
    allLambdaFunctions = functions;
}

export function setFilteredLambdaFunctions(functions) {
    filteredLambdaFunctions = functions;
}

export function setAllRDSInstances(instances) {
    allRDSInstances = instances;
}

export function setFilteredRDSInstances(instances) {
    filteredRDSInstances = instances;
}
