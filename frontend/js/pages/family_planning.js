import { initUserShell } from "../shell.js";
import { api } from "../api.js";

await initUserShell({ active: "tools", title: "Family Planning" });

const elLoading = document.getElementById("loading");
const elList = document.getElementById("list");
const predText = document.getElementById("predText");

const btnAddCycle = document.getElementById("btnAddCycle");
const btnAddLog = document.getElementById("btnAddLog");
const btnRecompute = document.getElementById("btnRecompute");

function fmtDate(s){
  if(!s) return "-";
  return new Date(s).toLocaleDateString("th-TH", { dateStyle:"medium" });
}

btnAddCycle.addEventListener("click", async ()=>{
  const start = prompt("วันเริ่มประจำเดือน (YYYY-MM-DD)");
  if(!start) return;
  const end = prompt("วันสิ้นสุด (YYYY-MM-DD) (เว้นว่างได้)") || "";
  const len = prompt("ความยาวรอบ (วัน) (เว้นว่างได้)") || "";
  try{
    await api.fpCyclesCreate({
      periodStartDate: start,
      periodEndDate: end,
      cycleLengthDays: len ? Number(len) : "",
      status: "Active"
    });
    await load();
  }catch(e){
    console.error(e);
    alert(e?.error?.message || "บันทึกไม่สำเร็จ");
  }
});

btnAddLog.addEventListener("click", async ()=>{
  const logDate = prompt("วันที่บันทึก (YYYY-MM-DD)");
  if(!logDate) return;
  const bleeding = prompt("เลือดออก: None/Spotting/Light/Medium/Heavy", "None") || "None";
  const mood = prompt("อารมณ์: Good/Neutral/Bad", "Neutral") || "Neutral";
  const symptoms = prompt("อาการ (คั่นด้วย ,)", "") || "";
  try{
    await api.fpDailyUpsert({ logDate, bleeding, mood, symptoms });
    await load();
  }catch(e){
    console.error(e);
    alert(e?.error?.message || "บันทึกไม่สำเร็จ");
  }
});

btnRecompute.addEventListener("click", async ()=>{
  try{
    await api.fpPredictRecompute({});
    alert("คำนวณเรียบร้อย");
    await load();
  }catch(e){
    console.error(e);
    alert(e?.error?.message || "คำนวณไม่สำเร็จ");
  }
});

async function load(){
  elLoading.style.display = "block";
  elList.innerHTML = "";
  try{
    // ดึงรอบเดือน
    const cyclesRes = await api.fpCyclesList();
    const cycles = cyclesRes.items || [];

    // คำนวณ prediction ล่าสุด (ฝั่ง backend จะ upsert ให้)
    await api.fpPredictRecompute({});

    predText.textContent = cycles.length
      ? `มีข้อมูลรอบเดือน ${cycles.length} รอบ (คาดการณ์ถูกบันทึกลง ovulation_predictions แล้ว)`
      : "ยังไม่มีรอบเดือน — ให้เพิ่มรอบเดือนก่อนเพื่อคำนวณคาดการณ์";

    cycles.slice(0, 20).forEach(c => {
      const div = document.createElement("div");
      div.className = "row";
      div.innerHTML = `
        <div style="font-weight:900">${fmtDate(c.periodStartDate)} ${c.periodEndDate ? "– " + fmtDate(c.periodEndDate) : ""}</div>
        <div class="muted" style="margin-top:6px">cycleLengthDays: ${c.cycleLengthDays || "-"} • periodLengthDays: ${c.periodLengthDays || "-"}</div>
      `;
      elList.appendChild(div);
    });

    if(!cycles.length){
      const div = document.createElement("div");
      div.className = "row";
      div.innerHTML = `<div class="muted">ยังไม่มีข้อมูล</div>`;
      elList.appendChild(div);
    }
  }catch(e){
    console.error(e);
    alert(e?.error?.message || "โหลดไม่สำเร็จ");
  }finally{
    elLoading.style.display = "none";
  }
}

await load();