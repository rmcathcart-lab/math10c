/* Teacher Ledger — the Calendar tab: plan which lesson each class does on which day (js/calendar.js has the rules).
 *  - Drag a lesson onto another day: everything after it moves by the same number of days (two lessons in one day, or a
 *    gap for a review day). Drag it onto "Skipped" (or tap it → Skip) to take it off; what follows moves up a day.
 *    Drag a skipped lesson onto a day to put it back.
 *  - "Days off": tap school days to mark them off (or back on). Days off are the school's NOSCHOOL list, shared by every
 *    class and by the in-class time, so a day off moves every class's lessons along.
 *  - "Add to calendar": the teacher's own entries (a cumulative exam, an assembly, a reminder). An exam or anything that
 *    takes the class moves the lessons to the next class day; tap an entry to change or remove it.
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
    K.cal = next; K.msg = note || ''; K.saving++; st.cal = next; st.calFor = st.klass; D.drawTop(); rerender();
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
    var ub = button('btn-small', 'Undo', undo); ub.disabled = !K.undo.length; acts.appendChild(ub);
    acts.appendChild(button('btn-small kc-add', 'Add to calendar…', function () { editEvent(null); }));
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
    var v = C.view(cal, { off: off(), today: today, chip: chip, eventChip: eventChip });
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
    var row = el('div', 'tt-row kc-startrow'), pick = C.picker({ value: defaultStart() || C.today(), off: off() });
    row.appendChild(el('div', 'kc-field-l', 'First class day')); row.appendChild(pick);
    row.appendChild(button('btn-primary', 'Make the calendar', function () { var s = C.firstClassDay(pick.value(), off()); if (!s) return; K.scroll = null; save(C.make(s), 'Calendar made.'); }));
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
    var pick = C.picker({ value: K.cal.start, off: off() });
    modal('Start over', [el('p', 'small muted', 'Every lesson goes back in order, one per class day, from the first class day you pick. Skipped lessons come back; your own entries (exams, events) stay. Undo can bring the old plan back.'), pick],
      'Start over from this day', function () {
        var d = C.firstClassDay(pick.value(), off()); if (!d) return false;
        var next = C.make(d); if (K.cal.events) next.events = K.cal.events.slice();
        K.scroll = null; save(next, 'Started over from ' + C.nice(d) + '.'); return true;
      });
  }
  /* a small pop-up: title, content, a main button (fn returns false to stay open), Cancel, and extra buttons */
  function modal(title, content, okText, fn, extra) {
    closeModal();
    var ov = el('div', 'kc-modal'); ov.id = 'kc-modal'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    var box = el('div', 'kc-modal-box'); ov.appendChild(box);
    box.appendChild(el('h3', '', esc(title)));
    content.forEach(function (c) { box.appendChild(c); });
    var a = el('div', 'kc-modal-acts');
    (extra || []).forEach(function (b) { a.appendChild(b); });
    a.appendChild(el('span', 'kc-sp'));
    a.appendChild(button('btn-ghost', 'Cancel', closeModal));
    a.appendChild(button('btn-primary kc-ok', okText, function () { if (fn() !== false) closeModal(); }));
    box.appendChild(a);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(); });
    document.body.appendChild(ov);
    var f = box.querySelector('input'); setTimeout(function () { try { (f || box.querySelector('.kc-ok')).focus(); } catch (e) {} }, 30);
    return box;
  }
  function closeModal() { var o = document.getElementById('kc-modal'); if (o) o.remove(); }
  /* add or change one of the teacher's own entries */
  function editEvent(ev) {
    var e = ev ? Object.assign({}, ev) : { id: 'e' + Date.now().toString(36), date: C.today() < K.cal.start ? K.cal.start : C.today(), title: '', kind: 'exam', takes: true };
    var title = el('input', 'field kc-ev-title'); title.type = 'text'; title.maxLength = 60; title.placeholder = 'e.g. Cumulative exam, Assembly, Bring a calculator'; title.value = e.title;
    var tl = el('label', 'kc-field', '<span>What</span>'); tl.appendChild(title);
    var kinds = el('div', 'kc-kinds');
    [['exam', 'Exam', 'Takes the class; counts as the next test for students'], ['event', 'Event or reminder', 'Shows on the calendar']].forEach(function (k) {
      var lab = el('label', 'kc-kind'), r = el('input'); r.type = 'radio'; r.name = 'kc-kind'; r.value = k[0]; r.checked = e.kind === k[0];
      r.addEventListener('change', function () { e.kind = k[0]; if (k[0] === 'exam') { e.takes = true; tk.checked = true; } });
      lab.appendChild(r); lab.appendChild(el('span', '', '<b>' + k[1] + '</b><small>' + k[2] + '</small>')); kinds.appendChild(lab);
    });
    var tkl = el('label', 'tt-inline kc-takes'), tk = el('input'); tk.type = 'checkbox'; tk.checked = e.takes; tk.addEventListener('change', function () { e.takes = tk.checked; });
    tkl.appendChild(tk); tkl.appendChild(document.createTextNode(' No lesson that day (the lessons move to the next class day)'));
    var pick = C.picker({ value: e.date, off: off() });
    var extra = ev ? [button('btn-ghost kc-del', 'Remove', function () {
      var next = C.copy(K.cal); next.events = (next.events || []).filter(function (x) { return x.id !== ev.id; }); if (!next.events.length) delete next.events;
      closeModal(); save(next, '“' + ev.title + '” removed.');
    })] : [];
    modal(ev ? 'Change calendar entry' : 'Add to the calendar', [tl, kinds, tkl, el('div', 'kc-field-l', 'Day'), pick], ev ? 'Save' : 'Add', function () {
      e.title = title.value.trim(); e.date = pick.value();
      if (!e.title) { title.focus(); title.classList.add('kc-need'); return false; }
      var next = C.copy(K.cal), list = (next.events || []).filter(function (x) { return x.id !== e.id; }); list.push(e);
      next.events = C.cleanEvents(list);
      save(next, '“' + e.title + '” ' + (ev ? 'saved' : 'added') + ' on ' + C.nice(e.date) + (e.takes ? '; the lessons that day moved to the next class day.' : '.'));
      return true;
    }, extra);
  }
  function eventChip(e) {
    var c = C.eventChip(e); c.classList.add('kc-evchip'); c.title = e.title + ' — tap to change or remove';
    c.addEventListener('click', function () { if (!K.offMode) editEvent(e); });
    return c;
  }

  /* ================= lessons on the grid: drag, tap ================= */
  function chip(key, date) {
    var i = C.info(key); if (!i) return null;
    var c = el('div', 'calm-chip kc-chip' + (i.kind === 'test' ? ' test' : ''), '<b>' + esc(i.kind === 'test' ? i.title : i.intro ? 'Day one' : 'U' + i.unit + ' · L' + i.num) + '</b><span class="ct">' + (i.kind === 'test' ? esc(i.unitTitle) : HW.tex(esc(i.title))) + '</span>');
    c.dataset.key = key; if (date) c.dataset.date = date; c.dataset.skipped = date ? '' : '1'; C.paint(c, key);
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
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closePop(); closeModal(); } });

  /* ================= header: Lessons (pop-up) and Launch Today's Lesson ================= */
  function block() { var c = (st.classes || []).filter(function (x) { return x.code === st.klass; })[0]; return c && c.block ? String(c.block).toUpperCase() : ''; }
  function lessonUrl(key) { var T = HW.TEACHING, m = /^u(\d+)l(\w+)$/.exec(key); if (!T || !m || T.lessons.indexOf(key) < 0) return ''; return '../' + T.base + 'u' + m[1] + '/l' + m[2] + '/' + (block() ? '?class=' + block() : ''); }
  function hereCal() { return st.calFor === st.klass ? st.cal : null; }
  function todayInfo() {
    var cal = hereCal(), today = C.today(), w = new Date().getDay();
    if (!cal) return { keys: [], why: 'Make a class calendar first (Calendar tab) so the ledger knows today’s lesson.' };
    var keys = C.on(cal, off(), today), lessons = keys.filter(function (k) { var i = C.info(k); return i && i.kind === 'lesson' && lessonUrl(k); });
    if (lessons.length) return { keys: lessons };
    if (keys.length) return { keys: [], why: 'Today is the ' + C.info(keys[0]).title + '.' };
    var evs = C.eventsOn(cal, today); if (evs.length) return { keys: [], why: 'Today: ' + evs[0].title + '.' };
    if (w === 0 || w === 6) return { keys: [], why: 'No class today (weekend).' };
    if (off().indexOf(today) >= 0) return { keys: [], why: 'No school today.' };
    return { keys: [], why: 'Nothing is on the calendar for today.' };
  }
  function topButtons(right) {
    var lb = button('btn-ghost top-lessons', 'Lessons', function () { openLessons(); }); lb.title = 'All the lessons, as cards or on the class calendar';
    right.appendChild(lb); // header, left to right: Student site, Lessons, Launch Today's Lesson
    var t = todayInfo(), go;
    if (t.keys.length === 1) { go = el('a', 'btn btn-primary top-launch', 'Launch Today’s Lesson'); go.href = lessonUrl(t.keys[0]); var i = C.info(t.keys[0]); go.title = 'Lesson ' + i.unit + '.' + i.num + ': ' + i.title + (block() ? ' (Block ' + block() + ')' : ''); }
    else if (t.keys.length > 1) { go = button('btn-primary top-launch', 'Launch Today’s Lesson', function () { openLessons('today'); }); go.title = 'Two lessons today: pick one'; }
    else { go = button('btn-primary top-launch', 'Launch Today’s Lesson', function () {}); go.disabled = true; go.title = t.why; }
    right.appendChild(go);
    // beside it: launch today's exit slip (the ready-made one for today's lesson, or Ryan's edited copy of it)
    var xs = t.keys.filter(function (k) { return HW.lessons[k + 'x']; });
    var xb = button('top-exit', 'Exit Slip', function () { launchExit(xs); });
    if (!xs.length) { xb.disabled = true; xb.title = t.keys.length ? 'Today’s lesson has no exit slip.' : t.why; }
    else xb.title = xs.map(function (k) { var i = C.info(k); return 'Exit Slip ' + i.unit + '.' + i.num + ': ' + String(i.title).replace(/<[^>]*>/g, ''); }).join('\n') + '\nLaunch it for this class';
    right.appendChild(xb);
  }
  function launchExit(keys) {
    var TS = HW.DashTests; if (!TS || !keys.length) return;
    TS.load(true).then(function () {
      var k = keys[0];
      if (keys.length > 1) { var i2 = C.info(keys[1]); if (!confirm('Two lessons today. Launch the exit slip for Lesson ' + C.info(k).unit + '.' + C.info(k).num + '?\n\nCancel to choose Lesson ' + i2.unit + '.' + i2.num + ' instead.')) k = keys[1]; }
      var t = TS.all().filter(function (x) { return x.id === 'B-' + k + 'x'; })[0]; if (!t) return;
      var cl = (st.classes || []).filter(function (x) { return x.code === st.klass; })[0], lab = cl ? cl.label : st.klass;
      var prev = st.tab; st.tab = 'exits'; // the live monitor opens on the Exit slips tab
      var p = TS.launchTest(t, 'Launch “' + t.def.title + '” for ' + lab + ' now?\n\nIt pops up on every signed-in student’s screen within about 10 seconds.');
      if (!p) { st.tab = prev; return; } // cancelled (or something is already live)
      try { localStorage.setItem('hw:ttab', 'exits'); } catch (e) {}
    }, function (e) { alert('Couldn’t load the exit slips: ' + e.message); });
  }
  /* the Lessons pop-up: every lesson as cards (by unit, in unit colours, marked Today / Taught / its date for this class),
     or the class calendar; tap one to open it for this class */
  function openLessons(focus) {
    closeLessons();
    var view = focus === 'today' ? 'cards' : (localStorage.getItem('hw:tlview') || 'cards');
    var ov = el('div', 'lp-modal'); ov.id = 'lp-modal'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    var box = el('div', 'lp-box'); ov.appendChild(box);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeLessons(); });
    document.addEventListener('keydown', lpKeys); document.body.appendChild(ov);
    function draw() {
      box.innerHTML = '';
      var cal = hereCal(), L = cal ? C.layout(cal, off()) : null, today = C.today(), skipped = cal ? cal.skipped : [];
      var head = el('div', 'lp-head');
      head.appendChild(el('h2', '', 'Lessons <span class="muted small">' + esc(klassLabel()) + (block() ? ' · ink for Block ' + block() : '') + '</span>'));
      var seg = el('div', 'seg'); [['cards', 'Cards'], ['cal', 'Calendar']].forEach(function (x) { var b = el('button', x[0] === view ? 'on' : '', x[1]); b.type = 'button'; b.addEventListener('click', function () { view = x[0]; try { localStorage.setItem('hw:tlview', view); } catch (e) {} draw(); }); seg.appendChild(b); });
      head.appendChild(seg);
      head.appendChild(button('btn-ghost lp-x', '×', closeLessons));
      box.appendChild(head);
      var t = todayInfo();
      if (t.keys.length) box.appendChild(el('div', 'lp-today', 'Today: ' + t.keys.map(function (k) { var i = C.info(k); return '<a href="' + esc(lessonUrl(k)) + '"><b>Lesson ' + i.unit + '.' + esc(i.num) + '</b> ' + esc(i.title) + '</a>'; }).join(' · ')));
      else box.appendChild(el('div', 'lp-today muted', esc(t.why)));
      var body = el('div', 'lp-body'); box.appendChild(body);
      if (view === 'cal') {
        if (!cal) { body.appendChild(el('p', 'muted', 'This class doesn’t have a calendar yet — make one in the Calendar tab.')); return; }
        var v = C.view(cal, { off: off(), today: today, chip: function (k) {
          var i = C.info(k), url = i.kind === 'lesson' ? lessonUrl(k) : '';
          var c = el(url ? 'a' : 'div', 'calm-chip' + (i.kind === 'test' ? ' test' : ''), '<b>' + esc(i.kind === 'test' ? i.title : i.intro ? 'Day one' : 'U' + i.unit + ' · Lesson ' + i.num) + '</b><span class="ct">' + esc(i.kind === 'test' ? i.unitTitle : i.title) + '</span>');
          if (url) { c.href = url; c.title = 'Open Lesson ' + i.unit + '.' + i.num; }
          return c;
        } });
        v.classList.add('lp-cal'); body.appendChild(v);
        requestAnimationFrame(function () { v.scrollToDate(today < cal.start ? cal.start : today); });
        return;
      }
      // the course introduction (day one) sits above Unit 1, outside every unit
      HW.CATALOG.forEach(function (u) { u.lessons.forEach(function (c) { if (!c.intro) return;
        var sec = el('section', 'lp-unit lp-intro'), grid = el('div', 'lp-grid'); sec.appendChild(grid); grid.appendChild(lpCard(c, 'Course introduction')); body.appendChild(sec); }); });
      HW.CATALOG.forEach(function (u) {
        if (!u.lessons.length) return;
        var sec = el('section', 'lp-unit'); if (HW.unitStyle) sec.setAttribute('style', HW.unitStyle(u.unit));
        sec.appendChild(el('h3', '', '<span class="lp-un">Unit ' + u.unit + '</span> ' + esc(u.title) + ' <span class="muted small">' + esc(u.outcomes) + '</span>'));
        var grid = el('div', 'lp-grid');
        u.lessons.forEach(function (c) { if (!c.intro) grid.appendChild(lpCard(c, 'Lesson ' + u.unit + '.' + c.num)); });
        sec.appendChild(grid); body.appendChild(sec);
      });
      var tc = body.querySelector('.lp-card.is-today') || body.querySelector('.lp-card.is-next');
      if (tc) requestAnimationFrame(function () { body.scrollTop = Math.max(0, tc.closest('.lp-unit').offsetTop - 8); });
      function lpCard(c, kicker) {
      var url = lessonUrl(c.id), d = L ? L.dateOf[c.id] : null, isSkip = skipped.indexOf(c.id) >= 0;
      var stt = isSkip ? 'skip' : !d ? '' : d === today ? 'today' : d < today ? 'past' : 'next';
      // a skipped course intro is just "not on the calendar" (it's still there to open)
      if (c.intro && isSkip) stt = '';
      var tag = { skip: 'Skipped', today: 'Today', past: '✓ Taught ' + (d ? C.nice(d, { month: 'short', day: 'numeric' }) : ''), next: d ? C.nice(d) : '' }[stt] || '';
      var card = el(url ? 'a' : 'div', 'lp-card' + (stt ? ' is-' + stt : '') + (c.intro ? ' lp-introcard' : ''), '<div class="lp-n">' + esc(kicker) + '</div><div class="lp-t">' + esc(c.title) + '</div>' + (tag ? '<div class="lp-s">' + tag + '</div>' : ''));
      if (url) card.href = url;
      return card;
      }
    }
    draw();
  }
  function closeLessons() { var o = document.getElementById('lp-modal'); if (o) o.remove(); document.removeEventListener('keydown', lpKeys); }
  function lpKeys(e) { if (e.key === 'Escape') closeLessons(); }

  HW.DashCal = { render: function (body) { closePop(); render(body); }, reload: function () { K.klass = null; }, topButtons: topButtons, openLessons: openLessons };
})(window);
