// femi/frontend/js/api.js
import { FEMI } from "./config.js";
import { getToken } from "./auth.js";

/**
 * Core request helper
 * Expected backend response:
 *  { success: true, data: ... }
 *  { success: false, error: { code, message, details? } }
 */
async function request(action, payload = {}, opts = {}) {
  const body = { action, payload: payload || {} };

  // attach token unless explicitly disabled
  if (opts.withToken !== false) {
    const token = getToken();
    if (token && !body.payload.token) body.payload.token = token;
  }

  const res = await fetch(FEMI.API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw {
      success: false,
      error: { code: "BAD_JSON", message: "Invalid JSON response", details: text },
    };
  }

  if (!json || json.success !== true) {
    // normalize error shape
    const err = json?.error || { code: "UNKNOWN", message: "Unknown error" };
    throw { success: false, error: err };
  }

  return json.data;
}

export const api = {
  request,

  // ---- System ----
  ping: () => request("ping", {}, { withToken: false }),

  // ---- Auth ----
  login: (email, password) =>
    request("auth.login", { email, password }, { withToken: false }),

  register: (payload) =>
    request("auth.register", payload, { withToken: false }),

  me: () => request("auth.me", {}),

  logout: () => request("auth.logout", {}),

  // (optional) Sprint 0 debug
  whoami: () => request("debug.whoami", {}),

  // ---- Users (ถ้ามีใช้ในหน้า admin/user management) ----
  usersList: (q = "") => request("users.list", { q }),
  usersGet: (userId) => request("users.get", { userId }),
  usersCreate: (user) => request("users.create", user),
  usersUpdate: (userId, patch) => request("users.update", { userId, patch }),
  usersDelete: (userId) => request("users.delete", { userId }),

  // ---- Content: News ----
  newsList: () => request("news.list", {}, { withToken: false }),
  newsGet: (newsId) => request("news.get", { newsId }, { withToken: false }),
  newsCreate: (item) => request("news.create", item),
  newsUpdate: (newsId, patch) => request("news.update", { newsId, patch }),
  newsDelete: (newsId) => request("news.delete", { newsId }),

  // ---- Content: Knowledge Base ----
  knowledgeList: () => request("knowledge.list", {}, { withToken: false }),
  knowledgeGet: (kbId) => request("knowledge.get", { kbId }, { withToken: false }),
  knowledgeCreate: (item) => request("knowledge.create", item),
  knowledgeUpdate: (kbId, patch) => request("knowledge.update", { kbId, patch }),
  knowledgeDelete: (kbId) => request("knowledge.delete", { kbId }),

  // ---- Quiz ----
  quizQuestionsList: (category = "") =>
    request("quiz.questions.list", { category }, { withToken: false }),

  quizSubmit: (payload) => request("quiz.submit", payload),

  quizMyResults: () => request("quiz.results.my", {}),

  // ---- Notifications / Settings ----
  notificationsList: () => request("notifications.list", {}),
  notificationsCreate: (item) => request("notifications.create", item),
  notificationsSend: (notificationId) =>
    request("notifications.send", { notificationId }),

  settingsGet: () => request("settings.get", {}),
  settingsSet: (configKey, configValue) =>
    request("settings.set", { configKey, configValue }),

  // =========================================================
  // ✅ Preventive (User) — Sprint 1
  // =========================================================
  preventiveList: () => request("preventive.list", {}),

  preventiveMarkDone: (userItemId) =>
    request("preventive.markDone", { userItemId }),

  preventiveMarkSkipped: (userItemId, reason = "") =>
    request("preventive.markSkipped", { userItemId, reason }),

  preventiveSetReminderTime: (userItemId, remindTime) =>
    request("preventive.setReminderTime", { userItemId, remindTime }),
};

// Make api accessible in DevTools console
if (typeof window !== "undefined") {
  window.api = api;
}