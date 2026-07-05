/* ═══════════════════════════════════════════════════════════
   PERIODIC TABLE HUB — utils.js
   Generic, cross-cutting helpers with no DOM/data dependencies
   beyond basic document lookups.
═══════════════════════════════════════════════════════════ */

'use strict';

/* ── DOM shorthands ── */
export const $ = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ── Value formatting ── */
export function fmt(val, unit = '') {
  if (val === null || val === undefined) return '—';
  return `${val}${unit}`;
}

/* ── Debounce ── */
export function debounce(fn, delay = 220) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
}

/* ── Toast notifications ── */
export function showToast(msg, duration = 2400) {
  const toast = $('#toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── Superscript formatting (used for electron configuration) ── */
const SUPERSCRIPT_MAP = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹' };
export function toSuperscript(n) {
  return String(n).split('').map(ch => SUPERSCRIPT_MAP[ch] ?? ch).join('');
}

/* ── HTML escaping (used anywhere untrusted/data-driven text is injected) ── */
export function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
