/* ═══════════════════════════════════════════════════════════
   PERIODIC TABLE HUB — theme.js
   Dark / light mode toggle, persisted to localStorage.
═══════════════════════════════════════════════════════════ */

'use strict';

import { $ } from './utils.js';

export const ThemeModule = (() => {
  const STORAGE_KEY = 'pth-theme';
  const html = document.documentElement;
  const btn  = $('#theme-toggle');

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) {}
  }

  function toggle() {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  function init() {
    let saved = 'dark';
    try { saved = localStorage.getItem(STORAGE_KEY) || 'dark'; } catch (_) {}
    applyTheme(saved);
    btn.addEventListener('click', toggle);
  }

  return { init };
})();
