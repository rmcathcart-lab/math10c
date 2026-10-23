/* Math 10C · Unit 9 · Lesson 1 — Right-Triangle Trigonometry: Sine, Cosine, and Tangent (M4)
 * Assignment questions 1–12 (u9_L01.tex) and the Lesson 1 Extra Practice (u9_EP01.tex, questions 1–18).
 * Every part is a generator: the booklet's triangle is one of the possible versions; the vertex names, the
 * orientation of the figure and the Pythagorean triple change. Wrong answers are matched against the other five
 * side ratios of the triangle, so the classic slips (opp/adj swapped = the other acute angle, sin/cos swapped,
 * ratio upside down, hypotenuse used in a tangent, a leg used as the hypotenuse) get targeted hints.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, ex = HW.ex, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, TG = HW.trig;

  HW.addCodes({
    'opp-adj-swap': 'Opposite and adjacent swapped (used the other acute angle)',
    'sin-cos-swap': 'Sine and cosine swapped',
    'ratio-flip': 'Trig ratio upside down',
    'tan-hyp': 'Used the hypotenuse in a tangent',
    'hyp-wrong': 'Hypotenuse misidentified (a leg used as the hypotenuse)',
    'side-dup': 'Gave one side two names',
    'pyth-add': 'Added squares when a leg was missing',
    'pyth-sub': 'Subtracted squares when the hypotenuse was missing',
    'pyth-noroot': 'Forgot the square root (Pythagorean theorem)',
    'legs-added': 'Added the side lengths instead of using the Pythagorean theorem',
    'scale-flip': 'Scale factor upside down',
    'use-scale': 'Used the calculator instead of the scale factor',
    radian: 'Calculator in radian mode',
    'other-angle': 'Found the other acute angle',
    'early-round': 'Rounded an intermediate value too early',
    'sin-tan-swap': 'Sine and tangent swapped',
    'quot-flip': 'Divided the ratios the wrong way round',
    'product-sum': 'Added instead of multiplying'
  });

  /* ---------- triangles ---------- */
  var PRIM = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41], [28, 45, 53], [11, 60, 61], [16, 63, 65], [33, 56, 65], [48, 55, 73], [13, 84, 85], [36, 77, 85], [39, 80, 89], [65, 72, 97], [60, 91, 109]];
  function trip(a, b) { for (var i = 0; i < PRIM.length; i++) if (PRIM[i][0] === a && PRIM[i][1] === b) return PRIM[i]; return null; }
  var LETS = [['A', 'B', 'C'], ['D', 'E', 'F'], ['G', 'H', 'I'], ['J', 'K', 'L'], ['K', 'L', 'M'], ['L', 'M', 'N'], ['M', 'N', 'P'], ['P', 'Q', 'R'], ['Q', 'R', 'S'], ['R', 'S', 'T'], ['S', 'T', 'U'], ['U', 'V', 'W'], ['D', 'E', 'G'], ['F', 'G', 'H']];
  function sn(p, q) { return [p, q].sort().join(''); }
  /* vertex roles: A = reference angle, B = other acute angle, R = right angle.
   * how: 'any' (random), 'mid' (right angle at the middle letter), 'last' (right angle at the last letter) */
  function names(r, how, set) {
    var L = set || r.pick(LETS);
    if (how === 'mid') return r.chance(0.5) ? { A: L[0], B: L[2], R: L[1] } : { A: L[2], B: L[0], R: L[1] };
    if (how === 'last') return r.chance(0.5) ? { A: L[0], B: L[1], R: L[2] } : { A: L[1], B: L[0], R: L[2] };
    var s = r.shuffle(L); return { A: s[0], B: s[1], R: s[2] };
  }
  /* o = side opposite A, a = side adjacent to A, h = hypotenuse */
  function tri(nm, o, a, h) { return { A: nm.A, B: nm.B, R: nm.R, o: o, a: a, h: h, opp: sn(nm.B, nm.R), adj: sn(nm.A, nm.R), hyp: sn(nm.A, nm.B) }; }
  function other(T) { return tri({ A: T.B, B: T.A, R: T.R }, T.a, T.o, T.h); }
  /* a triangle from a triple; legs assigned to opp/adj at random unless oppShort is given */
  function fromTriple(r, nm, tr, k, oppShort) {
    k = k || 1; var s = oppShort == null ? r.chance(0.5) : oppShort;
    var x = cl(tr[0] * k), y = cl(tr[1] * k), h = cl(tr[2] * k);
    return s ? tri(nm, x, y, h) : tri(nm, y, x, h);
  }
  function cl(x) { return Number(x.toFixed(6)); }
  function nf(x) { return HW.fmt(cl(x)); }

  /* ---------- exact fractions of (possibly decimal) lengths ---------- */
  function nd(x) { var s = String(cl(x)), i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1; }
  function frc(p, q) { var d = Math.max(nd(p), nd(q)), s = Math.pow(10, d); return ex.norm(Math.round(p * s), Math.round(q * s)); }
  function fT(p, q) { return ex.texRat(frc(p, q)); }
  function uT(p, q) { return '\\frac{' + nf(p) + '}{' + nf(q) + '}'; }
  function steps(p, q) { // 3.6/4.5 = 36/45 = 4/5
    var out = uT(p, q), d = Math.max(nd(p), nd(q)), s = Math.pow(10, d);
    if (d) out += '=\\frac{' + Math.round(p * s) + '}{' + Math.round(q * s) + '}';
    var f = frc(p, q); if (f[0] !== Math.round(p * s) || f[1] !== Math.round(q * s)) out += '=' + ex.texRat(f);
    return out;
  }

  /* ---------- figures ---------- */
  function xf(raw, rot, flip) {
    var c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180), out = {};
    Object.keys(raw).forEach(function (k) { var x = raw[k][0], y = raw[k][1]; if (flip) x = -x; out[k] = [x * c - y * s, x * s + y * c]; });
    return out;
  }
  function ori(r, tilt) { return { rot: r.pick([0, 90, 180, 270]) + (tilt ? r.pick([-27, -17, 17, 27]) : 0), flip: r.chance(0.5) }; }
  /* o: { rot, flip, lab: { o, a, h }, angA, angB, names (false hides), width, shape: [run, rise] } */
  function triFig(T, o) {
    o = o || {};
    var w = o.shape ? o.shape[0] : T.a, hh = o.shape ? o.shape[1] : T.o, q = Math.max(0.38, Math.min(2.6, hh / w));
    var W = q >= 1 ? 4 / q : 4, H = W * q, raw = {};
    raw[T.R] = [0, 0]; raw[T.A] = [W, 0]; raw[T.B] = [0, H];
    var lab = o.lab || {};
    var segs = [[T.B, T.R, lab.o], [T.A, T.R, lab.a], [T.A, T.B, lab.h]].map(function (s) { return s[2] == null ? [s[0], s[1]] : [s[0], s[1], String(s[2])]; });
    var angs = []; if (o.angA) angs.push([T.A, T.B, T.R, o.angA]); if (o.angB) angs.push([T.B, T.A, T.R, o.angB]);
    return '<div class="fig" style="text-align:center;margin:6px 0">' + HW.fig({ pts: xf(raw, o.rot || 0, o.flip), segs: segs, right: [[T.R, T.A, T.B]], angles: angs, names: o.names === false ? false : o.vnames || true, width: o.width || 250, aria: 'right triangle' }) + '</div>';
  }
  function labs(T) { return { o: nf(T.o), a: nf(T.a), h: nf(T.h) }; }
  function twoFigs(a, b) { return '<div style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:flex-start"><div style="flex:1 1 190px;max-width:250px">' + a + '</div><div style="flex:1 1 190px;max-width:250px">' + b + '</div></div>'; }

  /* ---------- ratios and their classic mix-ups ---------- */
  var FUN = { sin: 'oh', cos: 'ah', tan: 'oa' }, OTHER = { sin: 'ah', cos: 'oh', tan: 'ao' };
  var FT = { sin: '\\sin', cos: '\\cos', tan: '\\tan' };
  var RULE = { sin: '\\sin=\\frac{\\text{opp}}{\\text{hyp}}', cos: '\\cos=\\frac{\\text{adj}}{\\text{hyp}}', tan: '\\tan=\\frac{\\text{opp}}{\\text{adj}}' };
  var IDS = ['oh', 'ah', 'oa', 'ao', 'ho', 'ha'];
  function pair(T, id) { var m = { o: T.o, a: T.a, h: T.h }; return [m[id[0]], m[id[1]]]; }
  function rv(T, id) { var p = pair(T, id); return p[0] / p[1]; }
  function whichId(T, v, approx) {
    if (!isFinite(v)) return null;
    for (var i = 0; i < IDS.length; i++) if (Math.abs(v - rv(T, IDS[i])) < (approx ? 0.006 : 1e-9) * Math.max(1, Math.abs(v))) return IDS[i];
    return null;
  }
  /* diagnosis of one ratio: f = the ratio asked for, g = the side ratio the student actually gave.
   * show(id) renders that ratio (side names or numbers), ang = the angle (LaTeX) */
  function rdiag(f, g, show, ang) {
    if (!g || g === FUN[f]) return null;
    var touch = ' — the opposite side is the one that does <b>not</b> touch ' + t(ang);
    if (f === 'sin' || f === 'cos') {
      if (g === OTHER[f]) return { code: 'sin-cos-swap', hint: t(show(g)) + ' is ' + (f === 'sin' ? 'adj over hyp — that’s the <b>cosine</b>. Sine is <b>opp</b> over hyp (SOH)' + touch : 'opp over hyp — that’s the <b>sine</b>. Cosine is <b>adj</b> over hyp (CAH): the adjacent side touches ' + t(ang) + ' and isn’t the hypotenuse') + '.' };
      if (g === 'oa' || g === 'ao') return { code: 'hyp-wrong', hint: 'The bottom of a ' + (f === 'sin' ? 'sine' : 'cosine') + ' is the <b>hypotenuse</b> — the side across from the right angle (the longest side). ' + t(show(g)) + ' uses the two legs.' };
      return { code: 'ratio-flip', hint: 'Upside down: the hypotenuse goes on the <b>bottom</b>. The sine and cosine of an acute angle are always less than ' + t('1') + '.' };
    }
    if (g === 'ao') return { code: 'ratio-flip', hint: 'Upside down: tangent is <b>opp</b> over adj (TOA). The opposite side — across from ' + t(ang) + ', not touching it — goes on top.' };
    return { code: 'tan-hyp', hint: 'Tangent never uses the hypotenuse: TOA is <b>opposite over adjacent</b>, the two legs.' };
  }
  function swapHint(T, ang, nameIt) {
    return 'All of your ratios belong to the <b>other</b> acute angle' + (nameIt ? ', ' + t('\\angle ' + T.B) : '') + '. Relative to ' + t(ang) + ', the <b>opposite</b> side does not touch ' + t(ang) + '; the <b>adjacent</b> side touches it (and isn’t the hypotenuse).';
  }
  /* several fraction boxes: funcs ⊂ ['sin','cos','tan'] for angle ang of T. extra(f, value) -> {code, hint} for other slips */
  /* K.fraction, with a clearer nudge for a fraction of decimals such as 3.6/4.5 */
  function fracChk(target, opt) {
    var c = K.fraction(target, opt);
    return function (resp) {
      var res = c(resp);
      if (res.v === 'form' && res.code === 'decimal' && /\\frac|\//.test(String(resp))) return form('decimal', 'Right value — now clear the decimals (multiply the top and bottom by ' + t('10') + ') and reduce to lowest terms.');
      return res;
    };
  }
  function ratioCheck(T, funcs, ang, extra, nameIt) {
    var checks = funcs.map(function (f) { return fracChk(frc.apply(null, pair(T, FUN[f]))); });
    var show = function (id) { var p = pair(T, id); return uT(p[0], p[1]); };
    return function (resp) {
      resp = resp || []; var res = [], got = [], vals = [];
      funcs.forEach(function (f, i) {
        var s = resp[i] == null ? '' : String(resp[i]); res[i] = checks[i](s);
        var a = K.read(s); vals[i] = a.res ? NaN : a.val; got[i] = a.res ? null : whichId(T, a.val, ex.shape(a.ast).decimals > 0);
      });
      var lab = function (i) { return '<b>' + t(FT[funcs[i]] + ' ' + ang) + ':</b> '; };
      if (res.every(function (x) { return x.v === 'correct'; })) return ok();
      for (var e = 0; e < funcs.length; e++) if (res[e].v === 'form' && res[e].code === 'empty') return form('empty', 'Fill in every box — ' + lab(e) + 'is still empty.');
      if (funcs.length > 1 && funcs.every(function (f, i) { return got[i] === OTHER[f]; })) return wrong('opp-adj-swap', swapHint(T, ang, nameIt));
      var is = funcs.indexOf('sin'), ic = funcs.indexOf('cos');
      if (is >= 0 && ic >= 0 && got[is] === 'ah' && got[ic] === 'oh') return wrong('sin-cos-swap', 'Your sine and cosine are swapped. SOH: sine is <b>opp</b> over hyp. CAH: cosine is <b>adj</b> over hyp.');
      for (var i = 0; i < funcs.length; i++) if (res[i].v === 'wrong') {
        var d = rdiag(funcs[i], got[i], show, ang); if (!d && extra) d = extra(funcs[i], vals[i]);
        return wrong(d ? d.code : res[i].code, lab(i) + (d ? d.hint : res[i].hint || 'Not yet. Name opp, adj and hyp relative to ' + t(ang) + ' first, then use ' + t(RULE[funcs[i]]) + '.'));
      }
      for (var j = 0; j < funcs.length; j++) if (res[j].v === 'form') return { v: 'form', code: res[j].code, hint: lab(j) + res[j].hint };
      return wrong('value', null);
    };
  }
  function ratioKeys(T, funcs) { return funcs.map(function (f) { var p = pair(T, FUN[f]); return fT(p[0], p[1]); }); }
  function ratioAnswer(T, funcs, ang) { var k = ratioKeys(T, funcs); return funcs.map(function (f, i) { return t(FT[f] + ' ' + ang + '=' + k[i]); }).join(', \\ '); }
  /* worked solution. o.named: use side names; o.pre: text before */
  function ratioSol(T, funcs, ang, o) {
    o = o || {};
    var s = o.pre || '';
    if (o.named !== false) s += 'The right angle is at ' + t(T.R) + ', so ' + t(T.hyp + '=' + nf(T.h)) + ' is the hypotenuse. Relative to ' + t(ang) + ': opp ' + t('=' + T.opp + '=' + nf(T.o)) + ' (it doesn’t touch ' + t(T.A) + '), adj ' + t('=' + T.adj + '=' + nf(T.a)) + '.<br>';
    else s += 'Relative to ' + t(ang) + ': opp ' + t('=' + nf(T.o)) + ', adj ' + t('=' + nf(T.a)) + ', hyp ' + t('=' + nf(T.h)) + ' (across from the right angle).<br>';
    s += funcs.map(function (f) { var p = pair(T, FUN[f]); return t(FT[f] + ' ' + ang + '=\\frac{\\text{' + (f === 'cos' ? 'adj' : 'opp') + '}}{\\text{' + (f === 'tan' ? 'adj' : 'hyp') + '}}=' + steps(p[0], p[1])); }).join('<br>');
    return s;
  }
  function ratioBad(T, funcs) {
    var sw = funcs.map(function (f) { var p = pair(T, OTHER[f]); return fT(p[0], p[1]); });
    var fl = funcs.map(function (f) { var p = pair(T, FUN[f]); return fT(p[1], p[0]); });
    return [sw, fl];
  }
  function ratiosPart(T, funcs, ang, prompt, o) {
    o = o || {};
    var keys = ratioKeys(T, funcs);
    return { prompt: prompt, input: { type: 'fields', fields: funcs.map(function (f) { return { name: FT[f], before: t(FT[f] + ' ' + ang + '='), mode: 'math', keys: 'fraction' }; }) },
      check: ratioCheck(T, funcs, ang, o.extra, o.nameIt), key: keys, answer: ratioAnswer(T, funcs, ang),
      solution: o.sol || ratioSol(T, funcs, ang, o), text: o.text || (funcs.join('/') + ' of ' + nf(T.o) + '-' + nf(T.a) + '-' + nf(T.h)),
      hints: o.hints || ['First find the right angle: the hypotenuse is across from it. Then, relative to ' + t(ang) + ', the opposite side doesn’t touch ' + t(ang) + ' and the adjacent side does.', 'SOH CAH TOA: ' + t('\\sin=\\frac{\\text{opp}}{\\text{hyp}},\\ \\cos=\\frac{\\text{adj}}{\\text{hyp}},\\ \\tan=\\frac{\\text{opp}}{\\text{adj}}') + '. Reduce each fraction.'],
      bad: ratioBad(T, funcs).concat(o.bad || []), good: o.good };
  }
  /* one fraction box */
  function oneRatio(T, f, ang, prompt, o) {
    o = o || {};
    var p = pair(T, FUN[f]), target = frc(p[0], p[1]), show = function (id) { var q = pair(T, id); return uT(q[0], q[1]); };
    var check = fracChk(target, { diag: function (v, ast) { return rdiag(f, whichId(T, v, ex.shape(ast).decimals > 0), show, ang); } });
    var bp = pair(T, OTHER[f]);
    return { prompt: prompt, input: { type: 'math', keys: 'fraction', before: t(FT[f] + ' ' + ang + '=') }, check: check, key: ex.texRat(target), answer: t(FT[f] + ' ' + ang + '=' + ex.texRat(target)),
      solution: o.sol || ratioSol(T, [f], ang, o), text: o.text || (f + ' ' + nf(T.o) + '-' + nf(T.a) + '-' + nf(T.h)),
      hints: ['Name the sides relative to ' + t(ang) + ' first: hyp is across from the right angle, opp doesn’t touch ' + t(ang) + ', adj touches it.', t(RULE[f]) + ' — then reduce the fraction' + (nd(p[0]) || nd(p[1]) ? ' (multiply top and bottom by ' + t(Math.pow(10, Math.max(nd(p[0]), nd(p[1])))) + ' to clear the decimals first)' : '') + '.'],
      bad: [fT(bp[0], bp[1]), fT(p[1], p[0])] };
  }

  /* ---------- tap-in-a-table versions (side names) ---------- */
  var ROWL = { opp: '<b>opp</b>', adj: '<b>adj</b>', hyp: '<b>hyp</b>' };
  function sideGrid(r, T, order, ang, prompt) {
    var want = { opp: T.opp, adj: T.adj, hyp: T.hyp };
    var cols = r.shuffle([T.opp, T.adj, T.hyp]).map(function (s) { return { id: s, html: t(s) }; });
    var p = P.grid(prompt, order.map(function (id) { return { id: id, html: ROWL[id] }; }), cols, want, {},
      'The right angle is at ' + t(T.R) + ', so the hypotenuse is the side across from it: <b>hyp</b> ' + t('=' + T.hyp) + '.<br>Relative to ' + t(ang) + ' (at ' + t(T.A) + '): the side that doesn’t touch ' + t(T.A) + ' is <b>opp</b> ' + t('=' + T.opp) + '; the leg that touches ' + t(T.A) + ' is <b>adj</b> ' + t('=' + T.adj) + '.',
      ['Find the right-angle box first: the hypotenuse is across from it.', 'Opposite doesn’t touch the marked angle; adjacent touches it.'], 'name sides ' + T.A + T.B + T.R);
    p.check = function (resp) {
      resp = resp || {};
      var miss = order.filter(function (k) { return !resp[k]; });
      if (miss.length === order.length) return form('empty', 'Choose a side in each row.');
      if (miss.length) return form('incomplete', 'Finish every row (' + (order.length - miss.length) + ' of 3 done).');
      if (resp.opp === want.opp && resp.adj === want.adj && resp.hyp === want.hyp) return ok();
      if (resp.opp === resp.adj || resp.opp === resp.hyp || resp.adj === resp.hyp) return wrong('side-dup', 'Each of the three sides gets exactly one name — you used one side twice.');
      if (resp.hyp !== want.hyp) return wrong('hyp-wrong', 'Find the right-angle box first (at ' + t(T.R) + '). The hypotenuse is the side across from it — the side that does not touch ' + t(T.R) + '.');
      return wrong('opp-adj-swap', 'Opposite and adjacent are swapped. The <b>opposite</b> side is across from ' + t(ang) + ' — it doesn’t touch ' + t(T.A) + '. The <b>adjacent</b> side touches ' + t(T.A) + '.');
    };
    p.bad = [{ opp: T.adj, adj: T.opp, hyp: T.hyp }, { opp: T.hyp, adj: T.adj, hyp: T.opp }];
    return p;
  }
  function ratioGrid(r, T, ang, prompt) {
    var nmT = function (id) { var m = { o: T.opp, a: T.adj, h: T.hyp }; return '\\dfrac{' + m[id[0]] + '}{' + m[id[1]] + '}'; };
    var cols = r.shuffle(['oh', 'ah', 'oa', 'ao', 'ho']).map(function (id) { return { id: id, html: t(nmT(id)) }; });
    var rows = ['sin', 'cos', 'tan'].map(function (f) { return { id: f, html: t(FT[f] + ' ' + ang) }; });
    var want = { sin: 'oh', cos: 'ah', tan: 'oa' };
    var p = P.grid(prompt, rows, cols, want, {},
      'Relative to ' + t(ang) + ': opp ' + t('=' + T.opp) + ', adj ' + t('=' + T.adj) + ', hyp ' + t('=' + T.hyp) + '.<br>' + ['sin', 'cos', 'tan'].map(function (f) { return t(FT[f] + ' ' + ang + '=' + RULE[f].replace(/^\\(sin|cos|tan)=/, '') + '=' + nmT(FUN[f])); }).join('<br>'),
      ['Name the sides first: opp, adj and hyp relative to ' + t(ang) + '.', 'SOH CAH TOA: sine is opp/hyp, cosine is adj/hyp, tangent is opp/adj.'], 'ratios by side names ' + T.A + T.B + T.R);
    p.check = function (resp) {
      resp = resp || {};
      var miss = ['sin', 'cos', 'tan'].filter(function (k) { return !resp[k]; });
      if (miss.length === 3) return form('empty', 'Choose a ratio in each row.');
      if (miss.length) return form('incomplete', 'Finish every row (' + (3 - miss.length) + ' of 3 done).');
      if (resp.sin === 'oh' && resp.cos === 'ah' && resp.tan === 'oa') return ok();
      if (resp.sin === 'ah' && resp.cos === 'oh' && resp.tan === 'ao') return wrong('opp-adj-swap', swapHint(T, ang, true));
      if (resp.sin === 'ah' && resp.cos === 'oh') return wrong('sin-cos-swap', 'Your sine and cosine are swapped. SOH: sine is <b>opp</b> over hyp. CAH: cosine is <b>adj</b> over hyp.');
      var fs = ['sin', 'cos', 'tan'];
      for (var i = 0; i < 3; i++) if (resp[fs[i]] !== want[fs[i]]) { var d = rdiag(fs[i], resp[fs[i]], nmT, ang); return wrong(d.code, '<b>' + t(FT[fs[i]] + ' ' + ang) + ':</b> ' + d.hint); }
      return wrong('row', null);
    };
    p.bad = [{ sin: 'ah', cos: 'oh', tan: 'ao' }, { sin: 'oh', cos: 'ah', tan: 'ao' }, { sin: 'ah', cos: 'oh', tan: 'oa' }];
    return p;
  }

  /* ---------- rounded answers ---------- */
  function near(x, dp, alts) { return K.near(x, dp, { alts: alts || [] }); }
  function nearFields(prompt, items, ans, sol, hints, text) { // items: [{ before, x, dp, alts }]
    var fields = items.map(function (it) { return { name: it.name, before: it.before }; });
    var p = P.fields(prompt, fields, items.map(function (it) { return near(it.x, it.dp, it.alts); }), items.map(function (it) { return K.roundTo(it.x, it.dp).toFixed(it.dp); }), ans, sol, hints, text);
    return p;
  }
  function closeTo(v, x, tol) { return isFinite(v) && Math.abs(v - x) <= (tol || 0.006) * Math.max(1, Math.abs(x)); }

  /* ---------- MC helper ---------- */
  function mc(r, prompt, opts, sol, hints, text, cols) { var p = P.mc(r, prompt, opts, sol, hints, text); if (cols) p.input.columns = cols; return p; }

  /* ---------- Pythagorean-theorem diagnoses for a missing side ---------- */
  function pythDiag(want, l1, l2, legMissing) { // want = the right answer; l1, l2 = the two known sides
    return function (v) {
      if (legMissing && closeTo(v, Math.sqrt(l1 * l1 + l2 * l2), 0.002)) return { code: 'pyth-add', hint: 'The missing side is a <b>leg</b>, so it must be shorter than the hypotenuse. Subtract: ' + t('\\text{leg}^2=\\text{hyp}^2-\\text{leg}^2') + '.' };
      if (!legMissing && closeTo(v, Math.sqrt(Math.abs(l1 * l1 - l2 * l2)), 0.002)) return { code: 'pyth-sub', hint: 'The missing side is the <b>hypotenuse</b> (across from the right angle), so add the squares of the two legs: ' + t('\\text{hyp}^2=\\text{leg}^2+\\text{leg}^2') + '.' };
      if (closeTo(v, legMissing ? Math.abs(l1 * l1 - l2 * l2) : l1 * l1 + l2 * l2, 1e-6)) return { code: 'pyth-noroot', hint: 'That is the side length <b>squared</b>. Take the square root.' };
      if (closeTo(v, legMissing ? Math.abs(l1 - l2) : l1 + l2, 1e-6)) return { code: 'legs-added', hint: 'Lengths don’t simply add or subtract — square them first (Pythagorean theorem), then take the square root.' };
      return null;
    };
  }

  HW.defineLesson({
    id: 'u9l1', unit: 9, num: '1', title: 'Right-Triangle Trigonometry: Sine, Cosine, and Tangent', outcome: 'M4',
    blurb: 'Name the hypotenuse, opposite and adjacent sides for an angle, write sine, cosine and tangent from the side lengths, and see why similar triangles make the ratios depend only on the angle.',
    questions: QUESTIONS(),
    extra: EXTRA()
  });

  /* =====================================================================================================
   * ASSIGNMENT
   * ===================================================================================================== */
  function QUESTIONS() {
    var SHAPES = [[4, 3], [3.2, 2.6], [3, 3.2], [12, 5], [15, 8], [2.4, 3.4], [4, 2.2]];
    return [
      { num: '1', section: 'Assignment',
        stem: 'Relative to the marked angle ' + t('x^\\circ') + ', name the opposite side, the adjacent side and the hypotenuse (as pairs of vertex letters), then write ' + t('\\sin x^\\circ') + ', ' + t('\\cos x^\\circ') + ' and ' + t('\\tan x^\\circ') + ' as ratios of those side names.',
        shared: function (r) {
          var sets = r.sample(LETS, 4), out = [];
          for (var i = 0; i < 4; i++) { var sh = r.pick(SHAPES), T = tri(names(r, 'any', sets[i]), sh[1], sh[0], 0); out.push({ T: T, or: ori(r, i >= 2), sh: [sh[0], sh[1]] }); }
          return out;
        },
        parts: [0, 1, 2, 3].reduce(function (acc, i) {
          var L = 'abcd'[i], lev1 = i < 2 ? 'LIM' : 'BEG';
          var fig = function (sh) { var q = sh[i]; return triFig(q.T, { rot: q.or.rot, flip: q.or.flip, angA: 'x°', shape: q.sh }); };
          acc.push({ id: '1' + L + '1', sub: L + ' i', level: lev1, make: function (r, sh) { return sideGrid(r, sh[i].T, ['opp', 'adj', 'hyp'], 'x^\\circ', 'Match each name to its side, relative to ' + t('x^\\circ') + '.' + fig(sh)); } });
          acc.push({ id: '1' + L + '2', sub: L + ' ii', level: lev1, make: function (r, sh) { return ratioGrid(r, sh[i].T, 'x^\\circ', 'Choose the ratio of side names for each trigonometric ratio of ' + t('x^\\circ') + '.' + fig(sh)); } });
          return acc;
        }, []) },

      { num: '2', stem: 'Mark the hyp, opp and adj for the angle ' + t('a^\\circ') + ', then state ' + t('\\sin a^\\circ') + ', ' + t('\\cos a^\\circ') + ' and ' + t('\\tan a^\\circ') + ' as fractions in simplest form.',
        parts: [
          { id: '2a', sub: 'a', level: 'BEG', make: function (r) { return q2(r, [[9, 40, 41], [8, 15, 17], [20, 21, 29], [28, 45, 53], [11, 60, 61], [33, 56, 65]]); } },
          { id: '2b', sub: 'b', level: 'BEG', make: function (r) { return q2(r, [[12, 35, 37], [7, 24, 25], [16, 63, 65], [48, 55, 73], [36, 77, 85], [39, 80, 89]]); } }] },

      { num: '3', stem: 'Determine, as a fraction in simplest form, the value of the trigonometric ratio indicated.',
        parts: [
          { id: '3a', sub: 'a', level: 'BEG', make: function (r) { return q3(r, 'cos', 'a', false); } },
          { id: '3b', sub: 'b', level: 'BEG', make: function (r) { return q3(r, 'sin', 'b', false); } },
          { id: '3c', sub: 'c', level: 'BEG', make: function (r) { return q3(r, 'tan', 'c', false); } },
          { id: '3d', sub: 'd', level: 'EMG', make: function (r) { return q3(r, 'sin', 'd', true); } }] },

      { num: '4', stem: function (sh) { return 'In the right triangle below, the two legs are ' + t(sh.p) + ' and ' + t(sh.q) + ' units.' + triFig(sh.T, { rot: sh.or.rot, flip: sh.or.flip, angA: 'x°', lab: { o: sh.T.o, a: sh.T.a }, names: false }); },
        shared: function (r) {
          var p, q, ok2 = false;
          for (var g = 0; g < 200 && !ok2; g++) {
            p = g === 0 && r.chance(0.3) ? 11 : r.int(7, 15); q = g === 0 && p === 11 ? 23 : r.int(p + 6, 2 * p + 4);
            var h = Math.sqrt(p * p + q * q); if (Math.abs(h - Math.round(h)) < 1e-9) continue;
            var vs = [h * 100, p / h * 100, q / h * 100, p / q * 100, q / p * 100];
            ok2 = (p === 11 && q === 23) || vs.every(function (v) { var f = v - Math.floor(v); return Math.abs(f - 0.5) > 0.08; });
          }
          var T = r.chance(0.75) ? tri({ A: 'A', B: 'B', R: 'C' }, p, q, Math.sqrt(p * p + q * q)) : tri({ A: 'A', B: 'B', R: 'C' }, q, p, Math.sqrt(p * p + q * q));
          return { p: p, q: q, T: T, or: ori(r, false) };
        },
        parts: [
          { id: '4a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var p = sh.p, q = sh.q, h = Math.sqrt(p * p + q * q);
            var part = P.near('Use the Pythagorean theorem to find the hypotenuse, rounded to the nearest hundredth.', h, 2, { alts: [
              { v: Math.sqrt(q * q - p * p), code: 'pyth-sub', hint: 'The hypotenuse is the missing side, so <b>add</b> the squares of the legs: ' + t('\\text{hyp}^2=' + p + '^2+' + q + '^2') + '.' },
              { v: p + q, code: 'legs-added', hint: 'Lengths don’t add like that: square each leg, add the squares, then take the square root.' },
              { v: p * p + q * q, code: 'pyth-noroot', hint: 'That’s ' + t('\\text{hyp}^2') + '. Take the square root.' }] },
              t('\\text{hyp}^2=' + p + '^2+' + q + '^2=' + (p * p) + '+' + (q * q) + '=' + (p * p + q * q)) + '<br>' + t('\\text{hyp}=\\sqrt{' + (p * p + q * q) + '}\\approx ' + h.toFixed(4) + '\\approx ' + h.toFixed(2)),
              ['The hypotenuse is across from the right angle: ' + t('\\text{hyp}^2=\\text{leg}^2+\\text{leg}^2') + '.'], 'hypotenuse of legs ' + p + ', ' + q);
            part.bad = [String(K.roundTo(Math.sqrt(q * q - p * p), 2)), String(p + q)];
            return part;
          } },
          { id: '4b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var T = sh.T, h = T.h, o = T.o, a = T.a, hr = Math.round(h);
            var e = function (v, fn) { return { v: v, code: 'early-round', hint: 'Close — but it looks like you used a rounded hypotenuse. Use the full value ' + t('\\sqrt{' + (o * o + a * a) + '}') + ' and round only at the end.' }; };
            var items = [
              { name: 'sin', before: t('\\sin x^\\circ\\approx'), x: o / h, dp: 2, alts: [{ v: a / h, code: 'sin-cos-swap', hint: 'That’s adj over hyp — the cosine. Sine is <b>opp</b> over hyp; the opposite side doesn’t touch ' + t('x^\\circ') + '.' }, { v: o / a, code: 'hyp-wrong', hint: 'Sine has the <b>hypotenuse</b> on the bottom (SOH).' }, e(o / hr)] },
              { name: 'cos', before: t('\\cos x^\\circ\\approx'), x: a / h, dp: 2, alts: [{ v: o / h, code: 'sin-cos-swap', hint: 'That’s opp over hyp — the sine. Cosine is <b>adj</b> over hyp; the adjacent side touches ' + t('x^\\circ') + '.' }, { v: a / o, code: 'hyp-wrong', hint: 'Cosine has the <b>hypotenuse</b> on the bottom (CAH).' }, e(a / hr)] },
              { name: 'tan', before: t('\\tan x^\\circ\\approx'), x: o / a, dp: 2, alts: [{ v: a / o, code: 'ratio-flip', hint: 'Upside down: tangent is <b>opp</b> over adj (TOA).' }, { v: o / h, code: 'tan-hyp', hint: 'Tangent doesn’t use the hypotenuse: TOA, opposite over adjacent.' }] }];
            var part = nearFields('Determine ' + t('\\sin x^\\circ') + ', ' + t('\\cos x^\\circ') + ' and ' + t('\\tan x^\\circ') + ' as decimals rounded to the nearest hundredth.', items,
              t('\\sin x^\\circ\\approx ' + (o / h).toFixed(2) + ',\\ \\cos x^\\circ\\approx ' + (a / h).toFixed(2) + ',\\ \\tan x^\\circ\\approx ' + (o / a).toFixed(2)),
              'Relative to ' + t('x^\\circ') + ': opp ' + t('=' + o) + ', adj ' + t('=' + a) + ', hyp ' + t('=\\sqrt{' + (o * o + a * a) + '}') + ' — carry the full-precision hypotenuse and round only at the end.<br>' +
              t('\\sin x^\\circ=\\frac{' + o + '}{\\sqrt{' + (o * o + a * a) + '}}\\approx ' + (o / h).toFixed(4) + '\\approx ' + (o / h).toFixed(2)) + '<br>' + t('\\cos x^\\circ=\\frac{' + a + '}{\\sqrt{' + (o * o + a * a) + '}}\\approx ' + (a / h).toFixed(4) + '\\approx ' + (a / h).toFixed(2)) + '<br>' + t('\\tan x^\\circ=\\frac{' + o + '}{' + a + '}\\approx ' + (o / a).toFixed(4) + '\\approx ' + (o / a).toFixed(2)),
              ['The opposite side is the leg across from ' + t('x^\\circ') + '; the adjacent leg touches it.', 'Use the hypotenuse from (a) at full precision: ' + t('\\sqrt{' + (o * o + a * a) + '}') + '.'], 'decimal ratios legs ' + o + ', ' + a);
            part.bad = [[(a / h).toFixed(2), (o / h).toFixed(2), (o / a).toFixed(2)], [(o / h).toFixed(2), (a / h).toFixed(2), (a / o).toFixed(2)]];
            return part;
          } }] },

      { num: '5', stem: 'Determine the exact values of the three ratios as fractions in simplest form.',
        parts: [{ id: '5', level: 'BEG', make: function (r) {
          var tr = r.pick([[16, 63, 65], [11, 60, 61], [13, 84, 85], [9, 40, 41], [12, 35, 37], [20, 99, 101]]);
          var nm = names(r, 'any'), T = tri(nm, tr[0], tr[1], tr[2]), or = ori(r, false), ang = T.A;
          return ratiosPart(T, ['sin', 'cos', 'tan'], ang, 'In the right triangle below, determine ' + t('\\sin ' + ang) + ', ' + t('\\cos ' + ang) + ' and ' + t('\\tan ' + ang) + '.' + triFig(T, { rot: or.rot, flip: or.flip, angA: T.A, lab: labs(T) }), { nameIt: true });
        } }] },

      { num: '6', stem: 'Sketch and label each right triangle from the ratio given, then determine the other two ratios as fractions in simplest form.',
        parts: [
          { id: '6a', sub: 'a', level: 'PRG', make: function (r) {
            var tr = r.pick([[20, 21, 29], [8, 15, 17], [5, 12, 13], [7, 24, 25], [12, 35, 37], [9, 40, 41], [28, 45, 53], [11, 60, 61], [33, 56, 65], [48, 55, 73]]);
            var L = r.pick(LETS), nm = { A: L[0], B: L[1], R: L[2] }, T = fromTriple(r, nm, tr), A = T.A;
            return q6(T, A, 'In ' + t('\\triangle ' + L.join('')) + ', ' + t('\\angle ' + L[2] + '=90^\\circ') + ' and ' + t('\\sin ' + A + '=' + uT(T.o, T.h)) + '. Determine ' + t('\\cos ' + A) + ' and ' + t('\\tan ' + A) + '.', 'sin', ['cos', 'tan']);
          } },
          { id: '6b', sub: 'b', level: 'PRG', make: function (r) {
            var c = r.pick([[3, 4, 5, '0.6'], [4, 3, 5, '0.8'], [7, 24, 25, '0.28'], [24, 7, 25, '0.96']]);
            var L = r.pick(LETS), nm = { A: L[0], B: L[1], R: L[2] }, T = tri(nm, c[1], c[0], c[2]), A = T.A;
            return q6(T, A, 'In ' + t('\\triangle ' + L.join('')) + ', ' + t('\\angle ' + L[2] + '=90^\\circ') + ' and ' + t('\\cos ' + A + '=' + c[3]) + '. Determine ' + t('\\sin ' + A) + ' and ' + t('\\tan ' + A) + '.', 'cos', ['sin', 'tan'], c[3]);
          } }] },

      { num: '7', stem: function (sh) {
          return 'Two right triangles each have a ' + t(sh.th + '^\\circ') + ' angle. In the smaller triangle, the leg adjacent to the ' + t(sh.th + '^\\circ') + ' angle is ' + t(nf(sh.a)) + ' and the leg opposite it is ' + t(nf(sh.o)) + '. In the larger triangle, the adjacent leg is ' + t(nf(sh.L)) + ' and the opposite leg is ' + t('y') + '.' +
            twoFigs(triFig(sh.T1, { angA: sh.th + '°', lab: { o: nf(sh.o), a: nf(sh.a) }, names: false, width: 170, rot: sh.rot, flip: sh.flip }), triFig(sh.T2, { angA: sh.th + '°', lab: { o: 'y', a: nf(sh.L) }, names: false, width: 250, rot: sh.rot, flip: sh.flip }));
        },
        shared: function (r) {
          for (var g = 0; g < 300; g++) {
            var th = g === 0 && r.chance(0.3) ? 40 : r.pick([25, 35, 40, 50, 55]), a = g === 0 ? 3 : r.pick([2, 3, 4, 5]), s = g === 0 ? 2.5 : r.pick([1.5, 2, 2.5, 3, 4]);
            var rt = K.roundTo(TG.tan(th), 2), o = cl(a * rt), L = cl(a * s), y = cl(o * s);
            if (nd(y) <= 2 && nd(L) <= 1) return { th: th, a: a, s: s, rt: rt, o: o, L: L, y: y, rot: r.pick([0, 0, 90, 180, 270]), flip: r.chance(0.5),
              T1: tri({ A: 'A', B: 'B', R: 'C' }, o, a, 0), T2: tri({ A: 'D', B: 'E', R: 'F' }, y, L, 0) };
          }
          return null;
        },
        parts: [
          { id: '7a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var th = sh.th, th2 = 90 - th;
            return mc(r, 'Why are the two triangles similar?', [
              { html: 'Each has a ' + t('90^\\circ') + ' angle and a ' + t(th + '^\\circ') + ' angle, so the third angle is ' + t(th2 + '^\\circ') + ' in both: all three angles match.', right: true },
              { html: 'Every right triangle is similar to every other right triangle.', why: 'A right angle alone isn’t enough — a right triangle with a ' + t('20^\\circ') + ' angle has a different shape from one with a ' + t(th + '^\\circ') + ' angle. It’s the matching acute angle that matters.' },
              { html: 'Their sides are equal in length.', why: 'Equal sides would make them congruent. These have different sizes — similar means same <b>angles</b> (same shape), not same size.' },
              { html: 'Every side of the larger triangle is longer than the matching side of the smaller one.', why: 'Being bigger doesn’t make two triangles similar — their <b>shape</b> must match, which means equal angles.' }],
              'Each triangle has a right angle and a ' + t(th + '^\\circ') + ' angle, so the third angle is ' + t('180^\\circ-90^\\circ-' + th + '^\\circ=' + th2 + '^\\circ') + ' in both. Triangles with equal angles are <b>similar</b>.', ['What is the third angle in each triangle?'], 'why similar ' + th);
          } },
          { id: '7b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var y = sh.y, s = sh.s;
            var part = P.number('Use the scale factor from the smaller triangle to the larger one to find ' + t('y') + '.', y, null,
              'Scale factor ' + t('=\\frac{' + nf(sh.L) + '}{' + nf(sh.a) + '}=' + nf(s)) + ', so ' + t('y=' + nf(sh.o) + '\\times ' + nf(s) + '=' + nf(y)) + '.',
              ['The scale factor is (large adjacent leg) ÷ (small adjacent leg).', 'Multiply the small opposite leg by the scale factor.'], 'scale factor y, ' + sh.th + '°', { before: t('y='), after: '' });
            part.check = function (resp) {
              var pv = HW.parse.number(resp);
              if (pv.ok && Math.abs(pv.value - y) > 1e-9) {
                var v = pv.value;
                if (Math.abs(v - sh.L * TG.tan(sh.th)) < 0.006) return form('use-scale', 'That’s ' + t(nf(sh.L) + '\\tan ' + sh.th + '^\\circ') + ' from the calculator — close, but this question asks you to use the <b>scale factor</b>: multiply ' + t(nf(sh.o)) + ' by ' + t('\\frac{' + nf(sh.L) + '}{' + nf(sh.a) + '}') + '.');
                if (Math.abs(v - sh.o / s) < 0.006) return wrong('scale-flip', 'You divided by the scale factor. The larger triangle’s sides are <b>longer</b>, so multiply ' + t(nf(sh.o)) + ' by ' + t(nf(s)) + '.');
                if (Math.abs(v - (sh.o + sh.L - sh.a)) < 0.006) return wrong('legs-added', 'Similar triangles aren’t made by adding the same length to each side — multiply by the scale factor ' + t('\\frac{' + nf(sh.L) + '}{' + nf(sh.a) + '}') + '.');
                if (Math.abs(v - sh.L * s) < 0.006) return wrong('value', 'Multiply the small triangle’s <b>opposite</b> leg, ' + t(nf(sh.o)) + ', by the scale factor.');
              }
              return K.number(y)(resp);
            };
            part.bad = [nf(sh.o / s), nf(cl(sh.o + sh.L - sh.a))];
            return part;
          } },
          { id: '7c1', sub: 'c i', level: 'BEG', make: function (r, sh) {
            var th = sh.th, rt = sh.rt, tv = TG.tan(th);
            var p = nearFields('Calculate ' + t('\\frac{\\text{opp}}{\\text{adj}}') + ' in each triangle, then evaluate ' + t('\\tan ' + th + '^\\circ') + ' on a calculator to the nearest thousandth.', [
              { name: 'Smaller triangle', before: t('\\frac{' + nf(sh.o) + '}{' + nf(sh.a) + '}='), x: rt, dp: 2, alts: [{ v: sh.a / sh.o, code: 'ratio-flip', hint: 'Upside down: opposite (' + t(nf(sh.o)) + ') on top, adjacent (' + t(nf(sh.a)) + ') on the bottom.' }] },
              { name: 'Larger triangle', before: t('\\frac{' + nf(sh.y) + '}{' + nf(sh.L) + '}='), x: rt, dp: 2, alts: [{ v: sh.L / sh.y, code: 'ratio-flip', hint: 'Upside down: opposite on top, adjacent on the bottom.' }] },
              { name: 'tan', before: t('\\tan ' + th + '^\\circ\\approx'), x: tv, dp: 3, alts: [{ v: TG.radTan(th), code: 'radian', hint: 'Your calculator is in <b>radian</b> mode. Switch it to <b>degree</b> mode (DEG) and try again.' }, { v: 1 / tv, code: 'ratio-flip', hint: 'That’s ' + t('1\\div\\tan ' + th + '^\\circ') + '. Just press tan, then ' + t(th) + '.' }] }],
              t('\\frac{' + nf(sh.o) + '}{' + nf(sh.a) + '}=' + rt.toFixed(2) + ',\\ \\frac{' + nf(sh.y) + '}{' + nf(sh.L) + '}=' + rt.toFixed(2) + ',\\ \\tan ' + th + '^\\circ\\approx ' + tv.toFixed(3)),
              'Smaller: ' + t('\\frac{' + nf(sh.o) + '}{' + nf(sh.a) + '}=' + rt.toFixed(2)) + '. Larger: ' + t('\\frac{' + nf(sh.y) + '}{' + nf(sh.L) + '}=' + rt.toFixed(2)) + '.<br>Calculator (degree mode): ' + t('\\tan ' + th + '^\\circ=' + tv.toFixed(5) + '\\ldots\\approx ' + tv.toFixed(3)) + ', which is ' + t(rt.toFixed(2)) + ' to two decimals (the side ' + t(nf(sh.o)) + ' was rounded).',
              ['opp ÷ adj: the leg across from the angle divided by the leg touching it.', 'Check that your calculator is in degree mode.'], 'tan ' + th + ' both triangles');
            return p;
          } },
          { id: '7c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            var th = sh.th;
            return mc(r, 'Using similarity, why does ' + t('\\frac{\\text{opp}}{\\text{adj}}') + ' — the value of ' + t('\\tan ' + th + '^\\circ') + ' — come out the same in both triangles?', [
              { html: 'The triangles are similar, so both legs of the larger one are the smaller one’s legs times the same scale factor ' + t(nf(sh.s)) + '; the factor cancels in opp ÷ adj.', right: true },
              { html: 'Because both triangles are right triangles.', why: 'Right triangles with <b>different</b> acute angles have different ratios. It’s the shared ' + t(th + '^\\circ') + ' angle — similarity — that makes the ratios match.' },
              { html: 'Because the opposite and adjacent legs each grew by the same amount.', why: 'They didn’t grow by the same <b>amount</b> (' + t(nf(cl(sh.y - sh.o))) + ' vs ' + t(nf(cl(sh.L - sh.a))) + ') — they were multiplied by the same <b>factor</b>.' },
              { html: 'It is a coincidence of these particular lengths.', why: 'It happens for every pair of right triangles with a ' + t(th + '^\\circ') + ' angle, whatever their size: they are all similar.' }],
              'The triangles are similar (same angles), so every side of the larger one is ' + t(nf(sh.s)) + ' times the matching side of the smaller one: ' + t('\\frac{' + nf(sh.s) + '\\times ' + nf(sh.o) + '}{' + nf(sh.s) + '\\times ' + nf(sh.a) + '}=\\frac{' + nf(sh.o) + '}{' + nf(sh.a) + '}') + '. The scale factor cancels, so ' + t('\\tan ' + th + '^\\circ') + ' depends only on the angle.', ['What happens to a fraction when you multiply its top and bottom by the same number?'], 'why tan same');
          } }] },

      { num: '8', stem: function (sh) { return 'Several right triangles of different sizes all have a ' + t(sh.th + '^\\circ') + ' angle.'; },
        shared: function (r) { return { th: r.chance(0.4) ? 31 : r.pick([27, 36, 42, 53, 64]), f: r.pick(['sin', 'sin', 'cos', 'tan']) }; },
        parts: [{ id: '8', level: 'PRG', make: function (r, sh) {
          var th = sh.th, f = sh.f, other2 = 90 - th, rat = { sin: 'opp ÷ hyp', cos: 'adj ÷ hyp', tan: 'opp ÷ adj' }[f], kt = { sin: '\\frac{k\\cdot\\text{opp}}{k\\cdot\\text{hyp}}=\\frac{\\text{opp}}{\\text{hyp}}', cos: '\\frac{k\\cdot\\text{adj}}{k\\cdot\\text{hyp}}=\\frac{\\text{adj}}{\\text{hyp}}', tan: '\\frac{k\\cdot\\text{opp}}{k\\cdot\\text{adj}}=\\frac{\\text{opp}}{\\text{adj}}' }[f];
          return mc(r, 'Which explains why the size of the triangle does not change the value of ' + t(FT[f] + ' ' + th + '^\\circ') + '?', [
            { html: 'Every right triangle with a ' + t(th + '^\\circ') + ' angle has angles ' + t('90^\\circ') + ', ' + t(th + '^\\circ') + ', ' + t(other2 + '^\\circ') + ', so they are all similar: every side is multiplied by the same factor, which cancels in ' + rat + '.', right: true },
            { html: 'Bigger triangles have longer sides, but the calculator rounds them to the same answer.', why: 'The ratios are <b>exactly</b> equal, not just equal after rounding — the scale factor cancels.' },
            { html: 'The hypotenuse is always the longest side.', why: 'True, but it doesn’t explain why the <b>ratio</b> stays the same as the triangle grows. Think about similar triangles.' },
            { html: t(FT[f] + ' ' + th + '^\\circ') + ' depends only on the ' + (f === 'cos' ? 'adjacent' : 'opposite') + ' side, which is the same length in every triangle.', why: 'The ' + (f === 'cos' ? 'adjacent' : 'opposite') + ' side changes length as the triangle grows — but so does the other side in the ratio, by the same factor.' }],
            'All right triangles with a ' + t(th + '^\\circ') + ' angle have the same three angles, so they are similar. Going from one to another multiplies every side by the same factor ' + t('k') + ': ' + t(FT[f] + ' ' + th + '^\\circ=' + kt) + ' — the ' + t('k') + '’s cancel.', ['What do all right triangles with a ' + t(th + '^\\circ') + ' angle have in common?'], 'why size does not matter ' + f);
        } }] },

      { num: '9', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '9', level: 'BEG', make: function (r) {
        var tr = r.pick([[12, 35, 37], [8, 15, 17], [20, 21, 29], [7, 24, 25], [9, 40, 41], [28, 45, 53], [5, 12, 13]]), L = r.pick(LETS);
        var X = L[0], Y = L[1], Z = L[2], legY = r.chance(0.5) ? [tr[0], tr[1]] : [tr[1], tr[0]]; // legY = [adj to Y (=YZ), opp to Y (=XZ)]
        var adj = legY[0], opp = legY[1], h = tr[2], ang = Y;
        var T = tri({ A: Y, B: X, R: Z }, opp, adj, h);
        var pr = function (a, b) { return t(a) + ' and ' + t(b); };
        return mc(r, 'In right triangle ' + t(X + Y + Z) + ', the right angle is at ' + t(Z) + ', ' + t(sn(X, Y) + '=' + h) + ' units, ' + t(sn(X, Z) + '=' + opp) + ' units and ' + t(sn(Y, Z) + '=' + adj) + ' units. The values of ' + t('\\cos ' + Y) + ' and ' + t('\\sin ' + Y) + ', respectively, are', [
          { html: pr(fT(adj, h), fT(opp, h)), right: true },
          { html: pr(fT(opp, h), fT(adj, h)), why: 'Those are swapped: relative to ' + t(Y) + ', the adjacent side ' + t(sn(Y, Z)) + ' touches ' + t(Y) + ', so ' + t('\\cos ' + Y + '=\\frac{' + sn(Y, Z) + '}{' + sn(X, Y) + '}') + '.' },
          { html: pr(fT(adj, opp), fT(opp, adj)), why: 'Sine and cosine have the <b>hypotenuse</b> ' + t(sn(X, Y)) + ' on the bottom — it’s across from the right angle at ' + t(Z) + '.' },
          { html: pr(fT(opp, adj), fT(adj, opp)), why: 'Those use only the legs. Sine and cosine both have the hypotenuse ' + t(sn(X, Y) + '=' + h) + ' on the bottom.' }],
          'The right angle is at ' + t(Z) + ', so ' + t(sn(X, Y) + '=' + h) + ' is the hypotenuse. Relative to ' + t(Y) + ': adj ' + t('=' + sn(Y, Z) + '=' + adj) + ', opp ' + t('=' + sn(X, Z) + '=' + opp) + '.<br>' + t('\\cos ' + Y + '=' + uT(adj, h) + ',\\quad \\sin ' + Y + '=' + uT(opp, h)) + '.', ['Sketch the triangle: put the right angle at ' + t(Z) + ' and label the three sides.'], 'cos & sin from words');
      } }] },

      { num: '10', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '10', level: 'BEG', make: function (r) { return q10(r); } }] },

      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [{ id: '11', level: 'EMG', make: function (r) { return q11(r); } }] },

      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [{ id: '12', level: 'EMG', make: function (r) {
        var tr = r.pick([[5, 12, 13], [8, 15, 17], [7, 24, 25], [12, 35, 37], [9, 40, 41], [28, 45, 53], [16, 63, 65], [33, 56, 65], [20, 21, 29]]), k = r.pick(tr[2] > 40 ? [1] : [1, 2, 3, 4]);
        if (tr[0] === 20) k = r.pick([1, 2]);
        var T = tri({ A: 'T', B: 'S', R: 'R' }, tr[1] * k, tr[0] * k, tr[2] * k), ans = K.roundTo(T.o / T.a, 1), or = ori(r, false);
        return P.nr('In the diagram, to the nearest tenth, the value of ' + t('\\dfrac{\\sin t^\\circ}{\\cos t^\\circ}') + ' is ________.' + triFig(T, { rot: or.rot, flip: or.flip, angA: 't°', lab: labs(T), names: false }), ans, function (v) {
          if (Math.abs(v - K.roundTo(T.a / T.o, 1)) < 1e-9) return { code: 'quot-flip', hint: 'Upside down: ' + t('\\frac{\\sin t^\\circ}{\\cos t^\\circ}') + ' is ' + t('\\frac{\\text{opp}/\\text{hyp}}{\\text{adj}/\\text{hyp}}=\\frac{\\text{opp}}{\\text{adj}}') + ', with the opposite side on top.' };
          if (Math.abs(v - K.roundTo(T.o / T.h, 1)) < 1e-9 || Math.abs(v - K.roundTo(T.a / T.h, 1)) < 1e-9) return { code: 'value', hint: 'That’s just one of the ratios. Divide ' + t('\\sin t^\\circ') + ' by ' + t('\\cos t^\\circ') + ' — the hypotenuses cancel.' };
          return null;
        }, 'The right angle is where the legs ' + t(T.o) + ' and ' + t(T.a) + ' meet, so ' + t(T.h) + ' is the hypotenuse. Relative to ' + t('t^\\circ') + ': opp ' + t('=' + T.o) + ', adj ' + t('=' + T.a) + '.<br>' +
          t('\\frac{\\sin t^\\circ}{\\cos t^\\circ}=\\frac{' + uT(T.o, T.h) + '}{' + uT(T.a, T.h) + '}=\\frac{' + T.o + '}{' + T.a + '}') + (T.o % T.a === 0 ? '' : '\\(\\approx ' + (T.o / T.a).toFixed(3) + '\\)') + ' — which is exactly ' + t('\\tan t^\\circ=\\frac{\\text{opp}}{\\text{adj}}') + '. To the nearest tenth: <b>' + ans.toFixed(1) + '</b>.',
          ['Write ' + t('\\sin t^\\circ') + ' and ' + t('\\cos t^\\circ') + ' as fractions, then divide. What happens to the hypotenuse?'], 'sin/cos = tan');
      } }] }
    ];

    /* Q2: three ratios of a labelled triangle */
    function q2(r, pool) {
      var tr = r.pick(pool), T = fromTriple(r, names(r, 'any'), tr), or = ori(r, false);
      return ratiosPart(T, ['sin', 'cos', 'tan'], 'a^\\circ', 'Write ' + t('\\sin a^\\circ') + ', ' + t('\\cos a^\\circ') + ' and ' + t('\\tan a^\\circ') + ' as fractions in simplest form.' + triFig(T, { rot: or.rot, flip: or.flip, angA: 'a°', lab: labs(T) }));
    }
    /* Q3: one ratio that needs reducing (dec: decimal sides) */
    function q3(r, f, letter, dec) {
      var base = r.pick([[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25]]), k;
      if (dec) k = base[2] === 5 ? r.pick([0.1, 0.2, 0.3, 0.4, 0.6]) : r.pick([0.1, 0.2]);
      else k = base[2] === 5 ? r.int(2, 9) : base[2] === 13 ? r.int(2, 4) : 2;
      var T = fromTriple(r, { A: 'X', B: 'Y', R: 'Z' }, base, k), or = ori(r, false), ang = letter + '^\\circ';
      var lab = labs(T); if (dec) { lab = { o: T.o.toFixed(1), a: T.a.toFixed(1), h: T.h.toFixed(1) }; }
      var p = oneRatio(T, f, ang, 'Determine ' + t(FT[f] + ' ' + ang) + ' as a fraction in simplest form.' + triFig(T, { rot: or.rot, flip: or.flip, angA: letter + '°', lab: lab, names: false, width: 220 }), { named: false });
      p.bad.push(uT(pair(T, FUN[f])[0], pair(T, FUN[f])[1]).replace(/\\frac\{([^}]*)\}\{([^}]*)\}/, '\\frac{$1}{$2}'));
      return p;
    }
    /* Q6: given one ratio, find the other two */
    function q6(T, A, prompt, given, funcs, decTex) {
      var o = T.o, a = T.a, h = T.h, ang = A;
      var extra = function (f, v) {
        var bigLeg = given === 'sin' ? Math.sqrt(h * h + o * o) : Math.sqrt(h * h + a * a);
        var cands = given === 'sin' ? { cos: bigLeg / h, tan: o / bigLeg } : { sin: bigLeg / h, tan: bigLeg / a };
        if (closeTo(v, cands[f], 0.004)) return { code: 'pyth-add', hint: 'Check your third side: it’s a <b>leg</b>, so subtract — ' + t('\\text{leg}^2=\\text{hyp}^2-\\text{leg}^2') + '. (A leg longer than the hypotenuse is impossible.)' };
        return null;
      };
      var miss = given === 'sin' ? a : o, known = given === 'sin' ? o : a, mName = given === 'sin' ? 'adj' : 'opp', kName = given === 'sin' ? 'opp' : 'adj';
      var g = given === 'sin' ? T.opp : T.adj, m = given === 'sin' ? T.adj : T.opp;
      var sol = (decTex ? t('\\cos ' + A + '=' + decTex + '=' + uT(a, h) + '=\\frac{\\text{adj}}{\\text{hyp}}') + ', so' : t('\\sin ' + A + '=' + uT(o, h) + '=\\frac{\\text{opp}}{\\text{hyp}}') + ', so') + ' label the side ' + (given === 'sin' ? 'opposite' : 'adjacent to') + ' ' + t(A) + ' (' + t(g) + ') ' + t(known) + ' and the hypotenuse (' + t(T.hyp) + ') ' + t(h) + (decTex ? ' (any multiple gives the same ratios)' : '') + '.<br>' +
        'The third side is a leg: ' + t(m + '=\\sqrt{' + h + '^2-' + known + '^2}=\\sqrt{' + (h * h - known * known) + '}=' + miss) + '.<br>' +
        funcs.map(function (f) { var p = pair(T, FUN[f]); return t(FT[f] + ' ' + A + '=' + steps(p[0], p[1])); }).join(', \\quad ');
      void mName; void kName;
      return ratiosPart(T, funcs, ang, prompt, { extra: extra, sol: sol, hints: ['Sketch a right triangle and label two sides from the ratio you’re given: ' + t(given === 'sin' ? '\\sin=\\frac{\\text{opp}}{\\text{hyp}}' : '\\cos=\\frac{\\text{adj}}{\\text{hyp}}') + (decTex ? ' (write ' + t(decTex) + ' as a fraction first)' : '') + '.', 'Find the third side with the Pythagorean theorem — it’s a leg, so subtract the squares.'], text: 'other ratios from ' + given });
    }
    /* Q10: only one ratio is correct */
    function q10(r) {
      var tr = r.pick([[28, 45, 53], [20, 21, 29], [8, 15, 17], [12, 35, 37], [7, 24, 25], [33, 56, 65], [9, 40, 41]]), L = r.pick(LETS);
      var A = L[0], B = L[1], C = L[2], oA = r.chance(0.5) ? tr[1] : tr[0], aA = tr[0] + tr[1] - oA, h = tr[2];
      var T = tri({ A: A, B: B, R: C }, oA, aA, h), or = ori(r, false);
      var v = function (X, f) { var TT = X === A ? T : other(T), p = pair(TT, FUN[f]); return [p[0], p[1]]; };
      var st = function (X, f, pq) { return t(FT[f] + ' ' + X + '=' + uT(pq[0], pq[1])); };
      var all = [];
      [A, B].forEach(function (X) { ['sin', 'cos', 'tan'].forEach(function (f) { all.push({ X: X, f: f }); }); });
      var right = r.pick(all);
      var falses = [];
      all.forEach(function (c) {
        if (c.X === right.X && c.f === right.f) return;
        var TT = c.X === A ? T : other(T);
        if (c.f === 'sin' || c.f === 'cos') {
          falses.push({ X: c.X, f: c.f, pq: pair(TT, OTHER[c.f]), why: 'That’s ' + (c.f === 'sin' ? t('\\cos ' + c.X) : t('\\sin ' + c.X)) + ': relative to ' + t(c.X) + ', the ' + (c.f === 'sin' ? 'opposite side is the leg that doesn’t touch ' + t(c.X) : 'adjacent side is the leg that touches ' + t(c.X)) + '.' });
          falses.push({ X: c.X, f: c.f, pq: c.f === 'sin' ? [TT.o, TT.a] : [TT.a, TT.o], why: 'That ratio uses the two legs. ' + (c.f === 'sin' ? 'Sine' : 'Cosine') + ' has the hypotenuse ' + t(TT.hyp) + ' on the bottom.' });
          falses.push({ X: c.X, f: c.f, pq: [TT.h, pair(TT, FUN[c.f])[0]], why: 'Impossible: a ' + (c.f === 'sin' ? 'sine' : 'cosine') + ' of an acute angle can never be greater than ' + t('1') + ' — the hypotenuse is the longest side and belongs on the bottom.' });
        } else {
          falses.push({ X: c.X, f: c.f, pq: [TT.a, TT.o], why: 'Upside down: ' + t('\\tan ' + c.X) + ' is opposite over adjacent. Relative to ' + t(c.X) + ' the opposite side is ' + t(TT.opp) + '.' });
          falses.push({ X: c.X, f: c.f, pq: [TT.o, TT.h], why: 'Tangent never uses the hypotenuse: it is opposite over adjacent (TOA).' });
        }
      });
      var fs = r.shuffle(falses), pick3 = [], usedKey = {};
      for (var i = 0; i < fs.length && pick3.length < 3; i++) { var k = fs[i].X + fs[i].f; if (usedKey[k]) continue; usedKey[k] = 1; pick3.push(fs[i]); }
      var rp = v(right.X, right.f);
      var opts = [{ html: st(right.X, right.f, rp), right: true }].concat(pick3.map(function (x) { return { html: st(x.X, x.f, x.pq), why: x.why }; }));
      var RT = right.X === A ? T : other(T);
      return mc(r, 'For the right triangle ' + t(A + B + C) + ' shown, only one of the following ratios is correct. The correct ratio is' + triFig(T, { rot: or.rot, flip: or.flip, lab: labs(T) }), opts,
        'The right angle is at ' + t(C) + ', so ' + t(T.hyp + '=' + h) + ' is the hypotenuse. ' + 'Relative to ' + t(A) + ': opp ' + t('=' + T.opp + '=' + T.o) + ', adj ' + t('=' + T.adj + '=' + T.a) + '. Relative to ' + t(B) + ' the two legs swap roles.<br>' +
        'Correct: ' + t(FT[right.f] + ' ' + right.X + '=\\frac{\\text{' + (right.f === 'cos' ? 'adj' : 'opp') + '}}{\\text{' + (right.f === 'tan' ? 'adj' : 'hyp') + '}}=' + uT(rp[0], rp[1])) + ' (relative to ' + t(right.X) + ', opp ' + t('=' + RT.opp) + ', adj ' + t('=' + RT.adj) + ').', ['Find the hypotenuse first, then test each option with SOH CAH TOA — for the angle named in that option.'], 'which ratio is correct');
    }
    /* Q11: what a ratio does and doesn't tell you */
    function q11(r) {
      var f = r.pick(['sin', 'sin', 'cos', 'tan']), pq = f === 'tan' ? r.pick([[9, 11], [5, 8], [7, 12], [4, 9]]) : r.pick([[9, 11], [5, 7], [4, 9], [7, 12], [3, 8]]), p = pq[0], q = pq[1];
      var top = f === 'cos' ? 'adjacent to' : 'opposite', bot = f === 'tan' ? 'adjacent' : 'hypotenuse', topN = f === 'cos' ? 'adjacent side' : 'opposite side';
      var kind = r.pick(['may', 'may', 'may', 'may2', 'always', 'never']), claim, ans;
      var sideTop = 'the side ' + top + ' ' + t('y^\\circ'), sideBot = f === 'tan' ? 'the side adjacent to ' + t('y^\\circ') : 'the hypotenuse';
      if (f === 'tan') sideTop = 'the side opposite ' + t('y^\\circ');
      if (kind === 'may') { claim = sideTop + ' is ' + t(p) + ' and ' + sideBot + ' is ' + t(q); ans = 'may'; }
      else if (kind === 'may2') { claim = sideTop + ' is ' + t(2 * p) + ' and ' + sideBot + ' is ' + t(2 * q); ans = 'may'; }
      else if (kind === 'always') { claim = sideTop + ' divided by ' + sideBot + ' is ' + t('\\frac{' + p + '}{' + q + '}'); ans = 'always'; }
      else { claim = sideTop + ' is ' + t(q) + ' and ' + sideBot + ' is ' + t(p); ans = 'never'; }
      var why = {
        always: 'Is it <i>always</i>? The ratio fixes only the <b>shape</b>. A triangle with sides ' + t(2 * p) + ' and ' + t(2 * q) + ' (or ' + t((p / 2)) + ' and ' + t((q / 2)) + ') has the same ratio.',
        never: 'It can happen: a triangle whose sides really are ' + t(p) + ' and ' + t(q) + ' (or any multiple) fits the ratio.',
        may: 'The ratio fixes ' + sideTop + ' ÷ ' + sideBot + ' — and that is true in <b>every</b> triangle with this angle.',
        depends: 'The value of ' + t('y^\\circ') + ' is already fixed by ' + t(FT[f] + ' y^\\circ=\\frac{' + p + '}{' + q + '}') + ', so this choice doesn’t make sense.'
      };
      var neverWhy = ans === 'never' ? null : ans === 'always' ? 'By definition this quotient is ' + t('\\frac{' + p + '}{' + q + '}') + ' in every right triangle with this angle, so the claim can’t be false.' : kind === 'may2' ? 'A triangle with sides ' + t(2 * p) + ' and ' + t(2 * q) + ' has ratio ' + t('\\frac{' + (2 * p) + '}{' + (2 * q) + '}=\\frac{' + p + '}{' + q + '}') + ', so the claim <b>can</b> be true.' : 'A triangle whose sides really are ' + t(p) + ' and ' + t(q) + ' fits the ratio, so the claim <b>can</b> be true.';
      var opts = [
        { html: 'is always true', right: ans === 'always', why: ans === 'may' ? why.always : ans === 'never' ? 'The ratio would then be ' + t('\\frac{' + q + '}{' + p + '}') + ', not ' + t('\\frac{' + p + '}{' + q + '}') + (f !== 'tan' ? ' — and a leg can’t be longer than the hypotenuse.' : '.') : null },
        { html: 'is always false', right: ans === 'never', why: neverWhy },
        { html: 'may be true or false', right: ans === 'may', why: ans === 'always' ? why.may : ans === 'never' ? 'With those numbers the ratio is ' + t('\\frac{' + q + '}{' + p + '}') + ', never ' + t('\\frac{' + p + '}{' + q + '}') + ' — it can’t be true for any triangle.' : null },
        { html: 'depends on the value of ' + t('y^\\circ'), why: why.depends }];
      var sol = {
        may: t(FT[f] + ' y^\\circ=\\frac{' + p + '}{' + q + '}') + ' fixes only the <b>ratio</b> ' + topN + ' : ' + (f === 'tan' ? 'adjacent side' : 'hypotenuse') + ', not the lengths. Sides ' + t(p) + ' and ' + t(q) + ' work — but so do ' + t(2 * p) + ' and ' + t(2 * q) + ', or ' + t(p / 2) + ' and ' + t(q / 2) + '. The claim <b>may be true or false</b>.',
        always: 'By definition ' + t(FT[f] + ' y^\\circ=' + RULE[f].replace(/^\\(sin|cos|tan)=/, '')) + ', so this ratio is ' + t('\\frac{' + p + '}{' + q + '}') + ' in every right triangle with this angle — <b>always true</b>.',
        never: 'Those lengths give the ratio ' + t('\\frac{' + q + '}{' + p + '}') + ', not ' + t('\\frac{' + p + '}{' + q + '}') + (f !== 'tan' ? ' (and a leg longer than the hypotenuse is impossible)' : '') + ', so the claim is <b>always false</b>.' }[ans];
      return mc(r, 'In a right triangle, ' + t(FT[f] + ' y^\\circ=\\dfrac{' + p + '}{' + q + '}') + '. A student claims ' + claim + '. This claim', opts, sol, ['A trig ratio tells you the <b>shape</b> of the triangle, not its size. Could the triangle be bigger or smaller?'], 'ratio claim ' + kind);
    }
  }

  /* =====================================================================================================
   * EXTRA PRACTICE
   * ===================================================================================================== */
  function EXTRA() {
    /* a table with rows "∠X: hyp / opp / adj" for one or two acute angles. angs: [{ T (relative to that angle), rows: ['hyp','opp','adj'] }] */
    function angleGrid(r, prompt, angs, sol, text) {
      var T0 = angs[0].T, sides = r.shuffle([T0.opp, T0.adj, T0.hyp]);
      var rows = [], want = {};
      angs.forEach(function (g) { g.rows.forEach(function (k) { var id = g.T.A + '-' + k; rows.push({ id: id, html: t('\\angle ' + g.T.A) + ': ' + ROWL[k] }); want[id] = g.T[k]; }); });
      var p = P.grid(prompt, rows, sides.map(function (s) { return { id: s, html: t(s) }; }), want, {}, sol, ['The hypotenuse is across from the right angle — it is the same side for both acute angles.', 'Opposite doesn’t touch the angle; adjacent touches it.'], text);
      p.check = function (resp) {
        resp = resp || {};
        var miss = rows.filter(function (x) { return !resp[x.id]; });
        if (miss.length === rows.length) return form('empty', 'Choose a side in each row.');
        if (miss.length) return form('incomplete', 'Finish every row (' + (rows.length - miss.length) + ' of ' + rows.length + ' done).');
        if (rows.every(function (x) { return resp[x.id] === want[x.id]; })) return ok();
        for (var i = 0; i < angs.length; i++) { var g = angs[i], X = g.T.A; if (g.rows.indexOf('hyp') >= 0 && resp[X + '-hyp'] !== g.T.hyp) return wrong('hyp-wrong', 'The hypotenuse is across from the right angle at ' + t(g.T.R) + ' — the side that doesn’t touch ' + t(g.T.R) + ', whichever acute angle you use.'); }
        for (var j = 0; j < angs.length; j++) {
          var G = angs[j], Y = G.T.A;
          if (resp[Y + '-opp'] === G.T.adj && resp[Y + '-adj'] === G.T.opp) return wrong('opp-adj-swap', 'For ' + t('\\angle ' + Y) + ', opposite and adjacent are swapped. The opposite side doesn’t touch ' + t(Y) + '; the adjacent side does.' + (j ? ' (When the reference angle moves to the other end of the hypotenuse, the two legs trade jobs.)' : ''));
          if (resp[Y + '-opp'] && resp[Y + '-opp'] === resp[Y + '-adj']) return wrong('side-dup', 'For ' + t('\\angle ' + Y) + ' you gave the same side two names. Each leg has one job for each angle.');
        }
        return wrong('row', null);
      };
      var sw = {}; Object.keys(want).forEach(function (k) { sw[k] = want[k]; });
      angs.forEach(function (g) { if (g.rows.indexOf('opp') >= 0) { sw[g.T.A + '-opp'] = g.T.adj; sw[g.T.A + '-adj'] = g.T.opp; } });
      p.bad = [sw];
      return p;
    }
    function lc(X) { return X.toLowerCase(); }
    function numCheck(ans, diag) { return K.number(ans, diag); }
    function nfF(prompt, flds, checks, keys, ans, sol, hints, text) { return P.fields(prompt, flds, checks, keys, ans, sol, hints, text); }

    return [
      /* ---------------- Part A ---------------- */
      { num: '1', section: 'Extra practice A — Naming the sides: the angle decides, not the page',
        stem: 'Each triangle is drawn in a non-standard orientation — rotated, reflected, or with the right angle somewhere other than the bottom left. <b>Find the right angle first.</b>',
        shared: function (r) {
          var sets = r.sample(LETS, 4), out = [];
          for (var i = 0; i < 4; i++) { var sh = r.pick([[4, 3], [3.2, 2.4], [3.4, 2.2], [3, 3.4], [12, 5], [15, 8]]), T = tri(names(r, 'any', sets[i]), sh[1], sh[0], 0); out.push({ T: T, or: ori(r, true), sh: sh }); }
          return out;
        },
        parts: [0, 1, 2, 3].reduce(function (acc, i) {
          var L = 'abcd'[i];
          var fig = function (sh) { var q = sh[i]; return triFig(q.T, { rot: q.or.rot, flip: q.or.flip, angA: 'x°', shape: q.sh }); };
          acc.push({ id: 'e1' + L + '1', sub: L + ' i', level: 'BEG', make: function (r, sh) { return sideGrid(r, sh[i].T, ['hyp', 'opp', 'adj'], 'x^\\circ', 'State the hypotenuse, the opposite side and the adjacent side relative to the marked angle ' + t('x^\\circ') + '.' + fig(sh)); } });
          acc.push({ id: 'e1' + L + '2', sub: L + ' ii', level: 'BEG', make: function (r, sh) { return ratioGrid(r, sh[i].T, 'x^\\circ', 'Write ' + t('\\sin x^\\circ') + ', ' + t('\\cos x^\\circ') + ' and ' + t('\\tan x^\\circ') + ' as ratios of side names.' + fig(sh)); } });
          return acc;
        }, []).concat([{ id: 'e1e', sub: 'e', level: 'BEG', make: function (r, sh) {
          var q = sh[r.int(0, 3)], T = q.T;
          return mc(r, 'Without measuring anything, which side of this triangle is the longest, and what settles it?' + triFig(T, { rot: q.or.rot, flip: q.or.flip, angA: 'x°', shape: q.sh }), [
            { html: t(T.hyp) + ' — it is across from the right angle, the largest angle of the triangle, so it is the hypotenuse.', right: true },
            { html: t(T.opp) + ' — it is opposite the marked angle ' + t('x^\\circ') + '.', why: 'The marked angle decides opp and adj, not the longest side. The longest side is across from the <b>largest</b> angle — the right angle.' },
            { html: t(T.adj) + ' — it touches the marked angle.', why: 'Touching the marked angle makes it the adjacent side. The longest side is across from the right angle.' },
            { html: 'It can’t be decided without measuring, because the triangle is tipped.', why: 'Turning a triangle on the page doesn’t change which angle is largest. The side across from the right angle is always the longest.' }],
            'In any triangle the longest side is across from the largest angle. In a right triangle the right angle (' + t('90^\\circ') + ') is larger than both acute angles, so the side across from it — the hypotenuse ' + t(T.hyp) + ' — is the longest, however the triangle is turned.', ['Which angle of a right triangle is the largest?'], 'longest side');
        } }]) },

      { num: '2', stem: function (sh) { var T = sh.TD; return 'In right triangle ' + t(sh.L.join('')) + ' the right angle is at ' + t(sh.L[1]) + ', with ' + t(T.adj + '=' + T.a) + ', ' + t(T.opp + '=' + T.o) + ' and ' + t(T.hyp + '=' + T.h) + '. The triangle has been tipped over so that none of its sides lies along the bottom of the page.' + triFig(T, { rot: sh.or.rot, flip: sh.or.flip, lab: labs(T) }); },
        shared: function (r) {
          var L = r.pick(LETS), tr = r.pick([[20, 21, 29], [8, 15, 17], [28, 45, 53], [33, 56, 65], [48, 55, 73], [65, 72, 97], [12, 35, 37]]);
          var TD = fromTriple(r, { A: L[0], B: L[2], R: L[1] }, tr);
          return { L: L, TD: TD, TF: other(TD), or: { rot: r.pick([0, 90, 180, 270]) + r.pick([-35, -25, 25, 35]), flip: r.chance(0.5) } };
        },
        parts: [
          { id: 'e2a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var D = sh.L[0], F = sh.L[2], TD = sh.TD, TF = sh.TF;
            return angleGrid(r, 'Complete the table. Work from the right angle every time, never from where a side sits on the page.', [{ T: TD, rows: ['hyp', 'opp', 'adj'] }, { T: TF, rows: ['hyp', 'opp', 'adj'] }],
              'The right angle is at ' + t(sh.L[1]) + ', so ' + t(TD.hyp) + ' is the hypotenuse for <b>both</b> acute angles.<br>' + t('\\angle ' + D) + ': opp ' + t('=' + TD.opp) + ', adj ' + t('=' + TD.adj) + '.<br>' + t('\\angle ' + F) + ': opp ' + t('=' + TF.opp) + ', adj ' + t('=' + TF.adj) + ' — the legs trade jobs.', 'two-angle side table');
          } },
          { id: 'e2b1', sub: 'b i', level: 'BEG', make: function (r, sh) { var X = sh.L[0]; return ratiosPart(sh.TD, ['sin', 'cos', 'tan'], X, 'Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { nameIt: true }); } },
          { id: 'e2b2', sub: 'b ii', level: 'BEG', make: function (r, sh) { var X = sh.L[2]; return ratiosPart(sh.TF, ['sin', 'cos', 'tan'], X, 'Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { nameIt: true }); } },
          { id: 'e2c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var TD = sh.TD, D = sh.L[0], F = sh.L[2], E = sh.L[1];
            return mc(r, 'When the reference angle changes from ' + t('\\angle ' + D) + ' to ' + t('\\angle ' + F) + ', one of hyp, opp and adj names the <b>same</b> side and the other two swap. Which is which, and why?', [
              { html: 'The hypotenuse ' + t(TD.hyp) + ' stays: it is fixed by the right angle at ' + t(E) + ', which doesn’t move. Each leg is across from one acute angle and touches the other, so opp and adj swap.', right: true },
              { html: 'The hypotenuse ' + t(TD.hyp) + ' stays, because it is the side at the bottom of the triangle.', why: 'Right side, wrong reason: where a side sits on the page means nothing. The hypotenuse is fixed by the <b>right angle</b>.' },
              { html: 'The opposite side stays, because it is always the longer leg.', why: 'Opposite is defined by the reference angle: ' + t(TD.opp) + ' is opposite ' + t(D) + ' but touches ' + t(F) + '. The side that stays is the hypotenuse.' },
              { html: 'The adjacent side stays, because both acute angles touch it.', why: 'Both acute angles touch the <b>hypotenuse</b> — but it is never called adjacent. The legs swap; the hypotenuse stays.' }],
              'The hypotenuse ' + t(TD.hyp) + ' is chosen by the right angle at ' + t(E) + ', which doesn’t move. “Opposite” means across from the reference angle and “adjacent” means touching it (and not the hypotenuse); moving from ' + t(D) + ' to ' + t(F) + ' moves the reference angle to the other end of the hypotenuse, so ' + t(TD.opp) + ' and ' + t(TD.adj) + ' trade jobs.', ['Which side is decided by the right angle rather than by the reference angle?'], 'which side stays');
          } }] },

      { num: '3', stem: function (sh) { return 'In right triangle ' + t(sh.L.join('')) + ' the right angle is at ' + t(sh.L[1]) + '. <b>No side lengths are given</b> — every part is answered from the side names alone.'; },
        shared: function (r) { var L = r.pick(LETS); return { L: L, TS: tri({ A: L[0], B: L[2], R: L[1] }, 1, 1, 1), TU: tri({ A: L[2], B: L[0], R: L[1] }, 1, 1, 1) }; },
        parts: [
          { id: 'e3a', sub: 'a', level: 'LIM', make: function (r, sh) {
            var L = sh.L, hyp = sn(L[0], L[2]);
            return mc(r, 'Name the hypotenuse. How do you know without seeing a single length?', [
              { html: t(hyp) + ' — the hypotenuse is the side across from the right angle at ' + t(L[1]) + '.', right: true },
              { html: t(sn(L[0], L[1])) + ' — it includes the right-angle vertex ' + t(L[1]) + '.', why: 'Both legs touch the right-angle vertex. The hypotenuse is the one side that does <b>not</b> touch ' + t(L[1]) + '.' },
              { html: t(sn(L[1], L[2])) + ' — it is the longest side.', why: 'With no lengths you can’t tell which side is longest by measuring — but you can find the side across from the right angle at ' + t(L[1]) + '.' },
              { html: 'It can’t be named without the side lengths.', why: 'The right angle alone decides it: the hypotenuse is across from it.' }],
              'The hypotenuse is, by definition, the side opposite the right angle. The right angle is at ' + t(L[1]) + ', so the hypotenuse joins the other two vertices: ' + t(hyp) + '.', ['Which side doesn’t touch the right angle?'], 'hyp from names');
          } },
          { id: 'e3b', sub: 'b', level: 'BEG', make: function (r, sh) {
            var L = sh.L;
            return angleGrid(r, 'Name the opposite and adjacent sides relative to each acute angle.', [{ T: sh.TS, rows: ['opp', 'adj'] }, { T: sh.TU, rows: ['opp', 'adj'] }],
              'Relative to ' + t('\\angle ' + L[0]) + ': the leg across the triangle is ' + t(sh.TS.opp) + ' (opp) and the leg touching ' + t(L[0]) + ' is ' + t(sh.TS.adj) + ' (adj).<br>Relative to ' + t('\\angle ' + L[2]) + ' the roles reverse: opp ' + t('=' + sh.TU.opp) + ', adj ' + t('=' + sh.TU.adj) + '. The hypotenuse ' + t(sh.TS.hyp) + ' is never “adjacent”.', 'opp/adj from names');
          } },
          { id: 'e3c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var L = sh.L, hyp = sh.TS.hyp;
            return mc(r, 'Exactly one of hyp, opp and adj names the same side for both acute angles. Which one, and why must that be so for <b>every</b> right triangle?', [
              { html: 'The hypotenuse (' + t(hyp) + '): it is fixed by the right angle, and a right triangle has only one right angle.', right: true },
              { html: 'The opposite side: each angle has the same side across from it.', why: 'Each acute angle has a <b>different</b> leg across from it. The side that never changes is the one across from the right angle.' },
              { html: 'The adjacent side: both acute angles touch it.', why: 'The side both acute angles touch is the hypotenuse — and it is never called adjacent.' },
              { html: 'None of them — all three change when the angle changes.', why: 'The hypotenuse depends only on the right angle, so it can’t change.' }],
              'The <b>hypotenuse</b> ' + t(hyp) + ' is decided by the right angle, not by the reference angle. A right triangle has exactly one right angle, so whichever acute angle is used, the side across from the right angle is the same side.', ['What decides the hypotenuse?'], 'hyp is fixed');
          } },
          { id: 'e3d', sub: 'd', level: 'PRG', make: function (r, sh) {
            var S = sh.L[0], U = sh.L[2], TS = sh.TS, leg = TS.opp;
            return mc(r, 'Why is ' + t('\\sin ' + S + '=\\cos ' + U) + ' in every right triangle with its right angle at ' + t(sh.L[1]) + '?', [
              { html: t(leg) + ' is opposite ' + t('\\angle ' + S) + ' and adjacent to ' + t('\\angle ' + U) + ', and ' + t(TS.hyp) + ' is the hypotenuse for both, so both ratios are ' + t('\\frac{' + leg + '}{' + TS.hyp + '}') + '.', right: true },
              { html: 'Because ' + t('\\angle ' + S) + ' and ' + t('\\angle ' + U) + ' are both ' + t('45^\\circ') + '.', why: 'They don’t have to be ' + t('45^\\circ') + ' — the result holds for every right triangle. Compare the two fractions side by side.' },
              { html: 'Because the sine and cosine of any angle are equal.', why: 'For one angle, sine and cosine are usually different (opp/hyp vs adj/hyp). The equality links <b>different</b> angles.' },
              { html: 'Because ' + t(TS.adj) + ' is adjacent to both acute angles.', why: t(TS.adj) + ' touches ' + t(S) + ' but is <b>opposite</b> ' + t(U) + '. Write out both ratios with side names.' }],
              t('\\sin ' + S + '=\\frac{\\text{opp}}{\\text{hyp}}=\\frac{' + leg + '}{' + TS.hyp + '}') + ' and ' + t('\\cos ' + U + '=\\frac{\\text{adj}}{\\text{hyp}}=\\frac{' + leg + '}{' + TS.hyp + '}') + '. The leg ' + t(leg) + ' is opposite ' + t(S) + ' and adjacent to ' + t(U) + ', and ' + t(TS.hyp) + ' is the hypotenuse for both, so the two ratios are the identical fraction.', ['Write both ratios using side names.'], 'sin S = cos U');
          } }] },

      /* ---------------- Part B ---------------- */
      { num: '4', section: 'Extra practice B — All three ratios, exactly, for both acute angles',
        stem: function (sh) { var T = sh.T; return 'Right triangle ' + t(sh.L.join('')) + ' has its right angle at ' + t(sh.L[2]) + ', as shown.' + triFig(T, { rot: sh.or.rot, flip: sh.or.flip, lab: labs(T) }); },
        shared: function (r) {
          var c = r.pick([[[8, 15, 17], 3], [[8, 15, 17], 2], [[3, 4, 5], r.int(3, 9)], [[5, 12, 13], r.int(2, 4)], [[7, 24, 25], 2], [[20, 21, 29], 2]]), L = r.pick(LETS);
          var T = fromTriple(r, { A: L[0], B: L[1], R: L[2] }, c[0], c[1]);
          return { L: L, T: T, k: c[1], base: c[0], or: ori(r, false) };
        },
        parts: [
          { id: 'e4a', sub: 'a', level: 'BEG', make: function (r, sh) { var X = sh.L[0]; return ratiosPart(sh.T, ['sin', 'cos', 'tan'], X, 'Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { nameIt: true }); } },
          { id: 'e4b', sub: 'b', level: 'BEG', make: function (r, sh) { var X = sh.L[1]; return ratiosPart(other(sh.T), ['sin', 'cos', 'tan'], X, 'Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { nameIt: true }); } },
          { id: 'e4c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var T = sh.T, k = sh.k, b = sh.base, o = T.o, h = T.h, f = frc(o, h);
            return mc(r, 'Every one of the six fractions reduces — for example ' + t(uT(o, h) + '=' + ex.texRat(f)) + '. What do these two fractions have in common <b>geometrically</b>, and why doesn’t reducing change the angle?', [
              { html: 'The ' + (b[0] * k) + '–' + (b[1] * k) + '–' + (b[2] * k) + ' triangle is the ' + b[0] + '–' + b[1] + '–' + b[2] + ' triangle enlarged by a factor of ' + t(k) + ': the two triangles are similar, so they have the same angles.', right: true },
              { html: 'Reducing the fraction makes the triangle smaller, so the angle becomes smaller too.', why: 'Shrinking a triangle by the same factor on every side keeps its <b>shape</b> — its angles don’t change.' },
              { html: 'Nothing — reducing is only arithmetic and has no geometric meaning.', why: 'The reduced fraction describes a smaller, <b>similar</b> triangle with the very same angle.' },
              { html: t(ex.texRat(f)) + ' gives the actual lengths of the sides.', why: 'The sides are ' + t(nf(o)) + ' and ' + t(nf(h)) + '. The reduced fraction gives only their <b>ratio</b>.' }],
              t(uT(o, h)) + ' and ' + t(ex.texRat(f)) + ' are the same number: ' + t(nf(o) + '=' + k + '\\times ' + (o / k) + '') + ' and ' + t(nf(h) + '=' + k + '\\times ' + (h / k)) + '. Geometrically, this triangle is the ' + b[0] + '–' + b[1] + '–' + b[2] + ' triangle enlarged by a scale factor of ' + t(k) + ' — the two are <b>similar</b>, with equal corresponding angles. Dividing top and bottom by ' + t(k) + ' changes the size, never the shape.', ['What scale factor takes the reduced triangle to this one?'], 'reducing = similar triangle');
          } }] },

      { num: '5', stem: function (sh) { var T = sh.T; return 'In right triangle ' + t(sh.L.join('')) + ' the right angle is at ' + t(sh.L[1]) + ' and the sides are given as decimals. Clear the decimals before you reduce.' + triFig(T, { rot: sh.or.rot, flip: sh.or.flip, lab: labs(T) }); },
        shared: function (r) {
          var c = r.pick([[[3, 4, 5], [0.3, 0.6, 0.7, 0.9, 1.1, 1.3, 0.9]], [[5, 12, 13], [0.2, 0.3, 0.4, 0.6]], [[8, 15, 17], [0.2, 0.3]], [[7, 24, 25], [0.2, 0.3]]]), L = r.pick(LETS);
          var T = fromTriple(r, { A: L[0], B: L[2], R: L[1] }, c[0], r.pick(c[1]));
          return { L: L, T: T, or: ori(r, false) };
        },
        parts: [
          { id: 'e5a', sub: 'a', level: 'EMG', make: function (r, sh) { var X = sh.L[0]; return ratiosPart(sh.T, ['sin', 'cos', 'tan'], X, 'Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { nameIt: true }); } },
          { id: 'e5b', sub: 'b', level: 'EMG', make: function (r, sh) { var X = sh.L[2]; return ratiosPart(other(sh.T), ['sin', 'cos', 'tan'], X, 'Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { nameIt: true }); } }] },

      { num: '6', stem: function (sh) { var T = sh.T; return 'In right triangle ' + t(sh.L.join('')) + ' the right angle is at ' + t(sh.L[1]) + ', ' + t(T.adj + '=' + T.a) + ' and ' + t(T.opp + '=' + T.o) + '. The hypotenuse is <b>not</b> given — recover it with the Pythagorean theorem, then the ratios follow.' + triFig(T, { rot: sh.or.rot, flip: sh.or.flip, lab: { o: T.o, a: T.a, h: '?' } }); },
        shared: function (r) {
          var c = r.pick([[[7, 24, 25], 2], [[3, 4, 5], r.int(3, 8)], [[5, 12, 13], r.int(2, 4)], [[8, 15, 17], r.int(2, 3)], [[20, 21, 29], 2], [[9, 40, 41], 2]]), L = r.pick(LETS);
          var T = fromTriple(r, { A: L[0], B: L[2], R: L[1] }, c[0], c[1]);
          return { L: L, T: T, or: ori(r, false) };
        },
        parts: [
          { id: 'e6a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var T = sh.T, h = T.h;
            var p = P.number('Determine ' + t(T.hyp) + ' exactly.', h, pythDiag(h, T.o, T.a, false), t(T.hyp) + ' is across from the right angle at ' + t(T.R) + ', so it is the hypotenuse and the two legs’ squares are <b>added</b>:<br>' + t(T.hyp + '^2=' + T.a + '^2+' + T.o + '^2=' + (T.a * T.a) + '+' + (T.o * T.o) + '=' + (h * h)) + '<br>' + t(T.hyp + '=\\sqrt{' + (h * h) + '}=' + h), ['The hypotenuse is the missing side: ' + t('\\text{hyp}^2=\\text{leg}^2+\\text{leg}^2') + '.'], 'hyp from legs ' + T.o + ', ' + T.a, { before: t(T.hyp + '=') });
            p.bad = [String(T.o + T.a), String(h * h)];
            return p;
          } },
          { id: 'e6b', sub: 'b', level: 'EMG', make: function (r, sh) { var X = sh.L[0], T = sh.T; return ratiosPart(T, ['sin', 'cos', 'tan'], X, 'The hypotenuse is ' + t(T.hyp + '=' + T.h) + '. Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { nameIt: true }); } },
          { id: 'e6c1', sub: 'c i', level: 'EMG', make: function (r, sh) { var X = sh.L[2], T = other(sh.T); return ratiosPart(T, ['sin', 'cos', 'tan'], X, 'The hypotenuse is ' + t(T.hyp + '=' + T.h) + '. Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { nameIt: true }); } },
          { id: 'e6c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            var M = sh.L[0], Pn = sh.L[2], T = sh.T, s1 = fT(T.o, T.h), c1 = fT(T.a, T.h);
            return mc(r, 'With ' + t(sh.L[1]) + ' the right angle, which of the six ratios of ' + t('\\angle ' + M) + ' and ' + t('\\angle ' + Pn) + ' are equal to one another?', [
              { html: t('\\sin ' + M + '=\\cos ' + Pn) + ' and ' + t('\\cos ' + M + '=\\sin ' + Pn), right: true },
              { html: t('\\sin ' + M + '=\\sin ' + Pn) + ' and ' + t('\\cos ' + M + '=\\cos ' + Pn), why: t('\\sin ' + M + '=' + s1) + ' but ' + t('\\sin ' + Pn + '=' + c1) + ' — the legs swap roles between the two angles.' },
              { html: t('\\tan ' + M + '=\\tan ' + Pn), why: 'The tangents are ' + t(fT(T.o, T.a)) + ' and ' + t(fT(T.a, T.o)) + ' — reciprocals, not equal.' },
              { html: t('\\sin ' + M + '=\\cos ' + M), why: 'For one angle, sine and cosine use different legs: ' + t(s1) + ' and ' + t(c1) + '.' }],
              t('\\sin ' + M + '=\\cos ' + Pn + '=' + s1) + ' and ' + t('\\cos ' + M + '=\\sin ' + Pn + '=' + c1) + '. The tangents ' + t(fT(T.o, T.a)) + ' and ' + t(fT(T.a, T.o)) + ' are reciprocals, not equal.', ['The leg opposite one acute angle is adjacent to the other.'], 'which ratios equal');
          } }] },

      { num: '7', stem: function (sh) { var T = sh.T; return 'In right triangle ' + t(sh.L.join('')) + ' the right angle is at ' + t(sh.L[1]) + '. This time the <b>hypotenuse</b> is known, ' + t(T.hyp + '=' + T.h) + ', and one leg is known, ' + t(T.opp + '=' + T.o) + '.' + triFig(T, { rot: sh.or.rot, flip: sh.or.flip, lab: { o: T.o, a: '?', h: T.h } }); },
        shared: function (r) {
          var tr = r.pick([[11, 60, 61], [9, 40, 41], [13, 84, 85], [20, 21, 29], [12, 35, 37], [16, 63, 65], [28, 45, 53], [33, 56, 65]]), L = r.pick(LETS);
          var T = fromTriple(r, { A: L[2], B: L[0], R: L[1] }, tr, 1, r.chance(0.7));
          return { L: L, T: T, or: ori(r, false) };
        },
        parts: [
          { id: 'e7a1', sub: 'a i', level: 'EMG', make: function (r, sh) {
            var T = sh.T, a = T.a;
            var p = P.number('Determine ' + t(T.adj) + ' exactly.', a, pythDiag(a, T.h, T.o, true), 'The hypotenuse is known and a leg is missing, so subtract:<br>' + t(T.adj + '^2=' + T.hyp + '^2-' + T.opp + '^2=' + T.h + '^2-' + T.o + '^2=' + (T.h * T.h) + '-' + (T.o * T.o) + '=' + (a * a)) + '<br>' + t(T.adj + '=\\sqrt{' + (a * a) + '}=' + a), ['The missing side is a leg — it must be shorter than ' + t(T.h) + '.'], 'leg from hyp ' + T.h + ', leg ' + T.o, { before: t(T.adj + '=') });
            p.bad = [String(K.roundTo(Math.sqrt(T.h * T.h + T.o * T.o), 2)), String(T.h - T.o)];
            return p;
          } },
          { id: 'e7a2', sub: 'a ii', level: 'EMG', make: function (r, sh) {
            var T = sh.T, x = T.adj, H = T.hyp, l = T.opp;
            return mc(r, 'Which rearrangement of the Pythagorean theorem finds ' + t(x) + ', and why is it different from finding a missing hypotenuse?', [
              { html: t(x + '^2=' + H + '^2-' + l + '^2') + ': here the hypotenuse is known and a leg is missing, so the known leg’s square is <b>subtracted</b> from the hypotenuse’s.', right: true },
              { html: t(x + '^2=' + H + '^2+' + l + '^2') + ', the same as always: add the squares of the two sides you know.', why: 'Adding gives ' + t('\\sqrt{' + (T.h * T.h + T.o * T.o) + '}\\approx ' + Math.sqrt(T.h * T.h + T.o * T.o).toFixed(2)) + ', longer than the hypotenuse — impossible for a leg.' },
              { html: t(x + '=' + H + '-' + l) + ': subtract the lengths.', why: 'The theorem works with the <b>squares</b> of the sides: ' + t(T.h + '-' + T.o + '=' + (T.h - T.o)) + ' isn’t ' + t(T.a) + '.' },
              { html: t(x + '^2=' + l + '^2-' + H + '^2') + ': subtract in the order the sides are named.', why: 'That is negative — the hypotenuse is the longest side, so its square comes first.' }],
              t(l + '^2+' + x + '^2=' + H + '^2\\ \\Rightarrow\\ ' + x + '^2=' + H + '^2-' + l + '^2') + '. When the missing side <b>is</b> the hypotenuse, the legs’ squares are added; when the missing side is a leg, subtract. Adding here would give a “leg” longer than the hypotenuse.', ['Is the missing side the hypotenuse or a leg?'], 'which rearrangement');
          } },
          { id: 'e7b', sub: 'b', level: 'EMG', make: function (r, sh) { var T = sh.T, X = T.A; return ratiosPart(T, ['sin', 'cos', 'tan'], X, 'The missing leg is ' + t(T.adj + '=' + T.a) + '. Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { nameIt: true }); } }] },

      /* ---------------- Part C ---------------- */
      { num: '8', section: 'Extra practice C — Why the ratios are well defined: similar triangles',
        stem: function (sh) { return 'In the diagram, ' + t('\\triangle ACB') + ' has its right angle at ' + t('C') + '. Point ' + t('D') + ' lies on ' + t('AC') + ' and point ' + t('E') + ' lies on ' + t('AB') + ', with ' + t('DE\\perp AC') + '. The triangles ' + t('\\triangle ADE') + ' and ' + t('\\triangle ACB') + ' share the acute angle ' + t('x^\\circ') + ' at ' + t('A') + '.' + sh.fig; },
        shared: function (r) {
          var combos = [];
          [[3, 4, 5], [5, 12, 13], [8, 15, 17]].forEach(function (b) { [true, false].forEach(function (os) { [1, 2, 3, 4].forEach(function (k) { [1.5, 2, 2.5, 3].forEach(function (s) {
            var o = (os ? b[0] : b[1]) * k, a = (os ? b[1] : b[0]) * k, h = b[2] * k;
            if ([o * s, a * s, h * s].every(function (v) { return Math.abs(v - Math.round(v)) < 1e-9; }) && h * s <= 70 && h >= 5) combos.push({ o: o, a: a, h: h, s: s });
          }); }); }); });
          var c = r.chance(0.25) ? { o: 6, a: 8, h: 10, s: 2.5 } : r.pick(combos);
          var O = c.o * c.s, Aa = c.a * c.s, H = c.h * c.s;
          var W = 4, q = Math.max(0.35, Math.min(1.6, O / Aa)), f = c.a / Aa;
          var raw = { A: [0, 0], D: [W * f, 0], C: [W, 0], E: [W * f, W * q * f], B: [W, W * q] };
          var rot = r.pick([0, 0, 90, 180, 270]), flip = r.chance(0.5);
          var fig = '<div class="fig" style="text-align:center;margin:6px 0">' + HW.fig({ pts: xf(raw, rot, flip), segs: [['A', 'D', String(c.a)], ['D', 'C', String(Aa - c.a)], ['C', 'B', String(O)], ['D', 'E', String(c.o)], ['A', 'E', String(c.h)], ['E', 'B', String(H - c.h)]],
            right: [['D', 'A', 'E'], ['C', 'D', 'B']], angles: [['A', 'C', 'B', 'x°']], width: 290, aria: 'nested right triangles' }) + '</div>';
          return { c: c, O: O, Aa: Aa, H: H, fig: fig, Ts: tri({ A: 'A', B: 'E', R: 'D' }, c.o, c.a, c.h), Tb: tri({ A: 'A', B: 'B', R: 'C' }, O, Aa, H) };
        },
        parts: [
          { id: 'e8a', sub: 'a', level: 'BEG', make: function (r, sh) { return ratiosPart(sh.Ts, ['sin', 'cos', 'tan'], 'x^\\circ', 'Using <b>only</b> ' + t('\\triangle ADE') + ', write ' + t('\\sin x^\\circ') + ', ' + t('\\cos x^\\circ') + ' and ' + t('\\tan x^\\circ') + ' in lowest terms.'); } },
          { id: 'e8b1', sub: 'b i', level: 'BEG', make: function (r, sh) {
            var c = sh.c;
            var p = P.fields('Determine the lengths of ' + t('AC') + ' and ' + t('AB') + '.', [{ name: 'AC', before: t('AC=') }, { name: 'AB', before: t('AB=') }],
              [numCheck(sh.Aa, function (v) { if (Math.abs(v - (sh.Aa - c.a)) < 1e-9) return { code: 'value', hint: t('AC') + ' is the whole side: ' + t('AD+DC') + '.' }; return null; }), numCheck(sh.H, function (v) { if (Math.abs(v - (sh.H - c.h)) < 1e-9) return { code: 'value', hint: t('AB') + ' is the whole side: ' + t('AE+EB') + '.' }; if (Math.abs(v - Math.sqrt(sh.Aa * sh.Aa + sh.O * sh.O)) < 1e-9) return null; return null; })],
              [String(sh.Aa), String(sh.H)], t('AC=' + sh.Aa + ',\\ AB=' + sh.H), t('AC=AD+DC=' + c.a + '+' + (sh.Aa - c.a) + '=' + sh.Aa) + '<br>' + t('AB=AE+EB=' + c.h + '+' + (sh.H - c.h) + '=' + sh.H), ['Each long side is made of two labelled pieces.'], 'nested lengths');
            return p;
          } },
          { id: 'e8b2', sub: 'b ii', level: 'BEG', make: function (r, sh) { return ratiosPart(sh.Tb, ['sin', 'cos', 'tan'], 'x^\\circ', 'Now using <b>only</b> ' + t('\\triangle ACB') + ' (with ' + t('AC=' + sh.Aa) + ' and ' + t('AB=' + sh.H) + '), write ' + t('\\sin x^\\circ') + ', ' + t('\\cos x^\\circ') + ' and ' + t('\\tan x^\\circ') + ' in lowest terms.'); } },
          { id: 'e8c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var c = sh.c, s = c.s;
            return mc(r, 'The two sets of ratios are identical. Why did they have to come out this way?', [
              { html: 'The triangles are <b>similar</b> (they share ' + t('\\angle A') + ' and each has a right angle), so ' + t('\\triangle ACB') + ' is ' + t('\\triangle ADE') + ' enlarged by ' + t(nf(s)) + ' — and multiplying the top and bottom of a fraction by ' + t(nf(s)) + ' leaves it unchanged.', right: true },
              { html: 'Because both triangles use the same hypotenuse.', why: 'They have different hypotenuses, ' + t('AE=' + c.h) + ' and ' + t('AB=' + sh.H) + '. It’s the shared angle — similarity — that matters.' },
              { html: 'Because ' + t('DE') + ' is parallel to the ground.', why: t('DE') + ' is parallel to ' + t('CB') + ', which is what makes the angles match — but the reason the <b>ratios</b> match is that the triangles are similar, so the sides scale by the same factor.' },
              { html: 'It is a coincidence of the numbers chosen.', why: 'It happens for any point ' + t('D') + ' on ' + t('AC') + ': the small triangle is always similar to the large one.' }],
              t('\\triangle ADE') + ' and ' + t('\\triangle ACB') + ' share ' + t('\\angle A') + ', and ' + t('\\angle ADE=\\angle ACB=90^\\circ') + ', so their third angles match too: they are <b>similar</b>. Corresponding sides are in a constant ratio — ' + t('\\frac{' + sh.Aa + '}{' + c.a + '}=' + nf(s)) + ' — and multiplying the numerator and denominator by ' + t(nf(s)) + ' leaves each fraction unchanged.', ['What do the two triangles have in common?'], 'why same ratios nested');
          } },
          { id: 'e8d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var c = sh.c;
            return mc(r, 'A classmate says “' + t('\\tan x^\\circ') + ' depends on how big you draw the triangle.” Which statement shows the claim is false using this diagram?', [
              { html: t('\\triangle ACB') + ' is ' + t(nf(c.s)) + ' times the size of ' + t('\\triangle ADE') + ', yet ' + t('\\tan x^\\circ=\\frac{' + c.o + '}{' + c.a + '}=\\frac{' + sh.O + '}{' + sh.Aa + '}=' + fT(c.o, c.a)) + ' in both.', right: true },
              { html: t('\\tan x^\\circ') + ' is ' + t(fT(c.o, c.a)) + ' in the small triangle but ' + t(fT(sh.O, c.a)) + ' in the large one.', why: 'In the large triangle use its own adjacent side, ' + t('AC=' + sh.Aa) + ': ' + t('\\frac{' + sh.O + '}{' + sh.Aa + '}=' + fT(sh.O, sh.Aa)) + '.' },
              { html: 'The claim is true: the larger triangle has a larger opposite side, so a larger tangent.', why: 'Its adjacent side is larger by the <b>same factor</b>, so the quotient doesn’t change.' },
              { html: 'The tangent is the same because both triangles have the same hypotenuse.', why: 'The hypotenuses are ' + t(c.h) + ' and ' + t(sh.H) + ' — and tangent doesn’t use the hypotenuse at all.' }],
              'The claim is false: ' + t('\\tan x^\\circ=\\frac{' + c.o + '}{' + c.a + '}=\\frac{' + sh.O + '}{' + sh.Aa + '}=' + fT(c.o, c.a)) + ' in both triangles, although one is ' + t(nf(c.s)) + ' times the other. Enlarging multiplies both sides of the ratio by the same factor, which cancels; only changing the <b>angle</b> changes a trigonometric ratio.', ['Compare opp ÷ adj in the two triangles.'], 'tan does not depend on size');
          } }] },

      { num: '9', stem: function (sh) {
          return 'The two right triangles below are <b>not</b> the same size and are <b>not</b> drawn the same way up. Each has its marked acute angle at the vertex named first.' +
            twoFigs(triFig(sh.T1, { rot: sh.or1.rot, flip: sh.or1.flip, angA: lc(sh.T1.A) + '°', lab: labs(sh.T1), width: 220 }), triFig(sh.T2, { rot: sh.or2.rot, flip: sh.or2.flip, angA: lc(sh.T2.A) + '°', lab: labs(sh.T2), width: 220 }));
        },
        shared: function (r) {
          var tr = r.pick([[48, 55, 73], [20, 21, 29], [28, 45, 53], [33, 56, 65], [8, 15, 17], [36, 77, 85], [39, 80, 89], [12, 35, 37]]), m = tr[2] < 40 ? r.pick([2, 3]) : 2;
          var two = r.sample(LETS.filter(function (L) { return L.indexOf('I') < 0 && L[0] !== 'L'; }), 2), os = r.chance(0.5);
          var T1 = fromTriple(r, { A: two[0][0], B: two[0][2], R: two[0][1] }, tr, 1, os), T2 = fromTriple(r, { A: two[1][0], B: two[1][2], R: two[1][1] }, tr, m, os);
          var r1 = r.pick([0, 90, 180, 270]), r2 = (r1 + r.pick([90, 180, 270])) % 360;
          return { tr: tr, m: m, T1: T1, T2: T2, or1: { rot: r1, flip: false }, or2: { rot: r2, flip: true } };
        },
        parts: [
          { id: 'e9a', sub: 'a', level: 'BEG', make: function (r, sh) { var a = lc(sh.T1.A) + '^\\circ'; return ratiosPart(sh.T1, ['sin', 'cos', 'tan'], a, 'Write ' + t('\\sin ' + a) + ', ' + t('\\cos ' + a) + ' and ' + t('\\tan ' + a) + ' in lowest terms.', { nameIt: true }); } },
          { id: 'e9b', sub: 'b', level: 'EMG', make: function (r, sh) { var a = lc(sh.T2.A) + '^\\circ'; return ratiosPart(sh.T2, ['sin', 'cos', 'tan'], a, 'Write ' + t('\\sin ' + a) + ', ' + t('\\cos ' + a) + ' and ' + t('\\tan ' + a) + ' in lowest terms.', { nameIt: true }); } },
          { id: 'e9c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var T1 = sh.T1, T2 = sh.T2, m = sh.m, p1 = T1.o + T1.a + T1.h, a1 = lc(T1.A), a2 = lc(T2.A);
            return mc(r, 'The perimeter of ' + t('\\triangle ' + T1.A + T1.R + T1.B) + ' is ' + t(p1) + ' and the perimeter of ' + t('\\triangle ' + T2.A + T2.R + T2.B) + ' is ' + t(p1 * m) + ' — one triangle is exactly ' + (m === 2 ? 'twice' : 'three times') + ' the other. The ratios for ' + t(a1 + '^\\circ') + ' and ' + t(a2 + '^\\circ') + ' came out equal anyway. What does that say a trigonometric ratio measures?', [
              { html: 'Only the <b>shape</b> — the size of the angle. Every side was multiplied by ' + t(m) + ', and the ' + t(m) + ' cancels in each ratio, so the triangles are similar and ' + t(a1 + '^\\circ=' + a2 + '^\\circ') + '.', right: true },
              { html: 'The size of the triangle: bigger triangles give bigger ratios.', why: 'The ratios were <b>equal</b> although one triangle is ' + t(m) + ' times the other — size doesn’t change them.' },
              { html: 'The orientation: the ratios match because both triangles are drawn the same way up.', why: 'They are drawn differently on purpose. Turning or flipping a triangle changes nothing about its ratios.' },
              { html: 'The perimeter of the triangle.', why: 'The perimeters are ' + t(p1) + ' and ' + t(p1 * m) + ', but the ratios are equal — the ratio ignores size.' }],
              'Every side of the larger triangle is exactly ' + t(m) + ' times the matching side of the smaller one (' + t(T2.o + '=' + m + '\\times ' + T1.o) + ', ' + t(T2.a + '=' + m + '\\times ' + T1.a) + ', ' + t(T2.h + '=' + m + '\\times ' + T1.h) + '), so the triangles are similar and the angles are equal. In each ratio the factor ' + t(m) + ' appears on top and bottom and cancels. A trigonometric ratio measures only the <b>shape</b> — the angle — not the size or the orientation.', ['What happens to a fraction if you multiply its top and bottom by the same number?'], 'ratio measures shape');
          } },
          { id: 'e9d', sub: 'd', level: 'BEG', make: function (r, sh) {
            var T1 = sh.T1, ang = TG.atan(T1.o / T1.a), a1 = lc(T1.A), a2 = lc(sh.T2.A);
            return P.near('Use ' + t('\\tan^{-1}') + ' to find the measure of ' + t(a1 + '^\\circ') + ' (and of ' + t(a2 + '^\\circ') + ') to the nearest degree.', ang, 0, { unit: '°', alts: [
              { v: 90 - ang, code: 'other-angle', hint: 'That’s the <b>other</b> acute angle. Use ' + t('\\tan^{-1}\\left(\\frac{\\text{opp}}{\\text{adj}}\\right)') + ' with the opposite side of ' + t(a1 + '^\\circ') + ' on top.' },
              { v: Math.atan(T1.o / T1.a), code: 'radian', hint: 'Your calculator is in <b>radian</b> mode. Switch to degree mode (DEG) and try again.' },
              { v: TG.tan(T1.o / T1.a), code: 'value', hint: 'Use the <b>inverse</b> tangent, ' + t('\\tan^{-1}') + ' (usually 2nd/SHIFT, then tan), not tan.' }] },
              t(a1 + '^\\circ=\\tan^{-1}\\left(\\frac{' + T1.o + '}{' + T1.a + '}\\right)=' + ang.toFixed(4) + '\\ldots^\\circ\\approx ' + Math.round(ang) + '^\\circ') + '<br>' + t(a2 + '^\\circ=\\tan^{-1}\\left(\\frac{' + sh.T2.o + '}{' + sh.T2.a + '}\\right)=' + ang.toFixed(4) + '\\ldots^\\circ\\approx ' + Math.round(ang) + '^\\circ') + ' — they agree exactly, as similarity requires.',
              ['tan = opp/adj, so the angle is ' + t('\\tan^{-1}\\left(\\frac{\\text{opp}}{\\text{adj}}\\right)') + '.', 'Check that your calculator is in degree mode.'], 'angle by inverse tan');
          } }] },

      { num: '10', stem: function (sh) {
          return 'The two right triangles below are similar: the marked angle ' + t('\\theta') + ' is the same in both. Only the hypotenuse of the larger triangle is known.' +
            twoFigs(triFig(sh.Ts, { angA: 'θ', lab: labs(sh.Ts), width: 180, rot: sh.rot, flip: sh.flip }), triFig(sh.Tb, { angA: 'θ', lab: { o: '?', a: '?', h: String(sh.Tb.h) }, width: 250, rot: sh.rot, flip: sh.flip }));
        },
        shared: function (r) {
          for (var g = 0; g < 200; g++) {
            var b = r.pick([[3, 4, 5], [3, 4, 5], [5, 12, 13], [8, 15, 17]]), k = b[2] === 5 ? r.int(1, 4) : 1, os = r.chance(0.5), mult = b[2] === 5 ? r.int(3, 12) : r.int(2, 4);
            if (g === 0 && r.chance(0.3)) { b = [3, 4, 5]; k = 3; os = true; mult = 8; }
            var H = b[2] * mult; if (mult === k || H > 60 || mult % k === 0) continue;
            var o = (os ? b[0] : b[1]), a = (os ? b[1] : b[0]);
            return { b: b, k: k, rot: r.pick([0, 90, 180, 270]), flip: r.chance(0.5), Ts: tri({ A: 'B', B: 'A', R: 'C' }, o * k, a * k, b[2] * k), Tb: tri({ A: 'Q', B: 'P', R: 'R' }, o * mult, a * mult, H) };
          }
          return null;
        },
        parts: [
          { id: 'e10a', sub: 'a', level: 'BEG', make: function (r, sh) { return ratiosPart(sh.Ts, ['sin', 'cos'], '\\theta', 'Using the small triangle, write ' + t('\\sin\\theta') + ' and ' + t('\\cos\\theta') + ' in lowest terms.', { nameIt: true }); } },
          { id: 'e10b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var Ts = sh.Ts, Tb = sh.Tb, s = fT(Ts.o, Ts.h), c = fT(Ts.a, Ts.h);
            var p = P.fields('Use ' + t('\\sin\\theta=' + s) + ' and ' + t('\\cos\\theta=' + c) + ' to determine ' + t(Tb.opp) + ' and ' + t(Tb.adj) + '.', [{ name: Tb.opp, before: t(Tb.opp + '=') }, { name: Tb.adj, before: t(Tb.adj + '=') }],
              [numCheck(Tb.o, function (v) { if (Math.abs(v - Tb.a) < 1e-9) return { code: 'opp-adj-swap', hint: t(Tb.opp) + ' is <b>opposite</b> ' + t('\\theta') + ' (it doesn’t touch ' + t(Tb.A) + '), so use the sine.' }; if (Math.abs(v - Tb.h / (Ts.o / Ts.h)) < 0.01) return { code: 'ratio-flip', hint: 'Multiply: ' + t(s + '=\\frac{' + Tb.opp + '}{' + Tb.h + '}') + ', so ' + t(Tb.opp + '=' + s + '\\times ' + Tb.h) + '.' }; return null; }),
                numCheck(Tb.a, function (v) { if (Math.abs(v - Tb.o) < 1e-9) return { code: 'opp-adj-swap', hint: t(Tb.adj) + ' is <b>adjacent</b> to ' + t('\\theta') + ' (it touches ' + t(Tb.A) + '), so use the cosine.' }; if (Math.abs(v - Tb.h / (Ts.a / Ts.h)) < 0.01) return { code: 'ratio-flip', hint: 'Multiply: ' + t(c + '=\\frac{' + Tb.adj + '}{' + Tb.h + '}') + ', so ' + t(Tb.adj + '=' + c + '\\times ' + Tb.h) + '.' }; return null; })],
              [String(Tb.o), String(Tb.a)], t(Tb.opp + '=' + Tb.o + ',\\ ' + Tb.adj + '=' + Tb.a),
              'In the large triangle the right angle is at ' + t(Tb.R) + ', so ' + t(Tb.hyp + '=' + Tb.h) + ' is the hypotenuse; ' + t(Tb.opp) + ' is opposite ' + t('\\theta') + ' and ' + t(Tb.adj) + ' is adjacent.<br>' + t('\\sin\\theta=\\frac{' + Tb.opp + '}{' + Tb.h + '}\\Rightarrow ' + Tb.opp + '=' + s + '\\times ' + Tb.h + '=' + Tb.o) + '<br>' + t('\\cos\\theta=\\frac{' + Tb.adj + '}{' + Tb.h + '}\\Rightarrow ' + Tb.adj + '=' + c + '\\times ' + Tb.h + '=' + Tb.a),
              ['Write ' + t('\\sin\\theta=\\frac{\\text{opp}}{\\text{hyp}}') + ' for the large triangle and multiply both sides by the hypotenuse.'], 'sides from ratios');
            return p;
          } },
          { id: 'e10c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var Ts = sh.Ts, Tb = sh.Tb, kf = frc(Tb.h, Ts.h), kt = ex.texRat(kf);
            var p = P.fields('Redo it with the scale factor from ' + t(Ts.h) + ' to ' + t(Tb.h) + ' (the hypotenuses): give the scale factor as a fraction in lowest terms, then ' + t(Tb.opp) + ' and ' + t(Tb.adj) + '.', [{ name: 'Scale factor', before: t('k='), mode: 'math', keys: 'fraction' }, { name: Tb.opp, before: t(Tb.opp + '='), mode: 'math', keys: 'fraction' }, { name: Tb.adj, before: t(Tb.adj + '='), mode: 'math', keys: 'fraction' }],
              [K.fraction(kf, { diag: function (v) { if (Math.abs(v - Ts.h / Tb.h) < 1e-9) return { code: 'scale-flip', hint: 'Upside down: going from small to large, the scale factor is (large) ÷ (small) ' + t('=\\frac{' + Tb.h + '}{' + Ts.h + '}') + '.' }; return null; } }), K.value(Tb.o, { only: 'integer' }), K.value(Tb.a, { only: 'integer' })],
              [kt, String(Tb.o), String(Tb.a)], t('k=' + kt + ',\\ ' + Tb.opp + '=' + Tb.o + ',\\ ' + Tb.adj + '=' + Tb.a),
              'Scale factor ' + t('k=\\frac{' + Tb.h + '}{' + Ts.h + '}=' + kt) + '.<br>' + t(Tb.opp + '=' + Ts.o + '\\times ' + kt + '=' + Tb.o) + ', \\(\\quad\\) ' + t(Tb.adj + '=' + Ts.a + '\\times ' + kt + '=' + Tb.a) + '.<br>The two methods agree: the ratio method <b>is</b> the scale-factor method, one side at a time. (Check: ' + t(Tb.o + '^2+' + Tb.a + '^2=' + (Tb.o * Tb.o + Tb.a * Tb.a) + '=' + Tb.h + '^2') + ' ✓)',
              ['Scale factor = large ÷ small, using the two hypotenuses.', 'Multiply each small leg by the scale factor.'], 'scale factor method');
            return p;
          } }] },

      /* ---------------- Part D ---------------- */
      { num: '11', section: 'Extra practice D — Reading a ratio backwards', stem: function (sh) { return 'A right triangle has an acute angle ' + t('A') + ' with ' + t('\\tan A=' + uT(sh.o, sh.a)) + '.'; },
        shared: function (r) {
          var tr = r.pick([[5, 12, 13], [5, 12, 13], [3, 4, 5], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 35, 37], [9, 40, 41]]), os = tr[0] === 5 ? true : r.chance(0.5);
          return { o: os ? tr[0] : tr[1], a: os ? tr[1] : tr[0], h: tr[2], m: r.pick([2, 2, 3]) };
        },
        parts: [
          { id: 'e11a', sub: 'a', level: 'LIM', make: function (r, sh) {
            var o = sh.o, a = sh.a, w = 200, or = { rot: r.pick([0, 90, 180, 270]), flip: r.chance(0.5) };
            var T = tri({ A: 'A', B: 'B', R: 'C' }, o, a, sh.h), f = function (TT, lab, ang, vn) { return triFig(TT, { rot: or.rot, flip: or.flip, lab: lab, angA: ang, width: w, vnames: vn }); };
            var vA = { A: 'A' };
            return mc(r, 'Which sketch fits ' + t('\\tan A=' + uT(o, a)) + '?', [
              { html: f(T, { o: o, a: a }, null, vA), right: true },
              { html: f(T, { o: a, a: o }, null, vA), why: 'In that sketch ' + t(o) + ' touches ' + t('A') + '. TOA: the <b>opposite</b> side (across from ' + t('A') + ') is ' + t(o) + '; the adjacent side ' + t(a) + ' touches ' + t('A') + '.' },
              { html: f(T, { o: o, h: a }, null, vA), why: 'Tangent uses the two <b>legs</b>: ' + t(a) + ' is the adjacent leg, not the hypotenuse.' },
              { html: f(tri({ A: 'B', B: 'D', R: 'A' }, o, a, sh.h), { o: o, a: a }, null, { A: 'A' }), why: t('A') + ' is an acute angle — the right angle goes where the two legs meet, not at ' + t('A') + '.' }],
              t('\\tan A=\\frac{\\text{opp}}{\\text{adj}}=' + uT(o, a)) + ', so the side opposite ' + t('A') + ' is ' + t(o) + ' and the side adjacent to ' + t('A') + ' is ' + t(a) + '. The right angle goes where the two legs meet — not at ' + t('A') + '.', ['TOA: opposite over adjacent. Which side is across from ' + t('A') + '?'], 'sketch from tan');
          } },
          { id: 'e11b', sub: 'b', level: 'BEG', make: function (r, sh) {
            var p = P.number('Determine the third side exactly.', sh.h, pythDiag(sh.h, sh.o, sh.a, false), 'The missing side is the hypotenuse, so add the squares of the legs:<br>' + t('\\text{hyp}^2=' + sh.o + '^2+' + sh.a + '^2=' + (sh.o * sh.o) + '+' + (sh.a * sh.a) + '=' + (sh.h * sh.h)) + ', so ' + t('\\text{hyp}=\\sqrt{' + (sh.h * sh.h) + '}=' + sh.h) + '.', ['The two sides from the tangent are the legs.'], 'hyp from tan', { before: t('\\text{hyp}=') });
            p.bad = [String(sh.o + sh.a)];
            return p;
          } },
          { id: 'e11c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var T = tri({ A: 'A', B: 'B', R: 'C' }, sh.o, sh.a, sh.h);
            return ratiosPart(T, ['sin', 'cos'], 'A', 'Write ' + t('\\sin A') + ' and ' + t('\\cos A') + ' as exact fractions in lowest terms.', { named: false, pre: 'From ' + t('\\tan A=' + uT(sh.o, sh.a)) + ' the legs are ' + t(sh.o) + ' (opp) and ' + t(sh.a) + ' (adj); the hypotenuse is ' + t('\\sqrt{' + sh.o + '^2+' + sh.a + '^2}=' + sh.h) + '.<br>' });
          } },
          { id: 'e11d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var m = sh.m, O = sh.o * m, A = sh.a * m, H = sh.h * m, T = tri({ A: 'A', B: 'B', R: 'C' }, O, A, H);
            var chkS = ratioCheck(T, ['sin', 'cos'], 'A'), chkH = K.number(H, pythDiag(H, O, A, false));
            var p = { prompt: 'A classmate’s triangle has opposite side ' + t(O) + ' and adjacent side ' + t(A) + '. Find their hypotenuse, ' + t('\\sin A') + ' and ' + t('\\cos A') + '.',
              input: { type: 'fields', fields: [{ name: 'hyp', before: t('\\text{hyp}='), mode: 'math', keys: 'fraction' }, { name: 'sin', before: t('\\sin A='), mode: 'math', keys: 'fraction' }, { name: 'cos', before: t('\\cos A='), mode: 'math', keys: 'fraction' }] },
              check: function (resp) { resp = resp || []; var a = chkH(resp[0] == null ? '' : resp[0]); if (a.v !== 'correct') return { v: a.v, code: a.code, hint: '<b>hyp:</b> ' + (a.hint || 'Square the legs, add, then take the square root.') }; return chkS([resp[1], resp[2]]); },
              key: [String(H), fT(O, H), fT(A, H)], answer: t('\\text{hyp}=' + H + ',\\ \\sin A=' + fT(O, H) + ',\\ \\cos A=' + fT(A, H)),
              solution: t('\\text{hyp}^2=' + O + '^2+' + A + '^2=' + (O * O + A * A)) + ', so hyp ' + t('=' + H) + '.<br>' + t('\\sin A=\\frac{' + O + '}{' + H + '}=' + fT(O, H) + ',\\quad \\cos A=\\frac{' + A + '}{' + H + '}=' + fT(A, H)) + ' — identical to the smaller triangle’s. The classmate’s triangle is it enlarged by ' + t(m) + '.',
              hints: ['Use the Pythagorean theorem for the hypotenuse, then SOH and CAH.'], text: 'classmate triangle', bad: [[String(H), fT(A, H), fT(O, H)]] };
            return p;
          } },
          { id: 'e11e', sub: 'e', level: 'EMG', make: function (r, sh) {
            return mc(r, 'How many different right triangles have ' + t('\\tan A=' + uT(sh.o, sh.a)) + ', and what do they all have in common?', [
              { html: 'Infinitely many (opp ' + t('=' + sh.o + 'k') + ', adj ' + t('=' + sh.a + 'k') + ' for any ' + t('k>0') + '); they are all <b>similar</b>, with the same angle ' + t('A') + '.', right: true },
              { html: 'Exactly one: the triangle with legs ' + t(sh.o) + ' and ' + t(sh.a) + '.', why: 'The classmate’s triangle with legs ' + t(sh.o * sh.m) + ' and ' + t(sh.a * sh.m) + ' also works. A ratio fixes the shape, not the size.' },
              { html: 'Two: one for each acute angle.', why: 'Any enlargement of the triangle works too — there are infinitely many.' },
              { html: 'Infinitely many, and each has a different angle ' + t('A') + '.', why: 'Equal tangent means equal angle: they are all similar, with the same angle ' + t('A') + '.' }],
              '<b>Infinitely many</b> — one for every scale factor ' + t('k') + ' applied to the ' + sh.o + '–' + sh.a + '–' + sh.h + ' triangle. They are all <b>similar</b>, so every one has the same angle ' + t('A') + ' and the same three ratios. A ratio pins down the angle, not the triangle.', ['Could you draw the triangle twice as big?'], 'how many triangles');
          } }] },

      { num: '12', stem: function (sh) { var T = sh.T; return 'In right triangle ' + t(sh.L.join('')) + ' the right angle is at ' + t(sh.L[1]) + ', and ' + t('\\sin ' + T.A + '=' + uT(T.o, T.h)) + '.'; },
        shared: function (r) {
          var tr = r.pick([[36, 77, 85], [36, 77, 85], [13, 84, 85], [20, 21, 29], [28, 45, 53], [33, 56, 65], [48, 55, 73], [39, 80, 89], [12, 35, 37], [11, 60, 61], [65, 72, 97]]), L = r.pick(LETS);
          var T = fromTriple(r, { A: L[0], B: L[2], R: L[1] }, tr, 1, tr[0] === 36 ? true : r.chance(0.5));
          return { L: L, T: T };
        },
        parts: [
          { id: 'e12a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var T = sh.T;
            var p = P.number('Sketch and label the triangle, then determine the third side, ' + t(T.adj) + ', exactly.', T.a, pythDiag(T.a, T.h, T.o, true), t('\\sin ' + T.A + '=\\frac{\\text{opp}}{\\text{hyp}}=' + uT(T.o, T.h)) + ', so ' + t(T.opp + '=' + T.o) + ' (opposite ' + t(T.A) + ') and ' + t(T.hyp + '=' + T.h) + ' (the hypotenuse). The missing side is the leg ' + t(T.adj) + ':<br>' + t(T.adj + '^2=' + T.h + '^2-' + T.o + '^2=' + (T.h * T.h) + '-' + (T.o * T.o) + '=' + (T.a * T.a)) + ', so ' + t(T.adj + '=' + T.a) + '.', ['The hypotenuse is known; the missing side is a leg, so subtract the squares.'], 'leg from sin', { before: t(T.adj + '=') });
            p.bad = [String(K.roundTo(Math.sqrt(T.h * T.h + T.o * T.o), 2))];
            return p;
          } },
          { id: 'e12b', sub: 'b', level: 'PRG', make: function (r, sh) { var T = sh.T; return q6local(T); } },
          { id: 'e12c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var T = sh.T, X = T.A, small = T.o < T.a;
            return mc(r, 'Without a calculator, is ' + t('\\angle ' + X) + ' larger or smaller than ' + t('45^\\circ') + '? (The legs are ' + t(T.opp + '=' + T.o) + ' and ' + t(T.adj + '=' + T.a) + '.)', [
              { html: 'Smaller, because the opposite leg is shorter than the adjacent leg, so ' + t('\\tan ' + X + '<1=\\tan 45^\\circ') + '.', right: small, why: small ? null : 'Compare again: the opposite leg is ' + t(T.o) + ' and the adjacent leg is ' + t(T.a) + '.' },
              { html: 'Larger, because the opposite leg is longer than the adjacent leg, so ' + t('\\tan ' + X + '>1=\\tan 45^\\circ') + '.', right: !small, why: !small ? null : 'Compare again: the opposite leg is ' + t(T.o) + ' and the adjacent leg is ' + t(T.a) + '.' },
              { html: (small ? 'Larger' : 'Smaller') + ': ' + t('\\sin ' + X + '=' + uT(T.o, T.h)) + ' is less than ' + t('1') + '.', why: 'The sine of <b>every</b> acute angle is less than ' + t('1') + ', so that can’t compare ' + t(X) + ' with ' + t('45^\\circ') + '. At ' + t('45^\\circ') + ' the two legs are equal — compare the legs.' },
              { html: 'It can’t be decided without a calculator.', why: 'At exactly ' + t('45^\\circ') + ' the legs are equal and ' + t('\\tan 45^\\circ=1') + '. Compare the two legs.' }],
              '<b>' + (small ? 'Smaller' : 'Larger') + ' than ' + t('45^\\circ') + '.</b> The opposite leg is ' + t(T.o) + ' and the adjacent leg is ' + t(T.a) + ', so ' + t('\\tan ' + X + '=' + uT(T.o, T.a) + (small ? '<1' : '>1')) + '. At ' + t('45^\\circ') + ' the legs are equal and ' + t('\\tan 45^\\circ=1') + '; ' + (small ? 'a shorter opposite leg means a smaller angle' : 'a longer opposite leg means a larger angle') + '. (Calculator check: ' + t('\\sin^{-1}' + uT(T.o, T.h) + '\\approx ' + Math.round(TG.asin(T.o / T.h)) + '^\\circ') + '.)', ['What is special about the legs when the angle is exactly ' + t('45^\\circ') + '?'], 'compare with 45');
          } }] },

      { num: '13', stem: function (sh) { return 'In a right triangle, an acute angle ' + t('T') + ' satisfies ' + t('\\cos T=' + uT(sh.p, sh.q)) + '. The sides of this triangle are <b>not</b> all whole numbers.'; },
        shared: function (r) {
          var c = r.chance(0.3) ? [2, 3] : r.pick([[2, 3], [1, 3], [3, 4], [1, 4], [2, 5], [1, 2], [5, 6], [3, 7], [2, 7], [1, 5], [4, 7]]), p = c[0], q = c[1], M = q * q - p * p;
          var cf = ex.nthFactor(M, 2), m = M / (cf * cf);
          return { p: p, q: q, M: M, c: cf, m: m };
        },
        parts: [
          { id: 'e13a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var opp = K.radTex({ k: sh.c, n: 2, m: sh.m });
            return P.radical('Sketch the triangle and determine the third side (opposite ' + t('T') + ') as an exact radical in simplest form.', { k: sh.c, n: 2, m: sh.m }, 'mixed',
              t('\\cos T=\\frac{\\text{adj}}{\\text{hyp}}=' + uT(sh.p, sh.q)) + ', so adj ' + t('=' + sh.p) + ' and hyp ' + t('=' + sh.q) + '. The opposite side is a leg:<br>' + t('\\text{opp}^2=' + sh.q + '^2-' + sh.p + '^2=' + (sh.q * sh.q) + '-' + (sh.p * sh.p) + '=' + sh.M) + ', so ' + t('\\text{opp}=\\sqrt{' + sh.M + '}' + (sh.c > 1 ? '=' + opp : '')) + (sh.c > 1 ? '' : ' (already simplest: ' + t(sh.M) + ' has no perfect-square factor)') + '.',
              ['Label adj ' + t('=' + sh.p) + ' and hyp ' + t('=' + sh.q) + '; the missing side is a leg, so subtract the squares.'], 'opp from cos ' + sh.p + '/' + sh.q, { diag: function (v) { if (closeTo(v, Math.sqrt(sh.q * sh.q + sh.p * sh.p), 1e-6)) return { code: 'pyth-add', hint: 'The missing side is a <b>leg</b>, so subtract: ' + t('\\text{opp}^2=\\text{hyp}^2-\\text{adj}^2') + '.' }; return null; } });
          } },
          { id: 'e13b', sub: 'b', level: 'ADV', make: function (r, sh) {
            var sS = { k: ex.norm(sh.c, sh.q), n: 2, m: sh.m }, sT = { k: ex.norm(sh.c, sh.p), n: 2, m: sh.m }, vS = K.radVal(sS), vT = K.radVal(sT);
            var dg = function (want, flipV, swapV, swapCode, swapHint) {
              return function (v) {
                if (closeTo(v, swapV, 1e-6)) return { code: swapCode, hint: swapHint };
                if (closeTo(v, 1 / want, 1e-6)) return { code: 'ratio-flip', hint: 'Upside down — check which side goes on the bottom.' };
                if (closeTo(v, sh.p / sh.q, 1e-6)) return { code: 'sin-cos-swap', hint: 'That’s the cosine you were given. Sine is <b>opp</b> over hyp.' };
                return null;
              };
            };
            var kS = K.radTex(sS), kT = K.radTex(sT);
            return P.fields('Write ' + t('\\sin T') + ' and ' + t('\\tan T') + ' as exact values (radicals in simplest form).', [{ name: 'sin T', before: t('\\sin T='), mode: 'math', keys: 'radical' }, { name: 'tan T', before: t('\\tan T='), mode: 'math', keys: 'radical' }],
              [K.radical(sS, 'mixed', { diag: dg(vS, 0, vT, 'sin-tan-swap', 'That’s opp over <b>adj</b> — the tangent. Sine is opp over <b>hyp</b>.') }), K.radical(sT, 'mixed', { diag: dg(vT, 0, vS, 'sin-tan-swap', 'That’s opp over <b>hyp</b> — the sine. Tangent is opp over <b>adj</b>.') })],
              [kS, kT], t('\\sin T=' + kS + ',\\quad \\tan T=' + kT),
              'adj ' + t('=' + sh.p) + ', hyp ' + t('=' + sh.q) + ', opp ' + t('=' + K.radTex({ k: sh.c, n: 2, m: sh.m })) + '.<br>' + t('\\sin T=\\frac{\\text{opp}}{\\text{hyp}}=' + kS) + ', \\(\\quad\\) ' + t('\\tan T=\\frac{\\text{opp}}{\\text{adj}}=' + kT),
              ['Find the opposite side first: ' + t('\\sqrt{' + sh.q + '^2-' + sh.p + '^2}') + '.', 'Sine is opp/hyp and tangent is opp/adj — leave the radical in the numerator.'], 'exact sin, tan from cos');
          } },
          { id: 'e13c1', sub: 'c i', level: 'EMG', make: function (r, sh) {
            var R = Math.sqrt(sh.M), vS = R / sh.q, vT = R / sh.p, r1 = K.roundTo(R, 1), r2 = K.roundTo(R, 2);
            var er = function (v) { return { v: v, code: 'early-round', hint: 'Close — but it looks like you rounded ' + t('\\sqrt{' + sh.M + '}') + ' first. Keep the full calculator value and round only at the end.' }; };
            return nearFields('Write ' + t('\\sin T') + ' and ' + t('\\tan T') + ' as decimals to the nearest thousandth.', [
              { name: 'sin T', before: t('\\sin T\\approx'), x: vS, dp: 3, alts: [er(r1 / sh.q), er(r2 / sh.q), { v: vT, code: 'sin-tan-swap', hint: 'That’s the tangent. Sine is opp over hyp.' }] },
              { name: 'tan T', before: t('\\tan T\\approx'), x: vT, dp: 3, alts: [er(r1 / sh.p), er(r2 / sh.p), { v: vS, code: 'sin-tan-swap', hint: 'That’s the sine. Tangent is opp over adj.' }] }],
              t('\\sin T\\approx ' + vS.toFixed(3) + ',\\ \\tan T\\approx ' + vT.toFixed(3)),
              'Carry ' + t('\\sqrt{' + sh.M + '}=' + R.toFixed(7) + '\\ldots') + ' at full precision:<br>' + t('\\sin T=\\frac{\\sqrt{' + sh.M + '}}{' + sh.q + '}=' + vS.toFixed(6) + '\\ldots\\approx ' + vS.toFixed(3)) + '<br>' + t('\\tan T=\\frac{\\sqrt{' + sh.M + '}}{' + sh.p + '}=' + vT.toFixed(6) + '\\ldots\\approx ' + vT.toFixed(3)),
              ['Type the whole expression into your calculator in one go.'], 'decimal sin, tan');
          } },
          { id: 'e13c2', sub: 'c ii', level: 'EMG', make: function (r, sh) {
            return mc(r, 'Why are the radical answers better ones to carry into further work than the decimals?', [
              { html: 'The radical forms are <b>exact</b>; the decimals are approximations, and reusing a rounded value lets the error grow at every later step.', right: true },
              { html: 'The decimals are wrong — a trig ratio can’t be a decimal.', why: 'The decimals are correct to the nearest thousandth; they just aren’t exact.' },
              { html: 'Radicals are always smaller numbers, so they are easier to work with.', why: 'The two forms have the same value. The difference is exactness, not size.' },
              { html: 'There is no difference: the two forms are exactly equal.', why: t('0.745') + ' isn’t exactly ' + t('\\frac{\\sqrt{5}}{3}') + ' — it is rounded. The radical is exact.' }],
              'The radical forms are <b>exact</b>; the decimals are rounded approximations. Rounding early and reusing the rounded value lets the error grow, so carry the exact forms forward.', ['Which form has been rounded?'], 'why exact');
          } }] },

      /* ---------------- Part E ---------------- */
      { num: '14', section: 'Extra practice E — Error analysis: three students, three different mistakes',
        stem: function (sh) { var T = sh.T; return 'Right triangle ' + t(sh.L.join('')) + ' has its right angle at ' + t(T.R) + ', with ' + t(T.opp + '=' + T.o) + ', ' + t(T.adj + '=' + T.a) + ' and ' + t(T.hyp + '=' + T.h) + '. Asked for ' + t('\\tan ' + T.A) + ', a student wrote ' + t('\\tan ' + T.A + '=' + uT(T.o, T.h)) + '.' + triFig(T, { rot: sh.or.rot, flip: sh.or.flip, lab: labs(T) }); },
        shared: function (r) {
          var tr = r.pick([[65, 72, 97], [20, 21, 29], [28, 45, 53], [33, 56, 65], [48, 55, 73], [39, 80, 89], [36, 77, 85], [11, 60, 61], [12, 35, 37]]), L = r.pick(LETS);
          return { L: L, T: fromTriple(r, { A: L[0], B: L[1], R: L[2] }, tr), or: ori(r, false) };
        },
        parts: [
          { id: 'e14a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var T = sh.T;
            return mc(r, 'Which side did the student use as the adjacent side, and which side is actually adjacent to ' + t('\\angle ' + T.A) + '?', [
              { html: 'Used ' + t(T.hyp + '=' + T.h) + ' (the hypotenuse); the adjacent side is ' + t(T.adj + '=' + T.a) + '.', right: true },
              { html: 'Used ' + t(T.opp + '=' + T.o) + '; the adjacent side is ' + t(T.adj + '=' + T.a) + '.', why: t(T.o) + ' is the <b>top</b> of the student’s fraction — the opposite side. The bottom, ' + t(T.h) + ', is what they called adjacent.' },
              { html: 'Used ' + t(T.adj + '=' + T.a) + '; the adjacent side is ' + t(T.hyp + '=' + T.h) + '.', why: t(T.hyp) + ' is across from the right angle — it is the hypotenuse, never “adjacent”.' },
              { html: 'Used ' + t(T.hyp + '=' + T.h) + '; the adjacent side is ' + t(T.opp + '=' + T.o) + '.', why: t(T.opp) + ' doesn’t touch ' + t(T.A) + ' — it is the opposite side.' }],
              'The student’s denominator ' + t(T.h) + ' is ' + t(T.hyp) + ', the <b>hypotenuse</b>. The side actually adjacent to ' + t('\\angle ' + T.A) + ' is ' + t(T.adj + '=' + T.a) + ': the leg that touches ' + t(T.A) + ' and isn’t the hypotenuse.', ['What is the bottom of the student’s fraction?'], 'tan error: which side');
          } },
          { id: 'e14b', sub: 'b', level: 'BEG', make: function (r, sh) {
            return mc(r, 'Which one-line check on the <b>letters</b> of SOH CAH TOA would have caught this before any arithmetic?', [
              { html: 'TOA: tangent is Opposite over Adjacent — there is no H, so the hypotenuse can never appear in a tangent.', right: true },
              { html: 'SOH: the opposite side always goes on top.', why: 'True, and the student did put the opposite on top. The problem is the bottom: TOA has no H.' },
              { html: 'CAH: the adjacent side always goes over the hypotenuse.', why: 'That’s the cosine. For a tangent, check TOA — it has no H.' },
              { html: 'A tangent must always be greater than ' + t('1') + '.', why: 'A tangent can be less than ' + t('1') + ' (when opp < adj). The letter check is TOA: no H.' }],
              'TOA: <b>T</b>angent is <b>O</b>pposite over <b>A</b>djacent — there is no H in it. Seeing the hypotenuse ' + t(sh.T.h) + ' inside ' + t('\\tan ' + sh.T.A) + ' is wrong before any calculation.', ['Which letters make up TOA?'], 'TOA has no H');
          } },
          { id: 'e14c', sub: 'c', level: 'BEG', make: function (r, sh) { var T = sh.T, X = T.A; return ratiosPart(T, ['tan', 'sin', 'cos'], X, 'Write the correct ' + t('\\tan ' + X) + ', and also ' + t('\\sin ' + X) + ' and ' + t('\\cos ' + X) + ', in lowest terms.', { nameIt: true }); } },
          { id: 'e14d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var T = sh.T, X = T.A;
            return mc(r, 'The student’s fraction ' + t(uT(T.o, T.h)) + ' is not meaningless — it is one of the three ratios for ' + t('\\angle ' + X) + '. Which one?', [
              { html: t('\\sin ' + X), right: true, why: null },
              { html: t('\\cos ' + X), why: 'Cosine is adj/hyp ' + t('=' + uT(T.a, T.h)) + '. The student’s fraction has the <b>opposite</b> side on top.' },
              { html: t('\\tan ' + X), why: 'The correct tangent is ' + t(uT(T.o, T.a)) + ' — that’s the point of the question.' },
              { html: 'None of them', why: 'opp over hyp is one of the three ratios: SOH.' }],
              t(uT(T.o, T.h) + '=\\frac{\\text{opp}}{\\text{hyp}}=\\sin ' + X) + ' — correct arithmetic, wrong ratio. Its value is a believable number between ' + t('0') + ' and ' + t('1') + ', so the error hides easily; only naming opp, adj and hyp before writing the fraction catches it.', ['Which ratio is opp over hyp?'], 'student wrote sin');
          } }] },

      { num: '15', stem: function (sh) { var T = sh.T, Z = T.B; return 'Right triangle ' + t(sh.L.join('')) + ' has its right angle at ' + t(T.R) + ', with ' + t(T.adj + '=' + T.a) + ', ' + t(T.opp + '=' + T.o) + ' and ' + t(T.hyp + '=' + T.h) + '. Asked for the three ratios of ' + t('\\angle ' + T.A) + ', a student wrote ' + t('\\sin ' + T.A + '=' + steps(T.a, T.h) + ',\\ \\cos ' + T.A + '=' + steps(T.o, T.h) + ',\\ \\tan ' + T.A + '=' + steps(T.a, T.o)) + '.' + triFig(T, { rot: sh.or.rot, flip: sh.or.flip, lab: labs(T) }) + ''; },
        shared: function (r) {
          var c = r.pick([[[3, 4, 5], r.int(2, 8)], [[3, 4, 5], 6], [[5, 12, 13], r.int(2, 3)], [[8, 15, 17], 2], [[7, 24, 25], 2]]), L = r.pick(LETS);
          return { L: L, T: fromTriple(r, { A: L[0], B: L[2], R: L[1] }, c[0], c[1]), or: ori(r, false) };
        },
        parts: [
          { id: 'e15a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var T = sh.T, X = T.A, Z = T.B;
            return mc(r, 'The student’s three answers are all correct ratios of this triangle — just not of ' + t('\\angle ' + X) + '. Whose are they, and what went wrong?', [
              { html: 'They are the ratios of ' + t('\\angle ' + Z) + ': the student treated ' + t(T.adj) + ' as opposite and ' + t(T.opp) + ' as adjacent — right for ' + t(Z) + ', backwards for ' + t(X) + '.', right: true },
              { html: 'They are the ratios of ' + t('\\angle ' + T.R) + ', the right angle.', why: 'Opposite and adjacent are only used for the acute angles here. The student’s fractions fit the <b>other acute</b> angle, ' + t(Z) + '.' },
              { html: 'They are ' + t('\\angle ' + X) + '’s ratios; the student only swapped sine and cosine.', why: 'The tangent is also upside down, so it isn’t just a sin/cos swap: all three belong to ' + t('\\angle ' + Z) + '.' },
              { html: 'They are ' + t('\\angle ' + X) + '’s ratios, but they weren’t reduced.', why: 'They were reduced. The problem is which sides were called opposite and adjacent.' }],
              'They are the ratios of ' + t('\\angle ' + Z) + ', the other acute angle: ' + t('\\sin ' + Z + '=' + fT(T.a, T.h) + ',\\ \\cos ' + Z + '=' + fT(T.o, T.h) + ',\\ \\tan ' + Z + '=' + fT(T.a, T.o)) + '. The student called ' + t(T.adj + '=' + T.a) + ' opposite and ' + t(T.opp + '=' + T.o) + ' adjacent — correct for ' + t(Z) + ', backwards for ' + t(X) + '.', ['Which side doesn’t touch ' + t(X) + '?'], 'other angle’s ratios');
          } },
          { id: 'e15b', sub: 'b', level: 'BEG', make: function (r, sh) { var T = sh.T, X = T.A; return ratiosPart(T, ['sin', 'cos', 'tan'], X, 'Write the correct ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' in lowest terms.', { nameIt: true }); } },
          { id: 'e15c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var T = sh.T, X = T.A, Z = T.B;
            return mc(r, 'The student’s tangent and the correct tangent are reciprocals. Will that <b>always</b> happen when the two acute angles of a right triangle are confused?', [
              { html: 'Yes: the legs swap roles, so ' + t('\\tan ' + X + '=\\frac{' + T.opp + '}{' + T.adj + '}') + ' and ' + t('\\tan ' + Z + '=\\frac{' + T.adj + '}{' + T.opp + '}') + ' — one is always the other upside down.', right: true },
              { html: 'No: it depends on the side lengths of the triangle.', why: 'Write both tangents with side names: the same two legs appear, top and bottom swapped — for any lengths.' },
              { html: 'Only for triangles shaped like ' + t('3') + '–' + t('4') + '–' + t('5') + '.', why: 'It works for every right triangle: the two legs simply trade places.' },
              { html: 'Yes — and the sines and cosines also become reciprocals.', why: 'Sine and cosine don’t flip; they <b>swap</b> with each other (' + t('\\sin ' + X + '=\\cos ' + Z) + '). Only the tangents are reciprocals.' }],
              'Yes — always. For the two acute angles the legs swap roles: ' + t('\\tan ' + X + '=\\frac{' + T.opp + '}{' + T.adj + '}') + ', ' + t('\\tan ' + Z + '=\\frac{' + T.adj + '}{' + T.opp + '}') + '. One fraction is the other turned upside down, so ' + t('\\tan ' + X + '\\times\\tan ' + Z + '=1') + '. (Sine and cosine swap with each other instead: ' + t('\\sin ' + X + '=\\cos ' + Z) + '.)', ['Write ' + t('\\tan ' + X) + ' and ' + t('\\tan ' + Z) + ' with side names.'], 'tangents reciprocal');
          } }] },

      { num: '16', stem: function (sh) { var T = sh.T; return 'Right triangle ' + t(sh.L.join('')) + ' has its right angle at ' + t(T.R) + ', with ' + t(T.adj + '=' + T.a) + ', ' + t(T.opp + '=' + T.o) + ' and ' + t(T.hyp + '=' + T.h) + '. Asked for ' + t('\\sin ' + T.A) + ', a student wrote ' + t('\\sin ' + T.A + '=\\frac{\\text{opposite}}{\\text{adjacent}}=' + uT(T.o, T.a)) + '.' + triFig(T, { rot: sh.or.rot, flip: sh.or.flip, lab: labs(T) }); },
        shared: function (r) {
          var tr = r.pick([[39, 80, 89], [20, 21, 29], [28, 45, 53], [33, 56, 65], [48, 55, 73], [11, 60, 61], [36, 77, 85], [65, 72, 97], [13, 84, 85], [12, 35, 37]]), L = r.pick(LETS);
          return { L: L, T: fromTriple(r, { A: L[2], B: L[0], R: L[1] }, tr, 1, false), or: ori(r, false) };
        },
        parts: [
          { id: 'e16a', sub: 'a', level: 'BEG', make: function (r, sh) {
            return mc(r, 'SOH CAH TOA: which letter pair did the student use for sine, and which one should they have used?', [
              { html: 'They used <b>OA</b> (opposite over adjacent — tangent’s pair); sine is <b>OH</b>, opposite over hypotenuse.', right: true },
              { html: 'They used <b>AH</b> (cosine’s pair); sine is <b>OH</b>.', why: 'The student wrote opposite over <b>adjacent</b> — that’s the OA pair from TOA.' },
              { html: 'They used <b>OH</b> correctly, but picked the wrong sides.', why: 'The student wrote “opposite/adjacent” — the OA pair. Sine needs OH.' },
              { html: 'They used <b>OA</b>; sine should be <b>AH</b>.', why: 'AH is cosine (CAH). Sine is SOH: opposite over hypotenuse.' }],
              '<b>S</b>OH: ' + t('\\sin=\\frac{\\text{opp}}{\\text{hyp}}') + ', <b>C</b>AH: ' + t('\\cos=\\frac{\\text{adj}}{\\text{hyp}}') + ', <b>T</b>OA: ' + t('\\tan=\\frac{\\text{opp}}{\\text{adj}}') + '. The student used the <b>OA</b> pair, which belongs to tangent. Sine takes the <b>OH</b> pair.', ['Write SOH CAH TOA out in full.'], 'which letter pair');
          } },
          { id: 'e16b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var T = sh.T;
            return mc(r, 'The student’s answer is about ' + t((T.o / T.a).toFixed(2)) + '. Which reason, based on the <b>sides</b> of a right triangle, shows the sine of an acute angle can never exceed ' + t('1') + '?', [
              { html: 'The hypotenuse is always the longest side, so opp ÷ hyp is a proper fraction: ' + t('0<\\sin<1') + '.', right: true },
              { html: 'The opposite side is always the shortest side.', why: 'Not always: here the opposite side (' + t(T.o) + ') is the longer leg. What matters is that the <b>hypotenuse</b> is the longest.' },
              { html: 'Acute angles are less than ' + t('90^\\circ') + '.', why: 'True, but the question asks for a reason based on the <b>sides</b>: compare the opposite side with the hypotenuse.' },
              { html: 'Calculators can’t show a sine greater than ' + t('1') + '.', why: 'That describes a calculator, not a triangle. Compare the opposite side with the hypotenuse.' }],
              'In a right triangle the hypotenuse is always the longest side, so the leg opposite an acute angle is shorter than it. Therefore ' + t('\\sin=\\frac{\\text{opp}}{\\text{hyp}}') + ' is a proper fraction, ' + t('0<\\sin<1') + '. A sine of ' + t((T.o / T.a).toFixed(2)) + ' is impossible.', ['Which side is always the longest?'], 'why sin < 1');
          } },
          { id: 'e16c', sub: 'c', level: 'BEG', make: function (r, sh) { var T = sh.T, X = T.A; return ratiosPart(T, ['sin', 'cos', 'tan'], X, 'Write the correct ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + '.', { nameIt: true }); } },
          { id: 'e16d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var T = sh.T, X = T.A, Y = T.B;
            return mc(r, 'The student’s fraction ' + t(uT(T.o, T.a)) + ' is a genuine ratio of this triangle. Which one?', [
              { html: t('\\tan ' + X), right: true },
              { html: t('\\tan ' + Y), why: t('\\tan ' + Y + '=' + uT(T.a, T.o)) + ' — the other way up.' },
              { html: t('\\cos ' + Y), why: t('\\cos ' + Y + '=' + uT(T.o, T.h)) + ' — cosine has the hypotenuse on the bottom.' },
              { html: t('\\sin ' + Y), why: t('\\sin ' + Y + '=' + uT(T.a, T.h)) + ' — sine has the hypotenuse on the bottom.' }],
              t(uT(T.o, T.a) + '=\\frac{\\text{opp}}{\\text{adj}}=\\tan ' + X) + ' for the very same angle ' + t(X) + '. The student identified the sides correctly but used the TOA pair while writing the word “sine”.', ['Opposite over adjacent is which ratio?'], 'student wrote tan');
          } }] },

      /* ---------------- Part F ---------------- */
      { num: '17', section: 'Extra practice F — Stretch: two relationships hiding in the side names',
        stem: function (sh) { var T = sh.T; return 'Right triangle ' + t(sh.L.join('')) + ' has its right angle at ' + t(T.R) + ', with ' + t(T.adj + '=' + T.a) + ', ' + t(T.opp + '=' + T.o) + ' and ' + t(T.hyp + '=' + T.h) + '.' + triFig(T, { rot: sh.or.rot, flip: sh.or.flip, lab: labs(T) }); },
        shared: function (r) {
          var c = r.chance(0.3) ? [[5, 12, 13], 3] : r.pick([[[5, 12, 13], r.int(2, 4)], [[3, 4, 5], r.int(2, 9)], [[8, 15, 17], 2], [[7, 24, 25], 2], [[20, 21, 29], 1], [[9, 40, 41], 1]]), L = r.pick(LETS);
          return { L: L, T: fromTriple(r, { A: L[0], B: L[2], R: L[1] }, c[0], c[1], c[0][0] === 5 && c[1] === 3 ? false : null), or: ori(r, false) };
        },
        parts: [
          { id: 'e17a', sub: 'a', level: 'BEG', make: function (r, sh) { var T = sh.T, X = T.A; return ratiosPart(T, ['sin', 'cos', 'tan'], X, 'Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { nameIt: true }); } },
          { id: 'e17b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var T = sh.T, X = T.A, s = fT(T.o, T.h), c = fT(T.a, T.h), tt = frc(T.o, T.a);
            return P.math('With ' + t('\\sin ' + X + '=' + s) + ' and ' + t('\\cos ' + X + '=' + c) + ', compute ' + t('\\dfrac{\\sin ' + X + '}{\\cos ' + X + '}') + ' as a single fraction in lowest terms.', K.fraction(tt, { diag: function (v) {
              if (closeTo(v, T.a / T.o, 1e-9)) return { code: 'quot-flip', hint: 'That’s cosine ÷ sine. Put the <b>sine</b> on top, then multiply by the reciprocal of the cosine.' };
              if (closeTo(v, T.o * T.a / (T.h * T.h), 1e-9)) return { code: 'value', hint: 'You multiplied the two ratios. Dividing by a fraction means multiplying by its <b>reciprocal</b>.' };
              return null; } }), ex.texRat(tt),
              t('\\frac{\\sin ' + X + '}{\\cos ' + X + '}=\\frac{' + s + '}{' + c + '}=' + s + '\\times ' + ex.texRat(ex.norm(frc(T.a, T.h)[1], frc(T.a, T.h)[0])) + '=' + ex.texRat(tt)) + ', and ' + t('\\tan ' + X + '=' + uT(T.o, T.a) + '=' + ex.texRat(tt)) + ': exactly equal. The hypotenuse cancelled.',
              ['Divide fractions by multiplying by the reciprocal.'], 'sin/cos as a fraction', { keys: 'fraction' });
          } },
          { id: 'e17c', sub: 'c', level: 'PRG', make: function (r, sh) {
            return mc(r, 'Prove it in general. Let ' + t('A') + ' be an acute angle of any right triangle. Which argument shows ' + t('\\dfrac{\\sin A}{\\cos A}=\\tan A') + '?', [
              { html: t('\\frac{\\sin A}{\\cos A}=\\frac{\\text{opp}}{\\text{hyp}}\\div\\frac{\\text{adj}}{\\text{hyp}}=\\frac{\\text{opp}}{\\text{hyp}}\\times\\frac{\\text{hyp}}{\\text{adj}}=\\frac{\\text{opp}}{\\text{adj}}') + ': the hypotenuse appears once on top and once on the bottom and cancels.', right: true },
              { html: 'It worked for the triangle above, so it works for every triangle.', why: 'One example isn’t a proof. Use the words opp, adj and hyp so it holds for every right triangle.' },
              { html: t('\\frac{\\sin A}{\\cos A}=\\frac{\\text{opp}\\times\\text{adj}}{\\text{hyp}^2}') + ', which equals ' + t('\\tan A') + '.', why: 'That multiplies the two ratios. Dividing by ' + t('\\frac{\\text{adj}}{\\text{hyp}}') + ' means multiplying by ' + t('\\frac{\\text{hyp}}{\\text{adj}}') + '.' },
              { html: t('\\frac{\\sin A}{\\cos A}=\\frac{\\text{hyp}}{\\text{adj}}') + ', which is ' + t('\\tan A') + ' by TOA.', why: 'Check the algebra: the opposite side should survive on top, and TOA is opposite over adjacent.' }],
              t('\\sin A=\\frac{\\text{opp}}{\\text{hyp}}') + ' and ' + t('\\cos A=\\frac{\\text{adj}}{\\text{hyp}}') + '.<br>' + t('\\frac{\\sin A}{\\cos A}=\\frac{\\text{opp}}{\\text{hyp}}\\times\\frac{\\text{hyp}}{\\text{adj}}=\\frac{\\text{opp}}{\\text{adj}}=\\tan A') + '.<br>The hypotenuse is the denominator of both sine and cosine; dividing by the cosine flips it into a numerator, so it cancels. No particular lengths were used, so it holds for every right triangle.', ['Divide by a fraction = multiply by its reciprocal.'], 'proof sin/cos = tan');
          } }] },

      { num: '18', stem: function (sh) { var T = sh.T; return 'Right triangle ' + t(sh.L.join('')) + ' has its right angle at ' + t(T.R) + ', with ' + t(T.opp + '=' + T.o) + ', ' + t(T.adj + '=' + T.a) + ' and ' + t(T.hyp + '=' + T.h) + '. Angles ' + t(T.A) + ' and ' + t(T.B) + ' are its two acute angles.' + triFig(T, { rot: sh.or.rot, flip: sh.or.flip, lab: labs(T) }); },
        shared: function (r) {
          var tr = r.pick([[60, 91, 109], [60, 91, 109], [20, 21, 29], [28, 45, 53], [33, 56, 65], [48, 55, 73], [39, 80, 89], [65, 72, 97], [36, 77, 85], [11, 60, 61]]), L = r.pick(LETS);
          return { L: L, T: fromTriple(r, { A: L[0], B: L[1], R: L[2] }, tr, 1, tr[0] === 60 ? true : null), or: ori(r, false) };
        },
        parts: [
          { id: 'e18a1', sub: 'a i', level: 'BEG', make: function (r, sh) { var T = sh.T, X = T.A; return ratiosPart(T, ['sin', 'cos', 'tan'], X, 'Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + '.', { nameIt: true }); } },
          { id: 'e18a2', sub: 'a ii', level: 'BEG', make: function (r, sh) { var T = other(sh.T), X = T.A; return ratiosPart(T, ['sin', 'cos', 'tan'], X, 'Write ' + t('\\sin ' + X) + ', ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + '.', { nameIt: true }); } },
          { id: 'e18b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var T = sh.T, A = T.A, B = T.B;
            return mc(r, 'Which two pairs among the six ratios of ' + t('\\angle ' + A) + ' and ' + t('\\angle ' + B) + ' are equal?', [
              { html: t('\\sin ' + A + '=\\cos ' + B) + ' and ' + t('\\cos ' + A + '=\\sin ' + B), right: true },
              { html: t('\\sin ' + A + '=\\sin ' + B) + ' and ' + t('\\cos ' + A + '=\\cos ' + B), why: t('\\sin ' + A + '=' + uT(T.o, T.h)) + ' but ' + t('\\sin ' + B + '=' + uT(T.a, T.h)) + '.' },
              { html: t('\\tan ' + A + '=\\tan ' + B) + ' and ' + t('\\sin ' + A + '=\\cos ' + B), why: 'The tangents ' + t(uT(T.o, T.a)) + ' and ' + t(uT(T.a, T.o)) + ' are reciprocals, not equal.' },
              { html: t('\\sin ' + A + '=\\cos ' + A) + ' and ' + t('\\sin ' + B + '=\\cos ' + B), why: 'For one angle, sine and cosine use different legs.' }],
              t('\\sin ' + A + '=\\cos ' + B + '=' + uT(T.o, T.h)) + ' and ' + t('\\cos ' + A + '=\\sin ' + B + '=' + uT(T.a, T.h)) + '.', ['Compare the six fractions.'], 'equal pairs');
          } },
          { id: 'e18c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var T = sh.T, A = T.A, B = T.B;
            return mc(r, 'Why is ' + t('\\sin ' + A + '=\\cos ' + B) + ' in <b>every</b> right triangle whose acute angles are ' + t(A) + ' and ' + t(B) + '? Which side plays two different roles?', [
              { html: 'The leg ' + t(T.opp) + ': it is <b>opposite</b> ' + t('\\angle ' + A) + ' and <b>adjacent</b> to ' + t('\\angle ' + B) + ', and ' + t(T.hyp) + ' is the hypotenuse for both, so both ratios are ' + t('\\frac{' + T.opp + '}{' + T.hyp + '}') + '.', right: true },
              { html: 'The hypotenuse ' + t(T.hyp) + ': it is opposite ' + t('\\angle ' + A) + ' and adjacent to ' + t('\\angle ' + B) + '.', why: 'The hypotenuse has only one role — it is across from the right angle. It is a <b>leg</b> that changes role.' },
              { html: 'The leg ' + t(T.adj) + ': it is adjacent to both acute angles.', why: t(T.adj) + ' touches ' + t(A) + ' but is opposite ' + t(B) + '. Write ' + t('\\sin ' + A) + ' and ' + t('\\cos ' + B) + ' with side names.' },
              { html: 'Because the numbers ' + t(T.o) + ' and ' + t(T.h) + ' happen to appear in both.', why: 'The question asks for every right triangle — use side names, not this triangle’s numbers.' }],
              t('\\sin ' + A + '=\\frac{\\text{opposite }\\angle ' + A + '}{\\text{hyp}}=\\frac{' + T.opp + '}{' + T.hyp + '}') + ' and ' + t('\\cos ' + B + '=\\frac{\\text{adjacent to }\\angle ' + B + '}{\\text{hyp}}=\\frac{' + T.opp + '}{' + T.hyp + '}') + '. The leg ' + t(T.opp) + ' is opposite ' + t(A) + ' and adjacent to ' + t(B) + '; the hypotenuse is the same for both. So ' + t('\\sin ' + A + '=\\cos ' + B) + ' in every right triangle.', ['Which leg is across from ' + t(A) + '? Does it touch ' + t(B) + '?'], 'proof sin A = cos B');
          } },
          { id: 'e18d1', sub: 'd i', level: 'EMG', make: function (r, sh) {
            var T = sh.T, A = T.A, B = T.B;
            var p = P.number('Compute ' + t('\\tan ' + A + '\\times\\tan ' + B) + ' for this triangle.', 1, function (v) {
              if (closeTo(v, T.o / T.a + T.a / T.o, 0.002)) return { code: 'product-sum', hint: 'You added the two tangents. Multiply them: ' + t(uT(T.o, T.a) + '\\times ' + uT(T.a, T.o)) + '.' };
              if (closeTo(v, (T.o / T.a) * (T.o / T.a), 1e-6) || closeTo(v, (T.a / T.o) * (T.a / T.o), 1e-6)) return { code: 'opp-adj-swap', hint: 'For ' + t('\\angle ' + B) + ' the legs swap roles: ' + t('\\tan ' + B + '=' + uT(T.a, T.o)) + '.' };
              return null;
            }, t('\\tan ' + A + '\\times\\tan ' + B + '=' + uT(T.o, T.a) + '\\times ' + uT(T.a, T.o) + '=1') + '. In general the two legs swap between numerator and denominator, so the tangents of the two acute angles are reciprocals and their product is always ' + t('1') + '.', ['Write both tangents as fractions first.'], 'tanA tanB');
            p.bad = [String(K.roundTo(T.o / T.a + T.a / T.o, 3))];
            return p;
          } },
          { id: 'e18d2', sub: 'd ii', level: 'PRG', make: function (r, sh) {
            var A = sh.T.A, B = sh.T.B;
            return mc(r, 'Since ' + t('\\angle ' + A + '+\\angle ' + B + '=90^\\circ') + ', we have ' + t('\\angle ' + B + '=(90-' + A + ')^\\circ') + '. Which is equal to ' + t('\\cos ' + B + '=\\cos(90-' + A + ')^\\circ') + '?', [
              { html: t('\\sin ' + A), right: true },
              { html: t('\\cos ' + A), why: t('\\cos ' + A) + ' uses the leg touching ' + t(A) + '; ' + t('\\cos ' + B) + ' uses the leg touching ' + t(B) + ' — the leg <b>opposite</b> ' + t(A) + '.' },
              { html: t('\\tan ' + A), why: t('\\cos ' + B) + ' has the hypotenuse on the bottom; ' + t('\\tan ' + A) + ' doesn’t use the hypotenuse.' },
              { html: t('1-\\cos ' + A), why: 'Write ' + t('\\cos ' + B) + ' with side names: adjacent to ' + t(B) + ' over hyp. That leg is opposite ' + t(A) + '.' }],
              t('\\cos ' + B + '=\\cos(90-' + A + ')^\\circ=\\sin ' + A) + ' — the same cofunction result as (c), written with angles instead of side names.', ['The leg adjacent to ' + t(B) + ' is opposite ' + t(A) + '.'], 'cos(90-A) = sin A');
          } }] }
    ];

    /* 12(b): cos R and tan R from sin R */
    function q6local(T) {
      var X = T.A;
      var extra = function (f, v) {
        var big = Math.sqrt(T.h * T.h + T.o * T.o), c = { cos: big / T.h, tan: T.o / big };
        if (closeTo(v, c[f], 0.004)) return { code: 'pyth-add', hint: 'Check your third side: it’s a <b>leg</b>, so subtract the squares — a leg longer than the hypotenuse is impossible.' };
        return null;
      };
      return ratiosPart(T, ['cos', 'tan'], X, 'Write ' + t('\\cos ' + X) + ' and ' + t('\\tan ' + X) + ' as exact fractions in lowest terms.', { extra: extra, nameIt: true,
        sol: t('\\sin ' + X + '=\\frac{\\text{opp}}{\\text{hyp}}=' + uT(T.o, T.h)) + ', so opp ' + t('=' + T.opp + '=' + T.o) + ' and hyp ' + t('=' + T.hyp + '=' + T.h) + '. The third side: ' + t(T.adj + '=\\sqrt{' + T.h + '^2-' + T.o + '^2}=' + T.a) + '.<br>' + t('\\cos ' + X + '=\\frac{\\text{adj}}{\\text{hyp}}=' + steps(T.a, T.h)) + ', \\(\\quad\\) ' + t('\\tan ' + X + '=\\frac{\\text{opp}}{\\text{adj}}=' + steps(T.o, T.a)),
        hints: ['Find the third side first (subtract the squares — it’s a leg).', 'CAH and TOA.'] });
    }
  }
})(window);
