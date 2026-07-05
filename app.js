/* ═══════════════════════════════════════════════════════════
   PERIODIC TABLE HUB — app.js
   Application entry point. Wires up every module and drives
   the bootstrap sequence.
   Architecture: Data-driven · No hardcoded element pages
   Modules: Theme · Search · Sidebar · Tabs · Bohr · Concepts · Legend · Grid
═══════════════════════════════════════════════════════════ */

'use strict';

import { $ } from './utils.js';
import { loadElements, ELEMENTS } from './dataLoader.js';
import { ThemeModule } from './theme.js';
import { TabsModule, SidebarModule } from './sidebar.js';
import { SearchModule } from './search.js';
import { GridModule } from './grid.js';
import { LegendModule } from './legend.js';
import { ConceptsModule } from './concepts.js';

/* ──────────────────────────────────────────────────────────
   HEADER SCROLL SHADOW
────────────────────────────────────────────────────────── */

function initScrollShadow() {
  const header = $('#site-header');
  const obs = new IntersectionObserver(
    ([e]) => header.classList.toggle('scrolled', !e.isIntersecting),
    { rootMargin: '-1px 0px 0px 0px', threshold: [1] }
  );
  // Sentinel element
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;height:1px;width:100%;pointer-events:none';
  document.body.prepend(sentinel);
  obs.observe(sentinel);
}

/* ──────────────────────────────────────────────────────────
   DEMO: AUTO-OPEN A SAMPLE ELEMENT
────────────────────────────────────────────────────────── */

function initDemo() {
  // After a short delay, show a sample element to demonstrate the sidebar
  // Remove this in production once the real table is wired up
  const demoEl = ELEMENTS.find(e => e.atomicNumber === 6); // Carbon
  if (demoEl && window.innerWidth > 900) {
    setTimeout(() => SidebarModule.openElement(demoEl), 600);
  }
}

/* ──────────────────────────────────────────────────────────
   INIT
────────────────────────────────────────────────────────── */

document.addEventListener('DOMContentLoaded', async () => {
  ThemeModule.init();
  TabsModule.init();
  SidebarModule.init();
  ConceptsModule.init();
  initScrollShadow();

  $('#periodic-grid').classList.add('loading');

  try {
    await loadElements();
    SearchModule.init();
    LegendModule.init();
    GridModule.init();
    initDemo();
  } catch (err) {
    console.error('Failed to load element data:', err);
    $('#periodic-loading').textContent =
      'Could not load elements.json. If you opened this file directly, serve it via a local web server (e.g. `python -m http.server`) instead of file://.';
    $('#periodic-loading').style.display = 'block';
  }

  console.log(
    '%c⚛ Periodic Table Hub %c v1.1 ',
    'background:#4f6ef7;color:#fff;padding:4px 8px;border-radius:4px 0 0 4px;font-weight:700',
    'background:#1a1e2c;color:#6b84ff;padding:4px 8px;border-radius:0 4px 4px 0',
  );
});
