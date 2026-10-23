// Formula parser: what people type, charges, ambiguous digits, display.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseFormula, hill, speciesUnicode, canonical } from '../site/assets/chem/formula.js';
import { valence, el } from '../site/assets/chem/elements.js';

const p = (s) => parseFormula(s);
const counts = (s) => Object.fromEntries(p(s).counts);

test('neutral molecules and groups', () => {
  assert.deepEqual(counts('H2O'), { H: 2, O: 1 });
  assert.deepEqual(counts('Ca(OH)2'), { Ca: 1, O: 2, H: 2 });
  assert.deepEqual(counts('CH3COOH'), { C: 2, H: 4, O: 2 });
  assert.deepEqual(counts('(NH4)2SO4'), { N: 2, H: 8, S: 1, O: 4 });
  assert.deepEqual(counts('CO(NH2)2'), { C: 1, O: 1, N: 2, H: 4 });
  assert.equal(p('H2O').charge, 0);
});

test('charges written in every usual way', () => {
  for (const s of ['SO4^2-', 'SO4 2-', 'SO₄²⁻', 'SO4^-2', 'SO4--', 'SO4^(2-)', 'SO42-']) assert.equal(p(s).charge, -2, s);
  assert.equal(p('NH4+').charge, 1);
  assert.equal(p('MnO4-').charge, -1);
  assert.equal(p('MnO4−').charge, -1); // real minus sign
  assert.equal(p('Fe3+').charge, 3);
  assert.equal(p('Fe3+').counts.get('Fe'), 1);
  assert.equal(p('Cr2O72-').charge, -2);
  assert.equal(p('Cr2O72-').counts.get('O'), 7);
  assert.equal(p('[Fe(CN)6]3-').charge, -3);
  assert.equal(p('[NH4]+').charge, 1);
  assert.equal(p('[NH4]+').tree.length, 2); // the brackets only enclose the ion
  assert.equal(p('Cl- (aq)').charge, -1);
});

test('ambiguous digit before the sign is reported', () => {
  const n3 = p('N3-'); // nitride N^3- by the 8 - valence rule; azide offered as the alternative
  assert.equal(n3.charge, -3);
  assert.equal(n3.guessed, true);
  assert.equal(n3.alt, 'N3^-');
  const i3 = p('I3-'); // triiodide: 3- is not the usual charge of iodine
  assert.equal(i3.charge, -1);
  assert.equal(i3.counts.get('I'), 3);
  assert.equal(p('SO42-').guessed, true);
  assert.equal(p('SO4^2-').guessed, false);
  assert.equal(p('O2^-').charge, -1); // superoxide
  assert.equal(p('O^2-').charge, -2); // oxide
});

test('errors have codes', () => {
  const code = (s) => { try { parseFormula(s); return null; } catch (e) { return e.code; } };
  assert.equal(code(''), 'empty');
  assert.equal(code('h2o'), 'lowercase');
  assert.equal(code('Xx2'), 'unknown-element');
  assert.equal(code('Ca(OH2'), 'unbalanced');
  assert.equal(code('2H2O'), 'coefficient');
  assert.equal(code('CuSO4·5H2O'), 'hydrate');
});

test('Hill order, canonical text and display', () => {
  assert.equal(hill(p('CH3COOH').counts), 'C2H4O2');
  assert.equal(hill(p('H2SO4').counts), 'H2O4S');
  assert.equal(canonical('SO4', -2), 'SO4^2-');
  assert.equal(canonical('O2', -1), 'O2^-');
  assert.equal(canonical('NH4', 1), 'NH4^+');
  assert.equal(speciesUnicode('SO4^2-'), 'SO₄²⁻');
  assert.equal(speciesUnicode('MnO4-'), 'MnO₄⁻');
  assert.equal(speciesUnicode('Fe^3+'), 'Fe³⁺');
});

test('valence electrons from the group (main-group elements only)', () => {
  assert.equal(valence('H'), 1);
  assert.equal(valence('He'), 2);
  assert.equal(valence('C'), 4);
  assert.equal(valence('Xe'), 8);
  assert.equal(valence('Al'), 3);
  assert.equal(valence('Fe'), null);
  assert.equal(el('O').pauling, 3.44); // PubChem table
});
