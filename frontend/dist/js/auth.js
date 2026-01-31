// auth.js - AWS Credentials Setup Module

export async function checkCredentials() {
    try {
        const hasCredentials = await window.go.main.App.CheckCredentials();
        return hasCredentials;
    } catch (error) {
        console.error('Error checking credentials:', error);
        return false;
    }
}

export function showSetupScreen() {
    const setupOverlay = document.getElementById('setupOverlay');
    if (setupOverlay) {
        setupOverlay.classList.remove('hidden');
    }
}

export function hideSetupScreen() {
    const setupOverlay = document.getElementById('setupOverlay');
    if (setupOverlay) {
        setupOverlay.classList.add('hidden');
    }
}

export async function testConnection(accessKey, secretKey, region) {
    try {
        await window.go.main.App.TestAWSConnection(accessKey, secretKey, region);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message || 'Connection failed' };
    }
}

export async function saveCredentials(accessKey, secretKey, region) {
    try {
        await window.go.main.App.SaveAWSCredentials(accessKey, secretKey, region);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message || 'Failed to save credentials' };
    }
}

// Initialize setup screen event listeners
export function initSetupScreen() {
    const testButton = document.getElementById('testConnectionBtn');
    const saveButton = document.getElementById('saveCredentialsBtn');
    const accessKeyInput = document.getElementById('awsAccessKey');
    const secretKeyInput = document.getElementById('awsSecretKey');
    const regionSelect = document.getElementById('awsRegion');
    const statusMessage = document.getElementById('setupStatusMessage');

    // Test Connection button
    if (testButton) {
        testButton.addEventListener('click', async () => {
            const accessKey = accessKeyInput.value.trim();
            const secretKey = secretKeyInput.value.trim();
            const region = regionSelect.value;

            if (!accessKey || !secretKey || !region) {
                showStatus('Please fill in all fields', 'error');
                return;
            }

            testButton.disabled = true;
            testButton.textContent = 'Testing...';
            showStatus('Testing connection...', 'info');

            const result = await testConnection(accessKey, secretKey, region);

            testButton.disabled = false;
            testButton.textContent = 'Test Connection';

            if (result.success) {
                showStatus('Connection successful!', 'success');
                saveButton.disabled = false;
            } else {
                showStatus(`${result.error}`, 'error');
            }
        });
    }

    // Save Credentials button
    if (saveButton) {
        saveButton.addEventListener('click', async () => {
            const accessKey = accessKeyInput.value.trim();
            const secretKey = secretKeyInput.value.trim();
            const region = regionSelect.value;

            if (!accessKey || !secretKey || !region) {
                showStatus('Please fill in all fields', 'error');
                return;
            }

            saveButton.disabled = true;
            saveButton.textContent = 'Saving...';
            showStatus('Saving credentials...', 'info');

            const result = await saveCredentials(accessKey, secretKey, region);

            if (result.success) {
                showStatus(' Credentials saved! Initializing app...', 'success');

                // Hide setup screen and reload app
                setTimeout(() => {
                    hideSetupScreen();
                    window.location.reload();
                }, 1500);
            } else {
                showStatus(` ${result.error}`, 'error');
                saveButton.disabled = false;
                saveButton.textContent = 'Save & Continue';
            }
        });
    }

    function showStatus(message, type) {
        if (statusMessage) {
            statusMessage.textContent = message;
            statusMessage.className = `setup-status-message ${type}`;
            statusMessage.style.display = 'block';
        }
    }
}
