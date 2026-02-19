// FEMI Action Handlers

function femiHandle_(action, payload, meta) {
  switch (action) {
    case "ping": return femiJsonOk_({ time: femiNowIso_(), app: PropertiesService.getScriptProperties().getProperty("APP_NAME") || "FEMI" });

    // Auth
    case "auth.login": return femiAuthLogin_(payload, meta);
    case "auth.register": return femiAuthRegister_(payload, meta);
    case "auth.me": return femiAuthMe_(payload);
    case "auth.logout": return femiAuthLogout_(payload);

    // Users (admin)
    case "users.list": return femiUsersList_(payload);
    case "users.get": return femiUsersGet_(payload);
    case "users.create": return femiUsersCreate_(payload);
    case "users.update": return femiUsersUpdate_(payload);
    case "users.delete": return femiUsersDelete_(payload);

    // News
    case "news.list": return femiNewsListPublic_();
    case "news.get": return femiNewsGetPublic_(payload);
    case "news.listAdmin": return femiNewsListAdmin_(payload);
    case "news.getAdmin": return femiNewsGetAdmin_(payload);
    case "news.create": return femiNewsCreate_(payload);
    case "news.update": return femiNewsUpdate_(payload);
    case "news.delete": return femiNewsDelete_(payload);

    // Knowledge
    case "knowledge.list": return femiKnowledgeListPublic_();
    case "knowledge.get": return femiKnowledgeGetPublic_(payload);
    case "knowledge.listAdmin": return femiKnowledgeListAdmin_(payload);
    case "knowledge.getAdmin": return femiKnowledgeGetAdmin_(payload);
    case "knowledge.create": return femiKnowledgeCreate_(payload);
    case "knowledge.update": return femiKnowledgeUpdate_(payload);
    case "knowledge.delete": return femiKnowledgeDelete_(payload);

    // Quiz
    case "quiz.questions.list": return femiQuizQuestionsListPublic_(payload);
    case "quiz.questions.listAdmin": return femiQuizQuestionsListAdmin_(payload);
    case "quiz.questions.getAdmin": return femiQuizQuestionsGetAdmin_(payload);
    case "quiz.questions.create": return femiQuizQuestionsCreate_(payload);
    case "quiz.questions.update": return femiQuizQuestionsUpdate_(payload);
    case "quiz.questions.delete": return femiQuizQuestionsDelete_(payload);

    case "quiz.choices.create": return femiQuizChoicesCreate_(payload);
    case "quiz.choices.update": return femiQuizChoicesUpdate_(payload);
    case "quiz.choices.delete": return femiQuizChoicesDelete_(payload);
    case "quiz.choices.listByQuestion": return femiQuizChoicesListByQuestion_(payload);

    case "quiz.submit": return femiQuizSubmit_(payload);
    case "quiz.results.my": return femiQuizResultsMy_(payload);
    case "quiz.results.list": return femiQuizResultsList_(payload);

    // Notifications
    case "notifications.list": return femiNotificationsList_(payload);
    case "notifications.get": return femiNotificationsGet_(payload);
    case "notifications.create": return femiNotificationsCreate_(payload);
    case "notifications.update": return femiNotificationsUpdate_(payload);
    case "notifications.delete": return femiNotificationsDelete_(payload);
    case "notifications.send": return femiNotificationsSend_(payload);
    case "notification.logs.latest": return femiNotificationLogsLatest_(payload);

    // Settings
    case "settings.get": return femiSettingsGet_(payload);
    case "settings.set": return femiSettingsSet_(payload);

    // Admin
    case "admin.stats": return femiAdminStats_(payload);

    default:
      return femiJsonErr_("UNKNOWN_ACTION", "Unknown action: " + action);
  }
}
