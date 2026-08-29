(function (){
    if (e.data === "gs-login-success"){
      updateBackgroundStatus();

     updateClockVisibility();

     applyTheme(settings.selectedTheme);

     updateCatSettings();

     updateCloak();

    updateDarkMode();

     updateClock();

     listZones();

    ChangeCatTheme();
    console.log("login success message received");
    }});
    