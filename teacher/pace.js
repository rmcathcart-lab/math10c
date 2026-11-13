/* Teacher Ledger — "Keeping up" and "Email home" (Ryan, 2026-11-13).
 *
 * Keeping up (Progress tab → "Keeping up"): each student's practice in the CURRENT unit, measured against how far the
 *   class has got, not against the whole unit.
 *   - The class calendar says which lessons came before today: their required practice is what a student should have
 *     finished by now ("due"). Today's lesson is shown but doesn't count yet. Skipped lessons don't count.
 *   - The current unit is the unit of the latest lesson or test on the calendar on or before today.
 *   - "Earlier units": the required practice still open in lessons of earlier units that came before today.
 *   - The In class only / All work switch decides which work counts, as everywhere else in the ledger.
 *
 * Student page: a "Keeping up" panel, and an "Email home" button that prepares an email to the family:
 *   - About: this unit so far, one earlier unit, or the whole course so far. Parts can be left out: keeping up with the
 *     practice, outcome levels, unit tests, time on the website, what's coming up. A note of the teacher's own goes first.
 *   - Outcome levels are the ones the PowerSchool tab uses: the unit test (best attempt) when there is one, otherwise the
 *     higher of the exit slips and the practice.
 *   - The email is plain HTML with inline styles and tables (bars and level scales), so it keeps its look when pasted into
 *     Outlook or Gmail. "Copy and open email" copies it and opens a new message in the computer's default mail app (Ryan
 *     uses Outlook) through a mailto: link with the subject and the family's address (if typed — kept in this browser
 *     only); paste it into the body. (A mailto: link can't carry formatting, so the body goes by the clipboard.)
 *
 * Shared, unchanged, by math10c, math15, math20-1 and math10-3 (the course name comes from HW_CONFIG.siteName). */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, esc = HW.esc, D = HW.Dash, C = HW.Cal, TC = HW.TestCore;
  if (!D || !C) return;
  var st = D.state;
  var LADDER = (TC && TC.LADDER) || ['NM', 'LIM', 'BEG', 'EMG', 'PRG', 'ADV', 'MAS'];
  var BANDS = (TC && TC.BANDS) || null;
  var LNAME = { NM: 'Not Yet Meeting', LIM: 'Limited', BEG: 'Beginning', EMG: 'Emerging', PRG: 'Progressing', ADV: 'Advancing', MAS: 'Mastery' };
  var SCALE = ['LIM', 'BEG', 'EMG', 'PRG', 'ADV', 'MAS'];
  var SCHOOL = 'W.H. Croxford High School', TEACHER_EMAIL = 'rcathcart@rvschools.ab.ca';

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function button(cls, html, fn) { var b = el('button', 'btn ' + cls, html); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function course() { return String((root.HW_CONFIG || {}).siteName || 'Math').replace(/\s*Practice\s*$/, ''); }
  function firstName(n) { return String(n || '').trim().split(/\s+/)[0] || 'Your child'; }
  function off() { return st.noSchool || []; }
  function cal() { return st.calFor === st.klass ? st.cal : null; }
  function skipped() { var c = cal(); return (c && c.skipped) || []; }
  function nice(d, long) { return C.nice(d, long ? { weekday: 'long', month: 'long', day: 'numeric' } : { month: 'short', day: 'numeric' }); }
  function dur(s) { s = Math.round(s || 0); if (s < 60) return s ? s + ' s' : 'none'; var m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }
  function plural(n, a, b) { return n + ' ' + (n === 1 ? a : (b || a + 's')); }
  function req(l) { return l.required.length; }
  function doneIn(s, l) { var r = s && s.lessons[l.id]; return Math.min(r ? r.done : 0, req(l)); }
  function unitOf(n) { return HW.CATALOG.filter(function (u) { return u.unit === n; })[0]; }
  function builtLessons(u) { return (u.lessons || []).filter(function (c) { return !c.intro && HW.lessons[c.id] && HW.lessons[c.id].required.length; }).map(function (c) { return HW.lessons[c.id]; }); }

  /* ---------------- where the class is ---------------- */
  /* { unit, uTitle, due: [lessons before today], today: [lessons today], later: [the rest], skipped: [],
       earlier: [lessons of earlier units before today], first: date the unit started, test: { date } | null,
       next: the next test or exam from today } — or null when the class has no calendar */
  function pace() {
    var c = cal(); if (!c || !c.items || !c.items.length) return null;
    var Ly = C.layout(c, off()), today = C.today(), skip = c.skipped || [], curU = 0, curD = '', curO = -1;
    c.items.forEach(function (x) {
      var i = C.info(x[0]), d = Ly.dateOf[x[0]];
      if (!i || i.intro || !d || d > today || skip.indexOf(x[0]) >= 0) return;
      if (d > curD || (d === curD && i.order > curO)) { curD = d; curU = i.unit; curO = i.order; }
    });
    var units = HW.CATALOG.filter(function (u) { return builtLessons(u).length; });
    if (!units.length) return null;
    if (!curU) curU = units[0].unit;
    var U = unitOf(curU) || units[0], P = { unit: U.unit, uTitle: U.title, due: [], today: [], later: [], skipped: [], earlier: [], first: '', dates: {}, layout: Ly, todayKey: today };
    var ui = HW.CATALOG.indexOf(U);
    HW.CATALOG.forEach(function (u, k) {
      builtLessons(u).forEach(function (l) {
        var d = Ly.dateOf[l.id], sk = skip.indexOf(l.id) >= 0; P.dates[l.id] = sk ? '' : d || '';
        if (u === U) {
          if (sk) P.skipped.push(l);
          else if (d && d < today) P.due.push(l); else if (d === today) P.today.push(l); else P.later.push(l);
          if (d && !sk && (!P.first || d < P.first)) P.first = d;
        } else if (k < ui && !sk && d && d < today) P.earlier.push(l);
      });
    });
    var td = Ly.dateOf['t' + U.unit]; P.test = td && skip.indexOf('t' + U.unit) < 0 ? { date: td } : null;
    P.next = C.nextTest ? C.nextTest(c, off(), today) : null;
    return P;
  }
  /* one student against it */
  function keep(s, P) {
    var k = { req: 0, done: 0, behind: 0, open: [], earlierReq: 0, earlierDone: 0, earlierOpen: 0 };
    P.due.forEach(function (l) { var n = doneIn(s, l); k.req += req(l); k.done += n; if (n < req(l)) { k.behind++; k.open.push(l); } });
    P.earlier.forEach(function (l) { var n = doneIn(s, l); k.earlierReq += req(l); k.earlierDone += n; if (n < req(l)) k.earlierOpen++; });
    k.state = !P.due.length ? 'none' : !k.behind ? 'ok' : k.behind === 1 ? 'warn' : 'bad';
    k.label = !P.due.length ? 'Nothing due yet' : !k.behind ? 'Caught up' : plural(k.behind, 'lesson') + ' to finish';
    return k;
  }
  function lessonState(s, l) { var n = doneIn(s, l), r = req(l); return n >= r ? 'ok' : n ? 'part' : 'none'; }
  function rangeText(ls2) { return !ls2.length ? '' : ls2.length === 1 ? 'Lesson ' + ls2[0].unit + '.' + ls2[0].num : 'Lessons ' + ls2[0].unit + '.' + ls2[0].num + '–' + ls2[ls2.length - 1].unit + '.' + ls2[ls2.length - 1].num; }
  function noCal(body) {
    var p = el('div', 'panel kp-empty', '<h3>Keeping up</h3><p class="muted">This needs the class calendar: it uses the calendar to know which lessons the class has done so far. Set one up on the Calendar tab.</p>');
    p.appendChild(button('btn-small', 'Open the Calendar tab', function () { D.goTab('calendar'); }));
    body.appendChild(p);
  }

  /* ---------------- Progress tab: All units | Keeping up ---------------- */
  function paceOn() { return (ls('hw:tpview') || 'pace') === 'pace'; }
  function viewSeg() {
    var seg = el('div', 'seg kp-seg'), P = pace();
    [['pace', 'Keeping up' + (P ? ' · Unit ' + P.unit + ' so far' : '')], ['all', 'All units']].forEach(function (x) {
      var b = el('button', ((paceOn() ? 'pace' : 'all') === x[0]) ? 'on' : '', esc(x[1])); b.type = 'button';
      b.addEventListener('click', function () { ls('hw:tpview', x[0]); D.render(); }); seg.appendChild(b);
    });
    seg.title = 'Keeping up: each student’s practice in the current unit, up to where the class is on the calendar. All units: everything, unit by unit.';
    return seg;
  }
  function cell(s, l, isToday) {
    var n = doneIn(s, l), r = req(l), k = lessonState(s, l), p = Math.round(100 * n / r);
    return '<td class="kp-lc kp-' + k + (isToday ? ' kp-today' : '') + '" title="Lesson ' + l.unit + '.' + l.num + ': ' + esc(l.title) + ' — ' + n + ' of ' + r + ' required' + (isToday ? ' (today’s lesson: not due yet)' : '') + '"><div class="kp-cbar"><i style="width:' + p + '%"></i></div><span>' + (k === 'ok' ? '✓' : n + '/' + r) + '</span></td>';
  }
  function renderPace(body) {
    var P = pace(); if (!P) { noCal(body); return; }
    var ss = D.students(), K = {};
    ss.forEach(function (s) { K[s.name] = keep(s, P); });
    // the summary
    var head = el('div', 'panel kp-head'); if (HW.unitStyle) head.setAttribute('style', HW.unitStyle(P.unit));
    var where = P.due.length ? rangeText(P.due) + ' taught so far' : 'Unit ' + P.unit + ' is just starting: nothing is due yet';
    var bits = [where]; if (P.today.length) bits.push('today: ' + rangeText(P.today)); if (P.next) bits.push('next: ' + esc(P.next.info.title) + ' (' + nice(P.next.date) + ')');
    head.innerHTML = '<div class="kp-ht"><b>Unit ' + P.unit + ' · ' + esc(P.uTitle) + '</b><span class="muted"> — ' + bits.join(' · ') + '</span></div>';
    var cnt = { ok: 0, warn: 0, bad: 0, none: 0 }; ss.forEach(function (s) { cnt[K[s.name].state]++; });
    if (P.due.length) head.appendChild(el('div', 'kp-chips', '<span class="kp-chip ok"><b>' + cnt.ok + '</b> caught up</span><span class="kp-chip warn"><b>' + cnt.warn + '</b> with 1 lesson to finish</span><span class="kp-chip bad"><b>' + cnt.bad + '</b> with 2 or more</span>'));
    head.appendChild(el('p', 'small muted kp-note', 'Counts the required practice of the lessons before today (' + (st.scope === 'class' ? 'work done in class only' : 'all work, in class or at home') + '). Today’s lesson is shown but isn’t due yet. Click a name for the student’s page and the Email home button.'));
    body.appendChild(head);
    // click a heading to sort by it; click again to turn it round (kept in hw:tpsort). First click: A–Z for names,
    // otherwise the students who are furthest behind first.
    var SK = { k: 'status', d: 1 }; try { var sv = JSON.parse(ls('hw:tpsort') || 'null'); if (sv && sv.k) SK = sv; } catch (e) {}
    var bar = el('div', 'opt-row kp-sortrow');
    bar.appendChild(el('div', 'legend', '<span><i class="kp-key ok"></i>Finished</span><span><i class="kp-key part"></i>Started</span><span><i class="kp-key none"></i>Not started</span><span class="muted">Click a heading to sort.</span>'));
    body.appendChild(bar);
    var cols = P.due.concat(P.today);
    function frac(a, b) { return b ? a / b : 1; }
    function val(s, k) {   // bigger = further along
      var x = K[s.name];
      if (k === 'status') return -x.behind * 1e6 - (x.req - x.done);
      if (k === 'sum') return frac(x.done, x.req) * 1e4 + x.done;
      if (k === 'earlier') return -x.earlierOpen * 1e6 - (x.earlierReq - x.earlierDone);
      var l = HW.lessons[k]; return l ? frac(doneIn(s, l), req(l)) : 0;
    }
    if (SK.k !== 'name' && SK.k !== 'status' && SK.k !== 'sum' && SK.k !== 'earlier' && !cols.some(function (l) { return l.id === SK.k; })) SK = { k: 'status', d: 1 };
    ss.sort(function (a, b) {
      var r = SK.k === 'name' ? a.name.localeCompare(b.name) : (val(a, SK.k) - val(b, SK.k));
      return r * SK.d || (SK.k !== 'status' ? val(a, 'status') - val(b, 'status') : 0) || a.name.localeCompare(b.name);
    });
    // the table
    function th(k, html, cls, title) {
      var on = SK.k === k;
      return '<th class="sortable' + (on ? ' sorted' : '') + (cls ? ' ' + cls : '') + '" data-s="' + esc(k) + '" tabindex="0" aria-sort="' + (on ? (SK.d > 0 ? 'ascending' : 'descending') : 'none') + '"' + (title ? ' title="' + esc(title) + '"' : '') + '>' + html + (on ? '<span class="sarrow" aria-hidden="true">' + (SK.d > 0 ? '▲' : '▼') + '</span>' : '') + '</th>';
    }
    var t = el('table', 'tbl kp-tbl'), h = '<thead><tr>' + th('name', 'Student') + th('status', 'Keeping up', '', 'Furthest behind first; click again for the reverse') + th('sum', 'Unit ' + P.unit + ' so far');
    cols.forEach(function (l) { var td = P.today.indexOf(l) >= 0; h += th(l.id, 'L' + l.unit + '.' + l.num + '<div class="th-sub">' + (td ? 'today' : nice(P.dates[l.id])) + '</div>', 'kp-lh' + (td ? ' kp-today' : ''), l.title); });
    h += th('earlier', 'Earlier units') + '</tr></thead>'; t.innerHTML = h;
    t.querySelectorAll('th.sortable').forEach(function (c) {
      function go() { var k = c.dataset.s; ls('hw:tpsort', JSON.stringify(SK.k === k ? { k: k, d: -SK.d } : { k: k, d: 1 })); D.render(); }
      c.addEventListener('click', go); c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    var tb = el('tbody');
    ss.forEach(function (s) {
      var k = K[s.name], tr = el('tr');
      var html = '<td><a href="#" class="slink">' + esc(s.name) + '</a>' + (s.roster && !s.roster.pin ? ' <span class="tag">not signed in yet</span>' : '') + '</td>';
      html += '<td><span class="kp-st ' + k.state + '">' + esc(k.label) + '</span></td>';
      html += '<td class="kp-sum">' + (k.req ? '<div class="kp-big"><i style="width:' + Math.round(100 * k.done / k.req) + '%"></i></div><div class="pnum"><b>' + k.done + '</b>/' + k.req + ' required</div>' : '<span class="muted">—</span>') + '</td>';
      cols.forEach(function (l) { html += cell(s, l, P.today.indexOf(l) >= 0); });
      html += '<td>' + (!k.earlierReq ? '<span class="muted">—</span>' : !k.earlierOpen ? '<span class="kp-st ok sm">All done</span>' : '<span class="kp-st ' + (k.earlierOpen > 1 ? 'bad' : 'warn') + ' sm">' + plural(k.earlierOpen, 'lesson') + ' open</span><div class="pnum">' + (k.earlierReq - k.earlierDone) + ' questions left</div>') + '</td>';
      tr.innerHTML = html;
      tr.querySelector('.slink').addEventListener('click', function (e) { e.preventDefault(); D.openStudent(s.name); });
      tb.appendChild(tr);
    });
    t.appendChild(tb); body.appendChild(D.wrapTbl(t));
  }

  /* ---------------- Student page: the Keeping up panel ---------------- */
  function studentPanel(s) {
    var P = pace(), p = el('div', 'panel kp-stu');
    if (!P) { p.innerHTML = '<h3>Keeping up</h3><p class="small muted">Set up the class calendar (Calendar tab) to see how this student is keeping up with the unit.</p>'; return p; }
    if (HW.unitStyle) p.setAttribute('style', HW.unitStyle(P.unit));
    var k = keep(s, P);
    p.appendChild(el('div', 'kp-sh', '<h3>Keeping up · Unit ' + P.unit + ' so far</h3><span class="kp-st ' + k.state + '">' + esc(k.label) + '</span>' + (k.req ? '<span class="muted small">' + k.done + ' of ' + k.req + ' required questions in ' + rangeText(P.due) + '</span>' : '')));
    var list = el('div', 'kp-ls');
    P.due.concat(P.today).forEach(function (l) {
      var n = doneIn(s, l), r = req(l), ks = lessonState(s, l), td = P.today.indexOf(l) >= 0;
      list.appendChild(el('div', 'kp-row kp-' + ks + (td ? ' kp-today' : ''), '<span class="kp-ln">Lesson ' + l.unit + '.' + l.num + '</span><span class="kp-lt">' + esc(l.title) + '</span><span class="kp-ld">' + (td ? 'today' : nice(P.dates[l.id])) + '</span><div class="kp-cbar"><i style="width:' + Math.round(100 * n / r) + '%"></i></div><span class="kp-ln2">' + (ks === 'ok' ? '✓ finished' : n + ' of ' + r) + '</span>'));
    });
    if (!P.due.length && !P.today.length) list.appendChild(el('p', 'small muted', 'Unit ' + P.unit + ' hasn’t started yet.'));
    p.appendChild(list);
    if (k.earlierReq) p.appendChild(el('p', 'small ' + (k.earlierOpen ? '' : 'muted'), k.earlierOpen ? '<b>Earlier units:</b> ' + plural(k.earlierOpen, 'lesson') + ' still open (' + (k.earlierReq - k.earlierDone) + ' required questions left).' : 'Earlier units: all the required practice is done.'));
    return p;
  }

  /* ---------------- Email home ---------------- */
  var FONT = 'font-family:Arial,Helvetica,sans-serif;';
  var COL = { ok: '#2f7d4a', part: '#d08a14', none: '#c0504d', track: '#e7e3da', ink: '#1f2430', muted: '#6b6f78', brand: '#0f5f5a', line: '#e3dfd5' };
  function ebar(p, color, w) {
    p = Math.max(0, Math.min(100, Math.round(p)));
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:' + (w || 200) + 'px;"><tr>' +
      (p ? '<td style="width:' + p + '%;height:10px;background:' + color + ';font-size:1px;line-height:1px;">&nbsp;</td>' : '') +
      (p < 100 ? '<td style="height:10px;background:' + COL.track + ';font-size:1px;line-height:1px;">&nbsp;</td>' : '') + '</tr></table>';
  }
  function escale(lv) {
    var i = SCALE.indexOf(lv), out = '<table role="presentation" cellpadding="0" cellspacing="2" border="0" style="border-collapse:separate;"><tr>';
    SCALE.forEach(function (x, j) {
      var on = i >= 0 && j <= i, me = j === i;
      out += '<td title="' + LNAME[x] + '" style="' + FONT + 'width:30px;height:18px;text-align:center;font-size:10px;font-weight:' + (me ? '700' : '400') + ';border-radius:3px;background:' + (me ? COL.brand : on ? '#9cc9c3' : COL.track) + ';color:' + (me ? '#fff' : on ? '#0b3f3b' : '#8a8d94') + ';">' + x + '</td>';
    });
    return out + '</tr></table>';
  }
  function h2(t) { return '<h3 style="' + FONT + 'font-size:16px;color:' + COL.brand + ';margin:22px 0 8px;">' + t + '</h3>'; }
  function para(t, extra) { return '<p style="' + FONT + 'font-size:14px;line-height:1.5;color:' + COL.ink + ';margin:0 0 10px;' + (extra || '') + '">' + t + '</p>'; }
  function small(t) { return '<p style="' + FONT + 'font-size:12px;line-height:1.45;color:' + COL.muted + ';margin:6px 0 0;">' + t + '</p>'; }
  var TD = 'style="' + FONT + 'font-size:13px;color:' + COL.ink + ';padding:6px 10px 6px 0;border-bottom:1px solid ' + COL.line + ';vertical-align:middle;"';
  var TH = 'style="' + FONT + 'font-size:12px;color:' + COL.muted + ';font-weight:700;text-align:left;padding:4px 10px 4px 0;border-bottom:2px solid ' + COL.line + ';"';
  function lessonTable(s, ls2, dates, todayL) {
    var t = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:600px;"><tr><th ' + TH + '>Lesson</th><th ' + TH + '>Practice done</th><th ' + TH + '></th></tr>';
    ls2.forEach(function (l) {
      var n = doneIn(s, l), r = req(l), k = lessonState(s, l), td = todayL && todayL.indexOf(l) >= 0;
      var word = k === 'ok' ? '<b style="color:' + COL.ok + ';">✓ Finished</b>' : td ? '<span style="color:' + COL.muted + ';">Today’s lesson</span>' : k === 'part' ? '<b style="color:' + COL.part + ';">' + n + ' of ' + r + ' done</b>' : '<b style="color:' + COL.none + ';">Not started</b>';
      t += '<tr><td ' + TD + '><b>' + l.unit + '.' + l.num + '</b> ' + esc(l.title) + (dates && dates[l.id] ? '<br><span style="color:' + COL.muted + ';font-size:11px;">' + (td ? 'today' : nice(dates[l.id])) + '</span>' : '') + '</td><td ' + TD + '>' + ebar(100 * n / r, k === 'ok' ? COL.ok : k === 'part' || td ? COL.part : COL.none, 140) + '</td><td ' + TD + ' nowrap>' + word + '</td></tr>';
    });
    return t + '</table>';
  }
  function indOf(pct) { if (!BANDS) return ''; for (var i = LADDER.length - 1; i >= 0; i--) if (pct >= BANDS[LADDER[i]][0]) return LADDER[i]; return 'NM'; }
  function outcomesOfUnit(u) { return String(u.outcomes || '').split(/\s*·\s*/).filter(function (o) { return o && o !== 'EXT'; }); }
  /* the student's level per outcome: unit test (best), else the higher of exit slips and practice */
  function levelOf(B, name, o) {
    var e = B && B.E[name], s = D.derive().stu[name], p = (e && e.prac[o]) || (s && s.outcomes[o]) || '', x = e && e.exit[o], t = e && e.test[o];
    if (t) return { lv: t.ind, from: 'unit test' };
    var pi = p ? LADDER.indexOf(p) : -1, xi = x ? LADDER.indexOf(x) : -1;
    if (pi < 0 && xi < 0) return null;
    return xi > pi ? { lv: x, from: 'exit slips' } : { lv: p, from: 'practice' };
  }
  function build(name, o) {
    var s = D.derive().stu[name], P = pace(), B = o.B, fn = firstName(name), crs = course(), parts = [], subj;
    var units = HW.CATALOG.filter(function (u) { return builtLessons(u).length; });
    var scopeUnits = o.scope === 'all' ? units.filter(function (u) { return !P || u.unit <= P.unit; }) : [unitOf(o.scope === 'cur' ? (P ? P.unit : units[0].unit) : Number(o.scope.slice(2)))];
    var U = scopeUnits[0], isCur = o.scope === 'cur' && P;
    subj = fn + '’s progress in ' + crs + (o.scope === 'all' ? '' : ' — Unit ' + U.unit);
    if (o.greet) parts.push(para(esc(o.greet)));
    if (o.note && o.note.trim()) parts.push(para(esc(o.note.trim()).replace(/\n{2,}/g, '</p><p style="' + FONT + 'font-size:14px;line-height:1.5;color:' + COL.ink + ';margin:0 0 10px;">').replace(/\n/g, '<br>')));
    var lead = o.scope === 'all' ? 'Here is an update on how ' + esc(fn) + ' is doing in ' + esc(crs) + ' so far this semester.'
      : isCur ? 'Here is an update on how ' + esc(fn) + ' is doing in ' + esc(crs) + '. We are working on <b>Unit ' + U.unit + ': ' + esc(U.title) + '</b>' + (P.due.length ? ' and have done ' + plural(P.due.length + P.today.length, 'lesson') + ' of ' + builtLessons(U).length + ' so far.' : '.')
      : 'Here is a summary of how ' + esc(fn) + ' did in <b>Unit ' + U.unit + ': ' + esc(U.title) + '</b> in ' + esc(crs) + '.';
    parts.push(para(lead));
    // keeping up with the practice
    if (o.inc.practice) {
      if (isCur) {
        var k = keep(s, P);
        parts.push(h2('Keeping up with the practice'));
        if (P.due.length) {
          parts.push(para(k.state === 'ok' ? '<b style="color:' + COL.ok + ';">' + esc(fn) + ' is caught up</b> — all the practice for the lessons so far is done. Great work!'
            : '<b style="color:' + (k.state === 'warn' ? COL.part : COL.none) + ';">' + esc(fn) + ' has ' + plural(k.behind, 'lesson') + ' of practice to finish</b> (' + (k.req - k.done) + ' of ' + k.req + ' questions so far are still to do).'));
          parts.push('<div style="margin:0 0 6px;">' + ebar(100 * k.done / k.req, k.state === 'ok' ? COL.ok : k.state === 'warn' ? COL.part : COL.none, 320) + '</div>' + small(k.done + ' of ' + k.req + ' practice questions done for the lessons so far in Unit ' + U.unit + '.'));
        } else parts.push(para('Unit ' + U.unit + ' is just getting started, so no practice is due yet.'));
        if (P.due.length || P.today.length) parts.push('<div style="margin-top:10px;">' + lessonTable(s, P.due.concat(P.today), P.dates, P.today) + '</div>');
        if (k.earlierOpen) parts.push(para('From earlier units, ' + plural(k.earlierOpen, 'lesson') + ' still ' + (k.earlierOpen === 1 ? 'has' : 'have') + ' practice to finish (' + (k.earlierReq - k.earlierDone) + ' questions).', 'margin-top:10px;'));
      } else if (o.scope === 'all') {
        parts.push(h2('Practice, unit by unit'));
        var t = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:600px;"><tr><th ' + TH + '>Unit</th><th ' + TH + '>Practice done</th><th ' + TH + '></th></tr>';
        scopeUnits.forEach(function (u) {
          var ls2 = builtLessons(u).filter(function (l) { return skipped().indexOf(l.id) < 0; }); if (P && u.unit === P.unit) ls2 = P.due.slice();
          var rq = 0, dn = 0; ls2.forEach(function (l) { rq += req(l); dn += doneIn(s, l); });
          var col = !rq ? COL.track : dn >= rq ? COL.ok : dn / rq >= 0.5 ? COL.part : COL.none;
          t += '<tr><td ' + TD + '><b>Unit ' + u.unit + '</b> ' + esc(u.title) + (P && u.unit === P.unit ? '<br><span style="color:' + COL.muted + ';font-size:11px;">so far (in progress)</span>' : '') + '</td><td ' + TD + '>' + ebar(rq ? 100 * dn / rq : 0, col, 140) + '</td><td ' + TD + ' nowrap>' + (rq ? (dn >= rq ? '<b style="color:' + COL.ok + ';">✓ All done</b>' : dn + ' of ' + rq) : '<span style="color:' + COL.muted + ';">nothing due yet</span>') + '</td></tr>';
        });
        parts.push(t + '</table>');
      } else {
        var ls3 = builtLessons(U).filter(function (l) { return skipped().indexOf(l.id) < 0; }), rq2 = 0, dn2 = 0; ls3.forEach(function (l) { rq2 += req(l); dn2 += doneIn(s, l); });
        parts.push(h2('Practice in Unit ' + U.unit));
        parts.push('<div style="margin:0 0 6px;">' + ebar(rq2 ? 100 * dn2 / rq2 : 0, dn2 >= rq2 ? COL.ok : COL.part, 320) + '</div>' + small(dn2 + ' of ' + rq2 + ' practice questions done.' + (dn2 < rq2 ? ' The practice stays open: finishing it is also what unlocks a retest of the unit test.' : '')));
        parts.push('<div style="margin-top:10px;">' + lessonTable(s, ls3, P ? P.dates : null, null) + '</div>');
      }
    }
    // outcome levels
    if (o.inc.outcomes) {
      var outs = []; scopeUnits.forEach(function (u) { outcomesOfUnit(u).forEach(function (x) { if (outs.indexOf(x) < 0) outs.push(x); }); });
      var rows = outs.map(function (x) { return { o: x, l: levelOf(B, name, x) }; }).filter(function (r) { return r.l || !isCur; });
      if (rows.length) {
        parts.push(h2('Where ' + esc(fn) + ' is with each outcome'));
        var t2 = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:600px;"><tr><th ' + TH + '>Outcome</th><th ' + TH + '>Level so far</th></tr>';
        rows.forEach(function (r) {
          t2 += '<tr><td ' + TD + '><b>' + esc(r.o) + '</b> ' + esc((HW.OUTCOMES && HW.OUTCOMES[r.o]) || '') + '</td><td ' + TD + '>' + (r.l ? escale(r.l.lv) + '<span style="' + FONT + 'font-size:12px;"><b>' + LNAME[r.l.lv] + '</b> <span style="color:' + COL.muted + ';">· from the ' + r.l.from + '</span></span>' : '<span style="color:' + COL.muted + ';">no evidence yet</span>') + '</td></tr>';
        });
        parts.push(t2 + '</table>');
        parts.push(small('Each outcome is reported on the school’s scale: Limited, Beginning, Emerging, Progressing, Advancing, Mastery. Once the unit test is written, the level comes from the test (the best attempt counts, so a retest can raise it); before that, it comes from the in-class exit slips and the online practice.'));
      }
    }
    // unit tests
    if (o.inc.tests && B) {
      var tl = [];
      scopeUnits.forEach(function (u) {
        var T = B.tests.filter(function (x) { return x.unit === u.unit; })[0], best = T && T.unitBest[name];
        if (T && best != null) tl.push('<tr><td ' + TD + '><b>Unit ' + u.unit + ' test</b> ' + esc(u.title) + '</td><td ' + TD + '>' + (indOf(best) ? escale(indOf(best)) + '<span style="' + FONT + 'font-size:12px;"><b>' + LNAME[indOf(best)] + '</b></span>' : '') + '</td></tr>');
        else if (T) tl.push('<tr><td ' + TD + '><b>Unit ' + u.unit + ' test</b> ' + esc(u.title) + '</td><td ' + TD + '><span style="color:' + COL.none + ';">not written yet</span></td></tr>');
      });
      if (tl.length) { parts.push(h2('Unit test' + (tl.length > 1 ? 's' : ''))); parts.push('<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;max-width:600px;">' + tl.join('') + '</table>'); parts.push(small('The best attempt counts. A retest can be requested once all of the unit’s required practice is done.')); }
    }
    // time on the website
    if (o.inc.time) {
      var a = 0, b = 0, from = '', to = '9999';
      if (o.scope !== 'all' && P) { var ds = builtLessons(U).map(function (l) { return P.layout.dateOf[l.id]; }).filter(Boolean).sort(); from = ds[0] || ''; var tdt = P.layout.dateOf['t' + U.unit]; to = isCur ? '9999' : (tdt || ds[ds.length - 1] || '9999'); }
      (st.D.days || []).forEach(function (d) { if (d[1] !== name || d[0] < from || d[0] > to) return; a += Number(d[3]) || 0; b += Number(d[4]) || 0; });
      if (o.scope === 'all' || !P) { a = s.secs; b = s.secsIn; }
      parts.push(h2('Time on the class website'));
      var when2 = o.scope === 'all' ? ' so far this semester' : ' in Unit ' + U.unit + (isCur ? ' so far' : '');
      parts.push(para(a < 30 ? 'No practice time on the class website' + when2 + ' yet.' : dur(b) + ' of practice during class' + (a - b >= 30 ? ', plus ' + dur(a - b) + ' outside class' : '') + when2 + '.'));
    }
    // coming up
    if (o.inc.next && isCur && P.next) {
      parts.push(h2('Coming up'));
      parts.push(para('<b>' + esc(P.next.info.title) + '</b>: ' + nice(P.next.date, true) + (P.next.inDays > 0 ? ' (in ' + plural(P.next.inDays, 'class day') + ')' : P.next.inDays === 0 ? ' (today)' : '') + '.' + (P.next.info.kind === 'test' ? ' Finishing the unit’s practice before then is the best way to get ready.' : '')));
    }
    parts.push(para('Practice can be done in class or at home on the class website: <a href="' + esc(o.link) + '" style="color:' + COL.brand + ';">' + esc(o.link.replace(/^https?:\/\//, '')) + '</a> (students sign in with their name and PIN).', 'margin-top:20px;'));
    parts.push(para('Please let me know if you have any questions.'));
    if (o.sign) parts.push(para(esc(o.sign).replace(/\n/g, '<br>'), 'margin-top:14px;'));
    return { subject: subj, html: '<div style="' + FONT + 'font-size:14px;color:' + COL.ink + ';max-width:640px;">' + parts.join('') + '</div>' };
  }

  function classLink() { var c = (st.classes || []).filter(function (x) { return x.code === st.klass; })[0], u = location.href.split('#')[0].split('?')[0].replace(/teacher\/?(index\.html)?$/, ''); return u + (c ? '?class=' + encodeURIComponent(c.show || c.code) : ''); }
  function openEmail(name) {
    closeEmail();
    var s = D.derive().stu[name]; if (!s) return;
    var P = pace(), RP = HW.DashReports, B = null, units = HW.CATALOG.filter(function (u) { return builtLessons(u).length; });
    var ov = el('div', 'kc-modal eh-modal'); ov.id = 'eh-modal'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    var box = el('div', 'kc-modal-box eh-box'); ov.appendChild(box);
    box.appendChild(el('div', 'eh-top', '<h3>Email home · ' + esc(name) + '</h3>'));
    var x = button('btn-ghost eh-x', '×', closeEmail); x.setAttribute('aria-label', 'Close'); box.querySelector('.eh-top').appendChild(x);
    var grid = el('div', 'eh-grid'), side = el('div', 'eh-side'), prevW = el('div', 'eh-prevw'), prev = el('div', 'eh-prev');
    grid.appendChild(side); grid.appendChild(prevW); box.appendChild(grid);
    // options
    var scope = el('select', 'field eh-scope');
    if (P) scope.appendChild(new Option('This unit so far (Unit ' + P.unit + ')', 'cur'));
    units.forEach(function (u) { if (!P || u.unit < P.unit) scope.appendChild(new Option('Unit ' + u.unit + ': ' + u.title, 'u:' + u.unit)); });
    scope.appendChild(new Option('The whole course so far', 'all'));
    function lab(t, c) { var w = el('label', 'eh-f', '<span>' + t + '</span>'); w.appendChild(c); return w; }
    side.appendChild(lab('About', scope));
    var inc = { practice: 'Keeping up with the practice', outcomes: 'Outcome levels', tests: 'Unit test results', time: 'Time on the website', next: 'What’s coming up (this unit)' }, boxes = {};
    var incW = el('div', 'eh-inc', '<span class="eh-fl">Include</span>');
    Object.keys(inc).forEach(function (k) { var c = el('input'); c.type = 'checkbox'; c.checked = true; boxes[k] = c; var w = el('label', 'eh-chk'); w.appendChild(c); w.appendChild(document.createTextNode(' ' + inc[k])); incW.appendChild(w); });
    side.appendChild(incW);
    var to = el('input', 'field'); to.type = 'email'; to.placeholder = 'parent@example.com (optional)'; to.value = ls('hw:famto:' + st.klass + '|' + name) || '';
    side.appendChild(lab('To <span class="muted small">(kept in this browser only)</span>', to));
    var greet = el('input', 'field'); greet.type = 'text'; greet.value = 'Hello,';
    side.appendChild(lab('Greeting', greet));
    var note = el('textarea', 'field eh-note'); note.rows = 4; note.placeholder = 'A sentence or two of your own (optional) — it goes first.';
    side.appendChild(lab('Your note', note));
    var sign = el('textarea', 'field eh-sign'); sign.rows = 3; sign.value = ls('hw:famsign') || 'Ryan Cathcart\n' + course() + ' · ' + SCHOOL + '\n' + TEACHER_EMAIL;
    side.appendChild(lab('Sign-off <span class="muted small">(remembered)</span>', sign));
    var subjW = el('div', 'eh-subj'); prevW.appendChild(subjW); prevW.appendChild(prev);
    var status = el('div', 'small muted eh-status');
    var acts = el('div', 'kc-modal-acts eh-acts');
    var cur = null;
    function draw() {
      cur = build(name, { scope: scope.value, B: B, inc: { practice: boxes.practice.checked, outcomes: boxes.outcomes.checked, tests: boxes.tests.checked, time: boxes.time.checked, next: boxes.next.checked }, greet: greet.value.trim(), note: note.value, sign: sign.value.trim(), link: classLink() });
      subjW.innerHTML = '<span class="muted small">Subject</span> <b>' + esc(cur.subject) + '</b>';
      prev.innerHTML = cur.html;
    }
    [scope, greet, note, sign].forEach(function (c) { c.addEventListener('input', draw); c.addEventListener('change', draw); });
    Object.keys(boxes).forEach(function (k) { boxes[k].addEventListener('change', draw); });
    to.addEventListener('change', function () { ls('hw:famto:' + st.klass + '|' + name, to.value.trim() || null); });
    sign.addEventListener('change', function () { ls('hw:famsign', sign.value.trim() || null); });
    function plain() { return prev.innerText.replace(/\n{3,}/g, '\n\n').trim(); }
    function copy() {
      var html = cur.html, txt = plain();
      if (navigator.clipboard && root.ClipboardItem) {
        return navigator.clipboard.write([new root.ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }), 'text/plain': new Blob([txt], { type: 'text/plain' }) })]).then(function () { return true; }, function () { return legacy(); });
      }
      return Promise.resolve(legacy());
    }
    function legacy() { try { var r = document.createRange(); r.selectNodeContents(prev); var sel = root.getSelection(); sel.removeAllRanges(); sel.addRange(r); var ok = document.execCommand('copy'); sel.removeAllRanges(); return ok; } catch (e) { return false; } }
    function said(ok, t) { status.innerHTML = ok ? '✓ ' + t : 'Couldn’t copy here: select the email on the right and copy it (Ctrl/⌘ C).'; status.className = 'small eh-status ' + (ok ? 'ok' : 'bad'); }
    acts.appendChild(status); acts.appendChild(el('span', 'kc-sp'));
    acts.appendChild(button('btn-ghost', 'Copy email', function () { copy().then(function (ok) { said(ok, 'Copied with its formatting. Paste it into a new email.'); }); }));
    acts.appendChild(button('btn-primary', 'Copy and open email', function () {
      copy().then(function (ok) {
        // the default mail app (Outlook): a new message with To and Subject; the formatted email is pasted into the body
        var a = document.createElement('a'); a.href = 'mailto:' + encodeURIComponent(to.value.trim()).replace(/%40/g, '@').replace(/%2C/gi, ',') + '?subject=' + encodeURIComponent(cur.subject);
        a.style.display = 'none'; document.body.appendChild(a); a.click(); a.remove();
        said(ok, 'Copied. In the new message, click in the body and paste (Ctrl/⌘ V).');
      });
    }));
    box.appendChild(acts);
    ov.addEventListener('click', function (e) { if (e.target === ov) closeEmail(); });
    document.addEventListener('keydown', escKey);
    document.body.appendChild(ov);
    draw();
    // exit slips and tests are marked in the background (the PowerSchool tab does the same); the email fills in when ready
    if (RP && RP.load && RP.build) {
      status.textContent = 'Loading exit slips and unit tests…';
      RP.load().then(function () { try { B = RP.build(); } catch (e) { B = null; } if (document.getElementById('eh-modal') === ov) { status.textContent = ''; draw(); } }, function () { status.textContent = 'Exit slips and tests couldn’t load: levels come from the practice only.'; });
    }
  }
  function escKey(e) { if (e.key === 'Escape') closeEmail(); }
  function closeEmail() { var o = document.getElementById('eh-modal'); if (o) o.remove(); document.removeEventListener('keydown', escKey); }
  function emailButton(name) { var b = button('btn-small eh-btn', '✉ Email home', function () { openEmail(name); }); b.title = 'Prepare an email to the family about this unit, an earlier unit or the whole course'; return b; }

  HW.DashPace = { pace: pace, keep: keep, paceOn: paceOn, viewSeg: viewSeg, renderPace: renderPace, studentPanel: studentPanel, emailButton: emailButton, openEmail: openEmail, build: build };
})(window);
