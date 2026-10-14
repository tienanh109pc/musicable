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

    const processor = new FileProcessor();
    let queue = [];
    let processedResults = [];

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

        for (const file of files) {
            if (file.name.toLowerCase().endsWith('.zip')) {
                await handleZipFile(file);
            } else {
                addToFileList(file);
            }
        }

        updateFileCount();
    }

    async function handleZipFile(zipFile) {
        try {
            const zip = await JSZip.loadAsync(zipFile);
            for (const [path, entry] of Object.entries(zip.files)) {
                if (!entry.dir) {
                    const blob = await entry.async('blob');
                    const file = new File([blob], path.split('/').pop(), { type: getMimeType(path) });
                    addToFileList(file);
                }
            }
        } catch (e) {
            console.error('Error reading ZIP:', e);
            alert('Lỗi khi đọc tệp ZIP: ' + zipFile.name);
        }
    }

    function addToFileList(file) {
        // Prevent duplicates
        if (queue.find(f => f.file.name === file.name && f.file.size === file.size)) return;

        const id = Math.random().toString(36).substr(2, 9);
        const clone = fileItemTemplate.content.cloneNode(true);
        const item = clone.querySelector('.file-item');

        item.dataset.id = id;
        item.querySelector('.file-name').textContent = file.name;
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
            status: 'pending'
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
                name: result.newName
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

            meta.textContent = `Hoàn thành → ${result.newName}`;
            meta.style.color = 'var(--success)';
        } catch (e) {
            console.error(e);
            task.status = 'error';
            spinner.classList.add('hidden');
            statusIconError.classList.remove('hidden');
            meta.textContent = 'Lỗi: ' + e.message;
            meta.style.color = 'var(--error)';
        }
    }

    async function downloadAllAsZip() {
        if (processedResults.length === 0) return;

        const zip = new JSZip();
        processedResults.forEach(res => {
            zip.file(res.name, res.blob);
        });

        downloadZipBtn.disabled = true;
        downloadZipBtn.innerHTML = '<div class="spinner"></div> Đang nén...';

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = "Musicable.zip";
        a.click();
        URL.revokeObjectURL(url);

        downloadZipBtn.disabled = false;
        downloadZipBtn.innerHTML = '<i data-lucide="download"></i> Tải xuống Musicable.zip';
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
