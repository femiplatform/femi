import { initUserShell } from "../shell.js";
import { api } from "../api.js";
import { t, applyI18n } from "../i18n.js";
import { toast, setLoading } from "../ui.js";

await initUserShell({ active: "tools", title: t("fp.title") });
applyI18n(document);

const elLoading = document.getElementById("loading");
const calTitle = document.getElementById("calTitle");
const calGrid = document.getElementById("calGrid");
const predText = document.getElementById("predText");
const predDetail = document.getElementById("predDetail");

const btnPrev = document.getElementById("btnPrev");
const btnNext = document.getElementById("btnNext");
const btnAddCycle = document.getElementById("btnAddCycle");
const btnRecompute = document.getElementById("btnRecompute");

const cyclesList = document.getElementById("cyclesList");

// modal
const logModal = document.getElementById("logModal");
const btnCloseLog = document.getElementById("btnCloseLog");
const logBackdrop = document.getElementById("logBackdrop");
const btnSaveLog = document.getElementById("btnSaveLog");
const logDateText = document.getElementById("logDateText");
const bleeding = document.getElementById("bleeding");
const mood = document.getElementById("mood");
const symptoms = document.getElementById("symptoms");
const hadSex = document.getElementById("hadSex");
const sexProtection = document.getElementById("sexProtection");
const pillTaken = document.getElementById("pillTaken");
const notes = document.getElementById("notes");


// cycle modal
const cycleModal = document.getElementById("cycleModal");
const cycleBackdrop = document.getElementById("cycleBackdrop");
const btnCloseCycle = document.getElementById("btnCloseCycle");
const cycleModalTitle = document.getElementById("cycleModalTitle");
const btnSaveCycle = document.getElementById("btnSaveCycle");
const btnDeleteCycle = document.getElementById("btnDeleteCycle");

const cycleStart = document.getElementById("cycleStart");
const cycleEnd = document.getElementById("cycleEnd");
const cycleLen = document.getElementById("cycleLen");
const cycleFlow = document.getElementById("cycleFlow");
const cyclePain = document.getElementById("cyclePain");
const cycleNotes = document.getElementById("cycleNotes");

let view = new Date();
view = new Date(view.getFullYear(), view.getMonth(), 1);

let cacheCycles = [];
let cachePred = null;
let cacheLogsByDate = new Map(); // iso -> log

function isoDate(d){ // YYYY-MM-DD
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth()+1).padStart(2,"0");
  const dd = String(d.getDate()).padStart(2,"0");
  return `${yyyy}-${mm}-${dd}`;
}
function ddmmyyyyFromIso(iso){
  const [y,m,d] = iso.split("-");
  return `${d}-${m}-${y}`;
}
function fmtThaiLong(iso){
  if(!iso) return t("common.none");
  return new Date(iso).toLocaleDateString("th-TH",{dateStyle:"long"});
}

function monthTitle(d){
  return d.toLocaleDateString("th-TH", { month:"long", year:"numeric" });
}

function addDays(d, n){
  const x = new Date(d.getTime());
  x.setDate(x.getDate()+n);
  return x;
}

function openLogModal(iso){
  logDateText.value = ddmmyyyyFromIso(iso);

  const existing = cacheLogsByDate.get(iso);
  if(existing){
    bleeding.value = existing.bleeding || "None";
    mood.value = existing.mood || "Neutral";
    symptoms.value = existing.symptoms || "";
    hadSex.checked = !!existing.hadSex;
    sexProtection.value = existing.sexProtection || "None";
    pillTaken.checked = !!existing.pillTaken;
    notes.value = existing.notes || "";
  }else{
    bleeding.value = "None";
    mood.value = "Neutral";
    symptoms.value = "";
    hadSex.checked = false;
    sexProtection.value = "None";
    pillTaken.checked = false;
    notes.value = "";
  }

  logModal.dataset.iso = iso;
  logModal.classList.remove("hidden");
}
function closeLogModal(){
  logModal.classList.add("hidden");
  logModal.dataset.iso = "";
}


function openCycleModal(cycle){
  const isEdit = !!cycle;
  cycleModal.dataset.cycleId = isEdit ? String(cycle.cycleId) : "";
  cycleModalTitle.textContent = isEdit ? t("fp.cycle.titleEdit") : t("fp.cycle.titleAdd");

  cycleStart.value = (cycle?.periodStartDate || "");
  cycleEnd.value = (cycle?.periodEndDate || "");
  cycleLen.value = (cycle?.cycleLengthDays || "");
  cycleFlow.value = (cycle?.flowLevel || "");
  cyclePain.value = (cycle?.painLevel || "");
  cycleNotes.value = (cycle?.notes || "");

  btnDeleteCycle.style.display = isEdit ? "inline-flex" : "none";
  cycleModal.classList.remove("hidden");
}

function closeCycleModal(){
  cycleModal.classList.add("hidden");
  cycleModal.dataset.cycleId = "";
}

btnCloseCycle.addEventListener("click", closeCycleModal);
cycleBackdrop.addEventListener("click", closeCycleModal);

btnSaveCycle.addEventListener("click", async ()=>{
  const cycleId = cycleModal.dataset.cycleId;

  const start = String(cycleStart.value||"").trim();
  const end = String(cycleEnd.value||"").trim();
  if(!start){ toast(t("fp.error.badDate"), "danger"); return; }
  if(end){
    const sd = new Date(start);
    const ed = new Date(end);
    if(isNaN(sd.getTime()) || isNaN(ed.getTime()) || ed < sd){
      toast(t("fp.error.badEndDate"), "danger");
      return;
    }
  }
  if(cycleLen.value){
    const n = Number(cycleLen.value);
    if(!Number.isFinite(n) || n <= 0){ toast(t("fp.error.badCycleLen"), "danger"); return; }
  }

  const payload = {
    periodStartDate: start,
    periodEndDate: end,
    cycleLengthDays: cycleLen.value ? Number(cycleLen.value) : "",
    flowLevel: cycleFlow.value,
    painLevel: cyclePain.value,
    notes: cycleNotes.value,
    status: "Active"
  };

  setLoading(btnSaveCycle, true);
  try{
    if(cycleId){
      await api.fpCyclesUpdate({ cycleId, patch: payload });
    }else{
      await api.fpCyclesCreate(payload);
    }
    closeCycleModal();
    toast(t("common.saved"), "success");
    await load();
  }catch(e){
    console.error(e);
    toast(e?.error?.message || t("common.saveFailed"), "danger");
  } finally {
    setLoading(btnSaveLog, false);
  }
});

btnDeleteCycle.addEventListener("click", async ()=>{
  const cycleId = cycleModal.dataset.cycleId;
  if(!cycleId) return;
  if(!confirm(t("fp.cycle.confirmDelete"))) return;

  setLoading(btnDeleteCycle, true);
  try{
    await api.fpCyclesDelete(cycleId);
    closeCycleModal();
    toast(t("common.saved"), "success");
    await load();
  }catch(e){
    console.error(e);
    toast(e?.error?.message || t("common.saveFailed"), "danger");
  } finally {
    setLoading(btnSaveLog, false);
  }
});

btnAddCycle.addEventListener("click", ()=> openCycleModal(null));

btnCloseLog.addEventListener("click", closeLogModal);
logBackdrop.addEventListener("click", closeLogModal);

btnSaveLog.addEventListener("click", async ()=>{
  const iso = logModal.dataset.iso;
  if(!iso) return;

  setLoading(btnSaveLog, true);
  try{
    await api.fpDailyUpsert({
      logDate: iso,
      bleeding: bleeding.value,
      mood: mood.value,
      symptoms: symptoms.value,
      hadSex: hadSex.checked,
      sexProtection: sexProtection.value,
      pillTaken: pillTaken.checked,
      notes: notes.value
    });
    closeLogModal();
    toast(t("common.saved"), "success");
    await load();
  }catch(e){
    console.error(e);
    toast(e?.error?.message || t("common.saveFailed"), "danger");
  } finally {
    setLoading(btnSaveLog, false);
  }
});

btnPrev.addEventListener("click", async ()=>{
  view = new Date(view.getFullYear(), view.getMonth()-1, 1);
  await load();
});
btnNext.addEventListener("click", async ()=>{
  view = new Date(view.getFullYear(), view.getMonth()+1, 1);
  await load();
});

btnRecompute.addEventListener("click", async ()=>{
  try{
    await api.fpPredictRecompute({});
    await load();
    alert(t("common.computeDone"));
  }catch(e){
    console.error(e);
    alert(e?.error?.message || t("common.loadFailed"));
  }
});

// + เพิ่ม/แก้ไขรอบเดือน (ใช้ modal)

function getPeriodRanges(){
  // สร้างช่วงประจำเดือนจาก cycles (ถ้าไม่มี end ให้ใช้ periodLengthDays หรือ default 5 วัน)
  const ranges = [];
  cacheCycles.forEach(c=>{
    const start = c.periodStartDate ? new Date(c.periodStartDate) : null;
    if(!start || isNaN(start.getTime())) return;

    let end = c.periodEndDate ? new Date(c.periodEndDate) : null;
    if(!end || isNaN(end.getTime())){
      const pl = Number(c.periodLengthDays || 5);
      end = addDays(start, Math.max(pl,1)-1);
    }
    ranges.push([isoDate(start), isoDate(end)]);
  });
  return ranges;
}

function inRange(iso, a, b){
  return iso >= a && iso <= b;
}

function renderCalendar(){
  calTitle.textContent = monthTitle(view);
  calGrid.innerHTML = "";

  const startDay = new Date(view.getFullYear(), view.getMonth(), 1);
  const endDay = new Date(view.getFullYear(), view.getMonth()+1, 0);

  const startWeekday = startDay.getDay(); // 0=Sun
  const gridStart = addDays(startDay, -startWeekday);

  const periodRanges = getPeriodRanges();

  const fertileA = cachePred?.fertileStartDate || "";
  const fertileB = cachePred?.fertileEndDate || "";
  const ovu = cachePred?.ovulationDate || "";

  for(let i=0;i<42;i++){
    const d = addDays(gridStart, i);
    const iso = isoDate(d);
    const inMonth = d.getMonth() === view.getMonth();

    let tags = [];
    // period highlight
    for(const [a,b] of periodRanges){
      if(inRange(iso, a, b)){ tags.push("period"); break; }
    }
    // fertile
    if(fertileA && fertileB && inRange(iso, fertileA, fertileB)) tags.push("fertile");
    // ovulation
    if(ovu && iso === ovu) tags.push("ovu");
    // has log
    if(cacheLogsByDate.has(iso)) tags.push("log");

    const cell = document.createElement("div");
    cell.className = "day" + (inMonth ? "" : " muted");
    cell.innerHTML = `
      <div class="n">${d.getDate()}</div>
      <div class="tags">
        ${tags.map(x=>`<span class="tag ${x}"></span>`).join("")}
      </div>
    `;
    cell.addEventListener("click", ()=>{
      // allow tap out-of-month too (convenient)
      openLogModal(iso);
    });
    calGrid.appendChild(cell);
  }
}

function renderPrediction(){
  if(!cachePred){
    predText.textContent = t("fp.predNoData");
    predDetail.innerHTML = "";
    return;
  }
  predText.textContent = t("fp.predSummary", { count: cacheCycles.length });

  const nextP = cachePred.nextPeriodExpectedDate;
  const ovu = cachePred.ovulationDate;
  const fa = cachePred.fertileStartDate;
  const fb = cachePred.fertileEndDate;

  predDetail.innerHTML = `
    <div class="pred-line">${t("fp.pred.nextPeriod")} <b>${fmtThaiLong(nextP)}</b></div>
    <div class="pred-line">${t("fp.pred.ovulation")} <b>${fmtThaiLong(ovu)}</b></div>
    <div class="pred-line">${t("fp.pred.fertile")} <b>${fmtThaiLong(fa)} – ${fmtThaiLong(fb)}</b></div>
  `;
}



function renderCycles(){
  if(!cyclesList) return;
  if(!cacheCycles.length){
    cyclesList.innerHTML = `<div class="muted">${t("fp.cardNoData")}</div>`;
    return;
  }

  const items = cacheCycles
    .slice()
    .sort((a,b)=> new Date(b.periodStartDate||0) - new Date(a.periodStartDate||0))
    .slice(0, 12);

  cyclesList.innerHTML = items.map(c=>{
    const start = fmtThaiLong(c.periodStartDate);
    const end = c.periodEndDate ? fmtThaiLong(c.periodEndDate) : t("fp.value.noEnd");
    const cl = c.cycleLengthDays ? t("fp.value.days", { n: c.cycleLengthDays }) : t("fp.value.unknown");
    const pl = c.periodLengthDays ? t("fp.value.days", { n: c.periodLengthDays }) : t("fp.value.unknown");

    return `
      <div class="cycle-item">
        <div class="cycle-meta">
          <div class="cycle-title">${start} → ${end}</div>
          <div class="cycle-sub">${t("fp.label.cycleLen")}: ${cl} • ${t("fp.label.periodLen")}: ${pl}</div>
        </div>
        <div class="cycle-actions">
          <button class="btn btn-ghost btn-sm" data-action="edit" data-id="${c.cycleId}">${t("common.edit")}</button>
        </div>
      </div>`;
  }).join("");

  cyclesList.querySelectorAll("button[data-action='edit']").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const id = btn.dataset.id;
      const c = cacheCycles.find(x=> String(x.cycleId)===String(id));
      openCycleModal(c || null);
    });
  });
}


async function load(){
  elLoading.style.display = "block";
  try{
    const cyclesRes = await api.fpCyclesList();
    cacheCycles = cyclesRes.items || [];

    renderCycles();

    // ensure predictions computed at least once
    if(cacheCycles.length){
      await api.fpPredictRecompute({});
    }

    const predRes = await api.fpPredLatest();
    cachePred = predRes?.item || null;

    // load daily logs for current month range
    const from = isoDate(new Date(view.getFullYear(), view.getMonth(), 1));
    const to = isoDate(new Date(view.getFullYear(), view.getMonth()+1, 0));
    const logsRes = await api.fpDailyListRange({ dateFrom: from, dateTo: to });
    const logs = logsRes.items || [];
    cacheLogsByDate = new Map(logs.map(x=>[x.logDate, x]));

    renderPrediction();
    renderCalendar();
  }catch(e){
    console.error(e);
    alert(e?.error?.message || t("common.loadFailed"));
  }finally{
    elLoading.style.display = "none";
  }
}

await load();