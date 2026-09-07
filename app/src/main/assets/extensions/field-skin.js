(function() {
  "use strict";
  if (window.__HaxNewFieldSkin) return;
  window.__HaxNewFieldSkin = true;
  var STORAGE_KEY = "HaxNew_field_skin_cfg";
  var CHANGE_EVENT = "HaxNew:fieldskin";
  var NATIVE_LINE_COLORS = [ "#C7E6BD", "#E9CC6E", "#c7e6bd", "#e9cc6e" ];
  var MAX_STRETCH_SIZE = 6e3;
  var state = {
    pitch: {
      mode: "default",
      color: "#718C5A",
      image: null,
      keepAspect: false,
      sizeX: 100,
      sizeY: 100,
      offsetX: 50,
      offsetY: 50
    },
    outside: {
      enabled: false,
      mode: "color",
      color: "#0f1216",
      image: null
    },
    lines: {
      enabled: false,
      color: "#C7E6BD"
    }
  };
  var pitchImgEl = null;
  var pitchImgReady = false;
  var outsideImgEl = null;
  var outsideImgReady = false;
  function loadImageInto(dataUrl, onReady) {
    if (!dataUrl) return null;
    var img = new Image;
    img.onload = function() {
      onReady(true);
    };
    img.onerror = function() {
      onReady(false);
    };
    img.src = dataUrl;
    return img;
  }
  function refreshPitchImg() {
    pitchImgReady = false;
    pitchImgEl = loadImageInto(state.pitch.image, function(ok) {
      pitchImgReady = ok;
    });
  }
  function refreshOutsideImg() {
    outsideImgReady = false;
    outsideImgEl = loadImageInto(state.outside.image, function(ok) {
      outsideImgReady = ok;
    });
  }
  function loadState() {
    var raw = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}
    if (!raw) return;
    var parsed = null;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      return;
    }
    if (!parsed) return;
    if (parsed.pitch) {
      var p = parsed.pitch;
      if (typeof p.mode === "string") state.pitch.mode = p.mode;
      if (typeof p.color === "string") state.pitch.color = p.color;
      if (typeof p.image === "string" || p.image === null) state.pitch.image = p.image;
      if (typeof p.keepAspect === "boolean") state.pitch.keepAspect = p.keepAspect;
      if (typeof p.sizeX === "number") state.pitch.sizeX = p.sizeX;
      if (typeof p.sizeY === "number") state.pitch.sizeY = p.sizeY;
      if (typeof p.offsetX === "number") state.pitch.offsetX = p.offsetX;
      if (typeof p.offsetY === "number") state.pitch.offsetY = p.offsetY;
    }
    if (parsed.outside) {
      var o = parsed.outside;
      if (typeof o.enabled === "boolean") state.outside.enabled = o.enabled;
      if (typeof o.mode === "string") state.outside.mode = o.mode;
      if (typeof o.color === "string") state.outside.color = o.color;
      if (typeof o.image === "string" || o.image === null) state.outside.image = o.image;
    }
    if (parsed.lines) {
      var l = parsed.lines;
      if (typeof l.enabled === "boolean") state.lines.enabled = l.enabled;
      if (typeof l.color === "string") state.lines.color = l.color;
    }
    refreshPitchImg();
    refreshOutsideImg();
  }
  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }
  function notify() {
    persist();
    try {
      window.dispatchEvent(new Event(CHANGE_EVENT));
    } catch (e) {}
  }
  function clamp(v, lo, hi, dflt) {
    var n = Number(v);
    if (isNaN(n)) return dflt;
    return Math.max(lo, Math.min(hi, n));
  }
  function computePitchRect(bounds) {
    var fw = bounds.maxX - bounds.minX;
    var fh = bounds.maxY - bounds.minY;
    var sizeX = typeof state.pitch.sizeX === "number" ? state.pitch.sizeX : 100;
    var sizeY = typeof state.pitch.sizeY === "number" ? state.pitch.sizeY : 100;
    var dw = fw * (sizeX / 100);
    var dh = fh * (sizeY / 100);
    if (state.pitch.keepAspect && pitchImgEl && pitchImgEl.naturalWidth && pitchImgEl.naturalHeight) {
      dh = dw * (pitchImgEl.naturalHeight / pitchImgEl.naturalWidth);
    }
    var offX = typeof state.pitch.offsetX === "number" ? state.pitch.offsetX : 50;
    var offY = typeof state.pitch.offsetY === "number" ? state.pitch.offsetY : 50;
    var dx = bounds.minX + (fw - dw) * (offX / 100);
    var dy = bounds.minY + (fh - dh) * (offY / 100);
    return {
      dx: dx,
      dy: dy,
      dw: dw,
      dh: dh
    };
  }
  var bounds = null;
  var pixelBounds = null; // mismo path, pero proyectado a espacio de pixeles del canvas
  var lastPitchBounds = null;
  // Algunas canchas pintan mas de una zona con patron repetido y tamano
  // "normal" (no gigante) en el mismo frame -- por ejemplo el area chica/
  // grande del arco, ademas del pasto completo. Si nos quedabamos con el
  // ULTIMO fill que matcheaba, a veces terminaba ganando esa area en vez de
  // la cancha entera -> la explosion aparecia pegada al borde del area en
  // vez de en el arco real. Ahora nos quedamos con el de MAYOR superficie
  // (la cancha completa siempre es mas grande que un area dentro de ella), y
  // solo lo reemplazamos si aparece algo mas grande, o si cambio el tamano
  // del canvas (sala/cancha nueva, hay que volver a converger).
  var bestPitchArea = 0;
  var bestCanvasW = 0;
  var bestCanvasH = 0;
  function resetBounds() {
    bounds = null;
    pixelBounds = null;
  }
  // El juego dibuja la cancha bajo su propia matriz (translate/scale) antes de
  // llamar a moveTo/lineTo/etc. `bounds` se sigue guardando en espacio local
  // (crudo) porque computePitchRect/clip()/drawImage() de mas abajo corren
  // bajo esa misma transform y necesitan esos valores tal cual. Pero para
  // exponer la posicion del arco hacia afuera (goal-explosion-skin.js, que
  // dibuja en un canvas overlay con transform identidad) necesitamos la
  // version ya proyectada a pixeles reales -> por eso pixelBounds, usando
  // ctx.getTransform() vigente en cada punto.
  function applyCTM(m, x, y) {
    if (!m) return { x: x, y: y };
    return {
      x: m.a * x + m.c * y + m.e,
      y: m.b * x + m.d * y + m.f
    };
  }
  function getCTM(ctx) {
    try {
      if (ctx && typeof ctx.getTransform === "function") return ctx.getTransform();
    } catch (e) {}
    return null;
  }
  function extendPixel(px, py) {
    if (!pixelBounds) {
      pixelBounds = { minX: px, minY: py, maxX: px, maxY: py };
      return;
    }
    if (px < pixelBounds.minX) pixelBounds.minX = px;
    if (py < pixelBounds.minY) pixelBounds.minY = py;
    if (px > pixelBounds.maxX) pixelBounds.maxX = px;
    if (py > pixelBounds.maxY) pixelBounds.maxY = py;
  }
  function extend(ctx, x, y) {
    if (typeof x !== "number" || typeof y !== "number" || isNaN(x) || isNaN(y)) return;
    if (!bounds) {
      bounds = { minX: x, minY: y, maxX: x, maxY: y };
    } else {
      if (x < bounds.minX) bounds.minX = x;
      if (y < bounds.minY) bounds.minY = y;
      if (x > bounds.maxX) bounds.maxX = x;
      if (y > bounds.maxY) bounds.maxY = y;
    }
    var p = applyCTM(getCTM(ctx), x, y);
    extendPixel(p.x, p.y);
  }
  function hookPathTracking(proto) {
    var origBeginPath = proto.beginPath;
    proto.beginPath = function() {
      resetBounds();
      return origBeginPath.apply(this, arguments);
    };
    var origMoveTo = proto.moveTo;
    proto.moveTo = function(x, y) {
      extend(this, x, y);
      return origMoveTo.apply(this, arguments);
    };
    var origLineTo = proto.lineTo;
    proto.lineTo = function(x, y) {
      extend(this, x, y);
      return origLineTo.apply(this, arguments);
    };
    var origRect = proto.rect;
    proto.rect = function(x, y, w, h) {
      extend(this, x, y);
      extend(this, x + w, y + h);
      return origRect.apply(this, arguments);
    };
    var origArcTo = proto.arcTo;
    proto.arcTo = function(x1, y1, x2, y2) {
      extend(this, x1, y1);
      extend(this, x2, y2);
      return origArcTo.apply(this, arguments);
    };
    var origArc = proto.arc;
    proto.arc = function(x, y, r) {
      extend(this, x - r, y - r);
      extend(this, x + r, y + r);
      return origArc.apply(this, arguments);
    };
    var origQuad = proto.quadraticCurveTo;
    if (origQuad) {
      proto.quadraticCurveTo = function(cx, cy, x, y) {
        extend(this, cx, cy);
        extend(this, x, y);
        return origQuad.apply(this, arguments);
      };
    }
    var origBezier = proto.bezierCurveTo;
    if (origBezier) {
      proto.bezierCurveTo = function(c1x, c1y, c2x, c2y, x, y) {
        extend(this, c1x, c1y);
        extend(this, c2x, c2y);
        extend(this, x, y);
        return origBezier.apply(this, arguments);
      };
    }
  }
  function isRepeating(mode) {
    return mode === null || mode === undefined || mode === "" || mode === "repeat" || mode === "repeat-x" || mode === "repeat-y";
  }
  var fieldPatternMark = {};
  function hookCreatePattern(proto) {
    var origCreatePattern = proto.createPattern;
    proto.createPattern = function(image, repetition) {
      var pat = origCreatePattern.apply(this, arguments);
      if (pat && isRepeating(repetition)) {
        try {
          pat.__HaxNewField = fieldPatternMark;
        } catch (e) {}
      }
      return pat;
    };
  }
  function hookFill(proto) {
    var origFill = proto.fill;
    proto.fill = function() {
      var style = this.fillStyle;
      if (bounds && style && style.__HaxNewField === fieldPatternMark) {
        var w = bounds.maxX - bounds.minX;
        var h = bounds.maxY - bounds.minY;
        // Solo confiamos en este fill como "la cancha" si su tamano entra en
        // rango normal. Algunas canchas custom tambien pintan el fondo/exterior
        // con un patron repetido (mismo __HaxNewField), y si ese fill pasa
        // DESPUES del pasto en el mismo frame, nos pisaba lastPitchBounds con
        // un area gigante (casi toda la pantalla) -> el punto medio terminaba
        // cayendo en el centro del canvas. Por eso el filtro de tamano va
        // primero, antes de guardar nada.
        if (w > 0 && h > 0 && w < MAX_STRETCH_SIZE && h < MAX_STRETCH_SIZE) {
          var canvasEl = this.canvas;
          if (canvasEl && (canvasEl.width !== bestCanvasW || canvasEl.height !== bestCanvasH)) {
            // Cambio el tamano del canvas (resize o cancha nueva) -> el
            // "mejor" anterior ya no es confiable, arrancamos de nuevo.
            bestPitchArea = 0;
            bestCanvasW = canvasEl.width;
            bestCanvasH = canvasEl.height;
          }
          var area = w * h;
          if (area >= bestPitchArea * 0.98) {
            bestPitchArea = area;
            if (pixelBounds) {
              lastPitchBounds = { minX: pixelBounds.minX, minY: pixelBounds.minY, maxX: pixelBounds.maxX, maxY: pixelBounds.maxY };
            }
          }
          if (state.pitch.mode === "image" && pitchImgReady && pitchImgEl) {
            var rect = computePitchRect(bounds);
            if (rect.dw > 0 && rect.dh > 0) {
              this.save();
              try {
                this.clip();
                this.imageSmoothingEnabled = true;
                if ("imageSmoothingQuality" in this) this.imageSmoothingQuality = "high";
                this.drawImage(pitchImgEl, rect.dx, rect.dy, rect.dw, rect.dh);
              } finally {
                this.restore();
              }
              return;
            }
          }
          if (state.pitch.mode === "color" && state.pitch.color) {
            var oldStyle = this.fillStyle;
            this.fillStyle = state.pitch.color;
            try {
              origFill.call(this);
            } finally {
              this.fillStyle = oldStyle;
            }
            return;
          }
        } else if (w >= MAX_STRETCH_SIZE || h >= MAX_STRETCH_SIZE) {
          if (state.outside.enabled && state.outside.mode === "color" && state.outside.color) {
            var old2 = this.fillStyle;
            this.fillStyle = state.outside.color;
            try {
              origFill.call(this);
            } finally {
              this.fillStyle = old2;
            }
            return;
          }
        }
      }
      return origFill.apply(this, arguments);
    };
  }
  function hookFillRect(proto) {
    var origFillRect = proto.fillRect;
    proto.fillRect = function(x, y, w, h) {
      var canvas = this.canvas;
      if (state.outside.enabled && canvas && x === 0 && y === 0 && w === canvas.width && h === canvas.height) {
        if (state.outside.mode === "image" && outsideImgReady && outsideImgEl) {
          var iw = outsideImgEl.naturalWidth || 1;
          var ih = outsideImgEl.naturalHeight || 1;
          var scale = Math.max(w / iw, h / ih);
          var dw = iw * scale;
          var dh = ih * scale;
          var dx = (w - dw) / 2;
          var dy = (h - dh) / 2;
          this.save();
          try {
            this.imageSmoothingEnabled = true;
            if ("imageSmoothingQuality" in this) this.imageSmoothingQuality = "high";
            this.drawImage(outsideImgEl, dx, dy, dw, dh);
          } finally {
            this.restore();
          }
          return;
        }
        if (state.outside.mode === "color" && state.outside.color) {
          var old = this.fillStyle;
          this.fillStyle = state.outside.color;
          var result = origFillRect.apply(this, arguments);
          this.fillStyle = old;
          return result;
        }
      }
      return origFillRect.apply(this, arguments);
    };
  }
  function hookStrokeStyle(proto) {
    var desc = Object.getOwnPropertyDescriptor(proto, "strokeStyle");
    if (!desc || !desc.configurable || !desc.get || !desc.set) return;
    Object.defineProperty(proto, "strokeStyle", {
      configurable: true,
      enumerable: desc.enumerable,
      get: function() {
        return desc.get.call(this);
      },
      set: function(v) {
        if (state.lines.enabled && state.lines.color && typeof v === "string" && NATIVE_LINE_COLORS.indexOf(v) !== -1) {
          return desc.set.call(this, state.lines.color);
        }
        return desc.set.call(this, v);
      }
    });
  }
  function hookCanvas() {
    var proto = CanvasRenderingContext2D.prototype;
    if (proto.__HaxNewFieldHooked) return;
    proto.__HaxNewFieldHooked = true;
    hookPathTracking(proto);
    hookCreatePattern(proto);
    hookFill(proto);
    hookFillRect(proto);
    hookStrokeStyle(proto);
  }
  window.HaxNewFieldSkin = {
    getPitch: function() {
      return {
        mode: state.pitch.mode,
        color: state.pitch.color,
        hasImage: !!state.pitch.image,
        previewUrl: state.pitch.image,
        keepAspect: state.pitch.keepAspect,
        sizeX: state.pitch.sizeX,
        sizeY: state.pitch.sizeY,
        offsetX: state.pitch.offsetX,
        offsetY: state.pitch.offsetY
      };
    },
    setPitchMode: function(mode) {
      if (mode !== "default" && mode !== "color" && mode !== "image") return;
      state.pitch.mode = mode;
      if (mode !== "default") hookCanvas();
      notify();
    },
    setPitchColor: function(color) {
      if (typeof color !== "string" || !color) return;
      state.pitch.color = color;
      notify();
    },
    pickPitchImage: function() {
      var input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp,image/gif";
      input.onchange = function() {
        var file = input.files && input.files[0];
        if (!file) return;
        var reader = new FileReader;
        reader.onload = function() {
          state.pitch.image = String(reader.result || "");
          refreshPitchImg();
          notify();
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    clearPitchImage: function() {
      state.pitch.image = null;
      pitchImgEl = null;
      pitchImgReady = false;
      notify();
    },
    applyPresetPitchImage: function(url) {
      if (typeof url !== "string" || !url) return;
      state.pitch.image = url;
      state.pitch.mode = "image";
      hookCanvas();
      refreshPitchImg();
      notify();
    },
    setPitchKeepAspect: function(v) {
      state.pitch.keepAspect = !!v;
      notify();
    },
    setPitchSizeX: function(v) {
      state.pitch.sizeX = clamp(v, 10, 400, state.pitch.sizeX);
      notify();
    },
    setPitchSizeY: function(v) {
      state.pitch.sizeY = clamp(v, 10, 400, state.pitch.sizeY);
      notify();
    },
    setPitchOffsetX: function(v) {
      state.pitch.offsetX = clamp(v, 0, 100, state.pitch.offsetX);
      notify();
    },
    setPitchOffsetY: function(v) {
      state.pitch.offsetY = clamp(v, 0, 100, state.pitch.offsetY);
      notify();
    },
    getOutside: function() {
      return {
        enabled: state.outside.enabled,
        mode: state.outside.mode,
        color: state.outside.color,
        hasImage: !!state.outside.image,
        previewUrl: state.outside.image
      };
    },
    setOutsideEnabled: function(v) {
      state.outside.enabled = !!v;
      if (v) hookCanvas();
      notify();
    },
    setOutsideMode: function(mode) {
      if (mode !== "color" && mode !== "image") return;
      state.outside.mode = mode;
      notify();
    },
    setOutsideColor: function(color) {
      if (typeof color !== "string" || !color) return;
      state.outside.color = color;
      notify();
    },
    pickOutsideImage: function() {
      var input = document.createElement("input");
      input.type = "file";
      input.accept = "image/jpeg,image/png,image/webp,image/gif";
      input.onchange = function() {
        var file = input.files && input.files[0];
        if (!file) return;
        var reader = new FileReader;
        reader.onload = function() {
          state.outside.image = String(reader.result || "");
          refreshOutsideImg();
          notify();
        };
        reader.readAsDataURL(file);
      };
      input.click();
    },
    clearOutsideImage: function() {
      state.outside.image = null;
      outsideImgEl = null;
      outsideImgReady = false;
      notify();
    },
    applyPresetOutsideImage: function(url) {
      if (typeof url !== "string" || !url) return;
      state.outside.image = url;
      state.outside.mode = "image";
      hookCanvas();
      refreshOutsideImg();
      notify();
    },
    getLines: function() {
      return {
        enabled: state.lines.enabled,
        color: state.lines.color
      };
    },
    setLinesEnabled: function(v) {
      state.lines.enabled = !!v;
      if (v) hookCanvas();
      notify();
    },
    setLinesColor: function(color) {
      if (typeof color !== "string" || !color) return;
      state.lines.color = color;
      notify();
    },
    getPitchBounds: function() {
      return lastPitchBounds ? {
        minX: lastPitchBounds.minX,
        minY: lastPitchBounds.minY,
        maxX: lastPitchBounds.maxX,
        maxY: lastPitchBounds.maxY
      } : null;
    }
  };
  loadState();
  // Antes solo se hookeaba el canvas si había alguna customización activa.
  // goal-explosion-skin.js necesita getPitchBounds() siempre disponible
  // (para ubicar los arcos), así que ahora se hookea siempre; hookFill
  // sigue sin alterar el dibujo real salvo que el modo sea "image"/"color".
  hookCanvas();
  window.addEventListener("storage", function(e) {
    if (!e || e.key === null || e.key === STORAGE_KEY) loadState();
  });
  console.log("[HaxNew] Field skin cargado (pasto, afuera de la cancha y líneas — en vivo, sin recargar)");
})();