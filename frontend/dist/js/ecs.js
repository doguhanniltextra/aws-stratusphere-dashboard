
import { truncateID } from './utils.js';
import * as state from './state.js';

import { detailSidebar } from './detailSidebar.js';

export function createECSCard(cluster) {
    const title = cluster.ClusterName || 'Unnamed Cluster';
    const statusClass = cluster.Status === 'ACTIVE' ? 'available' : 'pending';

    return `
        <div class="vpc-card" data-id="${cluster.ClusterArn}" style="cursor: pointer;">
            <div class="vpc-card-title">${title}</div>
            <div class="vpc-card-row">
                <div>
                    <span class="status-dot ${statusClass}"></span>
                    <strong>Status:</strong>
                </div>
                <span>${cluster.Status}</span>
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

export function initECSListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'ecs') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const cluster = state.allVPCs.find(v => v.ClusterArn === id);
            if (cluster) {
                detailSidebar.open(cluster);
            }
        }
    });
}

export function createECSTableRow(cluster) {
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

export async function fetchECSClusters() {
    try {
        state.setCurrentPage('ecs');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching ECS clusters from AWS...';
        state.vpcGrid.innerHTML = '';
        state.vpcTableBody.innerHTML = '';

        const clusters = await window.go.main.App.GetECSClusters();
        state.loadingBar.classList.add('hidden');

        state.setAllVPCs(clusters || []);
        state.setFilteredVPCs([...state.allVPCs]);

        if (state.allVPCs.length === 0) {
            state.statusText.textContent = 'No ECS clusters found';
            const emptyCard = `
                <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                    <div class="vpc-card-title">No ECS Clusters</div>
                    <div class="vpc-card-info">No ECS clusters found in your AWS account</div>
                </div>
            `;
            state.vpcGrid.innerHTML = emptyCard;
            state.vpcTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                        No ECS clusters found
                    </td>
                </tr>
            `;
        } else {
            state.statusText.textContent = `${state.allVPCs.length} ECS cluster(s) found`;
            if (state.currentView === 'cards') {
                state.vpcGrid.innerHTML = state.allVPCs.map(cluster => createECSCard(cluster)).join('');
            } else {
                state.vpcTableBody.innerHTML = state.allVPCs.map(cluster => createECSTableRow(cluster)).join('');
            }
        }
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching ECS clusters';
        console.error('Error fetching ECS clusters:', error);
    }
}
