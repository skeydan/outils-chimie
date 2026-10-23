// Small DOM helpers shared by the calculators. All text goes through
// textContent; only our own dictionary strings may use innerHTML.
import { speciesParts } from './chem/formula.js';

export function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) n.append(kid);
  return n;
}

/** Parse a user number: accepts a decimal comma, spaces and a trailing unit. NaN when empty. */
export function num(raw) {
  const s = String(raw ?? '').trim().replace(/\s+/g, '').replace(',', '.').replace(/[^\d.+\-eE]+$/, '');
  if (s === '') return NaN;
  const v = Number(s);
  return Number.isFinite(v) ? v : NaN;
}

/** Format a number for the UI language with a number of decimals. */
export function fmtn(v, lang, digits = 1) {
  if (!Number.isFinite(v)) return '–';
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(v);
}

/** Numbered citations for one page. sources: [{id, text, url}] in page order. */
export function citer(sources) {
  const index = new Map(sources.map((s, i) => [s.id, i + 1]));
  const cite = (...ids) => ids.map((id) => {
    const i = index.get(id);
    if (!i) throw new Error(`unknown source ${id}`);
    return h('a', { class: 'src', href: `#src-${id}`, 'aria-label': `source ${i}` }, `[${i}]`);
  });
  const list = () => h('ol', {}, ...sources.map((s) => h('li', { id: `src-${s.id}` }, `${s.text} `,
    h('a', { href: s.url, rel: 'noopener', target: '_blank' }, s.url.replace(/^https?:\/\//, '').replace(/\/$/, '')))));
  return { cite, list };
}

/** A labelled input. Returns {wrap, input}. */
export function field({ id, label, value = '', unit = '', hint = '', inputmode = 'decimal', type = 'text', attrs = {} }) {
  const input = h('input', { id, type, inputmode, autocomplete: 'off', value, ...attrs });
  const wrap = h('div', { class: 'field' },
    h('label', { for: id, text: label }),
    h('div', { class: 'field-in' }, input, unit ? h('span', { class: 'unit', text: unit, 'aria-hidden': 'true' }) : null),
    hint ? h('p', { class: 'hint', text: hint }) : null);
  return { wrap, input };
}

/** A select. options: [{value, label}] */
export function select({ id, label, options, value, narrow = false }) {
  const s = h('select', { id }, ...options.map((o) => h('option', { value: o.value, text: o.label, selected: o.value === value })));
  const wrap = h('div', { class: narrow ? 'field' : 'field select' }, h('label', { for: id, text: label }), h('div', { class: 'field-in' }, s));
  return { wrap, input: s };
}

// ---------------------------------------------------------------- chemistry display

/** A species as DOM: "SO4^2-" -> SO<sub>4</sub><sup>2−</sup>. */
export function species(str, cls = 'sp') {
  if (str === 'e-') return h('span', { class: `${cls} e` }, 'e', h('sup', {}, '−'));
  return h('span', { class: cls }, ...speciesParts(str).map((p) => (p.t === 'sub' ? h('sub', {}, p.v) : p.t === 'sup' ? h('sup', {}, p.v) : p.v)));
}

/** One side of an equation from [[species, coef], ...]; mark(species) may return a class. */
export function eqSide(entries, { mark } = {}) {
  const out = [];
  entries.forEach(([s, k], i) => {
    if (i) out.push(h('span', { class: 'op' }, ' + '));
    const cls = mark?.(s);
    out.push(h('span', { class: `term${cls ? ' ' + cls : ''}` }, k === 1 ? '' : h('span', { class: 'coef' }, String(k)), species(s)));
  });
  return out;
}

/** A whole equation. */
export function equation(half, { arrow = '→', mark } = {}) {
  return h('span', { class: 'eqn' }, ...eqSide([...half.left], { mark }), h('span', { class: 'arrow', 'aria-label': 'gives' }, ` ${arrow} `), ...eqSide([...half.right], { mark }));
}

/** Signed number with a real minus sign. */
export function signed(v, lang, digits = 2) {
  if (!Number.isFinite(v)) return '–';
  const s = fmtn(Math.abs(v), lang, digits);
  return (v < 0 ? '−' : v > 0 ? '+' : '') + s;
}

/** Fixed decimals in the UI language (keeps trailing zeros: 0.770 V). */
export function fixed(v, lang, digits = 2) {
  if (!Number.isFinite(v)) return '–';
  return new Intl.NumberFormat(lang === 'fr' ? 'fr-FR' : 'en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v).replace('-', '−');
}

/** Scientific notation as DOM: 1.8 × 10<sup>−5</sup>. */
export function sci(v, lang, digits = 2) {
  if (!Number.isFinite(v)) return document.createTextNode('–');
  if (v === 0) return document.createTextNode('0');
  const e = Math.floor(Math.log10(Math.abs(v)));
  if (e >= -2 && e <= 3) return document.createTextNode(fmtn(v, lang, Math.max(0, digits - e)));
  const m = v / 10 ** e;
  return h('span', { class: 'sci' }, fmtn(m, lang, digits), ' × 10', h('sup', {}, String(e).replace('-', '−')));
}
