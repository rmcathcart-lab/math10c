/* Math 10C · Unit 1 · Lesson 2 — Prime Factorization at Work: GCF and LCM. The explainers on this page, the hot-dog warm-up
 * and the cicada timeline. (The perfect-square / perfect-cube explainers and the locker warm-up moved to Lesson 3.) */
import { h, fmt, Explainer, factors, primeFactors, productHTML, expHTML, decimal } from '../explain.js';
import { tex } from '../tex.js';
import { standup } from '../standup.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const parse = (v) => String(v).split(',').map(Number);
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;
const listAnd = (arr) => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]);
const nameList = (ns) => listAnd(ns.map(fmt));
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

/* ---------- drawing: a little factor tree ---------- */
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
  choices: [{ v: '60,90', label: '60 & 90' }, { v: '24,32', label: '24 & 32 (bags)' }, { v: '10,15,25', label: '10, 15, 25' }, { sep: 'Example 1 check:' }, { v: '16,24,40', label: '16, 24, 40' }, { v: '21,28', label: '21 & 28' }, { v: '48,72', label: '48 & 72' }],
  intro: (v) => `Which numbers divide evenly into <b>every one</b> of ${nameList(parse(v))}? List each number’s factors, line them up, and look for the <b>biggest</b> one they all share.`,
  make(stage, v, ex) {
    const ns = parse(v), W = ex.W, F = ns.map(factors), U = [...new Set(F.flat())].sort((a, b) => a - b);
    const common = U.filter((u) => F.every((f) => f.includes(u))), g = common[common.length - 1], bags = v === '24,32';
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
      cap: `The columns filled in <b>every</b> row are the <b>common factors</b>: ${common.map(fmt).join(', ')}.` + (bags ? ' Any of these works as a number of take-home bags.' : ''),
      run: async (c) => {
        const jobs = common.map((u, k) => c.anim(bands[u], [{ opacity: 0, transform: 'scaleY(.2)' }, { opacity: 1, transform: 'none' }], 420, { delay: k * 70 }));
        chips.flat().forEach((e) => e.classList.add(common.includes(e._v) ? 'common' : 'dim'));
        res.innerHTML = `Common factors: <b>${common.map(fmt).join(', ')}</b>`;
        jobs.push(c.fadeIn(res, 350, { delay: 300 }));
        await Promise.all(jobs);
      }
    });
    steps.push({
      cap: `The biggest common factor is <b>${g}</b>, so the <b>GCF</b> of ${nameList(ns)} is <b>${g}</b>.` + (bags ? ' The most bags is <b>8</b>: 24 ÷ 8 = 3 hot dogs and 32 ÷ 8 = 4 buns in each.' : g === 1 ? ' Only 1 is shared.' : ''),
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
  choices: [{ v: '9,12', label: '9 & 12' }, { v: '8,10', label: '8 & 10 (packs)' }, { v: '4,6', label: '4 & 6' }, { sep: 'Example 3 check:' }, { v: '5,9', label: '5 & 9' }, { v: '6,8,12', label: '6, 8, 12' }, { v: '15,18,21', label: '15, 18, 21' }],
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
      cap: `The first number <b>every</b> frog lands on is <b>${fmt(L)}</b>, so the LCM of ${nameList(ns)} is <b>${fmt(L)}</b>.` + (v === '8,10' ? ' The warm-up: 40 buns (5 packs) and 40 hot dogs (4 packs).' : hops > 40 ? ` That took ${hops} hops! With numbers like these, prime factors are much faster.` : ''),
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

/* ============ 3. GCF in a word problem: share everything into identical bags ============ */
const bags = {
  title: 'Identical groups, nothing left over: that’s a GCF',
  height: 400,
  choices: [{ v: '24,32,hot dogs,buns,bags', label: '24 & 32 (warm-up)' }, { v: '12,18,red beads,blue beads,kits', label: '12 & 18' }, { v: '18,27,pencils,erasers,packs', label: '18 & 27' },
    { sep: 'Example 5 check:' }, { v: '48,60,roses,tulips,bouquets', label: '48 roses & 60 tulips' }],
  intro: (v) => { const [a, b, na, nb, grp] = v.split(','); return `<b>${a} ${na}</b> and <b>${b} ${nb}</b> are shared into identical ${grp}, with <b>nothing left over</b>. What is the greatest number of ${grp}?`; },
  make(stage, v, ex) {
    const [as, bs, na, nb, grp] = v.split(','), a = +as, b = +bs, W = ex.W, g = gcd(a, b);
    const COL = { 'hot dogs': '#c4523a', buns: '#e2a64e', roses: '#d0477a', tulips: '#8a58c9', 'red beads': '#d0477a', 'blue beads': '#3b78d8', pencils: '#e0a21a', erasers: '#3b9ad8' };
    const ca = COL[na] || '#d0477a', cb = COL[nb] || '#3b78d8';
    const only = (n) => { for (let t = n - 1; t > 1; t--) if ((a % t === 0) !== (b % t === 0)) return t; return null; };
    const t1 = only(g), t2 = (() => { for (let t = g + 1; t <= 18; t++) if ((a % t === 0) !== (b % t === 0)) return t; return null; })();
    // the two piles
    const pitch = 15, perRow = Math.max(12, Math.min(30, Math.floor((W - 210) / pitch)));
    const pile = (n, col, y, name) => {
      const lab = add(stage, h('div', 'bg-lab', `${n} <small>${name}</small>`), 20, y + 8); lab.style.translate = '0 -50%';
      const dots = []; for (let i = 0; i < n; i++) { const d = add(stage, h('div', 'bg-dot'), 190 + (i % perRow) * pitch, y + Math.floor(i / perRow) * pitch); d.style.background = col; d.style.opacity = 0; dots.push(d); }
      return { lab, dots };
    };
    const rowsA = Math.ceil(a / perRow), yB = 22 + Math.max(rowsA * pitch, 30), A = pile(a, ca, 12, na), B = pile(b, cb, yB, nb);
    const topEnd = yB + Math.max(Math.ceil(b / perRow) * pitch, 24) + 8;
    const bagY = topEnd + 14, bagH = Math.min(118, 400 - bagY - 92);
    const tried = add(stage, h('div', 'bg-tried'), 20, 400 - 40); tried.style.opacity = 0;
    const triedList = [];
    let layer = null;
    async function drawBags(c, n, best) {
      if (layer) { const old = layer; c.anim(old, [{ opacity: 1 }, { opacity: 0 }], 200).then(() => old.remove()); }
      layer = add(stage, h('div', 'bg-layer'), 0, 0);
      const qa = Math.floor(a / n), qb = Math.floor(b / n), ra = a % n, rb = b % n, gap = 8, bw = Math.min(92, (W - 40 - gap * (n - 1)) / n);
      const x0 = 20 + (W - 40 - n * bw - gap * (n - 1)) / 2, jobs = [], cols = bw >= 46 ? 3 : 2, dp = Math.min(14, (bw - 8) / cols);
      for (let i = 0; i < n; i++) {
        const bag = add(layer, h('div', 'bg-bag' + (best ? ' best' : '')), x0 + i * (bw + gap), bagY); bag.style.width = bw + 'px'; bag.style.height = bagH + 'px';
        const put = (q, col, row0) => { for (let k = 0; k < q; k++) { const d = add(bag, h('div', 'bg-dot sm'), 4 + (k % cols) * dp + (bw - 8 - cols * dp) / 2, row0 + Math.floor(k / cols) * dp); d.style.background = col; d.style.width = d.style.height = dp - 3 + 'px'; } return row0 + Math.ceil(q / cols) * dp + 6; };
        put(qb, cb, put(qa, ca, 8));
        jobs.push(c.fadeIn(bag, 260, { delay: i * Math.min(60, 600 / n), from: 'translateY(-14px)' }));
      }
      const info = add(layer, h('div', 'bg-info c', ra || rb ? `<span class="red">left over: ${[ra ? ra + ' ' + na : '', rb ? rb + ' ' + nb : ''].filter(Boolean).join(' and ')}</span>` : `each: <b>${qa} ${na}</b> and <b>${qb} ${nb}</b>, nothing left over`), W / 2, bagY + bagH + 20);
      if (ra || rb) {
        const xs = W / 2 + 10 + info.textContent.length * 4.6;
        for (let k = 0; k < Math.min(ra + rb, 12); k++) { const d = add(layer, h('div', 'bg-dot lone'), xs + k * 16, bagY + bagH + 13); d.style.background = k < ra ? ca : cb; jobs.push(c.pop(d, 300, { delay: 500 + k * 40 })); }
      }
      jobs.push(c.fadeIn(info, 300, { delay: 400 }));
      const tag = `<span class="${ra || rb ? 'no' : 'ok'}">${n} ${ra || rb ? '✗' : '✓'}</span>`;
      if (!triedList.includes(tag)) triedList.push(tag);
      tried.innerHTML = `<b>Tried:</b> ${triedList.join(' ')}`;
      jobs.push(c.fadeIn(tried, 250));
      await Promise.all(jobs);
    }
    const rem = (x, n) => (x % n ? `${x} ÷ ${n} = ${Math.floor(x / n)}, with <b class="red">${x % n} left over</b>` : `${x} ÷ ${n} = ${x / n}`);
    const steps = [{
      cap: `<b>${a} ${na}</b> and <b>${b} ${nb}</b>. Every one of the ${grp} must get the same, and nothing can be left over.`,
      run: (c) => Promise.all([c.fadeIn(A.lab, 250), c.fadeIn(B.lab, 250, { delay: 150 }), ...A.dots.map((d, i) => c.pop(d, 260, { delay: i * 12 })), ...B.dots.map((d, i) => c.pop(d, 260, { delay: 150 + i * 12 }))])
    }];
    const dim = (c) => Promise.all([...A.dots, ...B.dots].map((d) => c.anim(d, [{ opacity: 1 }, { opacity: 0.25 }], 300)));
    if (t1) steps.push({ cap: `Try <b>${t1} ${grp}</b>: ${rem(a, t1)}; ${rem(b, t1)}. ✗ ${t1} doesn’t divide into <b>both</b> numbers.`, run: (c) => Promise.all([dim(c), drawBags(c, t1)]) });
    steps.push({ cap: `Try <b>${g} ${grp}</b>: ${a} ÷ ${g} = ${a / g} ${na} and ${b} ÷ ${g} = ${b / g} ${nb} in each. Nothing left over ✓`, run: (c) => Promise.all([dim(c), drawBags(c, g, !t2)]) });
    if (t2) steps.push({ cap: `More ${grp}? <b>${t2}</b>: ${rem(a, t2)}; ${rem(b, t2)}. ✗ Any number of ${grp} that works must divide into both: a <b>common factor</b>.`, run: (c) => drawBags(c, t2) });
    const fa = expHTML(primeFactors(a)), fb = expHTML(primeFactors(b)), fg = expHTML(primeFactors(g));
    steps.push({
      cap: `The greatest number of ${grp} is the <b>greatest common factor</b>: ${a} = ${fa}, ${b} = ${fb}, so GCF = ${fg} = <b>${g}</b>.`,
      run: async (c) => {
        await drawBags(c, g, true);
        const res = add(stage, h('div', 'bg-res'), W - 20, 400 - 40); res.style.translate = '-100% 0';
        res.innerHTML = `GCF(${a}, ${b}) = <b>${g}</b> ${grp}`;
        await c.pop(res, 380);
      }
    });
    return steps;
  }
};

/* ============ 3. LCM in a word problem: two beacons flashing on different cycles ============ */
const beacons = {
  title: 'Two beacons: when do they flash together again?',
  height: 380,
  choices: [{ v: '4,6', label: '4 s & 6 s' }, { v: '6,10', label: '6 s & 10 s' }, { v: '8,12', label: '8 s & 12 s' }, { sep: 'Example 5 check:' }, { v: '12,20', label: '12 s & 20 s' }],
  intro: (v) => { const [a, b] = parse(v); return `Two beacons flash together at midnight. One flashes every <b>${a} seconds</b>, the other every <b>${b} seconds</b>. When do they next flash <b>together</b>?`; },
  make(stage, v, ex) {
    const [a, b] = parse(v), W = ex.W, L = lcm(a, b), N = 2 * L, g = gcd(a, b);
    const x0 = 150, x1 = W - 40, X = (t) => x0 + (t / N) * (x1 - x0), rowY = [96, 196], axisY = 268;
    const cols = ['#0f8a8a', '#c06b0c'];
    const lamps = [a, b].map((p, i) => {
      add(stage, h('div', 'bc-tower c'), 62, rowY[i] + 30).style.borderColor = cols[i];
      const lamp = add(stage, h('div', 'bc-lamp c'), 62, rowY[i] - 6); lamp.style.setProperty('--bc', cols[i]);
      const lab = add(stage, h('div', 'bc-lab c', `every <b>${p} s</b>`), 62, rowY[i] + 62); lab.style.color = cols[i];
      return lamp;
    });
    rowY.forEach((y, i) => { const ln = add(stage, h('div', 'bc-track'), x0, y); ln.style.width = x1 - x0 + 'px'; ln.style.background = cols[i]; });
    const ax = add(stage, h('div', 'bc-axis'), x0, axisY); ax.style.width = x1 - x0 + 'px';
    const T = [1, 2, 4, 5, 10, 20, 30, 60].find((t) => (t / N) * (x1 - x0) >= 46) || 60;
    for (let t = 0; t <= N; t += T) { add(stage, h('div', 'bc-tick'), X(t), axisY - 5); add(stage, h('div', 'bc-tl c', t + ''), X(t), axisY + 18); }
    add(stage, h('div', 'bc-unit'), x1 + 6, axisY + 18).textContent = 's';
    const marks = [a, b].map((p, i) => { const ms = []; for (let t = p; t <= N; t += p) { const m = add(stage, h('div', 'bc-mark c', ''), X(t), rowY[i]); m.style.setProperty('--bc', cols[i]); m.style.opacity = 0; m._t = t; ms.push(m); } return ms; });
    const nums = [a, b].map((p, i) => marks[i].map((m) => { const e = add(stage, h('div', 'bc-num c', m._t + ''), m._t === L || m._t === N ? X(m._t) : X(m._t), rowY[i] - 30); e.style.color = cols[i]; e.style.opacity = 0; return e; }));
    const band = (t, cls) => { const e = add(stage, h('div', 'bc-band ' + cls), X(t) - 18, rowY[0] - 50); e.style.height = axisY - rowY[0] + 50 + 'px'; e.style.opacity = 0; stage.insertBefore(e, stage.firstChild); return e; };
    const b1 = band(L, 'first'), b2 = band(N, 'again');
    const cursor = add(stage, h('div', 'bc-cursor'), X(0), rowY[0] - 44); cursor.style.height = axisY - rowY[0] + 44 + 'px'; cursor.style.opacity = 0;
    const clock = add(stage, h('div', 'bc-clock'), W - 20, 8); clock.style.translate = '-100% 0'; clock.innerHTML = 't = 0 s';
    const res = add(stage, h('div', 'bc-res'), x0, axisY + 52); res.style.opacity = 0;
    const show = (i) => (c) => Promise.all([...marks[i].map((m, k) => c.pop(m, 280, { delay: k * 90 })), ...nums[i].map((e, k) => c.fadeIn(e, 250, { delay: k * 90 }))]);
    const listOf = (p) => { const o = []; for (let t = p; t <= Math.min(N, 5 * p); t += p) o.push(t); return o.join(', '); };
    return [
      { cap: `The first beacon flashes every <b>${a} s</b>: at ${listOf(a)}, … — the <b>multiples of ${a}</b>.`, run: show(0) },
      { cap: `The second flashes every <b>${b} s</b>: at ${listOf(b)}, … — the multiples of ${b}.`, run: show(1) },
      {
        cap: `Run the clock from midnight… The first time <b>both</b> flash at once is <b>${L} s</b>: the first common multiple, the <b>LCM</b>.`,
        run: async (c) => {
          const dur = 3200, jobs = [c.fadeIn(cursor, 150), c.anim(cursor, [{ transform: 'translateX(0px)' }, { transform: `translateX(${X(L) - X(0)}px)` }], dur, { easing: 'linear' })];
          [a, b].forEach((p, i) => { for (let t = p; t <= L; t += p) jobs.push(c.anim(lamps[i], [{ background: 'var(--bc)', boxShadow: '0 0 0 0 rgba(255,200,40,0)' }, { background: '#ffd84a', boxShadow: '0 0 26px 12px rgba(255,200,40,.85)' }, { background: 'var(--bc)', boxShadow: '0 0 0 0 rgba(255,200,40,0)' }], 420, { delay: (t / L) * dur - 120 })); });
          if (!c.fast) { const t0 = performance.now(); const tick = () => { const s = Math.min(L, Math.round(((performance.now() - t0) / dur) * L)); clock.innerHTML = `t = ${s} s`; if (s < L && cursor.isConnected) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
          await Promise.all(jobs);
          clock.innerHTML = `t = <b>${L} s</b>`;
          marks.forEach((ms) => ms.forEach((m) => m._t === L && m.classList.add('hit')));
          await Promise.all([c.anim(b1, [{ opacity: 0 }, { opacity: 1 }], 350), ...lamps.map((l) => c.anim(l, [{ background: '#ffd84a', boxShadow: '0 0 26px 12px rgba(255,200,40,.85)' }, { background: '#ffd84a', boxShadow: '0 0 26px 12px rgba(255,200,40,.85)' }], 300))]);
        }
      },
      {
        cap: `Together again at <b>${N} s</b> = 2 × ${L}, and every ${L} s after that. With primes: ${a} = ${expHTML(primeFactors(a))}, ${b} = ${expHTML(primeFactors(b))}, LCM = ${expHTML(primeFactors(L))} = <b>${L}</b>` + (g > 1 ? ` — not ${a} × ${b} = ${a * b}.` : '.'),
        run: async (c) => {
          marks.forEach((ms) => ms.forEach((m) => m._t === N && m.classList.add('hit')));
          res.innerHTML = `LCM(${a}, ${b}) = ${expHTML(primeFactors(L))} = <b>${L} s</b>` + (L >= 60 && L % 60 === 0 ? ` <span class="muted">(${L / 60} min)</span>` : '');
          await Promise.all([c.anim(b2, [{ opacity: 0 }, { opacity: 1 }], 350), c.fadeIn(res, 350, { delay: 150 })]);
        }
      }
    ];
  }
};

/* ============ warm-up: hot dogs (packs of 10) and buns (packs of 8) ============
 * Two rows drawn to the same scale, one block per pack. Whatever sticks out past the shorter row is marked in red.
 * "Buy until they match" adds a pack to whichever row is behind until the totals are equal (the LCM, 40). */
function mountHotdogs() {
  const svg = document.getElementById('hd-svg'); if (!svg) return;
  const st = document.getElementById('hd-status'), NS = 'http://www.w3.org/2000/svg';
  const MAXH = 8, MAXB = 10;
  let H = 2, B = 2, gen = 0;
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k])); (parent || svg).appendChild(e); return e; };
  const txt = (s, attrs, parent) => { const e = mk('text', attrs, parent); e.textContent = s; return e; };
  const list = (p, n) => Array.from({ length: n }, (_, i) => p * (i + 1)).join(', ');
  function draw(added) {
    svg.innerHTML = '';
    const nh = 10 * H, nb = 8 * B, X0 = 112, X1 = 632, s = Math.min(15, (X1 - X0) / Math.max(nh, nb, 32)), short = Math.min(nh, nb), long = Math.max(nh, nb);
    const rows = [{ y: 52, n: nh, per: 10, k: 'h', name: 'hot dogs' }, { y: 140, n: nb, per: 8, k: 'b', name: 'buns' }];
    rows.forEach((r) => {
      txt(r.name, { x: 0, y: r.y - 6, class: 'hd-rl' });
      txt(String(r.n), { x: 0, y: r.y + 22, class: 'hd-rn' });
      const packs = r.n / r.per;
      for (let p = 0; p < packs; p++) {
        const g = mk('g', { class: 'hd-pack' + (added === r.k && p === packs - 1 ? ' new' : '') });
        mk('rect', { x: X0 + p * r.per * s + 1.5, y: r.y - 33, width: r.per * s - 3, height: 66, rx: 7, class: 'hd-frame' }, g);
        for (let i = 0; i < r.per; i++) {
          const idx = p * r.per + i, cx = X0 + (idx + 0.5) * s, cls = idx >= short ? ' extra' : '';
          if (r.k === 'h') {
            mk('rect', { x: cx - s * 0.3, y: r.y - 24, width: s * 0.6, height: 48, rx: Math.min(6, s * 0.3), class: 'hd-dog' + cls }, g);
            if (s >= 9) mk('polyline', { points: [-18, -12, -6, 0, 6, 12, 18].map((yy, j) => `${(cx + (j % 2 ? 1 : -1) * s * 0.12).toFixed(1)},${r.y + yy}`).join(' '), class: 'hd-mustard' }, g);
          } else {
            mk('rect', { x: cx - s * 0.42, y: r.y - 26, width: s * 0.84, height: 52, rx: Math.min(8, s * 0.42), class: 'hd-bun' + cls }, g);
            if (s >= 9) mk('line', { x1: cx, y1: r.y - 18, x2: cx, y2: r.y + 18, class: 'hd-slit' }, g);
          }
        }
      }
    });
    if (nh !== nb) {
      const y = nh > nb ? rows[0].y : rows[1].y;
      mk('rect', { x: X0 + short * s - 3, y: y - 38, width: (long - short) * s + 6, height: 76, rx: 9, class: 'hd-left' });
    } else {
      mk('rect', { x: X0 - 4, y: rows[0].y - 40, width: long * s + 8, height: rows[1].y - rows[0].y + 80, rx: 12, class: 'hd-match' });
    }
    const d = Math.abs(nh - nb);
    st.innerHTML = (nh === nb
      ? `<b class="ok">${nh} hot dogs, ${nb} buns: a perfect match!</b> ${H} packs of hot dogs and ${B} packs of buns.`
      : `${nh} hot dogs, ${nb} buns: <b class="red">${d} ${nh > nb ? (d > 1 ? 'hot dogs have' : 'hot dog has') + ' no bun' : (d > 1 ? 'buns have' : 'bun has') + ' no hot dog'}</b>.`) +
      `<span class="hd-lists">Hot dogs: ${list(10, H)} &nbsp;·&nbsp; Buns: ${list(8, B)}</span>`;
  }
  const set = (h, b, added) => { H = Math.max(1, Math.min(MAXH, h)); B = Math.max(1, Math.min(MAXB, b)); draw(added); };
  const act = { 'h+': () => set(H + 1, B, 'h'), 'h-': () => set(H - 1, B), 'b+': () => set(H, B + 1, 'b'), 'b-': () => set(H, B - 1), reset: () => set(2, 2) };
  document.querySelectorAll('[data-hd]').forEach((btn) => btn.addEventListener('click', async () => {
    const k = btn.dataset.hd, g = ++gen;
    if (act[k]) { act[k](); return; }
    // buy until they match: add a pack to whichever row is behind (from a match, go on to the next one)
    if (10 * H === 8 * B) { if (H >= MAXH || B >= MAXB) set(1, 1); else set(H + 1, B, 'h'); await new Promise((r) => setTimeout(r, 450)); }
    while (g === gen && 10 * H !== 8 * B && H <= MAXH && B <= MAXB) {
      if (10 * H < 8 * B) { if (H >= MAXH) break; set(H + 1, B, 'h'); } else { if (B >= MAXB) break; set(H, B + 1, 'b'); }
      await new Promise((r) => setTimeout(r, 450));
    }
  }));
  draw();
}

function mountWarmup() {
  document.querySelectorAll('[data-wa]').forEach((b) => b.addEventListener('click', () => b.closest('.wq-body').classList.toggle('shown')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

function mountFigures() {
  document.querySelectorAll('[data-tree]').forEach((e) => { e.innerHTML = treeSVG(e.dataset.tree); });
}

function mountExplainers() {
  const defs = { gcfList, tiles, vennG, vennL, tableG, tableL, frogs, bags, beacons };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountFigures(); mountExplainers(); mountHotdogs(); mountWarmup();

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

/* ============ Stand Up Break! — GCF and LCM by prime factorization at the whiteboards (lessons/js/standup.js) ============ */
const suN = (n) => { const s = String(n); return s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : s; };
function suPF(n) { const f = []; for (let p = 2; p * p <= n; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) f.push([p, e]); } if (n > 1) f.push([n, 1]); return f; }
const suPow = (f) => f.map(([p, e]) => (e > 1 ? p + '^{' + e + '}' : String(p))).join('\\times ');
const suEq = (n) => { const p = suPow(suPF(n)); return p === String(n) ? suN(n) : p + '=' + suN(n); };     // 2^2\times3=12, or just 7
const suFacts = (v) => v.map((n) => suN(n) + '=' + suPow(suPF(n))).join(',\\quad ');
const suList = (v) => v.slice(0, -1).map(suN).join(',\\ ') + (v.length > 2 ? ',' : '') + '\\ \\text{and}\\ ' + suN(v[v.length - 1]);
const suNone = (v) => v.every((a) => v.every((b) => a === b || b % a));                    // no number divides another
const suGcfL = (v) => '\\text{GCF}=' + suEq(v.reduce(gcd));
const suLcmL = (v) => '\\text{LCM}=' + suEq(v.reduce(lcm));
function suPick(r, k, lo, hi, ok) { for (;;) { const v = Array.from({ length: k }, () => r.int(lo, hi)).sort((a, b) => a - b); if (new Set(v).size === k && suNone(v) && ok(v)) return v; } }
function suAsk(v, which) { // which: 'g', 'l' or 'gl'
  const what = which === 'g' ? 'the <b>GCF</b>' : which === 'l' ? 'the <b>LCM</b>' : 'the <b>GCF</b> and the <b>LCM</b>';
  return { text: 'Use prime factorization to find ' + what + ' of these numbers.', q: suList(v),
    a: [suFacts(v)].concat(which.includes('g') ? [suGcfL(v)] : [], which.includes('l') ? [suLcmL(v)] : []) };
}
standup('u1l2', {
  intro: 'Write each number as a product of primes first, then build the GCF (lowest powers) or the LCM (highest powers).',
  levels: {
    BEG: (r) => { // Examples 2(a) and 4(a): two numbers, one tool
      const g = r.chance(0.5);
      const v = suPick(r, 2, 12, 99, (v) => { const G = v.reduce(gcd); return G >= (g ? 4 : 2) && v.reduce(lcm) <= 600 && suPF(v[0]).length + suPF(v[1]).length >= 3; });
      return suAsk(v, g ? 'g' : 'l');
    },
    PRG: (r) => { // Examples 2 and 4: bigger pairs (both tools), or three numbers (one tool)
      if (r.chance(0.55)) return suAsk(suPick(r, 2, 60, 400, (v) => v.reduce(gcd) >= 6 && v.reduce(lcm) <= 5000), 'gl');
      const g = r.chance(0.5);
      return suAsk(suPick(r, 3, 12, 99, (v) => (g ? v.reduce(gcd) >= 3 : v.reduce(lcm) <= 1200)), g ? 'g' : 'l');
    },
    MAS: (r) => {
      if (r.chance(0.55)) return suAsk(suPick(r, 3, 60, 450, (v) => v.reduce(gcd) >= 4 && v.reduce(lcm) <= 20000), 'gl'); // Example 2(c), both tools
      // numbers given in exponent form: lowest / highest power of each prime
      for (;;) {
        const P = r.shuffle([2, 3, 5, 7, 11]).slice(0, r.pick([3, 3, 4])).sort((a, b) => a - b);
        const ea = P.map(() => r.int(0, 4)), eb = P.map(() => r.int(0, 4));
        const fa = P.map((p, i) => [p, ea[i]]).filter((x) => x[1]), fb = P.map((p, i) => [p, eb[i]]).filter((x) => x[1]);
        const fg = P.map((p, i) => [p, Math.min(ea[i], eb[i])]).filter((x) => x[1]), fl = P.map((p, i) => [p, Math.max(ea[i], eb[i])]).filter((x) => x[1]);
        if (fa.length < 2 || fb.length < 2 || fg.length < 1 || fg.length === fl.length && fg.every((x, i) => x[1] === fl[i][1])) continue;
        if (ea.every((e, i) => e <= eb[i]) || eb.every((e, i) => e <= ea[i])) continue; // one divides the other: too easy
        const val = (f) => f.reduce((s, [p, e]) => s * p ** e, 1), G = val(fg), L = val(fl);
        if (G > 3000) continue;
        return { text: 'Find the <b>GCF</b> and the <b>LCM</b> of <i>a</i> and <i>b</i>. Leave them in exponent form, then give the GCF as a number.',
          q: 'a=' + suPow(fa) + ',\\qquad b=' + suPow(fb),
          a: ['\\text{GCF}=' + suPow(fg) + (fg.length > 1 || fg[0][1] > 1 ? '=' + suN(G) : ''), '\\text{LCM}=' + suPow(fl) + (L <= 1e7 ? '=' + suN(L) : '')] };
      }
    }
  }
});
