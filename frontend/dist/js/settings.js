import { themeManager } from './themeManager.js';

export function initSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const modal = document.getElementById('settingsModal');
    const closeBtn = document.getElementById('closeSettings');
    const awsRegionSpan = document.getElementById('settingsRegion');
    const awsAccountIDSpan = document.getElementById('settingsAccountID');
    const awsUserARNSpan = document.getElementById('settingsUserARN');

    console.log('Settings init - Elements found:', {
        settingsBtn: !!settingsBtn,
        modal: !!modal,
        closeBtn: !!closeBtn,
        awsRegionSpan: !!awsRegionSpan,
        awsAccountIDSpan: !!awsAccountIDSpan,
        awsUserARNSpan: !!awsUserARNSpan
    });

    if (!settingsBtn || !modal || !closeBtn) {
        console.error('Settings elements not found');
        return;
    }

    if (!awsRegionSpan || !awsAccountIDSpan || !awsUserARNSpan) {
        console.error('AWS info span elements not found!');
        return;
    }

    // Helper to mask string
    // Show last 4 chars, mask the rest
    const maskString = (str, visibleAtEnd = 4) => {
        if (!str) return '-';
        if (str.length <= visibleAtEnd) return str;
        return '*'.repeat(str.length - visibleAtEnd) + str.slice(-visibleAtEnd);
    };

    // Helper to mask ARN
    // Show "arn:aws:iam::...:user/name"
    const maskARN = (arn) => {
        if (!arn) return '-';
        const parts = arn.split(':');
        if (parts.length < 5) return maskString(arn);

        // Hide account ID in ARN
        parts[4] = '************'; // Mask account ID in ARN
        return parts.join(':');
    };

    // Theme Selector Logic
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        // Populate options
        const themes = themeManager.getThemes();
        themeSelect.innerHTML = themes.map(t =>
            `<option value="${t.id}">${t.name}</option>`
        ).join('');

        // Set current value
        themeSelect.value = themeManager.getCurrentTheme();

        // Handle change
        themeSelect.addEventListener('change', (e) => {
            themeManager.setTheme(e.target.value);
        });
    }

    // Open modal
    settingsBtn.addEventListener('click', async () => {
        modal.classList.remove('hidden');

        // Fetch config
        try {
            const config = await window.go.core.App.GetConfiguration();
            console.log('Configuration received:', config); // DEBUG

            if (config) {
                // Region
                if (config.Region) {
                    if (awsRegionSpan) {
                        console.log('Element before update:', awsRegionSpan.outerHTML);
                        awsRegionSpan.textContent = config.Region;
                        console.log('Element after update:', awsRegionSpan.outerHTML);
                        console.log('✅ Region updated to:', config.Region);
                    } else {
                        console.error('❌ awsRegionSpan is null!');
                    }
                } else {
                    console.warn('Region is empty or undefined:', config.Region); // DEBUG
                    if (awsRegionSpan) awsRegionSpan.textContent = 'Unknown';
                }

                // Account ID - Masked
                if (config.AccountID) {
                    if (awsAccountIDSpan) {
                        awsAccountIDSpan.textContent = maskString(config.AccountID);
                        awsAccountIDSpan.title = config.AccountID; // Show full on hover
                        console.log('✅ Account ID updated');
                    }
                } else {
                    if (awsAccountIDSpan) awsAccountIDSpan.textContent = '-';
                }

                // User ARN - Masked
                if (config.UserARN) {
                    if (awsUserARNSpan) {
                        // Simple logic: if it's an ARN, just show the last part (user/role name) and mask the account ID part
                        awsUserARNSpan.textContent = maskARN(config.UserARN);
                        awsUserARNSpan.title = config.UserARN; // Show full on hover
                        console.log('✅ User ARN updated');
                    }
                } else {
                    if (awsUserARNSpan) awsUserARNSpan.textContent = '-';
                }
            } else {
                console.error('Config is null or undefined'); // DEBUG
                awsRegionSpan.textContent = 'Error';
            }
        } catch (error) {
            console.error('Failed to fetch config:', error);
            awsRegionSpan.textContent = 'Error';
        }
    });

    // Close modal with X button
    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.add('hidden');
        }
    });

    // Close with Escape key
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const confirmed = confirm('Are you sure you want to logout? Your AWS credentials will be deleted from this device.');

            if (!confirmed) return;

            try {
                logoutBtn.disabled = true;
                logoutBtn.textContent = 'Logging out...';

                await window.go.core.App.Logout();

                // Close settings modal
                modal.classList.add('hidden');

                // Reload the page to show setup screen
                window.location.reload();
            } catch (error) {
                console.error('Logout failed:', error);
                alert('Failed to logout: ' + error.message);
                logoutBtn.disabled = false;
                logoutBtn.textContent = '🚪 Logout & Clear Credentials';
            }
        });
    }
}
