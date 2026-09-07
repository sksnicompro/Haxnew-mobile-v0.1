"use strict";
// render-keepalive.js
//
// Por que existe: cuando la pantalla no cambia (jugador quieto, sin
// animaciones visibles), Chromium deja de pedir frames nuevos - deja de
// llamar a requestAnimationFrame porque "no hay nada para pintar". Eso esta
// bien para bateria/CPU, pero al volver a moverte, el pipeline de render
// tiene que "despertar" de nuevo, y ese primer arranque puede sentirse
// como un salto/tranco de un frame.
//
// Que hace esto: un canvas de 1x1 pixel, invisible (fuera de pantalla,
// opacity 0, pointer-events none), que se redibuja todo el tiempo via
// requestAnimationFrame - alternando un valor de pixel imperceptible.
// Esto le da a Chromium una razon constante para no dejar nunca "dormido"
// el pipeline de composicion, sin gastar recursos reales (es 1 pixel) y
// sin mostrarse en pantalla ni interferir con el juego.
(function () {
  if (window.__RENDER_KEEPALIVE_ACTIVE__) return;
  window.__RENDER_KEEPALIVE_ACTIVE__ = true;

  function start() {
    const canvas = document.createElement("canvas");
    canvas.width = 2;
    canvas.height = 2;
    // IMPORTANTE: tiene que quedar DENTRO del viewport para que Chromium
    // no lo descarte del compositor (elementos fuera de pantalla, o con
    // display:none/visibility:hidden, suelen quedar "culled" y dejan de
    // pintarse aunque el JS siga corriendo - eso invalidaba el intento
    // anterior, que lo posicionaba en left:-9999px).
    canvas.style.position = "fixed";
    canvas.style.right = "0";
    canvas.style.bottom = "0";
    canvas.style.width = "2px";
    canvas.style.height = "2px";
    canvas.style.opacity = "0.01"; // casi invisible, pero no 0 ni display:none
    canvas.style.zIndex = "2147483647";
    canvas.style.pointerEvents = "none";
    (document.body || document.documentElement).appendChild(canvas);

    const ctx = canvas.getContext("2d", { alpha: true });
    let toggle = false;

    function tick() {
      toggle = !toggle;
      // Cambio minimo real (no un no-op) para que Chromium no lo optimice
      // afuera del pipeline de composicion.
      ctx.clearRect(0, 0, 2, 2);
      ctx.fillStyle = toggle ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.6)";
      ctx.fillRect(0, 0, 2, 2);
      window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener("DOMContentLoaded", start);
  }
})();
