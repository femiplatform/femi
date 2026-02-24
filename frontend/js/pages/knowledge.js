import { api } from "../api.js";
import { t } from "../i18n.js";
import { toast } from "../toast.js";

const qs = (s) => document.querySelector(s);

function setText(sel, v) { const el = qs(sel); if (el) el.textContent = (v ?? ""); }
function setHTML(sel, v) { const el = qs(sel); if (el) el.innerHTML = (v ?? ""); }

function catLabel(cat){
  const map = {
    preventive: t("kp.cat.preventive"),
    holistic: t("kp.cat.holistic"),
    breast_ca: t("kp.cat.breast_ca"),
    cervical_ca: t("kp.cat.cervical_ca"),
    menopause: t("kp.cat.menopause"),
    family_planning: t("kp.cat.family_planning"),
    pregnancy: t("kp.cat.pregnancy"),
  };
  return map[cat] || cat || "-";
}

function apiErr(e){
  return e?.error?.message || e?.message || t("kp.loadFailed") || "Load failed";
}

let _featuredId = "";

export async function initKnowledgePage(){
  const btn = qs("#btnShuffle");
  if (btn) btn.onclick = () => loadRandom();
  await loadRandom();
}

async function loadRandom(){
  try{
    setText("#kSub", t("common.loading"));
    const featured = await api.knowledgeFeaturedRandom("");
    _featuredId = featured?.knowledgeId || "";
    renderFeatured(featured);

    const rec = await api.knowledgeRecommendedRandom(_featuredId ? [_featuredId] : [], "");
    renderRecommended(rec?.items || []);
    setText("#kSub", t("kp.subtitle"));
  }catch(e){
    toast(apiErr(e), "danger");
    setText("#kSub", t("kp.loadFailed"));
  }
}

function renderFeatured(item){
  if(!item){
    setHTML("#featured", `<div class="muted">${t("kp.empty")}</div>`);
    return;
  }
  setHTML("#featured", `
    <div class="card" style="padding:14px">
      <div class="pill" style="display:inline-block; margin-bottom:10px">${catLabel(item.category)}</div>
      <h2 style="margin:0 0 6px 0">${item.title}</h2>
      <div class="muted" style="margin-bottom:12px">${item.summary || ""}</div>
      <div class="prose">${item.contentHtml || ""}</div>
    </div>
  `);
}

function renderRecommended(items){
  const host = qs("#recommended");
  if(!host) return;
  host.innerHTML = "";

  if(!items.length){
    host.innerHTML = `<div class="muted">${t("kp.empty")}</div>`;
    return;
  }

  items.forEach(it=>{
    const div = document.createElement("div");
    div.className = "card-soft";
    div.style.padding = "12px";
    div.style.cursor = "pointer";
    div.style.marginBottom = "10px";
    div.innerHTML = `
      <div class="pill" style="display:inline-block; margin-bottom:8px">${catLabel(it.category)}</div>
      <div style="font-weight:900">${it.title}</div>
      <div class="muted" style="margin-top:4px">${it.summary || ""}</div>
    `;
    div.onclick = async ()=>{
      try{
        const full = await api.knowledgeGetById(it.knowledgeId);
        renderFeatured(full);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }catch(e){
        toast(apiErr(e), "danger");
      }
    };
    host.appendChild(div);
  });
}