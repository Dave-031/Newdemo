(function () {
    const dialog = document.getElementById('instructions-window');
    const closeBtn = dialog.querySelector('.btn-close');
    if (settings.showWlc){

        dialog.style.display = 'block';

        const okBtn = document.getElementById('instructions-ok-btn');
        if (!okBtn || !closeBtn) return;

        okBtn.addEventListener('click', () => {
            settings.showWlc = false;
            closeBtn.click();
            saveSettings();
        });
    } else {
        taskBtn.remove();
    }
})();