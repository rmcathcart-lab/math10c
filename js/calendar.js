/* The class calendar: which lesson (or unit test) each class does on which school day.
 * A class's calendar is saved as { v: 1, start: 'YYYY-MM-DD', items: [[key, slot], …], skipped: [key, …] }:
 *   key  = a lesson id from HW.CATALOG ('u2l3') or a unit test ('t2', after the unit's last lesson)
 *   slot = which class day it falls on, counted from the start (0 = the first class day)
 * Class days are the weekdays from the start that aren't no-school days, so adding a day off pushes every later lesson
 * back by itself. Moving a lesson moves everything after it by the same number of days; skipping one pulls everything
 * after it up a day (unless it shared its day with another lesson). Shared by the practice site (students' calendar),
 * the Teacher Ledger (Calendar tab) and the demo class. */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {};
  var C = HW.Cal = {};
  var DAY = 864e5;

  /* ---- dates (local, as 'YYYY-MM-DD') ---- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  C.key = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  C.parse = function (s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '')); return m ? new Date(+m[1], +m[2] - 1, +m[3], 12) : null; };
  C.today = function () { return C.key(new Date()); };
  C.addDays = function (s, n) { var d = C.parse(s); d.setDate(d.getDate() + n); return C.key(d); };
  C.weekday = function (s) { var d = C.parse(s); return d ? d.getDay() : -1; };
  C.isWeekday = function (s) { var w = C.weekday(s); return w >= 1 && w <= 5; };
  C.nice = function (s, opts) { var d = C.parse(s); return d ? d.toLocaleDateString([], opts || { weekday: 'short', month: 'short', day: 'numeric' }) : s; };
  function offSet(off) { var o = {}; (off || []).forEach(function (s) { o[s] = 1; }); return o; }
  /* the first n class days from start (weekdays that aren't days off) */
  C.classDays = function (start, off, n) {
    var o = offSet(off), out = [], d = C.parse(start); if (!d) return out;
    for (var guard = 0; out.length < n && guard < 3000; guard++) { var k = C.key(d), w = d.getDay(); if (w >= 1 && w <= 5 && !o[k]) out.push(k); d.setDate(d.getDate() + 1); }
    return out;
  };
  C.firstClassDay = function (s, off) { return C.classDays(s, off, 1)[0]; };

  /* ---- what can go on the calendar: every catalog lesson, with a test after each unit's last lesson ---- */
  C.sequence = function () {
    var out = [];
    (HW.CATALOG || []).forEach(function (u) {
      if (!u.lessons || !u.lessons.length) return;
      u.lessons.forEach(function (c) { out.push(c.id); });
      out.push('t' + u.unit);
    });
    return out;
  };
  var INFO = null;
  C.info = function (k) {
    if (!INFO) {
      INFO = {}; var order = 0;
      (HW.CATALOG || []).forEach(function (u) {
        (u.lessons || []).forEach(function (c) { INFO[c.id] = { key: c.id, kind: 'lesson', unit: u.unit, unitTitle: u.title, num: c.num, title: c.title, order: order++ }; });
        if (u.lessons && u.lessons.length) INFO['t' + u.unit] = { key: 't' + u.unit, kind: 'test', unit: u.unit, unitTitle: u.title, num: 'Test', title: 'Unit ' + u.unit + ' Test', order: order++ };
      });
    }
    return INFO[k] || null;
  };
  C.label = function (k) { var i = C.info(k); return !i ? k : i.kind === 'test' ? i.title : 'U' + i.unit + ' L' + i.num; };

  /* ---- a calendar ---- */
  C.make = function (start) { return { v: 1, start: start, items: C.sequence().map(function (k, i) { return [k, i]; }), skipped: [] }; };
  /* tidy a saved calendar: drop unknown keys, add lessons that are new in the catalog at the end, order by day */
  C.clean = function (cal) {
    if (!cal || !C.parse(cal.start)) return null;
    var seen = {}, items = [];
    (cal.items || []).forEach(function (x) { if (Array.isArray(x) && C.info(x[0]) && !seen[x[0]]) { seen[x[0]] = 1; items.push([x[0], Math.max(0, Math.round(Number(x[1]) || 0))]); } });
    var skipped = (cal.skipped || []).filter(function (k) { if (!C.info(k) || seen[k]) return false; seen[k] = 1; return true; });
    var last = items.reduce(function (m, x) { return Math.max(m, x[1]); }, -1);
    C.sequence().forEach(function (k) { if (!seen[k]) items.push([k, ++last]); });
    sortItems(items);
    return { v: 1, start: cal.start, items: items, skipped: skipped };
  };
  function sortItems(items) { items.forEach(function (x, i) { x.i = i; }); items.sort(function (a, b) { return a[1] - b[1] || a.i - b.i; }); items.forEach(function (x) { delete x.i; }); }
  function copy(cal) { return { v: 1, start: cal.start, items: cal.items.map(function (x) { return [x[0], x[1]]; }), skipped: cal.skipped.slice() }; }

  /* dates: { days: [date per slot], byDate: { date: [keys] }, dateOf: { key: date } } */
  C.layout = function (cal, off) {
    var n = cal.items.reduce(function (m, x) { return Math.max(m, x[1]); }, -1) + 1;
    var days = C.classDays(cal.start, off, Math.max(n, 1)), byDate = {}, dateOf = {};
    cal.items.forEach(function (x) { var d = days[x[1]]; if (!d) return; (byDate[d] = byDate[d] || []).push(x[0]); dateOf[x[0]] = d; });
    return { days: days, byDate: byDate, dateOf: dateOf, last: days[n - 1] || cal.start };
  };
  /* the slot of a date (-1 if it isn't a class day) */
  C.slotOf = function (cal, off, date) {
    var o = offSet(off); if (!C.isWeekday(date) || o[date] || date < cal.start) return -1;
    var d = C.parse(cal.start), n = 0;
    for (var guard = 0; guard < 3000; guard++) { var k = C.key(d), w = d.getDay(); if (k === date) return n; if (w >= 1 && w <= 5 && !o[k]) n++; d.setDate(d.getDate() + 1); }
    return -1;
  };

  /* move a lesson to another class day: everything after it moves by the same number of days */
  C.move = function (cal, key, slot) {
    var c = copy(cal), i = c.items.findIndex(function (x) { return x[0] === key; }); if (i < 0 || slot < 0) return c;
    var delta = slot - c.items[i][1]; if (!delta) return c;
    for (var j = i; j < c.items.length; j++) c.items[j][1] = Math.max(0, c.items[j][1] + delta);
    c.items[i][1] = slot;
    sortItems(c.items); return c;
  };
  /* take a lesson off the calendar: if it had its day to itself, everything after it moves up a day */
  C.skip = function (cal, key) {
    var c = copy(cal), i = c.items.findIndex(function (x) { return x[0] === key; }); if (i < 0) return c;
    var s = c.items[i][1], alone = !c.items.some(function (x, j) { return j !== i && x[1] === s; });
    c.items.splice(i, 1);
    if (alone) c.items.forEach(function (x) { if (x[1] > s) x[1]--; });
    c.skipped.push(key); return c;
  };
  /* put a skipped lesson back on a day: if that day already has something, it and everything after it move back a day */
  C.restore = function (cal, key, slot) {
    var c = copy(cal); c.skipped = c.skipped.filter(function (k) { return k !== key; });
    if (c.items.some(function (x) { return x[1] === slot; })) c.items.forEach(function (x) { if (x[1] >= slot) x[1]++; });
    c.items.push([key, slot]); c.items.forEach(function (x, i) { x.i = x[0] === key ? -1 : i; });
    c.items.sort(function (a, b) { return a[1] - b[1] || a.i - b.i; }); c.items.forEach(function (x) { delete x.i; });
    return c;
  };
  /* the next unit test on or after a date */
  C.nextTest = function (cal, off, from) {
    var L = C.layout(cal, off), best = null;
    cal.items.forEach(function (x) { var i = C.info(x[0]), d = L.dateOf[x[0]]; if (i && i.kind === 'test' && d && d >= from && (!best || d < best.date)) best = { key: x[0], date: d, info: i }; });
    if (best) best.inDays = Math.max(0, C.slotOf(cal, off, best.date) - Math.max(0, C.slotOf(cal, off, C.firstClassDay(from, off) || from)));
    return best;
  };
  /* ---- the calendar view: one continuous run of weeks (Sun–Sat, weekends narrow and grey) that scrolls like a phone
   * calendar — no break between months; the 1st of each month is labelled and the sticky header shows the month you're in.
   * opts: { off: [days off], today, chip(key, date) → element, from / to: 'YYYY-MM' }
   * Each day is a .calm-day with data-date (weekends .calm-we); days off say "No school". Returns the scroll box;
   * box.scrollToDate(date) brings a date's week to the top. */
  C.MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  C.view = function (cal, opts) {
    opts = opts || {};
    var today = opts.today || C.today(), off = offSet(opts.off), L = cal ? C.layout(cal, opts.off) : { byDate: {}, last: today };
    var from = opts.from || [cal ? cal.start : today, today].sort()[0].slice(0, 7), to = opts.to || [L.last || today, today].sort()[1].slice(0, 7);
    var box = el('div', 'calv');
    var head = el('div', 'calv-head'), title = el('div', 'calv-title'); head.appendChild(title);
    var hd = el('div', 'calm-hd'); ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(function (d, i) { hd.appendChild(el('div', i === 0 || i === 6 ? 'calm-we' : '', d)); });
    head.appendChild(hd); box.appendChild(head);
    var grid = el('div', 'calm-grid'); box.appendChild(grid);
    var d = new Date(+from.slice(0, 4), +from.slice(5, 7) - 1, 1, 12), end = new Date(+to.slice(0, 4), +to.slice(5, 7), 0, 12);
    while (d.getDay() !== 0) d.setDate(d.getDate() - 1);
    while (end.getDay() !== 6) end.setDate(end.getDate() + 1);
    for (; d <= end; d.setDate(d.getDate() + 1)) {
      var w = d.getDay(), we = w === 0 || w === 6, k = C.key(d), isOff = !we && !!off[k], keys = we ? [] : (L.byDate[k] || []), first = d.getDate() === 1;
      var cell = el('div', 'calm-day' + (we ? ' calm-we' : '') + (isOff ? ' calm-off' : '') + (k === today ? ' calm-today' : '') + (k < today ? ' calm-past' : '') + (first ? ' calm-first' : '') + (d.getMonth() % 2 ? ' calm-odd' : '')); // prefixed: lesson pages have their own .off, .first…
      cell.dataset.date = k; cell.dataset.ym = k.slice(0, 7);
      cell.appendChild(el('div', 'calm-n', (first ? '<b class="calm-mon">' + C.MONTHS[d.getMonth()].slice(0, 3) + '</b> ' : '') + '<span>' + d.getDate() + '</span>' + (k === today && !we ? ' <b class="calm-tag">Today</b>' : '')));
      if (!we) {
        var list = el('div', 'calm-items');
        if (isOff) list.appendChild(el('div', 'calm-offl', 'No school'));
        keys.forEach(function (key) { var c = opts.chip ? opts.chip(key, k) : el('span', 'calm-chip', C.label(key)); if (c) list.appendChild(c); });
        cell.appendChild(list);
      }
      grid.appendChild(cell);
    }
    // the header shows the month you're reading: the week a third of the way down the view, by its middle day.
    // Days of other months are a little dimmer.
    var shown = '';
    function update() {
      var cells = grid.children, probe = box.scrollTop + head.offsetHeight + (box.clientHeight - head.offsetHeight) * 0.3, best = from;
      for (var i = 0; i < cells.length; i += 7) { var r = cells[i]; if (r.offsetTop + r.offsetHeight > probe) { best = cells[Math.min(i + 3, cells.length - 1)].dataset.ym; break; } }
      if (best !== shown) {
        shown = best; title.innerHTML = C.MONTHS[+best.slice(5, 7) - 1] + ' <small>' + best.slice(0, 4) + '</small>';
        box.dataset.month = best;
        [].forEach.call(cells, function (c) { c.classList.toggle('calm-other', c.dataset.ym !== best); });
      }
    }
    var raf = 0;
    box.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(function () { raf = 0; update(); }); }, { passive: true });
    box.scrollToDate = function (date, smooth) {
      var c = grid.querySelector('.calm-day[data-date="' + date + '"]'); if (!c) return;
      var row = grid.children[Math.floor([].indexOf.call(grid.children, c) / 7) * 7];
      box.scrollTo({ top: Math.max(0, row.offsetTop - head.offsetHeight - 8), behavior: smooth ? 'smooth' : 'auto' });
      if (!smooth) update();
    };
    box.refreshMonth = update;
    requestAnimationFrame(update);
    return box;
  };

  /* what's on today (or the next class day) */
  C.on = function (cal, off, date) { return C.layout(cal, off).byDate[date] || []; };
})(window);
