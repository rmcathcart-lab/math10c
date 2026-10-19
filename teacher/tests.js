/* Teacher Ledger — the Tests tab: make exit slips and tests from the practice questions (or a ready-made unit test),
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
  function rerender() { if (st.tab === 'tests' || st.tab === 'exits') D.render(); }

  function load(force) {
    if (TS.tests && !force) return Promise.resolve();
    return Promise.all([api('tests'), api('sessions', { 'class': cls() })]).then(function (r) {
      if (r[0].ok) { TS.tests = r[0].tests; TS.liveAll = r[0].live || {}; }
      else throw new Error(r[0].error === 'unknown action' ? 'The ledger (Apps Script) needs the new backend code for test mode: paste backend/Code.gs into the Apps Script project, then Deploy → Manage deployments → edit → New version.' : r[0].error);
      if (r[1].ok) TS.sessions = r[1].sessions;
    });
  }
  function liveHere() { return TS.liveAll[cls()] || null; }

  /* ================= render ================= */
  /* two tabs share this code: Exit slips (kind 'exit', organised by unit) and Tests (kind 'test') */
  TS.render = function (body, kind) {
    TS.kind = kind === 'exit' ? 'exit' : 'test';
    if (TS.klass !== cls()) { TS.klass = cls(); TS.tests = null; TS.live = null; TS.res = null; if (TS.view !== 'edit') TS.view = 'home'; }
    if (!TS.tests) { body.appendChild(el('div', 'loading', 'Loading…')); load(true).then(rerender, function (e) { body.innerHTML = '<div class="panel"><h3>Test mode isn’t set up yet</h3><p>' + esc(e.message) + '</p></div>'; }); return; }
    if (TS.view === 'edit') return renderEditor(body);
    if (TS.view === 'results' && TS.res) return renderResults(body);
    var lv = liveHere();
    if (lv && (lv.kind === 'exit' ? 'exit' : 'test') === TS.kind) return renderLive(body);
    if (lv) { // the other kind is live: say so at the top
      var other = lv.kind === 'exit' ? 'exit' : 'test', ban = el('div', 'tt-live-banner tt-live-' + other, '<span class="tag live-tag">LIVE</span> ' + kindChip(other) + ' <b>' + esc(lv.title) + '</b> is live in ' + esc(klassLabel()) + '.');
      ban.appendChild(button('btn-small', 'Open it', function () { goTab(other); })); body.appendChild(ban);
    }
    renderHome(body);
  };
  function goTab(kind) { st.tab = kind === 'exit' ? 'exits' : 'tests'; try { localStorage.setItem('hw:ttab', st.tab); } catch (e) {} D.render(); }
  TS.goTab = goTab;
  function kindWord(k, plural) { return k === 'exit' ? (plural ? 'exit slips' : 'exit slip') : (plural ? 'tests' : 'test'); }
  /* which unit (and lesson) a test belongs to: its saved unit, else the first question's lesson */
  function unitOf(def) { if (def && def.unit) return Number(def.unit); var x = TC.items(def)[0]; return x ? x.lesson.unit : 0; }
  function lessonRank(def) { var x = TC.items(def)[0]; if (!x) return 1e9; var r = 0, found = -1; HW.CATALOG.forEach(function (u) { u.lessons.forEach(function (c) { if (c.id === x.lesson.id) found = r; r++; }); }); return found < 0 ? 1e8 : found; }
  function lessonTag(def) { var x = TC.items(def)[0]; return x && !x.lesson.test ? 'Lesson ' + x.lesson.unit + '.' + x.lesson.num : ''; }
  function previewDef(def) {
    try { localStorage.setItem('hw:tmpreview', JSON.stringify({ def: def, at: Date.now() })); } catch (e) { alert('Can’t open the preview on this browser.'); return; }
    var w = root.open('../#/preview', 'tmpreview'); if (w) { try { w.focus(); } catch (e) {} }
  }
  TS.previewDef = previewDef;
  function testCard(t) {
    var d = t.def || {}, n = (d.items || []).length, lt = lessonTag(d);
    var card = el('div', 'tt-card tt-card-' + (d.kind === 'exit' ? 'exit' : 'test'));
    card.innerHTML = '<div class="tt-chiprow">' + (TS.kind === 'exit' ? '' : kindChip(d.kind)) + (lt ? '<span class="tt-out">' + esc(lt) + '</span>' : '') + '</div><div class="tt-title">' + esc(d.title) + '</div><div class="small muted">' + n + ' part' + (n === 1 ? '' : 's') + ' · ' + (d.minutes ? d.minutes + ' min' : 'no time limit') + ' · ' + (d.calc ? 'calculator' : 'no calculator') + (d.shuffle ? ' · shuffled' : '') + '</div>';
    var a = el('div', 'tt-card-acts');
    a.appendChild(button('btn-primary btn-small', 'Launch for ' + esc(klassLabel()), function () { doLaunch(t); }));
    a.appendChild(button('btn-small tt-preview', 'Preview', function () { previewDef(t.def); }));
    a.appendChild(button('btn-small', 'Edit', function () { openEditor(t.id, t.def); }));
    a.appendChild(button('btn-small', 'Copy', function () { var c = JSON.parse(JSON.stringify(t.def)); c.title = c.title + ' (copy)'; openEditor(null, c); }));
    a.appendChild(button('btn-small btn-ghost', 'Delete', function () { if (!confirm('Delete “' + d.title + '”? Results already written stay.')) return; api('deltest', { id: t.id }).then(function () { return load(true); }).then(rerender); }));
    card.appendChild(a); return card;
  }
  function renderHome(body) {
    var K = TS.kind, mine = TS.tests.filter(function (t) { return ((t.def && t.def.kind) === 'exit' ? 'exit' : 'test') === K; });
    var top = el('div', 'tt-top');
    top.appendChild(el('div', '', '<h2 class="tt-h">' + (K === 'exit' ? 'Exit slips' : 'Tests') + '</h2><div class="small muted">Launch one and it pops up, full screen, on every signed-in student’s screen in <b>' + esc(klassLabel()) + '</b>. Leaving the window ends a student’s ' + kindWord(K) + '; you can unlock it.</div>'));
    var acts = el('div', 'tt-acts');
    acts.appendChild(K === 'exit' ? button('btn-small tt-new-exit', '+ New exit slip', function () { openEditor(null, { kind: 'exit', minutes: 10 }); })
      : button('btn-small tt-new-test', '+ New test', function () { openEditor(null, { kind: 'test', minutes: 60 }); }));
    top.appendChild(acts); body.appendChild(top);
    if (!mine.length) body.appendChild(el('div', 'panel muted', K === 'exit' ? 'No exit slips yet. Make one from a lesson’s practice questions.' : 'No tests yet. Make one from the practice questions, or start from a ready-made unit test below.'));
    // organised by unit (exit slips in lesson order; tests newest first)
    var byUnit = {}; mine.forEach(function (t) { var u = unitOf(t.def); (byUnit[u] = byUnit[u] || []).push(t); });
    var units = Object.keys(byUnit).map(Number).sort(function (a, b) { return (a || 99) - (b || 99); });
    units.forEach(function (u) {
      var cat = HW.CATALOG.filter(function (c) { return c.unit === u; })[0];
      var sec = el('section', 'tt-unit');
      sec.appendChild(el('h3', 'tt-unit-h', cat ? '<span class="unit-num">Unit ' + u + '</span> ' + esc(cat.title) + ' <span class="muted small">' + byUnit[u].length + ' ' + kindWord(K, byUnit[u].length !== 1) + '</span>' : 'Other'));
      var list = el('div', 'tt-list');
      byUnit[u].sort(K === 'exit' ? function (a, b) { return lessonRank(a.def) - lessonRank(b.def) || String(a.def.title).localeCompare(String(b.def.title), undefined, { numeric: true }); } : function (a, b) { return b.updated - a.updated; })
        .forEach(function (t) { list.appendChild(testCard(t)); });
      sec.appendChild(list); body.appendChild(sec);
    });
    // ready-made unit tests (lessons marked test: true)
    var ready = K === 'test' ? Object.keys(HW.lessons).map(function (k) { return HW.lessons[k]; }).filter(function (l) { return l.test; }) : [];
    if (ready.length) {
      var p = el('div', 'panel'); p.appendChild(el('h3', '', 'Ready-made unit tests'));
      p.appendChild(el('p', 'small muted', 'Your paper unit tests, with number generators so every student gets their own version. Preview one, or start from it and trim or add questions before saving.'));
      ready.forEach(function (l) {
        var def = { title: l.title, kind: 'test', unit: l.unit, minutes: 75, calc: true, levels: true, items: l.items.filter(function (it) { return !TC.NO_TEST[inputType(l, it)]; }).map(function (it) { return { l: l.id, i: it.id }; }) };
        var row = el('div', 'tt-ready', '<b>' + esc(l.title) + '</b> <span class="muted small">' + TC.pages(def).length + ' questions · ' + def.items.length + ' parts · ' + esc(l.outcome || '') + '</span>');
        var ra = el('span', 'tt-ready-acts');
        ra.appendChild(button('btn-small', 'Preview', function () { previewDef(def); }));
        ra.appendChild(button('btn-small', 'Use as a test', function () { openEditor(null, def); }));
        row.appendChild(ra); p.appendChild(row);
      });
      body.appendChild(p);
    }
    // past launches of this kind
    var past = (TS.sessions || []).filter(function (s) { return (s.kind === 'exit' ? 'exit' : 'test') === K; });
    var ps = el('div', 'panel'); ps.appendChild(el('h3', '', 'Past ' + kindWord(K, true) + ' in ' + esc(klassLabel())));
    if (!past.length) ps.appendChild(el('p', 'small muted', 'None yet.'));
    else {
      var t = el('table', 'tbl'); t.innerHTML = '<thead><tr><th>Launched</th><th>Title</th><th>Written</th><th>Results</th><th></th></tr></thead>';
      var tb = el('tbody');
      past.forEach(function (s) {
        var tr = el('tr'); tr.innerHTML = '<td>' + new Date(s.launched).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) + '</td><td>' + esc(s.title) + '</td><td>' + s.results + '</td><td>' + (s.released ? '<span class="tag good">Released</span>' : '<span class="tag">Not released</span>') + '</td><td></td>';
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
    TS.edit = { id: id, unit: def.unit || 0, title: def.title || '', kind: def.kind || TS.kind || 'test', minutes: def.minutes != null ? def.minutes : 60, calc: def.calc !== false, shuffle: !!def.shuffle, levels: def.levels !== false, items: (def.items || []).slice() };
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
    acts.appendChild(button('btn-small tt-preview', 'Preview', function () { if (!E.items.length) { alert('Pick at least one question first.'); return; } previewDef({ title: E.title.trim() || 'Untitled', kind: E.kind, minutes: E.minutes, calc: E.calc, shuffle: E.shuffle, levels: E.levels, items: E.items }); }));
    var save = button('btn-primary btn-small', 'Save', function () {
      if (!E.title.trim()) { alert('Give it a title.'); return; }
      if (!E.items.length) { alert('Pick at least one question.'); return; }
      save.disabled = true;
      api('savetest', { id: E.id || '', def: JSON.stringify({ title: E.title.trim(), kind: E.kind, unit: E.unit || 0, minutes: E.minutes, calc: E.calc, shuffle: E.shuffle, levels: E.levels, items: E.items }) }).then(function (d) {
        if (!d.ok) { alert('Couldn’t save: ' + d.error); save.disabled = false; return; }
        TS.view = 'home'; if (E.kind !== TS.kind) goTab(E.kind); return load(true).then(rerender);
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
    if ((st.tab !== 'tests' && st.tab !== 'exits') || TS.view === 'edit' || document.visibilityState !== 'visible') return;
    if (!liveHere() && TS.view !== 'live') return;
    api('tlive', { 'class': cls() }).then(function (d) {
      if (!d.ok) return;
      if (!d.live) { if (liveHere()) { delete TS.liveAll[cls()]; load(true).then(rerender); } return; }
      TS.liveAll[cls()] = d.live; TS.live = d; if ((st.tab === 'tests' || st.tab === 'exits') && TS.view !== 'edit' && TS.view !== 'results') rerender();
    }).catch(function () {});
  }
  setInterval(pollLive, 5000);
  var gradeCache = {}, hashCache = {}, codeCache = {};
  function qhashOf(name, sid, x) { var k = name + '|' + sid + '|' + x.key; if (!(k in hashCache)) { try { hashCache[k] = TC.qhash(TC.instance(TC.skey(cls(), name), sid, x.lesson, x.it)); } catch (e) { hashCache[k] = ''; } } return hashCache[k]; }
  function gradeOne(name, sid, x, ans) {
    var k = name + '|' + sid + '|' + x.key + '|' + JSON.stringify(ans && ans.r); if (k in gradeCache) return gradeCache[k];
    var m = 'b', code = ''; if (ans && ans.r != null) { try { var inst = TC.instance(TC.skey(cls(), name), sid, x.lesson, x.it), g = TC.grade(inst, ans.r); m = g.m; code = g.code || ''; } catch (e) { m = 'w'; code = 'unreadable'; } }
    codeCache[name + '|' + sid + '|' + x.key] = code;
    return (gradeCache[k] = m);
  }
  function pageNum(def, order, cur) { try { var pg = TC.pages(def, order)[cur || 0]; return pg ? pg.num : String((cur || 0) + 1); } catch (e) { return String((cur || 0) + 1); } }
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
      var pgs = TC.pages(def, order), dots = pgs.map(function (pg, pi) { return '<span class="tt-dgrp" title="Question ' + esc(pg.num) + '">' + pg.parts.map(function (q) { var y = byKey[q.key]; if (!y) return ''; var a = ans[q.key], m = a && a.t ? (TS.showMarks ? gradeOne(x.name, live.id, y, a) : 'a') : 'b'; return '<i class="tt-dot m-' + m + (rec && rec.cur === pi && rec.st === 'writing' ? ' cur' : '') + '" title="' + esc(q.label) + (a && a.t ? ': ' + esc(a.t) : ': not answered') + '"></i>'; }).join('') + '</span>'; }).join('');
      var left = '—';
      if (rec && def.minutes) { var lim = (def.minutes + (Number((live.extra || {})['*']) || 0) + (Number((live.extra || {})[x.name.toLowerCase().replace(/\s+/g, ' ').trim()]) || 0)) * 60000; left = mmss(lim - (rec.used || 0) - (rec.st === 'writing' ? Math.max(0, now - rec.at) : 0)); }
      tr.innerHTML = '<td><b>' + esc(x.name) + '</b></td><td><span class="dot ' + x.s.k + '"></span>' + esc(x.s.t) + (rec && rec.st === 'writing' && !rec.fs ? ' <span class="tag">not full screen</span>' : '') + (rec && rec.leaves ? ' <span class="warnnum" title="Times locked for leaving">' + rec.leaves + '</span>' : '') + '</td>' +
        '<td>' + (rec ? (rec.n || 0) + ' / ' + items.length : '—') + '</td><td class="tt-dots">' + (rec ? dots : '') + '</td><td>' + (rec && rec.st === 'writing' ? 'Q' + esc(pageNum(def, order, rec.cur)) : '—') + '</td><td>' + left + '</td><td>' + (rec ? ago(rec.at) : '—') + '</td><td class="acts"></td>';
      var a = tr.lastChild;
      function reopen(msg) {
        if (msg && !confirm(msg)) return;
        var p0 = live.ending ? (confirm('“End for everyone” is on, so ' + x.name + ' would be ended again right away. Turn it off?') ? ctl('resume') : null) : null;
        Promise.resolve(p0).then(function () { ctl('unlock', x.name, rec.st === 'time' ? 5 : 0); });
      }
      if (rec && rec.st === 'left') a.appendChild(button('btn-small btn-primary', 'Unlock', function () { reopen(''); }));
      if (rec && rec.st !== 'writing' && rec.st !== 'left') a.appendChild(button('btn-small btn-ghost', rec.st === 'time' ? 'Reopen +5 min' : 'Reopen', function () { reopen('Let ' + x.name + ' reopen their test and keep working?' + (rec.st === 'time' ? ' They get 5 more minutes.' : '')); }));
      if (rec && rec.st === 'writing' && x.s.k === 'quiet') a.appendChild(button('btn-small btn-primary', 'Move to another device', function () { reopen(x.name + '’s device has gone quiet. Let them carry on from another device (same answers and numbers)? Their first device stops.'); }));
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
    var R = TS.res, def = R.session.def, items = TC.items(def), isTest = R.session.kind !== 'exit';
    R.items = items; R.labels = TC.labels(def); R.isTest = isTest;
    var byPos = {}; items.forEach(function (x) { byPos[x.pos] = x; });
    R.rows.forEach(function (r) {
      var saved = TC.parseMarks(r.marks), n = (def.items || []).length, auto = '', fin = '';
      r.changed = {}; r.fin = saved.fin;
      for (var pos = 0; pos < n; pos++) {
        var x = byPos[pos], a = x ? r.answers[x.key] : null, m = x ? gradeOne(r.name, R.session.id, x, a) : 'b';
        if (x && a && a.h && a.h !== qhashOf(r.name, R.session.id, x)) r.changed[pos] = 1;
        auto += m; var sv = saved.m.charAt(pos); fin += TC.over(sv) ? sv : m;
      }
      r.auto = auto; r.final = fin;
      // a run of blanks at the end of the student's own order: maybe they ran out of time
      var order = TC.order(def, TC.skey(R.session['class'], r.name), R.session.id), tail = 0, posOf = {};
      items.forEach(function (x) { posOf[x.key] = x.pos; });
      for (var j = order.length - 1; j >= 0 && fin.charAt(posOf[order[j]]) === 'b'; j--) tail++;
      r.tailBlank = tail >= 3 ? tail : 0;
      regrade(r);
    });
  }
  function regrade(r) {
    var R = TS.res, def = R.session.def;
    r.sum = TC.summary(def, r.final);
    if (R.isTest) r.g = TC.outcomeGrades(def, TC.packMarks(r.final, r.fin));
    r.dirty = TC.packMarks(r.final, r.fin) !== (r.marks || '');
  }
  function indName(lv) { return LVN[lv] || (lv === 'NM' ? 'Not meeting' : lv); }
  function boxText(b) { return b.total ? TC.fmtPoints(b.earned) + '/' + b.total : '—'; }
  function renderResults(body) {
    var R = TS.res, s = R.session, items = R.items, def = s.def;
    var head = el('div', 'tt-top');
    head.appendChild(el('div', '', '<button class="btn btn-ghost btn-small tt-back">← All ' + (s.kind === 'exit' ? 'exit slips' : 'tests') + '</button><h2 class="tt-h">' + kindChip(s.kind) + ' ' + esc(s.title) + '</h2><div class="small muted">Launched ' + new Date(s.launched).toLocaleString() + (s.closed ? ' · closed ' + new Date(s.closed).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '') + ' · ' + (s.released ? '<b>Released to students</b>' : 'Not released yet') + '</div>'));
    head.querySelector('.tt-back').addEventListener('click', function () { TS.view = 'home'; TS.res = null; load(true).then(rerender); });
    var acts = el('div', 'tt-acts');
    var dirty = R.rows.some(function (r) { return r.dirty; });
    acts.appendChild(button('btn-small', dirty ? 'Save marks' : 'Marks saved', function () { saveMarks().then(rerender, function () {}); }));
    acts.appendChild(button('btn-small btn-primary', s.released ? 'Hide results from students' : 'Release results to students', function () {
      var on = !s.released;
      if (on && !confirm('Release the results? Each student will see ' + (R.isTest ? 'their indicator on each outcome, their unit grade, ' : 'their score, ') + 'their answers, the correct answers and worked solutions on their home page.')) return;
      saveMarks().then(function () { return api('release', { session: s.id, on: on ? 1 : 0 }); }).then(function (d) { if (d && d.ok) s.released = on ? Date.now() : 0; else alert('Couldn’t change the release.'); rerender(); }, function () {});
    }));
    acts.appendChild(button('btn-small btn-ghost', 'Download CSV', function () { csv(); }));
    head.appendChild(acts); body.appendChild(head);
    var outs = []; items.forEach(function (x) { if (outs.indexOf(x.it.outcome) < 0) outs.push(x.it.outcome); });
    var t = el('table', 'tbl tt-res');
    var h = '<thead><tr><th>Student</th><th>Status</th>' + (R.isTest ? '<th>Unit grade</th>' + outs.map(function (o) { return '<th class="tt-oh">' + esc(o) + '<div class="th-sub">B · P · M boxes</div></th>'; }).join('')
      : '<th>Score</th>' + outs.map(function (o) { return '<th>' + esc(o) + '<div class="th-sub">highest right</div></th>'; }).join(''));
    items.forEach(function (x) { h += '<th class="tt-qh" title="' + esc(partLabel(x)) + ' · ' + esc(x.it.outcome) + ' ' + x.it.level + '">' + esc(R.labels[x.key] || '') + '<div class="th-sub">' + x.it.level + '</div></th>'; });
    t.innerHTML = h + '</tr></thead>';
    var tb = el('tbody'), byName = {}; R.rows.forEach(function (r) { byName[r.name] = r; });
    var names = R.names.slice(); R.rows.forEach(function (r) { if (names.indexOf(r.name) < 0) names.push(r.name); });
    names.sort(function (a, b) { return a.localeCompare(b); });
    var credit = items.map(function () { return 0; }), wrote = 0;
    names.forEach(function (n) {
      var r = byName[n], tr = el('tr');
      if (!r) { tr.innerHTML = '<td>' + esc(n) + '</td><td class="muted">Didn’t write</td><td colspan="' + (1 + outs.length + items.length) + '"></td>'; tb.appendChild(tr); return; }
      wrote++;
      var stt = { submitted: 'Submitted', left: 'Left the test', time: 'Out of time', ended: 'Ended', forced: 'Submitted by you' }[r.status] || r.status;
      var html = '<td><b>' + esc(n) + '</b></td><td>' + esc(stt) + (r.leaves ? ' <span class="warnnum" title="Times locked for leaving">' + r.leaves + '</span>' : '') + (r.tailBlank ? ' <span class="tag warn" title="The last ' + r.tailBlank + ' parts in their order are blank">Ran out of time?</span>' : '') + '</td>';
      if (R.isTest) html += '<td class="tt-unitg"><b>' + r.g.unit + '%</b><div class="small muted">' + TC.fmtPoints(r.g.points) + ' / ' + r.g.total + ' points</div></td>';
      else html += '<td><b>' + r.sum.score + '</b> / ' + r.sum.total + ' <span class="muted small">' + Math.round(100 * r.sum.score / Math.max(1, r.sum.total)) + '%</span></td>';
      tr.innerHTML = html;
      outs.forEach(function (o) {
        var td = el('td', 'tt-ocell');
        if (!R.isTest) { var lv = r.sum.levels[o]; td.innerHTML = lv ? '<span class="lvl lvl-' + lv + '">' + LVN[lv] + '</span>' : '<span class="muted small">—</span>'; tr.appendChild(td); return; }
        var g = r.g.outcomes.filter(function (x) { return x.outcome === o; })[0], bx = g.boxes;
        td.innerHTML = '<div class="tt-oline"><span class="lvl lvl-' + g.ind + '">' + indName(g.ind) + '</span> <b>' + g.pct + '</b>' + (g.note && !g.set ? ' <span class="tt-flag" title="' + esc(g.note) + '">⚑ Check</span>' : '') + (g.set ? ' <span class="tag" title="You set this. The rule says ' + g.auto + ' ' + g.autoPct + '">set</span>' : '') + '</div>' +
          '<div class="small muted">B ' + boxText(bx.B) + ' · P ' + boxText(bx.P) + ' · M ' + boxText(bx.M) + (g.mcHalved ? ' <span title="Mastery multiple choice counted half: less than half of the box’s other points">(MC ½)</span>' : '') + '</div>';
        var sel = el('select', 'tt-osel'); sel.title = 'Set the final indicator for ' + o;
        sel.appendChild(new Option('Rule: ' + g.auto + ' ' + g.autoPct, ''));
        TC.LADDER.slice().reverse().forEach(function (lv) { sel.appendChild(new Option(indName(lv) + ' (' + TC.midPct(lv) + ')', lv)); });
        sel.value = r.fin[o] || '';
        sel.addEventListener('change', function () { if (sel.value) r.fin[o] = sel.value; else delete r.fin[o]; regrade(r); rerender(); });
        td.appendChild(sel); tr.appendChild(td);
      });
      items.forEach(function (x, i) {
        var m = r.final.charAt(x.pos); credit[i] += TC.credit(m);
        var td = el('td', 'tt-m m-' + m + (TC.over(m) ? ' over' : '') + (r.changed[x.pos] ? ' chg' : ''), (TC.SYMBOL[m] || '?') + (r.changed[x.pos] ? '!' : ''));
        td.title = TC.MARK_NAMES[m] + (r.changed[x.pos] ? ' — this question has changed since the student answered it: check it' : '') + ' — click to see the answer and change the mark';
        td.addEventListener('click', function () { detail(r, i); });
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
    var fr = el('tr', 'tt-foot'); fr.innerHTML = '<td colspan="' + (3 + outs.length) + '" class="small muted">Average credit (of ' + wrote + ' who wrote)</td>' + items.map(function (x, i) { return '<td class="small">' + (wrote ? Math.round(100 * credit[i] / wrote) + '%' : '—') + '</td>'; }).join('');
    tb.appendChild(fr);
    t.appendChild(tb); var w = el('div', 'tbl-wrap'); w.appendChild(t); body.appendChild(w);
    body.appendChild(el('p', 'small muted', R.isTest
      ? '✓ right · ⅔ a small recognized mistake, or the right value in the wrong form · ⅓ a bigger but reasonable mistake · ✗ wrong · – blank. Each outcome: Beginning, Progressing and Mastery box points; a box is secure at ¾ and partial at ½; the indicator and percent follow your grading rule. <b>⚑ Check</b> = a harder box done well over a hole in an easier one. Pick an indicator to set it yourself. Click a mark to see the answer and change its credit.'
      : '✓ right · ⅔ / ⅓ partly right · ✗ wrong · – blank. Exit slips: the score counts right answers, and each outcome shows the hardest level answered correctly. Click a mark to see the answer and change it.'));
    var dbox = el('div', 'panel tt-detail hidden'); dbox.id = 'tt-detail'; body.appendChild(dbox);
  }
  function detail(r, i) {
    var R = TS.res, x = R.items[i], box = document.getElementById('tt-detail'); if (!box) return;
    var inst; try { inst = TC.instance(TC.skey(R.session['class'], r.name), R.session.id, x.lesson, x.it); } catch (e) { inst = null; }
    var a = r.answers[x.key], p = x.pos, m = r.final.charAt(p), am = r.auto.charAt(p), code = codeCache[r.name + '|' + R.session.id + '|' + x.key] || '';
    box.classList.remove('hidden'); box.innerHTML = '';
    box.appendChild(el('h3', '', esc(r.name) + ' · Question ' + esc(R.labels[x.key] || '') + ' <span class="muted small">(' + esc(partLabel(x)) + ' · ' + esc(x.it.outcome) + ' ' + x.it.level + ')</span>'));
    if (inst) { if (inst.stem) box.appendChild(el('div', 'qstem', HW.tex(inst.stem))); box.appendChild(el('div', 'qprompt', HW.tex(inst.prompt))); }
    box.appendChild(el('div', 'tt-ans', '<div class="dlabel">Their answer</div><div>' + (a && a.t ? esc(a.t) : '<span class="muted">blank</span>') + '</div>'));
    if (inst) box.appendChild(el('div', 'tt-ans', '<div class="dlabel">Correct answer</div><div>' + HW.tex(inst.answer) + '</div>'));
    box.appendChild(el('div', 'tt-ans', '<div class="dlabel">Mark</div><div><b>' + esc(TC.MARK_NAMES[m] || m) + '</b>' + (am !== m ? ' <span class="muted small">(checker said: ' + esc(TC.MARK_NAMES[am]) + ')</span>' : '') +
      (code && am !== 'c' ? '<div class="small muted">Checker: ' + esc((HW.CODES && HW.CODES[code]) || code) + '</div>' : '') +
      (r.changed[p] ? '<div class="notice warn small">This question has been edited since the test, so the version shown may not be exactly what the student saw. Check the mark.</div>' : '') + '</div>'));
    var acts = el('div', 'tt-acts');
    function setM(v) { r.final = r.final.slice(0, p) + v + r.final.slice(p + 1); regrade(r); rerender(); setTimeout(function () { detail(r, i); }, 0); }
    acts.appendChild(button('btn-small', '✓ Right', function () { setM('C'); }));
    acts.appendChild(button('btn-small', '⅔ Small mistake', function () { setM('T'); }));
    acts.appendChild(button('btn-small', '⅓ Bigger mistake', function () { setM('O'); }));
    acts.appendChild(button('btn-small', '✗ Wrong', function () { setM('W'); }));
    acts.appendChild(button('btn-small btn-ghost', 'Use the checker’s mark', function () { setM(am); }));
    box.appendChild(acts);
    HW.texIn && HW.texIn(box);
    try { box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
  }
  function saveMarks() {
    var R = TS.res, data = {};
    R.rows.forEach(function (r) { data[r.name] = R.isTest ? { m: TC.packMarks(r.final, r.fin), s: r.g.points, t: r.g.total } : { m: TC.packMarks(r.final, r.fin), s: r.sum.score, t: r.sum.total }; });
    return api('setmarks', { session: R.session.id, data: JSON.stringify(data) }).then(function (d) {
      if (!d.ok) { alert('Couldn’t save the marks: ' + d.error + '. Nothing was released.'); throw new Error(d.error); }
      R.rows.forEach(function (r) { r.marks = TC.packMarks(r.final, r.fin); r.dirty = false; });
    });
  }
  function csv() {
    var R = TS.res, items = R.items, outs = []; items.forEach(function (x) { if (outs.indexOf(x.it.outcome) < 0) outs.push(x.it.outcome); });
    var head = ['Student', 'Status'];
    if (R.isTest) { head.push('Unit grade %', 'Points', 'Total'); outs.forEach(function (o) { head.push(o + ' indicator', o + ' %', o + ' rule', o + ' BEG box', o + ' PRG box', o + ' MAS box', o + ' note'); }); }
    else { head.push('Score', 'Total', 'Percent'); outs.forEach(function (o) { head.push(o + ' highest level'); }); }
    var rows = [head.concat(items.map(function (x) { return 'Q' + (R.labels[x.key] || '') + ' ' + partLabel(x) + ' ' + x.it.level; }))];
    var byName = {}; R.rows.forEach(function (r) { byName[r.name] = r; });
    var names = R.names.slice(); R.rows.forEach(function (r) { if (names.indexOf(r.name) < 0) names.push(r.name); }); names.sort(function (a, b) { return a.localeCompare(b); });
    names.forEach(function (n) {
      var r = byName[n]; if (!r) { rows.push([n, 'did not write']); return; }
      var row = [r.name, r.status];
      if (R.isTest) { row.push(r.g.unit, r.g.points, r.g.total); r.g.outcomes.forEach(function (g) { row.push(g.ind, g.pct, g.auto + ' ' + g.autoPct, boxText(g.boxes.B), boxText(g.boxes.P), boxText(g.boxes.M), g.note); }); }
      else { row.push(r.sum.score, r.sum.total, Math.round(100 * r.sum.score / Math.max(1, r.sum.total))); outs.forEach(function (o) { row.push(r.sum.levels[o] || ''); }); }
      rows.push(row.concat(items.map(function (x) { return Math.round(100 * TC.credit(r.final.charAt(x.pos))) / 100; })));
    });
    D.download(R.session.title.replace(/[^\w\- ]+/g, '') + ' results.csv', rows);
  }

  HW.DashTests = TS;
})(window);
