import { truncateID } from './utils.js';
import * as state from './state.js';

import { detailSidebar } from './detailSidebar.js';

// VPC Card Rendering
// VPC Card Rendering
export function createVPCCard(vpc) {
    const title = vpc.Name || vpc.ID;
    const showID = vpc.Name ? `<div class="vpc-card-id">ID: ${truncateID(vpc.ID)}</div>` : '';
    const isDefault = vpc.IsDefault;
    const stateClass = vpc.State === 'available' ? 'status-available' : 'status-pending';

    // Icons
    const tenancyIcon = vpc.InstanceTenancy === 'default' ? '👥' : '🔒';

    return `
        <div class="vpc-card" data-id="${vpc.ID}" style="cursor: pointer;">
            <div class="vpc-card-header">
                <div class="vpc-card-title-row">
                    <div class="vpc-card-title">${title}</div>
                    ${isDefault ? '<span class="badge badge-blue">Default</span>' : ''}
                </div>
                ${showID}
            </div>
            
            <div class="vpc-card-divider"></div>
            
            <div class="vpc-card-body">
                <div class="vpc-card-row">
                    <span class="label">CIDR:</span> 
                    <span class="value font-mono">${vpc.CIDRBlock}</span>
                </div>
                
                <div class="vpc-card-row">
                    <span class="label">State:</span> 
                    <span class="badge ${stateClass}">${vpc.State}</span>
                </div>
                
                <div class="vpc-card-row">
                    <span class="label">Tenancy:</span> 
                    <span class="value" title="${vpc.InstanceTenancy}">
                        ${tenancyIcon} ${vpc.InstanceTenancy}
                    </span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">Owner ID:</span> 
                    <span class="value font-mono text-xs">${vpc.OwnerId || '-'}</span>
                </div>

                ${vpc.DhcpOptionsId ? `
                <div class="vpc-card-row">
                    <span class="label">DHCP Opt:</span> 
                    <span class="value font-mono text-xs" title="${vpc.DhcpOptionsId}">${truncateID(vpc.DhcpOptionsId)}</span>
                </div>` : ''}
            </div>
        </div>
    `;
}

export function initVPCListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const vpc = state.allVPCs.find(v => v.ID === id);
            if (vpc) {
                detailSidebar.open(vpc);
            }
        }
    });
}

// VPC Table Row Rendering
export function createVPCTableRow(vpc) {
    const name = vpc.Name || '-';
    const statusClass = vpc.State === 'available' ? 'available' : 'pending';
    const defaultMark = vpc.IsDefault ? '<span class="badge badge-blue">Default</span>' : '-';

    return `
        <tr>
            <td><strong>${name}</strong></td>
            <td class="vpc-id font-mono">${vpc.ID}</td>
            <td class="font-mono">${vpc.CIDRBlock}</td>
            <td class="vpc-status">
                <span class="status-dot ${statusClass}"></span>
                ${vpc.State}
            </td>
            <td>${vpc.InstanceTenancy}</td>
            <td>${defaultMark}</td>
        </tr>
    `;
}

// Fetch VPCs from backend
export async function fetchVPCs() {
    try {
        state.setCurrentPage('vpc-list');

        // Show loading state
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching VPCs from AWS...';
        state.vpcGrid.innerHTML = '';
        state.vpcTableBody.innerHTML = '';

        // Fetch VPCs from Go backend
        const vpcs = await window.go.main.App.GetVPCs();

        // Hide loading
        state.loadingBar.classList.add('hidden');

        // Store VPCs
        state.setAllVPCs(vpcs || []);
        state.setFilteredVPCs([...state.allVPCs]);

        // Update status
        if (state.allVPCs.length === 0) {
            state.statusText.textContent = 'No VPCs found';
            const emptyCard = `
                <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                    <div class="vpc-card-title">No VPCs</div>
                    <div class="vpc-card-info">No VPCs found in your AWS account</div>
                </div>
            `;
            state.vpcGrid.innerHTML = emptyCard;
            state.vpcTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                        No VPCs found
                    </td>
                </tr>
            `;
        } else {
            state.statusText.textContent = `${state.allVPCs.length} VPC(s) found`;
            // Render using card view by default
            if (state.currentView === 'cards') {
                if (state.currentGroupField && state.currentGroupField !== 'none') {
                    const groups = state.groupData(state.filteredVPCs, state.currentGroupField);
                    state.vpcGrid.innerHTML = Object.entries(groups).map(([groupName, items]) => `
                        <div class="resource-group">
                            <div class="group-header">
                                <span class="group-title">${groupName}</span>
                                <span class="group-count">${items.length}</span>
                            </div>
                            <div class="group-content">
                                ${items.map(vpc => createVPCCard(vpc)).join('')}
                            </div>
                        </div>
                    `).join('');
                } else {
                    state.vpcGrid.innerHTML = state.filteredVPCs.map(vpc => createVPCCard(vpc)).join('');
                }
            } else {
                state.vpcTableBody.innerHTML = state.filteredVPCs.map(vpc => createVPCTableRow(vpc)).join('');
            }
        }

    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching VPCs';

        const errorCard = `
            <div class="vpc-card">
                <div class="vpc-card-title">⚠️ Error</div>
                <div class="vpc-card-divider"></div>
                <div class="vpc-card-info">${error.message || 'Failed to fetch VPCs'}</div>
            </div>
        `;

        if (state.currentView === 'cards') {
            state.vpcGrid.innerHTML = errorCard;
        } else {
            state.vpcTableBody.innerHTML = `
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

// Filter VPCs based on search input
export function filterVPCs(query) {
    const lowerQuery = query.toLowerCase();

    state.setFilteredVPCs(state.allVPCs.filter(vpc => {
        return (
            (vpc.Name && vpc.Name.toLowerCase().includes(lowerQuery)) ||
            vpc.ID.toLowerCase().includes(lowerQuery) ||
            vpc.CIDRBlock.toLowerCase().includes(lowerQuery) ||
            vpc.State.toLowerCase().includes(lowerQuery)
        );
    }));

    // Re-render
    if (state.filteredVPCs.length === 0) {
        state.statusText.textContent = 'No matching VPCs found';
        const emptyCard = `
            <div class="vpc-card">
                <div class="vpc-card-title">No Results</div>
                <div class="vpc-card-info">No VPCs match your search criteria</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.vpcTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                    No matching VPCs found
                </td>
            </tr>
        `;
    } else {
        state.statusText.textContent = `${state.filteredVPCs.length} VPC(s) found`;
        if (state.currentView === 'cards') {
            state.vpcGrid.innerHTML = state.filteredVPCs.map(vpc => createVPCCard(vpc)).join('');
        } else {
            state.vpcTableBody.innerHTML = state.filteredVPCs.map(vpc => createVPCTableRow(vpc)).join('');
        }
    }
}
