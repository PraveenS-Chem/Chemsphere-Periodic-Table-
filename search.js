/* ═══════════════════════════════════════════════════════════
   PERIODIC TABLE HUB — search.js
   Header search box: live filtering, keyboard navigation,
   and the '/' focus shortcut.
═══════════════════════════════════════════════════════════ */

'use strict';

import { $, $$, debounce, escHtml } from './utils.js';
import { ELEMENTS, CATEGORY_META } from './dataLoader.js';
import { SidebarModule } from './sidebar.js';

export const SearchModule = (() => {
  const input   = $('#search-input');
  const results = $('#search-results');
  let focusedIdx = -1;
  let currentItems = [];

  function matchElement(el, query) {
    const q = query.toLowerCase().trim();
    if (!q) return false;
    return (
      el.name.toLowerCase().includes(q) ||
      el.symbol.toLowerCase().includes(q) ||
      String(el.atomicNumber).startsWith(q)
    );
  }

  function getMatches(query) {
    return ELEMENTS.filter(el => matchElement(el, query)).slice(0, 8);
  }

  function highlight(text, query) {
    if (!query) return escHtml(text);
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return escHtml(text).replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  }

  function renderResults(query) {
    const matches = getMatches(query);
    focusedIdx = -1;

    if (!query.trim()) {
      closeResults();
      return;
    }

    results.removeAttribute('hidden');

    if (matches.length === 0) {
      results.innerHTML = `<div class="search-no-results">No elements match "<strong>${escHtml(query)}</strong>"</div>`;
      currentItems = [];
      return;
    }

    currentItems = matches;
    results.innerHTML = matches.map((el, i) => {
      const cat    = CATEGORY_META[el.categorySlug] || CATEGORY_META.unknown;
      const catCls = `cat-${el.categorySlug}`;
      return `
        <div class="search-result-item" role="option" data-idx="${i}" tabindex="-1">
          <span class="sri-symbol ${catCls}">${escHtml(el.symbol)}</span>
          <span class="sri-info">
            <span class="sri-name">${highlight(el.name, query)}</span>
            <span class="sri-meta">${cat.label}</span>
          </span>
          <span class="sri-number">#${el.atomicNumber}</span>
        </div>`;
    }).join('');

    // Click handlers
    $$('.search-result-item', results).forEach(item => {
      item.addEventListener('mousedown', e => {
        e.preventDefault();
        const idx = +item.dataset.idx;
        selectResult(currentItems[idx]);
      });
    });
  }

  function closeResults() {
    results.setAttribute('hidden', '');
    currentItems = [];
    focusedIdx = -1;
  }

  function selectResult(el) {
    input.value = '';
    closeResults();
    SidebarModule.openElement(el);
  }

  function moveFocus(dir) {
    const items = $$('.search-result-item', results);
    if (!items.length) return;
    items[focusedIdx]?.classList.remove('focused');
    focusedIdx = (focusedIdx + dir + items.length) % items.length;
    items[focusedIdx].classList.add('focused');
    items[focusedIdx].scrollIntoView({ block: 'nearest' });
  }

  function init() {
    input.addEventListener('input', debounce(e => renderResults(e.target.value)));

    input.addEventListener('keydown', e => {
      if (results.hasAttribute('hidden')) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(1); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); moveFocus(-1); }
      if (e.key === 'Enter' && focusedIdx >= 0) { selectResult(currentItems[focusedIdx]); }
      if (e.key === 'Escape') closeResults();
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.search-wrap')) closeResults();
    });

    // Keyboard shortcut: '/' focuses search
    document.addEventListener('keydown', e => {
      if (e.key === '/' && document.activeElement !== input && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) {
        e.preventDefault();
        input.focus();
      }
    });
  }

  return { init };
})();
