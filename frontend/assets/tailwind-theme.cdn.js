// FEMI Tailwind Theme (Play CDN)
// This file is safe to load BEFORE or AFTER https://cdn.tailwindcss.com
(function () {
  window.tailwind = window.tailwind || {};
  window.tailwind.config = {
    theme: {
      extend: {
        fontFamily: {
          sans: ['Prompt', 'Inter', 'system-ui', 'sans-serif']
        },
        colors: {
          brand: {
            50: '#fff1f5',
            100: '#ffe4ec',
            200: '#fecddc',
            300: '#fda4c4',
            400: '#fb7185',
            500: '#f43f5e',
            600: '#e11d48',
            700: '#be123c',
            800: '#9f1239',
            900: '#881337'
          },
          accent: {
            50: '#ecfeff',
            100: '#cffafe',
            200: '#a5f3fc',
            300: '#67e8f9',
            400: '#22d3ee',
            500: '#06b6d4',
            600: '#0891b2',
            700: '#0e7490',
            800: '#155e75',
            900: '#164e63'
          }
        },
        boxShadow: {
          soft: '0 10px 30px rgba(2,6,23,0.08)',
          card: '0 12px 40px rgba(2,6,23,0.10)'
        },
        borderRadius: {
          '2xl': '1.25rem'
        }
      }
    }
  };
})();
