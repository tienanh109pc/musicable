/* 2026 Copyrighted by tienanh109 */
/**
 * Audio Effects & Remix Engine using Web Audio API and OfflineAudioContext
 * Architecture: Source -> Gain (Volume + Fade In/Out) -> Reverb -> 8D Panning -> Destination
 */
(function () {
    class AudioEffectsEngine {
        constructor() {
            this.previewCtx = null;
        }

        /**
         * Synthesize clean stereo impulse response for algorithmic reverb
         */
        static createImpulseResponse(ctx, type = 'hall', roomSize = 60) {
            const sampleRate = ctx.sampleRate;
            let duration = 2.5;
            let decay = 2.0;

            switch (type) {
                case 'studio':
                    duration = 1.0;
                    decay = 3.5;
                    break;
                case 'cave':
                    duration = 4.0;
                    decay = 1.2;
                    break;
                case 'cathedral':
                    duration = 6.0;
                    decay = 0.8;
                    break;
                case 'hall':
                default:
                    duration = 2.5;
                    decay = 2.0;
                    break;
            }

            // Room size scaling (10% to 100%, 50% baseline)
            const sizePercent = Math.max(10, Math.min(100, parseFloat(roomSize) || 60));
            const sizeFactor = sizePercent / 50;
            duration = Math.max(0.3, duration * sizeFactor);
            decay = Math.max(0.3, decay / Math.sqrt(sizeFactor));

            const length = Math.floor(sampleRate * duration);
            const impulse = ctx.createBuffer(2, length, sampleRate);
            const left = impulse.getChannelData(0);
            const right = impulse.getChannelData(1);

            for (let i = 0; i < length; i++) {
                const n = i / length;
                const envelope = Math.exp(-n * decay * 4);
                left[i] = (Math.random() * 2 - 1) * envelope;
                right[i] = (Math.random() * 2 - 1) * envelope;
            }

            return impulse;
        }

        /**
         * Render an audio track with semitone pitch/speed and FX options via OfflineAudioContext
         * Order of FX: Source -> Volume/Fade -> Reverb -> 8D Panning -> Output
         */
        static async renderTrack(audioBuffer, semitones = 0, fx = {}) {
            const sampleRate = 44100;
            const playbackRate = Math.pow(2, semitones / 12);
            const originalDuration = audioBuffer.duration;

            // 1. Trimming calculations
            let trimStart = Math.max(0, parseFloat(fx.trimStart) || 0);
            let trimEnd = parseFloat(fx.trimEnd);
            if (isNaN(trimEnd) || trimEnd <= 0 || trimEnd > originalDuration) {
                trimEnd = originalDuration;
            }
            if (trimStart >= trimEnd) {
                trimStart = 0;
                trimEnd = originalDuration;
            }

            const sourcePlayDuration = trimEnd - trimStart;
            const playedDuration = sourcePlayDuration / playbackRate;

            // Tail time for reverb if active
            const roomSizeVal = parseFloat(fx.reverbRoomSize) || 60;
            const reverbTail = fx.enableReverb ? Math.max(1.2, (fx.reverbType === 'cathedral' ? 5.0 : 2.5) * (roomSizeVal / 50)) : 0.3;
            const totalDuration = playedDuration + reverbTail;
            const totalFrames = Math.max(1, Math.ceil(totalDuration * sampleRate));

            const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);

            // 2. Audio Source
            const source = offlineCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.playbackRate.value = playbackRate;

            // 3. Main Gain (Volume + Fade In / Fade Out)
            const mainGain = offlineCtx.createGain();
            const baseGain = (parseFloat(fx.gain) || 100) / 100;
            mainGain.gain.setValueAtTime(baseGain, 0);

            const fadeIn = Math.max(0, parseFloat(fx.fadeIn) || 0);
            const fadeOut = Math.max(0, parseFloat(fx.fadeOut) || 0);

            if (fadeIn > 0) {
                mainGain.gain.setValueAtTime(0.0001, 0);
                mainGain.gain.exponentialRampToValueAtTime(Math.max(0.001, baseGain), Math.min(fadeIn, playedDuration));
            }

            if (fadeOut > 0) {
                const fadeStart = Math.max(0, playedDuration - fadeOut);
                mainGain.gain.setValueAtTime(baseGain, fadeStart);
                mainGain.gain.exponentialRampToValueAtTime(0.0001, playedDuration);
            }

            // Connect Source to MainGain
            source.connect(mainGain);

            // 3.5 BASS BOOST LAYER
            let postBassNode = mainGain;
            if (fx.enableBassBoost) {
                const bassFilter = offlineCtx.createBiquadFilter();
                bassFilter.type = 'lowshelf';
                bassFilter.frequency.setValueAtTime(parseFloat(fx.bassFreq) || 100, 0);
                bassFilter.gain.setValueAtTime(parseFloat(fx.bassGain) || 8, 0);
                mainGain.connect(bassFilter);
                postBassNode = bassFilter;
            }

            // 4. REVERB LAYER (Runs BEFORE 8D Panning for authentic spatial envelopment)
            const postReverbNode = offlineCtx.createGain();

            if (fx.enableReverb) {
                const convolver = offlineCtx.createConvolver();
                convolver.buffer = this.createImpulseResponse(offlineCtx, fx.reverbType || 'hall', roomSizeVal);

                const dryGain = offlineCtx.createGain();
                const wetGain = offlineCtx.createGain();

                const mixPercent = Math.max(0, Math.min(200, parseFloat(fx.reverbMix) || 50));
                const wetVal = mixPercent / 100;
                const dryVal = Math.max(0, 1 - (mixPercent > 100 ? 0.35 : wetVal * 0.35));

                dryGain.gain.setValueAtTime(dryVal, 0);
                wetGain.gain.setValueAtTime(wetVal, 0);

                postBassNode.connect(dryGain);
                postBassNode.connect(convolver);
                convolver.connect(wetGain);

                dryGain.connect(postReverbNode);
                wetGain.connect(postReverbNode);
            } else {
                postBassNode.connect(postReverbNode);
            }

            // 5. 8D AUDIO PANNING LAYER (Takes input from reverberant field postReverbNode)
            let finalOutputNode = postReverbNode;

            if (fx.enable8D && typeof offlineCtx.createStereoPanner === 'function') {
                const panner = offlineCtx.createStereoPanner();
                const cycleSpeed = parseFloat(fx.speed8D) || 0.2; // Hz

                const panPoints = Math.min(4096, Math.max(256, Math.floor(totalDuration * 25)));
                const panCurve = new Float32Array(panPoints);
                for (let i = 0; i < panPoints; i++) {
                    const t = (i / panPoints) * totalDuration;
                    panCurve[i] = Math.sin(2 * Math.PI * cycleSpeed * t) * 0.95;
                }

                try {
                    panner.pan.setValueCurveAtTime(panCurve, 0, totalDuration);
                } catch (e) {
                    panner.pan.setValueAtTime(0, 0);
                }

                postReverbNode.connect(panner);
                finalOutputNode = panner;
            }

            // Connect to destination
            finalOutputNode.connect(offlineCtx.destination);

            // Start source with trim
            source.start(0, trimStart, sourcePlayDuration);

            // Render
            const renderedBuffer = await offlineCtx.startRendering();
            return renderedBuffer;
        }

        /**
         * Merge two audio buffers together (sequential or crossfade)
         */
        static async mergeTracks(buffer1, buffer2, mode = 'sequential') {
            const sampleRate = 44100;
            const dur1 = buffer1.duration;
            const dur2 = buffer2.duration;

            let totalDuration;
            let offset2;
            const isCrossfade = mode === 'crossfade';
            const crossTime = isCrossfade ? Math.min(2.5, Math.min(dur1, dur2) / 2) : 0;

            if (isCrossfade) {
                totalDuration = dur1 + dur2 - crossTime;
                offset2 = dur1 - crossTime;
            } else {
                totalDuration = dur1 + dur2;
                offset2 = dur1;
            }

            const totalFrames = Math.max(1, Math.ceil(totalDuration * sampleRate));
            const offlineCtx = new OfflineAudioContext(2, totalFrames, sampleRate);

            const src1 = offlineCtx.createBufferSource();
            src1.buffer = buffer1;
            const gain1 = offlineCtx.createGain();
            src1.connect(gain1);
            gain1.connect(offlineCtx.destination);

            const src2 = offlineCtx.createBufferSource();
            src2.buffer = buffer2;
            const gain2 = offlineCtx.createGain();
            src2.connect(gain2);
            gain2.connect(offlineCtx.destination);

            if (isCrossfade && crossTime > 0) {
                gain1.gain.setValueAtTime(1.0, dur1 - crossTime);
                gain1.gain.linearRampToValueAtTime(0.0001, dur1);

                gain2.gain.setValueAtTime(0.0001, offset2);
                gain2.gain.linearRampToValueAtTime(1.0, offset2 + crossTime);
            }

            src1.start(0);
            src2.start(offset2);

            return await offlineCtx.startRendering();
        }
    }

    window.AudioEffectsEngine = AudioEffectsEngine;
})();
/* 2026 Copyrighted by tienanh109 */
