/* All lessons (the teaching site's home page): a Lessons / Class calendar toggle. The calendar is the class's plan
 * from the Teacher Ledger (Calendar tab), read from the practice site's ledger (js/config.js backend) by block letter:
 * ?class=B, else the last class used on this device. Each day links to that day's lesson page for the class.
 * Months scroll; weekends are narrow and grey. The lesson cards also keep the class (?class=B) in their links. */
(function (root) {
  'use strict';
  var HW = root.HW || {}, C = HW.Cal, cfg = root.HW_CONFIG || {};
  if (!C) return;
  var BLOCKS = ['A', 'B', 'C', 'D'];
  function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function el(t, c, h) { var e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var q = new URLSearchParams(location.search), cls = String(q.get('class') || q.get('c') || ls('lessons:class') || '').toUpperCase().replace(/[^A-D]/g, '').slice(0, 1);
  var view = location.hash === '#calendar' ? 'cal' : location.hash === '#lessons' ? 'list' : (ls('lessons:view') || 'list');
  var data = null; try { data = JSON.parse(ls('lessons:cal:' + cls) || 'null'); } catch (e) { data = null; }

  var wrap = document.querySelector('.home-wrap'), links = document.querySelector('.home-links'); if (!wrap || !links) return;
  var bar = el('div', 'hc-bar'), box = el('div', 'hc-cal');
  links.parentNode.insertBefore(bar, links.nextSibling); links.parentNode.insertBefore(box, bar.nextSibling);
  var sections = function () { return [].slice.call(wrap.querySelectorAll('section')); };

  function setClass(c) {
    cls = c; ls('lessons:class', c);
    var u = new URL(location.href); if (c) u.searchParams.set('class', c); else u.searchParams.delete('class'); history.replaceState(null, '', u);
    try { data = JSON.parse(ls('lessons:cal:' + cls) || 'null'); } catch (e) { data = null; }
    keepClassInLinks(); draw(); load();
  }
  /* lesson cards open the lesson for this class */
  function keepClassInLinks() {
    wrap.querySelectorAll('a.lcard').forEach(function (a) { var h = a.getAttribute('href').split('?')[0]; a.setAttribute('href', cls ? h + '?class=' + cls : h); });
  }
  function draw() {
    bar.innerHTML = '';
    var tog = el('div', 'hc-tog');
    [['list', 'Lessons'], ['cal', '📅 Class calendar']].forEach(function (x) {
      var b = el('button', x[0] === view ? 'on' : '', x[1]); b.type = 'button';
      b.addEventListener('click', function () { view = x[0]; ls('lessons:view', view); history.replaceState(null, '', location.pathname + location.search + (view === 'cal' ? '#calendar' : '#lessons')); draw(); });
      tog.appendChild(b);
    });
    bar.appendChild(tog);
    var pick = el('div', 'hc-cls', '<span>Class</span>');
    BLOCKS.forEach(function (b) { var x = el('button', b === cls ? 'on' : '', b); x.type = 'button'; x.title = 'Block ' + b; x.addEventListener('click', function () { setClass(b); }); pick.appendChild(x); });
    bar.appendChild(pick);
    var D = data && data.cal ? { cal: C.clean(data.cal), off: data.noSchool || [] } : null;
    if (D) {
      var nt = C.nextTest(D.cal, D.off, C.today());
      if (nt) bar.appendChild(el('div', 'next-test' + (nt.inDays <= 2 ? ' soon' : ''), '📝 Next test: <b>' + esc(nt.info.title) + '</b> · ' + esc(nt.date === C.today() ? 'today' : C.nice(nt.date) + (nt.inDays === 1 ? ' · next class' : nt.inDays > 1 ? ' · in ' + nt.inDays + ' classes' : ''))));
    }
    sections().forEach(function (s) { s.hidden = view === 'cal'; });
    box.hidden = view !== 'cal'; box.innerHTML = '';
    if (view !== 'cal') return;
    if (!cls) { box.appendChild(el('p', 'muted', 'Pick a class to see its calendar.')); return; }
    if (!D) { box.appendChild(el('p', 'muted', data && data.loading === false ? 'Block ' + cls + ' doesn’t have a calendar yet — make one in the Teacher Ledger (Calendar tab).' : 'Loading Block ' + cls + '’s calendar…')); return; }
    var today = C.today(), on = C.on(D.cal, D.off, today);
    if (on.length) box.appendChild(el('p', 'cal-today', 'Today: ' + on.map(function (k) { var i = C.info(k); return '<b>' + esc(i.kind === 'test' ? i.title : 'Lesson ' + i.num + ' — ' + i.title) + '</b>'; }).join(' and ')));
    var v = C.view(D.cal, { off: D.off, today: today, chip: chip }); box.appendChild(v);
    box.appendChild(el('p', 'muted hc-foot', 'Plan and move lessons in the Teacher Ledger’s Calendar tab. Scroll for other months.'));
    requestAnimationFrame(function () { v.scrollToDate(today < D.cal.start ? D.cal.start : today); });
  }
  function chip(key) {
    var i = C.info(key), m = /^u(\d+)l(\w+)$/.exec(key);
    if (i.kind === 'test') return el('div', 'calm-chip test', '<b>' + esc(i.title) + '</b><span class="ct">' + esc(i.unitTitle) + '</span>');
    var a = el('a', 'calm-chip', '<b>U' + i.unit + ' · Lesson ' + esc(i.num) + '</b><span class="ct">' + esc(i.title) + '</span>');
    a.href = 'u' + m[1] + '/l' + m[2] + '/' + (cls ? '?class=' + cls : ''); a.title = 'Lesson ' + i.num + ': ' + i.title;
    return a;
  }
  /* the ledger's public "cal" request (fetch, or JSONP if the browser blocks the redirect) */
  function get(params) {
    var url = cfg.backend; if (!url) return Promise.reject(new Error('no ledger'));
    var qs = Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(url + '?' + qs, { credentials: 'omit' }).then(function (r) { if (!r.ok) throw new Error('http'); return r.json(); }).catch(function () {
      return new Promise(function (res, rej) {
        var name = 'hcCal' + Date.now(), s = document.createElement('script');
        root[name] = function (d) { delete root[name]; s.remove(); res(d); };
        s.onerror = function () { delete root[name]; s.remove(); rej(new Error('network')); };
        s.src = url + '?' + qs + '&callback=' + name; document.head.appendChild(s);
      });
    });
  }
  function load() {
    if (!cls) return;
    var want = cls;
    get({ action: 'cal', block: want }).then(function (d) {
      if (want !== cls || !d || !d.ok) return;
      var next = { cal: d.cal || null, noSchool: d.noSchool || [], loading: false }, was = JSON.stringify(data);
      data = next; ls('lessons:cal:' + want, JSON.stringify(next));
      if (was !== JSON.stringify(next)) draw();
    }).catch(function () { if (!data) { data = { cal: null, loading: false }; draw(); } });
  }
  /* unit colours on the lesson list (the same as the calendar) */
  if (HW.unitStyle) wrap.querySelectorAll('section.unit').forEach(function (sec) { var b = sec.querySelector('.unit-h .badge'), n = b && parseInt(b.textContent, 10); if (n) sec.setAttribute('style', HW.unitStyle(n)); });
  keepClassInLinks(); draw(); load();
})(window);
