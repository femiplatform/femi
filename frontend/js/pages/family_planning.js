import { initUserShell } from "../shell.js";
import { api } from "../api.js";

await initUserShell({ active: "tools", title: "วางแผนครอบครัว" });

const elLoading = document.getElementById("loading");
const elList = document.getElementById("list");
const predText = document.getElementById("predText");

const btnAddCycle = document.getElementById("btnAddCycle");
const btnAddLog = document.getElementById("btnAddLog");
const btnRecompute = document.getElementById("btnRecompute");

function fmtDateThai(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("th-TH", { dateStyle: "long" });
}

function safeNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function thaiBleedingHint() {
  return `เลือดออก (Bleeding): None=ไม่มี, Spotting=กะปริบกะปรอย, Light=น้อย, Medium=ปานกลาง, Heavy=มาก`;
}

function thaiMoodHint() {
  return `อารมณ์ (Mood): Good=ดี, Neutral=ปกติ, Bad=แย่`;
}

btnAddCycle.addEventListener("click", async () => {
  const start = prompt("วันเริ่มประจำเดือน (รูปแบบ YYYY-MM-DD เช่น 2026-02-01)");
  if (!start) return;

  const end = prompt("วันสิ้นสุดประจำเดือน (YYYY-MM-DD) — เว้นว่างได้") || "";
  const len = prompt("ความยาวรอบเดือน (Cycle length) กี่วัน? — เว้นว่างได้ เช่น 28") || "";

  try {
    await api.fpCyclesCreate({
      periodStartDate: start,
      periodEndDate: end,
      cycleLengthDays: len ? Number(len) : "",
      status: "Active"
    });
    await load();
  } catch (e) {
    console.error(e);
    alert(e?.error?.message || "บันทึกไม่สำเร็จ");
  }
});

btnAddLog.addEventListener("click", async () => {
  const logDate = prompt("วันที่ต้องการบันทึก (YYYY-MM-DD เช่น 2026-02-03)");
  if (!logDate) return;

  alert(thaiBleedingHint());
  const bleeding = prompt("เลือดออกวันนี้เป็นระดับไหน? (None/Spotting/Light/Medium/Heavy)", "None") || "None";

  alert(thaiMoodHint());
  const mood = prompt("วันนี้รู้สึกอย่างไร? (Good/Neutral/Bad)", "Neutral") || "Neutral";

  const symptoms = prompt("อาการที่รู้สึก (คั่นด้วย ,) เช่น ปวดท้อง, ปวดหลัง, สิว", "") || "";

  try {
    await api.fpDailyUpsert({ logDate, bleeding, mood, symptoms });
    await load();
  } catch (e) {
    console.error(e);
    alert(e?.error?.message || "บันทึกไม่สำเร็จ");
  }
});

btnRecompute.addEventListener("click", async () => {
  try {
    await api.fpPredictRecompute({});
    alert("คำนวณคาดการณ์ให้แล้ว");
    await load();
  } catch (e) {
    console.error(e);
    alert(e?.error?.message || "คำนวณไม่สำเร็จ");
  }
});

async function load() {
  elLoading.style.display = "block";
  elList.innerHTML = "";

  try {
    const cyclesRes = await api.fpCyclesList();
    const cycles = cyclesRes.items || [];

    // คำนวณคาดการณ์ล่าสุด (บันทึกลงชีท ovulation_predictions)
    await api.fpPredictRecompute({});

    if (cycles.length) {
      predText.textContent =
        `พบข้อมูลรอบเดือนของคุณ ${cycles.length} รอบ และได้คำนวณ “ช่วงไข่ตก/ช่วงเสี่ยงท้อง” ให้แล้ว ` +
        `(ระบบบันทึกลงชีท ovulation_predictions)`;
    } else {
      predText.textContent =
        "ยังไม่มีข้อมูลรอบเดือน — กรุณากด “เพิ่มรอบเดือน” ก่อน เพื่อให้ระบบคำนวณช่วงไข่ตกและรอบถัดไป";
    }

    cycles.slice(0, 20).forEach(c => {
      const cycleLen = safeNum(c.cycleLengthDays);
      const periodLen = safeNum(c.periodLengthDays);

      const start = fmtDateThai(c.periodStartDate);
      const end = c.periodEndDate ? fmtDateThai(c.periodEndDate) : "ยังไม่ระบุวันสิ้นสุด";

      const line2 =
        `ความยาวรอบเดือน (Cycle length): ${cycleLen !== null ? cycleLen + " วัน" : "ยังไม่ระบุ"} ` +
        `• ระยะเวลามีประจำเดือน (Period length): ${periodLen !== null ? periodLen + " วัน" : "ยังไม่ระบุ"}`;

      const div = document.createElement("div");
      div.className = "row";
      div.innerHTML = `
        <div style="font-weight:900">${start} – ${end}</div>
        <div class="muted" style="margin-top:6px">${line2}</div>
      `;
      elList.appendChild(div);
    });

    if (!cycles.length) {
      const div = document.createElement("div");
      div.className = "row";
      div.innerHTML = `<div class="muted">ยังไม่มีข้อมูล</div>`;
      elList.appendChild(div);
    }

  } catch (e) {
    console.error(e);
    alert(e?.error?.message || "โหลดไม่สำเร็จ");
  } finally {
    elLoading.style.display = "none";
  }
}

await load();