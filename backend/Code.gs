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
