
import { truncateID } from './utils.js';
import * as state from './state.js';

import { detailSidebar } from './detailSidebar.js';

export function createNATGatewayCard(nat) {
    const title = nat.Name || nat.ID;
    const showID = nat.Name ? `<div class="vpc-card-id">ID: ${truncateID(nat.ID)}</div>` : '';
    const statusClass = nat.State === 'available' ? 'available' : 'pending';

    return `
        <div class="vpc-card" data-id="${nat.ID}" style="cursor: pointer;">
            <div class="vpc-card-title">🌐 ${title}</div>
            ${showID}
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-row">
                <div>
                    <span class="status-dot ${statusClass}"></span>
                    <strong>Status:</strong>
                </div>
                <span>${nat.State}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Public IP:</strong>
                <span>${nat.PublicIP || 'N/A'}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Private IP:</strong>
                <span>${nat.PrivateIP || 'N/A'}</span>
            </div>
            <div class="vpc-card-row">
                <strong>VPC:</strong>
                <span>${truncateID(nat.VPCID)}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Subnet:</strong>
                <span>${truncateID(nat.SubnetID)}</span>
            </div>
        </div>
    `;
}

export function initNATGatewayListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'nat-list') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const nat = state.allNATGateways.find(n => n.ID === id);
            if (nat) {
                detailSidebar.open(nat);
            }
        }
    });
}

export function createNATGatewayTableRow(nat) {
    const name = nat.Name || '-';
    const statusClass = nat.State === 'available' ? 'available' : 'pending';

    return `
        <tr>
            <td><strong>${name}</strong></td>
            <td class="vpc-id">${nat.ID}</td>
            <td class="vpc-status">
                <span class="status-dot ${statusClass}"></span>
                ${nat.State}
            </td>
            <td>${nat.PublicIP || '-'}</td>
            <td>${nat.PrivateIP || '-'}</td>
            <td class="vpc-id">${nat.VPCID}</td>
            <td class="vpc-id">${nat.SubnetID}</td>
        </tr>
    `;
}

export async function fetchNATGateways() {
    try {
        state.setCurrentPage('nat-list');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching NAT Gateways...';
        state.vpcGrid.innerHTML = '';
        state.natTableBody.innerHTML = '';

        const nats = await window.go.core.App.GetNATGateways();
        state.loadingBar.classList.add('hidden');

        // Store state (need to add to state.js)
        state.setAllNATGateways(nats || []);
        state.setFilteredNATGateways([...state.allNATGateways]);

        renderNATGateways();
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching NAT Gateways';
        console.error(error);
    }
}

export function renderNATGateways() {
    if (state.filteredNATGateways.length === 0) {
        const emptyCard = `
            <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                <div class="vpc-card-title">No NAT Gateways</div>
                <div class="vpc-card-info">No NAT Gateways found in your AWS account</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.vpcTableBody.innerHTML = '<tr><td colspan="7">No NAT Gateways found</td></tr>';
        return;
    }

    state.statusText.textContent = `${state.filteredNATGateways.length} NAT Gateway(s) found`;

    if (state.currentView === 'cards') {
        state.vpcGrid.innerHTML = state.filteredNATGateways.map(nat => createNATGatewayCard(nat)).join('');
    } else {
        state.natTableBody.innerHTML = state.filteredNATGateways.map(nat => createNATGatewayTableRow(nat)).join('');
    }
}
