/* Multiplication table: a floating 20 × 20 table opened from the icon button beside the Calculator button.
 * Pointing at a product (mouse hover, or a tap on touch screens) highlights its whole row and column, fills the two
 * headers and the product, and shows the fact in the title bar ("7 × 8 = 56"). A click or tap keeps that fact
 * highlighted after the pointer moves away; tapping it again lets it go. Drag the title bar to move the window.
 * API: HW.Times.toggle(), HW.Times.get() → { show, hide, toggle, isOpen, node }. Icon: HW.TIMES_ICON. */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {};
  var N = 20;
  HW.TIMES_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 9h18M9 3v18" stroke="currentColor" stroke-width="1.6"/><path d="M12.6 12.6l5 5M17.6 12.6l-5 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  var UI = null;
  function build() {
    var box = el('div', 'tt hidden'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Multiplication table'); box.tabIndex = -1;
    var head = el('div', 'tt-head'), fact = el('div', 'tt-fact', '');
    var close = el('button', 'tt-close', '×'); close.type = 'button'; close.title = 'Close the multiplication table'; close.setAttribute('aria-label', 'Close');
    head.appendChild(fact); head.appendChild(close);
    var tbl = el('table', 'tt-grid'), cells = [];
    for (var r = 0; r <= N; r++) {
      var tr = el('tr'); cells.push([]);
      for (var c = 0; c <= N; c++) {
        var td = el(r === 0 || c === 0 ? 'th' : 'td', r === 0 && c === 0 ? 'tt-corner' : r === 0 ? 'tt-ch' : c === 0 ? 'tt-rh' : '', r === 0 && c === 0 ? '×' : r === 0 ? String(c) : c === 0 ? String(r) : String(r * c));
        td.dataset.r = r; td.dataset.c = c;
        tr.appendChild(td); cells[r].push(td);
      }
      tbl.appendChild(tr);
    }
    var scroll = el('div', 'tt-scroll'); scroll.appendChild(tbl);
    box.appendChild(head); box.appendChild(scroll);
    document.body.appendChild(box);

    var shown = null, pinned = null;
    function paint(rc) {
      if (shown && rc && shown[0] === rc[0] && shown[1] === rc[1]) return;
      if (shown) mark(shown, false);
      shown = rc; if (rc) mark(rc, true);
      fact.innerHTML = rc ? '<b>' + rc[0] + '</b> × <b>' + rc[1] + '</b> = <b class="tt-ans">' + rc[0] * rc[1] + '</b>' : '<span class="tt-hint">Point at a number</span>';
      box.classList.toggle('tt-pinned', !!(pinned && rc && pinned[0] === rc[0] && pinned[1] === rc[1]));
    }
    function mark(rc, on) {
      var r = rc[0], c = rc[1], k;
      for (k = 0; k <= N; k++) { cells[r][k].classList.toggle('tt-row', on); cells[k][c].classList.toggle('tt-col', on); }
      cells[r][0].classList.toggle('tt-on', on); cells[0][c].classList.toggle('tt-on', on); cells[r][c].classList.toggle('tt-hit', on);
    }
    function at(e) { var t = e.target.closest && e.target.closest('td'); if (!t || !tbl.contains(t)) return null; return [+t.dataset.r, +t.dataset.c]; }
    tbl.addEventListener('pointerover', function (e) { if (e.pointerType !== 'mouse') return; var rc = at(e); if (rc) paint(rc); });
    tbl.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') paint(pinned); });
    var lastType = 'mouse';
    tbl.addEventListener('pointerdown', function (e) { lastType = e.pointerType || 'mouse'; });
    tbl.addEventListener('click', function (e) {
      var rc = at(e); if (!rc) return;
      pinned = pinned && pinned[0] === rc[0] && pinned[1] === rc[1] ? null : rc;
      var was = shown; shown = null; if (was) mark(was, false);
      paint(pinned || (lastType === 'mouse' ? rc : null));
    });
    paint(null);

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
