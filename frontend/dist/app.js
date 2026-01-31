// ===================================
// DOM ELEMENTS
// ===================================
const vpcGrid = document.getElementById('vpcGrid');
const vpcTableBody = document.getElementById('vpcTableBody');
const vpcTableContainer = document.getElementById('vpcTable');
const statusText = document.getElementById('statusText');
const loadingBar = document.getElementById('loadingBar');
const refreshBtn = document.getElementById('refreshBtn');
const searchInput = document.getElementById('searchInput');
const cardViewBtn = document.getElementById('cardViewBtn');
const tableViewBtn = document.getElementById('tableViewBtn');

let currentPage = 'vpc-list';
let currentView = 'cards';
let allVPCs = [];
let filteredVPCs = [];
let allSubnets = [];
let filteredSubnets = [];

function createVPCCard(vpc) {
    const title = vpc.Name || vpc.ID;
    const showID = vpc.Name ? `<div class="vpc-card-id">ID: ${truncateID(vpc.ID)}</div>` : '';

    const statusClass = vpc.State === 'available' ? 'available' : 'pending';

    const badges = [];
    if (vpc.IsDefault) {
        badges.push('<span class="vpc-badge default">✓ Default VPC</span>');
    }
    if (vpc.IsMain) {
        badges.push('<span class="vpc-badge main">✓ Main VPC</span>');
    }

    const ownerInfo = vpc.OwnerId ? `
        <div class="vpc-card-info">
            Owner: ...${vpc.OwnerId.slice(-6)}
        </div>
    ` : '';

    const tenancyInfo = vpc.InstanceTenancy && vpc.InstanceTenancy !== 'default' ? `
        <div class="vpc-card-info">
            Tenancy: ${vpc.InstanceTenancy}
        </div>
    ` : '';

    return `
        <div class="vpc-card">
            <div class="vpc-card-title">${title}</div>
            ${showID}
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-row">
                <strong>CIDR:</strong> <span>${vpc.CIDRBlock}</span>
            </div>
            <div class="vpc-card-row">
                <span class="status-dot ${statusClass}"></span>
                <strong>Status:</strong> <span>${vpc.State}</span>
            </div>
            ${badges.join('')}
            ${ownerInfo}
            ${tenancyInfo}
        </div>
    `;
}

function createVPCTableRow(vpc) {
    const name = vpc.Name || '-';
    const statusClass = vpc.State === 'available' ? 'available' : 'pending';
    const isDefault = vpc.IsDefault ? '✓' : '-';
    const tenancy = vpc.InstanceTenancy || 'default';

    return `
        <tr>
            <td><strong>${name}</strong></td>
            <td class="vpc-id">${vpc.ID}</td>
            <td>${vpc.CIDRBlock}</td>
            <td class="vpc-status">
                <span class="status-dot ${statusClass}"></span>
                ${vpc.State}
            </td>
            <td>${isDefault}</td>
            <td>${tenancy}</td>
        </tr>
    `;
}

function truncateID(id) {
    if (id.length <= 20) return id;
    return id.substring(0, 12) + '...' + id.slice(-6);
}

function filterVPCs(searchTerm) {
    if (!searchTerm) {
        filteredVPCs = [...allVPCs];
    } else {
        const term = searchTerm.toLowerCase();
        filteredVPCs = allVPCs.filter(vpc => {
            return (
                (vpc.Name && vpc.Name.toLowerCase().includes(term)) ||
                vpc.ID.toLowerCase().includes(term) ||
                vpc.CIDRBlock.includes(term) ||
                vpc.State.toLowerCase().includes(term)
            );
        });
    }
    renderVPCs();
}

function renderVPCs() {
    if (filteredVPCs.length === 0) {
        const emptyMessage = allVPCs.length === 0
            ? 'No VPCs found in your AWS account'
            : 'No VPCs match your search';

        if (currentView === 'cards') {
            vpcGrid.innerHTML = `
                <div class="vpc-card">
                    <div class="vpc-card-title">${emptyMessage === allVPCs.length === 0 ? 'No VPCs' : 'No Results'}</div>
                    <div class="vpc-card-info">${emptyMessage}</div>
                </div>
            `;
        } else {
            vpcTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                        ${emptyMessage}
                    </td>
                </tr>
            `;
        }
        statusText.textContent = emptyMessage;
        return;
    }

    // Update status message
    const totalCount = allVPCs.length;
    const displayCount = filteredVPCs.length;
    const countMessage = displayCount === totalCount
        ? `${totalCount} VPC(s) found`
        : `Showing ${displayCount} of ${totalCount} VPC(s)`;
    statusText.textContent = countMessage;

    // Render based on current view
    if (currentView === 'cards') {
        vpcGrid.innerHTML = filteredVPCs.map(vpc => createVPCCard(vpc)).join('');
    } else {
        vpcTableBody.innerHTML = filteredVPCs.map(vpc => createVPCTableRow(vpc)).join('');
    }
}

function switchView(view) {
    currentView = view;

    if (view === 'cards') {
        cardViewBtn.classList.add('active');
        tableViewBtn.classList.remove('active');
        vpcGrid.classList.remove('hidden');
        vpcTableContainer.classList.add('hidden');
    } else {
        cardViewBtn.classList.remove('active');
        tableViewBtn.classList.add('active');
        vpcGrid.classList.add('hidden');
        vpcTableContainer.classList.remove('hidden');
    }

    renderVPCs();
}

function showDashboard() {
    currentPage = 'dashboard';
    statusText.textContent = 'Welcome to Stratusphere';

    switchView('cards');
    vpcGrid.innerHTML = `
        <div class="vpc-card">
            <div class="vpc-card-title">🏠 Dashboard</div>
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-info">Welcome to AWS Infrastructure Dashboard!</div>
            <div class="vpc-card-info" style="margin-top: 10px;">
                Use the sidebar to navigate or click "VPC List" to view your VPCs.
            </div>
        </div>
    `;
}

function showEC2() {
    currentPage = 'ec2';
    statusText.textContent = 'EC2 Instances - Coming Soon';

    switchView('cards');
    vpcGrid.innerHTML = `
        <div class="vpc-card">
            <div class="vpc-card-title">💻 EC2 Instances</div>
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-info">This feature is coming soon!</div>
        </div>
    `;
}

async function fetchVPCs() {
    try {
        currentPage = 'vpc-list';

        // Show loading state
        loadingBar.classList.remove('hidden');
        statusText.textContent = 'Connecting to AWS...';
        vpcGrid.innerHTML = '';
        vpcTableBody.innerHTML = '';

        // Fetch VPCs from Go backend
        const vpcs = await window.go.main.App.GetVPCs();

        // Hide loading
        loadingBar.classList.add('hidden');

        // Store VPCs
        allVPCs = vpcs || [];
        filteredVPCs = [...allVPCs];

        // Render VPCs
        renderVPCs();

    } catch (error) {
        loadingBar.classList.add('hidden');
        statusText.textContent = 'Error fetching VPC data';

        const errorCard = `
            <div class="vpc-card">
                <div class="vpc-card-title">⚠️ Error</div>
                <div class="vpc-card-divider"></div>
                <div class="vpc-card-info">${error.message || 'Failed to fetch VPCs'}</div>
            </div>
        `;

        if (currentView === 'cards') {
            vpcGrid.innerHTML = errorCard;
        } else {
            vpcTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 32px;">
                        ${errorCard}
                    </td>
                </tr>
            `;
        }

        console.error('Error fetching VPCs:', error);
    }
}

function updateActiveMenu(clickedElement) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    clickedElement.classList.add('active');
}

refreshBtn.addEventListener('click', fetchVPCs);
searchInput.addEventListener('input', (e) => {
    filterVPCs(e.target.value);
});

cardViewBtn.addEventListener('click', () => switchView('cards'));
tableViewBtn.addEventListener('click', () => switchView('table'));

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        updateActiveMenu(item);

        const text = item.textContent.trim();

        if (text.includes('Dashboard')) {
            showDashboard();
        } else if (text.includes('VPC List')) {
            fetchVPCs();
        } else if (text.includes('Subnet List')) {
            fetchSubnets();
        } else if (text.includes('EC2')) {
            fetchEC2Instances();
        } else if (text.includes('ECS')) {
            fetchECSClusters();
        }
    });
});

function createEC2Card(instance) {
    const title = instance.Name || instance.ID;
    const showID = instance.Name ? `<div class="vpc-card-id">ID: ${truncateID(instance.ID)}</div>` : '';

    const stateColors = {
        'running': 'available',
        'stopped': 'pending',
        'pending': 'pending',
        'stopping': 'pending',
        'terminated': 'pending',
        'shutting-down': 'pending'
    };
    const statusClass = stateColors[instance.State] || 'pending';

    const publicIP = instance.PublicIPAddress || 'N/A';
    const privateIP = instance.PrivateIPAddress || 'N/A';

    return `
        <div class="vpc-card">
            <div class="vpc-card-title">${title}</div>
            ${showID}
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-row">
                <strong>Type:</strong> <span>${instance.InstanceType}</span>
            </div>
            <div class="vpc-card-row">
                <span class="status-dot ${statusClass}"></span>
                <strong>Status:</strong> <span>${instance.State}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Public IP:</strong> <span>${publicIP}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Private IP:</strong> <span>${privateIP}</span>
            </div>
            <div class="vpc-card-row">
                <strong>VPC:</strong> <span>${truncateID(instance.VPCID)}</span>
            </div>
            <div class="vpc-card-info">
                Launched: ${instance.LaunchTime}
            </div>
        </div>
    `;
}

// EC2 Instance Table Row Rendering
function createEC2TableRow(instance) {
    const name = instance.Name || '-';
    const stateColors = {
        'running': 'available',
        'stopped': 'pending',
        'pending': 'pending',
        'stopping': 'pending',
        'terminated': 'pending',
        'shutting-down': 'pending'
    };
    const statusClass = stateColors[instance.State] || 'pending';
    const publicIP = instance.PublicIPAddress || '-';
    const privateIP = instance.PrivateIPAddress || '-';

    return `
        <tr>
            <td><strong>${name}</strong></td>
            <td class="vpc-id">${instance.ID}</td>
            <td>${instance.InstanceType}</td>
            <td class="vpc-status">
                <span class="status-dot ${statusClass}"></span>
                ${instance.State}
            </td>
            <td>${publicIP}</td>
            <td>${privateIP}</td>
            <td>${instance.LaunchTime}</td>
            <td class="vpc-id">${instance.VPCID || '-'}</td>
            <td class="vpc-id">${instance.SubnetID || '-'}</td>
        </tr>
    `;
}

async function fetchEC2Instances() {
    try {
        currentPage = 'ec2';
        loadingBar.classList.remove('hidden');
        statusText.textContent = 'Fetching EC2 instances from AWS...';
        vpcGrid.innerHTML = '';
        vpcTableBody.innerHTML = '';

        const instances = await window.go.main.App.GetEC2Instances();

        loadingBar.classList.add('hidden');

        allVPCs = instances || [];
        filteredVPCs = [...allVPCs];

        if (allVPCs.length === 0) {
            statusText.textContent = 'No EC2 instances found';
            const emptyCard = `
                <div class="vpc-card">
                    <div class="vpc-card-title">No EC2 Instances</div>
                    <div class="vpc-card-divider"></div>
                    <div class="vpc-card-info">No EC2 instances found in your AWS account</div>
                </div>
            `;
            vpcGrid.innerHTML = emptyCard;
            vpcTableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                        No EC2 instances found
                    </td>
                </tr>
            `;
        } else {
            statusText.textContent = `${allVPCs.length} EC2 instance(s) found`;
            if (currentView === 'cards') {
                vpcGrid.innerHTML = allVPCs.map(instance => createEC2Card(instance)).join('');
            } else {
                vpcTableBody.innerHTML = allVPCs.map(instance => createEC2TableRow(instance)).join('');
            }
        }

    } catch (error) {
        loadingBar.classList.add('hidden');
        statusText.textContent = 'Error fetching EC2 instances';

        const errorCard = `
            <div class="vpc-card">
                <div class="vpc-card-title">⚠️ Error</div>
                <div class="vpc-card-divider"></div>
                <div class="vpc-card-info">${error.message || 'Failed to fetch EC2 instances'}</div>
            </div>
        `;

        if (currentView === 'cards') {
            vpcGrid.innerHTML = errorCard;
        } else {
            vpcTableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 32px;">
                        ${errorCard}
                    </td>
                </tr>
            `;
        }

        console.error('Error fetching EC2 instances:', error);
    }
}



function createECSCard(cluster) {
    const title = cluster.ClusterName || 'Unnamed Cluster';
    const statusClass = cluster.Status === 'ACTIVE' ? 'available' : 'pending';

    return `
        <div class="vpc-card">
            <div class="vpc-card-title">${title}</div>
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-row">
                <span class="status-dot ${statusClass}"></span>
                <strong>Status:</strong> <span>${cluster.Status}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Container Instances:</strong> <span>${cluster.RegisteredInstances}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Running Tasks:</strong> <span>${cluster.RunningTasks}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Pending Tasks:</strong> <span>${cluster.PendingTasks}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Active Services:</strong> <span>${cluster.ActiveServices}</span>
            </div>
            <div class="vpc-card-info">
                ARN: ${truncateID(cluster.ClusterArn)}
            </div>
        </div>
    `;
}

function createECSTableRow(cluster) {
    const name = cluster.ClusterName || '-';
    const statusClass = cluster.Status === 'ACTIVE' ? 'available' : 'pending';

    return `
        <tr>
            <td><strong>${name}</strong></td>
            <td class="vpc-status">
                <span class="status-dot ${statusClass}"></span>
                ${cluster.Status}
            </td>
            <td>${cluster.RegisteredInstances}</td>
            <td>${cluster.RunningTasks}</td>
            <td>${cluster.PendingTasks}</td>
            <td>${cluster.ActiveServices}</td>
        </tr>
    `;
}

async function fetchECSClusters() {
    try {
        currentPage = 'ecs';
        loadingBar.classList.remove('hidden');
        statusText.textContent = 'Fetching ECS clusters from AWS...';
        vpcGrid.innerHTML = '';
        vpcTableBody.innerHTML = '';

        const clusters = await window.go.main.App.GetECSClusters();

        loadingBar.classList.add('hidden');

        allVPCs = clusters || [];
        filteredVPCs = [...allVPCs];

        if (allVPCs.length === 0) {
            statusText.textContent = 'No ECS clusters found';
            const emptyCard = `
                <div class="vpc-card">
                    <div class="vpc-card-title">No ECS Clusters</div>
                    <div class="vpc-card-divider"></div>
                    <div class="vpc-card-info">No ECS clusters found in your AWS account</div>
                </div>
            `;
            vpcGrid.innerHTML = emptyCard;
            vpcTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                        No ECS clusters found
                    </td>
                </tr>
            `;
        } else {
            statusText.textContent = `${allVPCs.length} ECS cluster(s) found`;
            if (currentView === 'cards') {
                vpcGrid.innerHTML = allVPCs.map(cluster => createECSCard(cluster)).join('');
            } else {
                vpcTableBody.innerHTML = allVPCs.map(cluster => createECSTableRow(cluster)).join('');
            }
        }

    } catch (error) {
        loadingBar.classList.add('hidden');
        statusText.textContent = 'Error fetching ECS clusters';

        const errorCard = `
            <div class="vpc-card">
                <div class="vpc-card-title">⚠️ Error</div>
                <div class="vpc-card-divider"></div>
                <div class="vpc-card-info">${error.message || 'Failed to fetch ECS clusters'}</div>
            </div>
        `;

        if (currentView === 'cards') {
            vpcGrid.innerHTML = errorCard;
        } else {
            vpcTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 32px;">
                        ${errorCard}
                    </td>
                </tr>
            `;
        }

        console.error('Error fetching ECS clusters:', error);
    }
}

function createSubnetCard(subnet) {
    const title = subnet.Name || subnet.ID;
    const showID = subnet.Name ? `<div class="vpc-card-id">ID: ${truncateID(subnet.ID)}</div>` : '';

    const statusClass = subnet.State === 'available' ? 'available' : 'pending';
    const az = subnet.AvailabilityZone || 'N/A';

    return `
        <div class="vpc-card">
            <div class="vpc-card-title">${title}</div>
            ${showID}
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-row">
                <span class="status-dot ${statusClass}"></span>
                <strong>Status:</strong> <span>${subnet.State}</span>
            </div>
            <div class="vpc-card-row">
                <strong>CIDR:</strong> <span>${subnet.CIDRBlock}</span>
            </div>
            <div class="vpc-card-row">
                <strong>VPC:</strong> <span>${truncateID(subnet.VPCID)}</span>
            </div>
            <div class="vpc-card-info">
                AZ: ${az}
            </div>
        </div>
    `;
}

function createSubnetTableRow(subnet) {
    const name = subnet.Name || '-';
    const statusClass = subnet.State === 'available' ? 'available' : 'pending';
    const az = subnet.AvailabilityZone || '-';

    return `
        <tr>
            <td><strong>${name}</strong></td>
            <td class="vpc-id">${subnet.ID}</td>
            <td>${subnet.CIDRBlock}</td>
            <td class="vpc-id">${subnet.VPCID}</td>
            <td>${az}</td>
            <td class="vpc-status">
                <span class="status-dot ${statusClass}"></span>
                ${subnet.State}
            </td>
        </tr>
    `;
}

function renderSubnets() {
    if (filteredSubnets.length === 0) {
        statusText.textContent = 'No subnets found';
        const emptyCard = `
            <div class="vpc-card">
                <div class="vpc-card-title">No Subnets</div>
                <div class="vpc-card-divider"></div>
                <div class="vpc-card-info">No subnets found in your AWS account</div>
            </div>
        `;
        vpcGrid.innerHTML = emptyCard;
        vpcTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                    No subnets found
                </td>
            </tr>
        `;
    } else {
        statusText.textContent = `${filteredSubnets.length} subnet(s) found`;
        if (currentView === 'cards') {
            vpcGrid.innerHTML = filteredSubnets.map(subnet => createSubnetCard(subnet)).join('');
        } else {
            vpcTableBody.innerHTML = filteredSubnets.map(subnet => createSubnetTableRow(subnet)).join('');
        }
    }
}

async function fetchSubnets() {
    try {
        currentPage = 'subnet-list';
        loadingBar.classList.remove('hidden');
        statusText.textContent = 'Fetching subnets from AWS...';
        vpcGrid.innerHTML = '';
        vpcTableBody.innerHTML = '';
        const subnets = await window.go.main.App.GetSubnets();

        loadingBar.classList.add('hidden');

        allSubnets = subnets || [];
        filteredSubnets = [...allSubnets];

        renderSubnets();

    } catch (error) {
        loadingBar.classList.add('hidden');
        statusText.textContent = 'Error fetching subnet data';

        const errorCard = `
            <div class="vpc-card">
                <div class="vpc-card-title">⚠️ Error</div>
                <div class="vpc-card-divider"></div>
                <div class="vpc-card-info">${error.message || 'Failed to fetch subnets'}</div>
            </div>
        `;

        if (currentView === 'cards') {
            vpcGrid.innerHTML = errorCard;
        } else {
            vpcTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 32px;">
                        ${errorCard}
                    </td>
                </tr>
            `;
        }

        console.error('Error fetching subnets:', error);
    }
}

fetchVPCs();


