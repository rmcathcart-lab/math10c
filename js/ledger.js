/* Talking to the teacher's ledger (Google Apps Script web app, see backend/Code.gs).
 * Reads:  GET  <backend>?action=…  (fetch without cookies; JSONP fallback)
 * Writes: POST <backend>  text/plain JSON { class, name, token, events, status, progress } (no-cors; batched every 15 s,
 *         right away for important events, and with sendBeacon when the page is hidden or closed).
 * With no backend configured, everything stays on the device. */
(function (root) {
  'use strict';
  var HW = root.HW, cfg = root.HW_CONFIG || {}, URL = cfg.backend || '';
  var L = HW.Ledger = { enabled: !!URL, session: null, queue: [], status: null, progress: {}, lastPost: 0, ok: null, listeners: [] };
  var cbN = 0;
  function qs(params) { return Object.keys(params).filter(function (k) { return params[k] != null; }).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&'); }
  function jsonp(params, timeout) {
    return new Promise(function (resolve, reject) {
      var name = '__hwcb' + (++cbN) + '_' + Date.now(), s = document.createElement('script'), done = false;
      root[name] = function (data) { done = true; cleanup(); resolve(data); };
      function cleanup() { try { delete root[name]; } catch (e) { root[name] = undefined; } if (s.parentNode) s.parentNode.removeChild(s); }
      s.src = URL + '?' + qs(Object.assign({}, params, { callback: name }));
      s.onerror = function () { if (!done) { cleanup(); reject(new Error('network')); } };
      setTimeout(function () { if (!done) { cleanup(); reject(new Error('timeout')); } }, timeout || 15000);
      document.head.appendChild(s);
    });
  }
  /* A read that ran out of time is NOT sent again as JSONP: when the server is slow because it's busy, a second copy of the
   * request only makes the line longer. JSONP is the fallback for a fetch that fails outright (blocked, offline). */
  L.get = function (action, params, timeout) {
    if (!URL) return Promise.reject(new Error('no backend'));
    var p = Object.assign({ action: action }, params || {}), timedOut = false;
    var ctl = root.AbortController ? new AbortController() : null, tm = setTimeout(function () { timedOut = true; if (ctl) ctl.abort(); }, timeout || 15000);
    return fetch(URL + '?' + qs(p), { credentials: 'omit', redirect: 'follow', signal: ctl ? ctl.signal : undefined })
      .then(function (r) { clearTimeout(tm); if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .catch(function (e) { clearTimeout(tm); if (timedOut) throw new Error('timeout'); return jsonp(p, timeout); })
      .then(function (d) { setOk(true); return d; }, function (e) { setOk(false); throw e; });
  };
  /* L.call: a read that tries again by itself when the server is busy (a whole class signing in at once) or slow:
   * up to `tries` attempts, waiting a few seconds (a bit random, so 30 devices don't come back at the same moment)
   * between them. opts.onRetry(n) is told before each new try, so the page can say "Busy, trying again…". */
  L.call = function (action, params, opts) {
    opts = opts || {};
    var tries = opts.tries || 3, n = 0;
    function once() {
      n++;
      return L.get(action, params, opts.timeout || 30000).then(function (d) {
        if (d && d.error === 'busy' && n < tries) return again();
        return d;
      }, function (e) { if (n < tries && String(e && e.message) !== 'no backend') return again(); throw e; });
    }
    function again() {
      if (opts.onRetry) { try { opts.onRetry(n); } catch (e) {} }
      return new Promise(function (res) { setTimeout(res, 1500 + Math.random() * 2500 * n); }).then(once);
    }
    return once();
  };
  function setOk(v) { if (L.ok !== v) { L.ok = v; L.listeners.forEach(function (fn) { try { fn(v); } catch (e) {} }); } }
  L.onStatus = function (fn) { L.listeners.push(fn); };

  L.push = function (ev, urgent) { if (!L.session) return; ev.at = ev.at || Date.now(); L.queue.push(ev); if (urgent) L.flushSoon(400); };
  L.setStatus = function (st, urgent) { L.status = Object.assign({ at: Date.now() }, st); if (urgent) L.flushSoon(300); };
  L.setProgress = function (lessonId, summary, state) { L.progress[lessonId] = { summary: summary, state: state }; };
  var soon = null;
  L.flushSoon = function (ms) { if (soon) return; soon = setTimeout(function () { soon = null; L.flush(); }, ms || 1500); };
  function payload() {
    var s = L.session; if (!s) return null;
    var body = { 'class': s.klass, name: s.name, token: s.token, device: s.device, events: L.queue.splice(0, 200), status: L.status, sent: Date.now() };
    var prog = L.progress, keys = Object.keys(prog); if (keys.length) { body.progress = prog; L.progress = {}; }
    return body;
  }
  L.flush = function (beacon) {
    if (!URL || !L.session) { L.queue = []; L.progress = {}; return; }
    var body = payload(); if (!body) return;
    var txt = JSON.stringify(body); L.lastPost = Date.now();
    if (beacon && navigator.sendBeacon) { try { if (navigator.sendBeacon(URL, new Blob([txt], { type: 'text/plain;charset=utf-8' }))) return; } catch (e) {} }
    try { // no-cors, as before 2026-10-29 (the server no longer waits for a lock, so there is no 'busy' answer to read)
      fetch(URL, { method: 'POST', mode: 'no-cors', credentials: 'omit', keepalive: txt.length < 60000, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: txt })
        .then(function () { setOk(true); }, function () { setOk(false); requeue(body); L.waitUntil = Date.now() + 10000 + Math.random() * 10000; });
    } catch (e) { requeue(body); }
  };
  function requeue(body) { L.queue = (body.events || []).concat(L.queue).slice(-500); if (body.progress) Object.keys(body.progress).forEach(function (k) { if (!L.progress[k]) L.progress[k] = body.progress[k]; }); }
  L.start = function () {
    if (L.timer) return;
    L.timer = setInterval(function () {
      if (!L.session) return;
      if (L.waitUntil && Date.now() < L.waitUntil) return; // the server said it was busy: give it a moment
      /* Every signed-in student checks in with the server. Time-on-task ticks wait for the next check-in (at most every
       * 45 s while working, 60 s otherwise); answers, events and saved progress go right away. A whole class checking in
       * every 15 s kept the server too busy to sign students in (2026-10-29). */
      var age = Date.now() - L.lastPost, live = L.status && L.status.view === 'lesson' && !L.status.away;
      var real = L.queue.some(function (ev) { return ev.t !== 'tick'; });
      if (real || Object.keys(L.progress).length || age > (live ? 45000 : 60000)) L.flush();
    }, 5000);
    document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') L.flush(true); });
    root.addEventListener('pagehide', function () { L.flush(true); });
  };
})(window);
