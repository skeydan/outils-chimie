// Chemical formulas: parse what people type (H2O, NH4+, SO4^2-, SO4 2-,
// SO₄²⁻, Fe3+, Cr2O72-, Ca(OH)2, [Fe(CN)6]3-, CH3COOH) into an ordered token
// tree, element counts and a charge; format species for display.
import { ELEMENTS } from './elements.js';

const SUB = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };
const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9', '⁺': '+', '⁻': '-' };

/** Error with a machine-readable code (the UI translates codes). */
export class FormulaError extends Error {
  constructor(code, detail = {}) { super(code); this.code = code; this.detail = detail; }
}

function normalise(raw) {
  let s = String(raw ?? '').trim();
  s = s.replace(/[−–—]/g, '-').replace(/\s+/g, ' ');
  // states of matter at the end are ignored: (aq), (s), (l), (g)
  s = s.replace(/\s*\((aq|s|l|g)\)\s*$/i, '');
  // superscripts: a run of superscript characters is the charge
  let supRun = '';
  s = s.replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻]+$/, (m) => { supRun = [...m].map((c) => SUP[c]).join(''); return ''; });
  s = [...s].map((c) => SUB[c] ?? c).join('');
  return { s: s.trim(), supRun };
}

function chargeFromText(t) {
  // "2-", "-2", "-", "+", "3+", "--", "++"
  let m = /^(\d*)([+-])$/.exec(t);
  if (m) return (m[2] === '-' ? -1 : 1) * (m[1] ? Number(m[1]) : 1);
  m = /^([+-])(\d+)$/.exec(t);
  if (m) return (m[1] === '-' ? -1 : 1) * Number(m[2]);
  m = /^(\++|-+)$/.exec(t);
  if (m) return (t[0] === '-' ? -1 : 1) * t.length;
  return null;
}

/**
 * Split off the charge. Returns {body, charge, guessed} where guessed is true
 * when the charge digit was taken from the end of a count (SO42- read as SO4^2-).
 */
function splitCharge(s, supRun) {
  if (supRun) {
    const c = chargeFromText(supRun);
    if (c === null) throw new FormulaError('bad-charge', { text: supRun });
    return { body: s, charge: c, guessed: false };
  }
  let m = /^(.*?)\^\s*[({]?\s*([0-9]*[+-]|[+-][0-9]+)\s*[)}]?$/.exec(s);
  if (m) return { body: m[1].trim(), charge: chargeFromText(m[2].replace(/\s/g, '')), guessed: false };
  m = /^(.*\S)\s+(\d*[+-]|[+-]\d+)$/.exec(s);
  if (m) return { body: m[1], charge: chargeFromText(m[2]), guessed: false };
  m = /^(.*?)\((\d*[+-])\)$/.exec(s);
  if (m && /[A-Za-z]/.test(m[1])) return { body: m[1], charge: chargeFromText(m[2]), guessed: false };
  m = /^(.*?)(\++|-+)$/.exec(s);
  if (m && m[1]) {
    const body = m[1];
    const sign = m[2][0] === '-' ? -1 : 1;
    if (m[2].length > 1) return { body, charge: sign * m[2].length, guessed: false };
    // A digit right before the sign is ambiguous. Rules, each reported as "guessed":
    // - after a closing bracket it is the charge: [Fe(CN)6]3-;
    // - one metal symbol: the charge (Fe3+, Cu2+);
    // - one non-metal symbol: the charge only if it is the usual monatomic anion
    //   charge, 8 minus the valence electrons (N3-, O2-, S2-); otherwise a count (I3-);
    // - a count of two or more digits: its last digit is the charge (SO42-, Cr2O72-);
    // - otherwise a count (NO3-, MnO4-).
    const d = /^(.*?)(\d+)$/.exec(body);
    if (d) {
      const head = d[1], digits = d[2];
      if (/\]$/.test(head)) return { body: head, charge: sign * Number(digits), guessed: false };
      if (/^[A-Z][a-z]?$/.test(head) && ELEMENTS.has(head)) {
        const e = ELEMENTS.get(head);
        const metal = e.grp === 1 || e.grp === 2 || e.block === 'd' || e.block === 'f' || ['Al', 'Ga', 'In', 'Sn', 'Tl', 'Pb', 'Bi'].includes(head);
        const val = e.grp >= 13 ? e.grp - 10 : null;
        const asCharge = { body: head, charge: sign * Number(digits), guessed: true, alt: canonical(head + digits, sign) };
        const asCount = { body: head + digits, charge: sign, guessed: true, alt: canonical(head, sign * Number(digits)) };
        if (metal) return { ...asCharge, guessed: false };
        if (sign < 0 && val !== null && Number(digits) === 8 - val) return asCharge;
        return asCount;
      }
      if (digits.length >= 2 && !/[)]$/.test(head)) return { body: head + digits.slice(0, -1), charge: sign * Number(digits.slice(-1)), guessed: true, alt: null };
    }
    return { body, charge: sign, guessed: false };
  }
  return { body: s, charge: 0, guessed: false };
}

function parseBody(body) {
  let i = 0;
  const readCount = () => {
    const m = /^\d+/.exec(body.slice(i));
    if (!m) return 1;
    i += m[0].length;
    const n = Number(m[0]);
    if (n < 1) throw new FormulaError('bad-count', { at: i });
    return n;
  };
  const parseSeq = (close) => {
    const kids = [];
    while (i < body.length) {
      const c = body[i];
      if (c === ' ') { i++; continue; }
      if (c === '(' || c === '[') {
        i++;
        const inner = parseSeq(c === '(' ? ')' : ']');
        if (body[i] !== (c === '(' ? ')' : ']')) throw new FormulaError('unbalanced');
        i++;
        if (!inner.length) throw new FormulaError('empty-group');
        kids.push({ type: 'group', bracket: c, kids: inner, n: readCount() });
        continue;
      }
      if (c === ')' || c === ']') {
        if (c !== close) throw new FormulaError('unbalanced');
        return kids;
      }
      const m = /^[A-Z][a-z]?/.exec(body.slice(i));
      if (!m) throw new FormulaError(/[a-z]/.test(c) ? 'lowercase' : 'bad-char', { char: c, at: i });
      let sym = m[0];
      if (!ELEMENTS.has(sym) && sym.length === 2 && ELEMENTS.has(sym[0])) sym = sym[0]; // "Co" vs "CO" handled by case; this rescues e.g. "Hf"? no: only falls back when unknown
      if (!ELEMENTS.has(sym)) throw new FormulaError('unknown-element', { sym: m[0] });
      i += sym.length;
      kids.push({ type: 'el', el: sym, n: readCount() });
    }
    if (close) throw new FormulaError('unbalanced');
    return kids;
  };
  const tree = parseSeq(null);
  if (!tree.length) throw new FormulaError('empty');
  return tree;
}

export function countAtoms(tree, mult = 1, into = new Map()) {
  for (const t of tree) {
    if (t.type === 'el') into.set(t.el, (into.get(t.el) || 0) + t.n * mult);
    else countAtoms(t.kids, t.n * mult, into);
  }
  return into;
}

/** Parse a typed species. Throws FormulaError. */
export function parseFormula(raw) {
  const { s, supRun } = normalise(raw);
  if (!s) throw new FormulaError('empty');
  if (/[·•*]/.test(s) || /\.\d*[A-Z]/.test(s)) throw new FormulaError('hydrate');
  if (/^\d/.test(s)) throw new FormulaError('coefficient');
  const { body, charge, guessed, alt } = splitCharge(s, supRun);
  if (charge === null) throw new FormulaError('bad-charge');
  if (/[+\-^]/.test(body)) throw new FormulaError('bad-charge');
  let tree = parseBody(body);
  // a whole species in brackets, [NH4]+ or [Fe(CN)6]3-: the brackets only enclose the ion
  if (tree.length === 1 && tree[0].type === 'group' && tree[0].n === 1) tree = tree[0].kids;
  const counts = countAtoms(tree);
  return { tree, counts, charge, body, guessed, alt: guessed ? alt : null, canonical: canonical(body, charge) };
}

/** A canonical text form: body plus ^n± (or ± for 1). */
export function canonical(body, charge) {
  if (!charge) return body;
  const sign = charge < 0 ? '-' : '+';
  const n = Math.abs(charge);
  // A caret keeps it unambiguous when the body ends with a digit (O2^- is superoxide, O^2- oxide).
  if (n === 1) return /\d$/.test(body) ? `${body}^${sign}` : `${body}${sign}`;
  return `${body}^${n}${sign}`;
}

/** Hill-order formula from counts (C first, then H, then alphabetical; no C: alphabetical). */
export function hill(counts) {
  const keys = [...counts.keys()];
  const order = counts.has('C') ? ['C', 'H', ...keys.filter((k) => k !== 'C' && k !== 'H').sort()] : keys.sort();
  return order.filter((k) => counts.has(k)).map((k) => k + (counts.get(k) > 1 ? counts.get(k) : '')).join('');
}

const SUBS = '₀₁₂₃₄₅₆₇₈₉';
const SUPS = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻' };

/**
 * Split a species string into display parts: [{t:'text'|'sub'|'sup', v}].
 * Accepts canonical strings ("SO4^2-", "MnO4-", "Fe^3+", "e-", "H+") and leading
 * stoichiometric coefficients are NOT handled here.
 */
export function speciesParts(str) {
  const { s, supRun } = normalise(str);
  let body = s, charge = 0;
  if (supRun) charge = chargeFromText(supRun);
  else {
    const sc = splitCharge(s, '');
    body = sc.body; charge = sc.charge;
  }
  const parts = [];
  const re = /(\d+)|([^\d]+)/g;
  let m;
  while ((m = re.exec(body))) {
    if (m[1]) parts.push({ t: 'sub', v: m[1] });
    else parts.push({ t: 'text', v: m[2] });
  }
  if (charge) {
    const n = Math.abs(charge);
    parts.push({ t: 'sup', v: `${n === 1 ? '' : n}${charge < 0 ? '−' : '+'}` });
  }
  return parts;
}

/** Plain-text display with Unicode sub/superscripts (for <option>, titles, aria). */
export function speciesUnicode(str) {
  return speciesParts(str).map((p) => {
    if (p.t === 'sub') return [...p.v].map((d) => SUBS[Number(d)]).join('');
    if (p.t === 'sup') return [...p.v.replace('−', '-')].map((c) => SUPS[c] ?? c).join('');
    return p.v;
  }).join('');
}
