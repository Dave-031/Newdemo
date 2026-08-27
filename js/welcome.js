(function () {
    const dialog = document.getElementById('instructions-window');
    if (!dialog) return;

    const taskBtn = setupWindowLogic(dialog, false);
    taskbarContainer.appendChild(taskBtn);

    const okBtn = document.getElementById('instructions-ok-btn');
    const closeBtn = dialog.querySelector('.btn-close');
    if (okBtn && closeBtn) {
        // Route OK through the same close handler the X button already has,
        // so both paths hide the window and remove its taskbar entry.
        okBtn.addEventListener('click', () => closeBtn.click());
    }

    // "Re-order Layout" wipes and rebuilds the taskbar for the standard
    // windows — re-add this button afterward if the dialog is still open.
    // Re-order Layout button disabled — listener commented out along with
    // the button itself, so this taskbar re-add no longer applies.
    // reorderBtn.addEventListener('click', () => {
    //     if (dialog.style.display !== 'none' && !taskbarContainer.contains(taskBtn)) {
    //         taskbarContainer.appendChild(taskBtn);
    //     }
    // });
})();