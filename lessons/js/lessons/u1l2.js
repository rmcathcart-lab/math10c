/* Math 10C · Unit 1 · Lesson 2 — Prime Factorization at Work: GCF, LCM, and Perfect Powers. The explainers on this page. */
import { h, fmt, Explainer, factors, primeFactors, productHTML, expHTML, decimal } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const parse = (v) => String(v).split(',').map(Number);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;
const listAnd = (arr) => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]);
const nameList = (ns) => listAnd(ns.map(fmt));
const texN = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'); // 15876 → 15\,876 like the booklet
const WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/* every prime gets the same colour everywhere on the page (matches the Lesson 1 sieve) */
const PCOL = { 2: '#3b78d8', 3: '#e0841a', 5: '#8a58c9', 7: '#d0477a', 11: '#2f9e6a', 13: '#0f8a8a', 17: '#b0563a', 19: '#5a6acf', 23: '#9a7b12' };
const pcol = (p) => PCOL[p] || '#5d6b7e';
function chip(p, cls) { const e = h('div', 'pc' + (cls ? ' ' + cls : ''), fmt(p)); e.style.setProperty('--pc', pcol(p)); return e; }
function groups(ps) { const g = []; ps.forEach((p) => { const l = g[g.length - 1]; if (l && l.p === p) l.k++; else g.push({ p, k: 1 }); }); return g; }
function counts(n) { const m = new Map(); primeFactors(n).forEach((p) => m.set(p, (m.get(p) || 0) + 1)); return m; }
const pw = (p, k) => fmt(p) + (k > 1 ? '<sup>' + k + '</sup>' : '');          // 2³, 5
const pw1 = (p, k) => fmt(p) + '<sup>' + k + '</sup>';                          // 5¹ (exponent always shown)
function descMulti(ps) { return listAnd(groups(ps).map((g) => (WORD[g.k] || g.k) + ' ' + fmt(g.p) + (g.k > 1 ? 's' : ''))); }
function iroot(n, k) { let r = Math.round(Math.pow(n, 1 / k)); while (Math.pow(r, k) > n) r--; while (Math.pow(r + 1, k) <= n) r++; return r; }

/* move an absolutely-placed element to (x, y), animating from where it was (optionally along an arc) */
function fly(c, el, x, y, ms = 600, o = {}) {
  const ox = parseFloat(el.style.left) || 0, oy = parseFloat(el.style.top) || 0, dx = ox - x, dy = oy - y;
  at(el, x, y);
  const kf = o.arc
    ? [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: `translate(${dx / 2}px, ${dy / 2 - o.arc}px)`, offset: 0.5 }, { transform: 'translate(0px, 0px)' }]
    : [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'translate(0px, 0px)' }];
  return c.anim(el, kf, ms, o);
}
const pulse = (c, el, s = 1.25, ms = 420, o = {}) => c.anim(el, [{ transform: 'scale(1)' }, { transform: `scale(${s})` }, { transform: 'scale(1)' }], ms, o);

/* ---------- drawings: a square of tiles, a box of small cubes, a little factor tree ---------- */
function gridSVG(rows, cols, u) {
  const w = cols * u, ht = rows * u, lines = [];
  if (u >= 4) {
    for (let i = 1; i < cols; i++) lines.push(`<line x1="${i * u}" y1="0" x2="${i * u}" y2="${ht}"/>`);
    for (let j = 1; j < rows; j++) lines.push(`<line x1="0" y1="${j * u}" x2="${w}" y2="${j * u}"/>`);
  }
  return `<svg class="gridsvg" width="${w + 4}" height="${ht + 4}" viewBox="-2 -2 ${w + 4} ${ht + 4}"><rect x="0" y="0" width="${w}" height="${ht}" rx="3"/><g>${lines.join('')}</g></svg>`;
}
function boxSVG(nx, ny, nz, u) { // nx wide, ny tall, nz deep; oblique projection like the booklet
  const dx = 0.5 * u, dy = 0.36 * u, oy = nz * dy, W = nx * u + nz * dx, H = ny * u + oy, L = [];
  const ln = (x1, y1, x2, y2) => L.push(`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`);
  if (u >= 4) {
    for (let i = 1; i < nx; i++) { ln(i * u, oy, i * u, oy + ny * u); ln(i * u, oy, i * u + nz * dx, oy - nz * dy); }
    for (let j = 1; j < ny; j++) { ln(0, oy + j * u, nx * u, oy + j * u); ln(nx * u, oy + j * u, nx * u + nz * dx, oy - nz * dy + j * u); }
    for (let k = 1; k < nz; k++) { ln(k * dx, oy - k * dy, nx * u + k * dx, oy - k * dy); ln(nx * u + k * dx, oy - k * dy, nx * u + k * dx, oy - k * dy + ny * u); }
  }
  const P = (pts) => pts.map((p) => p.map((q) => q.toFixed(1)).join(',')).join(' ');
  return `<svg class="boxsvg" width="${W + 4}" height="${H + 4}" viewBox="-2 -2 ${W + 4} ${H + 4}">
    <polygon class="f-top" points="${P([[0, oy], [nx * u, oy], [nx * u + nz * dx, oy - nz * dy], [nz * dx, oy - nz * dy]])}"/>
    <polygon class="f-side" points="${P([[nx * u, oy], [nx * u + nz * dx, oy - nz * dy], [nx * u + nz * dx, oy - nz * dy + ny * u], [nx * u, oy + ny * u]])}"/>
    <rect class="f-front" x="0" y="${oy}" width="${nx * u}" height="${ny * u}"/><g>${L.join('')}</g></svg>`;
}
function treeSVG(spec) { // "60:4,15|4:2,2|15:3,5"
  const kids = {}; spec.split('|').forEach((s) => { const [p, c] = s.split(':'); kids[p] = c.split(',').map(Number); });
  const root = Number(spec.split(':')[0]);
  const mk = (v) => ({ v, k: kids[v] ? kids[v].map(mk) : null });
  const t = mk(root), leaves = []; const walk = (n, d) => { n.d = d; if (!n.k) leaves.push(n); else n.k.forEach((c) => walk(c, d + 1)); }; walk(t, 0);
  const sx = 46, sy = 50, place = (n) => { if (!n.k) n.x = 24 + leaves.indexOf(n) * sx; else { n.k.forEach(place); n.x = (n.k[0].x + n.k[1].x) / 2; } n.y = 20 + n.d * sy; }; place(t);
  const out = [], all = []; const coll = (n) => { all.push(n); if (n.k) n.k.forEach((c) => { out.push(`<line x1="${n.x}" y1="${n.y + 13}" x2="${c.x}" y2="${c.y - 13}"/>`); coll(c); }); }; coll(t);
  const W = 48 + (leaves.length - 1) * sx, H = 40 + Math.max(...all.map((n) => n.d)) * sy;
  return `<svg class="treesvg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out.join('')}${all.map((n) => (n.k ? '' : `<circle cx="${n.x}" cy="${n.y}" r="15"/>`) + `<text x="${n.x}" y="${n.y + 6}">${n.v}</text>`).join('')}</svg>`;
}

/* ============ 1. GCF by inspection: line the factors up in columns ============ */
const gcfList = {
  title: 'GCF by inspection: line up the factors',
  height: 340,
  choices: [{ v: '60,90', label: '60 & 90' }, { v: '12,18', label: '12 & 18' }, { v: '10,15,25', label: '10, 15, 25' }, { sep: 'Example 1 check:' }, { v: '16,24,40', label: '16, 24, 40' }, { v: '21,28', label: '21 & 28' }, { v: '48,72', label: '48 & 72' }],
  intro: (v) => `Which numbers divide evenly into <b>every one</b> of ${nameList(parse(v))}? List each number’s factors, line them up, and look for the <b>biggest</b> one they all share.`,
  make(stage, v, ex) {
    const ns = parse(v), W = ex.W, F = ns.map(factors), U = [...new Set(F.flat())].sort((a, b) => a - b);
    const common = U.filter((u) => F.every((f) => f.includes(u))), g = common[common.length - 1], locker = v === '60,90';
    const lx = 124, cw = Math.min(72, (W - lx - 20) / U.length), x0 = lx + (W - lx - 20 - cw * U.length) / 2 + cw / 2;
    const X = (u) => x0 + U.indexOf(u) * cw, rowH = ns.length > 2 ? 72 : 88, Y = (i) => 78 + i * rowH;
    const bandTop = 42, bandBot = Y(ns.length - 1) + 34;
    const bands = {};
    common.forEach((u) => { const b = add(stage, h('div', 'gl-band'), X(u) - cw / 2 + 3, bandTop); b.style.width = cw - 6 + 'px'; b.style.height = bandBot - bandTop + 'px'; b.style.opacity = 0; bands[u] = b; });
    const labs = ns.map((n, i) => { const e = add(stage, h('div', 'gl-lab', fmt(n) + '<small>factors</small>'), 20, Y(i)); e.style.translate = '0 -50%'; e.style.opacity = 0; return e; });
    const chips = ns.map((n, i) => F[i].map((f) => { const e = add(stage, h('div', 'gl-chip c' + (cw < 58 ? ' sm' : ''), fmt(f)), X(f), Y(i)); e.style.opacity = 0; e._v = f; return e; }));
    const crown = add(stage, h('div', 'gl-crown c', 'GCF'), X(g), bandTop); crown.style.opacity = 0;
    const res = add(stage, h('div', 'gl-res'), 20, bandBot + 26); res.style.opacity = 0;
    const steps = ns.map((n, i) => ({
      cap: `The factors of <b>${fmt(n)}</b>: ${F[i].map(fmt).join(', ')}.` + (i === 0 ? ' Each factor gets its own <b>column</b>.' : ' The same number goes in the same column.'),
      run: (c) => Promise.all([c.fadeIn(labs[i], 300), ...chips[i].map((e, k) => c.pop(e, 320, { delay: k * 55 }))])
    }));
    steps.push({
      cap: `The columns filled in <b>every</b> row are the <b>common factors</b>: ${common.map(fmt).join(', ')}.` + (locker ? ' These are the students who touch <b>both</b> locker 60 and locker 90.' : ''),
      run: async (c) => {
        const jobs = common.map((u, k) => c.anim(bands[u], [{ opacity: 0, transform: 'scaleY(.2)' }, { opacity: 1, transform: 'none' }], 420, { delay: k * 70 }));
        chips.flat().forEach((e) => e.classList.add(common.includes(e._v) ? 'common' : 'dim'));
        res.innerHTML = `Common factors: <b>${common.map(fmt).join(', ')}</b>`;
        jobs.push(c.fadeIn(res, 350, { delay: 300 }));
        await Promise.all(jobs);
      }
    });
    steps.push({
      cap: `The biggest common factor is <b>${g}</b>, so the <b>GCF</b> of ${nameList(ns)} is <b>${g}</b>.` + (locker ? ' Student 30 is the <b>last</b> one to touch both lockers.' : g === 1 ? ' Only 1 is shared.' : ''),
      run: async (c) => {
        bands[g].classList.add('max');
        res.innerHTML = `Common factors: ${common.map((u) => (u === g ? '<b class="gl-g">' + fmt(u) + '</b>' : fmt(u))).join(', ')} &nbsp;→&nbsp; <b class="gl-g">GCF = ${fmt(g)}</b>`;
        await Promise.all([c.pop(crown, 420), ...chips.map((row) => pulse(c, row.find((e) => e._v === g), 1.3, 460)), c.fadeIn(res, 300)]);
      }
    });
    return steps;
  }
};

/* ============ 1. The biggest square tile ============ */
const tiles = {
  title: 'The biggest square tile that fits is the GCF',
  height: 440,
  choices: [{ v: '60,90', label: '60 × 90' }, { v: '12,18', label: '12 × 18' }, { v: '24,40', label: '24 × 40' }, { v: '21,28', label: '21 × 28' }],
  intro: (v) => { const [a, b] = parse(v); return `A <b>${a} by ${b}</b> rectangle. Which square tiles cover it <b>exactly</b>, with no tiles cut?`; },
  make(stage, v, ex) {
    const [a, b] = parse(v), W = ex.W, H = 440, g = gcd(a, b), pw0 = 290;
    const s = Math.min((W - pw0 - 110) / b, (H - 110) / a), rw = b * s, rh = a * s;
    const rx = 60 + (W - pw0 - 100 - rw) / 2, ry = 44 + (H - 100 - rh) / 2;
    add(stage, h('div', 'tl-dim c', fmt(b)), rx + rw / 2, ry - 20);
    add(stage, h('div', 'tl-dim c', fmt(a)), rx - 26, ry + rh / 2);
    const frame = add(stage, h('div', 'tl-rect'), rx, ry); frame.style.width = rw + 'px'; frame.style.height = rh + 'px';
    const info = add(stage, h('div', 'tl-info c'), rx + rw / 2, ry + rh + 26);
    const panel = add(stage, h('div', 'tl-panel', '<div class="rt-h">Tile sizes tried</div>'), W - pw0 - 14, 14);
    panel.style.width = pw0 + 'px'; panel.style.height = H - 28 + 'px';
    let layer = null;
    async function draw(c, t, best) {
      const cols = Math.floor(b / t), rows = Math.floor(a / t), fits = a % t === 0 && b % t === 0, u = t * s;
      if (layer) { const old = layer; c.anim(old, [{ opacity: 1 }, { opacity: 0 }], 250).then(() => old.remove()); }
      layer = add(stage, h('div', 'tl-layer'), rx, ry); layer.style.width = rw + 'px'; layer.style.height = rh + 'px';
      const tl = h('div', 'tl-tiles' + (best ? ' best' : '')); at(tl, 0, 0); tl.style.width = cols * u + 'px'; tl.style.height = rows * u + 'px'; tl.style.backgroundSize = `${u}px ${u}px`; layer.appendChild(tl);
      const jobs = [c.anim(tl, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], 700)];
      if (!fits) {
        if (b % t) { const st = h('div', 'tl-strip'); at(st, cols * u, 0); st.style.width = rw - cols * u + 'px'; st.style.height = rh + 'px'; layer.appendChild(st); jobs.push(c.fadeIn(st, 300, { delay: 600, from: 'none' })); }
        if (a % t) { const st = h('div', 'tl-strip'); at(st, 0, rows * u); st.style.width = cols * u + 'px'; st.style.height = rh - rows * u + 'px'; layer.appendChild(st); jobs.push(c.fadeIn(st, 300, { delay: 600, from: 'none' })); }
      }
      info.innerHTML = fits ? `${rows} rows × ${cols} columns = <b>${rows * cols} tiles</b>` : `<span class="red">a strip is left uncovered</span>`;
      jobs.push(c.fadeIn(info, 300, { delay: 300 }));
      await Promise.all(jobs);
    }
    const why = (t) => (b % t ? `${b} ÷ ${t} = ${decimal(b / t)}` : `${a} ÷ ${t} = ${decimal(a / t)}`);
    const row = (c, t, ok, extra) => { const r = h('div', 'tl-row ' + (ok ? 'ok' : 'no'), `${t} × ${t} <span>${ok ? '✓ ' + extra : '✗ ' + extra}</span>`); panel.appendChild(r); return c.fadeIn(r, 300, { delay: 200 }); };
    const cf = factors(g).filter((d) => d > 1 && d < g), tries = [];
    if (cf.length) tries.push(cf.reduce((x, y) => (Math.abs(y - g / 3) < Math.abs(x - g / 3) ? y : x)));
    const lo = tries[0] || 1, bad = []; for (let m = lo + 1; m < g; m++) if ((a % m === 0) !== (b % m === 0)) bad.push(m);
    const steps = [];
    if (tries[0]) {
      const t = tries[0];
      steps.push({ cap: `<b>${t} × ${t} tiles</b> fit exactly: ${a} ÷ ${t} = ${a / t} rows and ${b} ÷ ${t} = ${b / t} columns. ${t} is a <b>common factor</b> of ${a} and ${b}. Can we use bigger tiles?`, run: (c) => Promise.all([draw(c, t), row(c, t, true, (a / t) * (b / t) + ' tiles')]) });
    }
    if (bad.length) {
      const t = bad[bad.length - 1];
      steps.push({ cap: `<b>${t} × ${t} tiles?</b> ${why(t)} — not a whole number, so a strip is left over. ${t} divides one side but <b>not both</b>.`, run: (c) => Promise.all([draw(c, t), row(c, t, false, why(t))]) });
    }
    steps.push({ cap: `<b>${g} × ${g} tiles</b> fit exactly: ${a / g} rows of ${b / g}, ${(a / g) * (b / g)} tiles. ${g} is the <b>greatest</b> common factor of ${a} and ${b}.`, run: (c) => Promise.all([draw(c, g, true), row(c, g, true, (a / g) * (b / g) + ' tiles')]) });
    if (a !== g) steps.push({ cap: `Anything bigger leaves a gap. <b>${a} × ${a}</b> tiles fit the ${a} side, but ${why(a)}. So the <b>largest square tile</b> has side <b>GCF(${a}, ${b}) = ${g}</b>.`, run: (c) => Promise.all([draw(c, a), row(c, a, false, why(a))]) });
    steps.push({
      cap: `The biggest tile is <b>${g} × ${g}</b>: the <b>GCF</b>.` + (cf.length ? ` Every other tile that works (${cf.join(', ')}) is a factor of ${g}.` : ` Only 1 × 1 tiles and ${g} × ${g} tiles fit exactly.`),
      run: async (c) => { const r = h('div', 'tl-sum', `Biggest tile: <b>${g} × ${g}</b><br>GCF(${a}, ${b}) = ${g}`); panel.appendChild(r); await Promise.all([draw(c, g, true), c.fadeIn(r, 350)]); }
    });
    return steps;
  }
};

/* ============ 1 & 2. Venn diagram of prime factors ============ */
function vennDef(mode, title, choices) {
  return {
    title, height: 500, choices,
    intro: (v) => { const [a, b] = parse(v); return `Find the ${mode === 'g' ? 'GCF' : 'LCM'} of <b>${fmt(a)}</b> and <b>${fmt(b)}</b>: write both as products of primes, then sort the primes into a <b>Venn diagram</b>.`; },
    make(stage, v, ex) {
      const [a, b] = parse(v), W = ex.W, pa = primeFactors(a), pb = primeFactors(b);
      const usedB = pb.map(() => false), pairs = [], onlyA = [];
      pa.forEach((p, i) => { const j = pb.findIndex((q, k) => q === p && !usedB[k]); if (j >= 0) { usedB[j] = true; pairs.push([i, j]); } else onlyA.push(i); });
      const onlyB = pb.map((_, k) => k).filter((k) => !usedB[k]);
      const both = pairs.map(([i]) => pa[i]), g = both.reduce((x, y) => x * y, 1), l = (a * b) / g;
      const sp = Math.min(60, 440 / Math.max(pa.length, pb.length));
      const row = (n, ps, y) => {
        const lab = add(stage, h('div', 'vn-lab', fmt(n) + ' ='), 20, y); lab.style.translate = '0 -50%';
        const cs = ps.map((p, i) => { const e = add(stage, chip(p, 'c'), 150 + i * sp, y); e.style.opacity = 0; return e; });
        const xs = ps.slice(1).map((_, i) => { const e = add(stage, h('div', 'vn-x c', '×'), 150 + (i + 0.5) * sp, y); e.style.opacity = 0; return e; });
        lab.style.opacity = 0; return { lab, cs, xs };
      };
      const A = row(a, pa, 34), B = row(b, pb, 94);
      const r = 168, cx1 = 232, cx2 = 462, cy = 320, mid = (cx1 + cx2) / 2;
      [[cx1, 'a'], [cx2, 'b']].forEach(([cx, k]) => { const e = add(stage, h('div', 'vn-circ ' + k), cx - r, cy - r); e.style.width = e.style.height = 2 * r + 'px'; });
      add(stage, h('div', 'vn-name a c', fmt(a)), cx1 - 128, cy - 150);
      add(stage, h('div', 'vn-name b c', fmt(b)), cx2 + 128, cy - 150);
      add(stage, h('div', 'vn-reg c', 'only ' + fmt(a)), cx1 - 66, cy + 112);
      add(stage, h('div', 'vn-reg c', 'both'), mid, cy - 154);
      add(stage, h('div', 'vn-reg c', 'only ' + fmt(b)), cx2 + 66, cy + 112);
      const slot = (cx, n, cols) => Array.from({ length: n }, (_, k) => { const C = Math.min(cols, n), R = Math.ceil(n / cols), cl = k % cols, rw = Math.floor(k / cols); return [cx + (cl - (C - 1) / 2) * 56, cy + (rw - (R - 1) / 2) * 56]; });
      const sM = slot(mid, both.length, both.length > 3 ? 2 : 1), sA = slot(cx1 - 62, onlyA.length, onlyA.length > 3 ? 2 : 1), sB = slot(cx2 + 62, onlyB.length, onlyB.length > 3 ? 2 : 1);
      const px = cx2 + r + 26, pwid = W - px - 14;
      const boxG = add(stage, h('div', 'vn-res g'), px, 150), boxL = add(stage, h('div', 'vn-res l'), px, 300);
      [boxG, boxL].forEach((e) => { e.style.width = pwid + 'px'; e.style.opacity = 0; });
      const Ma = counts(a), Mb = counts(b), primesBoth = [...new Set(both)], primesAll = [...new Set([...pa, ...pb])].sort((x, y) => x - y);
      const lowest = primesBoth.map((p) => pw1(p, Math.min(Ma.get(p), Mb.get(p)))).join(' × ');
      const highest = primesAll.map((p) => pw1(p, Math.max(Ma.get(p) || 0, Mb.get(p) || 0))).join(' × ');
      const lcmList = [...pa, ...onlyB.map((k) => pb[k])];
      const midEls = [];
      const steps = [
        {
          cap: `Write each number as a product of primes: <b>${fmt(a)} = ${productHTML(pa)}</b> and <b>${fmt(b)} = ${productHTML(pb)}</b>.`,
          run: (c) => Promise.all([A, B].flatMap((R, ri) => [c.fadeIn(R.lab, 300, { delay: ri * 200 }), ...R.cs.map((e, i) => c.pop(e, 320, { delay: ri * 200 + i * 70 })), ...R.xs.map((e) => c.fadeIn(e, 300, { delay: ri * 200 + 200, from: 'none' }))]))
        },
        {
          cap: both.length ? `Match up the primes they <b>share</b>: ${descMulti(both)}. Each matching pair goes in the <b>middle</b>, where it is counted <b>once</b>.` : `They share <b>no</b> primes, so the middle stays empty.`,
          run: async (c) => {
            [...A.xs, ...B.xs].forEach((e) => c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 250));
            await Promise.all(pairs.map(([i, j], k) => Promise.all([pulse(c, A.cs[i], 1.2, 300, { delay: k * 160 }), pulse(c, B.cs[j], 1.2, 300, { delay: k * 160 })])));
            await Promise.all(pairs.map(([i, j], k) => {
              const [x, y] = sM[k]; midEls.push(A.cs[i]); A.cs[i].classList.add('mid');
              return Promise.all([fly(c, A.cs[i], x, y, 650, { delay: k * 140 }), fly(c, B.cs[j], x, y, 650, { delay: k * 140 }).then(() => c.anim(B.cs[j], [{ opacity: 1 }, { opacity: 0 }], 200))]);
            }));
          }
        },
        {
          cap: `The leftovers go on their own side: ${onlyA.length ? descMulti(onlyA.map((i) => pa[i])) + ' only in ' + fmt(a) : 'nothing extra in ' + fmt(a)}, ${onlyB.length ? descMulti(onlyB.map((k) => pb[k])) + ' only in ' + fmt(b) : 'nothing extra in ' + fmt(b)}. Each <b>circle</b> still multiplies to its number.`,
          run: async (c) => {
            await Promise.all([...onlyA.map((i, k) => fly(c, A.cs[i], sA[k][0], sA[k][1], 600, { delay: k * 120 })), ...onlyB.map((j, k) => fly(c, B.cs[j], sB[k][0], sB[k][1], 600, { delay: k * 120 })),
              c.anim(A.lab, [{ opacity: 1 }, { opacity: 0.3 }], 300), c.anim(B.lab, [{ opacity: 1 }, { opacity: 0.3 }], 300)]);
          }
        },
        {
          cap: both.length ? `The <b>GCF</b> is the product of the <b>middle</b>: ${productHTML(both)} = <b>${fmt(g)}</b>. With exponents, that’s each shared prime to its <b>lowest</b> power.` : `Nothing in the middle, so the GCF is <b>1</b>.`,
          run: async (c) => {
            boxG.innerHTML = `<div class="vn-rh">GCF <span>the middle</span></div><div class="vn-rv">${both.length ? productHTML(both) + ' = ' : ''}<b>${fmt(g)}</b></div>${both.length ? `<div class="vn-rx">lowest powers: ${lowest}</div>` : ''}`;
            midEls.forEach((e) => e.classList.add('lit-g'));
            await Promise.all([...midEls.map((e, k) => pulse(c, e, 1.3, 420, { delay: k * 120 })), c.fadeIn(boxG, 400, { delay: 200 })]);
          }
        }
      ];
      if (mode === 'l') steps.push({
        cap: `The <b>LCM</b> uses <b>everything</b> in the diagram: all of ${fmt(a)}’s circle, plus the extras from ${fmt(b)}’s side. ${productHTML(lcmList)} = <b>${fmt(l)}</b>. With exponents, every prime to its <b>highest</b> power.`,
        run: async (c) => {
          boxL.innerHTML = `<div class="vn-rh">LCM <span>everything</span></div><div class="vn-rv">${productHTML(lcmList)} = <b>${fmt(l)}</b></div><div class="vn-rx">highest powers: ${highest}</div>`;
          const aEls = [...midEls, ...onlyA.map((i) => A.cs[i])], bEls = onlyB.map((j) => B.cs[j]);
          [...aEls, ...bEls].forEach((e) => e.classList.add('lit-l'));
          await Promise.all(aEls.map((e, k) => pulse(c, e, 1.25, 380, { delay: k * 90 })));
          await Promise.all([...bEls.map((e, k) => pulse(c, e, 1.3, 420, { delay: k * 120 })), c.fadeIn(boxL, 400, { delay: 150 })]);
        }
      });
      return steps;
    }
  };
}
const vennG = vennDef('g', 'GCF with a Venn diagram of prime factors', [{ v: '60,90', label: '60 & 90' }, { v: '12,18', label: '12 & 18' }, { v: '45,75', label: '45 & 75' }, { sep: 'Example 2 check:' }, { v: '126,210', label: '126 & 210' }, { v: '165,275', label: '165 & 275' }]);
vennG.minW = 860; // drawn this wide and scaled to fit beside the sidebar
const vennL = vennDef('l', 'LCM with a Venn diagram: everything in the picture', [{ v: '60,90', label: '60 & 90' }, { v: '9,12', label: '9 & 12' }, { v: '15,18', label: '15 & 18' }, { sep: 'Example 4 check:' }, { v: '18,45', label: '18 & 45' }, { v: '84,126', label: '84 & 126' }]);
vennL.minW = 940; // drawn this wide and scaled to fit beside the sidebar

/* ============ 1 & 2. The exponent table: lowest power (GCF), highest power (LCM) ============ */
function tableDef(title, choices) {
  return {
    title, height: 372, choices,
    intro: (v) => { const [m, list] = v.split(':'); return `Find the ${m === 'g' ? 'GCF' : m === 'l' ? 'LCM' : 'GCF and LCM'} of <b>${nameList(parse(list))}</b> using exponents. One <b>column</b> for each prime.`; },
    make(stage, v, ex) {
      const [mode, list] = v.split(':'), ns = parse(list), W = ex.W, M = ns.map(counts);
      const P = [...new Set(ns.flatMap(primeFactors))].sort((x, y) => x - y);
      const lw = 360, cw = Math.min(120, (W - lw - 16) / P.length), X = (j) => lw + (j + 0.5) * cw, Y = (i) => 84 + i * 56;
      const divY = Y(ns.length - 1) + 36, yG = divY + 40, yL = mode === 'b' ? yG + 60 : yG;
      add(stage, h('div', 'tb-head', 'prime factorization'), 20, 22);
      const heads = P.map((p, j) => add(stage, chip(p, 'c sm'), X(j), 34));
      const labs = ns.map((n, i) => { const e = add(stage, h('div', 'tb-lab', `${fmt(n)} = ${expHTML(primeFactors(n))}`), 20, Y(i)); e.style.translate = '0 -50%'; e.style.opacity = 0; return e; });
      const cells = ns.map((n, i) => P.map((p, j) => { const k = M[i].get(p) || 0; const e = add(stage, h('div', 'tb-cell c' + (k ? '' : ' none'), '<span>' + (k ? pw1(p, k) : '—') + '</span>'), X(j), Y(i)); e.style.opacity = 0; e._k = k; return e; }));
      const div = add(stage, h('div', 'tb-div'), 20, divY); div.style.width = W - 40 + 'px'; div.style.opacity = 0;
      const steps = [
        { cap: `Write each number with exponents: ${ns.map((n) => fmt(n) + ' = ' + expHTML(primeFactors(n))).join(', &nbsp;')}.`, run: (c) => Promise.all([...heads.map((e, j) => c.pop(e, 300, { delay: j * 60 })), ...labs.map((e, i) => c.fadeIn(e, 320, { delay: i * 160 }))]) },
        { cap: 'Give each prime its own <b>column</b>. A dash means that prime isn’t in the number at all.', run: (c) => Promise.all([...cells.flatMap((row, i) => row.map((e, j) => c.fadeIn(e, 320, { delay: i * 120 + j * 50, from: 'translateX(-30px)' }))), c.fadeIn(div, 300, { delay: 300, from: 'none' })]) }
      ];
      const result = (kind, y) => {
        const isG = kind === 'g', picks = [], keep = [];
        P.forEach((p, j) => {
          const ks = cells.map((row) => row[j]._k), k = isG ? Math.min(...ks) : Math.max(...ks);
          picks.push({ j, k, i: ks.indexOf(k) }); if (k) keep.push(pw(p, k));
        });
        const val = P.reduce((acc, p, j) => acc * Math.pow(p, picks[j].k), 1), missing = P.filter((p, j) => !picks[j].k);
        return {
          cap: isG ? `<b>GCF:</b> in each column take the <b>lowest</b> power.${missing.length ? ` ${listAnd(missing.map(String))} ${missing.length > 1 ? 'are' : 'is'} missing from at least one number, so ${missing.length > 1 ? 'they are' : 'it is'} left out.` : ''} GCF = ${keep.join(' × ')} = <b>${fmt(val)}</b>.`
            : `<b>LCM:</b> in each column take the <b>highest</b> power — every prime is used. LCM = ${keep.join(' × ')} = <b>${fmt(val)}</b>.`,
          run: async (c) => {
            const lab = add(stage, h('div', 'tb-res ' + kind, `${isG ? 'GCF' : 'LCM'} = <b>${fmt(val)}</b>`), 20, y); lab.style.translate = '0 -50%';
            const jobs = [];
            picks.forEach(({ j, k, i }, q) => {
              const col = cells.map((row) => row[j]);
              if (isG && !k) col.forEach((e) => e.classList.add('out'));
              else col[i].classList.add('pick-' + kind);
              const e = add(stage, h('div', 'tb-cell c res-' + kind + (k ? '' : ' none'), '<span>' + (k ? pw1(P[j], k) : '—') + '</span>'), X(j), y);
              jobs.push(pulse(c, col[i], 1.2, 360, { delay: q * 140 }), c.fadeIn(e, 300, { delay: 200 + q * 140, from: 'translateY(-20px)' }));
            });
            jobs.push(c.fadeIn(lab, 350, { delay: 200 + P.length * 140 }));
            await Promise.all(jobs);
          }
        };
      };
      if (mode !== 'l') steps.push(result('g', yG));
      if (mode !== 'g') {
        const st = result('l', yL);
        if (mode === 'b') { const run0 = st.run; st.run = async (c) => { cells.flat().forEach((e) => e.classList.remove('out', 'pick-g')); await run0(c); }; }
        steps.push(st);
      }
      return steps;
    }
  };
}
const tableG = tableDef('The exponent shortcut: lowest power for the GCF', [{ v: 'g:60,90', label: '60 & 90' }, { v: 'g:10,15,25', label: '10, 15, 25' }, { sep: 'Example 2 check:' }, { v: 'g:126,210', label: '126 & 210' }, { v: 'g:165,275', label: '165 & 275' }, { v: 'g:180,240,420', label: '180, 240, 420' }, { v: 'g:132,220,308,396', label: '132, 220, 308, 396' }]);
const tableL = tableDef('The exponent shortcut: highest power for the LCM', [{ v: 'l:15,18,21', label: '15, 18, 21' }, { v: 'b:60,90', label: '60 & 90 (both)' }, { sep: 'Example 4 check:' }, { v: 'l:18,45', label: '18 & 45' }, { v: 'l:84,126', label: '84 & 126' }, { v: 'l:20,45,75', label: '20, 45, 75' }]);

/* ============ 2. LCM by listing multiples: hopping frogs ============ */
const FCOL = ['#3e9b4f', '#2f7fd0', '#d9822b'];
const FROG = (col) => `<svg viewBox="0 0 48 40" aria-hidden="true"><ellipse cx="24" cy="27" rx="19" ry="12" fill="${col}"/><circle cx="14" cy="13" r="7.5" fill="${col}"/><circle cx="34" cy="13" r="7.5" fill="${col}"/><circle cx="14" cy="12" r="4" fill="#fff"/><circle cx="34" cy="12" r="4" fill="#fff"/><circle cx="15" cy="12.6" r="2.1" fill="#1c2230"/><circle cx="33" cy="12.6" r="2.1" fill="#1c2230"/><path d="M16 29 q8 5 16 0" stroke="#1c2230" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
const frogs = {
  title: 'LCM by listing multiples: frogs on a number line',
  height: 430,
  choices: [{ v: '9,12', label: '9 & 12' }, { v: '4,6', label: '4 & 6' }, { v: '8,10', label: '8 & 10' }, { sep: 'Example 3 check:' }, { v: '5,9', label: '5 & 9' }, { v: '6,8,12', label: '6, 8, 12' }, { v: '15,18,21', label: '15, 18, 21' }],
  intro: (v) => `Each frog starts at 0 and always makes the same size hop: ${listAnd(parse(v).map((n) => '<b>' + n + '</b>'))}. Where do they <b>first land on the same number</b>?`,
  make(stage, v, ex) {
    const ns = parse(v), W = ex.W, L = ns.reduce(lcm), N = 2 * L <= 100 ? 2 * L : L;
    const x0 = 100, x1 = W - 34, sc = (x1 - x0) / (N * 1.03), X = (m) => x0 + m * sc;
    const gap = ns.length === 2 ? 130 : 102, laneY = (i) => 104 + i * gap, axisY = laneY(ns.length - 1) + 60;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'fr-svg'); stage.appendChild(svg);
    const bands = [];
    const band = (m, cls) => { const b = add(stage, h('div', 'fr-band ' + cls), X(m) - 17, 46); b.style.height = axisY - 46 + 'px'; b.style.opacity = 0; stage.insertBefore(b, svg); bands.push(b); return b; };
    const b1 = band(L, 'first'), b2 = N === 2 * L ? band(2 * L, 'again') : null;
    // axis
    const ax = add(stage, h('div', 'fr-axis'), x0, axisY); ax.style.width = x1 - x0 + 'px';
    const T = [1, 2, 5, 10, 20, 25, 50, 100, 200].find((t) => t * sc >= 44) || 200;
    for (let m = 0; m <= N * 1.02; m += T) { add(stage, h('div', 'fr-tick'), X(m), axisY - 5); add(stage, h('div', 'fr-tl c', fmt(m)), X(m), axisY + 18); }
    const lanes = ns.map((s, i) => {
      const y = laneY(i), col = FCOL[i];
      const line = add(stage, h('div', 'fr-lane'), x0, y); line.style.width = x1 - x0 + 'px'; line.style.background = col;
      const lab = add(stage, h('div', 'fr-lab', `+${s}<small>each hop</small>`), 18, y); lab.style.translate = '0 -50%'; lab.style.color = col;
      add(stage, h('div', 'fr-dot zero c'), X(0), y);
      const frog = add(stage, h('div', 'frog c', FROG(col)), X(0), y - 22);
      return { s, y, col, frog, every: Math.ceil((String(N).length * 9 + 12) / (s * sc)), dots: {} };
    });
    const hops = ns.reduce((t, s) => t + Math.floor(N / s), 0);
    const steps = lanes.map((ln, i) => {
      const ms = []; for (let m = ln.s; m <= N; m += ln.s) ms.push(m);
      return {
        cap: `${i === 0 ? 'The first' : i === 1 ? 'The second' : 'The third'} frog hops by <b>${ln.s}</b>. It lands on the <b>multiples of ${ln.s}</b>: ${ms.slice(0, 6).join(', ')}, …`,
        run: async (c) => {
          const per = Math.max(90, Math.min(360, 4200 / ms.length)), arc = Math.min(46, 12 + ln.s * sc * 0.45);
          let prev = 0;
          for (let q = 0; q < ms.length; q++) {
            const m = ms[q], xa = X(prev), xb = X(m);
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            p.setAttribute('d', `M ${xa} ${ln.y - 4} Q ${(xa + xb) / 2} ${ln.y - 4 - arc * 1.6} ${xb} ${ln.y - 4}`); p.setAttribute('stroke', ln.col); svg.appendChild(p);
            await fly(c, ln.frog, xb, ln.y - 22, per, { arc, easing: 'ease-in-out' });
            const d = add(stage, h('div', 'fr-dot c'), xb, ln.y); d.style.background = ln.col; ln.dots[m] = d;
            const nearKey = [L, 2 * L].some((K) => K !== m && K <= N && Math.abs(X(K) - xb) < String(N).length * 10 + 6);
            if (((q + 1) % ln.every === 0 && !nearKey) || m === L || m === 2 * L) { const t = add(stage, h('div', 'fr-num c', fmt(m)), xb, ln.y + 22); t.style.color = ln.col; ln.dots[m]._t = t; if (!c.fast) c.fadeIn(t, 200); }
            if (!c.fast) c.pop(d, 220);
            prev = m;
          }
        }
      };
    });
    const lab1 = add(stage, h('div', 'fr-lcm c', `LCM = ${fmt(L)}`), Math.min(X(L), W - 90), 26); lab1.style.opacity = 0;
    steps.push({
      cap: `The first number <b>every</b> frog lands on is <b>${fmt(L)}</b>, so the LCM of ${nameList(ns)} is <b>${fmt(L)}</b>.` + (hops > 40 ? ` That took ${hops} hops! With numbers like these, prime factors are much faster.` : ''),
      run: async (c) => {
        lanes.forEach((ln) => ln.dots[L] && ln.dots[L].classList.add('hit'));
        await Promise.all([c.anim(b1, [{ opacity: 0, transform: 'scaleY(.2)' }, { opacity: 1, transform: 'none' }], 450), c.pop(lab1, 420, { delay: 200 }), ...lanes.map((ln, i) => pulse(c, ln.frog, 1.3, 400, { delay: 250 + i * 100 }))]);
      }
    });
    if (b2) {
      const lab2 = add(stage, h('div', 'fr-lcm again c', fmt(2 * L)), X(2 * L), 26); lab2.style.opacity = 0;
      steps.push({
        cap: `They land together again at <b>${2 * L}</b> = 2 × ${L}. Every <b>common multiple</b> is a multiple of the LCM, and the LCM is the <b>least</b> one.`,
        run: (c) => Promise.all([c.anim(b2, [{ opacity: 0 }, { opacity: 1 }], 400), c.pop(lab2, 380, { delay: 150 })])
      });
    }
    return steps;
  }
};

/* ============ 3 & 4. Deal the primes into identical piles ============ */
function pilesDef(k, title, choices) {
  const word = k === 2 ? 'square' : 'cube', grp = k === 2 ? 'pair' : 'triple';
  const approx = (n) => { const v = Math.pow(n, 1 / k); return Math.abs(v - Math.round(v)) < 0.005 ? v.toFixed(5) : v.toFixed(2); };
  const rootTex = (n) => (k === 2 ? `\\sqrt{${texN(n)}}` : `\\sqrt[3]{${texN(n)}}`);
  return {
    title, height: 480, choices, custom: [2, 999999],
    intro: (n) => `Is <b>${fmt(n)}</b> a perfect ${word}? Factor it into primes, then try to deal the primes into <b>${k} identical piles</b>.`,
    make(stage, n, ex) {
      const W = ex.W, pf = primeFactors(n), G = groups(pf), ok = G.every((g) => g.k % k === 0);
      const root = G.reduce((acc, g) => acc * Math.pow(g.p, Math.floor(g.k / k)), 1);
      const leftW = W - 320, sp = Math.min(56, (W - 200) / pf.length), small = sp < 50;
      const lab = add(stage, h('div', 'pl-lab', fmt(n) + ' ='), 20, 40); lab.style.translate = '0 -50%';
      const x0 = 30 + Math.max(110, fmt(n).length * 16 + 40);
      const cs = pf.map((p, i) => { const e = add(stage, chip(p, 'c' + (small ? ' sm' : '')), x0 + i * sp, 40); e.style.opacity = 0; return e; });
      const bw = (leftW - 20 - 14 * (k - 1)) / k, px = (i) => 20 + i * (bw + 14), py = 88, ph = 210;
      const piles = Array.from({ length: k }, (_, i) => { const e = add(stage, h('div', 'pile', `<div class="pile-h">Pile ${i + 1}</div>`), px(i), py); e.style.width = bw + 'px'; e.style.height = ph + 'px'; return e; });
      const per = Math.max(1, Math.floor((bw - 12) / 52));
      // deal plan: each prime's copies go round-robin into the piles; any remainder has no full pair / triple
      const plan = [], cnt = Array(k).fill(0); let left = 0, idx = 0;
      G.forEach((g) => { const d = Math.floor(g.k / k); for (let r = 0; r < d; r++) for (let i = 0; i < k; i++) plan.push({ idx: idx++, pile: i, q: cnt[i]++ }); for (let r = 0; r < g.k % k; r++) plan.push({ idx: idx++, pile: -1, q: left++ }); });
      const inPile = cnt[0], rows = Math.ceil(inPile / per);
      const pslot = (i, q) => { const rw = Math.floor(q / per), inRow = Math.min(per, inPile - rw * per); return [px(i) + bw / 2 + (q % per - (inRow - 1) / 2) * 52, py + 66 + rw * 52 - (rows > 2 ? 10 : 0)]; };
      const leftLab = add(stage, h('div', 'pl-left', k === 2 ? 'no partner:' : 'not a full triple:'), 20, 334); leftLab.style.opacity = 0; leftLab.style.translate = '0 -50%';
      const lslot = (q) => [(k === 2 ? 200 : 240) + q * 54, 334];
      const pv = piles.map((_, i) => { const e = add(stage, h('div', 'pile-v c'), px(i) + bw / 2, py + ph - 26); e.style.opacity = 0; return e; });
      const eq1 = add(stage, h('div', 'pl-eq'), 20, 388), eq2 = add(stage, h('div', 'pl-eq2'), 20, 436);
      [eq1, eq2].forEach((e) => { e.style.opacity = 0; e.style.width = leftW - 10 + 'px'; });
      const pic = add(stage, h('div', 'pl-pic c'), leftW + (W - leftW) / 2 + 4, 230), picCap = add(stage, h('div', 'pl-pcap c'), leftW + (W - leftW) / 2 + 4, 420);
      pic.style.opacity = 0; picCap.style.opacity = 0; picCap.style.width = W - leftW - 24 + 'px';
      const pileProd = G.filter((g) => g.k >= k).flatMap((g) => Array(Math.floor(g.k / k)).fill(g.p));
      const leftovers = plan.filter((s) => s.pile < 0).map((s) => pf[s.idx]);
      const prodTxt = pileProd.length ? productHTML(pileProd) : '1';
      const expRoot = G.filter((g) => g.k >= k).map((g) => pw(g.p, g.k / k)).join(' × ');
      const steps = [
        { cap: `Factor it: <b>${fmt(n)} = ${productHTML(pf)}</b>.`, run: (c) => Promise.all([c.fadeIn(lab, 250), ...cs.map((e, i) => c.pop(e, 300, { delay: i * 60 }))]) },
        {
          cap: ok ? `Deal the primes into <b>${k} piles</b>, like dealing cards: one from each ${grp} to each pile. Every prime finds ${k === 2 ? 'a partner' : 'two partners'} — the piles <b>match</b>.`
            : `Deal the primes into <b>${k} piles</b>… but <b class="red">${descMulti(leftovers)}</b> ${leftovers.length > 1 ? 'are' : 'is'} left without ${k === 2 ? 'a partner' : 'a full triple'}. The piles can’t match.`,
          run: async (c) => {
            const jobs = plan.map((s, o) => {
              const [x, y] = s.pile >= 0 ? pslot(s.pile, s.q) : lslot(s.q), el = cs[s.idx];
              return fly(c, el, x, y, 560, { delay: o * Math.min(140, 1600 / plan.length), arc: 40 }).then(() => { if (s.pile < 0) { el.classList.add('lone'); return c.shake(el); } });
            });
            jobs.push(c.anim(lab, [{ opacity: 1 }, { opacity: 0.25 }], 300));
            if (!ok) jobs.push(c.fadeIn(leftLab, 300, { delay: 500 }));
            await Promise.all(jobs);
          }
        },
        ok ? {
          cap: `Each pile multiplies to <b>${fmt(root)}</b>, and ${k === 2 ? `${fmt(root)} × ${fmt(root)}` : `${fmt(root)} × ${fmt(root)} × ${fmt(root)}`} = ${fmt(n)}. So ${tex(rootTex(n))} = <b>${fmt(root)}</b>.`,
          run: async (c) => {
            pv.forEach((e) => (e.innerHTML = '= ' + fmt(root)));
            eq1.innerHTML = `${tex(rootTex(n))} = ${prodTxt} = <b class="ok">${fmt(root)}</b>`;
            await Promise.all([...pv.map((e, i) => c.pop(e, 380, { delay: i * 120 })), c.fadeIn(eq1, 400, { delay: 300 })]);
          }
        } : {
          cap: `<b>${fmt(n)} is not a perfect ${word}.</b> On the calculator, ${tex(rootTex(n))} ≈ ${approx(n)} — not a whole number.`,
          run: async (c) => {
            eq1.innerHTML = `<b class="red">not a perfect ${word}</b> &nbsp;<span class="muted">${tex(rootTex(n))} ≈ ${approx(n)}</span>`;
            await c.fadeIn(eq1, 400);
          }
        },
        {
          cap: ok ? `In exponent form, ${fmt(n)} = ${expHTML(pf)}. Every exponent is ${k === 2 ? '<b>even</b>' : 'a <b>multiple of 3</b>'}. ${k === 2 ? '<b>Halve</b> each exponent' : '<b>Divide</b> each exponent <b>by 3</b>'} to get the root: ${expRoot} = ${fmt(root)}.`
            : `In exponent form, ${fmt(n)} = ${expHTML(pf)}. The exponent${G.filter((g) => g.k % k).length > 1 ? 's' : ''} in red ${G.filter((g) => g.k % k).length > 1 ? 'are' : 'is'} ${k === 2 ? '<b>odd</b>' : '<b>not a multiple of 3</b>'}.`,
          run: async (c) => {
            eq2.innerHTML = `${fmt(n)} = ` + G.map((g) => (g.k % k ? `<span class="bad">${pw1(g.p, g.k)}</span>` : `<span class="good">${pw1(g.p, g.k)}</span>`)).join(' × ') +
              (ok ? ` &nbsp;→&nbsp; ${tex(rootTex(n))} = ${G.map((g) => pw1(g.p, g.k / k)).join(' × ')} = <b class="ok">${fmt(root)}</b>` : ` &nbsp;<span class="muted">${k === 2 ? 'odd exponent' : 'not a multiple of 3'}</span>`);
            await c.fadeIn(eq2, 400);
          }
        }
      ];
      const r0 = ok ? root : iroot(n, k), extra = n - Math.pow(r0, k);
      steps.push({
        cap: ok ? (k === 2 ? `Picture it: ${fmt(n)} square tiles make one solid <b>${fmt(root)} × ${fmt(root)}</b> square.` : `Picture it: ${fmt(n)} small cubes stack into one solid <b>${fmt(root)} × ${fmt(root)} × ${fmt(root)}</b> cube.`)
          : `${fmt(n)} sits between ${fmt(r0)}${k === 2 ? '²' : '³'} = ${fmt(Math.pow(r0, k))} and ${fmt(r0 + 1)}${k === 2 ? '²' : '³'} = ${fmt(Math.pow(r0 + 1, k))}. The biggest ${word} uses ${fmt(Math.pow(r0, k))} and leaves <b class="red">${fmt(extra)}</b> over.`,
        run: async (c) => {
          const size = k === 2 ? 240 : 170, u = size / r0;
          pic.innerHTML = (k === 2 ? gridSVG(r0, r0, u) : boxSVG(r0, r0, r0, u)) + (ok ? '' : `<div class="pl-extra">+ ${fmt(extra)} left over</div>`);
          picCap.innerHTML = ok ? (k === 2 ? `${fmt(root)} × ${fmt(root)} = ${fmt(n)}` : `${fmt(root)} × ${fmt(root)} × ${fmt(root)} = ${fmt(n)}`) : `${fmt(r0)}${k === 2 ? '²' : '³'} = ${fmt(Math.pow(r0, k))}`;
          await Promise.all([c.anim(pic, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], 500), c.fadeIn(picCap, 350, { delay: 300 })]);
        }
      });
      return steps;
    }
  };
}
const squares = pilesDef(2, 'Perfect square? Deal the primes into two identical piles', [144, 4, 100, 36, 12, 48, { sep: 'Example 5 check:' }, { v: 15876, label: '15 876' }, { sep: 'Example 6 check:' }, { v: 1089, label: '1 089' }, { v: 2028, label: '2 028' }]);
const cubes = pilesDef(3, 'Perfect cube? Deal the primes into three identical piles', [{ v: 1000, label: '1 000' }, 8, 125, 27, 18, 54, { sep: 'Example 7 check:' }, { v: 5832, label: '5 832' }, { v: 39304, label: '39 304' }]);
cubes.minW = 780; // drawn this wide and scaled to fit beside the sidebar

/* ============ 4. Square, cube, both or neither: read the exponents ============ */
const tester = {
  title: 'Square, cube, both, or neither? Read the exponents',
  height: 316,
  choices: [36, 216, 400, 729, { v: 1728, label: '1 728' }, { v: 2025, label: '2 025' }, { v: 4096, label: '4 096' }, 48],
  custom: [2, 9999999],
  intro: (n) => `Is <b>${fmt(n)}</b> a perfect square, a perfect cube, both, or neither?`,
  make(stage, n, ex) {
    const W = ex.W, pf = primeFactors(n), G = groups(pf), m = G.length;
    const x0 = 300, sp = Math.min(150, (W - x0 - 290) / Math.max(1, m)), X = (j) => x0 + (j + 0.5) * sp, yR = [52, 150, 240];
    const lab = add(stage, h('div', 'tp-lab', fmt(n) + ' ='), x0 - 24, yR[0]); lab.style.translate = '-100% -50%';
    const pows = G.map((g, j) => { const e = add(stage, h('div', 'tp-pow c' + (sp < 110 ? ' sm' : ''), `${fmt(g.p)}<sup>${g.k}</sup>`), X(j), yR[0]); e.style.opacity = 0; return e; });
    const xs = G.slice(1).map((_, j) => { const e = add(stage, h('div', 'tp-x c', '×'), x0 + (j + 1) * sp, yR[0]); e.style.opacity = 0; return e; });
    const rowLab = (y, t, s) => { const e = add(stage, h('div', 'tp-rl', `${t}<small>${s}</small>`), 20, y); e.style.translate = '0 -50%'; e.style.opacity = 0; return e; };
    const rl = [rowLab(yR[1], 'Perfect square?', 'every exponent even'), rowLab(yR[2], 'Perfect cube?', 'every exponent a multiple of 3')];
    const sq = G.every((g) => g.k % 2 === 0), cu = G.every((g) => g.k % 3 === 0);
    const rS = G.reduce((a, g) => a * Math.pow(g.p, g.k / 2), 1), rC = G.reduce((a, g) => a * Math.pow(g.p, g.k / 3), 1);
    const test = (row, kk, good, rootStr) => ({
      run: async (c) => {
        const jobs = [c.fadeIn(rl[row], 300)];
        G.forEach((g, j) => { const yes = g.k % kk === 0, e = add(stage, h('div', 'tp-b c ' + (yes ? 'yes' : 'no'), `${g.k} ${yes ? '✓' : '✗'}`), X(j), yR[row + 1]); jobs.push(c.pop(e, 320, { delay: 150 + j * 140 })); pows[j].classList.remove('odd2', 'odd3'); pows[j].classList.toggle('odd' + kk, !yes); });
        const v = add(stage, h('div', 'tp-v ' + (good ? 'yes' : 'no'), good ? rootStr : (kk === 2 ? 'not a square' : 'not a cube')), W - 20, yR[row + 1]); v.style.translate = '-100% -50%';
        jobs.push(c.anim(v, [{ opacity: 0, transform: 'scale(1.5) rotate(-8deg)' }, { opacity: 1, transform: 'rotate(-3deg)' }], 420, { delay: 250 + m * 140, easing: 'cubic-bezier(.2,1.4,.4,1)' }));
        await Promise.all(jobs);
      }
    });
    const odd2 = G.filter((g) => g.k % 2).map((g) => fmt(g.p)), odd3 = G.filter((g) => g.k % 3).map((g) => fmt(g.p));
    const both = sq && cu ? ' It is <b>both</b> a perfect square and a perfect cube!' : !sq && !cu ? ' So it is <b>neither</b>.' : '';
    return [
      { cap: `Write ${fmt(n)} with exponents: <b>${fmt(n)} = ${expHTML(pf)}</b>.`, run: (c) => Promise.all([c.fadeIn(lab, 250), ...pows.map((e, j) => c.pop(e, 360, { delay: j * 120 })), ...xs.map((e) => c.fadeIn(e, 300, { delay: 200, from: 'none' }))]) },
      Object.assign(test(0, 2, sq, `${tex(`\\sqrt{${texN(n)}}`)} = ${fmt(rS)}`), {
        cap: sq ? `Every exponent is <b>even</b>, so the primes pair up: <b>a perfect square</b>. Halve the exponents: ${tex(`\\sqrt{${texN(n)}}`)} = ${G.map((g) => pw(g.p, g.k / 2)).join(' × ')} = <b>${fmt(rS)}</b>.`
          : `The exponent${odd2.length > 1 ? 's' : ''} on ${listAnd(odd2)} ${odd2.length > 1 ? 'are' : 'is'} <b>odd</b>, so the primes can’t all pair up: <b>not</b> a perfect square.`
      }),
      Object.assign(test(1, 3, cu, `${tex(`\\sqrt[3]{${texN(n)}}`)} = ${fmt(rC)}`), {
        cap: (cu ? `Every exponent is a <b>multiple of 3</b>, so the primes make triples: <b>a perfect cube</b>. ${tex(`\\sqrt[3]{${texN(n)}}`)} = ${G.map((g) => pw(g.p, g.k / 3)).join(' × ')} = <b>${fmt(rC)}</b>.`
          : `The exponent${odd3.length > 1 ? 's' : ''} on ${listAnd(odd3)} ${odd3.length > 1 ? 'are' : 'is'} <b>not a multiple of 3</b>: <b>not</b> a perfect cube.`) + both
      })
    ];
  }
};

/* ============ warm-up: the locker problem ============ */
function mountLockers() {
  const host = document.getElementById('lockers'); if (!host) return;
  const st = document.getElementById('lk-status'), hist = document.getElementById('lk-hist'), L = [];
  let student = 0, gen = 0;
  for (let i = 1; i <= 100; i++) { const b = h('button', 'lk', '<span>' + i + '</span>'); b.type = 'button'; b.title = 'Locker ' + i; b.onclick = () => showHist(i); host.appendChild(b); L[i] = b; }
  const HINT = '<span class="muted">Tap any locker to see which students touch it.</span>';
  function setState(s) {
    gen++;
    for (let i = 1; i <= 100; i++) { let t = 0; for (let d = 1; d <= s; d++) if (i % d === 0) t++; L[i].classList.toggle('open', t % 2 === 1); L[i].classList.remove('sq', 'hit'); }
    student = s;
  }
  const flash = (i) => { L[i].classList.add('hit'); L[i].animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-5px)' }, { transform: 'translateY(0)' }], 260); setTimeout(() => L[i].classList.remove('hit'), 700); };
  function finish() {
    const open = []; for (let i = 1; i <= 100; i++) if (L[i].classList.contains('open')) { open.push(i); L[i].classList.add('sq'); }
    st.innerHTML = `All 100 students done: <b>${open.length} lockers open</b> — ${open.join(', ')}. The <b>perfect squares</b>!`;
  }
  function next(quick) {
    if (student >= 100) return;
    const s = ++student, g = gen, ms = []; for (let m = s; m <= 100; m += s) ms.push(m);
    ms.forEach((m, k) => { const go = () => { if (g !== gen) return; L[m].classList.toggle('open'); flash(m); }; if (quick) go(); else setTimeout(go, k * Math.min(70, 900 / ms.length)); });
    st.innerHTML = ms.length > 1 ? `<b>Student ${s}</b> toggled every ${s === 1 ? '' : ordinal(s) + ' '}locker: ${ms.slice(0, 4).join(', ')}${ms.length > 4 ? ', …, ' + ms[ms.length - 1] : ''} <span class="muted">(${ms.length} lockers)</span>` : `<b>Student ${s}</b> toggled just locker ${s}.`;
    if (s === 100) setTimeout(() => { if (g === gen) finish(); }, quick ? 0 : 400);
  }
  const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
  function showHist(i) {
    const f = factors(i), seq = f.map((_, k) => (k % 2 === 0 ? 'o' : 'c'));
    hist.innerHTML = `<b>Locker ${i}</b> is touched by Student${f.length > 1 ? 's' : ''} <b>${f.join(', ')}</b> — the factors of ${i}. <span class="lk-seq">${seq.map((s) => `<i class="${s}"></i>`).join('')}</span> ${f.length} toggle${f.length > 1 ? 's' : ''} → ends <b class="${f.length % 2 ? 'ok' : 'red'}">${f.length % 2 ? 'open' : 'closed'}</b>.`;
    L.forEach((b) => b && b.classList.remove('sel')); L[i].classList.add('sel');
  }
  document.querySelector('[data-lk=next]').onclick = () => next(false);
  document.querySelector('[data-lk=reset]').onclick = () => { setState(0); hist.innerHTML = HINT; L.forEach((b) => b && b.classList.remove('sel')); st.innerHTML = 'All 100 lockers are <b>closed</b>. <b>Student 1</b> is up.'; };
  document.querySelector('[data-lk=all]').onclick = async () => {
    const g = ++gen;
    while (student < 100 && g === gen) { next(true); await new Promise((r) => setTimeout(r, student < 12 ? 160 : 45)); }
  };
  setState(2); hist.innerHTML = HINT;
  st.innerHTML = 'After Students 1 and 2: odd lockers open, even lockers closed. <b>Student 3</b> is next…';
}

function mountWarmup() {
  document.querySelectorAll('[data-wa]').forEach((b) => b.addEventListener('click', () => b.closest('.wq-body').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

function mountFigures() {
  document.querySelectorAll('[data-grid]').forEach((e) => { const [r, c] = e.dataset.grid.split('x').map(Number); e.innerHTML = gridSVG(r, c, 26); });
  document.querySelectorAll('[data-box]').forEach((e) => { const [x, y, z] = e.dataset.box.split('x').map(Number); e.innerHTML = boxSVG(x, y, z, 30); });
  document.querySelectorAll('[data-tree]').forEach((e) => { e.innerHTML = treeSVG(e.dataset.tree); });
}

function mountExplainers() {
  const defs = { gcfList, tiles, vennG, vennL, tableG, tableL, frogs, squares, cubes, tester };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountFigures(); mountExplainers(); mountLockers(); mountWarmup();

/* ---------- Fun fact (the brown box): two cicada broods, every 13 and every 17 years, meet every LCM = 221 years ----------
 * A timeline from 1803 to 2245 fills in when the box scrolls into view (or on Replay / a tap): a cicada for every year each
 * brood comes out, and a gold line where they come out together (1803, 2024, 2245). Years after this one are faded. */
(function cicadaTimeline() {
  const svg = document.getElementById('cicada-anim'); if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.keys(attrs || {}).forEach((k) => e.setAttribute(k, attrs[k])); (parent || svg).appendChild(e); return e; };
  const txt = (s, attrs, parent) => { const e = mk('text', attrs, parent); e.textContent = s; return e; };
  const Y0 = 1803, Y1 = 2245, X0 = 40, X1 = 568, NOW = new Date().getFullYear(), JOINT = [1803, 2024, 2245];
  const X = (y) => X0 + ((y - Y0) / (Y1 - Y0)) * (X1 - X0);
  const ROWS = [{ n: 13, y: 112, c: '#0f7f80', name: 'Brood XIX: every 13 years' }, { n: 17, y: 184, c: '#a8482a', name: 'Brood XIII: every 17 years' }];
  txt('Year', { x: X0, y: 34, class: 'ci-cap' });
  const yearT = txt(String(Y0), { x: X0 + 44, y: 38, class: 'ci-year' });
  const note = txt('', { x: X1, y: 36, 'text-anchor': 'end', class: 'ci-note' });
  // the axis
  mk('line', { x1: X0, x2: X1, y1: 226, y2: 226, class: 'ci-axis' });
  for (let y = 1850; y <= 2200; y += 50) { mk('line', { x1: X(y), x2: X(y), y1: 222, y2: 230, class: 'ci-axis' }); if (y !== 2000) txt(String(y), { x: X(y), y: 246, 'text-anchor': 'middle', class: 'ci-tick' }); }
  if (NOW > Y0 && NOW < Y1) { mk('line', { x1: X(NOW), x2: X(NOW), y1: 74, y2: 226, class: 'ci-now' }); txt('now', { x: X(NOW) + 4, y: 82, class: 'ci-tick' }); }
  // where they meet
  const joints = JOINT.map((y) => {
    const g = mk('g', { class: 'ci-j' });
    mk('line', { x1: X(y), x2: X(y), y1: 92, y2: 226, class: 'ci-jline' }, g);
    mk('circle', { cx: X(y), cy: 148, r: 46, class: 'ci-burst' }, g);
    txt(String(y), { x: X(y), y: 268, 'text-anchor': y === Y0 ? 'start' : y === Y1 ? 'end' : 'middle', class: 'ci-jyear' }, g);
    return { y, g };
  });
  // the two broods
  const bugs = [];
  ROWS.forEach((r) => {
    txt(r.name, { x: X0, y: r.y - 24, class: 'ci-row', fill: r.c });
    mk('line', { x1: X0, x2: X1, y1: r.y, y2: r.y, class: 'ci-track' });
    for (let y = Y0; y <= Y1; y += r.n) {
      const at = mk('g', { transform: `translate(${X(y).toFixed(1)} ${r.y})` }), g = mk('g', { class: 'ci-bug' + (y > NOW ? ' ci-future' : '') }, at);
      mk('ellipse', { cx: -3.2, cy: 1, rx: 3.2, ry: 8.5, transform: 'rotate(18 -3.2 1)', class: 'ci-wing' }, g);
      mk('ellipse', { cx: 3.2, cy: 1, rx: 3.2, ry: 8.5, transform: 'rotate(-18 3.2 1)', class: 'ci-wing' }, g);
      mk('ellipse', { cx: 0, cy: 1, rx: 3.6, ry: 7, fill: r.c }, g);
      mk('circle', { cx: 0, cy: -6.5, r: 3.4, fill: '#3d2817' }, g);
      mk('circle', { cx: -2.4, cy: -7.5, r: 1.3, fill: '#e2462e' }, g); mk('circle', { cx: 2.4, cy: -7.5, r: 1.3, fill: '#e2462e' }, g);
      bugs.push({ y, g });
    }
  });
  const cursor = mk('line', { x1: X0, x2: X0, y1: 74, y2: 226, class: 'ci-cursor' });
  // play: 1803 → 2024 (pause there: they meet again) → 2245
  const A = 6500, P = 1500, B = 3800;
  const yearAt = (ms) => (ms < A ? Y0 + ((2024 - Y0) * ms) / A : ms < A + P ? 2024 : Math.min(Y1, 2024 + ((Y1 - 2024) * (ms - A - P)) / B));
  let t0 = 0, raf = 0;
  function draw(t) {
    const yr = Math.floor(t + 1e-6);
    yearT.textContent = String(yr);
    cursor.setAttribute('x1', X(t)); cursor.setAttribute('x2', X(t)); cursor.style.opacity = t >= Y1 ? 0 : 1;
    bugs.forEach((b) => b.g.classList.toggle('on', b.y <= t + 1e-6));
    joints.forEach((j) => j.g.classList.toggle('on', j.y <= t + 1e-6));
    note.textContent = yr === 2024 ? 'together again: 221 years later' : yr >= Y1 ? 'next time: 2245' : yr === Y0 ? 'both come out' : '';
  }
  function frame(now) { if (!t0) t0 = now; const t = yearAt(now - t0); draw(t); if (t < Y1) raf = requestAnimationFrame(frame); }
  function play() {
    cancelAnimationFrame(raf); t0 = 0;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { draw(Y1); return; }
    bugs.forEach((b) => b.g.classList.remove('on')); joints.forEach((j) => j.g.classList.remove('on'));
    raf = requestAnimationFrame(frame);
  }
  draw(Y0);
  svg.addEventListener('click', play);
  const btn = svg.closest('.hist-anim') && svg.closest('.hist-anim').querySelector('.hist-play'); if (btn) btn.addEventListener('click', play);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); play(); } }, { threshold: 0.5 });
    io.observe(svg);
  } else play();
})();
