function initDesktop() {
    // Register welcome window
    registerWelcomeWindow();

    // Register other windows if needed
    // initCat();
    // initClock();
    // initDesktopIcons();
    // etc...
}

updateBackgroundStatus();
updateClockVisibility();
applyTheme(settings.selectedTheme);
updateCatSettings();
updateCloak();
updateDarkMode();
updateClock();
listZones();
console.log("login success message received");
initDesktop();
