
import { truncateID } from './utils.js';
import * as state from './state.js';
import { detailSidebar } from './detailSidebar.js';

export function createElasticIPCard(eip) {
    const title = eip.PublicIP;
    const showID = eip.AllocationID ? `<div class="vpc-card-id">ID: ${truncateID(eip.AllocationID)}</div>` : '';
    const statusClass = eip.AssociationID ? 'available' : 'pending';
    const statusText = eip.AssociationID ? 'Associated' : 'Unassociated';

    return `
        <div class="vpc-card" data-id="${eip.PublicIP}" style="cursor: pointer;">
            <div class="vpc-card-title">📍 ${title}</div>
            ${showID}
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-row">
                <div>
                    <span class="status-dot ${statusClass}"></span>
                    <strong>Status:</strong>
                </div>
                <span>${statusText}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Instance ID:</strong>
                <span>${truncateID(eip.InstanceID) || 'N/A'}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Private IP:</strong>
                <span>${eip.PrivateIP || 'N/A'}</span>
            </div>
             <div class="vpc-card-row">
                <strong>Association ID:</strong>
                <span>${truncateID(eip.AssociationID) || 'N/A'}</span>
            </div>
        </div>
    `;
}

export function createElasticIPTableRow(eip) {
    return `
        <tr>
            <td><strong>${eip.PublicIP}</strong></td>
            <td class="vpc-id">${eip.AllocationID}</td>
            <td class="vpc-id">${eip.InstanceID || '-'}</td>
            <td>${eip.PrivateIP || '-'}</td>
            <td class="vpc-id">${eip.AssociationID || '-'}</td>
        </tr>
    `;
}

export async function fetchElasticIPs() {
    try {
        state.setCurrentPage('elasticip-list');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching Elastic IPs...';
        state.vpcGrid.innerHTML = '';
        state.eipTableBody.innerHTML = '';

        const eips = await window.go.core.App.GetElasticIPs();
        state.loadingBar.classList.add('hidden');

        state.setAllElasticIPs(eips || []);
        state.setFilteredElasticIPs([...state.allElasticIPs]);

        renderElasticIPs();
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching Elastic IPs';
        console.error(error);
    }
}

export function renderElasticIPs() {
    if (state.filteredElasticIPs.length === 0) {
        state.statusText.textContent = 'No Elastic IPs found';
        const emptyCard = `
            <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                <div class="vpc-card-title">No Elastic IPs</div>
                <div class="vpc-card-info">No Elastic IPs found in your AWS account</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.eipTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                    No Elastic IPs found
                </td>
            </tr>
        `;
        return;
    }

    state.statusText.textContent = `${state.filteredElasticIPs.length} Elastic IP(s) found`;

    if (state.currentView === 'cards') {
        state.vpcGrid.innerHTML = state.filteredElasticIPs.map(eip => createElasticIPCard(eip)).join('');
    } else {
        state.eipTableBody.innerHTML = state.filteredElasticIPs.map(eip => createElasticIPTableRow(eip)).join('');
    }
}

export function initElasticIPListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'elasticip-list') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const eip = state.allElasticIPs.find(e => e.PublicIP === id);
            if (eip) {
                detailSidebar.open(eip);
            }
        }
    });
}
