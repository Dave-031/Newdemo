//These are the settings fucntions
//default to base settings if not already assigned

const STORAGE_KEY = 'brightFuture';
const defaultSettings = {
    selectedTheme: 'https://unpkg.com/7.css',
    customBackgrounds: {},
    showClock: true,
    showCat: true,
    catScale: 1,
    enableMeow: true,
    meowSound: 'meow1',
    cloak: false,
    ctrlW: false,
    catTheme: 'cat',
    darkMode: false
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
            catScale: parsed.catScale !== undefined ? parsed.catScale : defaultSettings.catScale,
            enableMeow: parsed.enableMeow !== undefined ? parsed.enableMeow : defaultSettings.enableMeow,
            meowSound: parsed.meowSound || defaultSettings.meowSound,
            cloak: parsed.cloak !== undefined ? parsed.cloak : defaultSettings.cloak,
            ctrlW: parsed.ctrlW !== undefined ? parsed.ctrlW : defaultSettings.ctrlW,
            catTheme: parsed.catTheme || defaultSettings.catTheme,
            darkMode: parsed.darkMode !== undefined ? parsed.darkMode : defaultSettings.darkMode
        };
    } catch (err) {
        return { ...defaultSettings, customBackgrounds: {} };
    }
}
//just read the funciton
function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
//disables ctrlW
function updateCtrlW() {
    if (settings.ctrlW) {
        window.addEventListener('beforeunload', function (e) {
            e.preventDefault();
            e.returnValue = '';
        })
    }
}

// toggles the cloaking feature
function updateCloak() {
    if (settings.cloak) {
        let link = document.querySelector("link[rel*='icon']");
        link.href = 'https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@da8f66de45396943270ef98ced3b3916eccf76d9/images/cloak.png';

        document.title = 'ㅤ';
    } else {
        let link = document.querySelector("link[rel*='icon']");
        link.href = 'https://cdn.jsdelivr.net/gh/Dave-031/bazinga-games@c51e4ab592074d988d82c7a3cf2b136097aa78c4/bright%20future/images/brightlogo.png'

        document.title = "Bright Future"
    }
}
function updateClockVisibility() {
    const clockElement = document.getElementById('taskbar-clock');
    if (clockElement) {
        clockElement.style.display = settings.showClock ? 'flex' : 'none';
    }
}

function ChangeCatTheme(theme) {
    
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
// #region settings check box logic
let settings = loadSettings();
settings.showCat = true; // Taskbar cat is locked visible for now — reserved for a future feature
// theme selecter
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


const darkModeToggle = document.getElementById('dark-mode-toggle');
if (darkModeToggle) {
    darkModeToggle.checked = settings.darkMode;
    darkModeToggle.addEventListener('change', (e) => {
        settings.darkMode = e.target.checked;
        //in theme.js
        updateDarkMode();
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

const enableMeowToggle = document.getElementById('enable-meow-toggle');
if (enableMeowToggle) {
    enableMeowToggle.checked = settings.enableMeow;
    enableMeowToggle.addEventListener('change', (e) => {
        settings.enableMeow = e.target.checked;

        saveSettings();
    });
}

//enables the cloakxena

const cloak = document.getElementById('cloak-toggle')
if (cloak) {
    cloak.checked = settings.cloak;
    cloak.addEventListener('change', (e) => {
        settings.cloak = e.target.checked;
        updateCloak();
        saveSettings();
    })
}

const ctrlW = document.getElementById('ctrlW-toggle')
if (ctrlW) {
    ctrlW.checked = settings.ctrlW;
    ctrlW.addEventListener('change', (e) => {
        settings.ctrlW = e.target.checked;
        updateCtrlW();
        saveSettings();
    })
}

const catThemeSelect = document.getElementById('cat-theme-select');
    if (catThemeSelect) {
        catThemeSelect.value = settings.catTheme;
        catThemeSelect.addEventListener('change', (e) => {
            settings.catTheme = e.target.value;
            ChangeCatTheme(settings.catTheme);
            saveSettings();
        })
    }
// #endregion 
