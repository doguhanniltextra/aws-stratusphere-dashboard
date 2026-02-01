
import { fetchVPCs } from './vpc.js';
import { fetchSubnets } from './subnet.js';
import { fetchEC2Instances } from './ec2.js';
import { fetchECSClusters } from './ecs.js';
import { fetchSecurityGroups } from './securitygroup.js';
import { fetchNATGateways } from './natgateway.js';
import { fetchRouteTables } from './routetable.js';
import { fetchS3Buckets } from './s3.js';
import { fetchTargetGroups } from './targetgroup.js';
import { fetchLoadBalancers } from './loadbalancer.js';
import { setCurrentPage } from './state.js';
import { ErrorHandler } from './errorHandler.js';

export const WindowManager = {
    currentView: 'vpc',

    init() {
        const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');

                const view = item.getAttribute('data-view');
                if (view) {
                    this.switchView(view);
                }
            });
        });

        this.switchView('home');
    },

    async switchView(viewName) {
        console.log(`Switching to view: ${viewName}`);
        this.currentView = viewName;

        const previousPage = window.currentPage;

        switch (viewName) {
            case 'home':
                setCurrentPage('home');
                break;
            case 'vpc':
                setCurrentPage('vpc-list');
                break;
            case 'subnet':
                setCurrentPage('subnet-list');
                break;
            case 'ec2':
                setCurrentPage('ec2');
                break;
            case 'ecs':
                setCurrentPage('ecs');
                break;
            case 'securitygroup':
                setCurrentPage('securitygroup-list');
                break;
            case 'natgateway':
                setCurrentPage('nat-list');
                break;
            case 'routetable':
                setCurrentPage('route-list');
                break;
            case 's3':
                setCurrentPage('s3-list');
                break;
            case 'targetgroup':
                setCurrentPage('target-group-list');
                break;
            case 'loadbalancer':
                setCurrentPage('lb-list');
                break;
            case 'elasticip':
                setCurrentPage('elasticip-list');
                break;
            case 'lambda':
                setCurrentPage('lambda-list');
                break;
            case 'rds':
                setCurrentPage('rds-list');
                break;
            case 'playground':
                setCurrentPage('playground');
                break;
            case 'topology':
                // Topology is special
                setCurrentPage('topology');
                break;
            default:
                console.warn(`Unknown view: ${viewName}`);
        }


        try {
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
                if (item.dataset.view === viewName) {
                    item.classList.add('active');
                }
            });

            const topologyContainer = document.getElementById('topologyContainer');
            if (topologyContainer) topologyContainer.classList.add('hidden');

            if (viewName === 'topology') {
                const { showTopology } = await import('./topology.js');
                await showTopology();
                return;
            }

            const { switchView, populateGroupByOptions } = await import('./utils.js');
            switchView('cards');
            populateGroupByOptions(window.currentPage || 'vpc-list'); // Ensure options are populated

            switch (viewName) {
                case 'home':
                    const { fetchHomeInfo } = await import('./home.js');
                    await fetchHomeInfo();
                    break;
                case 'vpc':
                    await fetchVPCs();
                    break;
                case 'subnet':
                    await fetchSubnets();
                    break;
                case 'ec2':
                    await fetchEC2Instances();
                    break;
                case 'ecs':
                    await fetchECSClusters();
                    break;
                case 'securitygroup':
                    await fetchSecurityGroups();
                    break;
                case 'natgateway':
                    await fetchNATGateways();
                    break;
                case 'routetable':
                    await fetchRouteTables();
                    break;
                case 's3':
                    await fetchS3Buckets();
                    break;
                case 'targetgroup':
                    await fetchTargetGroups();
                    break;
                case 'loadbalancer':
                    await fetchLoadBalancers();
                    break;
                case 'elasticip':
                    const { fetchElasticIPs } = await import('./elasticip.js');
                    await fetchElasticIPs();
                    break;
                case 'lambda':
                    const { fetchLambdaFunctions } = await import('./lambda.js');
                    await fetchLambdaFunctions();
                    break;
                case 'rds':
                    const { fetchRDSInstances } = await import('./rds.js');
                    await fetchRDSInstances();
                    break;
                case 'playground':
                    const { showPlayground } = await import('./playground.js');
                    await showPlayground();
                    break;
            }
        } catch (error) {
            console.error(`Error loading view ${viewName}:`, error);
            ErrorHandler.show(`Failed to load ${viewName}: ${error.message}`, 'error');
        }
    }
};
