/* 2026 Copyrighted by tienanh109 */
/**
 * Main Application Logic
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const processSection = document.getElementById('process-section');
    const fileList = document.getElementById('file-list');
    const fileCountSpan = document.getElementById('file-count');
    const processBtn = document.getElementById('process-btn');
    const clearBtn = document.getElementById('clear-btn');
    const resultActions = document.getElementById('result-actions');
    const downloadZipBtn = document.getElementById('download-zip-btn');
    const fileItemTemplate = document.getElementById('file-item-template');
    const creditsBtn = document.getElementById('credits-btn');
    const creditsModal = document.getElementById('credits-modal');
    const closeModal = document.getElementById('close-modal');

    const processor = new FileProcessor();
    let queue = [];
    let processedResults = [];

    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Credits Modal Logic
    creditsBtn.addEventListener('click', () => {
        creditsModal.classList.remove('hidden');
    });

    closeModal.addEventListener('click', () => {
        creditsModal.classList.add('hidden');
    });

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === creditsModal) {
            creditsModal.classList.add('hidden');
        }
    });

    // --- Event Listeners ---

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
        queue = [];
        processedResults = [];
        fileList.innerHTML = '';
        processSection.classList.add('hidden');
        resultActions.classList.add('hidden');
    });

    downloadZipBtn.addEventListener('click', downloadAllAsZip);

    // --- File Handling ---

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
            filesPreviewInfo.textContent = 'Đang đọc...';
            
            JSZip.loadAsync(zipFile).then(zip => {
                let fileNames = [];
                for (const [path, entry] of Object.entries(zip.files)) {
                    if (!entry.dir) fileNames.push(path.split('/').pop());
                }
                const count = fileNames.length;
                const sample = fileNames.slice(0, 3).join(', ') + (count > 3 ? `,... (+${count - 3} file)` : '');
                filesPreviewInfo.textContent = `Chứa ${count} file: ${sample}`;
            }).catch(() => {
                filesPreviewInfo.textContent = 'Không thể xem trước nội dung.';
            });
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = `Bài hát ${baseName}`; 
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
                    const folderName = data.input.value.trim() || 'Thư mục không tên';
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

    function addToFileList(file, folderName = null) {
        // Prevent duplicates
        if (queue.find(f => f.file.name === file.name && f.file.size === file.size && f.folderName === folderName)) return;

        const id = Math.random().toString(36).substr(2, 9);
        const clone = fileItemTemplate.content.cloneNode(true);
        const item = clone.querySelector('.file-item');

        item.dataset.id = id;
        item.querySelector('.file-name').textContent = folderName ? `[${folderName}] ${file.name}` : file.name;
        item.querySelector('.file-meta').textContent = formatBytes(file.size);

        const fileIcon = item.querySelector('.file-icon i');
        if (file.type.startsWith('audio/')) {
            fileIcon.setAttribute('data-lucide', 'music');
        } else if (file.type.startsWith('image/')) {
            fileIcon.setAttribute('data-lucide', 'image');
        }

        fileList.appendChild(item);
        lucide.createIcons();

        queue.push({
            id,
            file,
            element: item,
            status: 'pending',
            folderName: folderName
        });
    }

    function updateFileCount() {
        fileCountSpan.textContent = queue.length;
    }

    // --- Processing ---

    async function processAllFiles() {
        if (queue.length === 0) return;

        processBtn.disabled = true;
        clearBtn.disabled = true;
        processedResults = [];

        // Parallel processing with a limit (e.g., 2 files at a time to stay safe)
        const limit = 2;
        const tasks = [...queue];

        const workers = Array(Math.min(limit, tasks.length)).fill(null).map(async () => {
            while (tasks.length > 0) {
                const task = tasks.shift();
                if (task.status === 'completed') continue;
                await processOne(task);
            }
        });

        await Promise.all(workers);

        processBtn.disabled = false;
        clearBtn.disabled = false;
        resultActions.classList.remove('hidden');

        // Final layout update for icons
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
            spinner.classList.add('hidden');
            statusIconSuccess.classList.remove('hidden');

            // Show single download
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

    async function downloadAllAsZip() {
        if (processedResults.length === 0) return;

        const zip = new JSZip();
        processedResults.forEach(res => {
            if (res.folderName) {
                zip.folder(res.folderName).file(res.name, res.blob);
            } else {
                zip.file(res.name, res.blob);
            }
        });

        downloadZipBtn.disabled = true;
        downloadZipBtn.innerHTML = '<div class="spinner"></div> Compressing...';

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Musicable.zip";
        a.click();
        URL.revokeObjectURL(url);

        downloadZipBtn.disabled = false;
        downloadZipBtn.innerHTML = '<i data-lucide="download"></i> Download Musicable.zip';
        lucide.createIcons();
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
