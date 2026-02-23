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

function femiEnv_(){
  return String(PropertiesService.getScriptProperties().getProperty("ENV") || "prod").toLowerCase();
}

function femiLog_(level, msg, data){
  var env = femiEnv_();
  var lv = String(level||"info").toLowerCase();
  if(env === "prod" && ["warn","error"].indexOf(lv) === -1) return;
  try {
    var line = "[FEMI][" + lv.toUpperCase() + "] " + String(msg||"");
    if (data !== undefined) line += " " + JSON.stringify(data);
    console.log(line);
  } catch (e) {
    console.log("[FEMI][" + lv.toUpperCase() + "] " + String(msg||""));
  }
}
