(function() {
  "use strict";
  function t(key) {
    return window.__t ? window.__t(key) : key;
  }
  var THEMES = {
    dark: {
      nameKey: "Dark Standard",
      colors: {
        "--theme-bg-primary": "#111111",
        "--theme-bg-secondary": "#1c1c1c",
        "--theme-bg-tertiary": "#242424",
        "--theme-bg-hover": "#2e2e2e",
        "--theme-bg-selected": "#383838",
        "--theme-border": "#2a2a2a",
        "--theme-text-primary": "#dddddd",
        "--theme-text-secondary": "#888888"
      },
      fx: ""
    },
    onix_pure: {
      nameKey: "Onix Pure",
      colors: {
        "--theme-bg-primary": "#000000",
        "--theme-bg-secondary": "#060606",
        "--theme-bg-tertiary": "#0f0f0f",
        "--theme-bg-hover": "#181818",
        "--theme-bg-selected": "#222222",
        "--theme-border": "#111111",
        "--theme-text-primary": "#e8e8e8",
        "--theme-text-secondary": "#686868"
      },
      fx: ""
    },
    monochrome: {
      nameKey: "Monochrome",
      colors: {
        "--theme-bg-primary": "#0a0a0a",
        "--theme-bg-secondary": "#141414",
        "--theme-bg-tertiary": "#1e1e1e",
        "--theme-bg-hover": "#2a2a2a",
        "--theme-bg-selected": "#ffffff",
        "--theme-border": "#282828",
        "--theme-text-primary": "#e0e0e0",
        "--theme-text-secondary": "#505050"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 0%,rgba(255,255,255,0.03) 0%,transparent 60%)}" + "@keyframes hax-mono{0%,100%{opacity:.4}50%{opacity:.9}}" + "#__hax-fx{animation:hax-mono 16s ease-in-out infinite}"
    },
    noir: {
      nameKey: "Noir Cinema",
      colors: {
        "--theme-bg-primary": "#080808",
        "--theme-bg-secondary": "#111111",
        "--theme-bg-tertiary": "#1a1a1a",
        "--theme-bg-hover": "#222222",
        "--theme-bg-selected": "#e8e0d0",
        "--theme-border": "#202020",
        "--theme-text-primary": "#e8e0d0",
        "--theme-text-secondary": "#6a6258"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 50%,transparent 30%,rgba(0,0,0,0.7) 100%),radial-gradient(ellipse at 50% 0%,rgba(255,240,200,0.03) 0%,transparent 45%)}" + "@keyframes hax-noir{0%,100%{opacity:.6}50%{opacity:.9}}" + "#__hax-fx{animation:hax-noir 12s ease-in-out infinite}"
    },
    onix_gold: {
      nameKey: "Onix Gold",
      colors: {
        "--theme-bg-primary": "#000000",
        "--theme-bg-secondary": "#080500",
        "--theme-bg-tertiary": "#110d00",
        "--theme-bg-hover": "#1a1400",
        "--theme-bg-selected": "#c9a227",
        "--theme-border": "#2a2010",
        "--theme-text-primary": "#f5f0e8",
        "--theme-text-secondary": "#c9a227"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 110%,rgba(201,162,39,0.12) 0%,transparent 55%),radial-gradient(ellipse at 20% -10%,rgba(180,130,20,0.06) 0%,transparent 45%)}" + "@keyframes hax-gold{0%,100%{opacity:.3}50%{opacity:.9}}" + "#__hax-fx{animation:hax-gold 6s ease-in-out infinite}"
    },
    tokyo_night: {
      nameKey: "Tokyo Night",
      colors: {
        "--theme-bg-primary": "#1a1b26",
        "--theme-bg-secondary": "#16161e",
        "--theme-bg-tertiary": "#24283b",
        "--theme-bg-hover": "#2e3248",
        "--theme-bg-selected": "#7aa2f7",
        "--theme-border": "#414868",
        "--theme-text-primary": "#a9b1d6",
        "--theme-text-secondary": "#565f89"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 80% 0%,rgba(122,162,247,0.1) 0%,transparent 50%),radial-gradient(ellipse at 20% 100%,rgba(187,154,247,0.07) 0%,transparent 50%)}" + "@keyframes hax-tokyo{0%,100%{opacity:.45}50%{opacity:1}}" + "#__hax-fx{animation:hax-tokyo 9s ease-in-out infinite}"
    },
    catppuccin: {
      nameKey: "Catppuccin Mocha",
      colors: {
        "--theme-bg-primary": "#1e1e2e",
        "--theme-bg-secondary": "#181825",
        "--theme-bg-tertiary": "#313244",
        "--theme-bg-hover": "#3a3a52",
        "--theme-bg-selected": "#cba6f7",
        "--theme-border": "#45475a",
        "--theme-text-primary": "#cdd6f4",
        "--theme-text-secondary": "#bac2de"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 0%,rgba(203,166,247,0.07) 0%,transparent 50%),radial-gradient(ellipse at 100% 100%,rgba(137,180,250,0.05) 0%,transparent 45%)}" + "@keyframes hax-ctp{0%,100%{opacity:.3}50%{opacity:.85}}" + "#__hax-fx{animation:hax-ctp 11s ease-in-out infinite}"
    },
    rose_pine: {
      nameKey: "Rosé Pine",
      colors: {
        "--theme-bg-primary": "#191724",
        "--theme-bg-secondary": "#1f1d2e",
        "--theme-bg-tertiary": "#26233a",
        "--theme-bg-hover": "#302d46",
        "--theme-bg-selected": "#ebbcba",
        "--theme-border": "#3d2f3a",
        "--theme-text-primary": "#e0def4",
        "--theme-text-secondary": "#908caa"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% -5%,rgba(235,188,186,0.09) 0%,transparent 55%),radial-gradient(ellipse at 0% 100%,rgba(196,167,231,0.06) 0%,transparent 40%)}" + "@keyframes hax-rose{0%,100%{opacity:.35}50%{opacity:.9}}" + "#__hax-fx{animation:hax-rose 8s ease-in-out infinite}"
    },
    dracula: {
      nameKey: "Dracula Pro",
      colors: {
        "--theme-bg-primary": "#282a36",
        "--theme-bg-secondary": "#1e1f29",
        "--theme-bg-tertiary": "#3a3c4e",
        "--theme-bg-hover": "#44475a",
        "--theme-bg-selected": "#bd93f9",
        "--theme-border": "#383a4a",
        "--theme-text-primary": "#f8f8f2",
        "--theme-text-secondary": "#6272a4"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 80% 20%,rgba(189,147,249,0.07) 0%,transparent 45%),radial-gradient(ellipse at 20% 80%,rgba(255,121,198,0.05) 0%,transparent 40%)}" + "@keyframes hax-dracula{0%,100%{opacity:.35}50%{opacity:.85}}" + "#__hax-fx{animation:hax-dracula 10s ease-in-out infinite}"
    },
    nord: {
      nameKey: "Nordic Deep",
      colors: {
        "--theme-bg-primary": "#2e3440",
        "--theme-bg-secondary": "#242933",
        "--theme-bg-tertiary": "#3b4252",
        "--theme-bg-hover": "#434c5e",
        "--theme-bg-selected": "#88c0d0",
        "--theme-border": "#3a4050",
        "--theme-text-primary": "#eceff4",
        "--theme-text-secondary": "#d8dee9"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 0% 0%,rgba(136,192,208,0.06) 0%,transparent 50%),radial-gradient(ellipse at 100% 100%,rgba(129,161,193,0.05) 0%,transparent 45%)}" + "@keyframes hax-nord{0%,100%{opacity:.3}50%{opacity:.8}}" + "#__hax-fx{animation:hax-nord 12s ease-in-out infinite}"
    },
    solarized_dark: {
      nameKey: "Solarized Dark",
      colors: {
        "--theme-bg-primary": "#002b36",
        "--theme-bg-secondary": "#073642",
        "--theme-bg-tertiary": "#083f4d",
        "--theme-bg-hover": "#094858",
        "--theme-bg-selected": "#268bd2",
        "--theme-border": "#0d4050",
        "--theme-text-primary": "#839496",
        "--theme-text-secondary": "#586e75"
      },
      fx: ""
    },
    discord: {
      nameKey: "Discord Dark",
      colors: {
        "--theme-bg-primary": "#313338",
        "--theme-bg-secondary": "#2b2d31",
        "--theme-bg-tertiary": "#1e1f22",
        "--theme-bg-hover": "#393c42",
        "--theme-bg-selected": "#5865f2",
        "--theme-border": "#232428",
        "--theme-text-primary": "#f2f3f5",
        "--theme-text-secondary": "#b5bac1"
      },
      fx: ""
    },
    synthwave: {
      nameKey: "Synthwave 84",
      colors: {
        "--theme-bg-primary": "#241b2f",
        "--theme-bg-secondary": "#1a1423",
        "--theme-bg-tertiary": "#2e2340",
        "--theme-bg-hover": "#382b4e",
        "--theme-bg-selected": "#f062c0",
        "--theme-border": "#2de2e6",
        "--theme-text-primary": "#f0f0f8",
        "--theme-text-secondary": "#e87060"
      },
      fx: "#__hax-fx{background:linear-gradient(0deg,rgba(45,226,230,0.05) 0%,transparent 40%)," + "repeating-linear-gradient(0deg,rgba(45,226,230,0.02) 0px,rgba(45,226,230,0.02) 1px,transparent 1px,transparent 40px)," + "radial-gradient(ellipse at 50% 0%,rgba(240,98,192,0.08) 0%,transparent 50%);background-size:100% 100%,100% 100%,100% 100%}" + "@keyframes hax-synth{0%{background-position:0 0,0 0,0 0}100%{background-position:0 0,0 40px,0 0}}" + "#__hax-fx{animation:hax-synth 3s linear infinite}"
    },
    cyberpunk: {
      nameKey: "Cyberpunk 2099",
      colors: {
        "--theme-bg-primary": "#040810",
        "--theme-bg-secondary": "#070d1a",
        "--theme-bg-tertiary": "#0e1828",
        "--theme-bg-hover": "#162035",
        "--theme-bg-selected": "#00fff5",
        "--theme-border": "#ffdd00",
        "--theme-text-primary": "#e0f0ff",
        "--theme-text-secondary": "#ffdd00"
      },
      fx: "#__hax-fx{background:repeating-linear-gradient(0deg,rgba(0,255,245,0.015) 0px,rgba(0,255,245,0.015) 1px,transparent 1px,transparent 5px)," + "radial-gradient(ellipse at 0% 100%,rgba(0,255,245,0.1) 0%,transparent 45%)," + "radial-gradient(ellipse at 100% 0%,rgba(255,221,0,0.07) 0%,transparent 40%)}" + "@keyframes hax-cyber{0%{background-position:0 0,0 0,0 0}100%{background-position:0 -50px,0 0,0 0}}" + "#__hax-fx{animation:hax-cyber 4s linear infinite;opacity:.5}"
    },
    matrix: {
      nameKey: "Matrix Console",
      colors: {
        "--theme-bg-primary": "#000500",
        "--theme-bg-secondary": "#000a00",
        "--theme-bg-tertiary": "#001500",
        "--theme-bg-hover": "#002200",
        "--theme-bg-selected": "#00dd38",
        "--theme-border": "#003b00",
        "--theme-text-primary": "#00dd38",
        "--theme-text-secondary": "#007a18"
      },
      fx: "#__hax-fx{background:repeating-linear-gradient(0deg,rgba(0,221,56,0.02) 0px,rgba(0,221,56,0.02) 1px,transparent 1px,transparent 3px)," + "radial-gradient(ellipse at 50% 50%,rgba(0,80,20,0.2) 0%,transparent 70%)}" + "@keyframes hax-matrix{0%{background-position:0 0,0 0}100%{background-position:0 -600px,0 0}}" + "#__hax-fx{animation:hax-matrix 12s linear infinite;opacity:.8}"
    },
    hologram: {
      nameKey: "Hologram",
      colors: {
        "--theme-bg-primary": "#020b14",
        "--theme-bg-secondary": "#031220",
        "--theme-bg-tertiary": "#051a2e",
        "--theme-bg-hover": "#082440",
        "--theme-bg-selected": "#00c8ff",
        "--theme-border": "rgba(0,200,255,0.2)",
        "--theme-text-primary": "#c0f0ff",
        "--theme-text-secondary": "rgba(0,200,255,0.7)"
      },
      fx: "#__hax-fx{background:repeating-linear-gradient(0deg,rgba(0,200,255,0.02) 0px,rgba(0,200,255,0.02) 1px,transparent 1px,transparent 4px)," + "radial-gradient(ellipse at 50% 50%,rgba(0,150,255,0.08) 0%,transparent 60%)}" + "@keyframes hax-holo{0%{background-position:0 0,0 0}100%{background-position:0 -40px,0 0}}" + "#__hax-fx{animation:hax-holo 3s linear infinite;opacity:.5}"
    },
    neon_tokyo: {
      nameKey: "Neon Tokyo",
      colors: {
        "--theme-bg-primary": "#05020e",
        "--theme-bg-secondary": "#090416",
        "--theme-bg-tertiary": "#110826",
        "--theme-bg-hover": "#190e3c",
        "--theme-bg-selected": "#ff00aa",
        "--theme-border": "#3a005a",
        "--theme-text-primary": "#f0f0ff",
        "--theme-text-secondary": "#aa00ff"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 0%,rgba(255,0,170,0.1) 0%,transparent 50%)," + "radial-gradient(ellipse at 100% 100%,rgba(170,0,255,0.08) 0%,transparent 40%)," + "repeating-linear-gradient(0deg,rgba(255,0,170,0.01) 0px,rgba(255,0,170,0.01) 1px,transparent 1px,transparent 4px)}" + "@keyframes hax-neon{0%,100%{opacity:.5}45%{opacity:.5}50%{opacity:.15}55%{opacity:.5}90%{opacity:.5}93%{opacity:.25}96%{opacity:.5}}" + "#__hax-fx{animation:hax-neon 6s infinite}"
    },
    hacker_red: {
      nameKey: "Hacker Red",
      colors: {
        "--theme-bg-primary": "#030000",
        "--theme-bg-secondary": "#070000",
        "--theme-bg-tertiary": "#0e0202",
        "--theme-bg-hover": "#160404",
        "--theme-bg-selected": "#ff2020",
        "--theme-border": "#1c0404",
        "--theme-text-primary": "#ff4040",
        "--theme-text-secondary": "#660000"
      },
      fx: "#__hax-fx{background:repeating-linear-gradient(0deg,rgba(255,0,0,0.018) 0px,rgba(255,0,0,0.018) 1px,transparent 1px,transparent 3px)," + "radial-gradient(ellipse at 50% 50%,rgba(80,0,0,0.25) 0%,transparent 70%)}" + "@keyframes hax-hred{0%,100%{opacity:.6}48%{opacity:.6}50%{opacity:.2}52%{opacity:.6}95%{opacity:.6}97%{opacity:.3}99%{opacity:.6}}" + "#__hax-fx{animation:hax-hred 5s infinite}"
    },
    vortex: {
      nameKey: "Vortex Deep",
      colors: {
        "--theme-bg-primary": "#040308",
        "--theme-bg-secondary": "#0b0912",
        "--theme-bg-tertiary": "#161424",
        "--theme-bg-hover": "#1e1c30",
        "--theme-bg-selected": "#e0004d",
        "--theme-border": "#201530",
        "--theme-text-primary": "#f0f0f0",
        "--theme-text-secondary": "#9d44f0"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 50%,rgba(157,68,240,0.09) 0%,transparent 55%)," + "radial-gradient(ellipse at 20% 80%,rgba(224,0,77,0.07) 0%,transparent 45%)," + "radial-gradient(ellipse at 80% 20%,rgba(100,0,180,0.06) 0%,transparent 40%)}" + "@keyframes hax-vortex{0%,100%{opacity:.35;transform:scale(1) rotate(0deg)}50%{opacity:.95;transform:scale(1.06) rotate(1.5deg)}}" + "#__hax-fx{animation:hax-vortex 10s ease-in-out infinite}"
    },
    aurora: {
      nameKey: "Aurora Borealis",
      colors: {
        "--theme-bg-primary": "#030d10",
        "--theme-bg-secondary": "#060f17",
        "--theme-bg-tertiary": "#0c1a22",
        "--theme-bg-hover": "#112030",
        "--theme-bg-selected": "#00e5b0",
        "--theme-border": "#082535",
        "--theme-text-primary": "#c8f0e8",
        "--theme-text-secondary": "#00b8c8"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 15% 30%,rgba(0,229,176,0.12) 0%,transparent 45%)," + "radial-gradient(ellipse at 85% 70%,rgba(0,184,200,0.09) 0%,transparent 45%)," + "radial-gradient(ellipse at 50% 90%,rgba(80,40,200,0.07) 0%,transparent 40%)}" + "@keyframes hax-aurora{0%,100%{opacity:.35;transform:translateY(0)}50%{opacity:1;transform:translateY(-8px)}}" + "#__hax-fx{animation:hax-aurora 12s ease-in-out infinite}"
    },
    midnight: {
      nameKey: "Midnight Sky",
      colors: {
        "--theme-bg-primary": "#02040a",
        "--theme-bg-secondary": "#0d1117",
        "--theme-bg-tertiary": "#161b22",
        "--theme-bg-hover": "#1e242e",
        "--theme-bg-selected": "#1a6fef",
        "--theme-border": "#262d36",
        "--theme-text-primary": "#c9d1d9",
        "--theme-text-secondary": "#8b949e"
      },
      fx: "#__hax-fx{background-image:" + "radial-gradient(1px 1px at 12% 18%,rgba(255,255,255,.7) 0%,transparent 100%)," + "radial-gradient(1px 1px at 28% 44%,rgba(255,255,255,.5) 0%,transparent 100%)," + "radial-gradient(1px 1px at 54% 20%,rgba(255,255,255,.75) 0%,transparent 100%)," + "radial-gradient(1px 1px at 72% 60%,rgba(255,255,255,.45) 0%,transparent 100%)," + "radial-gradient(1px 1px at 90% 14%,rgba(255,255,255,.65) 0%,transparent 100%)," + "radial-gradient(1px 1px at 18% 82%,rgba(255,255,255,.4) 0%,transparent 100%)," + "radial-gradient(1px 1px at 80% 80%,rgba(255,255,255,.55) 0%,transparent 100%)," + "radial-gradient(1px 1px at 40% 70%,rgba(255,255,255,.5) 0%,transparent 100%)," + "radial-gradient(1px 1px at 65% 92%,rgba(255,255,255,.4) 0%,transparent 100%)," + "radial-gradient(1px 1px at 6% 55%,rgba(255,255,255,.6) 0%,transparent 100%)," + "radial-gradient(1px 1px at 35% 8%,rgba(255,255,255,.5) 0%,transparent 100%)," + "radial-gradient(1px 1px at 95% 45%,rgba(255,255,255,.45) 0%,transparent 100%)}" + "@keyframes hax-stars{0%,100%{opacity:.3}50%{opacity:.95}}" + "#__hax-fx{animation:hax-stars 4s ease-in-out infinite}"
    },
    deep_ocean: {
      nameKey: "Deep Ocean",
      colors: {
        "--theme-bg-primary": "#020810",
        "--theme-bg-secondary": "#030d1a",
        "--theme-bg-tertiary": "#061528",
        "--theme-bg-hover": "#0a2038",
        "--theme-bg-selected": "#0088cc",
        "--theme-border": "#0a2d45",
        "--theme-text-primary": "#c0e4f8",
        "--theme-text-secondary": "#0088cc"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 30% 60%,rgba(0,100,200,0.12) 0%,transparent 50%)," + "radial-gradient(ellipse at 70% 30%,rgba(0,160,220,0.08) 0%,transparent 45%)," + "radial-gradient(ellipse at 50% 100%,rgba(0,60,160,0.15) 0%,transparent 55%)}" + "@keyframes hax-ocean{0%,100%{opacity:.4;transform:translateY(0)}25%{opacity:.7;transform:translateY(-4px)}75%{opacity:.6;transform:translateY(3px)}}" + "#__hax-fx{animation:hax-ocean 14s ease-in-out infinite}"
    },
    volcanic: {
      nameKey: "Volcanic Lava",
      colors: {
        "--theme-bg-primary": "#0e0604",
        "--theme-bg-secondary": "#150a04",
        "--theme-bg-tertiary": "#1e0e06",
        "--theme-bg-hover": "#2a1408",
        "--theme-bg-selected": "#ff6600",
        "--theme-border": "#2e1200",
        "--theme-text-primary": "#ffe0c0",
        "--theme-text-secondary": "#ff6600"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 120%,rgba(255,80,0,0.18) 0%,transparent 60%)," + "radial-gradient(ellipse at 20% 100%,rgba(200,40,0,0.1) 0%,transparent 40%)," + "radial-gradient(ellipse at 80% 100%,rgba(255,120,0,0.08) 0%,transparent 35%)}" + "@keyframes hax-lava{0%,100%{opacity:.4;transform:scaleY(1)}50%{opacity:1;transform:scaleY(1.02)}}" + "#__hax-fx{animation:hax-lava 6s ease-in-out infinite}"
    },
    blood_moon: {
      nameKey: "Blood Moon",
      colors: {
        "--theme-bg-primary": "#100404",
        "--theme-bg-secondary": "#090202",
        "--theme-bg-tertiary": "#1c0808",
        "--theme-bg-hover": "#280e0e",
        "--theme-bg-selected": "#e03030",
        "--theme-border": "#3a1010",
        "--theme-text-primary": "#f0d8d8",
        "--theme-text-secondary": "#e03030"
      },
      fx: "#__hax-fx{background:radial-gradient(circle at 85% 8%,rgba(224,48,48,0.14) 0%,transparent 40%)," + "radial-gradient(ellipse at 50% 100%,rgba(120,0,0,0.1) 0%,transparent 60%)}" + "@keyframes hax-moon{0%,100%{opacity:.3;transform:scale(1)}50%{opacity:.8;transform:scale(1.05)}}" + "#__hax-fx{animation:hax-moon 8s ease-in-out infinite}"
    },
    arctic: {
      nameKey: "Arctic Ice",
      colors: {
        "--theme-bg-primary": "#06101a",
        "--theme-bg-secondary": "#0a1824",
        "--theme-bg-tertiary": "#102030",
        "--theme-bg-hover": "#182c40",
        "--theme-bg-selected": "#a0d8f0",
        "--theme-border": "#1a3040",
        "--theme-text-primary": "#e8f4fc",
        "--theme-text-secondary": "#6ab4d8"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 30% 0%,rgba(160,216,240,0.09) 0%,transparent 50%)," + "radial-gradient(ellipse at 70% 0%,rgba(100,180,220,0.07) 0%,transparent 45%)}" + "@keyframes hax-arctic{0%,100%{opacity:.35}50%{opacity:.85}}" + "#__hax-fx{animation:hax-arctic 13s ease-in-out infinite}"
    },
    Sakura: {
      nameKey: "Sakura Night",
      colors: {
        "--theme-bg-primary": "#120a0f",
        "--theme-bg-secondary": "#1c0e16",
        "--theme-bg-tertiary": "#2a1520",
        "--theme-bg-hover": "#3a1e2e",
        "--theme-bg-selected": "#e85fa8",
        "--theme-border": "#4a1a30",
        "--theme-text-primary": "#f8eaf4",
        "--theme-text-secondary": "#d060a0"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 70% 5%,rgba(232,95,168,0.13) 0%,transparent 50%)," + "radial-gradient(ellipse at 15% 90%,rgba(180,40,100,0.09) 0%,transparent 45%)}" + "@keyframes hax-sakura{0%,100%{opacity:.4}50%{opacity:1}}" + "#__hax-fx{animation:hax-sakura 7s ease-in-out infinite}"
    },
    lavender: {
      nameKey: "Lavender Dream",
      colors: {
        "--theme-bg-primary": "#0d0b18",
        "--theme-bg-secondary": "#141224",
        "--theme-bg-tertiary": "#1d1a31",
        "--theme-bg-hover": "#272443",
        "--theme-bg-selected": "#9d44f7",
        "--theme-border": "#26234a",
        "--theme-text-primary": "#ecdeff",
        "--theme-text-secondary": "#9d44f7"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 20% 20%,rgba(157,68,247,0.13) 0%,transparent 50%)," + "radial-gradient(ellipse at 80% 80%,rgba(180,100,255,0.1) 0%,transparent 50%)}" + "@keyframes hax-lav{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}" + "#__hax-fx{animation:hax-lav 11s ease-in-out infinite}"
    },
    vaporwave: {
      nameKey: "Vaporwave",
      colors: {
        "--theme-bg-primary": "#0d0016",
        "--theme-bg-secondary": "#140020",
        "--theme-bg-tertiary": "#1e003a",
        "--theme-bg-hover": "#280050",
        "--theme-bg-selected": "#ff71ce",
        "--theme-border": "#6030aa",
        "--theme-text-primary": "#fffbfe",
        "--theme-text-secondary": "#01cdfe"
      },
      fx: "#__hax-fx{background:linear-gradient(180deg,rgba(1,205,254,0.06) 0%,transparent 40%)," + "radial-gradient(ellipse at 20% 80%,rgba(255,113,206,0.1) 0%,transparent 45%)," + "radial-gradient(ellipse at 80% 20%,rgba(185,103,255,0.1) 0%,transparent 45%)," + "repeating-linear-gradient(0deg,transparent 0px,transparent 59px,rgba(1,205,254,0.04) 59px,rgba(1,205,254,0.04) 60px)}" + "@keyframes hax-vapor{0%{background-position:0 0,0 0,0 0,0 0}100%{background-position:0 0,0 0,0 0,0 -60px}}" + "#__hax-fx{animation:hax-vapor 4s linear infinite;opacity:.55}"
    },
    lofi: {
      nameKey: "Lo-Fi Vibes",
      colors: {
        "--theme-bg-primary": "#1a1620",
        "--theme-bg-secondary": "#22182c",
        "--theme-bg-tertiary": "#2c2038",
        "--theme-bg-hover": "#382845",
        "--theme-bg-selected": "#d4a0c8",
        "--theme-border": "#332244",
        "--theme-text-primary": "#e8ddf0",
        "--theme-text-secondary": "#9a80b0"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 20% 20%,rgba(180,120,200,0.08) 0%,transparent 55%)," + "radial-gradient(ellipse at 80% 80%,rgba(120,80,180,0.07) 0%,transparent 50%)}" + "@keyframes hax-lofi{0%,100%{opacity:.4}50%{opacity:.95}}" + "#__hax-fx{animation:hax-lofi 15s ease-in-out infinite}"
    },
    pastel_candy: {
      nameKey: "Pastel Candy",
      colors: {
        "--theme-bg-primary": "#1a1022",
        "--theme-bg-secondary": "#221630",
        "--theme-bg-tertiary": "#2c1c3e",
        "--theme-bg-hover": "#38244e",
        "--theme-bg-selected": "#ff94cc",
        "--theme-border": "#30204a",
        "--theme-text-primary": "#fff0f8",
        "--theme-text-secondary": "#c094f0"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 10% 10%,rgba(255,148,204,0.1) 0%,transparent 45%)," + "radial-gradient(ellipse at 90% 90%,rgba(192,148,240,0.1) 0%,transparent 45%)}" + "@keyframes hax-candy{0%,100%{opacity:.4}50%{opacity:1}}" + "#__hax-fx{animation:hax-candy 9s ease-in-out infinite}"
    },
    grape: {
      nameKey: "Grape Dark",
      colors: {
        "--theme-bg-primary": "#12061e",
        "--theme-bg-secondary": "#1a0a2a",
        "--theme-bg-tertiary": "#250f3c",
        "--theme-bg-hover": "#31164e",
        "--theme-bg-selected": "#8b2be2",
        "--theme-border": "#2e1248",
        "--theme-text-primary": "#e8d0ff",
        "--theme-text-secondary": "#8b2be2"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 0%,rgba(139,43,226,0.12) 0%,transparent 55%)," + "radial-gradient(ellipse at 0% 100%,rgba(100,20,200,0.09) 0%,transparent 45%)}" + "@keyframes hax-grape{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.03)}}" + "#__hax-fx{animation:hax-grape 12s ease-in-out infinite}"
    },
    ash: {
      nameKey: "Ash",
      colors: {
        "--theme-bg-primary": "#0c0c0e",
        "--theme-bg-secondary": "#131316",
        "--theme-bg-tertiary": "#1c1c20",
        "--theme-bg-hover": "#25252a",
        "--theme-bg-selected": "#a0a0b8",
        "--theme-border": "#1e1e24",
        "--theme-text-primary": "#d8d8e8",
        "--theme-text-secondary": "#55556a"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 0%,rgba(160,160,184,0.05) 0%,transparent 60%)}" + "@keyframes hax-ash{0%,100%{opacity:.35}50%{opacity:.8}}" + "#__hax-fx{animation:hax-ash 18s ease-in-out infinite}"
    },
    void_purple: {
      nameKey: "Void Purple",
      colors: {
        "--theme-bg-primary": "#06030f",
        "--theme-bg-secondary": "#0d0620",
        "--theme-bg-tertiary": "#160a30",
        "--theme-bg-hover": "#1e0e40",
        "--theme-bg-selected": "#6644ff",
        "--theme-border": "#18083a",
        "--theme-text-primary": "#d8c8ff",
        "--theme-text-secondary": "#6644ff"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 50%,rgba(102,68,255,0.1) 0%,transparent 60%)," + "radial-gradient(ellipse at 0% 100%,rgba(80,40,200,0.08) 0%,transparent 45%)}" + "@keyframes hax-void{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.05)}}" + "#__hax-fx{animation:hax-void 13s ease-in-out infinite}"
    },
    glacier: {
      nameKey: "Glacier",
      colors: {
        "--theme-bg-primary": "#080e18",
        "--theme-bg-secondary": "#0c1420",
        "--theme-bg-tertiary": "#121c2c",
        "--theme-bg-hover": "#1a2638",
        "--theme-bg-selected": "#4fc8e8",
        "--theme-border": "#162030",
        "--theme-text-primary": "#d8ecf8",
        "--theme-text-secondary": "#4490b0"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 20% 0%,rgba(79,200,232,0.08) 0%,transparent 50%)," + "radial-gradient(ellipse at 80% 100%,rgba(40,120,180,0.06) 0%,transparent 45%)}" + "@keyframes hax-glacier{0%,100%{opacity:.3}50%{opacity:.8}}" + "#__hax-fx{animation:hax-glacier 16s ease-in-out infinite}"
    },
    ember: {
      nameKey: "Ember",
      colors: {
        "--theme-bg-primary": "#0e0600",
        "--theme-bg-secondary": "#160900",
        "--theme-bg-tertiary": "#200d00",
        "--theme-bg-hover": "#2c1200",
        "--theme-bg-selected": "#ff6a00",
        "--theme-border": "#281000",
        "--theme-text-primary": "#ffd8b0",
        "--theme-text-secondary": "#c04800"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 120%,rgba(255,106,0,0.15) 0%,transparent 55%)," + "radial-gradient(ellipse at 30% 80%,rgba(200,60,0,0.08) 0%,transparent 40%)}" + "@keyframes hax-ember{0%,100%{opacity:.4}50%{opacity:1}}" + "#__hax-fx{animation:hax-ember 7s ease-in-out infinite}"
    },
    obsidian: {
      nameKey: "Obsidian",
      colors: {
        "--theme-bg-primary": "#08080d",
        "--theme-bg-secondary": "#0e0e16",
        "--theme-bg-tertiary": "#161622",
        "--theme-bg-hover": "#20202e",
        "--theme-bg-selected": "#7060ff",
        "--theme-border": "#1c1c2c",
        "--theme-text-primary": "#d8d8f0",
        "--theme-text-secondary": "#5050a0"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 30% 70%,rgba(112,96,255,0.09) 0%,transparent 50%)," + "radial-gradient(ellipse at 70% 30%,rgba(80,60,220,0.07) 0%,transparent 45%)}" + "@keyframes hax-obs{0%,100%{opacity:.35;transform:scale(1)}50%{opacity:.9;transform:scale(1.02)}}" + "#__hax-fx{animation:hax-obs 11s ease-in-out infinite}"
    },
    crimson_night: {
      nameKey: "Crimson Night",
      colors: {
        "--theme-bg-primary": "#0e0408",
        "--theme-bg-secondary": "#160608",
        "--theme-bg-tertiary": "#200a10",
        "--theme-bg-hover": "#2c1018",
        "--theme-bg-selected": "#cc2244",
        "--theme-border": "#280810",
        "--theme-text-primary": "#f0d8e0",
        "--theme-text-secondary": "#cc2244"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 80% 20%,rgba(200,20,60,0.1) 0%,transparent 50%)," + "radial-gradient(ellipse at 20% 80%,rgba(150,0,40,0.08) 0%,transparent 45%)}" + "@keyframes hax-crim{0%,100%{opacity:.35}50%{opacity:.9}}" + "#__hax-fx{animation:hax-crim 8s ease-in-out infinite}"
    },
    golden_hour: {
      nameKey: "Golden Hour",
      colors: {
        "--theme-bg-primary": "#180e04",
        "--theme-bg-secondary": "#221408",
        "--theme-bg-tertiary": "#2e1c0c",
        "--theme-bg-hover": "#3c2410",
        "--theme-bg-selected": "#f0a030",
        "--theme-border": "#342008",
        "--theme-text-primary": "#fae8c8",
        "--theme-text-secondary": "#d08030"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% -20%,rgba(240,160,48,0.12) 0%,transparent 60%)," + "radial-gradient(ellipse at 100% 50%,rgba(200,100,20,0.08) 0%,transparent 45%)}" + "@keyframes hax-gold2{0%,100%{opacity:.35}50%{opacity:.9}}" + "#__hax-fx{animation:hax-gold2 10s ease-in-out infinite}"
    },
    steel: {
      nameKey: "Steel Blue",
      colors: {
        "--theme-bg-primary": "#0a0e18",
        "--theme-bg-secondary": "#0f1520",
        "--theme-bg-tertiary": "#161e2c",
        "--theme-bg-hover": "#1e2838",
        "--theme-bg-selected": "#3a80c8",
        "--theme-border": "#1c2636",
        "--theme-text-primary": "#d0ddf0",
        "--theme-text-secondary": "#5878a0"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% -10%,rgba(58,128,200,0.08) 0%,transparent 55%)," + "radial-gradient(ellipse at 100% 100%,rgba(30,80,160,0.06) 0%,transparent 45%)}" + "@keyframes hax-steel{0%,100%{opacity:.3}50%{opacity:.8}}" + "#__hax-fx{animation:hax-steel 13s ease-in-out infinite}"
    },
    Space: {
      nameKey: "Deep Space",
      colors: {
        "--theme-bg-primary": "#080b14",
        "--theme-bg-secondary": "#111620",
        "--theme-bg-tertiary": "#192030",
        "--theme-bg-hover": "#212840",
        "--theme-bg-selected": "#4f46e5",
        "--theme-border": "#1e2838",
        "--theme-text-primary": "#eef2f8",
        "--theme-text-secondary": "#94a3b8"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 15% 85%,rgba(79,70,229,0.12) 0%,transparent 50%)," + "radial-gradient(ellipse at 85% 15%,rgba(99,102,241,0.09) 0%,transparent 50%)}" + "@keyframes hax-space{0%,100%{opacity:.4;transform:scale(1)}50%{opacity:1;transform:scale(1.04)}}" + "#__hax-fx{animation:hax-space 14s ease-in-out infinite}"
    },
    sunset_boulevard: {
      nameKey: "Sunset Boulevard",
      colors: {
        "--theme-bg-primary": "#120608",
        "--theme-bg-secondary": "#1c0a0c",
        "--theme-bg-tertiary": "#281014",
        "--theme-bg-hover": "#36161c",
        "--theme-bg-selected": "#ff5555",
        "--theme-border": "#341014",
        "--theme-text-primary": "#ffe8e0",
        "--theme-text-secondary": "#ff8866"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% -10%,rgba(255,100,60,0.14) 0%,transparent 55%)," + "radial-gradient(ellipse at 0% 60%,rgba(220,40,80,0.08) 0%,transparent 45%)," + "radial-gradient(ellipse at 100% 60%,rgba(255,140,40,0.07) 0%,transparent 40%)}" + "@keyframes hax-sunset{0%,100%{opacity:.4}50%{opacity:1}}" + "#__hax-fx{animation:hax-sunset 9s ease-in-out infinite}"
    },
    amber_glow: {
      nameKey: "Amber Glow",
      colors: {
        "--theme-bg-primary": "#0f0900",
        "--theme-bg-secondary": "#190f00",
        "--theme-bg-tertiary": "#241600",
        "--theme-bg-hover": "#301e00",
        "--theme-bg-selected": "#ffb000",
        "--theme-border": "#2c1a00",
        "--theme-text-primary": "#ffe8b0",
        "--theme-text-secondary": "#cc8800"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 80%,rgba(255,176,0,0.12) 0%,transparent 55%)," + "radial-gradient(ellipse at 50% 0%,rgba(200,120,0,0.07) 0%,transparent 40%)}" + "@keyframes hax-amber{0%,100%{opacity:.35}50%{opacity:.9}}" + "#__hax-fx{animation:hax-amber 7s ease-in-out infinite}"
    },
    forest: {
      nameKey: "Forest Dark",
      colors: {
        "--theme-bg-primary": "#0b0f0b",
        "--theme-bg-secondary": "#111811",
        "--theme-bg-tertiary": "#1a241a",
        "--theme-bg-hover": "#222e22",
        "--theme-bg-selected": "#3ec46e",
        "--theme-border": "#1e2e1e",
        "--theme-text-primary": "#d0ead0",
        "--theme-text-secondary": "#3ec46e"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 50% 110%,rgba(62,196,110,0.1) 0%,transparent 55%)," + "radial-gradient(ellipse at 10% 30%,rgba(40,160,80,0.07) 0%,transparent 40%)}" + "@keyframes hax-forest{0%,100%{opacity:.35}50%{opacity:.9}}" + "#__hax-fx{animation:hax-forest 8s ease-in-out infinite}"
    },
    glass: {
      nameKey: "Frosted Glass",
      colors: {
        "--theme-bg-primary": "#091425",
        "--theme-bg-secondary": "rgba(255,255,255,0.05)",
        "--theme-bg-tertiary": "rgba(255,255,255,0.08)",
        "--theme-bg-hover": "rgba(255,255,255,0.12)",
        "--theme-bg-selected": "rgba(99,179,237,0.35)",
        "--theme-border": "rgba(255,255,255,0.1)",
        "--theme-text-primary": "#f0f6ff",
        "--theme-text-secondary": "rgba(200,220,255,0.6)"
      },
      fx: "#__hax-fx{background:radial-gradient(ellipse at 10% 20%,rgba(99,102,241,0.2) 0%,transparent 45%)," + "radial-gradient(ellipse at 90% 80%,rgba(59,130,246,0.16) 0%,transparent 45%)," + "radial-gradient(ellipse at 55% 50%,rgba(16,185,129,0.09) 0%,transparent 40%)}" + "@keyframes hax-glass{0%,100%{opacity:.45;transform:translateX(0)}50%{opacity:1;transform:translateX(10px)}}" + "#__hax-fx{animation:hax-glass 20s ease-in-out infinite}"
    }
  };
  var STORAGE_KEY = "haxball-theme";
  var currentTheme = "dark";
  var root = document.documentElement;
  var _inGame = false;
  var _styleEl = null;
  var _fxDiv = null;
  var _transStyleEl = null;
  var _rafHandle = null;
  var _transRafHandle = null;
  var ALL_VARS = [ "--theme-bg-primary", "--theme-bg-secondary", "--theme-bg-tertiary", "--theme-bg-hover", "--theme-bg-selected", "--theme-border", "--theme-text-primary", "--theme-text-secondary" ];
  var ALL_VARS_LEN = ALL_VARS.length;
  var _colorKeyCache = {};
  (function() {
    for (var k in THEMES) {
      var c = THEMES[k].colors;
      _colorKeyCache[k] = c ? Object.keys(c) : [];
    }
  })();
  function _getStyleEl() {
    if (!_styleEl) {
      _styleEl = document.createElement("style");
      _styleEl.id = "__hax-theme-style";
      document.head.appendChild(_styleEl);
    }
    return _styleEl;
  }
  function _getFxDiv() {
    if (!_fxDiv) {
      _fxDiv = document.createElement("div");
      _fxDiv.id = "__hax-fx";
      _fxDiv.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:-1;will-change:opacity,transform;contain:strict";
      document.body.appendChild(_fxDiv);
    }
    return _fxDiv;
  }
  var _chromeStyleEl = null;
  function _getChromeStyleEl() {
    if (!_chromeStyleEl) {
      _chromeStyleEl = document.createElement("style");
      _chromeStyleEl.id = "__hax-theme-chrome";
      document.head.appendChild(_chromeStyleEl);
    }
    return _chromeStyleEl;
  }
  function _applyGlassChrome() {
    var el = _getChromeStyleEl();
    el.textContent = ".dialog{" + "border-radius:16px!important;" + "overflow:hidden;" + "background:var(--theme-bg-primary)!important;" + "background:color-mix(in srgb,var(--theme-bg-primary) 86%,transparent)!important;" + "backdrop-filter:blur(22px) saturate(150%);" + "-webkit-backdrop-filter:blur(22px) saturate(150%);" + "}" + "#settings-sidebar-panel{" + "border-radius:12px 0 0 12px!important;" + "background:var(--theme-bg-secondary)!important;" + "background:color-mix(in srgb,var(--theme-bg-secondary) 88%,transparent)!important;" + "backdrop-filter:blur(16px) saturate(140%);" + "-webkit-backdrop-filter:blur(16px) saturate(140%);" + "}" + ".settings-sidebar-btn{border-radius:8px!important}" + ".dialog .tabcontents>.section,.dialog .section{border-radius:10px}" + "#settings-sidebar-tooltip{border-radius:8px!important;backdrop-filter:blur(6px)}";
  }
  function _getTransStyleEl() {
    if (!_transStyleEl) {
      _transStyleEl = document.createElement("style");
      _transStyleEl.id = "__hax-trans-style";
      document.head.appendChild(_transStyleEl);
    }
    return _transStyleEl;
  }
  function _flashTransition() {
    var el = _getTransStyleEl();
    el.textContent = ":root{transition:--theme-bg-primary .22s,--theme-bg-secondary .22s,--theme-bg-tertiary .22s,--theme-bg-hover .22s,--theme-bg-selected .18s,--theme-border .22s,--theme-text-primary .22s,--theme-text-secondary .22s}#__hax-fx{transition:opacity .18s ease}";
    if (_transRafHandle !== null) cancelAnimationFrame(_transRafHandle);
    _transRafHandle = requestAnimationFrame(function() {
      _transRafHandle = requestAnimationFrame(function() {
        setTimeout(function() {
          el.textContent = "";
          _transRafHandle = null;
        }, 300);
      });
    });
  }
  function _setFxVisible(visible) {
    if (!_fxDiv) return;
    _fxDiv.style.display = visible ? "block" : "none";
    _fxDiv.style.animationPlayState = visible ? "running" : "paused";
  }
  function _flatBackgroundsEnabled() {
    try {
      return localStorage.getItem("flat_backgrounds") === "true";
    } catch (e) {
      return false;
    }
  }
  function _updateFx() {
    var def = THEMES[currentTheme];
    _setFxVisible(!!(def && def.fx) && !_inGame && !_flatBackgroundsEnabled());
  }
  function _isGameActive() {
    return !!document.querySelector(".game-state-view");
  }
  function _startGameObserver() {
    if (typeof Injector !== "undefined" && Injector.waitForElement) {
      Injector.waitForElement("div[class$='view']").then(function(el) {
        new MutationObserver(function() {
          var nowInGame = _isGameActive();
          if (nowInGame !== _inGame) {
            _inGame = nowInGame;
            _updateFx();
          }
        }).observe(el.parentNode, {
          childList: true
        });
      }).catch(function() {});
    } else {
      new MutationObserver(function() {
        var nowInGame = _isGameActive();
        if (nowInGame !== _inGame) {
          _inGame = nowInGame;
          _updateFx();
        }
      }).observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  }
  function _doApply(theme) {
    _rafHandle = null;
    var def = THEMES[theme];
    if (!def) return;
    currentTheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    _flashTransition();
    for (var i = 0; i < ALL_VARS_LEN; i++) root.style.removeProperty(ALL_VARS[i]);
    var colors = def.colors;
    var keys = _colorKeyCache[theme];
    for (var j = 0, len = keys.length; j < len; j++) {
      root.style.setProperty(keys[j], colors[keys[j]], "important");
    }
    _getStyleEl().textContent = def.fx || "";
    if (document.body) {
      _getFxDiv();
      _updateFx();
    }
    root.setAttribute("data-theme", theme);
  }
  function applyTheme(theme) {
    if (!THEMES[theme]) return;
    if (_rafHandle !== null) cancelAnimationFrame(_rafHandle);
    _rafHandle = requestAnimationFrame(function() {
      _doApply(theme);
    });
  }
  function init() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES[saved]) currentTheme = saved;
    } catch (e) {}
    function start() {
      _inGame = _isGameActive();
      _applyGlassChrome();
      _doApply(currentTheme);
      _startGameObserver();
    }
    if (document.readyState === "complete" || document.readyState === "interactive") {
      start();
    } else {
      document.addEventListener("DOMContentLoaded", start);
    }
  }
  window.HaxThemes = {
    apply: applyTheme,
    toggle: function() {
      var keys = Object.keys(THEMES);
      var next = keys[(keys.indexOf(currentTheme) + 1) % keys.length];
      applyTheme(next);
      return next;
    },
    prev: function() {
      var keys = Object.keys(THEMES);
      var idx = keys.indexOf(currentTheme);
      var prev = keys[(idx - 1 + keys.length) % keys.length];
      applyTheme(prev);
      return prev;
    },
    getCurrent: function() {
      return currentTheme;
    },
    getList: function() {
      return Object.keys(THEMES);
    },
    refreshFx: _updateFx,
    getCount: function() {
      return Object.keys(THEMES).length;
    },
    hasFx: function(t) {
      return !!(THEMES[t] && THEMES[t].fx);
    },
    isInGame: function() {
      return _inGame;
    },
    random: function() {
      var keys = Object.keys(THEMES);
      var pick = keys[Math.floor(Math.random() * keys.length)];
      applyTheme(pick);
      return pick;
    },
    getThemes: function() {
      var res = {};
      for (var k in THEMES) res[k] = {
        name: t(THEMES[k].nameKey),
        colors: THEMES[k].colors
      };
      return res;
    }
  };
  init();
})();