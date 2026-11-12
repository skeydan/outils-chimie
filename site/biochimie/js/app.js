// Biochemistry tab (mounted by assets/app.js): the 20 amino acids, charge and
// pI, peptides and the four levels of protein structure, carbohydrates, and
// the same molecules at work in a plant. Bilingual FR/EN, no hash state.
import { lang } from '../../assets/site.js';
import { h, citer, fixed } from '../../assets/ui.js';
import { SOURCES } from './sources.js';
import { AMINO_ACIDS, CATEGORIES, PI_TABLE, CARBS } from './data.js';

const t = (k, vars = {}) => {
  let s = T[k]?.[lang()] ?? T[k]?.en ?? k;
  for (const [a, b] of Object.entries(vars)) s = s.split(`{${a}}`).join(String(b));
  return s;
};
const L = (o) => (o ? o[lang()] ?? o.en : '');

const SRC_IDS = ['openstax-proteins', 'openstax-carbs', 'openstax-phloem', 'openstax-nitrogen',
  'iupac-aa', 'libretexts-pi', 'who-aa', 'ali-nitrate', 'shewry-seed', 'shewry-cereal', 'dudareva-aaa'];
const { cite, list: sourceList } = citer(SRC_IDS.map((id) => ({ id, ...SOURCES.find((s) => s.id === id) })));

// ---------------------------------------------------------------- text
const T = {
  title: { en: 'Biochemistry: the molecules of life', fr: 'Biochimie : les molécules du vivant' },
  lead: {
    en: 'Life uses a small alphabet of molecules: twenty amino acids spell proteins, and a few sugars spell starch, cellulose and sucrose. This tab connects the formulae to what they do — how a peptide bond is made, why a protein folds, why α- and β-glucose give different materials, and how a plant moves sucrose and nitrogen from leaf to seed.',
    fr: 'La vie dispose d’un petit alphabet de molécules : vingt acides aminés écrivent les protéines, et quelques sucres écrivent l’amidon, la cellulose et le saccharose. Cet onglet relie les formules à leur rôle — comment se forme une liaison peptidique, pourquoi une protéine se replie, pourquoi le glucose α et le glucose β donnent des matériaux différents, et comment une plante transporte saccharose et azote de la feuille à la graine.',
  },
  toc: { en: 'On this page', fr: 'Sur cette page' },
  'toc.amino': { en: 'Amino acids', fr: 'Acides aminés' },
  'toc.charge': { en: 'Charge and pI', fr: 'Charge et pI' },
  'toc.peptides': { en: 'Peptides and proteins', fr: 'Peptides et protéines' },
  'toc.carbs': { en: 'Carbohydrates', fr: 'Glucides' },
  'toc.plant': { en: 'In the plant', fr: 'Dans la plante' },
  sources: { en: 'Sources', fr: 'Sources' },

  // amino acids
  'aa.title': { en: 'Twenty amino acids, one backbone', fr: 'Vingt acides aminés, un même squelette' },
  'aa.lead1': {
    en: 'Every standard amino acid has the same core: a central α-carbon bonded to an amino group, a carboxyl group, a hydrogen and a side chain R. At pH 7 the amino group is protonated (NH₃⁺) and the carboxyl group deprotonated (COO⁻), so the molecule is a zwitterion — neutral overall, with two opposite charges.',
    fr: 'Chaque acide aminé standard possède le même cœur : un carbone α central lié à un groupe amino, un groupe carboxyle, un hydrogène et une chaîne latérale R. À pH 7, le groupe amino est protoné (NH₃⁺) et le carboxyle déprotoné (COO⁻) : la molécule est un zwitterion, neutre au total, avec deux charges opposées.',
  },
  'aa.lead2': {
    en: 'The side chain is the only part that changes, and its chemistry decides the character of the residue: nonpolar, polar, acidic, basic or aromatic. The table below lists all twenty, with the IUPAC–IUBMB three-letter and one-letter codes used to write sequences.',
    fr: 'La chaîne latérale est la seule partie qui change, et sa chimie décide du caractère du résidu : apolaire, polaire, acide, basique ou aromatique. Le tableau ci-dessous réunit les vingt, avec les codes à trois et à une lettre de l’IUPAC–IUBMB utilisés pour écrire les séquences.',
  },
  'aa.lead3': {
    en: 'For humans, nine amino acids cannot be made in sufficient amounts and must come from the diet: histidine, isoleucine, leucine, lysine, methionine, phenylalanine, threonine, tryptophan and valine. Cysteine and tyrosine are spared by methionine and phenylalanine; arginine, glutamine, glycine and proline become conditionally essential in some states. Essentiality is a property of the diet, not of the molecule: a plant builds its amino acids from inorganic nitrogen, so none is essential to it.',
    fr: 'Chez l’humain, neuf acides aminés ne peuvent pas être fabriqués en quantité suffisante et doivent venir de l’alimentation : histidine, isoleucine, leucine, lysine, méthionine, phénylalanine, thréonine, tryptophane et valine. La cystéine et la tyrosine sont épargnées par la méthionine et la phénylalanine ; l’arginine, la glutamine, la glycine et la proline deviennent conditionnellement essentielles dans certains états. L’essentialité est une propriété du régime, pas de la molécule : une plante fabrique ses acides aminés à partir d’azote inorganique, aucun ne lui est indispensable.',
  },
  'aa.filter': { en: 'Filter by side chain', fr: 'Filtrer par chaîne latérale' },
  'aa.all': { en: 'All', fr: 'Tous' },
  cat_nonpolar: { en: 'Nonpolar', fr: 'Apolaire' },
  cat_polar: { en: 'Polar', fr: 'Polaire' },
  cat_acidic: { en: 'Acidic', fr: 'Acide' },
  cat_basic: { en: 'Basic', fr: 'Basique' },
  cat_aromatic: { en: 'Aromatic', fr: 'Aromatique' },
  'aa.essentialOnly': { en: 'Essential in humans only', fr: 'Indispensables chez l’humain seulement' },
  'aa.name': { en: 'Amino acid', fr: 'Acide aminé' },
  'aa.codes': { en: 'Codes', fr: 'Codes' },
  'aa.side': { en: 'Side chain R', fr: 'Chaîne latérale R' },
  'aa.category': { en: 'Category', fr: 'Catégorie' },
  'aa.human': { en: 'In humans', fr: 'Chez l’humain' },
  'aa.yes': { en: 'essential', fr: 'indispensable' },
  'aa.no': { en: 'non-essential', fr: 'non indispensable' },
  'aa.cond': { en: 'conditional', fr: 'conditionnel' },
  'aa.tableCaption': {
    en: 'The twenty standard amino acids coded by mRNA, with their IUPAC–IUBMB symbols, side chains and side-chain categories.',
    fr: 'Les vingt acides aminés standard codés par l’ARNm, avec leurs symboles IUPAC–IUBMB, leurs chaînes latérales et leurs catégories.',
  },
  'aa.tableNote': {
    en: '“Conditional” means the amino acid can become essential when its precursor or the demand changes. pI values for the ionisable side chains are given in the next section.',
    fr: '« Conditionnel » signifie que l’acide aminé peut devenir indispensable quand son précurseur ou les besoins changent. Les valeurs de pI des chaînes ionisables sont données dans la section suivante.',
  },
  'aa.detailTitle': { en: 'Selected amino acid', fr: 'Acide aminé sélectionné' },
  'aa.figAlt': {
    en: 'Schematic structure of {name}: a central α-carbon carrying an amino group, a carboxyl group, a hydrogen and the side chain R.',
    fr: 'Structure schématique de {name} : un carbone α central portant un groupe amino, un groupe carboxyle, un hydrogène et la chaîne latérale R.',
  },
  'aa.sideChain': { en: 'Side chain', fr: 'Chaîne latérale' },
  'aa.pi': { en: 'Isoelectric point', fr: 'Point isoélectrique' },
  'aa.none': { en: 'No amino acid matches this filter.', fr: 'Aucun acide aminé ne correspond à ce filtre.' },

  // charge and pI
  'pi.title': { en: 'Charge, zwitterion and isoelectric point', fr: 'Charge, zwitterion et point isoélectrique' },
  'pi.lead': {
    en: 'The isoelectric point pI is the pH at which the average net charge of the molecule is zero: the positive and negative groups balance exactly. Below pI the amino acid is mainly a cation; above pI it is mainly an anion. In an electric field it therefore moves towards the electrode of opposite charge, except at pI, where it does not migrate — the basis of isoelectric focusing.',
    fr: 'Le point isoélectrique pI est le pH auquel la charge nette moyenne de la molécule est nulle : les groupes positifs et négatifs s’équilibrent exactement. Sous le pI, l’acide aminé est surtout un cation ; au-dessus, surtout un anion. Dans un champ électrique, il migre donc vers l’électrode de charge opposée, sauf au pI où il ne migre pas — c’est la base de la focalisation isoélectrique.',
  },
  'pi.low': { en: 'Below pI: cation (+)', fr: 'Sous le pI : cation (+)' },
  'pi.mid': { en: 'At pI: zwitterion, net charge 0', fr: 'Au pI : zwitterion, charge nette 0' },
  'pi.high': { en: 'Above pI: anion (−)', fr: 'Au-dessus du pI : anion (−)' },
  'pi.formula': {
    en: 'For a neutral side chain, pI is the average of the two pKa values of the α-carboxyl and α-amino groups. For an acidic side chain, average the two lowest pKa values; for a basic one, the two highest. An acidic side chain therefore lowers pI, and a basic one raises it.',
    fr: 'Pour une chaîne latérale neutre, le pI est la moyenne des deux pKa des groupes α-carboxyle et α-amino. Pour une chaîne acide, on moyenne les deux pKa les plus bas ; pour une chaîne basique, les deux plus hauts. Une chaîne acide abaisse donc le pI, une chaîne basique l’élève.',
  },
  'pi.tableCaption': { en: 'pI of some amino acids', fr: 'pI de quelques acides aminés' },
  'pi.amino': { en: 'Amino acid', fr: 'Acide aminé' },
  'pi.value': { en: 'pI', fr: 'pI' },
  'pi.note': {
    en: 'Values from the LibreTexts table. pI depends on temperature and ionic strength, so tables differ slightly.',
    fr: 'Valeurs du tableau LibreTexts. Le pI dépend de la température et de la force ionique : les tables diffèrent légèrement.',
  },

  // peptides
  'pep.title': { en: 'From amino acids to proteins', fr: 'Des acides aminés aux protéines' },
  'pep.lead': {
    en: 'A peptide bond is an amide bond made by condensation: the carboxyl group of one amino acid loses OH, the amino group of the next loses H, and a water molecule leaves. The chain keeps a free amino end (N-terminus) and a free carboxyl end (C-terminus); sequences are written N → C. A linear chain of n residues has n − 1 peptide bonds.',
    fr: 'Une liaison peptidique est une liaison amide formée par condensation : le groupe carboxyle d’un acide aminé perd OH, le groupe amino du suivant perd H, et une molécule d’eau part. La chaîne garde une extrémité amino libre (N-terminale) et une extrémité carboxyle libre (C-terminale) ; les séquences s’écrivent N → C. Une chaîne linéaire de n résidus possède n − 1 liaisons peptidiques.',
  },
  'pep.bondNote': {
    en: 'The peptide bond is the –CO–NH– group. The N-terminus is the end with the free amino group; the C-terminus is the end with the free carboxyl group.',
    fr: 'La liaison peptidique est le groupe –CO–NH–. Le N-terminal est l’extrémité qui porte le groupe amino libre ; le C-terminal, celle qui porte le carboxyle libre.',
  },
  'pep.build.title': { en: 'Build a peptide', fr: 'Construire un peptide' },
  'pep.build.hint': {
    en: 'Add amino acids one by one, then read the chain from the N-terminus to the C-terminus. The counter applies the n − 1 rule.',
    fr: 'Ajoutez les acides aminés un à un, puis lisez la chaîne du N-terminal au C-terminal. Le compteur applique la règle n − 1.',
  },
  'pep.build.pick': { en: 'Amino acid', fr: 'Acide aminé' },
  'pep.build.add': { en: 'Add', fr: 'Ajouter' },
  'pep.build.remove': { en: 'Remove last', fr: 'Retirer le dernier' },
  'pep.build.clear': { en: 'Clear', fr: 'Vider' },
  'pep.build.empty': { en: 'The chain is empty. Add an amino acid to begin.', fr: 'La chaîne est vide. Ajoutez un acide aminé pour commencer.' },
  'pep.build.residues': { en: 'Residues: {n}', fr: 'Résidus : {n}' },
  'pep.build.bonds': { en: 'Peptide bonds: {n}', fr: 'Liaisons peptidiques : {n}' },
  'pep.build.water': { en: 'Water molecules lost: {n}', fr: 'Molécules d’eau perdues : {n}' },
  'pep.build.sequence': { en: 'Sequence', fr: 'Séquence' },
  'pep.build.one': { en: 'One-letter code:', fr: 'Code à une lettre :' },
  'pep.ex.title': { en: 'Worked examples', fr: 'Exemples corrigés' },
  'pep.ex1.title': { en: 'A tripeptide: Ala–Gly–Ser', fr: 'Un tripeptide : Ala–Gly–Ser' },
  'pep.ex1.p': {
    en: 'Alanine + glycine + serine → Ala–Gly–Ser + 2 H₂O. Three residues make two peptide bonds and release two water molecules. The sequence starts at the N-terminus (Ala) and ends at the C-terminus (Ser); its one-letter code is AGS.',
    fr: 'Alanine + glycine + sérine → Ala–Gly–Ser + 2 H₂O. Trois résidus forment deux liaisons peptidiques et libèrent deux molécules d’eau. La séquence commence au N-terminal (Ala) et finit au C-terminal (Ser) ; son code à une lettre est AGS.',
  },
  'pep.ex2.title': { en: 'Reading a sequence: Met–Gly–Ser–Lys', fr: 'Lire une séquence : Met–Gly–Ser–Lys' },
  'pep.ex2.p': {
    en: 'Four residues, three peptide bonds, three water molecules. The one-letter code is MGSK. Methionine is the N-terminus and lysine the C-terminus. A protein is written in this order because it is synthesised from the N-terminus to the C-terminus.',
    fr: 'Quatre résidus, trois liaisons peptidiques, trois molécules d’eau. Le code à une lettre est MGSK. La méthionine est le N-terminal et la lysine le C-terminal. Une protéine s’écrit dans cet ordre parce qu’elle est synthétisée du N-terminal vers le C-terminal.',
  },
  'pep.ex3.title': { en: 'Insulin and haemoglobin: more than one chain', fr: 'Insuline et hémoglobine : plus d’une chaîne' },
  'pep.ex3.p': {
    en: 'Insulin is made of two polypeptide chains, A and B, held together by disulfide bonds. Haemoglobin has four subunits, two α and two β, about 600 amino acids in total. Two or more folded chains assembled together give quaternary structure.',
    fr: 'L’insuline est faite de deux chaînes polypeptidiques, A et B, reliées par des ponts disulfure. L’hémoglobine possède quatre sous-unités, deux α et deux β, soit environ 600 acides aminés au total. Deux chaînes repliées ou plus, assemblées, donnent la structure quaternaire.',
  },
  'pep.levels.title': { en: 'The four levels of protein structure', fr: 'Les quatre niveaux de structure d’une protéine' },
  'pep.levels.primary.t': { en: 'Primary: the sequence', fr: 'Primaire : la séquence' },
  'pep.levels.primary.p': {
    en: 'The order of residues from the N-terminus to the C-terminus, encoded by the gene. A single change can matter: in sickle-cell haemoglobin, glutamate at position 6 of the β chain is replaced by valine.',
    fr: 'L’ordre des résidus du N-terminal au C-terminal, codé par le gène. Un seul changement peut compter : dans l’hémoglobine drépanocytaire, le glutamate en position 6 de la chaîne β est remplacé par une valine.',
  },
  'pep.levels.secondary.t': { en: 'Secondary: local folding', fr: 'Secondaire : le repliement local' },
  'pep.levels.secondary.p': {
    en: 'The α-helix turns with 3.6 residues per turn; the β-sheet aligns strands side by side, parallel or antiparallel. Both are held by hydrogen bonds between the carbonyl oxygen and the amino hydrogen of the backbone.',
    fr: 'L’hélice α tourne avec 3,6 résidus par tour ; le feuillet β aligne des brins côte à côte, parallèles ou antiparallèles. Les deux sont tenus par des liaisons hydrogène entre l’oxygène carbonyle et l’hydrogène amino du squelette.',
  },
  'pep.levels.tertiary.t': { en: 'Tertiary: the whole shape', fr: 'Tertiaire : la forme d’ensemble' },
  'pep.levels.tertiary.p': {
    en: 'The three-dimensional shape of one chain, stabilised by hydrophobic interactions, ionic bonds, hydrogen bonds and disulfide bonds. The disulfide bond is the only covalent bond formed during folding.',
    fr: 'La forme tridimensionnelle d’une chaîne, stabilisée par des interactions hydrophobes, des liaisons ioniques, des liaisons hydrogène et des ponts disulfure. Le pont disulfure est la seule liaison covalente formée pendant le repliement.',
  },
  'pep.levels.quaternary.t': { en: 'Quaternary: several chains', fr: 'Quaternaire : plusieurs chaînes' },
  'pep.levels.quaternary.p': {
    en: 'Several folded polypeptides, or subunits, assemble into one functional protein. Haemoglobin, with two α and two β subunits, is the textbook example.',
    fr: 'Plusieurs polypeptides repliés, ou sous-unités, s’assemblent en une protéine fonctionnelle. L’hémoglobine, avec deux sous-unités α et deux β, en est l’exemple classique.',
  },

  // carbohydrates
  'carb.title': { en: 'Carbohydrates: from one sugar to a material', fr: 'Glucides : d’un sucre à un matériau' },
  'carb.lead': {
    en: 'Carbohydrates have the empirical formula (CH₂O)n. A monosaccharide is a single sugar with three to seven carbons: glucose is an aldohexose, fructose a ketohexose, ribose an aldopentose. In solution the open chain closes into a ring — a six-membered pyranose for glucose, a five-membered furanose for fructose and ribose. Closing creates a new stereocentre at the anomeric carbon and therefore two anomers, α and β.',
    fr: 'Les glucides ont pour formule empirique (CH₂O)n. Un monosaccharide est un sucre unique de trois à sept carbones : le glucose est un aldohexose, le fructose un cétohexose, le ribose un aldopentose. En solution, la chaîne ouverte se referme en cycle — pyranose à six chaînons pour le glucose, furanose à cinq chaînons pour le fructose et le ribose. La fermeture crée un nouveau stéréocentre au carbone anomère, donc deux anomères, α et β.',
  },
  'carb.ringTitle': { en: 'The ring form of glucose', fr: 'La forme cyclique du glucose' },
  'carb.alpha': { en: 'α-D-glucose', fr: 'α-D-glucose' },
  'carb.beta': { en: 'β-D-glucose', fr: 'β-D-glucose' },
  'carb.alphaDesc': { en: 'the C1 hydroxyl is below the ring.', fr: 'l’hydroxyle du C1 est sous le cycle.' },
  'carb.betaDesc': { en: 'the C1 hydroxyl is above the ring.', fr: 'l’hydroxyle du C1 est au-dessus du cycle.' },
  'carb.alphaWhere': { en: 'below the ring', fr: 'sous le cycle' },
  'carb.betaWhere': { en: 'above the ring', fr: 'au-dessus du cycle' },
  'carb.haworthAlt': {
    en: 'Haworth projection of {anomer}: a six-membered pyranose ring with the C1 hydroxyl {where}.',
    fr: 'Projection de Haworth du {anomer} : cycle pyranose à six chaînons, l’hydroxyle du C1 {where}.',
  },
  'carb.ringNote': {
    en: 'Only the C1 hydroxyl changes position between the two drawings; the hydrogens on the ring are omitted for clarity. The two anomers interconvert through the open-chain form.',
    fr: 'Seul l’hydroxyle du C1 change de position entre les deux dessins ; les hydrogènes du cycle sont omis pour la clarté. Les deux anomères s’interconvertissent par la forme à chaîne ouverte.',
  },
  'carb.tableCaption': { en: 'The main carbohydrates, their units and their linkages', fr: 'Les principaux glucides, leurs unités et leurs liaisons' },
  'carb.name': { en: 'Sugar', fr: 'Sucre' },
  'carb.kind': { en: 'Family', fr: 'Famille' },
  'carb.units': { en: 'Units', fr: 'Unités' },
  'carb.bond': { en: 'Linkage', fr: 'Liaison' },
  'carb.note': { en: 'Where it is found', fr: 'Où le trouve-t-on' },
  'carb.bondsTitle': { en: 'The linkage decides the shape', fr: 'La liaison décide de la forme' },
  'carb.bondsLead': {
    en: 'Starch and cellulose are both polymers of glucose; only the geometry of the glycosidic bond differs. In starch the α-1,4 bond keeps every glucose on the same face, so the chain curls; amylopectin adds α-1,6 branches. In cellulose the β-1,4 bond flips every other glucose, so the chain stays straight and packs into microfibrils.',
    fr: 'L’amidon et la cellulose sont tous deux des polymères de glucose ; seule la géométrie de la liaison glycosidique diffère. Dans l’amidon, la liaison α-1,4 garde tous les glucoses sur la même face : la chaîne s’enroule ; l’amylopectine ajoute des ramifications α-1,6. Dans la cellulose, la liaison β-1,4 retourne un glucose sur deux : la chaîne reste droite et s’assemble en microfibrilles.',
  },
  'carb.starch': { en: 'Starch: α-1,4', fr: 'Amidon : α-1,4' },
  'carb.cellulose': { en: 'Cellulose: β-1,4', fr: 'Cellulose : β-1,4' },
  'carb.starchNote': { en: 'Chains curl; amylopectin adds α-1,6 branches.', fr: 'Les chaînes s’enroulent ; l’amylopectine ajoute des ramifications α-1,6.' },
  'carb.celluloseNote': { en: 'Straight ribbon; the microfibrils build the cell wall.', fr: 'Ruban droit ; les microfibrilles construisent la paroi.', },
  'carb.glycanAlt': {
    en: 'Schematic chain of glucose rings linked by {bond} bonds.',
    fr: 'Chaîne schématique de cycles de glucose reliés par des liaisons {bond}.',
  },

  // in the plant
  'plant.title': { en: 'In the plant', fr: 'Dans la plante' },
  'plant.lead': {
    en: 'The same molecules do different jobs in a plant: cellulose holds the cell up, starch stores energy, sucrose carries carbon through the phloem, and amino acids carry nitrogen into proteins and hormones.',
    fr: 'Les mêmes molécules jouent des rôles différents dans une plante : la cellulose soutient la cellule, l’amidon stocke l’énergie, le saccharose transporte le carbone dans le phloème, et les acides aminés portent l’azote vers les protéines et les hormones.',
  },
  'plant.cellulose.t': { en: 'One sugar, two materials', fr: 'Un sucre, deux matériaux' },
  'plant.cellulose.p': {
    en: 'Plants store glucose as starch and build their walls from cellulose. The two polymers differ only in the linkage: α-1,4 in starch, β-1,4 in cellulose. The β linkage makes the chain straight and lets it pack into microfibrils; the α chain curls. Humans can digest starch but not cellulose, because they lack an enzyme that cuts the β bond.',
    fr: 'Les plantes stockent le glucose sous forme d’amidon et construisent leurs parois avec de la cellulose. Les deux polymères ne diffèrent que par la liaison : α-1,4 dans l’amidon, β-1,4 dans la cellulose. La liaison β rend la chaîne droite et permet son assemblage en microfibrilles ; la chaîne α s’enroule. L’humain digère l’amidon mais pas la cellulose, faute d’enzyme coupant la liaison β.',
  },
  'plant.sucrose.t': { en: 'Sucrose on the move', fr: 'Le saccharose en mouvement' },
  'plant.sucrose.p': {
    en: 'A leaf is a source, a root or a developing seed a sink. Sucrose is loaded into the sieve tubes by a sucrose–H+ symporter, water follows by osmosis, and the resulting pressure pushes the sap towards the sink. Phloem sap can reach 30 % sugar. Sucrose is non-reducing, so it can travel at high concentration without reacting with the proteins around it.',
    fr: 'Une feuille est une source, une racine ou une graine en formation un puits. Le saccharose est chargé dans les tubes criblés par un symport saccharose–H+, l’eau suit par osmose, et la pression obtenue pousse la sève vers le puits. La sève phloémienne peut atteindre 30 % de sucre. Le saccharose n’est pas réducteur : il peut voyager à forte concentration sans réagir avec les protéines voisines.',
  },
  'plant.nitrogen.t': { en: 'Nitrogen becomes amino acids', fr: 'L’azote devient acides aminés' },
  'plant.nitrogen.p': {
    en: 'Roots take up nitrate and reduce it to nitrite (nitrate reductase), then to ammonium (nitrite reductase). Ammonium enters the GS–GOGAT cycle, which makes glutamine and glutamate, the donors of nitrogen to most other amino acids. Legumes add ammonia fixed from N₂ by rhizobia in root nodules.',
    fr: 'Les racines absorbent le nitrate et le réduisent en nitrite (nitrate réductase), puis en ammonium (nitrite réductase). L’ammonium entre dans le cycle GS–GOGAT, qui fabrique glutamine et glutamate, les donneurs d’azote de la plupart des autres acides aminés. Les légumineuses y ajoutent l’ammoniac fixé à partir du N₂ par les rhizobiums des nodules racinaires.',
  },
  'plant.seed.t': { en: 'Proteins in the seed', fr: 'Les protéines de la graine' },
  'plant.seed.p': {
    en: 'Seeds store nitrogen as proteins, mainly globulins and prolamins, deposited in the seed during maturation. On germination they are hydrolysed and the amino acids are reused by the seedling. The storage proteins of cereals also give flour its baking properties.',
    fr: 'Les graines stockent l’azote sous forme de protéines, surtout des globulines et des prolamines, déposées pendant la maturation. À la germination, elles sont hydrolysées et les acides aminés sont réutilisés par la plantule. Les protéines de réserve des céréales donnent aussi à la farine ses propriétés boulangères.',
  },
  'plant.aromatic.t': { en: 'Aromatic amino acids, lignin and auxin', fr: 'Acides aminés aromatiques, lignine et auxine' },
  'plant.aromatic.p': {
    en: 'Phenylalanine is the starting point of lignin and of many phenylpropanoids; tryptophan is the starting point of auxin (indole-3-acetic acid). The twenty protein amino acids are therefore also precursors of the plant’s cell-wall polymers and hormones.',
    fr: 'La phénylalanine est le point de départ de la lignine et de nombreux phénylpropanoïdes ; le tryptophane est celui de l’auxine (acide indole-3-acétique). Les vingt acides aminés des protéines sont donc aussi des précurseurs des polymères de la paroi et des hormones de la plante.',
  },
};

// ---------------------------------------------------------------- SVG helpers
const NS = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...kids) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null && v !== false) n.setAttribute(k, v);
  for (const kid of kids.flat()) if (kid !== null && kid !== undefined && kid !== false) n.append(kid);
  return n;
}
const unisub = (str) => String(str).replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
function subFormula(str) {
  const out = [];
  for (const part of String(str).split(/(\d+)/)) {
    if (!part) continue;
    if (/^\d+$/.test(part)) out.push(h('sub', {}, part));
    else out.push(part);
  }
  return h('span', { class: 'bc-formula' }, ...out);
}
const formulaOrText = (str) => (/^[A-Z][A-Za-z0-9]*$/.test(str) ? subFormula(str) : str);

function backboneSvg(aa) {
  return s('svg', { viewBox: '0 0 280 180', class: 'bc-backbone', role: 'img' },
    s('title', {}, t('aa.figAlt', { name: aa[lang()] })),
    s('line', { x1: 92, y1: 80, x2: 58, y2: 80, class: 'bc-bond' }),
    s('line', { x1: 118, y1: 80, x2: 162, y2: 80, class: 'bc-bond' }),
    s('line', { x1: 105, y1: 67, x2: 105, y2: 40, class: 'bc-bond' }),
    s('line', { x1: 105, y1: 93, x2: 105, y2: 120, class: 'bc-bond' }),
    s('text', { x: 52, y: 86, 'text-anchor': 'end', class: 'bc-svg-t' }, 'H₃N⁺'),
    s('text', { x: 168, y: 86, 'text-anchor': 'start', class: 'bc-svg-t' }, 'COO⁻'),
    s('text', { x: 105, y: 35, 'text-anchor': 'middle', class: 'bc-svg-t' }, 'H'),
    s('circle', { cx: 105, cy: 80, r: 13, class: 'bc-node' }),
    s('text', { x: 105, y: 85, 'text-anchor': 'middle', class: 'bc-svg-t' }, 'Cα'),
    s('text', { x: 105, y: 143, 'text-anchor': 'middle', class: 'bc-svg-t' }, 'R'),
    s('text', { x: 140, y: 170, 'text-anchor': 'middle', class: 'bc-svg-small' }, unisub(aa.side))
  );
}

function haworthSvg(kind) {
  const beta = kind === 'beta';
  const where = beta ? 'above' : 'below';
  const ohY = beta ? 42 : 94;
  const ohLine = beta ? { x2: 208, y2: 45 } : { x2: 208, y2: 86 };
  return s('svg', { viewBox: '0 0 260 185', class: 'bc-haworth-svg', role: 'img' },
    s('title', {}, t('carb.haworthAlt', { anomer: t(beta ? 'carb.beta' : 'carb.alpha'), where: t(beta ? 'carb.betaWhere' : 'carb.alphaWhere') })),
    s('polygon', { points: '150,30 190,65 170,115 100,115 65,65 100,30', class: 'bc-ring' }),
    s('circle', { cx: 150, cy: 30, r: 8, class: 'bc-ring-mask' }),
    s('text', { x: 150, y: 35, 'text-anchor': 'middle', class: 'bc-svg-t' }, 'O'),
    s('line', { x1: 190, y1: 65, ...ohLine, class: 'bc-bond' }),
    s('text', { x: 214, y: ohY + 5, 'text-anchor': 'start', class: 'bc-svg-t' }, 'OH'),
    s('line', { x1: 170, y1: 115, x2: 170, y2: 138, class: 'bc-bond' }),
    s('text', { x: 170, y: 153, 'text-anchor': 'middle', class: 'bc-svg-t' }, 'OH'),
    s('line', { x1: 100, y1: 115, x2: 100, y2: 92, class: 'bc-bond' }),
    s('text', { x: 100, y: 86, 'text-anchor': 'middle', class: 'bc-svg-t' }, 'OH'),
    s('line', { x1: 65, y1: 65, x2: 48, y2: 85, class: 'bc-bond' }),
    s('text', { x: 42, y: 90, 'text-anchor': 'end', class: 'bc-svg-t' }, 'OH'),
    s('line', { x1: 100, y1: 30, x2: 82, y2: 12, class: 'bc-bond' }),
    s('text', { x: 76, y: 9, 'text-anchor': 'end', class: 'bc-svg-t' }, 'CH₂OH'),
    s('text', { x: 198, y: 62, 'text-anchor': 'start', class: 'bc-svg-small' }, '1'),
    s('text', { x: 178, y: 124, 'text-anchor': 'start', class: 'bc-svg-small' }, '2'),
    s('text', { x: 92, y: 124, 'text-anchor': 'end', class: 'bc-svg-small' }, '3'),
    s('text', { x: 57, y: 62, 'text-anchor': 'end', class: 'bc-svg-small' }, '4'),
    s('text', { x: 92, y: 27, 'text-anchor': 'end', class: 'bc-svg-small' }, '5'),
    s('text', { x: 130, y: 178, 'text-anchor': 'middle', class: 'bc-svg-small' }, beta ? 'β' : 'α')
  );
}

function hexPoints(cx, cy, r, rot = 0) {
  const out = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 180) * (60 * i - 90 + rot);
    out.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return out.join(' ');
}

function glycanSvg(kind) {
  const cell = kind === 'cellulose';
  const svg = s('svg', { viewBox: '0 0 360 120', class: 'bc-glycan-svg', role: 'img' },
    s('title', {}, t('carb.glycanAlt', { bond: cell ? 'β-1,4' : 'α-1,4' })));
  for (let i = 0; i < 4; i++) {
    const x = 45 + i * 78;
    svg.append(s('polygon', { points: hexPoints(x, 55, 20, cell && i % 2 ? 180 : 0), class: 'bc-ring' }));
    if (i < 3) svg.append(s('line', { x1: x + 20, y1: 55, x2: x + 58, y2: 55, class: 'bc-bond' }));
  }
  if (!cell) {
    svg.append(s('line', { x1: 123, y1: 39, x2: 123, y2: 20, class: 'bc-bond' }));
    svg.append(s('polygon', { points: hexPoints(123, 12, 13), class: 'bc-ring bc-ring-small' }));
    svg.append(s('text', { x: 150, y: 15, 'text-anchor': 'start', class: 'bc-svg-small' }, 'α-1,6'));
  }
  svg.append(s('text', { x: 180, y: 108, 'text-anchor': 'middle', class: 'bc-svg-small' }, cell ? 'β-1,4' : 'α-1,4'));
  return svg;
}

function primarySvg() {
  const letters = ['M', 'G', 'S', 'K', 'V'];
  const svg = s('svg', { viewBox: '0 0 360 120', class: 'bc-level-svg', role: 'img' },
    s('title', {}, lang() === 'fr' ? 'Chaîne de cinq résidus, du N-terminal au C-terminal' : 'A chain of five residues, from the N-terminus to the C-terminus'),
    s('line', { x1: 28, y1: 60, x2: 332, y2: 60, class: 'bc-bond' }));
  letters.forEach((l, i) => {
    const x = 42 + i * 69;
    svg.append(s('circle', { cx: x, cy: 60, r: 19, class: 'bc-bead-svg' }),
      s('text', { x, y: 66, 'text-anchor': 'middle', class: 'bc-svg-t' }, l));
  });
  svg.append(s('text', { x: 28, y: 35, 'text-anchor': 'middle', class: 'bc-svg-small' }, 'N'),
    s('text', { x: 332, y: 35, 'text-anchor': 'middle', class: 'bc-svg-small' }, 'C'));
  return svg;
}

function secondarySvg() {
  let d = '';
  for (let x = 25; x <= 165; x += 2) {
    const y = 70 + 17 * Math.sin((x - 25) / 11);
    d += `${x === 25 ? 'M' : 'L'}${x},${y.toFixed(1)} `;
  }
  const svg = s('svg', { viewBox: '0 0 360 150', class: 'bc-level-svg', role: 'img' },
    s('title', {}, lang() === 'fr' ? 'Hélice α et feuillet β' : 'α-helix and β-sheet'),
    s('path', { d, class: 'bc-helix' }));
  for (let i = 0; i < 4; i++) {
    const x = 45 + i * 28;
    svg.append(s('line', { x1: x, y1: 45, x2: x + 10, y2: 95, class: 'bc-hbond' }));
  }
  svg.append(s('text', { x: 95, y: 136, 'text-anchor': 'middle', class: 'bc-svg-small' }, 'α-helix'));
  for (let i = 0; i < 3; i++) {
    const y = 40 + i * 30;
    svg.append(s('path', { d: `M210 ${y} H320 l-8 -6 m8 6 l-8 6`, class: 'bc-sheet' }));
  }
  svg.append(s('text', { x: 270, y: 136, 'text-anchor': 'middle', class: 'bc-svg-small' }, 'β-sheet'));
  return svg;
}

function tertiarySvg() {
  const svg = s('svg', { viewBox: '0 0 200 150', class: 'bc-level-svg', role: 'img' },
    s('title', {}, lang() === 'fr' ? 'Une chaîne repliée en globule, avec un pont disulfure' : 'One chain folded into a globule, with a disulfide bond'),
    s('path', { d: 'M100 18 C 142 18 178 44 178 78 C 178 116 143 136 101 136 C 59 136 22 116 22 78 C 22 44 58 18 100 18 Z', class: 'bc-globule' }));
  for (const [x, y] of [[72, 62], [92, 54], [111, 63], [84, 78], [105, 80], [128, 67]]) {
    svg.append(s('circle', { cx: x, cy: y, r: 5, class: 'bc-hydrophobic' }));
  }
  svg.append(s('line', { x1: 125, y1: 105, x2: 151, y2: 105, class: 'bc-ss' }),
    s('circle', { cx: 125, cy: 105, r: 8, class: 'bc-node' }),
    s('text', { x: 125, y: 109, 'text-anchor': 'middle', class: 'bc-svg-small' }, 'S'),
    s('circle', { cx: 151, cy: 105, r: 8, class: 'bc-node' }),
    s('text', { x: 151, y: 109, 'text-anchor': 'middle', class: 'bc-svg-small' }, 'S'));
  return svg;
}

function quaternarySvg() {
  const svg = s('svg', { viewBox: '0 0 200 150', class: 'bc-level-svg', role: 'img' },
    s('title', {}, lang() === 'fr' ? 'Quatre sous-unités assemblées en une protéine' : 'Four subunits assembled into one protein'));
  for (const [x, y, cls] of [[65, 52, 'a'], [125, 52, 'b'], [65, 102, 'b'], [125, 102, 'a']]) {
    svg.append(s('circle', { cx: x, cy: y, r: 27, class: `bc-subunit-${cls}` }));
  }
  return svg;
}

// ---------------------------------------------------------------- page pieces
function para(k, ids = [], vars = {}) {
  return h('p', {}, t(k, vars), ids.length ? ' ' : null, ...(ids.length ? cite(...ids) : []));
}

function toc() {
  return h('nav', { class: 'bc-toc', 'aria-label': t('toc') },
    h('h2', {}, t('toc')),
    h('ul', {},
      h('li', {}, h('a', { href: '#bc-amino' }, t('toc.amino'))),
      h('li', {}, h('a', { href: '#bc-charge' }, t('toc.charge'))),
      h('li', {}, h('a', { href: '#bc-peptides' }, t('toc.peptides'))),
      h('li', {}, h('a', { href: '#bc-carbs' }, t('toc.carbs'))),
      h('li', {}, h('a', { href: '#bc-plant' }, t('toc.plant')))));
}

let aaTableHost;
let aaDetailHost;
let aaFilter = 'all';
let aaEssential = false;
let aaSel = 'gly';

function aminoSection() {
  const filter = h('div', { class: 'seg bc-filter', role: 'group', 'aria-label': t('aa.filter') });
  for (const cat of ['all', ...CATEGORIES]) {
    const b = h('button', { type: 'button', 'data-cat': cat, 'aria-pressed': String(aaFilter === cat) },
      t(cat === 'all' ? 'aa.all' : `cat_${cat}`));
    b.addEventListener('click', () => {
      aaFilter = cat;
      filter.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.cat === cat)));
      const first = filtered()[0];
      if (first) aaSel = first.id;
      renderAmino();
    });
    filter.append(b);
  }
  const ess = h('button', {
    type: 'button', class: 'chip-btn', id: 'bc-essential', 'aria-pressed': String(aaEssential),
    onclick: () => {
      aaEssential = !aaEssential;
      ess.setAttribute('aria-pressed', String(aaEssential));
      const first = filtered()[0];
      if (first) aaSel = first.id;
      renderAmino();
    },
  }, t('aa.essentialOnly'));

  aaTableHost = h('div', { class: 'bc-tablewrap' });
  aaDetailHost = h('div', { class: 'bc-aa-detail', id: 'bc-aa-detail', 'aria-live': 'polite' });
  return h('section', { class: 'card', id: 'bc-amino' },
    h('h2', {}, t('aa.title')),
    para('aa.lead1', ['openstax-proteins', 'libretexts-pi']),
    para('aa.lead2', ['iupac-aa']),
    para('aa.lead3', ['who-aa', 'openstax-nitrogen']),
    h('div', { class: 'bc-aa-tools' }, filter, ess),
    h('div', { class: 'bc-aa-layout' }, aaTableHost, aaDetailHost),
    h('p', { class: 'bc-small' }, t('aa.tableNote')),
    chargeBlock());
}

function filtered() {
  return AMINO_ACIDS.filter((a) => (aaFilter === 'all' || a.cat === aaFilter) && (!aaEssential || a.essential));
}

function renderAmino() {
  const list = filtered();
  if (!list.some((a) => a.id === aaSel)) aaSel = list[0]?.id;
  const table = h('table', { class: 'bc-table bc-aa-table' },
    h('caption', {}, t('aa.tableCaption')),
    h('thead', {}, h('tr', {},
      h('th', { scope: 'col' }, t('aa.name')),
      h('th', { scope: 'col' }, t('aa.codes')),
      h('th', { scope: 'col' }, t('aa.side')),
      h('th', { scope: 'col' }, t('aa.category')),
      h('th', { scope: 'col' }, t('aa.human')))),
    h('tbody', {}, ...list.map(aaRow)));
  aaTableHost.replaceChildren(table);
  const aa = AMINO_ACIDS.find((a) => a.id === aaSel);
  aaDetailHost.replaceChildren(aa ? aaDetail(aa) : h('p', {}, t('aa.none')));
}

function aaRow(aa) {
  return h('tr', { class: aa.id === aaSel ? 'is-selected' : '' },
    h('th', { scope: 'row' }, h('button', {
      type: 'button', class: 'bc-aa-btn', 'aria-pressed': String(aa.id === aaSel),
      onclick: () => { aaSel = aa.id; renderAmino(); },
    }, aa[lang()])),
    h('td', { class: 'bc-code' }, `${aa.three} · ${aa.one}`),
    h('td', {}, subFormula(aa.side)),
    h('td', {}, h('span', { class: `bc-cat bc-cat-${aa.cat}` }, t(`cat_${aa.cat}`))),
    h('td', {}, aa.essential ? t('aa.yes') : aa.cond ? t('aa.cond') : t('aa.no')));
}

function aaDetail(aa) {
  const human = aa.essential ? t('aa.yes') : aa.cond ? t('aa.cond') : t('aa.no');
  return h('div', { class: 'bc-aa-card' },
    h('div', { class: 'bc-aa-head' },
      h('div', {},
        h('p', { class: 'bc-small' }, t('aa.detailTitle')),
        h('h3', {}, aa[lang()]),
        h('p', { class: 'bc-code' }, `${aa.three} · ${aa.one}`)),
      h('span', { class: `bc-cat bc-cat-${aa.cat}` }, t(`cat_${aa.cat}`))),
    backboneSvg(aa),
    h('dl', { class: 'bc-facts' },
      h('dt', {}, t('aa.sideChain')),
      h('dd', {}, subFormula(aa.side)),
      h('dt', {}, t('aa.human')),
      h('dd', {}, human),
      aa.pi ? h('dt', {}, t('aa.pi')) : null,
      aa.pi ? h('dd', {}, fixed(aa.pi, lang(), 1)) : null),
    h('p', { class: 'bc-note' }, L(aa.note)));
}

function chargeBlock() {
  return h('div', { id: 'bc-charge' },
    h('h3', {}, t('pi.title')),
    para('pi.lead', ['libretexts-pi']),
    h('div', { class: 'bc-pi-ladder' },
      h('div', { class: 'bc-pi-step is-low' }, h('strong', {}, t('pi.low')), h('span', {}, 'pH < pI')),
      h('div', { class: 'bc-pi-step is-mid' }, h('strong', {}, t('pi.mid')), h('span', {}, 'pH = pI')),
      h('div', { class: 'bc-pi-step is-high' }, h('strong', {}, t('pi.high')), h('span', {}, 'pH > pI'))),
    h('p', {}, t('pi.formula'), ' ', ...cite('libretexts-pi')),
    h('div', { class: 'bc-tablewrap bc-pi-wrap' },
      h('table', { class: 'bc-table bc-pi-table' },
        h('caption', {}, t('pi.tableCaption')),
        h('thead', {}, h('tr', {}, h('th', { scope: 'col' }, t('pi.amino')), h('th', { scope: 'col' }, t('pi.value')))),
        h('tbody', {}, ...PI_TABLE.map((a) => h('tr', {},
          h('th', { scope: 'row' }, `${a[lang()]} (${a.three})`),
          h('td', {}, fixed(a.pi, lang(), 1))))))),
    h('p', { class: 'bc-small' }, t('pi.note')));
}

// ---------------------------------------------------------------- peptide builder
let pep = [];
let pepHost;

function peptideSection() {
  const sel = h('select', { id: 'bc-pep-select' },
    ...AMINO_ACIDS.map((a) => h('option', { value: a.id }, `${a.three} (${a.one}) — ${a[lang()]}`)));
  const add = h('button', {
    type: 'button', class: 'btn', onclick: () => { pep.push(sel.value); renderPeptide(); },
  }, t('pep.build.add'));
  const rem = h('button', {
    type: 'button', class: 'chip-btn', onclick: () => { pep.pop(); renderPeptide(); },
  }, t('pep.build.remove'));
  const clear = h('button', {
    type: 'button', class: 'chip-btn', onclick: () => { pep = []; renderPeptide(); },
  }, t('pep.build.clear'));
  pepHost = h('div', { class: 'bc-pep-out', role: 'status', 'aria-live': 'polite' });
  return h('section', { class: 'card', id: 'bc-peptides' },
    h('h2', {}, t('pep.title')),
    para('pep.lead', ['openstax-proteins']),
    h('div', { class: 'bc-eq' },
      h('span', { class: 'bc-eq-part' }, subFormula('H2N–CH(R1)–COOH')),
      h('span', { class: 'bc-op' }, '+'),
      h('span', { class: 'bc-eq-part' }, subFormula('H2N–CH(R2)–COOH')),
      h('span', { class: 'bc-arrow', 'aria-hidden': 'true' }, '→'),
      h('span', { class: 'bc-eq-part is-product' }, subFormula('H2N–CH(R1)–CO–NH–CH(R2)–COOH')),
      h('span', { class: 'bc-op' }, '+'),
      h('span', { class: 'bc-eq-part' }, subFormula('H2O'))),
    h('p', { class: 'bc-small' }, t('pep.bondNote')),
    h('h3', {}, t('pep.build.title')),
    h('p', {}, t('pep.build.hint')),
    h('div', { class: 'bc-builder' },
      h('label', { for: 'bc-pep-select' }, t('pep.build.pick')), sel, add, rem, clear),
    pepHost,
    h('h3', {}, t('pep.ex.title')),
    h('div', { class: 'bc-examples' },
      exampleCard('pep.ex1.title', ['pep.ex1.p'], ['openstax-proteins']),
      exampleCard('pep.ex2.title', ['pep.ex2.p'], ['openstax-proteins']),
      exampleCard('pep.ex3.title', ['pep.ex3.p'], ['openstax-proteins'])),
    h('h3', {}, t('pep.levels.title')),
    h('div', { class: 'bc-levels' },
      levelFigure(primarySvg(), 'pep.levels.primary.t', 'pep.levels.primary.p', ['openstax-proteins']),
      levelFigure(secondarySvg(), 'pep.levels.secondary.t', 'pep.levels.secondary.p', ['openstax-proteins']),
      levelFigure(tertiarySvg(), 'pep.levels.tertiary.t', 'pep.levels.tertiary.p', ['openstax-proteins']),
      levelFigure(quaternarySvg(), 'pep.levels.quaternary.t', 'pep.levels.quaternary.p', ['openstax-proteins'])));
}

function exampleCard(titleKey, bodyKeys, ids) {
  return h('div', { class: 'bc-example' },
    h('h4', {}, t(titleKey)),
    ...bodyKeys.map((k) => para(k, ids)));
}

function levelFigure(svg, titleKey, bodyKey, ids) {
  return h('figure', { class: 'bc-level' }, svg,
    h('figcaption', {}, h('h4', {}, t(titleKey)), para(bodyKey, ids)));
}

function renderPeptide() {
  const n = pep.length;
  const seq3 = pep.map((id) => AMINO_ACIDS.find((a) => a.id === id).three).join('–');
  const seq1 = pep.map((id) => AMINO_ACIDS.find((a) => a.id === id).one).join('');
  const beads = pep.map((id) => {
    const aa = AMINO_ACIDS.find((a) => a.id === id);
    return h('span', { class: `bc-bead bc-cat-${aa.cat}`, 'aria-hidden': 'true', title: `${aa[lang()]} (${aa.three})` }, aa.one);
  });
  pepHost.replaceChildren(...[
    h('div', { class: 'bc-pep-beads' }, ...beads),
    n ? h('p', { class: 'bc-pep-seq' }, h('strong', {}, `${t('pep.build.sequence')} : `), `H₂N–${seq3}–COOH`) : h('p', {}, t('pep.build.empty')),
    n ? h('p', { class: 'bc-pep-counts' }, `${t('pep.build.residues', { n })} · ${t('pep.build.bonds', { n: n - 1 })} · ${t('pep.build.water', { n: n - 1 })}`) : null,
    n ? h('p', { class: 'bc-small' }, `${t('pep.build.one')} ${seq1}`) : null,
  ].filter(Boolean));
}

// ---------------------------------------------------------------- carbohydrates
let anomer = 'beta';

function carbSection() {
  return h('section', { class: 'card', id: 'bc-carbs' },
    h('h2', {}, t('carb.title')),
    para('carb.lead', ['openstax-carbs']),
    h('div', { class: 'bc-carb-top' },
      ringFigure(),
      h('div', { class: 'bc-tablewrap' }, carbTable())),
    h('h3', {}, t('carb.bondsTitle')),
    para('carb.bondsLead', ['openstax-carbs']),
    h('div', { class: 'bc-two' },
      h('figure', { class: 'bc-fig' }, glycanSvg('starch'), h('figcaption', {}, h('strong', {}, t('carb.starch')), ' — ', t('carb.starchNote'))),
      h('figure', { class: 'bc-fig' }, glycanSvg('cellulose'), h('figcaption', {}, h('strong', {}, t('carb.cellulose')), ' — ', t('carb.celluloseNote')))));
}

function ringFigure() {
  const host = h('div', { class: 'bc-haworth' });
  const cap = h('figcaption');
  const group = h('div', { class: 'seg bc-anomer', role: 'group', 'aria-label': t('carb.ringTitle') });
  for (const kind of ['alpha', 'beta']) {
    const b = h('button', { type: 'button', 'data-anomer': kind, 'aria-pressed': String(anomer === kind) }, t(`carb.${kind}`));
    b.addEventListener('click', () => {
      anomer = kind;
      group.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.anomer === kind)));
      paint();
    });
    group.append(b);
  }
  function paint() {
    host.replaceChildren(haworthSvg(anomer));
    cap.replaceChildren(
      h('strong', {}, t(anomer === 'beta' ? 'carb.beta' : 'carb.alpha')),
      ' — ',
      t(anomer === 'beta' ? 'carb.betaDesc' : 'carb.alphaDesc'));
  }
  const fig = h('figure', { class: 'bc-fig bc-ring-fig' }, group, host, cap,
    h('p', { class: 'bc-small' }, t('carb.ringNote'), ' ', ...cite('openstax-carbs')));
  paint();
  return fig;
}

function carbTable() {
  return h('table', { class: 'bc-table bc-carb-table' },
    h('caption', {}, t('carb.tableCaption')),
    h('thead', {}, h('tr', {},
      h('th', { scope: 'col' }, t('carb.name')),
      h('th', { scope: 'col' }, t('carb.kind')),
      h('th', { scope: 'col' }, t('carb.units')),
      h('th', { scope: 'col' }, t('carb.bond')),
      h('th', { scope: 'col' }, t('carb.note')))),
    h('tbody', {}, ...CARBS.map((c) => h('tr', {},
      h('th', { scope: 'row' }, L(c)),
      h('td', {}, L(c.kind)),
      h('td', {}, formulaOrText(L(c.units))),
      h('td', {}, c.bond ? L(c.bond) : '—'),
      h('td', {}, L(c.note))))));
}

// ---------------------------------------------------------------- in the plant
function plantSection() {
  return h('section', { class: 'card', id: 'bc-plant' },
    h('h2', {}, t('plant.title')),
    para('plant.lead'),
    h('div', { class: 'bc-plant-grid' },
      plantCard('plant.cellulose.t', 'plant.cellulose.p', ['openstax-carbs']),
      plantCard('plant.sucrose.t', 'plant.sucrose.p', ['openstax-phloem']),
      plantCard('plant.nitrogen.t', 'plant.nitrogen.p', ['ali-nitrate', 'openstax-nitrogen']),
      plantCard('plant.seed.t', 'plant.seed.p', ['shewry-seed', 'shewry-cereal']),
      plantCard('plant.aromatic.t', 'plant.aromatic.p', ['dudareva-aaa'])));
}

function plantCard(titleKey, bodyKey, ids) {
  return h('div', { class: 'bc-plant-card' },
    h('h3', {}, t(titleKey)),
    para(bodyKey, ids));
}

// ---------------------------------------------------------------- mount
let panel;

export function mount(ctx) {
  panel = ctx.panel;
  panel.replaceChildren(
    h('header', { class: 'bc-head' },
      h('h1', {}, t('title')),
      h('p', { class: 'lead' }, t('lead'))),
    toc(),
    aminoSection(),
    peptideSection(),
    carbSection(),
    plantSection(),
    h('section', { class: 'card sources' }, h('h2', {}, t('sources')), sourceList()));
  renderAmino();
  renderPeptide();
}

export function route() { /* no hash state */ }
export function refresh() { mount({ panel }); }
