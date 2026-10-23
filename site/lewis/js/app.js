// Lewis structures tab (mounted by assets/app.js).
//
// Element ids used by the browser checks (scripts/e2e.mjs):
//   #lw-input   formula field            #lw-pick   species list
//   #lw-msg     parser notes and errors  #lw-result the whole result
//   #lw-main    main drawing(s)          #lw-ve     valence electron total
//   #lw-steps   step-by-step list        #lw-shape  VSEPR summary of the centre
//   #lw-fc, #lw-os  show formal charges / oxidation states (checkboxes)
// State in the hash: #lewis?f=SO4%5E2-  (and &pick=<skeleton> when a formula fits several).
import { lang } from '../../assets/site.js';
import { h, citer, fmtn } from '../../assets/ui.js';
import { SOURCES, OPENSTAX_REF } from '../../assets/common.js';
import { analyse, vseprAt, oxidationStates } from '../../assets/chem/lewis.js';
import { speciesUnicode, hill } from '../../assets/chem/formula.js';
import { el, elName } from '../../assets/chem/elements.js';
import { drawLewis, layout, drawShape } from './draw.js';

// ---------------------------------------------------------------- sources
const PAGE_SOURCES = ['openstax-lewis', 'openstax-fc', 'openstax-vsepr', 'openstax-mo', 'wp-hypervalent', 'iupac-os', 'pubchem-pt',
  'openstax-ka', 'wp-tetrathionate', 'wp-peroxydisulfate', 'wp-n2o4', 'wp-oxalate'];
const { cite, list: sourceList } = citer(PAGE_SOURCES.map((id) => ({ id, ...SOURCES[id] })));

// ---------------------------------------------------------------- species list
const GROUPS = [
  { id: 'simple', en: 'Simple molecules', fr: 'Molécules simples', items: [
    ['H2O', 'water', 'eau'], ['NH3', 'ammonia', 'ammoniac'], ['CH4', 'methane', 'méthane'], ['H2S', 'hydrogen sulfide', 'sulfure d’hydrogène'],
    ['HCN', 'hydrogen cyanide', 'cyanure d’hydrogène'], ['CO2', 'carbon dioxide', 'dioxyde de carbone'], ['CO', 'carbon monoxide', 'monoxyde de carbone'],
    ['N2', 'nitrogen', 'diazote'], ['O2', 'oxygen', 'dioxygène'], ['H2O2', 'hydrogen peroxide', 'peroxyde d’hydrogène'], ['HClO', 'hypochlorous acid', 'acide hypochloreux'],
    ['COCl2', 'phosgene', 'phosgène'], ['SO2Cl2', 'sulfuryl chloride', 'chlorure de sulfuryle']] },
  { id: 'ions', en: 'Ions', fr: 'Ions', items: [
    ['NH4+', 'ammonium', 'ion ammonium'], ['H3O+', 'hydronium', 'ion oxonium'], ['OH-', 'hydroxide', 'ion hydroxyde'], ['CN-', 'cyanide', 'ion cyanure'],
    ['NO2-', 'nitrite', 'ion nitrite'], ['NO3-', 'nitrate', 'ion nitrate'], ['CO3^2-', 'carbonate', 'ion carbonate'], ['SO4^2-', 'sulfate', 'ion sulfate'],
    ['SO3^2-', 'sulfite', 'ion sulfite'], ['PO4^3-', 'phosphate', 'ion phosphate'], ['ClO4-', 'perchlorate', 'ion perchlorate'], ['ClO3-', 'chlorate', 'ion chlorate'],
    ['SCN-', 'thiocyanate', 'ion thiocyanate'], ['NO2+', 'nitronium', 'ion nitronium'], ['BH4-', 'borohydride', 'ion borohydrure']] },
  { id: 'res', en: 'Multiple bonds and resonance', fr: 'Liaisons multiples et mésomérie', items: [
    ['O3', 'ozone', 'ozone'], ['SO2', 'sulfur dioxide', 'dioxyde de soufre'], ['SO3', 'sulfur trioxide', 'trioxyde de soufre'], ['N2O', 'nitrous oxide', 'protoxyde d’azote'],
    ['HNO3', 'nitric acid', 'acide nitrique'], ['HCOO-', 'formate', 'ion méthanoate'], ['CH3COO-', 'acetate', 'ion éthanoate (acétate)']] },
  { id: 'exc', en: 'Exceptions to the octet rule', fr: 'Exceptions à la règle de l’octet', items: [
    ['NO', 'nitric oxide', 'monoxyde d’azote'], ['NO2', 'nitrogen dioxide', 'dioxyde d’azote'], ['ClO2', 'chlorine dioxide', 'dioxyde de chlore'],
    ['BF3', 'boron trifluoride', 'trifluorure de bore'], ['BeCl2', 'beryllium chloride', 'chlorure de béryllium'], ['AlCl3', 'aluminium chloride (monomer)', 'chlorure d’aluminium (monomère)'],
    ['PCl5', 'phosphorus pentachloride', 'pentachlorure de phosphore'], ['SF6', 'sulfur hexafluoride', 'hexafluorure de soufre'], ['SF4', 'sulfur tetrafluoride', 'tétrafluorure de soufre'],
    ['ClF3', 'chlorine trifluoride', 'trifluorure de chlore'], ['XeF2', 'xenon difluoride', 'difluorure de xénon'], ['XeF4', 'xenon tetrafluoride', 'tétrafluorure de xénon'],
    ['IF5', 'iodine pentafluoride', 'pentafluorure d’iode'], ['ICl4-', 'tetrachloroiodate', 'ion tétrachloroiodate'], ['I3-', 'triiodide', 'ion triiodure']] },
  { id: 'org', en: 'Organic (condensed formulas)', fr: 'Organique (formules semi-développées)', items: [
    ['C2H6', 'ethane', 'éthane'], ['C2H4', 'ethene (ethylene)', 'éthène (éthylène)'], ['C2H2', 'ethyne (acetylene)', 'éthyne (acétylène)'],
    ['CH2O', 'methanal (formaldehyde)', 'méthanal (formaldéhyde)'], ['CH3OH', 'methanol', 'méthanol'], ['CH3CH2OH', 'ethanol', 'éthanol'], ['CH3OCH3', 'dimethyl ether', 'méthoxyméthane'],
    ['CH3CHO', 'ethanal (acetaldehyde)', 'éthanal (acétaldéhyde)'], ['CH3COCH3', 'propanone (acetone)', 'propanone (acétone)'], ['CH3COOH', 'ethanoic (acetic) acid', 'acide éthanoïque (acétique)'],
    ['HCOOCH3', 'methyl methanoate', 'méthanoate de méthyle'], ['CH3NH2', 'methylamine', 'méthylamine'], ['CH3CN', 'ethanenitrile (acetonitrile)', 'éthanenitrile (acétonitrile)'],
    ['CO(NH2)2', 'urea', 'urée']] },
  { id: 'cur', en: 'Several central atoms', fr: 'Plusieurs atomes centraux', items: [
    ['S2O3^2-', 'thiosulfate', 'ion thiosulfate'], ['S4O6^2-', 'tetrathionate', 'ion tétrathionate'], ['S2O8^2-', 'peroxodisulfate', 'ion peroxodisulfate'],
    ['N2O4', 'dinitrogen tetroxide', 'tétraoxyde de diazote'], ['C2O4^2-', 'oxalate', 'ion oxalate'], ['H3PO3', 'phosphorous acid', 'acide phosphoreux'], ['N2H4', 'hydrazine', 'hydrazine']] },
];
const NAMES = new Map(GROUPS.flatMap((g) => g.items.map(([f, en, fr]) => [f, { en, fr }])));
const EXAMPLES = ['H2O', 'CO2', 'NH4+', 'NO3-', 'O3', 'SO4^2-', 'XeF4', 'NO2', 'BF3', 'CH3COOH'];

// ---------------------------------------------------------------- strings
const D = {
  title: { en: 'Lewis structures', fr: 'Schémas de Lewis' },
  lead: {
    en: 'Type a formula or an ion, or pick one from the list: the page counts the valence electrons, builds the skeleton, places bonds and lone pairs, computes formal charges, finds resonance forms and explains every exception to the octet rule, step by step.',
    fr: 'Tapez une formule ou un ion, ou choisissez-le dans la liste : la page compte les électrons de valence, construit le squelette, place liaisons et doublets non liants, calcule les charges formelles, trouve les formes mésomères et explique chaque exception à la règle de l’octet, étape par étape.',
  },
  'in.label': { en: 'Formula or ion', fr: 'Formule ou ion' },
  'in.hint': {
    en: 'Charge after the formula: NH4+, SO4^2- or SO4 2-. Condensed formulas (CH3COOH, CH3OCH3) fix which atom is bonded to which.',
    fr: 'Charge après la formule : NH4+, SO4^2- ou SO4 2-. Une formule semi-développée (CH3COOH, CH3OCH3) fixe quel atome est lié à quel autre.',
  },
  'pick.label': { en: 'Or choose a species', fr: 'Ou choisissez une espèce' },
  'pick.none': { en: '— list of species —', fr: '— liste d’espèces —' },
  'ex.label': { en: 'Examples:', fr: 'Exemples :' },
  'opt.fc': { en: 'Formal charges', fr: 'Charges formelles' },
  'opt.os': { en: 'Oxidation states', fr: 'Nombres d’oxydation' },
  'res.title': { en: 'Lewis structure', fr: 'Schéma de Lewis' },
  'res.resonance': { en: '{n} resonance forms', fr: '{n} formes mésomères' },
  'fig.caption': { en: 'Bonds as lines, lone pairs as pairs of dots, formal charges in circles, ions in brackets.', fr: 'Liaisons en traits, doublets non liants en paires de points, charges formelles dans des cercles, ions entre crochets.' },
  'dl.svg': { en: 'Download the drawing (SVG)', fr: 'Télécharger le dessin (SVG)' },
  'desc.bonds': { en: 'Bonds: {list}.', fr: 'Liaisons : {list}.' },
  'desc.lone': { en: 'Lone pairs: {list}.', fr: 'Doublets non liants : {list}.' },
  'desc.fc': { en: 'Formal charges: {list}.', fr: 'Charges formelles : {list}.' },
  'desc.single': { en: 'single', fr: 'simple' }, 'desc.double': { en: 'double', fr: 'double' }, 'desc.triple': { en: 'triple', fr: 'triple' },
  'sum.ve': { en: 'Valence electrons', fr: 'Électrons de valence' },
  'sum.bonds': { en: 'Bonding pairs', fr: 'Doublets liants' },
  'sum.lone': { en: 'Lone pairs', fr: 'Doublets non liants' },
  'sum.unpaired': { en: 'Unpaired electron', fr: 'Électron célibataire' },
  'sum.fc': { en: 'Formal charges', fr: 'Charges formelles' },
  'sum.fc.none': { en: 'all zero', fr: 'toutes nulles' },
  'sum.shape': { en: 'Shape around {el}', fr: 'Géométrie autour de {el}' },
  'steps.title': { en: 'Step by step', fr: 'Étape par étape' },
  // step 1
  's1.title': { en: 'Count the valence electrons', fr: 'Compter les électrons de valence' },
  's1.text': { en: 'Each atom brings the electrons of its outer shell (its group number for main-group elements); a negative charge adds electrons, a positive charge removes them.', fr: 'Chaque atome apporte les électrons de sa couche externe (le numéro de son groupe, pour les éléments des blocs s et p) ; une charge négative ajoute des électrons, une charge positive en retire.' },
  's1.el': { en: 'Element', fr: 'Élément' },
  's1.n': { en: 'Atoms', fr: 'Atomes' },
  's1.v': { en: 'Valence e⁻', fr: 'e⁻ de valence' },
  's1.sub': { en: 'Subtotal', fr: 'Sous-total' },
  's1.charge': { en: 'Charge {c}', fr: 'Charge {c}' },
  's1.total': { en: 'Total', fr: 'Total' },
  's1.pairs': { en: '{t} electrons, that is {p} pairs.', fr: '{t} électrons, soit {p} doublets.' },
  's1.pairsOdd': { en: '{t} electrons: an odd number, so one electron will stay unpaired.', fr: '{t} électrons : un nombre impair, donc un électron restera célibataire.' },
  // step 2
  's2.title': { en: 'Build the skeleton', fr: 'Construire le squelette' },
  'm.atom': { en: 'A single atom: its Lewis symbol shows its valence electrons around the symbol.', fr: 'Un seul atome : son symbole de Lewis montre ses électrons de valence autour du symbole.' },
  'm.h2': { en: 'Two hydrogen atoms share one pair of electrons.', fr: 'Deux atomes d’hydrogène mettent en commun un doublet.' },
  'm.one-heavy': { en: 'One atom other than hydrogen: it is the central atom, and every hydrogen is bonded to it (hydrogen makes only one bond).', fr: 'Un seul atome autre que l’hydrogène : c’est l’atome central, et chaque hydrogène lui est lié (l’hydrogène ne forme qu’une liaison).' },
  'm.pair': { en: 'Two atoms other than hydrogen, bonded to each other. Where several placements of the hydrogens are possible, all were tried and the formal charges decided.', fr: 'Deux atomes autres que l’hydrogène, liés entre eux. Quand plusieurs positions des hydrogènes sont possibles, toutes ont été essayées et les charges formelles ont tranché.' },
  'm.x2': { en: 'Two atoms of the same element, bonded to each other.', fr: 'Deux atomes du même élément, liés entre eux.' },
  'm.centre': { en: 'One central atom bonded to all the others. Every possible central atom (and every placement of the hydrogens) was tried; the structure kept is the one the guidelines rank best. As the textbook says, the least electronegative atom is usually central, and hydrogen and fluorine are never central.', fr: 'Un atome central lié à tous les autres. Chaque atome central possible (et chaque position des hydrogènes) a été essayé ; la structure retenue est celle que les règles classent la meilleure. Comme le dit le manuel, l’atome le moins électronégatif est en général central, l’hydrogène et le fluor ne le sont jamais.' },
  'm.three-heavy': { en: 'Three atoms other than hydrogen in a row. Each of them was tried in the middle (with every placement of the hydrogens); the structure kept is the one the guidelines rank best. The least electronegative atom is usually central.', fr: 'Trois atomes autres que l’hydrogène à la suite. Chacun a été essayé au milieu (avec chaque position des hydrogènes) ; la structure retenue est celle que les règles classent la meilleure. L’atome le moins électronégatif est en général central.' },
  'm.condensed': { en: 'Condensed formula: the atoms are joined in the order written. Each group of atoms written after an atom is bonded to it (in CH3COOH the first C carries three H and the second C; the second C carries both O, the last O carries the last H).', fr: 'Formule semi-développée : les atomes sont liés dans l’ordre d’écriture. Les atomes écrits après un atome lui sont liés (dans CH3COOH, le premier C porte trois H et le second C ; le second C porte les deux O, le dernier O porte le dernier H).' },
  'm.curated': { en: 'This species has several central atoms; its skeleton cannot be guessed from the formula alone. The one used is the known structure: {name}.', fr: 'Cette espèce a plusieurs atomes centraux ; son squelette ne se devine pas à partir de la seule formule. Celui utilisé est la structure connue : {name}.' },
  's2.tried': { en: '{n} skeletons were compared.', fr: '{n} squelettes ont été comparés.' },
  // step 3
  's3.title': { en: 'Single bonds, then lone pairs on the outer atoms', fr: 'Liaisons simples, puis doublets sur les atomes externes' },
  's3.text': { en: 'Each bond of the skeleton is first drawn single: {nb} bonds use {used} electrons, {rem} are left. The outer atoms get their octet first (hydrogen: 2 electrons), which uses {outer}.', fr: 'Chaque liaison du squelette est d’abord simple : {nb} liaisons utilisent {used} électrons, il en reste {rem}. Les atomes externes reçoivent d’abord leur octet (l’hydrogène : 2 électrons), ce qui en utilise {outer}.' },
  's3.left': { en: 'The {left} electrons still left go on the central atom.', fr: 'Les {left} électrons qui restent vont sur l’atome central.' },
  's3.none': { en: 'No electrons are left for the central atom.', fr: 'Il ne reste aucun électron pour l’atome central.' },
  's3.short': { en: 'Now {list}.', fr: 'À ce stade : {list}.' },
  's3.has': { en: '{el} has {n} electrons', fr: '{el} a {n} électrons' },
  // step 4
  's4.title': { en: 'Complete the octets with multiple bonds', fr: 'Compléter les octets par des liaisons multiples' },
  's4.multi': { en: 'An atom that still lacks electrons takes a lone pair of a neighbour as a shared pair: {list}.', fr: 'Un atome à qui il manque encore des électrons met en commun un doublet non liant d’un voisin : {list}.' },
  's4.double': { en: 'a double bond {a}={b}', fr: 'une liaison double {a}={b}' },
  's4.triple': { en: 'a triple bond {a}≡{b}', fr: 'une liaison triple {a}≡{b}' },
  's4.none': { en: 'Every atom already has its octet (or its exception, below): no multiple bond is needed.', fr: 'Chaque atome a déjà son octet (ou son exception, plus bas) : aucune liaison multiple n’est nécessaire.' },
  's4.expanded': { en: 'Electrons beyond eight stay on {el}, an element of period {p} (see the exceptions below).', fr: 'Les électrons au-delà de huit restent sur {el}, un élément de la période {p} (voir les exceptions plus bas).' },
  's4.fcchoice': { en: 'Where several choices are possible, the formal charges decide (step 5 and the comparison of structures).', fr: 'Quand plusieurs choix sont possibles, ce sont les charges formelles qui décident (étape 5 et comparaison des structures).' },
  // step 5
  's5.title': { en: 'Formal charges', fr: 'Charges formelles' },
  's5.text': { en: 'Formal charge = valence electrons − lone-pair electrons − ½ bonding electrons. It is a bookkeeping device, not a real charge; the formal charges add up to the charge of the species.', fr: 'Charge formelle = électrons de valence − électrons des doublets non liants − ½ électrons liants. C’est un outil de comptage, pas une charge réelle ; la somme des charges formelles est égale à la charge de l’espèce.' },
  's5.atom': { en: 'Atom', fr: 'Atome' },
  's5.calc': { en: 'Calculation', fr: 'Calcul' },
  's5.fc': { en: 'Formal charge', fr: 'Charge formelle' },
  's5.sum': { en: 'Sum of the formal charges: {s}, the charge of the species.', fr: 'Somme des charges formelles : {s}, la charge de l’espèce.' },
  // step 6
  's6.title': { en: 'Resonance', fr: 'Mésomérie (résonance)' },
  's6.text': { en: 'With the same skeleton, {n} equally good ways of placing the electrons exist: these are resonance forms. The real species is none of them but their average, the resonance hybrid.', fr: 'Avec le même squelette, il existe {n} façons aussi bonnes de placer les électrons : ce sont des formes mésomères (de résonance). L’espèce réelle n’est aucune d’entre elles mais leur moyenne, l’hybride de résonance.' },
  's6.avg': { en: 'Each {a}–{b} bond has the same average order, {o}: all these bonds are alike.', fr: 'Chaque liaison {a}–{b} a le même ordre moyen, {o} : toutes ces liaisons sont identiques.' },
  's6.minor': { en: 'Less important forms (same formal-charge count, but the negative charge on a less electronegative atom, or like charges side by side):', fr: 'Formes moins importantes (autant de charges formelles, mais la charge négative sur un atome moins électronégatif, ou des charges de même signe côte à côte) :' },
  's6.single': { en: 'Only one good arrangement of the electrons: no resonance to draw.', fr: 'Une seule bonne façon de placer les électrons : pas de mésomérie à dessiner.' },
  // step 7
  's7.title': { en: 'Why this structure and not another?', fr: 'Pourquoi cette structure et pas une autre ?' },
  's7.text': { en: 'Every choice of bond orders (single, double, triple) on every skeleton was tried, then ranked with the textbook guidelines, in this order: complete octets; formal charges zero where possible, otherwise as small as possible; adjacent charges of opposite sign; negative charges on the more electronegative atoms. The best structure of each losing kind:', fr: 'Chaque choix d’ordres de liaison (simple, double, triple) sur chaque squelette a été essayé, puis classé selon les règles du manuel, dans cet ordre : octets complets ; charges formelles nulles si possible, sinon les plus petites possible ; charges voisines de signes opposés ; charges négatives sur les atomes les plus électronégatifs. La meilleure structure de chaque type écarté :' },
  's7.kept': { en: 'kept', fr: 'retenue' },
  'lose.octet': { en: 'an atom lacks its octet', fr: 'un atome n’a pas son octet' },
  'lose.fc-sum': { en: 'larger formal charges in total', fr: 'charges formelles plus grandes au total' },
  'lose.fc-max': { en: 'a formal charge larger than needed', fr: 'une charge formelle plus grande que nécessaire' },
  'lose.fc-count': { en: 'more atoms carry a formal charge', fr: 'plus d’atomes portent une charge formelle' },
  'lose.like-charges': { en: 'charges of the same sign side by side', fr: 'charges de même signe côte à côte' },
  'lose.expanded': { en: 'more than eight electrons where an octet structure is as good', fr: 'plus de huit électrons alors qu’une structure à octets est aussi bonne' },
  'lose.centre-en': { en: 'a more electronegative central atom', fr: 'un atome central plus électronégatif' },
  'lose.fc-placement': { en: 'negative charge on a less electronegative atom', fr: 'charge négative sur un atome moins électronégatif' },
  'lose.same': { en: 'equivalent', fr: 'équivalente' },
  's7.fcsum': { en: 'Σ|charges| = {n}', fr: 'Σ|charges| = {n}' },
  // step 8
  's8.title': { en: 'Exceptions to the octet rule', fr: 'Exceptions à la règle de l’octet' },
  'x.odd': { en: 'An odd number of electrons ({n}): one electron cannot be paired, the species is a free radical. As in the textbook’s NO example, the octets go to the more electronegative atoms and the unpaired electron sits on {el}.', fr: 'Un nombre impair d’électrons ({n}) : un électron ne peut pas être apparié, l’espèce est un radical. Comme dans l’exemple de NO du manuel, les octets vont aux atomes les plus électronégatifs et l’électron célibataire est sur {el}.' },
  'x.incomplete': { en: '{el} has only {n} electrons around it: an electron-deficient atom. This is common for elements of groups 2 and 13. A double bond would complete the octet but put a positive formal charge on the more electronegative outer atom; for BF3, measured bond lengths are close to single bonds.', fr: '{el} n’a que {n} électrons autour de lui : un atome déficient en électrons. C’est fréquent pour les éléments des groupes 2 et 13. Une liaison double compléterait l’octet mais mettrait une charge formelle positive sur l’atome externe plus électronégatif ; pour BF3, les longueurs de liaison mesurées sont proches de liaisons simples.' },
  'x.expanded-required': { en: '{el} has {n} electrons around it. With these atoms and electrons, no structure gives every atom an octet: {el}, an element of period {p}, is drawn with more than eight electrons (an “expanded octet”, a hypervalent atom). Period-2 atoms (C, N, O, F) never do this.', fr: '{el} a {n} électrons autour de lui. Avec ces atomes et ces électrons, aucune structure ne donne un octet à chaque atome : {el}, élément de la période {p}, est dessiné avec plus de huit électrons (« octet étendu », atome hypervalent). Les atomes de la période 2 (C, N, O, F) ne le font jamais.' },
  'x.expanded-optional': { en: 'Two drawings are found in books. The one above minimises the formal charges and gives {el} {n} electrons (the textbook’s formal-charge guidelines). The one below keeps every atom to an octet at the cost of larger formal charges. Both have the same electrons and the same shape.', fr: 'On trouve deux dessins dans les livres. Celui du haut minimise les charges formelles et donne {n} électrons à {el} (les règles des charges formelles du manuel). Celui du bas garde un octet pour chaque atome, au prix de charges formelles plus grandes. Les deux ont les mêmes électrons et la même géométrie.' },
  'x.hyper-why': { en: 'Why period 3 and beyond? The textbook explains it with the empty d orbitals of the same shell. More recent work finds that d orbitals contribute little to the bonding; the bonds are better described as polar, or with three-centre four-electron bonds, which keeps the octet. IUPAC still recommends expanded-octet drawings for groups such as sulfones, to avoid many formal charges.', fr: 'Pourquoi à partir de la période 3 ? Le manuel l’explique par les orbitales d vides de la même couche. Des travaux plus récents montrent que les orbitales d contribuent peu à la liaison ; les liaisons sont mieux décrites comme polaires, ou par des liaisons à trois centres et quatre électrons, ce qui respecte l’octet. L’IUPAC recommande pourtant les dessins à octet étendu pour des groupes comme les sulfones, pour éviter de nombreuses charges formelles.' },
  'x.octet-caption': { en: 'Octet structure: formal charges {list}', fr: 'Structure à octets : charges formelles {list}' },
  'x.o2': { en: 'The Lewis structure of O2 pairs every electron, yet O2 is paramagnetic with two unpaired electrons: the Lewis model cannot show this, molecular orbital theory explains it.', fr: 'Le schéma de Lewis de O2 apparie tous les électrons, pourtant O2 est paramagnétique avec deux électrons célibataires : le modèle de Lewis ne peut pas le montrer, la théorie des orbitales moléculaires l’explique.' },
  'x.thiosulfate': { en: 'Thiosulfate is a sulfate in which one O is replaced by S: the central S carries three O and the other S.', fr: 'Le thiosulfate est un sulfate dont un O est remplacé par S : le S central porte trois O et l’autre S.' },
  'x.centre-rule': { en: 'Several central atoms gave equally good formal charges; without hydrogen, the textbook rule settles it: the least electronegative atom is central.', fr: 'Plusieurs atomes centraux donnaient des charges formelles aussi bonnes ; sans hydrogène, la règle du manuel tranche : l’atome le moins électronégatif est central.' },
  'x.h3po3': { en: 'Phosphorous acid gives only two protons (it has two Ka values in the table): two H are on O, the third is bonded to P.', fr: 'L’acide phosphoreux ne cède que deux protons (il a deux Ka dans la table) : deux H sont portés par des O, le troisième est lié à P.' },
  'x.none': { en: 'None: every atom has an octet (hydrogen: 2 electrons).', fr: 'Aucune : chaque atome a son octet (l’hydrogène : 2 électrons).' },
  // step 9
  's9.title': { en: 'Shape (VSEPR)', fr: 'Géométrie (VSEPR)' },
  's9.text': { en: 'Electron domains around an atom (bonded atoms, a multiple bond counting once, and lone pairs) get as far apart as possible.', fr: 'Les domaines électroniques autour d’un atome (atomes liés, une liaison multiple comptant pour un, et doublets non liants) s’écartent le plus possible.' },
  's9.atom': { en: 'Around {el}: {b} bonded atoms and {lp} lone pairs, {d} domains ({axe}). Electron-pair geometry: {eg}; molecular shape: {shape}; angles {angle}.', fr: 'Autour de {el} : {b} atomes liés et {lp} doublets non liants, {d} domaines ({axe}). Géométrie des domaines : {eg} ; géométrie de la molécule : {shape} ; angles {angle}.' },
  's9.odd': { en: 'The unpaired electron counts as a domain here; it repels less than a pair, so the real angle is larger.', fr: 'L’électron célibataire compte ici comme un domaine ; il repousse moins qu’un doublet, donc l’angle réel est plus grand.' },
  's9.water': { en: 'For water the measured angle is 104.5°.', fr: 'Pour l’eau, l’angle mesuré est 104,5°.' },
  's9.beyond': { en: 'Seven domains around {el}: beyond the shapes of the basic VSEPR table.', fr: 'Sept domaines autour de {el} : au-delà des géométries du tableau VSEPR de base.' },
  's9.none': { en: 'Two atoms only: the molecule is linear.', fr: 'Deux atomes seulement : la molécule est linéaire.' },
  // step 10
  's10.title': { en: 'Oxidation states of each atom', fr: 'Nombre d’oxydation de chaque atome' },
  's10.text': { en: 'IUPAC’s rule on the Lewis structure: every bond between different atoms is given entirely to the more electronegative one (Allen scale), bonds between like atoms are split equally; the oxidation state is the charge each atom is then left with.', fr: 'La règle de l’IUPAC appliquée au schéma de Lewis : chaque liaison entre atomes différents est attribuée entièrement au plus électronégatif (échelle d’Allen), les liaisons entre atomes identiques sont partagées ; le nombre d’oxydation est la charge qui reste alors à chaque atome.' },
  's10.octet': { en: 'Computed on the octet structure (the result differs only when like atoms share a multiple bond).', fr: 'Calculé sur la structure à octets (le résultat ne change que si des atomes identiques partagent une liaison multiple).' },
  's10.homo': { en: 'All atoms are of one element: they share the charge equally, {v} each.', fr: 'Tous les atomes sont du même élément : ils se partagent la charge, {v} chacun.' },
  's10.close': { en: 'Careful: {a} and {b} have almost the same electronegativity, so the sign depends on the scale used.', fr: 'Attention : {a} et {b} ont presque la même électronégativité, le signe dépend donc de l’échelle utilisée.' },
  's10.link': { en: 'Oxidation numbers and redox reactions', fr: 'Nombres d’oxydation et oxydoréduction' },
  // refusals and errors
  'err.empty': { en: 'Type a formula, for example H2O or SO4^2-.', fr: 'Tapez une formule, par exemple H2O ou SO4^2-.' },
  'err.lowercase': { en: 'Element symbols start with a capital letter: “{char}” is not one (Co is cobalt, CO is carbon monoxide).', fr: 'Les symboles des éléments commencent par une majuscule : « {char} » n’en est pas un (Co est le cobalt, CO le monoxyde de carbone).' },
  'err.unknown-element': { en: '“{sym}” is not an element symbol.', fr: '« {sym} » n’est pas un symbole d’élément.' },
  'err.unbalanced': { en: 'A bracket is not closed (or closed twice).', fr: 'Une parenthèse n’est pas fermée (ou fermée deux fois).' },
  'err.coefficient': { en: 'Type one species, without a number in front.', fr: 'Tapez une seule espèce, sans nombre devant.' },
  'err.hydrate': { en: 'Hydrates (·5H2O) are not handled: type the species alone.', fr: 'Les hydrates (·5H2O) ne sont pas traités : tapez l’espèce seule.' },
  'err.bad-charge': { en: 'The charge is not readable: write it at the end, like NH4+ or SO4^2-.', fr: 'La charge n’est pas lisible : écrivez-la à la fin, comme NH4+ ou SO4^2-.' },
  'err.bad-count': { en: 'An atom count cannot be zero.', fr: 'Un nombre d’atomes ne peut pas être nul.' },
  'err.empty-group': { en: 'Empty brackets.', fr: 'Parenthèses vides.' },
  'err.bad-char': { en: 'The character “{char}” is not understood.', fr: 'Le caractère « {char} » n’est pas compris.' },
  'ref.transition-metal': { en: '{el} is a transition metal: its compounds are described by coordination chemistry (d electrons, ligands), not by simple Lewis structures. This page covers main-group elements.', fr: '{el} est un métal de transition : ses composés relèvent de la chimie de coordination (électrons d, ligands), pas des schémas de Lewis simples. Cette page traite des éléments des blocs s et p.' },
  'ref.metal': { en: '{el} is a metal: its compounds are mostly ionic or form extended solids; this page does not draw them.', fr: '{el} est un métal : ses composés sont surtout ioniques ou forment des solides étendus ; cette page ne les dessine pas.' },
  'ref.noble': { en: '{el} forms no stable compounds; only xenon and krypton fluorides and oxides are drawn here.', fr: '{el} ne forme pas de composés stables ; seuls les fluorures et oxydes de xénon et de krypton sont dessinés ici.' },
  'ref.too-big': { en: 'Too many atoms for this page (at most 24 atoms, 10 of them other than hydrogen).', fr: 'Trop d’atomes pour cette page (au plus 24 atomes, dont 10 autres que l’hydrogène).' },
  'ref.ionic': { en: '{el} gives its electrons away: this is an ionic compound. Draw the ions one by one, for example Na+ and Cl-, or the polyatomic ion (NaNO3: NO3-).', fr: '{el} cède ses électrons : c’est un composé ionique. Dessinez les ions un par un, par exemple Na+ et Cl-, ou l’ion polyatomique (NaNO3 : NO3-).' },
  'ref.no-structure': { en: 'No Lewis structure respects the limits (hydrogen 2 electrons, period-2 atoms 8) with these atoms and this charge.', fr: 'Aucun schéma de Lewis ne respecte les limites (hydrogène 2 électrons, atomes de la période 2 : 8) avec ces atomes et cette charge.' },
  'ref.borane': { en: 'Boron hydrides such as B2H6 have three-centre two-electron bonds (B–H–B bridges), which simple Lewis structures cannot draw.', fr: 'Les hydrures de bore comme B2H6 ont des liaisons à trois centres et deux électrons (ponts B–H–B), que les schémas de Lewis simples ne peuvent pas dessiner.' },
  'ref.condensed-unclear': { en: 'This condensed formula is not clear to the tool. Write each atom with its hydrogens (CH3CH2OH), groups in brackets (CO(NH2)2).', fr: 'Cette formule semi-développée n’est pas claire pour l’outil. Écrivez chaque atome avec ses hydrogènes (CH3CH2OH), les groupes entre parenthèses (CO(NH2)2).' },
  'ref.isomers': { en: 'Several molecules have this formula (isomers). Write a condensed formula to say which one, for example CH3CH2OH or CH3OCH3 for C2H6O.', fr: 'Plusieurs molécules ont cette formule (isomères). Écrivez une formule semi-développée pour préciser laquelle, par exemple CH3CH2OH ou CH3OCH3 pour C2H6O.' },
  'ref.isomers.pick': { en: 'This formula fits several skeletons that are equally good. Choose one:', fr: 'Cette formule correspond à plusieurs squelettes aussi bons les uns que les autres. Choisissez-en un :' },
  'ref.isomers.more': { en: 'and {n} more.', fr: 'et {n} autres.' },
  'ref.multi-centre': { en: 'This formula has several central atoms and no single obvious skeleton. Write it as a condensed formula, or try a smaller species.', fr: 'Cette formule a plusieurs atomes centraux sans squelette évident. Écrivez-la en formule semi-développée, ou essayez une espèce plus petite.' },
  'guess.read': { en: 'Read as {a}.', fr: 'Lu comme {a}.' },
  'guess.alt': { en: 'Did you mean {b}?', fr: 'Vouliez-vous dire {b} ?' },
  'guess.digits': { en: 'The digit before the sign was read as the charge. Use ^ to be explicit (SO4^2-).', fr: 'Le chiffre avant le signe a été lu comme la charge. Utilisez ^ pour lever le doute (SO4^2-).' },
  'sources.title': { en: 'Sources', fr: 'Sources' },
  'about.title': { en: 'About this tool', fr: 'À propos de cet outil' },
  'about.text': { en: 'The electrons are placed by an exhaustive search: all bond orders on all skeletons, ranked with the textbook guidelines, so the tool finds every equivalent resonance form and can say why each alternative loses. It draws main-group molecules and ions up to about ten heavy atoms, without rings. Lewis structures are a model: they do not show bond angles exactly, nor magnetism (O2), nor bonds spread over more than two atoms.', fr: 'Les électrons sont placés par une recherche exhaustive : tous les ordres de liaison sur tous les squelettes, classés selon les règles du manuel ; l’outil trouve ainsi toutes les formes mésomères équivalentes et peut dire pourquoi chaque autre structure est écartée. Il dessine les molécules et ions des blocs s et p jusqu’à une dizaine d’atomes lourds, sans cycles. Le schéma de Lewis est un modèle : il ne montre ni les angles exacts, ni le magnétisme (O2), ni les liaisons étalées sur plus de deux atomes.' },
};
const SHAPE_NAMES = {
  diatomic: { en: 'linear', fr: 'linéaire' }, linear: { en: 'linear', fr: 'linéaire' },
  'trigonal-planar': { en: 'trigonal planar', fr: 'triangulaire plane' }, 'bent-120': { en: 'bent', fr: 'coudée' }, 'bent-109': { en: 'bent', fr: 'coudée' },
  tetrahedral: { en: 'tetrahedral', fr: 'tétraédrique' }, 'trigonal-pyramidal': { en: 'trigonal pyramidal', fr: 'pyramidale à base triangulaire' },
  'trigonal-bipyramidal': { en: 'trigonal bipyramidal', fr: 'bipyramide à base triangulaire' }, seesaw: { en: 'seesaw', fr: 'en bascule' },
  't-shaped': { en: 'T-shaped', fr: 'en T' }, octahedral: { en: 'octahedral', fr: 'octaédrique' },
  'square-pyramidal': { en: 'square pyramidal', fr: 'pyramide à base carrée' }, 'square-planar': { en: 'square planar', fr: 'plan carré' },
};
const GEOM = { linear: 'linear', 'trigonal-planar': 'trigonal-planar', tetrahedral: 'tetrahedral', 'trigonal-bipyramidal': 'trigonal-bipyramidal', octahedral: 'octahedral' };

// ---------------------------------------------------------------- helpers
const t = (k, vars = {}) => {
  let s = D[k]?.[lang()] ?? D[k]?.en ?? k;
  for (const [a, b] of Object.entries(vars)) s = s.split(`{${a}}`).join(String(b));
  return s;
};
const P = (k, vars, ...ids) => h('p', {}, t(k, vars), ids.length ? ' ' : null, ...(ids.length ? cite(...ids) : []));
const minus = (v) => (v < 0 ? '−' : v > 0 ? '+' : '') + Math.abs(v);
const chargeTxt = (q) => (q ? `${Math.abs(q) > 1 ? Math.abs(q) : ''}${q > 0 ? '+' : '−'}` : '0');
const join = (arr) => {
  if (arr.length <= 1) return arr.join('');
  const and = lang() === 'fr' ? ' et ' : ' and ';
  return arr.slice(0, -1).join(', ') + and + arr[arr.length - 1];
};
const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
const fracTxt = (n, d) => { const g = gcd(n, d) || 1; n /= g; d /= g; return d === 1 ? String(n) : lang() === 'fr' ? `${n}/${d}` : `${n}/${d}`; };

function speciesName(input, res) {
  const raw = String(input).trim();
  const named = NAMES.get(raw) ?? [...NAMES].find(([f]) => res?.parsed && f !== raw && sameSpecies(f, res.parsed))?.[1];
  if (named) return named[lang()];
  if (res?.curated) return res.curated.name[lang()];
  return null;
}
function sameSpecies(f, parsed) {
  // same Hill formula, same charge and (for condensed formulas) same written body
  try {
    const r = analyseCache.get(f);
    return r?.parsed && r.parsed.body === parsed.body && r.parsed.charge === parsed.charge;
  } catch { return false; }
}
const analyseCache = new Map();
function run(input, opts) {
  const key = `${input}|${opts?.pick ?? ''}`;
  if (!analyseCache.has(key)) analyseCache.set(key, analyse(input, opts));
  return analyseCache.get(key);
}

// ---------------------------------------------------------------- state
const state = { input: 'SO4^2-', pick: null, showFc: true, showOs: false };
let ctx = null;
function readHash() {
  const q = new URLSearchParams(ctx.query());
  if (q.get('f')) state.input = q.get('f');
  state.pick = q.get('pick') || null;
}
function writeHash() {
  const q = new URLSearchParams({ f: state.input });
  if (state.pick) q.set('pick', state.pick);
  ctx.save(q.toString());
}

// ---------------------------------------------------------------- page skeleton
let main = null;
let els = {};
function buildPage() {
  main.textContent = '';
  const input = h('input', { id: 'lw-input', type: 'text', class: 'big-input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', value: state.input, 'aria-describedby': 'lw-hint lw-msg' });
  const pick = h('select', { id: 'lw-pick' },
    h('option', { value: '', text: t('pick.none') }),
    ...GROUPS.map((g) => h('optgroup', { label: g[lang()] }, ...g.items.map(([f, en, fr]) => h('option', { value: f, text: `${speciesUnicode(f)} · ${lang() === 'fr' ? fr : en}` })))));
  const examples = h('ul', { class: 'examples', 'aria-label': t('ex.label') },
    ...EXAMPLES.map((f) => h('li', {}, h('button', { type: 'button', 'data-f': f, onclick: () => setInput(f) }, speciesUnicode(f)))));
  const fc = h('input', { type: 'checkbox', id: 'lw-fc', checked: state.showFc });
  const os = h('input', { type: 'checkbox', id: 'lw-os', checked: state.showOs });
  fc.addEventListener('change', () => { state.showFc = fc.checked; render(); });
  os.addEventListener('change', () => { state.showOs = os.checked; render(); });
  const msg = h('div', { id: 'lw-msg', role: 'status', 'aria-live': 'polite' });
  const result = h('div', { id: 'lw-result' });
  main.append(
    h('h1', {}, t('title')),
    h('p', { class: 'lead muted' }, t('lead')),
    h('section', { class: 'card', 'aria-labelledby': 'lw-input-lbl' },
      h('div', { class: 'input-row' },
        h('div', { class: 'field' }, h('label', { for: 'lw-input', id: 'lw-input-lbl' }, t('in.label')), h('div', { class: 'field-in' }, input)),
        h('div', { class: 'field' }, h('label', { for: 'lw-pick' }, t('pick.label')), h('div', { class: 'field-in' }, pick))),
      h('p', { class: 'hint', id: 'lw-hint' }, t('in.hint')),
      examples,
      msg),
    result,
    h('section', { class: 'card sources' }, h('h2', {}, t('sources.title')), sourceList(), h('p', { class: 'small muted', style: 'margin-top:10px' }, OPENSTAX_REF[lang()])),
  );
  let timer = null;
  input.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { state.input = input.value; state.pick = null; pick.value = ''; render(); }, 220); });
  pick.addEventListener('change', () => { if (pick.value) setInput(pick.value); });
  els = { input, pick, msg, result, fc, os, examples };
}
function setInput(f) {
  state.input = f; state.pick = null;
  els.input.value = f;
  els.pick.value = NAMES.has(f) ? f : '';
  render();
}

// ---------------------------------------------------------------- drawing helpers
function osLabels(res, s) {
  if (!res.oxidation) return null;
  if (res.parsed.counts.size === 1) {
    const n = s.sk.atoms.length;
    return s.sk.atoms.map(() => fracTxt(res.parsed.charge, n).replace(/^-/, '−').replace(/^(?=[1-9])/, '+'));
  }
  return oxidationStates(res.octetAlt ?? s).os.map(minus).map((x) => (x === '0' ? '0' : x));
}
function draw(res, s, opts = {}) {
  return drawLewis(s, { charge: res.parsed.charge, showFc: res.method === 'atom' ? false : (opts.showFc ?? state.showFc), layout: opts.layout, os: opts.os ?? (state.showOs ? osLabels(res, s) : null), title: opts.title, className: opts.className });
}
const fig = (svg, caption, cls = 'lewis-fig') => h('figure', { class: cls }, svg, caption ? h('figcaption', {}, caption) : null);

// ---------------------------------------------------------------- render
function render() {
  writeHash();
  const { msg, result } = els;
  msg.textContent = '';
  result.textContent = '';
  els.examples.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.f === state.input)));
  const res = run(state.input, state.pick ? { pick: state.pick } : {});
  if (!res.ok && res.error) {
    msg.append(h('p', { class: 'err' }, t(`err.${res.error}`, res.detail || {})));
    els.input.setAttribute('aria-invalid', 'true');
    return;
  }
  els.input.removeAttribute('aria-invalid');
  if (res.parsed?.guessed) {
    const a = speciesUnicode(res.parsed.canonical);
    const note = h('p', { class: 'note' }, t('guess.read', { a }), ' ');
    if (res.parsed.alt) {
      note.append(t('guess.alt', { b: '' }).replace(/\s*\?$/, '').replace(/\s*$/, ' '));
      note.append(h('button', { type: 'button', class: 'chip-btn', id: 'lw-alt', onclick: () => setInput(res.parsed.alt) }, speciesUnicode(res.parsed.alt)), lang() === 'fr' ? ' ?' : '?');
    } else note.append(t('guess.digits'));
    msg.append(note);
  }
  if (!res.ok) { renderRefusal(res); return; }
  renderResult(res);
}

function renderRefusal(res) {
  const box = h('section', { class: 'card refuse', id: 'lw-refusal' });
  if (res.refusal === 'isomers' && res.detail?.options?.length) {
    box.append(h('p', {}, t('ref.isomers.pick')));
    const row = h('div', { class: 'lewis-figs' });
    for (const o of res.detail.options) {
      const svg = drawLewis(o.structure, { charge: res.parsed.charge, showFc: true });
      row.append(h('button', { type: 'button', class: 'chip-btn iso-pick', 'data-canon': o.canon, onclick: () => { state.pick = o.canon; render(); } }, fig(svg, null, 'lewis-fig cand-fig')));
    }
    box.append(row);
    if (res.detail.more) box.append(h('p', { class: 'small muted' }, t('ref.isomers.more', { n: res.detail.more })));
    box.append(h('p', { class: 'small muted' }, t('ref.isomers')));
  } else {
    box.append(h('p', {}, t(`ref.${res.refusal}`, { el: res.detail?.el ? `${res.detail.el} (${elName(res.detail.el, lang())})` : '' })));
  }
  els.result.append(box);
}

function renderResult(res) {
  const L = lang();
  const best = res.best;
  const lay = res.method === 'atom' ? null : layout(best);
  const name = speciesName(state.input, res);
  const formula = speciesUnicode(res.parsed.canonical);

  // ---- main card
  const forms = res.resonance.length ? res.resonance : [best];
  const figs = h('div', { class: `lewis-figs lewis-main${forms.length > 3 ? ' many' : forms.length > 1 ? ' few' : ''}`, id: 'lw-main' });
  forms.forEach((s, i) => {
    if (i) figs.append(h('span', { class: 'res-arrow', 'aria-hidden': 'true' }, '↔'));
    figs.append(fig(draw(res, s, { layout: lay, title: `${formula}${forms.length > 1 ? ` (${i + 1}/${forms.length})` : ''}. ${describe(res, s)}` })));
  });
  const nbPairs = best.orders.reduce((a, b) => a + b, 0);
  const lonePairs = best.lone.reduce((a, l) => a + Math.floor(l / 2), 0);
  const unpaired = best.lone.reduce((a, l) => a + (l % 2), 0);
  const charged = best.sk.atoms.map((a, i) => [a.el, best.fc[i]]).filter(([, q]) => q);
  const fcText = charged.length ? join(groupCount(charged.map(([e, q]) => `${e} ${minus(q)}`))) : t('sum.fc.none');
  const summary = h('dl', { class: 'facts summary' },
    h('div', {}, h('dt', {}, t('sum.ve')), h('dd', { id: 'lw-ve' }, String(res.valence.total))),
    res.method === 'atom' ? null : h('div', {}, h('dt', {}, t('sum.bonds')), h('dd', {}, String(nbPairs))),
    h('div', {}, h('dt', {}, t('sum.lone')), h('dd', {}, String(lonePairs))),
    unpaired ? h('div', {}, h('dt', {}, t('sum.unpaired')), h('dd', {}, String(unpaired))) : null,
    res.method === 'atom' ? null : h('div', {}, h('dt', {}, t('sum.fc')), h('dd', {}, fcText)),
    res.vsepr ? h('div', {}, h('dt', {}, t('sum.shape', { el: res.vsepr.el })), h('dd', { id: 'lw-shape' }, SHAPE_NAMES[res.vsepr.shape]?.[L] ?? '–')) : null);
  const toggles = res.method === 'atom' ? null : h('div', { class: 'radio-row' },
    h('label', {}, els.fc, t('opt.fc')),
    h('label', {}, els.os, t('opt.os')));
  els.result.append(h('section', { class: 'card', 'aria-labelledby': 'lw-res-title' },
    h('h2', { id: 'lw-res-title' }, `${t('res.title')} · `, h('span', { class: 'formula' }, formula), name ? h('span', { class: 'muted' }, ` · ${name}`) : null),
    forms.length > 1 ? h('p', { class: 'pill ok' }, t('res.resonance', { n: forms.length })) : null,
    h('div', { class: 'lw-top' }, figs, summary),
    toggles,
    h('p', { class: 'small muted' }, t('fig.caption'), ' ', h('button', { type: 'button', class: 'chip-btn', id: 'lw-dl', onclick: () => downloadSvg(figs.querySelector('svg'), res.parsed.canonical) }, t('dl.svg')))));

  // ---- steps
  const steps = h('ol', { class: 'steps', id: 'lw-steps' });
  steps.append(stepValence(res));
  if (res.method !== 'atom') {
    steps.append(stepSkeleton(res, lay));
    steps.append(stepSingle(res, lay));
    steps.append(stepMultiple(res, lay));
    steps.append(stepFormal(res));
    steps.append(stepResonance(res, lay));
    if (res.candidates.length > 1) steps.append(stepWhy(res));
    steps.append(stepExceptions(res, lay));
    steps.append(stepShape(res));
    steps.append(stepOxidation(res, lay));
  }
  els.result.append(h('section', { class: 'card' }, h('h2', {}, t('steps.title')), steps),
    h('section', { class: 'card' }, h('h2', {}, t('about.title')), h('p', { class: 'small' }, t('about.text'))));
}

/** A text description of one structure (for screen readers and the SVG title). */
function describe(res, s) {
  if (res.method === 'atom') return '';
  const b = [];
  s.sk.edges.forEach(([x, y], k) => b.push(`${s.sk.atoms[x].el}–${s.sk.atoms[y].el} ${t(['', 'desc.single', 'desc.double', 'desc.triple'][s.orders[k]])}`));
  const lp = new Map();
  s.sk.atoms.forEach((a, i) => { if (s.lone[i]) { const k = `${a.el}|${s.lone[i] / 2}`; lp.set(k, (lp.get(k) || 0) + 1); } });
  const lpl = [...lp].map(([k, n]) => { const [e, p] = k.split('|'); return `${p} ${lang() === 'fr' ? 'sur' : 'on'} ${e}${n > 1 ? ` (× ${n})` : ''}`; });
  const fc = s.sk.atoms.map((a, i) => [a.el, s.fc[i]]).filter(([, q]) => q).map(([e, q]) => `${e} ${minus(q)}`);
  return [t('desc.bonds', { list: groupCount(b).join(', ') }), lpl.length ? t('desc.lone', { list: lpl.join(', ') }) : '', fc.length ? t('desc.fc', { list: groupCount(fc).join(', ') }) : ''].filter(Boolean).join(' ');
}

/** Save an SVG drawing as a file, with the page styles copied onto each element. */
function downloadSvg(svg, name) {
  if (!svg) return;
  const copy = svg.cloneNode(true);
  const props = ['fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-dasharray', 'opacity', 'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline', 'paint-order'];
  const src = [svg, ...svg.querySelectorAll('*')], dst = [copy, ...copy.querySelectorAll('*')];
  src.forEach((n, i) => {
    const cs = getComputedStyle(n);
    dst[i].setAttribute('style', props.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(';'));
    dst[i].removeAttribute('class');
  });
  copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const blob = new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `lewis-${name.replace(/[^A-Za-z0-9+-]/g, '_')}.svg` });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function groupCount(list) {
  const m = new Map();
  for (const x of list) m.set(x, (m.get(x) || 0) + 1);
  return [...m].map(([x, n]) => (n > 1 ? `${n} × ${x}` : x));
}
function groupCountAfter(list) {
  const m = new Map();
  for (const x of list) m.set(x, (m.get(x) || 0) + 1);
  return [...m].map(([x, n]) => (n > 1 ? `${x} (× ${n})` : x));
}
const step = (title, ...kids) => h('li', { class: 'step' }, h('h3', {}, title), ...kids);

function stepValence(res) {
  const v = res.valence;
  const tb = h('table', { class: 'kv' },
    h('thead', {}, h('tr', {}, h('th', {}, t('s1.el')), h('th', { class: 'v' }, t('s1.n')), h('th', { class: 'v' }, t('s1.v')), h('th', { class: 'v' }, t('s1.sub')))),
    h('tbody', {},
      ...v.rows.map((r) => h('tr', {}, h('td', {}, r.el, h('span', { class: 'elname' }, ` (${elName(r.el, lang())})`)), h('td', { class: 'v' }, String(r.n)), h('td', { class: 'v' }, String(r.v)), h('td', { class: 'v' }, String(r.sub)))),
      v.charge ? h('tr', {}, h('td', { colspan: 3 }, t('s1.charge', { c: chargeTxt(v.charge) })), h('td', { class: 'v' }, minus(-v.charge))) : null,
      h('tr', { class: 'total' }, h('td', { colspan: 3 }, t('s1.total')), h('td', { class: 'v' }, String(v.total)))));
  return step(t('s1.title'), P('s1.text', {}, 'openstax-lewis'), h('div', { class: 'table-wrap' }, tb),
    h('p', {}, v.total % 2 ? t('s1.pairsOdd', { t: v.total }) : t('s1.pairs', { t: v.total, p: v.total / 2 })));
}

function stepSkeleton(res, lay) {
  const s = res.best;
  const bare = { sk: s.sk, orders: s.orders.map(() => 1), lone: s.lone.map(() => 0), fc: [] };
  const kids = [];
  if (res.method === 'curated') {
    const c = res.curated;
    kids.push(h('p', {}, t('m.curated', { name: c.name[lang()] }), ' ', ...cite(...c.src)));
  } else kids.push(P(`m.${res.method}`, {}, ...(['centre', 'three-heavy'].includes(res.method) ? ['openstax-lewis'] : [])));
  if (res.nSkeletons > 1) kids.push(h('p', { class: 'why' }, t('s2.tried', { n: res.nSkeletons })));
  kids.push(h('div', { class: 'lewis-figs' }, fig(drawLewis(bare, { layout: lay, showFc: false }), null, 'lewis-fig mini')));
  return step(t('s2.title'), ...kids);
}

function stepSingle(res, lay) {
  const st = res.stage;
  const s = res.best;
  const nb = s.sk.edges.length;
  const outer = st.outerLone.reduce((a, b) => a + b, 0);
  const left = res.valence.total - st.used - outer;
  const shells = s.sk.atoms.map((a, i) => ({ el: a.el, n: st.shell[i], i })).filter((x) => x.el !== 'H' && s.sk.edges.filter(([a, b]) => a === x.i || b === x.i).length > 1 || (s.sk.atoms.filter((a) => a.el !== 'H').length <= 2 && x.el !== 'H'));
  const lacking = shells.filter((x) => x.n !== 8).map((x) => t('s3.has', { el: x.el, n: x.n }));
  const stDraw = { sk: s.sk, orders: st.orders, lone: st.lone, fc: [] };
  return step(t('s3.title'),
    P('s3.text', { nb, used: st.used, rem: res.valence.total - st.used, outer }, 'openstax-lewis'),
    h('p', {}, left > 0 ? t('s3.left', { left }) : t('s3.none'), lacking.length ? ` ${t('s3.short', { list: join(lacking) })}` : ''),
    h('div', { class: 'lewis-figs' }, fig(drawLewis(stDraw, { layout: lay, showFc: false, charge: res.parsed.charge }), null, 'lewis-fig mini')));
}

function stepMultiple(res, lay) {
  const s = res.best;
  const multi = [];
  s.sk.edges.forEach(([a, b], k) => {
    if (s.orders[k] > 1) {
      const [x, y] = [s.sk.atoms[a].el, s.sk.atoms[b].el];
      multi.push(t(s.orders[k] === 2 ? 's4.double' : 's4.triple', { a: x, b: y }));
    }
  });
  const kids = [];
  kids.push(multi.length ? P('s4.multi', { list: join(groupCountAfter(multi)) }, 'openstax-lewis') : h('p', {}, t('s4.none')));
  const exp = s.sk.atoms.map((a, i) => ({ el: a.el, n: s.shell[i] })).filter((x) => x.n > 8);
  for (const x of exp) kids.push(h('p', {}, t('s4.expanded', { el: x.el, p: el(x.el).per })));
  if (res.candidates.length > 1) kids.push(h('p', { class: 'why' }, t('s4.fcchoice')));
  kids.push(h('div', { class: 'lewis-figs' }, fig(draw(res, s, { layout: lay, showFc: false, os: null }), null, 'lewis-fig mini')));
  return step(t('s4.title'), ...kids);
}

function stepFormal(res) {
  const s = res.best;
  const rows = new Map();
  s.sk.atoms.forEach((a, i) => {
    const V = el(a.el) && res.valence.rows.find((r) => r.el === a.el).v;
    const key = `${a.el}|${s.lone[i]}|${s.bonds[i]}`;
    if (!rows.has(key)) rows.set(key, { el: a.el, V, L: s.lone[i], B: s.bonds[i], fc: s.fc[i], n: 0 });
    rows.get(key).n++;
  });
  const tb = h('table', { class: 'kv', id: 'lw-fc-table' },
    h('thead', {}, h('tr', {}, h('th', {}, t('s5.atom')), h('th', {}, t('s5.calc')), h('th', { class: 'v' }, t('s5.fc')))),
    h('tbody', {}, ...[...rows.values()].map((r) => h('tr', {},
      h('td', {}, r.n > 1 ? `${r.el} (× ${r.n})` : r.el),
      h('td', { class: 'math' }, `${r.V} − ${r.L} − ½ × ${2 * r.B}`),
      h('td', { class: 'v' }, minus(r.fc))))));
  const sum = s.fc.reduce((a, b) => a + b, 0);
  return step(t('s5.title'), P('s5.text', {}, 'openstax-fc'), h('div', { class: 'table-wrap' }, tb), h('p', {}, t('s5.sum', { s: minus(sum) })));
}

function stepResonance(res, lay) {
  const kids = [];
  const n = res.resonance.length;
  if (n > 1) {
    kids.push(P('s6.text', { n }, 'openstax-fc'));
    // average order per element pair when the bonds of that pair are all alike
    const pairs = new Map();
    res.best.sk.edges.forEach(([a, b], k) => {
      const ea = res.best.sk.atoms[a].el, eb = res.best.sk.atoms[b].el;
      if (ea === 'H' || eb === 'H') return;
      const key = [ea, eb].sort().join('–');
      const tot = res.resonance.reduce((acc, r) => acc + r.orders[k], 0);
      if (!pairs.has(key)) pairs.set(key, []);
      pairs.get(key).push(tot);
    });
    for (const [key, tots] of pairs) {
      const varies = res.resonance.some((r) => res.best.sk.edges.some(([a, b], k) => [res.best.sk.atoms[a].el, res.best.sk.atoms[b].el].sort().join('–') === key && r.orders[k] !== res.best.orders[k]));
      if (tots.length > 1 && varies && tots.every((x) => x === tots[0])) {
        const [a, b] = key.split('–');
        kids.push(h('p', {}, t('s6.avg', { a, b, o: fracTxt(tots[0], n).replace('/', '⁄') })));
      }
    }
  } else kids.push(h('p', {}, t('s6.single')));
  if (res.minor?.length) {
    kids.push(h('p', { class: 'why' }, t('s6.minor')));
    kids.push(h('div', { class: 'lewis-figs' }, ...res.minor.map((m) => fig(draw(res, m, { layout: lay, showFc: true, os: null }), null, 'lewis-fig mini'))));
  }
  return step(t('s6.title'), ...kids);
}

function stepWhy(res) {
  const tb = h('div', { class: 'cands' }, ...res.candidates.map((c) => {
    const s = c.s;
    const sum = s.fc.reduce((a, x) => a + Math.abs(x), 0);
    return h('figure', { class: `lewis-fig cand-fig${c.lose ? '' : ' kept'}` },
      drawLewis(s, { charge: res.parsed.charge, showFc: true }),
      h('figcaption', {}, h('strong', {}, c.lose ? t(`lose.${c.lose}`) : t('s7.kept')), h('br'), t('s7.fcsum', { n: sum })));
  }));
  return step(t('s7.title'), P('s7.text', {}, 'openstax-fc', 'openstax-lewis'), tb);
}

function stepExceptions(res, lay) {
  const s = res.best;
  const kids = [];
  const x = res.exceptions;
  const centreLike = (pred) => s.sk.atoms.map((a, i) => ({ el: a.el, n: s.shell[i], i })).filter(pred);
  if (x.includes('odd')) {
    const at = s.sk.atoms.find((_, i) => s.lone[i] % 2 === 1)?.el ?? '?';
    kids.push(P('x.odd', { n: res.valence.total, el: at }, 'openstax-lewis'));
  }
  if (x.includes('incomplete')) {
    for (const a of centreLike((a) => [2, 13].includes(el(a.el).grp) && a.n < 8)) kids.push(P('x.incomplete', { el: a.el, n: a.n }, 'openstax-lewis'));
  }
  const exp = centreLike((a) => a.n > 8);
  if (x.includes('expanded-required')) {
    for (const a of exp) kids.push(P('x.expanded-required', { el: a.el, n: a.n, p: el(a.el).per }, 'openstax-lewis'));
    kids.push(h('p', { class: 'why' }, t('x.hyper-why'), ' ', ...cite('openstax-lewis', 'wp-hypervalent')));
  }
  if (x.includes('expanded-optional') && res.octetAlt) {
    const a = exp[0];
    kids.push(P('x.expanded-optional', { el: a?.el ?? '', n: a?.n ?? '' }, 'openstax-fc'));
    const alt = res.octetAlt;
    const charged = alt.sk.atoms.map((at, i) => [at.el, alt.fc[i]]).filter(([, q]) => q);
    kids.push(h('div', { class: 'lewis-figs' }, fig(draw(res, alt, { layout: lay, showFc: true, os: null }), t('x.octet-caption', { list: join(groupCount(charged.map(([e, q]) => `${e} ${minus(q)}`))) }), 'lewis-fig octet-alt')));
    kids.push(h('p', { class: 'why' }, t('x.hyper-why'), ' ', ...cite('openstax-lewis', 'wp-hypervalent')));
  }
  if (x.includes('o2-paramagnetic')) kids.push(P('x.o2', {}, 'openstax-mo'));
  if (x.includes('thiosulfate-ss')) kids.push(P('x.thiosulfate', {}, 'iupac-os'));
  if (x.includes('centre-rule')) kids.push(P('x.centre-rule', {}, 'openstax-lewis'));
  if (x.includes('h3po3')) kids.push(P('x.h3po3', {}, 'openstax-ka'));
  if (!kids.length) kids.push(h('p', {}, t('x.none')));
  return step(t('s8.title'), ...kids);
}

function stepShape(res) {
  const kids = [P('s9.text', {}, 'openstax-vsepr')];
  const inner = res.vseprInner ?? [];
  if (!inner.length) { kids.push(h('p', {}, t('s9.none'))); return step(t('s9.title'), ...kids); }
  const L = lang();
  for (const v of inner) {
    if (!v.shape) { kids.push(h('p', {}, t('s9.beyond', { el: v.el }))); continue; }
    const shapeName = SHAPE_NAMES[v.shape]?.[L] ?? v.shape;
    const eg = SHAPE_NAMES[GEOM[v.electronGeometry]]?.[L] ?? '–';
    const angle = (v.angle ?? '–').replace(/\./g, L === 'fr' ? ',' : '.');
    const row = h('div', { class: 'shape-row' });
    const sketch = v.domains >= 2 ? drawShape(v.shape, v.lonePairs + v.odd, `${v.el}: ${shapeName}`) : null;
    if (sketch && inner.length <= 3) row.append(h('div', { class: 'shape' }, sketch));
    const p = P('s9.atom', { el: v.el, b: v.bonded, lp: v.lonePairs + v.odd, d: v.domains, axe: v.AXE, eg, shape: shapeName, angle });
    const txt = h('div', {}, p);
    if (v.odd) txt.append(h('p', { class: 'why' }, t('s9.odd')));
    if (hill(res.parsed.counts) === 'H2O' && !res.parsed.charge && v.el === 'O') txt.append(P('s9.water', {}, 'openstax-vsepr'));
    row.append(txt);
    kids.push(row);
  }
  return step(t('s9.title'), ...kids);
}

function stepOxidation(res, lay) {
  const s = res.best;
  const kids = [P('s10.text', {}, 'iupac-os')];
  const labels = osLabels(res, s);
  if (res.parsed.counts.size === 1) kids.push(h('p', {}, t('s10.homo', { v: labels[0] })));
  else if (res.oxidationFrom === 'octet') kids.push(h('p', { class: 'why' }, t('s10.octet')));
  for (const [a, b] of res.oxidation.close ?? []) kids.push(h('p', { class: 'why' }, t('s10.close', { a: s.sk.atoms[a].el, b: s.sk.atoms[b].el }), ' ', ...cite('iupac-os', 'pubchem-pt')));
  kids.push(h('div', { class: 'lewis-figs' }, fig(drawLewis(res.octetAlt ?? s, { layout: lay, showFc: false, os: labels, charge: res.parsed.charge }), null, 'lewis-fig mini')));
  kids.push(h('p', {}, h('a', { href: `#redox?sp=${encodeURIComponent(state.input)}` }, `${t('s10.link')} →`)));
  return step(t('s10.title'), ...kids);
}

// ---------------------------------------------------------------- start
const start = () => { buildPage(); render(); };
export function mount(c) {
  ctx = c;
  main = c.panel;
  readHash();
  start();
}
export const refresh = start;
export function route() {
  const before = `${state.input}|${state.pick}`;
  readHash();
  if (`${state.input}|${state.pick}` !== before) { els.input.value = state.input; render(); }
}
void fmtn; void vseprAt;
