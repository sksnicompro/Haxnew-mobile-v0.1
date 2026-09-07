(function() {
  "use strict";
  if (window.__HaxNewBallGallery) return;
  window.__HaxNewBallGallery = true;
  function t(key) {
    return window.__t ? window.__t(key) : key;
  }
  var ASSET_BASE = function() {
    try {
      if (document.currentScript && document.currentScript.dataset.assetsBase) {
        return document.currentScript.dataset.assetsBase;
      }
    } catch (e) {}
    return "https://appassets.androidplatform.net/assets/balls/";
  }();
  var CATALOG = [ {
    id: "world-cup",
    label: t("Mundiales"),
    files: [ "1930-tiento.png", "1934-federale-102.png", "1938-allen.png", "1950-duplo-t.png", "1954-swiss-world-champion.png", "1958-top-star.png", "1962-crack.png", "1966-challenge-4-star.png", "1970-telstar.png", "1974-telstar-durlast.png", "1978-tango.png", "1982-tango-espana.png", "1986-azteca.png", "1990-etrusco-unico.png", "1994-questra.png", "1998-tricolore.png", "2002-fevernova.png", "2006-teamgeist.png", "2010-jabulani.png", "2014-brazuca.png", "2018-telstar-18.png", "2022-al-rihla.png", "2026-trionda.png" ]
  }, {
    id: "champions",
    label: t("Champions League"),
    files: [ "15-16.png", "15-16-final.png", "16-17.png", "16-17-final.png", "17-18.png", "17-18-final.png", "18-19.png", "18-19-final.png", "19-20.png", "19-20-final.png", "20-21.png", "20-21-final.png", "21-22.png", "21-22-final.png", "22-23.png", "22-23-final.png", "23-24.png", "23-24-final.png", "24-25.png", "24-25-final.png", "25-26.png", "25-26-final.png" ]
  }, {
    id: "sports",
    label: t("Deportes"),
    files: [ "basket.webp", "beisbol.png", "cricket.webp", "futbol.png", "golf.png", "pelota-handball.webp", "pingpong.png", "softbol.webp", "tenis.png", "voley.webp", "waterpolo.png" ]
  }, {
    id: "planets",
    label: t("Planetas"),
    files: [ "galaxia.png", "jupiter.png", "luna.png", "marte.png", "universo.png" ]
  }, {
    id: "rares",
    label: t("Raras"),
    files: [ "3d.png", "acero.png", "boca.png", "bola8.webp", "boliche.png", "enderpeel.png", "fuego.png", "hielo.png", "madera.png", "marmol.png", "mundo.png", "naranja.png", "nieve.png", "piedra.png", "playa.png", "pokeball.png", "river.png", "slime.png", "tierra.png" ]
  } ];
  function assetUrl(categoryId, file) {
    var rel = categoryId + "/" + file;
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(ASSET_BASE) || ASSET_BASE.indexOf("chrome-extension://") === 0) {
      return ASSET_BASE + rel;
    }
    var path = ASSET_BASE + rel;
    try {
      if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL(path);
      }
    } catch (e) {}
    return path;
  }
  function ensureStyles(doc) {
    if (doc.getElementById("hbxg-styles")) return;
    var style = doc.createElement("style");
    style.id = "hbxg-styles";
    style.textContent = [ ".hbxg-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);z-index:1000010;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .16s ease;}", ".hbxg-overlay.is-open{opacity:1;}", ".hbxg-card{width:480px;max-width:92vw;max-height:86vh;background:var(--theme-bg-primary);border:1px solid var(--theme-border);border-radius:14px;box-shadow:0 12px 40px rgba(0,0,0,.5);display:flex;flex-direction:column;overflow:hidden;transform:translateY(10px) scale(.98);transition:transform .16s ease;}", ".hbxg-overlay.is-open .hbxg-card{transform:translateY(0) scale(1);}", ".hbxg-head{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid var(--theme-border);flex-shrink:0;}", ".hbxg-title{display:flex;align-items:center;gap:8px;color:var(--theme-text-primary);font-size:14px;font-weight:700;letter-spacing:.2px;}", ".hbxg-close{width:26px;height:26px;border-radius:7px;border:1px solid var(--theme-border);background:var(--theme-bg-secondary);color:var(--theme-text-muted);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}", ".hbxg-close:hover{color:#dc2626;border-color:#dc2626;background:rgba(220,38,38,.08);}", ".hbxg-tabs{display:flex;gap:6px;padding:10px 16px;border-bottom:1px solid var(--theme-border);flex-shrink:0;overflow-x:auto;}", ".hbxg-tabbtn{flex:0 0 auto;padding:7px 11px;border-radius:8px;border:1px solid var(--theme-border);background:var(--theme-bg-secondary);color:var(--theme-text-muted);font-size:11.5px;font-weight:600;cursor:pointer;white-space:nowrap;transition:background .15s,color .15s,border-color .15s;}", ".hbxg-tabbtn.is-active{background:#c9a227;border-color:#c9a227;color:#000;}", ".hbxg-body{overflow-y:auto;padding:14px 16px 18px;flex:1;}", ".hbxg-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(72px,1fr));gap:10px;}", ".hbxg-item{display:flex;flex-direction:column;align-items:center;gap:5px;padding:6px 4px 8px;border-radius:10px;border:1px solid var(--theme-border);background:var(--theme-bg-secondary);cursor:pointer;transition:border-color .12s,background .12s,transform .12s;}", ".hbxg-item:hover{border-color:#c9a227;transform:translateY(-1px);}", ".hbxg-item.is-active{border-color:#c9a227;background:rgba(201,162,39,.12);}", ".hbxg-thumb{width:56px;height:56px;border-radius:50%;background:var(--theme-bg-primary) center/cover no-repeat;border:2px solid var(--theme-border-light);flex-shrink:0;}", ".hbxg-item-label{font-size:9px;color:var(--theme-text-muted);text-align:center;line-height:1.25;max-width:70px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}", ".hbxg-empty{color:var(--theme-text-muted);font-size:11.5px;text-align:center;padding:30px 10px;}" ].join("");
    doc.head.appendChild(style);
  }
  function el(doc, tag, cls, html) {
    var e = doc.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function prettyName(file) {
    return file.replace(/\.[a-z0-9]+$/i, "").replace(/-/g, " ");
  }
  var overlayEl = null;
  function close() {
    if (!overlayEl) return;
    overlayEl.classList.remove("is-open");
    var ref = overlayEl;
    setTimeout(function() {
      if (ref && ref.parentNode) ref.parentNode.removeChild(ref);
    }, 160);
    overlayEl = null;
  }
  function open(doc, onPick, opts) {
    doc = doc || document;
    opts = opts || {};
    ensureStyles(doc);
    if (overlayEl) close();
    var overlay = el(doc, "div", "hbxg-overlay");
    var card = el(doc, "div", "hbxg-card");
    var head = el(doc, "div", "hbxg-head");
    var titleWrap = el(doc, "div", "hbxg-title", '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg><span>' + t("Galería de pelotas") + "</span>");
    var closeBtn = el(doc, "button", "hbxg-close", '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>');
    closeBtn.type = "button";
    closeBtn.onclick = close;
    head.appendChild(titleWrap);
    head.appendChild(closeBtn);
    var tabs = el(doc, "div", "hbxg-tabs");
    var body = el(doc, "div", "hbxg-body");
    var grid = el(doc, "div", "hbxg-grid");
    body.appendChild(grid);
    var currentUrl = opts.currentUrl || "";
    function renderCategory(cat) {
      grid.innerHTML = "";
      if (!cat.files.length) {
        grid.appendChild(el(doc, "div", "hbxg-empty", t("No hay pelotas en esta categoría todavía.")));
        return;
      }
      cat.files.forEach(function(file) {
        var url = assetUrl(cat.id, file);
        var item = el(doc, "button", "hbxg-item" + (url === currentUrl ? " is-active" : ""));
        item.type = "button";
        var thumb = el(doc, "div", "hbxg-thumb");
        thumb.style.backgroundImage = "url(" + url + ")";
        var label = el(doc, "div", "hbxg-item-label", prettyName(file));
        item.appendChild(thumb);
        item.appendChild(label);
        item.title = prettyName(file);
        item.onclick = function() {
          currentUrl = url;
          Array.prototype.forEach.call(grid.children, function(c) {
            c.classList.remove("is-active");
          });
          item.classList.add("is-active");
          onPick(url);
          close();
        };
        grid.appendChild(item);
      });
    }
    var tabBtns = CATALOG.map(function(cat) {
      var b = el(doc, "button", "hbxg-tabbtn", cat.label);
      b.type = "button";
      b.onclick = function() {
        tabBtns.forEach(function(o) {
          o.classList.remove("is-active");
        });
        b.classList.add("is-active");
        renderCategory(cat);
      };
      tabs.appendChild(b);
      return b;
    });
    if (CATALOG.length) {
      tabBtns[0].classList.add("is-active");
      renderCategory(CATALOG[0]);
    }
    card.appendChild(head);
    card.appendChild(tabs);
    card.appendChild(body);
    overlay.appendChild(card);
    overlay.onclick = function(ev) {
      if (ev.target === overlay) close();
    };
    doc.body.appendChild(overlay);
    overlayEl = overlay;
    requestAnimationFrame(function() {
      overlay.classList.add("is-open");
    });
  }
  window.HaxNewBallGallery = {
    open: open,
    close: close,
    CATALOG: CATALOG,
    assetUrl: assetUrl,
    // Expuesto para que otros mods parcheados inline (como
    // cosmetics-skin.js, que no tiene su propio <script src> y por
    // eso no puede leer su propio data-assets-base) puedan reusar
    // esta misma base ya resuelta en vez de adivinar la suya.
    assetsBase: ASSET_BASE
  };
})();