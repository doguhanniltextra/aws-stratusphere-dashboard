import { truncateID } from './utils.js';
import * as state from './state.js';

import { detailSidebar } from './detailSidebar.js';

export function createS3Card(bucket) {
    const title = bucket.Name;
    const creationDate = bucket.CreationDate;
    const region = bucket.Region || 'Global';

    return `
        <div class="vpc-card" data-id="${bucket.Name}" style="cursor: pointer;">
            <div class="vpc-card-header">
                <div class="vpc-card-title-row">
                     <div class="vpc-card-title">🪣 ${title}</div>
                     <span class="badge badge-blue">S3</span>
                </div>
            </div>

            <div class="vpc-card-divider"></div>

            <div class="vpc-card-body">
                <div class="vpc-card-row">
                    <span class="label">Region:</span> 
                    <span class="value font-mono">${region}</span>
                </div>
                
                <div class="vpc-card-row">
                    <span class="label">Created:</span> 
                    <span class="value font-mono">${creationDate}</span>
                </div>
            </div>
        </div>
    `;
}

export function initS3Listeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 's3-list') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const bucket = state.allS3Buckets.find(b => b.Name === id);
            if (bucket) {
                detailSidebar.open(bucket);
            }
        }
    });
}

export function createS3TableRow(bucket) {
    return `
        <tr>
            <td><strong>${bucket.Name}</strong></td>
            <td>${bucket.Region}</td>
            <td class="font-mono">${bucket.CreationDate}</td>
            <td>-</td>
        </tr>
    `;
}

export async function fetchS3Buckets() {
    try {
        state.setCurrentPage('s3-list');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching S3 Buckets...';
        state.vpcGrid.innerHTML = '';
        state.s3TableBody.innerHTML = '';

        const buckets = await window.go.main.App.GetS3Buckets();
        state.loadingBar.classList.add('hidden');

        state.setAllS3Buckets(buckets || []);
        state.setFilteredS3Buckets([...state.allS3Buckets]);

        renderS3Buckets();
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching S3 Buckets';
        console.error(error);
    }
}

export function renderS3Buckets() {
    if (state.filteredS3Buckets.length === 0) {
        const emptyCard = `
            <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                <div class="vpc-card-title">No S3 Buckets</div>
                <div class="vpc-card-info">No S3 Buckets found in your AWS account</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.vpcTableBody.innerHTML = '<tr><td colspan="4">No S3 Buckets found</td></tr>';
        return;
    }

    state.statusText.textContent = `${state.filteredS3Buckets.length} S3 Bucket(s) found`;

    if (state.currentView === 'cards') {
        if (state.currentGroupField && state.currentGroupField !== 'none') {
            const groups = state.groupData(state.filteredS3Buckets, state.currentGroupField);
            state.vpcGrid.innerHTML = Object.entries(groups).map(([groupName, items]) => `
                <div class="resource-group">
                    <div class="group-header">
                        <span class="group-title">${groupName}</span>
                        <span class="group-count">${items.length}</span>
                    </div>
                    <div class="group-content">
                        ${items.map(b => createS3Card(b)).join('')}
                    </div>
                </div>
            `).join('');
        } else {
            state.vpcGrid.innerHTML = state.filteredS3Buckets.map(b => createS3Card(b)).join('');
        }
    } else {
        state.s3TableBody.innerHTML = state.filteredS3Buckets.map(b => createS3TableRow(b)).join('');
    }
}
