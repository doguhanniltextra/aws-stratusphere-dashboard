
export const detailSidebar = {
    elements: {
        sidebar: null,
        content: null,
        closeBtn: null,
        tabs: [],
        panels: [],
        metricsContent: null,
    },
    currentData: null,
    currentTab: 'details',

    init() {
        this.elements.sidebar = document.getElementById('detailSidebar');
        this.elements.content = document.getElementById('detailContent');
        this.elements.closeBtn = document.getElementById('closeDetailSidebar');
        this.elements.tabs = document.querySelectorAll('.detail-tab');
        this.elements.panels = document.querySelectorAll('.tab-panel');
        this.elements.metricsContent = document.getElementById('metricsContent');

        if (!this.elements.sidebar || !this.elements.content || !this.elements.closeBtn) {
            console.error('Detail Sidebar elements not found');
            return;
        }

        // Close button listener
        this.elements.closeBtn.addEventListener('click', () => {
            this.close();
        });

        // Tab switching
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchTab(tab.getAttribute('data-tab'));
            });
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    },

    open(data) {
        if (!this.elements.sidebar) return;

        this.currentData = data;

        // Reset to details tab
        this.switchTab('details');

        // Format JSON
        const jsonString = JSON.stringify(data, null, 2);
        this.elements.content.textContent = jsonString;

        this.elements.sidebar.classList.add('open');
    },

    switchTab(tabId) {
        this.currentTab = tabId;

        // Update tabs active state
        this.elements.tabs.forEach(tab => {
            tab.classList.toggle('active', tab.getAttribute('data-tab') === tabId);
        });

        // Update panels active state
        this.elements.panels.forEach(panel => {
            panel.classList.toggle('active', panel.id === `${tabId}Tab`);
        });

        if (tabId === 'metrics') {
            this.loadMetrics();
        }
    },

    async loadMetrics() {
        if (!this.currentData || !this.elements.metricsContent) return;

        // Add period selector if not present
        if (!document.getElementById('metricPeriod')) {
            const periodContainer = document.createElement('div');
            periodContainer.className = 'metrics-toolbar';
            periodContainer.innerHTML = `
                <div class="period-selector">
                    <label for="metricPeriod">Interval:</label>
                    <select id="metricPeriod" class="custom-select-sm">
                        <option value="60">1 Minute</option>
                        <option value="300">5 Minutes</option>
                        <option value="3600" selected>1 Hour</option>
                        <option value="21600">6 Hours</option>
                        <option value="86400">1 Day</option>
                    </select>
                </div>
            `;
            this.elements.metricsContent.parentNode.insertBefore(periodContainer, this.elements.metricsContent);

            document.getElementById('metricPeriod').addEventListener('change', () => this.loadMetrics());
        }

        const period = parseInt(document.getElementById('metricPeriod').value);
        this.elements.metricsContent.innerHTML = '<div class="metrics-loading">Fetching CloudWatch metrics...</div>';

        try {
            // Check if it's an ECS Cluster
            if (this.currentData.ClusterName) {
                const results = await window.go.core.App.GetECSMetrics(this.currentData.ClusterName, period);
                this.renderMetrics(results);
            } else {
                this.elements.metricsContent.innerHTML = '<div class="metrics-loading">Metrics only available for ECS Clusters and Lambdas.</div>';
            }
        } catch (err) {
            console.error('Failed to load metrics:', err);
            this.elements.metricsContent.innerHTML = `<div class="metrics-loading" style="color: var(--status-error)">Error: ${err.message || err}</div>`;
        }
    },

    renderMetrics(data) {
        if (!data || !data.metrics || data.metrics.length === 0) {
            this.elements.metricsContent.innerHTML = '<div class="metrics-loading">No metric data found for this period.</div>';
            return;
        }

        let html = '';
        data.metrics.forEach(metric => {
            const values = metric.values || [];
            const latestValue = values.length > 0 ? values[0] : null;
            let formattedValue = 'N/A';
            let unit = '';

            if (latestValue !== null) {
                if (metric.label.includes('Utilization')) {
                    formattedValue = latestValue.toFixed(2);
                    unit = '%';
                } else if (metric.label.includes('Network')) {
                    // Convert bytes to KB/MB
                    if (latestValue > 1024 * 1024) {
                        formattedValue = (latestValue / (1024 * 1024)).toFixed(2);
                        unit = ' MB';
                    } else if (latestValue > 1024) {
                        formattedValue = (latestValue / 1024).toFixed(2);
                        unit = ' KB';
                    } else {
                        formattedValue = latestValue.toFixed(0);
                        unit = ' B';
                    }
                } else {
                    formattedValue = latestValue.toFixed(2);
                }
            }

            html += `
                <div class="metric-card">
                    <div class="metric-header">
                        <span class="metric-title">${metric.label || 'Metric'}</span>
                        <span class="metric-value">${formattedValue}${unit}</span>
                    </div>
                    <div class="metric-chart">
                        ${this.generateMetricBars(values)}
                    </div>
                </div>
            `;
        });

        this.elements.metricsContent.innerHTML = html;
    },

    generateMetricBars(values) {
        if (!values || values.length === 0) return '';

        // Use last 24 values (or all if less)
        const displayValues = values.slice(0, 24).reverse();
        const max = Math.max(...displayValues, 1); // Avoid division by zero

        return displayValues.map(v => {
            const height = (v / max) * 100;
            return `<div class="metric-bar" style="height: ${Math.max(height, 5)}%" title="${v.toFixed(2)}"></div>`;
        }).join('');
    },

    close() {
        if (this.elements.sidebar) {
            this.elements.sidebar.classList.remove('open');
        }
    }
};
