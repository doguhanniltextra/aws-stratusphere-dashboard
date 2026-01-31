
export const detailSidebar = {
    elements: {
        sidebar: null,
        content: null,
        closeBtn: null,
        overlay: null,
    },

    init() {
        this.elements.sidebar = document.getElementById('detailSidebar');
        this.elements.content = document.getElementById('detailContent');
        this.elements.closeBtn = document.getElementById('closeDetailSidebar');

        if (!this.elements.sidebar || !this.elements.content || !this.elements.closeBtn) {
            console.error('Detail Sidebar elements not found');
            return;
        }

        // Close button listener
        this.elements.closeBtn.addEventListener('click', () => {
            this.close();
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

        // Format JSON
        const jsonString = JSON.stringify(data, null, 2);

        // Basic syntax highlighting (optional, helps readability)
        // For now, just setting textContent is safe
        this.elements.content.textContent = jsonString;

        this.elements.sidebar.classList.add('open');
    },

    close() {
        if (this.elements.sidebar) {
            this.elements.sidebar.classList.remove('open');
        }
    }
};
