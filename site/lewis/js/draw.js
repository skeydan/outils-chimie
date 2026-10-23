// Lewis structures as SVG: a tree layout (central atom presets, chains drawn
// left to right), lone pairs in the widest free directions, formal charges in
// a free spot, brackets and the charge for ions. Also a small VSEPR sketch.
import { neighbours } from '../../assets/chem/skeleton.js';

const NS = 'http://www.w3.org/2000/svg';
const s = (tag, attrs = {}, ...kids) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, v);
  for (const k of kids) if (k !== null && k !== undefined) n.append(k);
  return n;
};
const rad = (d) => (d * Math.PI) / 180;
const norm = (a) => ((a % 360) + 360) % 360;
const angDist = (a, b) => { const d = Math.abs(norm(a) - norm(b)); return Math.min(d, 360 - d); };

// Central-atom presets: angles (degrees, 0 = east, 90 = south) for the bonded atoms,
// by [bonded, lone pairs]. The order spreads alike neighbours (H2SO4: OH opposite).
const PRESET = {
  '2,0': [180, 0], '2,1': [150, 30], '2,2': [150, 30], '2,3': [180, 0], '2,4': [180, 0],
  '3,0': [270, 150, 30], '3,1': [180, 0, 90], '3,2': [180, 0, 90],
  '4,0': [180, 0, 270, 90], '4,1': [180, 0, 270, 90], '4,2': [180, 0, 270, 90],
  '5,0': [270, 54, 198, 342, 126], '5,1': [270, 30, 210, 330, 150],
  '6,0': [0, 180, 60, 240, 120, 300], '6,1': [0, 180, 60, 240, 120, 300],
};

function subtreeSize(sk, v, p) {
  let n = 1;
  for (const w of neighbours(sk, v)) if (w !== p) n += subtreeSize(sk, w, v);
  return n;
}

/** Positions of the atoms (layout shared by every stage of one skeleton). */
export function layout(st) {
  const sk = st.sk;
  const n = sk.atoms.length;
  const pos = new Array(n);
  const isH = (i) => sk.atoms[i].el === 'H';
  const len = (a, b) => (isH(a) || isH(b) ? 44 : 58);
  const heavyNb = (i) => neighbours(sk, i).filter((j) => !isH(j));
  let root = sk.centre ?? null;
  if (root === null || root === undefined) {
    // chains: the first heavy atom; a pair: atom 0
    root = sk.atoms.findIndex((a) => a.el !== 'H');
    if (root < 0) root = 0;
  }
  pos[root] = { x: 0, y: 0 };
  const dirOf = new Array(n).fill(null);
  const place = (v, p, pd) => {
    const kids = neighbours(sk, v).filter((w) => w !== p);
    if (!kids.length) return;
    // biggest subtrees first, heavy before H
    kids.sort((a, b) => subtreeSize(sk, b, v) - subtreeSize(sk, a, v) || (isH(a) ? 1 : 0) - (isH(b) ? 1 : 0) || a - b);
    let angles;
    if (p === null) {
      const lp = Math.floor((st.lone[v] || 0) / 2) + ((st.lone[v] || 0) % 2);
      const preset = PRESET[`${kids.length},${Math.min(lp, 4)}`];
      if (heavyNb(v).length <= 1 && kids.length > 1 && sk.kind !== 'single-centre' && sk.kind !== 'triatomic') {
        // chain start: the chain goes east, the rest spread around
        angles = kids.map((_, j) => norm(360 * j / kids.length));
      } else if (kids.length === 1) angles = [0];
      else angles = preset ?? kids.map((_, j) => norm(180 + 360 * j / kids.length));
    } else {
      const k = kids.length;
      const slots = [...Array(k).keys()].map((j) => norm(pd + 360 * (j + 1) / (k + 1)));
      // straight continuation for the biggest child
      slots.sort((a, b) => angDist(a, pd + 180) - angDist(b, pd + 180));
      angles = slots;
    }
    kids.forEach((w, j) => {
      const a = angles[j];
      const L = len(v, w);
      pos[w] = { x: pos[v].x + L * Math.cos(rad(a)), y: pos[v].y + L * Math.sin(rad(a)) };
      dirOf[w] = a;
      place(w, v, norm(a + 180));
    });
  };
  place(root, null, null);
  return { pos, root };
}

/** Directions of the bonds around atom i. */
function bondDirs(sk, pos, i) {
  return neighbours(sk, i).map((j) => norm((Math.atan2(pos[j].y - pos[i].y, pos[j].x - pos[i].x) * 180) / Math.PI));
}

/** Spread m extra domains (lone pairs) in the free angular gaps around existing directions. */
export function spread(dirs, m, prefer = 270) {
  if (!m) return [];
  if (!dirs.length) {
    const start = prefer;
    return [...Array(m).keys()].map((j) => norm(start + 360 * j / m));
  }
  const sorted = [...dirs].sort((a, b) => a - b);
  const gaps = sorted.map((a, k) => {
    const b = k + 1 < sorted.length ? sorted[k + 1] : sorted[0] + 360;
    return { from: a, size: b - a, count: 0 };
  });
  for (let j = 0; j < m; j++) {
    let best = null;
    for (const g of gaps) {
      const score = g.size / (g.count + 2);
      if (!best || score > best.score + 1e-6 || (Math.abs(score - best.score) < 1e-6 && angDist(g.from + g.size / 2, prefer) < angDist(best.g.from + best.g.size / 2, prefer))) best = { g, score };
    }
    best.g.count++;
  }
  const out = [];
  for (const g of gaps) for (let c = 1; c <= g.count; c++) out.push(norm(g.from + (g.size * c) / (g.count + 1)));
  return out;
}

const txt0 = (fc) => (Math.abs(fc) > 1 ? Math.abs(fc) : '') + (fc > 0 ? '+' : '−');
const labelR = (el) => (el === 'H' ? 8 : el.length > 1 ? 13 : 10);

/**
 * Draw one structure. st: {sk, orders, lone, fc}; opts: {pos (layout), charge,
 * showFc, vacancies (atoms with an empty-box pair), highlight:Set, className, title}.
 */
export function drawLewis(st, opts = {}) {
  const sk = st.sk;
  const lay = opts.layout ?? layout(st);
  const pos = lay.pos;
  const g = s('g');
  const marks = []; // points used for the bounding box
  const n = sk.atoms.length;

  // highlight discs
  if (opts.highlight) for (const i of opts.highlight) g.append(s('circle', { cx: pos[i].x, cy: pos[i].y, r: 17, class: 'lw-hl' }));

  // bonds
  sk.edges.forEach(([a, b], k) => {
    const o = st.orders[k] || 1;
    const A = pos[a], B = pos[b];
    const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy);
    const ux = dx / d, uy = dy / d, px = -uy, py = ux;
    const ra = labelR(sk.atoms[a].el) + 3, rb = labelR(sk.atoms[b].el) + 3;
    const offs = o === 1 ? [0] : o === 2 ? [-3.4, 3.4] : [-5.6, 0, 5.6];
    for (const off of offs) {
      g.append(s('line', { x1: A.x + ux * ra + px * off, y1: A.y + uy * ra + py * off, x2: B.x - ux * rb + px * off, y2: B.y - uy * rb + py * off, class: 'lw-bond' }));
    }
  });

  // atoms, lone pairs, radicals, formal charges, vacancies
  for (let i = 0; i < n; i++) {
    const e = sk.atoms[i].el;
    const P = pos[i];
    marks.push([P.x - 12, P.y - 12], [P.x + 12, P.y + 12]);
    g.append(s('text', { x: P.x, y: P.y + 0.5, class: `lw-atom${e === 'H' ? ' h' : ''}` }, e));
    const dirs = bondDirs(sk, pos, i);
    const lone = st.lone[i] || 0;
    const pairs = Math.floor(lone / 2), single = lone % 2;
    const vac = opts.vacancies?.get?.(i) || 0;
    const domains = spread(dirs, pairs + single + vac, dirs.length ? norm(dirs.reduce((a, b) => a + b, 0) / dirs.length + 180) : 270);
    const r0 = labelR(e) + 6;
    domains.forEach((a, k) => {
      const cx = P.x + r0 * Math.cos(rad(a)), cy = P.y + r0 * Math.sin(rad(a));
      const tx = -Math.sin(rad(a)), ty = Math.cos(rad(a));
      if (k < pairs) {
        g.append(s('circle', { cx: cx + tx * 4, cy: cy + ty * 4, r: 2.4, class: 'lw-lp' }));
        g.append(s('circle', { cx: cx - tx * 4, cy: cy - ty * 4, r: 2.4, class: 'lw-lp' }));
      } else if (k < pairs + single) {
        g.append(s('circle', { cx, cy, r: 3, class: 'lw-rad' }));
      } else {
        g.append(s('rect', { x: cx - 6, y: cy - 3.5, width: 12, height: 7, rx: 1.5, class: 'lw-vac', transform: `rotate(${a + 90} ${cx} ${cy})` }));
      }
      marks.push([cx - 7, cy - 7], [cx + 7, cy + 7]);
    });
    const fc = st.fc?.[i] ?? 0;
    const fcShown = opts.showFc !== false && fc;
    if (opts.os && opts.os[i] !== undefined && opts.os[i] !== null) {
      // oxidation state: a small label below the atom, or in the freest direction
      const used = [...dirs, ...domains, ...(fcShown ? [315] : [])];
      let best = 90, bestScore = -1;
      for (let a = 0; a < 360; a += 15) {
        const sc = Math.min(...used.map((u) => angDist(u, a)), 999) - angDist(a, 90) * 0.05;
        if (sc > bestScore) { bestScore = sc; best = a; }
      }
      const R = labelR(e) + (pairs + single ? 15 : 11);
      const cx = P.x + R * Math.cos(rad(best)), cy = P.y + R * Math.sin(rad(best));
      g.append(s('text', { x: cx, y: cy, class: 'lw-os' }, opts.os[i]));
      marks.push([cx - 10, cy - 7], [cx + 10, cy + 7]);
    }
    if (fcShown) {
      const used = [...dirs, ...domains];
      let best = 315, bestScore = -1;
      for (let a = 0; a < 360; a += 15) {
        const sc = Math.min(...used.map((u) => angDist(u, a)), 999) - angDist(a, 315) * 0.05;
        if (sc > bestScore) { bestScore = sc; best = a; }
      }
      const R = labelR(e) + (txt0(fc).length > 1 ? 17 : 14);
      const cx = P.x + R * Math.cos(rad(best)), cy = P.y + R * Math.sin(rad(best));
      const txt = (Math.abs(fc) > 1 ? Math.abs(fc) : '') + (fc > 0 ? '+' : '−');
      g.append(s('g', { class: 'lw-fc' }, s('circle', { cx, cy, r: txt.length > 1 ? 9.5 : 8 }), s('text', { x: cx, y: cy + 0.5 }, txt)));
      marks.push([cx - 10, cy - 10], [cx + 10, cy + 10]);
    }
  }

  // bounding box, brackets and charge
  let x0 = Math.min(...marks.map((m) => m[0])), x1 = Math.max(...marks.map((m) => m[0]));
  let y0 = Math.min(...marks.map((m) => m[1])), y1 = Math.max(...marks.map((m) => m[1]));
  const charge = opts.charge || 0;
  if (charge && n > 1) {
    const pad = 6;
    const bx0 = x0 - pad, bx1 = x1 + pad, by0 = y0 - pad, by1 = y1 + pad;
    g.append(s('path', { d: `M${bx0 + 6},${by0} H${bx0} V${by1} H${bx0 + 6}`, class: 'lw-bracket' }));
    g.append(s('path', { d: `M${bx1 - 6},${by0} H${bx1} V${by1} H${bx1 - 6}`, class: 'lw-bracket' }));
    const ct = (Math.abs(charge) > 1 ? Math.abs(charge) : '') + (charge > 0 ? '+' : '−');
    g.append(s('text', { x: bx1 + 3, y: by0 + 4, class: 'lw-charge' }, ct));
    x0 = bx0; x1 = bx1 + 22; y0 = by0 - 4; y1 = by1;
  } else if (charge) {
    // a monatomic ion: the charge at the upper right
    const ct = (Math.abs(charge) > 1 ? Math.abs(charge) : '') + (charge > 0 ? '+' : '−');
    g.append(s('text', { x: x1 + 4, y: y0 + 6, class: 'lw-charge' }, ct));
    x1 += 22;
  }
  const m = 6;
  const W = x1 - x0 + 2 * m, H = y1 - y0 + 2 * m;
  const svg = s('svg', { viewBox: `${(x0 - m).toFixed(1)} ${(y0 - m).toFixed(1)} ${W.toFixed(1)} ${H.toFixed(1)}`, width: Math.round(W * (opts.scale ?? 1)), height: Math.round(H * (opts.scale ?? 1)), role: 'img', class: opts.className ?? null });
  if (opts.title) svg.append(s('title', {}, opts.title));
  svg.append(g);
  return svg;
}

// ------------------------------------------------------------ VSEPR sketch
// Unit positions of bonded atoms (x, y, style l|w|d) and lone pairs (x, y) per shape.
const SK = {
  linear: { b: [[-1, 0, 'l'], [1, 0, 'l']], e: [] },
  'trigonal-planar': { b: [[0, -1, 'l'], [-0.87, 0.5, 'l'], [0.87, 0.5, 'l']], e: [] },
  'bent-120': { b: [[-0.87, 0.5, 'l'], [0.87, 0.5, 'l']], e: [[0, -0.9]] },
  tetrahedral: { b: [[0, -1, 'l'], [-0.94, 0.34, 'l'], [0.45, 0.72, 'w'], [0.82, 0.12, 'd']], e: [] },
  'trigonal-pyramidal': { b: [[-0.94, 0.34, 'l'], [0.45, 0.72, 'w'], [0.82, 0.12, 'd']], e: [[0, -0.9]] },
  'bent-109': { b: [[-0.82, 0.55, 'l'], [0.82, 0.55, 'l']], e: [[-0.55, -0.75], [0.55, -0.75]] },
  'trigonal-bipyramidal': { b: [[0, -1, 'l'], [0, 1, 'l'], [-1, 0, 'l'], [0.6, 0.45, 'w'], [0.6, -0.4, 'd']], e: [] },
  seesaw: { b: [[0, -1, 'l'], [0, 1, 'l'], [0.6, 0.45, 'w'], [0.6, -0.4, 'd']], e: [[-0.9, 0]] },
  't-shaped': { b: [[0, -1, 'l'], [0, 1, 'l'], [1, 0, 'l']], e: [[-0.65, 0.4], [-0.65, -0.4]] },
  'linear-axial': { b: [[0, -1, 'l'], [0, 1, 'l']], e: [[-0.9, 0], [0.55, 0.45], [0.55, -0.4]] },
  octahedral: { b: [[0, -1, 'l'], [0, 1, 'l'], [-1, 0, 'l'], [1, 0, 'l'], [-0.5, 0.5, 'w'], [0.5, -0.5, 'd']], e: [] },
  'square-pyramidal': { b: [[0, -1, 'l'], [-1, 0, 'l'], [1, 0, 'l'], [-0.5, 0.5, 'w'], [0.5, -0.5, 'd']], e: [[0, 0.9]] },
  'square-planar': { b: [[-1, 0, 'l'], [1, 0, 'l'], [-0.5, 0.5, 'w'], [0.5, -0.5, 'd']], e: [[0, -0.9], [0, 0.9]] },
};

export function drawShape(shape, lonePairs, title) {
  const key = shape === 'linear' && lonePairs === 3 ? 'linear-axial' : shape;
  const t = SK[key];
  if (!t) return null;
  const R = 54, c = 70;
  const svg = s('svg', { viewBox: '0 0 140 140', width: 140, height: 140, role: 'img' }, s('title', {}, title));
  for (const [x, y] of t.e) svg.append(s('ellipse', { cx: c + x * 34, cy: c + y * 34, rx: 13, ry: 8, transform: `rotate(${(Math.atan2(y, x) * 180) / Math.PI} ${c + x * 34} ${c + y * 34})`, class: 'sh-lp' }));
  for (const [x, y, st] of t.b) {
    const X = c + x * R, Y = c + y * R;
    if (st === 'l') svg.append(s('line', { x1: c, y1: c, x2: X, y2: Y, class: 'sh-bond' }));
    else if (st === 'w') {
      const px = -(Y - c), py = X - c, d = Math.hypot(px, py);
      svg.append(s('path', { d: `M${c},${c} L${X + (px / d) * 6},${Y + (py / d) * 6} L${X - (px / d) * 6},${Y - (py / d) * 6} Z`, class: 'sh-wedge' }));
    } else svg.append(s('line', { x1: c, y1: c, x2: X, y2: Y, class: 'sh-dash' }));
    svg.append(s('circle', { cx: X, cy: Y, r: 8, class: 'sh-atom' }));
  }
  svg.append(s('circle', { cx: c, cy: c, r: 10, class: 'sh-centre' }));
  return svg;
}
