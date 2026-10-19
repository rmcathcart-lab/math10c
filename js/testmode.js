/* Test mode — the student side of exit slips and tests written on the site.
 * While a student is signed in, the page asks the ledger every ~10 s whether the teacher has launched a test for the class
 * (action=tcheck). A launched test pops up over whatever page the student is on; pressing Start puts the page in full
 * screen and starts the timer. Leaving the window or tab, or leaving full screen, submits the test as it is and locks it;
 * the teacher can unlock it from the dashboard, and the student carries on with the same numbers and answers.
 * Exit slips have a pale yellow background, tests a pale orange one. Answers are saved on the device and sent to the ledger
 * every few seconds (kind:'test' POST); nothing is marked here — the teacher's dashboard marks from the saved answers,
 * and results show on the home page only after the teacher releases them. */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, esc = HW.esc, L = HW.Ledger, TC = HW.TestCore, cfg = root.HW_CONFIG || {}, URL = cfg.backend || '';
  var TM = HW.TestMode = {};
  var POLL_MS = 10000, BLUR_MS = 250, FINAL = { submitted: 1, left: 1, time: 1, ended: 1, forced: 1 };
  var T = null;            // the test on screen: { sid, def, live, items, byKey, order, rec, cur, widgets, ui }
  var lastCheck = 0, checking = false, relSeen = null, results = null, resultsAt = 0, guardUntil = 0;

  function ls(k, v) { try { if (v === undefined) return root.localStorage.getItem(k); if (v === null) root.localStorage.removeItem(k); else root.localStorage.setItem(k, v); } catch (e) { return null; } }
  function session() { return HW.App && HW.App.session ? HW.App.session() : null; }
  function skey() { var s = session(); return TC.skey(s.klass, s.name); }
  function recStoreKey(sid) { return 'hw:test:' + skey() + ':' + sid; }
  function loadRec(sid) { try { return JSON.parse(ls(recStoreKey(sid)) || 'null'); } catch (e) { return null; } }
  function saveRec() { if (T && T.rec) ls(recStoreKey(T.sid), JSON.stringify(T.rec)); }
  function deviceId() { return ls('hw:device') || ''; }
  function fsEl() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function goFull() {
    var d = document.documentElement, f = d.requestFullscreen || d.webkitRequestFullscreen;
    if (!f) return Promise.resolve(false);
    try { var p = f.call(d, { navigationUI: 'hide' }); return (p && p.then ? p : Promise.resolve()).then(function () { return true; }, function () { return false; }); } catch (e) { return Promise.resolve(false); }
  }
  function exitFull() { try { if (fsEl()) (document.exitFullscreen || document.webkitExitFullscreen).call(document); } catch (e) {} }
  function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)), m = Math.floor(s / 60); return m + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }
  function limitMs() { return T && T.def.minutes ? (T.def.minutes + (T.live ? T.live.extra || 0 : 0)) * 60000 : 0; }
  function remaining() { return limitMs() ? limitMs() - (T.rec.used || 0) : Infinity; }
  function kindName(def) { return def.kind === 'exit' ? 'Exit slip' : 'Test'; }

  /* ---------------- talking to the ledger ---------------- */
  function post(final, beacon) {
    var s = session(); if (!URL || !s || !s.token || !T) return;
    var r = T.rec, body = { kind: 'test', 'class': s.klass, name: s.name, token: s.token, device: deviceId(), session: T.sid, st: r.st, cur: T.cur, ans: r.ans,
      used: Math.round(r.used || 0), leaves: r.leaves || 0, started: r.started, unlockN: r.unlockN || 0, order: T.order, fs: !!r.fs, why: r.why || '', final: !!final };
    var txt = JSON.stringify(body); T.lastPost = Date.now(); T.dirty = false;
    if (beacon && navigator.sendBeacon) { try { if (navigator.sendBeacon(URL, new Blob([txt], { type: 'text/plain;charset=utf-8' }))) return; } catch (e) {} }
    try { fetch(URL, { method: 'POST', mode: 'no-cors', credentials: 'omit', keepalive: txt.length < 60000, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: txt }).catch(function () { if (T) T.dirty = true; }); }
    catch (e) { T.dirty = true; }
  }
  function check(full) {
    var s = session(); if (!URL || !s || !s.token || checking) return;
    checking = true; lastCheck = Date.now();
    L.get('tcheck', { 'class': s.klass, name: s.name, token: s.token, full: full ? 1 : null }, 12000).then(function (d) { checking = false; onCheck(d); }, function () { checking = false; });
  }
  TM.check = check;

  /* ---------------- what the ledger says ---------------- */
  function onCheck(d) {
    if (!d || !d.ok) return;
    if (relSeen !== null && d.rel !== relSeen) { results = null; if (document.body.classList.contains('home') && HW.App) HW.App.route(); }
    relSeen = d.rel;
    var live = d.live;
    if (!live || !live.def) { // nothing live (or the teacher closed it)
      if (T && T.rec && T.rec.st === 'writing') { finish('ended', 'The teacher closed the test.'); return; }
      if (T && T.ui && !FINAL[T.rec && T.rec.st]) closeOverlay();
      if (T && T.rec && FINAL[T.rec.st]) { T.closed = true; drawEnd(); }
      return;
    }
    if (T && T.sid !== live.id) closeOverlay();
    var me = d.me || null, rec = loadRec(live.id);
    if (!T) T = { sid: live.id, def: live.def, live: live, rec: rec, cur: 0, widgets: {} };
    T.def = live.def; T.live = live; T.me = me;
    if (!T.items) setupItems();
    if (!T.rec && me && me.st) { // this device has no record: the test was started on another device
      if (!me.ans && !T.askedFull) { T.askedFull = true; check(true); return; }
      T.rec = { st: me.st === 'writing' ? 'elsewhere' : me.st, ans: me.ans || {}, used: me.used || 0, leaves: me.leaves || 0, started: me.started, unlockN: me.unlockN || 0, submitN: 0, fs: false };
      saveRec();
    }
    var r = T.rec;
    if (r && r.st === 'writing' && !T.ui) { r.st = 'left'; r.why = 'page closed or reloaded during the test'; r.leaves = (r.leaves || 0) + 1; saveRec(); post(true); } // the page was reloaded or closed mid-test
    if (r && (FINAL[r.st] || r.st === 'elsewhere')) {
      if ((live.unlock || 0) > (r.unlockN || 0)) { // the teacher unlocked it
        if (me && me.ans && (!r.ans || Object.keys(me.ans).length > Object.keys(r.ans).length)) r.ans = me.ans;
        if (r.st === 'elsewhere' && !me) { T.askedFull = false; }
        T.unlockTo = live.unlock; drawUnlocked(); return;
      }
      if (r.st !== 'elsewhere' && (!me || me.st !== r.st)) post(true); // make sure the final copy reached the ledger
      if (r.dismissed) { if (T.ui) closeOverlay(); else T = null; return; }
      if (r.st === 'elsewhere') drawElsewhere(); else drawEnd();
      return;
    }
    if (r && r.st === 'writing') {
      if ((live.submit || 0) > (r.submitN || 0)) { r.submitN = live.submit; finish('forced', 'Your teacher submitted your test.'); return; }
      if (live.ending) { finish('ended', 'Time is up: your teacher ended the test.'); return; }
      drawTimer(); return;
    }
    // not started on this device or anywhere
    if (live.ending) { drawNotStartedEnded(); return; }
    drawPending();
  }
  function setupItems() {
    var k = skey();
    T.items = TC.items(T.def); T.byKey = {}; T.items.forEach(function (x) { T.byKey[x.key] = x; });
    T.order = TC.order(T.def, k, T.sid).filter(function (key) { return T.byKey[key]; });
    T.order.forEach(function (key) { var x = T.byKey[key]; try { x.inst = TC.instance(k, T.sid, x.lesson, x.it); } catch (e) { x.err = e; } });
  }

  /* ---------------- the overlay ---------------- */
  function overlay() {
    var o = document.getElementById('testmode');
    if (!o) { o = el('div', ''); o.id = 'testmode'; o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true'); document.body.appendChild(o); }
    o.className = 'tm tm-' + (T.def.kind === 'exit' ? 'exit' : 'test');
    document.body.classList.add('tm-on');
    T.ui = o; return o;
  }
  function closeOverlay() {
    var o = document.getElementById('testmode'); if (o) o.remove();
    document.body.classList.remove('tm-on'); exitFull();
    if (T && T.timer) clearInterval(T.timer);
    T = null;
  }
  function nameBadge() { var s = session(); return '<div class="tm-name" title="Signed in as">' + esc(s.name) + '</div>'; }
  function splash(title, bodyHtml, actions) {
    var o = overlay(); o.innerHTML = '';
    var c = el('div', 'tm-splash');
    c.innerHTML = '<div class="tm-kind">' + esc(kindName(T.def)) + '</div><h1>' + esc(T.def.title) + '</h1>' + nameBadge() + '<div class="tm-splash-body">' + bodyHtml + '</div>';
    if (title) c.insertBefore(el('div', 'tm-splash-title', title), c.firstChild);
    var acts = el('div', 'tm-acts'); (actions || []).forEach(function (a) { acts.appendChild(a); }); c.appendChild(acts);
    o.appendChild(c); return c;
  }
  function button(cls, html, fn) { var b = el('button', 'btn ' + cls, html); b.type = 'button'; b.addEventListener('click', fn); return b; }
  function rulesHtml() {
    var d = T.def, n = T.order.length;
    return '<ul class="tm-rules">' +
      '<li><b>' + n + ' question' + (n === 1 ? '' : 's') + '</b>' + (d.minutes ? ' · <b>' + (d.minutes + (T.live.extra || 0)) + ' minutes</b>' : ' · no time limit') + ' · ' + (d.calc ? 'on-screen calculator allowed' : '<b>no calculator</b>') + '</li>' +
      '<li>The test opens in <b>full screen</b>. <b>Leaving this window, switching tabs or leaving full screen submits your test as it is</b> and locks it.</li>' +
      '<li>You can move back and forth between questions and change answers until you submit. Your numbers stay the same.</li>' +
      '<li>Make sure the name above is yours.</li></ul>';
  }
  function drawPending() {
    if (T.ui && T.ui.dataset.view === 'pending') return;
    if (HW.App && location.hash.replace(/^#\/?/, '')) { location.hash = '#/'; } // leave any practice question first
    var start = button('btn-primary tm-start', 'Start ' + (T.def.kind === 'exit' ? 'exit slip' : 'test') + ' →', function () { begin(false); });
    splash('Your teacher has started ' + (T.def.kind === 'exit' ? 'an exit slip' : 'a test'), rulesHtml(), [start]);
    T.ui.dataset.view = 'pending';
    try { start.focus(); } catch (e) {}
  }
  function drawNotStartedEnded() {
    splash('', '<p>This ' + (T.def.kind === 'exit' ? 'exit slip' : 'test') + ' has ended. You didn’t start it.</p>', [button('btn-ghost', 'Close', function () { T.dismissed = true; closeOverlay(); })]);
    T.ui.dataset.view = 'ended0';
  }
  function drawUnlocked() {
    if (T.ui && T.ui.dataset.view === 'unlocked') return;
    var go = button('btn-primary tm-start', 'Continue →', function () { T.rec.unlockN = T.unlockTo; begin(true); });
    splash('Your teacher unlocked your ' + (T.def.kind === 'exit' ? 'exit slip' : 'test'), '<p>Your answers are still here and the numbers are the same.' + (limitMs() ? ' Time left: <b>' + mmss(remaining()) + '</b>.' : '') + '</p>' + rulesHtml(), [go]);
    T.ui.dataset.view = 'unlocked';
  }
  function drawElsewhere() {
    splash('Already open on another device', '<p>This ' + (T.def.kind === 'exit' ? 'exit slip' : 'test') + ' was started on another device. Ask your teacher to unlock it if you need to finish it here.</p>', []);
    T.ui.dataset.view = 'elsewhere';
  }
  var END_WHY = { submitted: 'Submitted', time: 'Time ran out — submitted', ended: 'Ended by your teacher — submitted', forced: 'Submitted by your teacher', left: 'Locked — you left the test' };
  function drawEnd() {
    var r = T.rec, n = 0; T.order.forEach(function (k) { if (r.ans[k] && r.ans[k].t) n++; });
    var left = r.st === 'left';
    var body = left
      ? '<p class="tm-locked">Your ' + (T.def.kind === 'exit' ? 'exit slip' : 'test') + ' was submitted as it was because you ' + esc(r.why || 'left the test') + '.</p><p>If this was an accident, put your hand up — your teacher can unlock it and you’ll carry on where you were.</p>'
      : '<p>' + n + ' of ' + T.order.length + ' questions answered. Your teacher will release the results later.</p>';
    var acts = [];
    var sig = r.st + '|' + !!T.closed;
    if (T.ui && T.ui.dataset.view === 'end' && T.ui.dataset.sig === sig) return;
    if (T.closed || !left) acts.push(button('btn-ghost', 'Back to practice', function () { T.rec.dismissed = true; saveRec(); closeOverlay(); }));
    splash(END_WHY[r.st] || 'Submitted', body, acts);
    T.ui.dataset.view = 'end'; T.ui.dataset.sig = sig;
    T.ui.classList.toggle('tm-is-locked', left);
    exitFull();
  }

  /* ---------------- writing ---------------- */
  function begin(resume) {
    guardUntil = Date.now() + 1500;
    goFull().then(function (ok) {
      var r = T.rec || (T.rec = { st: 'writing', ans: {}, used: 0, leaves: 0, started: Date.now(), unlockN: 0, submitN: T.live.submit || 0 });
      r.st = 'writing'; r.fs = ok; r.why = ''; if (!r.started) r.started = Date.now();
      if (!resume) r.submitN = T.live.submit || 0;
      saveRec(); guardUntil = Date.now() + 800;
      drawTest(); post(false);
    });
  }
  function drawTest() {
    var o = overlay(); o.innerHTML = ''; o.dataset.view = 'test'; o.classList.remove('tm-is-locked');
    var head = el('header', 'tm-head');
    head.innerHTML = '<div class="tm-h-left"><span class="tm-kind">' + esc(kindName(T.def)) + '</span><b class="tm-title">' + esc(T.def.title) + '</b></div>' + nameBadge();
    var right = el('div', 'tm-h-right');
    var timer = el('button', 'tm-timer', ''); timer.type = 'button'; timer.title = 'Show or hide the time left';
    timer.addEventListener('click', function () { var hide = ls('hw:tm:hidetimer') === '1'; ls('hw:tm:hidetimer', hide ? '0' : '1'); drawTimer(); });
    if (limitMs()) right.appendChild(timer);
    if (T.def.calc && HW.Calc) right.appendChild(button('btn-ghost tm-calc', '🧮 Calculator', function () { HW.Calc.toggle(); }));
    right.appendChild(button('btn-primary tm-submit', 'Submit', confirmSubmit));
    head.appendChild(right); o.appendChild(head);
    o.appendChild(el('div', 'tm-warn', '⚠ Stay on this page. <b>Leaving this window, switching tabs or leaving full screen submits your ' + (T.def.kind === 'exit' ? 'exit slip' : 'test') + ' as it is.</b>'));
    var body = el('div', 'tm-body'), nav = el('nav', 'tm-nav'), main = el('div', 'tm-main');
    nav.setAttribute('aria-label', 'Questions');
    body.appendChild(nav); body.appendChild(main); o.appendChild(body);
    T.els = { timer: timer, nav: nav, main: main };
    if (!T.def.calc && HW.Calc && HW.Calc.get) { try { HW.Calc.get().hide(); } catch (e) {} }
    T.cur = Math.min(T.cur || 0, T.order.length - 1);
    showQ(T.cur);
    if (T.timer) clearInterval(T.timer);
    T.tick = performance.now();
    T.timer = setInterval(tick, 500);
    drawTimer();
  }
  function drawNav() {
    var nav = T.els && T.els.nav; if (!nav) return; nav.innerHTML = '';
    nav.appendChild(el('div', 'tm-nav-title', 'Questions'));
    var grid = el('div', 'tm-nav-grid');
    T.order.forEach(function (k, i) {
      var a = T.rec.ans[k], b = el('button', 'tm-qn' + (i === T.cur ? ' on' : '') + (a && a.t ? ' done' : '') + (T.rec.flags && T.rec.flags[k] ? ' flag' : ''), esc(TC.label(T.def, T.byKey[k], i).replace(/[()\s]/g, '')));
      b.type = 'button'; b.title = 'Question ' + TC.label(T.def, T.byKey[k], i) + (a && a.t ? ' (answered)' : ' (not answered yet)');
      b.addEventListener('click', function () { capture(); showQ(i); });
      grid.appendChild(b);
    });
    nav.appendChild(grid);
    var n = T.order.filter(function (k) { return T.rec.ans[k] && T.rec.ans[k].t; }).length;
    nav.appendChild(el('div', 'tm-nav-count', '<b>' + n + '</b> of ' + T.order.length + ' answered'));
  }
  function showQ(i) {
    T.cur = i; var k = T.order[i], x = T.byKey[k], main = T.els.main; main.innerHTML = '';
    var card = el('article', 'qcard tm-card');
    var h = el('div', 'qhead');
    h.appendChild(el('h2', '', 'Question ' + esc(TC.label(T.def, x, i)) + ' <span class="tm-of">(' + (i + 1) + ' of ' + T.order.length + ')</span>'));
    if (T.def.levels !== false) h.appendChild(el('span', 'tm-chips', '<span class="tm-out">' + esc(x.it.outcome) + '</span><span class="lvl lvl-' + x.it.level + '">' + HW.LEVEL_NAMES[x.it.level] + '</span>'));
    card.appendChild(h);
    if (x.err || !x.inst) { card.appendChild(el('div', 'notice warn', 'This question couldn’t be shown. Tell your teacher and go on to the next one.')); main.appendChild(card); drawNav(); return; }
    var inst = x.inst;
    if (inst.stem) card.appendChild(el('div', 'qstem', HW.tex(inst.stem)));
    card.appendChild(el('div', 'qprompt', HW.tex(inst.prompt)));
    var fb = el('div', 'feedback'), w;
    try { w = HW.App.makeWidget(inst, fb); } catch (e) { w = null; }
    if (!w) { card.appendChild(el('div', 'notice warn', 'This question couldn’t be shown.')); main.appendChild(card); drawNav(); return; }
    card.appendChild(el('div', 'qinput')).appendChild(w.node);
    // the keypads' "Check" key moves on to the next question in a test
    w.node.querySelectorAll('.kpk').forEach(function (b) { if (/^Check/.test(b.textContent)) b.textContent = 'Next ↵'; });
    if (w.onEnter) w.onEnter(function () { capture(); if (T.cur < T.order.length - 1) showQ(T.cur + 1); });
    T.widget = w; T.widgetKey = k;
    var acts = el('div', 'qactions tm-acts-q');
    var prev = button('btn-ghost', '← Previous', function () { capture(); showQ(T.cur - 1); }); prev.disabled = i === 0;
    var flag = button('btn-ghost tm-flag' + (T.rec.flags && T.rec.flags[k] ? ' on' : ''), (T.rec.flags && T.rec.flags[k] ? '⚑ Flagged' : '⚐ Flag to come back to'), function () { T.rec.flags = T.rec.flags || {}; T.rec.flags[k] = !T.rec.flags[k]; saveRec(); showQ(T.cur); });
    var next = i < T.order.length - 1 ? button('btn-primary', 'Next →', function () { capture(); showQ(T.cur + 1); }) : button('btn-primary', 'Review and submit', function () { capture(); confirmSubmit(); });
    acts.appendChild(prev); acts.appendChild(flag); acts.appendChild(el('span', 'spacer')); acts.appendChild(next);
    card.appendChild(acts);
    main.appendChild(card);
    var saved = T.rec.ans[k]; if (saved && saved.r != null && w.set) { try { w.set(saved.r); } catch (e) {} }
    try { T.lastVal = JSON.stringify(w.value()); } catch (e) { T.lastVal = null; }
    if (saved && !w.set) T.lastVal = '__keep__'; // can't show the saved answer again: keep it unless the student types a new one
    drawNav();
    try { main.scrollTop = 0; } catch (e) {}
  }
  /* read the answer box into the record (called every half second and before moving) */
  function capture() {
    if (!T || !T.widget || !T.rec || T.rec.st !== 'writing') return;
    var w = T.widget, k = T.widgetKey, v; try { v = w.value(); } catch (e) { return; }
    if (T.lastVal === '__keep__' && TC.blank(v)) return;
    var js = JSON.stringify(v); if (js === T.lastVal) return;
    T.lastVal = js;
    var x = T.byKey[k], txt = '';
    if (!TC.blank(v)) { try { txt = HW.App.answerText(x.inst, v) || ''; } catch (e) { txt = ''; } if (!txt) txt = '…'; }
    if (TC.blank(v)) delete T.rec.ans[k]; else T.rec.ans[k] = { r: v, t: String(txt).slice(0, 300) };
    saveRec(); T.dirty = true; T.changedAt = Date.now();
    drawNav();
  }
  function tick() {
    if (!T || !T.rec || T.rec.st !== 'writing') return;
    var now = performance.now(), dt = Math.min(5000, now - (T.tick || now)); T.tick = now;
    T.rec.used = (T.rec.used || 0) + dt;
    capture();
    if (Math.round(T.rec.used / 500) % 10 === 0) saveRec();
    drawTimer();
    if (limitMs() && remaining() <= 0) { finish('time', 'Time ran out.'); return; }
    if ((T.dirty && Date.now() - (T.changedAt || 0) > 1500) || Date.now() - (T.lastPost || 0) > 15000) post(false);
  }
  function drawTimer() {
    var t = T && T.els && T.els.timer; if (!t || !limitMs()) return;
    var hide = ls('hw:tm:hidetimer') === '1', rem = remaining();
    t.innerHTML = hide ? '⏱ Show time' : '⏱ <b>' + mmss(rem) + '</b> left <span class="tm-hide">hide</span>';
    t.classList.toggle('low', !hide && rem < 120000);
  }
  function confirmSubmit() {
    capture();
    var missing = [], flagged = [];
    T.order.forEach(function (k, i) { if (!(T.rec.ans[k] && T.rec.ans[k].t)) missing.push(TC.label(T.def, T.byKey[k], i)); if (T.rec.flags && T.rec.flags[k]) flagged.push(TC.label(T.def, T.byKey[k], i)); });
    var m = el('div', 'tm-modal'), box = el('div', 'tm-modal-box');
    box.innerHTML = '<h2>Submit your ' + (T.def.kind === 'exit' ? 'exit slip' : 'test') + '?</h2>' +
      (missing.length ? '<p class="tm-miss">Not answered: <b>' + missing.join(', ') + '</b></p>' : '<p>Every question has an answer.</p>') +
      (flagged.length ? '<p>Flagged: <b>' + flagged.join(', ') + '</b></p>' : '') + '<p class="muted">After you submit you can’t change your answers.</p>';
    var acts = el('div', 'tm-acts');
    acts.appendChild(button('btn-ghost', 'Keep working', function () { m.remove(); }));
    acts.appendChild(button('btn-primary', 'Submit', function () { m.remove(); finish('submitted', ''); }));
    box.appendChild(acts); m.appendChild(box); T.ui.appendChild(m);
  }
  function finish(st, why, beacon) {
    if (!T || !T.rec || T.rec.st !== 'writing') return;
    capture();
    T.rec.st = st; T.rec.why = why || ''; T.rec.done = Date.now();
    if (st === 'left') T.rec.leaves = (T.rec.leaves || 0) + 1;
    saveRec();
    if (T.timer) { clearInterval(T.timer); T.timer = null; }
    post(true, beacon);
    T.widget = null;
    try { if (HW.Calc && HW.Calc.get) HW.Calc.get().hide(); } catch (e) {}
    drawEnd();
  }

  /* ---------------- leaving = submit and lock ---------------- */
  function writing() { return T && T.rec && T.rec.st === 'writing' && T.ui && T.ui.dataset.view === 'test'; }
  function left(why, beacon) { if (!writing() || Date.now() < guardUntil) return; finish('left', why, beacon); }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') left('left the page (switched tabs or windows)', true); });
  root.addEventListener('blur', function () { setTimeout(function () { if (!document.hasFocus()) left('clicked out of the test window'); }, BLUR_MS); });
  function onFs() { if (!fsEl() && writing() && T.rec.fs) left('left full screen'); }
  document.addEventListener('fullscreenchange', onFs); document.addEventListener('webkitfullscreenchange', onFs);
  root.addEventListener('pagehide', function () { left('closed or reloaded the page', true); });

  /* ---------------- polling ---------------- */
  setInterval(function () {
    var s = session(); if (!s || !s.token || !URL) return;
    if (document.visibilityState !== 'visible') return;
    var gap = T && T.rec && T.rec.st === 'writing' ? 8000 : POLL_MS;
    if (Date.now() - lastCheck >= gap) check(false);
  }, 1000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && session() && Date.now() - lastCheck > 3000) check(false); });

  /* ---------------- released results (home page) ---------------- */
  function loadResults() {
    var s = session(); if (!s || !s.token || !URL) return Promise.resolve([]);
    if (results && Date.now() - resultsAt < 120000) return Promise.resolve(results);
    return L.get('myresults', { 'class': s.klass, name: s.name, token: s.token }, 15000).then(function (d) { results = d && d.ok ? d.results : []; resultsAt = Date.now(); return results; }, function () { return results || []; });
  }
  TM.home = function (view) {
    var box = el('section', 'tm-home hidden'); view.appendChild(box);
    loadResults().then(function (list) {
      if (!list.length) return;
      box.classList.remove('hidden');
      box.innerHTML = '<h2 class="tm-home-title">Your tests and exit slips</h2>';
      var grid = el('div', 'tm-home-list');
      list.forEach(function (r) {
        var a = el('a', 'tm-res-card tm-res-' + (r.kind === 'exit' ? 'exit' : 'test'), '<span class="tm-kind">' + (r.kind === 'exit' ? 'Exit slip' : 'Test') + '</span><b>' + esc(r.title) + '</b><span class="tm-res-score">' + (r.total ? r.score + ' / ' + r.total : 'Not marked yet') + '</span><span class="muted small">' + new Date(r.launched).toLocaleDateString([], { month: 'short', day: 'numeric' }) + '</span>');
        a.href = '#/results/' + r.id; grid.appendChild(a);
      });
      box.appendChild(grid);
    });
  };
  TM.renderResults = function (view, sid) {
    document.body.className = 'home'; if (HW.App.drawTop) HW.App.drawTop('<a href="#/">All lessons</a><span class="sep">/</span>Results');
    view.innerHTML = '<div class="loading">Loading your results…</div>';
    results = null;
    loadResults().then(function (list) {
      var r = list.filter(function (x) { return x.id === sid; })[0];
      view.innerHTML = '';
      if (!r) { view.appendChild(el('div', 'panel', '<p>These results aren’t available. <a href="#/">Back</a></p>')); return; }
      var s = session(), k = TC.skey(s.klass, s.name), items = TC.items(r.def), order = TC.order(r.def, k, r.id), idx = {};
      items.forEach(function (x, i) { idx[x.key] = i; });
      var sum = TC.summary(r.def, r.marks || '');
      var head = el('div', 'tm-res-head tm-res-' + (r.kind === 'exit' ? 'exit' : 'test'));
      head.innerHTML = '<div class="tm-kind">' + (r.kind === 'exit' ? 'Exit slip' : 'Test') + '</div><h1>' + esc(r.title) + '</h1>' +
        '<div class="tm-res-big">' + (r.marks ? sum.score + ' / ' + sum.total : 'Not marked yet') + '</div>' +
        (r.marks ? '<div class="tm-res-levels">' + sum.outcomes.map(function (o) { var lv = sum.levels[o]; return '<span class="tm-out">' + esc(o) + '</span> ' + (lv ? '<span class="lvl lvl-' + lv + '">' + HW.LEVEL_NAMES[lv] + '</span>' : '<span class="muted">no level yet</span>'); }).join(' &nbsp; ') + '</div>' : '');
      view.appendChild(head);
      order.forEach(function (key, n) {
        var x = items[idx[key]]; if (!x) return;
        var inst; try { inst = TC.instance(k, r.id, x.lesson, x.it); } catch (e) { return; }
        var m = (r.marks || '').charAt(idx[key]), a = r.answers[key], ok = TC.right(m);
        var card = el('article', 'qcard tm-res-q ' + (m ? (ok ? 'ok' : 'bad') : ''));
        card.appendChild(el('div', 'qhead', '<h2>Question ' + esc(TC.label(r.def, x, n)) + '</h2><span class="tm-chips"><span class="tm-out">' + esc(x.it.outcome) + '</span><span class="lvl lvl-' + x.it.level + '">' + HW.LEVEL_NAMES[x.it.level] + '</span></span>' + (m ? '<span class="tm-mark">' + (ok ? '✓' : '✗') + '</span>' : '')));
        if (inst.stem) card.appendChild(el('div', 'qstem', HW.tex(inst.stem)));
        card.appendChild(el('div', 'qprompt', HW.tex(inst.prompt)));
        var ah = '—'; if (a && a.r != null) { try { ah = HW.App.answerHtml(inst, a.r); } catch (e) { ah = esc(a.t || ''); } }
        card.appendChild(el('div', 'answered', '<div class="ans-label">Your answer</div><div class="ans-val">' + ah + '</div>'));
        if (!ok) card.appendChild(el('div', 'feedback shown', '<div class="fb-title">Correct answer</div><div class="fb-ans">' + HW.tex(inst.answer) + '</div>'));
        card.appendChild(HW.App.solutionBlock(inst, false));
        view.appendChild(card);
      });
      view.appendChild(el('p', '', '<a class="btn btn-ghost" href="#/">← Back to all lessons</a>'));
      HW.texIn && HW.texIn(view);
    });
  };

  /* test hooks (Playwright) */
  TM._state = function () { return T; };
  TM._leave = function (why) { left(why || 'test hook'); };
})(window);
