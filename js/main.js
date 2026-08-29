function initDesktop() {
    // Register welcome window
    registerWelcomeWindow();
    updateBackgroundStatus();
    updateClockVisibility();
    applyTheme(settings.selectedTheme);
    updateCatSettings();
    updateCloak();
    updateDarkMode();
    updateClock();
    listZones();
    ChangeCatTheme(settings.catTheme);
    console.log("login success message received");
    // Register other windows if needed
    // initCat();
    // initClock();
    // initDesktopIcons();
    // etc...
}


initDesktop();
