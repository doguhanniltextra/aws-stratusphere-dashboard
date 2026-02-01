import { truncateID } from './utils.js';
import * as state from './state.js';

import { detailSidebar } from './detailSidebar.js';

export function createRouteTableCard(rt) {
    const title = rt.Name || rt.ID;
    const showID = rt.Name ? `<div class="vpc-card-id">ID: ${truncateID(rt.ID)}</div>` : '';
    const mainBadge = rt.IsMain ? '<span style="color: var(--brand-success);">●</span> Main' : 'Custom';

    return `
        <div class="vpc-card" data-id="${rt.ID}" style="cursor: pointer;">
            <div class="vpc-card-title">🗺️ ${title}</div>
            ${showID}
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-row">
                <strong>VPC:</strong>
                <span>${truncateID(rt.VPCID)}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Main:</strong>
                <span>${mainBadge}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Routes:</strong>
                <span>${rt.Routes}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Associations:</strong>
                <span>${rt.Subnets}</span>
            </div>
        </div>
    `;
}

export function initRouteTableListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'route-list') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const rt = state.allRouteTables.find(r => r.ID === id);
            if (rt) {
                detailSidebar.open(rt);
            }
        }
    });
}

export function createRouteTableTableRow(rt) {
    const name = rt.Name || '-';

    return `
        <tr>
            <td><strong>${name}</strong></td>
            <td class="vpc-id">${rt.ID}</td>
            <td class="vpc-id">${rt.VPCID}</td>
            <td>${rt.IsMain ? 'Yes' : 'No'}</td>
            <td>${rt.Routes}</td>
            <td>${rt.Subnets}</td>
        </tr>
    `;
}

export async function fetchRouteTables() {
    try {
        state.setCurrentPage('route-list');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching Route Tables...';
        state.vpcGrid.innerHTML = '';
        state.routeTableBody.innerHTML = '';

        const rts = await window.go.core.App.GetRouteTables();
        state.loadingBar.classList.add('hidden');

        state.setAllRouteTables(rts || []);
        state.setFilteredRouteTables([...state.allRouteTables]);

        renderRouteTables();
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching Route Tables';
        console.error(error);
    }
}

export function renderRouteTables() {
    if (state.filteredRouteTables.length === 0) {
        const emptyCard = `
            <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                <div class="vpc-card-title">No Route Tables</div>
                <div class="vpc-card-info">No Route Tables found in your AWS account</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.vpcTableBody.innerHTML = '<tr><td colspan="6">No Route Tables found</td></tr>';
        return;
    }

    state.statusText.textContent = `${state.filteredRouteTables.length} Route Table(s) found`;

    if (state.currentView === 'cards') {
        state.vpcGrid.innerHTML = state.filteredRouteTables.map(rt => createRouteTableCard(rt)).join('');
    } else {
        state.routeTableBody.innerHTML = state.filteredRouteTables.map(rt => createRouteTableTableRow(rt)).join('');
    }
}
