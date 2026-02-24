import { t } from "../i18n.js";
import { toast } from "../toast.js";

const qs = (s) => document.querySelector(s);

function num(id){
  const v = Number(qs(id).value);
  return Number.isFinite(v) ? v : NaN;
}

function round0(x){ return String(Math.round(x)); }

function bmiTag(bmi){
  if (bmi < 18.5) return { key: "ha.bmi.under", cls: "pill" };
  if (bmi < 23) return { key: "ha.bmi.normal", cls: "pill" };
  if (bmi < 25) return { key: "ha.bmi.over", cls: "pill" };
  if (bmi < 30) return { key: "ha.bmi.obese1", cls: "pill" };
  return { key: "ha.bmi.obese2", cls: "pill" };
}

function estimateHealthAge(age, bmi, activity){
  // heuristic: start with real age, adjust by BMI + activity level
  let delta = 0;

  // BMI penalty/bonus
  if (bmi < 18.5) delta += 1;
  else if (bmi < 23) delta -= 1;
  else if (bmi < 25) delta += 1;
  else if (bmi < 30) delta += 3;
  else delta += 5;

  // Activity bonus (relative to 1.2 baseline)
  if (activity >= 1.725) delta -= 2;
  else if (activity >= 1.55) delta -= 1;
  else if (activity <= 1.2) delta += 1;

  const ha = Math.max(10, Math.min(120, Math.round(age + delta)));
  return { ha, delta };
}

export function initHealthAgePage(){
  let sex = "female";
  const btns = document.querySelectorAll(".ha-sex");
  btns.forEach(b=>{
    b.addEventListener("click", ()=>{
      sex = b.dataset.sex;
      btns.forEach(x=>x.classList.remove("primary"));
      b.classList.add("primary");
    });
  });
  // default highlight
  btns.forEach(x=>x.dataset.sex===sex && x.classList.add("primary"));

  qs("#btnCalc").addEventListener("click", ()=>{
    const age = num("#age");
    const h = num("#height");
    const w = num("#weight");
    const act = Number(qs("#activity").value);

    if (!age || !h || !w){
      toast(t("common.invalidInput") || "กรอกข้อมูลให้ครบ", "danger");
      return;
    }

    const bmi = w / Math.pow(h/100, 2);

    // Mifflin-St Jeor
    const s = (sex === "male") ? 5 : -161;
    const bmr = 10*w + 6.25*h - 5*age + s;
    const tdee = bmr * act;

    const tag = bmiTag(bmi);
    qs("#bmiTag").textContent = `${t("ha.bmiLabel") || "BMI"}: ${bmi.toFixed(1)} • ${t(tag.key) || ""}`;

    qs("#bmr").textContent = round0(bmr);
    qs("#tdee").textContent = round0(tdee);

    const { ha, delta } = estimateHealthAge(age, bmi, act);
    qs("#healthAge").textContent = `${ha} ${t("ha.years") || "ปี"}`;

    const explainTpl = t("ha.explain") || "อายุจริง {age} ปี • ต่างจากอายุสุขภาพ {delta} ปี";
    qs("#ageExplain").textContent = explainTpl
      .replace("{age}", String(age))
      .replace("{delta}", (delta>0?("+ "+delta): String(delta)));

    qs("#result").classList.remove("hidden");
  });

  qs("#btnReset").addEventListener("click", ()=>{
    ["#age","#height","#weight"].forEach(id=>qs(id).value="");
    qs("#activity").value = "1.2";
    qs("#result").classList.add("hidden");
  });
}
