/**
 * Handles theme switching and persistence.
 */
export class ThemeManager {
    constructor() {
        this.themes = [
            { id: 'cosmos', name: 'Cosmos (Dark)', type: 'dark' },
            { id: 'nebula', name: 'Nebula (Glass)', type: 'dark' },
            { id: 'starlight', name: 'Starlight (Light)', type: 'light' }
        ];
        this.currentTheme = localStorage.getItem('theme') || 'cosmos';
        this.init();
    }

    init() {
        this.setTheme(this.currentTheme);
    }

    /**
     * Applies the selected theme to the document and saves preference.
     * @param {string} themeId 
     */
    setTheme(themeId) {
        if (!this.themes.find(t => t.id === themeId)) {
            console.warn(`Theme '${themeId}' not found, falling back to cosmos.`);
            themeId = 'cosmos';
        }

        document.documentElement.setAttribute('data-theme', themeId);
        localStorage.setItem('theme', themeId);
        this.currentTheme = themeId;

        console.log(`Theme set to: ${themeId}`);

        // Dispatch event for other components to react if needed
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeId } }));
    }

    getThemes() {
        return this.themes;
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Singleton instance
export const themeManager = new ThemeManager();
