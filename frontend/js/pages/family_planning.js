import { initUserShell } from "../shell.js";
import { api } from "../api.js";
import { t, applyI18n } from "../i18n.js";

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

btnCloseLog.addEventListener("click", closeLogModal);
logBackdrop.addEventListener("click", closeLogModal);

btnSaveLog.addEventListener("click", async ()=>{
  const iso = logModal.dataset.iso;
  if(!iso) return;

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
    await load();
  }catch(e){
    console.error(e);
    alert(e?.error?.message || t("common.saveFailed"));
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

// + เพิ่มรอบเดือน (ยังใช้ prompt แต่รับ DD-MM-YYYY ผ่าน i18n ที่คุณตั้งไว้แล้ว)
function parseDateInputDDMMYYYY_(input) {
  const s = String(input || "").trim();
  const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!m) return null;
  const dd = Number(m[1]), mm = Number(m[2]), yyyy = Number(m[3]);
  const d = new Date(yyyy, mm-1, dd);
  if (d.getFullYear()!==yyyy || d.getMonth()!==(mm-1) || d.getDate()!==dd) return null;
  return `${yyyy}-${String(mm).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;
}

btnAddCycle.addEventListener("click", async ()=>{
  const rawStart = prompt(t("fp.prompt.start"));
  if(!rawStart) return;
  const sIso = parseDateInputDDMMYYYY_(rawStart);
  if(!sIso){ alert(t("fp.error.badDate")); return; }

  const rawEnd = prompt(t("fp.prompt.end")) || "";
  let eIso = "";
  if(rawEnd.trim()){
    const p = parseDateInputDDMMYYYY_(rawEnd);
    if(!p){ alert(t("fp.error.badDate")); return; }
    eIso = p;
  }

  const len = prompt(t("fp.prompt.cycleLen")) || "";

  try{
    await api.fpCyclesCreate({
      periodStartDate: sIso,
      periodEndDate: eIso,
      cycleLengthDays: len ? Number(len) : "",
      status:"Active"
    });
    await load();
  }catch(e){
    console.error(e);
    alert(e?.error?.message || t("common.saveFailed"));
  }
});

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

async function load(){
  elLoading.style.display = "block";
  try{
    const cyclesRes = await api.fpCyclesList();
    cacheCycles = cyclesRes.items || [];

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