import { api } from "../api.js";
import { t } from "../i18n.js";
import { toast } from "../toast.js";

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }
function setText(sel, v) { const el = qs(sel); if (el) el.textContent = (v ?? "-"); }
function setHTML(sel, v) { const el = qs(sel); if (el) el.innerHTML = v ?? ""; }
function setDisplay(sel, show) { const el = qs(sel); if (el) el.style.display = show ? "" : "none"; }

function isoToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}

function fmtThaiDate(iso) {
  if (!iso) return "-";
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso);
  let y = parseInt(m[1],10);
  const mm = parseInt(m[2],10)-1;
  const dd = parseInt(m[3],10);
  if (y > 2400) y -= 543; // BE -> CE
  const d = new Date(y, mm, dd);
  return d.toLocaleDateString("th-TH", { year:"numeric", month:"long", day:"numeric" });
}

function weekFromLmp(lmpIso) {
  const m = String(lmpIso||"").match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  let y = parseInt(m[1],10);
  let mo = parseInt(m[2],10)-1;
  let da = parseInt(m[3],10);
  if (y > 2400) y -= 543;
  const lmp = new Date(y, mo, da);
  const now = new Date();
  const diffDays = Math.floor((now - lmp) / (1000*60*60*24));
  if (diffDays < 0) return 0;
  return Math.floor(diffDays / 7) + 1;
}

function setActiveTab(tab) {
  qsa(".segmented-btn").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  ["profile","anc","kicks","vitals"].forEach(k => setDisplay(`#tab-${k}`, k === tab));
}

function showModal({ title, bodyHtml, onSave, onDelete, showDelete=false }) {
  const modal = qs("#modal");
  if (!modal) { toast("Modal not found", "danger"); return; }

  setText("#modalTitle", title);
  setHTML("#modalBody", bodyHtml);

  const btnDelete = qs("#btnModalDelete");
  if (btnDelete) btnDelete.style.display = showDelete ? "" : "none";

  const close = () => { modal.style.display = "none"; };

  const bClose = qs("#btnModalClose"); if (bClose) bClose.onclick = close;
  const bCancel = qs("#btnModalCancel"); if (bCancel) bCancel.onclick = close;

  const bSave = qs("#btnModalSave");
  if (bSave) bSave.onclick = async () => {
    try { await onSave(); close(); }
    catch (e) { toast(e?.message || String(e), "danger"); }
  };

  if (btnDelete) btnDelete.onclick = async () => {
    try { await onDelete(); close(); }
    catch (e) { toast(e?.message || String(e), "danger"); }
  };

  modal.style.display = "";
}

function apiErrMsg(e) {
  return e?.error?.message || e?.message || t("common.loadFailed") || "Load failed";
}

export function initPregnancyPage() {
  // tabs
  qsa(".segmented-btn").forEach(btn => btn.addEventListener("click", () => setActiveTab(btn.dataset.tab)));

  // default kick date
  const kickDate = qs("#kickDate");
  if (kickDate && !kickDate.value) kickDate.value = isoToday();

  // kick counter
  let kickCount = 0;
  const renderKickCount = () => setText("#kickCount", String(kickCount));
  const plus = qs("#btnKickPlus"); if (plus) plus.addEventListener("click", () => { kickCount++; renderKickCount(); });
  const minus = qs("#btnKickMinus"); if (minus) minus.addEventListener("click", () => { kickCount = Math.max(0, kickCount-1); renderKickCount(); });
  const reset = qs("#btnKickReset"); if (reset) reset.addEventListener("click", () => { kickCount = 0; renderKickCount(); });

  // actions
  const editProfile = qs("#btnEditProfile"); if (editProfile) editProfile.addEventListener("click", () => openProfileModal());
  const addAnc = qs("#btnAddAnc"); if (addAnc) addAnc.addEventListener("click", () => openAncModal(null));
  const addVitals = qs("#btnAddVitals"); if (addVitals) addVitals.addEventListener("click", () => openVitalsModal(null));

  const saveKickSession = qs("#btnSaveKickSession");
  if (saveKickSession) saveKickSession.addEventListener("click", async () => {
    const date = (qs("#kickDate")?.value) || isoToday();
    if (kickCount <= 0) { toast(t("preg.kicks.validation.count"), "warning"); return; }
    try {
      await api.pregKicksUpsert({ date, count: kickCount, note: "session" });
      toast(t("common.saved"), "success");
      kickCount = 0; renderKickCount();
      await loadAll();
    } catch (e) {
      toast(apiErrMsg(e), "danger");
    }
  });

  loadAll().catch(e => toast(apiErrMsg(e), "danger"));
}

let cache = { profile:null, anc:[], kicks:[], vitals:[], summary:null };

async function loadAll() {
  setText("#pregSummarySubtitle", t("common.loading"));

  const [profile, summary, anc, kicks, vitals] = await Promise.all([
    api.pregProfileGet?.({}).catch(() => null),
    api.pregSummaryToday?.({}).catch(() => null),
    // support both names if some page still calls appt
    (api.pregAncList || api.pregApptList)?.({ limit: 50 }).catch(() => ({ items: [] })),
    api.pregKicksList?.({ limit: 20 }).catch(() => ({ items: [] })),
    api.pregVitalsList?.({ limit: 20 }).catch(() => ({ items: [] })),
  ]);

  cache.profile = profile?.data ?? profile ?? null;
  cache.summary = summary?.data ?? summary ?? null;
  cache.anc = (anc?.data?.items || anc?.items || []).slice();
  cache.kicks = (kicks?.data?.items || kicks?.items || []).slice();
  cache.vitals = (vitals?.data?.items || vitals?.items || []).slice();

  renderProfile();
  renderSummary();
  renderAnc();
  renderKicks();
  renderVitals();
}

function renderSummary() {
  const s = cache.summary || {};
  const w = s?.weekNumber ?? (cache.profile?.lmpDate ? weekFromLmp(cache.profile.lmpDate) : "-");
  const pill = qs("#pregWeekPill");
  if (pill) pill.textContent = (w === "-" || w === null) ? "-" : `${t("preg.summary.week")} ${w}`;

  setText("#pregSummarySubtitle", s?.statusText || t("preg.summary.ready"));
  setText("#pregNextAnc", s?.nextAncDate ? fmtThaiDate(s.nextAncDate) : "-");
  setText("#pregKicksToday", String(s?.kicksToday ?? 0));
  setText("#pregWeightLatest", s?.weightLatest ? `${s.weightLatest} kg` : "-");
  setText("#pregBpLatest", (s?.bpSys && s?.bpDia) ? `${s.bpSys}/${s.bpDia}` : "-");
}

function renderProfile() {
  const p = cache.profile || {};
  setText("#profileLmp", p.lmpDate ? fmtThaiDate(p.lmpDate) : "-");
  setText("#profileEdd", p.eddDate ? fmtThaiDate(p.eddDate) : "-");
  // optional fields depending on your HTML
  setText("#profileGravida", (p.gravida ?? "-"));
  setText("#profilePara", (p.para ?? "-"));
  const wk = p.lmpDate ? weekFromLmp(p.lmpDate) : null;
  setText("#profileWeek", (wk === null ? "-" : String(wk)));
  setText("#profileNotes", p.notes ? p.notes : "-");
}

function renderAnc() {
  const list = qs("#ancList"); if (!list) return;
  list.innerHTML = "";
  const items = (cache.anc || []).sort((a,b)=> String(a.date||"").localeCompare(String(b.date||"")));
  const empty = qs("#ancEmpty"); if (empty) empty.style.display = items.length ? "none" : "";

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
      </div>`;
    row.querySelector("button").onclick = () => openAncModal(it);
    list.appendChild(row);
  }
}

function renderKicks() {
  const list = qs("#kicksList"); if (!list) return;
  list.innerHTML = "";
  const items = (cache.kicks || []).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  const empty = qs("#kicksEmpty"); if (empty) empty.style.display = items.length ? "none" : "";

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
      </div>`;
    row.querySelector("button").onclick = () => openKickModal(it);
    list.appendChild(row);
  }
}

function edemaLabel(code) {
  switch (code) {
    case "none": return t("preg.vitals.edema.none");
    case "mild": return t("preg.vitals.edema.mild");
    case "moderate": return t("preg.vitals.edema.moderate");
    case "severe": return t("preg.vitals.edema.severe");
    default: return "-";
  }
}

function renderVitals() {
  const list = qs("#vitalsList"); if (!list) return;
  list.innerHTML = "";
  const items = (cache.vitals || []).sort((a,b)=> String(b.date||"").localeCompare(String(a.date||"")));
  const empty = qs("#vitalsEmpty"); if (empty) empty.style.display = items.length ? "none" : "";

  for (const it of items) {
    const bp = (it.bpSys && it.bpDia) ? `${it.bpSys}/${it.bpDia}` : "-";
    const w = it.weightKg ? `${it.weightKg} kg` : "-";
    const ed = it.edema ? edemaLabel(it.edema) : "-";
    const row = document.createElement("div");
    row.className = "list-item";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div>
          <div style="font-weight:900">${fmtThaiDate(it.date)}</div>
          <div class="muted" style="margin-top:2px">${t("preg.vitals.weight")}: ${w} • ${t("preg.vitals.bp")}: ${bp} • ${t("preg.vitals.edema")}: ${ed}</div>
        </div>
        <button class="btn">${t("common.edit")}</button>
      </div>`;
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
      <label class="label">${t("preg.profile.notes")}</label>
      <textarea id="mNotes" class="input" rows="3">${p.notes ?? ""}</textarea>
      <div class="muted" style="margin-top:8px">${t("preg.profile.eddAuto") || ""}</div>
    `,
    onSave: async () => {
      const lmpDate = document.querySelector("#mLmp")?.value;
      if (!lmpDate) throw new Error(t("preg.profile.validation.lmp"));
      const notes = document.querySelector("#mNotes")?.value || "";
      await api.pregProfileUpsert({ lmpDate, notes });
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
      <input id="mAncPlace" type="text" class="input" value="${it.place || ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.anc.note")}</label>
      <textarea id="mAncNote" class="input" rows="2">${it.note || ""}</textarea>
    `,
    onSave: async () => {
      const date = document.querySelector("#mAncDate")?.value;
      if (!date) throw new Error(t("preg.anc.validation.date"));
      const place = document.querySelector("#mAncPlace")?.value || "";
      const note = document.querySelector("#mAncNote")?.value || "";
      await (api.pregAncUpsert || api.pregApptUpsert)({ ancId: it.ancId, date, place, note });
      toast(t("common.saved"), "success");
      await loadAll();
    },
    onDelete: async () => {
      await (api.pregAncDelete || api.pregApptDelete)(it.ancId);
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
      const date = document.querySelector("#mKickDate")?.value;
      const count = Number(document.querySelector("#mKickCount")?.value || 0);
      if (!date) throw new Error(t("preg.kicks.validation.date") || t("preg.anc.validation.date"));
      if (!(count >= 0)) throw new Error(t("preg.kicks.validation.count"));
      const note = document.querySelector("#mKickNote")?.value || "";
      await api.pregKicksUpsert({ kickId: it.kickId, date, count, note });
      toast(t("common.saved"), "success");
      await loadAll();
    },
    onDelete: async () => {
      await api.pregKicksDelete(it.kickId);
      toast(t("common.deleted"), "success");
      await loadAll();
    }
  });
}

function openVitalsModal(item) {
  const it = item || {};
  const edema = it.edema || "none";
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
      <label class="label">${t("preg.vitals.edema")}</label>
      <select id="mVEdema" class="input">
        <option value="none"${edema==="none"?" selected":""}>${t("preg.vitals.edema.none")}</option>
        <option value="mild"${edema==="mild"?" selected":""}>${t("preg.vitals.edema.mild")}</option>
        <option value="moderate"${edema==="moderate"?" selected":""}>${t("preg.vitals.edema.moderate")}</option>
        <option value="severe"${edema==="severe"?" selected":""}>${t("preg.vitals.edema.severe")}</option>
      </select>
      <div style="height:10px"></div>
      <label class="label">${t("common.note")}</label>
      <textarea id="mVNote" class="input" rows="2">${it.note || ""}</textarea>
    `,
    onSave: async () => {
      const date = document.querySelector("#mVDate")?.value;
      if (!date) throw new Error(t("preg.vitals.validation.date") || t("preg.anc.validation.date"));
      const weightKg = document.querySelector("#mVWeight")?.value ? Number(document.querySelector("#mVWeight").value) : null;
      const bpSys = document.querySelector("#mVBpSys")?.value ? Number(document.querySelector("#mVBpSys").value) : null;
      const bpDia = document.querySelector("#mVBpDia")?.value ? Number(document.querySelector("#mVBpDia").value) : null;
      const edema = document.querySelector("#mVEdema")?.value || "none";
      const note = document.querySelector("#mVNote")?.value || "";
      await api.pregVitalsUpsert({ vitalId: it.vitalId, date, weightKg, bpSys, bpDia, edema, note });
      toast(t("common.saved"), "success");
      await loadAll();
    },
    onDelete: async () => {
      await api.pregVitalsDelete(it.vitalId);
      toast(t("common.deleted"), "success");
      await loadAll();
    }
  });
}
