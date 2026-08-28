(function () {
    const dialog = document.getElementById('instructions-window');
    if (!dialog) return;

    const okBtn = document.getElementById('instructions-ok-btn');
    const closeBtn = dialog.querySelector('.btn-close');

    if (okBtn && closeBtn) {
        okBtn.addEventListener('click', () => closeBtn.click());
    }
})();
