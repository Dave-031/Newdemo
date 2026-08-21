const HTML_URL = "https://cdn.jsdelivr.net/gh/freebuisness/html@main/"; // set this to the real base URL
const COVER_URL = "https://cdn.jsdelivr.net/gh/freebuisness/covers@main/"; // same idea for {COVER_URL}

// --- HIDDEN GAMES ---
// Add a game's exact name (or its link/url) here to hide its card from the
// GAMES window, even though it's still present in zones.json / testing.json.
// Matching is case-insensitive and whitespace-trimmed. Example:
//   const GAMES_IGNORE_LIST = ['Some Broken Game', 'Old Duplicate Game'];
const GAMES_IGNORE_LIST = [
    '[!] SUGGEST GAMES .gg/D4c9VFYWyU',
    '[!] COMMENTS'
];



// Same idea, but for the PC GAMES window.
const PCGAMES_IGNORE_LIST = [
];

function resolveUrl(template, base) {
    return template.replace('{HTML_URL}', base);
}

const taskbarContainer = document.getElementById('taskbar-items-container');
// Re-order Layout button disabled — element lookup commented out along
// with everything that referenced it, below.
// const reorderBtn = document.getElementById('reorder-btn');
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
//sets the wall paper for the theme
const wallpapers = {
    'https://unpkg.com/98.css': "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@48b6058e4f00e2a3cd6ce93c19e3b31d07422692/images/98_wallpaper.png",
    'https://unpkg.com/xp.css': "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@18303d7b050c223085e4065a091ce377e058be01/images/xp_wallpaper.jpg",
    'https://unpkg.com/7.css': "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@18303d7b050c223085e4065a091ce377e058be01/images/7_wallpaper.jpg"
};
// assigns defualt settings
const STORAGE_KEY = 'windows_gamesite';
const defaultSettings = {
    selectedTheme: 'https://unpkg.com/7.css',
    customBackgrounds: {},
    showClock: true,
    showCat: true,
    catScale: 1,
    enableMeow: true,
    meowSound: 'meow1'
};
// loads preveusly saved setttings

function loadSettings() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return { ...defaultSettings, customBackgrounds: {} };
        const parsed = JSON.parse(stored);
        return {
            selectedTheme: parsed.selectedTheme || defaultSettings.selectedTheme,
            customBackgrounds: parsed.customBackgrounds || {},
            showClock: parsed.showClock !== undefined ? parsed.showClock : defaultSettings.showClock,
            showCat: parsed.showCat !== undefined ? parsed.showCat : defaultSettings.showCat,
            catScale: parsed.catScale !== undefined ? parsed.catScale : defaultSettings.catScale,
            enableMeow: parsed.enableMeow !== undefined ? parsed.enableMeow : defaultSettings.enableMeow,
            meowSound: parsed.meowSound || defaultSettings.meowSound
        };
    } catch (err) {
        return { ...defaultSettings, customBackgrounds: {} };
    }
}

function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
// pulls the image for wall paper
function getBackgroundForTheme(themeValue) {
    const custom = settings.customBackgrounds[themeValue];
    if (custom) return custom;
    return wallpapers[themeValue] || '';
}
// sets the custom wall paper
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

// --- DESKTOP ICONS LOGIC ---
document.querySelectorAll('.desktop-icon').forEach(icon => {
    // Single click: Select the icon
    icon.addEventListener('click', (e) => {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
        e.stopPropagation(); // Prevents the body click listener from immediately firing
    });

    // Double click: Open the window and re-add to taskbar
    icon.addEventListener('dblclick', () => {
        const targetId = icon.dataset.target;
        const windowEl = document.getElementById(targetId);
        const taskBtn = standardWindowMap.get(targetId);

        if (windowEl && taskBtn) {
            windowEl.style.display = 'flex';
            // Freshly-opened windows cascade like real Windows; a window the
            // user has already dragged by hand keeps its remembered spot.
            if (windowEl.dataset.userMoved !== 'true') {
                cascadePosition(windowEl);
            }
            // If the window was closed (removed from taskbar), add it back
            if (!document.getElementById('taskbar-items-container').contains(taskBtn)) {
                document.getElementById('taskbar-items-container').appendChild(taskBtn);
            }
            // Bring window to the front
            highestZ++;
            windowEl.style.zIndex = highestZ;
        }
        icon.classList.remove('selected');
    });
});

// Deselect icons if you click the empty desktop background
document.body.addEventListener('click', (e) => {
    if (!e.target.closest('.desktop-icon')) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
});


function updateClockVisibility() {
    const clockElement = document.getElementById('taskbar-clock');
    if (clockElement) {
        clockElement.style.display = settings.showClock ? 'flex' : 'none';
    }
}

function updateCatSettings() {
    const catEl = document.getElementById('taskbar-cat');
    if (catEl) {
        catEl.style.display = 'block'; // Cat is always visible — do not gate this on settings.showCat
        catEl.style.setProperty('--cat-scale', settings.catScale);
        catEl.style.bottom = ''; // Clears any buggy inline math from the last step
    }
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

let settings = loadSettings();
settings.showCat = true; // Taskbar cat is locked visible for now — reserved for a future feature

document.querySelectorAll('input[name="theme-selection-group"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.checked) {
            applyTheme(e.target.value);
        }
    });
});

const quickThemeSelect = document.getElementById('quick-theme-select');
if (quickThemeSelect) {
    quickThemeSelect.addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });
}

const showClockToggle = document.getElementById('show-clock-toggle');
if (showClockToggle) {
    showClockToggle.checked = settings.showClock;
    showClockToggle.addEventListener('change', (e) => {
        settings.showClock = e.target.checked;
        updateClockVisibility();
        saveSettings();
    });
}

const showCatToggle = document.getElementById('show-cat-toggle');
if (showCatToggle) {
    showCatToggle.checked = true; // Cat can't be hidden right now
    showCatToggle.addEventListener('change', (e) => {
        if (!e.target.checked) {
            e.target.checked = true; // Snap it back on
            alert("Why would you want to hide the cat? She will stay put for now.");
            return;
        }
        settings.showCat = true;
        updateCatSettings();
        saveSettings();
    });
}

const catSizeSlider = document.getElementById('cat-size-slider');
if (catSizeSlider) {
    catSizeSlider.value = settings.catScale;
    catSizeSlider.addEventListener('input', (e) => {
        settings.catScale = parseFloat(e.target.value);
        updateCatSettings();
        saveSettings();
    });
}

const enableMeowToggle = document.getElementById('enable-meow-toggle');
if (enableMeowToggle) {
    enableMeowToggle.checked = settings.enableMeow;
    enableMeowToggle.addEventListener('change', (e) => {
        settings.enableMeow = e.target.checked;
        saveSettings();
    });
}

// --- START BUTTON EASTER EGG: RANDOM ROLLING/FALLING IMAGES ---
// Secret trick: click the Start button 10 times in a row and 2 random
// images from the list below fly across the screen (each one randomly
// either rolls across or falls down, landing at a random spot). Fill in
// any/all of the 21 URL slots below — this is not exposed anywhere in the
// UI, so only someone editing this file can set/find it. Empty slots are
// simply skipped when picking which images to show.
const EGG_ROLL_IMAGE_URLS = [
    '', // 1
    '', // 2
    '', // 3
    '', // 4
    '', // 5
    '', // 6
    '', // 7
    '', // 8
    '', // 9
    '', // 10
    '', // 11
    '', // 12
    '', // 13
    '', // 14
    '', // 15
    '', // 16
    '', // 17
    '', // 18
    '', // 19
    '', // 20
    ''  // 21
];

const EGG_IMAGES_PER_TRIGGER = 2;
let eggAnimationActive = false; // Locked while any triggered images are still on screen
let eggImagesInFlight = 0;

function pickRandomUniqueUrls(count) {
    const pool = EGG_ROLL_IMAGE_URLS.filter(url => url && url.trim() !== '');
    if (pool.length === 0) return [];

    // Shuffle a copy of the pool (Fisher-Yates) and take the first `count`
    // entries so the 2 images picked each trigger are random and distinct
    // (unless the pool itself is smaller than `count`).
    const shuffled = pool.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

function spawnSingleEggImage(url) {
    const isRoll = Math.random() < 0.5;
    const duration = 3.5 + Math.random() * 2; // 3.5s - 5.5s, so the two images don't move in lockstep

    const img = document.createElement('img');
    img.src = url;
    img.alt = '';
    img.style.animationDuration = `${duration}s`;

    if (isRoll) {
        img.className = 'egg-roll-image';
        img.style.top = `${10 + Math.random() * 75}%`; // random vertical spot
    } else {
        img.className = 'egg-fall-image';
        img.style.left = `${5 + Math.random() * 85}%`; // random horizontal spot
    }

    document.body.appendChild(img);
    eggImagesInFlight++;

    // Clean up once this image finishes its run across/down the screen.
    // animationend is the normal path; the timeout is a safety net (e.g.
    // a broken image URL that never properly starts/finishes the animation).
    const cleanup = () => {
        if (img.isConnected) img.remove();
        eggImagesInFlight = Math.max(0, eggImagesInFlight - 1);
        if (eggImagesInFlight === 0) eggAnimationActive = false;
    };
    img.addEventListener('animationend', cleanup);
    setTimeout(cleanup, (duration * 1000) + 500);
}

function spawnEggRollImage() {
    if (eggAnimationActive) return; // Already running — never overlap triggers.

    const urls = pickRandomUniqueUrls(EGG_IMAGES_PER_TRIGGER);
    if (urls.length === 0) return; // No URLs filled in — silently do nothing, keeps it secret.

    eggAnimationActive = true;
    urls.forEach(url => spawnSingleEggImage(url));
}

(function () {
    const startBtn = document.getElementById('start-btn');
    if (!startBtn) return;

    const CLICKS_NEEDED = 10;
    const CLICK_WINDOW_MS = 4000; // clicks reset the count if they're spaced out this much
    let clickCount = 0;
    let resetTimer = null;

    startBtn.addEventListener('click', () => {
        // Ignore clicks entirely while images are still on screen — this is
        // what stops someone from mashing the button fast and stacking up
        // multiple overlapping triggers. They have to wait for the current
        // run to finish, then click 10 fresh times.
        if (eggAnimationActive) return;

        clickCount++;
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { clickCount = 0; }, CLICK_WINDOW_MS);

        if (clickCount >= CLICKS_NEEDED) {
            clickCount = 0;
            clearTimeout(resetTimer);
            spawnEggRollImage();
        }
    });
})();

document.querySelectorAll('.upload-tray-btn').forEach(button => {
    button.addEventListener('click', () => {
        const matchingInput = document.querySelector(`.theme-bg-input[data-theme="${button.dataset.theme}"]`);
        if (matchingInput) matchingInput.click();
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

// --- SETTINGS EXPORT / IMPORT ---
// Export dumps every key currently in localStorage (not just the app's own
// settings key) so anything saved in this browser comes along in the file.
const exportSettingsBtn = document.getElementById('export-settings-btn');
const importSettingsBtn = document.getElementById('import-settings-btn');
const importSettingsInput = document.getElementById('import-settings-input');
const backupStatus = document.getElementById('backup-status');

if (exportSettingsBtn) {
    exportSettingsBtn.addEventListener('click', () => {
        try {
            const allData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                allData[key] = localStorage.getItem(key);
            }

            const exportPayload = {
                exportedFrom: 'Game Station',
                exportedAt: new Date().toISOString(),
                localStorage: allData
            };

            const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `gamestation-settings-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);

            if (backupStatus) backupStatus.innerText = 'Settings exported successfully.';
        } catch (err) {
            console.error('Settings export failed:', err);
            if (backupStatus) backupStatus.innerText = 'Export failed — see console for details.';
        }
    });
}

if (importSettingsBtn && importSettingsInput) {
    importSettingsBtn.addEventListener('click', () => importSettingsInput.click());

    importSettingsInput.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const parsed = JSON.parse(event.target.result);
                // Support both the wrapped export format above and a raw
                // { key: value } localStorage dump, just in case.
                const dataToImport = (parsed && typeof parsed === 'object' && parsed.localStorage)
                    ? parsed.localStorage
                    : parsed;

                if (!dataToImport || typeof dataToImport !== 'object' || Array.isArray(dataToImport)) {
                    throw new Error('Invalid settings file format.');
                }

                Object.keys(dataToImport).forEach(key => {
                    localStorage.setItem(key, dataToImport[key]);
                });

                if (backupStatus) backupStatus.innerText = 'Settings imported! Reloading…';
                setTimeout(() => location.reload(), 700);
            } catch (err) {
                console.error('Settings import failed:', err);
                if (backupStatus) backupStatus.innerText = 'Import failed — that file is not a valid settings export.';
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });
}

updateBackgroundStatus();
updateClockVisibility();
applyTheme(settings.selectedTheme);
updateCatSettings();

const windowsList = document.querySelectorAll('.window:not(#instructions-window)');
const standardWindowMap = new Map();
const imageWindowMap = new Map();

// --- WINDOW CASCADE POSITIONING ---
// Like real Windows: a freshly-opened window doesn't jump to one fixed
// spot — it lands offset from whatever's already open so every title bar
// underneath stays visible. Once a person drags a window by hand,
// dataset.userMoved is set to 'true' and that window keeps its remembered
// spot instead of being re-cascaded the next time it's opened.
const CASCADE_BASE_LEFT = 60;
const CASCADE_BASE_TOP = 60;
const CASCADE_STEP = 32;
const TASKBAR_HEIGHT = 40;

function cascadePosition(windowEl, indexOverride) {
    const width = windowEl.offsetWidth || 320;
    const height = windowEl.offsetHeight || 200;

    const maxLeft = Math.max(CASCADE_BASE_LEFT, window.innerWidth - width - 10);
    const maxTop = Math.max(CASCADE_BASE_TOP, window.innerHeight - TASKBAR_HEIGHT - height - 10);
    const cascadeRange = Math.max(1, Math.min(maxLeft - CASCADE_BASE_LEFT, maxTop - CASCADE_BASE_TOP));

    let stepIndex = indexOverride;
    if (stepIndex === undefined) {
        stepIndex = Array.from(document.querySelectorAll('.window:not(#instructions-window)'))
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

windowsList.forEach(windowEl => {
    setupWindowLogic(windowEl, false);
});

// Start with a clean desktop — windows are positioned but stay closed
// until the user double-clicks a desktop icon to open one.
applyDefaultLayout({ open: false });
// reorderBtn.addEventListener('click', () => applyDefaultLayout({ open: true }));

function updateClock() {
    const clockElement = document.getElementById('taskbar-clock');
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    clockElement.innerText = `${hours}:${minutes} ${ampm}`;
}
updateClock();
setInterval(updateClock, 1000);

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

// Handle Dynamic Upload limits securely
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

// ---- Taskbar cat: animated sprite you can slide left/right along the taskbar ----
(function setupTaskbarCat() {
    const catEl = document.getElementById('taskbar-cat');
    const taskbarEl = document.getElementById('taskbar');
    if (!catEl || !taskbarEl) return;

    let isDraggingCat = false;
    let dragStartX = 0;
    let catStartLeft = 0;

    // ---- Meow sound options ----
    // Paste your 3 meow sound links here. "meow1" already has the original
    // sound as a default; just fill in the empty strings for meow2 / meow3.
    const meowSoundUrls = {
        meow1: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow3.mp3',
        meow2: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow2.mp3', // <-- paste link for Meow 2 here
        meow3: 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@064ed227b7d0d19d24615b1ebf929ca8733b0700/cat_anim/meow1.mp3'  // <-- paste link for Meow 3 here
    };

    const meowSound = new Audio(meowSoundUrls[settings.meowSound] || meowSoundUrls.meow1);

    function playMeow() {
        if (!settings.enableMeow) return;

        // Prevent the sound from clipping or restarting if it's already playing
        if (!meowSound.paused) return;

        meowSound.play().catch(() => {});
    }

    const meowSoundSelect = document.getElementById('meow-sound-select');
    if (meowSoundSelect) {
        meowSoundSelect.value = settings.meowSound;
        meowSoundSelect.addEventListener('change', (e) => {
            settings.meowSound = e.target.value;
            saveSettings();
            const newSrc = meowSoundUrls[settings.meowSound];
            if (newSrc) {
                meowSound.src = newSrc;
            }
        });
    }

    function clampCatLeft(left) {
        const maxLeft = taskbarEl.clientWidth - catEl.offsetWidth;
        if (left < 0) return 0;
        if (left > maxLeft) return maxLeft;
        return left;
    }

    // Keep the cat inside the taskbar if the window gets resized
    window.addEventListener('resize', () => {
        catEl.style.left = clampCatLeft(catEl.offsetLeft) + 'px';
    });

    catEl.addEventListener('mousedown', (e) => {
        isDraggingCat = true;
        dragStartX = e.clientX;
        catStartLeft = catEl.offsetLeft;
        catEl.classList.add('dragging');
        playMeow();
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDraggingCat) return;
        const deltaX = e.clientX - dragStartX;
        const newLeft = clampCatLeft(catStartLeft + deltaX);
        catEl.style.left = newLeft + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (!isDraggingCat) return;
        isDraggingCat = false;
        catEl.classList.remove('dragging');
    });

    // Touch support so it can be dragged on mobile too
    catEl.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        isDraggingCat = true;
        dragStartX = touch.clientX;
        catStartLeft = catEl.offsetLeft;
        catEl.classList.add('dragging');
        playMeow();
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        if (!isDraggingCat) return;
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragStartX;
        const newLeft = clampCatLeft(catStartLeft + deltaX);
        catEl.style.left = newLeft + 'px';
    }, { passive: true });

    document.addEventListener('touchend', () => {
        if (!isDraggingCat) return;
        isDraggingCat = false;
        catEl.classList.remove('dragging');
    });

    // Make sure the cat starts inside taskbar bounds
    catEl.style.left = clampCatLeft(catEl.offsetLeft) + 'px';
})();


document.addEventListener("DOMContentLoaded", function() {

    // Opens a blank window immediately (so the browser doesn't treat it as a
    // blocked popup once the fetch resolves later), then fetches the game's
    // actual HTML from jsdelivr and writes it into that window. A <base> tag
    // pointing back at the source folder is injected so any relative
    // image/script/css paths inside that HTML still resolve correctly even
    // though the page is now living at "about:blank".
    function openGameInNewWindow(url) {
        const newWin = window.open('about:blank', '_blank');
        if (!newWin) {
            // Popup blocked — fall back to a normal navigation.
            window.location.href = url;
            return;
        }

        newWin.document.write('<!doctype html><title>Loading\u2026</title><body style="font-family: sans-serif; padding: 20px;">Loading game\u2026</body>');

        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.text();
            })
            .then(html => {
                const baseHref = url.substring(0, url.lastIndexOf('/') + 1);
                const baseTag = `<base href="${baseHref}">`;
                const headMatch = html.match(/<head[^>]*>/i);
                const withBase = headMatch
                    ? html.slice(0, headMatch.index + headMatch[0].length) + baseTag + html.slice(headMatch.index + headMatch[0].length)
                    : baseTag + html;

                newWin.document.open();
                newWin.document.write(withBase);
                newWin.document.close();
            })
            .catch(error => {
                console.error(`Error loading game HTML from ${url}:`, error);
                newWin.document.open();
                newWin.document.write('<!doctype html><title>Error</title><body style="font-family: sans-serif; padding: 20px; color: red;">Failed to load game.</body>');
                newWin.document.close();
            });
    }

    // Shared setup for both the PC GAMES grid and the GAMES grid.
    // Fetches one or more game-list JSON sources (jsonUrls can be a single
    // URL string, or an array of URLs — e.g. a main list plus a secondary
    // list with more games, both in the same format). All sources are
    // fetched, merged together, filtered against `ignoreList` (entries can
    // be a game's name or its link/url — see GAMES_IGNORE_LIST /
    // PCGAMES_IGNORE_LIST above), and always sorted alphabetically by name
    // before rendering into `listElId`. `searchElId` filters the rendered
    // cards by name as you type. `openMode` controls what a click does:
    // 'navigate' (default) sends the current tab to game.link, while
    // 'fetchHtml' fetches that game's HTML and loads it into a fresh
    // about:blank window via openGameInNewWindow().
    function setupGameGrid(jsonUrls, listElId, searchElId, ignoreList, openMode) {
        const urls = Array.isArray(jsonUrls) ? jsonUrls : [jsonUrls];
        const listEl = document.getElementById(listElId);
        const searchEl = document.getElementById(searchElId);
        const ignored = new Set(
            (ignoreList || []).map(entry => (entry || '').trim().toLowerCase())
        );
        let gameData = [];

        function renderGrid(filterText) {
            const term = (filterText || '').trim().toLowerCase();
            listEl.innerHTML = '';

            const filtered = !term
                ? gameData
                : gameData.filter(game => (game.name || '').toLowerCase().includes(term));

            if (filtered.length === 0) {
                listEl.innerHTML = '<span style="font-size: 12px; color: #444;">No games match your search.</span>';
                return;
            }

            filtered.forEach(game => {
                // Create main game container
                // (styling lives in styles.css as .pcgame-card so it can re-skin per theme)
                const gameDiv = document.createElement("div");
                gameDiv.className = "pcgame-card";

                // Add click event for the link
                gameDiv.onclick = () => {
                    if (openMode === 'fetchHtml') {
                        openGameInNewWindow(game.link);
                    } else {
                        window.location.href = game.link;
                    }
                };

                // Create image element
                const img = document.createElement("img");
                img.src = game.image;
                img.alt = game.name;
                img.className = "pcgame-thumb";

                // Create title element
                const titleSpan = document.createElement("span");
                titleSpan.textContent = game.name;
                titleSpan.className = "pcgame-title";

                // Construct the card and add it to the list
                gameDiv.appendChild(img);
                gameDiv.appendChild(titleSpan);
                listEl.appendChild(gameDiv);
            });
        }

        Promise.all(urls.map(url =>
            fetch(url)
                .then(response => response.json())
                .then(games => Array.isArray(games) ? games : [])
                .catch(error => {
                    // A single source failing (e.g. the secondary JSON being
                    // temporarily unreachable) shouldn't blank out the whole
                    // grid — just log it and treat that source as empty.
                    console.error(`Error loading games from ${url}:`, error);
                    return null;
                })
        )).then(results => {
            const succeeded = results.some(r => r !== null);
            const raw = results.filter(r => r !== null).flat();

            if (!succeeded) {
                listEl.innerHTML = '<span style="color: red; font-size: 12px;">Failed to load game directory.</span>';
                return;
            }

            gameData = raw
                .filter(game => {
                    if (ignored.size === 0) return true;
                    const nameKey = (game.name || '').trim().toLowerCase();
                    const linkKey = (game.url || '').trim().toLowerCase();
                    return !ignored.has(nameKey) && !ignored.has(linkKey);
                })
                .map(game => ({
                    name: game.name,
                    image: (game.cover || '').replace('{COVER_URL}', COVER_URL),
                    link: (game.url || '').replace('{HTML_URL}', HTML_URL)
                }))
                // Always alphabetical, regardless of how many sources were merged in.
                .sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' }));

            renderGrid(searchEl ? searchEl.value : '');
        });

        if (searchEl) {
            searchEl.addEventListener('input', () => renderGrid(searchEl.value));
        }
    }

    // PC GAMES: single JSON source, same format as zones.json below.
    // Replace '1.json' with your actual JSON endpoint/file path for PC GAMES.
    // Clicking a card navigates the current tab to game.link (default openMode).
    setupGameGrid('1.json', 'pcgames-list', 'pcgames-search', PCGAMES_IGNORE_LIST);

    // GAMES: main JSON (zones.json) plus a secondary JSON (testing.json) with
    // more games, in the exact same format. Both are always fetched, merged,
    // filtered against GAMES_IGNORE_LIST, and rendered in alphabetical order.
    // Clicking a card fetches that game's actual HTML from jsdelivr and loads
    // it into a fresh about:blank window instead of navigating away.
    setupGameGrid([
        'https://cdn.jsdelivr.net/gh/freebuisness/assets@main/zones.json',
        'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@main/testing.json'
    ], 'games-list', 'games-search', GAMES_IGNORE_LIST, 'fetchHtml');
});

(function setupChangelogs() {
    const CHANGELOG_URL = 'https://gist.githubusercontent.com/Dave-031/2137f840bf18a9b43b722f0bacaab332/raw/changelogs.json';

    const listEl = document.getElementById('changelog-list');
    const statusEl = document.getElementById('changelog-status');
    const searchEl = document.getElementById('changelog-search');
    if (!listEl || !searchEl) return;

    let changelogData = [];

    function renderChangelogs(filterText) {
        const term = (filterText || '').trim().toLowerCase();
        listEl.innerHTML = '';

        const filtered = !term ? changelogData : changelogData.filter(entry => {
            const haystack = [entry.version || '', entry.date || '', ...(entry.changes || [])].join(' ').toLowerCase();
            return haystack.includes(term);
        });

        if (filtered.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.style.fontSize = '30px';
            emptyMsg.style.color = '#444';
            emptyMsg.style.margin = '0';
            emptyMsg.innerText = 'No changelog entries match your search.';
            listEl.appendChild(emptyMsg);
            return;
        }

        filtered.forEach(entry => {
            const fieldset = document.createElement('fieldset');
            fieldset.style.margin = '0';
            fieldset.style.padding = '10px 12px';
            fieldset.style.flexShrink = '0';

            const legend = document.createElement('legend');
            legend.style.fontWeight = 'bold';
            legend.style.fontSize = '17px';
            legend.innerText = (entry.version || '') + ' — ' + (entry.date || '');
            fieldset.appendChild(legend);

            const ul = document.createElement('ul');
            ul.style.margin = '4px 0 0 0';
            ul.style.paddingLeft = '18px';
            ul.style.fontSize = '14px';
            ul.style.lineHeight = '1.5';

            (entry.changes || []).forEach(change => {
                const li = document.createElement('li');
                li.innerText = change;
                ul.appendChild(li);
            });

            fieldset.appendChild(ul);
            listEl.appendChild(fieldset);
        });
    }

      function loadChangelogs() {
          fetch(CHANGELOG_URL)
              .then(res => {
                  if (!res.ok) throw new Error('Bad response');
                  return res.json();
              })
              .then(data => {
                  changelogData = Array.isArray(data) ? data : [];
                  if (statusEl) statusEl.style.display = 'none';
                  renderChangelogs(searchEl.value);
              })
              .catch(() => {
                  changelogData = [];
                  listEl.innerHTML = '';
                  if (statusEl) {
                      statusEl.style.display = 'block';
                      statusEl.innerText = 'Failed to fetch.';
                  }
              });
      }

    searchEl.addEventListener('input', () => renderChangelogs(searchEl.value));

    loadChangelogs();
})();


// --- DESKTOP ICONS LOGIC ---
const gridWidth = 90;
const gridHeight = 100;
const desktopIcons = document.querySelectorAll('.desktop-icon');

// 1. Initialize their starting positions in a grid (top to bottom, left to right)
let startX = 10;
let startY = 10;
const maxScreenHeight = window.innerHeight - 80;

desktopIcons.forEach((icon) => {
    icon.style.left = `${startX}px`;
    icon.style.top = `${startY}px`;

    startY += gridHeight;
    // Move to the next column if we hit the bottom of the screen
    if (startY > maxScreenHeight) {
        startY = 10;
        startX += gridWidth;
    }
});

// 2. Drag and Snap logic
let draggedIcon = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

desktopIcons.forEach(icon => {
    // Single click: Select the icon
    icon.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return; // Only allow left-click dragging

        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');

        // Start Drag
        draggedIcon = icon;
        const rect = icon.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;

        icon.style.zIndex = 2; // Slight bump to stay above other icons while dragging
        e.stopPropagation();
    });

    // Double click: Open the window
    icon.addEventListener('dblclick', () => {
        const targetId = icon.dataset.target;
        const windowEl = document.getElementById(targetId);
        const taskBtn = standardWindowMap.get(targetId);

        if (windowEl && taskBtn) {
            windowEl.style.display = 'flex';
            if (windowEl.dataset.userMoved !== 'true') {
                cascadePosition(windowEl);
            }
            if (!document.getElementById('taskbar-items-container').contains(taskBtn)) {
                document.getElementById('taskbar-items-container').appendChild(taskBtn);
            }
            highestZ++;
            windowEl.style.zIndex = highestZ;
        }
        icon.classList.remove('selected');
    });
});

// Handle moving the mouse
document.addEventListener('mousemove', (e) => {
    if (!draggedIcon) return;

    // Move the icon freely with the mouse
    const newLeft = e.clientX - dragOffsetX;
    const newTop = e.clientY - dragOffsetY;

    draggedIcon.style.left = `${newLeft}px`;
    draggedIcon.style.top = `${newTop}px`;
});

// Handle releasing the mouse and snapping to grid
// Helper function to check if a grid slot is already taken
function isSlotOccupied(x, y, currentIcon) {
    const icons = document.querySelectorAll('.desktop-icon');
    for (let i = 0; i < icons.length; i++) {
        if (icons[i] === currentIcon) continue;

        const iconLeft = parseInt(icons[i].style.left, 10);
        const iconTop = parseInt(icons[i].style.top, 10);

        // If an icon is found at these exact coordinates, the slot is taken
        if (iconLeft === x && iconTop === y) {
            return true;
        }
    }
    return false;
}

// Handle releasing the mouse and snapping to grid (UPDATED)
document.addEventListener('mouseup', (e) => {
    if (!draggedIcon) return;

    const rect = draggedIcon.getBoundingClientRect();

    // Calculate nearest grid slot
    let snappedX = Math.round((rect.left - 10) / gridWidth) * gridWidth + 10;
    let snappedY = Math.round((rect.top - 10) / gridHeight) * gridHeight + 10;

    // Prevent dragging off the top or left of the screen
    if (snappedX < 10) snappedX = 10;
    if (snappedY < 10) snappedY = 10;

    // --- NEW: Collision detection to prevent stacking ---
    const maxScreenHeight = window.innerHeight - 80;

    // While the target slot is taken, find the next open slot
    while (isSlotOccupied(snappedX, snappedY, draggedIcon)) {
        snappedY += gridHeight; // Move down one slot

        // If we hit the bottom of the screen, move to the top of the next column
        if (snappedY > maxScreenHeight) {
            snappedY = 10;
            snappedX += gridWidth;
        }
    }
    // ----------------------------------------------------

    // Apply the final empty snapped position
    draggedIcon.style.left = `${snappedX}px`;
    draggedIcon.style.top = `${snappedY}px`;
    draggedIcon.style.zIndex = ''; // Reset z-index

    draggedIcon = null;
});

// Deselect icons if you click the empty desktop background
document.body.addEventListener('mousedown', (e) => {
    if (!e.target.closest('.desktop-icon')) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
});

// --- WELCOME / INSTRUCTIONS DIALOG ---
// It's a normal .window element (same markup, and now run through the same
// setupWindowLogic() as every other window) so it's draggable by its title
// bar, shows up on the taskbar, and its Minimize/Close buttons behave the
// same way. It's kept out of windowsList on purpose, so applyDefaultLayout()
// never touches it and it stays visible even though every other window
// starts closed. Nothing auto-dismisses it — only the title bar's Close
// button or the OK button will hide it.
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