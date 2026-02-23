// femi/frontend/js/shell.js
import { requireAuth, logout as authLogout } from "./auth.js";
import { api } from "./api.js";

/**
 * initUserShell({ active, title })
 * - active: "home" | "tools" | "dashboard" | "profile" (เพื่อ highlight bottom nav)
 * - title: ชื่อหน้าใน header
 */
export async function initUserShell({ active = "home", title = "FEMI" } = {}) {
  requireAuth("../login.html");

  // Inject shell HTML (header + drawer + bottom nav)
  const root = document.getElementById("app") || document.body;

  // Wrap existing content (main) if not already
  const existingMain = root.querySelector("main") || root;

  // Create shell container only once
  if (!document.querySelector("[data-femi-shell='1']")) {
    const shell = document.createElement("div");
    shell.setAttribute("data-femi-shell", "1");
    shell.innerHTML = renderShell_(title, active);
    document.body.prepend(shell);

    // move existing main into shell main slot if main exists in page
    const slot = document.querySelector("[data-shell-slot='main']");
    if (slot && existingMain && existingMain !== slot) {
      // If root is body and existingMain is body, skip moving
      if (existingMain !== document.body) slot.appendChild(existingMain);
    }

    bindShellEvents_();
  } else {
    // Update title + active state if shell already exists
    const t = document.getElementById("shellTitle");
    if (t) t.textContent = title;
    setActiveBottomNav_(active);
  }

  // Update badge now + schedule refresh
  await refreshNotificationBadge_();
  startBadgePolling_();
}

/* ---------------- UI Render ---------------- */

function renderShell_(title, active) {
  return `
  <div class="femi-shell">
    <header class="femi-appbar">
      <div class="femi-left">
        <a class="femi-brand" href="./home.html">FEMI</a>
        <div id="shellTitle" class="femi-title">${escapeHtml_(title)}</div>
      </div>

      <div class="femi-right">
        <button class="icon-btn" id="btnBell" title="การแจ้งเตือน" aria-label="การแจ้งเตือน">
          <span class="icon">🔔</span>
          <span id="bellBadge" class="badge hidden">0</span>
        </button>

        <button class="icon-btn" id="btnMenu" title="เมนู" aria-label="เมนู">
          <span class="icon">☰</span>
        </button>
      </div>
    </header>

    <aside id="drawer" class="femi-drawer hidden" aria-hidden="true">
      <div class="drawer-panel">
        <div class="drawer-head">
          <div class="drawer-title">เมนู</div>
          <button class="icon-btn" id="btnDrawerClose" aria-label="ปิดเมนู">✕</button>
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

        <div class="drawer-foot">
          <button class="btn btn-danger" id="btnLogout">ออกจากระบบ</button>
        </div>
      </div>
      <div class="drawer-backdrop" id="drawerBackdrop"></div>
    </aside>

    <div class="femi-content" data-shell-slot="main"></div>

    <nav class="femi-bottomnav" aria-label="เมนูด้านล่าง">
      <a class="bn-item ${active === "home" ? "active" : ""}" href="./home.html" data-bn="home">
        <span class="bn-icon">🏠</span>
        <span class="bn-label">หน้าแรก</span>
      </a>
      <a class="bn-item ${active === "tools" ? "active" : ""}" href="./tools.html" data-bn="tools">
        <span class="bn-icon">🧰</span>
        <span class="bn-label">เครื่องมือ</span>
      </a>
      <a class="bn-item ${active === "dashboard" ? "active" : ""}" href="./dashboard.html" data-bn="dashboard">
        <span class="bn-icon">📊</span>
        <span class="bn-label">แดชบอร์ด</span>
      </a>
      <a class="bn-item ${active === "profile" ? "active" : ""}" href="./profile.html" data-bn="profile">
        <span class="bn-icon">👤</span>
        <span class="bn-label">โปรไฟล์</span>
      </a>
    </nav>
  </div>

  <style>
    /* Shell base (mobile-first) */
    .femi-shell{min-height:100vh;background:transparent}
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

    .femi-content{padding-bottom:72px;} /* reserve for bottom nav */

    /* Drawer */
    .femi-drawer{position:fixed;inset:0;z-index:60}
    .drawer-panel{
      position:absolute;top:0;right:0;height:100%;width:min(340px, 88vw);
      background:#fff;box-shadow:-16px 0 40px rgba(0,0,0,.16);
      display:flex;flex-direction:column;
    }
    .drawer-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.25)}
    .drawer-head{display:flex;align-items:center;justify-content:space-between;padding:14px;border-bottom:1px solid rgba(0,0,0,.06)}
    .drawer-title{font-weight:900}
    .drawer-nav{display:flex;flex-direction:column;padding:8px 14px;gap:2px;overflow:auto}
    .drawer-nav a{padding:10px 8px;border-radius:12px;text-decoration:none;color:#111}
    .drawer-nav a:hover{background:rgba(0,0,0,.04)}
    .drawer-foot{padding:14px;border-top:1px solid rgba(0,0,0,.06)}
    .btn{border:0;border-radius:12px;padding:12px 14px;font-weight:800;cursor:pointer}
    .btn-danger{background:#dc2626;color:#fff;width:100%}

    /* Bottom nav */
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

  const open = () => {
    drawer.classList.remove("hidden");
    drawer.setAttribute("aria-hidden", "false");
  };
  const close = () => {
    drawer.classList.add("hidden");
    drawer.setAttribute("aria-hidden", "true");
  };

  btnMenu?.addEventListener("click", open);
  btnClose?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);

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
  // รองรับหลายรูปแบบ: {unread}, {data:{unread}}, {success:true,data:{unread}}
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

    // อัปเดตค่า
    badge.textContent = String(unread);

    // ซ่อนถ้าเป็น 0
    if (unread > 0) badge.classList.remove("hidden");
    else badge.classList.add("hidden");
  } catch (e) {
    // ถ้า error ไม่ให้พังหน้า + ซ่อน badge
    badge.classList.add("hidden");
  }
}

function startBadgePolling_() {
  if (badgeTimer) return;
  badgeTimer = setInterval(refreshNotificationBadge_, 30000); // 30s
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