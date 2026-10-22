/* Math 10C · Day One — Welcome to Math 10C (u1l0): the course introduction (no assignment).
 *   warm-up   — the ten units as tiles (tap to open: lessons and outcomes), built from the course catalog
 *   outline   — the course outline with this class's unit test dates (and the teacher's exams) from the class calendar,
 *               when the page is opened with ?class=<block>; without one, the units and lesson counts
 *   QR        — the class link (the class code comes with the calendar), else the site
 *   medals    — the seven levels of one outcome's medal, spinning (js/medals.js); tap one for the viewer
 * Explainers:
 *   pathways  — Math 10C opens the -1 and -2 routes; the -3 route; 100 credits and a 20-level math to graduate
 *   period    — a class from bell to bell: arrive, warm-up + attendance, lesson, practice, exit slip
 *   grade     — 18 outcomes → indicators (bands) → a unit test's B/P/M boxes → an indicator → the unit grade
 *   testmode  — a test pops up full screen; your own numbers; leaving locks it; ends with class; results when released
 *   retest    — finish the practice → Request retest → in class → best counts → another needs the extra practice */
import { h, tex, add, box, svgEl, Flowchart, mountExplainers, pop, fadeIn, appear, anim, sleep, pulse } from '../blocks.js';

const HW = window.HW || {};
const $ = (id) => document.getElementById(id);
const T = (s) => tex(String(s));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const hide = (...els) => els.forEach((e) => { e.style.opacity = 0; });
const fadeOut = (c, el, ms = 300) => anim(c, el, [{ opacity: 1 }, { opacity: 0 }], ms);
const CAT = (HW.CATALOG || []);
const unitStyle = (u) => (HW.unitStyle ? HW.unitStyle(u) : '');
const lessonsOf = (u) => u.lessons.filter((c) => !c.intro);
const outsOf = (u) => String(u.outcomes || '').split(/\s*·\s*/).filter(Boolean);

/* ================= warm-up: the ten units ================= */
(function units() {
  const host = $('u1l0-units'); if (!host) return;
  const tiles = CAT.map((u) => {
    const b = h('button', 'u1l0-unit', `<span class="u1l0-un">${u.unit}</span><span class="u1l0-ut">${esc(u.title)}</span><span class="u1l0-ud"><b>${lessonsOf(u).length} lessons</b> · ${outsOf(u).join(' · ')}</span>`);
    b.type = 'button'; b.setAttribute('style', unitStyle(u.unit)); b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', () => { const o = !b.classList.contains('open'); b.classList.toggle('open', o); b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    host.appendChild(b); return b;
  });
  const set = (o) => tiles.forEach((b) => { b.classList.toggle('open', o); b.setAttribute('aria-expanded', o ? 'true' : 'false'); });
  $('u1l0-openall')?.addEventListener('click', () => set(true));
  $('u1l0-closeall')?.addEventListener('click', () => set(false));
})();

/* ================= this class: calendar, class code (?class=B) ================= */
const BLOCK = (() => { const v = (new URLSearchParams(location.search).get('class') || '').toUpperCase(); return /^[A-D]$/.test(v) ? v : ''; })();
const SITE = new URL('../../../', location.href).href;
function jsonp(params, ms = 12000) {
  const url = (window.HW_CONFIG || {}).backend; if (!url) return Promise.reject(new Error('no backend'));
  return new Promise((res, rej) => {
    const name = '__u1l0cb' + Date.now() + Math.floor(Math.random() * 1e4), s = document.createElement('script');
    const done = () => { delete window[name]; s.remove(); clearTimeout(t); };
    const t = setTimeout(() => { done(); rej(new Error('timeout')); }, ms);
    window[name] = (d) => { done(); res(d); };
    s.onerror = () => { done(); rej(new Error('network')); };
    s.src = url + '?' + new URLSearchParams(Object.assign({}, params, { callback: name })).toString();
    document.head.appendChild(s);
  });
}
function drawOutline(cal, noSchool) {
  const host = $('u1l0-outline'); if (!host) return;
  host.innerHTML = '';
  const C = HW.Cal, L = cal && C ? C.layout(cal, noSchool) : null, today = C ? C.today() : '';
  CAT.forEach((u) => {
    const d = L ? L.dateOf['t' + u.unit] : null;
    const row = h('div', 'u1l0-ou' + (d && d < today ? ' past' : ''), `<span class="u1l0-un">${u.unit}</span><div><div class="u1l0-ot">${esc(u.title)}</div><div class="u1l0-oo">${lessonsOf(u).length} lessons · ${outsOf(u).join(' · ')}</div></div>` +
      `<div class="u1l0-od">${d ? 'Unit test<b>' + esc(C.nice(d, { weekday: 'short', month: 'short', day: 'numeric' })) + '</b>' : 'Unit test<b>on the calendar</b>'}</div>`);
    row.setAttribute('style', unitStyle(u.unit)); host.appendChild(row);
  });
  (cal && cal.events || []).filter((e) => e.kind === 'exam').sort((a, b) => (a.date < b.date ? -1 : 1)).forEach((e) => {
    host.appendChild(h('div', 'u1l0-ev', `<b>${esc(e.title || 'Exam')}</b><span>${esc(C.nice(e.date, { weekday: 'long', month: 'long', day: 'numeric' }))}</span>`));
  });
  const note = $('u1l0-cnote');
  if (note) note.textContent = L ? 'Unit test dates for ' + (BLOCK ? 'Block ' + BLOCK : 'our class') : '10 units · 79 lessons · a unit test after each unit';
  const first = $('u1l0-first');
  if (first && L) { const d1 = L.dateOf.u1l0 || cal.start; first.innerHTML = 'Day one: <b>' + esc(C.nice(d1, { weekday: 'long', month: 'long', day: 'numeric' })) + '</b>'; }
}
function drawQR(code) {
  const host = $('u1l0-qr'), url = SITE + (code ? '?class=' + encodeURIComponent(code) : '');
  if (host) { try { const q = window.qrcode(0, 'M'); q.addData(url); q.make(); host.innerHTML = q.createSvgTag({ cellSize: 8, margin: 1, scalable: true }); } catch (e) { host.textContent = ''; } }
  const u = $('u1l0-url'); if (u) u.innerHTML = esc(url.replace(/^https?:\/\//, '')).replace(/\?class=(.*)$/, '?class=<b>$1</b>') + (code ? '' : '<br><span class="muted">then type our class code</span>');
}
drawOutline(null, []); drawQR('');
if (BLOCK) jsonp({ action: 'cal', block: BLOCK }).then((d) => {
  if (!d || !d.ok) return;
  if (d['class']) drawQR(d['class']);
  const cal = d.cal && HW.Cal ? HW.Cal.clean(d.cal) : null;
  if (cal) drawOutline(cal, d.noSchool || []);
}).catch(() => {});

/* ================= medals: one outcome at all seven levels ================= */
(function medals() {
  const host = $('u1l0-medals'), M = HW.Medals; if (!host || !M) return;
  const BAND = ['0–25%', '25–45%', '45–55%', '55–65%', '65–75%', '75–85%', '85–100%'];
  const list = M.TIERS.map((t, k) => ({ o: 'AN1', tier: k, src: 'one medal, seven levels' }));
  M.TIERS.forEach((t, k) => {
    const cell = h('div', 'u1l0-md'), b = h('button', 'medal-btn'); b.type = 'button'; b.setAttribute('data-tap', ''); b.title = t.metal + ' · ' + t.name;
    b.appendChild(M.slot('AN1', k)); b.addEventListener('click', () => M.open(list, k));
    cell.append(b, h('div', 'u1l0-mm', t.metal), h('div', 'u1l0-ml', t.lv + ' · ' + t.name), h('div', 'u1l0-mp', BAND[k]));
    host.appendChild(cell);
  });
})();

/* ================= what to bring: little pictures ================= */
const ICONS = {
  pencil: '<svg viewBox="0 0 92 92"><g transform="rotate(-38 46 46)"><rect x="14" y="38" width="56" height="16" rx="2" fill="#f2b632"/><rect x="14" y="38" width="56" height="5.3" fill="#f7cd62"/><path d="M70 38l14 8-14 8z" fill="#f3d7a6"/><path d="M80 43.7l4 2.3-4 2.3z" fill="#3a4254"/><rect x="6" y="38" width="10" height="16" rx="2" fill="#e88b9a"/><rect x="14" y="38" width="4" height="16" fill="#b8bcc3"/></g></svg>',
  paper: '<svg viewBox="0 0 92 92"><rect x="22" y="12" width="50" height="66" rx="4" fill="#fff" stroke="#c9c3b6" stroke-width="2.5"/><path d="M30 28h34M30 38h34M30 48h34M30 58h22" stroke="#a9c7e8" stroke-width="2.5"/><path d="M28 12v66" stroke="#e8a1a1" stroke-width="2"/><text x="52" y="72" font-size="16" font-weight="800" fill="#13807a" font-family="ui-rounded, system-ui">x²</text></svg>',
  calc: '<svg viewBox="0 0 92 92"><rect x="22" y="8" width="48" height="76" rx="7" fill="#2c3e5c"/><rect x="28" y="14" width="36" height="16" rx="2" fill="#c9d8c3"/><text x="61" y="27" font-size="11" text-anchor="end" fill="#1c2230" font-family="monospace">4.24264</text>' +
    [0, 1, 2, 3].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${28 + c * 9.5}" y="${36 + r * 11}" width="7" height="8" rx="1.5" fill="${r === 3 && c === 3 ? '#e8a01e' : '#c9ccd2'}"/>`).join('')).join('') + '</svg>',
  laptop: '<svg viewBox="0 0 92 92"><rect x="16" y="20" width="60" height="40" rx="4" fill="#1c2230"/><rect x="20" y="24" width="52" height="32" rx="1.5" fill="#e3f1ef"/><rect x="25" y="29" width="22" height="5" rx="2" fill="#13807a"/><rect x="25" y="38" width="40" height="4" rx="2" fill="#b9d8d4"/><rect x="25" y="45" width="32" height="4" rx="2" fill="#b9d8d4"/><path d="M8 64h76l-6 8H14z" fill="#c9ccd2"/></svg>',
  graph: '<svg viewBox="0 0 92 92"><rect x="24" y="4" width="44" height="84" rx="8" fill="#1c2230"/><rect x="29" y="10" width="34" height="26" rx="2" fill="#dfe8d2"/><path d="M31 32 Q40 8 48 22 T61 14" stroke="#1f5bd6" stroke-width="2" fill="none"/><path d="M29 23h34M46 10v26" stroke="#9aa69a" stroke-width="1"/>' +
    [0, 1, 2, 3, 4].map((r) => [0, 1, 2, 3].map((c) => `<rect x="${30 + c * 8.5}" y="${42 + r * 9}" width="6.5" height="6" rx="1.5" fill="${r === 0 && c < 2 ? '#e8a01e' : '#4a5468'}"/>`).join('')).join('') + '</svg>'
};
document.querySelectorAll('.u1l0-ic[data-ic]').forEach((e) => { e.innerHTML = ICONS[e.dataset.ic] || ''; });

/* ================= explainers ================= */
const node = (stage, cls, html, x, y, w, hh) => add(stage, box(h('div', 'u1l0-node ' + cls, html), w, hh), x, y);
const tag = (stage, cls, html, x, y) => add(stage, h('div', 'u1l0-tag ' + cls, html), x, y);
function arrows(stage, W, H) { const s = svgEl('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: 'position:absolute;left:0;top:0;overflow:visible' }, stage);
  const d = svgEl('defs', {}, s);
  ['#13807a', '#2563eb', '#7c3aed', '#b9b3a6'].forEach((c, i) => { const m = svgEl('marker', { id: 'u1l0-ah' + i, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, d); svgEl('path', { d: 'M0 0L10 5L0 10z', fill: c }, m); });
  return s; }
function link(svg, a, b, color, k, dash) { // from the right edge of a to the left edge of b
  const ax = a.offsetLeft + a.offsetWidth, ay = a.offsetTop + a.offsetHeight / 2, bx = b.offsetLeft, by = b.offsetTop + b.offsetHeight / 2, mx = (ax + bx) / 2;
  const p = svgEl('path', { d: `M${ax + 3} ${ay} C${mx} ${ay} ${mx} ${by} ${bx - 6} ${by}`, fill: 'none', stroke: color, 'stroke-width': 3, 'marker-end': `url(#u1l0-ah${k})`, 'stroke-dasharray': dash || null }, svg);
  return p;
}
const drawLine = (c, p, ms = 500) => { const L = p.getTotalLength ? p.getTotalLength() : 200, dash = p.getAttribute('stroke-dasharray');
  if (dash) return appear(c, p, ms);
  p.style.strokeDasharray = L; return anim(c, p, [{ strokeDashoffset: L, opacity: 1 }, { strokeDashoffset: 0, opacity: 1 }], ms); };

/* ---- pathways: where Math 10C leads ---- */
const pathways = {
  title: 'Where Math 10C leads',
  height: 460,
  minW: 735,
  intro: 'Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, k = W / 735, X = (x) => Math.round(x * k), nh = 58, y1 = 46, y2 = 190, y3 = 322, ym = (y1 + y2) / 2;
    const s = arrows(stage, W, 460);
    const g9 = node(stage, '', '<b>Math 9</b><small>last year</small>', X(4), ym, X(100), nh);
    const m10 = node(stage, 'here', '<b>Math 10C</b><small>this semester · 5 credits</small>', X(126), ym - 8, X(146), nh + 16);
    tag(stage, 'here', 'You are here', X(150), ym - 42);
    const a20 = node(stage, 'p1', '<b>Math 20-1</b>', X(312), y1, X(124), nh), a30 = node(stage, 'p1', '<b>Math 30-1</b>', X(470), y1, X(124), nh), a31 = node(stage, 'p1 opt', '<b>Math 31</b><small>optional</small>', X(620), y1, X(112), nh);
    const b20 = node(stage, 'p2', '<b>Math 20-2</b>', X(312), y2, X(124), nh), b30 = node(stage, 'p2', '<b>Math 30-2</b>', X(470), y2, X(124), nh);
    const c10 = node(stage, 'p3', '<b>Math 10-3</b>', X(126), y3, X(146), nh), c20 = node(stage, 'p3', '<b>Math 20-3</b>', X(312), y3, X(124), nh), c30 = node(stage, 'p3', '<b>Math 30-3</b>', X(470), y3, X(124), nh);
    const t1 = tag(stage, 'p1', '−1 route · pre-calculus', X(312), y1 - 32), t2 = tag(stage, 'p2', '−2 route', X(312), y2 - 32), t3 = tag(stage, 'p3', '−3 route', X(126), y3 - 32);
    const n1 = add(stage, box(h('div', 'u1l0-note', 'For programs that need <b>calculus</b>: engineering, sciences and many university programs.'), X(420)), X(312), y1 + nh + 6);
    const n2 = add(stage, box(h('div', 'u1l0-note', 'Accepted for many university, college and technical programs that <b>don’t</b> need calculus.'), X(420)), X(312), y2 + nh + 6);
    const n3 = add(stage, box(h('div', 'u1l0-note', 'Built with <b>trades and apprenticeship</b> programs. It starts at 10-3, not here.'), X(600)), X(126), y3 + nh + 6);
    const cred = add(stage, box(h('div', 'u1l0-credit', '<div class="u1l0-cbar"><div class="u1l0-cfill" style="width:5%"></div></div><div class="u1l0-clab"><b>To graduate:</b> 100 credits, including a <b>20-level math</b> (20-1, 20-2 or 20-3). Math 10C is worth <b>5</b>.</div>'), W - X(24)), X(12), 404);
    link(s, g9, m10, '#13807a', 0);
    const La = link(s, m10, a20, '#2563eb', 1), Lb = link(s, m10, b20, '#7c3aed', 2), La2 = link(s, a20, a30, '#2563eb', 1), La3 = link(s, a30, a31, '#2563eb', 1, '6 5'), Lb2 = link(s, b20, b30, '#7c3aed', 2);
    const Lc1 = link(s, c10, c20, '#b9b3a6', 3), Lc2 = link(s, c20, c30, '#b9b3a6', 3);
    hide(a20, a30, a31, b20, b30, c10, c20, c30, t1, t2, t3, n1, n2, n3, cred, La, Lb, La2, La3, Lb2, Lc1, Lc2);
    return [
      { cap: 'Math 10C is <b>one course</b> that leads to <b>two</b> routes.', run: async (c) => { await Promise.all([drawLine(c, La), drawLine(c, Lb)]); await Promise.all([pop(c, a20), pop(c, b20)]); } },
      { cap: '<b>The −1 route</b> (pre-calculus): Math 20-1, then Math 30-1. Math 31 (calculus) is an extra you can add after 30-1.',
        run: async (c) => { await fadeIn(c, t1); await drawLine(c, La2); await pop(c, a30); await drawLine(c, La3); await pop(c, a31); await fadeIn(c, n1); } },
      { cap: '<b>The −2 route:</b> Math 20-2, then Math 30-2.', run: async (c) => { await fadeIn(c, t2); await drawLine(c, Lb2); await pop(c, b30); await fadeIn(c, n2); } },
      { cap: 'There’s also a <b>−3 route</b> (10-3 → 20-3 → 30-3). It’s a different starting course.', run: async (c) => { await fadeIn(c, t3); await pop(c, c10); await drawLine(c, Lc1); await pop(c, c20); await drawLine(c, Lc2); await pop(c, c30); await fadeIn(c, n3); } },
      { cap: 'Every Alberta diploma needs <b>100 credits</b>, including a <b>20-level math</b>. This course is worth <b>5</b> of them.', run: (c) => fadeIn(c, cred) },
      { cap: 'Which route is right for you comes later. <b>This semester:</b> build the strongest foundation you can — both −1 and −2 start here.', run: (c) => pulse(c, m10, 1.08, 700) }
    ];
  }
};

/* ---- a class from bell to bell ---- */
const PER = [
  { k: 'Arrive ready', m: [0, 3], c: '#9aa0ab', t: 'Use the bathroom on the break. Get your materials out and ready to go <b>before</b> the bell.' },
  { k: 'Warm-up', m: [3, 15], c: '#c27a0e', t: 'A warm-up is on the screen (like today’s). Work on it <b>while I take attendance</b>. If the bell goes and you aren’t here, you’re marked <b>late or absent</b>.' },
  { k: 'Lesson', m: [15, 48], c: '#13807a', t: 'I teach from the lesson page and write on it. You take notes on paper — or on a lesson you printed. Some days we work in groups on the whiteboards.' },
  { k: 'Practice', m: [48, 80], c: '#1f5bd6', t: '<b>The most important part!</b> The lesson’s assignment, on our website. Ask questions — this is when I can help you most.' },
  { k: 'Exit slip', m: [80, 88], c: '#7b4fc4', t: 'Some days: a short check on today’s outcome pops up on your laptop for the last few minutes.' }
];
const period = {
  title: 'A class, bell to bell',
  height: 350,
  intro: 'Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, rw = Math.min(300, W * 0.42), rh = 56, x0 = 14, y0 = 14, tot = 88;
    const rows = PER.map((p, i) => {
      const e = add(stage, box(h('div', 'u1l0-prow', `<div class="u1l0-pn"><b>${i + 1} · ${p.k}</b><span>${p.m[0]}–${p.m[1]} min</span></div><div class="u1l0-pbar"><i style="width:${100 * (p.m[1] - p.m[0]) / tot}%;margin-left:${100 * p.m[0] / tot}%;background:${p.c}"></i></div>`), rw, rh), x0, y0 + i * (rh + 9));
      e.style.setProperty('--pc', p.c); return e;
    });
    const cx = x0 + rw + 22, cw = W - cx - 12;
    const cards = PER.map((p, i) => { const e = add(stage, box(h('div', 'u1l0-card', `<div class="u1l0-ch" style="color:${p.c}">${i + 1} · ${p.k}</div>${p.t}`), cw), cx, y0); e.style.borderColor = p.c; return e; });
    const fin = add(stage, box(h('div', 'u1l0-card', '<div class="u1l0-ch">Every class, the same shape</div>Arrive ready → warm-up while I take attendance → lesson → practice → sometimes an exit slip. About <b>88 minutes</b>, bell to bell. You always know what’s next.'), cw), cx, y0);
    hide(...cards, fin);
    const on = (i) => rows.forEach((r, j) => { r.classList.toggle('on', j === i); r.classList.toggle('done', j < i); });
    return PER.map((p, i) => ({ cap: `<b>${p.k}</b>${i === 3 ? ' — the most important part.' : '.'}`, run: async (c) => { cards.forEach((e, j) => { if (j !== i) e.style.opacity = 0; }); on(i); await pulse(c, rows[i], 1.03, 360); await fadeIn(c, cards[i]); } })).concat([
      { cap: 'Every class has the same shape.', run: async (c) => { cards.forEach((e) => (e.style.opacity = 0)); rows.forEach((r) => { r.classList.remove('on'); r.classList.add('done'); }); await fadeIn(c, fin); } }
    ]);
  }
};

/* ---- how a grade is made ---- */
const RUNG = [
  { lv: 'NM', name: 'Not meeting', band: '0–25', c: '#7a4127', how: 'less than half of Beginning' },
  { lv: 'LIM', name: 'Limited', band: '25–45', c: '#6b737c', how: 'half of Beginning' },
  { lv: 'BEG', name: 'Beginning', band: '45–55', c: '#a8642f', how: 'Beginning box secure' },
  { lv: 'EMG', name: 'Emerging', band: '55–65', c: '#7d8590', how: '+ half of Progressing' },
  { lv: 'PRG', name: 'Progressing', band: '65–75', c: '#b8860b', how: 'Progressing box secure' },
  { lv: 'ADV', name: 'Advancing', band: '75–85', c: '#4f6f8a', how: '+ half of Mastery' },
  { lv: 'MAS', name: 'Mastery', band: '85–100', c: '#13808f', how: 'Mastery box secure' }
];
const grade = {
  title: 'From outcomes to your mark',
  height: 440,
  minW: 735,
  intro: 'Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W;
    // 18 outcomes, coloured by unit
    const outs = []; CAT.forEach((u) => outsOf(u).forEach((o) => { if (!outs.some((x) => x.o === o)) outs.push({ o, u: u.unit }); }));
    const chips = outs.map((x, i) => { const e = add(stage, h('div', 'u1l0-ochip', x.o), 30 + (i % 9) * 76, 120 + Math.floor(i / 9) * 50); const st = HW.unitColor ? HW.unitColor(x.u) : { solid: '#13807a' }; e.style.background = st.solid; return e; });
    const oCap = add(stage, box(h('div', 'u1l0-note', '<b>AN</b> Algebra &amp; Number · <b>RF</b> Relations &amp; Functions · <b>M</b> Measurement. Each is a skill from the Alberta program of studies — like <b>AN3</b>: powers with integral and rational exponents.'), W - 60), 30, 236);
    // the ladder
    const lx = 14, lw = 300, rh = 44, ly = (k) => 12 + (6 - k) * (rh + 6);
    const rungs = RUNG.map((r, k) => { const e = add(stage, box(h('div', 'u1l0-rung', `<b>${r.lv}</b><span>${r.name}</span><span class="u1l0-rp">${r.band}%</span>`), lw, rh), lx, ly(k)); e.style.background = r.c; return e; });
    const hows = RUNG.map((r, k) => add(stage, h('div', 'u1l0-note', r.how), lx + lw + 10, ly(k) + 12));
    // the three boxes of one outcome on a unit test
    const bx = 470, BX = [{ t: 'Beginning', c: '#a8642f' }, { t: 'Progressing', c: '#b8860b' }, { t: 'Mastery', c: '#13808f' }];
    const boxes = BX.map((b, i) => { const e = add(stage, box(h('div', 'u1l0-boxq', `<div class="u1l0-bt" style="color:${b.c}">${b.t}</div><div class="u1l0-qs">${'<div class="u1l0-q"></div>'.repeat(4)}</div><div class="u1l0-frac">&nbsp;</div>`), 196), bx + 40, 18 + i * 112); e.style.borderColor = b.c; return e; });
    const head = add(stage, box(h('div', 'u1l0-note', '<b>AN3 on the Unit 2 test</b>'), 220), bx + 40, -2);
    const verdict = add(stage, box(h('div', 'u1l0-verdict', ''), 200), bx + 40, 356);
    const unit = add(stage, box(h('div', 'u1l0-callout', ''), W - 60), 30, 140);
    const evid = add(stage, box(h('div', 'u1l0-callout', '<b>Only work I see in class</b> is evidence. Practice at home is great for learning — your level on the website shows it — but marks come from class: practice in class, exit slips and unit tests.'), W - 60), 30, 300);
    hide(...rungs, ...hows, ...boxes, head, verdict, unit, evid);
    const fill = (i, marks) => { const qs = boxes[i].querySelectorAll('.u1l0-q'); marks.forEach((m, j) => { qs[j].className = 'u1l0-q ' + (m ? 'r' : 'w'); qs[j].textContent = m ? '✓' : '✗'; }); boxes[i].querySelector('.u1l0-frac').innerHTML = `<b>${marks.filter(Boolean).length} / 4</b> ${marks.filter(Boolean).length >= 3 ? '· secure' : marks.filter(Boolean).length >= 2 ? '· half' : '· not yet half'}`; };
    const mark = (k) => rungs.forEach((e, j) => { e.style.outline = j === k ? '4px solid #1c2230' : ''; e.style.opacity = j === k ? 1 : 0.55; });
    const setVerdict = (k, pct) => { verdict.style.background = RUNG[k].c; verdict.innerHTML = `<b>${RUNG[k].lv} · ${pct}%</b>${RUNG[k].name}`; };
    return [
      { cap: 'Math 10C has <b>18 outcomes</b> — the skills you’re assessed on.', run: async (c) => { await Promise.all(chips.map((e, i) => pop(c, e, 300, { delay: i * 30 }))); await fadeIn(c, oCap); } },
      { cap: 'For each outcome you get an <b>indicator</b>: how well you can show that skill. Each has a range of percents.',
        run: async (c) => { await Promise.all([...chips, oCap].map((e) => fadeOut(c, e, 250))); for (let k = 0; k < 7; k++) await fadeIn(c, rungs[k], 160); } },
      { cap: 'On a unit test, each outcome has <b>three boxes</b> of questions: Beginning, Progressing and Mastery. A box is <b>secure</b> at ¾ and <b>half</b> at ½.',
        run: async (c) => { await fadeIn(c, head); for (const b of boxes) await fadeIn(c, b, 250); await Promise.all(hows.map((e) => appear(c, e, 300))); } },
      { cap: 'Sam gets <b>4/4</b> Beginning and <b>3/4</b> Progressing (both secure) but only <b>1/4</b> Mastery: <b>Progressing, 70%</b>.',
        run: async (c) => { fill(0, [1, 1, 1, 1]); fill(1, [1, 1, 1, 0]); fill(2, [1, 0, 0, 0]); await Promise.all(boxes.map((b) => pulse(c, b, 1.04))); setVerdict(4, 70); mark(4); await pop(c, verdict); } },
      { cap: 'On a retest Sam gets <b>2/4</b> Mastery — half of the Mastery box: <b>Advancing, 75%</b>. The best result counts.',
        run: async (c) => { fill(2, [1, 1, 0, 0]); await pulse(c, boxes[2], 1.06); setVerdict(5, 75); mark(5); await pop(c, verdict); } },
      { cap: 'Your <b>unit grade</b> is the average of the unit’s outcomes.',
        run: async (c) => { await Promise.all([...rungs, ...hows, ...boxes, head, verdict].map((e) => fadeOut(c, e, 250))); unit.innerHTML = `Unit 1 has two outcomes. AN1 <b>70%</b> and AN2 <b>82%</b> → ${T('\\dfrac{70+82}{2}=76')} → <b>76%, Advancing</b>`; await fadeIn(c, unit); } },
      { cap: 'Where the evidence comes from.', run: (c) => fadeIn(c, evid) }
    ];
  }
};

/* ---- test mode ---- */
const testmode = {
  title: 'A test on the website',
  height: 400,
  minW: 735,
  intro: 'Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, sx = 16, sy = 26, sw = 380, sh = 250;
    const scr = add(stage, box(h('div', 'u1l0-screen'), sw, sh), sx, sy);
    add(stage, box(h('div', 'u1l0-base'), sw + 40, 16), sx - 20, sy + sh);
    const tabs = h('div', 'u1l0-tabs', '<i></i><i></i><i></i>'); scr.appendChild(tabs);
    const site = h('div', 'u1l0-test', '<div class="u1l0-th2"><span style="color:#13807a">Math 10C Practice</span><span>Hi, Sam.</span></div><div class="u1l0-qline" style="width:70%"></div><div class="u1l0-qline"></div><div class="u1l0-qline" style="width:84%"></div>');
    site.style.top = '26px'; scr.appendChild(site);
    const test = h('div', 'u1l0-test', '<div class="u1l0-th2"><span>Unit 1 Test</span><span>Sam Lee</span></div><div style="font-size:14px">1. Write 72 as a product of prime factors.</div><div class="u1l0-qline" style="width:60%;background:#fff;border:1.5px solid #d8b48a;height:26px"></div><div style="font-size:14px">2. Simplify ' + T('\\sqrt{50}') + '.</div><div class="u1l0-qline" style="width:60%;background:#fff;border:1.5px solid #d8b48a;height:26px"></div><div class="u1l0-tmr" style="font-size:13px;color:#8a5a00;justify-self:end">Ends at the end of class</div>');
    test.style.background = '#ffe7d1'; scr.appendChild(test);
    const exit = h('div', 'u1l0-test', '<div class="u1l0-th2"><span>Exit slip 1.1</span><span>Sam Lee</span></div><div style="font-size:14px">1. Is 91 prime or composite?</div>');
    exit.style.background = '#fff6c9'; scr.appendChild(exit);
    const lock = h('div', 'u1l0-lockov', '<div><b>🔒 Test locked</b>You left the test window.<br>Only Mr. Cathcart can unlock it.</div>'); scr.appendChild(lock);
    const done = h('div', 'u1l0-lockov', '<div><b>✓ Submitted</b>Results show up after<br>Mr. Cathcart releases them.</div>'); done.style.background = 'rgba(18,128,90,.9)'; scr.appendChild(done);
    const cx = sx + sw + 30, cw = W - cx - 10;
    const C = (html, y, cls = '') => add(stage, box(h('div', 'u1l0-callout ' + cls, html), cw), cx, y);
    const c1 = C('<b>Full screen</b>, on every signed-in laptop when I launch it. <b>Tests are orange</b>, exit slips are yellow.', 6);
    const c2 = C('<b>Your own numbers.</b> Your neighbour’s questions are different, and your name is on the screen.', 104);
    const c3 = C('<b>Leave the window</b> (or full screen) and your test <b>ends and locks</b>. I can unlock it — but I’ll know.', 190, 'red');
    const c4 = C('<b>A test runs until the end of class</b> unless I say otherwise. You can show or hide the timer.', 290);
    const n2 = add(stage, box(h('div', 'u1l0-ghost', 'Alex’s screen: 1. Write <b>84</b> as a product of prime factors.'), sw, 40), sx, sy + sh + 34);
    hide(test, exit, lock, done, c1, c2, c3, c4, n2);
    return [
      { cap: 'When I launch a test, it pops up <b>full screen</b> on your laptop.', run: async (c) => { await anim(c, test, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], 500); await fadeIn(c, c1); } },
      { cap: 'Your <b>own numbers</b>: copying a neighbour gets you the answer to a different question.', run: async (c) => { await fadeIn(c, c2); await fadeIn(c, n2); } },
      { cap: 'Switch tabs, open another window or leave full screen, and the test <b>locks</b>.', run: async (c) => { await appear(c, lock, 300); await fadeIn(c, c3); } },
      { cap: 'Tests end at the <b>end of class</b>, so there’s no rush to leave early.', run: async (c) => { lock.style.opacity = 0; await fadeIn(c, c4); } },
      { cap: 'When you submit, there’s no mark yet: your results show up <b>after I release them</b>, once everyone has written.', run: (c) => appear(c, done, 300) },
      { cap: 'Exit slips work the same way — they’re <b>yellow</b> and short, usually at the end of a lesson.', run: async (c) => { done.style.opacity = 0; test.style.opacity = 0; await anim(c, exit, [{ opacity: 0, transform: 'scale(.6)' }, { opacity: 1, transform: 'none' }], 450); } }
    ];
  }
};

/* ---- retests ---- */
const retest = {
  title: 'How to earn a retest',
  height: 420,
  minW: 735,
  intro: 'Press <b>Next</b>.',
  make(stage, v, ex) {
    const W = ex.W, cxL = W * 0.27, cxR = W * 0.73, w = 300;
    const F = new Flowchart(stage, { x: 0, y: 0, width: W, height: 420,
      nodes: {
        prac: { x: cxL, y: 56, w, h: 96, html: '<b>1 · Do the practice</b>every required question in the unit, without seeing the solution (saw one? redo a new version)', color: 'teal', cls: 'bk-round' },
        req: { x: cxR, y: 56, w, h: 96, html: '<b>2 · Request retest</b>the button appears on that unit on your home page', color: 'blue' },
        write: { x: cxR, y: 200, w, h: 82, html: '<b>3 · Write it in class</b>I open a retest just for you — new numbers', color: 'amber' },
        best: { x: cxL, y: 200, w, h: 82, html: '<b>4 · Your best counts</b>the higher result stays', color: 'green', cls: 'bk-round' },
        again: { x: W / 2, y: 350, w: 460, h: 82, html: '<b>Another retest?</b>first finish <b>all the extra practice</b> in that unit too', color: 'purple', cls: 'bk-dashed' }
      },
      edges: [{ from: 'prac', to: 'req' }, { from: 'req', to: 'write' }, { from: 'write', to: 'best' }, { from: 'best', to: 'again', route: 'vhv' }] });
    return [
      { cap: 'A retest is <b>earned with practice</b>. Do all the required practice for the unit without seeing the solutions. Saw one? Do a new version without it.', run: (c) => F.visit(c, 'prac') },
      { cap: 'Then <b>Request retest</b> shows up on that unit, on your home page. Tap it and the request comes to me.', run: (c) => F.go(c, 'prac', 'req').then(() => F.visit(c, 'req')) },
      { cap: 'I open your retest <b>in class</b>, while everyone else works. New numbers, same outcomes.', run: (c) => F.go(c, 'req', 'write').then(() => F.visit(c, 'write')) },
      { cap: 'Your <b>best</b> result counts. A retest can only help.', run: (c) => F.go(c, 'write', 'best').then(() => F.visit(c, 'best')) },
      { cap: 'Want <b>another</b> retest after that? Finish <b>all the extra practice</b> in the unit first.', run: (c) => F.go(c, 'best', 'again').then(() => F.visit(c, 'again')) }
    ];
  }
};

export const explainers = mountExplainers({ pathways, period, grade, testmode, retest });
