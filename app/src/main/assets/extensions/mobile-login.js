(function () {
  "use strict";
  if (window.__HaxNewMobileLogin) return;
  window.__HaxNewMobileLogin = true;

  var btn = document.createElement("div");
  btn.id = "hn-mobile-login-btn";
  btn.style.cssText =
    "position:fixed;top:10px;right:10px;z-index:999999;" +
    "background:#5865F2;color:#fff;font-family:sans-serif;font-size:13px;" +
    "font-weight:600;padding:8px 14px;border-radius:20px;cursor:pointer;" +
    "display:flex;align-items:center;gap:6px;box-shadow:0 2px 8px rgba(0,0,0,.3);";
  btn.textContent = "Iniciar sesion con Discord";

  var avatarImg = document.createElement("img");
  avatarImg.style.cssText = "width:20px;height:20px;border-radius:50%;display:none;";

  btn.prepend(avatarImg);

  btn.addEventListener("click", function () {
    if (window.AndroidBridge && window.AndroidBridge.startDiscordLogin) {
      window.AndroidBridge.startDiscordLogin();
    }
  });

  document.body.appendChild(btn);

  // Llamado desde MainActivity.kt cuando el login con Discord termina bien.
  window.__haxnewOnDiscordLogin = function (data) {
    btn.textContent = data.username;
    avatarImg.src = data.avatarUrl;
    avatarImg.style.display = "inline-block";
    btn.prepend(avatarImg);
    window.HaxNewAuth = window.HaxNewAuth || {};
    window.HaxNewAuth.sesion = { user: data };
  };
})();
