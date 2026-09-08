(function () {
    const dialog = document.getElementById('instructions-window');
    if (settings.showWlc){
        dialog.innerHTML = "<div class="title-bar"><div class="title-bar-text">Welcome</div><div class="title-bar-controls"> </div></div><div class="window-body has-space" style="padding: 14px; box-sizing: border-box;"><p style="margin: 0 0 10px 0;">The desktop starts empty. Here's how to get around:</p><ul style="margin: 0 0 14px 0; padding-left: 20px;"><li>Double-click an icon on the desktop to open its window.</li><li>Drag a window by its title bar to move it.</li><li>Use the taskbar at the bottom to switch between open windows.</li></ul><div style="display: flex; justify-content: flex-end;"><button id="instructions-ok-btn" style="padding: 6px 22px; cursor: pointer;">OK</button></div></div>"
        const closeBtn = dialog.querySelector('.btn-close');
        const okBtn = document.getElementById('instructions-ok-btn');
        if (!okBtn || !closeBtn) return;

        okBtn.addEventListener('click', () => {
            settings.showWlc = false;
            closeBtn.click();
            saveSettings();
        });
    } else {
        return
    }
})();