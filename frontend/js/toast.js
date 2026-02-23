// femi/frontend/js/toast.js
// Lightweight toast helper (module).
// Usage: import { toast } from "../toast.js";

let _host;

function ensureHost() {
  if (_host) return _host;
  _host = document.getElementById("femi-toast-host");
  if (_host) return _host;

  _host = document.createElement("div");
  _host.id = "femi-toast-host";
  _host.style.position = "fixed";
  _host.style.left = "0";
  _host.style.right = "0";
  _host.style.top = "14px";
  _host.style.display = "flex";
  _host.style.justifyContent = "center";
  _host.style.pointerEvents = "none";
  _host.style.zIndex = "9999";
  document.body.appendChild(_host);
  return _host;
}

function typeStyles(type) {
  switch (type) {
    case "success": return { bg: "rgba(34,197,94,.15)", bd: "rgba(34,197,94,.35)" };
    case "warning": return { bg: "rgba(245,158,11,.16)", bd: "rgba(245,158,11,.35)" };
    case "danger":
    case "error":   return { bg: "rgba(239,68,68,.14)", bd: "rgba(239,68,68,.35)" };
    default:        return { bg: "rgba(59,130,246,.14)", bd: "rgba(59,130,246,.35)" };
  }
}

export function toast(message, type = "info", ms = 2600) {
  try {
    const host = ensureHost();
    const t = document.createElement("div");
    const st = typeStyles(type);

    t.style.pointerEvents = "auto";
    t.style.maxWidth = "min(560px, calc(100vw - 24px))";
    t.style.margin = "0 12px";
    t.style.padding = "10px 12px";
    t.style.borderRadius = "14px";
    t.style.border = `1px solid ${st.bd}`;
    t.style.background = st.bg;
    t.style.backdropFilter = "blur(10px)";
    t.style.boxShadow = "0 10px 30px rgba(0,0,0,.08)";
    t.style.display = "flex";
    t.style.alignItems = "center";
    t.style.gap = "10px";
    t.style.fontWeight = "700";
    t.style.color = "var(--text, #111827)";
    t.style.transform = "translateY(-8px)";
    t.style.opacity = "0";
    t.style.transition = "all .18s ease";

    const dot = document.createElement("span");
    dot.style.width = "10px";
    dot.style.height = "10px";
    dot.style.borderRadius = "999px";
    dot.style.border = `1px solid ${st.bd}`;
    dot.style.background = st.bd;

    const txt = document.createElement("div");
    txt.style.fontWeight = "700";
    txt.style.lineHeight = "1.25";
    txt.textContent = String(message || "");

    t.appendChild(dot);
    t.appendChild(txt);
    host.appendChild(t);

    requestAnimationFrame(() => {
      t.style.opacity = "1";
      t.style.transform = "translateY(0)";
    });

    const close = () => {
      t.style.opacity = "0";
      t.style.transform = "translateY(-8px)";
      setTimeout(() => t.remove(), 200);
    };

    t.addEventListener("click", close);
    setTimeout(close, ms);
  } catch (e) {
    // fallback
    console.log("toast:", message);
  }
}
