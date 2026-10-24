/* Teacher Ledger — the demo class: made-up students with made-up work, so every tab can be seen with data in it.
 * Everything is built here in the browser from the real lessons (the same questions, numbers, checkers and typical
 * mistakes the students get) and answers the same requests the Apps Script ledger does (dash, live, student, sessions,
 * tresults, launch, tlive, tctl…). Nothing is read from or written to the spreadsheet. A test launched for the demo class
 * is "written" by the made-up students on a clock: they start, answer, one leaves and is locked, and they submit. */
(function (root) {
  'use strict';
  var HW = root.HW, TC = HW.TestCore, LV = HW.LEVELS;
  var CODE = '__demo__', LABEL = 'Demo class (made-up students)';
  /* name, skill (how often right), effort (share of the questions they try), home (share done outside class), speed */
  var PEOPLE = [
    ['Ava Martin', 0.93, 0.98, 0.15, 1.25], ['Liam Chen', 0.86, 0.92, 0.35, 1.1], ['Noah Singh', 0.76, 0.86, 0.05, 1],
    ['Emma Johnson', 0.7, 0.95, 0.5, 0.9], ['Olivia Brown', 0.62, 0.72, 0.1, 0.9], ['Lucas Tremblay', 0.55, 0.62, 0, 0.8],
    ['Maya Patel', 0.82, 0.58, 0.65, 1.05], ['Ethan Wilson', 0.46, 0.52, 0.05, 0.7], ['Sophie Nguyen', 0.36, 0.42, 0, 0.6],
    ['Jack Thompson', 0.52, 0.24, 0, 0.85], ['Zoe Campbell', 0, 0, 0, 1]
  ].map(function (p) { return { name: p[0], skill: p[1], effort: p[2], home: p[3], speed: p[4], never: p[2] === 0 }; });
  var PACE = ['u1l1', 'u1l2', 'u1l3', 'u1l4', 'u1l5', 'u1l6', 'u1l7', 'u1l8', 'u1l9', '#u1test', 'u2l1', 'u2l2', 'u2l3']; // one lesson a school day, the last is today
  var M = null; // the built class (rebuilt once per page load)

  function rnd(seed) { return HW.rng(HW.hashStr('demo|' + seed)); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function strip(s) { return String(s == null ? '' : s).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(); }
  function schoolDays(n) { // the last n weekdays, ending today (or Friday on a weekend)
    var d = new Date(); d.setHours(0, 0, 0, 0); var out = [];
    while (out.length < n) { var w = d.getDay(); if (w !== 0 && w !== 6) out.unshift(new Date(d)); d.setDate(d.getDate() - 1); }
    return out;
  }
  function at(day, h, m) { var d = new Date(day); d.setHours(h, m, 0, 0); return d.getTime(); }
  function dayKey(ms) { var d = new Date(ms); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }

  /* ---- question instances: the real generator, one of three versions per question so the class has a few sets of numbers ---- */
  var INST = {};
  function inst(lesson, it, v) {
    var k = lesson.id + '|' + it.id + '|' + v; if (k in INST) return INST[k];
    var x = null; try { x = HW.makeInstance(lesson, it, HW.hashStr('demo|' + v + '|' + lesson.id + '|' + it.id), HW.hashStr('demo|' + v + '|' + lesson.id + '|q' + it.q.num)); } catch (e) { x = null; }
    return (INST[k] = x);
  }
  /* typical wrong answers for a question, with the code its checker gives each (the same diagnoses students see as hints) */
  function wrongs(x) {
    if (!x) return [];
    if (x._wr) return x._wr;
    var c = (x.bad || []).slice(), t = x.input && x.input.type, k = x.key;
    if (t === 'mc') (x.input.options || []).forEach(function (o) { if (!o.right) c.push(o.key); });
    if (t === 'number' && isFinite(Number(k))) c.push(String(Number(k) + 1), String(Number(k) * 2), String(-Number(k)));
    if (t === 'list' && Array.isArray(k) && k.length > 1) c.push(k.slice(0, -1));
    if (t === 'fields' && Array.isArray(k)) c.push(k.map(function (v, i) { return i === 0 ? String(v) + '0' : v; }));
    var out = [];
    c.forEach(function (r) { try { var res = x.check(r); if (res && (res.v === 'wrong' || res.v === 'step')) out.push({ r: r, code: res.code || '', v: res.v }); } catch (e) {} });
    return (x._wr = out);
  }
  function ansText(x, r) {
    if (r == null) return '';
    if (x && x.input && x.input.type === 'mc') { var o = (x.input.options || []).filter(function (y) { return y.key === r; })[0]; return o ? strip(o.html || o.text || r) : String(r); }
    if (typeof r === 'string' || typeof r === 'number') return String(r);
    if (Array.isArray(r)) return r.map(function (v) { return typeof v === 'object' ? ansText(null, v) : String(v); }).join(', ');
    if (typeof r === 'object') { if (r.final != null) return String(r.final); return Object.keys(r).map(function (kk) { var v = r[kk]; return typeof v === 'object' ? '' : String(v); }).filter(Boolean).join(', '); }
    return String(r);
  }
  function promptOf(x) { return x ? (x.text || strip(x.prompt)).slice(0, 160) : ''; }
  function pRight(p, it) { return clamp(p.skill * 1.12 + 0.12 - LV.indexOf(it.level) * 0.09, 0.04, 0.97); }

  /* ---------------- practice work ---------------- */
  function build() {
    var days = schoolDays(PACE.length), now = Date.now();
    var att = [], evs = [], dayAgg = {}, prog = {}, roster = [];
    PEOPLE.forEach(function (p, pi) {
      var r0 = rnd(p.name), v = HW.hashStr(p.name) % 3, first = 0, last = 0;
      if (p.never) { roster.push({ name: p.name, pin: false, firstSeen: 0, lastSeen: 0, devices: 0 }); return; }
      PACE.forEach(function (lid, di) {
        var lesson = HW.lessons[lid]; if (!lesson || lid.charAt(0) === '#') return;
        var back = PACE.length - 1 - di, fresh = [0.38, 0.7, 0.88, 0.95][back] || 1; // today's lesson is only partly done
        var day = days[di], classStart = at(day, 10, 36) + r0.int(0, 6) * 60000, classEnd = at(day, 11, 58);
        var homeStart = at(day, 19, 0) + r0.int(0, 120) * 60000, tIn = classStart, tHome = homeStart;
        var req = lesson.items.filter(function (it) { return !it.extra; }), ext = lesson.items.filter(function (it) { return it.extra; });
        var nReq = Math.round(req.length * clamp(p.effort * fresh + (r0.next() - 0.5) * 0.12, 0, 1));
        var nExt = back > 0 ? Math.round(ext.length * clamp(p.effort * p.skill * 0.55 * fresh + (r0.next() - 0.5) * 0.1, 0, 1)) : 0;
        var todo = req.slice(0, nReq).concat(ext.slice(0, nExt));
        var pr = prog[p.name + '|' + lid] = { name: p.name, lesson: lid, items: {} };
        todo.forEach(function (it, k) {
          var homework = back > 0 && (r0.chance(p.home) || tIn > classEnd), x = inst(lesson, it, v);
          var secs = Math.round((20 + r0.int(0, 55) + LV.indexOf(it.level) * 12) / p.speed), t0 = homework ? tHome : tIn;
          if (back === 0 && t0 + secs * 1000 > now - 60000) return; // nothing from the future
          var tries = [], wr = wrongs(x), credit = 'first', state = 'done', pR = pRight(p, it), reveal = 0;
          if (!r0.chance(pR)) {
            var nWrong = r0.chance(0.55 + p.skill * 0.3) ? r0.int(1, 2) : 3;
            for (var w = 0; w < nWrong; w++) { var b = wr.length ? r0.pick(wr) : { r: '', code: '', v: 'wrong' }; tries.push(['wrong', b]); }
            if (nWrong >= 3) { reveal = 1; credit = 'shown'; state = r0.chance(0.8) ? 'done' : 'shown'; } else credit = 'hint';
            if (k === todo.length - 1 && back === 0 && r0.chance(0.5)) state = 'open'; // still working on it
          }
          var t = t0, inC = homework ? 0 : 1, ver = 0;
          tries.forEach(function (tr, n) {
            t += Math.round(secs / (tries.length + 1)) * 1000;
            att.push([t, p.name, lid, it.id, it.outcome, it.level, it.extra ? 1 : 0, 0, ver, tr[1].v === 'step' ? 'step' : 'wrong', tr[1].code, n + 1, ansText(x, tr[1].r), promptOf(x), inC, it.label]);
            if (n === 2) { evs.push([t + 4000, p.name, lid, it.id, 'reveal', '', inC]); }
          });
          if (state === 'done') { t += Math.round(secs / (tries.length + 1)) * 1000; att.push([t, p.name, lid, it.id, it.outcome, it.level, it.extra ? 1 : 0, 0, ver, 'correct', '', tries.length + 1, x ? ansText(x, x.key) : '', promptOf(x), inC, it.label]); }
          if (homework) tHome = t + r0.int(10, 60) * 1000; else tIn = t + r0.int(10, 60) * 1000;
          pr.items[it.id] = [state === 'done' ? 'done' : state, state === 'done' ? credit : '', tries.length, secs, reveal, 0];
          var dk = dayKey(t0) + '|' + lid, a = dayAgg[p.name + '|' + dk] || (dayAgg[p.name + '|' + dk] = [dayKey(t0), p.name, lid, 0, 0, 0, 0, 0]);
          a[3] += secs; if (inC) a[4] += secs; a[5] += tries.length + (state === 'done' ? 1 : 0); if (state === 'done') { a[6]++; if (!tries.length) a[7]++; }
          first = first ? Math.min(first, t0) : t0; last = Math.max(last, t);
        });
        // students who drift: left the page a few times (each one gets new numbers)
        var leaves = p.effort < 0.55 ? (r0.chance(0.45) ? r0.int(1, 2) : 0) : r0.chance(0.1) ? 1 : 0;
        for (var j = 0; j < leaves && todo.length; j++) { var it2 = r0.pick(todo); evs.push([classStart + r0.int(5, 70) * 60000, p.name, lid, it2.id, 'leave', r0.int(8, 140), 1]); }
      });
      roster.push({ name: p.name, pin: true, firstSeen: first, lastSeen: last, devices: p.home > 0.3 ? 2 : 1 });
    });
    // the two who asked for a Unit 1 retest (retestList) finished its required practice: anything left done, and the
    // ones whose solution was shown redone without it
    ['Ava Martin', 'Maya Patel'].forEach(function (name) {
      HW.CATALOG.filter(function (c) { return c.unit === 1; }).forEach(function (cat) { cat.lessons.forEach(function (c) {
        var lesson = HW.lessons[c.id]; if (!lesson || lesson.test) return;
        var pr = prog[name + '|' + lesson.id] || (prog[name + '|' + lesson.id] = { name: name, lesson: lesson.id, items: {} });
        lesson.items.forEach(function (it) { if (it.extra) return; var x = pr.items[it.id];
          if (!x || x[0] !== 'done') pr.items[it.id] = ['done', 'first', 0, 45, 0, 0];
          else if (x[1] === 'shown') x[6] = now - 30 * 3600000; });
      }); });
    });
    att.sort(function (a, b) { return a[0] - b[0]; });
    return { att: att, evs: evs, days: Object.keys(dayAgg).map(function (k) { return dayAgg[k]; }), prog: Object.keys(prog).map(function (k) { return prog[k]; }), roster: roster, pace: PACE, dayList: days };
  }
  function model() { if (!M) M = build(); return M; }

  /* who is on the site right now: most of the class, working on today's lesson */
  function live() {
    var m = model(), now = Date.now(), out = {}, lesson = HW.lessons[PACE[PACE.length - 1]];
    PEOPLE.forEach(function (p, i) {
      if (p.never || p.effort < 0.3) return;
      var r0 = rnd(p.name + '|live'), its = lesson.items.filter(function (it) { return !it.extra; }), it = its[Math.min(its.length - 1, Math.floor(its.length * clamp(p.effort * 0.4, 0, 1)) + r0.int(0, 2))];
      var kind = i === 4 ? 'away' : i === 7 ? 'home' : i === 3 ? 'teach' : 'lesson';
      out[p.name] = { view: kind === 'home' ? 'home' : kind === 'teach' ? 'teach' : 'lesson', lesson: lesson.id, item: it.id, label: it.label, away: kind === 'away', at: now - r0.int(2, 25) * 1000, since: now - r0.int(1, 9) * 60000 - r0.int(0, 59) * 1000, inClass: true, dev: 'Chromebook' };
    });
    return out;
  }
  /* class-list details: made-up student numbers, pronouns for most (two left unset), one student on an IPP; changes
     made in the ledger stay in this page */
  var PRO = { 'Ava Martin': 'she', 'Liam Chen': 'he', 'Noah Singh': 'he', 'Emma Johnson': 'she', 'Olivia Brown': 'she', 'Lucas Tremblay': 'he', 'Maya Patel': 'she', 'Ethan Wilson': 'he', 'Sophie Nguyen': 'she' };
  function info(name) {
    T.info = T.info || {};
    if (!T.info[name]) { var i = PEOPLE.map(function (p) { return p.name; }).indexOf(name); T.info[name] = { num: String(99000101 + i * 7), pronouns: PRO[name] || '', ipp: name === 'Sophie Nguyen' }; }
    return T.info[name];
  }
  function setStudent(p) {
    if (!PEOPLE.some(function (x) { return x.name === p.name; })) return { ok: false, error: 'unknown student' };
    var x = info(p.name);
    if (p.num != null) x.num = String(p.num).replace(/[^0-9A-Za-z]/g, '');
    if (p.pronouns != null) { if (['', 'he', 'she', 'they'].indexOf(p.pronouns) < 0) return { ok: false, error: 'bad pronouns' }; x.pronouns = p.pronouns; }
    if (p.ipp != null) x.ipp = p.ipp === '1';
    return { ok: true, num: x.num, pronouns: x.pronouns, ipp: x.ipp };
  }
  function dash() {
    var m = model(), now = Date.now(), lv = live();
    return { ok: true, demo: true, 'class': { code: CODE, label: LABEL, block: 'B' }, roster: m.roster.map(function (r) { return Object.assign({}, r, info(r.name), { lastSeen: lv[r.name] ? lv[r.name].at : r.lastSeen }); }),
      progress: m.prog, days: m.days.map(function (d) { return d.slice(); }),
      attempts: m.att.map(function (a) { return a.slice(0, 15); }), events: m.evs.filter(function (e) { return e[4] !== 'open'; }).map(function (e) { return e.slice(); }),
      live: lv, now: now, liveNow: now, noSchool: [], bell: null };
  }
  function student(name) {
    var m = model();
    return { ok: true, attempts: m.att.filter(function (a) { return a[1] === name; }).map(function (a) { return [a[0], a[2], a[3], a[15], a[4], a[5], 0, a[8], a[9], a[10], a[11], a[12], a[13], a[14], 'Chromebook']; }),
      events: m.evs.filter(function (e) { return e[1] === name; }).map(function (e) { return [e[0], e[2], e[3], e[4], e[5], e[6]]; }) };
  }

  /* ---------------- tests: two finished ones, and a live one on a clock when you launch ---------------- */
  var T = { sessions: null, live: null, n: 0 };
  function testable(l, it) { try { return !TC.NO_TEST[HW.makeInstance(l, it, 1, 1).input.type]; } catch (e) { return false; } }
  function exitDef(id, num) {
    var b = HW.DashTests && HW.DashTests.builtin((id || 'u2l2') + 'x'); if (b) return b.def; // the built exit slip for that lesson
    var l = HW.lessons[id || 'u2l2'], want = ['BEG', 'EMG', 'PRG', 'ADV'], items = [];
    want.forEach(function (lv) { var it = l.items.filter(function (x) { return !x.extra && x.level === lv && testable(l, x) && items.indexOf(x) < 0; })[0]; if (it) items.push(it); });
    return { title: 'Exit slip ' + (num || '2.2'), kind: 'exit', unit: 2, minutes: 10, calc: true, shuffle: false, levels: true, items: items.map(function (it) { return { l: l.id, i: it.id }; }) };
  }
  function unitTestDef() {
    var b = HW.DashTests && HW.DashTests.builtin('u1test'); if (b) return b.def;
    var l = HW.lessons.u1test; if (!l) return null;
    return { title: 'Unit 1 Test', kind: 'test', unit: 1, minutes: 75, calc: true, shuffle: false, levels: true, items: l.items.filter(function (it) { return testable(l, it); }).map(function (it) { return { l: l.id, i: it.id }; }) };
  }
  /* one student's answers to a test, in their own order: right, a typical mistake, or blank */
  function answersFor(p, def, sid, t0, slow) {
    var r0 = rnd(p.name + '|' + sid), order = TC.order(def, TC.skey(CODE, p.name), sid), byKey = {}, out = [];
    TC.items(def).forEach(function (x) { byKey[x.key] = x; });
    var t = t0;
    order.forEach(function (k, i) {
      var x = byKey[k]; if (!x) return;
      t += Math.round((40 + r0.int(0, 90)) / p.speed) * 1000;
      if (slow && i >= order.length - slow) return; // ran out of time at the end
      var q = TC.instance(TC.skey(CODE, p.name), sid, x.lesson, x.it), r;
      if (r0.chance(0.04 + (1 - p.skill) * 0.08)) return; // skipped
      if (r0.chance(pRight(p, x.it))) r = q.key;
      else { var w = wrongs(q); if (!w.length) return; r = r0.pick(w).r; }
      out.push({ key: k, a: { r: r, t: ansText(q, r), h: TC.qhash(q), at: t } });
    });
    return { order: order, list: out, end: t };
  }
  function finishedRows(def, sid, start) {
    return PEOPLE.filter(function (p) { return !p.never; }).map(function (p, i) {
      var slow = p.speed < 0.75 && def.kind !== 'exit' ? 4 : 0, A = answersFor(p, def, sid, start + i * 9000, slow), ans = {};
      A.list.forEach(function (x) { ans[x.key] = x.a; });
      var st = slow ? 'time' : 'submitted', left = p.name === 'Ethan Wilson' && def.kind !== 'exit';
      return { name: p.name, status: st, started: start + i * 9000, submitted: Math.min(A.end, start + (def.minutes || 60) * 60000), used: Math.round(Math.min(A.end - start, (def.minutes || 60) * 60000) / 1000), leaves: left ? 1 : 0, device: 'Chromebook', answers: ans, marks: '', score: '', total: '' };
    });
  }
  function sessions() {
    if (T.sessions) return T.sessions;
    var m = model(), days = m.dayList, out = [];
    var ti = PACE.indexOf('#u1test'), ud = unitTestDef();
    if (ud && ti >= 0) { var s1 = at(days[ti], 10, 40); out.push({ id: 'DEMO-T1', test: '', title: ud.title, kind: 'test', launched: s1, closed: s1 + 78 * 60000, released: 0, def: ud, rows: finishedRows(ud, 'DEMO-T1', s1 + 60000) }); }
    var ed = exitDef(), s2 = at(days[PACE.indexOf('u2l2')], 11, 45);
    var e0 = exitDef('u2l1', '2.1'), s0 = at(days[PACE.indexOf('u2l1')], 11, 45);
    if (e0.items.length) out.push({ id: 'DEMO-X0', test: '', title: e0.title, kind: 'exit', launched: s0, closed: s0 + 11 * 60000, released: s0 + 3 * 3600000, def: e0, rows: finishedRows(e0, 'DEMO-X0', s0 + 30000) });
    if (ed.items.length) out.push({ id: 'DEMO-X1', test: '', title: ed.title, kind: 'exit', launched: s2, closed: s2 + 11 * 60000, released: s2 + 3 * 3600000, def: ed, rows: finishedRows(ed, 'DEMO-X1', s2 + 30000) });
    return (T.sessions = out);
  }
  function sessionList() { return sessions().slice().sort(function (a, b) { return b.launched - a.launched; }).map(function (s) { return { id: s.id, test: s.test, title: s.title, kind: s.kind, launched: s.launched, closed: s.closed, released: s.released, results: s.rows.length }; }); }
  function tresults(sid) {
    var s = sessions().filter(function (x) { return x.id === sid; })[0]; if (!s) return { ok: false, error: 'unknown session' };
    return { ok: true, session: { id: s.id, test: s.test, 'class': CODE, title: s.title, kind: s.kind, launched: s.launched, closed: s.closed, released: s.released, def: s.def },
      rows: s.rows.map(function (r) { return Object.assign({}, r); }), names: PEOPLE.map(function (p) { return p.name; }) };
  }
  /* a live test: each made-up student starts within a minute, answers every 15–40 s; one leaves about a minute in and stays
     locked until you unlock them; one never shows up */
  function launch(def, testId, who) {
    if (T.live) return { ok: false, error: 'live', live: liveInfo() };
    var id = 'DEMO-L' + (++T.n), now = Date.now(), plan = {};
    PEOPLE.forEach(function (p, i) {
      if (p.never || (who && p.name !== who)) return;
      var r0 = rnd(p.name + '|' + id), A = answersFor(p, def, id, now, 0);
      var ethan = p.name === 'Ethan Wilson';
      plan[p.name] = { start: ethan && !who ? 8000 : r0.int(5, 45) * 1000, gap: Math.round(r0.int(15, 40) / p.speed) * 1000, A: A, leaveAt: ethan && !who ? 50000 : 0 };
    });
    T.live = { id: id, test: testId, title: def.title, kind: def.kind, def: def, launched: now, ending: 0, extra: {}, unlock: {}, submit: {}, plan: plan, done: {}, who: who || '' };
    if (HW.TestCore.timing(def) === 'period') T.live.endsAt = now + 45 * 60000;   // the demo class's period: 45 minutes from now
    return { ok: true, live: liveInfo() };
  }
  function liveInfo() { var L = T.live; if (!L) return null; var o = { id: L.id, test: L.test, title: L.title, kind: L.kind, launched: L.launched, ending: !!L.ending, extra: L.extra, unlock: L.unlock, submit: L.submit, endsAt: L.endsAt || 0 }; if (L.who) o.who = L.who; return o; }
  function liveKeyOf(who) { return who ? CODE + '|' + key(who) : CODE; }
  function liveMap() { var m = {}; if (T.live) m[liveKeyOf(T.live.who)] = liveInfo(); return m; }
  function isMine(who) { return T.live && (T.live.who || '') === (who || ''); }
  function key(n) { return String(n).toLowerCase().replace(/\s+/g, ' ').trim(); }
  function recOf(name, now) {
    var L = T.live, P = L.plan[name]; if (!P) return null;
    var el = now - L.launched - P.start; if (el < 0) return null;
    var ex = ((L.extra['*'] || 0) + (L.extra[key(name)] || 0)) * 60000, tm = HW.TestCore.timing(L.def);
    var total = P.A.order.length, lim = tm === 'minutes' && L.def.minutes ? L.def.minutes * 60000 + ex : tm === 'period' && L.endsAt ? L.endsAt + ex - L.launched - P.start : 0;
    var locked = P.leaveAt && el > P.leaveAt && !(L.unlock[key(name)] > L.launched + P.start + P.leaveAt) ? 1 : 0;
    var lost = P.leaveAt && L.unlock[key(name)] ? Math.max(0, L.unlock[key(name)] - (L.launched + P.start + P.leaveAt)) : 0;
    var work = locked ? P.leaveAt : el - lost, n = Math.min(P.A.list.length, Math.floor(work / P.gap));
    var finish = P.A.list.length * P.gap + 15000, st = 'writing', why = '', doneAt = 0;
    if (locked) { st = 'left'; why = 'left the test window'; doneAt = L.launched + P.start + P.leaveAt; }
    else if (L.submit[key(name)]) { st = 'forced'; doneAt = L.submit[key(name)]; }
    else if (L.ending && L.ending < now - 8000) { st = 'ended'; doneAt = L.ending + 8000; }
    else if (lim && work > lim) { st = 'time'; doneAt = now; }
    else if (work > finish) { st = 'submitted'; doneAt = L.launched + P.start + lost + finish; }
    if (doneAt) { var w2 = Math.max(0, doneAt - L.launched - P.start - (locked ? 0 : lost)); n = Math.min(n, Math.floor(w2 / P.gap)); }
    var ans = {}; P.A.list.slice(0, n).forEach(function (x) { ans[x.key] = x.a; });
    var pages = TC.pages(L.def, P.A.order), nextKey = P.A.order.filter(function (k) { return !ans[k]; })[0], cur = 0;
    pages.forEach(function (pg, pi) { if (pg.parts.some(function (q) { return q.key === nextKey; })) cur = pi; });
    return { st: st, why: why, ans: ans, n: n, order: P.A.order, cur: cur, at: st === 'writing' ? now - (n * 7919 % 9000) : doneAt, used: Math.min(work, lim || work), leaves: P.leaveAt && el > P.leaveAt ? 1 : 0, fs: true, started: L.launched + P.start, done: doneAt };
  }
  function tlive(who) {
    var names = PEOPLE.map(function (p) { return p.name; }).filter(function (n) { return !who || n === who; }), now = Date.now();
    if (!isMine(who)) return { ok: true, live: null, names: names, now: now };
    var recs = {}; names.forEach(function (n) { var r = recOf(n, now); if (r) recs[n] = r; });
    return { ok: true, live: liveInfo(), def: T.live.def, recs: recs, names: names, now: now };
  }
  function tctl(op, name, mins, who) {
    var L = T.live; if (!L || !isMine(who)) return { ok: false, error: 'no live test' };
    var n = key(name || ''), now = Date.now();
    if (op === 'unlock') { L.unlock[n] = now; delete L.submit[n]; if (Number(mins)) L.extra[n] = (L.extra[n] || 0) + Number(mins); }
    else if (op === 'time') L.extra[n || '*'] = (L.extra[n || '*'] || 0) + (Number(mins) || 0);
    else if (op === 'submit') L.submit[n] = now;
    else if (op === 'end') L.ending = now;
    else if (op === 'resume') L.ending = 0;
    else if (op === 'close') {
      var rows = [];
      PEOPLE.forEach(function (p) {
        if (L.who && p.name !== L.who) return;
        var r = recOf(p.name, now); if (!r) return;
        rows.push({ name: p.name, status: r.st === 'writing' || r.st === 'left' ? 'ended' : r.st, started: r.started, submitted: r.done || now, used: Math.round(r.used / 1000), leaves: r.leaves, device: 'Chromebook', answers: r.ans, marks: '', score: '', total: '' });
      });
      sessions().push({ id: L.id, test: L.test, title: L.title, kind: L.kind, launched: L.launched, closed: now, released: 0, def: L.def, rows: rows, student: L.who || '' });
      if (L.who) retestList().forEach(function (x) { if (x.session === L.id && x.status === 'open') { x.status = 'done'; x.updated = now; } });
      T.live = null;
      return { ok: true, closed: L.id };
    } else return { ok: false, error: 'bad op' };
    return { ok: true, live: liveInfo() };
  }
  function setMarks(sid, data) {
    var s = sessions().filter(function (x) { return x.id === sid; })[0], d = {}; if (!s) return { ok: false, error: 'unknown session' };
    try { d = JSON.parse(data || '{}'); } catch (e) {}
    var n = 0; s.rows.forEach(function (r) { var x = d[r.name]; if (x) { r.marks = String(x.m || ''); r.score = x.s; r.total = x.t; n++; } });
    return { ok: true, saved: n };
  }
  function release(sid, on) { var s = sessions().filter(function (x) { return x.id === sid; })[0]; if (!s) return { ok: false, error: 'unknown session' }; s.released = on ? Date.now() : 0; return { ok: true }; }

  /* retest requests: two made-up students who finished Unit 1's practice */
  function retestList() {
    if (!T.rt) { var now = Date.now(); T.rt = [
      { id: 'DEMO-R1', name: 'Ava Martin', unit: 1, requested: now - 26 * 3600000, status: 'requested', session: '', updated: now - 26 * 3600000, test: '', info: '' },
      { id: 'DEMO-R2', name: 'Maya Patel', unit: 1, requested: now - 3 * 3600000, status: 'requested', session: '', updated: now - 3 * 3600000, test: '', info: '' }]; }
    return T.rt;
  }
  function retests() {
    var names = {}; retestList().forEach(function (x) { names[key(x.name)] = 1; });
    var res = [], used = {};
    sessions().forEach(function (s) { if (s.kind === 'exit') return; s.rows.forEach(function (r) { if (!names[key(r.name)]) return; res.push({ session: s.id, name: r.name, status: r.status, marks: r.marks || '', score: r.score, total: r.total }); used[s.id] = 1; }); });
    return { ok: true, retests: retestList().map(function (x) { return Object.assign({}, x); }), results: res, live: liveMap(),
      sessions: sessions().filter(function (s) { return used[s.id]; }).map(function (s) { return { id: s.id, test: s.test, title: s.title, launched: s.launched, closed: s.closed, released: s.released, def: s.def, student: s.student || '' }; }) };
  }
  function retestSet(id, status) { var x = retestList().filter(function (r) { return r.id === id; })[0]; if (!x) return { ok: false, error: 'unknown request' }; x.status = status; x.updated = Date.now(); if (status === 'requested') x.session = ''; return { ok: true }; }

  /* the requests the dashboard makes, answered for the demo class. real = the real ledger (for the list of your tests). */
  function api(action, p, real) {
    p = p || {};
    var ok = function (v) { return Promise.resolve(v); };
    switch (action) {
      case 'dash': return ok(dash());
      case 'live': return ok({ ok: true, live: live(), now: Date.now() });
      case 'student': return ok(student(p.name));
      case 'sessions': return ok({ ok: true, sessions: sessionList() });
      case 'tresults': return ok(tresults(p.session));
      case 'setmarks': return ok(setMarks(p.session, p.data));
      case 'release': return ok(release(p.session, p.on === 1 || p.on === '1' || p.on === true));
      case 'tlive': return ok(tlive(p.who));
      case 'cal': return ok({ ok: true, cal: calendar(), noSchool: [] });
      case 'calsync': return ok({ ok: true, sync: false });
      case 'setcal': try { T.cal = p.cal ? JSON.parse(p.cal) : null; } catch (e) { return ok({ ok: false, error: 'bad calendar' }); } T.calSet = true; return ok({ ok: true, cal: T.cal });
      case 'tctl': return ok(tctl(p.op, p.name, p.mins, p.who));
      case 'tests': return real('tests', p).then(function (d) { if (d && d.ok) { d.live = Object.assign({}, d.live || {}, liveMap()); } return d; });
      case 'retests': return ok(retests());
      case 'setstudent': return ok(setStudent(p));
      case 'retestset': return ok(retestSet(p.id, p.status));
      case 'launchretest': return real('tests', {}).then(function (d) {
        var x = retestList().filter(function (r) { return r.id === p.id; })[0]; if (!x || x.status !== 'requested') return { ok: false, error: 'not requested' };
        var t = d && d.ok ? (d.tests || []).filter(function (q) { return q.id === p.test; })[0] : null;
        if (!t && /^B-/.test(p.test || '') && HW.DashTests) t = HW.DashTests.builtin(String(p.test).slice(2));
        if (!t || !t.def) return { ok: false, error: 'unknown test' };
        var r = launch(t.def, t.id, x.name); if (r.ok) { x.status = 'open'; x.session = r.live.id; x.updated = Date.now(); x.test = t.id; } return r;
      });
      case 'launch': return real('tests', {}).then(function (d) {
        var t = d && d.ok ? (d.tests || []).filter(function (x) { return x.id === p.test; })[0] : null;
        if (!t && /^B-/.test(p.test || '') && HW.DashTests) t = HW.DashTests.builtin(String(p.test).slice(2)); // a ready-made one, not saved
        return t && t.def ? launch(t.def, t.id) : { ok: false, error: 'unknown test' };
      });
      default: return ok({ ok: false, error: 'The demo class is made up, so it can’t be changed. Use one of your real classes for that.' });
    }
  }
  /* the demo class's calendar: the same pace as its made-up work (one lesson a school day, Unit 1 Test, today Unit 2 L3) */
  function calendar() { // starts the school day before the made-up work: day one is the course introduction (Lesson 0)
    if (!T.calSet && HW.Cal) { var d0 = schoolDays(PACE.length + 1)[0]; T.cal = HW.Cal.make(d0 ? HW.Cal.key(d0) : HW.Cal.today()); T.calSet = true; } return T.cal; }
  function isDemo(p) { p = p || {}; return p['class'] === CODE || /^DEMO-/.test(String(p.session || '')); }

  HW.DashDemo = { CODE: CODE, LABEL: LABEL, count: PEOPLE.length, api: api, isDemo: isDemo, _model: model };
})(window);
