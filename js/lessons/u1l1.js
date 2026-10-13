/* Math 10C · Unit 1 · Lesson 1 — Prime Building Blocks of Numbers: the explainers on this page. */
import { h, fmt, Explainer, FactorTree, factors, isPrime, primeFactors, primesUpTo, productHTML, expHTML, decimal, quickReason } from '../explain.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const plural = (k, w) => k + ' ' + w + (k === 1 ? '' : 's');

/* ============ 1. Factors make rectangles ============ */
const rectangles = {
  title: 'Factors make rectangles',
  height: 420,
  choices: [12, 18, 36, 11, 16, 40, 28],
  intro: (n) => `Here are <b>${n}</b> square tiles. Arrange <b>all</b> of them into equal rows to make a rectangle. Each rectangle that works is a <b>factor pair</b> of ${n}.`,
  make(stage, n, ex) {
    const W = ex.W, H = 420, pw = W < 760 ? 190 : 240, ax = 18, ay = 22, aw = W - pw - 50, ah = H - 48;
    const panel = add(stage, h('div', 'rt-panel', '<div class="rt-h">Rows tried</div>'), W - pw - 14, 14);
    panel.style.width = pw + 'px'; panel.style.height = (H - 28) + 'px';
    const list = h('div', 'rt-list'); panel.appendChild(list);
    const sum = h('div', 'rt-sum'); panel.appendChild(sum);
    const dimL = add(stage, h('div', 'rt-dim'), 0, 0), dimT = add(stage, h('div', 'rt-dim'), 0, 0), lefty = add(stage, h('div', 'rt-dim red'), 0, 0);
    [dimL, dimT, lefty].forEach((d) => (d.style.opacity = 0));
    const tiles = [];
    const cols0 = Math.ceil(Math.sqrt(n)), s0 = Math.min(34, aw / (cols0 + 1)), gx = ax + (aw - cols0 * s0) / 2, gy = ay + (ah - Math.ceil(n / cols0) * s0) / 2;
    for (let i = 0; i < n; i++) {
      const t = h('div', 'tile'), r = Math.round((Math.sin(i * 12.9898) * 43758.5453 % 1) * 24 - 12);
      const x = gx + (i % cols0) * s0 + (i * 7 % 5) - 2, y = gy + Math.floor(i / cols0) * s0 + (i * 3 % 5) - 2;
      t.style.width = t.style.height = s0 * 0.86 + 'px'; t._t = `translate(${x}px, ${y}px) rotate(${r}deg)`; t.style.transform = t._t;
      stage.appendChild(t); tiles.push(t);
    }
    async function arrange(c, d) {
      const q = Math.floor(n / d), r = n - d * q, cols = q + (r ? 1.7 : 0);
      const cell = Math.min(40, aw / cols, (ah - 10) / d), sz = cell * 0.86;
      const x0 = ax + (aw - cols * cell) / 2 + 10, y0 = ay + (ah - d * cell) / 2 + 8;
      const jobs = tiles.map((t, i) => {
        let x, y, left = false;
        if (i < d * q) { x = x0 + (i % q) * cell; y = y0 + Math.floor(i / q) * cell; } else { const j = i - d * q; x = x0 + (q + 0.7) * cell; y = y0 + j * cell; left = true; }
        const to = `translate(${x}px, ${y}px) rotate(0deg)`, from = t._t; t._t = to;
        t.classList.toggle('left', left); t.classList.toggle('good', !r);
        return c.anim(t, [{ transform: from, width: t.style.width, height: t.style.height }, { transform: to, width: sz + 'px', height: sz + 'px' }], 650, { delay: Math.min(i * 8, 260) });
      });
      dimL.innerHTML = plural(d, 'row'); dimT.innerHTML = q + ' in each row';
      at(dimL, x0 - 12, y0 + d * cell / 2); at(dimT, x0 + q * cell / 2, y0 - 16);
      dimL.style.translate = '-100% -50%'; dimT.style.translate = '-50% -50%';
      if (r) { lefty.innerHTML = r + ' left over'; at(lefty, x0 + (q + 0.7) * cell + cell / 2, y0 + r * cell + 14); lefty.style.translate = '-50% 0'; }
      await Promise.all([...jobs, c.anim(dimL, [{ opacity: 0 }, { opacity: 1 }], 300, { delay: 400 }), c.anim(dimT, [{ opacity: 0 }, { opacity: 1 }], 300, { delay: 400 }), c.anim(lefty, [{ opacity: r ? 0 : lefty.style.opacity || 0 }, { opacity: r ? 1 : 0 }], 300, { delay: 450 })]);
    }
    const steps = [], top = Math.floor(Math.sqrt(n));
    for (let d = 1; d <= top; d++) {
      const q = Math.floor(n / d), r = n % d;
      steps.push({
        cap: d === 1 ? `<b>1 row of ${n}.</b> This always works: 1 × ${n} = ${n}. Every whole number has <b>1</b> and <b>itself</b> as factors.`
          : r === 0 ? `<b>${d} rows of ${q}.</b> ${d} × ${q} = ${n}, nothing left over, so <b>${d}</b> and <b>${q}</b> are both factors.`
            : `<b>${d} rows?</b> ${d} rows of ${q} leaves <b class="red">${r} left over</b> (${n} ÷ ${d} = ${q} R${r}). ${d} is <b>not</b> a factor.`,
        run: async (c) => {
          const row = h('div', 'rt-row ' + (r ? 'no' : 'ok'), r ? `${d} rows <span>✗</span>` : `${d} × ${q} <span>✓</span>`);
          list.appendChild(row);
          await Promise.all([arrange(c, d), c.fadeIn(row, 300, { delay: 350 })]);
        }
      });
    }
    const nxt = top + 1;
    const pairs = []; for (let d = 1; d <= top; d++) if (n % d === 0 && d * d !== n) pairs.push([d, n / d]);
    const turn = pairs.length > 1 ? pairs[pairs.length - 1] : null;
    steps.push({
      cap: () => {
        if (factors(n).length === 2) return `Only <b>one</b> rectangle works: a single row. ${n} has exactly two factors, 1 and ${n}, so <b>${n} is prime</b>.`;
        return `Why stop at ${top} rows? With ${nxt} or more rows, each row would be <b>shorter</b> than the number of rows — so any rectangle that works is one we already have, <b>turned on its side</b>. Here are ${turn[1]} rows of ${turn[0]}: it’s just ${turn[0]} × ${turn[1]} turned.`;
      },
      run: async (c) => {
        const fs = factors(n);
        sum.innerHTML = `<div class="rt-h">Factors of ${n}</div><div class="rt-fs">${fs.join(', ')}</div><div class="muted">${plural(fs.length, 'factor')}</div>`;
        await Promise.all([turn ? arrange(c, turn[1]) : arrange(c, 1), c.fadeIn(sum, 400)]);
      }
    });
    return steps;
  }
};

/* ============ 1. The factor rainbow ============ */
const rainbow = {
  title: 'The organized list: a factor rainbow',
  height: 340,
  choices: [24, 36, 30, 48, { sep: 'Example 1 check:' }, 16, 40, 12, 28],
  intro: (n) => `List the factors of <b>${n}</b> without missing any: try 1, 2, 3, … in order. Every number that divides evenly brings its <b>partner</b> along.`,
  make(stage, n, ex) {
    const W = ex.W, F = factors(n), L = F.length, base = 214, m = Math.max(46, W * 0.06);
    const xs = F.map((_, i) => (L === 1 ? W / 2 : m + i * (W - 2 * m) / (L - 1)));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'rb-svg'); stage.appendChild(svg);
    const nums = F.map((f, i) => { const e = add(stage, h('div', 'rb-num c', fmt(f)), xs[i], base); e.style.opacity = 0; return e; });
    const eq = add(stage, h('div', 'rb-eq', `Factors of ${fmt(n)}: <span class="muted">?</span>`), 18, 12);
    const strip = add(stage, h('div', 'rb-strip', '<span class="muted">Tested:</span>'), 18, 294);
    const maxRx = (xs[L - 1] - xs[0]) / 2 || 1;
    const steps = [];
    let d = 1;
    for (; d * d <= n; d++) {
      const dd = d, ok = n % d === 0, q = n / d;
      steps.push({
        cap: ok ? (d * d === n ? `${n} ÷ ${d} = ${d}. <b>${d}</b> pairs with <b>itself</b> (${d} × ${d} = ${n}), so it goes in the middle and is only listed once.`
          : `${n} ÷ ${d} = ${q}, a whole number. So <b>${d} × ${q}</b> is a factor pair: ${d} goes on the left, ${q} on the right.`)
          : `${n} ÷ ${d} = ${decimal(q)}: not a whole number, so <b>${d} is not a factor</b>.`,
        run: async (c) => {
          eq.innerHTML = `${fmt(n)} ÷ ${dd} = <b class="${ok ? 'ok' : 'red'}">${ok ? fmt(q) : decimal(q)}</b> ${ok ? '✓' : '✗'}`;
          const chip = h('span', 'tchip ' + (ok ? 'ok' : 'no'), dd); strip.appendChild(chip);
          const jobs = [c.fadeIn(eq, 250), c.pop(chip, 300)];
          if (ok) {
            const i = F.indexOf(dd), j = F.indexOf(q);
            jobs.push(c.pop(nums[i], 420, { delay: 150 }));
            if (j !== i) jobs.push(c.pop(nums[j], 420, { delay: 350 }));
            const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            if (i === j) p.setAttribute('d', `M ${xs[i] - 13} ${base - 18} A 13 13 0 1 1 ${xs[i] + 13} ${base - 18}`);
            else { const rx = (xs[j] - xs[i]) / 2, ry = 34 + (rx / maxRx) * (base - 112); p.setAttribute('d', `M ${xs[i]} ${base - 20} A ${rx} ${ry} 0 0 1 ${xs[j]} ${base - 20}`); }
            p.setAttribute('class', 'rb-arc a' + (F.indexOf(dd) % 5)); svg.appendChild(p);
            const len = p.getTotalLength ? p.getTotalLength() || 600 : 600; p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
            jobs.push(c.anim(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], 700, { delay: 400 }));
          } else jobs.push(c.shake(eq));
          await Promise.all(jobs);
        }
      });
    }
    const stopAt = d, root = Math.sqrt(n);
    steps.push({
      cap: `Next to try is ${stopAt}, but ${stopAt} × ${stopAt} = ${stopAt * stopAt} — bigger than ${n}. We've passed <b>√${n} ≈ ${Number.isInteger(root) ? root : root.toFixed(1)}</b>, the middle of the rainbow. Every factor from here on is a partner we already have. <b>Stop.</b>`,
      run: async (c) => {
        eq.innerHTML = `${stopAt} × ${stopAt} = ${stopAt * stopAt} &gt; ${n} &nbsp;<b class="red">stop</b>`;
        const mid = L % 2 ? xs[(L - 1) / 2] : (xs[L / 2 - 1] + xs[L / 2]) / 2;
        const line = add(stage, h('div', 'rb-root'), mid, 70); line.style.height = (base - 40) + 'px';
        const lab = add(stage, h('div', 'rb-rootlab c', '√' + n + ' ≈ ' + (Number.isInteger(root) ? root : root.toFixed(1))), mid, base + 46);
        await Promise.all([c.fadeIn(eq, 250), c.anim(line, [{ opacity: 0, transform: 'scaleY(0)' }, { opacity: 1, transform: 'scaleY(1)' }], 500), c.fadeIn(lab, 400, { delay: 300 })]);
      }
    });
    steps.push({
      cap: `Read the rainbow left to right: <b>${F.join(', ')}</b>. That's <b>${plural(L, 'factor')}</b>.`,
      run: async (c) => {
        eq.innerHTML = `Factors of ${fmt(n)}: <b>${F.map(fmt).join(', ')}</b>`;
        await Promise.all([c.fadeIn(eq, 300), ...nums.map((e, i) => c.anim(e, [{ transform: 'scale(1)' }, { transform: 'scale(1.35)', color: '#0f5f5a' }, { transform: 'scale(1)', color: '#0f5f5a' }], 380, { delay: i * 120 }))]);
      }
    });
    return steps;
  }
};

/* ============ 2. Sieve of Eratosthenes ============ */
const SIEVE_C = { 2: '#3b78d8', 3: '#e0841a', 5: '#8a58c9', 7: '#d0477a' };
const sieve = {
  title: 'Find every prime up to 100 (the Sieve of Eratosthenes)',
  height: 560,
  intro: 'A Greek mathematician, Eratosthenes, found primes like this over 2000 years ago: circle a prime, then cross out its multiples, because they all have that prime as a factor.',
  make(stage, v, ex) {
    const W = ex.W, cell = Math.min(52, (W - 40) / 10), x0 = (W - cell * 10) / 2, y0 = 14, cells = [];
    for (let i = 1; i <= 100; i++) {
      const e = add(stage, h('div', 'sv', '<span>' + i + '</span>'), x0 + ((i - 1) % 10) * cell, y0 + Math.floor((i - 1) / 10) * cell);
      e.style.width = e.style.height = cell - 4 + 'px'; e.style.fontSize = cell * 0.38 + 'px'; cells[i] = e;
    }
    const cross = async (c, p) => {
      const ps = []; for (let m = p * 2; m <= 100; m += p) ps.push(m);
      for (const m of ps) {
        const e = cells[m];
        if (e.classList.contains('x')) { if (!c.fast) e.animate([{ transform: 'scale(1)' }, { transform: 'scale(.9)' }, { transform: 'scale(1)' }], 200); }
        else { e.classList.add('x'); e.style.setProperty('--xc', SIEVE_C[p]); if (!c.fast) e.animate([{ transform: 'scale(1.25)' }, { transform: 'scale(1)' }], 260); }
        await c.sleep(m < 50 ? 34 : 22);
      }
    };
    const circle = (c, p) => { cells[p].classList.add('p'); cells[p].style.setProperty('--pc', SIEVE_C[p]); return c.pop(cells[p], 360); };
    const steps = [{
      cap: '<b>1</b> has only one factor, so it is <b>neither prime nor composite</b>. Cross it out.',
      run: async (c) => { cells[1].classList.add('x', 'one'); await c.pop(cells[1], 300); }
    }];
    [[2, '<b>2</b> is prime (factors 1 and 2). Circle it, then cross out every multiple of 2 — they all have 2 as a factor. That removes <b>every other even number</b>, so 2 is the only even prime.'],
      [3, '<b>3</b> is the next number left, so it’s prime. Cross out the multiples of 3. Some (6, 12, 18 …) are already gone.'],
      [5, '<b>4</b> is gone, so the next prime is <b>5</b>. Cross out its multiples: everything ending in 5 or 0.'],
      [7, 'Next prime: <b>7</b>. Its multiples are the hardest to spot: 49, 77 and 91 are only crossed out now.']
    ].forEach(([p, cap]) => steps.push({ cap, run: async (c) => { await circle(c, p); await c.sleep(250); await cross(c, p); } }));
    steps.push({
      cap: 'The next number left is 11, but <b>11 × 11 = 121</b> is past 100. Any composite number up to 100 has a factor of 10 or less, so it’s already crossed out. <b>Everything left is prime!</b>',
      run: async (c) => {
        const left = []; for (let i = 11; i <= 100; i++) if (!cells[i].classList.contains('x')) left.push(i);
        for (const i of left) { cells[i].classList.add('p', 'late'); if (!c.fast) cells[i].animate([{ transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 300); await c.sleep(40); }
      }
    });
    steps.push({
      cap: 'There are <b>25 primes</b> below 100. The first ten are <b>2, 3, 5, 7, 11, 13, 17, 19, 23, 29</b>.',
      run: async (c) => {
        const ten = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29];
        for (const i of ten) { cells[i].classList.add('ten'); await c.pop(cells[i], 260); }
        stage.classList.add('sv-dim');
      }
    });
    return steps;
  }
};

/* ============ 2. Is it prime? ============ */
const detective = {
  title: 'Is it prime? Only test up to the square root',
  height: 410,
  choices: [119, 113, 221, { sep: 'Example 2 check:' }, 51, 59, 63, 91, 97],
  custom: [2, 9999],
  intro: (n) => `Is <b>${fmt(n)}</b> prime? We need to know if anything other than 1 and ${fmt(n)} divides into it.`,
  make(stage, n, ex) {
    const W = ex.W, root = Math.sqrt(n), test = primesUpTo(Math.floor(root)), pAll = primesUpTo(Math.max(13, Math.floor(root) + 12));
    const stopP = pAll.find((p) => p * p > n);
    add(stage, h('div', 'pd-q', `Is <b>${fmt(n)}</b> prime?`), 20, 14);
    const chips = add(stage, h('div', 'pd-chips'), 20, 74); chips.style.width = (W - 40) + 'px';
    const show = pAll.filter((p) => p <= stopP).slice(0, 26);
    const chipEls = {};
    show.forEach((p) => { const e = h('span', 'pchip big', p); chips.appendChild(e); chipEls[p] = e; });
    const lt = 74 + chips.offsetHeight + 14, maxLines = Math.max(3, Math.floor((410 - lt - 8) / 37));
    const lines = add(stage, h('div', 'pd-lines'), 20, lt); lines.style.width = (W * 0.62) + 'px';
    const stamp = add(stage, h('div', 'pd-stamp'), W - 30, Math.max(150, lt + 10)); stamp.style.opacity = 0;
    const steps = [];
    const rs = Number.isInteger(root) ? String(root) : root.toFixed(2);
    steps.push({
      cap: test.length ? `<b>√${fmt(n)} ≈ ${rs}.</b> If ${fmt(n)} = a × b, the smaller factor can’t be bigger than ${rs} (two numbers bigger than ${rs} multiply to more than ${fmt(n)}). So we only test the primes <b>${test.join(', ')}</b>.`
        : `√${n} ≈ ${rs}, which is less than 2 — there are no primes to test.`,
      run: async (c) => {
        const jobs = [];
        show.forEach((p, i) => { if (p <= root) chipEls[p].classList.add('on'); else chipEls[p].classList.add('off'); jobs.push(c.anim(chipEls[p], [{ transform: 'scale(1)' }, { transform: p <= root ? 'scale(1.15)' : 'scale(.9)' }, { transform: 'scale(1)' }], 400, { delay: i * 40 })); });
        const lab = h('div', 'pd-line muted', `${stopP} × ${stopP} = ${stopP * stopP} &gt; ${fmt(n)}, so ${stopP} and bigger are too big.`); lines.appendChild(lab);
        jobs.push(c.fadeIn(lab, 300)); await Promise.all(jobs);
      }
    });
    let hit = null; const groups = [];
    for (const p of test) { if (n % p === 0) { hit = p; groups.push([p]); break; } groups.push([p]); }
    if (!hit && groups.length > 6) { const rest = groups.splice(5).map((g) => g[0]); groups.push(rest); }
    groups.forEach((g) => {
      const p = g[0], many = g.length > 1, ok = !many && n % p === 0, q = n / p;
      steps.push({
        cap: many ? `Test ${g.join(', ')}: none of them divide evenly into ${fmt(n)}.`
          : ok ? `${fmt(n)} ÷ ${p} = <b>${fmt(q)}</b>, a whole number! So ${p} is a factor${quickReason(n, p) ? ' (' + quickReason(n, p) + ')' : ''}.`
            : `${fmt(n)} ÷ ${p} = ${decimal(q)} — not whole${quickReason(n, p) ? ' (' + quickReason(n, p) + ')' : ''}. ${p} is not a factor.`,
        run: async (c) => {
          g.forEach((x) => chipEls[x] && chipEls[x].classList.add(ok ? 'yes' : 'no'));
          const line = h('div', 'pd-line', many ? `÷ ${g.join(', ')} &nbsp;→ none are whole <b class="red">✗</b>`
            : `${fmt(n)} ÷ ${p} = <b class="${ok ? 'ok' : ''}">${ok ? fmt(q) : decimal(q)}</b> ${ok ? '<b class="ok">✓ whole</b>' : '<b class="red">✗</b>'} <span class="muted">${quickReason(n, p)}</span>`);
          lines.appendChild(line); while (lines.children.length > maxLines) lines.firstChild.remove();
          await Promise.all([c.fadeIn(line, 300, { from: 'translateX(-10px)' }), ...g.map((x) => chipEls[x] && c.pop(chipEls[x], 300))]);
        }
      });
    });
    steps.push({
      cap: hit ? `${fmt(n)} = ${hit} × ${fmt(n / hit)}. It has more than two factors, so <b>${fmt(n)} is composite</b>. (Once you find one factor, you can stop.)`
        : `No prime up to √${fmt(n)} divides ${fmt(n)}, so its only factors are 1 and ${fmt(n)}: <b>${fmt(n)} is prime</b>.`,
      run: async (c) => {
        stamp.className = 'pd-stamp ' + (hit ? 'comp' : 'prime');
        stamp.innerHTML = hit ? `COMPOSITE<small>${fmt(n)} = ${hit} × ${fmt(n / hit)}</small>` : `PRIME<small>only 1 × ${fmt(n)}</small>`;
        stamp.style.translate = '-100% 0';
        await c.anim(stamp, [{ opacity: 0, transform: 'scale(1.8) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' });
      }
    });
    return steps;
  }
};

/* ============ 3. Prime factors vs. a product of primes ============ */
const primeFilter = {
  title: 'Prime factors, then a product of primes',
  height: 330,
  choices: [18, 30, 60, 72, { sep: 'Example 3 check:' }, 44],
  intro: (n) => `Start with all the factors of <b>${n}</b>, then keep only the prime ones.`,
  make(stage, n, ex) {
    const W = ex.W, F = factors(n), P = F.filter(isPrime), PF = primeFactors(n);
    const lab = (t, y) => add(stage, h('div', 'pf-lab', t), 20, y);
    lab('Factors', 30); const row1 = add(stage, h('div', 'pf-row'), 150, 22);
    const l2 = lab('Prime factors', 128); const row2 = add(stage, h('div', 'pf-row'), 150, 120);
    const l3 = lab('Product of primes', 226); const row3 = add(stage, h('div', 'pf-eq'), 150, 220);
    [l2, l3].forEach((e) => (e.style.opacity = 0));
    const chips = F.map((f) => { const e = h('span', 'fchip', fmt(f)); row1.appendChild(e); e.style.opacity = 0; return e; });
    const repeats = PF.length > P.length;
    const steps = [
      { cap: `The factors of ${n}: <b>${F.join(', ')}</b>.`, run: (c) => Promise.all(chips.map((e, i) => c.pop(e, 320, { delay: i * 70 }))) },
      {
        cap: `Which factors are <b>prime</b>? ${P.join(' and ').replace(/ and (?=.* and )/g, ', ')} ${P.length > 1 ? 'are' : 'is'}. 1 is neither, and ${F.filter((f) => f > 1 && !isPrime(f)).join(', ')} ${F.filter((f) => f > 1 && !isPrime(f)).length > 1 ? 'are' : 'is'} composite.`,
        run: async (c) => {
          await Promise.all(F.map((f, i) => { const e = chips[i]; e.classList.add(isPrime(f) ? 'prime' : 'dim'); return c.anim(e, [{ transform: 'scale(1)' }, { transform: isPrime(f) ? 'scale(1.18)' : 'scale(.92)' }, { transform: 'scale(1)' }], 380, { delay: i * 60 }); }));
        }
      },
      {
        cap: `The <b>prime factors</b> of ${n} are <b>${P.join(' and ').replace(/ and (?=.* and )/g, ', ')}</b>. That’s a <b>list</b>, not an equation.`,
        run: async (c) => {
          const out = P.map((p) => { const e = h('span', 'fchip prime', p); row2.appendChild(e); return e; });
          await Promise.all([c.fadeIn(l2, 300), ...out.map((e, i) => c.anim(e, [{ opacity: 0, transform: 'translateY(-90px)' }, { opacity: 1, transform: 'none' }], 520, { delay: i * 120 }))]);
        }
      },
      {
        cap: repeats ? `But ${P.join(' × ')} = ${P.reduce((a, b) => a * b, 1)}, not ${n}! To <b>build</b> ${n} from primes, some primes are used more than once: <b>${n} = ${productHTML(PF)}</b>.`
          : `Here each prime is used once: <b>${n} = ${productHTML(PF)}</b>. Multiply it out to check: it makes ${n}.`,
        run: async (c) => { row3.innerHTML = `${n} = ${PF.map((p) => '<span class="pchip">' + p + '</span>').join(' × ')}`; await Promise.all([c.fadeIn(l3, 300), c.fadeIn(row3, 450)]); }
      }
    ];
    if (repeats) steps.push({
      cap: `Repeated primes are written with an <b>exponent</b>: ${n} = <b>${expHTML(PF)}</b>. Write the primes from smallest to largest.`,
      run: async (c) => { row3.innerHTML = `${n} = ${productHTML(PF)} = <b class="ok">${expHTML(PF)}</b>`; await c.fadeIn(row3, 400); }
    });
    return steps;
  }
};

/* ============ 4. Division ladder ============ */
const ladder = {
  title: 'Method 1: the division ladder',
  height: 560,
  choices: [90, 360, 2310, 1001, { sep: 'Example 4 check:' }, { v: 3432, label: '3 432' }],
  custom: [4, 99999],
  intro: (n) => `Divide <b>${fmt(n)}</b> by the <b>smallest prime</b> that goes in evenly. Write the prime on the left and the answer underneath. Repeat until you reach 1.`,
  make(stage, n, ex) {
    const W = ex.W, H = 560, rungs = [];
    let m = n, start = 2;
    while (m > 1) {
      const pr = primesUpTo(Math.floor(Math.sqrt(m))).filter((q) => q >= start);
      const p = pr.find((q) => m % q === 0) || m;
      const tries = pr.filter((q) => q < p);
      rungs.push({ m, p, q: m / p, tries, start }); start = p; m = m / p;
    }
    const R = rungs.length, rh = Math.min(54, (H - 150) / (R + 1)), fs = Math.min(30, rh * 0.62);
    const lx = Math.min(W * 0.26, 210), y0 = 22;
    const nums = [], divs = [];
    const bar = add(stage, h('div', 'ld-bar'), lx + 6, y0 + 2); bar.style.height = '0px';
    const mk = (cls, txt, x, y) => { const e = add(stage, h('div', cls, txt), x, y); e.style.fontSize = fs + 'px'; e.style.height = rh + 'px'; e.style.lineHeight = rh + 'px'; return e; };
    nums.push(mk('ld-num', fmt(n), lx + 22, y0));
    const notes = add(stage, h('div', 'ld-notes'), lx + Math.max(190, W * 0.24), y0); notes.style.width = (W - lx - Math.max(190, W * 0.24) - 20) + 'px';
    const prod = add(stage, h('div', 'ld-prod'), 20, H - 72); prod.style.width = (W - 40) + 'px';
    const steps = [];
    rungs.forEach((r, i) => {
      const fails = r.tries.length > 5 ? r.tries.slice(0, 4) : r.tries, skipped = r.tries.length > 5;
      const reason = (q) => quickReason(r.m, q) || ('= ' + decimal(r.m / q));
      const isSelf = r.p === r.m;
      steps.push({
        cap: (fails.length ? `Try the smallest primes on <b>${fmt(r.m)}</b>: ${fails.map((q) => `not ${q} (${reason(q)})`).join(', ')}${skipped ? ', …' : ''}. ` : '')
          + (isSelf ? (r.tries.length ? `No prime up to √${fmt(r.m)} works, so <b>${fmt(r.m)} is prime</b>: divide it by itself. ` : `<b>${fmt(r.m)}</b> is prime, so divide it by itself: `)
            : `<b>${r.p}</b> works${quickReason(r.m, r.p) ? ' (' + quickReason(r.m, r.p) + ')' : ''}: `)
          + `${fmt(r.m)} ÷ ${fmt(r.p)} = <b>${fmt(r.q)}</b>.`,
        run: async (c) => {
          notes.innerHTML = '';
          const ls = r.start > 2 ? [`<span class="muted">Start with the last prime used: ${r.start}</span>`] : [];
          ls.push(...fails.map((q) => `<span class="muted">${fmt(r.m)} ÷ ${q}?</span> ${reason(q)} <b class="red">✗</b>`));
          if (skipped) ls.push('<span class="muted">… no prime up to √' + fmt(r.m) + ' works</span>');
          ls.push(`<span class="muted">${fmt(r.m)} ÷ ${fmt(r.p)}?</span> ${quickReason(r.m, r.p) || (isSelf ? 'it’s prime' : '')} <b class="ok">✓</b>`);
          ls.push(`<b>${fmt(r.m)} ÷ ${fmt(r.p)} = ${fmt(r.q)}</b>`);
          const els = ls.map((t) => { const e = h('div', 'ld-note', t); notes.appendChild(e); e.style.opacity = 0; return e; });
          for (let k = 0; k < els.length; k++) await c.fadeIn(els[k], 260, { from: 'translateX(-10px)' });
          const y = y0 + i * rh, d = mk('ld-div', fmt(r.p), lx - 8, y); d.style.translate = '-100% 0'; divs.push(d);
          const qn = mk('ld-num', fmt(r.q), lx + 22, y + rh); nums.push(qn);
          await Promise.all([c.pop(d, 380), c.anim(bar, [{ height: bar.style.height }, { height: (i + 2) * rh - 4 + 'px' }], 400), c.anim(qn, [{ opacity: 0, transform: 'translateY(-' + rh + 'px)' }, { opacity: 1, transform: 'none' }], 500, { delay: 200 })]);
        }
      });
    });
    const ps = rungs.map((r) => r.p), rep = new Set(ps).size < ps.length;
    steps.push({
      cap: `The bottom number is <b>1</b>, so we’re done. The prime factors are the numbers <b>down the left side</b>: ${fmt(n)} = <b>${productHTML(ps)}</b>.`,
      run: async (c) => {
        notes.innerHTML = '';
        nums[nums.length - 1].classList.add('one');
        await c.pop(nums[nums.length - 1], 300);
        for (const d of divs) { d.classList.add('lit'); await c.anim(d, [{ transform: 'scale(1)' }, { transform: 'scale(1.3)' }, { transform: 'scale(1)' }], 260); }
        prod.innerHTML = `${fmt(n)} = ${ps.map((p) => '<span class="pchip">' + fmt(p) + '</span>').join(' × ')}`;
        await c.fadeIn(prod, 450);
      }
    });
    if (rep) steps.push({
      cap: `Group the repeated primes with exponents: <b>${fmt(n)} = ${expHTML(ps)}</b>.`,
      run: async (c) => { prod.innerHTML = `${fmt(n)} = ${productHTML(ps)} = <b class="ok">${expHTML(ps)}</b>`; await c.fadeIn(prod, 400); }
    });
    return steps;
  }
};

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { rectangles, rainbow, sieve, detective, primeFilter, ladder };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

function mountTree() {
  const host = document.getElementById('tree4'); if (!host) return;
  const wrap = host.closest('.ex');
  const tree = new FactorTree(host.querySelector('.ft-host'), { n: 90, style: 'plain', maxSlot: 96 });
  const chips = host.querySelectorAll('[data-n]');
  chips.forEach((b) => b.addEventListener('click', () => { chips.forEach((x) => x.classList.toggle('on', x === b)); tree.setN(Number(b.dataset.n)); }));
  const f = host.querySelector('form');
  f.addEventListener('submit', (e) => { e.preventDefault(); const inp = f.querySelector('input'), v = parseInt(inp.value.replace(/\D/g, ''), 10); if (v >= 4 && v <= 99999) { chips.forEach((x) => x.classList.remove('on')); inp.blur(); tree.setN(v); } else { inp.value = ''; inp.placeholder = '4–99 999'; } });
  return wrap;
}

function mountWarmup() {
  // which boxes are sealed?
  document.querySelectorAll('.seal-q [data-v]').forEach((b) => b.addEventListener('click', () => {
    const v = Number(b.dataset.v), p = isPrime(v);
    b.classList.toggle('opened'); b.classList.toggle(p ? 'is-sealed' : 'is-open', b.classList.contains('opened'));
    b.querySelector('small').innerHTML = b.classList.contains('opened') ? (p ? 'sealed' : primeFactors(v).join(' × ')) : '&nbsp;';
  }));
  const res = document.getElementById('compare');
  const done = {};
  const check = () => {
    if (done.maya && done.leo) {
      const a = done.maya.join(','), b = done.leo.join(',');
      res.innerHTML = a === b ? `<b>Same sealed boxes!</b> Maya and Leo both got <span class="ok">${done.maya.join(', ')}</span> — 360 = ${expHTML(done.maya)}` : 'Different?! Check for a box that can still open.';
      res.classList.add('show');
    } else res.classList.remove('show');
  };
  const mk = (id, name, preset) => new FactorTree(document.getElementById(id), { n: 360, style: 'gift', preset, maxSlot: 84, name, onDone: (ps) => { done[name] = ps; check(); } });
  const tm = mk('tree-maya', 'maya', [2, 180]), tl = mk('tree-leo', 'leo', [10, 36]);
  [tm, tl].forEach((t, i) => { const orig = t.reset.bind(t); t.reset = () => { done[i ? 'leo' : 'maya'] = null; orig(); check(); }; });
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

function mountPrimeList() {
  document.querySelectorAll('.blank[data-a]').forEach((b) => b.addEventListener('click', () => { b.classList.toggle('filled'); b.textContent = b.classList.contains('filled') ? b.dataset.a : ''; }));
  const all = document.querySelector('[data-fillall]');
  if (all) all.addEventListener('click', () => { document.querySelectorAll('.blank[data-a]').forEach((b, i) => setTimeout(() => { b.classList.add('filled'); b.textContent = b.dataset.a; b.animate([{ transform: 'scale(1.4)' }, { transform: 'scale(1)' }], 300); }, i * 180)); });
}

mountExplainers(); mountTree(); mountWarmup(); mountPrimeList();
