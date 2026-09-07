(function() {
  if (typeof Injector !== "undefined" && Injector.isMainFrame && Injector.isMainFrame()) return;
  function t(key) {
    return window.__t ? window.__t(key) : key;
  }
  var PALETTE = [ "#ffffff", "#f8fafc", "#ef4444", "#f97316", "#eab308", "#22c55e", "#14b8a6", "#3b82f6", "#6366f1", "#a855f7", "#ec4899", "#111827", "#60a5fa", "#7c3aed", "#fb7185", "#34d399", "#0ea5e9", "#f59e0b" ];
  function ensureStyles(doc) {
    if (doc.getElementById("hbxab-styles")) return;
    var style = doc.createElement("style");
    style.id = "hbxab-styles";
    style.textContent = [ ".hbxab-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:999999;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .16s ease;}", ".hbxab-overlay.is-open{opacity:1;}", ".hbxab-card{width:440px;max-width:92vw;max-height:86vh;background:var(--theme-bg-primary);border:1px solid var(--theme-border);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden;transform:translateY(10px) scale(.98);transition:transform .16s ease;}", ".hbxab-overlay.is-open .hbxab-card{transform:translateY(0) scale(1);}", ".hbxab-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--theme-border);flex-shrink:0;}", ".hbxab-title{display:flex;align-items:center;gap:8px;color:var(--theme-text-primary);font-size:14px;font-weight:700;letter-spacing:.2px;}", ".hbxab-close{width:26px;height:26px;border-radius:7px;border:1px solid var(--theme-border);background:var(--theme-bg-secondary);color:var(--theme-text-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}", ".hbxab-close:hover{color:#dc2626;border-color:#dc2626;background:rgba(220,38,38,.08);}", ".hbxab-tabs{display:flex;gap:6px;padding:10px 16px;border-bottom:1px solid var(--theme-border);flex-shrink:0;}", ".hbxab-tabbtn{flex:1;padding:8px 10px;border-radius:8px;border:1px solid var(--theme-border);background:var(--theme-bg-secondary);color:var(--theme-text-muted);font-size:12px;font-weight:600;cursor:pointer;text-align:center;transition:background .15s,color .15s,border-color .15s;}", ".hbxab-tabbtn.is-active{background:#c9a227;border-color:#c9a227;color:#000;}", ".hbxab-body{overflow-y:auto;padding:14px 16px 18px;flex:1;display:flex;flex-direction:column;gap:14px;}", ".hbxab-sec{display:none;flex-direction:column;gap:12px;}", ".hbxab-sec.is-active{display:flex;}", ".hbxab-sectitle{color:var(--theme-text-primary);font-size:12.5px;font-weight:600;letter-spacing:.2px;margin-top:2px;}", ".hbxab-hint{color:var(--theme-text-muted);font-size:10.5px;line-height:1.5;}", ".hbxab-uploadbox{display:flex;align-items:center;gap:12px;padding:10px;background:var(--theme-bg-secondary);border:1px solid var(--theme-border);border-radius:10px;}", ".hbxab-preview{width:52px;height:52px;border-radius:50%;flex-shrink:0;background:var(--theme-bg-primary) center/cover no-repeat;border:2px solid var(--theme-border-light);display:flex;align-items:center;justify-content:center;color:var(--theme-text-muted);font-size:11px;overflow:hidden;}", ".hbxab-btnrow{display:flex;gap:8px;flex-wrap:wrap;}", ".hbxab-btn{padding:7px 12px;border-radius:7px;border:1px solid var(--theme-border);background:var(--theme-bg-primary);color:var(--theme-text-primary);font-size:11.5px;cursor:pointer;}", ".hbxab-btn:hover{background:var(--theme-bg-hover);}", ".hbxab-btn.primary{background:#c9a227;border-color:#c9a227;color:#000;font-weight:600;}", ".hbxab-btn.primary:hover{background:#b8911f;}", ".hbxab-btn.danger{color:#dc2626;}", ".hbxab-btn.danger:hover{background:rgba(220,38,38,.08);}", ".hbxab-btn:disabled{opacity:.4;cursor:not-allowed;}", ".hbxab-btn.chip.is-active{background:#c9a227;border-color:#c9a227;color:#000;font-weight:600;}", ".hbxab-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:6px 2px;}", ".hbxab-row .lbl{color:var(--theme-text-primary);font-size:12px;}", ".hbxab-toggle{display:flex;align-items:center;gap:10px;padding:7px 8px;border-radius:6px;cursor:pointer;}", ".hbxab-toggle:hover{background:var(--theme-bg-hover);}", ".hbxab-chk{width:17px;height:17px;border:2px solid var(--theme-border-light);border-radius:4px;display:flex;align-items:center;justify-content:center;flex-shrink:0;}", ".hbxab-chk.on{background:#c9a227;border-color:#c9a227;}", ".hbxab-swatches{display:flex;gap:6px;flex-wrap:wrap;}", ".hbxab-swatch{width:20px;height:20px;border-radius:50%;border:2px solid transparent;cursor:pointer;padding:0;}", ".hbxab-swatch.is-active{border-color:var(--theme-text-primary);box-shadow:0 0 0 2px var(--theme-bg-primary) inset;}", ".hbxab-range{flex:1;}", ".hbxab-meta{color:var(--theme-text-muted);font-size:10.5px;min-width:30px;text-align:right;}", ".hbxab-divider{height:1px;background:var(--theme-border);margin:2px 0;}" ].join("");
    doc.head.appendChild(style);
  }
  function el(doc, tag, cls, html) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function toggleRow(doc, label, hint, initial, onChange) {
    var row = el(doc, "div", "hbxab-toggle");
    var chk = el(doc, "div", "hbxab-chk", '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3" style="opacity:0"><polyline points="20 6 9 17 4 12"/></svg>');
    var textWrap = el(doc, "div");
    textWrap.style.cssText = "flex:1;min-width:0;";
    var titleEl = el(doc, "div", null, label);
    titleEl.style.cssText = "color:var(--theme-text-primary);font-size:12.5px;font-weight:500;";
    textWrap.appendChild(titleEl);
    if (hint) {
      var hintEl = el(doc, "div", "hbxab-hint", hint);
      textWrap.appendChild(hintEl);
    }
    row.appendChild(chk);
    row.appendChild(textWrap);
    var state = !!initial;
    function paint() {
      chk.className = "hbxab-chk" + (state ? " on" : "");
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
    var row = el(doc, "div", "hbxab-row");
    var lbl = el(doc, "span", "lbl", label);
    var right = el(doc, "div");
    right.style.cssText = "display:flex;align-items:center;gap:8px;flex:1;justify-content:flex-end;";
    var input = doc.createElement("input");
    input.type = "range";
    input.className = "hbxab-range";
    input.min = String(min);
    input.max = String(max);
    input.value = String(initial);
    var meta = el(doc, "span", "hbxab-meta", initial + (unit || ""));
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
  function swatchRow(doc, label, colors, activeIndex, onPick) {
    var wrap = el(doc, "div");
    wrap.style.cssText = "display:flex;flex-direction:column;gap:6px;padding:4px 2px;";
    var lbl = el(doc, "div", null, label);
    lbl.style.cssText = "color:var(--theme-text-muted);font-size:10.5px;";
    var row = el(doc, "div", "hbxab-swatches");
    colors.forEach(function(color, idx) {
      var sw = doc.createElement("button");
      sw.type = "button";
      sw.className = "hbxab-swatch" + (idx === activeIndex ? " is-active" : "");
      sw.style.setProperty("background-color", color, "important");
      sw.style.setProperty("background-image", "none", "important");
      sw.title = color;
      sw.onclick = function() {
        Array.prototype.forEach.call(row.children, function(c) {
          c.classList.remove("is-active");
        });
        sw.classList.add("is-active");
        onPick(idx);
      };
      row.appendChild(sw);
    });
    wrap.appendChild(lbl);
    wrap.appendChild(row);
    return wrap;
  }
  function colorRow(doc, label, initial, onChange) {
    var row = el(doc, "div", "hbxab-row");
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
  function buildDiscImageSection(doc, opts) {
    var sec = el(doc, "div", "hbxab-sec");
    function engine() {
      return window[opts.engineName];
    }
    if (!engine()) {
      sec.appendChild(el(doc, "div", "hbxab-hint", opts.notReadyHint));
      return sec;
    }
    var eng = engine();
    var enabledRow = toggleRow(doc, opts.enableLabel, opts.enableHint, eng.isEnabled(), function(val) {
      engine().setEnabled(val);
    });
    sec.appendChild(enabledRow);
    var chipBtns = {}, colorSwatchWrap = null;
    var imageWrap = el(doc, "div");
    imageWrap.style.cssText = "display:flex;flex-direction:column;gap:12px;";
    var box = el(doc, "div", "hbxab-uploadbox");
    var preview = el(doc, "div", "hbxab-preview");
    var textWrap = el(doc, "div");
    textWrap.style.cssText = "flex:1;min-width:0;";
    var titleEl = el(doc, "div", null, opts.imageLabel);
    titleEl.style.cssText = "color:var(--theme-text-primary);font-size:12.5px;font-weight:500;";
    var hintEl = el(doc, "div", "hbxab-hint", opts.imageHint);
    textWrap.appendChild(titleEl);
    textWrap.appendChild(hintEl);
    box.appendChild(preview);
    box.appendChild(textWrap);
    imageWrap.appendChild(box);
    var galleryBtn = null;
    if (opts.ballExtras && window.HaxNewBallGallery) {
      var galleryRow = el(doc, "div", "hbxab-btnrow");
      galleryBtn = el(doc, "button", "hbxab-btn primary", t("Galería"));
      galleryBtn.type = "button";
      galleryBtn.style.cssText = "flex:1;";
      galleryRow.appendChild(galleryBtn);
      imageWrap.appendChild(galleryRow);
    }
    var btnRow = el(doc, "div", "hbxab-btnrow");
    var pickBtn = el(doc, "button", "hbxab-btn" + (galleryBtn ? "" : " primary"), t("Elegir imagen"));
    var adjustBtn = el(doc, "button", "hbxab-btn", t("Ajustar"));
    var clearBtn = el(doc, "button", "hbxab-btn danger", t("Quitar"));
    pickBtn.type = "button";
    adjustBtn.type = "button";
    clearBtn.type = "button";
    btnRow.appendChild(pickBtn);
    btnRow.appendChild(adjustBtn);
    btnRow.appendChild(clearBtn);
    imageWrap.appendChild(btnRow);
    sec.appendChild(imageWrap);
    function refreshBallStyleUI() {}
    function refresh() {
      var e2 = engine();
      var has = e2.hasImage();
      var url = e2.getPreviewUrl();
      preview.style.backgroundImage = has && url ? "url(" + url + ")" : "";
      preview.innerHTML = has ? "" : "?";
      adjustBtn.disabled = !has;
      clearBtn.disabled = !has;
      enabledRow._setState(e2.isEnabled());
      refreshBallStyleUI();
      var b = e2.getBorder();
      if (b) {
        borderEnabledRow._setState(b.enabled);
        widthRowObj.input.value = String(b.width);
        widthRowObj.meta.textContent = String(b.width) + "px";
        if (opts.teamDiff) {
          teamDiffRow._setState(b.teamDiff);
          refreshTeamDim();
        } else if (colorObj) {
          colorObj.input.value = /^#/.test(b.color) ? b.color : "#000000";
        }
        if (inwardRow) inwardRow._setState(!!b.inward);
      }
    }
    pickBtn.onclick = function() {
      engine().pick();
    };
    adjustBtn.onclick = function() {
      engine().adjust();
    };
    clearBtn.onclick = function() {
      engine().clear();
    };
    if (galleryBtn) {
      galleryBtn.onclick = function() {
        window.HaxNewBallGallery.open(doc, function(url) {
          engine().applyPresetImage(url);
          refresh();
        }, {
          currentUrl: engine().getPreviewUrl()
        });
      };
    }
    sec.appendChild(el(doc, "div", "hbxab-divider"));
    sec.appendChild(el(doc, "div", "hbxab-sectitle", t("Borde")));
    var initBorder = eng.getBorder() || {
      enabled: true,
      width: 3,
      teamDiff: false,
      color: "#000000",
      red: 1,
      blue: 1
    };
    var borderEnabledRow = toggleRow(doc, t("Mostrar borde"), null, initBorder.enabled, function(val) {
      engine().setBorderEnabled(val);
    });
    sec.appendChild(borderEnabledRow);
    var widthRowObj = rangeRow(doc, t("Grosor del borde"), 0, 8, initBorder.width, "px", function(v) {
      engine().setBorderWidth(v);
    });
    sec.appendChild(widthRowObj.row);
    var teamDiffRow = null, redSwatch = null, blueSwatch = null, colorObj = null, inwardRow = null;
    function refreshTeamDim() {
      if (!redSwatch || !blueSwatch) return;
      var dim = !engine().getBorder().teamDiff;
      redSwatch.style.opacity = dim ? ".45" : "1";
      blueSwatch.style.opacity = dim ? ".45" : "1";
    }
    if (opts.teamDiff) {
      teamDiffRow = toggleRow(doc, t("Diferenciar color por equipo"), null, initBorder.teamDiff, function(val) {
        engine().setBorderTeamDiff(val);
        refreshTeamDim();
      });
      sec.appendChild(teamDiffRow);
      redSwatch = swatchRow(doc, opts.redName, eng.REDS, initBorder.red, function(idx) {
        engine().setBorderRed(idx);
      });
      sec.appendChild(redSwatch);
      blueSwatch = swatchRow(doc, opts.blueName, eng.BLUES, initBorder.blue, function(idx) {
        engine().setBorderBlue(idx);
      });
      sec.appendChild(blueSwatch);
      refreshTeamDim();
    } else {
      colorObj = colorRow(doc, t("Color del borde"), initBorder.color, function(val) {
        engine().setBorderColor(val);
      });
      sec.appendChild(colorObj.row);
    }
    if (opts.borderInward) {
      inwardRow = toggleRow(doc, t("Borde hacia adentro"), t("El trazo queda todo adentro del disco en vez de mitad afuera."), !!initBorder.inward, function(val) {
        engine().setBorderInward(val);
      });
      sec.appendChild(inwardRow);
    }
    if (opts.avatarExtras) {
      sec.appendChild(el(doc, "div", "hbxab-divider"));
      sec.appendChild(el(doc, "div", "hbxab-sectitle", t("Brillo del avatar")));
      var initAvatarShine = eng.getShine ? eng.getShine() : {
        enabled: false,
        color: "#ffffff",
        opacity: .6,
        size: 55
      };
      var avShineEnabledRow = toggleRow(doc, t("Activar brillo"), null, initAvatarShine.enabled, function(val) {
        engine().setShineEnabled(val);
      });
      sec.appendChild(avShineEnabledRow);
      var avShineSwatch = swatchRow(doc, t("Color del brillo"), PALETTE, Math.max(0, PALETTE.indexOf(initAvatarShine.color)), function(idx) {
        engine().setShineColor(PALETTE[idx]);
        avShineCustomColor.value = PALETTE[idx];
      });
      sec.appendChild(avShineSwatch);
      var avShineCustomRow = el(doc, "div", "hbxab-row");
      avShineCustomRow.appendChild(el(doc, "span", "lbl", t("Color personalizado")));
      var avShineCustomColor = doc.createElement("input");
      avShineCustomColor.type = "color";
      avShineCustomColor.value = /^#/.test(initAvatarShine.color) ? initAvatarShine.color : "#ffffff";
      avShineCustomColor.style.cssText = "width:34px;height:26px;padding:0;border:1px solid var(--theme-border);border-radius:5px;background:none;cursor:pointer;";
      avShineCustomColor.oninput = function() {
        engine().setShineColor(avShineCustomColor.value);
      };
      avShineCustomRow.appendChild(avShineCustomColor);
      sec.appendChild(avShineCustomRow);
      var avShineOpacityObj = rangeRow(doc, t("Opacidad"), 10, 100, Math.round(initAvatarShine.opacity * 100), "%", function(v) {
        engine().setShineOpacity(v / 100);
      });
      sec.appendChild(avShineOpacityObj.row);
      var avShineSizeObj = rangeRow(doc, t("Tamaño"), 0, 100, initAvatarShine.size, "%", function(v) {
        engine().setShineSize(v);
      });
      sec.appendChild(avShineSizeObj.row);
      sec.appendChild(el(doc, "div", "hbxab-divider"));
      sec.appendChild(el(doc, "div", "hbxab-sectitle", t("Estela del avatar")));
      var initAvatarTrail = eng.getTrail ? eng.getTrail() : {
        enabled: false,
        color: "#ffffff",
        thickness: 8,
        length: 50,
        opacity: 1
      };
      var avTrailEnabledRow = toggleRow(doc, t("Activar estela"), null, initAvatarTrail.enabled, function(val) {
        engine().setTrailEnabled(val);
      });
      sec.appendChild(avTrailEnabledRow);
      var avTrailSwatch = swatchRow(doc, t("Color de la estela"), PALETTE, Math.max(0, PALETTE.indexOf(initAvatarTrail.color)), function(idx) {
        engine().setTrailColor(PALETTE[idx]);
        avTrailCustomColor.value = PALETTE[idx];
      });
      sec.appendChild(avTrailSwatch);
      var avTrailCustomRow = el(doc, "div", "hbxab-row");
      avTrailCustomRow.appendChild(el(doc, "span", "lbl", t("Color personalizado")));
      var avTrailCustomColor = doc.createElement("input");
      avTrailCustomColor.type = "color";
      avTrailCustomColor.value = /^#/.test(initAvatarTrail.color) ? initAvatarTrail.color : "#ffffff";
      avTrailCustomColor.style.cssText = "width:34px;height:26px;padding:0;border:1px solid var(--theme-border);border-radius:5px;background:none;cursor:pointer;";
      avTrailCustomColor.oninput = function() {
        engine().setTrailColor(avTrailCustomColor.value);
      };
      avTrailCustomRow.appendChild(avTrailCustomColor);
      sec.appendChild(avTrailCustomRow);
      var avTrailOpacityObj = rangeRow(doc, t("Opacidad"), 10, 100, Math.round(initAvatarTrail.opacity * 100), "%", function(v) {
        engine().setTrailOpacity(v / 100);
      });
      sec.appendChild(avTrailOpacityObj.row);
      var avTrailThicknessObj = rangeRow(doc, t("Grosor"), 2, 30, initAvatarTrail.thickness, "px", function(v) {
        engine().setTrailThickness(v);
      });
      sec.appendChild(avTrailThicknessObj.row);
      var avTrailLengthObj = rangeRow(doc, t("Largo"), 4, 60, initAvatarTrail.length, "", function(v) {
        engine().setTrailLength(v);
      });
      sec.appendChild(avTrailLengthObj.row);
    }
    if (opts.ballExtras) {
      sec.appendChild(el(doc, "div", "hbxab-divider"));
      sec.appendChild(el(doc, "div", "hbxab-sectitle", t("Estela de la pelota")));
      var initTrail = eng.getTrail ? eng.getTrail() : {
        enabled: false,
        color: "#ffffff",
        thickness: 8,
        length: 50,
        opacity: 1
      };
      var trailEnabledRow = toggleRow(doc, t("Activar estela"), null, initTrail.enabled, function(val) {
        engine().setTrailEnabled(val);
      });
      sec.appendChild(trailEnabledRow);
      var trailSwatch = swatchRow(doc, t("Color de la estela"), PALETTE, Math.max(0, PALETTE.indexOf(initTrail.color)), function(idx) {
        engine().setTrailColor(PALETTE[idx]);
        trailCustomColor.value = PALETTE[idx];
      });
      sec.appendChild(trailSwatch);
      var trailCustomRow = el(doc, "div", "hbxab-row");
      trailCustomRow.appendChild(el(doc, "span", "lbl", t("Color personalizado")));
      var trailCustomColor = doc.createElement("input");
      trailCustomColor.type = "color";
      trailCustomColor.value = /^#/.test(initTrail.color) ? initTrail.color : "#ffffff";
      trailCustomColor.style.cssText = "width:34px;height:26px;padding:0;border:1px solid var(--theme-border);border-radius:5px;background:none;cursor:pointer;";
      trailCustomColor.oninput = function() {
        engine().setTrailColor(trailCustomColor.value);
      };
      trailCustomRow.appendChild(trailCustomColor);
      sec.appendChild(trailCustomRow);
      var trailOpacityObj = rangeRow(doc, t("Opacidad"), 10, 100, Math.round(initTrail.opacity * 100), "%", function(v) {
        engine().setTrailOpacity(v / 100);
      });
      sec.appendChild(trailOpacityObj.row);
      var trailThicknessObj = rangeRow(doc, t("Grosor"), 2, 30, initTrail.thickness, "px", function(v) {
        engine().setTrailThickness(v);
      });
      sec.appendChild(trailThicknessObj.row);
      var trailLengthObj = rangeRow(doc, t("Largo"), 4, 60, initTrail.length, "", function(v) {
        engine().setTrailLength(v);
      });
      sec.appendChild(trailLengthObj.row);
      sec.appendChild(el(doc, "div", "hbxab-divider"));
      sec.appendChild(el(doc, "div", "hbxab-sectitle", t("Brillo de la pelota")));
      var initShine = eng.getShine ? eng.getShine() : {
        enabled: false,
        color: "#ffffff",
        opacity: .6,
        size: 40
      };
      var shineEnabledRow = toggleRow(doc, t("Activar brillo"), null, initShine.enabled, function(val) {
        engine().setShineEnabled(val);
      });
      sec.appendChild(shineEnabledRow);
      var shineSwatch = swatchRow(doc, t("Color del brillo"), PALETTE, Math.max(0, PALETTE.indexOf(initShine.color)), function(idx) {
        engine().setShineColor(PALETTE[idx]);
        shineCustomColor.value = PALETTE[idx];
      });
      sec.appendChild(shineSwatch);
      var shineCustomRow = el(doc, "div", "hbxab-row");
      shineCustomRow.appendChild(el(doc, "span", "lbl", t("Color personalizado")));
      var shineCustomColor = doc.createElement("input");
      shineCustomColor.type = "color";
      shineCustomColor.value = /^#/.test(initShine.color) ? initShine.color : "#ffffff";
      shineCustomColor.style.cssText = "width:34px;height:26px;padding:0;border:1px solid var(--theme-border);border-radius:5px;background:none;cursor:pointer;";
      shineCustomColor.oninput = function() {
        engine().setShineColor(shineCustomColor.value);
      };
      shineCustomRow.appendChild(shineCustomColor);
      sec.appendChild(shineCustomRow);
      var shineOpacityObj = rangeRow(doc, t("Opacidad"), 10, 100, Math.round(initShine.opacity * 100), "%", function(v) {
        engine().setShineOpacity(v / 100);
      });
      sec.appendChild(shineOpacityObj.row);
      var shineSizeObj = rangeRow(doc, t("Tamaño"), 0, 100, initShine.size, "%", function(v) {
        engine().setShineSize(v);
      });
      sec.appendChild(shineSizeObj.row);
    }
    refresh();
    window.addEventListener(opts.changeEvent, refresh);
    return sec;
  }
  function buildAvatarSection(doc) {
    return buildDiscImageSection(doc, {
      engineName: "HaxNewAvatarImage",
      changeEvent: "HaxNew:avatarimg",
      enableLabel: t("Activar avatar con imagen"),
      enableHint: t("Reemplaza tu disco por tu imagen mientras jugás."),
      imageLabel: t("Imagen de mi avatar"),
      imageHint: t("JPG, PNG, WEBP o GIF, con zoom y recorte."),
      notReadyHint: t("HaxNewAvatarImage no está disponible todavía. Abrí el panel de nuevo cuando el juego termine de cargar."),
      teamDiff: true,
      redName: t("Borde equipo rojo"),
      blueName: t("Borde equipo azul"),
      borderInward: true,
      avatarExtras: true
    });
  }
  function buildBallSection(doc) {
    return buildDiscImageSection(doc, {
      engineName: "HaxNewBallSkin",
      changeEvent: "HaxNew:ballskin",
      enableLabel: t("Activar skin de pelota"),
      enableHint: t("Reemplaza la textura de la pelota por tu imagen o estilo elegido."),
      imageLabel: t("Imagen de la pelota"),
      imageHint: t("PNG/JPG/GIF, con zoom y recorte."),
      notReadyHint: t("HaxNewBallSkin no está disponible todavía. Abrí el panel de nuevo cuando el juego termine de cargar."),
      teamDiff: false,
      ballExtras: true
    });
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
    var overlay = el(doc, "div", "hbxab-overlay");
    var card = el(doc, "div", "hbxab-card");
    var head = el(doc, "div", "hbxab-head");
    var titleWrap = el(doc, "div", "hbxab-title", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/></svg><span>' + t("Ball & Avatar") + "</span>");
    var closeBtn = el(doc, "button", "hbxab-close", '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>');
    closeBtn.type = "button";
    closeBtn.onclick = closePanel;
    head.appendChild(titleWrap);
    head.appendChild(closeBtn);
    var tabs = el(doc, "div", "hbxab-tabs");
    var avatarTabBtn = el(doc, "button", "hbxab-tabbtn is-active", t("Avatar"));
    var ballTabBtn = el(doc, "button", "hbxab-tabbtn", t("Pelota"));
    avatarTabBtn.type = "button";
    ballTabBtn.type = "button";
    tabs.appendChild(avatarTabBtn);
    tabs.appendChild(ballTabBtn);
    var body = el(doc, "div", "hbxab-body");
    var avatarSec = buildAvatarSection(doc);
    var ballSec = buildBallSection(doc);
    avatarSec.classList.add("is-active");
    body.appendChild(avatarSec);
    body.appendChild(ballSec);
    avatarTabBtn.onclick = function() {
      avatarTabBtn.classList.add("is-active");
      ballTabBtn.classList.remove("is-active");
      avatarSec.classList.add("is-active");
      ballSec.classList.remove("is-active");
    };
    ballTabBtn.onclick = function() {
      ballTabBtn.classList.add("is-active");
      avatarTabBtn.classList.remove("is-active");
      ballSec.classList.add("is-active");
      avatarSec.classList.remove("is-active");
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
  window.HbxAvatarBall = {
    openPanel: function(doc) {
      openPanel(doc || document);
    },
    closePanel: closePanel
  };
})();