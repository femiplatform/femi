// FEMI Auth + Sessions

function femiSessionCreate_(user, meta) {
  var session = {
    sessionId: femiId_("SES"),
    userId: user.userId,
    token: femiId_("TOK") + "_" + Math.random().toString(36).slice(2,10),
    role: user.role || "user",
    expiresAt: new Date(Date.now() + FEMI_DEFAULTS.sessionHours * 3600 * 1000).toISOString(),
    createdAt: femiNowIso_(),
    ip: (meta && meta.ip) ? meta.ip : "",
    userAgent: (meta && meta.userAgent) ? meta.userAgent : ""
  };
  femiAppend_(FEMI_SHEETS.sessions, FEMI_HEADERS.sessions, session);
  return session;
}

function femiSessionGet_(token) {
  token = femiTrim_(token);
  if (!token) return null;
  var all = femiReadAll_(FEMI_SHEETS.sessions, FEMI_HEADERS.sessions);
  for (var i=0; i<all.length; i++) {
    if (String(all[i].token) === token) return all[i];
  }
  return null;
}

function femiSessionRequire_(token) {
  var ses = femiSessionGet_(token);
  femiRequire_(ses, "AUTH_REQUIRED", "Token not found");
  // check expiry
  if (ses.expiresAt) {
    var exp = new Date(ses.expiresAt).getTime();
    if (Date.now() > exp) {
      // delete expired session
      femiDeleteById_(FEMI_SHEETS.sessions, FEMI_HEADERS.sessions, "sessionId", ses.sessionId);
      throw femiJsonErr_("AUTH_EXPIRED", "Session expired");
    }
  }
  return ses;
}

function femiRequireAdmin_(session) {
  femiRequire_(session && String(session.role) === "admin", "FORBIDDEN", "Admin only");
}

function femiUserPublic_(user) {
  if (!user) return null;
  var u = {};
  for (var k in user) {
    if (!user.hasOwnProperty(k)) continue;
    if (k === "password") continue;
    u[k] = user[k];
  }
  return u;
}
