import { requireAdmin, clearSession } from "../js/auth.js";
import { api } from "../js/api.js";
import { qs, toast } from "../js/ui.js";

export function initAdminShell(active = "") {
  requireAdmin("/login.html");
  const el = document.querySelector(`[data-nav="${active}"]`);
  if (el) el.classList.add("bg-slate-900", "text-white");

  const logoutBtn = qs("#logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try { await api.logout(); } catch {}
      clearSession();
      window.location.href = "/index.html";
    });
  }
}

export async function loadAdminMe() {
  try {
    const me = await api.me();
    const hello = qs("#hello");
    if (hello) hello.textContent = `สวัสดี ${me.firstName || ""} ${me.lastName || ""}`.trim();
    return me;
  } catch (e) {
    toast("กรุณาเข้าสู่ระบบอีกครั้ง", "warning");
    window.location.href = "/login.html";
  }
}
