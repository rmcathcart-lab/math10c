/* Teacher Ledger — the Calendar tab: plan which lesson each class does on which day (js/calendar.js has the rules).
 *  - Drag a lesson onto another day: everything after it moves by the same number of days (two lessons in one day, or a
 *    gap for a review day). Drag it onto "Skipped" (or tap it → Skip) to take it off; what follows moves up a day.
 *    Drag a skipped lesson onto a day to put it back.
 *  - "Days off": tap school days to mark them off (or back on). Days off are the school's NOSCHOOL list, shared by every
 *    class and by the in-class time, so a day off moves every class's lessons along.
 *  - Every change saves straight away (setcal); Undo steps back. */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, esc = HW.esc, C = HW.Cal, D = HW.Dash, st = D.state;
  var K = { klass: null, cal: null, loaded: false, error: '', scroll: null, undo: [], offMode: false, saving: 0, msg: '', pop: null, sync: false };
  function isDemo() { return !!(HW.DashDemo && st.klass === HW.DashDemo.CODE); }
  function realClasses() { return (st.classes || []).filter(function (c) { return !c.demo; }); }
  function allFlag() { return K.sync && !isDemo() ? '1' : ''; } // "keep all classes the same": every save goes to every class
  function api(a, p) { return D.api(a, p); }
  function off() { return st.noSchool || []; }
  function button(cls, html, fn) { var b = el('button', 'btn ' + cls, html); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function rerender() { if (st.tab === 'calendar') D.render(); }
  function klassLabel() { var c = (st.classes || []).filter(function (x) { return x.code === st.klass; })[0]; return c ? c.label : st.klass; }

  function load() {
    K.loaded = false; K.error = ''; K.klass = st.klass; K.undo = []; K.cal = null; K.scroll = null;
    return api('cal', { 'class': st.klass }).then(function (d) {
      if (K.klass !== st.klass) return;
      if (!d.ok) { K.error = d.error === 'unknown action' ? 'The ledger (Apps Script) needs the new backend code for the calendar: paste backend/Code.gs into the Apps Script project, then Deploy → Manage deployments → edit → New version.' : d.error; }
      else { K.cal = d.cal ? C.clean(d.cal) : null; K.sync = !!d.sync; if (d.noSchool && !(HW.DashDemo && st.klass === HW.DashDemo.CODE)) st.noSchool = d.noSchool; }
      K.loaded = true; rerender();
    }, function (e) { K.error = e.message; K.loaded = true; rerender(); });
  }
  function save(next, note) {
    if (K.cal) K.undo.push(K.cal); if (K.undo.length > 40) K.undo.shift();
    K.cal = next; K.msg = note || ''; K.saving++; rerender();
    return api('setcal', { 'class': st.klass, cal: next ? JSON.stringify(next) : '', all: allFlag() }).then(function (d) {
      K.saving--; if (!d.ok) { K.msg = 'Couldn’t save: ' + d.error; } rerender();
    }, function () { K.saving--; K.msg = 'Couldn’t reach the ledger — the change isn’t saved.'; rerender(); });
  }
  function undo() { if (!K.undo.length) return; var prev = K.undo.pop(); K.cal = prev; K.saving++; rerender(); api('setcal', { 'class': st.klass, cal: JSON.stringify(prev), all: allFlag() }).then(function () { K.saving--; K.msg = 'Undone.'; rerender(); }, function () { K.saving--; rerender(); }); }
  function saveOff(list) {
    st.noSchool = list.slice().sort(); rerender();
    return api('setnoschool', { dates: st.noSchool.join(',') }).then(function (d) { if (d.ok) st.noSchool = d.noSchool; else K.msg = 'Couldn’t save the days off: ' + d.error; rerender(); });
  }
  /* the default first day: the first school day of this semester (September, or February in the second half of the year) */
  function defaultStart() {
    var t = new Date(), y = t.getFullYear(), m = t.getMonth();
    var s = m >= 7 ? y + '-09-01' : m === 0 ? (y - 1) + '-09-01' : y + '-02-01';
    return C.firstClassDay(s, off());
  }

  /* ================= render ================= */
  function render(body) {
    if (K.klass !== st.klass) { load(); }
    if (!K.loaded) { body.appendChild(el('div', 'loading', 'Loading the calendar…')); return; }
    if (K.error) { body.appendChild(el('div', 'panel', '<h3>The calendar isn’t set up yet</h3><p>' + esc(K.error) + '</p>')); return; }
    if (!K.cal) return renderStart(body);
    var cal = K.cal, L = C.layout(cal, off()), today = C.today();
    // top: class, first day, end of the plan, undo, days off
    var top = el('div', 'kc-top');
    var nt = C.nextTest(cal, off(), today), lastKey = cal.items.length ? cal.items[cal.items.length - 1][0] : null;
    top.appendChild(el('div', 'kc-sum', '<h2 class="tt-h">Class calendar · ' + esc(klassLabel()) + '</h2><div class="small muted">' +
      'Starts ' + esc(C.nice(cal.start, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })) + ' · ' + cal.items.length + ' class days planned, ending ' + esc(C.nice(L.last, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })) + (lastKey ? ' (' + esc(C.label(lastKey)) + ')' : '') +
      (nt ? ' · next test: <b>' + esc(nt.info.title) + '</b> ' + esc(C.nice(nt.date)) : '') + '</div>'));
    var acts = el('div', 'tt-acts');
    var ub = button('btn-small', '↶ Undo', undo); ub.disabled = !K.undo.length; acts.appendChild(ub);
    acts.appendChild(button('btn-small' + (K.offMode ? ' btn-primary' : ''), K.offMode ? 'Done with days off' : 'Days off…', function () { K.offMode = !K.offMode; rerender(); }));
    acts.appendChild(button('btn-small btn-ghost', 'Start over…', function () { startOver(); }));
    top.appendChild(acts); body.appendChild(top);
    if (!isDemo() && realClasses().length > 1) body.appendChild(syncRow());
    if (K.offMode) body.appendChild(el('div', 'kc-offnote', '<b>Days off:</b> tap a school day to mark it off, tap it again to turn it back on. Days off are for the whole school: every class’s lessons move along, and work on a day off doesn’t count as in class.'));
    if (K.msg || K.saving) body.appendChild(el('div', 'kc-msg small', K.saving ? 'Saving…' : esc(K.msg)));
    // skipped lessons (up top, so it's in reach while dragging)
    var tray = el('div', 'kc-tray'); tray.dataset.tray = '1';
    tray.appendChild(el('div', 'kc-tray-h', '<b>Skipped</b> <span class="small muted">' + (cal.skipped.length ? 'drag one onto a day to put it back' : 'drag a lesson here to take it off the calendar') + '</span>'));
    var tl = el('div', 'kc-tray-list'); cal.skipped.forEach(function (k) { tl.appendChild(chip(k, null)); }); tray.appendChild(tl);
    body.appendChild(tray);
    // the months, in a box that scrolls (it keeps its place when the calendar redraws after a change)
    var tools = el('div', 'cal-nav');
    tools.appendChild(el('span', 'small muted', 'Scroll for other months (Today brings this week back). While dragging a lesson, hold it near the top or bottom edge to scroll.'));
    body.appendChild(tools);
    var v = C.view(cal, { off: off(), today: today, chip: chip });
    v.classList.add('kc-grid'); if (K.offMode) v.classList.add('kc-offmode');
    body.appendChild(v);
    requestAnimationFrame(function () { if (K.scroll != null) v.scrollTop = K.scroll; else v.scrollToDate(today < cal.start ? cal.start : today); });
    v.addEventListener('scroll', function () { K.scroll = v.scrollTop; });
    v.querySelectorAll('.calm-day[data-date]:not(.calm-we)').forEach(function (cell) {
      var dte = cell.dataset.date;
      if (K.offMode) cell.addEventListener('click', function () { var o = off().slice(), i = o.indexOf(dte); if (i >= 0) o.splice(i, 1); else o.push(dte); saveOff(o); });
    });
    body.appendChild(el('p', 'small muted', 'Drag a lesson to another day and everything after it moves by the same number of days: drop it on the day before to do two lessons in one class, or later to leave room for a review day. Tap a lesson to skip it or open it. Students see it from the Calendar button at the top of their home page (with the next test), and it’s on the lesson site’s All lessons page (Lessons / Class calendar).'));
    HW.texIn && HW.texIn(body);
  }
  function renderStart(body) {
    var p = el('div', 'panel kc-start');
    p.innerHTML = '<h3>Make a class calendar for ' + esc(klassLabel()) + '</h3><p>Every lesson in course order, one per class day, with a unit test after each unit’s last lesson. Weekends and days off are skipped. Then drag lessons around as the semester goes.</p>';
    var row = el('div', 'tt-row'), lab = el('label', 'tt-inline', 'First class day '), inp = el('input', 'field kc-date'); inp.type = 'date'; inp.value = defaultStart() || C.today();
    lab.appendChild(inp); row.appendChild(lab);
    row.appendChild(button('btn-primary', 'Make the calendar', function () { var s = C.firstClassDay(inp.value, off()); if (!s) return; K.scroll = null; save(C.make(s), 'Calendar made.'); }));
    p.appendChild(row);
    var others = (st.classes || []).filter(function (c) { return c.code !== st.klass && !c.demo; });
    if (others.length) p.appendChild(el('p', 'small muted', 'Each class has its own calendar (they can drift apart). Days off are shared.'));
    body.appendChild(p);
  }
  /* all classes on one calendar: copy this one to every class once, or keep them the same from now on */
  function syncRow() {
    var n = realClasses().length, row = el('div', 'kc-sync');
    var lab = el('label', 'tt-inline'), cb = el('input'); cb.type = 'checkbox'; cb.checked = K.sync;
    lab.appendChild(cb); lab.appendChild(document.createTextNode(' Keep all ' + n + ' classes’ calendars the same'));
    cb.addEventListener('change', function () {
      if (cb.checked) {
        if (!confirm('Keep every class on this calendar?\n\nThis copies ' + klassLabel() + '’s calendar to all ' + n + ' classes now, and from then on every change you make here is made in every class.')) { cb.checked = false; return; }
        K.saving++; rerender();
        api('calsync', { on: '1' }).then(function () { K.sync = true; return api('setcal', { 'class': st.klass, cal: JSON.stringify(K.cal), all: '1' }); }).then(function (d) { K.saving--; K.msg = d && d.ok ? 'All ' + n + ' classes now share this calendar.' : 'Couldn’t copy: ' + (d && d.error); rerender(); }, function () { K.saving--; K.msg = 'Couldn’t reach the ledger.'; rerender(); });
      } else {
        K.saving++; rerender();
        api('calsync', { on: '0' }).then(function () { K.sync = false; K.saving--; K.msg = 'Each class has its own calendar again (they start out the same).'; rerender(); }, function () { K.saving--; rerender(); });
      }
    });
    row.appendChild(lab);
    if (!K.sync) row.appendChild(button('btn-small btn-ghost', 'Copy this calendar to every class…', function () {
      if (!confirm('Copy ' + klassLabel() + '’s calendar to all ' + n + ' classes? Their own changes are replaced (days off are already shared).')) return;
      K.saving++; rerender();
      api('setcal', { 'class': st.klass, cal: JSON.stringify(K.cal), all: '1' }).then(function (d) { K.saving--; K.msg = d && d.ok ? 'Copied to all ' + n + ' classes.' : 'Couldn’t copy: ' + (d && d.error); rerender(); }, function () { K.saving--; K.msg = 'Couldn’t reach the ledger.'; rerender(); });
    }));
    else row.appendChild(el('span', 'small muted', 'Every change here is made in every class.'));
    return row;
  }
  function startOver() {
    var s = prompt('Start over with every lesson back in order from this first day (YYYY-MM-DD). Skipped lessons come back. Undo can bring the old plan back.', K.cal.start);
    if (!s) return; var d = C.firstClassDay(s.trim(), off()); if (!d) { alert('That isn’t a date like 2026-09-03.'); return; }
    K.scroll = null; save(C.make(d), 'Started over from ' + C.nice(d) + '.');
  }

  /* ================= lessons on the grid: drag, tap ================= */
  function chip(key, date) {
    var i = C.info(key); if (!i) return null;
    var c = el('div', 'calm-chip kc-chip' + (i.kind === 'test' ? ' test' : ''), '<b>' + esc(i.kind === 'test' ? i.title : 'U' + i.unit + ' · L' + i.num) + '</b><span class="ct">' + (i.kind === 'test' ? esc(i.unitTitle) : HW.tex(esc(i.title))) + '</span>');
    c.dataset.key = key; if (date) c.dataset.date = date; c.dataset.skipped = date ? '' : '1';
    c.title = (i.kind === 'test' ? i.title : 'Unit ' + i.unit + ', Lesson ' + i.num + ': ' + i.title.replace(/<[^>]+>/g, '')) + ' — drag to move, tap for options';
    if (!K.offMode) c.addEventListener('pointerdown', function (e) { startDrag(e, c, key, !date); });
    return c;
  }
  var drag = null;
  function startDrag(e, node, key, fromTray) {
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    drag = { key: key, node: node, fromTray: fromTray, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, on: false, ghost: null, over: null, id: e.pointerId, box: document.querySelector('.kc-grid'), dir: 0, timer: 0 };
    document.addEventListener('pointermove', onMove); document.addEventListener('pointerup', onUp); document.addEventListener('pointercancel', onUp);
  }
  function target(x, y) {
    var t = document.elementFromPoint(x, y); if (!t || !t.closest) return null;
    return t.closest('.kc-grid .calm-day[data-date]:not(.calm-we)') || t.closest('[data-tray]');
  }
  function onMove(e) {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on) {
      if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) < 6) return;
      drag.on = true; closePop();
      var r = drag.node.getBoundingClientRect(), g = drag.node.cloneNode(true); g.classList.add('kc-ghost'); g.style.width = r.width + 'px';
      drag.dx = drag.x0 - r.left; drag.dy = drag.y0 - r.top; document.body.appendChild(g); drag.ghost = g; drag.node.classList.add('kc-src');
      document.body.classList.add('kc-dragging');
    }
    e.preventDefault();
    drag.x = e.clientX; drag.y = e.clientY;
    drag.ghost.style.transform = 'translate(' + (e.clientX - drag.dx) + 'px,' + (e.clientY - drag.dy) + 'px)';
    hover();
    // near the top or bottom edge of the months: scroll them
    var r = drag.box ? drag.box.getBoundingClientRect() : null, dir = 0;
    if (r && e.clientX > r.left && e.clientX < r.right) { if (e.clientY < r.top + 70 && e.clientY > r.top - 40) dir = -1; else if (e.clientY > r.bottom - 70 && e.clientY < r.bottom + 40) dir = 1; }
    drag.dir = dir;
    if (dir && !drag.timer) drag.timer = setInterval(function () { if (!drag || !drag.dir) { if (drag) { clearInterval(drag.timer); drag.timer = 0; } return; } drag.box.scrollTop += drag.dir * 14; hover(); }, 16);
  }
  function hover() {
    var t = target(drag.x, drag.y);
    if (t !== drag.over) { if (drag.over) drag.over.classList.remove('kc-over'); drag.over = t; if (t) t.classList.add('kc-over'); }
  }
  function onUp(e) {
    if (!drag || e.pointerId !== drag.id) return;
    document.removeEventListener('pointermove', onMove); document.removeEventListener('pointerup', onUp); document.removeEventListener('pointercancel', onUp);
    var d = drag; drag = null; clearInterval(d.timer); document.body.classList.remove('kc-dragging');
    if (d.ghost) d.ghost.remove(); if (d.over) d.over.classList.remove('kc-over'); d.node.classList.remove('kc-src');
    if (!d.on) { if (e.type === 'pointerup') openPop(d.node, d.key, d.fromTray); return; }
    if (e.type === 'pointercancel') return;
    var t = target(e.clientX, e.clientY); if (!t) return;
    if (t.dataset.tray) { if (!d.fromTray) skip(d.key); return; }
    dropOn(d.key, t.dataset.date, d.fromTray);
  }
  function dropOn(key, date, fromTray) {
    var slot = C.slotOf(K.cal, off(), date), i = C.info(key);
    if (slot < 0) { K.msg = date < K.cal.start ? 'That’s before the first class day.' : 'That isn’t a school day.'; rerender(); return; }
    var name = i.kind === 'test' ? i.title : 'Lesson ' + i.num;
    if (fromTray) { save(C.restore(K.cal, key, slot), name + ' is back on ' + C.nice(date) + '.'); return; }
    var was = C.layout(K.cal, off()).dateOf[key]; if (was === date) return;
    save(C.move(K.cal, key, slot), name + ' moved to ' + C.nice(date) + (date < was ? '; everything after it moved up.' : '; everything after it follows on.'));
  }
  function skip(key) { var i = C.info(key); save(C.skip(K.cal, key), (i.kind === 'test' ? i.title : 'Lesson ' + i.num) + ' skipped; everything after it moved up.'); }
  /* tap a lesson: skip it, put it back, open it */
  function closePop() { if (K.pop) { K.pop.remove(); K.pop = null; } }
  function openPop(node, key, fromTray) {
    closePop();
    var i = C.info(key), L = C.layout(K.cal, off()), p = el('div', 'kc-pop');
    p.appendChild(el('div', 'kc-pop-h', '<b>' + esc(i.kind === 'test' ? i.title : 'Unit ' + i.unit + ' · Lesson ' + i.num) + '</b><div>' + (i.kind === 'test' ? esc(i.unitTitle) : HW.tex(esc(i.title))) + '</div><div class="small muted">' + (fromTray ? 'Skipped' : esc(C.nice(L.dateOf[key], { weekday: 'long', month: 'long', day: 'numeric' }))) + '</div>'));
    var a = el('div', 'kc-pop-acts');
    if (!fromTray) a.appendChild(button('btn-small', 'Skip it', function () { closePop(); skip(key); }));
    else a.appendChild(el('span', 'small muted', 'Drag it onto a day to put it back.'));
    var T = HW.TEACHING, m = /^u(\d+)l(\w+)$/.exec(key);
    if (T && m && T.lessons.indexOf(key) >= 0) { var la = el('a', 'btn btn-small btn-ghost', 'Lesson page ↗'); la.href = '../' + T.base + 'u' + m[1] + '/l' + m[2] + '/'; la.target = '_blank'; la.rel = 'noopener'; a.appendChild(la); }
    if (HW.lessons[key] && !HW.lessons[key].test) { var pa = el('a', 'btn btn-small btn-ghost', 'Practice ↗'); pa.href = '../#/lesson/' + key; pa.target = '_blank'; pa.rel = 'noopener'; a.appendChild(pa); }
    a.appendChild(button('btn-small btn-ghost', 'Close', closePop));
    p.appendChild(a);
    document.body.appendChild(p); K.pop = p;
    var r = node.getBoundingClientRect(), w = 280;
    p.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + 'px'; p.style.top = (r.bottom + 6 + scrollY) + 'px';
    HW.texIn && HW.texIn(p);
  }
  document.addEventListener('pointerdown', function (e) { if (K.pop && !K.pop.contains(e.target)) closePop(); }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closePop(); });

  HW.DashCal = { render: function (body) { closePop(); render(body); }, reload: function () { K.klass = null; } };
})(window);
