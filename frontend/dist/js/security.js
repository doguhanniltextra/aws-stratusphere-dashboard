import * as state from './state.js';
import { ErrorHandler } from './errorHandler.js';

export async function fetchSecurityInfo() {
    if (!state.securityContainer) return;

    state.securityContainer.innerHTML = '<div class="loading">Fetching security and compliance data...</div>';

    try {
        const info = await window.go.core.App.GetAccountHomeInfo();
        renderSecurityView(info);
    } catch (error) {
        console.error('Error fetching security info:', error);
        state.securityContainer.innerHTML = `<div class="error-container">Failed to load security info: ${error}</div>`;
    }
}

function renderSecurityView(info) {
    if (!info) return;

    const findings = info.top_findings || [];
    const recommendations = info.recommendations || [];

    state.securityContainer.innerHTML = `
        <div class="security-dashboard">
            <header class="security-header">
                <h1>Security & Compliance</h1>
                <div class="security-summary">
                    <div class="summary-pill critical">
                        <span class="count">${info.critical_findings || 0}</span>
                        <span class="label">Critical Findings</span>
                    </div>
                    <div class="summary-pill high">
                        <span class="count">${info.high_findings || 0}</span>
                        <span class="label">High Findings</span>
                    </div>
                </div>
            </header>

            <div class="security-grid">
                <!-- Security Hub Findings -->
                <section class="security-section findings-section">
                    <div class="section-header">
                        <h2>Top Security Hub Findings</h2>
                        <span class="freshness-notice">Updated: ${findings.length > 0 ? findings[0].updated_at : 'Just now'}</span>
                    </div>
                    
                    ${!info.security_hub_enabled ? `
                        <div class="empty-state action-required">
                            <div class="action-icon">⚠️</div>
                            <h3>Security Hub Not Enabled</h3>
                            <p>This region (${info.region}) does not have Security Hub active.</p>
                            <a href="https://console.aws.amazon.com/securityhub/home?region=${info.region}#/getting-started" target="_blank" class="btn btn-sm btn-primary">Enable in AWS Console</a>
                        </div>
                    ` : findings.length > 0 ? `
                        <div class="findings-list">
                            ${findings.map(f => `
                                <div class="finding-card ${f.severity.toLowerCase()}">
                                    <div class="finding-main">
                                        <span class="severity-tag">${f.severity}</span>
                                        <h3 class="finding-title">${f.title}</h3>
                                    </div>
                                    <div class="finding-details">
                                        <p class="finding-category">${f.category}</p>
                                        <span class="finding-resource">Resource: <code>${f.resource_id}</code></span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <p>No active critical or high findings found in Security Hub.</p>
                            <p class="small">Great job! Your posture looks solid in this region.</p>
                        </div>
                    `}
                </section>

                <!-- Trusted Advisor Recommendations -->
                <section class="security-section advisor-section">
                    <div class="section-header">
                        <h2>Trusted Advisor Recommendations</h2>
                        <span class="tier-notice">Requires Business+ Support for Full View</span>
                    </div>

                    ${!info.support_access_enabled ? `
                        <div class="empty-state plan-limited">
                            <div class="action-icon">ℹ️</div>
                            <h3>Business Support Required</h3>
                            <p>Full Trusted Advisor checks are only available with a Business or Enterprise support plan.</p>
                            <p class="small">Basic and Developer plans have limited visibility into these recommendations.</p>
                        </div>
                    ` : recommendations.length > 0 ? `
                        <div class="recommendations-list">
                            ${recommendations.map(r => `
                                <div class="advisor-card ${r.status.toLowerCase()}">
                                    <div class="advisor-header">
                                        <span class="status-indicator"></span>
                                        <h3>${r.check_name}</h3>
                                    </div>
                                    <div class="advisor-content">
                                        <p class="category">${r.category}</p>
                                        ${r.estimated_savings > 0 ? `<p class="savings">Potential Savings: <strong>$${r.estimated_savings.toFixed(2)}/mo</strong></p>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : `
                        <div class="empty-state">
                            <p>No critical recommendations found.</p>
                            <p class="small">Trusted Advisor hasn't flagged any urgent optimizations.</p>
                        </div>
                    `}
                </section>
            </div>
            
            <footer class="security-footer">
                <p>💡 <strong>Note:</strong> Data is fetched directly from Security Hub and Trusted Advisor. Some findings may have a slight delay in updates based on AWS service frequencies.</p>
            </footer>
        </div>
    `;
}
