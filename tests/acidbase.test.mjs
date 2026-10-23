// Acid–base calculations against the worked numbers of OpenStax Chemistry 2e
// (sections 14.3, 14.5, 14.6, 14.7). The page shows the textbook route and the
// exact charge-balance answer; both are tested here.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FAMILIES, KW, REAGENTS, famById, pairs, speciesList } from '../site/acidbase/js/data.js';
import { alphas, solvePH, pKa } from '../site/acidbase/js/equilibrium.js';
import { phRoute, buffer, titration, titrationSteps, protonTransfer, conjugates, region } from '../site/acidbase/js/model.js';

const near = (a, b, tol, msg) => assert.ok(Math.abs(a - b) <= tol, `${msg}: got ${a}, expected ${b} ± ${tol}`);

// OpenStax Table 14.2: 25.00 mL of 0.100 M HCl or CH3CO2H titrated with 0.100 M NaOH.
// [mL, pH HCl, pH CH3CO2H]
const TABLE_14_2 = [
  [0.0, 1.00, 2.87], [5.0, 1.18, 4.14], [10.0, 1.37, 4.57], [15.0, 1.60, 4.92], [20.0, 1.95, 5.35],
  [22.0, 2.20, 5.61], [24.0, 2.69, 6.13], [24.5, 3.00, 6.44], [24.9, 3.70, 7.14], [25.0, 7.00, 8.72],
  [25.1, 10.30, 10.30], [25.5, 11.00, 11.00], [26.0, 11.29, 11.29], [28.0, 11.75, 11.75], [30.0, 11.96, 11.96],
  [35.0, 12.22, 12.22], [40.0, 12.36, 12.36], [45.0, 12.46, 12.46], [50.0, 12.52, 12.52],
];

test('Table 14.2: exact titration curves within 0.02 pH unit', () => {
  // The book uses approximations (x is small, Henderson–Hasselbalch, excess base only);
  // the exact charge balance agrees within 0.01 everywhere (2.875 vs 2.87 at the start).
  const hcl = titration({ analyte: 'HCl', Ca: 0.1, Va: 25, titrant: 'base', Ct: 0.1 });
  const ac = titration({ analyte: 'acetic', Ca: 0.1, Va: 25, titrant: 'base', Ct: 0.1 });
  for (const [v, a, b] of TABLE_14_2) {
    near(hcl.pHAt(v), a, 0.02, `HCl at ${v} mL`);
    near(ac.pHAt(v), b, 0.02, `acetic acid at ${v} mL`);
  }
});

test('Examples 14.21 and 14.22: key points by the textbook route', () => {
  const ac = titration({ analyte: 'acetic', Ca: 0.1, Va: 25, titrant: 'base', Ct: 0.1 });
  const k = Object.fromEntries(ac.keyPoints.map((r) => [r.id, r]));
  near(k.start.pH, 2.87, 0.005, '14.22 (a) 0.00 mL'); // x is small
  assert.equal(k.start.method, 'x-small');
  near(k.half.pH, 4.74, 0.005, '14.22 (c) 12.50 mL, Henderson–Hasselbalch');
  near(k.half.exact, 4.745, 0.003, 'exact at half-equivalence (dilution and water make it 4.745, shown as 4.75)');
  near(k.eq.pH, 8.72, 0.005, '14.22 (b) 25.00 mL');
  near(k.eq.x, 5.3e-6, 0.05e-6, '14.22 (b) [OH-]');
  near(k.excess.pH, 12.30, 0.005, '14.22 (d) 37.50 mL');
  const hcl = titration({ analyte: 'HCl', Ca: 0.1, Va: 25, titrant: 'base', Ct: 0.1 });
  const s = Object.fromEntries(hcl.keyPoints.map((r) => [r.id, r]));
  near(s.start.pH, 1.000, 0.0005, '14.21 (a)');
  near(s.half.c, 0.0333, 0.00005, '14.21 (b) [H3O+]');
  near(s.eq.pH, 7.00, 1e-9, '14.21 (c)');
  near(s.excess.c, 0.0200, 1e-6, '14.21 (d) [OH-]');
  near(s.excess.pH, 12.30, 0.005, '14.21 (d)');
});

test('Examples 14.21 and 14.22, check your learning (50.0 mL of 0.100 M acid, 0.200 M NaOH)', () => {
  const hno3 = titration({ analyte: 'HNO3', Ca: 0.1, Va: 50, titrant: 'base', Ct: 0.2 });
  near(hno3.pHAt(0), 1.000, 0.0005, 'HNO3 0 mL');
  near(hno3.pHAt(15), 1.5111, 0.001, 'HNO3 15.0 mL'); // (5.00 - 3.00) mmol / 65.0 mL gives 1.5119; the book prints 1.5111
  near(hno3.pHAt(25), 7.00, 0.005, 'HNO3 25.0 mL');
  near(hno3.pHAt(40), 12.523, 0.0005, 'HNO3 40.0 mL');
  const hcooh = titration({ analyte: 'formic', Ca: 0.1, Va: 50, titrant: 'base', Ct: 0.2 });
  near(hcooh.keyPoints[0].pH, 2.37, 0.005, 'HCOOH 0 mL, x is small (4.2 % ionized)');
  near(hcooh.pHAt(0), 2.38, 0.005, 'HCOOH 0 mL, exact');
  near(hcooh.pHAt(15), 3.92, 0.01, 'HCOOH 15.0 mL');
  near(hcooh.pHAt(25), 8.29, 0.01, 'HCOOH 25.0 mL');
  near(hcooh.pHAt(30), 12.097, 0.001, 'HCOOH 30.0 mL');
});

test('section 14.3 worked examples: weak acids and bases', () => {
  let r = phRoute('formic', 0.534); // Example 14.12
  assert.equal(r.type, 'weak-acid');
  assert.ok(r.ap.valid);
  near(r.x, 0.0098, 0.00005, '14.12 [H3O+]');
  near(r.pHText, 2.01, 0.005, '14.12 pH');
  r = phRoute('acetic', 0.1); // 14.12 check your learning: 1.3 %
  near(r.ap.pct, 1.3, 0.05, 'acetic acid percent ionization');
  r = phRoute('trimethylamine', 0.25); // Example 14.13
  assert.equal(r.type, 'weak-base');
  near(r.x, 4.0e-3, 0.05e-3, '14.13 [OH-]');
  near(r.pOH, 2.40, 0.005, '14.13 pOH');
  near(r.pHText, 11.60, 0.005, '14.13 pH');
  r = phRoute('NaHSO4', 0.5); // Example 14.14: the 5 % check fails, quadratic
  assert.equal(r.ap.valid, false);
  near(r.ap.pct, 15, 1, '14.14 x is about 15 % of C');
  near(r.x, 0.072, 0.0005, '14.14 [H3O+]');
  near(r.pHText, 1.14, 0.006, '14.14 pH');
});

test('section 14.5: polyprotic acids', () => {
  const r = phRoute('carbonic', 0.033); // Example 14.19
  assert.ok(r.polyOk);
  near(r.x, 1.2e-4, 0.05e-4, '14.19 [H3O+]');
  const sp = Object.fromEntries((() => { const out = []; const h = r.exact.h; const a = alphas(h, r.fam.Ka); r.fam.forms.forEach((f, j) => out.push([f, 0.033 * a[j]])); return out; })());
  near(sp['CO3^2-'] / 4.7e-11, 1, 0.03, '14.19 [CO3 2-] equals Ka2');
  const s = phRoute('h2s', 0.1); // check your learning
  near(s.x, 0.000094, 0.0000005, 'H2S [H3O+]');
  const h2so4 = famById.get('hso4');
  assert.equal(h2so4.Ka[0], 1.2e-2);
});

test('Example 14.20: acetate buffer, then 1.0 mL of 0.10 M NaOH', () => {
  const b = buffer({ fam: 'acetic', j: 0, Ca: 0.1, Cb: 0.1, V: 100, add: { kind: 'base', C: 0.1, V: 1 } });
  near(b.before.pHHH, 4.74, 0.005, '(a)');
  near(b.after.Ca, 0.098, 0.0005, '(b) [CH3CO2H]');
  near(b.after.Cb, 0.100, 0.0005, '(b) [CH3CO2-]');
  near(b.after.pHHH, 4.75, 0.005, '(b)');
  near(b.after.exact.pH, 4.75, 0.005, '(b) exact');
  near(b.after.unbuffered.pH, 10.99, 0.005, '(c) unbuffered');
  const a = buffer({ fam: 'acetic', j: 0, Ca: 0.1, Cb: 0.1, V: 100, add: { kind: 'acid', C: 0.1, V: 1 } });
  near(a.after.unbuffered.pH, 3.00, 0.005, 'check your learning: 4.74 to 3.00');
  assert.ok(b.before.hhValid.small && b.before.hhValid.inRange);
  const thin = buffer({ fam: 'acetic', j: 0, Ca: 0.1, Cb: 0.005, V: 100 });
  assert.equal(thin.before.hhValid.inRange, false);
});

test('titration steps and equivalence points', () => {
  assert.deepEqual(titrationSteps('HCl', 'base').map((s) => s.kind), ['strong']);
  assert.deepEqual(titrationSteps('H2SO4', 'base').map((s) => s.kind), ['strong', 'weak']);
  assert.equal(titrationSteps('phosphoric', 'base').length, 3);
  assert.equal(titrationSteps('Na2CO3', 'acid').length, 2);
  assert.equal(titrationSteps('CaOH2', 'acid')[0].equiv, 2);
  assert.equal(titrationSteps('NaCl', 'base').length, 0);
  const p = titration({ analyte: 'phosphoric', Ca: 0.1, Va: 25, titrant: 'base', Ct: 0.1 });
  assert.deepEqual(p.eqs.map((e) => e.v), [25, 50, 75]);
  assert.deepEqual(p.eqs.map((e) => e.visible), [true, true, false]); // HPO4 2- is too weak an acid
  near(p.halves[1].pH, pKa(6.2e-8), 0.02, 'second half-equivalence: pH = pKa2');
  const s = titration({ analyte: 'H2SO4', Ca: 0.1, Va: 25, titrant: 'base', Ct: 0.1 });
  assert.deepEqual(s.eqs.map((e) => e.visible), [false, true]); // HSO4- is too strong to show a first jump
  const ac = titration({ analyte: 'acetic', Ca: 0.1, Va: 25, titrant: 'base', Ct: 0.1 });
  assert.equal(region(ac, 0).id, 'start');
  assert.equal(region(ac, 12.5).id, 'buffer');
  assert.equal(region(ac, 1).id, 'between');
  assert.equal(region(ac, 25).id, 'equivalence');
  assert.equal(region(ac, 40).id, 'excess');
  const nh3 = titration({ analyte: 'ammonia', Ca: 0.1, Va: 25, titrant: 'acid', Ct: 0.1 });
  near(nh3.halves[0].pH, pKa(KW / 1.8e-5), 0.01, 'ammonia with HCl: half-equivalence at pKa of NH4+');
  assert.ok(nh3.eqs[0].pH < 7);
});

test('constants: pKa, Ka × Kb = Kw, fractions add to one', () => {
  for (const f of FAMILIES) {
    for (const K of f.Ka) assert.ok(K > 0 && K < 1, `${f.id} Ka`);
    for (let j = 1; j < f.Ka.length; j++) assert.ok(f.Ka[j] < f.Ka[j - 1], `${f.id}: successive Ka decrease`);
    if (f.Kb) near(f.Ka[0] * f.Kb, KW, 1e-20, `${f.id} Ka × Kb`);
    assert.equal(f.forms.length, f.Ka.length + 1);
    assert.equal(f.names.length, f.forms.length);
    for (const pH of [0, 3.3, 7, 10.1, 14]) near(alphas(10 ** -pH, f.Ka).reduce((a, b) => a + b, 0), 1, 1e-12, `${f.id} alphas at ${pH}`);
  }
  near(pKa(1.8e-5), 4.74, 0.005, 'acetic acid pKa');
  near(famById.get('ammonia').Ka[0], 5.6e-10, 0.05e-10, 'Ka of NH4+ from Kb of NH3 (14.8 check your learning)');
  assert.equal(pairs().length, FAMILIES.reduce((s, f) => s + f.Ka.length, 0));
  for (const r of REAGENTS) {
    const x = phRoute(r.id, 0.1);
    assert.ok(Number.isFinite(x.exact.pH) && x.exact.pH > -1 && x.exact.pH < 15, `${r.id} exact pH`);
  }
  near(solvePH({ families: [] }).pH, 7, 1e-9, 'pure water');
});

test('which way a proton transfer lies', () => {
  const list = speciesList();
  const sp = (key) => list.find((s) => s.key === key);
  // HA + H2O: K = Ka; B + H2O: K = Kb; H3O+ + OH-: 1/Kw
  let r = protonTransfer(sp('acetic:0'), sp('H2O'));
  near(r.K, 1.8e-5, 1e-12, 'acetic acid + water');
  r = protonTransfer(sp('H2O'), sp('ammonia:1'));
  near(r.K, 1.8e-5, 1e-12, 'water + ammonia gives Kb');
  r = protonTransfer(sp('H3O+'), sp('OH-'));
  near(r.logK, 14, 1e-9, 'H3O+ + OH-');
  r = protonTransfer(sp('acetic:0'), sp('ammonia:1'));
  near(r.K, 1.8e-5 / (KW / 1.8e-5), 1e-3, 'acetic acid + ammonia');
  assert.equal(protonTransfer(sp('strong:HCl'), sp('H2O')).kind, 'strong');
  assert.deepEqual(conjugates(sp('acetic:0'), sp('ammonia:1')), { conjBase: 'CH3COO-', conjAcid: 'NH4+' });
  assert.deepEqual(conjugates(sp('strong:HCl'), sp('H2O')), { conjBase: 'Cl-', conjAcid: 'H3O+' });
});
