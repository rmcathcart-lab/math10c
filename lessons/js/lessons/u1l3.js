/* Math 10C · Unit 1 · Lesson 3 — Perfect Squares and Perfect Cubes. The explainers on this page and the locker warm-up.
 * The piles, the square/cube/both tester and the lockers came from the old Lesson 2 (GCF, LCM, and Perfect Powers);
 * "powers" (why the exponents double / triple), "multiplier" and "sides" are new. */
import { h, fmt, Explainer, factors, primeFactors, expHTML } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const listAnd = (arr) => (arr.length < 2 ? arr.join('') : arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1]);
const texN = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,'); // 15876 → 15\,876 like the booklet
const WORD = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

/* every prime gets the same colour everywhere on the page (matches the Lesson 1 sieve) */
const PCOL = { 2: '#3b78d8', 3: '#e0841a', 5: '#8a58c9', 7: '#d0477a', 11: '#2f9e6a', 13: '#0f8a8a', 17: '#b0563a', 19: '#5a6acf', 23: '#9a7b12' };
const pcol = (p) => PCOL[p] || '#5d6b7e';
function chip(p, cls) { const e = h('div', 'pc' + (cls ? ' ' + cls : ''), fmt(p)); e.style.setProperty('--pc', pcol(p)); return e; }
function groups(ps) { const g = []; ps.forEach((p) => { const l = g[g.length - 1]; if (l && l.p === p) l.k++; else g.push({ p, k: 1 }); }); return g; }
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

/* ---------- drawings: a square of tiles, a box of small cubes ---------- */
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
/* ============ 1 & 2. Why the exponents are even (squares) and multiples of 3 (cubes) ============ */
const powers = {
  title: 'Squaring doubles every exponent; cubing triples it',
  height: 400,
  choices: [{ v: 12, label: '12 (starter)' }, 18, 45, 30, 50, 20],
  custom: [4, 60],
  intro: (n) => `What happens to the prime factorization of <b>${n}</b> when you square it, and when you cube it?`,
  make(stage, n, ex) {
    const W = ex.W, pf = primeFactors(n), P = [...new Set(pf)], cnt = (p) => pf.filter((q) => q === p).length;
    const sp = Math.min(46, (W - 470) / pf.length), rowY = [52, 122, 192], tx = W - 320;
    const rows = rowY.map((y, r) => {
      const lab = add(stage, h('div', 'pw-lab', r ? '× ' + n : n), 20, y); lab.style.translate = '0 -50%'; lab.style.opacity = 0;
      const brk = add(stage, h('div', 'pw-brk'), 96, y - 26); brk.style.width = pf.length * sp + 14 + 'px'; brk.style.opacity = 0;
      const cs = pf.map((p, i) => { const e = add(stage, chip(p, 'c sm'), 110 + (i + 0.5) * sp, y); e.style.opacity = 0; return e; });
      return { lab, brk, cs };
    });
    // the exponent table
    const cw = 72, X = (j) => tx + 70 + j * cw;
    const heads = ['', String(n), n + '²', n + '³'].map((s, j) => { const e = add(stage, h('div', 'pw-th c', s), j ? X(j - 1) : tx + 24, 22); e.style.opacity = 0; return e; });
    const cells = P.map((p, i) => {
      const y = 70 + i * 52; add(stage, chip(p, 'c sm'), tx + 24, y);
      return [1, 2, 3].map((m, j) => { const e = add(stage, h('div', 'pw-td c' + (j ? ' m' + m : ''), String(cnt(p) * m)), X(j), y); e.style.opacity = 0; return e; });
    });
    const tag = (m) => { const e = add(stage, h('div', 'pw-tag c m' + m, '× ' + m), X(m - 1), 70 + P.length * 52 - 6); e.style.opacity = 0; return e; };
    const tags = [tag(2), tag(3)];
    const eq = [254, 296, 346].map((y) => { const e = add(stage, h('div', 'pw-eq'), 20, y); e.style.opacity = 0; return e; });
    const pf2 = pf.concat(pf).sort((a, b) => a - b), pf3 = pf2.concat(pf).sort((a, b) => a - b);
    const copy = (c, r) => Promise.all([c.fadeIn(rows[r].lab, 250), c.fadeIn(rows[r].brk, 250, { from: 'none' }),
      ...rows[r].cs.map((e, i) => { const x = parseFloat(e.style.left), y = parseFloat(e.style.top); at(e, x, rowY[0]); e.style.opacity = 1; return fly(c, e, x, y, 520, { delay: i * 60 }); })]);
    return [
      {
        cap: `Factor it: <b>${n} = ${expHTML(pf)}</b>. The table counts how many times each prime appears.`,
        run: (c) => Promise.all([c.fadeIn(rows[0].lab, 250), c.fadeIn(rows[0].brk, 250, { from: 'none' }), ...rows[0].cs.map((e, i) => c.pop(e, 300, { delay: i * 70 })),
          ...heads.slice(0, 2).map((e) => c.fadeIn(e, 250)), ...cells.map((r) => c.fadeIn(r[0], 300, { delay: 200 }))])
      },
      {
        cap: `${n}² = ${n} × ${n}: the prime factors are written down <b>twice</b>, so every prime appears twice as often. ${n}² = ${expHTML(pf2)} = ${fmt(n * n)}. Every exponent <b>doubled</b>: double a whole number is always <b>even</b>.`,
        run: async (c) => {
          eq[0].innerHTML = `${n}<sup>2</sup> = ${expHTML(pf2)} = ${fmt(n * n)} <span class="pw-note">every exponent even</span>`;
          await copy(c, 1);
          await Promise.all([c.fadeIn(heads[2], 250), ...cells.map((r, i) => c.pop(r[1], 320, { delay: i * 120 })), c.fadeIn(tags[0], 300, { delay: 200 }), c.fadeIn(eq[0], 350, { delay: 300 })]);
        }
      },
      {
        cap: `${n}³ = ${n} × ${n} × ${n}: three copies, so every exponent <b>triples</b>. ${n}³ = ${expHTML(pf3)} = ${fmt(n * n * n)}: every exponent is a <b>multiple of 3</b>.`,
        run: async (c) => {
          eq[1].innerHTML = `${n}<sup>3</sup> = ${expHTML(pf3)} = ${fmt(n * n * n)} <span class="pw-note">every exponent a multiple of 3</span>`;
          await copy(c, 2);
          await Promise.all([c.fadeIn(heads[3], 250), ...cells.map((r, i) => c.pop(r[2], 320, { delay: i * 120 })), c.fadeIn(tags[1], 300, { delay: 200 }), c.fadeIn(eq[1], 350, { delay: 300 })]);
        }
      },
      {
        cap: `Going backwards: <b>halve</b> the exponents for a square root, <b>divide them by 3</b> for a cube root. ${tex(`\\sqrt{${texN(n * n)}}`)} = ${expHTML(pf)} = ${n} and ${tex(`\\sqrt[3]{${texN(n * n * n)}}`)} = ${n}.`,
        run: (c) => { eq[2].innerHTML = `${tex(`\\sqrt{${texN(n * n)}}`)} = ${expHTML(pf)} = <b>${n}</b> &nbsp;&nbsp; ${tex(`\\sqrt[3]{${texN(n * n * n)}}`)} = ${expHTML(pf)} = <b>${n}</b>`; return c.fadeIn(eq[2], 400); }
      }
    ];
  }
};
powers.minW = 860; // drawn this wide and scaled to fit beside the sidebar

/* ============ 4. The smallest multiplier: top up each tower to full pairs / triples ============ */
const multiplier = {
  title: 'The smallest multiplier: top up each tower',
  height: 380,
  choices: [{ v: 'sq:50', label: '50 → square' }, { v: 'sq:12', label: '12 → square' }, { v: 'cu:12', label: '12 → cube' }, { v: 'cu:100', label: '100 → cube' },
    { sep: 'Example 5 check:' }, { v: 'sq:72', label: '72 → square' }, { v: 'cu:72', label: '72 → cube' }],
  intro: (v) => { const [m, s] = v.split(':'); return `What is the smallest whole number <b>${s}</b> must be multiplied by to make a perfect <b>${m === 'sq' ? 'square' : 'cube'}</b>?`; },
  make(stage, v, ex) {
    const [mode, s] = v.split(':'), n = +s, k = mode === 'sq' ? 2 : 3, word = k === 2 ? 'square' : 'cube', grp = k === 2 ? 'pairs' : 'triples', W = ex.W;
    const G = groups(primeFactors(n)).map((g) => ({ ...g, t: Math.ceil(g.k / k) * k })), m = G.reduce((a, g) => a * Math.pow(g.p, g.t - g.k), 1), N = n * m, root = G.reduce((a, g) => a * Math.pow(g.p, g.t / k), 1);
    const bs = 40, base = 320, tw = 110, x0 = 60;
    const towers = G.map((g, i) => {
      const x = x0 + i * tw, lab = add(stage, chip(g.p, 'c'), x + bs / 2, base + 30);
      const blk = (j, cls) => { const e = add(stage, h('div', 'mt-blk' + (cls ? ' ' + cls : ''), fmt(g.p)), x, base - (j + 1) * bs); e.style.setProperty('--pc', pcol(g.p)); e.style.opacity = 0; return e; };
      const have = Array.from({ length: g.k }, (_, j) => blk(j)), extra = Array.from({ length: g.t - g.k }, (_, j) => blk(g.k + j, 'new'));
      const frames = Array.from({ length: g.t / k }, (_, q) => { const f = add(stage, h('div', 'mt-grp'), x - 6, base - (q + 1) * k * bs - 3); f.style.height = k * bs + 6 + 'px'; f.style.opacity = 0; f._full = (q + 1) * k <= g.k; return f; });
      return { g, x, lab, have, extra, frames };
    });
    const px = x0 + G.length * tw + 30, lines = [60, 110, 160, 220].map((y) => { const e = add(stage, h('div', 'mt-line'), px, y); e.style.opacity = 0; return e; });
    const short = towers.filter((t) => t.g.t > t.g.k), need = short.map((t) => (t.g.t - t.g.k === 1 ? 'one more ' : (t.g.t - t.g.k) + ' more ') + fmt(t.g.p) + (t.g.t - t.g.k > 1 ? 's' : ''));
    const rootTex = k === 2 ? `\\sqrt{${texN(N)}}` : `\\sqrt[3]{${texN(N)}}`;
    const pfN = G.flatMap((g) => Array(g.t).fill(g.p)), pfR = G.flatMap((g) => Array(g.t / k).fill(g.p));
    return [
      {
        cap: `${fmt(n)} = ${expHTML(primeFactors(n))}. Stack each prime into a <b>tower</b>: one block for each time it appears.`,
        run: (c) => { lines[0].innerHTML = `${fmt(n)} = ${expHTML(primeFactors(n))}`; return Promise.all([c.fadeIn(lines[0], 300), ...towers.flatMap((t, i) => t.have.map((e, j) => c.pop(e, 300, { delay: i * 120 + j * 110 })))]); }
      },
      {
        cap: `A perfect ${word} needs every tower to split into <b>${grp}</b> (every exponent ${k === 2 ? 'even' : 'a multiple of 3'}). ${listAnd(short.map((t) => 'The ' + fmt(t.g.p) + ' tower'))} ${short.length > 1 ? 'are' : 'is'} short.`,
        run: (c) => {
          const jobs = [];
          towers.forEach((t) => { t.frames.forEach((f) => { if (f._full) jobs.push(c.fadeIn(f, 300, { from: 'none' })); }); const lone = t.g.k % k; t.have.slice(t.g.k - lone).forEach((e) => { e.classList.add('lone'); jobs.push(c.shake(e)); }); });
          return Promise.all(jobs);
        }
      },
      {
        cap: `Top up only the short towers: ${listAnd(need)}. So multiply by <b>${m}</b> — nothing more.`,
        run: (c) => {
          lines[1].innerHTML = `× <b class="mt-m">${fmt(m)}</b> &nbsp;<span class="muted">(${need.join(', ')})</span>`;
          const jobs = [c.fadeIn(lines[1], 300)];
          towers.forEach((t, i) => { t.have.forEach((e) => e.classList.remove('lone')); t.extra.forEach((e, j) => jobs.push(c.anim(e, [{ opacity: 0, transform: 'translateY(-60px)' }, { opacity: 1, transform: 'none' }], 450, { delay: 150 + (i * 2 + j) * 160, easing: 'cubic-bezier(.3,1.4,.6,1)' }))); t.frames.forEach((f) => { if (!f._full) jobs.push(c.fadeIn(f, 300, { delay: 700, from: 'none' })); }); });
          return Promise.all(jobs);
        }
      },
      {
        cap: `${fmt(n)} × ${m} = ${fmt(N)} = ${expHTML(pfN)}: a perfect ${word}. ${k === 2 ? 'Halve' : 'Divide by 3'} the exponents (one block from each ${k === 2 ? 'pair' : 'triple'}): ${tex(rootTex)} = ${expHTML(pfR)} = <b>${fmt(root)}</b>.`,
        run: (c) => {
          lines[2].innerHTML = `= ${fmt(N)} = ${expHTML(pfN)}`;
          lines[3].innerHTML = `${tex(rootTex)} = ${expHTML(pfR)} = <b class="ok">${fmt(root)}</b>`;
          const jobs = [c.fadeIn(lines[2], 300), c.fadeIn(lines[3], 350, { delay: 250 })];
          towers.forEach((t) => [...t.have, ...t.extra].forEach((e, j) => { if (j % k === 0) { e.classList.add('pick'); jobs.push(pulse(c, e, 1.15, 380, { delay: 200 })); } }));
          return Promise.all(jobs);
        }
      }
    ];
  }
};

/* ============ 5. Side of a square from its area, edge of a cube from its volume ============ */
const sides = {
  minW: 780,
  title: 'Side of a square, edge of a cube',
  height: 380,
  choices: [{ v: 'sq:144', label: 'square, 144 cm²' }, { v: 'sq:900', label: 'square, 900 cm²' }, { v: 'cu:216', label: 'cube, 216 cm³' }, { v: 'cu:1728', label: 'cube, 1 728 cm³' },
    { sep: 'Example 6 check:' }, { v: 'sq:3136', label: 'square, 3 136 cm²' }, { v: 'cu:3375', label: 'cube, 3 375 cm³' }],
  intro: (v) => { const [m, s] = v.split(':'); return m === 'sq' ? `A square has an area of <b>${fmt(+s)} cm²</b>. How long is each side?` : `A cube has a volume of <b>${fmt(+s)} cm³</b>. How long is each edge?`; },
  make(stage, v, ex) {
    const [mode, s] = v.split(':'), n = +s, k = mode === 'sq' ? 2 : 3, W = ex.W, pf = primeFactors(n), r = iroot(n, k), pfR = groups(pf).flatMap((g) => Array(g.k / k).fill(g.p));
    const sym = k === 2 ? `\\sqrt{${texN(n)}}` : `\\sqrt[3]{${texN(n)}}`, unit = k === 2 ? 'cm²' : 'cm³', what = k === 2 ? 'side' : 'edge';
    const pic = add(stage, h('div', 'sd-pic'), 20, 20); pic.style.opacity = 0;
    if (k === 2) { const u = 250 / r; pic.innerHTML = gridSVG(r, r, u); } else { const u = 170 / r; pic.innerHTML = boxSVG(r, r, r, u); }
    const big = add(stage, h('div', 'sd-big c', `${k === 2 ? 'Area' : 'Volume'}<br><b>${fmt(n)} ${unit}</b>`), k === 2 ? 147 : 107, k === 2 ? 147 : 168); big.style.opacity = 0;
    const sideB = add(stage, h('div', 'sd-side c', '?'), k === 2 ? 147 : 107, k === 2 ? 296 : 278);
    sideB.style.opacity = 0;
    const px = 330, lines = [40, 100, 160, 230].map((y) => { const e = add(stage, h('div', 'sd-line'), px, y); e.style.opacity = 0; e.style.width = W - px - 20 + 'px'; return e; });
    const setSide = (t) => { sideB.innerHTML = t; };
    return [
      {
        cap: k === 2 ? `A square with area <b>${fmt(n)} cm²</b>. Area = side × side, so side = ${tex(sym)}.` : `A cube with volume <b>${fmt(n)} cm³</b>. Volume = edge × edge × edge, so edge = ${tex(sym)}.`,
        run: (c) => { lines[0].innerHTML = `${what} = ${tex(sym)}`; return Promise.all([c.anim(pic, [{ opacity: 0, transform: 'scale(.8)' }, { opacity: 1, transform: 'none' }], 450), c.fadeIn(big, 300, { delay: 200 }), c.fadeIn(sideB, 300, { delay: 300 }), c.fadeIn(lines[0], 300, { delay: 200 })]); }
      },
      {
        cap: `Factor: ${fmt(n)} = ${expHTML(pf)}. Every exponent is ${k === 2 ? '<b>even</b>, so it is a perfect square' : 'a <b>multiple of 3</b>, so it is a perfect cube'}.`,
        run: (c) => { lines[1].innerHTML = `${fmt(n)} = ${expHTML(pf)} <span class="pw-note">${k === 2 ? 'all even ✓' : 'all multiples of 3 ✓'}</span>`; return c.fadeIn(lines[1], 350); }
      },
      {
        cap: `${k === 2 ? '<b>Halve</b> each exponent' : '<b>Divide</b> each exponent <b>by 3</b>'}: ${what} = ${expHTML(pfR)} = <b>${r} cm</b>.`,
        run: (c) => { lines[2].innerHTML = `${what} = ${expHTML(pfR)} = <b class="ok">${r} cm</b>`; setSide(`<b>${r} cm</b>`); return Promise.all([c.fadeIn(lines[2], 350), pulse(c, sideB, 1.25, 420)]); }
      },
      {
        cap: `Check: ${k === 2 ? `${r} × ${r}` : `${r} × ${r} × ${r}`} = ${fmt(n)} ✓ — or on the calculator, ${tex(sym)} = ${r}.`,
        run: (c) => { lines[3].innerHTML = `check: ${k === 2 ? `${r} × ${r}` : `${r} × ${r} × ${r}`} = ${fmt(n)} ✓`; return c.fadeIn(lines[3], 350); }
      }
    ];
  }
};

/* ============ 1 & 2. Deal the primes into identical piles ============ */
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
const squares = pilesDef(2, 'Perfect square? Deal the primes into two identical piles', [144, 4, 100, 36, 12, 48, { sep: 'Example 1 check:' }, { v: 15876, label: '15 876' }, { sep: 'Example 2 check:' }, { v: 1089, label: '1 089' }, { v: 2028, label: '2 028' }]);
const cubes = pilesDef(3, 'Perfect cube? Deal the primes into three identical piles', [{ v: 1000, label: '1 000' }, 8, 125, 27, 18, 54, { sep: 'Example 3 check:' }, { v: 5832, label: '5 832' }, { v: 39304, label: '39 304' }]);
cubes.minW = 780; // drawn this wide and scaled to fit beside the sidebar

/* ============ 3. Square, cube, both or neither: read the exponents ============ */
const tester = {
  title: 'Square, cube, both, or neither? Read the exponents',
  height: 316,
  choices: [36, { v: 1728, label: '1 728' }, { v: 2025, label: '2 025' }, 48, { v: 46656, label: '46 656' }, { sep: 'Example 4 check:' }, 400, 216, { v: 4096, label: '4 096' }, { v: 1200, label: '1 200' }],
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
}

function mountExplainers() {
  const defs = { powers, squares, cubes, tester, multiplier, sides };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountFigures(); mountExplainers(); mountLockers(); mountWarmup();
