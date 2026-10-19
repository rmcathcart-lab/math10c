/* Practice Ledger — the Tests tab: make exit slips and tests from the practice questions (or a ready-made unit test),
 * launch one for the class, watch it live (unlock a student who left, add time, submit, end for everyone), then mark,
 * adjust and release the results. Marks are computed here from the students' saved answers with each question's own
 * checker (the same numbers the student saw, rebuilt from the seeds). See js/testcore.js and backend/Code.gs (TEST MODE). */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, esc = HW.esc, TC = HW.TestCore, D = HW.Dash;
  var st = D.state, LVN = HW.LEVEL_NAMES;
  var TS = { tests: null, liveAll: {}, sessions: null, view: 'home', edit: null, live: null, res: null, showMarks: false, timer: null, pick: { unit: 1, lesson: null, part: 'all' } };
  function api(a, p) { return D.api(a, p); }
  function cls() { return st.klass; }
  function klassLabel() { var c = (st.classes || []).filter(function (x) { return x.code === st.klass; })[0]; return c ? c.label : st.klass; }
  function button(cls2, html, fn) { var b = el('button', 'btn ' + cls2, html); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function ago(ms) { if (!ms) return '—'; var s = Math.round((Date.now() - ms) / 1000); if (s < 60) return s + ' s ago'; var m = Math.round(s / 60); if (m < 60) return m + ' min ago'; var h = Math.round(m / 60); return h < 36 ? h + ' h ago' : Math.round(h / 24) + ' d ago'; }
  function mmss(ms) { var neg = ms < 0, s = Math.abs(Math.round(ms / 1000)), m = Math.floor(s / 60); return (neg ? '−' : '') + m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }
  function kindChip(k) { return '<span class="tt-kind tt-' + (k === 'exit' ? 'exit' : 'test') + '">' + (k === 'exit' ? 'Exit slip' : 'Test') + '</span>'; }
  function partLabel(x) { return 'L' + x.lesson.num + ' ' + x.it.label; }
  function rerender() { if (st.tab === 'tests') D.render(); }

  function load(force) {
    if (TS.tests && !force) return Promise.resolve();
    return Promise.all([api('tests'), api('sessions', { 'class': cls() })]).then(function (r) {
      if (r[0].ok) { TS.tests = r[0].tests; TS.liveAll = r[0].live || {}; }
      if (r[1].ok) TS.sessions = r[1].sessions;
    });
  }
  function liveHere() { return TS.liveAll[cls()] || null; }

  /* ================= render ================= */
  TS.render = function (body) {
    if (TS.klass !== cls()) { TS.klass = cls(); TS.tests = null; TS.live = null; TS.res = null; if (TS.view !== 'edit') TS.view = 'home'; }
    if (!TS.tests) { body.appendChild(el('div', 'loading', 'Loading tests…')); load(true).then(rerender, function (e) { body.innerHTML = '<div class="panel">Couldn’t load tests: ' + esc(e.message) + '</div>'; }); return; }
    if (TS.view === 'edit') return renderEditor(body);
    if (TS.view === 'results' && TS.res) return renderResults(body);
    if (liveHere()) return renderLive(body);
    renderHome(body);
  };

  /* ================= home ================= */
  function renderHome(body) {
    var top = el('div', 'tt-top');
    top.appendChild(el('div', '', '<h2 class="tt-h">Tests and exit slips</h2><div class="small muted">Launch one and it pops up, full screen, on every signed-in student’s screen in <b>' + esc(klassLabel()) + '</b>. Leaving the window ends a student’s test; you can unlock it here.</div>'));
    var acts = el('div', 'tt-acts');
    acts.appendChild(button('btn-small tt-new-exit', '+ New exit slip', function () { openEditor(null, { kind: 'exit', minutes: 10 }); }));
    acts.appendChild(button('btn-small tt-new-test', '+ New test', function () { openEditor(null, { kind: 'test', minutes: 60 }); }));
    top.appendChild(acts); body.appendChild(top);
    var list = el('div', 'tt-list');
    if (!TS.tests.length) list.appendChild(el('div', 'panel muted', 'No tests yet. Make an exit slip or a test from the practice questions, or start from a ready-made unit test below.'));
    TS.tests.slice().sort(function (a, b) { return b.updated - a.updated; }).forEach(function (t) {
      var d = t.def || {}, n = (d.items || []).length;
      var card = el('div', 'tt-card tt-card-' + (d.kind === 'exit' ? 'exit' : 'test'));
      card.innerHTML = kindChip(d.kind) + '<div class="tt-title">' + esc(d.title) + '</div><div class="small muted">' + n + ' question' + (n === 1 ? '' : 's') + ' · ' + (d.minutes ? d.minutes + ' min' : 'no time limit') + ' · ' + (d.calc ? 'calculator' : 'no calculator') + (d.shuffle ? ' · shuffled' : '') + '</div>';
      var a = el('div', 'tt-card-acts');
      a.appendChild(button('btn-primary btn-small', 'Launch for ' + esc(klassLabel()), function () { doLaunch(t); }));
      a.appendChild(button('btn-small', 'Edit', function () { openEditor(t.id, t.def); }));
      a.appendChild(button('btn-small', 'Copy', function () { var c = JSON.parse(JSON.stringify(t.def)); c.title = c.title + ' (copy)'; openEditor(null, c); }));
      a.appendChild(button('btn-small btn-ghost', 'Delete', function () { if (!confirm('Delete “' + d.title + '”? Results already written stay.')) return; api('deltest', { id: t.id }).then(function () { return load(true); }).then(rerender); }));
      card.appendChild(a); list.appendChild(card);
    });
    body.appendChild(list);
    // ready-made unit tests (lessons marked test: true)
    var ready = Object.keys(HW.lessons).map(function (k) { return HW.lessons[k]; }).filter(function (l) { return l.test; });
    if (ready.length) {
      var p = el('div', 'panel'); p.appendChild(el('h3', '', 'Ready-made unit tests'));
      p.appendChild(el('p', 'small muted', 'Your paper unit tests, with number generators so every student gets their own version. Start from one, then trim or add questions before saving.'));
      ready.forEach(function (l) {
        var row = el('div', 'tt-ready', '<b>' + esc(l.title) + '</b> <span class="muted small">' + l.items.length + ' questions · ' + esc(l.outcome || '') + '</span>');
        row.appendChild(button('btn-small', 'Use as a test', function () { openEditor(null, { title: l.title, kind: 'test', minutes: 75, calc: true, levels: true, items: l.items.map(function (it) { return { l: l.id, i: it.id }; }) }); }));
        p.appendChild(row);
      });
      body.appendChild(p);
    }
    // past launches
    var ps = el('div', 'panel'); ps.appendChild(el('h3', '', 'Past launches in ' + esc(klassLabel())));
    if (!TS.sessions || !TS.sessions.length) ps.appendChild(el('p', 'small muted', 'None yet.'));
    else {
      var t = el('table', 'tbl'); t.innerHTML = '<thead><tr><th>Launched</th><th>Title</th><th>Written</th><th>Results</th><th></th></tr></thead>';
      var tb = el('tbody');
      TS.sessions.forEach(function (s) {
        var tr = el('tr'); tr.innerHTML = '<td>' + new Date(s.launched).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + '</td><td>' + kindChip(s.kind) + ' ' + esc(s.title) + '</td><td>' + s.results + '</td><td>' + (s.released ? '<span class="tag good">Released</span>' : '<span class="tag">Not released</span>') + '</td><td></td>';
        tr.lastChild.appendChild(button('btn-small', 'Results', function () { openResults(s.id); }));
        tb.appendChild(tr);
      });
      t.appendChild(tb); var w = el('div', 'tbl-wrap'); w.appendChild(t); ps.appendChild(w);
    }
    body.appendChild(ps);
  }
  function doLaunch(t) {
    if (liveHere()) { alert('A test is already live in this class.'); return; }
    if (!confirm('Launch “' + t.def.title + '” for ' + klassLabel() + ' now?\n\nIt pops up on every signed-in student’s screen within about 10 seconds.')) return;
    api('launch', { 'class': cls(), test: t.id }).then(function (d) {
      if (!d.ok) { alert(d.error === 'live' ? 'A test is already live in this class.' : 'Couldn’t launch: ' + d.error); }
      return load(true);
    }).then(function () { TS.live = null; rerender(); });
  }

  /* ================= editor ================= */
  function openEditor(id, def) {
    def = def || {};
    TS.edit = { id: id, title: def.title || '', kind: def.kind || 'test', minutes: def.minutes != null ? def.minutes : 60, calc: def.calc !== false, shuffle: !!def.shuffle, levels: def.levels !== false, items: (def.items || []).slice() };
    TS.view = 'edit'; rerender();
  }
  var typeCache = {};
  function inputType(lesson, it) { var k = lesson.id + ':' + it.id; if (!(k in typeCache)) typeCache[k] = TC.inputType(lesson, it); return typeCache[k]; }
  function sample(lesson, it) {
    try { var inst = HW.makeInstance(lesson, it, 12345, 678); return (inst.stem ? '<div class="tt-stem">' + HW.tex(inst.stem) + '</div>' : '') + HW.tex(inst.prompt); } catch (e) { return '<span class="muted">(can’t preview)</span>'; }
  }
  function renderEditor(body) {
    var E = TS.edit;
    var head = el('div', 'tt-top');
    head.appendChild(el('h2', 'tt-h', (E.id ? 'Edit ' : 'New ') + (E.kind === 'exit' ? 'exit slip' : 'test')));
    var acts = el('div', 'tt-acts');
    acts.appendChild(button('btn-ghost btn-small', 'Cancel', function () { TS.view = 'home'; rerender(); }));
    var save = button('btn-primary btn-small', 'Save', function () {
      if (!E.title.trim()) { alert('Give it a title.'); return; }
      if (!E.items.length) { alert('Pick at least one question.'); return; }
      save.disabled = true;
      api('savetest', { id: E.id || '', def: JSON.stringify({ title: E.title.trim(), kind: E.kind, minutes: E.minutes, calc: E.calc, shuffle: E.shuffle, levels: E.levels, items: E.items }) }).then(function (d) {
        if (!d.ok) { alert('Couldn’t save: ' + d.error); save.disabled = false; return; }
        TS.view = 'home'; return load(true).then(rerender);
      });
    });
    acts.appendChild(save); head.appendChild(acts); body.appendChild(head);
    // settings
    var p = el('div', 'panel tt-settings');
    var title = el('input', 'field'); title.placeholder = 'Title, e.g. Exit slip 1.3 or Unit 1 Test'; title.value = E.title; title.addEventListener('input', function () { E.title = title.value; });
    p.appendChild(el('label', 'tt-lbl', 'Title')); p.appendChild(title);
    var row = el('div', 'tt-row');
    var kind = el('div', 'seg'); [['exit', 'Exit slip (yellow)'], ['test', 'Test (orange)']].forEach(function (k) { var b = button(E.kind === k[0] ? 'on' : '', k[1], function () { E.kind = k[0]; rerender(); }); b.className = E.kind === k[0] ? 'on' : ''; kind.appendChild(b); });
    row.appendChild(kind);
    var mins = el('input', 'field tt-mins'); mins.type = 'number'; mins.min = 0; mins.max = 240; mins.value = E.minutes; mins.addEventListener('input', function () { E.minutes = Math.max(0, Math.round(Number(mins.value) || 0)); });
    var ml = el('label', 'tt-inline', 'Time limit '); ml.appendChild(mins); ml.appendChild(document.createTextNode(' min (0 = none)')); row.appendChild(ml);
    function check(lbl, key, tip) { var l = el('label', 'tt-inline'), c = el('input'); c.type = 'checkbox'; c.checked = !!E[key]; c.addEventListener('change', function () { E[key] = c.checked; }); l.appendChild(c); l.appendChild(document.createTextNode(' ' + lbl)); if (tip) l.title = tip; return l; }
    row.appendChild(check('Calculator allowed', 'calc', 'Shows the on-screen TI-30XIIS on the test. Untick for a no-calculator test.'));
    row.appendChild(check('Shuffle question order', 'shuffle', 'Every student gets the questions in a different order (their numbers are always their own).'));
    row.appendChild(check('Show outcome and level on each question', 'levels'));
    p.appendChild(row); body.appendChild(p);
    // picker + chosen
    var grid = el('div', 'tt-edit-grid'), left = el('div', 'panel tt-picker'), right = el('div', 'panel tt-chosen');
    grid.appendChild(left); grid.appendChild(right); body.appendChild(grid);
    drawPicker(left, right); drawChosen(right, left);
  }
  function chosenIndex(l, i) { var E = TS.edit; for (var k = 0; k < E.items.length; k++) if (E.items[k].l === l && E.items[k].i === i) return k; return -1; }
  function drawPicker(left, right) {
    var P = TS.pick; left.innerHTML = '';
    left.appendChild(el('h3', '', 'Pick questions'));
    var bar = el('div', 'tt-row');
    var us = el('select', 'field tt-sel'); HW.CATALOG.forEach(function (u) { if (!u.lessons.some(function (c) { return HW.lessons[c.id]; })) return; var o = el('option', '', 'Unit ' + u.unit + ' · ' + esc(u.title)); o.value = u.unit; if (u.unit === P.unit) o.selected = true; us.appendChild(o); });
    us.addEventListener('change', function () { P.unit = Number(us.value); P.lesson = null; drawPicker(left, right); });
    var unit = HW.CATALOG.filter(function (u) { return u.unit === P.unit; })[0] || HW.CATALOG[0];
    var lessons = unit.lessons.filter(function (c) { return HW.lessons[c.id]; });
    if (!P.lesson || !lessons.some(function (c) { return c.id === P.lesson; })) P.lesson = lessons.length ? lessons[0].id : null;
    var lsel = el('select', 'field tt-sel'); lessons.forEach(function (c) { var o = el('option', '', 'Lesson ' + esc(c.num) + ' · ' + esc(c.title)); o.value = c.id; if (c.id === P.lesson) o.selected = true; lsel.appendChild(o); });
    lsel.addEventListener('change', function () { P.lesson = lsel.value; drawPicker(left, right); });
    var part = el('div', 'seg'); [['all', 'All'], ['req', 'Assignment'], ['extra', 'Extra practice']].forEach(function (x) { var b = button('', x[1], function () { P.part = x[0]; drawPicker(left, right); }); b.className = P.part === x[0] ? 'on' : ''; part.appendChild(b); });
    bar.appendChild(us); bar.appendChild(lsel); bar.appendChild(part); left.appendChild(bar);
    var lesson = HW.lessons[P.lesson]; if (!lesson) return;
    var list = el('div', 'tt-parts');
    lesson.items.forEach(function (it) {
      if (P.part === 'req' && it.extra) return; if (P.part === 'extra' && !it.extra) return;
      var type = inputType(lesson, it), no = TC.NO_TEST[type], on = chosenIndex(lesson.id, it.id) >= 0;
      var r = el('div', 'tt-part' + (on ? ' on' : '') + (no ? ' no' : ''));
      var cb = el('input'); cb.type = 'checkbox'; cb.checked = on; cb.disabled = !!no;
      cb.addEventListener('change', function () { var k = chosenIndex(lesson.id, it.id); if (cb.checked && k < 0) TS.edit.items.push({ l: lesson.id, i: it.id }); if (!cb.checked && k >= 0) TS.edit.items.splice(k, 1); r.classList.toggle('on', cb.checked); drawChosen(right, left); });
      var meta = el('div', 'tt-part-meta', '<b>' + esc(it.label) + '</b> <span class="tt-out">' + esc(it.outcome) + '</span> <span class="lvl lvl-' + it.level + '">' + LVN[it.level] + '</span>' + (no ? ' <span class="tag">step-by-step input: not for tests</span>' : ''));
      var lab = el('label', 'tt-part-head'); lab.appendChild(cb); lab.appendChild(meta); r.appendChild(lab);
      r.appendChild(el('div', 'tt-part-q', sample(lesson, it)));
      list.appendChild(r);
    });
    left.appendChild(list);
    left.appendChild(el('p', 'small muted', 'The preview shows one version; each student gets their own numbers.'));
  }
  function drawChosen(right, left) {
    var E = TS.edit; right.innerHTML = '';
    right.appendChild(el('h3', '', 'In this ' + (E.kind === 'exit' ? 'exit slip' : 'test') + ' (' + E.items.length + ')'));
    var by = {}; E.items.forEach(function (x) { var it = HW.lessons[x.l] && HW.lessons[x.l].byId[x.i]; if (!it) return; var k = it.outcome; by[k] = by[k] || {}; by[k][it.level] = (by[k][it.level] || 0) + 1; });
    if (E.items.length) right.appendChild(el('div', 'small muted tt-mix', Object.keys(by).map(function (o) { return '<b>' + esc(o) + '</b> ' + HW.LEVELS.filter(function (lv) { return by[o][lv]; }).map(function (lv) { return by[o][lv] + ' ' + lv; }).join(', '); }).join(' · ')));
    var ol = el('ol', 'tt-chosen-list');
    E.items.forEach(function (x, i) {
      var lesson = HW.lessons[x.l], it = lesson && lesson.byId[x.i];
      var li = el('li', '', it ? '<span><b>L' + esc(lesson.num) + ' ' + esc(it.label) + '</b> <span class="lvl lvl-' + it.level + '">' + it.level + '</span> <span class="tt-out">' + esc(it.outcome) + '</span></span>' : '<span class="muted">' + esc(x.l + ' ' + x.i) + ' (missing)</span>');
      var a = el('span', 'tt-mv');
      a.appendChild(button('btn-ghost btn-xs', '↑', function () { if (i) { E.items.splice(i - 1, 0, E.items.splice(i, 1)[0]); drawChosen(right, left); } }));
      a.appendChild(button('btn-ghost btn-xs', '↓', function () { if (i < E.items.length - 1) { E.items.splice(i + 1, 0, E.items.splice(i, 1)[0]); drawChosen(right, left); } }));
      a.appendChild(button('btn-ghost btn-xs', '✕', function () { E.items.splice(i, 1); drawChosen(right, left); drawPicker(left, right); }));
      li.appendChild(a); ol.appendChild(li);
    });
    right.appendChild(ol);
    if (!E.items.length) right.appendChild(el('p', 'small muted', 'Tick questions on the left. Each part is one question on the test.'));
  }

  /* ================= live monitor ================= */
  function pollLive() {
    if (st.tab !== 'tests' || TS.view === 'edit' || document.visibilityState !== 'visible') return;
    if (!liveHere() && TS.view !== 'live') return;
    api('tlive', { 'class': cls() }).then(function (d) {
      if (!d.ok) return;
      if (!d.live) { if (liveHere()) { delete TS.liveAll[cls()]; load(true).then(rerender); } return; }
      TS.liveAll[cls()] = d.live; TS.live = d; if (st.tab === 'tests' && TS.view !== 'edit' && TS.view !== 'results') rerender();
    }).catch(function () {});
  }
  setInterval(pollLive, 5000);
  var gradeCache = {};
  function gradeOne(name, sid, x, ans) {
    var k = name + '|' + sid + '|' + x.key + '|' + JSON.stringify(ans && ans.r); if (k in gradeCache) return gradeCache[k];
    var m = 'b'; if (ans && ans.r != null) { try { var inst = TC.instance(TC.skey(cls(), name), sid, x.lesson, x.it); m = TC.grade(inst, ans.r).m; } catch (e) { m = 'f'; } }
    return (gradeCache[k] = m);
  }
  function statusOf(rec, now) {
    if (!rec) return { k: 'none', t: 'Not started' };
    if (rec.st === 'writing') return now - rec.at > 45000 ? { k: 'quiet', t: 'Writing — no signal for ' + Math.round((now - rec.at) / 1000) + ' s' } : { k: 'writing', t: 'Writing' };
    if (rec.st === 'left') return { k: 'left', t: 'Locked: ' + (rec.why || 'left the test') };
    return { k: 'done', t: { submitted: 'Submitted', time: 'Out of time', ended: 'Ended', forced: 'Submitted by you' }[rec.st] || rec.st };
  }
  function renderLive(body) {
    var live = liveHere();
    if (!TS.live || !TS.live.live || TS.live.live.id !== live.id) { body.appendChild(el('div', 'loading', 'Loading the live test…')); TS.view = 'live'; pollLive(); return; }
    TS.view = 'live';
    var d = TS.live, def = d.def || {}, items = TC.items(def), now = d.now || Date.now(), names = d.names.slice().sort(function (a, b) { return a.localeCompare(b); });
    var counts = { none: 0, writing: 0, quiet: 0, left: 0, done: 0 };
    var rows = names.map(function (n) { var rec = d.recs[n], s = statusOf(rec, now); counts[s.k]++; return { name: n, rec: rec, s: s }; });
    var ord = { left: 0, quiet: 1, writing: 2, none: 3, done: 4 };
    rows.sort(function (a, b) { return ord[a.s.k] - ord[b.s.k] || a.name.localeCompare(b.name); });
    var head = el('div', 'tt-live-head tt-live-' + (def.kind === 'exit' ? 'exit' : 'test'));
    head.innerHTML = '<div>' + kindChip(def.kind) + ' <b class="tt-live-title">' + esc(def.title) + '</b> <span class="tag live-tag">LIVE</span><div class="small muted">Launched ' + ago(live.launched) + ' · ' + items.length + ' questions · ' + (def.minutes ? def.minutes + ' min' + ((live.extra || {})['*'] ? ' + ' + live.extra['*'] + ' min for everyone' : '') : 'no time limit') + ' · ' + (def.calc ? 'calculator' : 'no calculator') + (live.ending ? ' · <b class="tt-ending">Ending: tests submit at their next check-in (≈10 s)</b>' : '') + '</div></div>';
    var acts = el('div', 'tt-acts');
    if (def.minutes) acts.appendChild(button('btn-small', '+5 min for everyone', function () { ctl('time', '', 5); }));
    if (!live.ending) acts.appendChild(button('btn-small', 'End for everyone', function () { if (confirm('End the test for everyone? Every test still open is submitted as it is.')) ctl('end'); }));
    else acts.appendChild(button('btn-small', 'Undo end', function () { ctl('resume'); }));
    acts.appendChild(button('btn-primary btn-small', 'Close and mark', function () {
      if (counts.writing + counts.quiet && !confirm((counts.writing + counts.quiet) + ' student(s) are still writing. Close anyway? What they have so far is kept.')) return;
      api('tctl', { 'class': cls(), op: 'close' }).then(function (r) { delete TS.liveAll[cls()]; TS.live = null; return load(true).then(function () { return r.closed ? openResults(r.closed) : rerender(); }); });
    }));
    head.appendChild(acts); body.appendChild(head);
    body.appendChild(el('div', 'live-chips tt-chips', '<span class="lchip"><b>' + counts.none + '</b> not started</span><span class="lchip work"><b>' + (counts.writing + counts.quiet) + '</b> writing</span><span class="lchip away"><b>' + counts.left + '</b> locked (left the test)</span><span class="lchip"><b>' + counts.done + '</b> finished</span>' +
      '<label class="tt-inline small"><input type="checkbox" class="tt-showmarks"' + (TS.showMarks ? ' checked' : '') + '> Show right/wrong as they write</label>'));
    body.querySelector('.tt-showmarks').addEventListener('change', function (e) { TS.showMarks = e.target.checked; rerender(); });
    var t = el('table', 'tbl tt-live');
    t.innerHTML = '<thead><tr><th>Student</th><th>Status</th><th>Answered</th><th>Questions</th><th>On</th><th>Time left</th><th>Last check-in</th><th></th></tr></thead>';
    var tb = el('tbody');
    rows.forEach(function (x) {
      var rec = x.rec, tr = el('tr', 'tt-st-' + x.s.k), ans = rec ? rec.ans || {} : {}, order = rec && rec.order ? rec.order : items.map(function (y) { return y.key; });
      var byKey = {}; items.forEach(function (y) { byKey[y.key] = y; });
      var dots = order.map(function (k, i) { var y = byKey[k]; if (!y) return ''; var a = ans[k], m = a && a.t ? (TS.showMarks ? gradeOne(x.name, live.id, y, a) : 'a') : 'b'; return '<i class="tt-dot m-' + m + (rec && rec.cur === i && rec.st === 'writing' ? ' cur' : '') + '" title="Q' + (i + 1) + ': ' + esc(y.it.label) + (a && a.t ? ' — ' + esc(a.t) : ' — not answered') + '"></i>'; }).join('');
      var left = '—';
      if (rec && def.minutes) { var lim = (def.minutes + (Number((live.extra || {})['*']) || 0) + (Number((live.extra || {})[x.name.toLowerCase().replace(/\s+/g, ' ').trim()]) || 0)) * 60000; left = mmss(lim - (rec.used || 0) - (rec.st === 'writing' ? Math.max(0, now - rec.at) : 0)); }
      tr.innerHTML = '<td><b>' + esc(x.name) + '</b></td><td><span class="dot ' + x.s.k + '"></span>' + esc(x.s.t) + (rec && rec.st === 'writing' && !rec.fs ? ' <span class="tag">not full screen</span>' : '') + (rec && rec.leaves ? ' <span class="warnnum" title="Times locked for leaving">' + rec.leaves + '</span>' : '') + '</td>' +
        '<td>' + (rec ? (rec.n || 0) + ' / ' + items.length : '—') + '</td><td class="tt-dots">' + (rec ? dots : '') + '</td><td>' + (rec && rec.st === 'writing' ? 'Q' + ((rec.cur || 0) + 1) : '—') + '</td><td>' + left + '</td><td>' + (rec ? ago(rec.at) : '—') + '</td><td class="acts"></td>';
      var a = tr.lastChild;
      if (rec && rec.st === 'left') a.appendChild(button('btn-small btn-primary', 'Unlock', function () { ctl('unlock', x.name, 0); }));
      if (rec && rec.st !== 'writing' && rec.st !== 'left') a.appendChild(button('btn-small btn-ghost', 'Reopen', function () { if (confirm('Let ' + x.name + ' reopen their test and keep working?')) ctl('unlock', x.name, 0); }));
      if (rec && def.minutes) a.appendChild(button('btn-small btn-ghost', '+5 min', function () { ctl('time', x.name, 5); }));
      if (rec && rec.st === 'writing') a.appendChild(button('btn-small btn-ghost', 'Submit now', function () { if (confirm('Submit ' + x.name + '’s test now?')) ctl('submit', x.name); }));
      tb.appendChild(tr);
    });
    t.appendChild(tb); var w = el('div', 'tbl-wrap'); w.appendChild(t); body.appendChild(w);
    body.appendChild(el('p', 'small muted', 'Refreshes every 5 s. A student who leaves the window, switches tabs or leaves full screen is submitted and locked; <b>Unlock</b> lets them carry on with the same numbers and answers (the time they were locked doesn’t count). Dots: grey = not answered, blue = answered' + (TS.showMarks ? ', green = right, red = wrong, amber = not in the right form' : '') + '.'));
  }
  function ctl(op, name, mins) {
    return api('tctl', { 'class': cls(), op: op, name: name || '', mins: mins || 0 }).then(function (d) { if (!d.ok) alert(d.error); else if (d.live) TS.liveAll[cls()] = d.live; pollLive(); });
  }

  /* ================= results ================= */
  function openResults(sid) {
    TS.view = 'results'; TS.res = null; rerender();
    return api('tresults', { session: sid }).then(function (d) {
      if (!d.ok) { alert(d.error); TS.view = 'home'; rerender(); return; }
      TS.res = d; computeMarks(); rerender();
    });
  }
  function computeMarks() {
    var R = TS.res, def = R.session.def, items = TC.items(def);
    R.items = items;
    R.rows.forEach(function (r) {
      var saved = r.marks || '', auto = items.map(function (x) { return gradeOne(r.name, R.session.id, x, r.answers[x.key]); }).join('');
      r.auto = auto;
      r.final = items.map(function (x, i) { var s = saved.charAt(i); return s === 'C' || s === 'W' ? s : auto.charAt(i); }).join('');
      r.sum = TC.summary(def, r.final);
      r.dirty = r.final !== saved;
    });
  }
  function renderResults(body) {
    var R = TS.res, s = R.session, items = R.items, def = s.def;
    var head = el('div', 'tt-top');
    head.appendChild(el('div', '', '<button class="btn btn-ghost btn-small tt-back">← All tests</button><h2 class="tt-h">' + kindChip(s.kind) + ' ' + esc(s.title) + '</h2><div class="small muted">Launched ' + new Date(s.launched).toLocaleString() + (s.closed ? ' · closed ' + new Date(s.closed).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '') + ' · ' + (s.released ? '<b>Released to students</b>' : 'Not released yet') + '</div>'));
    head.querySelector('.tt-back').addEventListener('click', function () { TS.view = 'home'; TS.res = null; load(true).then(rerender); });
    var acts = el('div', 'tt-acts');
    var dirty = R.rows.some(function (r) { return r.dirty; });
    acts.appendChild(button('btn-small', dirty ? 'Save marks' : 'Marks saved', function () { saveMarks().then(rerender); }));
    acts.appendChild(button('btn-small btn-primary', s.released ? 'Hide results from students' : 'Release results to students', function () {
      var on = !s.released;
      if (on && !confirm('Release the results? Each student will see their score, their answers, the correct answers and worked solutions on their home page.')) return;
      saveMarks().then(function () { return api('release', { session: s.id, on: on ? 1 : 0 }); }).then(function () { s.released = on ? Date.now() : 0; rerender(); });
    }));
    acts.appendChild(button('btn-small btn-ghost', 'Download CSV', function () { csv(); }));
    head.appendChild(acts); body.appendChild(head);
    var outs = []; items.forEach(function (x) { if (outs.indexOf(x.it.outcome) < 0) outs.push(x.it.outcome); });
    var t = el('table', 'tbl tt-res');
    var h = '<thead><tr><th>Student</th><th>Status</th><th>Score</th>' + outs.map(function (o) { return '<th>' + esc(o) + '</th>'; }).join('');
    items.forEach(function (x, i) { h += '<th class="tt-qh" title="' + esc(partLabel(x)) + ' · ' + esc(x.it.outcome) + ' ' + x.it.level + '">' + (i + 1) + '<div class="th-sub">' + x.it.level + '</div></th>'; });
    t.innerHTML = h + '</tr></thead>';
    var tb = el('tbody'), byName = {}; R.rows.forEach(function (r) { byName[r.name] = r; });
    var names = R.names.slice(); R.rows.forEach(function (r) { if (names.indexOf(r.name) < 0) names.push(r.name); });
    names.sort(function (a, b) { return a.localeCompare(b); });
    var right = items.map(function () { return 0; }), wrote = 0;
    names.forEach(function (n) {
      var r = byName[n], tr = el('tr');
      if (!r) { tr.innerHTML = '<td>' + esc(n) + '</td><td class="muted">Didn’t write</td><td colspan="' + (1 + outs.length + items.length) + '"></td>'; tb.appendChild(tr); return; }
      wrote++;
      var stt = { submitted: 'Submitted', left: 'Left the test', time: 'Out of time', ended: 'Ended', forced: 'Submitted by you' }[r.status] || r.status;
      var html = '<td><b>' + esc(n) + '</b></td><td>' + esc(stt) + (r.leaves ? ' <span class="warnnum" title="Times locked for leaving">' + r.leaves + '</span>' : '') + '</td><td><b>' + r.sum.score + '</b> / ' + r.sum.total + ' <span class="muted small">' + Math.round(100 * r.sum.score / Math.max(1, r.sum.total)) + '%</span></td>';
      outs.forEach(function (o) { var lv = r.sum.levels[o]; html += '<td>' + (lv ? '<span class="lvl lvl-' + lv + '">' + LVN[lv] + '</span>' : '<span class="muted small">—</span>') + '</td>'; });
      tr.innerHTML = html;
      items.forEach(function (x, i) {
        var m = r.final.charAt(i); if (TC.right(m)) right[i]++;
        var td = el('td', 'tt-m m-' + m + (m === 'C' || m === 'W' ? ' over' : ''), { c: '✓', C: '✓', w: '✗', W: '✗', f: '~', b: '–' }[m] || '?');
        td.title = TC.MARK_NAMES[m] + ' — click to see the answer and change the mark';
        td.addEventListener('click', function () { detail(r, i); });
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    var fr = el('tr', 'tt-foot'); fr.innerHTML = '<td colspan="' + (3 + outs.length) + '" class="small muted">Right (of ' + wrote + ' who wrote)</td>' + items.map(function (x, i) { return '<td class="small">' + (wrote ? Math.round(100 * right[i] / wrote) + '%' : '—') + '</td>'; }).join('');
    tb.appendChild(fr);
    t.appendChild(tb); var w = el('div', 'tbl-wrap'); w.appendChild(t); body.appendChild(w);
    body.appendChild(el('p', 'small muted', '✓ right · ✗ wrong · ~ not in the right form (e.g. not simplified — counts as wrong) · – blank. Marks come from each question’s own checker. Click a mark to see the student’s question and answer and to change it (your changes show underlined). Outcome level = the hardest level answered correctly on that outcome.'));
    var dbox = el('div', 'panel tt-detail hidden'); dbox.id = 'tt-detail'; body.appendChild(dbox);
  }
  function detail(r, i) {
    var R = TS.res, x = R.items[i], box = document.getElementById('tt-detail'); if (!box) return;
    var inst; try { inst = TC.instance(TC.skey(R.session['class'], r.name), R.session.id, x.lesson, x.it); } catch (e) { inst = null; }
    var a = r.answers[x.key], m = r.final.charAt(i);
    box.classList.remove('hidden'); box.innerHTML = '';
    box.appendChild(el('h3', '', esc(r.name) + ' · Question ' + (i + 1) + ' <span class="muted small">(' + esc(partLabel(x)) + ' · ' + esc(x.it.outcome) + ' ' + x.it.level + ')</span>'));
    if (inst) { if (inst.stem) box.appendChild(el('div', 'qstem', HW.tex(inst.stem))); box.appendChild(el('div', 'qprompt', HW.tex(inst.prompt))); }
    box.appendChild(el('div', 'tt-ans', '<div class="dlabel">Their answer</div><div>' + (a && a.t ? esc(a.t) : '<span class="muted">blank</span>') + '</div>'));
    if (inst) box.appendChild(el('div', 'tt-ans', '<div class="dlabel">Correct answer</div><div>' + HW.tex(inst.answer) + '</div>'));
    box.appendChild(el('div', 'tt-ans', '<div class="dlabel">Mark</div><div>' + esc(TC.MARK_NAMES[m] || m) + (r.auto.charAt(i) !== m ? ' <span class="muted small">(checker said: ' + esc(TC.MARK_NAMES[r.auto.charAt(i)]) + ')</span>' : '') + '</div>'));
    var acts = el('div', 'tt-acts');
    function setM(v) { r.final = r.final.slice(0, i) + v + r.final.slice(i + 1); r.sum = TC.summary(R.session.def, r.final); r.dirty = true; rerender(); setTimeout(function () { detail(r, i); }, 0); }
    acts.appendChild(button('btn-small', 'Mark right', function () { setM('C'); }));
    acts.appendChild(button('btn-small', 'Mark wrong', function () { setM('W'); }));
    acts.appendChild(button('btn-small btn-ghost', 'Use the checker’s mark', function () { setM(r.auto.charAt(i)); }));
    box.appendChild(acts);
    HW.texIn && HW.texIn(box);
    try { box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
  }
  function saveMarks() {
    var R = TS.res, data = {};
    R.rows.forEach(function (r) { data[r.name] = { m: r.final, s: r.sum.score, t: r.sum.total }; });
    return api('setmarks', { session: R.session.id, data: JSON.stringify(data) }).then(function (d) { if (d.ok) R.rows.forEach(function (r) { r.marks = r.final; r.dirty = false; }); else alert('Couldn’t save marks: ' + d.error); });
  }
  function csv() {
    var R = TS.res, items = R.items, outs = []; items.forEach(function (x) { if (outs.indexOf(x.it.outcome) < 0) outs.push(x.it.outcome); });
    var rows = [['Student', 'Status', 'Score', 'Total', 'Percent'].concat(outs.map(function (o) { return o + ' level'; })).concat(items.map(function (x, i) { return 'Q' + (i + 1) + ' ' + partLabel(x) + ' ' + x.it.level; }))];
    R.rows.forEach(function (r) { rows.push([r.name, r.status, r.sum.score, r.sum.total, Math.round(100 * r.sum.score / Math.max(1, r.sum.total))].concat(outs.map(function (o) { return r.sum.levels[o] || ''; })).concat(items.map(function (x, i) { return { c: 1, C: 1, w: 0, W: 0, f: 0, b: '' }[r.final.charAt(i)]; }))); });
    D.download(R.session.title.replace(/[^\w\- ]+/g, '') + ' results.csv', rows);
  }

  HW.DashTests = TS;
})(window);
