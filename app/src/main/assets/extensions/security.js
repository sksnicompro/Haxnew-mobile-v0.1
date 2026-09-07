(function() {
  "use strict";
  const CONFIG = {
    allowedHost: "haxball.com/play",
    allowedParam: "?c=",
    cssId: "security-pro-css"
  };
  window.addEventListener("keydown", function(e) {
    if (e.key === "F1") {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);
  Object.defineProperty(window, "onbeforeunload", {
    get: () => null,
    set: () => {},
    configurable: false
  });
  window.addEventListener("beforeunload", function(e) {
    delete e.returnValue;
  });
  document.addEventListener("click", function(e) {
    const link = e.target.closest("a");
    if (!link || !link.href) return;
    const href = link.href;
    if (href.includes(CONFIG.allowedHost) && href.includes(CONFIG.allowedParam)) return;
    const isWebProtocol = href.startsWith("http");
    const isInternal = href.startsWith("#") || href.startsWith("javascript:");
    if (isWebProtocol && !isInternal) {
      e.preventDefault();
      e.stopPropagation();
      window.open(href, "_blank", "noopener,noreferrer");
    }
  }, true);
  if (window.Injector) {
    Injector.injectCSS(CONFIG.cssId, `\n            html, body {\n                overflow: hidden !important;\n                touch-action: none;\n            }\n            ::-webkit-scrollbar { display: none !important; }\n            body {\n                user-select: none !important;\n                -webkit-user-select: none !important;\n                -webkit-drag: none;\n            }\n            .chatbox-view, .log, .log-contents,\n            input, textarea, [contenteditable="true"] {\n                user-select: text !important;\n                -webkit-user-select: text !important;\n            }\n        `);
    if (Injector.isMainFrame()) {
      try {
        const left = Math.max(0, Math.round((screen.availWidth - window.outerWidth) / 2));
        const top = Math.max(0, Math.round((screen.availHeight - window.outerHeight) / 2));
        window.moveTo(left, top);
      } catch (_) {}
    }
  }
})();