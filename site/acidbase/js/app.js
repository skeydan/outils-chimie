// Acids and bases tab (mounted by assets/app.js): pH of a solution, buffers, titration curve, and which
// way a proton transfer lies. Every constant comes from data.js (OpenStax
// Appendices H and I); every calculation from model.js.
//
// State lives in the URL hash, #acidbase?<keys> (all keys optional):
//   ph=<reagent id>  c=<mol/L>                               pH of a solution
//   bp=<family>:<j>  ca=  cb=  (mol/L)  bv=<mL>  ba=none|base|acid  bac=<mol/L>  bav=<mL>   buffer
//   ta=<reagent id>  tca=<mol/L>  tva=<mL>  tt=base|acid  tct=<mol/L>  tv=<mL read>         titration
//   pa=<species key> pb=<species key>                        proton transfer (keys of speciesList())
// e.g. #acidbase?ph=acetic&c=0.1&ta=phosphoric&tt=base&tv=37.5
//
// Element ids used by the browser checks:
//   #ph-species #ph-c #ph-value #ph-exact #ph-steps #ph-dist
//   #buf-pair #buf-ca #buf-cb #buf-v #buf-add #buf-addc #buf-addv #buf-value #buf-after #buf-steps
//   #t-analyte #t-ca #t-va #t-titrant #t-cb #t-chart #t-slider #t-read #t-keys #t-table
//   #pt-acid #pt-base #pt-result
import { lang } from '../../assets/site.js';
import { h as uiH, num, fixed, sci, fmtn, citer, field, species } from '../../assets/ui.js';
import { SOURCES, OPENSTAX_REF } from '../../assets/common.js';
import { speciesUnicode } from '../../assets/chem/formula.js';
import { KW, REAGENTS, reagentById, famById, pairs, speciesList, STRONG_ACIDS } from './data.js';
import { pKa } from './equilibrium.js';
import { PKW, phRoute, buffer, titration, region, speciesAt, protonTransfer, conjugates } from './model.js';
import { drawTitration } from './chart.js';

const PAGE_SOURCES = ['openstax-bl', 'openstax-strength', 'openstax-ka', 'openstax-kb', 'openstax-polyprotic', 'openstax-buffer', 'openstax-titration'];
const { cite, list: sourceList } = citer(PAGE_SOURCES.map((id) => ({ id, ...SOURCES[id] })));

// Children may be nested arrays (language branches build them): flatten fully.
const h = (tag, attrs = {}, ...kids) => uiH(tag, attrs, ...kids.flat(Infinity));

// ------------------------------------------------------------ text
const L = (en, fr) => ({ en, fr });
const T = {
  title: L('Acids and bases', 'Acides et bases'),
  lead: L('Pick a substance from the lists: the page gives the pH of its solution step by step, the way a textbook does it, then the exact answer. Below: buffers, a titration curve you can explore, and which way a proton transfer goes.',
    'Choisissez une substance dans les listes : la page donne le pH de sa solution pas à pas, comme dans un manuel, puis la valeur exacte. Plus bas : les solutions tampons, une courbe de titrage à explorer, et le sens d’un transfert de proton.'),
  conditions: L('All values are for water at 25 °C. As in the textbook, concentrations stand in for activities: the more concentrated the solution, the less exact this is.',
    'Toutes les valeurs valent pour l’eau à 25 °C. Comme dans le manuel, les concentrations tiennent lieu d’activités : plus la solution est concentrée, moins c’est exact.'),
  // groups
  'g.strong-acid': L('Strong acids', 'Acides forts'), 'g.weak-acid': L('Weak acids', 'Acides faibles'),
  'g.strong-base': L('Strong bases', 'Bases fortes'), 'g.weak-base': L('Weak bases', 'Bases faibles'),
  'g.salt': L('Salts', 'Sels'),
  // section 1
  'ph.h': L('pH of a solution', 'pH d’une solution'),
  'ph.species': L('Substance dissolved in water', 'Substance dissoute dans l’eau'),
  'ph.c': L('Concentration', 'Concentration'),
  'ph.cHint': L('As prepared, before any reaction with water.', 'Telle que préparée, avant toute réaction avec l’eau.'),
  'ph.exactLbl': L('exact', 'exact'),
  'ph.textbookLbl': L('textbook route', 'méthode du manuel'),
  'ph.dist': L('Forms present at this pH', 'Formes présentes à ce pH'),
  'ph.distNote': L('Share of each form of the dissolved acid–base pair, from its Ka values and the exact [H₃O⁺].', 'Part de chaque forme du couple dissous, d’après ses Ka et la valeur exacte de [H₃O⁺].'),
  acidic: L('acidic', 'acide'), basic: L('basic', 'basique'), neutral: L('neutral', 'neutre'),
  badC: L('Enter a concentration between 10⁻⁸ and 10 mol/L.', 'Entrez une concentration entre 10⁻⁸ et 10 mol/L.'),
  tagAcid: L('acid', 'acide'), tagBase: L('base', 'base'), tagCAcid: L('conjugate acid', 'acide conjugué'), tagCBase: L('conjugate base', 'base conjuguée'),
  // steps
  'st.equation': L('The reaction with water', 'La réaction avec l’eau'),
  'st.constant': L('The constant', 'La constante'),
  'st.ice': L('Concentrations before and at equilibrium', 'Concentrations au départ et à l’équilibre'),
  'st.solve': L('Solve, assuming x is small', 'Résoudre en supposant x petit'),
  'st.check': L('Check the assumption', 'Vérifier l’hypothèse'),
  'st.ph': L('The pH', 'Le pH'),
  'st.exact': L('Exact answer', 'Valeur exacte'),
  'st.poly': L('Several protons', 'Plusieurs protons'),
  'st.second': L('The second proton', 'Le second proton'),
  'st.two': L('Two reactions compete', 'Deux réactions en concurrence'),
  initial: L('Initial', 'Initial'), change: L('Change', 'Variation'), equil: L('Equilibrium', 'Équilibre'),
  // buffer
  'buf.h': L('Buffer solution', 'Solution tampon'),
  'buf.lead': L('A weak acid and its conjugate base in the same solution resist changes of pH.', 'Un acide faible et sa base conjuguée dans la même solution limitent les variations de pH.'),
  'buf.pair': L('Acid / conjugate base pair', 'Couple acide / base conjuguée'),
  'buf.ca': L('Acid concentration', 'Concentration de l’acide'),
  'buf.cb': L('Base concentration', 'Concentration de la base'),
  'buf.v': L('Volume of buffer', 'Volume de tampon'),
  'buf.add': L('Then add', 'Puis ajouter'),
  'buf.addNone': L('nothing', 'rien'), 'buf.addBase': L('NaOH (strong base)', 'NaOH (base forte)'), 'buf.addAcid': L('HCl (strong acid)', 'HCl (acide fort)'),
  'buf.addc': L('Its concentration', 'Sa concentration'), 'buf.addv': L('Volume added', 'Volume ajouté'),
  'buf.after': L('after the addition', 'après l’ajout'),
  // titration
  't.h': L('Titration curve', 'Courbe de titrage'),
  't.lead': L('A solution in the flask, a strong acid or base added from the burette. Move the slider or the pointer along the curve to see what the flask holds.', 'Une solution dans le bécher, un acide ou une base forte versé à la burette. Déplacez le curseur ou le pointeur le long de la courbe pour voir ce que contient le bécher.'),
  't.analyte': L('In the flask', 'Dans le bécher'), 't.ca': L('Its concentration', 'Sa concentration'), 't.va': L('Its volume', 'Son volume'),
  't.titrant': L('From the burette', 'Dans la burette'), 't.cb': L('Titrant concentration', 'Concentration du réactif titrant'),
  't.naoh': L('NaOH (strong base)', 'NaOH (base forte)'), 't.hcl': L('HCl (strong acid)', 'HCl (acide fort)'),
  't.slider': L('Volume of titrant added', 'Volume de réactif titrant versé'),
  't.legend': L('Shaded: buffer region (both partners present, neither below a tenth of the other). Filled dot: equivalence point. Hollow dot: half-equivalence, where pH ≈ pKa.', 'Zone teintée : zone tampon (les deux partenaires présents, aucun sous le dixième de l’autre). Point plein : équivalence. Point creux : demi-équivalence, où pH ≈ pKa.'),
  't.keys': L('Four points by the textbook route', 'Quatre points par la méthode du manuel'),
  't.table': L('Table of the curve', 'Tableau de la courbe'),
  't.volume': L('Volume (mL)', 'Volume (mL)'), 't.point': L('Point', 'Point'), 't.method': L('Textbook method', 'Méthode du manuel'),
  't.textbook': L('pH (textbook)', 'pH (manuel)'), 't.exact': L('pH (exact)', 'pH (exact)'),
  't.none': L('Nothing to titrate: this pair does not exchange protons.', 'Rien à titrer : ces deux réactifs n’échangent pas de proton.'),
  't.inflask': L('In the flask', 'Dans le bécher'),
  // proton transfer
  'pt.h': L('Which way does a proton transfer go?', 'Dans quel sens va un transfert de proton ?'),
  'pt.lead': L('Mix an acid and a base: the proton goes mostly to the side of the weaker acid.', 'Mélangez un acide et une base : le proton passe surtout du côté de l’acide le plus faible.'),
  'pt.acid': L('Acid (gives the proton)', 'Acide (donne le proton)'), 'pt.base': L('Base (takes the proton)', 'Base (capte le proton)'),
  sources: L('Sources', 'Sources'),
};
const t = (k) => T[k]?.[lang()] ?? T[k]?.en ?? k;
const fr = () => lang() === 'fr';
const nm = (o) => (o ? o[lang()] ?? o.en : '');

// ------------------------------------------------------------ small DOM helpers
const p = (...kids) => h('p', {}, ...kids);
const sp = (f) => species(f);
const ph2 = (v) => fixed(v, lang(), 2);
const mol = (v) => h('span', { class: 'math' }, sci(v, lang(), 2), ' mol/L');
const K = (v) => sci(v, lang(), 2);
const step = (title, ...kids) => h('li', { class: 'step' }, h('h3', {}, title), ...kids);
const tag = (cls, label, formula, coef = '') => h('span', { class: 'cell' }, h('span', { class: `term ${cls}` }, coef, sp(formula)), h('span', { class: 'tagline' }, label));
const op = (s) => h('span', { class: 'op' }, ` ${s} `);
/** A proton-transfer equation with acid/base tags: [acid, base, conjBase, conjAcid]. */
function pairEq(acid, base, conjAcid, conjBase, { arrow = '⇌' } = {}) {
  return h('div', { class: 'pair-eq', role: 'math' },
    tag('acid', t('tagAcid'), acid), op('+'), tag('base', t('tagBase'), base), op(arrow),
    tag('acid', t('tagCAcid'), conjAcid), op('+'), tag('base', t('tagCBase'), conjBase));
}
const eqBlock = (...kids) => h('div', { class: 'eq-block math' }, ...kids);
const frac = (num, den) => h('span', { class: 'frac' }, h('span', { class: 'fn' }, ...[num].flat()), h('span', { class: 'fd' }, ...[den].flat()));
const conc = (f) => h('span', {}, '[', sp(f), ']');

// ------------------------------------------------------------ state
const DEF = { ph: 'acetic', c: '0.100', bp: 'acetic:0', ca: '0.10', cb: '0.10', bv: '100', ba: 'base', bac: '0.10', bav: '1.0', ta: 'acetic', tca: '0.100', tva: '25.00', tt: 'base', tct: '0.100', tv: '12.50', pa: 'acetic:0', pb: 'ammonia:1' };
const state = { ...DEF };
let ctx = null;
function readHash() {
  const q = new URLSearchParams(ctx.query());
  for (const k of Object.keys(DEF)) if (q.has(k)) state[k] = q.get(k);
  if (!reagentById.has(state.ph)) state.ph = DEF.ph;
  if (!reagentById.has(state.ta)) state.ta = DEF.ta;
  if (!pairs().some((x) => x.id === state.bp)) state.bp = DEF.bp;
  if (!['none', 'base', 'acid'].includes(state.ba)) state.ba = DEF.ba;
  if (!['base', 'acid'].includes(state.tt)) state.tt = DEF.tt;
  const keys = new Set(speciesList().map((s) => s.key));
  if (!keys.has(state.pa)) state.pa = DEF.pa;
  if (!keys.has(state.pb)) state.pb = DEF.pb;
}
function writeHash() {
  const q = new URLSearchParams();
  for (const k of Object.keys(DEF)) if (state[k] !== DEF[k]) q.set(k, state[k]);
  ctx.save(q.toString());
}
const okC = (v) => Number.isFinite(v) && v >= 1e-8 && v <= 10;
const okV = (v) => Number.isFinite(v) && v > 0 && v <= 10000;

// ------------------------------------------------------------ controls
function reagentSelect(id, label, value, { filter = () => true } = {}) {
  const groups = ['strong-acid', 'weak-acid', 'strong-base', 'weak-base', 'salt'];
  const sel = h('select', { id }, ...groups.map((g) => h('optgroup', { label: t(`g.${g}`) },
    ...REAGENTS.filter((r) => r.group === g && filter(r)).map((r) => h('option', { value: r.id, selected: r.id === value }, `${speciesUnicode(r.formula)} · ${nm(r.name)}`)))));
  const wrap = h('div', { class: 'field select' }, h('label', { for: id }, label), h('div', { class: 'field-in' }, sel));
  return { wrap, input: sel };
}
function plainSelect(id, label, options, value) {
  const sel = h('select', { id }, ...options.map(([v, text]) => h('option', { value: v, selected: v === value }, text)));
  return { wrap: h('div', { class: 'field select' }, h('label', { for: id }, label), h('div', { class: 'field-in' }, sel)), input: sel };
}
function numField(id, label, key, unit, hint = '') {
  const f = field({ id, label, value: state[key], unit, hint });
  return f;
}
/** Wire inputs to state keys; `rerender` runs on every change. */
function bind(pairsList, rerender) {
  for (const [input, key, check] of pairsList) {
    const ev = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(ev, () => {
      state[key] = input.value;
      if (check) input.setAttribute('aria-invalid', String(!check(num(input.value))));
      writeHash();
      rerender();
    });
    if (check) input.setAttribute('aria-invalid', String(!check(num(input.value))));
  }
}

// ------------------------------------------------------------ pH bar
function phBar(pH) {
  const pos = (v) => `${(Math.max(0, Math.min(14, v)) / 14) * 100}%`;
  return h('div', { class: 'phbar', role: 'img', 'aria-label': `pH ${ph2(pH)}` },
    ...[0, 2, 4, 6, 7, 8, 10, 12, 14].map((v) => h('span', { class: 'tick', style: `left:${pos(v)}` }, String(v))),
    h('span', { class: 'side', style: 'left:0' }, `← ${t('acidic')}`),
    h('span', { class: 'side', style: `left:${pos(7)};transform:translateX(-50%)` }, t('neutral')),
    h('span', { class: 'side', style: 'right:0' }, `${t('basic')} →`),
    h('span', { class: 'mark', style: `left:${pos(pH)}` }),
    h('span', { class: 'mark-lbl', style: `left:${pos(pH)}` }, `pH ${ph2(pH)}`));
}

/** Horizontal bars, one hue: the share of each form. */
function distBars(rows) {
  return h('div', { class: 'dist', role: 'table' }, ...rows.map((r) => h('div', { class: 'dist-row', role: 'row' },
    h('span', { class: 'dist-name', role: 'rowheader' }, sp(r.formula)),
    h('span', { class: 'dist-track', role: 'cell' }, h('span', { class: 'dist-bar', style: `width:${Math.max(0.4, r.alpha * 100).toFixed(2)}%` })),
    h('span', { class: 'dist-val', role: 'cell' }, pct(r.alpha)))));
}
function pct(a) {
  const v = a * 100;
  if (v >= 99.95 && v < 100) return '> 99.9 %';
  if (v > 0 && v < 0.05) return '< 0.1 %';
  return `${fmtn(v, lang(), v >= 10 ? 1 : 2)} %`;
}

// ------------------------------------------------------------ section 1: pH of a solution
const spectatorOf = (r) => {
  if (r.kind !== 'form') return null;
  const f = famById.get(r.fam);
  const z = f.z0 - r.j;
  return z < 0 ? 'Na+' : z > 0 ? 'Cl-' : null;
};
function kSource(f, which) {
  // where the K comes from: Appendix H (Ka), Appendix I (Kb), or calculated
  if (f.kaFromKb) return which === 'kb' ? cite('openstax-kb') : [...cite('openstax-kb'), ...cite('openstax-bl')];
  return which === 'ka' ? cite('openstax-ka') : [...cite('openstax-ka'), ...cite('openstax-bl')];
}

function renderPH(out) {
  const r = reagentById.get(state.ph);
  const C = num(state.c);
  out.replaceChildren();
  if (!okC(C)) { out.append(h('p', { class: 'err', role: 'alert' }, t('badC'))); return; }
  const R = phRoute(r, C);
  const ex = R.exact.pH;
  const shown = R.pHText ?? ex;
  out.append(
    h('p', { class: 'hero', id: 'ph-value' }, `pH ${ph2(shown)}`, R.pHText !== null ? h('small', {}, t('ph.textbookLbl')) : h('small', {}, t('ph.exactLbl'))),
    h('p', { class: 'muted', id: 'ph-exact' }, fr() ? 'Valeur exacte : ' : 'Exact value: ', h('strong', {}, `pH ${ph2(ex)}`), ' · [H₃O⁺] = ', mol(R.exact.h), ' · [OH⁻] = ', mol(R.exact.oh)),
    phBar(ex));
  const steps = h('ol', { class: 'steps', id: 'ph-steps' });
  out.append(steps);
  const lg = lang();
  const spect = spectatorOf(r);
  const spectNote = spect ? p(h('span', { class: 'why' }, fr() ? [sp(spect), ' ne fait que compenser la charge (ion spectateur) : seul ', sp(R.reagent.kind === 'form' ? famById.get(r.fam).forms[r.j] : r.formula), ' réagit avec l’eau.'] : [sp(spect), ' only balances the charge (a spectator ion): only ', sp(famById.get(r.fam).forms[r.j]), ' reacts with water.'])) : null;

  if (R.type === 'strong-acid') {
    steps.append(
      step(t('st.equation'), p(fr() ? [nm(r.name), ' fait partie des six acides forts : il cède son proton à l’eau en totalité ', ...cite('openstax-strength'), '.'] : [cap(nm(r.name)), ' is one of the six strong acids: it gives its proton to water completely ', ...cite('openstax-strength'), '.']),
        pairEq(r.formula, 'H2O', 'H3O+', r.strong.conj, { arrow: '→' })),
      step(t('st.ph'), eqBlock('[H₃O⁺] = C = ', mol(C)), eqBlock('pH = −log [H₃O⁺] = ', h('strong', {}, ph2(R.pHText)))),
      exactStep(R, waterNote(C)));
  } else if (R.type === 'sulfuric') {
    const f = famById.get('hso4');
    steps.append(
      step(t('st.equation'), p(fr() ? ['L’acide sulfurique est un acide fort pour son premier proton seulement : cette première étape est totale ', ...cite('openstax-polyprotic'), '.'] : ['Sulfuric acid is strong for its first proton only: that first step is complete ', ...cite('openstax-polyprotic'), '.']),
        pairEq('H2SO4', 'H2O', 'H3O+', 'HSO4-', { arrow: '→' }),
        p(fr() ? ['Après cette étape : [H₃O⁺] = [HSO₄⁻] = ', mol(C), ', soit un pH de ', ph2(R.pHFirstOnly), ' si l’on s’arrêtait là.'] : ['After it: [H₃O⁺] = [HSO₄⁻] = ', mol(C), ', a pH of ', ph2(R.pHFirstOnly), ' if we stopped there.'])),
      step(t('st.second'), pairEq('HSO4-', 'H2O', 'H3O+', 'SO4^2-'),
        p('Ka2 = ', K(R.Ka), ' ', ...cite('openstax-polyprotic'), fr() ? ' : un acide faible, mais pas assez pour être négligé.' : ': a weak acid, but not weak enough to ignore.'),
        eqBlock('Ka2 = ', frac(['(', fixed(C, lg, 3), ' + x) · x'], ['(', fixed(C, lg, 3), ' − x)']), fr() ? ' ; on résout l’équation du second degré : ' : '; solving the quadratic: ', 'x = ', mol(R.x)),
        eqBlock('[H₃O⁺] = C + x = ', mol(R.h), ' → pH = ', h('strong', {}, ph2(R.pHText)))),
      exactStep(R));
  } else if (R.type === 'strong-base') {
    const n = r.strong.oh;
    steps.append(
      step(t('st.equation'), p(fr() ? [cap(nm(r.name)), ' est une base forte : elle libère tous ses ions hydroxyde ', ...cite('openstax-strength'), n > 1 ? ', ici deux par unité de formule.' : '.'] : [cap(nm(r.name)), ' is a strong base: it releases all its hydroxide ions ', ...cite('openstax-strength'), n > 1 ? ', two per formula unit here.' : '.']),
        eqBlock(sp(r.formula), ' → ', sp(r.strong.cation), ' + ', n > 1 ? `${n} ` : '', sp('OH-'))),
      step(t('st.ph'), eqBlock('[OH⁻] = ', n > 1 ? `${n} × ` : '', 'C = ', mol(R.oh)), eqBlock('pOH = −log [OH⁻] = ', ph2(R.pOH)),
        eqBlock('pH = pKw − pOH = ', fixed(PKW, lg, 2), ' − ', ph2(R.pOH), ' = ', h('strong', {}, ph2(R.pHText))),
        p(h('span', { class: 'why' }, fr() ? ['Kw = [H₃O⁺][OH⁻] = 1,0 × 10⁻¹⁴ à 25 °C, d’où pH + pOH = 14,00 ', ...cite('openstax-bl'), '.'] : ['Kw = [H₃O⁺][OH⁻] = 1.0 × 10⁻¹⁴ at 25 °C, so pH + pOH = 14.00 ', ...cite('openstax-bl'), '.']))),
      exactStep(R, waterNote(C)));
  } else if (R.type === 'neutral') {
    steps.append(step(t('st.equation'), p(fr() ? ['Na⁺ vient d’une base forte et Cl⁻ d’un acide fort. La base conjuguée d’un acide fort et l’acide conjugué d’une base forte sont si faibles qu’ils ne réagissent pratiquement pas avec l’eau ', ...cite('openstax-strength'), ' : la solution reste neutre, pH = 7,00 à 25 °C ', ...cite('openstax-bl'), '.'] : ['Na⁺ comes from a strong base and Cl⁻ from a strong acid. The conjugate base of a strong acid, and the conjugate acid of a strong base, are so weak that they barely react with water ', ...cite('openstax-strength'), ': the solution stays neutral, pH = 7.00 at 25 °C ', ...cite('openstax-bl'), '.'])), exactStep(R));
  } else if (R.type === 'weak-acid' || R.type === 'weak-base') steps.append(...weakSteps(R, r, C, spectNote));
  else if (R.type === 'amphiprotic') steps.append(...amphiSteps(R, r, spectNote));

  // distribution of forms
  if (R.sol.families.length) {
    const f = R.sol.families[0];
    const rows = speciesAt(R.sol, ex).filter((x) => x.fam === f.fam);
    out.append(h('h3', { id: 'ph-dist' }, t('ph.dist')), p(h('span', { class: 'why' }, t('ph.distNote'))), distBars(rows));
  }
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function waterNote(C) {
  if (C >= 1e-6) return null;
  return p(h('span', { class: 'why' }, fr() ? 'À cette dilution, les ions apportés par l’eau elle-même (10⁻⁷ mol/L dans l’eau pure) ne sont plus négligeables : seule la valeur exacte en tient compte.' : 'At this dilution, the ions from water itself (10⁻⁷ mol/L in pure water) are no longer negligible: only the exact value counts them.'));
}
function exactStep(R, extra = null) {
  let d = R.pHText === null ? null : Math.round((R.exact.pH - R.pHText) * 1000) / 1000;
  if (d === 0) d = 0; // no "−0.000"
  return step(t('st.exact'),
    p(fr() ? ['Sans approximation : on résout l’électroneutralité, [H₃O⁺] + [cations] = [OH⁻] + [anions], en comptant chaque forme à partir de ses Ka et l’autoprotolyse de l’eau (Kw). C’est notre calcul ; il ne néglige que les écarts à la solution idéale.'] : ['Without approximations: we solve the charge balance, [H₃O⁺] + [cations] = [OH⁻] + [anions], counting every form from its Ka values and water’s own ionization (Kw). This is our own calculation; it only neglects departures from an ideal solution.']),
    eqBlock('pH = ', h('strong', {}, fixed(R.exact.pH, lang(), 3)), d === null ? '' : h('span', { class: 'muted' }, fr() ? ` (écart avec la méthode du manuel : ${fixed(d, 'fr', 3)})` : ` (difference from the textbook route: ${fixed(d, 'en', 3)})`)),
    extra);
}

function weakSteps(R, r, C, spectNote) {
  const f = R.fam;
  const lg = lang();
  const isAcid = R.type === 'weak-acid';
  const HA = isAcid ? f.forms[0] : f.forms[f.forms.length - 2];
  const A = isAcid ? f.forms[1] : f.forms[f.forms.length - 1];
  const n = f.Ka.length;
  const out = [];
  // 1. equation
  out.push(step(t('st.equation'),
    isAcid ? pairEq(HA, 'H2O', 'H3O+', A) : pairEq('H2O', A, HA, 'OH-'),
    spectNote));
  // 2. constant
  const KaOfPair = isAcid ? f.Ka[0] : f.Ka[n - 1];
  const kParts = [];
  if (isAcid) {
    kParts.push(eqBlock('Ka = ', frac([conc('H3O+'), conc(A)], conc(HA)), ' = ', K(R.K)), p(fr() ? ['Valeur de Ka ', f.kaFromKb ? ['calculée à partir du Kb de ', sp(A), ' : Ka = Kw / Kb '] : 'lue dans la table ', ...kSource(f, f.kaFromKb ? 'kw' : 'ka'), '. pKa = −log Ka = ', fixed(pKa(R.K), lg, 2), '.'] : [f.kaFromKb ? ['Ka calculated from the Kb of ', sp(A), ': Ka = Kw / Kb '] : 'Ka from the table ', ...kSource(f, f.kaFromKb ? 'kw' : 'ka'), '. pKa = −log Ka = ', fixed(pKa(R.K), lg, 2), '.']));
  } else {
    kParts.push(eqBlock('Kb = ', frac([conc(HA), conc('OH-')], conc(A)), ' = ', K(R.K)));
    if (f.kaFromKb) kParts.push(p(fr() ? ['Kb lu dans la table ', ...cite('openstax-kb'), '. Pour l’acide conjugué, ', sp(HA), ' : Ka = Kw / Kb = ', K(KaOfPair), ', pKa = ', fixed(pKa(KaOfPair), lg, 2), '.'] : ['Kb from the table ', ...cite('openstax-kb'), '. For the conjugate acid, ', sp(HA), ': Ka = Kw / Kb = ', K(KaOfPair), ', pKa = ', fixed(pKa(KaOfPair), lg, 2), '.']));
    else kParts.push(p(fr() ? ['Kb se déduit du Ka de l’acide conjugué ', sp(HA), ' (', K(KaOfPair), ' ', ...cite('openstax-ka'), ') : Kb = Kw / Ka, car Ka × Kb = Kw pour un couple ', ...cite('openstax-strength'), '.'] : ['Kb follows from the Ka of the conjugate acid ', sp(HA), ' (', K(KaOfPair), ' ', ...cite('openstax-ka'), '): Kb = Kw / Ka, since Ka × Kb = Kw for a conjugate pair ', ...cite('openstax-strength'), '.']));
  }
  out.push(step(t('st.constant'), ...kParts));
  // 2b. several protons
  if (R.poly) {
    const ratioTxt = fmtn(R.ratio, lg, R.ratio >= 100 ? 0 : 1);
    const k1 = isAcid ? 'Ka1' : 'Kb1', k2 = isAcid ? 'Ka2' : 'Kb2';
    const v2 = isAcid ? f.Ka[1] : KW / f.Ka[n - 2];
    out.push(step(t('st.poly'),
      p(fr() ? [`${k1} = `, K(R.K), `, ${k2} = `, K(v2), ` : ${k1} / ${k2} = ${ratioTxt}. `, R.polyOk ? 'Quand le premier équilibre l’emporte d’un facteur 20 au moins, on peut le traiter seul ' : 'Ce rapport est inférieur à 20 : la deuxième étape compte aussi, et la méthode à un seul équilibre n’est qu’une estimation ', ...cite('openstax-polyprotic'), isAcid ? '.' : ' (règle donnée pour les acides ; nous l’appliquons de même aux deux étapes de la base).'] : [`${k1} = `, K(R.K), `, ${k2} = `, K(v2), `: ${k1} / ${k2} = ${ratioTxt}. `, R.polyOk ? 'When the first equilibrium wins by a factor of at least 20, it can be treated alone ' : 'This ratio is below 20: the second step matters too, and the one-equilibrium route is only an estimate ', ...cite('openstax-polyprotic'), isAcid ? '.' : ' (a rule stated for acids; we apply it the same way to the two steps of the base).'])));
  }
  // 3. ICE
  const x = 'x';
  const cols = isAcid ? [HA, 'H3O+', A] : [A, HA, 'OH-'];
  const row = (label, cells) => h('tr', {}, h('th', { scope: 'row' }, label), ...cells.map((c) => h('td', { class: 'v' }, c)));
  const Cs = fixed(C, lg, C < 0.01 ? 4 : 3);
  out.push(step(t('st.ice'),
    h('div', { class: 'table-wrap' }, h('table', { class: 'kv ice' },
      h('thead', {}, h('tr', {}, h('th', {}, ''), ...cols.map((c) => h('th', { class: 'v' }, '[', sp(c), ']')))),
      h('tbody', {},
        row(t('initial'), [Cs, isAcid ? '≈ 0' : '0', isAcid ? '0' : '≈ 0']),
        row(t('change'), [`−${x}`, `+${x}`, `+${x}`]),
        row(t('equil'), [`${Cs} − ${x}`, x, x])))),
    p(h('span', { class: 'why' }, fr() ? ['Les ', isAcid ? 'ions H₃O⁺' : 'ions OH⁻', ' venus de l’eau elle-même (10⁻⁷ mol/L) sont négligés au départ.'] : ['The ', isAcid ? 'H₃O⁺' : 'OH⁻', ' from water itself (10⁻⁷ mol/L) is neglected at the start.']))));
  // 4. solve with x small
  const kname = isAcid ? 'Ka' : 'Kb';
  out.push(step(t('st.solve'),
    eqBlock(`${kname} = `, frac('x²', `${Cs} − x`), ' ≈ ', frac('x²', Cs)),
    eqBlock(`x ≈ √(${kname} × C) = `, mol(R.ap.xSmall))));
  // 5. check
  const pctTxt = `${fmtn(R.ap.pct, lg, 1)} %`;
  out.push(step(t('st.check'),
    p(fr() ? ['x / C = ', h('strong', {}, pctTxt), R.ap.valid ? ' : moins de 5 %, l’approximation tient ' : ' : plus de 5 %, l’approximation ne tient pas ', ...cite('openstax-strength'), '.'] : ['x / C = ', h('strong', {}, pctTxt), R.ap.valid ? ': under 5 %, the approximation holds ' : ': over 5 %, the approximation fails ', ...cite('openstax-strength'), '.']),
    R.ap.valid ? null : [p(fr() ? 'On résout donc l’équation du second degré x² + K·x − K·C = 0 :' : 'So we solve the quadratic x² + K·x − K·C = 0:'), eqBlock('x = ', frac(`−${kname} + √(${kname}² + 4 ${kname} C)`, '2'), ' = ', mol(R.ap.xQuad))]));
  // 6. pH
  out.push(step(t('st.ph'),
    isAcid ? eqBlock('[H₃O⁺] = x = ', mol(R.x), ' → pH = −log [H₃O⁺] = ', h('strong', {}, ph2(R.pHText)))
      : [eqBlock('[OH⁻] = x = ', mol(R.x), ' → pOH = ', ph2(R.pOH)), eqBlock('pH = ', fixed(PKW, lg, 2), ' − pOH = ', h('strong', {}, ph2(R.pHText))), p(h('span', { class: 'why' }, fr() ? ['pH + pOH = pKw = 14,00 à 25 °C ', ...cite('openstax-bl'), '.'] : ['pH + pOH = pKw = 14.00 at 25 °C ', ...cite('openstax-bl'), '.']))]));
  out.push(exactStep(R, waterNote(R.x * 10)));
  return out;
}

function amphiSteps(R, r, spectNote) {
  const f = R.fam, j = R.j, lg = lang();
  const X = f.forms[j];
  const giveWins = R.KaGive > R.KbTake;
  return [
    step(t('st.two'),
      p(fr() ? [sp(X), ' est amphotère : il peut céder un proton ou en capter un ', ...cite('openstax-bl'), '.'] : [sp(X), ' is amphiprotic: it can give a proton or take one ', ...cite('openstax-bl'), '.']),
      pairEq(X, 'H2O', 'H3O+', f.forms[j + 1]),
      eqBlock('Ka = ', K(R.KaGive), ' ', ...cite('openstax-ka')),
      pairEq('H2O', X, f.forms[j - 1], 'OH-'),
      eqBlock('Kb = Kw / Ka(', sp(f.forms[j - 1]), ') = ', fixed(KW * 1e14, lg, 1), ' × 10⁻¹⁴ / ', K(f.Ka[j - 1]), ' = ', K(R.KbTake)),
      spectNote,
      p(fr() ? [giveWins ? 'Ka > Kb : il cède plus de protons qu’il n’en capte, la solution est acide. ' : 'Kb > Ka : il capte plus de protons qu’il n’en cède, la solution est basique. ', 'Les deux équilibres se compensent en partie ; la méthode à un seul équilibre ne s’applique pas, nous donnons directement la valeur exacte.'] : [giveWins ? 'Ka > Kb: it gives away more protons than it takes, the solution is acidic. ' : 'Kb > Ka: it takes more protons than it gives, the solution is basic. ', 'The two equilibria partly cancel; the one-equilibrium route does not apply, so we give the exact value directly.'])),
    exactStep(R)];
}

// ------------------------------------------------------------ section 2: buffer
function renderBuffer(out) {
  out.replaceChildren();
  const [fid, js] = state.bp.split(':');
  const f = famById.get(fid), j = Number(js);
  const Ca = num(state.ca), Cb = num(state.cb), V = num(state.bv);
  if (!okC(Ca) || !okC(Cb) || !okV(V)) { out.append(h('p', { class: 'err', role: 'alert' }, t('badC'))); return; }
  const add = state.ba === 'none' ? null : { kind: state.ba, C: num(state.bac), V: num(state.bav) };
  if (add && (!okC(add.C) || !okV(add.V))) { out.append(h('p', { class: 'err', role: 'alert' }, t('badC'))); return; }
  const B = buffer({ fam: f, j, Ca, Cb, V, add });
  const lg = lang();
  const HA = f.forms[j], A = f.forms[j + 1];
  const b0 = B.before;
  out.append(h('p', { class: 'hero', id: 'buf-value' }, `pH ${ph2(b0.pHHH)}`, h('small', {}, 'Henderson–Hasselbalch')),
    h('p', { class: 'muted' }, fr() ? 'Valeur exacte : ' : 'Exact value: ', h('strong', {}, `pH ${ph2(b0.exact.pH)}`)));
  if (B.after) {
    const a = B.after;
    out.append(h('p', { class: 'hero small-hero', id: 'buf-after' }, `→ pH ${ph2(a.exact.pH)}`, h('small', {}, t('buf.after'))));
  }
  const steps = h('ol', { class: 'steps', id: 'buf-steps' });
  out.append(steps);
  steps.append(step(fr() ? 'Le couple' : 'The pair',
    pairEq(HA, 'H2O', 'H3O+', A),
    p('Ka = ', K(B.Ka), ' ', ...(f.kaFromKb ? [...cite('openstax-kb'), ...cite('openstax-bl')] : cite('openstax-ka')), ' · pKa = ', fixed(B.pKa, lg, 2), f.kaFromKb ? (fr() ? ' (Ka = Kw / Kb)' : ' (Ka = Kw / Kb)') : '')));
  const hhBlock = (pk, cb, ca, res) => eqBlock('pH = pKa + log ', frac(conc(A), conc(HA)), ' = ', fixed(pk, lg, 2), ' + log ', frac(fixed(cb, lg, 3), fixed(ca, lg, 3)), ' = ', h('strong', {}, ph2(res)));
  steps.append(step('Henderson–Hasselbalch',
    hhBlock(B.pKa, Cb, Ca, b0.pHHH),
    p(h('span', { class: 'why' }, fr() ? ['Valable si l’hypothèse « x petit » tient : les ions H₃O⁺ ou OH⁻ formés doivent rester petits devant les deux concentrations ', ...cite('openstax-buffer'), '.'] : ['Valid when the “x is small” assumption holds: the H₃O⁺ or OH⁻ formed must stay small next to both concentrations ', ...cite('openstax-buffer'), '.'])),
    validity(b0.hhValid)));
  steps.append(exactStep({ exact: b0.exact, pHText: b0.pHHH }));
  if (B.after) {
    const a = B.after;
    const isBase = state.ba === 'base';
    const added = isBase ? 'OH-' : 'H3O+';
    const consumed = isBase ? HA : A;
    const formed = isBase ? A : HA;
    steps.append(step(fr() ? 'L’ajout réagit en totalité' : 'The addition reacts completely',
      p(fr() ? ['Un acide ou une base forte ajouté au tampon réagit entièrement avec le partenaire qui lui fait face ', ...cite('openstax-buffer'), ' :'] : ['A strong acid or base added to the buffer reacts completely with the partner that faces it ', ...cite('openstax-buffer'), ':']),
      eqBlock(sp(added), ' + ', sp(consumed), ' → ', sp(formed), ' + ', sp('H2O'), isBase ? '' : ''),
      h('div', { class: 'table-wrap' }, h('table', { class: 'kv' },
        h('thead', {}, h('tr', {}, h('th', {}, ''), h('th', { class: 'v' }, sp(HA)), h('th', { class: 'v' }, sp(A)), h('th', { class: 'v' }, sp(added)))),
        h('tbody', {},
          h('tr', {}, h('th', { scope: 'row' }, fr() ? 'avant (mmol)' : 'before (mmol)'), h('td', { class: 'v' }, fmtn(a.nA, lg, 3)), h('td', { class: 'v' }, fmtn(a.nB, lg, 3)), h('td', { class: 'v' }, fmtn(a.nAdd, lg, 3))),
          h('tr', {}, h('th', { scope: 'row' }, fr() ? 'après (mmol)' : 'after (mmol)'), h('td', { class: 'v' }, fmtn(Math.max(0, a.a), lg, 3)), h('td', { class: 'v' }, fmtn(Math.max(0, a.b), lg, 3)), h('td', { class: 'v' }, fmtn(a.excess, lg, 3)))))),
      p(fr() ? ['Volume total : ', fmtn(a.Vt, lg, 1), ' mL.'] : ['Total volume: ', fmtn(a.Vt, lg, 1), ' mL.'])));
    if (a.pHHH !== null) {
      steps.append(step(fr() ? 'Nouveau pH' : 'New pH',
        hhBlock(B.pKa, a.Cb, a.Ca, a.pHHH), validity(a.hhValid),
        eqBlock(fr() ? 'Valeur exacte : pH = ' : 'Exact: pH = ', h('strong', {}, ph2(a.exact.pH)), fr() ? ` (variation ${fixed(a.dpH, lg, 2)})` : ` (change ${fixed(a.dpH, lg, 2)})`)));
    } else {
      steps.append(step(fr() ? 'Tampon épuisé' : 'Buffer used up',
        p(fr() ? ['L’ajout dépasse ce que le tampon peut absorber : ', fmtn(a.excess, lg, 3), ' mmol de ', sp(added), ' restent en excès et fixent le pH.'] : ['The addition is more than the buffer can absorb: ', fmtn(a.excess, lg, 3), ' mmol of ', sp(added), ' are left over and set the pH.']),
        eqBlock(fr() ? 'Valeur exacte : pH = ' : 'Exact: pH = ', h('strong', {}, ph2(a.exact.pH)))));
    }
    steps.append(step(fr() ? 'Sans tampon' : 'Without a buffer',
      p(fr() ? ['Le même ajout dans ', fmtn(V, lg, 0), ' mL d’une solution non tamponnée de même pH (', ph2(a.unbuffered.pH0), ', un acide ou une base forte très dilué) donnerait pH ', h('strong', {}, ph2(a.unbuffered.pH)), ' : c’est la comparaison de l’exemple 14.20 ', ...cite('openstax-buffer'), '.'] : ['The same addition to ', fmtn(V, lg, 0), ' mL of an unbuffered solution with the same pH (', ph2(a.unbuffered.pH0), ', a very dilute strong acid or base) would give pH ', h('strong', {}, ph2(a.unbuffered.pH)), ': the comparison of Example 14.20 ', ...cite('openstax-buffer'), '.'])));
  }
}
function validity(v) {
  const ok = v.small && v.inRange;
  const parts = [];
  parts.push(v.small ? (fr() ? '« x petit » : oui ([H₃O⁺] ou [OH⁻] < 5 % de la plus petite concentration). ' : '“x is small”: yes ([H₃O⁺] or [OH⁻] < 5 % of the smaller concentration). ') : (fr() ? '« x petit » : non, les ions formés ne sont pas négligeables ; préférez la valeur exacte. ' : '“x is small”: no, the ions formed are not negligible; trust the exact value. '));
  parts.push(v.inRange ? (fr() ? 'Rapport base/acide entre 0,1 et 10 : le tampon est efficace.' : 'Base/acid ratio between 0.1 and 10: an effective buffer.') : (fr() ? ['Un partenaire est sous le dixième de l’autre : le tampon a perdu l’essentiel de son utilité ', ...cite('openstax-buffer'), '.'] : ['One partner is below a tenth of the other: the buffer has lost most of its use ', ...cite('openstax-buffer'), '.']));
  return h('p', { class: ok ? 'note ok-note' : 'note' }, ...parts.flat());
}

// ------------------------------------------------------------ section 3: titration
let chartApi = null;
let current = null;
function renderTitration(out, { keepV = true } = {}) {
  out.replaceChildren();
  const r = reagentById.get(state.ta);
  const Ca = num(state.tca), Va = num(state.tva), Ct = num(state.tct);
  if (!okC(Ca) || !okC(Ct) || !okV(Va)) { out.append(h('p', { class: 'err', role: 'alert' }, t('badC'))); return; }
  const T0 = titration({ analyte: r, Ca, Va, titrant: state.tt, Ct });
  current = T0;
  if (!T0.steps.length) { out.append(h('p', { class: 'note', id: 't-read' }, t('t.none'))); return; }
  const lg = lang();
  const tName = state.tt === 'base' ? 'NaOH' : 'HCl';
  const host = h('div', { class: 'tchart', id: 't-chart' });
  const slider = h('input', { type: 'range', id: 't-slider', min: 0, max: T0.vmax.toFixed(2), step: niceSliderStep(T0.vmax), value: '0', 'aria-label': t('t.slider') });
  const sliderOut = h('output', { for: 't-slider', class: 'math' });
  const read = h('div', { id: 't-read', class: 'note', 'aria-live': 'polite' });
  const vis = T0.eqs.filter((e) => e.visible);
  const desc = fr()
    ? `pH en fonction du volume de ${tName} versé, de 0 à ${fmtn(T0.vmax, lg, 1)} mL. ${vis.map((e) => `Équivalence à ${fmtn(e.v, lg, 2)} mL, pH ${ph2(e.pH)}.`).join(' ')} ${T0.halves.map((x) => `Demi-équivalence à ${fmtn(x.v, lg, 2)} mL, pH ${ph2(x.pH)}.`).join(' ')}`
    : `pH against the volume of ${tName} added, from 0 to ${fmtn(T0.vmax, lg, 1)} mL. ${vis.map((e) => `Equivalence at ${fmtn(e.v, lg, 2)} mL, pH ${ph2(e.pH)}.`).join(' ')} ${T0.halves.map((x) => `Half-equivalence at ${fmtn(x.v, lg, 2)} mL, pH ${ph2(x.pH)}.`).join(' ')}`;
  out.append(host,
    h('p', { class: 'legend-line small muted' }, t('t.legend')),
    h('label', { for: 't-slider', class: 'field-label' }, t('t.slider'), fr() ? ' :' : ':', sliderOut),
    slider, read);
  const update = (v, fromChart = false) => {
    const res = chartApi.setV(v, { showTip: fromChart });
    sliderOut.textContent = ` ${fixed(res.v, lg, 2)} mL · pH ${ph2(res.pH)}`;
    if (!fromChart) slider.value = String(res.v);
    state.tv = res.v.toFixed(2);
    writeHash();
    describePoint(read, T0, res.v, res.pH, tName);
  };
  chartApi = drawTitration(host, T0, {
    fmt: (v, d) => fmtn(v, lg, d),
    title: `${t('t.h')}: ${speciesUnicode(r.formula)} + ${tName}`,
    desc,
    xTitle: fr() ? `Volume de ${tName} versé (mL)` : `Volume of ${tName} added (mL)`,
    yTitle: 'pH',
    eqLabel: (e, compact) => (compact ? `pH ${ph2(e.pH)}` : fr() ? `équivalence · pH ${ph2(e.pH)}` : `equivalence · pH ${ph2(e.pH)}`),
    // the label says pKa only where the curve really passes through it
    halfLabel: (x, compact) => (Math.abs(x.pH - x.pKa) <= 0.05 ? `pKa ${fixed(x.pKa, lg, 2)}` : compact ? `pH ${ph2(x.pH)}` : `pH ${ph2(x.pH)} · pKa ${fixed(x.pKa, lg, 2)}`),
    tipLines: (v, pH) => [`pH ${ph2(pH)}`, `${fixed(v, lg, 2)} mL ${tName}`],
    onPick: (v) => update(v, true),
  });
  slider.addEventListener('input', () => update(Number(slider.value)));
  const v0 = keepV ? Math.min(T0.vmax, Math.max(0, num(state.tv) || 0)) : T0.dV / 2;
  slider.value = String(v0);
  update(v0);

  // invisible equivalence points
  const hidden = T0.eqs.filter((e) => !e.visible);
  for (const e of hidden) {
    const next = T0.steps[e.k + 1];
    const why = next
      // the next acid is strong enough to start reacting before this step ends
      ? (fr() ? ['l’étape suivante commence avant que celle-ci finisse : ', sp(state.tt === 'base' ? next.acid : next.base), state.tt === 'base' ? ' est un acide assez fort pour réagir déjà' : ' est une base assez forte pour réagir déjà'] : ['the next step starts before this one ends: ', sp(state.tt === 'base' ? next.acid : next.base), state.tt === 'base' ? ' is a strong enough acid to react already' : ' is a strong enough base to react already'])
      : (fr() ? [sp(state.tt === 'base' ? e.step.acid : e.step.base), state.tt === 'base' ? ' est un acide trop faible, à peine plus fort que l’eau' : ' est une base trop faible, à peine plus forte que l’eau'] : [sp(state.tt === 'base' ? e.step.acid : e.step.base), state.tt === 'base' ? ' is too weak an acid, barely stronger than water' : ' is too weak a base, barely stronger than water']);
    out.append(p(h('span', { class: 'why' }, fr() ? [`Pas de saut de pH net à ${fmtn(e.v, lg, 2)} mL : `, why, '. (Notre critère : moins d’une unité de pH de saut à ±5 % de ce volume.)'] : [`No clear pH jump at ${fmtn(e.v, lg, 2)} mL: `, why, '. (Our criterion: a jump of less than one pH unit within ±5 % of that volume.)'])));
  }
  // key points
  if (T0.keyPoints) out.append(keyTable(T0, tName));
  else out.append(p(h('span', { class: 'why' }, fr() ? 'Plusieurs étapes : la méthode du manuel point par point (exemples 14.21 et 14.22) ne vaut que pour un seul proton échangé ; la courbe vient du calcul exact.' : 'Several steps: the textbook point-by-point route (Examples 14.21 and 14.22) covers a single proton; the curve comes from the exact calculation.'), ' ', ...cite('openstax-titration')));
  // data table
  const vols = [];
  const stepV = T0.vmax / 20;
  for (let i = 0; i <= 20; i++) vols.push(i * stepV);
  for (const e of T0.eqs) vols.push(e.v);
  for (const x of T0.halves) vols.push(x.v);
  const uniq = [...new Set(vols.map((v) => +v.toFixed(3)))].sort((a, b) => a - b);
  out.append(h('details', { class: 'more', id: 't-table' }, h('summary', {}, t('t.table')),
    h('div', { class: 'table-wrap' }, h('table', { class: 'kv' },
      h('thead', {}, h('tr', {}, h('th', { class: 'v' }, t('t.volume')), h('th', { class: 'v' }, 'pH'))),
      h('tbody', {}, ...uniq.map((v) => h('tr', {}, h('td', { class: 'v' }, fixed(v, lg, 2)), h('td', { class: 'v' }, ph2(T0.pHAt(v))))))))));
}
function niceSliderStep(vmax) { return vmax > 200 ? '0.5' : vmax > 40 ? '0.05' : '0.01'; }

function keyTable(T0, tName) {
  const lg = lang();
  const M = {
    'strong-acid': L('strong acid: [H₃O⁺] = C', 'acide fort : [H₃O⁺] = C'),
    'strong-base': L('strong base: [OH⁻] = C', 'base forte : [OH⁻] = C'),
    'x-small': L('weak: x = √(K·C), x small', 'faible : x = √(K·C), x petit'),
    quadratic: L('weak: quadratic (x not small)', 'faible : second degré (x non négligeable)'),
    'excess-analyte': L('what is left of the analyte', 'ce qui reste du réactif titré'),
    hh: L('Henderson–Hasselbalch: pH = pKa', 'Henderson–Hasselbalch : pH = pKa'),
    neutral: L('neutral salt: pH = 7.00', 'sel neutre : pH = 7,00'),
    'conj-base': L('the conjugate base reacts with water (Kb)', 'la base conjuguée réagit avec l’eau (Kb)'),
    'conj-acid': L('the conjugate acid reacts with water (Ka)', 'l’acide conjugué réagit avec l’eau (Ka)'),
    'excess-titrant': L(`excess ${tName} only`, `excès de ${tName} seul`),
  };
  const P = { start: L('start', 'départ'), half: L('half-equivalence', 'demi-équivalence'), eq: L('equivalence', 'équivalence'), excess: L('1.5 × equivalence', '1,5 × équivalence') };
  const half = T0.keyPoints.find((r) => r.id === 'half');
  return h('div', { id: 't-keys' }, h('h3', {}, t('t.keys'), ' ', ...cite('openstax-titration')),
    h('div', { class: 'table-wrap' }, h('table', { class: 'kv' },
      h('thead', {}, h('tr', {}, h('th', {}, t('t.point')), h('th', { class: 'v' }, t('t.volume')), h('th', {}, t('t.method')), h('th', { class: 'v' }, t('t.textbook')), h('th', { class: 'v' }, t('t.exact')))),
      h('tbody', {}, ...T0.keyPoints.map((r) => h('tr', {}, h('td', {}, nm(P[r.id])), h('td', { class: 'v' }, fixed(r.v, lg, 2)), h('td', {}, nm(M[r.method])), h('td', { class: 'v' }, ph2(r.pH)), h('td', { class: 'v' }, ph2(r.exact))))))),
    p(h('span', { class: 'why' }, fr()
      ? ['Le manuel arrondit à chaque étape et néglige ce qui est petit ; le calcul exact compte tout. ', half && half.method === 'hh' ? `À la demi-équivalence, la formule donne pH = pKa = ${fixed(half.pH, 'fr', 3)}, le calcul exact ${fixed(half.exact, 'fr', 3)} : l’acide a lui-même un peu réagi avec l’eau, ce qui déplace légèrement le rapport base/acide. ` : '', 'Les écarts restent de l’ordre du centième.']
      : ['The textbook rounds at each step and drops what is small; the exact calculation keeps everything. ', half && half.method === 'hh' ? `At half-equivalence the formula gives pH = pKa = ${fixed(half.pH, 'en', 3)}, the exact calculation ${fixed(half.exact, 'en', 3)}: the acid itself has reacted a little with water, which shifts the base/acid ratio slightly. ` : '', 'The differences stay around a hundredth.'])));
}

function describePoint(box, T0, v, pH, tName) {
  const lg = lang();
  const rg = region(T0, v);
  const parts = [];
  const pc = (x) => `${fmtn(100 * x, lg, 0)} %`;
  if (rg.id === 'start') parts.push(fr() ? 'Rien n’a encore été versé : le bécher ne contient que la solution de départ.' : 'Nothing added yet: the flask holds the starting solution only.');
  else if (rg.id === 'strong') parts.push(fr() ? [`Neutralisation en cours (${pc(rg.frac)} de cette étape) : `, sp(state.tt === 'base' ? 'H3O+' : 'OH-'), ' + ', sp(state.tt === 'base' ? 'OH-' : 'H3O+'), ' → 2 ', sp('H2O'), '. Le pH bouge peu jusqu’à l’équivalence.'] : [`Neutralisation under way (${pc(rg.frac)} of this step): `, sp(state.tt === 'base' ? 'H3O+' : 'OH-'), ' + ', sp(state.tt === 'base' ? 'OH-' : 'H3O+'), ' → 2 ', sp('H2O'), '. The pH changes little until equivalence.']);
  else if (rg.id === 'buffer' || rg.id === 'between') {
    const s = rg.step;
    const head = fr() ? [`${pc(rg.frac)} de `, sp(state.tt === 'base' ? s.acid : s.base), ' transformé en ', sp(state.tt === 'base' ? s.base : s.acid), '. '] : [`${pc(rg.frac)} of `, sp(state.tt === 'base' ? s.acid : s.base), ' turned into ', sp(state.tt === 'base' ? s.base : s.acid), '. '];
    parts.push(head);
    if (rg.id === 'buffer') parts.push(fr() ? ['Zone tampon : les deux formes du couple sont présentes, le pH varie lentement. À la demi-équivalence (', fixed(rg.half.v, lg, 2), ' mL), pH ≈ pKa = ', fixed(rg.half.pKa, lg, 2), ' ', ...cite('openstax-titration'), '.'] : ['Buffer region: both forms of the pair are present, the pH changes slowly. At half-equivalence (', fixed(rg.half.v, lg, 2), ' mL), pH ≈ pKa = ', fixed(rg.half.pKa, lg, 2), ' ', ...cite('openstax-titration'), '.']);
    else parts.push(fr() ? 'Hors de la zone tampon : une des deux formes est encore sous le dixième de l’autre.' : 'Outside the buffer region: one of the two forms is still below a tenth of the other.');
    if (rg.half && Math.abs(rg.half.pH - rg.half.pKa) > 0.05) parts.push(fr() ? [' Ici, la courbe passe à pH ', ph2(rg.half.pH), ' à la demi-équivalence, pas à pKa : l’acide de ce couple est assez fort (ou assez faible) pour réagir lui-même avec l’eau, et l’hypothèse « x petit » ne tient plus.'] : [' Here the curve passes pH ', ph2(rg.half.pH), ' at half-equivalence, not pKa: the acid of this pair is strong (or weak) enough to react with water itself, and the “x is small” assumption no longer holds.']);
  } else if (rg.id === 'equivalence') {
    const e = rg.eq;
    parts.push(fr() ? [`Équivalence${T0.eqs.length > 1 ? ` n° ${e.k + 1}` : ''} : on a versé exactement autant de ${tName} qu’il fallait pour `, state.tt === 'base' ? 'retirer ' : 'apporter ', e.k + 1 > 1 ? `${e.k + 1} protons` : 'un proton', ' par unité de formule. '] : [`Equivalence${T0.eqs.length > 1 ? ` no. ${e.k + 1}` : ''}: exactly enough ${tName} to `, state.tt === 'base' ? 'remove ' : 'supply ', e.k + 1 > 1 ? `${e.k + 1} protons` : 'one proton', ' per formula unit. ']);
    if (e.last && e.step.kind === 'weak') parts.push(fr() ? ['Il reste ', sp(state.tt === 'base' ? e.step.base : e.step.acid), ', qui réagit avec l’eau : pH ', pH > 7 ? '> 7.' : '< 7.'] : ['What is left is ', sp(state.tt === 'base' ? e.step.base : e.step.acid), ', which reacts with water: pH ', pH > 7 ? '> 7.' : '< 7.']);
    else if (e.last) parts.push(fr() ? 'Il ne reste qu’un sel neutre : pH 7.' : 'Only a neutral salt is left: pH 7.');
    if (!e.visible) parts.push(fr() ? ' Pas de saut visible à cette équivalence.' : ' No visible jump at this equivalence point.');
  } else if (rg.id === 'excess') parts.push(fr() ? [`Au-delà de l’équivalence : le ${tName} versé en trop fixe le pH.`] : [`Past equivalence: the extra ${tName} sets the pH.`]);
  // what is in the flask
  const sol = T0.build(v);
  const sps = speciesAt(sol, pH).filter((x) => x.c > 1e-4 * Math.max(...sol.families.map((f) => f.C)));
  sps.sort((a, b) => b.c - a.c);
  const extra = [];
  const hh = 10 ** -pH, oh = KW / hh;
  if (hh > 1e-6) extra.push({ formula: 'H3O+', c: hh });
  if (oh > 1e-6) extra.push({ formula: 'OH-', c: oh });
  const all = [...sps, ...extra].sort((a, b) => b.c - a.c).slice(0, 5);
  box.replaceChildren(
    h('p', {}, h('strong', {}, `${fixed(v, lg, 2)} mL · pH ${ph2(pH)}`), ' — ', ...parts.flat()),
    h('p', { class: 'small' }, t('t.inflask'), fr() ? ' : ' : ': ', ...all.flatMap((x, i) => [i ? ' · ' : '', sp(x.formula), ' ', h('span', { class: 'math' }, sci(x.c, lg, 2), ' mol/L')])));
}

// ------------------------------------------------------------ section 4: proton transfer
const SPECIAL_NAMES = {
  'H3O+': L('hydronium ion', 'ion oxonium'), H2O: L('water', 'eau'), 'OH-': L('hydroxide ion', 'ion hydroxyde'),
  'ClO4-': L('perchlorate ion', 'ion perchlorate'), 'Cl-': L('chloride ion', 'ion chlorure'), 'Br-': L('bromide ion', 'ion bromure'), 'I-': L('iodide ion', 'ion iodure'), 'NO3-': L('nitrate ion', 'ion nitrate'),
};
function spName(s) {
  if (s.fam) return nm(famById.get(s.fam).names[s.step]);
  if (s.strong) return nm(STRONG_ACIDS.find((a) => a.id === s.strong).name);
  return nm(SPECIAL_NAMES[s.formula]);
}
function renderPT(out) {
  out.replaceChildren();
  const list = speciesList();
  const A = list.find((s) => s.key === state.pa), B = list.find((s) => s.key === state.pb);
  const R = protonTransfer(A, B);
  const lg = lang();
  if (R.kind === 'invalid' || R.kind === 'same') { out.append(h('p', { class: 'note' }, fr() ? 'Choisissez deux espèces différentes.' : 'Pick two different species.')); return; }
  const { conjBase, conjAcid } = conjugates(A, B);
  out.append(pairEq(A.formula, B.formula, conjAcid, conjBase, { arrow: R.kind === 'strong' ? '→' : '⇌' }));
  if (R.kind === 'strong') out.append(p(fr() ? [sp(A.formula), ' est un acide fort : le transfert est total ', ...cite('openstax-strength'), '.'] : [sp(A.formula), ' is a strong acid: the transfer is complete ', ...cite('openstax-strength'), '.']));
  else if (R.kind === 'negligible' || R.kind === 'both-strong') out.append(p(fr() ? [sp(B.formula), ' est la base conjuguée d’un acide fort : elle ne capte pratiquement aucun proton ', ...cite('openstax-strength'), '.'] : [sp(B.formula), ' is the conjugate base of a strong acid: it takes practically no protons ', ...cite('openstax-strength'), '.']));
  else {
    const favoured = R.K > 1;
    out.append(
      eqBlock('K = ', frac(['Ka(', sp(A.formula), ')'], ['Ka(', sp(conjAcid), ')']), ' = ', frac(K(R.kaAcid), K(R.kaConj)), ' = ', h('strong', {}, K(R.K)), h('span', { class: 'muted' }, ` (log K = ${fixed(R.logK, lg, 1)})`)),
      p(h('strong', {}, favoured ? (fr() ? 'Les produits l’emportent : ' : 'Products favoured: ') : (fr() ? 'Les réactifs l’emportent : ' : 'Reactants favoured: ')),
        fr() ? [favoured ? sp(conjAcid) : sp(A.formula), ' est l’acide le plus faible des deux, c’est de son côté que l’équilibre penche.'] : [favoured ? sp(conjAcid) : sp(A.formula), ' is the weaker of the two acids, and the equilibrium lies on its side.']),
      p(h('span', { class: 'why' }, fr() ? ['Comme d’habitude, l’eau n’apparaît pas dans K : on prend Ka(H₃O⁺) = 1 et, pour l’eau qui cède un proton, Ka(H₂O) = Kw ; ainsi HA + H₂O redonne bien K = Ka, et B + H₂O redonne K = Kb ', ...cite('openstax-bl'), '.'] : ['As usual, water is left out of K: we take Ka(H₃O⁺) = 1 and, for water giving a proton, Ka(H₂O) = Kw; then HA + H₂O gives back K = Ka, and B + H₂O gives back K = Kb ', ...cite('openstax-bl'), '.'])));
  }
  out.append(p(h('span', { class: 'small muted' }, spName(A), ' + ', spName(B))));
}

// ------------------------------------------------------------ page
let main = null;

function render() {
  const lg = lang();
  // section 1
  const phSel = reagentSelect('ph-species', t('ph.species'), state.ph);
  const phC = numField('ph-c', t('ph.c'), 'c', 'mol/L', t('ph.cHint'));
  const phOut = h('div', { class: 'stack', 'aria-live': 'polite' });
  const card1 = h('section', { class: 'card', id: 'ph-card', 'aria-labelledby': 'ph-h' }, h('h2', { id: 'ph-h' }, t('ph.h')),
    h('div', { class: 'fields' }, phSel.wrap, phC.wrap), phOut);
  bind([[phSel.input, 'ph'], [phC.input, 'c', okC]], () => renderPH(phOut));
  // section 2
  const bpSel = plainSelect('buf-pair', t('buf.pair'), pairs().map((x) => [x.id, `${speciesUnicode(x.acid)} / ${speciesUnicode(x.base)} · pKa ${fixed(pKa(x.Ka), lg, 2)}`]), state.bp);
  const bca = numField('buf-ca', t('buf.ca'), 'ca', 'mol/L');
  const bcb = numField('buf-cb', t('buf.cb'), 'cb', 'mol/L');
  const bv = numField('buf-v', t('buf.v'), 'bv', 'mL');
  const ba = plainSelect('buf-add', t('buf.add'), [['none', t('buf.addNone')], ['base', t('buf.addBase')], ['acid', t('buf.addAcid')]], state.ba);
  const bac = numField('buf-addc', t('buf.addc'), 'bac', 'mol/L');
  const bav = numField('buf-addv', t('buf.addv'), 'bav', 'mL');
  const bOut = h('div', { class: 'stack', 'aria-live': 'polite' });
  const card2 = h('section', { class: 'card', id: 'buf-card', 'aria-labelledby': 'buf-h' }, h('h2', { id: 'buf-h' }, t('buf.h')), p(h('span', { class: 'muted' }, t('buf.lead'))),
    h('div', { class: 'fields' }, bpSel.wrap, bca.wrap, bcb.wrap, bv.wrap), h('div', { class: 'fields' }, ba.wrap, bac.wrap, bav.wrap), bOut);
  const addVis = () => { const on = state.ba !== 'none'; bac.wrap.hidden = !on; bav.wrap.hidden = !on; };
  addVis();
  bind([[bpSel.input, 'bp'], [bca.input, 'ca', okC], [bcb.input, 'cb', okC], [bv.input, 'bv', okV], [ba.input, 'ba'], [bac.input, 'bac', okC], [bav.input, 'bav', okV]], () => { addVis(); renderBuffer(bOut); });
  // section 3
  const taSel = reagentSelect('t-analyte', t('t.analyte'), state.ta, { filter: (r) => r.kind !== 'neutral' });
  const tca = numField('t-ca', t('t.ca'), 'tca', 'mol/L');
  const tva = numField('t-va', t('t.va'), 'tva', 'mL');
  const ttSel = plainSelect('t-titrant', t('t.titrant'), [['base', t('t.naoh')], ['acid', t('t.hcl')]], state.tt);
  const tcb = numField('t-cb', t('t.cb'), 'tct', 'mol/L');
  const tOut = h('div', { class: 'stack' });
  const card3 = h('section', { class: 'card', id: 't-card', 'aria-labelledby': 't-h' }, h('h2', { id: 't-h' }, t('t.h')), p(h('span', { class: 'muted' }, t('t.lead'))),
    h('div', { class: 'fields' }, taSel.wrap, tca.wrap, tva.wrap, ttSel.wrap, tcb.wrap), tOut);
  bind([[tca.input, 'tca', okC], [tva.input, 'tva', okV], [tcb.input, 'tct', okC]], () => renderTitration(tOut, { keepV: false }));
  // the analyte decides the natural titrant: acids with NaOH, bases with HCl
  taSel.input.addEventListener('change', () => {
    state.ta = taSel.input.value;
    const R = phRoute(state.ta, 0.1);
    state.tt = R.exact.pH < 7 ? 'base' : 'acid';
    ttSel.input.value = state.tt;
    writeHash(); renderTitration(tOut, { keepV: false });
  });
  ttSel.input.addEventListener('change', () => { state.tt = ttSel.input.value; writeHash(); renderTitration(tOut, { keepV: false }); });
  // section 4
  const list = speciesList();
  const lbl = (s) => `${speciesUnicode(s.formula)} · ${spName(s)}`;
  const paSel = plainSelect('pt-acid', t('pt.acid'), list.filter((s) => s.role !== 'base').map((s) => [s.key, lbl(s)]), state.pa);
  const pbSel = plainSelect('pt-base', t('pt.base'), list.filter((s) => s.role !== 'acid').map((s) => [s.key, lbl(s)]), state.pb);
  const ptOut = h('div', { class: 'stack', id: 'pt-result', 'aria-live': 'polite' });
  const card4 = h('section', { class: 'card', id: 'pt-card', 'aria-labelledby': 'pt-h' }, h('h2', { id: 'pt-h' }, t('pt.h')), p(h('span', { class: 'muted' }, t('pt.lead'))),
    h('div', { class: 'fields' }, paSel.wrap, pbSel.wrap), ptOut);
  bind([[paSel.input, 'pa'], [pbSel.input, 'pb']], () => renderPT(ptOut));
  // sources
  const card5 = h('section', { class: 'card sources', id: 'sources', 'aria-labelledby': 'src-h' }, h('h2', { id: 'src-h' }, t('sources')), sourceList(), h('p', { class: 'small muted' }, OPENSTAX_REF[lg]));

  main.replaceChildren(
    h('h1', {}, t('title')),
    h('p', { class: 'lead muted' }, t('lead')),
    h('p', { class: 'note lead' }, t('conditions')),
    card1, card2, card3, card4, card5);
  renderPH(phOut);
  renderBuffer(bOut);
  renderTitration(tOut);
  renderPT(ptOut);
}
export function mount(c) {
  ctx = c;
  main = c.panel;
  Object.assign(state, DEF);
  readHash();
  render();
}
export const route = () => mount(ctx);
export const refresh = render;
let resizeTimer = null, lastW = window.innerWidth;
window.addEventListener('resize', () => { if (Math.abs(window.innerWidth - lastW) < 40) return; lastW = window.innerWidth; clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { const box = document.querySelector('#t-card .stack'); if (box) renderTitration(box); }, 200); });
