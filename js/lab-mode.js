/* 2026 Copyrighted by tienanh109 */
/**
 * Musicable Lab Mode (Experimental Audio Workstation)
 * Dedicated single-track experimental lab:
 * - Pitch Shifting & Tempo
 * - Studio Bass Boost (Lowshelf BiquadFilter)
 * - Preset Quick Mixing (Slowed, Sped Up, 8D, Reverb)
 * - Audio Joiner (Merge 2 tracks: Sequential & Crossfade)
 * - MD3 / ID3v2 Metadata Editor
 * - Lyrics & Production Scratchpad (Local-only storage with backup warning)
 * - Studio Quality Render & Export (MP3 320kbps / WAV 16-bit)
 */
(function () {
    class LabModeEngine {
        constructor() {
            this.audioCtx = null;
            this.mainTrack = null;     // { file, buffer, name, duration }
            this.secondTrack = null;   // { file, buffer, name, duration }
            
            this.previewSource = null;
            this.previewGain = null;
            this.previewBass = null;
            this.previewPanner = null;
            this.previewConvolver = null;
            this.previewDryGain = null;
            this.previewWetGain = null;

            this.isPlaying = false;
            this.playbackStartTime = 0;
            this.pausedAt = 0;
            this.animFrameId = null;

            this.settings = {
                semitones: 0,
                enableBassBoost: false,
                bassFreq: 100,
                bassGain: 10,
                enable8D: false,
                speed8D: 0.2,
                enableReverb: false,
                reverbMix: 45,
                reverbRoomSize: 60,
                gain: 100,
                joinMode: 'sequential', // 'sequential' or 'crossfade'
                enableJoin: false
            };

            this.STORAGE_LYRICS_KEY = 'musicable_lab_lyrics';
        }

        init() {
            this.bindDOMElements();
            this.bindEvents();
            this.loadStoredLyrics();
        }

        getAudioContext() {
            if (!this.audioCtx) {
                this.audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
            }
            if (this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }
            return this.audioCtx;
        }

        bindDOMElements() {
            // Drop Zone & Track Info
            this.labDropZone = document.getElementById('lab-drop-zone');
            this.labFileInput = document.getElementById('lab-file-input');
            this.labTrackCard = document.getElementById('lab-track-card');
            this.labTrackName = document.getElementById('lab-track-name');
            this.labTrackMeta = document.getElementById('lab-track-meta');
            this.labRemoveTrackBtn = document.getElementById('lab-remove-track-btn');

            // Player Controls
            this.labPlayBtn = document.getElementById('lab-play-btn');
            this.labSeekSlider = document.getElementById('lab-seek-slider');
            this.labCurrentTime = document.getElementById('lab-current-time');
            this.labTotalTime = document.getElementById('lab-total-time');
            this.labWaveCanvas = document.getElementById('lab-wave-canvas');

            // Effects Controls
            this.labPitchSlider = document.getElementById('lab-pitch-slider');
            this.labPitchVal = document.getElementById('lab-pitch-val');
            this.labPitchResetBtn = document.getElementById('lab-pitch-reset');

            this.labBassToggle = document.getElementById('lab-bass-toggle');
            this.labBassControls = document.getElementById('lab-bass-controls');
            this.labBassFreqSlider = document.getElementById('lab-bass-freq');
            this.labBassFreqVal = document.getElementById('lab-bass-freq-val');
            this.labBassGainSlider = document.getElementById('lab-bass-gain');
            this.labBassGainVal = document.getElementById('lab-bass-gain-val');

            this.lab8dToggle = document.getElementById('lab-8d-toggle');
            this.lab8dControls = document.getElementById('lab-8d-controls');
            this.lab8dSpeedSlider = document.getElementById('lab-8d-speed');
            this.lab8dSpeedVal = document.getElementById('lab-8d-speed-val');

            this.labReverbToggle = document.getElementById('lab-reverb-toggle');
            this.labReverbControls = document.getElementById('lab-reverb-controls');
            this.labReverbMixSlider = document.getElementById('lab-reverb-mix');
            this.labReverbMixVal = document.getElementById('lab-reverb-mix-val');

            // Presets
            this.presetButtons = document.querySelectorAll('.lab-preset-btn');

            // Audio Joiner
            this.labJoinEnableToggle = document.getElementById('lab-join-enable-toggle');
            this.labJoinSection = document.getElementById('lab-join-section');
            this.labJoinFileInput = document.getElementById('lab-join-file-input');
            this.labJoinSelectBtn = document.getElementById('lab-join-select-btn');
            this.labJoinTrackInfo = document.getElementById('lab-join-track-info');
            this.labJoinModeSelect = document.getElementById('lab-join-mode');

            // MD3 / ID3 Metadata Tags
            this.tagTitleInput = document.getElementById('lab-tag-title');
            this.tagArtistInput = document.getElementById('lab-tag-artist');
            this.tagAlbumInput = document.getElementById('lab-tag-album');
            this.tagYearInput = document.getElementById('lab-tag-year');
            this.tagGenreInput = document.getElementById('lab-tag-genre');

            // Lyrics Scratchpad
            this.labLyricsInput = document.getElementById('lab-lyrics-input');
            this.labLyricsSaveBtn = document.getElementById('lab-lyrics-save-btn');
            this.labLyricsSavedNotice = document.getElementById('lab-lyrics-saved-notice');

            // Export Studio
            this.labExportFormat = document.getElementById('lab-export-format');
            this.labExportFilename = document.getElementById('lab-export-filename');
            this.labRenderBtn = document.getElementById('lab-render-btn');
            this.labRenderStatus = document.getElementById('lab-render-status');
        }

        bindEvents() {
            // Drag and Drop for Main Track
            if (this.labDropZone && this.labFileInput) {
                this.labDropZone.addEventListener('click', () => this.labFileInput.click());
                this.labFileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        this.loadMainTrack(e.target.files[0]);
                    }
                });

                ['dragenter', 'dragover'].forEach(name => {
                    this.labDropZone.addEventListener(name, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.labDropZone.classList.add('drag-over');
                    });
                });

                ['dragleave', 'drop'].forEach(name => {
                    this.labDropZone.addEventListener(name, (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        this.labDropZone.classList.remove('drag-over');
                    });
                });

                this.labDropZone.addEventListener('drop', (e) => {
                    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                        this.loadMainTrack(e.dataTransfer.files[0]);
                    }
                });
            }

            if (this.labRemoveTrackBtn) {
                this.labRemoveTrackBtn.addEventListener('click', () => this.removeMainTrack());
            }

            // Player Play/Pause & Seek
            if (this.labPlayBtn) {
                this.labPlayBtn.addEventListener('click', () => this.togglePlay());
            }
            if (this.labSeekSlider) {
                this.labSeekSlider.addEventListener('input', (e) => {
                    if (!this.mainTrack || !this.mainTrack.buffer) return;
                    const dur = this.mainTrack.duration || 1;
                    const targetSec = (parseFloat(e.target.value) / 100) * dur;
                    this.seekTo(targetSec);
                });
            }

            // Pitch Shifter
            if (this.labPitchSlider) {
                this.labPitchSlider.addEventListener('input', (e) => {
                    const st = parseInt(e.target.value);
                    this.settings.semitones = st;
                    if (this.labPitchVal) {
                        this.labPitchVal.textContent = (st > 0 ? `+${st}` : `${st}`) + ' st';
                    }
                    this.applyLivePitch();
                });
            }
            if (this.labPitchResetBtn) {
                this.labPitchResetBtn.addEventListener('click', () => {
                    this.settings.semitones = 0;
                    if (this.labPitchSlider) this.labPitchSlider.value = 0;
                    if (this.labPitchVal) this.labPitchVal.textContent = '0 st';
                    this.applyLivePitch();
                });
            }

            // Bass Boost
            if (this.labBassToggle) {
                this.labBassToggle.addEventListener('change', () => {
                    this.settings.enableBassBoost = this.labBassToggle.checked;
                    if (this.labBassControls) {
                        this.labBassControls.classList.toggle('hidden', !this.settings.enableBassBoost);
                    }
                    this.applyLiveBass();
                });
            }
            if (this.labBassFreqSlider) {
                this.labBassFreqSlider.addEventListener('input', (e) => {
                    this.settings.bassFreq = parseFloat(e.target.value);
                    if (this.labBassFreqVal) this.labBassFreqVal.textContent = `${this.settings.bassFreq} Hz`;
                    this.applyLiveBass();
                });
            }
            if (this.labBassGainSlider) {
                this.labBassGainSlider.addEventListener('input', (e) => {
                    this.settings.bassGain = parseFloat(e.target.value);
                    if (this.labBassGainVal) this.labBassGainVal.textContent = `+${this.settings.bassGain} dB`;
                    this.applyLiveBass();
                });
            }

            // 8D Audio
            if (this.lab8dToggle) {
                this.lab8dToggle.addEventListener('change', () => {
                    this.settings.enable8D = this.lab8dToggle.checked;
                    if (this.lab8dControls) {
                        this.lab8dControls.classList.toggle('hidden', !this.settings.enable8D);
                    }
                    this.applyLive8D();
                });
            }
            if (this.lab8dSpeedSlider) {
                this.lab8dSpeedSlider.addEventListener('input', (e) => {
                    this.settings.speed8D = parseFloat(e.target.value);
                    if (this.lab8dSpeedVal) this.lab8dSpeedVal.textContent = `${this.settings.speed8D.toFixed(2)} Hz`;
                    this.applyLive8D();
                });
            }

            // Reverb
            if (this.labReverbToggle) {
                this.labReverbToggle.addEventListener('change', () => {
                    this.settings.enableReverb = this.labReverbToggle.checked;
                    if (this.labReverbControls) {
                        this.labReverbControls.classList.toggle('hidden', !this.settings.enableReverb);
                    }
                    this.applyLiveReverb();
                });
            }
            if (this.labReverbMixSlider) {
                this.labReverbMixSlider.addEventListener('input', (e) => {
                    this.settings.reverbMix = parseFloat(e.target.value);
                    if (this.labReverbMixVal) this.labReverbMixVal.textContent = `${this.settings.reverbMix}%`;
                    this.applyLiveReverb();
                });
            }

            // Presets quick select
            this.presetButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const preset = btn.getAttribute('data-preset');
                    this.applyPreset(preset);
                });
            });

            // Audio Joiner
            if (this.labJoinEnableToggle) {
                this.labJoinEnableToggle.addEventListener('change', () => {
                    this.settings.enableJoin = this.labJoinEnableToggle.checked;
                    if (this.labJoinSection) {
                        this.labJoinSection.classList.toggle('hidden', !this.settings.enableJoin);
                    }
                });
            }
            if (this.labJoinSelectBtn && this.labJoinFileInput) {
                this.labJoinSelectBtn.addEventListener('click', () => this.labJoinFileInput.click());
                this.labJoinFileInput.addEventListener('change', (e) => {
                    if (e.target.files && e.target.files[0]) {
                        this.loadSecondTrack(e.target.files[0]);
                    }
                });
            }
            if (this.labJoinModeSelect) {
                this.labJoinModeSelect.addEventListener('change', (e) => {
                    this.settings.joinMode = e.target.value;
                });
            }

            // Lyrics Scratchpad Save
            if (this.labLyricsSaveBtn) {
                this.labLyricsSaveBtn.addEventListener('click', () => this.saveLyrics());
            }

            // Full Render & Export
            if (this.labRenderBtn) {
                this.labRenderBtn.addEventListener('click', () => this.renderAndExport());
            }
        }

        async loadMainTrack(file) {
            try {
                this.stop();
                if (this.labDropZone) this.labDropZone.classList.add('loading');

                const arrayBuffer = await file.arrayBuffer();
                const ctx = this.getAudioContext();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

                this.mainTrack = {
                    file,
                    buffer: audioBuffer,
                    name: file.name,
                    duration: audioBuffer.duration
                };

                // Update UI
                if (this.labDropZone) this.labDropZone.classList.add('hidden');
                if (this.labTrackCard) this.labTrackCard.classList.remove('hidden');
                if (this.labTrackName) this.labTrackName.textContent = file.name;
                if (this.labTrackMeta) {
                    this.labTrackMeta.textContent = `${this.formatTime(audioBuffer.duration)} • ${(file.size / (1024 * 1024)).toFixed(2)} MB • ${audioBuffer.sampleRate} Hz`;
                }
                if (this.labTotalTime) this.labTotalTime.textContent = this.formatTime(audioBuffer.duration);
                if (this.labExportFilename) {
                    const baseName = file.name.replace(/\.[^/.]+$/, "");
                    this.labExportFilename.value = `${baseName}_LabRemix`;
                }

                // Auto-fill ID3 Title if blank
                if (this.tagTitleInput && !this.tagTitleInput.value) {
                    const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
                    this.tagTitleInput.value = cleanTitle;
                }

                // Render mini waveform representation
                this.drawWaveform(audioBuffer);
            } catch (err) {
                console.error('Failed to decode lab audio track:', err);
                alert('Could not decode audio file: ' + err.message);
            } finally {
                if (this.labDropZone) this.labDropZone.classList.remove('loading');
            }
        }

        removeMainTrack() {
            this.stop();
            this.mainTrack = null;
            if (this.labDropZone) this.labDropZone.classList.remove('hidden');
            if (this.labTrackCard) this.labTrackCard.classList.add('hidden');
            if (this.labFileInput) this.labFileInput.value = '';
            if (this.labCurrentTime) this.labCurrentTime.textContent = '0:00';
            if (this.labTotalTime) this.labTotalTime.textContent = '0:00';
            if (this.labSeekSlider) this.labSeekSlider.value = 0;
            this.clearWaveform();
        }

        async loadSecondTrack(file) {
            try {
                const arrayBuffer = await file.arrayBuffer();
                const ctx = this.getAudioContext();
                const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

                this.secondTrack = {
                    file,
                    buffer: audioBuffer,
                    name: file.name,
                    duration: audioBuffer.duration
                };

                if (this.labJoinTrackInfo) {
                    this.labJoinTrackInfo.innerHTML = `
                        <div class="join-track-badge">
                            <i data-lucide="check-circle" class="text-success"></i>
                            <strong>${file.name}</strong> (${this.formatTime(audioBuffer.duration)})
                        </div>
                    `;
                    lucide.createIcons();
                }
            } catch (err) {
                console.error('Failed to load second track:', err);
                alert('Could not load 2nd track: ' + err.message);
            }
        }

        togglePlay() {
            if (!this.mainTrack || !this.mainTrack.buffer) return;
            if (this.isPlaying) {
                this.pause();
            } else {
                this.play(this.pausedAt);
            }
        }

        play(startOffset = 0) {
            if (!this.mainTrack || !this.mainTrack.buffer) return;
            const ctx = this.getAudioContext();
            this.stopAudioNodes();

            // Source
            this.previewSource = ctx.createBufferSource();
            this.previewSource.buffer = this.mainTrack.buffer;

            // Pitch & Rate
            const playbackRate = Math.pow(2, this.settings.semitones / 12);
            this.previewSource.playbackRate.setValueAtTime(playbackRate, 0);

            // Volume Gain
            this.previewGain = ctx.createGain();
            this.previewGain.gain.setValueAtTime((this.settings.gain || 100) / 100, 0);

            // Bass Boost Filter
            this.previewBass = ctx.createBiquadFilter();
            this.previewBass.type = 'lowshelf';
            this.previewBass.frequency.setValueAtTime(this.settings.bassFreq || 100, 0);
            this.previewBass.gain.setValueAtTime(this.settings.enableBassBoost ? (this.settings.bassGain || 10) : 0, 0);

            // Connect Chain: Source -> Gain -> Bass
            this.previewSource.connect(this.previewGain);
            this.previewGain.connect(this.previewBass);

            let currentNode = this.previewBass;

            // Reverb Sub-branch
            if (this.settings.enableReverb && window.AudioEffectsEngine) {
                this.previewConvolver = ctx.createConvolver();
                this.previewConvolver.buffer = AudioEffectsEngine.createImpulseResponse(ctx, 'hall', this.settings.reverbRoomSize);
                
                this.previewDryGain = ctx.createGain();
                this.previewWetGain = ctx.createGain();
                const mix = (this.settings.reverbMix || 45) / 100;
                this.previewDryGain.gain.setValueAtTime(1 - mix * 0.4, 0);
                this.previewWetGain.gain.setValueAtTime(mix, 0);

                const postRevNode = ctx.createGain();
                currentNode.connect(this.previewDryGain);
                currentNode.connect(this.previewConvolver);
                this.previewConvolver.connect(this.previewWetGain);
                this.previewDryGain.connect(postRevNode);
                this.previewWetGain.connect(postRevNode);

                currentNode = postRevNode;
            }

            // 8D Panning
            if (this.settings.enable8D && typeof ctx.createStereoPanner === 'function') {
                this.previewPanner = ctx.createStereoPanner();
                currentNode.connect(this.previewPanner);
                currentNode = this.previewPanner;
                this.start8DPanningLive();
            }

            // Destination
            currentNode.connect(ctx.destination);

            const offset = Math.max(0, Math.min(this.mainTrack.duration, startOffset));
            this.previewSource.start(0, offset);
            this.playbackStartTime = ctx.currentTime - (offset / playbackRate);
            this.isPlaying = true;
            this.updatePlayBtn(true);

            this.previewSource.onended = () => {
                if (this.isPlaying) {
                    this.stop();
                }
            };

            this.startProgressTracker();
        }

        pause() {
            if (!this.isPlaying) return;
            const ctx = this.getAudioContext();
            const playbackRate = Math.pow(2, this.settings.semitones / 12);
            this.pausedAt = (ctx.currentTime - this.playbackStartTime) * playbackRate;
            this.stopAudioNodes();
            this.isPlaying = false;
            this.updatePlayBtn(false);
            cancelAnimationFrame(this.animFrameId);
        }

        stop() {
            this.stopAudioNodes();
            this.isPlaying = false;
            this.pausedAt = 0;
            this.updatePlayBtn(false);
            cancelAnimationFrame(this.animFrameId);
            if (this.labSeekSlider) this.labSeekSlider.value = 0;
            if (this.labCurrentTime) this.labCurrentTime.textContent = '0:00';
        }

        seekTo(targetSeconds) {
            const wasPlaying = this.isPlaying;
            this.pause();
            this.pausedAt = targetSeconds;
            if (this.labCurrentTime) this.labCurrentTime.textContent = this.formatTime(targetSeconds);
            if (this.labSeekSlider && this.mainTrack && this.mainTrack.duration) {
                this.labSeekSlider.value = (targetSeconds / this.mainTrack.duration) * 100;
            }
            if (wasPlaying) {
                this.play(targetSeconds);
            }
        }

        stopAudioNodes() {
            if (this.previewSource) {
                try {
                    this.previewSource.stop();
                    this.previewSource.disconnect();
                } catch (e) { }
                this.previewSource = null;
            }
        }

        applyLivePitch() {
            if (this.previewSource && this.isPlaying) {
                const playbackRate = Math.pow(2, this.settings.semitones / 12);
                this.previewSource.playbackRate.setValueAtTime(playbackRate, this.audioCtx.currentTime);
            }
        }

        applyLiveBass() {
            if (this.previewBass && this.audioCtx) {
                const gain = this.settings.enableBassBoost ? (this.settings.bassGain || 10) : 0;
                this.previewBass.frequency.setValueAtTime(this.settings.bassFreq || 100, this.audioCtx.currentTime);
                this.previewBass.gain.setValueAtTime(gain, this.audioCtx.currentTime);
            }
        }

        applyLive8D() {
            if (this.isPlaying) {
                // Reconnect live nodes
                this.pause();
                this.play(this.pausedAt);
            }
        }

        applyLiveReverb() {
            if (this.isPlaying) {
                this.pause();
                this.play(this.pausedAt);
            }
        }

        start8DPanningLive() {
            if (!this.previewPanner || !this.audioCtx) return;
            const startTime = this.audioCtx.currentTime;
            const speed = this.settings.speed8D || 0.2;
            const panner = this.previewPanner;

            const updatePan = () => {
                if (!this.isPlaying || !this.previewPanner) return;
                const elapsed = this.audioCtx.currentTime - startTime;
                const panVal = Math.sin(2 * Math.PI * speed * elapsed) * 0.95;
                try {
                    panner.pan.setValueCurveAtTime(panVal, this.audioCtx.currentTime);
                } catch (e) { }
                requestAnimationFrame(updatePan);
            };
            requestAnimationFrame(updatePan);
        }

        startProgressTracker() {
            const trackProgress = () => {
                if (!this.isPlaying || !this.mainTrack || !this.audioCtx) return;
                const playbackRate = Math.pow(2, this.settings.semitones / 12);
                const currentSec = (this.audioCtx.currentTime - this.playbackStartTime) * playbackRate;
                const dur = this.mainTrack.duration || 1;

                if (currentSec <= dur) {
                    if (this.labCurrentTime) this.labCurrentTime.textContent = this.formatTime(currentSec);
                    if (this.labSeekSlider) this.labSeekSlider.value = (currentSec / dur) * 100;
                    this.animFrameId = requestAnimationFrame(trackProgress);
                } else {
                    this.stop();
                }
            };
            this.animFrameId = requestAnimationFrame(trackProgress);
        }

        updatePlayBtn(playing) {
            if (!this.labPlayBtn) return;
            this.labPlayBtn.innerHTML = playing ? '<i data-lucide="pause"></i>' : '<i data-lucide="play"></i>';
            this.labPlayBtn.classList.toggle('is-playing', playing);
            lucide.createIcons();
        }

        applyPreset(presetKey) {
            switch (presetKey) {
                case 'slowed-reverb':
                    this.settings.semitones = -2;
                    this.settings.enableBassBoost = true;
                    this.settings.bassFreq = 100;
                    this.settings.bassGain = 6;
                    this.settings.enableReverb = true;
                    this.settings.reverbMix = 50;
                    this.settings.enable8D = false;
                    break;
                case 'sped-up':
                    this.settings.semitones = +2;
                    this.settings.enableBassBoost = false;
                    this.settings.enableReverb = false;
                    this.settings.enable8D = false;
                    break;
                case 'bass-heavy':
                    this.settings.semitones = 0;
                    this.settings.enableBassBoost = true;
                    this.settings.bassFreq = 90;
                    this.settings.bassGain = 14;
                    this.settings.enableReverb = false;
                    this.settings.enable8D = false;
                    break;
                case '8d-experience':
                    this.settings.semitones = 0;
                    this.settings.enableBassBoost = true;
                    this.settings.bassFreq = 100;
                    this.settings.bassGain = 6;
                    this.settings.enable8D = true;
                    this.settings.speed8D = 0.2;
                    this.settings.enableReverb = true;
                    this.settings.reverbMix = 35;
                    break;
                case 'clean':
                default:
                    this.settings.semitones = 0;
                    this.settings.enableBassBoost = false;
                    this.settings.bassGain = 10;
                    this.settings.enable8D = false;
                    this.settings.enableReverb = false;
                    break;
            }

            // Sync controls UI
            if (this.labPitchSlider) this.labPitchSlider.value = this.settings.semitones;
            if (this.labPitchVal) this.labPitchVal.textContent = (this.settings.semitones > 0 ? `+${this.settings.semitones}` : `${this.settings.semitones}`) + ' st';

            if (this.labBassToggle) this.labBassToggle.checked = this.settings.enableBassBoost;
            if (this.labBassControls) this.labBassControls.classList.toggle('hidden', !this.settings.enableBassBoost);
            if (this.labBassGainSlider) this.labBassGainSlider.value = this.settings.bassGain;
            if (this.labBassGainVal) this.labBassGainVal.textContent = `+${this.settings.bassGain} dB`;

            if (this.lab8dToggle) this.lab8dToggle.checked = this.settings.enable8D;
            if (this.lab8dControls) this.lab8dControls.classList.toggle('hidden', !this.settings.enable8D);

            if (this.labReverbToggle) this.labReverbToggle.checked = this.settings.enableReverb;
            if (this.labReverbControls) this.labReverbControls.classList.toggle('hidden', !this.settings.enableReverb);
            if (this.labReverbMixSlider) this.labReverbMixSlider.value = this.settings.reverbMix;
            if (this.labReverbMixVal) this.labReverbMixVal.textContent = `${this.settings.reverbMix}%`;

            if (this.isPlaying) {
                this.pause();
                this.play(this.pausedAt);
            }
        }

        loadStoredLyrics() {
            try {
                const saved = localStorage.getItem(this.STORAGE_LYRICS_KEY);
                if (saved && this.labLyricsInput) {
                    this.labLyricsInput.value = saved;
                }
            } catch (e) { }
        }

        saveLyrics() {
            if (!this.labLyricsInput) return;
            const content = this.labLyricsInput.value;
            try {
                localStorage.setItem(this.STORAGE_LYRICS_KEY, content);
                if (this.labLyricsSavedNotice) {
                    this.labLyricsSavedNotice.classList.remove('hidden');
                    setTimeout(() => {
                        this.labLyricsSavedNotice.classList.add('hidden');
                    }, 3000);
                }
            } catch (e) {
                alert('Could not save lyrics to localStorage: ' + e.message);
            }
        }

        drawWaveform(audioBuffer) {
            if (!this.labWaveCanvas) return;
            const canvas = this.labWaveCanvas;
            const ctx = canvas.getContext('2d');
            const width = canvas.width = canvas.offsetWidth * 2;
            const height = canvas.height = canvas.offsetHeight * 2;

            ctx.clearRect(0, 0, width, height);

            const data = audioBuffer.getChannelData(0);
            const step = Math.ceil(data.length / width);
            const amp = height / 2;

            ctx.fillStyle = '#6366f1';
            ctx.beginPath();

            for (let i = 0; i < width; i++) {
                let min = 1.0;
                let max = -1.0;
                for (let j = 0; j < step; j++) {
                    const datum = data[(i * step) + j];
                    if (datum < min) min = datum;
                    if (datum > max) max = datum;
                }
                ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
            }
        }

        clearWaveform() {
            if (!this.labWaveCanvas) return;
            const canvas = this.labWaveCanvas;
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }

        /**
         * Pure JS ID3v2.3 Tag Builder & Injector for MP3
         */
        injectID3v2Tags(mp3Uint8Array, tags) {
            const frames = [];

            const addTextFrame = (id, text) => {
                if (!text || text.trim() === '') return;
                const utf8Bytes = new TextEncoder().encode(text.trim());
                // Encoding byte 3 = UTF-8
                const framePayload = new Uint8Array(1 + utf8Bytes.length);
                framePayload[0] = 3;
                framePayload.set(utf8Bytes, 1);

                const frameHeader = new Uint8Array(10);
                // 4-char ID
                for (let i = 0; i < 4; i++) frameHeader[i] = id.charCodeAt(i);
                // 4-byte big-endian size
                const size = framePayload.length;
                frameHeader[4] = (size >> 24) & 0xff;
                frameHeader[5] = (size >> 16) & 0xff;
                frameHeader[6] = (size >> 8) & 0xff;
                frameHeader[7] = size & 0xff;
                // Flags = 0
                frameHeader[8] = 0;
                frameHeader[9] = 0;

                const fullFrame = new Uint8Array(10 + framePayload.length);
                fullFrame.set(frameHeader, 0);
                fullFrame.set(framePayload, 10);
                frames.push(fullFrame);
            };

            addTextFrame('TIT2', tags.title);
            addTextFrame('TPE1', tags.artist);
            addTextFrame('TALB', tags.album);
            addTextFrame('TYER', tags.year);
            addTextFrame('TCON', tags.genre);

            if (frames.length === 0) return mp3Uint8Array;

            let totalFramesSize = 0;
            frames.forEach(f => totalFramesSize += f.length);

            // Strip old ID3 tag if existing
            let mp3Data = mp3Uint8Array;
            if (mp3Data[0] === 0x49 && mp3Data[1] === 0x44 && mp3Data[2] === 0x33) {
                // Read synchsafe size from byte 6-9
                const oldTagSize = ((mp3Data[6] & 0x7f) << 21) |
                    ((mp3Data[7] & 0x7f) << 14) |
                    ((mp3Data[8] & 0x7f) << 7) |
                    (mp3Data[9] & 0x7f);
                mp3Data = mp3Data.subarray(10 + oldTagSize);
            }

            // ID3v2 10-byte header
            const header = new Uint8Array(10);
            header[0] = 0x49; // 'I'
            header[1] = 0x44; // 'D'
            header[2] = 0x33; // '3'
            header[3] = 0x03; // Version 2.3
            header[4] = 0x00; // Revision
            header[5] = 0x00; // Flags

            // Synchsafe integer size (7 bits per byte)
            header[6] = (totalFramesSize >> 21) & 0x7f;
            header[7] = (totalFramesSize >> 14) & 0x7f;
            header[8] = (totalFramesSize >> 7) & 0x7f;
            header[9] = totalFramesSize & 0x7f;

            // Combine Header + Frames + MP3 Audio
            const output = new Uint8Array(10 + totalFramesSize + mp3Data.length);
            output.set(header, 0);
            let offset = 10;
            frames.forEach(f => {
                output.set(f, offset);
                offset += f.length;
            });
            output.set(mp3Data, offset);

            return output;
        }

        async renderAndExport() {
            if (!this.mainTrack || !this.mainTrack.buffer) {
                alert('Please drop or load an audio track first.');
                return;
            }

            try {
                this.stop();
                this.labRenderBtn.disabled = true;
                this.labRenderBtn.innerHTML = '<div class="spinner"></div> Rendering Lab Track...';
                if (this.labRenderStatus) this.labRenderStatus.textContent = 'Processing audio engine & effects...';

                // Step 1: Handle Audio Joiner if active
                let sourceBuffer = this.mainTrack.buffer;
                if (this.settings.enableJoin && this.secondTrack && this.secondTrack.buffer) {
                    if (this.labRenderStatus) this.labRenderStatus.textContent = `Joining tracks (${this.settings.joinMode})...`;
                    sourceBuffer = await AudioEffectsEngine.mergeTracks(
                        this.mainTrack.buffer,
                        this.secondTrack.buffer,
                        this.settings.joinMode
                    );
                }

                // Step 2: Render Track with FX (Pitch, Bass, 8D, Reverb, Gain)
                if (this.labRenderStatus) this.labRenderStatus.textContent = 'Rendering studio effects & spatial audio...';
                const fxOptions = {
                    enableBassBoost: this.settings.enableBassBoost,
                    bassFreq: this.settings.bassFreq,
                    bassGain: this.settings.bassGain,
                    enable8D: this.settings.enable8D,
                    speed8D: this.settings.speed8D,
                    enableReverb: this.settings.enableReverb,
                    reverbMix: this.settings.reverbMix,
                    reverbRoomSize: this.settings.reverbRoomSize,
                    gain: this.settings.gain || 100,
                    trimStart: 0,
                    trimEnd: sourceBuffer.duration,
                    fadeIn: 0,
                    fadeOut: 0
                };

                const renderedBuffer = await AudioEffectsEngine.renderTrack(
                    sourceBuffer,
                    this.settings.semitones,
                    fxOptions
                );

                // Step 3: Encode to format
                const format = (this.labExportFormat && this.labExportFormat.value) || 'mp3-320kbps';
                const isMp3 = format === 'mp3-320kbps';
                const ext = isMp3 ? '.mp3' : '.wav';
                let finalBlob;

                if (this.labRenderStatus) this.labRenderStatus.textContent = `Encoding ${isMp3 ? 'MP3 320kbps' : 'WAV 16-bit'}...`;

                if (isMp3) {
                    const rawMp3Blob = await Mp3Encoder.encode(renderedBuffer, 320);
                    
                    // Step 4: Inject ID3/MD3 Metadata
                    const tags = {
                        title: this.tagTitleInput ? this.tagTitleInput.value : '',
                        artist: this.tagArtistInput ? this.tagArtistInput.value : '',
                        album: this.tagAlbumInput ? this.tagAlbumInput.value : '',
                        year: this.tagYearInput ? this.tagYearInput.value : '',
                        genre: this.tagGenreInput ? this.tagGenreInput.value : ''
                    };

                    const mp3ArrayBuffer = await rawMp3Blob.arrayBuffer();
                    const taggedBytes = this.injectID3v2Tags(new Uint8Array(mp3ArrayBuffer), tags);
                    finalBlob = new Blob([taggedBytes], { type: 'audio/mpeg' });
                } else {
                    finalBlob = WavEncoder.encode(renderedBuffer);
                }

                // Step 5: Trigger download
                const rawName = (this.labExportFilename && this.labExportFilename.value.trim()) || 'Musicable_Lab_Mix';
                const cleanName = rawName.replace(/\.[^/.]+$/, "");
                const filename = `${cleanName}${ext}`;

                const downloadUrl = URL.createObjectURL(finalBlob);
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(downloadUrl);

                if (this.labRenderStatus) this.labRenderStatus.textContent = `Successfully exported: ${filename}`;
            } catch (err) {
                console.error('Error rendering lab track:', err);
                alert('Render error: ' + err.message);
                if (this.labRenderStatus) this.labRenderStatus.textContent = 'Render failed: ' + err.message;
            } finally {
                this.labRenderBtn.disabled = false;
                this.labRenderBtn.innerHTML = '<i data-lucide="download"></i> <span data-i18n="renderAndSave">Render Full & Save</span>';
                lucide.createIcons();
            }
        }
    }

    window.LabModeEngine = new LabModeEngine();
})();
/* 2026 Copyrighted by tienanh109 */
