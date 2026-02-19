// FEMI Utils

function femiNowIso_() {
  return new Date().toISOString();
}

function femiId_(prefix) {
  var d = new Date();
  var pad = function(n){ return (n<10?'0':'')+n; };
  var ts = d.getFullYear() + pad(d.getMonth()+1) + pad(d.getDate()) + pad(d.getHours()) + pad(d.getMinutes()) + pad(d.getSeconds());
  var rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return prefix + "_" + ts + "_" + rand;
}

function femiHex_(bytes) {
  var out = [];
  for (var i=0; i<bytes.length; i++) {
    var b = (bytes[i] + 256) % 256;
    out.push(('0' + b.toString(16)).slice(-2));
  }
  return out.join('');
}

function femiHashPassword_(password, salt) {
  salt = salt || Math.random().toString(36).slice(2, 12);
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + password, Utilities.Charset.UTF_8);
  return salt + "$" + femiHex_(digest);
}

function femiVerifyPassword_(password, stored) {
  if (!stored) return false;
  var parts = String(stored).split("$");
  if (parts.length !== 2) return false;
  var salt = parts[0];
  return femiHashPassword_(password, salt) === stored;
}

function femiJsonOk_(data, message) {
  return { success: true, data: data || null, message: message || "OK" };
}

function femiJsonErr_(code, message, details) {
  return { success: false, error: { code: code || "ERROR", message: message || "Error", details: details || null } };
}

function femiParseRequest_(e) {
  try {
    if (e && e.postData && e.postData.contents) {
      return JSON.parse(e.postData.contents);
    }
  } catch (err) {}
  // fallback: form params
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
  var payloadStr = (e && e.parameter && e.parameter.payload) ? e.parameter.payload : "{}";
  var payload;
  try { payload = JSON.parse(payloadStr); } catch (err2) { payload = {}; }
  return { action: action, payload: payload };
}

function femiRespond_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function femiRequire_(cond, code, msg) {
  if (!cond) throw femiJsonErr_(code, msg);
}

function femiTrim_(v) { return (v === null || v === undefined) ? "" : String(v).trim(); }

function femiBoolStr_(v) {
  if (v === true || v === "TRUE" || v === "true" || v === 1 || v === "1") return "TRUE";
  return "FALSE";
}
