/* Explainers: teacher-paced animations (Next / Back / Play) and the interactive factor tree.
 *
 * An explainer definition is { height, choices?, custom?, intro(v), make(stage, v, ex) -> steps }.
 * make() draws the starting picture and returns the steps: [{ cap: string | () => string, run: async (c) => {} }].
 * "Back" rebuilds the picture and replays the earlier steps instantly (c.fast === true), so a step only has to
 * know how to move forward. Steps animate through c.anim / c.sleep, which stop quietly if the explainer is reset.
 */

import { state as inkState } from './ink.js';
export const h = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
export const fmt = (n) => (Math.abs(n) >= 1000 ? n.toLocaleString('en-CA').replace(/,/g, '\u202f') : String(n)); // narrow no-break space thousands, like the booklet
const CANCEL = { cancelled: true };
// A step that was cut short (Back, Start over, a new number) stops with CANCEL; that's expected, not an error.
addEventListener('unhandledrejection', (e) => { if (e.reason === CANCEL) e.preventDefault(); });

/* ---------------- number helpers ---------------- */
export function factors(n) { const lo = [], hi = []; for (let d = 1; d * d <= n; d++) if (n % d === 0) { lo.push(d); if (d * d !== n) hi.unshift(n / d); } return lo.concat(hi); }
export function isPrime(n) { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; }
export function primeFactors(n) { const out = []; let m = n; for (let p = 2; p * p <= m; p++) while (m % p === 0) { out.push(p); m /= p; } if (m > 1) out.push(m); return out; }
export function primesUpTo(n) { const out = []; for (let p = 2; p <= n; p++) if (isPrime(p)) out.push(p); return out; }
export function productHTML(ps) { return ps.map(fmt).join(' × '); }
export function expHTML(ps) {
  const groups = []; ps.forEach((p) => { const g = groups[groups.length - 1]; if (g && g.p === p) g.k++; else groups.push({ p, k: 1 }); });
  return groups.map((g) => fmt(g.p) + (g.k > 1 ? '<sup>' + g.k + '</sup>' : '')).join(' × ');
}
export function decimal(q) { // 13.333… style, like reading a calculator
  if (Number.isInteger(q)) return String(q);
  const s3 = q.toFixed(3).replace(/0+$/, ''), exact = Math.abs(Number(s3) - q) < 1e-9;
  return exact ? s3 : q.toFixed(2) + '…';
}
export function balancedPair(m) { let a = 1; for (let d = 2; d * d <= m; d++) if (m % d === 0) a = d; return a > 1 ? [a, m / a] : null; }
export function quickReason(m, p) {
  const s = String(m);
  if (p === 2) return m % 2 === 0 ? 'even' : 'odd';
  if (p === 3) { const ds = s.split('').reduce((a, c) => a + Number(c), 0); return 'digits add to ' + ds; }
  if (p === 5) return /[05]$/.test(s) ? 'ends in ' + s.slice(-1) : 'doesn’t end in 0 or 5';
  return '';
}

function setStyles(el, kf) { for (const k in kf) if (k !== 'offset' && k !== 'easing' && k !== 'composite') el.style[k] = kf[k]; }

/* ---------------- the stepper ---------------- */
export class Explainer {
  constructor(host, def) {
    this.host = host; this.def = def; this.gen = 0; this.k = 0; this.running = false; this.auto = false;
    host.classList.add('ex');
    const top = h('div', 'ex-top no-ink');
    if (def.title) top.appendChild(h('div', 'ex-title', def.title));
    if (def.choices) {
      const chips = h('div', 'ex-chips'); this.chipEls = [];
      def.choices.forEach((c) => {
        if (c && c.sep) { chips.appendChild(h('span', 'ex-sep', c.sep)); return; }
        const o = typeof c === 'object' ? c : { v: c, label: fmt(c) };
        const b = h('button', 'chip', o.label); b.type = 'button'; b.onclick = () => this.choose(o.v); b.dataset.v = o.v; chips.appendChild(b); this.chipEls.push(b);
      });
      if (def.custom) {
        const f = h('form', 'ex-custom'), inp = h('input'); inp.type = 'text'; inp.inputMode = 'numeric'; inp.placeholder = 'other'; inp.setAttribute('aria-label', 'Choose your own number');
        const go = h('button', 'chip go', 'Go'); go.type = 'submit'; f.append(inp, go);
        f.onsubmit = (e) => { e.preventDefault(); const v = parseInt(inp.value.replace(/\D/g, ''), 10); const [lo, hi] = def.custom; if (v >= lo && v <= hi) { inp.blur(); this.choose(v); } else { inp.value = ''; inp.placeholder = lo + '–' + fmt(hi); } };
        chips.appendChild(f);
      }
      top.appendChild(chips);
    }
    this.stage = h('div', 'ex-stage'); this.stage.style.height = def.height + 'px';
    // the stage sits in a holder; a picture drawn for a wider stage (def.minW) is drawn at that width and scaled down
    this.hold = h('div', 'ex-hold'); this.hold.appendChild(this.stage);
    this.cap = h('div', 'ex-cap');
    const ctl = h('div', 'ex-ctl no-ink');
    const B = (cls, html, title, fn) => { const b = h('button', 'exb ' + cls, html); b.type = 'button'; b.title = title; b.setAttribute('aria-label', title); b.onclick = fn; ctl.appendChild(b); return b; };
    this.bRestart = B('restart', '<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg>', 'Start over', () => { this.stop(); this.build(0); });
    this.bBack = B('back', '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>', 'Back one step', () => { this.stop(); this.back(); });
    this.count = h('span', 'ex-count'); ctl.appendChild(this.count);
    this.bNext = B('next', 'Next <svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>', 'Next step', () => { this.stop(); this.next(); });
    this.bPlay = B('play', '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>', 'Play to the end', () => this.togglePlay());
    /* Screen-fit lessons (<main class="lesson screen">): the number chips, the caption and the controls sit in a column
     * beside the picture, so the whole explainer fits on one screen and Next stays in the same place every step. */
    if (def.side !== false && host.closest('.lesson.screen')) {
      host.classList.add('ex-side');
      const body = h('div', 'ex-body'), panel = h('div', 'ex-panel');
      const chips = top.querySelector('.ex-chips'); if (chips) panel.appendChild(chips);
      ctl.appendChild(h('span', 'ex-tapnote', def.tap === false ? '' : 'or tap the picture'));
      panel.append(this.cap, ctl); body.append(this.hold, panel);
      host.append(top, body);
    } else host.append(top, this.hold, this.cap, ctl);
    this.tapToNext();
    const first = def.choices ? def.choices.find((c) => !(c && typeof c === 'object' && c.sep)) : undefined; // skip { sep } headings
    this.value = def.value != null ? def.value : first !== undefined ? (typeof first === 'object' ? first.v : first) : null;
    this.lastW = 0;
    const ro = new ResizeObserver(() => { const w = this.hold.clientWidth; if (w && Math.abs(w - this.lastW) > 2) { const first = !this.lastW; this.lastW = w; this.fitStage(w); if (first) this.build(0); else { this.stop(); this.build(this.k); } } });
    ro.observe(this.hold);
  }
  /* A finger tap on the picture does Next (like a clicker). Not for a Pencil or mouse (they write), not while
   * "Finger draws too" is on, not on anything tappable in the picture (buttons, [data-tap]), not for a two-finger tap
   * (undo) or a scroll; an explainer whose picture is itself interactive can turn it off with tap: false. */
  tapToNext() {
    if (this.def.tap === false || !this.host.closest('.lesson.screen')) return;
    const st = this.stage, TAPPABLE = 'button, a, input, select, label, [data-tap], .no-ink';
    let t = null, n = 0;
    st.classList.add('ex-tap');
    st.addEventListener('pointerdown', (e) => {
      if (e.pointerType !== 'touch') return;
      n++; t = n === 1 && !(e.target.closest && e.target.closest(TAPPABLE)) ? { id: e.pointerId, x: e.clientX, y: e.clientY, at: Date.now() } : null;
    });
    st.addEventListener('pointermove', (e) => { if (t && e.pointerId === t.id && Math.hypot(e.clientX - t.x, e.clientY - t.y) > 12) t = null; });
    const end = (e) => {
      if (e.pointerType !== 'touch') return;
      n = Math.max(0, n - 1);
      const ok = t && e.type === 'pointerup' && e.pointerId === t.id && Date.now() - t.at < 600 && !inkState().finger;
      t = null;
      if (ok) { this.stop(); if (this.k < (this.steps || []).length) { this.next(); } else this.stage.animate([{ opacity: 1 }, { opacity: .6 }, { opacity: 1 }], 300); }
    };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
  }
  /* def.minW: the narrowest stage the picture was laid out for. A narrower holder (e.g. beside the sidebar) draws the
   * picture at minW and scales the whole stage down to fit, so nothing is cut off or overlaps. */
  fitStage(w) {
    const m = this.def.minW, st = this.stage;
    if (m && w < m - 1) { const s = w / m; st.style.width = m + 'px'; st.style.transform = 'scale(' + s + ')'; st.style.transformOrigin = '0 0'; this.hold.style.height = this.def.height * s + 'px'; this.scale = s; }
    else { st.style.width = st.style.transform = this.hold.style.height = ''; this.scale = 1; }
  }
  choose(v) { this.stop(); this.value = v; this.build(0); }
  ctx(g, fast) {
    const self = this, check = () => { if (g !== self.gen) throw CANCEL; };
    return {
      fast, W: this.W, H: this.def.height, stage: this.stage, check,
      anim(el, kf, ms = 450, o = {}) {
        check();
        if (fast || !ms) { setStyles(el, kf[kf.length - 1]); return Promise.resolve(); }
        const a = el.animate(kf, { duration: ms, delay: o.delay || 0, easing: o.easing || 'cubic-bezier(.25,.75,.3,1)', fill: 'both' });
        // If the explainer was reset or rebuilt meanwhile, stop the step here so it can't add to the new picture.
        const p = a.finished.then(() => { setStyles(el, kf[kf.length - 1]); a.cancel(); }, () => {}).then(check);
        p.catch(() => {}); return p;
      },
      sleep(ms) { check(); if (fast) return Promise.resolve(); const p = new Promise((r) => setTimeout(r, ms)).then(check); p.catch(() => {}); return p; },
      pop(el, ms = 380, o = {}) { return this.anim(el, [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.12)', offset: 0.65 }, { opacity: 1, transform: 'scale(1)' }], ms, o); },
      fadeIn(el, ms = 350, o = {}) { return this.anim(el, [{ opacity: 0, transform: o.from || 'translateY(8px)' }, { opacity: 1, transform: 'none' }], ms, o); },
      shake(el) { return this.anim(el, [{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-4px)' }, { transform: 'translateX(0)' }], 360); }
    };
  }
  async build(k) {
    this.gen++; const g = this.gen; this.running = false;
    this.stage.innerHTML = ''; this.W = this.stage.clientWidth || 900;
    if (this.chipEls) this.chipEls.forEach((b) => b.classList.toggle('on', String(b.dataset.v) === String(this.value)));
    this.steps = this.def.make(this.stage, this.value, this) || [];
    k = Math.min(k, this.steps.length);
    const c = this.ctx(g, true);
    try { for (let i = 0; i < k; i++) await this.runStep(i, c); } catch (e) { if (e !== CANCEL) throw e; return; }
    if (g !== this.gen) return;
    this.k = k; this.showCap(k ? this.capOf(k - 1) : this.intro()); this.sync();
  }
  intro() { const i = this.def.intro; return typeof i === 'function' ? i(this.value) : i || 'Press <b>Next</b> to start.'; }
  capOf(i) { const s = this.steps[i]; return s ? (s.capText || (typeof s.cap === 'function' ? s.cap() : s.cap) || '') : ''; }
  async runStep(i, c) { const s = this.steps[i]; if (typeof s.cap === 'function') s.capText = s.cap(); if (s.run) await s.run(c); }
  showCap(html) { this.cap.innerHTML = html; }
  async next() {
    if (this.k >= this.steps.length) return false;
    if (this.running) { await this.build(this.k + 1); return true; }
    const g = this.gen, i = this.k; this.running = true; this.sync();
    if (typeof this.steps[i].cap === 'function') this.steps[i].capText = this.steps[i].cap();
    this.showCap(this.capOf(i)); this.cap.animate([{ opacity: 0.2 }, { opacity: 1 }], 250);
    try { if (this.steps[i].run) await this.steps[i].run(this.ctx(g, false)); } catch (e) { if (e !== CANCEL) throw e; return false; }
    if (g !== this.gen) return false;
    this.k = i + 1; this.running = false; this.sync(); return true;
  }
  back() { if (this.running) return this.build(this.k); if (this.k > 0) this.build(this.k - 1); }
  stop() { if (this.auto) { this.auto = false; this.sync(); } }
  async togglePlay() {
    if (this.auto) { this.stop(); return; }
    if (this.k >= this.steps.length) await this.build(0);
    this.auto = true; this.sync();
    while (this.auto && this.k < this.steps.length) {
      const ok = await this.next(); if (!ok || !this.auto) break;
      const words = this.cap.textContent.split(/\s+/).length;
      await new Promise((r) => setTimeout(r, 900 + words * 170));
    }
    this.auto = false; this.sync();
  }
  sync() {
    const n = this.steps ? this.steps.length : 0;
    this.count.textContent = n ? this.k + ' / ' + n : '';
    this.bBack.disabled = this.k === 0 && !this.running; this.bNext.disabled = this.k >= n;
    this.bPlay.classList.toggle('on', this.auto);
    this.bPlay.innerHTML = this.auto ? '<svg viewBox="0 0 24 24"><path d="M7 5h3v14H7zM14 5h3v14h-3z"/></svg>' : '<svg viewBox="0 0 24 24"><path d="M7 5l12 7-12 7z"/></svg>';
    this.host.classList.toggle('ex-done', n > 0 && this.k >= n);
  }
}

/* ---------------- factor tree (tap a number to split it) ----------------
 * opts: { n, style: 'gift' | 'plain', preset: [a, b], name, onDone(primes), maxSlot } */
export class FactorTree {
  constructor(host, opts) {
    this.o = Object.assign({ style: 'plain', maxSlot: 96 }, opts);
    this.host = host; host.classList.add('ft', 'ft-' + this.o.style);
    this.box = h('div', 'ft-box'); this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); this.svg.setAttribute('class', 'ft-lines');
    this.layer = h('div', 'ft-nodes'); this.box.append(this.svg, this.layer);
    this.tray = h('div', 'ft-tray');
    const ctl = h('div', 'ft-ctl no-ink');
    const B = (label, title, fn) => { const b = h('button', 'exb', label); b.type = 'button'; b.title = title; b.onclick = fn; ctl.appendChild(b); return b; };
    B('<svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg>', 'Start over', () => this.reset());
    this.bOne = B('Split one', 'Split the next number for me', () => this.autoOne());
    this.bAll = B('Finish <svg viewBox="0 0 24 24"><path d="M5 5l7 7-7 7M12 5l7 7-7 7"/></svg>', 'Finish the whole tree', () => this.autoAll());
    host.append(this.box, this.tray, ctl);
    this.pop = null;
    this.box.addEventListener('click', (e) => { if (e.target === this.box || e.target === this.layer) this.closePop(); });
    const ro = new ResizeObserver(() => { if (this.root) this.layout(false); }); ro.observe(this.box);
    this.reset();
  }
  setN(n, preset) { this.o.n = n; this.o.preset = preset || null; this.reset(); }
  reset() {
    this.closePop(); this.busy = false; this.layer.innerHTML = ''; this.svg.innerHTML = '';
    this.root = this.mk(this.o.n, null);
    if (this.o.preset) this.split(this.root, this.o.preset[0], this.o.preset[1], true);
    this.layout(false); this.updateTray(true);
  }
  mk(v, parent) {
    const node = { v, kids: null, parent, x: 0, y: 0 };
    const prime = isPrime(v);
    node.el = h('div', 'ftn' + (prime ? ' prime' : ' open'), '<span>' + fmt(v) + '</span>' + (prime && this.o.style === 'gift' ? '<i class="lock"></i>' : ''));
    if (!prime) { node.el.setAttribute('data-tap', ''); node.el.setAttribute('role', 'button'); node.el.title = 'Split ' + v; node.el.addEventListener('click', (e) => { e.stopPropagation(); if (!node.kids) this.openPop(node); }); }
    if (fmt(v).length >= 5) node.el.classList.add('wide');
    this.layer.appendChild(node.el);
    if (parent) { node.line = document.createElementNS('http://www.w3.org/2000/svg', 'line'); this.svg.appendChild(node.line); }
    return node;
  }
  split(node, a, b, instant) {
    if (a > b) [a, b] = [b, a];
    node.kids = [this.mk(a, node), this.mk(b, node)];
    node.el.classList.remove('open'); node.el.classList.add('split'); node.el.removeAttribute('data-tap');
    node.kids.forEach((k) => { k.x = node.x; k.y = node.y; });
    if (!instant) { this.layout(true); this.updateTray(false); }
  }
  leaves(n = this.root, out = []) { if (!n.kids) out.push(n); else n.kids.forEach((k) => this.leaves(k, out)); return out; }
  depth(n = this.root) { return n.kids ? 1 + Math.max(this.depth(n.kids[0]), this.depth(n.kids[1])) : 0; }
  all(n = this.root, out = []) { out.push(n); if (n.kids) n.kids.forEach((k) => this.all(k, out)); return out; }
  layout(animate) {
    const W = this.box.clientWidth || 480, H = this.box.clientHeight || 300, leaves = this.leaves(), D = this.depth();
    const slot = Math.min(this.o.maxSlot, W / leaves.length), x0 = (W - slot * leaves.length) / 2 + slot / 2;
    this.host.classList.toggle('ft-tight', slot < 74);
    const top = 30, lh = D ? Math.min(84, (H - 60) / D) : 0;
    const place = (n, d) => { if (!n.kids) { n.tx = x0 + leaves.indexOf(n) * slot; } else { n.kids.forEach((k) => place(k, d + 1)); n.tx = (n.kids[0].tx + n.kids[1].tx) / 2; } n.ty = top + d * lh; };
    place(this.root, 0);
    const nodes = this.all(), id = this.tw = (this.tw || 0) + 1;
    if (!animate) { nodes.forEach((n) => { n.x = n.tx; n.y = n.ty; }); this.draw(1); return; }
    nodes.forEach((n) => { n.fx = n.x; n.fy = n.y; });
    const t0 = performance.now(), dur = 520;
    const tick = (now) => {
      if (id !== this.tw) return;
      const t = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - t, 3);
      nodes.forEach((n) => { n.x = n.fx + (n.tx - n.fx) * e; n.y = n.fy + (n.ty - n.fy) * e; });
      this.draw(t); if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  draw(t) {
    const half = this.o.style === 'gift' ? (this.host.classList.contains('ft-tight') ? 17 : 21) : 19;
    this.all().forEach((n) => {
      n.el.style.left = n.x + 'px'; n.el.style.top = n.y + 'px';
      if (n.line) {
        const p = n.parent; n.line.setAttribute('x1', p.x); n.line.setAttribute('y1', p.y + half); n.line.setAttribute('x2', n.x); n.line.setAttribute('y2', n.y - half);
      }
    });
  }
  openPop(node) {
    if (this.busy) return;
    this.closePop();
    const pairs = []; for (let d = 2; d * d <= node.v; d++) if (node.v % d === 0) pairs.push([d, node.v / d]);
    const pop = h('div', 'ft-pop no-ink', '<div class="ft-pop-t">' + fmt(node.v) + ' = </div>');
    const grid = h('div', 'ft-pop-g');
    pairs.forEach(([a, b]) => { const btn = h('button', 'chip', fmt(a) + ' × ' + fmt(b)); btn.type = 'button'; btn.onclick = (e) => { e.stopPropagation(); this.closePop(); this.split(node, a, b); }; grid.appendChild(btn); });
    pop.appendChild(grid); this.box.appendChild(pop);
    const W = this.box.clientWidth, pw = Math.min(300, pop.offsetWidth);
    pop.style.left = Math.max(4, Math.min(W - pw - 4, node.x - pw / 2)) + 'px'; pop.style.top = (node.y + 28) + 'px';
    this.pop = pop;
  }
  closePop() { if (this.pop) { this.pop.remove(); this.pop = null; } }
  nextOpen() { const q = [this.root]; while (q.length) { const n = q.shift(); if (!n.kids && !isPrime(n.v)) return n; if (n.kids) q.push(...n.kids); } return null; }
  autoOne() { this.closePop(); const n = this.nextOpen(); if (!n) return false; const p = balancedPair(n.v); this.split(n, p[0], p[1]); return true; }
  async autoAll() { if (this.busy) return; this.busy = true; while (this.busy && this.autoOne()) await new Promise((r) => setTimeout(r, 650)); this.busy = false; }
  primes() { return this.leaves().map((n) => n.v).sort((a, b) => a - b); }
  done() { return this.leaves().every((n) => isPrime(n.v)); }
  updateTray(instant) {
    const ps = this.primes().filter(isPrime), gift = this.o.style === 'gift', done = this.done();
    this.tray.innerHTML = '';
    const lab = h('span', 'ft-tray-l', done ? '' : (gift ? 'Sealed so far:' : 'Primes so far:'));
    if (!done) { this.tray.appendChild(lab); ps.forEach((p) => this.tray.appendChild(h('span', 'pchip', fmt(p)))); if (!ps.length) this.tray.appendChild(h('span', 'muted', 'none yet')); }
    else {
      const eq = h('div', 'ft-eq', fmt(this.o.n) + ' = ' + productHTML(ps) + (ps.length > 1 && new Set(ps).size < ps.length ? ' = <b>' + expHTML(ps) + '</b>' : ''));
      this.tray.appendChild(eq);
      if (!instant) eq.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], 400);
    }
    this.host.classList.toggle('ft-done', done);
    if (done && this.o.onDone) this.o.onDone(ps, instant);
  }
}
