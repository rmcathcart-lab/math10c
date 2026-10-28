/* Teacher Ledger — the PowerSchool tab.
 * 1. Scores for PowerSchool: one file per PowerSchool assignment, in the same format as its scores template (see
 *    powerschool.js), so it can be imported straight into that assignment:
 *      <outcome> HW            practice level (the Outcomes tab's rule: highest level answered correctly)
 *      <outcome> <exit slip>   highest level right on that exit slip (wrote it but none right: NM; didn't write: blank)
 *      <outcome> Unit n Test   the indicator from the test's boxes, best attempt (class test or a retest)
 *      Unit n Test             the unit grade, best attempt
 *    Students need their PowerSchool student number (Settings → class list, or upload a scores template).
 * 2. Report card comments (written at the end of the semester): a course overview (several wordings, shared out) + one
 *    strength and one area for growth per student,
 *    from their outcome evidence, with their pronouns; the IPP sentence for students on an IPP. Edits stay in this
 *    browser until downloaded.
 * Exit slip and test results are marked the same way the Results view marks them (HW.DashTests.grade). */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, esc = HW.esc, TC = HW.TestCore, C = HW.Comments, PS = HW.PS;
  var D = HW.Dash, st = D.state, RP = HW.DashReports = { cache: {}, marked: {} };
  D.onWrite(function (a) { // changed marks or a release: mark again; a launch, a test ending or a class list change: list the sessions again
    if (a === 'setmarks' || a === 'release') RP.marked = {};
    if (/^(setmarks|release|launch|launchretest|tctl|setroster|removestudent|delclass|renameclass)$/.test(a)) RP.cache = {};
  });
  var LADDER = TC.LADDER, LVN = HW.LEVEL_NAMES;

  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function lsJ(k, dflt) { try { var v = JSON.parse(ls(k) || 'null'); return v == null ? dflt : v; } catch (e) { return dflt; } }
  function button(cls, html, fn) { var b = el('button', 'btn ' + cls, html); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function klass() { return (st.classes || []).filter(function (c) { return c.code === st.klass; })[0] || (st.D && st.D['class']) || { code: st.klass, label: st.klass }; }
  function rerender() { if (st.tab === 'powerschool') D.render(); }
  function indOf(pct) { for (var i = LADDER.length - 1; i >= 0; i--) if (pct >= TC.BANDS[LADDER[i]][0]) return LADDER[i]; return 'NM'; }
  function unitOfDef(def) { if (def && def.unit) return Number(def.unit); var x = TC.items(def)[0]; return x ? x.lesson.unit : 0; }
  function unitOfOutcome(o) { var u = 0; HW.CATALOG.forEach(function (c) { if (!u && c.outcomes.split(/\s*·\s*/).indexOf(o) >= 0) u = c.unit; }); return u || 99; }
  var OUT_ORDER = []; HW.CATALOG.forEach(function (c) { c.outcomes.split(/\s*·\s*/).forEach(function (o) { if (OUT_ORDER.indexOf(o) < 0) OUT_ORDER.push(o); }); });
  function byOutcome(a, b) { var i = OUT_ORDER.indexOf(a), j = OUT_ORDER.indexOf(b); return (i < 0 ? 99 : i) - (j < 0 ? 99 : j); }

  /* ---------------- results of every closed exit slip and test, marked ---------------- */
  function load(force) {
    var k = st.klass, c = RP.cache[k];
    if (c && !force) return c.p;
    var keep = c && c.ready && !c.err; // looking again: the marks already shown stay up until the new ones are ready
    c = { sessions: null, graded: [], done: 0, total: 0, err: '', at: Date.now() };
    if (!keep) RP.cache[k] = c;
    function done() { c.ready = true; if (RP.cache[k] !== c && (!c.err || !RP.cache[k])) RP.cache[k] = c; }
    c.p = D.api('sessions', { 'class': k }).then(function (d) {
      if (!d || !d.ok) throw new Error((d && d.error) || 'Couldn’t load the test sessions.');
      var list = (d.sessions || []).filter(function (s) { return s.closed && (s.results || s.results === undefined); });
      c.sessions = list; c.total = list.length;
      var queue = list.slice(), out = [];
      function next() {
        var s = queue.shift(); if (!s) return Promise.resolve();
        var had = RP.marked[s.id];
        if (had) { out.push(had); c.done++; return next(); } // a closed session marked earlier: its results only change through the ledger (marks, release), which empties RP.marked
        return D.api('tresults', { session: s.id }).then(function (r) {
          if (r && r.ok) { try { var g = HW.DashTests.grade(r); RP.marked[s.id] = g; out.push(g); } catch (e) { console.warn('marking', s.id, e); } }
          c.done++; if (st.tab === 'powerschool') updateProgress();
          return next();
        });
      }
      return Promise.all([next(), next(), next()]).then(function () { c.graded = out.sort(function (a, b) { return a.session.launched - b.session.launched; }); done(); });
    }).catch(function (e) { c.err = e.message; done(); });
    return c.p;
  }
  RP.load = function () { return load(); };
  function updateProgress() { var n = document.getElementById('ps-progress'), c = RP.cache[st.klass]; if (n && c) n.textContent = 'Marking exit slips and tests… ' + c.done + ' of ' + c.total; }

  /* ---------------- the evidence, per student and outcome ---------------- */
  function rosterList() { return (st.D.roster || []).slice().sort(function (a, b) { return a.name.localeCompare(b.name); }); }
  function build() {
    var c = RP.cache[st.klass], graded = (c && c.graded) || [], dv = D.derive(), inOnly = st.scope === 'class';
    var roster = rosterList(), names = roster.map(function (s) { return s.name; }), E = {};
    names.forEach(function (n) { E[n] = { prac: {}, exit: {}, test: {}, unitGrade: {}, lessons: {}, tried: {} }; });
    function S(n) { return E[n]; }
    function lessonAdd(e, o, lid, val) { var k = o + '|' + lid, x = e.lessons[k] || (e.lessons[k] = { outcome: o, lesson: lid, n: 0, sum: 0 }); x.n++; x.sum += val; }
    // practice
    var practiced = {}; // outcome → students who tried something
    Object.keys(dv.items).forEach(function (k) {
      var r = dv.items[k], e = S(r.name); if (!e || !r.attempts) return;
      e.tried[r.outcome] = 1; (practiced[r.outcome] = practiced[r.outcome] || {})[r.name] = 1;
      if (inOnly && r.correctAt && !r.correctIn) return;
      var val = r.correctAt ? ({ first: 1, hint: 0.6, shown: 0.25 }[r.credit] || 0) : 0;
      lessonAdd(e, r.outcome, r.lesson, val);
    });
    names.forEach(function (n) { var s = dv.stu[n]; if (s) Object.keys(s.outcomes).forEach(function (o) { E[n].prac[o] = s.outcomes[o]; }); });
    // exit slips and tests
    var exits = [], tests = {}, inPlay = {};
    graded.forEach(function (R) {
      var def = R.session.def, outs = []; R.items.forEach(function (x) { if (outs.indexOf(x.it.outcome) < 0) outs.push(x.it.outcome); });
      outs.forEach(function (o) { if (o !== 'EXT') inPlay[o] = 1; });
      if (!R.isTest) {
        var ex = { R: R, outs: outs.filter(function (o) { return o !== 'EXT'; }), lv: {} };
        R.rows.forEach(function (r) {
          var e = S(r.name); if (!e) return; ex.lv[r.name] = {};
          ex.outs.forEach(function (o) { var lv = r.sum.levels[o] || 'NM'; ex.lv[r.name][o] = lv; var cur = e.exit[o]; if (!cur || LADDER.indexOf(lv) > LADDER.indexOf(cur)) e.exit[o] = lv; });
          R.items.forEach(function (x) { if (x.it.outcome !== 'EXT') lessonAdd(e, x.it.outcome, x.lesson.id, TC.credit(r.final.charAt(x.pos))); });
        });
        exits.push(ex);
      } else {
        var u = unitOfDef(def), T = tests[u] || (tests[u] = { unit: u, sessions: [], outs: [], best: {}, unitBest: {} });
        T.sessions.push(R); outs.forEach(function (o) { if (o !== 'EXT' && T.outs.indexOf(o) < 0) T.outs.push(o); });
        R.rows.forEach(function (r) {
          var e = S(r.name); if (!e || !r.g) return;
          var b = T.best[r.name] || (T.best[r.name] = {});
          r.g.outcomes.forEach(function (g) { if (g.outcome === 'EXT') return; if (!b[g.outcome] || g.pct > b[g.outcome].pct) b[g.outcome] = { ind: g.ind, pct: g.pct }; var cur = e.test[g.outcome]; if (!cur || g.pct > cur.pct) e.test[g.outcome] = { ind: g.ind, pct: g.pct, unit: u }; });
          if (T.unitBest[r.name] == null || r.g.unit > T.unitBest[r.name]) T.unitBest[r.name] = r.g.unit;
        });
      }
    });
    // outcomes the class has worked on: on an exit slip or test, or practised by a fifth of the class (at least 2)
    var need = Math.max(2, Math.round(names.length / 5));
    Object.keys(practiced).forEach(function (o) { if (o !== 'EXT' && Object.keys(practiced[o]).length >= need) inPlay[o] = 1; });
    var outcomes = Object.keys(inPlay).filter(function (o) { return HW.OUTCOMES[o] && o !== 'EXT'; }).sort(byOutcome);
    var units = []; outcomes.forEach(function (o) { var u = unitOfOutcome(o); if (u < 99 && units.indexOf(u) < 0) units.push(u); });
    Object.keys(tests).forEach(function (u) { u = Number(u); if (u && units.indexOf(u) < 0) units.push(u); });
    units.sort(function (a, b) { return a - b; });
    return { roster: roster, E: E, outcomes: outcomes, exits: exits, tests: Object.keys(tests).map(function (u) { var T = tests[u]; T.outs.sort(byOutcome); return T; }).sort(function (a, b) { return a.unit - b.unit; }), units: units, practiced: practiced };
  }
  /* one student's summary per outcome, for choosing the strength and the growth */
  function summary(B, name) {
    var e = B.E[name], out = {};
    B.outcomes.forEach(function (o) {
      var t = e.test[o], p = e.prac[o], x = e.exit[o], lv = '', src = '', score = 0;
      if (t) { lv = t.ind; src = 'test'; score = t.pct; }
      else {
        var pi = p ? LADDER.indexOf(p) : -1, xi = x ? LADDER.indexOf(x) : -1;
        if (pi >= 0 || xi >= 0) { lv = pi >= xi ? p : x; src = pi >= xi ? 'practice' : 'exit'; score = TC.midPct(lv); }
      }
      var ls2 = Object.keys(e.lessons).map(function (k) { return e.lessons[k]; }).filter(function (l) { return l.outcome === o && C.SKILL[l.lesson]; });
      var n = 0, sum = 0; ls2.forEach(function (l) { n += l.n; sum += l.sum; });
      var noWork = !t && !x && !e.tried[o];
      if (!lv && !noWork) score = 10;
      ls2.forEach(function (l) { l.mean = l.sum / l.n; });
      var weak = ls2.filter(function (l) { return l.n >= 2 && l.mean < 0.75; }).sort(function (a, b) { return a.mean - b.mean || b.n - a.n; });
      if (!weak.length) weak = ls2.filter(function (l) { return l.mean < 0.5; }).sort(function (a, b) { return a.mean - b.mean; });
      var good = ls2.filter(function (l) { return l.n >= 2 && l.mean >= 0.8; }).sort(function (a, b) { return b.mean - a.mean || b.n - a.n; });
      out[o] = { outcome: o, level: lv, src: src, score: score, tie: n ? sum / n : 0, unit: t ? t.unit : unitOfOutcome(o), noWork: noWork, weak: weak, good: good };
    });
    return out;
  }
  function evLabel(x) {
    if (!x) return '';
    if (x.noWork) return x.outcome + ' · no work yet';
    return x.outcome + ' · ' + (x.src === 'test' ? 'Unit ' + x.unit + ' test ' : x.src === 'exit' ? 'exit slip ' : x.src === 'practice' ? 'practice ' : '') + (x.level ? x.level + (x.src === 'test' ? ' ' + x.score + '%' : '') : 'no level yet');
  }

  /* ---------------- score files ---------------- */
  function headInfo() {
    var c = klass(), ps = c.ps || {}, saved = lsJ('hw:ps-head:' + st.klass, {});
    return {
      teacher: saved.teacher != null ? saved.teacher : (ps.teacher || ls('hw:ps-teacher') || ''),
      course: saved.course != null ? saved.course : (ps.course || 'Mathematics 10C'),
      due: saved.due || today(), points: saved.points || ps.points || '10.0', extra: '0.0',
      type: saved.type || ps.type || 'GRADESCALE', mode: saved.mode || ((saved.type || ps.type || 'GRADESCALE').toUpperCase() === 'GRADESCALE' ? 'ind' : (saved.type || ps.type) === 'PERCENT' ? 'pct' : 'pts'),
      blankNM: !!saved.blankNM, exitRule: saved.exitRule || 'best'
    };
  }
  function saveHead(h) { ls('hw:ps-head:' + st.klass, JSON.stringify(h)); if (h.teacher) ls('hw:ps-teacher', h.teacher); }
  function fmt(h, ind, pct) {
    if (!ind && pct == null) return '';
    if (pct == null) pct = TC.midPct(ind);
    if (h.mode === 'pct') return String(Math.round(pct));
    if (h.mode === 'pts') { var p = Number(h.points) || 10; return String(Math.round(pct / 100 * p * 10) / 10); }
    return ind || indOf(pct);
  }
  /* every PowerSchool assignment we can fill: { key, group, name, scores: { student: { ind, pct } }, note } */
  function assignments(B, h) {
    var out = [], names = B.roster.map(function (s) { return s.name; });
    var names2 = lsJ('hw:ps-names:' + st.klass, {});
    function add(key, group, dflt, scores, note) { out.push({ key: key, group: group, name: names2[key] || dflt, dflt: dflt, scores: scores, note: note }); }
    B.outcomes.forEach(function (o) {
      if (!B.practiced[o]) return;
      var sc = {}; names.forEach(function (n) { var lv = B.E[n].prac[o]; if (lv) sc[n] = { ind: lv }; else if (h.blankNM && B.E[n].tried[o] === undefined) sc[n] = { ind: 'NM' }; });
      add('hw|' + o, 'hw', o + ' HW', sc, '');
    });
    // exit slips: one summary per outcome over every exit slip that had it (h.exitRule: best | avg | recent)
    var exitOuts = []; B.exits.forEach(function (ex) { ex.outs.forEach(function (o) { if (exitOuts.indexOf(o) < 0) exitOuts.push(o); }); });
    exitOuts.sort(byOutcome).forEach(function (o) {
      var slips = B.exits.filter(function (ex) { return ex.outs.indexOf(o) >= 0; }), sc = {};
      names.forEach(function (n) {
        var lvs = slips.map(function (ex) { return ex.lv[n] ? ex.lv[n][o] : null; }).filter(Boolean); // in the order they were written
        if (!lvs.length) { if (h.blankNM) sc[n] = { ind: 'NM' }; return; }
        if (h.exitRule === 'avg') { var pct = lvs.reduce(function (a, l) { return a + TC.midPct(l); }, 0) / lvs.length; sc[n] = { ind: indOf(pct), pct: Math.round(pct), n: lvs.length }; }
        else if (h.exitRule === 'recent') sc[n] = { ind: lvs[lvs.length - 1], n: lvs.length };
        else { var best = lvs.reduce(function (a, l) { return LADDER.indexOf(l) > LADDER.indexOf(a) ? l : a; }); sc[n] = { ind: best, n: lvs.length }; }
      });
      add('exits|' + o, 'exit', o + ' Exit slips', sc, slips.length + ' exit slip' + (slips.length === 1 ? '' : 's') + ': ' + slips.map(function (ex) { return ex.R.session.title; }).join(', '));
    });
    B.tests.forEach(function (T) {
      var title = T.sessions[0].session.title && /unit\s*\d+/i.test(T.sessions[0].session.title) ? T.sessions[0].session.title.replace(/\s*\(.*\)\s*$/, '') : 'Unit ' + T.unit + ' Test';
      var retests = T.sessions.filter(function (R) { return R.session.student; }).length, note = T.sessions.length + ' sitting' + (T.sessions.length === 1 ? '' : 's') + (retests ? ' (' + retests + ' retest' + (retests === 1 ? '' : 's') + ')' : '') + ' · best counts';
      T.outs.forEach(function (o) {
        var sc = {}; Object.keys(T.best).forEach(function (n) { var b = T.best[n][o]; if (b) sc[n] = { ind: b.ind, pct: b.pct }; });
        add('test|' + T.unit + '|' + o, 'test', o + ' ' + title, sc, note);
      });
      var su = {}; Object.keys(T.unitBest).forEach(function (n) { su[n] = { ind: indOf(T.unitBest[n]), pct: T.unitBest[n] }; });
      add('unit|' + T.unit, 'test', title, su, 'Unit grade · ' + note);
    });
    return out;
  }
  function day(ms) { return ms ? new Date(ms).toLocaleDateString([], { month: 'short', day: 'numeric' }) : ''; }
  function fileRows(B, a, h) {
    return B.roster.filter(function (s) { return s.num; }).map(function (s) { var x = a.scores[s.name]; return { num: s.num, name: s.name, score: x ? fmt(h, x.ind, x.pct) : '' }; });
  }
  function fileText(B, a, h) { return PS.file({ teacher: h.teacher, course: h.course, assignment: a.name, due: h.due, points: h.points, extra: h.extra, type: h.type }, fileRows(B, a, h)); }

  /* ---------------- the tab ---------------- */
  RP.render = function (body) {
    if (!st.D) return;
    var c = RP.cache[st.klass];
    if (c && c.ready && Date.now() - c.at > 5 * 60000 && !c.refreshing) { // new results since: look again in the background (sessions marked before are kept)
      c.refreshing = true; var k = st.klass, was = c; load(true).then(function () { if (st.klass === k && RP.cache[k] !== was) rerender(); });
    }
    if (!c || !c.ready) {
      body.appendChild(el('div', 'loading', '<span id="ps-progress">Marking exit slips and tests…</span>'));
      load().then(rerender); updateProgress(); return;
    }
    var B = build(), h = headInfo();
    if (c.err) body.appendChild(el('div', 'panel', '<p class="small">Exit slip and test results couldn’t load (' + esc(c.err) + '). Practice levels are still here.</p>'));
    body.appendChild(scoresPanel(B, h));
    body.appendChild(commentsPanel(B));
  };

  function scoresPanel(B, h) {
    var p = el('section', 'panel ps-panel');
    var top = el('div', 'ps-top'); top.appendChild(el('h3', '', 'Scores for PowerSchool'));
    top.appendChild(button('btn-small btn-ghost', 'Refresh results', function () { RP.cache[st.klass] = null; rerender(); })); p.appendChild(top);
    p.appendChild(el('p', 'small muted', 'Each file is one PowerSchool assignment in the same layout as its scores template, matched by student number. In PowerSchool, open the assignment’s score import and choose the file.'));
    // the header lines and how scores are written
    var g = el('div', 'ps-head');
    function field(lbl, key, type, opts) {
      var w = el('label', 'ps-f'); w.appendChild(el('span', 'lbl', lbl));
      var inp;
      if (opts) { inp = el('select', 'field'); opts.forEach(function (o) { var x = new Option(o[1], o[0]); if (String(h[key]) === o[0]) x.selected = true; inp.appendChild(x); }); }
      else { inp = el('input', 'field'); inp.type = type || 'text'; inp.value = h[key] || ''; }
      inp.addEventListener('change', function () { h[key] = inp.value; if (key === 'type') h.mode = inp.value === 'GRADESCALE' ? 'ind' : inp.value === 'PERCENT' ? 'pct' : 'pts'; saveHead(h); rerender(); });
      w.appendChild(inp); g.appendChild(w); return inp;
    }
    field('Teacher name', 'teacher'); field('Class (as in PowerSchool)', 'course'); field('Due date', 'due', 'date');
    field('Points possible', 'points', 'number'); field('Score type', 'type', null, [['GRADESCALE', 'GRADESCALE'], ['POINTS', 'POINTS'], ['PERCENT', 'PERCENT']]);
    field('Write each score as', 'mode', null, [['ind', 'Indicator (MAS, ADV, PRG…)'], ['pct', 'Percent'], ['pts', 'Points out of ' + (Number(h.points) || 10)]]);
    p.appendChild(g);
    var er = el('label', 'ps-f ps-rule'); er.appendChild(el('span', 'lbl', 'Exit slip summary per outcome'));
    var es = el('select', 'field'); [['best', 'Highest level shown'], ['avg', 'Average of the levels'], ['recent', 'Most recent exit slip']].forEach(function (o) { var x = new Option(o[1], o[0]); if (h.exitRule === o[0]) x.selected = true; es.appendChild(x); });
    es.addEventListener('change', function () { h.exitRule = es.value; saveHead(h); rerender(); }); er.appendChild(es); g.appendChild(er);
    var bl = el('label', 'tt-inline small'), bc = el('input'); bc.type = 'checkbox'; bc.checked = h.blankNM; bc.addEventListener('change', function () { h.blankNM = bc.checked; saveHead(h); rerender(); });
    bl.appendChild(bc); bl.appendChild(document.createTextNode(' Fill NM for a student with no practice on an outcome, or who wrote none of its exit slips (otherwise it’s left blank to excuse or enter later)')); p.appendChild(bl);
    var noNum = B.roster.filter(function (s) { return !s.num; });
    if (noNum.length) {
      var w = el('p', 'small ps-warn', '<b>' + noNum.length + ' student' + (noNum.length === 1 ? '' : 's') + ' without a PowerSchool student number</b> (left out of the files): ' + noNum.map(function (s) { return esc(s.name); }).join(', ') + '. ');
      w.appendChild(button('btn-xs', 'Add numbers in Settings', function () { st.tab = 'settings'; ls('hw:ttab', 'settings'); D.render(); })); p.appendChild(w);
    }
    var A = assignments(B, h), checked = lsJ('hw:ps-off:' + st.klass, {});
    if (!A.length) { p.appendChild(el('p', 'muted', 'Nothing to send yet: no practice levels, exit slips or tests for this class.')); return p; }
    var groups = [['hw', 'Homework (practice)', 'The highest level each student answered correctly in the practice for that outcome — ' + (st.scope === 'class' ? 'in class only' : 'all work') + ', counting ' + (st.rule === 'first' ? 'first-try answers' : st.rule === 'any' ? 'any right answer' : 'first-try answers and answers after a hint') + ' (change this on the Outcomes tab).'],
      ['exit', 'Exit slips', 'One grade per outcome, summing up every exit slip that had that outcome: ' + ({ avg: 'the average of the student’s levels on those slips', recent: 'the level on the most recent slip the student wrote' }[h.exitRule] || 'the highest level the student showed on any of them') + '. On each slip, a student who got nothing right on the outcome counts as NM; slips a student missed are left out.'],
      ['test', 'Unit tests', 'Each outcome’s indicator from its Beginning, Progressing and Mastery boxes, and the unit grade. A student’s best sitting counts (the class test or a retest).']];
    var t = el('table', 'tbl ps-list'), tb = el('tbody'); t.appendChild(tb);
    groups.forEach(function (gr) {
      var rows = A.filter(function (a) { return a.group === gr[0]; }); if (!rows.length) return;
      var hr = el('tr', 'ps-grp'); hr.innerHTML = '<th colspan="5">' + gr[1] + '<div class="small muted">' + gr[2] + '</div></th>'; tb.appendChild(hr);
      rows.forEach(function (a) {
        var tr = el('tr'), have = B.roster.filter(function (s) { return s.num && a.scores[s.name]; }).length, withNum = B.roster.filter(function (s) { return s.num; }).length;
        tr.innerHTML = '<td class="ps-ck"></td><td class="ps-nm"></td><td class="small muted">' + have + ' of ' + withNum + ' with a score' + (a.note ? ' · ' + esc(a.note) : '') + '</td><td class="ps-dist"></td><td class="ps-act"></td>';
        var cb = el('input'); cb.type = 'checkbox'; cb.checked = !checked[a.key]; cb.setAttribute('aria-label', 'Include ' + a.name);
        cb.addEventListener('change', function () { if (cb.checked) delete checked[a.key]; else checked[a.key] = 1; ls('hw:ps-off:' + st.klass, JSON.stringify(checked)); });
        tr.querySelector('.ps-ck').appendChild(cb);
        var nm = el('input', 'field ps-name'); nm.value = a.name; nm.title = 'The assignment name in the file (PowerSchool matches by the assignment you import into)';
        nm.addEventListener('change', function () { var m = lsJ('hw:ps-names:' + st.klass, {}); if (nm.value.trim() && nm.value.trim() !== a.dflt) m[a.key] = nm.value.trim(); else delete m[a.key]; a.name = nm.value.trim() || a.dflt; ls('hw:ps-names:' + st.klass, JSON.stringify(m)); });
        tr.querySelector('.ps-nm').appendChild(nm);
        var dist = {}; Object.keys(a.scores).forEach(function (n) { var i = a.scores[n].ind || indOf(a.scores[n].pct); dist[i] = (dist[i] || 0) + 1; });
        tr.querySelector('.ps-dist').innerHTML = LADDER.slice().reverse().filter(function (l) { return dist[l]; }).map(function (l) { return '<span class="ps-chip lvlbg-' + l + '" title="' + esc(LVN[l] || 'Not meeting') + '">' + l + ' ' + dist[l] + '</span>'; }).join('');
        var act = tr.querySelector('.ps-act');
        act.appendChild(button('btn-xs btn-ghost', 'Preview', function () { preview(tr, B, a, h); }));
        act.appendChild(button('btn-xs', 'Download', function () { PS.save(PS.fileName(a.name) + '.csv', fileText(B, a, h)); }));
        tb.appendChild(tr);
      });
    });
    p.appendChild(D.wrapTbl(t));
    var bar = el('div', 'ps-acts');
    bar.appendChild(button('btn-primary btn-small', 'Download the checked files (.zip)', function () {
      var files = A.filter(function (a) { return !checked[a.key]; }).map(function (a) { return { name: PS.fileName(a.name) + '.csv', text: fileText(B, a, h) }; });
      if (!files.length) { alert('Check at least one assignment first.'); return; }
      PS.save(PS.fileName(klass().label + ' PowerSchool scores ' + h.due) + '.zip', PS.zip(files));
    }));
    bar.appendChild(button('btn-small btn-ghost', 'Check all', function () { checked = {}; ls('hw:ps-off:' + st.klass, '{}'); rerender(); }));
    bar.appendChild(button('btn-small btn-ghost', 'Uncheck all', function () { A.forEach(function (a) { checked[a.key] = 1; }); ls('hw:ps-off:' + st.klass, JSON.stringify(checked)); rerender(); }));
    p.appendChild(bar);
    return p;
  }
  function preview(tr, B, a, h) {
    var nx = tr.nextSibling; if (nx && nx.classList && nx.classList.contains('ps-prev')) { nx.remove(); return; }
    var row = el('tr', 'ps-prev'), td = el('td'); td.colSpan = 5; row.appendChild(td);
    var rows = fileRows(B, a, h);
    td.innerHTML = '<pre class="ps-pre">' + esc(PS.file({ teacher: h.teacher, course: h.course, assignment: a.name, due: h.due, points: h.points, extra: h.extra, type: h.type }, rows)) + '</pre>';
    tr.parentNode.insertBefore(row, tr.nextSibling);
  }

  /* ---------------- report card comments ---------------- */
  function editsKey() { return 'hw:rc-edit2:' + st.klass; } // (2: the edited text now includes the course overview)
  function picksKey() { return 'hw:rc-pick:' + st.klass; }
  function overallOf(B, sum) { // the average outcome score (no work on an outcome = 0); null when there is nothing at all
    var outs = B.outcomes.filter(function (o) { return sum[o]; }), any = outs.some(function (o) { return !sum[o].noWork; });
    if (!outs.length || !any) return null;
    return outs.reduce(function (a, o) { return a + (sum[o].noWork ? 0 : sum[o].score); }, 0) / outs.length;
  }
  function signKey() { return 'hw:rc-sign:' + st.klass; }
  function personalFor(B, s, sum, pk) {
    var outs = B.outcomes.filter(function (o) { return sum[o]; });
    var auto = C.choose(sum), so = pk.s && sum[pk.s] ? pk.s : auto.strength, go = pk.g && sum[pk.g] ? pk.g : auto.growth;
    var S = so ? sum[so] : null, G = go ? sum[go] : null;
    if (!outs.length || (!S && !G)) return { text: '', strength: so, growth: go, empty: true };
    var sk = S && S.good[0] ? S.good[0].lesson : '';
    var gk = '';
    if (G) { var w = G.weak.filter(function (l) { return !(go === so && l.lesson === sk); }); gk = w[0] ? w[0].lesson : ''; }
    var stS = S ? { outcome: so, level: S.level, src: S.src, unit: S.unit, skill: sk } : null;
    var stG = G ? { outcome: go, level: G.level, src: G.src, unit: G.unit, skill: gk, noWork: G.noWork } : null;
    if (go === so && !gk && G && !G.noWork && LADDER.indexOf(G.level) < 6) stG.skill = ''; // one outcome only: a general next step in it
    return { text: C.personal({ name: s.name, pronouns: s.pronouns, strength: stS, growth: stG }, RP.rot), strength: so, growth: go };
  }
  function bodyFor(gen, s, courseName) { // the course overview + the personal part (what the comment box holds)
    return [C.courseLine(courseName, s.name, RP.rot), gen.empty ? '' : gen.text].filter(Boolean).join(' ');
  }
  function commentsPanel(B) {
    var p = el('section', 'panel rc-panel'); p.appendChild(el('h3', '', 'Report card comments'));
    p.appendChild(el('p', 'small muted', 'Comments are for the end of the semester. Each one is an overview of the course, one area of strength and one area for growth from the student’s outcome levels, the IPP sentence for students on an IPP, and a sign-off. The wording is shared out across the class so students get different sentences. The levels come from the best unit test result where there is one, otherwise practice and exit slips. Read each one before it goes on a report card: change the strength or growth, or edit the words. Your edits stay in this browser.'));
    var courseName = headInfo().course;
    var noPro = B.roster.filter(function (s) { return !s.pronouns; }).length;
    if (noPro) p.appendChild(el('p', 'small ps-warn', noPro + ' student' + (noPro === 1 ? ' has' : 's have') + ' no pronouns set, so ' + (noPro === 1 ? 'that comment uses the student’s' : 'those comments use the student’s') + ' first name instead. Set them here or in Settings.'));

    var edits = lsJ(editsKey(), {}), picks = lsJ(picksKey(), {}), signs = lsJ(signKey(), {}), rowsOut = [];
    RP.rot = C.rotation(); // the class shares the templates out, so neighbours don't read the same
    var signOn = ls('hw:rc-signon:' + st.klass) !== '0';
    var sl = el('label', 'tt-inline small'), sc = el('input'); sc.type = 'checkbox'; sc.checked = signOn;
    sc.addEventListener('change', function () { signOn = sc.checked; ls('hw:rc-signon:' + st.klass, signOn ? '1' : '0'); refreshAll(); });
    sl.appendChild(sc); sl.appendChild(document.createTextNode(' End each comment with a sign-off (“Overall, great work this semester, …!”), matched to how the student is doing')); p.appendChild(sl);
    var t = el('table', 'tbl rc-tbl'); t.innerHTML = '<thead><tr><th>Student</th><th>Pronouns</th><th>IPP</th><th>Strength</th><th>Area for growth</th><th>Comment</th></tr></thead>';
    var tb = el('tbody'); t.appendChild(tb);
    var c = klass();
    B.roster.forEach(function (s) {
      var sum = summary(B, s.name), tr = el('tr'), pk = picks[s.name] || {};
      tr.innerHTML = '<td class="rc-name"><a href="#" class="slink">' + esc(s.name) + '</a></td><td class="rc-pro"></td><td class="rc-ipp"></td><td class="rc-s"></td><td class="rc-g"></td><td class="rc-c"></td>';
      tr.querySelector('.slink').addEventListener('click', function (e) { e.preventDefault(); D.openStudent(s.name); });
      var ps2 = D.pronounSelect(c, s, p); ps2.onsaved = function () { draw(); }; tr.querySelector('.rc-pro').appendChild(ps2);
      var ip = D.ippBox(c, s, p); ip.querySelector('input').onsaved = function () { draw(); }; tr.querySelector('.rc-ipp').appendChild(ip);
      var outs = B.outcomes.filter(function (o) { return sum[o]; });
      function sel(kind) {
        var x = el('select', 'field rc-sel'); x.setAttribute('aria-label', (kind === 's' ? 'Strength' : 'Area for growth') + ' for ' + s.name);
        x.appendChild(new Option('Automatic', ''));
        outs.forEach(function (o) { x.appendChild(new Option(evLabel(sum[o]), o)); });
        x.value = pk[kind] || '';
        x.addEventListener('change', function () { pk[kind] = x.value; picks[s.name] = pk; ls(picksKey(), JSON.stringify(picks)); delete edits[s.name]; ls(editsKey(), JSON.stringify(edits)); draw(); });
        return x;
      }
      var sS = sel('s'), sG = sel('g'), eS = el('div', 'rc-ev small muted'), eG = el('div', 'rc-ev small muted');
      tr.querySelector('.rc-s').appendChild(sS); tr.querySelector('.rc-s').appendChild(eS); tr.querySelector('.rc-g').appendChild(sG); tr.querySelector('.rc-g').appendChild(eG);
      var cc = tr.querySelector('.rc-c'), ta = el('textarea', 'field rc-text'); ta.rows = 4; ta.setAttribute('aria-label', 'Comment for ' + s.name);
      var meta = el('div', 'rc-meta small muted'), so = el('input', 'field rc-sign'), ippP = el('div', 'rc-ippline small'); so.setAttribute('aria-label', 'Sign-off for ' + s.name);
      cc.appendChild(ta); cc.appendChild(ippP); cc.appendChild(so); cc.appendChild(meta);
      so.addEventListener('input', function () { signs[s.name] = so.value; ls(signKey(), JSON.stringify(signs)); draw(); });
      var rec = { s: s }; rowsOut.push(rec);
      function draw() {
        var gen = personalFor(B, s, sum, pk);
        rec.gen = gen;
        eS.textContent = gen.strength ? evLabel(sum[gen.strength]).replace(/^\w+ · /, '') : ''; eG.textContent = gen.growth ? evLabel(sum[gen.growth]).replace(/^\w+ · /, '') : '';
        sS.options[0].text = 'Automatic' + (gen.strength && !pk.s ? ': ' + gen.strength : ''); sG.options[0].text = 'Automatic' + (gen.growth && !pk.g ? ': ' + gen.growth : '');
        var personal = edits[s.name] != null ? edits[s.name] : bodyFor(gen, s, courseName);
        rec.personal = personal;
        if (document.activeElement !== ta) ta.value = personal;
        fit(); requestAnimationFrame(fit); // (the row may not be on the page yet the first time)
        ta.placeholder = '';
        ippP.hidden = !s.ipp; ippP.textContent = s.ipp ? C.ipp(s.name, s.pronouns) : '';
        var autoSign = C.signoff(s, overallOf(B, sum), RP.rot), sign = signOn ? (signs[s.name] != null ? signs[s.name] : autoSign) : '';
        so.hidden = !signOn; if (document.activeElement !== so) so.value = sign; rec.sign = sign;
        var full = C.full(personal, s, sign);
        rec.full = full;
        meta.innerHTML = (gen.empty && edits[s.name] == null ? '<span class="rc-ipptag">Not enough evidence for a strength or growth: add your own.</span> ' : '') + full.length + ' characters' + (edits[s.name] != null || (signOn && signs[s.name] != null) ? ' · edited <a href="#" class="rc-undo">use the suggested wording</a>' : '');
        var u = meta.querySelector('.rc-undo'); if (u) u.addEventListener('click', function (e) { e.preventDefault(); delete edits[s.name]; delete signs[s.name]; ls(editsKey(), JSON.stringify(edits)); ls(signKey(), JSON.stringify(signs)); so.value = ''; draw(); });
        tr.classList.toggle('rc-empty', !!gen.empty && edits[s.name] == null);
      }
      function fit() { if (!ta.isConnected) return; ta.style.height = 'auto'; ta.style.height = Math.max(64, ta.scrollHeight + 2) + 'px'; }
      ta.addEventListener('input', function () { edits[s.name] = ta.value; ls(editsKey(), JSON.stringify(edits)); draw(); });
      rec.draw = draw; draw();
      tb.appendChild(tr);
    });
    function refreshAll() { rowsOut.forEach(function (r) { r.draw(); }); }
    p.appendChild(D.wrapTbl(t));
    var bar = el('div', 'ps-acts');
    bar.appendChild(button('btn-primary btn-small', 'Download comments (.csv)', function () {
      var rows = [['Student Num', 'Student Name', 'Comment', 'IPP sentence', 'Sign-off', 'Strength', 'Area for growth']];
      rowsOut.forEach(function (r) { rows.push([r.s.num || '', r.s.name, r.full, r.s.ipp ? C.ipp(r.s.name, r.s.pronouns) : '', r.sign || '', r.gen.strength || '', r.gen.growth || '']); });
      var csv = '﻿' + rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\r\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\r\n') + '\r\n';
      PS.save(PS.fileName(klass().label + ' report card comments') + '.csv', csv);
    }));
    var em = rowsOut.filter(function (r) { return r.gen.empty && edits[r.s.name] == null; }).length;
    if (em) bar.appendChild(el('span', 'small muted', em + ' without a strength or growth yet'));
    p.appendChild(bar);
    return p;
  }
  RP.build = build; RP.summary = summary; RP.assignments = assignments; RP.headInfo = headInfo; RP.fileText = fileText;
})(window);
