/* Teacher Ledger — the Retests tab.
 * A student asks for a retest on the practice site once every required question in a unit is done without seeing the
 * solution (after a first retest: every extra practice question too). Requests land here. For each one: what the
 * student's practice looks like now, the tests they've written for that unit (with the best grade, which is the one that
 * counts), and buttons to open a retest for that one student (a test of the unit, with new numbers, live alongside
 * whatever the class is doing), dismiss the request, or watch / see the results of a retest already opened.
 * Backend: backend/Code.gs RETESTS (retests, retestset, launchretest) and the one-student launches in TEST MODE. */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, esc = HW.esc, TC = HW.TestCore, D = HW.Dash, st = D.state;
  var R = { klass: '', data: null, tests: null, pick: {}, busy: null, at: 0, showOld: false };
  function api(a, p) { return D.api(a, p); }
  function cls() { return st.klass; }
  function button(c, html, fn) { var b = el('button', 'btn ' + c, html); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function norm(x) { return String(x == null ? '' : x).trim().toLowerCase().replace(/\s+/g, ' '); }
  function day(ms) { return ms ? new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '—'; }
  function ago(ms) { if (!ms) return ''; var m = Math.round((Date.now() - ms) / 60000); if (m < 1) return 'just now'; if (m < 60) return m + ' min ago'; var h = Math.round(m / 60); return h < 36 ? h + ' h ago' : Math.round(h / 24) + ' d ago'; }
  function unitOf(def) { if (def && def.unit) return Number(def.unit); var x = def ? TC.items(def)[0] : null; return x ? x.lesson.unit : 0; }
  function unitCat(u) { return HW.CATALOG.filter(function (c) { return c.unit === u; })[0]; }
  function rerender() { if (st.tab === 'retests') D.render(); }

  function load() {
    if (R.busy) return R.busy; // one request at a time: callers share it
    return R.busy = Promise.all([api('retests', { 'class': cls() }), R.tests ? Promise.resolve(null) : api('tests')]).then(function (r) {
      R.busy = null;
      if (!r[0].ok) throw new Error(r[0].error === 'unknown action' ? 'The ledger (Apps Script) needs the new backend code for retests: paste backend/Code.gs into the Apps Script project, then Deploy → Manage deployments → edit → New version.' : r[0].error);
      R.data = r[0]; R.at = Date.now(); R.klass = cls();
      if (r[1] && r[1].ok) { // the saved tests, plus the ready-made unit tests not saved yet (saved when one is opened)
        var have = {}; r[1].tests.forEach(function (t) { have[t.id] = 1; });
        R.tests = r[1].tests.concat(Object.keys(HW.lessons).filter(function (k) { return HW.lessons[k].test && !HW.lessons[k].exit && !have['B-' + k]; }).map(function (k) { return HW.DashTests.builtin(k); }).filter(Boolean));
      }
      D.retestCount = R.data.retests.filter(function (x) { return x.status === 'requested'; }).length;
    }, function (e) { R.busy = null; throw e; });
  }
  /* every 20 s while the tab is open: new requests, a retest finishing */
  setInterval(function () { if (st.tab === 'retests' && document.visibilityState === 'visible' && st.klass && !R.busy) load().then(rerender, function () {}); }, 20000);

  /* the student's practice for the unit right now (from the class's progress, as the Progress tab sees it) */
  function practiceOf(name, u) {
    var cat = unitCat(u), n = { req: 0, reqDone: 0, redo: 0, extra: 0, extraDone: 0 };
    if (!cat || !st.D) return null;
    var byLesson = {}; (st.D.progress || []).forEach(function (p) { if (norm(p.name) === norm(name)) byLesson[p.lesson] = p.items || {}; });
    cat.lessons.forEach(function (c) {
      var lesson = HW.lessons[c.id]; if (!lesson || lesson.test) return;
      var items = byLesson[lesson.id] || {};
      lesson.items.forEach(function (it) {
        var x = items[it.id], done = x && x[0] === 'done';
        if (it.extra) { n.extra++; if (done) n.extraDone++; return; }
        n.req++; if (done) { if (x[1] === 'shown' && !x[6]) n.redo++; else n.reqDone++; }
      });
    });
    return n;
  }
  /* the tests this student has written for unit u: [{ session, title, launched, retest, grade (%, or null if not marked) }] */
  function testsOf(name, u) {
    var D2 = R.data, sess = {}; (D2.sessions || []).forEach(function (s) { sess[s.id] = s; });
    var out = [];
    (D2.results || []).forEach(function (r) {
      var s = sess[r.session]; if (!s || norm(r.name) !== norm(name) || unitOf(s.def) !== u) return;
      var g = null; if (r.marks) { try { g = TC.outcomeGrades(s.def, r.marks).unit; } catch (e) { g = null; } }
      out.push({ session: s.id, title: s.title, launched: s.launched, retest: !!s.student, grade: g, status: r.status, test: s.test });
    });
    out.sort(function (a, b) { return a.launched - b.launched; });
    var best = null; out.forEach(function (t) { if (t.grade != null && (best == null || t.grade > best.grade)) best = t; });
    if (best) best.best = true;
    return out;
  }
  /* the tests a retest for unit u could be: saved tests (kind test) for that unit; the default is the one the class
     wrote (its most recent class launch), else the newest saved one */
  function choicesFor(u) {
    var list = (R.tests || []).filter(function (t) { return t.def && t.def.kind !== 'exit' && unitOf(t.def) === u; });
    var classIds = (R.data.sessions || []).filter(function (s) { return !s.student && unitOf(s.def) === u; }).sort(function (a, b) { return b.launched - a.launched; }).map(function (s) { return s.test; });
    list.sort(function (a, b) { var ia = classIds.indexOf(a.id), ib = classIds.indexOf(b.id); if ((ia < 0) !== (ib < 0)) return ia < 0 ? 1 : -1; if (ia >= 0) return ia - ib; return (b.updated || 0) - (a.updated || 0); });
    return list;
  }

  function render(body) {
    if (R.klass !== cls()) { R.data = null; R.klass = cls(); R.pick = {}; }
    if (!R.data) { body.appendChild(el('div', 'loading', 'Loading…')); load().then(function () { if (R.data) rerender(); }, function (e) { body.innerHTML = '<div class="panel"><h3>Retests aren’t set up yet</h3><p>' + esc(e.message) + '</p></div>'; }); return; }
    if (Date.now() - R.at > 20000 && !R.busy) load().then(rerender, function () {});
    var all = R.data.retests.slice().sort(function (a, b) { return b.requested - a.requested; });
    var waiting = all.filter(function (x) { return x.status === 'requested'; }), open = all.filter(function (x) { return x.status === 'open'; });
    var old = all.filter(function (x) { return x.status !== 'requested' && x.status !== 'open'; });
    var top = el('div', 'tt-top');
    top.appendChild(el('div', '', '<h2 class="tt-h">Retests</h2><div class="small muted">A student can ask for a retest once every required question in a unit is done <b>without seeing the solution</b> (after a retest, the extra practice too). Opening one launches a test of that unit for just that student, with new numbers; it runs alongside anything the class is doing. When a student has more than one test for a unit, the <b>best</b> grade counts.</div>'));
    body.appendChild(top);
    if (open.length) body.appendChild(section('Open now', open, 'open'));
    body.appendChild(section('Waiting', waiting, 'waiting'));
    if (old.length) {
      var p = el('div', 'panel rt-old');
      var h = el('h3', '', 'Written or closed <span class="muted small">(' + old.length + ')</span> ');
      h.appendChild(button('btn-ghost btn-small', R.showOld ? 'Hide' : 'Show', function () { R.showOld = !R.showOld; rerender(); }));
      p.appendChild(h);
      if (R.showOld) p.appendChild(table(old, 'old'));
      body.appendChild(p);
    }
  }
  function section(title, list, kind) {
    var p = el('div', 'panel rt-' + kind); p.appendChild(el('h3', '', title + ' <span class="muted small">(' + list.length + ')</span>'));
    if (!list.length) { p.appendChild(el('p', 'small muted', kind === 'waiting' ? 'No requests waiting. They show up here when a student asks.' : '')); return p; }
    p.appendChild(table(list, kind)); return p;
  }
  function table(list, kind) {
    var t = el('table', 'tbl rt-tbl');
    t.innerHTML = '<thead><tr><th>Student</th><th>Unit</th><th>Asked</th><th>Practice now</th><th>Tests for this unit</th><th>' + (kind === 'old' ? 'Status' : '') + '</th><th></th></tr></thead>';
    var tb = el('tbody');
    list.forEach(function (x) {
      var tr = el('tr'), cat = unitCat(x.unit), pr = practiceOf(x.name, x.unit), tests = testsOf(x.name, x.unit);
      if (cat && HW.unitStyle) tr.setAttribute('style', HW.unitStyle(x.unit));
      var prHtml = !pr ? '—' : (pr.reqDone === pr.req ? '<span class="rt-ok">✓ All ' + pr.req + ' required</span>' : '<span class="rt-warn">' + pr.reqDone + ' / ' + pr.req + ' required</span>' + (pr.redo ? ' <span class="muted small">(' + pr.redo + ' only after the solution)</span>' : '')) +
        '<div class="small muted">' + pr.extraDone + ' / ' + pr.extra + ' extra practice</div>';
      var tHtml = tests.length ? tests.map(function (q) {
        return '<button type="button" class="rt-test' + (q.best ? ' best' : '') + (q.grade == null ? ' unmarked' : '') + '" data-sid="' + esc(q.session) + '" title="' + esc(q.title) + ' · ' + day(q.launched) + (q.best ? ' · the best grade: this one counts' : '') + (q.grade == null ? ' · open the results and press Save marks to see the grade here' : ' · open the results') + '">' + (q.retest ? 'Retest' : 'Test') + ' ' + day(q.launched) + ' <b>' + (q.grade == null ? 'not marked yet' : q.grade + '%') + '</b>' + (q.best ? ' ★' : '') + '</button>';
      }).join(' ') : '<span class="muted small">None written yet</span>';
      var stTxt = { done: 'Retest written', dismissed: 'Dismissed', cancelled: 'Cancelled by the student' }[x.status] || '';
      tr.innerHTML = '<td><b>' + esc(x.name) + '</b></td><td><span class="rt-unit">Unit ' + x.unit + '</span>' + (cat ? '<div class="small muted">' + esc(cat.title) + '</div>' : '') + '</td><td>' + day(x.requested) + '<div class="small muted">' + ago(x.requested) + '</div></td>' +
        '<td>' + prHtml + '</td><td class="rt-tests">' + tHtml + '</td><td>' + (kind === 'old' ? '<span class="tag">' + stTxt + '</span>' + (x.updated ? '<div class="small muted">' + day(x.updated) + '</div>' : '') : '') + '</td><td class="rt-acts"></td>';
      tr.querySelectorAll('.rt-test[data-sid]').forEach(function (b) { b.addEventListener('click', function () { HW.DashTests.openResults(b.getAttribute('data-sid')); }); });
      var a = tr.lastChild;
      if (x.status === 'requested') {
        var ch = choicesFor(x.unit);
        if (!ch.length) a.appendChild(el('div', 'small muted rt-nochoice', 'No Unit ' + x.unit + ' test saved yet. Make one in the Tests tab first.'));
        else {
          var sel = el('select', 'field rt-sel'); ch.forEach(function (t) { var o = el('option', '', esc(t.def.title)); o.value = t.id; sel.appendChild(o); });
          if (R.pick[x.id]) sel.value = R.pick[x.id]; sel.addEventListener('change', function () { R.pick[x.id] = sel.value; });
          a.appendChild(sel);
          a.appendChild(button('btn-primary btn-small rt-open', 'Open retest', function (e) { openRetest(x, sel.value, e.target); }));
        }
        a.appendChild(button('btn-ghost btn-small rt-dismiss', 'Dismiss', function () { if (confirm('Dismiss ' + x.name + '’s retest request for Unit ' + x.unit + '? They can ask again.')) setStatus(x, 'dismissed'); }));
      } else if (x.status === 'open') {
        a.appendChild(button('btn-primary btn-small rt-watch', 'Watch', function () { HW.DashTests.watch(x.name); }));
      } else {
        if (x.session) a.appendChild(button('btn-small', 'Results', function () { HW.DashTests.openResults(x.session); }));
        if (x.status === 'dismissed') a.appendChild(button('btn-ghost btn-small', 'Restore', function () { setStatus(x, 'requested'); }));
      }
      tb.appendChild(tr);
    });
    t.appendChild(tb); var w = el('div', 'tbl-wrap'); w.appendChild(t); return w;
  }
  function openRetest(x, testId, btn) {
    var t = (R.tests || []).filter(function (q) { return q.id === testId; })[0]; if (!t) return;
    if (!confirm('Open “' + t.def.title + '” for ' + x.name + ' now?\n\nIt pops up on ' + x.name.split(' ')[0] + '’s screen within about 10 seconds, with new numbers. The rest of the class isn’t affected.')) return;
    btn.disabled = true;
    var demo = HW.DashDemo && cls() === HW.DashDemo.CODE;
    (t.virtual && !demo ? api('savetest', { id: t.id, def: JSON.stringify(t.def) }) : Promise.resolve({ ok: true })).then(function (d) {
      if (!d.ok) return d;
      return api('launchretest', { 'class': cls(), id: x.id, test: testId });
    }).then(function (d) {
      if (!d.ok) { btn.disabled = false; alert(d.error === 'live' ? x.name + ' already has a retest open.' : 'Couldn’t open it: ' + d.error); return; }
      return load().then(function () { HW.DashTests.watch(x.name); });
    });
  }
  function setStatus(x, status) { api('retestset', { 'class': cls(), id: x.id, status: status }).then(function (d) { if (!d.ok) alert(d.error); return load(); }).then(rerender); }

  HW.DashRetests = { render: render, load: load };
})(window);
