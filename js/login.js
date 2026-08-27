(function(){
  function themeFile(){
    var t = "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@287aea7abcc16d830fed8c1e835df11cb4daca5a/logins/7.html";
    try {
      var raw = localStorage.getItem("windows_gamesite");
      if (raw) { var p = JSON.parse(raw); if (p && p.selectedTheme) t = p.selectedTheme; }
    } catch(e){}
    
    if (t.indexOf("98") !== -1) return "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@259f76e7d54f44b8b30263617aca2deeae760ed0/logins/98.html";
    if (t.indexOf("xp") !== -1) return "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@0840b621b862022bf7a6b25205b3b394b945ff87/logins/xp.html";
    return "https://cdn.jsdelivr.net/gh/Dave-031/Newdemo@287aea7abcc16d830fed8c1e835df11cb4daca5a/logins/7.html";
  }

  document.body.classList.add("gs-locked");
  var gate = document.createElement("div");
  gate.id = "login-gate";
  
  fetch(themeFile())
    .then(function(response) {
      if (!response.ok) throw new Error("Network response was not ok");
      return response.text();
    })
    .then(function(html) {
      var blob = new Blob([html], { type: 'text/html' });
      var blobUrl = URL.createObjectURL(blob);
      
      var frame = document.createElement("iframe");
      frame.src = blobUrl;
      gate.appendChild(frame);
    })
    .catch(function(err) {
      console.error("Failed to load login theme:", err);
    });

  document.body.appendChild(gate);

  window.addEventListener("message", function(e){
    if (e.data === "gs-login-success"){
      document.body.classList.remove("gs-locked");
      gate.remove();
    }
  });
})();
funciton unlockSite() {
    document.body.classList
}