function bootApplication()
{
    updateBackgroundStatus();

    updateClockVisibility();

    applyTheme(settings.selectedTheme);

    updateCatSettings();

    updateCloakVis();

    updateDarkMode();

    updateClock();

    listZones();
}