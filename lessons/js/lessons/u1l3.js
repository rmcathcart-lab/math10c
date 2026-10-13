/* Math 10C · Unit 1 · Lesson 3 — Rational Numbers, Irrational Numbers, and Decimal Patterns: explainers and widgets. */
import { h, fmt, Explainer, primeFactors } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const NS = 'http://www.w3.org/2000/svg';
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
const gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a; };
const big = (n) => (Math.abs(n) >= 10000 ? fmt(n) : String(n)); // like the booklet: 1000x, 3032 stay together; 999 999 gets a space
const tnum = (n) => big(n).replace(/[\s\u202f]/g, '\\,');
const frac = (a, d) => tex(`\\dfrac{${a}}{${d}}`);
const fc = (a, d) => ({ v: a + '/' + d, label: frac(a, d) });
const tc = (v, t) => ({ v, label: tex(t) });

/* a ÷ d one digit at a time: digits after the point, the remainder before each digit, and where the cycle starts */
function expand(a, d, max = 12) {
  const q0 = Math.floor(a / d); let r = a % d;
  const rems = [r], digits = [], seen = new Map([[r, 0]]); let loopStart = -1;
  while (r !== 0 && digits.length < max) {
    const n = r * 10; digits.push(Math.floor(n / d)); r = n % d; rems.push(r);
    if (r !== 0 && seen.has(r)) { loopStart = seen.get(r); break; }
    seen.set(r, digits.length);
  }
  return { a, d, q0, digits, rems, loopStart, terminates: r === 0, done: r === 0 || loopStart >= 0 };
}
function decTeX(e) {
  if (!e.digits.length) return String(e.q0);
  if (e.terminates) return e.q0 + '.' + e.digits.join('');
  if (e.loopStart < 0) return e.q0 + '.' + e.digits.join('') + '\\ldots';
  return e.q0 + '.' + e.digits.slice(0, e.loopStart).join('') + '\\overline{' + e.digits.slice(e.loopStart).join('') + '}';
}
function parseFrac(s) {
  const m = String(s).match(/^\s*(\d{1,3})\s*\/\s*(\d{1,2})\s*$/); if (!m) return null;
  const a = +m[1], d = +m[2]; if (d < 2 || a < 1 || a % d === 0) return null; return [a, d];
}
/* a "type your own" box next to an explainer's chips */
function addCustom(ex, placeholder, parse, hint, width = 92) {
  const chips = ex.host.querySelector('.ex-chips'); if (!chips) return;
  const f = h('form', 'ex-custom'), inp = h('input'); inp.type = 'text'; inp.placeholder = placeholder; inp.setAttribute('aria-label', 'Choose your own'); inp.style.width = width + 'px';
  inp.autocomplete = 'off'; inp.spellcheck = false;
  const go = h('button', 'chip go', 'Go'); go.type = 'submit'; f.append(inp, go);
  f.onsubmit = (e) => { e.preventDefault(); const v = parse(inp.value); if (v) { inp.blur(); ex.choose(v); } else { inp.value = ''; inp.placeholder = hint; } };
  chips.appendChild(f);
}
async function tween(c, ms, fn) { // frame-by-frame animation that respects Back / Start over
  if (c.fast) { fn(1); return; }
  const t0 = performance.now();
  for (;;) {
    await new Promise((r) => requestAnimationFrame(r)); c.check();
    const t = Math.min(1, (performance.now() - t0) / ms); fn(1 - Math.pow(1 - t, 3)); if (t >= 1) return;
  }
}

/* ============ 2. Long division: watch the remainders ============ */
const longdiv = {
  title: 'Long division, one digit at a time',
  height: 540,
  choices: [fc(1, 7), fc(5, 11), fc(3, 8), fc(2, 3), fc(7, 12), fc(1, 13), { sep: 'Starter check:' }, fc(17, 6), fc(17, 4), { sep: 'Example 1 check:' }, fc(1, 4), fc(3, 11), fc(5, 6)],
  intro: (v) => { const [a, d] = v.split('/'); return `Divide <b>${a} ÷ ${d}</b> one digit at a time. Keep an eye on the <b>remainders</b> — they decide everything.`; },
  setup(ex) { addCustom(ex, 'a/b', (s) => { const f = parseFrac(s); return f && expand(f[0], f[1], 10).done ? f.join('/') : null; }, 'e.g. 4/9'); },
  make(stage, v, ex) {
    const [a, d] = v.split('/').map(Number), e = expand(a, d, 10), W = ex.W, H = 540;
    const nd = e.digits.length, aS = String(a), k = aS.length, dS = String(d);
    const leftW = Math.round(W * 0.43), cw = nd > 7 ? 23 : 27, dotW = 7, divW = dS.length * cw;
    const total = divW + 24 + (k + nd) * cw + (nd ? dotW : 0);
    const x0 = Math.max(14, (leftW - total) / 2) + divW + 24;
    const colX = (j) => x0 + j * cw + (j >= k ? dotW : 0);
    const quotY = 24, divY = 78, rh = 34, rowY = (r) => divY + r * rh;
    const win = add(stage, h('div', 'ld3-win'), 0, 0); win.style.width = leftW + 'px'; win.style.height = H + 'px';
    const work = h('div', 'ld3-work'); win.appendChild(work);
    const put = (el, x, y) => { work.appendChild(at(el, x, y)); return el; };
    const cell = (ch, j, y, cls) => { const el = put(h('div', 'ld3-d' + (cls ? ' ' + cls : ''), ch), colX(j), y); el.style.width = cw + 'px'; return el; };
    const num = (n, j, y, cls) => String(n).split('').map((ch, i, s) => cell(ch, j - (s.length - 1 - i), y, cls));
    const under = (n, j, y) => { // the "−" and the subtraction line under a product
      const len = String(n).length, xl = colX(j - len + 1);
      const mn = put(h('div', 'ld3-minus', '−'), xl - 22, y);
      const ln = put(h('div', 'ld3-line'), xl - 6, y + rh - 2); ln.style.width = (colX(j) + cw - xl + 12) + 'px';
      return [mn, ln];
    };
    const dv = put(h('div', 'ld3-dv', dS), x0 - 24 - divW, divY); dv.style.width = divW + 'px';
    const svg = svgEl('svg', { class: 'ld3-svg' }); work.appendChild(svg);
    const endX = Math.max(colX(k + nd - 1) + cw + 8, x0 + 40);
    svg.appendChild(svgEl('path', { d: `M ${x0 - 18} ${divY + rh + 4} Q ${x0 - 4} ${divY + rh / 2} ${x0 - 18} ${divY - 4} L ${endX} ${divY - 4}`, class: 'ld3-br' }));
    const dvd = []; aS.split('').forEach((ch, j) => { dvd[j] = cell(ch, j, divY, 'dvd'); });
    if (nd) { const pt = put(h('div', 'ld3-pt', '.'), x0 + k * cw - 4, divY); pt.style.width = dotW + 8 + 'px'; for (let i = 0; i < nd; i++) dvd[k + i] = cell('0', k + i, divY, 'dvd z'); }
    const qcells = [];

    // right side: the running answer, the remainder table, the possible remainders
    const rx = leftW + 20, rw = W - rx - 18;
    const res = add(stage, h('div', 'ld3-res'), rx, 14);
    add(stage, h('div', 'ld3-th', 'Each step: divide, write the digit, keep the remainder'), rx, 74).style.width = rw + 'px';
    const rowTop = 104, trh = 33, rows = [];
    const trow = (i, html, r, cls) => {
      const el = add(stage, h('div', 'ld3-tr' + (cls ? ' ' + cls : ''), `<span class="ld3-eq">${html}</span><span class="ld3-rc">${r}</span>`), rx, rowTop + i * trh);
      el.style.width = (rw - 70) + 'px'; rows[i] = el; return el;
    };
    const loopSvg = svgEl('svg', { class: 'ld3-loop' }); stage.appendChild(loopSvg);
    const slots = [];
    if (d <= 14) {
      const sl = add(stage, h('div', 'ld3-slots', `<div class="ld3-sl-h">Possible remainders when you divide by ${d}</div>`), rx, H - 76); sl.style.width = rw + 'px';
      const row = h('div', 'ld3-sl-row'); sl.appendChild(row);
      for (let r = 0; r < d; r++) { const s = h('span', 'ld3-slot' + (r === 0 ? ' zero' : ''), r); row.appendChild(s); slots.push(s); }
    }
    const light = (c, r) => { const s = slots[r]; if (!s) return Promise.resolve(); const again = s.classList.contains('used'); s.classList.add(again ? 'again' : 'used'); return c.pop(s, 360); };
    const resText = (n) => `${a} ÷ ${d} = <b>${e.q0}${n ? '.' : ''}${e.digits.slice(0, n).map((g, i) => (i === n - 1 ? `<span class="new">${g}</span>` : g)).join('')}</b>${n ? '<span class="muted">…</span>' : ''}`;
    let scrolled = 0;
    const scrollTo = (c, bottom) => {
      const s = Math.max(0, bottom - (H - 16)); if (s === scrolled) return Promise.resolve();
      const from = scrolled; scrolled = s;
      return c.anim(work, [{ transform: `translateY(${-from}px)` }, { transform: `translateY(${-s}px)` }], 500);
    };

    const steps = [], base = e.q0 > 0 ? 2 : 0;
    steps.push({
      cap: e.q0 > 0 ? `<b>${a} ÷ ${d} = ${e.q0} R ${e.rems[0]}.</b> Write <b>${e.q0}</b> on top, subtract ${e.q0} × ${d} = ${e.q0 * d}, and keep the remainder <b>${e.rems[0]}</b>.`
        : `${d} doesn’t go into ${a}, so the answer starts with <b>0.</b> — and the remainder is <b>${a}</b>.`,
      run: async (c) => {
        const jobs = [];
        num(e.q0, k - 1, quotY, 'q').forEach((el) => jobs.push(c.pop(el, 380)));
        if (nd) { const qp = put(h('div', 'ld3-pt q', '.'), x0 + k * cw - 4, quotY); qp.style.width = dotW + 8 + 'px'; jobs.push(c.pop(qp, 300, { delay: 150 })); }
        if (e.q0 > 0) {
          num(e.q0 * d, k - 1, rowY(1), 'p').forEach((el) => jobs.push(c.fadeIn(el, 300, { delay: 200 })));
          const [mn, ln] = under(e.q0 * d, k - 1, rowY(1));
          jobs.push(c.fadeIn(mn, 300, { delay: 200 }), c.anim(ln, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 300, { delay: 400 }));
          num(e.rems[0], k - 1, rowY(2), 'r').forEach((el) => jobs.push(c.pop(el, 380, { delay: 600 })));
        } else dvd.slice(0, k).forEach((el) => el.classList.add('use'));
        res.innerHTML = resText(0);
        jobs.push(c.fadeIn(trow(0, `<span class="muted">start:</span> ${a} ÷ ${d} = <b>${e.q0}</b> R`, e.rems[0]), 300, { delay: 300 }), light(c, e.rems[0]));
        await Promise.all(jobs);
      }
    });
    e.digits.forEach((dig, i) => {
      const r = e.rems[i], n = r * 10, nr = e.rems[i + 1], col = k + i, R = base + 2 * i;
      const stop = nr === 0, again = i === nd - 1 && e.loopStart >= 0, first = i === 0 && e.q0 === 0;
      steps.push({
        cap: (first ? `Use the first 0 after the point: <b>${n} ÷ ${d} = ${dig} R ${nr}</b>. ` : `Bring down a 0 to make ${n}: <b>${n} ÷ ${d} = ${dig} R ${nr}</b>. `)
          + (stop ? 'The remainder is <b>0</b> — nothing is left to divide.' : again ? `Remainder <b class="red">${nr}</b> — we’ve had that remainder before!` : `Write <b>${dig}</b> on top; the new remainder is <b>${nr}</b>.`),
        run: async (c) => {
          dvd[col].classList.remove('z');
          if (first) { dvd[col].classList.add('use'); await c.pop(dvd[col], 300); }
          else {
            const z = cell('0', col, rowY(R), 'r bd');
            await Promise.all([scrollTo(c, rowY(R + 2) + rh), c.anim(z, [{ transform: `translateY(${divY - rowY(R)}px)`, opacity: 0.2 }, { transform: 'none', opacity: 1 }], 560)]);
          }
          const jobs = [];
          const q = cell(String(dig), col, quotY, 'q'); qcells[i] = q; jobs.push(c.pop(q, 380));
          num(dig * d, col, rowY(R + 1), 'p').forEach((el) => jobs.push(c.fadeIn(el, 300, { delay: 250 })));
          const [mn, ln] = under(dig * d, col, rowY(R + 1));
          jobs.push(c.fadeIn(mn, 300, { delay: 250 }), c.anim(ln, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 300, { delay: 450 }));
          num(nr, col, rowY(R + 2), 'r' + (stop ? ' zero' : again ? ' again' : '')).forEach((el) => jobs.push(c.pop(el, 380, { delay: 650 })));
          res.innerHTML = resText(i + 1);
          jobs.push(c.fadeIn(trow(i + 1, `${n} ÷ ${d} = <b>${dig}</b> R`, nr, stop ? 'zero' : again ? 'again' : ''), 300, { delay: 600 }), light(c, nr), scrollTo(c, rowY(R + 2) + rh));
          await Promise.all(jobs);
        }
      });
    });
    const T = tex(`\\dfrac{${a}}{${d}}=${decTeX(e)}`), Tres = tex(`\\tfrac{${a}}{${d}}=${decTeX(e)}`);
    if (e.terminates) {
      steps.push({
        cap: nd ? `Remainder 0, so the division <b>stops</b>: ${T}. It’s <b>terminating</b> (and non-repeating).` : `${a} ÷ ${d} comes out even: ${T}.`,
        run: async (c) => {
          res.innerHTML = `${Tres} <span class="ld3-tag ok">terminates</span>`;
          await Promise.all([c.fadeIn(res, 350), ...(rows[nd] ? [c.pop(rows[nd].querySelector('.ld3-rc'), 400)] : [])]);
        }
      });
    } else {
      const j = e.loopStart, chain = e.rems.slice(j).join(' → '), blk = e.digits.slice(j).join('');
      steps.push({
        cap: `Remainders ${chain}: a remainder came back, so the division repeats from there and the digits <b>${blk}</b> go round forever. ${T} — <b>repeating</b>, <b>non-terminating</b>.`,
        run: async (c) => {
          const jobs = [];
          const chip = (i) => rows[i].querySelector('.ld3-rc'), cxR = (i) => rows[i].offsetLeft + chip(i).offsetLeft + chip(i).offsetWidth + 4, cy = (i) => rows[i].offsetTop + rows[i].offsetHeight / 2;
          const x1 = cxR(nd), y1 = cy(nd), y2 = cy(j), bulge = Math.min(54, 26 + (nd - j) * 5);
          const p = svgEl('path', { d: `M ${x1} ${y1} C ${x1 + bulge} ${y1}, ${x1 + bulge} ${y2}, ${x1 + 2} ${y2}`, class: 'ld3-arc' });
          const head = svgEl('path', { d: `M ${x1 + 2} ${y2} l 10 -6 l -1 12 z`, class: 'ld3-head' });
          loopSvg.append(p, head);
          const len = p.getTotalLength ? p.getTotalLength() || 300 : 300; p.style.strokeDasharray = len; p.style.strokeDashoffset = len; head.style.opacity = 0;
          jobs.push(c.anim(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], 700), c.anim(head, [{ opacity: 0 }, { opacity: 1 }], 200, { delay: 650 }));
          rows[j].classList.add('again');
          for (let i = j + 1; i <= nd; i++) rows[i].classList.add('cyc');
          rows[j].classList.add('cyc');
          for (let i = j; i < nd; i++) qcells[i].classList.add('blk');
          const bar = put(h('div', 'ld3-bar'), colX(k + j) + 3, quotY - 3); bar.style.width = (colX(k + nd - 1) + cw - colX(k + j) - 6) + 'px';
          jobs.push(c.anim(bar, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 450, { delay: 500 }));
          res.innerHTML = `${Tres} <span class="ld3-tag rep">repeats</span>`;
          jobs.push(c.fadeIn(res, 350, { delay: 700 }));
          await Promise.all(jobs);
        }
      });
    }
    steps.push({
      cap: `Why must this happen? Dividing by ${d} leaves only <b>${d} possible remainders</b> (0 to ${d - 1}). Either we hit <b>0</b> and it stops${e.terminates ? ' (like here)' : ''}, or a remainder <b>comes back</b> and it repeats${e.terminates ? '' : ' (like here)'}. So every fraction <b>terminates or repeats</b>.`,
      run: async (c) => {
        if (!slots.length) return;
        slots.forEach((s) => s.classList.add('show'));
        await Promise.all(slots.map((s, i) => c.anim(s, [{ transform: 'scale(1)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], 360, { delay: i * 60 })));
      }
    });
    return steps;
  }
};

/* ============ 3. Will it terminate? Factor the denominator ============ */
const denoms = {
  title: 'Will it terminate? Look at the denominator',
  height: 400,
  choices: [fc(3, 8), fc(7, 20), fc(9, 15), fc(7, 12), fc(2, 7), fc(13, 40), { sep: 'Starter check:' }, fc(17, 6), fc(17, 4), { sep: 'Example 1 check:' }, fc(1, 4), fc(3, 11), fc(5, 6), { sep: 'Example 2 check:' }, fc(19, 8)],
  intro: (v) => { const [a, d] = v.split('/'); return `Will ${frac(a, d)} terminate or repeat? We don’t even have to divide — the answer is hiding in the <b>denominator</b>.`; },
  setup(ex) { addCustom(ex, 'a/b', (s) => { const f = parseFrac(s); return f ? f.join('/') : null; }, 'e.g. 7/40'); },
  make(stage, v, ex) {
    const [a0, d0] = v.split('/').map(Number), g = gcd(a0, d0), a = a0 / g, d = d0 / g, P = primeFactors(d);
    const bad = [...new Set(P.filter((p) => p !== 2 && p !== 5))], ok = !bad.length, W = ex.W;
    const n2 = P.filter((p) => p === 2).length, n5 = P.filter((p) => p === 5).length, kk = Math.max(n2, n5);
    const M = [...Array(kk - n2).fill(2), ...Array(kk - n5).fill(5)], mult = M.reduce((x, y) => x * y, 1);
    const top = a * mult, pw = 10 ** kk, decStr = ok ? (top / pw).toFixed(kk) : '';
    const e = expand(a, d, 30), gone = [...new Set(primeFactors(d0))].filter((q) => q !== 2 && q !== 5 && !P.includes(q));
    const fr = add(stage, h('div', 'dn-frac'), 36, 24); fr.innerHTML = tex(`\\dfrac{${a0}}{${d0}}`);
    const lab = add(stage, h('div', 'dn-lab'), 36, 160); lab.innerHTML = 'Denominator'; lab.style.opacity = 0;
    const row = add(stage, h('div', 'dn-row'), 196, 148);
    const out = add(stage, h('div', 'dn-out'), 36, 256); out.style.width = (W - 72) + 'px';
    const stamp = add(stage, h('div', 'pd-stamp ' + (ok ? 'prime' : 'comp')), W - 36, 30); stamp.style.opacity = 0; stamp.style.translate = '-100% 0';
    stamp.innerHTML = ok ? 'TERMINATES<small>only 2s and 5s</small>' : `REPEATS<small>has a factor of ${bad.join(' and ')}</small>`;
    const steps = [];
    steps.push({
      cap: g > 1 ? `First, <b>lowest terms</b>: divide top and bottom by ${g}, so ${frac(a0, d0)} = ${frac(a, d)}. ` + (gone.length ? `The <b>${gone.join(' and ')}</b> in ${d0} cancels out — always simplify first!` : 'Always simplify first.')
        : `${frac(a, d)} is already in <b>lowest terms</b> — the top and bottom share no common factor.`,
      run: async (c) => { if (g > 1) { fr.innerHTML = tex(`\\dfrac{${a0}}{${d0}}=\\dfrac{${a0}\\div${g}}{${d0}\\div${g}}=\\dfrac{${a}}{${d}}`); await c.fadeIn(fr, 400); } else await c.pop(fr, 400); }
    });
    steps.push({
      cap: `Prime-factor the denominator: <b>${d} = ${P.join(' × ')}</b>. ${ok ? 'Every prime is a <b>2</b> or a <b>5</b>.' : `There’s a <b class="red">${bad.join('</b> and a <b class="red">')}</b> in there.`}`,
      run: async (c) => {
        row.innerHTML = `<span class="dn-d">${d} =</span>` + P.map((p, i) => (i ? '<span class="dn-x">×</span>' : '') + `<span class="dn-p ${p === 2 || p === 5 ? 'good' : 'bad'}">${p}</span>`).join('');
        await Promise.all([c.fadeIn(lab, 300), c.fadeIn(row.querySelector('.dn-d'), 300), ...[...row.querySelectorAll('.dn-p')].map((el, i) => c.pop(el, 380, { delay: 150 + i * 150 }))]);
      }
    });
    if (ok) {
      steps.push({
        cap: mult === 1 ? `The denominator is already a <b>power of 10</b> (${tnum(pw)}), so the decimal just stops.`
          : `Give every 2 a 5 (and every 5 a 2) to build a <b>power of 10</b>: multiply top and bottom by ${M.join(' × ')} = ${mult}.`,
        run: async (c) => {
          out.innerHTML = tex(mult === 1 ? `\\dfrac{${a}}{${tnum(pw)}}` : `\\dfrac{${a}}{${P.join('\\times ')}}\\times\\dfrac{\\color{#13807a}${M.join('\\times ')}}{\\color{#13807a}${M.join('\\times ')}}=\\dfrac{${tnum(top)}}{${tnum(pw)}}`);
          await c.fadeIn(out, 450);
        }
      });
      steps.push({
        cap: `${big(top)} ${pw === 10 ? 'tenths' : pw === 100 ? 'hundredths' : pw === 1000 ? 'thousandths' : pw === 10000 ? 'ten-thousandths' : 'over ' + big(pw)} is <b>${decStr}</b>. A denominator built only from 2s and 5s always becomes a power of 10, so the decimal <b>terminates</b>.`,
        run: async (c) => {
          out.innerHTML = tex(mult === 1 ? `\\dfrac{${a}}{${tnum(pw)}}=${decStr}` : `\\dfrac{${a}}{${P.join('\\times ')}}\\times\\dfrac{\\color{#13807a}${M.join('\\times ')}}{\\color{#13807a}${M.join('\\times ')}}=\\dfrac{${tnum(top)}}{${tnum(pw)}}=\\mathbf{${decStr}}`);
          await Promise.all([c.fadeIn(out, 300), c.anim(stamp, [{ opacity: 0, transform: 'scale(1.8) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' })]);
        }
      });
    } else {
      steps.push({
        cap: `10, 100, 1000, … are built <b>only</b> from 2s and 5s. None of them is a multiple of ${bad.join(' or ')}, so we can never turn ${frac(a, d)} into tenths, hundredths, thousandths… The division <b>never comes out even</b>.`,
        run: async (c) => {
          out.innerHTML = '<div class="dn-pows">' + tex('10=2\\times5\\qquad 100=2^2\\times5^2\\qquad 1000=2^3\\times5^3\\qquad\\ldots') + `</div><div class="dn-never">no factor of ${bad.join(' or ')} — ever</div>`;
          await c.fadeIn(out, 450);
        }
      });
      steps.push({
        cap: `So ${frac(a, d)} goes on forever — and, like every fraction, it <b>repeats</b>: ${tex(`\\dfrac{${a}}{${d}}=${decTeX(e)}`)}. Repeating, non-terminating, and still <b>rational</b>.`,
        run: async (c) => {
          out.innerHTML = '<div class="dn-pows">' + tex(`\\dfrac{${a}}{${d}}=${decTeX(e)}`) + '</div>';
          await Promise.all([c.fadeIn(out, 300), c.anim(stamp, [{ opacity: 0, transform: 'scale(1.8) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-6deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' })]);
        }
      });
    }
    return steps;
  }
};

/* ============ 3. Does it repeat? Wrap the digits into rows and look for stripes ============ */
const IRR = {
  sqrt2: '4142135623730950488016887242096980785696718753769480731766797379907324784621070388503875',
  sqrt3: '7320508075688772935274463415058723669428052538103806280558069794519330169088000370811461',
  pi: '1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348',
  sqrt7: '6457513110645905905016157536392604257102591830824501803683344592010688232302836277603928',
  sqrt12: '4641016151377545870548926830117447338856105076207612561116139589038660338176000741622923'
};
const growing = (() => { let s = ''; for (let n = 1; s.length < 90; n++) s += '1'.repeat(n) + '2'; return s; })();
const STR = {
  sqrt3: { t: '\\sqrt{3}', head: '1.', digits: IRR.sqrt3, kind: 'irr' },
  pi: { t: '\\pi', head: '3.', digits: IRR.pi, kind: 'irr', note: 'Computers have found <b>trillions</b> of digits of π — no repeating block, ever.' },
  sqrt2: { t: '\\sqrt{2}', head: '1.', digits: IRR.sqrt2, kind: 'irr' },
  sqrt12: { t: '\\sqrt{12}', head: '3.', digits: IRR.sqrt12, kind: 'irr' },
  r311: { t: '\\dfrac{3}{11}', head: '0.', digits: '27'.repeat(45), kind: 'rat', block: '27', eq: '\\dfrac{3}{11}=0.\\overline{27}' },
  sqrt7: { t: '\\sqrt{7}', head: '2.', digits: IRR.sqrt7, kind: 'irr' },
  r512: { t: '1.512\\,512\\ldots', head: '1.', digits: '512'.repeat(30), kind: 'rat', block: '512', eq: '1.\\overline{512}=\\dfrac{1511}{999}' },
  grow: { t: '-7.12\\,112\\,1112\\ldots', head: '−7.', digits: growing, kind: 'grow' }
};
const stripes = {
  title: 'Stripes mean a repeating block',
  height: 470,
  choices: [tc('sqrt3', '\\sqrt{3}'), tc('pi', '\\pi'), tc('sqrt2', '\\sqrt{2}'), { sep: 'Example 1 check:' }, tc('r311', '\\dfrac{3}{11}'), tc('sqrt12', '\\sqrt{12}'), { sep: 'Example 2 check:' }, tc('sqrt7', '\\sqrt{7}'), tc('r512', '1.512\\,512\\ldots'), tc('grow', '-7.12\\,112\\,1112\\ldots')],
  intro: (v) => `On the left, ${frac(1, 7)} (we know it repeats). On the right, ${tex(STR[v].t)}. Does it ever repeat? Let’s look at the digits after the decimal point.`,
  make(stage, v, ex) {
    const W = ex.W, cs = 34, G = 8, ROWS = 8, R = STR[v];
    const L = { t: '\\dfrac{1}{7}', head: '0.', digits: '142857'.repeat(12), kind: 'rat', block: '142857' };
    const striped = (src, w) => { for (let c0 = 0; c0 < w; c0++) for (let r = 1; r < ROWS; r++) if (src.digits[c0 + r * w] !== src.digits[c0]) return false; return true; };
    const grids = [L, R].map((src, gi) => {
      const cx = gi ? W * 0.75 : W * 0.25, gx0 = cx - (G * cs) / 2, gy0 = 76;
      add(stage, h('div', 'st-lab c', tex(src.t.includes('ldots') ? src.t : `${src.t}=${src.head}${src.digits.slice(0, 6)}\\ldots`)), cx, 38);
      const frame = add(stage, h('div', 'st-frame'), gx0 - 7, gy0 - 7); frame.style.width = G * cs + 14 + 'px'; frame.style.height = ROWS * cs + 14 + 'px';
      const cells = [];
      for (let i = 0; i < G * ROWS; i++) { const dg = src.digits[i]; const el = add(stage, h('div', 'st-c d' + dg, dg), gx0 + (i % G) * cs, gy0 + Math.floor(i / G) * cs); el.style.opacity = 0; cells.push(el); }
      const tags = add(stage, h('div', 'st-tags'), gx0 - 7, gy0 + ROWS * cs + 14); tags.style.width = G * cs + 14 + 'px';
      const tagEls = []; for (let w = 1; w <= G; w++) { const t = h('span', 'st-tag', w); tags.appendChild(t); tagEls.push(t); }
      return { src, cells, frame, tagEls, gx0, gy0, w: G };
    });
    const wl = add(stage, h('div', 'st-w c', 'rows of<b>8</b>'), W / 2, 200);
    const pos = (g, i, w) => [g.gx0 + ((G - w) * cs) / 2 + (i % w) * cs, g.gy0 + Math.floor(i / w) * cs];
    const wrap = (c, w, ms = 420) => {
      wl.innerHTML = `rows of<b>${w}</b>`;
      const jobs = [];
      grids.forEach((g) => {
        g.w = w; const ok = striped(g.src, w);
        g.frame.classList.toggle('ok', ok);
        g.cells.forEach((el, i) => {
          const vis = i < w * ROWS, [x, y] = vis ? pos(g, i, w) : [parseFloat(el.style.left), parseFloat(el.style.top)];
          jobs.push(c.anim(el, [{ left: el.style.left, top: el.style.top, opacity: el.style.opacity }, { left: x + 'px', top: y + 'px', opacity: vis ? '1' : '0' }], ms));
        });
      });
      return Promise.all(jobs);
    };
    const mark = (w) => grids.forEach((g) => { const t = g.tagEls[w - 1]; t.classList.remove('yes', 'no', 'cur'); t.classList.add(striped(g.src, w) ? 'yes' : 'no'); });
    const target = R.kind === 'rat' ? R.block.length : 6;
    const steps = [
      {
        cap: 'Here are the first 64 digits after each decimal point, in rows of 8. Every digit has its <b>own colour</b>.',
        run: async (c) => { await Promise.all(grids.flatMap((g) => g.cells.map((el, i) => c.anim(el, [{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'scale(1)' }], 300, { delay: i * 7 })))); grids.forEach((g) => g.frame.classList.toggle('ok', striped(g.src, G))); }
      },
      {
        cap: 'Now rewrap the digits in rows of 1, 2, 3, … 8. When the row length fits a <b>repeating block</b>, every column becomes one colour: <b>stripes</b>.',
        run: async (c) => {
          for (let w = 1; w <= G; w++) { grids.forEach((g) => g.tagEls[w - 1].classList.add('cur')); await wrap(c, w, 380); mark(w); await c.sleep(w === G ? 200 : 520); }
        }
      },
      {
        cap: R.kind === 'rat' ? `Rows of ${target}: ${tex(R.t)} makes perfect stripes — its block <b>${R.block}</b> repeats${target === 6 ? ', just like 142857 on the left' : ''}.`
          : `Rows of 6: ${frac(1, 7)} makes perfect stripes (its block is <b>142857</b>). ${tex(R.t)} is still confetti${R.kind === 'grow' ? ' — its groups keep getting longer' : ''}.`,
        run: async (c) => { await wrap(c, target, 500); for (let w = 1; w <= G; w++) mark(w); }
      },
      {
        cap: R.kind === 'rat' ? `${tex(R.eq)}: a repeating block means a fraction, so it’s <b>rational</b>.`
          : R.kind === 'grow' ? `${tex(R.t)} has a <b>pattern</b>, but the runs of 1s keep growing, so no block ever repeats. Non-terminating, non-repeating: <b>irrational</b>.`
            : `${tex(R.t)} never lines up, at any row length — not 8, not 100, not a million. ${R.note || 'Its digits never settle into a repeating block.'} Non-terminating, non-repeating: <b>irrational</b>.`,
        run: async (c) => {
          const st = add(stage, h('div', 'pd-stamp st-stamp ' + (R.kind === 'rat' ? 'prime' : 'comp'), R.kind === 'rat' ? 'RATIONAL' : 'IRRATIONAL'), W / 2, 424);
          st.style.translate = '-50% -50%';
          await c.anim(st, [{ opacity: 0, transform: 'scale(1.8) rotate(-14deg)' }, { opacity: 1, transform: 'scale(1) rotate(-8deg)' }], 420, { easing: 'cubic-bezier(.2,1.4,.4,1)' });
        }
      }
    ];
    return steps;
  }
};

/* ============ 3. Rational or irrational? A decision flowchart ============ */
const FLOW = {
  pi: { t: '\\pi', kind: 'pi', cat: 'π is a <b>special number</b>: its digits 3.14159… go on forever with no repeating block.', res: '\\pi=3.14159\\ldots', v: 'π is <b>irrational</b>: non-terminating and non-repeating. (3.14 and 22/7 are only approximations.)' },
  r311: { t: '\\dfrac{3}{11}', kind: 'frac', cat: `It’s a <b>fraction of two integers</b> — that’s exactly what rational means.`, res: '\\tfrac{3}{11}=0.\\overline{27}', v: `<b>Rational.</b> (As a decimal it repeats: ${tex('0.\\overline{27}')}.)` },
  sqrt12: { t: '\\sqrt{12}', kind: 'root', cat: 'It’s a <b>square root</b>. Is the number inside a perfect square?', q: '9 &lt; 12 &lt; 16, so 12 is <b>not</b> a perfect square.', yes: false, res: '\\sqrt{12}=3.4641016\\ldots', v: '<b>Irrational</b>: it never ends and never repeats.' },
  r025: { t: '\\sqrt{0.25}', kind: 'root', cat: 'It’s a <b>square root</b>. Is the number inside a perfect square?', q: '0.5 × 0.5 = 0.25 — <b>yes</b>, 0.25 is a perfect square.', yes: true, res: '\\sqrt{0.25}=0.5=\\tfrac12', v: '<b>Rational</b>: it’s exactly 0.5.' },
  d068: { t: '0.68', kind: 'dec', cat: 'It’s a <b>decimal</b>. Does it terminate or repeat?', q: '0.68 <b>terminates</b> — it stops after two digits.', yes: true, res: '0.68=\\tfrac{68}{100}=\\tfrac{17}{25}', v: '<b>Rational</b>: every terminating decimal is a fraction — 68 hundredths.' },
  d2375: { t: '2.375', kind: 'dec', cat: 'It’s a <b>decimal</b>. Does it terminate or repeat?', q: '2.375 <b>terminates</b>.', yes: true, res: '2.375=\\tfrac{2375}{1000}=\\tfrac{19}{8}', v: '<b>Rational</b>: 2375 thousandths simplifies to 19/8. On the calculator, F◂▸D gives <b>19┘8</b>.' },
  sqrt7: { t: '\\sqrt{7}', kind: 'root', cat: 'It’s a <b>square root</b>. Is the number inside a perfect square?', q: '4 &lt; 7 &lt; 9, so 7 is <b>not</b> a perfect square.', yes: false, res: '\\sqrt7=2.6457513\\ldots', v: '<b>Irrational.</b> The calculator shows 2.645751311, but the digits keep going without repeating.' },
  d512: { t: '1.512\\,512\\,512\\ldots', kind: 'dec', cat: 'It’s a <b>decimal</b>. Does it terminate or repeat?', q: 'The block 512 <b>repeats</b> forever.', yes: true, res: '1.\\overline{512}=\\tfrac{1511}{999}', v: '<b>Rational</b>: every repeating decimal can be written as a fraction. F◂▸D gives <b>1511┘999</b>.' },
  nsq121: { t: '-\\sqrt{121}', kind: 'root', cat: 'It’s a <b>square root</b> (the minus sign just comes along for the ride). Is 121 a perfect square?', q: '11 × 11 = 121 — <b>yes</b>.', yes: true, res: '-\\sqrt{121}=-11=-\\tfrac{11}{1}', v: '<b>Rational</b>: it’s the integer −11.' },
  sq289: { t: '\\sqrt{2.89}', kind: 'root', cat: 'It’s a <b>square root</b>. Is 2.89 a perfect square?', q: '1.7 × 1.7 = 2.89 — <b>yes</b>.', yes: true, res: '\\sqrt{2.89}=1.7=\\tfrac{17}{10}', v: '<b>Rational</b>: it’s exactly 1.7.' },
  grow: { t: '-7.12\\,112\\,1112\\ldots', kind: 'dec', cat: 'It’s a <b>decimal</b>. Does it terminate or repeat?', q: '12, 112, 1112, … the runs of 1s keep <b>growing</b>: it never stops, and no block repeats.', yes: false, res: '-7.12\\,112\\,1112\\,11112\\ldots', v: '<b>Irrational.</b> A pattern isn’t the same as a repeating block.' }
};
const flow = {
  title: 'Follow the arrows',
  height: 430,
  choices: [tc('pi', '\\pi'), tc('r311', '\\dfrac{3}{11}'), tc('sqrt12', '\\sqrt{12}'), tc('r025', '\\sqrt{0.25}'), tc('d068', '0.68'), { sep: 'Example 2 check:' }, tc('d2375', '2.375'), tc('sqrt7', '\\sqrt{7}'), tc('d512', '1.512\\,512\\ldots'), tc('nsq121', '-\\sqrt{121}'), tc('sq289', '\\sqrt{2.89}'), tc('grow', '-7.12\\,112\\ldots')],
  intro: (v) => `Is ${tex(FLOW[v].t)} rational or irrational? Start at the top and answer one question at a time.`,
  make(stage, v, ex) {
    const W = ex.W, F = FLOW[v]; stage.classList.remove('fl-active');
    const svg = svgEl('svg', { class: 'fl-svg' }); stage.appendChild(svg);
    const N = {}, E = {};
    const node = (id, x, y, html, cls) => { N[id] = add(stage, h('div', 'fl-n c ' + (cls || ''), html), x, y); N[id]._x = x; N[id]._y = y; return N[id]; };
    node('start', W * 0.5, 42, `What kind of number is <span class="fl-t">${tex(F.t.replace('dfrac', 'tfrac'))}</span>?`, 'start');
    node('frac', W * 0.12, 128, 'A fraction of integers', 'cat');
    node('root', W * 0.36, 128, 'A square root', 'cat');
    node('dec', W * 0.645, 128, 'A decimal', 'cat');
    node('pi', W * 0.885, 128, 'π (a special number)', 'cat');
    node('rootQ', W * 0.36, 222, 'Perfect square inside?', 'q');
    node('decQ', W * 0.645, 222, 'Terminates or repeats?', 'q');
    node('fracL', W * 0.12, 318, 'Rational', 'leaf rat');
    node('rootY', W * 0.285, 318, 'Rational', 'leaf rat');
    node('rootN', W * 0.43, 318, 'Irrational', 'leaf irr');
    node('decY', W * 0.575, 318, 'Rational', 'leaf rat');
    node('decN', W * 0.72, 318, 'Irrational', 'leaf irr');
    node('piL', W * 0.885, 318, 'Irrational', 'leaf irr');
    const hh = (id) => N[id].offsetHeight / 2;
    const edge = (a, b, label) => {
      const x1 = N[a]._x, y1 = N[a]._y + hh(a), x2 = N[b]._x, y2 = N[b]._y - hh(b);
      const ln = svgEl('line', { x1, y1, x2, y2, class: 'fl-e' }); svg.appendChild(ln); E[a + '-' + b] = ln;
      if (label) { const t = add(stage, h('div', 'fl-el c', label), x1 + (x2 - x1) * 0.55, y1 + (y2 - y1) * 0.55); ln._lab = t; }
    };
    ['frac', 'root', 'dec', 'pi'].forEach((id) => edge('start', id));
    edge('frac', 'fracL'); edge('root', 'rootQ'); edge('dec', 'decQ'); edge('pi', 'piL');
    edge('rootQ', 'rootY', 'yes'); edge('rootQ', 'rootN', 'no'); edge('decQ', 'decY', 'yes'); edge('decQ', 'decN', 'neither');
    const resEl = add(stage, h('div', 'fl-res c'), W / 2, 392); resEl.style.opacity = 0;
    const on = (c, ids, eds) => {
      stage.classList.add('fl-active');
      eds.forEach((k) => { E[k].classList.add('on'); if (E[k]._lab) E[k]._lab.classList.add('on'); });
      return Promise.all(ids.map((id) => { N[id].classList.add('on'); return c.pop(N[id], 380); }));
    };
    const cat = F.kind, leaf = cat === 'frac' ? 'fracL' : cat === 'pi' ? 'piL' : cat === 'root' ? (F.yes ? 'rootY' : 'rootN') : (F.yes ? 'decY' : 'decN');
    const qn = cat === 'root' ? 'rootQ' : cat === 'dec' ? 'decQ' : null;
    const steps = [{ cap: F.cat, run: (c) => on(c, ['start', cat], ['start-' + cat]) }];
    if (qn) steps.push({ cap: F.q, run: (c) => on(c, [qn], [cat + '-' + qn]) });
    steps.push({
      cap: F.v,
      run: async (c) => {
        resEl.innerHTML = tex(F.res);
        await Promise.all([on(c, [leaf], [(qn || cat) + '-' + leaf]), c.fadeIn(resEl, 400, { delay: 200 })]);
      }
    });
    return steps;
  }
};

/* ============ 3. Ordering irrationals: squeeze, estimate, zoom in ============ */
const NLSETS = {
  A: [{ t: '\\sqrt{5}', n: 5 }, { t: '\\sqrt{30}', n: 30 }, { t: '\\sqrt{0.5}', n: 0.5 }, { t: '2\\sqrt{3}', c: 2, n: 3 }, { t: '\\sqrt{65}', n: 65 }],
  B: [{ t: '\\sqrt{40}', n: 40 }, { t: '\\sqrt{0.8}', n: 0.8 }, { t: '4\\sqrt{2}', c: 4, n: 2 }, { t: '\\sqrt{13}', n: 13 }, { t: '\\sqrt{99}', n: 99 }],
  ex3: [{ t: '\\sqrt{19}', n: 19 }, { t: '\\pi', pi: true }, { t: '\\sqrt{90}', n: 90 }, { t: '3\\sqrt{8}', c: 3, n: 8 }, { t: '\\sqrt{0.3}', n: 0.3 }]
};
const LET = 'abcde';
const nval = (o) => (o.pi ? Math.PI : (o.c || 1) * Math.sqrt(o.n));
function squeeze(n) { // perfect squares either side
  if (n >= 1) { const lo = Math.floor(Math.sqrt(n)); return { lo, hi: lo + 1, slo: lo * lo, shi: (lo + 1) * (lo + 1) }; }
  const lo = Math.floor(Math.sqrt(n) * 10) / 10, hi = Math.round((lo + 0.1) * 10) / 10;
  return { lo, hi, slo: +(lo * lo).toFixed(2), shi: +(hi * hi).toFixed(2) };
}
const numline = {
  title: 'Squeeze, estimate, place',
  height: 410,
  choices: [{ v: 'A', label: tex('\\sqrt5,\\ \\sqrt{30},\\ \\ldots') }, { v: 'B', label: tex('\\sqrt{40},\\ \\sqrt{0.8},\\ \\ldots') }, { sep: 'Example 3 check:' }, { v: 'ex3', label: tex('\\sqrt{19},\\ \\pi,\\ \\sqrt{90},\\ 3\\sqrt8,\\ \\sqrt{0.3}') }],
  intro: (v) => `Place ${NLSETS[v].map((o) => tex(o.t)).join(', ')} on the number line. For each one: <b>squeeze</b> it between perfect squares, <b>estimate</b>, then zoom in and <b>place</b> it.`,
  make(stage, v, ex) {
    const W = ex.W, S = NLSETS[v], y0 = 196, mL = 50, unit = (W - 2 * mL) / 10, X = (x) => mL + x * unit;
    const svg = svgEl('svg', { class: 'nl-svg' }); stage.appendChild(svg);
    svg.appendChild(svgEl('line', { x1: mL - 20, y1: y0, x2: W - 22, y2: y0, class: 'nl-axis' }));
    svg.appendChild(svgEl('path', { d: `M ${W - 22} ${y0} l -12 -7 v 14 z`, class: 'nl-arrow' }));
    for (let i = 0; i <= 10; i++) { svg.appendChild(svgEl('line', { x1: X(i), y1: y0 - 9, x2: X(i), y2: y0 + 9, class: 'nl-tick' })); add(stage, h('div', 'nl-int c', i), X(i), y0 + 24); }
    const est = add(stage, h('div', 'nl-est'), 22, 14); est.style.width = (W - 44) + 'px';
    const zy = 330, zx0 = 110, zx1 = W - 110;
    let mag = null;
    const placed = [];
    const steps = [];
    S.forEach((o, idx) => {
      const val = nval(o), lo = val < 1 ? 0 : Math.floor(val), Z = (x) => zx0 + (x - lo) * (zx1 - zx0);
      let why, cap;
      if (o.pi) { why = tex('\\pi=3.14159\\ldots'); cap = `<b>(${LET[idx]})</b> ${tex('\\pi')} is irrational too: 3.14159…, just past 3.`; }
      else {
        const sq = squeeze(o.n), inner = Math.sqrt(o.n);
        const sqT = `${sq.slo}<${o.n}<${sq.shi}\\ \\Rightarrow\\ ${sq.lo}<\\sqrt{${o.n}}<${sq.hi}`;
        if (o.c) {
          why = tex(`${sqT}\\qquad ${o.t}=${o.c}\\times\\sqrt{${o.n}}\\approx${o.c}\\times${inner.toFixed(3)}\\ldots\\approx${val.toFixed(2)}`);
          cap = `<b>(${LET[idx]})</b> ${tex(o.t)} means ${o.c} × ${tex(`\\sqrt{${o.n}}`)}. Squeeze: ${tex(`\\sqrt{${o.n}}`)} is between ${sq.lo} and ${sq.hi} (about ${inner.toFixed(3)}…), so ${tex(o.t)} ≈ ${o.c} × ${inner.toFixed(3)}… ≈ <b>${val.toFixed(2)}</b>.`;
        } else {
          const closer = o.n - sq.slo < sq.shi - o.n ? [sq.slo, sq.lo] : [sq.shi, sq.hi];
          why = tex(`${sqT}\\qquad ${o.t}\\approx${val.toFixed(2)}`);
          cap = `<b>(${LET[idx]})</b> ${tex(o.t)}: ${sq.slo} &lt; ${o.n} &lt; ${sq.shi}, so it’s between <b>${sq.lo}</b> and <b>${sq.hi}</b>. ${o.n} is closer to ${closer[0]}, so it’s closer to ${closer[1]}. Calculator: ≈ <b>${val.toFixed(2)}</b>.`;
        }
      }
      steps.push({
        cap,
        run: async (c) => {
          est.innerHTML = `<b>(${LET[idx]})</b> ${why}`;
          const jobs = [c.fadeIn(est, 300)];
          if (mag) { const old = mag; jobs.push(c.anim(old, [{ opacity: 1 }, { opacity: 0 }], 250).then(() => old.remove())); }
          await Promise.all(jobs);
          mag = add(stage, h('div', 'nl-mag'), 0, 0);
          const ms = svgEl('svg', { class: 'nl-svg' }); mag.appendChild(ms);
          ms.appendChild(svgEl('path', { d: `M ${X(lo)} ${y0 + 4} L ${zx0} ${zy - 2} L ${zx1} ${zy - 2} L ${X(lo + 1)} ${y0 + 4} Z`, class: 'nl-fan' }));
          ms.appendChild(svgEl('line', { x1: zx0 - 10, y1: zy, x2: zx1 + 10, y2: zy, class: 'nl-axis z' }));
          for (let t = 0; t <= 10; t++) {
            const x = zx0 + t * (zx1 - zx0) / 10; ms.appendChild(svgEl('line', { x1: x, y1: zy - (t % 10 ? 7 : 11), x2: x, y2: zy + (t % 10 ? 7 : 11), class: 'nl-tick' }));
            const lab = h('div', 'nl-zl c' + (t % 10 ? '' : ' int'), (lo + t / 10).toFixed(t % 10 ? 1 : 0)); mag.appendChild(at(lab, x, zy + 22));
          }
          if (!o.pi && !o.c) { const sq = squeeze(o.n); if (sq.hi - sq.lo < 1) { const band = h('div', 'nl-band'); mag.appendChild(at(band, Z(sq.lo), zy - 16)); band.style.width = (Z(sq.hi) - Z(sq.lo)) + 'px'; } }
          mag.style.transformOrigin = `50% ${y0}px`;
          await c.anim(mag, [{ opacity: 0, transform: 'scaleY(.2)' }, { opacity: 1, transform: 'none' }], 450);
          const zd = h('div', 'nl-dot c'); mag.appendChild(at(zd, Z(val), zy));
          const zl = h('div', 'nl-zv c', '≈ ' + val.toFixed(2)); mag.appendChild(at(zl, Z(val), zy - 34));
          await Promise.all([c.pop(zd, 380), c.fadeIn(zl, 300, { delay: 150 })]);
          // drop it onto the main line
          let lvl = 0; while (placed.some((p) => p.lvl === lvl && Math.abs(p.v - val) < 0.8)) lvl++;
          placed.push({ v: val, lvl });
          const ghost = add(stage, h('div', 'nl-dot c'), Z(val), zy);
          await c.anim(ghost, [{ left: Z(val) + 'px', top: zy + 'px' }, { left: X(val) + 'px', top: y0 + 'px' }], 600);
          ghost.classList.add('main');
          const ly = y0 - 34 - lvl * 32, lab = add(stage, h('div', 'nl-lab c', `<i class="nl-let">${LET[idx]}</i>${tex(o.t)}`), X(val), ly);
          if (lvl) { const st = add(stage, h('div', 'nl-stem'), X(val) - 1, ly + 14); st.style.height = (y0 - ly - 20) + 'px'; }
          await c.pop(lab, 360);
        }
      });
    });
    const order = S.map((o, i) => ({ o, i, v: nval(o) })).sort((p, q) => p.v - q.v);
    steps.push({
      cap: `Read the number line from left to right: smallest to largest. ${order.map((p) => '(' + LET[p.i] + ')').join(', ')}.`,
      run: async (c) => {
        const jobs = [];
        if (mag) { const old = mag; mag = null; jobs.push(c.anim(old, [{ opacity: 1 }, { opacity: 0 }], 250).then(() => old.remove())); }
        est.innerHTML = '<b>In order</b>'; jobs.push(c.fadeIn(est, 300));
        const ol = add(stage, h('div', 'nl-order c', order.map((p) => `<div class="nl-oi">${tex(p.o.t)}<small class="nl-ol">(${LET[p.i]})</small></div>`).join('<div class="nl-lt">&lt;</div>')), W / 2, 330);
        jobs.push(c.fadeIn(ol, 450, { delay: 200 }));
        await Promise.all(jobs);
      }
    });
    return steps;
  }
};

/* ============ 5. The algebraic method: line up the tails and subtract ============ */
function parseRep(s) {
  const m = String(s).replace(/\s/g, '').match(/^(\d{1,4})\.(\d{0,3})\((\d{1,6})\)$/); if (!m) return null;
  if (m[2].length + m[3].length > 7 || /^0+$/.test(m[3]) && !m[2]) return null;
  if (/^9+$/.test(m[3])) return null; // 0.999… = 1 — a different conversation
  return { I: m[1].replace(/^0+(?=\d)/, ''), pre: m[2], blk: m[3] };
}
const trunc = (x, k) => (Math.floor(x * 10 ** k + 1e-9) / 10 ** k).toFixed(k);
const repTeX = (r) => `${r.I}.${r.pre}\\overline{${r.blk}}`;
const algebra = {
  title: 'Line up the tails, then subtract',
  height: 450,
  choices: [tc('0.(36)', '0.\\overline{36}'), tc('0.(7)', '0.\\overline{7}'), tc('0.1(6)', '0.1\\overline{6}'), tc('0.(142857)', '0.\\overline{142857}'), { sep: 'Example 5 check:' }, tc('3.0(62)', '3.0\\overline{62}'), { sep: 'Example 6 check:' }, tc('0.(45)', '0.\\overline{45}'), tc('2.8(3)', '2.8\\overline{3}')],
  intro: (v) => `Write ${tex(repTeX(parseRep(v)))} as a fraction — no calculator. The trick: make two copies whose <b>tails match</b>, then subtract them away.`,
  setup(ex) { addCustom(ex, '2.8(3)', (s) => (parseRep(s) ? s.replace(/\s/g, '') : null), '( ) = repeats', 110); },
  make(stage, v, ex) {
    stage.classList.remove('al-col');
    const W = ex.W, r = parseRep(v), { I, pre, blk } = r, p = pre.length, L = blk.length, m = p + L;
    const bigM = 10 ** m, smallM = 10 ** p, S = I + pre + blk.repeat(Math.ceil(70 / L));
    const intOf = (shift) => Number((I + (pre + blk.repeat(3)).slice(0, shift)));
    const A = intOf(m), B = intOf(p), K = bigM - smallM, Nn = A - B, g = gcd(Nn, K), num = Nn / g, den = K / g;
    const cw = 25, dotW = 12, I0 = I.length;
    const lbl = (k) => (k === 1 ? '<i>x</i>' : big(k) + '<i>x</i>');
    // the label column fits the widest label; the decimal point sits at the same x on every row
    const meas = h('div', 'al-lab'); meas.style.visibility = 'hidden'; stage.appendChild(at(meas, 0, 0));
    const lw = Math.max(...[lbl(bigM), lbl(smallM), big(K) + '<i>x</i>'].map((s) => { meas.innerHTML = s + ' ='; return meas.offsetWidth; })); meas.remove();
    const labR = 34 + lw, pointX = labR + 20 + Math.max(String(A).length, I0) * cw, xr = W - 30;
    const cellX = (j, pp) => (j < pp ? pointX - (pp - j) * cw : pointX + dotW + (j - pp) * cw);
    const kind = (j) => (j < I0 ? 'i' : j < I0 + p ? 'pre' : 'b' + (L === 1 ? 0 : Math.floor((j - I0 - p) / L) % 2));
    const nVis = (pp) => { let j = 0; while (j < S.length && cellX(j, pp) < xr - cw) j++; return j; };
    const mkRow = (y, label, pp) => {
      const lab = add(stage, h('div', 'al-lab', label + ' ='), labR, y); lab.style.translate = '-100% 0';
      const pt = add(stage, h('div', 'al-pt', '.'), pointX, y); pt.style.width = dotW + 'px';
      const cells = []; for (let j = 0; j < S.length && j < nVis(I0) + m + 2; j++) { const el = add(stage, h('div', 'al-d ' + kind(j), S[j]), cellX(j, pp), y); el.style.width = cw + 'px'; cells.push(el); }
      const fade = add(stage, h('div', 'al-fade'), xr - 70, y - 4); fade.style.width = (W - xr + 70) + 'px';
      return { lab, pt, cells, fade, y };
    };
    const yX = 26, yA = 136, yB = 190, yLine = 236, yR = 248;
    const rowX = mkRow(yX, lbl(1), I0); [rowX.lab, rowX.pt, rowX.fade, ...rowX.cells].forEach((el) => (el.style.opacity = 0));
    let rowA, rowB, rowR;
    const shift = (c, row, by) => Promise.all(row.cells.map((el, j) => {
      const to = cellX(j, I0 + by), lead = j < I0 + by - 1 && /^0+$/.test(S.slice(0, j + 1));
      return c.anim(el, [{ left: el.style.left, opacity: el.style.opacity || '1' }, { left: to + 'px', opacity: lead || to < labR + 6 ? '0' : '1' }], 700, { delay: 250 });
    }));
    const tailBox = (row, cls) => { const b = add(stage, h('div', 'al-tail ' + (cls || '')), pointX - 2, row.y - 4); b.style.width = (xr - pointX - 10) + 'px'; return b; };
    const dec = tex(repTeX(r));
    const steps = [
      { cap: `<b>Step 1.</b> Let <b><i>x</i></b> = ${dec}. Write out lots of digits — they go on forever.`,
        run: (c) => Promise.all([rowX.lab, rowX.pt, rowX.fade].map((el) => c.fadeIn(el, 300)).concat(rowX.cells.map((el, j) => c.anim(el, [{ opacity: 0 }, { opacity: 1 }], 250, { delay: j * 18 })))) },
      { cap: `<b>Step 2.</b> The repeating block is <b>${blk}</b> (${L} digit${L > 1 ? 's' : ''})` + (p ? `, after the non-repeating digit${p > 1 ? 's' : ''} <b>${pre}</b>.` : ', and it starts right after the decimal point.'),
        run: async (c) => { stage.classList.add('al-col'); await Promise.all(rowX.cells.filter((el, j) => j >= I0).map((el, j) => c.anim(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-6px)' }, { transform: 'translateY(0)' }], 300, { delay: j * 30 }))); } },
      { cap: `<b>Step 3.</b> Multiply by <b>${big(bigM)}</b> (${tex(`10^{${m}}`)}): the decimal point jumps <b>${m} place${m > 1 ? 's' : ''}</b> right, past ${p ? `the ${pre} and ` : ''}one whole block. Now a block sits <b>left</b> of the point.`,
        run: async (c) => { rowA = mkRow(yA, lbl(bigM), I0); await Promise.all([c.fadeIn(rowA.lab, 300), shift(c, rowA, m)]); } },
      p ? { cap: `<b>Step 4.</b> Multiply by <b>${big(smallM)}</b> (${tex(`10^{${p}}`)}) to move the point past <b>${pre}</b>, so the block starts <b>immediately right</b> of the point.`,
        run: async (c) => { rowB = mkRow(yB, lbl(smallM), I0); await Promise.all([c.fadeIn(rowB.lab, 300), shift(c, rowB, p)]); } }
        : { cap: `<b>Step 4</b> isn’t needed: in <b><i>x</i></b> itself the block already starts right after the point. We’ll subtract <b><i>x</i></b>.`,
          run: async (c) => { rowB = mkRow(yB, lbl(1), I0); await Promise.all([rowB.lab, rowB.pt, ...rowB.cells].map((el) => c.fadeIn(el, 350, { from: `translateY(${yX - yB}px)` }))); } },
      { cap: `Line up the decimal points. After the point, both rows are <b>exactly the same</b>: .${blk}${blk}${blk.length < 3 ? blk : ''}… forever.`,
        run: async (c) => { const t1 = tailBox(rowA), t2 = tailBox(rowB); await Promise.all([c.fadeIn(t1, 350), c.fadeIn(t2, 350, { delay: 150 })]); } },
      { cap: `<b>Step 5.</b> Subtract. The tails <b>cancel</b> and leave <b>${big(K)}<i>x</i> = ${big(Nn)}</b>.`,
        run: async (c) => {
          const mn = add(stage, h('div', 'al-minus', '−'), 14, yB), ln = add(stage, h('div', 'al-line'), 20, yLine); ln.style.width = (xr - 20) + 'px';
          const jobs = [c.fadeIn(mn, 250), c.anim(ln, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], 400)];
          [rowA, rowB].forEach((row) => row.cells.forEach((el) => { if (parseFloat(el.style.left) > pointX) { el.classList.add('gone'); jobs.push(c.anim(el, [{ opacity: 1 }, { opacity: 0.25 }], 400, { delay: 300 })); } }));
          const lab = add(stage, h('div', 'al-lab res', big(K) + '<i>x</i> ='), labR, yR); lab.style.translate = '-100% 0';
          const ds = String(Nn), vals = ds.split('').map((ch, i) => { const el = add(stage, h('div', 'al-d res', ch), pointX - (ds.length - i) * cw, yR); el.style.width = cw + 'px'; return el; });
          const z = add(stage, h('div', 'al-zero', '.000000…'), pointX, yR);
          jobs.push(c.fadeIn(lab, 350, { delay: 600 }), ...vals.map((el, i) => c.fadeIn(el, 350, { delay: 700 + i * 40 })), c.anim(z, [{ opacity: 0 }, { opacity: 0.5 }, { opacity: 0 }], 1400, { delay: 700 }));
          await Promise.all(jobs);
        } },
      { cap: `Solve for <i>x</i>: divide both sides by ${big(K)}.`,
        run: async (c) => { const s = add(stage, h('div', 'al-solve'), 40, 318); s.innerHTML = tex(`x=\\dfrac{${tnum(Nn)}}{${tnum(K)}}`); stage._solve = s; await c.fadeIn(s, 400); } },
      { cap: g > 1 ? `Simplify: divide top and bottom by <b>${big(g)}</b>. ${tex(repTeX(r) + '=\\dfrac{' + num + '}{' + den + '}')}. Check: ${num} ÷ ${den} = ${trunc(num / den, Math.min(8, p + 2 * L + 1))}… ✓`
        : `${tex(`\\dfrac{${tnum(Nn)}}{${tnum(K)}}`)} is already in simplest form. Check: ${Nn} ÷ ${K} = ${trunc(Nn / K, Math.min(8, p + 2 * L + 1))}… ✓`,
        run: async (c) => { const s = stage._solve; s.innerHTML = tex(`x=\\dfrac{${tnum(Nn)}}{${tnum(K)}}` + (g > 1 ? `=\\dfrac{${tnum(Nn)}\\div${tnum(g)}}{${tnum(K)}\\div${tnum(g)}}=\\boxed{\\dfrac{${tnum(num)}}{${tnum(den)}}}` : `\\ \\text{(simplest form)}`)); await c.fadeIn(s, 400); } }
    ];
    return steps;
  }
};

/* ============ warm-up: the cyclic number clock ============ */
function mountWarmup() {
  const host = document.getElementById('cy-clock'); if (!host) return;
  const D = [1, 4, 2, 8, 5, 7], C = 160, R = 106;
  const P = (deg, r = R) => { const a = (deg * Math.PI) / 180; return [C + r * Math.sin(a), C - r * Math.cos(a)]; };
  const s = svgEl('svg', { viewBox: '0 0 320 320', class: 'cy-svg' });
  s.innerHTML = `<defs><marker id="cyarr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#d23c32"/></marker></defs>`;
  s.appendChild(svgEl('circle', { cx: C, cy: C, r: 150, class: 'cy-face' }));
  for (let a = 0; a < 360; a += 6) { const [x1, y1] = P(a, 150), [x2, y2] = P(a, a % 30 ? 143 : 138); s.appendChild(svgEl('line', { x1, y1, x2, y2, class: 'cy-tick' })); }
  D.forEach((_, i) => { const [x1, y1] = P(i * 60 + 17), [x2, y2] = P(i * 60 + 43); s.appendChild(svgEl('path', { d: `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`, class: 'cy-arc', 'marker-end': 'url(#cyarr)' })); });
  const hand = svgEl('g', { class: 'cy-hand' });
  hand.append(svgEl('line', { x1: C, y1: C, x2: C, y2: C - 64 }), svgEl('path', { d: `M ${C} ${C - 74} l -9 14 h 18 z` }));
  s.appendChild(hand); s.appendChild(svgEl('circle', { cx: C, cy: C, r: 8, class: 'cy-hub' }));
  const lab = svgEl('text', { x: 14, y: 30, class: 'cy-div' }); lab.textContent = '÷ 7'; s.appendChild(lab);
  const nodes = D.map((dg, i) => { const [x, y] = P(i * 60), g = svgEl('g', { class: 'cy-node' }); g.append(svgEl('circle', { cx: x, cy: y, r: 27 })); const t = svgEl('text', { x, y: y + 11 }); t.textContent = dg; g.appendChild(t); s.appendChild(g); return g; });
  host.appendChild(s);
  let ang = 0, gen = 0;
  const setHand = (a) => hand.setAttribute('transform', `rotate(${a} ${C} ${C})`);
  const turn = (to, ms, g) => new Promise((res) => {
    const from = ang, t0 = performance.now();
    const tick = (now) => { if (g !== gen) return res(false); const t = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - t, 3); setHand(from + (to - from) * e); if (t < 1) requestAnimationFrame(tick); else { ang = to; res(true); } };
    requestAnimationFrame(tick);
  });
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const lit = (i) => { nodes.forEach((n, j) => n.classList.toggle('lit', j === i)); };
  const read = document.getElementById('cy-read'), START = { 1: 0, 2: 2, 3: 1, 4: 4, 5: 5, 6: 3 };
  const blanks = [...document.querySelectorAll('.cy-blanks .blank')];
  const goTo = (i) => { let target = i * 60; while (target < ang - 1e-6) target += 360; return target; };
  async function spin(k) {
    const g = ++gen; const i0 = START[k];
    read.innerHTML = tex(`\\dfrac{${k}}{7}=`) + ' 0.';
    if (!(await turn(goTo(i0), 450, g))) return;
    let out = '0.';
    for (let s2 = 0; s2 < 6; s2++) {
      const i = (i0 + s2) % 6; lit(i); out += D[i];
      read.innerHTML = tex(`\\dfrac{${k}}{7}=`) + ` <b>${out}</b>…`;
      if (k === 4 && blanks[s2]) { blanks[s2].classList.add('filled'); blanks[s2].textContent = blanks[s2].dataset.a; blanks[s2].animate([{ transform: 'scale(1.4)' }, { transform: 'scale(1)' }], 300); }
      await wait(260); if (g !== gen) return;
      if (s2 < 5 && !(await turn(ang + 60, 320, g))) return;
    }
    read.innerHTML = tex(`\\dfrac{${k}}{7}=0.\\overline{${out.slice(2)}}`) + ` <span class="muted">— round the clock forever</span>`;
  }
  async function count100() {
    const g = ++gen; lit(-1);
    if (!(await turn(goTo(0), 400, g))) return;
    for (let lap = 1; lap <= 16; lap++) {
      read.innerHTML = `Lap <b>${lap}</b> · digits ${6 * lap - 5}–<b>${6 * lap}</b>`;
      if (!(await turn(ang + 360, lap < 3 ? 650 : 230, g))) return;
    }
    read.innerHTML = '16 laps = <b>96 digits</b>. Now 4 more…';
    await wait(700); if (g !== gen) return;
    for (let s2 = 0; s2 < 4; s2++) {
      lit(s2); read.innerHTML = `Digit <b>${97 + s2}</b>: ${D[s2]}`;
      await wait(450); if (g !== gen) return;
      if (s2 < 3 && !(await turn(ang + 60, 380, g))) return;
    }
    read.innerHTML = '100th digit: <b class="red">8</b> &nbsp;(100 = 16 × 6 + 4)';
  }
  const chips = document.getElementById('cy-chips');
  for (let k = 1; k <= 6; k++) { const b = h('button', 'chip', frac(k, 7)); b.type = 'button'; b.onclick = () => { chips.querySelectorAll('.chip').forEach((x) => x.classList.toggle('on', x === b)); spin(k); }; chips.appendChild(b); }
  document.getElementById('cy-count').addEventListener('click', () => { chips.querySelectorAll('.chip').forEach((x) => x.classList.remove('on')); count100(); });
  blanks.forEach((b) => b.addEventListener('click', () => { b.classList.toggle('filled'); b.textContent = b.classList.contains('filled') ? b.dataset.a : ''; }));
  // the digit strip for question 3
  const strip = document.getElementById('cy-strip');
  if (strip) for (let i = 1; i <= 18; i++) { const d = h('div', 'cy-sd' + (i === 7 || i === 12 ? ' hit' : '') + (i % 6 === 0 ? ' end' : ''), `<b>${D[(i - 1) % 6]}</b><span>${i}</span>`); strip.appendChild(d); }
  document.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
    const t = document.getElementById(b.dataset.toggle); t.classList.toggle('shown');
    if (b.dataset.toggle === 'cy-a3' && strip) strip.classList.toggle('show', t.classList.contains('shown'));
  }));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
}

/* ============ starter: tap to circle a word ============ */
function mountCircles() {
  document.querySelectorAll('.circ').forEach((b) => b.addEventListener('click', () => {
    const on = !b.classList.contains('on');
    document.querySelectorAll(`.circ[data-g="${b.dataset.g}"]`).forEach((x) => x.classList.remove('on'));
    b.classList.toggle('on', on);
  }));
}

/* ============ Example 3: a 0–10 number line to mark on ============ */
function mountExampleLine() {
  document.querySelectorAll('svg.l3-nl').forEach((s) => {
    const X = (i) => 40 + i * 92;
    s.appendChild(svgEl('line', { x1: 18, y1: 22, x2: 984, y2: 22, class: 'nl-axis' }));
    s.appendChild(svgEl('path', { d: 'M 990 22 l -13 -7 v 14 z', class: 'nl-arrow' }));
    for (let i = 0; i <= 10; i++) {
      s.appendChild(svgEl('line', { x1: X(i), y1: 12, x2: X(i), y2: 32, class: 'nl-tick' }));
      const t = svgEl('text', { x: X(i), y: 58, class: 'nl-txt' }); t.textContent = i; s.appendChild(t);
    }
  });
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { longdiv, denoms, stripes, flow, numline, algebra };
  document.querySelectorAll('[data-explainer]').forEach((el) => { const def = defs[el.dataset.explainer]; const ex = new Explainer(el, def); if (def.setup) def.setup(ex); });
}

mountExplainers(); mountWarmup(); mountCircles(); mountExampleLine();
