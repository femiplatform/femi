// femi/frontend/js/shell.js
import { api } from "./api.js";
import { requireAuth, logout } from "./auth.js";

const ICONS = {
  home: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>`,
  tools: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4l-5.3 5.3a2 2 0 0 0 2.8 2.8l5.3-5.3a5 5 0 0 0 6.4-6.4l3.6-3.6-3.1-.8-.8-3.1-3.5 3.6z"/></svg>`,
  dash: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 13h8V3H3v10z"/><path d="M13 21h8V11h-8v10z"/><path d="M13 3h8v6h-8V3z"/><path d="M3 21h8v-6H3v6z"/></svg>`,
  user: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
  menu: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></svg>`,
  x: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="M6 6l12 12"/></svg>`
};

export async function initUserShell({ active = "home", title = "FEMI" } = {}) {
  requireAuth();

  const root = document.getElementById("app");
  if (!root) throw new Error("Missing #app container");

  root.classList.add("femi-shell");

  root.insertAdjacentHTML("afterbegin", `
    <div class="appbar">
      <div class="appbar-left">
        <a class="brand" href="./home.html">FEMI</a>
        <div class="appbar-title">${escapeHtml(title)}</div>
      </div>
      <div class="appbar-right">
        <a class="icon-btn" href="./notifications.html" aria-label="การแจ้งเตือน">
          ${ICONS.bell}
          <span class="badge" id="notifBadge" hidden>0</span>
        </a>
        <button class="icon-btn" id="btnMenu" aria-label="เมนู">
          ${ICONS.menu}
        </button>
      </div>
    </div>

    <div class="drawer" id="drawer" hidden>
      <div class="drawer-backdrop" id="drawerBackdrop"></div>
      <div class="drawer-panel">
        <div class="drawer-head">
          <div class="drawer-title">เมนู</div>
          <button class="icon-btn" id="btnCloseDrawer" aria-label="ปิด">${ICONS.x}</button>
        </div>
        <nav class="drawer-nav">
          <a href="./home.html">หน้าแรก</a>
          <a href="./tools.html">เครื่องมือ</a>
          <a href="./preventive.html">Preventive</a>
          <a href="./family_planning.html">Family Planning</a>
          <a href="./pregnancy.html">Pregnancy</a>
          <a href="./knowledge.html">คลังความรู้</a>
          <a href="./quiz.html">แบบทดสอบ</a>
          <a href="./notifications.html">การแจ้งเตือน</a>
          <a href="./profile.html">โปรไฟล์</a>
        </nav>
        <div class="drawer-footer">
          <button class="btn btn-danger" id="btnLogout">ออกจากระบบ</button>
        </div>
      </div>
    </div>
  `);

  root.insertAdjacentHTML("beforeend", `
    <nav class="bottom-nav" aria-label="เมนูด้านล่าง">
      <a class="bn-item ${active === "home" ? "active" : ""}" href="./home.html">${ICONS.home}<span>หน้าแรก</span></a>
      <a class="bn-item ${active === "tools" ? "active" : ""}" href="./tools.html">${ICONS.tools}<span>เครื่องมือ</span></a>
      <a class="bn-item ${active === "dashboard" ? "active" : ""}" href="./dashboard.html">${ICONS.dash}<span>แดชบอร์ด</span></a>
      <a class="bn-item ${active === "profile" ? "active" : ""}" href="./profile.html">${ICONS.user}<span>โปรไฟล์</span></a>
    </nav>
  `);

  wireDrawer_();
  wireLogout_();
  await refreshUnreadBadge_();
}

async function refreshUnreadBadge_() {
  const badge = document.getElementById("notifBadge");
  if (!badge) return;
  try {
    const res = await api.userNotificationsUnreadCount();
    const n = Number(res?.unreadCount || 0);
    badge.textContent = String(n);
    badge.hidden = n <= 0;
  } catch {
    badge.hidden = true;
  }
}

function wireDrawer_() {
  const drawer = document.getElementById("drawer");
  const btnMenu = document.getElementById("btnMenu");
  const btnClose = document.getElementById("btnCloseDrawer");
  const backdrop = document.getElementById("drawerBackdrop");

  const open = () => { drawer.hidden = false; document.body.classList.add("no-scroll"); };
  const close = () => { drawer.hidden = true; document.body.classList.remove("no-scroll"); };

  btnMenu?.addEventListener("click", open);
  btnClose?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);

  // close drawer on nav click
  drawer?.querySelectorAll("a").forEach(a => a.addEventListener("click", close));
}

function wireLogout_() {
  document.getElementById("btnLogout")?.addEventListener("click", async () => {
    try { await api.logout(); } catch {}
    await logout("/login.html");
  });
}

function escapeHtml(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
