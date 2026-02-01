import * as state from './state.js';
import { ErrorHandler } from './errorHandler.js';

export async function fetchHomeInfo() {
    if (!state.homeContainer) return;

    state.homeContainer.innerHTML = '<div class="home-loading">Loading account overview...</div>';

    try {
        const info = await window.go.core.App.GetAccountHomeInfo();
        renderHome(info);
    } catch (error) {
        console.error('Error fetching home info:', error);
        state.homeContainer.innerHTML = `<div class="error-container">Failed to load account info: ${error}</div>`;
    }
}

function renderHome(info) {
    if (!info) return;

    const mfaStatusClass = info.mfa_enabled ? 'status-pill success' : 'status-pill warning';
    const mfaStatusText = info.mfa_enabled ? 'Enabled' : 'Disabled';

    state.homeContainer.innerHTML = `
        <div class="home-dashboard">
            <header class="home-header">
                <h1>Account Overview</h1>
                <div class="account-identity">
                    <span class="account-alias">${info.account_alias || 'No Alias'}</span>
                    <span class="account-id">${info.account_id}</span>
                </div>
            </header>

            <div class="home-grid">
                <!-- Identity Card -->
                <div class="home-card identity-card">
                    <div class="card-header">
                        <span class="card-icon"></span>
                        <h3>Identity</h3>
                    </div>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="label">Region</span>
                            <span class="value">${info.region}</span>
                        </div>
                        <div class="info-row">
                            <span class="label">User ARN</span>
                            <span class="value arn" title="${info.user_arn}">${truncateArn(info.user_arn)}</span>
                        </div>
                    </div>
                </div>

                <!-- Security Card -->
                <div class="home-card security-card">
                    <div class="card-header">
                        <span class="card-icon"></span>
                        <h3>Security</h3>
                    </div>
                    <div class="card-content">
                        <div class="info-row">
                            <span class="label">MFA Status</span>
                            <span class="${mfaStatusClass}">${mfaStatusText}</span>
                        </div>
                    </div>
                </div>

                <!-- Costs Card -->
                <div class="home-card costs-card">
                    <div class="card-header">
                        <span class="card-icon"></span>
                        <h3>Costs</h3>
                        <span class="lag-notice" title="AWS Cost Explorer data usually has a 24h delay">24h Lag</span>
                    </div>
                    <div class="card-content">
                        <div class="cost-item">
                            <span class="label">Yesterday</span>
                            <span class="value highlighted">$${info.cost_yesterday.toFixed(2)}</span>
                        </div>
                        <div class="cost-divider"></div>
                        <div class="cost-row">
                            <div class="cost-sub-item">
                                <span class="label">MTD</span>
                                <span class="value">$${info.cost_month_to_date.toFixed(2)}</span>
                            </div>
                            <div class="cost-sub-item">
                                <span class="label">Last Month</span>
                                <span class="value">$${info.cost_last_month.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Limits Card -->
                <div class="home-card limits-card">
                    <div class="card-header">
                        <span class="card-icon"></span>
                        <h3>Core Limits</h3>
                    </div>
                    <div class="card-content">
                        ${renderLimit('VPCs', info.vpc_usage, info.vpc_limit)}
                        ${renderLimit('EC2 Instances', info.instance_usage, info.instance_limit)}
                        ${renderLimit('Elastic IPs', info.eip_usage, info.eip_limit)}
                        ${renderLimit('NAT Gateways', info.nat_usage, info.nat_limit)}
                        ${renderLimit('Lambda Functions', info.lambda_usage, info.lambda_limit)}
                        ${renderLimit('S3 Buckets', info.s3_usage, info.s3_limit)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderLimit(label, usage, limit) {
    const percentage = limit > 0 ? (usage / limit) * 100 : 0;
    const barClass = percentage > 90 ? 'danger' : percentage > 75 ? 'warning' : '';

    return `
        <div class="limit-item">
            <div class="limit-labels">
                <span class="label">${label}</span>
                <span class="limit-value">${usage} / ${limit}</span>
            </div>
            <div class="limit-progress-bg">
                <div class="limit-progress-bar ${barClass}" style="width: ${Math.min(percentage, 100)}%"></div>
            </div>
        </div>
    `;
}

function truncateArn(arn) {
    if (!arn) return '';
    const parts = arn.split(':');
    return parts[parts.length - 1];
}
