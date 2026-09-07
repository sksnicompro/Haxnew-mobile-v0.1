(function() {
  "use strict";
  if (window.__HaxNewBallSkin) return;
  window.__HaxNewBallSkin = true;
  var SKIN_KEY = "HaxNew_ball_skin";
  var SKIN_ENABLED_KEY = "HaxNew_ball_skin_enabled";
  var BORDER_ENABLED_KEY = "HaxNew_ball_border_enabled";
  var BORDER_WIDTH_KEY = "HaxNew_ball_border_width";
  var BORDER_COLOR_KEY = "HaxNew_ball_border_color";
  var EFFECT_KEY = "HaxNew_ball_effect";
  var EFFECT_ENABLED_KEY = "HaxNew_ball_effect_enabled";
  var GLOW_COLOR_KEY = "HaxNew_ball_glow_color";
  var MODE_KEY = "HaxNew_ball_mode";
  var STYLE_KEY = "HaxNew_ball_style";
  var COLOR_KEY = "HaxNew_ball_color";
  var COLOR2_KEY = "HaxNew_ball_color2";
  var BALL_STYLES = [ "soccer", "tennis", "volleyball", "basketball", "baseball", "billiard", "default" ];
  var TRAIL_ENABLED_KEY = "HaxNew_ball_trail_enabled";
  var TRAIL_COLOR_KEY = "HaxNew_ball_trail_color";
  var TRAIL_THICKNESS_KEY = "HaxNew_ball_trail_thickness";
  var TRAIL_LENGTH_KEY = "HaxNew_ball_trail_length";
  var TRAIL_OPACITY_KEY = "HaxNew_ball_trail_opacity";
  var TRAIL_MAX_CAP = 60;
  var SHINE_ENABLED_KEY = "HaxNew_ball_shine_enabled";
  var SHINE_COLOR_KEY = "HaxNew_ball_shine_color";
  var SHINE_OPACITY_KEY = "HaxNew_ball_shine_opacity";
  var SHINE_SIZE_KEY = "HaxNew_ball_shine_size";
  var BALL_3D_ENABLED_KEY = "HaxNew_ball_3d_enabled";
  var BALL_ROTATE_ENABLED_KEY = "HaxNew_ball_rotate_enabled";
  var TWO_PI = Math.PI * 2;
  var TRAIL_MS = 260;
  var MAX_IMG_BYTES = 9e5;
  var MAX_GIF_BYTES = 12e5;
  var skinCfg = null;
  var skinEnabled = false;
  var ballMode = "image";
  var ballStyle = "default";
  var ballColor = "#60a5fa";
  var ballColor2 = "#7c3aed";
  var borderEnabled = true;
  var borderWidth = 4;
  var borderColor = "#000000";
  var effect = "none";
  var effectEnabled = false;
  var glowColor = "#00e0ff";
  var glowColorRgb = "0,224,255";
  var ballTrailEnabled = false;
  var ballTrailColor = "#ffffff";
  var ballTrailThickness = 8;
  var ballTrailLength = 50;
  var ballTrailOpacity = 1;
  var ballTrailBuf = [];
  var ballShineEnabled = false;
  var ballShineColor = "#ffffff";
  var ballShineColorRgb = "255,255,255";
  var ballShineOpacity = .6;
  var ballShineSize = 40;
  var ball3dEnabled = false;
  var ball3dShadeCanvas = null;
  var ballRotateEnabled = false;
  var ball3dRoll = {
    x: null,
    y: null,
    rot: 0
  };
  function buildGifFrames(dataUrl) {
    try {
      if (!window.GifLite) {
        console.warn("[HaxNew][ball-skin] GifLite no disponible, no se puede animar el GIF a mano.");
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
      console.error("[HaxNew][ball-skin] no se pudo decodificar el GIF para animarlo a mano:", e);
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
  function resolveDrawSource(cfg) {
    if (cfg.gifAnim) {
      var frame = currentGifFrame(cfg.gifAnim, cfg.gifStart);
      return {
        src: frame.canvas,
        iw: cfg.gifAnim.width,
        ih: cfg.gifAnim.height
      };
    }
    var img = cfg.img;
    return {
      src: img,
      iw: img.naturalWidth || img.width || 0,
      ih: img.naturalHeight || img.height || 0
    };
  }
  function approxRawBytes(dataUrl) {
    var comma = dataUrl.indexOf(",");
    var b64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
    var len = b64.length;
    var padding = b64.slice(-2) === "==" ? 2 : b64.slice(-1) === "=" ? 1 : 0;
    return Math.max(0, Math.floor(len * 3 / 4) - padding);
  }
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
    } catch (eJson) {}
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
    var img = new Image;
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
          }
        };
        tryBuildAnim();
      }
    };
    img.onerror = function() {
      next.img = null;
    };
    img.src = cfg.raw;
    skinCfg = next;
  }
  function persistSkin(cfg) {
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
        localStorage.setItem(SKIN_KEY, JSON.stringify(cfg));
      }
    } catch (e) {
      result.ok = false;
      result.error = e;
      result.quotaExceeded = !!(e && (e.name === "QuotaExceededError" || e.code === 22 || e.code === 1014));
    }
    if (result.ok) loadSkin();
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
      borderWidth = isNaN(w) ? 4 : Math.max(0, Math.min(8, w));
    } catch (e2) {
      borderWidth = 4;
    }
    try {
      borderColor = localStorage.getItem(BORDER_COLOR_KEY) || "#000000";
    } catch (e3) {
      borderColor = "#000000";
    }
  }
  function saveBorder() {
    try {
      localStorage.setItem(BORDER_ENABLED_KEY, borderEnabled ? "1" : "0");
      localStorage.setItem(BORDER_WIDTH_KEY, String(borderWidth));
      localStorage.setItem(BORDER_COLOR_KEY, borderColor);
    } catch (e) {}
  }
  function activeBallCfg() {
    return skinEnabled && ballMode === "image" && skinCfg && skinCfg.img ? skinCfg : null;
  }
  // Genera el thumbnail del panel de Personalizar aplicando el mismo
  // zoom/offset que se usa al dibujar la pelota en la cancha (drawIfActive),
  // para que la vista previa coincida con lo que realmente se ve en juego.
  function croppedPreviewDataUrl(cfg, size) {
    size = size || 96;
    if (!cfg || !cfg.img) return null;
    var src = resolveDrawSource(cfg);
    var iw = src.iw, ih = src.ih;
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
      ctx.drawImage(src.src, dx, dy, dw, dh);
      return canvas.toDataURL();
    } catch (e) {
      console.error("[HaxNew][ball-skin] no se pudo generar el preview recortado:", e);
      return null;
    }
  }
  function activeStyleCfg() {
    return skinEnabled && ballMode === "style" ? {
      style: ballStyle,
      color: ballColor,
      color2: ballColor2
    } : null;
  }
  function activeEffect() {
    return "none";
  }
  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || "");
    if (!m) return "0,224,255";
    return parseInt(m[1], 16) + "," + parseInt(m[2], 16) + "," + parseInt(m[3], 16);
  }
  function loadEffect() {
    try {
      effect = localStorage.getItem(EFFECT_KEY) || "none";
    } catch (e) {
      effect = "none";
    }
    try {
      glowColor = localStorage.getItem(GLOW_COLOR_KEY) || "#00e0ff";
    } catch (e) {
      glowColor = "#00e0ff";
    }
    glowColorRgb = hexToRgb(glowColor);
  }
  function loadEffectEnabled() {
    try {
      effectEnabled = localStorage.getItem(EFFECT_ENABLED_KEY) === "1" || localStorage.getItem(EFFECT_ENABLED_KEY) === "true";
    } catch (e) {
      effectEnabled = false;
    }
  }
  function loadBallStyle() {
    try {
      ballMode = localStorage.getItem(MODE_KEY) || "image";
    } catch (e) {
      ballMode = "image";
    }
    if (ballMode !== "image" && ballMode !== "style") ballMode = "image";
    try {
      ballStyle = localStorage.getItem(STYLE_KEY) || "default";
    } catch (e2) {
      ballStyle = "default";
    }
    if (BALL_STYLES.indexOf(ballStyle) === -1) ballStyle = "default";
    try {
      ballColor = localStorage.getItem(COLOR_KEY) || "#60a5fa";
    } catch (e3) {
      ballColor = "#60a5fa";
    }
    try {
      ballColor2 = localStorage.getItem(COLOR2_KEY) || "#7c3aed";
    } catch (e4) {
      ballColor2 = "#7c3aed";
    }
  }
  function saveBallStyle() {
    try {
      localStorage.setItem(MODE_KEY, ballMode);
      localStorage.setItem(STYLE_KEY, ballStyle);
      localStorage.setItem(COLOR_KEY, ballColor);
      localStorage.setItem(COLOR2_KEY, ballColor2);
    } catch (e) {}
  }
  function loadBallTrail() {
    try {
      ballTrailEnabled = localStorage.getItem(TRAIL_ENABLED_KEY) === "1" || localStorage.getItem(TRAIL_ENABLED_KEY) === "true";
    } catch (e) {
      ballTrailEnabled = false;
    }
    try {
      ballTrailColor = localStorage.getItem(TRAIL_COLOR_KEY) || "#ffffff";
    } catch (e2) {
      ballTrailColor = "#ffffff";
    }
    try {
      var th = parseFloat(localStorage.getItem(TRAIL_THICKNESS_KEY));
      ballTrailThickness = isNaN(th) ? 8 : Math.max(2, Math.min(30, th));
    } catch (e3) {
      ballTrailThickness = 8;
    }
    try {
      var ln = parseInt(localStorage.getItem(TRAIL_LENGTH_KEY), 10);
      ballTrailLength = isNaN(ln) ? 50 : Math.max(4, Math.min(TRAIL_MAX_CAP, ln));
    } catch (e4) {
      ballTrailLength = 50;
    }
    try {
      var op = parseFloat(localStorage.getItem(TRAIL_OPACITY_KEY));
      ballTrailOpacity = isNaN(op) ? 1 : Math.max(.1, Math.min(1, op));
    } catch (e5) {
      ballTrailOpacity = 1;
    }
  }
  function saveBallTrail() {
    try {
      localStorage.setItem(TRAIL_ENABLED_KEY, ballTrailEnabled ? "1" : "0");
      localStorage.setItem(TRAIL_COLOR_KEY, ballTrailColor);
      localStorage.setItem(TRAIL_THICKNESS_KEY, String(ballTrailThickness));
      localStorage.setItem(TRAIL_LENGTH_KEY, String(ballTrailLength));
      localStorage.setItem(TRAIL_OPACITY_KEY, String(ballTrailOpacity));
    } catch (e) {}
  }
  function loadBallShine() {
    try {
      ballShineEnabled = localStorage.getItem(SHINE_ENABLED_KEY) === "1" || localStorage.getItem(SHINE_ENABLED_KEY) === "true";
    } catch (e) {
      ballShineEnabled = false;
    }
    try {
      ballShineColor = localStorage.getItem(SHINE_COLOR_KEY) || "#ffffff";
    } catch (e2) {
      ballShineColor = "#ffffff";
    }
    ballShineColorRgb = hexToRgb(ballShineColor);
    try {
      var op = parseFloat(localStorage.getItem(SHINE_OPACITY_KEY));
      ballShineOpacity = isNaN(op) ? .6 : Math.max(.1, Math.min(1, op));
    } catch (e3) {
      ballShineOpacity = .6;
    }
    try {
      var sz = parseFloat(localStorage.getItem(SHINE_SIZE_KEY));
      ballShineSize = isNaN(sz) ? 40 : Math.max(0, Math.min(100, sz));
    } catch (e4) {
      ballShineSize = 40;
    }
  }
  function saveBallShine() {
    try {
      localStorage.setItem(SHINE_ENABLED_KEY, ballShineEnabled ? "1" : "0");
      localStorage.setItem(SHINE_COLOR_KEY, ballShineColor);
      localStorage.setItem(SHINE_OPACITY_KEY, String(ballShineOpacity));
      localStorage.setItem(SHINE_SIZE_KEY, String(ballShineSize));
    } catch (e) {}
  }
  function loadBall3D() {
    try {
      ball3dEnabled = localStorage.getItem(BALL_3D_ENABLED_KEY) === "1" || localStorage.getItem(BALL_3D_ENABLED_KEY) === "true";
    } catch (e) {
      ball3dEnabled = false;
    }
    try {
      ballRotateEnabled = localStorage.getItem(BALL_ROTATE_ENABLED_KEY) === "1" || localStorage.getItem(BALL_ROTATE_ENABLED_KEY) === "true";
    } catch (e2) {
      ballRotateEnabled = false;
    }
  }
  function saveBall3D() {
    try {
      localStorage.setItem(BALL_3D_ENABLED_KEY, ball3dEnabled ? "1" : "0");
      localStorage.setItem(BALL_ROTATE_ENABLED_KEY, ballRotateEnabled ? "1" : "0");
    } catch (e) {}
  }
  // Sombreado tipo esfera (brillo arriba-izquierda, sombra hacia el borde
  // opuesto) para dar sensación de volumen 3D sobre la pelota, sea cual sea
  // el modo activo (imagen, estilo o la pelota plana de siempre). Se dibuja
  // una única vez y se reusa (igual que los sprites de estilo). El brillo
  // está corrido del centro (46,42 en vez de 64,64), así que si se rota el
  // sprite el punto de brillo se mueve alrededor de la pelota, dando el
  // efecto de una esfera que gira de verdad.
  function ball3DShadeSprite() {
    if (ball3dShadeCanvas) return ball3dShadeCanvas;
    var c = document.createElement("canvas");
    c.width = 128;
    c.height = 128;
    var cx = c.getContext("2d");
    var grad = cx.createRadialGradient(46, 42, 6, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,255,255,.5)");
    grad.addColorStop(.34, "rgba(255,255,255,0)");
    grad.addColorStop(.88, "rgba(0,0,0,.06)");
    grad.addColorStop(1, "rgba(0,0,0,.48)");
    cx.fillStyle = grad;
    cx.beginPath();
    cx.arc(64, 64, 64, 0, TWO_PI);
    cx.fill();
    ball3dShadeCanvas = c;
    return c;
  }
  // Acumula un ángulo de rotación en base a la distancia recorrida por la
  // pelota entre frames (como si rodara), para que "Rotación" tenga de qué
  // agarrarse. Sin esto el sprite nunca cambiaría de orientación. Se llama
  // una sola vez por frame desde drawIfActive (no desde ball3DDraw), así el
  // mismo ángulo se puede reusar para rotar tanto el sombreado 3D como la
  // imagen/estilo de la pelota, sin que se pisen ni se acumule doble.
  function ball3DUpdateRoll(x, y, r) {
    if (ball3dRoll.x !== null) {
      var dx = x - ball3dRoll.x, dy = y - ball3dRoll.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > .02) ball3dRoll.rot += dist / Math.max(r, 1);
    }
    ball3dRoll.x = x;
    ball3dRoll.y = y;
  }
  // Aplica (sobre un ctx ya clippeado al círculo de la pelota) la rotación
  // acumulada en ball3dRoll.rot, rotando alrededor del centro (x,y). Como
  // hace translate/rotate/translate de vuelta, todo lo que se dibuje después
  // usando las coordenadas absolutas normales (x,y,r) queda rotado sin tener
  // que recalcular nada. No hace nada si "Rotación" está apagada.
  function applyBallRollRotation(ctx, x, y) {
    if (!ballRotateEnabled) return;
    ctx.translate(x, y);
    ctx.rotate(ball3dRoll.rot % TWO_PI);
    ctx.translate(-x, -y);
  }
  function ball3DDraw(ctx, x, y, r) {
    if (!ball3dEnabled) return;
    drawingInternally = true;
    try {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TWO_PI, false);
      ctx.clip();
      applyBallRollRotation(ctx, x, y);
      ctx.drawImage(ball3DShadeSprite(), x - r, y - r, r * 2, r * 2);
      ctx.restore();
    } finally {
      drawingInternally = false;
    }
  }
  function active() {
    return !!activeBallCfg() || !!activeStyleCfg() || activeEffect() !== "none" || ballTrailEnabled || ballShineEnabled || ball3dEnabled;
  }
  function ballTrailUpdate(x, y) {
    ballTrailBuf.push({
      x: x,
      y: y
    });
    if (ballTrailBuf.length > TRAIL_MAX_CAP) ballTrailBuf.shift();
  }
  function ballTrailDraw(ctx) {
    if (!ballTrailEnabled || ballTrailBuf.length < 2) return;
    var len = Math.max(2, Math.min(ballTrailLength, ballTrailBuf.length));
    var pts = ballTrailBuf.slice(ballTrailBuf.length - len);
    var dxTotal = pts[pts.length - 1].x - pts[0].x;
    var dyTotal = pts[pts.length - 1].y - pts[0].y;
    if (Math.abs(dxTotal) < .5 && Math.abs(dyTotal) < .5) return;
    var rgb = hexToRgb(ballTrailColor).split(",");
    var opac = ballTrailOpacity;
    var thickness = ballTrailThickness;
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
    } finally {
      drawingInternally = false;
    }
  }
  function drawStyledBall(ctx, x, y, r, style, colorA, colorB) {
    drawingInternally = true;
    try {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TWO_PI, false);
      ctx.clip();
      applyBallRollRotation(ctx, x, y);
      if (style === "soccer") {
        ctx.fillStyle = "#f5f5f5";
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.fillStyle = "#151515";
        for (var i = 0; i < 5; i++) {
          var a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
          var px = x + Math.cos(a) * r * .42;
          var py = y + Math.sin(a) * r * .42;
          ctx.beginPath();
          for (var j = 0; j < 5; j++) {
            var a2 = a + j * (Math.PI * 2 / 5) - Math.PI / 2;
            var sx = px + Math.cos(a2) * r * .22;
            var sy = py + Math.sin(a2) * r * .22;
            if (j === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
        }
        ctx.beginPath();
        ctx.arc(x, y, r * .18, 0, TWO_PI, false);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.35)";
        ctx.lineWidth = Math.max(1, r * .04);
        ctx.beginPath();
        ctx.arc(x, y, r * .55, 0, TWO_PI, false);
        ctx.stroke();
      } else if (style === "tennis") {
        ctx.fillStyle = "#c8e84a";
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = Math.max(1.5, r * .12);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.arc(x - r * .55, y, r * .95, -1.1, 1.1, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + r * .55, y, r * .95, Math.PI - 1.1, Math.PI + 1.1, false);
        ctx.stroke();
      } else if (style === "volleyball") {
        ctx.fillStyle = "#f7f7f7";
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.strokeStyle = "#1f4f9c";
        ctx.lineWidth = Math.max(1.2, r * .08);
        ctx.beginPath();
        ctx.moveTo(x, y - r);
        ctx.quadraticCurveTo(x + r * .35, y, x, y + r);
        ctx.quadraticCurveTo(x - r * .35, y, x, y - r);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r * .78, -.9, .9, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r * .78, Math.PI - .9, Math.PI + .9, false);
        ctx.stroke();
        ctx.strokeStyle = "#e2b93b";
        ctx.beginPath();
        ctx.moveTo(x - r, y);
        ctx.lineTo(x + r, y);
        ctx.stroke();
      } else if (style === "basketball") {
        ctx.fillStyle = "#e87722";
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.strokeStyle = "#1a1a1a";
        ctx.lineWidth = Math.max(1.2, r * .08);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TWO_PI, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - r, y);
        ctx.lineTo(x + r, y);
        ctx.moveTo(x, y - r);
        ctx.lineTo(x, y + r);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x - r * .15, y, r * .85, -1.2, 1.2, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + r * .15, y, r * .85, Math.PI - 1.2, Math.PI + 1.2, false);
        ctx.stroke();
      } else if (style === "baseball") {
        ctx.fillStyle = "#f4f1ea";
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.strokeStyle = "#c43c3c";
        ctx.lineWidth = Math.max(1, r * .06);
        ctx.lineCap = "round";
        var stitch = function(cx, flip) {
          for (var t = -.95; t <= .95; t += .18) {
            var ang = t * 1.05;
            var bx = cx + Math.cos(ang) * r * .72 * flip;
            var by = y + Math.sin(ang) * r * .72;
            var nx = -Math.sin(ang) * flip;
            var ny = Math.cos(ang);
            ctx.beginPath();
            ctx.moveTo(bx - nx * r * .08, by - ny * r * .08);
            ctx.lineTo(bx + nx * r * .08, by + ny * r * .08);
            ctx.stroke();
          }
        };
        stitch(x - r * .12, 1);
        stitch(x + r * .12, -1);
        ctx.beginPath();
        ctx.arc(x - r * .12, y, r * .72, -1.05, 1.05, false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x + r * .12, y, r * .72, Math.PI - 1.05, Math.PI + 1.05, false);
        ctx.stroke();
      } else if (style === "billiard") {
        ctx.fillStyle = colorA || "#111111";
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(x, y - r * .08, r * .42, 0, TWO_PI, false);
        ctx.fill();
        ctx.fillStyle = colorB || "#111111";
        ctx.font = "bold " + Math.max(8, Math.round(r * .55)) + "px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("8", x, y - r * .05);
      } else {
        var grad2 = ctx.createRadialGradient(x - r * .35, y - r * .35, Math.max(1, r * .15), x, y, r);
        grad2.addColorStop(0, colorA || "#60a5fa");
        grad2.addColorStop(1, colorB || "#7c3aed");
        ctx.fillStyle = grad2;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
      ctx.restore();
    } finally {
      drawingInternally = false;
    }
  }
  var trailBuf = [];
  function drawUnderlay(ctx, x, y, r, now) {
    var fx = activeEffect();
    drawingInternally = true;
    try {
      if (fx === "trail") {
        for (var i = 0; i < trailBuf.length; i++) {
          var t = trailBuf[i];
          var age = (now - t.ts) / TRAIL_MS;
          if (age >= 1) continue;
          ctx.save();
          ctx.globalAlpha = (1 - age) * .35;
          ctx.beginPath();
          ctx.arc(t.x, t.y, r * (1 - age * .25), 0, TWO_PI);
          ctx.fillStyle = "#00e0ff";
          ctx.fill();
          ctx.restore();
        }
        trailBuf.push({
          x: x,
          y: y,
          ts: now
        });
        while (trailBuf.length && now - trailBuf[0].ts > TRAIL_MS) trailBuf.shift();
      }
      if (fx === "glow") {
        ctx.save();
        var grad = ctx.createRadialGradient(x, y, r * .4, x, y, r * 2.3);
        grad.addColorStop(0, "rgba(" + glowColorRgb + ",.55)");
        grad.addColorStop(1, "rgba(" + glowColorRgb + ",0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, r * 2.3, 0, TWO_PI);
        ctx.fill();
        ctx.restore();
      }
    } finally {
      drawingInternally = false;
    }
  }
  function ballShineDraw(ctx, x, y, r) {
    if (!ballShineEnabled) return;
    drawingInternally = true;
    try {
      var mult = 1.3 + ballShineSize / 100 * 1.2;
      var outerR = r * mult;
      ctx.save();
      var grad = ctx.createRadialGradient(x, y, r * .35, x, y, outerR);
      grad.addColorStop(0, "rgba(" + ballShineColorRgb + "," + .6 * ballShineOpacity + ")");
      grad.addColorStop(1, "rgba(" + ballShineColorRgb + ",0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, outerR, 0, TWO_PI);
      ctx.fill();
      ctx.restore();
    } finally {
      drawingInternally = false;
    }
  }
  function drawBorder(ctx, x, y, r) {
    if (!borderEnabled || !(borderWidth > 0)) return;
    drawingInternally = true;
    try {
      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, r, 0, TWO_PI, false);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = Math.max(.8, r * borderWidth * .02);
      ctx.stroke();
      ctx.restore();
    } finally {
      drawingInternally = false;
    }
  }
  var drawingInternally = false;
  function drawIfActive(ctx, x, y, r) {
    if (active()) ballTrailUpdate(x, y);
    if (!active()) {
      if (window.__starAvatarBallDebug && !window.__starDbgBallInactiveLast) {
        window.__starDbgBallInactiveLast = performance.now();
        console.log("[HaxNew][debug] drawIfActive: active()=false (enabled=", skinEnabled, "skinCfg=", skinCfg, "effectEnabled=", effectEnabled, "effect=", effect, ")");
      }
      return false;
    }
    var now = performance.now();
    if (ballRotateEnabled) ball3DUpdateRoll(x, y, r);
    drawUnderlay(ctx, x, y, r, now);
    ballTrailDraw(ctx);
    ballShineDraw(ctx, x, y, r);
    if (activeEffect() === "rainbow") {
      var hue = now / 12 % 360;
      drawingInternally = true;
      try {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TWO_PI);
        ctx.closePath();
        ctx.fillStyle = "hsl(" + hue + ",90%,55%)";
        ctx.fill();
        ctx.restore();
      } finally {
        drawingInternally = false;
      }
      ball3DDraw(ctx, x, y, r);
      drawBorder(ctx, x, y, r);
      return true;
    }
    var styleCfg = activeStyleCfg();
    if (styleCfg) {
      drawStyledBall(ctx, x, y, r, styleCfg.style, styleCfg.color, styleCfg.color2);
      ball3DDraw(ctx, x, y, r);
      drawBorder(ctx, x, y, r);
      return true;
    }
    var cfg = activeBallCfg();
    if (cfg) {
      var src = resolveDrawSource(cfg);
      var iw = src.iw, ih = src.ih;
      if (iw && ih) {
        drawingInternally = true;
        try {
          var size = r * 2;
          var baseScale = Math.max(size / iw, size / ih);
          var scale = baseScale * (cfg.zoom || 1);
          var dw = iw * scale;
          var dh = ih * scale;
          var offX = cfg.offsetX != null ? cfg.offsetX : .5;
          var offY = cfg.offsetY != null ? cfg.offsetY : .5;
          var dx = x - r - offX * (dw - size);
          var dy = y - r - offY * (dh - size);
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, r, 0, TWO_PI);
          ctx.closePath();
          ctx.clip();
          applyBallRollRotation(ctx, x, y);
          ctx.imageSmoothingEnabled = true;
          if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
          ctx.drawImage(src.src, dx, dy, dw, dh);
          ball3DDraw(ctx, x, y, r);
          ctx.restore();
        } finally {
          drawingInternally = false;
        }
        drawBorder(ctx, x, y, r);
        return true;
      }
    }
    if (ball3dEnabled) {
      drawingInternally = true;
      try {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TWO_PI, false);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
      } finally {
        drawingInternally = false;
      }
      ball3DDraw(ctx, x, y, r);
      drawBorder(ctx, x, y, r);
      return true;
    }
    if (activeEffect() !== "none" || ballTrailEnabled || ballShineEnabled) {
      drawBorder(ctx, x, y, r);
    }
    return false;
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
  css("HaxNew-ball-skin-css", ".dbs-modal{position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.6);" + "display:none;align-items:center;justify-content:center}" + ".dbs-modal.open{display:flex}" + ".dbs-modal-card{background:#12161f;border:1px solid rgba(255,255,255,.12);border-radius:14px;" + "padding:16px;width:288px;color:#e8eaf0;font:13px/1.4 -apple-system,Segoe UI,Roboto,sans-serif}" + ".dbs-row{display:flex;align-items:center;justify-content:space-between;margin:8px 0}" + ".dbs-btn{flex:1;background:#232b3a;border:1px solid rgba(255,255,255,.12);" + "color:#fff;border-radius:8px;padding:7px 8px;cursor:pointer;font-size:12px}" + ".dbs-btn:hover{background:#2c3547}" + ".dbs-btn.primary{background:#3461ff}" + ".dbs-btn.primary:hover{background:#4a72ff}" + ".dbs-stage{width:" + STAGE + "px;height:" + STAGE + "px;border-radius:50%;overflow:hidden;" + "position:relative;margin:0 auto 12px;background:#000;cursor:grab;touch-action:none}" + ".dbs-stage img{position:absolute;left:0;top:0;max-width:none;pointer-events:none;user-select:none}" + ".dbs-range{width:100%}");
  function fireBallSkinChanged() {
    try {
      window.dispatchEvent(new Event("HaxNew:ballskin"));
    } catch (e) {}
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
    wrap.className = "dbs-modal";
    wrap.innerHTML = '<div class="dbs-modal-card">' + '<h4 style="margin:0 0 10px">Ajustar imagen de la pelota</h4>' + '<div class="dbs-stage" id="dbsStage"><img id="dbsCropImg" alt="" /></div>' + '<div class="dbs-row"><label>Zoom</label><span id="dbsZoomVal">100%</span></div>' + '<input class="dbs-range" type="range" id="dbsZoomRange" min="100" max="400" value="100" />' + '<div class="dbs-row" style="gap:8px;margin-top:14px">' + '<button class="dbs-btn" id="dbsCropCancel">Cancelar</button>' + '<button class="dbs-btn primary" id="dbsCropApply">Aplicar</button>' + "</div></div>";
    document.body.appendChild(wrap);
    cropModalEl = wrap;
    var stage = wrap.querySelector("#dbsStage");
    var img = wrap.querySelector("#dbsCropImg");
    var zoomRange = wrap.querySelector("#dbsZoomRange");
    var zoomVal = wrap.querySelector("#dbsZoomVal");
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
    wrap.querySelector("#dbsCropCancel").addEventListener("click", closeCropModal);
    wrap.addEventListener("click", function(ev) {
      if (ev.target === wrap) closeCropModal();
    });
    var applyBtn = wrap.querySelector("#dbsCropApply");
    function nextPaint(cb) {
      requestAnimationFrame(function() {
        setTimeout(cb, 0);
      });
    }
    function finishApply(ok) {
      applyBtn.disabled = false;
      applyBtn.textContent = "Aplicar";
      if (ok) {
        setSkinEnabled(true);
        closeCropModal();
        fireBallSkinChanged();
      }
    }
    function storeBallImage(dataUrl) {
      var result = persistSkin({
        image: dataUrl,
        imageZoom: cropState.zoom,
        imageOffsetX: cropState.offsetX,
        imageOffsetY: cropState.offsetY
      });
      return result;
    }
    function shrinkAndStoreBallGif(rawDataUrl, stepIdx) {
      if (stepIdx >= GIF_SHRINK_LADDER.length) {
        finishApply(false);
        window.alert("Este GIF es demasiado pesado para guardarlo, incluso achicado al mínimo. Probá con un GIF más corto o de menor resolución.");
        return;
      }
      if (!window.GifLite) {
        console.error("[HaxNew][ball-skin] GifLite no está cargado. Se intenta guardar el GIF sin achicar.");
        finishApply(storeBallImage(rawDataUrl).ok);
        return;
      }
      var opts = GIF_SHRINK_LADDER[stepIdx];
      applyBtn.textContent = "Achicando GIF (" + (stepIdx + 1) + "/" + GIF_SHRINK_LADDER.length + ")...";
      nextPaint(function() {
        window.GifLite.shrinkGifDataUrl(rawDataUrl, opts, function(out, meta) {
          if (!out || meta && meta.bytes > MAX_GIF_BYTES) {
            shrinkAndStoreBallGif(rawDataUrl, stepIdx + 1);
            return;
          }
          cropState.dataUrl = out;
          var result = storeBallImage(out);
          if (result.ok) {
            finishApply(true);
            return;
          }
          if (result.quotaExceeded) {
            shrinkAndStoreBallGif(rawDataUrl, stepIdx + 1);
            return;
          }
          finishApply(false);
        });
      });
    }
    applyBtn.addEventListener("click", function() {
      if (!cropState) return;
      applyBtn.disabled = true;
      if (!cropState.isGif) {
        finishApply(storeBallImage(cropState.dataUrl).ok);
        return;
      }
      if (approxRawBytes(cropState.dataUrl) <= MAX_GIF_BYTES) {
        applyBtn.textContent = "Guardando GIF...";
        nextPaint(function() {
          var result = storeBallImage(cropState.dataUrl);
          if (result.ok) {
            finishApply(true);
            return;
          }
          if (result.quotaExceeded) {
            shrinkAndStoreBallGif(cropState.dataUrl, 0);
            return;
          }
          finishApply(false);
        });
      } else {
        shrinkAndStoreBallGif(cropState.dataUrl, 0);
      }
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
  function handlePickedFile(file) {
    if (!file || !file.type || file.type.indexOf("image/") !== 0) {
      window.alert("Elegí una imagen o GIF.");
      return;
    }
    var isGif = file.type === "image/gif";
    if (!isGif && file.size > MAX_IMG_BYTES) {
      window.alert("Archivo muy pesado. Máximo ~" + Math.round(MAX_IMG_BYTES / 1e3) + " KB.");
      return;
    }
    fileToDataUrl(file, function(dataUrl) {
      openCropModal(dataUrl, {
        zoom: 1,
        offsetX: .5,
        offsetY: .5,
        isGif: isGif
      });
    });
  }
  loadSkin();
  loadSkinEnabled();
  loadBallStyle();
  loadBorder();
  loadEffect();
  loadEffectEnabled();
  loadBallTrail();
  loadBallShine();
  loadBall3D();
  window.addEventListener("storage", function(e) {
    if (!e || e.key === null || e.key === SKIN_KEY || e.key === SKIN_ENABLED_KEY || e.key === EFFECT_KEY || e.key === EFFECT_ENABLED_KEY || e.key === GLOW_COLOR_KEY || e.key === BORDER_ENABLED_KEY || e.key === BORDER_WIDTH_KEY || e.key === BORDER_COLOR_KEY || e.key === MODE_KEY || e.key === STYLE_KEY || e.key === COLOR_KEY || e.key === COLOR2_KEY || e.key === TRAIL_ENABLED_KEY || e.key === TRAIL_COLOR_KEY || e.key === TRAIL_THICKNESS_KEY || e.key === TRAIL_LENGTH_KEY || e.key === TRAIL_OPACITY_KEY || e.key === SHINE_ENABLED_KEY || e.key === SHINE_COLOR_KEY || e.key === SHINE_OPACITY_KEY || e.key === SHINE_SIZE_KEY || e.key === BALL_3D_ENABLED_KEY || e.key === BALL_ROTATE_ENABLED_KEY) {
      loadSkin();
      loadSkinEnabled();
      loadBallStyle();
      loadBorder();
      loadEffect();
      loadEffectEnabled();
      loadBallTrail();
      loadBallShine();
      loadBall3D();
    }
  });
  window.addEventListener("HaxNew:ballskin", function() {
    loadSkin();
    loadSkinEnabled();
    loadBallStyle();
  });
  window.addEventListener("HaxNew:balleffect", function() {
    loadEffect();
    loadEffectEnabled();
  });
  window.addEventListener("HaxNew:balltrail", function() {
    loadBallTrail();
  });
  window.addEventListener("HaxNew:ballshine", function() {
    loadBallShine();
  });
  window.addEventListener("HaxNew:ball3d", function() {
    loadBall3D();
  });
  window.HaxNewBallSkin = {
    drawIfActive: drawIfActive,
    pick: function() {
      ensureFileInput().click();
    },
    applyPresetImage: function(url) {
      var result = persistSkin({
        image: url,
        imageZoom: 1,
        imageOffsetX: .5,
        imageOffsetY: .5
      });
      if (result.ok) {
        ballMode = "image";
        saveBallStyle();
        setSkinEnabled(true);
        fireBallSkinChanged();
      }
      return result;
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
      fireBallSkinChanged();
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
    // zoom/offset que usa el juego real (ver drawIfActive más arriba),
    // para que el preview del panel de Personalizar se vea IGUAL que en
    // la cancha — incluida la animación del GIF. Pensado para llamarse
    // en loop (requestAnimationFrame) desde el panel.
    drawPreviewDisc: function(ctx, cx, cy, radius) {
      var cfg = skinCfg && skinCfg.img ? skinCfg : null;
      if (!cfg) return false;
      var src = resolveDrawSource(cfg);
      var iw = src.iw, ih = src.ih;
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
        ctx.arc(cx, cy, radius, 0, TWO_PI);
        ctx.closePath();
        ctx.clip();
        ctx.imageSmoothingEnabled = true;
        if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
        ctx.drawImage(src.src, dx, dy, dw, dh);
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
      fireBallSkinChanged();
    },
    getBorder: function() {
      return {
        enabled: borderEnabled,
        width: borderWidth,
        color: borderColor
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
    setBorderColor: function(c) {
      borderColor = c;
      saveBorder();
    },
    STYLES: BALL_STYLES,
    getStyle: function() {
      return {
        mode: ballMode,
        style: ballStyle,
        color: ballColor,
        color2: ballColor2
      };
    },
    setMode: function(m) {
      ballMode = m === "style" ? "style" : "image";
      saveBallStyle();
      fireBallSkinChanged();
    },
    setStyle: function(s) {
      if (BALL_STYLES.indexOf(s) !== -1) ballStyle = s;
      saveBallStyle();
      fireBallSkinChanged();
    },
    setColor: function(c) {
      ballColor = c;
      saveBallStyle();
      fireBallSkinChanged();
    },
    setColor2: function(c) {
      ballColor2 = c;
      saveBallStyle();
      fireBallSkinChanged();
    },
    getTrail: function() {
      return {
        enabled: ballTrailEnabled,
        color: ballTrailColor,
        thickness: ballTrailThickness,
        length: ballTrailLength,
        opacity: ballTrailOpacity
      };
    },
    setTrailEnabled: function(v) {
      ballTrailEnabled = !!v;
      saveBallTrail();
    },
    setTrailColor: function(c) {
      ballTrailColor = c;
      saveBallTrail();
    },
    setTrailThickness: function(w) {
      ballTrailThickness = Math.max(2, Math.min(30, Number(w) || 8));
      saveBallTrail();
    },
    setTrailLength: function(l) {
      ballTrailLength = Math.max(4, Math.min(TRAIL_MAX_CAP, Number(l) || 50));
      saveBallTrail();
    },
    setTrailOpacity: function(o) {
      ballTrailOpacity = Math.max(.1, Math.min(1, Number(o)));
      saveBallTrail();
    },
    getShine: function() {
      return {
        enabled: ballShineEnabled,
        color: ballShineColor,
        opacity: ballShineOpacity,
        size: ballShineSize
      };
    },
    setShineEnabled: function(v) {
      ballShineEnabled = !!v;
      saveBallShine();
    },
    setShineColor: function(c) {
      ballShineColor = c;
      ballShineColorRgb = hexToRgb(c);
      saveBallShine();
    },
    setShineOpacity: function(o) {
      ballShineOpacity = Math.max(.1, Math.min(1, Number(o)));
      saveBallShine();
    },
    setShineSize: function(s) {
      ballShineSize = Math.max(0, Math.min(100, Number(s) || 40));
      saveBallShine();
    },
    get3D: function() {
      return {
        enabled: ball3dEnabled,
        rotate: ballRotateEnabled
      };
    },
    set3DEnabled: function(v) {
      ball3dEnabled = !!v;
      saveBall3D();
    },
    setRotateEnabled: function(v) {
      ballRotateEnabled = !!v;
      saveBall3D();
    }
  };
  console.log("[HaxNew] Ball skin cargado (experimental)");
})();