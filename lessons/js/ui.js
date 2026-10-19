/* The page shell shared by every lesson: toolbar, menu, blank board, calculator, answer reveals, "more space". */
import * as Ink from './ink.js';
import { h } from './explain.js';
import * as Share from './share.js';
import { renderTex } from './tex.js';
import { wireBlocks, showAllAnswers } from './blocks.js';

const I = {
  pen: '<path d="M4 20l1.2-4.6L16.4 4.2a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8z"/><path d="M14.5 6l3.5 3.5"/>',
  // a chisel-tip marker over a yellow swipe
  hl: '<rect x="3" y="18.6" width="12" height="3.4" rx="1.2" fill="#f2c200" stroke="none"/><g transform="rotate(40 14.5 9)"><rect x="11.5" y="1" width="6" height="10.5" rx="1.4"/><path d="M11.5 11.5h6l-1.2 3.2h-3.6z"/><path d="M13.4 14.7l.4 2.3h1.4l.4-2.3"/></g>',
  eraser: '<path d="M8 20h12"/><path d="M4.6 14.6l9.2-9.2a2 2 0 0 1 2.8 0l3 3a2 2 0 0 1 0 2.8L12 18.8H8.8z"/><path d="M9.3 9.9l5.8 5.8"/>',
  laser: '<circle cx="12" cy="12" r="2.6" fill="currentColor"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>',
  hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V11"/><path d="M11 11V4.5a1.5 1.5 0 0 1 3 0V11"/><path d="M14 11V6a1.5 1.5 0 0 1 3 0v7.5c0 4-2.6 7-6.3 7-2.4 0-4-1.3-5.4-3.7L3.6 13a1.4 1.4 0 0 1 2.3-1.6L8 13.5"/>',
  undo: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo: '<path d="M15 14l5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  board: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M8 21l4-4 4 4"/>',
  // the same calculator icon as the practice site and test mode (js/calc.js HW.CALC_ICON)
  calc: '<rect x="5" y="2.5" width="14" height="19" rx="2" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="7.5" y="5" width="9" height="4" rx=".6" fill="currentColor" stroke="none" opacity=".35"/><g fill="currentColor" stroke="none"><circle cx="9" cy="12.5" r="1"/><circle cx="12" cy="12.5" r="1"/><circle cx="15" cy="12.5" r="1"/><circle cx="9" cy="15.5" r="1"/><circle cx="12" cy="15.5" r="1"/><circle cx="15" cy="15.5" r="1"/><circle cx="9" cy="18.5" r="1"/><circle cx="12" cy="18.5" r="1"/><circle cx="15" cy="18.5" r="1"/></g>',
  more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>'
};
const icon = (k) => '<svg viewBox="0 0 24 24" aria-hidden="true">' + I[k] + '</svg>';

export function boot({ key, homeHref = '../../', title = '' }) {
  const sh = Share.setup(key);
  if (window.katex) renderTex(document);
  wireBlocks(document); // polls, multiple choice, numerical response, reveals, flip cards, declarative figures (blocks.js)
  fitLesson();
  /* ---------- toolbar ---------- */
  const tb = h('header', 'tb no-ink'); tb.id = 'tb';
  tb.innerHTML = `
    <a class="tbtn home" href="${homeHref}" title="All lessons" aria-label="All lessons"><img class="home-mark" src="${homeHref}assets/icon-180.png" alt="" width="34" height="34"></a>
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
      ${Object.keys(Ink.COLORS).map((c) => `<button class="sw" data-color="${c}" style="--c:${Ink.slotColor(c)}" title="Pen colour (hold to choose another colour)" aria-label="${c} pen"></button>`).join('')}
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
  /* The toolbar and its menu live in a fixed layer (#hud) that stays the same size at the top of the screen while
   * the page is pinch-zoomed (see followZoom). A spacer keeps the lesson below the toolbar. */
  const hud = h('div', 'hud'); hud.id = 'hud'; hud.appendChild(tb);
  document.body.prepend(hud, h('div', 'tb-space'));
  followZoom(hud);
  const $ = (s) => tb.querySelector(s), $$ = (s) => [...tb.querySelectorAll(s)];
  $$('[data-tool]').forEach((b) => b.addEventListener('click', () => Ink.setTool(b.dataset.tool)));
  /* a colour: tap to use it, hold to give that slot another colour */
  $$('[data-color]').forEach((b) => {
    let timer = 0;
    const cancel = () => { clearTimeout(timer); timer = 0; };
    b.addEventListener('pointerdown', (e) => { cancel(); b._held = false; timer = setTimeout(() => { b._held = true; openPicker(b); }, 450); });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, cancel));
    b.addEventListener('contextmenu', (e) => e.preventDefault());
    b.addEventListener('click', (e) => { if (b._held) { b._held = false; e.preventDefault(); return; } Ink.setColor(b.dataset.color); });
  });
  const PALETTE = ['#1c2230', '#5b6170', '#1f5bd6', '#0891b2', '#7c3aed', '#c026d3', '#d42a2a', '#ea580c', '#b7791f', '#16884a', '#0d9488', '#65a30d', '#8b4513', '#db2777'];
  let picker = null;
  function closePicker() { if (picker) { picker.remove(); picker = null; } }
  function openPicker(btn) {
    closePicker();
    const slot = btn.dataset.color, cur = Ink.slotColor(slot), def = Ink.COLORS[slot];
    picker = h('div', 'cpick no-ink'); picker.setAttribute('role', 'dialog');
    picker.innerHTML = `<div class="cp-h">Colour for this pen</div>
      <div class="cp-grid">${PALETTE.map((c) => `<button type="button" class="cp-c${c.toLowerCase() === String(cur).toLowerCase() ? ' on' : ''}" data-c="${c}" style="--c:${c}" aria-label="${c}"></button>`).join('')}</div>
      <div class="cp-row"><label class="cp-more">More colours…<input type="color" value="${cur}"></label><button type="button" class="cp-reset"${String(cur).toLowerCase() === def ? ' disabled' : ''}><i style="--c:${def}"></i>Original</button></div>`;
    const grp = btn.parentNode; grp.appendChild(picker);
    picker.style.left = Math.max(0, btn.offsetLeft + btn.offsetWidth / 2 - 118) + 'px';
    const pick = (c) => { Ink.setSlotColor(slot, c); btn.style.setProperty('--c', Ink.slotColor(slot)); closePicker(); };
    picker.querySelectorAll('[data-c]').forEach((x) => x.addEventListener('click', (e) => { e.stopPropagation(); pick(x.dataset.c); }));
    const inp = picker.querySelector('input'); inp.addEventListener('click', (e) => e.stopPropagation()); inp.addEventListener('change', () => pick(inp.value));
    picker.querySelector('.cp-reset').addEventListener('click', (e) => { e.stopPropagation(); pick(def); });
    picker.addEventListener('click', (e) => e.stopPropagation());
  }
  document.addEventListener('pointerdown', (e) => { if (picker && !picker.contains(e.target) && !(e.target.closest && e.target.closest('[data-color]'))) closePicker(); }, true);
  addEventListener('keydown', (e) => { if (e.key === 'Escape') closePicker(); });
  $('.size').addEventListener('click', () => { const s = Ink.state(); Ink.setSize((s.size + 1) % 3); if (s.tool !== 'pen') Ink.setTool('pen'); });
  $('[data-act=undo]').addEventListener('click', Ink.undo);
  $('[data-act=redo]').addEventListener('click', Ink.redo);
  $('[data-act=board]').addEventListener('click', () => toggleBoard());
  $('[data-act=calc]').addEventListener('click', () => calc().toggle());
  $('[data-act=menu]').addEventListener('click', (e) => { e.stopPropagation(); toggleMenu(); });

  /* ---------- eraser dot ----------
   * A round eraser button that floats on the left side of the screen (in the HUD, so it stays put and the same size when
   * zoomed). Tap: erase one stroke, then back to the pen. Double-tap: the eraser stays on (tap again to turn it off).
   * Drag it anywhere; where it sits is remembered on this device. */
  const edot = h('button', 'edot no-ink'); edot.type = 'button';
  // a symmetric eraser drawn on the dot's centre (the toolbar's eraser icon has a baseline that pulls it off centre)
  edot.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-45 12 12)"><rect x="4.5" y="8.25" width="15" height="7.5" rx="2.2"/><path d="M10.5 8.25v7.5"/></g></svg>';
  edot.title = 'Eraser: tap for one stroke, double-tap to keep it on. Drag to move.';
  edot.setAttribute('aria-label', 'Eraser (tap for one stroke, double-tap to keep it on)');
  if (sh.readonly) edot.hidden = true;
  hud.appendChild(edot);
  const EK = 'ink:edot';
  let epos = (() => { try { return JSON.parse(localStorage.getItem(EK) || 'null'); } catch (e) { return null; } })() || { x: 0, y: 0.45 };
  const placeDot = () => {
    const W = hud.clientWidth || innerWidth, H = hud.clientHeight || innerHeight, d = edot.offsetWidth || 56, top = 64;
    const x = Math.max(6, Math.min(W - d - 6, 10 + epos.x * (W - d - 20))), y = Math.max(top, Math.min(H - d - 8, top + epos.y * (H - d - top - 8)));
    edot.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
  };
  placeDot(); addEventListener('resize', placeDot); if (window.visualViewport) visualViewport.addEventListener('resize', () => setTimeout(placeDot, 0));
  let drag = null, lastTap = 0, tapTimer = 0;
  edot.addEventListener('pointerdown', (e) => {
    e.preventDefault(); e.stopPropagation();
    const r = edot.getBoundingClientRect();
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false, z: (window.visualViewport && visualViewport.scale) || 1, sx: 0, sy: 0 };
    const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(edot.style.transform || ''); if (m) { drag.sx = +m[1]; drag.sy = +m[2]; }
    try { edot.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
  });
  edot.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = (e.clientX - drag.x0) * drag.z, dy = (e.clientY - drag.y0) * drag.z;
    if (!drag.moved && Math.hypot(dx, dy) < 8) return;
    drag.moved = true; edot.classList.add('dragging');
    const W = hud.clientWidth || innerWidth, H = hud.clientHeight || innerHeight, d = edot.offsetWidth || 56, top = 64;
    const x = Math.max(6, Math.min(W - d - 6, drag.sx + dx)), y = Math.max(top, Math.min(H - d - 8, drag.sy + dy));
    edot.style.transform = 'translate(' + Math.round(x) + 'px,' + Math.round(y) + 'px)';
    epos = { x: Math.max(0, Math.min(1, (x - 10) / Math.max(1, W - d - 20))), y: Math.max(0, Math.min(1, (y - top) / Math.max(1, H - d - top - 8))) };
  });
  const endDrag = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const moved = drag.moved; drag = null; edot.classList.remove('dragging');
    if (moved) { try { localStorage.setItem(EK, JSON.stringify(epos)); } catch (err) { /* ignore */ } return; }
    if (e.type === 'pointercancel') return;
    const s = Ink.state(), now = Date.now();
    if (now - lastTap < 350) { lastTap = 0; Ink.eraserLock(); return; } // double-tap
    lastTap = now;
    if (s.tool === 'eraser') Ink.eraserOff(); else Ink.eraserOnce();
  };
  edot.addEventListener('pointerup', endDrag); edot.addEventListener('pointercancel', endDrag);
  edot.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); });
  Ink.onChange((s) => { edot.classList.toggle('on', s.tool === 'eraser'); edot.classList.toggle('is-once', s.tool === 'eraser' && !!s.once); edot.classList.toggle('is-lock', s.tool === 'eraser' && !s.once); });

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
  hud.appendChild(menu);
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
      <div class="mp-item mp-zoom"><span>Page size</span><span class="mp-zbtns"><button type="button" data-z="-1" aria-label="Smaller">−</button><b>${Math.round(getPageZoom() * 100)}%</b><button type="button" data-z="1" aria-label="Bigger">+</button></span></div>
      <button class="mp-item" data-m="answers">Show all answers</button>
      <button class="mp-item" data-m="hideanswers">Hide all answers</button>
      <button class="mp-item" data-m="print">Print / save as PDF</button>
      ${sh.readonly ? '' : `<button class="mp-item danger" data-m="clear">${sh.cls ? 'Clear all ink for ' + sh.label + '…' : 'Clear all ink on this lesson…'}</button>`}
      ${shareMenu.bottom ? shareMenu.html : ''}
      ${sh.readonly ? '' : '<div class="mp-tip">Pencil writes · finger scrolls · two-finger tap = undo · hold a colour to change it.<br>Tap a button with the Pencil to press it.</div>'}`;
    menu.classList.remove('hidden');
    menu.querySelectorAll('[data-i]').forEach((b) => b.onclick = () => { toggleMenu(false); toggleBoard(false); secs[b.dataset.i].scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    const tf = menu.querySelector('[data-t=finger]'), th = menu.querySelector('[data-t=hover]');
    if (tf) tf.onchange = (e) => Ink.setFinger(e.target.checked);
    if (th) th.onchange = (e) => Ink.setHover(e.target.checked);

    shareMenu.wire(menu, () => toggleMenu(false));
    menu.querySelectorAll('[data-z]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); setPageZoom(getPageZoom() + 0.1 * Number(b.dataset.z)); menu.querySelector('.mp-zbtns b').textContent = Math.round(getPageZoom() * 100) + '%'; });
    menu.querySelector('[data-m=answers]').onclick = () => { document.querySelectorAll('.part').forEach((p) => p.classList.add('shown')); showAllAnswers(true); toggleMenu(false); };
    menu.querySelector('[data-m=hideanswers]').onclick = () => { document.querySelectorAll('.part').forEach((p) => p.classList.remove('shown')); showAllAnswers(false); toggleMenu(false); };
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
    const sz = $('.size i'); sz.style.width = sz.style.height = [5, 8, 12][s.size] + 'px'; sz.style.background = Ink.slotColor(s.color) || '#1c2230';
    $$('[data-color]').forEach((b) => b.style.setProperty('--c', Ink.slotColor(b.dataset.color)));
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
    else if (e.key === '-') setPageZoom(getPageZoom() - 0.1); else if (e.key === '=' || e.key === '+') setPageZoom(getPageZoom() + 0.1);
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

/* Pinch zoom: Safari zooms everything, fixed toolbars included, so the toolbar would grow and slide off the top of
 * the screen. visualViewport says where the zoomed-in view is; the HUD layer is moved there and shrunk by the zoom
 * so the toolbar stays put, at its normal size. While two fingers are pinching it fades out and comes back when
 * the fingers lift (Safari doesn't always run page code mid-pinch, so following it live would look jumpy). */
function followZoom(hud) {
  const vv = window.visualViewport; if (!vv) return;
  let last = '', loop = 0, until = 0, pinching = false;
  const place = () => {
    const s = vv.scale || 1, x = vv.offsetLeft, y = vv.offsetTop;
    const t = (Math.abs(s - 1) < 0.005 && Math.abs(x) < 0.5 && Math.abs(y) < 0.5) ? '' : 'translate(' + x + 'px,' + y + 'px) scale(' + (1 / s) + ')';
    // size the toolbar layer to the screen, not to the page: if Safari ever lays the page out wider than the screen
    // (and shows it zoomed out), a full-width layer scaled back up would push the right-hand buttons off the screen
    const w = Math.round(vv.width * s) + 'px', hh = Math.round(vv.height * s) + 'px';
    if (hud.style.width !== w) hud.style.width = w;
    if (hud.style.height !== hh) hud.style.height = hh;
    if (t !== last) { hud.style.transform = t; last = t; }
    document.body.classList.toggle('zoomed', s > 1.005);
  };
  const tick = () => { place(); loop = performance.now() < until ? requestAnimationFrame(tick) : 0; };
  const follow = (ms) => { until = Math.max(until, performance.now() + ms); if (!loop) loop = requestAnimationFrame(tick); };
  const fingers = (e) => [...e.touches].filter((t) => t.touchType !== 'stylus').length;
  vv.addEventListener('resize', () => { place(); follow(400); });
  vv.addEventListener('scroll', () => { place(); follow(400); });
  addEventListener('scroll', () => follow(400), { passive: true });
  document.addEventListener('touchstart', () => follow(1500), { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (fingers(e) >= 2 && !pinching) { pinching = true; hud.classList.add('pinch'); }
    follow(1500);
  }, { passive: true });
  const end = (e) => {
    if (pinching && fingers(e) === 0) { pinching = false; place(); setTimeout(() => { place(); hud.classList.remove('pinch'); }, 60); }
    follow(1800);
  };
  document.addEventListener('touchend', end, { passive: true }); document.addEventListener('touchcancel', end, { passive: true });
  place();
  // opened zoomed out (the page was wider than the screen before it was fitted, or Safari restored an old zoom):
  // nudge the viewport back to 100 %
  setTimeout(() => {
    if ((vv.scale || 1) > 0.98) return;
    const m = document.querySelector('meta[name=viewport]'); if (!m) return;
    const c = m.getAttribute('content'); m.setAttribute('content', c + ', maximum-scale=1');
    setTimeout(() => { m.setAttribute('content', c); place(); }, 300);
  }, 400);
}

/* The lesson is always laid out 1080 px wide and scaled down to fit narrower screens, like a PDF page. That keeps
 * ink lined up with the content on every device — the teacher's iPad in either orientation and students' phones. */
const LESSON_W = 1080;
/* Page size (••• menu, or − / = keys): the teacher can shrink the whole lesson below "fit to width" so a tall
 * explainer fits on the screen at once. It's a scale on top of the fit, so ink stays lined up. Saved per device. */
const ZOOMS = [1, 0.9, 0.8, 0.7, 0.6, 0.5];
let pageZoom = 1, refit = () => {};
try { const z = Number(localStorage.getItem('page:zoom')); if (ZOOMS.indexOf(z) >= 0) pageZoom = z; } catch (e) { /* ignore */ }
export function getPageZoom() { return pageZoom; }
export function setPageZoom(z) {
  z = Math.max(ZOOMS[ZOOMS.length - 1], Math.min(1, Math.round(z * 10) / 10)); if (z === pageZoom) return;
  const ratio = window.scrollY / Math.max(1, document.documentElement.scrollHeight);
  pageZoom = z; try { localStorage.setItem('page:zoom', String(z)); } catch (e) { /* ignore */ }
  refit(); window.scrollTo(0, ratio * document.documentElement.scrollHeight);
  Ink.toast('Page size ' + Math.round(z * 100) + '%');
}
function fitLesson() {
  const lesson = document.querySelector('.lesson'); if (!lesson) return;
  const wrap = h('div', 'fit'); lesson.parentNode.insertBefore(wrap, lesson); wrap.appendChild(lesson);
  const fit = () => {
    const W = document.documentElement.clientWidth, s = Math.min(1, W / LESSON_W) * pageZoom;
    const dx = Math.max(0, (W - LESSON_W * s) / 2);
    lesson.style.marginLeft = '0';
    lesson.style.transform = s < 1 || dx ? 'translateX(' + dx + 'px) scale(' + s + ')' : '';
    wrap.style.height = Math.ceil(lesson.offsetHeight * s) + 'px';
  };
  refit = fit;
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
const KEYMAP = { '÷': 'div', '×': 'mul', '+': 'add', '−': 'sub', '-': 'sub', '^': 'pow', '(': 'lp', ')': 'rp', '=': 'enter', ENTER: 'enter', '√': '2nd sqrt', 'ˣ√': '2nd root', 'x²': 'sq', 'x³': 'pow 3', 'x⁻¹': 'inv', 'π': 'pi', CLEAR: 'clear', '(−)': 'neg', 'F◂▸D': '2nd fd', 'ab/c': 'frac', 'd/e': '2nd mixed', EE: '2nd ee', '%': '2nd pct', DRG: 'drg', sin: 'sin', cos: 'cos', tan: 'tan', 'sin⁻¹': '2nd asin', 'cos⁻¹': '2nd acos', 'tan⁻¹': '2nd atan' };
let demoGen = 0;
export async function calcDemo(spec) {
  const c = calc(); if (!c.isOpen()) c.show();
  const g = ++demoGen, toks = spec.trim().split(/\s+/), box = c.node;
  let cap = box.querySelector('.calc-demo-cap'); if (!cap) { cap = h('div', 'calc-demo-cap'); box.appendChild(cap); }
  c.calc.press('clear'); c.calc.press('clear'); c.calc.second = false; c.calc.menu = null; c.render(); // twice: the first only dismisses an error
  const label = (t) => (t === '=' ? 'ENTER' : t === '√' ? '2nd x² (√)' : t === 'ˣ√' ? '2nd ^ (ˣ√)' : t === 'x³' ? '^ 3' : t === 'EE' ? '2nd x⁻¹ (EE)' : t === 'F◂▸D' ? '2nd PRB (F◂▸D)' : t === '%' ? '2nd ( (%)' : t === 'ab/c' ? 'A b/c' : t === 'd/e' ? '2nd A b/c (◂▸d/e)' : /^(sin|cos|tan)⁻¹$/.test(t) ? '2nd ' + t.slice(0, 3).toUpperCase() + ' (' + t + ')' : /^(sin|cos|tan)$/.test(t) ? t.toUpperCase() : t);
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
