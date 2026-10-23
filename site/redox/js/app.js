// Redox tab (mounted by assets/app.js): oxidation numbers shown on the formula, with the rule behind
// each value, and redox reactions balanced step by step (half-reaction
// method) in acidic or basic solution, with E°cell, ΔG° and K.
//
// Element ids (stable, used by scripts/e2e.mjs):
//   #ox-input   text input, the species        #ox-pick   select of common species
//   #ox-examples  example buttons               #ox-err    parse message
//   #ox-result  oxidation numbers and rules
//   #rx-mode    group of buttons [data-mode="table"|"own"]
//   #rx-medium  group of buttons [data-medium="acid"|"base"]
//   #rx-ox      select: couple of the oxidant (is reduced)
//   #rx-red     select: couple of the reductant (is oxidised)
//   #rx-o1 #rx-o2  own mode: oxidant couple (oxidised form, reduced form)
//   #rx-r1 #rx-r2  own mode: reductant couple (oxidised form, reduced form)
//   #rx-swap    swap the two couples               #rx-err    message
//   #rx-result  the annotated steps    #rx-final  final equation    #rx-ecell  E°cell value
// URL hash: #redox?sp=MnO4-&m=acid&ox=MnO4&red=Fe3        (table mode; + may be raw or %2B)
//           #redox?sp=MnO4-&m=acid&mode=own&o1=HNO3&o2=NO&r1=Cu^2+&r2=Cu
import { lang } from '../../assets/site.js';
import { h, fmtn, citer, species, fixed } from '../../assets/ui.js';
import { SOURCES, OPENSTAX_REF } from '../../assets/common.js';
import { parseFormula, FormulaError, speciesUnicode } from '../../assets/chem/formula.js';
import { el as elData, elName } from '../../assets/chem/elements.js';
import { oxidation, fval, fmtOx, limits } from '../../assets/chem/oxnum.js';
import { COUPLES, byId, couplesFor } from './couples.js';
import { balanceHalf, combine, thermo, parseEquation, reverse, FARADAY } from './balance.js';

const T = (en, fr) => (lang() === 'fr' ? fr : en);
const L = (o) => o?.[lang()] ?? o?.en ?? '';
const f = (v, d = 2) => fmtn(v, lang(), d);

// Sources in page order.
const SRC_IDS = ['openstax-ox', 'openstax-organic-ox', 'iupac-os', 'pubchem-pt', 'wp-fe3o4', 'wp-tetrathionate', 'wp-peroxydisulfate',
  'openstax-redox', 'openstax-e', 'lt-p1', 'wp-sep', 'openstax-cell', 'openstax-dg'];
const { cite, list } = citer(SRC_IDS.map((id) => ({ id, ...SOURCES[id] })));

// ---------------------------------------------------------------- state
const S = { sp: 'MnO4-', m: 'acid', mode: 'table', ox: 'MnO4', red: 'Fe3', o1: 'HNO3', o2: 'NO', r1: 'Cu^2+', r2: 'Cu' };
const DEFAULTS = { acid: { ox: 'MnO4', red: 'Fe3' }, base: { ox: 'MnO4b', red: 'CrO4b' } };

let ctx = null;
function readHash() {
  // a raw + in the hash is a charge, not a space
  const p = new URLSearchParams(ctx.query().replace(/\+/g, '%2B'));
  for (const k of Object.keys(S)) if (p.has(k)) S[k] = p.get(k);
  if (S.m !== 'base') S.m = 'acid';
  S.mode = p.get('mode') === 'own' ? 'own' : 'table';
  fixCouples();
}
function writeHash() {
  const p = new URLSearchParams();
  p.set('sp', S.sp); p.set('m', S.m);
  if (S.mode === 'own') { p.set('mode', 'own'); for (const k of ['o1', 'o2', 'r1', 'r2']) p.set(k, S[k]); } else { p.set('ox', S.ox); p.set('red', S.red); }
  ctx.save(p.toString().replace(/%5E/g, '^'));
}
/** Keep the selected couples valid for the medium. */
function fixCouples() {
  const ok = new Set(couplesFor(S.m).map((c) => c.id));
  if (!ok.has(S.ox)) S.ox = DEFAULTS[S.m].ox;
  if (!ok.has(S.red)) S.red = DEFAULTS[S.m].red;
}

// ---------------------------------------------------------------- messages
const PARSE_ERR = {
  empty: { en: 'Type a formula, for example MnO4- or Cr2O7^2-.', fr: 'Tapez une formule, par exemple MnO4- ou Cr2O7^2-.' },
  lowercase: { en: 'Element symbols start with a capital letter (Co is cobalt, CO carbon monoxide).', fr: 'Les symboles commencent par une majuscule (Co : cobalt, CO : monoxyde de carbone).' },
  'unknown-element': { en: 'Unknown element symbol: {sym}.', fr: 'Symbole d’élément inconnu : {sym}.' },
  unbalanced: { en: 'A bracket is not closed.', fr: 'Une parenthèse n’est pas fermée.' },
  'empty-group': { en: 'Empty brackets.', fr: 'Parenthèses vides.' },
  coefficient: { en: 'Type one species, without a coefficient in front.', fr: 'Tapez une seule espèce, sans coefficient devant.' },
  hydrate: { en: 'Hydrates (· H2O) are not read: type the salt alone.', fr: 'Les hydrates (· H2O) ne sont pas lus : tapez le sel seul.' },
  'bad-charge': { en: 'The charge is not readable. Write it at the end: SO4^2-, Fe^3+, NH4+.', fr: 'La charge est illisible. Écrivez-la à la fin : SO4^2-, Fe^3+, NH4+.' },
  'bad-char': { en: 'Unexpected character “{char}”.', fr: 'Caractère inattendu « {char} ».' },
  'bad-count': { en: 'A count of zero is not allowed.', fr: 'Un indice nul n’est pas permis.' },
};
const fill = (s, d = {}) => s.replace(/\{(\w+)\}/g, (_, k) => d[k] ?? '');
const parseMsg = (code, detail) => fill(L(PARSE_ERR[code] ?? { en: 'This formula cannot be read.', fr: 'Cette formule ne peut pas être lue.' }), detail);

const U = (s) => speciesUnicode(s);
const elN = (e) => elName(e, lang());
const ox = (v) => fmtOx(v);
const oxn = (x) => (x === 0 ? '0' : (x < 0 ? '−' : '+') + fmtn(Math.abs(x), lang(), 2));

// ---------------------------------------------------------------- formula with oxidation numbers
/**
 * A species as tokens with the oxidation number above each element.
 * values: Map el -> fraction (averages); perToken: optional array aligned with the
 * element tokens of the typed formula; change: Map el -> 'up'|'down'.
 */
function oxSpecies(parsed, values, { perToken = null, change = null, label } = {}) {
  let k = 0;
  const kids = [];
  const walk = (tree) => {
    for (const t of tree) {
      if (t.type === 'el') {
        const v = perToken?.[k] ?? values.get(t.el);
        k++;
        const cls = change?.get(t.el);
        kids.push(h('span', { class: 'ox-el' },
          h('span', { class: `on${cls ? ' ' + cls : ''}` }, v === undefined || v === null ? '?' : ox(v)),
          h('span', {}, t.el, t.n > 1 ? h('sub', {}, String(t.n)) : null)));
      } else {
        const [o, c] = t.bracket === '[' ? ['[', ']'] : ['(', ')'];
        kids.push(h('span', { class: 'rest' }, o));
        walk(t.kids);
        kids.push(h('span', { class: 'rest' }, c, t.n > 1 ? h('sub', {}, String(t.n)) : null));
      }
    }
  };
  walk(parsed.tree);
  const q = parsed.charge;
  if (q) kids.push(h('span', { class: 'rest' }, h('sup', {}, `${Math.abs(q) === 1 ? '' : Math.abs(q)}${q < 0 ? '−' : '+'}`)));
  return h('span', { class: 'ox-species', role: 'img', 'aria-label': label ?? oxAria(parsed, values) }, ...kids);
}
function oxAria(parsed, values) {
  return `${U(parsed.canonical)}: ` + [...values].map(([e, v]) => `${e} ${ox(v)}`).join(', ');
}

/** Values per element token when atoms of one element differ and the typed formula writes them apart (CH3COOH). */
function perTokenValues(r) {
  if (!r.perAtom || r.perAtom.from !== 'structure' || r.perAtom.anion || !r.structure) return null;
  const E = r.perAtom.el;
  const tokens = [];
  let flat = true;
  const walk = (tree) => { for (const t of tree) { if (t.type === 'el') tokens.push(t); else flat = false; } };
  walk(r.parsed.tree);
  if (!flat) return null;
  const ofE = tokens.filter((t) => t.el === E);
  const atomsE = r.structure.atoms.map((a, i) => [a, i]).filter(([a]) => a === E);
  if (ofE.some((t) => t.n !== 1) || ofE.length !== atomsE.length) return null;
  let j = 0;
  return tokens.map((t) => (t.el === E ? r.structure.os[atomsE[j++][1]] : null));
}

// ---------------------------------------------------------------- rule sentences
function ruleSentence(it, r) {
  const e = it.el, name = elN(e), v = it.value ? ox(it.value) : '?';
  const d = it.detail || {};
  switch (it.rule) {
    case 'elemental': return [T(`${name} on its own (an element): 0.`, `${Le(name)} seul (corps simple) : 0.`)];
    case 'monatomic': return [T(`A one-atom ion: its oxidation number is its charge, ${v}.`, `Ion monoatomique : son nombre d’oxydation est sa charge, ${v}.`)];
    case 'homonuclear-ion': return [T(`Every atom is ${name}: the charge ${signedInt(r.parsed.charge)} is shared by ${it.n} atoms, ${v} each on average.`, `Tous les atomes sont des atomes ${de(name)} : la charge ${signedInt(r.parsed.charge)} se partage entre ${it.n} atomes, ${v} chacun en moyenne.`), ...cite('iupac-os')];
    case 'F': return [T('Fluorine is always −1 in its compounds.', 'Le fluor vaut toujours −1 dans ses composés.')];
    case 'group1': return [T(`${cap(name)} (group 1) is +1 in its compounds.`, `${Le(name)} (groupe 1) vaut +1 dans ses composés.`)];
    case 'group2': return [T(`${cap(name)} (group 2) is +2 in its compounds.`, `${Le(name)} (groupe 2) vaut +2 dans ses composés.`)];
    case 'H-metal': return [T(`Hydrogen bonded to a metal (${(d.others || []).join(', ')}) is −1: a hydride.`, `L’hydrogène lié à un métal (${(d.others || []).join(', ')}) vaut −1 : c’est un hydrure.`)];
    case 'H-less-en': return [T(`Hydrogen is −1 here: ${(d.others || []).join(', ')} is less electronegative than hydrogen, so the bond electrons are counted on hydrogen, as in a metal hydride.`, `L’hydrogène vaut −1 ici : ${(d.others || []).join(', ')} est moins électronégatif que l’hydrogène, les électrons de liaison sont donc comptés pour l’hydrogène, comme dans un hydrure métallique.`), ...cite('pubchem-pt')];
    case 'H-nonmetal': return [T('Hydrogen bonded to non-metals is +1.', 'L’hydrogène lié à des non-métaux vaut +1.')];
    case 'O-default': return [T('Oxygen is usually −2.', 'L’oxygène vaut en général −2.')];
    case 'O-normal': return [T('Oxygen is the last unknown; the sum gives −2, its usual value.', 'L’oxygène est la dernière inconnue ; la somme donne −2, sa valeur habituelle.'), ' ', diffEq(it)];
    case 'O-peroxide': return [T('Oxygen is the last unknown and the sum gives −1: a peroxide, with an O–O bond.', 'L’oxygène est la dernière inconnue et la somme donne −1 : un peroxyde, avec une liaison O–O.'), ' ', diffEq(it)];
    case 'O-superoxide': return [T('The sum gives −1/2 for oxygen: a superoxide, the O₂⁻ ion.', 'La somme donne −1/2 pour l’oxygène : un superoxyde, l’ion O₂⁻.'), ' ', diffEq(it)];
    case 'O-positive': return [T('Oxygen is positive here: it is bonded to fluorine, the only element more electronegative than oxygen.', 'L’oxygène est positif ici : il est lié au fluor, seul élément plus électronégatif que lui.'), ' ', diffEq(it)];
    case 'O-other': return [T(`The sum gives ${v} for oxygen, an unusual value.`, `La somme donne ${v} pour l’oxygène, valeur inhabituelle.`), ' ', diffEq(it)];
    case 'halogen': return [T(`${cap(name)} is −1: there is no oxygen and no more electronegative halogen.`, `${Le(name)} vaut −1 : pas d’oxygène ni d’halogène plus électronégatif.`)];
    case 'difference': return [T(`${cap(name)} by difference, since the oxidation numbers add up to the charge:`, `${Le(name)} s’obtient par différence, car la somme des nombres d’oxydation est égale à la charge :`), ' ', diffEq(it)];
    case 'structure': return [T(`${cap(name)}: several elements are not fixed by a rule, so the value comes from the Lewis structure, giving each bond’s electrons to the more electronegative atom (Allen scale).`, `${Le(name)} : plusieurs éléments ne sont fixés par aucune règle ; la valeur vient du schéma de Lewis, en donnant les électrons de chaque liaison à l’atome le plus électronégatif (échelle d’Allen).`), ...cite('iupac-os')];
    default: return [`${name}: ${v}`];
  }
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
// French articles: every element name is masculine; elision before a vowel or h.
const vowel = (n) => /^[aeiouéèh]/i.test(n);
const le = (n) => (vowel(n) ? 'l’' : 'le ') + n;
const Le = (n) => cap(le(n));
const de = (n) => (vowel(n) ? 'd’' : 'de ') + n;
const signedInt = (q) => (q > 0 ? '+' : q < 0 ? '−' : '') + Math.abs(q);

/** "4 × (−2) + x = −1, so x = +7" */
function diffEq(it) {
  const d = it.detail;
  if (!d?.terms) return '';
  const parts = d.terms.map((t) => `${t.n > 1 ? t.n + ' × ' : ''}(${ox(t.value)})`);
  const x = `${d.n > 1 ? d.n : ''}x`;
  const lhs = [...parts, x].join(' + ');
  return h('span', { class: 'math' }, `${lhs} = ${signedInt(d.charge) || '0'}, ${T('so', 'donc')} x = ${ox(it.value)}.`);
}

function flagNotes(r) {
  const out = [];
  const item = (e) => r.items.find((it) => it.el === e);
  for (const fl of r.flags) {
    if (fl === 'average') {
      const it = r.items.find((x) => x.value && x.value.d !== 1);
      out.push(h('p', { class: 'why' }, T(`${it ? ox(it.value) : 'This value'} is not a whole number: it is an average. The atoms of one element are not all alike here, or the charge is spread over equivalent atoms.`, `${it ? ox(it.value) : 'Cette valeur'} n’est pas un nombre entier : c’est une moyenne. Les atomes d’un même élément ne sont pas tous équivalents, ou bien la charge est répartie sur des atomes équivalents.`), ...cite('iupac-os')));
    } else if (fl === 'h-close') {
      const c = item('H')?.detail?.close ?? [];
      out.push(h('p', { class: 'why' }, T(`Hydrogen and ${c.map(elN).join(', ')} have almost the same electronegativity, so the sign of hydrogen here is a convention. IUPAC notes that for such close pairs (it names H–P) analogies are a better guide; the textbook rule gives hydrogen +1 with non-metals.`, `L’hydrogène et ${c.map((e) => le(elN(e))).join(', ')} ont presque la même électronégativité : le signe de l’hydrogène est ici une convention. L’IUPAC note que pour des paires aussi proches (elle cite H–P), mieux vaut se guider par analogie ; la règle des manuels donne +1 à l’hydrogène lié à des non-métaux.`), ...cite('iupac-os', 'openstax-ox')));
    } else if (fl === 'exceeds-max-peroxo' || fl === 'exceeds-max') {
      const it = r.items.find((x) => x.rule === 'difference');
      const lim = it ? limits(it.el).max : null;
      out.push(h('p', { class: 'why' }, it ? T(`The rules give ${elN(it.el)} ${ox(it.value)}, more than its ${lim} valence electrons allow.`, `Les règles donnent ${ox(it.value)} pour ${le(elN(it.el))}, plus que ses ${lim} électrons de valence ne le permettent.`) : '',
        ' ', fl === 'exceeds-max-peroxo' ? T('Some oxygen atoms must be bonded to each other (a peroxide bridge, O at −1), so “oxygen −2” does not hold for all of them.', 'Certains atomes d’oxygène sont donc liés entre eux (pont peroxyde, O à −1) : « oxygène −2 » ne vaut pas pour tous.') : T('Check the formula.', 'Vérifiez la formule.'), ...cite('openstax-ox')));
    } else if (fl === 'below-min') {
      out.push(h('p', {}, T('The value found is below what the valence electrons allow: check the formula.', 'La valeur trouvée est plus basse que ce que permettent les électrons de valence : vérifiez la formule.')));
    } else if (fl === 'inconsistent') {
      out.push(h('p', {}, T('The values found do not add up to the charge: the rules do not fit this formula.', 'Les valeurs trouvées ne donnent pas la charge : les règles ne conviennent pas à cette formule.')));
    } else if (fl === 'several-unknown') {
      out.push(h('p', {}, T('Two or more elements are not fixed by any rule, and no Lewis structure could be built for this formula, so the tool cannot share the remaining charge between them.', 'Deux éléments ou plus ne sont fixés par aucune règle, et aucun schéma de Lewis n’a pu être construit : l’outil ne peut pas répartir la charge restante entre eux.')));
    }
  }
  return out;
}

function disagreeNotes(r) {
  if (!r.disagree?.length) return [];
  const pairs = r.disagree.map((d) => `${d.el} ${ox(d.structure)}`).join(', ');
  const ruleV = r.disagree.map((d) => `${d.el} ${ox(d.rule)}`).join(', ');
  const head = T(`On the Lewis structure, the IUPAC method (each bond to the atom with the higher Allen electronegativity) gives ${pairs}, where the textbook rules give ${ruleV}.`, `Sur le schéma de Lewis, la méthode de l’IUPAC (chaque liaison à l’atome d’électronégativité d’Allen la plus élevée) donne ${pairs}, là où les règles des manuels donnent ${ruleV}.`);
  let why;
  if (r.flags.includes('exceeds-max-peroxo')) {
    why = T('The structure has an O–O bridge: those two oxygens are −1, the others −2, and sulfur stays within its limit.', 'Le schéma comporte un pont O–O : ces deux oxygènes valent −1, les autres −2, et le soufre reste dans sa limite.');
    return [h('p', { class: 'why' }, head, ' ', why, ...cite('iupac-os', 'wp-peroxydisulfate'))];
  }
  if (r.key === 'H3O3P|0') {
    why = T('Phosphorous acid is the IUPAC example of this choice: one H is bonded to P, and P and H have almost equal electronegativities, so two assignments are possible: P +3 (that H counted +1) or P +5 (that H counted −1).', 'L’acide phosphoreux est l’exemple donné par l’IUPAC pour ce choix : un H est lié au P, et P et H ont des électronégativités presque égales ; deux attributions sont possibles : P +3 (ce H compté +1) ou P +5 (ce H compté −1).');
    return [h('p', { class: 'why' }, head, ' ', why, ...cite('iupac-os'))];
  }
  const els = [...new Set([...r.items.map((it) => it.el)])].filter((e) => elData(e));
  const scale = els.map((e) => `${e} ${f(elData(e).pauling, 2)} / ${elData(e).allen ? f(elData(e).allen, 3) : '–'}`).join(' · ');
  why = T(`Comparing the two scales ourselves: they do not rank these elements the same way (Pauling / Allen: ${scale}). The textbook rules follow the usual Pauling ranking; IUPAC chose Allen’s scale for its definition. Here the rules and the IUPAC method simply give different answers.`, `En comparant nous-mêmes les deux échelles : elles ne classent pas ces éléments de la même façon (Pauling / Allen : ${scale}). Les règles des manuels suivent le classement habituel de Pauling ; l’IUPAC a choisi l’échelle d’Allen pour sa définition. Ici, les règles et la méthode de l’IUPAC donnent simplement des réponses différentes.`);
  if (r.flags.includes('h-close')) return [h('p', { class: 'why' }, head, ' ', T('For bonds this close in electronegativity, IUPAC advises following analogies rather than the strict rule; by analogy with NH₃, PH₃ would keep P −3 (our reading, not an IUPAC example).', 'Pour des liaisons aussi proches en électronégativité, l’IUPAC conseille de suivre l’analogie plutôt que la règle stricte ; par analogie avec NH₃, PH₃ garderait P −3 (notre lecture, pas un exemple de l’IUPAC).'), ...cite('iupac-os'))];
  return [h('p', { class: 'why' }, head, ' ', why, ...cite('pubchem-pt', 'iupac-os'))];
}

const PER_ATOM_NOTE = {
  fe3o4: { en: 'Magnetite holds one Fe²⁺ and two Fe³⁺ for four O²⁻: +8/3 is their average.', fr: 'La magnétite contient un Fe²⁺ et deux Fe³⁺ pour quatre O²⁻ : +8/3 est leur moyenne.', src: ['wp-fe3o4'] },
  thiosulfate: { en: 'In thiosulfate the S–S bond is practically single: the central S (bonded to the three O) is +5 and the terminal S is −1. Their average, +2, is the value used in electrochemistry; a “systematic” +6 is also met for the central S, treating the S–S bond as ionic.', fr: 'Dans le thiosulfate, la liaison S–S est pratiquement simple : le S central (lié aux trois O) vaut +5 et le S terminal −1. Leur moyenne, +2, est la valeur utilisée en électrochimie ; on rencontre aussi un +6 « systématique » pour le S central, en traitant la liaison S–S comme ionique.', src: ['iupac-os'] },
  tetrathionate: { en: 'Tetrathionate is O₃S–S–S–SO₃: the two inner S atoms are 0, the two outer ones +5; +5/2 is their average.', fr: 'Le tétrathionate s’écrit O₃S–S–S–SO₃ : les deux S intérieurs valent 0, les deux extérieurs +5 ; +5/2 est leur moyenne.', src: ['wp-tetrathionate'] },
};

function perAtomBlock(r, mapped) {
  const pa = r.perAtom;
  if (!pa) return null;
  const vals = pa.values.map(ox).join(', ');
  if (pa.from === 'source') {
    const n = PER_ATOM_NOTE[pa.note];
    return h('div', { class: 'note' }, h('p', {}, h('strong', {}, T(`Atom by atom, ${pa.el}: ${vals}.`, `Atome par atome, ${pa.el} : ${vals}.`)), ' ', L(n), ...cite(...(n?.src ?? []))));
  }
  const avg = r.items.find((it) => it.el === pa.el)?.value;
  const mean = pa.values.reduce((a, v) => a + fval(v), 0) / pa.values.length;
  const isAvg = avg && Math.abs(fval(avg) - mean) < 1e-9;
  return h('div', { class: 'note' }, h('p', {},
    h('strong', {}, T(`Atom by atom, ${pa.el}: ${vals}.`, `Atome par atome, ${pa.el} : ${vals}.`)), ' ',
    T(`The ${elN(pa.el)} atoms are not in the same environment. Counted on the Lewis structure (each bond to the more electronegative atom, bonds between like atoms shared equally), they differ${isAvg ? `; the rule value ${ox(avg)} is their average` : ''}.`, `Les atomes ${de(elN(pa.el))} ne sont pas dans le même environnement. Comptés sur le schéma de Lewis (chaque liaison à l’atome le plus électronégatif, liaisons entre atomes identiques partagées), ils diffèrent${isAvg ? ` ; la valeur des règles ${ox(avg)} est leur moyenne` : ''}.`),
    mapped ? ' ' + T('The values above the formula are per atom.', 'Les valeurs au-dessus de la formule sont données atome par atome.') : '',
    ...cite('iupac-os')),
    pa.anion ? h('p', { class: 'small' }, T(`Read on the ion ${U(anionText(pa.anion))}, once the metal cations are taken off.`, `Lu sur l’ion ${U(anionText(pa.anion))}, une fois les cations métalliques retirés.`)) : null);
}
const anionText = (key) => { const [body, q] = key.split('|'); return q === '0' ? body : `${body}^${Math.abs(q)}${Number(q) < 0 ? '-' : '+'}`; };

// ---------------------------------------------------------------- section 1
const SPECIES_GROUPS = [
  { label: { en: 'Oxidants and reductants', fr: 'Oxydants et réducteurs' }, items: ['MnO4-', 'KMnO4', 'Cr2O7^2-', 'K2Cr2O7', 'CrO4^2-', 'NO3-', 'HNO3', 'ClO-', 'ClO3-', 'HClO4', 'SO4^2-', 'H2SO4', 'SO3^2-', 'H2S', 'Fe^3+', 'Fe3O4'] },
  { label: { en: 'Sulfur oxoanions', fr: 'Oxoanions du soufre' }, items: ['S2O3^2-', 'Na2S2O3', 'S4O6^2-', 'S2O8^2-'] },
  { label: { en: 'Oxygen and hydrogen exceptions', fr: 'Exceptions de l’oxygène et de l’hydrogène' }, items: ['H2O2', 'Na2O2', 'KO2', 'OF2', 'NaH', 'CaH2', 'LiAlH4', 'BH4-'] },
  { label: { en: 'Carbon', fr: 'Carbone' }, items: ['CH4', 'CH3OH', 'HCHO', 'HCOOH', 'CO2', 'CH3COOH', 'C2H5OH', 'C6H12O6', 'HCN', 'SCN-'] },
  { label: { en: 'Conventions and averages', fr: 'Conventions et moyennes' }, items: ['NCl3', 'PH3', 'H3PO3', 'I3-', 'NH4NO3', '(NH4)2SO4'] },
];
const EXAMPLES = ['MnO4-', 'Cr2O7^2-', 'S2O3^2-', 'CH3COOH', 'H2O2', 'NCl3'];

const out = {};

function buildOxSection() {
  const input = h('input', { id: 'ox-input', type: 'text', class: 'big-input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', value: S.sp, 'aria-describedby': 'ox-hint ox-err' });
  const pick = h('select', { id: 'ox-pick' },
    h('option', { value: '', text: T('Choose…', 'Choisir…') }),
    ...SPECIES_GROUPS.map((g) => h('optgroup', { label: L(g.label) }, ...g.items.map((s) => h('option', { value: s, text: U(s), selected: s === S.sp })))));
  const set = (v) => { S.sp = v; input.value = v; pick.value = SPECIES_GROUPS.some((g) => g.items.includes(v)) ? v : ''; renderOx(); writeHash(); };
  input.addEventListener('input', () => { S.sp = input.value; pick.value = ''; renderOx(); writeHash(); });
  pick.addEventListener('change', () => { if (pick.value) set(pick.value); });
  const examples = h('ul', { class: 'examples', id: 'ox-examples', 'aria-label': T('Examples', 'Exemples') },
    ...EXAMPLES.map((s) => h('li', {}, h('button', { type: 'button', 'data-sp': s, onclick: () => set(s) }, species(s)))));
  out.oxInput = input;
  out.oxErr = h('p', { class: 'err', id: 'ox-err', role: 'status' });
  out.oxResult = h('div', { id: 'ox-result', 'aria-live': 'polite' });
  return h('section', { class: 'tool-cols', 'aria-labelledby': 'ox-h' },
    h('div', { class: 'card' },
      h('h2', { id: 'ox-h' }, T('1. Oxidation numbers', '1. Nombres d’oxydation')),
      h('p', { class: 'why' }, T('An oxidation number is a bookkeeping charge: the charge an atom would carry if the electrons of each of its bonds went to the more electronegative partner. Oxidation is an increase of it (electrons lost), reduction a decrease (electrons gained).', 'Le nombre d’oxydation est une charge de comptabilité : celle que porterait un atome si les électrons de chacune de ses liaisons allaient au partenaire le plus électronégatif. Une oxydation l’augmente (perte d’électrons), une réduction le diminue (gain d’électrons).'), ...cite('openstax-ox', 'iupac-os')),
      h('div', { class: 'field' }, h('label', { for: 'ox-input', text: T('Species (molecule or ion)', 'Espèce (molécule ou ion)') }), h('div', { class: 'field-in' }, input)),
      h('p', { class: 'hint', id: 'ox-hint' }, T('Charge at the end: SO4^2-, SO4 2- or SO₄²⁻; Fe^3+ or Fe3+.', 'Charge à la fin : SO4^2-, SO4 2- ou SO₄²⁻ ; Fe^3+ ou Fe3+.')),
      out.oxErr,
      h('div', { class: 'field select', style: 'margin-top:8px' }, h('label', { for: 'ox-pick', text: T('Or pick a common species', 'Ou choisissez une espèce courante') }), h('div', { class: 'field-in' }, pick)),
      examples,
      h('p', { class: 'why', style: 'margin-top:12px' }, T('Carbon shows the whole range: −4 in CH₄, −2 in CH₃OH, 0 in HCHO, +2 in HCOOH, +4 in CO₂.', 'Le carbone parcourt toute la gamme : −4 dans CH₄, −2 dans CH₃OH, 0 dans HCHO, +2 dans HCOOH, +4 dans CO₂.'), ...cite('openstax-organic-ox'))),
    h('div', { class: 'card' }, h('h2', {}, T('Result', 'Résultat')), out.oxResult));
}

function renderOx() {
  const r = oxidation(S.sp);
  out.oxErr.textContent = '';
  out.oxInput.removeAttribute('aria-invalid');
  if (!r.ok) {
    out.oxErr.textContent = parseMsg(r.error, r.detail);
    out.oxInput.setAttribute('aria-invalid', 'true');
    out.oxResult.replaceChildren(h('p', { class: 'muted' }, T('No result yet.', 'Pas encore de résultat.')));
    return;
  }
  const kids = [];
  if (r.parsed.guessed) {
    kids.push(h('p', { class: 'note' }, T(`Read as ${U(r.parsed.canonical)}.`, `Lu comme ${U(r.parsed.canonical)}.`), ' ',
      r.parsed.alt ? h('button', { type: 'button', class: 'btn ghost', onclick: () => { S.sp = r.parsed.alt; out.oxInput.value = r.parsed.alt; renderOx(); writeHash(); } }, T(`Did you mean ${U(r.parsed.alt)}?`, `Vouliez-vous dire ${U(r.parsed.alt)} ?`)) : T('Write the charge with ^ to remove the doubt (SO4^2-).', 'Écrivez la charge avec ^ pour lever le doute (SO4^2-).')));
  }
  if (r.kind === 'ions') {
    kids.push(h('p', {}, T(`${U(r.parsed.canonical)} is a salt of two polyatomic ions; the rules are applied to each ion.`, `${U(r.parsed.canonical)} est un sel de deux ions polyatomiques ; on applique les règles à chaque ion.`)));
    const seen = new Set();
    for (const ion of r.ions) {
      if (seen.has(ion.species)) continue;
      seen.add(ion.species);
      const vals = new Map(ion.items.map((it) => [it.el, it.value]));
      kids.push(h('div', { class: 'stack' }, oxSpecies(ion.parsed, vals),
        h('ol', { class: 'ox-rules' }, ...ion.items.map((it) => h('li', {}, ...ruleSentence(it, ion))))));
    }
    kids.push(h('p', { class: 'small' }, T('Nitrogen has two different oxidation numbers here, one in each ion.', 'L’azote a ici deux nombres d’oxydation différents, un dans chaque ion.'), ...cite('openstax-ox')));
    out.oxResult.replaceChildren(...kids);
    return;
  }
  const values = new Map(r.items.map((it) => [it.el, it.value]));
  const perToken = perTokenValues(r);
  kids.push(h('div', {}, oxSpecies(r.parsed, values, { perToken })));
  // rules in the order they are applied
  const ORDER = ['elemental', 'monatomic', 'homonuclear-ion', 'F', 'group1', 'group2', 'H-metal', 'H-less-en', 'H-nonmetal', 'O-default', 'halogen', 'O-normal', 'O-peroxide', 'O-superoxide', 'O-positive', 'O-other', 'difference', 'structure'];
  const items = [...r.items].sort((a, b) => ORDER.indexOf(a.rule) - ORDER.indexOf(b.rule));
  kids.push(h('ol', { class: 'ox-rules' }, ...items.map((it) => h('li', {}, ...ruleSentence(it, r)))));
  if (r.sum) kids.push(h('p', { class: 'small math' }, T('Check: ', 'Vérification : '), r.items.map((it) => `${it.n > 1 ? it.n + ' × ' : ''}(${ox(it.value)})`).join(' + '), ` = ${ox(r.sum) === '0' ? '0' : ox(r.sum)}`, T(', the charge.', ', la charge.')));
  kids.push(...flagNotes(r));
  const pa = perAtomBlock(r, !!perToken);
  if (pa) kids.push(pa);
  kids.push(...disagreeNotes(r));
  if (r.structure?.minorDiffers) kids.push(h('p', { class: 'small' }, T('Less important resonance forms would give other per-atom values; the values shown are for the main structure.', 'Des formes mésomères moins importantes donneraient d’autres valeurs par atome ; celles affichées sont celles de la structure principale.')));
  kids.push(h('p', { class: 'small' }, h('a', { href: `#lewis?f=${encodeURIComponent(r.parsed.canonical)}` }, T('See its Lewis structure', 'Voir son schéma de Lewis'))));
  out.oxResult.replaceChildren(...kids);
}

// ---------------------------------------------------------------- section 2: reactions
const coupleLabel = (c) => `${U(c.ox)} / ${U(c.red)}   E° = ${c.E < 0 ? '−' : '+'}${fmtn(Math.abs(c.E), lang(), 4)} V`;

function buildRxSection() {
  const seg = (id, key, options, onpick) => h('div', { class: 'seg', id, role: 'group' },
    ...options.map(([v, label]) => h('button', { type: 'button', [`data-${key}`]: v, 'aria-pressed': String(S[key] === v), onclick: () => onpick(v) }, label)));
  const mode = seg('rx-mode', 'mode', [['table', T('From the table', 'Depuis la table')], ['own', T('Type your own couples', 'Vos propres couples')]], (v) => { S.mode = v; writeHash(); buildAll(); });
  const medium = seg('rx-medium', 'medium', [['acid', T('Acidic', 'Milieu acide')], ['base', T('Basic', 'Milieu basique')]], (v) => {
    S.m = v; if (v === 'base') { S.ox = DEFAULTS.base.ox; S.red = DEFAULTS.base.red; } else { S.ox = DEFAULTS.acid.ox; S.red = DEFAULTS.acid.red; }
    fixCouples(); writeHash(); buildAll();
  });
  mode.setAttribute('aria-label', T('Source of the couples', 'Origine des couples'));
  medium.setAttribute('aria-label', T('Medium', 'Milieu'));
  // the seg buttons use data-medium; keep S.m as the state key
  medium.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.medium === S.m)));

  let inputs;
  if (S.mode === 'table') {
    const opts = couplesFor(S.m);
    const sel = (id, key, label) => {
      const s = h('select', { id }, ...opts.map((c) => h('option', { value: c.id, text: coupleLabel(c), selected: c.id === S[key] })));
      s.addEventListener('change', () => { S[key] = s.value; writeHash(); renderRx(); });
      return h('div', { class: 'field select' }, h('label', { for: id, text: label }), h('div', { class: 'field-in' }, s));
    };
    inputs = h('div', { class: 'fields' },
      sel('rx-ox', 'ox', T('Oxidant couple (its oxidised form takes electrons: it is reduced)', 'Couple de l’oxydant (sa forme oxydée capte des électrons : elle est réduite)')),
      sel('rx-red', 'red', T('Reductant couple (its reduced form gives electrons: it is oxidised)', 'Couple du réducteur (sa forme réduite cède des électrons : elle est oxydée)')));
  } else {
    const inp = (id, key, label) => {
      const i = h('input', { id, type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', value: S[key] });
      i.addEventListener('input', () => { S[key] = i.value; writeHash(); renderRx(); });
      return h('div', { class: 'field' }, h('label', { for: id, text: label }), h('div', { class: 'field-in' }, i));
    };
    const OWN = [
      { o1: 'HNO3', o2: 'NO', r1: 'Cu^2+', r2: 'Cu', m: 'acid', label: { en: 'Cu + dilute HNO₃', fr: 'Cu + HNO₃ dilué' } },
      { o1: 'HNO3', o2: 'NO2', r1: 'Cu^2+', r2: 'Cu', m: 'acid', label: { en: 'Cu + concentrated HNO₃', fr: 'Cu + HNO₃ concentré' } },
      { o1: 'Cr2O7^2-', o2: 'Cr^3+', r1: 'Fe^3+', r2: 'Fe^2+', m: 'acid', label: { en: 'Cr₂O₇²⁻ + Fe²⁺', fr: 'Cr₂O₇²⁻ + Fe²⁺' } },
      { o1: 'Cl2', o2: 'Cl-', r1: 'ClO3-', r2: 'Cl2', m: 'base', label: { en: 'Cl₂ in base (disproportionation)', fr: 'Cl₂ en milieu basique (dismutation)' } },
      { o1: 'MnO4-', o2: 'MnO2', r1: 'BrO3-', r2: 'Br-', m: 'base', label: { en: 'MnO₄⁻ + Br⁻ in base', fr: 'MnO₄⁻ + Br⁻ en milieu basique' } },
    ];
    inputs = h('div', {},
      h('div', { class: 'fields' },
        inp('rx-o1', 'o1', T('Oxidant: oxidised form', 'Oxydant : forme oxydée')), inp('rx-o2', 'o2', T('…its reduced form', '…sa forme réduite')),
        inp('rx-r1', 'r1', T('Reductant couple: oxidised form', 'Couple du réducteur : forme oxydée')), inp('rx-r2', 'r2', T('…reduced form (the reductant)', '…forme réduite (le réducteur)'))),
      h('p', { class: 'hint' }, T('Each couple is written oxidised form / reduced form, like Cu^2+ / Cu. Examples from OpenStax:', 'Chaque couple s’écrit forme oxydée / forme réduite, comme Cu^2+ / Cu. Exemples tirés d’OpenStax :'), ...cite('openstax-redox', 'openstax-ox')),
      h('ul', { class: 'examples', id: 'rx-own-examples' }, ...OWN.map((o) => h('li', {}, h('button', { type: 'button', onclick: () => { Object.assign(S, { o1: o.o1, o2: o.o2, r1: o.r1, r2: o.r2, m: o.m }); fixCouples(); writeHash(); buildAll(); } }, L(o.label))))));
  }
  const swap = h('button', { type: 'button', class: 'btn ghost', id: 'rx-swap', onclick: swapCouples }, T('⇅ Swap the roles', '⇅ Échanger les rôles'));
  out.rxErr = h('p', { class: 'err', id: 'rx-err', role: 'status' });
  out.rxResult = h('div', { id: 'rx-result', 'aria-live': 'polite' });
  return h('section', { class: 'stack', 'aria-labelledby': 'rx-h', style: 'margin-top:18px' },
    h('div', { class: 'card' },
      h('h2', { id: 'rx-h' }, T('2. Balance a redox reaction', '2. Équilibrer une réaction d’oxydoréduction')),
      h('p', { class: 'why' }, T('A redox reaction joins two couples: the oxidant of one takes the electrons that the reductant of the other gives. Each couple is balanced as a half-equation, then the two are combined so that no electron is left over.', 'Une réaction d’oxydoréduction associe deux couples : l’oxydant de l’un capte les électrons que cède le réducteur de l’autre. On équilibre chaque couple par une demi-équation, puis on combine les deux pour qu’aucun électron ne reste.'), ...cite('openstax-redox')),
      h('div', { class: 'input-row' }, h('div', {}, h('span', { class: 'field-label' }, T('Couples', 'Couples')), mode), h('div', {}, h('span', { class: 'field-label' }, T('Solution', 'Solution')), medium), swap),
      h('div', { style: 'margin-top:12px' }, inputs),
      S.mode === 'table' && S.m === 'base' ? h('p', { class: 'hint' }, T('In basic solution the table lists separate couples written with OH⁻ and their own potentials; only those are offered here.', 'En milieu basique, la table donne des couples écrits avec OH⁻ et leurs propres potentiels ; seuls ceux-là sont proposés ici.'), ...cite('openstax-e')) : null,
      S.mode === 'table' && S.m === 'acid' ? h('p', { class: 'hint' }, T('Couples without H⁺ or OH⁻ (metal ions, halogens) are listed with the acidic ones.', 'Les couples sans H⁺ ni OH⁻ (ions métalliques, halogènes) figurent avec ceux du milieu acide.')) : null,
      out.rxErr),
    h('div', { class: 'card' }, out.rxResult));
}

function swapCouples() {
  if (S.mode === 'table') [S.ox, S.red] = [S.red, S.ox];
  else [S.o1, S.o2, S.r1, S.r2] = [S.r1, S.r2, S.o1, S.o2];
  writeHash(); buildAll();
}

/** The two couples as {ox, red, viaAcid, E?, couple?}. Throws {code}. */
function currentCouples() {
  if (S.mode === 'table') {
    const a = byId.get(S.ox), b = byId.get(S.red);
    return { A: { ox: a.ox, red: a.red, viaAcid: a.viaAcid, E: a.E, c: a }, B: { ox: b.ox, red: b.red, viaAcid: b.viaAcid, E: b.E, c: b } };
  }
  for (const k of ['o1', 'o2', 'r1', 'r2']) {
    try { parseFormula(S[k]); } catch (e) { if (e instanceof FormulaError) throw { code: 'parse', field: k, msg: parseMsg(e.code, e.detail) }; throw e; }
  }
  const canon = (s) => parseFormula(s).canonical;
  return { A: { ox: canon(S.o1), red: canon(S.o2) }, B: { ox: canon(S.r1), red: canon(S.r2) } };
}

function balanceMsg(err, cp) {
  const m = String(err?.message || '');
  const x = /^element (\w+)/.exec(m);
  if (x) return T(`${x[1]} appears in only one form of the couple ${U(cp.ox)} / ${U(cp.red)}: the two forms must contain the same elements (other than O and H).`, `${x[1]} n’apparaît que dans une forme du couple ${U(cp.ox)} / ${U(cp.red)} : les deux formes doivent contenir les mêmes éléments (hors O et H).`);
  if (/not a reduction/.test(m)) return T(`In ${U(cp.ox)} / ${U(cp.red)} the first form is not the more oxidised one: write the oxidised form first.`, `Dans ${U(cp.ox)} / ${U(cp.red)}, la première forme n’est pas la plus oxydée : écrivez d’abord la forme oxydée.`);
  return T(`The couple ${U(cp.ox)} / ${U(cp.red)} could not be balanced.`, `Le couple ${U(cp.ox)} / ${U(cp.red)} n’a pas pu être équilibré.`);
}

// equations with ½ coefficients and marks
function eqn(half, mark) {
  const sideNodes = (m) => {
    const outN = [];
    [...m].forEach(([s, k], i) => {
      if (i) outN.push(h('span', { class: 'op' }, ' + '));
      const cls = s === 'e-' ? 'el' : mark?.(s);
      outN.push(h('span', { class: `term${cls ? ' ' + cls : ''}` }, k === 1 ? '' : h('span', { class: 'coef' }, k === 0.5 ? '½' : String(k)), species(s)));
    });
    return outN;
  };
  return h('span', { class: 'eqn' }, ...sideNodes(half.left), h('span', { class: 'arrow', 'aria-label': T('gives', 'donne') }, ' → '), ...sideNodes(half.right));
}
const eqBlock = (half, mark, cls = '', id) => h('div', { class: `eq-block${cls ? ' ' + cls : ''}`, id }, eqn(half, mark));

/** Oxidation numbers of the two forms of a couple and the elements that change. */
function coupleOx(cp) {
  const rOx = oxidation(cp.viaAcid ?? cp.ox), rRed = oxidation(cp.red);
  if (!rOx.ok || !rRed.ok || rOx.kind !== 'rules' || rRed.kind !== 'rules') return null;
  const vOx = new Map(rOx.items.map((it) => [it.el, it.value]));
  const vRed = new Map(rRed.items.map((it) => [it.el, it.value]));
  const changes = [];
  for (const [e, a] of vOx) {
    const b = vRed.get(e);
    if (!a || !b) continue;
    if (fval(a) !== fval(b)) changes.push({ el: e, from: a, to: b, d: fval(a) - fval(b) });
  }
  return { rOx, rRed, vOx, vRed, changes };
}

function renderRx() {
  out.rxErr.textContent = '';
  let cps;
  try { cps = currentCouples(); } catch (e) {
    if (e.code === 'parse') { out.rxErr.textContent = e.msg; out.rxResult.replaceChildren(h('p', { class: 'muted' }, T('No result yet.', 'Pas encore de résultat.'))); return; }
    throw e;
  }
  const { A, B } = cps; // A: oxidant couple (reduction), B: reductant couple (oxidation)
  if (S.mode === 'table' && S.ox === S.red) {
    out.rxErr.textContent = T('Pick two different couples.', 'Choisissez deux couples différents.');
    out.rxResult.replaceChildren();
    return;
  }
  let hA, hB;
  try { hA = balanceHalf(A.ox, A.red, { medium: S.m, viaAcid: A.viaAcid }); } catch (e) { out.rxErr.textContent = balanceMsg(e, A); out.rxResult.replaceChildren(); return; }
  try { hB = balanceHalf(B.ox, B.red, { medium: S.m, viaAcid: B.viaAcid }); } catch (e) { out.rxErr.textContent = balanceMsg(e, B); out.rxResult.replaceChildren(); return; }
  let k;
  try { k = combine(hA.half, hA.n, hB.half, hB.n); } catch {
    out.rxErr.textContent = T('These two couples do not give a balanced equation.', 'Ces deux couples ne donnent pas d’équation équilibrée.');
    out.rxResult.replaceChildren(); return;
  }

  // species marks: the oxidant couple is reduced (acceptor, blue), the reductant couple oxidised (donor, orange)
  const setA = new Set([A.ox, A.red, A.viaAcid].filter(Boolean)), setB = new Set([B.ox, B.red, B.viaAcid].filter(Boolean));
  const water = new Set(['H2O', 'H+', 'OH-']);
  const mark = (s) => (water.has(s) ? null : setA.has(s) && !setB.has(s) ? 'red' : setB.has(s) && !setA.has(s) ? 'ox' : null);

  const steps = [];
  // 1. oxidation numbers
  const oA = coupleOx(A), oB = coupleOx(B);
  steps.push(h('li', { class: 'step' },
    h('h3', {}, T('Oxidation numbers: who gives electrons, who takes them', 'Nombres d’oxydation : qui cède, qui capte des électrons')),
    coupleOxBlock(A, oA, 'down'), coupleOxBlock(B, oB, 'up'),
    h('p', {}, h('span', { class: 'couple-tag red' }, T('reduced', 'réduit')), ' ',
      T(`${U(A.ox)} is the oxidant: it takes electrons and is reduced to ${U(A.red)}.`, `${U(A.ox)} est l’oxydant : il capte des électrons et se réduit en ${U(A.red)}.`)),
    h('p', {}, h('span', { class: 'couple-tag ox' }, T('oxidised', 'oxydé')), ' ',
      T(`${U(B.red)} is the reductant: it gives electrons and is oxidised to ${U(B.ox)}.`, `${U(B.red)} est le réducteur : il cède des électrons et s’oxyde en ${U(B.ox)}.`)),
    A.ox === B.red || A.red === B.ox || (A.ox === B.ox && A.red === B.red) ? h('p', { class: 'note' }, T('The same species is both oxidised and reduced: a disproportionation.', 'La même espèce est à la fois oxydée et réduite : c’est une dismutation.'), ...cite('openstax-ox')) : null,
    h('ul', { class: 'legend' }, h('li', {}, h('span', { class: 'sw acceptor' }), T('reduced (oxidation number goes down)', 'réduit (le nombre d’oxydation baisse)')), h('li', {}, h('span', { class: 'sw donor' }), T('oxidised (goes up)', 'oxydé (il monte)')), h('li', {}, h('span', { class: 'sw electron' }), T('electrons', 'électrons')))));

  // 2. and 3. half-equations
  steps.push(halfStep(A, hA, oA, false, mark));
  steps.push(halfStep(B, hB, oB, true, mark));

  // 4. same number of electrons
  const L2 = hA.n * k.k1;
  steps.push(h('li', { class: 'step' },
    h('h3', {}, T('Same number of electrons on both sides', 'Autant d’électrons cédés que captés')),
    h('p', {}, k.k1 === 1 && k.k2 === 1
      ? T(`The reduction takes ${hA.n} e⁻ and the oxidation gives ${hB.n} e⁻: already equal.`, `La réduction capte ${hA.n} e⁻ et l’oxydation en cède ${hB.n} : c’est déjà égal.`)
      : T(`The reduction takes ${hA.n} e⁻, the oxidation gives ${hB.n} e⁻. Multiply the first by ${k.k1} and the second by ${k.k2}: ${L2} electrons are exchanged.`, `La réduction capte ${hA.n} e⁻, l’oxydation en cède ${hB.n}. On multiplie la première par ${k.k1} et la seconde par ${k.k2} : ${L2} électrons sont échangés.`)),
    eqBlock(k.a, mark), eqBlock(k.b, mark)));

  // 5. add and simplify
  steps.push(h('li', { class: 'step' },
    h('h3', {}, T('Add the two half-equations and simplify', 'Additionner les deux demi-équations et simplifier')),
    h('p', {}, T('Adding the two:', 'La somme :')), eqBlock(k.sum, mark),
    h('p', {}, T('The electrons cancel, and so does what appears on both sides (H⁺, H₂O, OH⁻).', 'Les électrons s’éliminent, ainsi que ce qui figure des deux côtés (H⁺, H₂O, OH⁻).'),
      k.g > 1 ? ' ' + T(`All coefficients share a factor ${k.g}: divide by it.`, `Tous les coefficients ont un facteur ${k.g} en commun : on divise.`) : ''),
    h('p', { class: 'small muted' }, T('Balanced equation:', 'Équation équilibrée :')),
    eqBlock(k.final, mark, 'final', 'rx-final'),
    S.m === 'base' ? h('p', { class: 'small' }, T('OpenStax adds the OH⁻ after summing the halves; doing it in each half, as here, gives the same equation.', 'OpenStax ajoute les OH⁻ après avoir additionné les demi-équations ; le faire dans chaque demi-équation, comme ici, donne la même équation.'), ...cite('openstax-redox')) : null));

  // 6. check
  steps.push(h('li', { class: 'step' }, h('h3', {}, T('Check atoms and charges', 'Vérifier atomes et charges')), checkTable(k.final)));

  // 7. potentials
  if (A.E !== undefined) steps.push(potentialStep(A, B, k.n));
  else steps.push(h('li', { class: 'step' }, h('h3', {}, T('Cell potential', 'Potentiel de la pile')),
    h('p', { class: 'muted' }, T('No potential for couples you type yourself. Choose couples from the table to get E°, ΔG° and K.', 'Pas de potentiel pour des couples saisis à la main. Choisissez des couples de la table pour obtenir E°, ΔG° et K.'))));

  out.rxResult.replaceChildren(h('h2', {}, T('Step by step', 'Pas à pas')), h('ol', { class: 'steps' }, ...steps));
}

function coupleOxBlock(cp, o, dir) {
  if (!o) return h('p', { class: 'small muted' }, T(`Oxidation numbers for ${U(cp.ox)} / ${U(cp.red)} are not available.`, `Nombres d’oxydation de ${U(cp.ox)} / ${U(cp.red)} indisponibles.`));
  const change = new Map(o.changes.map((c) => [c.el, dir]));
  const sOx = oxSpecies(o.rOx.parsed, o.vOx, { change }), sRed = oxSpecies(o.rRed.parsed, o.vRed, { change });
  const lines = o.changes.map((c) => {
    const gain = c.d; // electrons gained per atom going ox -> red
    const n = Math.abs(gain);
    const per = Number.isInteger(n) ? String(n) : fmtn(n, lang(), 2);
    return dir === 'down'
      ? T(`${cap(elN(c.el))}: ${ox(c.from)} → ${ox(c.to)}, ${per} electron${n === 1 ? '' : 's'} gained per atom.`, `${cap(elN(c.el))} : ${ox(c.from)} → ${ox(c.to)}, ${per} électron${n === 1 ? '' : 's'} gagné${n === 1 ? '' : 's'} par atome.`)
      : T(`${cap(elN(c.el))}: ${ox(c.to)} → ${ox(c.from)}, ${per} electron${n === 1 ? '' : 's'} lost per atom.`, `${cap(elN(c.el))} : ${ox(c.to)} → ${ox(c.from)}, ${per} électron${n === 1 ? '' : 's'} perdu${n === 1 ? '' : 's'} par atome.`);
  });
  const arrow = dir === 'down' ? [sOx, h('span', { class: 'res-arrow' }, ' → '), sRed] : [sRed, h('span', { class: 'res-arrow' }, ' → '), sOx];
  return h('div', { class: 'stack' }, h('div', { class: 'eq-block' }, ...arrow), h('p', { class: `chg ${dir}` }, lines.join(' ')));
}

const STEP_TEXT = {
  skeleton: (d, cp) => (cp.viaAcid ? T(`Write the couple, oxidised form on the left. In acid the water couple is H⁺ / H₂; its basic form comes out of the conversion below.`, `On écrit le couple, forme oxydée à gauche. En milieu acide, le couple de l’eau s’écrit H⁺ / H₂ ; sa forme basique sort de la conversion plus bas.`) : T('Write the couple, oxidised form on the left.', 'On écrit le couple, forme oxydée à gauche.')),
  'other-elements': (d) => (!d.elements.length ? T('Only O and H here: nothing to do at this step.', 'Seulement O et H ici : rien à faire à cette étape.')
    : d.a === 1 && d.b === 1 ? T(`${d.elements.join(', ')} already balanced.`, `${d.elements.join(', ')} déjà équilibré${d.elements.length > 1 ? 's' : ''}.`)
      : T(`Balance the elements other than O and H (${d.elements.join(', ')}): coefficients ${d.a} and ${d.b}.`, `On équilibre les éléments autres que O et H (${d.elements.join(', ')}) : coefficients ${d.a} et ${d.b}.`)),
  oxygen: (d) => (d.water ? T(`Balance oxygen with water: ${d.water} H₂O on the ${d.side === 'right' ? 'right' : 'left'}.`, `On équilibre l’oxygène avec de l’eau : ${d.water} H₂O à ${d.side === 'right' ? 'droite' : 'gauche'}.`) : T('Oxygen is already balanced.', 'L’oxygène est déjà équilibré.')),
  hydrogen: (d) => (d.protons ? T(`Balance hydrogen with H⁺: ${d.protons} H⁺ on the ${d.side === 'right' ? 'right' : 'left'}.`, `On équilibre l’hydrogène avec des H⁺ : ${d.protons} H⁺ à ${d.side === 'right' ? 'droite' : 'gauche'}.`) : T('Hydrogen is already balanced.', 'L’hydrogène est déjà équilibré.')),
  electrons: (d) => T(`Balance the charge with electrons: ${signedInt(d.qL) || '0'} on the left, ${signedInt(d.qR) || '0'} on the right, so ${d.n} e⁻ on the left.`, `On équilibre les charges avec des électrons : ${signedInt(d.qL) || '0'} à gauche, ${signedInt(d.qR) || '0'} à droite, donc ${d.n} e⁻ à gauche.`),
  'base-add-oh': (d) => T(`Basic solution: there is almost no H⁺, so add ${d.oh} OH⁻ to both sides.`, `Milieu basique : il n’y a presque pas d’ions H⁺ ; on ajoute ${d.oh} OH⁻ de chaque côté.`),
  'base-water': () => T('H⁺ and OH⁻ on the same side make water.', 'H⁺ et OH⁻ du même côté forment de l’eau.'),
  'base-cancel': () => T('Remove the water that appears on both sides.', 'On retire l’eau présente des deux côtés.'),
};

function halfStep(cp, hb, o, isOx, mark) {
  const txt = (x) => [...x.left].join() + '>' + [...x.right].join();
  const subs = hb.steps.map((st, i) => h('li', {}, h('p', {}, STEP_TEXT[st.id](st.detail, cp)), i && txt(st.half) === txt(hb.steps[i - 1].half) ? null : eqBlock(st.half, mark)));
  // electrons per atom × atoms = n
  let check = null;
  if (o && o.changes.length === 1) {
    const c = o.changes[0];
    const startSp = cp.viaAcid ?? cp.ox;
    const coef = hb.steps.find((s) => s.id === 'other-elements')?.detail.a ?? 1;
    const atoms = (o.rOx.parsed.counts.get(c.el) || 0) * coef;
    const prod = atoms * c.d;
    if (Math.abs(prod - hb.n) < 1e-9) check = h('p', { class: 'small' }, T(`Check with the oxidation numbers: ${atoms} ${c.el} × ${fmtn(c.d, lang(), 2)} = ${hb.n} electron${hb.n > 1 ? 's' : ''}.`, `Vérification par les nombres d’oxydation : ${atoms} ${c.el} × ${fmtn(c.d, lang(), 2)} = ${hb.n} électron${hb.n > 1 ? 's' : ''}.`));
    void startSp;
  }
  const table = cp.c ? h('div', { class: 'small' }, h('p', {}, T('As printed in the table, with E° = ', 'Tel qu’imprimé dans la table, avec E° = '), signedE(cp.c.E), ' V', ...cite(cp.c.src),
    /H3O\+/.test(cp.c.table) ? ' ' + T('(H₃O⁺ is written H⁺ + H₂O above.)', '(H₃O⁺ s’écrit H⁺ + H₂O plus haut.)') : ''), h('div', { class: 'eq-block' }, eqn(parseEquation(cp.c.table), mark))) : null;
  const kids = [
    h('h3', {}, isOx ? T(`Oxidation half-equation: ${U(cp.red)} → ${U(cp.ox)}`, `Demi-équation d’oxydation : ${U(cp.red)} → ${U(cp.ox)}`) : T(`Reduction half-equation: ${U(cp.ox)} → ${U(cp.red)}`, `Demi-équation de réduction : ${U(cp.ox)} → ${U(cp.red)}`)),
    isOx ? h('p', {}, T('Balance the couple as a reduction first (the same steps), then turn it round.', 'On équilibre d’abord le couple comme une réduction (mêmes étapes), puis on le retourne.')) : null,
    h('details', { class: 'more', open: !isOx || undefined }, h('summary', {}, T('The steps', 'Les étapes')), h('ol', { class: 'ox-rules' }, ...subs)),
    isOx ? h('p', {}, T(hb.n > 1 ? `Written the other way, it is the oxidation: the ${hb.n} electrons go to the right.` : 'Written the other way, it is the oxidation: the electron goes to the right.', (hb.n > 1 ? `Écrite dans l’autre sens, c’est l’oxydation : les ${hb.n} électrons passent à droite.` : 'Écrite dans l’autre sens, c’est l’oxydation : l’électron passe à droite.'))) : null,
    eqBlock(isOx ? reverse(hb.half) : hb.half, mark),
    check, table,
  ];
  return h('li', { class: 'step' }, ...kids);
}

function signedE(E) { return (E < 0 ? '−' : E > 0 ? '+' : '') + fmtn(Math.abs(E), lang(), 4); }
const decimals = (x) => { const s = String(x); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; };

function checkTable(final) {
  const info = (s) => (s === 'e-' ? { counts: new Map(), charge: -1 } : parseFormula(s));
  const els = new Set();
  for (const m of [final.left, final.right]) for (const s of m.keys()) for (const e of info(s).counts.keys()) els.add(e);
  const cnt = (m, e) => [...m].reduce((n, [s, k]) => n + k * (info(s).counts.get(e) || 0), 0);
  const chg = (m) => [...m].reduce((q, [s, k]) => q + k * info(s).charge, 0);
  const rows = [...els].map((e) => h('tr', {}, h('td', {}, `${e} (${elN(e)})`), h('td', { class: 'v' }, String(cnt(final.left, e))), h('td', { class: 'v' }, String(cnt(final.right, e)))));
  rows.push(h('tr', { class: 'total' }, h('td', {}, T('Charge', 'Charge')), h('td', { class: 'v' }, signedInt(chg(final.left)) || '0'), h('td', { class: 'v' }, signedInt(chg(final.right)) || '0')));
  return h('div', { class: 'table-wrap' }, h('table', { class: 'kv', id: 'rx-check' },
    h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', { class: 'v' }, T('Left', 'Gauche')), h('th', { class: 'v' }, T('Right', 'Droite')))),
    h('tbody', {}, ...rows)));
}

function potentialStep(A, B, n) {
  const t = thermo(n, A.E, B.E);
  const d = Math.min(4, Math.max(decimals(A.E), decimals(B.E), 2));
  const Ecell = h('strong', { id: 'rx-ecell' }, `${t.E < 0 ? '−' : t.E > 0 ? '+' : ''}${fixed(Math.abs(t.E), lang(), d)} V`);
  const dG = Math.abs(t.dG) >= 100 ? fmtn(t.dG, lang(), 0) : fmtn(t.dG, lang(), 1);
  const z = t.log10K;
  const Kshow = Math.abs(z) < 3 ? h('span', {}, fmtn(10 ** z, lang(), 3)) : h('span', {}, '10', h('sup', {}, (z < 0 ? '−' : '') + fmtn(Math.abs(z), lang(), 0)));
  const spont = t.E > 0;
  const kids = [
    h('h3', {}, T('Cell potential, free energy and equilibrium constant (25 °C)', 'Potentiel de la pile, enthalpie libre et constante d’équilibre (25 °C)')),
    h('p', { class: 'math' }, 'E°', h('sub', {}, T('cell', 'pile')), ' = E°', h('sub', {}, T('cathode', 'cathode')), ' − E°', h('sub', {}, T('anode', 'anode')),
      ` = (${signedE(A.E)}) − (${signedE(B.E)}) = `, Ecell, ...cite('openstax-cell')),
    h('p', { class: 'small' }, T(`The cathode is where reduction happens (${U(A.ox)} / ${U(A.red)}); the anode, oxidation (${U(B.ox)} / ${U(B.red)}). Potentials are not multiplied by the coefficients.`, `La cathode est le lieu de la réduction (${U(A.ox)} / ${U(A.red)}) ; l’anode, celui de l’oxydation (${U(B.ox)} / ${U(B.red)}). On ne multiplie pas les potentiels par les coefficients.`)),
    h('p', { class: 'math' }, 'ΔG° = −nFE°', h('sub', {}, T('cell', 'pile')), ` = −${n} × ${fmtn(FARADAY, lang(), 0)} C/mol × ${fmtn(t.E, lang(), d)} V = `, h('strong', {}, `${dG.replace('-', '−')} kJ/mol`), ...cite('openstax-dg')),
    h('p', { class: 'math' }, `K = 10`, h('sup', {}, `nE°/${fmtn(0.0592, lang(), 4)} V`), ` = 10`, h('sup', {}, `${n} × ${fmtn(t.E, lang(), d)} / ${fmtn(0.0592, lang(), 4)}`), ' ≈ ', h('strong', {}, Kshow), ...cite('openstax-dg')),
    h('p', { class: spont ? 'note' : 'note refuse', id: 'rx-spont' }, spont
      ? T('E°cell is positive (ΔG° negative): the reaction is spontaneous as written under standard conditions.', 'E°pile est positif (ΔG° négatif) : la réaction est spontanée dans ce sens dans les conditions standard.')
      : T('E°cell is negative (ΔG° positive): as written, the reaction is not spontaneous under standard conditions; the reverse reaction is.', 'E°pile est négatif (ΔG° positif) : dans ce sens, la réaction n’est pas spontanée dans les conditions standard ; la réaction inverse l’est.'),
      ...cite('openstax-cell'), ' ', !spont ? h('button', { type: 'button', class: 'btn ghost', onclick: swapCouples }, T('Swap the roles', 'Échanger les rôles')) : null),
    h('p', { class: 'small muted' }, T(`n = ${n}: the electrons exchanged in the balanced equation as written. F = ${fmtn(FARADAY, lang(), 0)} C per mole of electrons.`, `n = ${n} : les électrons échangés dans l’équation équilibrée telle qu’écrite. F = ${fmtn(FARADAY, lang(), 0)} C par mole d’électrons.`), ...cite('openstax-dg')),
  ];
  for (const c of [A.c, B.c]) {
    if (c?.alt) kids.push(h('p', { class: 'small' }, T(`For ${U(c.ox)} / ${U(c.red)}, OpenStax gives ${signedE(c.E)} V; the Wikipedia data page gives ${signedE(c.alt.E)} V, citing Greenwood and Earnshaw. The tool uses ${signedE(c.E)} V.`, `Pour ${U(c.ox)} / ${U(c.red)}, OpenStax donne ${signedE(c.E)} V ; la page de données de Wikipédia donne ${signedE(c.alt.E)} V, d’après Greenwood et Earnshaw. L’outil utilise ${signedE(c.E)} V.`), ...cite(c.src, c.alt.src)));
  }
  return h('li', { class: 'step' }, ...kids);
}

// ---------------------------------------------------------------- page
function buildAll() {
  const main = ctx.panel;
  main.replaceChildren(
    h('h1', {}, T('Redox: oxidation numbers and balanced equations', 'Oxydoréduction : nombres d’oxydation et équations équilibrées')),
    h('p', { class: 'lead muted' }, T('Type or pick a species to see the oxidation number of each atom and the rule behind it. Then pick two couples to balance a redox reaction step by step, in acidic or basic solution, with its standard potential.', 'Tapez ou choisissez une espèce pour voir le nombre d’oxydation de chaque atome et la règle qui le donne. Choisissez ensuite deux couples pour équilibrer pas à pas une réaction d’oxydoréduction, en milieu acide ou basique, avec son potentiel standard.')),
    buildOxSection(),
    buildRxSection(),
    h('section', { class: 'card sources', style: 'margin-top:18px', 'aria-labelledby': 'src-h' },
      h('h2', { id: 'src-h' }, 'Sources'), list(),
      h('p', { class: 'small muted' }, L(OPENSTAX_REF)),
      h('p', { class: 'small muted' }, T('Potentials are copied from the tables (25 °C); the half-equations are balanced by the tool and checked against the printed ones. Texts on this page are our own.', 'Les potentiels sont repris des tables (25 °C) ; les demi-équations sont équilibrées par l’outil et comparées à celles imprimées. Les textes de cette page sont les nôtres.'))));
  renderOx();
  renderRx();
}

export function mount(c) {
  ctx = c;
  readHash();
  buildAll();
}
export function route() { readHash(); buildAll(); }
export const refresh = buildAll;
void COUPLES;
