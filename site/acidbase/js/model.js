// Acid–base calculations behind the page, without any DOM: solutions made
// from the reagents, the textbook routes (OpenStax Chemistry 2e, 14.3-14.7)
// next to the exact charge-balance answer, buffers, titrations, and which
// way a proton transfer lies.
import { KW, famById, reagentById, STRONG_ACIDS } from './data.js';
import { solvePH, alphas, weakApprox, hh, curve, pKa } from './equilibrium.js';

export const PKW = -Math.log10(KW); // 14.00 at 25 °C

// ------------------------------------------------------------ solutions
/**
 * The solution of one reagent at concentration C (mol/L), as solvePH wants it:
 * {families:[{C, Ka, z0, fam}], cat, an}. Spectators: Na+ for anionic forms,
 * Cl- for cationic forms, the anion of a strong acid, the cation of a strong base.
 */
export function solutionOf(reagent, C) {
  const r = typeof reagent === 'string' ? reagentById.get(reagent) : reagent;
  const sol = { families: [], cat: 0, an: 0 };
  if (r.kind === 'strong-acid') {
    if (r.id === 'H2SO4') {
      // first proton complete: H+ and HSO4- (whose H+ is the counter-charge, not a spectator)
      const f = famById.get('hso4');
      sol.families.push({ C, Ka: f.Ka, z0: f.z0, fam: f });
    } else sol.an = C;
  } else if (r.kind === 'strong-base') sol.cat = C * r.strong.oh;
  else if (r.kind === 'neutral') { sol.cat = C; sol.an = C; } else {
    const f = famById.get(r.fam);
    sol.families.push({ C, Ka: f.Ka, z0: f.z0, fam: f });
    const z = f.z0 - r.j; // charge of the form put in the flask
    if (z < 0) sol.cat = -z * C; else if (z > 0) sol.an = z * C;
  }
  return sol;
}

/** Mix two solutions given as {sol, V} (mL): every concentration diluted to the total volume. */
export function mix(...parts) {
  const Vt = parts.reduce((s, p) => s + p.V, 0);
  const out = { families: [], cat: 0, an: 0 };
  for (const { sol, V } of parts) {
    const k = V / Vt;
    out.cat += (sol.cat || 0) * k; out.an += (sol.an || 0) * k;
    for (const f of sol.families || []) {
      const same = out.families.find((g) => g.fam === f.fam);
      if (same) same.C += f.C * k; else out.families.push({ ...f, C: f.C * k });
    }
  }
  return out;
}

/** Two solutes in the same solution (concentrations add, no dilution). */
export function sum(a, b) {
  const out = mix({ sol: a, V: 1 }, { sol: b, V: 1 });
  out.cat *= 2; out.an *= 2;
  for (const f of out.families) f.C *= 2;
  return out;
}

/** Concentrations of every form at a given pH (for the "what is in the flask" lists). */
export function speciesAt(sol, pH) {
  const h = 10 ** -pH;
  const out = [];
  for (const f of sol.families) {
    const a = alphas(h, f.Ka);
    f.fam.forms.forEach((formula, j) => out.push({ formula, fam: f.fam, j, c: f.C * a[j], alpha: a[j] }));
  }
  return out;
}

// ------------------------------------------------------------ pH of one reagent: the textbook route
/**
 * What kind of problem a reagent is, and the textbook route for it.
 * Returns {type, ...numbers} with type one of:
 *  'strong-acid', 'sulfuric', 'strong-base', 'neutral', 'weak-acid', 'weak-base', 'amphiprotic'.
 * Every route gives pHText (the textbook answer), next to `exact` (charge balance).
 */
export function phRoute(reagent, C) {
  const r = typeof reagent === 'string' ? reagentById.get(reagent) : reagent;
  const sol = solutionOf(r, C);
  const exact = solvePH(sol);
  const base = { reagent: r, C, sol, exact };
  if (r.kind === 'strong-acid' && r.id === 'H2SO4') {
    // H2SO4 -> H3O+ + HSO4- (complete); HSO4- <=> H3O+ + SO4^2-: (C + x) x / (C - x) = Ka2
    const Ka = famById.get('hso4').Ka[0];
    const b = C + Ka;
    const x = (-b + Math.sqrt(b * b + 4 * Ka * C)) / 2;
    const h = C + x;
    return { ...base, type: 'sulfuric', Ka, x, h, pHText: -Math.log10(h), pHFirstOnly: -Math.log10(C) };
  }
  if (r.kind === 'strong-acid') return { ...base, type: 'strong-acid', h: C, pHText: -Math.log10(C) };
  if (r.kind === 'strong-base') {
    const oh = C * r.strong.oh;
    const pOH = -Math.log10(oh);
    return { ...base, type: 'strong-base', oh, pOH, pHText: PKW - pOH };
  }
  if (r.kind === 'neutral') return { ...base, type: 'neutral', pHText: PKW / 2 };
  const f = famById.get(r.fam);
  const n = f.Ka.length;
  const j = r.j;
  if (j > 0 && j < n) {
    // amphiprotic: can give a proton (Ka[j]) and take one (Kb = Kw / Ka[j-1])
    return { ...base, type: 'amphiprotic', fam: f, j, KaGive: f.Ka[j], KbTake: KW / f.Ka[j - 1], pHText: null };
  }
  if (j === 0) {
    const Ka = f.Ka[0];
    const ap = weakApprox(C, Ka);
    const x = ap.valid ? ap.xSmall : ap.xQuad;
    const polyOk = n < 2 || f.Ka[0] >= 20 * f.Ka[1];
    return { ...base, type: 'weak-acid', fam: f, j, K: Ka, Kfrom: f.kaFromKb ? 'kb' : 'ka', ap, x, pHText: -Math.log10(x), poly: n > 1, polyOk, ratio: n > 1 ? f.Ka[0] / f.Ka[1] : null };
  }
  // j === n: the most basic form, a weak base. First protonation: Kb1 = Kw / Ka[n-1].
  const Kb = KW / f.Ka[n - 1];
  const ap = weakApprox(C, Kb);
  const x = ap.valid ? ap.xSmall : ap.xQuad;
  const pOH = -Math.log10(x);
  const polyOk = n < 2 || Kb >= 20 * (KW / f.Ka[n - 2]);
  return { ...base, type: 'weak-base', fam: f, j, K: Kb, Kfrom: f.kaFromKb ? 'kb' : 'kw-ka', ap, x, pOH, pHText: PKW - pOH, poly: n > 1, polyOk, ratio: n > 1 ? Kb / (KW / f.Ka[n - 2]) : null };
}

// ------------------------------------------------------------ buffers
/**
 * A buffer of the pair (form j / form j+1) of a family: Ca of the acid form,
 * Cb of the base form (mol/L), V mL of it; optionally `add` = {kind:'acid'|'base', C, V}
 * of a strong acid (HCl) or strong base (NaOH).
 */
export function buffer({ fam, j, Ca, Cb, V = 100, add = null }) {
  const f = typeof fam === 'string' ? famById.get(fam) : fam;
  const Ka = f.Ka[j];
  const pk = pKa(Ka);
  const acidR = { kind: 'form', fam: f.id, j };
  const baseR = { kind: 'form', fam: f.id, j: j + 1 };
  const bufSol = (ca, cb) => sum(solutionOf(acidR, ca), solutionOf(baseR, cb));
  const before = { Ca, Cb, pHHH: hh(pk, Cb, Ca), exact: solvePH(bufSol(Ca, Cb)) };
  before.hhValid = hhValidity(before.pHHH, Ca, Cb);
  const out = { fam: f, j, Ka, pKa: pk, V, before, ratio: Cb / Ca };
  if (add && add.V > 0 && add.C > 0) {
    const nA = Ca * V, nB = Cb * V, nAdd = add.C * add.V; // mmol
    const Vt = V + add.V;
    let a = nA, b = nB, excess = 0;
    if (add.kind === 'base') { const used = Math.min(nAdd, nA); a -= used; b += used; excess = nAdd - used; } else { const used = Math.min(nAdd, nB); b -= used; a += used; excess = nAdd - used; }
    const after = { nA, nB, nAdd, a, b, Vt, Ca: a / Vt, Cb: b / Vt, excess };
    after.pHHH = excess > 0 || a <= 0 || b <= 0 ? null : hh(pk, after.Cb, after.Ca);
    after.hhValid = after.pHHH === null ? null : hhValidity(after.pHHH, after.Ca, after.Cb);
    const sol = mix({ sol: bufSol(Ca, Cb), V }, { sol: add.kind === 'base' ? { families: [], cat: add.C, an: 0 } : { families: [], cat: 0, an: add.C }, V: add.V });
    after.exact = solvePH(sol);
    after.dpH = after.exact.pH - before.exact.pH;
    // the same addition to an unbuffered strong acid or base solution with the buffer's pH (Example 14.20 c)
    const p0 = before.exact.pH;
    const unb = p0 < 7 ? { families: [], cat: 0, an: 10 ** -p0 - 10 ** (p0 - PKW) } : { families: [], cat: 10 ** (p0 - PKW) - 10 ** -p0, an: 0 };
    const unbAfter = mix({ sol: unb, V }, { sol: add.kind === 'base' ? { families: [], cat: add.C, an: 0 } : { families: [], cat: 0, an: add.C }, V: add.V });
    after.unbuffered = { pH0: solvePH(unb).pH, pH: solvePH(unbAfter).pH };
    out.after = after;
  }
  return out;
}

/** HH holds when the [H3O+] or [OH-] it implies is small next to both partners (OpenStax 14.6, "x is small"). */
function hhValidity(pHv, Ca, Cb) {
  const x = Math.max(10 ** -pHv, 10 ** (pHv - PKW));
  const small = x < 0.05 * Math.min(Ca, Cb);
  const ratio = Cb / Ca;
  return { x, small, inRange: ratio >= 0.1 && ratio <= 10 };
}

// ------------------------------------------------------------ titrations
/**
 * The proton-transfer steps between an analyte and a titrant.
 * titrant 'base' (NaOH) removes protons, 'acid' (HCl) adds them.
 * Each step: {kind:'strong'|'weak', equiv (protons per formula unit), Ka?, acid, base (formulas)}.
 */
export function titrationSteps(reagent, titrant) {
  const r = typeof reagent === 'string' ? reagentById.get(reagent) : reagent;
  if (titrant === 'base') {
    if (r.kind === 'strong-acid') {
      if (r.id === 'H2SO4') { const f = famById.get('hso4'); return [{ kind: 'strong', equiv: 1, acid: 'H2SO4', base: 'HSO4-' }, { kind: 'weak', equiv: 1, Ka: f.Ka[0], fam: f, j: 0, acid: f.forms[0], base: f.forms[1] }]; }
      return [{ kind: 'strong', equiv: 1, acid: r.formula, base: r.strong.conj }];
    }
    if (r.kind !== 'form') return [];
    const f = famById.get(r.fam);
    const out = [];
    for (let i = r.j; i < f.Ka.length; i++) out.push({ kind: 'weak', equiv: 1, Ka: f.Ka[i], fam: f, j: i, acid: f.forms[i], base: f.forms[i + 1] });
    return out;
  }
  if (r.kind === 'strong-base') return [{ kind: 'strong', equiv: r.strong.oh, acid: 'H2O', base: 'OH-' }];
  if (r.kind !== 'form') return [];
  const f = famById.get(r.fam);
  const out = [];
  for (let i = r.j - 1; i >= 0; i--) out.push({ kind: 'weak', equiv: 1, Ka: f.Ka[i], fam: f, j: i, acid: f.forms[i], base: f.forms[i + 1] });
  return out;
}

/**
 * Full titration: Va mL of analyte at Ca, titrant ('base' = NaOH, 'acid' = HCl) at Ct.
 * Returns {steps, eqs, halves, buffers, vmax, points, build, keyPoints}.
 */
export function titration({ analyte, Ca, Va, titrant = 'base', Ct }) {
  const r = typeof analyte === 'string' ? reagentById.get(analyte) : analyte;
  const steps = titrationSteps(r, titrant);
  const solA = solutionOf(r, Ca);
  const tSol = titrant === 'base' ? { families: [], cat: Ct, an: 0 } : { families: [], cat: 0, an: Ct };
  const build = (v) => (v <= 0 ? solA : mix({ sol: solA, V: Va }, { sol: tSol, V: v }));
  const pHAt = (v) => solvePH(build(v)).pH;
  const dV = (Ca * Va) / Ct; // mL of titrant per mole-equivalent of analyte
  const eqs = [], halves = [], buffers = [];
  let v0 = 0;
  steps.forEach((s, k) => {
    const v1 = v0 + s.equiv * dV;
    const w = v1 - v0;
    // our own visibility criterion: a jump of at least 1 pH unit within ±5 % of one step's volume
    const jump = Math.abs(pHAt(v1 + 0.05 * dV) - pHAt(Math.max(0, v1 - 0.05 * dV)));
    eqs.push({ k, v: v1, pH: pHAt(v1), visible: jump >= 1, jump, step: s, last: k === steps.length - 1 });
    if (s.kind === 'weak') {
      const vh = v0 + w / 2;
      halves.push({ k, v: vh, pH: pHAt(vh), pKa: pKa(s.Ka), step: s });
      // buffer region: both partners present, the smaller at least a tenth of the larger (OpenStax 14.6)
      buffers.push({ k, from: v0 + w / 11, to: v0 + (10 * w) / 11, step: s });
    }
    v0 = v1;
  });
  const vLast = eqs.length ? eqs[eqs.length - 1].v : dV;
  const vmax = vLast + dV;
  const points = curve(build, vmax, 400, [...eqs.map((e) => e.v), ...halves.map((h) => h.v)]);
  return { analyte: r, Ca, Va, titrant, Ct, steps, dV, eqs, halves, buffers, vmax, points, build, pHAt, keyPoints: keyPoints({ r, Ca, Va, titrant, Ct, steps, dV, pHAt }) };
}

/**
 * Textbook values at four volumes (start, half-equivalence, equivalence, 1.5 × equivalence)
 * for a one-step titration (OpenStax Examples 14.21 and 14.22). null for several steps.
 */
function keyPoints({ r, Ca, Va, titrant, Ct, steps, dV, pHAt }) {
  if (steps.length !== 1 || steps[0].equiv !== 1) return null;
  const s = steps[0];
  const veq = dV;
  const rows = [];
  // 1. start
  let start;
  if (s.kind === 'strong') {
    start = titrant === 'base' ? { method: 'strong-acid', pH: -Math.log10(Ca) } : { method: 'strong-base', pH: PKW + Math.log10(Ca) };
  } else {
    const K = titrant === 'base' ? s.Ka : KW / s.Ka;
    const ap = weakApprox(Ca, K);
    const x = ap.valid ? ap.xSmall : ap.xQuad;
    start = { method: ap.valid ? 'x-small' : 'quadratic', pH: titrant === 'base' ? -Math.log10(x) : PKW + Math.log10(x), K };
  }
  rows.push({ id: 'start', v: 0, ...start });
  // 2. half-equivalence
  const vh = veq / 2;
  if (s.kind === 'strong') {
    const left = (Ca * Va - Ct * vh) / (Va + vh);
    rows.push({ id: 'half', v: vh, method: 'excess-analyte', c: left, pH: titrant === 'base' ? -Math.log10(left) : PKW + Math.log10(left) });
  } else rows.push({ id: 'half', v: vh, method: 'hh', pH: pKa(s.Ka) });
  // 3. equivalence
  if (s.kind === 'strong') rows.push({ id: 'eq', v: veq, method: 'neutral', pH: PKW / 2 });
  else {
    const c = (Ca * Va) / (Va + veq);
    const K = titrant === 'base' ? KW / s.Ka : s.Ka; // the conjugate partner reacts with water
    const x = Math.sqrt(K * c);
    rows.push({ id: 'eq', v: veq, method: titrant === 'base' ? 'conj-base' : 'conj-acid', c, K, x, pH: titrant === 'base' ? PKW + Math.log10(x) : -Math.log10(x) });
  }
  // 4. excess titrant at 1.5 × the equivalence volume
  const vx = 1.5 * veq;
  const ex = (Ct * (vx - veq)) / (Va + vx);
  rows.push({ id: 'excess', v: vx, method: 'excess-titrant', c: ex, pH: titrant === 'base' ? PKW + Math.log10(ex) : -Math.log10(ex) });
  for (const row of rows) row.exact = pHAt(row.v);
  return rows;
}

/** Where a volume sits on the curve: 'start', 'buffer', 'strong', 'equivalence', 'between', 'excess'. */
export function region(t, v) {
  const tol = 0.004 * t.vmax;
  if (v <= tol) return { id: 'start' };
  for (const e of t.eqs) if (Math.abs(v - e.v) <= tol) return { id: 'equivalence', eq: e };
  let v0 = 0;
  for (let k = 0; k < t.steps.length; k++) {
    const e = t.eqs[k];
    if (v < e.v) {
      const s = t.steps[k];
      const frac = (v - v0) / (e.v - v0);
      if (s.kind === 'strong') return { id: 'strong', step: s, frac };
      const b = t.buffers.find((x) => x.k === k);
      return { id: v >= b.from && v <= b.to ? 'buffer' : 'between', step: s, frac, half: t.halves.find((x) => x.k === k) };
    }
    v0 = e.v;
  }
  return { id: t.steps.length ? 'excess' : 'none' };
}

// ------------------------------------------------------------ which way a proton transfer lies
/**
 * Acid HA + base B <=> A- + HB+. K = Ka(HA) / Ka(HB+), with the usual conventions
 * (water left out of K): Ka(H3O+) = 1 and, for water acting as an acid, Ka(H2O) = Kw,
 * so that HA + H2O gives K = Ka and B + H2O gives K = Kb (OpenStax 14.1-14.3).
 * acid and base are entries of speciesList(). Returns {K, logK, kind} or {kind:'strong'|'negligible'|'same'}.
 */
export function protonTransfer(acid, base) {
  const kaOf = (sp, asAcid) => {
    // Ka of the acid that `sp` is (asAcid) or of the conjugate acid of `sp` (base)
    if (sp.special === 'hydronium') return asAcid ? 1 : null;
    if (sp.special === 'water') return asAcid ? KW : 1; // water as a base: its conjugate acid is H3O+
    if (sp.special === 'hydroxide') return asAcid ? null : KW; // OH- + H+ -> H2O
    if (sp.strong) return asAcid ? Infinity : null;
    if (sp.negligible) return asAcid ? null : Infinity;
    const f = famById.get(sp.fam);
    return asAcid ? f.Ka[sp.step] : f.Ka[sp.step - 1];
  };
  const ka = kaOf(acid, true), kb = kaOf(base, false);
  if (ka === null || kb === null || ka === undefined || kb === undefined) return { kind: 'invalid' };
  if (acid.key === base.key) return { kind: 'same' };
  if (ka === Infinity && kb === Infinity) return { kind: 'both-strong' };
  if (ka === Infinity) return { kind: 'strong' };
  if (kb === Infinity) return { kind: 'negligible' };
  const K = ka / kb;
  return { kind: 'k', K, logK: Math.log10(K), kaAcid: ka, kaConj: kb };
}

/** Products of a proton transfer: the conjugate base of the acid and the conjugate acid of the base. */
export function conjugates(acid, base) {
  const conjOfAcid = (sp) => {
    if (sp.special === 'hydronium') return 'H2O';
    if (sp.special === 'water') return 'OH-';
    if (sp.strong) return STRONG_ACIDS.find((a) => a.id === sp.strong).conj;
    const f = famById.get(sp.fam);
    return f.forms[sp.step + 1];
  };
  const conjOfBase = (sp) => {
    if (sp.special === 'water') return 'H3O+';
    if (sp.special === 'hydroxide') return 'H2O';
    if (sp.negligible) return sp.negligible;
    const f = famById.get(sp.fam);
    return f.forms[sp.step - 1];
  };
  return { conjBase: conjOfAcid(acid), conjAcid: conjOfBase(base) };
}
