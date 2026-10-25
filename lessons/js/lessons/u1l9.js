/* Math 10C · Unit 1 · Lesson 9 — Cumulative Number Sense Check-Up: the explainers and widgets on this page.
 * A review lesson, so each explainer is a quick "remember how…" refresher with "Example N check" chips that replay
 * the booklet's own numbers after the class has worked them by hand. */
import { h, fmt as fmt0, Explainer, FactorTree, isPrime, primeFactors, primesUpTo, productHTML, expHTML, decimal, quickReason } from '../explain.js';
import { tex } from '../tex.js';
import { standup } from '../standup.js';

const fmt = (n) => fmt0(n).replace(/\u2009/g, '\u202f'); // narrow no-break space: never splits a number across lines
const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const T = (s) => tex(s);
const tn = (n) => fmt0(n).replace(/\u2009/g, '\\,'); // a number for TeX, thin-spaced like the booklet
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const counts = (ps) => ps.reduce((m, p) => { m[p] = (m[p] || 0) + 1; return m; }, {});
const listAnd = (a) => (a.length <= 1 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
const moveTo = (c, el, x, y, ms = 600, o = {}) => c.anim(el, [{ left: el.style.left, top: el.style.top }, { left: x + 'px', top: y + 'px' }], ms, o);
const prod = (ps) => ps.reduce((a, b) => a * b, 1);
const uniq = (ps) => [...new Set(ps)];
const hide = (...els) => els.forEach((e) => (e.style.opacity = 0));

/* ============ 1. The division ladder, for big numbers ============ */
const LADDER_Q = {
  2574: {
    cap: '<b>Example 1(a):</b> 3, 11 and 13 are on the list, but <b>19 is not</b> (2 574 ÷ 19 = 135.47…). The answer is <b>D</b>.',
    head: 'Which is <b>not</b> a prime factor?', rows: [['A', '3', 1], ['B', '11', 1], ['C', '13', 1], ['D', '19', 0, 'not on the list']]
  },
  4290: {
    cap: '<b>Example 1(b):</b> 5 and 13 are prime factors. 17 doesn’t divide 4 290, and 15 divides it but <b>isn’t prime</b>. That’s <b>2</b> of them: <b>B</b>.',
    head: 'Prime factors among 5, 13, 17, 15?', rows: [['', '5', 1], ['', '13', 1], ['', '17', 0, 'doesn’t divide'], ['', '15', 0, '= 3 × 5, not prime']]
  },
  43010: {
    cap: '<b>Example 1(c):</b> add the prime factors: 2 + 5 + 11 + 17 + 23 = <b>58</b>.',
    head: 'Sum of the prime factors', rows: [['', '2 + 5 + 11 + 17 + 23 = <b>58</b>', 1]]
  },
  3003: { cap: 'Keep this for <b>Example 3</b>: 3 003 = 3 × 7 × 11 × 13. Now ladder 3 135 and look for the primes they <b>share</b>.' },
  3135: { cap: 'For <b>Example 3</b>: 3 135 = 3 × 5 × 11 × 19. Shared with 3 003 = 3 × 7 × 11 × 13: <b>3 and 11</b>.' }
};
const ladder = {
  title: 'Remember: the division ladder',
  height: 500,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [1001, 2310, { sep: 'Example 1 check:' }, 2574, 4290, 43010, { sep: 'Example 3 check:' }, 3003, 3135],
  custom: [4, 999999],
  intro: (n) => `Divide <b>${fmt(n)}</b> by the <b>smallest prime</b> that goes in evenly, write the answer underneath, and repeat until you reach <b>1</b>. The primes collect <b>down the left side</b>.`,
  make(stage, n, ex) {
    const W = ex.W, H = 500, rungs = [];
    let m = n, start = 2;
    while (m > 1) {
      const pr = primesUpTo(Math.floor(Math.sqrt(m))).filter((q) => q >= start);
      const p = pr.find((q) => m % q === 0) || m;
      rungs.push({ m, p, q: m / p, tries: pr.filter((q) => q < p), start }); start = p; m /= p;
    }
    const R = rungs.length, rh = Math.min(50, (H - 150) / (R + 1)), fs = Math.min(30, rh * 0.62);
    const lx = Math.min(W * 0.22, 190), y0 = 22, nums = [], divs = [];
    const bar = add(stage, h('div', 'ld-bar'), lx + 6, y0 + 2); bar.style.height = '0px';
    const mk = (cls, txt, x, y) => { const e = add(stage, h('div', cls, txt), x, y); e.style.fontSize = fs + 'px'; e.style.height = rh + 'px'; e.style.lineHeight = rh + 'px'; return e; };
    nums.push(mk('ld-num', fmt(n), lx + 22, y0));
    const nx = lx + 200;
    const notes = add(stage, h('div', 'ld-notes'), nx, y0); notes.style.width = (W - nx - 20) + 'px';
    const prodEl = add(stage, h('div', 'ld-prod'), 20, H - 70); prodEl.style.width = (W - 40) + 'px';
    const steps = [];
    rungs.forEach((r, i) => {
      const fails = r.tries.length > 4 ? r.tries.slice(0, 3) : r.tries, skipped = r.tries.length > 4;
      const reason = (q) => quickReason(r.m, q) || ('= ' + decimal(r.m / q));
      const isSelf = r.p === r.m;
      steps.push({
        cap: (fails.length ? `Try primes on <b>${fmt(r.m)}</b>: ${fails.map((q) => `not ${q} (${reason(q)})`).join(', ')}${skipped ? ', …' : ''}. ` : '')
          + (isSelf ? (r.tries.length ? `Nothing up to √${fmt(r.m)} works, so <b>${fmt(r.m)} is prime</b>: ` : `<b>${fmt(r.m)}</b> is prime, so divide it by itself: `)
            : `<b>${r.p}</b> works${quickReason(r.m, r.p) ? ' (' + quickReason(r.m, r.p) + ')' : ''}: `)
          + `${fmt(r.m)} ÷ ${fmt(r.p)} = <b>${fmt(r.q)}</b>.`,
        run: async (c) => {
          notes.innerHTML = '';
          const ls = r.start > 2 && r.tries.length ? [`<span class="muted">Start at the last prime used: ${r.start}</span>`] : [];
          ls.push(...fails.map((q) => `<span class="muted">${fmt(r.m)} ÷ ${q}?</span> ${reason(q)} <b class="red">✗</b>`));
          if (skipped) ls.push('<span class="muted">… no prime up to √' + fmt(r.m) + ' works</span>');
          ls.push(`<span class="muted">${fmt(r.m)} ÷ ${fmt(r.p)}?</span> ${quickReason(r.m, r.p) || (isSelf ? 'it’s prime' : '')} <b class="ok">✓</b>`);
          ls.push(`<b>${fmt(r.m)} ÷ ${fmt(r.p)} = ${fmt(r.q)}</b>`);
          const els = ls.map((t) => { const e = h('div', 'ld-note', t); notes.appendChild(e); e.style.opacity = 0; return e; });
          for (const e of els) await c.fadeIn(e, 240, { from: 'translateX(-10px)' });
          const y = y0 + i * rh, d = mk('ld-div', fmt(r.p), lx - 8, y); d.style.translate = '-100% 0'; divs.push(d);
          const qn = mk('ld-num', fmt(r.q), lx + 22, y + rh); nums.push(qn);
          await Promise.all([c.pop(d, 380), c.anim(bar, [{ height: bar.style.height }, { height: (i + 2) * rh - 4 + 'px' }], 400), c.anim(qn, [{ opacity: 0, transform: 'translateY(-' + rh + 'px)' }, { opacity: 1, transform: 'none' }], 500, { delay: 200 })]);
        }
      });
    });
    const ps = rungs.map((r) => r.p), rep = new Set(ps).size < ps.length, P = uniq(ps);
    steps.push({
      cap: `The bottom is <b>1</b>, so we’re done. Read the primes <b>down the left side</b>: ${fmt(n)} = <b>${rep ? expHTML(ps) : productHTML(ps)}</b>.`,
      run: async (c) => {
        notes.innerHTML = '';
        nums[nums.length - 1].classList.add('one');
        await c.pop(nums[nums.length - 1], 300);
        for (const d of divs) { d.classList.add('lit'); await c.anim(d, [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 220); }
        prodEl.innerHTML = `${fmt(n)} = ${ps.map((p) => '<span class="pchip">' + fmt(p) + '</span>').join(' × ')}${rep ? ' = <b class="ok">' + expHTML(ps) + '</b>' : ''}`;
        await c.fadeIn(prodEl, 450);
      }
    });
    const q = LADDER_Q[n];
    steps.push({
      cap: q ? q.cap : `The <b>prime factors</b> of ${fmt(n)} are a <b>list</b>, each prime once: <b>${listAnd(P.map(fmt))}</b>.`,
      run: async (c) => {
        notes.innerHTML = '';
        const els = [h('div', 'ld-note', `<b>Prime factors of ${fmt(n)}</b> <span class="muted">(each once)</span>`), h('div', 'ld-pf', P.map((p) => '<span class="pchip">' + fmt(p) + '</span>').join(''))];
        if (q && q.rows) {
          els.push(h('div', 'ld-note muted', q.head));
          q.rows.forEach(([l, v, ok, why]) => els.push(h('div', 'ld-q', `${l ? '<span class="opt-l">' + l + '</span>' : ''}${v} <span class="chk ${ok ? 'y' : 'n'}">${ok ? '✓' : '✗'}</span>${why ? ' <span class="muted small">' + why + '</span>' : ''}`)));
        }
        els.forEach((e) => { notes.appendChild(e); e.style.opacity = 0; });
        for (const e of els) await c.fadeIn(e, 260, { from: 'translateX(-10px)' });
      }
    });
    return steps;
  }
};

/* ============ 1. GCF and LCM with a prime-factor Venn diagram ============ */
const VENN_X = {
  '10,21': ['<b>Example 2:</b> LCM = 2 × 3 × 5 × 7 is the form a × b × c × d with a &lt; b &lt; c &lt; d, so <b>c = 5</b>. The answer is <b>C</b>.', 'a × b × c × d = 2 × 3 × <b>5</b> × 7 → <b>C</b>'],
  '3003,3135': ['<b>Example 3:</b> the overlap holds 3 and 11, so the <b>GCF is 3 × 11 = 33</b>.', 'Example 3: GCF = <b>33</b>'],
  '9,20': ['<b>Example 4</b> starts here: LCM(9, 20) = <b>180</b>, and that 180 is the <b>GCF of P and Q</b>. Keep going in the step-by-step after Example 4.', 'Example 4: GCF(P, Q) = <b>180</b>']
};
const venn = {
  title: 'GCF and LCM from a prime-factor Venn diagram',
  height: 440,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: '12,18', label: '12 &amp; 18' }, { v: '60,84', label: '60 &amp; 84' }, { v: '36,120', label: '36 &amp; 120' },
    { sep: 'Example 2 check:' }, { v: '10,21', label: '10 &amp; 21' }, { sep: 'Example 3:' }, { v: '3003,3135', label: '3 003 &amp; 3 135' }, { sep: 'Example 4:' }, { v: '9,20', label: '9 &amp; 20' }],
  intro: 'Each circle holds one number’s prime factors. Primes the numbers <b>share</b> go in the overlap. Then the <b>GCF</b> and <b>LCM</b> can be read straight off the picture.',
  make(stage, v, ex) {
    const W = ex.W, [A, B] = String(v).split(',').map(Number);
    const pa = primeFactors(A), pb = primeFactors(B), ca = counts(pa), cb = counts(pb);
    const shared = []; uniq(pa).forEach((p) => { for (let i = 0; i < Math.min(ca[p], cb[p] || 0); i++) shared.push(p); });
    const g = prod(shared), L = A * B / g;
    const sc = counts(shared), onlyB = []; const t = {}; pb.forEach((p) => { t[p] = (t[p] || 0) + 1; if (t[p] > (sc[p] || 0)) onlyB.push(p); });
    const all = [...pa, ...onlyB].sort((x, y) => x - y);
    const R = 140, cy = 232, cx1 = 175, cx2 = 345, xm = (cx1 + cx2) / 2, xa = cx1 - 58, xb = cx2 + 58;
    const s = svgEl('svg', { class: 'vn-svg' }); stage.appendChild(s);
    s.append(svgEl('circle', { cx: cx1, cy, r: R, class: 'vn-c a' }), svgEl('circle', { cx: cx2, cy, r: R, class: 'vn-c b' }));
    add(stage, h('div', 'vn-name a c', fmt(A)), cx1 - 40, 46); add(stage, h('div', 'vn-name b c', fmt(B)), cx2 + 40, 46);
    const colY = (i, k) => cy + (i - (k - 1) / 2) * 46;
    const chipsA = pa.map((p, i) => { const e = add(stage, h('div', 'vchip a', fmt(p)), xa, colY(i, pa.length)); e.style.opacity = 0; e._p = p; return e; });
    const chipsB = pb.map((p, i) => { const e = add(stage, h('div', 'vchip b', fmt(p)), xb, colY(i, pb.length)); e.style.opacity = 0; e._p = p; return e; });
    // matching pairs
    const usedA = new Set(), usedB = new Set(), pairs = [];
    shared.forEach((p) => { const ia = chipsA.findIndex((e, i) => e._p === p && !usedA.has(i)), ib = chipsB.findIndex((e, i) => e._p === p && !usedB.has(i)); usedA.add(ia); usedB.add(ib); pairs.push([chipsA[ia], chipsB[ib]]); });
    const restA = chipsA.filter((_, i) => !usedA.has(i)), restB = chipsB.filter((_, i) => !usedB.has(i));
    const panel = add(stage, h('div', 'vn-panel'), 520, 30); panel.style.width = (W - 540) + 'px';
    const line = (cls, html) => { const e = h('div', 'vn-line ' + cls, html); panel.appendChild(e); e.style.opacity = 0; return e; };
    const lA = line('', `${fmt(A)} = ${productHTML(pa)}`), lB = line('', `${fmt(B)} = ${productHTML(pb)}`);
    const lG = line('g', shared.length ? `<b>GCF</b> = ${productHTML(shared)} = <b>${fmt(g)}</b>` : '<b>GCF</b> = <b>1</b> <span class="muted">(nothing shared)</span>');
    const lL = line('l', `<b>LCM</b> = ${productHTML(all)} = <b>${fmt(L)}</b>`);
    const X = VENN_X[v], lX = X ? line('x', X[1]) : null;
    const steps = [
      {
        cap: `Factor both: <b>${fmt(A)} = ${productHTML(pa)}</b> and <b>${fmt(B)} = ${productHTML(pb)}</b>. Each prime goes into its own number’s circle.`,
        run: (c) => Promise.all([c.fadeIn(lA, 300), c.fadeIn(lB, 300, { delay: 150 }), ...chipsA.map((e, i) => c.pop(e, 320, { delay: i * 80 })), ...chipsB.map((e, i) => c.pop(e, 320, { delay: 200 + i * 80 }))])
      },
      {
        cap: shared.length ? `Primes in <b>both</b> lists move to the overlap — one chip for each matching pair: <b>${listAnd(shared.map(fmt))}</b>.${shared.length < Math.min(pa.length, pb.length) || new Set(shared).size < shared.length ? '' : ''}`
          : `${fmt(A)} and ${fmt(B)} have <b>no prime in common</b>, so the overlap stays <b>empty</b>.`,
        run: async (c) => {
          const jobs = [];
          pairs.forEach(([ea, eb], i) => {
            const y = colY(i, pairs.length);
            ea.classList.add('both');
            jobs.push(moveTo(c, ea, xm, y, 650, { delay: i * 120 }), moveTo(c, eb, xm, y, 650, { delay: i * 120 }).then(() => c.anim(eb, [{ opacity: 1 }, { opacity: 0 }], 200)));
          });
          restA.forEach((e, i) => jobs.push(moveTo(c, e, xa, colY(i, restA.length), 600, { delay: 300 })));
          restB.forEach((e, i) => jobs.push(moveTo(c, e, xb, colY(i, restB.length), 600, { delay: 300 })));
          if (!pairs.length) jobs.push(c.shake(panel));
          await Promise.all(jobs);
        }
      },
      {
        cap: shared.length ? `<b>GCF = multiply the overlap</b>: ${productHTML(shared)} = <b>${fmt(g)}</b>. (The shared primes, each to the <b>lowest</b> power: ${expHTML(shared)}.)`
          : `Nothing is shared, so the only common factor is 1: <b>GCF = 1</b>.`,
        run: async (c) => { pairs.forEach(([ea]) => ea.classList.add('lit')); await Promise.all([c.fadeIn(lG, 350), ...pairs.map(([ea], i) => c.anim(ea, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], 360, { delay: i * 90 }))]); }
      },
      {
        cap: `<b>LCM = multiply everything in the picture</b>: ${productHTML(all)} = <b>${fmt(L)}</b>. (Every prime, each to the <b>highest</b> power: ${expHTML(all)}.)`,
        run: async (c) => {
          pairs.forEach(([ea]) => ea.classList.remove('lit'));
          const every = [...pairs.map((p) => p[0]), ...restA, ...restB];
          every.forEach((e) => e.classList.add('lit'));
          await Promise.all([c.fadeIn(lL, 350), ...every.map((e, i) => c.anim(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], 340, { delay: i * 80 }))]);
        }
      }
    ];
    if (X) steps.push({ cap: X[0], run: (c) => c.fadeIn(lX, 400) });
    return steps;
  }
};

/* ============ Example 4: reasoning backwards from a GCF ============ */
const backwards = {
  title: `What a GCF of 180 forces on ${T('P')} and ${T('Q')}`,
  height: 480,
  minW: 966, // drawn this wide and scaled to fit beside the sidebar
  intro: 'The LCM of 9 and 20 is the GCF of P and Q. Work out what that number is — then what it <b>forces</b> P and Q to be.',
  make(stage, v, ex) {
    const W = ex.W;
    const top = add(stage, h('div', 'st-big', `LCM(9, 20) = <span class="muted">?</span>`), 22, 12);
    // P/Q Venn
    const R = 120, cy = 212, cx1 = 150, cx2 = 290, xm = 220;
    const s = svgEl('svg', { class: 'vn-svg' }); stage.appendChild(s);
    const c1 = svgEl('circle', { cx: cx1, cy, r: R, class: 'vn-c a' }), c2 = svgEl('circle', { cx: cx2, cy, r: R, class: 'vn-c b' });
    s.append(c1, c2); c1.style.opacity = c2.style.opacity = 0;
    const nP = add(stage, h('div', 'vn-name a c', T('P')), cx1 - 60, 84), nQ = add(stage, h('div', 'vn-name b c', T('Q')), cx2 + 60, 84);
    const ov = [2, 2, 3, 3, 5].map((p, i) => { const e = add(stage, h('div', 'vchip both', p), xm + (i % 2 ? 24 : -24) + (i === 4 ? 24 : 0), cy - 46 + Math.floor(i / 2) * 46); e.style.width = '44px'; e.style.marginLeft = '-22px'; return e; });
    const qP = add(stage, h('div', 'vchip q', '?'), cx1 - 62, cy), qQ = add(stage, h('div', 'vchip q', '?'), cx2 + 62, cy);
    hide(nP, nQ, ...ov, qP, qQ);
    // statements
    const px = 470, pw = W - px - 20;
    const st = [['A', `${T('P')} is a multiple of 5.`], ['B', `${T('Q')} is a multiple of 45.`], ['C', `${T('P')} could be less than 150.`], ['D', `${T('Q')} could be greater than 2 000.`]]
      .map(([l, t], i) => { const e = add(stage, h('div', 'bk-stmt', `<b>${l}</b> ${t}<span class="v"></span>`), px, 64 + i * 54); e.style.width = pw + 'px'; return e; });
    const verdict = (i, ok, txt) => { const e = st[i].querySelector('.v'); e.innerHTML = `<span class="chk ${ok ? 'y' : 'n'}">${txt}</span>`; if (!ok) st[i].classList.add('f'); return e; };
    const stamp = add(stage, h('div', 'stamp bad', 'Answer: C'), px + pw - 230, 292); stamp.style.opacity = 0;
    // number line of multiples of 180
    const x0 = 40, x1 = W - 40, ay = 400, sx = (val) => x0 + val / 2300 * (x1 - x0);
    const axis = add(stage, h('div', 'nl-ax'), x0, ay - 1); axis.style.width = (x1 - x0) + 'px';
    const mult = []; for (let m = 0; m <= 2160; m += 180) mult.push(m);
    mult.forEach((m) => { add(stage, h('div', 'nl-tk'), sx(m), ay); add(stage, h('div', 'nl-lab', fmt(m)), sx(m), ay + 12); });
    const dots = mult.slice(1).map((m) => { const e = add(stage, h('div', 'nl-dot'), sx(m), ay); e.style.opacity = 0; return e; });
    const mlab = add(stage, h('div', 'nl-flag teal', 'multiples of 180: where P and Q can be'), sx(1080), ay - 72); mlab.style.opacity = 0;
    const zone = (a, b, cls) => { const e = add(stage, h('div', 'nl-zone ' + cls), sx(a), ay - 9); e.style.width = (sx(b) - sx(a)) + 'px'; return e; };
    const d150 = zone(0, 150, 'red'), f150 = add(stage, h('div', 'nl-flag red', 'less than 150: no multiples of 180 here ✗'), x0 - 6, ay - 42); f150.style.translate = '0 0';
    const d2000 = zone(2000, 2300, 'amb'), f2000 = add(stage, h('div', 'nl-flag amb', '&gt; 2 000'), sx(2150), ay + 34);
    const fQ = add(stage, h('div', 'nl-flag ok', 'Q = 2 160 ✓'), sx(2160), ay - 42); fQ.style.translate = '-70% 0';
    hide(f150, d150, f2000, d2000, fQ);
    return [
      {
        cap: '9 = 3<sup>2</sup> and 20 = 2<sup>2</sup> × 5 share no primes, so the LCM takes everything: 2<sup>2</sup> × 3<sup>2</sup> × 5 = <b>180</b>.',
        run: async (c) => { top.innerHTML = 'LCM(9, 20) = 2<sup>2</sup> × 3<sup>2</sup> × 5 = <b class="ok">180</b> &nbsp;<span class="muted">= GCF(P, Q)</span>'; await c.fadeIn(top, 400); }
      },
      {
        cap: 'So <b>GCF(P, Q) = 180</b>. The overlap of P and Q holds exactly 180’s primes: <b>2, 2, 3, 3, 5</b>. P and Q may have other primes too — just none they share.',
        run: (c) => Promise.all([c.anim(c1, [{ opacity: 0 }, { opacity: 1 }], 400), c.anim(c2, [{ opacity: 0 }, { opacity: 1 }], 400), c.fadeIn(nP, 300), c.fadeIn(nQ, 300),
          ...ov.map((e, i) => c.pop(e, 340, { delay: 300 + i * 110 })), c.pop(qP, 300, { delay: 900 }), c.pop(qQ, 300, { delay: 950 })])
      },
      {
        cap: 'Every prime of 180 is inside P <b>and</b> inside Q, so <b>both are multiples of 180</b>: 180, 360, 540, … The smallest either one can be is <b>180</b>.',
        run: (c) => Promise.all([c.fadeIn(mlab, 300), ...dots.map((e, i) => c.pop(e, 300, { delay: i * 70 }))])
      },
      {
        cap: '<b>A:</b> 180 = 5 × 36, so every multiple of 180 is a multiple of 5 — <b>true</b>. <b>B:</b> 180 = 45 × 4, so Q is a multiple of 45 — <b>true</b>.',
        run: (c) => Promise.all([c.pop(verdict(0, 1, '✓ 180 = 5 × 36'), 320), c.pop(verdict(1, 1, '✓ 180 = 45 × 4'), 320, { delay: 250 })])
      },
      {
        cap: '<b>C:</b> P is at least 180, so P can <b>never</b> be less than 150. This statement <b>must be false</b>.',
        run: (c) => Promise.all([c.anim(d150, [{ opacity: 0 }, { opacity: 1 }], 300), c.fadeIn(f150, 300), c.pop(verdict(2, 0, '✗ P ≥ 180'), 320, { delay: 200 }), c.shake(st[2])])
      },
      {
        cap: '<b>D:</b> Q = 2 160 = 180 × 12 works (GCF(180, 2 160) = 180), and 3 600 would too. Q can be greater than 2 000 — <b>true</b>. So the answer is <b>C</b>.',
        run: async (c) => {
          await Promise.all([c.anim(d2000, [{ opacity: 0 }, { opacity: 1 }], 300), c.fadeIn(f2000, 300), c.fadeIn(fQ, 300, { delay: 200 }), c.anim(dots[dots.length - 1], [{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }, { transform: 'scale(1)' }], 400, { delay: 200 }), c.pop(verdict(3, 1, '✓ e.g. 2 160'), 320, { delay: 300 })]);
          await c.anim(stamp, [{ opacity: 0, transform: 'scale(1.8)' }, { opacity: 1, transform: 'scale(1)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' });
        }
      }
    ];
  }
};

/* ============ 2. Perfect square? perfect cube? Deal the primes into equal groups ============ */
const powers = {
  title: 'Perfect square? Perfect cube? Deal the primes into equal groups',
  height: 410,
  minW: 860, // drawn this wide and scaled to fit beside the sidebar
  choices: [144, 216, 64, 72, { sep: 'Example 5 check:' }, 2025, 3375],
  custom: [4, 99999],
  intro: (n) => `A square root splits the prime factors into <b>2 identical groups</b>; a cube root into <b>3</b>. Factor <b>${fmt(n)}</b> and try both.`,
  make(stage, n, ex) {
    const W = ex.W, ps = primeFactors(n), cnt = counts(ps);
    const topLine = add(stage, h('div', 'st-big pw-top', `${fmt(n)} = ` + ps.map((p) => `<span class="pchip">${fmt(p)}</span>`).join(' × ') + (ps.length > 1 && uniq(ps).length < ps.length ? ` = ${expHTML(ps)}` : '')), 22, 12);
    const tops = [...topLine.querySelectorAll('.pchip')]; tops.forEach((e) => (e.style.opacity = 0));
    const pw = (W - 60) / 2;
    const mkPanel = (px, k) => {
      const pan = add(stage, h('div', 'pw-panel'), px, 78); pan.style.width = pw + 'px'; pan.style.height = (k === 2 ? 236 : 290) + 'px';
      add(stage, h('div', 'pw-h', k === 2 ? 'Perfect square? <small>deal into 2 equal groups</small>' : 'Perfect cube? <small>deal into 3 equal groups</small>'), px + 14, 88);
      const rows = [];
      for (let i = 0; i <= k; i++) {
        const y = 126 + i * 54, left = i === k;
        const r = add(stage, h('div', 'pw-row' + (left ? ' left' : '')), px + 100, y); r.style.width = (pw - 114) + 'px';
        add(stage, h('div', 'pw-rl', left ? 'left over' : 'group ' + (i + 1)), px + 12, y + 23);
        rows.push({ y: y + 23, x: px + 100 + 26, n: 0 });
      }
      const verdict = add(stage, h('div', 'pw-verdict'), px + 14, 126 + (k + 1) * 54 + 4); verdict.style.opacity = 0;
      return { rows, verdict, px };
    };
    const P2 = mkPanel(20, 2), P3 = mkPanel(40 + pw, 3);
    const chipPos = (e) => [topLine.offsetLeft + e.offsetLeft + e.offsetWidth / 2, topLine.offsetTop + e.offsetTop + e.offsetHeight / 2];
    const plan = (k) => { // which chip goes to which row
      const out = [], seen = {};
      ps.forEach((p, idx) => { const j = seen[p] = (seen[p] || 0) + 1, e = cnt[p], full = Math.floor(e / k) * k; out.push({ p, idx, row: j <= full ? (j - 1) % k : k }); });
      return out;
    };
    const deal = async (c, P, k) => {
      const pl = plan(k), left = pl.filter((d) => d.row === k).map((d) => d.p), group = pl.filter((d) => d.row === 0).map((d) => d.p);
      const jobs = pl.map((d, i) => {
        const [sx0, sy0] = chipPos(tops[d.idx]), r = P.rows[d.row];
        const e = add(stage, h('div', 'pw-chip' + (d.row === k ? ' red' : ''), fmt(d.p)), sx0, sy0);
        const x = r.x + r.n * 44; r.n++;
        return moveTo(c, e, x, r.y, 620, { delay: i * 110 });
      });
      await Promise.all(jobs);
      const ok = !left.length, root = prod(group);
      P.verdict.innerHTML = ok ? `<span class="ok">✓ Perfect ${k === 2 ? 'square' : 'cube'}</span>: ${T((k === 2 ? '\\sqrt{' : '\\sqrt[3]{') + tn(n) + '}')} = ${group.length ? productHTML(group) + ' = ' : ''}<b>${fmt(root)}</b>`
        : `<span class="red">✗ Not a perfect ${k === 2 ? 'square' : 'cube'}</span> <span class="muted">(${uniq(left).join(', ')} left over)</span>`;
      await c.fadeIn(P.verdict, 350);
      return { ok, root, left: uniq(left), group };
    };
    const exps = uniq(ps).map((p) => cnt[p]);
    const res = { 2: null, 3: null }, pre = (k) => { const pl = plan(k); return { left: uniq(pl.filter((d) => d.row === k).map((d) => d.p)), root: prod(pl.filter((d) => d.row === 0).map((d) => d.p)) }; };
    const r2 = pre(2), r3 = pre(3);
    const oddList = (k, left) => left.map((p) => `${p}<sup>${cnt[p]}</sup>`).join(' and ');
    return [
      { cap: `Factor: <b>${fmt(n)} = ${expHTML(ps)}</b>. The exponents are <b>${listAnd(exps)}</b>.`, run: (c) => Promise.all(tops.map((e, i) => c.pop(e, 320, { delay: i * 80 }))) },
      {
        cap: r2.left.length ? `Deal the primes into <b>2 groups</b>: ${oddList(2, r2.left)} ${r2.left.length > 1 ? 'have' : 'has an'} <b>odd</b> exponent${r2.left.length > 1 ? 's' : ''}, so a prime is left over. ${fmt(n)} is <b>not a perfect square</b>.`
          : `Deal the primes into <b>2 groups</b>: everything pairs up — every exponent is <b>even</b>. ${fmt(n)} is a <b>perfect square</b>, and the square root is one group: <b>${fmt(r2.root)}</b>.`,
        run: async (c) => { res[2] = await deal(c, P2, 2); }
      },
      {
        cap: r3.left.length ? `Now <b>3 groups</b>: ${oddList(3, r3.left)} — ${r3.left.length > 1 ? 'exponents that aren’t multiples' : 'an exponent that isn’t a multiple'} of 3, so a prime is left over. ${fmt(n)} is <b>not a perfect cube</b>.`
          : `Now <b>3 groups</b>: everything shares out evenly — every exponent is a <b>multiple of 3</b>. ${fmt(n)} is a <b>perfect cube</b>, and the cube root is one group: <b>${fmt(r3.root)}</b>.`,
        run: async (c) => { res[3] = await deal(c, P3, 3); }
      }
    ];
  }
};

/* ============ Example 5: filling in the partial factor tree ============ */
const treeFill = {
  title: `Fill in the tree: what must ${T('d')} be?`,
  height: 440,
  minW: 900, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: 'sq', label: '(a) x is a perfect square' }, { v: 'cu', label: '(b) x is a perfect cube' }],
  intro: (m) => `Read the tree from the bottom up to write <b>x</b> as a product of primes. Then choose <b>d</b> (exactly two primes) so that x is a perfect <b>${m === 'sq' ? 'square' : 'cube'}</b>.`,
  make(stage, mode, ex) {
    const W = ex.W, sq = mode === 'sq', d = sq ? 15 : 25, dk = sq ? [3, 5] : [5, 5];
    const N = { x: [230, 40], a: [110, 120], b: [350, 120], a3: [55, 200], a5: [165, 200], b3: [280, 200], c: [420, 200], c3: [360, 280], d: [480, 280], dL: [430, 360], dR: [530, 360] };
    const E = [['x', 'a'], ['x', 'b'], ['a', 'a3'], ['a', 'a5'], ['b', 'b3'], ['b', 'c'], ['c', 'c3'], ['c', 'd'], ['d', 'dL', 1], ['d', 'dR', 1]];
    const s = svgEl('svg', { class: 'lt-svg' }); stage.appendChild(s);
    E.forEach(([p, q, dash]) => s.appendChild(svgEl('line', { x1: N[p][0], y1: N[p][1] + 21, x2: N[q][0], y2: N[q][1] - 21, class: dash ? 'dash' : '' })));
    const node = (k, cls, html) => add(stage, h('div', 'ltn ' + cls, html), N[k][0], N[k][1]);
    const nd = { x: node('x', 'v', 'x'), a: node('a', 'v', 'a'), b: node('b', 'v', 'b'), c: node('c', 'v', 'c'), d: node('d', 'v', 'd') };
    ['a3', 'b3', 'c3'].forEach((k) => node(k, 'p', '3')); node('a5', 'p', '5');
    const dL = node('dL', 'q', '?'), dR = node('dR', 'q', '?');
    const val = (k, v) => { const e = h('span', 'val', '= ' + v); nd[k].appendChild(e); return e; };
    const px = 590, panel = add(stage, h('div', 'lt-panel'), px, 18); panel.style.width = (W - px - 16) + 'px';
    const ln = (html) => { const e = h('div', 'lt-line', html); panel.appendChild(e); e.style.opacity = 0; return e; };
    const L1 = ln(T('a = 3\\times5 = 15')), L2 = ln(T('c = 3\\times d')), L3 = ln(T('b = 3\\times c = 3\\times3\\times d'));
    const L4 = ln(T('x = a\\times b = 3^3\\times5\\times d'));
    const tal = (p, k) => { const e = h('div', 'tally', `<span class="tp">${p}:</span>`); for (let i = 0; i < k; i++) e.appendChild(h('span', 'dot')); e.appendChild(h('span', 'te')); panel.appendChild(e); e.style.opacity = 0; return e; };
    const t3 = tal(3, 3), t5 = tal(5, 1);
    const L5 = ln(T(`d = ${dk[0]}\\times${dk[1]} = ${d}`)), L6 = ln(T(sq ? 'x = 3^4\\times5^2 = 2\\,025 = 45^2' : 'x = 3^3\\times5^3 = 3\\,375 = 15^3'));
    const L7 = ln(sq ? `d = 5 <span class="chk n">✗</span> 9 <span class="chk n">✗</span> 15 <span class="chk y">✓</span> 25 <span class="chk n">✗</span>` : `minimum <b>x = 3 375</b>`);
    const regroup = (t, k, g) => { // gaps every g dots, exponent note
      const dots = [...t.querySelectorAll('.dot')]; t.querySelectorAll('.gap').forEach((e) => e.remove());
      dots.forEach((e, i) => { if (i && i % g === 0) t.insertBefore(h('span', 'gap'), e); });
      const ok = dots.length % g === 0, te = t.querySelector('.te');
      te.className = 'te ' + (ok ? 'ok' : 'bad'); te.innerHTML = `exponent ${dots.length} ${ok ? '✓' : '✗ ' + (g === 2 ? 'odd' : 'not ×3')}`;
    };
    const g = sq ? 2 : 3;
    return [
      { cap: 'Start at the bottom left: <b>a</b> splits into 3 and 5, so <b>a = 3 × 5 = 15</b>.', run: (c) => Promise.all([c.fadeIn(L1, 300), c.pop(val('a', 15), 320)]) },
      { cap: '<b>c</b> splits into 3 and d, so <b>c = 3 × d</b>. Then <b>b</b> splits into 3 and c, so <b>b = 3 × c = 3 × 3 × d</b>.', run: (c) => Promise.all([c.fadeIn(L2, 300), c.fadeIn(L3, 300, { delay: 350 })]) },
      {
        cap: `Put it together: <b>x = a × b = 3 × 5 × 3 × 3 × d = 3<sup>3</sup> × 5 × d</b>. Count each prime: three 3s, one 5.`,
        run: (c) => { regroup(t3, 3, g); regroup(t5, 1, g); return Promise.all([c.fadeIn(L4, 300), c.fadeIn(t3, 300, { delay: 250 }), c.fadeIn(t5, 300, { delay: 400 })]); }
      },
      {
        cap: sq ? 'A perfect square needs every exponent <b>even</b>. 3<sup>3</sup> and 5<sup>1</sup> are <b>both odd</b>, and d is exactly two primes — so d must bring <b>one 3 and one 5</b>: <b>d = 15</b>.'
          : 'A perfect cube needs every exponent to be a <b>multiple of 3</b>. 3<sup>3</sup> is already fine (adding a 3 would spoil it). 5<sup>1</sup> needs <b>two more 5s</b>: <b>d = 5 × 5 = 25</b>.',
        run: async (c) => {
          dk.forEach((p) => { const t = p === 3 ? t3 : t5, e = h('span', 'dot new'); t.insertBefore(e, t.querySelector('.te')); });
          regroup(t3, 3, g); regroup(t5, 1, g);
          [dL, dR].forEach((e, i) => { e.className = 'ltn p new'; e.textContent = dk[i]; });
          await Promise.all([c.pop(dL, 340), c.pop(dR, 340, { delay: 120 }), c.fadeIn(L5, 300, { delay: 200 }), c.pop(val('d', d), 320, { delay: 300 }),
            ...[...stage.querySelectorAll('.dot.new')].map((e, i) => c.pop(e, 300, { delay: 200 + i * 120 }))]);
        }
      },
      {
        cap: sq ? 'Now fill in the rest: c = 45, b = 135, and <b>x = 3<sup>4</sup> × 5<sup>2</sup> = 2 025 = 45<sup>2</sup></b>. A perfect square ✓'
          : 'Now fill in the rest: c = 75, b = 225, and <b>x = 3<sup>3</sup> × 5<sup>3</sup> = 3 375 = 15<sup>3</sup></b>. A perfect cube ✓',
        run: (c) => Promise.all([c.pop(val('c', 3 * d), 300), c.pop(val('b', 9 * d), 300, { delay: 200 }), c.pop(val('x', fmt(135 * d)), 300, { delay: 400 }), c.fadeIn(L6, 300, { delay: 500 })])
      },
      {
        cap: sq ? 'Check the other choices: d = 5 leaves 3<sup>3</sup> odd, d = 9 leaves 5<sup>1</sup> odd, d = 25 leaves 3<sup>3</sup> odd. Only <b>d = 15</b> works → <b>C</b>.'
          : 'd has to be exactly two primes, and 5 × 5 is the only pair that makes every exponent a multiple of 3. So the minimum is <b>x = 3 375</b>.',
        run: (c) => c.fadeIn(L7, 350)
      }
    ];
  }
};

/* ============ 3. What does an irrational decimal look like? ============ */
const decimals = {
  title: 'Decimals that stop, decimals that repeat, and decimals that do neither',
  height: 440,
  minW: 940, // drawn this wide and scaled to fit beside the sidebar
  intro: 'Watch each decimal appear digit by digit. Does it <b>stop</b>? Does a block of digits <b>repeat</b> forever? Or neither?',
  make(stage, v, ex) {
    const W = ex.W;
    const rows = [
      { lab: T('\\frac{3}{8}'), s: '0.375', kind: 'term', tag: 'terminates', q: 1 },
      { lab: T('\\frac{26}{11}'), s: '2.' + '36'.repeat(10), kind: 'rep', k: 2, tag: 'repeats: ' + T('2.\\overline{36}'), q: 1 },
      { lab: T('\\frac{1}{7}'), s: '0.' + '142857'.repeat(3), kind: 'rep', k: 6, tag: 'repeats: ' + T('0.\\overline{142857}'), q: 1 },
      { lab: T('\\sqrt{2}'), s: '1.41421356237309504880', kind: 'irr', tag: 'never stops, never repeats', q: 0 },
      { lab: '<small>Example 7</small>(I)', s: '2.02002000200002000002', kind: 'grow', tag: 'pattern, but no repeating block', q: 0 }
    ];
    const cw = 19, dx = 186, tagX = 650;
    rows.forEach((r, i) => {
      const y = 44 + i * 64;
      r.y = y;
      const lab = add(stage, h('div', 'dc-lab', r.lab), 0, y), eq = add(stage, h('div', 'dc-eq', '='), 160, y);
      r.ds = [...r.s].map((ch, j) => { const e = add(stage, h('div', 'dc-d', ch), dx + j * cw, y); e.style.opacity = 0; return e; });
      r.end = add(stage, h('div', r.kind === 'term' ? 'dc-end' : 'dc-dots', r.kind === 'term' ? 'stops' : '…'), dx + r.s.length * cw + (r.kind === 'term' ? 10 : 2), y);
      r.tagEl = add(stage, h('div', 'dc-tag', r.tag), tagX, y);
      hide(lab, eq, r.end, r.tagEl); r.lab0 = lab; r.eq0 = eq;
    });
    const sumQ = add(stage, h('div', 'dc-sum q', `Terminating or repeating → rational ${T('Q')}`), 20, 392), sumQb = add(stage, h('div', 'dc-sum qb', `Neither → irrational ${T('\\overline{Q}')}`), W / 2 + 40, 392);
    hide(sumQ, sumQb);
    const stream = (c, r) => Promise.all([c.fadeIn(r.lab0, 250), c.fadeIn(r.eq0, 250), ...r.ds.map((e, j) => c.anim(e, [{ opacity: 0, transform: 'scale(1.6)' }, { opacity: 1, transform: 'none' }], 160, { delay: 120 + j * 26 }))])
      .then(() => c.fadeIn(r.end, 250, { from: 'translateX(-6px)' }));
    const blocks = async (c, r) => { const d0 = r.s.indexOf('.') + 1; for (let j = d0; j < r.s.length; j++) { r.ds[j].classList.add('b' + (Math.floor((j - d0) / r.k) % 2)); if ((j - d0 + 1) % r.k === 0) await c.sleep(70); } };
    const tagIt = (c, r) => c.fadeIn(r.tagEl, 300, { from: 'translateX(-8px)' });
    return [
      { cap: `${T('\\tfrac38')} = <b>0.375</b> — the digits <b>stop</b>. A <b>terminating</b> decimal.`, run: async (c) => { await stream(c, rows[0]); await tagIt(c, rows[0]); } },
      { cap: `${T('\\tfrac{26}{11}')} = <b>2.363636…</b> — the block <b>36</b> repeats forever. A <b>repeating</b> decimal, written ${T('2.\\overline{36}')}.`, run: async (c) => { await stream(c, rows[1]); await blocks(c, rows[1]); await tagIt(c, rows[1]); } },
      { cap: `${T('\\tfrac17')} = <b>0.142857 142857…</b> — a longer block (<b>6 digits</b>), but it still repeats forever.`, run: async (c) => { await stream(c, rows[2]); await blocks(c, rows[2]); await tagIt(c, rows[2]); } },
      {
        cap: `${T('\\sqrt2')} = <b>1.41421356…</b> — it never stops, and <b>no block ever repeats</b>, however far you go. (Mathematicians have <b>proved</b> it.)`,
        run: async (c) => {
          const r = rows[3]; await stream(c, r);
          const scan = add(stage, h('div', 'dc-scan'), dx - 2, r.y); scan.style.width = (2 * cw + 4) + 'px';
          await c.anim(scan, [{ left: (dx + 2 * cw - 2) + 'px', opacity: 1 }, { left: (dx + (r.s.length - 2) * cw - 2) + 'px', opacity: 1 }, { left: (dx + (r.s.length - 2) * cw - 2) + 'px', opacity: 0 }], c.fast ? 0 : 1500, { easing: 'linear' });
          scan.style.opacity = 0; await tagIt(c, r);
        }
      },
      {
        cap: `Example 7 (I): <b>2.0200200020…</b> has a <b>pattern</b>, but the runs of zeros keep <b>growing</b> (0, 00, 000, …), so no fixed block repeats. Never stops, never repeats.`,
        run: async (c) => { const r = rows[4]; await stream(c, r); for (let j = 2; j < r.s.length; j++) if (r.s[j] === '0') { r.ds[j].classList.add('z'); if (r.s[j + 1] !== '0') await c.sleep(220); } await tagIt(c, r); }
      },
      {
        cap: `<b>Terminating or repeating → rational</b> (${T('Q')}). Non-terminating <b>and</b> non-repeating → <b>irrational</b> (${T('\\overline{Q}')}). That’s <b>Example 6: D</b>.`,
        run: async (c) => { rows.forEach((r) => r.tagEl.classList.add(r.q ? 'q' : 'qb')); await Promise.all([c.fadeIn(sumQ, 350), c.fadeIn(sumQb, 350, { delay: 200 }), ...rows.map((r, i) => c.anim(r.tagEl, [{ transform: 'scale(1)' }, { transform: 'scale(1.12)' }, { transform: 'scale(1)' }], 350, { delay: i * 90 }))]); }
      }
    ];
  }
};

/* ============ 3. Sort: rational or irrational? ============ */
const SORT = {
  mix: [
    { t: '\\sqrt{16}', q: 1, w: '\\sqrt{16} = 4 = \\tfrac41', n: '16 is a perfect square' },
    { t: '\\sqrt{20}', q: 0, w: '16 < 20 < 25', n: '20 isn’t a perfect square: √20 = 4.4721… never repeats' },
    { t: '0.\\overline{3}', q: 1, w: '0.\\overline{3} = \\tfrac13', n: 'it repeats, so it’s a fraction' },
    { t: '\\pi', q: 0, w: '\\pi = 3.14159265\\ldots', n: 'never stops, never repeats' },
    { t: '-\\tfrac58', q: 1, w: '-\\tfrac58 = -0.625', n: 'a fraction of integers (it terminates)' },
    { t: '\\sqrt{0.4}', q: 0, w: '0.4 = \\tfrac{40}{100}', n: '40 isn’t a perfect square: √0.4 = 0.6324…' },
    { t: '\\sqrt[3]{-8}', q: 1, w: '\\sqrt[3]{-8} = -2', n: 'because (−2)³ = −8' }
  ],
  ex7: [
    { t: '2.02002\\ldots', l: 'I', q: 0, w: '0,\\ 00,\\ 000,\\ 0000,\\ \\ldots', n: 'the zero runs grow: never stops, never repeats' },
    { t: '\\sqrt[3]{\\tfrac{27}{125}}', l: 'II', q: 1, w: '\\sqrt[3]{\\tfrac{27}{125}} = \\tfrac35', n: 'because 3³ = 27 and 5³ = 125' },
    { t: '\\sqrt{0.09}', l: 'III', q: 1, w: '\\sqrt{0.09} = 0.3 = \\tfrac{3}{10}', n: 'because 0.3² = 0.09' },
    { t: '0.\\overline{47}', l: 'IV', q: 1, w: '0.\\overline{47} = \\tfrac{47}{99}', n: 'it repeats, so it’s a fraction' }
  ]
};
const sort = {
  title: 'Sort them: rational or irrational?',
  height: 440,
  choices: [{ v: 'mix', label: 'Mixed set' }, { sep: 'Example 7 check:' }, { v: 'ex7', label: 'I, II, III, IV' }],
  intro: (v) => v === 'ex7' ? 'Example 7’s four numbers. For each one: can it be written <b>exactly</b> as a fraction of integers?' : 'For each number: can it be written <b>exactly</b> as a fraction of integers? If yes, it’s <b>rational</b>.',
  make(stage, v, ex) {
    const W = ex.W, items = SORT[v], n = items.length, colW = (W - 40) / n, cw = Math.min(124, colW - 12);
    const by = 222, bh = 440 - by - 12, bw = (W - 60) / 2;
    const bins = [[20, 'q', `Rational ${T('Q')}`], [40 + bw, 'qb', `Irrational ${T('\\overline{Q}')}`]].map(([x, cls, lab]) => {
      const b = add(stage, h('div', 'so-bin ' + cls), x, by); b.style.width = bw + 'px'; b.style.height = bh + 'px';
      add(stage, h('div', 'so-bh ' + cls, lab), x + 14, by + 8);
      return { x, n: 0 };
    });
    const cards = items.map((it, i) => {
      const e = add(stage, h('div', 'so-card', (it.l ? `<small>${it.l}</small>` : '') + T(it.t)), 20 + (i + 0.5) * colW, 16);
      e.style.setProperty('--cw', cw + 'px'); return e;
    });
    const why = add(stage, h('div', 'so-why'), W / 2, 112);
    const res = add(stage, h('div', 'so-res'), W / 2, 130); res.style.opacity = 0;
    const steps = items.map((it, i) => ({
      cap: `${it.l ? '<b>' + it.l + '.</b> ' : ''}${T(it.w)} — ${it.n}. <b>${it.q ? 'Rational' : 'Irrational'}</b>.`,
      run: async (c) => {
        cards.forEach((e) => e.classList.remove('on'));
        const e = cards[i]; e.classList.add('on');
        why.innerHTML = `<div class="w">${T(it.w)}</div><div class="nt">${it.n}</div>`;
        await c.fadeIn(why, 300);
        await c.sleep(500);
        const b = bins[it.q ? 0 : 1], k = b.n++, sx = b.x + bw * ((k % 3) * 2 + 1) / 6, sy = by + 44 + Math.floor(k / 3) * 84;
        e.classList.remove('on'); e.classList.add(it.q ? 'q' : 'qb');
        await moveTo(c, e, sx, sy, 650);
      }
    }));
    const rat = items.filter((it) => it.q), irr = items.filter((it) => !it.q);
    steps.push({
      cap: v === 'ex7' ? 'Only I is irrational. The rational ones are <b>II, III and IV</b> → <b>B</b>.'
        : `A root is rational only when the radicand is a <b>perfect power</b> of the right kind (16, −8). Repeating and terminating decimals are fractions in disguise.`,
      run: async (c) => {
        why.innerHTML = '';
        res.innerHTML = v === 'ex7' ? 'Rational: II, III and IV → <b>B</b>' : `${rat.length} rational · ${irr.length} irrational`;
        await c.pop(res, 400);
      }
    });
    return steps;
  }
};

/* ============ 3. A repeating decimal back to a fraction ============ */
const repFrac = {
  title: 'Repeating decimal → fraction: line up the tails',
  height: 420,
  minW: 780, // drawn this wide and scaled to fit beside the sidebar
  choices: [{ v: '0|7', label: T('0.\\overline{7}') }, { v: '0|45', label: T('0.\\overline{45}') }, { v: '1|6', label: T('1.\\overline{6}') },
    { sep: 'Example 7 check:' }, { v: '0|47', label: T('0.\\overline{47}') }, { sep: 'Example 8 check:' }, { v: '2|36', label: T('2.\\overline{36}') }],
  intro: (v) => { const [w, b] = v.split('|'); return `Write ${T(w + '.\\overline{' + b + '}')} as a fraction. Call the number <b>x</b>, then make a second copy whose repeating tail <b>lines up</b> exactly.`; },
  make(stage, v, ex) {
    const W = ex.W, [ws, bs] = v.split('|'), w = Number(ws), b = Number(bs), k = bs.length, P = 10 ** k;
    const top = w * P + b, diff = top - w, g = gcd(diff, P - 1), num = diff / g, den = (P - 1) / g;
    const X = 430, cw = 25, nt = Math.max(6, 2 * k), r1 = 62, r2 = 132, ry = 172, r3 = 210, r4 = 300;
    const colX = (j) => (j < 0 ? X + j * cw : X + (j + 1) * cw); // j < 0: integer digits; j >= 0: tail digits
    const tailDigit = (j) => bs[j % k];
    const dec = T(`${ws}.\\overline{${bs}}`);
    const labX = X - String(w * 10 ** bs.length + Number(bs)).length * cw - cw / 2 - 14;
    // x line
    const ws2 = String(w);
    const xl = add(stage, h('div', 'rf-lab', T('x =')), labX, r2);
    const xInt = [...ws2].map((ch, i) => add(stage, h('div', 'rf-ch', ch), colX(i - ws2.length), r2));
    const xDot = add(stage, h('div', 'rf-ch dot', '.'), X, r2);
    const xTail = []; for (let j = 0; j < nt; j++) xTail.push(add(stage, h('div', 'rf-ch b' + (Math.floor(j / k) % 2), tailDigit(j)), colX(j), r2));
    const xDots = add(stage, h('div', 'rf-ch', '…'), colX(nt), r2);
    hide(xl, ...xInt, xDot, ...xTail, xDots);
    // top line (10^k x)
    const ts = String(top);
    const tl = add(stage, h('div', 'rf-lab', T(`${P}x =`)), labX, r1);
    const tDot = add(stage, h('div', 'rf-ch dot', '.'), X, r1);
    const tDots = add(stage, h('div', 'rf-ch', '…'), colX(nt), r1);
    hide(tl, tDot, tDots);
    const minus = add(stage, h('div', 'rf-minus', '−'), labX - 120, r2);
    const rule = add(stage, h('div', 'rf-rule'), labX - 140, ry); rule.style.width = (colX(nt) + 20 - labX + 140) + 'px';
    const st1 = add(stage, h('div', 'rf-strike'), X + cw / 2, r1), st2 = add(stage, h('div', 'rf-strike'), X + cw / 2, r2);
    [st1, st2].forEach((e) => (e.style.width = (colX(nt) + 14 - X - cw / 2) + 'px'));
    const dl = add(stage, h('div', 'rf-lab', T(`${P - 1}x =`)), labX, r3);
    const ds = String(diff), dDig = [...ds].map((ch, i) => add(stage, h('div', 'rf-ch', ch), colX(i - ds.length), r3));
    const res = add(stage, h('div', 'rf-res', T(`x = \\dfrac{${diff}}{${P - 1}}`)), labX - 140, r4);
    const note = add(stage, h('div', 'rf-note'), labX - 140, r4 + 50);
    hide(minus, rule, st1, st2, dl, ...dDig, res, note);
    const exNote = { '2|36': `<b>Example 8:</b> ${T('\\tfrac{c}{d}=\\tfrac{26}{11}')}, so <b>c = 26</b> → <b>A</b>. Check: 26 ÷ 11 = 2.3636… ✓`, '0|47': `<b>Example 7 (IV):</b> ${T('0.\\overline{47}=\\tfrac{47}{99}')} is a fraction of integers, so it is <b>rational</b>.` }[v];
    const steps = [
      {
        cap: `Call the number <b>x</b>: x = ${dec} = ${ws}.${bs.repeat(Math.ceil(nt / k)).slice(0, nt)}… The repeating block is <b>${bs}</b> — <b>${k} digit${k > 1 ? 's' : ''}</b>.`,
        run: (c) => Promise.all([c.fadeIn(xl, 300), ...[...xInt, xDot, ...xTail, xDots].map((e, i) => c.pop(e, 260, { delay: 100 + i * 50 }))])
      },
      {
        cap: `Multiply by <b>${P === 10 ? '10' : '10<sup>' + k + '</sup> = ' + P}</b> (one zero per repeating digit). The decimal point moves <b>${k} place${k > 1 ? 's' : ''}</b>, so ${P}x = ${fmt(top)}.${bs.repeat(Math.ceil(nt / k)).slice(0, nt)}… and the <b>tails line up</b>.`,
        run: async (c) => {
          // copy every digit of x, then slide it up and k columns left; leading zeros drop off
          const seq = [...ws2.split('').map((ch, i) => ({ ch, col: i - ws2.length })), ...xTail.map((_, j) => ({ ch: tailDigit(j), col: j }))];
          const jobs = [c.fadeIn(tl, 300), c.pop(tDot, 300, { delay: 300 })];
          seq.forEach((d, i) => {
            const nc = d.col - k; // new column (tail digits can cross into the whole-number part)
            const lead = nc < -ts.length;
            const e = add(stage, h('div', 'rf-ch' + (nc >= 0 ? ' b' + (Math.floor(nc / k) % 2) : ''), d.ch), colX(d.col), r2);
            jobs.push(moveTo(c, e, colX(nc), r1, 700, { delay: i * 40 }).then(() => (lead ? c.anim(e, [{ opacity: 1 }, { opacity: 0 }], 250) : null)));
          });
          for (let j = nt - k; j < nt; j++) { const e = add(stage, h('div', 'rf-ch b' + (Math.floor(j / k) % 2), tailDigit(j)), colX(j), r1); jobs.push(c.pop(e, 260, { delay: 750 + (j - nt + k) * 80 })); }
          jobs.push(c.fadeIn(tDots, 250, { delay: 900, from: 'none' }));
          await Promise.all(jobs);
        }
      },
      {
        cap: `Subtract: ${P}x − x. The tails are <b>identical</b>, so they <b>cancel</b>: ${P}x − x = <b>${P - 1}x</b> and ${fmt(top)} − ${w} = <b>${fmt(diff)}</b>.`,
        run: async (c) => {
          await Promise.all([c.fadeIn(minus, 250), c.anim(rule, [{ opacity: 0, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], 400)]);
          await Promise.all([st1, st2].map((e, i) => c.anim(e, [{ opacity: 1, transform: 'scaleX(0)' }, { opacity: 1, transform: 'scaleX(1)' }], 500, { delay: i * 150 })));
          await Promise.all([c.fadeIn(dl, 300), ...dDig.map((e, i) => c.pop(e, 300, { delay: 100 + i * 80 }))]);
        }
      },
      { cap: `Divide both sides by ${P - 1}: <b>x = ${T(`\\tfrac{${diff}}{${P - 1}}`)}</b>.`, run: (c) => c.fadeIn(res, 400) },
      {
        cap: g > 1 ? `Simplify: the GCF of ${diff} and ${P - 1} is <b>${g}</b>, so x = <b>${T(`\\tfrac{${num}}{${den}}`)}</b> in simplest form.` : `The GCF of ${diff} and ${P - 1} is 1, so <b>${T(`\\tfrac{${num}}{${den}}`)}</b> is already in simplest form.`,
        run: async (c) => {
          res.innerHTML = T(g > 1 ? `x = \\dfrac{${diff}}{${P - 1}} = \\dfrac{${diff}\\div${g}}{${P - 1}\\div${g}} = \\dfrac{${num}}{${den}}` : `x = \\dfrac{${num}}{${den}}`);
          note.innerHTML = `So ${dec} = <b>${T(`\\tfrac{${num}}{${den}}`)}</b>`;
          await Promise.all([c.fadeIn(res, 350), c.fadeIn(note, 350, { delay: 250 })]);
        }
      }
    ];
    if (exNote) steps.push({ cap: exNote, run: async (c) => { note.innerHTML = exNote; await c.fadeIn(note, 350); } });
    return steps;
  }
};

/* ============ 4. Pin radicals between perfect powers, then compare ============ */
const RSETS = { A: [[2, 30], [3, 125], [4, 16], [3, 30]], B: [[3, 100], [2, 20], [4, 256], [5, 32]], E: [[3, 64], [4, 81], [2, 17], [5, 243]] };
const POW = { 2: 'squares', 3: 'cubes', 4: 'fourth powers', 5: 'fifth powers' };
const radT = ([n, r]) => (n === 2 ? `\\sqrt{${tn(r)}}` : `\\sqrt[${n}]{${tn(r)}}`);
const lcmI = (a, b) => a * b / gcd(a, b);
const ord = (n) => n + (n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
const compare = {
  title: 'Pin each radical between perfect powers, then compare',
  height: 460,
  choices: [{ v: 'A', label: 'Set A' }, { v: 'B', label: 'Set B' }, { sep: 'Example 10 check:' }, { v: 'E', label: T('\\sqrt[3]{64},\\ \\sqrt[4]{81},\\ \\sqrt{17},\\ \\sqrt[5]{243}') }],
  intro: (v) => `Which is largest: ${RSETS[v].map((x) => T(radT(x))).join(', ')}? Evaluate the exact ones, pin the rest between <b>perfect powers</b>, and put them all on one number line.`,
  make(stage, v, ex) {
    const W = ex.W, set = RSETS[v].map(([n, r]) => {
      const k = Math.floor(Math.pow(r, 1 / n) + 1e-9), exact = k ** n === r, val = Math.pow(r, 1 / n);
      return { n, r, k, exact, val, t: radT([n, r]) };
    });
    const cnt = set.length, colW = (W - 40) / cnt, cw = Math.min(214, colW - 14);
    const cards = set.map((it, i) => {
      const ev = it.exact ? `${T(`${it.k}^{${it.n}} = ${tn(it.r)}`)}<span class="val">= ${it.k}</span>`
        : `${T(`${tn(it.k ** it.n)} < ${tn(it.r)} < ${tn((it.k + 1) ** it.n)}`)}<br>between ${it.k} and ${it.k + 1}<span class="val">≈ ${it.val.toFixed(2)}</span>`;
      const e = add(stage, h('div', 'cr-card', `<div class="cr-rad">${T(it.t)}</div><div class="cr-ev">${ev}</div>`), 20 + (i + 0.5) * colW, 12);
      e.style.setProperty('--cw', cw + 'px'); return e;
    });
    const vals = set.map((s) => s.val), lo = Math.max(0, Math.floor(Math.min(...vals)) - 1), hi = Math.floor(Math.max(...vals)) + 1;
    const x0 = 70, x1 = W - 70, ay = 336, sx = (val) => x0 + (val - lo) / (hi - lo) * (x1 - x0);
    const axis = add(stage, h('div', 'nl-ax'), x0 - 20, ay - 1); axis.style.width = (x1 - x0 + 40) + 'px';
    for (let t = lo; t <= hi; t++) { add(stage, h('div', 'nl-tk'), sx(t), ay); add(stage, h('div', 'nl-lab', t), sx(t), ay + 12); }
    const placed = [];
    const dots = set.map((it) => {
      const d = add(stage, h('div', 'nl-dot'), sx(it.val), ay);
      let y = ay - 58; placed.forEach((p) => { if (Math.abs(p.x - sx(it.val)) < 70 && p.y === y) y -= 48; });
      placed.push({ x: sx(it.val), y });
      const l = add(stage, h('div', 'cr-dl', T(it.t)), sx(it.val), y);
      hide(d, l); return { d, l };
    });
    const best = vals.indexOf(Math.max(...vals));
    const order = [...set.keys()].sort((a, b) => vals[b] - vals[a]), [i1, i2] = order;
    const A = set[i1], B = set[i2], L = lcmI(A.n, B.n), pa = A.r ** (L / A.n), pb = B.r ** (L / B.n);
    const powLine = add(stage, h('div', 'cr-pow', A.n === B.n ? T(`${tn(A.r)} > ${tn(B.r)}\\ \\Rightarrow\\ ${A.t} > ${B.t}`)
      : T(`(${A.t})^{${L}} = ${tn(A.r)}^{${L / A.n}} = ${tn(pa)} \\;>\\; ${tn(pb)} = ${tn(B.r)}^{${L / B.n}} = (${B.t})^{${L}}`)), W / 2, 398);
    powLine.style.opacity = 0;
    const steps = set.map((it, i) => ({
      cap: it.exact ? `${T(it.t)}: ${it.k}<sup>${it.n}</sup> = ${fmt(it.r)}, so ${T(it.t)} = <b>${it.k}</b> exactly.`
        : `${T(it.t)}: ${fmt(it.r)} sits between the perfect ${POW[it.n]} ${fmt(it.k ** it.n)} and ${fmt((it.k + 1) ** it.n)}, so ${T(it.t)} is between <b>${it.k}</b> and <b>${it.k + 1}</b> (≈ ${it.val.toFixed(2)}).`,
      run: async (c) => {
        cards.forEach((e) => e.classList.remove('on')); cards[i].classList.add('on', 'done');
        await c.fadeIn(cards[i].querySelector('.cr-ev'), 300);
        await Promise.all([c.anim(dots[i].d, [{ opacity: 0, transform: 'translateY(-60px)' }, { opacity: 1, transform: 'none' }], 450, { easing: 'cubic-bezier(.3,1.4,.5,1)' }), c.fadeIn(dots[i].l, 350, { delay: 200 })]);
      }
    }));
    const asc = order.slice().reverse(), inOrder = asc.map((j, q) => (q ? (Math.abs(vals[j] - vals[asc[q - 1]]) < 1e-9 ? ' = ' : ' &lt; ') : '') + T(set[j].t)).join('');
    steps.push({
      cap: `The largest is the one <b>farthest right</b>: <b>${T(set[best].t)}</b>${v === 'E' ? ' → <b>A</b>' : ''}. In order: ${inOrder}.`,
      run: async (c) => {
        cards.forEach((e) => e.classList.remove('on')); cards[best].classList.add('win'); dots[best].l.classList.add('win');
        await Promise.all([c.anim(cards[best], [{ transform: 'scale(1)' }, { transform: 'scale(1.06)' }, { transform: 'scale(1)' }], 450), c.anim(dots[best].d, [{ transform: 'scale(1)' }, { transform: 'scale(1.8)' }, { transform: 'scale(1)' }], 450)]);
      }
    });
    steps.push({
      cap: A.n === B.n ? `Same index? Then just compare the radicands: ${fmt(A.r)} &gt; ${fmt(B.r)}.`
        : `A check with <b>no decimals</b>: raise the top two to the <b>${ord(L)} power</b> (a multiple of both indices). ${fmt(pa)} &gt; ${fmt(pb)}, so ${T(A.t)} &gt; ${T(B.t)} ✓`,
      run: (c) => c.fadeIn(powLine, 400, { from: 'translateY(8px)' })
    });
    return steps;
  }
};

/* ============ Example 9: estimating √M + √N ============ */
const estimate = {
  title: `Estimate ${T('\\sqrt{M}+\\sqrt{N}')} on the number line`,
  height: 430,
  intro: `${T('20<M<30')} and ${T('5<N<6')}. Squeeze each square root between numbers we know, then add.`,
  make(stage, v, ex) {
    const W = ex.W, x0 = 126, x1 = W - 40, sx = (val) => x0 + val * (x1 - x0) / 10, ay = 300;
    for (let t = 0; t <= 10; t++) { const g = add(stage, h('div', 'es-grid'), sx(t), 30); g.style.height = (ay - 30) + 'px'; }
    const axis = add(stage, h('div', 'nl-ax'), x0 - 16, ay - 1); axis.style.width = (x1 - x0 + 26) + 'px';
    for (let t = 0; t <= 10; t++) { add(stage, h('div', 'nl-tk'), sx(t), ay); add(stage, h('div', 'nl-lab', t), sx(t), ay + 12); }
    const rows = { M: 70, N: 142, S: 214 };
    add(stage, h('div', 'es-rowlab', T('\\sqrt{M}')), 8, rows.M); add(stage, h('div', 'es-rowlab', T('\\sqrt{N}')), 8, rows.N);
    const sl = add(stage, h('div', 'es-rowlab', T('\\sqrt{M}+\\sqrt{N}')), 0, rows.S); sl.style.width = '118px'; sl.style.fontSize = '20px';
    const band = (row, a, b, cls) => {
      const e = add(stage, h('div', 'es-band ' + cls), sx(a), rows[row]); e.style.width = (sx(b) - sx(a)) + 'px';
      const tight = cls.includes('tight');
      const la = add(stage, h('div', 'es-num' + (tight ? ' t' : ''), String(a)), sx(a), rows[row] + (tight ? 15 : -36));
      const lb = add(stage, h('div', 'es-num' + (tight ? ' t' : ''), String(b)), sx(b), rows[row] + (tight ? 15 : -36));
      if (tight) { la.style.translate = '-100% 0'; lb.style.translate = '0 0'; }
      hide(e, la, lb); return [e, la, lb];
    };
    const show = (c, [e, la, lb]) => Promise.all([c.anim(e, [{ opacity: 0, transform: 'scaleX(.2)' }, { opacity: 1, transform: 'scaleX(1)' }], 500), c.fadeIn(la, 300, { delay: 250 }), c.fadeIn(lb, 300, { delay: 250 })]);
    const fade = (c, els, to = 0.25) => Promise.all(els.map((e) => c.anim(e, [{ opacity: e.style.opacity || 1 }, { opacity: to }], 300)));
    const mC = band('M', 4, 6, 'coarse'), nC = band('N', 2, 3, 'coarse'), sC = band('S', 6, 9, 'sum coarse');
    const mT = band('M', 4.47, 5.48, 'tight'), nT = band('N', 2.24, 2.45, 'tight'), sT = band('S', 6.71, 7.93, 'sum tight');
    const pts = [['P', 3.5], ['Q', 6.2], ['R', 7.4], ['S', 9.3]].map(([n, val]) => { const d = add(stage, h('div', 'es-pt'), sx(val), ay), l = add(stage, h('div', 'es-pl', T(n)), sx(val), ay - 40); hide(d, l); return { d, l, n, val }; });
    const ineq = add(stage, h('div', 'es-ineq'), W / 2, 350);
    const say = (c, s) => { ineq.innerHTML = T(s); return c.fadeIn(ineq, 300); };
    const mark = (p, cls) => { [p.d, p.l].forEach((e) => { e.classList.remove('amb', 'ok', 'dim'); if (cls) e.classList.add(cls); }); };
    return [
      { cap: '<b>20 &lt; M &lt; 30.</b> The perfect squares around them: 16 &lt; 20 and 30 &lt; 36. So √M is between √16 and √36: <b>4 &lt; √M &lt; 6</b>.', run: (c) => Promise.all([show(c, mC), say(c, '\\sqrt{16} < \\sqrt{M} < \\sqrt{36} \\;\\Rightarrow\\; 4 < \\sqrt{M} < 6')]) },
      { cap: '<b>5 &lt; N &lt; 6</b> sits between the perfect squares 4 and 9, so <b>2 &lt; √N &lt; 3</b>.', run: (c) => Promise.all([show(c, nC), say(c, '\\sqrt{4} < \\sqrt{N} < \\sqrt{9} \\;\\Rightarrow\\; 2 < \\sqrt{N} < 3')]) },
      {
        cap: 'Add low + low and high + high: <b>6 &lt; √M + √N &lt; 9</b>. But <b>Q (≈ 6.2) and R (≈ 7.4)</b> both fit in there — we need tighter bounds!',
        run: async (c) => { await Promise.all([show(c, sC), say(c, '4+2 < \\sqrt{M}+\\sqrt{N} < 6+3')]); await Promise.all(pts.flatMap((p, i) => [c.pop(p.d, 300, { delay: i * 120 }), c.fadeIn(p.l, 300, { delay: i * 120 })])); pts.forEach((p) => mark(p, p.n === 'Q' || p.n === 'R' ? 'amb' : null)); }
      },
      { cap: 'Tighten √M with the calculator: <b>√20 ≈ 4.47</b> and <b>√30 ≈ 5.48</b>, so 4.47 &lt; √M &lt; 5.48.', run: async (c) => { await fade(c, mC.slice(1), 0); await Promise.all([show(c, mT), say(c, '\\sqrt{20}\\approx4.47 < \\sqrt{M} < \\sqrt{30}\\approx5.48')]); } },
      { cap: 'Tighten √N: <b>√5 ≈ 2.24</b> and <b>√6 ≈ 2.45</b>, so 2.24 &lt; √N &lt; 2.45.', run: async (c) => { await fade(c, nC.slice(1), 0); await Promise.all([show(c, nT), say(c, '\\sqrt{5}\\approx2.24 < \\sqrt{N} < \\sqrt{6}\\approx2.45')]); } },
      {
        cap: 'Add again: 4.47 + 2.24 = <b>6.71</b> and 5.48 + 2.45 = <b>7.93</b>. Q ≈ 6.2 is now too small and S ≈ 9.3 too big. Only <b>R ≈ 7.4</b> fits → <b>C</b>.',
        run: async (c) => { await fade(c, sC.slice(1), 0); await Promise.all([show(c, sT), say(c, '6.71 < \\sqrt{M}+\\sqrt{N} < 7.93')]); pts.forEach((p) => mark(p, p.n === 'R' ? 'ok' : 'dim')); await c.anim(pts[2].d, [{ transform: 'scale(1)' }, { transform: 'scale(1.8)' }, { transform: 'scale(1)' }], 450); }
      }
    ];
  }
};

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { ladder, venn, backwards, powers, treeFill, decimals, sort, repFrac, compare, estimate };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

/* Example 5 with numbers: the partly built tree, d left for the class to split */
function mountTree5() {
  const host = document.getElementById('tree5'); if (!host) return;
  let dv = 15;
  const tree = new FactorTree(host.querySelector('.ft-host'), { n: 135 * dv, preset: [15, 9 * dv], style: 'plain', maxSlot: 92 });
  const deepen = () => {
    const [a, b] = tree.root.kids;
    tree.split(a, 3, 5, true); tree.split(b, 3, 3 * dv, true); tree.split(b.kids[1], 3, dv, true);
    tree.layout(false); tree.updateTray(true);
  };
  const orig = tree.reset.bind(tree);
  tree.reset = () => { orig(); deepen(); };
  deepen();
  const chips = host.querySelectorAll('[data-d]');
  chips.forEach((b) => b.addEventListener('click', () => { chips.forEach((x) => x.classList.toggle('on', x === b)); dv = Number(b.dataset.d); tree.setN(135 * dv, [15, 9 * dv]); }));
}

function mountWarmup() {
  const ten = document.querySelector('.ff-t.ten');
  document.querySelectorAll('.ff-t:not(.done)').forEach((b) => b.addEventListener('click', () => b.classList.toggle('shown')));
  const all = document.querySelector('[data-ffall]');
  if (all) all.addEventListener('click', () => document.querySelectorAll('.ff-t:not(.done)').forEach((b, i) => setTimeout(() => { b.classList.add('shown'); b.animate([{ transform: 'scale(1.08)' }, { transform: 'scale(1)' }], 260); }, i * 110)));
  document.querySelectorAll('[data-rv]').forEach((b) => b.addEventListener('click', () => document.getElementById(b.dataset.rv).classList.toggle('on')));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => { const p = b.closest('.poll'); p.classList.toggle('revealed'); if (ten) ten.classList.toggle('solved', p.classList.contains('revealed')); }));
  document.querySelectorAll('.ff-x, .br-card').forEach((b) => b.addEventListener('click', () => b.classList.toggle('on')));
}

function mountBlanks() {
  document.querySelectorAll('.pp-b[data-a]').forEach((b) => b.addEventListener('click', () => { b.classList.toggle('filled'); b.textContent = b.classList.contains('filled') ? b.dataset.a : ''; }));
  const all = document.querySelector('[data-ppall]');
  if (all) all.addEventListener('click', () => document.querySelectorAll('.pp-b[data-a]').forEach((b, i) => setTimeout(() => { b.classList.add('filled'); b.textContent = b.dataset.a; b.animate([{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 260); }, i * 90)));
}

function drawNumberLine() { // Example 9's printed number line
  const g = document.querySelector('.nl-fig .tk'); if (!g) return;
  for (let t = 0; t <= 10; t++) { const x = 20 + t * 70; g.appendChild(svgEl('line', { x1: x, y1: 43, x2: x, y2: 57 })); const s = svgEl('text', { x, y: 76 }); s.textContent = t; g.appendChild(s); }
}

mountExplainers(); mountTree5(); mountWarmup(); mountBlanks(); drawNumberLine();

/* ============ Stand Up Break! — review: prime factorization, GCF and LCM, perfect powers (lessons/js/standup.js) ============ */
const suN = (n) => { const s = String(n); return s.length > 3 ? s.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,') : s; };
function suPF(n) { const f = []; for (let p = 2; p * p <= n; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) f.push([p, e]); } if (n > 1) f.push([n, 1]); return f; }
const suPow = (f) => f.map(([p, e]) => (e > 1 ? p + '^{' + e + '}' : String(p))).join('\\times ');
const suVal = (f) => f.reduce((s, [p, e]) => s * p ** e, 1);
const suCnt = (n) => suPF(n).reduce((s, x) => s + x[1], 0);
function suLadder(n) { const st = []; let m = n; for (const [p, e] of suPF(n)) for (let i = 0; i < e; i++) { m /= p; st.push('\\div' + p + '=' + suN(m)); } return suN(n) + st.join(',\\ '); }
standup('u1l9', {
  intro: 'Every question here starts the same way: break the numbers into primes. Then decide what the question needs.',
  levels: {
    BEG: (r) => { // Example 1: a prime factorization of a four-digit number
      let n; do n = r.int(1000, 9999); while (suPF(n).slice(-1)[0][0] < 11 || suPF(n).slice(-1)[0][0] > (r.chance(0.2) ? 17 : 13) || suPF(n).length < 3 || suCnt(n) < 4 || suCnt(n) > 7);
      const f = suPF(n);
      return { text: 'Use a division ladder to write this number as a product of prime factors in exponent form. Then list its prime factors.', q: suN(n),
        a: [suLadder(n), suN(n) + '=' + suPow(f), '\\text{prime factors: }' + f.map((x) => x[0]).join(',\\ ')] };
    },
    PRG: (r) => { // Example 3: the GCF (and LCM) of two four-digit numbers
      for (;;) {
        const P = [2, 3, 5, 7, 11, 13, 17, 19], g = r.pick([6, 10, 12, 14, 15, 18, 21, 22, 26, 33, 35, 39, 42]);
        const u = r.pick(P) * r.pick(P), v = r.pick(P) * r.pick(P), a = g * u, b = g * v;
        if (gcd(u, v) !== 1 || a < 1000 || b < 1000 || a > 9999 || b > 9999 || a === b) continue;
        const L = a / g * b, [x, y] = a < b ? [a, b] : [b, a];
        return { text: 'Find the <b>GCF</b> and the <b>LCM</b> of these numbers. Leave the LCM as a product of primes.', q: suN(x) + '\\ \\text{and}\\ ' + suN(y),
          a: [suN(x) + '=' + suPow(suPF(x)) + ',\\quad ' + suN(y) + '=' + suPow(suPF(y)), '\\text{GCF}=' + suPow(suPF(g)) + '=' + g, '\\text{LCM}=' + suPow(suPF(L)) + '=' + suN(L)] };
      }
    },
    MAS: (r) => { // Lesson 3, Example 5 and this lesson's Example 5: the smallest multiplier for a perfect square or cube
      for (;;) {
        const k = r.pick([2, 3]), P = r.shuffle([2, 3, 5, 7, 11]).slice(0, r.pick([2, 3, 3])).sort((a, b) => a - b), f = P.map((p) => [p, r.int(1, k === 2 ? 4 : 5)]), n = suVal(f);
        const need = f.map(([p, e]) => [p, (k - e % k) % k]).filter((x) => x[1]), M = suVal(need), X = n * M, root = Math.round(X ** (1 / k));
        if (n < 40 || n > 5000 || M === 1 || M >= n || X > 1e6 || root ** k !== X) continue;
        const sq = k === 2, g = f.map(([p, e]) => [p, (e + (k - e % k) % k) / k]);
        return { text: `Find the smallest whole number this number must be multiplied by to give a <b>perfect ${sq ? 'square' : 'cube'}</b>. Then state the ${sq ? 'square' : 'cube'} root of the result.`, q: suN(n),
          a: [suN(n) + '=' + suPow(f) + ':\\ \\text{need }' + suPow(need) + '\\ \\text{more' + (sq ? ' (even exponents)' : ' (multiples of 3)') + '}',
            '\\times' + suN(M) + ':\\quad ' + suN(n) + '\\times' + suN(M) + '=' + suN(X) + '=' + suPow(f.map(([p, e]) => [p, e + (k - e % k) % k])),
            (sq ? '\\sqrt{' : '\\sqrt[3]{') + suN(X) + '}=' + suPow(g) + '=' + suN(root)] };
      }
    }
  }
});
