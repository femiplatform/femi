import { api } from "../api.js";
import { t } from "../i18n.js";
import { toast } from "../toast.js";

const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));

const isoToday = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

function fmtThaiDate(iso) {
  if (!iso) return "-";
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(iso);
  let y = parseInt(m[1], 10);
  const mm = parseInt(m[2], 10) - 1;
  const dd = parseInt(m[3], 10);
  if (y > 2400) y -= 543; // BE -> CE
  const d = new Date(y, mm, dd);
  return d.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" });
}

function setActiveTab(tab) {
  qsa(".segmented-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  ["profile", "anc", "kicks", "vitals"].forEach((k) => {
    const el = qs(`#tab-${k}`);
    if (el) el.style.display = k === tab ? "" : "none";
  });
}

function showModal({ title, bodyHtml, onSave, onDelete, showDelete = false }) {
  const modal = qs("#modal");
  qs("#modalTitle").textContent = title;
  qs("#modalBody").innerHTML = bodyHtml;
  qs("#btnModalDelete").style.display = showDelete ? "" : "none";

  const close = () => (modal.style.display = "none");
  qs("#btnModalClose").onclick = close;
  qs("#btnModalCancel").onclick = close;

  qs("#btnModalSave").onclick = async () => {
    try {
      await onSave();
      close();
    } catch (e) {
      toast(e?.message || String(e), "danger");
    }
  };

  qs("#btnModalDelete").onclick = async () => {
    try {
      await onDelete();
      close();
    } catch (e) {
      toast(e?.message || String(e), "danger");
    }
  };

  modal.style.display = "";
}

export function initPregnancyPage() {
  qsa(".segmented-btn").forEach((btn) => btn.addEventListener("click", () => setActiveTab(btn.dataset.tab)));

  const kickDate = qs("#kickDate");
  if (kickDate) kickDate.value = isoToday();

  let kickCount = 0;
  const renderKickCount = () => (qs("#kickCount").textContent = String(kickCount));
  qs("#btnKickPlus")?.addEventListener("click", () => { kickCount++; renderKickCount(); });
  qs("#btnKickMinus")?.addEventListener("click", () => { kickCount = Math.max(0, kickCount - 1); renderKickCount(); });
  qs("#btnKickReset")?.addEventListener("click", () => { kickCount = 0; renderKickCount(); });

  qs("#btnEditProfile")?.addEventListener("click", () => openProfileModal());
  qs("#btnAddAnc")?.addEventListener("click", () => openAncModal(null));
  qs("#btnAddVitals")?.addEventListener("click", () => openVitalsModal(null));

  qs("#btnSaveKickSession")?.addEventListener("click", async () => {
    const date = qs("#kickDate").value || isoToday();
    if (kickCount <= 0) return toast(t("preg.kicks.validation.count"), "warning");

    await api.pregKicksUpsert({ logDate: date, kickCount, notes: "session" });
    toast(t("common.saved"), "success");
    kickCount = 0; renderKickCount();
    await loadAll();
  });

  loadAll().catch((e) => toast(e?.message || t("common.loadFailed"), "danger"));
}

let cache = { profile: null, anc: [], kicks: [], vitals: [], summary: null };

async function loadAll() {
  qs("#pregSummarySubtitle").textContent = t("common.loading");

  const [profile, summary, anc, kicks, vitals] = await Promise.all([
    api.pregProfileGet({}).catch(() => ({ data: null })),
    api.pregSummaryToday({}).catch(() => ({ data: null })),
    api.pregAncList({ limit: 50 }).catch(() => ({ data: { items: [] } })),
    api.pregKicksList({ limit: 20 }).catch(() => ({ data: { items: [] } })),
    api.pregVitalsList({ limit: 20 }).catch(() => ({ data: { items: [] } })),
  ]);

  cache.profile = profile?.data ?? null;
  cache.summary = summary?.data ?? null;
  cache.anc = (anc?.data?.items || []).slice();
  cache.kicks = (kicks?.data?.items || []).slice();
  cache.vitals = (vitals?.data?.items || []).slice();

  renderProfile();
  renderSummary();
  renderAnc();
  renderKicks();
  renderVitals();
}

function renderSummary() {
  const s = cache.summary || {};
  const w = s?.gestationalWeeks ?? "-";
  qs("#pregWeekPill").textContent = w === "-" ? "-" : `${t("preg.summary.week")} ${w}`;
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
  qs("#profileWeeks").textContent = (p.gestationalWeeks ?? "-");
  qs("#profileNotes").textContent = p.notes ? p.notes : "-";
}

function renderAnc() {
  const list = qs("#ancList");
  const empty = qs("#ancEmpty");
  list.innerHTML = "";
  const items = (cache.anc || []).sort((a,b)=> String(a.apptDateTime||"").localeCompare(String(b.apptDateTime||"")));
  empty.style.display = items.length ? "none" : "";
  for (const it of items) {
    const dateIso = String(it.apptDateTime || "").slice(0,10);
    const row = document.createElement("div");
    row.className = "list-item";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div>
          <div style="font-weight:900">${dateIso ? fmtThaiDate(dateIso) : "-"}</div>
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
  const items = (cache.kicks || []).sort((a,b)=> String(b.logDate||"").localeCompare(String(a.logDate||"")));
  empty.style.display = items.length ? "none" : "";
  for (const it of items) {
    const row = document.createElement("div");
    row.className = "list-item";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div>
          <div style="font-weight:900">${it.logDate ? fmtThaiDate(it.logDate) : "-"}</div>
          <div class="muted" style="margin-top:2px">${t("preg.kicks.count")}: ${it.kickCount || it.kickCount === 0 ? it.kickCount : (it.kickCount ?? it.kickCount)}</div>
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
    const row = document.createElement("div");
    row.className = "list-item";
    row.style.marginBottom = "10px";
    row.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center">
        <div>
          <div style="font-weight:900">${it.logDate ? fmtThaiDate(it.logDate) : "-"}</div>
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
    bodyHtml: `
      <label class="label">${t("preg.profile.lmp")}</label>
      <input id="mLmp" type="date" class="input" value="${(p.lmpDate||"")}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.profile.notes")}</label>
      <textarea id="mNotes" class="input" rows="3">${p.notes ?? ""}</textarea>
      <div class="muted" style="margin-top:8px">${t("preg.profile.eddAuto")}</div>
    `,
    onSave: async () => {
      const lmpDate = document.querySelector("#mLmp").value;
      if (!lmpDate) throw new Error(t("preg.profile.validation.lmp"));
      const notes = document.querySelector("#mNotes").value || "";
      await api.pregProfileUpsert({ lmpDate, notes });
      toast(t("common.saved"), "success");
      await loadAll();
    }
  });
}

function openAncModal(item) {
  const it = item || {};
  const dateIso = (it.apptDateTime || "").slice(0,10);
  showModal({
    title: item ? t("preg.anc.editTitle") : t("preg.anc.addTitle"),
    showDelete: !!item,
    bodyHtml: `
      <label class="label">${t("preg.anc.date")}</label>
      <input id="mAncDate" type="date" class="input" value="${dateIso || ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.anc.place")}</label>
      <input id="mAncPlace" type="text" class="input" value="${it.place || ""}" placeholder="${t("preg.anc.placePh")}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.anc.note")}</label>
      <textarea id="mAncNote" class="input" rows="2">${it.notes || it.note || ""}</textarea>
    `,
    onSave: async () => {
      const date = document.querySelector("#mAncDate").value;
      if (!date) throw new Error(t("preg.anc.validation.date"));
      const place = document.querySelector("#mAncPlace").value || "";
      const notes = document.querySelector("#mAncNote").value || "";
      // Store as dateTime 09:00 local
      const apptDateTime = `${date}T09:00:00`;
      await api.pregAncUpsert({ apptId: it.apptId, apptDateTime, place, notes, apptType: it.apptType || "ANC", status: it.status || "Scheduled" });
      toast(t("common.saved"), "success");
      await loadAll();
    },
    onDelete: async () => {
      await api.pregAncDelete({ apptId: it.apptId });
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
      <input id="mKickDate" type="date" class="input" value="${it.logDate || ""}" />
      <div style="height:10px"></div>
      <label class="label">${t("preg.kicks.count")}</label>
      <input id="mKickCount" type="number" min="0" class="input" value="${it.kickCount ?? it.kickCount ?? 0}" />
      <div style="height:10px"></div>
      <label class="label">${t("common.note")}</label>
      <textarea id="mKickNote" class="input" rows="2">${it.notes || it.note || ""}</textarea>
    `,
    onSave: async () => {
      const logDate = document.querySelector("#mKickDate").value;
      const kickCount = Number(document.querySelector("#mKickCount").value || 0);
      if (!logDate) throw new Error(t("preg.kicks.validation.date"));
      if (!(kickCount >= 0)) throw new Error(t("preg.kicks.validation.count"));
      const notes = document.querySelector("#mKickNote").value || "";
      await api.pregKicksUpsert({ kickId: it.kickId, logDate, kickCount, notes });
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
      <label class="label">${t("common.note")}</label>
      <textarea id="mVNote" class="input" rows="2">${it.notes || it.note || ""}</textarea>
    `,
    onSave: async () => {
      const logDate = document.querySelector("#mVDate").value;
      if (!logDate) throw new Error(t("preg.vitals.validation.date"));
      const weightKg = document.querySelector("#mVWeight").value ? Number(document.querySelector("#mVWeight").value) : "";
      const bpSystolic = document.querySelector("#mVBpSys").value ? Number(document.querySelector("#mVBpSys").value) : "";
      const bpDiastolic = document.querySelector("#mVBpDia").value ? Number(document.querySelector("#mVBpDia").value) : "";
      const notes = document.querySelector("#mVNote").value || "";
      await api.pregVitalsUpsert({ vitalId: it.vitalId, logDate, weightKg, bpSystolic, bpDiastolic, notes, edema: it.edema || "" });
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
