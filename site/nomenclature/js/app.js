// Nomenclature tab (mounted by assets/app.js): how an inorganic compound gets
// its systematic IUPAC name, family by family, with a decision tree, coloured
// worked examples, oxidation-state diagrams and a quiz.
//
// State is local to the tab; no hash state. The quiz keeps its score when the
// language changes (the tab is rebuilt, not reloaded).
import { lang } from '../../assets/site.js';
import { h, citer, species } from '../../assets/ui.js';
import { SOURCES } from './sources.js';
import { PREFIXES, POLYATOMIC, OXO_LADDER, EXAMPLES, QUIZ_ITEMS } from './data.js';

const t = (k, vars = {}) => {
  let s = T[k]?.[lang()] ?? T[k]?.en ?? k;
  for (const [a, b] of Object.entries(vars)) s = s.split(`{${a}}`).join(String(b));
  return s;
};
const L = (o) => (o ? o[lang()] ?? o.en : '');
const P = (k, vars, ...ids) => h('p', {}, t(k, vars), ids.length ? ' ' : null, ...(ids.length ? cite(...ids) : []));

const SRC_IDS = ['iupac-brief', 'iupac-redbook', 'openstax-nomenclature', 'openstax-ionic', 'openstax-ox', 'iupac-os', 'iupac-organic', 'pubchem'];
const { cite, list: sourceList } = citer(SRC_IDS.map((id) => ({ id, ...SOURCES.find((s) => s.id === id) })));

// ---------------------------------------------------------------- text
const T = {
  title: { en: 'Naming inorganic compounds', fr: 'Nommer les composés inorganiques' },
  lead: {
    en: 'A systematic name is built from a few rules, applied in a fixed order: put the cation first, give the more electronegative partner the -ide ending, count the atoms with Greek prefixes, and show the oxidation state of a variable metal in Roman numerals. This tab walks through the rules, the decision tree, and a set of worked examples — then lets you practise with a quiz.',
    fr: 'Un nom systématique se construit avec quelques règles, appliquées dans un ordre fixe : le cation d’abord, le partenaire le plus électronégatif en -ure, les atomes comptés par des préfixes grecs, et le degré d’oxydation d’un métal variable en chiffres romains. Cet onglet déroule les règles, l’arbre de décision et une série d’exemples corrigés — puis vous laisse vous entraîner avec un quiz.',
  },
  toc: { en: 'On this page', fr: 'Sur cette page' },
  'toc.principles': { en: 'Five principles', fr: 'Cinq principes' },
  'toc.tree': { en: 'Decision tree', fr: 'Arbre de décision' },
  'toc.families': { en: 'Family by family', fr: 'Famille par famille' },
  'toc.examples': { en: 'Worked examples', fr: 'Exemples corrigés' },
  'toc.quiz': { en: 'Quiz', fr: 'Quiz' },
  sources: { en: 'Sources', fr: 'Sources' },

  // principles
  'pr.title': { en: 'Five principles, in the order they apply', fr: 'Cinq principes, dans l’ordre où ils s’appliquent' },
  'pr.1.t': { en: '1. Order: cation first, anion second', fr: '1. Ordre : le cation d’abord, l’anion ensuite' },
  'pr.1.p': {
    en: 'In an ionic compound the positive ion is named first and the negative ion second: sodium chloride, calcium oxide, ammonium nitrate. Neutral components come last, and in a hydrate the water follows the salt.',
    fr: 'Dans un composé ionique, l’ion positif est nommé en premier et l’ion négatif ensuite : chlorure de sodium, oxyde de calcium, nitrate d’ammonium. Les composants neutres viennent en dernier, et dans un hydrate l’eau suit le sel.',
  },
  'pr.2.t': { en: '2. The -ide ending', fr: '2. La terminaison -ure' },
  'pr.2.p': {
    en: 'A monatomic anion takes the -ide ending: chloride (Cl−), oxide (O2−), sulfide (S2−), nitride (N3−), hydride (H−). In a binary molecular compound the more electronegative element is treated as the anion and named second with -ide: carbon dioxide, sulfur trioxide. French uses -ure (chlorure, oxyde, sulfure, nitrure, hydrure).',
    fr: 'Un anion monoatomique prend la terminaison -ure : chlorure (Cl−), oxyde (O2−), sulfure (S2−), nitrure (N3−), hydrure (H−). Dans un composé moléculaire binaire, l’élément le plus électronégatif est traité comme l’anion et nommé en second avec -ure : dioxyde de carbone, trioxyde de soufre.',
  },
  'pr.3.t': { en: '3. Multiplicative prefixes', fr: '3. Préfixes multiplicatifs' },
  'pr.3.p': {
    en: 'Greek prefixes count the atoms or the entities: di-, tri-, tetra-, penta-, hexa-, hepta-, octa-, nona-, deca-. They are required in molecular names and optional for ionic ones (iron dichloride is correct, iron(II) chloride is preferred). Mono- is omitted before the first element of a molecular name, and there is no vowel elision — except that English writes monoxide. Bis, tris, tetrakis… wrap an already-prefixed name: tricalcium bis(phosphate).',
    fr: 'Les préfixes grecs comptent les atomes ou les entités : di-, tri-, tétra-, penta-, hexa-, hepta-, octa-, nona-, déca-. Ils sont obligatoires dans les noms moléculaires et facultatifs pour les ioniques (dichlorure de fer est correct, chlorure de fer(II) est préféré). Mono- est omis devant le premier élément d’un nom moléculaire, et il n’y a pas d’élision — sauf que l’anglais écrit monoxide. Bis, tris, tétrakis… encadrent un nom déjà préfixé : bis(phosphate) de tricalcium.',
  },
  'pr.4.t': { en: '4. Stock notation: the oxidation state in Roman numerals', fr: '4. Notation de Stock : le degré d’oxydation en chiffres romains' },
  'pr.4.p': {
    en: 'When a metal can form several cations, put its oxidation state in Roman numerals in parentheses immediately after its name, with no space: iron(II) chloride (FeCl2) versus iron(III) chloride (FeCl3), copper(I) oxide (Cu2O) versus copper(II) oxide (CuO). The numeral is the oxidation state, not the number of atoms: in Fe2O3 each iron is +3, so the name is iron(III) oxide.',
    fr: 'Quand un métal peut former plusieurs cations, on met son degré d’oxydation en chiffres romains entre parenthèses, juste après son nom, sans espace : chlorure de fer(II) (FeCl2) contre chlorure de fer(III) (FeCl3), oxyde de cuivre(I) (Cu2O) contre oxyde de cuivre(II) (CuO). Le chiffre est le degré d’oxydation, pas le nombre d’atomes : dans Fe2O3 chaque fer est +3, d’où oxyde de fer(III).',
  },
  'pr.5.t': { en: '5. Charge number and oxidation state are not the same notation', fr: '5. Nombre de charge et degré d’oxydation : deux notations différentes' },
  'pr.5.p': {
    en: 'An ion’s charge is written in Arabic numerals with the sign after the number: sodium(1+), iron(3+), chloride(1−). An oxidation state in a name is written in Roman numerals without a sign: iron(III). Both are printed in parentheses after the entity.',
    fr: 'La charge d’un ion s’écrit en chiffres arabes avec le signe après le nombre : sodium(1+), fer(3+), chlorure(1−). Un degré d’oxydation dans un nom s’écrit en chiffres romains sans signe : fer(III). Les deux se mettent entre parenthèses après l’entité.',
  },
  'pr.prefix': { en: 'The prefixes, one to twelve', fr: 'Les préfixes, de un à douze' },
  'pr.prefixNote': { en: 'mono- is omitted before the first element; English also writes monoxide. French accepts both pentaoxyde and pentoxyde for N2O5.', fr: 'mono- est omis devant le premier élément ; l’anglais écrit aussi monoxide. Le français accepte pentaoxyde et pentoxyde pour N2O5.' },
  'pr.num': { en: 'Number', fr: 'Nombre' },
  'pr.prefixCol': { en: 'Prefix', fr: 'Préfixe' },
  'pr.exCol': { en: 'Example', fr: 'Exemple' },
  'pr.charge': { en: 'Charge number (Arabic, sign shown)', fr: 'Nombre de charge (arabe, signe indiqué)' },
  'pr.ox': { en: 'Oxidation state (Roman, sign implied by the numeral)', fr: 'Degré d’oxydation (romain, signe porté par le chiffre)' },
  'pr.chargeEx': { en: 'Fe3+ is iron(3+); Cl− is chloride(1−).', fr: 'Fe3+ est fer(3+) ; Cl− est chlorure(1−).' },
  'pr.oxEx': { en: 'In FeCl3 iron is +3: iron(III) chloride.', fr: 'Dans FeCl3 le fer est +3 : chlorure de fer(III).' },

  // tree
  'tr.title': { en: 'Which rule applies? A decision tree', fr: 'Quelle règle appliquer ? Un arbre de décision' },
  'tr.lead': {
    en: 'Start at the top and answer each question. The coloured chips are the branch you take; the box at the end is the naming recipe.',
    fr: 'Partez du haut et répondez à chaque question. Les pastilles colorées indiquent la branche suivie ; l’encadré final donne la recette du nom.',
  },
  'tr.q1': { en: 'Does the formula show water of crystallisation (a centred dot followed by H2O)?', fr: 'La formule montre-t-elle de l’eau de cristallisation (un point centré suivi de H2O) ?' },
  'tr.yes': { en: 'yes', fr: 'oui' }, 'tr.no': { en: 'no', fr: 'non' },
  'tr.a1': { en: 'Name the anhydrous part by the rules below, then add a prefix + hydrate: CuSO4·5H2O → copper(II) sulfate pentahydrate.', fr: 'Nommez la partie anhydre avec les règles ci-dessous, puis ajoutez un préfixe + hydrate : CuSO4·5H2O → sulfate de cuivre(II) pentahydrate.' },
  'tr.q2': { en: 'Is there a metal cation (or NH4+) together with a non-metal or a polyatomic anion?', fr: 'Y a-t-il un cation métallique (ou NH4+) avec un non-métal ou un anion polyatomique ?' },
  'tr.a2': { en: 'Ionic compound: name the cation, then the anion. If the metal has several oxidation states, add the Stock numeral.', fr: 'Composé ionique : nommez le cation, puis l’anion. Si le métal a plusieurs degrés d’oxydation, ajoutez le chiffre de Stock.' },
  'tr.q3': { en: 'Two non-metals only?', fr: 'Deux non-métaux seulement ?' },
  'tr.a3': { en: 'Molecular compound: name the less electronegative element first, the other in -ide, with prefixes on both (mono- omitted on the first).', fr: 'Composé moléculaire : nommez l’élément le moins électronégatif d’abord, l’autre en -ure, avec des préfixes des deux côtés (mono- omis sur le premier).' },
  'tr.q4': { en: 'Is it an acid — hydrogen plus a non-metal, or hydrogen + oxygen + an element?', fr: 'Est-ce un acide — hydrogène + non-métal, ou hydrogène + oxygène + un élément ?' },
  'tr.a4': { en: 'Binary acid: hydro- + root + -ic acid (French: acide …hydrique). Oxoacid: -ate → -ic, -ite → -ous (French: -ique / -eux), with per-/hypo- kept.', fr: 'Acide binaire : acide + racine + -hydrique. Oxacide : -ate → -ique, -ite → -eux, avec per-/hypo- conservés.' },
  'tr.q5': { en: 'Anion is O2−, H− or OH−?', fr: 'L’anion est-il O2−, H− ou OH− ?' },
  'tr.a5': { en: 'Oxide, hydride or hydroxide respectively; the cation name comes first.', fr: 'Respectivement oxyde, hydrure ou hydroxyde ; le nom du cation vient d’abord.' },
  'tr.end': { en: 'Other anion (including a polyatomic ion): keep its name, e.g. sulfate, nitrate, permanganate, hydrogen carbonate.', fr: 'Autre anion (dont un ion polyatomique) : gardez son nom, par ex. sulfate, nitrate, permanganate, hydrogénocarbonate.' },
  'tr.stock': { en: 'Before you finish: does the metal have more than one oxidation state? Add (I), (II), (III)… after its name.', fr: 'Avant de conclure : le métal a-t-il plusieurs degrés d’oxydation ? Ajoutez (I), (II), (III)… après son nom.' },

  // families
  'fa.title': { en: 'Family by family', fr: 'Famille par famille' },
  'fa.oxide.t': { en: 'Oxides', fr: 'Oxydes' },
  'fa.oxide.p': {
    en: 'Oxygen is the more electronegative partner, so it is named oxide and comes second. With a metal the oxide is ionic (Na2O, Fe2O3); with a non-metal it is molecular and takes prefixes (CO2, N2O4, P4O10).',
    fr: 'L’oxygène est le partenaire le plus électronégatif : il se nomme oxyde et vient en second. Avec un métal, l’oxyde est ionique (Na2O, Fe2O3) ; avec un non-métal, il est moléculaire et prend des préfixes (CO2, N2O4, P4O10).',
  },
  'fa.hydride.t': { en: 'Hydrides', fr: 'Hydrures' },
  'fa.hydride.p': {
    en: 'With a metal, hydrogen is the hydride ion H−: sodium hydride, calcium hydride. With a non-metal the compound is molecular: hydrogen chloride, hydrogen sulfide, or a retained name such as ammonia (systematic azane) and methane.',
    fr: 'Avec un métal, l’hydrogène est l’ion hydrure H− : hydrure de sodium, hydrure de calcium. Avec un non-métal, le composé est moléculaire : chlorure d’hydrogène, sulfure d’hydrogène, ou un nom retenu comme ammoniac (azane en systématique) et méthane.',
  },
  'fa.acid.t': { en: 'Acids (binary and oxoacids)', fr: 'Acides (binaires et oxacides)' },
  'fa.acid.p': {
    en: 'Binary acid, H + a non-metal, in water: hydro- + root + -ic acid — hydrochloric, hydrofluoric, hydrosulfuric. Oxoacid, H + O + an element: take the anion name and turn -ate into -ic and -ite into -ous. The prefixes per- (most oxygens) and hypo- (fewest) carry over: perchlorate → perchloric acid, hypochlorite → hypochlorous acid. French follows the same ladder with -ique / -eux.',
    fr: 'Acide binaire, H + un non-métal, dans l’eau : acide + racine + -hydrique — chlorhydrique, fluorhydrique, sulfhydrique. Oxacide, H + O + un élément : on part du nom de l’anion et -ate devient -ique, -ite devient -eux. Les préfixes per- (le plus d’oxygènes) et hypo- (le moins) suivent : perchlorate → acide perchlorique, hypochlorite → acide hypochloreux.',
  },
  'fa.acid.note': {
    en: 'An oxoacid also has an additive systematic name, built as a coordination entity: H2SO4 is dihydroxidodioxidosulfur. School names such as sulfuric acid are retained by IUPAC and are the ones used here.',
    fr: 'Un oxacide a aussi un nom systématique additif, construit comme une entité de coordination : H2SO4 est dihydroxidodioxidosoufre. Les noms usuels comme acide sulfurique sont retenus par l’IUPAC et sont ceux employés ici.',
  },
  'fa.salt.t': { en: 'Salts', fr: 'Sels' },
  'fa.salt.p': {
    en: 'Cation first, anion second, each with its normal name; the charges must cancel. Polyatomic ions keep their names unchanged (sulfate, nitrate, permanganate). An acid salt names the remaining hydrogens with hydrogen / dihydrogen, not “bi”: NaHCO3 is sodium hydrogen carbonate, NaH2PO4 is sodium dihydrogen phosphate.',
    fr: 'Le cation d’abord, l’anion ensuite, chacun avec son nom ; les charges doivent s’annuler. Les ions polyatomiques gardent leur nom (sulfate, nitrate, permanganate). Un sel acide nomme les hydrogènes restants par hydrogéno / dihydrogéno, pas « bi » : NaHCO3 est l’hydrogénocarbonate de sodium, NaH2PO4 le dihydrogénophosphate de sodium.',
  },
  'fa.salt.table': { en: 'Common polyatomic ions', fr: 'Ions polyatomiques courants' },
  'fa.hydrate.t': { en: 'Hydrates', fr: 'Hydrates' },
  'fa.hydrate.p': {
    en: 'Water molecules trapped in the crystal are counted with a Greek prefix and the word hydrate, after the name of the anhydrous salt. In the formula they follow a centred dot: CuSO4·5H2O is copper(II) sulfate pentahydrate; MgSO4·7H2O is magnesium sulfate heptahydrate.',
    fr: 'Les molécules d’eau piégées dans le cristal se comptent avec un préfixe grec et le mot hydrate, après le nom du sel anhydre. Dans la formule, elles suivent un point centré : CuSO4·5H2O est le sulfate de cuivre(II) pentahydrate ; MgSO4·7H2O le sulfate de magnésium heptahydrate.',
  },
  'fa.common.t': { en: 'Retained common names', fr: 'Noms courants retenus' },
  'fa.common.p': {
    en: 'IUPAC keeps a few traditional names: water (H2O), ammonia (NH3), methane (CH4), and the oxoacid names above. Acetic acid is the retained name of ethanoic acid. Where a common name conflicts with the system, the systematic name is the one to learn first — and “bicarbonate” is written hydrogen carbonate in IUPAC names.',
    fr: 'L’IUPAC conserve quelques noms traditionnels : eau (H2O), ammoniac (NH3), méthane (CH4), et les noms d’oxacides ci-dessus. Acide acétique est le nom retenu de l’acide éthanoïque. Quand un nom courant s’oppose au système, c’est le nom systématique qu’il faut apprendre d’abord — et « bicarbonate » s’écrit hydrogénocarbonate dans les noms IUPAC.',
  },
  'fa.oxoTable': { en: 'The oxoacid ladder', fr: 'L’échelle des oxacides' },
  'fa.ionCol': { en: 'Ion', fr: 'Ion' },
  'fa.ionName': { en: 'Ion name', fr: 'Nom de l’ion' },
  'fa.acidCol': { en: 'Acid', fr: 'Acide' },
  'fa.acidName': { en: 'Acid name', fr: 'Nom de l’acide' },

  // examples
  'ex.title': { en: 'Worked examples', fr: 'Exemples corrigés' },
  'ex.lead': {
    en: 'Each card shows the formula, the systematic name and the reasoning in the order a chemist applies it. The oxidation-state diagram above the steps is the check that the numerals are right.',
    fr: 'Chaque fiche montre la formule, le nom systématique et le raisonnement dans l’ordre où un chimiste l’applique. Le diagramme de degrés d’oxydation au-dessus des étapes permet de vérifier les chiffres.',
  },
  'ex.oxAria': { en: 'Oxidation states', fr: 'Degrés d’oxydation' },
  cat_oxide: { en: 'Oxide', fr: 'Oxyde' },
  cat_hydride: { en: 'Hydride', fr: 'Hydrure' },
  cat_acid: { en: 'Acid', fr: 'Acide' },
  cat_salt: { en: 'Salt', fr: 'Sel' },
  cat_hydrate: { en: 'Hydrate', fr: 'Hydrate' },

  // quiz
  'qz.title': { en: 'Quiz: name it, or build it', fr: 'Quiz : nommez, ou construisez la formule' },
  'qz.lead': {
    en: 'Ten questions. Choose the correct name from a formula, or the correct formula from a name; the answer is checked at once and the reasoning is shown.',
    fr: 'Dix questions. Choisissez le bon nom à partir d’une formule, ou la bonne formule à partir d’un nom ; la réponse est vérifiée immédiatement et le raisonnement s’affiche.',
  },
  'qz.mode': { en: 'Direction', fr: 'Sens' },
  'qz.f2n': { en: 'Formula → name', fr: 'Formule → nom' },
  'qz.n2f': { en: 'Name → formula', fr: 'Nom → formule' },
  'qz.restart': { en: 'New round', fr: 'Nouvelle série' },
  'qz.q': { en: 'Question {i} of {n}', fr: 'Question {i} sur {n}' },
  'qz.giveName': { en: 'Which name is correct?', fr: 'Quel nom est correct ?' },
  'qz.giveFormula': { en: 'Which formula is correct?', fr: 'Quelle formule est correcte ?' },
  'qz.correct': { en: 'Correct.', fr: 'Correct.' },
  'qz.wrong': { en: 'Not this one. The right answer is {a}.', fr: 'Ce n’est pas celui-ci. La bonne réponse est {a}.' },
  'qz.why': { en: 'Why:', fr: 'Pourquoi :' },
  'qz.next': { en: 'Next question', fr: 'Question suivante' },
  'qz.done': { en: 'Round finished', fr: 'Série terminée' },
  'qz.score': { en: '{s} out of {n} correct.', fr: '{s} bonnes réponses sur {n}.' },
  'qz.best': { en: 'Best streak: {b}.', fr: 'Meilleure série : {b}.' },
  'qz.again': { en: 'Play again', fr: 'Rejouer' },
  'qz.streak': { en: 'Streak: {s}', fr: 'Série : {s}' },
  'qz.scoreLive': { en: 'Score: {s}', fr: 'Score : {s}' },
  'qz.correctShort': { en: 'correct', fr: 'correct' },
  'qz.wrongShort': { en: 'wrong', fr: 'faux' },
  'qz.state': { en: 'state', fr: 'état' },
};

// ---------------------------------------------------------------- helpers
// Formulas showing each prefix in use (2 to 7, 10); the rest are rare in school chemistry.
const PREFIX_EXAMPLE = {
  1: 'CO', 2: 'CO2', 3: 'SO3', 4: 'CCl4', 5: 'PCl5', 6: 'SF6', 7: 'IF7', 10: 'P4O10',
};
const formulaText = (f) => {
  if (!f.includes('·')) return species(f);
  const nodes = [];
  f.split('·').forEach((part, i) => {
    if (i) nodes.push(h('span', { class: 'nc-dot', 'aria-hidden': 'true' }, '·'));
    const m = /^(\d+)(.*)$/.exec(part);
    if (m) nodes.push(h('span', {}, m[1]), species(m[2]));
    else nodes.push(species(part));
  });
  return h('span', { class: 'nc-formula-inner' }, ...nodes);
};

const formulaWithState = (ex) => h('span', { class: 'nc-formula' }, formulaText(ex.f), ex.state ? h('span', { class: 'nc-state' }, ` (${ex.state})`) : null);

/** An oxidation-state diagram in the site's ox-species style. */
function oxDiagram(ex) {
  if (!ex.ox) return null;
  const label = `${ex.f}: ` + ex.ox.map((s) => `${s.el}${s.n > 1 ? s.n : ''} ${s.ox}`).join(', ');
  return h('div', { class: 'ox-species nc-ox', role: 'img', 'aria-label': `${t('ex.oxAria')} — ${label}` },
    ...ex.ox.map((s) => h('span', { class: 'ox-el' },
      h('span', { class: `on ${s.ox.startsWith('+') ? 'up' : 'down'}` }, s.ox),
      h('span', {}, s.el, s.n > 1 ? h('sub', {}, String(s.n)) : null))));
}

// ---------------------------------------------------------------- page
let panel = null;
let quizEls = null;

function contents() {
  return h('nav', { class: 'nc-toc', 'aria-label': t('toc') },
    h('h2', {}, t('toc')),
    h('ul', {},
      ...[['nc-principles', 'toc.principles'], ['nc-tree', 'toc.tree'], ['nc-families', 'toc.families'], ['nc-examples', 'toc.examples'], ['nc-quiz', 'toc.quiz']]
        .map(([id, k]) => h('li', {}, h('a', { href: `#${id}` }, t(k))))));
}

function principles() {
  const rules = ['1', '2', '3', '4', '5'].map((n) => h('li', { class: 'nc-rule' },
    h('h3', {}, t(`pr.${n}.t`)),
    P(`pr.${n}.p`, {}, ...(n === '1' ? ['iupac-brief', 'iupac-redbook', 'openstax-nomenclature'] : n === '3' ? ['iupac-brief'] : n === '5' ? ['iupac-brief', 'openstax-ox'] : ['iupac-brief', 'openstax-nomenclature']))));
  const prefixTable = h('table', { class: 'nc-table' },
    h('caption', {}, t('pr.prefix')),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, t('pr.num')), h('th', { scope: 'col' }, t('pr.prefixCol')), h('th', { scope: 'col' }, t('pr.exCol')))),
    h('tbody', {}, ...PREFIXES.map((p) => h('tr', {},
      h('th', { scope: 'row' }, String(p.n)),
      h('td', {}, p[lang()] ?? p.en, p.note ? h('span', { class: 'nc-small' }, ` — ${L(p.note)}`) : null),
      h('td', {}, PREFIX_EXAMPLE[p.n] ? species(PREFIX_EXAMPLE[p.n]) : h('span', { class: 'muted' }, '—'))))));
  return h('section', { class: 'card', id: 'nc-principles' },
    h('h2', {}, t('pr.title')),
    h('ol', { class: 'nc-rules' }, ...rules),
    h('p', { class: 'small muted' }, t('pr.prefixNote')),
    h('div', { class: 'table-wrap' }, prefixTable),
    h('div', { class: 'nc-two' },
      h('div', { class: 'nc-note' }, h('h3', {}, t('pr.charge')), h('p', {}, t('pr.chargeEx'))),
      h('div', { class: 'nc-note' }, h('h3', {}, t('pr.ox')), h('p', {}, t('pr.oxEx')))));
}

function tree() {
  const q = (n, text, branches) => h('li', { class: 'nc-q' },
    h('h3', {}, text),
    h('div', { class: 'nc-branches' }, ...branches.map(([kind, label, body]) =>
      h('div', { class: `nc-branch nc-${kind}` },
        h('span', { class: 'nc-chip' }, label),
        h('div', { class: 'nc-out' }, ...(Array.isArray(body) ? body : [body]))))));
  return h('section', { class: 'card', id: 'nc-tree' },
    h('h2', {}, t('tr.title')),
    h('p', {}, t('tr.lead')),
    h('ol', { class: 'nc-tree' },
      q(1, t('tr.q1'), [['yes', t('tr.yes'), t('tr.a1')], ['no', t('tr.no'), t('tr.q2')]]),
      q(2, t('tr.q2'), [['yes', t('tr.yes'), t('tr.a2')], ['no', t('tr.no'), t('tr.q4')]]),
      q(4, t('tr.q4'), [['yes', t('tr.yes'), t('tr.a4')], ['no', t('tr.no'), t('tr.q3')]]),
      q(3, t('tr.q3'), [['yes', t('tr.yes'), t('tr.a3')], ['no', t('tr.no'), t('tr.q5')]]),
      q(5, t('tr.q5'), [['yes', t('tr.yes'), t('tr.a5')], ['no', t('tr.no'), t('tr.end')]])),
    h('div', { class: 'nc-stock' }, h('strong', {}, t('tr.stock'))));
}

function families() {
  const ionTable = h('table', { class: 'nc-table nc-ion-table' },
    h('caption', {}, t('fa.salt.table')),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, t('fa.ionCol')), h('th', { scope: 'col' }, t('fa.ionName')))),
    h('tbody', {}, ...POLYATOMIC.map((p) => h('tr', {}, h('th', { scope: 'row' }, species(p.f)), h('td', {}, p[lang()] ?? p.en)))));
  const oxoTable = h('table', { class: 'nc-table' },
    h('caption', {}, t('fa.oxoTable')),
    h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, t('fa.acidCol')), h('th', { scope: 'col' }, t('fa.ionName')), h('th', { scope: 'col' }, t('fa.acidName')))),
    h('tbody', {}, ...OXO_LADDER.map((o) => h('tr', {},
      h('th', { scope: 'row' }, species(o.f)),
      h('td', {}, L(o.anion)),
      h('td', {}, L(o))))));
  return h('section', { class: 'card', id: 'nc-families' },
    h('h2', {}, t('fa.title')),
    h('h3', {}, t('fa.oxide.t')), P('fa.oxide.p', {}, 'iupac-brief', 'openstax-nomenclature'),
    h('h3', {}, t('fa.hydride.t')), P('fa.hydride.p', {}, 'iupac-brief'),
    h('h3', {}, t('fa.acid.t')), P('fa.acid.p', {}, 'openstax-nomenclature', 'iupac-brief'),
    h('div', { class: 'nc-note' }, P('fa.acid.note', {}, 'iupac-brief')),
    h('h3', {}, t('fa.salt.t')), P('fa.salt.p', {}, 'iupac-brief', 'openstax-nomenclature', 'openstax-ionic'),
    h('div', { class: 'table-wrap' }, ionTable),
    h('h3', {}, t('fa.hydrate.t')), P('fa.hydrate.p', {}, 'iupac-brief', 'openstax-nomenclature'),
    h('h3', {}, t('fa.common.t')), P('fa.common.p', {}, 'iupac-brief', 'pubchem', 'iupac-organic'),
    h('div', { class: 'table-wrap' }, oxoTable));
}

function exampleCard(ex) {
  const cat = `cat-${ex.cat}`;
  return h('article', { class: `nc-ex ${cat}` },
    h('div', { class: 'nc-ex-head' },
      formulaWithState(ex),
      h('span', { class: 'pill' }, t(`cat_${ex.cat}`))),
    h('p', { class: 'nc-name' }, L(ex)),
    oxDiagram(ex),
    h('ol', { class: 'nc-steps' }, ...ex.steps[lang()].map((s) => h('li', {}, s))),
    h('p', { class: 'nc-cite' }, ...cite(ex.cat === 'acid' ? 'openstax-nomenclature' : ex.cat === 'hydrate' ? 'iupac-brief' : ex.cat === 'hydride' ? 'iupac-brief' : 'openstax-nomenclature', 'pubchem')));
}

function examples() {
  const cats = ['oxide', 'hydride', 'acid', 'salt', 'hydrate'];
  return h('section', { id: 'nc-examples' },
    h('h2', {}, t('ex.title')),
    h('p', { class: 'lead' }, t('ex.lead')),
    ...cats.map((cat) => h('section', { class: 'nc-ex-group' },
      h('h3', {}, t(`cat_${cat}`)),
      h('div', { class: 'nc-ex-grid' }, ...EXAMPLES.filter((e) => e.cat === cat).map(exampleCard)))));
}

// ---------------------------------------------------------------- quiz
const QZ = { mode: 'f2n', n: 10, order: [], index: 0, score: 0, streak: 0, best: 0, item: null, answered: false, picked: null, options: [], done: false };
const shuffled = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const answerOf = (item) => (QZ.mode === 'f2n' ? L(item) : item.f);
const promptOf = (item) => (QZ.mode === 'f2n' ? formulaWithState(item) : L(item));
function optionsFor(item) {
  const ans = answerOf(item);
  const same = QUIZ_ITEMS.filter((x) => x !== item && x.cat === item.cat);
  const others = QUIZ_ITEMS.filter((x) => x !== item && x.cat !== item.cat);
  const seen = new Set([ans]);
  const picks = [];
  for (const group of [shuffled(same), shuffled(others)]) {
    for (const x of group) {
      if (picks.length === 3) break;
      const a = answerOf(x);
      if (seen.has(a)) continue;
      seen.add(a); picks.push(a);
    }
  }
  return shuffled([ans, ...picks]);
}
function startRound() {
  QZ.order = shuffled(QUIZ_ITEMS).slice(0, QZ.n);
  QZ.index = 0; QZ.score = 0; QZ.streak = 0; QZ.answered = false; QZ.picked = null; QZ.done = false;
  QZ.item = QZ.order[0];
  QZ.options = optionsFor(QZ.item);
}
function optionText(a, item) {
  // A formula option is displayed as a formula; a name stays a name.
  return QZ.mode === 'n2f' && /^[A-Z]/.test(a) ? formulaText(a) : a;
}
function renderQuiz() {
  if (!quizEls) return;
  const { status, card } = quizEls;
  status.textContent = t('qz.scoreLive', { s: QZ.score }) + (QZ.streak ? ` · ${t('qz.streak', { s: QZ.streak })}` : '');
  card.textContent = '';
  if (!QZ.item && QZ.done) {
    card.append(h('div', { class: 'nc-qz-done' },
      h('h3', {}, t('qz.done')),
      h('p', { class: 'nc-qz-score' }, t('qz.score', { s: QZ.score, n: QZ.n })),
      h('p', {}, t('qz.best', { b: QZ.best })),
      h('button', { type: 'button', class: 'btn', onclick: playAgain }, t('qz.again'))));
    return;
  }
  if (!QZ.item) return;
  const item = QZ.item;
  const prompt = h('div', { class: 'nc-qz-prompt' },
    h('p', { class: 'nc-qz-n' }, t('qz.q', { i: QZ.index + 1, n: QZ.n })),
    h('p', { class: 'nc-qz-ask' }, QZ.mode === 'f2n' ? t('qz.giveName') : t('qz.giveFormula')),
    h('div', { class: `nc-qz-target${QZ.mode === 'n2f' ? ' is-name' : ''}` }, promptOf(item)));
  const opts = h('div', { class: 'nc-qz-options', role: 'group', 'aria-label': QZ.mode === 'f2n' ? t('qz.giveName') : t('qz.giveFormula') },
    ...QZ.options.map((a) => {
      const b = h('button', { type: 'button', class: 'nc-qz-opt', disabled: QZ.answered }, optionText(a, item));
      if (QZ.answered) {
        if (a === answerOf(item)) b.classList.add('is-correct');
        if (a === QZ.picked && a !== answerOf(item)) b.classList.add('is-wrong');
      }
      b.addEventListener('click', () => answer(a));
      return b;
    }));
  const feedback = h('div', { class: 'nc-qz-feedback', role: 'status', 'aria-live': 'polite' });
  if (QZ.answered) {
    const good = QZ.picked === answerOf(item);
    feedback.append(h('p', { class: good ? 'nc-good' : 'nc-bad' },
      good ? t('qz.correct') : t('qz.wrong', { a: QZ.mode === 'f2n' ? L(item) : item.f })));
    feedback.append(h('p', { class: 'nc-why-lbl' }, t('qz.why')));
    feedback.append(h('ol', { class: 'nc-steps' }, ...item.steps[lang()].map((s) => h('li', {}, s))));
    feedback.append(h('button', { type: 'button', class: 'btn', onclick: next }, t('qz.next')));
  }
  card.append(prompt, opts, feedback);
  if (QZ.answered) feedback.querySelector('button')?.focus();
}
function answer(a) {
  if (QZ.answered) return;
  QZ.answered = true;
  QZ.picked = a;
  if (a === answerOf(QZ.item)) { QZ.score++; QZ.streak++; QZ.best = Math.max(QZ.best, QZ.streak); } else QZ.streak = 0;
  renderQuiz();
}
function next() {
  QZ.index++;
  if (QZ.index >= QZ.n) { QZ.item = null; QZ.done = true; renderQuiz(); return; }
  QZ.item = QZ.order[QZ.index];
  QZ.options = optionsFor(QZ.item);
  QZ.answered = false; QZ.picked = null;
  renderQuiz();
}
function playAgain() { startRound(); renderQuiz(); }

function quiz() {
  const modeGroup = h('div', { class: 'seg nc-mode', role: 'group', 'aria-label': t('qz.mode') });
  for (const [m, k] of [['f2n', 'qz.f2n'], ['n2f', 'qz.n2f']]) {
    const b = h('button', { type: 'button', 'data-mode': m, 'aria-pressed': String(QZ.mode === m) }, t(k));
    b.addEventListener('click', () => {
      if (QZ.mode === m) return;
      QZ.mode = m;
      modeGroup.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.mode === m)));
      startRound();
      renderQuiz();
    });
    modeGroup.append(b);
  }
  const restart = h('button', { type: 'button', class: 'chip-btn', onclick: playAgain }, t('qz.restart'));
  const status = h('p', { class: 'nc-qz-status', 'aria-live': 'polite' });
  const card = h('div', { class: 'nc-qz-card' });
  quizEls = { status, card };
  return h('section', { class: 'card', id: 'nc-quiz' },
    h('h2', {}, t('qz.title')),
    h('p', {}, t('qz.lead')),
    h('div', { class: 'nc-qz-bar' }, modeGroup, restart),
    status, card);
}

// ---------------------------------------------------------------- mount
export function mount(ctx) {
  panel = ctx.panel;
  if (!QZ.item && QZ.index === 0) startRound();
  panel.replaceChildren(
    h('header', { class: 'nc-head' },
      h('h1', {}, t('title')),
      h('p', { class: 'lead' }, t('lead'))),
    contents(),
    principles(),
    tree(),
    families(),
    examples(),
    quiz(),
    h('section', { class: 'card sources' }, h('h2', {}, t('sources')), sourceList()),
  );
  renderQuiz();
}

export function route() { /* no hash state */ }
export function refresh() { mount({ panel }); }
