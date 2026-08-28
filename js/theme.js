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


function updateDarkMode() {
    document.body.classList.toggle('dark-mode', settings.darkMode);
}