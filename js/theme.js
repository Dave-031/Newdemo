document.querySelectorAll('.upload-tray-btn').forEach(button => {
    button.addEventListener('click', () => {
        const matchingInput = document.querySelector(`.theme-bg-input[data-theme="${button.dataset.theme}"]`);
        if (matchingInput) matchingInput.click();
    });
});


document.querySelectorAll('.revert-bg-btn').forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const themeValue = button.dataset.theme;
        delete settings.customBackgrounds[themeValue];
        updateBackgroundStatus();
        if (settings.selectedTheme === themeValue) {
            const defaultWallpaper = wallpapers[themeValue] || '';
            document.body.style.backgroundImage = `url('${defaultWallpaper}')`;
        }
        saveSettings();
    });
});

document.querySelectorAll('.theme-bg-input').forEach(input => {
    input.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            settings.customBackgrounds[input.dataset.theme] = event.target.result;
            updateBackgroundStatus();
            if (settings.selectedTheme === input.dataset.theme) {
                document.body.style.backgroundImage = `url('${event.target.result}')`;
            }
            saveSettings();
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    });
});

// pulls the image for wallpaper
function getBackgroundForTheme(themeValue) {
    const custom = settings.customBackgrounds[themeValue];
    if (custom) return custom;
    return wallpapers[themeValue] || '';
}
// sets the custom wallpaper
function updateBackgroundStatus() {
    document.querySelectorAll('.theme-bg-status').forEach(statusEl => {
        const themeValue = statusEl.dataset.theme;
        if (settings.customBackgrounds[themeValue]) {
            statusEl.innerText = 'Custom image saved';
        } else {
            statusEl.innerText = 'Using default wallpaper';
        }
    });

    document.querySelectorAll('.theme-bg-preview').forEach(previewEl => {
        const themeValue = previewEl.dataset.theme;
        const custom = settings.customBackgrounds[themeValue];
        if (custom) {
            previewEl.src = custom;
            previewEl.style.display = 'block';
        } else {
            previewEl.style.display = 'none';
        }
    });
}
function applyTheme(themeValue) {
    settings.selectedTheme = themeValue;
    themeStylesheet.href = themeValue;
    document.body.style.backgroundImage = `url('${getBackgroundForTheme(themeValue)}')`;

    document.querySelectorAll('input[name="theme-selection-group"]').forEach(radio => {
        radio.checked = radio.value === themeValue;
    });

  const themeName = themeValue.includes('98') ? 'win98' :
                    themeValue.includes('xp') ? 'winxp' : 'win7';
  document.body.setAttribute('data-theme', themeName);

    const quickSelect = document.getElementById('quick-theme-select');
    if (quickSelect) quickSelect.value = themeValue;

    const quickSummary = document.getElementById('quick-theme-summary');
    if (quickSummary) {
        const selectedLabel = themeValue === 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@f038e8f70304229100d057b55a612b72b5848837/themes/98_theme.css'
            ? 'Windows 98'
            : themeValue === 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@f038e8f70304229100d057b55a612b72b5848837/themes/xp_theme.css'
                ? 'Windows XP'
                : 'Windows 7';
        quickSummary.innerText = `Current theme: ${selectedLabel}`;
    }

    updateBackgroundStatus();
    saveSettings();
}
function updateDarkMode() {
    document.body.classList.toggle('dark-mode', settings.darkMode);
}