// --- REPORT & RECOMMEND SUBMISSIONS (Google Apps Script API) ---
(function () {
    const GAS_API_BASE = "https://script.google.com/macros/s/AKfycbw3Y6y-0s6dLqN9gxYw1jNfB4ywmK0R94mMF5sWQhyS5yf_Df1KMpwofwbrl16ApNcdew/exec";
    const COOLDOWN_SECONDS = 15;

    function buildSubmitUrl(action, params) {
        const url = new URL(GAS_API_BASE);
        url.searchParams.set('action', action);
        Object.keys(params).forEach(function (key) {
            url.searchParams.set(key, params[key]);
        });
        return url.toString();
    }

    // Shows a brief inline message next to the button instead of an
    // alert() popup — used for validation errors only.
    function showStatus(statusEl, message) {
        if (!statusEl) return;
        statusEl.textContent = message;
        clearTimeout(statusEl._clearTimer);
        statusEl._clearTimer = setTimeout(function () {
            statusEl.textContent = '';
        }, 3000);
    }

    function showOverlay(overlayEl, textEl, message) {
        if (textEl) textEl.textContent = message;
        if (overlayEl) overlayEl.style.display = 'flex';
    }

    function hideOverlay(overlayEl) {
        if (overlayEl) overlayEl.style.display = 'none';
    }

    // Keeps the overlay up (with a live countdown) and the button disabled
    // for COOLDOWN_SECONDS, then resets both so the form can be used again.
    function startCooldown(btn, overlayEl, textEl, seconds) {
        if (btn) btn.disabled = true;
        let remaining = seconds;
        showOverlay(overlayEl, textEl, 'Please wait ' + remaining + ' seconds\u2026');

        const interval = setInterval(function () {
            remaining -= 1;
            if (remaining <= 0) {
                clearInterval(interval);
                hideOverlay(overlayEl);
                if (btn) btn.disabled = false;
            } else if (textEl) {
                textEl.textContent = 'Please wait ' + remaining + ' seconds\u2026';
            }
        }, 1000);
    }

    // Fires the GET request to the Apps Script endpoint. mode: 'no-cors' is
    // used so the request still goes out (and shows up in the Network tab)
    // even if the script isn't configured to send CORS headers back; the
    // response itself is opaque and not read.
    function submitToGAS(url, overlayEl, textEl, btn) {
        showOverlay(overlayEl, textEl, 'Submitting\u2026');
        return fetch(url, { mode: 'no-cors' })
            .catch(function () {})
            .finally(function () {
                startCooldown(btn, overlayEl, textEl, COOLDOWN_SECONDS);
            });
    }

    // --- Report a Broken Game ---
    const reportBtn = document.getElementById('report-submit-btn');
    const reportOverlay = document.getElementById('report-submit-overlay');
    const reportOverlayText = document.getElementById('report-submit-overlay-text');
    const reportStatus = document.getElementById('report-submit-status');
    if (reportBtn) {
        reportBtn.addEventListener('click', function () {
            if (reportBtn.disabled) return;

            const gameInput = document.getElementById('broken-game-name');
            const gameVal = gameInput.value.trim();
            if (!gameVal) {
                showStatus(reportStatus, 'Please enter a game name.');
                return;
            }

            const url = buildSubmitUrl('submitReport', { game: gameVal });
            submitToGAS(url, reportOverlay, reportOverlayText, reportBtn);
            gameInput.value = '';
        });
    }

    // --- Recommend a Game ---
    const recBtn = document.getElementById('recommend-submit-btn');
    const recOverlay = document.getElementById('recommend-submit-overlay');
    const recOverlayText = document.getElementById('recommend-submit-overlay-text');
    const recStatus = document.getElementById('recommend-submit-status');
    if (recBtn) {
        recBtn.addEventListener('click', function () {
            if (recBtn.disabled) return;

            const nameInput = document.getElementById('rec-game-name');
            const reasonInput = document.getElementById('rec-game-reason');
            const nameVal = nameInput.value.trim();
            const reasonVal = reasonInput.value.trim();
            if (!nameVal || !reasonVal) {
                showStatus(recStatus, 'Please fill out both fields.');
                return;
            }

            const url = buildSubmitUrl('submitRecommendation', { game: nameVal, why: reasonVal });
            submitToGAS(url, recOverlay, recOverlayText, recBtn);
            nameInput.value = '';
            reasonInput.value = '';
        });
    }
})();
