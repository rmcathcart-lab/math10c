/* Teacher Ledger: a quick start. Loaded in the <head>, before everything else on the page.
 *
 * Opening the ledger used to do three slow things one after another: download the whole question bank, then ask the
 * spreadsheet for the class list, then ask it for the class. This file makes them overlap and gives the page something
 * to show straight away:
 *   1. Early requests. If this device has a teacher key, the class list, the last class's data and its calendar are
 *      asked for now, all at once, while the rest of the page is still downloading. dash.js picks the answers up
 *      (HW_FAST.take) instead of asking again.
 *   2. This device's copy. Every fresh class list, class and calendar is kept in the browser (IndexedDB, on this device
 *      only). The next time the ledger opens, dash.js shows that copy at once, marked "Saved copy from …", and swaps in
 *      the fresh data when it arrives. "Forget the teacher key on this device" erases the copy.
 * Nothing here changes what the spreadsheet holds, and the page works the same if any of it fails. */
(function (root) {
  'use strict';
  var cfg = root.HW_CONFIG || {}, URL = cfg.backend || '';
  function ls(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function hash(s) { var h = 5381; s = String(s); for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0; return h.toString(36); }
  function qs(p) { return Object.keys(p).filter(function (k) { return p[k] != null; }).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(p[k]); }).join('&'); }
  function noop() {}
  var t0 = (root.performance && performance.timeOrigin) || Date.now();
  var F = root.HW_FAST = { t0: t0, marks: {}, early: {} };
  F.mark = function (name) { if (F.marks[name] == null) F.marks[name] = Math.round(Date.now() - t0); };
  F.k = function (action, params) { return action + '|' + JSON.stringify(params || {}); };

  /* the same key and class dash.js will start with (a ?class= link from the Teaching Hub wins over the last class) */
  var key = ls('hw:tkey') || '', klass = ls('hw:tclass') || '';
  try { var qc = new URLSearchParams(location.search).get('class'); if (qc) klass = qc.trim().toLowerCase(); } catch (e) {}
  var DEMO = '__demo__', KEEP_DAYS = 7;

  /* ---- 1. early requests ---- */
  function ask(action, params) {
    var ctl = root.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 30000);   // dash.js asks again itself if this fails
    var p = fetch(URL + '?' + qs(Object.assign({ action: action, key: key }, params || {})), { credentials: 'omit', redirect: 'follow', signal: ctl ? ctl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (d) { clearTimeout(tm); F.mark(action); return d; }, function (e) { clearTimeout(tm); throw e; });
    p.catch(noop);
    F.early[F.k(action, params)] = { p: p, at: Date.now() };
  }
  if (URL && key && root.fetch) {
    try {
      ask('classes');
      if (klass && klass !== DEMO) { ask('dash', { 'class': klass }); ask('cal', { 'class': klass }); }
    } catch (e) {}
  }
  /* dash.js: the answer to a request made above (once; not for another key, and not one that has been waiting around) */
  F.take = function (action, params, forKey) {
    var k = F.k(action, params), e = F.early[k]; if (!e) return null;
    delete F.early[k];
    return forKey === key && Date.now() - e.at < 20000 ? e.p : null;
  };

  /* ---- 2. this device's copy ---- */
  var STORE = 'kv', dbp = null;
  function db() {
    return dbp || (dbp = new Promise(function (res, rej) {
      try {
        var r = root.indexedDB.open('hw-ledger-fast:' + hash(URL), 1);
        r.onupgradeneeded = function () { r.result.createObjectStore(STORE); };
        r.onsuccess = function () { res(r.result); };
        r.onerror = r.onblocked = function () { rej(r.error || new Error('indexedDB')); };
      } catch (e) { rej(e); }
    }));
  }
  function good(rec, forKey) { return rec && rec.d && rec.kh === hash(forKey) && Date.now() - rec.at < KEEP_DAYS * 86400000 ? rec : null; }
  /* get(action, params, key) -> { d, at } or null */
  F.get = function (action, params, forKey) {
    if (!URL || !forKey) return Promise.resolve(null);
    return db().then(function (d) {
      return new Promise(function (res) {
        var rq = d.transaction(STORE).objectStore(STORE).get(F.k(action, params));
        rq.onsuccess = function () { res(good(rq.result, forKey)); }; rq.onerror = function () { res(null); };
      });
    }).catch(function () { return null; });
  };
  F.put = function (action, params, data, forKey) {
    if (!URL || !forKey || !data) return;
    db().then(function (d) { d.transaction(STORE, 'readwrite').objectStore(STORE).put({ kh: hash(forKey), at: Date.now(), d: data }, F.k(action, params)); }).catch(noop);
  };
  F.forget = function () { db().then(function (d) { d.transaction(STORE, 'readwrite').objectStore(STORE).clear(); }).catch(noop); };
  /* what the page needs to draw itself, read now so it is ready when dash.js runs: { classes, dash, cal } (any may be null) */
  F.saved = key ? Promise.all([F.get('classes', null, key), klass && klass !== DEMO ? F.get('dash', { 'class': klass }, key) : null, klass && klass !== DEMO ? F.get('cal', { 'class': klass }, key) : null])
    .then(function (r) { return { klass: klass, classes: r[0], dash: r[1], cal: r[2] }; }) : Promise.resolve({});
  F.saved.catch(noop);
})(window);
