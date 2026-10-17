/* Math 10C · Unit 5 · Lesson 9 — Interpreting and Sketching Real-World Graphs (RF1)
 * Assignment questions 1–16 (u5_L09.tex) and the Lesson 9 Extra Practice (u5_EP09.tex).
 * Every part is a generator: the stories, segment lengths, rates and the order of the increasing / constant /
 * decreasing pieces change, but each version keeps the idea and difficulty of the booklet question (the booklet's
 * own numbers are one of the possible versions where practical). "Describe" questions become grids or number
 * boxes; "sketch" questions become multiple choice with four small graphs built from classic mistakes.
 * Levels: LIM BEG EMG PRG ADV MAS (recognition formats capped at PRG). */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'min-not-h': 'Gave minutes where hours were asked', 'per-min': 'Rate per minute instead of per hour', 'rate-flip': 'Rate as time ÷ distance (upside down)',
    'wrong-line': 'Read the wrong line / segment', 'rate-sign': 'Sign of a rate of change wrong', 'speed-sign': 'Gave a speed as a negative number',
    'swap-axes': 'Mixed up the horizontal and vertical readings', 'bounce-count': 'Miscounted the bounces', 'stop-vs-land': 'Mixed up where the ball lands and where it stops',
    'pct-original': 'Took the percent of the original height every time', 'pct-lost': 'Used the percent lost instead of the percent kept', 'pct-linear': 'Subtracted the same amount every bounce', 'pct-shift': 'Off by one bounce',
    'one-stop': 'Counted only one of the stops', 'dist-vs-travel': 'Distance from home confused with distance travelled', 'months': 'Wrong number of payments',
    'shared-time': 'Gave an arrival time instead of the difference', 'avg-speed': 'Average speed wrong', 'ratio': 'Comparison of rates wrong', 'flat-time': 'Total time on flat segments wrong',
    'rate-unit': 'Rate in the wrong units', 'dist-speed': 'Distance from a speed graph wrong'
  });

  /* ---------- small helpers ---------- */
  var NAMES = ['Derek', 'Farah', 'Grace', 'Amir', 'Beth', 'Cai', 'Dev', 'Eryn', 'Fen', 'Jules', 'Maya', 'Owen', 'Nia', 'Theo', 'Ravi', 'Lena', 'Kofi', 'Ana', 'Mateo', 'Zoe', 'Iris', 'Sam', 'Tariq', 'Hana'];
  var C1 = '#13807a', C2 = '#b0562b', C3 = '#6a4fb0', INK = '#2b3340';
  function dn(x) { var v = Math.round(x * 1000) / 1000; return v < 0 ? '-' + Math.abs(v) : String(v); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a || 1; }
  function rat(x) { for (var q = 1; q <= 240; q++) { var p = Math.round(x * q); if (Math.abs(p - x * q) < 1e-9) { var g = gcd(p, q); return [p / g, q / g]; } } return [x, 1]; }
  function fr(x) { return K.ratTex(rat(x)); }
  function hm(h) { var H = Math.floor(h + 1e-9), m = Math.round((h - H) * 60); if (m === 60) { H++; m = 0; } return H + ':' + (m < 10 ? '0' : '') + m; }
  function near(a, b) { return Math.abs(a - b) < 1e-6; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function units(s) { return '\\text{ ' + s + '}'; }
  /* a compact horizontal table (fits 7 data columns on a phone) */
  function ctable(rows) {
    return '<table class="vtab" style="font-size:14px">' + rows.map(function (r) { return '<tr>' + r.map(function (c, i) { var h = typeof c === 'number' ? String(c) : HW.tex(String(c)); return i === 0 ? '<th style="padding:3px 6px">' + h + '</th>' : '<td style="padding:3px 5px;min-width:0">' + h + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
  }

  /* ---------- drawings: HW.graph plus custom ticks, text notes and numbered badges ---------- */
  function geo(g) { // the same geometry HW.graph uses
    var xr = g.x, yr = g.y, padL = g.yTitle ? 40 : 22, padT = 14;
    var U = g.unit || Math.max(14, Math.min(32, 300 / Math.max(xr[1] - xr[0], yr[1] - yr[0]))), ux = g.unitX || U, uy = g.unitY || U;
    return { X: function (x) { return padL + (x - xr[0]) * ux; }, Y: function (y) { return padT + (yr[1] - y) * uy; },
      ax0: Math.max(xr[0], Math.min(xr[1], 0)), ay0: Math.max(yr[0], Math.min(yr[1], 0)) };
  }
  function fig(g) {
    var svg = HW.graph(g), G = geo(g), s = '', fs = g.tickSize || 11;
    (g.xt || []).forEach(function (p) { var x = G.X(p[0]), y = G.Y(G.ay0); s += '<line x1="' + x + '" y1="' + (y - 3) + '" x2="' + x + '" y2="' + (y + 3) + '" stroke="' + INK + '" stroke-width="1.2"/><text x="' + x + '" y="' + (y + 14) + '" font-size="' + fs + '" text-anchor="middle" fill="#4a5262">' + esc(p[1]) + '</text>'; });
    (g.yt || []).forEach(function (p) { var x = G.X(G.ax0), y = G.Y(p[0]); s += '<line x1="' + (x - 3) + '" y1="' + y + '" x2="' + (x + 3) + '" y2="' + y + '" stroke="' + INK + '" stroke-width="1.2"/><text x="' + (x - 5) + '" y="' + (y + 4) + '" font-size="' + fs + '" text-anchor="end" fill="#4a5262">' + esc(p[1]) + '</text>'; });
    (g.notes || []).forEach(function (n) {
      var x = G.X(n.x) + (n.dx || 0), y = G.Y(n.y) + (n.dy || 0), c = n.color || INK;
      if (n.badge) s += '<circle cx="' + x + '" cy="' + y + '" r="8.5" fill="#fff" stroke="' + c + '" stroke-width="1.8"/><text x="' + x + '" y="' + (y + 4) + '" font-size="11.5" font-weight="700" text-anchor="middle" fill="' + c + '">' + esc(n.text) + '</text>';
      else s += '<text x="' + x + '" y="' + y + '" font-size="' + (n.size || 12) + '"' + (n.bold ? ' font-weight="700"' : '') + (n.italic ? ' font-style="italic"' : '') + ' text-anchor="' + (n.anchor || 'middle') + '" fill="' + c + '">' + esc(n.text) + '</text>';
    });
    return s ? svg.replace('</svg>', s + '</svg>') : svg;
  }
  /* an unscaled sketch on x 0–10, y 0–6 (shape only). sh = { segs, fns, points, notes }; o = { xT, yT, pad, X, Y, unit, max } */
  function sk(sh, o) {
    o = o || {};
    return fig({ x: [0, o.X || 10], y: [0, o.Y || 6], grid: 0, labels: 0, firstQuadrant: true, xName: o.xn || ' ', yName: o.yn || ' ', unit: o.unit || 14,
      yTitle: o.pad ? ' ' : o.yTitle, xTitle: o.xTitle, segs: sh.segs, fns: sh.fns, points: sh.points, xt: o.xT, yt: o.yT, notes: (sh.notes || []).concat(o.notes || []), max: o.max || 190, aria: o.aria || 'sketch of a graph' });
  }
  function Ln(pts, o) { return Object.assign({ pts: pts }, o || {}); }
  function Fn(f, a, b, o) { return Object.assign({ f: f, from: a, to: b }, o || {}); }
  /* shape library (x from about 0.3 to 9.6) */
  var S = {
    up: function () { return { segs: [Ln([[0.3, 0.6], [9.6, 5.3]])] }; },
    down: function () { return { segs: [Ln([[0.3, 5.3], [9.6, 0.6]])] }; },
    down0: function (end) { return { segs: [Ln([[0.3, 5.3], [end || 8.4, 0]])] }; },
    upSlow: function () { return { fns: [Fn(function (x) { return 0.6 + 4.9 * (1 - Math.exp(-0.38 * (x - 0.3))); }, 0.3, 9.6)] }; },
    upFast: function () { return { fns: [Fn(function (x) { return 0.6 + 0.054 * (x - 0.3) * (x - 0.3); }, 0.3, 9.6)] }; },
    downSlow: function (floor) { var f0 = floor == null ? 1.3 : floor; return { fns: [Fn(function (x) { return f0 + (5.3 - f0) * Math.exp(-0.42 * (x - 0.3)); }, 0.3, 9.6)] }; },
    downFast: function () { return { fns: [Fn(function (x) { return 5.3 - 0.054 * (x - 0.3) * (x - 0.3); }, 0.3, 9.6)] }; },
    wave: function (n, phase, lo, hi) {
      lo = lo == null ? 0.9 : lo; hi = hi == null ? 5.1 : hi;
      var m = (lo + hi) / 2, a = (hi - lo) / 2, P = 9.3 / n;
      var g = { rise: Math.sin, dip: function (u) { return -Math.sin(u); }, low: function (u) { return -Math.cos(u); }, high: Math.cos }[phase || 'rise'];
      return { fns: [Fn(function (x) { return m + a * g(2 * Math.PI * (x - 0.3) / P); }, 0.3, 9.6)] };
    },
    damped: function (n, lo) { lo = lo == null ? 0.6 : lo; var P = 9.3 / n; return { fns: [Fn(function (x) { var u = x - 0.3, A = 4.4 * Math.exp(-0.22 * u); return lo + A * (1 - Math.cos(2 * Math.PI * u / P)) / 2; }, 0.3, 9.6)] }; },
    hill: function (peak, lo, hi, end) { // smooth rise to a peak at x = peak, then a fall to `end`
      lo = lo == null ? 0.8 : lo; hi = hi == null ? 4.9 : hi; end = end == null ? lo : end;
      return { fns: [Fn(function (x) { return x <= peak ? lo + (hi - lo) * (1 - Math.cos(Math.PI * (x - 0.3) / (peak - 0.3))) / 2 : hi - (hi - end) * (1 - Math.cos(Math.PI * (x - peak) / (9.6 - peak))) / 2; }, 0.3, 9.6)] };
    },
    valley: function (low, hi, lo, end) { hi = hi == null ? 4.6 : hi; lo = lo == null ? 1 : lo; end = end == null ? hi : end;
      return { fns: [Fn(function (x) { return x <= low ? hi - (hi - lo) * (1 - Math.cos(Math.PI * (x - 0.3) / (low - 0.3))) / 2 : lo + (end - lo) * (1 - Math.cos(Math.PI * (x - low) / (9.6 - low))) / 2; }, 0.3, 9.6)] }; }
  };
  /* graph options are stacked in one column: in two columns a phone leaves under 90 px per graph */
  function mcG(r, prompt, opts, sol, hints, text) { return K.P.mc(r, prompt, opts, sol, hints, text); }
  /* a typed number with diagnoses: cands = [{ v, code, hint }] (skipped when equal to the answer) */
  function numDiag(ans, cands, extra) {
    return function (v) {
      for (var i = 0; i < cands.length; i++) { var c = cands[i]; if (c.v != null && isFinite(c.v) && !near(c.v, ans) && near(v, c.v)) return { code: c.code, hint: c.hint }; }
      return extra ? extra(v) : null;
    };
  }
  function numPart(prompt, ans, cands, sol, hints, text, inp) {
    var p = K.P.number(prompt, ans, numDiag(ans, cands), sol, hints, text, inp);
    p.answer = t(dn(ans) + (inp && inp.after ? units(inp.after) : ''));
    p.key = dn(ans);
    p.bad = cands.filter(function (c) { return c.v != null && isFinite(c.v) && !near(c.v, ans); }).map(function (c) { return dn(c.v); });
    return p;
  }
  function numBox(label, after) { return { label: label, name: label.replace(/:$/, ''), after: after }; }
  function mathBox(label, after) { return { label: label, name: label.replace(/:$/, ''), mode: 'math', keys: 'fraction', after: after }; }
  /* rate diagnoses: dy over dxMin minutes, asked per hour (perHour) or per minute/second (not converted) */
  function rateCands(dy, dx, perHour, ans) {
    var c = [];
    if (perHour) c.push({ v: dy / dx, code: 'per-min', hint: 'That is the change <b>per minute</b>. Change the minutes to hours first (or multiply your answer by ' + t('60') + ') to get the rate per hour.' });
    c.push({ v: perHour ? dx / 60 / dy : dx / dy, code: 'rate-flip', hint: 'Rate of change is <b>change in the vertical quantity ÷ change in time</b> — your division is upside down.' });
    if (perHour) c.push({ v: dx / dy, code: 'rate-flip', hint: 'Rate of change is <b>change in the vertical quantity ÷ change in time</b> — your division is upside down.' });
    if (ans) c.push({ v: -ans, code: 'rate-sign', hint: ans < 0 ? 'Check the sign: the quantity is going <b>down</b> on this segment, so its rate of change is negative.' : 'Check the sign: the quantity is going <b>up</b> on this segment, so its rate of change is positive.' });
    return c;
  }

  /* ---------- Q1 & Q16: three friends travelling the same route ---------- */
  var ROUTES = [['the mall', 'the stadium'], ['school', 'the recreation centre'], ['the library', 'the arena'], ['the bus loop', 'the lake'], ['the hotel', 'the ski hill']];
  var FRIEND_C = (function () {
    var out = [];
    [4, 5, 6, 8, 10, 12].forEach(function (D) { [15, 30].forEach(function (tc) { [30, 45, 60, 75, 90].forEach(function (tj) { [60, 75, 90, 105, 120, 135, 150, 165, 180].forEach(function (tw) {
      if (!(tc < tj && tj < tw)) return;
      var rc = 60 * D / tc, rj = 60 * D / tj, rw = 60 * D / tw;
      if ([rc, rj, rw].some(function (x) { return Math.abs(x - Math.round(x)) > 1e-9; })) return;
      if (rc < 12 || rc > 30 || rj < 6 || rj > 12 || rw < 3 || rw > 6) return;
      out.push({ D: D, tc: tc, tj: tj, tw: tw });
    }); }); }); });
    return out;
  })();
  function friends(r, allowBook) {
    var book = allowBook && r.chance(0.3), c = book ? { D: 6, tc: 15, tj: 45, tw: 90 } : r.pick(FRIEND_C);
    var nm = book ? ['Derek', 'Farah', 'Grace'] : r.sample(NAMES, 3), ln = book ? [2, 1, 3] : r.shuffle([1, 2, 3]), rt = book ? ROUTES[0] : r.pick(ROUTES);
    var sc = { D: c.D, from: rt[0], to: rt[1], who: ['cyc', 'jog', 'walk'] };
    sc.t = { cyc: c.tc, jog: c.tj, walk: c.tw }; sc.name = { cyc: nm[0], jog: nm[1], walk: nm[2] }; sc.line = { cyc: ln[0], jog: ln[1], walk: ln[2] };
    sc.rate = {}; sc.who.forEach(function (k) { sc.rate[k] = 60 * c.D / sc.t[k]; });
    sc.byLine = {}; sc.who.forEach(function (k) { sc.byLine[sc.line[k]] = k; });
    sc.verb = { cyc: 'cycles', jog: 'jogs', walk: 'walks' };
    return sc;
  }
  function friendsFig(sc, letters) {
    var tw = sc.t.walk, X = tw + 15, Y = sc.D + (sc.D <= 6 ? 1 : 2), step = tw <= 90 ? 15 : 30, ys = sc.D <= 6 ? 1 : 2;
    var col = { cyc: C1, jog: C2, walk: C3 }, at = { cyc: 0.38, jog: 0.58, walk: 0.78 }, xt = [], yt = [], notes = [], segs = [], pts = [];
    for (var m = step; m < X; m += step) xt.push([m, String(m)]);
    for (var y = ys; y <= sc.D; y += ys) yt.push([y, String(y)]);
    sc.who.forEach(function (k) {
      segs.push({ pts: [[0, 0], [sc.t[k], sc.D]].concat(k === 'walk' ? [] : [[X - 4, sc.D]]), color: col[k] });
      notes.push({ badge: true, x: at[k] * sc.t[k], y: at[k] * sc.D, text: String(sc.line[k]), color: col[k] });
    });
    if (letters) {
      notes.push({ x: 0, y: 0, dx: -5, dy: -5, text: 'W', anchor: 'end', bold: true });
      [['cyc', 'X'], ['jog', 'Y'], ['walk', 'Z']].forEach(function (p) { pts.push({ x: sc.t[p[0]], y: sc.D }); notes.push({ x: sc.t[p[0]], y: sc.D, dy: -9, text: p[1], bold: true }); });
      pts.push({ x: 0, y: 0 });
    }
    return fig({ x: [0, X], y: [0, Y], grid: 15, gridY: ys, labels: 0, firstQuadrant: true, unitX: 290 / X, unitY: 150 / Y, xName: ' ', yName: ' ',
      xTitle: 'Time (min)', yTitle: 'Distance (km)', segs: segs, points: pts, xt: xt, yt: yt, notes: notes, max: 400, aria: 'distance-time graph of three trips' });
  }
  function friendsStem(sc, letters) {
    return 'Three friends — ' + sc.name.cyc + ', ' + sc.name.jog + ' and ' + sc.name.walk + ' — each travel the same ' + t(sc.D + units('km')) + ' route from ' + sc.from + ' to ' + sc.to +
      ' at a constant speed. ' + sc.name.cyc + ' cycles, ' + sc.name.jog + ' jogs and ' + sc.name.walk + ' walks, and all three leave at the same time. The numbered lines 1, 2 and 3 show the three trips.' + friendsFig(sc, letters);
  }
  function hTex(min) { return fr(min / 60); }

  /* ---------- Q2: a kicked ball (height against horizontal distance) ---------- */
  function kick(r) {
    var book = r.chance(0.3);
    var H = book ? 8 : r.int(6, 12), dp = book ? 25 : r.pick([20, 25, 30]), L = book ? 54 : 2 * dp + r.pick([2, 4, 6]), nb = book ? 2 : r.pick([2, 2, 3]);
    var w = book ? [3, 1.5] : nb === 2 ? r.pick([[3, 1.5], [4, 2]]) : [4, 2, 1], h = [H * 0.27, H * 0.1, H * 0.035];
    var end = L + w.slice(0, nb).reduce(function (a, b) { return a + b; }, 0), S = book ? 60 : Math.ceil(end + r.pick([1, 2, 3]));
    return { H: H, dp: dp, L: L, nb: nb, w: w.slice(0, nb), h: h.slice(0, nb), rollFrom: end, S: S };
  }
  function kickFig(k) {
    var X = k.S + 8, Y = k.H + 2, fns = [], x0 = k.L;
    fns.push(Fn(function (x) { return x <= k.dp ? k.H * (1 - Math.pow((k.dp - x) / k.dp, 2)) : k.H * (1 - Math.pow((x - k.dp) / (k.L - k.dp), 2)); }, 0, k.L));
    k.w.forEach(function (wd, i) { var a = x0, c = a + wd / 2, hh = k.h[i]; fns.push(Fn(function (x) { return Math.max(0, hh * (1 - Math.pow((x - c) / (wd / 2), 2))); }, a, a + wd)); x0 += wd; });
    var yt = []; for (var y = 2; y <= Y - 0.5; y += 2) yt.push([y, String(y)]);
    return fig({ x: [0, X], y: [0, Y], grid: 0, gridY: 1, labels: 0, firstQuadrant: true, unitX: 300 / X, unitY: 150 / Y, xName: ' ', yName: ' ', xTitle: 'Horizontal distance (m)', yTitle: 'Height (m)',
      fns: fns, segs: [{ pts: [[k.rollFrom, 0], [k.S, 0]], end: 'closed' }], xt: [[k.dp, String(k.dp)], [k.L, String(k.L)], [k.S, String(k.S)]], yt: yt, max: 400,
      aria: 'height of a kicked ball against distance' });
  }

  /* ---------- Q3: fuel in a delivery van over a day ---------- */
  function vanDay(r) {
    var book = r.chance(0.3);
    for (var k = 0; k < 2000; k++) {
      var lv = book ? [0.75, 0.5, 0.25, 0.125] : r.pick([[0.75, 0.5, 0.25, 0.125], [1, 0.75, 0.5, 0.125], [1, 0.75, 0.25, 0.125], [1, 0.5, 0.25, 0.125]]);
      var d = book ? [1, 0.75, 1.25, 1.5, 0.5, 0.25, 2.75] : [r.pick([0.5, 1, 1.5]), r.pick([0.5, 0.75, 1]), r.pick([0.75, 1, 1.25, 1.5]), r.pick([1, 1.5, 2]), r.pick([0.5, 0.75]), 0.25, r.pick([1.5, 1.75, 2, 2.25, 2.5, 2.75, 3])];
      var fe = book ? 0.5 : r.pick([0.5, 0.75]);
      var tt = [8]; d.forEach(function (x) { tt.push(tt[tt.length - 1] + x); });
      var d4 = 18 - tt[7]; if (d4 < 1 || d4 > 3) { if (book) book = false; continue; }
      if (d[3] <= d[1]) { if (book) book = false; continue; }
      var drops = [(lv[0] - lv[1]) / d[0], (lv[1] - lv[2]) / d[2], (lv[2] - lv[3]) / d[4], (1 - fe) / d4];
      var srt = drops.slice().sort(function (a, b) { return b - a; }); if (srt[0] < 1.25 * srt[1]) { if (book) book = false; continue; }
      tt.push(18);
      var pts = [[tt[0], lv[0]], [tt[1], lv[1]], [tt[2], lv[1]], [tt[3], lv[2]], [tt[4], lv[2]], [tt[5], lv[3]], [tt[6], 1], [tt[7], 1], [tt[8], fe]];
      var kinds = ['drive', 'stop', 'drive', 'stop', 'drive', 'fill', 'stop', 'drive'];
      return { lv: lv, d: d, d4: d4, fe: fe, tt: tt, pts: pts, kinds: kinds, drops: drops, fast: drops.indexOf(srt[0]), name: r.pick(['Lin', 'Maya', 'Kofi', 'Ravi', 'Ana', 'Theo']), job: r.pick(['delivers flowers for a shop', 'delivers parcels', 'delivers groceries', 'runs a mobile bike-repair service']) };
    }
  }
  function vanFig(v) {
    var xt = [], yt = [[0, 'E'], [0.25, '¼'], [0.5, '½'], [0.75, '¾'], [1, 'F']];
    for (var h = 8; h <= 18; h += 2) xt.push([h, h + ':00']);
    return fig({ x: [8, 18.6], y: [0, 1.18], grid: 0.5, gridY: 0.25, labels: 0, unitX: 300 / 10.6, unitY: 130, xName: ' ', yName: ' ', xTitle: 'Time of day', yTitle: 'Fuel in tank',
      segs: [{ pts: v.pts }], xt: xt, yt: yt, max: 400, aria: 'fuel in the tank during the day' });
  }
  function vanRows(v) { return v.kinds.map(function (k, i) { return { id: 's' + i, html: hm(v.tt[i]) + '–' + hm(v.tt[i + 1]), kind: k }; }); }

  /* ---------- Q5: bouncing ball ---------- */
  function ballFig(H0, p, kind) {
    var hs = [H0]; for (var i = 1; i <= 4; i++) hs.push(H0 * Math.pow(p, i));
    var sc = 5.2 / (H0 * 1.06), fns = [], T = Math.sqrt(H0) + 2 * hs.slice(1).reduce(function (a, h) { return a + Math.sqrt(h); }, 0), tx = 9.4 / T, x0 = 0.25;
    if (kind === 'float') {
      return sk({ fns: [Fn(function (x) { var u = x - x0; return sc * (H0 * 0.55 + H0 * 0.45 * Math.exp(-0.28 * u) * Math.cos(2 * Math.PI * u / 2.2)); }, x0, 9.6)] }, { pad: true, yT: [[H0 * sc, String(H0)]] });
    }
    var arch = kind === 'same' ? [H0, H0, H0, H0, H0] : hs;
    if (kind === 'ground') {
      var wg = 2 * Math.sqrt(H0) * tx * 0.8, a0 = x0; fns.push(Fn(function (x) { return sc * H0 * (1 - Math.pow((x - a0 - wg / 2) / (wg / 2), 2)); }, a0, a0 + wg)); x0 = a0 + wg;
      tx = (9.6 - x0) / (2 * hs.slice(1).reduce(function (a, h) { return a + Math.sqrt(h); }, 0));
    } else {
      var w0 = Math.sqrt(H0) * tx; fns.push(Fn(function (x) { return sc * H0 * (1 - Math.pow((x - x0) / w0, 2)); }, x0, x0 + w0)); x0 += w0;
    }
    if (kind === 'same') tx = (9.6 - x0) / (8 * Math.sqrt(H0));
    for (var j = 1; j <= 4; j++) {
      (function (h, a) { var w = 2 * Math.sqrt(h) * tx; fns.push(Fn(function (x) { return Math.max(0, sc * h * (1 - Math.pow((x - a - w / 2) / (w / 2), 2))); }, a, a + w)); x0 = a + w; })(arch[j], x0);
    }
    return sk({ fns: fns }, { pad: true, yT: [[H0 * sc, String(H0)]] });
  }

  /* ---------- Q9: out to a second place, then home ---------- */
  function lineDiagram(places, gaps) { // home --- a --- b
    var tot = gaps[0] + gaps[1], W = 320, x0 = 24, x1 = W - 24, X = function (d) { return x0 + (x1 - x0) * d / tot; }, s = '<rect width="' + W + '" height="58" fill="#fff"/>';
    s += '<line x1="' + x0 + '" y1="30" x2="' + x1 + '" y2="30" stroke="' + INK + '" stroke-width="1.6"/>';
    [0, gaps[0], tot].forEach(function (d, i) { s += '<circle cx="' + X(d) + '" cy="30" r="4" fill="' + INK + '"/><text x="' + X(d) + '" y="50" font-size="12.5" text-anchor="middle" fill="' + INK + '">' + esc(places[i]) + '</text>'; });
    s += '<text x="' + X(gaps[0] / 2) + '" y="22" font-size="12.5" text-anchor="middle" fill="' + INK + '">' + gaps[0] + ' km</text><text x="' + X(gaps[0] + gaps[1] / 2) + '" y="22" font-size="12.5" text-anchor="middle" fill="' + INK + '">' + gaps[1] + ' km</text>';
    return '<svg class="fig-svg" viewBox="0 0 ' + W + ' 58" style="max-width:340px" role="img" aria-label="map of the route">' + s + '</svg>';
  }

  /* ---------- Q14: a cooling drink ---------- */
  function cooling(r) {
    if (r.chance(0.25)) return { T: [80, 62, 49, 40, 34, 30, 27], R: 20, q: 0.7, T0: 80, drink: 'hot chocolate' };
    for (var k = 0; k < 200; k++) {
      var T0 = r.pick([75, 80, 85, 90]), R = r.pick([20, 21, 22]), q = r.pick([0.65, 0.7, 0.75]), T = [];
      for (var i = 0; i <= 6; i++) T.push(Math.round(R + (T0 - R) * Math.pow(q, i)));
      var okk = true; for (i = 1; i <= 6; i++) if (T[i] >= T[i - 1]) okk = false;
      if (okk) return { T: T, R: R, q: q, T0: T0, drink: r.pick(['hot chocolate', 'tea', 'coffee', 'soup']) };
    }
  }
  function coolFig(c, kind) {
    var ts = [0, 5, 10, 15, 20, 25, 30], model = function (x) { return c.R + (c.T0 - c.R) * Math.pow(c.q, x / 5); }, segs = [], fns = [], pts;
    if (kind === 'right') { pts = ts.map(function (x, i) { return { x: x, y: c.T[i] }; }); fns.push(Fn(model, 0, 30)); }
    if (kind === 'line') { pts = ts.map(function (x, i) { return { x: x, y: c.T[i] }; }); segs.push({ pts: [[0, c.T[0]], [30, c.T[6]]] }); }
    if (kind === 'bend') { var f = function (x) { return c.T[0] - (c.T[0] - c.T[6]) * Math.pow(x / 30, 2); }; pts = ts.map(function (x) { return { x: x, y: f(x) }; }); fns.push(Fn(f, 0, 30)); }
    if (kind === 'late') { pts = ts.map(function (x, i) { return { x: x + 5, y: c.T[i] }; }); fns.push(Fn(function (x) { return model(x - 5); }, 5, 35)); }
    var yt = [], xt = []; for (var y = 20; y <= 80; y += 20) yt.push([y, String(y)]); for (var x = 10; x <= 30; x += 10) xt.push([x, String(x)]);
    return fig({ x: [0, 37], y: [0, 95], grid: 5, gridY: 10, labels: 0, firstQuadrant: true, unitX: 3.6, unitY: 1.05, xName: 't', yName: 'T', yTitle: ' ', segs: segs, fns: fns, points: pts, xt: xt, yt: yt, max: 200, aria: 'temperature graph' });
  }

  /* ---------- Q15 and other situation banks ---------- */
  var SIT = {
    constDown: ['the height of a candle that sits unlit for an hour, then is lit and burns steadily', 'the water in a full rain barrel that sits untouched, then is pumped out at a steady rate', 'the fuel in a parked car’s tank, before and then during a long drive at a steady highway speed'],
    constUp: ['the distance from home of a parked car that then drives away at a steady speed', 'the water in an empty bathtub before and after the tap is turned on and runs steadily', 'the money earned by a worker who waits for her shift to start, then earns the same amount every hour'],
    upConst: ['the distance from home of a cyclist who rides away at a steady speed, then stops to rest', 'the water in a tub that is filled at a steady rate, then left full'],
    downConst: ['the height of a candle that burns steadily, then is blown out', 'the water in a tank that drains at a steady rate until the valve is closed'],
    hill: ['the height of a ball thrown straight up', 'the height of a diver who jumps up off a high board and falls into the pool'],
    upFast: ['the balance of a savings account that earns interest', 'the number of bacteria in a dish, which doubles every hour']
  };
  var SITD = { constDown: 'constant, then decreasing at a constant rate', constUp: 'constant, then increasing at a constant rate', upConst: 'increasing at a constant rate, then constant', downConst: 'decreasing at a constant rate, then constant', hill: 'rising and then falling along a curve', upFast: 'increasing faster and faster' };
  var SITW = { constDown: ['<b>constant</b>', '<b>decreasing at a constant rate</b>'], constUp: ['<b>constant</b>', '<b>increasing at a constant rate</b>'], upConst: ['<b>increasing at a constant rate</b>', '<b>constant</b>'], downConst: ['<b>decreasing at a constant rate</b>', '<b>constant</b>'] };
  var PARTNER = { constDown: 'constUp', constUp: 'constDown', upConst: 'downConst', downConst: 'upConst' };

  /* ---------- assignment questions ---------- */
  var QUESTIONS = [
    { num: '1', section: 'Part A — Reading the story in a graph', stem: function (sh) { return friendsStem(sh, true); }, shared: function (r) { return friends(r, true); }, parts: [
      { id: '1a', level: 'EMG', make: function (r, sc) {
        var given = sc.line.jog, blanks = [1, 2, 3].filter(function (n) { return n !== given; }), fields = [], checks = [], keys = [];
        var tbl = HW.valueTable([[''].concat([1, 2, 3].map(function (n) { return 'Line ' + n; })), ['Distance (km)', sc.D, sc.D, sc.D],
          ['Time (h)'].concat([1, 2, 3].map(function (n) { return n === given ? t(hTex(sc.t.jog)) : '?'; })), ['Rate (km/h)'].concat([1, 2, 3].map(function (n) { return n === given ? sc.rate.jog : '?'; }))]);
        blanks.forEach(function (n) {
          var k = sc.byLine[n], oth = sc.byLine[blanks[0] === n ? blanks[1] : blanks[0]], tm = sc.t[k], rt = sc.rate[k];
          fields.push(mathBox('Line ' + n + ' time:', 'h'), mathBox('Line ' + n + ' rate:', 'km/h'));
          checks.push(K.value(rat(tm / 60), { diag: numDiag(tm / 60, [{ v: tm, code: 'min-not-h', hint: 'That is the time in <b>minutes</b>. The table asks for hours: divide by ' + t('60') + '.' }, { v: sc.t[oth] / 60, code: 'wrong-line', hint: 'That is the time for the other line. Read where line ' + n + ' reaches ' + t(sc.D + units('km')) + '.' }]) }));
          checks.push(K.value(rt, { diag: numDiag(rt, [{ v: sc.D / tm, code: 'per-min', hint: 'That is kilometres per <b>minute</b>. Divide the distance by the time in <b>hours</b>.' }, { v: tm / 60 / sc.D, code: 'rate-flip', hint: 'Rate = distance ÷ time, not time ÷ distance.' }, { v: tm / sc.D, code: 'rate-flip', hint: 'Rate = distance ÷ time, not time ÷ distance.' }, { v: sc.rate[oth], code: 'wrong-line', hint: 'That is the other line’s rate. Use line ' + n + '’s own time.' }]) }));
          keys.push(hTex(tm), String(rt));
        });
        var full = HW.valueTable([[''].concat([1, 2, 3].map(function (n) { return 'Line ' + n; })), ['Time (h)'].concat([1, 2, 3].map(function (n) { return t(hTex(sc.t[sc.byLine[n]])); })), ['Rate (km/h)'].concat([1, 2, 3].map(function (n) { return sc.rate[sc.byLine[n]]; }))]);
        return { prompt: 'Complete the table for the two lines that are not filled in. Give each time in <b>hours</b> and each rate in km/h.' + tbl, input: { type: 'fields', fields: fields },
          check: K.fields(checks, { labels: fields.map(function (f) { return f.name; }) }), key: keys, answer: full, text: 'three trips: times and rates',
          bad: [['1', String(sc.D), '1', String(sc.D)], blanks.reduce(function (a, n) { var k = sc.byLine[n]; return a.concat([String(sc.t[k]), String(sc.D / sc.t[k])]); }, [])],
          solution: blanks.map(function (n) { var k = sc.byLine[n]; return 'Line ' + n + ' reaches ' + t(sc.D + units('km')) + ' at ' + t(sc.t[k] + units('min')) + ' ' + t('=\\frac{' + sc.t[k] + '}{60}\\text{ h}=' + hTex(sc.t[k]) + '\\text{ h}') + ', so its rate is ' + t(sc.D + '\\div ' + hTex(sc.t[k]) + '=' + sc.rate[k] + units('km/h')) + '.'; }).join('<br>'),
          hints: ['Read the time where each line first reaches ' + t(sc.D + units('km')) + ', then change minutes to hours (divide by ' + t('60') + ').', 'Rate = distance ÷ time in hours. Check with the filled-in column: ' + t(sc.D + '\\div ' + hTex(sc.t.jog) + '=' + sc.rate.jog) + '.'] };
      } },
      { id: '1b', level: 'BEG', make: function (r, sc) {
        var rows = [1, 2, 3].map(function (n) { return { id: 'L' + n, html: 'Line ' + n }; }), cols = sc.who.map(function (k) { return { id: k, html: sc.name[k] }; }), want = {};
        [1, 2, 3].forEach(function (n) { want['L' + n] = sc.byLine[n]; });
        var p = K.P.grid('Complete the <b>Student</b> row of the table: which person made each trip?', rows, cols, want, { why: function (row, got) {
          var real = want[row], sp = { cyc: 'fastest', jog: 'middle', walk: 'slowest' };
          return { code: 'wrong-line', hint: 'Line ' + row.slice(1) + ' has a rate of ' + t(sc.rate[real] + units('km/h')) + ' — the ' + sp[real] + ' of the three. Who travels at the ' + sp[real] + ' speed: a cyclist, a jogger or a walker?' };
        } }, 'All three cover the same distance, so the steepest line is the fastest traveller. ' + sc.who.map(function (k) { return 'Line ' + sc.line[k] + ' (' + t(sc.rate[k] + units('km/h')) + ') is ' + sc.name[k] + ', who ' + sc.verb[k] + '.'; }).join(' '),
        ['A cyclist is faster than a jogger, and a jogger is faster than a walker.', 'The faster the person, the steeper the line.'], 'three trips: who is who');
        p.answer = rows.map(function (rw) { return rw.html + ': ' + sc.name[want[rw.id]]; }).join('<br>');
        return p;
      } },
      { id: '1c', level: 'BEG', make: function (r, sc) {
        var rows = ['W', 'X', 'Y', 'Z'].map(function (x) { return { id: x, html: t(x) }; });
        var cols = [{ id: 'go', html: 'All<br>set off' }].concat(sc.who.map(function (k) { return { id: k, html: sc.name[k] + '<br>arrives' }; }));
        var want = { W: 'go', X: 'cyc', Y: 'jog', Z: 'walk' };
        var p = K.P.grid('What is happening at each of the points ' + t('W') + ', ' + t('X') + ', ' + t('Y') + ' and ' + t('Z') + '?', rows, cols, want, { why: function (row, got) {
          if (row === 'W') return { code: 'wrong-line', hint: t('W') + ' is at time ' + t('0') + ' and distance ' + t('0') + ': nobody has gone anywhere yet.' };
          if (got === 'go') return { code: 'wrong-line', hint: 'At ' + t(row) + ' the distance is ' + t(sc.D + units('km')) + ' — someone has reached ' + sc.to + '. Whose line ends there?' };
          return { code: 'wrong-line', hint: 'Follow each numbered line to ' + t(sc.D + units('km')) + '. The fastest person arrives first (at ' + t('X') + '), the slowest last (at ' + t('Z') + ').' };
        } }, t('W(0,0)') + ': all three leave ' + sc.from + ' together. ' + t('X(' + sc.t.cyc + ',' + sc.D + ')') + ': ' + sc.name.cyc + ' (steepest line) arrives first; that line goes flat because the distance stops changing. ' +
          t('Y(' + sc.t.jog + ',' + sc.D + ')') + ': ' + sc.name.jog + ' arrives. ' + t('Z(' + sc.t.walk + ',' + sc.D + ')') + ': ' + sc.name.walk + ', the walker, arrives last.', ['A flat piece at the top means that person has stopped: they have arrived.'], 'three trips: points W X Y Z');
        p.answer = 'W: all set off; X: ' + sc.name.cyc + ' arrives; Y: ' + sc.name.jog + ' arrives; Z: ' + sc.name.walk + ' arrives';
        return p;
      } },
      { id: '1d', level: 'EMG', make: function (r, sc) {
        return K.P.mc(r, 'How can you tell, just from the steepness of the lines, which line belongs to which person?', [
          { html: 'All three go the same distance, so the line that reaches ' + t(sc.D + units('km')) + ' soonest is the steepest and belongs to the fastest person (the cyclist); the least steep line is the walker.', right: true },
          { html: 'The longest line belongs to the fastest person, because that person covers the most ground.', why: 'All three cover the same ' + t(sc.D + units('km')) + '. The walker’s line looks longest only because it takes the most time.' },
          { html: 'The steepest line belongs to the slowest person, because a steep climb is hard work.', why: 'Steepness is distance ÷ time, the speed. Steeper means <b>more</b> distance each minute — faster, not slower.' },
          { html: 'You can’t tell from the steepness; you have to know the line numbers.', why: 'The numbers are just labels. Steepness (the rate of change) is exactly what tells the speeds apart.' }],
          'Steepness = rate of change = distance ÷ time = speed. Steepest: ' + sc.name.cyc + ' (' + t(sc.rate.cyc + units('km/h')) + '); middle: ' + sc.name.jog + ' (' + t(sc.rate.jog + units('km/h')) + '); shallowest: ' + sc.name.walk + ' (' + t(sc.rate.walk + units('km/h')) + ').',
          ['What does the steepness of a distance-time line measure?'], 'three trips: steepness = speed');
      } }] },

    { num: '2', stem: function (k) { return k.name + ' kicks a soccer ball. The graph shows the height of the ball against the horizontal distance it travels before rolling to a stop.' + kickFig(k); },
      shared: function (r) { var k = kick(r); k.name = r.pick(['Priya', 'Owen', 'Hana', 'Mateo', 'Zoe']); return k; }, parts: [
      { id: '2a', level: 'BEG', make: function (r, k) {
        var f = [numBox('Maximum height:', 'm'), numBox('Horizontal distance at the maximum:', 'm')];
        return K.P.fields('Describe the first flight of the ball: how high does it go, and how far out is it when it is highest?', f,
          [K.number(k.H, numDiag(k.H, [{ v: k.dp, code: 'swap-axes', hint: 'That number is on the <b>horizontal</b> axis (distance). The height is read on the vertical axis.' }])),
            K.number(k.dp, numDiag(k.dp, [{ v: k.H, code: 'swap-axes', hint: 'That is the height. The distance is read on the horizontal axis, straight below the top of the curve.' }, { v: k.L, code: 'stop-vs-land', hint: 'That is where the ball first lands. Look straight below the <b>highest</b> point.' }]))],
          [String(k.H), String(k.dp)], 'Highest point ' + t(k.H + units('m')) + ' at ' + t(k.dp + units('m')),
          'The top of the first arch is at height ' + t(k.H + units('m')) + ', directly above ' + t(k.dp + units('m')) + ' on the distance axis: the ball rises to a maximum of about ' + t(k.H + units('m')) + ' about ' + t(k.dp + units('m')) + ' from ' + k.name + '.',
          ['Find the top of the big arch. Read across to the height axis and straight down to the distance axis.'], 'kick: maximum height');
      } },
      { id: '2b', level: 'BEG', make: function (r, k) {
        var f = [numBox('First lands at:', 'm'), numBox('Number of bounces after that:'), numBox('Comes to rest at:', 'm')];
        return K.P.fields('Finish the description of the kick.', f,
          [K.number(k.L, numDiag(k.L, [{ v: k.S, code: 'stop-vs-land', hint: 'That is where the ball comes to rest. It first <b>lands</b> where the big arch comes down to height ' + t('0') + '.' }, { v: k.dp, code: 'stop-vs-land', hint: 'That is where the ball is highest.' }])),
            K.number(k.nb, numDiag(k.nb, [{ v: k.nb + 1, code: 'bounce-count', hint: 'Count only the small arches <b>after</b> the first landing — the big arch is the kick itself.' }, { v: k.nb - 1, code: 'bounce-count', hint: 'Look closely after the first landing: count every small arch.' }])),
            K.number(k.S, numDiag(k.S, [{ v: k.L, code: 'stop-vs-land', hint: 'That is where it first lands. After the bounces it rolls along the ground to the dot.' }]))],
          [String(k.L), String(k.nb), String(k.S)], 'Lands at ' + t(k.L + units('m')) + ', ' + k.nb + ' bounces, stops at ' + t(k.S + units('m')),
          'The big arch comes down to height ' + t('0') + ' at ' + t(k.L + units('m')) + ': the first landing. Then there are ' + t(k.nb) + ' smaller arches (bounces), each lower than the one before, and the graph runs along the axis (the ball rolls) to the dot at ' + t(k.S + units('m')) + ', where it stops.',
          ['Height ' + t('0') + ' means the ball is on the ground.', 'Each small arch after the first landing is one bounce.'], 'kick: landing, bounces, stop');
      } },
      { id: '2c', level: 'EMG', make: function (r, k) {
        return K.P.mc(r, 'Just before ' + t(k.S + units('m')) + ', the graph runs along the horizontal axis. What is the ball doing there?', [
          { html: 'Rolling along the ground: its height is ' + t('0') + ' but its distance is still increasing.', right: true },
          { html: 'Stopped: the graph is flat.', why: 'Flat on a height–<b>distance</b> graph means the height isn’t changing. The distance is still increasing, so the ball is still moving — at height ' + t('0') + '.' },
          { html: 'Flying at a constant height.', why: 'The graph is on the axis, at height ' + t('0') + ': the ball is on the ground.' },
          { html: 'Bouncing very quickly.', why: 'A bounce would show as a small arch. Here the height stays at ' + t('0') + '.' }],
          'The height is ' + t('0') + ' (on the ground) while the horizontal distance keeps growing, so the ball is <b>rolling</b>. It stops at the dot, ' + t(k.S + units('m')) + ' away. Always ask what each axis measures before reading a flat piece.',
          ['What is on each axis? Is the distance still changing?'], 'kick: rolling');
      } }] },

    { num: '3', stem: function (v) { return v.name + ' ' + v.job + '. The graph shows the amount of gasoline in the delivery van on one day. A flat piece means the fuel is not changing; a rise means fuel is being added.' + vanFig(v); },
      shared: function (r) { return vanDay(r); }, parts: [
      { id: '3a', level: 'BEG', make: function (r, v) {
        var rows = vanRows(v), cols = [{ id: 'drive', html: 'Driving' }, { id: 'stop', html: 'Stopped' }, { id: 'fill', html: 'Filling<br>up' }], want = {};
        rows.forEach(function (rw) { want[rw.id] = rw.kind; });
        var p = K.P.grid('Describe how ' + v.name + ' may have spent the day: for each time interval, was the van being driven, stopped, or being filled with gas?', rows.map(function (rw) { return { id: rw.id, html: rw.html }; }), cols, want, { why: function (row, got) {
          var w = want[row];
          if (w === 'stop') return { code: 'row', hint: 'On ' + rows[Number(row.slice(1))].html + ' the fuel level is flat: no fuel is being used, so the van is not being driven.' };
          if (w === 'fill') return { code: 'row', hint: 'On ' + rows[Number(row.slice(1))].html + ' the fuel goes <b>up</b> — that only happens at a gas station.' };
          return { code: 'row', hint: 'On ' + rows[Number(row.slice(1))].html + ' the fuel goes down: it is being used up, so the van is moving.' };
        } }, rows.map(function (rw) { return rw.html + ': ' + (rw.kind === 'drive' ? 'fuel decreasing — driving' : rw.kind === 'stop' ? 'fuel constant — stopped (a delivery, a break, or parked)' : 'fuel rises steeply to F — filling up'); }).join('<br>'),
        ['Decreasing fuel means driving; constant means the van is parked; increasing means filling up.'], 'van fuel: segments');
        p.answer = rows.map(function (rw) { return rw.html + ': ' + { drive: 'driving', stop: 'stopped', fill: 'filling up' }[rw.kind]; }).join('<br>');
        return p;
      } },
      { id: '3b', level: 'EMG', make: function (r, v) {
        var s2 = v.d[3], f = [numBox('Length of the longer stop before filling up:', 'h'), mathBox('Fuel left at 18:00:', 'of a tank')];
        return K.P.fields('Use the graph.', f,
          [K.number(s2, numDiag(s2, [{ v: v.d[1], code: 'wrong-line', hint: 'That is the shorter stop. Find the longer flat piece before the fuel goes up.' }, { v: s2 * 60, code: 'min-not-h', hint: 'Give the length in <b>hours</b>.' }, { v: v.d[6], code: 'wrong-line', hint: 'That is the time parked <b>after</b> filling up. The question asks about the longer stop before it.' }])),
            K.value(rat(v.fe), { diag: numDiag(v.fe, [{ v: 1 - v.fe, code: 'wrong-line', hint: 'That is how much was used on the drive home. How much is <b>left</b> in the tank at 18:00?' }]) })],
          [dn(s2), fr(v.fe)], t(dn(s2) + units('h')) + '; ' + t(fr(v.fe)) + ' of a tank',
          'The longer stop is the flat piece from ' + hm(v.tt[3]) + ' to ' + hm(v.tt[4]) + ': ' + t(dn(s2) + units('h')) + '. At 18:00 the graph is at ' + t(fr(v.fe)) + ' of a tank.',
          ['A stop is a flat piece. Subtract its start time from its end time.', 'Read the height of the graph at the right end.'], 'van fuel: stop length, fuel left');
      } },
      { id: '3c', level: 'EMG', make: function (r, v) {
        var drv = [0, 2, 4, 7], opts = drv.map(function (si, j) {
          var a = v.tt[si], b = v.tt[si + 1], used = j === 3 ? 1 - v.fe : v.lv[j] - v.lv[j + 1];
          return { html: hm(a) + ' to ' + hm(b), right: j === v.fast, why: 'On this interval the van used ' + t(fr(used)) + ' of a tank in ' + t(dn(b - a) + units('h')) + ' — about ' + t(fr(used / (b - a))) + ' of a tank per hour. Work out the fuel used per hour on the other driving intervals and compare.' };
        });
        var j = v.fast, sA = v.tt[drv[j]], sB = v.tt[drv[j] + 1], u = j === 3 ? 1 - v.fe : v.lv[j] - v.lv[j + 1];
        return K.P.mc(r, 'On which interval was ' + v.name + ' using fuel the <b>fastest</b>?', opts,
          'The fastest use of fuel is the <b>steepest falling</b> segment: ' + hm(sA) + ' to ' + hm(sB) + ', where ' + t(fr(u)) + ' of a tank was used in ' + t(dn(sB - sA) + units('h')) + ' (' + t(fr(u / (sB - sA))) + ' of a tank per hour). ' +
          drv.map(function (si, i) { var uu = i === 3 ? 1 - v.fe : v.lv[i] - v.lv[i + 1], dd = v.tt[si + 1] - v.tt[si]; return hm(v.tt[si]) + '–' + hm(v.tt[si + 1]) + ': ' + t(fr(uu / dd)) + ' per hour'; }).join('; ') + '.',
          ['The rate of change is fuel used ÷ time. The steepest falling segment is the fastest.'], 'van fuel: fastest use', true);
      } }] },

    { num: '4', stem: function (s) { return s.stem; }, shared: function (r) {
        var names = r.pick([['Aurora', 'Comet'], ['Falcon', 'Glacier'], ['Summit', 'Tundra'], ['Breeze', 'Canyon']]), A = names[0], B = names[1];
        var g1 = r.pick(['ul', 'll']), g2 = r.pick(['ul', 'll']), sw1 = r.chance(0.5), sw2 = r.chance(0.5);
        function graph(xT, yT, pos, swap) {
          var p = swap ? [B, A] : [A, B], pl = pos === 'ul' ? [[2.2, 4.6], [6.6, 2.2]] : [[2.2, 2.0], [6.6, 4.6]];
          return { svg: fig({ x: [0, 10], y: [0, 6], grid: 0, labels: 0, firstQuadrant: true, unit: 20, xName: ' ', yName: ' ', xTitle: xT, yTitle: yT, points: pl.map(function (q) { return { x: q[0], y: q[1] }; }),
            notes: pl.map(function (q, i) { return { x: q[0], y: q[1], dy: -9, text: p[i], size: 12.5, bold: true }; }), max: 260, aria: 'two vehicles compared' }), at: { first: { name: p[0], x: pl[0][0], y: pl[0][1] }, second: { name: p[1], x: pl[1][0], y: pl[1][1] } } };
        }
        var G1 = graph('Age', 'Resale value', g1, sw1), G2 = graph('Fuel efficiency (km/L)', 'Towing capacity', g2, sw2);
        function more(G, axis) { var a = G.at.first, b = G.at.second; return a[axis] > b[axis] ? a.name : b.name; }
        var want = { old: more(G1, 'x'), val: more(G1, 'y'), eff: more(G2, 'x'), tow: more(G2, 'y') };
        return { A: A, B: B, want: want, stem: 'Two hybrid SUVs, the ' + A + ' and the ' + B + ', are compared on the two graphs below: the first by age and resale value, the second by fuel efficiency and towing capacity. Fuel efficiency is in km/L, so a larger value means the vehicle goes farther on each litre. The graphs have no scales.' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:4px">' + G1.svg + G2.svg + '</div>' };
      }, parts: [
      { id: '4', level: 'BEG', make: function (r, s) {
        var rows = [{ id: 'old', html: 'Older' }, { id: 'val', html: 'Worth more' }, { id: 'eff', html: 'More efficient' }, { id: 'tow', html: 'Tows more' }];
        var cols = [{ id: s.A, html: s.A }, { id: s.B, html: s.B }];
        var expl = { old: 'Age is on the horizontal axis of the first graph: the point farther <b>right</b> is older.', val: 'Resale value is on the vertical axis of the first graph: the <b>higher</b> point is worth more.', eff: 'Fuel efficiency is on the horizontal axis of the second graph: farther <b>right</b> means more km per litre — more efficient.', tow: 'Towing capacity is on the vertical axis of the second graph: the <b>higher</b> point tows more.' };
        var p = K.P.grid('Describe the comparison: for each statement, choose the vehicle it describes.', rows, cols, s.want, { why: function (row) { return { code: 'swap-axes', hint: expl[row] }; } },
          rows.map(function (rw) { return rw.html + ': <b>' + s.want[rw.id] + '</b>. ' + expl[rw.id]; }).join('<br>') + '<br>Without scales we can compare the two vehicles, but not say by how much.',
          ['For each graph, check which quantity is on which axis. Right = more of the horizontal quantity; up = more of the vertical quantity.'], 'compare two SUVs');
        p.answer = rows.map(function (rw) { return rw.html + ': ' + s.want[rw.id]; }).join('<br>');
        return p;
      } }] },

    { num: '5', stem: function (b) { return 'A rubber ball is dropped from a height of ' + t(b.H0 + units('m')) + '. On each bounce it rebounds to ' + t(b.pct + '\\%') + ' of its previous height.'; },
      shared: function (r) { var bk = r.chance(0.3), H0 = bk ? 12 : r.pick([8, 10, 12, 15, 16, 20]), pct = bk ? 65 : r.pick([50, 60, 65, 70, 75, 80]); return { H0: H0, pct: pct, p: pct / 100 }; }, parts: [
      { id: '5a', level: 'EMG', make: function (r, b) {
        var hs = [1, 2, 3, 4].map(function (k) { return b.H0 * Math.pow(b.p, k); });
        var f = hs.map(function (h, i) { return numBox(['1st', '2nd', '3rd', '4th'][i] + ' rebound:', 'm'); });
        function chk(k) {
          var x = hs[k - 1];
          return function (resp) {
            var pz = HW.parse.number(resp);
            if (!pz.ok) return form(pz.code === 'empty' ? 'empty' : 'notnumber', pz.code === 'empty' ? 'Type your answer first.' : 'Enter a single number (in metres).');
            var v = pz.value; if (Math.abs(v - x) <= 0.011 + 0.002 * x) return ok();
            var c = [{ v: b.H0 * b.p, code: 'pct-original', hint: 'Each rebound is ' + t(b.pct + '\\%') + ' of the <b>previous</b> rebound, not of the first drop. Multiply by ' + t(dn(b.p)) + ' again each time.' },
              { v: b.H0 * Math.pow(1 - b.p, k), code: 'pct-lost', hint: 'The ball keeps ' + t(b.pct + '\\%') + ' of its height — multiply by ' + t(dn(b.p)) + ', not ' + t(dn(1 - b.p)) + '.' },
              { v: b.H0 - k * b.H0 * (1 - b.p), code: 'pct-linear', hint: 'The ball doesn’t lose the same number of metres each time: it keeps ' + t(b.pct + '\\%') + ' of whatever height it just had, so multiply by ' + t(dn(b.p)) + ' each bounce.' },
              { v: b.H0 * Math.pow(b.p, k - 1), code: 'pct-shift', hint: 'That is the height <b>before</b> rebound ' + k + '. Multiply by ' + t(dn(b.p)) + ' once more.' }];
            for (var i = 0; i < c.length; i++) if (!(k === 1 && i === 0) && Math.abs(c[i].v - x) > 0.02 && Math.abs(v - c[i].v) <= 0.011 + 0.002 * c[i].v) return wrong(c[i].code, c[i].hint);
            return wrong('value', null);
          };
        }
        var keys = hs.map(function (h) { return (Math.round(h * 100) / 100).toFixed(2); });
        var p = K.P.fields('Find the height of each of the first four rebounds, to the nearest hundredth of a metre. (These are the peaks your sketch must show.)', f, [chk(1), chk(2), chk(3), chk(4)], keys,
          keys.map(function (k, i) { return t(k + units('m')); }).join(', '),
          'Multiply by ' + t(dn(b.p)) + ' for each bounce: ' + t([b.H0].concat(hs).map(function (h, i) { return i ? (Math.round(h * 10000) / 10000) : h; }).join('\\to ')) + '. Rounded: ' + keys.map(function (k) { return t(k + units('m')); }).join(', ') + '.',
          ['Rebounding to ' + t(b.pct + '\\%') + ' means multiplying the previous height by ' + t(dn(b.p)) + '.'], 'bounce heights ' + b.H0 + ' m at ' + b.pct + '%');
        p.bad = [[String(b.H0 * b.p), String(b.H0 * b.p), String(b.H0 * b.p), String(b.H0 * b.p)]];
        return p;
      } },
      { id: '5b', level: 'EMG', make: function (r, b) {
        return mcG(r, 'Which graph best shows the ball’s height (vertical axis) as a function of time (horizontal axis), for the first four bounces?', [
          { html: ballFig(b.H0, b.p, 'right'), right: true },
          { html: ballFig(b.H0, b.p, 'same'), code: 'same', why: 'Every bounce here reaches the full ' + t(b.H0 + units('m')) + '. The ball only rebounds to ' + t(b.pct + '\\%') + ' of the previous height, so each peak is lower.' },
          { html: ballFig(b.H0, b.p, 'ground'), code: 'ground', why: 'This graph starts on the ground. The ball is <b>dropped</b> from ' + t(b.H0 + units('m')) + ', so at time ' + t('0') + ' its height is ' + t(b.H0 + units('m')) + '.' },
          { html: ballFig(b.H0, b.p, 'float'), code: 'float', why: 'Here the ball never comes back down to height ' + t('0') + '. A bounce happens when the ball hits the ground, so the graph must touch the axis between arches.' }],
          'The graph starts at ' + t(b.H0 + units('m')) + ' and falls to ' + t('0') + ' (the drop). Then come arches of height about ' + [1, 2, 3, 4].map(function (k) { return t(dn(Math.round(b.H0 * Math.pow(b.p, k) * 100) / 100)); }).join(', ') + ' m, each touching ' + t('h=0') + ' at a bounce. Lower bounces take less time, so the arches also get narrower.',
          ['Where does the ball start? What happens at every bounce? How do the peaks change?'], 'bouncing ball graph');
      } }] },

    { num: '6', section: 'Part B — Matching descriptions and graphs', stem: 'Each graph below shows a real-world relationship. Choose a situation the graph could represent.', parts: [
      { id: '6a', level: 'BEG', make: function (r) {
        var ph = r.pick(['rise', 'dip']), g = sk(S.wave(2, ph, 1.4, 5), { xTitle: 'Time', yTitle: 'Height', max: 300, unit: 22 });
        var per = r.pick(['the height of the ocean tide at a beach over a day', 'the height above the ground of a seat on a Ferris wheel turning at a steady rate', 'the height of the water at a dock as the tide comes in and goes out']);
        var D = r.sample([['the height of a candle as it burns steadily', 'A burning candle only gets shorter, at a steady rate: a straight line going down.'],
          ['the height of a tree as it grows', 'A tree’s height only increases (slowing down as it matures). It never goes back down.'],
          ['the height of a ball thrown straight up and caught', 'A thrown ball rises and falls <b>once</b>. This graph repeats.'],
          ['the depth of water in a bathtub being filled at a steady rate', 'A filling tub only gets deeper: a straight line going up.']], 3);
        return K.P.mc(r, 'Which situation could this graph show?' + g, [{ html: per, right: true }].concat(D.map(function (d) { return { html: d[0], why: d[1] + ' This graph rises and falls in the same pattern again and again (it is periodic).' }; })),
          'The graph rises and falls in a repeating (periodic) pattern and never reaches ' + t('0') + '. Something that goes up and down over and over fits: <b>' + per + '</b>.',
          ['Does the graph only rise, only fall, or rise and fall over and over?'], 'scenario for a periodic graph');
      } },
      { id: '6b', level: 'EMG', make: function (r) {
        var shp = r.pick(['downSlow', 'upSlow']), g = sk(shp === 'downSlow' ? S.downSlow(1.1) : S.upSlow(), { xTitle: 'Time (s)', yTitle: 'Speed', max: 300, unit: 22 });
        var O = { downSlow: ['the speed of a skydiver just after the parachute opens', 'drops quickly at first, then levels off at a steady speed above zero'],
          upSlow: ['the speed of a sprinter leaving the starting blocks and reaching top speed', 'rises quickly at first, then levels off at top speed'],
          down0: ['the speed of a car braking steadily to a stop', 'falls at a constant rate in a straight line, all the way to zero'],
          up: ['the speed of a stone dropped from a bridge, which gains the same speed every second', 'rises in a straight line']};
        var desc = { downSlow: 'decreasing, with the decrease slowing down until it levels off above zero', upSlow: 'increasing, with the increase slowing down until it levels off' };
        return K.P.mc(r, 'Which situation could this graph show?' + g, ['downSlow', 'upSlow', 'down0', 'up'].map(function (k) {
          return { html: O[k][0], right: k === shp, why: k === shp ? null : 'That speed ' + O[k][1] + '. This graph is ' + desc[shp] + '.' };
        }), 'The graph is ' + desc[shp] + '. That fits <b>' + O[shp][0] + '</b>: its speed ' + O[shp][1] + '.', ['Is the speed going up or down? Is the graph straight, or does it level off?'], 'scenario for a ' + shp + ' speed graph');
      } }] },

    { num: '7', section: 'Part C — Sketching a graph from a description', stem: 'Each graph has no scale, so only its <b>shape</b> matters. Choose the best sketch.', parts: [
      { id: '7a', level: 'BEG', make: function (r) {
        var it = r.pick(['a used mountain bike', 'a used car', 'a laptop computer', 'a snowmobile']);
        return mcG(r, 'The resale value of ' + it + ' as a function of its age. (Value on the vertical axis, age on the horizontal axis.)', [
          { html: sk(S.downSlow(1.2)), right: true },
          { html: sk(S.down0(8.6)), code: 'lin', why: 'This says it loses the same amount every year and is worth nothing at the end. A used item loses value fastest when it is new, then more slowly, and keeps some value.' },
          { html: sk(S.downFast()), code: 'fast', why: 'This loses value slowly at first and faster and faster later. It is the other way around: the biggest drop is in the first year or two.' },
          { html: sk(S.upSlow()), code: 'up', why: 'This value goes <b>up</b> with age. Used items lose value as they get older.' }],
          '<b>Decreasing and flattening:</b> ' + it + ' loses value fastest in its first year or two, then more and more slowly, levelling off at a low value. The curve should not reach ' + t('0') + '.',
          ['Does the value go up or down with age? When does it drop the most?'], 'sketch: resale value vs age');
      } },
      { id: '7b', level: 'BEG', make: function (r) {
        var L = loan(r);
        return numPart('A ' + t('\\$' + L.A) + ' loan is paid off at ' + t('\\$' + L.p) + ' every month. How many months does it take to pay it off completely?', L.n,
          [{ v: L.n - 1, code: 'months', hint: 'Check: after that many payments, ' + t('\\$' + L.p) + ' is still owed.' }, { v: L.n + 1, code: 'months', hint: 'Check: ' + t((L.n + 1) + '\\times\\$' + L.p + '=\\$' + (L.n + 1) * L.p) + ', more than the loan.' }, { v: L.A - L.p, code: 'months', hint: 'Divide the loan by the monthly payment.' }],
          t(L.A + '\\div ' + L.p + '=' + L.n) + ', so it takes ' + t(L.n) + ' months.', ['Divide the amount of the loan by the monthly payment.'], 'loan months ' + L.A + '/' + L.p, { after: 'months' });
      } },
      { id: '7c', level: 'PRG', make: function (r) {
        var L = loan(r), n = L.n, alt = n + 2, X = alt + 1, A = L.A;
        function stairs(steps, upw) { var pts = [[0, upw ? 0 : A]], h = A / steps; for (var i = 1; i <= steps; i++) { var y0 = upw ? (i - 1) * h : A - (i - 1) * h, y1 = upw ? i * h : A - i * h; pts.push([i, y0], [i, y1]); } return { segs: [Ln(pts)] }; }
        var xT = []; for (var m = 2; m < X; m += 2) xT.push([m, String(m)]);
        function G(sh) { return fig({ x: [0, X], y: [0, A * 1.18], grid: 0, labels: 0, firstQuadrant: true, unitX: 118 / X, unitY: 78 / (A * 1.18), xName: ' ', yName: ' ', yTitle: ' ', segs: sh.segs, xt: xT, yt: [[A, '$' + A]], max: 190, tickSize: 10.5 }); }
        return mcG(r, 'A ' + t('\\$' + A) + ' loan is paid off at ' + t('\\$' + L.p) + ' every month. Which graph shows the amount still owed (vertical axis) as a function of the number of months (horizontal axis), until it is fully paid off?', [
          { html: G(stairs(n, false)), right: true },
          { html: G({ segs: [Ln([[0, A], [n, 0]])] }), code: 'lin', why: 'A straight line says a little is paid off every day. The amount owed only drops on payment day — between payments it stays the same, so the graph is a staircase.' },
          { html: G(stairs(n, true)), code: 'paid', why: 'This shows the amount <b>paid so far</b>, which goes up. The question asks for the amount still <b>owed</b>.' },
          { html: G(stairs(alt, false)), code: 'steps', why: 'Count the steps: each payment is ' + t('\\$' + L.p) + ', so it takes ' + t(A + '\\div ' + L.p + '=' + n) + ' payments to reach ' + t('\\$0') + '. This graph takes ' + alt + '.' }],
          '<b>A decreasing staircase.</b> The amount owed stays at ' + t('\\$' + A) + ' for a month, then drops by ' + t('\\$' + L.p) + ' at each payment. ' + t(A + '\\div ' + L.p + '=' + n) + ', so there are ' + t(n) + ' equal steps down and the graph reaches ' + t('\\$0') + ' after ' + t(n) + ' months.',
          ['When does the amount owed change — every instant, or only on payment day?', 'How many payments does it take?'], 'sketch: loan staircase');
      } },
      { id: '7d', level: 'EMG', make: function (r) {
        var day = r.pick(['a winter day', 'a cold winter day in Edmonton', 'a spring day', 'a summer day at the lake']), xT = [[0.3, '6:00'], [4.95, '12:00'], [9.6, '18:00']];
        function G(sh) { return sk(sh, { xT: xT, unit: 13.5 }); }
        return mcG(r, 'The outdoor temperature on ' + day + ', from 6:00 a.m. to 6:00 p.m. (Temperature on the vertical axis, time on the horizontal axis.)', [
          { html: G(S.hill(6.4, 0.8, 4.6, 2.6)), right: true },
          { html: G(S.valley(5.2, 4.4, 1, 4.2)), code: 'valley', why: 'This is warmest early in the morning and coldest at midday. It is the other way round: coldest near sunrise, warmest in the early afternoon.' },
          { html: G(S.wave(2, 'low', 0.8, 4.6)), code: 'wave', why: 'This has two warm peaks. From 6:00 a.m. to 6:00 p.m. there is just one warm part of the day.' },
          { html: G(S.up()), code: 'up', why: 'This keeps warming until 6:00 p.m. The temperature falls again in the late afternoon and evening.' }],
          '<b>Up, then down.</b> Coldest near 6:00 a.m., rising through the morning to a peak in the early afternoon, then falling toward 6:00 p.m. One peak only. (On a winter day the temperatures may all be below zero — it is the shape that matters.)',
          ['When is it coldest? When is it warmest?'], 'sketch: daytime temperature');
      } },
      { id: '7e', level: 'EMG', make: function (r) {
        var k = r.pick([2, 3, 3, 4]), rd = r.pick([['a swinging pirate-ship carnival ride', 'full swings'], ['a Ferris wheel turning at a steady rate, starting from the bottom', 'full turns'], ['a giant playground swing that is pushed the same amount every time', 'full swings']]);
        var wrongN = k === 2 ? 3 : k - 1;
        return mcG(r, 'Your height above the ground while riding ' + rd[0] + ', during ' + t(k) + ' ' + rd[1] + '. (Height on the vertical axis, time on the horizontal axis.)', [
          { html: sk(S.wave(k, 'low', 0.8, 5)), right: true },
          { html: sk(S.wave(wrongN, 'low', 0.8, 5)), code: 'count', why: 'Count the cycles: this graph shows ' + wrongN + ' rises and falls. The ride makes ' + k + '.' },
          { html: sk(S.wave(k, 'low', 0, 5)), code: 'zero', why: 'Here your height drops all the way to ' + t('0') + ' each time. Your seat never touches the ground — the lowest point is still above it.' },
          { html: sk(S.damped(k, 0.8)), code: 'damped', why: 'Here each peak is lower than the one before. The ride repeats the same motion, so every peak is the same height.' }],
          '<b>A repeating (periodic) wave with ' + k + ' identical cycles.</b> The same rise and fall repeats ' + k + ' times, with equal peaks and equal low points, and the low points stay above the axis.',
          ['How many times does your height go up and down? Do the peaks change? Do you touch the ground?'], 'sketch: periodic ride');
      } }] },

    { num: '8', stem: function (z) { return 'A student sketched the graph below to represent her distance from her locker during part of a school day.' + z.svg; },
      shared: function (r) {
        var P = [[0, 0], [r.int(8, 14) / 10, r.int(8, 14) / 10], [r.int(28, 34) / 10, r.int(30, 38) / 10], [r.int(16, 21) / 10, r.int(4, 10) / 10], [r.int(40, 46) / 10, r.int(46, 52) / 10], [r.int(60, 66) / 10, r.int(3, 9) / 10]];
        return { svg: fig({ x: [0, 7], y: [0, 5.8], grid: 0, labels: 0, firstQuadrant: true, unit: 40, xName: ' ', yName: ' ', xTitle: 'Time', yTitle: 'Distance from locker', segs: [Ln(P)], max: 330 }) };
      }, parts: [
      { id: '8', level: 'EMG', outcome: 'RF2', make: function (r) {
        return K.P.mc(r, 'Why can’t this graph be correct?', [
          { html: 'Part of the graph goes backwards in time, so a vertical line crosses it three times: she would be at three different distances from her locker at the same instant. It fails the vertical line test.', right: true },
          { html: 'Her distance from her locker can’t go down.', why: 'It can — walking back toward her locker makes the distance decrease. That part is fine.' },
          { html: 'She can’t change direction that many times.', why: 'People change direction all the time. Look at the piece that goes to the <b>left</b>.' },
          { html: 'Some segments are too steep.', why: 'A steep segment just means she is moving quickly. Look for a piece where time would have to run backwards.' }],
          'After rising, the graph moves to the <b>left</b> (backwards in time) before rising again. A vertical line through that folded part meets the graph three times — one moment, three distances. Time only moves forward and she can only be in one place at a time, so the graph fails the <b>vertical line test</b> and cannot show distance as a function of time.',
          ['Draw vertical lines through the graph. Does each one cross it only once?'], 'impossible distance-time graph');
      } }] },

    { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: '9', level: 'PRG', make: function (r) {
        var bk = r.chance(0.3), pl = bk ? ['library', 'park'] : r.pick([['library', 'park'], ['school', 'arena'], ['pool', 'mall'], ['rink', 'skate park']]);
        var a = bk ? 2.5 : r.pick([1.5, 2, 2.5, 3, 3.5]), b = bk ? 1.5 : r.pick([1, 1.5, 2].filter(function (x) { return Math.abs(x - a) >= 0.5; })), c = a + b, nm = bk ? 'Jordan' : r.pick(['Jordan', 'Kofi', 'Lena', 'Sam', 'Iris']);
        var m1 = bk ? 'cycles' : r.pick(['cycles', 'rides a scooter']), m2 = bk ? 'jogs' : r.pick(['jogs', 'walks']);
        var yT = [[b, dn(b)], [a, dn(a)], [c, dn(c)]].sort(function (u, v) { return u[0] - v[0]; });
        function G(p0, p3) { return fig({ x: [0, 7], y: [0, c + 0.8], grid: 0, labels: 0, firstQuadrant: true, unitX: 16, unitY: 88 / (c + 0.8), xName: ' ', yName: ' ', yTitle: ' ', segs: [Ln([[0, p0], [1, c], [2.4, c], [6.6, p3]])], yt: yT, max: 190 }); }
        return mcG(r, nm + ' leaves the ' + pl[0] + ' and ' + m1 + ' to the ' + pl[1] + ', ' + t(dn(b) + units('km')) + ' farther from home. ' + nm + ' spends some time at the ' + pl[1] + ', then ' + m2 + ' straight home. The ' + pl[0] + ' is ' + t(dn(a) + units('km')) + ' from home, along the same route. Which graph best shows ' + nm + '’s distance from home (in km), starting from the moment of leaving the ' + pl[0] + '?' + lineDiagram(['home', pl[0], pl[1]], [a, b]), [
          { html: G(a, 0), right: true },
          { html: G(c, 0), code: 'start-far', why: 'This graph starts at ' + t(dn(c) + units('km')) + ', as if the trip began at the ' + pl[1] + '. The trip starts at the ' + pl[0] + ', ' + t(dn(a) + units('km')) + ' from home.' },
          { html: G(a, b), code: 'end-short', why: 'This graph ends at ' + t(dn(b) + units('km')) + ', not at ' + t('0') + '. The trip ends at <b>home</b>, so the distance from home ends at ' + t('0') + '.' },
          { html: G(0, 0), code: 'start-home', why: 'This graph starts at ' + t('0') + ', as if the trip began at home. It starts at the ' + pl[0] + '.' }],
          nm + ' starts at the ' + pl[0] + ', ' + t(dn(a) + units('km')) + ' from home, so the graph starts at ' + t(dn(a)) + '. The ' + pl[1] + ' is ' + t(dn(b) + units('km')) + ' farther, so it rises to ' + t(dn(a) + '+' + dn(b) + '=' + dn(c)) + '. It is flat during the time at the ' + pl[1] + ', then falls all the way to ' + t('0') + ' on the way home.',
          ['Where does the graph start? How high does it go? Where does it end?'], 'trip graph ' + a + '+' + b);
      } }] },

    { num: '10', stem: 'Match each description with the best graph. (Each small graph shows the quantity on the vertical axis against the other variable on the horizontal axis.)', parts: [
      { id: '10', level: 'BEG', make: function (r) {
        var d = r.pick(['A tree’s height as a function of its age.', 'A puppy’s mass as a function of its age, from birth until it is fully grown.', 'The temperature of a cold drink taken out of the fridge and left in a warm room, as a function of time.']);
        return mcG(r, d, [{ html: sk(S.upSlow()), right: true },
          { html: sk(S.upFast()), code: 'fast', why: 'This one gets steeper and steeper — the growth speeds up. Here the change is fastest at the start and then slows down.' },
          { html: sk(S.up()), code: 'lin', why: 'A straight line means the same increase in every time period, forever. Here the increase slows down and levels off.' },
          { html: sk(S.wave(2, 'rise')), code: 'wave', why: 'This one rises and falls over and over. Here the quantity keeps increasing.' }],
          'The quantity increases quickly at first, then more and more slowly as it levels off: <b>increasing, slowing down</b>.', ['When is the change fastest — at the start or at the end?'], 'match: increasing, slowing');
      } }] },
    { num: '11', parts: [
      { id: '11', level: 'EMG', make: function (r) {
        var d = r.pick(['The average monthly rainfall in a coastal town is lowest in mid-summer and highest in winter. Rainfall as a function of month, starting in January.', 'A family’s monthly heating bill, which is highest in winter and lowest in summer, as a function of month, starting in January.', 'The number of hours of darkness each day, which is greatest in winter, as a function of the date, starting in January.']);
        return mcG(r, d + ' (Over several years.)', [{ html: sk(S.wave(2, 'dip')), right: true },
          { html: sk(S.wave(2, 'rise')), code: 'rise', why: 'This one rises first. January is in winter, when the quantity is already high, so the graph must start by going <b>down</b> toward summer.' },
          { html: sk(S.down()), code: 'lin', why: 'This one only goes down. The pattern repeats every year: down toward summer, then back up toward winter.' },
          { html: sk(S.upSlow()), code: 'slow', why: 'This one only goes up. The pattern repeats every year.' }],
          'Starting in January (winter) the value is high, dips to its lowest in summer, then rises again by December, and repeats every year: a <b>periodic curve that dips first</b>.', ['Is January a high month or a low month? Does the pattern repeat?'], 'match: periodic, dips first');
      } }] },
    { num: '12', parts: [
      { id: '12', level: 'EMG', make: function (r) {
        var d = r.pick([['The volume of a cube as a function of its side length.', 'V=s^{3}', 'Doubling the side multiplies the volume by ' + t('8')], ['The area of a square as a function of its side length.', 'A=s^{2}', 'Doubling the side multiplies the area by ' + t('4')], ['The area of a circle as a function of its radius.', 'A=\\pi r^{2}', 'Doubling the radius multiplies the area by ' + t('4')]]);
        return mcG(r, d[0], [{ html: sk(S.upFast()), right: true },
          { html: sk(S.up()), code: 'lin', why: 'A straight line would mean equal increases for each extra unit of length. ' + d[2] + ', so the growth speeds up.' },
          { html: sk(S.upSlow()), code: 'slow', why: 'This one slows down. ' + d[2] + ' — the increase gets <b>bigger</b>, not smaller.' },
          { html: sk(S.downFast()), code: 'down', why: 'This one decreases. A bigger shape has a bigger measure.' }],
          t(d[1]) + '. ' + d[2] + ', so the graph increases faster and faster: <b>increasing, speeding up</b>.', ['Try a few values: side 1, 2, 3. How much does the result go up each time?'], 'match: increasing, speeding up');
      } }] },
    { num: '13', parts: [
      { id: '13', level: 'BEG', make: function (r) {
        var d = r.pick(['You fill a bathtub at a constant rate with the drain closed. The water depth as a function of time.', 'The cost of gasoline at a fixed price per litre, as a function of the number of litres bought.', 'The distance travelled by a car on cruise control, as a function of time.']);
        return mcG(r, d, [{ html: sk(S.up()), right: true },
          { html: sk(S.upSlow()), code: 'slow', why: 'This one increases more and more slowly. Here the same amount is added every unit, so the rate of change is constant.' },
          { html: sk(S.upFast()), code: 'fast', why: 'This one speeds up. Here the rate stays the same the whole time.' },
          { html: sk(S.down()), code: 'down', why: 'This one decreases. Here the quantity goes up.' }],
          'The same amount is added for each unit on the horizontal axis — a constant rate of change, which graphs as a <b>straight increasing line</b>.', ['Is the rate of change constant, speeding up, or slowing down?'], 'match: straight increasing');
      } }] },

    { num: '14', section: 'Part D — Data, rate of change and domain', stem: function (c) { return 'A cup of ' + c.drink + ' is left on a counter, and its temperature is recorded every ' + t('5') + ' minutes.' + ctable([[t('t') + ' (min)', 0, 5, 10, 15, 20, 25, 30], [t('T') + ' (°C)'].concat(c.T)]); },
      shared: function (r) { return cooling(r); }, parts: [
      { id: '14a', level: 'EMG', make: function (r, c) {
        return mcG(r, 'Which graph shows the data correctly?', [
          { html: coolFig(c, 'right'), right: true },
          { html: coolFig(c, 'line'), code: 'lin', why: 'The points don’t lie on a straight line: the drink cools by ' + t(c.T[0] - c.T[1]) + '° in the first 5 minutes but only ' + t(c.T[5] - c.T[6]) + '° in the last 5. Join them with a smooth curve.' },
          { html: coolFig(c, 'bend'), code: 'bend', why: 'Check ' + t('t=10') + ': the table says ' + t(c.T[2]) + '°C, but this graph is much higher. This curve cools slowly first and faster later — the opposite of the data.' },
          { html: coolFig(c, 'late'), code: 'late', why: 'Check the first point: at ' + t('t=0') + ' the temperature is ' + t(c.T[0]) + '°C. This graph puts every point ' + t('5') + ' minutes too late.' }],
          'Plot ' + t('(0,' + c.T[0] + ')') + ', ' + t('(5,' + c.T[1] + ')') + ', …, ' + t('(30,' + c.T[6] + ')') + '. The drops get smaller (' + c.T.slice(1).map(function (x, i) { return c.T[i] - x; }).join(', ') + ' degrees), so the points lie on a smooth curve that falls quickly at first, then more slowly.',
          ['Check a couple of points against the table.', 'Are the drops between readings equal or getting smaller?'], 'cooling graph');
      } },
      { id: '14b', level: 'EMG', make: function (r, c) {
        return K.P.mc(r, 'Should the points be joined?', [
          { html: 'Yes — time and temperature are continuous: the drink has a temperature at every instant between the readings.', right: true },
          { html: 'No — the temperature was only measured every 5 minutes.', why: 'Measuring every 5 minutes doesn’t stop the drink from having a temperature in between. The quantity itself is continuous.' },
          { html: 'No — temperatures are rounded to whole degrees, so the data are discrete.', why: 'Rounding is just how the readings were recorded. The temperature can be any value, like ' + t('45.3') + '°C.' },
          { html: 'Yes — because the temperature is going down.', why: 'Whether to join points depends on whether in-between values make sense (continuous data), not on the direction.' }],
          'Yes. Both time and temperature are <b>continuous</b>: at ' + t('t=7.5') + ' minutes the drink still has a temperature. Join the points with a smooth curve.', ['Does the drink have a temperature at ' + t('t=7') + ' minutes?'], 'join cooling points');
      } },
      { id: '14c', level: 'EMG', outcome: 'RF2', make: function (r, c) {
        var dom = '\\{t \\mid 0 \\le t \\le 30,\\ t \\in \\mathbb{R}\\}', rng = '\\{T \\mid ' + c.T[6] + ' \\le T \\le ' + c.T[0] + ',\\ T \\in \\mathbb{R}\\}';
        var p = K.P.set('State a realistic <b>domain</b> for the data (the times measured).', dom, { v: 't', other: rng, wrong: [{ is: '\\{0, 5, 10, 15, 20, 25, 30\\}', code: 'set-continuous', hint: 'Time is continuous here, so the domain includes every time from ' + t('0') + ' to ' + t('30') + ', not just the readings.' }, { is: '\\{t \\mid 0 \\le t \\le 35, t \\in \\mathbb{R}\\}', code: 'set-values', hint: 'The readings stop at ' + t('t=30') + '.' }] },
          'The readings run from ' + t('t=0') + ' to ' + t('t=30') + ' minutes and time is continuous: ' + t('D=' + dom) + '.', ['What are the first and last times in the table?'], 'cooling domain');
        p.good = ['0\\le t\\le 30', '[0, 30]']; p.bad = ['\\{0, 5, 10, 15, 20, 25, 30\\}', c.T[6] + '\\le T\\le ' + c.T[0]];
        return p;
      } },
      { id: '14d', level: 'EMG', outcome: 'RF2', make: function (r, c) {
        var dom = '\\{t \\mid 0 \\le t \\le 30,\\ t \\in \\mathbb{R}\\}', rng = '\\{T \\mid ' + c.T[6] + ' \\le T \\le ' + c.T[0] + ',\\ T \\in \\mathbb{R}\\}';
        var p = K.P.set('State a realistic <b>range</b> for the data (the temperatures measured).', rng, { v: 'T', other: dom, wrong: [{ is: '\\{T \\mid 0 \\le T \\le ' + c.T[0] + ', T \\in \\mathbb{R}\\}', code: 'set-values', hint: 'The drink never gets down to ' + t('0') + '°C here. The lowest temperature measured is ' + t(c.T[6]) + '°C.' }] },
          'The temperatures run from ' + t(c.T[6]) + '°C (at 30 min) up to ' + t(c.T[0]) + '°C (at the start): ' + t('R=' + rng) + '.', ['What are the lowest and highest temperatures in the table?'], 'cooling range');
        p.good = [c.T[6] + '\\le T\\le ' + c.T[0], '[' + c.T[6] + ', ' + c.T[0] + ']']; p.bad = ['0\\le T\\le ' + c.T[0], '0\\le t\\le 30'];
        return p;
      } },
      { id: '14e', level: 'EMG', make: function (r, c) {
        return K.P.mc(r, 'Why should the graph not be extended far to the right by continuing the same pattern?', [
          { html: 'The drink levels off at room temperature — it can never cool below the room — so the curve flattens out instead of continuing down.', right: true },
          { html: 'It shouldn’t: the temperature keeps dropping until it reaches ' + t('0') + '°C.', why: 'A drink on a counter cools only to the temperature of the room (about ' + t(c.R) + '°C), then stays there.' },
          { html: 'Time can’t go past ' + t('30') + ' minutes.', why: 'Time keeps going after the last reading. The issue is what the temperature does.' },
          { html: 'The extended graph would fail the vertical line test.', why: 'A curve continuing to the right still has one temperature at each time. Think about room temperature.' }],
          'The drink cools toward room temperature (about ' + t(c.R) + '°C) and then stays there. The pattern of the first 30 minutes — falling — can’t continue forever, so the curve should level off rather than be extended down.', ['What temperature will the drink end up at after a long time?'], 'cooling: why not extend');
      } }] },

    { num: '15', section: 'Part E — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: '15', level: 'EMG', make: function (r) {
        var tg = r.chance(0.35) ? 'constDown' : r.pick(['constDown', 'constUp', 'upConst', 'downConst']), pt = PARTNER[tg];
        var others = ['hill', 'upFast'].concat(['constDown', 'constUp', 'upConst', 'downConst'].filter(function (k) { return k !== tg && k !== pt; }));
        var dk = [pt].concat(r.sample(others, 2));
        var opts = [{ html: r.pick(SIT[tg]), right: true }].concat(dk.map(function (k) { var s = r.pick(SIT[k]); return { html: s, code: k, why: 'That graph would be ' + SITD[k] + '. You need one that is ' + SITD[tg] + '.' }; }));
        return K.P.mc(r, 'Which situation is best represented by a graph that is ' + SITW[tg][0] + ', then ' + SITW[tg][1] + '?', opts,
          'Picture each situation’s graph. <b>' + opts[0].html.charAt(0).toUpperCase() + opts[0].html.slice(1) + '</b>: ' + SITD[tg] + '.<br>The others: ' + dk.map(function (k, i) { return opts[i + 1].html + ' — ' + SITD[k]; }).join('; ') + '.',
          ['Sketch a quick graph for each situation. Which one has the two pieces in the right order?'], 'which situation: ' + tg);
      } }] },
    { num: '16', stem: '<i>(Numerical Response)</i>', parts: [
      { id: '16', level: 'EMG', make: function (r) {
        var sc = friends(r, true), d = sc.t.walk - sc.t.cyc;
        var p = K.P.nr(friendsStem(sc, false) + '<br>' + sc.name.walk + ' arrives at ' + sc.to + ' ________ minutes after ' + sc.name.cyc + '.', d, numDiag(d, [
          { v: sc.t.walk, code: 'shared-time', hint: 'That is when ' + sc.name.walk + ' arrives. How much <b>later</b> is that than ' + sc.name.cyc + '’s arrival?' },
          { v: sc.t.walk - sc.t.jog, code: 'wrong-line', hint: 'That compares ' + sc.name.walk + ' with ' + sc.name.jog + ', the jogger. ' + sc.name.cyc + ' is the cyclist: the steepest line.' },
          { v: sc.t.jog - sc.t.cyc, code: 'wrong-line', hint: 'That compares ' + sc.name.jog + ' (the jogger) with ' + sc.name.cyc + '. ' + sc.name.walk + ' is the walker: the least steep line.' },
          { v: d / 60, code: 'min-not-h', hint: 'Give the answer in <b>minutes</b>.' }]),
          sc.name.cyc + ' cycles, so that is the steepest line, reaching ' + t(sc.D + units('km')) + ' at ' + t(sc.t.cyc + units('min')) + '. ' + sc.name.walk + ' walks: the least steep line, reaching ' + t(sc.D + units('km')) + ' at ' + t(sc.t.walk + units('min')) + '. ' + t(sc.t.walk + '-' + sc.t.cyc + '=' + d) + ' minutes.',
          ['Who has the steepest line? Who has the least steep?', 'Read each arrival time where the line reaches ' + t(sc.D + units('km')) + ', then subtract.'], 'arrival gap ' + d);
        return p;
      } }] }
  ];
  function loan(r) {
    if (r.chance(0.3)) return { A: 480, p: 60, n: 8 };
    var p = r.pick([40, 50, 60, 75, 80, 100, 120]), n = r.pick([5, 6, 8, 10].filter(function (k) { return k * p <= 1000; }));
    return { A: n * p, p: p, n: n };
  }

  /* ---------- extra-practice helpers ---------- */
  var LET = ['A', 'B', 'C', 'D', 'E', 'F'];
  function bank(items, cols) { // items: [{ label, svg }]
    return '<div style="display:grid;grid-template-columns:repeat(' + (cols || 2) + ',minmax(0,1fr));gap:2px 12px;margin:6px 0">' + items.map(function (it) { return '<div><b>' + it.label + '.</b>' + (it.cap ? ' <span style="font-size:14px">' + it.cap + '</span>' : '') + it.svg + '</div>'; }).join('') + '</div>';
  }
  /* a matching question: shapes = { key: { svg, desc } }, stories = [{ id, key, text }] → grid (story rows × graph letters) */
  function matchPart(r, sh, keys, intro, stories, labels, text) {
    var order = r.shuffle(keys), letter = {}, byLetter = {};
    order.forEach(function (k, i) { letter[k] = labels[i]; byLetter[labels[i]] = k; });
    var st = r.shuffle(stories), rows = st.map(function (s, i) { return { id: s.key, html: '(' + String.fromCharCode(97 + i) + ')', text: s.text }; });
    var want = {}; rows.forEach(function (rw) { want[rw.id] = letter[rw.id]; });
    var cols = labels.slice(0, keys.length).map(function (l) { return { id: l, html: l }; });
    var p = K.P.grid(intro + bank(labels.slice(0, keys.length).map(function (l) { return { label: l, svg: sh[byLetter[l]].svg }; })) + rows.map(function (rw) { return '<b>' + rw.html + '</b> ' + rw.text; }).join('<br>'), rows, cols, want, { why: function (row, got) {
      var rw = rows.filter(function (x) { return x.id === row; })[0];
      return { code: 'row', hint: 'Story ' + rw.html + ': graph ' + got + ' is ' + sh[byLetter[got]].desc + '. The story needs a graph that is ' + sh[row].desc + '.' };
    } }, rows.map(function (rw) { return rw.html + ' → graph <b>' + want[rw.id] + '</b>: ' + sh[rw.id].desc + '.'; }).join('<br>'), ['Read each story piece by piece: is the person moving away, stopped, or coming back? Steady, speeding up, or slowing down?'], text);
    p.answer = rows.map(function (rw) { return rw.html + ' ' + want[rw.id]; }).join(', ');
    return p;
  }
  function tickList(lo, hi, step) { var a = []; for (var v = lo; v <= hi + 1e-9; v += step) a.push([v, dn(v)]); return a; }
  /* a scaled context graph: polyline pts, letters at vertices (optional) */
  function ctx(o) {
    var X = o.X, Y = o.Y;
    return fig({ x: [0, X], y: [0, Y], grid: o.gx, gridY: o.gy, labels: 0, firstQuadrant: true, unitX: (o.w || 290) / X, unitY: (o.h || 150) / Y, xName: ' ', yName: ' ', xTitle: o.xt, yTitle: o.yt,
      segs: o.segs || [{ pts: o.pts }], fns: o.fns, points: o.dots ? o.pts.map(function (p) { return { x: p[0], y: p[1] }; }) : null, xt: o.xT, yt: o.yT, notes: o.notes, max: o.max || 400, aria: o.aria || 'graph' });
  }
  function letterNotes(pts, names, offs) { return pts.map(function (p, i) { var o = (offs && offs[i]) || [0, -9]; return { x: p[0], y: p[1], dx: o[0], dy: o[1], text: names[i], bold: true, size: 12.5 }; }); }

  /* EP4–5: a ride out to a friend's house and back */
  function ride(r, allowBook) {
    if (allowBook && r.chance(0.3)) return { t: [0, 20, 30, 50, 60, 90], d: [0, 8, 8, 14, 14, 0] };
    for (var k = 0; k < 3000; k++) {
      var t1 = r.pick([10, 15, 20, 25, 30]), v1 = r.pick([12, 15, 18, 20, 24, 30]), d1 = v1 * t1 / 60;
      var L2 = r.pick([10, 15, 20, 25, 30]), v2 = r.pick([12, 15, 18, 20, 24]), dd = v2 * L2 / 60, s1 = r.pick([5, 10, 15]), s2 = r.pick([5, 10, 15]), v3 = r.pick([18, 20, 24, 28, 30, 36]);
      if (d1 % 1 || dd % 1 || v1 === v2) continue;
      var d2 = d1 + dd, dur = 60 * d2 / v3; if (dur % 5 || d2 > 18 || d2 < 6) continue;
      var tt = [0, t1, t1 + s1, t1 + s1 + L2, t1 + s1 + L2 + s2]; tt.push(tt[4] + dur); if (tt[5] > 110) continue;
      var m = [v1, v2, v3].sort(function (a, b) { return b - a; }); if (m[0] === m[1]) continue;
      return { t: tt, d: [0, d1, d1, d2, d2, 0] };
    }
  }
  function rideInfo(R) { var t = R.t, d = R.d; return { v1: 60 * d[1] / t[1], v2: 60 * (d[3] - d[2]) / (t[3] - t[2]), v3: 60 * (d[5] - d[4]) / (t[5] - t[4]), s1: t[2] - t[1], s2: t[4] - t[3] }; }
  function rideFig(R) {
    var X = R.t[5] + 10, Y = R.d[3] + 2, pts = R.t.map(function (x, i) { return [x, R.d[i]]; });
    return ctx({ X: X, Y: Y, gx: 10, gy: 2, xt: 'Time (min)', yt: 'Distance from home (km)', pts: pts, dots: true, xT: tickList(X > 100 ? 20 : 10, X - 5, X > 100 ? 20 : 10), yT: tickList(2, Y - 1, 2),
      notes: letterNotes(pts, ['J', 'K', 'L', 'M', 'N', 'P'], [[-8, -4], [-6, -9], [6, -9], [-6, -9], [6, -9], [8, -6]]), aria: 'distance from home during a bike ride' });
  }
  var SEGN = ['J to K', 'K to L', 'L to M', 'M to N', 'N to P'];

  function e1Part(r, keys, labels, note) {
    var sh = {
      line: { svg: sk({ segs: [Ln([[0, 0], [9.5, 5.2]])] }), desc: 'one straight line (a steady pace, no stops)' },
      speed: { svg: sk({ fns: [Fn(function (x) { return 0.0576 * x * x; }, 0, 9.5)] }), desc: 'a curve getting steeper and steeper (speeding up)' },
      stop: { svg: sk({ segs: [Ln([[0, 0], [3.5, 2.6], [6, 2.6], [9.5, 5.2]])] }), desc: 'two equally steep pieces with a flat part between (a stop, then the same speed again)' },
      back: { svg: sk({ segs: [Ln([[0, 0], [4.5, 5], [9, 0]])] }), desc: 'up to a highest point and straight back down to 0 (out and back, no stop)' },
      slow: { svg: sk({ fns: [Fn(function (x) { return 5.3 * (1 - Math.exp(-0.4 * x)); }, 0, 9.5)] }), desc: 'still rising but flattening out (moving away, slowing down)' },
      away: { svg: sk({ segs: [Ln([[0, 4.6], [5, 4.6], [9.5, 0]])] }), desc: 'starting above 0, flat, then down to 0 (already away, stays, then comes home)' } };
    var ST = { line: r.pick(['Amir jogs from home to the soccer pitch at one steady pace and never stops.', 'Amir walks from home to school at one steady pace without stopping.']),
      speed: 'Beth wheels her bike out of the driveway and rides away, pedalling harder and harder, so each minute she covers more ground than the minute before.',
      stop: r.pick(['Cai drives away from home, is held at a level crossing while a train passes, then carries on at the speed he was going before.', 'Cai drives away from home, waits at a long red light, then carries on at the same speed as before.']),
      back: r.pick(['Dev walks to the corner store and comes straight back home without going inside.', 'Dev jogs to the end of the street and straight back home.']),
      slow: 'Eryn’s train pulls out of her home station and slows steadily as it coasts into the next station down the line.',
      away: r.pick(['Fen is already at the library when the graph starts. She studies there for an hour, then walks home.', 'Fen is already at a friend’s house when the graph starts. She stays a while, then walks home.']) };
    return matchPart(r, sh, keys, 'Each graph shows one person’s distance from home (vertical) against time (horizontal). Match each story with its graph.' + note, keys.map(function (k) { return { key: k, text: ST[k] }; }), labels, 'match stories to distance graphs');
  }

  var EXTRA = [
    { num: '1', section: 'Extra practice A — Matching a story to its graph', parts: [
      { id: 'e1a', level: 'EMG', make: function (r) { return e1Part(r, ['line', 'speed', 'stop'], ['A', 'B', 'C'], ' Graphs A, B and C begin and end at the same points (in some order), so only what happens <i>in between</i> tells them apart.'); } },
      { id: 'e1b', level: 'BEG', make: function (r) { return e1Part(r, ['back', 'slow', 'away'], ['D', 'E', 'F'], ''); } }] },
    { num: '2', parts: [
      { id: 'e2', level: 'EMG', make: function (r) {
        var sh = {
          bus: { svg: sk({ segs: [Ln([[0, 0], [2.5, 4], [9.5, 4]])] }), desc: 'rising from 0, then flat above the axis (speeds up, then holds a steady speed)' },
          brake: { svg: sk({ segs: [Ln([[0, 4.4], [5, 4.4], [8.5, 0], [9.6, 0]])] }), desc: 'flat up high, a straight fall to 0, then on the axis (cruising, braking, stopped)' },
          sprint: { svg: sk({ segs: [Ln([[0, 0], [1.8, 4.8], [5.5, 4.8], [8, 1.6], [9.6, 1.6]])] }), desc: 'a steep rise, flat at the top, then down to a lower speed that is not 0' },
          light: { svg: sk({ segs: [Ln([[0, 3.2], [2.2, 0], [4.5, 0], [7, 3.2], [9.6, 3.2]])] }), desc: 'falling to 0, sitting on the axis, then climbing back to the same speed' } };
        var stories = [{ key: 'bus', text: 'A city bus pulls away from a stop, builds up to the speed limit, and holds it all the way to the next stop.' },
          { key: 'brake', text: 'A car is cruising on the highway when the driver brakes smoothly to a complete stop at a rest area.' },
          { key: 'light', text: 'A car driving through town slows to a stop at a red light, waits, then builds back up to the speed it was doing before.' },
          { key: 'sprint', text: 'A sprinter accelerates hard out of the blocks, holds top speed to the finish line, then slows to an easy jog and keeps jogging.' }];
        return matchPart(r, sh, ['bus', 'brake', 'sprint', 'light'], 'These graphs show <b>speed</b> (vertical) against time — read the vertical axis before you decide. Match each story with its graph.', stories, ['P', 'Q', 'R', 'S'], 'match stories to speed graphs');
      } }] },
    { num: '3', stem: function (s) {
        var X = s.T * 1.15, Y = s.D * 1.25;
        return 'Two riders leave home at the same instant. Both graphs start at ' + t('(0\\text{ min}, 0\\text{ km})') + ' and end at ' + t('(' + s.T + '\\text{ min}, ' + s.D + '\\text{ km})') + '. Rider A’s graph is a straight line; rider B’s is a curve.' +
          ctx({ X: X, Y: Y, gx: 0, gy: 0, xt: 'Time (min)', yt: 'Distance from home (km)', segs: [{ pts: [[0, 0], [s.T, s.D]], color: C1 }], fns: [Fn(function (x) { return s.D * Math.pow(x / s.T, 2.6); }, 0, s.T, { color: C2 })],
            xT: [[s.T / 2, dn(s.T / 2)], [s.T, String(s.T)]], yT: [[s.D, String(s.D)]], notes: [{ x: s.T * 0.45, y: s.D * 0.45, dx: -8, dy: -4, text: 'A', bold: true, color: C1, anchor: 'end' }, { x: s.T * 0.8, y: s.D * Math.pow(0.8, 2.6), dx: 8, dy: 4, text: 'B', bold: true, color: C2, anchor: 'start' }], h: 140, aria: 'two riders' });
      }, shared: function (r) {
        if (r.chance(0.3)) return { D: 6, T: 30, v: 12 };
        var c = []; [20, 30, 40, 45, 60].forEach(function (T) { for (var D = 3; D <= 15; D++) { var v = 60 * D / T; if (v % 1 === 0 && v >= 8 && v <= 24) c.push({ D: D, T: T, v: v }); } });
        return r.pick(c);
      }, parts: [
      { id: 'e3a', level: 'EMG', make: function (r, s) {
        var dg = numDiag(s.v, [{ v: s.D / s.T, code: 'per-min', hint: 'That is km per <b>minute</b>. ' + t(s.T + units('min') + '=' + fr(s.T / 60) + units('h')) + '.' }, { v: s.D, code: 'avg-speed', hint: 'That is the distance. Average speed = distance ÷ time.' }, { v: s.T / s.D, code: 'rate-flip', hint: 'Average speed = distance ÷ time, not time ÷ distance.' }]);
        var p = K.P.fields('Find the average speed of each rider over the whole ' + t(s.T) + ' minutes, in km/h.', [numBox('Rider A:', 'km/h'), numBox('Rider B:', 'km/h')], [K.number(s.v, dg), K.number(s.v, dg)], [String(s.v), String(s.v)], 'A: ' + t(s.v + units('km/h')) + ', B: ' + t(s.v + units('km/h')),
          t(s.T + units('min') + '=' + fr(s.T / 60) + units('h')) + '. Both: ' + t(s.D + '\\div ' + fr(s.T / 60) + '=' + s.v + units('km/h')) + '. Same start and same end, so the <b>averages are equal</b>.', ['Average speed = total distance ÷ total time (in hours).'], 'two riders: average speeds');
        p.bad = [[String(s.v), String(s.v / 2)], [dn(s.D / s.T), dn(s.D / s.T)]]; return p;
      } },
      { id: 'e3b', level: 'EMG', make: function (r, s) {
        var p = K.P.grid('Which rider is moving faster in the first few minutes, and which in the last few minutes?', [{ id: 'first', html: 'First few minutes' }, { id: 'last', html: 'Last few minutes' }], [{ id: 'A', html: 'A' }, { id: 'B', html: 'B' }], { first: 'A', last: 'B' },
          { why: function (row) { return { code: 'row', hint: 'Steeper means faster. In the ' + (row === 'first' ? 'first' : 'last') + ' few minutes, which graph is steeper: A’s line or B’s curve?' }; } },
          '<b>First few minutes: A</b> — B’s curve is almost flat there. <b>Last few minutes: B</b> — B’s curve is steeper than A’s line there. Steeper means faster.', ['Compare the steepness of the two graphs at the left end and at the right end.'], 'two riders: who is faster when');
        p.answer = 'First few minutes: A; last few minutes: B'; return p;
      } },
      { id: 'e3c', level: 'EMG', make: function (r, s) {
        return K.P.mc(r, 'Which rider is farther from home ' + t(dn(s.T / 2)) + ' minutes in?', [
          { html: 'A — B’s curve lies below A’s line between the start and the finish.', right: true },
          { html: 'B — B is going faster at the end.', why: 'B is faster near the end, but at ' + t(dn(s.T / 2)) + ' minutes read the heights: B’s curve is <b>below</b> A’s line.' },
          { html: 'They are the same distance, because they have the same average speed.', why: 'Equal averages only means they finish together. In between, read the heights of the two graphs at ' + t(dn(s.T / 2)) + ' minutes.' },
          { html: 'You can’t tell without a formula for B.', why: 'You can compare without numbers: which graph is higher at ' + t(dn(s.T / 2)) + ' minutes?' }],
          'At ' + t(dn(s.T / 2)) + ' minutes A’s line is higher than B’s curve, so A has covered more ground: <b>A</b> is farther from home.', ['Higher on a distance-from-home graph means farther from home.'], 'two riders: farther at halfway');
      } },
      { id: 'e3d', level: 'PRG', make: function (r, s) {
        return numPart('B starts out slower than A and finishes faster than A. B’s speed changes smoothly, with no jumps, so at some instant the two riders are travelling at exactly the same speed. What is that speed, in km/h?', s.v,
          [{ v: s.D / s.T, code: 'per-min', hint: 'Give the speed in km/h, not km/min.' }, { v: 0, code: 'avg-speed', hint: 'Both are moving the whole time. What is A’s speed?' }, { v: 2 * s.v, code: 'avg-speed', hint: 'A’s line has the same steepness the whole way. What is A’s (constant) speed?' }],
          'A’s speed never changes: ' + t(s.v + units('km/h')) + ' the whole way. B’s speed starts below that and ends above it, and changes smoothly, so it must pass through ' + t(s.v + units('km/h')) + ' at some instant.', ['A rides at one constant speed. What is it?'], 'two riders: common speed', { after: 'km/h' });
      } },
      { id: 'e3e', level: 'EMG', make: function (r, s) {
        return K.P.tf(r, '“Equal average speed means equal speed the whole way.” Use the graphs: is this statement true or false?', false, 'Both riders average ' + t(s.v + units('km/h')) + ', but B is slower than A at the start and faster at the end.',
          '<b>False.</b> Both averages are ' + t(s.v + units('km/h')) + ', but A rides at ' + t(s.v + units('km/h')) + ' the whole way while B is slower at first (flatter) and faster at the end (steeper). Equal averages, different speeds along the way.', ['Do the two graphs have the same steepness everywhere?'], 'equal average ≠ equal speed');
      } }] },

    { num: '4', section: 'Extra practice B — Describing a graph segment by segment', stem: function (R) { return 'Jules rides her bike from home to a friend’s house, then rides home again. The graph of her distance from home is made of five straight segments.' + rideFig(R); },
      shared: function (r) { return ride(r, true); }, parts: [
      { id: 'e4a', level: 'BEG', make: function (r, R) {
        var rows = SEGN.map(function (n, i) { return { id: 's' + i, html: n }; }), want = { s0: 'away', s1: 'stop', s2: 'away', s3: 'stop', s4: 'back' };
        var p = K.P.grid('Describe what Jules is doing on each segment.', rows, [{ id: 'away', html: 'Riding<br>away' }, { id: 'stop', html: 'Stopped' }, { id: 'back', html: 'Riding<br>home' }], want, { why: function (row) {
          var w = want[row]; return { code: 'row', hint: w === 'stop' ? 'On a distance–time graph a flat segment means the distance is not changing: she is stopped.' : w === 'back' ? 'Her distance from home is going <b>down</b> on this segment: she is coming back.' : 'Her distance from home is going <b>up</b> here: she is riding away.' };
        } }, rows.map(function (rw, i) { var I = rideInfo(R); return rw.html + ': ' + (want[rw.id] === 'stop' ? 'stopped ' + R.d[i] + ' km from home for ' + (R.t[i + 1] - R.t[i]) + ' min' : want[rw.id] === 'back' ? 'riding home steadily: ' + R.d[i] + ' km in ' + (R.t[i + 1] - R.t[i]) + ' min' : 'riding away steadily: ' + (R.d[i + 1] - R.d[i]) + ' km in ' + (R.t[i + 1] - R.t[i]) + ' min'); }).join('<br>'),
        ['Rising = moving away, flat = stopped, falling = coming back.'], 'ride: describe segments');
        p.answer = rows.map(function (rw) { return rw.html + ': ' + { away: 'riding away', stop: 'stopped', back: 'riding home' }[want[rw.id]]; }).join('<br>'); return p;
      } },
      { id: 'e4b', level: 'BEG', make: function (r, R) {
        var I = rideInfo(R);
        return K.P.fields('How far from home is the friend’s house, and how long does Jules spend there?', [numBox('Distance:', 'km'), numBox('Time there:', 'min')],
          [K.number(R.d[3], numDiag(R.d[3], [{ v: R.d[1], code: 'wrong-line', hint: 'That is her first stop. The friend’s house is the farthest point from home.' }])), K.number(I.s2, numDiag(I.s2, [{ v: I.s1, code: 'wrong-line', hint: 'That is the first stop. She is at the friend’s house on the highest flat segment, M to N.' }, { v: R.t[4], code: 'shared-time', hint: 'That is the time she leaves. How long is the flat segment M to N?' }]))],
          [String(R.d[3]), String(I.s2)], t(R.d[3] + units('km')) + '; ' + t(I.s2 + units('min')),
          'The friend’s house is the farthest point, ' + t(R.d[3] + units('km')) + ' from home. She is there from ' + t(R.t[3]) + ' to ' + t(R.t[4]) + ' min (M to N): ' + t(R.t[4] + '-' + R.t[3] + '=' + I.s2 + units('min')) + '.', ['The friend’s house is where she turns around.'], 'ride: friend’s house');
      } },
      { id: 'e4c', level: 'BEG', make: function (r, R) {
        var I = rideInfo(R), tot = I.s1 + I.s2;
        return numPart('For how many minutes in total is Jules not moving?', tot, [{ v: I.s1, code: 'one-stop', hint: 'There are <b>two</b> flat segments. Add both.' }, { v: I.s2, code: 'one-stop', hint: 'There are <b>two</b> flat segments. Add both.' }],
          'She is not moving on the flat segments: K to L (' + t(I.s1) + ' min) and M to N (' + t(I.s2) + ' min). Total ' + t(I.s1 + '+' + I.s2 + '=' + tot) + ' min.', ['Not moving = flat segments. How many are there?'], 'ride: time stopped', { after: 'min' });
      } },
      { id: 'e4d', level: 'EMG', make: function (r, R) {
        var tot = 2 * R.d[3];
        return numPart('How far does Jules travel altogether?', tot, [{ v: R.d[3], code: 'dist-vs-travel', hint: 'That is how far she gets from home. She also has to ride back.' }, { v: 0, code: 'dist-vs-travel', hint: 'That is her distance from home at the end, not how far she rode.' }],
          'Out: ' + t(R.d[1] + '+' + (R.d[3] - R.d[1]) + '=' + R.d[3]) + ' km, back: ' + t(R.d[3]) + ' km. Total ' + t(tot) + ' km. The graph shows <b>distance from home</b>, which is ' + t('0') + ' at P because she ends where she started.', ['Add the distance out and the distance back.'], 'ride: total distance', { after: 'km' });
      } }] },
    { num: '5', stem: function (R) { return 'Another of Jules’s rides is shown below. Give every rate of change <b>with its units</b>.' + rideFig(R); }, shared: function (r) { return ride(r, true); }, parts: [
      { id: 'e5a', level: 'EMG', make: function (r, R) {
        var I = rideInfo(R);
        return numPart('Find the rate of change on J to K, in km/h.', I.v1, rateCands(R.d[1], R.t[1], true, I.v1), t('\\text{rate}=\\frac{' + R.d[1] + '-0}{' + R.t[1] + '-0}=' + dn(R.d[1] / R.t[1]) + '\\text{ km/min}') + ', and ' + t(dn(R.d[1] / R.t[1]) + '\\times 60=' + I.v1 + units('km/h')) + '.', ['Rate = change in distance ÷ change in time. Then convert km/min to km/h.'], 'ride: rate J-K', { after: 'km/h' });
      } },
      { id: 'e5b', level: 'EMG', make: function (r, R) {
        var I = rideInfo(R), dd = R.d[3] - R.d[2], dt = R.t[3] - R.t[2];
        return numPart('Find the rate of change on L to M, in km/h.', I.v2, rateCands(dd, dt, true, I.v2).concat([{ v: 60 * R.d[3] / (R.t[3] - R.t[2]), code: 'wrong-line', hint: 'Use the <b>change</b> in distance on L to M (' + t(R.d[3] + '-' + R.d[2]) + '), not the distance at M.' }]),
          t('\\text{rate}=\\frac{' + R.d[3] + '-' + R.d[2] + '}{' + R.t[3] + '-' + R.t[2] + '}=\\frac{' + dd + '}{' + dt + '}=' + dn(dd / dt) + '\\text{ km/min}') + ', so ' + t(dn(dd / dt) + '\\times 60=' + I.v2 + units('km/h')) + '.', ['Use the change in distance and the change in time on this segment only.'], 'ride: rate L-M', { after: 'km/h' });
      } },
      { id: 'e5c', level: 'EMG', make: function (r, R) {
        var I = rideInfo(R), before = I.v1 > I.v2;
        return K.P.mc(r, 'Is Jules faster before her first stop or after it, and how does the picture show that?', [
          { html: 'Before — J to K is the steeper segment.', right: before, why: before ? null : 'Compare the steepness: ' + t(I.v1 + units('km/h')) + ' on J to K and ' + t(I.v2 + units('km/h')) + ' on L to M.' },
          { html: 'After — L to M is the steeper segment.', right: !before, why: !before ? null : 'Compare the steepness: ' + t(I.v1 + units('km/h')) + ' on J to K and ' + t(I.v2 + units('km/h')) + ' on L to M.' },
          { html: 'After — L to M is higher up on the graph.', why: 'Height shows distance from home, not speed. Speed is shown by the <b>steepness</b>.' },
          { html: 'Before — J to K starts at the origin.', why: 'Where a segment starts doesn’t tell you the speed. Compare how steep the segments are.' }],
          'J to K: ' + t(I.v1 + units('km/h')) + '; L to M: ' + t(I.v2 + units('km/h')) + '. She is faster <b>' + (before ? 'before' : 'after') + '</b> the stop, and that segment is the steeper one.', ['Steeper = faster.'], 'ride: faster before/after', true);
      } },
      { id: 'e5d', level: 'BEG', make: function (r, R) {
        return numPart('Find the rate of change on K to L, in km/h.', 0, [{ v: R.d[1], code: 'wrong-line', hint: 'That is her distance from home. The rate of change is the <b>change</b> in distance ÷ time.' }, { v: R.t[2] - R.t[1], code: 'rate-flip', hint: 'That is the time. How much does the distance change on K to L?' }],
          t('\\text{rate}=\\frac{' + R.d[2] + '-' + R.d[1] + '}{' + R.t[2] + '-' + R.t[1] + '}=0') + ' km/h: her distance from home is not changing — she is stopped.', ['How much does the distance change on a flat segment?'], 'ride: rate K-L', { after: 'km/h' });
      } },
      { id: 'e5e', level: 'PRG', make: function (r, R) {
        var I = rideInfo(R), dt = R.t[5] - R.t[4];
        return numPart('Find the rate of change on N to P, in km/h.', I.v3, rateCands(-R.d[4], dt, true, I.v3),
          t(dt + units('min') + '=' + fr(dt / 60) + units('h')) + '. ' + t('\\text{rate}=\\frac{0-' + R.d[4] + '}{' + fr(dt / 60) + '}=' + I.v3 + units('km/h')) + '. The negative sign means her <b>distance from home is decreasing</b> — she is riding back toward home (forwards on her bike).', ['The distance goes down on this segment. What sign does that give the rate of change?'], 'ride: rate N-P', { after: 'km/h' });
      } },
      { id: 'e5f', level: 'EMG', make: function (r, R) {
        var I = rideInfo(R), sp = -I.v3;
        return numPart('How fast is Jules actually pedalling on N to P, in km/h?', sp, [{ v: I.v3, code: 'speed-sign', hint: 'Speed is only <b>how fast</b>, with no direction, so it is never negative. The minus sign only tells which way the distance from home is changing.' }, { v: sp / 60, code: 'per-min', hint: 'Give the speed in km/h.' }],
          'Speed is the size of the rate of change: ' + t('|' + I.v3 + '|=' + sp + units('km/h')) + '. The sign only tells that the distance from home is decreasing.', ['Speed has no direction.'], 'ride: speed N-P', { after: 'km/h' });
      } },
      { id: 'e5g', level: 'EMG', make: function (r, R) {
        var I = rideInfo(R), sizes = [I.v1, I.v2, -I.v3], mx = Math.max.apply(null, sizes), names = ['J to K', 'L to M', 'N to P'];
        var means = ['she is riding away from home fastest on her first ride out', 'she rides fastest on the second part of the trip out', 'the ride home is the fastest part of the trip'];
        return K.P.mc(r, 'Which segment is steepest, and what does that tell you about the ride?', names.map(function (n, i) {
          return { html: n + ': ' + means[i] + '.', right: sizes[i] === mx, why: sizes[i] === mx ? null : 'Compare the sizes of the rates: ' + t(I.v1) + ', ' + t(I.v2) + ' and ' + t('|' + I.v3 + '|=' + (-I.v3)) + ' km/h. A falling segment can be the steepest too.' };
        }).concat([{ html: 'M to N: she is highest there.', why: 'M to N is flat — its rate of change is ' + t('0') + '. Height is distance, not speed.' }]),
          'Sizes of the rates: ' + t(I.v1) + ', ' + t(I.v2) + ' and ' + t('|' + I.v3 + '|=' + (-I.v3)) + ' km/h. The steepest is <b>' + names[sizes.indexOf(mx)] + '</b>: ' + means[sizes.indexOf(mx)] + '.', ['Steepness ignores the sign: compare the sizes of the rates.'], 'ride: steepest segment', true);
      } }] },

    { num: '6', stem: function (Dr) {
        var X = Dr.t[5] + 12, Y = Dr.a[3] + 20, pts = Dr.t.map(function (x, i) { return [x, Dr.a[i]]; });
        return 'A survey drone rises from the ground, hovers, climbs again, hovers again, then descends. The graph shows its altitude against time.' +
          ctx({ X: X, Y: Y, gx: 10, gy: 10, xt: 'Time (s)', yt: 'Altitude (m)', pts: pts, xT: tickList(20, X - 5, 20), yT: tickList(20, Y - 5, 20), aria: 'drone altitude' });
      }, shared: function (r) {
        if (r.chance(0.3)) return { t: [0, 20, 50, 70, 90, 110], a: [0, 60, 60, 100, 100, 0], r: [3, 2, -5] };
        for (var k = 0; k < 3000; k++) {
          var c1 = r.pick([10, 15, 20, 25]), r1 = r.pick([2, 3, 4, 5]), h1 = r.pick([10, 20, 30]), c2 = r.pick([10, 20]), r2 = r.pick([1, 2, 3]), h2 = r.pick([10, 20]), r3 = r.pick([4, 5, 6, 8, 10]);
          var a1 = r1 * c1, a2 = a1 + r2 * c2, c3 = a2 / r3;
          if (r1 === r2 || r3 <= Math.max(r1, r2) || c3 % 5 || a2 > 160 || (10 * r3) % r2) continue;
          var tt = [0, c1, c1 + h1, c1 + h1 + c2, c1 + h1 + c2 + h2]; tt.push(tt[4] + c3); if (tt[5] > 130) continue;
          return { t: tt, a: [0, a1, a1, a2, a2, 0], r: [r1, r2, -r3] };
        }
      }, parts: [
      { id: 'e6a', level: 'BEG', make: function (r, Dr) {
        return numPart('Find the rate of change of altitude during the first climb, in m/s.', Dr.r[0], rateCands(Dr.a[1], Dr.t[1], false, Dr.r[0]).concat([{ v: Dr.a[1], code: 'avg-speed', hint: 'That is the altitude. Divide the change in altitude by the time it took.' }]),
          t('\\text{rate}=\\frac{' + Dr.a[1] + '-0}{' + Dr.t[1] + '-0}=' + Dr.r[0] + units('m/s')) + ': the drone gains ' + Dr.r[0] + ' m every second.', ['Change in altitude ÷ change in time.'], 'drone: first climb', { after: 'm/s' });
      } },
      { id: 'e6b', level: 'BEG', make: function (r, Dr) {
        var dd = Dr.a[3] - Dr.a[2], dt = Dr.t[3] - Dr.t[2];
        return numPart('Find the rate of change during the second climb, in m/s.', Dr.r[1], rateCands(dd, dt, false, Dr.r[1]).concat([{ v: Dr.a[3] / dt, code: 'wrong-line', hint: 'Use the <b>change</b> in altitude (' + t(Dr.a[3] + '-' + Dr.a[2]) + '), not the final altitude.' }]),
          t('\\text{rate}=\\frac{' + Dr.a[3] + '-' + Dr.a[2] + '}{' + Dr.t[3] + '-' + Dr.t[2] + '}=\\frac{' + dd + '}{' + dt + '}=' + Dr.r[1] + units('m/s')) + '. The ' + (Dr.r[0] > Dr.r[1] ? 'first' : 'second') + ' climb is faster — its segment is steeper.', ['Use only the change during the second climb.'], 'drone: second climb', { after: 'm/s' });
      } },
      { id: 'e6c', level: 'EMG', make: function (r, Dr) {
        var dt = Dr.t[5] - Dr.t[4];
        return numPart('Find the rate of change during the descent, in m/s.', Dr.r[2], rateCands(-Dr.a[4], dt, false, Dr.r[2]),
          t('\\text{rate}=\\frac{0-' + Dr.a[4] + '}{' + Dr.t[5] + '-' + Dr.t[4] + '}=\\frac{-' + Dr.a[4] + '}{' + dt + '}=' + Dr.r[2] + units('m/s')) + '. The negative sign means the drone is <b>losing</b> altitude, ' + (-Dr.r[2]) + ' m every second.', ['The altitude decreases, so the rate of change is negative.'], 'drone: descent', { after: 'm/s' });
      } },
      { id: 'e6d', level: 'BEG', make: function (r, Dr) {
        var h1 = Dr.t[2] - Dr.t[1], h2 = Dr.t[4] - Dr.t[3];
        return numPart('For how many seconds in total is the altitude constant?', h1 + h2, [{ v: h1, code: 'flat-time', hint: 'There are two flat pieces. Add both.' }, { v: h2, code: 'flat-time', hint: 'There are two flat pieces. Add both.' }],
          'Flat from ' + Dr.t[1] + ' to ' + Dr.t[2] + ' s (' + h1 + ' s) and from ' + Dr.t[3] + ' to ' + Dr.t[4] + ' s (' + h2 + ' s): total ' + t(h1 + h2) + ' s.', ['Constant altitude = flat segments.'], 'drone: hovering time', { after: 's' });
      } },
      { id: 'e6e', level: 'EMG', make: function (r, Dr) {
        var q = -Dr.r[2] / Dr.r[1];
        return numPart('The descent is steeper than either climb. The drone comes down ________ times as fast as it went up on the second climb.', q, [{ v: Dr.r[1] / -Dr.r[2], code: 'ratio', hint: 'Divide the faster rate (the descent) by the slower one (the second climb).' }, { v: -Dr.r[2] - Dr.r[1], code: 'ratio', hint: '“How many times as fast” means divide, not subtract.' }, { v: -Dr.r[2] / Dr.r[0], code: 'wrong-line', hint: 'That compares with the <b>first</b> climb.' }],
          'Descent: ' + t((-Dr.r[2]) + units('m/s')) + ' down; second climb: ' + t(Dr.r[1] + units('m/s')) + ' up. ' + t((-Dr.r[2]) + '\\div ' + Dr.r[1] + '=' + dn(q)) + ' times as fast.', ['Compare the sizes of the two rates by dividing.'], 'drone: compare rates');
      } },
      { id: 'e6f', level: 'EMG', make: function (r, Dr) {
        return K.P.tf(r, 'While the graph is flat, the drone’s altitude is not changing. True or false: that proves the drone is not moving at all.', false, 'The graph records only altitude. The drone could be flying level across the survey area.',
          '<b>False.</b> Flat means the <b>height</b> is constant. The drone could be hovering in place or flying level — the graph doesn’t show horizontal motion.', ['What does this graph measure, and what doesn’t it show?'], 'drone: flat ≠ not moving');
      } }] },

    { num: '7', section: 'Extra practice C — Sketching a graph from a story', stem: 'There is no scale, so only the <b>shape</b> matters: where it rises, falls, stays flat, bends or repeats. Choose the best sketch.', parts: [
      { id: 'e7a', level: 'EMG', make: function (r) {
        var it = r.pick(['A mug of hot coffee is left on a desk in a warm room and forgotten all afternoon.', 'A bowl of hot soup is left on the kitchen table and forgotten.', 'A pot of boiling water is taken off the stove and left on the counter.']);
        return mcG(r, it + ' Which graph shows its temperature (vertical) against time (horizontal)?', [
          { html: sk(S.downSlow(1.7)), right: true },
          { html: sk(S.down0(8.6)), code: 'lin', why: 'A straight line means it cools by the same amount every minute, down to nothing. It cools fastest at first, then more slowly, and stops at room temperature.' },
          { html: sk(S.downFast()), code: 'fast', why: 'This cools slowly at first and faster later. A hot drink cools fastest at the start, when it is much hotter than the room.' },
          { html: sk(S.downSlow(0.08)), code: 'zero', why: 'This levels off at about zero. It can only cool to room temperature, which is well above the bottom of the graph.' }],
          'Decreasing, <b>steeply at first, then more slowly</b>; it levels off at room temperature and never drops below it.', ['When is it cooling fastest? Where does it stop?'], 'sketch: cooling');
      } },
      { id: 'e7b', level: 'EMG', make: function (r) {
        var k = r.pick([2, 3, 3, 4]), wn = k === 2 ? 3 : k - 1;
        return mcG(r, 'One seat on a Ferris wheel turning at a steady rate, for ' + k + ' complete turns, starting from the loading platform at the bottom. Which graph shows the height of the seat against time?', [
          { html: sk(S.wave(k, 'low', 0.4, 5.2)), right: true },
          { html: sk(S.wave(k, 'high', 0.4, 5.2)), code: 'top', why: 'This starts at the top. The seat starts at the loading platform, at the <b>bottom</b>.' },
          { html: sk(S.wave(wn, 'low', 0.4, 5.2)), code: 'count', why: 'Count the cycles: this shows ' + wn + ' turns, not ' + k + '.' },
          { html: sk(S.damped(k, 0.4)), code: 'damped', why: 'The peaks shrink here. The wheel turns steadily, so every turn reaches the same top height.' }],
          'A repeating wave: <b>' + k + ' identical cycles</b>, starting at the bottom (the platform), each rising to the same top and back down.', ['Where does the seat start? How many cycles?'], 'sketch: Ferris wheel');
      } },
      { id: 'e7c', level: 'EMG', make: function (r) {
        var pl = r.pick(['a school parking lot from 7:00 a.m. to 5:00 p.m. on a school day', 'an office building’s parking garage from 6:00 a.m. to 7:00 p.m. on a workday']);
        return mcG(r, 'The number of cars in ' + pl + '. Which graph fits best (number of cars vertical, time horizontal)?', [
          { html: sk({ segs: [Ln([[0.3, 0.3], [1, 0.5], [2.2, 4.6], [2.8, 4.8], [7.6, 4.7], [8.2, 4.4], [9.2, 0.6], [9.6, 0.4]])] }), right: true },
          { html: sk(S.hill(4.95, 0.3, 4.8, 0.3)), code: 'hill', why: 'This builds up slowly all morning and drains slowly all afternoon. People arrive in a rush, stay all day, then leave in a rush.' },
          { html: sk(S.up()), code: 'up', why: 'This keeps rising all day. The lot empties at the end of the day.' },
          { html: sk({ segs: [Ln([[0.3, 0.3], [1, 0.5], [2.2, 4.6], [9.6, 4.8]])] }), code: 'nofall', why: 'This rises and stays full. Everyone leaves at the end of the day, so it must fall again.' }],
          'Near ' + t('0') + ' early, a <b>steep rise</b> as people arrive, roughly <b>flat</b> all day, then a <b>steep fall</b> when everyone leaves.', ['When do the cars arrive and leave? Quickly or slowly?'], 'sketch: parking lot');
      } },
      { id: 'e7d', level: 'BEG', make: function (r) {
        var D = r.pick([3, 5, 5, 8, 10]);
        function G(sh) { return sk(sh, { pad: true, yT: [[5, String(D)]] }); }
        return mcG(r, 'A runner jogs a straight ' + t(D + units('km')) + ' course at one steady pace. Which graph shows the distance she still has <b>left</b> to run (in km) against time?', [
          { html: G({ segs: [Ln([[0, 5], [8.4, 0]], { end: 'closed' })] }), right: true },
          { html: G({ segs: [Ln([[0, 0], [8.4, 5]], { end: 'closed' })] }), code: 'run', why: 'This shows the distance she has <b>run</b>, which goes up. The distance left goes down.' },
          { html: G({ fns: [Fn(function (x) { return 5 * Math.exp(-0.32 * x); }, 0, 9.6)] }), code: 'curve', why: 'A curve that flattens means she slows down and never finishes. A steady pace gives a straight line.' },
          { html: G({ segs: [Ln([[0, 5], [6, 1.5]], { end: 'closed' })] }), code: 'short', why: 'This stops before reaching ' + t('0') + '. When she finishes, the distance left is ' + t('0') + '.' }],
          'A <b>straight line falling from ' + D + ' to 0</b>: a steady pace is a constant rate of change, and it reaches ' + t('0') + ' when she finishes.', ['Does the distance left go up or down? Is the pace steady?'], 'sketch: distance left');
      } }] },
    { num: '8', stem: 'Each of these has a detail that is easy to get wrong. Choose the best sketch.', parts: [
      { id: 'e8a', level: 'EMG', make: function (r) {
        var sh = function (o) { return sk(o); };
        var ob = r.pick([['A stone is dropped from a bridge and falls until it hits the water.', 'stone', 'water'], ['An apple falls from a tall tree until it hits the ground.', 'apple', 'ground'], ['A coin is dropped from a lookout tower into a pond.', 'coin', 'water']]);
        return mcG(r, ob[0] + ' Which graph shows the <b>distance it has fallen</b> against time? (A falling object does not fall at a steady speed.)', [
          { html: sh({ fns: [Fn(function (x) { return 0.08 * x * x; }, 0, 8)], points: [{ x: 8, y: 5.12 }] }), right: true },
          { html: sh({ segs: [Ln([[0, 0], [8, 5.12]], { end: 'closed' })] }), code: 'lin', why: 'A straight line means a steady speed. The ' + ob[1] + ' speeds up as it falls, so the graph gets steeper and steeper.' },
          { html: sh({ fns: [Fn(function (x) { return 5.3 * (1 - Math.exp(-0.38 * x)); }, 0, 8)], points: [{ x: 8, y: 5.3 * (1 - Math.exp(-3.04)) }] }), code: 'slow', why: 'This flattens out, as if the ' + ob[1] + ' slowed down. It speeds up all the way down.' },
          { html: sh({ fns: [Fn(function (x) { return 5.12 - 0.08 * x * x; }, 0, 8)], points: [{ x: 8, y: 0 }] }), code: 'height', why: 'This is the ' + ob[1] + '’s <b>height</b> above the ' + ob[2] + ', which goes down. The question asks for the distance fallen, which goes up.' }],
          'From the origin, rising and getting <b>steeper and steeper</b> (the ' + ob[1] + ' speeds up); it stops when it hits the ' + ob[2] + '.', ['Does the distance fallen go up or down? Is the speed steady?'], 'sketch: falling stone');
      } },
      { id: 'e8b', level: 'EMG', make: function (r) {
        var n = r.pick([2, 3, 3]), w = 9.3 / n;
        function bus(low, stops) { var pts = [[0, 0]]; for (var i = 0; i < stops; i++) { var x = i * (9.3 / stops); pts.push([x + 0.12 * w * (n / stops), 4.2], [x + 0.62 * w * (n / stops), 4.2], [x + 0.74 * w * (n / stops), low], [x + (i === stops - 1 ? 0.74 : 1) * w * (n / stops), low]); } return { segs: [Ln(pts)] }; }
        var stair = []; for (var i = 0; i < n; i++) { var x0 = i * w; stair.push([x0, i * 1.6], [x0 + 0.7 * w, (i + 1) * 1.6], [x0 + w, (i + 1) * 1.6]); }
        return mcG(r, 'A bus leaves the depot and makes ' + n + ' stops along its route. Which graph shows the bus’s <b>speed</b> from the moment it leaves the depot until it reaches stop ' + n + '?', [
          { html: sk(bus(0, n)), right: true },
          { html: sk(bus(1.6, n)), code: 'high', why: 'Here the flat parts between trips are above the axis — that means driving at a lower steady speed. At a stop the speed is ' + t('0') + ', so the graph must sit <b>on</b> the time axis.' },
          { html: sk({ segs: [Ln(stair)] }), code: 'dist', why: 'This graph only goes up — it looks like the bus’s <b>distance</b> along the route. Speed drops to ' + t('0') + ' at every stop.' },
          { html: sk(bus(0, n - 1 || 1)), code: 'count', why: 'Count the stops: the speed should drop to ' + t('0') + ' ' + n + ' times.' }],
          'Speed up, cruise, slow to ' + t('0') + ' — ' + n + ' times. The stops are flat parts <b>on the time axis</b> (speed ' + t('0') + '), not flat parts up high (which mean cruising).', ['What is the speed at a stop? Where is that on the graph?'], 'sketch: bus speed');
      } },
      { id: 'e8c', level: 'EMG', make: function (r) {
        var tb = r.pick([['A tap fills a bathtub at a steady rate. The tap is turned off, someone bathes for a while, and then the plug is pulled', 'tub', 'someone bathes', 'bathing'], ['A hose fills a kiddie pool at a steady rate. The hose is turned off, the kids play in it for a while, and then it is pumped out', 'pool', 'the kids play', 'playing'], ['A tap fills a sink at a steady rate. The tap is turned off, someone washes the dishes, and then the plug is pulled', 'sink', 'someone washes the dishes', 'washing']]);
        return mcG(r, tb[0] + ' and it empties <b>faster</b> than it filled. Which graph shows the amount of water in the ' + tb[1] + ' against time?', [
          { html: sk({ segs: [Ln([[0.3, 0], [3.8, 4.4], [6.2, 4.4], [7.8, 0], [9.6, 0]])] }), right: true },
          { html: sk({ segs: [Ln([[0.3, 0], [2.4, 4.4], [4.6, 4.4], [9.4, 0]])] }), code: 'slowempty', why: 'Here the fall is gentler than the rise, so it empties more slowly. Emptying faster means a <b>steeper</b> fall.' },
          { html: sk({ segs: [Ln([[0.3, 0], [3.8, 4.4], [5.4, 0], [9.6, 0]])] }), code: 'noflat', why: 'There is no flat part. While ' + tb[2] + ', no water goes in or out, so the amount stays constant.' },
          { html: sk({ fns: [Fn(function (x) { return x <= 3.8 ? 4.4 * Math.sqrt((x - 0.3) / 3.5) : x <= 6.2 ? 4.4 : Math.max(0, 4.4 - 4.4 * Math.pow((x - 6.2) / 1.6, 0.5)); }, 0.3, 9.6)] }), code: 'curve', why: 'The rising part curves (slowing down). A tap at a steady rate adds the same amount each minute, so the rise should be straight.' }],
          'Straight rise (filling steadily), flat (' + tb[3] + '), then a straight fall to ' + t('0') + ' that is <b>steeper than the rise</b>, because it empties faster than it filled.', ['Three stages: filling, bathing, emptying. Which is steepest?'], 'sketch: bathtub');
      } },
      { id: 'e8d', level: 'EMG', make: function (r) {
        var it = r.pick(['A phone', 'A tablet', 'A gaming console']);
        return mcG(r, it + ' loses value quickly in its first year and more slowly after that, but a working one is never quite worthless. Which graph shows its value against its age?', [
          { html: sk(S.downSlow(1.0)), right: true },
          { html: sk(S.downSlow(0.0)), code: 'zero', why: 'This curve sinks right down to the axis — worth nothing. A working one is never quite worthless, so it levels off <b>above</b> the axis.' },
          { html: sk(S.down0(8.6)), code: 'lin', why: 'A straight line loses the same amount every year and reaches ' + t('\\$0') + '. It loses value fastest in the first year.' },
          { html: sk(S.downFast()), code: 'fast', why: 'This loses value slowly at first and faster later — the opposite of the description.' }],
          'Decreasing, steep in the first year and then flattening, but <b>staying above the axis</b>: it never reaches ' + t('\\$0') + '.', ['When does it lose value fastest? Does it ever reach zero?'], 'sketch: phone value');
      } }] },
    { num: '9', stem: function (s) { return 'This sketch has a scale, so the numbers matter. ' + s.nm + ' leaves home at 8:00 a.m. ' + s.nm + ' walks ' + t(dn(s.d[0]) + units('km')) + ' to the bus stop, arriving at ' + hm(8 + s.tt[1] / 60) + ', and waits ' + t(s.w + units('min')) + '. The bus then carries ' + s.nm + ' ' + t(s.d[1] + units('km')) + ' farther from home, arriving at ' + hm(8 + s.tt[3] / 60) + '. From there ' + s.nm + ' walks the last ' + t(dn(s.d[2]) + units('km')) + ' to work, arriving at ' + hm(8 + s.tt[4] / 60) + '.'; },
      shared: function (r) {
        var nm = r.pick(['Sanjay', 'Ravi', 'Tariq', 'Iris', 'Hana']);
        if (r.chance(0.3)) return { nm: 'Sanjay', tt: [0, 20, 30, 50, 65], d: [2, 12, 1], v: [6, 0, 36, 4], w: 10 };
        for (var k = 0; k < 3000; k++) {
          var w1 = r.pick([4, 5, 6]), t1 = r.pick([12, 15, 18, 20, 24, 30]), w = r.pick([5, 10, 15]), vb = r.pick([30, 36, 40, 45, 48, 60]), t2 = r.pick([15, 20, 25, 30]), w2 = r.pick([3, 4, 5, 6]), t3 = r.pick([10, 12, 15, 20]);
          var d1 = w1 * t1 / 60, d2 = vb * t2 / 60, d3 = w2 * t3 / 60;
          if ((d1 * 2) % 1 || d2 % 1 || (d3 * 2) % 1 || d2 > 16) continue;
          var tt = [0, t1, t1 + w, t1 + w + t2, t1 + w + t2 + t3]; if (tt[4] > 85) continue;
          return { nm: nm, tt: tt, d: [d1, d2, d3], v: [w1, 0, vb, w2], w: w };
        }
      }, parts: [
      { id: 'e9a', level: 'PRG', make: function (r, s) {
        var tt = s.tt, c = [0, s.d[0], s.d[0], s.d[0] + s.d[1], s.d[0] + s.d[1] + s.d[2]], X = tt[4] + 10, Y = c[4] + 2;
        function G(pts) { return fig({ x: [0, X], y: [0, Y], grid: 5, gridY: 1, labels: 0, firstQuadrant: true, unitX: 160 / X, unitY: 110 / Y, xName: ' ', yName: ' ', yTitle: ' ', segs: [{ pts: pts }], xt: tickList(20, X - 4, 20), yt: tickList(Y > 12 ? 4 : 2, Y - 0.5, Y > 12 ? 4 : 2), max: 220 }); }
        var right = tt.map(function (x, i) { return [x, c[i]]; });
        var back = right.slice(0, 4).concat([[tt[4], c[3] - s.d[2]]]);
        var nowait = [[0, 0], [tt[1], c[1]], [tt[3] - s.w, c[3]], [tt[4] - s.w, c[4]]];
        var swap = [[0, 0], [tt[1], c[1]], [tt[2], c[2]], [tt[3], c[2] + s.d[2]], [tt[4], c[4]]];
        return mcG(r, 'Which graph shows ' + s.nm + '’s distance from home (km) against time since 8:00 (min)?', [
          { html: G(right), right: true },
          { html: G(back), code: 'back', why: 'The last segment goes <b>down</b>, back toward home. The last walk takes ' + s.nm + ' farther from home, to work.' },
          { html: G(nowait), code: 'nowait', why: 'There is no flat piece. The ' + s.w + '-minute wait at the bus stop is a flat segment at ' + t(dn(c[1]) + units('km')) + '.' },
          { html: G(swap), code: 'swap', why: 'Check the bus ride: it should take ' + s.nm + ' from ' + t(dn(c[2])) + ' km to ' + t(dn(c[3])) + ' km. In this graph the bus part only covers ' + t(dn(s.d[2])) + ' km.' }],
          'Join ' + right.map(function (p) { return t('(' + p[0] + ',' + dn(p[1]) + ')'); }).join(', ') + ' with straight segments.', ['Find each corner point: (minutes after 8:00, km from home).'], 'commute graph');
      } },
      { id: 'e9b', level: 'PRG', make: function (r, s) {
        var tt = s.tt, dd = [s.d[0], 0, s.d[1], s.d[2]], f = ['First walk:', 'Wait:', 'Bus:', 'Last walk:'].map(function (l) { return numBox(l, 'km/h'); });
        var ch = dd.map(function (d, i) { var dt = tt[i + 1] - tt[i]; return K.number(s.v[i], numDiag(s.v[i], rateCands(d, dt, true, 0))); });
        var p = K.P.fields('Find the rate of change of each of the four parts of the journey, in km/h.', f, ch, s.v.map(String), s.v.map(function (v) { return t(v + units('km/h')); }).join(', '),
          dd.map(function (d, i) { var dt = tt[i + 1] - tt[i]; return ['Walk', 'Wait', 'Bus', 'Walk'][i] + ': ' + t('\\frac{' + dn(d) + '}{' + dt + '}\\text{ km/min}\\times 60=' + s.v[i] + units('km/h')); }).join('<br>'), ['For each part: change in distance ÷ change in time, then × 60 to change km/min to km/h.'], 'commute rates');
        p.bad = [dd.map(function (d, i) { return dn(d / (tt[i + 1] - tt[i])); })]; return p;
      } },
      { id: 'e9c', level: 'BEG', make: function (r, s) {
        return K.P.mc(r, 'Which part of the journey has the steepest segment?', [
          { html: 'The bus ride — a bus travels much faster than a person walks.', right: true },
          { html: 'The first walk — it starts at home.', why: 'Where a segment starts doesn’t matter. Compare the rates: ' + s.v.join(', ') + ' km/h.' },
          { html: 'The wait — the bus stop is the most important part.', why: 'The wait is flat: rate of change ' + t('0') + '.' },
          { html: 'The last walk — it ends highest on the graph.', why: 'Height is distance from home, not speed. Compare the rates.' }],
          'The <b>bus ride</b> (' + t(s.v[2] + units('km/h')) + '), by far: a faster rate of change is a steeper segment.', ['Steeper = faster.'], 'commute: steepest');
      } }] },

    { num: '10', section: 'Extra practice D — The same journey on two different graphs', stem: function (v) {
        var X = v.T + 0.5, Y = v.d2 * 1.15, ys = v.d2 > 200 ? 80 : 40;
        return 'A delivery van leaves the depot, stops to unload, then drives on. Its <b>distance from the depot</b> is graphed below.' +
          ctx({ X: X, Y: Y, gx: 0.5, gy: ys / 2, xt: 'Time (h)', yt: 'Distance (km)', pts: [[0, 0], [v.t1, v.d1], [v.t1 + v.s, v.d1], [v.T, v.d2]], xT: tickList(0.5, X - 0.2, 0.5), yT: tickList(ys, Y - 5, ys), aria: 'van distance' });
      }, shared: function (r) {
        if (r.chance(0.3)) return { v1: 60, t1: 1, s: 0.5, v2: 80, t2: 1.5, d1: 60, d2: 180, T: 3 };
        for (var k = 0; k < 500; k++) {
          var v1 = r.pick([40, 50, 60, 70, 80, 90]), v2 = r.pick([40, 50, 60, 70, 80, 90]), t1 = r.pick([1, 1.5, 2]), t2 = r.pick([1, 1.5, 2]), s = r.pick([0.5, 1]);
          if (Math.abs(v1 - v2) < 20 || t1 + s + t2 > 4.5) continue;
          return { v1: v1, t1: t1, s: s, v2: v2, t2: t2, d1: v1 * t1, d2: v1 * t1 + v2 * t2, T: t1 + s + t2 };
        }
      }, parts: [
      { id: 'e10a', level: 'EMG', make: function (r, v) {
        var f = [numBox('First part:', 'km/h'), numBox('Middle part:', 'km/h'), numBox('Last part:', 'km/h')];
        return K.P.fields('Find the van’s speed on each of the three parts of the journey, in km/h.', f,
          [K.number(v.v1, numDiag(v.v1, [{ v: v.t1 / v.d1, code: 'rate-flip', hint: 'Speed = distance ÷ time.' }])), K.number(0, numDiag(0, [{ v: v.d1, code: 'wrong-line', hint: 'That is the distance from the depot. While it unloads, how fast is the van going?' }, { v: v.d1 / v.s, code: 'wrong-line', hint: 'The distance doesn’t change during this part. How fast is the van going?' }])),
            K.number(v.v2, numDiag(v.v2, [{ v: v.d2 / v.t2, code: 'wrong-line', hint: 'Use the <b>change</b> in distance on the last part: ' + t(v.d2 + '-' + v.d1) + '.' }, { v: v.d2 / v.T, code: 'avg-speed', hint: 'That is the average for the whole trip. Use only the last part.' }]))],
          [String(v.v1), '0', String(v.v2)], t(v.v1) + ', ' + t('0') + ', ' + t(v.v2) + ' km/h',
          t('0') + ' to ' + t(dn(v.t1)) + ' h: ' + t('\\frac{' + v.d1 + '}{' + dn(v.t1) + '}=' + v.v1) + ' km/h. Then ' + t('0') + ' km/h for ' + t(dn(v.s)) + ' h (unloading). Last part: ' + t('\\frac{' + v.d2 + '-' + v.d1 + '}{' + dn(v.T) + '-' + dn(v.t1 + v.s) + '}=\\frac{' + (v.d2 - v.d1) + '}{' + dn(v.t2) + '}=' + v.v2) + ' km/h.', ['Speed on each part = change in distance ÷ change in time.'], 'van speeds');
      } },
      { id: 'e10b', level: 'PRG', make: function (r, v) {
        var top = Math.max(v.v1, v.v2), Y = top * 1.3, e = 0.04 * v.T, A = v.t1, B = v.t1 + v.s;
        function G(pts) { return fig({ x: [0, v.T + 0.3], y: [0, Y], grid: 0, labels: 0, firstQuadrant: true, unitX: 160 / (v.T + 0.3), unitY: 100 / Y, xName: ' ', yName: ' ', yTitle: ' ', segs: [{ pts: pts }], xt: tickList(1, v.T, 1), yt: [[v.v1, String(v.v1)], [v.v2, String(v.v2)]], max: 220 }); }
        return mcG(r, 'Which <b>speed</b>–time graph (speed in km/h, time in h) shows the same journey? (The near-vertical pieces are drawn steep rather than truly vertical.)', [
          { html: G([[0, v.v1], [A - e, v.v1], [A + e, 0], [B - e, 0], [B + e, v.v2], [v.T, v.v2]]), right: true },
          { html: G([[0, 0], [A, v.v1], [B, v.v1], [v.T, Math.min(Y * 0.95, v.v1 + v.v2 * 0.6)]]), code: 'copy', why: 'This copies the shape of the distance graph. A <b>straight</b> distance segment means a <b>constant</b> speed — a flat line on a speed graph.' },
          { html: G([[0, v.v1], [B - e, v.v1], [B + e, v.v2], [v.T, v.v2]]), code: 'nostop', why: 'This never drops to ' + t('0') + ', so the stop to unload is missing.' },
          { html: G([[0, v.v2], [A - e, v.v2], [A + e, 0], [B - e, 0], [B + e, v.v1], [v.T, v.v1]]), code: 'swap', why: 'The two speeds are swapped: ' + t(v.v1) + ' km/h comes before the stop and ' + t(v.v2) + ' km/h after.' }],
          t(v.v1) + ' km/h for the first ' + t(dn(v.t1)) + ' h, ' + t('0') + ' for the ' + t(dn(v.s)) + '-h stop, then ' + t(v.v2) + ' km/h to the end: three flat pieces, the middle one on the time axis.', ['Each straight distance segment is one constant speed.'], 'van speed graph');
      } }] },

    { num: '11', stem: 'This is the heart of the lesson: the same feature means different things on a distance–time graph and on a speed–time graph.', parts: [
      { id: 'e11a', level: 'EMG', make: function (r) { return featPart(r, 'dist'); } },
      { id: 'e11b', level: 'PRG', make: function (r) { return featPart(r, 'speed'); } }] },

    { num: '12', stem: function (L) {
        var X = L.t[4] + 8, Y = L.v + 5;
        return 'The graph shows the <b>speed</b> of a light-rail train between two stations.' + ctx({ X: X, Y: Y, gx: 5, gy: 5, xt: 'Time (s)', yt: 'Speed (m/s)', pts: [[0, 0], [L.t[1], L.v], [L.t[2], L.v], [L.t[3], 0], [L.t[4], 0]], xT: tickList(10, X - 4, 10), yT: tickList(5, Y - 2, 5), aria: 'train speed' });
      }, shared: function (r) {
        if (r.chance(0.3)) return { t: [0, 10, 40, 50, 70], v: 20 };
        var t1 = r.pick([8, 10, 12, 15]), t2 = t1 + r.pick([20, 25, 30, 40]), t3 = t2 + r.pick([8, 10, 12]), t4 = t3 + r.pick([15, 20]);
        return { t: [0, t1, t2, t3, t4], v: r.pick([15, 18, 20, 24, 25]) };
      }, parts: [
      { id: 'e12a', level: 'BEG', make: function (r, L) {
        var rows = [0, 1, 2, 3].map(function (i) { return { id: 's' + i, html: L.t[i] + '–' + L.t[i + 1] + ' s' }; }), want = { s0: 'up', s1: 'steady', s2: 'down', s3: 'stop' };
        var cols = [{ id: 'up', html: 'Speeding<br>up' }, { id: 'steady', html: 'Steady<br>speed' }, { id: 'down', html: 'Slowing<br>down' }, { id: 'stop', html: 'Stopped' }];
        var p = K.P.grid('Describe the journey: what is the train doing on each part?', rows, cols, want, { why: function (row) {
          return { code: 'row', hint: { s0: 'The speed rises from 0: the train is speeding up.', s1: 'Flat <b>above</b> the axis on a speed graph means the speed isn’t changing: a steady speed, not stopped.', s2: 'The speed falls to 0: the train is slowing down.', s3: 'On the axis the speed is 0: the train is stopped.' }[row] };
        } }, rows.map(function (rw) { return rw.html + ': ' + { up: 'speeding up steadily from rest to ' + L.v + ' m/s', steady: 'steady speed of ' + L.v + ' m/s', down: 'slowing down steadily to a stop', stop: 'stopped at the station (speed 0)' }[want[rw.id]]; }).join('<br>'), ['On a speed graph: rising = speeding up, flat = steady speed, falling = slowing down, on the axis = stopped.'], 'train: describe speed');
        p.answer = rows.map(function (rw) { return rw.html + ': ' + { up: 'speeding up', steady: 'steady speed', down: 'slowing down', stop: 'stopped' }[want[rw.id]]; }).join('<br>'); return p;
      } },
      { id: 'e12b', level: 'PRG', make: function (r, L) {
        var t1 = L.t[1], t2 = L.t[2], t3 = L.t[3], t4 = L.t[4], v = L.v, a = v / t1, b = v / (t3 - t2);
        var s1 = 0.5 * a * t1 * t1, s2 = s1 + v * (t2 - t1), s3 = s2 + 0.5 * v * (t3 - t2);
        function dist(x) { return x <= t1 ? 0.5 * a * x * x : x <= t2 ? s1 + v * (x - t1) : x <= t3 ? s2 + v * (x - t2) - 0.5 * b * (x - t2) * (x - t2) : s3; }
        var X = t4 * 1.06, Y = s3 * 1.18;
        function G(o) { return fig({ x: [0, X], y: [0, Y], grid: 0, labels: 0, firstQuadrant: true, unitX: 140 / X, unitY: 84 / Y, xName: ' ', yName: ' ', fns: o.fns, segs: o.segs, max: 200 }); }
        return mcG(r, 'Which graph is the matching <b>distance travelled</b>–time graph for the same ' + t4 + ' seconds? (Shape only.)', [
          { html: G({ fns: [Fn(dist, 0, t4)] }), right: true },
          { html: G({ segs: [Ln([[0, 0], [t1, s3 * 0.8], [t2, s3 * 0.8], [t3, 0], [t4, 0]])] }), code: 'copy', why: 'This copies the speed graph. Distance travelled can never go back down — the train doesn’t reverse.' },
          { html: G({ fns: [Fn(function (x) { return x <= t3 ? dist(x) : s3 + v * 0.6 * (x - t3); }, 0, t4)] }), code: 'nostop', why: 'This keeps rising at the end. From ' + t3 + ' to ' + t4 + ' s the train is stopped, so its distance stops changing (flat).' },
          { html: G({ segs: [Ln([[0, 0], [t1, s1 * 2.2], [t2, s2], [t3, s3], [t4, s3]])] }), code: 'straight', why: 'All straight pieces means a constant speed on each part. While the train speeds up, the distance graph curves, getting steeper; while it slows down, it curves and flattens.' }],
          'Curve getting steeper (speeding up), straight line (steady speed), curve flattening out (slowing down), then <b>flat</b> (stopped).', ['What does speeding up look like on a distance graph? What does stopped look like?'], 'train: distance sketch');
      } },
      { id: 'e12c', level: 'EMG', make: function (r, L) {
        return K.P.mc(r, 'The speed graph has two flat parts: from ' + L.t[1] + ' s to ' + L.t[2] + ' s and from ' + L.t[3] + ' s to ' + L.t[4] + ' s. What does each one mean?', [
          { html: 'The first: moving at a steady ' + L.v + ' m/s. The second: not moving at all.', right: true },
          { html: 'Both mean the train is stopped.', why: 'Flat on a <b>speed</b> graph means the speed isn’t changing. The first flat part is at ' + L.v + ' m/s — the train is moving.' },
          { html: 'Both mean the train is moving at a steady speed.', why: 'The second flat part is <b>on the axis</b>: speed ' + t('0') + '.' },
          { html: 'The first: stopped at a signal. The second: moving slowly.', why: 'Read the heights: ' + L.v + ' m/s for the first, ' + t('0') + ' for the second.' }],
          'Flat at ' + L.v + ' m/s: a <b>steady speed</b>. Flat at ' + t('0') + ': <b>stopped</b>. Same shape, different height, completely different meaning.', ['Read how high each flat part is.'], 'train: two flat parts');
      } },
      { id: 'e12d', level: 'EMG', make: function (r, L) {
        return K.P.fields('Over which seconds is the <b>distance</b>–time graph flat?', [numBox('From:', 's'), numBox('To:', 's')],
          [K.number(L.t[3], numDiag(L.t[3], [{ v: L.t[1], code: 'wrong-line', hint: 'The speed graph is flat there, but the train is moving at ' + L.v + ' m/s, so its distance is still increasing.' }])), K.number(L.t[4], numDiag(L.t[4], [{ v: L.t[2], code: 'wrong-line', hint: 'The train is still moving then. The distance is flat only while the speed is ' + t('0') + '.' }]))],
          [String(L.t[3]), String(L.t[4])], t(L.t[3]) + ' s to ' + t(L.t[4]) + ' s',
          'From ' + t(L.t[3]) + ' to ' + t(L.t[4]) + ' s only: the only stretch where the speed is ' + t('0') + '. At any other time the train is moving, so its distance is increasing.', ['When is the speed zero?'], 'train: distance flat');
      } },
      { id: 'e12e', level: 'EMG', make: function (r, L) {
        var d = L.v * (L.t[2] - L.t[1]);
        return numPart('How far does the train travel between ' + L.t[1] + ' s and ' + L.t[2] + ' s?', d, [{ v: L.v * L.t[2], code: 'dist-speed', hint: 'Use the time the steady part lasts: ' + t(L.t[2] + '-' + L.t[1]) + ' seconds.' }, { v: L.t[2] - L.t[1], code: 'dist-speed', hint: 'That is the time. Distance = speed × time.' }, { v: L.v / (L.t[2] - L.t[1]), code: 'dist-speed', hint: 'Distance = speed <b>×</b> time.' }],
          'Steady ' + t(L.v + units('m/s')) + ' for ' + t(L.t[2] + '-' + L.t[1] + '=' + (L.t[2] - L.t[1])) + ' s: ' + t(L.v + '\\times ' + (L.t[2] - L.t[1]) + '=' + d + units('m')) + '.', ['Distance = speed × time.'], 'train: distance at steady speed', { after: 'm' });
      } }] },

    { num: '13', section: 'Extra practice E — Find the mistake', stem: function (c) {
        var X = c.p[6][0] + 8, Y = Math.max(c.v1, c.v2) + 15;
        return '<i>(Error analysis)</i> The graph shows the <b>speed</b> of a car on a trip across town. A student writes: <i>“Between ' + c.p[1][0] + ' and ' + c.p[2][0] + ' minutes the graph is flat, so the car wasn’t moving during those ' + (c.p[2][0] - c.p[1][0]) + ' minutes.”</i>' +
          ctx({ X: X, Y: Y, gx: 5, gy: 10, xt: 'Time (min)', yt: 'Speed (km/h)', pts: c.p, xT: tickList(10, X - 4, 10), yT: tickList(10, Y - 5, 10), aria: 'car speed' });
      }, shared: function (r) {
        if (r.chance(0.3)) return { p: [[0, 0], [5, 45], [25, 45], [30, 0], [40, 0], [45, 30], [60, 30]], v1: 45, v2: 30 };
        for (var k = 0; k < 500; k++) {
          var a = r.pick([3, 5]), v1 = r.pick([30, 45, 60, 90]), L = r.pick([12, 15, 20, 30]), c = r.pick([3, 5]), st = r.pick([5, 10]), e = r.pick([3, 5]), v2 = r.pick([20, 30, 40, 50]), f = r.pick([10, 15]);
          if ((v1 * L / 60) % 1 || v1 === v2) continue;
          var x = [0, a, a + L, a + L + c, a + L + c + st, a + L + c + st + e, a + L + c + st + e + f]; if (x[6] > 75) continue;
          return { p: [[0, 0], [x[1], v1], [x[2], v1], [x[3], 0], [x[4], 0], [x[5], v2], [x[6], v2]], v1: v1, v2: v2 };
        }
      }, parts: [
      { id: 'e13a', level: 'EMG', make: function (r, c) {
        return K.P.mc(r, 'What rule did the student use, and what rule should they have used?', [
          { html: 'They used the distance–time rule “flat means not moving”. On a speed graph, flat means the <b>speed</b> isn’t changing — a steady speed.', right: true },
          { html: 'Their rule is right: flat always means not moving.', why: 'Read the vertical axis: it is <b>speed</b>. A flat piece at ' + c.v1 + ' km/h means the car keeps going at ' + c.v1 + ' km/h.' },
          { html: 'They should have said the car was speeding up, because the graph is high.', why: 'Height shows the speed itself. A flat piece means the speed is constant — neither speeding up nor slowing down.' },
          { html: 'They should have said the car was going backwards.', why: 'A speed graph can’t show direction. Flat means a constant speed.' }],
          'The student pictured a <b>distance</b>–time graph. On a speed–time graph, flat means no change in whatever the vertical axis measures — the speed — so the car is moving at a steady ' + c.v1 + ' km/h. Rule: <i>read the vertical axis first</i>.', ['What is on the vertical axis?'], 'error: flat on speed graph');
      } },
      { id: 'e13b', level: 'BEG', make: function (r, c) {
        return numPart('What is the car actually doing between ' + c.p[1][0] + ' and ' + c.p[2][0] + ' minutes? It is driving at a constant speed of ________ km/h.', c.v1, [{ v: 0, code: 'wrong-line', hint: 'Not stopped — read the height of the flat piece.' }, { v: c.p[2][0] - c.p[1][0], code: 'swap-axes', hint: 'That is the time. Read the speed on the vertical axis.' }],
          'The flat piece is at ' + t(c.v1) + ' on the speed axis: a constant ' + t(c.v1 + units('km/h')) + '.', ['Read the vertical axis at the flat piece.'], 'error: actual speed', { after: 'km/h' });
      } },
      { id: 'e13c', level: 'EMG', make: function (r, c) {
        return K.P.fields('There <b>is</b> a stretch of this trip where the car is not moving. When is it?', [numBox('From:', 'min'), numBox('To:', 'min')],
          [K.number(c.p[3][0], numDiag(c.p[3][0], [{ v: c.p[1][0], code: 'wrong-line', hint: 'That flat piece is at ' + c.v1 + ' km/h. The car is stopped where the speed is ' + t('0') + '.' }])), K.number(c.p[4][0], numDiag(c.p[4][0], [{ v: c.p[2][0], code: 'wrong-line', hint: 'That flat piece is at ' + c.v1 + ' km/h. Find where the graph lies <b>on</b> the time axis.' }]))],
          [String(c.p[3][0]), String(c.p[4][0])], t(c.p[3][0]) + ' to ' + t(c.p[4][0]) + ' min',
          'From ' + t(c.p[3][0]) + ' to ' + t(c.p[4][0]) + ' min the graph lies <b>on</b> the time axis: speed ' + t('0') + ', so the car is stopped. The student’s flat part is at a height of ' + t(c.v1) + ', not ' + t('0') + '.', ['Stopped means speed 0. Where is the graph on the time axis?'], 'error: when stopped');
      } },
      { id: 'e13d', level: 'PRG', make: function (r, c) {
        var L = c.p[2][0] - c.p[1][0], d = c.v1 * L / 60;
        return numPart('How far does the car travel between ' + c.p[1][0] + ' and ' + c.p[2][0] + ' minutes?', d, [{ v: c.v1 * L, code: 'rate-unit', hint: 'The speed is per <b>hour</b>: change ' + t(L) + ' minutes to hours first (' + t('\\frac{' + L + '}{60}') + ').' }, { v: c.v1 / L, code: 'dist-speed', hint: 'Distance = speed <b>×</b> time.' }, { v: 0, code: 'wrong-line', hint: 'The car is moving at ' + c.v1 + ' km/h during this time.' }],
          t(L + units('min') + '=\\frac{' + L + '}{60}' + units('h') + '=' + fr(L / 60) + units('h')) + '. Distance ' + t('=' + c.v1 + '\\times ' + fr(L / 60) + '=' + dn(d) + units('km')) + '.', ['Distance = speed × time, with the time in hours.'], 'error: distance at steady speed', { after: 'km' });
      } },
      { id: 'e13e', level: 'BEG', make: function (r, c) {
        var rows = [{ id: 'a', html: c.p[2][0] + '–' + c.p[3][0] + ' min' }, { id: 'b', html: c.p[4][0] + '–' + c.p[5][0] + ' min' }], cols = [{ id: 'up', html: 'Speeding<br>up' }, { id: 'steady', html: 'Steady' }, { id: 'down', html: 'Slowing<br>down' }, { id: 'stop', html: 'Stopped' }];
        var p = K.P.grid('Describe what the car is doing on each interval.', rows, cols, { a: 'down', b: 'up' }, { why: function (row) { return { code: 'row', hint: row === 'a' ? 'The speed falls from ' + c.v1 + ' km/h to 0: braking.' : 'The speed rises from 0 to ' + c.v2 + ' km/h.' }; } },
          rows[0].html + ': braking steadily from ' + c.v1 + ' km/h to a stop.<br>' + rows[1].html + ': speeding up steadily from rest to ' + c.v2 + ' km/h.', ['Is the speed going up or down on each interval?'], 'error: braking and speeding up');
        p.answer = rows[0].html + ': slowing down; ' + rows[1].html + ': speeding up'; return p;
      } }] },
    { num: '14', stem: function (j) {
        var X = j.t[4] + 8, Y = j.d[2] + 3;
        return '<i>(Error analysis)</i> Asked to graph her distance from home during an afternoon out, a student draws the graph below. It has a vertical jump at ' + j.t[1 + 1] + ' minutes.' +
          ctx({ X: X, Y: Y, gx: 5, gy: 1, xt: 'Time (min)', yt: 'Distance from home (km)', pts: [[0, 0], [j.t[1], j.d[1]], [j.t[2], j.d[1]], [j.t[2], j.d[2]], [j.t[3], j.d[2]], [j.t[4], 0]], xT: tickList(10, X - 4, 10), yT: tickList(1, Y - 1, 1), aria: 'graph with a vertical jump' });
      }, shared: function (r) {
        if (r.chance(0.3)) return { t: [0, 10, 20, 35, 50], d: [0, 1, 5], b: 5, r: [6, 0, 48, 0, -20] };
        for (var k = 0; k < 3000; k++) {
          var t1 = r.pick([10, 15]), d1 = r.pick([1, 2]), t2 = t1 + r.pick([5, 10]), d2 = d1 + r.pick([3, 4, 5, 6]), t3 = t2 + r.pick([15, 20]), t4 = t3 + r.pick([10, 15, 20, 30]), b = r.pick([5, 10]);
          var r1 = 60 * d1 / t1, r3 = 60 * (d2 - d1) / b, r5 = -60 * d2 / (t4 - t3);
          if (r1 % 1 || r3 % 1 || r5 % 1 || t4 > 75) continue;
          return { t: [0, t1, t2, t3, t4], d: [0, d1, d2], b: b, r: [r1, 0, r3, 0, r5] };
        }
      }, parts: [
      { id: 'e14a', level: 'BEG', outcome: 'RF2', make: function (r, j) {
        return K.P.mc(r, 'Which test does this graph fail, and where?', [
          { html: 'The vertical line test: the line ' + t('t=' + j.t[2]) + ' meets the graph at every height from ' + j.d[1] + ' km to ' + j.d[2] + ' km.', right: true },
          { html: 'The horizontal line test: the line at ' + j.d[1] + ' km meets the graph in many points.', why: 'For a function of time we check <b>vertical</b> lines: one time, one distance.' },
          { html: 'It passes every test; the graph is fine.', why: 'Draw a vertical line at ' + t('t=' + j.t[2]) + '. How many points does it meet?' },
          { html: 'The vertical line test, at the flat parts.', why: 'A vertical line through a flat part meets it only once. Look at the jump.' }],
          'The <b>vertical line test</b>. The line ' + t('t=' + j.t[2]) + ' meets the graph at every height from ' + j.d[1] + ' to ' + j.d[2] + ' km, so one time has many distances.', ['Which graphs can show a quantity as a function of time?'], 'vertical jump: test');
      } },
      { id: 'e14b', level: 'EMG', make: function (r, j) {
        return K.P.mc(r, 'Put the failure into words about the outing: what would the student have had to do at ' + j.t[2] + ' minutes?', [
          { html: 'Be at every distance from ' + j.d[1] + ' km to ' + j.d[2] + ' km from home at the same instant — jumping ' + (j.d[2] - j.d[1]) + ' km in no time at all.', right: true },
          { html: 'Stop and rest for a while.', why: 'Resting would be a flat (horizontal) segment, not a vertical one.' },
          { html: 'Travel very fast, but possibly.', why: 'A vertical segment takes <b>zero</b> time. No matter how fast, travelling ' + (j.d[2] - j.d[1]) + ' km takes some time.' },
          { html: 'Turn around and go home.', why: 'Going home would make the distance decrease over time — a falling segment.' }],
          'She would have to be at every distance from ' + j.d[1] + ' to ' + j.d[2] + ' km at one instant — jumping ' + (j.d[2] - j.d[1]) + ' km in no time, which is impossible.', ['How much time passes along a vertical segment?'], 'vertical jump: meaning');
      } },
      { id: 'e14c', level: 'EMG', make: function (r, j) {
        var dd = j.d[2] - j.d[1];
        return K.P.mc(r, 'What rate of change would that vertical segment have?', [
          { html: 'Undefined: ' + t('\\frac{' + dd + '}{0}') + ' — division by zero has no answer.', right: true },
          { html: t('0') + ' km/min, because no time passes.', why: 'A rate of ' + t('0') + ' is a flat segment. Here the change is ' + t(dd + units('km')) + ' over ' + t('0') + ' minutes: ' + t('\\frac{' + dd + '}{0}') + '.' },
          { html: t(dd) + ' km/min, the rise.', why: 'Rate = rise ÷ run. The run is ' + t('0') + '.' },
          { html: t('\\frac{0}{' + dd + '}=0') + ' km/min.', why: 'Rate = change in distance ÷ change in time, not the other way round.' }],
          'Rise ' + t(j.d[2] + '-' + j.d[1] + '=' + dd) + ' km, run ' + t(j.t[2] + '-' + j.t[2] + '=0') + ' min. ' + t('\\text{rate}=\\frac{' + dd + '}{0}') + ' is <b>undefined</b>: no finite rate of change exists.', ['Rise over run: what is the run?'], 'vertical jump: rate');
      } },
      { id: 'e14d', level: 'PRG', make: function (r, j) {
        var tt = [0, j.t[1], j.t[2], j.t[2] + j.b, j.t[3], j.t[4]], dd = [0, j.d[1], j.d[1], j.d[2], j.d[2], 0];
        var f = [1, 2, 3, 4, 5].map(function (n) { return numBox('Segment ' + n + ':', 'km/h'); });
        var ch = j.r.map(function (rt, i) { return K.number(rt, numDiag(rt, rateCands(dd[i + 1] - dd[i], tt[i + 1] - tt[i], true, rt))); });
        var p = K.P.fields('The student meant that she covered the extra ' + t((j.d[2] - j.d[1]) + units('km')) + ' by bus, and that the bus ride took ' + t(j.b + units('min')) + '. In the corrected graph the jump becomes a sloped segment from ' + t('(' + j.t[2] + ', ' + j.d[1] + ')') + ' to ' + t('(' + (j.t[2] + j.b) + ', ' + j.d[2] + ')') + '; everything else stays. State the rate of change of each of the five segments, in km/h.', f, ch, j.r.map(String), j.r.map(function (x) { return t(x); }).join(', ') + ' km/h',
          [0, 1, 2, 3, 4].map(function (i) { return t('(' + tt[i] + ',' + dd[i] + ')') + ' to ' + t('(' + tt[i + 1] + ',' + dd[i + 1] + ')') + ': ' + t('\\frac{' + (dd[i + 1] - dd[i]) + '}{' + (tt[i + 1] - tt[i]) + '}\\text{ km/min}\\times 60=' + j.r[i] + units('km/h')); }).join('<br>'), ['Rate = change in distance ÷ change in time; multiply km/min by 60 for km/h.', 'The last segment comes back home, so its rate is negative.'], 'vertical jump: corrected rates');
        p.bad = [j.r.map(function (x) { return String(Math.abs(x)); })].filter(function (b) { return j.r.some(function (x) { return x < 0; }); }); return p;
      } }] },

    { num: '15', section: 'Extra practice F — The shape of the container', stem: function (c) {
        return 'Water runs from the same tap, at the same constant rate, into each of four containers. All four are the same height and each is filled right to the top. The graphs show the <b>height of the water</b> (vertical) against time (horizontal), in a different order.' +
          bank(c.letters.map(function (l) { return { label: l, cap: CNAME[c.box[l]], svg: container(c.box[l]) }; }), 2) + bank(c.nums.map(function (n) { return { label: n, svg: sk(FILL[c.gr[n]]) }; }), 2);
      }, shared: function (r) {
        var types = ['wide', 'narrow', 'down', 'up'], tl = r.shuffle(types), tn = r.shuffle(types), letters = ['W', 'X', 'Y', 'Z'], nums = ['I', 'II', 'III', 'IV'], box = {}, gr = {}, of = {};
        letters.forEach(function (l, i) { box[l] = tl[i]; }); nums.forEach(function (n, i) { gr[n] = tn[i]; of[tn[i]] = n; });
        return { letters: letters, nums: nums, box: box, gr: gr, of: of };
      }, parts: [
      { id: 'e15a', level: 'PRG', make: function (r, c) {
        var rows = c.letters.map(function (l) { return { id: l, html: l }; }), cols = c.nums.map(function (n) { return { id: n, html: n }; }), want = {};
        c.letters.forEach(function (l) { want[l] = c.of[c.box[l]]; });
        var p = K.P.grid('Match each container with its graph.', rows, cols, want, { why: function (row) { return { code: 'row', hint: CWHY[c.box[row]] }; } },
          c.letters.map(function (l) { return l + ' → ' + want[l] + ': ' + CWHY[c.box[l]]; }).join('<br>'), ['The wider the container at the water line, the more slowly the height rises.'], 'containers: match');
        p.answer = c.letters.map(function (l) { return l + ' – ' + want[l]; }).join(', '); return p;
      } },
      { id: 'e15b', level: 'EMG', make: function (r, c) {
        return K.P.mc(r, 'Two of the graphs are straight lines. What do those two containers have in common, and why does that make the line straight?', [
          { html: 'Both have vertical sides, so the width at the water line never changes: every second’s water adds the same height — a constant rate of change.', right: true },
          { html: 'Both are the same width, so they fill at the same rate.', why: 'They are different widths — that’s why one line is steeper. What stays the same <b>within</b> each container as it fills?' },
          { html: 'Both are filled from the same tap.', why: 'All four use the same tap, but two graphs curve. The shape of the container is what matters.' },
          { html: 'Both get narrower toward the top.', why: 'A container that narrows makes the height rise faster and faster — a curve, not a straight line.' }],
          'The two cylinders have <b>vertical sides</b>: the width at the water line is the same all the way up, so the height rises by the same amount each second — a straight line.', ['What happens to the width at the water line as each container fills?'], 'containers: straight lines');
      } },
      { id: 'e15c', level: 'BEG', make: function (r, c) {
        return K.P.mc(r, 'Complete the rule: “the wider the container at the water line, the ________ the height rises.”', [
          { html: 'more slowly', right: true }, { html: 'faster', why: 'In a wide container the same water spreads over a bigger surface, making a thinner layer.' },
          { html: 'more steadily', why: 'Steadiness depends on whether the width changes, not on how wide it is.' }, { html: 'higher', why: 'All four end at the same height. Think about how fast the height rises.' }],
          'The same volume arrives each second. In a wider container it spreads over a bigger surface and makes a thinner layer: less height gained each second — <b>more slowly</b>.', ['Picture pouring a cup of water into a wide pan and into a narrow glass.'], 'containers: wider = slower');
      } },
      { id: 'e15d', level: 'PRG', make: function (r, c) {
        return K.P.mc(r, 'The two cones are the same cone, one turned upside down, so they hold the same amount. What does that tell you about their two graphs?', [
          { html: 'Same volume at the same rate means the same total time: both graphs end at the same point. They differ only in how the height builds up in between.', right: true },
          { html: 'The two graphs must be identical.', why: 'They hold the same amount, but the narrow part is at the bottom in one and at the top in the other, so the height rises differently along the way.' },
          { html: 'The point-down cone fills faster, so its graph ends first.', why: 'It starts faster, but it holds the same volume from the same tap, so it takes the same total time.' },
          { html: 'Nothing — the graphs can’t be compared.', why: 'Think about how long each takes to fill: same volume, same tap.' }],
          'Same volume ÷ same rate = <b>same total time</b>, so both graphs end at the same time and height. No contradiction: they agree at the start and the end and differ only in how the height builds up.', ['How long does each cone take to fill?'], 'containers: same cone');
      } },
      { id: 'e15e', level: 'PRG', make: function (r, c) {
        return K.P.mc(r, 'One straight-line graph is steeper than the other and also stops sooner. Why do those two facts go together?', [
          { html: 'Both come from the narrower cross-section: each second’s water adds more height (steeper), and the narrower container holds less, so it is full sooner.', right: true },
          { html: 'A steeper line always stops sooner on any graph.', why: 'Not on every graph. Here it happens because both facts come from the container being narrow.' },
          { html: 'The narrow container gets more water each second.', why: 'All four get the same water each second from the same tap.' },
          { html: 'The narrow container is shorter.', why: 'All four are the same height.' }],
          'Both come from the <b>narrower cross-section</b>: narrow means each second’s water adds more height (steeper), and it also means the container holds less water, so it is full sooner.', ['What is different about the narrow cylinder?'], 'containers: steeper and sooner');
      } }] },
    { num: '16', stem: function (f) {
        return 'A flask is a ' + (f.wideBottom ? 'wide cylinder for its bottom half and a narrower cylinder for its top half' : 'narrow cylinder for its bottom half and a wider cylinder for its top half') + ', joined by a flat shoulder. Water runs in at a constant rate.' + flaskSvg(f.wideBottom);
      }, shared: function (r) { return { wideBottom: r.chance(0.6) }; }, parts: [
      { id: 'e16a', level: 'PRG', make: function (r, f) {
        var gentle = [[0.3, 0], [6.4, 2.6], [9.2, 5.2]], steep = [[0.3, 0], [3.1, 2.6], [9.2, 5.2]];
        return mcG(r, 'Which graph shows the height of the water against time, from empty to full?', [
          { html: sk({ segs: [Ln(f.wideBottom ? gentle : steep)] }), right: true },
          { html: sk({ segs: [Ln(f.wideBottom ? steep : gentle)] }), code: 'swap', why: 'The pieces are the wrong way round. The ' + (f.wideBottom ? 'wide bottom fills slowly (gentle), the narrow top fast (steep)' : 'narrow bottom fills fast (steep), the wide top slowly (gentle)') + '.' },
          { html: sk({ fns: [Fn(f.wideBottom ? function (x) { return 5.2 * Math.pow((x - 0.3) / 8.9, 2); } : function (x) { return 5.2 * Math.sqrt((x - 0.3) / 8.9); }, 0.3, 9.2)] }), code: 'curve', why: 'A smooth curve means the width changes gradually. Each half is a cylinder (constant width), so each piece is straight, with a sudden change at the shoulder.' },
          { html: sk({ segs: [Ln([[0.3, 0], [9.2, 5.2]])] }), code: 'one', why: 'One straight line means the same width all the way up. The two halves have different widths.' }],
          'Two straight pieces: a ' + (f.wideBottom ? '<b>gentle</b> one for the wide bottom, then a <b>steeper</b> one for the narrow top' : '<b>steep</b> one for the narrow bottom, then a <b>gentler</b> one for the wide top') + ', meeting in a corner at half the height.', ['Each half has a constant width. Which half rises faster?'], 'flask sketch');
      } },
      { id: 'e16b', level: 'EMG', make: function (r, f) {
        return K.P.mc(r, 'The graph has a sharp corner, not a smooth bend. Where is it, and why is the change sudden?', [
          { html: 'At half the height (the shoulder): the width changes suddenly there, so the rate of change jumps from one constant value to another.', right: true },
          { html: 'At the top, because the flask is full.', why: 'Being full ends the graph. Look for where the steepness changes.' },
          { html: 'At half the height, because the water slows down there.', why: 'The tap’s rate never changes. It is the <b>width</b> that changes suddenly at the shoulder.' },
          { html: 'At the start, because the flask is empty.', why: 'The graph starts there, but the steepness changes at the shoulder.' }],
          'The corner is at <b>half the height, the shoulder</b>. The width changes suddenly there (a flat shoulder, not a slope), so the rate at which the height rises jumps from one constant value to another.', ['Where does the width of the flask change?'], 'flask corner');
      } },
      { id: 'e16c', level: 'BEG', make: function (r, f) {
        var top = f.wideBottom;
        return K.P.mc(r, 'Which part of the graph is steeper, and what feature of the flask makes it so?', [
          { html: 'The ' + (top ? 'upper' : 'lower') + ' part, because that half of the flask is narrower.', right: true },
          { html: 'The ' + (top ? 'lower' : 'upper') + ' part, because that half of the flask is wider.', why: 'Wider means the water spreads out more, so the height rises <b>more slowly</b>.' },
          { html: 'The ' + (top ? 'lower' : 'upper') + ' part, because the water is ' + (top ? 'deeper at the bottom' : 'higher up') + '.', why: 'How fast the height rises depends on the width at the water line.' },
          { html: 'Neither — the tap runs at a constant rate, so both are equally steep.', why: 'The same volume per second gives different heights in halves of different widths.' }],
          'The <b>' + (top ? 'upper' : 'lower') + '</b> part is steeper, because that cylinder is <b>narrower</b>: each second’s water adds more height.', ['Narrow = faster rise.'], 'flask steeper part');
      } },
      { id: 'e16d', level: 'EMG', make: function (r, f) {
        var half = f.wideBottom ? 'bottom' : 'top';
        return K.P.mc(r, 'The two halves are the same height, but they don’t take the same time to fill. Which half takes longer, and why?', [
          { html: 'The ' + half + ' half — it is wider, so it holds more water, and the tap delivers water at a fixed rate.', right: true },
          { html: 'The ' + (half === 'bottom' ? 'top' : 'bottom') + ' half — it is narrower, so the water has to squeeze in.', why: 'The tap delivers the same volume each second regardless. The narrow half holds less, so it fills sooner.' },
          { html: 'They take the same time, because they are the same height.', why: 'Same height, but different widths, so they hold different amounts of water.' },
          { html: 'The bottom half, because water fills from the bottom.', why: 'Every container fills from the bottom; what matters is how much each half holds.' }],
          'The <b>' + half + ' half</b> takes longer. It is wider, so it holds more water, and the tap only delivers water at a fixed rate.', ['Which half holds more water?'], 'flask: which half longer');
      } }] },

    { num: '17', section: 'Extra practice G — Two for the test', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: 'e17', level: 'EMG', make: function (r) {
        var obj = r.pick(['A ball is thrown straight up and caught again at the height it was released from.', 'A juggler tosses a beanbag straight up and catches it at the same height.']);
        return mcG(r, obj + ' Which graph best shows its <b>height</b> against time?', [
          { html: sk(S.hill(4.95, 1.2, 5, 1.2)), right: true },
          { html: sk({ segs: [Ln([[0.3, 1.2], [4.95, 5], [9.6, 1.2]])] }), code: 'straight', why: 'Straight pieces mean a constant speed up and down with an instant turnaround at the top. Gravity slows it on the way up, so the top is rounded.' },
          { html: sk({ segs: [Ln([[0.3, 1.2], [4.95, 5], [4.95, 1.2], [9.6, 1.2]])] }), code: 'drop', why: 'A vertical drop fails the vertical line test — it can’t be at many heights at one instant.' },
          { html: sk(S.upFast()), code: 'never', why: 'This one never comes back down.' }],
          'Gravity slows it on the way up and speeds it up on the way down, so the graph <b>flattens near the top</b> and is steepest near the release height: a smooth, rounded, symmetric arch.', ['How does the speed change near the top?'], 'thrown ball graph');
      } }] },
    { num: '18', stem: '<i>(Numerical Response)</i>', parts: [
      { id: 'e18', level: 'PRG', make: function (r) {
        var bk = r.chance(0.3), t1, dt, rt, d1, dd;
        for (var k = 0; k < 500; k++) { t1 = bk ? 10 : r.pick([5, 10, 15, 20]); dt = bk ? 40 : r.pick([20, 30, 40, 45, 50]); rt = bk ? 21 : r.int(9, 60); d1 = bk ? 4 : r.int(1, 8); dd = rt * dt / 60; if (dd % 1 === 0 && dd >= 3) break; }
        var p = K.P.nr('On a distance–time graph, time is measured in minutes and distance in kilometres. A straight segment of the graph joins ' + t('(' + t1 + ', ' + d1 + ')') + ' to ' + t('(' + (t1 + dt) + ', ' + (d1 + dd) + ')') + '. The rate of change of that segment, in km/h, is ________.', rt,
          numDiag(rt, [{ v: dd / dt, code: 'per-min', hint: 'That is km per <b>minute</b>. Multiply by ' + t('60') + ' for km/h.' }, { v: (d1 + dd) / (t1 + dt) * 60, code: 'wrong-line', hint: 'Use the <b>changes</b>: ' + t((d1 + dd) + '-' + d1) + ' km over ' + t((t1 + dt) + '-' + t1) + ' min.' }, { v: dt / dd, code: 'rate-flip', hint: 'Rate = change in distance ÷ change in time.' }, { v: dd, code: 'rate-unit', hint: 'That is the change in distance. Divide by the time in hours.' }]),
          'Rise: ' + t((d1 + dd) + '-' + d1 + '=' + dd + units('km')) + '. Run: ' + t(dt + units('min') + '=' + fr(dt / 60) + units('h')) + '. ' + t('\\text{rate}=' + dd + '\\div ' + fr(dt / 60) + '=' + rt + units('km/h')) + '.', ['Find the change in distance and the change in time; change minutes to hours.'], 'rate from two points ' + rt);
        p.good = [('00' + rt).slice(-3)]; return p;
      } }] }
  ];

  /* distance-time vs speed-time feature tables (EP11) */
  var FEAT = [{ id: 'flat', html: 'Flat, above axis' }, { id: 'axis', html: 'On the time axis' }, { id: 'up', html: 'Straight, up' }, { id: 'down', html: 'Straight, down' }, { id: 'curve', html: 'Steeper & steeper' }];
  var MEAN = {
    dist: { flat: 'stopped: the distance is not changing', axis: 'at the starting point (distance 0)', up: 'moving away at a constant speed', down: 'moving back toward the start at a constant speed', curve: 'moving away and speeding up' },
    speed: { flat: 'moving at a steady speed (not stopped)', axis: 'stopped: speed 0', up: 'speeding up at a constant rate', down: 'slowing down at a constant rate', curve: 'speeding up faster and faster' } };
  function featPart(r, kind) {
    var ids = FEAT.map(function (f) { return f.id; }), order = r.shuffle(ids), lab = {}, want = {};
    order.forEach(function (id, i) { lab[id] = LET[i]; });
    FEAT.forEach(function (f) { want[f.id] = lab[f.id]; });
    var nm = kind === 'dist' ? 'distance–time' : 'speed–time', other = kind === 'dist' ? 'speed' : 'dist';
    var rows = FEAT.map(function (f, i) { return { id: f.id, html: String(i + 1) }; });
    var p = K.P.grid('On a <b>' + nm + '</b> graph, what does each feature mean? Match each feature (1–5) with a meaning (A–E).<br><b>Features:</b><br>' + FEAT.map(function (f, i) { return '<b>' + (i + 1) + '</b>: ' + f.html.replace('&', 'and'); }).join('<br>') + '<br><b>Meanings:</b><br>' + order.map(function (id) { return '<b>' + lab[id] + '</b>: ' + MEAN[kind][id]; }).sort().join('<br>'), rows, order.map(function (id) { return { id: lab[id], html: lab[id] }; }).sort(function (a, b) { return a.id < b.id ? -1 : 1; }), want,
      { why: function (row, got) {
        var gid = order[LET.indexOf(got)];
        if (gid && MEAN[other][row] === MEAN[kind][gid] || (gid && MEAN[other][row].split(':')[0] === MEAN[kind][gid].split(':')[0])) return { code: 'swap-axes', hint: '“' + FEAT.filter(function (f) { return f.id === row; })[0].html + '” means that on a <b>' + (kind === 'dist' ? 'speed' : 'distance') + '</b> graph. Here the vertical axis is ' + (kind === 'dist' ? 'distance' : 'speed') + '.' };
        return { code: 'row', hint: 'Feature “' + FEAT.filter(function (f) { return f.id === row; })[0].html + '”: ask what is happening to the ' + (kind === 'dist' ? 'distance' : 'speed') + ' — is it changing, and how?' };
      } }, FEAT.map(function (f) { return f.html + ': ' + MEAN[kind][f.id] + '.'; }).join('<br>'), ['Read the vertical axis first. Flat means “no change in whatever the vertical axis measures”.'], 'feature meanings: ' + nm);
    p.answer = FEAT.map(function (f, i) { return (i + 1) + ' (' + f.html + '): ' + want[f.id] + ' — ' + MEAN[kind][f.id]; }).join('<br>');
    return p;
  }
  /* EP15–16 containers */
  var CNAME = { wide: 'wide cylinder', narrow: 'narrow cylinder', down: 'cone, point down', up: 'cone, point up' };
  var CWHY = { wide: 'constant width, so a straight line; wide, so it rises slowly (the shallow line).', narrow: 'constant width, so a straight line; narrow, so it rises fast and fills first (the steep line).', down: 'narrow at the bottom and widening, so the height shoots up and then slows (steep, then flattening).', up: 'wide at the bottom and narrowing, so the height creeps up and then races (shallow, then steepening).' };
  var FILL = {
    wide: { segs: [Ln([[0, 0], [9.4, 5]])] }, narrow: { segs: [Ln([[0, 0], [3.8, 5]])] },
    down: { fns: [Fn(function (x) { return 5 * Math.pow(x / 6.6, 1 / 3); }, 0, 6.6)] }, up: { fns: [Fn(function (x) { return 5 * (1 - Math.pow(Math.max(0, 1 - x / 6.6), 1 / 3)); }, 0, 6.6)] } };
  function container(kind) {
    var p = { wide: 'M14 8 L14 70 L66 70 L66 8', narrow: 'M28 8 L28 70 L52 70 L52 8', down: 'M8 8 L33 70 L47 70 L72 8', up: 'M33 8 L8 70 L72 70 L47 8' }[kind];
    return '<svg class="fig-svg" viewBox="0 0 80 76" style="max-width:70px" role="img" aria-label="' + CNAME[kind] + '"><rect width="80" height="76" fill="#fff"/><path d="' + p + '" fill="#e6f2f1" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  }
  function flaskSvg(wideBottom) {
    var p = wideBottom ? 'M44 6 L44 52 L20 52 L20 100 L80 100 L80 52 L56 52 L56 6' : 'M20 6 L20 54 L44 54 L44 100 L56 100 L56 54 L80 54 L80 6';
    return '<svg class="fig-svg" viewBox="0 0 100 108" style="max-width:90px" role="img" aria-label="the flask"><rect width="100" height="108" fill="#fff"/><path d="' + p + '" fill="#e6f2f1" stroke="' + INK + '" stroke-width="2.4" stroke-linejoin="round"/></svg>';
  }

  HW.defineLesson({
    id: 'u5l9', unit: 5, num: '9', title: 'Interpreting and Sketching Real-World Graphs', outcome: 'RF1',
    blurb: 'Reading the story in a graph — increasing, decreasing, constant and rate of change — then matching descriptions to graphs and sketching a shape from words.',
    questions: QUESTIONS, extra: EXTRA
  });
})(window);
