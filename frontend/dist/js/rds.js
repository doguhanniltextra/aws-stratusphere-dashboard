import * as state from './state.js';
import { detailSidebar } from './detailSidebar.js';

export function createRDSCard(db) {
    const title = db.DBInstanceIdentifier;
    const isAvailable = db.DBInstanceStatus === 'available';
    const statusClass = isAvailable ? 'status-available' : 'status-pending';

    const multiAZBadge = db.MultiAZ ? '<span class="badge badge-blue">Multi-AZ</span>' : '';
    const publicBadge = db.PubliclyAccessible ? '<span class="badge badge-primary" style="background: rgba(210, 153, 34, 0.15); color: var(--brand-warning); border: 1px solid rgba(210, 153, 34, 0.2);">Public</span>' : '';

    return `
        <div class="vpc-card" data-id="${db.DBInstanceIdentifier}" style="cursor: pointer;">
            <div class="vpc-card-header">
                <div class="vpc-card-title-row">
                    <div class="vpc-card-title">🛢️ ${title}</div>
                    <span class="badge ${statusClass}">${db.DBInstanceStatus}</span>
                </div>
                <div style="display: flex; gap: 4px; margin-top: 4px;">
                    ${multiAZBadge}
                    ${publicBadge}
                </div>
            </div>

            <div class="vpc-card-divider"></div>

            <div class="vpc-card-body">
                <div class="vpc-card-row">
                    <span class="label">Engine:</span> 
                    <span class="value">${db.Engine} ${db.EngineVersion}</span>
                </div>
                
                <div class="vpc-card-row">
                    <span class="label">Class:</span> 
                    <span class="value font-mono">${db.DBInstanceClass}</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">Storage:</span> 
                    <span class="value">${db.AllocatedStorage} GB</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">Endpoint:</span> 
                    <span class="value font-mono text-xs" title="${db.Endpoint}">${db.Endpoint ? db.Endpoint.split(':')[0] : 'N/A'}</span>
                </div>

                <div class="vpc-card-row">
                    <span class="label">VPC/AZ:</span> 
                    <div class="value font-mono text-xs" style="text-align: right;">
                        <div>${truncateID(db.VpcId || '')}</div>
                        <div style="color: var(--text-muted);">${db.AvailabilityZone || '-'}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function createRDSTableRow(db) {
    const isAvailable = db.DBInstanceStatus === 'available';
    const statusClass = isAvailable ? 'available' : 'pending';

    return `
        <tr>
            <td><strong>${db.DBInstanceIdentifier}</strong></td>
            <td>${db.Engine} ${db.EngineVersion}</td>
            <td class="font-mono">${db.DBInstanceClass}</td>
            <td class="vpc-status">
                <span class="status-dot ${statusClass}"></span>
                ${db.DBInstanceStatus}
            </td>
            <td>${db.AllocatedStorage} GB</td>
            <td class="font-mono text-xs">${db.Endpoint ? db.Endpoint.split(':')[0] : '-'}</td>
            <td>${db.MultiAZ ? 'Yes' : 'No'}</td>
        </tr>
    `;
}

export async function fetchRDSInstances() {
    try {
        state.setCurrentPage('rds-list');
        state.loadingBar.classList.remove('hidden');
        state.statusText.textContent = 'Fetching RDS Instances...';
        state.vpcGrid.innerHTML = '';
        state.rdsTableBody.innerHTML = '';

        const dbs = await window.go.core.App.GetRDSInstances();
        state.loadingBar.classList.add('hidden');

        state.setAllRDSInstances(dbs || []);
        state.setFilteredRDSInstances([...state.allRDSInstances]);

        renderRDSInstances();
    } catch (error) {
        state.loadingBar.classList.add('hidden');
        state.statusText.textContent = 'Error fetching RDS Instances';
        console.error(error);
    }
}

export function renderRDSInstances() {
    if (state.filteredRDSInstances.length === 0) {
        state.statusText.textContent = 'No RDS instances found';
        const emptyCard = `
            <div class="vpc-card" data-empty="true" style="cursor: pointer;">
                <div class="vpc-card-title">No RDS Instances</div>
                <div class="vpc-card-info">No RDS Instances found in your AWS account</div>
            </div>
        `;
        state.vpcGrid.innerHTML = emptyCard;
        state.rdsTableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 32px; color: var(--text-secondary);">
                    No RDS Instances found
                </td>
            </tr>
        `;
        return;
    }

    state.statusText.textContent = `${state.filteredRDSInstances.length} RDS Instance(s) found`;

    if (state.currentView === 'cards') {
        state.vpcGrid.innerHTML = state.filteredRDSInstances.map(db => createRDSCard(db)).join('');
    } else {
        state.rdsTableBody.innerHTML = state.filteredRDSInstances.map(db => createRDSTableRow(db)).join('');
    }
}

export function initRDSListeners() {
    if (!state.vpcGrid) return;

    state.vpcGrid.addEventListener('click', (e) => {
        if (state.currentPage !== 'rds-list') return;

        const card = e.target.closest('.vpc-card');
        if (card) {
            if (card.dataset.empty === 'true') {
                detailSidebar.open({ message: "Not found yet" });
                return;
            }
            const id = card.dataset.id;
            const db = state.allRDSInstances.find(d => d.DBInstanceIdentifier === id);
            if (db) {
                detailSidebar.open(db);
            }
        }
    });
}
