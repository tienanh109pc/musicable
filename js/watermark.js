/* 2026 Copyrighted by tienanh109 */
/**
 * Watermark / Logo Engine & Canvas Overlay
 * Supports free positioning (drag & drop), preset corners, opacity and scaling
 */
(function () {
    class WatermarkService {
        constructor() {
            this.logoImage = null;
            this.isLoaded = false;
            this.init();
        }

        async init() {
            if (!window.SettingsManager) return;
            const config = SettingsManager.getActiveConfig().logoSettings;
            if (config && config.logoDataUrl) {
                try {
                    this.logoImage = await this.loadImageFromSrc(config.logoDataUrl);
                    this.isLoaded = true;
                } catch (e) {
                    console.warn('Could not load saved logo:', e);
                }
            }
        }

        loadImageFromSrc(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        }

        async setLogoFile(file) {
            const reader = new FileReader();
            return new Promise((resolve, reject) => {
                reader.onload = async (e) => {
                    const dataUrl = e.target.result;
                    try {
                        this.logoImage = await this.loadImageFromSrc(dataUrl);
                        this.isLoaded = true;
                        // Update SettingsManager
                        const current = SettingsManager.loadSettings();
                        current.logoSettings.logoDataUrl = dataUrl;
                        current.logoSettings.enabled = true;
                        SettingsManager.saveSettings(current);
                        resolve(dataUrl);
                    } catch (err) {
                        reject(err);
                    }
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        /**
         * Draw the logo watermark on an existing canvas
         * Returns { x, y, width, height } bounding box for hit testing & dragging
         */
        applyToCanvas(canvas, overrideConfig = null, drawSelectionBox = false) {
            const config = overrideConfig || (window.SettingsManager ? SettingsManager.getActiveConfig().logoSettings : null);
            if (!config || !config.enabled || !this.logoImage) {
                return null;
            }

            const ctx = canvas.getContext('2d');
            const canvasW = canvas.width;
            const canvasH = canvas.height;

            const sizePercent = (config.sizePercent || 20) / 100;
            const logoTargetW = canvasW * sizePercent;
            const aspectRatio = this.logoImage.width / (this.logoImage.height || 1);
            const logoTargetH = logoTargetW / aspectRatio;

            const marginX = canvasW * ((config.offsetX || 4) / 100);
            const marginY = canvasH * ((config.offsetY || 4) / 100);

            let x = 0;
            let y = 0;

            switch (config.position) {
                case 'top-left':
                    x = marginX;
                    y = marginY;
                    break;
                case 'top-right':
                    x = canvasW - logoTargetW - marginX;
                    y = marginY;
                    break;
                case 'bottom-left':
                    x = marginX;
                    y = canvasH - logoTargetH - marginY;
                    break;
                case 'center':
                    x = (canvasW - logoTargetW) / 2;
                    y = (canvasH - logoTargetH) / 2;
                    break;
                case 'custom':
                    x = canvasW * ((config.freeX !== undefined ? config.freeX : 75) / 100);
                    y = canvasH * ((config.freeY !== undefined ? config.freeY : 75) / 100);
                    break;
                case 'bottom-right':
                default:
                    x = canvasW - logoTargetW - marginX;
                    y = canvasH - logoTargetH - marginY;
                    break;
            }

            // Keep within bounds or allow edge overflow
            if (!config.allowOverflow) {
                x = Math.max(0, Math.min(canvasW - logoTargetW, x));
                y = Math.max(0, Math.min(canvasH - logoTargetH, y));
            } else {
                // When overflow is allowed, logo can be positioned partially or mostly outside
                x = Math.max(-logoTargetW * 0.8, Math.min(canvasW - logoTargetW * 0.2, x));
                y = Math.max(-logoTargetH * 0.8, Math.min(canvasH - logoTargetH * 0.2, y));
            }

            ctx.save();
            ctx.globalAlpha = Math.max(0.05, Math.min(1.0, config.opacity !== undefined ? config.opacity : 0.9));
            if (config.invertColor) {
                ctx.filter = 'invert(100%)';
            }
            ctx.drawImage(this.logoImage, x, y, logoTargetW, logoTargetH);
            ctx.restore();

            // Optional interactive border
            if (drawSelectionBox) {
                ctx.save();
                ctx.strokeStyle = '#6366f1';
                ctx.lineWidth = 2;
                ctx.setLineDash([4, 4]);
                ctx.strokeRect(x, y, logoTargetW, logoTargetH);

                // Small corner handle
                ctx.fillStyle = '#6366f1';
                ctx.fillRect(x + logoTargetW - 6, y + logoTargetH - 6, 6, 6);
                ctx.restore();
            }

            return { x, y, width: logoTargetW, height: logoTargetH };
        }
    }

    window.WatermarkEngine = new WatermarkService();
})();
/* 2026 Copyrighted by tienanh109 */
