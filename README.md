# outils-chimie

Chemistry tools for anyone learning chemistry: each one shows its reasoning
step by step and says where its numbers come from. French and English
(follows the browser language, with a switch), light and dark, works on
phones. One static page with three tabs: no backend, no build step, no
tracking. Every number and fact comes from a cited source, listed at the
bottom of each tab.

## Tools

- **Lewis** (tab `#lewis`, code in `site/lewis/`): type a formula or an ion (`H2O`,
  `NH4+`, `SO4^2-`, `SO4 2-`, `SO₄²⁻`, condensed formulas such as
  `CH3COOH`), or pick one of 71 species from a list. Gives the valence
  electron count, the skeleton, the single-bond stage, the multiple bonds,
  a formal-charge table, every resonance form (with the average bond
  order), why each other structure loses, the exceptions to the octet rule
  explained (odd electrons, electron-deficient B and Be, expanded octets,
  with the octet alternative where books disagree, O2 paramagnetism), the
  VSEPR shape around each inner atom with a sketch, and IUPAC oxidation
  states on the atoms. Formulas that fit several molecules (C2H6O, HNCO)
  offer the skeletons to choose from; ambiguous charges (`N3-`: nitride or
  azide?) are reported with the other reading one click away.
- **Redox (oxidation numbers)** (tab `#redox`, code in `site/redox/`): oxidation numbers shown above each element of
  the formula, with the rule behind each value (OpenStax 4.2 order:
  fluorine, groups 1 and 2, hydrogen, oxygen, halogens, the last element by
  difference); per-atom values where atoms of one element differ
  (thiosulfate +5/−1 as in IUPAC 2016, tetrathionate, Fe3O4, acetic acid);
  cases where the Pauling-based rules and the Allen-based IUPAC method
  disagree (NCl3, PH3, H3PO3) are shown both ways. Then two couples from a
  list of 66 (OpenStax Appendix L, LibreTexts P1 for five missing ones), or
  typed by hand, are balanced by the half-reaction method in acidic or
  basic solution: who is oxidised and who is reduced, each balancing step
  with its reason, the electron count, the sum, an atom and charge check,
  then E°cell, ΔG° and K, with a swap button when the reaction is not
  spontaneous.
- **Acid–base** (tab `#acidbase`, code in `site/acidbase/`): about 50 reagents in grouped lists
  (strong and weak acids and bases, salts), Ka and Kb from OpenStax
  Appendices H and I. pH by the textbook route (ICE table, "x is small",
  5 % check, quadratic, the factor-20 rule for polyprotic acids, sulfuric
  acid's second proton), then exactly from the charge balance, with the
  difference and the share of each form. Buffers with Henderson–Hasselbalch
  and an optional addition of NaOH or HCl (Example 14.20 style). A
  titration curve (strong, weak or polyprotic, titrated with NaOH or HCl)
  with buffer regions, equivalence and half-equivalence points, a slider
  and pointer reading of what the flask holds, and the four textbook points
  next to the exact values. Last, which way a proton transfer goes.

## One page, three tabs

The page opens on the Lewis tab. The URL hash holds the tab and that
tab's state, so a structure, a reaction or a titration can be shared as a
link:

```
#lewis?f=SO4%5E2-
#redox?sp=MnO4-&m=acid&ox=MnO4&red=Fe3
#redox?sp=Cu&m=acid&mode=own&o1=NO3-&o2=NO&r1=Cu%5E2%2B&r2=Cu
#acidbase?ph=HCl&c=0.01&ta=phosphoric
```

Each tab link remembers the state its tab was left in, Back and Forward
move between tabs, and the links between tools (“See its Lewis
structure”, “Oxidation numbers and redox reactions”) open the other tab. The
tab bar follows the ARIA tabs pattern: arrow keys move between tabs
(wrapping), Home and End go to the first and last, Tab goes into the
open panel; it stays at the top of the screen while a tool scrolls, and
on phones the three tabs share the width with 44 px targets. A tool's
code is loaded the first time its tab opens. Citations ([1], [2]...)
scroll to their source without changing the URL.

## How the Lewis engine works

`site/assets/chem/lewis.js` does not follow one path through the textbook
procedure; it tries everything and ranks it with the textbook rules:

1. count the valence electrons (charge included);
2. take the candidate skeletons (`skeleton.js`): a single centre (every
   possible central atom is tried), a chain written as a condensed formula,
   or a curated skeleton for species with several centres whose structure
   is known from the literature (thiosulfate, tetrathionate,
   peroxodisulfate, N2O4, oxalate, H3PO3); hydrogens are placed in every
   possible way;
3. for every skeleton and every choice of bond orders (1, 2 or 3 on each
   bond between heavy atoms), place the remaining electrons as the
   textbook does (outer atoms first, then inner atoms, then an expanded
   octet on a period-3+ atom, an odd electron on the least electronegative
   atom that lacks electrons);
4. drop impossible structures (more than 2 electrons on H, more than 8 on
   a period-2 atom);
5. rank with the OpenStax guidelines in order: complete octets (groups 2
   and 13 excepted), smallest formal charges, no like charges side by
   side, no expanded octet when an octet structure is as good, negative
   charges on the more electronegative atoms, least electronegative
   central atom;
6. equal best structures on one skeleton are the resonance forms; a tie
   between different skeletons means isomers.

This is why the Lewis tab can show the losing structures and the reason each
one loses. Limits: main-group elements only (transition metals, ionic
compounds and boranes are refused with an explanation), no rings, up to 24
atoms of which 10 heavy atoms.

## Run locally

Any static file server works. With Python:

```bash
python3 -m http.server 9427 --directory site
# open http://localhost:9427/   (or http://localhost:9427/#acidbase)
```

or with Docker (the same image as for deployment):

```bash
docker build -t outils-chimie .
docker run --rm -p 9428:8080 outils-chimie
# open http://localhost:9428/   (the container listens on $PORT, default 8080)
```

All links inside the site are relative, so the site also works from a
sub-path.

## Tests

```bash
npm test               # unit tests, plain Node (no dependencies)
npm i && npm run e2e   # browser checks with Playwright, BASE=http://localhost:9427 by default
```

- `tests/route.test.mjs`: the hash routes of the tabs (`#<tab>?<state>`),
  page anchors that are not routes, the keys of the tab bar.
- `tests/formula.test.mjs`: the formula parser (every way of writing a
  charge, ambiguous digits, error codes), Hill order, display.
- `tests/lewis.test.mjs`: valence counts and the textbook cases of OpenStax
  7.3, 7.4 and 7.6 (H2O, CO2, SCN−, N2O, CO, NO2−, CO3²−, NO3−, O3, NO,
  NO2, BF3, PCl5, SF6, XeF4, ICl4−...), condensed formulas, curated
  skeletons, isomers and refusals, oxidation states per atom.
- `tests/oxnum.test.mjs`: OpenStax 4.2 guidelines and Example 4.5, the
  carbon series of 20.3 (CH4 −4 to CO2 +4), IUPAC thiosulfate, peroxides,
  superoxide, OF2, hydrides, NH4NO3, NCl3, PH3, HCN, SCN−.
- `tests/redox.test.mjs`: every couple balances to the half-reaction
  printed in its source; OpenStax Examples 4.7, 17.1 and 17.2 give the
  published equations; E°cell, ΔG°, K.
- `tests/acidbase.test.mjs`: OpenStax Table 14.2 (both titrations, all 19
  rows), Examples 14.12–14.14 and 14.19–14.22 with their practice
  problems, buffers, distribution of forms.
- `scripts/e2e.mjs`: screenshots of every tab (desktop and phone, light
  and dark, French and English, into `/tmp/chem-shots`); the tab bar
  (ARIA roles and selection, arrow keys, Home and End, lazy loading, state
  kept per tab, Back and Forward, citations and the skip link, links
  between tools, shared links, language and theme across tabs, the tab bar
  on a phone); scripted interaction on every tool. Fails on any console
  error or horizontal overflow.

## Deploy

Published at <https://chimie.divergences.xyz/>: every push to `main` publishes `site/` on GitHub Pages
(`.github/workflows/publish.yml`, no build step).

Locally, either way from "Run locally":

- `npm run serve`, then open <http://localhost:9427/>;
- or the container: `docker build -t outils-chimie .` and `docker run --rm -p 8080:8080 outils-chimie`, then open
  <http://localhost:8080/>. The image is nginx with a strict content security policy
  (`deploy/default.conf.template`) and listens on `$PORT` (default 8080).

## Layout

```
site/
  index.html              the page: header, tab bar, one panel per tool
  assets/app.js           tabs: hash routing, lazy loading, keyboard, in-page anchors
  assets/route.js         hash routes #<tab>?<state> (unit-tested)
  assets/site.css         shared tokens (light/dark), layout, tab bar, drawing styles
  assets/site.js          language and theme shell
  assets/ui.js            small DOM helpers (fields, citations, species, equations)
  assets/common.js        shared strings and the list of every source
  assets/chem/            elements, formula parser, skeletons, Lewis engine, oxidation numbers
  lewis/                  Lewis tab (js/app.js, js/draw.js: SVG drawing and VSEPR sketch)
  redox/                  Redox tab (js/couples.js: potentials, js/balance.js: half-reaction method)
  acidbase/               Acid–base tab (js/data.js: Ka, Kb, reagents; js/equilibrium.js: exact pH;
                          js/model.js: textbook routes; js/chart.js: titration curve)
deploy/default.conf.template   nginx config
tests/                    node:test unit tests
scripts/                  e2e browser checks
```

## Sources and respect

Texts and drawings are original; all drawings are SVG made by the tools
themselves. Facts come from the documents listed at the bottom of each
tab, each one opened while writing it: mainly OpenStax *Chemistry 2e*
(CC BY-NC-SA 4.0; values and facts only, no text copied), the IUPAC 2016
recommendations on oxidation states (Allen electronegativities taken from
the published paper), the PubChem periodic table (Pauling
electronegativities), and a few Wikipedia and LibreTexts pages for
structures and potentials missing from the textbook. Numbers are copied as
printed; quantities the tools calculate (Ka of a base's conjugate acid from
Kb, exact pH from the charge balance) are labelled as such. Nothing was
copied from other online calculators.

Colours: violet for the brand and the curves, magenta for electrons and
lone pairs, and a warm/cool pair for the two sides of every transfer:
orange for the donor (oxidised, or the acid giving a proton), blue for the
acceptor (reduced, or the base). Colour never carries meaning alone: text
labels, arrows and signs say the same thing.

## Licence and credits

Code: MIT, see [LICENSE](LICENSE). Text, data tables and our own drawings:
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), unless
stated otherwise. Third-party images keep their own licence as credited.
The page has no photographs; its drawings are our own.

Built with the help of AI coding tools; every fact is checked against the cited sources.
