// Oxidation numbers. Expected values:
// - OpenStax Chemistry 2e, 4.2: guidelines and Example 4.5 (H2S, SO3^2-, Na2SO4)
//   with its Check Your Learning (KNO3, AlH3, NH4+, H2PO4-), Example 4.7 (Cr2O7^2-, Fe^2+/Fe^3+);
// - OpenStax 20.3: carbon series CH4 -4, CH3OH -2, HCHO 0, HCOOH +2, CO2 +4;
// - IUPAC 2016 (Karen, McArdle, Takats), 5.3: thiosulfate central S +5, terminal S -1,
//   average +2; 5.4: I3- and N3- spread the charge over equivalent atoms.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { oxidation, byRules, fval, fmtOx, frac, stripCations } from '../site/assets/chem/oxnum.js';
import { parseFormula } from '../site/assets/chem/formula.js';

const ox = (s) => {
  const r = oxidation(s);
  assert.ok(r.ok, `${s} parses`);
  return Object.fromEntries(r.items.map((it) => [it.el, it.value === null ? null : fval(it.value)]));
};
const rule = (s, e) => oxidation(s).items.find((it) => it.el === e).rule;

test('OpenStax guidelines: elements, monatomic ions, F, O, H', () => {
  assert.deepEqual(ox('Cl2'), { Cl: 0 });
  assert.deepEqual(ox('O3'), { O: 0 });
  assert.equal(rule('Cl2', 'Cl'), 'elemental');
  assert.deepEqual(ox('Fe^3+'), { Fe: 3 });
  assert.equal(rule('Fe^3+', 'Fe'), 'monatomic');
  assert.deepEqual(ox('S^2-'), { S: -2 });
  assert.equal(ox('HF').F, -1);
  assert.equal(ox('H2O').O, -2);
  assert.equal(ox('H2O').H, 1);
});

test('OpenStax Example 4.5 and its Check Your Learning', () => {
  assert.equal(ox('H2S').S, -2);
  assert.equal(ox('SO3^2-').S, 4);
  assert.deepEqual(ox('Na2SO4'), { Na: 1, S: 6, O: -2 });
  assert.equal(ox('KNO3').N, 5);
  assert.equal(ox('AlH3').Al, 3);
  assert.equal(ox('AlH3').H, -1);
  assert.equal(ox('NH4+').N, -3);
  assert.equal(ox('H2PO4-').P, 5);
});

test('OpenStax Example 4.7 species', () => {
  assert.equal(ox('Cr2O7^2-').Cr, 6);
  assert.equal(ox('Cr^3+').Cr, 3);
  assert.equal(ox('MnO4-').Mn, 7);
});

test('carbon series (OpenStax 20.3)', () => {
  assert.equal(ox('CH4').C, -4);
  assert.equal(ox('CH3OH').C, -2);
  assert.equal(ox('HCHO').C, 0);
  assert.equal(ox('HCOOH').C, 2);
  assert.equal(ox('CO2').C, 4);
});

test('oxygen exceptions: peroxide, superoxide, OF2', () => {
  assert.equal(ox('H2O2').O, -1);
  assert.equal(rule('H2O2', 'O'), 'O-peroxide');
  assert.equal(ox('Na2O2').O, -1);
  assert.equal(ox('KO2').O, -0.5);
  assert.equal(rule('KO2', 'O'), 'O-superoxide');
  assert.ok(oxidation('KO2').flags.includes('average'));
  assert.deepEqual(ox('OF2'), { O: 2, F: -1 });
  assert.equal(rule('OF2', 'O'), 'O-positive');
});

test('hydrides: H is -1 with metals', () => {
  assert.deepEqual(ox('NaH'), { Na: 1, H: -1 });
  assert.deepEqual(ox('CaH2'), { Ca: 2, H: -1 });
  assert.equal(ox('LiAlH4').H, -1);
  assert.equal(ox('LiAlH4').Al, 3);
  assert.equal(rule('NaH', 'H'), 'H-metal');
});

test('halogens: -1 unless with oxygen or a more electronegative halogen', () => {
  assert.equal(ox('HCl').Cl, -1);
  assert.equal(ox('HClO4').Cl, 7);
  assert.equal(ox('ClO-').Cl, 1);
  assert.equal(ox('ClF3').Cl, 3);
  assert.equal(ox('IF5').I, 5);
});

test('averages: Fe3O4 +8/3 with the per-atom values +2, +3, +3', () => {
  const r = oxidation('Fe3O4');
  assert.equal(fmtOx(r.items.find((it) => it.el === 'Fe').value), '+8/3');
  assert.deepEqual(r.perAtom.values.map(fval).sort(), [2, 3, 3]);
  assert.equal(r.perAtom.from, 'source');
});

test('IUPAC 2016: thiosulfate central S +5, terminal S -1, average +2', () => {
  const r = oxidation('S2O3^2-');
  assert.equal(ox('S2O3^2-').S, 2);
  assert.deepEqual(r.perAtom.values.map(fval), [5, -1]);
  const salt = oxidation('Na2S2O3'); // through the anion once Na+ is taken off
  assert.deepEqual(salt.perAtom.values.map(fval), [5, -1]);
  assert.equal(ox('Na2S2O3').Na, 1);
});

test('tetrathionate: +5, 0, 0, +5 (average +5/2)', () => {
  const r = oxidation('S4O6^2-');
  assert.equal(fmtOx(r.items.find((it) => it.el === 'S').value), '+5/2');
  assert.deepEqual(r.perAtom.values.map(fval), [5, 0, 0, 5]);
});

test('peroxodisulfate: the rules give S +7 (impossible), the structure S +6 and a peroxide bridge', () => {
  const r = oxidation('S2O8^2-');
  assert.equal(ox('S2O8^2-').S, 7);
  assert.ok(r.flags.includes('exceeds-max-peroxo'));
  assert.deepEqual(r.perAtom.values.map(fval).sort((a, b) => a - b), [-2, -2, -2, -2, -2, -2, -1, -1]);
  assert.deepEqual(r.disagree.map((d) => [d.el, fval(d.rule), fval(d.structure)]), [['S', 7, 6]]);
});

test('acetic acid: the two carbons differ (-3 and +3), average 0', () => {
  const r = oxidation('CH3COOH');
  assert.equal(ox('CH3COOH').C, 0);
  assert.equal(r.perAtom.el, 'C');
  assert.deepEqual(r.perAtom.values.map(fval), [-3, 3]);
});

test('one-element ions: I3- and the azide ion give averages', () => {
  assert.equal(fmtOx(oxidation('I3-').items[0].value), '−1/3');
  assert.equal(fmtOx(oxidation('N3^-').items[0].value), '−1/3');
  assert.ok(oxidation('I3-').flags.includes('average'));
});

test('salts of two polyatomic ions are split', () => {
  const r = oxidation('NH4NO3');
  assert.equal(r.kind, 'ions');
  const n = r.ions.map((i) => fval(i.items.find((it) => it.el === 'N').value));
  assert.deepEqual(n, [-3, 5]);
  assert.equal(oxidation('(NH4)2SO4').ions.length, 3);
});

test('electronegativity scales disagree: NCl3 and PH3 are flagged', () => {
  const ncl3 = oxidation('NCl3');
  assert.equal(ox('NCl3').N, 3); // textbook rule: Cl -1
  assert.deepEqual(ncl3.disagree.map((d) => [d.el, fval(d.structure)]), [['N', -3], ['Cl', 1]]); // Allen: N > Cl
  const ph3 = oxidation('PH3');
  assert.equal(ox('PH3').P, -3);
  assert.ok(ph3.flags.includes('h-close'));
});

test('several unknown elements: the structure decides (HCN, SCN-)', () => {
  assert.deepEqual(ox('HCN'), { H: 1, C: 2, N: -3 });
  const r = oxidation('SCN-');
  assert.ok(r.flags.includes('from-structure'));
  assert.deepEqual(ox('SCN-'), { S: -2, C: 4, N: -3 });
});

test('hydroxides used in the basic couples', () => {
  assert.equal(ox('Mn(OH)2').Mn, 2);
  assert.equal(ox('Co(OH)3').Co, 3);
  assert.equal(ox('Cr(OH)3').Cr, 3);
  assert.equal(ox('CrO4^2-').Cr, 6);
  assert.equal(ox('NiO2').Ni, 4);
});

test('sum of oxidation numbers equals the charge', () => {
  for (const s of ['MnO4-', 'Cr2O7^2-', 'SO4^2-', 'NH4+', 'H2PO4-', 'C6H12O6', 'KO2', 'Fe3O4', 'S4O6^2-']) {
    const r = byRules(parseFormula(s));
    assert.equal(fval(r.sum), parseFormula(s).charge, s);
    assert.ok(!r.flags.includes('inconsistent'), s);
  }
});

test('helpers', () => {
  assert.equal(fmtOx(frac(7)), '+7');
  assert.equal(fmtOx(frac(-1, 2)), '−1/2');
  assert.equal(fmtOx(frac(0)), '0');
  const a = stripCations(parseFormula('K2Cr2O7'));
  assert.equal(a.charge, -2);
  assert.equal(stripCations(parseFormula('H2O')), null);
});
