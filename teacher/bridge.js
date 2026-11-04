/* The course bridge: how the Teaching Hub (https://rmcathcart-lab.github.io/teaching/) reads and changes this course.
 * The hub opens teacher/bridge.html in a hidden frame and calls window.COURSE_BRIDGE. Everything goes through this
 * course's own Apps Script backend with this ledger's teacher key, so a class calendar has ONE copy: a change made in the
 * hub's universal calendar is a change to this class's calendar (and the reverse). Keep this file the same in math10c and
 * math15 (only the site differs: js/config.js and js/catalog.js). */
(function (root) {
  'use strict';
  var HW = root.HW, C = HW.Cal, BACKEND = (root.HW_CONFIG || {}).backend || '';
  var B = root.COURSE_BRIDGE = { kind: 'math', enabled: !!BACKEND, version: 1 };
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function key() { return ls('hw:tkey') || ''; }
  B.hasKey = function () { return !!key(); };
  B.key = key;
  B.setKey = function (k) { ls('hw:tkey', k ? String(k) : null); cache = { cal: {} }; };

  /* ---- talking to the backend (GET: fetch, then JSONP) ---- */
  var cbN = 0;
  function qs(p) { return Object.keys(p).filter(function (k) { return p[k] != null; }).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(p[k]); }).join('&'); }
  function jsonp(p, timeout) {
    return new Promise(function (res, rej) {
      var name = '__brcb' + (++cbN) + '_' + Date.now(), s = document.createElement('script'), done = false;
      root[name] = function (d) { done = true; clean(); res(d); };
      function clean() { try { delete root[name]; } catch (e) { root[name] = undefined; } if (s.parentNode) s.parentNode.removeChild(s); }
      s.src = BACKEND + '?' + qs(Object.assign({}, p, { callback: name }));
      s.onerror = function () { if (!done) { clean(); rej(new Error('network')); } };
      setTimeout(function () { if (!done) { clean(); rej(new Error('timeout')); } }, timeout || 30000);
      document.head.appendChild(s);
    });
  }
  function get(action, params) {
    if (!BACKEND) return Promise.reject(new Error('no backend'));
    var p = Object.assign({ action: action, key: key() }, params || {});
    return fetch(BACKEND + '?' + qs(p), { credentials: 'omit', redirect: 'follow' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .catch(function () { return jsonp(p); });
  }
  B.get = get;

  var cache = { cal: {} };
  /* the course's classes: { ok, classes: [{ code, show, label, students, block }], noSchool, bell } */
  B.classes = function (force) {
    if (cache.classes && !force) return cache.classes;
    var pr = cache.classes = get('classes').then(function (d) {
      if (!d || !d.ok) { cache.classes = null; return { ok: false, error: (d && d.error) || 'no answer' }; }
      return { ok: true, classes: d.classes.map(function (c) { return { code: c.code, show: c.show || c.code, label: c.label || c.code, students: c.students || 0, block: c.block || '' }; }), noSchool: d.noSchool || [], bell: d.bell || null };
    }, function (e) { cache.classes = null; return { ok: false, error: e.message }; });
    return pr;
  };
  /* a class's calendar: { ok, cal (or null), noSchool, sync } */
  B.cal = function (code, force) {
    if (cache.cal[code] && !force) return cache.cal[code];
    var pr = cache.cal[code] = get('cal', { 'class': code }).then(function (d) {
      if (!d || !d.ok) { delete cache.cal[code]; return { ok: false, error: (d && d.error) || 'no answer' }; }
      return { ok: true, cal: d.cal ? C.clean(d.cal) : null, noSchool: d.noSchool || [], sync: !!d.sync };
    }, function (e) { delete cache.cal[code]; return { ok: false, error: e.message }; });
    return pr;
  };
  B.forget = function () { cache = { cal: {} }; };
  /* save a whole calendar (when "keep all classes the same" is on in the ledger, it goes to every class) */
  B.saveCal = function (code, cal) {
    return B.cal(code).then(function (x) {
      return get('setcal', { 'class': code, cal: cal ? JSON.stringify(cal) : '', all: x.sync ? '1' : '' }).then(function (d) {
        if (d && d.ok) {
          if (x.sync) cache.cal = {};
          cache.cal[code] = Promise.resolve({ ok: true, cal: cal ? C.clean(cal) : null, noSchool: x.noSchool, sync: x.sync });
        }
        return d || { ok: false, error: 'no answer' };
      });
    });
  };
  B.makeCal = function (code, start) {
    return B.cal(code).then(function (x) { return B.saveCal(code, C.make(C.firstClassDay(start, x.noSchool) || start)); });
  };

  /* ---- what's on a day ---- */
  function lessonUrl(k, block) {
    var T = HW.TEACHING, m = /^u(\d+)l(\w+)$/.exec(k);
    if (!T || !m || T.lessons.indexOf(k) < 0) return '';
    return new URL('../' + T.base + 'u' + m[1] + '/l' + m[2] + '/' + (block ? '?class=' + block : ''), location.href).href;
  }
  function site(p) { return new URL('../' + (p || ''), location.href).href; }
  B.site = site;
  /* one calendar entry, for the hub: { key, label, title, kind, unit, colour, lessonUrl } */
  B.item = function (k, block) {
    var i = C.info(k); if (!i) return null;
    var col = HW.unitColor ? HW.unitColor(i.unit) : null;
    return { key: k, label: C.label(k), title: String(i.title || '').replace(/<[^>]+>/g, ''), kind: i.kind === 'test' ? 'test' : i.intro ? 'intro' : 'lesson', unit: i.unit, unitTitle: i.unitTitle || '', num: i.num,
      colour: col ? col.c : '#0f766e', tint: col ? col.light : '#e6f2f1', dark: col ? col.dark : '#0b3d3a', lessonUrl: i.kind === 'test' ? '' : lessonUrl(k, block) };
  };
  function eventItem(e) { return { key: 'ev:' + e.id, id: e.id, label: e.kind === 'exam' ? 'Exam' : 'Note', title: e.title, kind: e.kind === 'exam' ? 'exam' : 'event', takes: !!e.takes, colour: '#7c6f57', tint: '#f3efe6', dark: '#4a4234' }; }
  /* [{ date, items: [...] }] for each date from..to that has something on it */
  B.entries = function (code, from, to, block) {
    return B.cal(code).then(function (x) {
      if (!x.ok) return x;
      if (!x.cal) return { ok: true, none: true, days: {} };
      var L = C.layout(x.cal, x.noSchool), days = {};
      Object.keys(L.byDate).forEach(function (d) { if (d >= from && d <= to) days[d] = L.byDate[d].map(function (k) { return B.item(k, block); }).filter(Boolean); });
      (x.cal.events || []).forEach(function (e) { if (e.date >= from && e.date <= to) (days[e.date] = days[e.date] || []).unshift(eventItem(e)); });
      return { ok: true, days: days, start: x.cal.start, last: L.last, skipped: x.cal.skipped.map(function (k) { return B.item(k, block); }).filter(Boolean), sync: x.sync };
    });
  };
  /* ---- changes (each saves the class's calendar and returns { ok, cal, before }) ---- */
  function change(code, fn) {
    return B.cal(code).then(function (x) {
      if (!x.ok || !x.cal) return { ok: false, error: x.error || 'no calendar' };
      var before = x.cal, next = fn(x.cal, x.noSchool); if (!next) return { ok: false, error: 'not a class day' };
      return B.saveCal(code, next).then(function (d) { return d.ok ? { ok: true, before: before, cal: next } : d; });
    });
  }
  /* move a lesson to a date (a skipped one goes back on): everything after it moves by the same number of class days */
  B.move = function (code, k, date) {
    return change(code, function (cal, off) {
      var slot = C.slotOf(cal, off, date); if (slot < 0) return null;
      return cal.skipped.indexOf(k) >= 0 ? C.restore(cal, k, slot) : C.move(cal, k, slot);
    });
  };
  B.skip = function (code, k) { return change(code, function (cal) { return C.skip(cal, k); }); };
  B.putCal = function (code, cal) { return B.saveCal(code, cal).then(function (d) { return d.ok ? { ok: true, cal: cal } : d; }); };
  B.canDrag = true;

  /* ---- set-up from the hub ---- */
  B.createClass = function (code, label) {
    return get('setroster', { 'class': code, label: label || code, names: '', mode: 'add' }).then(function (d) { cache.classes = null; return d && d.ok ? { ok: true, code: d['class'].code } : (d || { ok: false, error: 'no answer' }); });
  };
  B.setLabel = function (code, label) { return get('renameclass', { 'class': code, label: label }).then(function (d) { cache.classes = null; return d || { ok: false }; }); };
  B.setBlock = function (code, block) { return get('setblock', { 'class': code, block: block || '' }).then(function (d) { cache.classes = null; return d || { ok: false }; }); };
  B.setNoSchool = function (list) { return get('setnoschool', { dates: (list || []).join(',') }).then(function (d) { cache = { cal: {} }; return d || { ok: false }; }); };
  B.setBell = function (bell) { return get('setbell', { bell: bell ? JSON.stringify(bell) : 'reset' }).then(function (d) { cache.classes = null; return d || { ok: false }; }); };

  /* ---- sub plans: what a substitute needs for this class on a date ---- */
  var calcFlags = null;
  function calcInfo() {   // calc: true / false from the exit slips and unit tests (no calculator → students put theirs away)
    if (calcFlags) return calcFlags;
    var out = {}, jobs = [];
    (HW.CATALOG || []).forEach(function (u) {
      jobs.push(fetch(site('js/exits/u' + u.unit + '.js')).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) { var re = /lesson:\s*'(u\d+l\w+)',\s*calc:\s*(true|false)/g, m; while ((m = re.exec(t))) out[m[1]] = m[2] === 'true'; }, function () {}));
      jobs.push(fetch(site('js/lessons/u' + u.unit + 'test.js')).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) { var m = /id:\s*'u\d+test'[^\n]*?calc:\s*(true|false)/.exec(t); if (m) out['t' + u.unit] = m[1] === 'true'; }, function () {}));
    });
    return (calcFlags = Promise.all(jobs).then(function () { return out; }));
  }
  function exists(url) { return fetch(url, { method: 'HEAD' }).then(function (r) { return r.ok; }, function () { return false; }); }
  B.sub = function (code, date, block) {
    return Promise.all([B.classes(), B.entries(code, date, date, block), calcInfo()]).then(function (r) {
      var cls = r[0].ok ? r[0].classes.filter(function (c) { return c.code === code; })[0] : null, ent = r[1], calc = r[2];
      var items = (ent.ok && ent.days[date]) || [];
      return Promise.all(items.map(function (it) {
        if (it.kind !== 'lesson' && it.kind !== 'intro' && it.kind !== 'test') return Promise.resolve(it);
        it.calc = calc[it.kind === 'test' ? 't' + it.unit : it.key];
        var notes = site('assets/notes/' + ((root.BRIDGE_COURSE || {}).notes || 'math10c') + '-unit-' + it.unit + '-notes.pdf');
        return Promise.all([it.kind === 'lesson' ? exists(site('js/lessons/' + it.key + '.js')) : Promise.resolve(false), exists(notes)]).then(function (z) {
          it.practice = z[0]; it.practiceUrl = z[0] ? site('#/lesson/' + it.key) : ''; it.notesUrl = z[1] ? notes : ''; return it;
        });
      })).then(function (list) {
        return { ok: true, kind: 'math', items: list, none: !!ent.none, signIn: { url: site('?class=' + encodeURIComponent(cls ? cls.show : code)), code: cls ? cls.show : code, site: site() }, label: cls ? cls.label : code, students: cls ? cls.students : 0 };
      });
    });
  };
  B.ledger = function (code) { return new URL('./' + (code ? '?class=' + encodeURIComponent(code) : ''), location.href).href; };
  try { root.parent && root.parent !== root && root.parent.postMessage({ type: 'course-bridge-ready' }, location.origin); } catch (e) {}
})(window);
