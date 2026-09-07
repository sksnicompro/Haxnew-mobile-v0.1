(function() {
  "use strict";
  if (window.__HaxNewPositionDrag) return;
  window.__HaxNewPositionDrag = true;
  if (typeof Injector === "undefined" || Injector.isMainFrame && Injector.isMainFrame()) return;

  // ------------------------------------------------------------------
  // HaxNewDrag: motor genérico de "mover con guías" (estilo Canva) que
  // comparten todos los paneles de enhancements (scoreboard, keystroke,
  // clock, ping, fps, room-info, spotify, screen-video, etc).
  //
  // Cada skin se registra una vez con register({...}) pasando getters y
  // setters sobre su propio offsetX/offsetY (los que ya expone su objeto
  // window.HaxNewXxx). El motor no conoce ni clampea rangos: cada skin
  // clampea como ya lo hacía. El motor solo calcula deltas, snapping y
  // dibuja las guías.
  // ------------------------------------------------------------------

  var GUIDE_COLOR = "#2fb2ff"; // celeste, estilo guías de Canva
  var SNAP_PX = 6;             // umbral de imán en pantalla
  var EDGE_MARGIN = 16;        // margen estándar que ya usan los demás HUDs (fps, ping, clock, etc.)

  var registry = {};      // id -> { id, label, getEl, getOffset, setOffset, reset }
  var moveModeOn = {};    // id -> bool (si ese panel está en modo "mover" ahora)

  // ---------------- capa compartida de guías ----------------
  var guideLayer = null;
  function ensureGuideLayer() {
    if (guideLayer && guideLayer.isConnected) return guideLayer;
    guideLayer = document.createElement("div");
    guideLayer.id = "hbxdrag-guides";
    guideLayer.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483001;";
    (document.body || document.documentElement).appendChild(guideLayer);
    return guideLayer;
  }
  function clearGuides() {
    if (guideLayer) guideLayer.innerHTML = "";
  }
  function drawLine(orientation, pos, label) {
    var line = document.createElement("div");
    if (orientation === "v") {
      line.style.cssText = "position:absolute;top:0;bottom:0;left:" + pos + "px;width:0;border-left:1px dashed " + GUIDE_COLOR + ";box-shadow:0 0 6px rgba(47,178,255,.6);";
    } else {
      line.style.cssText = "position:absolute;left:0;right:0;top:" + pos + "px;height:0;border-top:1px dashed " + GUIDE_COLOR + ";box-shadow:0 0 6px rgba(47,178,255,.6);";
    }
    guideLayer.appendChild(line);

    if (!label) return;
    var chip = document.createElement("div");
    chip.textContent = label;
    chip.style.cssText = "position:absolute;background:" + GUIDE_COLOR + ";color:#0b1520;font:700 10.5px/1 -apple-system,Segoe UI,Roboto,sans-serif;padding:3px 7px;border-radius:5px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.4);";
    if (orientation === "v") {
      chip.style.left = pos + "px";
      chip.style.top = "10px";
      chip.style.transform = "translateX(-50%)";
    } else {
      chip.style.top = pos + "px";
      chip.style.left = "10px";
      chip.style.transform = "translateY(-50%)";
    }
    guideLayer.appendChild(chip);
  }

  // ---------------- badge flotante con coordenadas ----------------
  var coordBadge = null;
  function ensureCoordBadge() {
    if (coordBadge && coordBadge.isConnected) return coordBadge;
    coordBadge = document.createElement("div");
    coordBadge.id = "hbxdrag-coords";
    coordBadge.style.cssText = "position:fixed;pointer-events:none;z-index:2147483002;background:#14151a;border:1px solid " + GUIDE_COLOR + ";color:#fff;font:600 11px/1 -apple-system,Segoe UI,Roboto,sans-serif;padding:4px 7px;border-radius:6px;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,.5);display:none;";
    (document.body || document.documentElement).appendChild(coordBadge);
    return coordBadge;
  }
  function showCoordBadge(clientX, clientY, x, y) {
    var b = ensureCoordBadge();
    b.textContent = "X: " + Math.round(x) + "px  Y: " + Math.round(y) + "px";
    b.style.left = clientX + 14 + "px";
    b.style.top = clientY + 14 + "px";
    b.style.display = "block";
  }
  function hideCoordBadge() {
    if (coordBadge) coordBadge.style.display = "none";
  }

  // ---------------- registro de paneles ----------------
  function register(def) {
    if (!def || !def.id) return;
    registry[def.id] = def;
  }
  function unregister(id) {
    delete registry[id];
    delete moveModeOn[id];
  }

  function activeIds() {
    // paneles registrados cuyo elemento existe ahora mismo en el DOM
    return Object.keys(registry).filter(function(id) {
      var d = registry[id];
      var el = d.getEl && d.getEl();
      return !!el;
    });
  }

  function collectSnapTargets(excludeId) {
    var vw = window.innerWidth, vh = window.innerHeight;
    // Cada objetivo lleva un "label" para poder mostrar qué se está
    // recomendando cuando el elemento pasa cerca (tipo Canva): centro,
    // tercios, cuartos, margen estándar, y bordes/centros de los demás
    // paneles activos.
    var v = [
      { pos: vw / 2, label: "Centro" },
      { pos: vw / 3, label: "Tercio" },
      { pos: vw * 2 / 3, label: "Tercio" },
      { pos: vw / 4, label: "Cuarto" },
      { pos: vw * 3 / 4, label: "Cuarto" },
      { pos: EDGE_MARGIN, label: "Margen" },
      { pos: vw - EDGE_MARGIN, label: "Margen" }
    ];
    var h = [
      { pos: vh / 2, label: "Centro" },
      { pos: vh / 3, label: "Tercio" },
      { pos: vh * 2 / 3, label: "Tercio" },
      { pos: vh / 4, label: "Cuarto" },
      { pos: vh * 3 / 4, label: "Cuarto" },
      { pos: EDGE_MARGIN, label: "Margen" },
      { pos: vh - EDGE_MARGIN, label: "Margen" }
    ];
    activeIds().forEach(function(id) {
      if (id === excludeId) return;
      var d = registry[id];
      var el = d.getEl();
      var r = el.getBoundingClientRect();
      var lbl = d.label || "otro panel";
      v.push(
        { pos: r.left, label: "Borde de " + lbl },
        { pos: r.left + r.width / 2, label: "Centro de " + lbl },
        { pos: r.right, label: "Borde de " + lbl }
      );
      h.push(
        { pos: r.top, label: "Borde de " + lbl },
        { pos: r.top + r.height / 2, label: "Centro de " + lbl },
        { pos: r.bottom, label: "Borde de " + lbl }
      );
    });
    return { v: v, h: h };
  }

  // Dado un valor actual (borde/centro/borde) contra una lista de targets
  // {pos, label}, devuelve el ajuste (delta) necesario para "imantar" y el
  // label de a qué se está alineando, o null si ninguno cae dentro del
  // umbral. Solo aplica el primer match para no pelear ejes.
  function findSnap(edges, targets) {
    var best = null;
    edges.forEach(function(edge) {
      targets.forEach(function(t) {
        var diff = t.pos - edge.pos;
        if (Math.abs(diff) <= SNAP_PX && (best === null || Math.abs(diff) < Math.abs(best.diff))) {
          best = { diff: diff, guide: t.pos, label: t.label };
        }
      });
    });
    return best;
  }

  var dragState = null;

  function startDrag(id, downEvent) {
    var def = registry[id];
    if (!def) return;
    var el = def.getEl && def.getEl();
    if (!el) return;
    downEvent.preventDefault();

    var startOffset = def.getOffset() || { x: 0, y: 0 };
    var startRect = el.getBoundingClientRect();
    var startPX = downEvent.clientX, startPY = downEvent.clientY;

    ensureGuideLayer();
    dragState = { id: id };
    document.body.style.cursor = "move";

    function onMove(e) {
      var dx = e.clientX - startPX;
      var dy = e.clientY - startPY;
      var newX = startOffset.x + dx;
      var newY = startOffset.y + dy;

      var w = startRect.width, hgt = startRect.height;
      var left = startRect.left + dx, top = startRect.top + dy;
      var edgesX = [
        { pos: left, off: 0 },
        { pos: left + w / 2, off: w / 2 },
        { pos: left + w, off: w }
      ];
      var edgesY = [
        { pos: top, off: 0 },
        { pos: top + hgt / 2, off: hgt / 2 },
        { pos: top + hgt, off: hgt }
      ];

      var targets = collectSnapTargets(id);
      clearGuides();

      var snapX = findSnap(edgesX, targets.v);
      if (snapX) {
        newX += snapX.diff;
        drawLine("v", snapX.guide, snapX.label);
      }
      var snapY = findSnap(edgesY, targets.h);
      if (snapY) {
        newY += snapY.diff;
        drawLine("h", snapY.guide, snapY.label);
      }

      newX = Math.round(newX);
      newY = Math.round(newY);
      def.setOffset(newX, newY);
      showCoordBadge(e.clientX, e.clientY, newX, newY);
    }

    function onUp() {
      clearGuides();
      hideCoordBadge();
      document.body.style.cursor = "";
      dragState = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
  }

  // ---------------- modo "mover": handle propio superpuesto ----------------
  // Enganchar el pointerdown directamente en el elemento del juego (ej:
  // .bar-container) resultó frágil: aunque visualmente esté "arriba" por
  // z-index, el motor del juego pinta con su propio canvas/stacking
  // context y puede quedarse con los clicks igual, más allá de
  // pointer-events. En vez de pelear contra eso, creamos un div propio
  // ("handle"), 100% nuestro, que se superpone exactamente sobre el
  // elemento y sigue su posición/tamaño en vivo (rAF) mientras dura el
  // modo mover. El drag se engancha en el handle, nunca en el DOM del
  // juego — así siempre gana el nuestro.
  var HANDLE_Z = 2147483000;
  var HANDLE_STYLE_ID = "hbxdrag-handle-style";
  function ensureHandleStyle() {
    if (document.getElementById(HANDLE_STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = HANDLE_STYLE_ID;
    style.textContent = ".hbxdrag-handle{position:fixed;box-sizing:border-box;outline:2px dashed " + GUIDE_COLOR + " !important;outline-offset:3px !important;cursor:move !important;touch-action:none;}";
    (document.head || document.documentElement).appendChild(style);
  }

  function attachHandlers(def) {
    if (def._onPointerDown) return; // ya tiene handler puesto
    def._onPointerDown = function(e) {
      if (e.button !== undefined && e.button !== 0) return;
      startDrag(def.id, e);
    };
  }

  // Algunos wrappers (ej: .bar-container del scoreboard) tienen una
  // transition en top/transform para el movimiento animado normal. Si la
  // dejamos puesta mientras arrastramos, cada pointermove queda
  // "amortiguado" por esa animación y se siente trabado / que no responde.
  // La sacamos (inline, important) solo mientras dura el modo mover.
  var transitionFixes = {}; // id -> {el, prevValue, prevPriority}
  function killTransition(el) {
    var prevValue = el.style.getPropertyValue("transition");
    var prevPriority = el.style.getPropertyPriority("transition");
    el.style.setProperty("transition", "none", "important");
    return { el: el, prevValue: prevValue, prevPriority: prevPriority };
  }
  function restoreTransition(fix) {
    if (!fix) return;
    if (fix.prevValue) {
      fix.el.style.setProperty("transition", fix.prevValue, fix.prevPriority);
    } else {
      fix.el.style.removeProperty("transition");
    }
  }

  var handles = {}; // id -> { handleEl, rafId }

  function syncHandle(id) {
    var h = handles[id];
    if (!h) return; // se apagó el modo mover mientras tanto
    var def = registry[id];
    var el = def && def.getEl && def.getEl();
    if (!el) {
      // El elemento desapareció de la pantalla (ej: terminó la partida).
      // Salimos del modo mover en vez de quedar con un handle fantasma.
      disableMoveMode(id);
      if (window.showToast) {
        window.showToast("Dejamos de ver " + (def && def.label || "el elemento") + " en pantalla, se apagó el modo mover.", "info");
      }
      if (window.HaxNewDrag) window.HaxNewDrag.hideDoneButton();
      return;
    }
    var r = el.getBoundingClientRect();
    h.handleEl.style.left = r.left + "px";
    h.handleEl.style.top = r.top + "px";
    h.handleEl.style.width = r.width + "px";
    h.handleEl.style.height = r.height + "px";
    h.rafId = requestAnimationFrame(function() {
      syncHandle(id);
    });
  }

  function enableMoveMode(id) {
    var def = registry[id];
    if (!def) return false;
    var el = def.getEl && def.getEl();
    if (!el) {
      // No está en pantalla ahora mismo (ej: el scoreboard solo existe
      // durante una partida en curso, no en la sala/lobby). Avisamos en
      // vez de fallar en silencio.
      if (window.showToast) {
        window.showToast("No encontramos " + (def.label || "el elemento") + " en pantalla. Tenés que estar en una partida para poder moverlo.", "error");
      }
      return false;
    }
    ensureHandleStyle();
    attachHandlers(def);
    transitionFixes[id] = killTransition(el);
    var handleEl = document.createElement("div");
    handleEl.className = "hbxdrag-handle";
    handleEl.style.zIndex = String(HANDLE_Z);
    handleEl.addEventListener("pointerdown", def._onPointerDown);
    (document.body || document.documentElement).appendChild(handleEl);
    handles[id] = { handleEl: handleEl, rafId: null };
    syncHandle(id);
    moveModeOn[id] = true;
    return true;
  }

  function disableMoveMode(id) {
    var def = registry[id];
    moveModeOn[id] = false;
    var h = handles[id];
    if (h) {
      if (h.rafId) cancelAnimationFrame(h.rafId);
      if (h.handleEl && h.handleEl.parentNode) h.handleEl.parentNode.removeChild(h.handleEl);
      delete handles[id];
    }
    if (def) {
      restoreTransition(transitionFixes[id]);
    }
    delete transitionFixes[id];
  }

  function isMoveModeOn(id) {
    return !!moveModeOn[id];
  }

  // Activa el modo mover en TODOS los paneles activos (con elemento
  // presente en pantalla ahora mismo) a la vez, cada uno con su propio
  // handle independiente — no es un movimiento agrupado por delta, es
  // que todos quedan arrastrables al mismo tiempo durante la misma
  // sesión de "arreglar posiciones". Por default, tocar "Mover en
  // pantalla" en cualquier panel habilita esto para todos.
  function enableMoveModeAll() {
    var enabledAny = false;
    activeIds().forEach(function(id) {
      if (moveModeOn[id]) {
        enabledAny = true;
        return;
      }
      if (enableMoveMode(id)) enabledAny = true;
    });
    return enabledAny;
  }
  function disableMoveModeAll() {
    Object.keys(registry).forEach(function(id) {
      if (moveModeOn[id]) disableMoveMode(id);
    });
  }

  // ---------------- ir a la pestaña de Sala (header vive en el frame padre) ----------------
  function goToRoom() {
    try {
      window.parent && window.parent.postMessage({ action: "ULT_GO_HOME" }, "*");
    } catch (e) {}
  }

  // ---------------- barra flotante "Listo" mientras se está moviendo ----------------
  var doneBar = null;
  var doneBarCb = null;
  function ensureDoneBar() {
    if (doneBar && doneBar.isConnected) return doneBar;
    doneBar = document.createElement("div");
    doneBar.id = "hbxdrag-donebar";
    doneBar.style.cssText = "position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:2147483003;display:none;align-items:center;gap:12px;background:#14151a;border:1px solid rgba(255,255,255,0.10);border-radius:999px;padding:9px 10px 9px 16px;box-shadow:0 10px 28px rgba(0,0,0,.55);font:500 12.5px/1 -apple-system,Segoe UI,Roboto,sans-serif;color:#fff;";
    var hint = document.createElement("span");
    hint.id = "hbxdrag-donebar-hint";
    hint.textContent = "Arrastrá el elemento para moverlo";
    hint.style.cssText = "color:rgba(255,255,255,0.65);white-space:nowrap;";
    var btn = document.createElement("button");
    btn.id = "hbxdrag-donebar-btn";
    btn.type = "button";
    btn.textContent = "Listo";
    btn.style.cssText = "background:#c9a227;color:#14151a;border:none;border-radius:999px;padding:7px 16px;font-weight:700;font-size:12.5px;cursor:pointer;white-space:nowrap;";
    btn.onclick = function() {
      if (doneBarCb) doneBarCb();
    };
    doneBar.appendChild(hint);
    doneBar.appendChild(btn);
    (document.body || document.documentElement).appendChild(doneBar);
    return doneBar;
  }
  function showDoneButton(onDone, label) {
    var bar = ensureDoneBar();
    doneBarCb = typeof onDone === "function" ? onDone : null;
    var hint = bar.querySelector("#hbxdrag-donebar-hint");
    if (hint && label) hint.textContent = label;
    bar.style.display = "flex";
  }
  function hideDoneButton() {
    if (doneBar) doneBar.style.display = "none";
    doneBarCb = null;
  }

  window.HaxNewDrag = {
    register: register,
    unregister: unregister,
    enableMoveMode: enableMoveMode,
    disableMoveMode: disableMoveMode,
    enableMoveModeAll: enableMoveModeAll,
    disableMoveModeAll: disableMoveModeAll,
    isMoveModeOn: isMoveModeOn,
    goToRoom: goToRoom,
    showDoneButton: showDoneButton,
    hideDoneButton: hideDoneButton,
    isDragging: function() {
      return !!dragState;
    }
  };
})();