// Acids and bases with their ionization constants at 25 °C.
//   openstax-ka: OpenStax Chemistry 2e, Appendix H "Ionization Constants of Weak Acids"
//   openstax-kb: OpenStax Chemistry 2e, Appendix I "Ionization Constants of Weak Bases"
//   openstax-strength: OpenStax Chemistry 2e, 14.3, Figure 14.6 (six strong acids, six strong bases)
//   openstax-bl: OpenStax Chemistry 2e, 14.1 (Kw = 1.0 × 10^-14 at 25 °C)
// A "family" is an acid with all its forms: H_nA (charge z0) loses protons one by one.
// Ka values are copied as printed (each step of a polyprotic acid in order).

export const KW = 1.0e-14;

export const FAMILIES = [
  // weak acids (Appendix H)
  { id: 'acetic', forms: ['CH3COOH', 'CH3COO-'], z0: 0, Ka: [1.8e-5], src: 'openstax-ka', name: { en: 'acetic acid', fr: 'acide acétique' }, base: { en: 'acetate', fr: 'ion acétate' } },
  { id: 'formic', forms: ['HCOOH', 'HCOO-'], z0: 0, Ka: [1.8e-4], src: 'openstax-ka', name: { en: 'formic acid', fr: 'acide formique (méthanoïque)' }, base: { en: 'formate', fr: 'ion formiate (méthanoate)' } },
  { id: 'hf', forms: ['HF', 'F-'], z0: 0, Ka: [6.4e-4], src: 'openstax-ka', name: { en: 'hydrofluoric acid', fr: 'acide fluorhydrique' }, base: { en: 'fluoride', fr: 'ion fluorure' } },
  { id: 'hno2', forms: ['HNO2', 'NO2-'], z0: 0, Ka: [4.6e-4], src: 'openstax-ka', name: { en: 'nitrous acid', fr: 'acide nitreux' }, base: { en: 'nitrite', fr: 'ion nitrite' } },
  { id: 'hcn', forms: ['HCN', 'CN-'], z0: 0, Ka: [4.9e-10], src: 'openstax-ka', name: { en: 'hydrocyanic acid', fr: 'acide cyanhydrique' }, base: { en: 'cyanide', fr: 'ion cyanure' } },
  { id: 'hclo', forms: ['HClO', 'ClO-'], z0: 0, Ka: [2.9e-8], src: 'openstax-ka', name: { en: 'hypochlorous acid', fr: 'acide hypochloreux' }, base: { en: 'hypochlorite', fr: 'ion hypochlorite' } },
  { id: 'hbro', forms: ['HBrO', 'BrO-'], z0: 0, Ka: [2.8e-9], src: 'openstax-ka', name: { en: 'hypobromous acid', fr: 'acide hypobromeux' }, base: { en: 'hypobromite', fr: 'ion hypobromite' } },
  { id: 'hn3', forms: ['HN3', 'N3^-'], z0: 0, Ka: [2.5e-5], src: 'openstax-ka', name: { en: 'hydrazoic acid', fr: 'acide azothydrique' }, base: { en: 'azide', fr: 'ion azoture' } },
  { id: 'boric', forms: ['H3BO3', 'H2BO3-'], z0: 0, Ka: [5.4e-10], src: 'openstax-ka', name: { en: 'boric acid', fr: 'acide borique' }, base: { en: 'dihydrogen borate', fr: 'ion dihydrogénoborate' } },
  { id: 'h2o2', forms: ['H2O2', 'HO2-'], z0: 0, Ka: [2.4e-12], src: 'openstax-ka', name: { en: 'hydrogen peroxide', fr: 'peroxyde d’hydrogène' }, base: { en: 'hydroperoxide', fr: 'ion hydroperoxyde' } },
  { id: 'hso4', forms: ['HSO4-', 'SO4^2-'], z0: -1, Ka: [1.2e-2], src: 'openstax-ka', name: { en: 'hydrogen sulfate ion', fr: 'ion hydrogénosulfate' }, base: { en: 'sulfate', fr: 'ion sulfate' } },
  { id: 'carbonic', forms: ['H2CO3', 'HCO3-', 'CO3^2-'], z0: 0, Ka: [4.3e-7, 4.7e-11], src: 'openstax-ka', name: { en: 'carbonic acid', fr: 'acide carbonique' }, base: { en: 'hydrogen carbonate', fr: 'ion hydrogénocarbonate' } },
  { id: 'h2s', forms: ['H2S', 'HS-', 'S^2-'], z0: 0, Ka: [8.9e-8, 1.0e-19], src: 'openstax-ka', name: { en: 'hydrogen sulfide', fr: 'sulfure d’hydrogène' }, base: { en: 'hydrogen sulfide ion', fr: 'ion hydrogénosulfure' } },
  { id: 'oxalic', forms: ['H2C2O4', 'HC2O4-', 'C2O4^2-'], z0: 0, Ka: [6.0e-2, 6.1e-5], src: 'openstax-ka', name: { en: 'oxalic acid', fr: 'acide oxalique' }, base: { en: 'hydrogen oxalate', fr: 'ion hydrogénooxalate' } },
  { id: 'sulfurous', forms: ['H2SO3', 'HSO3-', 'SO3^2-'], z0: 0, Ka: [1.6e-2, 6.4e-8], src: 'openstax-ka', name: { en: 'sulfurous acid', fr: 'acide sulfureux' }, base: { en: 'hydrogen sulfite', fr: 'ion hydrogénosulfite' } },
  { id: 'phosphoric', forms: ['H3PO4', 'H2PO4-', 'HPO4^2-', 'PO4^3-'], z0: 0, Ka: [7.5e-3, 6.2e-8, 4.2e-13], src: 'openstax-ka', name: { en: 'phosphoric acid', fr: 'acide phosphorique' }, base: { en: 'dihydrogen phosphate', fr: 'ion dihydrogénophosphate' } },
  { id: 'phosphorous', forms: ['H3PO3', 'H2PO3-', 'HPO3^2-'], z0: 0, Ka: [5e-2, 2.0e-7], src: 'openstax-ka', name: { en: 'phosphorous acid', fr: 'acide phosphoreux' }, base: { en: 'dihydrogen phosphite', fr: 'ion dihydrogénophosphite' } },
  { id: 'arsenic', forms: ['H3AsO4', 'H2AsO4-', 'HAsO4^2-', 'AsO4^3-'], z0: 0, Ka: [5.5e-3, 1.7e-7, 3.0e-12], src: 'openstax-ka', name: { en: 'arsenic acid', fr: 'acide arsénique' }, base: { en: 'dihydrogen arsenate', fr: 'ion dihydrogénoarséniate' } },
  // weak bases (Appendix I): stored as their conjugate acids, Ka = Kw / Kb (calculated)
  { id: 'ammonia', forms: ['NH4+', 'NH3'], z0: 1, Kb: 1.8e-5, src: 'openstax-kb', name: { en: 'ammonium ion', fr: 'ion ammonium' }, base: { en: 'ammonia', fr: 'ammoniac' } },
  { id: 'methylamine', forms: ['CH3NH3+', 'CH3NH2'], z0: 1, Kb: 4.4e-4, src: 'openstax-kb', name: { en: 'methylammonium ion', fr: 'ion méthylammonium' }, base: { en: 'methylamine', fr: 'méthylamine' } },
  { id: 'dimethylamine', forms: ['(CH3)2NH2+', '(CH3)2NH'], z0: 1, Kb: 5.9e-4, src: 'openstax-kb', name: { en: 'dimethylammonium ion', fr: 'ion diméthylammonium' }, base: { en: 'dimethylamine', fr: 'diméthylamine' } },
  { id: 'trimethylamine', forms: ['(CH3)3NH+', '(CH3)3N'], z0: 1, Kb: 6.3e-5, src: 'openstax-kb', name: { en: 'trimethylammonium ion', fr: 'ion triméthylammonium' }, base: { en: 'trimethylamine', fr: 'triméthylamine' } },
  { id: 'aniline', forms: ['C6H5NH3+', 'C6H5NH2'], z0: 1, Kb: 4.3e-10, src: 'openstax-kb', name: { en: 'anilinium ion', fr: 'ion anilinium' }, base: { en: 'aniline', fr: 'aniline' } },
];
for (const f of FAMILIES) if (f.Kb) { f.Ka = [KW / f.Kb]; f.kaFromKb = true; }

export const STRONG_ACIDS = [
  { id: 'HClO4', formula: 'HClO4', conj: 'ClO4-', name: { en: 'perchloric acid', fr: 'acide perchlorique' } },
  { id: 'HCl', formula: 'HCl', conj: 'Cl-', name: { en: 'hydrochloric acid', fr: 'acide chlorhydrique' } },
  { id: 'HBr', formula: 'HBr', conj: 'Br-', name: { en: 'hydrobromic acid', fr: 'acide bromhydrique' } },
  { id: 'HI', formula: 'HI', conj: 'I-', name: { en: 'hydroiodic acid', fr: 'acide iodhydrique' } },
  { id: 'HNO3', formula: 'HNO3', conj: 'NO3-', name: { en: 'nitric acid', fr: 'acide nitrique' } },
  // first proton complete; the second is the weak acid HSO4- (Ka = 1.2e-2)
  { id: 'H2SO4', formula: 'H2SO4', conj: 'HSO4-', name: { en: 'sulfuric acid', fr: 'acide sulfurique' }, second: 'hso4' },
];
export const STRONG_BASES = [
  { id: 'LiOH', formula: 'LiOH', oh: 1, cation: 'Li+', name: { en: 'lithium hydroxide', fr: 'hydroxyde de lithium' } },
  { id: 'NaOH', formula: 'NaOH', oh: 1, cation: 'Na+', name: { en: 'sodium hydroxide', fr: 'hydroxyde de sodium (soude)' } },
  { id: 'KOH', formula: 'KOH', oh: 1, cation: 'K+', name: { en: 'potassium hydroxide', fr: 'hydroxyde de potassium (potasse)' } },
  { id: 'CaOH2', formula: 'Ca(OH)2', oh: 2, cation: 'Ca^2+', name: { en: 'calcium hydroxide', fr: 'hydroxyde de calcium' } },
  { id: 'SrOH2', formula: 'Sr(OH)2', oh: 2, cation: 'Sr^2+', name: { en: 'strontium hydroxide', fr: 'hydroxyde de strontium' } },
  { id: 'BaOH2', formula: 'Ba(OH)2', oh: 2, cation: 'Ba^2+', name: { en: 'barium hydroxide', fr: 'hydroxyde de baryum' } },
];

export const famById = new Map(FAMILIES.map((f) => [f.id, f]));

/**
 * Every acid/base species as one list, for the "who gives the proton" section.
 * Each entry: {key, formula, role:'acid'|'base'|'both', fam, step} where
 * fam/step locate it in a family (step j: the form that has lost j protons).
 * Special: water, H3O+, OH-, strong acids (and their conjugate bases).
 */
export function speciesList() {
  const out = [];
  for (const f of FAMILIES) {
    f.forms.forEach((formula, j) => {
      const canGive = j < f.forms.length - 1;
      const canTake = j > 0;
      out.push({ key: `${f.id}:${j}`, formula, fam: f.id, step: j, role: canGive && canTake ? 'both' : canGive ? 'acid' : 'base' });
    });
  }
  out.push({ key: 'H3O+', formula: 'H3O+', role: 'acid', special: 'hydronium' });
  out.push({ key: 'H2O', formula: 'H2O', role: 'both', special: 'water' });
  out.push({ key: 'OH-', formula: 'OH-', role: 'base', special: 'hydroxide' });
  for (const a of STRONG_ACIDS) {
    out.push({ key: `strong:${a.id}`, formula: a.formula, role: 'acid', strong: a.id });
    if (a.id !== 'H2SO4') out.push({ key: `conj:${a.id}`, formula: a.conj, role: 'base', negligible: a.id });
  }
  return out;
}

// ------------------------------------------------------------ names of every form
// Index j: the form that has lost j protons (same order as `forms`).
const NAMES = {
  acetic: [['acetic acid', 'acide acétique (éthanoïque)'], ['acetate ion', 'ion acétate (éthanoate)']],
  formic: [['formic acid', 'acide formique (méthanoïque)'], ['formate ion', 'ion formiate (méthanoate)']],
  hf: [['hydrofluoric acid', 'acide fluorhydrique'], ['fluoride ion', 'ion fluorure']],
  hno2: [['nitrous acid', 'acide nitreux'], ['nitrite ion', 'ion nitrite']],
  hcn: [['hydrocyanic acid', 'acide cyanhydrique'], ['cyanide ion', 'ion cyanure']],
  hclo: [['hypochlorous acid', 'acide hypochloreux'], ['hypochlorite ion', 'ion hypochlorite']],
  hbro: [['hypobromous acid', 'acide hypobromeux'], ['hypobromite ion', 'ion hypobromite']],
  hn3: [['hydrazoic acid', 'acide azothydrique'], ['azide ion', 'ion azoture']],
  boric: [['boric acid', 'acide borique'], ['dihydrogen borate ion', 'ion dihydrogénoborate']],
  h2o2: [['hydrogen peroxide', 'peroxyde d’hydrogène'], ['hydroperoxide ion', 'ion hydroperoxyde']],
  hso4: [['hydrogen sulfate ion', 'ion hydrogénosulfate'], ['sulfate ion', 'ion sulfate']],
  carbonic: [['carbonic acid', 'acide carbonique'], ['hydrogen carbonate ion', 'ion hydrogénocarbonate'], ['carbonate ion', 'ion carbonate']],
  h2s: [['hydrogen sulfide', 'sulfure d’hydrogène'], ['hydrogen sulfide ion', 'ion hydrogénosulfure'], ['sulfide ion', 'ion sulfure']],
  oxalic: [['oxalic acid', 'acide oxalique'], ['hydrogen oxalate ion', 'ion hydrogénooxalate'], ['oxalate ion', 'ion oxalate']],
  sulfurous: [['sulfurous acid', 'acide sulfureux'], ['hydrogen sulfite ion', 'ion hydrogénosulfite'], ['sulfite ion', 'ion sulfite']],
  phosphoric: [['phosphoric acid', 'acide phosphorique'], ['dihydrogen phosphate ion', 'ion dihydrogénophosphate'], ['hydrogen phosphate ion', 'ion hydrogénophosphate'], ['phosphate ion', 'ion phosphate']],
  phosphorous: [['phosphorous acid', 'acide phosphoreux'], ['dihydrogen phosphite ion', 'ion dihydrogénophosphite'], ['hydrogen phosphite ion', 'ion hydrogénophosphite']],
  arsenic: [['arsenic acid', 'acide arsénique'], ['dihydrogen arsenate ion', 'ion dihydrogénoarséniate'], ['hydrogen arsenate ion', 'ion hydrogénoarséniate'], ['arsenate ion', 'ion arséniate']],
  ammonia: [['ammonium ion', 'ion ammonium'], ['ammonia', 'ammoniac']],
  methylamine: [['methylammonium ion', 'ion méthylammonium'], ['methylamine', 'méthylamine']],
  dimethylamine: [['dimethylammonium ion', 'ion diméthylammonium'], ['dimethylamine', 'diméthylamine']],
  trimethylamine: [['trimethylammonium ion', 'ion triméthylammonium'], ['trimethylamine', 'triméthylamine']],
  aniline: [['anilinium ion', 'ion anilinium'], ['aniline', 'aniline']],
};
for (const f of FAMILIES) f.names = NAMES[f.id].map(([en, fr]) => ({ en, fr }));

// ------------------------------------------------------------ reagents for the dropdowns
// What one can put in a flask. kind:
//   'strong-acid' (n protons released completely; H2SO4: the first only, then the weak HSO4-),
//   'strong-base' (n OH- per formula unit),
//   'form'        (form j of a family; a charged form comes with spectator ions,
//                  Na+ for anions and Cl- for cations, so that the solution is neutral),
//   'neutral'     (a salt of a strong acid and a strong base: NaCl).
// group: the <optgroup> the reagent is listed in.
export const REAGENTS = [
  ...STRONG_ACIDS.map((a) => ({ id: a.id, formula: a.formula, kind: 'strong-acid', group: 'strong-acid', name: a.name, strong: a })),
  ...['acetic', 'formic', 'hf', 'hno2', 'hcn', 'hclo', 'hbro', 'hn3', 'boric', 'h2o2', 'carbonic', 'h2s', 'oxalic', 'sulfurous', 'phosphoric', 'phosphorous', 'arsenic']
    .map((id) => ({ id, fam: id, j: 0, kind: 'form', group: 'weak-acid' })),
  ...STRONG_BASES.map((b) => ({ id: b.id, formula: b.formula, kind: 'strong-base', group: 'strong-base', name: b.name, strong: b })),
  ...['ammonia', 'methylamine', 'dimethylamine', 'trimethylamine', 'aniline'].map((id) => ({ id, fam: id, j: 1, kind: 'form', group: 'weak-base' })),
  // salts: the ion that reacts with water is form j of the family
  { id: 'NH4Cl', formula: 'NH4Cl', fam: 'ammonia', j: 0, kind: 'form', group: 'salt', name: { en: 'ammonium chloride', fr: 'chlorure d’ammonium' } },
  { id: 'CH3NH3Cl', formula: 'CH3NH3Cl', fam: 'methylamine', j: 0, kind: 'form', group: 'salt', name: { en: 'methylammonium chloride', fr: 'chlorure de méthylammonium' } },
  { id: 'C6H5NH3Cl', formula: 'C6H5NH3Cl', fam: 'aniline', j: 0, kind: 'form', group: 'salt', name: { en: 'anilinium chloride', fr: 'chlorure d’anilinium' } },
  { id: 'NaHSO4', formula: 'NaHSO4', fam: 'hso4', j: 0, kind: 'form', group: 'salt', name: { en: 'sodium hydrogen sulfate', fr: 'hydrogénosulfate de sodium' } },
  { id: 'NaH2PO4', formula: 'NaH2PO4', fam: 'phosphoric', j: 1, kind: 'form', group: 'salt', name: { en: 'sodium dihydrogen phosphate', fr: 'dihydrogénophosphate de sodium' } },
  { id: 'NaHCO3', formula: 'NaHCO3', fam: 'carbonic', j: 1, kind: 'form', group: 'salt', name: { en: 'sodium hydrogen carbonate (baking soda)', fr: 'hydrogénocarbonate de sodium (bicarbonate)' } },
  { id: 'Na2HPO4', formula: 'Na2HPO4', fam: 'phosphoric', j: 2, kind: 'form', group: 'salt', name: { en: 'disodium hydrogen phosphate', fr: 'hydrogénophosphate de sodium' } },
  { id: 'NaCH3COO', formula: 'CH3COONa', fam: 'acetic', j: 1, kind: 'form', group: 'salt', name: { en: 'sodium acetate', fr: 'acétate de sodium' } },
  { id: 'NaHCOO', formula: 'HCOONa', fam: 'formic', j: 1, kind: 'form', group: 'salt', name: { en: 'sodium formate', fr: 'formiate de sodium' } },
  { id: 'NaF', formula: 'NaF', fam: 'hf', j: 1, kind: 'form', group: 'salt', name: { en: 'sodium fluoride', fr: 'fluorure de sodium' } },
  { id: 'NaNO2', formula: 'NaNO2', fam: 'hno2', j: 1, kind: 'form', group: 'salt', name: { en: 'sodium nitrite', fr: 'nitrite de sodium' } },
  { id: 'NaClO', formula: 'NaClO', fam: 'hclo', j: 1, kind: 'form', group: 'salt', name: { en: 'sodium hypochlorite (bleach)', fr: 'hypochlorite de sodium (eau de Javel)' } },
  { id: 'NaCN', formula: 'NaCN', fam: 'hcn', j: 1, kind: 'form', group: 'salt', name: { en: 'sodium cyanide', fr: 'cyanure de sodium' } },
  { id: 'Na2SO3', formula: 'Na2SO3', fam: 'sulfurous', j: 2, kind: 'form', group: 'salt', name: { en: 'sodium sulfite', fr: 'sulfite de sodium' } },
  { id: 'Na2C2O4', formula: 'Na2C2O4', fam: 'oxalic', j: 2, kind: 'form', group: 'salt', name: { en: 'sodium oxalate', fr: 'oxalate de sodium' } },
  { id: 'Na2CO3', formula: 'Na2CO3', fam: 'carbonic', j: 2, kind: 'form', group: 'salt', name: { en: 'sodium carbonate', fr: 'carbonate de sodium' } },
  { id: 'Na3PO4', formula: 'Na3PO4', fam: 'phosphoric', j: 3, kind: 'form', group: 'salt', name: { en: 'trisodium phosphate', fr: 'phosphate de sodium' } },
  { id: 'NaCl', formula: 'NaCl', kind: 'neutral', group: 'salt', name: { en: 'sodium chloride', fr: 'chlorure de sodium' } },
];
for (const r of REAGENTS) {
  if (r.kind !== 'form') continue;
  const f = famById.get(r.fam);
  if (!r.formula) r.formula = f.forms[r.j];
  if (!r.name) r.name = f.names[r.j];
}
export const reagentById = new Map(REAGENTS.map((r) => [r.id, r]));

/** Every conjugate pair (form j / form j+1) of every family, for the buffer dropdown. */
export function pairs() {
  const out = [];
  for (const f of FAMILIES) for (let j = 0; j < f.Ka.length; j++) out.push({ id: `${f.id}:${j}`, fam: f, j, acid: f.forms[j], base: f.forms[j + 1], Ka: f.Ka[j] });
  return out;
}
