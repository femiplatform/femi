// femi/frontend/js/auth.js
const KEY = "femi.session";

export function setSession(session) {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function getSession() {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function clearSession() {
  localStorage.removeItem(KEY);
}

export function getToken() {
  const s = getSession();
  return s?.token || null;
}

export function getRole() {
  const s = getSession();
  return s?.role || "guest";
}

export function requireAuth(redirect = "/login.html") {
  if (!getToken()) window.location.href = redirect;
}

export function requireAdmin(redirect = "/login.html") {
  const role = getRole();
  if (!getToken() || role !== "admin") window.location.href = redirect;
}

export async function logout(redirect = "/login.html") {
  clearSession();
  window.location.href = redirect;
}
