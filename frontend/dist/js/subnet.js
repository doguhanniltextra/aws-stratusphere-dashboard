
import { truncateID } from './utils.js';
import * as state from './state.js';

import { detailSidebar } from './detailSidebar.js';

export function createSubnetCard(subnet) {
    const title = subnet.Name || subnet.ID;
    const showID = subnet.Name ? `<div class="vpc-card-id">ID: ${truncateID(subnet.ID)}</div>` : '';
    const stateClass = subnet.State === 'available' ? 'status-available' : 'status-pending';
    const az = subnet.AvailabilityZone || '-';
    const publicIpBadge = subnet.MapPublicIPOnLaunch ? '<span class="badge badge-blue">Public IP</span>' : '';

    return `
        <div class="vpc-card" data-id="${subnet.ID}" style="cursor: pointer;">
            <div class="vpc-card-header">
                <div class="vpc-card-title-row">
                    <div class="vpc-card-title">${title}</div>
                    ${publicIpBadge}
                </div>
                ${showID}
            </div>
            
            <div class="vpc-card-divider"></div>
            
            <div class="vpc-card-body">
                <div class="vpc-card-row">
                    <span class="label">CIDR:</span> 
                    <span class="value font-mono">${subnet.CIDRBlock}</span>
                </div>
                
                <div class="vpc-card-row">
                    <span class="label">State:</span> 
                    <span class="badge ${stateClass}">${subnet.State}</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">AZ:</span> 
                    <span class="value font-mono">${az}</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">VPC ID:</span> 
                    <span class="value font-mono text-xs">${truncateID(subnet.VPCID)}</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">Free IPs:</span> 
                    <span class="value font-mono">${subnet.AvailableIpAddressCount}</span>
                </div>
            </div>
        </div>
    `;
}

export function initSubnetListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'subnet-list') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const subnet = state.allSubnets.find(s => s.ID === id);
            if (subnet) {
                detailSidebar.open(subnet);
            }
        }
    });
}

export function createSubnetTableRow(subnet) {
    const name = subnet.Name || '-';
    const statusClass = subnet.State === 'available' ? 'available' : 'pending';
    const az = subnet.AvailabilityZone || '-';
    const publicIpMark = subnet.MapPublicIPOnLaunch ? '✓' : '-';

    return `
        <tr>
            <td><strong>${name}</strong></td>
            <td class="vpc-id font-mono">${subnet.ID}</td>
            <td class="font-mono">${subnet.CIDRBlock}</td>
            <td class="vpc-id font-mono">${subnet.VPCID}</td>
            <td>${az}</td>
            <td class="vpc-status">
                <span class="status-dot ${statusClass}"></span>
                ${subnet.State}
            </td>
            <td class="text-center">${publicIpMark}</td>
            <td class="font-mono text-right">${subnet.AvailableIpAddressCount}</td>
        </tr>
    `;
}

export function renderSubnets() {
    if (state.filteredSubnets.length === 0) {
        state.statusText.textContent = 'No subnets found';
        const emptyCard = `
            <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                <div class="vpc-card-title">No Subnets</div>
                <div class="vpc-card-info">No subnets found in your AWS account</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.vpcTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                    No subnets found
                </td>
            </tr>
        `;
    } else {
        state.statusText.textContent = `${state.filteredSubnets.length} subnet(s) found`;
        if (state.currentView === 'cards') {
            state.vpcGrid.innerHTML = state.filteredSubnets.map(subnet => createSubnetCard(subnet)).join('');
        } else {
            state.vpcTableBody.innerHTML = state.filteredSubnets.map(subnet => createSubnetTableRow(subnet)).join('');
        }
    }
}

export async function fetchSubnets() {
    try {
        state.setCurrentPage('subnet-list');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching subnets from AWS...';
        state.vpcGrid.innerHTML = '';
        state.vpcTableBody.innerHTML = '';

        const subnets = await window.go.main.App.GetSubnets();
        state.loadingBar.classList.add('hidden');

        state.setAllSubnets(subnets || []);
        state.setFilteredSubnets([...state.allSubnets]);

        renderSubnets();
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching subnet data';
        console.error('Error fetching subnets:', error);
    }
}
