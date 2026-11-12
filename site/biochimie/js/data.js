// Data of the Biochemistry tab: the 20 standard amino acids, a few pI
// values, and the carbohydrate table. Names and symbols follow the
// IUPAC–IUBMB recommendations; the side-chain categories follow OpenStax
// Biology 2e, section 3.4.

export const CATEGORIES = ['nonpolar', 'polar', 'acidic', 'basic', 'aromatic'];

/** The 20 amino acids coded by mRNA. `side` is written as a plain formula;
 *  `cond` marks the conditionally essential ones. */
export const AMINO_ACIDS = [
  {
    id: 'gly', en: 'Glycine', fr: 'Glycine', three: 'Gly', one: 'G',
    cat: 'nonpolar', side: 'H', essential: false, cond: true,
    note: {
      en: 'The smallest amino acid: its side chain is a single hydrogen, and it is the only standard one that is not chiral. Its flexibility helps turns and close packing.',
      fr: 'Le plus petit acide aminé : sa chaîne latérale se réduit à un hydrogène, et c’est le seul acide aminé standard non chiral. Sa souplesse aide les coudes et les empilements serrés.',
    },
  },
  {
    id: 'ala', en: 'Alanine', fr: 'Alanine', three: 'Ala', one: 'A',
    cat: 'nonpolar', side: 'CH3', essential: false, pi: 6.0,
    note: {
      en: 'A methyl side chain. Small and hydrophobic, it is a good reference for the behaviour of a neutral amino acid: its pI is close to 6.',
      fr: 'Une chaîne latérale méthyle. Petite et hydrophobe, elle sert de référence pour un acide aminé neutre : son pI vaut environ 6.',
    },
  },
  {
    id: 'val', en: 'Valine', fr: 'Valine', three: 'Val', one: 'V',
    cat: 'nonpolar', side: 'CH(CH3)2', essential: true,
    note: {
      en: 'A branched hydrocarbon side chain. Like leucine and isoleucine, it prefers the inside of a folded protein to water.',
      fr: 'Une chaîne latérale hydrocarbonée ramifiée. Comme la leucine et l’isoleucine, elle préfère l’intérieur d’une protéine repliée à l’eau.',
    },
  },
  {
    id: 'leu', en: 'Leucine', fr: 'Leucine', three: 'Leu', one: 'L',
    cat: 'nonpolar', side: 'CH2CH(CH3)2', essential: true,
    note: {
      en: 'A branched, hydrophobic side chain, one carbon longer than valine. It is common in the hydrophobic core of proteins.',
      fr: 'Une chaîne latérale hydrophobe ramifiée, un carbone plus longue que la valine. Elle est fréquente au cœur hydrophobe des protéines.',
    },
  },
  {
    id: 'ile', en: 'Isoleucine', fr: 'Isoleucine', three: 'Ile', one: 'I',
    cat: 'nonpolar', side: 'CH(CH3)CH2CH3', essential: true,
    note: {
      en: 'A branched side chain with a second chiral centre. Hydrophobic, it packs into protein cores.',
      fr: 'Une chaîne ramifiée avec un second centre chiral. Hydrophobe, elle s’enfouit au cœur des protéines.',
    },
  },
  {
    id: 'met', en: 'Methionine', fr: 'Méthionine', three: 'Met', one: 'M',
    cat: 'nonpolar', side: 'CH2CH2SCH3', essential: true,
    note: {
      en: 'A sulfur-containing side chain. It is the residue coded by the start codon AUG, and it can be oxidised to methionine sulfoxide.',
      fr: 'Une chaîne latérale soufrée. C’est le résidu codé par le codon d’initiation AUG, et il peut être oxydé en méthionine sulfoxyde.',
    },
  },
  {
    id: 'pro', en: 'Proline', fr: 'Proline', three: 'Pro', one: 'P',
    cat: 'nonpolar', side: 'ring (pyrrolidine)', essential: false, cond: true,
    note: {
      en: 'Its side chain closes back onto the amino group, so the backbone is fixed in a kink. Proline often sits at turns and at the start of helices.',
      fr: 'Sa chaîne latérale se referme sur le groupe amino : le squelette y forme un coude rigide. La proline siège souvent aux tournants et au début des hélices.',
    },
  },
  {
    id: 'ser', en: 'Serine', fr: 'Sérine', three: 'Ser', one: 'S',
    cat: 'polar', side: 'CH2OH', essential: false,
    note: {
      en: 'A hydroxymethyl side chain. Its –OH is a common site of phosphorylation, a way of switching a protein on or off.',
      fr: 'Une chaîne hydroxyméthyle. Son –OH est un site fréquent de phosphorylation, un moyen d’activer ou de désactiver une protéine.',
    },
  },
  {
    id: 'thr', en: 'Threonine', fr: 'Thréonine', three: 'Thr', one: 'T',
    cat: 'polar', side: 'CH(OH)CH3', essential: true,
    note: {
      en: 'A hydroxyl side chain with a second chiral centre. Like serine, it can be phosphorylated.',
      fr: 'Une chaîne hydroxylée avec un second centre chiral. Comme la sérine, elle peut être phosphorylée.',
    },
  },
  {
    id: 'cys', en: 'Cysteine', fr: 'Cystéine', three: 'Cys', one: 'C',
    cat: 'polar', side: 'CH2SH', essential: false, cond: true, pi: 5.0,
    note: {
      en: 'A thiol side chain (–SH). Two cysteine residues can join into a disulfide bond (–S–S–), the only covalent bond made while a protein folds.',
      fr: 'Une chaîne latérale thiol (–SH). Deux cystéines peuvent former un pont disulfure (–S–S–), la seule liaison covalente créée pendant le repliement d’une protéine.',
    },
  },
  {
    id: 'asn', en: 'Asparagine', fr: 'Asparagine', three: 'Asn', one: 'N',
    cat: 'polar', side: 'CH2CONH2', essential: false,
    note: {
      en: 'An amide side chain. Asparagine is the residue that carries many N-linked sugar chains on the outside of cells.',
      fr: 'Une chaîne latérale amide. L’asparagine porte de nombreuses chaînes glucidiques N-liées à la surface des cellules.',
    },
  },
  {
    id: 'gln', en: 'Glutamine', fr: 'Glutamine', three: 'Gln', one: 'Q',
    cat: 'polar', side: 'CH2CH2CONH2', essential: false, cond: true,
    note: {
      en: 'An amide side chain, one carbon longer than asparagine. In plants it is a main carrier of newly assimilated nitrogen.',
      fr: 'Une chaîne latérale amide, un carbone plus longue que l’asparagine. Chez les plantes, elle transporte une grande part de l’azote fraîchement assimilé.',
    },
  },
  {
    id: 'lys', en: 'Lysine', fr: 'Lysine', three: 'Lys', one: 'K',
    cat: 'basic', side: 'CH2CH2CH2CH2NH2', essential: true, pi: 9.8,
    note: {
      en: 'A primary amine at the end of a four-carbon chain. It is positively charged at pH 7 and a common site of acetylation and methylation.',
      fr: 'Une amine primaire au bout d’une chaîne de quatre carbones. Elle est chargée positivement à pH 7 et souvent acétylée ou méthylée.',
    },
  },
  {
    id: 'arg', en: 'Arginine', fr: 'Arginine', three: 'Arg', one: 'R',
    cat: 'basic', side: 'CH2CH2CH2NHC(NH)NH2', essential: false, cond: true, pi: 10.8,
    note: {
      en: 'A guanidinium side chain, the most basic of the 20. It is fully protonated at pH 7 and binds phosphate and carboxylate groups.',
      fr: 'Une chaîne guanidinium, la plus basique des vingt. Elle est totalement protonée à pH 7 et fixe les groupes phosphate et carboxylate.',
    },
  },
  {
    id: 'his', en: 'Histidine', fr: 'Histidine', three: 'His', one: 'H',
    cat: 'basic', side: 'CH2–imidazole', essential: true, pi: 7.6,
    note: {
      en: 'An imidazole ring whose pKa is near 6: it can gain or lose a proton close to physiological pH. This is why it is often found in enzyme active sites.',
      fr: 'Un cycle imidazole dont le pKa est proche de 6 : il peut gagner ou perdre un proton près du pH physiologique. C’est pourquoi on le trouve souvent dans les sites actifs des enzymes.',
    },
  },
  {
    id: 'asp', en: 'Aspartic acid', fr: 'Acide aspartique', three: 'Asp', one: 'D',
    cat: 'acidic', side: 'CH2COOH', essential: false, pi: 3.0,
    note: {
      en: 'A carboxyl side chain, negatively charged at pH 7. Its short side chain makes it a common ligand for metal ions in proteins.',
      fr: 'Une chaîne latérale carboxyle, chargée négativement à pH 7. Sa chaîne courte en fait un ligand fréquent des ions métalliques dans les protéines.',
    },
  },
  {
    id: 'glu', en: 'Glutamic acid', fr: 'Acide glutamique', three: 'Glu', one: 'E',
    cat: 'acidic', side: 'CH2CH2COOH', essential: false, pi: 3.2,
    note: {
      en: 'A carboxyl side chain, one carbon longer than aspartate. In plants, glutamate is the entry point of assimilated nitrogen into amino acids.',
      fr: 'Une chaîne carboxyle, un carbone plus longue que l’aspartate. Chez les plantes, le glutamate est la porte d’entrée de l’azote assimilé dans les acides aminés.',
    },
  },
  {
    id: 'phe', en: 'Phenylalanine', fr: 'Phénylalanine', three: 'Phe', one: 'F',
    cat: 'aromatic', side: 'CH2–phenyl', essential: true,
    note: {
      en: 'A benzyl side chain: hydrophobic and aromatic. In plants it is the precursor of lignin and of many phenylpropanoids.',
      fr: 'Une chaîne benzyle : hydrophobe et aromatique. Chez les plantes, elle est le précurseur de la lignine et de nombreux phénylpropanoïdes.',
    },
  },
  {
    id: 'tyr', en: 'Tyrosine', fr: 'Tyrosine', three: 'Tyr', one: 'Y',
    cat: 'aromatic', side: 'CH2–C6H4–OH', essential: false, cond: true, pi: 5.7,
    note: {
      en: 'A phenol side chain. It can be phosphorylated, and it is the starting point of many plant phenolics, including some pigments and defence compounds.',
      fr: 'Une chaîne phénol. Elle peut être phosphorylée et sert de point de départ à de nombreux composés phénoliques végétaux, dont certains pigments et composés de défense.',
    },
  },
  {
    id: 'trp', en: 'Tryptophan', fr: 'Tryptophane', three: 'Trp', one: 'W',
    cat: 'aromatic', side: 'CH2–indole', essential: true,
    note: {
      en: 'The largest side chain, an indole ring. In plants it is the precursor of auxin (indole-3-acetic acid), a major growth hormone.',
      fr: 'La plus grande chaîne latérale, un cycle indole. Chez les plantes, elle est le précurseur de l’auxine (acide indole-3-acétique), une hormone de croissance majeure.',
    },
  },
];

/** pI values from the LibreTexts table, for the amino acids with an
 *  ionisable side chain, plus alanine as a neutral reference. */
export const PI_TABLE = ['asp', 'glu', 'cys', 'tyr', 'ala', 'his', 'lys', 'arg']
  .map((id) => AMINO_ACIDS.find((a) => a.id === id))
  .sort((a, b) => a.pi - b.pi);

/** The carbohydrate families used in the table. `bond` is null for a
 *  monosaccharide. */
export const CARBS = [
  {
    id: 'glucose', en: 'Glucose', fr: 'Glucose',
    kind: { en: 'Monosaccharide, aldohexose', fr: 'Monosaccharide, aldohexose' },
    units: { en: 'C6H12O6', fr: 'C6H12O6' }, bond: null,
    note: {
      en: 'The six-carbon sugar used for energy and polymerised into starch and cellulose.',
      fr: 'Le sucre à six carbones utilisé pour l’énergie et polymérisé en amidon et cellulose.',
    },
  },
  {
    id: 'fructose', en: 'Fructose', fr: 'Fructose',
    kind: { en: 'Monosaccharide, ketohexose', fr: 'Monosaccharide, cétohexose' },
    units: { en: 'C6H12O6', fr: 'C6H12O6' }, bond: null,
    note: {
      en: 'The fruit sugar; its five-membered furanose form is the fructose half of sucrose.',
      fr: 'Le sucre des fruits ; sa forme furanose à cinq chaînons est la moitié fructose du saccharose.',
    },
  },
  {
    id: 'ribose', en: 'Ribose', fr: 'Ribose',
    kind: { en: 'Monosaccharide, aldopentose', fr: 'Monosaccharide, aldopentose' },
    units: { en: 'C5H10O5', fr: 'C5H10O5' }, bond: null,
    note: {
      en: 'A five-carbon sugar, a component of RNA and of ATP.',
      fr: 'Un sucre à cinq carbones, composant de l’ARN et de l’ATP.',
    },
  },
  {
    id: 'sucrose', en: 'Sucrose', fr: 'Saccharose',
    kind: { en: 'Disaccharide', fr: 'Disaccharide' },
    units: { en: 'glucose + fructose', fr: 'glucose + fructose' },
    bond: { en: 'α-1,2 (glucose C1 → fructose C2)', fr: 'α-1,2 (glucose C1 → fructose C2)' },
    note: {
      en: 'The sugar transported in the phloem. Both anomeric carbons are engaged, so it is non-reducing.',
      fr: 'Le sucre transporté dans le phloème. Les deux carbones anomères sont engagés : il n’est pas réducteur.',
    },
  },
  {
    id: 'maltose', en: 'Maltose', fr: 'Maltose',
    kind: { en: 'Disaccharide', fr: 'Disaccharide' },
    units: { en: 'glucose + glucose', fr: 'glucose + glucose' },
    bond: { en: 'α-1,4', fr: 'α-1,4' },
    note: {
      en: 'Two glucose units; it is released when starch is broken down.',
      fr: 'Deux unités de glucose ; il est libéré lors de la dégradation de l’amidon.',
    },
  },
  {
    id: 'lactose', en: 'Lactose', fr: 'Lactose',
    kind: { en: 'Disaccharide', fr: 'Disaccharide' },
    units: { en: 'galactose + glucose', fr: 'galactose + glucose' },
    bond: { en: 'β-1,4', fr: 'β-1,4' },
    note: {
      en: 'Milk sugar.',
      fr: 'Le sucre du lait.',
    },
  },
  {
    id: 'starch', en: 'Starch', fr: 'Amidon',
    kind: { en: 'Polysaccharide', fr: 'Polysaccharide' },
    units: { en: 'glucose', fr: 'glucose' },
    bond: { en: 'α-1,4, with α-1,6 branches', fr: 'α-1,4, avec des ramifications α-1,6' },
    note: {
      en: 'Plant storage: amylose is unbranched, amylopectin is branched.',
      fr: 'Réserve végétale : l’amylose est linéaire, l’amylopectine est ramifiée.',
    },
  },
  {
    id: 'glycogen', en: 'Glycogen', fr: 'Glycogène',
    kind: { en: 'Polysaccharide', fr: 'Polysaccharide' },
    units: { en: 'glucose', fr: 'glucose' },
    bond: { en: 'α-1,4, with more α-1,6 branches', fr: 'α-1,4, avec davantage de ramifications α-1,6' },
    note: {
      en: 'Animal storage, mainly in liver and muscle.',
      fr: 'Réserve animale, surtout dans le foie et les muscles.',
    },
  },
  {
    id: 'cellulose', en: 'Cellulose', fr: 'Cellulose',
    kind: { en: 'Polysaccharide', fr: 'Polysaccharide' },
    units: { en: 'glucose', fr: 'glucose' },
    bond: { en: 'β-1,4', fr: 'β-1,4' },
    note: {
      en: 'Plant cell walls: straight chains pack into microfibrils. Humans cannot digest the β linkage.',
      fr: 'Parois végétales : les chaînes droites s’assemblent en microfibrilles. L’humain ne digère pas la liaison β.',
    },
  },
];
