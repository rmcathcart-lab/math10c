/* Multiplication table: a floating 20 × 20 table opened from the icon button left of the Calculator button.
 * Pointing at a product (mouse hover, or a tap on touch screens) highlights its whole row and column, fills the two
 * headers and the product, and shows the fact in the title bar ("7 × 8 = 56"). A click or tap keeps that fact
 * highlighted after the pointer moves away; tapping it again lets it go. Drag the title bar to move the window.
 * Two toggles under the title bar:
 *   Factors — pointing at a number lights up every place that number appears in the table (and the row and column
 *             numbers that make it), and the title bar lists all of its factors ("Factors of 36: 1, 2, 3, …").
 *   Perfect squares — tints every square number; the squares on the diagonal (n × n) are filled in.
 * The toggles are remembered on this device. API: HW.Times.toggle(), HW.Times.get() → { show, hide, toggle, isOpen, node }.
 * Icon: HW.TIMES_ICON. Same file in math15 and math10c. */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {};
  var N = 20, KEY = 'hw:times:modes';
  HW.TIMES_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18M9 3v18" stroke="currentColor" stroke-width="1.6"/><path d="M12.6 12.6l5 5M17.6 12.6l-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function isSquare(v) { var s = Math.round(Math.sqrt(v)); return s * s === v; }
  function factorsOf(v) { var out = []; for (var d = 1; d <= v; d++) if (v % d === 0) out.push(d); return out; }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  function save(m) { try { localStorage.setItem(KEY, JSON.stringify(m)); } catch (e) {} }

  var UI = null;
  function build() {
    var modes = load(); modes = { fac: !!modes.fac, sq: !!modes.sq };
    var box = el('div', 'tt hidden'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Multiplication table'); box.tabIndex = -1;
    var head = el('div', 'tt-head'), fact = el('div', 'tt-fact', '');
    var close = el('button', 'tt-close', '×'); close.type = 'button'; close.title = 'Close the multiplication table'; close.setAttribute('aria-label', 'Close');
    head.appendChild(fact); head.appendChild(close);
    var bar = el('div', 'tt-modes');
    function toggleBtn(key, label, title) {
      var b = el('button', 'tt-mode', label); b.type = 'button'; b.title = title;
      b.addEventListener('click', function () { modes[key] = !modes[key]; save(modes); applyModes(); repaint(); });
      bar.appendChild(b); return b;
    }
    var facB = toggleBtn('fac', 'Factors', 'Point at a number to see everywhere it appears, and all of its factors');
    var sqB = toggleBtn('sq', 'Perfect squares', 'Highlight the perfect squares');
    var tbl = el('table', 'tt-grid'), cells = [];
    for (var r = 0; r <= N; r++) {
      var tr = el('tr'); cells.push([]);
      for (var c = 0; c <= N; c++) {
        var td = el(r === 0 || c === 0 ? 'th' : 'td', r === 0 && c === 0 ? 'tt-corner' : r === 0 ? 'tt-ch' : c === 0 ? 'tt-rh' : (isSquare(r * c) ? (r === c ? 'tt-sq tt-diag' : 'tt-sq') : ''), r === 0 && c === 0 ? '×' : r === 0 ? String(c) : c === 0 ? String(r) : String(r * c));
        td.dataset.r = r; td.dataset.c = c;
        tr.appendChild(td); cells[r].push(td);
      }
      tbl.appendChild(tr);
    }
    var scroll = el('div', 'tt-scroll'); scroll.appendChild(tbl);
    box.appendChild(head); box.appendChild(bar); box.appendChild(scroll);
    document.body.appendChild(box);

    var shown = null, pinned = null, lit = [];
    function light(node, cls) { node.classList.add(cls); lit.push([node, cls]); }
    function clear() { lit.forEach(function (x) { x[0].classList.remove(x[1]); }); lit = []; }
    function same(a, b) { return a && b && a[0] === b[0] && a[1] === b[1]; }
    function applyModes() {
      box.classList.toggle('tt-fac-on', modes.fac); box.classList.toggle('tt-sq-on', modes.sq);
      facB.setAttribute('aria-pressed', modes.fac ? 'true' : 'false'); sqB.setAttribute('aria-pressed', modes.sq ? 'true' : 'false');
    }
    function paint(rc) {
      clear(); shown = rc;
      var r, c, k;
      if (rc && modes.fac) {
        var v = rc[0] * rc[1];
        for (r = 1; r <= N; r++) if (v % r === 0 && v / r <= N) { c = v / r; light(cells[r][c], 'tt-fac'); light(cells[r][0], 'tt-on'); light(cells[0][c], 'tt-on'); }
        light(cells[rc[0]][rc[1]], 'tt-hit');
        var f = factorsOf(v);
        fact.innerHTML = 'Factors of <b class="tt-ans">' + v + '</b>: ' + f.join(', ') + (f.length === 2 ? ' <span class="tt-tag">prime</span>' : '');
      } else if (rc) {
        r = rc[0]; c = rc[1];
        for (k = 1; k <= N; k++) { light(cells[r][k], 'tt-row'); light(cells[k][c], 'tt-col'); }
        light(cells[r][0], 'tt-on'); light(cells[0][c], 'tt-on'); light(cells[r][c], 'tt-hit');
        fact.innerHTML = '<b>' + r + '</b> × <b>' + c + '</b> = <b class="tt-ans">' + r * c + '</b>' + (isSquare(r * c) ? ' <span class="tt-tag">perfect square</span>' : '');
      } else {
        fact.innerHTML = '<span class="tt-hint">' + (modes.fac ? 'Point at a number to find its factors' : 'Point at a number') + '</span>';
      }
      box.classList.toggle('tt-pinned', same(pinned, rc));
    }
    function repaint() { paint(shown); }
    function at(e) { var t = e.target.closest && e.target.closest('td'); if (!t || !tbl.contains(t)) return null; return [+t.dataset.r, +t.dataset.c]; }
    tbl.addEventListener('pointerover', function (e) { if (e.pointerType !== 'mouse') return; var rc = at(e); if (rc && !same(rc, shown)) paint(rc); });
    tbl.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') paint(pinned); });
    var lastType = 'mouse';
    tbl.addEventListener('pointerdown', function (e) { lastType = e.pointerType || 'mouse'; });
    tbl.addEventListener('click', function (e) {
      var rc = at(e); if (!rc) return;
      pinned = same(pinned, rc) ? null : rc;
      paint(pinned || (lastType === 'mouse' ? rc : null));
    });
    applyModes(); paint(null);

    close.addEventListener('click', function () { api.hide(); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); api.hide(); } });
    // drag by the title bar
    var drag = null;
    head.addEventListener('pointerdown', function (e) { if (e.target === close) return; var b = box.getBoundingClientRect(); drag = { dx: e.clientX - b.left, dy: e.clientY - b.top }; head.setPointerCapture(e.pointerId); });
    head.addEventListener('pointermove', function (e) { if (!drag) return; var x = Math.max(0, Math.min(innerWidth - box.offsetWidth, e.clientX - drag.dx)), y = Math.max(0, Math.min(innerHeight - 40, e.clientY - drag.dy)); box.style.left = x + 'px'; box.style.top = y + 'px'; box.style.right = 'auto'; box.style.bottom = 'auto'; });
    head.addEventListener('pointerup', function () { drag = null; });

    var api = {
      node: box,
      show: function () { box.classList.remove('hidden'); document.body.classList.add('tt-open'); try { box.focus({ preventScroll: true }); } catch (e) {} if (api.onToggle) api.onToggle(true); },
      hide: function () { box.classList.add('hidden'); document.body.classList.remove('tt-open'); if (api.onToggle) api.onToggle(false); },
      toggle: function () { if (box.classList.contains('hidden')) api.show(); else api.hide(); },
      isOpen: function () { return !box.classList.contains('hidden'); }
    };
    return api;
  }
  HW.Times = { get: function () { if (!UI) UI = build(); return UI; }, toggle: function () { HW.Times.get().toggle(); } };
})(window);
