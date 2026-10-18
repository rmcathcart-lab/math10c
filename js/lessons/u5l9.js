/* Math 10C · Unit 5 · Lesson 9 — Interpreting and Sketching Real-World Graphs (RF1)
 * Assignment questions 1–16 (u5_L09.tex) and the Lesson 9 Extra Practice (u5_EP09.tex).
 * Every part is a generator: the stories, segment lengths, rates and the order of the increasing / constant /
 * decreasing pieces change, but each version keeps the idea and difficulty of the booklet question (the booklet's
 * own numbers are one of the possible versions where practical). "Describe" questions become grids or number
 * boxes. "Sketch / draw / graph" questions are drawing parts (js/draw.js graph pad): story sketches are checked by
 * shape (stages in order, steeper / flatter, straight vs curved, start and end values; see story() below), scaled
 * graphs (commute, corrected jump) exactly, the loan staircase and the plotted data by rules. Questions the booklet
 * poses as choosing or matching (9, 10–13, 15, EP10b, EP17) stay multiple choice.
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
    'rate-unit': 'Rate in the wrong units', 'dist-speed': 'Distance from a speed graph wrong', 'round-early': 'Rounded too early / to the wrong hundredth'
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
  function geo(g, svg) { // read HW.graph's own mapping off its two axis lines (robust to padding changes)
    var re = /<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"[^>]*marker-end="url\(#gArr\)"/g, ax = re.exec(svg), ay = re.exec(svg);
    var xr = g.x, yr = g.y, x0 = +ax[1], x1 = +ax[3] - 8, y0 = +ay[2], y1 = +ay[4] + 8;
    return { X: function (x) { return x0 + (x - xr[0]) * (x1 - x0) / (xr[1] - xr[0]); }, Y: function (y) { return y0 + (y - yr[0]) * (y1 - y0) / (yr[1] - yr[0]); },
      ax0: Math.max(xr[0], Math.min(xr[1], 0)), ay0: Math.max(yr[0], Math.min(yr[1], 0)) };
  }
  function fig(g) {
    var svg = HW.graph(g), G = geo(g, svg), s = '', fs = g.tickSize || 11;
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
  /* ---------- drawing answers (js/draw.js) ---------- */
  var DR = HW.draw;
  HW.addCodes({ 'story-bend': 'Stage drawn with the wrong bend (straight vs curved, steeper vs flatter)', 'story-zero': 'Graph reaches zero when it shouldn’t (or not when it should)', 'story-peaks': 'Peak heights wrong', 'story-cycles': 'Cycles not identical',
    'story-when': 'A stage at the wrong time', 'story-lines': 'Points instead of a line', 'story-rush': 'Rise / fall too slow for the story', 'stair-lin': 'Straight line instead of a staircase', 'stair-up': 'Staircase going the wrong way', 'stair': 'Staircase steps wrong',
    'plot-value': 'Point plotted at the wrong value', 'plot-shift': 'Points shifted by one reading', 'plot-count': 'Missing or extra point' });
  /* a shape-only story pad: no numbers, line tool only, no end marks */
  function spad(o) {
    return Object.assign({ x: [0, 12], y: [0, 8], grid: 1, labels: 0, firstQuadrant: true, xName: ' ', yName: ' ', unitX: 25, unitY: 25, defaultEnd: 'none', tools: ['line'], max: 360,
      help: 'Tap where the graph starts, then each corner in turn, left to right; tap the last point again to finish. For a curve, use several short pieces.' }, o || {});
  }
  function poly(pts) { return { pts: [], pieces: [{ v: pts, s: 'none', e: 'none' }], join: 'none' }; }
  /* the drawing's left-to-right pieces, with each run going the same way (up / flat / down) merged into one stage */
  function groupsOf(value) {
    var g = [];
    DR.phases(value).phases.forEach(function (p) { var L = g[g.length - 1]; if (L && L.dir === p.dir) { L.segs.push(p); L.x1 = p.x1; L.y1 = p.y1; } else g.push({ dir: p.dir, segs: [p], x0: p.x0, x1: p.x1, y0: p.y0, y1: p.y1 }); });
    return g;
  }
  function simple(G) { var v = [[G[0].x0, G[0].y0]]; G.forEach(function (g) { v.push([g.x1, g.y1]); }); return poly(v); }
  function bendOk(g, kind) {
    var m = g.segs.map(function (s) { return Math.abs(s.m); }), i, k;
    if (kind === 'straight') return m.length === 1;
    if (kind === 'steeper' || kind === 'gentler') { if (m.length < 2) return false; for (i = 1; i < m.length; i++) if (kind === 'steeper' ? !(m[i] > m[i - 1] + 1e-9) : !(m[i] < m[i - 1] - 1e-9)) return false; return true; }
    if (kind === 'scurve') { // steeper and steeper, (straight), then flatter and flatter
      k = m.indexOf(Math.max.apply(null, m)); if (k === 0 || k === m.length - 1) return false;
      for (i = 1; i <= k; i++) if (!(m[i] > m[i - 1] + 1e-9)) return false;
      for (i = k + 1; i < m.length; i++) if (!(m[i] < m[i - 1] - 1e-9)) return false; return true;
    }
    return true;
  }
  var BENDH = { straight: 'This stage happens at a steady rate, so draw it as <b>one straight piece</b>.', steeper: 'This stage should <b>curve, getting steeper and steeper</b>: draw it as a few short pieces, each steeper than the one before.',
    gentler: 'This stage should <b>curve, getting flatter and flatter</b>: steep at first, then a few short pieces, each less steep than the one before.', scurve: 'This stage should get steeper and steeper, then flatter and flatter.' };
  /* Story graph checked by shape: K.graphStory on the drawing with each run of same-direction pieces merged into one
   * stage (so a curve drawn as several short pieces counts as one stage); then each stage's bend (phase.bend:
   * 'straight' | 'steeper' | 'gentler' | 'scurve', with phase.bendHint). spec.prep(G) may drop optional stages
   * (a levelling-off flat end, …) and returns the new list (or { code, hint }); spec.after(G, value) -> { code, hint } | null. */
  function story(spec) {
    var base = K.graphStory(spec);
    return function (resp) {
      if (DR.empty(resp)) return base(resp);
      var ph = DR.phases(resp);
      if (ph.vertical || ph.gaps.length || DR.notFunction(resp)) return base(resp);
      if (!ph.phases.length) return wrong('story-lines', 'Draw the graph as a line: tap where it starts, then each corner in turn, and tap the last point again to finish.');
      var G = groupsOf(resp);
      if (spec.prep) { var pr = spec.prep(G); if (pr && pr.hint) return wrong(pr.code || 'story', pr.hint); if (pr) G = pr; }
      var r = base(simple(G)); if (r.v !== 'correct') return r;
      for (var i = 0; i < spec.phases.length; i++) { var b = spec.phases[i].bend; if (b && !bendOk(G[i], b)) return wrong('story-bend', spec.phases[i].bendHint || BENDH[b]); }
      if (spec.after) { var h = spec.after(G, DR.norm(resp)); if (h) return wrong(h.code || 'story', h.hint); }
      return ok();
    };
  }
  /* optional stages: a flat run at the end (levelling off / stopped) and/or at the start */
  function trimFlat(lead, trail, test) {
    return function (G) {
      G = G.slice(); test = test || function () { return true; };
      if (trail && G.length > 1 && G[G.length - 1].dir === 'flat' && test(G[G.length - 1])) G.pop();
      if (lead && G.length > 1 && G[0].dir === 'flat' && test(G[0])) G.shift();
      return G;
    };
  }
  function storyPart(prompt, inp, check, key, sol, hints, text, bad) {
    var p = K.P.graph(prompt, inp, check, key, sol, hints, text);
    p.answer = 'One possible sketch:' + p.answer; p.bad = bad || []; return p;
  }
  /* decreasing and flattening, levelling off above 0 (resale value, a cooling drink) */
  function decayStory(text, bendHint, zeroHint) {
    return story({ phases: [{ dir: 'down', text: text, bend: 'gentler', bendHint: bendHint }], prep: trimFlat(false, true),
      after: function (G) { return G[G.length - 1].y1 <= 1e-9 ? { code: 'story-zero', hint: zeroHint } : null; } });
  }
  /* k identical up-and-down cycles starting from the lowest point */
  function cycleStory(k, word, above) {
    var ph = [];
    for (var i = 0; i < k; i++) ph.push({ dir: 'up', text: 'going up, cycle ' + (i + 1) }, { dir: 'down', text: 'coming back down' });
    return story({ phases: ph,
      prep: function (G) {
        var alt = G.every(function (g, j) { return g.dir === (j % 2 ? 'down' : 'up'); });
        if (alt && G.length % 2 === 0 && G.length / 2 !== k) return { code: 'story-count', hint: 'Count the cycles: your graph rises and falls ' + (G.length / 2) + ' time' + (G.length === 2 ? '' : 's') + '. The ride makes ' + t(k) + ' ' + word + '.' };
        return G;
      },
      after: function (G) {
        var hi = [], lo = [G[0].y0];
        for (var j = 0; j < G.length; j += 2) { hi.push(G[j].y1); lo.push(G[j + 1].y1); }
        if (hi.some(function (y) { return !near(y, hi[0]); }) || lo.some(function (y) { return !near(y, lo[0]); })) return { code: 'story-cycles', hint: 'Every cycle is the same: the ride repeats the same motion, so all the peaks are at the same height, and all the low points too.' };
        if (above && lo[0] <= 1e-9) return { code: 'story-zero', hint: 'Your seat never touches the ground: the lowest point of each cycle is still <b>above</b> the axis.' };
        return null;
      } });
  }
  function cycleKey(k, low, high, damped) {
    var st = Math.floor(12 / (2 * k)), v = [[0, low]];
    for (var i = 0; i < k; i++) v.push([(2 * i + 1) * st, damped ? high - i : high], [(2 * i + 2) * st, low]);
    return poly(v);
  }
  /* y-values a drawing takes at x (non-vertical pieces and points) */
  function ysAt(v, x) {
    var g = DR.geom(v), out = [];
    Object.keys(g.lines).forEach(function (k) { var L = g.lines[k]; if (L.B === 0) return; L.iv.forEach(function (iv) { if ((x > iv.lo + 1e-9 && x < iv.hi - 1e-9) || (near(x, iv.lo) && iv.lc) || (near(x, iv.hi) && iv.hc)) out.push(Math.round((L.C - L.A * x) / L.B * 1e6) / 1e6); }); });
    g.pts.forEach(function (p) { if (near(p[0], x)) out.push(p[1]); });
    return out;
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
    var H = book ? 8 : 2 * r.int(3, 6), /* even: the height axis is labelled every 2 m */ dp = book ? 25 : r.pick([20, 25, 30]), L = book ? 54 : 2 * dp + r.pick([2, 4, 6]), nb = book ? 2 : r.pick([2, 2, 3]);
    var w = book ? [3, 1.5] : nb === 2 ? r.pick([[3, 1.5], [4, 2]]) : [4, 2.5, 2], h = [H * 0.27, H * 0.1, H * 0.055]; // 3rd bounce big enough to see and count (was ~4 px)
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
  /* drop heights and rebound percents whose first four peaks sit at least 1.5 grid lines up and a grid line apart
   * (grid 1 m up to 12 m, 2 m above), so a correct sketch can show four distinct, decreasing peaks */
  var BALL = (function () {
    var out = [];
    [8, 10, 12, 16, 20].forEach(function (H) { [50, 60, 65, 70, 75, 80].forEach(function (pc) {
      var g = H <= 12 ? 1 : 2, h = [1, 2, 3, 4].map(function (k) { return H * Math.pow(pc / 100, k); });
      if (h[3] < 1.5 * g) return; for (var i = 0; i < 3; i++) if (h[i] - h[i + 1] < g) return;
      out.push({ H0: H, pct: pc });
    }); });
    return out;
  })();

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
      shared: function (r) { var bk = r.chance(0.3), c = bk ? { H0: 12, pct: 65 } : r.pick(BALL); return { H0: c.H0, pct: c.pct, p: c.pct / 100 }; }, parts: [
      { id: '5', level: 'PRG', make: function (r, b) {
        var g = b.H0 <= 12 ? 1 : 2, hs = [1, 2, 3, 4].map(function (k) { return b.H0 * Math.pow(b.p, k); }), pk = hs.map(function (h) { return Math.round(h / g) * g; }), Y = b.H0 + g;
        var inp = { x: [0, 13], y: [0, Y], grid: 1, gridY: g, labels: 2, labelsY: 2 * g, firstQuadrant: true, xName: ' ', yName: ' ', xTitle: 'Time (s)', yTitle: 'Height (m)', unitX: 23, unitY: 210 / Y, snapX: 1, snapY: g,
          defaultEnd: 'none', tools: ['line'], max: 360, help: 'Tap where the graph starts, then each corner in turn (the top of each bounce, each landing); tap the last point again to finish.' };
        var hm2 = function (h) { return dn(Math.round(h * 100 + 1e-6) / 100); };
        var ph = [{ dir: 'down', text: 'the drop from ' + b.H0 + ' m' }];
        for (var k = 1; k <= 4; k++) ph.push({ dir: 'up', text: 'rebound ' + k }, { dir: 'down', text: 'falling back to the ground' });
        var chk = story({ phases: ph, start: b.H0, startHint: 'The ball is <b>dropped</b> from ' + t(b.H0 + units('m')) + ': at time ' + t('0') + ' its height is ' + t(b.H0 + units('m')) + ', and the first thing it does is fall.',
          prep: function (G) {
            G = trimFlat(false, true, function (f) { return near(f.y0, 0); })(G);
            if (G.length > 9) { // more bounces than asked: fine if they keep alternating and getting lower
              for (var i = 9; i < G.length; i++) if (G[i].dir !== (i % 2 ? 'up' : 'down')) return null;
              for (i = 9; i < G.length; i += 2) if (G[i].y1 >= G[i - 2].y1 - 1e-9) return { code: 'story-peaks', hint: 'Each rebound is lower than the one before — keep that going for the extra bounces too.' };
              G = G.slice(0, 9);
            }
            return G;
          },
          after: function (G) {
            for (var i = 0; i < 9; i += 2) if (!near(G[i].y1, 0)) return { code: 'story-zero', hint: 'A bounce happens when the ball <b>hits the ground</b>: after the drop and after every rebound the graph must come all the way down to height ' + t('0') + '.' };
            var P = [1, 3, 5, 7].map(function (j) { return G[j].y1; });
            for (var k = 0; k < 4; k++) {
              if (Math.abs(P[k] - hs[k]) <= g + 1e-9) continue;
              var n = k + 1;
              if (P.every(function (q) { return Math.abs(q - b.H0) <= g; })) return { code: 'pct-original', hint: 'Every bounce here goes back up to the full ' + t(b.H0 + units('m')) + '. The ball only rebounds to ' + t(b.pct + '\\%') + ' of the previous height, so each peak is lower.' };
              if (k > 0 && Math.abs(P[k] - b.H0 * b.p) <= g) return { code: 'pct-original', hint: 'Rebound ' + n + ' is ' + t(b.pct + '\\%') + ' of the <b>previous</b> rebound, not of the first drop: multiply by ' + t(dn(b.p)) + ' again each time.' };
              if (Math.abs(P[k] - b.H0 * Math.pow(1 - b.p, n)) <= g) return { code: 'pct-lost', hint: 'The ball <b>keeps</b> ' + t(b.pct + '\\%') + ' of its height: multiply by ' + t(dn(b.p)) + ', not ' + t(dn(1 - b.p)) + '.' };
              if (Math.abs(P[k] - (b.H0 - n * b.H0 * (1 - b.p))) <= g / 2) return { code: 'pct-linear', hint: 'The ball doesn’t lose the same number of metres each time: it keeps ' + t(b.pct + '\\%') + ' of whatever height it just had, so multiply by ' + t(dn(b.p)) + ' every bounce.' };
              return { code: 'story-peaks', hint: 'Check the top of rebound ' + n + ': it should be at about ' + t(hm2(hs[k]) + units('m')) + ' (' + t(b.pct + '\\%') + ' of ' + t(hm2(k ? hs[k - 1] : b.H0) + units('m')) + '). Put it on the nearest grid line.' };
            }
            return null;
          } });
        var key = [[0, b.H0], [1, 0]]; pk.forEach(function (h, i) { key.push([2 + 2 * i, h], [3 + 2 * i, 0]); });
        var arch = function (hh) { var v = [[0, b.H0], [1, 0]]; hh.forEach(function (h, i) { v.push([2 + 2 * i, h], [3 + 2 * i, 0]); }); return poly(v); };
        var rg = function (h) { return Math.max(g, Math.round(h / g) * g); };
        var bad = [arch([b.H0, b.H0, b.H0, b.H0]), arch([pk[0], pk[0], pk[0], pk[0]]), arch([1, 2, 3, 4].map(function (k) { return rg(b.H0 * Math.pow(1 - b.p, k)); })),
          poly([[0, 0], [1, b.H0], [2, 0]].concat(pk.reduce(function (a, h, i) { return a.concat([[3 + 2 * i, h], [4 + 2 * i, 0]]); }, []))),
          poly([[0, b.H0], [1, g]].concat(pk.reduce(function (a, h, i) { return a.concat([[2 + 2 * i, h + g], [3 + 2 * i, g]]); }, [])))];
        return storyPart('Sketch the ball’s height (vertical axis) as a function of time (horizontal axis), showing the first four bounces. Work out each rebound height and put the top of each bounce on the nearest grid line.', inp, chk, poly(key),
          'Multiply by ' + t(dn(b.p)) + ' for each bounce: ' + t([b.H0].concat(hs).map(function (h, i) { return i ? (Math.round(h * 10000) / 10000) : h; }).join('\\to ')) + ', so the rebounds reach about ' + hs.map(function (h) { return t(hm2(h) + units('m')); }).join(', ') + '. ' +
          'The graph starts at ' + t(b.H0 + units('m')) + ' and falls to ' + t('0') + ' (the drop). Then come four arches, each touching ' + t('h=0') + ' at a bounce and each lower than the one before. (Lower bounces also take less time, so the arches get narrower.)',
          ['Rebounding to ' + t(b.pct + '\\%') + ' means multiplying the previous height by ' + t(dn(b.p)) + '.', 'Where does the ball start? What happens at every bounce? How do the peaks change?'], 'bouncing ball sketch ' + b.H0 + ' m at ' + b.pct + '%', bad);
      } }] },

    { num: '6', section: 'Part B — Matching descriptions and graphs', stem: 'Each graph below shows a real-world relationship. Choose a situation the graph could represent.', parts: [
      { id: '6a', level: 'BEG', make: function (r) {
        var ph = r.pick(['rise', 'dip']), g = sk(S.wave(2, ph, 1.4, 5), { xTitle: 'Time', yTitle: 'Height', max: 300, unit: 22 });
        var per = r.pick(['the height of the ocean tide at a beach over a day', 'the height above the ground of a seat on a Ferris wheel turning at a steady rate', 'the height of the water at a dock as the tide comes in and goes out']);
        var D = r.sample([['the height of a candle as it burns steadily', 'A burning candle only gets shorter, at a steady rate: a straight line going down.'],
          ['the height of a tree as it grows', 'A tree’s height only increases (slowing down as it matures). It never goes back down.'],
          ['the height of a ball thrown straight up and caught', 'A thrown ball rises and falls only <b>once</b>.'],
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

    { num: '7', section: 'Part C — Sketching a graph from a description', stem: 'Sketch a graph for each situation. Where there is no scale, only the <b>shape</b> matters: where it rises, falls, stays flat or bends.', parts: [
      { id: '7a', level: 'EMG', make: function (r) {
        var it = r.pick(['a used mountain bike', 'a used car', 'a laptop computer', 'a snowmobile']);
        return storyPart('The resale value of ' + it + ' as a function of its age. (Value on the vertical axis, age on the horizontal axis.)', spad({ xTitle: 'Age', yTitle: 'Value' }),
          decayStory('losing value as it gets older', 'A used item loses value <b>fastest when it is new</b>, then more and more slowly: draw a curve that is steep at first and then flatter and flatter (a few short pieces, each less steep than the one before).',
            'A used item is still worth something: the curve should level off <b>above</b> the axis, not drop to ' + t('0') + '.'),
          poly([[0, 7], [1, 4], [3, 2], [7, 1], [11, 1]]),
          '<b>Decreasing and flattening:</b> ' + it + ' loses value fastest in its first year or two, then more and more slowly, levelling off at a low value. The curve should not reach ' + t('0') + '.',
          ['Does the value go up or down with age? When does it drop the most?', 'Draw a curve with a few short pieces: steep first, then flatter and flatter.'], 'sketch: resale value vs age',
          [poly([[0, 7], [9, 0]]), poly([[0, 7], [6, 6], [9, 4], [11, 0]]), poly([[0, 1], [4, 4], [11, 7]]), poly([[0, 7], [1, 4], [3, 2], [7, 0]]), poly([[0, 7], [10, 2]])]);
      } },
      { id: '7b', level: 'BEG', make: function (r) {
        var L = loan(r);
        return numPart('A ' + t('\\$' + L.A) + ' loan is paid off at ' + t('\\$' + L.p) + ' every month. How many months does it take to pay it off completely?', L.n,
          [{ v: L.n - 1, code: 'months', hint: 'Check: after that many payments, ' + t('\\$' + L.p) + ' is still owed.' }, { v: L.n + 1, code: 'months', hint: 'Check: ' + t((L.n + 1) + '\\times\\$' + L.p + '=\\$' + (L.n + 1) * L.p) + ', more than the loan.' }, { v: L.A - L.p, code: 'months', hint: 'Divide the loan by the monthly payment.' }],
          t(L.A + '\\div ' + L.p + '=' + L.n) + ', so it takes ' + t(L.n) + ' months.', ['Divide the amount of the loan by the monthly payment.'], 'loan months ' + L.A + '/' + L.p, { after: 'months' });
      } },
      { id: '7c', level: 'PRG', make: function (r) {
        var L = loan(r), n = L.n, A = L.A, p = L.p, owed = function (k) { return A - k * p; };
        var inp = { x: [0, n + 1], y: [0, A + p], grid: 1, gridY: p, labels: 1, labelsX: n > 6 ? 2 : 1, labelsY: n > 5 ? 2 * p : p, firstQuadrant: true, xName: ' ', yName: ' ', xTitle: 'Months', yTitle: 'Amount owed ($)',
          unitX: 300 / (n + 1), unitY: 210 / (A + p), snapX: 1, snapY: p, max: 360 };
        var chk = K.graphRules({ custom: function (v) {
          var pts = v.pts;
          if (!v.pieces.length && pts.length === n + 1 && pts.every(function (q) { return near(q[1], owed(q[0])) && Math.abs(q[0] - Math.round(q[0])) < 1e-9; })) return null; // one point per month: also right
          var y0 = ysAt(v, 0.5), yl = ysAt(v, n - 0.5);
          var gm = DR.geom(v), sloped = Object.keys(gm.lines).some(function (k) { var Ln0 = gm.lines[k]; return Ln0.A !== 0 && Ln0.B !== 0; });
          if (sloped && y0.length && yl.length && y0[0] < yl[0]) return { code: 'stair-up', hint: 'Your graph goes <b>up</b> — that is the amount paid so far. The question asks for the amount still <b>owed</b>, which starts at ' + t('\\$' + A) + ' and goes down.' };
          if (sloped) return { code: 'stair-lin', hint: 'A straight line says a little is paid off every day. The amount owed only drops on payment day — for the whole month in between it stays the same, so each month is a <b>flat</b> piece: a staircase.' };
          if (y0.length && yl.length && y0[0] < yl[0]) return { code: 'stair-up', hint: 'Your graph goes <b>up</b> — that is the amount paid so far. The question asks for the amount still <b>owed</b>, which starts at ' + t('\\$' + A) + ' and goes down.' };
          for (var k = 0; k < n; k++) {
            var ys = ysAt(v, k + 0.5);
            if (ys.length !== 1 || !near(ys[0], owed(k))) return { code: 'stair', hint: ys.length > 1 ? 'Between ' + k + ' and ' + (k + 1) + ' months your graph has two values — the amount owed has just one value at each moment.' : !ys.length ? 'Your graph has a gap between ' + k + ' and ' + (k + 1) + ' months: something is owed at every moment until the loan is paid off.' :
              'Between ' + k + ' and ' + (k + 1) + ' months, ' + (k === 0 ? 'before the first payment' : 'after ' + k + ' payment' + (k > 1 ? 's' : '')) + ', the amount owed is ' + t('\\$' + A + (k ? '-' + k + '\\times\\$' + p + '=\\$' + owed(k) : '')) + '. Your graph shows ' + t('\\$' + dn(ys[0])) + ' there.' };
          }
          if (!DR.contains(v, [n, 0])) return { code: 'stair', hint: 'After ' + t(n) + ' payments of ' + t('\\$' + p) + ' the loan is paid off: at ' + t(n) + ' months the amount owed is ' + t('\\$0') + '. Show that point (use <b>● Point</b>, or end a piece there).' };
          if (ysAt(v, n + 0.5).some(function (y) { return !near(y, 0); })) return { code: 'stair', hint: 'Once the loan is paid off, nothing more is owed: after ' + t(n) + ' months the graph can only be at ' + t('\\$0') + ' (or stop).' };
          return null;
        } });
        var key = { pts: [[n, 0]], pieces: [], join: 'none' }; for (var k = 0; k < n; k++) key.pieces.push({ v: [[k, owed(k)], [k + 1, owed(k)]], s: 'closed', e: 'open' });
        var riser = [[0, A]]; for (k = 1; k <= n; k++) riser.push([k, owed(k - 1)], [k, owed(k)]);
        var stairs = function (f, m) { var o = { pts: [], pieces: [], join: 'none' }; for (var i = 0; i < m; i++) o.pieces.push({ v: [[i, f(i)], [i + 1, f(i)]], s: 'closed', e: 'open' }); return o; };
        var pp = K.P.graph('A ' + t('\\$' + A) + ' loan is paid off at ' + t('\\$' + p) + ' every month. Draw the graph of the amount still owed as a function of the number of months, until it is fully paid off.', inp, chk, key,
          '<b>A decreasing staircase.</b> The amount owed stays at ' + t('\\$' + A) + ' for the first month, then drops by ' + t('\\$' + p) + ' at each payment. ' + t(A + '\\div ' + p + '=' + n) + ', so there are ' + t(n) + ' equal steps down and the graph reaches ' + t('\\$0') + ' after ' + t(n) + ' months. (A solid dot shows which flat piece owns each payment day; plotting just the amount owed after each payment, one point per month, is also fine.)',
          ['When does the amount owed change — every instant, or only on payment day?', 'How many payments does it take?'], 'sketch: loan staircase');
        pp.good = [poly(riser), { pts: Array.apply(null, Array(n + 1)).map(function (z, i) { return [i, owed(i)]; }), pieces: [], join: 'none' }];
        pp.bad = [poly([[0, A], [n, 0]]), stairs(function (i) { return (i + 1) * p; }, n), stairs(function (i) { return owed(i + 1); }, n), stairs(owed, n), poly([[0, A], [n + 1, 0]])];
        return pp;
      } },
      { id: '7d', level: 'EMG', make: function (r) {
        var day = r.pick(['a winter day', 'a cold winter day in Edmonton', 'a spring day', 'a summer day at the lake']);
        var inp = spad({ x: [6, 19], labels: 2, labelsY: 100, xTitle: 'Time of day (h, 24-hour clock)', yTitle: 'Temperature', unitX: 23 });
        var chk = story({ phases: [{ dir: 'up', text: 'warming up through the morning' }, { dir: 'down', text: 'cooling off later in the day' }],
          prep: function (G) { if (G.length === 3 && G[1].dir === 'flat' && G[0].dir === 'up' && G[2].dir === 'down') return [G[0], G[2]]; return G; }, // a short flat top is fine
          after: function (G, v) {
            var g = groupsOf(v), x0 = g[0].x0, x1 = g[g.length - 1].x1, top = G[0].x1, topEnd = G[1].x0;
            if (!near(x0, 6) || !near(x1, 18)) return { code: 'story-time', hint: 'Show the whole time from 6:00 a.m. to 6:00 p.m.: start the graph at ' + t('6') + ' and end it at ' + t('18') + ' on the time axis.' };
            if (topEnd < 12 - 1e-9) return { code: 'story-when', hint: 'Your warmest time is in the morning. The air keeps warming until the <b>early afternoon</b> (about 1–3 p.m.), so the peak comes after 12:00.' };
            if (top > 16 + 1e-9) return { code: 'story-when', hint: 'Your peak is too late: the warmest part of the day is the <b>early afternoon</b>, and it is cooling off well before 6:00 p.m.' };
            return null;
          } });
        return storyPart('The outdoor temperature on ' + day + ', from 6:00 a.m. to 6:00 p.m. (Temperature on the vertical axis, time on the horizontal axis; 12 is noon, 18 is 6:00 p.m.)', inp, chk, poly([[6, 1], [9, 3], [12, 5], [14, 6], [16, 5], [18, 3]]),
          '<b>Up, then down.</b> Coldest near 6:00 a.m., rising through the morning to a peak in the early afternoon (around 13:00–15:00), then falling toward 6:00 p.m. One peak only. (On a winter day the temperatures may all be below zero — it is the shape that matters.)',
          ['When is it coldest? When is it warmest?'], 'sketch: daytime temperature',
          [poly([[6, 6], [12, 1], [18, 5]]), poly([[6, 1], [9, 6], [12, 1], [15, 6], [18, 1]]), poly([[6, 1], [18, 7]]), poly([[6, 1], [9, 6], [18, 2]]), poly([[6, 1], [14, 6], [16, 2]])]);
      } },
      { id: '7e', level: 'EMG', make: function (r) {
        var k = r.pick([2, 3, 3, 4]), rd = r.pick([['a swinging pirate-ship carnival ride', 'full swings'], ['a Ferris wheel turning at a steady rate, starting from the bottom', 'full turns'], ['a giant playground swing that is pushed the same amount every time', 'full swings']]);
        return storyPart('Your height above the ground while riding ' + rd[0] + ', during ' + t(k) + ' ' + rd[1] + ', starting from the lowest point. (Height on the vertical axis, time on the horizontal axis.)', spad({ xTitle: 'Time', yTitle: 'Height' }),
          cycleStory(k, rd[1], true), cycleKey(k, 1, 6),
          '<b>A repeating (periodic) wave with ' + k + ' identical cycles.</b> The same rise and fall repeats ' + k + ' times, with equal peaks and equal low points, and the low points stay above the axis.',
          ['How many times does your height go up and down? Do the peaks change? Do you touch the ground?'], 'sketch: periodic ride', [cycleKey(k === 2 ? 3 : k - 1, 1, 6), cycleKey(k, 0, 6), cycleKey(k, 1, 6, true), poly([[0, 6], [2, 1], [4, 6]])]);
      } }] },

    { num: '8', stem: function (z) { return 'A student sketched the graph below to represent her distance from her locker during part of a school day.' + z.svg; },
      shared: function (r) {
        for (var k = 0; k < 50; k++) { // keep the fold visible: the 3rd vertex must not sit on the line through the 4th and 5th (else the back-track is drawn over itself)
          var P = [[0, 0], [r.int(8, 14) / 10, r.int(8, 14) / 10], [r.int(28, 34) / 10, r.int(30, 38) / 10], [r.int(16, 21) / 10, r.int(4, 10) / 10], [r.int(40, 46) / 10, r.int(46, 52) / 10], [r.int(60, 66) / 10, r.int(3, 9) / 10]];
          var A = P[2], B = P[3], Cq = P[4], dist = Math.abs((Cq[0] - B[0]) * (A[1] - B[1]) - (Cq[1] - B[1]) * (A[0] - B[0])) / Math.hypot(Cq[0] - B[0], Cq[1] - B[1]);
          if (dist >= 0.3) break;
        }
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
        return mcG(r, d + ' (Over several years.)', [{ html: sk(S.wave(2, 'high')), right: true }, // January (winter) is at the high point; the low point falls in mid-summer
          { html: sk(S.wave(2, 'low')), code: 'rise', why: 'This one starts at its lowest point and rises first. January is in winter, when the quantity is high, so the graph must start high and go <b>down</b> toward summer.' },
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
        var ts = [0, 5, 10, 15, 20, 25, 30], TOL = 2;
        var inp = { x: [0, 35], y: [0, 90], grid: 5, gridY: 10, labels: 5, labelsY: 10, firstQuadrant: true, xName: 't', yName: 'T', xTitle: 'Time (min)', yTitle: 'Temperature (°C)', unitX: 8.6, unitY: 2.6,
          mode: 'points', join: true, snapX: 5, snapY: 1, max: 360, help: 'Press and slide to aim (the coordinates show), lift to place a point. Tap a point again to remove it. <b>Join</b> joins the points with a smooth curve.' };
        var chk = function (resp) {
          if (DR.empty(resp)) return form('empty', 'Plot the points on the grid first.');
          var v = DR.norm(resp), P = v.pts, at = function (x) { return P.filter(function (q) { return near(q[0], x); }); };
          if (P.length === 7 && ts.every(function (x, i) { var q = at(x + 5); return q.length === 1 && Math.abs(q[0][1] - c.T[i]) <= TOL; })) return wrong('plot-shift', 'Check the first point: at ' + t('t=0') + ' the temperature is ' + t(c.T[0]) + '°C. Every point is ' + t('5') + ' minutes too late.');
          var two = ts.filter(function (x) { return at(x).length > 1; })[0];
          if (two != null) return wrong('plot-value', 'You have two points at ' + t('t=' + two) + '. Each reading gives one point.');
          var extra = P.filter(function (q) { return ts.every(function (x) { return !near(q[0], x); }); });
          if (extra.length) return wrong('plot-count', 'The point ' + t('(' + dn(extra[0][0]) + ',\\ ' + dn(extra[0][1]) + ')') + ' isn’t a reading: the table has readings at ' + t('t=0,\\ 5,\\ 10,\\ \\ldots,\\ 30') + ' only.');
          for (var i = 0; i < 7; i++) { var q = at(ts[i]); if (q.length && Math.abs(q[0][1] - c.T[i]) > TOL) return wrong('plot-value', 'Check the point at ' + t('t=' + ts[i]) + ': the table says ' + t(c.T[i]) + '°C' + (Math.abs(q[0][1] - c.T[i]) > 40 ? '' : ', but your point is at ' + t(dn(q[0][1])) + '°C') + '. Read the scale: each grid line is ' + t('10') + '°C.'); }
          var miss = ts.filter(function (x) { return !at(x).length; });
          if (miss.length) return wrong('plot-count', 'Correct so far — but ' + (miss.length === 1 ? 'the reading at ' + t('t=' + miss[0]) + ' is' : t(miss.length) + ' readings are') + ' missing.');
          if (v.join === 'none') return wrong('graph-not-joined', 'Your points are right — now decide about joining them. The drink has a temperature at <b>every</b> moment between the readings (time and temperature are continuous), so join them with a smooth curve (press <b>Join</b>).');
          return ok();
        };
        var key = { pts: ts.map(function (x, i) { return [x, c.T[i]]; }), pieces: [], join: 'curve' };
        var pp = K.P.graph('Graph the data on the grid: plot the seven readings, then decide whether the points should be joined.', inp, chk, key,
          'Plot ' + t('(0,' + c.T[0] + ')') + ', ' + t('(5,' + c.T[1] + ')') + ', …, ' + t('(30,' + c.T[6] + ')') + '. Time and temperature are continuous, so join the points. The drops get smaller (' + c.T.slice(1).map(function (x, i) { return c.T[i] - x; }).join(', ') + ' degrees), so the points lie on a smooth curve that falls quickly at first, then more slowly.',
          ['Each column of the table is one point: (time, temperature).', 'Does the drink have a temperature between the readings?'], 'cooling graph');
        pp.good = [{ pts: ts.map(function (x, i) { return [x, c.T[i] + (i % 2 ? 1 : -1)]; }), pieces: [], join: 'curve' }];
        pp.bad = [{ pts: key.pts, pieces: [], join: 'none' }, { pts: ts.map(function (x, i) { return [x + 5, c.T[i]]; }), pieces: [], join: 'curve' }, { pts: key.pts.slice(1), pieces: [], join: 'curve' },
          { pts: key.pts.map(function (q, i) { return i === 2 ? [q[0], q[1] + 10] : q; }), pieces: [], join: 'curve' }, { pts: key.pts.concat([[35, c.R + 4]]), pieces: [], join: 'curve' }];
        return pp;
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
        if (r.chance(0.5)) return K.P.tf(r, '“Two riders can have the same average speed but different speeds along the way.” Use the graphs: is this statement true or false?', true, 'Look at the graphs: both riders average ' + t(s.v + units('km/h')) + ', but B is slower than A at the start and faster at the end.',
          '<b>True.</b> Both averages are ' + t(s.v + units('km/h')) + ', but A rides at ' + t(s.v + units('km/h')) + ' the whole way while B is slower at first (flatter) and faster at the end (steeper). Equal averages, different speeds along the way.', ['Do the two graphs have the same steepness everywhere?'], 'equal average, different speeds (true)');
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
        if (r.chance(0.5)) return K.P.tf(r, 'While the graph is flat, the drone’s altitude is not changing. True or false: the drone could still be moving during that time.', true, 'The graph records only altitude. The drone could be flying level across the survey area.',
          '<b>True.</b> Flat means the <b>height</b> is constant. The drone could be hovering in place or flying level — the graph doesn’t show horizontal motion.', ['What does this graph measure, and what doesn’t it show?'], 'drone: flat, could still move (true)');
        return K.P.tf(r, 'While the graph is flat, the drone’s altitude is not changing. True or false: that proves the drone is not moving at all.', false, 'The graph records only altitude. The drone could be flying level across the survey area.',
          '<b>False.</b> Flat means the <b>height</b> is constant. The drone could be hovering in place or flying level — the graph doesn’t show horizontal motion.', ['What does this graph measure, and what doesn’t it show?'], 'drone: flat ≠ not moving');
      } }] },

    { num: '7', section: 'Extra practice C — Sketching a graph from a story', stem: 'Sketch a graph for each story. Where there is no scale, only the <b>shape</b> matters: where it rises, falls, stays flat, bends or repeats.', parts: [
      { id: 'e7a', level: 'EMG', make: function (r) {
        var it = r.pick(['A mug of hot coffee is left on a desk in a warm room and forgotten all afternoon.', 'A bowl of hot soup is left on the kitchen table and forgotten.', 'A pot of boiling water is taken off the stove and left on the counter.']);
        return storyPart(it + ' Sketch its temperature (vertical) against time (horizontal).', spad({ xTitle: 'Time', yTitle: 'Temperature' }),
          decayStory('cooling down', 'It cools <b>fastest at the start</b>, when it is much hotter than the room, then more and more slowly: draw a curve that is steep at first and then flatter and flatter (a few short pieces, each less steep than the one before).',
            'It can only cool down to <b>room temperature</b>, which is well above the bottom of the graph: level off above the axis.'),
          poly([[0, 7], [1, 5], [3, 3], [6, 2], [11, 2]]),
          'Decreasing, <b>steeply at first, then more slowly</b>; it levels off at room temperature and never drops below it.', ['When is it cooling fastest? Where does it stop?'], 'sketch: cooling',
          [poly([[0, 7], [9, 0]]), poly([[0, 7], [5, 6], [8, 4], [10, 1]]), poly([[0, 7], [1, 4], [3, 2], [6, 0], [11, 0]]), poly([[0, 7], [11, 2]])]);
      } },
      { id: 'e7b', level: 'EMG', make: function (r) {
        var k = r.pick([2, 3, 3, 4]);
        return storyPart('One seat on a Ferris wheel turning at a steady rate, for ' + k + ' complete turns, starting from the loading platform at the bottom. Sketch the height of the seat against time.', spad({ xTitle: 'Time', yTitle: 'Height of seat' }),
          cycleStory(k, 'turns', false), cycleKey(k, 1, 7),
          'A repeating wave: <b>' + k + ' identical cycles</b>, starting at the bottom (the platform), each rising to the same top and back down.', ['Where does the seat start? How many cycles?'], 'sketch: Ferris wheel',
          [poly([[0, 7], [2, 1], [4, 7]]), cycleKey(k === 2 ? 3 : k - 1, 1, 7), cycleKey(k, 1, 7, true)]);
      } },
      { id: 'e7c', level: 'PRG', make: function (r) {
        var pl = r.pick([['a school parking lot from 7:00 a.m. to 5:00 p.m. on a school day', 7, 17, 'school ends'], ['an office building’s parking garage from 6:00 a.m. to 7:00 p.m. on a workday', 6, 19, 'the workday ends']]), a = pl[1], b = pl[2];
        var low = function (f) { return f.y0 <= 1 + 1e-9; };
        var chk = story({ phases: [{ dir: 'up', text: 'cars arriving' }, { dir: 'flat', text: 'parked all day' }, { dir: 'down', text: 'cars leaving' }], prep: trimFlat(true, true, low),
          after: function (G, v) {
            var g = groupsOf(v);
            if (!near(g[0].x0, a) || !near(g[g.length - 1].x1, b)) return { code: 'story-time', hint: 'Show the whole time from ' + a + ':00 to ' + b + ':00: start the graph at ' + t(a) + ' and end it at ' + t(b) + ' on the time axis.' };
            if (G[0].y0 > 1 + 1e-9) return { code: 'story-start', hint: 'Early in the morning the lot is (almost) empty: start near ' + t('0') + '.' };
            if (G[2].y1 > 1 + 1e-9) return { code: 'story-end', hint: 'By ' + b + ':00 almost everyone has gone home: end near ' + t('0') + '.' };
            var up = G[0].x1 - G[0].x0, fl = G[1].x1 - G[1].x0, dw = G[2].x1 - G[2].x0;
            if (!(fl > up && fl > dw)) return { code: 'story-rush', hint: 'People arrive in a rush and leave in a rush: the rise and the fall should be short and <b>steep</b>, with a long flat stretch for the day in between.' };
            return null;
          } });
        var inp = spad({ x: [a, b + 1], labels: 2, labelsY: 100, xTitle: 'Time of day (h, 24-hour clock)', yTitle: 'Number of cars', unitX: 300 / (b + 1 - a) });
        return storyPart('The number of cars in ' + pl[0] + '. Sketch the number of cars (vertical) against the time of day (horizontal).', inp, chk, poly([[a, 0], [a + 1, 1], [a + 2, 7], [b - 2, 7], [b - 1, 1], [b, 0]]),
          'Near ' + t('0') + ' early, a <b>steep rise</b> as people arrive, roughly <b>flat</b> all day, then a <b>steep fall</b> when ' + pl[3] + '.', ['When do the cars arrive and leave? Quickly or slowly?'], 'sketch: parking lot',
          [poly([[a, 0], [(a + b) / 2, 7], [b, 0]]), poly([[a, 0], [b, 7]]), poly([[a, 0], [a + 2, 7], [b, 7]]), poly([[a, 0], [a + 5, 7], [a + 6, 7], [b, 0]])]);
      } },
      { id: 'e7d', level: 'EMG', make: function (r) {
        var km = r.pick([3, 5, 5, 8, 10]);
        var inp = spad({ y: [0, km + 1], unitY: 200 / (km + 1), labels: 1, labelsX: 100, xTitle: 'Time', yTitle: 'Distance left (km)' });
        var chk = story({ phases: [{ dir: 'down', text: 'running at one steady pace', bend: 'straight', bendHint: 'One steady pace means the same distance every minute — a constant rate of change — so draw <b>one straight line</b>.' }],
          start: km, startHint: 'At the start she still has the whole ' + t(km + units('km')) + ' left to run.', end: 0, endHint: 'When she finishes, the distance left is ' + t('0') + ': the line has to come down to the time axis.', prep: trimFlat(false, true, function (f) { return near(f.y0, 0); }) });
        return storyPart('A runner jogs a straight ' + t(km + units('km')) + ' course at one steady pace. Sketch the distance she still has <b>left</b> to run (in km) against time.', inp, chk, poly([[0, km], [9, 0]]),
          'A <b>straight line falling from ' + km + ' to 0</b>: a steady pace is a constant rate of change, and it reaches ' + t('0') + ' when she finishes.', ['Does the distance left go up or down? Is the pace steady?'], 'sketch: distance left',
          [poly([[0, 0], [9, km]]), poly([[0, km], [1, km - 2], [4, 1], [10, 0]]), poly([[0, km], [6, 1]]), poly([[0, km - 1], [8, 0]])]);
      } }] },
    { num: '8', stem: 'Sketch these. Each one has a detail that is easy to get wrong.', parts: [
      { id: 'e8a', level: 'PRG', make: function (r) {
        var ob = r.pick([['A stone is dropped from a bridge and falls until it hits the water.', 'stone', 'water'], ['An apple falls from a tall tree until it hits the ground.', 'apple', 'ground'], ['A coin is dropped from a lookout tower into a pond.', 'coin', 'water']]);
        var chk = story({ phases: [{ dir: 'up', text: 'falling faster and faster', bend: 'steeper', bendHint: 'The ' + ob[1] + ' <b>speeds up</b> as it falls: each second it falls farther than the second before, so the graph gets <b>steeper and steeper</b>. Draw it as a few short pieces, each steeper than the last.' }],
          start: 0, startHint: 'At the moment it is let go the ' + ob[1] + ' has fallen ' + t('0') + ' m, so start at ' + t('0') + '. (This graph is the distance <b>fallen</b>, which grows — not the height, which shrinks.)', prep: trimFlat(false, true) });
        return storyPart(ob[0] + ' Sketch the <b>distance it has fallen</b> against time. (A falling object does not fall at a steady speed.)', spad({ xTitle: 'Time', yTitle: 'Distance fallen' }), chk, poly([[0, 0], [3, 1], [5, 3], [7, 6], [8, 8]]),
          'From the origin, rising and getting <b>steeper and steeper</b> (the ' + ob[1] + ' speeds up); it stops when it hits the ' + ob[2] + '. A straight line would wrongly mean a steady speed.', ['Does the distance fallen go up or down? Is the speed steady?'], 'sketch: falling stone',
          [poly([[0, 0], [8, 8]]), poly([[0, 0], [1, 4], [4, 7], [8, 8]]), poly([[0, 8], [3, 7], [5, 5], [7, 0]]), poly([[0, 2], [3, 3], [5, 5], [7, 8]])]);
      } },
      { id: 'e8b', level: 'PRG', make: function (r) {
        var n = r.pick([2, 3, 3]), ph = [], key = [[0, 0]], x = 0;
        for (var i = 1; i <= n; i++) {
          ph.push({ dir: 'up', text: 'pulling away' + (i === 1 ? ' from the depot' : ' from stop ' + (i - 1)) }, { dir: 'flat', text: 'driving at a steady speed' }, { dir: 'down', text: 'slowing down for stop ' + i });
          key.push([x + 1, 6], [x + 3, 6], [x + 4, 0]); x += 4;
          if (i < n) { ph.push({ dir: 'flat', text: 'waiting at stop ' + i }); key.push([x + 1, 0]); x += 1; }
        }
        var chk = story({ phases: ph, start: 0, startHint: 'At the depot the bus isn’t moving yet: its speed starts at ' + t('0') + '.', end: 0, endHint: 'At stop ' + n + ' the bus has stopped: its speed is ' + t('0') + '.',
          after: function (G) {
            for (var j = 2; j < G.length; j += 4) if (!near(G[j].y1, 0)) return { code: 'story-zero', hint: 'At a stop the bus isn’t moving: its speed is ' + t('0') + ', so the graph has to come all the way down <b>onto</b> the time axis. A flat part above the axis would mean driving at a steady speed.' };
            return null;
          } });
        var bus = function (m, lowY) { var v = [[0, 0]], xx = 0; for (var q = 1; q <= m; q++) { v.push([xx + 1, 6], [xx + 3, 6], [xx + 4, q === m ? 0 : lowY]); xx += 4; if (q < m) { v.push([xx + 1, lowY]); xx += 1; } } return poly(v); };
        var stair = [[0, 0]]; for (i = 0; i < n; i++) stair.push([4 * i + 2, 2 * i + 2], [4 * i + 4, 2 * i + 2]);
        return storyPart('A bus leaves the depot and makes ' + n + ' stops along its route. Sketch the bus’s <b>speed</b> from the moment it leaves the depot until it reaches stop ' + n + '.', spad({ x: [0, 5 * n], unitX: 300 / (5 * n), xTitle: 'Time', yTitle: 'Speed of bus' }), chk, poly(key),
          'Speed up, cruise, slow to ' + t('0') + ' — ' + n + ' times. The stops are flat parts <b>on the time axis</b> (speed ' + t('0') + '), not flat parts up high (which mean cruising).', ['What is the speed at a stop? Where is that on the graph?'], 'sketch: bus speed',
          [bus(n, 2), poly(stair), bus(n - 1, 0), poly([[0, 0], [1, 6], [3, 6], [4, 0], [5, 6], [7, 6], [8, 0]])]);
      } },
      { id: 'e8c', level: 'PRG', make: function (r) {
        var tb = r.pick([['A tap fills a bathtub at a steady rate. The tap is turned off, someone bathes for a while, and then the plug is pulled', 'tub', 'someone bathes', 'bathing'], ['A hose fills a kiddie pool at a steady rate. The hose is turned off, the kids play in it for a while, and then it is pumped out', 'pool', 'the kids play', 'playing'], ['A tap fills a sink at a steady rate. The tap is turned off, someone washes the dishes, and then the plug is pulled', 'sink', 'someone washes the dishes', 'washing']]);
        var chk = story({ phases: [{ dir: 'up', text: 'filling at a steady rate', bend: 'straight', bendHint: 'It fills at a <b>steady</b> rate — the same amount every minute — so the rise is one straight piece.' }, { dir: 'flat', text: tb[3] + ': no water in or out' },
          { dir: 'down', text: 'emptying, faster than it filled', steeper: 0 }], start: 0, startHint: 'It starts empty: the amount of water starts at ' + t('0') + '.', end: 0, endHint: 'It empties completely: end at ' + t('0') + '.', prep: trimFlat(false, true, function (f) { return near(f.y0, 0); }) });
        return storyPart(tb[0] + ' and it empties <b>faster</b> than it filled. Sketch the amount of water in the ' + tb[1] + ' against time.', spad({ xTitle: 'Time', yTitle: 'Water in ' + tb[1] }), chk, poly([[0, 0], [4, 6], [7, 6], [9, 0], [11, 0]]),
          'Straight rise (filling steadily), flat (' + tb[3] + '), then a straight fall to ' + t('0') + ' that is <b>steeper than the rise</b>, because it empties faster than it filled.', ['Three stages: filling, ' + tb[3] + ', emptying. Which is steepest?'], 'sketch: bathtub',
          [poly([[0, 0], [2, 6], [5, 6], [11, 0]]), poly([[0, 0], [4, 6], [6, 0]]), poly([[0, 0], [1, 3], [3, 5], [5, 6], [8, 6], [10, 0]]), poly([[0, 0], [4, 6], [7, 6], [9, 2]])]);
      } },
      { id: 'e8d', level: 'EMG', make: function (r) {
        var it = r.pick(['A phone', 'A tablet', 'A gaming console']);
        return storyPart(it + ' loses value quickly in its first year and more slowly after that, but a working one is never quite worthless. Sketch its value against its age.', spad({ xTitle: 'Age', yTitle: 'Value ($)' }),
          decayStory('losing value', 'It loses value <b>quickly in the first year</b> and more slowly after that: steep at first, then flatter and flatter (a few short pieces, each less steep than the one before).',
            'A working one is <b>never quite worthless</b>: level off above the axis instead of dropping to ' + t('\\$0') + '.'),
          poly([[0, 7], [1, 3], [3, 2], [7, 1], [11, 1]]),
          'Decreasing, steep in the first year and then flattening, but <b>staying above the axis</b>: it never reaches ' + t('\\$0') + '.', ['When does it lose value fastest? Does it ever reach zero?'], 'sketch: phone value',
          [poly([[0, 7], [1, 3], [3, 1], [6, 0], [11, 0]]), poly([[0, 7], [9, 0]]), poly([[0, 7], [6, 6], [9, 4], [11, 1]])]);
      } }] },
    { num: '9', stem: function (s) { return 'This sketch has a scale, so the numbers matter. ' + s.nm + ' leaves home at 8:00 a.m. ' + s.nm + ' walks ' + t(dn(s.d[0]) + units('km')) + ' to the bus stop, arriving at ' + hm(8 + s.tt[1] / 60) + ', and waits ' + t(s.w + units('min')) + '. The bus then carries ' + s.nm + ' ' + t(s.d[1] + units('km')) + ' farther from home, arriving at ' + hm(8 + s.tt[3] / 60) + '. From there ' + s.nm + ' walks the last ' + t(dn(s.d[2]) + units('km')) + ' to work, arriving at ' + hm(8 + s.tt[4] / 60) + '.'; },
      shared: function (r) {
        var nm = r.pick(['Sanjay', 'Ravi', 'Tariq', 'Iris', 'Hana']);
        if (r.chance(0.3)) return { nm: 'Sanjay', tt: [0, 20, 30, 50, 65], d: [2, 12, 1], v: [6, 0, 36, 4], w: 10 };
        // every corner on the drawing grid (5 min × 1 km) and the window at most 70 min × 16 km, so e9a can be drawn exactly
        for (var k = 0; k < 4000; k++) {
          var w1 = r.pick([4, 5, 6]), t1 = r.pick([10, 15, 20, 30]), w = r.pick([5, 10, 15]), vb = r.pick([30, 36, 40, 45, 48, 60]), t2 = r.pick([10, 15, 20, 25]), w2 = r.pick([3, 4, 5, 6]), t3 = r.pick([10, 15, 20]);
          var d1 = w1 * t1 / 60, d2 = vb * t2 / 60, d3 = w2 * t3 / 60;
          if (d1 % 1 || d2 % 1 || d3 % 1 || d1 + d2 + d3 > 15) continue;
          var tt = [0, t1, t1 + w, t1 + w + t2, t1 + w + t2 + t3]; if (tt[4] > 70) continue;
          return { nm: nm, tt: tt, d: [d1, d2, d3], v: [w1, 0, vb, w2], w: w };
        }
      }, parts: [
      { id: 'e9a', level: 'PRG', make: function (r, s) {
        var tt = s.tt, c = [0, s.d[0], s.d[0], s.d[0] + s.d[1], s.d[0] + s.d[1] + s.d[2]], X = tt[4] + 5, Y = c[4] + 1;
        var inp = { x: [0, X], y: [0, Y], grid: 5, gridY: 1, labels: 10, labelsY: 2, firstQuadrant: true, xName: ' ', yName: ' ', xTitle: 'Time since 8:00 (min)', yTitle: 'Distance from home (km)',
          unitX: 310 / X, unitY: 230 / Y, snapX: 5, snapY: 1, tools: ['line'], max: 380 };
        var right = tt.map(function (x, i) { return [x, c[i]]; });
        var back = right.slice(0, 4).concat([[tt[4], c[3] - s.d[2]]]);
        var nowait = [[0, 0], [tt[1], c[1]], [tt[3] - s.w, c[3]], [tt[4] - s.w, c[4]]];
        var swap = [[0, 0], [tt[1], c[1]], [tt[2], c[2]], [tt[3], c[2] + s.d[2]], [tt[4], c[4]]];
        var leg = [[0, 0], [tt[1], c[1]], [tt[2], c[2]], [tt[3], s.d[1]], [tt[4], s.d[1] + s.d[2]]];
        var wr = [{ is: poly(back), code: 'graph', hint: 'Your last segment goes <b>down</b>, back toward home. The last walk takes ' + s.nm + ' farther from home, to work, so the graph keeps rising.' },
          { is: poly(nowait), code: 'graph', hint: 'Where is the wait? The ' + s.w + '-minute wait at the bus stop is a <b>flat</b> segment at ' + t(dn(c[1]) + units('km')) + ', from ' + t(tt[1]) + ' to ' + t(tt[2]) + ' min.' },
          { is: poly(swap), code: 'graph', hint: 'Check the bus ride: it carries ' + s.nm + ' ' + t(s.d[1] + units('km')) + ' farther, from ' + t(dn(c[2])) + ' km to ' + t(dn(c[3])) + ' km.' },
          { is: poly(leg), code: 'graph', hint: 'The graph shows the distance from <b>home</b>, not the length of each leg: after the bus ' + s.nm + ' is ' + t(dn(c[2]) + '+' + s.d[1] + '=' + dn(c[3]) + units('km')) + ' from home.' }];
        var exact = K.graphExact(poly(right), { wrong: wr });
        var chk = function (v) { var res = exact(v); if (res.v === 'wrong' && res.code === 'graph' && !res.hint) return wrong('graph', 'Find each corner as (minutes after 8:00, km from home): ' + t('(0,\\ 0)') + ', then the bus stop at ' + t(tt[1]) + ' min, and so on. Join them in order with straight segments.'); return res; };
        var pp = K.P.graph('Draw the graph of ' + s.nm + '’s distance from home (km) against the time since 8:00 (min).', inp, chk, poly(right),
          'Corners: ' + right.map(function (p) { return t('(' + p[0] + ',' + dn(p[1]) + ')'); }).join(', ') + ' — join them with straight segments. The wait is the flat segment; the bus ride is the steepest.', ['Find each corner point: (minutes after 8:00, km from home).', 'Distances add up: each leg starts where the last one ended.'], 'commute graph');
        pp.bad = [poly(back), poly(nowait), poly(swap), poly(leg), poly(right.slice(0, 4))];
        return pp;
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
        var X = v.T + 0.5, Y = v.d2 * 1.12, g = [60, 50, 40, 30, 20, 15, 10, 5].filter(function (q) { return v.d1 % q === 0 && v.d2 % q === 0 && Y / q <= 24; })[0] || 5, ys = g;
        while (Y / ys > 6) ys += g;
        return 'A delivery van leaves the depot, stops to unload, then drives on. Its <b>distance from the depot</b> is graphed below.' +
          ctx({ X: X, Y: Y, gx: 0.5, gy: g, xt: 'Time (h)', yt: 'Distance (km)', pts: [[0, 0], [v.t1, v.d1], [v.t1 + v.s, v.d1], [v.T, v.d2]], xT: tickList(0.5, X - 0.2, 0.5), yT: tickList(ys, Y - 5, ys), aria: 'van distance' });
      }, shared: function (r) {
        if (r.chance(0.3)) return { v1: 60, t1: 1, s: 0.5, v2: 80, t2: 1.5, d1: 60, d2: 180, T: 3 };
        for (var k = 0; k < 500; k++) {
          var v1 = r.pick([40, 50, 60, 70, 80, 90]), v2 = r.pick([40, 50, 60, 70, 80, 90]), t1 = r.pick([1, 1.5, 2]), t2 = r.pick([1, 1.5, 2]), s = r.pick([0.5, 1]);
          if (Math.abs(v1 - v2) < 20 || t1 + s + t2 > 4.5) continue;
          var e1 = v1 * t1, e2 = e1 + v2 * t2; // the stem needs a gridline spacing that divides both distances with at most 24 lines (else 40–60 lines, a few px apart)
          if (![60, 50, 40, 30, 20, 15, 10, 5].some(function (q) { return e1 % q === 0 && e2 % q === 0 && e2 * 1.12 / q <= 24; })) continue;
          return { v1: v1, t1: t1, s: s, v2: v2, t2: t2, d1: e1, d2: e2, T: t1 + s + t2 };
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
        // every corner on a gridline (grid 5 s × 5 m/s): e12d reads the stop times and e12e the speed off the graph
        var t1 = r.pick([5, 10, 15]), t2 = t1 + r.pick([20, 25, 30, 40]), t3 = t2 + r.pick([5, 10, 15]), t4 = t3 + r.pick([15, 20]);
        return { t: [0, t1, t2, t3, t4], v: r.pick([10, 15, 20, 25, 30]) };
      }, parts: [
      { id: 'e12a', level: 'BEG', make: function (r, L) {
        var rows = [0, 1, 2, 3].map(function (i) { return { id: 's' + i, html: L.t[i] + '–' + L.t[i + 1] + ' s' }; }), want = { s0: 'up', s1: 'steady', s2: 'down', s3: 'stop' };
        var cols = [{ id: 'up', html: 'Speeding<br>up' }, { id: 'steady', html: 'Steady<br>speed' }, { id: 'down', html: 'Slowing<br>down' }, { id: 'stop', html: 'Stopped' }];
        var p = K.P.grid('Describe the journey: what is the train doing on each part?', rows, cols, want, { why: function (row) {
          return { code: 'row', hint: { s0: 'The speed rises from 0: the train is speeding up.', s1: 'Flat <b>above</b> the axis on a speed graph means the speed isn’t changing: a steady speed, not stopped.', s2: 'The speed falls to 0: the train is slowing down.', s3: 'On the axis the speed is 0: the train is stopped.' }[row] };
        } }, rows.map(function (rw) { return rw.html + ': ' + { up: 'speeding up steadily from rest to ' + L.v + ' m/s', steady: 'steady speed of ' + L.v + ' m/s', down: 'slowing down steadily to a stop', stop: 'stopped at the station (speed 0)' }[want[rw.id]]; }).join('<br>'), ['On a speed graph: rising = speeding up, flat = steady speed, falling = slowing down, on the axis = stopped.'], 'train: describe speed');
        p.answer = rows.map(function (rw) { return rw.html + ': ' + { up: 'speeding up', steady: 'steady speed', down: 'slowing down', stop: 'stopped' }[want[rw.id]]; }).join('<br>'); return p;
      } },
      { id: 'e12b', level: 'ADV', make: function (r, L) {
        var chk = story({ phases: [{ dir: 'up', text: 'the train moving: the distance travelled grows', bend: 'scurve', bendHint: 'Look at the three moving parts. Speeding up (0–' + L.t[1] + ' s): each second covers more distance, so the graph gets <b>steeper and steeper</b>. Steady speed (' + L.t[1] + '–' + L.t[2] + ' s): a <b>straight</b> piece. Slowing down (' + L.t[2] + '–' + L.t[3] + ' s): it <b>flattens out</b>. Draw that with a few short pieces.' },
          { dir: 'flat', text: 'stopped at the station' }], start: 0, startHint: 'The distance travelled starts at ' + t('0') + '.',
          prep: function (G) { return G.some(function (g) { return g.dir === 'down'; }) ? { code: 'story-dir', hint: 'Distance <b>travelled</b> can never go down — the train doesn’t reverse. (A graph that rises and falls copies the shape of the speed graph.) While the train moves the distance grows; when it stops the graph is flat.' } : G; } });
        return storyPart('Sketch the matching <b>distance travelled</b>–time graph for the same ' + L.t[4] + ' seconds. (Shape only — no numbers.)', spad({ xTitle: 'Time (s)', yTitle: 'Distance travelled' }), chk, poly([[0, 0], [2, 1], [3, 2], [6, 6], [7, 7], [9, 8], [12, 8]]),
          'Curve getting steeper (speeding up), straight line (steady speed), curve flattening out (slowing down), then <b>flat</b> (stopped). Distance travelled never goes down: the train doesn’t reverse.', ['What does speeding up look like on a distance graph? What does stopped look like?'], 'train: distance sketch',
          [poly([[0, 0], [2, 6], [6, 6], [8, 0], [12, 0]]), poly([[0, 0], [2, 1], [3, 2], [6, 6], [7, 7], [12, 8]]), poly([[0, 0], [3, 5], [9, 8], [12, 8]]), poly([[0, 0], [8, 8], [12, 8]]), poly([[0, 0], [2, 1], [3, 2], [6, 6], [12, 8]])]);
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
          // times are multiples of 5 so every corner sits on a 5-min gridline (e13c reads the stop off the graph)
          var a = r.pick([5, 10]), v1 = r.pick([30, 45, 60, 90]), L = r.pick([10, 15, 20, 30]), c = r.pick([5, 10]), st = r.pick([5, 10]), e = r.pick([5, 10]), v2 = r.pick([20, 30, 40, 50]), f = r.pick([10, 15]);
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
      { id: 'e14e', level: 'EMG', make: function (r, j) {
        var tb = j.t[2] + j.b, X = j.t[4] + 5, Y = j.d[2] + 1;
        var orig = [[0, 0], [j.t[1], j.d[1]], [j.t[2], j.d[1]], [j.t[2], j.d[2]], [j.t[3], j.d[2]], [j.t[4], 0]];
        var right = [[0, 0], [j.t[1], j.d[1]], [j.t[2], j.d[1]], [tb, j.d[2]], [j.t[3], j.d[2]], [j.t[4], 0]];
        var inp = { x: [0, X], y: [0, Y], grid: 5, gridY: 1, labels: 10, labelsY: 1, firstQuadrant: true, xName: ' ', yName: ' ', xTitle: 'Time (min)', yTitle: 'Distance from home (km)', unitX: 310 / X, unitY: 190 / Y,
          snapX: 5, snapY: 1, tools: ['line'], max: 380, bg: { segs: [{ pts: orig, dash: true, color: '#aab1bd' }] } };
        var shift = [[0, 0], [j.t[1], j.d[1]], [j.t[2], j.d[1]], [tb, j.d[2]], [j.t[3] + j.b, j.d[2]], [j.t[4] + j.b, 0]];
        var wr = [{ is: poly(shift), code: 'graph', hint: 'Keep everything else the same: only the jump changes. She still leaves at ' + t(j.t[3]) + ' min and is home at ' + t(j.t[4]) + ' min, so after the bus ride the flat part is just shorter.' }];
        if (j.t[2] - j.b >= j.t[1]) wr.push({ is: poly([[0, 0], [j.t[1], j.d[1]], [j.t[2] - j.b, j.d[1]], [j.t[2], j.d[2]], [j.t[3], j.d[2]], [j.t[4], 0]]), code: 'graph', hint: 'The bus leaves at ' + t(j.t[2]) + ' min, where the jump was, and takes ' + t(j.b) + ' min, so it arrives at ' + t(tb) + ' min.' });
        var exact = K.graphExact(poly(right), { wrong: wr });
        var chk = function (v) {
          if (DR.phases(v).vertical) return wrong('story-vertical', 'Your graph still has a vertical piece: that would mean covering ' + t((j.d[2] - j.d[1]) + units('km')) + ' in no time. The bus takes ' + t(j.b) + ' minutes, so draw a sloped segment from ' + t('(' + j.t[2] + ',\\ ' + j.d[1] + ')') + '.');
          var res = exact(v); if (res.v === 'wrong' && !res.hint) return wrong(res.code, 'Start from the student’s graph (dashed): keep every corner except the jump, which becomes a sloped segment from ' + t('(' + j.t[2] + ',\\ ' + j.d[1] + ')') + ' to ' + t('(' + tb + ',\\ ' + j.d[2] + ')') + '.');
          return res;
        };
        var pp = K.P.graph('The student meant that she covered the extra ' + t((j.d[2] - j.d[1]) + units('km')) + ' by bus, and that the bus ride took ' + t(j.b + units('min')) + '. Draw the corrected graph, keeping everything else the same. (The student’s graph is shown dashed.)', inp, chk, poly(right),
          'The jump becomes a sloped segment from ' + t('(' + j.t[2] + ',' + j.d[1] + ')') + ' to ' + t('(' + tb + ',' + j.d[2] + ')') + ' (' + t((j.d[2] - j.d[1]) + units('km')) + ' in ' + t(j.b + units('min')) + '); every other corner stays: ' + right.map(function (q) { return t('(' + q[0] + ',' + q[1] + ')'); }).join(', ') + '.',
          ['Which corners of the student’s graph stay the same?', 'Where does the bus ride start, and when does it end?'], 'vertical jump: redraw');
        pp.bad = [poly(orig), poly(shift), poly([[0, 0], [j.t[1], j.d[1]], [j.t[2], j.d[1]], [j.t[3], j.d[2]], [j.t[4], 0]]), poly(right.slice(0, 5))];
        return pp;
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
        var w = f.wideBottom, ph = [{ dir: 'up', text: 'the ' + (w ? 'wide' : 'narrow') + ' bottom half fills' }, { dir: 'up', text: 'the ' + (w ? 'narrow' : 'wide') + ' top half fills' }];
        if (w) ph[1].steeper = 0; else ph[0].steeper = 1;
        var base = K.graphStory({ phases: ph, start: 0, startHint: 'The flask starts empty: the water height starts at ' + t('0') + '.', end: 6, endHint: 'Fill it right to the top: the graph ends on the dashed line.',
          custom: function (S) { return near(S[0].y1, 3) ? null : { code: 'story-height', hint: 'The corner is where the width changes — at the shoulder, <b>half way up</b> to the dashed line (3 squares up).' }; } });
        var chk = function (v) {
          var P = DR.phases(v).phases;
          if (P.length && P.every(function (p) { return p.dir === 'up'; }) && P.length !== 2 && !DR.phases(v).gaps.length && !DR.notFunction(v)) return wrong('story-bend', P.length === 1 ? 'One straight line means the same width all the way up. The two halves have different widths, so the steepness changes at the shoulder: draw <b>two straight pieces</b>.' :
            'Each half is a cylinder with a constant width, so each half fills at a constant rate: draw <b>two straight pieces</b>, one for each half, meeting in a corner at the shoulder.');
          return base(v);
        };
        var inp = spad({ xTitle: 'Time', yTitle: 'Height of water', bg: { segs: [{ pts: [[0, 6], [12, 6]], dash: true, color: '#aab1bd' }] } });
        return storyPart('Sketch the height of the water against time, from empty to full. (The dashed line is the top of the flask; the shoulder is half way up.)', inp, chk, poly(w ? [[0, 0], [8, 3], [11, 6]] : [[0, 0], [3, 3], [11, 6]]),
          'Two straight pieces: a ' + (w ? '<b>gentle</b> one for the wide bottom, then a <b>steeper</b> one for the narrow top' : '<b>steep</b> one for the narrow bottom, then a <b>gentler</b> one for the wide top') + ', meeting in a corner at half the height.', ['Each half has a constant width. Which half rises faster?'], 'flask sketch',
          [poly(w ? [[0, 0], [3, 3], [11, 6]] : [[0, 0], [8, 3], [11, 6]]), poly([[0, 0], [11, 6]]), poly([[0, 0], [3, 1], [6, 3], [8, 5], [9, 6]]), poly(w ? [[0, 0], [6, 4], [8, 6]] : [[0, 0], [2, 4], [8, 6]]), poly(w ? [[0, 0], [8, 3], [10, 5]] : [[0, 0], [3, 3], [9, 5]])]);
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
