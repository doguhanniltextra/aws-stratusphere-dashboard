

export const ErrorHandler = {
    container: null,

    init() {
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    show(message, type = 'error') {
        this.init(); // Ensure container exists

        const toast = document.createElement('div');
        toast.classList.add('toast', type);

        // Icon based on type
        let icon = '';
        if (type === 'error') icon = '❌';
        else if (type === 'success') icon = '✅';
        else icon = 'ℹ️';

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <span class="toast-message">${message}</span>
            <span class="toast-close">&times;</span>
        `;

        // Click to close
        toast.querySelector('.toast-close').addEventListener('click', () => {
            this.remove(toast);
        });

        this.container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            this.remove(toast);
        }, 5000);
    },

    remove(toast) {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }
};
