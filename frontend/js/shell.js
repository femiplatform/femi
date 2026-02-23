// femi/frontend/js/shell.js
import { requireAuth, logout as authLogout } from "./auth.js";
import { api } from "./api.js";
import { t, applyI18n } from "./i18n.js";

/**
 * initUserShell({ active, title })
 * active: home | tools | dashboard | profile
 * title: ชื่อหน้าที่จะแสดงใน header (ถ้าไม่ส่ง จะใช้จาก i18n ของแต่ละหน้า)
 */
export async function initUserShell({ active = "home", title = "" } = {}) {
  requireAuth("../login.html");

  const root = document.getElementById("app") || document.body;
  const existingMain = root.querySelector("main") || root;

  if (!document.querySelector("[data-femi-shell='1']")) {
    const shell = document.createElement("div");
    shell.setAttribute("data-femi-shell", "1");
    shell.innerHTML = renderShell_(title || t("app.name"), active);
    document.body.prepend(shell);

    const slot = document.querySelector("[data-shell-slot='main']");
    if (slot && existingMain && existingMain !== slot) {
      if (existingMain !== document.body) slot.appendChild(existingMain);
    }

    bindShellEvents_();
  } else {
    const tEl = document.getElementById("shellTitle");
    if (tEl) tEl.textContent = title || t("app.name");
    setActiveBottomNav_(active);
  }

  // Apply i18n to shell DOM
  applyI18n(document);

  // badge
  await refreshNotificationBadge_();
  startBadgePolling_();
}

/* ---------------- UI Render ---------------- */

function renderShell_(title, active) {
  return `
  <div class="femi-shell">
    <header class="femi-appbar">
      <div class="femi-left">
        <a class="femi-brand" href="./home.html">${escapeHtml_(t("app.name"))}</a>
        <div id="shellTitle" class="femi-title">${escapeHtml_(title)}</div>
      </div>

      <div class="femi-right">
        <button class="icon-btn" id="btnBell" aria-label="${escapeHtml_(t("nav.notifications"))}" title="${escapeHtml_(t("nav.notifications"))}">
          <span class="icon">🔔</span>
          <span id="bellBadge" class="badge hidden">0</span>
        </button>

        <button class="icon-btn" id="btnMenu" aria-label="${escapeHtml_(t("nav.menu"))}" title="${escapeHtml_(t("nav.menu"))}">
          <span class="icon">☰</span>
        </button>
      </div>
    </header>

    <!-- Drawer: FIXED layering (backdrop below panel) -->
    <aside id="drawer" class="femi-drawer hidden" aria-hidden="true">
      <div class="drawer-backdrop" id="drawerBackdrop" aria-label="close"></div>

      <div class="drawer-panel" role="dialog" aria-modal="true">
        <div class="drawer-head">
          <div class="drawer-title" data-i18n="nav.menu">${t("nav.menu")}</div>
          <button class="icon-btn" id="btnDrawerClose" aria-label="${escapeHtml_(t("common.close"))}">✕</button>
        </div>

        <nav class="drawer-nav">
          <a href="./home.html" data-i18n="nav.home">${t("nav.home")}</a>
          <a href="./tools.html" data-i18n="nav.tools">${t("nav.tools")}</a>
          <a href="./preventive.html" data-i18n="nav.preventive">${t("nav.preventive")}</a>
          <a href="./family_planning.html" data-i18n="nav.familyPlanning">${t("nav.familyPlanning")}</a>
          <a href="./pregnancy.html" data-i18n="nav.pregnancy">${t("nav.pregnancy")}</a>
          <a href="./knowledge.html" data-i18n="nav.knowledge">${t("nav.knowledge")}</a>
          <a href="./quiz.html" data-i18n="nav.quiz">${t("nav.quiz")}</a>
          <a href="./notifications.html" data-i18n="nav.notifications">${t("nav.notifications")}</a>
          <a href="./profile.html" data-i18n="nav.profile">${t("nav.profile")}</a>
        </nav>

        <div class="drawer-foot">
          <button class="btn btn-danger" id="btnLogout" data-i18n="nav.logout">${t("nav.logout")}</button>
        </div>
      </div>
    </aside>

    <div class="femi-content" data-shell-slot="main"></div>

    <nav class="femi-bottomnav" aria-label="เมนูด้านล่าง">
      <a class="bn-item ${active === "home" ? "active" : ""}" href="./home.html" data-bn="home">
        <span class="bn-icon">🏠</span>
        <span class="bn-label" data-i18n="nav.home">${t("nav.home")}</span>
      </a>
      <a class="bn-item ${active === "tools" ? "active" : ""}" href="./tools.html" data-bn="tools">
        <span class="bn-icon">🧰</span>
        <span class="bn-label" data-i18n="nav.tools">${t("nav.tools")}</span>
      </a>
      <a class="bn-item ${active === "dashboard" ? "active" : ""}" href="./dashboard.html" data-bn="dashboard">
        <span class="bn-icon">📊</span>
        <span class="bn-label" data-i18n="nav.dashboard">${t("nav.dashboard")}</span>
      </a>
      <a class="bn-item ${active === "profile" ? "active" : ""}" href="./profile.html" data-bn="profile">
        <span class="bn-icon">👤</span>
        <span class="bn-label" data-i18n="nav.profile">${t("nav.profile")}</span>
      </a>
    </nav>
  </div>

  <style>
    .femi-shell{min-height:100vh}
    .femi-appbar{
      position:sticky;top:0;z-index:50;
      display:flex;align-items:center;justify-content:space-between;
      padding:10px 12px;
      backdrop-filter: blur(10px);
      background: rgba(255,255,255,.72);
      border-bottom: 1px solid rgba(0,0,0,.06);
    }
    .femi-left{display:flex;align-items:center;gap:10px;min-width:0}
    .femi-brand{font-weight:900;text-decoration:none;color:#1f2937}
    .femi-title{font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55vw}
    .femi-right{display:flex;align-items:center;gap:8px}

    .icon-btn{
      position:relative;
      border:1px solid rgba(0,0,0,.10);
      background:#fff;border-radius:12px;
      padding:8px 10px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
    }
    .badge{
      position:absolute;top:-6px;right:-6px;
      min-width:20px;height:20px;border-radius:999px;
      background:#dc2626;color:#fff;
      font-size:12px;font-weight:800;
      display:flex;align-items:center;justify-content:center;
      padding:0 6px;
      box-shadow: 0 6px 14px rgba(0,0,0,.12);
    }
    .hidden{display:none !important}
    .femi-content{padding-bottom:72px;}

    /* Drawer (FIX) */
    .femi-drawer{
      position:fixed; inset:0; z-index:60;
    }
    .drawer-backdrop{
      position:absolute; inset:0;
      background:rgba(0,0,0,.25);
      z-index:0;
    }
    .drawer-panel{
      position:absolute; top:0; right:0; height:100%;
      width:min(340px, 88vw);
      background:#fff;
      box-shadow:-16px 0 40px rgba(0,0,0,.16);
      display:flex; flex-direction:column;
      z-index:1;
    }

    .drawer-head{display:flex;align-items:center;justify-content:space-between;padding:14px;border-bottom:1px solid rgba(0,0,0,.06)}
    .drawer-title{font-weight:900}
    .drawer-nav{display:flex;flex-direction:column;padding:8px 14px;gap:2px;overflow:auto}
    .drawer-nav a{padding:10px 8px;border-radius:12px;text-decoration:none;color:#111}
    .drawer-nav a:hover{background:rgba(0,0,0,.04)}
    .drawer-foot{padding:14px;border-top:1px solid rgba(0,0,0,.06)}
    .btn{border:0;border-radius:12px;padding:12px 14px;font-weight:800;cursor:pointer}
    .btn-danger{background:#dc2626;color:#fff;width:100%}

    .femi-bottomnav{
      position:fixed;left:0;right:0;bottom:0;z-index:55;
      display:grid;grid-template-columns:repeat(4,1fr);
      background:#fff;border-top:1px solid rgba(0,0,0,.08);
      padding:8px 8px calc(8px + env(safe-area-inset-bottom));
    }
    .bn-item{
      text-decoration:none;color:#374151;
      display:flex;flex-direction:column;align-items:center;gap:4px;
      padding:6px 6px;border-radius:14px;
      font-size:12px;
    }
    .bn-item.active{background:rgba(220,38,38,.10);color:#b91c1c}
    .bn-icon{font-size:20px;line-height:1}
  </style>
  `;
}

function bindShellEvents_() {
  const btnMenu = document.getElementById("btnMenu");
  const drawer = document.getElementById("drawer");
  const btnClose = document.getElementById("btnDrawerClose");
  const backdrop = document.getElementById("drawerBackdrop");
  const btnLogout = document.getElementById("btnLogout");
  const btnBell = document.getElementById("btnBell");

  const lockScroll = () => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  };
  const unlockScroll = () => {
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  };

  const open = () => {
    drawer.classList.remove("hidden");
    drawer.setAttribute("aria-hidden", "false");
    lockScroll();
  };
  const close = () => {
    drawer.classList.add("hidden");
    drawer.setAttribute("aria-hidden", "true");
    unlockScroll();
  };

  btnMenu?.addEventListener("click", open);
  btnClose?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // Safety: if any link clicked, close drawer
  drawer?.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", close);
  });

  btnLogout?.addEventListener("click", async () => {
    try { await authLogout("../login.html"); } catch { location.href = "../login.html"; }
  });

  btnBell?.addEventListener("click", () => {
    location.href = "./notifications.html";
  });
}

function setActiveBottomNav_(active) {
  document.querySelectorAll(".bn-item").forEach(a => a.classList.remove("active"));
  const el = document.querySelector(`.bn-item[data-bn="${active}"]`);
  if (el) el.classList.add("active");
}

/* ---------------- Badge logic ---------------- */

let badgeTimer = null;

function normalizeUnread_(res) {
  if (typeof res?.unread === "number") return res.unread;
  if (typeof res?.data?.unread === "number") return res.data.unread;
  if (typeof res?.data?.data?.unread === "number") return res.data.data.unread;
  return 0;
}

async function refreshNotificationBadge_() {
  const badge = document.getElementById("bellBadge");
  if (!badge) return;

  try {
    const res = await api.userNotificationsUnreadCount();
    const unread = normalizeUnread_(res);
    badge.textContent = String(unread);
    if (unread > 0) badge.classList.remove("hidden");
    else badge.classList.add("hidden");
  } catch {
    badge.classList.add("hidden");
  }
}

function startBadgePolling_() {
  if (badgeTimer) return;
  badgeTimer = setInterval(refreshNotificationBadge_, 30000);
}

/* ---------------- utils ---------------- */

function escapeHtml_(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}