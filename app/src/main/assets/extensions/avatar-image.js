(function() {
  "use strict";
  if (window.__HaxNewAvatarImage) return;
  window.__HaxNewAvatarImage = true;
  var SKIN_KEY = "HaxNew_avatar_skin";
  var SKIN_ENABLED_KEY = "HaxNew_avatar_skin_enabled";
  var BORDER_ENABLED_KEY = "HaxNew_avatar_border_enabled";
  var BORDER_WIDTH_KEY = "HaxNew_avatar_border_width";
  var BORDER_TEAM_DIFF_KEY = "HaxNew_avatar_border_team_diff";
  var BORDER_COLOR_KEY = "HaxNew_avatar_border_color";
  var BORDER_RED_KEY = "HaxNew_avatar_border_red";
  var BORDER_BLUE_KEY = "HaxNew_avatar_border_blue";
  var BORDER_INWARD_KEY = "HaxNew_avatar_border_inward";
  var SHINE_ENABLED_KEY = "HaxNew_avatar_shine_enabled";
  var SHINE_COLOR_KEY = "HaxNew_avatar_shine_color";
  var SHINE_OPACITY_KEY = "HaxNew_avatar_shine_opacity";
  var SHINE_SIZE_KEY = "HaxNew_avatar_shine_size";
  var TRAIL_ENABLED_KEY = "HaxNew_avatar_trail_enabled";
  var TRAIL_COLOR_KEY = "HaxNew_avatar_trail_color";
  var TRAIL_THICKNESS_KEY = "HaxNew_avatar_trail_thickness";
  var TRAIL_LENGTH_KEY = "HaxNew_avatar_trail_length";
  var TRAIL_OPACITY_KEY = "HaxNew_avatar_trail_opacity";
  var TRAIL_MAX_CAP = 60;
  var TWO_PI = Math.PI * 2;
  var MIN_R = 4;
  var MAX_R = 60;
  var MAX_IMG_BYTES = 5e5;
  var MAX_GIF_BYTES = 12e5;
  var GIF_SHRINK_LADDER = [ {
    maxDim: 480,
    maxColors: 256,
    maxFrames: 60
  }, {
    maxDim: 420,
    maxColors: 200,
    maxFrames: 50
  }, {
    maxDim: 360,
    maxColors: 160,
    maxFrames: 42
  }, {
    maxDim: 300,
    maxColors: 128,
    maxFrames: 36
  }, {
    maxDim: 260,
    maxColors: 96,
    maxFrames: 30
  }, {
    maxDim: 220,
    maxColors: 64,
    maxFrames: 24
  }, {
    maxDim: 180,
    maxColors: 48,
    maxFrames: 18
  }, {
    maxDim: 140,
    maxColors: 32,
    maxFrames: 14
  } ];
  var POS_EPS = 2;
  var RADIUS_EPS = 1;
  var RED_SHADES = [ "#e56f57", "#cf3c47", "#ff0000" ];
  var BLUE_SHADES = [ "#4099ff", "#0076ff", "#0026ff" ];
  var skinCfg = null;
  var skinEnabled = false;
  var borderEnabled = true;
  var borderWidth = 3;
  var borderTeamDiff = true;
  var borderColor = "#cf3c47";
  var borderRedIdx = 1;
  var borderBlueIdx = 1;
  var borderInward = false;
  var avatarShineEnabled = false;
  var avatarShineColor = "#ffffff";
  var avatarShineColorRgb = "255,255,255";
  var avatarShineOpacity = .6;
  var avatarShineSize = 55;
  var avatarTrailEnabled = false;
  var avatarTrailColor = "#ffffff";
  var avatarTrailThickness = 8;
  var avatarTrailLength = 50;
  var avatarTrailOpacity = 1;
  var avatarTrailBuf = [];
  var avatarTrailLastPushed = null;
  var avatarTrailLastRawPos = null;
  var avatarTrailIdleStartTs = null;
  var avatarTrailIdleStartLen = null;
  var AVATAR_TRAIL_IDLE_DECAY_MS = 260;
  var AVATAR_TRAIL_STILL_EPS = .05;
  var AVATAR_TRAIL_MIN_STEP = 1.5;
  function parseSkinRaw(data) {
    if (!data) return null;
    try {
      var parsed = JSON.parse(data);
      if (parsed && typeof parsed === "object" && parsed.image) {
        return {
          raw: parsed.image,
          zoom: Math.max(1, Math.min(4, Number(parsed.imageZoom) || 1)),
          offsetX: parsed.imageOffsetX != null ? Math.max(0, Math.min(1, Number(parsed.imageOffsetX))) : .5,
          offsetY: parsed.imageOffsetY != null ? Math.max(0, Math.min(1, Number(parsed.imageOffsetY))) : .5
        };
      }
      console.error('[HaxNew][avatar-image] JSON parseado pero sin campo "image" válido:', parsed);
    } catch (eJson) {
      console.error("[HaxNew][avatar-image] localStorage tiene datos que no son JSON válido:", eJson, data && data.slice ? data.slice(0, 60) : data);
    }
    if (typeof data === "string" && data.indexOf("data:image") === 0) {
      return {
        raw: data,
        zoom: 1,
        offsetX: .5,
        offsetY: .5
      };
    }
    return null;
  }
  var offscreenImgEl = null;
  function ensureOffscreenImg() {
    if (offscreenImgEl) return offscreenImgEl;
    var host = document.createElement("div");
    host.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;pointer-events:none;";
    var el = document.createElement("img");
    el.alt = "";
    host.appendChild(el);
    (document.body || document.documentElement).appendChild(host);
    offscreenImgEl = el;
    return el;
  }
  function buildGifFrames(dataUrl) {
    try {
      if (!window.GifLite) {
        console.warn("[HaxNew][avatar-image] GifLite no disponible, no se puede animar el GIF a mano.");
        return null;
      }
      var bytes = window.GifLite.dataUrlToBytes(dataUrl);
      var gif = window.GifLite.decodeGif(bytes);
      if (!gif.frames.length) return null;
      var composited = window.GifLite.compositeFrames(gif);
      if (composited.frames.length <= 1) return null;
      var frames = composited.frames.map(function(f) {
        var canvas = document.createElement("canvas");
        canvas.width = composited.width;
        canvas.height = composited.height;
        var cctx = canvas.getContext("2d");
        var imgData = cctx.createImageData(composited.width, composited.height);
        imgData.data.set(f.rgba);
        cctx.putImageData(imgData, 0, 0);
        return {
          canvas: canvas,
          delay: Math.max(20, f.delay || 100)
        };
      });
      var total = 0;
      for (var i = 0; i < frames.length; i++) total += frames[i].delay;
      return {
        frames: frames,
        totalDuration: total,
        width: composited.width,
        height: composited.height
      };
    } catch (e) {
      console.error("[HaxNew][avatar-image] no se pudo decodificar el GIF para animarlo a mano:", e);
      return null;
    }
  }
  function currentGifFrame(anim, startTime) {
    var elapsed = (performance.now() - startTime) % anim.totalDuration;
    var acc = 0;
    for (var i = 0; i < anim.frames.length; i++) {
      acc += anim.frames[i].delay;
      if (elapsed < acc) return anim.frames[i];
    }
    return anim.frames[anim.frames.length - 1];
  }
  function logStorageUsage() {
    try {
      var total = 0, items = [];
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        var v = localStorage.getItem(k) || "";
        items.push([ k, v.length ]);
        total += v.length;
      }
      items.sort(function(a, b) {
        return b[1] - a[1];
      });
      console.warn("[HaxNew][avatar-image] uso total de localStorage (chars) ~", total, "— top claves:", items.slice(0, 6));
    } catch (e) {}
  }
  function loadSkin() {
    var data = null;
    try {
      data = localStorage.getItem(SKIN_KEY);
    } catch (e) {}
    var cfg = parseSkinRaw(data);
    if (!cfg) {
      skinCfg = null;
      return;
    }
    if (skinCfg && skinCfg.raw === cfg.raw && skinCfg.img) {
      skinCfg.zoom = cfg.zoom;
      skinCfg.offsetX = cfg.offsetX;
      skinCfg.offsetY = cfg.offsetY;
      return;
    }
    var img = ensureOffscreenImg();
    var next = {
      raw: cfg.raw,
      zoom: cfg.zoom,
      offsetX: cfg.offsetX,
      offsetY: cfg.offsetY,
      img: null,
      gifAnim: null,
      gifStart: 0
    };
    img.onload = function() {
      next.img = img;
      console.log("[HaxNew][avatar-image] imagen cargada ok", img.naturalWidth + "x" + img.naturalHeight);
      if (cfg.raw.indexOf("data:image/gif") === 0) {
        var triesLeft = 20;
        var tryBuildAnim = function() {
          if (!window.GifLite && triesLeft > 0) {
            triesLeft--;
            setTimeout(tryBuildAnim, 300);
            return;
          }
          var anim = buildGifFrames(cfg.raw);
          if (anim) {
            next.gifAnim = anim;
            next.gifStart = performance.now();
            console.log("[HaxNew][avatar-image] GIF animado a mano:", anim.frames.length, "frames,", anim.totalDuration, "ms de vuelta");
          } else {
            console.log("[HaxNew][avatar-image] GIF de 1 solo frame (o no se pudo decodificar): se muestra fijo.");
          }
        };
        tryBuildAnim();
      }
    };
    img.onerror = function(ev) {
      next.img = null;
      console.error("[HaxNew][avatar-image] la imagen guardada no pudo cargar (Image.onerror)", ev);
    };
    img.src = cfg.raw;
    skinCfg = next;
  }
  function persistSkin(cfg, opts) {
    opts = opts || {};
    var result = {
      ok: true,
      quotaExceeded: false,
      error: null
    };
    try {
      if (!cfg || !cfg.image) {
        localStorage.removeItem(SKIN_KEY);
      } else {
        try {
          localStorage.removeItem(SKIN_KEY);
        } catch (eRm) {}
        var json = JSON.stringify(cfg);
        console.log("[HaxNew][avatar-image] guardando skin, bytes=", json.length);
        localStorage.setItem(SKIN_KEY, json);
      }
    } catch (e) {
      result.ok = false;
      result.error = e;
      result.quotaExceeded = !!(e && (e.name === "QuotaExceededError" || e.code === 22 || e.code === 1014));
      console.error("[HaxNew][avatar-image] FALLÓ el guardado en localStorage:", e);
      if (result.quotaExceeded) logStorageUsage();
      if (!opts.silent) {
        try {
          window.alert("No se pudo guardar la imagen del avatar (" + (e && e.name || "error") + "). Probablemente la imagen/GIF pesa demasiado para localStorage. Probá con una imagen más chica.");
        } catch (e2) {}
      }
    }
    loadSkin();
    if (result.ok && (!skinCfg || !skinCfg.raw)) {
      console.error("[HaxNew][avatar-image] setItem no tiró error pero loadSkin() no recuperó el skin. Revisar parseSkinRaw.");
    }
    return result;
  }
  function loadSkinEnabled() {
    try {
      skinEnabled = localStorage.getItem(SKIN_ENABLED_KEY) === "1" || localStorage.getItem(SKIN_ENABLED_KEY) === "true";
    } catch (e) {
      skinEnabled = false;
    }
  }
  function setSkinEnabled(v) {
    skinEnabled = !!v;
    try {
      localStorage.setItem(SKIN_ENABLED_KEY, skinEnabled ? "1" : "0");
    } catch (e) {}
  }
  function loadBorder() {
    try {
      var v = localStorage.getItem(BORDER_ENABLED_KEY);
      borderEnabled = v === null ? true : v === "1" || v === "true";
    } catch (e) {
      borderEnabled = true;
    }
    try {
      var w = parseFloat(localStorage.getItem(BORDER_WIDTH_KEY));
      borderWidth = isNaN(w) ? 3 : Math.max(0, Math.min(8, w));
    } catch (e2) {
      borderWidth = 3;
    }
    try {
      var td = localStorage.getItem(BORDER_TEAM_DIFF_KEY);
      borderTeamDiff = td === null ? true : td === "1" || td === "true";
    } catch (e3) {
      borderTeamDiff = true;
    }
    try {
      borderColor = localStorage.getItem(BORDER_COLOR_KEY) || "#cf3c47";
    } catch (e4) {
      borderColor = "#cf3c47";
    }
    try {
      var ri = parseInt(localStorage.getItem(BORDER_RED_KEY), 10);
      borderRedIdx = isNaN(ri) ? 1 : Math.max(0, Math.min(2, ri));
    } catch (e5) {
      borderRedIdx = 1;
    }
    try {
      var bi = parseInt(localStorage.getItem(BORDER_BLUE_KEY), 10);
      borderBlueIdx = isNaN(bi) ? 1 : Math.max(0, Math.min(2, bi));
    } catch (e6) {
      borderBlueIdx = 1;
    }
    try {
      var iw = localStorage.getItem(BORDER_INWARD_KEY);
      borderInward = iw === "1" || iw === "true";
    } catch (e7) {
      borderInward = false;
    }
  }
  function saveBorder() {
    try {
      localStorage.setItem(BORDER_ENABLED_KEY, borderEnabled ? "1" : "0");
      localStorage.setItem(BORDER_WIDTH_KEY, String(borderWidth));
      localStorage.setItem(BORDER_TEAM_DIFF_KEY, borderTeamDiff ? "1" : "0");
      localStorage.setItem(BORDER_COLOR_KEY, borderColor);
      localStorage.setItem(BORDER_RED_KEY, String(borderRedIdx));
      localStorage.setItem(BORDER_BLUE_KEY, String(borderBlueIdx));
      localStorage.setItem(BORDER_INWARD_KEY, borderInward ? "1" : "0");
    } catch (e) {}
  }
  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    if (!m) return "255,255,255";
    return parseInt(m[1], 16) + "," + parseInt(m[2], 16) + "," + parseInt(m[3], 16);
  }
  function loadAvatarShine() {
    try {
      avatarShineEnabled = localStorage.getItem(SHINE_ENABLED_KEY) === "1" || localStorage.getItem(SHINE_ENABLED_KEY) === "true";
    } catch (e) {
      avatarShineEnabled = false;
    }
    try {
      avatarShineColor = localStorage.getItem(SHINE_COLOR_KEY) || "#ffffff";
    } catch (e2) {
      avatarShineColor = "#ffffff";
    }
    avatarShineColorRgb = hexToRgb(avatarShineColor);
    try {
      var op = parseFloat(localStorage.getItem(SHINE_OPACITY_KEY));
      avatarShineOpacity = isNaN(op) ? .6 : Math.max(.1, Math.min(1, op));
    } catch (e3) {
      avatarShineOpacity = .6;
    }
    try {
      var sz = parseFloat(localStorage.getItem(SHINE_SIZE_KEY));
      avatarShineSize = isNaN(sz) ? 55 : Math.max(0, Math.min(100, sz));
    } catch (e4) {
      avatarShineSize = 55;
    }
  }
  function saveAvatarShine() {
    try {
      localStorage.setItem(SHINE_ENABLED_KEY, avatarShineEnabled ? "1" : "0");
      localStorage.setItem(SHINE_COLOR_KEY, avatarShineColor);
      localStorage.setItem(SHINE_OPACITY_KEY, String(avatarShineOpacity));
      localStorage.setItem(SHINE_SIZE_KEY, String(avatarShineSize));
    } catch (e) {}
  }
  function loadAvatarTrail() {
    try {
      avatarTrailEnabled = localStorage.getItem(TRAIL_ENABLED_KEY) === "1" || localStorage.getItem(TRAIL_ENABLED_KEY) === "true";
    } catch (e) {
      avatarTrailEnabled = false;
    }
    try {
      avatarTrailColor = localStorage.getItem(TRAIL_COLOR_KEY) || "#ffffff";
    } catch (e2) {
      avatarTrailColor = "#ffffff";
    }
    try {
      var th = parseFloat(localStorage.getItem(TRAIL_THICKNESS_KEY));
      avatarTrailThickness = isNaN(th) ? 8 : Math.max(2, Math.min(30, th));
    } catch (e3) {
      avatarTrailThickness = 8;
    }
    try {
      var ln = parseInt(localStorage.getItem(TRAIL_LENGTH_KEY), 10);
      avatarTrailLength = isNaN(ln) ? 50 : Math.max(4, Math.min(TRAIL_MAX_CAP, ln));
    } catch (e4) {
      avatarTrailLength = 50;
    }
    try {
      var op = parseFloat(localStorage.getItem(TRAIL_OPACITY_KEY));
      avatarTrailOpacity = isNaN(op) ? 1 : Math.max(.1, Math.min(1, op));
    } catch (e5) {
      avatarTrailOpacity = 1;
    }
  }
  function saveAvatarTrail() {
    try {
      localStorage.setItem(TRAIL_ENABLED_KEY, avatarTrailEnabled ? "1" : "0");
      localStorage.setItem(TRAIL_COLOR_KEY, avatarTrailColor);
      localStorage.setItem(TRAIL_THICKNESS_KEY, String(avatarTrailThickness));
      localStorage.setItem(TRAIL_LENGTH_KEY, String(avatarTrailLength));
      localStorage.setItem(TRAIL_OPACITY_KEY, String(avatarTrailOpacity));
    } catch (e) {}
  }
  function avatarTrailUpdate(x, y) {
    var isStill = false;
    if (avatarTrailLastRawPos) {
      var rdx = x - avatarTrailLastRawPos.x, rdy = y - avatarTrailLastRawPos.y;
      isStill = Math.sqrt(rdx * rdx + rdy * rdy) < AVATAR_TRAIL_STILL_EPS;
    }
    avatarTrailLastRawPos = {
      x: x,
      y: y
    };
    if (!isStill) {
      avatarTrailIdleStartTs = null;
      avatarTrailIdleStartLen = null;
      var moved = true;
      if (avatarTrailLastPushed) {
        var ddx = x - avatarTrailLastPushed.x, ddy = y - avatarTrailLastPushed.y;
        moved = Math.sqrt(ddx * ddx + ddy * ddy) >= AVATAR_TRAIL_MIN_STEP;
      }
      if (moved) {
        avatarTrailLastPushed = {
          x: x,
          y: y
        };
        avatarTrailBuf.push({
          x: x,
          y: y
        });
        if (avatarTrailBuf.length > TRAIL_MAX_CAP) avatarTrailBuf.shift();
      }
      return;
    }
    if (avatarTrailBuf.length === 0) return;
    var now = window.performance.now();
    if (avatarTrailIdleStartTs === null) {
      avatarTrailIdleStartTs = now;
      avatarTrailIdleStartLen = avatarTrailBuf.length;
    }
    var ratio = Math.min(1, (now - avatarTrailIdleStartTs) / AVATAR_TRAIL_IDLE_DECAY_MS);
    var targetLen = Math.round(avatarTrailIdleStartLen * (1 - ratio));
    while (avatarTrailBuf.length > targetLen) avatarTrailBuf.shift();
    if (avatarTrailBuf.length === 0) avatarTrailLastPushed = null;
  }
  function avatarTrailDraw(ctx) {
    if (window.__starAvatarBallDebug) {
      var _nowDbg = window.performance.now();
      if (!window.__starDbgAvTrailLast || _nowDbg - window.__starDbgAvTrailLast > 1000) {
        window.__starDbgAvTrailLast = _nowDbg;
        console.log("[HaxNew][debug] avatarTrailDraw: enabled=", avatarTrailEnabled, "bufLen=", avatarTrailBuf.length, "color=", avatarTrailColor, "thickness=", avatarTrailThickness, "length=", avatarTrailLength, "opacity=", avatarTrailOpacity);
      }
    }
    if (!avatarTrailEnabled || avatarTrailBuf.length < 2) return;
    var len = Math.max(2, Math.min(avatarTrailLength, avatarTrailBuf.length));
    var pts = avatarTrailBuf.slice(avatarTrailBuf.length - len);
    var dxTotal = pts[pts.length - 1].x - pts[0].x;
    var dyTotal = pts[pts.length - 1].y - pts[0].y;
    if (Math.abs(dxTotal) < .5 && Math.abs(dyTotal) < .5) {
      if (window.__starAvatarBallDebug) console.log("[HaxNew][debug] avatarTrailDraw: se corta por movimiento chico, dxTotal=", dxTotal, "dyTotal=", dyTotal);
      return;
    }
    var rgb = hexToRgb(avatarTrailColor).split(",");
    var opac = avatarTrailOpacity;
    var thickness = avatarTrailThickness;
    var left = [], right = [];
    var n = pts.length;
    for (var i = 0; i < n; i++) {
      var p = pts[i];
      var prev = pts[i - 1] || p;
      var next = pts[i + 1] || p;
      var dx = next.x - prev.x, dy = next.y - prev.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / dist, ny = dx / dist;
      var w = thickness * (i / (n - 1)) * .5;
      left.push({
        x: p.x + nx * w,
        y: p.y + ny * w
      });
      right.push({
        x: p.x - nx * w,
        y: p.y - ny * w
      });
    }
    var tail = pts[0], head = pts[n - 1];
    drawingInternally = true;
    try {
      var grad = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
      grad.addColorStop(0, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",0)");
      grad.addColorStop(1, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + "," + .85 * opac + ")");
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(left[0].x, left[0].y);
      for (var j = 1; j < left.length; j++) ctx.lineTo(left[j].x, left[j].y);
      for (var k = right.length - 1; k >= 0; k--) ctx.lineTo(right[k].x, right[k].y);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
      if (window.__starAvatarBallDebug) console.log("[HaxNew][debug] avatarTrailDraw: fill ejecutado, tail=", tail, "head=", head, "ptsUsados=", n);
    } finally {
      drawingInternally = false;
    }
  }
  function activeAvatarCfg() {
    return skinEnabled && skinCfg && skinCfg.img ? skinCfg : null;
  }
  // Genera el thumbnail del panel de Personalizar aplicando el mismo
  // zoom/offset que se usa al dibujar el avatar en la cancha (drawIfMine),
  // para que la vista previa coincida con lo que realmente se ve en juego.
  function croppedPreviewDataUrl(cfg, size) {
    size = size || 96;
    if (!cfg || !cfg.img) return null;
    var iw = cfg.img.naturalWidth || cfg.img.width || 0;
    var ih = cfg.img.naturalHeight || cfg.img.height || 0;
    if (!iw || !ih) return null;
    try {
      var canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      var ctx = canvas.getContext("2d");
      var baseScale = Math.max(size / iw, size / ih);
      var scale = baseScale * (cfg.zoom || 1);
      var dw = iw * scale, dh = ih * scale;
      var offX = cfg.offsetX != null ? cfg.offsetX : .5;
      var offY = cfg.offsetY != null ? cfg.offsetY : .5;
      var dx = -offX * (dw - size);
      var dy = -offY * (dh - size);
      ctx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
      ctx.drawImage(cfg.img, dx, dy, dw, dh);
      return canvas.toDataURL();
    } catch (e) {
      console.error("[HaxNew][avatar-image] no se pudo generar el preview recortado:", e);
      return null;
    }
  }
  function currentBorderColor(team) {
    if (!borderTeamDiff) return borderColor;
    if (team === 1) return RED_SHADES[borderRedIdx] || RED_SHADES[1];
    if (team === 2) return BLUE_SHADES[borderBlueIdx] || BLUE_SHADES[1];
    return borderColor;
  }
  function drawBorder(ctx, x, y, r, team) {
    if (!borderEnabled || !(borderWidth > 0)) return;
    drawingInternally = true;
    try {
      var lw = Math.max(.8, r * borderWidth * .02);
      var strokeR = borderInward ? Math.max(0, r - lw / 2) : r;
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, strokeR, 0, TWO_PI, false);
      ctx.strokeStyle = currentBorderColor(team);
      ctx.lineWidth = lw;
      ctx.stroke();
      ctx.restore();
    } finally {
      drawingInternally = false;
    }
  }
  function avatarShineDraw(ctx, x, y, r) {
    if (!avatarShineEnabled) return;
    drawingInternally = true;
    try {
      var mult = 1.3 + avatarShineSize / 100 * 1.2;
      var outerR = r * mult;
      ctx.save();
      var grad = ctx.createRadialGradient(x, y, r * .35, x, y, outerR);
      grad.addColorStop(0, "rgba(" + avatarShineColorRgb + "," + .6 * avatarShineOpacity + ")");
      grad.addColorStop(1, "rgba(" + avatarShineColorRgb + ",0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, outerR, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    } finally {
      drawingInternally = false;
    }
  }
  // ---------------------------------------------------------------------
  // Borde por equipo para avatares remotos: SIEMPRE activo, con una
  // configuración fija (no es el borde tuyo, así que no usa borderEnabled
  // / borderWidth / borderTeamDiff / borderInward de tu propia cuenta —
  // esos solo aplican a TU avatar). Se usan los mismos colores por
  // defecto de la app (RED_SHADES[1] / BLUE_SHADES[1]), 8px de grosor y
  // "hacia adentro", que es la config que ya probamos y quedó bien.
  // Nadie (ni vos ni el jugador remoto) puede apagar esto ni cambiarlo.
  // ---------------------------------------------------------------------
  var REMOTE_BORDER_WIDTH = 8;
  var REMOTE_BORDER_INWARD = true;
  var REMOTE_BORDER_RED = RED_SHADES[1];
  var REMOTE_BORDER_BLUE = BLUE_SHADES[1];
  var REMOTE_BORDER_FALLBACK = "#ffffff"; // por si por algún motivo no hay equipo (espectador, etc.)

  function remoteBorderColor(team) {
    if (team === 1) return REMOTE_BORDER_RED;
    if (team === 2) return REMOTE_BORDER_BLUE;
    return REMOTE_BORDER_FALLBACK;
  }

  function drawRemoteBorder(ctx, x, y, r, team) {
    var lw = Math.max(.8, r * REMOTE_BORDER_WIDTH * .02);
    var strokeR = REMOTE_BORDER_INWARD ? Math.max(0, r - lw / 2) : r;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, strokeR, 0, TWO_PI, false);
    ctx.strokeStyle = remoteBorderColor(team);
    ctx.lineWidth = lw;
    ctx.stroke();
    ctx.restore();
  }

  // ---------------------------------------------------------------------
  // Avatar de OTRO jugador (avatar-cosmetics-presence.js). Ya nos llega
  // pre-recortado a un cuadrado de 64x64 (ver getShareableSnapshot más
  // abajo), así que alcanza con dibujarlo en modo "cover" sin zoom ni
  // offset propios — esos ajustes son de la persona que lo subió, no
  // hace falta reenviarlos.
  // ---------------------------------------------------------------------
  function drawRemoteAvatar(ctx, x, y, radius, img, strokeColor, team) {
    if (!img || !img.complete || !img.naturalWidth) return false;
    var size = radius * 2;
    var scale = Math.max(size / img.naturalWidth, size / img.naturalHeight);
    var dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
    try {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TWO_PI, false);
      ctx.closePath();
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, x - dw / 2, y - dh / 2, dw, dh);
      ctx.restore();
    } catch (eDraw) {
      try { ctx.restore(); } catch (eR) {}
      return false;
    }
    // Borde por equipo, fijo (ver arriba), y encima el trazo finito
    // nativo del motor (mismo que ya tenía cualquier disco).
    drawRemoteBorder(ctx, x, y, radius, team);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TWO_PI, false);
    ctx.strokeStyle = strokeColor || "white";
    ctx.stroke();
    return true;
  }

  function drawIfMine(ctx, x, y, radius, playerId, playerTeam, strokeColor) {
    if (playerId == null) return false;
    // Se dibuja una vez por frame por cada disco en cancha (propio o
    // ajeno) mientras el motor lo esté renderizando. Lo usamos como
    // "estoy vivo ahora mismo" para avatar-cosmetics-presence.js, que
    // ya no depende de la lista de la sala (esa desaparece apenas
    // arranca el partido, por eso antes se cortaba tan rápido).
    if (window.HaxNewPresence && window.HaxNewPresence.marcarVisto) {
      window.HaxNewPresence.marcarVisto(playerId);
    }
    var miId = window.HaxNewPresence && window.HaxNewPresence.miPlayerIdLocal ? window.HaxNewPresence.miPlayerIdLocal() : window.__haxLocalPlayerId;
    if (miId == null || playerId !== miId) {
      // No es mi disco: si tengo permitido VER avatares de otros y este
      // jugador publicó uno, lo dibujamos a él en vez de al mío.
      if (!window.HaxNewPresence || !window.HaxNewPresence.verAvataresDeOtros()) return false;
      var remoteImg = window.HaxNewPresence.getRemoteAvatarImage(playerId);
      var remoteTeamNum = playerTeam ? playerTeam.ba : null;
      return drawRemoteAvatar(ctx, x, y, radius, remoteImg, strokeColor, remoteTeamNum);
    }
    if (avatarTrailEnabled) avatarTrailUpdate(x, y);
    if (avatarShineEnabled) avatarShineDraw(ctx, x, y, radius);
    if (avatarTrailEnabled) avatarTrailDraw(ctx);
    if (avatarTrailEnabled && window.__starAvatarBallDebug) {
      var _nowR = window.performance.now();
      if (!window.__starDbgAvRadiusLast || _nowR - window.__starDbgAvRadiusLast > 1000) {
        window.__starDbgAvRadiusLast = _nowR;
        console.log("[HaxNew][debug] drawIfMine radius=", radius, "x=", x, "y=", y);
      }
    }
    var cfg = activeAvatarCfg();
    if (!cfg) {
      if (window.__starAvatarBallDebug) console.log("[HaxNew][debug] drawIfMine: soy yo pero activeAvatarCfg() es null (enabled=", skinEnabled, "skinCfg=", skinCfg, ")");
      return false;

    }
    var drawSrc = cfg.img;
    var iw = cfg.img.naturalWidth || cfg.img.width || 0;
    var ih = cfg.img.naturalHeight || cfg.img.height || 0;
    if (cfg.gifAnim) {
      var frame = currentGifFrame(cfg.gifAnim, cfg.gifStart);
      drawSrc = frame.canvas;
      iw = cfg.gifAnim.width;
      ih = cfg.gifAnim.height;
    }
    if (!iw || !ih) {
      if (window.__starAvatarBallDebug) console.log("[HaxNew][debug] drawIfMine: cfg activo pero imagen sin dimensiones (iw=", iw, "ih=", ih, "), todavía no cargó");
      return false;
    }
    var size = radius * 2;
    var baseScale = Math.max(size / iw, size / ih);
    var scale = baseScale * (cfg.zoom || 1);
    var dw = iw * scale, dh = ih * scale;
    var offX = cfg.offsetX != null ? cfg.offsetX : .5;
    var offY = cfg.offsetY != null ? cfg.offsetY : .5;
    var dx = x - radius - offX * (dw - size);
    var dy = y - radius - offY * (dh - size);
    try {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TWO_PI, false);
      ctx.closePath();
      ctx.clip();
      ctx.imageSmoothingEnabled = true;
      if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
      ctx.drawImage(drawSrc, dx, dy, dw, dh);
      ctx.restore();
    } catch (eDraw) {
      try {
        ctx.restore();
      } catch (eR) {}
      return false;
    }
    var teamNum = playerTeam ? playerTeam.ba : null;
    drawBorder(ctx, x, y, radius, teamNum);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, TWO_PI, false);
    ctx.strokeStyle = strokeColor || "white";
    ctx.stroke();
    return true;
  }
  // ---------------------------------------------------------------------
  // Snapshot chico (64x64, JPEG) de MI avatar, para publicar en
  // avatar-cosmetics-presence.js cuando "Mostrar mi avatar a los demás"
  // está activado. Se recalcula solo cuando hace falta (el motor de
  // presencia lo pide cada tanto), nunca en cada frame.
  // ---------------------------------------------------------------------
  function getShareableSnapshot() {
    var cfg = activeAvatarCfg();
    if (!cfg) return null;
    var iw = cfg.img.naturalWidth || cfg.img.width || 0;
    var ih = cfg.img.naturalHeight || cfg.img.height || 0;
    if (!iw || !ih) return null;
    try {
      var size = 64;
      var canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      var ctx = canvas.getContext("2d");
      var baseScale = Math.max(size / iw, size / ih);
      var scale = baseScale * (cfg.zoom || 1);
      var dw = iw * scale, dh = ih * scale;
      var offX = cfg.offsetX != null ? cfg.offsetX : .5;
      var offY = cfg.offsetY != null ? cfg.offsetY : .5;
      var dx = -offX * (dw - size);
      var dy = -offY * (dh - size);
      var src = cfg.img;
      if (cfg.gifAnim) {
        // Para GIF se publica solo el frame actual (no vale la pena
        // mandar la animación completa a un key-value de presencia).
        var frame = currentGifFrame(cfg.gifAnim, cfg.gifStart);
        src = frame.canvas;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(src, dx, dy, dw, dh);
      return canvas.toDataURL("image/jpeg", .72);
    } catch (e) {
      return null;
    }
  }

  var drawingInternally = false;
  loadSkin();
  loadSkinEnabled();
  loadBorder();
  loadAvatarShine();
  loadAvatarTrail();
  window.addEventListener("storage", function(e) {
    if (!e || e.key === null || e.key === SKIN_KEY || e.key === SKIN_ENABLED_KEY || e.key === BORDER_ENABLED_KEY || e.key === BORDER_WIDTH_KEY || e.key === BORDER_TEAM_DIFF_KEY || e.key === BORDER_COLOR_KEY || e.key === BORDER_RED_KEY || e.key === BORDER_BLUE_KEY || e.key === BORDER_INWARD_KEY || e.key === SHINE_ENABLED_KEY || e.key === SHINE_COLOR_KEY || e.key === SHINE_OPACITY_KEY || e.key === SHINE_SIZE_KEY || e.key === TRAIL_ENABLED_KEY || e.key === TRAIL_COLOR_KEY || e.key === TRAIL_THICKNESS_KEY || e.key === TRAIL_LENGTH_KEY || e.key === TRAIL_OPACITY_KEY) {
      loadSkin();
      loadSkinEnabled();
      loadBorder();
      loadAvatarShine();
      loadAvatarTrail();
    }
  });
  window.addEventListener("HaxNew:avatarimg", function() {
    loadSkin();
    loadSkinEnabled();
    loadBorder();
  });
  window.addEventListener("HaxNew:avatarshine", function() {
    loadAvatarShine();
  });
  window.addEventListener("HaxNew:avatartrail", function() {
    loadAvatarTrail();
  });
  function fireAvatarChanged() {
    try {
      window.dispatchEvent(new Event("HaxNew:avatarimg"));
    } catch (e) {}
  }
  var STAGE = 240;
  var cropState = null;
  var cropModalEl = null;
  var fileInputEl = null;
  function css(id, text) {
    if (document.getElementById(id)) return;
    var style = document.createElement("style");
    style.id = id;
    style.textContent = text;
    document.head.appendChild(style);
  }
  css("HaxNew-avatar-image-css", ".dai-modal{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.6);" + "display:none;align-items:center;justify-content:center}" + ".dai-modal.open{display:flex}" + ".dai-modal-card{background:#12161f;border:1px solid rgba(255,255,255,.12);border-radius:14px;" + "padding:16px;width:288px;color:#e8eaf0;font:13px/1.4 -apple-system,Segoe UI,Roboto,sans-serif}" + ".dai-row{display:flex;align-items:center;justify-content:space-between;margin:8px 0}" + ".dai-btn{flex:1;background:#232b3a;border:1px solid rgba(255,255,255,.12);" + "color:#fff;border-radius:8px;padding:7px 8px;cursor:pointer;font-size:12px}" + ".dai-btn:hover{background:#2c3547}" + ".dai-btn.primary{background:#3461ff}" + ".dai-btn.primary:hover{background:#4a72ff}" + ".dai-stage{width:" + STAGE + "px;height:" + STAGE + "px;border-radius:50%;overflow:hidden;" + "position:relative;margin:0 auto 12px;background:#000;cursor:grab;touch-action:none}" + ".dai-stage img{position:absolute;left:0;top:0;max-width:none;pointer-events:none;user-select:none}" + ".dai-range{width:100%}" + ".dai-loading{position:fixed;inset:0;z-index:2147483002;background:rgba(0,0,0,.65);" + "display:none;align-items:center;justify-content:center;flex-direction:column;gap:12px;" + "color:#e8eaf0;font:13px/1.4 -apple-system,Segoe UI,Roboto,sans-serif}" + ".dai-loading.open{display:flex}" + ".dai-spinner{width:34px;height:34px;border-radius:50%;border:3px solid rgba(255,255,255,.15);" + "border-top-color:#3461ff;animation:daiSpin .8s linear infinite}" + "@keyframes daiSpin{to{transform:rotate(360deg)}}" + ".dai-loadbar{width:200px;height:4px;border-radius:4px;background:rgba(255,255,255,.12);overflow:hidden}" + '.dai-loadbar::after{content:"";display:block;width:40%;height:100%;background:#3461ff;border-radius:4px;' + "animation:daiLoadBar 1.1s ease-in-out infinite}" + "@keyframes daiLoadBar{0%{margin-left:-40%}50%{margin-left:60%}100%{margin-left:100%}}");
  var loadingEl = null;
  function ensureLoadingOverlay() {
    if (loadingEl) return loadingEl;
    var wrap = document.createElement("div");
    wrap.className = "dai-loading";
    wrap.innerHTML = '<div class="dai-spinner"></div>' + '<div class="dai-loadbar"></div>' + '<div id="daiLoadingText">Cargando...</div>';
    document.body.appendChild(wrap);
    loadingEl = wrap;
    return wrap;
  }
  function showLoading(text) {
    var el = ensureLoadingOverlay();
    el.querySelector("#daiLoadingText").textContent = text || "Cargando...";
    el.classList.add("open");
  }
  function hideLoading() {
    if (loadingEl) loadingEl.classList.remove("open");
  }
  function nextPaint(cb) {
    requestAnimationFrame(function() {
      setTimeout(cb, 0);
    });
  }
  function ensureFileInput() {
    if (fileInputEl) return fileInputEl;
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif";
    input.style.display = "none";
    input.addEventListener("change", function() {
      var f = input.files && input.files[0];
      input.value = "";
      if (f) handlePickedFile(f);
    });
    document.body.appendChild(input);
    fileInputEl = input;
    return input;
  }
  function fileToDataUrl(file, cb) {
    var reader = new FileReader;
    reader.onload = function() {
      cb(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  }
  function ensureCropModal() {
    if (cropModalEl) return cropModalEl;
    var wrap = document.createElement("div");
    wrap.className = "dai-modal";
    wrap.innerHTML = '<div class="dai-modal-card">' + '<h4 style="margin:0 0 10px">Ajustar mi avatar</h4>' + '<div class="dai-stage" id="daiStage"><img id="daiCropImg" alt="" /></div>' + '<div class="dai-row"><label>Zoom</label><span id="daiZoomVal">100%</span></div>' + '<input class="dai-range" type="range" id="daiZoomRange" min="100" max="400" value="100" />' + '<div class="dai-row" style="gap:8px;margin-top:14px">' + '<button class="dai-btn" id="daiCropCancel">Cancelar</button>' + '<button class="dai-btn primary" id="daiCropApply">Aplicar</button>' + "</div></div>";
    document.body.appendChild(wrap);
    cropModalEl = wrap;
    var stage = wrap.querySelector("#daiStage");
    var img = wrap.querySelector("#daiCropImg");
    var zoomRange = wrap.querySelector("#daiZoomRange");
    var zoomVal = wrap.querySelector("#daiZoomVal");
    function layout() {
      if (!cropState) return;
      var iw = img.naturalWidth || 1;
      var ih = img.naturalHeight || 1;
      var baseScale = Math.max(STAGE / iw, STAGE / ih);
      var scale = baseScale * cropState.zoom;
      var dw = iw * scale, dh = ih * scale;
      var left = -cropState.offsetX * (dw - STAGE);
      var top = -cropState.offsetY * (dh - STAGE);
      img.style.width = dw + "px";
      img.style.height = dh + "px";
      img.style.left = left + "px";
      img.style.top = top + "px";
    }
    zoomRange.addEventListener("input", function() {
      if (!cropState) return;
      cropState.zoom = Math.max(1, Math.min(4, parseInt(zoomRange.value, 10) / 100));
      zoomVal.textContent = zoomRange.value + "%";
      layout();
    });
    stage.addEventListener("wheel", function(ev) {
      if (!cropState) return;
      ev.preventDefault();
      var next = Math.max(100, Math.min(400, parseInt(zoomRange.value, 10) + (ev.deltaY < 0 ? 10 : -10)));
      zoomRange.value = String(next);
      cropState.zoom = next / 100;
      zoomVal.textContent = next + "%";
      layout();
    }, {
      passive: false
    });
    var dragging = false, startX = 0, startY = 0, startOffX = .5, startOffY = .5;
    stage.addEventListener("pointerdown", function(ev) {
      if (!cropState) return;
      dragging = true;
      stage.style.cursor = "grabbing";
      startX = ev.clientX;
      startY = ev.clientY;
      startOffX = cropState.offsetX;
      startOffY = cropState.offsetY;
      try {
        stage.setPointerCapture(ev.pointerId);
      } catch (e) {}
    });
    stage.addEventListener("pointermove", function(ev) {
      if (!dragging || !cropState) return;
      var iw = img.naturalWidth || 1, ih = img.naturalHeight || 1;
      var baseScale = Math.max(STAGE / iw, STAGE / ih);
      var scale = baseScale * cropState.zoom;
      var dw = iw * scale, dh = ih * scale;
      var rangeX = Math.max(1, dw - STAGE), rangeY = Math.max(1, dh - STAGE);
      var dx = ev.clientX - startX, dy = ev.clientY - startY;
      cropState.offsetX = Math.max(0, Math.min(1, startOffX - dx / rangeX));
      cropState.offsetY = Math.max(0, Math.min(1, startOffY - dy / rangeY));
      layout();
    });
    function endDrag() {
      dragging = false;
      stage.style.cursor = "grab";
    }
    stage.addEventListener("pointerup", endDrag);
    stage.addEventListener("pointercancel", endDrag);
    wrap.querySelector("#daiCropCancel").addEventListener("click", closeCropModal);
    wrap.addEventListener("click", function(ev) {
      if (ev.target === wrap) closeCropModal();
    });
    wrap.querySelector("#daiCropApply").addEventListener("click", function() {
      if (!cropState) {
        console.error("[HaxNew][avatar-image] Aplicar clickeado pero cropState es null (no había imagen cargada en el modal).");
        return;
      }
      var applyBtn = wrap.querySelector("#daiCropApply");
      var originalLabel = applyBtn.textContent;
      applyBtn.disabled = true;
      showLoading(cropState.isGif ? "Guardando GIF..." : "Guardando...");
      function finish(success) {
        applyBtn.disabled = false;
        applyBtn.textContent = originalLabel;
        hideLoading();
        if (success) {
          setSkinEnabled(true);
          closeCropModal();
          fireAvatarChanged();
        }
        console.log("[HaxNew][avatar-image] Aplicar terminado. guardado=", success, "hasImage=", window.HaxNewAvatarImage.hasImage());
      }
      function tryStore(dataUrl, triesLeft) {
        var result = persistSkin({
          image: dataUrl,
          imageZoom: cropState.zoom,
          imageOffsetX: cropState.offsetX,
          imageOffsetY: cropState.offsetY
        }, {
          silent: triesLeft > 0
        });
        if (result.ok) {
          finish(true);
          return;
        }
        if (result.quotaExceeded && triesLeft > 0) {
          applyBtn.textContent = "Achicando imagen...";
          showLoading("Achicando imagen...");
          console.warn("[HaxNew][avatar-image] cuota excedida, reintentando con imagen más chica. Intentos restantes:", triesLeft);
          shrinkDataUrl(dataUrl, function(smaller) {
            if (!smaller) {
              finish(false);
              return;
            }
            cropState.dataUrl = smaller;
            tryStore(smaller, triesLeft - 1);
          });
          return;
        }
        finish(false);
      }
      function approxRawBytes(dataUrl) {
        var comma = dataUrl.indexOf(",");
        var b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
        var len = b64.length;
        var padding = b64.slice(-2) === "==" ? 2 : b64.slice(-1) === "=" ? 1 : 0;
        return Math.max(0, Math.floor(len * 3 / 4) - padding);
      }
      function tryStoreGifRaw(rawDataUrl) {
        var result = persistSkin({
          image: rawDataUrl,
          imageZoom: cropState.zoom,
          imageOffsetX: cropState.offsetX,
          imageOffsetY: cropState.offsetY
        }, {
          silent: true
        });
        if (result.ok) {
          finish(true);
          return;
        }
        if (result.quotaExceeded) {
          shrinkAndStoreGif(rawDataUrl, 0);
          return;
        }
        finish(false);
      }
      function shrinkAndStoreGif(rawDataUrl, stepIdx) {
        if (stepIdx >= GIF_SHRINK_LADDER.length) {
          finish(false);
          window.alert("Este GIF es demasiado pesado para guardarlo, incluso achicado al mínimo. Probá con un GIF más corto o de menor resolución.");
          return;
        }
        if (!window.GifLite) {
          console.error("[HaxNew][avatar-image] GifLite no está cargado (revisar orden de carga en runtime.js). Se intenta guardar el GIF sin achicar.");
          tryStore(rawDataUrl, 0);
          return;
        }
        var opts = GIF_SHRINK_LADDER[stepIdx];
        var label = "Achicando GIF (" + (stepIdx + 1) + "/" + GIF_SHRINK_LADDER.length + ")...";
        applyBtn.textContent = label;
        showLoading(label);
        nextPaint(function() {
          window.GifLite.shrinkGifDataUrl(rawDataUrl, opts, function(out, meta) {
            if (!out) {
              console.error("[HaxNew][avatar-image] GifLite falló en paso", stepIdx, opts, meta);
              shrinkAndStoreGif(rawDataUrl, stepIdx + 1);
              return;
            }
            if (meta && meta.bytes > MAX_GIF_BYTES) {
              shrinkAndStoreGif(rawDataUrl, stepIdx + 1);
              return;
            }
            console.log("[HaxNew][avatar-image] GIF re-codificado", opts, "->", meta);
            cropState.dataUrl = out;
            var result = persistSkin({
              image: out,
              imageZoom: cropState.zoom,
              imageOffsetX: cropState.offsetX,
              imageOffsetY: cropState.offsetY
            }, {
              silent: true
            });
            if (result.ok) {
              finish(true);
              return;
            }
            if (result.quotaExceeded) {
              shrinkAndStoreGif(rawDataUrl, stepIdx + 1);
              return;
            }
            finish(false);
          });
        });
      }
      nextPaint(function() {
        if (cropState.isGif) {
          if (approxRawBytes(cropState.dataUrl) <= MAX_GIF_BYTES) {
            applyBtn.textContent = "Guardando GIF...";
            showLoading("Guardando GIF...");
            nextPaint(function() {
              tryStoreGifRaw(cropState.dataUrl);
            });
          } else {
            shrinkAndStoreGif(cropState.dataUrl, 0);
          }
        } else {
          tryStore(cropState.dataUrl, 3);
        }
      });
    });
    wrap.__layout = layout;
    wrap.__img = img;
    wrap.__zoomRange = zoomRange;
    wrap.__zoomVal = zoomVal;
    return wrap;
  }
  function closeCropModal() {
    if (cropModalEl) cropModalEl.classList.remove("open");
    cropState = null;
  }
  function openCropModal(dataUrl, opts) {
    opts = opts || {};
    var modal = ensureCropModal();
    var zoom = Math.max(1, Math.min(4, Number(opts.zoom) || 1));
    var offsetX = opts.offsetX != null ? Math.max(0, Math.min(1, Number(opts.offsetX))) : .5;
    var offsetY = opts.offsetY != null ? Math.max(0, Math.min(1, Number(opts.offsetY))) : .5;
    cropState = {
      dataUrl: dataUrl,
      zoom: zoom,
      offsetX: offsetX,
      offsetY: offsetY,
      isGif: !!opts.isGif
    };
    modal.__zoomRange.value = String(Math.round(zoom * 100));
    modal.__zoomVal.textContent = Math.round(zoom * 100) + "%";
    modal.__img.src = dataUrl;
    modal.classList.add("open");
    modal.__img.onload = function() {
      modal.__layout();
    };
    modal.__layout();
  }
  function shrinkDataUrl(dataUrl, cb) {
    try {
      var img = new Image;
      img.onload = function() {
        var w = Math.max(1, Math.round(img.naturalWidth * .65));
        var h = Math.max(1, Math.round(img.naturalHeight * .65));
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        var out = canvas.toDataURL("image/jpeg", .6);
        console.log("[HaxNew][avatar-image] shrink ->", w + "x" + h, "bytes=", out.length);
        cb(out);
      };
      img.onerror = function() {
        cb(null);
      };
      img.src = dataUrl;
    } catch (e) {
      console.error("[HaxNew][avatar-image] shrinkDataUrl falló:", e);
      cb(null);
    }
  }
  function compressImage(file, cb) {
    var reader = new FileReader;
    reader.onload = function() {
      var img = new Image;
      img.onload = function() {
        var MAX_DIM = 640;
        var scale = Math.min(1, MAX_DIM / Math.max(img.naturalWidth, img.naturalHeight));
        var w = Math.max(1, Math.round(img.naturalWidth * scale));
        var h = Math.max(1, Math.round(img.naturalHeight * scale));
        var canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        var quality = .9;
        var dataUrl = canvas.toDataURL("image/jpeg", quality);
        var guard = 0;
        while (dataUrl.length > MAX_IMG_BYTES && guard < 12) {
          if (quality > .5) {
            quality -= .1;
          } else {
            w = Math.round(w * .85);
            h = Math.round(h * .85);
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
          }
          dataUrl = canvas.toDataURL("image/jpeg", quality);
          guard++;
        }
        console.log("[HaxNew][avatar-image] comprimida a", w + "x" + h, "calidad", quality.toFixed(2), "bytes=", dataUrl.length);
        cb(dataUrl.length <= MAX_IMG_BYTES ? dataUrl : null);
      };
      img.onerror = function() {
        cb(null);
      };
      img.src = String(reader.result || "");
    };
    reader.onerror = function() {
      cb(null);
    };
    reader.readAsDataURL(file);
  }
  function handlePickedFile(file) {
    if (!file || !file.type || file.type.indexOf("image/") !== 0) {
      window.alert("Elegí una imagen o GIF.");
      return;
    }
    var isGif = file.type === "image/gif";
    if (isGif) {
      var big = file.size > MAX_GIF_BYTES;
      showLoading(big ? "Cargando GIF (puede tardar un poco)..." : "Cargando GIF...");
      nextPaint(function() {
        fileToDataUrl(file, function(dataUrl) {
          hideLoading();
          openCropModal(dataUrl, {
            zoom: 1,
            offsetX: .5,
            offsetY: .5,
            isGif: true
          });
        });
      });
      return;
    }
    showLoading("Procesando imagen...");
    nextPaint(function() {
      compressImage(file, function(dataUrl) {
        hideLoading();
        if (!dataUrl) {
          window.alert("No se pudo procesar esa imagen (puede ser demasiado grande incluso comprimida). Probá con otra.");
          return;
        }
        openCropModal(dataUrl, {
          zoom: 1,
          offsetX: .5,
          offsetY: .5,
          isGif: false
        });
      });
    });
  }
  window.HaxNewAvatarImage = {
    drawIfMine: drawIfMine,
    getShareableSnapshot: getShareableSnapshot,
    pick: function() {
      ensureFileInput().click();
    },
    adjust: function() {
      if (!skinCfg || !skinCfg.raw) return;
      openCropModal(skinCfg.raw, {
        zoom: skinCfg.zoom,
        offsetX: skinCfg.offsetX,
        offsetY: skinCfg.offsetY
      });
    },
    clear: function() {
      persistSkin(null);
      setSkinEnabled(false);
      fireAvatarChanged();
    },
    hasImage: function() {
      return !!(skinCfg && skinCfg.raw);
    },
    getPreviewUrl: function() {
      if (!skinCfg || !skinCfg.raw) return "";
      // Los GIF se dejan sin recortar en canvas: toDataURL() sólo captura
      // un frame fijo y el preview perdería la animación. Para GIF se
      // muestra la imagen animada original tal cual (sin aplicar zoom).
      if (skinCfg.raw.indexOf("data:image/gif") === 0) return skinCfg.raw;
      return croppedPreviewDataUrl(skinCfg, 96) || skinCfg.raw;
    },
    // Dibuja el frame actual (animado si es GIF) con el mismo recorte
    // zoom/offset que usa el juego real (ver drawIfMine más arriba), para
    // que el preview del panel de Personalizar se vea IGUAL que en la
    // cancha — incluida la animación del GIF. Pensado para llamarse en
    // loop (requestAnimationFrame) desde el panel.
    drawPreviewDisc: function(ctx, cx, cy, radius) {
      var cfg = skinCfg && skinCfg.img ? skinCfg : null;
      if (!cfg) return false;
      var drawSrc = cfg.img;
      var iw = cfg.img.naturalWidth || cfg.img.width || 0;
      var ih = cfg.img.naturalHeight || cfg.img.height || 0;
      if (cfg.gifAnim) {
        var frame = currentGifFrame(cfg.gifAnim, cfg.gifStart);
        drawSrc = frame.canvas;
        iw = cfg.gifAnim.width;
        ih = cfg.gifAnim.height;
      }
      if (!iw || !ih) return false;
      var size = radius * 2;
      var baseScale = Math.max(size / iw, size / ih);
      var scale = baseScale * (cfg.zoom || 1);
      var dw = iw * scale, dh = ih * scale;
      var offX = cfg.offsetX != null ? cfg.offsetX : .5;
      var offY = cfg.offsetY != null ? cfg.offsetY : .5;
      var dx = cx - radius - offX * (dw - size);
      var dy = cy - radius - offY * (dh - size);
      try {
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, TWO_PI, false);
        ctx.closePath();
        ctx.clip();
        ctx.imageSmoothingEnabled = true;
        if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
        ctx.drawImage(drawSrc, dx, dy, dw, dh);
        ctx.restore();
      } catch (eDraw) {
        try {
          ctx.restore();
        } catch (eR) {}
        return false;
      }
      return true;
    },
    isEnabled: function() {
      return skinEnabled;
    },
    setEnabled: function(v) {
      setSkinEnabled(v);
      fireAvatarChanged();
    },
    getBorder: function() {
      return {
        enabled: borderEnabled,
        width: borderWidth,
        teamDiff: borderTeamDiff,
        color: borderColor,
        red: borderRedIdx,
        blue: borderBlueIdx,
        inward: borderInward
      };
    },
    setBorderEnabled: function(v) {
      borderEnabled = !!v;
      saveBorder();
    },
    setBorderWidth: function(w) {
      borderWidth = Math.max(0, Math.min(8, Number(w) || 0));
      saveBorder();
    },
    setBorderTeamDiff: function(v) {
      borderTeamDiff = !!v;
      saveBorder();
    },
    setBorderColor: function(c) {
      borderColor = c;
      saveBorder();
    },
    setBorderRed: function(i) {
      borderRedIdx = Math.max(0, Math.min(2, Number(i) || 0));
      saveBorder();
    },
    setBorderBlue: function(i) {
      borderBlueIdx = Math.max(0, Math.min(2, Number(i) || 0));
      saveBorder();
    },
    setBorderInward: function(v) {
      borderInward = !!v;
      saveBorder();
    },
    REDS: RED_SHADES,
    BLUES: BLUE_SHADES,
    getShine: function() {
      return {
        enabled: avatarShineEnabled,
        color: avatarShineColor,
        opacity: avatarShineOpacity,
        size: avatarShineSize
      };
    },
    setShineEnabled: function(v) {
      avatarShineEnabled = !!v;
      saveAvatarShine();
    },
    setShineColor: function(c) {
      avatarShineColor = c;
      avatarShineColorRgb = hexToRgb(c);
      saveAvatarShine();
    },
    setShineOpacity: function(o) {
      avatarShineOpacity = Math.max(.1, Math.min(1, Number(o)));
      saveAvatarShine();
    },
    setShineSize: function(s) {
      avatarShineSize = Math.max(0, Math.min(100, Number(s) || 55));
      saveAvatarShine();
    },
    getTrail: function() {
      return {
        enabled: avatarTrailEnabled,
        color: avatarTrailColor,
        thickness: avatarTrailThickness,
        length: avatarTrailLength,
        opacity: avatarTrailOpacity
      };
    },
    setTrailEnabled: function(v) {
      avatarTrailEnabled = !!v;
      saveAvatarTrail();
    },
    setTrailColor: function(c) {
      avatarTrailColor = c;
      saveAvatarTrail();
    },
    setTrailThickness: function(w) {
      avatarTrailThickness = Math.max(2, Math.min(30, Number(w) || 8));
      saveAvatarTrail();
    },
    setTrailLength: function(l) {
      avatarTrailLength = Math.max(4, Math.min(TRAIL_MAX_CAP, Number(l) || 50));
      saveAvatarTrail();
    },
    setTrailOpacity: function(o) {
      avatarTrailOpacity = Math.max(.1, Math.min(1, Number(o)));
      saveAvatarTrail();
    }
  };
  console.log("[HaxNew] Avatar image cargado (experimental)");
})();