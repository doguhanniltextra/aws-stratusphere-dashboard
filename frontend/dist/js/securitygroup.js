import { truncateID } from './utils.js';
import * as state from './state.js';

import { detailSidebar } from './detailSidebar.js';

export function createSecurityGroupCard(sg) {
    const title = sg.Name || sg.ID;
    const showID = sg.Name ? `<div class="vpc-card-id">ID: ${truncateID(sg.ID)}</div>` : '';

    const ingressCount = sg.IngressRules?.length || 0;
    const egressCount = sg.EgressRules?.length || 0;
    const description = sg.Description || 'No description';

    return `
        <div class="vpc-card" data-id="${sg.ID}" style="cursor: pointer;">
            <div class="vpc-card-header">
                <div class="vpc-card-title-row">
                    <div class="vpc-card-title">🛡️ ${title}</div>
                    <span class="badge badge-blue">SG</span>
                </div>
                ${showID}
            </div>

            <div class="vpc-card-divider"></div>

            <div class="vpc-card-body">
                <div class="vpc-card-row">
                    <span class="label">VPC ID:</span> 
                    <span class="value font-mono text-xs">${truncateID(sg.VPCID)}</span>
                </div>
                
                <div class="vpc-card-row">
                    <span class="label">Inbound:</span> 
                    <span class="value font-mono">${ingressCount} rules</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">Outbound:</span> 
                    <span class="value font-mono">${egressCount} rules</span>
                </div>
                
                 <div class="vpc-card-info" title="${description}">
                    ${description.length > 60 ? description.substring(0, 60) + '...' : description}
                </div>
            </div>
        </div>
    `;
}

export function initSecurityGroupListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'securitygroup-list') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const sg = state.allSecurityGroups.find(s => s.ID === id);
            if (sg) {
                detailSidebar.open(sg);
            }
        }
    });
}

export function createSecurityGroupTableRow(sg) {
    const name = sg.Name || '-';
    const ingressCount = sg.IngressRules?.length || 0;
    const egressCount = sg.EgressRules?.length || 0;
    const description = sg.Description || '-';

    return `
        <tr>
            <td><strong>${name}</strong></td>
            <td class="vpc-id font-mono">${sg.ID}</td>
            <td class="vpc-id font-mono">${sg.VPCID}</td>
            <td>${ingressCount}</td>
            <td>${egressCount}</td>
            <td>${description}</td>
        </tr>
    `;
}

export function renderSecurityGroups() {
    if (state.filteredSecurityGroups.length === 0) {
        state.statusText.textContent = 'No security groups found';
        const emptyCard = `
            <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                <div class="vpc-card-title">No Security Groups</div>
                <div class="vpc-card-divider"></div>
                <div class="vpc-card-info">No security groups found in your AWS account</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.vpcTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                    No security groups found
                </td>
            </tr>
        `;
    } else {
        state.statusText.textContent = `${state.filteredSecurityGroups.length} security group(s) found`;
        if (state.currentView === 'cards') {
            state.vpcGrid.innerHTML = state.filteredSecurityGroups.map(sg => createSecurityGroupCard(sg)).join('');
        } else {
            state.securityGroupTableBody.innerHTML = state.filteredSecurityGroups.map(sg => createSecurityGroupTableRow(sg)).join('');
        }
    }
}

export async function fetchSecurityGroups() {
    try {
        state.setCurrentPage('securitygroup-list');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching security groups from AWS...';
        state.vpcGrid.innerHTML = '';
        state.securityGroupTableBody.innerHTML = '';

        const securityGroups = await window.go.main.App.GetSecurityGroups();
        state.loadingBar.classList.add('hidden');

        state.setAllSecurityGroups(securityGroups || []);
        state.setFilteredSecurityGroups([...state.allSecurityGroups]);

        renderSecurityGroups();
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching security groups';
        console.error('Error fetching security groups:', error);
    }
}