/* Math 10C · Unit 2 · Lesson 4 — Scientific Notation (Application / Extension): the explainers and warm-up on this page. */
import { h, fmt, Explainer } from '../explain.js';
import { tex } from '../tex.js';

const at = (el, x, y) => { el.style.left = x + 'px'; el.style.top = y + 'px'; return el; };
const add = (stage, el, x, y) => { stage.appendChild(at(el, x, y)); return el; };
const hide = (...els) => els.forEach((e) => { if (e) e.style.opacity = 0; });
const svgEl = (tag, attrs = {}) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };

/* KaTeX, allowing \htmlClass (tokens that fly from one line to the next) */
const K = (src, display) => {
  try { return window.katex.renderToString(String(src), { displayMode: !!display, throwOnError: false, strict: 'ignore', trust: true, output: 'html' }); }
  catch (e) { return tex(src, display); }
};

/* ---------- decimal helpers (strings, so nothing is lost to floating point) ----------
 * A number is { sig, e }: its significant digits and its exponent, value = sig[0].sig[1…] × 10^e. */
function parseDec(str) {
  const [ip, fp = ''] = String(str).split('.'), all = ip + fp;
  let f = 0; while (f < all.length - 1 && all[f] === '0') f++;
  return { sig: all.slice(f).replace(/0+$/, '') || '0', e: ip.length - 1 - f };
}
const coefOf = (sig) => sig[0] + (sig.length > 1 ? '.' + sig.slice(1) : '');
const group = (ip, sep) => (ip.length < 4 ? ip : ip.replace(/\B(?=(\d{3})+(?!\d))/g, sep));
function stdOf(sig, e, sep = ' ') { // standard notation, thin spaces between groups of three like the booklet
  let ip, fp;
  if (e >= 0) { ip = sig.slice(0, e + 1).padEnd(e + 1, '0'); fp = sig.slice(e + 1); } else { ip = '0'; fp = '0'.repeat(-e - 1) + sig; }
  ip = group(ip, sep); return fp ? ip + '.' + fp : ip;
}
const stdT = (sig, e) => stdOf(sig, e, '\\,');
const sciT = (c, n) => `${c}\\times10^{${n}}`;
const neg = (n) => (n < 0 ? '−' + -n : String(n)); // a real minus sign in captions
const par = (n) => (n < 0 ? `(${n})` : String(n)); // −3 + (−6), in LaTeX
const parN = (n) => (n < 0 ? `(−${-n})` : String(n)); // the same in a caption
const num = (x) => String(Number(Number(x).toPrecision(12))); // 2.5 × 3 → "7.5", not 7.499999…
const plural = (k, w) => k + ' ' + w + (k === 1 ? '' : 's');

/* A copy of a token flies from one place in the stage to another (like Unit 1's worked lines). */
async function fly(c, stage, from, to, src, o = {}) {
  if (!to) return;
  if (c.fast || !from) { to.style.opacity = 1; return; }
  c.check();
  const sr = stage.getBoundingClientRect(), k = sr.width / stage.offsetWidth || 1;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  const ax = (a.left + a.width / 2 - sr.left) / k, ay = (a.top + a.height / 2 - sr.top) / k;
  const bx = (b.left + b.width / 2 - sr.left) / k, by = (b.top + b.height / 2 - sr.top) / k;
  const g = add(stage, h('div', 'sn-fly c' + (o.cls ? ' ' + o.cls : ''), K(src)), ax, ay); if (o.fs) g.style.fontSize = o.fs + 'px';
  try {
    await c.anim(g, [{ opacity: 1, transform: 'translate(0,0) scale(1.1)' }, { opacity: 1, transform: `translate(${(bx - ax) / 2}px, ${(by - ay) / 2 - 24}px) scale(1.2)`, offset: 0.5 }, { opacity: 1, transform: `translate(${bx - ax}px, ${by - ay}px) scale(1)` }], o.ms || 750, { delay: o.delay || 0 });
  } finally { g.remove(); }
  to.style.opacity = 1;
}

/* A row of decimal digits with a decimal point that hops along arcs, one place at a time. */
function digitRow(stage, cells, o) {
  const { x0, y, cw, ch, fs } = o, svg = add(stage, svgEl('svg', { class: 'hp-svg' }), 0, 0);
  svg.setAttribute('width', stage.clientWidth || 1000); svg.setAttribute('height', o.H);
  const els = cells.map((d, i) => { const e = add(stage, h('div', 'hp-cell', d), x0 + i * cw, y); e.style.width = cw + 'px'; e.style.height = ch + 'px'; e.style.fontSize = fs + 'px'; e.style.lineHeight = ch + 'px'; return e; });
  const sx = (k) => x0 + k * cw, base = y + ch * 0.86;
  return {
    els, sx, base, svg,
    // move `dot` from slot k to slot k + dir, drawing the arc and its label
    async hop(c, dot, k, dir, label, delay = 0) {
      const x1 = sx(k), x2 = sx(k + dir), top = y - 10, mid = (x1 + x2) / 2;
      const p = svgEl('path', { class: 'hp-arc' + (dir < 0 ? ' left' : ''), d: `M ${x1} ${base - 8} C ${x1} ${top}, ${x2} ${top}, ${x2} ${base - 8}` }); svg.appendChild(p);
      const len = p.getTotalLength ? p.getTotalLength() || 120 : 120; p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
      const tag = add(stage, h('div', 'hp-tag c' + (dir < 0 ? ' left' : ''), label), mid, top - 6); tag.style.opacity = 0;
      const ah = svgEl('path', { class: 'hp-head' + (dir < 0 ? ' left' : ''), d: `M ${x2 - 6} ${base - 20} L ${x2} ${base - 8} L ${x2 + 6} ${base - 20}` }); ah.style.opacity = 0; svg.appendChild(ah);
      await c.sleep(delay);
      await Promise.all([
        c.anim(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], 420),
        c.anim(dot, [{ transform: 'translate(0,0)' }, { transform: `translate(${(x2 - x1) / 2}px, ${top - base + 4}px)`, offset: 0.5 }, { transform: `translate(${x2 - x1}px, 0)` }], 420, { easing: 'ease-in-out' }),
        c.anim(tag, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'scale(1)' }], 260, { delay: 180 }),
        c.anim(ah, [{ opacity: 0 }, { opacity: 1 }], 120, { delay: 330 })
      ]);
      dot.style.left = x2 + 'px'; dot.style.transform = 'none';
    }
  };
}

/* ============ 1. Hop the decimal point ============ */
const hops = {
  title: 'Hop the decimal point',
  height: 440,
  choices: [{ v: 's:52000', label: '52 000' }, { v: 's:0.00047', label: '0.00047' }, { v: 's:36800000', label: '36 800 000' }, { v: 'e:2.9:9', label: tex('2.9\\times10^{9}') }, { v: 'e:8:-6', label: tex('8\\times10^{-6}') },
    { sep: 'Example 1 check:' }, { v: 's:84200', label: '84 200' }, { v: 's:0.00072', label: '0.00072' }, { v: 'e:6.05:2', label: tex('6.05\\times10^{2}') }, { v: 'e:4.1:-3', label: tex('4.1\\times10^{-3}') }],
  intro: (v) => {
    const [mode, a, b] = v.split(':');
    if (mode === 's') { const q = parseDec(a); return `Write <b>${stdOf(q.sig, q.e)}</b> in <b>scientific notation</b>. The decimal point will hop from ○ to ●, and we count the hops.`; }
    return `Write ${tex(sciT(coefOf(parseDec(a).sig), b))} in <b>standard notation</b>. The exponent says how many places the point hops, and which way.`;
  },
  make(stage, v, ex) {
    const W = ex.W, H = 440, [mode, a, b] = v.split(':');
    let sig, e;
    if (mode === 's') ({ sig, e } = parseDec(a)); else { sig = parseDec(a).sig; e = Number(b); }
    const big = e >= 0, nh = Math.abs(e), dir = big ? 1 : -1, coef = coefOf(sig);
    const cells = big ? sig.padEnd(Math.max(sig.length, e + 1), '0').split('') : ('0'.repeat(-e) + sig).split('');
    const cIdx = big ? 1 : -e + 1, sIdx = big ? e + 1 : 1, L = cells.length;
    const pad = (i) => (big ? i >= sig.length : i < -e);
    const cw = Math.min(66, (W - 200) / (L + 1)), ch = cw * 1.25, fs = Math.min(56, cw * 0.86), x0 = (W - L * cw) / 2, y = 120;
    const row = digitRow(stage, cells, { x0, y, cw, ch, fs, H });
    // the task, and a legend for the two points
    add(stage, h('div', 'hp-task', mode === 's' ? `Write <b>${stdOf(sig, e)}</b> in scientific notation` : `Write ${K(sciT(coef, e))} in standard notation`), 22, 14);
    add(stage, h('div', 'hp-legend', '<span class="hp-ring-i"></span> start: the coefficient’s point &nbsp; <span class="hp-dot-i"></span> end: the standard number’s point'), 22, 58);
    const ring = add(stage, h('div', 'hp-ring c'), row.sx(cIdx), row.base);
    const dot = add(stage, h('div', 'hp-dot c'), row.sx(cIdx), row.base);
    const ghost = add(stage, h('div', 'hp-dot ghost c'), row.sx(sIdx), row.base);
    hide(dot, ghost); if (mode === 's') hide(ring);
    const lab = (t, yy) => { const e2 = add(stage, h('div', 'hp-lab', t), 28, yy); return e2; };
    const yPF = 262, yOut = 348;
    const lPF = lab('Product form', yPF + 10), pf = add(stage, h('div', 'hp-math'), 250, yPF);
    const lOut = lab(mode === 's' ? 'Scientific notation' : 'Standard notation', yOut + 6), out = add(stage, h('div', 'hp-math out'), 250, yOut);
    hide(lPF, lOut);
    const tens = (k) => Array(k).fill('10').join('\\times');
    const pfT = (k) => (k === 0 ? coef : big ? `${coef}\\times${tens(k)}` : `\\dfrac{${coef}}{${tens(k)}}`);
    const steps = [];

    if (mode === 's') {
      const first = cells.findIndex((d) => d !== '0');
      if (!big) hide(dot); // the ghost ● marks the real point of a small number
      steps.push({
        cap: big ? `In <b>${stdOf(sig, e)}</b> the decimal point is hiding at the <b>end</b> (●). For a coefficient between 1 and 10 the point must sit right after the <b>first non-zero digit</b> (○): <b>${coef}</b>.`
          : `In <b>${stdOf(sig, e)}</b> the decimal point is after the first 0 (●). For a coefficient between 1 and 10 it must sit right after the <b>first non-zero digit</b>, the ${cells[first]} (○): <b>${coef}</b>.`,
        run: async (c) => {
          out.innerHTML = K(`${coef}\\times10^{\\,?}`);
          row.els[first].classList.add('lead');
          await Promise.all([c.anim(ghost, [{ opacity: 0 }, { opacity: 0.45 }], 300), c.pop(ring, 380, { delay: 250 }), c.fadeIn(lOut, 300, { delay: 400 }), c.fadeIn(out, 400, { delay: 400 }), c.anim(row.els[first], [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }], 420)]);
        }
      });
      steps.push({
        cap: big ? `Now hop from ○ to ●. Each hop to the <b>right</b> multiplies by 10, so write one “× 10” for every hop.`
          : `Now hop from ○ to ●. Each hop to the <b>left</b> divides by 10, so every hop puts one more 10 in the <b>denominator</b>.`,
        run: async (c) => {
          dot.style.opacity = 1;
          await Promise.all([c.fadeIn(lPF, 300), c.fadeIn(pf, 300)]);
          for (let i = 0; i < nh; i++) {
            pf.innerHTML = K(pfT(i));
            await row.hop(c, dot, cIdx + i * dir, dir, big ? '×10' : '÷10');
            pf.innerHTML = K(pfT(i + 1));
            if (!c.fast) pf.animate([{ opacity: 0.4 }, { opacity: 1 }], 200);
          }
          ghost.style.opacity = 0;
        }
      });
      steps.push({
        cap: big ? `<b>${plural(nh, 'hop')}</b> to the right means ${nh === 1 ? 'one 10' : nh + ' tens multiplied together'}: ${tex(`10^{${nh}}`)}. So ${stdOf(sig, e)} = <b>${tex(sciT(coef, e))}</b>.`
          : `Dividing by ${nh === 1 ? 'one 10' : nh + ' tens'} is the same as multiplying by ${tex(`10^{${e}}`)}. So ${stdOf(sig, e)} = <b>${tex(sciT(coef, e))}</b>.`,
        run: async (c) => {
          pf.innerHTML = K(`${pfT(nh)}=${sciT(coef, e)}`); out.innerHTML = K(`\\mathbf{${sciT(coef, e)}}`);
          out.classList.add('done');
          await Promise.all([c.fadeIn(pf, 300), c.pop(out, 420)]);
        }
      });
      const nPad = cells.filter((_, i) => pad(i)).length;
      steps.push({
        cap: (big ? `A <b>big</b> number (10 or more) gets a <b>positive</b> exponent.` : `A number <b>less than 1</b> gets a <b>negative</b> exponent.`)
          + (nPad ? ` The ${nPad === 1 ? 'zero was a placeholder' : nPad + ' zeros were only placeholders'}: the coefficient keeps the digits <b>${sig.split('').join(', ')}</b>.` : '')
          + ` Check: ${tex(sciT(coef, e))} means hop ${nh} ${big ? 'right' : 'left'}, back to ${stdOf(sig, e)} ✓`,
        run: async (c) => {
          const ph = row.els.filter((_, i) => pad(i));
          ph.forEach((el) => el.classList.add('ph'));
          await Promise.all(ph.map((el, i) => c.anim(el, [{ transform: 'scale(1)' }, { transform: 'scale(.86)' }, { transform: 'scale(1)' }], 360, { delay: i * 60 })));
        }
      });
      return steps;
    }

    /* standard notation from a × 10^n */
    row.els.forEach((el, i) => { if (pad(i)) { el.textContent = '0'; el.classList.add('ph'); hide(el); } });
    row.els.forEach((el, i) => { if (i === cIdx - 1) el.classList.add('lead'); });
    steps.push({
      cap: big ? `${tex(`10^{${e}}`)} means <b>multiply by 10, ${plural(nh, 'time')}</b>. In product form: ${tex(pfT(nh))}.`
        : `${tex(`10^{${e}}`)} means <b>divide by 10, ${plural(nh, 'time')}</b>. In product form: ${tex(pfT(nh))}.`,
      run: async (c) => { pf.innerHTML = K(pfT(nh)); await Promise.all([c.fadeIn(lPF, 300), c.fadeIn(pf, 400)]); }
    });
    const crossings = []; for (let i = 0; i < nh; i++) { const k = cIdx + i * dir; crossings.push(big ? k : k - 1); }
    const fills = crossings.filter((i) => pad(i)).length;
    steps.push({
      cap: (big ? `Each × 10 moves the point <b>one place right</b>. Hop ${plural(nh, 'place')}` : `Each ÷ 10 moves the point <b>one place left</b>. Hop ${plural(nh, 'place')}`)
        + (fills ? `, filling each empty place with a <b>zero</b>.` : '.'),
      run: async (c) => {
        dot.style.opacity = 1;
        for (let i = 0; i < nh; i++) {
          const k = cIdx + i * dir, cross = big ? k : k - 1;
          await row.hop(c, dot, k, dir, big ? '×10' : '÷10');
          if (pad(cross)) await c.pop(row.els[cross], 260);
        }
      }
    });
    steps.push({
      cap: big ? `Read off the number: ${tex(sciT(coef, e))} = <b>${stdOf(sig, e)}</b>. A positive exponent gives a <b>big</b> number.`
        : `Put a <b>0</b> in front of the point and read it off: ${tex(sciT(coef, e))} = <b>${stdOf(sig, e)}</b>. A negative exponent gives a number <b>less than 1</b>.`,
      run: async (c) => {
        const jobs = [];
        if (!big && row.els[0].style.opacity === '0') jobs.push(c.pop(row.els[0], 300));
        out.innerHTML = K(`\\mathbf{${stdT(sig, e)}}`); out.classList.add('done');
        jobs.push(c.fadeIn(lOut, 300), c.pop(out, 420, { delay: 200 }));
        await Promise.all(jobs);
      }
    });
    return steps;
  }
};

/* ============ 1. A powers-of-ten scale ============ */
const ICON = {
  person: '<circle cx="20" cy="8" r="5" fill="#2e3c4f"/><path d="M20 14v13M20 27l-6 10M20 27l6 10M11 19h18" stroke="#2e3c4f" stroke-width="3.2" stroke-linecap="round" fill="none"/>',
  everest: '<path d="M2 36 L16 10 L22 20 L27 13 L38 36 Z" fill="#7a8796"/><path d="M16 10 L11.5 18.5 L15 17 L17.5 19.5 L19.5 15.5 Z M27 13 L24.5 17 L27 16.5 L29 18 Z" fill="#fff"/>',
  earth: '<circle cx="20" cy="20" r="16" fill="#3b82c8"/><path d="M10 13c4-3 7 0 6 4s-6 3-6 7-3 2-4-1 1-8 4-10zM24 8c5 1 9 5 9 9-3 0-4 4-7 3s-1-5-3-6 0-5 1-6zM22 27c3-1 6 1 5 4s-5 2-6 0 0-3 1-4z" fill="#4caf6a"/>',
  sun: '<g stroke="#f0a020" stroke-width="2.6" stroke-linecap="round"><path d="M20 2v5M20 33v5M2 20h5M33 20h5M7.3 7.3l3.5 3.5M29.2 29.2l3.5 3.5M7.3 32.7l3.5-3.5M29.2 10.8l3.5-3.5"/></g><circle cx="20" cy="20" r="10" fill="#f7b733"/><circle cx="17" cy="17" r="3" fill="#fff" opacity=".35"/>',
  orbit: '<circle cx="9" cy="20" r="7.5" fill="#f7b733"/><path d="M17 20h15" stroke="#9aa3b2" stroke-width="1.8" stroke-dasharray="2.5 2.5"/><circle cx="34" cy="20" r="3.6" fill="#3b82c8"/>',
  sand: '<g fill="#d9b26f" stroke="#a9843f" stroke-width="1"><path d="M8 24l6-5 7 2 1 7-7 4-6-3z"/><path d="M24 12l5-3 6 3-1 6-6 1-4-3z"/><path d="M24 28l5-2 4 4-3 4-5-1z"/></g>',
  cell: '<ellipse cx="20" cy="20" rx="16" ry="14" fill="#d9483b"/><ellipse cx="20" cy="20" rx="8" ry="6.5" fill="#b8352b"/><ellipse cx="15" cy="13" rx="4" ry="2" fill="#fff" opacity=".3"/>',
  atom: '<ellipse cx="20" cy="20" rx="16" ry="6.5" fill="none" stroke="#5b4bb7" stroke-width="1.8"/><ellipse cx="20" cy="20" rx="16" ry="6.5" fill="none" stroke="#5b4bb7" stroke-width="1.8" transform="rotate(60 20 20)"/><ellipse cx="20" cy="20" rx="16" ry="6.5" fill="none" stroke="#5b4bb7" stroke-width="1.8" transform="rotate(120 20 20)"/><circle cx="20" cy="20" r="3.4" fill="#d9483b"/>'
};
const ZOOM = [ // log10 of the size in metres places it on the scale
  { k: 'person', name: 'A person', sci: '1.7\\times10^{0}', std: 'about 1.7 m tall', lg: Math.log10(1.7), up: true,
    cap: `Start with <b>you</b>: about 1.7 m tall. That’s ${tex('1.7\\times10^{0}')}: 1.7 is already between 1 and 10, so there are <b>no hops</b> and the exponent is <b>0</b>.` },
  { k: 'everest', name: 'Mount Everest', sci: '8.8\\times10^{3}', std: '8 849 m high', lg: Math.log10(8849), up: false,
    cap: `<b>Mount Everest</b> is 8 849 m high: about ${tex('8.8\\times10^{3}')} m. Each tick to the right is <b>× 10</b>, so it sits just below the ${tex('10^{4}')} tick.` },
  { k: 'earth', name: 'Earth (across)', sci: '1.27\\times10^{7}', std: '12 742 000 m', lg: Math.log10(12742000), up: true,
    cap: `<b>Earth</b> is about 12 742 000 m across: ${tex('1.27\\times10^{7}')} m. Scientific notation saves counting all those zeros.` },
  { k: 'sun', name: 'The Sun (across)', sci: '1.39\\times10^{9}', std: '1 390 000 000 m', lg: Math.log10(1.39e9), up: false,
    cap: `The <b>Sun</b> is about ${tex('1.39\\times10^{9}')} m across. That’s two ticks past Earth, so about ${tex('10^{2}=100')} times as wide: over 100 Earths would fit across it.` },
  { k: 'orbit', name: 'Earth to the Sun', sci: '1.5\\times10^{11}', std: '150 000 000 000 m', lg: Math.log10(1.5e11), up: true,
    cap: `From <b>Earth to the Sun</b> is about ${tex('1.5\\times10^{11}')} m. That’s the distance in <b>Example 4</b>.` },
  { k: 'sand', name: 'A grain of sand', sci: '5\\times10^{-4}', std: '0.0005 m', lg: Math.log10(5e-4), up: false,
    cap: `Now zoom <b>in</b>. A grain of <b>sand</b> is about 0.0005 m across: ${tex('5\\times10^{-4}')} m. Less than 1 m, so the exponent is <b>negative</b>.` },
  { k: 'cell', name: 'A red blood cell', sci: '8\\times10^{-6}', std: '0.000008 m', lg: Math.log10(8e-6), up: true,
    cap: `A <b>red blood cell</b> is about 0.000008 m across: ${tex('8\\times10^{-6}')} m. Six hops left from 8.` },
  { k: 'atom', name: 'A hydrogen atom', sci: '1\\times10^{-10}', std: '0.0000000001 m', lg: -10, up: true,
    cap: `A <b>hydrogen atom</b> is about 0.0000000001 m across: ${tex('1\\times10^{-10}')} m. Nine zeros after the point: much easier to read as a power of 10.` }
];
const zoom = {
  title: 'From an atom to the Sun: a powers-of-ten scale (metres)',
  height: 470,
  intro: 'Every measurement goes on the scale at the tick for its <b>power of 10</b>. Press <b>Next</b> to place them one at a time.',
  make(stage, v, ex) {
    stage.classList.remove('zm-done');
    const W = ex.W, ax = 50, aw = W - 100, ay = 238, lo = -10, hi = 12, X = (lg) => ax + (lg - lo) * aw / (hi - lo);
    const svg = add(stage, svgEl('svg', { class: 'zm-svg', width: W, height: 470 }), 0, 0);
    svg.appendChild(svgEl('line', { x1: ax - 20, y1: ay, x2: ax + aw + 24, y2: ay, class: 'zm-axis' }));
    svg.appendChild(svgEl('path', { d: `M ${ax + aw + 16} ${ay - 7} L ${ax + aw + 26} ${ay} L ${ax + aw + 16} ${ay + 7}`, class: 'zm-axis' }));
    for (let e = lo; e <= hi; e++) {
      const x = X(e), major = e % 2 === 0;
      svg.appendChild(svgEl('line', { x1: x, y1: ay - (major ? 9 : 5), x2: x, y2: ay + (major ? 9 : 5), class: 'zm-tick' + (e === 0 ? ' one' : '') }));
      if (major) add(stage, h('div', 'zm-tl c' + (e === 0 ? ' one' : ''), K(`10^{${e}}`)), x, ay + 24);
    }
    add(stage, h('div', 'zm-dir l', '← smaller than 1 m'), ax, ay - 30);
    add(stage, h('div', 'zm-dir r', 'bigger than 1 m →'), ax + aw - 150, ay - 30);
    const cw = 150, items = ZOOM.map((it) => {
      const x = X(it.lg), cx = Math.max(cw / 2 + 6, Math.min(W - cw / 2 - 6, x));
      const card = add(stage, h('div', 'zm-card' + (it.up ? ' up' : ' down'), `<svg viewBox="0 0 40 40" class="zm-ic">${ICON[it.k]}</svg><div class="zm-n">${it.name}</div><div class="zm-s">${K(it.sci)} m</div><div class="zm-d">${it.std}</div>`), cx - cw / 2, it.up ? 22 : 300);
      card.style.width = cw + 'px';
      const ly1 = it.up ? 22 + 120 : ay + 8, ly2 = it.up ? ay - 8 : 300;
      const lead = svgEl('line', { x1: x, y1: ly1, x2: x, y2: ly2, class: 'zm-lead' }); svg.appendChild(lead);
      const dot = add(stage, h('div', 'zm-dot c'), x, ay);
      hide(card, lead, dot);
      return { it, card, lead, dot, x };
    });
    const steps = items.map((o) => ({
      cap: o.it.cap,
      run: (c) => Promise.all([c.pop(o.dot, 360), c.anim(o.lead, [{ opacity: 0 }, { opacity: 1 }], 300, { delay: 150 }), c.fadeIn(o.card, 420, { delay: 200, from: o.it.up ? 'translateY(-10px)' : 'translateY(10px)' })])
    }));
    const a = items.find((o) => o.it.k === 'atom'), b = items.find((o) => o.it.k === 'orbit');
    steps.push({
      cap: `The whole scale: the Earth–Sun distance is about ${tex('10^{11}\\div10^{-10}=10^{11-(-10)}=10^{21}')} times an atom’s width. That’s <b>21 jumps of × 10</b>, done in one line with the <b>Quotient Law</b>.`,
      run: async (c) => {
        const top = 60, p = svgEl('path', { d: `M ${a.x} ${ay - 10} C ${a.x + 80} ${top - 40}, ${b.x - 80} ${top - 40}, ${b.x} ${ay - 10}`, class: 'zm-span' }); svg.appendChild(p);
        const len = p.getTotalLength ? p.getTotalLength() || 1200 : 1200; p.style.strokeDasharray = len; p.style.strokeDashoffset = len;
        const lab = add(stage, h('div', 'zm-big c', `× ${K('10^{21}')}`), (a.x + b.x) / 2, top + 4); lab.style.opacity = 0;
        items.forEach((o) => o.card.classList.add('faded'));
        stage.classList.add('zm-done');
        await Promise.all([c.anim(p, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], 1100), c.pop(lab, 420, { delay: 800 })]);
      }
    });
    return steps;
  }
};

/* ============ 1. Renormalize a coefficient that is out of range ============ */
const renorm = {
  title: 'Renormalize: the point and the exponent move together',
  height: 430,
  choices: [{ v: '29.44:8', label: tex('29.44\\times10^{8}') }, { v: '0.072:5', label: tex('0.072\\times10^{5}') }, { v: '456:-3', label: tex('456\\times10^{-3}') },
    { sep: 'Example 2 check:' }, { v: '0.35:-6', label: tex('0.35\\times10^{-6}') }, { v: '34.5:4', label: tex('34.5\\times10^{4}') }],
  intro: (v) => { const [a, n] = v.split(':'); return `Is ${tex(sciT(a, n))} in scientific notation? Check the <b>coefficient</b> first.`; },
  make(stage, v, ex) {
    const W = ex.W, [aS, nS] = v.split(':'), n = Number(nS);
    const [ip, fp = ''] = aS.split('.'), cells = (ip + fp).split(''), pIdx = ip.length; // point sits after the integer part
    const { sig, e: ae } = parseDec(aS), first = cells.findIndex((d) => d !== '0'), nIdx = first + 1; // new point: after the first non-zero digit
    const k = pIdx - nIdx, n2 = n + k, coef2 = coefOf(sig), tooBig = Number(aS) >= 10, L = cells.length;
    const cw = 56, ch = 64, fs = 50, x0 = W / 2 - (L * cw + 150) / 2, y = 62;
    const row = digitRow(stage, cells, { x0, y, cw, ch, fs, H: 430 });
    const pt = add(stage, h('div', 'hp-dot c'), row.sx(pIdx), row.base);
    const tail = add(stage, h('div', 'rn-tail', '×10<sup>' + neg(n) + '</sup>'), x0 + L * cw + 14, y); tail.style.fontSize = fs + 'px'; tail.style.lineHeight = ch + 'px';
    const sup = tail.querySelector('sup');
    const chg = add(stage, h('div', 'rn-chg c'), 0, 0); hide(chg);
    // the range ruler: 0.01 … 1000 on a log scale, with 1 ≤ a < 10 shaded
    const rx = 70, rw = W - 140, ry = 222, R = (x) => rx + (Math.log10(x) + 2) * rw / 5;
    const band = add(stage, h('div', 'rn-band'), R(1), ry - 16); band.style.width = (R(10) - R(1)) + 'px';
    add(stage, h('div', 'rn-band-l c', '1 ≤ <i>a</i> &lt; 10'), (R(1) + R(10)) / 2, ry + 23);
    add(stage, h('div', 'rn-line'), rx, ry).style.width = rw + 'px';
    [0.01, 0.1, 1, 10, 100, 1000].forEach((t) => { add(stage, h('div', 'rn-tick'), R(t), ry - 6); add(stage, h('div', 'rn-tl c', String(t)), R(t), ry + 22); });
    const mk = add(stage, h('div', 'rn-mk' + (tooBig || Number(aS) < 1 ? ' bad' : ''), `<i></i><span>${aS}</span>`), R(Number(aS)), ry - 8); hide(mk);
    const w1 = add(stage, h('div', 'rn-work'), 40, 290), w2 = add(stage, h('div', 'rn-work'), 40, 352); hide(w1, w2);
    const dirW = k > 0 ? 'left' : 'right', kk = Math.abs(k), times = fmt(10 ** kk);
    const steps = [{
      cap: `The coefficient must be at least 1 and less than 10. <b>${aS}</b> is ${tooBig ? '<b>too big</b> (10 or more)' : '<b>too small</b> (less than 1)'}, so ${tex(sciT(aS, n))} is <b>not</b> in scientific notation yet.`,
      run: async (c) => { row.els.forEach((el) => el.classList.add('bad')); await c.pop(mk, 380); await c.shake(mk); }
    }, {
      cap: `Move the point ${plural(kk, 'place')} <b>${dirW}</b>, to just after the first non-zero digit: ${aS} → <b>${coef2}</b>. That makes the coefficient <b>${times} times ${k > 0 ? 'smaller' : 'bigger'}</b>.`,
      run: async (c) => {
        for (let i = 0; i < kk; i++) await row.hop(c, pt, pIdx - i * Math.sign(k), -Math.sign(k), k > 0 ? '÷10' : '×10');
        row.els.forEach((el) => el.classList.remove('bad'));
        const zs = row.els.filter((_, i) => i < first || (i >= first + sig.length && i >= pIdx));
        mk.classList.remove('bad'); mk.querySelector('span').textContent = coef2;
        await Promise.all([c.anim(mk, [{ left: mk.style.left }, { left: R(Number(coef2)) + 'px' }], 700), ...zs.map((z) => c.anim(z, [{ opacity: 1 }, { opacity: 0.18 }], 400))]);
        mk.style.left = R(Number(coef2)) + 'px';
      }
    }, {
      cap: `To keep the <b>value</b> the same, the power of 10 must do the opposite: ${times} times ${k > 0 ? 'bigger' : 'smaller'}. The exponent goes <b>${k > 0 ? 'up' : 'down'} ${kk}</b>: from ${neg(n)} to <b>${neg(n2)}</b>.`,
      run: async (c) => {
        chg.textContent = (k > 0 ? '+' : '−') + kk; const r = sup.getBoundingClientRect(), s = stage.getBoundingClientRect(), z = s.width / stage.offsetWidth || 1;
        at(chg, (r.left + r.width / 2 - s.left) / z + 18, (r.top - s.top) / z - 18);
        await c.pop(chg, 360);
        sup.textContent = neg(n2); tail.classList.add('ok');
        await c.anim(sup, [{ transform: 'scale(1.6)', color: '#12805a' }, { transform: 'scale(1)', color: '#12805a' }], 450);
      }
    }, {
      cap: `Check with the exponent laws: ${tex(`${aS}=${sciT(coef2, k)}`)}, so ${tex(`${sciT(aS, n)}=${sciT(coef2, k)}\\times10^{${n}}=${sciT(coef2, n2)}`)}. Both are <b>${stdOf(sig, ae + n)}</b>.`,
      run: async (c) => {
        w1.innerHTML = K(`${sciT(aS, n)}=${coef2}\\times10^{${k}}\\times10^{${n}}=\\mathbf{${sciT(coef2, n2)}}`);
        w2.innerHTML = `Same value: both are <b>${stdOf(sig, ae + n)}</b> <b class="ok">✓</b>`; w2.classList.add('val');
        await Promise.all([c.fadeIn(w1, 400), c.fadeIn(w2, 400, { delay: 250 })]);
      }
    }];
    return steps;
  }
};

/* ============ 2. Multiply and divide: coefficients with coefficients, powers with powers ============ */
const MD = {
  hb: { a: '3.68', m: 7, op: '×', b: '8', n: 1, note: 'heartbeats in 80 years: (beats in a year) × 80', tail: ' About <b>3 billion</b> heartbeats: answer B in the warm-up.' },
  big: { a: '6', m: 4, op: '×', b: '5', n: 3 },
  tiny: { a: '2', m: -5, op: '÷', b: '8', n: 3 },
  a: { a: '2.5', m: 5, op: '×', b: '3', n: 4 }, b: { a: '6.4', m: 8, op: '÷', b: '1.6', n: 3 },
  c: { a: '4', m: -3, op: '×', b: '5', n: -6 }, d: { a: '1.2', m: -3, op: '÷', b: '4', n: 5 }
};
const muldiv = {
  title: 'Coefficients with coefficients, powers of 10 with powers of 10',
  height: 470,
  choices: [{ v: 'hb', label: 'Warm-up: heartbeats' }, { v: 'big', label: tex('(6\\times10^{4})(5\\times10^{3})') }, { v: 'tiny', label: tex('(2\\times10^{-5})\\div(8\\times10^{3})') },
    { sep: 'Example 3 check:' }, { v: 'a', label: '(a)' }, { v: 'b', label: '(b)' }, { v: 'c', label: '(c)' }, { v: 'd', label: '(d)' }],
  intro: (v) => { const p = MD[v]; return `${p.note ? 'Warm-up bridge, ' + p.note + ': ' : ''}evaluate ${tex(exprT(p))} and write the answer in scientific notation.`; },
  make(stage, v, ex) {
    const W = ex.W, p = MD[v], mul = p.op === '×';
    const cr = num(mul ? Number(p.a) * Number(p.b) : Number(p.a) / Number(p.b)), er = mul ? p.m + p.n : p.m - p.n;
    const { sig, e } = parseDec(cr), coef2 = coefOf(sig), inRange = e === 0, n2 = er + e;
    const top = add(stage, h('div', 'md-expr c', K(exprT(p, true))), W / 2, 44);
    const bwA = (W - 70) * 0.42, bwB = (W - 70) * 0.58;
    const boxA = add(stage, h('div', 'md-box coef', '<div class="md-h">Coefficients</div>'), 24, 92), boxB = add(stage, h('div', 'md-box pow', '<div class="md-h">Powers of 10</div>'), 46 + bwA, 92);
    boxA.style.width = bwA + 'px'; boxB.style.width = bwB + 'px';
    const a1 = h('div', 'md-l', K(mul ? `\\htmlClass{md-ta}{${p.a}}\\times\\htmlClass{md-tb}{${p.b}}` : `\\dfrac{\\htmlClass{md-ta}{${p.a}}}{\\htmlClass{md-tb}{${p.b}}}`)), a2 = h('div', 'md-l res', K(`=\\htmlClass{md-ra}{${cr}}`));
    const b1 = h('div', 'md-l', K(mul ? `\\htmlClass{md-tm}{10^{${p.m}}}\\times\\htmlClass{md-tn}{10^{${p.n}}}` : `\\dfrac{\\htmlClass{md-tm}{10^{${p.m}}}}{\\htmlClass{md-tn}{10^{${p.n}}}}`));
    const b2 = h('div', 'md-l res', K(`=10^{${p.m}${mul ? '+' : '-'}${par(p.n)}}=\\htmlClass{md-rb}{10^{${er}}}`));
    const law = h('div', 'md-law', mul ? '<b>Product Law</b>: add the exponents' : '<b>Quotient Law</b>: subtract the exponents');
    const rowA = h('div', 'md-row'), rowB = h('div', 'md-row'); rowA.append(a1, a2); rowB.append(b1, b2);
    boxA.append(rowA); boxB.append(rowB, law);
    hide(a1, a2, b1, b2, law);
    const comb = add(stage, h('div', 'md-comb c', K(`=\\htmlClass{md-ca}{${cr}}\\times\\htmlClass{md-cb}{10^{${er}}}`)), W / 2, 300); hide(comb);
    const chk = add(stage, h('div', 'md-chk c'), W / 2, 372); hide(chk);
    const fin = add(stage, h('div', 'md-fin c'), W / 2, 430); hide(fin);
    const q = (s) => stage.querySelector(s);
    const steps = [{
      cap: mul ? 'Multiplication can be done in any order, so <b>group</b> the <b class="sn-coef">coefficients</b> together and the <b class="sn-pow">powers of 10</b> together.'
        : 'Split the division in two: <b class="sn-coef">coefficient ÷ coefficient</b>, and <b class="sn-pow">power of 10 ÷ power of 10</b>.',
      run: async (c) => {
        top.classList.add('colored');
        const toks = ['.md-ta', '.md-tb', '.md-tm', '.md-tn'].map(q); hide(...toks); a1.style.opacity = 1; b1.style.opacity = 1;
        await Promise.all([fly(c, stage, q('.md-expr .md-ea'), toks[0], p.a, { fs: 30, cls: 'coef' }), fly(c, stage, q('.md-expr .md-eb'), toks[1], p.b, { fs: 30, cls: 'coef', delay: 120 }),
          fly(c, stage, q('.md-expr .md-em'), toks[2], `10^{${p.m}}`, { fs: 30, cls: 'pow', delay: 240 }), fly(c, stage, q('.md-expr .md-en'), toks[3], `10^{${p.n}}`, { fs: 30, cls: 'pow', delay: 360 })]);
      }
    }, {
      cap: `Coefficients: <b>${p.a} ${p.op} ${p.b} = ${cr}</b>.`,
      run: (c) => c.fadeIn(a2, 400, { from: 'translateX(-10px)' })
    }, {
      cap: mul ? `Powers of 10, <b>Product Law</b>: same base, so <b>add</b> the exponents: ${neg(p.m)} + ${parN(p.n)} = <b>${neg(er)}</b>.`
        : `Powers of 10, <b>Quotient Law</b>: same base, so <b>subtract</b> the exponents: ${neg(p.m)} − ${parN(p.n)} = <b>${neg(er)}</b>.`,
      run: (c) => Promise.all([c.fadeIn(b2, 400, { from: 'translateX(-10px)' }), c.fadeIn(law, 400, { delay: 300 })])
    }, {
      cap: `Put the two answers back together: <b>${tex(sciT(cr, er))}</b>.`,
      run: async (c) => {
        const ca = q('.md-ca'), cb = q('.md-cb'); hide(ca, cb);
        await Promise.all([c.fadeIn(comb, 300), fly(c, stage, q('.md-ra'), ca, cr, { fs: 30, cls: 'coef' }), fly(c, stage, q('.md-rb'), cb, `10^{${er}}`, { fs: 30, cls: 'pow', delay: 150 })]);
      }
    }];
    if (inRange) steps.push({
      cap: `Is ${cr} between 1 and 10? <b>Yes</b>, so ${tex(sciT(cr, er))} is already in scientific notation. <b>Done!</b>`,
      run: async (c) => { chk.innerHTML = `<b class="ok">✓</b> ${K(`1\\le${cr}\\lt10`)} &nbsp;in range`; fin.innerHTML = K(`\\mathbf{${sciT(cr, er)}}`); await c.fadeIn(chk, 350); await c.pop(fin, 420); }
    });
    else {
      steps.push({
        cap: `Is ${cr} between 1 and 10? <b>No</b>: ${cr} is ${e > 0 ? 'too big' : 'too small'}, so this isn’t scientific notation yet.`,
        run: async (c) => { chk.innerHTML = `<b class="red">✗</b> ${K(cr)} is ${e > 0 ? '10 or more' : 'less than 1'}`; await c.fadeIn(chk, 350); await c.shake(chk); }
      });
      steps.push({
        cap: `<b>Renormalize</b>: ${tex(`${cr}=${sciT(coef2, e)}`)}, so the exponent goes <b>${e > 0 ? 'up' : 'down'} ${Math.abs(e)}</b>: ${tex(`${sciT(coef2, e)}\\times10^{${er}}=${sciT(coef2, n2)}`)}.${p.tail || ''}`,
        run: async (c) => {
          chk.innerHTML = K(`${sciT(cr, er)}=${sciT(coef2, e)}\\times10^{${er}}`);
          fin.innerHTML = K(`=\\mathbf{${sciT(coef2, n2)}}`);
          await c.fadeIn(chk, 350); await c.pop(fin, 420);
        }
      });
    }
    return steps;
  }
};
function exprT(p, tagged) { // (a × 10^m)(b × 10^n) or (a × 10^m) ÷ (b × 10^n), optionally with flyable tokens
  const T = (cls, s) => (tagged ? `\\htmlClass{${cls}}{${s}}` : s);
  const A = `(${T('md-ea', p.a)}\\times${T('md-em', `10^{${p.m}}`)})`, B = `(${T('md-eb', p.b)}\\times${T('md-en', `10^{${p.n}}`)})`;
  return p.op === '×' ? A + B : `${A}\\div${B}`;
}

/* ============ 2. How long does light take? ============ */
const TRIP = {
  moon: { from: 'moon', to: 'earth', fromN: 'Moon', toN: 'Earth', d: ['3.84', 8], ms: 1280, speed: 'real time', dec: 2,
    capGo: 'This one is in <b>real time</b>: light (or a radio signal) gets from the Moon to Earth in just <b>1.28 s</b>.',
    last: '\\text{there and back: }2\\times1.28\\approx\\mathbf{2.6}\\text{ s}',
    capLast: 'A radio call to the Moon and back takes about 2 × 1.28 ≈ <b>2.6 s</b>: the pause you hear in recordings of the Moon landings.' },
  neptune: { from: 'sun', to: 'neptune', fromN: 'Sun', toN: 'Neptune', d: ['4.5', 12], ms: 6000, speed: '× 2 500 speed', dec: 0,
    capGo: 'Sped up 2 500 times: sunlight takes <b>15 000 s</b> to reach Neptune.',
    last: '15\\,000\\text{ s}\\div60=250\\text{ min}\\approx\\mathbf{4.2}\\text{ hours}',
    capLast: '15 000 ÷ 60 = 250 minutes, about <b>4.2 hours</b>. When Voyager 2 flew past Neptune, its radio messages took about 4 hours to reach us.' },
  sun: { from: 'sun', to: 'earth', fromN: 'Sun', toN: 'Earth', d: ['1.5', 11], ms: 5000, speed: '× 100 speed', dec: 0,
    capGo: 'Sped up 100 times: the light leaves the Sun and reaches Earth after <b>500 s</b>.',
    last: '500\\text{ s}\\div60\\approx\\mathbf{8.3}\\text{ minutes}',
    capLast: '500 ÷ 60 ≈ <b>8.3 minutes</b>. The sunlight on your face left the Sun about 8 minutes ago!' }
};
const light = {
  title: 'How long does light take to get here?',
  height: 470,
  choices: [{ v: 'moon', label: 'Moon → Earth' }, { v: 'neptune', label: 'Sun → Neptune' }, { sep: 'Example 4 check:' }, { v: 'sun', label: 'Sun → Earth' }],
  intro: (v) => { const t = TRIP[v]; return `Light travels about ${tex('3\\times10^{8}')} m/s. How long does it take to get from the <b>${t.fromN}</b> to <b>${t.toN}</b>?`; },
  make(stage, v, ex) {
    const W = ex.W, t = TRIP[v], [dc, de] = t.d;
    const cr = num(Number(dc) / 3), er = de - 8, { sig, e } = parseDec(cr), coef2 = coefOf(sig), n2 = er + e, secs = Number(cr) * 10 ** er;
    const space = add(stage, h('div', 'lt-space'), 0, 0); space.style.width = W + 'px';
    const rnd = (k) => { const x = Math.sin(k * 12.9898) * 43758.5453; return x - Math.floor(x); };
    for (let i = 1; i <= 46; i++) { const s = h('i', 'lt-star'); at(s, rnd(i) * W, rnd(i + 100) * 192); s.style.opacity = 0.25 + rnd(i + 200) * 0.65; if (rnd(i + 300) > 0.8) s.classList.add('b'); space.appendChild(s); }
    const BODY = { sun: { r: 74, cls: 'sun' }, earth: { r: 22, cls: 'earth' }, moon: { r: 15, cls: 'moon' }, neptune: { r: 26, cls: 'neptune' } };
    const A = BODY[t.from], B = BODY[t.to], cy = 96;
    const ax = t.from === 'sun' ? 4 : 60, bx = W - 70;
    const bodyA = add(space, h('div', 'lt-body c ' + A.cls), ax, cy), bodyB = add(space, h('div', 'lt-body c ' + B.cls), bx, cy);
    [[bodyA, A], [bodyB, B]].forEach(([el, b]) => { el.style.width = el.style.height = 2 * b.r + 'px'; });
    add(space, h('div', 'lt-name c', t.fromN), t.from === 'sun' ? 46 : ax, cy + A.r + 18 > 186 ? 178 : cy + A.r + 18);
    add(space, h('div', 'lt-name c', t.toN), bx, cy + B.r + 18);
    const x1 = ax + A.r + 8, x2 = bx - B.r - 8;
    const path = add(space, h('div', 'lt-path'), x1, cy - 1); path.style.width = (x2 - x1) + 'px';
    const trail = add(space, h('div', 'lt-trail'), x1, cy - 3); trail.style.width = '0px';
    const pulse = add(space, h('div', 'lt-pulse c'), x1, cy); hide(pulse);
    const brk = add(space, h('div', 'lt-brk'), x1, 146); brk.style.width = (x2 - x1) + 'px';
    const dLab = add(space, h('div', 'lt-dlab c', K(`d\\approx${sciT(dc, de)}\\text{ m}`)), (x1 + x2) / 2, 156);
    const sLab = add(space, h('div', 'lt-slab', `light: ${K('3\\times10^{8}\\text{ m/s}')}`), x1 + 10, 18);
    const timer = add(space, h('div', 'lt-timer', `<span class="lt-t">t = 0 s</span><span class="lt-sp">${t.speed}</span>`), W - 250, 14);
    hide(brk, dLab, sLab, timer);
    const L1 = add(stage, h('div', 'lt-work'), 30, 212), L2 = add(stage, h('div', 'lt-work'), 30, 290), L3 = add(stage, h('div', 'lt-work'), 30, 344), L4 = add(stage, h('div', 'lt-work'), 30, 398);
    hide(L1, L2, L3, L4);
    const tStr = (s) => (t.dec ? s.toFixed(t.dec) : fmt(Math.round(s)));
    const steps = [{
      cap: `The ${t.fromN} is about <b>${tex(sciT(dc, de))} m</b> from ${t.toN}. Light travels about <b>${tex('3\\times10^{8}')} m</b> every second.`,
      run: (c) => Promise.all([c.fadeIn(brk, 400), c.fadeIn(dLab, 400, { delay: 150 }), c.fadeIn(sLab, 400, { delay: 300 })])
    }, {
      cap: 'Time = distance ÷ speed: how many “one-second trips” of 3 × 10⁸ m fit into the whole distance?',
      run: (c) => { L1.innerHTML = K(`t=\\dfrac{\\text{distance}}{\\text{speed}}=\\dfrac{${sciT(dc, de)}}{3\\times10^{8}}`); return c.fadeIn(L1, 400); }
    }, {
      cap: `Divide the coefficients and <b>subtract</b> the exponents (Quotient Law): ${dc} ÷ 3 = ${cr} and ${de} − 8 = ${er}.`,
      run: (c) => { L2.innerHTML = K(`=(${dc}\\div3)\\times10^{${de}-8}=${sciT(cr, er)}`); return c.fadeIn(L2, 400); }
    }, {
      cap: e === 0 ? `${cr} is already between 1 and 10, so the time is <b>${tex(sciT(cr, er))} s</b>${er === 0 ? ` = ${cr} s (${tex('10^{0}=1')})` : ` = ${fmt(secs)} s`}.`
        : `${cr} is less than 1, so <b>renormalize</b>: ${tex(`${cr}=${sciT(coef2, e)}`)}. The time is <b>${tex(sciT(coef2, n2))} s</b>, which is ${fmt(secs)} s.`,
      run: (c) => {
        L3.innerHTML = K(e === 0 ? `=\\mathbf{${sciT(cr, er)}}\\text{ s}=${er === 0 ? cr : stdT(sig, n2)}\\text{ s}` : `=${sciT(coef2, e)}\\times10^{${er}}=\\mathbf{${sciT(coef2, n2)}}\\text{ s}=${stdT(sig, n2)}\\text{ s}`);
        return c.fadeIn(L3, 400);
      }
    }, {
      cap: t.capGo,
      run: async (c) => {
        timer.style.opacity = 1; const tt = timer.querySelector('.lt-t');
        const put = (f) => { const x = x1 + (x2 - x1) * f; pulse.style.left = x + 'px'; trail.style.width = (x - x1) + 'px'; tt.textContent = 't = ' + tStr(secs * f) + ' s'; };
        pulse.style.opacity = 1;
        if (c.fast) { put(1); bodyB.classList.add('lit'); return; }
        const t0 = performance.now();
        for (;;) { const f = Math.min(1, (performance.now() - t0) / t.ms); put(f); if (f >= 1) break; await c.sleep(30); }
        bodyB.classList.add('lit'); await c.pop(timer, 300);
      }
    }, {
      cap: t.capLast,
      run: (c) => { L4.innerHTML = K(t.last); return c.fadeIn(L4, 400); }
    }];
    return steps;
  }
};

/* ============ warm-up: how many heartbeats? ============ */
function mountWarmup() {
  // the heart-monitor trace: one beat every 200 units, scrolled so the spikes pass at 70 a minute
  const tr = document.getElementById('hb-trace');
  if (tr) {
    tr.setAttribute('viewBox', '0 0 2400 100');
    let d = 'M 0 60';
    for (let i = 0; i < 12; i++) { const x = i * 200; d += ` L ${x + 40} 60 Q ${x + 52} 46 ${x + 64} 60 L ${x + 80} 60 L ${x + 88} 70 L ${x + 98} 8 L ${x + 108} 88 L ${x + 116} 60 L ${x + 136} 60 Q ${x + 152} 40 ${x + 168} 60 L ${x + 200} 60`; }
    tr.appendChild(svgEl('path', { d, class: 'hb-line' }));
  }
  const warm = document.querySelector('.warm');
  if (warm && 'IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((en) => warm.classList.toggle('paused', !en.isIntersecting))).observe(warm);
  document.querySelectorAll('[data-hb]').forEach((b) => b.addEventListener('click', () => {
    const on = b.classList.toggle('shown'), v = b.querySelector('.hb-v');
    v.innerHTML = on ? `<b>${fmt(Number(b.dataset.hb))}</b>${b.dataset.sci ? '<small>' + tex(b.dataset.sci) + '</small>' : ''}` : '? beats';
    if (on) v.animate([{ opacity: 0, transform: 'scale(.7)' }, { opacity: 1, transform: 'scale(1)' }], 320);
  }));
  document.querySelectorAll('[data-wq]').forEach((b) => b.addEventListener('click', () => b.closest('.wq').classList.toggle('shown')));
  const Q3 = { sci: ['ok', '✓ = 36 800 000, and it’s in scientific notation'], eq: ['meh', '✓ = 36 800 000, but 36.8 isn’t between 1 and 10'], no: ['no', '✗ = 3 680 000: ten times too small'] };
  document.querySelectorAll('[data-q3]').forEach((b) => b.addEventListener('click', () => {
    const [cls, msg] = Q3[b.dataset.q3], on = !b.classList.contains(cls);
    b.classList.toggle(cls, on); b.querySelector('small').innerHTML = on ? msg : '&nbsp;';
    if (on) b.animate([{ transform: 'scale(1.06)' }, { transform: 'scale(1)' }], 260);
  }));
  document.querySelectorAll('[data-poll]').forEach((b) => b.addEventListener('click', () => b.closest('.poll').classList.toggle('revealed')));
  // a 15-second pulse count
  const go = document.getElementById('pulse-go'), clock = document.getElementById('pulse-clock'), msg = document.getElementById('pulse-msg');
  if (go) {
    let timer = null; const n = clock.querySelector('.pc-n');
    const reset = () => { clearInterval(timer); timer = null; clock.classList.remove('run', 'end'); };
    go.addEventListener('click', () => {
      if (timer) { reset(); n.textContent = '15'; go.textContent = 'Start the 15-second count'; return; }
      reset(); const t0 = Date.now(); clock.classList.add('run'); go.textContent = 'Stop';
      msg.innerHTML = '<b>Count the beats…</b>';
      const tick = () => {
        const left = Math.max(0, 15 - (Date.now() - t0) / 1000); n.textContent = Math.ceil(left);
        if (left <= 0) { reset(); clock.classList.add('end'); n.textContent = '0'; go.textContent = 'Again'; msg.innerHTML = '<b>Stop!</b> Multiply your count by <b>4</b>: that’s your beats per minute. (18 beats → 72 a minute.)'; }
      };
      tick(); timer = setInterval(tick, 100);
    });
  }
}

/* ============ wiring ============ */
function mountExplainers() {
  const defs = { hops, zoom, renorm, muldiv, light };
  document.querySelectorAll('[data-explainer]').forEach((el) => new Explainer(el, defs[el.dataset.explainer]));
}

mountExplainers(); mountWarmup();
