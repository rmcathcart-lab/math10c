/* Math 10C Practice — the student app.
 * Screens: sign in (class code → name → PIN), home (every lesson with a progress bar), lesson (one question at a time).
 * Progress lives on the device (localStorage) and is mirrored to the teacher's ledger when one is configured. */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, esc = HW.esc, L = HW.Ledger, cfg = root.HW_CONFIG || {};
  var view = document.getElementById('view'), top = document.getElementById('topbar');
  var STORE = 'hw:v1:', SESSION = 'hw:session', AWAY_GRACE = 1500, IDLE_MS = 120000;
  var S = null, session = null, rosterInfo = {}, cur = { lesson: null, item: null, inst: null, widget: null, practice: false, notice: null };
  var lastInteract = Date.now(), pendingSecs = {}, saveTimer = null;

  /* ---------------- storage ---------------- */
  function ls(k, v) { try { if (v === undefined) return root.localStorage.getItem(k); if (v === null) root.localStorage.removeItem(k); else root.localStorage.setItem(k, v); } catch (e) { return null; } }
  function deviceId() { var d = ls('hw:device'); if (!d) { d = 'd' + HW.newSeed().toString(36) + Date.now().toString(36); ls('hw:device', d); } return d; }
  function studentKey() { return (session.klass || 'local').toLowerCase() + '|' + session.name.toLowerCase(); }
  function loadState() { var raw = ls(STORE + studentKey()); try { S = raw ? JSON.parse(raw) : null; } catch (e) { S = null; } if (!S || S.v !== 1) S = { v: 1, lessons: {} }; }
  function saveState() { ls(STORE + studentKey(), JSON.stringify(S)); }
  function saveSoon(lid) { if (saveTimer) clearTimeout(saveTimer); saveTimer = setTimeout(function () { saveTimer = null; saveState(); if (lid) pushProgress(lid); }, 600); }
  function LS(lid) { var x = S.lessons[lid]; if (!x) x = S.lessons[lid] = { items: {}, qv: {}, cur: null, secs: 0, updated: 0 }; return x; }
  function IR(lid, id) { var l = LS(lid), r = l.items[id]; if (!r) r = l.items[id] = { s: 'new', v: 0, tv: 0, wrong: 0, steps: 0, forms: 0, reveals: 0, credit: null, secs: 0, at: 0, prac: 0 }; return r; }
  function touch(lid) { LS(lid).updated = Date.now(); saveSoon(lid); }

  /* ---------------- seeds: each student gets their own numbers, the same on every device ---------------- */
  function seedFor(lid, id, v, prac) { return HW.hashStr(studentKey() + '|' + lid + '|' + id + '|' + v + (prac ? '|p' + prac : '')); }
  function qseedFor(lid, qnum) { return HW.hashStr(studentKey() + '|' + lid + '|q' + qnum + '|' + (LS(lid).qv[qnum] || 0)); }
  function instanceFor(lesson, it, prac) {
    var r = IR(lesson.id, it.id);
    return HW.makeInstance(lesson, it, seedFor(lesson.id, it.id, r.v, prac ? r.prac : 0), prac ? seedFor(lesson.id, 'q' + it.q.num, r.prac, 1) : qseedFor(lesson.id, it.q.num));
  }

  /* ---------------- progress summary ---------------- */
  function summary(lesson) {
    var l = LS(lesson.id), s = { req: lesson.required.length, reqDone: 0, reqFirst: 0, reqShown: 0, extra: lesson.extras.length, extraDone: 0, secs: l.secs || 0, cur: l.cur };
    lesson.items.forEach(function (it) {
      var r = l.items[it.id]; if (!r || r.s !== 'done') return;
      if (it.extra) s.extraDone++; else { s.reqDone++; if (r.credit === 'first') s.reqFirst++; if (r.credit === 'shown') s.reqShown++; }
    });
    return s;
  }
  function pushProgress(lid) { var lesson = HW.lessons[lid]; if (!lesson || !L.enabled) return; L.setProgress(lid, summary(lesson), LS(lid)); }
  function bar(lesson, big) {
    var s = summary(lesson), w = el('div', 'pbar' + (big ? ' big' : ''));
    var req = el('div', 'pb-track pb-req'); req.style.flexGrow = s.req;
    var helpN = s.reqDone - s.reqFirst;
    req.innerHTML = '<span class="pb-fill first" style="width:' + (100 * s.reqFirst / s.req) + '%"></span><span class="pb-fill help" style="width:' + (100 * helpN / s.req) + '%"></span>';
    w.appendChild(req);
    if (s.extra) { var ex = el('div', 'pb-track pb-extra'); ex.style.flexGrow = s.extra; ex.innerHTML = '<span class="pb-fill extra" style="width:' + (100 * s.extraDone / s.extra) + '%"></span>'; w.appendChild(ex); }
    w.title = s.reqDone + ' of ' + s.req + ' required done (' + s.reqFirst + ' first try)' + (s.extra ? ', ' + s.extraDone + ' of ' + s.extra + ' extra practice' : '');
    w.setAttribute('role', 'img'); w.setAttribute('aria-label', w.title);
    return w;
  }

  /* ---------------- top bar ---------------- */
  function drawTop(crumb) {
    top.innerHTML = '';
    var brand = el('a', 'brand', '<span class="brand-mark" aria-hidden="true">10C</span><span class="brand-name">' + esc(cfg.siteName || 'Math 10C Practice') + '</span>'); brand.href = '#/';
    top.appendChild(brand);
    if (crumb) top.appendChild(el('div', 'crumb', crumb));
    var right = el('div', 'top-right');
    if (session) {
      var calcB = el('button', 'btn btn-ghost top-calc', (HW.CALC_ICON || '') + '<span>Calculator</span>');
      calcB.type = 'button'; calcB.title = 'On-screen calculator (TI-30XIIS layout)'; calcB.addEventListener('click', function () { HW.Calc.toggle(); });
      right.appendChild(calcB);
      if (L.enabled) { var dot = el('span', 'sync-dot' + (L.ok === false ? ' bad' : L.ok ? ' good' : ''), ''); dot.title = L.ok === false ? 'Can’t reach your teacher’s ledger right now — your work is saved on this device and will be sent later.' : 'Your work is being saved for your teacher.'; right.appendChild(dot); }
      var who = el('button', 'btn btn-ghost who', esc(session.name) + (session.klass ? ' <span class="muted">· ' + esc(session.klass) + '</span>' : '')); who.type = 'button'; who.title = 'Sign out';
      who.addEventListener('click', function () { if (confirm('Sign out of ' + session.name + '?')) signOut(); });
      right.appendChild(who);
    }
    top.appendChild(right);
  }

  /* ---------------- sign in ---------------- */
  function signOut(msg) { L.flush(true); session = null; ls(SESSION, null); L.session = null; S = null; location.hash = '#/'; renderSignIn(msg); }
  function startSession(sess) {
    session = sess; ls(SESSION, JSON.stringify(sess)); L.session = { klass: sess.klass, name: sess.name, token: sess.token, device: deviceId() };
    loadState(); L.start();
    if (L.enabled) {
      L.get('progress', { 'class': sess.klass, name: sess.name, token: sess.token }).then(function (d) {
        if (d && d.ok === false && d.error === 'badtoken') { signOut('Your PIN was reset by your teacher. Sign in again.'); return; }
        if (d && d.ok && d.lessons) { var changed = merge(d.lessons); if (changed) { saveState(); route(); } }
        if (d && d.ok) {
          var blk = (d.times && d.times.block) || '';
          if (blk !== (session.block || '')) { session.block = blk; ls(SESSION, JSON.stringify(session)); if (cur.lesson) drawNav(); }
          drawTop(top.dataset.crumb);
        }
      }).catch(function () {});
    }
    route();
  }
  /* server copy vs this device: per item keep the further-along record */
  function rank(r) { return r ? ({ 'new': 0, open: 1, shown: 2, done: 3 }[r.s] || 0) * 1e6 + (r.wrong || 0) + (r.v || 0) * 10 : -1; }
  function merge(remote) {
    var changed = false;
    Object.keys(remote).forEach(function (lid) {
      var rs = remote[lid]; if (!rs || !rs.items) return;
      var mine = LS(lid);
      Object.keys(rs.items).forEach(function (id) { if (rank(rs.items[id]) > rank(mine.items[id])) { mine.items[id] = rs.items[id]; changed = true; } });
      Object.keys(rs.qv || {}).forEach(function (q) { if ((rs.qv[q] || 0) > (mine.qv[q] || 0)) { mine.qv[q] = rs.qv[q]; changed = true; } });
      if ((rs.secs || 0) > (mine.secs || 0)) { mine.secs = rs.secs; changed = true; }
      if (!mine.cur && rs.cur) mine.cur = rs.cur;
    });
    return changed;
  }
  function renderSignIn(msg) {
    drawTop(); document.body.className = 'signin';
    view.innerHTML = '';
    var card = el('div', 'signin-card');
    card.appendChild(el('div', 'signin-mark', '10C'));
    card.appendChild(el('h1', '', esc(cfg.siteName || 'Math 10C Practice')));
    card.appendChild(el('p', 'muted', 'Homework practice for every lesson — new numbers each time, hints when you’re stuck.'));
    if (msg) card.appendChild(el('div', 'notice', esc(msg)));
    var body = el('div', 'signin-body'); card.appendChild(body); view.appendChild(card);
    if (!L.enabled) return localSignIn(body);
    var params = new URLSearchParams(location.search), preset = params.get('class') || params.get('c') || ls('hw:lastclass') || '';
    stepClass(body, preset, !!(params.get('class') || params.get('c')));
  }
  function localSignIn(body) {
    body.innerHTML = '<label class="lbl" for="nm">Your name</label>';
    var inp = el('input', 'field'); inp.id = 'nm'; inp.placeholder = 'First and last name'; inp.autocomplete = 'name'; body.appendChild(inp);
    var go = el('button', 'btn btn-primary btn-block', 'Start'); go.type = 'button'; body.appendChild(go);
    body.appendChild(el('p', 'small muted', 'Practice mode: your work is saved on this device only.'));
    function start() { var n = inp.value.trim(); if (n.length < 2) { inp.focus(); return; } startSession({ klass: '', name: n, token: '' }); }
    go.addEventListener('click', start); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') start(); }); inp.focus();
  }
  function stepClass(body, preset, auto) {
    body.innerHTML = '<label class="lbl" for="cc">Class code</label>';
    var inp = el('input', 'field'); inp.id = 'cc'; inp.placeholder = 'From your teacher'; inp.value = preset; inp.autocomplete = 'off'; inp.setAttribute('autocapitalize', 'off'); body.appendChild(inp);
    var go = el('button', 'btn btn-primary btn-block', 'Continue'); go.type = 'button'; body.appendChild(go);
    var err = el('div', 'form-err'); body.appendChild(err);
    function next() {
      var code = inp.value.trim(); if (!code) { inp.focus(); return; }
      go.disabled = true; go.textContent = 'Finding your class…'; err.textContent = '';
      L.get('roster', { 'class': code }).then(function (d) {
        go.disabled = false; go.textContent = 'Continue';
        if (!d || !d.ok) { err.textContent = d && d.error === 'unknown class' ? 'That class code wasn’t found. Check it with your teacher.' : 'Something went wrong. Try again.'; return; }
        ls('hw:lastclass', code); rosterInfo = { label: d.label || '', block: (d.times && d.times.block) || '' }; stepName(body, d.code || code, d.names || [], d.label);
      }).catch(function () { go.disabled = false; go.textContent = 'Continue'; err.textContent = 'Can’t reach the class list right now. Check your internet connection and try again.'; });
    }
    go.addEventListener('click', next); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') next(); });
    if (auto && preset) next(); else inp.focus();
  }
  function stepName(body, klass, names, label) {
    body.innerHTML = '';
    body.appendChild(el('div', 'step-head', '<b>' + esc(label || klass) + '</b> · Who are you?'));
    var filter = el('input', 'field'); filter.placeholder = 'Type to find your name'; filter.autocomplete = 'off'; body.appendChild(filter);
    var grid = el('div', 'name-grid'); body.appendChild(grid);
    function draw() {
      var f = filter.value.trim().toLowerCase(); grid.innerHTML = '';
      names.filter(function (n) { return !f || n.name.toLowerCase().indexOf(f) >= 0; }).forEach(function (n) {
        var b = el('button', 'name-btn', esc(n.name)); b.type = 'button';
        b.addEventListener('click', function () { stepPin(body, klass, n.name, !n.pin); });
        grid.appendChild(b);
      });
      if (!grid.children.length) grid.appendChild(el('div', 'muted small', names.length ? 'No names match.' : 'Your teacher hasn’t added a class list yet.'));
    }
    filter.addEventListener('input', draw); draw(); filter.focus();
    var back = el('button', 'btn btn-ghost btn-small', '← Different class code'); back.type = 'button'; back.addEventListener('click', function () { stepClass(body, '', false); }); body.appendChild(back);
  }
  function stepPin(body, klass, name, create) {
    body.innerHTML = '';
    body.appendChild(el('div', 'step-head', '<b>' + esc(name) + '</b>'));
    body.appendChild(el('p', 'small', create ? 'First time here: make up a 4-digit PIN. You’ll use it to sign in on any device, so pick one you’ll remember (and keep it to yourself).' : 'Enter your 4-digit PIN.'));
    var a = el('input', 'field pin'); a.type = 'password'; a.setAttribute('inputmode', 'numeric'); a.maxLength = 4; a.placeholder = '••••'; a.autocomplete = create ? 'new-password' : 'current-password'; body.appendChild(a);
    var b = null; if (create) { b = el('input', 'field pin'); b.type = 'password'; b.setAttribute('inputmode', 'numeric'); b.maxLength = 4; b.placeholder = 'again'; body.appendChild(b); }
    var go = el('button', 'btn btn-primary btn-block', create ? 'Create PIN and start' : 'Sign in'); go.type = 'button'; body.appendChild(go);
    var err = el('div', 'form-err'); body.appendChild(err);
    var back = el('button', 'btn btn-ghost btn-small', '← Not you?'); back.type = 'button'; back.addEventListener('click', function () { L.get('roster', { 'class': klass }).then(function (d) { stepName(body, klass, d.names || [], d.label); }); }); body.appendChild(back);
    function submit() {
      var p = a.value.trim();
      if (!/^\d{4}$/.test(p)) { err.textContent = 'Your PIN is 4 digits.'; a.focus(); return; }
      if (create && b.value.trim() !== p) { err.textContent = 'The two PINs don’t match.'; b.focus(); return; }
      go.disabled = true; err.textContent = '';
      L.get(create ? 'setpin' : 'signin', { 'class': klass, name: name, pin: p, device: deviceId() }).then(function (d) {
        go.disabled = false;
        if (d && d.ok && d.token) { startSession({ klass: klass, name: name, token: d.token, label: rosterInfo.label, block: rosterInfo.block }); return; }
        err.textContent = d && d.error === 'badpin' ? 'That PIN isn’t right. Ask your teacher to reset it if you forgot it.' : d && d.error === 'haspin' ? 'This name already has a PIN.' : d && d.error === 'locked' ? 'Too many tries. Wait a few minutes or ask your teacher.' : 'Something went wrong. Try again.';
        if (d && d.error === 'haspin') stepPin(body, klass, name, false);
      }).catch(function () { go.disabled = false; err.textContent = 'Can’t reach the server. Check your internet connection.'; });
    }
    go.addEventListener('click', submit);
    [a, b].forEach(function (x) { if (x) x.addEventListener('keydown', function (e) { if (e.key === 'Enter') { if (x === a && b && !b.value) b.focus(); else submit(); } }); });
    a.focus();
  }

  /* ---------------- router ---------------- */
  function route() {
    if (!session) return renderSignIn();
    var h = location.hash.replace(/^#\/?/, '').split('/');
    if (h[0] === 'lesson' && HW.lessons[h[1]] && !HW.lessons[h[1]].test) return openLesson(HW.lessons[h[1]], h[2]); // unit tests are only written in test mode
    if (h[0] === 'results' && HW.TestMode) { leaveLesson(); return HW.TestMode.renderResults(view, h[1]); }
    if (h[0] === 'calendar') { renderHome(); return openCalendar(); }
    renderHome();
  }
  root.addEventListener('hashchange', route);

  /* ---------------- home ---------------- */
  /* the student's level on each outcome of a unit: the highest question level answered correctly on the first try or after a hint */
  function unitLevels(u) {
    var LV = HW.LEVELS, best = {}, outs = String(u.outcomes || '').split(/\s*·\s*/).filter(Boolean);
    u.lessons.forEach(function (c) {
      var lesson = HW.lessons[c.id]; if (!lesson) return;
      lesson.items.forEach(function (it) {
        var r = (S.lessons[lesson.id] || { items: {} }).items[it.id];
        if (!r || r.s !== 'done' || (r.credit !== 'first' && r.credit !== 'hint')) return;
        if (it.outcome === 'EXT') return; // extension lessons (e.g. distance and midpoint) don't count toward a level
        if (outs.indexOf(it.outcome) < 0) outs.push(it.outcome);
        if (best[it.outcome] == null || LV.indexOf(it.level) > LV.indexOf(best[it.outcome])) best[it.outcome] = it.level;
      });
    });
    var wrap = el('span', 'unit-levels', '<span class="ulv-note">Your level:</span>');
    wrap.title = 'Your level on each outcome: the hardest level of question you have answered correctly on the first try or after a hint.';
    outs.forEach(function (o) {
      var lv = best[o], i = lv ? LV.indexOf(lv) : -1, dots = '';
      for (var k = 0; k < LV.length; k++) dots += '<i class="' + (k <= i ? 'on lvbg-' + lv : '') + '"></i>';
      wrap.appendChild(el('span', 'ulv' + (lv ? '' : ' none'), '<b>' + esc(o) + '</b><span class="ulv-dots" aria-hidden="true">' + dots + '</span>' +
        (lv ? '<span class="lvl lvl-' + lv + '">' + HW.LEVEL_NAMES[lv] + '</span>' : '<span class="ulv-none">No level yet</span>')));
    });
    return wrap;
  }
  /* where each assignment is in the catalog: { u: unit, c: catalog entry } */
  function catEntry(id) { var hit = null; HW.CATALOG.some(function (u) { return u.lessons.some(function (c) { if (c.id === id) { hit = { u: u, c: c }; return true; } }); }); return hit; }
  function goLabel(s) { return s.reqDone || s.extraDone ? (s.reqDone === s.req ? 'Review' : 'Continue') : 'Start'; }
  /* the panel at the top of the home page: today's lesson from the class calendar (open the lesson, start its assignment),
     or the unit test if that's today; with no class today, the assignment the student was last working on */
  function homeToday() {
    var C = HW.Cal, D = calData(), key = null, kind = 'today';
    var evs = C && D ? C.eventsOn(D.cal, C.today()) : [], ev = evs.filter(function (e) { return e.takes || e.kind === 'exam'; })[0];
    if (ev) {   // the teacher's own entry that takes the class today (a cumulative exam)
      var eb = el('section', 'today is-test');
      eb.innerHTML = '<div class="td-badge" aria-hidden="true">📝</div><div class="td-main"><div class="td-when">Today in class</div><h2 class="td-title">' + esc(ev.title) + '</h2><div class="td-sub">' + (ev.kind === 'exam' ? 'Exam' : '') + '</div></div>';
      return eb;
    }
    if (C && D) { var on = C.on(D.cal, D.noSchool, C.today()); key = on.filter(function (k) { return C.info(k).kind !== 'test'; })[0] || on[0] || null; }
    if (!key) { var last = lastLesson(), ls0 = last && HW.lessons[last]; if (ls0) { var s0 = summary(ls0); if (s0.reqDone < s0.req && (s0.reqDone || s0.extraDone)) { key = last; kind = 'resume'; } } }
    if (!key) return null;
    var info = C ? C.info(key) : null;
    if (info && info.kind === 'test') {
      var tb = el('section', 'today is-test'); if (HW.unitStyle) tb.setAttribute('style', HW.unitStyle(info.unit));
      tb.innerHTML = '<div class="td-badge" aria-hidden="true">📝</div><div class="td-main"><div class="td-when">Today in class</div><h2 class="td-title">' + esc(info.title) + '</h2><div class="td-sub">' + esc(info.unitTitle || '') + '</div></div>';
      return tb;
    }
    var ce = catEntry(key); if (!ce) return null;
    var c = ce.c, lesson = HW.lessons[key], turl = teachingUrl(c);
    var box = el('section', 'today' + (kind === 'resume' ? ' is-resume' : '')); if (HW.unitStyle) box.setAttribute('style', HW.unitStyle(ce.u.unit));
    var when = kind === 'resume' ? 'Pick up where you left off' : 'Today in class';
    box.appendChild(el('div', 'td-badge', '<span class="td-k">' + (kind === 'resume' ? 'Assignment' : 'Lesson') + '</span><span class="td-n">' + esc(c.num) + '</span>'));
    var main = el('div', 'td-main', '<div class="td-when">' + when + ' · Unit ' + ce.u.unit + '</div><h2 class="td-title">' + HW.tex(esc(c.title)) + '</h2>');
    if (lesson) { var s = summary(lesson), pr = el('div', 'td-prog'); pr.appendChild(bar(lesson)); pr.appendChild(el('span', 'td-count', '<b>' + s.reqDone + '</b>/' + s.req + ' required done')); main.appendChild(pr); }
    box.appendChild(main);
    var acts = el('div', 'td-acts');
    if (turl && kind !== 'resume') { var a1 = el('a', 'btn td-lesson', 'Open Lesson ' + esc(c.num)); a1.href = turl; a1.addEventListener('click', function () { L.push({ t: 'event', type: 'notes', lesson: c.id }); }); acts.appendChild(a1); }
    if (lesson) { var a2 = el('a', 'btn btn-primary td-go', goLabel(summary(lesson)) + ' Assignment ' + esc(c.num)); a2.href = '#/lesson/' + lesson.id; acts.appendChild(a2); }
    if (acts.children.length) box.appendChild(acts);
    return box;
  }
  function renderHome() {
    leaveLesson(); document.body.className = 'home';
    drawTop(); top.dataset.crumb = '';
    view.innerHTML = '';
    var head = el('div', 'home-head'), hl = el('div', 'hh-text');
    var nm = el('div', 'hh-name'); nm.appendChild(el('h1', '', 'Hi, ' + esc(session.name.split(' ')[0]) + '.'));
    var md = el('div', 'hh-medals'); nm.appendChild(md); hl.appendChild(nm); homeMedals(md);
    hl.appendChild(el('p', 'hh-date', esc(new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }))));
    head.appendChild(hl);
    var acts = el('div', 'hh-cal'); acts.id = 'home-cal'; homeCalendar(acts); head.appendChild(acts); // the next test + the class calendar, on the right
    view.appendChild(head);
    loadCal(); loadRetests();
    var td = homeToday(); if (td) view.appendChild(td);
    if (HW.TestMode) HW.TestMode.home(view);
    var uhead = el('div', 'units-head', '<h2>Units</h2>');
    uhead.appendChild(el('div', 'legend', '<span><i class="lg first"></i>Done first try</span><span><i class="lg help"></i>Done with a hint</span><span><i class="lg extra"></i>Extra practice</span><span><i class="lg empty"></i>Still to do</span>'));
    view.appendChild(uhead);
    var units = el('div', 'home-units'); view.appendChild(units);
    var CD = calData(), LAY = CD && HW.Cal ? HW.Cal.layout(CD.cal, CD.noSchool) : null, TODAY = HW.Cal ? HW.Cal.today() : '';
    /* units fold up: the current unit is open, the rest are closed; what the student opens or closes holds for today */
    var cu = currentUnit(CD, LAY, TODAY), UK = 'hw:units:' + studentKey(), US = null;
    try { US = JSON.parse(ls(UK) || 'null'); } catch (e) { US = null; }
    if (!US || US.day !== TODAY) US = { day: TODAY, open: {} };
    HW.CATALOG.forEach(function (u) {
      var sec = el('section', 'unit' + (u.unit === cu ? ' is-cur' : '')); if (HW.unitStyle) sec.setAttribute('style', HW.unitStyle(u.unit)); // unit colour (as on the class calendar)
      var open = u.unit in US.open ? !!US.open[u.unit] : u.unit === cu;
      var built = u.lessons.filter(function (c) { return HW.lessons[c.id]; });
      // one segment per assignment: full when its required questions are done, half when it's started
      var segs = '', done = 0;
      built.forEach(function (c) { var sm = summary(HW.lessons[c.id]), full = sm.req && sm.reqDone === sm.req; if (full) done++; segs += '<i class="' + (full ? 'full' : sm.reqDone || sm.extraDone ? 'some' : '') + '"></i>'; });
      var prog = built.length ? '<span class="ut-segs" aria-hidden="true">' + segs + '</span><span class="ut-sum">' + done + ' of ' + built.length + ' done</span>'
        : '<span class="ut-sum">' + u.lessons.length + ' lessons · assignments coming soon</span>';
      var uh = el('h2', 'unit-title', '<span class="unit-num"><span class="sr">Unit </span>' + u.unit + '</span>' +
        '<span class="ut-main"><span class="ut-name">' + esc(u.title) + '</span><span class="ut-meta"><span class="unit-out">' + esc(u.outcomes) + '</span>' + (u.unit === cu ? '<span class="ut-cur">Current unit</span>' : '') + '</span></span>' +
        '<span class="ut-prog">' + prog + '</span>' +
        '<svg class="ut-chev" viewBox="0 0 20 20" aria-hidden="true"><path d="M7 4.5 12.5 10 7 15.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
      uh.setAttribute('role', 'button'); uh.tabIndex = 0; uh.setAttribute('aria-expanded', open ? 'true' : 'false');
      uh.title = built.length ? done + ' of ' + built.length + ' assignments done (all required questions)' : '';
      sec.classList.toggle('closed', !open);
      var toggle = function () {
        var o = sec.classList.contains('closed'); sec.classList.toggle('closed', !o); uh.setAttribute('aria-expanded', o ? 'true' : 'false');
        US.open[u.unit] = o; ls(UK, JSON.stringify(US));
      };
      uh.addEventListener('click', toggle); uh.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
      sec.appendChild(uh);
      var body = el('div', 'unit-body'); sec.appendChild(body);
      if (built.length) { var meta = el('div', 'unit-meta'); meta.appendChild(unitLevels(u)); var rc = retestCtl(u); if (rc) meta.appendChild(rc); body.appendChild(meta); }
      if (!u.lessons.length) { sec.classList.add('soon'); body.appendChild(el('div', 'soon-note', 'Coming soon')); units.appendChild(sec); return; }
      var list = el('div', 'lesson-list');
      u.lessons.forEach(function (c) {
        if (c.intro) return; // the course introduction is linked at the bottom of the page (About the course)
        var lesson = HW.lessons[c.id], row = el(lesson ? 'a' : 'div', 'lesson-row' + (lesson ? '' : ' locked'));
        // beside each assignment: a small card that opens the lesson itself (same tab; its home button comes back here),
        // marked Today / Taught / its date from the class calendar (a spacer keeps the rows lined up)
        var line = el('div', 'lesson-line'), turl = teachingUrl(c);
        var when = LAY ? LAY.dateOf[c.id] : null, stt = !when ? '' : when === TODAY ? 'today' : when < TODAY ? 'past' : 'next';
        if (stt === 'today') line.classList.add('is-today');
        if (turl) {
          var tag = stt === 'today' ? 'Today' : stt ? HW.Cal.nice(when, { month: 'short', day: 'numeric' }) : '';
          // taught lessons: a check after the number (the number and check centred together) and the date it was taught
          var ck = stt === 'past' ? '<svg class="lt-ck" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6.4 4.8 9 9.8 3.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '';
          var tc = el('a', 'lesson-teach' + (stt ? ' is-' + stt : ''), '<span class="lt-k">Lesson</span><span class="lt-n">' + esc(c.num) + ck + '</span>' + (tag ? '<span class="lt-s">' + tag + '</span>' : ''));
          tc.href = turl;
          tc.title = 'Open Lesson ' + c.num + ' (examples and class notes)' + (stt === 'today' ? ' — today’s lesson' : stt === 'past' ? ' — taught ' + HW.Cal.nice(when) : stt === 'next' ? ' — on ' + HW.Cal.nice(when) : '');
          tc.setAttribute('aria-label', 'Lesson ' + c.num + ' — ' + stripTags(c.title) + (stt === 'past' ? ' (taught ' + tag + ')' : tag ? ' (' + tag + ')' : ''));
          tc.addEventListener('click', function () { L.push({ t: 'event', type: 'notes', lesson: c.id }); });
          line.appendChild(tc);
        } else line.appendChild(el('div', 'lesson-teach none', ''));
        line.appendChild(row);
        var info = el('div', 'lr-info', '<div class="lr-num">Assignment ' + esc(c.num) + '</div><div class="lr-title">' + HW.tex(esc(c.title)) + '</div>');
        row.appendChild(info);
        if (lesson) {
          row.href = '#/lesson/' + lesson.id;
          var s = summary(lesson), right = el('div', 'lr-progress'), g = goLabel(s);
          row.classList.add(g === 'Review' ? 'st-done' : g === 'Continue' ? 'st-going' : 'st-new');
          right.appendChild(bar(lesson));
          right.appendChild(el('div', 'lr-counts', '<b>' + s.reqDone + '</b>/' + s.req + ' required' + (s.extra ? ' · <b>' + s.extraDone + '</b>/' + s.extra + ' extra' : '') + (s.secs ? ' · ' + mins(s.secs) : '')));
          row.appendChild(right);
          row.appendChild(el('span', 'lr-go', (g === 'Review' ? '<span aria-hidden="true">✓ </span>' : '') + g));
        } else row.appendChild(el('span', 'lr-soon', 'Coming soon'));
        list.appendChild(line);
      });
      body.appendChild(list); units.appendChild(sec);
    });
    // the course introduction (day one): how the course works, for anyone who missed it or wants to look again
    var intro = null; HW.CATALOG.some(function (u) { return u.lessons.some(function (c) { if (c.intro) { intro = c; return true; } }); });
    var iurl = intro ? teachingUrl(intro) : '', foot = el('div', 'home-about');
    if (iurl) {
      var ab = el('a', 'btn home-about-btn', 'About the course'); ab.href = iurl; ab.title = 'How Math 10C works: the class website, how you’re assessed, calculators, retests and more';
      ab.addEventListener('click', function () { L.push({ t: 'event', type: 'notes', lesson: intro.id }); });
      foot.appendChild(ab);
    }
    // email the teacher: opens the student's mail app with a subject that says who it's from
    var em = el('a', 'btn home-about-btn', 'Email the Teacher');
    em.href = 'mailto:' + TEACHER_EMAIL + '?subject=' + encodeURIComponent('Math 10C' + (session && session.name ? ' question from ' + session.name : ' question'));
    em.title = 'Email Mr. Cathcart (' + TEACHER_EMAIL + ')';
    foot.appendChild(em); view.appendChild(foot);
    L.setStatus({ view: 'home' }, false);
  }
  /* ---------------- outcome medals (js/medals.js) ----------------
   * One medal per outcome beside "Hi, …", at the student's best level: the higher of their practice level (the hardest
   * question right on the first try or after a hint, as in "Your level") and their level on released tests and exit slips.
   * A medal that's new or higher since this device last showed them opens big, once. */
  function practiceTiers() {
    var best = {};
    Object.keys(HW.lessons).forEach(function (lid) {
      var lesson = HW.lessons[lid]; if (lesson.test) return;
      var items = (S.lessons[lid] || { items: {} }).items;
      lesson.items.forEach(function (it) {
        var r = items[it.id]; if (!r || r.s !== 'done' || (r.credit !== 'first' && r.credit !== 'hint') || it.outcome === 'EXT') return;
        var t = HW.Medals.tierOf(it.level); if (best[it.outcome] == null || t > best[it.outcome].tier) best[it.outcome] = { tier: t, src: 'from practice' };
      });
    });
    return best;
  }
  function medalList(results) {
    var best = practiceTiers(), TC = HW.TestCore;
    (results || []).forEach(function (r) {
      if (!r.marks || !r.def || !TC) return;
      var got = {};
      try {
        if (r.kind === 'exit') { var lv = TC.summary(r.def, r.marks).levels || {}; Object.keys(lv).forEach(function (o) { if (lv[o]) got[o] = lv[o]; }); }
        else TC.outcomeGrades(r.def, r.marks).outcomes.forEach(function (x) { got[x.outcome] = x.ind; });
      } catch (e) { return; }
      Object.keys(got).forEach(function (o) {
        var t = HW.Medals.tierOf(got[o]); if (o === 'EXT' || t < 0) return;
        if (!best[o] || t > best[o].tier) best[o] = { tier: t, src: 'from ' + (r.title || (r.kind === 'exit' ? 'an exit slip' : 'a test')) };
      });
    });
    var order = [], started = startedUnits();
    HW.CATALOG.forEach(function (u) {
      String(u.outcomes || '').split(/\s*·\s*/).forEach(function (o) {
        if (!o) return; if (order.indexOf(o) < 0) order.push(o);
        // a unit that has started: its outcomes begin at Rust until practice (or a test) gives a level
        if (started[u.unit] && !best[o]) best[o] = { tier: 0, src: 'Unit ' + u.unit + ' has started: practise to move up' };
      });
    });
    Object.keys(best).forEach(function (o) { if (order.indexOf(o) < 0) order.push(o); });
    return order.filter(function (o) { return best[o]; }).map(function (o) { return { o: o, tier: best[o].tier, src: best[o].src }; });
  }
  /* the units the class has started: by the class calendar (a lesson or test of the unit on or before today), else every
     unit up to the one the student is on */
  function startedUnits() {
    var out = {}, CD = calData(), LAY = CD && HW.Cal ? HW.Cal.layout(CD.cal, CD.noSchool) : null, TODAY = HW.Cal ? HW.Cal.today() : '';
    if (CD && LAY) { CD.cal.items.forEach(function (x) { var d = LAY.dateOf[x[0]], i = d && d <= TODAY ? HW.Cal.info(x[0]) : null; if (i && i.unit) out[i.unit] = 1; }); return out; }
    for (var u = 1, cu = currentUnit(null, null, TODAY); u <= cu; u++) out[u] = 1;
    return out;
  }
  /* lots of medals: a little smaller, and on their own line under "Hi, …" in even rows (9 + 9, never 17 + 1) */
  function fitMedals(box) {
    var row = box.firstChild, nm = box.parentNode; box.classList.remove('stacked'); box.style.removeProperty('--medal');
    if (!row || !nm || !nm.clientWidth) return; row.style.maxWidth = '';
    var n = row.children.length, size = n > 12 ? 40 : n > 8 ? 44 : 50, cell = size + 6, W = nm.clientWidth, h1 = nm.querySelector('h1');
    box.style.setProperty('--medal', size + 'px');
    var c0 = row.querySelector('canvas'); if (c0 && c0.offsetWidth) { size = c0.offsetWidth; cell = size + 6; }   // phones cap them smaller
    if (n * cell - 2 <= W - (h1 ? h1.offsetWidth + 16 : 0)) return;   // they fit beside the name in one line
    box.classList.add('stacked');
    var per = Math.max(1, Math.floor((W + 2) / cell)), rows = Math.ceil(n / per);
    if (rows > 1) row.style.maxWidth = (Math.ceil(n / rows) * cell - 2) + 'px';
  }
  function homeMedals(box) {
    if (!HW.Medals) return;
    var key = 'hw:medals:' + studentKey(), sig = '';
    function draw(list) {
      var s2 = JSON.stringify(list.map(function (x) { return [x.o, x.tier]; })); if (s2 === sig) return; sig = s2;
      box.innerHTML = ''; if (list.length) box.appendChild(HW.Medals.row(list));
      fitMedals(box);
    }
    if (window.ResizeObserver) new ResizeObserver(function () { fitMedals(box); }).observe(box.parentNode);
    draw(medalList([]));
    var res = HW.TestMode && HW.TestMode.loadResults ? HW.TestMode.loadResults() : Promise.resolve([]);
    res.then(function (r) { return r || []; }, function () { return []; }).then(function (results) {
      if (!box.isConnected) return;
      var list = medalList(results); draw(list);
      // new or higher since last time on this device: show them big (the first time, just remember what there is)
      var seen = null; try { seen = JSON.parse(ls(key) || 'null'); } catch (e) { seen = null; }
      var now = {}; list.forEach(function (x) { now[x.o] = x.tier; });
      var fresh = seen ? list.filter(function (x) { return x.tier > 0 && (seen[x.o] == null || x.tier > seen[x.o]); }) : [];   // Rust doesn't pop up
      if (!fresh.length) { ls(key, JSON.stringify(now)); return; }
      if (document.querySelector('#testmode, .medal-pop, #cal-pop')) return;   // not over a test or another pop-up; next time
      ls(key, JSON.stringify(now));
      box.querySelectorAll('.medal-btn').forEach(function (b, i) { if (fresh.some(function (f) { return f.o === list[i].o; })) b.classList.add('is-new'); });
      HW.Medals.open(fresh, 0, { title: fresh.length > 1 ? 'New medals!' : 'New medal!' });
    });
  }

  /* ---------------- retests ----------------
   * A unit's retest unlocks when every required question in it is done without seeing the solution (one whose
   * solution was shown counts once a new version is done without it: r.redo) — and, once the student has written a
   * retest for that unit, every extra practice question is done too. The request goes to the Teacher Ledger's Retests
   * tab; the teacher launches the retest, and it pops up like any test (testmode.js). */
  var RT = null, rtAt = 0, rtBusy = false; // my requests from the ledger (null = not loaded yet)
  function loadRetests(force) {
    if (!L.enabled || !session || !session.token || rtBusy) return;
    if (!force && RT && Date.now() - rtAt < 60000) return;
    rtBusy = true;
    L.get('myretests', { 'class': session.klass, name: session.name, token: session.token }, 15000).then(function (d) {
      rtBusy = false; if (!d || !d.ok) return;
      var was = JSON.stringify(RT); RT = d.retests || []; rtAt = Date.now();
      if (was !== JSON.stringify(RT) && !cur.lesson && document.body.className === 'home') { var y = scrollY; renderHome(); scrollTo(0, y); }
    }).catch(function () { rtBusy = false; });
  }
  function retestNeed(u) {
    var n = { req: 0, reqLeft: 0, redo: 0, extra: 0, extraLeft: 0, first: null };
    u.lessons.forEach(function (c) {
      var lesson = HW.lessons[c.id]; if (!lesson || lesson.test) return;
      var items = (S.lessons[lesson.id] || { items: {} }).items;
      lesson.items.forEach(function (it) {
        var r = items[it.id], done = r && r.s === 'done';
        if (it.extra) { n.extra++; if (!done) n.extraLeft++; return; }
        n.req++;
        if (!done) { n.reqLeft++; if (!n.first) n.first = [lesson.id, it.id]; }
        else if (r.credit === 'shown' && !r.redo) { n.redo++; if (!n.first) n.first = [lesson.id, it.id]; }
      });
    });
    return n;
  }
  function retestCtl(u) {
    if (!L.enabled || !session || !session.token || !RT) return null;
    var mine = RT.filter(function (x) { return x.unit === u.unit; }), n = retestNeed(u);
    var active = mine.filter(function (x) { return x.status === 'requested' || x.status === 'open'; })[0];
    var written = mine.filter(function (x) { return x.status === 'done'; }).length;
    var box = el('div', 'retest');
    if (active && active.status === 'open') { box.classList.add('rt-open'); box.innerHTML = '<span class="rt-ic" aria-hidden="true">📝</span><span><b>Your retest is open.</b> It pops up on your screen.</span>'; return box; }
    if (active) {
      box.classList.add('rt-asked');
      box.innerHTML = '<span class="rt-ic" aria-hidden="true">✓</span><span><b>Retest requested</b> <span class="muted">· ' + esc(new Date(active.requested).toLocaleDateString([], { month: 'short', day: 'numeric' })) + '</span></span>';
      var cx = el('button', 'btn btn-ghost btn-small rt-cancel', 'Cancel'); cx.type = 'button';
      cx.addEventListener('click', function () { if (confirm('Cancel your retest request for Unit ' + u.unit + '?')) askRetest(u, true, cx); });
      box.appendChild(cx); return box;
    }
    var left = n.reqLeft + n.redo + (written ? n.extraLeft : 0);
    if (!left) {
      var b = el('button', 'btn btn-primary btn-small rt-ask', written ? 'Request another retest' : 'Request retest'); b.type = 'button';
      b.title = 'All the ' + (written ? 'practice' : 'required practice') + ' for Unit ' + u.unit + ' is done. Ask for a retest.';
      b.addEventListener('click', function () { askRetest(u, false, b, n); });
      box.appendChild(b); return box;
    }
    // locked: say what's left, and jump to the first question that still needs doing
    box.classList.add('rt-locked');
    var bits = [];
    if (n.reqLeft) bits.push(n.reqLeft + ' required question' + (n.reqLeft === 1 ? '' : 's') + ' left');
    if (n.redo) bits.push(n.redo + ' to redo without the solution');
    if (written && n.extraLeft) bits.push(n.extraLeft + ' extra practice left');
    var go = el('button', 'btn btn-ghost btn-small rt-locked-btn', '<span class="rt-ic" aria-hidden="true">🔒</span> ' + (written ? 'Another retest' : 'Retest') + ': ' + esc(bits.join(' · '))); go.type = 'button';
    go.title = written ? 'You’ve written a retest for this unit. To ask for another, finish every question in the unit, including the extra practice.' : 'Finish all the required practice for this unit, without seeing solutions, to unlock a retest.';
    var first = n.first;
    if (!first && written) u.lessons.some(function (c) { var lesson = HW.lessons[c.id]; if (!lesson || lesson.test) return false; var items = (S.lessons[lesson.id] || { items: {} }).items; return lesson.items.some(function (it) { var r = items[it.id]; if (it.extra && !(r && r.s === 'done')) { first = [lesson.id, it.id]; return true; } return false; }); });
    if (first) go.addEventListener('click', function () { location.hash = '#/lesson/' + first[0] + '/' + first[1]; });
    box.appendChild(go); return box;
  }
  function askRetest(u, cancel, btn, n) {
    btn.disabled = true; var t0 = btn.textContent; btn.textContent = cancel ? 'Cancelling…' : 'Sending…';
    var p = { 'class': session.klass, name: session.name, token: session.token, unit: u.unit };
    if (cancel) p.cancel = 1; else if (n) p.info = 'required ' + n.req + '/' + n.req + ', extra ' + (n.extra - n.extraLeft) + '/' + n.extra;
    L.get('reqretest', p, 15000).then(function (d) {
      if (!d || !d.ok) { btn.disabled = false; btn.textContent = t0; alert('That didn’t go through. Check your connection and try again.'); return; }
      RT = d.retests || RT; rtAt = Date.now(); var y = scrollY; renderHome(); scrollTo(0, y);
    }, function () { btn.disabled = false; btn.textContent = t0; alert('That didn’t go through. Check your connection and try again.'); });
  }

  /* ---------------- class calendar ----------------
   * The teacher plans it in the ledger (Calendar tab); here it's read-only. "All lessons" has a Lessons / Calendar
   * toggle and says when the next unit test is. The calendar is kept on the device too, so it shows straight away. */
  var CAL = null; // { cal, noSchool } for this class
  function calKey() { return 'hw:cal:' + String(session && session.klass || '').toLowerCase(); }
  function calData() { if (!CAL) { try { CAL = JSON.parse(ls(calKey()) || 'null'); } catch (e) { CAL = null; } } return CAL && CAL.cal ? CAL : null; }
  function loadCal() {
    if (!L.enabled || !session || !session.klass || !HW.Cal) return;
    L.get('cal', { 'class': session.klass }, 15000).then(function (d) {
      if (!d || !d.ok) return;
      var next = { cal: d.cal ? HW.Cal.clean(d.cal) : null, noSchool: d.noSchool || [] }, was = JSON.stringify(CAL);
      CAL = next; ls(calKey(), JSON.stringify(next));
      var h = location.hash.replace(/^#\/?/, '').split('/')[0];
      if (was !== JSON.stringify(next) && !cur.lesson && document.body.className === 'home' && (h === '' || h === 'calendar')) { var pop = !!document.getElementById('cal-pop'), y = scrollY; renderHome(); scrollTo(0, y); if (pop) openCalendar(); } // redraw: the next test, and Today / Taught on the lesson cards
    }).catch(function () {});
  }
  /* beside "Hi, …" on the home page: "📝 Next test: Unit 4 Test · Wed, Oct 21" and a Calendar button (opens a pop-up) */
  function homeCalendar(right) {
    right.innerHTML = '';
    var C = HW.Cal, D = calData(); if (!C || !D) return;
    var nt = C.nextTest(D.cal, D.noSchool, C.today());
    if (nt) {
      var when = nt.date === C.today() ? 'today' : C.nice(nt.date) + (nt.inDays === 1 ? ' · next class' : nt.inDays > 1 ? ' · in ' + nt.inDays + ' classes' : '');
      var n = el('button', 'next-test hh-test' + (nt.inDays <= 2 ? ' soon' : ''), '📝 <span class="tt-l">Next test: </span><b>' + esc(nt.info.title) + '</b><span class="tt-w"> · ' + esc(when) + '</span>');
      n.type = 'button'; n.title = 'Next test: ' + nt.info.title + ', ' + C.nice(nt.date, { weekday: 'long', month: 'long', day: 'numeric' }) + ' — open the class calendar';
      n.addEventListener('click', function () { openCalendar(nt.date); });
      right.appendChild(n);
    }
    var b = el('button', 'btn hh-calbtn', '<span aria-hidden="true">📅</span><span class="tc-l">Class calendar</span>'); b.type = 'button'; b.title = 'Class calendar';
    b.addEventListener('click', function () { openCalendar(); });
    right.appendChild(b);
  }
  function calChip(key) {
    var C = HW.Cal, i = C.info(key), lesson = HW.lessons[key];
    if (i.kind === 'test') return el('div', 'calm-chip test', '<b>' + esc(i.title) + '</b><span class="ct">' + esc(i.unitTitle) + '</span>');
    var turl = teachingUrl({ id: key }), a = el(lesson && !lesson.test ? 'a' : turl ? 'a' : 'div', 'calm-chip');
    a.innerHTML = (turl && lesson ? '<span class="clk" title="Open the lesson">Lesson</span>' : '') + '<b>U' + i.unit + ' · ' + (lesson ? 'Assignment ' : 'Lesson ') + esc(i.num) + '</b><span class="ct">' + HW.tex(esc(i.title)) + '</span>';
    if (lesson && !lesson.test) { a.href = '#/lesson/' + key; a.title = 'Assignment ' + i.num + ' — ' + stripTags(i.title); }
    else if (turl) { a.href = turl; a.title = 'Open Lesson ' + i.num; }
    var lk = a.querySelector('.clk'); if (lk) lk.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); closeCalendar(); location.href = turl; });
    return a;
  }
  /* the class calendar in a pop-up: months scroll; it opens on this week (or on a date, e.g. the next test) */
  function openCalendar(date) {
    var C = HW.Cal, D = calData(); if (!C) return;
    closeCalendar();
    var ov = el('div', 'cal-pop'); ov.id = 'cal-pop'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    var box = el('div', 'cal-pop-box'); ov.appendChild(box);
    var head = el('div', 'cal-pop-h', '<h2>Class calendar</h2>');
    var x = el('button', 'btn btn-ghost cal-pop-x', '×'); x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.addEventListener('click', closeCalendar); head.appendChild(x);
    box.appendChild(head);
    if (!D) { box.appendChild(el('p', 'muted', 'Your teacher hasn’t put up the class calendar yet.')); }
    else {
      var today = C.today(), on = C.on(D.cal, D.noSchool, today), nt = C.nextTest(D.cal, D.noSchool, today), info = [];
      C.eventsOn(D.cal, today).forEach(function (e) { info.push('Today: <b>' + esc(e.title) + '</b>'); });
      if (on.length) info.push('Today: ' + on.map(function (k) { var i = C.info(k); return '<b>' + esc(i.kind === 'test' ? i.title : 'Lesson ' + i.num + ' — ' + stripTags(i.title)) + '</b>'; }).join(' and '));
      if (nt) info.push('Next test: <b>' + esc(nt.info.title) + '</b>, ' + esc(C.nice(nt.date, { weekday: 'long', month: 'long', day: 'numeric' })));
      if (info.length) box.appendChild(el('p', 'cal-today', info.join(' · ')));
      var v = C.view(D.cal, { off: D.noSchool, today: today, chip: calChip }); box.appendChild(v);
      box.appendChild(el('p', 'small muted cal-pop-foot', 'Scroll for other months. Tap a day’s box to open its assignment, or “Lesson” to open the lesson itself. Dates can change as the class goes — this always shows the latest plan.'));
      v.querySelectorAll('a.calm-chip').forEach(function (a) { if (/^#\/lesson\//.test(a.getAttribute('href') || '')) a.addEventListener('click', closeCalendar); });
      requestAnimationFrame(function () { v.scrollToDate(date || today); if (date) setTimeout(function () { v.flashDate(date); }, 200); });
    }
    ov.addEventListener('click', function (e) { if (e.target === ov) closeCalendar(); });
    document.addEventListener('keydown', calKeys);
    document.body.appendChild(ov);
    if (location.hash.indexOf('#/calendar') === 0) history.replaceState(null, '', '#/');
    loadCal();
  }
  function closeCalendar() { var o = document.getElementById('cal-pop'); if (o) o.remove(); document.removeEventListener('keydown', calKeys); }
  function calKeys(e) { if (e.key === 'Escape') closeCalendar(); }
  /* the unit the class is on: from the class calendar (the next lesson or test from today), else the unit of the last
     assignment the student worked on, else Unit 1 */
  function currentUnit(CD, LAY, TODAY) {
    if (CD && LAY) {
      var next = CD.cal.items.filter(function (x) { var d = LAY.dateOf[x[0]]; return d && d >= TODAY; })[0] || CD.cal.items[CD.cal.items.length - 1];
      var i = next && HW.Cal.info(next[0]); if (i) return i.unit;
    }
    var last = lastLesson(); if (last && HW.lessons[last]) return HW.lessons[last].unit;
    return 1;
  }
  function lastLesson() { var best = null; Object.keys(S.lessons).forEach(function (k) { if (!best || (S.lessons[k].updated || 0) > (S.lessons[best].updated || 0)) best = k; }); return best; }
  function mins(s) { if (s < 60) return '<1 min'; var m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' min'; }

  /* ---------------- lesson ---------------- */
  function leaveLesson() { if (cur.lesson) { saveState(); pushProgress(cur.lesson.id); } cur = { lesson: null, item: null, inst: null, widget: null, practice: false, notice: null }; }
  /* the matching lesson page on the Math 10C Teaching site, opened with the student's class (block) so they see that
     class's notes: the block set for the class in the teacher dashboard, else a letter at the end of the class code */
  function studentBlock() {
    if (!session) return '';
    if (session.block) return String(session.block).toUpperCase();
    var m = /(?:^|[^a-z0-9])([a-d])$/i.exec(session.klass || '') || /block\s*([a-d])\b/i.exec(session.label || '');
    return m ? m[1].toUpperCase() : '';
  }
  var TEACHER_EMAIL = 'rcathcart@rvschools.ab.ca';
  function teachingUrl(lesson) {
    var T = HW.TEACHING; if (!T || T.lessons.indexOf(lesson.id) < 0) return '';
    var m = /^u(\d+)l(\w+)$/.exec(lesson.id), b = studentBlock();
    return T.base + 'u' + m[1] + '/l' + m[2] + '/' + (b ? '?class=' + b : '');
  }
  function openLesson(lesson, itemId) {
    var switching = !cur.lesson || cur.lesson.id !== lesson.id;
    if (switching) leaveLesson();
    cur.lesson = lesson;
    document.body.className = 'lesson';
    var l = LS(lesson.id);
    var id = itemId && lesson.byId[itemId] ? itemId : (l.cur && lesson.byId[l.cur] ? l.cur : firstOpen(lesson));
    if (!itemId) { history.replaceState(null, '', '#/lesson/' + lesson.id + '/' + id); }
    showItem(id, switching);
  }
  function firstOpen(lesson) { var l = LS(lesson.id); for (var i = 0; i < lesson.required.length; i++) { var r = l.items[lesson.required[i].id]; if (!r || r.s !== 'done') return lesson.required[i].id; } return lesson.items[0].id; }
  function nextOpen(lesson, fromId) {
    var l = LS(lesson.id), idx = lesson.items.findIndex(function (it) { return it.id === fromId; });
    for (var i = idx + 1; i < lesson.items.length; i++) { var it = lesson.items[i]; var r = l.items[it.id]; if ((!r || r.s !== 'done') && it.extra === lesson.byId[fromId].extra) return it.id; }
    for (i = 0; i < lesson.items.length; i++) { it = lesson.items[i]; r = l.items[it.id]; if ((!r || r.s !== 'done') && !it.extra) return it.id; }
    return lesson.items[Math.min(idx + 1, lesson.items.length - 1)].id;
  }
  function showItem(id, fresh) {
    var lesson = cur.lesson, it = lesson.byId[id], l = LS(lesson.id), r = IR(lesson.id, id);
    cur.item = id; cur.practice = false; l.cur = id;
    if (r.s === 'new') { r.s = 'open'; r.at = Date.now(); L.push({ t: 'event', type: 'open', lesson: lesson.id, item: id }); }
    touch(lesson.id);
    drawTop('<a href="#/">Assignments</a><span class="sep">/</span>Unit ' + lesson.unit + ' · Assignment ' + esc(lesson.num));
    if (fresh || !document.querySelector('.lesson-wrap')) buildLessonFrame(lesson);
    drawNav(); drawHeaderBar();
    drawCard();
    L.setStatus({ view: 'lesson', lesson: lesson.id, item: id, label: it.label, away: false }, true);
    var a = document.querySelector('.qnav .qi.on'); if (a && a.scrollIntoView) { try { a.scrollIntoView({ block: 'nearest' }); } catch (e) {} }
  }
  function buildLessonFrame(lesson) {
    view.innerHTML = '';
    var wrap = el('div', 'lesson-wrap');
    var head = el('div', 'lesson-head');
    head.innerHTML = '<div class="lh-eyebrow">Unit ' + lesson.unit + ' · Lesson ' + esc(lesson.num) + ' · ' + esc(lesson.outcome) + '</div><h1>' + HW.tex(esc(lesson.title)) + '</h1>';
    var hb = el('div', 'lh-bar'); head.appendChild(hb);
    wrap.appendChild(head);
    var body = el('div', 'lesson-body');
    var nav = el('nav', 'qnav'); nav.setAttribute('aria-label', 'Questions');
    var main = el('div', 'qmain');
    body.appendChild(nav); body.appendChild(main); wrap.appendChild(body);
    view.appendChild(wrap);
  }
  function drawHeaderBar() {
    var hb = document.querySelector('.lh-bar'); if (!hb) return; hb.innerHTML = '';
    var s = summary(cur.lesson); hb.appendChild(bar(cur.lesson, true));
    hb.appendChild(el('div', 'lh-counts', '<b>' + s.reqDone + '</b> of ' + s.req + ' required · <b>' + s.extraDone + '</b> of ' + s.extra + ' extra practice'));
  }
  function drawNav() {
    var nav = document.querySelector('.qnav'); if (!nav) return; nav.innerHTML = '';
    var lesson = cur.lesson, l = LS(lesson.id), groups = [], lastQ = null;
    lesson.items.forEach(function (it) {
      if (it.q !== lastQ) { groups.push({ q: it.q, extra: it.extra, items: [] }); lastQ = it.q; }
      groups[groups.length - 1].items.push(it);
    });
    var extraHead = false, turl = teachingUrl(lesson);
    if (turl) {
      var tb = el('a', 'teach-link', '<span class="tl-t"><b>Go to Lesson ' + esc(lesson.num) + '</b><span>Examples and class notes</span></span><span class="tl-go" aria-hidden="true">›</span>');
      tb.href = turl;
      tb.title = 'Opens Lesson ' + lesson.num + (studentBlock() ? ' (Block ' + studentBlock() + ' notes)' : '') + '; its home button brings you back';
      tb.addEventListener('click', function () {
        // the lesson opens in this tab: a question that was open gets new numbers, as if the student had left the page
        viaNotes = Date.now(); if (working()) { var it0 = cur.lesson.byId[cur.item]; if (cur.practice) IR(cur.lesson.id, it0.id).prac++; else newVersion(cur.lesson, it0, 'notes'); touch(cur.lesson.id); saveState(); }
        L.push({ t: 'event', type: 'notes', lesson: lesson.id, item: cur.item }); L.flush(true);
      });
      nav.appendChild(tb);
    }
    nav.appendChild(el('div', 'qnav-title', 'Assignment'));
    groups.forEach(function (g) {
      if (g.extra && !extraHead) { extraHead = true; nav.appendChild(el('div', 'qnav-title extra', 'Extra practice <span>optional</span>')); }
      var row = el('div', 'qrow');
      row.appendChild(el('span', 'qn', (g.extra ? 'E' : '') + esc(g.q.num)));
      var pills = el('div', 'qpills');
      g.items.forEach(function (it) {
        var r = l.items[it.id], st = r ? r.s : 'new';
        var b = el('a', 'qi st-' + st + (r && r.s === 'done' ? ' cr-' + r.credit : '') + (it.id === cur.item ? ' on' : ''), g.items.length > 1 ? (it.p.sub || it.label.replace(/^.*\(|\)$/g, '')) : '•');
        b.href = '#/lesson/' + lesson.id + '/' + it.id; b.title = it.label + ' — ' + ({ 'new': 'not started', open: 'in progress', shown: 'answer shown — try a new version', done: r && r.credit === 'first' ? 'done (first try)' : 'done' }[st]);
        pills.appendChild(b);
      });
      row.appendChild(pills); nav.appendChild(row);
    });
  }

  function drawCard() {
    var main = document.querySelector('.qmain'); if (!main) return;
    var lesson = cur.lesson, it = lesson.byId[cur.item], r = IR(lesson.id, it.id);
    var inst = cur.inst = instanceFor(lesson, it, cur.practice);
    main.innerHTML = '';
    var card = el('article', 'qcard');
    card.appendChild(el('div', 'qsection', esc(it.q.sectionLabel || (it.extra ? 'Extra practice' : ''))));
    var h = el('div', 'qhead');
    h.appendChild(el('h2', '', (it.extra ? 'Extra ' : 'Question ') + esc(it.q.num) + (it.q.parts.length > 1 ? ' <span class="qpart">(' + esc(it.label.replace(/^.*\(|\)$/g, '')) + ')</span>' : '')));
    h.appendChild(el('span', 'lvl lvl-' + it.level, HW.LEVEL_NAMES[it.level]));
    card.appendChild(h);
    if (cur.notice) { card.appendChild(el('div', 'notice warn', cur.notice)); cur.notice = null; }
    if (inst.stem) card.appendChild(el('div', 'qstem', HW.tex(inst.stem)));
    card.appendChild(el('div', 'qprompt', (it.q.parts.length > 1 && !/^[A-Z]/.test(stripTags(inst.prompt)) && stripTags(inst.prompt).trim().indexOf('(' + it.label.replace(/^.*\(|\)$/g, '') + ')') !== 0 ? '<span class="qlabel">(' + esc(it.label.replace(/^.*\(|\)$/g, '')) + ')</span> ' : '') + HW.tex(inst.prompt)));
    var fb = el('div', 'feedback'); fb.setAttribute('aria-live', 'polite');
    var done = r.s === 'done' && !cur.practice, shown = r.s === 'shown' && !cur.practice;

    if (done) {
      card.appendChild(el('div', 'answered', '<div class="ans-label">Your answer</div><div class="ans-val">' + (r.ansHtml || '—') + '</div>'));
      fb.className = 'feedback good';
      var needRedo = r.credit === 'shown' && !r.redo && !it.extra;
      fb.innerHTML = '<div class="fb-title">' + (r.credit === 'first' ? '✓ Correct on the first try' : r.credit === 'shown' ? (r.redo ? '✓ Correct (redone without the solution)' : '✓ Correct (after the answer was shown)') : '✓ Correct') + '</div>';
      card.appendChild(fb);
      if (needRedo) card.appendChild(el('div', 'notice redo-note', 'You saw the solution for this one. Do one new version <b>without</b> seeing the solution and it counts toward a unit retest.'));
      card.appendChild(solutionBlock(inst, false));
      var acts = el('div', 'qactions');
      var again = el('button', 'btn ' + (needRedo ? 'btn-primary' : 'btn-ghost'), needRedo ? 'Redo it without the solution' : 'Try another one like this'); again.type = 'button';
      again.addEventListener('click', function () { r.prac = (r.prac || 0) + 1; cur.practice = true; touch(lesson.id); drawCard(); });
      acts.appendChild(again); acts.appendChild(nextBtn(it)); card.appendChild(acts);
      main.appendChild(card); return;
    }
    if (shown) {
      fb.className = 'feedback shown';
      fb.innerHTML = '<div class="fb-title">Here’s the answer</div><div class="fb-ans">' + HW.tex(inst.answer) + '</div>';
      card.appendChild(fb);
      card.appendChild(solutionBlock(inst, true));
      var acts2 = el('div', 'qactions');
      var nv = el('button', 'btn btn-primary', 'Try a new version'); nv.type = 'button';
      nv.addEventListener('click', function () { newVersion(lesson, it, 'after-reveal'); r.s = 'open'; r.tv = 0; touch(lesson.id); L.push({ t: 'event', type: 'newversion', lesson: lesson.id, item: it.id }); drawNav(); drawCard(); });
      acts2.appendChild(nv); acts2.appendChild(nextBtn(it, true)); card.appendChild(acts2);
      card.appendChild(el('p', 'small muted', 'Study the solution, then try a new version with different numbers to finish this question.'));
      main.appendChild(card); return;
    }

    var w = cur.widget = makeWidget(inst, fb);
    card.appendChild(el('div', 'qinput')).appendChild(w.node);
    var acts3 = el('div', 'qactions');
    var check = el('button', 'btn btn-primary btn-check', 'Check'); check.type = 'button';
    check.addEventListener('click', onCheck); w.onEnter(onCheck);
    acts3.appendChild(check);
    var tries = el('span', 'tries'); acts3.appendChild(tries); drawTries(tries, inst, cur.practice ? (cur.ptv || 0) : r.tv);
    acts3.appendChild(el('span', 'spacer'));
    acts3.appendChild(nextBtn(it, true));
    card.appendChild(acts3);
    card.appendChild(fb);
    if (cur.practice) card.appendChild(el('p', 'small muted', 'Practice version — this question is already done, so this one is just for practice.'));
    main.appendChild(card);
    setTimeout(function () { try { w.focus(); } catch (e) {} }, 60);
  }
  function stripTags(s) { return String(s).replace(/<[^>]+>/g, '').replace(/\\\(|\\\)/g, '').trim(); }
  function nextBtn(it, ghost) {
    var b = el('button', 'btn ' + (ghost ? 'btn-ghost' : 'btn-primary') + ' btn-next', 'Next →'); b.type = 'button';
    b.addEventListener('click', function () { location.hash = '#/lesson/' + cur.lesson.id + '/' + nextOpen(cur.lesson, it.id); });
    return b;
  }
  function drawTries(node, inst, used) { var n = inst.tries, out = ''; for (var i = 0; i < n; i++) out += '<i class="' + (i < n - used ? 'left' : 'used') + '"></i>'; node.innerHTML = out; node.title = (n - used) + ' of ' + n + ' tries left before the answer is shown'; }
  function solutionBlock(inst, open) {
    var d = el('details', 'solution'); if (open) d.open = true;
    d.innerHTML = '<summary>Worked solution</summary><div class="sol-body">' + HW.tex(inst.solution) + '</div>';
    return d;
  }
  function makeWidget(inst, fb) {
    var I = inst.input, W = HW.widgets;
    switch (I.type) {
      case 'number': return W.number({ nr: I.nr, before: I.before, after: I.after });
      case 'list': return W.list({});
      case 'math': return W.math({ before: I.before, after: I.after, keys: I.keys, vars: I.vars, pi: I.pi, placeholder: I.placeholder });
      case 'mc': return W.mc({ options: I.options, columns: I.columns });
      case 'select': return W.select({ options: I.options });
      case 'classify': return W.classify({ n: I.n });
      case 'pairs': return W.pairs({ start: I.start });
      case 'ladder': return W.ladder({ n: I.n, exponent: I.exponent, onStep: function (s) { onStep(s, fb); } });
      case 'tree': return W.tree({ n: I.n, exponent: I.exponent, onStep: function (s) { onStep(s, fb); } });
    }
    if (W[I.type]) return W[I.type](I);
    throw new Error('unknown input ' + I.type);
  }
  function onStep(s, fb) {
    var lesson = cur.lesson, it = lesson.byId[cur.item], r = IR(lesson.id, it.id);
    if (s.ok) { fb.className = 'feedback'; fb.innerHTML = ''; return; }
    if (!s.form && !cur.practice) { r.steps = (r.steps || 0) + 1; touch(lesson.id); }
    showFb(fb, s.form ? 'form' : 'hint', s.form ? '' : (s.shown ? 'Step shown' : 'Not quite'), s.hint);
    logAttempt(it, s.form ? 'form' : 'step', s.code, '', null);
  }
  function showFb(fb, kind, title, body) {
    fb.className = 'feedback ' + kind;
    fb.innerHTML = (title ? '<div class="fb-title">' + title + '</div>' : '') + (body ? '<div class="fb-body">' + HW.tex(body) + '</div>' : '');
  }
  var answerText = HW.answerText, answerHtml = HW.answerHtml; // js/answers.js (shared with the Teacher Ledger)
  function logAttempt(it, verdict, code, answer, tryNo) {
    var lesson = cur.lesson;
    L.push({ t: 'attempt', lesson: lesson.id, item: it.id, label: it.label, outcome: it.outcome, level: it.level, extra: it.extra ? 1 : 0, practice: cur.practice ? 1 : 0,
      ver: IR(lesson.id, it.id).v, verdict: verdict, code: code || '', answer: String(answer || '').slice(0, 200), tryNo: tryNo || 0, prompt: cur.inst ? cur.inst.text || stripTags(cur.inst.prompt).slice(0, 160) : '' }, verdict === 'correct' || verdict === 'reveal');
  }
  function onCheck() {
    var lesson = cur.lesson, it = lesson.byId[cur.item], r = IR(lesson.id, it.id), inst = cur.inst, w = cur.widget;
    var fb = document.querySelector('.qcard .feedback'); if (!w || !fb) return;
    lastInteract = Date.now();
    if (w.structured && !w.ready()) { showFb(fb, 'form', '', inst.input.type === 'tree' ? 'Finish the factor tree first: every branch must end in a circled prime.' : 'Finish the ladder first: keep dividing until the quotient is \\(1\\).'); return; }
    var resp = w.value(), res;
    try { res = inst.check(resp); } catch (e) { res = { v: 'form', hint: 'I couldn’t read that answer. Check the format and try again.' }; }
    var ansT = answerText(inst, resp);
    if (res.v === 'form') {
      if (!cur.practice) r.forms = (r.forms || 0) + 1;
      showFb(fb, 'form', 'Almost — check the format', res.hint); logAttempt(it, 'form', res.code, ansT); touch(lesson.id); return;
    }
    if (res.v === 'correct') {
      logAttempt(it, 'correct', '', ansT, (cur.practice ? cur.ptv || 0 : r.tv) + 1);
      if (cur.practice) {
        // a question done after seeing its solution counts toward a retest once a new version is done without it
        var redone = r.credit === 'shown' && !r.redo && !it.extra; if (redone) r.redo = Date.now();
        r.pracRight = (r.pracRight || 0) + 1; cur.ptv = 0; touch(lesson.id); showFb(fb, 'good', '✓ Correct', redone ? 'Done without the solution: this question now counts toward a unit retest.' : ''); fb.appendChild(solutionBlock(inst, false)); w.disable(true); swapToNext(it); if (redone) drawNav(); return;
      }
      r.s = 'done'; r.credit = r.reveals ? 'shown' : (r.wrong || r.steps) ? 'hint' : 'first'; r.done = Date.now(); r.ansHtml = answerHtml(inst, resp); r.ans = ansT;
      touch(lesson.id); drawNav(); drawHeaderBar();
      showFb(fb, 'good', r.credit === 'first' ? '✓ Correct on the first try!' : '✓ Correct', r.credit === 'first' ? '' : 'Nice work sticking with it.');
      fb.appendChild(solutionBlock(inst, false)); w.disable(true); swapToNext(it); return;
    }
    // wrong
    var tv;
    if (cur.practice) { cur.ptv = (cur.ptv || 0) + 1; tv = cur.ptv; }
    else { r.wrong = (r.wrong || 0) + 1; r.tv = (r.tv || 0) + 1; tv = r.tv; touch(lesson.id); }
    logAttempt(it, 'wrong', res.code, ansT, tv);
    var tries = document.querySelector('.qcard .tries'); if (tries) drawTries(tries, inst, tv);
    if (w.mark && inst.input.type === 'mc') w.mark(resp);
    if (tv >= inst.tries) {
      if (cur.practice) { showFb(fb, 'shown', 'Here’s the answer', ''); fb.appendChild(el('div', 'fb-ans', HW.tex(inst.answer))); fb.appendChild(solutionBlock(inst, true)); w.disable(true); cur.ptv = 0; return; }
      r.s = 'shown'; r.reveals = (r.reveals || 0) + 1; touch(lesson.id);
      L.push({ t: 'event', type: 'reveal', lesson: lesson.id, item: it.id, at: Date.now() + 5 }, true);
      drawNav(); drawCard(); return;
    }
    var generic = inst.hints[Math.min(tv - 1, inst.hints.length - 1)];
    var body = res.hint || generic || 'Check your work and try again.';
    if (res.hint && tv >= 2 && generic && generic !== res.hint) body += '<div class="fb-more">' + HW.tex(generic) + '</div>';
    var left = inst.tries - tv;
    showFb(fb, 'hint', 'Not quite — try again', body);
    fb.appendChild(el('div', 'fb-left', left === 1 ? 'One more try before the answer is shown.' : left + ' tries left.'));
  }
  function swapToNext(it) {
    var btn = document.querySelector('.qcard .btn-check'); if (!btn) return;
    var nb = nextBtn(it, false); btn.parentNode.replaceChild(nb, btn);
    var gh = document.querySelectorAll('.qcard .btn-next.btn-ghost'); gh.forEach(function (g) { g.remove(); });
    var tries = document.querySelector('.qcard .tries'); if (tries) tries.remove();
    setTimeout(function () { try { nb.focus(); } catch (e) {} }, 30);
  }
  function newVersion(lesson, it, why) {
    var r = IR(lesson.id, it.id); r.v = (r.v || 0) + 1;
    if (it.q.shared) LS(lesson.id).qv[it.q.num] = (LS(lesson.id).qv[it.q.num] || 0) + 1;
  }

  /* ---------------- leaving the page = new numbers ---------------- */
  var awayAt = 0, viaNotes = 0;
  function working() { if (!cur.lesson || !cur.item) return false; if (cur.practice) return true; var r = IR(cur.lesson.id, cur.item); return r.s === 'open'; }
  function goneAway() { if (awayAt) return; awayAt = Date.now(); if (cur.lesson) L.setStatus(Object.assign({}, L.status || {}, { away: true }), true); }
  function cameBack() {
    if (!awayAt) return; var gone = Date.now() - awayAt; awayAt = 0;
    var notes = viaNotes && Date.now() - viaNotes < gone + 5000; viaNotes = 0; // left by opening the lesson page
    if (!cur.lesson) return;
    L.setStatus(Object.assign({}, L.status || {}, { away: false }), true);
    if (gone < AWAY_GRACE || !working()) { if (gone >= AWAY_GRACE) L.push({ t: 'event', type: 'away', lesson: cur.lesson.id, item: cur.item, secs: Math.round(gone / 1000) }); return; }
    var it = cur.lesson.byId[cur.item];
    if (cur.practice) { IR(cur.lesson.id, it.id).prac++; }
    else newVersion(cur.lesson, it, 'leave');
    touch(cur.lesson.id);
    L.push({ t: 'event', type: 'leave', lesson: cur.lesson.id, item: it.id, secs: Math.round(gone / 1000) }, true);
    cur.notice = notes ? '<b>Welcome back from the lesson.</b> This question has new numbers — try it with what you just reviewed.'
      : '<b>You left the page</b> (' + Math.round(gone / 1000) + ' s), so this question has new numbers. Keep this tab open while you work — use the on-screen calculator or your own calculator.';
    drawCard();
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') goneAway(); else if (document.hasFocus()) cameBack(); });
  root.addEventListener('blur', function () { setTimeout(function () { if (!document.hasFocus()) goneAway(); }, 50); });
  root.addEventListener('focus', function () { if (document.visibilityState === 'visible') cameBack(); });

  /* ---------------- time on task ---------------- */
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { root.addEventListener(ev, function () { lastInteract = Date.now(); }, { passive: true, capture: true }); });
  setInterval(function () {
    if (!session || !cur.lesson || awayAt || document.visibilityState !== 'visible' || !document.hasFocus() || Date.now() - lastInteract > IDLE_MS) return;
    var lid = cur.lesson.id, l = LS(lid); l.secs = (l.secs || 0) + 1;
    if (cur.item) { var r = IR(lid, cur.item); r.secs = (r.secs || 0) + 1; }
    pendingSecs[lid] = (pendingSecs[lid] || 0) + 1;
    if (l.secs % 20 === 0) saveSoon(lid);
  }, 1000);
  setInterval(function () { Object.keys(pendingSecs).forEach(function (lid) { if (pendingSecs[lid]) { L.push({ t: 'tick', lesson: lid, item: cur.item, secs: pendingSecs[lid] }); pendingSecs[lid] = 0; } }); }, 15000);
  L.onStatus(function () { var d = document.querySelector('.sync-dot'); if (d) { d.className = 'sync-dot' + (L.ok === false ? ' bad' : ' good'); } });

  /* ---------------- start ---------------- */
  HW.App = { route: route, state: function () { return S; }, session: function () { return session; }, cur: function () { return cur; }, signOut: signOut,
    makeWidget: makeWidget, answerText: answerText, answerHtml: answerHtml, drawTop: drawTop, leaveLesson: leaveLesson, solutionBlock: solutionBlock, save: saveState, pushProgress: pushProgress };
  function boot() {
    if (root.MathfieldElement) { try { root.MathfieldElement.fontsDirectory = null; root.MathfieldElement.soundsDirectory = null; } catch (e) {} }
    var saved = null; try { saved = JSON.parse(ls(SESSION) || 'null'); } catch (e) {}
    var params = new URLSearchParams(location.search), want = params.get('class') || params.get('c');
    if (saved && saved.name && (!want || (saved.klass || '').toLowerCase() === want.toLowerCase())) startSession(saved);
    else renderSignIn();
  }
  // wait briefly for the math editor (MathLive) so answer boxes can use it; carry on without it if it is slow or blocked
  var t0 = Date.now();
  (function wait() {
    if ((root.customElements && root.customElements.get('math-field')) || Date.now() - t0 > 2500 || root.HW_NO_MATHLIVE) { boot(); return; }
    setTimeout(wait, 80);
  })();
})(window);
