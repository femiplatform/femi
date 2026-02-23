// femi/frontend/js/api.js
import { FEMI } from "./config.js";
import { getToken } from "./auth.js";

function makeError(code, message = "", details = null) {
  return { success: false, error: { code, message, details } };
}

async function request(action, payload = {}, opts = {}) {
  const body = { action, payload: payload || {} };

  if (opts.withToken !== false) {
    const token = getToken();
    if (token && !body.payload.token) body.payload.token = token;
  }

  const timeoutMs = Number.isFinite(opts.timeoutMs) ? opts.timeoutMs : 15000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(FEMI.API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timer);
    if (err?.name === "AbortError") throw makeError("TIMEOUT", "Request timeout");
    throw makeError("NETWORK_ERROR", err?.message || "Network error");
  } finally {
    clearTimeout(timer);
  }

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw makeError("BAD_JSON", text);
  }

  // If backend returns error codes like ERR_*, just pass through
  if (!json?.success) {
    const code = json?.error?.code || (res.status === 401 ? "ERR_AUTH" : "ERR_SERVER");
    const message = (json?.error?.message || (typeof json?.error === "string" ? json.error : "") || json?.message || "");
    const details = json?.error?.details || null;
    throw makeError(code, message, details);
  }

  return json.data;
}

export const api = {
  request,

  // --- system ---
  ping: () => request("ping", {}, { withToken: false }),

  // --- auth ---
  login: (email, password) => request("auth.login", { email, password }, { withToken: false }),
  register: (payload) => request("auth.register", payload, { withToken: false }),
  me: () => request("auth.me", {}),
  logout: () => request("auth.logout", {}),
  whoami: () => request("debug.whoami", {}),

  // --- content ---
  newsList: () => request("news.list", {}, { withToken: false }),
  newsGet: (newsId) => request("news.get", { newsId }, { withToken: false }),
  knowledgeList: () => request("knowledge.list", {}, { withToken: false }),
  knowledgeGet: (kbId) => request("knowledge.get", { kbId }, { withToken: false }),

  // --- quiz ---
  quizQuestionsList: (category = "") => request("quiz.questions.list", { category }, { withToken: false }),
  quizSubmit: (payload) => request("quiz.submit", payload),
  quizMyResults: () => request("quiz.results.my", {}),

  // --- notifications (user) ---
  userNotificationsList: (limit = 50) => request("user.notifications.list", { limit }),
  userNotificationsMarkRead: (notificationId) => request("user.notifications.markRead", { notificationId }),
  userNotificationsUnreadCount: () => request("user.notifications.unreadCount", {}),

  // --- Preventive (Sprint 1) ---
  preventiveList: () => request("preventive.list", {}),
  preventiveMarkDone: (userItemId) => request("preventive.markDone", { userItemId }),
  preventiveMarkSkipped: (userItemId, reason = "") => request("preventive.markSkipped", { userItemId, reason }),
  preventiveSetReminderTime: (userItemId, remindTime) => request("preventive.setReminderTime", { userItemId, remindTime }),

  // =========================================================
  // ✅ Smart Family Planning – Sprint 2
  // =========================================================
  fpCyclesList: () => request("fp.cycles.list", {}),
  fpCyclesCreate: (payload) => request("fp.cycles.create", payload),
  fpCyclesUpdate: (payload) => request("fp.cycles.update", payload),
  fpCyclesDelete: (cycleId) => request("fp.cycles.delete", { cycleId }),

  fpDailyListRange: ({ dateFrom, dateTo }) => request("fp.daily.listRange", { dateFrom, dateTo }),
  fpDailyUpsert: (payload) => request("fp.daily.upsert", payload),

  fpPredictRecompute: (payload = {}) => request("fp.predict.recompute", payload),
  fpPredLatest: () => request("fp.pred.latest", {}),

  // =========================================================
  // ✅ Pregnancy
  // =========================================================
  // Profile
  pregProfileGet: () => request("preg.profile.get", {}),
  pregProfileUpsert: (payload) => request("preg.profile.upsert", payload),

  // Appointments (ANC)
  pregAncList: (payload = {}) => request("preg.anc.list", payload),
  pregAncUpsert: (payload) => request("preg.anc.upsert", payload),
  pregAncDelete: (ancId) => request("preg.anc.delete", { ancId }),

  // Backward/alternate names used by some pages
  pregApptList: (payload = {}) => request("preg.anc.list", payload),
  pregApptUpsert: (payload) => request("preg.anc.upsert", payload),
  pregApptDelete: (ancId) => request("preg.anc.delete", { ancId }),

  // Kicks
  pregKicksList: (payload = {}) => request("preg.kicks.list", payload),
  pregKicksUpsert: (payload) => request("preg.kicks.upsert", payload),
  pregKicksDelete: (kickId) => request("preg.kicks.delete", { kickId }),

  // Alternate short names
  pregKickList: (payload = {}) => request("preg.kicks.list", payload),
  pregKickUpsert: (payload) => request("preg.kicks.upsert", payload),
  pregKickDelete: (kickId) => request("preg.kicks.delete", { kickId }),

  // Vitals (weight / BP / edema)
  pregVitalsList: (payload = {}) => request("preg.vitals.list", payload),
  pregVitalsUpsert: (payload) => request("preg.vitals.upsert", payload),
  pregVitalsDelete: (vitalId) => request("preg.vitals.delete", { vitalId }),

  pregSummaryToday: (payload = {}) => request("preg.summary.today", payload),

};

// expose for console debugging
if (typeof window !== "undefined") {
  window.api = api;
}