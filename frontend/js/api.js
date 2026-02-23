// femi/frontend/js/api.js
import { FEMI } from "./config.js";
import { getToken } from "./auth.js";

async function request(action, payload = {}, opts = {}) {
  const body = { action, payload: payload || {} };

  if (opts.withToken !== false) {
    const token = getToken();
    if (token && !body.payload.token) body.payload.token = token;
  }

  const res = await fetch(FEMI.API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw { success: false, error: { code: "BAD_JSON", message: "Invalid JSON response", details: text } };
  }

  if (!json?.success) {
    throw { success: false, error: json?.error || { code: "UNKNOWN", message: "Unknown error" } };
  }

  return json.data;
}

export const api = {
  request,

  // System
  ping: () => request("ping", {}, { withToken: false }),

  // Auth
  login: (email, password) => request("auth.login", { email, password }, { withToken: false }),
  register: (payload) => request("auth.register", payload, { withToken: false }),
  me: () => request("auth.me", {}),
  logout: () => request("auth.logout", {}),
  whoami: () => request("debug.whoami", {}),

  // Content (Public)
  newsList: () => request("news.list", {}, { withToken: false }),
  newsGet: (newsId) => request("news.get", { newsId }, { withToken: false }),
  knowledgeList: () => request("knowledge.list", {}, { withToken: false }),
  knowledgeGet: (kbId) => request("knowledge.get", { kbId }, { withToken: false }),

  // Quiz
  quizQuestionsList: (category = "") => request("quiz.questions.list", { category }, { withToken: false }),
  quizSubmit: (payload) => request("quiz.submit", payload),
  quizMyResults: () => request("quiz.results.my", {}),

  // Preventive (User)
  preventiveList: () => request("preventive.list", {}),
  preventiveMarkDone: (userItemId) => request("preventive.markDone", { userItemId }),
  preventiveMarkSkipped: (userItemId, reason = "") => request("preventive.markSkipped", { userItemId, reason }),
  preventiveSetReminderTime: (userItemId, remindTime) => request("preventive.setReminderTime", { userItemId, remindTime }),

  // User notifications (INAPP MVP)
  userNotificationsList: (limit = 30) => request("user.notifications.list", { limit }),
  userNotificationsMarkRead: (notificationId) => request("user.notifications.markRead", { notificationId }),
  userNotificationsUnreadCount: () => request("user.notifications.unreadCount", {})

  // Smart Family Planning – Sprint 2
  fpCyclesList: () => request("fp.cycles.list", {}),
  fpCyclesCreate: (payload) => request("fp.cycles.create", payload),
  fpCyclesUpdate: (payload) => request("fp.cycles.update", payload),
  fpCyclesDelete: (cycleId) => request("fp.cycles.delete", { cycleId }),

  fpDailyListRange: ({ dateFrom, dateTo }) => request("fp.daily.listRange", { dateFrom, dateTo }),
  fpDailyUpsert: (payload) => request("fp.daily.upsert", payload),

  fpPredictRecompute: (payload = {}) => request("fp.predict.recompute", payload),
};

// expose for debugging
if (typeof window !== "undefined") window.api = api;
