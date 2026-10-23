// Lewis structures: valence electrons, bond orders, lone pairs, formal charges,
// resonance, octet exceptions, VSEPR shape and per-atom oxidation states.
//
// Method (OpenStax Chemistry 2e 7.3-7.4, written as an exhaustive search):
//  1. count the valence electrons (charge included);
//  2. take the candidate skeletons (skeleton.js);
//  3. for every skeleton and every choice of bond orders (1, 2 or 3 on each
//     bond between non-hydrogen atoms), place the remaining electrons as the
//     textbook procedure does: octets on the outer atoms first (most
//     electronegative first), then on inner atoms, then any electrons left on
//     an inner atom of period 3 or beyond (expanded octet), an odd electron on
//     the least electronegative atom that still lacks electrons;
//  4. keep structures that respect hard limits (H: 2 electrons; period 2: 8);
//  5. rank them with the textbook guidelines, in this order:
//     octets complete (groups 2 and 13 excepted), smallest sum of |formal
//     charges|, no charge larger than needed, fewest charged atoms, no
//     like charges side by side, no expanded octet when an octet structure is
//     as good, negative charges on the more electronegative atoms, central
//     atom the least electronegative;
//  6. equal best structures on the same skeleton are resonance forms; a tie
//     between different skeletons means the formula is ambiguous (isomers).
import { el, valence } from './elements.js';
import { parseFormula, FormulaError, hill } from './formula.js';
import { skeletons, Refusal, canonicalTree, neighbours } from './skeleton.js';

const EXEMPT_GROUPS = new Set([2, 13]); // electron-deficient centres allowed (OpenStax 7.3)
const EPS = 1e-9;

const pauling = (e) => el(e).pauling ?? 2.5;
const allen = (e) => el(e).allen ?? el(e).pauling ?? 2.5;

/** Valence electron count, with the arithmetic rows. */
export function countValence(counts, charge) {
  const rows = [...counts].map(([e, n]) => ({ el: e, n, v: valence(e), sub: valence(e) * n }));
  const atoms = rows.reduce((s, r) => s + r.sub, 0);
  return { rows, atoms, charge, total: atoms - charge };
}

function adjacency(sk) {
  const adj = sk.atoms.map(() => []);
  sk.edges.forEach(([a, b], k) => { adj[a].push({ to: b, edge: k }); adj[b].push({ to: a, edge: k }); });
  return adj;
}

/** Place lone electrons for given bond orders; null when impossible. */
function fill(sk, adj, orders, V) {
  const n = sk.atoms.length;
  const bonds = new Array(n).fill(0);
  sk.edges.forEach(([a, b], k) => { bonds[a] += orders[k]; bonds[b] += orders[k]; });
  let rem = V - 2 * orders.reduce((s, o) => s + o, 0);
  if (rem < 0) return null;
  const lone = new Array(n).fill(0);
  const isH = (i) => sk.atoms[i].el === 'H';
  const cap = (i) => (isH(i) ? 2 : 8);
  // hard limits: H holds 2 electrons, period-2 atoms 8 (four valence orbitals)
  for (let i = 0; i < n; i++) if (el(sk.atoms[i].el).per <= 2 && 2 * bonds[i] > cap(i)) return null;
  const need = (i) => Math.max(0, cap(i) - 2 * bonds[i] - lone[i]);
  const heavy = [...Array(n).keys()].filter((i) => !isH(i));
  const byEnDesc = (a, b) => pauling(sk.atoms[b].el) - pauling(sk.atoms[a].el) || a - b;
  const terminals = heavy.filter((i) => adj[i].length <= 1).sort(byEnDesc);
  const inner = heavy.filter((i) => adj[i].length > 1).sort(byEnDesc);
  for (const i of [...terminals, ...inner]) {
    const pairs = Math.min(need(i) / 2, Math.floor(rem / 2));
    lone[i] += 2 * pairs; rem -= 2 * pairs;
  }
  const byEnAsc = (a, b) => pauling(sk.atoms[a].el) - pauling(sk.atoms[b].el) || a - b;
  const expandable = inner.filter((i) => el(sk.atoms[i].el).per >= 3).sort(byEnAsc);
  if (rem >= 2) {
    if (!expandable.length) return null;
    lone[expandable[0]] += 2 * Math.floor(rem / 2); rem %= 2;
  }
  if (rem === 1) {
    const cand = [...[...inner].sort(byEnAsc), ...[...terminals].sort(byEnAsc)].find((i) => need(i) >= 1) ?? expandable[0];
    if (cand === undefined) return null;
    lone[cand] += 1; rem = 0;
  }
  return { bonds, lone };
}

function evaluate(sk, adj, orders, V, centreEN) {
  const f = fill(sk, adj, orders, V);
  if (!f) return null;
  const { bonds, lone } = f;
  const n = sk.atoms.length;
  const fc = new Array(n), shell = new Array(n);
  let deficit = 0, deficitExempt = 0, expanded = 0;
  for (let i = 0; i < n; i++) {
    const e = sk.atoms[i].el;
    fc[i] = valence(e) - lone[i] - bonds[i];
    shell[i] = 2 * bonds[i] + lone[i];
    const target = e === 'H' ? 2 : 8;
    const d = Math.max(0, target - shell[i]);
    if (EXEMPT_GROUPS.has(el(e).grp)) deficitExempt += d; else deficit += d;
    expanded += Math.max(0, shell[i] - 8);
  }
  let sameSign = 0;
  for (const [a, b] of sk.edges) if (fc[a] * fc[b] > 0) sameSign++;
  const absSum = fc.reduce((s, x) => s + Math.abs(x), 0);
  const key = [
    deficit,
    absSum,
    Math.max(...fc.map(Math.abs)),
    fc.filter((x) => x !== 0).length,
    sameSign,
    expanded,
    centreEN,
    fc.reduce((s, x, i) => s + x * pauling(sk.atoms[i].el), 0),
  ];
  return { sk, orders: [...orders], lone, bonds, fc, shell, deficit, deficitExempt, expanded, key };
}

export const KEY_NAMES = ['octet', 'fc-sum', 'fc-max', 'fc-count', 'like-charges', 'expanded', 'centre-en', 'fc-placement'];

export function compareKeys(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (Math.abs(a[i] - b[i]) > EPS) return a[i] < b[i] ? -1 : 1;
  }
  return 0;
}
const firstDiff = (a, b) => a.findIndex((x, i) => Math.abs(x - b[i]) > EPS);

/** Every valid structure of one skeleton. */
function enumerate(sk, V) {
  const adj = adjacency(sk);
  const heavyEdges = [];
  sk.edges.forEach(([a, b], k) => { if (sk.atoms[a].el !== 'H' && sk.atoms[b].el !== 'H') heavyEdges.push(k); });
  const centreEN = sk.centre !== null && sk.centre !== undefined && (sk.kind === 'single-centre' || sk.kind === 'triatomic') ? pauling(sk.atoms[sk.centre].el) : 0;
  const orders = new Array(sk.edges.length).fill(1);
  const out = [];
  const rec = (j) => {
    if (j === heavyEdges.length) { const s = evaluate(sk, adj, orders, V, centreEN); if (s) out.push(s); return; }
    for (let o = 1; o <= 3; o++) { orders[heavyEdges[j]] = o; rec(j + 1); }
    orders[heavyEdges[j]] = 1;
  };
  rec(0);
  return out;
}

const sameStructure = (a, b) => a.orders.every((o, i) => o === b.orders[i]) && a.lone.every((l, i) => l === b.lone[i]);

/** The textbook step-by-step state: every bond single, electrons placed outer atoms first. */
function singleBondStage(sk, V) {
  const adj = adjacency(sk);
  const orders = new Array(sk.edges.length).fill(1);
  const n = sk.atoms.length;
  const bonds = new Array(n).fill(0);
  sk.edges.forEach(([a, b]) => { bonds[a]++; bonds[b]++; });
  let rem = V - 2 * sk.edges.length;
  const lone = new Array(n).fill(0);
  const isH = (i) => sk.atoms[i].el === 'H';
  const heavy = [...Array(n).keys()].filter((i) => !isH(i));
  const terminals = heavy.filter((i) => adj[i].length <= 1).sort((a, b) => pauling(sk.atoms[b].el) - pauling(sk.atoms[a].el) || a - b);
  const inner = heavy.filter((i) => adj[i].length > 1);
  const afterOuter = [];
  for (const i of terminals) {
    const pairs = Math.max(0, Math.min((8 - 2 * bonds[i]) / 2, Math.floor(rem / 2)));
    lone[i] += 2 * pairs; rem -= 2 * pairs;
  }
  const remAfterOuter = rem;
  afterOuter.push(...lone);
  // all remaining electrons on the central atom(s), as in OpenStax step 4
  if (inner.length && rem > 0) {
    const c = sk.centre !== null && sk.centre !== undefined && inner.includes(sk.centre) ? sk.centre : inner[0];
    lone[c] += rem; rem = 0;
  } else if (!inner.length && rem > 0) {
    // two atoms: the less electronegative one gets the rest
    const t = [...heavy].sort((a, b) => pauling(sk.atoms[a].el) - pauling(sk.atoms[b].el))[0];
    if (t !== undefined) { lone[t] += rem; rem = 0; }
  }
  const shell = lone.map((l, i) => l + 2 * bonds[i]);
  return { orders, lone, bonds, shell, remAfterOuter, outerLone: afterOuter, used: 2 * sk.edges.length };
}

// ------------------------------------------------------------ VSEPR
const SHAPES = {
  // [bonded, lone]: shape id
  '1,0': 'diatomic', '1,1': 'diatomic', '1,2': 'diatomic', '1,3': 'diatomic',
  '2,0': 'linear', '3,0': 'trigonal-planar', '2,1': 'bent-120', '4,0': 'tetrahedral', '3,1': 'trigonal-pyramidal', '2,2': 'bent-109',
  '5,0': 'trigonal-bipyramidal', '4,1': 'seesaw', '3,2': 't-shaped', '2,3': 'linear',
  '6,0': 'octahedral', '5,1': 'square-pyramidal', '4,2': 'square-planar',
};
const ELECTRON_GEOMETRY = { 2: 'linear', 3: 'trigonal-planar', 4: 'tetrahedral', 5: 'trigonal-bipyramidal', 6: 'octahedral' };
const IDEAL = { linear: '180°', 'trigonal-planar': '120°', 'bent-120': '< 120°', tetrahedral: '109.5°', 'trigonal-pyramidal': '< 109.5°', 'bent-109': '< 109.5°', 'trigonal-bipyramidal': '90°, 120°', seesaw: '< 90°, < 120°', 't-shaped': '< 90°', octahedral: '90°', 'square-pyramidal': '< 90°', 'square-planar': '90°' };

/** VSEPR around atom i of a structure. */
export function vseprAt(s, i) {
  const bonded = neighbours(s.sk, i).length;
  const pairs = Math.floor(s.lone[i] / 2);
  const odd = s.lone[i] % 2;
  const domains = bonded + pairs + odd;
  const shape = SHAPES[`${bonded},${pairs + odd}`] ?? null;
  return { atom: i, el: s.sk.atoms[i].el, bonded, lonePairs: pairs, odd, domains, AXE: `AX${bonded > 1 ? bonded : bonded === 1 ? '' : '0'}${pairs + odd ? 'E' + (pairs + odd > 1 ? pairs + odd : '') : ''}`, electronGeometry: ELECTRON_GEOMETRY[domains] ?? null, shape, angle: shape ? IDEAL[shape] ?? null : null };
}

// ------------------------------------------------------------ oxidation states
/**
 * IUPAC 2016 ionic approximation on a Lewis structure: bonds between like atoms
 * are shared equally, other bonds go to the atom with the higher Allen
 * electronegativity. Returns [{el, os}] per atom; `close` lists bonds whose
 * electronegativity difference is below 0.1 (a convention-dependent sign).
 */
export function oxidationStates(s) {
  const n = s.sk.atoms.length;
  const got = s.lone.slice();
  const close = [];
  s.sk.edges.forEach(([a, b], k) => {
    const ea = s.sk.atoms[a].el, eb = s.sk.atoms[b].el, o = s.orders[k];
    if (ea === eb) { got[a] += o; got[b] += o; return; }
    const xa = allen(ea), xb = allen(eb);
    if (Math.abs(xa - xb) < 0.1) close.push([a, b]);
    if (xa > xb) got[a] += 2 * o; else got[b] += 2 * o;
  });
  return { os: [...Array(n).keys()].map((i) => valence(s.sk.atoms[i].el) - got[i]), close };
}

// ------------------------------------------------------------ main
/** Full analysis for a typed formula. Returns {ok:true, ...} or {ok:false, error|refusal}. */
export function analyse(input, opts = {}) {
  let parsed;
  try { parsed = parseFormula(input); } catch (e) {
    if (e instanceof FormulaError) return { ok: false, error: e.code, detail: e.detail };
    throw e;
  }
  try {
    return { ok: true, parsed, ...analyseParsed(parsed, opts) };
  } catch (e) {
    if (e instanceof Refusal) return { ok: false, parsed, refusal: e.code, detail: e.detail };
    throw e;
  }
}

export function analyseParsed(parsed, opts = {}) {
  const { counts, charge } = parsed;
  const val = countValence(counts, charge);
  if (val.total < 0) throw new Refusal('no-structure');
  const sks = skeletons(parsed);
  if (opts.pick) {
    const keep = sks.skeletons.filter((sk) => canonicalTree(sk) === opts.pick);
    if (keep.length) sks.skeletons = keep;
  }

  if (sks.method === 'atom') {
    const sk = sks.skeletons[0];
    const e = sk.atoms[0].el;
    const s = { sk, orders: [], lone: [val.total], bonds: [0], fc: [charge], shell: [val.total], deficit: 0, deficitExempt: 0, expanded: Math.max(0, val.total - 8), key: [] };
    return { valence: val, method: 'atom', skeletons: sks, best: s, resonance: [s], minor: [], octetAlt: null, candidates: [], stage: null, exceptions: [], vsepr: null, centre: 0, symbol: e };
  }

  // Score every structure of every skeleton.
  const all = [];
  sks.skeletons.forEach((sk, si) => {
    sk.id = si;
    sk.canon = canonicalTree(sk);
    for (const s of enumerate(sk, val.total)) { s.skId = si; all.push(s); }
  });
  if (!all.length) throw new Refusal(counts.has('B') && counts.has('H') ? 'borane' : 'no-structure');
  all.sort((a, b) => compareKeys(a.key, b.key));
  const best = all[0];

  // Ties between different skeletons on the octet and formal-charge criteria mean the
  // formula is ambiguous (isomers such as CH3CH2OH / CH3OCH3, or HNCO / HOCN). Without
  // hydrogen, a tie between two central atoms is settled by the textbook rule: the least
  // electronegative atom is central (OpenStax 7.3).
  const core = (k) => k.slice(0, 6);
  const rivals = all.filter((s) => s.sk.canon !== best.sk.canon && compareKeys(core(s.key), core(best.key)) === 0);
  const hasH = counts.has('H');
  const bestCentre = best.sk.centre !== null && best.sk.centre !== undefined ? best.sk.atoms[best.sk.centre].el : null;
  const centreRule = rivals.length > 0 && !hasH && bestCentre !== null &&
    rivals.every((r) => r.sk.centre !== null && r.sk.centre !== undefined && r.sk.atoms[r.sk.centre].el !== bestCentre && r.key[6] > best.key[6] + EPS);
  if (rivals.length && !centreRule) {
    const options = [];
    for (const s of [best, ...rivals]) if (!options.some((o) => o.canon === s.sk.canon)) options.push({ canon: s.sk.canon, structure: s });
    throw new Refusal('isomers', { options: options.slice(0, 6), more: Math.max(0, options.length - 6) });
  }

  const sameSk = all.filter((s) => s.skId === best.skId);
  const resonance = [];
  for (const s of sameSk) if (compareKeys(s.key, best.key) === 0 && !resonance.some((r) => sameStructure(r, s))) resonance.push(s);
  const minor = [];
  for (const s of sameSk) {
    if (minor.length >= 3) break;
    if (compareKeys(s.key.slice(0, 6), best.key.slice(0, 6)) === 0 && compareKeys(s.key, best.key) > 0 && !minor.some((m) => compareKeys(m.key, s.key) === 0)) minor.push(s);
  }
  let octetAlt = null;
  if (best.expanded > 0) {
    // the best structure of the same skeleton in which no atom goes beyond an octet
    // (an odd-electron species may then have one atom with seven)
    octetAlt = sameSk.find((s) => s.expanded === 0 && s.deficit <= best.deficit + (val.total % 2)) ?? null;
  }

  // Candidate table: best structure of each distinct "class", top few, with the reason each loses.
  const classes = [];
  for (const s of all) {
    const k = `${s.skId}|${s.key.map((x) => x.toFixed(6)).join(',')}`;
    if (classes.some((c) => c.k === k)) continue;
    classes.push({ k, s, lose: s === best ? null : KEY_NAMES[firstDiff(s.key, best.key)] ?? 'same' });
  }
  const candidates = pickCandidates(classes, best);

  const stage = singleBondStage(best.sk, val.total);
  const exceptions = [];
  if (val.total % 2 === 1) exceptions.push('odd');
  if (best.deficitExempt > 0) exceptions.push('incomplete');
  if (best.expanded > 0) exceptions.push(octetAlt ? 'expanded-optional' : 'expanded-required');
  const formulaKey = `${hill(counts)}|${charge}`;
  if (formulaKey === 'O2|0') exceptions.push('o2-paramagnetic');
  if (formulaKey === 'O3S2|-2') exceptions.push('thiosulfate-ss');

  const sk = best.sk;
  const centre = sk.centre ?? null;
  const inner = sk.atoms.map((_, i) => i).filter((i) => sk.atoms[i].el !== 'H' && neighbours(sk, i).length > 1);
  const vsepr = centre !== null && neighbours(sk, centre).length > 1 ? vseprAt(best, centre) : null;
  const vseprInner = inner.map((i) => vseprAt(best, i));

  if (centreRule) exceptions.push('centre-rule');
  if (formulaKey === 'H3O3P|0') exceptions.push('h3po3');
  return { valence: val, method: sks.method, curated: sks.curated ?? null, skeletons: sks, best, resonance, minor, octetAlt, candidates, stage, exceptions, vsepr, vseprInner, centre, nSkeletons: sks.skeletons.length, oxidation: oxidationStates(octetAlt ?? best), oxidationFrom: octetAlt ? 'octet' : 'best' };
}

function pickCandidates(classes, best) {
  // the best, then the best losing for each reason, up to 6 rows
  const out = [classes.find((c) => c.s === best)];
  const seen = new Set();
  for (const c of classes) {
    if (out.length >= 6) break;
    if (c.s === best || seen.has(c.lose)) continue;
    seen.add(c.lose);
    out.push(c);
  }
  return out;
}

export { Refusal };
