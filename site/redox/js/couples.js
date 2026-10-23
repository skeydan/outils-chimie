// Redox couples with their standard reduction potentials at 25 °C.
// Every value is copied from the table named in `src`:
//   openstax-e: OpenStax Chemistry 2e, Appendix L, "Standard Electrode (Half-Cell) Potentials"
//   lt-p1:      LibreTexts Chemistry, Reference Table P1 "Standard Reduction Potentials by Element"
//               (only for couples missing from the OpenStax table)
// `table` is the half-reaction as printed in the source (H3O+ kept where the
// source writes H3O+); the tool balances the couple itself and the unit tests
// check that its result matches `table`.
// medium: 'acid' (needs H+), 'base' (needs OH-), 'any' (no H+ or OH- involved).

export const COUPLES = [
  // ---- no H+ or OH- in the half-reaction
  { id: 'F2', ox: 'F2', red: 'F-', E: 2.866, medium: 'any', src: 'openstax-e', table: 'F2 + 2e- -> 2F-' },
  { id: 'S2O8', ox: 'S2O8^2-', red: 'SO4^2-', E: 1.96, medium: 'any', src: 'lt-p1', table: 'S2O8^2- + 2e- -> 2SO4^2-' },
  { id: 'Ce4', ox: 'Ce^4+', red: 'Ce^3+', E: 1.61, medium: 'any', src: 'openstax-e', table: 'Ce^4+ + e- -> Ce^3+' },
  { id: 'Au3', ox: 'Au^3+', red: 'Au', E: 1.498, medium: 'any', src: 'openstax-e', table: 'Au^3+ + 3e- -> Au' },
  { id: 'Cl2', ox: 'Cl2', red: 'Cl-', E: 1.35827, medium: 'any', src: 'openstax-e', table: 'Cl2 + 2e- -> 2Cl-' },
  { id: 'Br2', ox: 'Br2', red: 'Br-', E: 1.0873, medium: 'any', src: 'openstax-e', table: 'Br2 + 2e- -> 2Br-', note: 'aq' },
  { id: 'Hg2', ox: 'Hg^2+', red: 'Hg', E: 0.851, medium: 'any', src: 'openstax-e', table: 'Hg^2+ + 2e- -> Hg' },
  { id: 'Ag', ox: 'Ag+', red: 'Ag', E: 0.7996, medium: 'any', src: 'openstax-e', table: 'Ag+ + e- -> Ag' },
  { id: 'Fe3', ox: 'Fe^3+', red: 'Fe^2+', E: 0.771, medium: 'any', src: 'openstax-e', table: 'Fe^3+ + e- -> Fe^2+' },
  { id: 'I2', ox: 'I2', red: 'I-', E: 0.5355, medium: 'any', src: 'openstax-e', table: 'I2 + 2e- -> 2I-' },
  { id: 'Cu1', ox: 'Cu+', red: 'Cu', E: 0.521, medium: 'any', src: 'openstax-e', table: 'Cu+ + e- -> Cu' },
  { id: 'Cu2', ox: 'Cu^2+', red: 'Cu', E: 0.337, medium: 'any', src: 'openstax-e', table: 'Cu^2+ + 2e- -> Cu' },
  { id: 'Cu21', ox: 'Cu^2+', red: 'Cu+', E: 0.153, medium: 'any', src: 'openstax-e', table: 'Cu^2+ + e- -> Cu+' },
  { id: 'Sn4', ox: 'Sn^4+', red: 'Sn^2+', E: 0.151, medium: 'any', src: 'openstax-e', table: 'Sn^4+ + 2e- -> Sn^2+' },
  { id: 'S4O6', ox: 'S4O6^2-', red: 'S2O3^2-', E: 0.080, medium: 'any', src: 'lt-p1', table: 'S4O6^2- + 2e- -> 2S2O3^2-' },
  { id: 'Pb2', ox: 'Pb^2+', red: 'Pb', E: -0.1262, medium: 'any', src: 'openstax-e', table: 'Pb^2+ + 2e- -> Pb' },
  { id: 'Sn2', ox: 'Sn^2+', red: 'Sn', E: -0.1375, medium: 'any', src: 'openstax-e', table: 'Sn^2+ + 2e- -> Sn' },
  { id: 'Ni2', ox: 'Ni^2+', red: 'Ni', E: -0.257, medium: 'any', src: 'openstax-e', table: 'Ni^2+ + 2e- -> Ni' },
  { id: 'Co2', ox: 'Co^2+', red: 'Co', E: -0.28, medium: 'any', src: 'openstax-e', table: 'Co^2+ + 2e- -> Co' },
  { id: 'Cd2', ox: 'Cd^2+', red: 'Cd', E: -0.4030, medium: 'any', src: 'openstax-e', table: 'Cd^2+ + 2e- -> Cd' },
  { id: 'Cr32', ox: 'Cr^3+', red: 'Cr^2+', E: -0.407, medium: 'any', src: 'openstax-e', table: 'Cr^3+ + e- -> Cr^2+' },
  { id: 'Fe2', ox: 'Fe^2+', red: 'Fe', E: -0.447, medium: 'any', src: 'openstax-e', table: 'Fe^2+ + 2e- -> Fe' },
  { id: 'Cr3', ox: 'Cr^3+', red: 'Cr', E: -0.744, medium: 'any', src: 'openstax-e', table: 'Cr^3+ + 3e- -> Cr' },
  { id: 'Zn2', ox: 'Zn^2+', red: 'Zn', E: -0.7618, medium: 'any', src: 'openstax-e', table: 'Zn^2+ + 2e- -> Zn' },
  { id: 'Mn2', ox: 'Mn^2+', red: 'Mn', E: -1.185, medium: 'any', src: 'openstax-e', table: 'Mn^2+ + 2e- -> Mn' },
  { id: 'Al3', ox: 'Al^3+', red: 'Al', E: -1.662, medium: 'any', src: 'openstax-e', table: 'Al^3+ + 3e- -> Al' },
  { id: 'Mg2', ox: 'Mg^2+', red: 'Mg', E: -2.372, medium: 'any', src: 'openstax-e', table: 'Mg^2+ + 2e- -> Mg' },
  { id: 'Na', ox: 'Na+', red: 'Na', E: -2.71, medium: 'any', src: 'openstax-e', table: 'Na+ + e- -> Na' },
  { id: 'Ca2', ox: 'Ca^2+', red: 'Ca', E: -2.868, medium: 'any', src: 'openstax-e', table: 'Ca^2+ + 2e- -> Ca' },
  { id: 'K', ox: 'K+', red: 'K', E: -2.931, medium: 'any', src: 'openstax-e', table: 'K+ + e- -> K' },
  { id: 'Li', ox: 'Li+', red: 'Li', E: -3.04, medium: 'any', src: 'openstax-e', table: 'Li+ + e- -> Li' },

  // ---- acidic solution
  { id: 'O3', ox: 'O3', red: 'O2', E: 2.07, medium: 'acid', src: 'lt-p1', table: 'O3 + 2H+ + 2e- -> O2 + H2O' },
  { id: 'H2O2', ox: 'H2O2', red: 'H2O', E: 1.776, medium: 'acid', src: 'openstax-e', table: 'H2O2 + 2H3O+ + 2e- -> 4H2O' },
  { id: 'HClO2', ox: 'HClO2', red: 'HClO', E: 1.628, medium: 'acid', src: 'openstax-e', table: 'HClO2 + 2H3O+ + 2e- -> HClO + 3H2O' },
  { id: 'HClOCl2', ox: 'HClO', red: 'Cl2', E: 1.611, medium: 'acid', src: 'openstax-e', table: 'HClO + H3O+ + e- -> ½Cl2 + 2H2O' },
  { id: 'NiO2', ox: 'NiO2', red: 'Ni^2+', E: 1.593, medium: 'acid', src: 'openstax-e', table: 'NiO2 + 4H+ + 2e- -> Ni^2+ + 2H2O' },
  { id: 'MnO4', ox: 'MnO4-', red: 'Mn^2+', E: 1.507, medium: 'acid', src: 'openstax-e', table: 'MnO4- + 8H+ + 5e- -> Mn^2+ + 4H2O' },
  { id: 'HClO', ox: 'HClO', red: 'Cl-', E: 1.482, medium: 'acid', src: 'openstax-e', table: 'HClO + H3O+ + 2e- -> Cl- + 2H2O' },
  { id: 'BrO3', ox: 'BrO3-', red: 'Br-', E: 1.478, medium: 'acid', src: 'lt-p1', table: 'BrO3- + 6H+ + 6e- -> Br- + 3H2O' },
  { id: 'Cr2O7', ox: 'Cr2O7^2-', red: 'Cr^3+', E: 1.232, medium: 'acid', src: 'openstax-e', table: 'Cr2O7^2- + 14H3O+ + 6e- -> 2Cr^3+ + 21H2O', alt: { E: 1.33, src: 'wp-sep' } },
  { id: 'MnO2', ox: 'MnO2', red: 'Mn^2+', E: 1.23, medium: 'acid', src: 'openstax-e', table: 'MnO2 + 4H+ + 2e- -> Mn^2+ + 2H2O' },
  { id: 'O2H2O', ox: 'O2', red: 'H2O', E: 1.229, medium: 'acid', src: 'openstax-e', table: 'O2 + 4H+ + 4e- -> 2H2O' },
  { id: 'ClO3', ox: 'ClO3-', red: 'HClO2', E: 1.21, medium: 'acid', src: 'openstax-e', table: 'ClO3- + 3H3O+ + 2e- -> HClO2 + 4H2O' },
  { id: 'IO3', ox: 'IO3-', red: 'I2', E: 1.195, medium: 'acid', src: 'lt-p1', table: 'IO3- + 6H+ + 5e- -> ½I2 + 3H2O' },
  { id: 'ClO4a', ox: 'ClO4-', red: 'ClO3-', E: 1.189, medium: 'acid', src: 'openstax-e', table: 'ClO4- + 2H3O+ + 2e- -> ClO3- + 3H2O' },
  { id: 'NO3NO', ox: 'NO3-', red: 'NO', E: 0.957, medium: 'acid', src: 'openstax-e', table: 'NO3- + 4H+ + 3e- -> NO + 2H2O' },
  { id: 'NO3HNO2', ox: 'NO3-', red: 'HNO2', E: 0.92, medium: 'acid', src: 'openstax-e', table: 'NO3- + 3H+ + 2e- -> HNO2 + H2O' },
  { id: 'O2H2O2', ox: 'O2', red: 'H2O2', E: 0.695, medium: 'acid', src: 'openstax-e', table: 'O2 + 2H+ + 2e- -> H2O2' },
  { id: 'S', ox: 'S', red: 'H2S', E: 0.142, medium: 'acid', src: 'openstax-e', table: 'S + 2H+ + 2e- -> H2S' },
  { id: 'H', ox: 'H+', red: 'H2', E: 0.00, medium: 'acid', src: 'openstax-e', table: '2H3O+ + 2e- -> H2 + 2H2O' },

  // ---- basic solution
  { id: 'ClO', ox: 'ClO-', red: 'Cl-', E: 0.89, medium: 'base', src: 'openstax-e', table: 'ClO- + H2O + 2e- -> Cl- + 2OH-' },
  { id: 'HO2', ox: 'HO2-', red: 'OH-', E: 0.878, medium: 'base', src: 'openstax-e', table: 'HO2- + H2O + 2e- -> 3OH-' },
  { id: 'ClO2b', ox: 'ClO2-', red: 'ClO-', E: 0.66, medium: 'base', src: 'openstax-e', table: 'ClO2- + H2O + 2e- -> ClO- + 2OH-' },
  { id: 'MnO4b', ox: 'MnO4-', red: 'MnO2', E: 0.558, medium: 'base', src: 'openstax-e', table: 'MnO4- + 2H2O + 3e- -> MnO2 + 4OH-' },
  { id: 'NiO2b', ox: 'NiO2', red: 'Ni(OH)2', E: 0.49, medium: 'base', src: 'openstax-e', table: 'NiO2 + 2H2O + 2e- -> Ni(OH)2 + 2OH-' },
  { id: 'O2b', ox: 'O2', red: 'OH-', E: 0.401, medium: 'base', src: 'openstax-e', table: 'O2 + 2H2O + 4e- -> 4OH-' },
  { id: 'ClO4b', ox: 'ClO4-', red: 'ClO3-', E: 0.36, medium: 'base', src: 'openstax-e', table: 'ClO4- + H2O + 2e- -> ClO3- + 2OH-' },
  { id: 'ClO3b', ox: 'ClO3-', red: 'ClO2-', E: 0.33, medium: 'base', src: 'openstax-e', table: 'ClO3- + H2O + 2e- -> ClO2- + 2OH-' },
  { id: 'CoOH3', ox: 'Co(OH)3', red: 'Co(OH)2', E: 0.17, medium: 'base', src: 'openstax-e', table: 'Co(OH)3 + e- -> Co(OH)2 + OH-' },
  { id: 'NO3b', ox: 'NO3-', red: 'NO2-', E: 0.10, medium: 'base', src: 'openstax-e', table: 'NO3- + H2O + 2e- -> NO2- + 2OH-' },
  { id: 'MnO2b', ox: 'MnO2', red: 'Mn(OH)2', E: -0.05, medium: 'base', src: 'openstax-e', table: 'MnO2 + 2H2O + 2e- -> Mn(OH)2 + 2OH-' },
  { id: 'CrO4b', ox: 'CrO4^2-', red: 'Cr(OH)3', E: -0.13, medium: 'base', src: 'openstax-e', table: 'CrO4^2- + 4H2O + 3e- -> Cr(OH)3 + 5OH-' },
  { id: 'H2Ob', ox: 'H2O', red: 'H2', E: -0.8277, medium: 'base', src: 'openstax-e', table: '2H2O + 2e- -> H2 + 2OH-', viaAcid: 'H+' },
  { id: 'FeOH2', ox: 'Fe(OH)2', red: 'Fe', E: -0.88, medium: 'base', src: 'openstax-e', table: 'Fe(OH)2 + 2e- -> Fe + 2OH-' },
  { id: 'ZnOH2', ox: 'Zn(OH)2', red: 'Zn', E: -1.245, medium: 'base', src: 'openstax-e', table: 'Zn(OH)2 + 2e- -> Zn + 2OH-' },
  { id: 'CrOH3', ox: 'Cr(OH)3', red: 'Cr', E: -1.48, medium: 'base', src: 'openstax-e', table: 'Cr(OH)3 + 3e- -> Cr + 3OH-' },
];

export const byId = new Map(COUPLES.map((c) => [c.id, c]));

/** Couples usable in a medium, strongest oxidant first. */
export function couplesFor(medium) {
  return COUPLES.filter((c) => (medium === 'acid' ? c.medium !== 'base' : c.medium === 'base')).sort((a, b) => b.E - a.E);
}
