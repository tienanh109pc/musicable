/**
 * File processing logic
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
        onProgress(10, 'Đang đọc dữ liệu...');

        // Fast path check for WAV 44.1/16 (optional but good for performance)
        // For now, we decode to ensure quality and standard 44.1 resample

        const arrayBuffer = await file.arrayBuffer();
        onProgress(30, 'Đang giải mã...');

        try {
            const audioBuffer = await this.audioCtx.decodeAudioData(arrayBuffer);

            onProgress(60, 'Đang chuẩn hóa (44.1kHz 16-bit)...');

            // Check if already 44.1kHz 16-bit (WAV)
            // Note: decodeAudioData resamples to audioCtx.sampleRate (44100) automatically
            // So we just need to re-encode to 16-bit WAV

            const wavBlob = WavEncoder.encode(audioBuffer);
            onProgress(100, 'Hoàn thành');

            return {
                blob: wavBlob,
                newName: file.name.replace(/\.[^/.]+$/, "") + ".wav",
                processed: true
            };
        } catch (e) {
            console.error(e);
            throw new Error('Không thể giải mã audio');
        }
    }

    async processImage(file, onProgress) {
        onProgress(20, 'Đang tải ảnh...');
        const img = await this.loadImage(file);

        onProgress(50, 'Đang kiểm tra kích thước...');

        const isStandard = img.width === 3000 && img.height === 3000 && file.type === 'image/png';

        if (isStandard) {
            onProgress(100, 'Đã đạt chuẩn');
            return {
                blob: file,
                newName: file.name,
                processed: false
            };
        }

        onProgress(70, 'Đang resize (3000x3000px PNG)...');
        const canvas = document.createElement('canvas');
        canvas.width = 3000;
        canvas.height = 3000;
        const ctx = canvas.getContext('2d');

        // Use better quality for resizing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Fill white background for transparent images if needed or just draw
        // USER said "PNG" which supports transparency
        ctx.drawImage(img, 0, 0, 3000, 3000);

        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        onProgress(100, 'Hoàn thành');

        return {
            blob: blob,
            newName: file.name.replace(/\.[^/.]+$/, "") + ".png",
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
