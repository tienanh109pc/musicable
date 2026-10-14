/* 2026 Copyrighted by tienanh109 */
/**
 * Settings Manager: handles presets, logo configuration, and JSON backup/restore
 */
(function () {
    const DEFAULT_SETTINGS = {
        activePreset: 'default', // 'default' or 'custom'
        presets: {
            default: {
                name: 'Standard Studio',
                audioFormat: 'wav-16bit',
                imageFormat: 'png',
                imageSize: '3000x3000',
                imageSizeMethod: 'stretch',
                customWidth: 3000,
                customHeight: 3000
            },
            custom: {
                name: 'Custom Studio',
                audioFormat: 'mp3-320kbps',
                imageFormat: 'jpg',
                imageSize: '2048x2048',
                imageSizeMethod: 'stretch',
                customWidth: 2048,
                customHeight: 2048
            }
        },
        zipFilename: 'Musicable',
        language: 'en',
        logoSettings: {
            enabled: false,
            logoDataUrl: null,
            sizePercent: 20,
            position: 'bottom-right',
            offsetX: 4,
            offsetY: 4,
            freeX: 75,
            freeY: 75,
            opacity: 0.9,
            invertColor: false,
            allowOverflow: false
        },
        betaFeatures: {
            trimmerEnabled: false,
            labModeEnabled: false
        }
    };

    class SettingsService {
        constructor() {
            this.STORAGE_KEY = 'musicable_user_settings_v2';
            this.settings = this.loadSettings();
        }

        loadSettings() {
            try {
                const raw = localStorage.getItem(this.STORAGE_KEY);
                if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
                const parsed = JSON.parse(raw);
                return {
                    ...DEFAULT_SETTINGS,
                    ...parsed,
                    presets: {
                        ...DEFAULT_SETTINGS.presets,
                        ...(parsed.presets || {})
                    },
                    logoSettings: {
                        ...DEFAULT_SETTINGS.logoSettings,
                        ...(parsed.logoSettings || {})
                    },
                    betaFeatures: {
                        ...DEFAULT_SETTINGS.betaFeatures,
                        ...(parsed.betaFeatures || {})
                    }
                };
            } catch (e) {
                console.error('Failed to load settings:', e);
                return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            }
        }

        saveSettings(newSettings = null) {
            if (newSettings) {
                this.settings = { ...this.settings, ...newSettings };
            }
            try {
                localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
            } catch (e) {
                console.error('Failed to save settings:', e);
            }
        }

        getActiveConfig() {
            const isCustom = this.settings.activePreset === 'custom';
            const preset = isCustom ? this.settings.presets.custom : this.settings.presets.default;
            return {
                isCustom,
                audioFormat: preset.audioFormat,
                imageFormat: preset.imageFormat,
                imageSize: preset.imageSize,
                imageSizeMethod: preset.imageSizeMethod || 'stretch',
                width: preset.imageSize === 'custom' ? (preset.customWidth || 3000) : parseInt(preset.imageSize.split('x')[0]),
                height: preset.imageSize === 'custom' ? (preset.customHeight || 3000) : parseInt(preset.imageSize.split('x')[1]),
                logoSettings: this.settings.logoSettings,
                zipFilename: this.settings.zipFilename || 'Musicable'
            };
        }

        exportJSON() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.settings, null, 2));
            const a = document.createElement('a');
            a.setAttribute("href", dataStr);
            a.setAttribute("download", `musicable-settings-${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(a);
            a.click();
            a.remove();
        }

        importJSON(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const parsed = JSON.parse(e.target.result);
                        this.settings = {
                            ...DEFAULT_SETTINGS,
                            ...parsed,
                            presets: {
                                ...DEFAULT_SETTINGS.presets,
                                ...(parsed.presets || {})
                            },
                            logoSettings: {
                                ...DEFAULT_SETTINGS.logoSettings,
                                ...(parsed.logoSettings || {})
                            },
                            betaFeatures: {
                                ...DEFAULT_SETTINGS.betaFeatures,
                                ...(parsed.betaFeatures || {})
                            }
                        };
                        this.saveSettings();
                        resolve(this.settings);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }

        resetAll() {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.removeItem('musicable_lang');
            this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
    }

    window.SettingsManager = new SettingsService();
})();
/* 2026 Copyrighted by tienanh109 */
