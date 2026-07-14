export class SettingsController {
    constructor() {
        this.graphicsQuality = 'medium';
        this.sensitivity = 1.5;
        this.loadSettings();
        this.setupBindings();
    }

    loadSettings() {
        const saved = localStorage.getItem('kr_bedwars_settings');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.graphicsQuality = parsed.graphicsQuality || 'medium';
                this.sensitivity = parsed.sensitivity || 1.5;
            } catch (e) {
                console.error("Corruption parsing user preferences.");
            }
        }
        this.apply();
    }

    setupBindings() {
        const qualitySelect = document.getElementById('setting-graphics');
        const sensSlider = document.getElementById('setting-sensitivity');

        qualitySelect.value = this.graphicsQuality;
        sensSlider.value = this.sensitivity;

        qualitySelect.addEventListener('change', (e) => {
            this.graphicsQuality = e.target.value;
            this.save();
        });

        sensSlider.addEventListener('input', (e) => {
            this.sensitivity = parseFloat(e.target.value);
            this.save();
        });
    }

    save() {
        const settings = { graphicsQuality: this.graphicsQuality, sensitivity: this.sensitivity };
        localStorage.setItem('kr_bedwars_settings', JSON.stringify(settings));
    }

    apply() {
        // Configure WebGL renderer parameters based on graphics options
        const qualSelect = document.getElementById('setting-graphics');
        if (qualSelect) qualSelect.value = this.graphicsQuality;
    }
}
