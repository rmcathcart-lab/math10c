/* Math 10C · Unit 5 · Lesson 7A — What Is a Function? (RF2)
 * Assignment questions 1–6 (u5_L07A.tex) and the Extra Practice questions of u5_EP07.tex that are about what a
 * function is, the vertical line test and recognizing functions (EP07 Q1–9, Q20, Q21; Lesson 7B takes the
 * function-notation questions Q10–19 and Q22–25).
 * Every part is a generator. Relations are generated in the booklet's representation (ordered pairs, tables, arrow
 * diagrams, graphs drawn with HW.graph, equations) with the booklet's trap kept (a shared output, a repeated input,
 * a closed curve, a steep-but-not-vertical segment …); where a representation can go either way, the verdict is
 * random (with or without a repeated x), and the booklet's own relation is one of the possible versions.
 * "Give a reason" → 4-option multiple choice (verdict + reason). "State which are functions" → one Function / Not a
 * function choice per relation. "Draw an arrow diagram" → choose the right diagram. "Name the input that breaks the
 * test" → two boxes (input, its outputs; none for a function). "Draw your own mapping diagram" / "change one pair" →
 * the student types ordered pairs, checked for the property. Explain-questions → MC with misconception hints.
 * Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, ex = HW.ex, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, B = K.P;

  HW.addCodes({
    'mc-said-fn': 'Called a non-function a function', 'mc-said-not': 'Called a function “not a function”',
    'mc-shared-out': 'Thought a shared output breaks the function test', 'mc-out-reason': 'Right verdict, reason about outputs instead of inputs',
    'mc-sizes': 'Judged a function by the sizes of the domain and range', 'mc-no-dup-pair': 'Thought different pairs with the same input are fine',
    'mc-all-hit': 'Counted arrows arriving instead of arrows leaving', 'mc-outs-distinct': 'Thought distinct outputs make a function',
    'mc-shared-not': 'Right verdict, blamed a shared output', 'mc-hlt': 'Used a horizontal line test', 'mc-hlt-fn': 'Used a horizontal line test',
    'mc-curved': 'Thought curves can’t be functions', 'mc-curved-not': 'Right verdict, wrong reason (curved)', 'mc-ends': 'Thought a restricted domain breaks the test',
    'mc-smooth': 'Thought a smooth curve must be a function', 'mc-reversed': 'Arrow diagram drawn in the wrong direction', 'mc-wrong-mom': 'Paired a child with the wrong mother',
    'mc-missing-arrows': 'Left arrows out of the arrow diagram', 'mc-two-moms': 'Gave a child two mothers', 'mc-reverse-rel': 'Judged the reverse relation instead',
    'mc-listed-once': 'Thought listing an input once is enough', 'mc-more-kids': 'Judged by the number of elements', 'mc-arrive': 'Counted arrows arriving at an output',
    'mc-fewer': 'Judged by the number of elements', 'mc-at-least-one': 'Right verdict, reason about outputs', 'mc-true-stmt': 'Picked a statement that is always true',
    'mc-defn-rev': 'Reversed relation and function', 'mc-forms': 'Thought functions and relations differ by representation', 'mc-vlt-rev': 'Reversed the vertical line test',
    'mc-pick-fn': 'Picked a function as the non-function', 'fn-said-not': 'Said a function breaks the test', 'fn-used-output': 'Looked at a shared output instead of the inputs',
    'said-fn': 'Missed the input that breaks the test', 'wrong-input': 'Named the wrong input', 'used-output': 'Named an output instead of an input',
    'outputs-missing': 'Left out some outputs of the input', 'outputs-extra': 'Listed outputs that don’t belong to the input',
    'type-11': 'Called it one-to-one', 'type-m1': 'Called it many-to-one', 'type-1m': 'Called it one-to-many', 'type-m1x': 'Thought many-to-one is not a function',
    'dom-extra': 'Used inputs outside the given domain', 'dom-missing': 'Left a domain element without an output', 'm1-notfn': 'Many-to-one attempt is not a function',
    'm1-11': 'Built one-to-one instead of many-to-one', '11-notfn': 'One-to-one attempt has an input with two outputs', '11-m1': 'Built many-to-one instead of one-to-one',
    '1m-fn': 'Built a function instead of one-to-many', 'unchanged': 'Did not change a pair', 'changed-many': 'Changed more than one pair', 'added': 'Added a pair instead of changing one',
    'still-fn': 'New set is still a function', 'same-y': 'Gave the same y-value twice', 'not-on': 'Point does not satisfy the equation', 'no-y': 'x-value with no real y',
    'mc-swap-same': 'Thought swapping letters changes nothing', 'mc-missing-inputs': 'Blamed missing inputs', 'mc-shared-sq': 'Thought a shared output breaks the test',
    'mc-sqrt-both': 'Thought √ gives two values', 'mc-neg': 'Blamed negative inputs', 'mc-side-out': 'Thought the definition restricts outputs', 'mc-side-both': 'Confused function with one-to-one',
    'mc-side-none': 'Thought every relation is a function', 'mc-many-many': 'Thought one-to-one and one-to-many can coexist', 'mc-hlt-ok': 'Thought the horizontal line test decides functions'
  });

  /* ---------------- small helpers ---------------- */
  function range(a, b) { var o = []; for (var i = a; i <= b; i++) o.push(i); return o; }
  function same(a, b) { return Math.abs(a - b) < 1e-9; }
  function num(a, b) { return a - b; }
  function nT(x) { return String(Math.round(x * 1000) / 1000); }
  function pT(p) { return '(' + nT(p[0]) + ',\\ ' + nT(p[1]) + ')'; }
  function psT(ps) { return ps.map(pT).join(',\\ '); }
  function setT(ps) { return '\\{' + psT(ps) + '\\}'; }
  function psH(ps) { return ps.map(function (p) { return '<span class="nw">' + t(pT(p)) + '</span>'; }).join(', '); } // one span per pair so long lists wrap on phones
  function andT(a) { var s = a.map(function (x) { return t(nT(x)); }); return s.length < 2 ? s.join('') : s.slice(0, -1).join(', ') + ' and ' + s[s.length - 1]; }
  function sq(y) { return y < 0 ? '(' + nT(y) + ')^{2}' : nT(y) + '^{2}'; }
  function pickWhere(gen, okf) { for (var i = 0; i < 3000; i++) { var o = gen(); if (okf(o)) return o; } throw new Error('u5l7a: no valid numbers'); }
  /* who is paired with whom */
  function info(pairs) {
    var by = {}, order = [], outBy = {}, oorder = [];
    pairs.forEach(function (p) {
      var k = nT(p[0]); if (!by[k]) { by[k] = { x: p[0], ys: [] }; order.push(k); } if (!by[k].ys.some(function (y) { return same(y, p[1]); })) by[k].ys.push(p[1]);
      var o = nT(p[1]); if (!outBy[o]) { outBy[o] = { y: p[1], xs: [] }; oorder.push(o); } if (!outBy[o].xs.some(function (x) { return same(x, p[0]); })) outBy[o].xs.push(p[0]);
    });
    var breakers = order.map(function (k) { return by[k]; }).filter(function (e) { return e.ys.length > 1; });
    var shared = oorder.map(function (k) { return outBy[k]; }).filter(function (e) { return e.xs.length > 1; });
    return { isFn: !breakers.length, breakers: breakers, shared: shared, xs: order.map(function (k) { return by[k].x; }), ys: oorder.map(function (k) { return outBy[k].y; }),
      type: breakers.length ? (shared.length ? 'mm' : '1m') : (shared.length ? 'm1' : '11') };
  }
  function shuffleApart(r, pairs) {
    for (var i = 0; i < 80; i++) { var s = r.shuffle(pairs), bad = false; for (var j = 1; j < s.length; j++) if (same(s[j][0], s[j - 1][0])) bad = true; if (!bad) return s; }
    return pairs.slice();
  }
  function fnShared(r, xs, yPool) { var ys = r.sample(yPool, xs.length - 1); ys.push(r.pick(ys)); ys = r.shuffle(ys); return xs.map(function (x, i) { return [x, ys[i]]; }); }
  function notFn(r, xs, yPool) { var b = r.pick(xs), ys = r.sample(yPool, xs.length + 1), pairs = xs.map(function (x, i) { return [x, ys[i]]; }); pairs.push([b, ys[xs.length]]); return pairs; }

  /* ---------------- figures ---------------- */
  var RED = '#c4532a';
  function vtab(pairs, hx, hy) {
    return '<table class="vtab"><tr><th>' + hx + '</th><th>' + hy + '</th></tr>' + pairs.map(function (p) { return '<tr><td>' + t(nT(p[0])) + '</td><td>' + t(nT(p[1])) + '</td></tr>'; }).join('') + '</table>';
  }
  function htab(pairs, vx, vy) { return HW.valueTable([[t(vx)].concat(pairs.map(function (p) { return t(nT(p[0])); })), [t(vy)].concat(pairs.map(function (p) { return t(nT(p[1])); }))]); }
  function arrow(pairs, left, right, opt) {
    var I = info(pairs);
    return HW.arrowDiagram(left || I.xs.slice().sort(num), right || I.ys.slice().sort(num), pairs, opt || {});
  }
  function G(spec) { return HW.graph(Object.assign({ x: [-5, 5], y: [-5, 5], labels: 2, max: 260 }, spec)); }
  function demo(g) { // the graph again, with the vertical line and where it crosses
    var spec = Object.assign({}, g.spec, { vline: [g.vx], max: 220, points: (g.spec.points || []).concat(g.hits.map(function (p) { return { x: p[0], y: p[1], color: RED }; })) });
    return G(spec);
  }
  function ell(h, k, a, b, t0, t1) { var o = []; for (var i = 0; i <= 120; i++) { var th = t0 + (t1 - t0) * i / 120; o.push([h + a * Math.cos(th), k + b * Math.sin(th)]); } return o; }
  function inWin(pts, w) { return pts.every(function (p) { return Math.abs(p[0]) <= w && Math.abs(p[1]) <= w; }); }

  /* ---------------- graph generators: { spec, isFn, vx, hits, why, sayFn, sayNot, text } ---------------- */
  function ptsList(hits) { var s = hits.map(function (p) { return t(pT(p)); }); return s.length < 2 ? s.join('') : s.slice(0, -1).join(', ') + ' and ' + s[s.length - 1]; }
  var NOT_WHY = function (vx, hits) { return 'The vertical line ' + t('x=' + nT(vx)) + ' crosses the graph ' + (hits.length > 2 ? hits.length + ' times' : 'twice') + ', at ' + ptsList(hits) + ': the input ' + t(nT(vx)) + ' has more than one output.'; };
  function notG(spec, vx, hits, text, extra) {
    var w = NOT_WHY(vx, hits);
    return { spec: spec, isFn: false, vx: vx, hits: hits, text: text, why: w + (extra || '') + ' <b>Not a function.</b>',
      sayFn: 'Try the vertical line ' + t('x=' + nT(vx)) + ': it meets the graph at ' + ptsList(hits) + ' — one input, more than one output.' };
  }
  function fnG(spec, vx, hit, text, note) {
    return { spec: spec, isFn: true, vx: vx, hits: [hit], text: text,
      why: 'Every vertical line crosses the graph at most once (for example, ' + t('x=' + nT(vx)) + ' meets it only at ' + t(pT(hit)) + ')' + (note ? '; ' + note : '') + '. <b>Function.</b>',
      sayNot: 'Slide a vertical line across the graph: it never meets the graph twice' + (note ? ' (' + note + ')' : '') + '. A <i>horizontal</i> line meeting it twice doesn’t matter — two inputs may share an output.' };
  }
  function gParabola(r) { // y = k + s·a(x−h)², restricted domain
    var o = pickWhere(function () {
      var s = r.pick([-1, -1, 1]), a = r.pick([0.5, 1]), h = r.int(-1, 1), k = s < 0 ? r.int(1, 3) : r.int(-3, -1), d1 = r.pick([1.5, 2, 2.5, 3]), d2 = r.pick([1.5, 2, 2.5]);
      if (r.chance(0.5)) { var tmp = d1; d1 = d2; d2 = tmp; }
      return { s: s, a: a, h: h, k: k, from: h - d1, to: h + d2, f: function (x) { return k + s * a * (x - h) * (x - h); } };
    }, function (o) { return [o.from, o.to].every(function (x) { return Math.abs(o.f(x)) <= 4.7 && Math.abs(x) <= 4.7; }) && Math.abs(o.to - o.from) >= 3; });
    return fnG({ fns: [{ f: o.f, from: o.from, to: o.to }] }, o.h, [o.h, o.k], 'parabola piece', 'the curve stops at both ends, which is allowed');
  }
  function gSideways(r, dots) { // x = h + s·a(y−k)²
    var o = pickWhere(function () {
      var s = r.pick([-1, 1]), a = r.pick([0.5, 1]), m = a === 0.5 ? r.pick([2.5, 3]) : 2, h = s > 0 ? r.int(-4, -1) : r.int(1, 4), k = r.int(-1, 1);
      return { s: s, a: a, m: m, h: h, k: k, d: a === 0.5 ? 2 : 1 };
    }, function (o) { return Math.abs(o.h + o.s * o.a * o.m * o.m) <= 4.6 && Math.abs(o.k) + o.m <= 4.6; });
    var pts = []; for (var i = 0; i <= 80; i++) { var y = o.k - o.m + 2 * o.m * i / 80; pts.push([o.h + o.s * o.a * (y - o.k) * (y - o.k), y]); }
    var vx = o.h + o.s * o.a * o.d * o.d;
    return notG({ segs: [{ pts: pts, start: dots ? 'closed' : 'none', end: dots ? 'closed' : 'none' }] }, vx, [[vx, o.k + o.d], [vx, o.k - o.d]], 'sideways parabola');
  }
  function gWideEllipse(r) {
    var o = pickWhere(function () { return { h: r.int(-1, 1), k: r.int(-1, 1), a: r.pick([3, 4]), b: r.pick([1, 2]) }; }, function (o) { return Math.abs(o.h) + o.a <= 4.6 && Math.abs(o.k) + o.b <= 4.6 && Math.abs(o.h) !== o.a && Math.abs(o.k) !== o.b; });
    if (r.chance(0.7)) return notG({ segs: [{ pts: ell(o.h, o.k, o.a, o.b, 0, 2 * Math.PI) }] }, o.h, [[o.h, o.k + o.b], [o.h, o.k - o.b]], 'wide ellipse');
    var top = r.chance(0.5), s = top ? 1 : -1;
    return fnG({ segs: [{ pts: ell(o.h, o.k, o.a, o.b, 0, s * Math.PI), start: 'closed', end: 'closed' }] }, o.h, [o.h, o.k + s * o.b], (top ? 'top' : 'bottom') + ' half of an ellipse', 'only the ' + (top ? 'top' : 'bottom') + ' half of the oval is drawn');
  }
  function gTallEllipse(r) {
    var o = pickWhere(function () { return { h: r.int(-2, 2), k: r.int(-1, 1), a: r.pick([1, 2]), b: r.pick([3, 4]) }; }, function (o) { return Math.abs(o.h) + o.a <= 4.6 && Math.abs(o.k) + o.b <= 4.6 && Math.abs(o.h) !== o.a && Math.abs(o.k) !== o.b; });
    if (r.chance(0.65)) return notG({ segs: [{ pts: ell(o.h, o.k, o.a, o.b, 0, 2 * Math.PI) }] }, o.h, [[o.h, o.k + o.b], [o.h, o.k - o.b]], 'tall ellipse');
    var top = r.chance(0.5), s = top ? 1 : -1;
    return fnG({ segs: [{ pts: ell(o.h, o.k, o.a, o.b, 0, s * Math.PI), start: 'closed', end: 'closed' }] }, o.h, [o.h, o.k + s * o.b], (top ? 'top' : 'bottom') + ' half of a tall ellipse', 'only the ' + (top ? 'top' : 'bottom') + ' half of the oval is drawn');
  }
  function gBlob(r, wig) { // a closed, star-shaped curve around (h, k)
    return pickWhere(function () {
      var h = r.int(-1, 1), k = r.int(-1, 1), R = r.pick([2.6, 2.9, 3.2]), sx = r.pick([1, 1.15, 1.3]);
      var e1 = 0.07 + 0.08 * r.next(), e2 = 0.05 + 0.07 * r.next(), e3 = wig ? 0.06 + 0.05 * r.next() : 0, p1 = 6.283 * r.next(), p2 = 6.283 * r.next(), p3 = 6.283 * r.next();
      var rr = function (th) { return R * (1 + e1 * Math.sin(2 * th + p1) + e2 * Math.cos(3 * th + p2) + e3 * Math.sin(5 * th + p3)); };
      var pts = []; for (var i = 0; i <= 160; i++) { var th = 2 * Math.PI * i / 160; pts.push([h + sx * rr(th) * Math.cos(th), k + rr(th) * Math.sin(th)]); }
      var top = [h, Math.round((k + rr(Math.PI / 2)) * 10) / 10], bot = [h, Math.round((k - rr(3 * Math.PI / 2)) * 10) / 10];
      var g = notG({ segs: [{ pts: pts }] }, h, [top, bot], wig ? 'wavy closed curve' : 'closed curve');
      g.why = 'The vertical line ' + t('x=' + h) + ' crosses the closed curve twice — once above and once below the middle (near ' + t(pT(top)) + ' and ' + t(pT(bot)) + '). One input, two outputs: <b>not a function.</b> (Any closed loop fails the test.)';
      g.sayFn = 'Try the vertical line ' + t('x=' + h) + ': it crosses the loop once on the top and once on the bottom — one input, two outputs.';
      g.pts = pts; return g;
    }, function (g) { return inWin(g.pts, 4.7); });
  }
  function gWave(r) { // a wavy curve that is a function
    var o = pickWhere(function () { return { A: r.pick([1.5, 2, 2.5]), k: r.int(-1, 1), ph: r.pick([0, 0.5, 1, 1.5]) * Math.PI }; }, function (o) { return Math.abs(o.k) + o.A <= 4; });
    var f = function (x) { return o.k + o.A * Math.sin(Math.PI * x / 3 + o.ph); };
    return fnG({ fns: [{ f: f, from: -4.6, to: 4.6 }] }, 0, [0, Math.round(f(0) * 10) / 10], 'wavy curve (function)', 'the curve goes up and down, but always moving to the right');
  }
  function gSideWave(r) { // x = h + A sin(πy/3): fails
    var A = r.pick([1.5, 2]), h = r.int(-1, 1), pts = [];
    for (var i = 0; i <= 120; i++) { var y = -4.3 + 8.6 * i / 120; pts.push([h + A * Math.sin(Math.PI * y / 3), y]); }
    return notG({ segs: [{ pts: pts }] }, h, [[h, 3], [h, 0], [h, -3]], 'sideways wave');
  }
  function gTriangle(r) {
    var o = pickWhere(function () { var xl = r.int(-4, -2), xr = r.int(2, 4); return { xl: xl, xr: xr, xm: r.int(xl + 2, xr - 1), yb: r.int(-3, -1), yt: r.int(1, 3) }; }, function (o) { return o.xm > o.xl && o.xm < o.xr; });
    var L = [o.xl, o.yb], T = [o.xm, o.yt], R = [o.xr, o.yb];
    if (r.chance(0.7)) {
      var g = notG({ segs: [{ pts: [L, T, R, L] }] }, o.xm, [T, [o.xm, o.yb]], 'triangle');
      g.why = 'The vertical line ' + t('x=' + o.xm) + ' passes through the corner ' + t(pT(T)) + ' and crosses the bottom side at ' + t(pT([o.xm, o.yb])) + '. Any vertical line through the inside crosses two sides: <b>not a function.</b>';
      return g;
    }
    return fnG({ segs: [{ pts: [L, T, R] }] }, o.xm, T, 'two sides of a triangle (open)', 'there is no bottom side, and the path always moves to the right');
  }
  function gLine(r) {
    var c = r.pick([-3, -2, -1, 1, 2, 3]);
    if (r.chance(0.7)) return fnG({ segs: [{ pts: [[-4.6, c], [4.6, c]], start: 'arrow', end: 'arrow' }] }, 2, [2, c], 'horizontal line', 'a horizontal line gives the one output ' + t(c) + ' for every input');
    var g = notG({ segs: [{ pts: [[c, -4.6], [c, 4.6]], start: 'arrow', end: 'arrow' }] }, c, [[c, -2], [c, 2]], 'vertical line');
    g.why = 'This graph <i>is</i> the vertical line ' + t('x=' + c) + ': the one input ' + t(c) + ' is paired with every ' + t('y') + ', for example ' + t(pT([c, -2])) + ' and ' + t(pT([c, 2])) + '. <b>Not a function.</b>';
    return g;
  }

  /* ---------------- multiple-choice builders ---------------- */
  var HFN = ['A relation is a function when every input (first coordinate) is paired with exactly one output (second coordinate).', 'Look for an input that appears with two different outputs. Outputs are allowed to repeat.'];
  var HVLT = ['Imagine sliding a vertical line across the graph. If it ever crosses the graph twice, one ' + t('x') + '-value has two ' + t('y') + '-values.', 'Only vertical lines decide. A horizontal line crossing twice just means two inputs share an output.'];
  var HARR = ['Count the arrows <b>leaving</b> each element on the left. A function has exactly one arrow leaving every one of them.', 'Arrows <b>arriving</b> at the same element on the right are allowed.'];
  function fnPick(r, prompt, isFn, sayFn, sayNot, sol, hints, text) {
    var p = B.mc(r, prompt, [{ html: '<b>Function</b>', right: isFn, why: isFn ? null : sayFn, code: 'said-fn' }, { html: '<b>Not a function</b>', right: !isFn, why: isFn ? sayNot : null, code: 'said-not' }], sol, hints, text, true);
    p.tries = 1; p.input.columns = 2; return p;
  }
  function graphPick(r, g) { return fnPick(r, G(g.spec) + 'Is this relation a function?', g.isFn, g.sayFn, g.sayNot, g.why + demo(g), HVLT, 'function or not: ' + g.text); }
  /* discrete relation, the verdict as a 2-option choice */
  function discWhy(I, rep) {
    if (I.isFn) return (rep === 'arrow' ? 'Each element on the left has exactly one arrow leaving it' : 'Each input ' + andT(I.xs) + ' appears only once, with one output') +
      (I.shared.length ? ' — the output ' + t(nT(I.shared[0].y)) + ' coming from ' + andT(I.shared[0].xs) + ' is allowed' : '') + '. <b>Function.</b>';
    var b = I.breakers[0];
    return (rep === 'arrow' ? t(nT(b.x)) + ' has ' + b.ys.length + ' arrows leaving it (to ' + andT(b.ys) + ')' : 'The input ' + t(nT(b.x)) + ' is paired with ' + andT(b.ys)) + ': one input, more than one output. <b>Not a function.</b>';
  }
  function discPick(r, fig, pairs, rep, text) {
    var I = info(pairs), b = I.breakers[0];
    var sayFn = b ? (rep === 'arrow' ? 'Count the arrows leaving ' + t(nT(b.x)) + ': it points to ' + andT(b.ys) + '. One input, two outputs.' : 'Look at the input ' + t(nT(b.x)) + ': it is paired with ' + andT(b.ys) + '. One input, two outputs.') : null;
    var sayNot = I.isFn ? 'Every input has exactly one output' + (I.shared.length ? ' — the output ' + t(nT(I.shared[0].y)) + ' being shared by ' + andT(I.shared[0].xs) + ' is allowed' : '') + '.' : null;
    return fnPick(r, fig + 'Is this relation a function?', I.isFn, sayFn, sayNot, discWhy(I, rep), rep === 'arrow' ? HARR : HFN, 'function or not: ' + text);
  }
  /* discrete relation, verdict + reason (Q1) */
  function discReasonMC(r, fig, pairs, rep, text) {
    var I = info(pairs), opts, s = I.shared[0], b = I.breakers[0];
    var inputs = rep === 'arrow' ? 'element on the left' : 'input';
    if (I.isFn) {
      opts = [
        { html: 'Function — ' + (rep === 'arrow' ? 'each element on the left has exactly one arrow leaving it.' : 'the inputs ' + t(I.xs.map(nT).join(',\\ ')) + ' are all different, so each input has exactly one output.'), right: true },
        { html: 'Not a function — the output ' + t(nT(s.y)) + ' is paired with ' + (s.xs.length > 2 ? 'several inputs, ' : 'two inputs, ') + andT(s.xs) + '.', code: 'shared-out',
          why: 'Two inputs may share an output. The test is about inputs: is any ' + inputs + ' paired with two different outputs?' },
        { html: 'Function — each output is paired with exactly one input.', code: 'out-reason',
          why: 'The verdict is right but the reason isn’t: the output ' + t(nT(s.y)) + ' comes from ' + andT(s.xs) + '. A function only needs each <b>input</b> to have one output.' },
        { html: 'Not a function — the domain has more elements than the range.', code: 'sizes',
          why: 'A function may have fewer outputs than inputs (several inputs can share one output). Check whether any ' + inputs + ' has two outputs.' }];
    } else {
      var outs = I.shared[0];
      opts = [
        { html: 'Not a function — the input ' + t(nT(b.x)) + ' is paired with ' + (b.ys.length > 2 ? 'several' : 'two') + ' outputs, ' + andT(b.ys) + '.', right: true },
        rep === 'arrow' ? { html: 'Function — every element on the right has an arrow pointing to it.', code: 'all-hit', why: 'Count the arrows <b>leaving</b> each element on the left instead: ' + t(nT(b.x)) + ' sends ' + b.ys.length + ' arrows.' }
          : { html: 'Function — no ordered pair appears twice.', code: 'no-dup-pair', why: t(pT([b.x, b.ys[0]])) + ' and ' + t(pT([b.x, b.ys[1]])) + ' are different pairs, but they give the one input ' + t(nT(b.x)) + ' two different outputs.' },
        { html: 'Function — each output is paired with exactly one input.', code: 'out-reason', why: 'The test is about inputs, not outputs — and the input ' + t(nT(b.x)) + ' is paired with both ' + andT(b.ys) + '.' },
        outs ? { html: 'Not a function — the output ' + t(nT(outs.y)) + ' is paired with ' + (outs.xs.length > 2 ? 'several inputs, ' : 'two inputs, ') + andT(outs.xs) + '.', code: 'shared-not',
          why: 'The verdict is right, but not the reason: inputs may share an output. The real problem is the input ' + t(nT(b.x)) + ', which has more than one output.' }
          : { html: 'Function — the outputs ' + t(I.ys.map(nT).join(',\\ ')) + ' are all different.', code: 'outs-distinct', why: 'Different outputs don’t make it a function. The input ' + t(nT(b.x)) + ' appears twice, with ' + andT(b.ys) + '.' }];
    }
    return B.mc(r, fig + 'Is this relation a function? Choose the answer with the correct reason.', opts, discWhy(I, rep), rep === 'arrow' ? HARR : HFN, 'function? reason: ' + text);
  }
  function graphReasonMC(r, g) {
    var opts = g.isFn ? [
      { html: 'Function — every vertical line crosses the graph at most once.', right: true },
      { html: 'Not a function — some horizontal lines cross the graph twice.', code: 'hlt', why: 'That only shows two inputs sharing an output, which a function may do. Only <b>vertical</b> lines decide.' },
      { html: 'Not a function — the graph is curved, not straight.', code: 'curved', why: 'Curves can be functions. Slide a vertical line across: does it ever meet the curve twice?' },
      { html: 'Not a function — the graph stops at both ends, so some ' + t('x') + '-values have no output.', code: 'ends', why: t('x') + '-values outside the domain simply aren’t inputs — that’s allowed. The test only asks that no input has two outputs.' }] : [
      { html: 'Not a function — the vertical line ' + t('x=' + nT(g.vx)) + ' crosses the graph twice, at ' + t(pT(g.hits[0])) + ' and ' + t(pT(g.hits[1])) + '.', right: true },
      { html: 'Function — every horizontal line crosses the graph at most once.', code: 'hlt-fn', why: 'Horizontal lines don’t decide the test. Use a vertical line, such as ' + t('x=' + nT(g.vx)) + '.' },
      { html: 'Function — the curve is smooth, with no breaks.', code: 'smooth', why: 'Being smooth has nothing to do with it. Where does the vertical line ' + t('x=' + nT(g.vx)) + ' cross the curve?' },
      { html: 'Not a function — the graph is a curve.', code: 'curved-not', why: 'The verdict is right, but not the reason: many curves (a parabola opening up or down, for one) are functions. The real reason is a vertical line that crosses twice.' }];
    return B.mc(r, G(g.spec) + 'Is this relation a function? Choose the answer with the correct reason.', opts, g.why + demo(g), HVLT, 'function? reason: ' + g.text);
  }

  /* ---------------- "name the input that breaks the test" (two boxes) ---------------- */
  function isNone(s) { var z = String(s == null ? '' : s).replace(/\\text\{\s*([^}]*)\}|\\mathrm\{\s*([^}]*)\}/g, '$1$2').replace(/\s+/g, '').toLowerCase(); return /^(none|no|nothing|dne|n\/a|na|itisafunction|function)$/.test(z); }
  function nums(s) {
    s = String(s == null ? '' : s).replace(/\\left|\\right/g, '').replace(/\\[,;:! ]|\\quad|\\qquad|~/g, ' ').replace(/\\text\{\s*(or|and)\s*\}/gi, ',').replace(/\b(or|and)\b/gi, ',').replace(/;/g, ',').replace(/[a-zA-Z]\s*=\s*/g, '').replace(/\\\{|\\\}|\\lbrace|\\rbrace/g, '');
    if (!s.trim()) return null;
    var out = [], pcs = s.split(',');
    for (var i = 0; i < pcs.length; i++) { var p = pcs[i].trim(); if (!p) continue; var pm = /^(\\pm|±)/.test(p); p = p.replace(/^(\\pm|±)\s*/, ''); var a = ex.parse(p); if (!a.ok) return null; var v = ex.value(a.ast); if (!isFinite(v)) return null; out.push(v); if (pm) out.push(-v); }
    return out.length ? out : null;
  }
  function has(arr, v) { return arr.some(function (x) { return same(x, v); }); }
  function breakerPart(fig, pairs, vx, vy, sol, text, hints) {
    var I = info(pairs), b = I.breakers[0];
    var fields = [{ label: 'Input that breaks the test:', name: 'Input', mode: 'math', keys: 'solutions', vars: [vx], none: true, placeholder: 'e.g. 3  or  none' },
      { label: 'Its outputs:', name: 'Outputs', mode: 'math', keys: 'solutions', vars: [vy], none: true, placeholder: 'e.g. 4, 9  or  none' }];
    var key = I.isFn ? ['none', 'none'] : [nT(b.x), b.ys.map(nT).join(', ')];
    var check = function (resp) {
      resp = resp || []; var a = String(resp[0] == null ? '' : resp[0]).trim(), c = String(resp[1] == null ? '' : resp[1]).trim();
      if (!a && !c) return form('empty', 'Fill in the boxes first. If the relation is a function, press <b>none</b>.');
      if (!a) return form('no-input', 'Fill in the first box: the input that breaks the test, or <b>none</b>.');
      if (I.isFn) {
        if (isNone(a)) return !c || isNone(c) ? ok() : form('none-both', 'If no input breaks the test, press <b>none</b> in the second box too.');
        var av = nums(a); if (!av) return form('unreadable', 'Type one number, e.g. ' + t('3') + ', or press <b>none</b>.');
        if (!has(I.xs, av[0]) && I.shared.some(function (e) { return same(e.y, av[0]); })) return wrong('fn-used-output', t(nT(av[0])) + ' is an output shared by more than one input. Sharing an output is allowed — the test is about the inputs.');
        return wrong('fn-said-not', has(I.xs, av[0]) ? 'The input ' + t(nT(av[0])) + ' has only one output. Check every input: if none has two outputs, the relation is a function — press <b>none</b>.' : 'Every input appears with only one output' + (I.shared.length ? ' (outputs may repeat)' : '') + ', so nothing breaks the test — press <b>none</b>.');
      }
      if (isNone(a)) return wrong('said-fn', 'Look at the inputs (first coordinates) again: one of them appears with more than one output.');
      var av2 = nums(a); if (!av2) return form('unreadable', 'Type the input as a number, e.g. ' + t('3') + '.');
      if (av2.length > 1) return form('one-input', 'Type just the one input that breaks the test.');
      if (!same(av2[0], b.x)) {
        if (!has(I.xs, av2[0]) && has(I.ys, av2[0])) return wrong('used-output', t(nT(av2[0])) + ' is an output (second coordinate), not an input. Which <b>input</b> appears with two different outputs?');
        return wrong('wrong-input', has(I.xs, av2[0]) ? 'The input ' + t(nT(av2[0])) + ' has only one output. Find the input that appears with two different outputs.' : t(nT(av2[0])) + ' isn’t an input of this relation. Find the input that appears with two different outputs.');
      }
      if (!c || isNone(c)) return form('no-outputs', 'Right input! Now list the outputs it is paired with, separated by commas.');
      var cv = nums(c); if (!cv) return form('unreadable2', 'List the outputs as numbers separated by commas, e.g. ' + t('4,\\ 9') + '.');
      var miss = b.ys.filter(function (y) { return !has(cv, y); }), extra = cv.filter(function (y) { return !has(b.ys, y); });
      if (extra.length) return wrong('outputs-extra', t(nT(extra[0])) + ' is not an output of the input ' + t(nT(b.x)) + '. List only the outputs paired with ' + t(nT(b.x)) + '.');
      if (miss.length) return wrong('outputs-missing', 'The input ' + t(nT(b.x)) + ' is paired with ' + (b.ys.length > 2 ? b.ys.length + ' outputs' : 'one more output') + ' — list all of them.');
      return ok();
    };
    var bad = I.isFn ? [[nT(I.xs[0]), nT(pairs[0][1])]] : [['none', 'none'], [nT(b.x), nT(b.ys[0])]];
    var good = I.isFn ? [['none', '']] : [[vx + '=' + nT(b.x), b.ys.slice().reverse().map(nT).join(', ')]];
    return { prompt: fig + 'If the relation is <b>not</b> a function, name the input that breaks the test and the outputs it is paired with. If it <b>is</b> a function, press <b>none</b> in both boxes.',
      input: { type: 'fields', fields: fields }, check: check, key: key, good: good, bad: bad,
      answer: I.isFn ? 'none — it is a function' : 'input ' + t(nT(b.x)) + ', outputs ' + t(b.ys.map(nT).join(',\\ ')) + ' (not a function)', solution: sol || discWhy(I, 'pairs'), hints: hints || HFN, text: text };
  }

  /* ---------------- one-to-one / many-to-one / one-to-many ---------------- */
  var TYPES = [{ id: '11', html: 'One-to-one; a function' }, { id: 'm1', html: 'Many-to-one; a function' }, { id: '1m', html: 'One-to-many; not a function' }, { id: 'm1x', html: 'Many-to-one; <b>not</b> a function' }];
  function typeWord(ty) { return ty === '11' ? 'one-to-one' : ty === 'm1' ? 'many-to-one' : 'one-to-many'; }
  function typeSol(I, rep) {
    if (I.type === '1m') { var b = I.breakers[0]; return (rep === 'arrow' ? t(nT(b.x)) + ' sends arrows to ' + andT(b.ys) : 'The input ' + t(nT(b.x)) + ' has the outputs ' + andT(b.ys)) + ': one input, several outputs. <b>One-to-many; not a function.</b>'; }
    if (I.type === 'm1') { var s = I.shared[0]; return 'Each input has one output, but ' + andT(s.xs) + ' share the output ' + t(nT(s.y)) + '. <b>Many-to-one; a function.</b>'; }
    return 'Each input has one output and each output comes from one input. <b>One-to-one; a function.</b>';
  }
  function typeMC(r, fig, pairs, rep, text) {
    var I = info(pairs), ty = I.type, b = I.breakers[0], s = I.shared[0];
    var whys = {
      '11': function () { return ty === 'm1' ? andT(s.xs) + ' share the output ' + t(nT(s.y)) + ', so it is many-to-one, not one-to-one. (It is still a function.)' : 'The input ' + t(nT(b.x)) + ' has two outputs (' + andT(b.ys) + '): one-to-many.'; },
      'm1': function () { return ty === '11' ? 'No two inputs share an output here: every output comes from exactly one input. That is one-to-one.' : 'Look at the inputs: ' + t(nT(b.x)) + ' is paired with both ' + andT(b.ys) + ' — one input, two outputs. That is one-to-many.'; },
      '1m': function () { return 'Every input has exactly one output, so no input is “one-to-many”.' + (ty === 'm1' ? ' Shared outputs make it many-to-one.' : ''); },
      'm1x': function () { return ty === 'm1' ? 'Right type — but a many-to-one relation <b>is</b> a function: every input still has exactly one output.' : ty === '11' ? 'No outputs are shared here, so it isn’t many-to-one. And every input has one output.' : 'The input ' + t(nT(b.x)) + ' has two outputs — that is one-to-many, not many-to-one.'; }
    };
    var opts = TYPES.map(function (o) { return { html: o.html, right: o.id === ty, why: o.id === ty ? null : whys[o.id](), code: o.id }; });
    var p = B.mc(r, fig + 'Classify the relation and state whether it is a function.', opts, typeSol(I, rep), ['One-to-one: one output per input <i>and</i> one input per output. Many-to-one: inputs share an output. One-to-many: an input has two or more outputs.', 'Only one-to-many fails the function test.'], 'type: ' + text, true);
    p.check = (function (c) { return function (resp) { var res = c(resp); if (res.v === 'wrong') res.code = 'type-' + res.code.replace(/^mc-/, ''); return res; }; })(p.check);
    return p;
  }
  function relOfType(r, ty) { // four small pairs of the given type, xs from 1..9
    return pickWhere(function () {
      var xs = r.sample(range(1, 9), 4).sort(num), ys = r.sample(range(1, 12), 4);
      if (ty === '11') return xs.map(function (x, i) { return [x, ys[i]]; });
      if (ty === 'm1') { var ps = xs.map(function (x, i) { return [x, ys[i]]; }); ps[r.int(1, 3)][1] = ps[0][1]; return ps; }
      if (ty === 'const') return xs.map(function (x) { return [x, ys[0]]; });
      var p2 = xs.slice(0, 3).map(function (x, i) { return [x, ys[i]]; }); p2.splice(r.int(1, 3), 0, [xs[r.int(0, 2)], ys[3]]); return p2;
    }, function (ps) { var I = info(ps); return ty === 'const' ? I.ys.length === 1 : ty === '1m' ? I.type === '1m' : I.type === ty; });
  }

  /* ---------------- typed ordered pairs (constructions) ---------------- */
  function readPairs(resp) {
    var s = String(resp == null ? '' : resp).replace(/\\left|\\right/g, '').replace(/\\[,;:! ]|\\quad|\\qquad|~/g, ' ').replace(/\\lparen/g, '(').replace(/\\rparen/g, ')').replace(/\\\{|\\\}|\\lbrace|\\rbrace|[{}]/g, ' ');
    if (!s.trim()) return { empty: true };
    var re = /\(([^()]*)\)/g, m, out = [];
    while ((m = re.exec(s))) {
      var xy = m[1].split(','); if (xy.length !== 2) return { bad: true };
      var a = ex.parse(xy[0].trim()), b = ex.parse(xy[1].trim()); if (!a.ok || !b.ok) return { bad: true };
      out.push([ex.value(a.ast), ex.value(b.ast)]);
    }
    if (s.replace(re, '').replace(/[,\s]/g, '').length || !out.length) return { bad: true };
    return { pairs: out };
  }
  function pairsCheck(test) {
    return function (resp) {
      var L = readPairs(resp);
      if (L.empty) return form('empty', 'Type your ordered pairs first, e.g. ' + t('\\{(2,\\ 1),\\ (4,\\ 3)\\}') + '.');
      if (L.bad) return form('unreadable', 'Write ordered pairs in brackets, separated by commas, e.g. ' + t('\\{(2,\\ 1),\\ (4,\\ 3)\\}') + '.');
      var keys = L.pairs.map(function (p) { return nT(p[0]) + '|' + nT(p[1]); });
      for (var i = 0; i < keys.length; i++) if (keys.indexOf(keys[i]) !== i) return form('dup', 'You listed ' + t(pT(L.pairs[i])) + ' twice — each ordered pair only needs to be listed once.');
      return test(L.pairs, info(L.pairs));
    };
  }
  function domainTest(D, ps, I) {
    var extra = I.xs.filter(function (x) { return !has(D, x); }), miss = D.filter(function (x) { return !has(I.xs, x); });
    if (extra.length) return wrong('dom-extra', 'Your inputs (first coordinates) include ' + t(nT(extra[0])) + ', which is not in the domain ' + t('\\{' + D.join(',\\ ') + '\\}') + '. Use only the domain values as first coordinates.');
    if (miss.length) return wrong('dom-missing', 'Every element of the domain needs an arrow: you have no pair that starts with ' + t(nT(miss[0])) + '.');
    return null;
  }
  function makeKind(D, kind) {
    return pairsCheck(function (ps, I) {
      var d = domainTest(D, ps, I); if (d) return d;
      if (kind === 'm1') {
        if (!I.isFn) return wrong('m1-notfn', 'The input ' + t(nT(I.breakers[0].x)) + ' has two outputs, so this is not a function. Give every input exactly one output.');
        if (!I.shared.length) return wrong('m1-11', 'Every output here comes from just one input — that is one-to-one. Make at least two inputs share an output.');
      } else if (kind === '11') {
        if (!I.isFn) return wrong('11-notfn', 'The input ' + t(nT(I.breakers[0].x)) + ' has two outputs. In a one-to-one relation each input has exactly one output.');
        if (I.shared.length) return wrong('11-m1', andT(I.shared[0].xs) + ' share the output ' + t(nT(I.shared[0].y)) + ' — that is many-to-one. Give every input a different output.');
      } else if (I.isFn) return wrong('1m-fn', 'Every input has exactly one output, so this is a function. One-to-many needs one input with two or more outputs — give one input a second arrow.');
      return ok();
    });
  }

  /* ---------------- relations for Q4 (mothers and children) ---------------- */
  var KIDS = ['Aiden', 'Blake', 'Chloe', 'Danielle', 'Evan', 'Fatima', 'Grace', 'Hiro', 'Isla', 'Jonah', 'Kiran', 'Leah', 'Mateo', 'Nora', 'Owen', 'Priya', 'Quinn', 'Ravi', 'Sofia', 'Tariq', 'Uma', 'Wes'];
  function nameDiagram(left, right, pairs) { // an arrow diagram for names (wider ovals; arrows start and end clear of the words)
    var n = Math.max(left.length, right.length), rowH = 30, H = n * rowH + 30, W = 330, lx = 78, rx = 252, hw = function (sv) { return 3.9 * String(sv).length + 6; };
    var ly = function (i) { return 15 + (i + 0.5) * (n * rowH / left.length); }, ry = function (i) { return 15 + (i + 0.5) * (n * rowH / right.length); };
    var esc = function (v) { return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var o = '<rect width="' + W + '" height="' + H + '" fill="#fff"/>';
    [lx, rx].forEach(function (cx) { o += '<ellipse cx="' + cx + '" cy="' + (15 + n * rowH / 2) + '" rx="58" ry="' + (n * rowH / 2 + 8) + '" fill="#f6f4ef" stroke="#2b3340" stroke-width="1.4"/>'; });
    left.forEach(function (v, i) { o += '<text x="' + lx + '" y="' + (ly(i) + 5) + '" font-size="14" text-anchor="middle" fill="#1c2230">' + esc(v) + '</text>'; });
    right.forEach(function (v, i) { o += '<text x="' + rx + '" y="' + (ry(i) + 5) + '" font-size="14" text-anchor="middle" fill="#1c2230">' + esc(v) + '</text>'; });
    pairs.forEach(function (pp) {
      var i = left.indexOf(pp[0]), j = right.indexOf(pp[1]); if (i < 0 || j < 0) return;
      o += '<line x1="' + (lx + hw(pp[0])) + '" y1="' + ly(i) + '" x2="' + (rx - hw(pp[1]) - 2) + '" y2="' + ry(j) + '" stroke="#13807a" stroke-width="1.6" marker-end="url(#ndArr)"/>';
    });
    return '<svg class="fig-svg" viewBox="0 0 ' + W + ' ' + H + '" style="max-width:330px" role="img" aria-label="arrow diagram"><defs><marker id="ndArr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#13807a"/></marker></defs>' + o + '</svg>';
  }
  function kidsSentence(m, ks) { return m + ' has ' + (ks.length === 1 ? 'one child, ' + ks[0] : (ks.length === 2 ? 'two children, ' : 'three children: ') + ks.slice(0, -1).join(', ') + ' and ' + ks[ks.length - 1]) + '.'; }

  HW.defineLesson({
    id: 'u5l7a', unit: 5, num: '7A', title: 'What Is a Function?', outcome: 'RF2',
    blurb: 'A function pairs every input with exactly one output: test ordered pairs, tables, arrow diagrams, graphs (the vertical line test) and equations.',
    questions: [
      { num: '1', section: 'Part A — Is it a function? Give a reason', stem: 'Determine which of the following relations are functions. Give a reason for each answer.', parts: [
        { id: '1a', level: 'EMG', make: function (r) {
          var pairs = r.chance(0.6) ? fnShared(r, r.sample(range(-6, 8), 4), range(1, 9)) : notFn(r, r.sample(range(-6, 8), 3), range(1, 9));
          pairs = shuffleApart(r, pairs);
          return discReasonMC(r, '<p>' + psH(pairs) + '</p>', pairs, 'pairs', psT(pairs));
        } },
        { id: '1b', level: 'BEG', make: function (r) { return graphReasonMC(r, r.chance(0.65) ? gParabola(r) : gSideways(r)); } },
        { id: '1c', level: 'EMG', make: function (r) {
          var left = r.sample(range(1, 9), 4).sort(num), right = r.sample(range(1, 9), 2).sort(num), fn = r.chance(0.4);
          var pairs = pickWhere(function () {
            var bi = fn ? -1 : r.int(0, 3), ps = [];
            left.forEach(function (x, i) { if (i === bi) { ps.push([x, right[0]]); ps.push([x, right[1]]); } else ps.push([x, r.pick(right)]); });
            return ps;
          }, function (ps) { var I = info(ps); return I.ys.length === 2 && (fn ? I.shared.length > 0 : true); });
          return discReasonMC(r, arrow(pairs, left, right), pairs, 'arrow', 'arrow diagram ' + psT(pairs));
        } },
        { id: '1d', level: 'EMG', make: function (r) {
          var pairs;
          if (r.chance(0.4)) pairs = fnShared(r, r.sample(range(-4, 6), 4), range(1, 9));
          else {
            var xs = r.sample(range(-4, 6), 3), ys = r.sample(range(1, 9), 4), pos = r.pick([[0, 3], [0, 2], [1, 3]]), others = [xs[1], xs[2]];
            pairs = []; var oi = 0;
            for (var i = 0; i < 4; i++) pairs.push([pos.indexOf(i) >= 0 ? xs[0] : others[oi++], ys[i]]);
          }
          return discReasonMC(r, vtab(pairs, 'Input (' + t('x') + ')', 'Output (' + t('y') + ')'), pairs, 'table', 'table ' + psT(pairs));
        } }] },
      { num: '2', section: 'Part B — Function or not, in many forms', stem: 'State which of the following relations are functions.', parts: [
        { id: '2a', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { s: r.int(-4, 0), d: r.pick([1, 2, 3]) }; }, function (o) { return o.s + 4 * o.d <= 9; });
          var xs = range(0, 4).map(function (i) { return o.s + i * o.d; }), pairs = fnShared(r, xs, range(0, 9));
          if (r.chance(0.4)) { var i = r.int(0, 2), j = r.int(i + 2, 4); pairs[j] = [pairs[i][0], r.pick(range(0, 9).filter(function (y) { return y !== pairs[i][1]; }))]; }
          return discPick(r, '<p>' + psH(pairs) + '</p>', pairs, 'pairs', psT(pairs));
        } },
        { id: '2b', level: 'BEG', make: function (r) { return graphPick(r, gWideEllipse(r)); } },
        { id: '2c', level: 'BEG', make: function (r) { return graphPick(r, gTallEllipse(r)); } },
        { id: '2d', level: 'BEG', make: function (r) { var u = r.next(); return graphPick(r, u < 0.6 ? gBlob(r, false) : u < 0.8 ? gWave(r) : gSideWave(r)); } },
        { id: '2e', level: 'BEG', make: function (r) {
          var left = r.sample(range(1, 12), 4).sort(num), right = r.sample(range(1, 12), 4).sort(num), perm = r.chance(0.5) ? [0, 1, 2, 3] : r.shuffle([0, 1, 2, 3]);
          var pairs = left.map(function (x, i) { return [x, right[perm[i]]]; });
          if (r.chance(0.35)) { var k = r.int(0, 3); pairs.splice(k + 1, 0, [left[k], right[r.pick([0, 1, 2, 3].filter(function (j) { return j !== perm[k]; }))]]); }
          return discPick(r, arrow(pairs, left, right), pairs, 'arrow', 'arrow diagram ' + psT(pairs));
        } }] },
      { num: '3', stem: 'State which of the following relations are functions.', parts: [
        { id: '3a', level: 'EMG', make: function (r) {
          var s = r.int(-3, 1), c = r.int(2, 12), pairs = range(0, 3).map(function (i) { return [s + 2 * i, c]; });
          if (r.chance(0.35)) { var i = r.int(0, 1), j = r.int(i + 2, 3); pairs[j] = [pairs[i][0], r.pick(range(1, 12).filter(function (y) { return y !== c; }))]; }
          return discPick(r, vtab(pairs, t('x'), t('y')), pairs, 'table', 'table ' + psT(pairs));
        } },
        { id: '3b', level: 'BEG', make: function (r) {
          var m = r.pick([2, 3, 4]), left = [m, 2 * m, 3 * m, 4 * m], right = r.sample(range(1, 9), 2).sort(num), fn = r.chance(0.35);
          var pairs = pickWhere(function () {
            var bi = fn ? -1 : r.int(0, 3), ps = [];
            left.forEach(function (x, i) { if (i === bi) { ps.push([x, right[0]]); ps.push([x, right[1]]); } else ps.push([x, r.pick(right)]); });
            return ps;
          }, function (ps) { return info(ps).ys.length === 2; });
          return discPick(r, arrow(pairs, left, right), pairs, 'arrow', 'arrow diagram ' + psT(pairs));
        } },
        { id: '3c', level: 'EMG', make: function (r) {
          var ab = r.sample(range(1, 6), 2).sort(num), c = r.int(2, 12), pairs = [[ab[0], c], [-ab[0], c], [ab[1], c], [-ab[1], c]];
          if (r.chance(0.35)) pairs[3] = [ab[0], r.pick(range(1, 12).filter(function (y) { return y !== c; }))];
          return discPick(r, vtab(pairs, t('x'), t('y')), pairs, 'table', 'table ' + psT(pairs));
        } },
        { id: '3d', level: 'BEG', make: function (r) { return graphPick(r, gLine(r)); } },
        { id: '3e', level: 'BEG', make: function (r) { return graphPick(r, gTriangle(r)); } },
        { id: '3f', level: 'BEG', make: function (r) { var u = r.next(); return graphPick(r, u < 0.6 ? gBlob(r, true) : u < 0.8 ? gWave(r) : gSideWave(r)); } }] },
      { num: '4', section: 'Part C — A relation and its reverse', stem: function (sh) { return kidsSentence(sh.moms[0], sh.kids[0]) + ' ' + kidsSentence(sh.moms[1], sh.kids[1]); },
        shared: function (r) {
          var L = r.chance(0.4) ? ['X', 'Y'] : r.sample(['X', 'Y', 'Z', 'P', 'Q', 'R', 'S', 'T'], 2).sort(), n = r.pick([[2, 3], [3, 2], [1, 3], [3, 1], [2, 2]]), ks = r.sample(KIDS, n[0] + n[1]);
          return { moms: ['Mrs. ' + L[0], 'Mrs. ' + L[1]], kids: [ks.slice(0, n[0]), ks.slice(n[0])], big: n[0] >= n[1] ? 0 : 1 };
        },
        parts: [
          { id: '4ai', sub: 'a i', level: 'BEG', make: function (r, sh) {
            var M = sh.moms, kidsAll = sh.kids[0].concat(sh.kids[1]), pr = [];
            sh.kids.forEach(function (ks, i) { ks.forEach(function (k) { pr.push([M[i], k]); }); });
            var bi = sh.big, moved = sh.kids[bi][sh.kids[bi].length - 1];
            var wrongMom = pr.map(function (p) { return p[1] === moved ? [M[1 - bi], moved] : p; }), firstOnly = sh.kids.map(function (ks, i) { return [M[i], ks[0]]; });
            var opts = [
              { html: nameDiagram(M, kidsAll, pr), right: true },
              { html: nameDiagram(kidsAll, M, pr.map(function (p) { return [p[1], p[0]]; })), code: 'reversed', why: 'That diagram goes from the children to the mothers — that is “is the child of”. “Is the mother of” starts at the mothers.' },
              { html: nameDiagram(M, kidsAll, wrongMom), code: 'wrong-mom', why: 'Check who belongs to whom: ' + moved + ' is ' + M[bi] + '’s child.' },
              { html: nameDiagram(M, kidsAll, firstOnly), code: 'missing-arrows', why: 'Every mother–child pair needs its own arrow: ' + M[bi] + ' has ' + sh.kids[bi].length + ' children, so ' + sh.kids[bi].length + ' arrows leave ' + M[bi] + '.' }];
            return B.mc(r, 'Which arrow diagram shows the relation “is the mother of”, from the set of mothers to the set of children?', opts,
              'The domain is the mothers and the range is the children. One arrow goes from each mother to each of her children:' + nameDiagram(M, kidsAll, pr),
              ['“Is the mother of” starts at a mother and points to her child.', 'Draw one arrow for every mother–child pair.'], 'arrow diagram: is the mother of');
          } },
          { id: '4aii', sub: 'a ii', level: 'EMG', make: function (r, sh) {
            var M = sh.moms, bi = sh.big, nb = sh.kids[bi].length;
            return B.mc(r, 'Is the relation “is the mother of” (from mothers to children) a function?', [
              { html: 'No — ' + M[bi] + ' is paired with ' + nb + ' children, so one input has more than one output.', right: true },
              { html: 'Yes — every child has exactly one mother.', code: 'reverse-rel', why: 'That describes the reverse relation (children → mothers). Here the inputs are the mothers: how many arrows leave ' + M[bi] + '?' },
              { html: 'Yes — each mother appears in the domain only once.', code: 'listed-once', why: 'Being listed once isn’t the test. Count the arrows leaving ' + M[bi] + ': there are ' + nb + '.' },
              { html: 'No — there are more children than mothers.', code: 'more-kids', why: 'The verdict is right, but not the reason: “is the child of” also has more children than mothers, and it is a function. The real reason is that ' + M[bi] + ' has ' + nb + ' outputs.' }],
              M[bi] + ' has ' + nb + ' arrows leaving her (to ' + sh.kids[bi].join(', ') + '). One element of the domain is paired with more than one element of the range, so “is the mother of” is <b>not a function</b>.',
              HARR, 'is the mother of: function?');
          } },
          { id: '4bi', sub: 'b i', level: 'BEG', make: function (r, sh) {
            var M = sh.moms, kidsAll = sh.kids[0].concat(sh.kids[1]), pr = [];
            sh.kids.forEach(function (ks, i) { ks.forEach(function (k) { pr.push([k, M[i]]); }); });
            var bi = sh.big, moved = sh.kids[bi][0], other = sh.kids[1 - bi][0];
            var wrongMom = pr.map(function (p) { return p[0] === moved ? [moved, M[1 - bi]] : p; }), twoMoms = pr.concat([[other, M[bi]]]);
            var opts = [
              { html: nameDiagram(kidsAll, M, pr), right: true },
              { html: nameDiagram(M, kidsAll, pr.map(function (p) { return [p[1], p[0]]; })), code: 'reversed', why: 'That diagram goes from the mothers to the children — that is “is the mother of”. “Is the child of” starts at the children.' },
              { html: nameDiagram(kidsAll, M, wrongMom), code: 'wrong-mom', why: 'Check who belongs to whom: ' + moved + ' is ' + M[bi] + '’s child.' },
              { html: nameDiagram(kidsAll, M, twoMoms), code: 'two-moms', why: other + ' has only one mother, ' + M[1 - bi] + ', so only one arrow should leave ' + other + '.' }];
            return B.mc(r, 'Which arrow diagram shows the relation “is the child of”, from the set of children to the set of mothers?', opts,
              'Now the domain is the children and the range is the mothers. One arrow goes from each child to their mother:' + nameDiagram(kidsAll, M, pr),
              ['“Is the child of” starts at a child and points to the mother.', 'Each child gets one arrow, to their own mother.'], 'arrow diagram: is the child of');
          } },
          { id: '4bii', sub: 'b ii', level: 'PRG', make: function (r, sh) {
            var M = sh.moms, bi = sh.big, nb = sh.kids[bi].length;
            return B.mc(r, 'Is the relation “is the child of” (from children to mothers) a function?', [
              { html: 'Yes — each child has exactly one arrow leaving them, pointing to their one mother.', right: true },
              { html: 'No — ' + M[bi] + ' has ' + nb + ' arrows pointing to her.', code: 'arrive', why: 'Arrows <b>arriving</b> at an output are allowed: several inputs may share an output. Count the arrows <b>leaving</b> each child.' },
              { html: 'No — the range has fewer elements than the domain.', code: 'fewer', why: 'The sizes don’t decide it. Does any child (input) have more than one arrow leaving it?' },
              { html: 'Yes — every mother is paired with at least one child.', code: 'at-least-one', why: 'The verdict is right, but that sentence is about the outputs (the mothers). The reason it is a function is that each <b>child</b> — each input — has exactly one arrow leaving it.' }],
              'Every child has exactly one mother, so exactly one arrow leaves each element of the domain. Several children pointing to the same mother is allowed (many-to-one). “Is the child of” <b>is a function</b> — even though its reverse, “is the mother of”, is not.',
              HARR, 'is the child of: function?');
          } }] },
      { num: '5', section: 'Part D — Multiple choice and explaining', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '5', level: 'EMG', make: function (r) {
          var TRUE = [
            { html: 'A function is a set of ordered pairs ' + t('(x,\\ y)') + ' in which every ' + t('x') + '-value corresponds to exactly one ' + t('y') + '-value.', why: 'This one is always true — it is the definition of a function.' },
            { html: 'Every function passes the vertical line test.', why: 'Always true: if a vertical line crossed the graph twice, one ' + t('x') + '-value would have two ' + t('y') + '-values.' },
            { html: 'Every element of the domain is related to exactly one element of the range.', why: 'Always true — this is the definition, said with “domain” and “range”.' },
            { html: 'No input of a function is paired with two different outputs.', why: 'Always true — that is exactly the function rule.' },
            { html: 'Every function is a relation.', why: 'Always true: a function is a special kind of relation.' }];
          var FALSE = [
            { html: 'For every output value there is only one input value.', cx: 'For ' + t('y=x^{2}') + ', the output ' + t('4') + ' comes from both ' + t('2') + ' and ' + t('-2') + ', yet ' + t('y=x^{2}') + ' is a function.' },
            { html: 'No two ordered pairs of a function have the same ' + t('y') + '-coordinate.', cx: t('\\{(1,\\ 5),\\ (2,\\ 5)\\}') + ' is a function, yet both pairs have ' + t('y=5') + '.' },
            { html: 'Every horizontal line crosses the graph of a function at most once.', cx: 'The line ' + t('y=4') + ' crosses the graph of ' + t('y=x^{2}') + ' twice, at ' + t('(-2,\\ 4)') + ' and ' + t('(2,\\ 4)') + ' — and ' + t('y=x^{2}') + ' is a function.' },
            { html: 'The range of a function has as many elements as its domain.', cx: t('\\{(1,\\ 5),\\ (2,\\ 5),\\ (3,\\ 5)\\}') + ' is a function with domain ' + t('\\{1,\\ 2,\\ 3\\}') + ' but range ' + t('\\{5\\}') + '.' }];
          var f = r.chance(0.5) ? FALSE[0] : r.pick(FALSE), tr = r.sample(TRUE, 3);
          var opts = tr.map(function (o) { return { html: o.html, why: o.why, code: 'true-stmt' }; }).concat([{ html: f.html, right: true }]);
          return B.mc(r, 'Which of the following statements is <b>not</b> always true for a function?', opts,
            'The other three restate the definition of a function (or follow from it), so they are always true. The remaining one is about outputs, and a function may let several inputs share an output. ' + f.cx,
            ['The definition restricts the <b>inputs</b>: each one has exactly one output. Which statement makes a claim about the outputs instead?'], 'not always true for a function');
        } }] },
      { num: '6', stem: 'Every function is a relation, but not every relation is a function.', parts: [
        { id: '6a', level: 'EMG', make: function (r) {
          return B.mc(r, 'Which statement explains why?', [
            { html: 'A relation is any pairing of inputs with outputs. A function is a relation with one extra rule — no input has more than one output — so every function is a relation, but a relation that breaks the rule is not a function.', right: true },
            { html: 'A function is any set of ordered pairs, and a relation is a function whose outputs are all different.', code: 'defn-rev', why: 'That’s backwards: “relation” is the general word, and “function” is the special case. Also, a function’s outputs may repeat.' },
            { html: 'Functions are given by equations and relations by lists of points.', code: 'forms', why: 'Both can be shown in any form — pairs, tables, arrow diagrams, graphs or equations. The difference is the one-output rule.' },
            { html: 'Every relation passes the vertical line test, but only some functions do.', code: 'vlt-rev', why: 'That’s reversed: every <b>function</b> passes the vertical line test; some relations don’t.' }],
            'A relation is any set of ordered pairs. A function is a relation in which no input is paired with more than one output. So the functions sit inside the relations (like the inner oval in the lesson’s diagram), and a relation such as ' + t('\\{(6,\\ 2),\\ (6,\\ 5)\\}') + ' is a relation but not a function.',
            ['Which word is the general one, and which is the special case with an extra rule?'], 'every function is a relation');
        } },
        { id: '6b', level: 'EMG', make: function (r) {
          var kinds = r.shuffle(['11', 'm1', 'const', '1m']), rels = kinds.map(function (k) { return shuffleApart(r, relOfType(r, k)); });
          var opts = rels.map(function (ps, i) {
            var I = info(ps);
            return { html: t(setT(ps)), right: kinds[i] === '1m', code: 'pick-fn', why: kinds[i] === '1m' ? null : 'Each input in this one appears once' + (I.shared.length ? ' — sharing the output ' + t(nT(I.shared[0].y)) + ' is allowed' : '') + '. It is a function, so it belongs inside the “Functions” oval.' };
          });
          var nf = rels[kinds.indexOf('1m')], b = info(nf).breakers[0];
          return B.mc(r, 'Which relation is a relation that is <b>not</b> a function (it belongs in the “Relations” oval but outside the “Functions” oval)?', opts,
            'In ' + t(setT(nf)) + ' the input ' + t(nT(b.x)) + ' is paired with ' + andT(b.ys) + '. It is still a relation (a set of ordered pairs), but not a function. The other three each give every input exactly one output, so they are functions — and functions are relations too.',
            HFN, 'relation but not a function');
        } }] }
    ],
    extra: [
      { num: '1', section: 'Extra practice A — The function test in five representations', stem: 'State whether each set of ordered pairs is a function.', parts: [
        { id: 'e1a', level: 'EMG', make: function (r) {
          var s = r.int(-5, -2), d = r.pick([2, 3]), c = r.int(1, 9), pairs = range(0, 3).map(function (i) { return [s + d * i, c]; });
          return breakerPart('<p>' + psH(pairs) + '</p>', pairs, 'x', 'y', 'The inputs ' + andT(pairs.map(function (p) { return p[0]; })) + ' are all different. Sharing the output ' + t(c) + ' is allowed. <b>Function.</b>', 'breaker: ' + psT(pairs));
        } },
        { id: 'e1b', level: 'BEG', make: function (r) {
          var c = r.int(-6, 9), s = r.int(-2, 2), pairs = range(0, 3).map(function (i) { return [c, s + i]; });
          return breakerPart('<p>' + psH(pairs) + '</p>', pairs, 'x', 'y', 'The input ' + t(c) + ' is paired with ' + andT(pairs.map(function (p) { return p[1]; })) + '. <b>Not a function.</b>', 'breaker: ' + psT(pairs));
        } },
        { id: 'e1c', level: 'EMG', make: function (r) {
          var o = pickWhere(function () { return { b: r.chance(0.6) ? 0 : r.int(-4, 4), m: r.int(1, 6), n: r.int(1, 6), k: r.int(1, 9) }; }, function (o) { return o.b !== o.n && o.b !== -o.n; });
          var pairs = [[o.b, -o.m], [o.n, o.k], [-o.n, o.k], [o.b, o.m]];
          return breakerPart('<p>' + psH(pairs) + '</p>', pairs, 'x', 'y', 'The input ' + t(o.b) + ' is paired with both ' + t(-o.m) + ' and ' + t(o.m) + '. (The inputs ' + t(o.n) + ' and ' + t(-o.n) + ' sharing ' + t(o.k) + ' is fine.) <b>Not a function.</b>', 'breaker: ' + psT(pairs));
        } },
        { id: 'e1d', level: 'EMG', make: function (r) {
          var a = r.pick([0.5, 1.5, 2.5, 3.5]), b = r.pick(range(2, 6).filter(function (x) { return Math.abs(x - a) > 0.6; })), pairs = [[a, b], [-a, b], [b, a], [-b, a]];
          return breakerPart('<p>' + psH(pairs) + '</p>', pairs, 'x', 'y', 'The inputs ' + andT([a, -a, b, -b]) + ' are all different, so each has one output. (The number ' + t(nT(a)) + ' appearing as an input in one pair and an output in another doesn’t matter.) <b>Function.</b>', 'breaker: ' + psT(pairs));
        } }] },
      { num: '2', stem: 'State whether the relation in each table is a function.', parts: [
        { id: 'e2a', level: 'EMG', make: function (r) {
          var xs = r.sample(range(-4, 9), 5).sort(num), c = r.int(1, 9), pairs = xs.map(function (x) { return [x, c]; });
          return breakerPart(htab(pairs, 'x', 'y'), pairs, 'x', 'y', 'The inputs ' + andT(xs) + ' are all different; all sharing the output ' + t(c) + ' is allowed. <b>Function.</b>', 'breaker table: ' + psT(pairs));
        } },
        { id: 'e2b', level: 'EMG', make: function (r) {
          var k = r.int(1, 3), rate = r.pick([3, 4, 5, 6]), ts = [0, 1, 2, 3], tt = [];
          ts.forEach(function (x) { tt.push(x); if (x === k) tt.push(x); });
          var pairs = tt.map(function (x, i) { return [x, rate * i]; });
          return breakerPart(htab(pairs, 't', 'd'), pairs, 't', 'd', 'The input ' + t('t=' + k) + ' appears twice, with ' + t('d=' + rate * k) + ' and ' + t('d=' + rate * (k + 1)) + '. <b>Not a function.</b>', 'breaker table: ' + psT(pairs));
        } },
        { id: 'e2c', level: 'EMG', make: function (r) {
          var a = r.pick([6, 8, 10, 12, 15]), m = r.pick([2, 3]), b = a * m, pairs = [[1, a], [2, b], [3, a], [4, b]];
          return breakerPart(htab(pairs, 'n', 'C'), pairs, 'n', 'C', 'The inputs ' + andT([1, 2, 3, 4]) + ' are all different; the repeated outputs ' + t(a) + ' and ' + t(b) + ' are allowed. <b>Function.</b>', 'breaker table: ' + psT(pairs));
        } }] },
      { num: '3', stem: 'State whether each mapping diagram shows a function. Count the arrows <b>leaving</b> each left-hand value — that, and nothing else, is the test.', parts: [
        { id: 'e3a', level: 'BEG', make: function (r) {
          var s = r.int(1, 4), k = r.int(3, 6), left = range(s, s + 3), right = left.map(function (x) { return x + k; }), pairs = left.map(function (x) { return [x, x + k]; });
          if (r.chance(0.3)) { var i = r.int(0, 3); pairs.splice(i + 1, 0, [left[i], right[(i + r.int(1, 3)) % 4]]); }
          return discPick(r, arrow(pairs, left, right), pairs, 'arrow', 'mapping ' + psT(pairs));
        } },
        { id: 'e3b', level: 'EMG', make: function (r) {
          var ab = r.sample(range(1, 5), 2).sort(num), p = r.int(1, 9), q = r.pick(range(1, 12).filter(function (y) { return y !== p; }));
          var left = [-ab[1], -ab[0], ab[0], ab[1]], right = [p, q].sort(num), pairs = [[-ab[1], p], [-ab[0], q], [ab[0], q], [ab[1], p]];
          if (r.chance(0.3)) pairs.splice(1, 0, [-ab[1], q]);
          return discPick(r, arrow(pairs, left, right), pairs, 'arrow', 'mapping ' + psT(pairs));
        } },
        { id: 'e3c', level: 'BEG', make: function (r) {
          var m = r.pick([2, 3, 4]), left = [m, 2 * m, 3 * m], right = r.sample(range(1, 9), 3).sort(num);
          var pairs = [[left[0], right[0]], [left[0], right[1]], [left[1], right[2]], [left[2], right[2]]];
          if (r.chance(0.3)) pairs = [[left[0], right[0]], [left[1], right[1]], [left[2], right[2]]];
          return discPick(r, arrow(pairs, left, right), pairs, 'arrow', 'mapping ' + psT(pairs));
        } }] },
      { num: '4', stem: 'Apply the vertical line test to each graph.', shared: function (r) { return { c: r.pick([-3, -2, -1, 1, 2, 3]), y0: r.pick([4, 5]), swap: r.chance(0.4) }; }, parts: [
        { id: 'e4a', level: 'BEG', make: function (r, sh) { return segPick(r, sh, !sh.swap); } },
        { id: 'e4b', level: 'BEG', make: function (r, sh) { var p = segPick(r, sh, sh.swap); p.prompt = p.prompt.replace('Is this relation a function?', 'Graphs (a) and (b) are deliberately similar — use the grid, not your first impression. Is this relation a function?'); return p; } },
        { id: 'e4c', level: 'BEG', make: function (r) {
          var u = r.next(), g;
          if (u < 0.7) {
            var R = r.pick([3, 4, 5]), top = u < 0.45, s = top ? 1 : -1;
            g = fnG({ x: [-6, 6], y: [-6, 6], segs: [{ pts: ell(0, 0, R, R, Math.PI, Math.PI - s * Math.PI), start: 'closed', end: 'closed' }] }, 0, [0, s * R], (top ? 'upper' : 'lower') + ' semicircle', 'each ' + t('x') + ' from ' + t(-R) + ' to ' + t(R) + ' has one height');
          } else {
            var right = r.chance(0.5), sx = right ? 1 : -1;
            g = notG({ x: [-6, 6], y: [-6, 6], segs: [{ pts: ell(0, 0, 5, 5, -Math.PI / 2, Math.PI / 2).map(function (p) { return [sx * p[0], p[1]]; }), start: 'closed', end: 'closed' }] }, 3 * sx, [[3 * sx, 4], [3 * sx, -4]], (right ? 'right' : 'left') + ' semicircle');
          }
          g.spec = Object.assign({ x: [-6, 6], y: [-6, 6] }, g.spec);
          return graphPick(r, g);
        } },
        { id: 'e4d', level: 'BEG', make: function (r) {
          if (r.chance(0.25)) {
            var h = r.int(-4, -2), a = 0.5, f = function (x) { return h + a * x * x; };
            return graphPick(r, fnG({ fns: [{ f: f, from: -3, to: 3, start: 'closed', end: 'closed' }] }, 0, [0, h], 'parabola opening up'));
          }
          return graphPick(r, gSideways(r, true));
        } },
        { id: 'e4e', level: 'EMG', make: function (r) {
          var pairs = pickWhere(function () {
            var xs = r.sample(range(-4, 4), 4), ys = r.sample(range(-4, 4), 5), ps = xs.map(function (x, i) { return [x, ys[i]]; });
            if (r.chance(0.65)) ps.push([r.pick(xs), ys[4]]); else { var x5 = r.pick(range(-4, 4).filter(function (x) { return xs.indexOf(x) < 0; })); ps.push([x5, ys[r.int(0, 3)]]); }
            return ps;
          }, function (ps) { return ps.every(function (p) { return p[0] !== 0 || p[1] !== 0; }); });
          var I = info(pairs), b = I.breakers[0], fig = G({ points: pairs.map(function (p) { return { x: p[0], y: p[1] }; }) });
          return breakerPart(fig, pairs, 'x', 'y', b ? 'The vertical line ' + t('x=' + b.x) + ' passes through ' + b.ys.map(function (y) { return t(pT([b.x, y])); }).join(' and ') + ': one input, two outputs. <b>Not a function.</b>' + G({ points: pairs.map(function (p) { return { x: p[0], y: p[1], color: same(p[0], b.x) ? RED : null }; }), vline: [b.x], max: 220 })
            : 'No two points are on the same vertical line: the inputs ' + andT(I.xs.slice().sort(num)) + ' are all different. <b>Function.</b>', 'points: ' + psT(pairs), HVLT);
        } },
        { id: 'e4f', level: 'BEG', make: function (r) {
          var h = r.int(-1, 1), k = r.pick([-4, -2]);
          if (r.chance(0.7)) return graphPick(r, fnG({ segs: [{ pts: [[h - 3, k + 3], [h, k], [h + 3, k + 3]], start: 'closed', end: 'closed' }] }, h, [h, k], 'V shape', 'the V goes down and then up, always moving to the right'));
          var kk = r.pick([-1, 1]);
          return graphPick(r, notG({ segs: [{ pts: [[h + 3, kk + 3], [h, kk], [h + 3, kk - 3]], start: 'closed', end: 'closed' }] }, h + 1, [[h + 1, kk + 1], [h + 1, kk - 1]], 'sideways V'));
        } }] },
      { num: '5', stem: 'Decide whether each equation defines ' + t('y') + ' as a function of ' + t('x') + '.',
        shared: function (r) { return { m: r.pick([-5, -4, -3, -2, 2, 3, 4, 5]), b: r.pick([-9, -7, -5, -3, 3, 5, 7, 9]), p: r.int(2, 8), c: r.int(1, 6), k: r.int(2, 9), R: r.pick([3, 4, 5, 6, 7, 8, 10]) }; },
        parts: [
          { id: 'e5', level: 'EMG', make: function (r, sh) {
            var rows = [
              { id: 'a', tex: 'y=' + sh.m + 'x' + (sh.b < 0 ? sh.b : '+' + sh.b), fn: true, why: 'Each ' + t('x') + ' gives one value of ' + t(sh.m + 'x' + (sh.b < 0 ? sh.b : '+' + sh.b)) + ' (for example ' + t('x=0') + ' gives only ' + t('y=' + sh.b) + '). A non-vertical line is a function.' },
              { id: 'b', tex: 'y=x^{2}-' + sh.p + 'x', fn: true, why: 'Each ' + t('x') + ' gives one value of ' + t('x^{2}-' + sh.p + 'x') + ' (for example ' + t('x=1') + ' gives only ' + t('y=' + (1 - sh.p)) + '). Squaring the <i>input</i> is fine.' },
              { id: 'c', tex: 'x=y^{2}+' + sh.c, fn: false, why: 'Try ' + t('x=' + (sh.c + 4)) + ': ' + t('y^{2}=4') + ', so ' + t('y=2') + ' or ' + t('y=-2') + ' — one input, two outputs.' },
              { id: 'd', tex: 'y=' + sh.k, fn: true, why: 'Every input gives the single output ' + t(sh.k) + ' — a horizontal line, which is a function.' },
              { id: 'e', tex: 'x=' + sh.k, fn: false, why: 'This is a vertical line: the input ' + t(sh.k) + ' is paired with every ' + t('y') + ', e.g. ' + t(pT([sh.k, 0])) + ' and ' + t(pT([sh.k, 1])) + '.' },
              { id: 'f', tex: 'x^{2}+y^{2}=' + sh.R * sh.R, fn: false, why: 'Try ' + t('x=0') + ': ' + t('y^{2}=' + sh.R * sh.R) + ', so ' + t('y=' + sh.R) + ' or ' + t('y=-' + sh.R) + ' (it is a circle).' }];
            var shown = r.shuffle(rows), want = {}, byId = {};
            rows.forEach(function (x) { want[x.id] = x.fn ? 'F' : 'N'; byId[x.id] = x; });
            return B.grid('For each equation, choose <b>Function</b> or <b>Not a function</b>.', shown.map(function (x) { return { id: x.id, html: t(x.tex) }; }), [{ id: 'F', html: 'Function' }, { id: 'N', html: 'Not a function' }], want,
              { why: function (id) { return { code: 'row', hint: t(byId[id].tex) + ': ' + byId[id].why }; } },
              rows.map(function (x) { return t(x.tex) + ': ' + x.why.replace(/ — one input, two outputs\.$/, '.') + ' <b>' + (x.fn ? 'Function' : 'Not a function') + '.</b>'; }).join('<br>'),
              ['Pick an ' + t('x') + '-value and solve for ' + t('y') + '. If you can get two different ' + t('y') + '-values, it is not a function.', 'Watch for ' + t('y^{2}') + ': both ' + t('y') + ' and ' + t('-y') + ' square to the same number.'], 'equations: function or not');
          } },
          { id: 'e5c', level: 'PRG', make: function (r, sh) { return twoYPart('x=y^{2}+' + sh.c, function (x, y) { return y * y + sh.c - x; }, [String(sh.c + 4), '2', '-2'], [[String(sh.c + 1), '1', '-1'], [String(sh.c + 9), '-3', '3']], [[String(sh.c), '0', '0'], [String(sh.c + 4), '2', '2'], [String(sh.c + 4), '2', '3']],
            function (x) { return x < sh.c ? 'For ' + t('x=' + nT(x)) + ', ' + t('y^{2}=' + nT(x - sh.c)) + ' is negative, so there is no ' + t('y') + ' at all. Choose an ' + t('x') + ' greater than ' + t(sh.c) + '.' : null; },
            'Choose an ' + t('x') + ' that makes ' + t('x-' + sh.c) + ' a perfect square: ' + t('x=' + (sh.c + 4)) + ' gives ' + t('y^{2}=4') + ', so ' + t('y=2') + ' or ' + t('y=-2') + '. The points ' + t(pT([sh.c + 4, 2])) + ' and ' + t(pT([sh.c + 4, -2])) + ' share an input: not a function.'); } },
          { id: 'e5f', level: 'PRG', make: function (r, sh) {
            var R2 = sh.R * sh.R;
            return twoYPart('x^{2}+y^{2}=' + R2, function (x, y) { return x * x + y * y - R2; }, ['0', String(sh.R), String(-sh.R)], [['1', '\\sqrt{' + (R2 - 1) + '}', '-\\sqrt{' + (R2 - 1) + '}']].concat(sh.R === 5 ? [['3', '4', '-4']] : sh.R === 10 ? [['6', '8', '-8']] : []), [[String(sh.R), '0', '0'], ['0', String(sh.R), String(sh.R)]],
              function (x) { return Math.abs(x) > sh.R ? 'For ' + t('x=' + nT(x)) + ', ' + t('y^{2}=' + R2 + '-' + sq(x) + '=' + nT(R2 - x * x)) + ' is negative, so there is no ' + t('y') + '. Choose an ' + t('x') + ' between ' + t(-sh.R) + ' and ' + t(sh.R) + '.' : null; },
              'Try ' + t('x=0') + ': ' + t('y^{2}=' + R2) + ', so ' + t('y=' + sh.R) + ' or ' + t('y=-' + sh.R) + '. The points ' + t(pT([0, sh.R])) + ' and ' + t(pT([0, -sh.R])) + ' share an input: not a function (the graph is a circle).');
          } }] },
      { num: '6', stem: 'In one equation the input is squared, in the other the output is.', parts: [
        { id: 'e6a', level: 'EMG', make: function (r) {
          var m = r.int(2, 6), k = m * m;
          return B.mc(r, t('y=x^{2}') + ' is a function but ' + t('x=y^{2}') + ' is not, even though one comes from the other by swapping the letters. What does the swap do?', [
            { html: 'In ' + t('y=x^{2}') + ' each ' + t('x') + ' gives one output. After the swap the squaring acts on the output: ' + t('x=' + k) + ' gives ' + t('y=' + m) + ' and ' + t('y=-' + m) + ', two outputs, so the test fails.', right: true },
            { html: 'Nothing: swapping the letters never changes whether a relation is a function.', code: 'swap-same', why: 'Try it: in ' + t('x=y^{2}') + ', what are the ' + t('y') + '-values when ' + t('x=' + k) + '?' },
            { html: t('x=y^{2}') + ' fails because negative ' + t('x') + '-values have no output.', code: 'missing-inputs', why: 'Values outside the domain are allowed to have no output. The problem is an input with <b>two</b> outputs.' },
            { html: 'Neither is a function, because in ' + t('y=x^{2}') + ' the inputs ' + t(m) + ' and ' + t(-m) + ' give the same output.', code: 'shared-sq', why: 'Two inputs sharing an output is allowed, so ' + t('y=x^{2}') + ' is a function (many-to-one).' }],
            'In ' + t('y=x^{2}') + ' the squaring acts on the <b>input</b>, so each ' + t('x') + ' gives one output (' + t(m) + ' and ' + t(-m) + ' share the output ' + t(k) + ' — many-to-one, allowed). In ' + t('x=y^{2}') + ' it acts on the <b>output</b>: ' + t('x=' + k) + ' gives ' + t('y=\\pm ' + m) + ' — one-to-many, which fails the test.',
            ['Pick ' + t('x=' + k) + ' and find every ' + t('y') + ' for each equation.'], 'swap y=x² vs x=y²');
        } },
        { id: 'e6b', level: 'PRG', make: function (r) {
          var m = r.int(2, 7), k = m * m;
          return B.mc(r, 'Why is ' + t('y=\\sqrt{x}') + ' a function of ' + t('x') + ', while ' + t('y^{2}=x') + ' is not? (The ' + t('\\sqrt{\\ }') + ' symbol means the <i>principal</i> square root only.)', [
            { html: t('\\sqrt{\\ }') + ' gives only the non-negative root: ' + t('y=\\sqrt{' + k + '}') + ' means ' + t('y=' + m) + ' alone. But ' + t('y^{2}=' + k) + ' gives ' + t('y=' + m) + ' or ' + t('y=-' + m) + ' — two outputs.', right: true },
            { html: 'They are the same equation, so both are functions.', code: 'sqrt-both', why: 'Not quite the same: ' + t('y^{2}=' + k) + ' has two solutions, ' + t('\\pm ' + m) + ', but ' + t('\\sqrt{' + k + '}') + ' is only ' + t(m) + '.' },
            { html: 'Both fail, because ' + t('\\sqrt{' + k + '}') + ' is ' + t(m) + ' or ' + t(-m) + '.', code: 'sqrt-both', why: 'The symbol ' + t('\\sqrt{\\ }') + ' means the principal (non-negative) root only: ' + t('\\sqrt{' + k + '}=' + m) + '.' },
            { html: t('y^{2}=x') + ' fails because ' + t('x') + ' can’t be negative.', code: 'neg', why: 'Neither equation has outputs for negative ' + t('x') + ' — that is allowed. The difference is how many outputs a positive ' + t('x') + ' gets.' }],
            t('y=\\sqrt{x}') + ' takes only the principal root, so each ' + t('x\\ge 0') + ' has <b>one</b> output (' + t('\\sqrt{' + k + '}=' + m) + '). In ' + t('y^{2}=x') + ' nothing restricts the sign: ' + t('x=' + k) + ' gives ' + t('y=' + m) + ' or ' + t('y=-' + m) + ' — <b>two</b> outputs.',
            ['Compare the outputs for ' + t('x=' + k) + ' in each equation.'], 'sqrt vs y²=x');
        } }] },
      { num: '7', section: 'Extra practice B — One-to-one, many-to-one, one-to-many', stem: 'A relation is <b>one-to-one</b> when each input has one output and each output comes from one input; <b>many-to-one</b> when two or more inputs share an output; <b>one-to-many</b> when a single input produces two or more outputs. Only one-to-many fails the function test. Classify each mapping diagram.',
        shared: function (r) { return { types: r.shuffle(['m1', '1m', '11']) }; },
        parts: [0, 1, 2].map(function (i) {
          return { id: 'e7' + 'abc'.charAt(i), level: 'EMG', make: function (r, sh) {
            var ty = sh.types[i], left, right, pairs;
            if (ty === 'm1') { var pq = r.sample(range(1, 6), 2).sort(num); left = [-pq[1], -pq[0], 0, pq[0], pq[1]]; pairs = left.map(function (x) { return [x, x * x]; }); right = [pq[1] * pq[1], pq[0] * pq[0], 0]; }
            else if (ty === '1m') { var mn = r.sample(range(1, 6), 2).sort(num); left = [mn[0] * mn[0], mn[1] * mn[1]]; right = [mn[0], -mn[0], mn[1], -mn[1]]; pairs = [[left[0], mn[0]], [left[0], -mn[0]], [left[1], mn[1]], [left[1], -mn[1]]]; }
            else { var k = r.int(2, 5), s = r.int(1, 3); left = range(s, s + 3); pairs = left.map(function (x) { return [x, k * x]; }); right = pairs.map(function (p) { return p[1]; }); }
            return typeMC(r, arrow(pairs, left, right), pairs, 'arrow', psT(pairs));
          } };
        }) },
      { num: '8', stem: 'Classify each set of ordered pairs as one-to-one, many-to-one or one-to-many, then state whether it is a function.',
        shared: function (r) { return { types: r.shuffle(['11', 'const', '1m', 'pm']) }; },
        parts: [0, 1, 2, 3].map(function (i) {
          return { id: 'e8' + 'abcd'.charAt(i), level: 'EMG', make: function (r, sh) {
            var ty = sh.types[i], pairs, s = r.int(1, 3);
            if (ty === '11') { var k = r.int(2, 5); pairs = range(s, s + 3).map(function (x) { return [x, k * x]; }); }
            else if (ty === 'const') { var c = r.int(2, 9); pairs = range(s, s + 3).map(function (x) { return [x, c]; }); }
            else if (ty === '1m') { var d = r.int(2, 4); pairs = [[s, d], [s, 2 * d], [s + 1, 3 * d], [s + 2, 4 * d]]; }
            else { var pq = r.sample(range(1, 5), 2).sort(num); pairs = [[-pq[0], pq[0] * pq[0]], [pq[0], pq[0] * pq[0]], [-pq[1], pq[1] * pq[1]], [pq[1], pq[1] * pq[1]]]; }
            return typeMC(r, '<p>' + psH(pairs) + '</p>', pairs, 'pairs', psT(pairs));
          } };
        }) },
      { num: '9', stem: function (sh) { return 'Build your own relations. Every relation must use the domain ' + t('\\{' + sh.D.join(',\\ ') + '\\}') + ': each of these numbers is an input, and no other number is. Type each relation as a set of ordered pairs.'; },
        shared: function (r) { return { D: r.chance(0.4) ? [2, 4, 6, 8] : r.pick([[1, 3, 5, 7], [0, 2, 4, 6], [1, 2, 3, 4], [3, 6, 9, 12], [-2, -1, 1, 2], [5, 10, 15, 20]]) }; },
        parts: [
          { id: 'e9a', level: 'PRG', make: function (r, sh) {
            var D = sh.D, key = [[D[0], 1], [D[1], 1], [D[2], 5], [D[3], 5]];
            var p9 = B.math('A relation that is <b>many-to-one</b>, and a function.', makeKind(D, 'm1'), setT(key), 'Answers vary. Give every input exactly one output, and let at least two inputs share an output, e.g. ' + t(setT(key)) + '.',
              ['Each input gets exactly one arrow.', 'Make two (or more) of the arrows end at the same output.'], 'build many-to-one, domain ' + D.join(','), { keys: 'pairs', placeholder: 'e.g. {(2, 1), (4, 3), …}' });
            return Object.assign(p9, { good: [psT(D.map(function (x) { return [x, 7]; })), setT([[D[0], 2], [D[1], 3], [D[2], 3], [D[3], 3]])], bad: [setT(D.map(function (x) { return [x, x + 1]; })), setT([[D[0], 1], [D[0], 2], [D[1], 1], [D[2], 1], [D[3], 1]]), setT([[D[0], 1], [D[1], 1], [D[2], 1]])] });
          } },
          { id: 'e9b', level: 'EMG', make: function (r, sh) {
            var D = sh.D, key = D.map(function (x) { return [x, x + 1]; });
            var p9 = B.math('A relation that is <b>one-to-one</b>.', makeKind(D, '11'), setT(key), 'Answers vary. Give every input its own, different output, e.g. ' + t(setT(key)) + '.',
              ['Each input gets exactly one arrow, and no two arrows end at the same output.'], 'build one-to-one, domain ' + D.join(','), { keys: 'pairs', placeholder: 'e.g. {(2, 3), (4, 5), …}' });
            return Object.assign(p9, { good: [setT(D.map(function (x) { return [x, -x]; }))], bad: [setT(D.map(function (x) { return [x, 7]; })), setT([[D[0], 1], [D[1], 2], [D[2], 3], [D[3], 4], [D[3] + 1, 5]])] });
          } },
          { id: 'e9c', level: 'PRG', make: function (r, sh) {
            var D = sh.D, key = [[D[0], 1], [D[0], 3], [D[1], 5], [D[2], 7], [D[3], 9]];
            var p9 = B.math('A relation that is <b>one-to-many</b>.', makeKind(D, '1m'), setT(key), 'Answers vary. Give at least one input two (or more) outputs, e.g. ' + t(setT(key)) + '.',
              ['One-to-many needs one input with two or more arrows leaving it.', 'Every domain value still needs at least one pair.'], 'build one-to-many, domain ' + D.join(','), { keys: 'pairs', placeholder: 'e.g. {(2, 1), (2, 3), …}' });
            return Object.assign(p9, { good: [setT([[D[3], 0], [D[3], 1], [D[3], 2], [D[0], 0], [D[1], 0], [D[2], 0]])], bad: [setT(D.map(function (x) { return [x, x + 1]; })), setT([[D[0], 1], [D[0], 3], [D[1], 5]])] });
          } },
          { id: 'e9d', level: 'EMG', make: function (r, sh) {
            var D = sh.D;
            return B.mc(r, 'Exactly one of your three relations fails the function test. Which one, and why?', [
              { html: 'The one-to-many relation: a domain element such as ' + t(D[0]) + ' is paired with two range elements, but a function pairs each element of the domain with exactly one element of the range.', right: true },
              { html: 'The many-to-one relation: two domain elements share a range element.', code: 'shared-out', why: 'Sharing an output is allowed — many-to-one relations are functions.' },
              { html: 'The one-to-one relation: it has too many different outputs.', code: 'sizes', why: 'One-to-one relations are functions: each input has exactly one output.' },
              { html: 'The one-to-many relation, because it has more outputs than inputs.', code: 'sizes', why: 'Right relation, wrong reason: the number of outputs doesn’t matter. What matters is that one input has two outputs.' }],
              'The one-to-many relation fails: a function pairs <b>each element of the domain with exactly one element of the range</b>, and in it one input has two outputs. The many-to-one and one-to-one relations are both functions.',
              HFN, 'which construction fails');
          } },
          { id: 'e9e', level: 'PRG', make: function (r) {
            return B.mc(r, 'Can a relation be both one-to-one and one-to-many at the same time?', [
              { html: 'No — one-to-many needs an input with two or more outputs, but one-to-one needs every input to have exactly one output. No input can do both.', right: true },
              { html: 'Yes — if it has many inputs and many outputs.', code: 'many-many', why: 'Having many inputs and outputs isn’t the point. One-to-one needs <b>every</b> input to have exactly one output — can one input then have two?' },
              { html: 'Yes — when one input has two outputs that no other input uses.', code: 'many-many', why: 'That input has two outputs, so the relation is not one-to-one (one-to-one means one output per input).' },
              { html: 'No — because a one-to-one relation always has more inputs than outputs.', code: 'sizes', why: 'Right answer, wrong reason: a one-to-one relation has exactly as many inputs as outputs. The real reason is that no input can have one output and two outputs at once.' }],
              'One-to-one: every input has exactly one output (and every output one input). One-to-many: at least one input has two or more outputs. These contradict each other, so <b>no</b> relation can be both.',
              ['Write what each word demands of the inputs.'], 'one-to-one and one-to-many?');
          } }] },
      { num: '20', section: 'Extra practice C — Find the mistake', stem: function (sh) { return '<i>(Error analysis)</i> Asked whether ' + t(setT(sh.ps)) + ' is a function, a student answers: “No. The output ' + t(sh.q) + ' is used twice and the output ' + t(sh.p) + ' is used twice, so the outputs are not unique.”'; },
        shared: function (r) {
          var o = pickWhere(function () { return { a: r.int(2, 5), b: r.int(1, 4), p: r.int(1, 12), q: r.int(1, 12) }; }, function (o) { return o.b < o.a && o.p !== o.q; });
          if (r.chance(0.4)) o = { a: 2, b: 1, p: 9, q: 4 };
          o.ps = [[-o.a, o.p], [-o.b, o.q], [o.b, o.q], [o.a, o.p]]; return o;
        },
        parts: [
          { id: 'e20a', level: 'EMG', make: function (r) {
            return B.mc(r, 'A function pairs each element of the domain with exactly one element of the range. Which side of each ordered pair does this rule restrict?', [
              { html: 'The first coordinate (the input): no input may appear with two different outputs. Second coordinates may repeat.', right: true },
              { html: 'The second coordinate (the output): no output may be used twice.', code: 'side-out', why: 'That is the student’s mistake. Outputs may repeat; the rule is about inputs.' },
              { html: 'Both: all the inputs and all the outputs must be different.', code: 'side-both', why: 'That describes a <i>one-to-one</i> relation, which is stricter than a function. A function only needs each input to have one output.' },
              { html: 'Neither: every set of ordered pairs is a function.', code: 'side-none', why: 'Every set of ordered pairs is a <i>relation</i>. A function also needs each input to have exactly one output.' }],
              'The definition restricts the <b>first</b> coordinate: no input may have two outputs. Second coordinates (outputs) may repeat.', HFN, 'definition restricts inputs');
          } },
          { id: 'e20b', level: 'EMG', make: function (r, sh) { var p = typeMC(r, '', sh.ps, 'pairs', 'error analysis ' + psT(sh.ps)); p.prompt = 'Classify the relation and give the correct verdict.'; p.solution += ' The student is wrong: repeated outputs are allowed.'; return p; } },
          { id: 'e20c', level: 'PRG', make: function (r, sh) {
            var O = sh.ps, key = [O[0], O[1], [-sh.a, sh.q], O[3]], good1 = [O[0], O[1], [-sh.b, sh.p], O[3]], good2 = [O[0], O[1], O[2], [sh.b, sh.p]];
            var keyOf = function (p) { return nT(p[0]) + '|' + nT(p[1]); }, OK = O.map(keyOf);
            var check = pairsCheck(function (ps, I) {
              var kept = ps.filter(function (p) { return OK.indexOf(keyOf(p)) >= 0; }).length;
              if (kept === 4 && ps.length === 4) return wrong('unchanged', 'That is the original set. Change one of its ordered pairs.');
              if (ps.length > 4 && kept === 4) return wrong('added', 'Change one of the four pairs instead of adding a new one.');
              if (ps.length !== 4 || kept < 3) return wrong('changed-many', 'Change exactly one pair and keep the other three as they are (your set should still have 4 pairs).');
              if (I.isFn) return wrong('still-fn', 'Your new set is still a function: every input still has one output. Change a pair so that one of the inputs ' + andT([-sh.a, -sh.b, sh.b, sh.a]) + ' appears twice with different outputs.');
              return ok();
            });
            return { prompt: 'Change <b>one</b> ordered pair so that the relation really is <b>not</b> a function. Type the new set of four pairs.', input: { type: 'math', keys: 'pairs', placeholder: 'e.g. {(1, 2), (3, 4), …}' }, check: check, key: setT(key), answer: t(setT(key)) + ' (answers vary)',
              good: [setT(good1), setT(good2)], bad: [setT(O), setT([O[0], O[1], [sh.a + 3, sh.q], O[3]])],
              solution: 'Answers vary. For example, replace ' + t(pT(O[2])) + ' with ' + t(pT([-sh.a, sh.q])) + ': ' + t(setT(key)) + '. Now the input ' + t(-sh.a) + ' has two outputs, ' + t(sh.p) + ' and ' + t(sh.q) + ', so the relation is not a function.',
              hints: ['To break the test, make one of the inputs appear twice — with a different output each time.'], text: 'change one pair to break the test' };
          } }] },
      { num: '21', section: 'Extra practice D — Reasoning about the definition', stem: 'Choose the answer that is correct and supported by a correct example.', parts: [
        { id: 'e21a', level: 'EMG', make: function (r) {
          var y = r.int(2, 9), xs = r.sample(range(1, 6), 3).sort(num), ex1 = xs.map(function (x) { return [x, y]; }), ex2 = [[y, xs[0]], [y, xs[1]]];
          return B.mc(r, 'Can a function have two <b>different inputs</b> that produce the <b>same output</b>?', [
            { html: 'Yes, for example ' + t(setT(ex1)) + ': each input has one output, and the outputs may be shared.', right: true },
            { html: 'No — in a function every output must come from just one input.', code: 'side-out', why: 'The definition says nothing about outputs being used only once. ' + t(setT(ex1)) + ' is a function.' },
            { html: 'Yes, for example ' + t(setT(ex2)) + '.', code: 'side-none', why: 'In that example one input, ' + t(y) + ', has two outputs — that is not a function, and it isn’t two inputs sharing an output.' },
            { html: 'No — the points would fail the vertical line test.', code: 'hlt-ok', why: 'Points with the same output lie on a <i>horizontal</i> line, not a vertical one. The vertical line test is still passed.' }],
            '<b>Yes.</b> In ' + t(setT(ex1)) + ' every input has exactly one output; the shared output ' + t(y) + ' makes it many-to-one, which is allowed.', HFN, 'two inputs, same output?');
        } },
        { id: 'e21b', level: 'BEG', make: function (r) {
          var x = r.int(1, 9), ys = r.sample(range(1, 9), 2), ex1 = [[x, ys[0]], [x, ys[1]]], ex2 = [[ys[0], x], [ys[1], x]];
          return B.mc(r, 'Can a function have two <b>different outputs</b> for the <b>same input</b>?', [
            { html: 'No — for example ' + t(setT(ex1)) + ' pairs the input ' + t(x) + ' with two outputs, which is exactly what the definition forbids, so it is not a function.', right: true },
            { html: 'Yes, for example ' + t(setT(ex1)) + '.', code: 'said-fn', why: 'In that example the input ' + t(x) + ' has two outputs, so it is <b>not</b> a function.' },
            { html: 'Yes, for example ' + t(setT(ex2)) + '.', code: 'side-out', why: 'In that example two different inputs share an output — that is allowed, but it isn’t one input with two outputs.' },
            { html: 'Yes — as long as the graph passes the vertical line test.', code: 'vlt-rev', why: 'One input with two outputs puts two points on the same vertical line, so the graph would fail the test.' }],
            '<b>No.</b> A function pairs each input with exactly one output. ' + t(setT(ex1)) + ' gives the input ' + t(x) + ' two outputs, so it is a relation but not a function.', HFN, 'one input, two outputs?');
        } },
        { id: 'e21c', level: 'PRG', make: function (r) {
          var c = r.int(-4, 5);
          return B.mc(r, 'Every point on the vertical line ' + t('x=' + c) + ' has the same ' + t('x') + '-coordinate. Why is the vertical line test exactly the definition of a function “in disguise”?', [
            { html: 'The line ' + t('x=' + c) + ' meets exactly the points with input ' + t(c) + '. If it crosses the graph twice, the input ' + t(c) + ' has two outputs; if every vertical line crosses at most once, no input has two outputs — the definition.', right: true },
            { html: 'A vertical line shows how steep the graph is, and a function can’t be too steep.', code: 'vlt-rev', why: 'Steepness isn’t the test: a very steep line is still a function as long as it isn’t vertical. Think about which points lie on ' + t('x=' + c) + '.' },
            { html: 'The vertical line test checks that every output comes from one input.', code: 'side-out', why: 'That would be a horizontal line test. Points on a vertical line share an <b>input</b>.' },
            { html: 'A vertical line through the graph finds its ' + t('y') + '-intercept, and a function has exactly one.', code: 'forms', why: 'Only the line ' + t('x=0') + ' finds the ' + t('y') + '-intercept. The test uses <b>every</b> vertical line.' }],
            'The line ' + t('x=' + c) + ' collects every point of the relation whose input is ' + t(c) + '. Crossing twice, at ' + t('(' + c + ',\\ y_{1})') + ' and ' + t('(' + c + ',\\ y_{2})') + ' with ' + t('y_{1}\\ne y_{2}') + ', means the input ' + t(c) + ' has two outputs. If every vertical line crosses at most once, no input has more than one output — exactly the definition.',
            HVLT, 'VLT is the definition');
        } },
        { id: 'e21d', level: 'PRG', make: function (r) {
          var m = r.int(2, 4), k = m * m;
          return B.mc(r, 'A student proposes a “horizontal line test” for functions. Which statement is correct?', [
            { html: 'It does not decide the function test: a horizontal line joins points that share an <b>output</b>, which is allowed (' + t('y=x^{2}') + ' meets ' + t('y=' + k) + ' at ' + t(pT([-m, k])) + ' and ' + t(pT([m, k])) + ', yet is a function). It decides one-to-one versus many-to-one instead.', right: true },
            { html: 'It works just as well, because ' + t('x') + ' and ' + t('y') + ' play the same role.', code: 'hlt-ok', why: 'They don’t play the same role: the definition restricts inputs (' + t('x') + ') only. ' + t('y=x^{2}') + ' fails a horizontal line test but is a function.' },
            { html: 'It decides the function test, but only for straight lines.', code: 'hlt-ok', why: 'Even for lines it would wrongly reject the horizontal line ' + t('y=' + k) + ', which is a function.' },
            { html: 'It does not decide the function test; it only finds the ' + t('x') + '-intercepts.', code: 'forms', why: 'Only the line ' + t('y=0') + ' finds the ' + t('x') + '-intercepts. What does a horizontal line crossing twice really show?' }],
            'A horizontal line ' + t('y=k') + ' collects points that share the output ' + t('k') + ', and sharing outputs is allowed. So it can’t decide whether a relation is a function. Two crossings show two inputs sharing an output: it decides <b>one-to-one versus many-to-one</b>.',
            HVLT, 'horizontal line test');
        } }] }
    ]
  });

  /* ---------------- part makers that need the helpers above ---------------- */
  function segPick(r, sh, steep) {
    var c = sh.c, y0 = sh.y0;
    if (steep) return graphPick(r, fnG({ x: [-6, 6], y: [-6, 6], segs: [{ pts: [[c - 1, -y0], [c + 1, y0]], start: 'closed', end: 'closed' }] }, c, [c, 0], 'steep segment', 'it is steep, but not vertical: it rises ' + 2 * y0 + ' over a run of ' + 2));
    var g = notG({ x: [-6, 6], y: [-6, 6], segs: [{ pts: [[c, -y0], [c, y0]], start: 'closed', end: 'closed' }] }, c, [[c, -y0], [c, y0]], 'vertical segment');
    g.why = 'This segment lies on the vertical line ' + t('x=' + c) + ': the input ' + t(c) + ' is paired with every ' + t('y') + ' from ' + t(-y0) + ' to ' + t(y0) + ', e.g. ' + t(pT([c, -y0])) + ' and ' + t(pT([c, y0])) + '. <b>Not a function.</b>';
    return graphPick(r, g);
  }
  /* "give one x-value with two different y-values" for an equation that is not a function */
  function twoYPart(eqTex, F, key, good, bad, xHint, sol) {
    var check = function (resp) {
      resp = resp || [];
      var v = [];
      for (var i = 0; i < 3; i++) {
        var s = String(resp[i] == null ? '' : resp[i]).trim();
        if (!s) return form('blank', 'Fill in all three boxes: one ' + t('x') + '-value and two ' + t('y') + '-values.');
        var a = ex.parse(s.replace(/^[xy]\s*=\s*/, '')); if (!a.ok) return form('unreadable', 'Type a number in each box (a square root like ' + t('\\sqrt{5}') + ' is fine).');
        v.push(ex.value(a.ast));
      }
      var x = v[0], y1 = v[1], y2 = v[2];
      if (same(y1, y2)) return wrong('same-y', 'Your two ' + t('y') + '-values are the same. Give two <b>different</b> ' + t('y') + '-values for the same ' + t('x') + '.');
      var h = xHint(x); if (h) return wrong('no-y', h);
      for (var j = 1; j < 3; j++) if (Math.abs(F(x, v[j])) > 1e-6) return wrong('not-on', 'Check ' + t(pT([x, v[j]])) + ' in ' + t(eqTex) + ': it doesn’t make the equation true. Substitute your ' + t('x') + ' and solve for ' + t('y') + '.');
      return ok();
    };
    return { prompt: t(eqTex) + ' does not define ' + t('y') + ' as a function of ' + t('x') + '. Show it: give one ' + t('x') + '-value together with two different ' + t('y') + '-values it produces.',
      input: { type: 'fields', fields: [{ label: t('x='), name: 'x', mode: 'math', keys: 'expr' }, { label: t('y='), name: 'first y', mode: 'math', keys: 'expr' }, { label: t('y='), name: 'second y', mode: 'math', keys: 'expr' }] },
      check: check, key: key, good: good, bad: bad, answer: t('x=' + key[0]) + ' gives ' + t('y=' + key[1]) + ' and ' + t('y=' + key[2]) + ' (answers vary)', solution: sol,
      hints: ['Pick an ' + t('x') + '-value, substitute it, and solve for ' + t('y') + '. Because ' + t('y') + ' is squared, there are two answers.', 'Choose an ' + t('x') + ' that makes the arithmetic come out to a perfect square.'], text: 'two y-values for ' + eqTex };
  }
})(window);
