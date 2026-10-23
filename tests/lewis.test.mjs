// Lewis engine against the textbook cases of OpenStax Chemistry 2e,
// sections 7.3 (procedure, octet exceptions), 7.4 (formal charges and
// resonance) and 7.6 (VSEPR shapes).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analyse, countValence } from '../site/assets/chem/lewis.js';
import { parseFormula } from '../site/assets/chem/formula.js';

const L = (f, opts) => { const r = analyse(f, opts); assert.ok(r.ok, `${f}: ${r.error || r.refusal}`); return r; };
const els = (r) => r.best.sk.atoms.map((a) => a.el);
/** Bond orders between element pairs, sorted: 'C=O', 'C-H'... */
const bonds = (s) => s.sk.edges.map(([a, b], k) => {
  const [x, y] = [s.sk.atoms[a].el, s.sk.atoms[b].el].sort();
  return `${x}${['', '-', '=', '#'][s.orders[k]]}${y}`;
}).sort();
const fcOf = (s, e) => s.sk.atoms.map((a, i) => (a.el === e ? s.fc[i] : null)).filter((x) => x !== null).sort((a, b) => a - b);
const lonePairs = (s, e) => s.sk.atoms.map((a, i) => (a.el === e ? s.lone[i] / 2 : null)).filter((x) => x !== null).sort();

test('valence electron count, charge included', () => {
  const v = (f) => { const p = parseFormula(f); return countValence(p.counts, p.charge).total; };
  assert.equal(v('H2O'), 8);
  assert.equal(v('CO2'), 16);
  assert.equal(v('NH4+'), 8);
  assert.equal(v('SO4^2-'), 32);
  assert.equal(v('NO3-'), 24);
  assert.equal(v('XeF4'), 36);
  assert.equal(v('ClO2'), 19);
});

test('simple molecules (OpenStax 7.3)', () => {
  let r = L('H2O');
  assert.deepEqual(bonds(r.best), ['H-O', 'H-O']);
  assert.deepEqual(lonePairs(r.best, 'O'), [2]);
  assert.equal(r.vsepr.shape, 'bent-109');
  r = L('CO2');
  assert.deepEqual(bonds(r.best), ['C=O', 'C=O']);
  assert.equal(r.vsepr.shape, 'linear');
  r = L('HCN');
  assert.deepEqual(bonds(r.best), ['C#N', 'C-H']);
  r = L('N2');
  assert.deepEqual(bonds(r.best), ['N#N']);
  r = L('NH3');
  assert.equal(r.vsepr.shape, 'trigonal-pyramidal');
  r = L('CH2O');
  assert.deepEqual(bonds(r.best), ['C-H', 'C-H', 'C=O']);
  r = L('C2H2');
  assert.deepEqual(bonds(r.best), ['C#C', 'C-H', 'C-H']);
});

test('formal charges pick the structure (OpenStax 7.4)', () => {
  // CO2: O=C=O (all zero) rather than C at the end
  let r = L('CO2');
  assert.equal(r.best.sk.atoms[r.best.sk.centre].el, 'C');
  assert.deepEqual(r.best.fc, [0, 0, 0]);
  // SCN-: the negative charge on N, the most electronegative atom
  r = L('SCN-');
  assert.deepEqual(bonds(r.best), ['C=N', 'C=S']);
  assert.deepEqual(fcOf(r.best, 'N'), [-1]);
  assert.deepEqual(fcOf(r.best, 'S'), [0]);
  // N2O: N-N-O, the negative charge on O
  r = L('N2O');
  assert.equal(r.best.sk.atoms[r.best.sk.centre].el, 'N');
  assert.deepEqual(fcOf(r.best, 'O'), [-1]);
  // CO: a triple bond, -1 on C and +1 on O
  r = L('CO');
  assert.deepEqual(bonds(r.best), ['C#O']);
  assert.deepEqual(fcOf(r.best, 'C'), [-1]);
  assert.deepEqual(fcOf(r.best, 'O'), [1]);
  // NH4+: +1 on N
  assert.deepEqual(fcOf(L('NH4+').best, 'N'), [1]);
});

test('resonance forms (OpenStax 7.4)', () => {
  assert.equal(L('NO2-').resonance.length, 2);
  assert.equal(L('CO3^2-').resonance.length, 3);
  assert.equal(L('NO3-').resonance.length, 3);
  assert.equal(L('O3').resonance.length, 2);
  assert.equal(L('HCOO-').resonance.length, 2);
  assert.equal(L('H2O').resonance.length, 1);
});

test('octet exceptions (OpenStax 7.3)', () => {
  // odd-electron molecules
  assert.ok(L('NO').exceptions.includes('odd'));
  const no2 = L('NO2');
  assert.ok(no2.exceptions.includes('odd'));
  assert.equal(no2.best.lone[no2.best.sk.centre], 1); // the unpaired electron on N
  // electron-deficient: B and Be
  let r = L('BF3');
  assert.ok(r.exceptions.includes('incomplete'));
  assert.deepEqual(bonds(r.best), ['B-F', 'B-F', 'B-F']);
  assert.ok(L('BeCl2').exceptions.includes('incomplete'));
  // hypervalent: required
  for (const [f, shape] of [['PCl5', 'trigonal-bipyramidal'], ['SF6', 'octahedral'], ['XeF4', 'square-planar'], ['XeF2', 'linear'], ['ClF3', 't-shaped'], ['BrCl3', 't-shaped'], ['ICl4-', 'square-planar'], ['SeF4', 'seesaw'], ['IF5', 'square-pyramidal']]) {
    r = L(f);
    assert.ok(r.exceptions.includes('expanded-required'), f);
    assert.equal(r.vsepr.shape, shape, f);
  }
  // ICl4-: the charge sits on I (OpenStax 7.4 example)
  assert.deepEqual(fcOf(L('ICl4-').best, 'I'), [-1]);
  // optional: formal charges prefer S=O bonds, an octet structure exists as well
  r = L('SO4^2-');
  assert.ok(r.exceptions.includes('expanded-optional'));
  assert.ok(r.octetAlt);
  assert.deepEqual(r.octetAlt.fc.slice().sort(), [-1, -1, -1, -1, 2].sort());
});

test('condensed formulas keep the written connectivity', () => {
  let r = L('CH3COOH');
  assert.deepEqual(bonds(r.best), ['C-C', 'C-H', 'C-H', 'C-H', 'C-O', 'C=O', 'H-O']);
  r = L('CH3OCH3');
  assert.deepEqual(bonds(r.best).filter((b) => b.includes('O')), ['C-O', 'C-O']);
  r = L('CH3CH2OH');
  assert.deepEqual(bonds(r.best).filter((b) => b.includes('O')), ['C-O', 'H-O']);
  // a carboxyl group written first is HOOC-, not H-O-O-C
  r = L('HOOCCOOH');
  assert.deepEqual(bonds(r.best).filter((b) => !b.includes('H')), ['C-C', 'C-O', 'C-O', 'C=O', 'C=O']);
  r = L('CO(NH2)2');
  assert.deepEqual(bonds(r.best).filter((b) => !b.includes('H')), ['C-N', 'C-N', 'C=O']);
});

test('curated skeletons', () => {
  // H3PO3: one H on P (diprotic acid)
  const r = L('H3PO3');
  assert.deepEqual(bonds(r.best).filter((b) => b.includes('H')), ['H-O', 'H-O', 'H-P']);
  // thiosulfate: S-S bond
  assert.ok(bonds(L('S2O3^2-').best).some((b) => /^S.S$/.test(b)));
  // peroxodisulfate: O-O bond
  assert.ok(bonds(L('S2O8^2-').best).includes('O-O'));
});

test('ambiguous formulas and refusals', () => {
  let r = analyse('C2H6O');
  assert.equal(r.refusal, 'isomers');
  assert.equal(r.detail.options.length, 2);
  // choosing one skeleton gives its structure
  const pick = r.detail.options.find((o) => o.structure.sk.atoms.filter((a) => a.el === 'O').length === 1 && o.canon.includes('O(H()'))?.canon;
  assert.ok(pick);
  const e = analyse('C2H6O', { pick });
  assert.ok(e.ok);
  assert.ok(bonds(e.best).includes('H-O'));
  assert.equal(analyse('FeCl3').refusal, 'transition-metal');
  assert.equal(analyse('NaCl').refusal, 'ionic');
  assert.equal(analyse('B2H6').refusal, 'borane');
  assert.equal(analyse('h2o').error, 'lowercase');
});

test('monatomic species: Lewis symbols', () => {
  const r = L('Cl-');
  assert.equal(r.best.lone[0], 8);
  assert.equal(L('C').best.lone[0], 4);
  assert.equal(L('Na+').best.lone[0], 0);
});

test('oxidation states per atom from the structure (IUPAC 2016)', () => {
  const os = (f) => { const r = L(f); return r.best.sk.atoms.map((a, i) => `${a.el}${r.oxidation.os[i]}`).sort(); };
  assert.deepEqual(os('H2O'), ['H1', 'H1', 'O-2']);
  assert.deepEqual(os('H2O2'), ['H1', 'H1', 'O-1', 'O-1']);
  assert.deepEqual(os('CH3COOH').filter((x) => x.startsWith('C')), ['C-3', 'C3']);
  // thiosulfate: central S +5, terminal S -1
  assert.deepEqual(os('S2O3^2-').filter((x) => x.startsWith('S')), ['S-1', 'S5']);
});
