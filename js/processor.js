/* 2026 Copyrighted by tienanh109 */
/**
 * File processing logic with Preset & Watermark integration
 */
class FileProcessor {
    constructor() {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
    }

    async processFile(file, onProgress) {
        const type = file.type;
        const name = file.name.toLowerCase();

        if (type.startsWith('audio/') || name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg') || name.endsWith('.flac') || name.endsWith('.m4a')) {
            return await this.processAudio(file, onProgress);
        } else if (type.startsWith('image/') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.webp')) {
            return await this.processImage(file, onProgress);
        } else {
            throw new Error('Unsupported file type');
        }
    }

    async processAudio(file, onProgress) {
        const config = SettingsManager.getActiveConfig();
        const t = (k) => window.I18n ? window.I18n.t(k) : k;

        onProgress(15, t('readingData'));

        const arrayBuffer = await file.arrayBuffer();
        onProgress(35, t('decoding'));

        try {
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

            let blob;
            let extension;

            if (config.audioFormat === 'mp3-320kbps') {
                onProgress(70, t('encodingMp3'));
                blob = await Mp3Encoder.encode(audioBuffer, 320);
                extension = '.mp3';
            } else {
                onProgress(70, t('encodingWav'));
                blob = WavEncoder.encode(audioBuffer);
                extension = '.wav';
            }

            onProgress(100, t('completed'));

            return {
                blob: blob,
                newName: file.name.replace(/\.[^/.]+$/, "") + extension,
                processed: true
            };
        } catch (e) {
            console.error(e);
            throw new Error('Could not decode audio');
        }
    }

    async processImage(file, onProgress) {
        const config = SettingsManager.getActiveConfig();
        const t = (k) => window.I18n ? window.I18n.t(k) : k;

        onProgress(20, t('readingData'));
        const img = await this.loadImage(file);

        onProgress(50, t('resizing'));

        const method = config.imageSizeMethod || 'stretch';
        const srcW = img.naturalWidth || img.width;
        const srcH = img.naturalHeight || img.height;

        let targetW = config.width || 3000;
        let targetH = config.height || 3000;

        if (method === 'none') {
            targetW = srcW;
            targetH = srcH;
        }

        const isJpg = config.imageFormat === 'jpg';
        const mimeType = isJpg ? 'image/jpeg' : 'image/png';
        const extension = isJpg ? '.jpg' : '.png';

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // White background for JPG to avoid black opacity
        if (isJpg) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetW, targetH);
        }

        if (method === 'none') {
            // Option 3: Do nothing (keep original size)
            ctx.drawImage(img, 0, 0, targetW, targetH);
        } else if (method === 'crop') {
            // Option 1: Crop center to match target aspect ratio, then scale to target dimensions
            const srcAspect = srcW / srcH;
            const targetAspect = targetW / targetH;
            let sx = 0, sy = 0, sWidth = srcW, sHeight = srcH;

            if (srcAspect > targetAspect) {
                // Source is wider than target aspect ratio -> crop sides
                sWidth = srcH * targetAspect;
                sHeight = srcH;
                sx = (srcW - sWidth) / 2;
                sy = 0;
            } else {
                // Source is taller than target aspect ratio -> crop top/bottom
                sWidth = srcW;
                sHeight = srcW / targetAspect;
                sx = 0;
                sy = (srcH - sHeight) / 2;
            }

            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);
        } else {
            // Option 2: Stretch to fit (Default)
            ctx.drawImage(img, 0, 0, targetW, targetH);
        }

        // Apply watermark logo if enabled
        if (config.logoSettings && config.logoSettings.enabled && window.WatermarkEngine) {
            window.WatermarkEngine.applyToCanvas(canvas, config.logoSettings);
        }

        onProgress(85, t('processing'));

        const blob = await new Promise(resolve => canvas.toBlob(resolve, mimeType, 0.95));
        onProgress(100, t('completed'));

        return {
            blob: blob,
            newName: file.name.replace(/\.[^/.]+$/, "") + extension,
            processed: true
        };
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const url = URL.createObjectURL(file);
            const img = new Image();
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = reject;
            img.src = url;
        });
    }
}

window.FileProcessor = FileProcessor;
/* 2026 Copyrighted by tienanh109 */
