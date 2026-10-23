// Titration curve as SVG: one series (pH against volume of titrant), the
// buffer regions as a light wash, equivalence points filled, half-equivalence
// points hollow, a crosshair that follows the pointer (or the slider) and a
// tooltip. Text stays in ink colours; the line carries the only colour.
const NS = 'http://www.w3.org/2000/svg';
const s = (tag, attrs = {}, ...kids) => {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) n.setAttribute(k, v);
  for (const k of kids) if (k !== null && k !== undefined) n.append(k);
  return n;
};

const M = { l: 46, r: 18, t: 16, b: 48 };

/** A "nice" tick step for a range (1, 2, 2.5 or 5 × 10^n). */
export function niceStep(range, target = 6) {
  const raw = range / target;
  const p = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 2.5, 5, 10]) if (m * p >= raw) return m * p;
  return 10 * p;
}

/**
 * Draw into `host` (a .tchart div). t: titration() result. opts: {fmt(v, d), xTitle,
 * yTitle, eqLabel(e), halfLabel(h), tipLines(v, pH) -> [strong, small], onPick(v), title, desc}.
 * Returns {setV(v)}.
 */
export function drawTitration(host, t, opts) {
  host.replaceChildren();
  // The drawing keeps its text size on phones: the coordinate width follows the box.
  const W = Math.round(Math.max(330, Math.min(640, host.clientWidth || 640)));
  const H = W < 500 ? 300 : 380;
  const compact = W < 500;
  const X = (v) => M.l + (v / t.vmax) * (W - M.l - M.r);
  const Y = (p) => M.t + ((14 - Math.min(14, Math.max(0, p))) / 14) * (H - M.t - M.b);
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-labelledby': 'tc-title tc-desc' },
    s('title', { id: 'tc-title' }, opts.title), s('desc', { id: 'tc-desc' }, opts.desc));

  // buffer regions (behind everything)
  for (const b of t.buffers) svg.append(s('rect', { x: X(b.from), y: M.t, width: Math.max(0, X(b.to) - X(b.from)), height: H - M.t - M.b, class: 'tc-buffer' }));
  // grid and axes
  for (let p = 0; p <= 14; p += 2) {
    svg.append(s('line', { x1: M.l, x2: W - M.r, y1: Y(p), y2: Y(p), class: p === 0 ? 'tc-axis' : 'tc-grid' }));
    svg.append(s('text', { x: M.l - 8, y: Y(p) + 4, 'text-anchor': 'end', class: 'tc-tick' }, String(p)));
  }
  const step = niceStep(t.vmax, compact ? 4 : 6);
  for (let v = 0; v <= t.vmax + 1e-9; v += step) {
    svg.append(s('line', { x1: X(v), x2: X(v), y1: M.t, y2: H - M.b, class: v === 0 ? 'tc-axis' : 'tc-grid' }));
    svg.append(s('text', { x: X(v), y: H - M.b + 17, 'text-anchor': 'middle', class: 'tc-tick' }, opts.fmt(v, step < 1 ? 1 : 0)));
  }
  svg.append(s('text', { x: (M.l + W - M.r) / 2, y: H - 8, 'text-anchor': 'middle', class: 'tc-title' }, opts.xTitle));
  svg.append(s('text', { x: 12, y: (M.t + H - M.b) / 2, 'text-anchor': 'middle', class: 'tc-title', transform: `rotate(-90 12 ${(M.t + H - M.b) / 2})` }, opts.yTitle));

  // the curve
  const d = t.points.map((p, i) => `${i ? 'L' : 'M'}${X(p.v).toFixed(1)},${Y(p.pH).toFixed(1)}`).join('');
  svg.append(s('path', { d, class: 'tc-line' }));

  // marked points with selective direct labels
  const labels = s('g');
  for (const h of t.halves) {
    svg.append(s('circle', { cx: X(h.v), cy: Y(h.pH), r: 5, class: 'tc-half' }));
    labels.append(s('text', { x: X(h.v) - 8, y: Y(h.pH) - 10, 'text-anchor': 'end', class: 'tc-lbl' }, opts.halfLabel(h, compact)));
  }
  for (const e of t.eqs) {
    if (!e.visible) continue;
    svg.append(s('circle', { cx: X(e.v), cy: Y(e.pH), r: 5.5, class: 'tc-eq' }));
    const right = X(e.v) < W - (compact ? 90 : 170);
    labels.append(s('text', { x: X(e.v) + (right ? 10 : -10), y: Y(e.pH) + 4, 'text-anchor': right ? 'start' : 'end', class: 'tc-lbl' }, opts.eqLabel(e, compact)));
  }
  svg.append(labels);

  // crosshair, dot, hit area
  const cross = s('line', { y1: M.t, y2: H - M.b, class: 'tc-cross', visibility: 'hidden' });
  const dot = s('circle', { r: 5, class: 'tc-dot', visibility: 'hidden' });
  const hit = s('rect', { x: M.l, y: M.t, width: W - M.l - M.r, height: H - M.t - M.b, class: 'tc-hit' });
  svg.append(cross, dot, hit);
  const tip = document.createElement('div');
  tip.className = 'tip';
  tip.hidden = true;
  host.append(svg, tip);

  const setV = (v, { showTip = false } = {}) => {
    v = Math.max(0, Math.min(t.vmax, v));
    const pH = t.pHAt(v);
    cross.setAttribute('x1', X(v)); cross.setAttribute('x2', X(v));
    dot.setAttribute('cx', X(v)); dot.setAttribute('cy', Y(pH));
    cross.setAttribute('visibility', 'visible'); dot.setAttribute('visibility', 'visible');
    if (showTip) {
      const [strong, small] = opts.tipLines(v, pH);
      const st = document.createElement('strong'); st.textContent = strong;
      const k = document.createElement('span'); k.className = 'k';
      const sm = document.createElement('div'); sm.className = 'small'; sm.textContent = small;
      tip.replaceChildren(k, st, sm);
      tip.hidden = false;
      const fx = X(v) / W, fy = Y(pH) / H;
      tip.style.left = fx < 0.6 ? `calc(${(fx * 100).toFixed(2)}% + 12px)` : '';
      tip.style.right = fx >= 0.6 ? `calc(${((1 - fx) * 100).toFixed(2)}% + 12px)` : '';
      tip.style.top = `calc(${(Math.min(fy, 0.75) * 100).toFixed(2)}% - 10px)`;
    } else tip.hidden = true;
    return { v, pH };
  };
  const fromEvent = (ev) => {
    const r = svg.getBoundingClientRect();
    const x = ((ev.clientX - r.left) / r.width) * W;
    return ((x - M.l) / (W - M.l - M.r)) * t.vmax;
  };
  hit.addEventListener('pointermove', (ev) => { const v = fromEvent(ev); setV(v, { showTip: true }); opts.onPick?.(v); });
  hit.addEventListener('pointerdown', (ev) => { const v = fromEvent(ev); setV(v, { showTip: true }); opts.onPick?.(v); });
  hit.addEventListener('pointerleave', () => { tip.hidden = true; });
  return { setV };
}
