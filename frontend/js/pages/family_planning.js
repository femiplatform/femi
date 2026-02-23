import { initUserShell } from "../shell.js";
import { api } from "../api.js";
import { t, applyI18n } from "../i18n.js";

await initUserShell({ active: "tools", title: t("fp.title") });
applyI18n(document);

const elLoading = document.getElementById("loading");
const elList = document.getElementById("list");
const predText = document.getElementById("predText");

const btnAddCycle = document.getElementById("btnAddCycle");
const btnAddLog = document.getElementById("btnAddLog");
const btnRecompute = document.getElementById("btnRecompute");

function fmtDateThai(iso) {
  if (!iso) return t("common.none");
  return new Date(iso).toLocaleDateString("th-TH", { dateStyle: "long" });
}

function safeNum(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/**
 * Parse DD-MM-YYYY or DD/MM/YYYY -> YYYY-MM-DD (ISO date-only)
 */
function parseDateInputDDMMYYYY_(input) {
  const s = String(input || "").trim();
  const m = s.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
  if (!m) return null;

  const dd = Number(m[1]);
  const mm = Number(m[2]);
  const yyyy = Number(m[3]);

  if (yyyy < 1900 || yyyy > 2100) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;

  const d = new Date(yyyy, mm - 1, dd);
  if (d.getFullYear() !== yyyy || d.getMonth() !== (mm - 1) || d.getDate() !== dd) return null;

  return `${yyyy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
}

btnAddCycle.addEventListener("click", async () => {
  const rawStart = prompt(t("fp.prompt.start")); // DD-MM-YYYY
  if (!rawStart) return;

  const startIso = parseDateInputDDMMYYYY_(rawStart);
  if (!startIso) {
    alert(t("fp.error.badDate"));
    return;
  }

  const rawEnd = prompt(t("fp.prompt.end")) || ""; // DD-MM-YYYY (optional)
  let endIso = "";
  if (rawEnd.trim()) {
    const parsed = parseDateInputDDMMYYYY_(rawEnd);
    if (!parsed) {
      alert(t("fp.error.badDate"));
      return;
    }
    endIso = parsed;
  }

  const len = prompt(t("fp.prompt.cycleLen")) || "";

  try {
    await api.fpCyclesCreate({
      periodStartDate: startIso,
      periodEndDate: endIso,
      cycleLengthDays: len ? Number(len) : "",
      status: "Active"
    });
    await load();
  } catch (e) {
    console.error(e);
    alert(e?.error?.message || t("common.saveFailed"));
  }
});

btnAddLog.addEventListener("click", async () => {
  const raw = prompt(t("fp.prompt.logDate")); // DD-MM-YYYY
  if (!raw) return;

  const logDate = parseDateInputDDMMYYYY_(raw);
  if (!logDate) {
    alert(t("fp.error.badDate"));
    return;
  }

  alert(t("fp.hint.bleeding"));
  const bleeding = prompt(t("fp.prompt.bleeding"), "None") || "None";

  alert(t("fp.hint.mood"));
  const mood = prompt(t("fp.prompt.mood"), "Neutral") || "Neutral";

  const symptoms = prompt(t("fp.prompt.symptoms"), "") || "";

  try {
    await api.fpDailyUpsert({ logDate, bleeding, mood, symptoms });
    await load();
  } catch (e) {
    console.error(e);
    alert(e?.error?.message || t("common.saveFailed"));
  }
});

btnRecompute.addEventListener("click", async () => {
  try {
    await api.fpPredictRecompute({});
    alert(t("common.computeDone"));
    await load();
  } catch (e) {
    console.error(e);
    alert(e?.error?.message || t("common.loadFailed"));
  }
});

async function load() {
  elLoading.style.display = "block";
  elList.innerHTML = "";

  try {
    const cyclesRes = await api.fpCyclesList();
    const cycles = cyclesRes.items || [];

    await api.fpPredictRecompute({});

    predText.textContent = cycles.length
      ? t("fp.predSummary", { count: cycles.length })
      : t("fp.predNoData");

    cycles.slice(0, 20).forEach(c => {
      const cycleLen = safeNum(c.cycleLengthDays);
      const periodLen = safeNum(c.periodLengthDays);

      const start = fmtDateThai(c.periodStartDate);
      const end = c.periodEndDate ? fmtDateThai(c.periodEndDate) : t("fp.value.noEnd");

      const line2 =
        `${t("fp.label.cycleLen")}: ${cycleLen !== null ? t("fp.value.days", { n: cycleLen }) : t("fp.value.unknown")} • ` +
        `${t("fp.label.periodLen")}: ${periodLen !== null ? t("fp.value.days", { n: periodLen }) : t("fp.value.unknown")}`;

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
      div.innerHTML = `<div class="muted">${t("fp.cardNoData")}</div>`;
      elList.appendChild(div);
    }
  } catch (e) {
    console.error(e);
    alert(e?.error?.message || t("common.loadFailed"));
  } finally {
    elLoading.style.display = "none";
  }
}

await load();