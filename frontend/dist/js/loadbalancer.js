import { truncateID } from './utils.js';
import * as state from './state.js';

import { detailSidebar } from './detailSidebar.js';

export function createLoadBalancerCard(lb) {
    const title = lb.Name;
    const statusClass = lb.State === 'active' ? 'available' : 'pending';

    return `
        <div class="vpc-card" data-id="${lb.Name}" style="cursor: pointer;">
            <div class="vpc-card-title">⚖️ ${title}</div>
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-row">
                 <div>
                    <span class="status-dot ${statusClass}"></span>
                    <strong>Status:</strong>
                </div>
                <span>${lb.State}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Type:</strong>
                <span>${lb.Type}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Scheme:</strong>
                <span>${lb.Scheme}</span>
            </div>
            <div class="vpc-card-row">
                <strong>DNS Name:</strong>
            </div>
            <div class="vpc-card-info" style="margin-top:0;">
                <span style="font-size: 0.9em;">${lb.DNSName}</span>
            </div>
        </div>
    `;
}

export function initLoadBalancerListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'lb-list') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const lb = state.allLoadBalancers.find(l => l.Name === id);
            if (lb) {
                detailSidebar.open(lb);
            }
        }
    });
}

export function createLoadBalancerTableRow(lb) {
    const statusClass = lb.State === 'active' ? 'available' : 'pending';
    return `
        <tr>
            <td><strong>${lb.Name}</strong></td>
            <td>
                <span class="status-dot ${statusClass}"></span>
                ${lb.State}
            </td>
            <td>${lb.Type}</td>
            <td>${lb.Scheme}</td>
            <td>${lb.DNSName}</td>
        </tr>
    `;
}

export async function fetchLoadBalancers() {
    try {
        state.setCurrentPage('lb-list');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching Load Balancers...';
        state.vpcGrid.innerHTML = '';
        state.lbTableBody.innerHTML = '';

        const lbs = await window.go.main.App.GetLoadBalancers();
        state.loadingBar.classList.add('hidden');

        state.setAllLoadBalancers(lbs || []);
        state.setFilteredLoadBalancers([...state.allLoadBalancers]);

        renderLoadBalancers();
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching Load Balancers';
        console.error(error);
    }
}

export function renderLoadBalancers() {
    if (state.filteredLoadBalancers.length === 0) {
        const emptyCard = `
            <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                <div class="vpc-card-title">No Load Balancers</div>
                <div class="vpc-card-info">No Load Balancers found in your AWS account</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.vpcTableBody.innerHTML = '<tr><td colspan="5">No Load Balancers found</td></tr>';
        return;
    }

    state.statusText.textContent = `${state.filteredLoadBalancers.length} Load Balancer(s) found`;

    if (state.currentView === 'cards') {
        state.vpcGrid.innerHTML = state.filteredLoadBalancers.map(lb => createLoadBalancerCard(lb)).join('');
    } else {
        state.lbTableBody.innerHTML = state.filteredLoadBalancers.map(lb => createLoadBalancerTableRow(lb)).join('');
    }
}
