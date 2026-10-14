/* 2026 Copyrighted by tienanh109 */
/**
 * MP3 Encoder Wrapper using lamejs
 */
class Mp3Encoder {
    static async encode(audioBuffer, kbps = 320) {
        if (typeof lamejs === 'undefined') {
            console.warn('lamejs not loaded, falling back to WAV encoder');
            return WavEncoder.encode(audioBuffer);
        }

        const channels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, kbps);
        const mp3Data = [];

        // Prepare Int16 samples
        const sampleCount = audioBuffer.length;
        const leftFloat = audioBuffer.getChannelData(0);
        const left = new Int16Array(sampleCount);

        for (let i = 0; i < sampleCount; i++) {
            const s = Math.max(-1, Math.min(1, leftFloat[i]));
            left[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        let right = null;
        if (channels >= 2) {
            const rightFloat = audioBuffer.getChannelData(1);
            right = new Int16Array(sampleCount);
            for (let i = 0; i < sampleCount; i++) {
                const s = Math.max(-1, Math.min(1, rightFloat[i]));
                right[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
        }

        const sampleBlockSize = 1152;
        for (let i = 0; i < sampleCount; i += sampleBlockSize) {
            const leftChunk = left.subarray(i, i + sampleBlockSize);
            let mp3buf;
            if (channels === 1) {
                mp3buf = mp3encoder.encodeBuffer(leftChunk);
            } else {
                const rightChunk = right.subarray(i, i + sampleBlockSize);
                mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
            }
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }
        }

        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
        }

        return new Blob(mp3Data, { type: 'audio/mp3' });
    }
}

window.Mp3Encoder = Mp3Encoder;
/* 2026 Copyrighted by tienanh109 */
