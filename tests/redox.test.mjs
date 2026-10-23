// Half-reaction method. Expected equations:
// - every couple of the table balances to the half-reaction printed in its source
//   (OpenStax Appendix L, LibreTexts P1);
// - OpenStax Chemistry 2e, Example 4.7 (Cr2O7^2- + Fe^2+, acidic) and its
//   Check Your Learning (Cl2 + OH-, basic); Example 17.1 (Cu + HNO3, acidic,
//   with the NO2 variant) and Example 17.2 (MnO4- + Cr(OH)3, basic, with the
//   Br- variant).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUPLES, byId, couplesFor } from '../site/redox/js/couples.js';
import { balanceHalf, combine, thermo, parseEquation, normaliseTable, sameHalf, halfText, isBalanced, simplify, FARADAY } from '../site/redox/js/balance.js';

test('every couple balances to its tabulated half-reaction', () => {
  for (const c of COUPLES) {
    const medium = c.medium === 'any' ? 'acid' : c.medium;
    const r = balanceHalf(c.ox, c.red, { medium, viaAcid: c.viaAcid });
    const t = normaliseTable(parseEquation(c.table));
    assert.ok(sameHalf(r.half, t), `${c.id}: ${halfText(r.half)} vs ${halfText(t)}`);
    assert.ok(isBalanced(r.half), c.id);
  }
});

test('the table has unique ids and sensible potentials', () => {
  assert.equal(byId.size, COUPLES.length);
  for (const c of COUPLES) assert.ok(c.E > -3.1 && c.E < 3, c.id);
  assert.equal(byId.get('H').E, 0);
  assert.equal(byId.get('MnO4').E, 1.507);
  assert.equal(byId.get('Cr2O7').alt.E, 1.33);
});

test('couples offered by medium, strongest oxidant first', () => {
  const acid = couplesFor('acid');
  assert.ok(acid.every((c) => c.medium !== 'base'));
  assert.equal(acid[0].id, 'F2');
  const base = couplesFor('base');
  assert.ok(base.every((c) => c.medium === 'base'));
  for (let i = 1; i < acid.length; i++) assert.ok(acid[i - 1].E >= acid[i].E);
});

const reaction = (ox, red, medium) => {
  const a = balanceHalf(ox[0], ox[1], { medium });
  const b = balanceHalf(red[0], red[1], { medium });
  return combine(a.half, a.n, b.half, b.n);
};
const eq = (txt) => normaliseTable(parseEquation(txt));

test('the steps of a half-reaction, in order (MnO4- to Mn2+)', () => {
  const r = balanceHalf('MnO4-', 'Mn^2+');
  assert.deepEqual(r.steps.map((s) => s.id), ['skeleton', 'other-elements', 'oxygen', 'hydrogen', 'electrons']);
  assert.equal(r.steps[2].detail.water, 4);
  assert.equal(r.steps[3].detail.protons, 8);
  assert.equal(r.n, 5);
  assert.equal(halfText(r.half), 'MnO4- + 8H+ + 5e- -> Mn^2+ + 4H2O');
});

test('other elements first: Cr2O7^2- needs 2 Cr^3+', () => {
  const r = balanceHalf('Cr2O7^2-', 'Cr^3+');
  assert.deepEqual([r.steps[1].detail.a, r.steps[1].detail.b], [1, 2]);
  assert.equal(r.n, 6);
});

test('basic medium: OH- added to both sides, water formed, cancelled', () => {
  const r = balanceHalf('MnO4-', 'MnO2', { medium: 'base' });
  assert.deepEqual(r.steps.slice(-3).map((s) => s.id), ['base-add-oh', 'base-water', 'base-cancel']);
  assert.equal(r.steps.at(-3).detail.oh, 4);
  assert.ok(sameHalf(r.half, eq('MnO4- + 2H2O + 3e- -> MnO2 + 4OH-')));
});

test('OpenStax Example 4.7: dichromate and iron(II) in acid', () => {
  const k = reaction(['Cr2O7^2-', 'Cr^3+'], ['Fe^3+', 'Fe^2+'], 'acid');
  assert.ok(sameHalf(k.final, eq('6Fe^2+ + Cr2O7^2- + 14H+ -> 6Fe^3+ + 2Cr^3+ + 7H2O')));
  assert.equal(k.n, 6);
  assert.deepEqual([k.k1, k.k2], [1, 6]);
});

test('OpenStax Example 4.7, Check Your Learning: chlorine disproportionates in base', () => {
  const k = reaction(['Cl2', 'Cl-'], ['ClO3-', 'Cl2'], 'base');
  assert.ok(sameHalf(k.final, eq('3Cl2 + 6OH- -> 5Cl- + ClO3- + 3H2O')));
  assert.equal(k.g, 2);
  assert.equal(k.n, 5);
});

test('OpenStax Example 17.1: copper and dilute or concentrated nitric acid', () => {
  const dilute = reaction(['HNO3', 'NO'], ['Cu^2+', 'Cu'], 'acid');
  assert.ok(sameHalf(dilute.final, eq('3Cu + 6H+ + 2HNO3 -> 3Cu^2+ + 2NO + 4H2O')));
  const conc = reaction(['HNO3', 'NO2'], ['Cu^2+', 'Cu'], 'acid');
  assert.ok(sameHalf(conc.final, eq('Cu + 2H+ + 2HNO3 -> Cu^2+ + 2NO2 + 2H2O')));
});

test('OpenStax Example 17.2: permanganate with Cr(OH)3, then with bromide, in base', () => {
  const a = reaction(['MnO4-', 'MnO2'], ['CrO4^2-', 'Cr(OH)3'], 'base');
  assert.ok(sameHalf(a.final, eq('OH- + Cr(OH)3 + MnO4- -> CrO4^2- + MnO2 + 2H2O')));
  assert.equal(a.n, 3);
  const b = reaction(['MnO4-', 'MnO2'], ['BrO3-', 'Br-'], 'base');
  assert.ok(sameHalf(b.final, eq('H2O + 2MnO4- + Br- -> 2MnO2 + BrO3- + 2OH-')));
});

test('the water couple in base is balanced through H+ (2H2O + 2e- -> H2 + 2OH-)', () => {
  const c = byId.get('H2Ob');
  const r = balanceHalf(c.ox, c.red, { medium: 'base', viaAcid: c.viaAcid });
  assert.ok(sameHalf(r.half, eq('2H2O + 2e- -> H2 + 2OH-')));
});

test('not a reduction as written is refused', () => {
  assert.throws(() => balanceHalf('Fe^2+', 'Fe^3+'));
  assert.throws(() => balanceHalf('MnO4-', 'Cr^3+')); // Mn on one side only
});

test('thermodynamics at 25 °C: E°cell, ΔG° = −nFE°, K = 10^(nE°/0.0592)', () => {
  assert.equal(FARADAY, 96485);
  const t = thermo(2, 0.337, -0.7618); // Cu2+/Cu cathode, Zn2+/Zn anode
  assert.ok(Math.abs(t.E - 1.0988) < 1e-9);
  assert.ok(Math.abs(t.dG - (-2 * 96485 * 1.0988) / 1000) < 1e-9);
  assert.ok(Math.abs(t.log10K - (2 * 1.0988) / 0.0592) < 1e-9);
  const back = thermo(2, -0.7618, 0.337);
  assert.ok(back.E < 0 && back.dG > 0 && back.log10K < 0);
});

test('simplify keeps the difference on one side', () => {
  const h = simplify({ left: new Map([['H2O', 3], ['X', 1]]), right: new Map([['H2O', 1], ['Y', 1]]) });
  assert.equal(h.left.get('H2O'), 2);
  assert.equal(h.right.has('H2O'), false);
});
