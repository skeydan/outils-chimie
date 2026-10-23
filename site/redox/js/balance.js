// Half-reaction method (OpenStax Chemistry 2e, 4.2 and 17.1), step by step:
//  1. skeleton half-reactions;
//  2. balance the elements other than O and H;
//  3. balance O with H2O;  4. balance H with H+;  5. balance charge with electrons;
//  6. same number of electrons in both halves;  7. add, cancel what appears on both sides;
//  8. in basic solution, add as many OH- as there are H+ to both sides, make water, cancel.
import { parseFormula } from '../../assets/chem/formula.js';

/** Atom counts and charge of a species string ('e-' is the electron). */
export function speciesInfo(s) {
  if (s === 'e-') return { counts: new Map(), charge: -1 };
  const p = parseFormula(s);
  return { counts: p.counts, charge: p.charge };
}
const info = new Map();
const sp = (s) => { if (!info.has(s)) info.set(s, speciesInfo(s)); return info.get(s); };

/** A side is an ordered Map species -> coefficient (positive). */
const side = (entries = []) => new Map(entries);
const cloneHalf = (h) => ({ left: new Map(h.left), right: new Map(h.right) });
const addTo = (m, s, k) => { if (!k) return; m.set(s, (m.get(s) || 0) + k); };

function count(m, element) { let n = 0; for (const [s, k] of m) n += k * (sp(s).counts.get(element) || 0); return n; }
function charge(m) { let q = 0; for (const [s, k] of m) q += k * sp(s).charge; return q; }

/** Remove species that appear on both sides (keep the difference on one side). */
export function simplify(h) {
  const out = cloneHalf(h);
  for (const s of [...out.left.keys()]) {
    if (!out.right.has(s)) continue;
    const a = out.left.get(s), b = out.right.get(s);
    if (a > b) { out.left.set(s, a - b); out.right.delete(s); } else if (b > a) { out.right.set(s, b - a); out.left.delete(s); } else { out.left.delete(s); out.right.delete(s); }
  }
  return out;
}

export function elementsOf(h) {
  const els = new Set();
  for (const m of [h.left, h.right]) for (const s of m.keys()) for (const e of sp(s).counts.keys()) els.add(e);
  return els;
}

export function isBalanced(h) {
  for (const e of elementsOf(h)) if (count(h.left, e) !== count(h.right, e)) return false;
  return charge(h.left) === charge(h.right);
}

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a * b) / gcd(a, b);

/**
 * Balance the reduction half-reaction ox + n e- -> red.
 * opts.medium 'acid' | 'base'; opts.viaAcid: species standing for the oxidant in acid
 * (the water couple in base is H2O/H2, balanced in acid as H+/H2).
 * Returns {steps:[{id, half, detail}], half, n}.
 */
export function balanceHalf(ox, red, { medium = 'acid', viaAcid = null } = {}) {
  const steps = [];
  const start = viaAcid ?? ox;
  let h = { left: side([[start, 1]]), right: side([[red, 1]]) };
  steps.push({ id: 'skeleton', half: cloneHalf(h), detail: { ox: start, red } });

  // 2. elements other than O and H
  const others = [...elementsOf(h)].filter((e) => e !== 'O' && e !== 'H');
  let a = 1, b = 1;
  for (const e of others) {
    const L = sp(start).counts.get(e) || 0, R = sp(red).counts.get(e) || 0;
    if (!L || !R) throw new Error(`element ${e} on one side only`);
    const m = lcm(L * a, R * b);
    const fa = m / (L * a), fb = m / (R * b);
    a *= fa; b *= fb;
  }
  for (const e of others) if ((sp(start).counts.get(e) || 0) * a !== (sp(red).counts.get(e) || 0) * b) throw new Error('inconsistent element ratios');
  h = { left: side([[start, a]]), right: side([[red, b]]) };
  steps.push({ id: 'other-elements', half: cloneHalf(h), detail: { elements: others, a, b } });

  // 3. oxygen with water
  const dO = count(h.left, 'O') - count(h.right, 'O');
  if (dO > 0) addTo(h.right, 'H2O', dO); else if (dO < 0) addTo(h.left, 'H2O', -dO);
  h = simplify(h);
  steps.push({ id: 'oxygen', half: cloneHalf(h), detail: { water: Math.abs(dO), side: dO > 0 ? 'right' : dO < 0 ? 'left' : null } });

  // 4. hydrogen with H+
  const dH = count(h.left, 'H') - count(h.right, 'H');
  if (dH > 0) addTo(h.right, 'H+', dH); else if (dH < 0) addTo(h.left, 'H+', -dH);
  h = simplify(h);
  steps.push({ id: 'hydrogen', half: cloneHalf(h), detail: { protons: Math.abs(dH), side: dH > 0 ? 'right' : dH < 0 ? 'left' : null } });

  // 5. charge with electrons (a reduction: electrons on the left)
  const qL = charge(h.left), qR = charge(h.right);
  const n = qL - qR;
  if (n <= 0) throw new Error('not a reduction as written');
  addTo(h.left, 'e-', n);
  steps.push({ id: 'electrons', half: cloneHalf(h), detail: { n, qL, qR } });

  if (medium === 'base') {
    const hp = (h.left.get('H+') || 0) + (h.right.get('H+') || 0);
    if (hp) {
      const withOH = cloneHalf(h);
      addTo(withOH.left, 'OH-', hp); addTo(withOH.right, 'OH-', hp);
      steps.push({ id: 'base-add-oh', half: cloneHalf(withOH), detail: { oh: hp } });
      // H+ + OH- -> H2O on the side that has both
      for (const m of [withOH.left, withOH.right]) {
        const k = Math.min(m.get('H+') || 0, m.get('OH-') || 0);
        if (k) { m.set('H+', m.get('H+') - k); if (!m.get('H+')) m.delete('H+'); m.set('OH-', m.get('OH-') - k); if (!m.get('OH-')) m.delete('OH-'); addTo(m, 'H2O', k); }
      }
      steps.push({ id: 'base-water', half: cloneHalf(withOH), detail: {} });
      h = simplify(withOH);
      steps.push({ id: 'base-cancel', half: cloneHalf(h), detail: {} });
    }
  }
  if (!isBalanced(h)) throw new Error('half-reaction not balanced');
  return { steps, half: h, n };
}

/** Multiply a half (or reaction) by an integer. */
export const times = (h, k) => ({ left: new Map([...h.left].map(([s, c]) => [s, c * k])), right: new Map([...h.right].map(([s, c]) => [s, c * k])) });
/** Swap sides (a reduction written as an oxidation). */
export const reverse = (h) => ({ left: new Map(h.right), right: new Map(h.left) });

/**
 * Combine a reduction half (cathode) with the reduction half of the couple that is
 * oxidised (anode, reversed here). Returns {n, k1, k2, sum, final}.
 */
export function combine(redHalf, nRed, oxCoupleHalf, nOx) {
  const L = lcm(nRed, nOx);
  const k1 = L / nRed, k2 = L / nOx;
  const a = times(redHalf, k1);
  const b = times(reverse(oxCoupleHalf), k2);
  const sum = { left: new Map(a.left), right: new Map(a.right) };
  for (const [s, c] of b.left) addTo(sum.left, s, c);
  for (const [s, c] of b.right) addTo(sum.right, s, c);
  let final = simplify(sum);
  // common factor (e.g. both halves carried a factor 2)
  const all = [...final.left.values(), ...final.right.values()];
  const g = all.reduce((x, y) => gcd(x, y), 0);
  if (g > 1) final = { left: new Map([...final.left].map(([s, c]) => [s, c / g])), right: new Map([...final.right].map(([s, c]) => [s, c / g])) };
  if (!isBalanced(final)) throw new Error('reaction not balanced');
  return { n: L / (g > 1 ? g : 1), k1, k2, a, b, sum, final, g };
}

export const FARADAY = 96485; // C per mol of electrons (OpenStax 17.4)

/** E°cell, ΔG° (kJ/mol) and K at 25 °C from n and the two potentials (OpenStax 17.3-17.4). */
export function thermo(n, Ecath, Eanode) {
  const E = Ecath - Eanode;
  const dG = (-n * FARADAY * E) / 1000;
  const log10K = (n * E) / 0.0592;
  return { E, dG, log10K };
}

/** Parse an equation string from a table ("MnO4- + 8H+ + 5e- -> Mn^2+ + 4H2O"); ½ allowed. */
export function parseEquation(str) {
  const [l, r] = str.split(/\s*(?:->|→|⟶|⇌|=)\s*/);
  const parseSide = (t) => {
    const m = new Map();
    for (const term of t.split(/\s+\+\s+/)) {
      const x = /^(\d+|½)?\s*(.+)$/.exec(term.trim());
      const k = x[1] === '½' ? 0.5 : x[1] ? Number(x[1]) : 1;
      addTo(m, x[2], k);
    }
    return m;
  };
  return { left: parseSide(l), right: parseSide(r) };
}

/** Normalise a tabulated half-reaction: H3O+ -> H+ + H2O, cancel, integer coefficients. */
export function normaliseTable(h) {
  const out = { left: new Map(), right: new Map() };
  for (const [key, m] of [['left', h.left], ['right', h.right]]) {
    for (const [s, k] of m) {
      if (s === 'H3O+') { addTo(out[key], 'H+', k); addTo(out[key], 'H2O', k); } else addTo(out[key], s, k);
    }
  }
  let r = simplify(out);
  const all = [...r.left.values(), ...r.right.values()];
  if (all.some((k) => !Number.isInteger(k))) r = times(r, 2);
  const g = [...r.left.values(), ...r.right.values()].reduce((x, y) => gcd(x, y), 0);
  return g > 1 ? { left: new Map([...r.left].map(([s, c]) => [s, c / g])), right: new Map([...r.right].map(([s, c]) => [s, c / g])) } : r;
}

export function sameHalf(a, b) {
  const eq = (m1, m2) => m1.size === m2.size && [...m1].every(([s, k]) => m2.get(s) === k);
  return eq(a.left, b.left) && eq(a.right, b.right);
}

/** Text form "MnO4- + 8H+ + 5e- -> Mn^2+ + 4H2O" (for tests and aria labels). */
export function halfText(h) {
  const t = (m) => [...m].map(([s, k]) => (k === 1 ? '' : k) + s).join(' + ');
  return `${t(h.left)} -> ${t(h.right)}`;
}
