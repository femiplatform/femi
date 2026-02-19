export function qs(sel, el=document){ return el.querySelector(sel); }
export function qsa(sel, el=document){ return [...el.querySelectorAll(sel)]; }

export function formatDate(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short" });
  } catch { return iso; }
}

export function toast(message, type="info") {
  const box = document.createElement("div");
  const colors = {
    info: "bg-slate-900 text-white",
    success: "bg-emerald-600 text-white",
    warning: "bg-amber-500 text-white",
    danger: "bg-rose-600 text-white"
  };
  box.className = `fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-2xl shadow-soft ${colors[type]||colors.info}`;
  box.textContent = message;
  document.body.appendChild(box);
  setTimeout(()=> box.remove(), 2800);
}

export function setLoading(btn, loading=true) {
  if (!btn) return;
  btn.disabled = loading;
  btn.dataset._label ||= btn.textContent;
  btn.textContent = loading ? "กำลังทำงาน..." : btn.dataset._label;
}
