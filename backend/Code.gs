// FEMI Web App Entry

function doGet(e) {
  // Simple status endpoint via GET
  var resp = femiJsonOk_({ ok: true, time: femiNowIso_() });
  return femiRespond_(resp);
}

function doPost(e) {
  try {
    var req = femiParseRequest_(e);
    var action = req.action || "";
    var payload = req.payload || {};
    var meta = {
      ip: "",
      userAgent: ""
    };
    var result = femiHandle_(action, payload, meta);
    return femiRespond_(result);
  } catch (err) {
    // err may be femiJsonErr_ object
    if (err && err.success === false && err.error) return femiRespond_(err);
    return femiRespond_(femiJsonErr_("SERVER_ERROR", (err && err.message) ? err.message : String(err)));
  }
}
// ---------- Logging helpers (ENV=dev|prod) ----------
function femiEnv_() {
  try {
    var v = PropertiesService.getScriptProperties().getProperty("ENV");
    return (v || "prod").toLowerCase();
  } catch (e) {
    return "prod";
  }
}

function femiLog_(level, message, data) {
  level = String(level || "INFO").toUpperCase();
  var env = femiEnv_();
  var payload = {
    t: femiNowIso_ ? femiNowIso_() : new Date().toISOString(),
    level: level,
    msg: String(message || ""),
    data: (typeof data === "undefined") ? null : data
  };

  // In prod, keep logs minimal (WARN/ERROR). In dev, log everything.
  if (env === "prod" && level === "INFO") return;

  try {
    // console is more visible in Apps Script executions
    if (typeof console !== "undefined" && console.log) console.log(JSON.stringify(payload));
  } catch (e) {}
  try {
    Logger.log(JSON.stringify(payload));
  } catch (e2) {}
}

function femiInfo_(msg, data) { femiLog_("INFO", msg, data); }
function femiWarn_(msg, data) { femiLog_("WARN", msg, data); }
function femiError_(msg, data) { femiLog_("ERROR", msg, data); }
