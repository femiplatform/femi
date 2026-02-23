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
    "common.errorTimeout": "หมดเวลาในการเชื่อมต่อ กรุณาลองใหม่",
    "common.errorNetwork": "เชื่อมต่อไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต",
    "common.errorUnauthorized": "กรุณาเข้าสู่ระบบใหม่",
    "common.errorForbidden": "ไม่มีสิทธิ์ดำเนินการ",
    "common.errorNotFound": "ไม่พบข้อมูล",
    "common.errorValidation": "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
    "common.errorServer": "ระบบขัดข้องชั่วคราว กรุณาลองใหม่",
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

    // ✅ ปรับเป็น DD-MM-YYYY
    "fp.prompt.start": "วันเริ่มประจำเดือน (รูปแบบ DD-MM-YYYY เช่น 01-02-2026)",
    "fp.prompt.end": "วันสิ้นสุดประจำเดือน (DD-MM-YYYY) — เว้นว่างได้",
    "fp.prompt.cycleLen": "ความยาวรอบเดือน (Cycle length) กี่วัน? — เว้นว่างได้ เช่น 28",
    "fp.prompt.logDate": "วันที่ต้องการบันทึก (รูปแบบ DD-MM-YYYY เช่น 03-02-2026)",

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

    // ✅ เพิ่มข้อความแจ้งรูปแบบวันที่ผิด
    "fp.error.badDate": "รูปแบบวันที่ไม่ถูกต้อง กรุณากรอกเป็น DD-MM-YYYY เช่น 03-02-2026",

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

    "fp.legend.period": "ประจำเดือน",
    "fp.legend.fertile": "ช่วงเสี่ยง",
    "fp.legend.ovulation": "วันไข่ตก",
    "fp.legend.log": "มีบันทึก",

    "fp.log.title": "บันทึกรายวัน",
    "fp.log.date": "วันที่",
    "fp.log.bleeding": "เลือดออก",
    "fp.log.mood": "อารมณ์",
    "fp.log.symptoms": "อาการ",
    "fp.log.symptomsPh": "เช่น ปวดท้อง, ปวดหลัง, สิว",
    "fp.log.hadSex": "มีเพศสัมพันธ์",
    "fp.log.pillTaken": "กินยาคุม",
    "fp.log.sexProtection": "การป้องกัน",
    "fp.log.notes": "หมายเหตุ",
    "fp.log.save": "บันทึก",

    "fp.pred.nextPeriod": "คาดว่าประจำเดือนรอบถัดไปจะมา:",
    "fp.pred.ovulation": "คาดว่าวันไข่ตก:",
    "fp.pred.fertile": "ช่วงเสี่ยงท้อง (ช่วงไข่ตก):",

    // Home - summary cards
    "home.summaryTitle": "สรุปวันนี้",
    "home.fpCardTitle": "รอบเดือนและช่วงเสี่ยง",
    "home.fpNextPeriod": "รอบถัดไปคาดว่า:",
    "home.fpOvulation": "วันไข่ตกคาดว่า:",
    "home.fpFertile": "ช่วงเสี่ยงท้อง:",
    "home.fpNoData": "ยังไม่มีข้อมูลรอบเดือน — ไปเพิ่มในเมนูวางแผนครอบครัว",
    "home.pvCardTitle": "งานดูแลสุขภาพ",
    "home.pvDueToday": "ครบกำหนดวันนี้",
    "home.pvOverdue": "เลยกำหนด",
    "home.notiCardTitle": "การแจ้งเตือน",
    "home.notiUnread": "ยังไม่อ่าน",

    // Dashboard - stats
    "dash.fpTitle": "วางแผนครอบครัว",
    "dash.fpCycles": "จำนวนรอบเดือนที่บันทึก",
    "dash.fpLogsMonth": "บันทึกรายวันเดือนนี้",
    "dash.pvTitle": "Preventive",
    "dash.pvDueToday": "ครบกำหนดวันนี้",
    "dash.pvOverdue": "เลยกำหนด",
    "dash.quizTitle": "แบบทดสอบ",
    "dash.quizLastScore": "คะแนนล่าสุด",
    "dash.quizNoData": "ยังไม่มีผลแบบทดสอบ",

    // Dashboard - extra FP summary + streak
    "dash.fpPredTitle": "คาดการณ์ล่าสุด",
    "dash.fpNextPeriod": "รอบถัดไปคาดว่า:",
    "dash.fpOvulation": "วันไข่ตกคาดว่า:",
    "dash.fpFertile": "ช่วงเสี่ยงท้อง:",
    "dash.fpNoPred": "ยังไม่มีข้อมูลคาดการณ์ — เพิ่มรอบเดือนก่อน",

    "dash.streakTitle": "ความสม่ำเสมอการบันทึก",
    "dash.streak7": "7 วันล่าสุด บันทึกแล้ว",
    "dash.days": "{n} วัน",

    // Pregnancy
    "preg.title": "การตั้งครรภ์",
    "preg.subtitle": "ติดตามการตั้งครรภ์ • นัดหมาย • ลูกดิ้น • ค่าวัด",
    "preg.summary.title": "สรุปวันนี้",
    "preg.summary.subtitle": "ข้อมูลภาพรวมสำหรับวันนี้",
    "preg.summary.week": "สัปดาห์ที่",
    "preg.summary.nextAnc": "นัด ANC ถัดไป",
    "preg.summary.kicksToday": "ลูกดิ้นวันนี้",
    "preg.summary.weightLatest": "น้ำหนักล่าสุด",
    "preg.summary.bpLatest": "ความดันล่าสุด",
    "preg.tabs.profile": "ข้อมูลครรภ์",
    "preg.tabs.anc": "นัด ANC",
    "preg.tabs.kicks": "ลูกดิ้น",
    "preg.tabs.vitals": "ค่าวัด",

    "preg.profile.title": "ข้อมูลการตั้งครรภ์",
    "preg.profile.lmp": "วันแรกของประจำเดือนครั้งสุดท้าย (LMP)",
    "preg.profile.edd": "กำหนดคลอด (EDD)",
    "preg.profile.week": "อายุครรภ์ (สัปดาห์)",
    "preg.profile.notes": "หมายเหตุ",
    "preg.profile.editTitle": "แก้ไขข้อมูลครรภ์",
    "preg.profile.validation.lmp": "กรุณาระบุวัน LMP",

    "preg.anc.title": "นัด ANC",
    "preg.anc.addTitle": "เพิ่มนัด ANC",
    "preg.anc.editTitle": "แก้ไขนัด ANC",
    "preg.anc.empty": "ยังไม่มีนัด",
    "preg.anc.date": "วันที่นัด",
    "preg.anc.place": "สถานที่/หน่วยบริการ",
    "preg.anc.note": "หมายเหตุ",
    "preg.anc.validation.date": "กรุณาระบุวันที่นัด",

    "preg.kicks.title": "ลูกดิ้น",
    "preg.kicks.hint": "กด “+1” ทุกครั้งที่รู้สึกลูกดิ้น แล้วกดบันทึก",
    "preg.kicks.sessionDate": "วันที่",
    "preg.kicks.count": "จำนวนครั้ง",
    "preg.kicks.recent": "รายการล่าสุด",
    "preg.kicks.editTitle": "แก้ไขการบันทึกลูกดิ้น",
    "preg.kicks.validation.count": "กรุณาระบุจำนวนครั้งที่ถูกต้อง",

    "preg.vitals.title": "ค่าวัด",
    "preg.vitals.addTitle": "เพิ่มค่าวัด",
    "preg.vitals.editTitle": "แก้ไขค่าวัด",
    "preg.vitals.date": "วันที่",
    "preg.vitals.weight": "น้ำหนัก",
    "preg.vitals.bp": "ความดันโลหิต",
    "preg.vitals.edema": "อาการบวม",
    "preg.vitals.edema.none": "ไม่มีบวม",
    "preg.vitals.edema.mild": "บวมเล็กน้อย",
    "preg.vitals.edema.moderate": "บวมปานกลาง",
    "preg.vitals.edema.severe": "บวมมาก",
  },
  en: {
    "app.name": "FEMI",
    "nav.home": "Home",
    "nav.tools": "Tools",
    "nav.dashboard": "Dashboard",
    "nav.profile": "Profile",
    "nav.notifications": "Notifications",
    "common.loading": "Loading…",
    "common.errorTimeout": "Connection timed out. Please try again.",
    "common.errorNetwork": "Network error. Please check your connection.",
    "common.errorUnauthorized": "Please log in again.",
    "common.errorForbidden": "You don't have permission to do that.",
    "common.errorNotFound": "Not found.",
    "common.errorValidation": "Invalid data. Please check and try again.",
    "common.errorServer": "Server error. Please try again later.",
    "page.home": "Home",
    "page.tools": "Tools",
    "page.dashboard": "Dashboard",
    "page.profile": "Profile",
    "page.preventive": "Preventive",
    "page.knowledge": "Knowledge",
    "page.quiz": "Quiz",
    "fp.title": "Family Planning",
    "noti.title": "Notifications",

    // Pregnancy
    "preg.title": "Pregnancy",
    "preg.subtitle": "Track pregnancy • ANC • Kicks • Vitals",
    "preg.summary.title": "Today summary",
    "preg.summary.subtitle": "Overview for today",
    "preg.summary.week": "Week",
    "preg.summary.nextAnc": "Next ANC",
    "preg.summary.kicksToday": "Kicks today",
    "preg.summary.weightLatest": "Latest weight",
    "preg.summary.bpLatest": "Latest BP",
    "preg.tabs.profile": "Profile",
    "preg.tabs.anc": "ANC",
    "preg.tabs.kicks": "Kicks",
    "preg.tabs.vitals": "Vitals",

    "preg.profile.title": "Pregnancy profile",
    "preg.profile.lmp": "Last menstrual period (LMP)",
    "preg.profile.edd": "Estimated due date (EDD)",
    "preg.profile.week": "Gestational age (weeks)",
    "preg.profile.notes": "Notes",
    "preg.profile.editTitle": "Edit pregnancy profile",
    "preg.profile.validation.lmp": "Please provide LMP date",

    "preg.anc.title": "ANC appointments",
    "preg.anc.addTitle": "Add ANC",
    "preg.anc.editTitle": "Edit ANC",
    "preg.anc.empty": "No appointments",
    "preg.anc.date": "Date",
    "preg.anc.place": "Place",
    "preg.anc.note": "Note",
    "preg.anc.validation.date": "Please provide date",

    "preg.kicks.title": "Kicks",
    "preg.kicks.hint": "Tap +1 for each kick, then Save",
    "preg.kicks.sessionDate": "Date",
    "preg.kicks.count": "Count",
    "preg.kicks.recent": "Recent",
    "preg.kicks.editTitle": "Edit kicks",
    "preg.kicks.validation.count": "Please provide a valid count",

    "preg.vitals.title": "Vitals",
    "preg.vitals.addTitle": "Add vitals",
    "preg.vitals.editTitle": "Edit vitals",
    "preg.vitals.date": "Date",
    "preg.vitals.weight": "Weight",
    "preg.vitals.bp": "Blood pressure",
    "preg.vitals.edema": "Edema",
    "preg.vitals.edema.none": "None",
    "preg.vitals.edema.mild": "Mild",
    "preg.vitals.edema.moderate": "Moderate",
    "preg.vitals.edema.severe": "Severe",
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