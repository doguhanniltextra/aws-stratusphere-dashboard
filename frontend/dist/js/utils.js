import * as state from './state.js';

export function truncateID(id) {
    if (!id) return '-';
    return id.length > 20 ? id.substring(0, 8) + '...' + id.substring(id.length - 4) : id;
}

export function updateActiveMenu(viewName) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    // Find and activate the menu item with matching data-view
    const activeItem = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

export function showDashboard(statusText, vpcGrid) {
    statusText.textContent = 'Dashboard';
    vpcGrid.innerHTML = `
        <div class="vpc-card">
            <div class="vpc-card-title">Welcome</div>
            <div class="vpc-card-info">
                Select a service from the sidebar to view resources.
            </div>
        </div>
    `;
}

export function switchView(viewName) {
    // If viewName is a mode switch (cards/table), update mode but keep current page
    if (viewName === 'cards' || viewName === 'table') {
        state.setCurrentView(viewName);
        // Use the current page to refresh display
        viewName = state.currentPage; // e.g. 'vpc-list'
    } else {
        // It's a page switch
        state.setCurrentPage(viewName);
        updateActiveMenu(viewName);
    }

    // Hide all view sections first
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Hide all main containers
    state.vpcGrid.classList.add('hidden');
    state.vpcTableContainer.classList.add('hidden');
    state.eipTableContainer.classList.add('hidden');
    state.lambdaTableContainer.classList.add('hidden');
    state.rdsTableContainer.classList.add('hidden');

    // Hide all specific table containers
    const containers = document.querySelectorAll('.vpc-table-container, .ec2-table-container, .ecs-table-container, .subnet-table-container, .securitygroup-table-container, .nat-table-container, .route-table-container, .s3-table-container, .tg-table-container, .lb-table-container, .playground-container');
    containers.forEach(el => el.classList.add('hidden'));

    // Handle View Modes
    // List of pages that support Card View
    const cardViewPages = [
        'vpc-list',
        'subnet-list',
        'ec2',
        'ecs',
        's3-list',
        'rds-list',
        'lambda-list',
        'securitygroup-list',
        'nat-list',
        'route-list',
        'target-group-list',
        'lb-list',
        'elasticip-list'
    ];

    if (cardViewPages.includes(state.currentPage) && state.currentView === 'cards') {
        // SHOW CARDS
        state.vpcGrid.classList.remove('hidden');
        state.cardViewBtn.classList.add('active');
        state.tableViewBtn.classList.remove('active');
        return;
    }

    // DEFAULT: TABLE VIEW
    state.cardViewBtn.classList.remove('active');
    state.tableViewBtn.classList.add('active');

    switch (state.currentPage) {
        case 'vpc-list':
            state.vpcTableContainer.classList.remove('hidden');
            break;
        case 'subnet-list':
            document.getElementById('subnetTable').classList.remove('hidden');
            break;
        case 'securitygroup-list':
            state.securityGroupTableContainer.classList.remove('hidden');
            break;
        case 'nat-list':
            state.natTableContainer.classList.remove('hidden');
            break;
        case 'route-list':
            state.routeTableContainer.classList.remove('hidden');
            break;
        case 's3-list':
            state.s3TableContainer.classList.remove('hidden');
            break;
        case 'target-group-list':
            state.tgTableContainer.classList.remove('hidden');
            break;
        case 'lb-list':
            state.lbTableContainer.classList.remove('hidden');
            break;
        case 'elasticip-list':
            state.eipTableContainer.classList.remove('hidden');
            break;
        case 'lambda-list':
            state.lambdaTableContainer.classList.remove('hidden');
            break;
        case 'rds-list':
            state.rdsTableContainer.classList.remove('hidden');
            break;
        default:
            // Fallback
            console.warn(`Unknown view: ${state.currentPage}`);
    }
}
