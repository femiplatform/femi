// femi/frontend/js/toast.js
export function toast(message, type = "info", ms = 2600) {
  try {
    let host = document.getElementById("femi-toast-host");
    if (!host) {
      host = document.createElement("div");
      host.id = "femi-toast-host";
      host.style.position = "fixed";
      host.style.left = "0";
      host.style.right = "0";
      host.style.top = "14px";
      host.style.display = "flex";
      host.style.justifyContent = "center";
      host.style.pointerEvents = "none";
      host.style.zIndex = "9999";
      document.body.appendChild(host);
    }
    const t = document.createElement("div");
    t.style.pointerEvents = "auto";
    t.style.maxWidth = "min(560px, calc(100vw - 24px))";
    t.style.margin = "0 12px";
    t.style.padding = "10px 12px";
    t.style.borderRadius = "14px";
    t.style.border = "1px solid rgba(17,24,39,.14)";
    t.style.background = "rgba(255,255,255,.9)";
    t.style.backdropFilter = "blur(10px)";
    t.style.boxShadow = "0 10px 30px rgba(0,0,0,.08)";
    t.style.fontWeight = "800";
    t.style.transform = "translateY(-8px)";
    t.style.opacity = "0";
    t.style.transition = "all .18s ease";
    t.textContent = String(message || "");
    host.appendChild(t);
    requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translateY(0)"; });
    const close = () => { t.style.opacity = "0"; t.style.transform = "translateY(-8px)"; setTimeout(()=>t.remove(), 220); };
    t.addEventListener("click", close);
    setTimeout(close, ms);
  } catch {
    console.log(message);
  }
}
