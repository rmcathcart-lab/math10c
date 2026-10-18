/* More graphical inputs (needs js/draw.js loaded first).
 *
 *   numplace  place labelled numbers approximately on a number line.
 *             input { type: 'numplace', min, max, step, labels, snap, items: [{ id, tex, label? }] }
 *             value { id: x, … } (unplaced items missing).
 *             K.numplace(targets {id: x}, { tol, tols: {id: tol}, hints: {id: hint}, order: true }) — order first, then
 *             each position within the tolerance (default 1/30 of the line).  K.P.numplace(prompt, inp, targets, sol, hints, text, opt).
 *   setsort   sort numbers into the nested real-number diagram (ℕ ⊂ 𝕎 ⊂ ℤ ⊂ ℚ, and ℚ̄, inside ℝ).
 *             input { type: 'setsort', items: [{ id, tex }] }   value { id: 'N'|'W'|'I'|'Q'|'Qbar', … }
 *             K.setsort(targets, { hints: {id: hint} }) — each number goes in the innermost set it belongs to.
 *             HW.draw.realSet(value) -> 'N'|'W'|'I'|'Q'|'Qbar' for a number (or [p,q] fraction; 'Qbar' if irrational:true).
 *             K.P.setsort(prompt, inp, targets, sol, hints, text, opt).
 *   domrange  a given graph with two number lines under it: shade the domain and the range.
 *             input { type: 'domrange', graph: HW.graph spec, dom: { min, max, step }, ran: { min, max, step }, v, w }
 *             value { domain: numlineValue, range: numlineValue }.  K.domrange(domTex, ranTex, opt);
 *             K.P.domrange(prompt, inp, domTex, ranTex, sol, hints, text, opt).
 *   areabox   an area (box) model: row terms down the side, column terms along the top, products in the boxes.
 *             input { type: 'areabox', rows: [tex|null], cols: [tex|null], cells: [[tex|null]], keys: 'poly', vars,
 *                     rowTitle, colTitle }   null = a box the student fills in.
 *             value { rows: [str], cols: [str], cells: [[str]] } (given entries included).
 *             K.areabox({ product: polyTex }) — every box = its row term × its column term, every entry one simplified
 *             term, and (when product is given) all the boxes add to the product. Any correct box is accepted
 *             (the rows/columns in any order, either sign choice).  K.P.areabox(prompt, inp, opt, key, sol, hints, text).
 *   tap points on a given graph (intercepts, where f(x) = b, a maximum …): graph pad in points mode with bg.
 *             K.graphPoints(targets [[x,y]], { what: 'x-intercept', wrong: [{ pts, code, hint }], pointHint(p) -> {code, hint}|null })
 *             K.P.points(prompt, inp, targets, sol, hints, text, opt).
 *   tiles with zero pairs: tilepad options zeroPairs: true (palette buttons that add a zero pair), start: {x2,x,one}
 *             (tiles already on the mat) and takeaway: true (a "Taken away" zone; tap a tile on the mat to take it away,
 *             tap it again to put it back; only zero pairs can be added). Value adds away: { x2, x, one } and raw.away.
 *             K.tileTakeaway(start, sub) — exactly the tiles of sub taken away.
 */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, P = HW.poly, D = HW.draw, ex = HW.ex;
  function r6(x) { return Math.round(x * 1e6) / 1e6; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function inputOf(type, inp) { var o = { type: type }; Object.keys(inp || {}).forEach(function (k) { o[k] = inp[k]; }); return o; }
  var COL = '#13807a', INK = '#2b3340';

  /* LaTeX -> plain text for SVG labels */
  D.texPlain = function (s) {
    s = String(s);
    for (var i = 0; i < 4; i++) s = s.replace(/\\sqrt\[3\]\{([^{}]*)\}/g, '∛$1').replace(/\\sqrt\[(\d+)\]\{([^{}]*)\}/g, function (m, n, a) { return n + '√' + a; }).replace(/\\sqrt\{([^{}]*)\}/g, '√$1').replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '$1/$2');
    return s.replace(/\\pi/g, 'π').replace(/\\overline\{([^{}]*)\}/g, '$1̅').replace(/\\left|\\right|\\,|\\!|\\ /g, '').replace(/\\(dots|ldots)/g, '…').replace(/\^\{?2\}?/g, '²').replace(/\^\{?3\}?/g, '³')
      .replace(/\\times/g, '×').replace(/\\cdot/g, '·').replace(/[{}]/g, '').replace(/-/g, '−').replace(/\\/g, '');
  };

  /* ================= numplace ================= */
  function npLayout(I, value) {
    var L = D.nlLayout(I), items = I.items || [], placed = items.filter(function (it) { return value && value[it.id] != null; });
    placed.sort(function (a, b) { return value[a.id] - value[b.id]; });
    var rows = [], boxes = {};
    placed.forEach(function (it) {
      var lab = it.label || D.texPlain(it.tex), w = Math.max(26, lab.length * 7.6 + 14), cx = L.X(+value[it.id]);
      cx = Math.max(w / 2 + 1, Math.min(L.W - w / 2 - 1, cx));
      var r = 0; while (rows[r] != null && rows[r] > cx - w / 2 - 4) r++; rows[r] = cx + w / 2;
      boxes[it.id] = { lab: lab, w: w, cx: cx, row: r, x: L.X(+value[it.id]) };
    });
    var nr = Math.max(1, rows.length), rowH = 24, top = nr * rowH + 6;
    return { L: L, boxes: boxes, nr: nr, rowH: rowH, top: top, H: top + L.H };
  }
  D.numplaceSvg = function (I, value, sel) {
    var G = npLayout(I, value || {}), L = G.L, off = G.top, s = '';
    var line = D.numlineSvg(I, { dots: [], shade: [] }); // reuse ticks: strip the outer svg
    var inner = line.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    s += '<g transform="translate(0,' + off + ')">' + inner + '</g>';
    Object.keys(G.boxes).forEach(function (id) {
      var b = G.boxes[id], y = (G.nr - 1 - b.row) * G.rowH + 2, on = sel === id;
      s += '<line x1="' + b.x + '" y1="' + (y + 20) + '" x2="' + b.x + '" y2="' + (off + L.y) + '" stroke="' + (on ? '#c4532a' : COL) + '" stroke-width="1.3"/>';
      s += '<circle cx="' + b.x + '" cy="' + (off + L.y) + '" r="4.2" fill="' + (on ? '#c4532a' : COL) + '"/>';
      s += '<g class="np-hit" data-id="' + HW.esc(id) + '"><rect x="' + (b.cx - b.w / 2) + '" y="' + y + '" width="' + b.w + '" height="20" rx="6" fill="' + (on ? '#fff1ea' : '#e3f1ef') + '" stroke="' + (on ? '#c4532a' : COL) + '" stroke-width="1.4"/><text x="' + b.cx + '" y="' + (y + 14.5) + '" font-size="13" text-anchor="middle" fill="#1c2230">' + HW.esc(b.lab) + '</text></g>';
    });
    return { svg: '<svg class="fig-svg nl-svg" viewBox="0 0 ' + L.W + ' ' + G.H + '" style="max-width:' + L.W + 'px" role="img" aria-label="number line with numbers placed">' + s + '</svg>', G: G };
  };
  K.numplace = function (targets, opt) {
    opt = opt || {};
    var ids = Object.keys(targets), span = (opt.max != null && opt.min != null) ? opt.max - opt.min : null;
    return function (resp) {
      resp = resp || {};
      var miss = ids.filter(function (id) { return resp[id] == null; });
      if (miss.length === ids.length) return form('empty', 'Place the numbers on the line: tap a number, then tap where it goes.');
      if (miss.length) return form('np-unplaced', 'Place every number — ' + (miss.length === 1 ? 'one is' : miss.length + ' are') + ' still waiting below the line.');
      var tolOf = function (id) { return (opt.tols && opt.tols[id] != null) ? opt.tols[id] : opt.tol != null ? opt.tol : (span || 10) / 30; };
      var texOf = function (id) { return (opt.tex && opt.tex[id]) || id; };
      var srt = ids.slice().sort(function (a, b) { return targets[a] - targets[b]; });
      if (opt.order !== false) for (var i = 0; i < srt.length; i++) for (var j = i + 1; j < srt.length; j++) {
        var a = srt[i], b = srt[j];
        if (targets[b] - targets[a] > 1e-9 && resp[a] > resp[b] + 1e-9) return wrong('np-order', 'Check the order: ' + t(texOf(a)) + ' is less than ' + t(texOf(b)) + ', so it goes to the <b>left</b> of it.' + (opt.hints && opt.hints[a] ? ' ' + opt.hints[a] : ''));
      }
      for (var k = 0; k < srt.length; k++) {
        var id = srt[k], d = resp[id] - targets[id];
        if (Math.abs(d) > tolOf(id) + 1e-9) return wrong('np-place', t(texOf(id)) + ' is too far to the ' + (d > 0 ? 'right' : 'left') + '.' + (opt.hints && opt.hints[id] ? ' ' + opt.hints[id] : ' Estimate it between two whole numbers first.'));
      }
      return ok();
    };
  };
  K.P.numplace = function (prompt, inp, targets, sol, hints, text, opt) {
    var I = inputOf('numplace', inp), tex = {}; (I.items || []).forEach(function (it) { tex[it.id] = it.tex; });
    var o = Object.assign({ min: I.min == null ? -5 : I.min, max: I.max == null ? 5 : I.max, tex: tex }, opt || {});
    var key = {}; Object.keys(targets).forEach(function (id) { var sn = I.snap || (I.step || 1) / 10; key[id] = r6(Math.round(targets[id] / sn) * sn); });
    return { prompt: prompt, input: I, check: K.numplace(targets, o), key: key, answer: D.numplaceSvg(I, key).svg, solution: sol, hints: hints || [], text: text,
      bad: [(function () { var b = {}, s = Object.keys(targets).sort(function (a, c) { return targets[a] - targets[c]; }); s.forEach(function (id, i) { b[id] = key[s[s.length - 1 - i]]; }); return b; })()].filter(function (b) { return Object.keys(b).some(function (id) { return Math.abs(b[id] - key[id]) > 1e-9; }); }) };
  };

  /* ================= setsort ================= */
  var SETS = ['N', 'W', 'I', 'Q', 'Qbar'], SETTEX = { N: '\\mathbb{N}', W: '\\mathbb{W}', I: '\\mathbb{I}', Q: '\\mathbb{Q}', Qbar: '\\overline{\\mathbb{Q}}' };
  var SETNAME = { N: 'Natural numbers', W: 'Whole numbers', I: 'Integers', Q: 'Rational numbers', Qbar: 'Irrational numbers' };
  D.SETTEX = SETTEX; D.SETNAME = SETNAME;
  D.realSet = function (x, irrational) {
    if (irrational) return 'Qbar';
    var v = Array.isArray(x) ? x[0] / x[1] : x;
    if (Math.abs(v - Math.round(v)) > 1e-12) return 'Q';
    return v > 0 ? 'N' : v === 0 ? 'W' : 'I';
  };
  var CHAIN = ['N', 'W', 'I', 'Q']; // nested, inner to outer
  function setHint(tex, put, want) {
    var x = t(tex);
    if (want === 'Qbar') return x + ' is <b>irrational</b>: it can’t be written as a fraction of integers — its decimal never ends and never repeats.';
    if (put === 'Qbar') return x + ' is <b>rational</b>: it can be written as a fraction of two integers' + (want === 'Q' ? ' (its decimal ends or repeats)' : '') + '.';
    var pi = CHAIN.indexOf(put), wi = CHAIN.indexOf(want);
    if (pi > wi) return 'Put each number in the <b>innermost</b> set it belongs to. ' + x + ' is ' + (want === 'N' ? 'a natural (counting) number' : want === 'W' ? 'a whole number' : 'an integer') + ', so it goes in a smaller box.';
    if (put === 'N' && want === 'W') return x + ' is a whole number but <b>not</b> a natural number — the natural numbers start at ' + t('1') + '.';
    if (want === 'I') return x + ' is negative, so it isn’t a ' + (put === 'N' ? 'natural' : 'whole') + ' number — it’s an integer.';
    return x + ' isn’t an integer — it’s between two integers, so it is rational but not an integer.';
  }
  K.setsort = function (targets, opt) {
    opt = opt || {};
    var ids = Object.keys(targets);
    return function (resp) {
      resp = resp || {};
      var miss = ids.filter(function (id) { return !resp[id]; });
      if (miss.length === ids.length) return form('empty', 'Sort the numbers: tap a number, then tap the set it belongs in.');
      if (miss.length) return form('ss-unplaced', 'Place every number — ' + (miss.length === 1 ? 'one is' : miss.length + ' are') + ' still waiting.');
      var bad = ids.filter(function (id) { return resp[id] !== targets[id]; });
      if (!bad.length) return ok();
      var id = bad[0], tex = (opt.tex && opt.tex[id]) || id, h = (opt.hints && opt.hints[id]) || setHint(tex, resp[id], targets[id]);
      var code = targets[id] === 'Qbar' || resp[id] === 'Qbar' ? 'ss-rational' : CHAIN.indexOf(resp[id]) > CHAIN.indexOf(targets[id]) ? 'ss-inner' : 'ss-subset';
      return wrong(code, (bad.length > 1 ? bad.length + ' numbers are in the wrong set. ' : '') + h);
    };
  };
  K.P.setsort = function (prompt, inp, targets, sol, hints, text, opt) {
    var I = inputOf('setsort', inp), tex = {}; (I.items || []).forEach(function (it) { tex[it.id] = it.tex; });
    var key = clone(targets), b1 = {}; Object.keys(targets).forEach(function (id) { b1[id] = targets[id] === 'Qbar' ? 'Q' : targets[id] === 'N' ? 'W' : 'Qbar'; });
    return { prompt: prompt, input: I, check: K.setsort(targets, Object.assign({ tex: tex }, opt || {})), key: key, answer: D.setsortHtml(I, key), solution: sol, hints: hints || [], text: text, bad: [b1] };
  };
  D.setsortHtml = function (I, value, live) {
    value = value || {};
    var items = I.items || [];
    function chips(z) { return items.filter(function (it) { return value[it.id] === z; }).map(function (it) { return '<button type="button" class="ss-chip" data-id="' + HW.esc(it.id) + '"' + (live ? '' : ' tabindex="-1"') + '>' + HW.k(it.tex) + '</button>'; }).join(''); }
    function box(z, inner) { return '<div class="ss-box ss-' + z + '" data-zone="' + z + '"><div class="ss-lab">' + HW.k(SETTEX[z]) + ' <em class="ss-name">' + SETNAME[z] + '</em></div><div class="ss-body">' + chips(z) + '</div>' + (inner || '') + '</div>'; }
    return '<div class="ss-diagram' + (live ? ' live' : '') + '"><div class="ss-box ss-R"><div class="ss-lab">' + HW.k('\\mathbb{R}') + ' <em class="ss-name">Real numbers</em></div><div class="ss-cols">' +
      box('Q', box('I', box('W', box('N')))) + box('Qbar') + '</div></div></div>';
  };

  /* ================= domrange ================= */
  K.domrange = function (domTex, ranTex, opt) {
    opt = opt || {};
    var v = opt.v || 'x', w = opt.w || 'y', cd = K.numline(domTex, { v: v }), cr = K.numline(ranTex, { v: w });
    var sw1 = K.numline(ranTex, { v: v }), sw2 = K.numline(domTex, { v: w });
    return function (resp) {
      resp = resp || {}; var dv = resp.domain || {}, rv = resp.range || {};
      var de = !(dv.dots || []).length && !(dv.shade || []).length, re = !(rv.dots || []).length && !(rv.shade || []).length;
      if (de && re) return form('empty', 'Show the domain on the first number line and the range on the second.');
      var a = de ? null : cd(dv), b = re ? null : cr(rv);
      if (a && a.v === 'correct' && b && b.v === 'correct') return ok();
      if (!de && !re && sw1(dv).v === 'correct' && sw2(rv).v === 'correct') return wrong('dr-swap', 'Domain and range are swapped: the <b>domain</b> is the ' + t(v) + '-values (left to right), the <b>range</b> the ' + t(w) + '-values (bottom to top).');
      if (de) return form('dr-nodomain', 'Now show the <b>domain</b> (the ' + t(v) + '-values) on the first number line.');
      if (a.v !== 'correct') return a.v === 'form' ? a : wrong('dr-' + (a.code || 'domain'), '<b>Domain:</b> ' + (a.hint || 'check the ' + t(v) + '-values the graph covers, from left to right.'));
      if (re) return form('dr-norange', 'Domain done — now show the <b>range</b> (the ' + t(w) + '-values) on the second number line.');
      return b.v === 'form' ? b : wrong('dr-' + (b.code || 'range'), '<b>Range:</b> ' + (b.hint || 'check the ' + t(w) + '-values the graph covers, from bottom to top.'));
    };
  };
  function drLines(I) { var g = I.graph || {}, xr = g.x || [-5, 5], yr = g.y || [-5, 5]; return { dom: Object.assign({ min: xr[0], max: xr[1], step: g.grid || 1 }, I.dom || {}), ran: Object.assign({ min: yr[0], max: yr[1], step: g.gridY || g.grid || 1 }, I.ran || {}) }; }
  D.domrangeHtml = function (I, value) {
    value = value || {}; var NL = drLines(I), v = I.v || 'x', w = I.w || 'y';
    return '<div class="dr-dr">' + HW.graph(Object.assign({ max: 300 }, I.graph || {})) + '<div class="dr-nlab">Domain (' + HW.k(v) + '-values)</div>' + D.numlineSvg(NL.dom, value.domain || {}) + '<div class="dr-nlab">Range (' + HW.k(w) + '-values)</div>' + D.numlineSvg(NL.ran, value.range || {}) + '</div>';
  };
  K.P.domrange = function (prompt, inp, domTex, ranTex, sol, hints, text, opt) {
    var I = inputOf('domrange', inp), NL = drLines(I), o = Object.assign({ v: I.v || 'x', w: I.w || 'y' }, opt || {});
    var parse = function (tx) { var r = HW.sets.parse(tx); if (!r.ok) throw new Error('bad set ' + tx); return D.setParts(r.set); };
    var key = { domain: D.numlineKey(parse(domTex)), range: D.numlineKey(parse(ranTex)) };
    return { prompt: prompt, input: I, check: K.domrange(domTex, ranTex, o), key: key, answer: D.domrangeHtml(I, key) + '<div>Domain ' + t(domTex) + ', range ' + t(ranTex) + '</div>', solution: sol, hints: hints || [], text: text,
      bad: [{ domain: key.range, range: key.domain }, { domain: key.domain, range: { dots: [], shade: [] } }] };
  };

  /* ================= tap points on a graph ================= */
  function keyP(p) { return r6(p[0]) + ',' + r6(p[1]); }
  K.graphPoints = function (targets, opt) {
    opt = opt || {};
    var T = {}; targets.forEach(function (p) { T[keyP(p)] = p; });
    var what = opt.what || 'point', whats = opt.whats || what + 's', n = targets.length;
    return function (resp) {
      var v = D.norm(resp);
      if (!v.pts.length && v.pieces.length) return form('pts-lines', 'Tap the points only — no lines needed.');
      if (!v.pts.length) return form('empty', 'Tap the ' + (n === 1 ? what : whats) + ' on the graph.');
      var S = {}; v.pts.forEach(function (p) { S[keyP(p)] = p; });
      var miss = Object.keys(T).filter(function (k) { return !S[k]; }), extra = Object.keys(S).filter(function (k) { return !T[k]; });
      if (!miss.length && !extra.length) return ok();
      var same = function (pts) { var A = {}; pts.forEach(function (p) { A[keyP(p)] = 1; }); return Object.keys(A).length === Object.keys(S).length && Object.keys(S).every(function (k) { return A[k]; }); };
      for (var i = 0; i < (opt.wrong || []).length; i++) if (same(opt.wrong[i].pts)) return wrong(opt.wrong[i].code || 'pts', opt.wrong[i].hint);
      for (var j = 0; j < extra.length; j++) {
        var p = S[extra[j]];
        if (opt.pointHint) { var h = opt.pointHint(p); if (h) return wrong(h.code || 'pts', h.hint); }
        if (T[keyP([p[1], p[0]])]) return wrong('graph-swap', 'Check ' + t(D.ptT(p)) + ': across first (' + t('x') + '), then up or down (' + t('y') + ').');
      }
      if (!extra.length) return wrong('pts-missing', 'Correct so far — but there ' + (n === 1 ? 'is one ' + what : 'are ' + n + ' ' + whats) + '. You have ' + (n - miss.length) + '.');
      return wrong('pts-extra', (extra.length === 1 ? t(D.ptT(S[extra[0]])) + ' isn’t ' + (/^[aeiou]/i.test(what) ? 'an ' : 'a ') + what + '.' : extra.length + ' of your points aren’t ' + whats + '.') + (opt.whatHint ? ' ' + opt.whatHint : ''));
    };
  };
  K.P.points = function (prompt, inp, targets, sol, hints, text, opt) {
    var I = inputOf('graphpad', Object.assign({ mode: 'points' }, inp)), key = { pts: targets.map(function (p) { return p.slice(); }), pieces: [], join: 'none' };
    var spec = {}; Object.keys(I).forEach(function (k) { if (['type', 'mode', 'tools', 'defaultEnd', 'join', 'snap', 'snapX', 'snapY', 'bg', 'help'].indexOf(k) < 0) spec[k] = I[k]; });
    var bg = I.bg || {}; spec.segs = (bg.segs || []).slice(); spec.fns = bg.fns || []; spec.points = (bg.points || []).concat(targets.map(function (p) { return { x: p[0], y: p[1], color: '#c4532a' }; })); spec.max = 300;
    return { prompt: prompt, input: I, check: K.graphPoints(targets, opt), key: key, answer: HW.graph(spec) + '<div>' + targets.map(function (p) { return t(D.ptT(p)); }).join(', ') + '</div>', solution: sol, hints: hints || [], text: text };
  };

  /* ================= tiles: take away ================= */
  function cnt(p, k) { return (p[k] && p[k].c[0] / p[k].c[1]) || 0; }
  function tilePoly(s) { if (typeof s === 'string') return P.lift(s); return P.add(P.add(P.mono([s.x2 || 0, 1], { x: 2 }), P.mono([s.x || 0, 1], { x: 1 })), P.num(s.one != null ? s.one : s['1'] || 0)); }
  D.tilePoly = tilePoly;
  K.tileTakeaway = function (start, sub) {
    var SP = tilePoly(sub), want = HW.tiles.count({ x2: cnt(SP, 'x2'), x: cnt(SP, 'x1'), one: cnt(SP, '') }).sort().join(',');
    return function (resp) {
      resp = resp || {}; var away = ((resp.raw || {}).away || []).slice();
      if (!away.length) return form('empty', 'Take away the tiles of ' + t(P.tex(SP)) + ': tap them on the mat. Add zero pairs first if you need tiles that aren’t there.');
      if (away.slice().sort().join(',') === want) return ok();
      var a = { x2: 0, x: 0, one: 0 }; away.forEach(function (tk) { var n = tk.charAt(0) === '-' ? -1 : 1, k = tk.replace('-', ''); a[k === 'x2' ? 'x2' : k === 'x' ? 'x' : 'one'] += n; });
      var S = SP, c = cnt;
      if (a.x2 === c(S, 'x2') && a.x === c(S, 'x1') && a.one === c(S, '')) return wrong('tile-away-zero', 'You took away a zero pair as well. Take away <b>only</b> the tiles of ' + t(P.tex(S)) + '.');
      return wrong('tile-away', 'Take away exactly the tiles of ' + t(P.tex(S)) + ' — no more, no less. If the mat doesn’t have them, add zero pairs first.');
    };
  };
  if (HW.addCodes) HW.addCodes({ 'np-order': 'Numbers out of order on the line', 'np-place': 'Number placed too far off', 'ss-inner': 'Not the innermost set', 'ss-subset': 'Put in a set it isn’t in', 'ss-rational': 'Rational vs irrational', 'dr-swap': 'Domain and range swapped',
    'pts-missing': 'Missed a point', 'pts-extra': 'Tapped a wrong point', 'tile-away': 'Took away the wrong tiles', 'tile-away-zero': 'Took away an extra zero pair', 'ab-sign': 'Area box: sign of a product', 'ab-exp': 'Area box: exponents', 'ab-add': 'Area box: added instead of multiplied',
    'ab-cell': 'Area box: wrong product', 'ab-sum': 'Area box: boxes don’t add to the expression', 'ab-one-term': 'Area box: more than one term in a box' });

  /* ================= areabox ================= */
  function readTerm(s) {
    s = String(s == null ? '' : s).replace(/\\left|\\right/g, '').trim(); if (!s) return { empty: true };
    var a = ex.parse(s); if (!a.ok) return { bad: true };
    var r = P.read(a.ast); if (!r.ok) return { bad: true };
    return { p: r.p, ast: a.ast, n: P.terms ? P.terms(r.p).length : Object.keys(r.p).length };
  }
  K.areabox = function (opt) {
    opt = opt || {}; var T = opt.product != null ? P.lift(opt.product) : null;
    return function (resp) {
      resp = resp || {}; var R = resp.rows || [], C = resp.cols || [], M = resp.cells || [];
      var nr = R.length, nc = C.length, all = [], i, j;
      for (i = 0; i < nr; i++) all.push(['row', i, R[i]]); for (j = 0; j < nc; j++) all.push(['col', j, C[j]]);
      for (i = 0; i < nr; i++) for (j = 0; j < nc; j++) all.push(['cell', i, (M[i] || [])[j], j]);
      var rd = all.map(function (e) { return readTerm(e[2]); });
      if (rd.some(function (r) { return r.empty; })) return form('empty', 'Fill in every box.');
      if (rd.some(function (r) { return r.bad; })) return form('unreadable', 'One of the boxes can’t be read — check the signs and exponents.');
      for (var k = 0; k < rd.length; k++) {
        if (rd[k].n > 1) return wrong('ab-one-term', 'Each box (and each row and column label) holds <b>one</b> term.');
        var fi = P.formIssue(rd[k].ast); if (fi && fi.code !== 'not-poly') return form('ab-simplify', 'Simplify each box to a single term, like ' + t('-6x^{2}') + '.');
      }
      var rows = rd.slice(0, nr).map(function (r) { return r.p; }), cols = rd.slice(nr, nr + nc).map(function (r) { return r.p; }), cell = function (i2, j2) { return rd[nr + nc + i2 * nc + j2].p; };
      var sumCheck = function () { if (!T) return null; var sum = P.num(0); for (var i3 = 0; i3 < nr; i3++) for (var j3 = 0; j3 < nc; j3++) sum = P.add(sum, cell(i3, j3)); return P.eq(sum, T) ? null : wrong('ab-sum', 'All the boxes together must add up to ' + t(P.tex(T)) + '. ' + (opt.sumHint || 'Check the boxes you filled in.')); };
      if (opt.factor) { var sc = sumCheck(); if (sc) return sc; }
      for (i = 0; i < nr; i++) for (j = 0; j < nc; j++) {
        var want = P.mul(rows[i], cols[j]), got = cell(i, j), where = 'the box in row ' + (i + 1) + ', column ' + (j + 1);
        if (P.eq(want, got)) continue;
        if (P.eq(P.neg(want), got)) return wrong('ab-sign', 'Check the sign in ' + where + ': a positive times a negative is negative; two negatives make a positive.');
        if (P.eq(P.add(rows[i], cols[j]), got)) return wrong('ab-add', 'In ' + where + ', <b>multiply</b> the row term by the column term — don’t add them.');
        var cw = P.terms(want)[0], cg = P.terms(got)[0];
        if (cw && cg && cw.c[0] * cg.c[1] === cg.c[0] * cw.c[1]) return wrong('ab-exp', 'Check the exponent in ' + where + ': multiplying adds exponents (' + t('x\\cdot x=x^{2}') + ').');
        return wrong('ab-cell', T && opt.factor ? 'Check ' + where + ': each box must equal its row term times its column term. Choose the row and column terms as common factors of the boxes.' : 'Check ' + where + ': it is the row term times the column term.');
      }
      return sumCheck() || ok();
    };
  };
  D.areaboxHtml = function (I, v) {
    v = v || {}; var R = v.rows || I.rows || [], C = v.cols || I.cols || [], M = v.cells || I.cells || [];
    var cellT = function (s) { return s == null || s === '' ? '&nbsp;' : HW.k(s); };
    var h = '<table class="ab-table"><tr><th class="ab-corner">' + (I.corner ? HW.k(I.corner) : HW.k('\\times')) + '</th>' + C.map(function (c) { return '<th class="ab-head">' + cellT(c) + '</th>'; }).join('') + '</tr>';
    R.forEach(function (r, i) { h += '<tr><th class="ab-head">' + cellT(r) + '</th>' + C.map(function (c, j) { return '<td class="ab-cell">' + cellT((M[i] || [])[j]) + '</td>'; }).join('') + '</tr>'; });
    return h + '</table>';
  };
  K.P.areabox = function (prompt, inp, opt, key, sol, hints, text) {
    var I = inputOf('areabox', inp);
    return { prompt: prompt, input: I, check: K.areabox(opt), key: key, answer: D.areaboxHtml(I, key), solution: sol, hints: hints || [], text: text };
  };

  /* ================= widgets (browser only) ================= */
  var W = HW.widgets; if (!W || typeof document === 'undefined') return;
  var el = HW.el;
  function btn(label, cls, title) { var b = el('button', 'dr-btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; if (title) b.title = title; return b; }
  function svgPoint(svg, ev) { var pt = svg.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY; var m = svg.getScreenCTM(); return m ? pt.matrixTransform(m.inverse()) : { x: 0, y: 0 }; }

  /* ---------- numplace ---------- */
  W.numplace = function (opt) {
    opt = opt || {};
    var items = opt.items || [], L = D.nlLayout(opt), snap = opt.snap || (L.step || 1) / 10;
    var wrap = el('div', 'w-numplace'), tray = el('div', 'np-tray'), board = el('div', 'dr-board'), bar = el('div', 'dr-bar'), help = el('div', 'w-help');
    var state = {}, sel = null, hist = [], disabled = false;
    var undoB = btn('Undo', 'dr-act'), clearB = btn('Clear', 'dr-act'); bar.appendChild(undoB); bar.appendChild(clearB);
    undoB.addEventListener('click', function () { if (disabled || !hist.length) return; state = JSON.parse(hist.pop()); autoSel(); render(); });
    clearB.addEventListener('click', function () { if (disabled) return; push(); state = {}; sel = null; autoSel(); render(); });
    help.innerHTML = opt.help || 'Tap a number below the line (the highlighted one is next), then tap where it belongs on the line. Tap a placed number to move it.';
    wrap.appendChild(board); wrap.appendChild(tray); wrap.appendChild(bar); wrap.appendChild(help);
    function push() { hist.push(JSON.stringify(state)); if (hist.length > 60) hist.shift(); }
    function autoSel() { if (sel && state[sel] == null) return; var nx = items.filter(function (it) { return state[it.id] == null; })[0]; sel = nx ? nx.id : null; }
    function render() {
      var out = D.numplaceSvg(opt, state, sel); board.innerHTML = out.svg;
      var svg = board.querySelector('svg'); svg.classList.add('dr-svg'); svg.style.touchAction = 'none';
      var ghost = document.createElementNS('http://www.w3.org/2000/svg', 'g'); svg.appendChild(ghost);
      var off = out.G.top, down = false;
      var xOf = function (ev) { var p = svgPoint(svg, ev); var x = (p.x - L.padX) / (L.W - 2 * L.padX) * (L.max - L.min) + L.min; return r6(Math.max(L.min, Math.min(L.max, Math.round(x / snap) * snap))); };
      var show = function (x) { ghost.innerHTML = x == null || !sel ? '' : '<line x1="' + L.X(x) + '" y1="' + (off + L.y - 12) + '" x2="' + L.X(x) + '" y2="' + (off + L.y + 12) + '" stroke="#c4532a" stroke-width="2" stroke-dasharray="3 2"/>'; };
      Array.prototype.forEach.call(svg.querySelectorAll('.np-hit'), function (g) { g.style.cursor = 'pointer'; g.addEventListener('pointerdown', function (e) { e.stopPropagation(); }); g.addEventListener('click', function (e) { e.stopPropagation(); if (disabled) return; sel = g.getAttribute('data-id'); render(); }); });
      svg.addEventListener('pointerdown', function (ev) { if (disabled) return; ev.preventDefault(); down = true; show(xOf(ev)); });
      svg.addEventListener('pointermove', function (ev) { if (!disabled && (down || ev.pointerType === 'mouse')) show(xOf(ev)); });
      svg.addEventListener('pointerleave', function () { if (!down) show(null); });
      svg.addEventListener('pointerup', function (ev) { if (disabled || !down) return; down = false; if (!sel) { help.innerHTML = '<b>Tap a number first</b>, then tap the line.'; return; } push(); state[sel] = xOf(ev); var just = sel; sel = null; autoSel(); if (sel === just) sel = null; render(); });
      tray.innerHTML = '';
      var left = items.filter(function (it) { return state[it.id] == null; });
      if (!left.length) tray.appendChild(el('span', 'muted np-done', 'All placed — tap a number on the line to move it.'));
      left.forEach(function (it) { var c = el('button', 'np-chip' + (sel === it.id ? ' on' : ''), HW.k(it.tex)); c.type = 'button'; c.addEventListener('click', function () { if (disabled) return; sel = it.id; render(); }); tray.appendChild(c); });
      undoB.disabled = !hist.length;
    }
    autoSel(); render();
    var api = { node: wrap, kind: 'numplace' };
    api.value = function () { return clone(state); }; api.set = function (v) { state = clone(v || {}); sel = null; autoSel(); render(); };
    api.clear = function () { state = {}; hist = []; sel = null; autoSel(); render(); }; api.disable = function (on) { disabled = !!on; wrap.classList.toggle('off', disabled); };
    api.focus = function () {}; api.onEnter = function () {};
    return api;
  };
  W.numplace.text = function (v, I) { v = v || {}; return Object.keys(v).sort(function (a, b) { return v[a] - v[b]; }).map(function (id) { var it = ((I && I.items) || []).filter(function (x) { return x.id === id; })[0]; return (it ? (it.label || D.texPlain(it.tex)) : id) + ' at ' + v[id]; }).join(', '); };
  W.numplace.html = function (v, I) { return D.numplaceSvg(I, v).svg; };

  /* ---------- setsort ---------- */
  W.setsort = function (opt) {
    opt = opt || {};
    var items = opt.items || [], wrap = el('div', 'w-setsort'), tray = el('div', 'np-tray'), board = el('div', 'ss-board'), bar = el('div', 'dr-bar'), help = el('div', 'w-help');
    var state = {}, sel = null, hist = [], disabled = false;
    var undoB = btn('Undo', 'dr-act'), clearB = btn('Clear', 'dr-act'); bar.appendChild(undoB); bar.appendChild(clearB);
    undoB.addEventListener('click', function () { if (disabled || !hist.length) return; state = JSON.parse(hist.pop()); sel = null; autoSel(); render(); });
    clearB.addEventListener('click', function () { if (disabled) return; push(); state = {}; sel = null; autoSel(); render(); });
    help.innerHTML = opt.help || 'Tap a number (the highlighted one is next), then tap the <b>innermost</b> set it belongs to. Tap a placed number to move it.';
    wrap.appendChild(tray); wrap.appendChild(board); wrap.appendChild(bar); wrap.appendChild(help);
    function push() { hist.push(JSON.stringify(state)); }
    function autoSel() { if (sel && !state[sel]) return; var nx = items.filter(function (it) { return !state[it.id]; })[0]; sel = nx ? nx.id : null; }
    function render() {
      board.innerHTML = D.setsortHtml(opt, state, true);
      Array.prototype.forEach.call(board.querySelectorAll('.ss-chip'), function (c) { if (c.getAttribute('data-id') === sel) c.classList.add('on'); c.addEventListener('click', function (e) { e.stopPropagation(); if (disabled) return; var id = c.getAttribute('data-id'); sel = sel === id ? null : id; render(); }); });
      Array.prototype.forEach.call(board.querySelectorAll('.ss-box[data-zone]'), function (b) { b.addEventListener('click', function (e) { if (disabled) return; if (e.target.closest('.ss-box[data-zone]') !== b) return; if (!sel) { help.innerHTML = '<b>Tap a number first</b>, then tap its set.'; return; } push(); state[sel] = b.getAttribute('data-zone'); sel = null; autoSel(); render(); }); });
      board.querySelector('.ss-diagram').classList.toggle('armed', !!sel);
      tray.innerHTML = '';
      var left = items.filter(function (it) { return !state[it.id]; });
      if (!left.length) tray.appendChild(el('span', 'muted np-done', 'All sorted — tap a number to move it.'));
      left.forEach(function (it) { var c = el('button', 'np-chip' + (sel === it.id ? ' on' : ''), HW.k(it.tex)); c.type = 'button'; c.addEventListener('click', function () { if (disabled) return; sel = it.id; render(); }); tray.appendChild(c); });
      undoB.disabled = !hist.length;
    }
    autoSel(); render();
    var api = { node: wrap, kind: 'setsort' };
    api.value = function () { return clone(state); }; api.set = function (v) { state = clone(v || {}); sel = null; autoSel(); render(); };
    api.clear = function () { state = {}; hist = []; sel = null; autoSel(); render(); }; api.disable = function (on) { disabled = !!on; wrap.classList.toggle('off', disabled); };
    api.focus = function () {}; api.onEnter = function () {};
    return api;
  };
  W.setsort.text = function (v, I) { v = v || {}; return Object.keys(v).map(function (id) { var it = ((I && I.items) || []).filter(function (x) { return x.id === id; })[0]; return (it ? D.texPlain(it.tex) : id) + ' → ' + SETNAME[v[id]]; }).join(', '); };
  W.setsort.html = function (v, I) { return D.setsortHtml(I, v); };

  /* ---------- domrange ---------- */
  W.domrange = function (opt) {
    opt = opt || {};
    var NL = drLines(opt), v = opt.v || 'x', w = opt.w || 'y', wrap = el('div', 'w-domrange');
    var g = el('div', 'dr-dr-graph', HW.graph(Object.assign({ max: 320 }, opt.graph || {})));
    var nd = W.numline(NL.dom), nr = W.numline(NL.ran);
    wrap.appendChild(g); wrap.appendChild(el('div', 'dr-nlab', '<b>Domain</b> (' + HW.k(v) + '-values, left to right)')); wrap.appendChild(nd.node);
    wrap.appendChild(el('div', 'dr-nlab', '<b>Range</b> (' + HW.k(w) + '-values, bottom to top)')); wrap.appendChild(nr.node);
    var api = { node: wrap, kind: 'domrange' };
    api.value = function () { return { domain: nd.value(), range: nr.value() }; };
    api.set = function (x) { x = x || {}; nd.set(x.domain); nr.set(x.range); };
    api.clear = function () { nd.clear(); nr.clear(); }; api.disable = function (on) { nd.disable(on); nr.disable(on); wrap.classList.toggle('off', !!on); };
    api.focus = function () {}; api.onEnter = function () {};
    return api;
  };
  W.domrange.text = function (x) { x = x || {}; return 'domain ' + W.numline.text(x.domain || {}) + '; range ' + W.numline.text(x.range || {}); };
  W.domrange.html = function (x, I) { return D.domrangeHtml(I, x); };

  /* ---------- areabox ---------- */
  W.areabox = function (opt) {
    opt = opt || {};
    var R = opt.rows || [], C = opt.cols || [], M = opt.cells || [], keys = opt.keys || 'poly', enter = null;
    var wrap = el('div', 'w-areabox'), tbl = el('table', 'ab-table ab-live'), boxes = [], active = null;
    function mk(given, cls) {
      var td = el(cls === 'ab-cell' ? 'td' : 'th', cls);
      if (given != null) { td.innerHTML = HW.k(given); td.classList.add('given'); return { td: td, get: function () { return given; } }; }
      var m = W.math({ keys: keys, vars: opt.vars || ['x'], keypad: false, placeholder: ' ' }); m.node.classList.add('ab-math'); td.appendChild(m.node);
      var b = { td: td, w: m, get: function () { return String(m.value() || '').trim(); } };
      m.node.addEventListener('focusin', function () { active = b; mark(); }); m.node.addEventListener('pointerdown', function () { active = b; mark(); });
      m.onEnter(function () { var i = boxes.indexOf(b); for (var j = i + 1; j < boxes.length; j++) if (!boxes[j].get()) { boxes[j].w.focus(); active = boxes[j]; mark(); return; } if (enter) enter(); });
      boxes.push(b); if (!active) active = b; return b;
    }
    function mark() { boxes.forEach(function (b) { b.td.classList.toggle('act', b === active); }); }
    var hr = el('tr'), corner = el('th', 'ab-corner', opt.corner ? HW.k(opt.corner) : HW.k('\\times')); hr.appendChild(corner);
    var colB = C.map(function (c) { var b = mk(c, 'ab-head'); hr.appendChild(b.td); return b; }); tbl.appendChild(hr);
    var rowB = [], cellB = [];
    R.forEach(function (r, i) { var tr = el('tr'), b = mk(r, 'ab-head'); tr.appendChild(b.td); rowB.push(b); cellB.push(C.map(function (c, j) { var cb = mk((M[i] || [])[j], 'ab-cell'); tr.appendChild(cb.td); return cb; })); tbl.appendChild(tr); });
    var scroll = el('div', 'ab-scroll'); scroll.appendChild(tbl); wrap.appendChild(scroll);
    if (opt.rowTitle || opt.colTitle) wrap.appendChild(el('div', 'w-help', HW.tex((opt.colTitle ? 'Along the top: ' + opt.colTitle + '. ' : '') + (opt.rowTitle ? 'Down the side: ' + opt.rowTitle + '.' : ''))));
    if (boxes.length) {
      var ks = W.KEYSETS[keys]; if (typeof ks === 'function') ks = ks({ vars: opt.vars || ['x'] });
      var kp = W.keypad(ks.map(function (r) { return r.slice(); }), function (k) { if (k.fn === 'enter') { if (enter) enter(); return; } if (active) active.w.press(k); });
      kp.classList.add('kp-small'); wrap.appendChild(kp);
      wrap.appendChild(el('div', 'w-help', opt.help || 'Tap a box, then type its term. Each box is its row term × its column term.'));
    }
    mark();
    var api = { node: wrap, kind: 'areabox' };
    api.value = function () { return { rows: rowB.map(function (b) { return b.get(); }), cols: colB.map(function (b) { return b.get(); }), cells: cellB.map(function (r) { return r.map(function (b) { return b.get(); }); }) }; };
    api.set = function (v) { v = v || {}; var put = function (b, s) { if (b.w && s != null) b.w.set(s); }; (v.rows || []).forEach(function (s, i) { if (rowB[i]) put(rowB[i], s); }); (v.cols || []).forEach(function (s, j) { if (colB[j]) put(colB[j], s); }); (v.cells || []).forEach(function (r, i) { (r || []).forEach(function (s, j) { if (cellB[i] && cellB[i][j]) put(cellB[i][j], s); }); }); };
    api.clear = function () { boxes.forEach(function (b) { b.w.clear(); }); };
    api.disable = function (on) { wrap.classList.toggle('off', !!on); boxes.forEach(function (b) { b.w.disable(on); }); };
    api.focus = function () { if (boxes[0]) boxes[0].w.focus(); }; api.onEnter = function (fn) { enter = fn; };
    return api;
  };
  W.areabox.text = function (v) { v = v || {}; return (v.cells || []).map(function (r, i) { return (v.rows || [])[i] + ': ' + r.join(' | '); }).join('; ') + ' (top: ' + (v.cols || []).join(', ') + ')'; };
  W.areabox.html = function (v, I) { return D.areaboxHtml(I, v); };
})(window);
