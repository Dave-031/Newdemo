document.querySelectorAll('.upload-tray-btn').forEach(button => {
    button.addEventListener('click', () => {
        const matchingInput = document.querySelector(`.theme-bg-input[data-theme="${button.dataset.theme}"]`);
        if (matchingInput) matchingInput.click();
    });
});

document.getElementById('image-uploader').addEventListener('change', function(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const currentCount = document.querySelectorAll("div.window[id^='win-uploaded-']").length;
    const allowedSlots = 4 - currentCount;

    if (allowedSlots <= 0) {
        alert("Maximum limit of 4 image panes reached. Close an existing pane to add a new one.");
        e.target.value = '';
        return;
    }

    const filesToProcess = files.slice(0, allowedSlots);

    if (files.length > allowedSlots) {
        alert(`Only ${allowedSlots} image pane(s) could be added. The rest were skipped to respect the 4-pane limit.`);
    }

    filesToProcess.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            const assignedNum = document.querySelectorAll("div.window[id^='win-uploaded-']").length + 1;
            const secureTimestampId = Date.now() + "-" + index + "-" + Math.random().toString(36).substr(2, 5);

            const newWindow = document.createElement('div');
            newWindow.className = 'window glass active';
            newWindow.id = `win-uploaded-${secureTimestampId}`;
            newWindow.style.width = '300px';
            newWindow.style.height = '300px';
            newWindow.style.zIndex = ++highestZ;

            newWindow.innerHTML = `
              <div class="title-bar">
                <div class="title-bar-text"><span class="win-icon icon-image"></span>IMAGE PANE #${assignedNum}</div>
                <div class="title-bar-controls">
                  <button aria-label="Minimize" class="btn-minimize"></button>
                  <button aria-label="Maximize" class="btn-maximize"></button>
                  <button aria-label="Close" class="btn-close"></button>
                </div>
              </div>
              <div class="window-body" style="padding:0; display:flex; justify-content:center; align-items:center; background:#000;">
                 <img src="${event.target.result}" class="uploaded-img-frame" alt="User upload image container">
              </div>
            `;

            document.body.appendChild(newWindow);
            // Same cascade system as every other window: offsets diagonally
            // from whatever's already open so title bars stay visible.
            cascadePosition(newWindow);

            const assignedTaskBtn = setupWindowLogic(newWindow, true);
            assignedTaskBtn.dataset.windowLink = `win-uploaded-${secureTimestampId}`;
            taskbarContainer.appendChild(assignedTaskBtn);

            renameActiveImagePanes();
        };
        reader.readAsDataURL(file);
    });

    e.target.value = '';
});