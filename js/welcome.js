(function () {
    if (!settings.showWlc) return;

    const dialog = document.getElementById('instructions-window');
    if (!dialog) return;

    const okBtn = document.getElementById('instructions-ok-btn');
    const closeBtn = dialog.querySelector('.btn-close');
    if (!okBtn || !closeBtn) return;

    okBtn.addEventListener('click', () => {
        settings.showWlc = false;
        closeBtn.click();
    });
})();