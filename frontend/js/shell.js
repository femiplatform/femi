// femi/frontend/js/shell.js
import { requireAuth, logout as authLogout } from "./auth.js";
import { api } from "./api.js";
import { t, applyI18n } from "./i18n.js";
import { Icons } from "./icons.js";

/**
 * Drawer menu:
 * - แสดงเฉพาะ “หัวข้อหลัก” (จาก tools.html)
 * - คลิกหัวข้อหลักเพื่อแสดงหัวข้อย่อย (Accordion: เปิดได้ทีละหัวข้อ)
 * - ปุ่มออกจากระบบเป็นสีแดง (ธีมหลัก) ตัวอักษรสีขาว
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

    // refresh drawer menu text (เผื่อมีเปลี่ยนภาษา)
    const drawerNav = document.getElementById("drawerNav");
    if (drawerNav) drawerNav.innerHTML = renderDrawerMenu_();
    bindDrawerAccordion_();
  }

  applyI18n(document);
  await refreshNotificationBadge_();
  startBadgePolling_();
}

/** โครงสร้างเมนู: ยึดตาม tools.html */
const TOOLS_MENU = [
  {
    id: "cat1",
    titleKey: "tools.cat1Title",
    sections: [
      {
        titleKey: "tools.cat1_1Title",
        items: [
          { href: "./health_age.html", labelKey: "tools.cat1_1_a" },
          { href: "./preventive_health.html", labelKey: "tools.cat1_1_d" },
          { href: "./health_checklist.html", labelKey: "tools.cat1_1_b" },
          { href: "./mood_tracker.html", labelKey: "tools.cat1_1_c" },
        ],
      },
      {
        titleKey: "tools.cat1_2Title",
        items: [
          { href: "./breast_risk.html", labelKey: "tools.cat1_2_a" },
          { href: "./breast_reminder.html", labelKey: "tools.cat1_2_b" },
          { href: "./breast_self_exam.html", labelKey: "tools.cat1_2_c" },
        ],
      },
      {
        titleKey: "tools.cat1_3Title",
        items: [{ href: "./cervical_risk.html", labelKey: "tools.cat1_3_a" }],
      },
      {
        titleKey: "tools.cat1_4Title",
        items: [
          { href: "./menopause_ready.html", labelKey: "tools.cat1_4_a" },
          { href: "./menopause_quiz_basic.html", labelKey: "tools.cat1_4_b1" },
          { href: "./menopause_symptoms.html", labelKey: "tools.cat1_4_b2" },
          { href: "./menopause_health_ready.html", labelKey: "tools.cat1_4_b3" },
          { href: "./menopause_psycho_ready.html", labelKey: "tools.cat1_4_b4" },
          { href: "./menopause_tracker.html", labelKey: "tools.cat1_4_c" },
        ],
      },
    ],
  },
  {
    id: "cat2",
    titleKey: "tools.cat2Title",
    sections: [
      {
        titleKey: null,
        items: [
          { href: "./contraception_smart.html", labelKey: "tools.cat2_a" },
          { href: "./family_planning.html", labelKey: "tools.cat2_b" },
          { href: "./sti_risk_map.html", labelKey: "tools.cat2_c" },
          { href: "./pill_missed_helper.html", labelKey: "tools.cat2_d" },
        ],
      },
    ],
  },
  {
    id: "cat3",
    titleKey: "tools.cat3Title",
    sections: [
      {
        titleKey: null,
        items: [
          { href: "./pregnancy.html", labelKey: "tools.cat3_a" },
          { href: "./preeclampsia_screen.html", labelKey: "tools.cat3_c" },
        ],
      },
    ],
  },
  {
    id: "cat4",
    titleKey: "tools.cat4Title",
    sections: [
      {
        titleKey: null,
        items: [{ href: "./quiz.html", labelKey: "tools.cat4_a" }],
      },
    ],
  },
];

function renderShell_(title, active) {
  return `
  <div class="femi-shell">
    <header class="femi-appbar">
      <div class="femi-left">
        <a class="femi-brand" href="./home.html" aria-label="${escapeHtml_(t("app.name"))}">
          <img class="femi-logo" src="../assets/logo_femi_2.svg" alt="FEMI"/>
        </a>
        <div id="shellTitle" class="femi-title">${escapeHtml_(title)}</div>
      </div>

      <div class="femi-right">
        <button class="icon-btn" id="btnBell" aria-label="${escapeHtml_(t("nav.notifications"))}" title="${escapeHtml_(t("nav.notifications"))}">
          ${Icons.bell()}
          <span id="bellBadge" class="badge hidden">0</span>
        </button>

        <button class="icon-btn" id="btnMenu" aria-label="${escapeHtml_(t("nav.menu"))}" title="${escapeHtml_(t("nav.menu"))}">
          ${Icons.menu()}
        </button>
      </div>
    </header>

    <aside id="drawer" class="femi-drawer hidden" aria-hidden="true">
      <div class="drawer-backdrop" id="drawerBackdrop" aria-label="close"></div>

      <div class="drawer-panel" role="dialog" aria-modal="true">
        <div class="drawer-head">
          <div class="drawer-title" data-i18n="nav.menu">${t("nav.menu")}</div>
          <button class="icon-btn" id="btnDrawerClose" aria-label="${escapeHtml_(t("common.close"))}">
            ${Icons.close()}
          </button>
        </div>

        <!-- ✅ เมนูใหม่แบบ Accordion -->
        <nav class="drawer-nav drawer-acc" id="drawerNav">
          ${renderDrawerMenu_()}
        </nav>

        <div class="drawer-foot">
          <!-- ✅ ปุ่มออกจากระบบ สีแดง/ตัวหนังสือขาว -->
          <button class="btn btn-danger" id="btnLogout" data-i18n="nav.logout">${t("nav.logout")}</button>
        </div>
      </div>
    </aside>

    <div class="femi-content" data-shell-slot="main"></div>

    <nav class="femi-bottomnav" aria-label="เมนูด้านล่าง">
      <a class="bn-item ${active === "home" ? "active" : ""}" href="./home.html" data-bn="home">
        ${Icons.home()}
        <span class="bn-label" data-i18n="nav.home">${t("nav.home")}</span>
      </a>
      <a class="bn-item ${active === "tools" ? "active" : ""}" href="./tools.html" data-bn="tools">
        ${Icons.tools()}
        <span class="bn-label" data-i18n="nav.tools">${t("nav.tools")}</span>
      </a>
      <a class="bn-item ${active === "dashboard" ? "active" : ""}" href="./dashboard.html" data-bn="dashboard">
        ${Icons.dashboard()}
        <span class="bn-label" data-i18n="nav.dashboard">${t("nav.dashboard")}</span>
      </a>
      <a class="bn-item ${active === "profile" ? "active" : ""}" href="./profile.html" data-bn="profile">
        ${Icons.user()}
        <span class="bn-label" data-i18n="nav.profile">${t("nav.profile")}</span>
      </a>
    </nav>
  </div>

  <style>
    .femi-appbar{
      position:sticky;top:0;z-index:50;
      display:flex;align-items:center;justify-content:space-between;
      padding:10px 12px;
      backdrop-filter: blur(10px);
      background: rgba(255,255,255,.68);
      border-bottom: 1px solid rgba(17,24,39,.08);
    }
    .femi-left{display:flex;align-items:center;gap:10px;min-width:0}
    .femi-brand{display:flex;align-items:center;justify-content:center;text-decoration:none}
    .femi-logo{height:24px;width:auto;display:block}
    .femi-title{font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:55vw}
    .femi-right{display:flex;align-items:center;gap:8px}

    .icon-btn{
      position:relative;
      border:1px solid rgba(17,24,39,.10);
      background: rgba(255,255,255,.88);
      border-radius:14px;
      padding:8px 10px;cursor:pointer;
      display:flex;align-items:center;justify-content:center;
    }
    .icon-btn .svg-ic{width:20px;height:20px}
    .badge{
      position:absolute;top:-6px;right:-6px;
      min-width:20px;height:20px;border-radius:999px;
      background:#dc2626;color:#fff;
      font-size:12px;font-weight:900;
      display:flex;align-items:center;justify-content:center;
      padding:0 6px;
      box-shadow: 0 10px 18px rgba(0,0,0,.16);
    }
    .hidden{display:none !important}
    .femi-content{padding-bottom:76px;}

    /* Drawer */
    .femi-drawer{ position:fixed; inset:0; z-index:60; }
    .drawer-backdrop{ position:absolute; inset:0; background:rgba(0,0,0,.25); z-index:0; }
    .drawer-panel{
      position:absolute; top:0; right:0; height:100%;
      width:min(360px, 92vw);
      background:#fff;
      box-shadow:-16px 0 40px rgba(0,0,0,.16);
      display:flex; flex-direction:column;
      z-index:1;
    }
    .drawer-head{display:flex;align-items:center;justify-content:space-between;padding:14px;border-bottom:1px solid rgba(0,0,0,.06)}
    .drawer-title{font-weight:900}

    /* ✅ Accordion menu */
    .drawer-acc{ padding: 10px 14px; gap: 10px; }
    .drawer-section{
      border:1px solid rgba(17,24,39,.08);
      border-radius:16px;
      overflow:hidden;
      background: rgba(255,255,255,.90);
      box-shadow: 0 10px 24px rgba(0,0,0,.06);
    }
    .drawer-section-btn{
      width:100%;
      display:flex;align-items:center;justify-content:space-between;
      gap:10px;
      padding: 12px 12px;
      border:0;
      background: transparent;
      cursor:pointer;
      font-weight: 900;
      text-align:left;
    }
    .drawer-section-btn:hover{ background: rgba(0,0,0,.04); }
    .drawer-section-btn .left{display:flex;align-items:center;gap:10px;min-width:0}
    .drawer-section-btn .ic{
      width:34px;height:34px;border-radius:12px;display:grid;place-items:center;
      border:1px solid rgba(17,24,39,.08);background: rgba(255,255,255,.7);
    }
    .drawer-section-btn .label{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width: 240px;}
    .drawer-section-btn .chev{opacity:.7}
    .drawer-sub{
      display:none;
      padding: 8px 10px 12px;
      border-top: 1px solid rgba(0,0,0,.06);
    }
    .drawer-section.open .drawer-sub{ display:block; }

    .drawer-group-title{
      font-size: 12px;
      font-weight: 900;
      opacity: .75;
      margin: 10px 6px 6px;
    }
    .drawer-link{
      display:block;
      padding: 10px 10px;
      margin: 6px 4px;
      border-radius: 14px;
      border:1px solid rgba(17,24,39,.08);
      background: rgba(255,255,255,.78);
      color:#111;
      text-decoration:none;
      font-weight: 800;
    }
    .drawer-link:hover{ background: rgba(185,28,28,.08); border-color: rgba(185,28,28,.16); }

    .drawer-foot{padding:14px;border-top:1px solid rgba(0,0,0,.06)}
    /* ใช้สีธีมแดง */
    .btn.btn-danger{ background: #b91c1c; color:#fff; }

    .femi-bottomnav{
      position:fixed;left:0;right:0;bottom:0;z-index:55;
      display:grid;grid-template-columns:repeat(4,1fr);
      background: rgba(255,255,255,.92);
      border-top:1px solid rgba(17,24,39,.10);
      padding:10px 10px calc(10px + env(safe-area-inset-bottom));
      backdrop-filter: blur(12px);
    }
    .bn-item{
      text-decoration:none;color:rgba(17,24,39,.72);
      display:flex;flex-direction:column;align-items:center;gap:4px;
      padding:8px 6px;border-radius:16px;
      font-size:12px;font-weight:900;
    }
    .bn-item .svg-ic{width:20px;height:20px}
    .bn-item.active{background:rgba(185,28,28,.10);color:#b91c1c}
  </style>
  `;
}

function renderDrawerMenu_() {
  const iconFor = (id) => {
    if (id === "cat1") return Icons.heartShield ? Icons.heartShield() : Icons.tools();
    if (id === "cat2") return Icons.calendar ? Icons.calendar() : Icons.tools();
    if (id === "cat3") return Icons.baby ? Icons.baby() : (Icons.calendar ? Icons.calendar() : Icons.tools());
    if (id === "cat4") return Icons.quiz ? Icons.quiz() : (Icons.book ? Icons.book() : Icons.tools());
    return Icons.tools();
  };

  return TOOLS_MENU.map((cat) => {
    const title = t(cat.titleKey);

    const subHtml = cat.sections.map(sec => {
      const groupTitle = sec.titleKey
        ? `<div class="drawer-group-title" data-i18n="${sec.titleKey}">${t(sec.titleKey)}</div>`
        : "";
      const links = sec.items.map(it =>
        `<a class="drawer-link" href="${it.href}" data-i18n="${it.labelKey}">${t(it.labelKey)}</a>`
      ).join("");
      return `${groupTitle}${links}`;
    }).join("");

    return `
      <div class="drawer-section" data-acc="${escapeHtml_(cat.id)}">
        <button class="drawer-section-btn" type="button" data-acc-btn="${escapeHtml_(cat.id)}" aria-expanded="false">
          <span class="left">
            <span class="ic">${iconFor(cat.id)}</span>
            <span class="label" data-i18n="${cat.titleKey}">${escapeHtml_(title)}</span>
          </span>
          <span class="chev">${Icons.chevronDown ? Icons.chevronDown() : "▾"}</span>
        </button>
        <div class="drawer-sub" data-acc-panel="${escapeHtml_(cat.id)}">
          ${subHtml}
        </div>
      </div>
    `;
  }).join("");
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

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  // คลิกลิงก์ใน drawer แล้วปิด drawer
  drawer?.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a");
    if (a) close();
  });

  btnLogout?.addEventListener("click", async () => {
    try { await authLogout("../login.html"); } catch { location.href = "../login.html"; }
  });

  btnBell?.addEventListener("click", () => {
    location.href = "./notifications.html";
  });

  bindDrawerAccordion_();
}

/** ✅ Accordion: เปิดได้ทีละหัวข้อหลัก */
function bindDrawerAccordion_(){
  const drawerNav = document.getElementById("drawerNav");
  if (!drawerNav) return;

  drawerNav.querySelectorAll("[data-acc-btn]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-acc-btn");
      if (!id) return;

      drawerNav.querySelectorAll(".drawer-section").forEach(sec => {
        const sid = sec.getAttribute("data-acc");
        const shouldOpen = sid === id && !sec.classList.contains("open");
        sec.classList.toggle("open", shouldOpen);

        const b = sec.querySelector("[data-acc-btn]");
        if (b) b.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
      });
    });
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

function escapeHtml_(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}