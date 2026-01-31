
import { truncateID } from './utils.js';
import * as state from './state.js';

import { detailSidebar } from './detailSidebar.js';

export function createEC2Card(instance) {
    const title = instance.Name || instance.ID;
    const showID = instance.Name ? `<div class="vpc-card-id">ID: ${truncateID(instance.ID)}</div>` : '';

    const isRunning = instance.State === 'running';
    const statusClass = isRunning ? 'status-available' : 'status-pending';
    const platformIcon = instance.Platform === 'Windows' ? '🪟' : '🐧';

    return `
        <div class="vpc-card" data-id="${instance.ID}" style="cursor: pointer;">
            <div class="vpc-card-header">
                <div class="vpc-card-title-row">
                    <div class="vpc-card-title">${title}</div>
                    <span class="badge ${statusClass}">${instance.State}</span>
                </div>
                ${showID}
            </div>

            <div class="vpc-card-divider"></div>

            <div class="vpc-card-body">
                <div class="vpc-card-row">
                    <span class="label">Type:</span> 
                    <span class="value font-mono" title="${instance.Architecture}">${instance.InstanceType}</span>
                </div>
                
                <div class="vpc-card-row">
                    <span class="label">Platform:</span> 
                    <span class="value">${platformIcon} ${instance.Platform}</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">Public IP:</span> 
                    <span class="value font-mono">${instance.PublicIPAddress || '-'}</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">Private IP:</span> 
                    <span class="value font-mono">${instance.PrivateIPAddress || '-'}</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">Key Pair:</span> 
                    <span class="value font-mono text-xs">${instance.KeyName || '-'}</span>
                </div>
                
                <div class="vpc-card-row">
                    <span class="label">VPC/Subnet:</span> 
                    <div class="value font-mono text-xs" style="text-align: right;">
                        <div>${truncateID(instance.VPCID)}</div>
                        <div style="color: var(--text-muted);">${truncateID(instance.SubnetID)}</div>
                    </div>
                </div>

                <div class="vpc-card-info">
                   Security Groups: ${instance.SecurityGroups ? instance.SecurityGroups.length : 0}
                </div>
            </div>
        </div>
    `;
}

export function initEC2Listeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'ec2') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const instance = state.allEC2Instances.find(v => v.ID === id);
            if (instance) {
                detailSidebar.open(instance);
            }
        }
    });
}

export function createEC2TableRow(instance) {
    const name = instance.Name || '-';
    const isRunning = instance.State === 'running';
    const statusClass = isRunning ? 'available' : 'pending';
    const platformIcon = instance.Platform === 'Windows' ? '🪟' : '🐧';

    return `
        <tr>
            <td><strong>${name}</strong></td>
            <td class="vpc-id font-mono">${instance.ID}</td>
            <td class="font-mono">${instance.InstanceType}</td>
            <td class="vpc-status">
                <span class="status-dot ${statusClass}"></span>
                ${instance.State}
            </td>
            <td class="font-mono">${instance.PublicIPAddress || '-'}</td>
            <td class="font-mono">${instance.PrivateIPAddress || '-'}</td>
            <td>${platformIcon}</td>
            <td class="vpc-id font-mono">${instance.VPCID || '-'}</td>
            <td class="vpc-id font-mono">${instance.SubnetID || '-'}</td>
        </tr>
    `;
}

export async function fetchEC2Instances() {
    try {
        state.setCurrentPage('ec2');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching EC2 instances from AWS...';
        state.vpcGrid.innerHTML = '';
        state.vpcTableBody.innerHTML = '';

        const instances = await window.go.main.App.GetEC2Instances();
        state.loadingBar.classList.add('hidden');

        state.setAllEC2Instances(instances || []);
        state.setFilteredEC2Instances([...state.allEC2Instances]);

        if (state.allEC2Instances.length === 0) {
            state.statusText.textContent = 'No EC2 instances found';
            const emptyCard = `
                <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                    <div class="vpc-card-title">No EC2 Instances</div>
                    <div class="vpc-card-info">No EC2 instances found in your AWS account</div>
                </div>
            `;
            state.vpcGrid.innerHTML = emptyCard;
            state.vpcTableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                        No EC2 instances found
                    </td>
                </tr>
            `;
        } else {
            state.statusText.textContent = `${state.allEC2Instances.length} EC2 instance(s) found`;
            if (state.currentView === 'cards') {
                if (state.currentGroupField && state.currentGroupField !== 'none') {
                    const groups = state.groupData(state.filteredEC2Instances, state.currentGroupField);
                    state.vpcGrid.innerHTML = Object.entries(groups).map(([groupName, items]) => `
                        <div class="resource-group">
                            <div class="group-header">
                                <span class="group-title">${groupName}</span>
                                <span class="group-count">${items.length}</span>
                            </div>
                            <div class="group-content">
                                ${items.map(instance => createEC2Card(instance)).join('')}
                            </div>
                        </div>
                    `).join('');
                } else {
                    state.vpcGrid.innerHTML = state.filteredEC2Instances.map(instance => createEC2Card(instance)).join('');
                }
            } else {
                state.vpcTableBody.innerHTML = state.filteredEC2Instances.map(instance => createEC2TableRow(instance)).join('');
            }
        }
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching EC2 instances';
        console.error('Error fetching EC2 instances:', error);
    }
}
