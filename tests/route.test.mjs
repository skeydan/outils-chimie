// Hash routes of the single-page app (site/assets/route.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TABS, DEFAULT_TAB, parseRoute, routeHash, tabForKey } from '../site/assets/route.js';

test('three tabs, Lewis first', () => {
  assert.deepEqual(TABS, ['lewis', 'redox', 'acidbase']);
  assert.equal(DEFAULT_TAB, 'lewis');
});

test('a route is the tab and the state of that tab', () => {
  assert.deepEqual(parseRoute('#lewis?f=SO4%5E2-'), { tab: 'lewis', query: 'f=SO4%5E2-' });
  assert.deepEqual(parseRoute('#redox?sp=MnO4-&m=acid&r1=Cu^2+'), { tab: 'redox', query: 'sp=MnO4-&m=acid&r1=Cu^2+' });
  assert.deepEqual(parseRoute('#acidbase'), { tab: 'acidbase', query: '' });
  assert.deepEqual(parseRoute('lewis?'), { tab: 'lewis', query: '' });
  // only the first ? separates the tab from its state
  assert.deepEqual(parseRoute('#lewis?f=a?b'), { tab: 'lewis', query: 'f=a?b' });
});

test('page anchors and unknown hashes are not routes', () => {
  for (const h of ['', '#', '#main', '#src-openstax-lewis', '#Lewis', '#lewisx?f=H2O', '#f=H2O', undefined, null]) assert.equal(parseRoute(h), null, String(h));
});

test('routeHash is the inverse of parseRoute', () => {
  assert.equal(routeHash('lewis', 'f=H2O'), '#lewis?f=H2O');
  assert.equal(routeHash('acidbase'), '#acidbase');
  for (const tab of TABS) for (const q of ['', 'a=1&b=2']) assert.deepEqual(parseRoute(routeHash(tab, q)), { tab, query: q });
  assert.throws(() => routeHash('home'));
});

test('keyboard on the tab bar: arrows wrap, Home and End', () => {
  assert.equal(tabForKey('lewis', 'ArrowRight'), 'redox');
  assert.equal(tabForKey('acidbase', 'ArrowRight'), 'lewis');
  assert.equal(tabForKey('lewis', 'ArrowLeft'), 'acidbase');
  assert.equal(tabForKey('redox', 'Home'), 'lewis');
  assert.equal(tabForKey('redox', 'End'), 'acidbase');
  assert.equal(tabForKey('redox', 'Enter'), null);
});
