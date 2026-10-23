// Browser checks: screenshots of every tab (desktop and phone, light and
// dark, French and English), the tab bar (ARIA, keyboard, history, links
// that carry the state, lazy loading) and scripted interaction on every
// tool. Fails on any console error or warning, page error, or horizontal
// overflow.
//
//   npm i                              (installs playwright, dev only)
//   npx playwright install chromium    (once, if no browser is cached)
//   npm run serve &                    (or any static server on site/)
//   BASE=http://localhost:9427 node scripts/e2e.mjs
//
// Screenshots go to $SHOTS (default /tmp/chem-shots).

import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE || 'http://localhost:9427';
const SHOTS = process.env.SHOTS || '/tmp/chem-shots';
mkdirSync(SHOTS, { recursive: true });

const devices = {
  desktop: { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const browser = await chromium.launch();
const problems = [];
let checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) problems.push(msg); };

async function newPage(device, scheme, lang) {
  const ctx = await browser.newContext({ ...devices[device], colorScheme: scheme, locale: lang === 'fr' ? 'fr-FR' : 'en-GB' });
  const page = await ctx.newPage();
  const tag = `[${device} ${scheme} ${lang}]`;
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') problems.push(`${tag} console ${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => problems.push(`${tag} page error: ${e.message}`));
  return { ctx, page };
}
// clientWidth, not innerWidth: with isMobile, Playwright widens innerWidth to the page width.
const overflow = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const text = async (page, sel) => (await page.textContent(sel))?.replace(/\s+/g, ' ').trim() ?? '';
/** Wait until the tab named in the hash is shown and its tool is built. */
const ready = (page) => page.waitForFunction(() => {
  const tab = (location.hash.match(/^#(lewis|redox|acidbase)/) ?? [, 'lewis'])[1];
  const panel = document.getElementById(`panel-${tab}`);
  return panel && !panel.hidden && !panel.hasAttribute('aria-busy') && panel.querySelector('h1');
});
/** Load a URL of the app afresh (a hash-only goto would not reload) and wait for the tool. */
async function go(page, path) {
  await page.goto('about:blank');
  await page.goto(`${BASE}/${path}`, { waitUntil: 'networkidle' });
  await ready(page);
}

// ---------------------------------------------------------------- screenshots
const PAGES = [
  ['lewis', '#lewis?f=SO4%5E2-'],
  ['lewis-no2', '#lewis?f=NO2'],
  ['redox', '#redox'],
  ['acidbase', '#acidbase'],
];
for (const device of Object.keys(devices)) {
  for (const scheme of ['light', 'dark']) {
    for (const lang of ['en', 'fr']) {
      const { ctx, page } = await newPage(device, scheme, lang);
      for (const [name, path] of PAGES) {
        await go(page, path);
        ok((await page.getAttribute('html', 'lang')) === lang, `${name} ${device}: browser language ${lang} not picked up`);
        const o = await overflow(page);
        ok(o <= 0, `${name} ${device} ${scheme} ${lang}: horizontal overflow ${o}px`);
        await page.screenshot({ path: `${SHOTS}/${name}-${device}-${scheme}-${lang}.png`, fullPage: true });
      }
      await ctx.close();
    }
  }
}

// ---------------------------------------------------------------- Tabs
{
  const { ctx, page } = await newPage('desktop', 'light', 'en');
  const scripts = [];
  page.on('request', (r) => { if (r.url().endsWith('.js')) scripts.push(new URL(r.url()).pathname); });
  await go(page, '');
  // The app opens on the Lewis tab; the other tools are loaded only when opened.
  ok((await page.evaluate(() => location.hash)) === '#lewis?f=SO4%5E2-', `tabs: opens on Lewis (${await page.evaluate(() => location.hash)})`);
  ok(scripts.includes('/lewis/js/app.js') && !scripts.some((u) => /\/(redox|acidbase)\//.test(u)), `tabs: only the Lewis code loaded at first: ${scripts.join(' ')}`);
  ok((await page.title()) === 'Lewis structures · outils-chimie', `tabs: title ${await page.title()}`);
  // ARIA tabs: one tablist, three tabs, each controlling one panel; one panel shown.
  const aria = await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('[role="tablist"] [role="tab"]')];
    return {
      names: tabs.map((t) => t.textContent.trim()),
      selected: tabs.map((t) => t.getAttribute('aria-selected')),
      tabindex: tabs.map((t) => t.tabIndex),
      wired: tabs.every((t) => document.getElementById(t.getAttribute('aria-controls'))?.getAttribute('aria-labelledby') === t.id),
      shown: [...document.querySelectorAll('[role="tabpanel"]')].filter((p) => !p.hidden).map((p) => p.id),
      h1: document.querySelectorAll('h1').length,
    };
  });
  ok(aria.names.join('|') === 'Lewis|Redox (oxidation numbers)|Acid–base', `tabs: names ${aria.names}`);
  ok(aria.selected.join() === 'true,false,false' && aria.tabindex.join() === '0,-1,-1', `tabs: selection ${aria.selected} ${aria.tabindex}`);
  ok(aria.wired, 'tabs: aria-controls and aria-labelledby');
  ok(aria.shown.join() === 'panel-lewis' && aria.h1 === 1, `tabs: one panel shown (${aria.shown}), one h1 (${aria.h1})`);

  // Keyboard: arrows move and open (wrapping), Home and End; focus stays on the tab bar.
  await page.focus('#tab-lewis');
  await page.keyboard.press('ArrowRight');
  await ready(page);
  ok((await page.evaluate(() => document.activeElement.id)) === 'tab-redox', 'tabs: ArrowRight focuses Redox');
  ok((await page.getAttribute('#tab-redox', 'aria-selected')) === 'true' && await page.isVisible('#rx-final'), 'tabs: ArrowRight opens Redox');
  ok(scripts.includes('/redox/js/app.js'), 'tabs: Redox code loaded on opening');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await ready(page);
  ok((await page.evaluate(() => [document.activeElement.id, location.hash.split('?')[0]].join())) === 'tab-acidbase,#acidbase', 'tabs: ArrowLeft wraps to Acid–base');
  await page.keyboard.press('Home');
  await ready(page);
  ok((await page.evaluate(() => location.hash)) === '#lewis?f=SO4%5E2-', 'tabs: Home opens Lewis with its state');
  await page.keyboard.press('End');
  await ready(page);
  ok(await page.isVisible('#ph-value'), 'tabs: End opens Acid–base');
  // Tab key from the tab bar goes into the panel, not to the other tabs.
  await page.keyboard.press('Tab');
  ok((await page.evaluate(() => document.activeElement.id)) === 'panel-acidbase', `tabs: Tab enters the panel (${await page.evaluate(() => document.activeElement.id)})`);

  // Each tab keeps its state in the URL; the tab links carry it when you come back.
  await page.selectOption('#ph-species', 'HCl');
  ok((await page.evaluate(() => location.hash)) === '#acidbase?ph=HCl', `tabs: acid-base state in the hash (${await page.evaluate(() => location.hash)})`);
  await page.click('#tab-lewis');
  await ready(page);
  await page.fill('#lw-input', 'CO2');
  await page.waitForFunction(() => document.getElementById('lw-ve')?.textContent === '16');
  ok((await page.getAttribute('#tab-acidbase', 'href')) === '#acidbase?ph=HCl', 'tabs: the Acid–base tab link keeps its state');
  await page.click('#tab-acidbase');
  await ready(page);
  ok(/pH 1\.00/.test(await text(page, '#ph-value')), 'tabs: Acid–base state back after a round trip');
  ok((await page.title()) === 'Acids and bases · outils-chimie', `tabs: title follows the tab (${await page.title()})`);
  // Back and forward move between tabs, with their state.
  await page.goBack();
  await ready(page);
  ok((await page.evaluate(() => location.hash)) === '#lewis?f=CO2' && (await text(page, '#lw-ve')) === '16', 'tabs: Back returns to Lewis with CO2');
  await page.goForward();
  await ready(page);
  ok((await page.evaluate(() => location.hash)) === '#acidbase?ph=HCl', 'tabs: Forward returns to Acid–base');
  // A citation scrolls to its source without leaving the tab or losing its state.
  await page.locator('#panel-acidbase a.src').first().click();
  ok((await page.evaluate(() => location.hash)) === '#acidbase?ph=HCl', 'tabs: a citation keeps the route');
  ok(await page.evaluate(() => document.activeElement.matches('.sources li.is-target')), 'tabs: the cited source is focused and highlighted');
  // The skip link goes to the open panel.
  await page.evaluate(() => document.querySelector('.skip').click());
  ok((await page.evaluate(() => document.activeElement.id)) === 'panel-acidbase', 'tabs: skip link to the panel');

  // Links between tools open the other tab with the species.
  await go(page, '#redox?sp=H2O2');
  await page.locator('#ox-result a[href^="#lewis"]').click();
  await ready(page);
  ok((await page.evaluate(() => location.hash)) === '#lewis?f=H2O2' && (await text(page, '#lw-ve')) === '14', 'tabs: redox -> Lewis of H2O2');
  ok((await page.evaluate(() => document.activeElement.id)) === 'panel-lewis', 'tabs: focus moves to the new panel');
  await page.locator('#lw-steps a[href^="#redox"]').click();
  await ready(page);
  ok(/sp=H2O2/.test(await page.evaluate(() => location.hash)) && /−1/.test(await text(page, '#ox-result')), 'tabs: Lewis -> oxidation numbers of H2O2');

  // A pasted link opens its tab directly; an unknown hash opens Lewis.
  await go(page, '#acidbase?ta=phosphoric&tt=base');
  ok((await page.getAttribute('#tab-acidbase', 'aria-selected')) === 'true' && (await page.locator('#t-chart .tc-eq').count()) >= 2, 'tabs: shared acid-base link');
  await go(page, '#nothing-here');
  ok((await page.getAttribute('#tab-lewis', 'aria-selected')) === 'true', 'tabs: unknown hash opens Lewis');

  // Language and theme are kept across tabs; the state too.
  await go(page, '#redox?sp=Cr2O7%5E2-&m=acid&ox=MnO4&red=Fe3');
  await page.click('[data-lang-btn="fr"]');
  ok((await text(page, '#tab-redox')) === 'Rédox (nombres d’oxydation)' && (await page.title()) === 'Oxydoréduction · outils-chimie', `tabs: French tab names and title (${await text(page, '#tab-redox')}, ${await page.title()})`);
  ok(/\+6/.test(await text(page, '#ox-result')), 'tabs: state kept across the language switch');
  await page.click('[data-theme-btn]');
  await page.click('#tab-acidbase');
  await ready(page);
  ok((await page.getAttribute('html', 'data-theme')) === 'dark' && /Acides et bases/.test(await text(page, 'h1')), 'tabs: theme and language kept on another tab');
  await ctx.close();
}
{
  // Phone: the three tabs fit, a tap opens one, and the tab bar stays on screen while scrolling.
  const { ctx, page } = await newPage('phone', 'light', 'fr');
  await go(page, '');
  const widths = await page.evaluate(() => {
    const bar = document.querySelector('[role="tablist"]');
    return { bar: bar.clientWidth, scroll: bar.scrollWidth, h: Math.min(...[...bar.children].map((t) => t.getBoundingClientRect().height)) };
  });
  ok(widths.scroll <= widths.bar, `tabs phone: the three tabs fit (${widths.scroll} > ${widths.bar})`);
  ok(widths.h >= 44, `tabs phone: tap targets at least 44 px (${widths.h})`);
  await page.tap('#tab-redox');
  await ready(page);
  ok(await page.isVisible('#rx-final'), 'tabs phone: tap opens Redox');
  await page.evaluate(() => window.scrollTo(0, 2000));
  const top = await page.evaluate(() => document.querySelector('[role="tablist"]').getBoundingClientRect().top);
  ok(Math.abs(top) < 1, `tabs phone: tab bar stays at the top (${top})`);
  await page.tap('#tab-acidbase');
  await ready(page);
  const y = await page.evaluate(() => document.querySelector('[role="tablist"]').getBoundingClientRect().top);
  ok(Math.abs(y) < 1 && (await page.evaluate(() => document.getElementById('panel-acidbase').getBoundingClientRect().top)) > 0, 'tabs phone: a new tab starts at its top');
  await page.screenshot({ path: `${SHOTS}/tabs-phone-fr.png` });
  await ctx.close();
}

// ---------------------------------------------------------------- Lewis
{
  const { ctx, page } = await newPage('desktop', 'light', 'en');
  await go(page, '#lewis?f=SO4%5E2-');
  ok((await text(page, '#lw-ve')) === '32', `lewis SO4: valence ${await text(page, '#lw-ve')}`);
  ok((await page.locator('#lw-main svg').count()) === 6, 'lewis SO4: six resonance forms drawn');
  ok((await page.locator('.octet-alt svg').count()) === 1, 'lewis SO4: octet alternative drawn');
  ok((await page.locator('#lw-steps > li').count()) === 10, 'lewis SO4: ten steps');
  ok((await page.locator('.sources li').count()) >= 10, 'lewis: sources listed');

  // Typing a formula (debounced) updates the result and the hash.
  await page.fill('#lw-input', 'CO2');
  await page.waitForFunction(() => document.getElementById('lw-ve')?.textContent === '16');
  ok(decodeURIComponent(await page.evaluate(() => location.hash)) === '#lewis?f=CO2', 'lewis: hash follows the input');
  ok(/linear/.test(await text(page, '#lw-shape')), `lewis CO2 shape: ${await text(page, '#lw-shape')}`);

  // Choosing from the list.
  await page.selectOption('#lw-pick', 'XeF4');
  ok((await text(page, '#lw-ve')) === '36', 'lewis XeF4 from the list: 36 electrons');
  ok(/square planar/.test(await text(page, '#lw-shape')), 'lewis XeF4: square planar');
  ok(/expanded octet/.test(await text(page, '#lw-steps')), 'lewis XeF4: expanded octet explained');

  // Odd electrons, electron deficiency.
  await page.click('.examples button[data-f="NO2"]');
  ok(/odd number of electrons/.test(await text(page, '#lw-steps')), 'lewis NO2: odd electron explained');
  ok((await page.locator('#lw-main .lw-rad').count()) >= 1, 'lewis NO2: unpaired electron drawn');
  await page.click('.examples button[data-f="BF3"]');
  ok(/electron-deficient/.test(await text(page, '#lw-steps')), 'lewis BF3: electron deficiency explained');

  // Oxidation states on the drawing.
  await page.click('.examples button[data-f="H2O"]');
  await page.check('#lw-os');
  const os = await page.locator('#lw-main .lw-os').allTextContents();
  ok(os.sort().join(',') === '+1,+1,−2', `lewis H2O oxidation states: ${os}`);

  // Isomers: a choice, then a structure.
  await page.fill('#lw-input', 'C2H6O');
  await page.waitForSelector('.iso-pick');
  ok((await page.locator('.iso-pick').count()) === 2, 'lewis C2H6O: two skeletons offered');
  await page.locator('.iso-pick').first().click();
  ok((await text(page, '#lw-ve')) === '20', 'lewis C2H6O: chosen skeleton drawn');

  // Errors and refusals.
  await page.fill('#lw-input', 'h2o');
  await page.waitForSelector('#lw-msg .err');
  ok(/capital letter/.test(await text(page, '#lw-msg')), 'lewis: lowercase error');
  await page.fill('#lw-input', 'FeCl3');
  await page.waitForSelector('#lw-refusal');
  ok(/transition metal/.test(await text(page, '#lw-refusal')), 'lewis: transition metal refused');
  // Ambiguous charge: N3- read as nitride, azide offered.
  await page.fill('#lw-input', 'N3-');
  await page.waitForSelector('#lw-alt');
  await page.click('#lw-alt');
  ok((await text(page, '#lw-ve')) === '16', `lewis: azide after the suggestion: ${await text(page, '#lw-ve')}`);

  // The drawing has a text description and can be downloaded as SVG.
  const title = await page.textContent('#lw-main svg title');
  ok(/Bonds: 2 × N–N double\. Lone pairs: 2 on N \(× 2\)/.test(title), `lewis: drawing description: ${title}`);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('#lw-dl')]);
  const { readFileSync } = await import('node:fs');
  const svgText = readFileSync(await dl.path(), 'utf8');
  ok(/^<svg[^>]*xmlns/.test(svgText) && /fill:/.test(svgText), 'lewis: SVG download with inline styles');

  // Language and theme switches.
  await page.click('[data-lang-btn="fr"]');
  ok((await text(page, 'h1')) === 'Schémas de Lewis', 'lewis: language switch');
  ok((await text(page, '#lw-ve')) === '16', 'lewis: state kept across the language switch');
  await page.click('[data-theme-btn]');
  ok((await page.getAttribute('html', 'data-theme')) === 'dark', 'lewis: theme switch');
  await page.screenshot({ path: `${SHOTS}/interact-lewis-fr-dark.png`, fullPage: true });
  await ctx.close();
}

// ---------------------------------------------------------------- Redox
{
  const { ctx, page } = await newPage('desktop', 'light', 'en');
  await go(page, '#redox?sp=MnO4-&m=acid&ox=MnO4&red=Fe3');
  ok(/\+7/.test(await text(page, '#ox-result')), 'redox: Mn +7 in MnO4-');
  ok((await text(page, '#rx-final')).replace(/\s/g, '') === 'MnO4−+8H++5Fe2+→Mn2++4H2O+5Fe3+', `redox final: ${await text(page, '#rx-final')}`);
  ok(/0\.736/.test(await text(page, '#rx-ecell')), `redox E°cell: ${await text(page, '#rx-ecell')}`);
  ok(/spontaneous/.test(await text(page, '#rx-spont')), 'redox: spontaneous');

  // Typed species: thiosulfate per atom (IUPAC), peroxide by difference.
  await page.fill('#ox-input', 'Na2S2O3');
  await page.waitForFunction(() => /\+5/.test(document.getElementById('ox-result').textContent));
  ok(/−1/.test(await text(page, '#ox-result')), 'redox: thiosulfate terminal S −1');
  await page.click('#ox-examples button[data-sp="H2O2"]');
  ok(/−1/.test(await text(page, '#ox-result')), 'redox: O −1 in H2O2');
  await page.selectOption('#ox-pick', { index: 3 });
  ok((await text(page, '#ox-result')).length > 20, 'redox: species from the list');

  // Swap: the reverse reaction is not spontaneous.
  await page.click('#rx-swap');
  ok(/−0\.736/.test(await text(page, '#rx-ecell')), `redox swap E°cell: ${await text(page, '#rx-ecell')}`);
  ok(/not spontaneous/.test(await text(page, '#rx-spont')), 'redox swap: not spontaneous');

  // Basic medium: OpenStax Example 17.2 by default.
  await page.click('#rx-medium button[data-medium="base"]');
  const fb = (await text(page, '#rx-final')).replace(/\s/g, '');
  ok(/OH−/.test(fb) && !/H\+/.test(fb), `redox basic: ${fb}`);

  // Own couples: copper in nitric acid (OpenStax Example 17.1).
  await go(page, '#redox?sp=Cu&m=acid&mode=own&o1=NO3-&o2=NO&r1=Cu%5E2%2B&r2=Cu');
  ok((await text(page, '#rx-final')).replace(/\s/g, '') === '2NO3−+8H++3Cu→2NO+4H2O+3Cu2+', `redox own: ${await text(page, '#rx-final')}`);

  await page.click('[data-lang-btn="fr"]');
  ok(/Oxydoréduction/.test(await text(page, 'h1')), 'redox: language switch');
  await page.screenshot({ path: `${SHOTS}/interact-redox-fr.png`, fullPage: true });
  await ctx.close();
}

// ---------------------------------------------------------------- Acids and bases
{
  const { ctx, page } = await newPage('desktop', 'light', 'en');
  await go(page, '#acidbase');
  // Defaults: 0.100 M acetic acid (OpenStax Example 14.22a), buffer, titration of Table 14.2.
  ok(/2\.87/.test(await text(page, '#ph-value')), `acid-base pH: ${await text(page, '#ph-value')}`);
  ok(/4\.74/.test(await text(page, '#buf-value')), `acid-base buffer: ${await text(page, '#buf-value')}`);
  ok((await page.locator('#t-chart svg path').count()) > 0, 'acid-base: titration curve drawn');

  // Strong acid, then a weak base, then a salt.
  await page.selectOption('#ph-species', 'HCl');
  ok(/pH 1\.00/.test(await text(page, '#ph-value')), `acid-base HCl: ${await text(page, '#ph-value')}`);
  await page.selectOption('#ph-species', 'ammonia');
  ok(/11\.1/.test(await text(page, '#ph-value')), `acid-base NH3: ${await text(page, '#ph-value')}`);
  await page.selectOption('#ph-species', 'NH4Cl');
  await page.fill('#ph-c', '0,05'); // a decimal comma is accepted
  const nh4 = Number((await text(page, '#ph-value')).match(/\d+\.\d+/)?.[0]);
  ok(nh4 > 5 && nh4 < 6, `acid-base NH4Cl 0.05 M: ${nh4}`);

  // Titration: slider to equivalence (25.00 mL) reads pH 8.72 (Table 14.2).
  await page.locator('#t-slider').evaluate((el) => { el.value = '25'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  ok(/8\.72/.test(await text(page, '#t-read')), `acid-base slider at 25 mL: ${await text(page, '#t-read')}`);
  // Keyboard on the slider moves the reading.
  await page.focus('#t-slider');
  await page.keyboard.press('ArrowRight');
  ok(!/8\.72/.test(await text(page, '#t-read')), 'acid-base: slider moves with the keyboard');
  // Pointer over the chart shows a reading.
  const box = await page.locator('#t-chart svg').boundingBox();
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.5);
  ok((await text(page, '#t-read')).length > 10, 'acid-base: pointer reading');

  // Strong acid titration through the hash: equivalence at pH 7.00.
  await go(page, '#acidbase?ta=HCl&tca=0.1&tva=25&tt=base&tct=0.1&tv=25');
  ok(/7\.00/.test(await text(page, '#t-read')), `acid-base HCl equivalence: ${await text(page, '#t-read')}`);
  // Polyprotic acid: two visible equivalence points or a note.
  await go(page, '#acidbase?ta=phosphoric&tt=base');
  ok((await page.locator('#t-chart .tc-eq').count()) >= 2, 'acid-base H3PO4: equivalence points marked');

  await page.click('[data-lang-btn="fr"]');
  ok(/Acides et bases/.test(await text(page, 'h1')), 'acid-base: language switch');
  await page.screenshot({ path: `${SHOTS}/interact-acidbase-fr.png`, fullPage: true });
  await ctx.close();
}
{
  // Touch on the phone: tapping the curve gives a reading.
  const { ctx, page } = await newPage('phone', 'light', 'fr');
  await go(page, '#acidbase');
  const box = await page.locator('#t-chart svg').boundingBox();
  await page.locator('#t-chart svg').scrollIntoViewIfNeeded();
  const b2 = await page.locator('#t-chart svg').boundingBox();
  await page.touchscreen.tap(b2.x + b2.width * 0.7, b2.y + b2.height * 0.4);
  ok(/pH/.test(await text(page, '#t-read')), 'acid-base phone: tap reading');
  void box;
  await ctx.close();
}

await browser.close();
if (problems.length) {
  console.error(`FAILED ${problems.length} of ${checks} checks:\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`OK: ${checks} checks, no console errors. Screenshots in ${SHOTS}`);
