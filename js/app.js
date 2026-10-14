/* 2026 Copyrighted by tienanh109 */
/**
 * Main Application Logic for Musicable Beta 2
 */
document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const processSection = document.getElementById('process-section');
    const fileList = document.getElementById('file-list');
    const fileCountSpan = document.getElementById('file-count');
    const processBtn = document.getElementById('process-btn');
    const clearBtn = document.getElementById('clear-btn');
    const resultActions = document.getElementById('result-actions');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const zipNameInput = document.getElementById('zip-name-input');
    const fileItemTemplate = document.getElementById('file-item-template');
    const openSettingsBtn = document.getElementById('open-settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeSettingsModal = document.getElementById('close-settings-modal');
    const badgeAudio = document.getElementById('badge-audio');
    const badgeImage = document.getElementById('badge-image');

    // Mini Music Player Elements
    const miniPlayerPopup = document.getElementById('mini-music-player');
    const miniVinylDisc = document.getElementById('mini-vinyl-disc');
    const miniPlayerTitle = document.getElementById('mini-player-title');
    const miniPlayerStatus = document.getElementById('mini-player-status');
    const miniPlayerCloseBtn = document.getElementById('mini-player-close');
    const miniPlayerSeekSlider = document.getElementById('mini-player-slider');
    const miniPlayerCurrentTime = document.getElementById('mini-player-current-time');
    const miniPlayerTotalTime = document.getElementById('mini-player-total-time');
    const miniPlayerSkipBack = document.getElementById('mini-player-skip-back');
    const miniPlayerToggleBtn = document.getElementById('mini-player-toggle');
    const miniPlayerSkipForward = document.getElementById('mini-player-skip-forward');
    const miniPlayerAudio = document.getElementById('mini-player-audio');
    let activePlayingItem = null;
    let activeAudioUrl = null;
    let isDraggingMiniSlider = false;

    // Remix Modal Elements
    const remixModal = document.getElementById('remix-modal');
    const closeRemixModal = document.getElementById('close-remix-modal');
    const cancelRemixBtn = document.getElementById('cancel-remix-btn');
    const generateRemixBtn = document.getElementById('generate-remix-btn');
    const deleteOriginalRemixContainer = document.getElementById('remix-delete-original-container');
    const deleteOriginalRemixCheckbox = document.getElementById('delete-original-after-remix');

    if (deleteOriginalRemixCheckbox) {
        deleteOriginalRemixCheckbox.checked = localStorage.getItem('musicable_delete_original_after_remix') === 'true';
        deleteOriginalRemixCheckbox.addEventListener('change', () => {
            localStorage.setItem('musicable_delete_original_after_remix', deleteOriginalRemixCheckbox.checked);
        });
    }

    const remixTrackTitle = document.getElementById('remix-track-title');
    const modeDirectTrackRadio = document.getElementById('mode-direct-track');
    const modeRemixVariationsRadio = document.getElementById('mode-remix-variations');
    const modeDirectCard = document.getElementById('mode-direct-edit-card');
    const modeVariationsCard = document.getElementById('mode-variations-card');
    const remixVariationsSection = document.getElementById('remix-variations-section');
    const remixVariationsLockedNotice = document.getElementById('remix-variations-locked-notice');
    const previewPlayBtn = document.getElementById('preview-play-btn');
    const previewBtnText = document.getElementById('preview-btn-text');
    const previewStatus = document.getElementById('preview-status');
    const previewSeekSlider = document.getElementById('preview-seek-slider');
    const previewCurrentTime = document.getElementById('preview-current-time');
    const previewTotalTime = document.getElementById('preview-total-time');
    const previewAudioElement = document.getElementById('preview-audio-element');
    let previewBlobUrl = null;
    let lastRenderedPreviewSignature = null;
    const fxEnable8d = document.getElementById('fx-enable-8d');
    const fx8dSpeedContainer = document.getElementById('fx-8d-speed-container');
    const fx8dSpeed = document.getElementById('fx-8d-speed');
    const fx8dSpeedVal = document.getElementById('fx-8d-speed-val');
    const fxEnableReverb = document.getElementById('fx-enable-reverb');
    const reverbControls = document.getElementById('reverb-controls');
    const fxReverbMix = document.getElementById('fx-reverb-mix');
    const fxReverbMixVal = document.getElementById('fx-reverb-mix-val');
    const fxReverbRoomSize = document.getElementById('fx-reverb-room-size');
    const fxReverbSizeVal = document.getElementById('fx-reverb-size-val');
    const unlockReverbBtn = document.getElementById('unlock-reverb-btn');
    const fxGain = document.getElementById('fx-gain');
    const fxGainVal = document.getElementById('fx-gain-val');

    // Visual Trimmer Elements
    const fxTrimStart = document.getElementById('fx-trim-start');
    const fxTrimEnd = document.getElementById('fx-trim-end');
    const trimTimelineTrack = document.getElementById('trim-timeline-track');
    const trimDimLeft = document.getElementById('trim-dim-left');
    const trimDimRight = document.getElementById('trim-dim-right');
    const trimActiveRegion = document.getElementById('trim-active-region');
    const trimPlayhead = document.getElementById('trim-playhead');
    const trimHandleStart = document.getElementById('trim-handle-start');
    const trimHandleEnd = document.getElementById('trim-handle-end');
    const trimStartTag = document.getElementById('trim-start-tag');
    const trimEndTag = document.getElementById('trim-end-tag');
    const trimRangeStat = document.getElementById('trim-range-stat');
    const trimDurationStat = document.getElementById('trim-duration-stat');
    const btnSetStartNow = document.getElementById('btn-set-start-now');
    const btnSetEndNow = document.getElementById('btn-set-end-now');
    const btnPreviewSelection = document.getElementById('btn-preview-selection');
    const btnResetTrim = document.getElementById('btn-reset-trim');
    let rawAudioUrl = null;
    let currentTrackDuration = 0;
    let isDraggingTrimHandle = null;
    let isPreviewingTrimOnly = false;
    let lastDragEndTime = 0;

    // Watermark Elements
    const logoEnableToggle = document.getElementById('logo-enable-toggle');
    const logoFileInput = document.getElementById('logo-file-input');
    const logoSizeSlider = document.getElementById('logo-size-slider');
    const logoSizeVal = document.getElementById('logo-size-val');
    const logoPositionSelect = document.getElementById('logo-position-select');
    const freePosControls = document.getElementById('free-pos-controls');
    const logoFreeX = document.getElementById('logo-free-x');
    const logoFreeXVal = document.getElementById('logo-free-x-val');
    const logoFreeY = document.getElementById('logo-free-y');
    const logoFreeYVal = document.getElementById('logo-free-y-val');
    const logoOpacitySlider = document.getElementById('logo-opacity-slider');
    const logoOpacityVal = document.getElementById('logo-opacity-val');
    const watermarkPreviewCanvas = document.getElementById('watermark-preview-canvas');
    const watermarkArtSelect = document.getElementById('watermark-art-select');
    const previewArtUpload = document.getElementById('preview-art-upload');
    const activeArtLabel = document.getElementById('active-art-label');
    const logoInvertColor = document.getElementById('logo-invert-color');
    const logoAllowOverflow = document.getElementById('logo-allow-overflow');
    const saveWatermarkBtn = document.getElementById('save-watermark-btn');
    let activePreviewArtworkImage = null;
    let isDraggingLogo = false;
    let dragStartOffset = { x: 0, y: 0 };
    let currentLogoBbox = null;

    // Settings Modal Elements
    const presetRadioDefault = document.getElementById('preset-radio-default');
    const presetRadioCustom = document.getElementById('preset-radio-custom');
    const customPresetFields = document.getElementById('custom-preset-fields');
    const customAudioFormat = document.getElementById('custom-audio-format');
    const customImageFormat = document.getElementById('custom-image-format');
    const customImageSize = document.getElementById('custom-image-size');
    const customImageSizeMethod = document.getElementById('custom-image-size-method');
    const customDimensionInputs = document.getElementById('custom-dimension-inputs');
    const customWidth = document.getElementById('custom-width');
    const customHeight = document.getElementById('custom-height');
    const savePresetsBtn = document.getElementById('save-presets-btn');
    const langRadios = document.querySelectorAll('input[name="lang-choice"]');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const importJsonInput = document.getElementById('import-json-input');
    const resetDataBtn = document.getElementById('reset-data-btn');

    // Beta Features & Mode Switcher Elements
    const remixTrimSection = document.getElementById('remix-trim-section');
    const betaToggleTrimmer = document.getElementById('beta-toggle-trimmer');
    const betaToggleLabMode = document.getElementById('beta-toggle-lab-mode');
    const modeSwitcherContainer = document.getElementById('mode-switcher-container');
    const btnModeStudio = document.getElementById('btn-mode-studio');
    const btnModeLab = document.getElementById('btn-mode-lab');
    const studioView = document.getElementById('studio-view');
    const labView = document.getElementById('lab-view');
    let currentAppMode = 'studio';
    let isLabInitialized = false;

    function switchAppMode(mode) {
        currentAppMode = mode;
        if (mode === 'studio') {
            if (btnModeStudio) btnModeStudio.classList.add('active');
            if (btnModeLab) btnModeLab.classList.remove('active');
            if (studioView) studioView.classList.remove('hidden');
            if (labView) labView.classList.add('hidden');
        } else if (mode === 'lab') {
            if (btnModeLab) btnModeLab.classList.add('active');
            if (btnModeStudio) btnModeStudio.classList.remove('active');
            if (labView) labView.classList.remove('hidden');
            if (studioView) studioView.classList.add('hidden');
            if (!isLabInitialized && window.LabModeEngine) {
                window.LabModeEngine.init();
                isLabInitialized = true;
            }
        }
        lucide.createIcons();
    }

    if (btnModeStudio) {
        btnModeStudio.addEventListener('click', () => switchAppMode('studio'));
    }
    if (btnModeLab) {
        btnModeLab.addEventListener('click', () => switchAppMode('lab'));
    }

    function syncBetaFeaturesUI(beta) {
        if (remixTrimSection) {
            remixTrimSection.classList.toggle('hidden', !beta.trimmerEnabled);
        }
        if (modeSwitcherContainer) {
            modeSwitcherContainer.classList.toggle('hidden', !beta.labModeEnabled);
        }
        if (!beta.labModeEnabled && currentAppMode === 'lab') {
            switchAppMode('studio');
        }
    }

    if (betaToggleTrimmer) {
        betaToggleTrimmer.addEventListener('change', () => {
            const current = SettingsManager.loadSettings();
            if (!current.betaFeatures) current.betaFeatures = {};
            current.betaFeatures.trimmerEnabled = betaToggleTrimmer.checked;
            SettingsManager.saveSettings(current);
            syncBetaFeaturesUI(current.betaFeatures);
        });
    }

    if (betaToggleLabMode) {
        betaToggleLabMode.addEventListener('change', () => {
            const current = SettingsManager.loadSettings();
            if (!current.betaFeatures) current.betaFeatures = {};
            current.betaFeatures.labModeEnabled = betaToggleLabMode.checked;
            SettingsManager.saveSettings(current);
            syncBetaFeaturesUI(current.betaFeatures);
        });
    }

    const processor = new FileProcessor();
    const effectsEngine = new AudioEffectsEngine();
    let queue = [];
    let processedResults = [];
    let currentRemixTarget = null;
    let currentRemixQueueItem = null;
    let modalMouseDownTarget = null;
    let isReverbUnlocked = false;

    // Set current year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Initialize UI from Settings
    initFromSettings();

    // --- Settings Modal & Tabs Logic ---
    openSettingsBtn.addEventListener('click', async () => {
        const imageTasks = queue.filter(q => q.file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(q.file.name));
        if (imageTasks.length > 0 && (!activePreviewArtworkImage || activePreviewArtworkImage.id === 'demo')) {
            await loadImageForPreview(imageTasks[0].file, imageTasks[0].id, true);
        }
        populateSettingsUI();
        settingsModal.classList.remove('hidden');
    });

    closeSettingsModal.addEventListener('click', () => {
        settingsModal.classList.add('hidden');
    });

    // Backdrop protection: only close modal when mousedown AND mouseup both land on overlay
    // Prevents accidental close when dragging trim handles near modal edge
    [settingsModal, remixModal].forEach(modal => {
        if (!modal) return;
        modal.addEventListener('mousedown', (e) => {
            modalMouseDownTarget = e.target;
        });
        modal.addEventListener('click', (e) => {
            if (Date.now() - lastDragEndTime < 250) {
                modalMouseDownTarget = null;
                return;
            }
            if (e.target === modal && modalMouseDownTarget === modal && !isDraggingTrimHandle) {
                if (modal === settingsModal) settingsModal.classList.add('hidden');
                if (modal === remixModal) closeRemixStudio();
            }
            modalMouseDownTarget = null;
        });
    });

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetId = btn.getAttribute('data-tab');
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('active');
                if (targetId === 'tab-logo') {
                    renderWatermarkPreview();
                }
            }
        });
    });

    // Preset selection change
    presetRadioDefault.addEventListener('change', () => {
        customPresetFields.classList.add('hidden');
    });
    presetRadioCustom.addEventListener('change', () => {
        customPresetFields.classList.remove('hidden');
    });

    function updateImageSizeVisibility() {
        const isNone = customImageSizeMethod && customImageSizeMethod.value === 'none';
        if (customImageSize) {
            customImageSize.disabled = isNone;
            customImageSize.style.opacity = isNone ? '0.5' : '1';
        }
        if (customDimensionInputs) {
            if (isNone) {
                customDimensionInputs.classList.add('hidden');
            } else if (customImageSize && customImageSize.value === 'custom') {
                customDimensionInputs.classList.remove('hidden');
            }
        }
    }

    customImageSize.addEventListener('change', () => {
        if (customImageSizeMethod && customImageSizeMethod.value === 'none') {
            customDimensionInputs.classList.add('hidden');
            return;
        }
        if (customImageSize.value === 'custom') {
            customDimensionInputs.classList.remove('hidden');
        } else {
            customDimensionInputs.classList.add('hidden');
        }
    });

    if (customImageSizeMethod) {
        customImageSizeMethod.addEventListener('change', updateImageSizeVisibility);
    }

    savePresetsBtn.addEventListener('click', () => {
        const isCustom = presetRadioCustom.checked;
        const current = SettingsManager.loadSettings();

        current.activePreset = isCustom ? 'custom' : 'default';
        if (isCustom) {
            current.presets.custom = {
                name: 'Custom Studio',
                audioFormat: customAudioFormat.value,
                imageFormat: customImageFormat.value,
                imageSize: customImageSize.value,
                imageSizeMethod: customImageSizeMethod ? customImageSizeMethod.value : 'stretch',
                customWidth: parseInt(customWidth.value) || 2048,
                customHeight: parseInt(customHeight.value) || 2048
            };
        }

        SettingsManager.saveSettings(current);
        updateHeaderBadges();
        settingsModal.classList.add('hidden');
    });

    // Language switching
    langRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                I18n.setLanguage(e.target.value);
                const current = SettingsManager.loadSettings();
                current.language = e.target.value;
                SettingsManager.saveSettings(current);
                updateHeaderBadges();
            }
        });
    });

    // Watermark Tab Handlers
    logoEnableToggle.addEventListener('change', () => {
        renderWatermarkPreview();
    });

    logoSizeSlider.addEventListener('input', (e) => {
        logoSizeVal.textContent = e.target.value + '%';
        renderWatermarkPreview();
    });

    logoOpacitySlider.addEventListener('input', (e) => {
        logoOpacityVal.textContent = e.target.value + '%';
        renderWatermarkPreview();
    });

    logoPositionSelect.addEventListener('change', () => {
        if (logoPositionSelect.value === 'custom') {
            freePosControls.classList.remove('hidden');
        } else {
            freePosControls.classList.add('hidden');
        }
        renderWatermarkPreview();
    });

    if (logoFreeX) {
        logoFreeX.addEventListener('input', (e) => {
            logoFreeXVal.textContent = e.target.value + '%';
            renderWatermarkPreview();
        });
    }

    if (logoFreeY) {
        logoFreeY.addEventListener('input', (e) => {
            logoFreeYVal.textContent = e.target.value + '%';
            renderWatermarkPreview();
        });
    }

    if (watermarkArtSelect) {
        watermarkArtSelect.addEventListener('change', () => {
            const val = watermarkArtSelect.value;
            if (val === 'demo') {
                activePreviewArtworkImage = null;
                renderWatermarkPreview();
            } else if (val.startsWith('custom_upload_')) {
                renderWatermarkPreview();
            } else {
                const task = queue.find(q => q.id === val);
                if (task && task.file) {
                    loadImageForPreview(task.file, task.id, true).then(() => {
                        renderWatermarkPreview();
                    });
                }
            }
        });
    }

    if (previewArtUpload) {
        previewArtUpload.addEventListener('change', async (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                const customId = 'custom_upload_' + Date.now();
                await loadImageForPreview(file, customId, false);
                updateArtworkDropdown();
                if (watermarkArtSelect) watermarkArtSelect.value = customId;
                renderWatermarkPreview();
            }
        });
    }

    if (watermarkPreviewCanvas) {
        watermarkPreviewCanvas.addEventListener('dragover', (e) => {
            e.preventDefault();
            watermarkPreviewCanvas.style.outline = '2px dashed var(--primary)';
        });
        watermarkPreviewCanvas.addEventListener('dragleave', (e) => {
            e.preventDefault();
            watermarkPreviewCanvas.style.outline = 'none';
        });
        watermarkPreviewCanvas.addEventListener('drop', async (e) => {
            e.preventDefault();
            watermarkPreviewCanvas.style.outline = 'none';
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name)) {
                    const customId = 'custom_upload_' + Date.now();
                    await loadImageForPreview(file, customId, false);
                    updateArtworkDropdown();
                    if (watermarkArtSelect) watermarkArtSelect.value = customId;
                    renderWatermarkPreview();
                }
            }
        });
    }

    // Canvas Free Drag-and-Drop
    function getCanvasCoords(e) {
        const rect = watermarkPreviewCanvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const scaleX = watermarkPreviewCanvas.width / rect.width;
        const scaleY = watermarkPreviewCanvas.height / rect.height;
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    if (watermarkPreviewCanvas) {
        const onDragStart = (e) => {
            if (!logoEnableToggle.checked || !WatermarkEngine.isLoaded) return;
            const coords = getCanvasCoords(e);
            if (currentLogoBbox &&
                coords.x >= currentLogoBbox.x &&
                coords.x <= currentLogoBbox.x + currentLogoBbox.width &&
                coords.y >= currentLogoBbox.y &&
                coords.y <= currentLogoBbox.y + currentLogoBbox.height) {

                isDraggingLogo = true;
                dragStartOffset = {
                    x: coords.x - currentLogoBbox.x,
                    y: coords.y - currentLogoBbox.y
                };
                watermarkPreviewCanvas.classList.add('dragging');

                logoPositionSelect.value = 'custom';
                freePosControls.classList.remove('hidden');
                e.preventDefault();
            }
        };

        const onDragMove = (e) => {
            if (!isDraggingLogo) return;
            const coords = getCanvasCoords(e);
            const newX = coords.x - dragStartOffset.x;
            const newY = coords.y - dragStartOffset.y;

            const allowOverflow = logoAllowOverflow ? logoAllowOverflow.checked : false;
            let freeXPercent = (newX / watermarkPreviewCanvas.width) * 100;
            let freeYPercent = (newY / watermarkPreviewCanvas.height) * 100;

            if (allowOverflow) {
                freeXPercent = Math.max(-50, Math.min(150, freeXPercent));
                freeYPercent = Math.max(-50, Math.min(150, freeYPercent));
            } else {
                freeXPercent = Math.max(0, Math.min(100, freeXPercent));
                freeYPercent = Math.max(0, Math.min(100, freeYPercent));
            }

            logoFreeX.value = Math.round(freeXPercent);
            logoFreeY.value = Math.round(freeYPercent);
            logoFreeXVal.textContent = Math.round(freeXPercent) + '%';
            logoFreeYVal.textContent = Math.round(freeYPercent) + '%';

            renderWatermarkPreview();
            e.preventDefault();
        };

        const onDragEnd = () => {
            if (isDraggingLogo) {
                isDraggingLogo = false;
                watermarkPreviewCanvas.classList.remove('dragging');
            }
        };

        watermarkPreviewCanvas.addEventListener('mousedown', onDragStart);
        window.addEventListener('mousemove', onDragMove);
        window.addEventListener('mouseup', onDragEnd);

        watermarkPreviewCanvas.addEventListener('touchstart', onDragStart, { passive: false });
        window.addEventListener('touchmove', onDragMove, { passive: false });
        window.addEventListener('touchend', onDragEnd);
    }

    function updateOverflowSlidersRange(allowed) {
        if (!logoFreeX || !logoFreeY) return;
        if (allowed) {
            logoFreeX.min = "-50";
            logoFreeX.max = "150";
            logoFreeY.min = "-50";
            logoFreeY.max = "150";
        } else {
            logoFreeX.min = "0";
            logoFreeX.max = "100";
            logoFreeY.min = "0";
            logoFreeY.max = "100";
            if (parseInt(logoFreeX.value) < 0) logoFreeX.value = 0;
            if (parseInt(logoFreeX.value) > 100) logoFreeX.value = 100;
            if (parseInt(logoFreeY.value) < 0) logoFreeY.value = 0;
            if (parseInt(logoFreeY.value) > 100) logoFreeY.value = 100;
            if (logoFreeXVal) logoFreeXVal.textContent = logoFreeX.value + '%';
            if (logoFreeYVal) logoFreeYVal.textContent = logoFreeY.value + '%';
        }
    }

    if (logoInvertColor) {
        logoInvertColor.addEventListener('change', () => {
            renderWatermarkPreview();
        });
    }

    if (logoAllowOverflow) {
        logoAllowOverflow.addEventListener('change', () => {
            updateOverflowSlidersRange(logoAllowOverflow.checked);
            renderWatermarkPreview();
        });
    }

    logoFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await WatermarkEngine.setLogoFile(file);
                logoEnableToggle.checked = true;
                renderWatermarkPreview();
            } catch (err) {
                alert('Could not load logo file: ' + err.message);
            }
        }
    });

    saveWatermarkBtn.addEventListener('click', () => {
        const current = SettingsManager.loadSettings();
        current.logoSettings.enabled = logoEnableToggle.checked;
        current.logoSettings.sizePercent = parseInt(logoSizeSlider.value);
        current.logoSettings.position = logoPositionSelect.value;
        current.logoSettings.freeX = parseInt(logoFreeX.value) || 75;
        current.logoSettings.freeY = parseInt(logoFreeY.value) || 75;
        current.logoSettings.opacity = parseInt(logoOpacitySlider.value) / 100;
        current.logoSettings.invertColor = logoInvertColor ? logoInvertColor.checked : false;
        current.logoSettings.allowOverflow = logoAllowOverflow ? logoAllowOverflow.checked : false;
        SettingsManager.saveSettings(current);
        settingsModal.classList.add('hidden');
    });

    // Data Management
    exportJsonBtn.addEventListener('click', () => {
        SettingsManager.exportJSON();
    });

    importJsonInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await SettingsManager.importJSON(file);
                initFromSettings();
                settingsModal.classList.add('hidden');
                alert(I18n.t('completed'));
            } catch (err) {
                alert('Invalid JSON settings file: ' + err.message);
            }
        }
    });

    resetDataBtn.addEventListener('click', () => {
        if (confirm(I18n.t('confirmDeleteAll'))) {
            SettingsManager.resetAll();
            window.location.reload();
        }
    });

    // --- Dropzone & File Handling ---
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    processBtn.addEventListener('click', processAllFiles);

    clearBtn.addEventListener('click', () => {
        stopMiniPlayer();
        queue = [];
        processedResults = [];
        fileList.innerHTML = '';
        processSection.classList.add('hidden');
        resultActions.classList.add('hidden');
        updateFileCount();
    });

    downloadZipBtn.addEventListener('click', downloadAllAsZip);

    // --- File Ingestion ---
    async function handleFiles(files) {
        if (files.length === 0) return;

        processSection.classList.remove('hidden');
        resultActions.classList.add('hidden');

        const zipFilesToName = [];

        for (const file of files) {
            if (file.name.toLowerCase().endsWith('.zip')) {
                zipFilesToName.push(file);
            } else {
                addToFileList(file, null);
            }
        }

        if (zipFilesToName.length > 0) {
            await showZipModal(zipFilesToName);
        }

        updateFileCount();
    }

    function addToFileList(file, folderName = null, preProcessedResult = null) {
        if (queue.find(f => f.file.name === file.name && f.file.size === file.size && f.folderName === folderName)) return;

        const id = Math.random().toString(36).substr(2, 9);
        const clone = fileItemTemplate.content.cloneNode(true);
        const item = clone.querySelector('.file-item');

        item.dataset.id = id;
        item.querySelector('.file-name').textContent = folderName ? `[${folderName}] ${file.name}` : file.name;
        item.querySelector('.file-meta').textContent = formatBytes(file.size);

        const fileIcon = item.querySelector('.file-icon i');
        const playBtn = item.querySelector('.play-single-btn');
        const remixBtn = item.querySelector('.remix-btn');
        const watermarkBtn = item.querySelector('.watermark-btn');
        const deleteBtn = item.querySelector('.delete-single-btn');
        const fileNameRow = item.querySelector('.file-name-row');
        const fileNameSpan = item.querySelector('.file-name');
        const renameBtn = item.querySelector('.rename-file-btn');
        const fileRenameContainer = item.querySelector('.file-rename-container');
        const fileRenameInput = item.querySelector('.file-rename-input');
        const btnRenameConfirm = item.querySelector('.btn-rename-confirm');
        const btnRenameCancel = item.querySelector('.btn-rename-cancel');
        const fileMetaSpan = item.querySelector('.file-meta');
        const isAudio = file.type.startsWith('audio/') || /\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file.name);
        const isImage = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);

        const queueItem = {
            id,
            file,
            element: item,
            status: preProcessedResult ? 'completed' : 'pending',
            folderName: folderName,
            resultBlob: preProcessedResult ? preProcessedResult.blob : null,
            resultName: preProcessedResult ? preProcessedResult.name : null
        };

        // --- Inline File Rename Logic ---
        function getCurrentRawName() {
            return queueItem.resultName || queueItem.file.name;
        }

        function startRename() {
            const rawName = getCurrentRawName();
            fileNameRow.classList.add('hidden');
            fileRenameContainer.classList.remove('hidden');
            fileRenameInput.value = rawName;
            fileRenameInput.focus();
            const dotIdx = rawName.lastIndexOf('.');
            if (dotIdx > 0) {
                fileRenameInput.setSelectionRange(0, dotIdx);
            } else {
                fileRenameInput.select();
            }
        }

        function cancelRename() {
            fileRenameContainer.classList.add('hidden');
            fileNameRow.classList.remove('hidden');
        }

        function saveRename() {
            let newName = fileRenameInput.value.trim();
            const currentRawName = getCurrentRawName();

            if (!newName || newName === currentRawName) {
                cancelRename();
                return;
            }

            const dotIdx = currentRawName.lastIndexOf('.');
            if (dotIdx > 0) {
                const ext = currentRawName.substring(dotIdx);
                if (!newName.includes('.')) {
                    newName += ext;
                }
            }

            if (queueItem.resultName) {
                const oldResName = queueItem.resultName;
                queueItem.resultName = newName;

                const pr = processedResults.find(r => r.name === oldResName || r.name === queueItem.file.name);
                if (pr) pr.name = newName;

                if (queueItem.status === 'completed' && fileMetaSpan) {
                    fileMetaSpan.textContent = `Completed → ${newName}`;
                }

                const downloadBtn = item.querySelector('.download-single-btn');
                if (downloadBtn && queueItem.resultBlob) {
                    downloadBtn.onclick = () => {
                        const url = URL.createObjectURL(queueItem.resultBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = newName;
                        a.click();
                        URL.revokeObjectURL(url);
                    };
                }
            } else {
                const updatedFile = new File([queueItem.file], newName, { type: queueItem.file.type });
                queueItem.file = updatedFile;
            }

            if (fileNameSpan) {
                fileNameSpan.textContent = folderName ? `[${folderName}] ${newName}` : newName;
            }

            if (activePlayingItem && activePlayingItem.id === id) {
                if (miniPlayerTitle) miniPlayerTitle.textContent = newName;
            }

            cancelRename();
        }

        if (renameBtn) {
            renameBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                startRename();
            });
        }

        if (btnRenameConfirm) {
            btnRenameConfirm.addEventListener('click', (e) => {
                e.stopPropagation();
                saveRename();
            });
        }

        if (btnRenameCancel) {
            btnRenameCancel.addEventListener('click', (e) => {
                e.stopPropagation();
                cancelRename();
            });
        }

        if (fileRenameInput) {
            fileRenameInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    saveRename();
                } else if (e.key === 'Escape') {
                    e.preventDefault();
                    cancelRename();
                }
            });
        }

        if (isAudio) {
            fileIcon.setAttribute('data-lucide', 'music');
            if (playBtn) {
                playBtn.classList.remove('hidden');
                playBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    togglePlayItem(queueItem);
                });
            }
            remixBtn.classList.remove('hidden');
            remixBtn.addEventListener('click', () => openRemixStudio(queueItem));
        } else if (isImage) {
            fileIcon.setAttribute('data-lucide', 'image');
            try {
                const thumbUrl = URL.createObjectURL(file);
                const thumbImg = document.createElement('img');
                thumbImg.src = thumbUrl;
                thumbImg.className = 'file-thumbnail';
                thumbImg.title = I18n.t('btnWatermark');
                thumbImg.style.cursor = 'pointer';
                thumbImg.addEventListener('click', () => openWatermarkEditorForImage(file));
                const iconWrapper = item.querySelector('.file-icon');
                if (iconWrapper) {
                    iconWrapper.innerHTML = '';
                    iconWrapper.appendChild(thumbImg);
                }
            } catch (err) { }

            // Auto-load as active preview artwork if none selected yet or currently demo
            if (!activePreviewArtworkImage || activePreviewArtworkImage.id === 'demo') {
                loadImageForPreview(file, id, true).then(() => {
                    updateArtworkDropdown();
                    renderWatermarkPreview();
                });
            } else {
                updateArtworkDropdown();
            }

            watermarkBtn.classList.remove('hidden');
            watermarkBtn.title = I18n.t('btnWatermark');
            watermarkBtn.addEventListener('click', () => openWatermarkEditorForImage(file));
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (activePlayingItem && activePlayingItem.id === id) {
                    stopMiniPlayer();
                }
                item.remove();
                const qIdx = queue.findIndex(q => q.id === id);
                if (qIdx !== -1) {
                    queue.splice(qIdx, 1);
                }
                const resIdx = processedResults.findIndex(r => r.name === file.name || (queueItem.resultName && r.name === queueItem.resultName));
                if (resIdx !== -1) {
                    processedResults.splice(resIdx, 1);
                }
                updateFileCount();
                if (queue.length === 0) {
                    processSection.classList.add('hidden');
                    resultActions.classList.add('hidden');
                }
            });
        }

        fileList.appendChild(item);
        lucide.createIcons();

        if (preProcessedResult) {
            const progressBar = item.querySelector('.progress-bar');
            const meta = item.querySelector('.file-meta');
            const statusIconSuccess = item.querySelector('.status-icon.success');
            const downloadBtn = item.querySelector('.download-single-btn');

            progressBar.style.width = '100%';
            statusIconSuccess.classList.remove('hidden');
            downloadBtn.classList.remove('hidden');
            meta.textContent = `Completed → ${preProcessedResult.name}`;
            meta.style.color = 'var(--success)';

            downloadBtn.onclick = () => {
                const url = URL.createObjectURL(preProcessedResult.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = preProcessedResult.name;
                a.click();
                URL.revokeObjectURL(url);
            };

            processedResults.push({
                blob: preProcessedResult.blob,
                name: preProcessedResult.name,
                folderName: folderName
            });
            resultActions.classList.remove('hidden');
        }

        queue.push(queueItem);
    }

    function updateFileCount() {
        fileCountSpan.textContent = queue.length;
    }

    // --- Processing Pipeline ---
    async function processAllFiles() {
        if (queue.length === 0) return;

        processBtn.disabled = true;
        clearBtn.disabled = true;

        const limit = 2;
        const tasks = queue.filter(t => t.status !== 'completed');

        const workers = Array(Math.min(limit, tasks.length)).fill(null).map(async () => {
            while (tasks.length > 0) {
                const task = tasks.shift();
                await processOne(task);
            }
        });

        await Promise.all(workers);

        processBtn.disabled = false;
        clearBtn.disabled = false;
        resultActions.classList.remove('hidden');
        lucide.createIcons();
    }

    async function processOne(task) {
        const { id, file, element } = task;
        const progressBar = element.querySelector('.progress-bar');
        const meta = element.querySelector('.file-meta');
        const statusIconSuccess = element.querySelector('.status-icon.success');
        const statusIconError = element.querySelector('.status-icon.error');
        const spinner = element.querySelector('.spinner');
        const downloadBtn = element.querySelector('.download-single-btn');

        spinner.classList.remove('hidden');
        task.status = 'processing';

        try {
            const result = await processor.processFile(file, (percent, text) => {
                progressBar.style.width = percent + '%';
                meta.textContent = text;
            });

            processedResults.push({
                blob: result.blob,
                name: result.newName,
                folderName: task.folderName
            });

            task.status = 'completed';
            task.resultBlob = result.blob;
            task.resultName = result.newName;

            spinner.classList.add('hidden');
            statusIconSuccess.classList.remove('hidden');

            downloadBtn.classList.remove('hidden');
            downloadBtn.onclick = () => {
                const url = URL.createObjectURL(result.blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = result.newName;
                a.click();
                URL.revokeObjectURL(url);
            };

            meta.textContent = `Completed → ${result.newName}`;
            meta.style.color = 'var(--success)';
        } catch (e) {
            console.error(e);
            task.status = 'error';
            spinner.classList.add('hidden');
            statusIconError.classList.remove('hidden');
            meta.textContent = 'Error: ' + e.message;
            meta.style.color = 'var(--error)';
        }
    }

    // --- ZIP Archiving with Custom Name ---
    async function downloadAllAsZip() {
        if (processedResults.length === 0) return;

        let baseZipName = (zipNameInput.value || 'Musicable').trim();
        baseZipName = baseZipName.replace(/\.zip$/i, '');
        if (!baseZipName) baseZipName = 'Musicable';

        const zip = new JSZip();
        processedResults.forEach(res => {
            if (res.folderName) {
                zip.folder(res.folderName).file(res.name, res.blob);
            } else {
                zip.file(res.name, res.blob);
            }
        });

        downloadZipBtn.disabled = true;
        downloadZipBtn.innerHTML = '<div class="spinner"></div> Archiving...';

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${baseZipName}.zip`;
        a.click();
        URL.revokeObjectURL(url);

        downloadZipBtn.disabled = false;
        downloadZipBtn.innerHTML = `<i data-lucide="download"></i> <span data-i18n="downloadZip">${I18n.t('downloadZip')}</span>`;
        lucide.createIcons();
    }

    // --- ZIP Extraction Modal ---
    async function showZipModal(zipFiles) {
        const zipModal = document.getElementById('zip-modal');
        const zipModalBody = document.getElementById('zip-modal-body');
        const confirmBtn = document.getElementById('confirm-zip-btn');
        const cancelBtn = document.getElementById('cancel-zip-btn');

        zipModalBody.innerHTML = '';
        const zipDataList = [];

        for (const zipFile of zipFiles) {
            const baseName = zipFile.name.replace(/\.[^/.]+$/, "");
            const itemDiv = document.createElement('div');
            itemDiv.className = 'zip-rename-item';

            const label = document.createElement('div');
            label.textContent = `ZIP: ${zipFile.name}`;
            label.style.marginBottom = '0.5rem';
            label.style.fontSize = '0.9rem';
            label.style.color = 'var(--text-muted)';

            const filesPreviewInfo = document.createElement('div');
            filesPreviewInfo.style.marginBottom = '0.5rem';
            filesPreviewInfo.style.fontSize = '0.8rem';
            filesPreviewInfo.style.color = 'var(--primary)';
            filesPreviewInfo.textContent = 'Reading files...';

            JSZip.loadAsync(zipFile).then(zip => {
                let fileNames = [];
                for (const [path, entry] of Object.entries(zip.files)) {
                    if (!entry.dir) fileNames.push(path.split('/').pop());
                }
                const count = fileNames.length;
                const sample = fileNames.slice(0, 3).join(', ') + (count > 3 ? `,... (+${count - 3} file)` : '');
                filesPreviewInfo.textContent = `Contains ${count} file(s): ${sample}`;
            }).catch(() => {
                filesPreviewInfo.textContent = 'Could not preview ZIP entries.';
            });

            const input = document.createElement('input');
            input.type = 'text';
            input.value = `${baseName}`;
            input.className = 'zip-name-input';

            itemDiv.appendChild(label);
            itemDiv.appendChild(filesPreviewInfo);
            itemDiv.appendChild(input);
            zipModalBody.appendChild(itemDiv);

            zipDataList.push({ file: zipFile, input: input });
        }

        zipModal.classList.remove('hidden');

        return new Promise((resolve) => {
            const onConfirm = async () => {
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);

                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Processing...';

                for (const data of zipDataList) {
                    const folderName = data.input.value.trim() || 'Folder';
                    await handleZipFile(data.file, folderName);
                }

                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Confirm';
                zipModal.classList.add('hidden');
                updateFileCount();
                resolve();
            };

            const onCancel = () => {
                confirmBtn.removeEventListener('click', onConfirm);
                cancelBtn.removeEventListener('click', onCancel);
                zipModal.classList.add('hidden');
                resolve();
            };

            confirmBtn.addEventListener('click', onConfirm);
            cancelBtn.addEventListener('click', onCancel);
        });
    }

    async function handleZipFile(zipFile, folderName) {
        try {
            const zip = await JSZip.loadAsync(zipFile);
            for (const [path, entry] of Object.entries(zip.files)) {
                if (!entry.dir) {
                    const blob = await entry.async('blob');
                    const file = new File([blob], path.split('/').pop(), { type: getMimeType(path) });
                    addToFileList(file, folderName);
                }
            }
        } catch (e) {
            console.error('Error reading ZIP:', e);
            alert('Error reading ZIP file: ' + zipFile.name);
        }
    }

    function formatTime(sec) {
        if (isNaN(sec) || sec < 0) return '0:00';
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // --- Floating Mini Music Player (Popup with Spinning Disc) ---
    function updateMiniPlayerState(isPlaying) {
        if (!miniPlayerPopup) return;
        if (isPlaying) {
            if (miniVinylDisc) miniVinylDisc.classList.add('playing');
            if (miniPlayerToggleBtn) miniPlayerToggleBtn.innerHTML = '<i data-lucide="pause"></i>';
            if (miniPlayerStatus) miniPlayerStatus.textContent = I18n.t('nowPlaying');
            if (activePlayingItem && activePlayingItem.element) {
                const btn = activePlayingItem.element.querySelector('.play-single-btn');
                if (btn) {
                    btn.innerHTML = '<i data-lucide="pause"></i>';
                    btn.classList.add('active');
                }
            }
        } else {
            if (miniVinylDisc) miniVinylDisc.classList.remove('playing');
            if (miniPlayerToggleBtn) miniPlayerToggleBtn.innerHTML = '<i data-lucide="play"></i>';
            if (miniPlayerStatus) miniPlayerStatus.textContent = I18n.t('paused');
            if (activePlayingItem && activePlayingItem.element) {
                const btn = activePlayingItem.element.querySelector('.play-single-btn');
                if (btn) {
                    btn.innerHTML = '<i data-lucide="play"></i>';
                    btn.classList.remove('active');
                }
            }
        }
        lucide.createIcons();
    }

    function playTrack(item) {
        if (!item || !miniPlayerAudio) return;

        // Pause remix studio preview if running
        if (previewAudioElement && !previewAudioElement.paused) {
            previewAudioElement.pause();
            updatePreviewPlayBtnState(false);
        }

        // Reset previous playing item UI
        if (activePlayingItem && activePlayingItem.element) {
            activePlayingItem.element.classList.remove('is-playing');
            const oldPlayBtn = activePlayingItem.element.querySelector('.play-single-btn');
            if (oldPlayBtn) {
                oldPlayBtn.innerHTML = '<i data-lucide="play"></i>';
                oldPlayBtn.classList.remove('active');
            }
        }

        activePlayingItem = item;
        item.element.classList.add('is-playing');
        const playBtn = item.element.querySelector('.play-single-btn');
        if (playBtn) {
            playBtn.innerHTML = '<i data-lucide="pause"></i>';
            playBtn.classList.add('active');
        }

        const audioSource = item.resultBlob || item.file;
        if (activeAudioUrl) {
            URL.revokeObjectURL(activeAudioUrl);
            activeAudioUrl = null;
        }
        activeAudioUrl = URL.createObjectURL(audioSource);

        if (miniPlayerTitle) miniPlayerTitle.textContent = item.resultName || item.file.name;
        if (miniPlayerStatus) miniPlayerStatus.textContent = I18n.t('nowPlaying');
        if (miniPlayerSeekSlider) miniPlayerSeekSlider.value = 0;
        if (miniPlayerCurrentTime) miniPlayerCurrentTime.textContent = '0:00';
        if (miniPlayerTotalTime) miniPlayerTotalTime.textContent = '0:00';

        miniPlayerAudio.src = activeAudioUrl;
        miniPlayerAudio.load();

        if (miniPlayerPopup) miniPlayerPopup.classList.remove('hidden');
        lucide.createIcons();

        miniPlayerAudio.play().then(() => {
            updateMiniPlayerState(true);
        }).catch(err => {
            console.error('Audio playback error:', err);
            updateMiniPlayerState(false);
        });
    }

    function togglePlayItem(item) {
        if (!item || !miniPlayerAudio) return;
        if (activePlayingItem && activePlayingItem.id === item.id) {
            if (miniPlayerAudio.paused) {
                miniPlayerAudio.play().then(() => updateMiniPlayerState(true)).catch(e => console.error(e));
            } else {
                miniPlayerAudio.pause();
                updateMiniPlayerState(false);
            }
            return;
        }
        playTrack(item);
    }

    function stopMiniPlayer() {
        if (miniPlayerAudio) {
            miniPlayerAudio.pause();
            miniPlayerAudio.src = '';
        }
        if (activeAudioUrl) {
            URL.revokeObjectURL(activeAudioUrl);
            activeAudioUrl = null;
        }
        if (activePlayingItem && activePlayingItem.element) {
            activePlayingItem.element.classList.remove('is-playing');
            const btn = activePlayingItem.element.querySelector('.play-single-btn');
            if (btn) {
                btn.innerHTML = '<i data-lucide="play"></i>';
                btn.classList.remove('active');
            }
        }
        activePlayingItem = null;
        if (miniVinylDisc) miniVinylDisc.classList.remove('playing');
        if (miniPlayerPopup) miniPlayerPopup.classList.add('hidden');
        lucide.createIcons();
    }

    if (miniPlayerAudio) {
        miniPlayerAudio.addEventListener('loadedmetadata', () => {
            if (miniPlayerTotalTime) miniPlayerTotalTime.textContent = formatTime(miniPlayerAudio.duration);
        });

        miniPlayerAudio.addEventListener('timeupdate', () => {
            if (isDraggingMiniSlider) return;
            const cur = miniPlayerAudio.currentTime;
            const dur = miniPlayerAudio.duration || 1;
            if (miniPlayerCurrentTime) miniPlayerCurrentTime.textContent = formatTime(cur);
            if (miniPlayerSeekSlider) miniPlayerSeekSlider.value = (cur / dur) * 100;
        });

        miniPlayerAudio.addEventListener('ended', () => {
            updateMiniPlayerState(false);
            if (miniPlayerSeekSlider) miniPlayerSeekSlider.value = 0;
            if (miniPlayerCurrentTime) miniPlayerCurrentTime.textContent = '0:00';
        });

        miniPlayerAudio.addEventListener('pause', () => {
            updateMiniPlayerState(false);
        });

        miniPlayerAudio.addEventListener('play', () => {
            updateMiniPlayerState(true);
        });
    }

    if (miniPlayerSeekSlider) {
        miniPlayerSeekSlider.addEventListener('mousedown', () => { isDraggingMiniSlider = true; });
        miniPlayerSeekSlider.addEventListener('touchstart', () => { isDraggingMiniSlider = true; }, { passive: true });

        miniPlayerSeekSlider.addEventListener('input', () => {
            if (!miniPlayerAudio || !miniPlayerAudio.duration) return;
            const targetTime = (miniPlayerSeekSlider.value / 100) * miniPlayerAudio.duration;
            if (miniPlayerCurrentTime) miniPlayerCurrentTime.textContent = formatTime(targetTime);
        });

        miniPlayerSeekSlider.addEventListener('change', () => {
            if (miniPlayerAudio && miniPlayerAudio.duration) {
                miniPlayerAudio.currentTime = (miniPlayerSeekSlider.value / 100) * miniPlayerAudio.duration;
            }
            isDraggingMiniSlider = false;
        });
    }

    if (miniPlayerSkipBack) {
        miniPlayerSkipBack.addEventListener('click', () => {
            if (miniPlayerAudio && miniPlayerAudio.duration) {
                miniPlayerAudio.currentTime = Math.max(0, miniPlayerAudio.currentTime - 5);
            }
        });
    }

    if (miniPlayerSkipForward) {
        miniPlayerSkipForward.addEventListener('click', () => {
            if (miniPlayerAudio && miniPlayerAudio.duration) {
                miniPlayerAudio.currentTime = Math.min(miniPlayerAudio.duration, miniPlayerAudio.currentTime + 5);
            }
        });
    }

    if (miniPlayerToggleBtn) {
        miniPlayerToggleBtn.addEventListener('click', () => {
            if (!activePlayingItem || !miniPlayerAudio) return;
            if (miniPlayerAudio.paused) {
                miniPlayerAudio.play().then(() => updateMiniPlayerState(true)).catch(e => console.error(e));
            } else {
                miniPlayerAudio.pause();
                updateMiniPlayerState(false);
            }
        });
    }

    if (miniPlayerCloseBtn) {
        miniPlayerCloseBtn.addEventListener('click', stopMiniPlayer);
    }

    // --- Remix Studio Modal Logic ---
    function updateTrimmerUIFromInputs() {
        if (!trimTimelineTrack) return;
        const dur = currentTrackDuration || 1;
        let startSec = parseFloat(fxTrimStart.value);
        if (isNaN(startSec) || startSec < 0) startSec = 0;
        let endSec = parseFloat(fxTrimEnd.value);
        if (isNaN(endSec) || endSec <= 0 || endSec > dur) endSec = dur;

        if (startSec > endSec) startSec = endSec;

        const startPct = Math.max(0, Math.min(100, (startSec / dur) * 100));
        const endPct = Math.max(0, Math.min(100, (endSec / dur) * 100));

        if (trimHandleStart) trimHandleStart.style.left = startPct + '%';
        if (trimHandleEnd) trimHandleEnd.style.left = endPct + '%';

        if (trimDimLeft) trimDimLeft.style.width = startPct + '%';
        if (trimDimRight) trimDimRight.style.width = (100 - endPct) + '%';

        if (trimActiveRegion) {
            trimActiveRegion.style.left = startPct + '%';
            trimActiveRegion.style.width = Math.max(0, endPct - startPct) + '%';
        }

        if (trimStartTag) trimStartTag.textContent = formatTime(startSec);
        if (trimEndTag) trimEndTag.textContent = formatTime(endSec);

        if (trimRangeStat) trimRangeStat.textContent = `${formatTime(startSec)} - ${formatTime(endSec)}`;
        if (trimDurationStat) trimDurationStat.textContent = `${(endSec - startSec).toFixed(1)}s`;
    }

    function setRemixTargetMode(mode) {
        const isDirect = (mode === 'direct');
        if (modeDirectTrackRadio) modeDirectTrackRadio.checked = isDirect;
        if (modeRemixVariationsRadio) modeRemixVariationsRadio.checked = !isDirect;

        if (modeDirectCard) modeDirectCard.classList.toggle('active', isDirect);
        if (modeVariationsCard) modeVariationsCard.classList.toggle('active', !isDirect);

        if (remixVariationsSection) remixVariationsSection.classList.toggle('locked-mode', isDirect);
        if (remixVariationsLockedNotice) remixVariationsLockedNotice.classList.toggle('hidden', !isDirect);

        document.querySelectorAll('.remix-chip-checkbox').forEach(cb => {
            cb.disabled = isDirect;
        });

        if (generateRemixBtn) {
            if (isDirect) {
                generateRemixBtn.innerHTML = `<i data-lucide="check"></i> <span>${I18n.t('applyToCurrentTrack')}</span>`;
            } else {
                generateRemixBtn.innerHTML = `<i data-lucide="sparkles"></i> <span>${I18n.t('generateRemix')}</span>`;
            }
            lucide.createIcons();
        }

        if (deleteOriginalRemixContainer) {
            deleteOriginalRemixContainer.classList.toggle('hidden', isDirect);
        }

        lastRenderedPreviewSignature = null;
    }

    if (modeDirectTrackRadio) {
        modeDirectTrackRadio.addEventListener('change', () => {
            if (modeDirectTrackRadio.checked) setRemixTargetMode('direct');
        });
    }
    if (modeRemixVariationsRadio) {
        modeRemixVariationsRadio.addEventListener('change', () => {
            if (modeRemixVariationsRadio.checked) setRemixTargetMode('variations');
        });
    }

    async function openRemixStudio(qItem) {
        if (miniPlayerAudio && !miniPlayerAudio.paused) {
            miniPlayerAudio.pause();
            updateMiniPlayerState(false);
        }
        currentRemixQueueItem = qItem;
        currentRemixTarget = qItem.file;
        remixTrackTitle.textContent = qItem.resultName || qItem.file.name;
        previewStatus.textContent = '';
        resetPreviewPlayer();

        // Reset trim state for the new track
        if (fxTrimStart) fxTrimStart.value = 0;
        if (fxTrimEnd) fxTrimEnd.value = 0;
        currentTrackDuration = 0;

        if (deleteOriginalRemixCheckbox) {
            deleteOriginalRemixCheckbox.checked = localStorage.getItem('musicable_delete_original_after_remix') === 'true';
        }
        const currentMode = (modeDirectTrackRadio && modeDirectTrackRadio.checked) ? 'direct' : 'variations';
        setRemixTargetMode(currentMode);
        remixModal.classList.remove('hidden');

        // Preload raw audio immediately to get total duration & enable instant scrubbing + trimmer
        try {
            if (rawAudioUrl) {
                URL.revokeObjectURL(rawAudioUrl);
            }
            const audioSource = qItem.resultBlob || qItem.file;
            rawAudioUrl = URL.createObjectURL(audioSource);
            previewAudioElement.src = rawAudioUrl;
            previewAudioElement.load();
        } catch (err) {
            console.error('Failed to preload raw audio:', err);
        }
    }

    function resetPreviewPlayer() {
        if (previewAudioElement) {
            previewAudioElement.pause();
            previewAudioElement.src = '';
        }
        if (previewBlobUrl) {
            URL.revokeObjectURL(previewBlobUrl);
            previewBlobUrl = null;
        }
        if (rawAudioUrl) {
            URL.revokeObjectURL(rawAudioUrl);
            rawAudioUrl = null;
        }
        lastRenderedPreviewSignature = null;
        isPreviewingTrimOnly = false;
        if (previewSeekSlider) {
            previewSeekSlider.value = 0;
            previewSeekSlider.disabled = true;
        }
        if (previewCurrentTime) previewCurrentTime.textContent = '0:00';
        if (previewTotalTime) previewTotalTime.textContent = '0:00';
        if (trimPlayhead) trimPlayhead.style.left = '0%';
        updatePreviewPlayBtnState(false);
    }

    function closeRemixStudio() {
        resetPreviewPlayer();
        remixModal.classList.add('hidden');
        currentRemixTarget = null;
        currentRemixQueueItem = null;
    }

    closeRemixModal.addEventListener('click', closeRemixStudio);
    cancelRemixBtn.addEventListener('click', closeRemixStudio);

    // Audio Element event bindings
    if (previewAudioElement) {
        previewAudioElement.addEventListener('timeupdate', () => {
            const dur = previewAudioElement.duration || currentTrackDuration;
            if (dur && !isNaN(dur) && dur > 0) {
                const cur = previewAudioElement.currentTime;
                previewSeekSlider.value = (cur / dur) * 100;
                previewCurrentTime.textContent = formatTime(cur);

                if (trimPlayhead) {
                    const playPct = Math.min(100, Math.max(0, (cur / dur) * 100));
                    trimPlayhead.style.left = playPct + '%';
                }
            }

            if (isPreviewingTrimOnly) {
                const endSec = parseFloat(fxTrimEnd.value) || currentTrackDuration;
                if (previewAudioElement.currentTime >= endSec) {
                    previewAudioElement.pause();
                    isPreviewingTrimOnly = false;
                    previewStatus.textContent = 'Trimmed selection preview finished.';
                    updatePreviewPlayBtnState(false);
                }
            }
        });

        previewAudioElement.addEventListener('loadedmetadata', () => {
            const dur = previewAudioElement.duration;
            if (dur && !isNaN(dur) && dur > 0) {
                currentTrackDuration = dur;
                previewTotalTime.textContent = formatTime(dur);
                previewSeekSlider.disabled = false;

                // Init trim end if not set or exceeds duration
                if (!parseFloat(fxTrimEnd.value) || parseFloat(fxTrimEnd.value) > dur) {
                    fxTrimEnd.value = dur.toFixed(1);
                }
                fxTrimStart.max = dur.toFixed(1);
                fxTrimEnd.max = dur.toFixed(1);
                updateTrimmerUIFromInputs();
            }
        });

        previewAudioElement.addEventListener('ended', () => {
            previewSeekSlider.value = 0;
            previewCurrentTime.textContent = '0:00';
            if (trimPlayhead) trimPlayhead.style.left = '0%';
            updatePreviewPlayBtnState(false);
            previewStatus.textContent = 'Preview finished.';
        });

        previewAudioElement.addEventListener('play', () => {
            updatePreviewPlayBtnState(true);
        });

        previewAudioElement.addEventListener('pause', () => {
            updatePreviewPlayBtnState(false);
        });
    }

    function setupTrimmerEvents() {
        if (!trimTimelineTrack) return;

        function onPointerDown(handle, e) {
            e.preventDefault();
            e.stopPropagation();
            isDraggingTrimHandle = handle;
            document.body.style.cursor = 'ew-resize';
            if (handle === 'start' && trimHandleStart) {
                trimHandleStart.classList.add('dragging');
                trimHandleStart.style.zIndex = '25';
                if (trimHandleEnd) trimHandleEnd.style.zIndex = '15';
            }
            if (handle === 'end' && trimHandleEnd) {
                trimHandleEnd.classList.add('dragging');
                trimHandleEnd.style.zIndex = '25';
                if (trimHandleStart) trimHandleStart.style.zIndex = '15';
            }
        }

        if (trimHandleStart) {
            trimHandleStart.addEventListener('mousedown', (e) => onPointerDown('start', e));
            trimHandleStart.addEventListener('touchstart', (e) => onPointerDown('start', e), { passive: false });
        }

        if (trimHandleEnd) {
            trimHandleEnd.addEventListener('mousedown', (e) => onPointerDown('end', e));
            trimHandleEnd.addEventListener('touchstart', (e) => onPointerDown('end', e), { passive: false });
        }

        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('touchmove', onPointerMove, { passive: false });

        window.addEventListener('mouseup', onPointerUp);
        window.addEventListener('touchend', onPointerUp);

        function onPointerMove(e) {
            if (!isDraggingTrimHandle || !currentTrackDuration) return;
            const rect = trimTimelineTrack.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            let pct = (clientX - rect.left) / rect.width;
            pct = Math.max(0, Math.min(1, pct));
            const sec = parseFloat((pct * currentTrackDuration).toFixed(1));

            if (isDraggingTrimHandle === 'start') {
                const endSec = parseFloat(fxTrimEnd.value) || currentTrackDuration;
                fxTrimStart.value = Math.min(sec, Math.max(0, endSec - 0.1)).toFixed(1);
            } else if (isDraggingTrimHandle === 'end') {
                const startSec = parseFloat(fxTrimStart.value) || 0;
                fxTrimEnd.value = Math.max(sec, Math.min(currentTrackDuration, startSec + 0.1)).toFixed(1);
            }
            lastRenderedPreviewSignature = null;
            updateTrimmerUIFromInputs();
        }

        function onPointerUp() {
            if (isDraggingTrimHandle) {
                isDraggingTrimHandle = null;
                lastDragEndTime = Date.now();
                document.body.style.cursor = '';
                if (trimHandleStart) { trimHandleStart.classList.remove('dragging'); trimHandleStart.style.zIndex = ''; }
                if (trimHandleEnd) { trimHandleEnd.classList.remove('dragging'); trimHandleEnd.style.zIndex = ''; }
            }
        }

        // Clicking on track outside handles to seek & listen
        trimTimelineTrack.addEventListener('click', (e) => {
            if (Date.now() - lastDragEndTime < 250) return;
            if (e.target.closest('.trim-handle')) return;
            const rect = trimTimelineTrack.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            if (previewAudioElement && currentTrackDuration) {
                const targetTime = pct * currentTrackDuration;
                previewAudioElement.currentTime = targetTime;
                if (trimPlayhead) trimPlayhead.style.left = (pct * 100) + '%';
            }
        });

        // Input events from manual typing or step changes
        fxTrimStart.addEventListener('input', () => {
            lastRenderedPreviewSignature = null;
            updateTrimmerUIFromInputs();
        });
        fxTrimEnd.addEventListener('input', () => {
            lastRenderedPreviewSignature = null;
            updateTrimmerUIFromInputs();
        });

        // Quick action: Set Start at current playhead
        if (btnSetStartNow) {
            btnSetStartNow.addEventListener('click', () => {
                if (!currentTrackDuration || !previewAudioElement) return;
                const cur = parseFloat(previewAudioElement.currentTime.toFixed(1));
                const endSec = parseFloat(fxTrimEnd.value) || currentTrackDuration;
                fxTrimStart.value = Math.min(cur, endSec);
                lastRenderedPreviewSignature = null;
                updateTrimmerUIFromInputs();
            });
        }

        // Quick action: Set End at current playhead
        if (btnSetEndNow) {
            btnSetEndNow.addEventListener('click', () => {
                if (!currentTrackDuration || !previewAudioElement) return;
                const cur = parseFloat(previewAudioElement.currentTime.toFixed(1));
                const startSec = parseFloat(fxTrimStart.value) || 0;
                fxTrimEnd.value = Math.max(cur, startSec);
                lastRenderedPreviewSignature = null;
                updateTrimmerUIFromInputs();
            });
        }

        // Quick action: Reset Full
        if (btnResetTrim) {
            btnResetTrim.addEventListener('click', () => {
                if (!currentTrackDuration) return;
                fxTrimStart.value = 0;
                fxTrimEnd.value = currentTrackDuration.toFixed(1);
                lastRenderedPreviewSignature = null;
                updateTrimmerUIFromInputs();
            });
        }

        // Quick action: Play Trimmed Selection Only
        if (btnPreviewSelection) {
            btnPreviewSelection.addEventListener('click', async () => {
                if (!previewAudioElement || !previewAudioElement.src) return;
                const startSec = parseFloat(fxTrimStart.value) || 0;
                const endSec = parseFloat(fxTrimEnd.value) || currentTrackDuration;
                if (endSec <= startSec) return;

                previewAudioElement.currentTime = startSec;
                isPreviewingTrimOnly = true;
                try {
                    await previewAudioElement.play();
                    previewStatus.textContent = `Playing trimmed selection (${formatTime(startSec)} - ${formatTime(endSec)})...`;
                    updatePreviewPlayBtnState(true);
                } catch (err) {
                    console.error(err);
                }
            });
        }
    }

    setupTrimmerEvents();

    if (previewSeekSlider) {
        previewSeekSlider.addEventListener('input', (e) => {
            if (previewAudioElement && previewAudioElement.duration) {
                const targetTime = (parseFloat(e.target.value) / 100) * previewAudioElement.duration;
                previewAudioElement.currentTime = targetTime;
                previewCurrentTime.textContent = formatTime(targetTime);
            }
        });
    }

    // FX Controls interactivity
    fxEnable8d.addEventListener('change', (e) => {
        if (e.target.checked) {
            fx8dSpeedContainer.classList.remove('hidden');
        } else {
            fx8dSpeedContainer.classList.add('hidden');
        }
    });

    fx8dSpeed.addEventListener('input', (e) => {
        fx8dSpeedVal.textContent = parseFloat(e.target.value).toFixed(2) + ' Hz';
    });

    fxEnableReverb.addEventListener('change', (e) => {
        if (e.target.checked) {
            reverbControls.classList.remove('hidden');
        } else {
            reverbControls.classList.add('hidden');
        }
    });

    if (fxReverbRoomSize) {
        fxReverbRoomSize.addEventListener('input', (e) => {
            if (fxReverbSizeVal) fxReverbSizeVal.textContent = e.target.value + '%';
            lastRenderedPreviewSignature = null;
        });
    }

    fxReverbMix.addEventListener('input', (e) => {
        fxReverbMixVal.textContent = e.target.value + '%';
        lastRenderedPreviewSignature = null;
    });

    unlockReverbBtn.addEventListener('click', () => {
        isReverbUnlocked = !isReverbUnlocked;
        if (isReverbUnlocked) {
            fxReverbMix.max = '200';
            unlockReverbBtn.classList.add('unlocked');
            unlockReverbBtn.textContent = 'Unlocked (Max 200%)';
        } else {
            fxReverbMix.max = '100';
            if (parseInt(fxReverbMix.value) > 100) {
                fxReverbMix.value = '100';
                fxReverbMixVal.textContent = '100%';
            }
            unlockReverbBtn.classList.remove('unlocked');
            unlockReverbBtn.textContent = I18n.t('unlock200');
        }
        lastRenderedPreviewSignature = null;
    });

    fxGain.addEventListener('input', (e) => {
        fxGainVal.textContent = e.target.value + '%';
        lastRenderedPreviewSignature = null;
    });

    function getSelectedFxOptions() {
        const settings = SettingsManager.loadSettings();
        const trimmerActive = settings.betaFeatures && settings.betaFeatures.trimmerEnabled;
        return {
            enable8D: fxEnable8d.checked,
            speed8D: parseFloat(fx8dSpeed.value) || 0.2,
            enableReverb: fxEnableReverb.checked,
            reverbType: document.getElementById('fx-reverb-type').value,
            reverbRoomSize: parseFloat(fxReverbRoomSize ? fxReverbRoomSize.value : 60) || 60,
            reverbMix: parseFloat(fxReverbMix.value) || 45,
            trimStart: trimmerActive ? (parseFloat(document.getElementById('fx-trim-start').value) || 0) : 0,
            trimEnd: trimmerActive ? (parseFloat(document.getElementById('fx-trim-end').value) || 0) : 0,
            fadeIn: trimmerActive ? (parseFloat(document.getElementById('fx-fade-in').value) || 0) : 0,
            fadeOut: trimmerActive ? (parseFloat(document.getElementById('fx-fade-out').value) || 0) : 0,
            gain: parseFloat(fxGain.value) || 100
        };
    }

    function updatePreviewPlayBtnState(isPlaying) {
        if (isPlaying) {
            previewPlayBtn.innerHTML = `<i data-lucide="pause"></i> <span>${I18n.t('pausePreview')}</span>`;
        } else {
            if (previewAudioElement && previewAudioElement.src && previewAudioElement.currentTime > 0 && !previewAudioElement.ended) {
                previewPlayBtn.innerHTML = `<i data-lucide="play"></i> <span>${I18n.t('playPreview')}</span>`;
            } else {
                previewPlayBtn.innerHTML = `<i data-lucide="play"></i> <span>${I18n.t('previewRemix')}</span>`;
            }
        }
        lucide.createIcons();
    }

    // Full Preview Audio Controller
    previewPlayBtn.addEventListener('click', async () => {
        if (!currentRemixTarget) return;

        if (miniPlayerAudio && !miniPlayerAudio.paused) {
            miniPlayerAudio.pause();
            updateMiniPlayerState(false);
        }

        // 1. If currently playing, simply pause
        if (previewAudioElement && !previewAudioElement.paused) {
            previewAudioElement.pause();
            return;
        }

        // Get current selected semitones and FX
        const isDirectMode = modeDirectTrackRadio && modeDirectTrackRadio.checked;
        const checkedChips = document.querySelectorAll('.remix-chip-checkbox:checked');
        let semitone = 0;
        if (!isDirectMode && checkedChips.length > 0) {
            semitone = parseInt(checkedChips[0].value) || 0;
        }
        const fxOptions = getSelectedFxOptions();
        const currentSignature = JSON.stringify({ isDirectMode, semitone, fxOptions, filename: currentRemixTarget.name, size: currentRemixTarget.size });

        // 2. If already rendered with identical settings, just resume playback!
        if (previewAudioElement && previewAudioElement.src && lastRenderedPreviewSignature === currentSignature) {
            previewAudioElement.play();
            return;
        }

        // 3. Otherwise, render full preview with trimming & effects applied
        previewPlayBtn.disabled = true;
        previewPlayBtn.innerHTML = `<div class="spinner"></div> <span>${I18n.t('renderingPreview')}</span>`;
        previewStatus.textContent = I18n.t('renderingPreview');

        try {
            const arrayBuffer = await currentRemixTarget.arrayBuffer();
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            // Render full track using AudioEffectsEngine (Reverb is processed before 8D!)
            const renderedBuffer = await AudioEffectsEngine.renderTrack(audioBuffer, semitone, fxOptions);

            // Encode to WAV Blob for instant seekable playback in browser
            const wavBlob = WavEncoder.encode(renderedBuffer);

            if (previewBlobUrl) {
                URL.revokeObjectURL(previewBlobUrl);
            }
            previewBlobUrl = URL.createObjectURL(wavBlob);
            lastRenderedPreviewSignature = currentSignature;

            previewAudioElement.src = previewBlobUrl;
            await previewAudioElement.play();

            previewStatus.textContent = isDirectMode
                ? `Playing preview (Direct track mode) • Reverb -> 8D`
                : `Playing preview (${semitone >= 0 ? '+' : ''}${semitone} st) • Reverb -> 8D`;
        } catch (err) {
            console.error(err);
            previewStatus.textContent = 'Preview error: ' + err.message;
            updatePreviewPlayBtnState(false);
        } finally {
            previewPlayBtn.disabled = false;
            updatePreviewPlayBtnState(!previewAudioElement.paused);
        }
    });

    // Generate Remixes or Apply Directly to Current Track
    generateRemixBtn.addEventListener('click', async () => {
        if (!currentRemixTarget) return;

        const isDirectMode = modeDirectTrackRadio && modeDirectTrackRadio.checked;

        // MODE 1: APPLY CHANGES DIRECTLY TO CURRENT TRACK
        if (isDirectMode) {
            generateRemixBtn.disabled = true;
            generateRemixBtn.innerHTML = `<div class="spinner"></div> ${I18n.t('processing')}`;

            const fxOptions = getSelectedFxOptions();
            const config = SettingsManager.getActiveConfig();
            const isMp3 = config.audioFormat === 'mp3-320kbps';
            const ext = isMp3 ? '.mp3' : '.wav';
            const currentName = currentRemixQueueItem ? (currentRemixQueueItem.resultName || currentRemixQueueItem.file.name) : currentRemixTarget.name;
            const baseName = currentName.replace(/\.[^/.]+$/, "");
            const updatedFileName = `${baseName}${ext}`;

            try {
                const audioSource = (currentRemixQueueItem && currentRemixQueueItem.resultBlob) || currentRemixTarget;
                const arrayBuffer = await (audioSource instanceof Blob ? audioSource.arrayBuffer() : audioSource.arrayBuffer());
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
                const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

                const rendered = await AudioEffectsEngine.renderTrack(audioBuffer, 0, fxOptions);
                let blob;
                if (isMp3) {
                    blob = await Mp3Encoder.encode(rendered, 320);
                } else {
                    blob = WavEncoder.encode(rendered);
                }

                const updatedFile = new File([blob], updatedFileName, { type: isMp3 ? 'audio/mpeg' : 'audio/wav' });

                // Find corresponding queue item by ID for accuracy after renames
                const targetItem = currentRemixQueueItem
                    ? queue.find(q => q.id === currentRemixQueueItem.id)
                    : queue.find(q => q.file === currentRemixTarget || q.file.name === currentRemixTarget.name);
                if (targetItem) {
                    targetItem.file = updatedFile;
                    targetItem.resultBlob = blob;
                    targetItem.resultName = updatedFileName;
                    targetItem.status = 'completed';

                    const itemEl = targetItem.element;
                    if (itemEl) {
                        const nameEl = itemEl.querySelector('.file-name');
                        const metaEl = itemEl.querySelector('.file-meta');
                        const progressBar = itemEl.querySelector('.progress-bar');
                        const statusIconSuccess = itemEl.querySelector('.status-icon.success');
                        const downloadBtn = itemEl.querySelector('.download-single-btn');

                        if (nameEl) nameEl.textContent = targetItem.folderName ? `[${targetItem.folderName}] ${updatedFileName}` : updatedFileName;
                        if (metaEl) {
                            metaEl.textContent = `${formatBytes(blob.size)} • ${I18n.t('completed')} (FX)`;
                            metaEl.style.color = 'var(--success)';
                        }
                        if (progressBar) progressBar.style.width = '100%';
                        if (statusIconSuccess) statusIconSuccess.classList.remove('hidden');
                        if (downloadBtn) {
                            downloadBtn.classList.remove('hidden');
                            downloadBtn.onclick = () => {
                                const a = document.createElement('a');
                                a.href = URL.createObjectURL(blob);
                                a.download = updatedFileName;
                                a.click();
                            };
                        }
                    }

                    // Update processedResults list for batch ZIP
                    const existingResIdx = processedResults.findIndex(r => r.name === updatedFileName || r.name === currentName);
                    if (existingResIdx >= 0) {
                        processedResults[existingResIdx] = { blob, name: updatedFileName, folderName: targetItem.folderName };
                    } else {
                        processedResults.push({ blob, name: updatedFileName, folderName: targetItem.folderName });
                    }
                    resultActions.classList.remove('hidden');

                    // Refresh mini player if this track is currently loaded
                    if (activePlayingItem && activePlayingItem.id === targetItem.id) {
                        if (activeAudioUrl) {
                            URL.revokeObjectURL(activeAudioUrl);
                            activeAudioUrl = null;
                        }
                        activeAudioUrl = URL.createObjectURL(blob);
                        miniPlayerAudio.src = activeAudioUrl;
                        miniPlayerAudio.load();
                        if (miniPlayerTitle) miniPlayerTitle.textContent = updatedFileName;
                        if (miniPlayerSeekSlider) miniPlayerSeekSlider.value = 0;
                        if (miniPlayerCurrentTime) miniPlayerCurrentTime.textContent = '0:00';
                        updateMiniPlayerState(false);
                        if (targetItem.element) {
                            targetItem.element.classList.remove('is-playing');
                            const pBtn = targetItem.element.querySelector('.play-single-btn');
                            if (pBtn) {
                                pBtn.innerHTML = '<i data-lucide="play"></i>';
                                pBtn.classList.remove('active');
                            }
                        }
                        lucide.createIcons();
                    }
                }

                closeRemixStudio();
            } catch (err) {
                console.error('Error applying changes directly to track:', err);
                alert('Failed to apply changes: ' + err.message);
            } finally {
                generateRemixBtn.disabled = false;
                generateRemixBtn.innerHTML = `<i data-lucide="check"></i> <span>${I18n.t('applyToCurrentTrack')}</span>`;
                lucide.createIcons();
            }
            return;
        }

        // MODE 2: GENERATE MULTIPLE REMIX VARIATIONS INTO QUEUE
        const checkedChips = Array.from(document.querySelectorAll('.remix-chip-checkbox:checked'));
        const originalCheckbox = document.getElementById('preset-original');

        const variations = [];
        if (originalCheckbox.checked) {
            variations.push({ name: 'Original', semitones: 0 });
        }
        checkedChips.forEach(chip => {
            variations.push({
                name: chip.getAttribute('data-name'),
                semitones: parseInt(chip.value)
            });
        });

        if (variations.length === 0) {
            alert('Please select at least one variation.');
            return;
        }

        generateRemixBtn.disabled = true;
        generateRemixBtn.innerHTML = '<div class="spinner"></div> Rendering...';

        const fxOptions = getSelectedFxOptions();
        const currentName = currentRemixQueueItem ? (currentRemixQueueItem.resultName || currentRemixQueueItem.file.name) : currentRemixTarget.name;
        const baseName = currentName.replace(/\.[^/.]+$/, "");
        const config = SettingsManager.getActiveConfig();
        const isMp3 = config.audioFormat === 'mp3-320kbps';
        const ext = isMp3 ? '.mp3' : '.wav';

        try {
            const audioSource = (currentRemixQueueItem && currentRemixQueueItem.resultBlob) || currentRemixTarget;
            const arrayBuffer = await (audioSource instanceof Blob ? audioSource.arrayBuffer() : audioSource.arrayBuffer());
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            for (const v of variations) {
                const isPlainOriginal = v.semitones === 0 && !fxOptions.enable8D && !fxOptions.enableReverb && fxOptions.trimStart === 0 && fxOptions.trimEnd === 0 && fxOptions.fadeIn === 0 && fxOptions.fadeOut === 0 && fxOptions.gain === 100;

                let blob;
                let newFileName = `${baseName}_${v.name.replace(/\s+/g, '')}${ext}`;

                if (isPlainOriginal) {
                    // Plain original: standard encode
                    if (isMp3) {
                        blob = await Mp3Encoder.encode(audioBuffer, 320);
                    } else {
                        blob = WavEncoder.encode(audioBuffer);
                    }
                } else {
                    // Render through OfflineAudioContext
                    const rendered = await AudioEffectsEngine.renderTrack(audioBuffer, v.semitones, fxOptions);
                    if (isMp3) {
                        blob = await Mp3Encoder.encode(rendered, 320);
                    } else {
                        blob = WavEncoder.encode(rendered);
                    }
                }

                const remixFile = new File([blob], newFileName, { type: isMp3 ? 'audio/mpeg' : 'audio/wav' });
                addToFileList(remixFile, null, { blob, name: newFileName });
            }

            // Remove original audio if checkbox is checked — find by unique queue item ID
            if (deleteOriginalRemixCheckbox && deleteOriginalRemixCheckbox.checked) {
                const targetIdx = currentRemixQueueItem
                    ? queue.findIndex(q => q.id === currentRemixQueueItem.id)
                    : queue.findIndex(q => q.file === currentRemixTarget || q.file.name === currentRemixTarget.name);
                if (targetIdx !== -1) {
                    const targetItem = queue[targetIdx];
                    // Stop mini player if playing this track
                    if (activePlayingItem && activePlayingItem.id === targetItem.id) {
                        stopMiniPlayer();
                    }
                    if (targetItem.element && targetItem.element.parentNode) {
                        targetItem.element.parentNode.removeChild(targetItem.element);
                    }
                    const resIdx = processedResults.findIndex(r => r.name === targetItem.file.name || (targetItem.resultName && r.name === targetItem.resultName));
                    if (resIdx !== -1) {
                        processedResults.splice(resIdx, 1);
                    }
                    queue.splice(targetIdx, 1);
                }
            }

            updateFileCount();
            if (queue.length === 0) {
                processSection.classList.add('hidden');
                resultActions.classList.add('hidden');
            }
            closeRemixStudio();
        } catch (err) {
            console.error('Error generating remixes:', err);
            alert('Failed to generate remixes: ' + err.message);
        } finally {
            generateRemixBtn.disabled = false;
            generateRemixBtn.innerHTML = `<i data-lucide="sparkles"></i> <span>${I18n.t('generateRemix')}</span>`;
            lucide.createIcons();
        }
    });

    // --- Watermark Direct Opener for Image Item ---
    function loadImageForPreview(file, taskId = 'custom', fromMyFiles = false) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                activePreviewArtworkImage = { img, name: file.name, id: taskId, file, fromMyFiles };
                resolve(img);
            };
            img.onerror = () => {
                resolve(null);
            };
            img.src = URL.createObjectURL(file);
        });
    }

    function updateArtworkDropdown() {
        if (!watermarkArtSelect) return;
        watermarkArtSelect.innerHTML = '';
        const imageTasks = queue.filter(q => q.file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(q.file.name));

        if (imageTasks.length > 0) {
            imageTasks.forEach(task => {
                const opt = document.createElement('option');
                opt.value = task.id;
                opt.textContent = `📁 [My Files] ${task.file.name}`;
                if (activePreviewArtworkImage && activePreviewArtworkImage.id === task.id) {
                    opt.selected = true;
                }
                watermarkArtSelect.appendChild(opt);
            });

            if (activePreviewArtworkImage && activePreviewArtworkImage.id && activePreviewArtworkImage.id.startsWith('custom_upload_')) {
                const customOpt = document.createElement('option');
                customOpt.value = activePreviewArtworkImage.id;
                customOpt.textContent = `🖼️ ${activePreviewArtworkImage.name}`;
                customOpt.selected = true;
                watermarkArtSelect.appendChild(customOpt);
            }

            const demoOpt = document.createElement('option');
            demoOpt.value = 'demo';
            demoOpt.textContent = `🎵 ${I18n.t('demoVinyl')}`;
            if (activePreviewArtworkImage && activePreviewArtworkImage.id === 'demo') {
                demoOpt.selected = true;
            }
            watermarkArtSelect.appendChild(demoOpt);

            // Auto-select first image if no artwork is active or active is demo
            if (!activePreviewArtworkImage || activePreviewArtworkImage.id === 'demo') {
                loadImageForPreview(imageTasks[0].file, imageTasks[0].id, true).then(() => {
                    watermarkArtSelect.value = imageTasks[0].id;
                    renderWatermarkPreview();
                });
            }
        } else {
            if (activePreviewArtworkImage && activePreviewArtworkImage.id && activePreviewArtworkImage.id.startsWith('custom_upload_')) {
                const customOpt = document.createElement('option');
                customOpt.value = activePreviewArtworkImage.id;
                customOpt.textContent = `🖼️ ${activePreviewArtworkImage.name}`;
                customOpt.selected = true;
                watermarkArtSelect.appendChild(customOpt);
            }
            const demoOpt = document.createElement('option');
            demoOpt.value = 'demo';
            demoOpt.textContent = `🎵 ${I18n.t('demoVinyl')}`;
            if (!activePreviewArtworkImage || activePreviewArtworkImage.id === 'demo') {
                demoOpt.selected = true;
            }
            watermarkArtSelect.appendChild(demoOpt);
        }
    }

    async function openWatermarkEditorForImage(file) {
        const matchedTask = queue.find(q => q.file === file || (q.file.name === file.name && q.file.size === file.size));
        const taskId = matchedTask ? matchedTask.id : 'current_art_' + Date.now();

        await loadImageForPreview(file, taskId, true);

        populateSettingsUI();
        settingsModal.classList.remove('hidden');

        // Switch to logo tab
        const logoTabBtn = document.querySelector('.tab-btn[data-tab="tab-logo"]');
        if (logoTabBtn) logoTabBtn.click();

        if (watermarkArtSelect) watermarkArtSelect.value = taskId;
        renderWatermarkPreview();
    }

    function renderWatermarkPreview() {
        if (!watermarkPreviewCanvas) return;
        const ctx = watermarkPreviewCanvas.getContext('2d');
        const w = watermarkPreviewCanvas.width;
        const h = watermarkPreviewCanvas.height;

        // Update active art label badge
        if (activeArtLabel) {
            if (activePreviewArtworkImage && activePreviewArtworkImage.img) {
                if (activePreviewArtworkImage.fromMyFiles) {
                    activeArtLabel.textContent = `📁 [My Files] ${activePreviewArtworkImage.name}`;
                    activeArtLabel.className = 'active-art-badge from-files';
                } else {
                    activeArtLabel.textContent = `🖼️ ${activePreviewArtworkImage.name}`;
                    activeArtLabel.className = 'active-art-badge custom-art';
                }
            } else {
                activeArtLabel.textContent = `🎵 ${I18n.t('demoVinyl')}`;
                activeArtLabel.className = 'active-art-badge demo-art';
            }
        }

        // 1. Draw artwork background
        if (activePreviewArtworkImage && activePreviewArtworkImage.img) {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(0, 0, w, h);

            const art = activePreviewArtworkImage.img;
            const artRatio = art.width / (art.height || 1);
            let drawW = w;
            let drawH = h;
            let drawX = 0;
            let drawY = 0;

            if (artRatio > 1) {
                drawH = w / artRatio;
                drawY = (h - drawH) / 2;
            } else if (artRatio < 1) {
                drawW = h * artRatio;
                drawX = (w - drawW) / 2;
            }

            ctx.drawImage(art, drawX, drawY, drawW, drawH);
        } else {
            // Draw demo vinyl background
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(0, 0, w, h);

            ctx.fillStyle = '#334155';
            const cellSize = 15;
            for (let x = 0; x < w; x += cellSize) {
                for (let y = 0; y < h; y += cellSize) {
                    if ((x / cellSize + y / cellSize) % 2 === 0) {
                        ctx.fillRect(x, y, cellSize, cellSize);
                    }
                }
            }

            // Draw sample vinyl record graphic in preview
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 70, 0, Math.PI * 2);
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.strokeStyle = '#6366f1';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(w / 2, h / 2, 24, 0, Math.PI * 2);
            ctx.fillStyle = '#ec4899';
            ctx.fill();
        }

        // 2. Apply watermark with free drag coordinates
        const tempConfig = {
            enabled: logoEnableToggle.checked,
            sizePercent: parseInt(logoSizeSlider.value) || 20,
            position: logoPositionSelect.value,
            offsetX: 4,
            offsetY: 4,
            freeX: parseFloat(logoFreeX ? logoFreeX.value : 75) || 75,
            freeY: parseFloat(logoFreeY ? logoFreeY.value : 75) || 75,
            opacity: (parseInt(logoOpacitySlider.value) || 90) / 100,
            invertColor: logoInvertColor ? logoInvertColor.checked : false,
            allowOverflow: logoAllowOverflow ? logoAllowOverflow.checked : false
        };

        if (window.WatermarkEngine && WatermarkEngine.isLoaded) {
            currentLogoBbox = WatermarkEngine.applyToCanvas(watermarkPreviewCanvas, tempConfig, true);
        } else {
            currentLogoBbox = null;
            if (tempConfig.enabled) {
                ctx.fillStyle = 'rgba(255,255,255,0.85)';
                ctx.font = '12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('[ Upload logo to preview ]', w / 2, h - 20);
            }
        }
    }

    // --- State & Settings Synchronization ---
    function initFromSettings() {
        const settings = SettingsManager.loadSettings();

        // Language
        I18n.setLanguage(settings.language || 'en');

        // Zip filename
        if (zipNameInput) {
            zipNameInput.value = settings.zipFilename || 'Musicable';
        }

        updateHeaderBadges();
        populateSettingsUI();
    }

    function populateSettingsUI() {
        const settings = SettingsManager.loadSettings();
        const isCustom = settings.activePreset === 'custom';

        presetRadioDefault.checked = !isCustom;
        presetRadioCustom.checked = isCustom;

        if (isCustom) {
            customPresetFields.classList.remove('hidden');
        } else {
            customPresetFields.classList.add('hidden');
        }

        const custom = settings.presets.custom || {};
        customAudioFormat.value = custom.audioFormat || 'wav-16bit';
        customImageFormat.value = custom.imageFormat || 'png';
        customImageSize.value = custom.imageSize || '2048x2048';
        if (customImageSizeMethod) {
            customImageSizeMethod.value = custom.imageSizeMethod || 'stretch';
        }
        customWidth.value = custom.customWidth || 2048;
        customHeight.value = custom.customHeight || 2048;

        updateImageSizeVisibility();

        // Language radios
        langRadios.forEach(r => {
            r.checked = (r.value === settings.language);
        });

        // Watermark settings
        const logo = settings.logoSettings || {};
        logoEnableToggle.checked = !!logo.enabled;
        logoSizeSlider.value = logo.sizePercent || 20;
        logoSizeVal.textContent = (logo.sizePercent || 20) + '%';
        logoPositionSelect.value = logo.position || 'bottom-right';

        if (logoFreeX) {
            logoFreeX.value = logo.freeX !== undefined ? logo.freeX : 75;
            logoFreeXVal.textContent = (logo.freeX !== undefined ? logo.freeX : 75) + '%';
        }
        if (logoFreeY) {
            logoFreeY.value = logo.freeY !== undefined ? logo.freeY : 75;
            logoFreeYVal.textContent = (logo.freeY !== undefined ? logo.freeY : 75) + '%';
        }
        if (logo.position === 'custom') {
            freePosControls.classList.remove('hidden');
        } else {
            freePosControls.classList.add('hidden');
        }

        const opacityPercent = Math.round((logo.opacity !== undefined ? logo.opacity : 0.9) * 100);
        logoOpacitySlider.value = opacityPercent;
        logoOpacityVal.textContent = opacityPercent + '%';

        if (logoInvertColor) {
            logoInvertColor.checked = !!logo.invertColor;
        }
        if (logoAllowOverflow) {
            logoAllowOverflow.checked = !!logo.allowOverflow;
            updateOverflowSlidersRange(!!logo.allowOverflow);
        }

        // Beta Features toggles
        const beta = settings.betaFeatures || {};
        if (betaToggleTrimmer) {
            betaToggleTrimmer.checked = !!beta.trimmerEnabled;
        }
        if (betaToggleLabMode) {
            betaToggleLabMode.checked = !!beta.labModeEnabled;
        }
        syncBetaFeaturesUI(beta);

        updateArtworkDropdown();
        renderWatermarkPreview();
        lucide.createIcons();
    }

    function updateHeaderBadges() {
        const config = SettingsManager.getActiveConfig();
        if (badgeAudio) {
            badgeAudio.textContent = config.audioFormat === 'mp3-320kbps' ? 'MP3 320kbps' : 'WAV 44.1kHz 16-bit';
        }
        if (badgeImage) {
            const fmt = (config.imageFormat || 'png').toUpperCase();
            if (config.imageSizeMethod === 'none') {
                badgeImage.textContent = `${fmt} Original`;
            } else {
                badgeImage.textContent = `${fmt} ${config.width}x${config.height}px`;
            }
        }
    }

    // --- Helpers ---
    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    function getMimeType(path) {
        const ext = path.split('.').pop().toLowerCase();
        const mimes = {
            'mp3': 'audio/mpeg',
            'wav': 'audio/wav',
            'ogg': 'audio/ogg',
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'webp': 'image/webp'
        };
        return mimes[ext] || 'application/octet-stream';
    }
});
/* 2026 Copyrighted by tienanh109 */
