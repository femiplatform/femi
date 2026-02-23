// femi/frontend/js/icons.js
export const Icons = {
  home: () => svg(`<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>`),
  tools: () => svg(`<path d="M10 3H4a1 1 0 0 0-1 1v6m7-7h10a1 1 0 0 1 1 1v6m-11 0H3m8 0h10M10 10v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6m8 6h10a1 1 0 0 0 1-1v-6"/>`),
  dashboard: () => svg(`<path d="M4 19V5m0 14h16"/><path d="M8 17v-6"/><path d="M12 17V7"/><path d="M16 17v-3"/>`),
  user: () => svg(`<path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="7" r="4"/>`),

  bell: () => svg(`<path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7"/><path d="M10 19a2 2 0 0 0 4 0"/>`),
  menu: () => svg(`<path d="M4 6h16M4 12h16M4 18h16"/>`),
  close: () => svg(`<path d="M18 6 6 18M6 6l12 12"/>`),

  // feature tiles
  heartShield: () => svg(`<path d="M12 21s-7-4.5-9-10a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 5.5-9 10-9 10z"/>`),
  calendar: () => svg(`<path d="M8 3v3M16 3v3"/><path d="M4 8h16"/><rect x="4" y="6" width="16" height="16" rx="2"/>`),
  book: () => svg(`<path d="M4 19a2 2 0 0 0 2 2h12"/><path d="M6 3h12v16H6a2 2 0 0 0-2 2V5a2 2 0 0 1 2-2z"/>`),
  quiz: () => svg(`<path d="M4 4h16v12H7l-3 3z"/><path d="M8 8h8"/><path d="M8 12h5"/>`),
  noti: () => svg(`<path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 7H3s3 0 3-7"/><path d="M10 19a2 2 0 0 0 4 0"/>`)
};

function svg(paths){
  return `
  <svg class="svg-ic" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
       aria-hidden="true">
    ${paths}
  </svg>`;
}