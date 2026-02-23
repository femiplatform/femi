import { api } from "./api.js";
import { logout as localLogout } from "./auth.js";

const LINKS = [
  { key: "home", label: "หน้าแรก", href: "/app/home.html", icon: "home" },
  { key: "tools", label: "เครื่องมือ", href: "/app/tools.html", icon: "sparkles" },
  { key: "dashboard", label: "แดชบอร์ด", href: "/app/dashboard.html", icon: "layout-dashboard" },
  { key: "profile", label: "โปรไฟล์", href: "/app/profile.html", icon: "user" },
];

const DRAWER_LINKS = [
  { label: "หน้าแรก", href: "/app/home.html", icon: "home" },
  { label: "Preventive", href: "/app/preventive.html", icon: "clipboard-check" },
  { label: "Family Planning", href: "/app/family_planning.html", icon: "calendar-heart" },
  { label: "Pregnancy", href: "/app/pregnancy.html", icon: "baby" },
  { label: "คลังความรู้", href: "/app/knowledge.html", icon: "book-open" },
  { label: "แบบทดสอบ", href: "/app/quiz.html", icon: "clipboard-list" },
  { label: "การแจ้งเตือน", href: "/app/notifications.html", icon: "bell" },
  { label: "โปรไฟล์", href: "/app/profile.html", icon: "user" },
];

function esc(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

function iconSvg(name){
  // Minimal inline SVG set (lucide-like). Keeps bundle small and works offline.
  const icons = {
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5Z"/></svg>',
    sparkles: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3l1.5 4.5L15 9l-4.5 1.5L9 15l-1.5-4.5L3 9l4.5-1.5L9 3Z"/><path d="M19 11l.9 2.7L22 14l-2.1.3L19 17l-.9-2.7L16 14l2.1-.3L19 11Z"/></svg>',
    "layout-dashboard": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="10" width="7" height="11" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21a8 8 0 1 0-16 0"/><circle cx="12" cy="7" r="4"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 7H3s3 0 3-7"/><path d="M10 19a2 2 0 0 0 4 0"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>',
  };
  return icons[name] || icons.home;
}

export async function mountUserShell({ activeKey = "home", pageTitle = "" } = {}) {
  const headerHost = document.getElementById("userHeader");
  const bottomHost = document.getElementById("userBottomNav");
  const drawerHost = document.getElementById("userDrawer");

  if (!headerHost || !bottomHost || !drawerHost) return;

  headerHost.innerHTML = `
  <header class="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-slate-200">
    <div class="mx-auto max-w-xl px-4 py-3 flex items-center justify-between">
      <a href="/app/home.html" class="flex items-center gap-2">
        <img src="/assets/logo.svg" class="h-8" alt="FEMI"/>
        <span class="font-semibold tracking-tight text-slate-900">${esc(pageTitle)}</span>
      </a>
      <div class="flex items-center gap-2">
        <a href="/app/notifications.html" class="relative inline-flex items-center justify-center w-10 h-10 rounded-2xl hover:bg-slate-100" aria-label="การแจ้งเตือน">
          <span class="w-5 h-5 text-slate-700">${iconSvg("bell")}</span>
          <span id="notifBadge" class="hidden absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[11px] leading-[18px] text-center rounded-full bg-rose-600 text-white"></span>
        </a>

        <button id="btnLogout" class="inline-flex items-center justify-center w-10 h-10 rounded-2xl hover:bg-slate-100" aria-label="ออกจากระบบ">
          <span class="w-5 h-5 text-slate-700">${iconSvg("logout")}</span>
        </button>

        <button id="btnMenu" class="inline-flex items-center justify-center w-10 h-10 rounded-2xl hover:bg-slate-100" aria-label="เมนู">
          <span class="w-6 h-6 text-slate-900">${iconSvg("menu")}</span>
        </button>
      </div>
    </div>
  </header>
  `;

  bottomHost.innerHTML = `
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-slate-200 pb-safe">
    <div class="mx-auto max-w-xl px-2">
      <div class="grid grid-cols-4 gap-1 py-2">
        ${LINKS.map(l => `
          <a href="${l.href}" data-key="${l.key}" class="bn-item flex flex-col items-center justify-center gap-1 py-2 rounded-2xl text-slate-600">
            <span class="w-6 h-6">${iconSvg(l.icon)}</span>
            <span class="text-[11px]">${esc(l.label)}</span>
          </a>
        `).join("")}
      </div>
    </div>
  </nav>
  `;

  drawerHost.innerHTML = `
  <div id="drawerOverlay" class="hidden fixed inset-0 z-50 bg-black/30"></div>
  <aside id="drawer" class="fixed top-0 right-0 z-50 h-full w-[86%] max-w-sm bg-white shadow-xl translate-x-full transition-transform">
    <div class="px-4 py-4 border-b border-slate-200 flex items-center justify-between">
      <div class="font-bold text-slate-900">เมนู</div>
      <button id="btnClose" class="w-10 h-10 rounded-2xl hover:bg-slate-100">✕</button>
    </div>
    <div class="p-2">
      ${DRAWER_LINKS.map(x => `
        <a class="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-slate-50" href="${x.href}">
          <span class="w-5 h-5 text-slate-700">${iconSvg(x.icon)}</span>
          <span class="text-slate-900">${esc(x.label)}</span>
        </a>
      `).join("")}
    </div>
    <div class="mt-auto p-4 border-t border-slate-200 text-xs text-slate-500">
      FEMI • User
    </div>
  </aside>
  `;

  // active bottom nav
  [...bottomHost.querySelectorAll(".bn-item")].forEach(a => {
    if (a.dataset.key === activeKey) {
      a.classList.add("bg-rose-50", "text-rose-700");
    }
  });

  // drawer controls
  const overlay = document.getElementById("drawerOverlay");
  const drawer = document.getElementById("drawer");
  const openBtn = document.getElementById("btnMenu");
  const closeBtn = document.getElementById("btnClose");

  function open(){
    overlay.classList.remove("hidden");
    drawer.classList.remove("translate-x-full");
    document.body.classList.add("overflow-hidden");
  }
  function close(){
    overlay.classList.add("hidden");
    drawer.classList.add("translate-x-full");
    document.body.classList.remove("overflow-hidden");
  }

  openBtn?.addEventListener("click", open);
  overlay?.addEventListener("click", close);
  closeBtn?.addEventListener("click", close);

  // logout
  document.getElementById("btnLogout")?.addEventListener("click", async () => {
    try { await api.logout(); } catch {}
    await localLogout("/login.html");
  });

  // notification badge (best-effort)
  try {
    const list = await api.notificationsList();
    const count = Array.isArray(list) ? list.length : (list?.items?.length || 0);
    const badge = document.getElementById("notifBadge");
    if (badge && count > 0) {
      badge.textContent = count > 99 ? "99+" : String(count);
      badge.classList.remove("hidden");
    }
  } catch {
    // ignore
  }
}
