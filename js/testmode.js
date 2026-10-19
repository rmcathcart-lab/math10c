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
  function saveRec() { if (T && T.rec && !T.preview) ls(recStoreKey(T.sid), JSON.stringify(T.rec)); }
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
  /* finished tests whose final copy the ledger hasn't confirmed yet: resent at every check until it has (even after the
     teacher closes the test), so a submit made offline still arrives */
  function pendKey() { return 'hw:tm:pend:' + skey(); }
  function pending() { try { var a = JSON.parse(ls(pendKey()) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
  function setPending(a) { ls(pendKey(), a.length ? JSON.stringify(a.slice(-10)) : null); }
  function addPending(sid) { var a = pending(); if (a.indexOf(sid) < 0) { a.push(sid); setPending(a); } }
  function dropPending(sid) { setPending(pending().filter(function (x) { return x !== sid; })); }
  function dismissed(sid) { return ls('hw:tm:dis:' + skey() + ':' + sid) === '1'; }
  function dismiss(sid) { ls('hw:tm:dis:' + skey() + ':' + sid, '1'); }
  function postRec(sid, r, order, cur, final, beacon) {
    var s = session(); if (!URL || !s || !s.token || !r) return;
    var body = { kind: 'test', 'class': s.klass, name: s.name, token: s.token, device: deviceId(), session: sid, st: r.st, cur: cur || 0, ans: r.ans,
      used: Math.round(r.used || 0), leaves: r.leaves || 0, started: r.started, unlockN: r.unlockN || 0, order: order || r.order || null, fs: !!r.fs, why: r.why || '', rev: r.rev || 0, final: !!final };
    var txt = JSON.stringify(body);
    if (beacon && navigator.sendBeacon) { try { if (navigator.sendBeacon(URL, new Blob([txt], { type: 'text/plain;charset=utf-8' }))) return; } catch (e) {} }
    try { fetch(URL, { method: 'POST', mode: 'no-cors', credentials: 'omit', keepalive: txt.length < 60000, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: txt }).catch(function () { if (T && T.sid === sid) T.dirty = true; }); }
    catch (e) { if (T && T.sid === sid) T.dirty = true; }
  }
  function post(final, beacon) { if (!T || !T.rec || T.preview) return; T.lastPost = Date.now(); T.dirty = false; postRec(T.sid, T.rec, T.order, T.cur, final, beacon); }
  function check(full) {
    var s = session(); if (!URL || !s || !s.token || checking || (T && T.preview)) return;
    checking = true; lastCheck = Date.now();
    L.get('tcheck', { 'class': s.klass, name: s.name, token: s.token, full: full ? 1 : null, pend: pending().join(',') || null }, 12000).then(function (d) { checking = false; onCheck(d, full); }, function () { checking = false; });
  }
  TM.check = check;
  function confirmFinals(conf) {
    pending().forEach(function (sid) {
      var r = loadRec(sid); if (!r || !FINAL[r.st]) { dropPending(sid); return; }
      var c = conf && conf[sid];
      if (c && c.saved && c.st === r.st && (c.rev || 0) >= (r.rev || 0)) { dropPending(sid); return; }
      postRec(sid, r, r.order, 0, true);
    });
  }

  /* ---------------- what the ledger says ---------------- */
  function onCheck(d, wasFull) {
    if (!d || !d.ok) return;
    confirmFinals(d.conf);
    if (relSeen !== null && d.rel !== relSeen) { results = null; if (!(T && T.ui) && document.body.classList.contains('home') && HW.App) HW.App.route(); }
    relSeen = d.rel;
    var live = d.live;
    if (!live || !live.def) { // nothing live (or the teacher closed it)
      if (T && T.rec && T.rec.st === 'writing') { finish('ended', 'the teacher closed the test'); return; }
      if (T && T.ui && !FINAL[T.rec && T.rec.st]) closeOverlay();
      if (T && T.rec && FINAL[T.rec.st]) { T.closed = true; drawEnd(); }
      return;
    }
    if (T && T.sid !== live.id) { if (T.rec && T.rec.st === 'writing') finish('ended', 'the teacher closed the test'); closeOverlay(); }
    var me = d.me || null, rec = loadRec(live.id);
    if (!T) T = { sid: live.id, def: live.def, live: live, rec: rec, cur: 0, widgets: {} };
    T.def = live.def; T.live = live; T.me = me;
    if (!T.items) setupItems();
    if (!T.rec && me && me.st) { // this device has no record: the test was started on another device
      if (!me.ans) { if (!wasFull) check(true); return; }
      T.rec = { st: me.st === 'writing' ? 'elsewhere' : me.st, ans: me.ans || {}, used: me.used || 0, leaves: me.leaves || 0, started: me.started, unlockN: me.unlockN || 0,
        submitN: live.submit || 0, fs: false, rev: me.rev || 0, fromServer: true };
      saveRec();
    }
    var r = T.rec;
    if (r && r.st === 'writing' && !T.ui) { r.st = 'left'; r.why = 'closed or reloaded the page during the test'; r.leaves = (r.leaves || 0) + 1; r.rev = (r.rev || 0) + 1; r.order = T.order; saveRec(); addPending(T.sid); post(true); } // the page was reloaded or closed mid-test
    if (r && (FINAL[r.st] || r.st === 'elsewhere' || r.st === 'moved')) {
      if ((live.unlock || 0) > (r.unlockN || 0)) { // the teacher unlocked it (or moved it to this device)
        if (r.fromServer || r.st === 'elsewhere' || r.st === 'moved') { // take the latest answers and time from the ledger first
          if (!wasFull || !me || !me.ans) { check(true); return; }
          r.ans = me.ans; r.used = me.used || r.used || 0; r.rev = Math.max(r.rev || 0, me.rev || 0); saveRec();
        }
        T.unlockTo = live.unlock; drawUnlocked(); return;
      }
      if (r.st === 'moved') { drawMoved(); return; }
      if (r.st === 'elsewhere' && me && FINAL[me.st]) { r.st = me.st; r.rev = me.rev || 0; saveRec(); }
      if (dismissed(T.sid)) { if (T.ui) closeOverlay(); else T = null; return; }
      if (r.st === 'elsewhere') drawElsewhere(); else drawEnd();
      return;
    }
    if (r && r.st === 'writing') {
      if ((live.unlock || 0) > (r.unlockN || 0)) { r.st = 'moved'; r.unlockN = live.unlock; saveRec(); stopTimer(); drawMoved(); return; } // the teacher moved the test to another device
      if ((live.submit || 0) > (r.submitN || 0)) { r.submitN = live.submit; finish('forced', 'your teacher submitted it'); return; }
      if (live.ending && !T.endingSoon) { T.endingSoon = true; setTimeout(function () { if (T && T.endingSoon) finish('ended', 'your teacher ended the test'); }, Math.random() * 4000); return; } // spread the class's final saves over a few seconds
      drawTimer(); return;
    }
    // not started on this device or anywhere
    if (dismissed(T.sid)) { if (T.ui) closeOverlay(); else T = null; return; }
    if (live.ending) { drawNotStartedEnded(); return; }
    drawPending();
  }
  function setupItems() {
    var k = T.skey || skey();
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
    try { if (HW.Calc && HW.Calc.get) HW.Calc.get().node.style.zIndex = '210'; } catch (e) {}
    T.ui = o; return o;
  }
  function stopTimer() { if (T && T.timer) { clearInterval(T.timer); T.timer = null; } }
  function closeOverlay() {
    var o = document.getElementById('testmode'); if (o) o.remove();
    document.body.classList.remove('tm-on'); exitFull();
    try { if (HW.Calc && HW.Calc.get) HW.Calc.get().node.style.zIndex = ''; } catch (e) {}
    stopTimer();
    T = null;
  }
  function nameBadge() { var s = T && T.preview ? { name: 'Preview student' } : session(); return '<div class="tm-name" title="Signed in as">' + esc(s ? s.name : '') + '</div>'; }
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
    splash('', '<p>This ' + (T.def.kind === 'exit' ? 'exit slip' : 'test') + ' has ended. You didn’t start it.</p>', [button('btn-ghost', 'Close', function () { dismiss(T.sid); closeOverlay(); })]);
    T.ui.dataset.view = 'ended0';
  }
  function drawUnlocked() {
    if (T.ui && T.ui.dataset.view === 'unlocked') return;
    var go = button('btn-primary tm-start', 'Continue →', function () { T.rec.unlockN = T.unlockTo; begin(true); });
    splash('Your teacher unlocked your ' + (T.def.kind === 'exit' ? 'exit slip' : 'test'), '<p>Your answers are still here and the numbers are the same.' + (limitMs() ? ' Time left: <b>' + mmss(remaining()) + '</b>.' : '') + '</p>' + rulesHtml(), [go]);
    T.ui.dataset.view = 'unlocked';
  }
  function drawMoved() {
    if (T.ui && T.ui.dataset.view === 'moved') return;
    splash('Moved to another device', '<p>Your teacher moved this ' + (T.def.kind === 'exit' ? 'exit slip' : 'test') + ' to another device. Carry on there.</p>', []);
    T.ui.dataset.view = 'moved'; exitFull();
  }
  function drawElsewhere() {
    splash('Already open on another device', '<p>This ' + (T.def.kind === 'exit' ? 'exit slip' : 'test') + ' was started on another device. Ask your teacher to unlock it if you need to finish it here.</p>', []);
    T.ui.dataset.view = 'elsewhere';
  }
  var END_WHY = { submitted: 'Submitted', time: 'Time ran out — submitted', ended: 'Ended by your teacher — submitted', forced: 'Submitted by your teacher', left: 'Locked — you left the test' };
  function drawEnd() {
    if (T.preview) return drawPreviewEnd();
    var r = T.rec, n = 0; T.order.forEach(function (k) { if (r.ans[k] && r.ans[k].t) n++; });
    var left = r.st === 'left';
    var body = left
      ? '<p class="tm-locked">Your ' + (T.def.kind === 'exit' ? 'exit slip' : 'test') + ' was submitted as it was because you ' + esc(r.why || 'left the test') + '.</p><p>If this was an accident, put your hand up — your teacher can unlock it and you’ll carry on where you were.</p>'
      : '<p>' + n + ' of ' + T.order.length + ' questions answered. Your teacher will release the results later.</p>';
    var acts = [];
    var sig = r.st + '|' + !!T.closed;
    if (T.ui && T.ui.dataset.view === 'end' && T.ui.dataset.sig === sig) return;
    if (T.closed || !left) acts.push(button('btn-ghost', 'Back to practice', function () { dismiss(T.sid); closeOverlay(); }));
    splash(END_WHY[r.st] || 'Submitted', body, acts);
    T.ui.dataset.view = 'end'; T.ui.dataset.sig = sig;
    T.ui.classList.toggle('tm-is-locked', left);
    exitFull();
  }

  /* ---------------- writing ---------------- */
  function begin(resume) {
    if (T.live && T.live.ending) { if (T.rec && FINAL[T.rec.st]) { T.rec.unlockN = T.unlockTo || T.rec.unlockN; saveRec(); drawEnd(); } else drawNotStartedEnded(); return; }
    guardUntil = Date.now() + 1500;
    goFull().then(function (ok) {
      if (ok) { try { if (navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape']).catch(function () {}); } catch (e) {} } // Esc must be held to leave full screen
      var r = T.rec || (T.rec = { st: 'writing', ans: {}, used: 0, leaves: 0, started: Date.now(), unlockN: 0, rev: 0 });
      r.st = 'writing'; r.fs = ok; r.why = ''; if (!r.started) r.started = Date.now();
      r.submitN = T.live.submit || 0; r.order = T.order; delete r.fromServer;
      if (resume) dropPending(T.sid);
      saveRec(); guardUntil = Date.now() + 800; T.endingSoon = false;
      drawTest(); post(false);
      setTimeout(recheckLeft, 900);
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
    if (T.preview) o.appendChild(previewBar());
    var body = el('div', 'tm-body'), nav = el('nav', 'tm-nav'), main = el('div', 'tm-main');
    nav.setAttribute('aria-label', 'Questions');
    body.appendChild(nav); body.appendChild(main); o.appendChild(body);
    T.els = { timer: timer, nav: nav, main: main };
    if (!T.def.calc && HW.Calc && HW.Calc.get) { try { HW.Calc.get().hide(); } catch (e) {} }
    T.pages = TC.pages(T.def, T.order); T.labels = {}; T.pages.forEach(function (pg, pi) { pg.parts.forEach(function (q) { T.labels[q.key] = q.label; q.page = pi; }); });
    T.cur = Math.max(0, Math.min(T.cur || 0, T.pages.length - 1));
    showPage(T.cur);
    if (T.timer) clearInterval(T.timer);
    T.tick = performance.now();
    T.timer = setInterval(tick, 500);
    drawTimer();
  }
  function answered(k) { return !!(T.rec.ans[k] && T.rec.ans[k].t); }
  /* question list like the practice: the number, then a pill for each part */
  function drawNav() {
    var nav = T.els && T.els.nav; if (!nav) return; nav.innerHTML = '';
    nav.appendChild(el('div', 'tm-nav-title', 'Questions'));
    var list = el('div', 'tm-nav-list');
    T.pages.forEach(function (pg, pi) {
      var row = el('div', 'tm-nrow' + (pi === T.cur ? ' on' : '') + (T.rec.flags && T.rec.flags[pg.parts[0].key] ? ' flag' : ''));
      var num = el('button', 'tm-qn' + (pg.parts.every(function (q) { return answered(q.key); }) ? ' done' : pg.parts.some(function (q) { return answered(q.key); }) ? ' some' : ''), esc(pg.num));
      num.type = 'button'; num.title = 'Question ' + pg.num;
      num.addEventListener('click', function () { capture(true); showPage(pi); });
      row.appendChild(num);
      if (pg.parts.length > 1) {
        var pills = el('span', 'tm-pills');
        pg.parts.forEach(function (q) {
          var b = el('button', 'tm-pill' + (answered(q.key) ? ' done' : ''), esc(q.sub)); b.type = 'button';
          b.title = 'Question ' + q.label + (answered(q.key) ? ' (answered)' : ' (not answered yet)');
          b.addEventListener('click', function () { capture(true); showPage(pi, q.key); });
          pills.appendChild(b);
        });
        row.appendChild(pills);
      }
      list.appendChild(row);
    });
    nav.appendChild(list);
    var n = T.order.filter(answered).length;
    nav.appendChild(el('div', 'tm-nav-count', '<b>' + n + '</b> of ' + T.order.length + ' parts answered'));
  }
  /* one page = one question, with all its parts */
  function showPage(pi, focusKey) {
    T.cur = pi; var pg = T.pages[pi], main = T.els.main; main.innerHTML = '';
    var card = el('article', 'qcard tm-card'), first = T.byKey[pg.parts[0].key];
    var h = el('div', 'qhead');
    h.appendChild(el('h2', '', 'Question ' + esc(pg.num) + ' <span class="tm-of">(' + (pi + 1) + ' of ' + T.pages.length + ')</span>'));
    card.appendChild(h);
    if (first.inst && first.inst.stem) card.appendChild(el('div', 'qstem', HW.tex(first.inst.stem)));
    T.widgets = [];
    var blocks = [];
    pg.parts.forEach(function (q, qi) {
      var x = T.byKey[q.key], part = el('section', 'tm-part' + (pg.parts.length > 1 ? ' multi' : ''));
      part.dataset.key = q.key;
      var ph = el('div', 'tm-part-head');
      if (q.sub) ph.appendChild(el('span', 'tm-sub', '(' + esc(q.sub) + ')'));
      if (T.def.levels !== false) ph.appendChild(el('span', 'tm-chips', '<span class="tm-out">' + esc(x.it.outcome) + '</span><span class="lvl lvl-' + x.it.level + '">' + HW.LEVEL_NAMES[x.it.level] + '</span>'));
      part.appendChild(ph);
      if (x.err || !x.inst) { part.appendChild(el('div', 'notice warn', 'This part couldn’t be shown. Tell your teacher and go on.')); card.appendChild(part); return; }
      var inst = x.inst;
      if (qi > 0 && inst.stem && inst.stem !== first.inst.stem) part.appendChild(el('div', 'qstem', HW.tex(inst.stem)));
      part.appendChild(el('div', 'qprompt', HW.tex(inst.prompt)));
      var w = null; try { w = HW.App.makeWidget(inst, el('div', 'feedback')); } catch (e) { w = null; }
      if (!w) { part.appendChild(el('div', 'notice warn', 'This part couldn’t be shown.')); card.appendChild(part); return; }
      part.appendChild(el('div', 'qinput')).appendChild(w.node);
      // the keypads' "Check" key moves on in a test
      w.node.querySelectorAll('.kpk').forEach(function (b) { if (/^Check/.test(b.textContent)) b.textContent = 'Next ↵'; });
      var slot = { key: q.key, w: w, lastVal: null };
      if (w.onEnter) w.onEnter(function () { capture(true); var nxt = T.widgets[T.widgets.indexOf(slot) + 1]; if (nxt) { try { nxt.w.focus(); nxt.w.node.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (e) {} } else if (T.cur < T.pages.length - 1) showPage(T.cur + 1); });
      if (T.preview) part.appendChild(previewAnswer(inst));
      T.widgets.push(slot); blocks.push(part); card.appendChild(part);
    });
    var k0 = pg.parts[0].key, flagged = T.rec.flags && T.rec.flags[k0];
    var acts = el('div', 'qactions tm-acts-q');
    var prev = button('btn-ghost', '← Previous', function () { capture(true); showPage(T.cur - 1); }); prev.disabled = pi === 0;
    var flag = button('btn-ghost tm-flag' + (flagged ? ' on' : ''), flagged ? '⚑ Flagged' : '⚐ Flag to come back to', function () { capture(true); T.rec.flags = T.rec.flags || {}; T.rec.flags[k0] = !T.rec.flags[k0]; saveRec(); showPage(T.cur); });
    var next = pi < T.pages.length - 1 ? button('btn-primary', 'Next question →', function () { capture(true); showPage(T.cur + 1); }) : button('btn-primary', 'Review and submit', function () { capture(true); confirmSubmit(); });
    acts.appendChild(prev); acts.appendChild(flag); acts.appendChild(el('span', 'spacer')); acts.appendChild(next);
    card.appendChild(acts);
    main.appendChild(card);
    T.widgets.forEach(function (sl) {
      var saved = T.rec.ans[sl.key];
      if (saved && saved.r != null && sl.w.set) { try { sl.w.set(saved.r); } catch (e) {} }
      try { sl.lastVal = JSON.stringify(sl.w.peek ? sl.w.peek() : sl.w.value()); } catch (e) { sl.lastVal = null; }
      if (saved && !sl.w.set) sl.lastVal = '__keep__'; // can't show the saved answer again: keep it unless the student enters a new one
    });
    HW.texIn && HW.texIn(card);
    drawNav();
    var target = focusKey && card.querySelector('.tm-part[data-key="' + focusKey + '"]');
    try { if (target) target.scrollIntoView({ block: 'start' }); else T.ui.scrollTop = 0; } catch (e) {}
  }
  /* read the answer boxes on the page into the record: every half second (peek: don't disturb what is being typed) and,
     committed, before moving to another question or finishing */
  function capture(commit) {
    if (!T || !T.widgets || !T.rec || T.rec.st !== 'writing') return;
    var changed = false;
    T.widgets.forEach(function (sl) {
      var w = sl.w, k = sl.key, v; try { v = !commit && w.peek ? w.peek() : w.value(); } catch (e) { return; }
      if (sl.lastVal === '__keep__' && TC.blank(v)) return;
      var js = JSON.stringify(v); if (js === sl.lastVal) return;
      sl.lastVal = js; changed = true;
      var x = T.byKey[k], txt = '';
      if (!TC.blank(v)) { try { txt = HW.App.answerText(x.inst, v) || ''; } catch (e) { txt = ''; } if (!txt) txt = '…'; }
      if (TC.blank(v)) delete T.rec.ans[k]; else T.rec.ans[k] = { r: v, t: String(txt).slice(0, 300), h: TC.qhash(x.inst) };
    });
    if (!changed) return;
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
    if ((T.dirty && Date.now() - (T.changedAt || 0) > 3000) || Date.now() - (T.lastPost || 0) > 15000) post(false);
  }
  function drawTimer() {
    var t = T && T.els && T.els.timer; if (!t || !limitMs()) return;
    var hide = ls('hw:tm:hidetimer') === '1', rem = remaining();
    t.innerHTML = hide ? '⏱ Show time' : '⏱ <b>' + mmss(rem) + '</b> left <span class="tm-hide">hide</span>';
    t.classList.toggle('low', !hide && rem < 120000);
  }
  function confirmSubmit() {
    capture(true);
    var missing = [], flagged = [];
    T.pages.forEach(function (pg) { pg.parts.forEach(function (q) { if (!answered(q.key)) missing.push(q.label); }); if (T.rec.flags && T.rec.flags[pg.parts[0].key]) flagged.push(pg.num); });
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
    capture(true);
    T.rec.st = st; T.rec.why = why || ''; T.rec.done = Date.now(); T.rec.rev = (T.rec.rev || 0) + 1; T.rec.order = T.order; T.endingSoon = false;
    if (st === 'left') T.rec.leaves = (T.rec.leaves || 0) + 1;
    saveRec(); if (!T.preview) addPending(T.sid);
    stopTimer();
    try { if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock(); } catch (e) {}
    post(true, beacon);
    T.widgets = null;
    try { if (HW.Calc && HW.Calc.get) HW.Calc.get().hide(); } catch (e) {}
    drawEnd();
  }

  /* ---------------- leaving = submit and lock ---------------- */
  function writing() { return T && !T.preview && T.rec && T.rec.st === 'writing' && T.ui && T.ui.dataset.view === 'test'; }
  function left(why, beacon) {
    if (!writing()) return;
    if (Date.now() < guardUntil) { setTimeout(recheckLeft, guardUntil - Date.now() + 60); return; }
    finish('left', why, beacon);
  }
  function recheckLeft() {
    if (!writing() || Date.now() < guardUntil) return;
    if (document.visibilityState === 'hidden') left('left the page (switched tabs or windows)', true);
    else if (!document.hasFocus()) left('clicked out of the test window');
    else if (T.rec.fs && !fsEl()) left('left full screen');
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') left('left the page (switched tabs or windows)', true); });
  root.addEventListener('blur', function () { setTimeout(function () { if (!document.hasFocus()) left('clicked out of the test window'); }, BLUR_MS); });
  function onFs() { if (!fsEl() && writing()) { if (T.rec.fs) left('left full screen'); } }
  document.addEventListener('fullscreenchange', onFs); document.addEventListener('webkitfullscreenchange', onFs);
  root.addEventListener('pagehide', function () { left('closed or reloaded the page', true); });

  /* ---------------- polling ---------------- */
  var lastAct = Date.now();
  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (ev) { root.addEventListener(ev, function () { var idle = Date.now() - lastAct > 300000; lastAct = Date.now(); if (idle && session()) check(false); }, { passive: true, capture: true }); });
  setInterval(function () {
    var s = session(); if (!s || !s.token || !URL) return;
    if (document.visibilityState !== 'visible') return;
    var gap = T && T.rec && T.rec.st === 'writing' ? 8000 : Date.now() - lastAct > 300000 ? 30000 : POLL_MS; // quieter when nobody has touched the page for 5 min
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
      items.forEach(function (x, i) { idx[x.key] = i; });  // index into items; marks are read at items[i].pos
      var sum = TC.summary(r.def, r.marks || '');
      var head = el('div', 'tm-res-head tm-res-' + (r.kind === 'exit' ? 'exit' : 'test'));
      head.innerHTML = '<div class="tm-kind">' + (r.kind === 'exit' ? 'Exit slip' : 'Test') + '</div><h1>' + esc(r.title) + '</h1>' +
        '<div class="tm-res-big">' + (r.marks ? sum.score + ' / ' + sum.total : 'Not marked yet') + '</div>' +
        (r.marks ? '<div class="tm-res-levels">' + sum.outcomes.map(function (o) { var lv = sum.levels[o]; return '<span class="tm-out">' + esc(o) + '</span> ' + (lv ? '<span class="lvl lvl-' + lv + '">' + HW.LEVEL_NAMES[lv] + '</span>' : '<span class="muted">no level yet</span>'); }).join(' &nbsp; ') + '</div>' : '');
      view.appendChild(head);
      TC.pages(r.def, order).forEach(function (pg) {
        var card = el('article', 'qcard tm-res-q'), nRight = 0, nMarked = 0, first = true;
        var head2 = el('div', 'qhead', '<h2>Question ' + esc(pg.num) + '</h2>'); card.appendChild(head2);
        pg.parts.forEach(function (q) {
          var x = items[idx[q.key]]; if (!x) return;
          var inst; try { inst = TC.instance(k, r.id, x.lesson, x.it); } catch (e) { return; }
          var m = (r.marks || '').charAt(x.pos), a = r.answers[q.key], ok = TC.right(m);
          if (m) { nMarked++; if (ok) nRight++; }
          if (first && inst.stem) card.appendChild(el('div', 'qstem', HW.tex(inst.stem)));
          first = false;
          var part = el('section', 'tm-part' + (pg.parts.length > 1 ? ' multi' : '') + (m ? (ok ? ' ok' : ' bad') : ''));
          part.appendChild(el('div', 'tm-part-head', (q.sub ? '<span class="tm-sub">(' + esc(q.sub) + ')</span>' : '') + '<span class="tm-chips"><span class="tm-out">' + esc(x.it.outcome) + '</span><span class="lvl lvl-' + x.it.level + '">' + HW.LEVEL_NAMES[x.it.level] + '</span></span>' + (m ? '<span class="tm-mark">' + (ok ? '✓' : '✗') + '</span>' : '')));
          part.appendChild(el('div', 'qprompt', HW.tex(inst.prompt)));
          var ah = '—'; if (a && a.r != null) { try { ah = HW.App.answerHtml(inst, a.r); } catch (e) { ah = esc(a.t || ''); } }
          part.appendChild(el('div', 'answered', '<div class="ans-label">Your answer</div><div class="ans-val">' + ah + '</div>'));
          if (!ok) part.appendChild(el('div', 'feedback shown', '<div class="fb-title">Correct answer</div><div class="fb-ans">' + HW.tex(inst.answer) + '</div>'));
          part.appendChild(HW.App.solutionBlock(inst, false));
          card.appendChild(part);
        });
        if (nMarked) { card.classList.add(nRight === nMarked ? 'ok' : nRight ? 'mixed' : 'bad'); head2.appendChild(el('span', 'tm-res-qscore', nRight + ' / ' + nMarked)); }
        view.appendChild(card);
      });
      view.appendChild(el('p', '', '<a class="btn btn-ghost" href="#/">← Back to all lessons</a>'));
      HW.texIn && HW.texIn(view);
    });
  };

  /* ---------------- preview (the teacher's dashboard opens #/preview; nothing is saved or sent) ---------------- */
  function previewAnswer(inst) {
    var d = el('div', 'tm-pv-ans' + (T.showAns ? '' : ' hidden'), '<div class="dl">Answer (preview only)</div>' + HW.tex(inst.answer));
    return d;
  }
  function previewBar() {
    var bar = el('div', 'tm-preview-bar', '<b>Preview</b><span>This is what students see (preview student, version ' + (T.pv + 1) + '). Nothing is saved or sent, and leaving the window doesn’t lock it.</span>');
    bar.appendChild(button('btn-ghost' + (T.showAns ? ' on' : ''), T.showAns ? 'Hide answers' : 'Show answers', function () { capture(true); T.showAns = !T.showAns; drawTest(); }));
    bar.appendChild(button('btn-ghost', 'New numbers', function () { startPreview(T.pv + 1); }));
    bar.appendChild(button('btn-ghost', 'Close preview', function () { closeOverlay(); try { root.close(); } catch (e) {} location.hash = '#/'; }));
    return bar;
  }
  function drawPreviewEnd() {
    var rows = '';
    T.pages.forEach(function (pg) { pg.parts.forEach(function (q) { var x = T.byKey[q.key], a = T.rec.ans[q.key], g = x.inst ? TC.grade(x.inst, a ? a.r : null) : { m: 'b' };
      rows += '<tr><td><b>' + esc(q.label) + '</b></td><td>' + esc(a && a.t ? a.t : '—') + '</td><td class="tm-pv-mark">' + esc(TC.MARK_NAMES[g.m]) + '</td><td>' + (x.inst ? HW.tex(x.inst.answer) : '') + '</td></tr>'; }); });
    splash('Preview finished', '<p>How the checker would mark these answers:</p><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Q</th><th>Answer given</th><th>Mark</th><th>Correct answer</th></tr></thead><tbody>' + rows + '</tbody></table></div>',
      [button('btn-primary', 'Try again with new numbers', function () { startPreview(T.pv + 1); }), button('btn-ghost', 'Close preview', function () { closeOverlay(); try { root.close(); } catch (e) {} location.hash = '#/'; })]);
    T.ui.dataset.view = 'end';
  }
  function startPreview(n) {
    var P = null; try { P = JSON.parse(ls('hw:tmpreview') || 'null'); } catch (e) {}
    if (!P || !P.def) return;
    if (T) closeOverlay();
    T = { preview: true, pv: n || 0, sid: 'preview', skey: 'preview|student ' + (n || 0), def: P.def, live: { extra: 0, unlock: 0, submit: 0 }, cur: 0, widgets: [], showAns: false,
      rec: { st: 'writing', ans: {}, used: 0, leaves: 0, started: Date.now(), unlockN: 0, rev: 0 } };
    setupItems();
    var start = button('btn-primary tm-start', 'Start (preview) →', function () { goFull().then(function (ok) { T.rec.fs = ok; drawTest(); }); });
    splash('Preview of what students see when you launch', rulesHtml(), [start]);
    T.ui.dataset.view = 'pending';
  }
  TM.preview = function () { startPreview(0); };
  function maybePreview() {
    if (!/^#\/?preview/.test(location.hash)) return;
    var t0 = Date.now();
    (function wait() { if (HW.App && ((root.customElements && root.customElements.get('math-field')) || Date.now() - t0 > 2700 || root.HW_NO_MATHLIVE)) startPreview(0); else setTimeout(wait, 100); })();
  }
  root.addEventListener('hashchange', maybePreview);
  setTimeout(maybePreview, 0);

  /* test hooks (Playwright) */
  TM._state = function () { return T; };
  TM._leave = function (why) { left(why || 'test hook'); };
})(window);
