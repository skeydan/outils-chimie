// Data of the Nomenclature tab: the prefix tables, the common polyatomic
// ions, the oxoacid ladder, and the worked examples that also feed the quiz.
// Every rule behind them is cited in app.js (IUPAC Brief Guide, Red Book,
// OpenStax 2.6–2.7, oxidation states 4.2).

export const PREFIXES = [
  { n: 1, en: 'mono-', fr: 'mono-', note: { en: 'omitted before the first element of a molecular name', fr: 'omis devant le premier élément d’un nom moléculaire' } },
  { n: 2, en: 'di-', fr: 'di-' },
  { n: 3, en: 'tri-', fr: 'tri-' },
  { n: 4, en: 'tetra-', fr: 'tétra-' },
  { n: 5, en: 'penta-', fr: 'penta-' },
  { n: 6, en: 'hexa-', fr: 'hexa-' },
  { n: 7, en: 'hepta-', fr: 'hepta-' },
  { n: 8, en: 'octa-', fr: 'octa-' },
  { n: 9, en: 'nona-', fr: 'nona-' },
  { n: 10, en: 'deca-', fr: 'déca-' },
  { n: 11, en: 'undeca-', fr: 'undéca-' },
  { n: 12, en: 'dodeca-', fr: 'dodéca-' },
];

export const POLYATOMIC = [
  { f: 'NH4+', en: 'ammonium', fr: 'ammonium' },
  { f: 'OH-', en: 'hydroxide', fr: 'hydroxyde' },
  { f: 'NO3-', en: 'nitrate', fr: 'nitrate' },
  { f: 'NO2-', en: 'nitrite', fr: 'nitrite' },
  { f: 'SO4^2-', en: 'sulfate', fr: 'sulfate' },
  { f: 'SO3^2-', en: 'sulfite', fr: 'sulfite' },
  { f: 'HSO4-', en: 'hydrogen sulfate', fr: 'hydrogénosulfate' },
  { f: 'CO3^2-', en: 'carbonate', fr: 'carbonate' },
  { f: 'HCO3-', en: 'hydrogen carbonate', fr: 'hydrogénocarbonate' },
  { f: 'PO4^3-', en: 'phosphate', fr: 'phosphate' },
  { f: 'H2PO4-', en: 'dihydrogen phosphate', fr: 'dihydrogénophosphate' },
  { f: 'HPO4^2-', en: 'hydrogen phosphate', fr: 'hydrogénophosphate' },
  { f: 'CN-', en: 'cyanide', fr: 'cyanure' },
  { f: 'CH3COO-', en: 'acetate', fr: 'acétate' },
  { f: 'ClO-', en: 'hypochlorite', fr: 'hypochlorite' },
  { f: 'ClO2-', en: 'chlorite', fr: 'chlorite' },
  { f: 'ClO3-', en: 'chlorate', fr: 'chlorate' },
  { f: 'ClO4-', en: 'perchlorate', fr: 'perchlorate' },
  { f: 'MnO4-', en: 'permanganate', fr: 'permanganate' },
  { f: 'CrO4^2-', en: 'chromate', fr: 'chromate' },
  { f: 'Cr2O7^2-', en: 'dichromate', fr: 'dichromate' },
];

export const OXO_LADDER = [
  { f: 'HClO', en: 'hypochlorous acid', fr: 'acide hypochloreux', anion: { en: 'hypochlorite', fr: 'hypochlorite' } },
  { f: 'HClO2', en: 'chlorous acid', fr: 'acide chloreux', anion: { en: 'chlorite', fr: 'chlorite' } },
  { f: 'HClO3', en: 'chloric acid', fr: 'acide chlorique', anion: { en: 'chlorate', fr: 'chlorate' } },
  { f: 'HClO4', en: 'perchloric acid', fr: 'acide perchlorique', anion: { en: 'perchlorate', fr: 'perchlorate' } },
  { f: 'H2SO3', en: 'sulfurous acid', fr: 'acide sulfureux', anion: { en: 'sulfite', fr: 'sulfite' } },
  { f: 'H2SO4', en: 'sulfuric acid', fr: 'acide sulfurique', anion: { en: 'sulfate', fr: 'sulfate' } },
  { f: 'HNO2', en: 'nitrous acid', fr: 'acide nitreux', anion: { en: 'nitrite', fr: 'nitrite' } },
  { f: 'HNO3', en: 'nitric acid', fr: 'acide nitrique', anion: { en: 'nitrate', fr: 'nitrate' } },
  { f: 'H3PO4', en: 'phosphoric acid', fr: 'acide phosphorique', anion: { en: 'phosphate', fr: 'phosphate' } },
  { f: 'H2CO3', en: 'carbonic acid', fr: 'acide carbonique', anion: { en: 'carbonate', fr: 'carbonate' } },
];

// cat: oxide | hydride | acid | salt | hydrate
// ox: oxidation states shown in the diagram (optional)
// steps: the reasoning, in the order it is applied.
export const EXAMPLES = [
  {
    id: 'na2o', f: 'Na2O', en: 'sodium oxide', fr: 'oxyde de sodium', cat: 'oxide',
    ox: [{ el: 'Na', n: 2, ox: '+1' }, { el: 'O', n: 1, ox: '−2' }],
    steps: {
      en: ['Sodium is a group-1 metal with a single oxidation state, +1: no Stock numeral.', 'Oxygen is the more electronegative partner and takes the -ide ending: oxide.', 'Two Na+ balance one O2−, so the formula is Na2O.'],
      fr: ['Le sodium est un métal du groupe 1, un seul degré d’oxydation, +1 : pas de chiffre de Stock.', 'L’oxygène est le partenaire le plus électronégatif et prend la terminaison -ure : oxyde.', 'Deux Na+ équilibrent un O2−, d’où la formule Na2O.'],
    },
  },
  {
    id: 'cao', f: 'CaO', en: 'calcium oxide', fr: 'oxyde de calcium', cat: 'oxide',
    ox: [{ el: 'Ca', n: 1, ox: '+2' }, { el: 'O', n: 1, ox: '−2' }],
    steps: {
      en: ['Calcium always forms Ca2+; the numeral is unnecessary.', 'The anion O2− is named oxide.', 'One Ca2+ and one O2− give a neutral CaO.'],
      fr: ['Le calcium forme toujours Ca2+ ; le chiffre est inutile.', 'L’anion O2− se nomme oxyde.', 'Un Ca2+ et un O2− donnent CaO, neutre.'],
    },
  },
  {
    id: 'al2o3', f: 'Al2O3', en: 'aluminium oxide', fr: 'oxyde d’aluminium', cat: 'oxide',
    ox: [{ el: 'Al', n: 2, ox: '+3' }, { el: 'O', n: 3, ox: '−2' }],
    steps: {
      en: ['Aluminium forms Al3+ only (IUPAC spelling: aluminium).', 'Oxygen gives oxide.', '2 × (+3) + 3 × (−2) = 0, so Al2O3.'],
      fr: ['L’aluminium ne forme que Al3+.', 'L’oxygène donne oxyde.', '2 × (+3) + 3 × (−2) = 0, d’où Al2O3.'],
    },
  },
  {
    id: 'feo', f: 'FeO', en: 'iron(II) oxide', fr: 'oxyde de fer(II)', cat: 'oxide',
    ox: [{ el: 'Fe', n: 1, ox: '+2' }, { el: 'O', n: 1, ox: '−2' }],
    steps: {
      en: ['Iron forms Fe2+ and Fe3+, so the oxidation state must be given in Roman numerals.', 'O2− fixes iron at +2: iron(II).', 'The name is iron(II) oxide; the old name ferrous oxide is no longer recommended.'],
      fr: ['Le fer forme Fe2+ et Fe3+ : le degré d’oxydation doit être précisé en chiffres romains.', 'O2− impose +2 au fer : fer(II).', 'Le nom est oxyde de fer(II) ; l’ancien nom oxyde ferreux n’est plus recommandé.'],
    },
  },
  {
    id: 'fe2o3', f: 'Fe2O3', en: 'iron(III) oxide', fr: 'oxyde de fer(III)', cat: 'oxide',
    ox: [{ el: 'Fe', n: 2, ox: '+3' }, { el: 'O', n: 3, ox: '−2' }],
    steps: {
      en: ['Three O2− carry −6 in all; two Fe must carry +6, so each Fe is +3.', 'Roman numeral (III) after the metal name.', 'Iron(III) oxide (old name: ferric oxide).'],
      fr: ['Trois O2− portent −6 au total ; deux Fe doivent porter +6, donc chaque Fe est +3.', 'Chiffre romain (III) après le nom du métal.', 'Oxyde de fer(III) (ancien nom : oxyde ferrique).'],
    },
  },
  {
    id: 'cu2o', f: 'Cu2O', en: 'copper(I) oxide', fr: 'oxyde de cuivre(I)', cat: 'oxide',
    ox: [{ el: 'Cu', n: 2, ox: '+1' }, { el: 'O', n: 1, ox: '−2' }],
    steps: {
      en: ['Copper forms Cu+ and Cu2+.', 'One O2− needs two Cu+, so each copper is +1.', 'Copper(I) oxide (old name: cuprous oxide).'],
      fr: ['Le cuivre forme Cu+ et Cu2+.', 'Un O2− exige deux Cu+, donc chaque cuivre est +1.', 'Oxyde de cuivre(I) (ancien nom : oxyde cuivreux).'],
    },
  },
  {
    id: 'cuo', f: 'CuO', en: 'copper(II) oxide', fr: 'oxyde de cuivre(II)', cat: 'oxide',
    ox: [{ el: 'Cu', n: 1, ox: '+2' }, { el: 'O', n: 1, ox: '−2' }],
    steps: {
      en: ['One O2− fixes the single copper at +2.', 'Copper(II) oxide (old name: cupric oxide).'],
      fr: ['Un O2− fixe le cuivre unique à +2.', 'Oxyde de cuivre(II) (ancien nom : oxyde cuprique).'],
    },
  },
  {
    id: 'co2', f: 'CO2', en: 'carbon dioxide', fr: 'dioxyde de carbone', cat: 'oxide',
    steps: {
      en: ['Two non-metals: the name is molecular, not ionic.', 'The more electronegative partner (oxygen) takes -ide and comes second.', 'The prefix di- counts two oxygen atoms; mono- is omitted before carbon.'],
      fr: ['Deux non-métaux : le nom est moléculaire, pas ionique.', 'Le partenaire le plus électronégatif (l’oxygène) prend -ure et vient en second.', 'Le préfixe di- compte deux oxygènes ; mono- est omis devant le carbone.'],
    },
  },
  {
    id: 'so3', f: 'SO3', en: 'sulfur trioxide', fr: 'trioxyde de soufre', cat: 'oxide',
    steps: {
      en: ['Molecular binary compound: prefixes count the atoms.', 'Sulfur first (less electronegative), oxygen second as oxide.', 'Three oxygens: trioxide.'],
      fr: ['Composé moléculaire binaire : les préfixes comptent les atomes.', 'Le soufre d’abord (moins électronégatif), l’oxygène ensuite en oxyde.', 'Trois oxygènes : trioxyde.'],
    },
  },
  {
    id: 'n2o4', f: 'N2O4', en: 'dinitrogen tetroxide', fr: 'tétraoxyde de diazote', cat: 'oxide',
    steps: {
      en: ['Two nitrogens: di- + nitrogen.', 'Four oxygens: tetra- + oxide.', 'Dinitrogen tetroxide; the empirical formula NO2 is a different compound (nitrogen dioxide).'],
      fr: ['Deux azotes : di- + azote.', 'Quatre oxygènes : tétra- + oxyde.', 'Tétraoxyde de diazote ; la formule empirique NO2 est un autre composé (dioxyde d’azote).'],
    },
  },
  {
    id: 'p4o10', f: 'P4O10', en: 'tetraphosphorus decaoxide', fr: 'décaoxyde de tétraphosphore', cat: 'oxide',
    steps: {
      en: ['The molecule really contains four P and ten O.', 'Prefixes: tetra- for phosphorus, deca- for oxygen.', 'Tetraphosphorus decaoxide; “phosphorus pentoxide” (P2O5) is only the empirical formula.'],
      fr: ['La molécule contient réellement quatre P et dix O.', 'Préfixes : tétra- pour le phosphore, déca- pour l’oxygène.', 'Décaoxyde de tétraphosphore ; « pentoxyde de phosphore » (P2O5) n’est que la formule empirique.'],
    },
  },
  {
    id: 'nah', f: 'NaH', en: 'sodium hydride', fr: 'hydrure de sodium', cat: 'hydride',
    steps: {
      en: ['A metal and hydrogen: the ionic hydride contains H−.', 'Cation first, anion second in -ide: hydride.', 'Na+ and H− give sodium hydride.'],
      fr: ['Un métal et de l’hydrogène : l’hydrure ionique contient H−.', 'Le cation d’abord, l’anion en -ure ensuite : hydrure.', 'Na+ et H− donnent l’hydrure de sodium.'],
    },
  },
  {
    id: 'cah2', f: 'CaH2', en: 'calcium hydride', fr: 'hydrure de calcium', cat: 'hydride',
    steps: {
      en: ['Ca2+ needs two H− for neutrality.', 'The anion is hydride.', 'Calcium hydride.'],
      fr: ['Ca2+ exige deux H− pour la neutralité.', 'L’anion est l’hydrure.', 'Hydrure de calcium.'],
    },
  },
  {
    id: 'hcl-g', f: 'HCl', state: 'g', en: 'hydrogen chloride', fr: 'chlorure d’hydrogène', cat: 'hydride',
    steps: {
      en: ['As a pure gas, HCl is a molecular compound: hydrogen chloride.', 'Cation-like hydrogen first, chlorine as chloride.', 'Dissolved in water it becomes an acid with another name (next examples).'],
      fr: ['À l’état de gaz pur, HCl est un composé moléculaire : chlorure d’hydrogène.', 'L’hydrogène d’abord, le chlore en chlorure.', 'Dissous dans l’eau, il devient un acide au nom différent (exemples suivants).'],
    },
  },
  {
    id: 'h2s-g', f: 'H2S', state: 'g', en: 'hydrogen sulfide', fr: 'sulfure d’hydrogène', cat: 'hydride',
    steps: {
      en: ['Two hydrogens and one sulfur: hydrogen sulfide.', 'The systematic parent name is sulfane, but the compositional name is the usual one.', 'In water it is hydrosulfuric acid.'],
      fr: ['Deux hydrogènes et un soufre : sulfure d’hydrogène.', 'Le nom systématique de la famille est sulfane, mais le nom compositionnel est l’usage.', 'Dans l’eau, c’est l’acide sulfhydrique.'],
    },
  },
  {
    id: 'nh3', f: 'NH3', en: 'ammonia', fr: 'ammoniac', cat: 'hydride',
    steps: {
      en: ['The traditional name ammonia is retained.', 'The systematic parent name is azane; “nitrogen trihydride” is not the preferred name.', 'Aqueous ammonia is often called ammonia solution.'],
      fr: ['Le nom traditionnel ammoniac est retenu.', 'Le nom systématique de la famille est azane ; « trihydrure d’azote » n’est pas le nom préféré.', 'L’ammoniac en solution aqueuse est souvent appelé ammoniaque.'],
    },
  },
  {
    id: 'ch4', f: 'CH4', en: 'methane', fr: 'méthane', cat: 'hydride',
    steps: {
      en: ['Methane is a retained organic name.', 'It is also the parent hydride of the alkanes.', 'The compositional name “carbon tetrahydride” is not used.'],
      fr: ['Le méthane est un nom organique retenu.', 'C’est aussi l’hydrure parent des alcanes.', 'Le nom compositionnel « tétrahydrure de carbone » ne s’emploie pas.'],
    },
  },
  {
    id: 'hcl-aq', f: 'HCl', state: 'aq', en: 'hydrochloric acid', fr: 'acide chlorhydrique', cat: 'acid',
    steps: {
      en: ['Binary acid: hydro- + the non-metal root + -ic + acid.', 'Hydrogen chloride gas dissolved in water gives hydrochloric acid.', 'The (aq) state is part of the name.'],
      fr: ['Acide binaire : acide + racine du non-métal + -hydrique.', 'Le chlorure d’hydrogène gazeux dissous dans l’eau donne l’acide chlorhydrique.', 'L’état (aq) fait partie du nom.'],
    },
  },
  {
    id: 'h2s-aq', f: 'H2S', state: 'aq', en: 'hydrosulfuric acid', fr: 'acide sulfhydrique', cat: 'acid',
    steps: {
      en: ['Binary acid of sulfur: hydrosulfuric acid.', 'The French name is acide sulfhydrique.', 'Not to be confused with sulfurous acid, H2SO3.'],
      fr: ['Acide binaire du soufre : acide sulfhydrique.', 'Ne pas confondre avec l’acide sulfureux, H2SO3.'],
    },
  },
  {
    id: 'hno3', f: 'HNO3', en: 'nitric acid', fr: 'acide nitrique', cat: 'acid',
    steps: {
      en: ['Oxoacid: take the anion name, nitrate.', '-ate becomes -ic: nitric acid.', 'The same root without per-/hypo- is the “ic” acid of nitrogen.'],
      fr: ['Oxacide : on part du nom de l’anion, nitrate.', '-ate devient -ique : acide nitrique.', 'La même racine sans per-/hypo- est l’acide « -ique » de l’azote.'],
    },
  },
  {
    id: 'hno2', f: 'HNO2', en: 'nitrous acid', fr: 'acide nitreux', cat: 'acid',
    steps: {
      en: ['Oxoacid: the anion is nitrite.', '-ite becomes -ous: nitrous acid.', 'One oxygen fewer than nitric acid.'],
      fr: ['Oxacide : l’anion est le nitrite.', '-ite devient -eux : acide nitreux.', 'Un oxygène de moins que l’acide nitrique.'],
    },
  },
  {
    id: 'h2so4', f: 'H2SO4', en: 'sulfuric acid', fr: 'acide sulfurique', cat: 'acid',
    steps: {
      en: ['Oxoacid: the anion is sulfate.', '-ate becomes -ic: sulfuric acid (not “sulfic”).', 'Its additive systematic name is dihydroxidodioxidosulfur.'],
      fr: ['Oxacide : l’anion est le sulfate.', '-ate devient -ique : acide sulfurique.', 'Son nom systématique additif est dihydroxidodioxidosoufre.'],
    },
  },
  {
    id: 'h2so3', f: 'H2SO3', en: 'sulfurous acid', fr: 'acide sulfureux', cat: 'acid',
    steps: {
      en: ['Oxoacid: the anion is sulfite.', '-ite becomes -ous: sulfurous acid (not “sulfous”).', 'One oxygen fewer than sulfuric acid.'],
      fr: ['Oxacide : l’anion est le sulfite.', '-ite devient -eux : acide sulfureux.', 'Un oxygène de moins que l’acide sulfurique.'],
    },
  },
  {
    id: 'h3po4', f: 'H3PO4', en: 'phosphoric acid', fr: 'acide phosphorique', cat: 'acid',
    steps: {
      en: ['Oxoacid: the anion is phosphate.', '-ate becomes -ic: phosphoric acid.', 'Three acidic hydrogens, hence three possible hydrogenphosphate salts.'],
      fr: ['Oxacide : l’anion est le phosphate.', '-ate devient -ique : acide phosphorique.', 'Trois hydrogènes acides, donc trois hydrogénophosphates possibles.'],
    },
  },
  {
    id: 'hclo', f: 'HClO', en: 'hypochlorous acid', fr: 'acide hypochloreux', cat: 'acid',
    steps: {
      en: ['The anion is hypochlorite.', '-ite becomes -ous, so hypochlorous acid.', 'hypo- marks the fewest oxygens of the chlorine family.'],
      fr: ['L’anion est l’hypochlorite.', '-ite devient -eux, donc acide hypochloreux.', 'hypo- marque le moins d’oxygènes de la famille du chlore.'],
    },
  },
  {
    id: 'hclo4', f: 'HClO4', en: 'perchloric acid', fr: 'acide perchlorique', cat: 'acid',
    steps: {
      en: ['The anion is perchlorate.', '-ate becomes -ic, so perchloric acid.', 'per- marks the most oxygens of the chlorine family.'],
      fr: ['L’anion est le perchlorate.', '-ate devient -ique, donc acide perchlorique.', 'per- marque le plus d’oxygènes de la famille du chlore.'],
    },
  },
  {
    id: 'nacl', f: 'NaCl', en: 'sodium chloride', fr: 'chlorure de sodium', cat: 'salt',
    steps: {
      en: ['Ionic compound: cation first, anion second.', 'Na+ is sodium; Cl− is chloride.', 'Sodium chloride (common name: table salt).'],
      fr: ['Composé ionique : le cation d’abord, l’anion ensuite.', 'Na+ est sodium ; Cl− est chlorure.', 'Chlorure de sodium (nom courant : sel de table).'],
    },
  },
  {
    id: 'cacl2', f: 'CaCl2', en: 'calcium chloride', fr: 'chlorure de calcium', cat: 'salt',
    steps: {
      en: ['Ca2+ and two Cl− make the formula neutral.', 'Calcium has one oxidation state, so no numeral.', 'Calcium chloride.'],
      fr: ['Ca2+ et deux Cl− rendent la formule neutre.', 'Le calcium n’a qu’un degré d’oxydation, donc pas de chiffre.', 'Chlorure de calcium.'],
    },
  },
  {
    id: 'fecl2', f: 'FeCl2', en: 'iron(II) chloride', fr: 'chlorure de fer(II)', cat: 'salt',
    ox: [{ el: 'Fe', n: 1, ox: '+2' }, { el: 'Cl', n: 2, ox: '−1' }],
    steps: {
      en: ['Two Cl− carry −2, so iron is +2.', 'Iron has several oxidation states: Stock numeral (II).', 'Iron(II) chloride (old name: ferrous chloride).'],
      fr: ['Deux Cl− portent −2, donc le fer est +2.', 'Le fer a plusieurs degrés d’oxydation : chiffre de Stock (II).', 'Chlorure de fer(II) (ancien nom : chlorure ferreux).'],
    },
  },
  {
    id: 'fecl3', f: 'FeCl3', en: 'iron(III) chloride', fr: 'chlorure de fer(III)', cat: 'salt',
    ox: [{ el: 'Fe', n: 1, ox: '+3' }, { el: 'Cl', n: 3, ox: '−1' }],
    steps: {
      en: ['Three Cl− carry −3, so iron is +3.', 'Iron(III) chloride (old name: ferric chloride).'],
      fr: ['Trois Cl− portent −3, donc le fer est +3.', 'Chlorure de fer(III) (ancien nom : chlorure ferrique).'],
    },
  },
  {
    id: 'cuso4', f: 'CuSO4', en: 'copper(II) sulfate', fr: 'sulfate de cuivre(II)', cat: 'salt',
    ox: [{ el: 'Cu', n: 1, ox: '+2' }, { el: 'S', n: 1, ox: '+6' }, { el: 'O', n: 4, ox: '−2' }],
    steps: {
      en: ['The anion is sulfate, SO4^2−.', 'One Cu must be +2 to balance it: copper(II).', 'Copper(II) sulfate (old name: cupric sulfate).'],
      fr: ['L’anion est le sulfate, SO4^2−.', 'Un Cu doit être +2 pour l’équilibrer : cuivre(II).', 'Sulfate de cuivre(II) (ancien nom : sulfate cuprique).'],
    },
  },
  {
    id: 'kmno4', f: 'KMnO4', en: 'potassium permanganate', fr: 'permanganate de potassium', cat: 'salt',
    ox: [{ el: 'K', n: 1, ox: '+1' }, { el: 'Mn', n: 1, ox: '+7' }, { el: 'O', n: 4, ox: '−2' }],
    steps: {
      en: ['K+ is the cation; MnO4− is the permanganate ion.', 'The polyatomic ion keeps its name unchanged.', 'Potassium permanganate.'],
      fr: ['K+ est le cation ; MnO4− est l’ion permanganate.', 'L’ion polyatomique garde son nom.', 'Permanganate de potassium.'],
    },
  },
  {
    id: 'k2cr2o7', f: 'K2Cr2O7', en: 'potassium dichromate', fr: 'dichromate de potassium', cat: 'salt',
    ox: [{ el: 'K', n: 2, ox: '+1' }, { el: 'Cr', n: 2, ox: '+6' }, { el: 'O', n: 7, ox: '−2' }],
    steps: {
      en: ['Cr2O7^2− is the dichromate ion.', 'Two K+ balance its charge.', 'Potassium dichromate.'],
      fr: ['Cr2O7^2− est l’ion dichromate.', 'Deux K+ équilibrent sa charge.', 'Dichromate de potassium.'],
    },
  },
  {
    id: 'nahco3', f: 'NaHCO3', en: 'sodium hydrogen carbonate', fr: 'hydrogénocarbonate de sodium', cat: 'salt',
    steps: {
      en: ['HCO3− is hydrogen carbonate; IUPAC writes it as one word, not “bicarbonate”.', 'Na+ is the cation.', 'Sodium hydrogen carbonate; the old name bicarbonate of soda is not systematic.'],
      fr: ['HCO3− est l’hydrogénocarbonate ; l’IUPAC l’écrit en un mot, pas « bicarbonate ».', 'Na+ est le cation.', 'Hydrogénocarbonate de sodium ; l’ancien nom bicarbonate de soude n’est pas systématique.'],
    },
  },
  {
    id: 'nh4no3', f: 'NH4NO3', en: 'ammonium nitrate', fr: 'nitrate d’ammonium', cat: 'salt',
    steps: {
      en: ['NH4+ is ammonium (a polyatomic cation).', 'NO3− is nitrate.', 'Ammonium nitrate.'],
      fr: ['NH4+ est l’ammonium (cation polyatomique).', 'NO3− est le nitrate.', 'Nitrate d’ammonium.'],
    },
  },
  {
    id: 'ca3po42', f: 'Ca3(PO4)2', en: 'calcium phosphate', fr: 'phosphate de calcium', cat: 'salt',
    ox: [{ el: 'Ca', n: 3, ox: '+2' }, { el: 'P', n: 2, ox: '+5' }, { el: 'O', n: 8, ox: '−2' }],
    steps: {
      en: ['PO4^3− is phosphate; three Ca2+ balance two phosphate ions.', 'The compositional name is tricalcium bis(phosphate): the prefix bis( ) avoids reading “diphosphate” as P2O7.'],
      fr: ['PO4^3− est le phosphate ; trois Ca2+ équilibrent deux ions phosphate.', 'Le nom compositionnel est bis(phosphate) de tricalcium : bis( ) évite de lire « diphosphate » comme P2O7.'],
    },
  },
  {
    id: 'agno3', f: 'AgNO3', en: 'silver nitrate', fr: 'nitrate d’argent', cat: 'salt',
    steps: {
      en: ['Silver forms Ag+ here; nitrate is NO3−.', 'One of each gives a neutral salt.', 'Silver nitrate.'],
      fr: ['L’argent forme ici Ag+ ; le nitrate est NO3−.', 'Un de chaque donne un sel neutre.', 'Nitrate d’argent.'],
    },
  },
  {
    id: 'cuso4-5h2o', f: 'CuSO4·5H2O', en: 'copper(II) sulfate pentahydrate', fr: 'sulfate de cuivre(II) pentahydrate', cat: 'hydrate',
    steps: {
      en: ['Name the anhydrous salt first: copper(II) sulfate.', 'Five water molecules: prefix penta- + hydrate.', 'In the formula, a centred dot separates the salt from 5 H2O.'],
      fr: ['On nomme d’abord le sel anhydre : sulfate de cuivre(II).', 'Cinq molécules d’eau : préfixe penta- + hydrate.', 'Dans la formule, un point centré sépare le sel de 5 H2O.'],
    },
  },
  {
    id: 'mgso4-7h2o', f: 'MgSO4·7H2O', en: 'magnesium sulfate heptahydrate', fr: 'sulfate de magnésium heptahydrate', cat: 'hydrate',
    steps: {
      en: ['The anhydrous salt is magnesium sulfate.', 'Seven waters: hepta- + hydrate.', 'Magnesium sulfate heptahydrate (Epsom salt).'],
      fr: ['Le sel anhydre est le sulfate de magnésium.', 'Sept eaux : hepta- + hydrate.', 'Sulfate de magnésium heptahydrate (sel d’Epsom).'],
    },
  },
  {
    id: 'na2co3-10h2o', f: 'Na2CO3·10H2O', en: 'sodium carbonate decahydrate', fr: 'carbonate de sodium décahydrate', cat: 'hydrate',
    steps: {
      en: ['The anhydrous salt is sodium carbonate.', 'Ten waters: deca- + hydrate.', 'Sodium carbonate decahydrate (washing soda).'],
      fr: ['Le sel anhydre est le carbonate de sodium.', 'Dix eaux : déca- + hydrate.', 'Carbonate de sodium décahydrate (cristaux de soude).'],
    },
  },
  {
    id: 'caso4-2h2o', f: 'CaSO4·2H2O', en: 'calcium sulfate dihydrate', fr: 'sulfate de calcium dihydrate', cat: 'hydrate',
    steps: {
      en: ['Anhydrous calcium sulfate plus two waters.', 'di- + hydrate.', 'Calcium sulfate dihydrate is gypsum.'],
      fr: ['Sulfate de calcium anhydre plus deux eaux.', 'di- + hydrate.', 'Le sulfate de calcium dihydrate est le gypse.'],
    },
  },
  {
    id: 'cocl2-6h2o', f: 'CoCl2·6H2O', en: 'cobalt(II) chloride hexahydrate', fr: 'chlorure de cobalt(II) hexahydrate', cat: 'hydrate',
    steps: {
      en: ['Two Cl− make cobalt +2, so the Stock numeral is (II).', 'Six waters: hexa- + hydrate.', 'Cobalt(II) chloride hexahydrate (pink when hydrated, blue when anhydrous).'],
      fr: ['Deux Cl− imposent +2 au cobalt, d’où le chiffre (II).', 'Six eaux : hexa- + hydrate.', 'Chlorure de cobalt(II) hexahydrate (rose hydraté, bleu anhydre).'],
    },
  },
];

/** Examples usable in the quiz: those whose name is unambiguous without a state. */
export const QUIZ_ITEMS = EXAMPLES.filter((e) => e.cat);
