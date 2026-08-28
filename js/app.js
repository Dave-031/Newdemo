function bootApplication()
{
    updateBackgroundStatus();

    updateClockVisibility();

    applyTheme(settings.selectedTheme);

    updateCatSettings();

    updateCloak();

    updateDarkMode();

    updateClock();

    listZones();
}