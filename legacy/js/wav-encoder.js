/**
 * Simple WAV Encoder for 16-bit PCM 44.1kHz
 */
class WavEncoder {
    static encode(audioBuffer) {
        const numChannels = audioBuffer.numberOfChannels;
        const sampleRate = audioBuffer.sampleRate;
        const format = 1; // PCM
        const bitDepth = 16;
        
        const bytesPerSample = bitDepth / 8;
        const blockAlign = numChannels * bytesPerSample;
        
        const samples = audioBuffer.getChannelData(0);
        const dataLength = samples.length * blockAlign;
        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);
        
        /* RIFF identifier */
        this.writeString(view, 0, 'RIFF');
        /* RIFF chunk length */
        view.setUint32(4, 36 + dataLength, true);
        /* RIFF type */
        this.writeString(view, 8, 'WAVE');
        /* format chunk identifier */
        this.writeString(view, 12, 'fmt ');
        /* format chunk length */
        view.setUint32(16, 16, true);
        /* sample format (raw) */
        view.setUint16(20, format, true);
        /* channel count */
        view.setUint16(22, numChannels, true);
        /* sample rate */
        view.setUint32(24, sampleRate, true);
        /* byte rate (sample rate * block align) */
        view.setUint32(28, sampleRate * blockAlign, true);
        /* block align (channel count * bytes per sample) */
        view.setUint16(32, blockAlign, true);
        /* bits per sample */
        view.setUint16(34, bitDepth, true);
        /* data chunk identifier */
        this.writeString(view, 36, 'data');
        /* data chunk length */
        view.setUint32(40, dataLength, true);
        
        // Write samples
        const offset = 44;
        for (let i = 0; i < samples.length; i++) {
            for (let channel = 0; channel < numChannels; channel++) {
                const s = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
                const val = s < 0 ? s * 0x8000 : s * 0x7FFF;
                view.setInt16(offset + (i * blockAlign) + (channel * bytesPerSample), val, true);
            }
        }
        
        return new Blob([buffer], { type: 'audio/wav' });
    }
    
    static writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
}

window.WavEncoder = WavEncoder;
