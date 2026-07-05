/* ═══════════════════════════════════════════════════════════
   PERIODIC TABLE HUB — dataLoader.js
   Loads elements.json, normalizes it, and exposes the shared
   in-memory datasets that every other module reads from.
   Architecture: Data-driven · No hardcoded element pages
═══════════════════════════════════════════════════════════ */

'use strict';

/* ──────────────────────────────────────────────────────────
   Shared datasets (mutated in place so live bindings stay
   valid across every module that imports them)
────────────────────────────────────────────────────────── */

export const ELEMENTS = [];
export const SHELLS_DATA = {};
export const ELEMENTS_BY_NUMBER = {};

const SHELL_ORDER = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

const CATEGORY_SLUG_MAP = {
  'alkali metal':          'alkali-metal',
  'alkaline earth metal':  'alkaline-earth-metal',
  'transition metal':      'transition-metal',
  'post-transition metal': 'post-transition',
  'metalloid':             'metalloid',
  'nonmetal':              'nonmetal',
  'halogen':               'halogen',
  'noble gas':             'noble-gas',
  'lanthanide':            'lanthanide',
  'actinide':              'actinide',
};

function categorySlug(rawCategory) {
  return CATEGORY_SLUG_MAP[rawCategory] || 'unknown';
}

function normalizeElement(raw) {
  const shells = SHELL_ORDER
    .filter(s => raw.shellDistribution && raw.shellDistribution[s] != null)
    .map(s => raw.shellDistribution[s]);

  return {
    ...raw,
    categorySlug: categorySlug(raw.category),
    shells,
  };
}

/**
 * Fetches elements.json and populates ELEMENTS, SHELLS_DATA and
 * ELEMENTS_BY_NUMBER. Mutates the exported collections in place
 * (rather than reassigning them) so every module holding a
 * reference sees the loaded data.
 */
export async function loadElements() {
  const res = await fetch('elements.json');
  if (!res.ok) throw new Error(`Failed to load elements.json (${res.status})`);
  const raw = await res.json();
  const normalized = raw.map(normalizeElement);

  ELEMENTS.length = 0;
  ELEMENTS.push(...normalized);

  ELEMENTS.forEach(el => {
    SHELLS_DATA[el.atomicNumber] = el.shells;
    ELEMENTS_BY_NUMBER[el.atomicNumber] = el;
  });
}

/* ──────────────────────────────────────────────────────────
   Static reference data
────────────────────────────────────────────────────────── */

export const CONCEPTS = [
  { id: 'atom',           title: 'Atom',                    summary: 'The fundamental unit of matter, composed of protons, neutrons, and electrons.' },
  { id: 'shells',         title: 'Electron Shells',          summary: 'Energy levels surrounding the nucleus where electrons reside at specific distances.' },
  { id: 'orbitals',       title: 'Orbitals',                 summary: 'Regions of space where there is a high probability of finding an electron.' },
  { id: 'e-config',       title: 'Electronic Configuration', summary: 'The distribution of electrons in an atom\'s shells and subshells.' },
  { id: 'aufbau',         title: 'Aufbau Principle',         summary: 'Electrons fill the lowest available energy orbitals first before occupying higher levels.' },
  { id: 'hunds',          title: 'Hund\'s Rule',             summary: 'Every orbital in a subshell is singly occupied before any orbital is doubly occupied.' },
  { id: 'pauli',          title: 'Pauli Exclusion Principle',summary: 'No two electrons in an atom can have the same set of four quantum numbers.' },
  { id: 'valency',        title: 'Valency',                  summary: 'The combining capacity of an element, determined by its outermost electron count.' },
  { id: 'oxidation',      title: 'Oxidation State',          summary: 'A number representing the degree of oxidation of an atom in a chemical compound.' },
  { id: 'trends',         title: 'Periodic Trends',          summary: 'Patterns in element properties (atomic radius, ionisation energy, electronegativity) across the table.' },
];

export const CATEGORY_META = {
  'alkali-metal':         { label: 'Alkali Metal',          color: 'var(--alkali)'         },
  'alkaline-earth-metal': { label: 'Alkaline Earth Metal',  color: 'var(--alkaline)'       },
  'transition-metal':     { label: 'Transition Metal',      color: 'var(--transition)'     },
  'post-transition':      { label: 'Post-Transition Metal', color: 'var(--post-transition)'},
  'metalloid':            { label: 'Metalloid',             color: 'var(--metalloid)'      },
  'nonmetal':             { label: 'Nonmetal',              color: 'var(--nonmetal)'       },
  'halogen':              { label: 'Halogen',               color: 'var(--halogen)'        },
  'noble-gas':            { label: 'Noble Gas',             color: 'var(--noble)'          },
  'lanthanide':           { label: 'Lanthanide',            color: 'var(--lanthanide)'     },
  'actinide':             { label: 'Actinide',              color: 'var(--actinide)'       },
  'unknown':              { label: 'Unknown',               color: 'var(--unknown)'        },
};
