
import { truncateID } from './utils.js';
import * as state from './state.js';

import { detailSidebar } from './detailSidebar.js';

export function createTargetGroupCard(tg) {
    const title = tg.Name;

    return `
        <div class="vpc-card" data-id="${tg.ARN}" style="cursor: pointer;">
            <div class="vpc-card-title">🎯 ${title}</div>
            <div class="vpc-card-divider"></div>
            <div class="vpc-card-row">
                <strong>Protocol:</strong>
                <span>${tg.Protocol}:${tg.Port}</span>
            </div>
            <div class="vpc-card-row">
                <strong>Type:</strong>
                <span>${tg.TargetType}</span>
            </div>
            <div class="vpc-card-row">
                <strong>VPC:</strong>
                <span>${truncateID(tg.VPCID)}</span>
            </div>
            <div class="vpc-card-info">
                ARN: ${truncateID(tg.ARN)}
            </div>
        </div>
    `;
}

export function initTargetGroupListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'target-group-list') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const tg = state.allTargetGroups.find(t => t.ARN === id);
            if (tg) {
                detailSidebar.open(tg);
            }
        }
    });
}

export function createTargetGroupTableRow(tg) {
    return `
        <tr>
            <td><strong>${tg.Name}</strong></td>
            <td>${tg.Protocol}</td>
            <td>${tg.Port}</td>
            <td>${tg.TargetType}</td>
            <td class="vpc-id">${tg.VPCID}</td>
        </tr>
    `;
}

export async function fetchTargetGroups() {
    try {
        state.setCurrentPage('target-group-list');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching Target Groups...';
        state.vpcGrid.innerHTML = '';
        state.tgTableBody.innerHTML = '';

        const tgs = await window.go.core.App.GetTargetGroups();
        state.loadingBar.classList.add('hidden');

        state.setAllTargetGroups(tgs || []);
        state.setFilteredTargetGroups([...state.allTargetGroups]);

        renderTargetGroups();
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching Target Groups';
        console.error(error);
    }
}

export function renderTargetGroups() {
    if (state.filteredTargetGroups.length === 0) {
        const emptyCard = `
            <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                <div class="vpc-card-title">No Target Groups</div>
                <div class="vpc-card-info">No Target Groups found in your AWS account</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.vpcTableBody.innerHTML = '<tr><td colspan="5">No Target Groups found</td></tr>';
        return;
    }

    state.statusText.textContent = `${state.filteredTargetGroups.length} Target Group(s) found`;

    if (state.currentView === 'cards') {
        state.vpcGrid.innerHTML = state.filteredTargetGroups.map(tg => createTargetGroupCard(tg)).join('');
    } else {
        state.tgTableBody.innerHTML = state.filteredTargetGroups.map(tg => createTargetGroupTableRow(tg)).join('');
    }
}
