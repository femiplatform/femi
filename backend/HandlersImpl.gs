// FEMI Handlers Implementation

// --- Auth ---
function femiAuthLogin_(payload, meta) {
  var email = femiTrim_(payload.email).toLowerCase();
  var password = String(payload.password || "");
  femiRequire_(email && password, "VALIDATION", "Email and password are required");

  var u = femiFindBy_(FEMI_SHEETS.users, FEMI_HEADERS.users, "email", email);
  femiRequire_(u, "AUTH", "User not found");
  femiRequire_(femiIsActiveStatus_(u.status), "AUTH", "User is inactive");
  femiRequire_(femiVerifyPassword_(password, u.password), "AUTH", "Invalid credentials");

  // update lastLoginAt
  femiUpdateById_(FEMI_SHEETS.users, FEMI_HEADERS.users, "userId", u.userId, { lastLoginAt: femiNowIso_(), updatedAt: femiNowIso_() });

  var session = femiSessionCreate_(u, meta);
  return femiJsonOk_({ token: session.token, role: session.role, user: femiUserPublic_(u) });
}

function femiAuthRegister_(payload, meta) {
  var email = femiTrim_(payload.email).toLowerCase();
  var password = String(payload.password || "");
  var firstName = femiTrim_(payload.firstName);
  var lastName = femiTrim_(payload.lastName);

  femiRequire_(email && password, "VALIDATION", "Email and password are required");
  femiRequire_(password.length >= 8, "VALIDATION", "Password must be at least 8 characters");

  var exists = femiFindBy_(FEMI_SHEETS.users, FEMI_HEADERS.users, "email", email);
  femiRequire_(!exists, "VALIDATION", "Email already exists");

  var now = femiNowIso_();
  var user = {
    userId: femiId_("USR"),
    email: email,
    password: femiHashPassword_(password),
    firstName: firstName,
    lastName: lastName,
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
    role: "user",
    status: "Active",
    createdAt: now,
    updatedAt: now,
    lastLoginAt: now
  };

  femiAppend_(FEMI_SHEETS.users, FEMI_HEADERS.users, user);
  var session = femiSessionCreate_(user, meta);
  return femiJsonOk_({ token: session.token, role: session.role, user: femiUserPublic_(user) });
}

function femiAuthMe_(payload) {
  var token = femiTrim_(payload.token);
  var ses = femiSessionRequire_(token);
  var u = femiFindBy_(FEMI_SHEETS.users, FEMI_HEADERS.users, "userId", ses.userId);
  femiRequire_(u, "AUTH", "User not found");
  return femiJsonOk_(femiUserPublic_(u));
}

function femiAuthLogout_(payload) {
  var token = femiTrim_(payload.token);
  var ses = femiSessionGet_(token);
  if (ses) femiDeleteById_(FEMI_SHEETS.sessions, FEMI_HEADERS.sessions, "sessionId", ses.sessionId);
  return femiJsonOk_({ loggedOut: true });
}

// --- Users (admin) ---
function femiUsersList_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);

  var q = femiTrim_(payload.q).toLowerCase();
  var all = femiReadAll_(FEMI_SHEETS.users, FEMI_HEADERS.users).map(femiUserPublic_);
  if (!q) return femiJsonOk_(all);

  var filtered = all.filter(function(u){
    var name = (String(u.firstName||"") + " " + String(u.lastName||"")).toLowerCase();
    return String(u.email||"").toLowerCase().indexOf(q) >= 0 || name.indexOf(q) >= 0;
  });
  return femiJsonOk_(filtered);
}

function femiUsersGet_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  var u = femiFindBy_(FEMI_SHEETS.users, FEMI_HEADERS.users, "userId", payload.userId);
  femiRequire_(u, "NOT_FOUND", "User not found");
  return femiJsonOk_(femiUserPublic_(u));
}

function femiUsersCreate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);

  var email = femiTrim_(payload.email).toLowerCase();
  var password = String(payload.password || "");
  femiRequire_(email && password, "VALIDATION", "Email and password are required");
  femiRequire_(password.length >= 8, "VALIDATION", "Password must be at least 8 characters");
  femiRequire_(!femiFindBy_(FEMI_SHEETS.users, FEMI_HEADERS.users, "email", email), "VALIDATION", "Email already exists");

  var now = femiNowIso_();
  var user = {
    userId: femiId_("USR"),
    email: email,
    password: femiHashPassword_(password),
    firstName: femiTrim_(payload.firstName),
    lastName: femiTrim_(payload.lastName),
    birthDate: femiTrim_(payload.birthDate),
    phoneNumber: femiTrim_(payload.phoneNumber),
    address: femiTrim_(payload.address),
    district: femiTrim_(payload.district),
    province: femiTrim_(payload.province),
    postalCode: femiTrim_(payload.postalCode),
    height: femiTrim_(payload.height),
    weight: femiTrim_(payload.weight),
    bloodType: femiTrim_(payload.bloodType),
    chronicDiseases: femiTrim_(payload.chronicDiseases),
    allergies: femiTrim_(payload.allergies),
    role: femiTrim_(payload.role) || "user",
    status: femiTrim_(payload.status) || "Active",
    createdAt: now,
    updatedAt: now,
    lastLoginAt: ""
  };
  femiAppend_(FEMI_SHEETS.users, FEMI_HEADERS.users, user);
  return femiJsonOk_(femiUserPublic_(user));
}

function femiUsersUpdate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);

  femiRequire_(payload.userId, "VALIDATION", "userId required");
  var patch = payload.patch || {};
  if (patch.password) {
    femiRequire_(String(patch.password).length >= 8, "VALIDATION", "Password must be at least 8 characters");
    patch.password = femiHashPassword_(String(patch.password));
  }
  patch.updatedAt = femiNowIso_();
  var updated = femiUpdateById_(FEMI_SHEETS.users, FEMI_HEADERS.users, "userId", payload.userId, patch);
  femiRequire_(updated, "NOT_FOUND", "User not found");
  return femiJsonOk_(femiUserPublic_(updated));
}

function femiUsersDelete_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);

  femiRequire_(payload.userId, "VALIDATION", "userId required");
  var ok = femiDeleteById_(FEMI_SHEETS.users, FEMI_HEADERS.users, "userId", payload.userId);
  femiRequire_(ok, "NOT_FOUND", "User not found");
  return femiJsonOk_({ deleted: true });
}

// --- News ---
function femiNewsListPublic_() {
  var all = femiReadAll_(FEMI_SHEETS.news, FEMI_HEADERS.news);
  var published = all.filter(function(x){ return String(x.status||"") === "Published"; });
  published.sort(function(a,b){ return String(b.publishedAt||b.updatedAt||"").localeCompare(String(a.publishedAt||a.updatedAt||"")); });
  return femiJsonOk_(published);
}

function femiNewsGetPublic_(payload) {
  femiRequire_(payload.newsId, "VALIDATION", "newsId required");
  var item = femiFindBy_(FEMI_SHEETS.news, FEMI_HEADERS.news, "newsId", payload.newsId);
  femiRequire_(item, "NOT_FOUND", "Not found");
  femiRequire_(String(item.status||"") === "Published", "FORBIDDEN", "Not published");
  return femiJsonOk_(item);
}

function femiNewsListAdmin_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  var all = femiReadAll_(FEMI_SHEETS.news, FEMI_HEADERS.news);
  all.sort(function(a,b){ return String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")); });
  return femiJsonOk_(all);
}

function femiNewsGetAdmin_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.newsId, "VALIDATION", "newsId required");
  var item = femiFindBy_(FEMI_SHEETS.news, FEMI_HEADERS.news, "newsId", payload.newsId);
  femiRequire_(item, "NOT_FOUND", "Not found");
  return femiJsonOk_(item);
}

function femiNewsCreate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);

  femiRequire_(payload.title, "VALIDATION", "title required");
  var now = femiNowIso_();
  var status = femiTrim_(payload.status) || "Draft";
  var publishedAt = (status === "Published") ? now : "";
  var item = {
    newsId: femiId_("NEWS"),
    title: femiTrim_(payload.title),
    summary: femiTrim_(payload.summary),
    content: femiTrim_(payload.content),
    coverImageUrl: femiTrim_(payload.coverImageUrl),
    category: femiTrim_(payload.category) || "ประกาศ",
    status: status,
    publishedAt: publishedAt,
    createdAt: now,
    updatedAt: now,
    createdBy: ses.userId
  };
  femiAppend_(FEMI_SHEETS.news, FEMI_HEADERS.news, item);
  return femiJsonOk_(item);
}

function femiNewsUpdate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.newsId, "VALIDATION", "newsId required");
  var patch = payload.patch || {};
  // allow direct patch payload from frontend
  if (payload.title !== undefined) patch = payload;
  patch.updatedAt = femiNowIso_();
  if (patch.status === "Published") {
    // set publishedAt if empty
    var cur = femiFindBy_(FEMI_SHEETS.news, FEMI_HEADERS.news, "newsId", payload.newsId);
    if (cur && !cur.publishedAt) patch.publishedAt = femiNowIso_();
  }
  var updated = femiUpdateById_(FEMI_SHEETS.news, FEMI_HEADERS.news, "newsId", payload.newsId, patch);
  femiRequire_(updated, "NOT_FOUND", "Not found");
  return femiJsonOk_(updated);
}

function femiNewsDelete_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.newsId, "VALIDATION", "newsId required");
  var ok = femiDeleteById_(FEMI_SHEETS.news, FEMI_HEADERS.news, "newsId", payload.newsId);
  femiRequire_(ok, "NOT_FOUND", "Not found");
  return femiJsonOk_({ deleted: true });
}

// --- Knowledge ---
function femiKnowledgeListPublic_() {
  var all = femiReadAll_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge);
  var published = all.filter(function(x){ return String(x.status||"") === "Published"; });
  published.sort(function(a,b){ return String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")); });
  return femiJsonOk_(published);
}

function femiKnowledgeGetPublic_(payload) {
  femiRequire_(payload.kbId, "VALIDATION", "kbId required");
  var item = femiFindBy_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge, "kbId", payload.kbId);
  femiRequire_(item, "NOT_FOUND", "Not found");
  femiRequire_(String(item.status||"") === "Published", "FORBIDDEN", "Not published");
  return femiJsonOk_(item);
}

function femiKnowledgeListAdmin_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  var all = femiReadAll_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge);
  all.sort(function(a,b){ return String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")); });
  return femiJsonOk_(all);
}

function femiKnowledgeGetAdmin_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.kbId, "VALIDATION", "kbId required");
  var item = femiFindBy_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge, "kbId", payload.kbId);
  femiRequire_(item, "NOT_FOUND", "Not found");
  return femiJsonOk_(item);
}

function femiKnowledgeCreate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);

  femiRequire_(payload.title, "VALIDATION", "title required");
  var now = femiNowIso_();
  var item = {
    kbId: femiId_("KB"),
    title: femiTrim_(payload.title),
    summary: femiTrim_(payload.summary),
    content: femiTrim_(payload.content),
    tags: femiTrim_(payload.tags),
    status: femiTrim_(payload.status) || "Draft",
    createdAt: now,
    updatedAt: now,
    createdBy: ses.userId
  };
  femiAppend_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge, item);
  return femiJsonOk_(item);
}

function femiKnowledgeUpdate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.kbId, "VALIDATION", "kbId required");
  var patch = payload.patch || {};
  if (payload.title !== undefined) patch = payload;
  patch.updatedAt = femiNowIso_();
  var updated = femiUpdateById_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge, "kbId", payload.kbId, patch);
  femiRequire_(updated, "NOT_FOUND", "Not found");
  return femiJsonOk_(updated);
}

function femiKnowledgeDelete_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.kbId, "VALIDATION", "kbId required");
  var ok = femiDeleteById_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge, "kbId", payload.kbId);
  femiRequire_(ok, "NOT_FOUND", "Not found");
  return femiJsonOk_({ deleted: true });
}

// --- Quiz ---
function femiQuizQuestionsListPublic_(payload) {
  var category = femiTrim_(payload.category);
  var qsAll = femiReadAll_(FEMI_SHEETS.quizQuestions, FEMI_HEADERS.quizQuestions);
  var choicesAll = femiReadAll_(FEMI_SHEETS.quizChoices, FEMI_HEADERS.quizChoices);

  var published = qsAll.filter(function(q){
    if (String(q.status||"") !== "Published") return false;
    if (category && String(q.category||"") !== category) return false;
    return true;
  });

  // attach choices
  for (var i=0; i<published.length; i++) {
    var qid = published[i].questionId;
    var ch = choicesAll.filter(function(c){ return String(c.questionId) === String(qid); });
    // don't expose isCorrect
    published[i].choices = ch.map(function(c){ return { choiceId: c.choiceId, questionId: c.questionId, choiceText: c.choiceText }; });
  }

  return femiJsonOk_(published);
}

function femiQuizQuestionsListAdmin_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  var all = femiReadAll_(FEMI_SHEETS.quizQuestions, FEMI_HEADERS.quizQuestions);
  all.sort(function(a,b){ return String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")); });
  return femiJsonOk_(all);
}

function femiQuizQuestionsGetAdmin_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.questionId, "VALIDATION", "questionId required");
  var item = femiFindBy_(FEMI_SHEETS.quizQuestions, FEMI_HEADERS.quizQuestions, "questionId", payload.questionId);
  femiRequire_(item, "NOT_FOUND", "Not found");
  return femiJsonOk_(item);
}

function femiQuizQuestionsCreate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.questionText, "VALIDATION", "questionText required");
  var now = femiNowIso_();
  var q = {
    questionId: femiId_("Q"),
    questionText: femiTrim_(payload.questionText),
    category: femiTrim_(payload.category),
    difficulty: femiTrim_(payload.difficulty),
    status: femiTrim_(payload.status) || "Draft",
    createdAt: now,
    updatedAt: now,
    createdBy: ses.userId
  };
  femiAppend_(FEMI_SHEETS.quizQuestions, FEMI_HEADERS.quizQuestions, q);
  return femiJsonOk_(q);
}

function femiQuizQuestionsUpdate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.questionId, "VALIDATION", "questionId required");
  var patch = payload.patch || {};
  patch.updatedAt = femiNowIso_();
  var updated = femiUpdateById_(FEMI_SHEETS.quizQuestions, FEMI_HEADERS.quizQuestions, "questionId", payload.questionId, patch);
  femiRequire_(updated, "NOT_FOUND", "Not found");
  return femiJsonOk_(updated);
}

function femiQuizQuestionsDelete_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.questionId, "VALIDATION", "questionId required");
  // delete choices of this question too
  var allChoices = femiReadAll_(FEMI_SHEETS.quizChoices, FEMI_HEADERS.quizChoices);
  for (var i=0; i<allChoices.length; i++) {
    if (String(allChoices[i].questionId) === String(payload.questionId)) {
      femiDeleteById_(FEMI_SHEETS.quizChoices, FEMI_HEADERS.quizChoices, "choiceId", allChoices[i].choiceId);
    }
  }
  var ok = femiDeleteById_(FEMI_SHEETS.quizQuestions, FEMI_HEADERS.quizQuestions, "questionId", payload.questionId);
  femiRequire_(ok, "NOT_FOUND", "Not found");
  return femiJsonOk_({ deleted: true });
}

function femiQuizChoicesCreate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.questionId && payload.choiceText, "VALIDATION", "questionId and choiceText required");
  var now = femiNowIso_();
  var c = {
    choiceId: femiId_("C"),
    questionId: femiTrim_(payload.questionId),
    choiceText: femiTrim_(payload.choiceText),
    isCorrect: femiBoolStr_(payload.isCorrect),
    createdAt: now,
    updatedAt: now
  };
  femiAppend_(FEMI_SHEETS.quizChoices, FEMI_HEADERS.quizChoices, c);
  return femiJsonOk_(c);
}

function femiQuizChoicesUpdate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.choiceId, "VALIDATION", "choiceId required");
  var patch = payload.patch || {};
  if (patch.isCorrect !== undefined) patch.isCorrect = femiBoolStr_(patch.isCorrect);
  patch.updatedAt = femiNowIso_();
  var updated = femiUpdateById_(FEMI_SHEETS.quizChoices, FEMI_HEADERS.quizChoices, "choiceId", payload.choiceId, patch);
  femiRequire_(updated, "NOT_FOUND", "Not found");
  return femiJsonOk_(updated);
}

function femiQuizChoicesDelete_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.choiceId, "VALIDATION", "choiceId required");
  var ok = femiDeleteById_(FEMI_SHEETS.quizChoices, FEMI_HEADERS.quizChoices, "choiceId", payload.choiceId);
  femiRequire_(ok, "NOT_FOUND", "Not found");
  return femiJsonOk_({ deleted: true });
}

function femiQuizChoicesListByQuestion_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.questionId, "VALIDATION", "questionId required");
  var all = femiReadAll_(FEMI_SHEETS.quizChoices, FEMI_HEADERS.quizChoices);
  var out = all.filter(function(c){ return String(c.questionId) === String(payload.questionId); });
  return femiJsonOk_(out);
}

function femiQuizSubmit_(payload) {
  var ses = femiSessionRequire_(payload.token);
  var userId = ses.userId;
  var category = femiTrim_(payload.category) || "general";
  var answers = payload.answers || [];
  femiRequire_(answers && answers.length > 0, "VALIDATION", "answers required");

  var qsAll = femiReadAll_(FEMI_SHEETS.quizQuestions, FEMI_HEADERS.quizQuestions);
  var choicesAll = femiReadAll_(FEMI_SHEETS.quizChoices, FEMI_HEADERS.quizChoices);

  // Build correctness map
  var correctByQuestion = {};
  for (var i=0; i<choicesAll.length; i++) {
    if (String(choicesAll[i].isCorrect) === "TRUE") {
      correctByQuestion[String(choicesAll[i].questionId)] = String(choicesAll[i].choiceId);
    }
  }

  var score = 0;
  var total = 0;
  for (var j=0; j<answers.length; j++) {
    var qid = String(answers[j].questionId || "");
    var cid = String(answers[j].choiceId || "");
    if (!qid) continue;
    // Only count published questions
    var q = qsAll.filter(function(x){ return String(x.questionId) === qid; })[0];
    if (!q || String(q.status||"") !== "Published") continue;
    total++;
    if (correctByQuestion[qid] && correctByQuestion[qid] === cid) score++;
  }

  var now = femiNowIso_();
  var result = {
    resultId: femiId_("R"),
    userId: userId,
    category: category,
    score: score,
    total: total,
    answersJson: JSON.stringify(answers),
    takenAt: now,
    createdAt: now
  };
  femiAppend_(FEMI_SHEETS.quizResults, FEMI_HEADERS.quizResults, result);
  return femiJsonOk_(result);
}

function femiQuizResultsMy_(payload) {
  var ses = femiSessionRequire_(payload.token);
  var all = femiReadAll_(FEMI_SHEETS.quizResults, FEMI_HEADERS.quizResults);
  var out = all.filter(function(r){ return String(r.userId) === String(ses.userId); });
  out.sort(function(a,b){ return String(b.takenAt||"").localeCompare(String(a.takenAt||"")); });
  return femiJsonOk_(out);
}

function femiQuizResultsList_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  var all = femiReadAll_(FEMI_SHEETS.quizResults, FEMI_HEADERS.quizResults);
  all.sort(function(a,b){ return String(b.takenAt||"").localeCompare(String(a.takenAt||"")); });
  return femiJsonOk_(all.slice(0, 200));
}

// --- Notifications ---
function femiNotificationsList_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  var all = femiReadAll_(FEMI_SHEETS.notifications, FEMI_HEADERS.notifications);
  all.sort(function(a,b){ return String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")); });
  return femiJsonOk_(all);
}

function femiNotificationsGet_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.notificationId, "VALIDATION", "notificationId required");
  var item = femiFindBy_(FEMI_SHEETS.notifications, FEMI_HEADERS.notifications, "notificationId", payload.notificationId);
  femiRequire_(item, "NOT_FOUND", "Not found");
  return femiJsonOk_(item);
}

function femiNotificationsCreate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.title && payload.message, "VALIDATION", "title/message required");
  var now = femiNowIso_();
  var item = {
    notificationId: femiId_("NTF"),
    title: femiTrim_(payload.title),
    message: femiTrim_(payload.message),
    channel: femiTrim_(payload.channel) || "inapp",
    target: femiTrim_(payload.target) || "all",
    scheduleAt: femiTrim_(payload.scheduleAt),
    status: femiTrim_(payload.status) || "Draft",
    createdAt: now,
    updatedAt: now,
    createdBy: ses.userId
  };
  femiAppend_(FEMI_SHEETS.notifications, FEMI_HEADERS.notifications, item);
  return femiJsonOk_(item);
}

function femiNotificationsUpdate_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.notificationId, "VALIDATION", "notificationId required");
  var patch = payload.patch || {};
  patch.updatedAt = femiNowIso_();
  var updated = femiUpdateById_(FEMI_SHEETS.notifications, FEMI_HEADERS.notifications, "notificationId", payload.notificationId, patch);
  femiRequire_(updated, "NOT_FOUND", "Not found");
  return femiJsonOk_(updated);
}

function femiNotificationsDelete_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.notificationId, "VALIDATION", "notificationId required");
  var ok = femiDeleteById_(FEMI_SHEETS.notifications, FEMI_HEADERS.notifications, "notificationId", payload.notificationId);
  femiRequire_(ok, "NOT_FOUND", "Not found");
  return femiJsonOk_({ deleted: true });
}

function femiNotificationsSend_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.notificationId, "VALIDATION", "notificationId required");

  var noti = femiFindBy_(FEMI_SHEETS.notifications, FEMI_HEADERS.notifications, "notificationId", payload.notificationId);
  femiRequire_(noti, "NOT_FOUND", "Not found");

  // In starter version: just record logs for all users (or minimal)
  var users = femiReadAll_(FEMI_SHEETS.users, FEMI_HEADERS.users).map(femiUserPublic_);
  var targets = users;
  if (String(noti.target) === "users") targets = users.filter(function(u){ return String(u.role) !== "admin"; });

  var now = femiNowIso_();
  for (var i=0; i<targets.length; i++) {
    var log = {
      logId: femiId_("NLOG"),
      notificationId: noti.notificationId,
      userId: targets[i].userId,
      status: "SENT",
      sentAt: now,
      providerResponse: "logged"
    };
    femiAppend_(FEMI_SHEETS.notificationLogs, FEMI_HEADERS.notificationLogs, log);
  }

  femiUpdateById_(FEMI_SHEETS.notifications, FEMI_HEADERS.notifications, "notificationId", noti.notificationId, { status: "Sent", updatedAt: now });
  return femiJsonOk_({ sent: true, count: targets.length });
}

function femiNotificationLogsLatest_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  var all = femiReadAll_(FEMI_SHEETS.notificationLogs, FEMI_HEADERS.notificationLogs);
  all.sort(function(a,b){ return String(b.sentAt||"").localeCompare(String(a.sentAt||"")); });
  return femiJsonOk_(all.slice(0, 30));
}

// --- Settings ---
function femiSettingsGet_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  var all = femiReadAll_(FEMI_SHEETS.systemConfig, FEMI_HEADERS.systemConfig);
  all.sort(function(a,b){ return String(a.configKey||"").localeCompare(String(b.configKey||"")); });
  return femiJsonOk_(all);
}

function femiSettingsSet_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);
  femiRequire_(payload.configKey, "VALIDATION", "configKey required");
  var key = femiTrim_(payload.configKey);
  var value = femiTrim_(payload.configValue);
  var now = femiNowIso_();
  // update if exists
  var existing = femiFindBy_(FEMI_SHEETS.systemConfig, FEMI_HEADERS.systemConfig, "configKey", key);
  if (existing) {
    femiUpdateById_(FEMI_SHEETS.systemConfig, FEMI_HEADERS.systemConfig, "configKey", key, { configValue: value, updatedAt: now, updatedBy: ses.userId });
    return femiJsonOk_({ configKey: key, configValue: value });
  }
  var row = { configKey: key, configValue: value, updatedAt: now, updatedBy: ses.userId };
  femiAppend_(FEMI_SHEETS.systemConfig, FEMI_HEADERS.systemConfig, row);
  return femiJsonOk_(row);
}

// --- Admin Stats ---
function femiAdminStats_(payload) {
  var ses = femiSessionRequire_(payload.token);
  femiRequireAdmin_(ses);

  var users = femiReadAll_(FEMI_SHEETS.users, FEMI_HEADERS.users).map(femiUserPublic_);
  var news = femiReadAll_(FEMI_SHEETS.news, FEMI_HEADERS.news);
  var kb = femiReadAll_(FEMI_SHEETS.knowledge, FEMI_HEADERS.knowledge);
  var results = femiReadAll_(FEMI_SHEETS.quizResults, FEMI_HEADERS.quizResults);

  var latestNews = news.slice().sort(function(a,b){ return String(b.updatedAt||"").localeCompare(String(a.updatedAt||"")); }).slice(0, 5);
  var latestResults = results.slice().sort(function(a,b){ return String(b.takenAt||"").localeCompare(String(a.takenAt||"")); }).slice(0, 5);

  return femiJsonOk_({
    users: users.length,
    news: news.length,
    knowledge: kb.length,
    quizResults: results.length,
    latestNews: latestNews,
    latestResults: latestResults
  });
}
