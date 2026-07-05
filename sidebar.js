/* ═══════════════════════════════════════════════════════════
   PERIODIC TABLE HUB — sidebar.js
   Element detail sidebar: hero, properties, electron config,
   Bohr model, uses/discovery/facts/isotopes/safety, compare CTA.
   Also owns the Bohr-model SVG renderer and the tab switcher,
   since both exist solely to serve this panel.
═══════════════════════════════════════════════════════════ */

'use strict';

import { $, $$, fmt, toSuperscript, showToast } from './utils.js';
import { CATEGORY_META, SHELLS_DATA } from './dataLoader.js';
import { GridModule } from './grid.js';

/* ──────────────────────────────────────────────────────────
   BOHR MODEL RENDERER
────────────────────────────────────────────────────────── */

const BohrModule = (() => {
  const SVG_NS  = 'http://www.w3.org/2000/svg';
  const CX = 140, CY = 140;
  const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

  function makeSVGEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    return el;
  }

  function render(atomicNumber, svgEl, legendEl) {
    svgEl.innerHTML = '';
    legendEl.innerHTML = '';

    const shells = SHELLS_DATA[atomicNumber];
    if (!shells) {
      svgEl.innerHTML = `<text x="140" y="145" text-anchor="middle" font-size="13" fill="var(--text-tertiary)">No shell data available</text>`;
      return;
    }

    const maxShells    = shells.length;
    const maxRadius    = 120;
    const minRadius    = 22;
    const shellStep    = maxShells > 1 ? (maxRadius - minRadius) / (maxShells - 1) : 0;

    // Draw shells (rings)
    shells.forEach((count, i) => {
      const r = maxShells === 1 ? (minRadius + maxRadius) / 2 : minRadius + i * shellStep;

      // Ring
      const ring = makeSVGEl('circle', {
        cx: CX, cy: CY, r,
        fill: 'none',
        stroke: 'var(--border)',
        'stroke-width': '1.2',
        'stroke-dasharray': '4 3',
        opacity: '.7',
      });
      svgEl.appendChild(ring);

      // Shell label
      const labelX = CX + r * Math.cos(-0.25) + 4;
      const labelY = CY + r * Math.sin(-0.25) - 4;
      const label = makeSVGEl('text', {
        x: labelX, y: labelY,
        'font-size': '9',
        fill: 'var(--text-tertiary)',
        'font-family': 'Space Mono, monospace',
      });
      label.textContent = SHELL_NAMES[i];
      svgEl.appendChild(label);

      // Electrons
      for (let e = 0; e < count; e++) {
        const angle  = (2 * Math.PI / count) * e - Math.PI / 2;
        const ex     = CX + r * Math.cos(angle);
        const ey     = CY + r * Math.sin(angle);
        const speed  = 4 + i * 2.5;
        const delay  = -(speed / count) * e;

        // Electron group (animated)
        const g = makeSVGEl('g', {});
        svgEl.appendChild(g);

        // Orbit animation using animateTransform
        const animate = makeSVGEl('animateTransform', {
          attributeName: 'transform',
          type:          'rotate',
          from:          `0 ${CX} ${CY}`,
          to:            `360 ${CX} ${CY}`,
          dur:           `${speed}s`,
          begin:         `${delay}s`,
          repeatCount:   'indefinite',
        });

        // Electron dot
        const dot = makeSVGEl('circle', {
          cx: ex, cy: ey, r: '4',
          fill: 'var(--accent)',
          opacity: '.92',
        });

        // Glow
        const glow = makeSVGEl('circle', {
          cx: ex, cy: ey, r: '7',
          fill: 'var(--accent)',
          opacity: '.18',
        });

        g.appendChild(glow);
        g.appendChild(dot);
        g.appendChild(animate);
      }

      // Legend item
      const chip = document.createElement('div');
      chip.className = 'bohr-legend-item';
      chip.textContent = `${SHELL_NAMES[i]}: ${count}e⁻`;
      legendEl.appendChild(chip);
    });

    // Nucleus
    const nucleusGlow = makeSVGEl('circle', {
      cx: CX, cy: CY, r: '14',
      fill: 'var(--accent)',
      opacity: '.15',
    });
    const nucleusCore = makeSVGEl('circle', {
      cx: CX, cy: CY, r: '9',
      fill: 'var(--accent)',
      opacity: '.9',
    });
    const nucleusLabel = makeSVGEl('text', {
      x: CX, y: CY + 1,
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      'font-size': '7',
      'font-family': 'Space Mono, monospace',
      fill: 'var(--bg-base)',
      'font-weight': '700',
    });
    nucleusLabel.textContent = atomicNumber;

    svgEl.appendChild(nucleusGlow);
    svgEl.appendChild(nucleusCore);
    svgEl.appendChild(nucleusLabel);
  }

  return { render };
})();

/* ──────────────────────────────────────────────────────────
   TABS MODULE (sidebar detail tabs)
────────────────────────────────────────────────────────── */

export const TabsModule = (() => {
  const tabBar    = $('.tab-bar');
  const panels    = $$('.tab-panel');

  function activateTab(tabName) {
    const tabs = $$('.tab', tabBar);
    tabs.forEach(t => {
      const active = t.dataset.tab === tabName;
      t.classList.toggle('active', active);
      t.setAttribute('aria-selected', String(active));
    });
    panels.forEach(p => {
      const active = p.id === `tab-${tabName}`;
      p.classList.toggle('active', active);
      active ? p.removeAttribute('hidden') : p.setAttribute('hidden', '');
    });
  }

  function init() {
    tabBar.addEventListener('click', e => {
      const tab = e.target.closest('.tab');
      if (!tab) return;
      activateTab(tab.dataset.tab);
    });

    // Keyboard navigation for tabs
    tabBar.addEventListener('keydown', e => {
      const tabs = $$('.tab', tabBar);
      const curr = tabs.findIndex(t => t === document.activeElement);
      if (curr === -1) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); tabs[(curr + 1) % tabs.length].focus(); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); tabs[(curr - 1 + tabs.length) % tabs.length].focus(); }
    });
  }

  return { init, activateTab };
})();

/* ──────────────────────────────────────────────────────────
   SIDEBAR MODULE
────────────────────────────────────────────────────────── */

export const SidebarModule = (() => {
  const sidebar      = $('#sidebar');
  const overlay      = $('#sidebar-overlay');
  const openBtn      = $('#sidebar-toggle');
  const closeBtn     = $('#sidebar-close');
  const emptyState   = $('#sidebar-empty');
  const detailPanel  = $('#sidebar-detail');
  let compareSlots   = [];
  let activeElement  = null;

  /* ── Open/close (mobile) */
  function openPanel() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closePanel() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ── Show element */
  function openElement(el) {
    activeElement = el;
    emptyState.setAttribute('hidden', '');
    detailPanel.removeAttribute('hidden');
    populateHero(el);
    populateProperties(el);
    populateConfig(el);
    populateBohr(el);
    populateUses(el);
    TabsModule.activateTab('properties');  // reset to first tab
    GridModule.setActive(el.atomicNumber);

    if (window.innerWidth <= 900) openPanel();
    else sidebar.scrollTop = 0;
  }

  /* ── Hero */
  function populateHero(el) {
    const cat = CATEGORY_META[el.categorySlug] || CATEGORY_META.unknown;

    $('#el-number').textContent = `#${el.atomicNumber}`;
    $('#el-symbol').textContent = el.symbol;
    $('#el-mass').textContent   = el.atomicMass?.value != null ? el.atomicMass.value.toFixed(3) : '—';
    $('#el-name').textContent   = el.name;

    const catBadge = $('#el-category-badge');
    catBadge.textContent  = cat.label;
    catBadge.className    = `el-category-badge cat-${el.categorySlug}`;

    const blockBadge = $('#el-block-badge');
    blockBadge.textContent = `${el.block.toUpperCase()}-block`;
  }

  /* ── Properties (grouped into sections) */
  function propRow(label, value) {
    return `
      <div class="prop-item">
        <dt class="prop-label">${label}</dt>
        <dd class="prop-value">${value}</dd>
      </div>`;
  }

  function sectionLabel(title) {
    return `<div class="prop-section-label">${title}</div>`;
  }

  function joinList(arr, transform = String) {
    if (!arr || !arr.length) return '—';
    return arr.map(transform).join(', ');
  }

  function formatOxidation(n) {
    return n > 0 ? `+${n}` : String(n);
  }

  function populateProperties(el) {
    const mass   = el.atomicMass?.value != null ? `${el.atomicMass.value} ${el.atomicMass.unit || 'u'}` : '—';
    const en     = el.electronegativity?.pauling != null ? `${el.electronegativity.pauling} (${el.electronegativity.scale || 'Pauling'})` : '—';
    const mp     = el.meltingPoint?.value != null ? `${el.meltingPoint.value} ${el.meltingPoint.unit || 'K'}` : '—';
    const bp     = el.boilingPoint?.value != null ? `${el.boilingPoint.value} ${el.boilingPoint.unit || 'K'}` : '—';
    const dens   = el.density?.value != null ? `${el.density.value} ${el.density.unit || 'g/cm³'}` : '—';
    const ea     = el.electronAffinity != null ? `${el.electronAffinity} kJ/mol` : '—';

    const ie = el.ionizationEnergy || {};
    const ieParts = ['first', 'second', 'third']
      .filter(k => ie[k] != null)
      .map((k, i) => `${['1st','2nd','3rd'][i]}: ${ie[k]} ${ie.unit || 'kJ/mol'}`);
    const ieStr = ieParts.length ? ieParts.join(' · ') : '—';

    const radii = el.atomicRadius || {};
    const radiusParts = [];
    if (radii.covalent != null)    radiusParts.push(`Covalent ${radii.covalent} ${radii.unit || 'pm'}`);
    if (radii.vanDerWaals != null) radiusParts.push(`van der Waals ${radii.vanDerWaals} ${radii.unit || 'pm'}`);
    const radiusStr = radiusParts.length ? radiusParts.join(' · ') : '—';

    const phys = el.physicalProperties || {};

    const html = [
      sectionLabel('Overview'),
      propRow('Atomic Number', el.atomicNumber),
      propRow('Atomic Mass', mass),
      propRow('Period', el.period),
      propRow('Group', el.group ?? '—'),
      propRow('Block', `${el.block.toUpperCase()}-block`),

      sectionLabel('Electronic'),
      propRow('Valence Electrons', fmt(el.valenceElectrons)),
      propRow('Valency', joinList(el.valency)),
      propRow('Oxidation States', joinList(el.oxidationStates, formatOxidation)),
      propRow('Electronegativity', en),
      propRow('Electron Affinity', ea),
      propRow('Ionization Energy', ieStr),

      sectionLabel('Physical'),
      propRow('State at STP', phys.stateAtSTP || '—'),
      propRow('Color', phys.color || '—'),
      propRow('Melting Point', mp),
      propRow('Boiling Point', bp),
      propRow('Density', dens),
      propRow('Crystal Structure', phys.crystalStructure || '—'),
      propRow('Magnetic Ordering', phys.magneticOrdering || '—'),

      sectionLabel('Atomic Radius'),
      propRow('Radius', radiusStr),
    ].join('');

    $('#prop-list').innerHTML = html;
  }

  /* ── Electron Config */
  function populateConfig(el) {
    $('#config-string').textContent = el.nobleGasConfiguration || el.electronConfiguration?.full || '—';

    const orbitals = el.electronConfiguration?.orbitals || [];
    $('#subshell-grid').innerHTML = orbitals.map(o =>
      `<span class="subshell-chip">${o.subshell}${toSuperscript(o.electrons)}</span>`
    ).join('');
  }

  /* ── Bohr model */
  function populateBohr(el) {
    const svgEl    = $('#bohr-svg');
    const legendEl = $('#bohr-legend');
    BohrModule.render(el.atomicNumber, svgEl, legendEl);
  }

  /* ── Uses, discovery, facts, isotopes & safety */
  function populateUses(el) {
    const usesList = $('#uses-list');
    const uses = el.uses || [];
    usesList.innerHTML = uses.map(u => `
      <li class="use-item">
        <span class="use-tag">${u.category || 'General'}</span>
        <span class="use-desc">${u.description}</span>
      </li>`).join('');

    const disc = el.discovery || {};
    const discBlock = `
      <dl>
        ${propRow('Discoverer', disc.discoverer || '—')}
        ${propRow('Year', disc.year ?? 'Antiquity')}
        ${propRow('Location', disc.location || '—')}
        ${disc.method ? propRow('Method', disc.method) : ''}
        ${disc.historicalName ? propRow('Historical Name', disc.historicalName) : ''}
      </dl>`;

    const facts = el.interestingFacts || [];
    const factsBlock = facts.length ? `
      <div class="prop-section-label">Interesting Facts</div>
      <ul class="facts-list">${facts.map(f => `<li>${f}</li>`).join('')}</ul>` : '';

    const isotopes = el.isotopes || [];
    const isotopeRows = isotopes.map(iso => {
      const stability = iso.stable
        ? '<span class="isotope-stable">Stable</span>'
        : '<span class="isotope-unstable">Radioactive</span>';
      const halfLife = iso.halfLife ? ` · t½ ${iso.halfLife}` : '';
      const abundance = iso.abundance != null ? `${iso.abundance}% abundance` : 'trace';
      return `
        <div class="isotope-row">
          <span class="isotope-name">${el.symbol}-${iso.massNumber}</span>
          <span class="isotope-meta">${stability} · ${abundance}${halfLife}</span>
        </div>`;
    }).join('');
    const isotopeBlock = isotopes.length ? `
      <div class="prop-section-label">Isotopes</div>
      <div class="isotope-list">${isotopeRows}</div>` : '';

    const safety = el.safety || {};
    const safetyBlock = safety.hazardClass ? `
      <div class="prop-section-label">Safety</div>
      <div class="safety-block">
        <dl>
          ${propRow('Hazard Class', safety.hazardClass)}
          ${safety.reactivity ? propRow('Reactivity', safety.reactivity) : ''}
          ${safety.storage ? propRow('Storage', safety.storage) : ''}
        </dl>
      </div>` : '';

    const description = el.shortDescription
      ? `<p class="el-description">${el.shortDescription}</p>` : '';

    const disc2 = document.getElementById('discovery-block');
    disc2.innerHTML = `
      ${description}
      <div class="prop-section-label">Discovery</div>
      ${discBlock}
      ${factsBlock}
      ${isotopeBlock}
      ${safetyBlock}
    `;
  }

  /* ── Compare button */
  function initCompare() {
    $('#btn-compare').addEventListener('click', () => {
      if (!activeElement) return;
      if (compareSlots.includes(activeElement.atomicNumber)) {
        showToast(`${activeElement.name} is already in comparison.`);
        return;
      }
      if (compareSlots.length >= 2) {
        compareSlots.shift();
      }
      compareSlots.push(activeElement.atomicNumber);
      showToast(`${activeElement.name} added to compare. (${compareSlots.length}/2)`);
    });
  }

  function init() {
    openBtn.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', closePanel);
    overlay.addEventListener('click', closePanel);

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) closePanel();
    });

    initCompare();
  }

  return { init, openElement };
})();
