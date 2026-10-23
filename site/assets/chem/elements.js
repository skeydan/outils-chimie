// Element data used by the three tools.
// - Symbol, atomic number, name: PubChem periodic table (NCBI), downloaded
//   2026-10-15 from https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON
// - Pauling electronegativity: same PubChem table (column "Electronegativity").
// - Allen electronegativity: IUPAC Recommendations 2016, "Comprehensive
//   definition of oxidation state" (Karen, McArdle, Takats), Pure Appl.
//   Chem. 88 (2016) 831-839, addendum 6.1 (values of the final paper),
//   the scale IUPAC uses for the ionic approximation of oxidation states.
// - Period and group follow from the atomic number (18-column table);
//   lanthanides and actinides have group null and block 'f'.
// Columns: symbol, Z, period, group, block, Pauling, Allen, English name, French name.

const ROWS = [
  ['H', 1, 1, 1, 's', 2.2, 2.3, 'Hydrogen', 'hydrogène'],
  ['He', 2, 1, 18, 's', null, 4.16, 'Helium', 'hélium'],
  ['Li', 3, 2, 1, 's', 0.98, 0.912, 'Lithium', 'lithium'],
  ['Be', 4, 2, 2, 's', 1.57, 1.576, 'Beryllium', 'béryllium'],
  ['B', 5, 2, 13, 'p', 2.04, 2.051, 'Boron', 'bore'],
  ['C', 6, 2, 14, 'p', 2.55, 2.544, 'Carbon', 'carbone'],
  ['N', 7, 2, 15, 'p', 3.04, 3.066, 'Nitrogen', 'azote'],
  ['O', 8, 2, 16, 'p', 3.44, 3.61, 'Oxygen', 'oxygène'],
  ['F', 9, 2, 17, 'p', 3.98, 4.193, 'Fluorine', 'fluor'],
  ['Ne', 10, 2, 18, 'p', null, 4.787, 'Neon', 'néon'],
  ['Na', 11, 3, 1, 's', 0.93, 0.869, 'Sodium', 'sodium'],
  ['Mg', 12, 3, 2, 's', 1.31, 1.293, 'Magnesium', 'magnésium'],
  ['Al', 13, 3, 13, 'p', 1.61, 1.613, 'Aluminium', 'aluminium'],
  ['Si', 14, 3, 14, 'p', 1.9, 1.916, 'Silicon', 'silicium'],
  ['P', 15, 3, 15, 'p', 2.19, 2.253, 'Phosphorus', 'phosphore'],
  ['S', 16, 3, 16, 'p', 2.58, 2.589, 'Sulfur', 'soufre'],
  ['Cl', 17, 3, 17, 'p', 3.16, 2.869, 'Chlorine', 'chlore'],
  ['Ar', 18, 3, 18, 'p', null, 3.242, 'Argon', 'argon'],
  ['K', 19, 4, 1, 's', 0.82, 0.734, 'Potassium', 'potassium'],
  ['Ca', 20, 4, 2, 's', 1.0, 1.034, 'Calcium', 'calcium'],
  ['Sc', 21, 4, 3, 'd', 1.36, 1.19, 'Scandium', 'scandium'],
  ['Ti', 22, 4, 4, 'd', 1.54, 1.38, 'Titanium', 'titane'],
  ['V', 23, 4, 5, 'd', 1.63, 1.53, 'Vanadium', 'vanadium'],
  ['Cr', 24, 4, 6, 'd', 1.66, 1.65, 'Chromium', 'chrome'],
  ['Mn', 25, 4, 7, 'd', 1.55, 1.75, 'Manganese', 'manganèse'],
  ['Fe', 26, 4, 8, 'd', 1.83, 1.8, 'Iron', 'fer'],
  ['Co', 27, 4, 9, 'd', 1.88, 1.84, 'Cobalt', 'cobalt'],
  ['Ni', 28, 4, 10, 'd', 1.91, 1.88, 'Nickel', 'nickel'],
  ['Cu', 29, 4, 11, 'd', 1.9, null, 'Copper', 'cuivre'],
  ['Zn', 30, 4, 12, 'd', 1.65, null, 'Zinc', 'zinc'],
  ['Ga', 31, 4, 13, 'p', 1.81, 1.756, 'Gallium', 'gallium'],
  ['Ge', 32, 4, 14, 'p', 2.01, 1.994, 'Germanium', 'germanium'],
  ['As', 33, 4, 15, 'p', 2.18, 2.211, 'Arsenic', 'arsenic'],
  ['Se', 34, 4, 16, 'p', 2.55, 2.424, 'Selenium', 'sélénium'],
  ['Br', 35, 4, 17, 'p', 2.96, 2.685, 'Bromine', 'brome'],
  ['Kr', 36, 4, 18, 'p', 3.0, 2.966, 'Krypton', 'krypton'],
  ['Rb', 37, 5, 1, 's', 0.82, 0.706, 'Rubidium', 'rubidium'],
  ['Sr', 38, 5, 2, 's', 0.95, 0.963, 'Strontium', 'strontium'],
  ['Y', 39, 5, 3, 'd', 1.22, null, 'Yttrium', 'yttrium'],
  ['Zr', 40, 5, 4, 'd', 1.33, null, 'Zirconium', 'zirconium'],
  ['Nb', 41, 5, 5, 'd', 1.6, null, 'Niobium', 'niobium'],
  ['Mo', 42, 5, 6, 'd', 2.16, null, 'Molybdenum', 'molybdène'],
  ['Tc', 43, 5, 7, 'd', 1.9, null, 'Technetium', 'technétium'],
  ['Ru', 44, 5, 8, 'd', 2.2, null, 'Ruthenium', 'ruthénium'],
  ['Rh', 45, 5, 9, 'd', 2.28, null, 'Rhodium', 'rhodium'],
  ['Pd', 46, 5, 10, 'd', 2.2, null, 'Palladium', 'palladium'],
  ['Ag', 47, 5, 11, 'd', 1.93, null, 'Silver', 'argent'],
  ['Cd', 48, 5, 12, 'd', 1.69, null, 'Cadmium', 'cadmium'],
  ['In', 49, 5, 13, 'p', 1.78, 1.656, 'Indium', 'indium'],
  ['Sn', 50, 5, 14, 'p', 1.96, 1.824, 'Tin', 'étain'],
  ['Sb', 51, 5, 15, 'p', 2.05, 1.984, 'Antimony', 'antimoine'],
  ['Te', 52, 5, 16, 'p', 2.1, 2.158, 'Tellurium', 'tellure'],
  ['I', 53, 5, 17, 'p', 2.66, 2.359, 'Iodine', 'iode'],
  ['Xe', 54, 5, 18, 'p', 2.6, 2.582, 'Xenon', 'xénon'],
  ['Cs', 55, 6, 1, 's', 0.79, 0.659, 'Caesium', 'césium'],
  ['Ba', 56, 6, 2, 's', 0.89, 0.881, 'Barium', 'baryum'],
  ['La', 57, 6, null, 'f', 1.1, null, 'Lanthanum', 'lanthane'],
  ['Ce', 58, 6, null, 'f', 1.12, null, 'Cerium', 'cérium'],
  ['Pr', 59, 6, null, 'f', 1.13, null, 'Praseodymium', 'praséodyme'],
  ['Nd', 60, 6, null, 'f', 1.14, null, 'Neodymium', 'néodyme'],
  ['Pm', 61, 6, null, 'f', null, null, 'Promethium', 'prométhium'],
  ['Sm', 62, 6, null, 'f', 1.17, null, 'Samarium', 'samarium'],
  ['Eu', 63, 6, null, 'f', null, null, 'Europium', 'europium'],
  ['Gd', 64, 6, null, 'f', 1.2, null, 'Gadolinium', 'gadolinium'],
  ['Tb', 65, 6, null, 'f', null, null, 'Terbium', 'terbium'],
  ['Dy', 66, 6, null, 'f', 1.22, null, 'Dysprosium', 'dysprosium'],
  ['Ho', 67, 6, null, 'f', 1.23, null, 'Holmium', 'holmium'],
  ['Er', 68, 6, null, 'f', 1.24, null, 'Erbium', 'erbium'],
  ['Tm', 69, 6, null, 'f', 1.25, null, 'Thulium', 'thulium'],
  ['Yb', 70, 6, null, 'f', null, null, 'Ytterbium', 'ytterbium'],
  ['Lu', 71, 6, null, 'f', 1.27, null, 'Lutetium', 'lutécium'],
  ['Hf', 72, 6, 4, 'd', 1.3, null, 'Hafnium', 'hafnium'],
  ['Ta', 73, 6, 5, 'd', 1.5, null, 'Tantalum', 'tantale'],
  ['W', 74, 6, 6, 'd', 2.36, null, 'Tungsten', 'tungstène'],
  ['Re', 75, 6, 7, 'd', 1.9, null, 'Rhenium', 'rhénium'],
  ['Os', 76, 6, 8, 'd', 2.2, null, 'Osmium', 'osmium'],
  ['Ir', 77, 6, 9, 'd', 2.2, null, 'Iridium', 'iridium'],
  ['Pt', 78, 6, 10, 'd', 2.28, null, 'Platinum', 'platine'],
  ['Au', 79, 6, 11, 'd', 2.54, null, 'Gold', 'or'],
  ['Hg', 80, 6, 12, 'd', 2.0, null, 'Mercury', 'mercure'],
  ['Tl', 81, 6, 13, 'p', 1.62, 1.789, 'Thallium', 'thallium'],
  ['Pb', 82, 6, 14, 'p', 2.33, 1.854, 'Lead', 'plomb'],
  ['Bi', 83, 6, 15, 'p', 2.02, 2.01, 'Bismuth', 'bismuth'],
  ['Po', 84, 6, 16, 'p', 2.0, 2.19, 'Polonium', 'polonium'],
  ['At', 85, 6, 17, 'p', 2.2, 2.39, 'Astatine', 'astate'],
  ['Rn', 86, 6, 18, 'p', null, 2.6, 'Radon', 'radon'],
  ['Fr', 87, 7, 1, 's', 0.7, null, 'Francium', 'francium'],
  ['Ra', 88, 7, 2, 's', 0.9, null, 'Radium', 'radium'],
  ['Ac', 89, 7, null, 'f', 1.1, null, 'Actinium', 'actinium'],
  ['Th', 90, 7, null, 'f', 1.3, null, 'Thorium', 'thorium'],
  ['Pa', 91, 7, null, 'f', 1.5, null, 'Protactinium', 'protactinium'],
  ['U', 92, 7, null, 'f', 1.38, null, 'Uranium', 'uranium'],
  ['Np', 93, 7, null, 'f', 1.36, null, 'Neptunium', 'neptunium'],
  ['Pu', 94, 7, null, 'f', 1.28, null, 'Plutonium', 'plutonium'],
];

export const ELEMENTS = new Map(ROWS.map(([s, z, per, grp, block, pauling, allen, en, fr]) =>
  [s, { s, z, per, grp, block, pauling, allen, name: { en: en.toLowerCase(), fr } }]));

export const el = (s) => ELEMENTS.get(s);

/** Valence electrons of a main-group atom (groups 1, 2, 13-18; He has 2). null for d/f elements. */
export function valence(s) {
  const e = el(s);
  if (!e) return null;
  if (s === 'He') return 2;
  if (e.block === 'd' || e.block === 'f') return null;
  return e.grp <= 2 ? e.grp : e.grp - 10;
}

export const isMainGroup = (s) => { const e = el(s); return !!e && (e.block === 's' || e.block === 'p'); };
export const isTransition = (s) => { const e = el(s); return !!e && (e.block === 'd' || e.block === 'f'); };
/** Metals for the oxidation-number rules: groups 1 and 2 (not H), d and f blocks, and the p-block metals. */
const P_METALS = new Set(['Al', 'Ga', 'In', 'Sn', 'Tl', 'Pb', 'Bi', 'Po']);
export function isMetal(s) {
  const e = el(s);
  if (!e || s === 'H') return false;
  return e.grp === 1 || e.grp === 2 || e.block === 'd' || e.block === 'f' || P_METALS.has(s);
}
export const isNoble = (s) => el(s)?.grp === 18;
export const isHalogen = (s) => el(s)?.grp === 17;
export const elName = (s, lang) => el(s)?.name[lang === 'fr' ? 'fr' : 'en'] ?? s;
