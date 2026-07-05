/* ═══════════════════════════════════════════════════════════
   PERIODIC TABLE HUB — legend.js
   Renders the category legend and toggles the grid's active
   category filter when a legend chip is clicked.
═══════════════════════════════════════════════════════════ */

'use strict';

import { $, $$, showToast } from './utils.js';
import { CATEGORY_META } from './dataLoader.js';
import { GridModule } from './grid.js';

export const LegendModule = (() => {
  function init() {
    const grid = $('#legend-grid');
    grid.innerHTML = Object.entries(CATEGORY_META).map(([key, { label, color }]) => `
      <button class="legend-item" data-category="${key}" aria-label="Filter by ${label}">
        <span class="legend-dot" style="background:${color}"></span>
        ${label}
      </button>`).join('');

    grid.addEventListener('click', e => {
      const item = e.target.closest('.legend-item');
      if (!item) return;
      const active = GridModule.setFilter(item.dataset.category);
      $$('.legend-item', grid).forEach(b => b.classList.toggle('active', b.dataset.category === active));
      showToast(active ? `Filtering: ${item.querySelector('.legend-dot').nextSibling.textContent.trim()}` : 'Filter cleared');
    });
  }

  return { init };
})();
