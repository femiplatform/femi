export const FEMI = {
  // When deployed with Cloudflare Pages Functions, keep API base as same-origin:
  // /api  -> functions/api.js -> Google Apps Script
  API_BASE: (window.FEMI_CONFIG && window.FEMI_CONFIG.API_BASE) || "/api",
  APP_NAME: (window.FEMI_CONFIG && window.FEMI_CONFIG.APP_NAME) || "FEMI"
};
