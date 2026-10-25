/* "Stand Up Break!" — a whiteboard-stations question in the middle of a lesson (Building Thinking Classrooms style).
 *
 * In the lesson page:   <section class="card standup" data-ink="standup" data-section="Stand Up Break!" data-standup="u4l3"></section>
 * In the lesson module: standup('u4l3', { title, intro, levels: { BEG: (r) => ({ q, a }), PRG: …, MAS: … } })
 *   q and a are LaTeX (a can be an array of steps). r is a small random helper (int, pick, sign, chance).
 *
 * What it does
 *   - one question at a time, big for the projector, with a difficulty meter (Beginning / Progressing / Mastery);
 *     ↻ New question adds another at the chosen level and keeps the earlier ones on screen (smaller) for groups still
 *     working on them; each question can show its answer;
 *   - Timer: 2–10 minute presets, pause, +1 min, a chime at zero;
 *   - Groups: the class list (from the practice site's ledger, by the lesson's ?class=), tap anyone who's away, choose
 *     how many whiteboard stations, and get random groups shown big, one card per station; Reshuffle any time;
 *   - the Teacher Ledger can turn Stand Up Breaks off for a class (Settings → Lessons): the card is then left out.
 * Students who open the lesson link see the questions but not the timer or groups. */
import { tex } from './tex.js';
import { CONFIG } from './config.js';

const $h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } };
const LEVELS = [['BEG', 'Beginning'], ['PRG', 'Progressing'], ['MAS', 'Mastery']];
const ICON = {
  stand: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.2" r="2.2"/><path d="M12 7.5v7M12 14.5l-3.2 6.5M12 14.5l3.2 6.5M6.5 10.5l5.5-2 5.5 2"/></svg>',
  timer: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13.5" r="7.5"/><path d="M12 9.5v4l2.6 1.6M9.5 2.5h5M12 2.5v3.5"/></svg>',
  groups: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="8" r="2.6"/><circle cx="16.5" cy="8" r="2.6"/><path d="M3.5 18.5c.4-3 2.2-4.8 4.5-4.8s4.1 1.8 4.5 4.8M12 18.5c.4-3 2.2-4.8 4.5-4.8s4.1 1.8 4.5 4.8"/></svg>',
  renew: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3M19.5 4v4.5H15"/></svg>'
};

function rnd() {
  const int = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  return { int, pick: (arr) => arr[int(0, arr.length - 1)], sign: () => (Math.random() < 0.5 ? -1 : 1), chance: (p) => Math.random() < p,
    shuffle: (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = int(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; } };
}

/* ---------- the practice site's ledger (class list, the Stand Up Break setting), over JSONP like the intro lesson ---------- */
const SITE = new URL('../../../', location.href).href; // lessons/uN/lM/ → site root
let cfgP = null;
function backend() {
  if (window.HW_CONFIG) return Promise.resolve(window.HW_CONFIG.backend || '');
  if (!cfgP) cfgP = new Promise((res) => { const s = document.createElement('script'); s.src = SITE + 'js/config.js'; s.onload = () => res((window.HW_CONFIG || {}).backend || ''); s.onerror = () => res(''); document.head.appendChild(s); });
  return cfgP;
}
function jsonp(params, ms = 12000) {
  return backend().then((url) => new Promise((res, rej) => {
    if (!url) { rej(new Error('no backend')); return; }
    const name = '__su' + Date.now() + Math.floor(Math.random() * 1e4), s = document.createElement('script');
    const done = () => { delete window[name]; s.remove(); clearTimeout(t); };
    const t = setTimeout(() => { done(); rej(new Error('timeout')); }, ms);
    window[name] = (d) => { done(); res(d); };
    s.onerror = () => { done(); rej(new Error('network')); };
    s.src = url + '?' + new URLSearchParams(Object.assign({}, params, { callback: name })).toString();
    document.head.appendChild(s);
  }));
}
const BLOCK = (() => { const v = (new URLSearchParams(location.search).get('class') || '').toUpperCase(); return /^[A-D]$/.test(v) ? v : ''; })();
let classP = null;
function classInfo(block) { // { code, label, standup } for a block letter
  if (!block) return Promise.resolve(null);
  if (block === BLOCK && classP) return classP;
  const p = jsonp({ action: 'cal', block }).then((d) => (d && d.ok && d['class'] ? { code: d['class'], label: d.label || ('Block ' + block), standup: !(d.lopts && d.lopts.standup === false) } : null)).catch(() => null);
  if (block === BLOCK) classP = p;
  return p;
}
/* ======================================================================================== */
export function standup(id, def) {
  const card = document.querySelector(`[data-standup="${id}"]`); if (!card) return;
  // a student looking at the teacher's shared notes (the same rule as share.js): the questions, but no timer or class list
  const viewer = !!String(lsGet('ink:api', null) || CONFIG.inkApi || '').trim() && !lsGet('ink:teacher', null);
  const state = { level: lsGet('su:level', 'BEG'), qs: [], n: 0 };
  card.innerHTML = '';
  // --- header ---
  const head = $h('div', 'su-head');
  head.innerHTML = `<div class="su-title"><span class="su-icon">${ICON.stand}</span><div><h2>Stand Up Break!</h2><div class="su-sub">${esc(def.intro || 'Grab a marker and head to your whiteboard station.')}</div></div></div>`;
  const tools = $h('div', 'su-tools no-ink');
  if (!viewer) {
    const tb = $h('button', 'su-btn', ICON.timer + '<span>Timer</span>'); tb.type = 'button'; tb.addEventListener('click', () => timerPanel());
    const gb = $h('button', 'su-btn', ICON.groups + '<span>Groups</span>'); gb.type = 'button'; gb.addEventListener('click', () => groupsModal());
    tools.append(tb, gb);
  }
  head.appendChild(tools); card.appendChild(head);
  const timerHost = $h('div', 'su-timer no-ink'); timerHost.hidden = true; card.appendChild(timerHost);
  // --- difficulty + new question ---
  const bar = $h('div', 'su-bar no-ink');
  const seg = $h('div', 'su-seg'); seg.setAttribute('role', 'radiogroup'); seg.setAttribute('aria-label', 'Difficulty of the next question');
  LEVELS.forEach(([k, name], i) => {
    const b = $h('button', 'su-lv su-lv-' + k, `<span class="su-meter">${[0, 1, 2].map((j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</span>${name}`);
    b.type = 'button'; b.dataset.lv = k; b.setAttribute('role', 'radio');
    b.addEventListener('click', () => { state.level = k; lsSet('su:level', k); paintSeg(); });
    seg.appendChild(b);
  });
  const nb = $h('button', 'su-new', ICON.renew + '<span>New question</span>'); nb.type = 'button';
  nb.addEventListener('click', () => { addQ(state.level); });
  bar.append(seg, nb); card.appendChild(bar);
  function paintSeg() { seg.querySelectorAll('.su-lv').forEach((b) => { const on = b.dataset.lv === state.level; b.classList.toggle('on', on); b.setAttribute('aria-checked', on ? 'true' : 'false'); }); }
  paintSeg();
  // --- the questions ---
  const cur = $h('div', 'su-cur'); card.appendChild(cur);
  const earlier = $h('div', 'su-earlier'); card.appendChild(earlier);
  function levelChip(k) { const i = LEVELS.findIndex((x) => x[0] === k); return `<span class="su-chip su-lv-${k}"><span class="su-meter">${[0, 1, 2].map((j) => `<i class="${j <= i ? 'on' : ''}"></i>`).join('')}</span>${LEVELS[i][1]}</span>`; }
  function qHTML(q, big) {
    const steps = Array.isArray(q.a) ? q.a : [q.a];
    return `<div class="su-qtop"><span class="su-qn">Question ${q.n}</span>${levelChip(q.level)}<button type="button" class="su-ans-b no-ink">Answer</button></div>` +
      (q.text ? `<div class="su-qtext">${q.text}</div>` : '') +
      `<div class="su-q${big ? ' big' : ''}">${tex(q.q, true)}</div>` +
      `<div class="su-ans" hidden>${steps.map((s) => `<div>${tex(s, true)}</div>`).join('')}</div>`;
  }
  function wireAns(box) {
    const b = box.querySelector('.su-ans-b'), a = box.querySelector('.su-ans');
    b.addEventListener('click', () => { a.hidden = !a.hidden; b.textContent = a.hidden ? 'Answer' : 'Hide answer'; b.classList.toggle('on', !a.hidden); });
  }
  function addQ(level) {
    const gen = def.levels[level]; if (!gen) return;
    let q = null; for (let t = 0; t < 30 && !q; t++) { const x = gen(rnd()); if (x && !state.qs.some((o) => o.q === x.q)) q = x; }
    if (!q) q = gen(rnd());
    q.level = level; q.n = ++state.n; state.qs.push(q);
    render();
  }
  function render() {
    const last = state.qs[state.qs.length - 1];
    cur.innerHTML = qHTML(last, true); wireAns(cur);
    cur.classList.remove('su-in'); void cur.offsetWidth; cur.classList.add('su-in');
    earlier.innerHTML = '';
    const old = state.qs.slice(0, -1).reverse();
    if (old.length) {
      earlier.appendChild($h('div', 'su-earlier-h', 'Still working on an earlier one?'));
      const grid = $h('div', 'su-old-grid');
      old.forEach((q) => { const b = $h('div', 'su-old', qHTML(q, false)); wireAns(b); grid.appendChild(b); });
      earlier.appendChild(grid);
    }
  }
  addQ(state.level);

  /* ---------------- timer ---------------- */
  let T = { end: 0, left: 0, run: false, tick: 0, total: 0 };
  function timerPanel() {
    timerHost.hidden = false;
    if (T.total) return; // already set: it shows its own controls
    timerHost.innerHTML = `<div class="su-tpre"><span>How long?</span>${[2, 3, 5, 8, 10].map((m) => `<button type="button" data-m="${m}">${m} min</button>`).join('')}<button type="button" class="su-tx" aria-label="Close timer">×</button></div>`;
    timerHost.querySelectorAll('[data-m]').forEach((b) => b.addEventListener('click', () => startT(+b.dataset.m * 60)));
    timerHost.querySelector('.su-tx').addEventListener('click', () => { timerHost.hidden = true; });
  }
  function startT(sec) {
    T = { total: sec, left: sec, run: true, end: Date.now() + sec * 1000, tick: 0 };
    timerHost.innerHTML = `<div class="su-trun"><div class="su-tbar"><i></i></div><div class="su-tclock">0:00</div>
      <button type="button" data-a="pause">Pause</button><button type="button" data-a="plus">+1 min</button><button type="button" data-a="reset">Reset</button><button type="button" class="su-tx" data-a="close" aria-label="Close timer">×</button></div>`;
    timerHost.querySelectorAll('[data-a]').forEach((b) => b.addEventListener('click', () => {
      const a = b.dataset.a;
      if (a === 'pause') { if (T.run) { T.left = Math.max(0, (T.end - Date.now()) / 1000); T.run = false; b.textContent = 'Resume'; } else { T.end = Date.now() + T.left * 1000; T.run = true; b.textContent = 'Pause'; } }
      if (a === 'plus') { if (T.run) T.end += 60000; else T.left += 60; T.total += 60; timerHost.classList.remove('done'); }
      if (a === 'reset' || a === 'close') { clearInterval(T.tick); T = { total: 0 }; timerHost.classList.remove('done'); if (a === 'close') timerHost.hidden = true; else timerPanel(); return; }
      paintT();
    }));
    clearInterval(T.tick); T.tick = setInterval(paintT, 250); paintT();
  }
  function paintT() {
    if (!T.total) return;
    const left = T.run ? Math.max(0, (T.end - Date.now()) / 1000) : T.left;
    const s = Math.ceil(left), clock = timerHost.querySelector('.su-tclock'), fill = timerHost.querySelector('.su-tbar i');
    if (clock) clock.textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    if (fill) fill.style.width = (100 * left / T.total) + '%';
    if (T.run && left <= 0) { T.run = false; T.left = 0; clearInterval(T.tick); timerHost.classList.add('done'); if (clock) clock.textContent = 'Time!'; chime(); }
  }
  function chime() {
    try {
      const A = new (window.AudioContext || window.webkitAudioContext)(), t0 = A.currentTime;
      [880, 660, 880].forEach((f, i) => { const o = A.createOscillator(), g = A.createGain(); o.frequency.value = f; o.type = 'sine'; g.gain.setValueAtTime(0.0001, t0 + i * 0.28); g.gain.exponentialRampToValueAtTime(0.25, t0 + i * 0.28 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * 0.28 + 0.26); o.connect(g).connect(A.destination); o.start(t0 + i * 0.28); o.stop(t0 + i * 0.28 + 0.3); });
    } catch (e) { /* no sound */ }
  }

  /* ---------------- random groups ---------------- */
  function groupsModal() {
    const block0 = BLOCK || lsGet('su:block', '');
    const ov = $h('div', 'su-modal no-ink'); ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Whiteboard groups');
    ov.innerHTML = `<div class="su-mbox"><div class="su-mhead"><h3>Whiteboard groups</h3><button type="button" class="su-mx" aria-label="Close">×</button></div><div class="su-mbody"><div class="su-load">Loading the class list…</div></div></div>`;
    document.body.appendChild(ov);
    const close = () => { ov.remove(); document.removeEventListener('keydown', onKey); };
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    ov.querySelector('.su-mx').addEventListener('click', close);
    ov.addEventListener('click', (e) => { if (e.target === ov) close(); });
    const body = ov.querySelector('.su-mbody');
    const pickBlock = (msg) => {
      body.innerHTML = `<p class="su-msg">${msg}</p><div class="su-blocks">${['A', 'B', 'C', 'D'].map((b) => `<button type="button" data-b="${b}">Block ${b}</button>`).join('')}</div>`;
      body.querySelectorAll('[data-b]').forEach((b) => b.addEventListener('click', () => { lsSet('su:block', b.dataset.b); load(b.dataset.b); }));
    };
    function load(block) {
      body.innerHTML = '<div class="su-load">Loading the class list…</div>';
      classInfo(block).then((c) => {
        if (!c) return pickBlock('Couldn’t find a class for Block ' + block + '. Pick the block, or set it in the Teacher Ledger (Settings).');
        return jsonp({ action: 'roster', 'class': c.code }).then((d) => {
          if (!d || !d.ok || !d.names || !d.names.length) return pickBlock('No students on the class list for ' + esc(c.label) + ' yet.');
          setup(c, d.names.map((x) => x.name));
        });
      }).catch(() => pickBlock('Couldn’t reach the class list. Check the internet connection, then pick the block.'));
    }
    function setup(c, names) {
      const awayKey = 'su:away:' + c.code, nKey = 'su:stations:' + c.code;
      const today = new Date().toISOString().slice(0, 10), stored = lsGet(awayKey, {}), away = new Set(stored.d === today ? stored.list || [] : []);
      let n = lsGet(nKey, Math.max(2, Math.min(8, Math.round(names.length / 3))));
      const short = shortNames(names);
      body.innerHTML = `<div class="su-gtop"><div><b>${esc(c.label)}</b> · <span class="su-here"></span></div>
        <div class="su-step"><span>Whiteboard stations</span><button type="button" data-s="-1" aria-label="Fewer stations">−</button><b class="su-n"></b><button type="button" data-s="1" aria-label="More stations">+</button></div></div>
        <p class="su-msg">Tap anyone who’s away today.</p><div class="su-roll"></div>
        <div class="su-gacts"><button type="button" class="su-make">Make groups</button><button type="button" class="su-who" hidden>Change who’s here</button></div><div class="su-groups"></div>`;
      const roll = body.querySelector('.su-roll');
      names.forEach((nm) => {
        const b = $h('button', 'su-p' + (away.has(nm) ? ' away' : ''), esc(short[nm])); b.type = 'button'; b.title = nm;
        b.addEventListener('click', () => { if (away.has(nm)) away.delete(nm); else away.add(nm); b.classList.toggle('away'); lsSet(awayKey, { d: today, list: [...away] }); paint(); });
        roll.appendChild(b);
      });
      const paint = () => {
        const here = names.length - away.size;
        body.querySelector('.su-here').textContent = here + ' here' + (away.size ? ', ' + away.size + ' away' : '');
        body.querySelector('.su-n').textContent = n;
        const per = n ? here / n : 0;
        body.querySelector('.su-make').textContent = 'Make ' + n + ' groups' + (here ? ' (about ' + (Math.round(per * 10) / 10) + ' each)' : '');
      };
      body.querySelectorAll('[data-s]').forEach((b) => b.addEventListener('click', () => { n = Math.max(1, Math.min(16, n + +b.dataset.s)); lsSet(nKey, n); paint(); }));
      body.querySelector('.su-make').addEventListener('click', () => make());
      body.querySelector('.su-who').addEventListener('click', () => { ov.classList.remove('has-groups'); body.querySelector('.su-who').hidden = true; body.querySelector('.su-groups').innerHTML = ''; paint(); });
      function make() {
        const here = rnd().shuffle(names.filter((x) => !away.has(x))), k = Math.min(n, Math.max(1, here.length)), gs = Array.from({ length: k }, () => []);
        here.forEach((nm, i) => gs[i % k].push(nm));
        const host = body.querySelector('.su-groups');
        host.innerHTML = gs.map((g, i) => `<div class="su-g" style="animation-delay:${i * 60}ms"><div class="su-gn">Station ${i + 1}</div>${g.map((x) => `<div>${esc(short[x])}</div>`).join('')}</div>`).join('');
        body.querySelector('.su-make').textContent = 'Reshuffle';
        body.querySelector('.su-who').hidden = false;
        ov.classList.add('has-groups');
      }
      paint();
    }
    if (block0) load(block0); else pickBlock('Which class?');
  }
  function shortNames(names) { // "Ava B.": first name and last initial, with more of the last name when two would look the same
    const out = {}, split = (nm) => { const p = String(nm).trim().split(/\s+/); return [p[0], p.slice(1).join(' ')]; };
    names.forEach((nm) => {
      const [first, last] = split(nm); if (!last) { out[nm] = first; return; }
      let len = 1;
      while (len < last.length && names.some((o) => { if (o === nm) return false; const [f2, l2] = split(o); return f2 === first && l2.slice(0, len) === last.slice(0, len); })) len++;
      out[nm] = first + ' ' + last.slice(0, len) + (len < last.length ? '.' : '');
    });
    return out;
  }

  /* ---------------- the class's setting: Stand Up Breaks can be turned off in the Teacher Ledger ---------------- */
  if (BLOCK) classInfo(BLOCK).then((c) => { if (c && c.standup === false) card.remove(); });
}
