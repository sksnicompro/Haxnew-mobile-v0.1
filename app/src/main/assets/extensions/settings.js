(function() {
  if (Injector.isMainFrame()) return;
  function t(key) {
    return window.__t ? window.__t(key) : key;
  }
  // ================================================================
  // OVERRIDE DE UBICACIÓN (bandera) — pestaña "Varios" (Diversos)
  // ----------------------------------------------------------------
  // El botón nativo "Override location" (game-min.js, dentro de la
  // sección nativa data-hook="miscsec") NO abre un dialog flotante:
  // empuja una vista de pantalla completa nueva (clase Hb) al stack
  // de vistas del juego vía H.h(Mc.mq) -> C.Na(...), el mismo
  // mecanismo de pila que ya nos dio el bug de roomlist->sala->ajustes.
  // Por eso aparecia "en sala" (por detras del overlay de Ajustes,
  // z-index:999985) y sin nada de liquid glass: esa vista nativa
  // nunca fue tocada por nuestro CSS.
  //
  // Fix: interceptamos el click en fase de captura (mismo patron que
  // interceptNativeSettingsButton mas abajo) ANTES de que corra el
  // onclick nativo, y en vez de dejarlo abrir esa vista, mostramos
  // nuestro propio selector con vidrio (mismo sistema hbxqa-*) que
  // ya usamos en quickavatar.js. El "Remove override" (cuando ya hay
  // bandera puesta) no tiene este bug -- ese camino no empuja ninguna
  // vista nueva, asi que lo dejamos pasar tal cual al handler nativo.
  //
  // Formato de localStorage.geo_override confirmado en game-min.js
  // (class la, metodo Ce()): JSON.stringify({lat, lon, code}). Como
  // ese valor se cachea en memoria al arrancar (class ya, wrapper de
  // settings) y no se re-lee solo, escribir el localStorage a mano
  // no alcanza -- hace falta reload() para que el juego lo tome,
  // igual que ya hace "Sincronizar Bypass" en nuestra pestaña Geo.
  // ================================================================
  var LOCPICK_COUNTRY_CODES = [ "ad", "ae", "af", "ag", "ai", "al", "am", "ao", "aq", "ar", "as", "at", "au", "aw", "ax", "az", "ba", "bb", "bd", "be", "bf", "bg", "bh", "bi", "bj", "bl", "bm", "bn", "bo", "bq", "br", "bs", "bt", "bv", "bw", "by", "bz", "ca", "cc", "cd", "cf", "cg", "ch", "ci", "ck", "cl", "cm", "cn", "co", "cr", "cu", "cv", "cw", "cx", "cy", "cz", "de", "dj", "dk", "dm", "do", "dz", "ec", "ee", "eg", "eh", "er", "es", "et", "fi", "fj", "fk", "fm", "fo", "fr", "ga", "gb", "gd", "ge", "gf", "gg", "gh", "gi", "gl", "gm", "gn", "gp", "gq", "gr", "gs", "gt", "gu", "gw", "gy", "hk", "hm", "hn", "hr", "ht", "hu", "id", "ie", "il", "im", "in", "io", "iq", "ir", "is", "it", "je", "jm", "jo", "jp", "ke", "kg", "kh", "ki", "km", "kn", "kp", "kr", "kw", "ky", "kz", "la", "lb", "lc", "li", "lk", "lr", "ls", "lt", "lu", "lv", "ly", "ma", "mc", "md", "me", "mf", "mg", "mh", "mk", "ml", "mm", "mn", "mo", "mp", "mq", "mr", "ms", "mt", "mu", "mv", "mw", "mx", "my", "mz", "na", "nc", "ne", "nf", "ng", "ni", "nl", "no", "np", "nr", "nu", "nz", "om", "pa", "pe", "pf", "pg", "ph", "pk", "pl", "pm", "pn", "pr", "ps", "pt", "pw", "py", "qa", "re", "ro", "rs", "ru", "rw", "sa", "sb", "sc", "sd", "se", "sg", "sh", "si", "sj", "sk", "sl", "sm", "sn", "so", "sr", "ss", "st", "sv", "sx", "sy", "sz", "tc", "td", "tf", "tg", "th", "tj", "tk", "tl", "tm", "tn", "to", "tr", "tt", "tv", "tw", "tz", "ua", "ug", "um", "us", "uy", "uz", "va", "vc", "ve", "vg", "vi", "vn", "vu", "wf", "ws", "xk", "ye", "yt", "za", "zm", "zw" ];
  function ensureLocPickStyles(doc) {
    if (doc.getElementById("hbx-locpick-style")) return;
    var style = doc.createElement("style");
    style.id = "hbx-locpick-style";
    style.textContent = [
      ".hbx-locpick-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:999999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .16s ease;}",
      ".hbx-locpick-overlay.is-open{opacity:1;}",
      ".hbx-locpick-card{width:320px;max-width:92vw;max-height:80vh;display:flex;flex-direction:column;background:var(--theme-bg-primary,#111);border:1px solid var(--theme-border,#333);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.5);padding:20px;box-sizing:border-box;font-family:sans-serif;transform:translateY(10px) scale(.98);transition:transform .16s ease;}",
      ".hbx-locpick-overlay.is-open .hbx-locpick-card{transform:translateY(0) scale(1);}",
      ".hbx-locpick-title{margin:0 0 14px 0;text-align:center;color:var(--theme-accent,#4ade80);font-size:13px;font-weight:700;letter-spacing:1px;}",
      ".hbx-locpick-search{width:100%;box-sizing:border-box;padding:10px 12px;margin-bottom:12px;background:var(--theme-bg-secondary,#1a1a1a);border:1px solid var(--theme-border-light,#444);color:var(--theme-text-primary,#fff);border-radius:8px;font-size:13px;outline:none;flex-shrink:0;}",
      ".hbx-locpick-list{overflow-y:auto;flex:1 1 auto;min-height:0;margin:0 -6px;padding:0 6px;}",
      ".hbx-locpick-item{display:flex;align-items:center;gap:10px;padding:9px 8px;border-radius:8px;cursor:pointer;transition:background .12s;}",
      ".hbx-locpick-item:hover{background:var(--theme-bg-hover,rgba(255,255,255,.08));}",
      ".hbx-locpick-item .flagico{width:22px;height:16px;display:inline-block;flex-shrink:0;border-radius:2px;}",
      ".hbx-locpick-code{color:var(--theme-text-primary,#fff);font-size:12.5px;font-weight:600;letter-spacing:.3px;}",
      ".hbx-locpick-cancel{margin-top:14px;width:100%;padding:10px;border:none;border-radius:8px;cursor:pointer;font-size:11px;font-weight:700;background:var(--theme-bg-secondary,#222);color:var(--theme-text-primary,#fff);flex-shrink:0;transition:opacity .15s;}",
      ".hbx-locpick-cancel:hover{opacity:.85;}",
      "html:not([data-theme=\"default\"]) .hbx-locpick-card{border-radius:24px!important;background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 100%), linear-gradient(180deg, #2a2a2e 0%, #1e1e22 100%)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border:1px solid rgba(255,255,255,0.20)!important;box-shadow:0 12px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)!important;}",
      "html:not([data-theme=\"default\"]) .hbx-locpick-title{color:rgba(255,255,255,0.95)!important;}",
      "html:not([data-theme=\"default\"]) .hbx-locpick-search{background:linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)!important;-webkit-backdrop-filter:blur(10px)!important;backdrop-filter:blur(10px)!important;border:1px solid rgba(255,255,255,0.20)!important;color:#fff!important;}",
      "html:not([data-theme=\"default\"]) .hbx-locpick-item:hover{background:linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)!important;}",
      "html:not([data-theme=\"default\"]) .hbx-locpick-cancel{background:linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%)!important;-webkit-backdrop-filter:blur(10px)!important;backdrop-filter:blur(10px)!important;border:1px solid rgba(255,255,255,0.20)!important;color:rgba(255,255,255,0.92)!important;}",
      "html:not([data-theme=\"default\"]) .hbx-locpick-cancel:hover{background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.11) 100%)!important;}"
    ].join("");
    doc.head.appendChild(style);
  }
  function closeLocPickOverlay(overlay) {
    overlay.classList.remove("is-open");
    setTimeout(function() {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 160);
  }
  function showLocationPicker(doc, onPick) {
    ensureLocPickStyles(doc);
    var overlay = doc.createElement("div");
    overlay.className = "hbx-locpick-overlay";
    var itemsHtml = LOCPICK_COUNTRY_CODES.map(function(code) {
      return '<div class="hbx-locpick-item" data-code="' + code + '"><span class="flagico f-' + code + '"></span><span class="hbx-locpick-code">' + code.toUpperCase() + "</span></div>";
    }).join("");
    overlay.innerHTML = '<div class="hbx-locpick-card">' + '<h3 class="hbx-locpick-title">' + t("ELEGIR UBICACIÓN") + "</h3>" + '<input id="locpick-search" type="text" class="hbx-locpick-search" placeholder="' + t("Buscar país...") + '">' + '<div class="hbx-locpick-list" id="locpick-list">' + itemsHtml + "</div>" + '<button id="locpick-cancel" type="button" class="hbx-locpick-cancel">' + t("CANCELAR") + "</button>" + "</div>";
    doc.body.appendChild(overlay);
    requestAnimationFrame(function() {
      overlay.classList.add("is-open");
    });
    function close() {
      closeLocPickOverlay(overlay);
      doc.removeEventListener("keydown", escHandler, true);
    }
    function escHandler(e) {
      if (e.key === "Escape") close();
    }
    overlay.onclick = function(ev) {
      if (ev.target === overlay) close();
    };
    overlay.querySelector("#locpick-cancel").onclick = close;
    var list = overlay.querySelector("#locpick-list");
    var items = list.querySelectorAll(".hbx-locpick-item");
    for (var i = 0; i < items.length; i++) {
      (function(item) {
        item.onclick = function() {
          var code = item.getAttribute("data-code");
          close();
          onPick(code);
        };
      })(items[i]);
    }
    var search = overlay.querySelector("#locpick-search");
    search.oninput = function() {
      var q = search.value.trim().toLowerCase();
      for (var i2 = 0; i2 < items.length; i2++) {
        var code = items[i2].getAttribute("data-code");
        items[i2].style.display = !q || code.indexOf(q) !== -1 ? "flex" : "none";
      }
    };
    doc.addEventListener("keydown", escHandler, true);
    setTimeout(function() {
      search.focus();
    }, 50);
  }
  function saveLocationOverride(code) {
    var real = null;
    try {
      real = JSON.parse(localStorage.getItem("geo") || "null");
    } catch (e) {}
    var payload = {
      lat: real && typeof real.lat === "number" ? real.lat : 0,
      lon: real && typeof real.lon === "number" ? real.lon : 0,
      code: code
    };
    localStorage.setItem("geo_override", JSON.stringify(payload));
  }
  function interceptLocationOverrideButton(ev) {
    var btn = ev.target.closest && ev.target.closest("#loc-ovr-btn");
    if (!btn) return;
    var label = (btn.textContent || "").trim();
    // Solo interceptamos el camino de "poner una bandera nueva". El de
    // "Remove override" no tiene el bug (no empuja ninguna vista), asi
    // que lo dejamos seguir directo al handler nativo.
    if (label !== "Override location") return;
    ev.preventDefault();
    ev.stopImmediatePropagation();
    showLocationPicker(document, function(code) {
      saveLocationOverride(code);
      if (window.showToast) window.showToast(t("Bandera guardada: ") + code.toUpperCase() + t(" — recargando..."), "success");
      setTimeout(function() {
        window.location.reload();
      }, 500);
    });
  }
  function modifySettingsDialog(doc) {
    var dialog = doc.querySelector(".dialog.settings-view");
    if (!dialog) return;
    if (doc.getElementById("settings-sidebar-panel")) return;
    if (!doc.getElementById("settings-sidebar-anim")) {
      var animStyle = doc.createElement("style");
      animStyle.id = "settings-sidebar-anim";
      animStyle.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;500;700;800;900&display=swap');
        @keyframes sbSlideIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes sbFadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}
        @keyframes stgSpin{to{transform:rotate(360deg)}}
        @keyframes stgPulse{0%,100%{opacity:.55}50%{opacity:1}}

        /* ================================================================
           AJUSTES — pestaña de pantalla completa: logitos a la izquierda,
           opciones a la derecha (versión simple, sin el emblema dorado ni
           las barras de acento de la iteración anterior).

           ESTRUCTURA (siempre activa, en TODOS los temas, incluido
           "default"): tamaño, posición, layout en flex, tipografía y
           colores planos de respaldo (var(--theme-*, fallback), sin
           blur) — así el panel se ve completo y prolijo aunque el
           usuario tenga el tema por defecto.

           PIEL "LIQUID GLASS" (gateada con html:not([data-theme="default"]),
           misma receta que liquid-glass-room-dialogs.js: gradiente de
           brillo blanco arriba sobre base sólida oscura, borde
           rgba(255,255,255,.20-.32), inset highlight — SIN backdrop-filter.
           En tema "default" NO se aplica nada de esto, y el panel queda
           con los mismos sólidos planos que usa el resto de esa paleta.

           NOTA: nunca se toca opacity/animation del .dialog en sí (rompe
           la transición nativa de cierre y te deja pegado en Ajustes al
           volver a la sala) — solo se anima contenido interno.
           ================================================================ */
        .dialog.settings-view{
          position:fixed!important; inset:0!important;
          top:0!important; left:0!important; right:0!important; bottom:0!important;
          width:100vw!important; height:100vh!important;
          max-width:none!important; max-height:none!important; min-width:0!important;
          margin:0!important; padding:0!important; transform:none!important;
          border:none!important; border-radius:0!important; box-shadow:none!important;
          background:var(--theme-bg-primary,#1A2125)!important;
          display:flex!important; flex-direction:row!important; align-items:stretch!important;
          overflow:hidden!important;
          font-family:'Outfit',sans-serif!important;
          z-index:999985!important;
        }
        .dialog.settings-view h1{ display:none!important; }
        .dialog.settings-view [data-hook="presskey"]{ position:absolute!important; inset:0!important; z-index:5!important; }
        .dialog.settings-view > .tabcontents{
          order:2!important; flex:1 1 auto!important; min-width:0!important;
          width:auto!important; height:100%!important; max-height:none!important;
          box-sizing:border-box!important; padding:60px 76px 48px!important;
          overflow-y:auto!important; overflow-x:hidden!important;
          background:transparent!important; color:var(--theme-text-primary,#fff)!important;
          scrollbar-width:thin!important; position:relative!important;
        }
        .dialog.settings-view > .tabcontents::-webkit-scrollbar{ width:8px!important; }
        .dialog.settings-view > .tabcontents::-webkit-scrollbar-thumb{ background:rgba(255,255,255,.14)!important; border-radius:8px!important; }
        .dialog.settings-view .tabcontents > .section{ animation:sbFadeIn .2s ease both!important; }
        .dialog.settings-view .tabcontents label,
        .dialog.settings-view .tabcontents .lbl{ color:var(--theme-text-secondary,rgba(255,255,255,.55))!important; }
        .dialog.settings-view .tabcontents .val{ color:var(--theme-text-primary,#fff)!important; }

        /* --- Encabezado de sección (título + línea separadora) --- */
        #settings-section-header{ margin:0 0 26px; }
        #settings-section-title{
          color:var(--theme-text-primary,#fff); font-family:'Outfit',sans-serif; font-size:30px; font-weight:800;
          letter-spacing:.2px; margin:0; line-height:1.05;
        }
        #settings-section-accent{
          width:40px; height:4px; border-radius:4px; margin-top:12px;
          background:var(--theme-border-light,rgba(255,255,255,.25));
        }

        /* --- Columna izquierda: "AJUSTES" + nav de logitos --- */
        #settings-sidebar-panel{
          order:1!important; position:relative!important;
          left:0!important; top:0!important; bottom:auto!important;
          width:250px!important; height:100%!important; flex:0 0 250px!important;
          background:var(--theme-bg-secondary,#1A2125)!important;
          border:none!important; border-right:1px solid var(--theme-border,#2a3138)!important;
          border-radius:0!important;
          display:flex!important; flex-direction:column!important; align-items:stretch!important;
          gap:6px!important; padding:26px 14px 16px!important; box-sizing:border-box!important;
          z-index:1!important; overflow-y:auto!important; overflow-x:hidden!important;
        }
        #settings-sidebar-emblem{
          width:100%; display:flex; flex-direction:column; align-items:flex-start;
          padding:0 10px; margin-bottom:18px;
        }
        #settings-sidebar-emblem .stg-ring{
          display:none;
        }
        #settings-sidebar-emblem .stg-caption{
          color:var(--theme-text-secondary,rgba(255,255,255,.4)); font-size:11px; font-weight:800;
          letter-spacing:2px; text-transform:uppercase;
        }
        .settings-sidebar-btn{
          position:relative;
          width:100%!important; height:auto!important; min-height:0!important;
          display:flex!important; flex-direction:row!important; align-items:center!important;
          justify-content:flex-start!important; gap:12px!important;
          padding:10px 12px 10px 14px!important; margin:0!important; box-sizing:border-box!important;
          background:transparent!important; border:none!important; border-radius:16px!important;
          color:var(--theme-text-secondary,rgba(255,255,255,.55))!important; cursor:pointer!important;
          font-family:'Outfit',sans-serif!important; font-size:12.5px!important; font-weight:700!important;
          letter-spacing:.2px!important; text-align:left!important;
          transition:background .16s ease,color .16s ease,transform .1s ease!important;
        }
        .settings-sidebar-btn .sb-icon{
          flex-shrink:0; width:30px; height:30px; border-radius:12px;
          display:flex; align-items:center; justify-content:center;
          background:var(--theme-bg-tertiary,rgba(255,255,255,.05)); transition:background .16s ease;
        }
        .settings-sidebar-btn .sb-label{
          flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
        }
        .settings-sidebar-btn svg{ width:15px!important; height:15px!important; display:block; }
        .settings-sidebar-btn:hover{ background:var(--theme-bg-hover,rgba(255,255,255,.055))!important; color:var(--theme-text-primary,#fff)!important; }
        .settings-sidebar-btn:active{ transform:scale(0.97)!important; }
        .settings-sidebar-btn.selected{ background:var(--theme-bg-hover,rgba(255,255,255,.08))!important; color:var(--theme-text-primary,#fff)!important; box-shadow:none!important; }
        .settings-sidebar-btn.selected .sb-icon{ background:rgba(255,255,255,.14); color:var(--theme-text-primary,#fff); }
        #settings-sidebar-panel .settings-sidebar-btn{ animation:sbSlideIn 0.22s ease both; }
        #settings-sidebar-panel .settings-sidebar-btn:nth-child(2){animation-delay:0.02s}
        #settings-sidebar-panel .settings-sidebar-btn:nth-child(3){animation-delay:0.04s}
        #settings-sidebar-panel .settings-sidebar-btn:nth-child(4){animation-delay:0.06s}
        #settings-sidebar-panel .settings-sidebar-btn:nth-child(5){animation-delay:0.08s}
        #settings-sidebar-panel .settings-sidebar-btn:nth-child(6){animation-delay:0.10s}
        #settings-sidebar-panel .settings-sidebar-btn:nth-child(7){animation-delay:0.12s}
        #settings-sidebar-panel .settings-sidebar-btn:nth-child(8){animation-delay:0.14s}
        #settings-sidebar-panel .settings-sidebar-btn:nth-child(9){animation-delay:0.16s}
        #settings-sidebar-panel .settings-sidebar-btn:nth-child(10){animation-delay:0.18s}
        #settings-sidebar-panel .settings-sidebar-btn:nth-child(11){animation-delay:0.20s}
        #settings-sidebar-panel [data-spacer]{ flex:1!important; min-height:8px!important; }
        #settings-sidebar-panel > div[style*="height:1px"]{
          width:calc(100% - 20px)!important; margin:6px auto!important; background:var(--theme-border,rgba(255,255,255,.08))!important;
        }
        .settings-sidebar-btn[data-close]{ color:var(--theme-text-secondary,rgba(255,255,255,.4))!important; }
        .settings-sidebar-btn[data-close]:hover{ background:rgba(220,38,38,.14)!important; color:#f87171!important; }

        .perf-option-row{transition:background 0.15s!important;}
        .perf-checkbox{transition:background 0.18s,border-color 0.18s!important;}
        .theme-option{transition:background 0.18s,border-color 0.18s,box-shadow 0.18s!important;}
        .theme-option.selected{box-shadow:0 0 0 1px #c9a227!important;}
        .theme-option:hover{box-shadow:0 2px 8px rgba(0,0,0,0.3)!important;}
        #settings-sidebar-tooltip{ display:none!important; }

        /* ================================================================
           PIEL LIQUID GLASS — solo temas custom (no "default").
           Misma receta EXACTA que liquid-glass-room-dialogs.js: gradiente
           de brillo blanco arriba sobre base sólida oscura (#2a2a2e→#1e1e22),
           borde rgba(255,255,255,.20), sombra exterior + inset highlight,
           SIN backdrop-filter (esos diálogos tampoco usan blur).
           ================================================================ */
        html:not([data-theme="default"]) .dialog.settings-view.dialog.settings-view{
          background:
            linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 100%),
            linear-gradient(180deg, #232326 0%, #17171a 100%)!important;
          -webkit-backdrop-filter:none!important;
          backdrop-filter:none!important;
        }
        /* --- Fondo negro sólido (#111111, var(--theme-bg-primary)) que
           styles.js le pone a .settings-view .section por detrás de cada
           bloque de opciones (Sonido, Video, etc.) -- lo sacamos para que
           se vea el vidrio del panel entero por detrás, en vez de una
           caja negra sólida tapando el degradé. --- */
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents > .section{
          background:transparent!important;
          border:none!important;
        }

        /* --- Selects y botones dentro de Ajustes (Viewport Mode, FPS Limit,
           Calidad, Resolución, "Maximo rendimiento", etc.) -- misma receta
           EXACTA que .room-view .settings select / button[data-hook="stadium-pick"]
           en liquid-glass-room.js: vidrio con blur + degradé blanco, borde
           rgba(255,255,255,.20-.22), sin tocar checkboxes (son <div>, no
           <button>) ni los botones del sidebar (viven fuera de .tabcontents). --- */
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents select{
          background:linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)!important;
          -webkit-backdrop-filter:blur(10px)!important;
          backdrop-filter:blur(10px)!important;
          border:1px solid rgba(255,255,255,0.22)!important;
          border-radius:10px!important;
          color:#fff!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents select option{
          background:#1e1e22!important;
          color:#fff!important;
        }
        /* Nota: hbx-accent-gold quedó puesta en el JS (Sincronizar Bypass,
           Usar, Añadir, etc.) pero acá no se usa para nada especial -- esos
           botones nunca se vieron dorados en el juego (una regla vieja y
           genérica de styles.js con !important siempre les ganó al
           background:#c9a227 inline), así que van con el mismo vidrio
           blanco parejo que el resto, como el resto de los controles. */
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents button{
          background:linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%)!important;
          border:1px solid rgba(255,255,255,0.20)!important;
          border-radius:10px!important;
          color:rgba(255,255,255,0.92)!important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.22)!important;
          transition:background 0.15s ease!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents button:hover{
          background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.11) 100%)!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents button:active{
          transform:scale(0.97)!important;
        }

        /* --- Tiles grandes de Enhancements (Ball & Avatar, Field Skin,
           Scoreboard, Keystrokes, FPS, Ping, Clock, Room Info, Spotify,
           Screen Video) -- mismo vidrio que selects/botones. buildBigTile
           les pone background:var(--theme-bg-secondary) inline sin
           !important, así que esta regla les gana sin tocar el JS. Se
           matchea por sufijo "-tile" en data-hook, que cubren todos. --- */
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents [data-hook$="-tile"]{
          background:linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)!important;
          -webkit-backdrop-filter:blur(12px)!important;
          backdrop-filter:blur(12px)!important;
          border:1px solid rgba(255,255,255,0.18)!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents [data-hook$="-tile"]:hover{
          background:linear-gradient(180deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.09) 100%)!important;
          border-color:rgba(255,255,255,0.28)!important;
        }
        /* Overlay de "Bloqueado" (Discord) encima del tile: mismo blur que
           ya trae inline, pero base más clara para que combine con el
           vidrio del tile de atrás en vez de la caja casi negra de antes. */
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents [data-lock-overlay="true"]{
          background:linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)!important;
        }
        /* Descripción de cada tile (ej. "Personalizá tu avatar y tu pelota"):
           en var(--theme-text-muted) queda gris #666 y se pierde contra el
           vidrio; en blanco (con un poco de transparencia para diferenciarla
           del título) se lee bien. */
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents [data-hook$="-tile"] .hbx-tile-desc{
          color:rgba(255,255,255,0.75)!important;
        }

        /* --- Filas/avisos sueltos sin clase propia (Geo: "Ubicación real",
           "Override activo", tip de abajo; Multi-Auth: filas de la lista,
           tip final) -- misma historia: en vez de matchear el style inline
           (poco confiable), se les agrega la clase hbx-glasschip desde el JS
           justo al crearlas. --- */
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents .hbx-glasschip{
          background:linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)!important;
          -webkit-backdrop-filter:blur(12px)!important;
          backdrop-filter:blur(12px)!important;
          border-color:rgba(255,255,255,0.16)!important;
        }

        /* --- Filas ya con tinte dorado (auth/override actualmente activo,
           clase hbx-glasschip-gold puesta condicionalmente desde el JS
           según el estado): solo blur, sin tocar el color/borde dorado. --- */
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents .hbx-glasschip-gold{
          -webkit-backdrop-filter:blur(12px)!important;
          backdrop-filter:blur(12px)!important;
        }

        /* --- Filas de atajos de teclado (Up/Down/Left/.../Kick) -- misma
           receta de vidrio que .room-view .player-list-view: la fila entera
           (.inputrow) queda como tarjeta con blur, y cada tecla asignada
           ("ArrowUp x", "W x") + el botón "+" quedan como pastillas de vidrio
           más brillantes encima, en vez del gris sólido plano de antes. --- */
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents .inputrow{
          background:linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)!important;
          -webkit-backdrop-filter:blur(14px)!important;
          backdrop-filter:blur(14px)!important;
          border:1px solid rgba(255,255,255,0.14)!important;
          border-radius:12px!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents .inputrow > div:first-child{
          color:rgba(255,255,255,0.92)!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents .inputrow > div:not(:first-child),
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents .inputrow > i.icon-plus{
          background:linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%)!important;
          border:1px solid rgba(255,255,255,0.20)!important;
          border-radius:8px!important;
          color:rgba(255,255,255,0.92)!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents .inputrow > div:not(:first-child):hover,
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents .inputrow > i.icon-plus:hover{
          background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.11) 100%)!important;
        }

        /* --- Input de texto (Host Token, y cualquier otro campo de texto
           dentro de Ajustes) -- estos vienen con estilo inline desde su
           propio archivo (ej. hosttoken.js: background:var(--theme-bg-
           secondary) sin !important), así que un !important acá les gana
           sin problema. Mismo vidrio que selects/botones. --- */
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents input[type="text"],
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents input:not([type]){
          background:linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 100%)!important;
          -webkit-backdrop-filter:blur(10px)!important;
          backdrop-filter:blur(10px)!important;
          border:1px solid rgba(255,255,255,0.20)!important;
          border-radius:10px!important;
          color:#fff!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents input[type="text"]::placeholder,
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents input:not([type])::placeholder{
          color:rgba(255,255,255,0.45)!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents input[type="text"]:focus,
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents input:not([type]):focus{
          border-color:rgba(255,255,255,0.32)!important;
          background:linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0.08) 100%)!important;
        }
        html:not([data-theme="default"]) #settings-sidebar-panel.settings-sidebar-panel,
        html:not([data-theme="default"]) #settings-sidebar-panel{
          background:
            linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.04) 100%),
            linear-gradient(180deg, #2a2a2e 0%, #1e1e22 100%)!important;
          -webkit-backdrop-filter:none!important;
          backdrop-filter:none!important;
          border-right:1px solid rgba(255,255,255,0.20)!important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.25), 4px 0 24px rgba(0,0,0,0.35)!important;
        }
        html:not([data-theme="default"]) .settings-sidebar-btn .sb-icon{
          background:linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%)!important;
          border:1px solid rgba(255,255,255,0.20)!important;
        }
        /* Estado base (idle): siempre con la piel de vidrio, no solo al pasar el mouse */
        html:not([data-theme="default"]) .settings-sidebar-btn{
          background:linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)!important;
          border:1px solid rgba(255,255,255,0.14)!important;
          color:rgba(255,255,255,0.80)!important;
        }
        html:not([data-theme="default"]) .settings-sidebar-btn:hover{
          background:linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%)!important;
          border:1px solid rgba(255,255,255,0.20)!important;
          color:rgba(255,255,255,0.95)!important;
        }
        html:not([data-theme="default"]) .settings-sidebar-btn.selected{
          background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.13) 100%)!important;
          border:1px solid rgba(255,255,255,0.32)!important;
          color:#fff!important;
          box-shadow:inset 0 1px 0 rgba(255,255,255,0.25)!important;
        }
        html:not([data-theme="default"]) .settings-sidebar-btn.selected:hover{
          background:linear-gradient(180deg, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0.16) 100%)!important;
        }
        html:not([data-theme="default"]) .settings-sidebar-btn.selected .sb-icon{
          background:rgba(255,255,255,0.30)!important; border-color:rgba(255,255,255,0.35)!important;
        }
        html:not([data-theme="default"]) .settings-sidebar-btn[data-close]:hover{
          background:linear-gradient(180deg, rgba(220,38,38,0.28) 0%, rgba(220,38,38,0.12) 100%)!important;
          border:1px solid rgba(220,38,38,0.35)!important;
          color:#fff!important;
        }
        html:not([data-theme="default"]) #settings-sidebar-panel > div[style*="height:1px"]{
          background:rgba(255,255,255,0.16)!important;
        }
        html:not([data-theme="default"]) #settings-section-title{
          color:rgba(255,255,255,0.95)!important;
        }
        html:not([data-theme="default"]) #settings-section-accent{
          background:rgba(255,255,255,0.20)!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents label,
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents .lbl{
          color:rgba(255,255,255,0.60)!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view .tabcontents .val{
          color:rgba(255,255,255,0.92)!important;
        }
        html:not([data-theme="default"]) .dialog.settings-view > .tabcontents::-webkit-scrollbar-thumb{
          background:rgba(255,255,255,0.20)!important;
        }
      `;
      doc.head && doc.head.appendChild(animStyle);
    }
    var tooltip = doc.getElementById("settings-sidebar-tooltip");
    if (!tooltip) {
      tooltip = doc.createElement("div");
      tooltip.id = "settings-sidebar-tooltip";
      tooltip.style.cssText = [ "position:fixed", "background:var(--theme-tooltip-bg)", "color:var(--theme-text-primary)", "padding:5px 10px", "border-radius:6px", "font-size:11px", "font-weight:500", "pointer-events:none", "opacity:0", "z-index:10001", "white-space:nowrap", "border:1px solid var(--theme-tooltip-border)", "box-shadow:0 4px 16px rgba(0,0,0,0.4)", "letter-spacing:0.3px" ].join(";");
      doc.body.appendChild(tooltip);
    }
    var tooltipTimer = null;
    function showTooltip(el, text) {
      clearTimeout(tooltipTimer);
      var rect = el.getBoundingClientRect();
      tooltip.textContent = text;
      tooltip.style.left = rect.right + 10 + "px";
      tooltip.style.top = rect.top + rect.height / 2 - 14 + "px";
      tooltip.className = "visible";
      tooltip.style.opacity = "1";
    }
    function hideTooltip() {
      tooltip.className = "hidden";
      tooltip.style.opacity = "0";
    }
    function addTooltip(el, text) {
      if (!el) return;
      el.addEventListener("mouseenter", function() {
        showTooltip(el, text);
      });
      el.addEventListener("mouseleave", hideTooltip);
      el.addEventListener("click", hideTooltip);
    }
    var sidebar = doc.createElement("div");
    sidebar.id = "settings-sidebar-panel";
    sidebar.style.cssText = [ "position:relative", "left:0", "top:0", "width:250px", "display:flex", "flex-direction:column", "align-items:stretch", "gap:3px", "box-sizing:border-box", "z-index:1", "overflow-y:auto", "overflow-x:hidden", "scrollbar-width:none" ].join(";");
    var emblem = doc.createElement("div");
    emblem.id = "settings-sidebar-emblem";
    emblem.innerHTML = '<div class="stg-ring"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg></div><div class="stg-caption">' + t("Ajustes") + "</div>";
    sidebar.appendChild(emblem);
    var sbScrollStyle = doc.createElement("style");
    sbScrollStyle.textContent = "#settings-sidebar-panel::-webkit-scrollbar{display:none!important;}";
    doc.head && doc.head.appendChild(sbScrollStyle);
    sidebar.addEventListener("mouseleave", hideTooltip);
    var tabs = dialog.querySelector(".tabs");
    var tabcontentsEl = dialog.querySelector(".tabcontents");
    var sectionTitle = doc.getElementById("settings-section-title");
    if (!sectionTitle && tabcontentsEl) {
      var sectionHeader = doc.createElement("div");
      sectionHeader.id = "settings-section-header";
      sectionTitle = doc.createElement("div");
      sectionTitle.id = "settings-section-title";
      sectionTitle.textContent = t("Ajustes");
      var sectionAccent = doc.createElement("div");
      sectionAccent.id = "settings-section-accent";
      sectionHeader.appendChild(sectionTitle);
      sectionHeader.appendChild(sectionAccent);
      tabcontentsEl.insertBefore(sectionHeader, tabcontentsEl.firstChild);
    }
    var tabIcons = {
      soundbtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>',
        tooltip: t("Som"),
        order: 1
      },
      videobtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
        tooltip: t("Vídeo"),
        order: 2
      },
      inputbtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M6 16h12"/></svg>',
        tooltip: t("Controles"),
        order: 3
      },
      perfbtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
        tooltip: t("Desempenho"),
        order: 4
      },
      avatarbtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>',
        tooltip: t("Avatares"),
        order: 5
      },
      tokenbtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
        tooltip: t("Host Token"),
        order: 6
      },
      themebtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
        tooltip: t("Temas"),
        order: 7
      },
      multiauthbtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="9" r="4"/><path d="M9 13c-4 0-6 2-6 5v1h12v-1c0-3-2-5-6-5"/><path d="M16 11h6m-3-3v6"/></svg>',
        tooltip: t("Multi-Auth"),
        order: 8
      },
      geobtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
        tooltip: t("Geo Bypass"),
        order: 9
      },
      miscbtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.6 9a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
        tooltip: t("Diversos"),
        order: 10
      },
      enhancementsbtn: {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 6h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a2 2 0 0 0 0 4h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1a2 2 0 0 0-4 0v1a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a2 2 0 0 0 0-4H6a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h3a1 1 0 0 0 1-1V4a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1z"/></svg>',
        tooltip: t("Enhancement"),
        order: 12
      }
    };
    var tabOrder = [ "soundbtn", "videobtn", "inputbtn", "perfbtn", "avatarbtn", "tokenbtn", "themebtn", "multiauthbtn", "geobtn", "miscbtn", "enhancementsbtn" ];
    function createThemeTab(doc, tabs) {
      if (tabs.querySelector('button[data-hook="themebtn"]')) return;
      var themeBtn = doc.createElement("button");
      themeBtn.setAttribute("data-hook", "themebtn");
      themeBtn.textContent = t("Temas");
      themeBtn.style.display = "none";
      tabs.appendChild(themeBtn);
      var themeSection = doc.createElement("section");
      themeSection.className = "theme-section section";
      themeSection.setAttribute("data-hook", "theme-section");
      themeSection.style.display = "none";
      var container = doc.createElement("div");
      container.className = "theme-container";
      var themeGroup = doc.createElement("div");
      themeGroup.className = "settings-group";
      var themeLabel = doc.createElement("div");
      themeLabel.className = "settings-group-label";
      themeLabel.textContent = t("Tema");
      themeGroup.appendChild(themeLabel);
      var themeOptions = doc.createElement("div");
      themeOptions.className = "theme-options";
      var themes = window.HaxThemes ? window.HaxThemes.getThemes() : {
        default: {
          name: t("Padrão")
        },
        dark: {
          name: t("Escuro")
        },
        light: {
          name: t("Claro")
        }
      };
      var currentTheme = window.HaxThemes ? window.HaxThemes.getCurrent() : "dark";
      var themeDescs = {
        default: t("Sem alterações de cor"),
        dark: t("Reduz o cansaço visual"),
        light: t("Melhor visibilidade"),
        onix: t("Preto total, escuridão absoluta")
      };
      for (var key in themes) {
        var option = doc.createElement("div");
        option.className = "theme-option" + (key === currentTheme ? " selected" : "");
        option.setAttribute("data-theme", key);
        var textWrapper = doc.createElement("div");
        textWrapper.className = "theme-text";
        var name = doc.createElement("span");
        name.className = "theme-name";
        name.textContent = themes[key].name;
        textWrapper.appendChild(name);
        var desc = doc.createElement("span");
        desc.className = "theme-desc";
        desc.textContent = themeDescs[key] || "";
        textWrapper.appendChild(desc);
        option.appendChild(textWrapper);
        var check = doc.createElement("div");
        check.className = "theme-check";
        check.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
        option.appendChild(check);
        option.addEventListener("click", function(themeKey) {
          return function() {
            var allOptions = themeOptions.querySelectorAll(".theme-option");
            for (var i = 0; i < allOptions.length; i++) allOptions[i].classList.remove("selected");
            this.classList.add("selected");
            if (window.HaxThemes) window.HaxThemes.apply(themeKey);
          };
        }(key));
        themeOptions.appendChild(option);
      }
      themeGroup.appendChild(themeOptions);
      container.appendChild(themeGroup);
      themeSection.appendChild(container);
      var dialogContent = dialog.querySelector(".section") || dialog;
      dialogContent.parentNode.insertBefore(themeSection, dialogContent.nextSibling);
      themeBtn.addEventListener("click", function() {
        var sections = dialog.querySelectorAll(".tabcontents > .section");
        for (var i = 0; i < sections.length; i++) sections[i].style.display = "none";
        themeSection.style.display = "block";
        var allTabs = tabs.querySelectorAll("button");
        for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove("selected");
        themeBtn.classList.add("selected");
      });
      var originalTabs = tabs.querySelectorAll('button:not([data-hook="themebtn"])');
      for (var i = 0; i < originalTabs.length; i++) {
        originalTabs[i].addEventListener("click", function() {
          themeSection.style.display = "none";
          var sections = dialog.querySelectorAll(".tabcontents > .section");
          for (var j = 0; j < sections.length; j++) sections[j].style.display = "";
        });
      }
      return themeBtn;
    }
    function createPerfTab(doc, tabs) {
      if (tabs.querySelector('button[data-hook="perfbtn"]')) return;
      var perfBtn = doc.createElement("button");
      perfBtn.setAttribute("data-hook", "perfbtn");
      perfBtn.textContent = t("Desempenho");
      perfBtn.style.display = "none";
      tabs.appendChild(perfBtn);
      var perfSection = doc.createElement("section");
      perfSection.className = "perf-section section";
      perfSection.setAttribute("data-hook", "perf-section");
      perfSection.style.display = "none";
      var PERF_OPTIONS = [ {
        hook: "tmisc-simplelines",
        title: "Lineas simplificadas",
        desc: "Reduce el grosor de lineas de 3px a 1px."
      }, {
        hook: "tmisc-ultrasimplelines",
        title: "Curvas en lineas rectas",
        desc: "Convierte curvas en lineas rectas."
      }, {
        hook: "tmisc-culling",
        title: "Culling de viewport",
        desc: "No dibuja objetos fuera de pantalla."
      }, {
        hook: "tmisc-showavatars",
        title: "Desactivar avatares y colores",
        desc: "Elimina avatares y usa colores estandar."
      }, {
        hook: "tmisc-shownames",
        title: "Desactivar nombres",
        desc: "Oculta los nombres de los jugadores."
      }, {
        hook: "tmisc-simplefield",
        title: "Campo simplificado",
        desc: "Usa colores solidos en lugar de gradientes."
      }, {
        hook: "tmisc-lowqualitycircles",
        title: "Circulos baja calidad",
        desc: "Pre-renderiza circulos. Mas rapido pero pixelado."
      }, {
        hook: "tmisc-showanimations",
        title: "Desactivar animaciones de gol",
        desc: "Elimina animaciones al marcar gol."
      }, {
        hook: "tmisc-showindicator",
        title: "Desactivar indicador",
        desc: "El circulo que muestra donde estas."
      }, {
        hook: "tmisc-showchat",
        title: "Desactivar indicador de chat",
        desc: "El globo que aparece cuando alguien habla."
      }, {
        hook: "tmisc-imgsmoothing",
        title: "Sin suavizado de imagen",
        desc: "Desactiva el antialiasing. Visual pixelado pero mas rapido."
      }, {
        hook: "noGoalGray",
        title: "Sin gris al gol",
        desc: "Elimina el efecto gris del canvas al marcar gol.",
        custom: true
      }, {
        hook: "noGoalBar",
        title: "Sin barra de gol",
        desc: "Oculta la barra blanca animada al marcar gol.",
        custom: true
      }, {
        hook: "noGoalAnim",
        title: "Sin texto de gol",
        desc: "Elimina el texto Scores!/Victorious! al gol.",
        custom: true
      }, {
        hook: "showKickRange",
        title: "Sin kick range",
        desc: "Oculta el circulo de alcance de patada.",
        custom: true,
        inverted: true
      }, {
        hook: "no_hover_fx",
        title: "Sin efectos al pasar el mouse",
        desc: "Apaga brillos y movimientos al pasar el cursor. Cada hover fuerza un repintado.",
        custom: true,
        directKey: true
      }, {
        hook: "flat_backgrounds",
        title: "Fondos planos",
        desc: "Reemplaza los degradados animados de fondo por color solido.",
        custom: true,
        directKey: true
      }, {
        hook: "less_refresh",
        title: "Menos refrescos",
        desc: "Baja la frecuencia de actualizacion del panel de FPS y de ping.",
        custom: true,
        directKey: true
      } ];
      var container = doc.createElement("div");
      container.style.cssText = "display:flex;flex-direction:column;gap:2px;";
      var header = doc.createElement("div");
      header.style.cssText = "color:var(--theme-text-muted);font-size:11px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--theme-border);letter-spacing:0.3px;";
      header.innerHTML = "Activa las opciones para mejorar el FPS.";
      container.appendChild(header);
      var maxPerfBtn = doc.createElement("button");
      maxPerfBtn.className = "hbx-accent-gold";
      maxPerfBtn.style.cssText = "width:100%;margin-bottom:10px;padding:10px;background:#c9a227;border:none;border-radius:6px;color:#000;cursor:pointer;font-size:12px;font-weight:700;letter-spacing:0.2px;";
      maxPerfBtn.textContent = "Maximo rendimiento (activar todo)";
      maxPerfBtn.onmouseenter = function() {
        maxPerfBtn.style.opacity = "0.9";
      };
      maxPerfBtn.onmouseleave = function() {
        maxPerfBtn.style.opacity = "1";
      };
      maxPerfBtn.onclick = function() {
        var miscSection = dialog.querySelector('[data-hook="miscsec"]');
        PERF_OPTIONS.forEach(function(opt) {
          var isActive = false;
          if (opt.directKey) {
            try {
              isActive = localStorage.getItem(opt.hook) === "true";
            } catch (e) {}
          } else if (opt.custom) {
            try {
              var _po = JSON.parse(localStorage.getItem("hbx_perf_opts") || "{}");
              var _v = _po[opt.hook];
              isActive = opt.inverted ? _v === false || _v === "false" : _v === true || _v === "true";
            } catch (e) {}
          } else if (miscSection) {
            var originalToggle = miscSection.querySelector('[data-hook="' + opt.hook + '"]');
            if (originalToggle) {
              var icons = originalToggle.getElementsByTagName("i");
              var isToggleActive = false;
              for (var i = 0; i < icons.length; i++) {
                if (icons[i].classList.contains("icon-ok")) {
                  isToggleActive = true;
                  break;
                }
              }
              var isInverted = [ "tmisc-showavatars", "tmisc-shownames", "tmisc-showanimations", "tmisc-showindicator", "tmisc-showchat" ].indexOf(opt.hook) !== -1;
              isActive = isInverted ? !isToggleActive : isToggleActive;
            }
          }
          if (!isActive) {
            var row = container.querySelector('[data-perf-hook="' + opt.hook + '"]');
            if (row) row.click();
          }
        });
        setTimeout(updatePerfCheckboxes, 150);
      };
      container.appendChild(maxPerfBtn);
      if (typeof window._stretchedBuildRow === "function") {
        window._stretchedBuildRow(doc, container);
      }
      PERF_OPTIONS.forEach(function(opt) {
        var row = doc.createElement("div");
        row.className = "perf-option-row";
        row.style.cssText = "display:flex;align-items:flex-start;gap:10px;padding:7px 8px;border-radius:6px;cursor:pointer;";
        row.setAttribute("data-perf-hook", opt.hook);
        row.onmouseenter = function() {
          row.style.background = "var(--theme-bg-hover)";
        };
        row.onmouseleave = function() {
          row.style.background = "";
        };
        var checkbox = doc.createElement("div");
        checkbox.className = "perf-checkbox";
        checkbox.style.cssText = "width:17px;height:17px;border:2px solid var(--theme-border-light);border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;";
        checkbox.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="opacity:0;"><polyline points="20 6 9 17 4 12"/></svg>';
        var textDiv = doc.createElement("div");
        textDiv.style.cssText = "flex:1;min-width:0;";
        var titleRow = doc.createElement("div");
        titleRow.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:2px;";
        var title = doc.createElement("span");
        title.style.cssText = "color:var(--theme-text-primary);font-size:12.5px;font-weight:500;";
        title.textContent = opt.title;
        titleRow.appendChild(title);
        if (opt.warning) {
          var warning = doc.createElement("span");
          warning.style.cssText = "color:#f59e0b;font-size:9.5px;font-weight:600;padding:2px 5px;background:rgba(245,158,11,0.12);border-radius:4px;letter-spacing:0.3px;";
          warning.textContent = "Cuidado";
          titleRow.appendChild(warning);
        }
        textDiv.appendChild(titleRow);
        var desc = doc.createElement("div");
        desc.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;line-height:1.4;";
        desc.textContent = opt.desc;
        textDiv.appendChild(desc);
        row.appendChild(checkbox);
        row.appendChild(textDiv);
        (function(hookName, isCustom, isDirectKey) {
          row.onclick = function() {
            if (isDirectKey) {
              try {
                var newVal = localStorage.getItem(hookName) !== "true";
                localStorage.setItem(hookName, newVal ? "true" : "false");
                if (hookName === "no_hover_fx" && window.__hbxSetNoHoverFx) {
                  window.__hbxSetNoHoverFx(newVal);
                } else if (hookName === "flat_backgrounds" && window.HaxThemes) {
                  window.HaxThemes.refreshFx();
                } else if (hookName === "less_refresh") {
                  if (window.HaxNewFps && window.HaxNewFps.setRefreshRate) window.HaxNewFps.setRefreshRate(newVal ? 1500 : 500);
                  if (window.HaxNewPing && window.HaxNewPing.setRefreshRate) window.HaxNewPing.setRefreshRate(newVal ? 1500 : 500);
                }
              } catch (e) {}
              setTimeout(updatePerfCheckboxes, 50);
            } else if (isCustom) {
              try {
                var _po = JSON.parse(localStorage.getItem("hbx_perf_opts") || "{}");
                if (hookName === "showKickRange") {
                  _po[hookName] = _po[hookName] === false ? true : false;
                } else {
                  _po[hookName] = !(_po[hookName] === true || _po[hookName] === "true");
                }
                localStorage.setItem("hbx_perf_opts", JSON.stringify(_po));
                var _api = window._hbxGameAPI;
                if (_api) _api.refresh();
              } catch (e) {}
              setTimeout(updatePerfCheckboxes, 50);
            } else {
              var miscSection = dialog.querySelector('[data-hook="miscsec"]');
              if (miscSection) {
                var originalToggle = miscSection.querySelector('[data-hook="' + hookName + '"]');
                if (originalToggle) {
                  originalToggle.click();
                  setTimeout(updatePerfCheckboxes, 100);
                }
              }
            }
          };
        })(opt.hook, !!opt.custom, !!opt.directKey);
        container.appendChild(row);
      });
      var exportImportSection = doc.createElement("div");
      exportImportSection.style.cssText = "display:flex;gap:8px;margin-top:16px;padding-top:12px;border-top:1px solid var(--theme-border);";
      var PERF_STORAGE_KEYS = [ "simple_lines", "ultra_simple_lines", "culling_enabled", "show_avatars", "show_names", "simple_field", "low_quality_circles", "show_animations", "show_indicator", "show_chat_indicator", "high_priority", "canvas_boost_scale", "input_boost_enabled", "fps_limit", "resolution_scale", "viewmode" ];
      function generatePerfCode() {
        var config = {};
        PERF_STORAGE_KEYS.forEach(function(key) {
          var val = localStorage.getItem(key);
          if (val !== null) config[key] = val;
        });
        return btoa(JSON.stringify(config)).replace(/=/g, "");
      }
      function applyPerfCode(code) {
        try {
          while (code.length % 4 !== 0) code += "=";
          var config = JSON.parse(atob(code));
          PERF_STORAGE_KEYS.forEach(function(key) {
            localStorage.removeItem(key);
          });
          for (var key in config) {
            if (PERF_STORAGE_KEYS.indexOf(key) !== -1) localStorage.setItem(key, config[key]);
          }
          return true;
        } catch (e) {
          return false;
        }
      }
      function makePerfBtn(innerHTML, onCk) {
        var btn = doc.createElement("button");
        btn.style.cssText = "flex:1;padding:9px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;font-size:11.5px;";
        btn.innerHTML = innerHTML;
        btn.onmouseenter = function() {
          btn.style.background = "var(--theme-bg-hover)";
        };
        btn.onmouseleave = function() {
          btn.style.background = "var(--theme-bg-secondary)";
        };
        btn.onclick = onCk;
        return btn;
      }
      var exportBtn = makePerfBtn('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' + "Exportar", function() {
        var code = generatePerfCode();
        var orig = exportBtn.innerHTML;
        navigator.clipboard.writeText(code).then(function() {
          exportBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' + "Copiado!";
          exportBtn.style.borderColor = "#22c55e";
          setTimeout(function() {
            exportBtn.innerHTML = orig;
            exportBtn.style.borderColor = "";
          }, 2e3);
        });
      });
      var importBtn = makePerfBtn('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>' + "Importar", function() {
        var orig = importBtn.innerHTML;
        navigator.clipboard.readText().then(function(code) {
          code = code.trim();
          if (!code) {
            importBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' + "Portapapeles vacio";
            importBtn.style.borderColor = "#dc2626";
            setTimeout(function() {
              importBtn.innerHTML = orig;
              importBtn.style.borderColor = "";
            }, 2e3);
            return;
          }
          if (applyPerfCode(code)) {
            importBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' + "Aplicado! Recarga la pagina";
            importBtn.style.borderColor = "#22c55e";
            setTimeout(function() {
              importBtn.innerHTML = orig;
              importBtn.style.borderColor = "";
            }, 3e3);
          } else {
            importBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' + "Codigo invalido";
            importBtn.style.borderColor = "#dc2626";
            setTimeout(function() {
              importBtn.innerHTML = orig;
              importBtn.style.borderColor = "";
            }, 2e3);
          }
        }).catch(function() {
          importBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' + "Sin permiso";
          importBtn.style.borderColor = "#dc2626";
          setTimeout(function() {
            importBtn.innerHTML = importBtn.innerHTML;
            importBtn.style.borderColor = "";
          }, 2e3);
        });
      });
      exportImportSection.appendChild(exportBtn);
      exportImportSection.appendChild(importBtn);
      container.appendChild(exportImportSection);
      var exportImportTip = doc.createElement("div");
      exportImportTip.style.cssText = "color:var(--theme-text-muted);font-size:10px;margin-top:5px;text-align:center;";
      exportImportTip.textContent = "Comparte tu configuracion con amigos!";
      container.appendChild(exportImportTip);
      var LW_DEFAULTS = {
        line_width_players: 2,
        line_width_ball: 2,
        line_width_field: 3,
        line_width_goal: 3
      };
      var LW_ROWS = [ {
        key: "line_width_players",
        label: "Jugadores"
      }, {
        key: "line_width_ball",
        label: "Pelota"
      }, {
        key: "line_width_field",
        label: "Cancha"
      }, {
        key: "line_width_goal",
        label: "Arco"
      } ];
      var lwHeader = doc.createElement("div");
      lwHeader.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;margin-top:16px;padding-top:12px;border-top:1px solid var(--theme-border);letter-spacing:0.5px;text-transform:uppercase;";
      lwHeader.textContent = "Grosor de lineas";
      container.appendChild(lwHeader);
      var lwValueEls = {};
      function readLW(key) {
        var v = null;
        try {
          v = localStorage.getItem(key);
        } catch (e) {}
        return v !== null && v !== "" ? parseFloat(v) : LW_DEFAULTS[key];
      }
      function paintLWLabel(key) {
        var el = lwValueEls[key];
        if (!el) return;
        var raw = null;
        try {
          raw = localStorage.getItem(key);
        } catch (e) {}
        var val = readLW(key);
        el.textContent = val.toFixed(1).replace(/\.0$/, "") + "px" + (raw === null || raw === "" ? " (default)" : "");
        el.style.color = raw === null || raw === "" ? "var(--theme-text-muted)" : "#c9a227";
      }
      LW_ROWS.forEach(function(row) {
        var lwRow = doc.createElement("div");
        lwRow.style.cssText = "display:flex;align-items:center;gap:10px;padding:6px 8px;";
        var lbl = doc.createElement("div");
        lbl.style.cssText = "width:70px;flex-shrink:0;color:var(--theme-text-primary);font-size:12px;";
        lbl.textContent = row.label;
        var slider = doc.createElement("input");
        slider.type = "range";
        slider.min = "0.5";
        slider.max = "5";
        slider.step = "0.1";
        slider.value = String(readLW(row.key));
        slider.style.cssText = "flex:1;";
        var valEl = doc.createElement("div");
        valEl.style.cssText = "width:80px;flex-shrink:0;text-align:right;font-size:11px;";
        lwValueEls[row.key] = valEl;
        paintLWLabel(row.key);
        slider.oninput = function() {
          try {
            localStorage.setItem(row.key, slider.value);
          } catch (e) {}
          paintLWLabel(row.key);
        };
        lwRow.appendChild(lbl);
        lwRow.appendChild(slider);
        lwRow.appendChild(valEl);
        container.appendChild(lwRow);
        row._slider = slider;
      });
      var satHeader = doc.createElement("div");
      satHeader.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;margin-top:16px;padding-top:12px;border-top:1px solid var(--theme-border);letter-spacing:0.5px;text-transform:uppercase;";
      satHeader.textContent = "Saturacion";
      container.appendChild(satHeader);
      var satRow = doc.createElement("div");
      satRow.style.cssText = "display:flex;align-items:center;gap:10px;padding:6px 8px;";
      var satLbl = doc.createElement("div");
      satLbl.style.cssText = "width:70px;flex-shrink:0;color:var(--theme-text-primary);font-size:12px;";
      satLbl.textContent = "Color";
      var satSlider = doc.createElement("input");
      satSlider.type = "range";
      satSlider.min = "1";
      satSlider.max = "100";
      satSlider.step = "1";
      satSlider.style.cssText = "flex:1;";
      var satValEl = doc.createElement("div");
      satValEl.style.cssText = "width:80px;flex-shrink:0;text-align:right;font-size:11px;color:var(--theme-text-muted);";
      function paintSatLabel(v) {
        satValEl.textContent = v == 50 ? "Normal" : String(v);
      }
      function readSatValue() {
        return window.HaxNewSaturation && window.HaxNewSaturation.getValue ? window.HaxNewSaturation.getValue() : 50;
      }
      satSlider.value = String(readSatValue());
      paintSatLabel(satSlider.value);
      satSlider.oninput = function() {
        paintSatLabel(satSlider.value);
        if (window.HaxNewSaturation) window.HaxNewSaturation.setValue(satSlider.value);
      };
      satRow.appendChild(satLbl);
      satRow.appendChild(satSlider);
      satRow.appendChild(satValEl);
      container.appendChild(satRow);
      var satHint = doc.createElement("div");
      satHint.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;line-height:1.4;padding:0 8px;";
      satHint.textContent = "50 = normal. Menos desatura, mas intensifica los colores. Se aplica a todo (menu y juego).";
      container.appendChild(satHint);
      var resetBtn = doc.createElement("button");
      resetBtn.style.cssText = "width:100%;margin-top:10px;padding:9px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);cursor:pointer;font-size:11.5px;";
      resetBtn.textContent = "Resetear a valores por defecto";
      resetBtn.onmouseenter = function() {
        resetBtn.style.background = "var(--theme-bg-hover)";
      };
      resetBtn.onmouseleave = function() {
        resetBtn.style.background = "var(--theme-bg-secondary)";
      };
      resetBtn.onclick = function() {
        LW_ROWS.forEach(function(row) {
          try {
            localStorage.removeItem(row.key);
          } catch (e) {}
          if (row._slider) row._slider.value = String(LW_DEFAULTS[row.key]);
          paintLWLabel(row.key);
        });
        try {
          localStorage.setItem("no_hover_fx", "false");
          localStorage.setItem("flat_backgrounds", "false");
          localStorage.setItem("less_refresh", "false");
          localStorage.removeItem("avatar_font");
        } catch (e) {}
        if (window.__hbxSetNoHoverFx) window.__hbxSetNoHoverFx(false);
        if (window.HaxThemes) window.HaxThemes.refreshFx();
        if (window.HaxNewFps && window.HaxNewFps.setRefreshRate) window.HaxNewFps.setRefreshRate(500);
        if (window.HaxNewPing && window.HaxNewPing.setRefreshRate) window.HaxNewPing.setRefreshRate(500);
        if (window.HaxNewSaturation) window.HaxNewSaturation.reset();
        satSlider.value = "50";
        paintSatLabel("50");
        if (typeof avatarFontSelect !== "undefined" && avatarFontSelect) avatarFontSelect.value = "default";
        updatePerfCheckboxes();
      };
      container.appendChild(resetBtn);
      var avHeader = doc.createElement("div");
      avHeader.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;margin-top:16px;padding-top:12px;border-top:1px solid var(--theme-border);letter-spacing:0.5px;text-transform:uppercase;";
      avHeader.textContent = "Fuente del avatar";
      container.appendChild(avHeader);
      var AVATAR_FONTS = [ {
        value: "default",
        label: "Arial Black (default)",
        family: "'Arial Black','Arial Bold',Gadget,sans-serif"
      }, {
        value: "comicsans",
        label: "Comic Sans",
        family: "'Comic Sans MS','Comic Sans',cursive"
      }, {
        value: "impact",
        label: "Impact",
        family: "Impact,Haettenschweiler,sans-serif"
      }, {
        value: "courier",
        label: "Courier New",
        family: "'Courier New',Courier,monospace"
      }, {
        value: "georgia",
        label: "Georgia",
        family: "Georgia,'Times New Roman',serif"
      }, {
        value: "verdana",
        label: "Verdana",
        family: "Verdana,Geneva,sans-serif"
      }, {
        value: "trebuchet",
        label: "Trebuchet MS",
        family: "'Trebuchet MS',sans-serif"
      } ];
      var avatarFontSelect = doc.createElement("select");
      avatarFontSelect.style.cssText = "width:100%;margin-top:6px;padding:8px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;";
      AVATAR_FONTS.forEach(function(f) {
        var option = doc.createElement("option");
        option.value = f.value;
        option.textContent = f.label;
        avatarFontSelect.appendChild(option);
      });
      var savedFontFamily = null;
      try {
        savedFontFamily = localStorage.getItem("avatar_font");
      } catch (e) {}
      var matchedFont = AVATAR_FONTS.filter(function(f) {
        return f.family === savedFontFamily;
      })[0];
      avatarFontSelect.value = matchedFont ? matchedFont.value : "default";
      avatarFontSelect.onchange = function() {
        var picked = AVATAR_FONTS.filter(function(f) {
          return f.value === avatarFontSelect.value;
        })[0];
        try {
          if (!picked || picked.value === "default") localStorage.removeItem("avatar_font"); else localStorage.setItem("avatar_font", picked.family);
        } catch (e) {}
      };
      container.appendChild(avatarFontSelect);
      var avHint = doc.createElement("div");
      avHint.style.cssText = "color:var(--theme-text-muted);font-size:10px;margin-top:5px;";
      avHint.textContent = "Se aplica a los avatares de texto la proxima vez que se dibujen (propio o al reconectar).";
      container.appendChild(avHint);
      var FPS_MODE_PORT = 5484;
      var fpsHeader = doc.createElement("div");
      fpsHeader.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;margin-top:16px;padding-top:12px;border-top:1px solid var(--theme-border);letter-spacing:0.5px;text-transform:uppercase;";
      fpsHeader.textContent = "FPS";
      container.appendChild(fpsHeader);
      var fpsHint = doc.createElement("div");
      fpsHint.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;line-height:1.4;padding:6px 8px 2px;";
      fpsHint.textContent = "Ilimitados apaga el limite de fotogramas de Chromium (vsync). Puede sentirse mas fluido, pero el numero del contador puede quedar mas alto e inestable que lo que realmente se ve en pantalla. Por defecto: ilimitados.";
      container.appendChild(fpsHint);
      var fpsUnlimitedSaved = true; // default: FPS ilimitados (pedido explicitamente)
      try {
        var fpsUnlimitedStored = localStorage.getItem("fps_unlimited");
        if (fpsUnlimitedStored !== null) fpsUnlimitedSaved = fpsUnlimitedStored === "true";
      } catch (e) {}
      var fpsUnlimitedActive = fpsUnlimitedSaved;
      var fpsRow = doc.createElement("div");
      fpsRow.className = "perf-option-row";
      fpsRow.style.cssText = "display:flex;align-items:flex-start;gap:10px;padding:7px 8px;border-radius:6px;cursor:pointer;";
      fpsRow.onmouseenter = function() {
        fpsRow.style.background = "var(--theme-bg-hover)";
      };
      fpsRow.onmouseleave = function() {
        fpsRow.style.background = "";
      };
      var fpsCheckbox = doc.createElement("div");
      fpsCheckbox.className = "perf-checkbox";
      fpsCheckbox.style.cssText = "width:17px;height:17px;border:2px solid var(--theme-border-light);border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;";
      fpsCheckbox.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="opacity:' + (fpsUnlimitedSaved ? "1" : "0") + '"><polyline points="20 6 9 17 4 12"/></svg>';
      var fpsTextDiv = doc.createElement("div");
      fpsTextDiv.style.cssText = "flex:1;min-width:0;";
      var fpsTitle = doc.createElement("span");
      fpsTitle.style.cssText = "color:var(--theme-text-primary);font-size:12.5px;font-weight:500;";
      fpsTitle.textContent = fpsUnlimitedSaved ? "FPS ilimitados" : "FPS limitados";
      fpsTextDiv.appendChild(fpsTitle);
      var fpsDesc = doc.createElement("div");
      fpsDesc.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;line-height:1.4;";
      fpsDesc.textContent = "Tocá para cambiar entre limitados (recomendado) e ilimitados.";
      fpsTextDiv.appendChild(fpsDesc);
      fpsRow.appendChild(fpsCheckbox);
      fpsRow.appendChild(fpsTextDiv);
      container.appendChild(fpsRow);
      var fpsRestartBtn = doc.createElement("button");
      fpsRestartBtn.className = "hbx-accent-gold";
      fpsRestartBtn.style.cssText = "width:100%;margin-top:8px;padding:9px;background:#c9a227;border:none;border-radius:6px;color:#000;cursor:pointer;font-size:11.5px;font-weight:700;display:none;";
      fpsRestartBtn.textContent = "Reiniciar app para aplicar cambios";
      fpsRestartBtn.onmouseenter = function() {
        fpsRestartBtn.style.opacity = "0.9";
      };
      fpsRestartBtn.onmouseleave = function() {
        fpsRestartBtn.style.opacity = "1";
      };
      container.appendChild(fpsRestartBtn);
      function refreshFpsRestartVisibility() {
        fpsRestartBtn.style.display = fpsUnlimitedSaved !== fpsUnlimitedActive ? "block" : "none";
      }
      refreshFpsRestartVisibility();
      try {
        fetch("http://127.0.0.1:" + FPS_MODE_PORT + "/fps-mode").then(function(r) {
          return r.json();
        }).then(function(d) {
          fpsUnlimitedActive = !!(d && d.unlimited);
          refreshFpsRestartVisibility();
        }).catch(function() {});
      } catch (e) {}
      fpsRow.onclick = function() {
        fpsUnlimitedSaved = !fpsUnlimitedSaved;
        fpsCheckbox.querySelector("svg").style.opacity = fpsUnlimitedSaved ? "1" : "0";
        fpsTitle.textContent = fpsUnlimitedSaved ? "FPS ilimitados" : "FPS limitados";
        try {
          localStorage.setItem("fps_unlimited", fpsUnlimitedSaved ? "true" : "false");
        } catch (e) {}
        try {
          fetch("http://127.0.0.1:" + FPS_MODE_PORT + "/set-fps-mode?unlimited=" + (fpsUnlimitedSaved ? "1" : "0")).catch(function() {});
        } catch (e) {}
        refreshFpsRestartVisibility();
      };
      fpsRestartBtn.onclick = function() {
        fpsRestartBtn.textContent = "Reiniciando...";
        fpsRestartBtn.disabled = true;
        try {
          fetch("http://127.0.0.1:" + FPS_MODE_PORT + "/restart-app").catch(function() {});
        } catch (e) {}
      };
      perfSection.appendChild(container);
      function updatePerfCheckboxes() {
        var miscSection = dialog.querySelector('[data-hook="miscsec"]');
        if (!miscSection) return;
        PERF_OPTIONS.forEach(function(opt) {
          var perfRow = perfSection.querySelector('[data-perf-hook="' + opt.hook + '"]');
          if (!perfRow) return;
          var perfCheckbox = perfRow.querySelector(".perf-checkbox");
          if (!perfCheckbox) return;
          var svg = perfCheckbox.querySelector("svg");
          if (!svg) return;
          var isActive = false;
          if (opt.directKey) {
            try {
              isActive = localStorage.getItem(opt.hook) === "true";
            } catch (e) {}
          } else if (opt.custom) {
            try {
              var _po = JSON.parse(localStorage.getItem("hbx_perf_opts") || "{}");
              var _v = _po[opt.hook];
              if (opt.inverted) {
                isActive = _v === false || _v === "false";
              } else {
                isActive = _v === true || _v === "true";
              }
            } catch (e) {}
          } else {
            var originalToggle = miscSection.querySelector('[data-hook="' + opt.hook + '"]');
            if (!originalToggle) return;
            var icons = originalToggle.getElementsByTagName("i");
            var isToggleActive = false;
            for (var i = 0; i < icons.length; i++) {
              if (icons[i].classList.contains("icon-ok")) {
                isToggleActive = true;
                break;
              }
            }
            var isInverted = [ "tmisc-showavatars", "tmisc-shownames", "tmisc-showanimations", "tmisc-showindicator", "tmisc-showchat" ].indexOf(opt.hook) !== -1;
            isActive = isInverted ? !isToggleActive : isToggleActive;
          }
          if (isActive) {
            perfCheckbox.style.background = "#c9a227";
            perfCheckbox.style.borderColor = "#c9a227";
            svg.style.opacity = "1";
            svg.style.stroke = "#000";
          } else {
            perfCheckbox.style.background = "";
            perfCheckbox.style.borderColor = "";
            svg.style.opacity = "0";
          }
        });
      }
      var dialogContent = dialog.querySelector(".section") || dialog;
      dialogContent.parentNode.insertBefore(perfSection, dialogContent.nextSibling);
      perfBtn.addEventListener("click", function() {
        var sections = dialog.querySelectorAll(".tabcontents > .section");
        for (var i = 0; i < sections.length; i++) sections[i].style.display = "none";
        var themeSection = dialog.querySelector('[data-hook="theme-section"]');
        if (themeSection) themeSection.style.display = "none";
        perfSection.style.display = "block";
        dialog.style.maxHeight = "90vh";
        dialog.style.height = "auto";
        var tabcontents = dialog.querySelector(".tabcontents");
        if (tabcontents) {
          tabcontents.style.maxHeight = "calc(90vh - 100px)";
          tabcontents.style.overflowY = "auto";
        }
        updatePerfCheckboxes();
        var allTabs = tabs.querySelectorAll("button");
        for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove("selected");
        perfBtn.classList.add("selected");
      });
      var originalTabs2 = tabs.querySelectorAll('button:not([data-hook="perfbtn"])');
      for (var i = 0; i < originalTabs2.length; i++) {
        originalTabs2[i].addEventListener("click", function() {
          perfSection.style.display = "none";
          dialog.style.maxHeight = "";
          dialog.style.height = "";
          var tabcontents = dialog.querySelector(".tabcontents");
          if (tabcontents) {
            tabcontents.style.maxHeight = "";
            tabcontents.style.overflowY = "";
          }
        });
      }
      return perfBtn;
    }
    function createMultiAuthTab(doc, tabs) {
      if (tabs.querySelector('button[data-hook="multiauthbtn"]')) return;
      var multiAuthBtn = doc.createElement("button");
      multiAuthBtn.setAttribute("data-hook", "multiauthbtn");
      multiAuthBtn.textContent = t("Multi-Auth");
      multiAuthBtn.style.display = "none";
      tabs.appendChild(multiAuthBtn);
      var multiAuthSection = doc.createElement("section");
      multiAuthSection.className = "multiauth-section section";
      multiAuthSection.setAttribute("data-hook", "multiauth-section");
      multiAuthSection.style.display = "none";
      var MAX_AUTHS = 5;
      var STORAGE_KEY = "haxdesk_multi_auths";
      var CURRENT_AUTH_KEY = "player_auth_key";
      function getStoredAuths() {
        try {
          var d = localStorage.getItem(STORAGE_KEY);
          return d ? JSON.parse(d) : [];
        } catch (e) {
          return [];
        }
      }
      function saveAuths(auths) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(auths));
      }
      function getCurrentAuth() {
        return localStorage.getItem(CURRENT_AUTH_KEY) || "";
      }
      function setCurrentAuth(authKey) {
        if (authKey) localStorage.setItem(CURRENT_AUTH_KEY, authKey);
      }
      function truncateAuth(auth) {
        if (!auth || auth.length < 20) return auth || "";
        return auth.substring(0, 8) + "..." + auth.substring(auth.length - 8);
      }
      function isValidAuth(auth) {
        if (!auth || typeof auth !== "string") return false;
        var parts = auth.split(".");
        return parts.length === 4 && parts[0].length > 0;
      }
      var container = doc.createElement("div");
      container.style.cssText = "display:flex;flex-direction:column;gap:12px;";
      var header = doc.createElement("div");
      header.style.cssText = "color:var(--theme-text-muted);font-size:11px;margin-bottom:4px;padding-bottom:8px;border-bottom:1px solid var(--theme-border);";
      var currentAuth = getCurrentAuth();
      var auths = getStoredAuths();
      var currentAuthObj = auths.find(function(a) {
        return a.key === currentAuth;
      });
      var currentName = currentAuthObj ? currentAuthObj.name : "";
      if (currentAuth) {
        header.innerHTML = t("Auth atual: ") + '<span style="color:var(--theme-text-primary);font-family:monospace;">' + truncateAuth(currentAuth) + "</span>" + (currentName ? " (" + currentName + ")" : "");
      } else {
        header.innerHTML = t("Nenhuma auth ativa. Máximo de 5 auths.");
      }
      container.appendChild(header);
      function updateHeader() {
        var current = getCurrentAuth();
        var al = getStoredAuths();
        var found = al.find(function(a) {
          return a.key === current;
        });
        var name = found ? found.name : "";
        if (current) {
          header.innerHTML = t("Auth atual: ") + '<span style="color:var(--theme-text-primary);font-family:monospace;">' + truncateAuth(current) + "</span>" + (name ? " (" + name + ")" : "");
        } else {
          header.innerHTML = t("Nenhuma auth ativa. Máximo de 5 auths.");
        }
      }
      var listContainer = doc.createElement("div");
      listContainer.style.cssText = "display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;";
      function renderAuthList() {
        listContainer.innerHTML = "";
        var al = getStoredAuths();
        var ca = getCurrentAuth();
        if (al.length === 0) {
          var emptyMsg = doc.createElement("div");
          emptyMsg.style.cssText = "color:var(--theme-text-muted);font-size:12px;text-align:center;padding:20px;";
          emptyMsg.textContent = t("Nenhuma auth salva. Adicione uma abaixo.");
          listContainer.appendChild(emptyMsg);
          return;
        }
        al.forEach(function(authObj, index) {
          var row = doc.createElement("div");
          var isActive = authObj.key === ca;
          row.className = isActive ? "hbx-glasschip-gold" : "hbx-glasschip";
          row.style.cssText = "display:flex;align-items:center;gap:8px;padding:10px;background:" + (isActive ? "rgba(201,162,39,0.08)" : "var(--theme-bg-secondary)") + ";border:1px solid " + (isActive ? "#c9a227" : "var(--theme-border)") + ";border-radius:6px;";
          var indicator = doc.createElement("div");
          indicator.style.cssText = "width:7px;height:7px;border-radius:50%;flex-shrink:0;background:" + (isActive ? "#c9a227" : "var(--theme-border)") + ";";
          row.appendChild(indicator);
          var info = doc.createElement("div");
          info.style.cssText = "flex:1;min-width:0;";
          var name = doc.createElement("div");
          name.style.cssText = "color:var(--theme-text-primary);font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;";
          name.textContent = authObj.name || t("Auth ") + (index + 1);
          info.appendChild(name);
          var keyPreview = doc.createElement("div");
          keyPreview.style.cssText = "color:var(--theme-text-muted);font-size:10px;font-family:monospace;";
          keyPreview.textContent = truncateAuth(authObj.key);
          info.appendChild(keyPreview);
          row.appendChild(info);
          if (!isActive) {
            var useBtn = doc.createElement("button");
            useBtn.className = "hbx-accent-gold";
            useBtn.style.cssText = "padding:5px 11px;background:#c9a227;border:none;border-radius:4px;color:#000;font-size:11px;font-weight:600;cursor:pointer;";
            useBtn.textContent = t("Usar");
            useBtn.onmouseenter = function() {
              useBtn.style.background = "#b8911f";
            };
            useBtn.onmouseleave = function() {
              useBtn.style.background = "#c9a227";
            };
            useBtn.onclick = function() {
              setCurrentAuth(authObj.key);
              updateHeader();
              renderAuthList();
              if (window.showToast) window.showToast(t("Auth alterada! Feche e abra o app para aplicar."), "success");
            };
            row.appendChild(useBtn);
          }
          var removeBtn = doc.createElement("button");
          removeBtn.style.cssText = "padding:5px 7px;background:transparent;border:1px solid var(--theme-border);border-radius:4px;color:var(--theme-text-muted);font-size:11px;cursor:pointer;";
          removeBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
          removeBtn.onmouseenter = function() {
            removeBtn.style.borderColor = "#dc2626";
            removeBtn.style.color = "#dc2626";
          };
          removeBtn.onmouseleave = function() {
            removeBtn.style.borderColor = "";
            removeBtn.style.color = "";
          };
          removeBtn.onclick = function() {
            var newAuths = al.filter(function(_, i) {
              return i !== index;
            });
            saveAuths(newAuths);
            renderAuthList();
            if (window.showToast) window.showToast(t("Auth removida"), "info");
          };
          row.appendChild(removeBtn);
          listContainer.appendChild(row);
        });
      }
      container.appendChild(listContainer);
      var addSection = doc.createElement("div");
      addSection.style.cssText = "margin-top:12px;padding-top:12px;border-top:1px solid var(--theme-border);";
      var addLabel = doc.createElement("div");
      addLabel.style.cssText = "color:var(--theme-text-primary);font-size:12px;font-weight:500;margin-bottom:8px;";
      addLabel.textContent = t("Adicionar Nova Auth");
      addSection.appendChild(addLabel);
      var inputCss = "width:100%;padding:8px 12px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;margin-bottom:8px;box-sizing:border-box;";
      var nameInput = doc.createElement("input");
      nameInput.type = "text";
      nameInput.placeholder = t("Nome (opcional)");
      nameInput.style.cssText = inputCss;
      addSection.appendChild(nameInput);
      var authInput = doc.createElement("input");
      authInput.type = "text";
      authInput.placeholder = t("Auth Key (ex: idkey.xxx.xxx.xxx)");
      authInput.style.cssText = inputCss + "font-family:monospace;";
      addSection.appendChild(authInput);
      var btnRow = doc.createElement("div");
      btnRow.style.cssText = "display:flex;gap:8px;";
      var addBtn = doc.createElement("button");
      addBtn.className = "hbx-accent-gold";
      addBtn.style.cssText = "flex:1;padding:9px;background:#c9a227;border:none;border-radius:6px;color:#000;font-size:12px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;";
      addBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' + t("Adicionar");
      addBtn.onmouseenter = function() {
        addBtn.style.background = "#b8911f";
      };
      addBtn.onmouseleave = function() {
        addBtn.style.background = "#c9a227";
      };
      addBtn.onclick = function() {
        var authKey = authInput.value.trim();
        var authName = nameInput.value.trim();
        if (!authKey) {
          if (window.showToast) window.showToast(t("Digite uma auth key"), "error");
          return;
        }
        if (!isValidAuth(authKey)) {
          if (window.showToast) window.showToast(t("Formato inválido. Use: idkey.xxx.xxx.xxx"), "error");
          return;
        }
        var al = getStoredAuths();
        if (al.some(function(a) {
          return a.key === authKey;
        })) {
          if (window.showToast) window.showToast(t("Esta auth já está salva"), "error");
          return;
        }
        if (al.length >= MAX_AUTHS) {
          if (window.showToast) window.showToast(t("Limite de " + MAX_AUTHS + " auths atingido"), "error");
          return;
        }
        al.push({
          name: authName || "",
          key: authKey
        });
        saveAuths(al);
        authInput.value = "";
        nameInput.value = "";
        renderAuthList();
        if (window.showToast) window.showToast(t("Auth adicionada!"), "success");
      };
      btnRow.appendChild(addBtn);
      var saveCurrentBtn = doc.createElement("button");
      saveCurrentBtn.style.cssText = "padding:9px 14px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;color:var(--theme-text-primary);font-size:12px;cursor:pointer;";
      saveCurrentBtn.textContent = t("Salvar Atual");
      saveCurrentBtn.onmouseenter = function() {
        saveCurrentBtn.style.background = "var(--theme-bg-hover)";
      };
      saveCurrentBtn.onmouseleave = function() {
        saveCurrentBtn.style.background = "var(--theme-bg-secondary)";
      };
      saveCurrentBtn.onclick = function() {
        var ca = getCurrentAuth();
        if (!ca) {
          if (window.showToast) window.showToast(t("Nenhuma auth atual para salvar"), "error");
          return;
        }
        var al = getStoredAuths();
        if (al.some(function(a) {
          return a.key === ca;
        })) {
          if (window.showToast) window.showToast(t("Auth atual já está salva"), "info");
          return;
        }
        if (al.length >= MAX_AUTHS) {
          if (window.showToast) window.showToast(t("Limite de " + MAX_AUTHS + " auths atingido"), "error");
          return;
        }
        var authName = nameInput.value.trim() || t("Auth ") + (al.length + 1);
        al.push({
          name: authName,
          key: ca
        });
        saveAuths(al);
        nameInput.value = "";
        renderAuthList();
        if (window.showToast) window.showToast(t("Auth atual salva!"), "success");
      };
      btnRow.appendChild(saveCurrentBtn);
      addSection.appendChild(btnRow);
      container.appendChild(addSection);
      var tip = doc.createElement("div");
      tip.className = "hbx-glasschip";
      tip.style.cssText = "color:var(--theme-text-muted);font-size:10px;margin-top:10px;padding:8px;background:var(--theme-bg-secondary);border-radius:6px;";
      tip.textContent = t("Após trocar de auth, feche e abra o app para aplicar.");
      container.appendChild(tip);
      multiAuthSection.appendChild(container);
      renderAuthList();
      var dialogContent = dialog.querySelector(".section") || dialog;
      dialogContent.parentNode.insertBefore(multiAuthSection, dialogContent.nextSibling);
      multiAuthBtn.addEventListener("click", function() {
        var sections = dialog.querySelectorAll(".tabcontents > .section");
        for (var i = 0; i < sections.length; i++) sections[i].style.display = "none";
        var ts = dialog.querySelector('[data-hook="theme-section"]');
        if (ts) ts.style.display = "none";
        var ps = dialog.querySelector('[data-hook="perf-section"]');
        if (ps) ps.style.display = "none";
        multiAuthSection.style.display = "block";
        updateHeader();
        renderAuthList();
        var allTabs = tabs.querySelectorAll("button");
        for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove("selected");
        multiAuthBtn.classList.add("selected");
      });
      var originalTabsM = tabs.querySelectorAll('button:not([data-hook="multiauthbtn"])');
      for (var i = 0; i < originalTabsM.length; i++) {
        originalTabsM[i].addEventListener("click", function() {
          multiAuthSection.style.display = "none";
        });
      }
      return multiAuthBtn;
    }
    function createGeoTab(doc, tabs) {
      if (tabs.querySelector('button[data-hook="geobtn"]')) return;
      var geoBtn = doc.createElement("button");
      geoBtn.setAttribute("data-hook", "geobtn");
      geoBtn.textContent = t("Geo");
      geoBtn.style.display = "none";
      tabs.appendChild(geoBtn);
      var geoSection = doc.createElement("section");
      geoSection.className = "geo-section section";
      geoSection.setAttribute("data-hook", "geo-section");
      geoSection.style.display = "none";
      var container = doc.createElement("div");
      container.style.cssText = "display:flex;flex-direction:column;gap:14px;padding:4px 0;";
      var infoBox = doc.createElement("div");
      infoBox.style.cssText = "color:var(--theme-text-muted);font-size:11px;padding-bottom:10px;border-bottom:1px solid var(--theme-border);line-height:1.6;";
      infoBox.innerHTML = t("Sincroniza tu ubicación real con la bandera elegida. Útil para evitar restricciones geográficas.");
      container.appendChild(infoBox);
      var statusRow = doc.createElement("div");
      statusRow.style.cssText = "display:flex;flex-direction:column;gap:8px;";
      function getGeoInfo() {
        try {
          var realRaw = localStorage.getItem("geo");
          var overrideRaw = localStorage.getItem("geo_override");
          var isActive = localStorage.getItem("geo_bypass_tick") === "true";
          var real = realRaw ? JSON.parse(realRaw) : null;
          var override = overrideRaw ? JSON.parse(overrideRaw) : null;
          return {
            real: real,
            override: override,
            isActive: isActive
          };
        } catch (e) {
          return {
            real: null,
            override: null,
            isActive: false
          };
        }
      }
      function renderStatus() {
        statusRow.innerHTML = "";
        var info = getGeoInfo();
        function makeRow(label, value, flagCode) {
          var row = doc.createElement("div");
          row.className = "hbx-glasschip";
          row.style.cssText = "display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:6px;";
          var lbl = doc.createElement("span");
          lbl.style.cssText = "color:var(--theme-text-muted);font-size:11.5px;";
          lbl.textContent = label;
          var val = doc.createElement("span");
          val.style.cssText = "color:var(--theme-text-primary);font-size:12px;font-weight:500;display:flex;align-items:center;gap:6px;";
          if (flagCode) {
            var flag = doc.createElement("span");
            flag.className = "flagico f-" + flagCode.toLowerCase();
            flag.style.cssText = "display:inline-block;width:18px;height:14px;";
            val.appendChild(flag);
          }
          var txt = doc.createElement("span");
          txt.textContent = value || "—";
          val.appendChild(txt);
          row.appendChild(lbl);
          row.appendChild(val);
          return row;
        }
        var realCode = info.real ? info.real.code : null;
        var realCoords = info.real ? info.real.lat.toFixed(2) + ", " + info.real.lon.toFixed(2) : "—";
        statusRow.appendChild(makeRow(t("Ubicación real:"), (realCode ? realCode.toUpperCase() : "—") + "  " + realCoords, realCode));
        var ovCode = info.override ? info.override.code : null;
        statusRow.appendChild(makeRow(t("Override activo:"), ovCode ? ovCode.toUpperCase() : t("Ninguno"), ovCode));
        var statusIndicator = doc.createElement("div");
        statusIndicator.className = info.isActive ? "hbx-glasschip-gold" : "hbx-glasschip";
        statusIndicator.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:6px;background:" + (info.isActive ? "rgba(201,162,39,0.1)" : "var(--theme-bg-secondary)") + ";border:1px solid " + (info.isActive ? "#c9a227" : "var(--theme-border)") + ";";
        var dot = doc.createElement("div");
        dot.style.cssText = "width:7px;height:7px;border-radius:50%;background:" + (info.isActive ? "#c9a227" : "var(--theme-text-muted)") + ";flex-shrink:0;";
        var statusTxt = doc.createElement("span");
        statusTxt.style.cssText = "font-size:12px;color:" + (info.isActive ? "#c9a227" : "var(--theme-text-muted)") + ";font-weight:500;";
        statusTxt.textContent = info.isActive ? t("Bypass ACTIVO — usando coords reales + bandera override") : t("Bypass inactivo");
        statusIndicator.appendChild(dot);
        statusIndicator.appendChild(statusTxt);
        statusRow.appendChild(statusIndicator);
      }
      container.appendChild(statusRow);
      var btnGroup = doc.createElement("div");
      btnGroup.style.cssText = "display:flex;flex-direction:column;gap:8px;margin-top:4px;";
      function makeGeoBtn(label, icon, style, onClick) {
        var btn = doc.createElement("button");
        if (style.indexOf("c9a227") !== -1) btn.classList.add("hbx-accent-gold");
        btn.style.cssText = "width:100%;padding:10px 14px;border:1px solid var(--theme-border);border-radius:6px;font-size:12.5px;font-weight:500;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;" + style;
        btn.innerHTML = icon + label;
        btn.onclick = function() {
          onClick();
          renderStatus();
        };
        return btn;
      }
      var pickBtn = makeGeoBtn(t("Elegir Bandera"), '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>', "background:var(--theme-bg-secondary);color:var(--theme-text-primary);", function() {
        showLocationPicker(doc, function(code) {
          saveLocationOverride(code);
          if (window.showToast) window.showToast(t("Bandera guardada: ") + code.toUpperCase(), "success");
          renderStatus();
        });
      });
      pickBtn.onmouseenter = function() {
        pickBtn.style.background = "var(--theme-bg-hover)";
      };
      pickBtn.onmouseleave = function() {
        pickBtn.style.background = "var(--theme-bg-secondary)";
      };
      var syncBtn = makeGeoBtn(t("Sincronizar Bypass"), '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>', "background:#c9a227;color:#000;border-color:#c9a227;", function() {
        if (window.GeoManager) {
          window.GeoManager.sync(true);
          if (window.showToast) window.showToast(t("¡Bypass activado y sincronizado!"), "success");
        } else {
          if (window.showToast) window.showToast(t("GeoManager no disponible"), "error");
        }
      });
      syncBtn.onmouseenter = function() {
        syncBtn.style.background = "#b8911f";
      };
      syncBtn.onmouseleave = function() {
        syncBtn.style.background = "#c9a227";
      };
      var deactivateBtn = makeGeoBtn(t("Desactivar Bypass"), '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>', "background:var(--theme-bg-secondary);color:var(--theme-text-primary);", function() {
        if (window.GeoManager) {
          window.GeoManager.sync(false);
          if (window.showToast) window.showToast(t("Bypass desactivado"), "info");
        }
      });
      deactivateBtn.onmouseenter = function() {
        deactivateBtn.style.background = "var(--theme-bg-hover)";
      };
      deactivateBtn.onmouseleave = function() {
        deactivateBtn.style.background = "var(--theme-bg-secondary)";
      };
      var removeBtn = makeGeoBtn(t("Eliminar Override"), '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>', "background:var(--theme-bg-secondary);color:#dc2626;border-color:var(--theme-border);", function() {
        localStorage.removeItem("geo_override");
        localStorage.setItem("geo_bypass_tick", "false");
        if (window.showToast) window.showToast(t("Override eliminado"), "info");
      });
      removeBtn.onmouseenter = function() {
        removeBtn.style.borderColor = "#dc2626";
        removeBtn.style.background = "rgba(220,38,38,0.08)";
      };
      removeBtn.onmouseleave = function() {
        removeBtn.style.borderColor = "var(--theme-border)";
        removeBtn.style.background = "var(--theme-bg-secondary)";
      };
      btnGroup.appendChild(pickBtn);
      btnGroup.appendChild(syncBtn);
      btnGroup.appendChild(deactivateBtn);
      btnGroup.appendChild(removeBtn);
      container.appendChild(btnGroup);
      var tip = doc.createElement("div");
      tip.className = "hbx-glasschip";
      tip.style.cssText = "color:var(--theme-text-muted);font-size:10px;padding:8px;background:var(--theme-bg-secondary);border-radius:6px;line-height:1.5;";
      tip.textContent = t("Elegí una bandera en la pestaña Varios (Override location) y despues activá el bypass aquí.");
      container.appendChild(tip);
      geoSection.appendChild(container);
      var dialogContent = dialog.querySelector(".section") || dialog;
      dialogContent.parentNode.insertBefore(geoSection, dialogContent.nextSibling);
      geoBtn.addEventListener("click", function() {
        var sections = dialog.querySelectorAll(".tabcontents > .section");
        for (var i = 0; i < sections.length; i++) sections[i].style.display = "none";
        [ "theme-section", "perf-section", "multiauth-section" ].forEach(function(h) {
          var s = dialog.querySelector('[data-hook="' + h + '"]');
          if (s) s.style.display = "none";
        });
        geoSection.style.display = "block";
        renderStatus();
        var allTabs = tabs.querySelectorAll("button");
        for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove("selected");
        geoBtn.classList.add("selected");
      });
      var originalTabsG = tabs.querySelectorAll('button:not([data-hook="geobtn"])');
      for (var i = 0; i < originalTabsG.length; i++) {
        originalTabsG[i].addEventListener("click", function() {
          geoSection.style.display = "none";
        });
      }
      return geoBtn;
    }
    function createEnhancementsTab(doc, tabs) {
      if (tabs.querySelector('button[data-hook="enhancementsbtn"]')) return;
      var enhBtn = doc.createElement("button");
      enhBtn.setAttribute("data-hook", "enhancementsbtn");
      enhBtn.textContent = t("Enhancement");
      enhBtn.style.display = "none";
      tabs.appendChild(enhBtn);
      var enhSection = doc.createElement("section");
      enhSection.className = "enhancements-section section";
      enhSection.setAttribute("data-hook", "enhancements-section");
      enhSection.style.display = "none";
      var ENH_STORAGE_PREFIX = "hbx_enh_";
      var ENHANCEMENT_OPTIONS = [];
      var container = doc.createElement("div");
      container.style.cssText = "display:flex;flex-direction:column;gap:2px;";
      var header = doc.createElement("div");
      header.style.cssText = "color:var(--theme-text-muted);font-size:11px;margin-bottom:8px;padding-bottom:6px;border-bottom:1px solid var(--theme-border);letter-spacing:0.3px;";
      header.textContent = t("Funciones adicionales y mejoras.");
      container.appendChild(header);

      // ---------------------------------------------------------------
      // Bloqueo por Discord: Ball & Avatar y Field Skin solo se pueden
      // usar si hay una cuenta de Discord logueada (sesión activa via
      // discordAuth.js / bridge local en 127.0.0.1:5484). Si no hay
      // sesión, el tile se muestra con un candado encima y, al tocarlo,
      // arranca el mismo flujo de login que usa el pill del header
      // (discord-login.js).
      // ---------------------------------------------------------------
      var DISCORD_AUTH_API = "http://127.0.0.1:5484";
      var discordAuthCache = { loggedIn: false, checked: false };
      var lockedTiles = [];
      function fetchDiscordAuthStatus() {
        return fetch(DISCORD_AUTH_API + "/discord-auth/status", { cache: "no-store" }).then(function(r) {
          return r.ok ? r.json() : null;
        }).catch(function() {
          return null;
        });
      }
      function refreshDiscordAuthState() {
        return fetchDiscordAuthStatus().then(function(estado) {
          discordAuthCache.loggedIn = !!(estado && estado.sesion);
          discordAuthCache.checked = true;
          lockedTiles.forEach(function(fn) {
            fn();
          });
          return discordAuthCache.loggedIn;
        });
      }
      refreshDiscordAuthState();
      setInterval(refreshDiscordAuthState, 5000);

      function buildBigTile(opts) {
        var tile = doc.createElement("div");
        tile.setAttribute("data-hook", opts.hook);
        tile.style.cssText = "position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:22px 10px;border:1px solid var(--theme-border);border-radius:12px;cursor:pointer;text-align:center;background:var(--theme-bg-secondary);transition:background .15s,border-color .15s,transform .1s;flex:1;min-width:0;overflow:hidden;";
        var icon = doc.createElement("div");
        icon.innerHTML = opts.iconSvg;
        tile.appendChild(icon);
        var title = doc.createElement("div");
        title.style.cssText = "color:var(--theme-text-primary);font-size:14px;font-weight:700;letter-spacing:0.2px;";
        title.textContent = opts.title;
        tile.appendChild(title);
        var desc = doc.createElement("div");
        desc.className = "hbx-tile-desc";
        desc.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;";
        desc.textContent = opts.desc;
        tile.appendChild(desc);
        tile.onmouseenter = function() {
          tile.style.background = "var(--theme-bg-hover)";
          tile.style.borderColor = "#c9a227";
        };
        tile.onmouseleave = function() {
          tile.style.background = "var(--theme-bg-secondary)";
          tile.style.borderColor = "var(--theme-border)";
        };
        tile.onmousedown = function() {
          tile.style.transform = "scale(0.98)";
        };
        tile.onmouseup = function() {
          tile.style.transform = "scale(1)";
        };
        function openTarget() {
          var mod = window[opts.globalName];
          if (mod && typeof mod.openPanel === "function") {
            mod.openPanel(doc);
          } else if (window.showToast) {
            window.showToast(opts.missingMsg, "error");
          } else {
            console.warn("[settings] window." + opts.globalName + " no está disponible.");
          }
        }
        if (!opts.locked) {
          tile.onclick = openTarget;
          return tile;
        }

        // --- A partir de acá, versión bloqueada del tile ---
        var overlay = doc.createElement("div");
        overlay.setAttribute("data-lock-overlay", "true");
        overlay.style.cssText = "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;background:color-mix(in srgb, var(--theme-bg-secondary, #1a1a1a) 82%, transparent);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);border-radius:12px;padding:10px;text-align:center;transition:opacity .2s ease;z-index:2;cursor:pointer;";
        var lockIconWrap = doc.createElement("div");
        lockIconWrap.style.cssText = "color:#c9a227;display:flex;margin-bottom:1px;";
        lockIconWrap.innerHTML = '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>';
        overlay.appendChild(lockIconWrap);
        var lockTitle = doc.createElement("div");
        lockTitle.style.cssText = "color:var(--theme-text-primary);font-size:11.5px;font-weight:700;letter-spacing:0.2px;";
        lockTitle.textContent = t("Bloqueado");
        overlay.appendChild(lockTitle);
        var lockSub = doc.createElement("div");
        lockSub.style.cssText = "color:var(--theme-text-muted);font-size:9.5px;line-height:1.35;max-width:150px;";
        lockSub.textContent = t("Iniciá sesión con Discord para usar esto");
        overlay.appendChild(lockSub);
        var lockBtn = doc.createElement("div");
        lockBtn.style.cssText = "margin-top:3px;display:flex;align-items:center;gap:5px;background:#5865F2;color:#fff;font-size:10px;font-weight:700;padding:5px 11px;border-radius:999px;box-shadow:0 2px 6px rgba(0,0,0,.25);transition:filter .15s,transform .1s;";
        lockBtn.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.099.246.197.373.291a.077.077 0 0 1-.006.128 12.3 12.3 0 0 1-1.873.892.076.076 0 0 0-.04.106c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.029 19.84 19.84 0 0 0 6.001-3.03.077.077 0 0 0 .032-.055c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.955 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.211 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg><span>' + t("Conectar Discord") + "</span>";
        overlay.appendChild(lockBtn);
        tile.appendChild(overlay);

        var connecting = false;
        function setOverlayConnecting(isConnecting) {
          connecting = isConnecting;
          if (isConnecting) {
            lockSub.textContent = t("Esperando Discord…");
            lockBtn.style.opacity = "0.65";
            lockBtn.style.pointerEvents = "none";
          } else {
            lockSub.textContent = t("Iniciá sesión con Discord para usar esto");
            lockBtn.style.opacity = "1";
            lockBtn.style.pointerEvents = "";
          }
        }
        function startLoginFlow() {
          if (connecting) return;
          setOverlayConnecting(true);
          fetch(DISCORD_AUTH_API + "/discord-auth/start").catch(function() {});
          var intentos = 0;
          var poller = setInterval(function() {
            intentos++;
            refreshDiscordAuthState().then(function(loggedIn) {
              if (loggedIn) {
                clearInterval(poller);
                setOverlayConnecting(false);
                if (window.showToast) window.showToast(t("¡Cuenta de Discord conectada!"), "success");
              } else if (intentos > 200) {
                clearInterval(poller);
                setOverlayConnecting(false);
              }
            });
          }, 1500);
        }
        overlay.onclick = function(e) {
          e.stopPropagation();
          startLoginFlow();
        };
        overlay.onmouseenter = function() {
          lockBtn.style.filter = "brightness(1.12)";
        };
        overlay.onmouseleave = function() {
          lockBtn.style.filter = "";
        };
        tile.onclick = function() {
          if (discordAuthCache.loggedIn) {
            openTarget();
          } else {
            startLoginFlow();
          }
        };
        function refreshLockUI() {
          if (discordAuthCache.loggedIn) {
            overlay.style.opacity = "0";
            overlay.style.pointerEvents = "none";
          } else {
            overlay.style.opacity = "1";
            overlay.style.pointerEvents = "auto";
          }
        }
        refreshLockUI();
        lockedTiles.push(refreshLockUI);
        return tile;
      }
      var tilesRow = doc.createElement("div");
      tilesRow.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;";
      var abTile = buildBigTile({
        hook: "ab-tile",
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/><circle cx="19" cy="18" r="3.2" stroke-width="1.4"/></svg>',
        title: t("Ball & Avatar"),
        desc: t("Personalizá tu avatar y tu pelota"),
        globalName: "HbxPersonalizar",
        missingMsg: t("Personalizar no está disponible (falta cargar personalizar-panel.js)"),
        locked: true
      });
      tilesRow.appendChild(abTile);
      var fsTile = buildBigTile({
        hook: "fs-tile",
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M12 5.5v13"/><circle cx="12" cy="12" r="2.4"/></svg>',
        title: t("Field Skin"),
        desc: t("Personalizá el pasto, el fondo y las líneas"),
        globalName: "HbxFieldSkin",
        missingMsg: t("Field Skin no está disponible (falta cargar field-skin-panel.js)"),
        locked: true
      });
      tilesRow.appendChild(fsTile);
      var sbTile = buildBigTile({
        hook: "sb-tile",
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"><rect x="2.5" y="8" width="19" height="8" rx="2"/><circle cx="7" cy="12" r="1.4" fill="#fff" stroke="none"/><circle cx="17" cy="12" r="1.4" fill="#fff" stroke="none"/></svg>',
        title: t("Scoreboard"),
        desc: t("Personalizá colores, fondo, escala y posición"),
        globalName: "HbxScoreboard",
        missingMsg: t("Scoreboard no está disponible (falta cargar scoreboard-panel.js)")
      });
      tilesRow.appendChild(sbTile);
      var ksTile = buildBigTile({
        hook: "ks-tile",
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="6.5" width="19" height="12" rx="2"/><path d="M7 11v1M11 11v1M15 11v1M9 15h6"/></svg>',
        title: t("Keystrokes"),
        desc: t("Personalizá el HUD de teclas y su color"),
        globalName: "HbxKeystrokes",
        missingMsg: t("Keystrokes no está disponible (falta cargar keystroke-panel.js)")
      });
      tilesRow.appendChild(ksTile);
      var fpsTile = buildBigTile({
        hook: "fps-tile",
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 2v10l6 3"/><path d="M12 2a10 10 0 0 1 8.66 5"/></svg>',
        title: t("FPS"),
        desc: t("Contador de FPS real, color y posición"),
        globalName: "HbxFps",
        missingMsg: t("FPS no está disponible (falta cargar fps-panel.js)")
      });
      tilesRow.appendChild(fpsTile);
      var pingTile = buildBigTile({
        hook: "ping-tile",
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12" y2="20"/></svg>',
        title: t("Ping"),
        desc: t("Latencia real, color según calidad y posición"),
        globalName: "HbxPing",
        missingMsg: t("Ping no está disponible (falta cargar ping-panel.js)")
      });
      tilesRow.appendChild(pingTile);
      var clockTile = buildBigTile({
        hook: "clock-tile",
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 8v4.5l3 1.8"/></svg>',
        title: t("Clock"),
        desc: t("Reloj con formato, color y posición"),
        globalName: "HbxClock",
        missingMsg: t("Clock no está disponible (falta cargar clock-panel.js)")
      });
      tilesRow.appendChild(clockTile);
      var riTile = buildBigTile({
        hook: "ri-tile",
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M7 13h5"/><path d="M7 16.5h8"/></svg>',
        title: t("Room Info"),
        desc: t("Nombre de sala, jugadores y mapa"),
        globalName: "HbxRoomInfo",
        missingMsg: t("Room Info no está disponible (falta cargar room-info-panel.js)")
      });
      tilesRow.appendChild(riTile);
      var spTile = buildBigTile({
        hook: "sp-tile",
        iconSvg: '<svg width="24" height="24" viewBox="0 0 168 168" fill="#1DB954"><path d="M83.996.277C37.747.277.253 37.77.253 84.019c0 46.251 37.494 83.741 83.743 83.741 46.254 0 83.744-37.49 83.744-83.741 0-46.246-37.49-83.738-83.744-83.742zm38.404 120.78a5.222 5.222 0 01-7.19 1.73c-19.692-12.03-44.483-14.755-73.687-8.084a5.222 5.222 0 01-2.322-10.184c31.9-7.291 59.263-4.15 81.485 9.35a5.222 5.222 0 011.729 7.188h-.015zm10.25-22.805a6.531 6.531 0 01-8.98 2.152c-22.548-13.858-56.928-17.869-83.622-9.775a6.53 6.53 0 11-3.783-12.5c30.492-9.252 68.436-4.771 94.334 11.144a6.53 6.53 0 012.052 8.979zm.876-23.744c-27.01-16.04-71.652-17.51-97.454-9.688a7.834 7.834 0 11-4.549-14.985c29.623-8.985 78.842-7.246 109.907 11.202a7.834 7.834 0 01-7.898 13.536l-.006-.065z"/></svg>',
        title: t("Spotify"),
        desc: t("Now playing, controles, 5 diseños y colores"),
        globalName: "HbxSpotify",
        missingMsg: t("Spotify no está disponible (falta cargar spotify-panel.js)")
      });
      tilesRow.appendChild(spTile);
      var svTile = buildBigTile({
        hook: "sv-tile",
        iconSvg: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="14" rx="2"/><path d="M10 9.5v5l4-2.5z" fill="#fff" stroke="none"/></svg>',
        title: t("Screen Video"),
        desc: t("Overlay de YouTube, TikTok o video directo"),
        globalName: "HbxScreenVideo",
        missingMsg: t("Screen Video no está disponible (falta cargar screen-video-panel.js)")
      });
      tilesRow.appendChild(svTile);
      container.appendChild(tilesRow);
      function getEnh(hook) {
        try {
          return localStorage.getItem(ENH_STORAGE_PREFIX + hook) === "true";
        } catch (e) {
          return false;
        }
      }
      function setEnh(hook, val) {
        try {
          localStorage.setItem(ENH_STORAGE_PREFIX + hook, val ? "true" : "false");
        } catch (e) {}
      }
      var enhRows = [];
      function buildEnhRow(opt) {
        var row = doc.createElement("div");
        row.className = "perf-option-row";
        row.style.cssText = "display:flex;align-items:flex-start;gap:10px;padding:7px 8px;border-radius:6px;cursor:pointer;";
        row.setAttribute("data-enh-hook", opt.hook);
        row.onmouseenter = function() {
          row.style.background = "var(--theme-bg-hover)";
        };
        row.onmouseleave = function() {
          row.style.background = "";
        };
        var checkbox = doc.createElement("div");
        checkbox.className = "perf-checkbox";
        checkbox.style.cssText = "width:17px;height:17px;border:2px solid var(--theme-border-light);border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;";
        checkbox.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="opacity:0;"><polyline points="20 6 9 17 4 12"/></svg>';
        var textDiv = doc.createElement("div");
        textDiv.style.cssText = "flex:1;min-width:0;";
        var title = doc.createElement("div");
        title.style.cssText = "color:var(--theme-text-primary);font-size:12.5px;font-weight:500;margin-bottom:2px;";
        title.textContent = opt.title;
        textDiv.appendChild(title);
        var desc = doc.createElement("div");
        desc.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;line-height:1.4;";
        desc.textContent = opt.desc;
        textDiv.appendChild(desc);
        row.appendChild(checkbox);
        row.appendChild(textDiv);
        function refresh() {
          var on = getEnh(opt.hook);
          checkbox.style.background = on ? "var(--theme-accent, #c9a227)" : "";
          checkbox.style.borderColor = on ? "var(--theme-accent, #c9a227)" : "var(--theme-border-light)";
          checkbox.firstChild.style.opacity = on ? "1" : "0";
        }
        row.onclick = function() {
          var newVal = !getEnh(opt.hook);
          setEnh(opt.hook, newVal);
          refresh();
          if (typeof opt.onToggle === "function") opt.onToggle(newVal);
        };
        refresh();
        enhRows.push(refresh);
        return row;
      }
      var emptyState = doc.createElement("div");
      emptyState.style.cssText = "color:var(--theme-text-muted);font-size:11.5px;text-align:center;padding:24px 8px;";
      emptyState.textContent = t("Todavía no hay mejoras agregadas.");
      emptyState.setAttribute("data-enh-empty", "true");
      if (ENHANCEMENT_OPTIONS.length === 0) {
        container.appendChild(emptyState);
      } else {
        ENHANCEMENT_OPTIONS.forEach(function(opt) {
          container.appendChild(buildEnhRow(opt));
        });
      }
      enhSection.appendChild(container);
      var dialogContent = dialog.querySelector(".section") || dialog;
      dialogContent.parentNode.insertBefore(enhSection, dialogContent.nextSibling);
      enhBtn.addEventListener("click", function() {
        var sections = dialog.querySelectorAll(".tabcontents > .section");
        for (var i = 0; i < sections.length; i++) sections[i].style.display = "none";
        [ "theme-section", "perf-section", "multiauth-section", "geo-section" ].forEach(function(h) {
          var s = dialog.querySelector('[data-hook="' + h + '"]');
          if (s) s.style.display = "none";
        });
        enhSection.style.display = "block";
        enhRows.forEach(function(fn) {
          fn();
        });
        refreshDiscordAuthState();
        var allTabs = tabs.querySelectorAll("button");
        for (var i = 0; i < allTabs.length; i++) allTabs[i].classList.remove("selected");
        enhBtn.classList.add("selected");
      });
      var originalTabsE = tabs.querySelectorAll('button:not([data-hook="enhancementsbtn"])');
      for (var i = 0; i < originalTabsE.length; i++) {
        originalTabsE[i].addEventListener("click", function() {
          enhSection.style.display = "none";
        });
      }
      return enhBtn;
    }
    var sidebarButtons = [];
    var pendingButtons = {};
    function createSidebarButton(originalBtn) {
      var hook = originalBtn.getAttribute("data-hook");
      if (sidebar.querySelector('[data-hook-ref="' + hook + '"]')) return;
      var iconData = tabIcons[hook] || {
        icon: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>',
        tooltip: originalBtn.textContent,
        order: 99
      };
      var sidebarBtn = doc.createElement("button");
      sidebarBtn.className = "settings-sidebar-btn";
      sidebarBtn.setAttribute("data-hook-ref", hook);
      sidebarBtn.setAttribute("data-order", iconData.order || 99);
      sidebarBtn.innerHTML = '<span class="sb-icon">' + iconData.icon + '</span><span class="sb-label">' + iconData.tooltip + "</span>";
      if (originalBtn.classList.contains("selected")) sidebarBtn.classList.add("selected");
      sidebarBtn.onclick = function() {
        var allBtns = sidebar.querySelectorAll(".settings-sidebar-btn:not([data-close])");
        for (var j = 0; j < allBtns.length; j++) allBtns[j].classList.remove("selected");
        sidebarBtn.classList.add("selected");
        var titleEl = doc.getElementById("settings-section-title");
        if (titleEl) titleEl.textContent = iconData.tooltip;
        if (hook !== "themebtn") {
          var themeSection = dialog.querySelector('[data-hook="theme-section"]');
          if (themeSection) themeSection.style.display = "none";
        }
        if (hook !== "perfbtn") {
          var perfSection = dialog.querySelector('[data-hook="perf-section"]');
          if (perfSection) perfSection.style.display = "none";
          dialog.style.maxHeight = "";
          dialog.style.height = "";
          var tabcontents = dialog.querySelector(".tabcontents");
          if (tabcontents) {
            tabcontents.style.maxHeight = "";
            tabcontents.style.overflowY = "";
          }
        }
        if (hook !== "multiauthbtn") {
          var multiAuthSection = dialog.querySelector('[data-hook="multiauth-section"]');
          if (multiAuthSection) multiAuthSection.style.display = "none";
        }
        if (hook !== "geobtn") {
          var geoSection = dialog.querySelector('[data-hook="geo-section"]');
          if (geoSection) geoSection.style.display = "none";
        }
        if (hook !== "enhancementsbtn") {
          var enhSectionEl = dialog.querySelector('[data-hook="enhancements-section"]');
          if (enhSectionEl) enhSectionEl.style.display = "none";
        }
        if (hook !== "themebtn" && hook !== "perfbtn" && hook !== "multiauthbtn" && hook !== "geobtn" && hook !== "enhancementsbtn") {
          var sections = dialog.querySelectorAll(".tabcontents > .section");
          for (var k = 0; k < sections.length; k++) sections[k].style.display = "";
        }
        originalBtn.click();
      };
      originalBtn.addEventListener("click", function() {
        var allBtns = sidebar.querySelectorAll(".settings-sidebar-btn:not([data-close])");
        for (var j = 0; j < allBtns.length; j++) allBtns[j].classList.remove("selected");
        sidebarBtn.classList.add("selected");
        var titleEl = doc.getElementById("settings-section-title");
        if (titleEl) titleEl.textContent = iconData.tooltip;
      });
      pendingButtons[hook] = sidebarBtn;
      sidebarButtons.push(sidebarBtn);
    }
    function insertButtonsInOrder() {
      var spacer = sidebar.querySelector("[data-spacer]");
      for (var i = 0; i < tabOrder.length; i++) {
        var hook = tabOrder[i];
        if (pendingButtons[hook]) {
          if (spacer) sidebar.insertBefore(pendingButtons[hook], spacer); else sidebar.appendChild(pendingButtons[hook]);
        }
      }
    }
    var tabButtons = tabs ? tabs.querySelectorAll("button") : [];
    for (var i = 0; i < tabButtons.length; i++) createSidebarButton(tabButtons[i]);
    if (tabs) {
      var themeTabBtn = createThemeTab(doc, tabs);
      if (themeTabBtn) createSidebarButton(themeTabBtn);
      var perfTabBtn = createPerfTab(doc, tabs);
      if (perfTabBtn) createSidebarButton(perfTabBtn);
      var multiAuthTabBtn = createMultiAuthTab(doc, tabs);
      if (multiAuthTabBtn) createSidebarButton(multiAuthTabBtn);
      var geoTabBtn = createGeoTab(doc, tabs);
      if (geoTabBtn) createSidebarButton(geoTabBtn);
      var enhancementsTabBtn = createEnhancementsTab(doc, tabs);
      if (enhancementsTabBtn) createSidebarButton(enhancementsTabBtn);
    }
    var spacer = doc.createElement("div");
    spacer.style.cssText = "flex:1;min-height:8px;";
    spacer.setAttribute("data-spacer", "true");
    sidebar.appendChild(spacer);
    insertButtonsInOrder();
    var divider = doc.createElement("div");
    divider.style.cssText = "width:28px;height:1px;background:var(--theme-border);margin:2px auto;flex-shrink:0;";
    sidebar.appendChild(divider);
    // Ya no hay botón de "Cerrar" en el panel: Ajustes ahora es una
    // pestaña externa (como Personalizar/Pase), se sale por el nav de
    // arriba, no desde adentro. Igual guardamos la referencia al botón
    // nativo de cerrar — lo seguimos necesitando para avisarle al juego
    // por atrás que salió de la vista de settings (ver closeSettingsTab).
    var closeBtn = dialog.querySelector('button[data-hook="close"]');
    if (tabs) {
      var tabsObserver = new MutationObserver(function(mutations) {
        var needsReorder = false;
        for (var m = 0; m < mutations.length; m++) {
          var added = mutations[m].addedNodes;
          for (var n = 0; n < added.length; n++) {
            if (added[n].tagName === "BUTTON") {
              createSidebarButton(added[n]);
              needsReorder = true;
            }
          }
        }
        if (needsReorder) insertButtonsInOrder();
      });
      tabsObserver.observe(tabs, {
        childList: true
      });
    }
    if (tabs) tabs.style.display = "none";
    if (closeBtn) closeBtn.style.display = "none";
    dialog.style.position = "relative";
    dialog.appendChild(sidebar);
    injectSoundSkinPanel(doc, dialog);
  }
  // -----------------------------------------------------------------
  // Sonidos personalizados (pelota / gol) — se insertan al final de la
  // sección nativa de Sonido ("soundsec"). La lógica de guardado y de
  // aplicar el cambio en caliente vive en extensions/sound-skin.js;
  // acá solo armamos la UI y la conectamos.
  // -----------------------------------------------------------------
  function injectSoundSkinPanel(doc, dialog) {
    if (doc.getElementById("hn-sound-skin-block")) return;
    var soundSection = dialog.querySelector('.section[data-hook="soundsec"]');
    if (!soundSection) return;
    if (!window.HaxNewSoundSkin) return;
    if (!doc.getElementById("hn-sound-skin-style")) {
      var style = doc.createElement("style");
      style.id = "hn-sound-skin-style";
      style.textContent = [
        "#hn-sound-skin-block{margin-top:18px;padding-top:16px;border-top:1px solid var(--theme-border,#333);min-width:0;max-width:100%;box-sizing:border-box;}",
        "#hn-sound-skin-block .hn-ss-title{font-size:12px;font-weight:700;letter-spacing:.02em;color:var(--theme-text-secondary,#9aa);text-transform:uppercase;margin-bottom:10px;}",
        "#hn-sound-skin-block .hn-ss-row{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:8px;background:var(--theme-bg-secondary,#20282c);margin-bottom:8px;}",
        "#hn-sound-skin-block .hn-ss-info{flex:1;min-width:0;}",
        "#hn-sound-skin-block .hn-ss-label{font-size:13px;color:var(--theme-text-primary,#eee);font-weight:600;}",
        "#hn-sound-skin-block .hn-ss-file{font-size:11px;color:var(--theme-text-muted,#888);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
        "#hn-sound-skin-block .hn-ss-btn{border:1px solid var(--theme-border-light,#3a4448);background:var(--theme-bg-tertiary,#2a3236);color:var(--theme-text-primary,#eee);font-size:11px;padding:6px 10px;border-radius:6px;cursor:pointer;white-space:nowrap;flex-shrink:0;}",
        "#hn-sound-skin-block .hn-ss-btn:hover{background:var(--theme-bg-hover,#333d42);}",
        "#hn-sound-skin-block .hn-ss-btn.hn-ss-primary{border-color:var(--theme-accent,#4a9eff);color:var(--theme-accent,#4a9eff);}",
        "#hn-sound-skin-block .hn-ss-btn:disabled{opacity:.4;cursor:default;}",
        "#hn-sound-skin-block .hn-ss-btn.hn-ss-gear{padding:6px 9px;font-size:14px;line-height:1;}",
        "#hn-sound-skin-block .hn-ss-btn.hn-ss-mute{padding:6px 9px;font-size:13px;line-height:1;}",
        "#hn-sound-skin-block .hn-ss-btn.hn-ss-mute.hn-ss-muted-on{border-color:#dc2626;color:#dc2626;}",
        "#hn-sound-skin-block .hn-ss-row{flex-wrap:wrap;}",
        "#hn-sound-skin-block .hn-ss-err{font-size:11px;color:#ff6b6b;margin-top:4px;display:none;}",
        "#hn-sound-skin-block .hn-ss-editor{background:var(--theme-bg-secondary,#20282c);border:1px solid var(--theme-border-light,#3a4448);border-radius:8px;padding:12px;margin:-2px 0 10px;}",
        "#hn-sound-skin-block .hn-se-load,#hn-sound-skin-block .hn-se-err{font-size:12px;color:var(--theme-text-secondary,#9aa);}",
        "#hn-sound-skin-block .hn-se-err{color:#ff6b6b;}",
        "#hn-sound-skin-block .hn-se-canvas-wrap{position:relative;width:100%;height:64px;margin-bottom:10px;border-radius:6px;overflow:hidden;background:var(--theme-bg-tertiary,#2a3236);}",
        "#hn-sound-skin-block .hn-se-canvas{position:absolute;inset:0;width:100%;height:100%;display:block;}",
        "#hn-sound-skin-block .hn-se-row{margin-bottom:10px;}",
        "#hn-sound-skin-block .hn-se-two{display:flex;gap:10px;}",
        "#hn-sound-skin-block .hn-se-two>div{flex:1;}",
        "#hn-sound-skin-block .hn-se-row label{display:block;font-size:11px;color:var(--theme-text-secondary,#9aa);margin-bottom:3px;}",
        "#hn-sound-skin-block .hn-se-row input[type=range]{width:100%;}",
        "#hn-sound-skin-block .hn-se-row select{width:100%;background:var(--theme-bg-tertiary,#2a3236);color:var(--theme-text-primary,#eee);border:1px solid var(--theme-border-light,#3a4448);border-radius:6px;padding:5px;font-size:12px;}",
        "#hn-sound-skin-block .hn-se-val{font-size:11px;color:var(--theme-text-muted,#888);margin-top:2px;}",
        "#hn-sound-skin-block .hn-se-actions{display:flex;justify-content:space-between;align-items:center;margin-top:4px;}",
        "#hn-sound-skin-block .hn-se-size{font-size:11px;color:var(--theme-text-muted,#888);}",
        /* ================================================================
           PIEL LIQUID GLASS — SOUND SKIN (filas "Sonidos personalizados").
           Misma receta EXACTA que el resto de Ajustes (settings-sidebar-anim):
           vidrio con degradé blanco + blur, borde rgba(255,255,255,.18-.24),
           inset highlight en botones. Gateado por html:not([data-theme="default"])
           para no tocar el tema por defecto (sigue con los sólidos planos). --- */
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-ss-row{",
          "background:linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)!important;",
          "-webkit-backdrop-filter:blur(12px)!important;",
          "backdrop-filter:blur(12px)!important;",
          "border:1px solid rgba(255,255,255,0.16)!important;",
        "}",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-ss-btn{",
          "background:linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%)!important;",
          "-webkit-backdrop-filter:blur(10px)!important;",
          "backdrop-filter:blur(10px)!important;",
          "border:1px solid rgba(255,255,255,0.20)!important;",
          "color:rgba(255,255,255,0.92)!important;",
          "box-shadow:inset 0 1px 0 rgba(255,255,255,0.22)!important;",
          "transition:background 0.15s ease!important;",
        "}",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-ss-btn:hover{",
          "background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.11) 100%)!important;",
        "}",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-ss-btn:active{ transform:scale(0.97)!important; }",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-ss-btn.hn-ss-primary{",
          "border-color:rgba(255,255,255,0.30)!important;",
          "color:#fff!important;",
        "}",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-ss-btn.hn-ss-mute.hn-ss-muted-on{",
          "background:linear-gradient(180deg, rgba(220,38,38,0.30) 0%, rgba(220,38,38,0.14) 100%)!important;",
          "border-color:rgba(220,38,38,0.55)!important;",
          "color:#fca5a5!important;",
        "}",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-ss-btn:disabled{",
          "background:linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)!important;",
          "border-color:rgba(255,255,255,0.10)!important;",
          "box-shadow:none!important;",
        "}",
        /* ================================================================
           PIEL LIQUID GLASS — SOUND EDITOR (panel de recortar / volumen /
           comprimir que abre el ⚙️ de cada fila). Misma receta: chip de
           vidrio para el contenedor y la franja del waveform, select y
           botones con el mismo vidrio que el resto de Ajustes. --- */
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-ss-editor{",
          "background:linear-gradient(180deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)!important;",
          "-webkit-backdrop-filter:blur(12px)!important;",
          "backdrop-filter:blur(12px)!important;",
          "border:1px solid rgba(255,255,255,0.16)!important;",
        "}",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-se-canvas-wrap{",
          "background:linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)!important;",
          "border:1px solid rgba(255,255,255,0.14)!important;",
        "}",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-se-row select{",
          "background:linear-gradient(180deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 100%)!important;",
          "-webkit-backdrop-filter:blur(10px)!important;",
          "backdrop-filter:blur(10px)!important;",
          "border:1px solid rgba(255,255,255,0.22)!important;",
          "color:#fff!important;",
        "}",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-se-row select option{",
          "background:#1e1e22!important; color:#fff!important;",
        "}",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-se-row label{ color:rgba(255,255,255,0.55)!important; }",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-se-val,",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-se-size{ color:rgba(255,255,255,0.55)!important; }",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-se-load{ color:rgba(255,255,255,0.6)!important; }",
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-se-err{ color:#fca5a5!important; }",
        /* input[type=range] nativo: pintamos el track para que combine con
           el vidrio (el thumb queda con el estilo default del SO/navegador,
           igual que en el resto de sliders de Ajustes). */
        "html:not([data-theme=\"default\"]) #hn-sound-skin-block .hn-se-row input[type=range]{",
          "accent-color:rgba(255,255,255,0.85)!important;",
        "}"
      ].join("");
      doc.head && doc.head.appendChild(style);
    }
    var block = doc.createElement("div");
    block.id = "hn-sound-skin-block";
    var title = doc.createElement("div");
    title.className = "hn-ss-title";
    title.textContent = t("Sonidos personalizados");
    block.appendChild(title);
    var types = window.HaxNewSoundSkin.TYPES || [ "kick", "goal" ];
    types.forEach(function(type) {
      var row = doc.createElement("div");
      row.className = "hn-ss-row";
      var info = doc.createElement("div");
      info.className = "hn-ss-info";
      var label = doc.createElement("div");
      label.className = "hn-ss-label";
      label.textContent = t(window.HaxNewSoundSkin.getLabel(type));
      var fileLine = doc.createElement("div");
      fileLine.className = "hn-ss-file";
      info.appendChild(label);
      info.appendChild(fileLine);
      var err = doc.createElement("div");
      err.className = "hn-ss-err";
      var fileInput = doc.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "audio/*";
      fileInput.style.display = "none";
      var chooseBtn = doc.createElement("button");
      chooseBtn.type = "button";
      chooseBtn.className = "hn-ss-btn hn-ss-primary";
      chooseBtn.textContent = t("Elegir archivo");
      var previewBtn = doc.createElement("button");
      previewBtn.type = "button";
      previewBtn.className = "hn-ss-btn";
      previewBtn.textContent = t("Escuchar");
      var editBtn = doc.createElement("button");
      editBtn.type = "button";
      editBtn.className = "hn-ss-btn hn-ss-gear";
      editBtn.title = t("Editar audio (recortar, volumen, comprimir)");
      editBtn.innerHTML = "\u2699";
      var resetBtn = doc.createElement("button");
      resetBtn.type = "button";
      resetBtn.className = "hn-ss-btn";
      resetBtn.textContent = t("Restablecer");
      var galleryBtn = doc.createElement("button");
      galleryBtn.type = "button";
      galleryBtn.className = "hn-ss-btn";
      galleryBtn.textContent = t("Galería");
      var muteBtn = doc.createElement("button");
      muteBtn.type = "button";
      muteBtn.className = "hn-ss-btn hn-ss-mute";
      var editorPanel = doc.createElement("div");
      editorPanel.className = "hn-ss-editor";
      editorPanel.style.display = "none";
      function refresh() {
        var isCustom = window.HaxNewSoundSkin.isCustom(type);
        var hasDefault = window.HaxNewSoundSkin.hasDefault(type);
        var name = window.HaxNewSoundSkin.getFileName(type);
        var muted = window.HaxNewSoundSkin.isMuted(type);
        fileLine.textContent = isCustom && name ? name : (hasDefault ? t("Predeterminado") : t("Sin sonido"));
        resetBtn.disabled = !isCustom;
        // Tecla/click no tienen sonido predeterminado: sin nada cargado no
        // hay qué escuchar ni qué editar.
        previewBtn.disabled = !isCustom && !hasDefault;
        editBtn.disabled = !isCustom && !hasDefault;
        muteBtn.innerHTML = muted ? "\u{1F507}" : "\u{1F50A}";
        muteBtn.title = muted ? t("Sonido muteado (click para activar)") : t("Mutear este sonido");
        muteBtn.classList.toggle("hn-ss-muted-on", muted);
      }
      chooseBtn.addEventListener("click", function() {
        fileInput.click();
      });
      fileInput.addEventListener("change", function() {
        var file = fileInput.files && fileInput.files[0];
        fileInput.value = "";
        if (!file) return;
        err.style.display = "none";
        window.HaxNewSoundSkin.setSound(type, file).then(refresh).catch(function(e) {
          err.textContent = e && e.message ? e.message : t("No se pudo cargar el sonido");
          err.style.display = "block";
        });
      });
      resetBtn.addEventListener("click", function() {
        window.HaxNewSoundSkin.resetSound(type);
        refresh();
      });
      editBtn.addEventListener("click", function() {
        var opening = editorPanel.style.display === "none";
        if (window.HaxNewSoundEditor) window.HaxNewSoundEditor.close(editorPanel);
        editorPanel.style.display = opening ? "block" : "none";
        if (opening && window.HaxNewSoundEditor) {
          window.HaxNewSoundEditor.build(doc, editorPanel, type, function() {
            refresh();
            editorPanel.style.display = "none";
          });
        }
      });
      previewBtn.addEventListener("click", function() {
        window.HaxNewSoundSkin.preview(type);
      });
      galleryBtn.addEventListener("click", function() {
        if (window.HaxNewSoundGallery) {
          window.HaxNewSoundGallery.open(doc, type, refresh);
        }
      });
      muteBtn.addEventListener("click", function() {
        window.HaxNewSoundSkin.setMuted(type, !window.HaxNewSoundSkin.isMuted(type));
        refresh();
      });
      row.appendChild(info);
      row.appendChild(previewBtn);
      row.appendChild(chooseBtn);
      row.appendChild(galleryBtn);
      row.appendChild(resetBtn);
      row.appendChild(editBtn);
      row.appendChild(muteBtn);
      row.appendChild(fileInput);
      block.appendChild(row);
      block.appendChild(err);
      block.appendChild(editorPanel);
      refresh();
    });
    soundSection.appendChild(block);
  }
  function hideTooltip() {
    var tooltip = document.getElementById("settings-sidebar-tooltip");
    if (tooltip) {
      tooltip.className = "hidden";
      tooltip.style.opacity = "0";
    }
  }
  // -----------------------------------------------------------------
  // Apertura / cierre — pestaña externa, desconectada de "sala"
  // -----------------------------------------------------------------
  // Antes: Ajustes vivía como un estado más de la máquina de vistas del
  // juego (Injector.onSettingsView es el mismo mecanismo que usa
  // game-view). Por eso, al cerrar, se pisaba con la transición nativa
  // de "volver a sala" y a veces quedabas pegado.
  //
  // Ahora: igual que personalizar-panel.js, el diálogo se saca del árbol
  // donde lo puso el juego y se cuelga directo de document.body la
  // primera vez que se construye. A partir de ahí, mostrar/ocultar es
  // 100% nuestro (una clase + display, nada de animar el .dialog — esa
  // regla ya se había aprendido antes), y el open/close SOLO lo dispara
  // el nav de arriba mandando AJUSTES_OPEN / AJUSTES_CLOSE, nunca la
  // vista de sala.
  //
  // El botón nativo de "cerrar" YA NO se clickea en cada cierre. La
  // traza de consola mostró que closeBtn.click() dispara la transición
  // interna del juego (volver a room list) SIEMPRE que se ejecuta, esté
  // o no visible el diálogo — no es un problema de "estaba abierto o
  // no", es que ese click en sí mismo es lo que rompe todo mid-match.
  //
  // El juego sí necesita, una única vez, que le clickeemos su botón de
  // cerrar para sincronizar su estado interno (porque fuimos nosotros
  // los que le hicimos click a su botón de abrir para forzar que
  // construya el diálogo). Ese único ciclo nativo se hace UNA SOLA VEZ
  // en toda la sesión, en warmUpNativeState(), y se dispara desde init()
  // en un momento seguro (apenas arranca la app, o en cuanto se vuelve a
  // sala si arrancó en medio de una partida) — nunca como reacción a que
  // el usuario abra/cierre Ajustes. De ahí en más, abrir/cerrar Ajustes
  // es 100% nuestro (display flex/none), exactamente igual que
  // Personalizar y Pase de Batalla.
  // -----------------------------------------------------------------
  // DEBUG: [HBX-SETTINGS-DEBUG] — dejamos estos logs prendidos porque
  // ya van tres vueltas de este bug y necesitamos ver EXACTAMENTE en
  // qué orden pasan las cosas la próxima vez que falle. No molestan en
  // producción (son un par de líneas por apertura de Ajustes), y si
  // hace falta los sacamos después.
  // -----------------------------------------------------------------
  function dbg() {
    var args = ["[HBX-SETTINGS-DEBUG]"].concat(Array.prototype.slice.call(arguments));
    console.log.apply(console, args);
  }
  function viewSnapshot() {
    return {
      roomlist: !!document.querySelector(".roomlist-view"),
      room: !!document.querySelector(".room-view"),
      game: !!document.querySelector(".game-view"),
      settingsDialog: !!document.querySelector(".dialog.settings-view"),
      settingsDialogParent: (function() {
        var d = document.querySelector(".dialog.settings-view");
        return d && d.parentNode ? (d.parentNode === document.body ? "body" : d.parentNode.className) : null;
      })()
    };
  }

  var settingsBuilt = false;
  var settingsWarmed = false;
  var settingsBuilding = false;
  // Flag para diferenciar "nosotros clickeamos el botón nativo para
  // forzar la construcción" (warm-up) de "el usuario clickeó el
  // cog nativo de verdad" (ver interceptNativeSettingsButton más abajo).
  var settingsSyntheticClick = false;

  // PASO 1 — construir el diálogo real (clickeando el botón nativo de
  // abrir, que es la única forma de que el juego arme sonido/video/
  // controles) SIN todavía moverlo de lugar. Moverlo antes de que se
  // complete el ciclo de warm-up (ver más abajo) es justo lo que
  // rompía la reconstrucción de la vista de abajo: el cierre nativo
  // buscaba el diálogo donde el juego lo había puesto, no lo
  // encontraba porque ya lo habíamos arrancado a document.body, y la
  // transición de vuelta a sala/room-list quedaba a medio hacer →
  // pantalla negra.
  // cb(dialog) si se pudo construir, cb(null) si se abandonó (sin
  // botón nativo disponible o timeout) — SIEMPRE se llama a cb, para
  // que quien nos llama (warmUpNativeState) pueda resetear sus propias
  // banderas y no quedar trabado esperando algo que ya no va a pasar.
  function ensureDialogConstructed(cb) {
    var dialog = document.querySelector(".dialog.settings-view");
    if (dialog && document.getElementById("settings-sidebar-panel")) {
      dbg("ensureDialogConstructed: ya existía", viewSnapshot());
      cb(dialog);
      return;
    }
    var nativeBtn = document.querySelector("[data-hook='settings']");
    if (!nativeBtn) {
      dbg("ensureDialogConstructed: no hay botón nativo de settings en el DOM ahora mismo, se abandona este intento", viewSnapshot());
      cb(null);
      return;
    }
    dbg("ensureDialogConstructed: clickeando abrir nativo", viewSnapshot());
    settingsSyntheticClick = true;
    nativeBtn.click();
    settingsSyntheticClick = false;
    var tries = 0;
    (function waitBuilt() {
      dialog = document.querySelector(".dialog.settings-view");
      if (dialog && document.getElementById("settings-sidebar-panel")) {
        dbg("ensureDialogConstructed: diálogo construido", viewSnapshot());
        cb(dialog);
        return;
      }
      if (++tries > 100) { dbg("ensureDialogConstructed: timeout esperando construcción, se abandona este intento"); cb(null); return; }
      setTimeout(waitBuilt, 50);
    })();
  }

  // PASO 2 — warm-up completo: construir (paso 1), dejar que el juego
  // haga SU propio ciclo nativo de cierre con el diálogo todavía en su
  // posición original (para que la transición de vuelta encuentre todo
  // donde lo espera), esperar a que esa transición realmente termine, y
  // RECIÉN AHÍ mover el diálogo a document.body y ocultarlo con
  // nuestro propio CSS. De acá en adelante abrir/cerrar es 100%
  // nuestro. Esto corre UNA SOLA VEZ en toda la sesión y solo cuando no
  // hay partida en curso (ver tryWarmUpWhenSafe en init).
  function warmUpNativeState(cb) {
    if (settingsWarmed) { if (cb) cb(); return; }
    if (settingsBuilding) return; // ya hay un warm-up en curso, no duplicar
    settingsBuilding = true;
    dbg("warmUpNativeState: arrancando", viewSnapshot());
    ensureDialogConstructed(function(dialog) {
      if (!dialog) {
        // No se pudo construir esta vez (típicamente: el botón nativo
        // todavía no estaba en el DOM). Soltamos la bandera para que
        // el próximo intento (click del usuario, o el reintento de
        // abajo) no se encuentre con esto trabado para siempre.
        settingsBuilding = false;
        dbg("warmUpNativeState: no se pudo construir, se reintenta en 500ms", viewSnapshot());
        setTimeout(function() { warmUpNativeState(cb); }, 500);
        return;
      }
      var closeBtn = dialog.querySelector('button[data-hook="close"]');
      dbg("warmUpNativeState: clickeando cerrar nativo (única vez)", viewSnapshot());
      if (closeBtn) closeBtn.click();
      // Le damos un respiro a la transición nativa (es async, se vio en
      // la traza que dispara MutationObserver/listeners fuera del tick
      // actual) antes de tocar el DOM nosotros.
      setTimeout(function() {
        dbg("warmUpNativeState: post-cierre nativo, antes de mover a body", viewSnapshot());
        if (dialog.parentNode !== document.body) {
          document.body.appendChild(dialog);
        }
        dialog.style.setProperty("display", "none", "important");
        settingsBuilt = true;
        settingsWarmed = true;
        settingsBuilding = false;
        dbg("warmUpNativeState: listo, diálogo relocado", viewSnapshot());
        if (cb) cb();
      }, 120);
    });
  }

  function openSettingsTab() {
    if (!settingsBuilt) {
      // No debería pasar casi nunca (el warm-up corre proactivo desde
      // init), pero por las dudas: si todavía no está construido/movido
      // y estamos en medio de una partida, NO forzamos nada acá — eso
      // es justo lo que rompía todo. Nos quedamos esperando a que el
      // warm-up (que va a disparar solo en cuanto se salga de la
      // partida) termine.
      if (document.querySelector(".game-view")) {
        dbg("openSettingsTab: pedido en medio de partida sin warm-up hecho, ignorando por seguridad", viewSnapshot());
        return;
      }
      dbg("openSettingsTab: sin warm-up todavía, se dispara ahora (estamos fuera de partida)", viewSnapshot());
      warmUpNativeState(openSettingsTab);
      return;
    }
    var dialog = document.querySelector(".dialog.settings-view");
    if (!dialog) { dbg("openSettingsTab: no hay diálogo pese a settingsBuilt=true (raro)", viewSnapshot()); return; }
    dbg("openSettingsTab: mostrando (CSS puro)", viewSnapshot());
    dialog.style.setProperty("display", "flex", "important");
    window.parent.postMessage({ action: "ULT_HEADER_SETTINGS_GLASS", active: true }, "*");
  }
  function closeSettingsTab() {
    var dialog = document.querySelector(".dialog.settings-view");
    if (dialog) dialog.style.setProperty("display", "none", "important");
    dbg("closeSettingsTab: ocultando (CSS puro, sin click nativo)", viewSnapshot());
    window.parent.postMessage({ action: "ULT_HEADER_SETTINGS_GLASS", active: false }, "*");
    // Nada de closeBtn.click() acá: ese click ya se hizo (una sola vez,
    // en un momento seguro) en warmUpNativeState(). Cerrar Ajustes desde
    // acá en más es puro CSS, nunca toca al juego.
  }
  // -----------------------------------------------------------------
  // Interceptar el botón de Ajustes NATIVO del juego (el iconito de
  // engranaje que el propio Haxball pone en la barra de partida y en la
  // room list — data-hook="settings", NO el de nuestro nav de arriba).
  // Ese botón, si lo dejamos actuar, abre el diálogo nativo bugueado
  // (el mismo problema de siempre: te termina llevando de vuelta a la
  // room list). Lo capturamos en fase de captura, ANTES de que el
  // juego llegue a procesarlo, y en su lugar abrimos nuestra pestaña
  // de Ajustes de siempre (la de la sidebar), pidiéndole al header que
  // la abra igual que si el usuario hubiese tocado el ícono del nav —
  // así el estado del nav (qué botón queda "activo" arriba) también
  // queda sincronizado.
  //
  // OJO: warmUpNativeState también clickea este mismo botón, pero de
  // forma sintética (para forzar que el juego construya el diálogo la
  // primera vez) — esos clicks van con settingsSyntheticClick=true y
  // los dejamos pasar sin interceptar, si no el warm-up nunca podría
  // construir nada.
  function interceptNativeSettingsButton(ev) {
    if (settingsSyntheticClick) return; // es nuestro propio click de warm-up, dejarlo pasar
    var btn = ev.target && ev.target.closest && ev.target.closest('[data-hook="settings"]');
    if (!btn) return;
    // El botón nuestro (el que vive en la sidebar de Ajustes, si alguna
    // vez tuviera el mismo data-hook) no debería existir dentro del
    // propio diálogo ya relocado — por las dudas, si el click vino de
    // adentro de nuestro dialog ya relocado a body, no lo tocamos.
    if (btn.closest(".dialog.settings-view")) return;
    dbg("interceptNativeSettingsButton: click real del usuario en el cog nativo, redirigiendo a la pestaña correcta", viewSnapshot());
    ev.preventDefault();
    ev.stopImmediatePropagation();
    window.parent.postMessage({ action: "AJUSTES_OPEN_REQUEST" }, "*");
  }
  function init() {
    if (!Injector.isGameFrame()) return;
    Injector.onSettingsView(function() {
      modifySettingsDialog(document);
    });
    var settingsDialog = document.querySelector(".dialog.settings-view");
    if (settingsDialog && !document.getElementById("settings-sidebar-panel")) {
      modifySettingsDialog(document);
    }
    // Capture phase para ganarle al handler nativo del juego (que está
    // en bubble/onclick normal — se vio en la traza vieja: "wd.onclick
    // @ game-min.js:3909"). true = fase de captura.
    document.addEventListener("click", interceptNativeSettingsButton, true);
    // Idem para "Override location" dentro de la pestaña Varios/Diversos
    // (miscsec nativo) -- ver comentario grande arriba de esta función.
    document.addEventListener("click", interceptLocationOverrideButton, true);
    // El nav de arriba (frame principal) no puede tocar el DOM del juego
    // directamente, así que pide abrir/cerrar por postMessage — mismo
    // patrón que PERSONALIZAR_OPEN / PERSONALIZAR_CLOSE.
    window.addEventListener("message", function(e) {
      if (e.data?.action === "AJUSTES_OPEN") openSettingsTab();
      else if (e.data?.action === "AJUSTES_CLOSE") closeSettingsTab();
    });
    // Esc en Ajustes -> volver a la pestaña de Sala del header. Fase de
    // captura para ganarle a cualquier atajo nativo del juego que también
    // escuche Escape (ej. el menú de sala in-match), igual que se hace
    // con el cog nativo más arriba. Solo actúa si el diálogo de Ajustes
    // está realmente visible (mismo chequeo que usa openSettingsTab/
    // closeSettingsTab: display "flex" puesto por nosotros vía CSS).
    document.addEventListener("keydown", function(e) {
      if (e.key !== "Escape") return;
      var dialog = document.querySelector(".dialog.settings-view");
      if (!dialog || dialog.style.display !== "flex") return;
      dbg("Escape en Ajustes: cerrando y volviendo a Sala", viewSnapshot());
      e.preventDefault();
      e.stopImmediatePropagation();
      closeSettingsTab();
      // Mismo mensaje que ya usa position-drag.js para volver el nav de
      // arriba a "Sala" y cerrar cualquier otro panel abierto.
      window.parent.postMessage({ action: "ULT_GO_HOME" }, "*");
    }, true);
    // El backdrop del header (franja de fondo) tiene que ocultarse
    // mientras estás jugando una partida, y volver a mostrarse en el
    // lobby/roomlist. Avisamos al frame principal con postMessage.
    var lastInGame = null;
    function checkGameViewState() {
      var inGame = !!document.querySelector(".game-view");
      if (inGame === lastInGame) return;
      lastInGame = inGame;
      window.parent.postMessage({ action: "ULT_HEADER_BACKDROP", visible: !inGame }, "*");
    }
    Injector.onView("game-view", checkGameViewState);
    Injector.onViewLeave("game-view", checkGameViewState);
    checkGameViewState();
    // Disparar el único warm-up nativo (ver warmUpNativeState) en un
    // momento seguro: si arrancamos ya en la room list, ahora mismo; si
    // arrancamos en medio de una partida, recién cuando se salga de
    // ella. Así el ciclo nativo abrir+cerrar nunca ocurre mid-match.
    function tryWarmUpWhenSafe() {
      if (document.querySelector(".game-view")) {
        dbg("tryWarmUpWhenSafe: hay partida en curso, se pospone", viewSnapshot());
        return;
      }
      dbg("tryWarmUpWhenSafe: disparando warm-up", viewSnapshot());
      warmUpNativeState();
    }
    tryWarmUpWhenSafe();
    Injector.onViewLeave("game-view", tryWarmUpWhenSafe);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();