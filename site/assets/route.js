// Hash routes of the single-page app: #<tab>?<state of that tab>.
//   #lewis?f=SO4%5E2-          #redox?sp=MnO4-&m=acid&ox=MnO4&red=Fe3
//   #acidbase?ph=HCl&c=0.01    #lewis (the tab with its default state)
// Any other hash (#src-..., #main, empty) is not a route: the page anchors
// use it, and the app opens on the first tab.

export const TABS = ['lewis', 'redox', 'acidbase'];
export const DEFAULT_TAB = TABS[0];

/** '#redox?sp=Cu' -> { tab: 'redox', query: 'sp=Cu' }; null when the hash is not a route. */
export function parseRoute(hash) {
  const raw = String(hash ?? '').replace(/^#/, '');
  const i = raw.indexOf('?');
  const tab = i < 0 ? raw : raw.slice(0, i);
  if (!TABS.includes(tab)) return null;
  return { tab, query: i < 0 ? '' : raw.slice(i + 1) };
}

/** The hash of a tab with its state: routeHash('lewis', 'f=H2O') -> '#lewis?f=H2O'. */
export function routeHash(tab, query = '') {
  if (!TABS.includes(tab)) throw new Error(`unknown tab ${tab}`);
  return `#${tab}${query ? `?${query}` : ''}`;
}

/** The next tab for a key of the tab bar (arrows wrap; Home, End), or null for other keys. */
export function tabForKey(current, key) {
  const i = TABS.indexOf(current);
  const n = TABS.length;
  switch (key) {
    case 'ArrowRight': return TABS[(i + 1) % n];
    case 'ArrowLeft': return TABS[(i - 1 + n) % n];
    case 'Home': return TABS[0];
    case 'End': return TABS[n - 1];
    default: return null;
  }
}
