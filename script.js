const taskbarContainer = document.getElementById('taskbar-items-container');
const reorderBtn = document.getElementById('reorder-btn');
const themeStylesheet = document.getElementById('theme-stylesheet');
let highestZ = 10;

function getIconClass(windowId) {
  if (windowId === 'win-games') return 'icon-games';
  if (windowId === 'win-pcgames') return 'icon-pcgames';
  if (windowId === 'win-settings') return 'icon-settings';
  if (windowId === 'win-reports') return 'icon-reports';
  if (windowId === 'win-recommends') return 'icon-recommend';
  if (windowId === 'win-changelogs') return 'icon-changelogs';
  if (windowId.startsWith('win-uploaded-')) return 'icon-image';
  return '';
}

const wallpapers = {
    'https://unpkg.com/98.css': "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@48b6058e4f00e2a3cd6ce93c19e3b31d07422692/images/98_wallpaper.png",
    'https://unpkg.com/xp.css': "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@18303d7b050c223085e4065a091ce377e058be01/images/xp_wallpaper.jpg",
    'https://unpkg.com/7.css': "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@18303d7b050c223085e4065a091ce377e058be01/images/7_wallpaper.jpg"
};

const STORAGE_KEY = 'windows_gamesite';
const defaultSettings = {
    selectedTheme: 'https://unpkg.com/7.css',
    customBackgrounds: {},
    showClock: true,
    showCat: true,
    catScale: 1
};

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
            catScale: parsed.catScale !== undefined ? parsed.catScale : defaultSettings.catScale
        };
    } catch (err) {
        return { ...defaultSettings, customBackgrounds: {} };
    }
}

function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function getBackgroundForTheme(themeValue) {
    const custom = settings.customBackgrounds[themeValue];
    if (custom) return custom;
    return wallpapers[themeValue] || '';
}

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

function updateClockVisibility() {
    const clockElement = document.getElementById('taskbar-clock');
    if (clockElement) {
        clockElement.style.display = settings.showClock ? 'flex' : 'none';
    }
}

function updateCatSettings() {
    const catEl = document.getElementById('taskbar-cat');
    if (catEl) {
        catEl.style.display = settings.showCat ? 'block' : 'none';
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
    showCatToggle.checked = settings.showCat;
    showCatToggle.addEventListener('change', (e) => {
        settings.showCat = e.target.checked;
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

updateBackgroundStatus();
updateClockVisibility();
applyTheme(settings.selectedTheme);
updateCatSettings();

const defaultPositions = [
    { left: '30px', top: '30px' },    
    { left: '500px', top: '30px' },   
    { left: '30px', top: '380px' },   
    { left: '500px', top: '380px' },  
    { left: '970px', top: '30px' },
    { left: '970px', top: '380px' }
];

const windowsList = document.querySelectorAll('.window');
const standardWindowMap = new Map();
const imageWindowMap = new Map();

function applyDefaultLayout() {
    windowsList.forEach((windowEl, index) => {
        windowEl.classList.remove('maximized');
        windowEl.style.display = (windowEl.id === 'win-pcgames') ? 'all' : 'flex';
        windowEl.style.left = defaultPositions[index].left;
        windowEl.style.top = defaultPositions[index].top;
        windowEl.style.zIndex = index + 1;
        
        const maxBtn = windowEl.querySelector('.btn-maximize');
        if(maxBtn) maxBtn.setAttribute('aria-label', 'Maximize');
    });

    taskbarContainer.innerHTML = '';

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
      }
      bringToFront(windowEl);
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
          windowEl.style.left = savedLeft;
          windowEl.style.top = savedTop;
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
      }
  });

  return taskBtn;
}

windowsList.forEach(windowEl => {
    setupWindowLogic(windowEl, false);
});

applyDefaultLayout();
reorderBtn.addEventListener('click', applyDefaultLayout);

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
            
            newWindow.style.left = `${80 + (assignedNum * 25)}px`;
            newWindow.style.top = `${120 + (assignedNum * 25)}px`;
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
            
            const assignedTaskBtn = setupWindowLogic(newWindow, true);
            assignedTaskBtn.dataset.windowLink = `win-uploaded-${secureTimestampId}`;
            
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