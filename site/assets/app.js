// The single page: header (language, theme), a tab bar with three tools,
// one panel per tool. The URL hash holds the tab and that tab's state
// (#lewis?f=SO4%5E2-, see route.js), so every view can be shared as a link.
// A tool's code is loaded the first time its tab opens.
//
// Each tool module exports:
//   mount(ctx)  build the tool in ctx.panel from ctx.query()
//   route()     the hash changed while the tool is open (back, forward, a pasted link)
//   refresh()   rebuild after a language change
// and saves its state with ctx.save(query) (history.replaceState, no new entry).
import { initShell, lang, onLangChange } from './site.js';
import { COMMON } from './common.js';
import { TABS, DEFAULT_TAB, parseRoute, routeHash, tabForKey } from './route.js';

const LOADERS = {
  lewis: () => import('../lewis/js/app.js'),
  redox: () => import('../redox/js/app.js'),
  acidbase: () => import('../acidbase/js/app.js'),
};
const DICT = {
  ...COMMON,
  'tabs.label': { en: 'Tools', fr: 'Outils' },
  'tab.lewis': { en: 'Lewis', fr: 'Lewis' },
  'tab.redox': { en: 'Redox', fr: 'Rédox' },
  'tab.redox.more': { en: ' (oxidation numbers)', fr: ' (nombres d’oxydation)' },
  'tab.acidbase': { en: 'Acid–base', fr: 'Acide–base' },
  loading: { en: 'Loading…', fr: 'Chargement…' },
  'load.error': { en: 'This tool could not be loaded. Reload the page to try again.', fr: 'Cet outil n’a pas pu être chargé. Rechargez la page pour réessayer.' },
};
const t = (k) => DICT[k]?.[lang()] ?? DICT[k]?.en ?? k;

const tablist = document.querySelector('[role="tablist"]');
const tabEl = (tab) => document.getElementById(`tab-${tab}`);
const panelEl = (tab) => document.getElementById(`panel-${tab}`);

const modules = {};
const load = (tab) => (modules[tab] ??= LOADERS[tab]());
/** Last state of every tab, so a tab opens again where it was left. */
const queries = Object.fromEntries(TABS.map((tab) => [tab, '']));
let active = null;
let mod = null;
let opening = 0;

function ctxFor(tab) {
  return {
    panel: panelEl(tab),
    query: () => queries[tab],
    save(query) {
      queries[tab] = query;
      updateHrefs();
      // a late timer of a tool that is no longer shown must not touch the URL
      if (active === tab) history.replaceState(null, '', routeHash(tab, query));
    },
  };
}

function updateHrefs() {
  for (const tab of TABS) tabEl(tab).setAttribute('href', routeHash(tab, queries[tab]));
}

function setTitle() {
  document.title = `${t(`nav.${active}`)} · outils-chimie`;
}

/** Where a tab starts: just under the header, where the sticky tab bar sits before it sticks. */
function tabsTop() {
  const main = document.getElementById('main');
  return main.getBoundingClientRect().top + window.scrollY + parseFloat(getComputedStyle(main).paddingTop);
}

async function open(tab, { focusPanel = false, toTop = false } = {}) {
  const ticket = ++opening;
  if (active === tab && mod) { mod.route(); return; }
  if (active) panelEl(active).replaceChildren();
  active = tab;
  mod = null;
  for (const x of TABS) {
    const on = x === tab;
    tabEl(x).setAttribute('aria-selected', String(on));
    tabEl(x).tabIndex = on ? 0 : -1;
    panelEl(x).hidden = !on;
  }
  setTitle();
  const panel = panelEl(tab);
  panel.setAttribute('aria-busy', 'true');
  const slow = setTimeout(() => { if (!panel.childElementCount) panel.replaceChildren(Object.assign(document.createElement('p'), { className: 'muted', textContent: t('loading') })); }, 150);
  let m;
  try {
    m = await load(tab);
  } catch (e) {
    clearTimeout(slow);
    if (ticket !== opening) return;
    panel.removeAttribute('aria-busy');
    panel.replaceChildren(Object.assign(document.createElement('p'), { className: 'err', textContent: t('load.error') }));
    console.error(e);
    return;
  }
  clearTimeout(slow);
  if (ticket !== opening) return; // another tab was opened meanwhile
  mod = m;
  panel.replaceChildren();
  mod.mount(ctxFor(tab));
  panel.removeAttribute('aria-busy');
  // a new tab starts at its top, under the tab bar, once its content is there
  if (toTop) window.scrollTo({ top: tabsTop() });
  if (focusPanel) panel.focus({ preventScroll: true });
}

/** Read the hash: the tab to show and its state. */
function fromHash({ initial = false } = {}) {
  const r = parseRoute(location.hash);
  if (!r) {
    if (initial || !active) open(DEFAULT_TAB);
    return;
  }
  const switching = r.tab !== active;
  queries[r.tab] = r.query;
  updateHrefs();
  // Focus follows the tab bar; after a link inside a panel (Lewis -> redox), focus the new panel.
  const fromPanel = !initial && switching && !tablist.contains(document.activeElement);
  const toTop = switching && !initial && window.scrollY > tabsTop();
  open(r.tab, { focusPanel: fromPanel, toTop });
}

// ---------------------------------------------------------------- tab bar
for (const tab of TABS) {
  const a = tabEl(tab);
  // warm the module cache when a tab is about to be used
  for (const ev of ['pointerenter', 'focus', 'touchstart']) a.addEventListener(ev, () => { load(tab).catch(() => {}); }, { passive: true });
}
tablist.addEventListener('keydown', (ev) => {
  if (ev.altKey || ev.ctrlKey || ev.metaKey) return;
  // from the focused tab: the hash of a quick second key press may not be read yet
  const from = ev.target.closest?.('[role="tab"]')?.id.replace('tab-', '') ?? active;
  const next = tabForKey(from, ev.key);
  if (!next) return;
  ev.preventDefault();
  tabEl(next).focus();
  // arrow keys move between tabs without filling the history
  location.replace(routeHash(next, queries[next]));
});

// In-page anchors (#src-..., the skip link) must not change the route.
document.addEventListener('click', (ev) => {
  if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
  const a = ev.target.closest?.('a[href^="#"]');
  if (!a || parseRoute(a.getAttribute('href'))) return;
  const id = decodeURIComponent(a.getAttribute('href').slice(1));
  const target = id === 'main' ? panelEl(active) : document.getElementById(id);
  ev.preventDefault();
  if (!target) return;
  document.querySelectorAll('.is-target').forEach((x) => x.classList.remove('is-target'));
  if (target.tagName === 'LI') target.classList.add('is-target');
  if (!target.hasAttribute('tabindex')) target.tabIndex = -1;
  target.focus({ preventScroll: true });
  target.scrollIntoView({ block: target.tagName === 'LI' ? 'center' : 'start' });
});

// ---------------------------------------------------------------- start
initShell(DICT);
onLangChange(() => {
  if (!active) return;
  setTitle();
  mod?.refresh();
});
window.addEventListener('hashchange', () => fromHash());
fromHash({ initial: true });
