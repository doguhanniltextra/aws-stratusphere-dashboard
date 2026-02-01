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

export function populateGroupByOptions(page) {
    const select = document.getElementById('groupBySelect');
    if (!select) return;

    select.innerHTML = '<option value="none">None</option>';

    const options = getGroupByOptionsForPage(page);
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
    });

    // Reset selection to none when switching pages
    select.value = 'none';
    state.setGroupField('none');

    // Hide dropdown if no options available (except None)
    const container = select.parentElement;
    if (container) {
        if (options.length === 0) {
            container.style.display = 'none';
        } else {
            container.style.display = 'flex';
        }
    }
}

function getGroupByOptionsForPage(page) {
    const map = {
        'vpc-list': [
            { value: 'State', label: 'State' },
            { value: 'IsDefault', label: 'Is Default' },
            { value: 'InstanceTenancy', label: 'Tenancy' }
        ],
        'subnet-list': [
            { value: 'State', label: 'State' },
            { value: 'VpcId', label: 'VPC ID' },
            { value: 'AvailabilityZone', label: 'Availability Zone' },
            { value: 'MapPublicIpOnLaunch', label: 'Public IP Auto-assign' }
        ],
        'ec2': [
            { value: 'State', label: 'State' },
            { value: 'InstanceType', label: 'Instance Type' },
            { value: 'KeyName', label: 'Key Pair' },
            { value: 'AvailabilityZone', label: 'Availability Zone' },
            { value: 'VpcId', label: 'VPC ID' }
        ],
        'ecs': [
            { value: 'Status', label: 'Status' }
        ],
        's3-list': [
            { value: 'Region', label: 'Region' } // Note: Region might need to be derived if not in object
        ],
        'securitygroup-list': [
            { value: 'VpcId', label: 'VPC ID' }
        ],
        'nat-list': [
            { value: 'State', label: 'State' },
            { value: 'VpcId', label: 'VPC ID' }
        ],
        'route-list': [
            { value: 'VpcId', label: 'VPC ID' }
        ],
        'target-group-list': [
            { value: 'Protocol', label: 'Protocol' },
            { value: 'VpcId', label: 'VPC ID' },
            { value: 'TargetType', label: 'Target Type' }
        ],
        'lb-list': [
            { value: 'State', label: 'State' }, // State is object, might need handling
            { value: 'Type', label: 'Type' },
            { value: 'Scheme', label: 'Scheme' },
            { value: 'VpcId', label: 'VPC ID' }
        ],
        'elasticip-list': [
            { value: 'Domain', label: 'Domain' }
        ],
        'lambda-list': [
            { value: 'Runtime', label: 'Runtime' },
            { value: 'LastModified', label: 'Last Modified' } // Tricky to group by exact date
        ],
        'rds-list': [
            { value: 'Engine', label: 'Engine' },
            { value: 'DBInstanceStatus', label: 'Status' },
            { value: 'AvailabilityZone', label: 'Availability Zone' }
        ]
    };
    return map[page] || [];
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

    // Hide group dropdown on dashboard
    const select = document.getElementById('groupBySelect');
    if (select && select.parentElement) {
        select.parentElement.style.display = 'none';
    }
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
        // Update Group By options
        populateGroupByOptions(viewName);
    }

    // Hide all view sections (Home, Grid, and all Table containers)
    document.querySelectorAll('.view-section').forEach(section => {
        section.classList.add('hidden');
    });

    if (state.currentPage === 'home' || state.currentPage === 'security') {
        if (state.currentPage === 'home' && state.homeContainer) state.homeContainer.classList.remove('hidden');
        if (state.currentPage === 'security' && state.securityContainer) state.securityContainer.classList.remove('hidden');

        // Hide card/table toggle for home and security
        state.cardViewBtn.style.display = 'none';
        state.tableViewBtn.style.display = 'none';
        return;
    }

    // Show card/table toggle for other pages
    state.cardViewBtn.style.display = 'flex';
    state.tableViewBtn.style.display = 'flex';

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

export function applyFontTheme(fontName) {
    // Remove old theme classes
    document.body.classList.remove('theme-font-geist', 'theme-font-inter', 'theme-font-outfit');

    // Add new theme class
    document.body.classList.add(`theme-font-${fontName}`);

    // Update state
    state.setCurrentFont(fontName);

    // Persist
    localStorage.setItem('stratusphere-font', fontName);
}

export function initFontTheme() {
    const savedFont = localStorage.getItem('stratusphere-font') || 'geist';
    applyFontTheme(savedFont);

    const fontSelect = document.getElementById('fontSelect');
    if (fontSelect) {
        fontSelect.value = savedFont;
    }
}
