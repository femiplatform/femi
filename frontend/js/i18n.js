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

    // Page titles
    "page.home": "หน้าแรก",
    "page.tools": "เครื่องมือ",
    "page.dashboard": "แดชบอร์ด",
    "page.profile": "โปรไฟล์",
    "page.preventive": "ดูแลสุขภาพเชิงป้องกัน",
    "page.knowledge": "คลังความรู้",
    "page.quiz": "แบบทดสอบ",
    "page.notifications": "การแจ้งเตือน",
    "page.familyPlanning": "วางแผนครอบครัว",

    // Home (ตัวอย่างข้อความพื้นฐาน)
    "home.welcome": "ยินดีต้อนรับ",
    "home.quickActions": "เมนูทางลัด",
    "home.today": "วันนี้",
    "home.seeAll": "ดูทั้งหมด",

    // Dashboard
    "dash.subtitle": "สรุปภาพรวมการใช้งานและผลลัพธ์ของคุณ",
    "dash.quizScore": "คะแนนแบบทดสอบ",
    "dash.completed": "ทำแล้ว",
    "dash.pending": "ค้างอยู่",

    // Profile
    "profile.subtitle": "ข้อมูลบัญชีของคุณ",
    "profile.name": "ชื่อ-สกุล",
    "profile.email": "อีเมล",
    "profile.phone": "เบอร์โทร",
    "profile.birthDate": "วันเกิด",
    "profile.editNote": "หากต้องการแก้ไขข้อมูล โปรดติดต่อผู้ดูแลระบบ",

    // Tools
    "tools.subtitle": "รวมเครื่องมือเพื่อสุขภาพและการดูแลตนเอง",
    "tools.preventive": "ดูแลสุขภาพ (Preventive)",
    "tools.familyPlanning": "วางแผนครอบครัว",
    "tools.pregnancy": "การตั้งครรภ์",
    "tools.knowledge": "ความรู้",
    "tools.quiz": "แบบทดสอบ",

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

    // Preventive
    "pv.title": "ดูแลสุขภาพเชิงป้องกัน",
    "pv.subtitle": "รายการดูแลสุขภาพเชิงป้องกันของคุณ",
    "pv.total": "งานทั้งหมด",
    "pv.dueToday": "ครบกำหนดวันนี้",
    "pv.overdue": "เลยกำหนด",
    "pv.tabToday": "วันนี้",
    "pv.tabUpcoming": "กำลังจะถึง",
    "pv.tabAll": "ทั้งหมด",
    "pv.done": "ทำแล้ว",
    "pv.skip": "ข้าม",
    // Knowledge page
    "kp.subtitle": "บทความและข่าวสาร",
    "kp.tab.kb": "ความรู้",
    "kp.tab.news": "ข่าว",
    "kp.empty": "ยังไม่มีข้อมูล",
    "kp.loadFailed": "โหลดข้อมูลไม่สำเร็จ",

    // Quiz page
    "qz.subtitle": "ดูคะแนน/ประวัติการทำแบบทดสอบ",
    "qz.lastScoreTitle": "คะแนนล่าสุด",
    "qz.historyTitle": "ประวัติ",
    "qz.empty": "ยังไม่มีประวัติ",
    "qz.noteTitle": "หมายเหตุ",
    "qz.noteBody": "หน้า \"ทำแบบทดสอบ\" แบบโต้ตอบจะทำใน Sprint ถัดไป (ต้องเพิ่ม API choices แบบ public) — ตอนนี้ระบบเก็บคะแนนและแสดงประวัติได้แล้ว",
    "qz.noResult": "ยังไม่มีผล",
    "qz.takenAt": "ทำเมื่อ {dt}",
    "qz.loadFailed": "โหลดข้อมูลไม่สำเร็จ",

    // Preventive extra strings
    "pv.empty": "ยังไม่มีรายการ",
    "pv.general": "ทั่วไป",
    "pv.pillToday": "วันนี้",
    "pv.pillOverdue": "เลยกำหนด",
    "pv.dueLabel": "ครบกำหนด:",
    "pv.skipPrompt": "เหตุผลที่ข้าม (ไม่บังคับ)",
    "pv.loadFailed": "โหลดข้อมูลไม่สำเร็จ",
    "pv.doneFailed": "ทำรายการไม่สำเร็จ",
    "pv.skipFailed": "ข้ามรายการไม่สำเร็จ",
  },

  en: {
    "app.name": "FEMI",
    "nav.home": "Home",
    "nav.tools": "Tools",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.notifications": "Notifications",
    "common.loading": "Loading…",
    "page.home": "Home",
    "page.tools": "Tools",
    "page.dashboard": "Dashboard",
    "page.profile": "Profile",
    "page.preventive": "Preventive",
    "page.knowledge": "Knowledge",
    "page.quiz": "Quiz",
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