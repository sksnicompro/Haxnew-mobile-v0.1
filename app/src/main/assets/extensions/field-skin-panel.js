(function() {
  if (typeof Injector !== "undefined" && Injector.isMainFrame && Injector.isMainFrame()) return;
  function t(key) {
    return window.__t ? window.__t(key) : key;
  }
  function ensureStyles(doc) {
    if (doc.getElementById("hbxfs-styles")) return;
    var style = doc.createElement("style");
    style.id = "hbxfs-styles";
    style.textContent = [ ".hbxfs-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:999999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .16s ease;}", ".hbxfs-overlay.is-open{opacity:1;}", ".hbxfs-card{width:440px;max-width:92vw;max-height:86vh;background:var(--theme-bg-primary);border:1px solid var(--theme-border);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden;transform:translateY(10px) scale(.98);transition:transform .16s ease;}", ".hbxfs-overlay.is-open .hbxfs-card{transform:translateY(0) scale(1);}", ".hbxfs-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--theme-border);flex-shrink:0;}", ".hbxfs-title{display:flex;align-items:center;gap:8px;color:var(--theme-text-primary);font-size:14px;font-weight:700;letter-spacing:.2px;}", ".hbxfs-close{width:26px;height:26px;border-radius:7px;border:1px solid var(--theme-border);background:var(--theme-bg-secondary);color:var(--theme-text-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}", ".hbxfs-close:hover{color:#dc2626;border-color:#dc2626;background:rgba(220,38,38,.08);}", ".hbxfs-tabs{display:flex;gap:6px;padding:10px 16px;border-bottom:1px solid var(--theme-border);flex-shrink:0;}", ".hbxfs-tabbtn{flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--theme-border);background:var(--theme-bg-secondary);color:var(--theme-text-muted);font-size:12px;font-weight:600;cursor:pointer;text-align:center;transition:background .15s,color .15s,border-color .15s;}", ".hbxfs-tabbtn.is-active{background:#c9a227;border-color:#c9a227;color:#000;}", ".hbxfs-body{overflow-y:auto;padding:14px 16px 18px;flex:1;display:flex;flex-direction:column;gap:14px;}", ".hbxfs-sec{display:none;flex-direction:column;gap:12px;}", ".hbxfs-sec.is-active{display:flex;}", ".hbxfs-sectitle{color:var(--theme-text-primary);font-size:12.5px;font-weight:600;letter-spacing:.2px;margin-top:2px;}", ".hbxfs-hint{color:var(--theme-text-muted);font-size:10.5px;line-height:1.5;}", ".hbxfs-uploadbox{display:flex;align-items:center;gap:12px;padding:10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:10px;}", ".hbxfs-preview{width:52px;height:52px;border-radius:9px;flex-shrink:0;background:var(--theme-bg-primary) center/cover no-repeat;border:2px solid var(--theme-border-light);display:flex;align-items:center;justify-content:center;color:var(--theme-text-muted);font-size:11px;overflow:hidden;}", ".hbxfs-btnrow{display:flex;gap:8px;flex-wrap:wrap;}", ".hbxfs-btn{padding:7px 12px;border-radius:7px;border:1px solid var(--theme-border);background:var(--theme-bg-primary);color:var(--theme-text-primary);font-size:11.5px;cursor:pointer;}", ".hbxfs-btn:hover{background:var(--theme-bg-hover);}", ".hbxfs-btn.primary{background:#c9a227;border-color:#c9a227;color:#000;font-weight:600;}", ".hbxfs-btn.primary:hover{background:#b8911f;}", ".hbxfs-btn.danger{color:#dc2626;}", ".hbxfs-btn.danger:hover{background:rgba(220,38,38,.08);}", ".hbxfs-btn:disabled{opacity:.4;cursor:not-allowed;}", ".hbxfs-seg{display:flex;gap:6px;flex-wrap:wrap;}", ".hbxfs-segbtn{flex:1;padding:7px 8px;border-radius:7px;border:1px solid var(--theme-border);background:var(--theme-bg-secondary);color:var(--theme-text-muted);font-size:11.5px;font-weight:600;cursor:pointer;text-align:center;white-space:nowrap;}", ".hbxfs-segbtn.is-active{background:#c9a227;border-color:#c9a227;color:#000;}", ".hbxfs-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 2px;}", ".hbxfs-row .lbl{color:var(--theme-text-primary);font-size:12px;}", ".hbxfs-toggle{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:6px;cursor:pointer;}", ".hbxfs-toggle:hover{background:var(--theme-bg-hover);}", ".hbxfs-chk{width:17px;height:17px;border:2px solid var(--theme-border-light);border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}", ".hbxfs-chk.on{background:#c9a227;border-color:#c9a227;}", ".hbxfs-range{flex:1;}", ".hbxfs-meta{color:var(--theme-text-muted);font-size:10.5px;min-width:34px;text-align:right;}", ".hbxfs-divider{height:1px;background:var(--theme-border);margin:2px 0;}", ".hbxfs-fade{transition:opacity .12s ease;}", ".hbxfs-fade.is-off{opacity:.4;pointer-events:none;}" ].join("");
    doc.head.appendChild(style);
    if (!doc.getElementById("hbxfs-glass-styles")) {
      var glass = doc.createElement("style");
      glass.id = "hbxfs-glass-styles";
      /* Liquid Glass: misma receta EXACTA que liquid-glass-room-dialogs.js
         (tarjeta/blur/bordes), gateada a html:not([data-theme="default"]),
         acentos dorados reemplazados por vidrio blanco (como el resto del
         mod desde que se sacaron los acentos dorados de Ajustes). */
      glass.textContent = [
        "html:not([data-theme=\"default\"]) .hbxfs-card{border-radius:24px!important;background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.12) 100%), linear-gradient(180deg, #2a2a2e 0%, #1e1e22 100%)!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;border:1px solid rgba(255,255,255,0.20)!important;box-shadow:0 12px 32px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-head{border-bottom-color:rgba(255,255,255,0.16)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-title{color:rgba(255,255,255,0.95)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-close{background:linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%)!important;border:1px solid rgba(255,255,255,0.20)!important;color:rgba(255,255,255,0.70)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-close:hover{color:#fff!important;border-color:#dc2626!important;background:rgba(220,38,38,.18)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-tabs{border-bottom-color:rgba(255,255,255,0.16)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-tabbtn{background:linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)!important;border:1px solid rgba(255,255,255,0.16)!important;color:rgba(255,255,255,0.60)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-tabbtn:hover{background:linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-tabbtn.is-active{background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.13) 100%)!important;border-color:rgba(255,255,255,0.32)!important;color:#fff!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-sectitle{color:rgba(255,255,255,0.95)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-hint{color:rgba(255,255,255,0.55)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-uploadbox{background:linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 100%)!important;-webkit-backdrop-filter:blur(12px)!important;backdrop-filter:blur(12px)!important;border:1px solid rgba(255,255,255,0.16)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-preview{background-color:rgba(0,0,0,0.25)!important;border-color:rgba(255,255,255,0.20)!important;color:rgba(255,255,255,0.55)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-row .lbl{color:rgba(255,255,255,0.90)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-toggle:hover{background:rgba(255,255,255,0.07)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-toggle > div:nth-child(2) > div:first-child{color:rgba(255,255,255,0.90)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-chk{border-color:rgba(255,255,255,0.30)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-chk.on{background:rgba(255,255,255,0.85)!important;border-color:rgba(255,255,255,0.85)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-chk.on svg{stroke:#000!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-btn{background:linear-gradient(180deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.07) 100%)!important;border:1px solid rgba(255,255,255,0.20)!important;color:rgba(255,255,255,0.92)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-btn:hover{background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.11) 100%)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-btn.primary{background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.13) 100%)!important;border:1px solid rgba(255,255,255,0.32)!important;color:#fff!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-btn.primary:hover{background:linear-gradient(180deg, rgba(255,255,255,0.36) 0%, rgba(255,255,255,0.16) 100%)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-btn.danger{color:#f87171!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-btn.danger:hover{background:rgba(220,38,38,.15)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-btn:disabled{opacity:.35!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-segbtn{background:linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)!important;border:1px solid rgba(255,255,255,0.16)!important;color:rgba(255,255,255,0.60)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-segbtn.is-active{background:linear-gradient(180deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.13) 100%)!important;border-color:rgba(255,255,255,0.32)!important;color:#fff!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-meta{color:rgba(255,255,255,0.55)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-divider{background:rgba(255,255,255,0.14)!important;}",
        "html:not([data-theme=\"default\"]) .hbxfs-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.20)!important;}"
      ].join("");
      doc.head.appendChild(glass);
    }
  }
  function el(doc, tag, cls, html) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function toggleRow(doc, label, hint, initial, onChange) {
    var row = el(doc, "div", "hbxfs-toggle");
    var chk = el(doc, "div", "hbxfs-chk", '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" style="opacity:0"><polyline points="20 6 9 17 4 12"/></svg>');
    var textWrap = el(doc, "div");
    textWrap.style.cssText = "flex:1;min-width:0;";
    var titleEl = el(doc, "div", null, label);
    titleEl.style.cssText = "color:var(--theme-text-primary);font-size:12.5px;font-weight:500;";
    textWrap.appendChild(titleEl);
    if (hint) {
      var hintEl = el(doc, "div", "hbxfs-hint", hint);
      textWrap.appendChild(hintEl);
    }
    row.appendChild(chk);
    row.appendChild(textWrap);
    var state = !!initial;
    function paint() {
      chk.className = "hbxfs-chk" + (state ? " on" : "");
      chk.querySelector("svg").style.opacity = state ? "1" : "0";
    }
    paint();
    row.onclick = function() {
      state = !state;
      paint();
      onChange(state);
    };
    row._setState = function(v) {
      state = !!v;
      paint();
    };
    return row;
  }
  function rangeRow(doc, label, min, max, initial, unit, onChange) {
    var row = el(doc, "div", "hbxfs-row");
    var lbl = el(doc, "span", "lbl", label);
    var right = el(doc, "div");
    right.style.cssText = "display:flex;align-items:center;gap:8px;flex:1;justify-content:flex-end;";
    var input = doc.createElement("input");
    input.type = "range";
    input.className = "hbxfs-range";
    input.min = String(min);
    input.max = String(max);
    input.value = String(initial);
    var meta = el(doc, "span", "hbxfs-meta", initial + (unit || ""));
    input.oninput = function() {
      meta.textContent = input.value + (unit || "");
      onChange(parseFloat(input.value));
    };
    right.appendChild(input);
    right.appendChild(meta);
    row.appendChild(lbl);
    row.appendChild(right);
    return {
      row: row,
      input: input,
      meta: meta
    };
  }
  function colorRow(doc, label, initial, onChange) {
    var row = el(doc, "div", "hbxfs-row");
    var lbl = el(doc, "span", "lbl", label);
    var input = doc.createElement("input");
    input.type = "color";
    input.value = /^#/.test(initial) ? initial : "#000000";
    input.style.cssText = "width:34px;height:26px;padding:0;border:1px solid var(--theme-border);border-radius:5px;background:none;cursor:pointer;";
    input.oninput = function() {
      onChange(input.value);
    };
    row.appendChild(lbl);
    row.appendChild(input);
    return {
      row: row,
      input: input
    };
  }
  function segControl(doc, options, activeValue, onPick) {
    var wrap = el(doc, "div", "hbxfs-seg");
    var btns = {};
    options.forEach(function(opt) {
      var b = doc.createElement("button");
      b.type = "button";
      b.className = "hbxfs-segbtn" + (opt.value === activeValue ? " is-active" : "");
      b.textContent = opt.label;
      b.onclick = function() {
        Object.keys(btns).forEach(function(v) {
          btns[v].classList.remove("is-active");
        });
        b.classList.add("is-active");
        onPick(opt.value);
      };
      btns[opt.value] = b;
      wrap.appendChild(b);
    });
    wrap._setActive = function(v) {
      Object.keys(btns).forEach(function(k) {
        btns[k].classList.toggle("is-active", k === v);
      });
    };
    return wrap;
  }
  function imageUploadRow(doc, label, hint, hasImage, previewUrl, onPick, onClear) {
    var wrap = el(doc, "div");
    wrap.style.cssText = "display:flex;flex-direction:column;gap:10px;";
    var box = el(doc, "div", "hbxfs-uploadbox");
    var preview = el(doc, "div", "hbxfs-preview");
    var textWrap = el(doc, "div");
    textWrap.style.cssText = "flex:1;min-width:0;";
    var titleEl = el(doc, "div", null, label);
    titleEl.style.cssText = "color:var(--theme-text-primary);font-size:12.5px;font-weight:500;";
    var hintEl = el(doc, "div", "hbxfs-hint", hint);
    textWrap.appendChild(titleEl);
    textWrap.appendChild(hintEl);
    box.appendChild(preview);
    box.appendChild(textWrap);
    wrap.appendChild(box);
    var btnRow = el(doc, "div", "hbxfs-btnrow");
    var pickBtn = el(doc, "button", "hbxfs-btn primary", hasImage ? t("Cambiar imagen") : t("Subir imagen"));
    var clearBtn = el(doc, "button", "hbxfs-btn danger", t("Quitar"));
    pickBtn.type = "button";
    clearBtn.type = "button";
    clearBtn.disabled = !hasImage;
    btnRow.appendChild(pickBtn);
    btnRow.appendChild(clearBtn);
    wrap.appendChild(btnRow);
    function paint(has, url) {
      preview.style.backgroundImage = has && url ? "url(" + url + ")" : "";
      preview.innerHTML = has ? "" : "?";
      pickBtn.textContent = has ? t("Cambiar imagen") : t("Subir imagen");
      clearBtn.disabled = !has;
    }
    paint(hasImage, previewUrl);
    pickBtn.onclick = onPick;
    clearBtn.onclick = onClear;
    wrap._paint = paint;
    return wrap;
  }
  function buildPitchSection(doc) {
    var sec = el(doc, "div", "hbxfs-sec");
    function engine() {
      return window.HaxNewFieldSkin;
    }
    if (!engine()) {
      sec.appendChild(el(doc, "div", "hbxfs-hint", t("HaxNewFieldSkin no está disponible todavía. Abrí el panel de nuevo cuando el juego termine de cargar.")));
      return sec;
    }
    var init = engine().getPitch();
    sec.appendChild(el(doc, "div", "hbxfs-sectitle", t("Modo del pasto/hielo")));
    var modeSeg = segControl(doc, [ {
      value: "default",
      label: t("Por defecto")
    }, {
      value: "color",
      label: t("Color")
    }, {
      value: "image",
      label: t("Imagen")
    } ], init.mode, function(val) {
      engine().setPitchMode(val);
      refreshVisibility();
    });
    sec.appendChild(modeSeg);
    sec.appendChild(el(doc, "div", "hbxfs-divider"));
    var colorWrap = el(doc, "div", "hbxfs-fade");
    var colorObj = colorRow(doc, t("Color del pasto"), init.color, function(val) {
      engine().setPitchColor(val);
    });
    colorWrap.appendChild(colorObj.row);
    sec.appendChild(colorWrap);
    var imageWrap = el(doc, "div", "hbxfs-fade");
    imageWrap.style.cssText = "display:flex;flex-direction:column;gap:12px;";
    if (window.HaxNewFieldGallery) {
      var galleryRow = el(doc, "div", "hbxfs-btnrow");
      var galleryBtn = el(doc, "button", "hbxfs-btn primary", t("Galería"));
      galleryBtn.type = "button";
      galleryBtn.style.cssText = "flex:1;";
      galleryBtn.onclick = function() {
        window.HaxNewFieldGallery.open(doc, function(url) {
          engine().applyPresetPitchImage(url);
          refresh();
        }, {
          currentUrl: engine().getPitch().previewUrl
        });
      };
      galleryRow.appendChild(galleryBtn);
      imageWrap.appendChild(galleryRow);
    }
    var uploadRow = imageUploadRow(doc, t("Imagen del pasto"), t("JPG, PNG, WEBP o GIF — se ajusta al tamaño real de la cancha."), init.hasImage, init.previewUrl, function() {
      engine().pickPitchImage();
    }, function() {
      engine().clearPitchImage();
    });
    imageWrap.appendChild(uploadRow);
    var keepAspectRow = toggleRow(doc, t("Mantener proporción"), t("No estira la imagen — respeta su relación de aspecto original."), init.keepAspect, function(val) {
      engine().setPitchKeepAspect(val);
    });
    imageWrap.appendChild(keepAspectRow);
    var sizeXObj = rangeRow(doc, t("Ancho"), 10, 400, init.sizeX, "%", function(v) {
      engine().setPitchSizeX(v);
    });
    imageWrap.appendChild(sizeXObj.row);
    var sizeYObj = rangeRow(doc, t("Alto"), 10, 400, init.sizeY, "%", function(v) {
      engine().setPitchSizeY(v);
    });
    imageWrap.appendChild(sizeYObj.row);
    var offXObj = rangeRow(doc, t("Posición horizontal"), 0, 100, init.offsetX, "%", function(v) {
      engine().setPitchOffsetX(v);
    });
    imageWrap.appendChild(offXObj.row);
    var offYObj = rangeRow(doc, t("Posición vertical"), 0, 100, init.offsetY, "%", function(v) {
      engine().setPitchOffsetY(v);
    });
    imageWrap.appendChild(offYObj.row);
    sec.appendChild(imageWrap);
    function refreshVisibility() {
      var mode = engine().getPitch().mode;
      colorWrap.classList.toggle("is-off", mode !== "color");
      imageWrap.classList.toggle("is-off", mode !== "image");
    }
    refreshVisibility();
    function refresh() {
      var p = engine().getPitch();
      modeSeg._setActive(p.mode);
      colorObj.input.value = /^#/.test(p.color) ? p.color : "#000000";
      uploadRow._paint(p.hasImage, p.previewUrl);
      keepAspectRow._setState(p.keepAspect);
      sizeXObj.input.value = String(p.sizeX);
      sizeXObj.meta.textContent = p.sizeX + "%";
      sizeYObj.input.value = String(p.sizeY);
      sizeYObj.meta.textContent = p.sizeY + "%";
      offXObj.input.value = String(p.offsetX);
      offXObj.meta.textContent = p.offsetX + "%";
      offYObj.input.value = String(p.offsetY);
      offYObj.meta.textContent = p.offsetY + "%";
      refreshVisibility();
    }
    window.addEventListener("HaxNew:fieldskin", refresh);
    return sec;
  }
  function buildOutsideSection(doc) {
    var sec = el(doc, "div", "hbxfs-sec");
    function engine() {
      return window.HaxNewFieldSkin;
    }
    if (!engine()) {
      sec.appendChild(el(doc, "div", "hbxfs-hint", t("HaxNewFieldSkin no está disponible todavía.")));
      return sec;
    }
    var init = engine().getOutside();
    var enabledRow = toggleRow(doc, t("Personalizar el fondo de afuera"), t("El área fuera de la cancha, detrás de las gradas."), init.enabled, function(val) {
      engine().setOutsideEnabled(val);
      refreshVisibility();
    });
    sec.appendChild(enabledRow);
    var body = el(doc, "div", "hbxfs-fade");
    body.style.cssText = "display:flex;flex-direction:column;gap:12px;";
    var modeSeg = segControl(doc, [ {
      value: "color",
      label: t("Color")
    }, {
      value: "image",
      label: t("Imagen")
    } ], init.mode, function(val) {
      engine().setOutsideMode(val);
      refreshModeVisibility();
    });
    body.appendChild(modeSeg);
    var colorWrap = el(doc, "div", "hbxfs-fade");
    var colorObj = colorRow(doc, t("Color de fondo"), init.color, function(val) {
      engine().setOutsideColor(val);
    });
    colorWrap.appendChild(colorObj.row);
    body.appendChild(colorWrap);
    var imageWrap = el(doc, "div", "hbxfs-fade");
    var uploadRow = imageUploadRow(doc, t("Imagen de fondo"), t("Cubre toda la pantalla, recortada al centro."), init.hasImage, init.previewUrl, function() {
      engine().pickOutsideImage();
    }, function() {
      engine().clearOutsideImage();
    });
    imageWrap.appendChild(uploadRow);
    body.appendChild(imageWrap);
    sec.appendChild(body);
    function refreshModeVisibility() {
      var mode = engine().getOutside().mode;
      colorWrap.classList.toggle("is-off", mode !== "color");
      imageWrap.classList.toggle("is-off", mode !== "image");
    }
    function refreshVisibility() {
      var enabled = engine().getOutside().enabled;
      body.classList.toggle("is-off", !enabled);
      refreshModeVisibility();
    }
    refreshVisibility();
    function refresh() {
      var o = engine().getOutside();
      enabledRow._setState(o.enabled);
      modeSeg._setActive(o.mode);
      colorObj.input.value = /^#/.test(o.color) ? o.color : "#000000";
      uploadRow._paint(o.hasImage, o.previewUrl);
      refreshVisibility();
    }
    window.addEventListener("HaxNew:fieldskin", refresh);
    return sec;
  }
  function buildLinesSection(doc) {
    var sec = el(doc, "div", "hbxfs-sec");
    function engine() {
      return window.HaxNewFieldSkin;
    }
    if (!engine()) {
      sec.appendChild(el(doc, "div", "hbxfs-hint", t("HaxNewFieldSkin no está disponible todavía.")));
      return sec;
    }
    var init = engine().getLines();
    var enabledRow = toggleRow(doc, t("Personalizar el color de las líneas"), t("Borde de cancha, línea media y círculo central."), init.enabled, function(val) {
      engine().setLinesEnabled(val);
      refreshVisibility();
    });
    sec.appendChild(enabledRow);
    var colorWrap = el(doc, "div", "hbxfs-fade");
    var colorObj = colorRow(doc, t("Color de las líneas"), init.color, function(val) {
      engine().setLinesColor(val);
    });
    colorWrap.appendChild(colorObj.row);
    sec.appendChild(colorWrap);
    function refreshVisibility() {
      colorWrap.classList.toggle("is-off", !engine().getLines().enabled);
    }
    refreshVisibility();
    function refresh() {
      var l = engine().getLines();
      enabledRow._setState(l.enabled);
      colorObj.input.value = /^#/.test(l.color) ? l.color : "#000000";
      refreshVisibility();
    }
    window.addEventListener("HaxNew:fieldskin", refresh);
    return sec;
  }
  var overlayEl = null;
  function closePanel() {
    if (!overlayEl) return;
    overlayEl.classList.remove("is-open");
    var ref = overlayEl;
    setTimeout(function() {
      if (ref && ref.parentNode) ref.parentNode.removeChild(ref);
    }, 160);
    overlayEl = null;
  }
  function openPanel(doc) {
    doc = doc || document;
    ensureStyles(doc);
    if (overlayEl) closePanel();
    var overlay = el(doc, "div", "hbxfs-overlay");
    var card = el(doc, "div", "hbxfs-card");
    var head = el(doc, "div", "hbxfs-head");
    var titleWrap = el(doc, "div", "hbxfs-title", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><rect x="3" y="5.5" width="18" height="13" rx="1.5"/><path d="M12 5.5v13"/><circle cx="12" cy="12" r="2.4"/></svg><span>' + t("Field Skin") + "</span>");
    var closeBtn = el(doc, "button", "hbxfs-close", '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>');
    closeBtn.type = "button";
    closeBtn.onclick = closePanel;
    head.appendChild(titleWrap);
    head.appendChild(closeBtn);
    var tabs = el(doc, "div", "hbxfs-tabs");
    var pitchTabBtn = el(doc, "button", "hbxfs-tabbtn is-active", t("Pasto"));
    var outsideTabBtn = el(doc, "button", "hbxfs-tabbtn", t("Afuera"));
    var linesTabBtn = el(doc, "button", "hbxfs-tabbtn", t("Líneas"));
    pitchTabBtn.type = "button";
    outsideTabBtn.type = "button";
    linesTabBtn.type = "button";
    tabs.appendChild(pitchTabBtn);
    tabs.appendChild(outsideTabBtn);
    tabs.appendChild(linesTabBtn);
    var body = el(doc, "div", "hbxfs-body");
    var pitchSec = buildPitchSection(doc);
    var outsideSec = buildOutsideSection(doc);
    var linesSec = buildLinesSection(doc);
    pitchSec.classList.add("is-active");
    body.appendChild(pitchSec);
    body.appendChild(outsideSec);
    body.appendChild(linesSec);
    function selectTab(btn, sec) {
      [ pitchTabBtn, outsideTabBtn, linesTabBtn ].forEach(function(b) {
        b.classList.remove("is-active");
      });
      [ pitchSec, outsideSec, linesSec ].forEach(function(s) {
        s.classList.remove("is-active");
      });
      btn.classList.add("is-active");
      sec.classList.add("is-active");
    }
    pitchTabBtn.onclick = function() {
      selectTab(pitchTabBtn, pitchSec);
    };
    outsideTabBtn.onclick = function() {
      selectTab(outsideTabBtn, outsideSec);
    };
    linesTabBtn.onclick = function() {
      selectTab(linesTabBtn, linesSec);
    };
    card.appendChild(head);
    card.appendChild(tabs);
    card.appendChild(body);
    overlay.appendChild(card);
    overlay.onclick = function(ev) {
      if (ev.target === overlay) closePanel();
    };
    doc.body.appendChild(overlay);
    overlayEl = overlay;
    requestAnimationFrame(function() {
      overlay.classList.add("is-open");
    });
  }
  window.HbxFieldSkin = {
    openPanel: function(doc) {
      openPanel(doc || document);
    },
    closePanel: closePanel
  };
})();