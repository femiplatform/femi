import { api } from "../api.js";
import { t } from "../i18n.js";
import { toast } from "../toast.js";

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

function isoToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function fmtThaiDate(iso) {
  if (!iso) return "-";
  // normalize: if year looks like BE, convert to CE
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return iso;
  let y = parseInt(m[1],10);
  const mm = parseInt(m[2],10)-1;
  const dd = parseInt(m[3],10);
  if (y > 2400) y -= 543;
  const d = new Date(y, mm, dd);
  return d.toLocaleDateString("th-TH", { year:"numeric", month:"long", day:"numeric" });
}

function setActiveTab(tab) {
  qsa(".segmented-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  ["profile","anc","kicks","vitals"].forEach(k => {
    const el = qs(`#tab-${k}`);
    if (el) el.style.display = (k === tab) ? "" : "none";
  });
}

function showModal({ title, bodyHtml, onSave, onDelete, showDelete=false }) {
  const modal = qs("#modal");
  qs("#modalTitle").textContent = title;
  qs("#modalBody").innerHTML = bodyHtml;
  qs("#btnModalDelete").style.display = showDelete ? "" : "none";
  const close = () => { modal.style.display = "none"; };
  qs("#btnModalClose").onclick = close;
  qs("#btnModalCancel").onclick = close;
  qs("#btnModalSave").onclick = async () => {
    try { await onSave(); close(); }
    catch (e) { toast(e?.message || String(e), "danger"); }
  };
  qs("#btnModalDelete").onclick = async () => {
    try { await onDelete(); close(); }
    catch (e) { toast(e?.message || String(e), "danger"); }
  };
  modal.style.display = "";
}

function normalizeApiError(err) {
  const code = err?.code || err?.error?.code || "ERR_SERVER";
  return {
    code,
    message: err?.message || err?.error?.message || t("errors.generic")
  };
}

export function initPregnancyPage() {
  // tabs
  qsa(".segmented-btn").forEach(btn => {
    btn.addEventListener("click", () => setActiveTab(btn.dataset.tab));
  });

  // default kick date
  const kickDate = qs("#kickDate");
  if (kickDate) kickDate.value = isoToday();

  // kick counter
  let kickCount = 0;
  const renderKickCount = () => { qs("#kickCount").textContent = String(kickCount); };
  qs("#btnKickPlus")?.addEventListener("click", () => { kickCount++; renderKickCount(); });
  qs("#btnKickMinus")?.addEventListener("click", () => { kickCount = Math.max(0, kickCount-1); renderKickCount(); });
  qs("#btnKickReset")?.addEventListener("click", () => { kickCount = 0; renderKickCount(); });

  // actions
  qs("#btnEditProfile")?.addEventListener("click", () => openProfileModal());
  qs("#btnAddAnc")?.addEventListener("click", () => openAncModal(null));
  qs("#btnAddVitals")?.addEventListener("click", () => openVitalsModal(null));
  qs("#btnSaveKickSession")?.addEventListener("click", async () => {
    const date = qs("#kickDate").value || isoToday();
    if (kickCount <= 0) {
      toast(t("preg.kicks.validation.count"), "warning");
      return;
    }
    try {
      await api.pregKicksUpsert({ date, count: kickCount, note: "session" });
      toast(t("common.saved"), "success");
      kickCount = 0; renderKickCount();
      await loadAll();
    } catch (e) {
      const ne = normalizeApiError(e);
      toast(ne.message, "danger");
    }
  });

  // initial load
  loadAll().catch(e => toast(normalizeApiError(e).message, "danger"));
}

let cache = { profile:null, anc:[], kicks:[], vitals:[], summary:null };

async function loadAll() {
  qs("#pregSummarySubtitle").textContent = t("common.loading");
  const [profile, summary, anc, kicks, vitals] = await Promise.all([
    api.pregProfileGet({}).catch(() => null),
    api.pregSummaryToday({}).catch(() => null),
    api.pregAncList({ limit: 50 }).catch(() => ({ items: [] })),
    api.pregKicksList({ limit: 20 }).catch(() => ({ items: [] })),
    api.pregVitalsList({ limit: 20 }).catch(() => ({ items: [] })),
  ]);

  cache.profile = profile?.data || profile || null;
  cache.summary = summary?.data || summary || null;
  cache.anc = (anc?.data?.items || anc?.items || anc?.data || anc || []).slice();
  cache.kicks = (kicks?.data?.items || kicks?.items || kicks?.data || kicks || []).slice();
  cache.vitals = (vitals?.data?.items || vitals?.items || vitals?.data || vitals || []).slice();

  renderProfile();
  renderSummary();
  renderAnc();
  renderKicks();
  renderVitals();
}

function renderSummary() {
  const s = cache.summary || {};
  const w = s?.weekNumber ?? "-";
  qs("#pregWeekPill").textContent = (w === "-" ? "-" : `${t("preg.summary.week")} ${w}`);
  qs("#pregSummarySubtitle").textContent = s?.statusText || t("preg.summary.ready");
  qs("#pregNextAnc").textContent = s?.nextAncDate ? fmtThaiDate(s.nextAncDate) : "-";
  qs("#pregKicksToday").textContent = String(s?.kicksToday ?? 0);
  qs("#pregWeightLatest").textContent = s?.weightLatest ? `${s.weightLatest} kg` : "-";
  qs("#pregBpLatest").textContent = (s?.bpSys && s?.bpDia) ? `${s.bpSys}/${s.bpDia}` : "-";
}

function renderProfile() {
  const p = cache.profile || {};
  qs("#profileLmp").textContent = p.lmpDate ? fmtThaiDate(p.lmpDate) : "-";
  qs("#profileEdd").textContent = p.eddDate ? fmtThaiDate(p.eddDate) : "-";
  qs("#profileGravida").textContent = p.gravida ?? "-";
  qs("#profilePara").textContent = p.para ?? "-";
  qs("#profileNotes").textContent = p.notes ? p.notes : "-";
}

function renderAnc() {
  const list = qs("#ancList");
  const empty = qs("#ancEmpty");
  list.innerHTML = "";
  const items = (cache.anc || []).sort((a,b)=> String(a.date||"").localeCompare(String(b.date||"")));
  empty.style.display = items.length ? "none" : "";
  for (const it of items) {
    const row = document.createElement("div");
    row.className = "list-item";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div>
          <div style="font-weight:900">${fmtThaiDate(it.date)}</div>
          <div class="muted" style="margin-top:2px">${it.place || "-"}</div>
        </div>
        <button class="btn">${t("common.edit")}</button>
      </div>
    `;
    row.querySelector("button").onclick = () => openAncModal(it);
    list.appendChild(row);
  }
}

function renderKicks() {
  const list = qs("#kicksList");
  const empty = qs("#kicksEmpty");
  list.innerHTML = "";
  const items = (cache.kicks || []).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  empty.style.display = items.length ? "none" : "";
  for (const it of items) {
    const row = document.createElement("div");
    row.className = "list-item";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div>
          <div style="font-weight:900">${fmtThaiDate(it.date)}</div>
          <div class="muted" style="margin-top:2px">${t("preg.kicks.count")}: ${it.count || 0}</div>
        </div>
        <button class="btn">${t("common.edit")}</button>
      </div>
    `;
    row.querySelector("button").onclick = () => openKickModal(it);
    list.appendChild(row);
  }
}

function renderVitals() {
  const list = qs("#vitalsList");
  const empty = qs("#vitalsEmpty");
  list.innerHTML = "";
  const items = (cache.vitals || []).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  empty.style.display = items.length ? "none" : "";
  for (const it of items) {
    const bp = (it.bpSys && it.bpDia) ? `${it.bpSys}/${it.bpDia}` : "-";
    const w = it.weightKg ? `${it.weightKg} kg` : "-";
    const row = document.createElement("div");
    row.className = "list-item";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div>
          <div style="font-weight:900">${fmtThaiDate(it.date)}</div>
          <div class="muted" style="margin-top:2px">${t("preg.vitals.weight")}: ${w} • ${t("preg.vitals.bp")}: ${bp}</div>
        </div>
        <button class="btn">${t("common.edit")}</button>
      </div>
    `;
    row.querySelector("button").onclick = () => openVitalsModal(it);
    list.appendChild(row);
  }
}

function openProfileModal() {
  const p = cache.profile || {};
  showModal({
    title: t("preg.profile.editTitle"),
    showDelete: false,
    bodyHtml: `
      <label class="label">${t("preg.profile.lmp")}</label>
      <input id="mLmp" type="date" class="input" value="${(p.lmpDate||"")}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.profile.gravida")}</label>
      <input id="mG" type="number" min="1" class="input" value="${p.gravida ?? ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.profile.para")}</label>
      <input id="mP" type="number" min="0" class="input" value="${p.para ?? ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.profile.notes")}</label>
      <textarea id="mNotes" class="input" rows="3">${p.notes ?? ""}</textarea>
      <div class="muted" style="margin-top:8px">${t("preg.profile.eddAuto")}</div>
    `,
    onSave: async () => {
      const lmpDate = document.querySelector("#mLmp").value;
      if (!lmpDate) throw new Error(t("preg.profile.validation.lmp"));
      const gravida = Number(document.querySelector("#mG").value || 1);
      const para = Number(document.querySelector("#mP").value || 0);
      const notes = document.querySelector("#mNotes").value || "";
      await api.pregProfileUpsert({ lmpDate, gravida, para, notes });
      toast(t("common.saved"), "success");
      await loadAll();
    }
  });
}

function openAncModal(item) {
  const it = item || {};
  showModal({
    title: item ? t("preg.anc.editTitle") : t("preg.anc.addTitle"),
    showDelete: !!item,
    bodyHtml: `
      <label class="label">${t("preg.anc.date")}</label>
      <input id="mAncDate" type="date" class="input" value="${it.date || ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.anc.place")}</label>
      <input id="mAncPlace" type="text" class="input" value="${it.place || ""}" placeholder="${t("preg.anc.placePh")}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.anc.note")}</label>
      <textarea id="mAncNote" class="input" rows="2">${it.note || ""}</textarea>
    `,
    onSave: async () => {
      const date = document.querySelector("#mAncDate").value;
      if (!date) throw new Error(t("preg.anc.validation.date"));
      const place = document.querySelector("#mAncPlace").value || "";
      const note = document.querySelector("#mAncNote").value || "";
      await api.pregAncUpsert({ ancId: it.ancId, date, place, note });
      toast(t("common.saved"), "success");
      await loadAll();
    },
    onDelete: async () => {
      await api.pregAncDelete({ ancId: it.ancId });
      toast(t("common.deleted"), "success");
      await loadAll();
    }
  });
}

function openKickModal(item) {
  const it = item || {};
  showModal({
    title: t("preg.kicks.editTitle"),
    showDelete: !!item,
    bodyHtml: `
      <label class="label">${t("preg.kicks.sessionDate")}</label>
      <input id="mKickDate" type="date" class="input" value="${it.date || ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.kicks.count")}</label>
      <input id="mKickCount" type="number" min="0" class="input" value="${it.count ?? 0}" />
      <div style="height:10px"></div>
      <label class="label">${t("common.note")}</label>
      <textarea id="mKickNote" class="input" rows="2">${it.note || ""}</textarea>
    `,
    onSave: async () => {
      const date = document.querySelector("#mKickDate").value;
      const count = Number(document.querySelector("#mKickCount").value || 0);
      if (!date) throw new Error(t("preg.kicks.validation.date"));
      if (!(count >= 0)) throw new Error(t("preg.kicks.validation.count"));
      const note = document.querySelector("#mKickNote").value || "";
      await api.pregKicksUpsert({ kickId: it.kickId, date, count, note });
      toast(t("common.saved"), "success");
      await loadAll();
    },
    onDelete: async () => {
      await api.pregKicksDelete({ kickId: it.kickId });
      toast(t("common.deleted"), "success");
      await loadAll();
    }
  });
}

function openVitalsModal(item) {
  const it = item || {};
  showModal({
    title: item ? t("preg.vitals.editTitle") : t("preg.vitals.addTitle"),
    showDelete: !!item,
    bodyHtml: `
      <label class="label">${t("preg.vitals.date")}</label>
      <input id="mVDate" type="date" class="input" value="${it.date || ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.vitals.weight")}</label>
      <input id="mVWeight" type="number" step="0.1" min="0" class="input" value="${it.weightKg ?? ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.vitals.bp")}</label>
      <div style="display:flex; gap:10px">
        <input id="mVBpSys" type="number" min="0" class="input" placeholder="SYS" value="${it.bpSys ?? ""}" />
        <input id="mVBpDia" type="number" min="0" class="input" placeholder="DIA" value="${it.bpDia ?? ""}" />
      </div>
      <div style="height:10px"></div>
      <label class="label">${t("common.note")}</label>
      <textarea id="mVNote" class="input" rows="2">${it.note || ""}</textarea>
    `,
    onSave: async () => {
      const date = document.querySelector("#mVDate").value;
      if (!date) throw new Error(t("preg.vitals.validation.date"));
      const weightKg = document.querySelector("#mVWeight").value ? Number(document.querySelector("#mVWeight").value) : null;
      const bpSys = document.querySelector("#mVBpSys").value ? Number(document.querySelector("#mVBpSys").value) : null;
      const bpDia = document.querySelector("#mVBpDia").value ? Number(document.querySelector("#mVBpDia").value) : null;
      const note = document.querySelector("#mVNote").value || "";
      await api.pregVitalsUpsert({ vitalId: it.vitalId, date, weightKg, bpSys, bpDia, note });
      toast(t("common.saved"), "success");
      await loadAll();
    },
    onDelete: async () => {
      await api.pregVitalsDelete({ vitalId: it.vitalId });
      toast(t("common.deleted"), "success");
      await loadAll();
    }
  });
}
