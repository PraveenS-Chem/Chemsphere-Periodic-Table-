/* ═══════════════════════════════════════════════════════════
   PERIODIC TABLE HUB — grid.js
   Renders the real 118-element periodic table (main block +
   lanthanide/actinide rows), handles cell clicks and the
   category dim/filter state.
═══════════════════════════════════════════════════════════ */

'use strict';

import { $, $$ } from './utils.js';
import { ELEMENTS, ELEMENTS_BY_NUMBER, CATEGORY_META } from './dataLoader.js';
import { SidebarModule } from './sidebar.js';

export const GridModule = (() => {
  const grid = $('#periodic-grid');
  let activeFilter = null; // categorySlug or null

  function cellHTML(el) {
    const color = (CATEGORY_META[el.categorySlug] || CATEGORY_META.unknown).color;
    return `
      <button class="pt-cell" type="button"
        style="--cat-color:${color}; grid-row:${el.period}; grid-column:${el.group};"
        data-number="${el.atomicNumber}" data-category="${el.categorySlug}"
        aria-label="${el.name}, atomic number ${el.atomicNumber}">
        <span class="pt-num">${el.atomicNumber}</span>
        <span class="pt-symbol">${el.symbol}</span>
        <span class="pt-name">${el.name}</span>
      </button>`;
  }

  function spacerHTML(period, group) {
    return `<div class="pt-spacer" style="grid-row:${period}; grid-column:${group};"></div>`;
  }

  function fBlockMarkerHTML(period, label) {
    return `<div class="pt-fblock-marker" style="grid-row:${period}; grid-column:3;">${label}</div>`;
  }

  function render() {
    if (!ELEMENTS.length) return;

    const mainElements = ELEMENTS.filter(el => el.categorySlug !== 'lanthanide' && el.categorySlug !== 'actinide');
    const lanthanides   = ELEMENTS.filter(el => el.categorySlug === 'lanthanide').sort((a,b) => a.atomicNumber - b.atomicNumber);
    const actinides     = ELEMENTS.filter(el => el.categorySlug === 'actinide').sort((a,b) => a.atomicNumber - b.atomicNumber);

    const byPeriodGroup = {};
    mainElements.forEach(el => { byPeriodGroup[`${el.period}-${el.group}`] = el; });

    let html = '';

    // Main table: periods 1-7, groups 1-18
    for (let period = 1; period <= 7; period++) {
      for (let group = 1; group <= 18; group++) {
        const el = byPeriodGroup[`${period}-${group}`];
        if (el) {
          html += cellHTML(el);
        } else if (group === 3 && period === 6) {
          html += fBlockMarkerHTML(period, '57–71');
        } else if (group === 3 && period === 7) {
          html += fBlockMarkerHTML(period, '89–103');
        } else {
          html += spacerHTML(period, group);
        }
      }
    }

    // Gap row (visual separation)
    html += `<div class="pt-row-gap" style="grid-row:8;"></div>`;

    // Lanthanide row (visual row 9), columns 3-17
    html += `<div class="pt-label-cell" style="grid-row:9; grid-column:1 / span 2;">57–71</div>`;
    lanthanides.forEach((el, i) => {
      html += `
        <button class="pt-cell" type="button"
          style="--cat-color:${(CATEGORY_META.lanthanide).color}; grid-row:9; grid-column:${3 + i};"
          data-number="${el.atomicNumber}" data-category="${el.categorySlug}"
          aria-label="${el.name}, atomic number ${el.atomicNumber}">
          <span class="pt-num">${el.atomicNumber}</span>
          <span class="pt-symbol">${el.symbol}</span>
          <span class="pt-name">${el.name}</span>
        </button>`;
    });

    // Actinide row (visual row 10), columns 3-17
    html += `<div class="pt-label-cell" style="grid-row:10; grid-column:1 / span 2;">89–103</div>`;
    actinides.forEach((el, i) => {
      html += `
        <button class="pt-cell" type="button"
          style="--cat-color:${(CATEGORY_META.actinide).color}; grid-row:10; grid-column:${3 + i};"
          data-number="${el.atomicNumber}" data-category="${el.categorySlug}"
          aria-label="${el.name}, atomic number ${el.atomicNumber}">
          <span class="pt-num">${el.atomicNumber}</span>
          <span class="pt-symbol">${el.symbol}</span>
          <span class="pt-name">${el.name}</span>
        </button>`;
    });

    grid.innerHTML = html;
    grid.classList.remove('loading');

    grid.addEventListener('click', e => {
      const cell = e.target.closest('.pt-cell');
      if (!cell) return;
      const el = ELEMENTS_BY_NUMBER[+cell.dataset.number];
      if (el) SidebarModule.openElement(el);
    });
  }

  function setActive(atomicNumber) {
    $$('.pt-cell', grid).forEach(c => {
      c.classList.toggle('is-active', +c.dataset.number === atomicNumber);
    });
  }

  function setFilter(categorySlugValue) {
    activeFilter = activeFilter === categorySlugValue ? null : categorySlugValue;
    $$('.pt-cell', grid).forEach(c => {
      c.classList.toggle('dimmed', !!activeFilter && c.dataset.category !== activeFilter);
    });
    return activeFilter;
  }

  function init() {
    render();
  }

  return { init, setActive, setFilter };
})();
