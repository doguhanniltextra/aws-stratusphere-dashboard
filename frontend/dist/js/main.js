
import * as state from './state.js';
import { updateActiveMenu, switchView, showDashboard } from './utils.js';
import { fetchVPCs, filterVPCs, initVPCListeners } from './vpc.js';
import { fetchEC2Instances, initEC2Listeners } from './ec2.js';
import { fetchECSClusters, initECSListeners } from './ecs.js';
import { fetchSubnets, initSubnetListeners } from './subnet.js';
import { fetchSecurityGroups, initSecurityGroupListeners } from './securitygroup.js';
import { fetchNATGateways, initNATGatewayListeners } from './natgateway.js';
import { fetchRouteTables, initRouteTableListeners } from './routetable.js';
import { fetchS3Buckets, initS3Listeners } from './s3.js';
import { fetchTargetGroups, initTargetGroupListeners } from './targetgroup.js';
import { fetchLoadBalancers, initLoadBalancerListeners } from './loadbalancer.js';
import { fetchElasticIPs, initElasticIPListeners } from './elasticip.js';
import { fetchLambdaFunctions, initLambdaListeners } from './lambda.js';
import { fetchRDSInstances, initRDSListeners } from './rds.js';
import { initSettings } from './settings.js';
import { detailSidebar } from './detailSidebar.js';
import { WindowManager } from './windowManager.js';
import { checkCredentials, showSetupScreen, initSetupScreen } from './auth.js';



document.addEventListener('DOMContentLoaded', async () => {
    // Initialize setup screen listeners
    initSetupScreen();

    // Check if AWS credentials are configured
    const hasCredentials = await checkCredentials();
    if (!hasCredentials) {
        console.log('No AWS credentials found - showing setup screen');
        showSetupScreen();
        return; // Don't initialize app until credentials are configured
    }

    // Credentials exist - initialize app normally
    initSettings();
    detailSidebar.init();

    // Initialize interaction listeners
    initVPCListeners();
    initEC2Listeners();
    initECSListeners();
    initSubnetListeners();
    initSecurityGroupListeners();
    initNATGatewayListeners();
    initRouteTableListeners();
    initS3Listeners();
    initTargetGroupListeners();
    initLoadBalancerListeners();
    initS3Listeners();
    initTargetGroupListeners();
    initLoadBalancerListeners();
    initElasticIPListeners();
    initLambdaListeners();
    initRDSListeners();

    checkAdminStatus();
    WindowManager.init();
});

async function checkAdminStatus() {
    try {
        const config = await window.go.main.App.GetConfiguration();
        if (config && config.IsAdmin) {
            const badge = document.getElementById('adminBadge');
            if (badge) {
                badge.classList.remove('hidden');
            }
        }
    } catch (err) {
        console.error("Failed to check admin status:", err);
    }
}

// View toggle buttons
// View toggle buttons
state.cardViewBtn.addEventListener('click', () => {
    switchView('cards');

    // Trigger re-fetch/render for current page to update view
    if (state.currentPage === 'vpc-list') fetchVPCs();
    else if (state.currentPage === 'ec2') fetchEC2Instances();
    else if (state.currentPage === 'ecs') fetchECSClusters();
    else if (state.currentPage === 'subnet-list') fetchSubnets();
    else if (state.currentPage === 'securitygroup-list') fetchSecurityGroups();
    else if (state.currentPage === 'nat-list') fetchNATGateways();
    else if (state.currentPage === 'route-list') fetchRouteTables();
    else if (state.currentPage === 's3-list') fetchS3Buckets();
    else if (state.currentPage === 'target-group-list') fetchTargetGroups();
    else if (state.currentPage === 'lb-list') fetchLoadBalancers();
    else if (state.currentPage === 'elasticip-list') fetchElasticIPs();
    else if (state.currentPage === 'lambda-list') fetchLambdaFunctions();
    else if (state.currentPage === 'rds-list') fetchRDSInstances();
});

state.tableViewBtn.addEventListener('click', () => {
    switchView('table');

    // Trigger re-fetch/render for current page to update view
    if (state.currentPage === 'vpc-list') fetchVPCs();
    else if (state.currentPage === 'ec2') fetchEC2Instances();
    else if (state.currentPage === 'ecs') fetchECSClusters();
    else if (state.currentPage === 'subnet-list') fetchSubnets();
    else if (state.currentPage === 'securitygroup-list') fetchSecurityGroups();
    else if (state.currentPage === 'nat-list') fetchNATGateways();
    else if (state.currentPage === 'route-list') fetchRouteTables();
    else if (state.currentPage === 's3-list') fetchS3Buckets();
    else if (state.currentPage === 'target-group-list') fetchTargetGroups();
    else if (state.currentPage === 'lb-list') fetchLoadBalancers();
    else if (state.currentPage === 'elasticip-list') fetchElasticIPs();
    else if (state.currentPage === 'lambda-list') fetchLambdaFunctions();
    else if (state.currentPage === 'rds-list') fetchRDSInstances();
});

// Re-render current page
if (state.currentPage === 'vpc-list') {
    if (state.currentView === 'table') {
        state.vpcTableBody.innerHTML = state.filteredVPCs.map(vpc => {
            const { createVPCTableRow } = require('./vpc.js');
            return createVPCTableRow(vpc);
        }).join('');
    }
}


// Refresh button
state.refreshBtn.addEventListener('click', () => {
    if (state.currentPage === 'vpc-list') {
        fetchVPCs();
    } else if (state.currentPage === 'ec2') {
        fetchEC2Instances();
    } else if (state.currentPage === 'ecs') {
        fetchECSClusters();
    } else if (state.currentPage === 'subnet-list') {
        fetchSubnets();
    } else if (state.currentPage === 'securitygroup-list') {
        fetchSecurityGroups();
    } else if (state.currentPage === 'nat-list') {
        fetchNATGateways();
    } else if (state.currentPage === 'route-list') {
        fetchRouteTables();
    } else if (state.currentPage === 's3-list') {
        fetchS3Buckets();
    } else if (state.currentPage === 'target-group-list') {
        fetchTargetGroups();
    } else if (state.currentPage === 'lb-list') {
        fetchLoadBalancers();
    } else if (state.currentPage === 'elasticip-list') {
        fetchElasticIPs();
    } else if (state.currentPage === 'lambda-list') {
        fetchLambdaFunctions();
    } else if (state.currentPage === 'rds-list') {
        fetchRDSInstances();
    }
});

// Search input
state.searchInput.addEventListener('input', (e) => {
    const query = e.target.value;

    if (state.currentPage === 'vpc-list') {
        filterVPCs(query);
    }
    // Add other search filters for EC2, ECS, Subnet as needed
});


fetchVPCs();
