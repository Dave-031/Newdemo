window.addEventListener("message", function(e){
    if (e.data === "gs-login-success"){
      bootApplication();
    }
  });