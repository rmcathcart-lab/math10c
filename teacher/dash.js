/* Teacher Ledger — the teacher dashboard for Math 10C Practice.
 * Tabs: Live (who is working right now), Progress (every student × lesson), Outcomes (highest level reached per
 * outcome), Questions (item analysis and the most common errors), Student (one student's full record), PowerSchool
 * (score files to import, report card comments; reports.js), Settings (class lists with PowerSchool student numbers,
 * pronouns and IPP, PIN resets, class times, the class link + QR code).
 * "In class only" uses the server's in-class tag (the class's block on the bell schedule). */
(function (root) {
  'use strict';
  var HW = root.HW, L = HW.Ledger, el = HW.el, esc = HW.esc, cfg = root.HW_CONFIG || {};
  var view = document.getElementById('view'), top = document.getElementById('topbar');
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  var st = { key: ls('hw:tkey') || '', classes: [], klass: ls('hw:tclass') || '', D: null, tab: ls('hw:ttab') || 'live', scope: ls('hw:tscope') || 'class', rule: ls('hw:trule2') || 'first', /* the practice level counts first-try answers (Ryan, 2026-10-25); hw:trule2 so an older saved choice doesn't override it */ lesson: Object.keys(HW.lessons)[0], student: null, loading: false, liveTimer: null, dashTimer: null, sortP: 'name' };
  var LV = HW.LEVELS, LVN = HW.LEVEL_NAMES;
  function realApi(action, params) { return L.get(action, Object.assign({ key: st.key }, params || {}), 30000); }
  /* the demo class (teacher/demo.js) answers its own requests in the browser; everything else goes to the ledger */
  function rawApi(action, params) { var Dm = HW.DashDemo; if (Dm && (Dm.isDemo(params) || (action === 'tests' && st.klass === Dm.CODE))) return Dm.api(action, params, realApi); return realApi(action, params); }
  /* Reads are shared: the same request while one is on its way gets that one's answer, and a few slow ones (the tests,
     sessions, retests, calendar) are kept for 15 s so tabs that ask for the same thing don't each wait on Apps Script.
     Anything else is a change: it drops what's kept, so the next read is fresh. */
  var READS = { classes: 1, dash: 1, live: 1, student: 1, cal: 1, tests: 1, tlive: 1, retests: 1, sessions: 1, tresults: 1 }, KEEP = { tests: 1, sessions: 1, retests: 1, cal: 1 };
  var flying = {}, kept = {}, writeHooks = [];
  function api(action, params) {
    if (!READS[action]) { flying = {}; kept = {}; var p = rawApi(action, params); p.then(function () { writeHooks.forEach(function (f) { try { f(action, params); } catch (e) {} }); }, function () {}); return p; }
    var k = action + '|' + JSON.stringify(params || {}), hit = kept[k];
    if (hit && Date.now() - hit.at < 15000) return Promise.resolve(hit.d);
    if (flying[k]) return flying[k];
    var mine = flying, pr = flying[k] = rawApi(action, params).then(function (d) { if (mine[k] === pr) delete mine[k]; if (KEEP[action] && d && d.ok && mine === flying) kept[k] = { d: d, at: Date.now() }; return d; }, function (e) { if (mine[k] === pr) delete mine[k]; throw e; });
    return pr;
  }
  function isDemo() { return !!(HW.DashDemo && st.klass === HW.DashDemo.CODE); }
  function demoEntry() { var Dm = HW.DashDemo; return Dm && ls('hw:nodemo') !== '1' ? [{ code: Dm.CODE, label: Dm.LABEL, students: Dm.count, block: 'B', demo: true }] : []; }
  function ago(ms) { if (!ms) return '—'; var s = Math.round((Date.now() - ms) / 1000); if (s < 60) return s + ' s ago'; var m = Math.round(s / 60); if (m < 60) return m + ' min ago'; var h = Math.round(m / 60); if (h < 36) return h + ' h ago'; return Math.round(h / 24) + ' d ago'; }
  function dur(s) { s = Math.round(s || 0); if (s < 60) return s ? s + ' s' : '0'; var m = Math.round(s / 60); return m < 60 ? m + ' min' : Math.floor(m / 60) + ' h ' + (m % 60) + ' m'; }
  function since(ms) { var s = Math.max(0, Math.round((Date.now() - ms) / 1000)); return s < 60 ? s + ' s' : Math.floor(s / 60) + ' min ' + (s % 60 < 10 ? '0' : '') + (s % 60) + ' s'; }
  function pct(a, b) { return b ? Math.round(100 * a / b) + '%' : '—'; }
  function short(name) { var p = String(name).trim().split(/\s+/); return p.length > 1 ? p[0] + ' ' + p[p.length - 1][0] + '.' : name; }

  /* ---------------- shell ---------------- */
  function drawTop() {
    top.innerHTML = '';
    var brand = el('button', 'brand brand-btn', '<span class="brand-mark dark" aria-hidden="true">' + MARK + '</span><span class="brand-name">Teacher Ledger</span><span class="brand-caret" aria-hidden="true"></span>');
    brand.type = 'button'; brand.title = 'Switch course'; brand.setAttribute('aria-haspopup', 'menu'); brand.setAttribute('aria-expanded', courseMenu ? 'true' : 'false');
    brand.addEventListener('click', function (e) { e.stopPropagation(); if (courseMenu) closeCourses(); else openCourses(brand); });
    top.appendChild(brand);
    if (st.key && st.classes.length) {
      var sel = el('select', 'class-pick'); sel.setAttribute('aria-label', 'Class');
      st.classes.forEach(function (c) { var o = el('option', '', esc(c.label) + ' (' + c.students + ')'); o.value = c.code; if (c.code === st.klass) o.selected = true; sel.appendChild(o); });
      sel.addEventListener('change', function () { st.klass = sel.value; ls('hw:tclass', st.klass); st.student = null; loadDash(); });
      top.appendChild(sel);
      if (st.D) { top.appendChild(onlineChip()); top.appendChild(el('span', 'small muted top-upd', 'Updated ' + new Date(st.D.now).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))); }
    }
    var right = el('div', 'top-right');
    var stu = el('a', 'btn btn-ghost', 'Student site ↗'); stu.href = '../'; stu.target = '_blank'; right.appendChild(stu);
    if (st.D && HW.DashCal) { HW.DashCal.topButtons(right); } // then Lessons (pop-up) and, farthest right, Launch Today's Lesson
    top.appendChild(right);
    topHeight();
  }
  /* ---------------- course switcher: the badge in the corner opens a list of Ryan's courses (js/courses.js) ---------------- */
  var MARK = '10C', courseMenu = null;
  function openCourses(btn) {
    var list = root.HW_COURSES && root.HW_COURSES.length ? root.HW_COURSES : [{ mark: MARK, name: document.title, ledger: './' }];
    var m = el('div', 'course-menu'); m.setAttribute('role', 'menu'); m.setAttribute('aria-label', 'Your courses');
    m.appendChild(el('div', 'cm-h', 'Your courses'));
    list.forEach(function (c) {
      var here = c.mark === MARK, row = el(here ? 'div' : 'a', 'cm-row' + (here ? ' is-here' : ''),
        '<span class="brand-mark cm-mark" style="background:' + esc(c.colour || '#1c2230') + '">' + esc(c.mark) + '</span>' +
        '<span class="cm-t"><b>' + esc(c.name) + '</b><span>' + (here ? 'You’re here' : 'Teacher Ledger') + '</span></span>' + (here ? '<span class="cm-tick" aria-hidden="true">✓</span>' : ''));
      if (here) row.setAttribute('aria-current', 'page'); else { row.href = c.ledger; row.setAttribute('role', 'menuitem'); }
      m.appendChild(row);
    });
    var r = btn.getBoundingClientRect(); m.style.left = Math.max(8, r.left) + 'px'; m.style.top = (r.bottom + 6) + 'px';
    document.body.appendChild(m); courseMenu = m; btn.setAttribute('aria-expanded', 'true');
    var first = m.querySelector('a.cm-row'); if (first) first.focus();
  }
  function closeCourses(refocus) {
    if (!courseMenu) return; courseMenu.remove(); courseMenu = null;
    var b = top.querySelector('.brand-btn'); if (b) { b.setAttribute('aria-expanded', 'false'); if (refocus) b.focus(); }
  }
  document.addEventListener('click', function (e) { if (courseMenu && !courseMenu.contains(e.target)) closeCourses(); });
  document.addEventListener('keydown', function (e) {
    if (!courseMenu) return;
    if (e.key === 'Escape') { closeCourses(true); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      var items = [].slice.call(courseMenu.querySelectorAll('a.cm-row')), i = items.indexOf(document.activeElement);
      if (items.length) { e.preventDefault(); items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus(); }
    }
  });
  root.addEventListener('resize', function () { closeCourses(); });
  /* the tab bar sticks just under the header (whose height changes when it wraps on a narrow screen) */
  function topHeight() { document.documentElement.style.setProperty('--toph', top.offsetHeight + 'px'); }
  root.addEventListener('resize', topHeight);
  /* the tabs, in groups: right now · practice · exit slips and tests · the plan · reporting and setup */
  var TAB_GROUPS = [[['live', 'Live']], [['progress', 'Progress'], ['outcomes', 'Outcomes'], ['questions', 'Questions'], ['student', 'Student']], [['exits', 'Exit slips'], ['tests', 'Tests'], ['retests', 'Retests']], [['calendar', 'Calendar']], [['powerschool', 'PowerSchool'], ['settings', 'Settings']]];
  function tabLabel(id, name) { var n = id === 'retests' && HW.Dash && HW.Dash.retestCount; return name + (n ? ' <span class="tab-badge" title="Retest requests waiting">' + n + '</span>' : ''); }
  function tabs() {
    var t = el('nav', 'tabs'); t.setAttribute('aria-label', 'Ledger');
    TAB_GROUPS.forEach(function (g, gi) {
      if (gi) t.appendChild(el('span', 'tab-sep', ''));
      g.forEach(function (x) {
        var b = el('button', 'tab' + (st.tab === x[0] ? ' on' : ''), tabLabel(x[0], x[1])); b.type = 'button'; b.dataset.tab = x[0];
        if (st.tab === x[0]) b.setAttribute('aria-current', 'page');
        b.addEventListener('click', function () { goTab(x[0]); });
        t.appendChild(b);
      });
    });
    return t;
  }
  function goTab(id) { st.tab = id; ls('hw:ttab', id); render(); root.scrollTo(0, 0); }
  function updateBadge() { var b = document.querySelector('.tab[data-tab="retests"]'); if (b) b.innerHTML = tabLabel('retests', 'Retests'); }
  function boot() {
    drawTop();
    if (!L.enabled) { view.innerHTML = '<div class="panel"><h2>No ledger connected</h2><p>Set <code>backend</code> in <code>js/config.js</code> to the Apps Script web-app URL.</p></div>'; return; }
    if (!st.key) return keyScreen();
    loadClasses();
  }
  function keyScreen(msg) {
    drawTop(); view.innerHTML = '';
    var c = el('div', 'signin-card'); c.innerHTML = '<div class="signin-mark dark">10C</div><h1>Teacher Ledger</h1><p class="muted">Enter your teacher key. It’s in the Apps Script project (Project Settings → Script properties → TEACHER_KEY).</p>';
    if (msg) c.appendChild(el('div', 'notice', esc(msg)));
    var inp = el('input', 'field'); inp.type = 'password'; inp.placeholder = 'Teacher key'; c.appendChild(inp);
    var go = el('button', 'btn btn-primary btn-block', 'Open the ledger'); go.type = 'button'; c.appendChild(go);
    function sub() { st.key = inp.value.trim(); if (!st.key) return; ls('hw:tkey', st.key); loadClasses(); }
    go.addEventListener('click', sub); inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') sub(); });
    view.appendChild(c); inp.focus();
  }
  function loadClasses() {
    view.innerHTML = '<div class="loading">Opening the ledger…</div>';
    api('classes').then(function (d) {
      if (!d.ok) { if (d.error === 'bad key') { ls('hw:tkey', null); st.key = ''; return keyScreen('That key didn’t work.'); } throw new Error(d.error); }
      st.classes = d.classes.concat(demoEntry()); st.noSchool = d.noSchool; st.bell = d.bell; st.bellCustom = !!d.bellCustom;
      if (!st.classes.length) { st.tab = 'settings'; st.D = null; drawTop(); return render(); }
      if (!st.classes.some(function (c) { return c.code === st.klass; })) st.klass = st.classes[0].code;
      loadDash();
    }).catch(function (e) { view.innerHTML = '<div class="panel"><h2>Can’t reach the ledger</h2><p class="muted">' + esc(e.message) + '</p></div>'; });
  }
  function loadDash(quiet) {
    if (!st.klass) return render();
    if (!quiet) { st.loading = true; if (!st.D) view.innerHTML = '<div class="loading">Loading ' + esc(st.klass) + '…</div>'; }
    return api('dash', { 'class': st.klass }).then(function (d) {
      st.loading = false;
      if (!d.ok) throw new Error(d.error || 'error');
      st.D = d; st.derived = null; drawTop(); if (!(quiet && (st.tab === 'powerschool' || st.tab === 'settings'))) render(); loadCal(); // the 2-minute refresh leaves forms being filled in alone
      if (st.warmFor !== st.klass) { st.warmFor = st.klass; warm(st.klass); }
      clearInterval(st.dashTimer); st.dashTimer = setInterval(function () { if (document.visibilityState === 'visible') loadDash(true); }, 120000);
      clearInterval(st.liveTimer); st.liveTimer = setInterval(pollLive, 10000);
    }).catch(function (e) { st.loading = false; if (!quiet) view.innerHTML = '<div class="panel"><h2>Couldn’t load the class</h2><p class="muted">' + esc(e.message) + '</p></div>'; });
  }
  /* the class calendar, for the header's Launch Today's Lesson and the Lessons pop-up */
  function loadCal() {
    var k = st.klass;
    api('cal', { 'class': k }).then(function (d) {
      if (k !== st.klass || !d || !d.ok) return;
      var first = st.calFor !== k;
      st.cal = d.cal && HW.Cal ? HW.Cal.clean(d.cal) : null; st.calFor = k; st.lopts = d.lopts || null; drawTop();
      if (HW.DashCal && HW.DashCal.seed) HW.DashCal.seed(k, d);
      if (first && (st.tab === 'exits' || st.tab === 'tests') && HW.DashTests && HW.DashTests.atHome()) render(); // the lists mark today's lesson from the calendar
    }).catch(function () {});
  }
  /* once a class is open, the other tabs' data loads in the background (one thing at a time), so opening a tab is quick:
     the exit slips and tests, the retest requests, then every closed exit slip and test marked for PowerSchool */
  function warm(k) {
    var idle = root.requestIdleCallback || function (f) { return setTimeout(f, 300); };
    function still() { return k === st.klass && document.visibilityState !== 'hidden'; }
    setTimeout(function () {
      idle(function () {
        if (!still()) return;
        var steps = [function () { return HW.DashTests && HW.DashTests.prefetch(); }, function () { return HW.DashRetests && HW.DashRetests.load(); }, function () { return HW.DashReports && HW.DashReports.load && HW.DashReports.load(); }];
        (function next() { var f = steps.shift(); if (!f || !still()) return; Promise.resolve().then(f).then(next, next); })();
      });
    }, 600);
  }
  function pollLive() { // every 10 s on any tab: the header's "signed in" count; the Live tab redraws
    if (!st.D || document.visibilityState !== 'visible') return;
    api('live', { 'class': st.klass }).then(function (d) { if (d.ok && st.D) { st.D.live = d.live; st.D.liveNow = d.now; updateOnline(); if (st.tab === 'live') render(); } }).catch(function () {});
  }
  /* header chip: how many of the class are on the site right now (their page checked in within the last 90 s) */
  function onlineCount() {
    var D = st.D, now = D.liveNow || D.now || Date.now(), live = D.live || {}, names = D.roster.map(function (r) { return r.name; }), on = [];
    names.forEach(function (n) { var r = live[n]; if (r && now - r.at < 90000) on.push(n); });
    return { on: on, total: names.length, off: names.filter(function (n) { return on.indexOf(n) < 0; }) };
  }
  function onlineChip() { var c = el('button', 'online-chip'); c.type = 'button'; c.id = 'online-chip'; fillOnline(c); c.addEventListener('click', function () { goTab('live'); }); return c; }
  function fillOnline(c) {
    var o = onlineCount();
    c.innerHTML = '<i class="oc-dot' + (o.on.length ? ' on' : '') + '"></i><b>' + o.on.length + '</b> / ' + o.total + ' on the site';
    c.title = (o.total ? 'Signed in with the site open (checked in within the last 90 seconds).' + (o.off.length && o.off.length <= 40 ? '\nNot on yet: ' + o.off.join(', ') : '') : 'No class list yet') + '\nClick to open the Live tab';
    c.classList.toggle('all', o.total > 0 && o.on.length === o.total);
  }
  function updateOnline() { var c = document.getElementById('online-chip'); if (c) fillOnline(c); }
  setInterval(function () { if (st.tab === 'live') document.querySelectorAll('[data-since]').forEach(function (n) { n.textContent = since(Number(n.dataset.since)); }); }, 1000);

  /* ---------------- derived data ---------------- */
  function derive() {
    if (st.derived && st.derived.scope === st.scope && st.derived.rule === st.rule) return st.derived;
    var D = st.D, A = D.attempts.slice().sort(function (a, b) { return a[0] - b[0]; }), inOnly = st.scope === 'class';
    var reveals = {}; D.events.forEach(function (e) { if (e[4] === 'reveal') { var k = e[1] + '|' + e[2] + '|' + e[3]; (reveals[k] = reveals[k] || []).push(e[0]); } });
    var items = {}; // name|lesson|item -> record
    A.forEach(function (a) {
      var name = a[1], lesson = a[2], id = a[3], verdict = a[9], prac = a[7];
      if (prac) return;
      var k = name + '|' + lesson + '|' + id, r = items[k] || (items[k] = { name: name, lesson: lesson, id: id, outcome: a[4], level: a[5], extra: a[6], errors: 0, forms: 0, codes: [], answers: [], correctAt: 0, correctIn: 0, first: 0, attempts: 0 });
      if (r.correctAt) return;
      if (verdict === 'form') { r.forms++; return; }
      r.attempts++; if (!r.firstAt) r.firstAt = a[0];
      if (verdict === 'wrong' || verdict === 'step') { r.errors++; if (a[10]) r.codes.push(a[10]); if (verdict === 'wrong' && a[12]) r.answers.push(a[12]); return; }
      if (verdict === 'correct') { r.correctAt = a[0]; r.correctIn = a[14]; r.answer = a[12]; var rv = (reveals[k] || []).filter(function (t) { return t <= a[0]; }).length; r.credit = rv ? 'shown' : r.errors ? 'hint' : 'first'; }
    });
    var allow = st.rule === 'first' ? { first: 1 } : st.rule === 'any' ? { first: 1, hint: 1, shown: 1 } : { first: 1, hint: 1 };
    var stu = {};
    D.roster.forEach(function (s) { stu[s.name] = { name: s.name, roster: s, lessons: {}, outcomes: {}, levelAcc: {}, secs: 0, secsIn: 0, answers: 0, right: 0, leaves: 0, leavesIn: 0, reveals: 0 }; });
    function S(n) { return stu[n] || (stu[n] = { name: n, roster: null, lessons: {}, outcomes: {}, levelAcc: {}, secs: 0, secsIn: 0, answers: 0, right: 0, leaves: 0, leavesIn: 0, reveals: 0 }); }
    Object.keys(items).forEach(function (k) {
      var r = items[k], s = S(r.name), counted = r.correctAt && (!inOnly || r.correctIn);
      var ls2 = s.lessons[r.lesson] || (s.lessons[r.lesson] = { done: 0, first: 0, extra: 0, home: 0, items: {} });
      ls2.items[r.id] = r;
      if (counted) { if (r.extra) ls2.extra++; else { ls2.done++; if (r.credit === 'first') ls2.first++; } }
      else if (r.correctAt) ls2.home++; // right, but outside class: not counted while "In class only" is on
      var la = s.levelAcc[r.outcome + '|' + r.level] || (s.levelAcc[r.outcome + '|' + r.level] = { tried: 0, first: 0, hint: 0, shown: 0, right: 0 });
      if (r.attempts && (!inOnly || r.correctIn || !r.correctAt)) { la.tried++; if (counted) { la[r.credit]++; if (allow[r.credit]) la.right++; } }
      if (counted && allow[r.credit]) { var cur = s.outcomes[r.outcome]; if (!cur || LV.indexOf(r.level) > LV.indexOf(cur)) s.outcomes[r.outcome] = r.level; }
    });
    D.days.forEach(function (d) { var s = S(d[1]); s.secs += Number(d[3]) || 0; s.secsIn += Number(d[4]) || 0; });
    A.forEach(function (a) { if (a[7]) return; if (inOnly && !a[14]) return; if (a[9] === 'correct' || a[9] === 'wrong') { var s = S(a[1]); s.answers++; if (a[9] === 'correct') s.right++; } });
    D.events.forEach(function (e) { var s = S(e[1]); if (e[4] === 'leave') { s.leaves++; if (e[6]) s.leavesIn++; } if (e[4] === 'reveal') s.reveals++; });
    st.derived = { scope: st.scope, rule: st.rule, items: items, stu: stu };
    return st.derived;
  }
  function students() { var d = derive(); return Object.keys(d.stu).map(function (k) { return d.stu[k]; }).sort(function (a, b) { return a.name.localeCompare(b.name); }); }
  function builtLessons() { var out = []; HW.CATALOG.forEach(function (u) { u.lessons.forEach(function (c) { if (HW.lessons[c.id]) out.push(HW.lessons[c.id]); }); }); return out; }
  function outcomesBuilt() { var o = []; builtLessons().forEach(function (l) { l.items.forEach(function (it) { if (o.indexOf(it.outcome) < 0) o.push(it.outcome); }); }); return o; }

  /* ---------------- render ---------------- */
  function render() {
    view.innerHTML = '';
    if (!st.D && st.tab !== 'settings') { if (!st.classes.length) st.tab = 'settings'; else return; }
    // how many retest requests are waiting (the tab's badge): asked once per class, then kept fresh by the tab itself
    if (HW.DashRetests && st.klass && st.rtAsked !== st.klass) { st.rtAsked = st.klass; HW.Dash.retestCount = 0; HW.DashRetests.load().then(function () { if (st.tab !== 'retests') updateBadge(); }, function () {}); }
    view.appendChild(tabs());
    var body = el('div', 'tab-body'); view.appendChild(body);
    ({ live: renderLive, exits: function (b) { HW.DashTests.render(b, 'exit'); }, tests: function (b) { HW.DashTests.render(b, 'test'); }, retests: function (b) { HW.DashRetests.render(b); }, calendar: function (b) { HW.DashCal.render(b); }, progress: renderProgress, outcomes: renderOutcomes, questions: renderQuestions, student: renderStudent, powerschool: function (b) { HW.DashReports.render(b); }, settings: renderSettings }[st.tab] || renderLive)(body);
    HW.texIn && HW.texIn(body);
  }

  /* ---- Live ---- */
  function liveState(rec, now) {
    if (!rec) return { k: 'none', t: 'Not on the site' };
    var age = now - rec.at;
    if (age > 90000) return { k: 'off', t: 'Offline' };
    if (rec.away) return { k: 'away', t: 'Left the page' };
    if (rec.view === 'lesson') return { k: 'work', t: 'Working' };
    if (rec.view === 'teach') return { k: 'teach', t: 'On the lesson page' };
    return { k: 'idle', t: 'On the assignment list' };
  }
  function renderLive(body) {
    var D = st.D, now = D.liveNow || Date.now(), live = D.live || {}, roster = students();
    var counts = { work: 0, teach: 0, away: 0, idle: 0, off: 0, none: 0 };
    var rows = roster.map(function (s) { var rec = live[s.name], ls2 = liveState(rec, now); counts[ls2.k]++; return { s: s, rec: rec, ls: ls2 }; });
    var order = { work: 0, teach: 1, away: 2, idle: 3, off: 4, none: 5 };
    rows.sort(function (a, b) { return order[a.ls.k] - order[b.ls.k] || a.s.name.localeCompare(b.s.name); });
    var head = el('div', 'live-head');
    head.innerHTML = '<div class="live-chips"><span class="lchip work"><b>' + counts.work + '</b> working</span>' + (counts.teach ? '<span class="lchip teach"><b>' + counts.teach + '</b> on a lesson page</span>' : '') + '<span class="lchip away"><b>' + counts.away + '</b> left the page</span><span class="lchip idle"><b>' + counts.idle + '</b> on the assignment list</span><span class="lchip off"><b>' + (counts.off + counts.none) + '</b> not on the site</span></div>' +
      '<div class="small muted">' + classTimeLine() + ' · refreshes every 10 s</div>';
    body.appendChild(head);
    var t = el('table', 'tbl live');
    t.innerHTML = '<thead><tr><th>Student</th><th>Status</th><th>Where</th><th>On this for</th><th>Today</th><th>Left the page today</th><th>Last seen</th></tr></thead>';
    var tb = el('tbody'), today = HW.dayKey ? HW.dayKey(Date.now()) : new Date().toISOString().slice(0, 10);
    var todayStats = {}; st.D.days.forEach(function (d) { if (d[0] === localDay(Date.now())) { var x = todayStats[d[1]] || (todayStats[d[1]] = { secs: 0, secsIn: 0, answers: 0, right: 0 }); x.secs += Number(d[3]) || 0; x.secsIn += Number(d[4]) || 0; x.answers += Number(d[5]) || 0; x.right += Number(d[6]) || 0; } });
    var leavesToday = {}; st.D.events.forEach(function (e) { if (e[4] === 'leave' && localDay(e[0]) === localDay(Date.now())) leavesToday[e[1]] = (leavesToday[e[1]] || 0) + 1; });
    rows.forEach(function (x) {
      var rec = x.rec, where = '—';
      if (rec && rec.view === 'lesson') { var l = HW.lessons[rec.lesson]; where = (l ? 'L' + l.num + ' ' : '') + '<b>' + esc(rec.label || rec.item || '') + '</b>'; }
      else if (rec && rec.view === 'home') where = '<span class="muted">Assignment list</span>';
      else if (rec && rec.view === 'teach') { var tl = HW.Cal && HW.Cal.info(rec.lesson); where = '<b>' + esc(tl ? 'Lesson ' + tl.unit + '.' + tl.num : rec.label || 'Lesson') + '</b> <span class="tag">lesson page</span>'; }
      var ts = todayStats[x.s.name];
      var tr = el('tr', 'lv-' + x.ls.k);
      tr.innerHTML = '<td><a href="#" class="slink">' + esc(x.s.name) + '</a></td><td><span class="dot ' + x.ls.k + '"></span>' + x.ls.t + (rec && x.ls.k !== 'off' && x.ls.k !== 'none' && rec.inClass === false ? ' <span class="tag">outside class time</span>' : '') + '</td>' +
        '<td>' + where + '</td><td>' + (rec && (x.ls.k === 'work' || x.ls.k === 'away' || x.ls.k === 'teach') ? '<span data-since="' + rec.since + '">' + since(rec.since) + '</span>' : '—') + '</td>' +
        '<td>' + (ts ? dur(ts.secs) + ' · ' + ts.right + '/' + ts.answers + ' right' : '—') + '</td><td>' + (leavesToday[x.s.name] ? '<span class="warnnum">' + leavesToday[x.s.name] + '</span>' : '0') + '</td><td>' + (rec ? ago(rec.at) : x.s.roster && x.s.roster.lastSeen ? ago(x.s.roster.lastSeen) : 'never') + '</td>';
      tr.querySelector('.slink').addEventListener('click', function (e) { e.preventDefault(); openStudent(x.s.name); });
      tb.appendChild(tr);
    });
    t.appendChild(tb); body.appendChild(wrapTbl(t));
    body.appendChild(el('p', 'small muted', '“Left the page” means the student switched tabs or windows while a question was open — the question got new numbers. Times count only while the page is open, focused and in use.'));
  }
  function localDay(ms) { var d = new Date(ms); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function classTimeLine() { var c = st.D['class']; return c.block ? 'Class time: block ' + c.block + ' on the bell schedule' : 'No class time set (everything counts as in class) — set a block in Settings'; }
  function wrapTbl(t) { var w = el('div', 'tbl-wrap'); w.appendChild(t); return w; }
  /* "In class only / All work": only on the tabs built from practice work (Progress, Outcomes, Questions, Student) */
  function scopeSeg() {
    var seg = el('div', 'seg scope-seg');
    [['class', 'In class only'], ['all', 'All work']].forEach(function (s) { var b = el('button', s[0] === st.scope ? 'on' : '', s[1]); b.type = 'button'; b.addEventListener('click', function () { if (st.scope === s[0]) return; st.scope = s[0]; ls('hw:tscope', s[0]); render(); }); seg.appendChild(b); });
    seg.title = 'In class only: count work done during this class’s block on the bell schedule (what you can grade). All work: include homework done outside class.';
    return seg;
  }
  /* units that have practice lessons, with their lesson objects */
  function unitsBuilt() { return HW.CATALOG.map(function (u) { return { u: u, ls: u.lessons.filter(function (c) { return HW.lessons[c.id]; }).map(function (c) { return HW.lessons[c.id]; }) }; }).filter(function (x) { return x.ls.length; }); }
  function unitSum(ls2, s) { var t = { req: 0, ex: 0, done: 0, first: 0, extra: 0 }; ls2.forEach(function (l) { var r = s && s.lessons[l.id]; t.req += l.required.length; t.ex += l.extras.length; if (r) { t.done += r.done; t.first += r.first; t.extra += r.extra; } }); return t; }
  function counts(t) { return '<b>' + t.done + '</b>/' + t.req + (t.extra ? ' · +' + t.extra : ''); }
  /* one student's questions in one lesson, coloured by how each went (shared by Progress and Student) */
  function itemGrid(l, r) {
    var grid = el('div', 'item-grid');
    l.items.forEach(function (it) {
      var rec = r && r.items[it.id], cls = !rec ? 'new' : rec.correctAt ? 'c-' + rec.credit : rec.errors >= 3 ? 'stuck' : 'open';
      var home = rec && rec.correctAt && !rec.correctIn && st.scope === 'class'; // done outside class: shown, but not counted in the bars
      var b = el('div', 'ig ' + cls + (it.extra ? ' ex' : '') + (home ? ' home' : ''), esc(it.label.replace('Extra ', 'E')));
      b.title = it.label + ' · ' + it.level + ' · ' + (!rec ? 'not started' : rec.correctAt ? ({ first: 'right first try', hint: 'right after ' + rec.errors + ' mistake(s)', shown: 'right after the answer was shown' }[rec.credit]) : rec.errors + ' wrong so far') + (home ? ' · done outside class (not counted while “In class only” is on)' : '');
      grid.appendChild(b);
    });
    return grid;
  }
  function igLegend() { return el('div', 'ig-legend', '<span><i class="ig c-first"></i>Right first try</span><span><i class="ig c-hint"></i>After a hint</span><span><i class="ig c-shown"></i>Answer shown</span><span><i class="ig stuck"></i>Stuck (3+ wrong)</span><span><i class="ig open"></i>Started</span><span><i class="ig new"></i>Not started</span><span><i class="ig ex"></i>Extra (dashed)</span>' + (st.scope === 'class' ? '<span><i class="ig c-first home"></i>Done outside class (striped: not counted while “In class only” is on)</span>' : '')); }

  /* ---- Progress ---- */
  function barHtml(req, ex, done, first, extra) {
    return '<div class="pbar sm">' + (req ? '<div class="pb-track" style="flex-grow:' + req + '"><span class="pb-fill first" style="width:' + (100 * first / req) + '%"></span><span class="pb-fill help" style="width:' + (100 * (done - first) / req) + '%"></span></div>' : '') +
      (ex ? '<div class="pb-track pb-extra" style="flex-grow:' + ex + '"><span class="pb-fill extra" style="width:' + (100 * extra / ex) + '%"></span></div>' : '') + '</div>';
  }
  function miniBar(l, rec) { return barHtml(l.required.length, l.extras.length, rec ? rec.done : 0, rec ? rec.first : 0, rec ? rec.extra : 0); }
  function unitBar(t) { return barHtml(t.req, t.ex, t.done, t.first, t.extra); }
  /* one row per student, one column per unit. Click a unit cell → that student's lessons in the unit drop down below;
   * click a lesson there → its questions one by one. What is open is kept in st.pOpen so a refresh doesn't close it. */
  function renderProgress(body) {
    var us = unitsBuilt(), ss = students(); st.pOpen = st.pOpen || {};
    var bar = el('div', 'opt-row'); bar.appendChild(scopeSeg());
    bar.appendChild(el('div', 'legend', '<span><i class="lg first"></i>Right first try</span><span><i class="lg help"></i>Right after a hint or reveal</span><span><i class="lg extra"></i>Extra practice</span>'));
    body.appendChild(bar);
    var t = el('table', 'tbl prog'), ncol = us.length + 5;
    var h = '<thead><tr><th class="sortable" data-s="name">Student</th>';
    us.forEach(function (x) { h += '<th class="sortable u-col" style="' + (HW.unitStyle ? HW.unitStyle(x.u.unit) : '') + '" data-s="u' + x.u.unit + '" title="' + esc(x.u.title) + ' (' + esc(x.u.outcomes) + ') · click a student’s unit to see its lessons">Unit ' + x.u.unit + '<div class="th-sub">' + esc(x.u.title) + '</div></th>'; });
    h += '<th class="sortable" data-s="time">Time worked<div class="th-sub">in class / all</div></th><th class="sortable" data-s="acc">Right</th><th class="sortable" data-s="leaves">Left page</th><th>Last seen</th></tr></thead>';
    t.innerHTML = h;
    var key = st.sortP, uk = /^u\d+$/.test(key) && us.filter(function (x) { return 'u' + x.u.unit === key; })[0];
    if (!uk && /^u/.test(key) && !HW.lessons[key]) key = 'name';
    ss.sort(function (a, b) {
      if (key === 'name') return a.name.localeCompare(b.name);
      if (key === 'time') return b.secsIn - a.secsIn;
      if (key === 'acc') return (b.answers ? b.right / b.answers : -1) - (a.answers ? a.right / a.answers : -1);
      if (key === 'leaves') return b.leaves - a.leaves;
      if (uk) { var ta = unitSum(uk.ls, a), tb2 = unitSum(uk.ls, b); return (tb2.done * 1000 + tb2.extra) - (ta.done * 1000 + ta.extra) || a.name.localeCompare(b.name); }
      return a.name.localeCompare(b.name);
    });
    var tb = el('tbody');
    ss.forEach(function (s) {
      var tr = el('tr', 'prow'), html = '<td><a href="#" class="slink">' + esc(s.name) + '</a>' + (s.roster && !s.roster.pin ? ' <span class="tag">not signed in yet</span>' : '') + '</td>';
      us.forEach(function (x) { var u = unitSum(x.ls, s); html += '<td class="pcell uc" data-u="' + x.u.unit + '" tabindex="0" role="button" aria-expanded="false" title="Show Unit ' + x.u.unit + ' lessons for ' + esc(s.name) + '">' + unitBar(u) + '<div class="pnum">' + counts(u) + ' <span class="uc-chev" aria-hidden="true">▾</span></div></td>'; });
      html += '<td>' + dur(s.secsIn) + ' / ' + dur(s.secs) + '</td><td>' + (s.answers ? pct(s.right, s.answers) + ' <span class="muted">(' + s.answers + ')</span>' : '—') + '</td><td>' + (s.leaves ? '<span class="warnnum">' + s.leaves + '</span>' : '0') + '</td><td>' + (s.roster && s.roster.lastSeen ? ago(s.roster.lastSeen) : 'never') + '</td>';
      tr.innerHTML = html; tr.querySelector('.slink').addEventListener('click', function (e) { e.preventDefault(); openStudent(s.name); });
      tr.querySelectorAll('.uc').forEach(function (td) {
        function go() { var o = st.pOpen[s.name], u = Number(td.dataset.u); st.pOpen[s.name] = o && o.unit === u ? null : { unit: u, lesson: null }; drawDrop(tr, s); }
        td.addEventListener('click', go); td.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      });
      tb.appendChild(tr);
      if (st.pOpen[s.name]) drawDrop(tr, s);
    });
    function drawDrop(tr, s) {
      var nx = tr.nextSibling; if (nx && nx.classList && nx.classList.contains('pdrop')) nx.remove();
      var o = st.pOpen[s.name], x = o && us.filter(function (y) { return y.u.unit === o.unit; })[0];
      tr.querySelectorAll('.uc').forEach(function (td) { var on = !!(x && Number(td.dataset.u) === x.u.unit); td.classList.toggle('open', on); td.setAttribute('aria-expanded', on ? 'true' : 'false'); });
      tr.classList.toggle('opened', !!x);
      if (!x) { st.pOpen[s.name] = null; return; }
      var dr = el('tr', 'pdrop'), td = el('td'); td.colSpan = ncol;
      var box = el('div', 'pd');
      var head = el('div', 'pd-head', '<b>Unit ' + x.u.unit + ' · ' + esc(x.u.title) + '</b> <span class="muted">— ' + esc(s.name) + ' · click a lesson for its questions</span>');
      var cl = el('button', 'pd-x', '×'); cl.type = 'button'; cl.title = 'Close'; cl.setAttribute('aria-label', 'Close'); cl.addEventListener('click', function () { st.pOpen[s.name] = null; drawDrop(tr, s); });
      head.appendChild(cl); box.appendChild(head);
      var row = el('div', 'pd-lessons');
      x.ls.forEach(function (l) {
        var r = s.lessons[l.id], b = el('button', 'pd-l' + (o.lesson === l.id ? ' on' : ''));
        b.type = 'button'; b.setAttribute('aria-expanded', o.lesson === l.id ? 'true' : 'false');
        b.innerHTML = '<div class="pd-ln">Lesson ' + esc(l.num) + '</div><div class="pd-lt">' + esc(l.title) + '</div>' + miniBar(l, r) + '<div class="pnum">' + (r ? r.done : 0) + '/' + l.required.length + (r && r.extra ? ' · +' + r.extra : '') + (r && r.home ? ' <span class="pd-home" title="Right, but done outside class: not counted while “In class only” is on">+' + r.home + ' outside class</span>' : '') + '</div>';
        b.title = 'Lesson ' + l.num + ': ' + l.title;
        b.addEventListener('click', function () { o.lesson = o.lesson === l.id ? null : l.id; drawDrop(tr, s); });
        row.appendChild(b);
      });
      box.appendChild(row);
      if (o.lesson && HW.lessons[o.lesson]) {
        var l = HW.lessons[o.lesson], q = el('div', 'pd-items');
        q.appendChild(el('div', 'pd-qh', '<b>Lesson ' + esc(l.num) + ': ' + esc(l.title) + '</b> <span class="muted small">question by question</span>'));
        q.appendChild(itemGrid(l, s.lessons[l.id])); q.appendChild(igLegend());
        box.appendChild(q);
      }
      td.appendChild(box); dr.appendChild(td); tr.parentNode.insertBefore(dr, tr.nextSibling);
      HW.texIn && HW.texIn(box);
    }
    t.appendChild(tb);
    t.querySelectorAll('th.sortable').forEach(function (th) { if (th.dataset.s === key) th.classList.add('sorted'); th.addEventListener('click', function () { st.sortP = th.dataset.s; render(); }); });
    body.appendChild(wrapTbl(t));
    var ls2 = builtLessons(), csv = el('button', 'btn btn-small', 'Download progress (CSV)'); csv.type = 'button';
    csv.addEventListener('click', function () {
      var rows = [['Student'].concat(ls2.map(function (l) { return 'U' + l.unit + ' L' + l.num + ' required done'; }), ls2.map(function (l) { return 'U' + l.unit + ' L' + l.num + ' extra done'; }), ['Minutes in class', 'Minutes all', 'Answers', 'Right', 'Left page'])];
      students().forEach(function (s) { rows.push([s.name].concat(ls2.map(function (l) { return s.lessons[l.id] ? s.lessons[l.id].done : 0; }), ls2.map(function (l) { return s.lessons[l.id] ? s.lessons[l.id].extra : 0; }), [Math.round(s.secsIn / 60), Math.round(s.secs / 60), s.answers, s.right, s.leaves])); });
      download(st.klass + '-progress.csv', rows);
    });
    body.appendChild(csv);
  }

  /* ---- Outcomes: every student × outcome at a glance; pick an outcome (its column) for its bands, reteach groups and
     the level-by-level detail ---- */
  function renderOutcomes(body) {
    var outs = outcomesBuilt(), ss = students();
    var bar = el('div', 'opt-row'); bar.appendChild(scopeSeg());
    bar.appendChild(el('span', 'small muted', 'A level counts when the student answered a question at that level correctly'));
    var seg = el('div', 'seg'); [['first', 'on the first try'], ['hint', 'first try or after a hint'], ['any', 'even after the answer was shown']].forEach(function (r) { var b = el('button', st.rule === r[0] ? 'on' : '', r[1]); b.type = 'button'; b.addEventListener('click', function () { st.rule = r[0]; ls('hw:trule2', r[0]); st.derived = null; render(); }); seg.appendChild(b); });
    bar.appendChild(seg); body.appendChild(bar);
    if (!outs.length) { body.appendChild(el('p', 'muted', 'No lessons yet.')); return; }
    if (outs.indexOf(st.oSel) < 0) st.oSel = null;
    // the matrix
    var t = el('table', 'tbl omx'), h = '<thead><tr><th class="omx-name">Student</th>';
    outs.forEach(function (o) {
      var dist = {}, n = ss.length || 1; ss.forEach(function (s2) { var lv = s2.outcomes[o] || 'NONE'; dist[lv] = (dist[lv] || 0) + 1; });
      var bars = ['NONE'].concat(LV).filter(function (l) { return dist[l]; }).map(function (l) { return '<i class="lvlbg-' + l + '" style="flex-grow:' + dist[l] + '"></i>'; }).join('');
      h += '<th class="omx-h' + (st.oSel === o ? ' sel' : '') + '" data-o="' + esc(o) + '"><button type="button" class="omx-o" title="' + esc(o + ': ' + (HW.OUTCOMES[o] || '')) + ' — click for the detail">' + esc(o) + '</button><div class="omx-dist" title="' + esc(['NONE'].concat(LV).filter(function (l) { return dist[l]; }).map(function (l) { return dist[l] + ' ' + (l === 'NONE' ? 'none yet' : LVN[l]); }).join(', ')) + '">' + bars + '</div></th>';
    });
    t.innerHTML = h + '</tr></thead>';
    var tb = el('tbody');
    ss.forEach(function (s2) {
      var row = '<td class="omx-name"><a href="#" class="slink">' + esc(s2.name) + '</a></td>';
      outs.forEach(function (o) { var lv = s2.outcomes[o]; row += '<td class="omx-c' + (st.oSel === o ? ' sel' : '') + '" data-o="' + esc(o) + '">' + (lv ? '<span class="omx-l lvlbg-' + lv + '" title="' + esc(s2.name + ' · ' + o + ': ' + LVN[lv]) + '">' + lv + '</span>' : '<span class="omx-none" title="' + esc(s2.name + ' · ' + o + ': none yet') + '">·</span>') + '</td>'; });
      var tr = el('tr'); tr.innerHTML = row; tr.querySelector('.slink').addEventListener('click', function (e) { e.preventDefault(); openStudent(s2.name); }); tb.appendChild(tr);
    });
    t.appendChild(tb);
    var detail = el('div', 'omx-detail');
    t.addEventListener('click', function (e) { var c = e.target.closest('[data-o]'); if (!c || e.target.closest('.slink')) return; pick(c.dataset.o === st.oSel ? null : c.dataset.o, true); });
    function pick(o, scroll) {
      st.oSel = o;
      t.querySelectorAll('[data-o]').forEach(function (n) { n.classList.toggle('sel', n.dataset.o === o); });
      detail.innerHTML = '';
      if (!o) { detail.appendChild(el('p', 'small muted omx-hint', 'Click an outcome (or any level in its column) for its bands of students, reteach groups and how each student did at each level.')); return; }
      detail.appendChild(outcomePanel(o, ss)); HW.texIn && HW.texIn(detail);
      if (scroll) detail.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
    body.appendChild(wrapTbl(t));
    var foot = el('div', 'omx-foot');
    foot.appendChild(el('div', 'ig-legend', ['NONE'].concat(LV).map(function (l) { return '<span><i class="omx-sw lvlbg-' + l + '"></i>' + (l === 'NONE' ? 'None yet' : LVN[l]) + '</span>'; }).join('')));
    var csvAll = el('button', 'btn btn-small', 'Download all levels (CSV)'); csvAll.type = 'button';
    csvAll.addEventListener('click', function () { var rows = [['Student'].concat(outs)]; ss.forEach(function (s2) { rows.push([s2.name].concat(outs.map(function (o) { return s2.outcomes[o] || ''; }))); }); download(st.klass + '-outcome-levels.csv', rows); });
    foot.appendChild(csvAll); body.appendChild(foot);
    body.appendChild(detail); pick(st.oSel, false);
  }
  /* one outcome: how the class splits by level (click a band for that group of students) and each student's results
     at each level */
  function outcomePanel(o, ss) {
    var sec = el('section', 'panel omx-panel');
    var hd = el('div', 'omx-ph', '<h3><span class="omx-code">' + esc(o) + '</span> ' + esc(HW.OUTCOMES[o] || '') + '</h3>');
    var x = el('button', 'pd-x', '×'); x.type = 'button'; x.title = 'Close'; x.setAttribute('aria-label', 'Close'); x.addEventListener('click', function () { st.oSel = null; render(); }); hd.appendChild(x);
    sec.appendChild(hd);
    var dist = {}; LV.forEach(function (l) { dist[l] = []; }); dist.NONE = [];
    ss.forEach(function (s) { var lv = s.outcomes[o]; (dist[lv] || dist.NONE).push(s.name); });
    var stack = el('div', 'stack');
    ['NONE'].concat(LV).forEach(function (l) {
      if (!dist[l].length) return;
      var seg2 = el('button', 'stk lvlbg-' + l, '<b>' + dist[l].length + '</b> ' + (l === 'NONE' ? 'none yet' : LVN[l])); seg2.type = 'button'; seg2.style.flexGrow = dist[l].length;
      seg2.title = dist[l].join(', ');
      seg2.addEventListener('click', function () { var g = sec.querySelector('.group'); g.innerHTML = '<b>' + (l === 'NONE' ? 'No level yet' : LVN[l]) + ':</b> ' + dist[l].map(esc).join(', '); });
      stack.appendChild(seg2);
    });
    sec.appendChild(stack);
    sec.appendChild(el('div', 'group small', '<span class="muted">Click a band to list those students (a ready-made reteach group).</span>'));
    var t = el('table', 'tbl ogrid');
    var sub = st.rule === 'first' ? 'right first try' : st.rule === 'any' ? 'right (any way)' : 'right (incl. hints)';
    var h = '<thead><tr><th>Student</th><th>Level reached</th>'; LV.forEach(function (l) { h += '<th class="c">' + l + '<div class="th-sub">' + sub + '</div></th>'; }); t.innerHTML = h + '</tr></thead>';
    var tb = el('tbody');
    ss.forEach(function (s) {
      var lv = s.outcomes[o], row = '<td><a href="#" class="slink">' + esc(s.name) + '</a></td><td>' + (lv ? '<span class="lvl lvl-' + lv + '">' + LVN[lv] + '</span>' : '<span class="muted">—</span>') + '</td>';
      LV.forEach(function (l) { var a = s.levelAcc[o + '|' + l]; row += '<td class="c">' + (a && a.tried ? '<span class="acc" style="--a:' + (a.right / a.tried) + '" title="' + a.tried + ' tried: ' + a.first + ' first try, ' + a.hint + ' after a hint, ' + a.shown + ' after the answer was shown">' + a.right + '/' + a.tried + '</span>' : '<span class="muted">·</span>') + '</td>'; });
      var tr = el('tr'); tr.innerHTML = row; tr.querySelector('.slink').addEventListener('click', function (e) { e.preventDefault(); openStudent(s.name); }); tb.appendChild(tr);
    });
    t.appendChild(tb); sec.appendChild(wrapTbl(t));
    var csv = el('button', 'btn btn-small', 'Download ' + o + ' levels (CSV)'); csv.type = 'button';
    csv.addEventListener('click', function () { var rows = [['Student', o + ' level', 'Indicator']]; ss.forEach(function (s) { var lv = s.outcomes[o]; rows.push([s.name, lv ? LVN[lv] : '', lv || '']); }); download(st.klass + '-' + o + '-levels.csv', rows); });
    sec.appendChild(csv);
    return sec;
  }

  /* ---- Questions (item analysis) ---- */
  var CODE = {
    nonfactor: 'Listed a number that isn’t a factor', 'missing-1n': 'Left out 1 or the number itself', 'missing-partner': 'Missed the partner in a factor pair', missing: 'Some missing',
    'no-1n': 'Didn’t count 1 and the number itself', 'no-1orn': 'Left out 1 or the number itself', pairs: 'Counted factor pairs instead of factors', 'square-twice': 'Counted the square root twice',
    'said-prime': 'Called a composite number prime', 'said-composite': 'Called a prime number composite', 'proof-wrong': 'Factor pair didn’t multiply to the number',
    'picked-composite': 'Chose a composite as prime', 'picked-prime': 'Chose a prime as composite', missed: 'Missed some', one: 'Counted 1 as a prime factor', repeat: 'Listed a prime twice',
    composite: 'Kept a non-prime factor', value: 'Wrong value', lead: 'Started with the wrong number', extra: 'Product too big', self: 'Wrote the number itself', nothing: 'Blank',
    'ladder-one': 'Divided by 1 on the ladder', 'ladder-notprime': 'Divided by a non-prime on the ladder', 'ladder-nodivide': 'Divisor doesn’t divide evenly', 'ladder-notsmallest': 'Skipped a smaller prime on the ladder', 'ladder-quotient': 'Division slip on the ladder', 'ladder-shown': 'Asked to be shown a ladder step',
    'tree-splitprime': 'Tried to split a prime', 'tree-one': 'Used a factor pair with 1', 'tree-product': 'Factor pair didn’t multiply to the number', 'tree-circlecomposite': 'Circled a composite as prime', 'tree-shown': 'Asked to be shown a tree step',
    'not-consecutive': 'Pair not 2 apart', 'not-prime': 'Pair included a non-prime', range: 'Pair outside the range', plus1: 'Included 1 in the sum', 'no-r': 'Forgot to add the exponent', power: 'Added q^r instead of r', off: 'Miscounted the repeated prime',
    'triple-579': 'Used 5, 7, 9 (9 isn’t prime)', 'triple-135': 'Used 1, 3, 5 (1 isn’t prime)', 'triple-other': 'Used a triplet with a composite', 'not-smallest': 'Right count, not the smallest number', 'no-plus1': 'Forgot +1 on the exponents', added: 'Added instead of multiplied',
    seven: 'Left out the 7', not3: 'Number without exactly 3 factors', 'even-count': 'Number with an even factor count', 'not-largest': 'A prime factor, not the largest'
  };
  function codeLabel(c) { var X = HW.CODES || {}; if (X[c]) return X[c]; if (/^mc-/.test(c)) return 'Chose a wrong option'; return CODE[c] || c; }
  function renderQuestions(body) {
    var ls2 = builtLessons(), lesson = HW.lessons[st.lesson] || ls2[0]; if (!lesson) return;
    var bar = el('div', 'opt-row');
    var sel = el('select', 'class-pick'); sel.setAttribute('aria-label', 'Lesson');
    unitsBuilt().forEach(function (x) { // grouped by unit, so it is clear which unit a lesson belongs to
      var g = document.createElement('optgroup'); g.label = 'Unit ' + x.u.unit + ' · ' + x.u.title;
      x.ls.forEach(function (l) { var o = el('option', '', 'U' + x.u.unit + ' · Lesson ' + esc(l.num) + ': ' + esc(l.title)); o.value = l.id; if (l.id === lesson.id) o.selected = true; g.appendChild(o); });
      sel.appendChild(g);
    });
    sel.addEventListener('change', function () { st.lesson = sel.value; render(); }); bar.appendChild(scopeSeg()); bar.appendChild(sel);
    bar.appendChild(el('span', 'small muted', 'First try = right with no wrong answers or step mistakes. Click a row for the common errors and wrong answers.'));
    body.appendChild(bar);
    var d = derive(), recs = {};
    Object.keys(d.items).forEach(function (k) { var r = d.items[k]; if (r.lesson !== lesson.id) return; if (st.scope === 'class' && r.correctAt && !r.correctIn) return; (recs[r.id] = recs[r.id] || []).push(r); });
    var secs = {}; st.D.progress.forEach(function (p) { if (p.lesson !== lesson.id) return; Object.keys(p.items || {}).forEach(function (id) { var x = p.items[id]; if (x[0] === 'done') { (secs[id] = secs[id] || []).push(x[3]); } }); });
    var t = el('table', 'tbl items');
    t.innerHTML = '<thead><tr><th>Question</th><th>Level</th><th>Tried</th><th>Done</th><th>First try</th><th>Needed a hint</th><th>Answer shown</th><th>Median time</th><th>Most common error</th></tr></thead>';
    var tb = el('tbody');
    lesson.items.forEach(function (it) {
      var rs = recs[it.id] || [], tried = rs.length, done = rs.filter(function (r) { return r.correctAt; }), first = done.filter(function (r) { return r.credit === 'first'; }).length, hint = done.filter(function (r) { return r.credit === 'hint'; }).length, shown = rs.filter(function (r) { return r.credit === 'shown' || (!r.correctAt && r.errors >= 3); }).length;
      var codes = {}; rs.forEach(function (r) { r.codes.forEach(function (c) { codes[c] = (codes[c] || 0) + 1; }); });
      var top3 = Object.keys(codes).sort(function (a, b) { return codes[b] - codes[a]; });
      var tm = (secs[it.id] || []).sort(function (a, b) { return a - b; }), med = tm.length ? tm[Math.floor(tm.length / 2)] : 0;
      var fr = done.length ? first / done.length : null;
      var tr = el('tr', 'irow' + (it.extra ? ' extra' : ''));
      tr.innerHTML = '<td><b>' + esc(it.label) + '</b></td><td><span class="lvl lvl-' + it.level + '">' + it.level + '</span></td><td>' + tried + '</td><td>' + done.length + '</td>' +
        '<td>' + (fr == null ? '—' : '<span class="acc" style="--a:' + fr + '">' + pct(first, done.length) + '</span>') + '</td><td>' + (done.length ? pct(hint, done.length) : '—') + '</td><td>' + (shown ? '<span class="warnnum">' + shown + '</span>' : '0') + '</td><td>' + (med ? dur(med) : '—') + '</td>' +
        '<td>' + (top3.length ? esc(codeLabel(top3[0])) + ' <span class="muted">×' + codes[top3[0]] + '</span>' : '<span class="muted">—</span>') + '</td>';
      tr.addEventListener('click', function () {
        var nx = tr.nextSibling; if (nx && nx.classList && nx.classList.contains('detail')) { nx.remove(); return; }
        var dr = el('tr', 'detail'), td = el('td'); td.colSpan = 9;
        var answers = {}; rs.forEach(function (r) { r.answers.forEach(function (a) { answers[a] = (answers[a] || 0) + 1; }); });
        var topA = Object.keys(answers).sort(function (a, b) { return answers[b] - answers[a]; }).slice(0, 8);
        td.innerHTML = '<div class="detail-grid"><div><div class="dlabel">Errors (hint triggered)</div>' + (top3.length ? '<ul>' + top3.slice(0, 8).map(function (c) { return '<li>' + esc(codeLabel(c)) + ' <span class="muted">×' + codes[c] + '</span></li>'; }).join('') + '</ul>' : '<p class="muted">None yet.</p>') + '</div>' +
          '<div><div class="dlabel">Wrong answers typed</div>' + (topA.length ? '<ul>' + topA.map(function (a) { return '<li><code>' + esc(a) + '</code> <span class="muted">×' + answers[a] + '</span></li>'; }).join('') + '</ul>' : '<p class="muted">None yet.</p>') + '</div>' +
          '<div><div class="dlabel">Still working / stuck</div>' + (rs.filter(function (r) { return !r.correctAt; }).map(function (r) { return esc(short(r.name)) + ' <span class="muted">(' + r.errors + ' wrong)</span>'; }).join(', ') || '<span class="muted">Nobody.</span>') + '</div></div>';
        dr.appendChild(td); tr.parentNode.insertBefore(dr, tr.nextSibling);
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb); body.appendChild(wrapTbl(t));
  }

  /* ---- Student ---- */
  function openStudent(name) { st.student = name; st.tab = 'student'; ls('hw:ttab', 'student'); st.sdata = null; render(); }
  function renderStudent(body) {
    var ss = students();
    var bar = el('div', 'opt-row'), sel = el('select', 'class-pick');
    sel.appendChild(el('option', '', 'Choose a student…'));
    ss.forEach(function (s) { var o = el('option', '', esc(s.name)); o.value = s.name; if (s.name === st.student) o.selected = true; sel.appendChild(o); });
    sel.addEventListener('change', function () { openStudent(sel.value); }); bar.appendChild(sel); bar.appendChild(scopeSeg()); body.appendChild(bar);
    if (!st.student) { // pick from the class list (a name on any other tab opens it too)
      var live = st.D.live || {}, now = st.D.liveNow || st.D.now || Date.now(), grid = el('div', 'pick-grid');
      ss.forEach(function (s2) {
        var lv = liveState(live[s2.name], now), b = el('button', 'pick-s', '<span class="dot ' + lv.k + '"></span><span class="pick-n">' + esc(s2.name) + '</span><span class="pick-m">' + (s2.answers ? pct(s2.right, s2.answers) + ' right · ' + dur(st.scope === 'class' ? s2.secsIn : s2.secs) : 'no work yet') + '</span>');
        b.type = 'button'; b.title = lv.t; b.addEventListener('click', function () { openStudent(s2.name); }); grid.appendChild(b);
      });
      body.appendChild(el('p', 'small muted', 'Pick a student for their full record: outcome levels, every lesson question by question, time worked and every answer. A name on any other tab opens it too.'));
      body.appendChild(grid); return;
    }
    var s = derive().stu[st.student]; if (!s) return;
    var tiles = el('div', 'tiles');
    function tile(k, v, sub) { tiles.appendChild(el('div', 'tile', '<div class="tk">' + k + '</div><div class="tv">' + v + '</div>' + (sub ? '<div class="ts">' + sub + '</div>' : ''))); }
    var lessonsList = builtLessons();
    var reqTot = 0, reqDone = 0; lessonsList.forEach(function (l) { reqTot += l.required.length; reqDone += s.lessons[l.id] ? s.lessons[l.id].done : 0; });
    tile('Required done', reqDone + ' / ' + reqTot, st.scope === 'class' ? 'in class' : 'all work');
    tile('Right answers', s.answers ? pct(s.right, s.answers) : '—', s.answers + ' answers checked');
    tile('Time worked', dur(s.secsIn), 'in class · ' + dur(s.secs) + ' in all');
    tile('Left the page', s.leaves, s.leavesIn + ' during class');
    tile('Answers shown', s.reveals, 'after 3 wrong tries');
    tile('Last seen', s.roster && s.roster.lastSeen ? ago(s.roster.lastSeen) : 'never', s.roster ? (s.roster.devices + ' device' + (s.roster.devices === 1 ? '' : 's')) : '');
    body.appendChild(tiles);
    // outcomes
    var oc = el('div', 'panel'); oc.appendChild(el('h3', '', 'Outcome levels'));
    var orow = el('div', 'ochips');
    outcomesBuilt().forEach(function (o) { var lv = s.outcomes[o]; orow.appendChild(el('div', 'ochip', '<b>' + o + '</b> ' + (lv ? '<span class="lvl lvl-' + lv + '">' + LVN[lv] + '</span>' : '<span class="muted">none yet</span>'))); });
    oc.appendChild(orow); body.appendChild(oc);
    // units: a heading with the unit's progress that opens to its lessons (what is open is kept in st.sOpen)
    st.sOpen = st.sOpen || (function () { try { return JSON.parse(ls('hw:tsopen') || '{}'); } catch (e) { return {}; } })();
    var uw = el('div', 'su-list');
    var allBtn = el('div', 'su-tools'), any = unitsBuilt().some(function (x) { return st.sOpen[x.u.unit]; });
    var tog = el('button', 'btn btn-small', any ? 'Collapse all' : 'Expand all'); tog.type = 'button';
    tog.addEventListener('click', function () { var open = !unitsBuilt().some(function (x) { return st.sOpen[x.u.unit]; }); unitsBuilt().forEach(function (x) { st.sOpen[x.u.unit] = open; }); ls('hw:tsopen', JSON.stringify(st.sOpen)); render(); });
    allBtn.appendChild(el('h3', '', 'Lessons by unit')); allBtn.appendChild(tog); uw.appendChild(allBtn);
    unitsBuilt().forEach(function (x) {
      var u = unitSum(x.ls, s), open = !!st.sOpen[x.u.unit], sec = el('section', 'panel su' + (open ? ' open' : '')); if (HW.unitStyle) sec.setAttribute('style', HW.unitStyle(x.u.unit));
      var hd = el('button', 'su-head'); hd.type = 'button'; hd.setAttribute('aria-expanded', open ? 'true' : 'false');
      hd.innerHTML = '<span class="su-chev" aria-hidden="true">▸</span><span class="su-t"><b>Unit ' + x.u.unit + ' · ' + esc(x.u.title) + '</b> <span class="muted small">' + esc(x.u.outcomes) + ' · ' + x.ls.length + ' lesson' + (x.ls.length === 1 ? '' : 's') + '</span></span><span class="su-bar">' + unitBar(u) + '</span><span class="su-n">' + counts(u) + ' required</span>';
      var bd = el('div', 'su-body');
      hd.addEventListener('click', function () { var o = !sec.classList.contains('open'); sec.classList.toggle('open', o); hd.setAttribute('aria-expanded', o ? 'true' : 'false'); st.sOpen[x.u.unit] = o; ls('hw:tsopen', JSON.stringify(st.sOpen)); });
      x.ls.forEach(function (l) {
        var r = s.lessons[l.id], p = el('div', 'sl');
        p.appendChild(el('div', 'sl-h', '<b>Lesson ' + esc(l.num) + ': ' + esc(l.title) + '</b><span class="pnum">' + (r ? r.done : 0) + '/' + l.required.length + ' required' + (r && r.extra ? ' · +' + r.extra + ' extra' : '') + '</span>'));
        p.appendChild(el('div', '', miniBar(l, r)));
        p.appendChild(itemGrid(l, r)); bd.appendChild(p);
      });
      bd.appendChild(igLegend());
      sec.appendChild(hd); sec.appendChild(bd); uw.appendChild(sec);
    });
    body.appendChild(uw);
    // time per day
    var days = {}; st.D.days.forEach(function (d) { if (d[1] !== s.name) return; var x = days[d[0]] || (days[d[0]] = [0, 0]); x[0] += Number(d[3]) || 0; x[1] += Number(d[4]) || 0; });
    var dk = Object.keys(days).sort().slice(-21);
    if (dk.length) {
      var tp = el('div', 'panel'); tp.appendChild(el('h3', '', 'Time worked by day <span class="small muted">(last 3 weeks · dark = in class)</span>'));
      var mx = Math.max.apply(null, dk.map(function (k) { return days[k][0]; })) || 1, ch = el('div', 'daychart');
      dk.forEach(function (k) { var v = days[k]; ch.appendChild(el('div', 'dc', '<div class="dcb" style="height:' + (100 * v[0] / mx) + '%"><div class="dci" style="height:' + (v[0] ? 100 * v[1] / v[0] : 0) + '%"></div></div><div class="dcl">' + k.slice(5) + '</div><div class="dcv">' + dur(v[0]) + '</div>')); });
      tp.appendChild(ch); body.appendChild(tp);
    }
    // attempts (loaded on demand)
    var ap = el('div', 'panel'); ap.appendChild(el('h3', '', 'Every answer'));
    var list = el('div', 'alist', '<div class="loading small">Loading…</div>'); ap.appendChild(list); body.appendChild(ap);
    var go = function (d) {
      if (!d || !d.ok) { list.innerHTML = '<p class="muted">Couldn’t load.</p>'; return; }
      var rows = d.attempts.slice().sort(function (a, b) { return b[0] - a[0]; }), evs = d.events.slice().sort(function (a, b) { return b[0] - a[0]; });
      var merged = rows.map(function (a) { return { t: a[0], a: a }; }).concat(evs.filter(function (e) { return e[3] !== 'open'; }).map(function (e) { return { t: e[0], e: e }; })).sort(function (x, y) { return y.t - x.t; });
      var showN = 60;
      function draw() {
        list.innerHTML = '';
        var t = el('table', 'tbl att'); t.innerHTML = '<thead><tr><th>When</th><th>Question</th><th>Prompt</th><th>Answer</th><th>Result</th><th></th></tr></thead>';
        var tb = el('tbody');
        merged.slice(0, showN).forEach(function (m) {
          var tr = el('tr');
          if (m.e) { var e = m.e; tr.className = 'ev'; tr.innerHTML = '<td>' + when(e[0]) + '</td><td>' + esc(lbl(e[1], e[2])) + '</td><td colspan="3" class="muted">' + ({ leave: 'Left the page' + (e[4] ? ' for ' + e[4] + ' s' : '') + ' — new numbers', reveal: 'Answer shown after 3 tries', newversion: 'Started a new version', away: 'Switched away briefly (' + (e[4] || 0) + ' s)' }[e[3]] || esc(e[3])) + '</td><td>' + (e[5] ? '' : '<span class="tag">outside class</span>') + '</td>'; }
          else { var a = m.a, v = a[8]; tr.className = 'v-' + v; tr.innerHTML = '<td>' + when(a[0]) + '</td><td>' + esc(a[3] || a[2]) + (a[6] ? ' <span class="tag">practice</span>' : '') + '</td><td class="pr">' + esc(a[12]) + '</td><td><code>' + esc(a[11]) + '</code></td><td>' + verdictLabel(v, a[9]) + '</td><td>' + (a[13] ? '' : '<span class="tag">outside class</span>') + '</td>'; }
          tb.appendChild(tr);
        });
        t.appendChild(tb); list.appendChild(wrapTbl(t));
        if (merged.length > showN) { var more = el('button', 'btn btn-small', 'Show more'); more.type = 'button'; more.addEventListener('click', function () { showN += 100; draw(); }); list.appendChild(more); }
        if (!merged.length) list.innerHTML = '<p class="muted">No answers yet.</p>';
      }
      draw();
    };
    if (st.sdata && st.sdata.name === s.name) go(st.sdata.d);
    else api('student', { 'class': st.klass, name: s.name }).then(function (d) { st.sdata = { name: s.name, d: d }; if (st.student === s.name && st.tab === 'student') go(d); }).catch(function () { list.innerHTML = '<p class="muted">Couldn’t load.</p>'; });
  }
  function lbl(lesson, item) { var l = HW.lessons[lesson]; var it = l && l.byId[item]; return (l ? 'L' + l.num + ' ' : '') + (it ? it.label : item); }
  function when(ms) { var d = new Date(ms); return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); }
  function verdictLabel(v, code) { if (v === 'correct') return '<span class="vd ok">Right</span>'; if (v === 'wrong') return '<span class="vd bad">Wrong</span>' + (code ? ' <span class="muted small">' + esc(codeLabel(code)) + '</span>' : ''); if (v === 'step') return '<span class="vd step">Step mistake</span> <span class="muted small">' + esc(codeLabel(code)) + '</span>'; if (v === 'form') return '<span class="vd form">Format nudge</span>'; return esc(v); }

  /* ---- Settings ---- */
  function renderSettings(body) {
    var c = st.D && st.D['class'];
    if (c && isDemo()) {
      var pd = el('div', 'panel'); pd.appendChild(el('h3', '', esc(c.label)));
      pd.appendChild(el('p', '', 'The demo class is made up so you can see how the ledger looks with a class in it: eleven students from strong to struggling, one who does a lot at home, one who rarely works and one who never signed in. Their work follows the real lessons (Unit 1 done, Unit 2 up to Lesson 3 today), with the questions’ real numbers and the typical mistakes the checkers recognize.'));
      pd.appendChild(el('p', 'small muted', 'It’s built in this browser and never touches your spreadsheet. Under Exit slips and Tests it has a marked Unit 1 Test and a released exit slip; launch any test to it and the made-up students write it on a clock (one leaves and gets locked) so you can try the live monitor, unlocking, closing and marking. Reload the page to start the demo over.'));
      var hd = el('button', 'btn btn-small', 'Hide the demo class'); hd.type = 'button'; hd.addEventListener('click', function () { ls('hw:nodemo', '1'); st.klass = ''; st.D = null; loadClasses(); }); pd.appendChild(hd);
      body.appendChild(pd); c = null;
    }
    if (c) {
      var link = siteUrl() + '?class=' + encodeURIComponent(c.code);
      var p1 = el('div', 'panel'); p1.appendChild(el('h3', '', 'Class link for ' + esc(c.label)));
      p1.innerHTML += '<p class="small muted">Students open this link (or scan the code), pick their name, and make a 4-digit PIN the first time.</p>';
      var row = el('div', 'linkrow'); var inp = el('input', 'field'); inp.readOnly = true; inp.value = link; row.appendChild(inp);
      var cp = el('button', 'btn', 'Copy'); cp.type = 'button'; cp.addEventListener('click', function () { inp.select(); try { navigator.clipboard.writeText(link); cp.textContent = 'Copied'; } catch (e) { document.execCommand('copy'); } }); row.appendChild(cp);
      var qb = el('button', 'btn', 'Show QR code'); qb.type = 'button'; row.appendChild(qb); p1.appendChild(row);
      var qr = el('div', 'qr hidden'); p1.appendChild(qr);
      qb.addEventListener('click', function () { qr.classList.toggle('hidden'); qr.innerHTML = ''; if (!qr.classList.contains('hidden')) { if (root.QRCode) { new root.QRCode(qr, { text: link, width: 320, height: 320, correctLevel: root.QRCode.CorrectLevel.M }); qr.appendChild(el('div', 'qr-cap', esc(c.label) + ' · class code <b>' + esc(c.code) + '</b>')); } else qr.textContent = 'QR library didn’t load.'; } });
      body.appendChild(p1);

      var p2 = el('div', 'panel'); p2.appendChild(el('h3', '', 'Class time'));
      p2.appendChild(el('p', 'small muted', 'Work counts as “in class” only during this block on the bell schedule (Mon/Wed Day 1, Tue/Thu Day 2, Friday short periods). With no block, everything counts as in class.'));
      var bsel = el('select', 'class-pick'); ['', 'A', 'B', 'C', 'D'].forEach(function (b) { var o = el('option', '', b ? 'Block ' + b : 'No block (everything counts)'); o.value = b; if ((c.block || '') === b) o.selected = true; bsel.appendChild(o); });
      bsel.addEventListener('change', function () { api('setblock', { 'class': c.code, block: bsel.value }).then(function () { flash(p2, 'Saved. New work is tagged with this block from now on.'); loadClasses(); }); });
      p2.appendChild(bsel);
      var nsn = (st.noSchool || []).length, nsr = el('p', 'small', 'No-school days: <b>' + nsn + '</b> set. They’re picked on a month view in the <b>Calendar</b> tab (Days off…), and they apply to every class: lessons move along and in-class time doesn’t count on those days. ');
      var nsb = el('button', 'btn btn-small', 'Open the calendar'); nsb.type = 'button'; nsb.addEventListener('click', function () { st.tab = 'calendar'; ls('hw:ttab', 'calendar'); render(); }); nsr.appendChild(nsb); p2.appendChild(nsr);
      body.appendChild(p2);
      body.appendChild(lessonsPanel(c));
      if (st.bell) body.appendChild(bellPanel());

      body.appendChild(studentsPanel(c));
    }
    var p4 = el('div', 'panel'); p4.appendChild(el('h3', '', 'New class'));
    p4.appendChild(el('p', 'small muted', 'A class code is what students type (or what the class link carries). Use something short like <code>10c-b</code>. Paste the class list from PowerSchool — one name per line.'));
    var g = el('div', 'grid2');
    var code = el('input', 'field'); code.placeholder = 'Class code, e.g. 10c-b'; var label = el('input', 'field'); label.placeholder = 'Name shown, e.g. Math 10C · Block B';
    g.appendChild(code); g.appendChild(label); p4.appendChild(g);
    var tplRow = el('div', 'ps-up'), tpl = null;
    tplRow.appendChild(fileButton('Fill from a PowerSchool scores template…', function (text, fname) {
      var t = HW.PS.parse(text); if (t.error) { flash(p4, t.error); return; }
      tpl = t; names.value = t.students.map(function (x) { return x.name; }).join('\n');
      if (!label.value.trim() && t.course) label.value = t.course;
      tplNote.innerHTML = '<b>' + t.students.length + ' students</b> from <i>' + esc(fname) + '</i>' + (t.course ? ' (' + esc(t.course) + ')' : '') + '. Their PowerSchool student numbers are saved with the class list.';
    }));
    var tplNote = el('span', 'small muted', 'In PowerSchool, export the scores template of any assignment in this class (a .csv file), then pick it here.'); tplRow.appendChild(tplNote); p4.appendChild(tplRow);
    var names = el('textarea', 'field'); names.rows = 8; names.placeholder = 'Jordan Smith\nPriya Patel\n…'; p4.appendChild(names);
    var mk = el('button', 'btn btn-primary', 'Create class'); mk.type = 'button';
    mk.addEventListener('click', function () {
      if (!code.value.trim()) { code.focus(); return; }
      var q = { 'class': code.value.trim(), label: label.value.trim() || code.value.trim(), names: names.value, mode: 'add' };
      if (tpl) { // keep the student numbers of the names still in the box
        var byName = {}; tpl.students.forEach(function (x) { byName[x.name.toLowerCase()] = x.num; });
        q.students = JSON.stringify(names.value.split(/\r?\n|;/).map(function (n) { n = n.trim(); return n ? { n: n, num: byName[n.toLowerCase()] || '' } : null; }).filter(Boolean));
        q.ps = JSON.stringify(psInfo(tpl));
      }
      api('setroster', q).then(function (d) { if (!d.ok) { flash(p4, d.error); return; } st.klass = d['class'].code; ls('hw:tclass', st.klass); loadClasses(); });
    });
    p4.appendChild(mk); body.appendChild(p4);
    if (c) {
      var p5 = el('div', 'panel danger'); p5.appendChild(el('h3', '', 'Delete this class'));
      p5.appendChild(el('p', 'small muted', 'Removes the class code and its class list. Answers already in the spreadsheet stay there.'));
      var del = el('button', 'btn btn-small', 'Delete ' + esc(c.label)); del.type = 'button'; del.addEventListener('click', function () { if (prompt('Type the class code (' + c.code + ') to delete it.') !== c.code) return; api('delclass', { 'class': c.code }).then(function () { st.klass = ''; st.D = null; loadClasses(); }); });
      p5.appendChild(del); body.appendChild(p5);
    }
    body.appendChild(notesPanel());
    var p6 = el('div', 'panel'); p6.appendChild(el('h3', '', 'This device'));
    if (HW.DashDemo && ls('hw:nodemo') === '1') { var sd = el('button', 'btn btn-small btn-ghost', 'Show the demo class'); sd.type = 'button'; sd.style.marginRight = '8px'; sd.addEventListener('click', function () { ls('hw:nodemo', null); loadClasses(); }); p6.appendChild(sd); }
    var fk = el('button', 'btn btn-small btn-ghost', 'Forget the teacher key on this device'); fk.type = 'button'; fk.addEventListener('click', function () { ls('hw:tkey', null); st.key = ''; keyScreen(); }); p6.appendChild(fk); body.appendChild(p6);
  }
  /* ---- the class list: names, PowerSchool student numbers, pronouns (for report card comments), IPP ---- */
  var PRONOUNS = [['', '—'], ['he', 'he/him'], ['she', 'she/her'], ['they', 'they/them']];
  function psInfo(t) { return { teacher: t.teacher || '', course: t.course || '', points: t.points || '', type: t.type || '' }; }
  function fileButton(label, onText) {
    var lab = el('label', 'btn btn-small ps-file'), inp = el('input'); inp.type = 'file'; inp.accept = '.csv,text/csv,text/plain';
    lab.appendChild(document.createTextNode(label)); lab.appendChild(inp);
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      var r = new FileReader(); r.onload = function () { onText(String(r.result || ''), f.name); inp.value = ''; }; r.readAsText(f);
    });
    return lab;
  }
  /* save one student's class-list details (num / pronouns / ipp); the demo class keeps them in this browser */
  function setStudent(c, s, field, value, node) {
    var p = { 'class': c.code, name: s.name }; p[field] = value;
    return api('setstudent', p).then(function (d) {
      if (!d || !d.ok) { flash(node, (d && d.error) || 'Couldn’t save.'); return false; }
      s.num = d.num; s.pronouns = d.pronouns; s.ipp = d.ipp; st.derived = null; return true;
    }, function (e) { flash(node, e.message); return false; });
  }
  function studentsPanel(c) {
    var p3 = el('div', 'panel'); p3.appendChild(el('h3', '', 'Students in ' + esc(c.label)));
    var roster = st.D.roster.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });
    var up = el('div', 'ps-up');
    up.appendChild(fileButton('Update from a PowerSchool scores template…', function (text, fname) { var t = HW.PS.parse(text); if (t.error) { flash(p3, t.error); return; } importPreview(c, t, fname, box); }));
    var noNum = roster.filter(function (s) { return !s.num; }).length, noPro = roster.filter(function (s) { return !s.pronouns; }).length;
    up.appendChild(el('span', 'small muted', 'Adds anyone new and saves each student’s PowerSchool number (needed for the score files).' + (c.ps && c.ps.course ? ' PowerSchool class: <b>' + esc(c.ps.course) + '</b>.' : '')));
    p3.appendChild(up);
    var box = el('div', 'ps-preview'); p3.appendChild(box);
    if (roster.length && (noNum || noPro)) p3.appendChild(el('p', 'small ps-warn', [noNum ? noNum + ' without a student number' : '', noPro ? noPro + ' without pronouns (their report card comments use their name instead)' : ''].filter(Boolean).join(' · ')));
    var t = el('table', 'tbl roster-tbl'); t.innerHTML = '<thead><tr><th>Name</th><th>Student #</th><th>Pronouns</th><th title="On an individual program plan: the report card comment gets the IPP sentence">IPP</th><th>PIN</th><th>Devices</th><th>Last seen</th><th></th></tr></thead>';
    var tb = el('tbody');
    roster.forEach(function (s) {
      var tr = el('tr'); tr.innerHTML = '<td>' + esc(s.name) + '</td><td class="rs-num"></td><td class="rs-pro"></td><td class="rs-ipp"></td><td>' + (s.pin ? 'set' : '<span class="muted">not yet</span>') + '</td><td>' + s.devices + '</td><td>' + (s.lastSeen ? ago(s.lastSeen) : 'never') + '</td><td class="acts"></td>';
      var num = el('input', 'field rs-numin'); num.value = s.num || ''; num.inputMode = 'numeric'; num.placeholder = '—'; num.setAttribute('aria-label', 'Student number for ' + s.name);
      num.addEventListener('change', function () { setStudent(c, s, 'num', num.value.trim(), p3).then(function (ok) { num.value = s.num || ''; if (ok) num.classList.add('saved'); }); });
      tr.querySelector('.rs-num').appendChild(num);
      tr.querySelector('.rs-pro').appendChild(pronounSelect(c, s, p3));
      tr.querySelector('.rs-ipp').appendChild(ippBox(c, s, p3));
      var acts = tr.querySelector('.acts');
      if (s.pin) { var rp = el('button', 'btn btn-small', 'Reset PIN'); rp.type = 'button'; rp.addEventListener('click', function () { if (!confirm('Reset ' + s.name + '’s PIN? They’ll make a new one next time they sign in (their work is kept).')) return; api('resetpin', { 'class': c.code, name: s.name }).then(function () { loadDash(); }); }); acts.appendChild(rp); }
      var rm = el('button', 'btn btn-small btn-ghost', 'Remove'); rm.type = 'button'; rm.addEventListener('click', function () { if (!confirm('Remove ' + s.name + ' from the class list? Their answers stay in the spreadsheet.')) return; api('removestudent', { 'class': c.code, name: s.name }).then(function () { loadDash(); }); }); acts.appendChild(rm);
      tb.appendChild(tr);
    });
    t.appendChild(tb); p3.appendChild(wrapTbl(t));
    p3.appendChild(el('div', 'lbl', 'Add students (one name per line — first and last name)'));
    var add = el('textarea', 'field'); add.rows = 4; p3.appendChild(add);
    var ab = el('button', 'btn btn-small', 'Add to the class'); ab.type = 'button'; ab.addEventListener('click', function () { if (!add.value.trim()) return; api('setroster', { 'class': c.code, names: add.value, mode: 'add' }).then(function (d) { flash(p3, 'Added ' + d.added + '.'); loadDash(); loadClasses(); }); }); p3.appendChild(ab);
    return p3;
  }
  function pronounSelect(c, s, node) {
    var sel = el('select', 'field rs-prosel'); sel.setAttribute('aria-label', 'Pronouns for ' + s.name);
    PRONOUNS.forEach(function (x) { var o = new Option(x[1], x[0]); if ((s.pronouns || '') === x[0]) o.selected = true; sel.appendChild(o); });
    sel.addEventListener('change', function () { var v = sel.value; setStudent(c, s, 'pronouns', v, node).then(function (ok) { sel.value = s.pronouns || ''; if (ok && sel.onsaved) sel.onsaved(); }); });
    return sel;
  }
  function ippBox(c, s, node) {
    var lab = el('label', 'rs-ippl'), cb = el('input'); cb.type = 'checkbox'; cb.checked = !!s.ipp; cb.setAttribute('aria-label', s.name + ' is on an IPP');
    cb.addEventListener('change', function () { setStudent(c, s, 'ipp', cb.checked ? '1' : '0', node).then(function (ok) { cb.checked = !!s.ipp; if (ok && cb.onsaved) cb.onsaved(); }); });
    lab.appendChild(cb); return lab;
  }
  /* what a template would change, before anything is saved */
  function importPreview(c, t, fname, box) {
    var m = HW.PS.match(t.students, st.D.roster), add = m.rows.filter(function (r) { return r.how === 'new'; }), close = m.rows.filter(function (r) { return r.how === 'close'; });
    var numbered = m.rows.filter(function (r) { return r.as && r.num && !st.D.roster.some(function (s) { return s.name === r.as && String(s.num) === r.num; }); });
    box.innerHTML = '';
    var h = '<p><b>' + t.students.length + ' students</b> in <i>' + esc(fname) + '</i>' + (t.course ? ' · ' + esc(t.course) : '') + (t.assignment ? ' · ' + esc(t.assignment) : '') + '</p><ul class="ps-sum">';
    h += '<li>' + (m.rows.length - add.length) + ' already on the class list' + (numbered.length ? ' (' + numbered.length + ' get their student number)' : '') + '</li>';
    if (close.length) h += '<li>Matched by a slightly different name: ' + close.map(function (r) { return esc(r.name) + ' → <b>' + esc(r.as) + '</b>'; }).join(', ') + '</li>';
    h += '<li>' + (add.length ? add.length + ' new, added: ' + add.map(function (r) { return esc(r.name); }).join(', ') : 'No one new') + '</li>';
    if (m.missing.length) h += '<li>On the class list but not in the file: ' + m.missing.map(esc).join(', ') + '</li>';
    box.innerHTML = h + '</ul>';
    var rmL = null;
    if (m.missing.length) { rmL = el('label', 'tt-inline'); var rc = el('input'); rc.type = 'checkbox'; rmL.appendChild(rc); rmL.appendChild(document.createTextNode(' Also remove the ' + m.missing.length + ' not in the file (their work stays in the spreadsheet)')); box.appendChild(rmL); }
    var row = el('div', 'ps-acts');
    var go = el('button', 'btn btn-primary btn-small', 'Update the class list'); go.type = 'button';
    go.addEventListener('click', function () {
      go.disabled = true;
      api('setroster', { 'class': c.code, students: JSON.stringify(m.rows.map(function (r) { return { n: r.name, num: r.num, as: r.as }; })), ps: JSON.stringify(psInfo(t)), mode: rmL && rmL.querySelector('input').checked ? 'replace' : 'add' }).then(function (d) {
        if (!d.ok) { go.disabled = false; flash(box, d.error); return; }
        box.innerHTML = ''; flash(box, 'Class list updated: ' + d.added + ' added' + (d.numbered ? ', ' + d.numbered + ' student numbers saved' : '') + (d.removed ? ', ' + d.removed + ' removed' : '') + '.');
        loadDash(); loadClasses();
      }, function (e) { go.disabled = false; flash(box, e.message); });
    });
    var no = el('button', 'btn btn-small btn-ghost', 'Cancel'); no.type = 'button'; no.addEventListener('click', function () { box.innerHTML = ''; });
    row.appendChild(go); row.appendChild(no); box.appendChild(row);
  }
  /* Class times: the bell schedule (start and end of each block on each kind of day), for every class. It decides what
     counts as in class and when a test "until the end of class" ends. Saved in the ledger (setbell). */
  function bellPanel() {
    var DAYS = [['day1', 'Mon / Wed', 'Day 1'], ['day2', 'Tue / Thu', 'Day 2'], ['fri', 'Friday', 'short periods']];
    var p = el('div', 'panel bell-panel'); p.appendChild(el('h3', '', 'Class times'));
    p.appendChild(el('p', 'small muted', 'The bell schedule for every class: it decides what counts as in class, and when a test or exit slip set to “until the end of class” ends. ' + (st.bellCustom ? 'You’ve changed these from the 2026–27 schedule.' : 'These are the 2026–27 bell times.')));
    var t = el('table', 'tbl bell-tbl'), head = '<thead><tr><th>Block</th>';
    DAYS.forEach(function (d) { head += '<th>' + d[1] + '<div class="th-sub">' + d[2] + '</div></th>'; });
    t.innerHTML = head + '</tr></thead>';
    var tb = el('tbody'), ins = {};
    ['A', 'B', 'C', 'D'].forEach(function (b) {
      var tr = el('tr'); tr.appendChild(el('td', '', '<b>Block ' + b + '</b>'));
      DAYS.forEach(function (d) {
        var row = (st.bell[d[0]] || []).filter(function (x) { return x[0] === b; })[0] || [b, '', ''], td = el('td', 'bell-cell');
        var a = el('input', 'field bell-t'), e = el('input', 'field bell-t'); a.type = e.type = 'time'; a.value = row[1]; e.value = row[2];
        a.setAttribute('aria-label', 'Block ' + b + ' ' + d[1] + ' start'); e.setAttribute('aria-label', 'Block ' + b + ' ' + d[1] + ' end');
        td.appendChild(a); td.appendChild(el('span', 'bell-to', '–')); td.appendChild(e); tr.appendChild(td);
        ins[b + d[0]] = [a, e];
      });
      tb.appendChild(tr);
    });
    t.appendChild(tb); p.appendChild(wrapTbl(t));
    var acts = el('div', 'bell-acts'), sv = el('button', 'btn btn-small btn-primary', 'Save class times'); sv.type = 'button';
    sv.addEventListener('click', function () {
      var out = {}, bad = '';
      DAYS.forEach(function (d) {
        out[d[0]] = ['A', 'B', 'C', 'D'].map(function (b) { var x = ins[b + d[0]]; if (!x[0].value || !x[1].value || x[0].value >= x[1].value) bad = bad || ('Block ' + b + ', ' + d[1]); return [b, x[0].value, x[1].value]; })
          .sort(function (a, b) { return a[1] < b[1] ? -1 : 1; });
      });
      if (bad) { flash(p, 'Check ' + bad + ': it needs a start time before its end time.'); return; }
      sv.disabled = true;
      api('setbell', { bell: JSON.stringify(out) }).then(function (d) { sv.disabled = false; if (!d.ok) { flash(p, d.error === 'unknown action' ? 'The ledger needs the new backend code (Code.gs) for this.' : 'Couldn’t save: ' + d.error); return; } st.bell = d.bell; st.bellCustom = true; flash(p, 'Saved. The new times apply from now on.'); }, function () { sv.disabled = false; flash(p, 'Couldn’t reach the ledger.'); });
    });
    acts.appendChild(sv);
    if (st.bellCustom) {
      var rs = el('button', 'btn btn-small btn-ghost', 'Go back to the 2026–27 times'); rs.type = 'button';
      rs.addEventListener('click', function () { if (!confirm('Go back to the 2026–27 bell times?')) return; api('setbell', { bell: 'reset' }).then(function (d) { if (d.ok) { st.bell = d.bell; st.bellCustom = false; render(); } }); });
      acts.appendChild(rs);
    }
    p.appendChild(acts);
    return p;
  }
  /* Lesson notes: the Pencil annotations on the lesson pages live in a separate Apps Script ("Math 10C Teaching Ink",
     lessons/backend/Code.gs) with its own teacher key (the one used to sign in on a lesson page). This clears every
     lesson's notes for every class there, plus the copies kept on this device, e.g. at the end of a semester. */
  function notesPanel() {
    var p = el('div', 'panel danger'); p.appendChild(el('h3', '', 'Lesson notes'));
    p.appendChild(el('p', 'small muted', 'Clears every annotation on every lesson page, for every class: your Pencil notes and what students see on their class links. Use it to start fresh, e.g. at the end of a semester. It can’t be undone.'));
    var lsj = function (k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
    var saved = String(lsj('ink:teacher') || '');
    var row = el('div', 'linkrow'), key = el('input', 'field'); key.type = 'password'; key.autocomplete = 'off';
    key.placeholder = saved ? 'Signed in on the lesson pages on this device' : 'Lesson-notes teacher key (the one you sign in with on a lesson page)';
    var go = el('button', 'btn btn-small', 'Clear all lesson notes…'); go.type = 'button';
    row.appendChild(key); row.appendChild(go); p.appendChild(row);
    var msg = el('p', 'small'); p.appendChild(msg);
    go.addEventListener('click', function () {
      var k = (key.value.trim() || saved).toUpperCase();
      if (!k) { msg.textContent = 'Enter the lesson-notes teacher key first.'; key.focus(); return; }
      if (prompt('This erases every annotation on every lesson page, for every class. Type CLEAR to go ahead.') !== 'CLEAR') return;
      go.disabled = true; msg.textContent = 'Clearing…';
      import('../lessons/js/config.js').then(function (m) {
        var url = String(lsj('ink:api') || (m.CONFIG && m.CONFIG.inkApi) || '').trim();
        if (!url) throw new Error('nourl');
        return fetch(url, { method: 'POST', credentials: 'omit', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ op: 'resetall', key: k }) }).then(function (r) { return r.json(); });
      }).then(function (d) {
        go.disabled = false;
        if (!d || !d.ok) throw new Error(d && d.error || 'error');
        // this device's own copies and unsent changes, so nothing old is sent back up
        var gone = 0, NS = root.HW_STORAGE_NS || ''; Object.keys(localStorage).forEach(function (raw) { if (raw.indexOf(NS) !== 0) return; var n = raw.slice(NS.length); if (/^ink:u\d+l\w+(:|$)/.test(n) || /^inkq:/.test(n)) { localStorage.removeItem(n); gone++; } }); // NS: js/ns.js keeps each course's keys apart
        msg.textContent = 'Cleared the notes on ' + d.cleared + ' lesson page' + (d.cleared === 1 ? '' : 's') + ' (all classes)' + (gone ? ', and this device’s copies' : '') + '. Lesson pages that are open now go blank within a few seconds; reload one to be sure.';
      }).catch(function (e) {
        go.disabled = false;
        var m = String(e && e.message || e);
        msg.textContent = m === 'badkey' ? 'That key wasn’t accepted. Use the key you sign in with on a lesson page (it’s in the Teaching Ink Apps Script: Project Settings → Script properties → TEACHER_KEY).'
          : m === 'unknown op' ? 'The Teaching Ink Apps Script needs the new version of lessons/backend/Code.gs first (paste it, then Deploy → Manage deployments → edit → New version).'
          : m === 'nourl' ? 'Lesson notes aren’t shared through a server yet, so there’s nothing to clear online.'
          : 'Couldn’t reach the lesson-notes server. Try again in a moment.';
      });
    });
    return p;
  }
  function siteUrl() { var u = location.href.split('#')[0].split('?')[0]; return u.replace(/teacher\/?(index\.html)?$/, ''); }
  /* Lessons: Stand Up Break cards (whiteboard stations) on or off for this class. The lesson pages read it with the class
     calendar (cal → lopts), so it applies wherever the lesson is opened with this class's block (?class=B). */
  function lessonsPanel(c) {
    var p = el('div', 'panel'); p.appendChild(el('h3', '', 'Lessons'));
    var on = !(st.lopts && st.lopts.standup === false), lab = el('label', 'lopt-row');
    var cb = el('input'); cb.type = 'checkbox'; cb.checked = on;
    lab.appendChild(cb); lab.appendChild(el('span', '', '<b>Stand Up Break!</b> questions in the lessons'));
    p.appendChild(lab);
    p.appendChild(el('p', 'small muted', 'A whiteboard-stations question partway through a lesson, with new numbers at three levels, a timer and random groups from this class list. Turn it off and those cards are left out of the lessons for ' + esc(c.label) + (c.block && String(c.label).indexOf('Block ' + c.block) < 0 ? ' (Block ' + esc(c.block) + ')' : '') + '. ' + (c.block ? '' : 'Set this class’s block above so the lessons can find it.')));
    cb.addEventListener('change', function () {
      cb.disabled = true;
      api('setlopts', { 'class': c.code, standup: cb.checked ? 1 : 0 }).then(function (d) {
        cb.disabled = false;
        if (!d || !d.ok) { cb.checked = !cb.checked; flash(p, d && d.error === 'unknown action' ? 'The ledger needs the new backend code first: paste backend/Code.gs into the Apps Script project, then Deploy → Manage deployments → edit → New version.' : 'Couldn’t save: ' + (d && d.error)); return; }
        st.lopts = d.lopts; flash(p, cb.checked ? 'Stand Up Breaks are on for this class.' : 'Stand Up Breaks are off for this class.');
      }, function () { cb.disabled = false; cb.checked = !cb.checked; flash(p, 'Couldn’t reach the ledger.'); });
    });
    return p;
  }
  function flash(node, msg) { var f = el('div', 'flash', esc(msg)); node.appendChild(f); setTimeout(function () { f.remove(); }, 3500); }
  function download(name, rows) {
    var csv = rows.map(function (r) { return r.map(function (v) { v = String(v == null ? '' : v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }).join(','); }).join('\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = name; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 100);
  }
  HW.Dash = { state: st, render: render, api: api, onWrite: function (f) { writeHooks.push(f); }, goTab: goTab, download: download, flash: flash, drawTop: function () { drawTop(); }, students: students, derive: derive, scopeSeg: scopeSeg, pronounSelect: pronounSelect, ippBox: ippBox, wrapTbl: wrapTbl, openStudent: function (n) { openStudent(n); } };
  boot();
})(window);
