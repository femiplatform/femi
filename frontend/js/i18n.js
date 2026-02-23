// femi/frontend/js/i18n.js

const LS_KEY = "femi.lang";
const DEFAULT_LANG = "th";

const DICT = {
  th: {
    // App
    "app.name": "FEMI",

    // Common
    "common.loading": "กำลังโหลด…",
    "common.none": "-",
    "common.loadFailed": "โหลดไม่สำเร็จ",
    "common.saveFailed": "บันทึกไม่สำเร็จ",
    "common.computeDone": "คำนวณคาดการณ์ให้แล้ว",
    "common.ok": "ตกลง",
    "common.close": "ปิด",

    // Navigation / Shell
    "nav.menu": "เมนู",
    "nav.logout": "ออกจากระบบ",
    "nav.notifications": "การแจ้งเตือน",
    "nav.home": "หน้าแรก",
    "nav.tools": "เครื่องมือ",
    "nav.dashboard": "แดชบอร์ด",
    "nav.profile": "โปรไฟล์",
    "nav.preventive": "ดูแลสุขภาพ (Preventive)",
    "nav.familyPlanning": "วางแผนครอบครัว (Family Planning)",
    "nav.pregnancy": "ตั้งครรภ์ (Pregnancy)",
    "nav.knowledge": "คลังความรู้",
    "nav.quiz": "แบบทดสอบ",

    // Notifications page
    "noti.title": "การแจ้งเตือน",
    "noti.subtitle": "ข้อความแจ้งเตือนภายในแอป",
    "noti.empty": "ยังไม่มีการแจ้งเตือน",
    "noti.read": "อ่านแล้ว",
    "noti.markRead": "ทำเครื่องหมายว่าอ่านแล้ว",
    "noti.loadFailed": "โหลดการแจ้งเตือนไม่สำเร็จ",
    "noti.actionFailed": "ทำรายการไม่สำเร็จ",

    // Family Planning page
    "fp.title": "วางแผนครอบครัว",
    "fp.subtitle": "เวอร์ชันทดลอง: บันทึกรอบเดือน + บันทึกรายวัน + คาดการณ์ช่วงไข่ตก (AvgCycle)",
    "fp.predTitle": "คาดการณ์ (ล่าสุด)",
    "fp.predNoData": "ยังไม่มีข้อมูลรอบเดือน — กรุณากด “เพิ่มรอบเดือน” ก่อน เพื่อให้ระบบคำนวณช่วงไข่ตกและรอบถัดไป",
    "fp.predSummary": "พบข้อมูลรอบเดือนของคุณ {count} รอบ และได้คำนวณ “ช่วงไข่ตก/ช่วงเสี่ยงท้อง” ให้แล้ว (บันทึกลงชีท ovulation_predictions)",
    "fp.btnAddCycle": "+ เพิ่มรอบเดือน",
    "fp.btnAddLog": "+ บันทึกรายวัน",
    "fp.btnRecompute": "คำนวณใหม่",
    "fp.cardNoData": "ยังไม่มีข้อมูล",

    "fp.prompt.start": "วันเริ่มประจำเดือน (รูปแบบ YYYY-MM-DD เช่น 2026-02-01)",
    "fp.prompt.end": "วันสิ้นสุดประจำเดือน (YYYY-MM-DD) — เว้นว่างได้",
    "fp.prompt.cycleLen": "ความยาวรอบเดือน (Cycle length) กี่วัน? — เว้นว่างได้ เช่น 28",
    "fp.prompt.logDate": "วันที่ต้องการบันทึก (YYYY-MM-DD เช่น 2026-02-03)",
    "fp.hint.bleeding": "เลือดออก (Bleeding): None=ไม่มี, Spotting=กะปริบกะปรอย, Light=น้อย, Medium=ปานกลาง, Heavy=มาก",
    "fp.hint.mood": "อารมณ์ (Mood): Good=ดี, Neutral=ปกติ, Bad=แย่",
    "fp.prompt.bleeding": "เลือดออกวันนี้เป็นระดับไหน? (None/Spotting/Light/Medium/Heavy)",
    "fp.prompt.mood": "วันนี้รู้สึกอย่างไร? (Good/Neutral/Bad)",
    "fp.prompt.symptoms": "อาการที่รู้สึก (คั่นด้วย ,) เช่น ปวดท้อง, ปวดหลัง, สิว",

    "fp.label.cycleLen": "ความยาวรอบเดือน (Cycle length)",
    "fp.label.periodLen": "ระยะเวลามีประจำเดือน (Period length)",
    "fp.value.days": "{n} วัน",
    "fp.value.unknown": "ยังไม่ระบุ",
    "fp.value.noEnd": "ยังไม่ระบุวันสิ้นสุด",
  },

  // (มีไว้เป็น fallback แต่ยังไม่ทำปุ่มสลับภาษา)
  en: {
    "app.name": "FEMI",
    "nav.home": "Home",
    "nav.tools": "Tools",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.notifications": "Notifications",
    "common.loading": "Loading…",
    "fp.title": "Family Planning",
    "noti.title": "Notifications",
  }
};

export function getLang() {
  return localStorage.getItem(LS_KEY) || DEFAULT_LANG;
}

export function setLang(lang) {
  const safe = DICT[lang] ? lang : DEFAULT_LANG;
  localStorage.setItem(LS_KEY, safe);
  return safe;
}

export function t(key, vars = {}) {
  const lang = getLang();
  const table = DICT[lang] || DICT[DEFAULT_LANG] || {};
  const fallback = DICT[DEFAULT_LANG] || {};

  let s = table[key] ?? fallback[key] ?? key;

  s = String(s).replace(/\{(\w+)\}/g, (_, k) => {
    const v = vars[k];
    return (v === undefined || v === null) ? "" : String(v);
  });

  return s;
}

/**
 * Apply translations to DOM:
 * - data-i18n="key" -> textContent
 * - data-i18n-html="key" -> innerHTML (ใช้เฉพาะจำเป็น)
 * - data-i18n-placeholder="key" -> placeholder
 */
export function applyI18n(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.getAttribute("data-i18n"));
  });

  root.querySelectorAll("[data-i18n-html]").forEach(el => {
    el.innerHTML = t(el.getAttribute("data-i18n-html"));
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.setAttribute("placeholder", t(el.getAttribute("data-i18n-placeholder")));
  });
}