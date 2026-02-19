// FEMI Backend Config

var FEMI_SHEETS = {
  users: "users",
  sessions: "sessions",
  news: "news",
  knowledge: "knowledge_base",
  quizQuestions: "quiz_questions",
  quizChoices: "quiz_choices",
  quizResults: "quiz_results",
  notifications: "notifications",
  notificationLogs: "notification_logs",
  systemConfig: "system_config",
  activityLogs: "activity_logs",
  healthRecords: "health_records",
  pregnancy: "pregnancy"
};

var FEMI_HEADERS = {
  users: ["userId","email","password","firstName","lastName","birthDate","phoneNumber","address","district","province","postalCode","height","weight","bloodType","chronicDiseases","allergies","role","status","createdAt","updatedAt","lastLoginAt"],
  sessions: ["sessionId","userId","token","role","expiresAt","createdAt","ip","userAgent"],
  news: ["newsId","title","summary","content","coverImageUrl","category","status","publishedAt","createdAt","updatedAt","createdBy"],
  knowledge: ["kbId","title","summary","content","tags","status","createdAt","updatedAt","createdBy"],
  quizQuestions: ["questionId","questionText","category","difficulty","status","createdAt","updatedAt","createdBy"],
  quizChoices: ["choiceId","questionId","choiceText","isCorrect","createdAt","updatedAt"],
  quizResults: ["resultId","userId","category","score","total","answersJson","takenAt","createdAt"],
  notifications: ["notificationId","title","message","channel","target","scheduleAt","status","createdAt","updatedAt","createdBy"],
  notificationLogs: ["logId","notificationId","userId","status","sentAt","providerResponse"],
  systemConfig: ["configKey","configValue","updatedAt","updatedBy"],
  activityLogs: ["logId","actorUserId","action","entity","entityId","detailJson","createdAt","ip"],
  healthRecords: ["recordId","userId","recordType","dataJson","recordedAt","createdAt"],
  pregnancy: ["pregnancyId","userId","lmpDate","eddDate","gestationalWeeks","notes","updatedAt"]
};

var FEMI_DEFAULTS = {
  sessionHours: 24 * 7, // 7 days
  adminEmail: "admin@femi.local",
  adminPassword: "Admin@12345",
  adminFirstName: "Admin",
  adminLastName: "FEMI"
};
