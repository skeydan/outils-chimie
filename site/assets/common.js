// Strings shared by every page (navigation, footer) and the source list helper.
export const COMMON = {
  'nav.lewis': { en: 'Lewis structures', fr: 'Schémas de Lewis' },
  'nav.redox': { en: 'Redox', fr: 'Oxydoréduction' },
  'nav.acidbase': { en: 'Acids and bases', fr: 'Acides et bases' },
  footer: {
    en: 'Independent personal project. Texts and drawings are original; data come from the sources listed on each page.',
    fr: 'Projet personnel indépendant. Textes et dessins originaux ; les données viennent des sources citées sur chaque page.',
  },
};

/** The book most sources come from (shown under each source list). */
export const OPENSTAX_REF = {
  en: 'OpenStax Chemistry 2e: P. Flowers, K. Theopold, R. Langley, W. R. Robinson et al., Rice University, 2019, CC BY-NC-SA 4.0. Values and facts were read on its web pages; no text is copied.',
  fr: 'OpenStax Chemistry 2e : P. Flowers, K. Theopold, R. Langley, W. R. Robinson et al., Rice University, 2019, CC BY-NC-SA 4.0. Valeurs et faits lus sur ses pages web ; aucun texte n’est recopié.',
};

/** Every source used on the site; pages pick the ones they cite. */
export const SOURCES = {
  'openstax-lewis': { text: 'OpenStax, Chemistry 2e, section 7.3 “Lewis Symbols and Structures”: five-step procedure, the least electronegative atom usually central, hydrogen and fluorine never central, odd-electron molecules (NO: the octet goes to the more electronegative atom), electron-deficient molecules (groups 2 and 13; BF3 bond lengths close to single bonds), hypervalent molecules of period 3 and beyond (PCl5, SF6, IF5, XeF4).', url: 'https://openstax.org/books/chemistry-2e/pages/7-3-lewis-symbols-and-structures' },
  'openstax-fc': { text: 'OpenStax, Chemistry 2e, section 7.4 “Formal Charges and Resonance”: formal charge formula, the four guidelines for choosing a structure, resonance (examples CO2, SCN−, N2O, NO2−, CO32−, ICl4−, BrCl3).', url: 'https://openstax.org/books/chemistry-2e/pages/7-4-formal-charges-and-resonance' },
  'openstax-vsepr': { text: 'OpenStax, Chemistry 2e, section 7.6 “Molecular Structure and Polarity”: VSEPR theory, electron-pair geometries and molecular structures, H2O bond angle 104.5°.', url: 'https://openstax.org/books/chemistry-2e/pages/7-6-molecular-structure-and-polarity' },
  'openstax-mo': { text: 'OpenStax, Chemistry 2e, section 8.4 “Molecular Orbital Theory”: O2 is paramagnetic with two unpaired electrons, which its Lewis structure does not show.', url: 'https://openstax.org/books/chemistry-2e/pages/8-4-molecular-orbital-theory' },
  'pubchem-pt': { text: 'PubChem (NCBI), Periodic Table of Elements, data table (Pauling electronegativities, names), downloaded 15 October 2026.', url: 'https://pubchem.ncbi.nlm.nih.gov/periodic-table/' },
  'iupac-os': { text: 'P. Karen, P. McArdle, J. Takats, “Comprehensive definition of oxidation state (IUPAC Recommendations 2016)”, Pure Appl. Chem. 88 (2016) 831–839, doi:10.1515/pac-2015-1204. Read in the review manuscript posted by IUPAC and checked against the final paper: ionic approximation, homonuclear bonds divided equally, Allen electronegativities (addendum 6.1), thiosulfate (S–S practically a single bond: +5 for the central S, −1 for the terminal S, section 5.3), H3PO3 (two possible assignments because P and H have almost equal electronegativities, section 5.5), I3− and N3−.', url: 'https://iupac.org/cms/wp-content/uploads/2016/02/Comprehensive-definition-of-oxidation-state.pdf' },
  'wp-hypervalent': { text: 'Wikipedia, “Hypervalent molecule”, sections “Bonding in hypervalent molecules”, “Three-center four-electron bond model” and “History and controversy”: the energetic contribution of d orbitals is probably minimal (E. Magnusson, 1990); the 3-centre 4-electron model keeps the octet; IUPAC recommends expanded-octet drawings for groups such as sulfones to avoid many formal charges. Consulted 16 October 2026.', url: 'https://en.wikipedia.org/wiki/Hypervalent_molecule' },
  'openstax-ka': { text: 'OpenStax, Chemistry 2e, Appendix H “Ionization Constants of Weak Acids” (Ka at 25 °C).', url: 'https://openstax.org/books/chemistry-2e/pages/h-ionization-constants-of-weak-acids' },
  'openstax-kb': { text: 'OpenStax, Chemistry 2e, Appendix I “Ionization Constants of Weak Bases” (Kb at 25 °C).', url: 'https://openstax.org/books/chemistry-2e/pages/i-ionization-constants-of-weak-bases' },
  'wp-tetrathionate': { text: 'Wikipedia, “Tetrathionate” (structure O3S–S–S–SO3; two S atoms at oxidation state 0 and two at +5), consulted 15 October 2026.', url: 'https://en.wikipedia.org/wiki/Tetrathionate' },
  'wp-peroxydisulfate': { text: 'Wikipedia, “Peroxydisulfate” (structure [O3SO–OSO3]2−), consulted 15 October 2026.', url: 'https://en.wikipedia.org/wiki/Peroxydisulfate' },
  'wp-n2o4': { text: 'Wikipedia, “Dinitrogen tetroxide” (two NO2 groups joined by a long, weak N–N bond), consulted 15 October 2026.', url: 'https://en.wikipedia.org/wiki/Dinitrogen_tetroxide' },
  'wp-oxalate': { text: 'Wikipedia, “Oxalate” (two C atoms bonded to each other, each bonded to two O), consulted 15 October 2026.', url: 'https://en.wikipedia.org/wiki/Oxalate' },
  'wp-fe3o4': { text: 'Wikipedia, “Iron(II,III) oxide” (IUPAC name iron(II) diiron(III) oxide: one Fe2+ and two Fe3+ per Fe3O4), consulted 15 October 2026.', url: 'https://en.wikipedia.org/wiki/Iron(II,III)_oxide' },
  'openstax-ox': { text: 'OpenStax, Chemistry 2e, section 4.2 “Classifying Chemical Reactions”: guidelines for oxidation numbers, the half-reaction method (acidic and basic solution), Examples 4.5–4.7.', url: 'https://openstax.org/books/chemistry-2e/pages/4-2-classifying-chemical-reactions' },
  'openstax-organic-ox': { text: 'OpenStax, Chemistry 2e, section 20.3 “Aldehydes, Ketones, Carboxylic Acids, and Esters”: oxidation numbers of carbon in CH4 (−4), CH3OH (−2), HCHO (0), HCOOH (+2), CO2 (+4).', url: 'https://openstax.org/books/chemistry-2e/pages/20-3-aldehydes-ketones-carboxylic-acids-and-esters' },
  'openstax-redox': { text: 'OpenStax, Chemistry 2e, section 17.1 “Review of Redox Chemistry” (half-reaction method, Examples 17.1 and 17.2).', url: 'https://openstax.org/books/chemistry-2e/pages/17-1-review-of-redox-chemistry' },
  'openstax-cell': { text: 'OpenStax, Chemistry 2e, section 17.3 “Electrode and Cell Potentials”: E°cell = E°cathode − E°anode; positive means spontaneous under standard conditions.', url: 'https://openstax.org/books/chemistry-2e/pages/17-3-electrode-and-cell-potentials' },
  'openstax-dg': { text: 'OpenStax, Chemistry 2e, section 17.4 “Potential, Free Energy, and Equilibrium”: ΔG° = −nFE°cell, F = 96 485 C/mol, K = 10^(nE°cell/0.0592 V) at 25 °C.', url: 'https://openstax.org/books/chemistry-2e/pages/17-4-potential-free-energy-and-equilibrium' },
  'openstax-e': { text: 'OpenStax, Chemistry 2e, Appendix L “Standard Electrode (Half-Cell) Potentials” (25 °C).', url: 'https://openstax.org/books/chemistry-2e/pages/l-standard-electrode-half-cell-potentials' },
  'lt-p1': { text: 'LibreTexts Chemistry, Reference Table P1 “Standard Reduction Potentials by Element” (used only for O3/O2, BrO3−/Br−, IO3−/I2, S2O8 2−/SO4 2− and S4O6 2−/S2O3 2−, absent from the OpenStax table).', url: 'https://chem.libretexts.org/Ancillary_Materials/Reference/Reference_Tables/Electrochemistry_Tables/P1%3A_Standard_Reduction_Potentials_by_Element' },
  'wp-sep': { text: 'Wikipedia, “Standard electrode potential (data page)” (gives 1.33 V for Cr2O72−/Cr3+, citing Greenwood and Earnshaw, Chemistry of the Elements, 2nd ed., 1997, p. 1005), consulted 15 October 2026.', url: 'https://en.wikipedia.org/wiki/Standard_electrode_potential_(data_page)' },
  'openstax-bl': { text: 'OpenStax, Chemistry 2e, section 14.1 “Brønsted-Lowry Acids and Bases”: conjugate pairs, amphiprotic species, Kw = 1.0 × 10−14 at 25 °C.', url: 'https://openstax.org/books/chemistry-2e/pages/14-1-bronsted-lowry-acids-and-bases' },
  'openstax-strength': { text: 'OpenStax, Chemistry 2e, section 14.3 “Relative Strengths of Acids and Bases”: the six strong acids and six strong bases (Figure 14.6), Ka × Kb = Kw, the 5 % check, Examples 14.12–14.14.', url: 'https://openstax.org/books/chemistry-2e/pages/14-3-relative-strengths-of-acids-and-bases' },
  'openstax-polyprotic': { text: 'OpenStax, Chemistry 2e, section 14.5 “Polyprotic Acids”: the first ionization can be treated alone when Ka1 is at least 20 times Ka2; sulfuric acid’s first ionization is complete, Ka2 = 1.2 × 10−2.', url: 'https://openstax.org/books/chemistry-2e/pages/14-5-polyprotic-acids' },
  'openstax-buffer': { text: 'OpenStax, Chemistry 2e, section 14.6 “Buffers”: Henderson–Hasselbalch equation (valid when the “x is small” assumption holds), buffer capacity, Example 14.20.', url: 'https://openstax.org/books/chemistry-2e/pages/14-6-buffers' },
  'openstax-titration': { text: 'OpenStax, Chemistry 2e, section 14.7 “Acid-Base Titrations”: Examples 14.21–14.22, Table 14.2 (25.00 mL of 0.100 M HCl or acetic acid titrated with 0.100 M NaOH), pH = pKa at half-equivalence.', url: 'https://openstax.org/books/chemistry-2e/pages/14-7-acid-base-titrations' },
};
