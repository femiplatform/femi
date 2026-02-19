// FEMI Bootstrap (create sheets + seed admin/content)

function bootstrapFEMI() {
  // Ensure sheets + headers
  femiEnsureSheet_(FEMI_SHEETS.users, FEMI_HEADERS.users);
  femiEnsureSheet_(FEMI_SHEETS.sessions, FEMI_HEADERS.sessions);
  femiEnsureSheet_(FEMI_SHEETS.news, FEMI_HEADERS.news);
  femiEnsureSheet_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge);
  femiEnsureSheet_(FEMI_SHEETS.quizQuestions, FEMI_HEADERS.quizQuestions);
  femiEnsureSheet_(FEMI_SHEETS.quizChoices, FEMI_HEADERS.quizChoices);
  femiEnsureSheet_(FEMI_SHEETS.quizResults, FEMI_HEADERS.quizResults);
  femiEnsureSheet_(FEMI_SHEETS.notifications, FEMI_HEADERS.notifications);
  femiEnsureSheet_(FEMI_SHEETS.notificationLogs, FEMI_HEADERS.notificationLogs);
  femiEnsureSheet_(FEMI_SHEETS.systemConfig, FEMI_HEADERS.systemConfig);
  femiEnsureSheet_(FEMI_SHEETS.activityLogs, FEMI_HEADERS.activityLogs);
  femiEnsureSheet_(FEMI_SHEETS.healthRecords, FEMI_HEADERS.healthRecords);
  femiEnsureSheet_(FEMI_SHEETS.pregnancy, FEMI_HEADERS.pregnancy);

  // Seed admin if not exists
  var adminEmail = FEMI_DEFAULTS.adminEmail.toLowerCase();
  var admin = femiFindBy_(FEMI_SHEETS.users, FEMI_HEADERS.users, "email", adminEmail);
  if (!admin) {
    var now = femiNowIso_();
    var user = {
      userId: femiId_("USR"),
      email: adminEmail,
      password: femiHashPassword_(FEMI_DEFAULTS.adminPassword),
      firstName: FEMI_DEFAULTS.adminFirstName,
      lastName: FEMI_DEFAULTS.adminLastName,
      birthDate: "",
      phoneNumber: "",
      address: "",
      district: "",
      province: "",
      postalCode: "",
      height: "",
      weight: "",
      bloodType: "",
      chronicDiseases: "",
      allergies: "",
      role: "admin",
      status: "Active",
      createdAt: now,
      updatedAt: now,
      lastLoginAt: ""
    };
    femiAppend_(FEMI_SHEETS.users, FEMI_HEADERS.users, user);
  }

  // Seed sample content if empty
  var n = femiReadAll_(FEMI_SHEETS.news, FEMI_HEADERS.news);
  if (n.length === 0) {
    var now2 = femiNowIso_();
    femiAppend_(FEMI_SHEETS.news, FEMI_HEADERS.news, {
      newsId: femiId_("NEWS"),
      title: "ยินดีต้อนรับสู่ FEMI",
      summary: "เริ่มต้นใช้งานระบบ: อ่านความรู้ ทำแบบทดสอบ และดูประวัติของคุณ",
      content: "นี่คือประกาศตัวอย่าง คุณสามารถแก้ไข/เพิ่มประกาศได้จากหน้า Admin",
      coverImageUrl: "",
      category: "ประกาศ",
      status: "Published",
      publishedAt: now2,
      createdAt: now2,
      updatedAt: now2,
      createdBy: ""
    });
  }

  var k = femiReadAll_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge);
  if (k.length === 0) {
    var now3 = femiNowIso_();
    femiAppend_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge, {
      kbId: femiId_("KB"),
      title: "การดูแลสุขภาพผู้หญิงเบื้องต้น",
      summary: "แนวทางทั่วไปสำหรับการดูแลสุขภาพในชีวิตประจำวัน",
      content: "ตัวอย่างบทความ: การนอนหลับให้เพียงพอ ออกกำลังกายสม่ำเสมอ และตรวจสุขภาพตามช่วงวัย",
      tags: "health",
      status: "Published",
      createdAt: now3,
      updatedAt: now3,
      createdBy: ""
    });
  }

  // Seed quiz sample if empty
  var q = femiReadAll_(FEMI_SHEETS.quizQuestions, FEMI_HEADERS.quizQuestions);
  if (q.length === 0) {
    var now4 = femiNowIso_();
    var q1 = {
      questionId: femiId_("Q"),
      questionText: "ข้อใดช่วยให้สุขภาพดีขึ้นได้อย่างยั่งยืน?",
      category: "health",
      difficulty: "easy",
      status: "Published",
      createdAt: now4,
      updatedAt: now4,
      createdBy: ""
    };
    femiAppend_(FEMI_SHEETS.quizQuestions, FEMI_HEADERS.quizQuestions, q1);

    var choices = [
      { text: "นอนหลับให้เพียงพอและออกกำลังกายสม่ำเสมอ", correct: true },
      { text: "อดอาหารเป็นเวลานานโดยไม่ปรึกษาผู้เชี่ยวชาญ", correct: false },
      { text: "ดื่มน้ำหวานทุกวันเพื่อให้มีพลัง", correct: false }
    ];
    for (var i=0; i<choices.length; i++) {
      femiAppend_(FEMI_SHEETS.quizChoices, FEMI_HEADERS.quizChoices, {
        choiceId: femiId_("C"),
        questionId: q1.questionId,
        choiceText: choices[i].text,
        isCorrect: choices[i].correct ? "TRUE" : "FALSE",
        createdAt: now4,
        updatedAt: now4
      });
    }
  }

  return "OK";
}
