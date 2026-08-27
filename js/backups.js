
// --- SETTINGS EXPORT / IMPORT ---
// Export dumps every key currently in localStorage (not just the app's own
// settings key) so anything saved in this browser comes along in the file.
const exportSettingsBtn = document.getElementById('export-settings-btn');
const importSettingsBtn = document.getElementById('import-settings-btn');
const importSettingsInput = document.getElementById('import-settings-input');
const backupStatus = document.getElementById('backup-status');

if (exportSettingsBtn) {
    exportSettingsBtn.addEventListener('click', () => {
        try {
            const allData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                allData[key] = localStorage.getItem(key);
            }

            const exportPayload = {
                exportedFrom: 'Game Station',
                exportedAt: new Date().toISOString(),
                localStorage: allData
            };

            const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gamestation-settings-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            if (backupStatus) backupStatus.innerText = 'Settings exported successfully.';
        } catch (err) {
            console.error('Settings export failed:', err);
            if (backupStatus) backupStatus.innerText = 'Export failed — see console for details.';
        }
    });
}

if (importSettingsBtn && importSettingsInput) {
    importSettingsBtn.addEventListener('click', () => importSettingsInput.click());

    importSettingsInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const parsed = JSON.parse(event.target.result);
                // Support both the wrapped export format above and a raw
                // { key: value } localStorage dump, just in case.
                const dataToImport = (parsed && typeof parsed === 'object' && parsed.localStorage)
                    ? parsed.localStorage
                    : parsed;

                if (!dataToImport || typeof dataToImport !== 'object' || Array.isArray(dataToImport)) {
                    throw new Error('Invalid settings file format.');
                }

                Object.keys(dataToImport).forEach(key => {
                    localStorage.setItem(key, dataToImport[key]);
                });

                if (backupStatus) backupStatus.innerText = 'Settings imported! Reloading…';
                setTimeout(() => location.reload(), 700);
            } catch (err) {
                console.error('Settings import failed:', err);
                if (backupStatus) backupStatus.innerText = 'Import failed — that file is not a valid settings export.';
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
}