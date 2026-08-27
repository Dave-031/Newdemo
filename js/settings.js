//These are the settings fucntions
//default to base settings if not already assigned
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
            event.preventDefault();
            event.returnValue = '';
        })
    }
}

// toggles the cloaking feature
function updateCloakVis() {
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