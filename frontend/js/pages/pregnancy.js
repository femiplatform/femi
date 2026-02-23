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
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) {
    // try datetime
    const dt = new Date(iso);
    if (!isNaN(dt.getTime())) return dt.toLocaleDateString("th-TH", { year:"numeric", month:"long", day:"numeric" });
    return iso;
  }
  let y = parseInt(m[1],10);
  const mm = parseInt(m[2],10)-1;
  const dd = parseInt(m[3],10);
  if (y > 2400) y -= 543;
  const d = new Date(y, mm, dd);
  return d.toLocaleDateString("th-TH", { year:"numeric", month:"long", day:"numeric" });
}

function fmtThaiDateTime(iso) {
  if (!iso) return "-";
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return iso;
  return dt.toLocaleString("th-TH", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
}

function edemaLabel(v) {
  const key = `preg.vitals.edema.${v || "none"}`;
  const s = t(key);
  return s === key ? (v || "-") : s;
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

function normalizeApiError(e) {
  const err = e?.error || e;
  const code = err?.code || "ERR_SERVER";
  const msg = err?.message || e?.message || t("errors.generic");
  return { code, message: msg };
}

export function initPregnancyPage() {
  qsa(".segmented-btn").forEach(btn => btn.addEventListener("click", () => setActiveTab(btn.dataset.tab)));

  const kickDate = qs("#kickDate");
  if (kickDate) kickDate.value = isoToday();

  let kickCount = 0;
  const renderKickCount = () => { qs("#kickCount").textContent = String(kickCount); };
  qs("#btnKickPlus")?.addEventListener("click", () => { kickCount++; renderKickCount(); });
  qs("#btnKickMinus")?.addEventListener("click", () => { kickCount = Math.max(0, kickCount-1); renderKickCount(); });
  qs("#btnKickReset")?.addEventListener("click", () => { kickCount = 0; renderKickCount(); });

  qs("#btnEditProfile")?.addEventListener("click", () => openProfileModal());
  qs("#btnAddAnc")?.addEventListener("click", () => openApptModal(null));
  qs("#btnAddVitals")?.addEventListener("click", () => openVitalsModal(null));

  qs("#btnSaveKickSession")?.addEventListener("click", async () => {
    const logDate = qs("#kickDate").value || isoToday();
    if (kickCount <= 0) return toast(t("preg.kicks.validation.count"), "warning");
    try {
      await api.pregKicksUpsert({ logDate, kickCount, notes: "session" });
      toast(t("common.saved"), "success");
      kickCount = 0; renderKickCount();
      await loadAll();
    } catch (e) {
      toast(normalizeApiError(e).message, "danger");
    }
  });

  loadAll().catch(e => toast(normalizeApiError(e).message, "danger"));
}

let cache = { profile:null, appts:[], kicks:[], vitals:[], summary:null };

async function loadAll() {
  qs("#pregSummarySubtitle").textContent = t("common.loading");
  const [profile, summary, appts, kicks, vitals] = await Promise.all([
    api.pregProfileGet({}).catch(() => null),
    api.pregSummaryToday({}).catch(() => null),
    api.pregApptList({ limit: 50 }).catch(() => ({ items: [] })),
    api.pregKicksList({ limit: 20 }).catch(() => ({ items: [] })),
    api.pregVitalsList({ limit: 20 }).catch(() => ({ items: [] })),
  ]);

  cache.profile = profile?.data ?? profile ?? null;
  cache.summary = summary?.data ?? summary ?? null;
  cache.appts = appts?.data?.items ?? appts?.items ?? [];
  cache.kicks = kicks?.data?.items ?? kicks?.items ?? [];
  cache.vitals = vitals?.data?.items ?? vitals?.items ?? [];

  renderProfile();
  renderSummary();
  renderAppts();
  renderKicks();
  renderVitals();
}

function renderSummary() {
  const s = cache.summary || {};
  const w = s?.weekNumber ?? "-";
  qs("#pregWeekPill").textContent = (w === "-" ? "-" : `${t("preg.summary.week")} ${w}`);
  qs("#pregSummarySubtitle").textContent = s?.statusText || t("preg.summary.ready");
  qs("#pregNextAnc").textContent = s?.nextAncDateTime ? fmtThaiDateTime(s.nextAncDateTime) : "-";
  qs("#pregKicksToday").textContent = String(s?.kicksToday ?? 0);
  qs("#pregWeightLatest").textContent = s?.weightLatest ? `${s.weightLatest} kg` : "-";
  qs("#pregBpLatest").textContent = (s?.bpSystolic && s?.bpDiastolic) ? `${s.bpSystolic}/${s.bpDiastolic}` : "-";
}

function renderProfile() {
  const p = cache.profile || {};
  qs("#profileLmp").textContent = p.lmpDate ? fmtThaiDate(p.lmpDate) : "-";
  qs("#profileEdd").textContent = p.eddDate ? fmtThaiDate(p.eddDate) : "-";
  qs("#profileGravida").textContent = p.gravida ?? "-";
  qs("#profilePara").textContent = p.para ?? "-";
  qs("#profileNotes").textContent = p.notes || "-";
}

function renderAppts() {
  const list = qs("#ancList");
  const empty = qs("#ancEmpty");
  list.innerHTML = "";
  const items = (cache.appts || []).sort((a,b)=> String(a.apptDateTime||"").localeCompare(String(b.apptDateTime||"")));
  empty.style.display = items.length ? "none" : "";
  for (const it of items) {
    const row = document.createElement("div");
    row.className = "list-item";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div>
          <div style="font-weight:900">${fmtThaiDateTime(it.apptDateTime)}</div>
          <div class="muted" style="margin-top:2px">${it.apptType || "ANC"} • ${it.place || "-"}</div>
        </div>
        <button class="btn">${t("common.edit")}</button>
      </div>
    `;
    row.querySelector("button").onclick = () => openApptModal(it);
    list.appendChild(row);
  }
}

function renderKicks() {
  const list = qs("#kicksList");
  const empty = qs("#kicksEmpty");
  list.innerHTML = "";
  const items = (cache.kicks || []).sort((a,b)=> String(b.logDate||"").localeCompare(String(a.logDate||"")));
  empty.style.display = items.length ? "none" : "";
  for (const it of items) {
    const row = document.createElement("div");
    row.className = "list-item";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div>
          <div style="font-weight:900">${fmtThaiDate(it.logDate)}</div>
          <div class="muted" style="margin-top:2px">${t("preg.kicks.count")}: ${it.kickCount || 0}</div>
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
  const items = (cache.vitals || []).sort((a,b)=> String(b.logDate||"").localeCompare(String(a.logDate||"")));
  empty.style.display = items.length ? "none" : "";
  for (const it of items) {
    const bp = (it.bpSystolic && it.bpDiastolic) ? `${it.bpSystolic}/${it.bpDiastolic}` : "-";
    const w = it.weightKg ? `${it.weightKg} kg` : "-";
    const ed = it.edema ? edemaLabel(it.edema) : "-";
    const row = document.createElement("div");
    row.className = "list-item";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div>
          <div style="font-weight:900">${fmtThaiDate(it.logDate)}</div>
          <div class="muted" style="margin-top:2px">${t("preg.vitals.weight")}: ${w} • ${t("preg.vitals.bp")}: ${bp} • ${t("preg.vitals.edema")}: ${ed}</div>
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
    bodyHtml: `
      <label class="label">${t("preg.profile.lmp")}</label>
      <input id="mLmp" type="date" class="input" value="${p.lmpDate || ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.profile.notes")}</label>
      <textarea id="mNotes" class="input" rows="3">${p.notes || ""}</textarea>
      <div class="muted" style="margin-top:8px">${t("preg.profile.eddAuto")}</div>
    `,
    onSave: async () => {
      const lmpDate = qs("#mLmp").value;
      if (!lmpDate) throw new Error(t("preg.profile.validation.lmp"));
      const notes = qs("#mNotes").value || "";
      await api.pregProfileUpsert({ lmpDate, notes });
      toast(t("common.saved"), "success");
      await loadAll();
    }
  });
}

function openApptModal(item) {
  const it = item || {};
  const val = it.apptDateTime ? toDatetimeLocal_(it.apptDateTime) : "";
  showModal({
    title: item ? t("preg.anc.editTitle") : t("preg.anc.addTitle"),
    showDelete: !!item,
    bodyHtml: `
      <label class="label">${t("preg.anc.dateTime")}</label>
      <input id="mApptDT" type="datetime-local" class="input" value="${val}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.anc.type")}</label>
      <select id="mApptType" class="input">
        ${["ANC","US","LAB","OTHER"].map(v=>`<option value="${v}" ${String(it.apptType||"ANC")===v?"selected":""}>${v}</option>`).join("")}
      </select>
      <div style="height:10px"></div>
      <label class="label">${t("preg.anc.place")}</label>
      <input id="mApptPlace" type="text" class="input" value="${it.place || ""}" placeholder="${t("preg.anc.placePh")}" />
      <div style="height:10px"></div>
      <label class="label">${t("common.note")}</label>
      <textarea id="mApptNotes" class="input" rows="2">${it.notes || ""}</textarea>
    `,
    onSave: async () => {
      const apptDateTimeLocal = qs("#mApptDT").value;
      if (!apptDateTimeLocal) throw new Error(t("preg.anc.validation.dateTime"));
      const apptDateTime = new Date(apptDateTimeLocal).toISOString();
      const apptType = qs("#mApptType").value || "ANC";
      const place = qs("#mApptPlace").value || "";
      const notes = qs("#mApptNotes").value || "";
      await api.pregApptUpsert({ apptId: it.apptId, apptDateTime, apptType, place, notes, status: it.status || "scheduled", pregnancyId: it.pregnancyId });
      toast(t("common.saved"), "success");
      await loadAll();
    },
    onDelete: async () => {
      await api.pregApptDelete({ apptId: it.apptId });
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
      <input id="mKDate" type="date" class="input" value="${it.logDate || ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.kicks.count")}</label>
      <input id="mKCount" type="number" min="0" class="input" value="${it.kickCount ?? 0}" />
      <div style="height:10px"></div>
      <label class="label">${t("common.note")}</label>
      <textarea id="mKNotes" class="input" rows="2">${it.notes || ""}</textarea>
    `,
    onSave: async () => {
      const logDate = qs("#mKDate").value;
      const kickCount = Number(qs("#mKCount").value || 0);
      if (!logDate) throw new Error(t("preg.kicks.validation.date"));
      if (!(kickCount >= 0)) throw new Error(t("preg.kicks.validation.count"));
      const notes = qs("#mKNotes").value || "";
      await api.pregKicksUpsert({ kickId: it.kickId, logDate, kickCount, notes, pregnancyId: it.pregnancyId });
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
  const edema = it.edema || "none";
  showModal({
    title: item ? t("preg.vitals.editTitle") : t("preg.vitals.addTitle"),
    showDelete: !!item,
    bodyHtml: `
      <label class="label">${t("preg.vitals.date")}</label>
      <input id="mVDate" type="date" class="input" value="${it.logDate || ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.vitals.weight")}</label>
      <input id="mVWeight" type="number" step="0.1" min="0" class="input" value="${it.weightKg ?? ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.vitals.bp")}</label>
      <div style="display:flex; gap:10px">
        <input id="mVBpSys" type="number" min="0" class="input" placeholder="SYS" value="${it.bpSystolic ?? ""}" />
        <input id="mVBpDia" type="number" min="0" class="input" placeholder="DIA" value="${it.bpDiastolic ?? ""}" />
      </div>
      <div style="height:10px"></div>
      <label class="label">${t("preg.vitals.edema")}</label>
      <select id="mVEdema" class="input">
        ${["none","mild","moderate","severe"].map(v=>`<option value="${v}" ${v===edema?"selected":""}>${edemaLabel(v)}</option>`).join("")}
      </select>
      <div style="height:10px"></div>
      <label class="label">${t("common.note")}</label>
      <textarea id="mVNotes" class="input" rows="2">${it.notes || ""}</textarea>
    `,
    onSave: async () => {
      const logDate = qs("#mVDate").value;
      if (!logDate) throw new Error(t("preg.vitals.validation.date"));
      const weightKg = qs("#mVWeight").value ? Number(qs("#mVWeight").value) : "";
      const bpSystolic = qs("#mVBpSys").value ? Number(qs("#mVBpSys").value) : "";
      const bpDiastolic = qs("#mVBpDia").value ? Number(qs("#mVBpDia").value) : "";
      const edema = qs("#mVEdema").value || "none";
      const notes = qs("#mVNotes").value || "";
      await api.pregVitalsUpsert({ vitalId: it.vitalId, logDate, weightKg, bpSystolic, bpDiastolic, edema, notes, pregnancyId: it.pregnancyId });
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

// Convert ISO string to datetime-local value (yyyy-mm-ddThh:mm)
function toDatetimeLocal_(iso) {
  const dt = new Date(iso);
  if (isNaN(dt.getTime())) return "";
  const pad = (n)=> String(n).padStart(2,"0");
  return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}
