// pH by the full charge balance (exact for ideal dilute solutions), and the
// textbook approximations it is compared with (OpenStax Chemistry 2e, 14.3-14.7).
//
// A solution is a list of acid families {C, Ka:[...], z0} (z0: charge of the most
// protonated form) plus spectator ions: `cat` (mol/L of positive charge, Na+ ...)
// and `an` (mol/L of negative charge, Cl- ...). The charge balance
//   [H3O+] + cat + Σ C·Σ_j α_j (z0 - j) = [OH-] + an
// is increasing in [H3O+], so bisection on log[H3O+] always finds the root.
import { KW } from './data.js';

/** Fractions α_j of each form (j protons lost) at a given [H3O+]. */
export function alphas(h, Ka) {
  const terms = [1];
  for (let j = 0; j < Ka.length; j++) terms.push(terms[j] * Ka[j] / h);
  const s = terms.reduce((a, b) => a + b, 0);
  return terms.map((t) => t / s);
}

function balance(h, sol) {
  let q = h - KW / h + (sol.cat || 0) - (sol.an || 0);
  for (const f of sol.families || []) {
    const a = alphas(h, f.Ka);
    let z = 0;
    for (let j = 0; j < a.length; j++) z += a[j] * (f.z0 - j);
    q += f.C * z;
  }
  return q;
}

/** Exact pH of a solution (bisection on log10 [H3O+] from -16 to 2). */
export function solvePH(sol) {
  let lo = -16, hi = 2;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (balance(10 ** mid, sol) > 0) hi = mid; else lo = mid;
  }
  const h = 10 ** ((lo + hi) / 2);
  return { pH: -Math.log10(h), h, oh: KW / h };
}

export const pKa = (Ka) => -Math.log10(Ka);

/** Weak monoprotic acid (or base with Kb): the "x is small" route, the quadratic, and the 5 % check. */
export function weakApprox(C, K) {
  const xSmall = Math.sqrt(K * C);
  const xQuad = (-K + Math.sqrt(K * K + 4 * K * C)) / 2;
  return { xSmall, xQuad, pct: (100 * xSmall) / C, valid: xSmall / C < 0.05 };
}

/** Henderson–Hasselbalch. */
export const hh = (pKaValue, Cbase, Cacid) => pKaValue + Math.log10(Cbase / Cacid);

/**
 * Titration curve. analyte: {families, cat, an} per litre at concentration 1 scaled by C0;
 * we pass a builder (V0 mL, Vt mL) -> solution.
 * Returns points [{v, pH}] for v in [0, vmax].
 */
export function curve(build, vmax, n = 400, extra = []) {
  const vs = new Set();
  for (let i = 0; i <= n; i++) vs.add(+(vmax * i / n).toFixed(4));
  for (const v of extra) if (v >= 0 && v <= vmax) vs.add(+v.toFixed(4));
  return [...vs].sort((a, b) => a - b).map((v) => ({ v, pH: solvePH(build(v)).pH }));
}
