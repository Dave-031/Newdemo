const standardWindowMap = new Map();
const imageWindowMap = new Map();

const themeStylesheet = document.getElementById('theme-stylesheet');
let highestZ = 10;
// assigns icons to the window type
function getIconClass(windowId) {
  if (windowId === 'win-games') return 'icon-games';
  if (windowId === 'win-pcgames') return 'icon-pcgames';
  if (windowId === 'win-settings') return 'icon-settings';
  if (windowId === 'win-reports') return 'icon-reports';
  if (windowId === 'win-recommends') return 'icon-recommend';
  if (windowId === 'win-changelogs') return 'icon-changelogs';
  if (windowId === 'instructions-window') return 'icon-welcome';
  if (windowId.startsWith('win-uploaded-')) return 'icon-image';
  return '';
}
function cascadePosition(windowEl, indexOverride) {
    const width = windowEl.offsetWidth || 320;
    const height = windowEl.offsetHeight || 200;

    const maxLeft = Math.max(CASCADE_BASE_LEFT, window.innerWidth - width - 10);
    const maxTop = Math.max(CASCADE_BASE_TOP, window.innerHeight - TASKBAR_HEIGHT - height - 10);
    const cascadeRange = Math.max(1, Math.min(maxLeft - CASCADE_BASE_LEFT, maxTop - CASCADE_BASE_TOP));

    let stepIndex = indexOverride;
    if (stepIndex === undefined) {
        stepIndex = Array.from(document.querySelectorAll('.window:not(#instructions-window):not(.popup-box)'))
            .filter(w => w !== windowEl && w.style.display !== 'none' && !w.classList.contains('maximized'))
            .length;
    }

    const offset = (stepIndex * CASCADE_STEP) % cascadeRange;

    windowEl.style.left = `${Math.min(CASCADE_BASE_LEFT + offset, maxLeft)}px`;
    windowEl.style.top = `${Math.min(CASCADE_BASE_TOP + offset, maxTop)}px`;
}
function applyDefaultLayout(options = {}) {
    // `open: false` keeps windows hidden — used on first load so the user
    // sees a clean desktop instead of every window popping open at once.
    // `open: true` is "Re-order Layout": an explicit reset, so it cascades
    // every window fresh and clears any remembered custom positions.
    const { open = true } = options;

    windowsList.forEach((windowEl, index) => {
        windowEl.classList.remove('maximized');
        windowEl.style.display = open ? ((windowEl.id === 'win-pcgames') ? 'all' : 'flex') : 'none';
        if (open) {
            cascadePosition(windowEl, index);
            windowEl.dataset.userMoved = 'false';
        }
        windowEl.style.zIndex = index + 1;

        const maxBtn = windowEl.querySelector('.btn-maximize');
        if(maxBtn) maxBtn.setAttribute('aria-label', 'Maximize');
    });

    taskbarContainer.innerHTML = '';

    if (open) {
        windowsList.forEach(windowEl => {
            const btn = standardWindowMap.get(windowEl.id);
            if (btn) taskbarContainer.appendChild(btn);
        });

        const activeImageWindows = Array.from(document.querySelectorAll("div.window[id^='win-uploaded-']"));
        activeImageWindows.sort((a, b) => a.id.localeCompare(b.id));

        activeImageWindows.forEach((win) => {
            const associatedBtn = imageWindowMap.get(win.id);
            if (associatedBtn) {
                taskbarContainer.appendChild(associatedBtn);
            }
        });
    }

    highestZ = windowsList.length + 1;
    renameActiveImagePanes();
}
function setupWindowLogic(windowEl, isImageWindow = false) {
  const titleBar = windowEl.querySelector('.title-bar');
  const titleText = windowEl.querySelector('.title-bar-text').innerText;
  const maxBtn = windowEl.querySelector('.btn-maximize');

  let savedLeft = windowEl.style.left || '100px';
  let savedTop = windowEl.style.top || '100px';

  const taskBtn = document.createElement('button');
  taskBtn.className = 'taskbar-item';
  taskBtn.style.cursor = 'pointer';
  const iconClass = getIconClass(windowEl.id);
  taskBtn.innerHTML = `<span class="taskbar-icon ${iconClass}"></span>${titleText}`;

  if (!isImageWindow) {
      standardWindowMap.set(windowEl.id, taskBtn);
  } else {
      imageWindowMap.set(windowEl.id, taskBtn);
  }

  taskBtn.addEventListener('click', () => {
      if (windowEl.style.display === 'none') {
          windowEl.style.display = 'flex';
          bringToFront(windowEl);
      } else if (windowEl.style.zIndex == highestZ) {
          // Mimic real Windows: clicking the active taskbar item minimizes it
          windowEl.style.display = 'none';
      } else {
          bringToFront(windowEl);
      }
  });

  function bringToFront(el) {
      if (!el.classList.contains('maximized')) {
          highestZ++;
          el.style.zIndex = highestZ;
      }
  }

  function toggleMaximize() {
      const allowedWindowIds = ['win-games', 'win-pcgames', 'win-settings', 'win-changelogs'];
      const isAllowed = allowedWindowIds.includes(windowEl.id) || windowEl.id.startsWith('win-uploaded-');
      if (!isAllowed) return;

      windowEl.classList.toggle('maximized');
      if (!windowEl.classList.contains('maximized')) {
          // No need to reassign left/top here — maximized state only
          // overrides position visually via CSS !important, so the inline
          // style still holds the correct pre-maximize (cascaded or
          // user-moved) position.
          bringToFront(windowEl);
          if (maxBtn) maxBtn.setAttribute('aria-label', 'Maximize');
      } else {
          if (maxBtn) maxBtn.setAttribute('aria-label', 'Restore');
      }
  }

  titleBar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.title-bar-controls') || e.target.closest('select')) return;
      toggleMaximize();
  });

  windowEl.addEventListener('mousedown', () => bringToFront(windowEl));

  // Drag Handling with boundaries
  let isDragging = false;
  let wStartX, wStartY, initialLeft, initialTop;

  titleBar.addEventListener('mousedown', (e) => {
    if (e.target.closest('.title-bar-controls')) return;

    isDragging = true;
    windowEl.style.zIndex = 999999;

    wStartX = e.clientX;
    wStartY = e.clientY;

    if (windowEl.classList.contains('maximized')) {
      windowEl.classList.remove('maximized');
      if(maxBtn) maxBtn.setAttribute('aria-label', 'Maximize');
      initialLeft = e.clientX - 150;
      initialTop = e.clientY - 15;
      windowEl.style.left = `${initialLeft}px`;
      windowEl.style.top = `${initialTop}px`;
    } else {
      initialLeft = windowEl.offsetLeft;
      initialTop = windowEl.offsetTop;
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  function onMouseMove(e) {
    if (!isDragging) return;

    let newLeft = initialLeft + (e.clientX - wStartX);
    let newTop = initialTop + (e.clientY - wStartY);

    const taskbar = document.getElementById('taskbar');
    const windowHeight = windowEl.offsetHeight;
    const boundaryLimitTop = taskbar.getBoundingClientRect().top;

    if (newTop + windowHeight > boundaryLimitTop) {
        newTop = boundaryLimitTop - windowHeight;
    }

    if (newTop < 0) newTop = 0;

    windowEl.dataset.userMoved = 'true';

    savedLeft = `${newLeft}px`;
    savedTop = `${newTop}px`;
    windowEl.style.left = savedLeft;
    windowEl.style.top = savedTop;
  }

  function onMouseUp() {
    if (!isDragging) return;
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    bringToFront(windowEl);
  }

  windowEl.querySelector('.btn-minimize').addEventListener('click', (e) => {
      e.stopPropagation();
      windowEl.style.display = 'none';
  });

  if (maxBtn) {
      maxBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleMaximize();
      });
  }

  windowEl.querySelector('.btn-close').addEventListener('click', (e) => {
      e.stopPropagation();
      if (isImageWindow) {
          windowEl.remove();
          taskBtn.remove();
          imageWindowMap.delete(windowEl.id);
          renameActiveImagePanes();
      } else {
          windowEl.style.display = 'none';
          taskBtn.remove(); // Removes it from the taskbar container entirely
      }
  });

  return taskBtn;
}
function renameActiveImagePanes() {
    const activeImageWindows = Array.from(document.querySelectorAll("div.window[id^='win-uploaded-']"));
    activeImageWindows.sort((a, b) => a.id.localeCompare(b.id));

    activeImageWindows.forEach((win, index) => {
        const newNumber = index + 1;
        const titleTextEl = win.querySelector('.title-bar-text');
        if (titleTextEl) {
            titleTextEl.innerHTML = `<span class="win-icon icon-image"></span>IMAGE PANE #${newNumber}`;
        }

        const associatedTaskBtn = imageWindowMap.get(win.id);
        if (associatedTaskBtn) {
            associatedTaskBtn.innerHTML = `<span class="taskbar-icon icon-image"></span>IMAGE PANE #${newNumber}`;
        }
    });
}