// Sources of the Nomenclature tab, in page order.
// The rules follow the IUPAC Red Book and its free Brief Guide; the worked
// examples and the school-level rules are cross-checked against OpenStax.
export const SOURCES = [
  {
    id: 'iupac-brief',
    text: 'R. M. Hartshorn, K.-H. Hellwich, A. Yerin, T. Damhus, A. T. Hutton, “Brief Guide to the Nomenclature of Inorganic Chemistry”, Pure Appl. Chem. 87 (2015) 1039–1049, doi:10.1515/pac-2014-0718. Compositional names, element sequence, multiplicative prefixes (mono … icosa; bis, tris … for nested names), oxidation state in Roman numerals, charge number in Arabic numerals, hydrates, retained names (hydrogen carbonate, not bicarbonate), additive names such as dihydroxidodioxidosulfur for H2SO4.',
    url: 'https://iupac.qmul.ac.uk/BriefGuide/inorganic.html',
  },
  {
    id: 'iupac-redbook',
    text: 'IUPAC, Nomenclature of Inorganic Chemistry — IUPAC Recommendations 2005 (the “Red Book”), RSC Publishing, 2005, ISBN 0 85404 438 8. The definitive rules behind the Brief Guide (oxidation states, formulae, compositional and additive nomenclature).',
    url: 'https://iupac.org/what-we-do/books/redbook/',
  },
  {
    id: 'openstax-nomenclature',
    text: 'OpenStax, Chemistry 2e, section 2.7 “Chemical Nomenclature”: ionic compounds (cation then anion, monatomic anion in -ide), Stock notation with Roman numerals, Greek prefixes and the omission of mono- for the first element, the -ate/-ite to -ic/-ous rule for oxoacids, hydro-…-ic acids, and hydrates.',
    url: 'https://openstax.org/books/chemistry-2e/pages/2-7-chemical-nomenclature',
  },
  {
    id: 'openstax-ionic',
    text: 'OpenStax, Chemistry 2e, section 2.6 “Molecular and Ionic Compounds”: how a formula is built from ions so that the compound is neutral, and the charges of the common monatomic ions.',
    url: 'https://openstax.org/books/chemistry-2e/pages/2-6-molecular-and-ionic-compounds',
  },
  {
    id: 'openstax-ox',
    text: 'OpenStax, Chemistry 2e, section 4.2 “Classifying Chemical Reactions”: the rules for assigning oxidation numbers (free element 0; monatomic ion = its charge; oxygen usually −2; hydrogen +1 with non-metals; the sum equals the charge).',
    url: 'https://openstax.org/books/chemistry-2e/pages/4-2-classifying-chemical-reactions',
  },
  {
    id: 'iupac-os',
    text: 'P. Karen, P. McArdle, J. Takats, “Comprehensive definition of oxidation state (IUPAC Recommendations 2016)”, Pure Appl. Chem. 88 (2016) 831–839, doi:10.1515/pac-2015-1204. The ionic approximation used in the worked oxidation-state diagrams.',
    url: 'https://iupac.org/cms/wp-content/uploads/2016/02/Comprehensive-definition-of-oxidation-state.pdf',
  },
  {
    id: 'iupac-organic',
    text: 'IUPAC, “Brief Guide to the Nomenclature of Organic Chemistry” (2017): the suffix -oic acid for carboxylic acids and the status of retained names; used only for acetic / ethanoic acid.',
    url: 'https://iupac.qmul.ac.uk/BriefGuide/organic.html',
  },
  {
    id: 'pubchem',
    text: 'PubChem (NCBI): compound records used to check formulae, charges and the common names given as alternatives (water, ammonia, methane, gypsum). Consulted 12 November 2026.',
    url: 'https://pubchem.ncbi.nlm.nih.gov/',
  },
];
