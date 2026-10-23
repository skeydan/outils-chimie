// Oxidation numbers by the textbook rules (OpenStax Chemistry 2e, 4.2), each
// value with the rule that produced it, plus per-atom values from a Lewis
// structure (IUPAC 2016 ionic approximation, lewis.js) when atoms of one
// element sit in different environments.
//
// Rule order:
//   elemental substance 0; monatomic ion = its charge;
//   F -1; group 1 +1; group 2 +2;
//   H +1, or -1 when every other element is clearly less electronegative (metal hydrides, BH4-);
//   O -2, or "by difference" when O is the last unknown (peroxides -1, superoxides -1/2, OF2 +2);
//   Cl, Br, I -1 unless combined with O, F or a more electronegative halogen;
//   the last unknown element by difference: the sum equals the charge.
import { el, valence, isMetal } from './elements.js';
import { parseFormula, FormulaError, hill } from './formula.js';
import { analyseParsed, oxidationStates } from './lewis.js';

// ------------------------------------------------------------ fractions
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const frac = (n, d = 1) => { if (d < 0) { n = -n; d = -d; } const g = gcd(n, d) || 1; return { n: n / g, d: d / g }; };
const fadd = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
const fmul = (a, k) => frac(a.n * k, a.d);
const fsub = (a, b) => fadd(a, frac(-b.n, b.d));
const fdiv = (a, k) => frac(a.n, a.d * k);
export const fval = (f) => f.n / f.d;
const isInt = (f) => f.d === 1;

/** Highest and lowest oxidation number an element can reach (valence-electron limits). */
export function limits(e) {
  const x = el(e);
  if (!x) return { max: 8, min: -4 };
  if (x.block === 'd') return { max: x.grp, min: 0 };
  if (x.block === 'f') return { max: 8, min: 0 };
  const v = valence(e);
  const min = e === 'H' ? -1 : x.grp >= 14 && x.grp <= 17 ? -(8 - v) : 0;
  return { max: v, min };
}

// ------------------------------------------------------------ curated cases
// Species whose atoms of one element are not alike and whose per-atom values
// come from a source, not from this tool's structures.
export const PER_ATOM = {
  'Fe3O4|0': { el: 'Fe', values: [frac(2), frac(3), frac(3)], src: 'wp-fe3o4', note: 'fe3o4' },
  'O3S2|-2': { el: 'S', values: [frac(5), frac(-1)], src: 'iupac-os', note: 'thiosulfate' },
  'O6S4|-2': { el: 'S', values: [frac(5), frac(0), frac(0), frac(5)], src: 'wp-tetrathionate', note: 'tetrathionate' },
};
// Salts made of two polyatomic ions: rules applied to each ion.
export const ION_PAIRS = {
  'H4N2O3|0': ['NH4+', 'NO3-'],
  'ClH4N|0': ['NH4+', 'Cl-'],
  'H8N2O4S|0': ['NH4+', 'NH4+', 'SO4^2-'],
};

// ------------------------------------------------------------ rules
/**
 * Rule-based oxidation numbers for one species.
 * Returns {parsed, items:[{el, n, value, rule, detail}], sum, flags:[...]}.
 */
export function byRules(parsed) {
  const { counts, charge } = parsed;
  const els = [...counts.keys()];
  const items = new Map(els.map((e) => [e, { el: e, n: counts.get(e), value: null, rule: null, detail: {} }]));
  const flags = [];
  const set = (e, v, rule, detail = {}) => { const it = items.get(e); it.value = v; it.rule = rule; it.detail = detail; };
  const unknown = () => els.filter((e) => items.get(e).value === null);

  if (els.length === 1) {
    const e = els[0], n = counts.get(e);
    if (!charge) set(e, frac(0), 'elemental');
    else if (n === 1) set(e, frac(charge), 'monatomic');
    else { set(e, frac(charge, n), 'homonuclear-ion'); if (charge % n) flags.push('average'); }
    return finish(parsed, items, flags);
  }

  if (items.has('F')) set('F', frac(-1), 'F');
  for (const e of els) {
    const g = el(e).grp;
    if (e !== 'H' && g === 1) set(e, frac(1), 'group1');
    if (g === 2) set(e, frac(2), 'group2');
  }
  if (items.has('H')) {
    const others = els.filter((e) => e !== 'H');
    const enH = el('H').pauling;
    const allLess = others.every((e) => (el(e).pauling ?? 0) < enH - 0.1);
    if (allLess) set('H', frac(-1), others.every(isMetal) ? 'H-metal' : 'H-less-en', { others });
    else {
      const close = others.filter((e) => Math.abs((el(e).pauling ?? 0) - enH) < 0.1 && (el(e).pauling ?? 0) < enH);
      set('H', frac(1), 'H-nonmetal', { close });
      if (close.length) flags.push('h-close');
    }
  }
  if (items.has('O') && items.get('O').value === null) {
    const left = unknown();
    if (left.length === 1) {
      // O is the only element not fixed by a rule: its value follows from the charge.
      const v = difference(items, 'O', charge);
      const kind = fval(v) === -2 ? 'O-normal' : fval(v) === -1 ? 'O-peroxide' : fval(v) === -0.5 ? 'O-superoxide' : fval(v) > 0 ? 'O-positive' : 'O-other';
      set('O', v, kind, eqDetail(items, 'O', charge));
      if (!isInt(v)) flags.push('average');
      return finish(parsed, items, flags);
    }
    set('O', frac(-2), 'O-default');
  }
  const hasOF = items.has('O') || items.has('F');
  for (const e of ['Cl', 'Br', 'I']) {
    if (!items.has(e) || items.get(e).value !== null) continue;
    const moreEnHalogen = els.some((x) => el(x).grp === 17 && x !== e && el(x).pauling > el(e).pauling);
    if (!hasOF && !moreEnHalogen) set(e, frac(-1), 'halogen');
  }
  const left = unknown();
  if (left.length === 1) {
    const e = left[0];
    const v = difference(items, e, charge);
    set(e, v, 'difference', eqDetail(items, e, charge));
    if (!isInt(v)) flags.push('average');
    const lim = limits(e);
    if (fval(v) > lim.max) flags.push(items.has('O') ? 'exceeds-max-peroxo' : 'exceeds-max');
    if (fval(v) < lim.min) flags.push('below-min');
  } else if (left.length > 1) {
    flags.push('several-unknown');
  }
  return finish(parsed, items, flags);
}

function difference(items, target, charge) {
  let s = frac(0);
  for (const it of items.values()) if (it.el !== target) s = fadd(s, fmul(it.value, it.n));
  return fdiv(fsub(frac(charge), s), items.get(target).n);
}
function eqDetail(items, target, charge) {
  const terms = [...items.values()].filter((it) => it.el !== target).map((it) => ({ el: it.el, n: it.n, value: it.value }));
  return { terms, n: items.get(target).n, charge };
}

function finish(parsed, items, flags) {
  const list = [...items.values()];
  let sum = frac(0);
  const complete = list.every((it) => it.value !== null);
  if (complete) for (const it of list) sum = fadd(sum, fmul(it.value, it.n));
  if (complete && fval(sum) !== parsed.charge) flags.push('inconsistent');
  return { parsed, items: list, sum: complete ? sum : null, flags };
}

// ------------------------------------------------------------ full analysis
/**
 * Oxidation numbers for a typed species: rules, then per-atom values where
 * they differ inside one element. Returns {ok, ...}.
 */
export function oxidation(input) {
  let parsed;
  try { parsed = parseFormula(input); } catch (e) {
    if (e instanceof FormulaError) return { ok: false, error: e.code, detail: e.detail };
    throw e;
  }
  const key = `${hill(parsed.counts)}|${parsed.charge}`;
  if (ION_PAIRS[key]) {
    const ions = ION_PAIRS[key].map((s) => ({ species: s, ...byRules(parseFormula(s)) }));
    return { ok: true, parsed, kind: 'ions', ions, key };
  }
  const rules = byRules(parsed);
  const out = { ok: true, parsed, kind: 'rules', key, ...rules, perAtom: null, structure: null };

  // Per-atom values: curated, or from a Lewis structure of the species (or of its anion
  // once group-1/2 cations are taken off: Na2S2O3 -> S2O3^2-).
  if (PER_ATOM[key]) {
    out.perAtom = { ...PER_ATOM[key], from: 'source' };
    return out;
  }
  const anion = stripCations(parsed);
  const target = anion ?? parsed;
  const tkey = `${hill(target.counts)}|${target.charge}`;
  if (PER_ATOM[tkey]) { out.perAtom = { ...PER_ATOM[tkey], from: 'source', anion: anion ? tkey : null }; return out; }
  // A species of one element (O3, I3-, O2^-): IUPAC spreads the charge over equivalent
  // atoms, so only the average is given.
  if (target.counts.size === 1) return out;
  try {
    const lw = analyseParsed(target);
    if (lw.oxidation && lw.method !== 'atom') {
      const atoms = lw.best.sk.atoms;
      // average over the equivalent resonance forms
      const forms = lw.resonance.map((r) => oxidationStates(r).os);
      const os = atoms.map((_, i) => frac(forms.reduce((a, f) => a + f[i], 0), forms.length));
      const minorDiffers = lw.minor.some((m) => oxidationStates(m).os.some((v, i) => Math.abs(v - fval(os[i])) > 1e-9));
      const byEl = new Map();
      atoms.forEach((a, i) => { if (!byEl.has(a.el)) byEl.set(a.el, []); byEl.get(a.el).push(os[i]); });
      out.structure = { atoms: atoms.map((a) => a.el), os, close: lw.oxidation.close.map(([a, b]) => [atoms[a].el, atoms[b].el]), anion: anion ? tkey : null, minorDiffers, resonance: forms.length };
      for (const [e, vals] of byEl) {
        if (new Set(vals.map(fval)).size > 1) { out.perAtom = { el: e, values: vals, from: 'structure', anion: anion ? tkey : null, minorDiffers }; break; }
      }
      // A single-valued element whose structure value differs from the rule value
      // (for example NCl3, where N and Cl are close in electronegativity).
      out.disagree = [];
      for (const it of rules.items) {
        const vals = byEl.get(it.el);
        if (!vals || it.value === null || (anion && el(it.el).grp <= 2)) continue;
        if (new Set(vals.map(fval)).size === 1 && fval(vals[0]) !== fval(it.value)) out.disagree.push({ el: it.el, rule: it.value, structure: vals[0] });
      }
      // Several unknown elements: the structure decides.
      if (rules.flags.includes('several-unknown')) {
        for (const it of out.items) {
          if (it.value !== null) continue;
          const vals = byEl.get(it.el);
          if (!vals) continue;
          let sum = frac(0); for (const v of vals) sum = fadd(sum, v);
          it.value = fdiv(sum, vals.length); it.rule = 'structure';
        }
        out.flags = out.flags.filter((f) => f !== 'several-unknown');
        out.flags.push('from-structure');
      }
    }
  } catch { /* no structure: rules only */ }
  return out;
}

/** Take group-1/2 cations off a salt: Na2S2O3 -> S2O3^2-. null when not applicable. */
export function stripCations(parsed) {
  const metals = [...parsed.counts.keys()].filter((e) => e !== 'H' && (el(e).grp === 1 || el(e).grp === 2));
  if (!metals.length || metals.length === parsed.counts.size) return null;
  const counts = new Map(parsed.counts);
  let charge = parsed.charge;
  for (const m of metals) { charge -= el(m).grp * counts.get(m); counts.delete(m); }
  // the remaining anion as a molecular formula (heavy atoms then H, as typed order is lost)
  const body = [...counts].map(([e, n]) => e + (n > 1 ? n : '')).join('');
  try { const p = parseFormula(body); return { ...p, charge, counts }; } catch { return null; }
}

/** Format a fraction as text: +7, −2, −1/2, +8/3. */
export function fmtOx(f, { sign = true } = {}) {
  if (!f) return '?';
  const neg = f.n < 0;
  const s = f.d === 1 ? String(Math.abs(f.n)) : `${Math.abs(f.n)}/${f.d}`;
  if (f.n === 0) return '0';
  return (neg ? '−' : sign ? '+' : '') + s;
}
