import { api } from "../api.js";
import { t, applyI18n } from "../i18n.js";
import { toast } from "../toast.js";

const qs = (s) => document.querySelector(s);
const setText = (sel, v) => { const el = qs(sel); if (el) el.textContent = (v ?? ""); };
const setHTML = (sel, v) => { const el = qs(sel); if (el) el.innerHTML = (v ?? ""); };

function fmt(dt){
  return dt ? new Date(dt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' }) : '';
}

function apiErr(e){
  return e?.error?.message || e?.message || t("common.loadFailed");
}

let state = { today: null, question: null, choices: [], alreadyAnswered: false, answer: null };

export async function initQuizPage(){
  applyI18n(document);
  await Promise.all([loadStats(), loadDaily(), loadHistory()]);
}

async function loadStats(){
  try{
    const res = await api.quizDailyStats();
    const d = res?.data || res;
    setText("#statTotal", `${d.totalAnswered ?? 0}`);
    setText("#statCorrect", `${d.correctAnswered ?? 0}`);
    setText("#statStreak", t("qz.days", { n: (d.streak ?? 0) }));
  }catch(e){
    // keep defaults
  }
}

async function loadDaily(){
  try{
    setText("#dailyStatus", t("common.loading"));
    const res = await api.quizDailyGet();
    const d = res?.data || res;
    state.today = d.date;
    state.question = d.question;
    state.choices = d.choices || [];
    state.alreadyAnswered = !!d.alreadyAnswered;
    state.answer = d.answer || null;
    renderDaily();
    setText("#dailyStatus", "");
  }catch(e){
    setText("#dailyStatus", apiErr(e));
  }
}

function renderDaily(){
  const q = state.question;
  if(!q){
    setHTML("#dailyQ", `<div class="muted">${t("common.noData")}</div>`);
    return;
  }
  setHTML("#dailyQ", `
    <div class="pill" style="display:inline-block;margin-bottom:10px">${q.category || "daily"}</div>
    <div style="font-weight:900;font-size:18px;line-height:1.35">${q.questionText}</div>
  `);

  const host = qs("#dailyChoices");
  host.innerHTML = "";
  state.choices.forEach((c, idx) => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.style.textAlign = "left";
    btn.style.width = "100%";
    btn.style.padding = "12px";
    btn.style.borderRadius = "14px";
    btn.style.display = "flex";
    btn.style.justifyContent = "space-between";
    btn.style.gap = "10px";
    btn.innerHTML = `<span>${c.choiceText}</span><span class="muted">#${idx+1}</span>`;

    if (state.alreadyAnswered && state.answer){
      const isSelected = state.answer.selectedChoiceId === c.choiceId;
      const isCorrect = state.answer.correctChoiceId === c.choiceId;
      if (isCorrect) btn.style.borderColor = "rgba(34,197,94,.6)";
      if (isSelected && !isCorrect) btn.style.borderColor = "rgba(239,68,68,.6)";
      btn.disabled = true;
    } else {
      btn.onclick = () => submitAnswer(c.choiceId);
    }
    host.appendChild(btn);
  });

  const msg = qs("#dailyMsg");
  if (state.alreadyAnswered && state.answer){
    msg.classList.remove("hidden");
    msg.textContent = state.answer.isCorrect ? t("qz.correct") : t("qz.wrong");
  } else {
    msg.classList.add("hidden");
    msg.textContent = "";
  }
}

async function submitAnswer(choiceId){
  try{
    const qid = state.question?.questionId;
    if(!qid) return;
    const res = await api.quizDailyAnswer(qid, choiceId);
    const d = res?.data || res;
    state.alreadyAnswered = true;
    state.answer = { selectedChoiceId: choiceId, isCorrect: !!d.isCorrect, correctChoiceId: d.correctChoiceId };
    renderDaily();
    await loadStats();
    await loadHistory();
  }catch(e){
    toast(apiErr(e), "danger");
  }
}

async function loadHistory(){
  const elLoading = qs("#loading");
  const elEmpty = qs("#empty");
  const elList = qs("#list");
  try{
    elLoading?.classList.remove("hidden");
    elEmpty?.classList.add("hidden");
    elList.innerHTML = "";

    const results = await api.quizMyResults();
    const arr = Array.isArray(results) ? results : (Array.isArray(results?.items) ? results.items : (results?.data || []));
    const last = arr[0] || null;

    qs("#lastScore").textContent = last ? `${last.score}/${last.total}` : "-";
    qs("#lastHint").textContent = last ? t("qz.takenAt", { dt: fmt(last.takenAt) }) : t("qz.noResult");

    elLoading?.classList.add("hidden");
    if(!arr.length){
      elEmpty?.classList.remove("hidden");
      return;
    }

    arr.slice(0,20).forEach(r=>{
      const card = document.createElement("div");
      card.className = "card";
      card.style.padding = "12px";
      card.innerHTML = `
        <div style="display:flex;justify-content:space-between;gap:10px">
          <div>
            <div style="font-weight:900">${r.score}/${r.total}</div>
            <div class="muted" style="font-size:12px">${fmt(r.takenAt)}</div>
          </div>
          <span class="pill">${r.category || 'general'}</span>
        </div>
      `;
      elList.appendChild(card);
    });
  }catch(e){
    console.error(e);
    if (elLoading) elLoading.textContent = apiErr(e);
  }
}
