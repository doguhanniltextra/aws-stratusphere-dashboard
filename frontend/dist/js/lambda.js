import { truncateID } from './utils.js';
import * as state from './state.js';
import { detailSidebar } from './detailSidebar.js';

export function createLambdaCard(fn) {
    const title = fn.FunctionName;
    const isActive = fn.State === 'Active';
    const statusClass = isActive ? 'status-available' : 'status-pending';

    return `
        <div class="vpc-card" data-id="${fn.FunctionName}" style="cursor: pointer;">
            <div class="vpc-card-header">
                <div class="vpc-card-title-row">
                    <div class="vpc-card-title">⚡ ${title}</div>
                    <span class="badge ${statusClass}">${fn.State}</span>
                </div>
            </div>

            <div class="vpc-card-divider"></div>

            <div class="vpc-card-body">
                <div class="vpc-card-row">
                    <span class="label">Runtime:</span> 
                    <span class="value font-mono">${fn.Runtime}</span>
                </div>
                
                <div class="vpc-card-row">
                    <span class="label">Memory:</span> 
                    <span class="value font-mono">${fn.MemorySize} MB</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">Handler:</span> 
                    <span class="value font-mono text-xs" title="${fn.Handler}">${fn.Handler}</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">Modified:</span> 
                    <span class="value font-mono">${fn.LastModified.split('T')[0]}</span>
                </div>
            </div>
        </div>
    `;
}

export function createLambdaTableRow(fn) {
    const isActive = fn.State === 'Active';
    const statusClass = isActive ? 'available' : 'pending';

    return `
        <tr>
            <td><strong>${fn.FunctionName}</strong></td>
            <td>${fn.Runtime}</td>
            <td class="font-mono">${fn.MemorySize} MB</td>
            <td class="vpc-status">
                <span class="status-dot ${statusClass}"></span>
                ${fn.State}
            </td>
            <td class="font-mono">${fn.LastModified.split('T')[0]}</td>
        </tr>
    `;
}

export async function fetchLambdaFunctions() {
    try {
        state.setCurrentPage('lambda-list');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching Lambda Functions...';
        state.vpcGrid.innerHTML = '';
        state.lambdaTableBody.innerHTML = '';

        const fns = await window.go.main.App.GetLambdaFunctions();
        state.loadingBar.classList.add('hidden');

        state.setAllLambdaFunctions(fns || []);
        state.setFilteredLambdaFunctions([...state.allLambdaFunctions]);

        renderLambdaFunctions();
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching Lambda functions';
        console.error(error);
    }
}

export function renderLambdaFunctions() {
    if (state.filteredLambdaFunctions.length === 0) {
        state.statusText.textContent = 'No Lambda functions found';
        const emptyCard = `
            <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                <div class="vpc-card-title">No Lambda Functions</div>
                <div class="vpc-card-divider"></div>
                <div class="vpc-card-info">No Lambda functions found in your AWS account</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.lambdaTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                    No Lambda functions found
                </td>
            </tr>
        `;
        return;
    }

    state.statusText.textContent = `${state.filteredLambdaFunctions.length} Lambda function(s) found`;

    if (state.currentView === 'cards') {
        state.vpcGrid.innerHTML = state.filteredLambdaFunctions.map(fn => createLambdaCard(fn)).join('');
    } else {
        state.lambdaTableBody.innerHTML = state.filteredLambdaFunctions.map(fn => createLambdaTableRow(fn)).join('');
    }
}

export function initLambdaListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'lambda-list') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const fn = state.allLambdaFunctions.find(f => f.FunctionName === id);
            if (fn) {
                detailSidebar.open(fn);
            }
        }
    });
}
