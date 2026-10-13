/* The page shell shared by every lesson: toolbar, menu, blank board, calculator, answer reveals, "more space". */
import * as Ink from './ink.js';
import { h } from './explain.js';
import * as Share from './share.js';
import { renderTex } from './tex.js';

const I = {
  pen: '<path d="M4 20l1.2-4.6L16.4 4.2a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8z"/><path d="M14.5 6l3.5 3.5"/>',
  hl: '<path d="M6 21h9"/><path d="M8.5 17.5l-2-2L15 5l4 4-10.5 8.5z"/><path d="M6.5 15.5L4 19h4l.5-1.5"/>',
  eraser: '<path d="M8 20h12"/><path d="M4.6 14.6l9.2-9.2a2 2 0 0 1 2.8 0l3 3a2 2 0 0 1 0 2.8L12 18.8H8.8z"/><path d="M9.3 9.9l5.8 5.8"/>',
  laser: '<circle cx="12" cy="12" r="2.6" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 11V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 11V6a1.5 1.5 0 0 1 3 0v7.5c0 4-2.6 7-6.3 7-2.4 0-4-1.3-5.4-3.7L3.6 13a1.4 1.4 0 0 1 2.3-1.6L8 13.5"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  board: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21l4-4 4 4"/>',
  calc: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><rect x="8" y="5.5" width="8" height="4" rx="1"/><path d="M8.5 13h0M12 13h0M15.5 13h0M8.5 16.5h0M12 16.5h0M15.5 16.5h0"/>',
  more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
  home: '<path d="M4 11l8-7 8 7"/><path d="M6 9.5V20h12V9.5"/>'
};
const icon = (k) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[k] + '</svg>';

export function boot({ key, homeHref = '../../', title = '' }) {
  const sh = Share.setup(key);
  if (window.katex) renderTex(document);
  fitLesson();
  /* ---------- toolbar ---------- */
  const tb = h('header', 'tb no-ink'); tb.id = 'tb';
  tb.innerHTML = `
    <a class="tbtn home" href="${homeHref}" title="All lessons" aria-label="All lessons">${icon('home')}</a>
    <div class="tb-title">${title}</div>
    <div class="share-badge"></div>
    <div class="tb-group tools">
      <button class="tbtn" data-tool="pen" title="Pen (P)" aria-label="Pen">${icon('pen')}</button>
      <button class="tbtn" data-tool="highlighter" title="Highlighter (H)" aria-label="Highlighter">${icon('hl')}</button>
      <button class="tbtn" data-tool="eraser" title="Eraser: touch a stroke to remove it (E)" aria-label="Eraser">${icon('eraser')}</button>
      <button class="tbtn" data-tool="laser" title="Laser pointer: ink that fades (L)" aria-label="Laser pointer">${icon('laser')}</button>
      <button class="tbtn" data-tool="hand" title="Hand: the Pencil scrolls and taps instead of writing (V)" aria-label="Hand">${icon('hand')}</button>
    </div>
    <div class="tb-group colors">
      ${Object.keys(Ink.COLORS).map((c) => `<button class="sw" data-color="${c}" style="--c:${Ink.COLORS[c]}" title="${c === 'ink' ? 'Black' : c[0].toUpperCase() + c.slice(1)} pen" aria-label="${c} pen"></button>`).join('')}
      <button class="tbtn size" title="Pen size" aria-label="Pen size"><i></i></button>
    </div>
    <div class="tb-group hist">
      <button class="tbtn" data-act="undo" title="Undo (two-finger tap)" aria-label="Undo">${icon('undo')}</button>
      <button class="tbtn" data-act="redo" title="Redo" aria-label="Redo">${icon('redo')}</button>
    </div>
    <div class="tb-group tb-right">
      <button class="tbtn wide" data-act="board" title="Blank board (B)">${icon('board')}<span>Board</span></button>
      <button class="tbtn wide" data-act="calc" title="TI-30XIIS calculator (C)">${icon('calc')}<span>Calc</span></button>
      <button class="tbtn" data-act="menu" title="More" aria-label="More">${icon('more')}</button>
    </div>`;
  document.body.prepend(tb);
  const $ = (s) => tb.querySelector(s), $$ = (s) => [...tb.querySelectorAll(s)];
  $$('[data-tool]').forEach((b) => b.addEventListener('click', () => Ink.setTool(b.dataset.tool)));
  $$('[data-color]').forEach((b) => b.addEventListener('click', () => Ink.setColor(b.dataset.color)));
  $('.size').addEventListener('click', () => { const s = Ink.state(); Ink.setSize((s.size + 1) % 3); if (s.tool !== 'pen') Ink.setTool('pen'); });
  $('[data-act=undo]').addEventListener('click', Ink.undo);
  $('[data-act=redo]').addEventListener('click', Ink.redo);
  $('[data-act=board]').addEventListener('click', () => toggleBoard());
  $('[data-act=calc]').addEventListener('click', () => calc().toggle());
  $('[data-act=menu]').addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });

  /* ---------- blank board ---------- */
  const board = h('div', 'board hidden');
  board.innerHTML = `<div class="board-sheet" data-ink="board"></div>
    <div class="board-ctl no-ink"><button class="pill" data-b="clear">Clear board</button><button class="pill dark" data-b="close">Close board ✕</button></div>`;
  document.body.appendChild(board);
  board.querySelector('[data-b=close]').onclick = () => toggleBoard(false);
  const clr = board.querySelector('[data-b=clear]');
  clr.onclick = () => { Ink.clearSurface('board'); Ink.toast('Board cleared — Undo brings it back'); };
  function toggleBoard(on) {
    const show = on == null ? board.classList.contains('hidden') : on;
    board.classList.toggle('hidden', !show); document.body.classList.toggle('board-open', show);
    $('[data-act=board]').classList.toggle('on', show);
  }

  /* ---------- menu ---------- */
  const menu = h('div', 'menu-pop hidden');
  document.body.appendChild(menu);
  function toggleMenu(force) {
    const show = force == null ? menu.classList.contains('hidden') : force;
    if (!show) { menu.classList.add('hidden'); return; }
    const s = Ink.state(), shareMenu = Share.menuSection(sh);
    const secs = [...document.querySelectorAll('[data-section]')];
    menu.innerHTML = `${shareMenu.bottom ? '' : shareMenu.html}
      <div class="mp-h">Jump to</div>
      <div class="mp-secs">${secs.map((el, i) => `<button class="mp-item" data-i="${i}">${el.dataset.section}</button>`).join('')}</div>
      <div class="mp-sep"></div>
      ${sh.readonly ? '' : `<label class="mp-item tog"><span>Laser dot when the Pencil hovers</span><input type="checkbox" data-t="hover" ${s.hover ? 'checked' : ''}><i></i></label>
      <label class="mp-item tog"><span>Finger draws too</span><input type="checkbox" data-t="finger" ${s.finger ? 'checked' : ''}><i></i></label>`}
      <button class="mp-item" data-m="answers">Show all answers</button>
      <button class="mp-item" data-m="hideanswers">Hide all answers</button>
      <button class="mp-item" data-m="print">Print / save as PDF</button>
      ${sh.readonly ? '' : `<button class="mp-item danger" data-m="clear">${sh.cls ? 'Clear all ink for ' + sh.label + '…' : 'Clear all ink on this lesson…'}</button>`}
      ${shareMenu.bottom ? shareMenu.html : ''}
      ${sh.readonly ? '' : '<div class="mp-tip">Pencil writes · finger scrolls · two-finger tap = undo.<br>Tap a button with the Pencil to press it.</div>'}`;
    menu.classList.remove('hidden');
    menu.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => { toggleMenu(false); toggleBoard(false); secs[b.dataset.i].scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    const tf = menu.querySelector('[data-t=finger]'), th = menu.querySelector('[data-t=hover]');
    if (tf) tf.onchange = (e) => Ink.setFinger(e.target.checked);
    if (th) th.onchange = (e) => Ink.setHover(e.target.checked);
    shareMenu.wire(menu, () => toggleMenu(false));
    menu.querySelector('[data-m=answers]').onclick = () => { document.querySelectorAll('.part').forEach((p) => p.classList.add('shown')); toggleMenu(false); };
    menu.querySelector('[data-m=hideanswers]').onclick = () => { document.querySelectorAll('.part').forEach((p) => p.classList.remove('shown')); toggleMenu(false); };
    menu.querySelector('[data-m=print]').onclick = () => { toggleMenu(false); Ink.flush(); setTimeout(() => print(), 50); };
    const c = menu.querySelector('[data-m=clear]');
    if (c) c.onclick = () => {
      if (!c.classList.contains('confirm')) { c.classList.add('confirm'); c.textContent = 'Tap again to clear every page of ink'; return; }
      Ink.clearAll(); toggleMenu(false); Ink.toast('Ink cleared');
    };
  }
  document.addEventListener('click', (e) => { if (!menu.classList.contains('hidden') && !menu.contains(e.target)) toggleMenu(false); });

  /* ---------- toolbar state ---------- */
  Ink.onChange((s) => {
    $$('[data-tool]').forEach((b) => b.classList.toggle('on', b.dataset.tool === s.tool));
    $$('[data-color]').forEach((b) => b.classList.toggle('on', b.dataset.color === s.color && s.tool === 'pen'));
    const sz = $('.size i'); sz.style.width = sz.style.height = [5, 8, 12][s.size] + 'px'; sz.style.background = Ink.COLORS[s.color] || '#1c2230';
    $('[data-act=undo]').disabled = !s.undo.length; $('[data-act=redo]').disabled = !s.redo.length;
    document.body.dataset.tool = s.tool;
  });

  /* ---------- keyboard (laptop) ---------- */
  addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, .calc')) return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); if (e.shiftKey) Ink.redo(); else Ink.undo(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = { p: 'pen', h: 'highlighter', e: 'eraser', l: 'laser', v: 'hand' }[e.key.toLowerCase()];
    if (k) Ink.setTool(k); else if (e.key === 'b') toggleBoard(); else if (e.key === 'c') calc().toggle(); else if (e.key === 'Escape') { toggleBoard(false); toggleMenu(false); }
  });

  /* ---------- answers + more space ---------- */
  document.querySelectorAll('.part').forEach((p) => {
    const b = p.querySelector('.reveal'); if (b) b.addEventListener('click', () => p.classList.toggle('shown'));
  });
  document.querySelectorAll('[data-more]').forEach((b) => {
    const target = document.getElementById(b.dataset.more);
    b.addEventListener('click', () => { const cur = parseFloat(getComputedStyle(target).minHeight) || target.offsetHeight; target.style.minHeight = (cur + 260) + 'px'; saveSpace(); Ink.emitOp({ a: 'space', id: target.id, h: target.style.minHeight }); });
  });
  const spaceKey = 'space:' + sh.inkKey;
  function saveSpace() { const o = {}; document.querySelectorAll('[data-more]').forEach((b) => { const t = document.getElementById(b.dataset.more); if (t.style.minHeight) o[t.id] = t.style.minHeight; }); try { localStorage.setItem(spaceKey, JSON.stringify(o)); } catch (e) { /* ignore */ } }
  if (!sh.readonly) try { const o = JSON.parse(localStorage.getItem(spaceKey) || '{}'); for (const id in o) { const t = document.getElementById(id); if (t) t.style.minHeight = o[id]; } } catch (e) { /* ignore */ }

  /* ---------- calculator demos ---------- */
  document.querySelectorAll('[data-keys]').forEach((b) => b.addEventListener('click', () => calcDemo(b.dataset.keys)));

  Ink.init(sh.inkKey, { readonly: sh.readonly });
  Share.start(sh, $('.share-badge'));
}

/* The lesson is always laid out 1080 px wide and scaled down to fit narrower screens, like a PDF page. That keeps
 * ink lined up with the content on every device — the teacher's iPad in either orientation and students' phones. */
const LESSON_W = 1080;
function fitLesson() {
  const lesson = document.querySelector('.lesson'); if (!lesson) return;
  const wrap = h('div', 'fit'); lesson.parentNode.insertBefore(wrap, lesson); wrap.appendChild(lesson);
  const fit = () => {
    const s = Math.min(1, document.documentElement.clientWidth / LESSON_W);
    lesson.style.transform = s < 1 ? 'scale(' + s + ')' : '';
    wrap.style.height = Math.ceil(lesson.offsetHeight * s) + 'px';
  };
  new ResizeObserver(fit).observe(lesson); addEventListener('resize', fit); fit();
}

/* ---------- calculator ---------- */
let C = null, scale = 1;
const SCALES = [1, 1.25, 1.5];
function calc() {
  if (C) return C;
  C = window.HW.Calc.get();
  const head = C.node.querySelector('.calc-head'), tools = h('div', 'calc-tools');
  const big = h('button', 'calc-size', 'Size'); big.type = 'button'; big.title = 'Make the calculator bigger or smaller';
  big.addEventListener('pointerdown', (e) => e.stopPropagation());
  big.onclick = () => { scale = SCALES[(SCALES.indexOf(scale) + 1) % SCALES.length]; try { localStorage.setItem('calc:scale', scale); } catch (e) { /* ignore */ } place(true); };
  tools.appendChild(big); head.insertBefore(tools, head.querySelector('.calc-close'));
  try { scale = Number(localStorage.getItem('calc:scale')) || 1; } catch (e) { scale = 1; }
  if (SCALES.indexOf(scale) < 0) scale = 1;
  const show = C.show;
  C.show = function () { show(); place(true); };
  addEventListener('resize', () => { if (C.isOpen()) place(true); });
  return C;
}
function place(keep) {
  const box = C.node; box.style.transform = 'scale(' + scale + ')';
  const w = box.offsetWidth * scale, ht = box.offsetHeight * scale;
  let x = parseFloat(box.style.left), y = parseFloat(box.style.top);
  if (!keep || isNaN(x)) { x = innerWidth - w - 18; y = innerHeight - ht - 18; }
  x = Math.max(4, Math.min(innerWidth - w - 4, x)); y = Math.max(62, Math.min(innerHeight - ht - 4, y));
  box.style.left = x + 'px'; box.style.top = y + 'px'; box.style.right = 'auto'; box.style.bottom = 'auto';
}
const KEYMAP = { '÷': 'div', '×': 'mul', '+': 'add', '−': 'sub', '-': 'sub', '^': 'pow', '(': 'lp', ')': 'rp', '=': 'enter', ENTER: 'enter', '√': '2nd sqrt', 'ˣ√': '2nd root', 'x²': 'sq', 'x³': '2nd cube', 'x⁻¹': 'inv', 'π': 'pi', CLEAR: 'clear', '(−)': 'neg', 'F◂▸D': 'fd', 'ab/c': 'frac', 'd/e': '2nd mixed', EE: 'ee' };
let demoGen = 0;
export async function calcDemo(spec) {
  const c = calc(); if (!c.isOpen()) c.show();
  const g = ++demoGen, toks = spec.trim().split(/\s+/), box = c.node;
  let cap = box.querySelector('.calc-demo-cap'); if (!cap) { cap = h('div', 'calc-demo-cap'); box.appendChild(cap); }
  c.calc.press('clear'); c.calc.press('clear'); c.calc.second = false; c.calc.menu = null; c.render(); // twice: the first only dismisses an error
  const label = (t) => (t === '=' ? 'ENTER' : t === '√' ? '2nd x² (√)' : t === 'ˣ√' ? '2nd ^ (ˣ√)' : t === 'x³' ? '2nd |x| (x³)' : t);
  for (let i = 0; i < toks.length; i++) {
    if (g !== demoGen) return;
    const t = toks[i];
    cap.innerHTML = '<span>' + toks.map((x, j) => (j === i ? '<u>' + label(x) + '</u>' : label(x))).join(' ') + '</span>';
    const acts = (KEYMAP[t] || (/^[0-9.]$/.test(t) ? t : t.split('').join(' '))).split(' ');
    for (const a of acts) {
      if (g !== demoGen) return;
      const key = a === '2nd' ? box.querySelector('[data-a="second"]') : box.querySelector('[data-a="' + a + '"]') || box.querySelector('[data-b="' + a + '"]');
      if (key) key.classList.add('demo');
      c.calc.press(a === '2nd' ? 'second' : a); c.render();
      await new Promise((r) => setTimeout(r, 430));
      if (key) key.classList.remove('demo');
      await new Promise((r) => setTimeout(r, 110));
    }
  }
  setTimeout(() => { if (g === demoGen) cap.innerHTML = ''; }, 2600);
}
