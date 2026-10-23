// Skeletons for Lewis structures: which atom is bonded to which.
//
// A skeleton is a tree (this tool draws no rings): atoms [{el}] and single
// edges [[i, j]]. Several candidate skeletons may be returned; the Lewis
// engine (lewis.js) scores each of them with formal charges and keeps the
// best, which is how textbooks justify the central atom and the place of the
// hydrogens (OpenStax Chemistry 2e, sections 7.3 and 7.4).
//
// Ways to get a skeleton, tried in this order:
//   1. a curated skeleton for a few species with several central atoms whose
//      connectivity is known from the literature (CURATED below);
//   2. a condensed formula as written (CH3COOH, CH3OH, HCOOH, NH2OH, CO(NH2)2);
//   3. a molecular formula: one heavy atom, two, three (all centres tried),
//      or one central atom with all the others around it.
import { el, valence, isTransition } from './elements.js';
import { hill } from './formula.js';

export class Refusal extends Error {
  constructor(code, detail = {}) { super(code); this.code = code; this.detail = detail; }
}

/** Usual number of bonds (for hydrogen placement and condensed formulas only). */
export const STD_VALENCE = { H: 1, Be: 2, B: 3, Al: 3, C: 4, Si: 4, Ge: 4, N: 3, P: 3, As: 3, O: 2, S: 2, Se: 2, Te: 2, F: 1, Cl: 1, Br: 1, I: 1 };

const sk0 = (kind) => ({ kind, atoms: [], edges: [], centre: null });
const add = (sk, e) => { sk.atoms.push({ el: e }); return sk.atoms.length - 1; };
const link = (sk, a, b) => { sk.edges.push([a, b]); };
const degree = (sk, i) => sk.edges.reduce((n, [a, b]) => n + (a === i || b === i ? 1 : 0), 0);
const neighbours = (sk, i) => sk.edges.flatMap(([a, b]) => (a === i ? [b] : b === i ? [a] : []));

/** Canonical string of an unrooted labelled tree (minimum over all roots). */
export function canonicalTree(sk) {
  const adj = sk.atoms.map((_, i) => neighbours(sk, i));
  const canon = (v, p) => sk.atoms[v].el + '(' + adj[v].filter((w) => w !== p).map((w) => canon(w, v)).sort().join(',') + ')';
  let best = null;
  for (let r = 0; r < sk.atoms.length; r++) {
    const c = canon(r, -1);
    if (best === null || c < best) best = c;
  }
  return best;
}

function clone(sk) {
  return { ...sk, atoms: sk.atoms.map((a) => ({ ...a })), edges: sk.edges.map((e) => [...e]) };
}

// ------------------------------------------------------------ curated skeletons
// key: Hill formula|charge. Each entry builds the heavy-atom tree; sources are
// cited on the Lewis page (ids in `src`).
export const CURATED = {
  'O3S2|-2': {
    name: { en: 'thiosulfate', fr: 'thiosulfate' }, src: ['iupac-os'],
    build(sk) { const s = add(sk, 'S'); const t = add(sk, 'S'); link(sk, s, t); for (let i = 0; i < 3; i++) link(sk, s, add(sk, 'O')); sk.centre = s; },
  },
  'O6S4|-2': {
    name: { en: 'tetrathionate, O3S–S–S–SO3', fr: 'tétrathionate, O3S–S–S–SO3' }, src: ['wp-tetrathionate'],
    build(sk) {
      const s = [add(sk, 'S'), add(sk, 'S'), add(sk, 'S'), add(sk, 'S')];
      link(sk, s[0], s[1]); link(sk, s[1], s[2]); link(sk, s[2], s[3]);
      for (const end of [s[0], s[3]]) for (let i = 0; i < 3; i++) link(sk, end, add(sk, 'O'));
    },
  },
  'O8S2|-2': {
    name: { en: 'peroxodisulfate, O3S–O–O–SO3', fr: 'peroxodisulfate, O3S–O–O–SO3' }, src: ['wp-peroxydisulfate'],
    build(sk) {
      const s1 = add(sk, 'S'), o1 = add(sk, 'O'), o2 = add(sk, 'O'), s2 = add(sk, 'S');
      link(sk, s1, o1); link(sk, o1, o2); link(sk, o2, s2);
      for (const end of [s1, s2]) for (let i = 0; i < 3; i++) link(sk, end, add(sk, 'O'));
    },
  },
  'N2O4|0': {
    name: { en: 'dinitrogen tetroxide, O2N–NO2', fr: 'tétraoxyde de diazote, O2N–NO2' }, src: ['wp-n2o4'],
    build(sk) { const a = add(sk, 'N'), b = add(sk, 'N'); link(sk, a, b); for (const n of [a, b]) for (let i = 0; i < 2; i++) link(sk, n, add(sk, 'O')); },
  },
  'H3O3P|0': {
    // Phosphorous acid is diprotic (two Ka values, OpenStax Appendix H): only two H are on
    // oxygen; the third is bonded to P (IUPAC 2016, section 5.4, discusses its P-H bond).
    name: { en: 'phosphorous acid, HPO(OH)2', fr: 'acide phosphoreux, HPO(OH)2' }, src: ['openstax-ka', 'iupac-os'], withH: true,
    build(sk) {
      const p = add(sk, 'P'); sk.centre = p;
      link(sk, p, add(sk, 'H')); link(sk, p, add(sk, 'O'));
      for (let i = 0; i < 2; i++) { const o = add(sk, 'O'); link(sk, p, o); link(sk, o, add(sk, 'H')); }
    },
  },
  'C2O4|-2': {
    name: { en: 'oxalate, O2C–CO2', fr: 'oxalate, O2C–CO2' }, src: ['wp-oxalate'],
    build(sk) { const a = add(sk, 'C'), b = add(sk, 'C'); link(sk, a, b); for (const c of [a, b]) for (let i = 0; i < 2; i++) link(sk, c, add(sk, 'O')); },
  },
};

// ------------------------------------------------------------ condensed formulas
function isCondensed(tree) {
  const seen = new Map();
  let groups = false;
  for (const t of tree) {
    if (t.type === 'group') { groups = true; continue; }
    seen.set(t.el, (seen.get(t.el) || 0) + 1);
  }
  return groups || [...seen.values()].some((n) => n > 1);
}

// A carboxyl group written first, HOOC–R (HOOCCOOH, HOOCCH2COOH), is read as
// C(O)(OH) bonded to what follows, not as the chain H–O–O–C.
function rewriteHOOC(tree) {
  const one = (t, e) => t?.type === 'el' && t.el === e && t.n === 1;
  if (tree.length > 4 && one(tree[0], 'H') && one(tree[1], 'O') && one(tree[2], 'O') && one(tree[3], 'C')) {
    return [{ type: 'el', el: 'C', n: 1 }, { type: 'group', bracket: '(', n: 1, kids: [{ type: 'el', el: 'O', n: 1 }] },
      { type: 'group', bracket: '(', n: 1, kids: [{ type: 'el', el: 'O', n: 1 }, { type: 'el', el: 'H', n: 1 }] }, ...tree.slice(4)];
  }
  return tree;
}

function buildCondensed(rawTree) {
  const tree = rewriteHOOC(rawTree);
  const sk = sk0('condensed');
  const rem = (i) => (STD_VALENCE[sk.atoms[i].el] ?? 4) - degree(sk, i);
  const seq = (items, parent) => {
    let cur = null, hTarget = null, pendingH = 0;
    const pendingGroups = [];
    const attachFirst = (a) => {
      if (parent !== null) link(sk, parent, a);
      for (let i = 0; i < pendingH; i++) link(sk, a, add(sk, 'H'));
      pendingH = 0;
      for (const g of pendingGroups.splice(0)) seq(g, a);
    };
    for (let k = 0; k < items.length; k++) {
      const t = items[k], next = items[k + 1];
      if (t.type === 'group') {
        for (let r = 0; r < t.n; r++) {
          if (cur === null) pendingGroups.push(t.kids);
          else seq(t.kids, cur);
        }
        hTarget = cur;
        continue;
      }
      if (t.el === 'H') {
        if (hTarget === null) { pendingH += t.n; continue; }
        for (let i = 0; i < t.n; i++) link(sk, hTarget, add(sk, 'H'));
        continue;
      }
      // An alkyl group written CnH2n+1 (C2H5, C3H7): a straight chain.
      if (t.el === 'C' && t.n > 1 && next?.type === 'el' && next.el === 'H' && next.n === 2 * t.n + 1) {
        let prev = null;
        for (let i = 0; i < t.n; i++) {
          const c = add(sk, 'C');
          if (prev === null) { if (cur !== null) link(sk, cur, c); else attachFirst(c); } else link(sk, prev, c);
          for (let h = 0; h < (i === 0 ? 3 : 2); h++) link(sk, c, add(sk, 'H'));
          prev = c;
        }
        cur = prev; hTarget = prev; k++;
        continue;
      }
      if (t.n > 1) {
        // Several identical atoms written together (NO2, CO2H, SO3H): substituents of the current atom.
        if (cur === null) throw new Refusal('condensed-unclear');
        let last = null;
        for (let r = 0; r < t.n; r++) { last = add(sk, t.el); link(sk, cur, last); }
        hTarget = last;
        continue;
      }
      const a = add(sk, t.el);
      let substituent = false;
      if (cur !== null) {
        const g = el(t.el).grp;
        const hasH = next?.type === 'el' && next.el === 'H';
        if (g === 17) substituent = true; // halogens make one bond
        // An oxygen (or sulfur) without hydrogen, followed by more atoms: a C=O type
        // substituent when the current atom can still make a double bond plus the next chain bond.
        else if (g === 16 && !hasH && next && rem(cur) >= 3) substituent = true;
        link(sk, cur, a);
      } else attachFirst(a);
      if (!substituent) cur = a;
      hTarget = a;
    }
    if (pendingH || pendingGroups.length) throw new Refusal('condensed-unclear');
    return cur;
  };
  seq(tree, null);
  return sk;
}

// ------------------------------------------------------------ hydrogen placement
/** All ways to put nH hydrogens on the heavy atoms of a skeleton (deduplicated by symmetry). */
function placeHydrogens(heavySk, nH) {
  const n = heavySk.atoms.length;
  const caps = heavySk.atoms.map((a, i) => {
    const e = a.el;
    const std = STD_VALENCE[e];
    if (std === undefined) return 0;
    if (el(e).grp === 17 && n > 1) return 0; // a halogen bonded to another atom carries no H
    return Math.max(0, std - degree(heavySk, i));
  });
  const out = new Map();
  const counts = new Array(n).fill(0);
  const rec = (i, left) => {
    if (i === n) {
      if (left) return;
      const sk = clone(heavySk);
      counts.forEach((c, j) => { for (let k = 0; k < c; k++) link(sk, j, add(sk, 'H')); });
      const key = canonicalTree(sk);
      if (!out.has(key)) out.set(key, sk);
      return;
    }
    for (let c = Math.min(caps[i], left); c >= 0; c--) { counts[i] = c; rec(i + 1, left - c); }
    counts[i] = 0;
  };
  rec(0, nH);
  return [...out.values()];
}

// ------------------------------------------------------------ main entry
const MAX_ATOMS = 24, MAX_HEAVY = 10;

/**
 * Candidate skeletons for a parsed formula ({tree, counts, charge}).
 * Returns {method, skeletons, curated?}; throws Refusal.
 */
export function skeletons(parsed) {
  const { tree, counts, charge } = parsed;
  const els = [...counts.keys()];
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const nH = counts.get('H') || 0;
  const heavyEls = els.filter((e) => e !== 'H');
  const nHeavy = total - nH;

  const tm = els.find((e) => isTransition(e));
  if (tm) throw new Refusal('transition-metal', { el: tm });
  const pMetal = els.find((e) => ['Ga', 'In', 'Tl', 'Sn', 'Pb', 'Bi', 'Po'].includes(e));
  if (pMetal && total > 1) throw new Refusal('metal', { el: pMetal });
  const noble = els.find((e) => ['He', 'Ne', 'Ar'].includes(e));
  if (noble && total > 1) throw new Refusal('noble', { el: noble });
  if (total > MAX_ATOMS || nHeavy > MAX_HEAVY) throw new Refusal('too-big', { atoms: total });
  const ionicMetal = els.find((e) => { const g = el(e).grp; return e !== 'H' && e !== 'Be' && (g === 1 || g === 2); });
  if (ionicMetal && total > 1) throw new Refusal('ionic', { el: ionicMetal });

  // A single atom or monatomic ion: its Lewis symbol.
  if (total === 1) {
    const sk = sk0('atom'); sk.centre = add(sk, els[0]);
    return { method: 'atom', skeletons: [sk] };
  }

  const key = `${hill(counts)}|${charge}`;
  if (CURATED[key]) {
    const c = CURATED[key];
    const sk = sk0('curated'); c.build(sk);
    const withH = nH && !c.withH ? placeHydrogens(sk, nH) : [sk];
    return { method: 'curated', curated: c, skeletons: withH.map((s) => ({ ...s, kind: 'curated' })) };
  }

  if (nHeavy === 0) {
    if (total === 2) { const sk = sk0('chain'); link(sk, add(sk, 'H'), add(sk, 'H')); return { method: 'h2', skeletons: [sk] }; }
    throw new Refusal('no-structure');
  }

  if (isCondensed(tree)) {
    const sk = buildCondensed(tree);
    const got = new Map();
    for (const a of sk.atoms) got.set(a.el, (got.get(a.el) || 0) + 1);
    const same = got.size === counts.size && [...counts].every(([e, n]) => got.get(e) === n);
    if (!same) throw new Refusal('condensed-unclear');
    return { method: 'condensed', skeletons: [sk] };
  }

  const heavyList = heavyEls.flatMap((e) => Array(counts.get(e)).fill(e));
  const nC = counts.get('C') || 0;
  const result = [];

  if (nHeavy === 1) {
    const sk = sk0('single-centre'); sk.centre = add(sk, heavyList[0]);
    for (let i = 0; i < nH; i++) link(sk, sk.centre, add(sk, 'H'));
    return { method: 'one-heavy', skeletons: [sk] };
  }

  if (nHeavy === 2) {
    const sk = sk0('pair'); link(sk, add(sk, heavyList[0]), add(sk, heavyList[1]));
    const all = placeHydrogens(sk, nH);
    if (!all.length) throw new Refusal(counts.has('B') ? 'borane' : 'no-structure');
    return { method: heavyList[0] === heavyList[1] ? 'x2' : 'pair', skeletons: all };
  }

  if (nHeavy === 3 || nC <= 1) {
    // Candidate centres: one atom of each element (for three heavy atoms every element is
    // tried; otherwise only elements present once), never H, never F unless all are F.
    let centres = nHeavy === 3 ? heavyEls : heavyEls.filter((e) => counts.get(e) === 1);
    if (centres.length > 1 || !(centres[0] === 'F' && heavyEls.length === 1)) centres = centres.filter((e) => e !== 'F');
    if (nHeavy > 3 && nC > 1) throw new Refusal('isomers');
    if (!centres.length) throw new Refusal('multi-centre');
    for (const c of centres) {
      const sk = sk0(nHeavy === 3 ? 'triatomic' : 'single-centre');
      sk.centre = add(sk, c);
      const rest = [...heavyList];
      rest.splice(rest.indexOf(c), 1);
      for (const e of rest) link(sk, sk.centre, add(sk, e));
      for (const s of placeHydrogens(sk, nH)) result.push({ ...s, centre: sk.centre });
    }
    if (!result.length) throw new Refusal('no-structure');
    return { method: nHeavy === 3 ? 'three-heavy' : 'centre', skeletons: result };
  }
  throw new Refusal('isomers');
}

export { degree, neighbours };
export const valenceOf = valence;
