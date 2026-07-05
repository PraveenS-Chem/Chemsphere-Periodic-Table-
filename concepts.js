/* ═══════════════════════════════════════════════════════════
   PERIODIC TABLE HUB — concepts.js
   Renders the "Concept Library" card strip and its click /
   keyboard interactions.
═══════════════════════════════════════════════════════════ */

'use strict';

import { $, showToast } from './utils.js';
import { CONCEPTS } from './dataLoader.js';

export const ConceptsModule = (() => {
  function init() {
    const container = $('#concept-cards');
    container.innerHTML = CONCEPTS.map((c, i) => `
      <article class="concept-card" data-id="${c.id}" tabindex="0" role="button" aria-label="Learn about ${c.title}">
        <div class="cc-index">CONCEPT ${String(i + 1).padStart(2, '0')}</div>
        <div class="cc-title">${c.title}</div>
        <div class="cc-summary">${c.summary}</div>
      </article>`).join('');

    container.addEventListener('click', e => {
      const card = e.target.closest('.concept-card');
      if (!card) return;
      const concept = CONCEPTS.find(c => c.id === card.dataset.id);
      if (concept) showToast(`"${concept.title}" — Concept detail page coming soon.`);
    });

    container.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('concept-card')) {
        e.preventDefault();
        e.target.click();
      }
    });
  }

  return { init };
})();
