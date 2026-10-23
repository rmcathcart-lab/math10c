/* Math 10C · Unit 8 · Lesson 5 — Mixture and Motion: More Applications of Linear Systems (RF9)
 * Assignment questions 1–9 (u8_L05.tex) and the Lesson 5 Extra Practice (u8_EP05.tex, Parts A–H).
 * Every part is a generator: the booklet's numbers are one possible version, and the other versions keep the same
 * kind of story with realistic numbers and sensible (whole-number or tidy-decimal) answers.
 * Systems are typed on the eq keypad (two boxes, either order, any equivalent equation); amounts and speeds go in
 * labelled number boxes. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, B = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form, F = HW.fmt, LN = HW.lines, ex = HW.ex;

  /* ---------------- numbers and formatting ---------------- */
  function rnd(v) { return Math.round(v * 1e6) / 1e6; }
  function near(a, b) { return Math.abs(a - b) < 1e-6 * Math.max(1, Math.abs(b)); }
  function isInt(v) { return Math.abs(v - Math.round(v)) < 1e-9; }
  function n(v) { v = rnd(v); return Math.abs(v) >= 1000 ? F(v) : String(v); }            // TeX number
  function s(v) { return String(rnd(v)); }                                                  // plain key
  function n2(v) { v = rnd(v); return isInt(v) ? n(v) : (Math.abs(v) >= 1000 ? F(Math.floor(v)) + '.' + v.toFixed(2).split('.')[1] : v.toFixed(2)); }   // money-style
  function money(v) { v = rnd(v); return '$' + (isInt(v) ? (Math.abs(v) >= 1000 ? F(Math.round(v), true) : String(Math.round(v))) : v.toFixed(2)); }
  function mT(v) { return '\\$' + n2(v); }
  function rt(p) { return isInt(p) ? String(p) : p.toFixed(2); }                            // a price as a coefficient
  function dp(p) { return p === 100 ? '1.00' : isInt(p) ? (p / 100).toFixed(2) : String(rnd(p / 100)); }   // 40 -> 0.40
  function pc(p) { return n(p) + '\\%'; }
  function hrs(v) { return n(v) + (near(v, 1) ? ' hour' : ' hours'); }
  function coef(c) { c = rnd(c); return c === 1 ? '' : c === -1 ? '-' : n(c); }
  function frT(p, q) { return LN.frT(p, q); }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var c = a % b; a = b; b = c; } return a; }
  function clock(min) { var h = Math.floor(min / 60) % 24, m = min % 60, ap = h >= 12 ? 'p.m.' : 'a.m.', hh = h % 12 === 0 ? 12 : h % 12; return hh + ':' + (m < 10 ? '0' : '') + m + '\u00a0' + ap; }
  function hm(min) { var h = Math.floor(min / 60), m = min % 60; return (h ? h + (h === 1 ? ' hour' : ' hours') : '') + (h && m ? ' ' : '') + (m ? m + ' minutes' : ''); }
  function frac60(min) { var g = gcd(min, 60); return 60 / g === 1 ? String(min / 60) : '\\frac{' + (min / g) + '}{' + (60 / g) + '}'; }
  function cap(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
  function numOf(x) {
    var str = String(x == null ? '' : x).replace(/\\%|%/g, '').trim(); if (!str) return null;
    var p = HW.parse.number(str); if (p.ok) return p.value;
    var a = ex.parse(str); if (!a.ok) return null; var v = ex.value(a.ast); return isFinite(v) ? v : null;
  }
  /* deterministic draw: keep drawing until test passes (fallback = the booklet's version) */
  function draw(r, gen, test, fallback) { for (var i = 0; i < 600; i++) { var c = gen(r); if (c && test(c)) return c; } return fallback; }

  /* ---------------- part builders ---------------- */
  /* two (or three) labelled number boxes. o: { prompt, names, units, vals, conds: [{ f(u, v, w), v, code, hint(got, u, v, w) }],
     diag(u, v, w) -> { code, hint, form? }, swapHint, pct (decimals for percents = nudge), math (fraction keypad), exact, sol, hints, text } */
  function amtCheck(o) {
    var A = o.vals, N = A.length;
    return function (resp) {
      resp = resp || []; var raw = A.map(function (x, i) { return String(resp[i] == null ? '' : resp[i]).trim(); });
      if (raw.every(function (x) { return !x; })) return form('empty', 'Fill in the boxes first.');
      if (raw.some(function (x) { return !x; })) return form('incomplete', 'Fill in <b>every</b> box.');
      var u = raw.map(numOf);
      if (u.some(function (x) { return x == null; })) return form('notnumber', 'Enter a single number in each box' + (o.math ? ' (a fraction is fine).' : '.'));
      var allRight = u.every(function (x, i) { return near(x, A[i]); });
      if (allRight) {
        if (o.exact) for (var i = 0; i < N; i++) { var pa = ex.parse(raw[i]); if (pa.ok) { var pf = ex.plainFraction(pa.ast); if (pf && gcd(pf[0], pf[1]) > 1) return form('lowest', 'Right values — now write each fraction in lowest terms.'); } }
        return ok();
      }
      if (o.exact && raw.some(function (x) { return /\.\d/.test(x); }) && u.every(function (x, i) { return Math.abs(x - A[i]) < 0.006; })) return form('exact', 'Close — give the <b>exact</b> values as fractions, not rounded decimals.');
      if (o.pct && u.every(function (x, i) { return near(x * 100, A[i]); })) return form('pct-decimal', 'Right values — now write them as percents (for example ' + t('0.2=20\\%') + ').');
      if (N === 2 && !near(A[0], A[1]) && near(u[0], A[1]) && near(u[1], A[0])) return wrong('amt-swap', o.swapHint || 'Right numbers, wrong boxes: check which quantity each box asks for.');
      var h = o.diag ? o.diag(u[0], u[1], u[2]) : null;
      if (h) return h.form ? form(h.code, h.hint) : wrong(h.code, h.hint);
      var rightIdx = u.map(function (x, i) { return near(x, A[i]) ? i : -1; }).filter(function (i) { return i >= 0; });
      if (N === 2 && rightIdx.length === 1) return wrong('amt-one', 'Your value for <b>' + o.names[rightIdx[0]] + '</b> is right. ' + (o.oneHint || 'Substitute it into one of the equations and find the other value again.'));
      var cs = o.conds || [];
      for (var j = 0; j < cs.length; j++) { var got = cs[j].f(u[0], u[1], u[2]); if (!near(got, cs[j].v)) return wrong(cs[j].code || 'amt-cond', cs[j].hint(got, u[0], u[1], u[2])); }
      return wrong('amt', null);
    };
  }
  function amtP(o) {
    var units = o.units || o.vals.map(function () { return ''; });
    var fields = o.names.map(function (nm, i) { var f = { label: nm, after: units[i] }; if (o.math) { f.mode = 'math'; f.keys = 'fraction'; f.placeholder = ' '; } return f; });
    return { prompt: o.prompt, input: { type: 'fields', fields: fields }, check: amtCheck(o), key: o.key || o.vals.map(s),
      answer: o.names.map(function (nm, i) { return nm + ': ' + t(o.keyTex ? o.keyTex[i] : n(o.vals[i])) + (units[i] ? ' ' + units[i] : ''); }).join('<br>'),
      solution: o.sol, hints: o.hints || [], text: o.text, good: o.good, bad: o.bad };
  }
  function lineOf(x, vars) { if (Array.isArray(x)) return x; var r = LN.read(x, vars); if (!r.ok) throw new Error('bad line ' + x + ' ' + r.why); return [r.a, r.b, r.c]; }
  /* write a system. o: { prompt, vars, eqs: [{ tex, show, name, tip }], wrongs: [{ is: tex, code, hint }], tip, good, sol, hints, text } */
  function sysP(o) {
    var vars = o.vars, T = o.eqs.map(function (e) { return lineOf(e.tex, vars); });
    if (LN.same(T[0], T[1])) throw new Error('system equations coincide');
    var W = (o.wrongs || []).map(function (w) { var L = lineOf(w.is, vars); return T.some(function (x) { return LN.same(L, x); }) ? null : { L: L, code: w.code, hint: w.hint, is: w.is }; }).filter(Boolean);
    var labels = o.labels || ['Equation 1', 'Equation 2'];
    return { prompt: o.prompt, input: { type: 'fields', fields: labels.map(function (l) { return { label: l, mode: 'math', keys: 'eq', vars: vars, placeholder: ' ' }; }) },
      check: function (resp) {
        resp = resp || []; var a = String(resp[0] || '').trim(), b = String(resp[1] || '').trim();
        if (!a && !b) return form('empty', 'Write both equations.');
        if (!a || !b) return form('sys-one', 'Write <b>two</b> equations — one in each box.');
        var rr = [LN.read(a, vars), LN.read(b, vars)], bad = rr.filter(function (x) { return !x.ok; })[0];
        if (bad) return form('line-' + bad.why, bad.why === 'vars' ? 'Use the letters ' + t(vars[0]) + ' and ' + t(vars[1]) + ' from the question.' : bad.why === 'no-eq' ? 'Each box needs an equation with an equals sign.' : bad.why === 'not-linear' ? 'Each equation should be linear: no variable multiplied by another, and no powers.' : 'One of your equations can’t be read — check the brackets and signs.');
        var S = rr.map(function (x) { return [x.a, x.b, x.c]; });
        var m = S.map(function (L) { return LN.same(L, T[0]) ? 0 : LN.same(L, T[1]) ? 1 : -1; });
        if (m[0] >= 0 && m[1] >= 0 && m[0] !== m[1]) return ok();
        if (LN.same(S[0], S[1])) return wrong('sys-same', 'Your two equations say the same thing. The question gives two <b>different</b> facts — write one equation for each.');
        for (var i = 0; i < 2; i++) if (m[i] < 0) for (var j = 0; j < W.length; j++) if (LN.same(S[i], W[j].L)) return wrong(W[j].code, W[j].hint);
        var g = m[0] >= 0 ? 0 : m[1] >= 0 ? 1 : -1;
        if (g >= 0) { var other = o.eqs[1 - m[g]]; return wrong('sys-eq', 'Your ' + o.eqs[m[g]].name + ' is right. Check the ' + other.name + (other.tip ? ': ' + other.tip : '.')); }
        return wrong('sys-eq', o.tip || null);
      },
      key: o.eqs.map(function (e) { return e.tex; }), answer: o.eqs.map(function (e) { return t(e.show || e.tex); }).join('<br>'),
      solution: o.sol, hints: o.hints || [], text: o.text,
      good: [[o.eqs[1].tex, o.eqs[0].tex]].concat(o.good || []),
      bad: W.map(function (w) { return [o.eqs[0].tex, w.is]; }).concat(W.map(function (w) { return [w.is, o.eqs[1].tex]; })) };
  }
  /* the classic slips in a percent content equation  p1·X + p2·Y = (c% of M)  */
  function pctWrongs(p1, p2, c, M, X, Y, what, unit) {
    var C = rnd(c * M / 100), L = dp(p1) + X + '+' + dp(p2) + Y + '=', Lw = p1 + X + '+' + p2 + Y + '=', right = t(dp(c) + '(' + n(M) + ')=' + n(C));
    return [{ is: L + dp(c), code: 'mix-content-rhs', hint: 'The right side must be the amount of <b>' + what + '</b> in the mixture, not the percent: ' + right + ' ' + unit + '.' },
      { is: L + c, code: 'mix-content-rhs', hint: 'The right side must be the amount of <b>' + what + '</b>: ' + t(pc(c)) + ' of ' + t(n(M)) + ' ' + unit + ' is ' + t(n(C)) + ', not ' + t(c) + '.' },
      { is: Lw + c, code: 'mix-content-rhs', hint: 'The right side must be the amount of <b>' + what + '</b> (' + right + '), and the percents become decimals.' },
      { is: L + M, code: 'mix-content-rhs', hint: 'The total ' + unit + ' of mixture belongs in the other equation. This one counts ' + what + ': ' + right + '.' },
      { is: L + (c * M), code: 'mix-pct-scale', hint: 'Use the same scale on both sides: with decimals on the left, the right side is ' + right + '.' },
      { is: Lw + C, code: 'mix-pct-scale', hint: 'Use the same scale on both sides: with decimals, ' + t(dp(p1) + X + '+' + dp(p2) + Y + '=' + n(C)) + ' (or ' + t(Lw + n(c * M)) + ' with whole-number percents).' },
      { is: dp(p2) + X + '+' + dp(p1) + Y + '=' + C, code: 'mix-rates-swapped', hint: 'Check which rate goes with which variable: ' + t(X) + ' goes with ' + t(pc(p1)) + '.' },
      { is: X + '+' + Y + '=' + C, code: 'mix-value-rhs', hint: 'The amount equation adds the two amounts: they make ' + t(n(M)) + ' ' + unit + ' of mixture.' }];
  }
  function mcP(r, prompt, opts, sol, hints, text, keepOrder) { return B.mc(r, prompt, opts, sol, hints || [], text, keepOrder); }
  function ynP(r, prompt, yes, whyYes, whyNo, sol, hints, text) {
    var p = B.mc(r, prompt, [{ html: '<b>Yes</b>', right: yes, why: yes ? null : whyNo, code: 'said-yes' }, { html: '<b>No</b>', right: !yes, why: yes ? whyYes : null, code: 'said-no' }], sol, hints || [], text, true);
    p.tries = 1; p.input.columns = 2; return p;
  }
  /* a single number; opt.pct: a decimal for a percent is a nudge; opt.hrs2: hours, exact or to the nearest hundredth */
  function numP(prompt, ans, diag, sol, hints, text, inp, opt) {
    opt = opt || {};
    var base = K.number(ans, diag);
    var check = function (resp) {
      var v = numOf(resp);
      if (v != null && near(v, ans)) return ok();   // a fraction such as 9/2 is fine too
      if (v != null && !near(v, ans) && opt.pct && near(v * 100, ans)) return form('pct-decimal', 'Right value — now write it as a percent (for example ' + t('0.75=75\\%') + ').');
      return base(String(resp == null ? '' : resp).replace(/\\%|%/g, ''));
    };
    return { prompt: prompt, input: Object.assign({ type: 'number' }, inp || {}), check: check, key: s(ans), answer: (inp && inp.before ? inp.before : '') + t(n(ans)) + (inp && inp.after ? ' ' + inp.after : ''), solution: sol, hints: hints || [], text: text };
  }
  function hoursP(prompt, x, diag, sol, hints, text, unit) {
    var exact = isInt(x * 100);
    if (exact) return numP(prompt, rnd(x), diag, sol, hints, text, { after: unit || 'h' });
    var p = B.approx(prompt, x, 2, { after: unit || 'h', diag: diag }, sol, hints, text);
    p.answer = t(K.roundTo(x, 2).toFixed(2)) + ' ' + (unit || 'h'); return p;
  }

  /* ---------------- worked solutions ---------------- */
  /* amount + content by substitution: o = { X, Y, M, r1, r2, r1t, r2t, C, A, Bv, letTxt, amtName, conName, cf (format of content), end } */
  function mixSol(o) {
    var X = o.X, Y = o.Y, cf = o.cf || n, d = rnd(o.r1 - o.r2), k = rnd(o.r2 * o.M), rhs = rnd(o.C - k);
    var r2t = o.r2t === '1' || o.r2t === '1.00' ? '' : o.r2t, r1t = o.r1t === '1' || o.r1t === '1.00' ? '' : o.r1t;
    var out = o.letTxt + '<br>' + o.amtName + ': ' + t(X + '+' + Y + '=' + n(o.M)) + ' &nbsp; ' + o.conName + ': ' + t(r1t + X + '+' + r2t + Y + '=' + cf(o.C));
    out += '<br>Substitute ' + t(Y + '=' + n(o.M) + '-' + X) + ': ' + t(r1t + X + '+' + r2t + '(' + n(o.M) + '-' + X + ')=' + cf(o.C));
    out += '<br>' + t(r1t + X + '+' + cf(k) + '-' + r2t + X + '=' + cf(o.C)) + ' &nbsp; ' + t('\\Rightarrow ' + coef(d) + X + '=' + cf(rhs) + '\\Rightarrow ' + X + '=' + n(o.A));
    out += '<br>' + t(Y + '=' + n(o.M) + '-' + (o.A < 0 ? '(' + n(o.A) + ')' : n(o.A)) + '=' + n(o.Bv));
    out += '<br>Check: ' + t(n(o.A) + '+' + n(o.Bv) + '=' + n(o.M)) + ' ✓ &nbsp; ' + t((r1t || '1') + '(' + n(o.A) + ')+' + (r2t || '1') + '(' + n(o.Bv) + ')=' + cf(rnd(o.r1 * o.A)) + '+' + cf(rnd(o.r2 * o.Bv)) + '=' + cf(o.C)) + ' ✓';
    return out + (o.end ? '<br><b>' + o.end + '</b>' : '');
  }
  /* with / against: S1 = speed with (b + c), S2 = speed against (b − c) */
  function bcSol(o) {
    var bv = rnd((o.S1 + o.S2) / 2), cv = rnd((o.S1 - o.S2) / 2);
    var out = (o.pre ? o.pre + '<br>' : '') + o.l1 + '<br>' + o.l2;
    out += '<br>Add the equations: ' + t('2' + o.b + '=' + n(o.S1 + o.S2) + '\\Rightarrow ' + o.b + '=' + n(bv)) + ', then ' + t(o.c + '=' + n(o.S1) + '-' + n(bv) + '=' + n(cv)) + '.';
    out += '<br>Check: ' + t(n(bv) + '+' + n(cv) + '=' + n(o.S1)) + ' ✓ &nbsp; ' + t(n(bv) + '-' + n(cv) + '=' + n(o.S2)) + ' ✓';
    return out + (o.end ? '<br><b>' + o.end + '</b>' : '');
  }
  function amountConds(M, unit, what) { return { f: function (u, v) { return u + v; }, v: M, code: 'amt-total', hint: function (got) { return 'Check the amounts: yours add to ' + t(n(got)) + ' ' + unit + ', but ' + what + ' is ' + t(n(M)) + ' ' + unit + '. The two amounts must add to the total.'; } }; }
  function contentConds(r1, r2, r1t, r2t, C, unitTxt, what) { return { f: function (u, v) { return r1 * u + r2 * v; }, v: C, code: 'amt-value', hint: function (got, u, v) { return 'Your amounts add to the right total, but check the ' + what + ': ' + t(r1t + '(' + n(u) + ')+' + r2t + '(' + n(v) + ')=' + n2(got)) + unitTxt + ', not ' + t(n2(C)) + unitTxt + '.'; } }; }

  /* ---------------- generators (case lists are built on first use, so the site loads fast) ---------------- */
  function lazy(fn) { var v = null; return function () { return v || (v = fn()); }; }
  var ITEMS1 = ['granola bars', 'trail-mix bars', 'protein bars'];
  function q1Shared(r) {
    var p2 = r.pick([2.5, 3, 3.5, 4, 4.5]), p1 = p2 + r.pick([1, 1.5, 2, 2.5, 3]), x, y;
    do { x = r.int(20, 75); y = r.int(20, 75); } while (Math.abs(x - y) < 3);
    return { p1: p1, p2: p2, x: x, y: y, M: x + y, V: rnd(p1 * x + p2 * y), item: r.pick(ITEMS1) };
  }
  var Q2 = lazy(function () {
  var Q2 = []; [2, 3].forEach(function (k) { for (var A = 200; A <= 800; A += 100) for (var Bm = 200; Bm <= 800; Bm += 100) for (var y = 4; y <= 15; y++) {
    if (A === Bm || k * y > 45) continue; var pct = (k * A + Bm) * y / (A + Bm); if (!isInt(pct) || pct === y || pct === k * y) continue;
    Q2.push({ k: k, A: A, Bm: Bm, y: y, x: k * y, pct: pct, nuts: rnd(pct * (A + Bm) / 100) }); } });
    return Q2;
  });
  var Q3 = lazy(function () {
  var Q3 = []; [20, 25, 30, 35, 40, 45, 50].forEach(function (a) { for (var b = a + 20; b <= 95; b += 5) for (var c = a + 4; c <= b - 4; c++) [400, 500, 600, 750, 800, 900].forEach(function (V) {
    if (2 * c === a + b) return; var x = V * (b - c) / (b - a), y = V * (c - a) / (b - a); if (!isInt(x) || !isInt(y)) return;
    var vmax = 1000 * (b - a) / Math.max(b - c, c - a), vother = 1000 * (b - a) / Math.min(b - c, c - a);
    Q3.push({ a: a, b: b, c: c, V: V, x: x, y: y, vmaxRaw: vmax, vmax: Math.floor(vmax + 1e-9), vother: Math.floor(vother + 1e-9), lowRunsOut: b - c > c - a }); }); });
    return Q3;
  });
  var Q4 = lazy(function () {
  var Q4 = []; [6, 9, 12].forEach(function (L) { [15, 18, 21].forEach(function (H) { var Lp = L / 24 * 100, Hp = H / 24 * 100; for (var P = Math.ceil(Lp + 5); P <= Hp - 5; P++) [60, 80, 90, 100, 120, 150, 180, 200, 240].forEach(function (M) {
    var x = M * (Hp - P) / (Hp - Lp), y = M - x; if (!isInt(x) || x <= 0 || y <= 0) return; Q4.push({ L: L, H: H, Lp: Lp, Hp: Hp, P: P, M: M, x: x, y: y }); }); }); });
    return Q4;
  });
  var Q5 = lazy(function () {
  var Q5 = []; [2, 2.5, 3, 3.5, 4].forEach(function (tt) { for (var v = 60; v <= 100; v++) for (var k = 15; k <= 45; k++) { if (v + k > 150 || !isInt(v * tt) || !isInt((v + k) * tt)) continue; Q5.push({ t: tt, v: v, k: k, D2: v * tt, D1: (v + k) * tt }); } });
    return Q5;
  });
  /* straight-line (flying) distances, km, rounded to 10; generated distances stay within ±10% of these */
  var CITY = [['Lethbridge', 'Edmonton', 430], ['Calgary', 'Saskatoon', 520], ['Edmonton', 'Saskatoon', 480], ['Calgary', 'Regina', 670], ['Grande Prairie', 'Edmonton', 390], ['Fort McMurray', 'Calgary', 660], ['Edmonton', 'Winnipeg', 1190], ['Calgary', 'Vancouver', 670]];
  var TIMES = [1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 3, 3.5, 4];
  var Q6 = lazy(function () {
  var Q6 = []; CITY.forEach(function (cp) { for (var D = Math.round(cp[2] * 0.9 / 10) * 10; D <= cp[2] * 1.1; D += 10) TIMES.forEach(function (t1) { TIMES.forEach(function (t2) {
    if (t2 >= t1 || t1 / t2 > 1.5) return; var gh = D / t1, gt = D / t2; if (!isInt(gh) || !isInt(gt)) return; var w = (gt - gh) / 2, p = (gt + gh) / 2;
    if (!isInt(w) || w % 5 || w < 15 || w > 75 || p < 180 || p > 500 || !isInt(p)) return; Q6.push({ A: cp[0], Bc: cp[1], D: D, t1: t1, t2: t2, gh: gh, gt: gt, w: w, p: p }); }); }); });
    return Q6;
  });
  var Q7 = lazy(function () {
  var Q7 = []; [10, 12, 15, 16, 18, 20].forEach(function (vr) { [3, 4, 5, 6].forEach(function (vw) { if (vw * 2.5 > vr) return; [0.5, 1, 1.5, 2, 2.5, 3].forEach(function (k) { for (var d = 2; d <= 16; d++) {
    var tr = d * 60 / vr, tw = k * 60 / vw; if (!isInt(tr) || !isInt(tw)) continue; var T = tr + tw; if (T < 25 || T > 90 || T % 5 || !isInt(d + k)) continue; Q7.push({ vr: vr, vw: vw, k: k, d: d, D: d + k, T: T, tr: tr, tw: tw }); } }); }); });
    return Q7;
  });
  var Q8 = lazy(function () {
  var Q8 = []; for (var p1 = 6; p1 <= 12; p1++) for (var dd = 2; dd <= 6; dd++) [40, 50, 60, 80, 100, 120].forEach(function (M) { for (var x = 5; x <= M - 5; x++) {
    var y = M - x, pm = (p1 * x + (p1 + dd) * y) / M; if (!isInt(pm * 100) || isInt(pm) || x === y) continue; Q8.push({ p1: p1, p2: p1 + dd, M: M, x: x, y: y, pm: rnd(pm) }); } });
    return Q8;
  });

  /* extra-practice case lists */
  function mixList(los, his, Ms, opt) {   // two-ingredient percent (or price) mixtures with whole-number amounts
    opt = opt || {}; var out = [];
    los.forEach(function (lo) { his.forEach(function (hi) { if (hi - lo < (opt.gap || 15)) return; for (var c = lo + 3; c <= hi - 3; c++) Ms.forEach(function (M) {
      if (2 * c === lo + hi && !opt.mid) return; var x = M * (hi - c) / (hi - lo), y = M - x; if (!isInt(x) || x <= 0 || y <= 0) return; if (opt.test && !opt.test(lo, hi, c, M, x, y)) return;
      out.push({ lo: lo, hi: hi, c: c, M: M, x: x, y: y }); }); }); });
    return out;
  }
  var E1 = lazy(function () {
  var E1 = mixList([25, 30, 35, 40], [70, 75, 80, 85, 90], [120, 150, 160, 180, 200, 240]);
    return E1;
  });
  var E2 = lazy(function () {
  var E2 = mixList([5, 6, 8, 10, 12], [18, 20, 22, 24, 26, 28, 30], [200, 240, 300, 360, 400, 500], { gap: 8 });
    return E2;
  });
  var E3 = lazy(function () {
  var E3 = mixList([5, 6, 7, 8, 9, 10], [18, 20, 22, 24, 26, 28, 30], [30, 36, 40, 45, 50, 54, 60]);
    return E3;
  });
  var E4 = lazy(function () {
  var E4 = []; [20, 25, 30, 35, 40].forEach(function (c1) { for (var tt = c1 + 10; tt <= 70; tt += 5) for (var V = 10; V <= 40; V++) { var x = V * (100 - tt) / (100 - c1); if (!isInt(x * 2) || x <= 0 || x >= V || 2 * tt === c1 + 100) continue; E4.push({ c1: c1, t: tt, V: V, x: rnd(x), y: rnd(V - x) }); } });
    return E4;
  });
  var E5 = lazy(function () {
  var E5 = []; [20, 24, 25, 30, 32, 40].forEach(function (st) { for (var tt = 5; tt < st - 3; tt++) [20, 30, 40, 50, 60, 80].forEach(function (V) { var x = tt * V / st; if (!isInt(x) || x >= V) return; E5.push({ s: st, t: tt, V: V, x: x, w: V - x }); }); });
    return E5;
  });
  var E6 = lazy(function () {
  var E6 = []; [10, 15, 20, 25].forEach(function (lo) { for (var hi = lo + 15; hi <= lo + 35; hi += 5) [40, 50, 60, 80, 100].forEach(function (V) {
    for (var c = lo + 3; c <= hi - 3; c++) { if (2 * c === lo + hi) continue; var x = V * (hi - c) / (hi - lo); if (!isInt(x)) continue;
      for (var c2 = hi + 5; c2 <= hi + 25; c2 += 5) { var x2 = V * (hi - c2) / (hi - lo); if (!isInt(x2)) continue; E6.push({ lo: lo, hi: hi, V: V, c: c, x: x, y: V - x, c2: c2, x2: x2, y2: V - x2 }); } } }); });
    return E6;
  });
  var E7 = lazy(function () {
  var E7 = []; [8, 10, 12, 15].forEach(function (lo) { [25, 30, 35, 40].forEach(function (hi) { for (var a = lo + 3; a <= hi - 3; a++) { var r1 = (a - lo) / (hi - a); if (!(isInt(r1) && r1 >= 2 && r1 <= 4) && !(isInt(1 / r1) && 1 / r1 >= 2 && 1 / r1 <= 4)) continue;
    [300, 450, 600, 900, 1200].forEach(function (V) { var x = V * (hi - a) / (hi - lo); if (!isInt(x)) return; E7.push({ lo: lo, hi: hi, a: a, V: V, x: x, y: V - x }); }); } }); });
    return E7;
  });
  function streamList(bs, cs, ts, Dmin, Dmax) { var out = []; bs.forEach(function (b) { cs.forEach(function (c) { if (b <= 2.5 * c) return; ts.forEach(function (td) { ts.forEach(function (tu) {
    if (tu <= td) return; var D = (b + c) * td; if (!isInt(D) || !near(D, (b - c) * tu) || D < Dmin || D > Dmax) return; out.push({ b: b, c: c, td: td, tu: tu, D: D, S1: b + c, S2: b - c }); }); }); }); }); return out; }
  var range = function (a, b, st) { var o = []; for (var i = a; i <= b; i += (st || 1)) o.push(i); return o; };
  var E8 = lazy(function () {
  var E8 = streamList(range(12, 40), range(2, 10), [1.5, 2, 2.5, 3, 4, 5, 6], 40, 200);
    return E8;
  });
  var E14 = lazy(function () {
  var E14 = streamList(range(15, 45), range(3, 12), [1, 1.5, 2, 2.5, 3, 4], 30, 150);
    return E14;
  });
  var E9 = lazy(function () {
  var E9 = []; range(300, 700, 10).forEach(function (p) { range(20, 100, 10).forEach(function (w) { [2, 2.5, 3, 3.5, 4].forEach(function (tw) { [2.5, 3, 3.5, 4, 4.5, 5].forEach(function (ta) {
    if (ta <= tw) return; var D = (p + w) * tw; if (!near(D, (p - w) * ta) || D < 800 || D > 2400 || D % 50) return; E9.push({ p: p, w: w, tw: tw, ta: ta, D: D, S1: p + w, S2: p - w }); }); }); }); });
    return E9;
  });
  var E10 = lazy(function () {
  var E10 = []; [1200, 1500, 1800, 2000, 2400].forEach(function (D) { range(8, 20).forEach(function (bk) { range(1, 6).forEach(function (ck) { if (ck * 2.5 > bk) return;
    var td = 0.06 * D / (bk + ck), tu = 0.06 * D / (bk - ck); if (!isInt(td) || !isInt(tu) || td < 3 || tu > 20) return; E10.push({ D: D, bk: bk, ck: ck, td: td, tu: tu }); }); }); });
    return E10;
  });
  var E10B = lazy(function () {
  var E10B = mixList([5, 6, 8, 10, 12], [30, 35, 40], [600, 750, 800, 900, 1000], { test: function (lo, hi, c, M, x) { return x % 50 === 0; } });
    return E10B;
  });
  var E11 = lazy(function () {
  var E11 = []; [30, 40, 50].forEach(function (sg) { [80, 90, 100, 110].forEach(function (sp) { range(3, 15).forEach(function (g10) { range(15, 40).forEach(function (p10) {
    var g = g10 / 10, p = p10 / 10, D = sg * g + sp * p; if (!isInt(D) || D % 10 || !isInt((g + p) * 2)) return; E11.push({ sg: sg, sp: sp, g: g, p: p, D: D, T: rnd(g + p) }); }); }); }); });
    return E11;
  });
  var E12 = lazy(function () {
  var E12 = []; [12, 15, 16, 18, 20, 24].forEach(function (v1) { [45, 48, 50, 54, 60, 72].forEach(function (v2) { if (v2 < 2 * v1) return; [0.5, 1, 1.5, 2].forEach(function (h) {
    var tt = v2 * h / (v2 - v1), d = v1 * tt; if (!isInt(tt * 100) || !isInt(tt * 60) || !isInt(d * 10) || tt > 3.5) return; E12.push({ v1: v1, v2: v2, h: h, t: rnd(tt), d: rnd(d) }); }); }); });
    return E12;
  });
  var E13 = lazy(function () {
  var E13 = mixList([10, 15, 20], [35, 40, 45, 50], [100, 150, 200, 250, 300, 400]);
    return E13;
  });
  var E15 = lazy(function () {
  var E15 = [];
  for (var lo15 = 12; lo15 <= 20; lo15 += 2) for (var hi15 = 24; hi15 <= 36; hi15 += 2) [40, 50, 60, 80].forEach(function (M) { for (var x = 5; x <= M - 5; x++) { var y = M - x, pm = (hi15 * x + lo15 * y) / M; if (!isInt(pm * 100) || isInt(pm) || x === y) continue; E15.push({ hi: hi15, lo: lo15, M: M, x: x, y: y, pm: rnd(pm), V: hi15 * x + lo15 * y }); } });
    return E15;
  });
  var E16 = lazy(function () {
  var E16 = []; range(18, 26).forEach(function (pa) { range(5, 9).forEach(function (pr) { range(3, 6).forEach(function (pz) { if (pz >= pr) return; range(8, 30).forEach(function (a) { range(5, 20).forEach(function (r) {
    var M = a + 2 * r, V = pa * a + (pr + pz) * r, pm = V / M; if (M % 5 || M > 60 || !isInt(pm * 100) || isInt(pm)) return; E16.push({ pa: pa, pr: pr, pz: pz, a: a, r: r, M: M, V: V, pm: rnd(pm) }); }); }); }); }); });
    return E16;
  });
  var E17 = lazy(function () {
  var E17 = []; range(15, 30).forEach(function (b) { range(2, 6).forEach(function (c) { [2, 3, 4, 5, 6].forEach(function (k) { [2, 2.5, 3].forEach(function (td) { [2, 2.5, 3].forEach(function (tu) {
    var D1 = (b + c) * td, D2 = (b - k - c) * tu, T2 = D2 / (b - k + c); if (!isInt(D1) || !isInt(D2) || D2 < 20 || !isInt(T2 * 10)) return; E17.push({ b: b, c: c, k: k, td: td, tu: tu, D1: D1, D2: D2, T2: rnd(T2) }); }); }); }); }); });
    return E17;
  });
  var E18 = lazy(function () {
  var E18 = []; [30, 40, 50, 60].forEach(function (j) { [10, 12, 15, 18, 20, 24, 30].forEach(function (V) { for (var tt = 10; tt < j - 5; tt += 5) { var w = V * (j / tt - 1); if (!isInt(w) || w < 2) continue; E18.push({ j: j, V: V, t: tt, w: w, juice: rnd(j * V / 100), fin: rnd(V * j / tt) }); } }); });
    return E18;
  });
  var E19 = lazy(function () {
  var E19 = []; [20, 24, 30, 36, 40, 45, 50].forEach(function (td) { [30, 36, 40, 45, 50, 60, 75, 80, 90].forEach(function (tu) { if (tu <= td) return; var k = (tu + td) / (tu - td); if (!isInt(k) || k < 2 || k > 9) return; E19.push({ td: td, tu: tu, k: k }); }); });
    return E19;
  });
  var E20 = lazy(function () {
  var E20 = mixList([12, 14, 15, 16, 18], [22, 24, 25, 27, 28, 30], [24, 30, 36, 40, 45, 48, 60], { gap: 6 });
    return E20;
  });

  /* ---------------- shared hints ---------------- */
  var H_MIX = ['Make the organizer: <b>Amount × Rate = Value</b> for each ingredient. The Amount column adds to the total amount; the Value column adds to the total value. Rates are never added.', 'Solve by substitution: from the amount equation, write one variable in terms of the other.'];
  var H_PCT = ['Write each percent as a decimal (40% = 0.40). The content equation adds up <b>amounts of pure substance</b>: its right side is the target percent <b>of the total amount</b>.', 'Then substitute from the amount equation and solve.'];
  var H_STREAM = ['Ground speed = distance ÷ time. With the current (or wind) the speed is ' + t('b+c') + '; against it, ' + t('b-c') + '.', 'Adding the two equations eliminates ' + t('c') + '.'];

  HW.addCodes({
    'amt-swap': 'Answers in each other’s boxes', 'amt-one': 'One of the two values wrong', 'amt-total': 'Amounts don’t add to the total', 'amt-value': 'Amounts right total, wrong value/content', 'amt-cond': 'Answer fails a condition of the problem', amt: 'Wrong values',
    'pct-decimal': 'Percent written as a decimal', 'mix-value-rhs': 'Value equation equal to the total amount', 'mix-rates-swapped': 'Rates paired with the wrong variables', 'mix-content-rhs': 'Content equation equal to the percent, not the content',
    'mix-pct-scale': 'Decimals and whole-number percents mixed', 'mix-pct-whole': 'Percent not changed to a decimal', 'mix-ratio-backwards': 'Ratio relationship written backwards', 'mix-masses-swapped': 'Masses paired with the wrong variables', 'mix-rates-added': 'Added the rates',
    'mix-max-sum': 'Max batch: used all of both bottles', 'mix-max-other': 'Max batch: limited by the wrong bottle', 'mix-pure-zero': 'Pure concentrate given rate 0', 'mix-water-one': 'Water given rate 1', 'mix-water-dropped': 'Water left out of the amount equation', 'mix-three-two': 'Third ingredient not counted', 'mix-other': 'Gave the other ingredient’s amount',
    'carat-pct': 'Carats used as a percent', 'carat-flip': 'Carat fraction upside down',
    'mot-other': 'Gave the other speed/distance/time', 'mot-legs-swapped': 'With/against paired with the wrong time', 'mot-same-sign': 'Same ground speed on both legs', 'mot-dst': 'Distance–speed–time relation misused', 'mot-ground': 'Gave a ground speed, not the wind/current', 'mot-not-halved': 'Wind/current not halved',
    'mot-minutes': 'Minutes not changed to hours', 'mot-time-decimal': 'Minutes written as a decimal of an hour', 'mot-speeds-swapped': 'Speeds paired with the wrong legs', 'mot-stops': 'Stops not removed from the driving time', 'mot-hours': 'Answer in hours, not minutes', 'mot-stop-added': 'Rest time included in driving time',
    'mot-head-start': 'Later start not taken into account', 'mot-delay-sign': 'Later start added instead of subtracted', 'mot-offset': 'Speed difference between the boats missed', 'mot-hm': 'Decimal hours read as minutes', 'mot-clock': 'Elapsed time not added to the start time', 'mot-avg-time': 'Averaged the two times', 'mot-convert': 'Unit conversion the wrong way', 'mot-units': 'Units not converted', 'round-down': 'Rounded up instead of down', 'eq-form': 'Equation not in the form asked'
  });

  /* ---------------- question makers ---------------- */
  function q1Stem(sh) { return cap(sh.item) + ' costing ' + money(sh.p1) + ' per kg are mixed with ' + sh.item + ' costing ' + money(sh.p2) + ' per kg to produce ' + t(n(sh.M)) + ' kg of mixture worth ' + money(sh.V) + '.'; }
  function q1Sol(sh) { return mixSol({ X: 'x', Y: 'y', M: sh.M, r1: sh.p1, r2: sh.p2, r1t: rt(sh.p1), r2t: rt(sh.p2), C: sh.V, A: sh.x, Bv: sh.y, cf: n2, letTxt: 'Let ' + t('x') + ' = kg of ' + money(sh.p1) + '/kg ' + sh.item + ', ' + t('y') + ' = kg of ' + money(sh.p2) + '/kg ' + sh.item + '.', amtName: 'Mass', conName: 'Value', end: n(sh.x) + ' kg of the ' + money(sh.p1) + '/kg ' + sh.item + ' and ' + n(sh.y) + ' kg of the ' + money(sh.p2) + '/kg ' + sh.item + '.' }); }

  function q3Stem(sh) { return 'A pharmacist needs to make ' + t(n(sh.V)) + ' mL of a ' + t(pc(sh.c)) + ' alcohol solution. She has a large bottle containing 1 L of ' + t(pc(sh.a)) + ' alcohol solution and a large bottle containing 1 L of ' + t(pc(sh.b)) + ' alcohol solution.'; }
  function q3Sol(sh) { return mixSol({ X: 'x', Y: 'y', M: sh.V, r1: sh.a / 100, r2: sh.b / 100, r1t: dp(sh.a), r2t: dp(sh.b), C: rnd(sh.c * sh.V / 100), A: sh.x, Bv: sh.y, letTxt: 'Let ' + t('x') + ' = mL of ' + t(pc(sh.a)) + ' solution, ' + t('y') + ' = mL of ' + t(pc(sh.b)) + ' solution.', amtName: 'Volume', conName: 'Alcohol', end: 'Mix ' + n(sh.x) + ' mL of the ' + sh.a + '% solution with ' + n(sh.y) + ' mL of the ' + sh.b + '% solution.' }); }

  function q6Sol(sh) { return bcSol({ b: 'p', c: 'w', S1: sh.gt, S2: sh.gh, pre: 'Let ' + t('p') + ' = cruising speed in still air, ' + t('w') + ' = wind speed (km/h).', l1: 'Into the headwind: ' + t('(p-w)(' + n(sh.t1) + ')=' + n(sh.D) + '\\Rightarrow p-w=' + n(sh.gh)), l2: 'With the tailwind: ' + t('(p+w)(' + n(sh.t2) + ')=' + n(sh.D) + '\\Rightarrow p+w=' + n(sh.gt)), end: 'The wind is blowing at ' + n(sh.w) + ' km/h.' }); }

  function q7Stem(sh) { return 'A cyclist leaves home at ' + clock(sh.start) + ' to bike to the ' + sh.place + ', ' + t(n(sh.D)) + ' km away. She rides at ' + t(n(sh.vr)) + ' km/h until she gets a flat tire, then walks her bike the rest of the way at ' + t(n(sh.vw)) + ' km/h. She arrives at the ' + sh.place + ' at ' + clock(sh.start + sh.T); }
  function q7Sol(sh) {
    var T = frac60(sh.T), vr = sh.vr, vw = sh.vw, Lm = vr * vw / gcd(vr, vw), A = Lm / vr, Bk = Lm / vw;   // clear the fractions with the LCD of the speeds
    var frq = function (p, q) { var g = gcd(p, q); p /= g; q /= g; if (q === 1) return String(p); var u = q; while (u % 2 === 0) u /= 2; while (u % 5 === 0) u /= 5; return u === 1 ? n(p / q) : (p < 0 ? '-' : '') + '\\frac{' + Math.abs(p) + '}{' + q + '}'; };
    var rhs = frq(Lm * sh.T, 60), diff = frq(Lm * sh.T - 60 * A * sh.D, 60);
    return 'From ' + clock(sh.start) + ' to ' + clock(sh.start + sh.T) + ' is ' + sh.T + ' min ' + t('=' + T) + ' h. Let ' + t('d') + ' = km ridden, ' + t('k') + ' = km walked.<br>Distance: ' + t('d+k=' + n(sh.D)) + ' &nbsp; Time: ' + t('\\frac{d}{' + vr + '}+\\frac{k}{' + vw + '}=' + T) +
      '<br>Multiply the time equation by ' + t(Lm) + ': ' + t(coef(A) + 'd+' + coef(Bk) + 'k=' + rhs) + '. ' + (A === 1 ? 'Subtract ' + t('d+k=' + n(sh.D)) : 'Subtract ' + t(A) + ' times the distance equation, ' + t(A + 'd+' + A + 'k=' + n(A * sh.D))) + ': ' + t(coef(Bk - A) + 'k=' + diff + '\\Rightarrow k=' + n(sh.k)) + ', so ' + t('d=' + n(sh.d)) + '.' +
      '<br>Check: riding ' + t('\\frac{' + n(sh.d) + '}{' + vr + '}') + ' h = ' + sh.tr + ' min, walking ' + t('\\frac{' + n(sh.k) + '}{' + vw + '}') + ' h = ' + sh.tw + ' min, total ' + sh.T + ' min ✓<br><b>She had to walk her bike ' + n(sh.k) + ' km.</b>';
  }
  function q9Stem(sh) { return 'Aiden left home at ' + clock(sh.dep) + ' to travel ' + t(n(sh.D)) + ' km to visit his uncle. He averaged ' + t(n(sh.v1)) + ' km/h for the first part of the trip, during which he took a ' + sh.r1 + '-minute rest, and ' + t(n(sh.v2)) + ' km/h for the second part, during which he took a ' + sh.r2 + '-minute rest. He reached his destination at ' + clock(sh.dep + sh.E); }

  HW.defineLesson({
    id: 'u8l5', unit: 8, num: '5', title: 'Mixture and Motion: More Applications of Linear Systems', outcome: 'RF9',
    blurb: 'Blending two ingredients that differ in cost or concentration, and journeys made of two legs or helped and hindered by a current or wind.',
    questions: [
      /* ---------- 1. granola (cost mixture) ---------- */
      { num: '1', section: 'Assignment — Mixture and motion problems', shared: q1Shared, stem: q1Stem, parts: [
        { id: '1sys', sub: 'system', level: 'EMG', make: function (r, sh) {
          var eq2 = rt(sh.p1) + 'x+' + rt(sh.p2) + 'y=' + n2(sh.V);
          return sysP({ prompt: 'Let ' + t('x') + ' be the mass of the ' + money(sh.p1) + '/kg ' + sh.item + ' and ' + t('y') + ' the mass of the ' + money(sh.p2) + '/kg ' + sh.item + ', in kg. Write a system of two equations: one for the total mass, one for the total value.', vars: ['x', 'y'],
            eqs: [{ tex: 'x+y=' + sh.M, name: 'mass equation', tip: 'the two masses add to the mass of the mixture, ' + t(n(sh.M)) + ' kg.' }, { tex: eq2, name: 'value equation', tip: 'each mass times its price per kg gives its value, and the two values add to ' + money(sh.V) + '.' }],
            wrongs: [{ is: rt(sh.p1) + 'x+' + rt(sh.p2) + 'y=' + sh.M, code: 'mix-value-rhs', hint: 'The value equation adds up <b>dollars</b>: its right side is the total value of the mixture, ' + money(sh.V) + ', not its mass.' },
              { is: rt(sh.p2) + 'x+' + rt(sh.p1) + 'y=' + n2(sh.V), code: 'mix-rates-swapped', hint: 'Check which price goes with which variable: ' + t('x') + ' is the mass of the ' + money(sh.p1) + '/kg ' + sh.item + ', so its term is ' + t(rt(sh.p1) + 'x') + '.' },
              { is: 'x+y=' + n2(sh.V), code: 'mix-value-rhs', hint: 'The mass equation adds kilograms, not dollars: the two masses add to ' + t(n(sh.M)) + ' kg.' }],
            good: [['y=' + sh.M + '-x', rt(2 * sh.p1) + 'x+' + rt(2 * sh.p2) + 'y=' + n2(2 * sh.V)]],
            sol: 'Mass (kg): ' + t('x+y=' + n(sh.M)) + '<br>Value ($): ' + t(eq2) + ' — each mass times its price per kg, added.', hints: H_MIX, text: 'granola system ' + sh.p1 + '/' + sh.p2 + ', ' + sh.M + ' kg, $' + sh.V });
        } },
        { id: '1', sub: 'solve', level: 'PRG', make: function (r, sh) {
          return amtP({ prompt: 'How many kg of each type were used?', names: [money(sh.p1) + '/kg ' + sh.item, money(sh.p2) + '/kg ' + sh.item], units: ['kg', 'kg'], vals: [sh.x, sh.y],
            conds: [amountConds(sh.M, 'kg', 'the mixture'), contentConds(sh.p1, sh.p2, rt(sh.p1), rt(sh.p2), sh.V, '', 'value in dollars')],
            swapHint: 'Right numbers, wrong boxes: the ' + money(sh.p1) + '/kg ' + sh.item + ' are the dearer ones — check which amount goes with which price.',
            sol: q1Sol(sh), hints: H_MIX, text: 'granola amounts ' + sh.x + '/' + sh.y });
        } }] },

      /* ---------- 2. nuts: unknown rates ---------- */
      { num: '2', shared: function (r) { return r.pick(Q2()); },
        stem: function (sh) { return t(n(sh.A)) + ' g of Type X granola is mixed with ' + t(n(sh.Bm)) + ' g of Type Y granola to produce a mixture that is ' + t(pc(sh.pct)) + ' nuts by mass. Type X granola has ' + (sh.k === 2 ? 'twice' : 'three times') + ' as many grams of nuts per gram as Type Y granola.'; },
        parts: [
          { id: '2sys', sub: 'system', level: 'PRG', make: function (r, sh) {
            var tot = sh.A + sh.Bm, kk = String(sh.k);
            return sysP({ prompt: 'Let ' + t('x') + ' and ' + t('y') + ' be the fractions of Type X and Type Y that are nuts, written as decimals (for example ' + t('0.10') + ' for ' + t('10\\%') + '). Write a system of two equations: one comparing the two rates, one for the total grams of nuts.', vars: ['x', 'y'],
              eqs: [{ tex: 'x=' + kk + 'y', name: 'rate equation', tip: 'Type X has ' + (sh.k === 2 ? 'twice' : 'three times') + ' the nuts per gram of Type Y, so ' + t('x') + ' is ' + kk + ' times ' + t('y') + '.' }, { tex: sh.A + 'x+' + sh.Bm + 'y=' + n(sh.nuts), name: 'nuts equation', tip: 'each mass times its fraction of nuts, added, gives the grams of nuts: ' + t(pc(sh.pct)) + ' of ' + t(n(tot)) + ' g.' }],
              wrongs: [{ is: 'y=' + kk + 'x', code: 'mix-ratio-backwards', hint: 'Type X is the one with more nuts, so ' + t('x') + ' must be the bigger rate: ' + t('x=' + kk + 'y') + ', not ' + t('y=' + kk + 'x') + '.' },
                { is: sh.A + 'x+' + sh.Bm + 'y=' + sh.pct, code: 'mix-content-rhs', hint: 'The right side must be the <b>grams of nuts</b> in the mixture, not the percent: ' + t(pc(sh.pct)) + ' of ' + t(n(tot)) + ' g is ' + t(n(sh.nuts)) + ' g.' },
                { is: sh.A + 'x+' + sh.Bm + 'y=' + dp(sh.pct), code: 'mix-content-rhs', hint: 'The right side must be the <b>grams of nuts</b> in the mixture: ' + t(dp(sh.pct) + '(' + n(tot) + ')=' + n(sh.nuts)) + ' g.' },
                { is: sh.A + 'x+' + sh.Bm + 'y=' + (sh.pct * tot), code: 'mix-pct-scale', hint: 'With ' + t('x') + ' and ' + t('y') + ' as decimals, the right side is ' + t(dp(sh.pct) + '(' + n(tot) + ')=' + n(sh.nuts)) + ' g — don’t use the whole-number percent ' + t(sh.pct) + ' there.' },
                { is: sh.Bm + 'x+' + sh.A + 'y=' + n(sh.nuts), code: 'mix-masses-swapped', hint: 'Check which mass goes with which rate: there are ' + t(n(sh.A)) + ' g of Type X, so its nuts are ' + t(sh.A + 'x') + '.' },
                { is: 'x+y=' + dp(sh.pct), code: 'mix-rates-added', hint: 'Rates are never added. The nuts equation multiplies each mass by its rate: ' + t(sh.A + 'x+' + sh.Bm + 'y') + ' grams of nuts.' }],
              sol: 'Rates: ' + t('x=' + kk + 'y') + '<br>Nuts: ' + t(pc(sh.pct)) + ' of ' + t(n(tot)) + ' g is ' + t(n(sh.nuts)) + ' g, so ' + t(sh.A + 'x+' + sh.Bm + 'y=' + n(sh.nuts)) + '.', hints: H_PCT, text: 'nuts system ' + sh.A + '/' + sh.Bm + ' ' + sh.pct + '%' });
          } },
          { id: '2', sub: 'solve', level: 'ADV', make: function (r, sh) {
            var tot = sh.A + sh.Bm, kk = sh.k, yv = sh.y / 100;
            var sol = 'Let ' + t('x') + ', ' + t('y') + ' = fraction of Type X, Type Y that is nuts.<br>Rates: ' + t('x=' + kk + 'y') + ' &nbsp; Nuts: ' + t(dp(sh.pct) + '(' + n(tot) + ')=' + n(sh.nuts)) + ', so ' + t(sh.A + 'x+' + sh.Bm + 'y=' + n(sh.nuts)) +
              '<br>Substitute ' + t('x=' + kk + 'y') + ': ' + t(sh.A + '(' + kk + 'y)+' + sh.Bm + 'y=' + n(sh.nuts) + '\\Rightarrow ' + n(kk * sh.A + sh.Bm) + 'y=' + n(sh.nuts) + '\\Rightarrow y=' + n(yv)) + ', so ' + t('x=' + kk + '(' + n(yv) + ')=' + n(rnd(kk * yv))) +
              '<br>Check: ' + t(sh.A + '(' + n(rnd(kk * yv)) + ')+' + sh.Bm + '(' + n(yv) + ')=' + n(rnd(sh.A * kk * yv)) + '+' + n(rnd(sh.Bm * yv)) + '=' + n(sh.nuts)) + ' g, and ' + t(n(sh.nuts) + '\\div ' + n(tot) + '=' + pc(sh.pct)) + ' ✓<br><b>Type X is ' + sh.x + '% nuts and Type Y is ' + sh.y + '% nuts.</b>';
            return amtP({ prompt: 'What percentage of nuts is in each type of granola?', names: ['Type X', 'Type Y'], units: ['%', '%'], vals: [sh.x, sh.y], pct: true,
              swapHint: 'Right numbers, wrong boxes: Type X has the <b>more</b> nuts per gram.',
              diag: function (u, v) { if (near(u, sh.pct) && near(v, sh.pct)) return { code: 'amt-cond', hint: 'The mixture is ' + sh.pct + '% nuts, but Type X has ' + (kk === 2 ? 'twice' : 'three times') + ' the rate of Type Y, so they can’t both be ' + sh.pct + '%.' }; return null; },
              conds: [{ f: function (u, v) { return u - kk * v; }, v: 0, code: 'amt-cond', hint: function (g, u, v) { return 'Type X must have ' + (kk === 2 ? 'twice' : 'three times') + ' the rate of Type Y, but ' + t(n(u) + '\\ne ' + kk + '\\times ' + n(v)) + '.'; } },
                { f: function (u, v) { return (sh.A * u + sh.Bm * v) / 100; }, v: sh.nuts, code: 'amt-value', hint: function (g) { return 'Check the nuts: your rates give ' + t(n(rnd(g))) + ' g of nuts, but the mixture holds ' + t(pc(sh.pct) + '\\times ' + n(tot) + '=' + n(sh.nuts)) + ' g.'; } }],
              sol: sol, hints: H_PCT, text: 'nut percents ' + sh.x + '/' + sh.y });
          } }] },

      /* ---------- 3. pharmacist ---------- */
      { num: '3', shared: function (r) { return r.pick(Q3()); }, stem: q3Stem, parts: [
        { id: '3asys', sub: 'a system', level: 'EMG', make: function (r, sh) {
          var C = rnd(sh.c * sh.V / 100), eq2 = dp(sh.a) + 'x+' + dp(sh.b) + 'y=' + n(C);
          return sysP({ prompt: 'Let ' + t('x') + ' be the mL of ' + t(pc(sh.a)) + ' solution and ' + t('y') + ' the mL of ' + t(pc(sh.b)) + ' solution. Write a system of two equations: one for the total volume, one for the amount of alcohol.', vars: ['x', 'y'],
            eqs: [{ tex: 'x+y=' + sh.V, name: 'volume equation', tip: 'the two volumes add to ' + t(n(sh.V)) + ' mL.' }, { tex: eq2, name: 'alcohol equation', tip: 'each volume times its percent (as a decimal) gives its alcohol; the two add to ' + t(pc(sh.c)) + ' of ' + t(n(sh.V)) + ' mL.' }],
            wrongs: pctWrongs(sh.a, sh.b, sh.c, sh.V, 'x', 'y', 'alcohol', 'mL'),
            good: [['x+y=' + sh.V, sh.a + 'x+' + sh.b + 'y=' + (sh.c * sh.V)]],
            sol: 'Volume (mL): ' + t('x+y=' + n(sh.V)) + '<br>Alcohol (mL): ' + t(eq2) + ', since ' + t(dp(sh.c) + '(' + n(sh.V) + ')=' + n(C)) + '. (Multiplying by 100 gives ' + t(sh.a + 'x+' + sh.b + 'y=' + n(sh.c * sh.V)) + ' — the same equation.)', hints: H_PCT, text: 'alcohol system ' + sh.a + '/' + sh.b + '→' + sh.c });
        } },
        { id: '3a', sub: 'a solve', level: 'PRG', make: function (r, sh) {
          var C = rnd(sh.c * sh.V / 100);
          return amtP({ prompt: 'How many mL of each solution should be mixed to make the ' + t(pc(sh.c)) + ' solution?', names: [sh.a + '% solution', sh.b + '% solution'], units: ['mL', 'mL'], vals: [sh.x, sh.y],
            conds: [amountConds(sh.V, 'mL', 'the batch'), contentConds(sh.a / 100, sh.b / 100, dp(sh.a), dp(sh.b), C, '\\text{ mL}', 'alcohol')],
            swapHint: 'Right numbers, wrong boxes: ' + sh.c + '% is closer to ' + (sh.x > sh.y ? sh.a : sh.b) + '%, so there is more of the ' + (sh.x > sh.y ? sh.a : sh.b) + '% solution.',
            sol: q3Sol(sh), hints: H_PCT, text: 'alcohol amounts ' + sh.x + '/' + sh.y });
        } },
        { id: '3b', sub: 'b', level: 'MAS', make: function (r, sh) {
          var g = gcd(sh.x, sh.y), px = sh.x / g, py = sh.y / g, ps = px + py, lim = sh.lowRunsOut ? sh.a : sh.b;
          var vle = function (q) { var v = 1000 * ps / q; return isInt(v * 100) ? n(rnd(v)) : '\\frac{' + (1000 * ps / gcd(1000 * ps, q)) + '}{' + (q / gcd(1000 * ps, q)) + '}=' + n(Math.floor(v * 100) / 100) + '\\ldots'; };
          var sol = 'Every batch keeps the ratio from (a), ' + t(n(sh.x) + ':' + n(sh.y) + '=' + px + ':' + py) + ' — ' + px + ' parts of ' + sh.a + '% and ' + py + ' parts of ' + sh.b + '% in every ' + ps + ' parts. For a total of ' + t('V') + ' mL:' +
            '<br>' + t('\\frac{' + px + '}{' + ps + '}V\\le 1000\\Rightarrow V\\le ' + vle(px)) + ' &nbsp; ' + t('\\frac{' + py + '}{' + ps + '}V\\le 1000\\Rightarrow V\\le ' + vle(py)) +
            '<br>The ' + lim + '% bottle runs out first, so the most is ' + (isInt(sh.vmaxRaw) ? t(n(sh.vmax)) + ' mL' : t(vle(sh.lowRunsOut ? px : py)) + ' mL, rounded <b>down</b> to ' + t(n(sh.vmax)) + ' mL') + '.<br><b>At most ' + t(n(sh.vmax)) + ' mL of ' + sh.c + '% solution can be made.</b>';
          return numP('What is the maximum volume, rounded down to the nearest mL, of ' + t(pc(sh.c)) + ' alcohol solution that could be made from the two original 1 L bottles?', sh.vmax, function (v) {
            if (v === 2000) return { code: 'mix-max-sum', hint: 'You can’t use all of both bottles: every batch must keep the ratio ' + t(px + ':' + py) + ' from (a), so one bottle runs out before the other.' };
            if (v === sh.vother || v === sh.vother + 1) return { code: 'mix-max-other', hint: 'That batch would need more than 1 L of the ' + lim + '% solution. Work out the limit from <b>each</b> bottle and take the smaller one.' };
            if (v === sh.vmax + 1 && !isInt(sh.vmaxRaw)) return { code: 'round-down', hint: 'Round <b>down</b>: one more mL would need more of the ' + lim + '% solution than the bottle holds.' };
            if (v === 1000) return { code: 'mix-max-other', hint: 'Using up one bottle still leaves the other one for the same batch: the batch is larger than 1 L.' };
            return null;
          }, sol, ['Any batch uses the two solutions in the same ratio as in part (a). Which bottle is used up first?', 'If the batch is ' + t('V') + ' mL, it needs ' + t('\\frac{' + px + '}{' + ps + '}V') + ' mL of the ' + sh.a + '% solution. That can be at most 1000 mL.'], 'max batch ' + sh.vmax, { after: 'mL' });
        } }] },

      /* ---------- 4. carat gold ---------- */
      { num: '4', shared: function (r) { return r.pick(Q4()); },
        stem: function (sh) { return 'A jeweller has some ' + sh.L + ' carat gold and some ' + sh.H + ' carat gold, and wants to produce ' + t(n(sh.M)) + ' g of gold that is ' + t(pc(sh.P)) + ' pure by mass. Pure gold is 24 carat.'; },
        parts: [
          { id: '4a', sub: 'a', level: 'BEG', make: function (r, sh) {
            return numP('What percentage of gold is ' + sh.H + ' carat gold?', sh.Hp, function (v) {
              if (near(v, sh.H)) return { code: 'carat-pct', hint: 'Carats aren’t percents. Pure gold is 24 carat, so ' + sh.H + ' carat gold is ' + t('\\frac{' + sh.H + '}{24}') + ' gold.' };
              if (near(v, rnd(2400 / sh.H)) || near(v, Math.round(2400 / sh.H))) return { code: 'carat-flip', hint: 'Upside down: ' + sh.H + ' carat is ' + sh.H + ' parts out of 24, so the fraction is ' + t('\\frac{' + sh.H + '}{24}') + '.' };
              if (near(v, sh.Lp)) return { code: 'mix-other', hint: 'That is the ' + sh.L + ' carat gold. The question asks about ' + sh.H + ' carat.' };
              return null;
            }, t('\\frac{' + sh.H + '}{24}=' + n(rnd(sh.H / 24))) + '<br><b>' + sh.H + ' carat gold is ' + n(sh.Hp) + '% gold.</b>', ['Pure gold is 24 carat, so ' + t('n') + ' carat gold is ' + t('\\frac{n}{24}') + ' pure.'], 'carat % ' + sh.H, { after: '%' }, { pct: true });
          } },
          { id: '4b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var C = rnd(sh.P * sh.M / 100);
            var sol = sh.L + ' carat is ' + t('\\frac{' + sh.L + '}{24}=' + pc(sh.Lp)) + ' gold and ' + sh.H + ' carat is ' + t(pc(sh.Hp)) + ' gold.<br>' + mixSol({ X: 'x', Y: 'y', M: sh.M, r1: sh.Lp / 100, r2: sh.Hp / 100, r1t: dp(sh.Lp), r2t: dp(sh.Hp), C: C, A: sh.x, Bv: sh.y, letTxt: 'Let ' + t('x') + ' = g of ' + sh.L + ' carat, ' + t('y') + ' = g of ' + sh.H + ' carat gold.', amtName: 'Mass', conName: 'Pure gold', end: n(sh.x) + ' g of ' + sh.L + ' carat gold and ' + n(sh.y) + ' g of ' + sh.H + ' carat gold.' });
            return amtP({ prompt: 'How many grams of ' + sh.L + ' carat gold and of ' + sh.H + ' carat gold are needed to produce the mixture?', names: [sh.L + ' carat gold', sh.H + ' carat gold'], units: ['g', 'g'], vals: [sh.x, sh.y],
              conds: [amountConds(sh.M, 'g', 'the mixture'), contentConds(sh.Lp / 100, sh.Hp / 100, dp(sh.Lp), dp(sh.Hp), C, '\\text{ g}', 'pure gold')],
              swapHint: 'Right numbers, wrong boxes: ' + sh.P + '% is closer to ' + (sh.x > sh.y ? pc(sh.Lp).replace('\\%', '%') + ' (' + sh.L + ' carat)' : pc(sh.Hp).replace('\\%', '%') + ' (' + sh.H + ' carat)') + ', so there is more of that one.',
              sol: sol, hints: ['First change each carat to a percent of pure gold: ' + t('\\frac{n}{24}') + '.', 'Pure gold: ' + t(dp(sh.Lp) + 'x+' + dp(sh.Hp) + 'y=' + dp(sh.P) + '(' + n(sh.M) + ')') + '.'], text: 'carat masses ' + sh.x + '/' + sh.y });
          } }] },

      /* ---------- 5. train and car ---------- */
      { num: '5', shared: function (r) { return r.pick(Q5()); }, parts: [
        { id: '5', level: 'ADV', make: function (r, sh) {
          var sol = 'Let ' + t('t') + ' = common time (h). Car: ' + t('\\frac{' + n(sh.D2) + '}{t}') + ' km/h; train: ' + t('\\frac{' + n(sh.D1) + '}{t}') + ' km/h.<br>The train is ' + sh.k + ' km/h faster: ' + t('\\frac{' + n(sh.D1) + '}{t}=\\frac{' + n(sh.D2) + '}{t}+' + sh.k) +
            '<br>Multiply every term by ' + t('t') + ': ' + t(n(sh.D1) + '=' + n(sh.D2) + '+' + sh.k + 't\\Rightarrow ' + sh.k + 't=' + n(sh.D1 - sh.D2) + '\\Rightarrow t=' + n(sh.t)) +
            '<br>Car: ' + t('\\frac{' + n(sh.D2) + '}{' + n(sh.t) + '}=' + n(sh.v)) + ' km/h; train: ' + t('\\frac{' + n(sh.D1) + '}{' + n(sh.t) + '}=' + n(sh.v + sh.k)) + ' km/h.<br>Check: ' + t(n(sh.v + sh.k) + '-' + n(sh.v) + '=' + sh.k) + ' ✓<br><b>The car averages ' + sh.v + ' km/h and takes ' + hrs(sh.t) + '.</b>';
          return amtP({ prompt: 'An express train travels ' + t(n(sh.D1)) + ' km in the same time that a car travels ' + t(n(sh.D2)) + ' km. The train travels, on average, ' + t(sh.k) + ' km/h faster than the car. Find the average speed of the car and the time taken for the car to travel ' + t(n(sh.D2)) + ' km.<br><i>Hint:</i> let ' + t('t') + ' be the common time, in hours, and write each speed as distance ÷ ' + t('t') + '.',
            names: ['Car’s speed', 'Time'], units: ['km/h', 'h'], vals: [sh.v, sh.t],
            diag: function (u, v) {
              if (near(u, sh.v + sh.k)) return { code: 'mot-other', hint: 'That is the <b>train’s</b> speed — the car is the slower one, ' + sh.k + ' km/h less.' };
              if (near(v, sh.t * 60)) return { form: true, code: 'mot-units', hint: 'Give the time in <b>hours</b>.' };
              return null;
            },
            conds: [{ f: function (u, v) { return u * v; }, v: sh.D2, code: 'amt-cond', hint: function (g) { return 'Check: at that speed for that time the car covers ' + t(n(rnd(g))) + ' km, not ' + t(n(sh.D2)) + ' km.'; } },
              { f: function (u, v) { return (u + sh.k) * v; }, v: sh.D1, code: 'amt-cond', hint: function (g) { return 'Check the train: ' + sh.k + ' km/h faster for the same time, it would cover ' + t(n(rnd(g))) + ' km, not ' + t(n(sh.D1)) + ' km.'; } }],
            sol: sol, hints: ['Both travel for the same time ' + t('t') + '. Write the car’s speed as ' + t('\\frac{' + n(sh.D2) + '}{t}') + ' and the train’s as ' + t('\\frac{' + n(sh.D1) + '}{t}') + '.', 'The train’s speed is the car’s speed plus ' + sh.k + '. Multiply that equation through by ' + t('t') + '.'], text: 'train/car ' + sh.D1 + '/' + sh.D2 + ' +' + sh.k });
        } }] },

      /* ---------- 6. headwind / tailwind ---------- */
      { num: '6', shared: function (r) { return r.pick(Q6()); },
        stem: function (sh) { return 'A small plane flying into a headwind takes ' + hrs(sh.t1) + ' to travel the ' + t(n(sh.D)) + ' km from ' + sh.A + ' to ' + sh.Bc + '. At the same time, a similar plane leaves ' + sh.Bc + ' and reaches ' + sh.A + ' in ' + hrs(sh.t2) + '. The planes have the same cruising speed in windless conditions.'; },
        parts: [
          { id: '6sys', sub: 'system', level: 'PRG', make: function (r, sh) {
            return sysP({ prompt: 'Let ' + t('p') + ' be the cruising speed in still air and ' + t('w') + ' the speed of the wind, in km/h. Write a system of two equations, one for each plane.', vars: ['p', 'w'],
              eqs: [{ tex: n(sh.t1) + '(p-w)=' + sh.D, name: 'headwind equation', tip: 'into the headwind the plane is slowed to ' + t('p-w') + ', for ' + hrs(sh.t1) + '.' }, { tex: n(sh.t2) + '(p+w)=' + sh.D, name: 'tailwind equation', tip: 'with the tailwind the plane is pushed along at ' + t('p+w') + ', for ' + hrs(sh.t2) + '.' }],
              wrongs: [{ is: n(sh.t1) + '(p+w)=' + sh.D, code: 'mot-legs-swapped', hint: 'Into a headwind the plane is slowed: its ground speed is ' + t('p-w') + '. The headwind trip is the slower one (' + hrs(sh.t1) + ').' },
                { is: n(sh.t2) + '(p-w)=' + sh.D, code: 'mot-legs-swapped', hint: 'The tailwind pushes the plane along: its ground speed is ' + t('p+w') + ', and it is the faster trip (' + hrs(sh.t2) + ').' },
                { is: 'p-w=' + n(sh.D * sh.t1), code: 'mot-dst', hint: 'Speed = distance ÷ time, so ' + t('p-w=\\frac{' + n(sh.D) + '}{' + n(sh.t1) + '}') + ' (or ' + t('(p-w)(' + n(sh.t1) + ')=' + n(sh.D)) + ').' },
                { is: 'p+w=' + n(sh.D * sh.t2), code: 'mot-dst', hint: 'Speed = distance ÷ time, so ' + t('p+w=\\frac{' + n(sh.D) + '}{' + n(sh.t2) + '}') + '.' }],
              good: [['p-w=' + sh.gh, 'p+w=' + sh.gt]],
              sol: 'Into the headwind: ' + t('(p-w)(' + n(sh.t1) + ')=' + n(sh.D)) + ', i.e. ' + t('p-w=' + n(sh.gh)) + '<br>With the tailwind: ' + t('(p+w)(' + n(sh.t2) + ')=' + n(sh.D)) + ', i.e. ' + t('p+w=' + n(sh.gt)), hints: H_STREAM.map(function (h) { return h.replace(/b\+c/, 'p+w').replace(/b-c/, 'p-w').replace(/\\\(c\\\)/, t('w')); }), text: 'wind system ' + sh.D + ' km ' + sh.t1 + '/' + sh.t2 });
          } },
          { id: '6', sub: 'solve', level: 'ADV', make: function (r, sh) {
            return numP('Determine the speed of the wind.', sh.w, function (v) {
              if (near(v, sh.p)) return { code: 'mot-other', hint: 'That is the planes’ cruising speed in still air. The question asks for the <b>wind</b>.' };
              if (near(v, sh.gh) || near(v, sh.gt)) return { code: 'mot-ground', hint: 'That is a ground speed (distance ÷ time). Write ' + t('p-w') + ' and ' + t('p+w') + ' equal to the two ground speeds and solve for ' + t('w') + '.' };
              if (near(v, sh.gt - sh.gh)) return { code: 'mot-not-halved', hint: 'Subtracting the equations gives ' + t('2w=' + n(sh.gt - sh.gh)) + ' — divide by 2.' };
              return null;
            }, q6Sol(sh), ['Ground speeds: ' + t('\\frac{' + n(sh.D) + '}{' + n(sh.t1) + '}') + ' into the headwind and ' + t('\\frac{' + n(sh.D) + '}{' + n(sh.t2) + '}') + ' with the tailwind.', 'Set ' + t('p-w') + ' and ' + t('p+w') + ' equal to those speeds; subtract to eliminate ' + t('p') + '.'], 'wind ' + sh.w, { after: 'km/h' });
          } }] },

      /* ---------- 7. cyclist with a flat ---------- */
      { num: '7', shared: function (r) { var c = r.pick(Q7()); return Object.assign({}, c, { start: 6 * 60 + 30 + 5 * r.int(0, 18), place: r.pick(['library', 'school', 'pool', 'rink']) }); }, stem: q7Stem, parts: [
        { id: '7sys', sub: 'system', level: 'PRG', make: function (r, sh) {
          var T = frac60(sh.T);
          return sysP({ prompt: 'Let ' + t('d') + ' be the distance she rode and ' + t('k') + ' the distance she walked, in km. Write a system of two equations: one for the distance, one for the time (in hours).', vars: ['d', 'k'],
            eqs: [{ tex: 'd+k=' + sh.D, name: 'distance equation', tip: 'the two distances add to ' + t(n(sh.D)) + ' km.' }, { tex: '\\frac{d}{' + sh.vr + '}+\\frac{k}{' + sh.vw + '}=' + T, name: 'time equation', tip: 'time = distance ÷ speed for each leg, and the two times add to ' + sh.T + ' min ' + t('=' + T) + ' h.' }],
            wrongs: [{ is: '\\frac{d}{' + sh.vr + '}+\\frac{k}{' + sh.vw + '}=' + sh.T, code: 'mot-minutes', hint: 'The speeds are in km per <b>hour</b>, so the time must be in hours: ' + sh.T + ' min ' + t('=\\frac{' + sh.T + '}{60}') + ' h.' },
              { is: '\\frac{d}{' + sh.vr + '}+\\frac{k}{' + sh.vw + '}=' + (sh.T / 100), code: 'mot-time-decimal', hint: sh.T + ' minutes is not ' + t(n(sh.T / 100)) + ' h: an hour has 60 minutes, so it is ' + t('\\frac{' + sh.T + '}{60}') + ' h.' },
              { is: sh.vr + 'd+' + sh.vw + 'k=' + T, code: 'mot-dst', hint: 'Time = distance ÷ speed: riding takes ' + t('\\frac{d}{' + sh.vr + '}') + ' hours, not ' + t(sh.vr + 'd') + '.' },
              { is: sh.vr + 'd+' + sh.vw + 'k=' + sh.D, code: 'mot-dst', hint: 'The second equation should add up the <b>times</b>: time = distance ÷ speed, ' + t('\\frac{d}{' + sh.vr + '}+\\frac{k}{' + sh.vw + '}') + '.' },
              { is: '\\frac{d}{' + sh.vw + '}+\\frac{k}{' + sh.vr + '}=' + T, code: 'mot-speeds-swapped', hint: 'She <b>rode</b> the distance ' + t('d') + ' at ' + sh.vr + ' km/h and <b>walked</b> ' + t('k') + ' at ' + sh.vw + ' km/h.' }],
            good: isInt(sh.vr / sh.vw) ? [['d+k=' + sh.D, 'd+' + (sh.vr / sh.vw) + 'k=' + n(rnd(sh.vr * sh.T / 60))]] : [],
            sol: 'From ' + clock(sh.start) + ' to ' + clock(sh.start + sh.T) + ' is ' + sh.T + ' min ' + t('=' + T) + ' h.<br>Distance: ' + t('d+k=' + n(sh.D)) + '<br>Time: ' + t('\\frac{d}{' + sh.vr + '}+\\frac{k}{' + sh.vw + '}=' + T), hints: ['Time = distance ÷ speed for each leg.', 'Change the elapsed time to hours: divide the minutes by 60.'], text: 'cyclist system ' + sh.D + ' km ' + sh.T + ' min' });
        } },
        { id: '7', sub: 'solve', level: 'ADV', make: function (r, sh) {
          var kBad = (sh.T / 100 - sh.D / sh.vr) / (1 / sh.vw - 1 / sh.vr);
          return numP('How far did she have to walk her bike?', sh.k, function (v) {
            if (near(v, sh.d)) return { code: 'mot-other', hint: 'That is the distance she <b>rode</b>. The question asks how far she walked.' };
            if (kBad > 0 && near(v, rnd(kBad))) return { code: 'mot-time-decimal', hint: sh.T + ' minutes is ' + t('\\frac{' + sh.T + '}{60}') + ' h, not ' + t(n(sh.T / 100)) + ' h.' };
            if (near(v, sh.tw) || near(v, sh.tr)) return { code: 'mot-other', hint: 'That is a time in minutes. The question asks for a <b>distance</b> in km.' };
            return null;
          }, q7Sol(sh), ['Distance: ' + t('d+k=' + n(sh.D)) + '. Time: ' + t('\\frac{d}{' + sh.vr + '}+\\frac{k}{' + sh.vw + '}') + ' = the elapsed time in hours.', 'Multiply the time equation by ' + t(sh.vr * sh.vw / gcd(sh.vr, sh.vw)) + ' to clear the fractions, then eliminate ' + t('d') + ' using the distance equation.'], 'walked ' + sh.k + ' km', { after: 'km' });
        } }] },

      /* ---------- 8. MC coffee ---------- */
      { num: '8', shared: function (r) { return r.pick(Q8()); }, parts: [
        { id: '8', level: 'EMG', make: function (r, sh) {
          var V = rnd(sh.pm * sh.M), q = Math.round(sh.M / 4), cands = [q, sh.M - q, Math.round(sh.M / 5), sh.M - Math.round(sh.M / 5), Math.round(sh.M / 2) + 4, Math.round(sh.M / 3)];
          var dis = cands.filter(function (v, i, a) { return v > 0 && v < sh.M && v !== sh.x && v !== sh.y && a.indexOf(v) === i; }).slice(0, 2);
          var opts = [{ v: sh.x, right: true }, { v: sh.y, why: 'That is the amount of the ' + money(sh.p2) + ' coffee. The question asks for the first coffee, the ' + money(sh.p1) + ' one.', code: 'other' }].concat(dis.map(function (v) {
            return { v: v, why: 'Check: ' + v + ' kg at ' + money(sh.p1) + ' and ' + (sh.M - v) + ' kg at ' + money(sh.p2) + ' would be worth ' + money(sh.p1 * v + sh.p2 * (sh.M - v)) + ', but ' + n(sh.M) + ' kg at ' + money(sh.pm) + ' is worth ' + money(V) + '.', code: 'value' }; }));
          opts.sort(function (a, b) { return a.v - b.v; });
          var sol = mixSol({ X: 'x', Y: 'y', M: sh.M, r1: sh.p1, r2: sh.p2, r1t: String(sh.p1), r2t: String(sh.p2), C: V, A: sh.x, Bv: sh.y, cf: n2, letTxt: 'Let ' + t('x') + ' = kg of ' + money(sh.p1) + ' coffee, ' + t('y') + ' = kg of ' + money(sh.p2) + ' coffee. Value: ' + t(n2(sh.pm) + '(' + n(sh.M) + ')=' + n2(V)) + '.', amtName: 'Mass', conName: 'Value', end: 'The mixture has ' + sh.x + ' kg of the ' + money(sh.p1) + '/kg coffee.' });
          return mcP(r, '<i>(Multiple choice)</i> A shopkeeper mixes two coffees, one selling at ' + money(sh.p1) + ' per kg and the other at ' + money(sh.p2) + ' per kg, to make ' + t(n(sh.M)) + ' kg of a mixture selling at ' + money(sh.pm) + ' per kg. The number of kg of the first coffee in the mixture is',
            opts.map(function (o) { return { html: t(n(o.v)), right: !!o.right, why: o.why, code: o.code }; }), sol, H_MIX, 'MC coffee ' + sh.p1 + '/' + sh.p2 + ' → ' + sh.x, true);
        } }] },

      /* ---------- 9. NR two-part trip with rests ---------- */
      { num: '9', shared: function (r) {
          return draw(r, function (r) {
            var v1 = r.pick([80, 85, 90, 95, 100, 105, 110]), v2 = r.pick([60, 65, 70, 75, 80]), t1 = 6 * r.int(15, 50), t2 = 6 * r.int(10, 40), r1 = r.pick([10, 15, 20, 30, 40, 45]), r2 = r.pick([10, 15, 20, 25, 30]);
            return { v1: v1, v2: v2, t1: t1, t2: t2, r1: r1, r2: r2, D: (v1 * t1 + v2 * t2) / 60, E: t1 + t2 + r1 + r2, dep: 60 * r.int(7, 13) + 30 * r.int(0, 1) };
          }, function (c) { return c.v2 <= c.v1 - 15 && isInt(c.D) && c.E % 5 === 0 && c.dep + c.E <= 21 * 60 && c.t1 !== c.t2 && c.r1 !== c.r2; },
          { v1: 95, v2: 75, t1: 216, t2: 144, r1: 40, r2: 20, D: 522, E: 420, dep: 13 * 60 });
        }, parts: [
        { id: '9', level: 'ADV', make: function (r, sh) {
          var drive = sh.E - sh.r1 - sh.r2, alt = function (T) { return rnd((sh.D - sh.v2 * T / 60) / (sh.v1 - sh.v2) * 60); };
          var bads = [alt(sh.E), alt(sh.E - sh.r1), alt(sh.E - sh.r2)];
          var sol = clock(sh.dep) + ' to ' + clock(sh.dep + sh.E) + ' is ' + sh.E + ' min. The rests total ' + (sh.r1 + sh.r2) + ' min, so the driving time is ' + t(sh.E + '-' + (sh.r1 + sh.r2) + '=' + drive) + ' min ' + t('=' + n(drive / 60)) + ' h.<br>Let ' + t('t_1') + ', ' + t('t_2') + ' = hours driven at ' + sh.v1 + ' and ' + sh.v2 + ' km/h.' +
            '<br>Time: ' + t('t_1+t_2=' + n(drive / 60)) + ' &nbsp; Distance: ' + t(sh.v1 + 't_1+' + sh.v2 + 't_2=' + n(sh.D)) +
            '<br>With ' + t('t_2=' + n(drive / 60) + '-t_1') + ': ' + t(sh.v1 + 't_1+' + n(rnd(sh.v2 * drive / 60)) + '-' + sh.v2 + 't_1=' + n(sh.D) + '\\Rightarrow ' + (sh.v1 - sh.v2) + 't_1=' + n(rnd(sh.D - sh.v2 * drive / 60)) + '\\Rightarrow t_1=' + n(sh.t1 / 60)) + ' h ' + t('=' + n(sh.t1 / 60) + '(60)=' + sh.t1) + ' min.' +
            '<br>Check: ' + t('t_2=' + n(sh.t2 / 60)) + ' h, and ' + t(sh.v1 + '(' + n(sh.t1 / 60) + ')+' + sh.v2 + '(' + n(sh.t2 / 60) + ')=' + n(rnd(sh.v1 * sh.t1 / 60)) + '+' + n(rnd(sh.v2 * sh.t2 / 60)) + '=' + n(sh.D)) + ' km ✓<br><b>' + sh.t1 + ' minutes.</b>';
          return B.nr('<i>(Numerical response)</i> ' + q9Stem(sh) + ' The number of minutes he spent <b>driving</b> during the first part of the trip is ____.', sh.t1, function (v) {
            if (near(v, sh.t1 / 60)) return { code: 'mot-hours', hint: 'That is in hours. The question asks for <b>minutes</b>: multiply by 60.' };
            if (near(v, sh.t2)) return { code: 'mot-other', hint: 'That is the driving time for the <b>second</b> part of the trip.' };
            if (near(v, sh.t1 + sh.r1)) return { code: 'mot-stop-added', hint: 'The question asks for time spent <b>driving</b> — don’t include the ' + sh.r1 + '-minute rest.' };
            if (bads.some(function (b) { return b > 0 && near(v, b); })) return { code: 'mot-stops', hint: 'Stopped time is not driving time: subtract <b>both</b> rests (' + sh.r1 + ' + ' + sh.r2 + ' min) from the total trip time before writing the time equation.' };
            return null;
          }, sol, ['Subtract both rests from the total trip time to get the <b>driving</b> time.', 'Time: ' + t('t_1+t_2') + ' = driving time in hours; distance: ' + t(sh.v1 + 't_1+' + sh.v2 + 't_2=' + n(sh.D)) + '.'], 'NR first-part driving ' + sh.t1 + ' min');
        } }] }
    ],

    extra: [
      /* ---------------- Part A — the mixture table ---------------- */
      { num: '1', section: 'Extra practice A — The mixture table', shared: function (r) { return r.pick(E1()); },
        stem: function (sh) { return 'A metal shop stocks an alloy that is ' + t(pc(sh.lo)) + ' copper and an alloy that is ' + t(pc(sh.hi)) + ' copper. It needs ' + t(n(sh.M)) + ' kg of an alloy that is ' + t(pc(sh.c)) + ' copper. Let ' + t('x') + ' be the kilograms of the ' + t(pc(sh.lo)) + ' alloy and ' + t('y') + ' the kilograms of the ' + t(pc(sh.hi)) + ' alloy.'; },
        parts: [
          { id: 'e1a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var C = rnd(sh.c * sh.M / 100);
            var fields = [{ label: 'Copper in the ' + sh.lo + '% alloy', mode: 'math', keys: 'eq', vars: ['x', 'y'], placeholder: ' ', after: 'kg' }, { label: 'Copper in the ' + sh.hi + '% alloy', mode: 'math', keys: 'eq', vars: ['x', 'y'], placeholder: ' ', after: 'kg' }, { label: 'Copper in the mixture', mode: 'math', keys: 'eq', vars: ['x', 'y'], placeholder: ' ', after: 'kg' }];
            var pw = function (p, v) { return K.poly(dp(p) + v, { wrong: [{ is: p + v, code: 'mix-pct-whole', hint: 'Write the percent as a decimal: ' + t(p + '\\%=' + dp(p)) + ', so the copper is ' + t(dp(p) + v) + '.' }, { is: v, code: 'amt', hint: 'That is the mass of the alloy. Its copper is the mass times the concentration.' }] }); };
            return B.fields('Complete the copper column of the table: each entry is amount × concentration.', fields,
              [pw(sh.lo, 'x'), pw(sh.hi, 'y'), K.value(C, { diag: function (v) { if (near(v, sh.c) || near(v, sh.c / 100)) return { code: 'mix-content-rhs', hint: 'That is the concentration. The copper is ' + t(pc(sh.c)) + ' of ' + t(n(sh.M)) + ' kg.' }; if (near(v, sh.M)) return { code: 'mix-content-rhs', hint: 'That is the mass of the mixture. Its copper is ' + t(dp(sh.c) + '\\times ' + n(sh.M)) + '.' }; return null; } })],
              [dp(sh.lo) + 'x', dp(sh.hi) + 'y', n(C)], 'Copper: ' + t(dp(sh.lo) + 'x') + ', ' + t(dp(sh.hi) + 'y') + ', ' + t(n(C)) + ' kg',
              'Amount | concentration | copper:<br>' + sh.lo + '% alloy: ' + t('x') + ' | ' + t(dp(sh.lo)) + ' | ' + t(dp(sh.lo) + 'x') + '<br>' + sh.hi + '% alloy: ' + t('y') + ' | ' + t(dp(sh.hi)) + ' | ' + t(dp(sh.hi) + 'y') + '<br>Mixture: ' + t(n(sh.M)) + ' | ' + t(dp(sh.c)) + ' | ' + t(dp(sh.c) + '(' + n(sh.M) + ')=' + n(C)),
              ['Copper = amount × concentration, with the concentration as a decimal.'], 'copper table ' + sh.lo + '/' + sh.hi);
          } },
          { id: 'e1b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var C = rnd(sh.c * sh.M / 100);
            return sysP({ prompt: 'Read the two equations off the table: one from the amount column, one from the copper column.', vars: ['x', 'y'],
              eqs: [{ tex: 'x+y=' + sh.M, name: 'amount equation', tip: 'the amounts add to ' + t(n(sh.M)) + ' kg.' }, { tex: dp(sh.lo) + 'x+' + dp(sh.hi) + 'y=' + n(C), name: 'copper equation', tip: 'the copper column adds to ' + t(dp(sh.c) + '(' + n(sh.M) + ')=' + n(C)) + ' kg.' }],
              wrongs: pctWrongs(sh.lo, sh.hi, sh.c, sh.M, 'x', 'y', 'copper', 'kg'),
              sol: 'Amount column: ' + t('x+y=' + n(sh.M)) + '<br>Copper column: ' + t(dp(sh.lo) + 'x+' + dp(sh.hi) + 'y=' + n(C)), hints: H_PCT, text: 'copper system' });
          } },
          { id: 'e1c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var C = rnd(sh.c * sh.M / 100);
            return amtP({ prompt: 'Solve the system. How many kilograms of each alloy does the shop need?', names: [sh.lo + '% alloy', sh.hi + '% alloy'], units: ['kg', 'kg'], vals: [sh.x, sh.y],
              conds: [amountConds(sh.M, 'kg', 'the order'), contentConds(sh.lo / 100, sh.hi / 100, dp(sh.lo), dp(sh.hi), C, '\\text{ kg}', 'copper')],
              sol: 'Clear the decimals: multiply the copper equation by 100: ' + t(sh.lo + 'x+' + sh.hi + 'y=' + n(C * 100)) + '.<br>' + mixSol({ X: 'x', Y: 'y', M: sh.M, r1: sh.lo, r2: sh.hi, r1t: String(sh.lo), r2t: String(sh.hi), C: rnd(C * 100), A: sh.x, Bv: sh.y, letTxt: '', amtName: 'Amount', conName: 'Copper (×100)', end: 'The shop needs ' + n(sh.x) + ' kg of the ' + sh.lo + '% alloy and ' + n(sh.y) + ' kg of the ' + sh.hi + '% alloy.' }).replace(/^<br>/, ''),
              hints: H_PCT, text: 'copper amounts ' + sh.x + '/' + sh.y });
          } },
          { id: 'e1d', sub: 'd', level: 'BEG', make: function (r, sh) {
            var C = rnd(sh.c * sh.M / 100);
            return numP('Check the answer ' + t(n(sh.x)) + ' kg of the ' + t(pc(sh.lo)) + ' alloy and ' + t(n(sh.y)) + ' kg of the ' + t(pc(sh.hi)) + ' alloy in the copper equation: how many kilograms of copper do they contain altogether?', C, function (v) {
              if (near(v, sh.M)) return { code: 'amt', hint: 'That is the total mass. Find the copper: ' + t(dp(sh.lo) + '(' + n(sh.x) + ')+' + dp(sh.hi) + '(' + n(sh.y) + ')') + '.' };
              if (near(v, sh.lo * sh.x + sh.hi * sh.y)) return { code: 'mix-pct-whole', hint: 'Use the percents as decimals: ' + t(pc(sh.lo) + '=' + dp(sh.lo)) + '.' }; return null; },
              t(dp(sh.lo) + '(' + n(sh.x) + ')+' + dp(sh.hi) + '(' + n(sh.y) + ')=' + n(rnd(sh.lo * sh.x / 100)) + '+' + n(rnd(sh.hi * sh.y / 100)) + '=' + n(C)) + ' kg, and ' + t(dp(sh.c) + '(' + n(sh.M) + ')=' + n(C)) + ' ✓. Also ' + t(n(sh.x) + '+' + n(sh.y) + '=' + n(sh.M)) + ' ✓<br>In context: ' + sh.c + '% is nearer ' + (sh.x > sh.y ? sh.lo : sh.hi) + '%, so there should be more of the ' + (sh.x > sh.y ? sh.lo : sh.hi) + '% alloy — and there is.',
              ['Copper = mass × concentration (as a decimal), for each alloy.'], 'copper check', { after: 'kg' });
          } }] },
      { num: '2', shared: function (r) { return r.pick(E2()); },
        stem: function (sh) { return 'A supplier blends a fertilizer that is ' + t(pc(sh.hi)) + ' nitrogen with one that is ' + t(pc(sh.lo)) + ' nitrogen to produce ' + t(n(sh.M)) + ' kg of a blend that is ' + t(pc(sh.c)) + ' nitrogen. Let ' + t('m') + ' be the kilograms of the ' + t(pc(sh.hi)) + ' fertilizer and ' + t('n') + ' the kilograms of the ' + t(pc(sh.lo)) + ' fertilizer. <b>Do not solve this system.</b>'; },
        parts: [
          { id: 'e2a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var C = rnd(sh.c * sh.M / 100), V = ['m', 'n'];
            var fields = [{ label: 'Nitrogen in the ' + sh.hi + '% fertilizer', mode: 'math', keys: 'eq', vars: V, placeholder: ' ', after: 'kg' }, { label: 'Nitrogen in the ' + sh.lo + '% fertilizer', mode: 'math', keys: 'eq', vars: V, placeholder: ' ', after: 'kg' }, { label: 'Nitrogen in the blend', mode: 'math', keys: 'eq', vars: V, placeholder: ' ', after: 'kg' }];
            var pw = function (p, v) { return K.poly(dp(p) + v, { wrong: [{ is: p + v, code: 'mix-pct-whole', hint: 'Write the percent as a decimal: ' + t(p + '\\%=' + dp(p)) + '.' }] }); };
            return B.fields('Complete the nitrogen column of the table (amount × concentration).', fields,
              [pw(sh.hi, 'm'), pw(sh.lo, 'n'), K.value(C, { diag: function (v) { if (near(v, sh.c) || near(v, sh.c / 100)) return { code: 'mix-content-rhs', hint: 'That is the concentration. The nitrogen is ' + t(pc(sh.c)) + ' of ' + t(n(sh.M)) + ' kg.' }; return null; } })],
              [dp(sh.hi) + 'm', dp(sh.lo) + 'n', n(C)], t(dp(sh.hi) + 'm') + ', ' + t(dp(sh.lo) + 'n') + ', ' + t(n(C)) + ' kg',
              sh.hi + '% fertilizer: ' + t('m') + ' | ' + t(dp(sh.hi)) + ' | ' + t(dp(sh.hi) + 'm') + '<br>' + sh.lo + '% fertilizer: ' + t('n') + ' | ' + t(dp(sh.lo)) + ' | ' + t(dp(sh.lo) + 'n') + '<br>Blend: ' + t(n(sh.M)) + ' | ' + t(dp(sh.c)) + ' | ' + t(dp(sh.c) + '(' + n(sh.M) + ')=' + n(C)),
              ['Nitrogen = amount × concentration (as a decimal).'], 'nitrogen table');
          } },
          { id: 'e2b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var C = rnd(sh.c * sh.M / 100);
            return sysP({ prompt: 'Write the two equations.', vars: ['m', 'n'],
              eqs: [{ tex: 'm+n=' + sh.M, name: 'amount equation', tip: 'it counts kilograms of fertilizer: ' + t('m+n=' + n(sh.M)) + '.' }, { tex: dp(sh.hi) + 'm+' + dp(sh.lo) + 'n=' + n(C), name: 'nitrogen equation', tip: 'it counts kilograms of nitrogen: the blend holds ' + t(n(C)) + ' kg.' }],
              wrongs: pctWrongs(sh.hi, sh.lo, sh.c, sh.M, 'm', 'n', 'nitrogen', 'kg'),
              sol: t('m+n=' + n(sh.M)) + ' counts kilograms of fertilizer.<br>' + t(dp(sh.hi) + 'm+' + dp(sh.lo) + 'n=' + n(C)) + ' counts kilograms of nitrogen.', hints: H_PCT, text: 'nitrogen system' });
          } },
          { id: 'e2b2', sub: 'b ii', level: 'LIM', make: function (r, sh) {
            return mcP(r, 'What does the equation ' + t(dp(sh.hi) + 'm+' + dp(sh.lo) + 'n=' + n(rnd(sh.c * sh.M / 100))) + ' count?', [
              { html: 'Kilograms of nitrogen', right: true }, { html: 'Kilograms of fertilizer', why: 'Kilograms of fertilizer are counted by ' + t('m+n=' + n(sh.M)) + '. Each term here is amount × concentration.' },
              { html: 'The percent of nitrogen in the blend', why: 'Each term is an amount times a concentration, so it is an <b>amount</b> of nitrogen, not a percent.' }, { html: 'The cost of the blend in dollars', why: 'No prices appear here — the middle column is the nitrogen concentration.' }],
              'Each term is kg of fertilizer × fraction that is nitrogen = kg of nitrogen, and ' + t(n(rnd(sh.c * sh.M / 100))) + ' kg is the nitrogen in the blend.', [], 'what the content equation counts');
          } },
          { id: 'e2c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var moreLo = sh.x > sh.y, dLo = sh.c - sh.lo, dHi = sh.hi - sh.c;
            return mcP(r, 'Without solving, which fertilizer is there more of, and why?', [
              { html: 'More of the ' + sh.lo + '% fertilizer: ' + sh.c + '% is closer to ' + sh.lo + '% than to ' + sh.hi + '%.', right: moreLo, why: sh.c + '% is ' + dLo + ' points above ' + sh.lo + '% but only ' + dHi + ' below ' + sh.hi + '% — it is closer to ' + sh.hi + '%.' },
              { html: 'More of the ' + sh.hi + '% fertilizer: ' + sh.c + '% is closer to ' + sh.hi + '% than to ' + sh.lo + '%.', right: !moreLo, why: sh.c + '% is only ' + dLo + ' points above ' + sh.lo + '% but ' + dHi + ' below ' + sh.hi + '% — it is closer to ' + sh.lo + '%.' },
              { html: 'More of the ' + sh.hi + '% fertilizer, because the stronger ingredient always dominates.', why: 'A blend leans toward whichever ingredient there is more of — look at which concentration the target is closer to.' },
              { html: 'Equal amounts, since the blend is between the two.', why: 'Equal amounts would give exactly halfway, ' + t(pc((sh.lo + sh.hi) / 2)) + '. The target isn’t halfway.' }],
              sh.c + '% is ' + dLo + ' points above ' + sh.lo + '% and ' + dHi + ' points below ' + sh.hi + '%. The blend sits nearer the ' + (moreLo ? sh.lo : sh.hi) + '% fertilizer, and a mixture always lands nearer the ingredient there is more of. <b>More of the ' + (moreLo ? sh.lo : sh.hi) + '% fertilizer</b> (solving gives ' + t('m=' + n(sh.y)) + ', ' + t('n=' + n(sh.x)) + ').', [], 'which is more');
          } },
          { id: 'e2d', sub: 'd', level: 'EMG', make: function (r, sh) {
            var C = rnd(sh.c * sh.M / 100);
            return mcP(r, 'A classmate writes ' + t(sh.hi + 'm+' + sh.lo + 'n=' + sh.c) + ' as the second equation. What is wrong with the right-hand side?', [
              { html: 'It must be an amount of nitrogen: ' + t(pc(sh.c)) + ' of ' + t(n(sh.M)) + ' kg is ' + t(n(C)) + ' kg (or ' + t(n(C * 100)) + ' in whole-number percents).', right: true },
              { html: 'It should be the total mass, ' + t(n(sh.M)) + ' kg.', why: 'The total mass belongs in the amount equation. This equation counts nitrogen.' },
              { html: 'It should be ' + t(sh.hi + '+' + sh.lo + '=' + (sh.hi + sh.lo)) + '.', why: 'Rates are never added. The right side is the nitrogen in the blend.' },
              { html: 'Nothing — ' + t(sh.c) + ' is the percent of the blend, so it is correct.', why: 'The left side adds up amounts of nitrogen, so the right side must be an amount too, not a percent.' }],
              'The left side adds up amounts of nitrogen (kg × percent), so the right side must be the nitrogen in the blend: ' + t(dp(sh.c) + '(' + n(sh.M) + ')=' + n(C)) + ' kg. With whole-number percents throughout: ' + t(sh.hi + 'm+' + sh.lo + 'n=' + n(C * 100)) + '.', [], 'error: percent on the right side');
          } }] },
      { num: '3', shared: function (r) { return r.pick(E3()); },
        stem: function (sh) { return 'A shop blends cashews worth $' + sh.hi + '/kg with peanuts worth $' + sh.lo + '/kg to make ' + t(n(sh.M)) + ' kg of a mixture worth $' + sh.c + '/kg.'; },
        parts: [
          { id: 'e3a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var V = sh.c * sh.M;
            return sysP({ prompt: 'Let ' + t('x') + ' be the kg of cashews and ' + t('y') + ' the kg of peanuts. Write the amount equation and the value equation.', vars: ['x', 'y'],
              eqs: [{ tex: 'x+y=' + sh.M, name: 'amount equation', tip: 'the masses add to ' + t(n(sh.M)) + ' kg.' }, { tex: sh.hi + 'x+' + sh.lo + 'y=' + V, name: 'value equation', tip: 'the values add to the value of the mixture: ' + t(sh.c + '(' + n(sh.M) + ')=' + n(V)) + ' dollars.' }],
              wrongs: [{ is: sh.hi + 'x+' + sh.lo + 'y=' + sh.c, code: 'mix-content-rhs', hint: 'The right side must be the <b>total value</b> of the mixture: ' + t(n(sh.M)) + ' kg at $' + sh.c + '/kg is ' + money(V) + '.' }, { is: sh.hi + 'x+' + sh.lo + 'y=' + sh.M, code: 'mix-value-rhs', hint: 'The value equation adds dollars: its right side is ' + money(V) + ', not the mass.' }, { is: sh.lo + 'x+' + sh.hi + 'y=' + V, code: 'mix-rates-swapped', hint: t('x') + ' is the cashews, at $' + sh.hi + '/kg.' }],
              sol: 'Cashews: ' + t('x') + ' | ' + t(sh.hi) + ' | ' + t(sh.hi + 'x') + ' &nbsp; Peanuts: ' + t('y') + ' | ' + t(sh.lo) + ' | ' + t(sh.lo + 'y') + ' &nbsp; Mixture: ' + t(n(sh.M)) + ' | ' + t(sh.c) + ' | ' + t(n(V)) + '<br>Amount: ' + t('x+y=' + n(sh.M)) + ' &nbsp; Value: ' + t(sh.hi + 'x+' + sh.lo + 'y=' + n(V)), hints: H_MIX, text: 'nut value system' });
          } },
          { id: 'e3b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var V = sh.c * sh.M;
            return amtP({ prompt: 'Solve the system: how many kg of cashews and of peanuts are in the blend?', names: ['Cashews', 'Peanuts'], units: ['kg', 'kg'], vals: [sh.y, sh.x],
              conds: [amountConds(sh.M, 'kg', 'the blend'), contentConds(sh.hi, sh.lo, String(sh.hi), String(sh.lo), V, '', 'value in dollars')],
              sol: mixSol({ X: 'x', Y: 'y', M: sh.M, r1: sh.hi, r2: sh.lo, r1t: String(sh.hi), r2t: String(sh.lo), C: V, A: sh.y, Bv: sh.x, letTxt: 'Let ' + t('x') + ' = kg of cashews, ' + t('y') + ' = kg of peanuts.', amtName: 'Amount', conName: 'Value', end: 'The blend uses ' + n(sh.y) + ' kg of cashews and ' + n(sh.x) + ' kg of peanuts.' }), hints: H_MIX, text: 'nut amounts' });
          } },
          { id: 'e3c', sub: 'c', level: 'LIM', make: function (r, sh) {
            var V = sh.c * sh.M;
            return numP('State the total value of the blend in dollars.', V, function (v) { if (near(v, sh.hi + sh.lo)) return { code: 'mix-rates-added', hint: 'Rates are never added. Value = mass × price per kg for the whole blend.' }; if (near(v, sh.c)) return { code: 'amt', hint: 'That is the price per kg. Multiply by the ' + n(sh.M) + ' kg.' }; return null; },
              t(n(sh.M) + '\\text{ kg}\\times \\$' + sh.c + '\\text{/kg}=\\$' + n(V)) + '. (Check: ' + t(sh.hi + '(' + n(sh.y) + ')+' + sh.lo + '(' + n(sh.x) + ')=' + n(V)) + ' ✓)', ['Value = amount × unit value.'], 'blend value', { before: '$' });
          } },
          { id: 'e3d', sub: 'd', level: 'EMG', make: function (r, sh) {
            return mcP(r, 'In a copper problem the third column of the table is measured in kilograms; here it is measured in dollars. Why does the <b>same</b> table still work?', [
              { html: 'Each row is amount × rate = total. With a rate in $/kg the product is dollars; with kg of copper per kg it is kg.', right: true },
              { html: 'Because dollars and kilograms are really the same kind of unit.', why: 'They aren’t — the point is that the third column is always the first times the second, whatever unit that gives.' },
              { html: 'Because the prices in the middle column add up to the mixture price.', why: 'Rates are never added: ' + t(sh.hi + '+' + sh.lo + '\\ne ' + sh.c) + '.' },
              { html: 'It doesn’t — price problems need a different method.', why: 'The method is identical: amount equation + content (value) equation.' }],
              'Both tables are built the same way: amount × rate = total. The rate here is dollars per kilogram, so the product is dollars; in a copper problem the rate is kilograms of copper per kilogram of alloy, so the product is kilograms. The table only needs the third column to be the first times the second.', [], 'why the table works');
          } }] },

      /* ---------------- Part B — one ingredient is pure ---------------- */
      { num: '4', section: 'Extra practice B — When one ingredient is pure', shared: function (r) { return r.pick(E4()); },
        stem: function (sh) { return 'A mechanic has a premixed coolant that is ' + t(pc(sh.c1)) + ' antifreeze and a drum of pure (' + t('100\\%') + ') antifreeze concentrate. He needs ' + t(n(sh.V)) + ' L of coolant that is ' + t(pc(sh.t)) + ' antifreeze.'; },
        parts: [
          { id: 'e4a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var C = rnd(sh.t * sh.V / 100);
            return sysP({ prompt: 'Let ' + t('x') + ' be the litres of ' + t(pc(sh.c1)) + ' coolant and ' + t('y') + ' the litres of pure antifreeze. Write the two equations.', vars: ['x', 'y'],
              eqs: [{ tex: 'x+y=' + sh.V, name: 'volume equation', tip: 'the volumes add to ' + t(n(sh.V)) + ' L.' }, { tex: dp(sh.c1) + 'x+y=' + n(C), show: dp(sh.c1) + 'x+1.00y=' + n(C), name: 'antifreeze equation', tip: 'pure antifreeze is all antifreeze (rate 1.00), and the batch holds ' + t(dp(sh.t) + '(' + n(sh.V) + ')=' + n(C)) + ' L.' }],
              wrongs: [{ is: dp(sh.c1) + 'x=' + n(C), code: 'mix-pure-zero', hint: 'Pure antifreeze is <b>all</b> antifreeze: its rate is ' + t('1.00') + ' (100%), not 0, so it contributes ' + t('1.00y') + '.' },
                { is: dp(sh.c1) + 'x+100y=' + n(C), code: 'mix-pct-scale', hint: 'Use decimals throughout: 100% = ' + t('1.00') + '.' },
                { is: dp(sh.c1) + 'x+y=' + dp(sh.t), code: 'mix-content-rhs', hint: 'The right side is litres of antifreeze: ' + t(dp(sh.t) + '(' + n(sh.V) + ')=' + n(C)) + '.' }],
              sol: 'Middle column: ' + t(dp(sh.c1)) + ' for the coolant, ' + t('1.00') + ' for the concentrate (it is all antifreeze).<br>Volume: ' + t('x+y=' + n(sh.V)) + '<br>Antifreeze: ' + t(dp(sh.c1) + 'x+1.00y=' + dp(sh.t) + '(' + n(sh.V) + ')=' + n(C)), hints: ['A pure ingredient is the ordinary case with a rate of 100% = 1.00.'], text: 'antifreeze system' });
          } },
          { id: 'e4b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var C = rnd(sh.t * sh.V / 100);
            return amtP({ prompt: 'Solve the system: how many litres of each does he need?', names: [sh.c1 + '% coolant', 'Pure antifreeze'], units: ['L', 'L'], vals: [sh.x, sh.y],
              conds: [amountConds(sh.V, 'L', 'the batch'), contentConds(sh.c1 / 100, 1, dp(sh.c1), '1.00', C, '\\text{ L}', 'antifreeze')],
              sol: mixSol({ X: 'x', Y: 'y', M: sh.V, r1: sh.c1 / 100, r2: 1, r1t: dp(sh.c1), r2t: '1.00', C: C, A: sh.x, Bv: sh.y, letTxt: 'Let ' + t('x') + ' = L of coolant, ' + t('y') + ' = L of pure antifreeze.', amtName: 'Volume', conName: 'Antifreeze', end: 'He needs ' + n(sh.x) + ' L of the ' + sh.c1 + '% coolant and ' + n(sh.y) + ' L of pure antifreeze.' }), hints: H_PCT, text: 'antifreeze amounts' });
          } },
          { id: 'e4c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var moreLo = sh.x > sh.y;
            return mcP(r, 'The answer is ' + t(n(sh.x)) + ' L of the ' + t(pc(sh.c1)) + ' coolant and ' + t(n(sh.y)) + ' L of pure antifreeze. Which statement checks it against the <b>context</b>?', [
              { html: 'Both amounts are positive and less than ' + n(sh.V) + ' L, and ' + sh.t + '% is nearer ' + (moreLo ? sh.c1 + '%' : '100%') + ', so there should be more of the ' + (moreLo ? 'coolant' : 'pure antifreeze') + ' — and there is.', right: true },
              { html: t(n(sh.x) + '+' + n(sh.y) + '=' + n(sh.V)) + ', so it must be right.', why: 'That checks the algebra (one equation), not the context — and a single equation can’t confirm both values.' },
              { html: 'There should be more pure antifreeze, because it is the stronger ingredient.', why: 'The mixture leans toward whichever ingredient there is more of: compare how far ' + sh.t + '% is from ' + sh.c1 + '% and from 100%.' },
              { html: 'The amounts should be equal because both ingredients contain antifreeze.', why: 'Equal amounts would give halfway, ' + t(pc((sh.c1 + 100) / 2)) + '.' }],
              'Against the context: both amounts are positive and smaller than ' + n(sh.V) + ' L; ' + sh.t + '% is ' + (sh.t - sh.c1) + ' points from ' + sh.c1 + '% and ' + (100 - sh.t) + ' points from 100%, so most of the batch should be the ' + (moreLo ? 'weaker coolant' : 'pure antifreeze') + ' — and it is.', [], 'context check');
          } }] },
      { num: '5', shared: function (r) { return r.pick(E5()); },
        stem: function (sh) { return 'A greenhouse has a fertilizer solution that is ' + t(pc(sh.s)) + ' concentrate. It must be diluted with <b>pure water</b> to produce ' + t(n(sh.V)) + ' L of a solution that is ' + t(pc(sh.t)) + ' concentrate.'; },
        parts: [
          { id: 'e5a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var C = rnd(sh.t * sh.V / 100);
            return sysP({ prompt: 'Let ' + t('x') + ' be the litres of ' + t(pc(sh.s)) + ' solution and ' + t('w') + ' the litres of water. Write the two equations. (Think about the concentration of water.)', vars: ['x', 'w'],
              eqs: [{ tex: 'x+w=' + sh.V, name: 'volume equation', tip: 'water takes up volume, so ' + t('x+w=' + n(sh.V)) + '.' }, { tex: dp(sh.s) + 'x=' + n(C), show: dp(sh.s) + 'x+0w=' + n(C), name: 'concentrate equation', tip: 'water is 0% concentrate, so only ' + t(dp(sh.s) + 'x') + ' counts: the batch holds ' + t(dp(sh.t) + '(' + n(sh.V) + ')=' + n(C)) + ' L.' }],
              wrongs: [{ is: dp(sh.s) + 'x+w=' + n(C), code: 'mix-water-one', hint: 'Pure water has <b>no</b> concentrate: its rate is 0, so it adds nothing to the concentrate equation.' }, { is: 'x=' + sh.V, code: 'mix-water-dropped', hint: 'The water still takes up volume: it belongs in the volume equation, ' + t('x+w=' + n(sh.V)) + '.' }, { is: dp(sh.s) + 'x=' + dp(sh.t), code: 'mix-content-rhs', hint: 'The right side is litres of concentrate: ' + t(dp(sh.t) + '(' + n(sh.V) + ')=' + n(C)) + '.' }],
              sol: 'Water is 0% concentrate: it brings volume but no concentrate, so its middle-column entry is 0.<br>Volume: ' + t('x+w=' + n(sh.V)) + '<br>Concentrate: ' + t(dp(sh.s) + 'x+0w=' + n(C)), hints: ['Water has a concentration too — it is 0%.'], text: 'dilution system' });
          } },
          { id: 'e5b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var C = rnd(sh.t * sh.V / 100);
            return amtP({ prompt: 'Solve the system: how much of the solution and how much water should be used?', names: [sh.s + '% solution', 'Water'], units: ['L', 'L'], vals: [sh.x, sh.w],
              conds: [amountConds(sh.V, 'L', 'the batch'), contentConds(sh.s / 100, 0, dp(sh.s), '0', C, '\\text{ L}', 'concentrate')],
              sol: 'The concentrate equation has one variable: ' + t(dp(sh.s) + 'x=' + n(C) + '\\Rightarrow x=' + n(sh.x)) + ', then ' + t('w=' + n(sh.V) + '-' + n(sh.x) + '=' + n(sh.w)) + '.<br>Check: ' + t(n(sh.x) + '+' + n(sh.w) + '=' + n(sh.V)) + ' ✓ &nbsp; ' + t(dp(sh.s) + '(' + n(sh.x) + ')+0(' + n(sh.w) + ')=' + n(C)) + ' ✓<br><b>Dilute ' + n(sh.x) + ' L of the ' + sh.s + '% solution with ' + n(sh.w) + ' L of water.</b>', hints: ['Water contributes 0 to the concentrate equation, so that equation has only ' + t('x') + ' in it.'], text: 'dilution amounts' });
          } },
          { id: 'e5d', sub: 'd', level: 'EMG', make: function (r, sh) {
            return mcP(r, 'A student objects that “water has no equation, so there is only one unknown.” Why does water belong in the <b>first</b> (volume) equation?', [
              { html: 'Water takes up volume: leaving it out would force ' + t('x=' + n(sh.V)) + ', and ' + n(sh.V) + ' L of the ' + sh.s + '% solution is still ' + sh.s + '%, not ' + sh.t + '%.', right: true },
              { html: 'It doesn’t — water only belongs in the concentrate equation.', why: 'Water is exactly the thing missing from the concentrate equation (its rate is 0). It still adds litres to the batch.' },
              { html: 'Because water has a concentration of 100%.', why: 'Pure water has <b>no</b> concentrate: its concentration is 0%.' },
              { html: 'Because every equation must contain both variables.', why: 'Not true in general — here the concentrate equation has only ' + t('x') + '. The reason is about volume.' }],
              'Water does have a concentration — it is 0 — which is why it vanishes from the concentrate equation only. It still takes up volume, so it appears in ' + t('x+w=' + n(sh.V)) + '. Without it, ' + t('x=' + n(sh.V)) + ' L of the ' + sh.s + '% solution would carry ' + t(n(rnd(sh.s * sh.V / 100))) + ' L of concentrate — the result would be ' + sh.s + '% again.', [], 'why water is in the volume equation');
          } }] },

      /* ---------------- Part C — possible? ---------------- */
      { num: '6', section: 'Extra practice C — Is the answer even possible?', shared: function (r) { return r.pick(E6()); },
        stem: function (sh) { return 'A chemistry technician has a ' + t(pc(sh.lo)) + ' solution and a ' + t(pc(sh.hi)) + ' solution of the same salt. Let ' + t('x') + ' and ' + t('y') + ' be the litres of the ' + t(pc(sh.lo)) + ' and ' + t(pc(sh.hi)) + ' solutions.'; },
        parts: [
          { id: 'e6a', sub: 'a', level: 'PRG', make: function (r, sh) {
            var C = rnd(sh.c * sh.V / 100);
            return amtP({ prompt: 'Write and solve a system for ' + t(n(sh.V)) + ' L of a ' + t(pc(sh.c)) + ' solution.', names: [sh.lo + '% solution', sh.hi + '% solution'], units: ['L', 'L'], vals: [sh.x, sh.y],
              conds: [amountConds(sh.V, 'L', 'the batch'), contentConds(sh.lo / 100, sh.hi / 100, dp(sh.lo), dp(sh.hi), C, '\\text{ L}', 'salt')],
              sol: mixSol({ X: 'x', Y: 'y', M: sh.V, r1: sh.lo / 100, r2: sh.hi / 100, r1t: dp(sh.lo), r2t: dp(sh.hi), C: C, A: sh.x, Bv: sh.y, letTxt: '', amtName: 'Volume', conName: 'Salt', end: 'Mix ' + n(sh.x) + ' L of the ' + sh.lo + '% solution with ' + n(sh.y) + ' L of the ' + sh.hi + '% solution.' }).replace(/^<br>/, ''), hints: H_PCT, text: 'salt mix inside' });
          } },
          { id: 'e6b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var C = rnd(sh.c2 * sh.V / 100);
            return amtP({ prompt: 'Now write and solve the system for ' + t(n(sh.V)) + ' L of a ' + t(pc(sh.c2)) + ' solution. Report exactly what the algebra gives you.', names: [t('x'), t('y')], units: ['L', 'L'], vals: [sh.x2, sh.y2],
              diag: function (u, v) { if (near(u, -sh.x2) && near(v, sh.y2)) return { code: 'pt-sign', hint: 'Report exactly what the algebra gives — including the sign of ' + t('x') + '.' }; return null; },
              conds: [amountConds(sh.V, 'L', 'the batch'), contentConds(sh.lo / 100, sh.hi / 100, dp(sh.lo), dp(sh.hi), C, '\\text{ L}', 'salt')],
              sol: mixSol({ X: 'x', Y: 'y', M: sh.V, r1: sh.lo / 100, r2: sh.hi / 100, r1t: dp(sh.lo), r2t: dp(sh.hi), C: C, A: sh.x2, Bv: sh.y2, letTxt: '', amtName: 'Volume', conName: 'Salt', end: 'The algebra returns ' + t('x=' + n(sh.x2)) + ' L and ' + t('y=' + n(sh.y2)) + ' L.' }).replace(/^<br>/, ''), hints: ['Solve exactly as in (a). Don’t be surprised if a value comes out negative.'], text: 'salt mix outside' });
          } },
          { id: 'e6c', sub: 'c', level: 'EMG', make: function (r, sh) {
            return mcP(r, 'For ' + t(n(sh.V)) + ' L of a ' + t(pc(sh.c2)) + ' solution, the algebra gives ' + t('x=' + n(sh.x2)) + ' L and ' + t('y=' + n(sh.y2)) + ' L. What does this mean in the context?', [
              { html: 'A ' + sh.c2 + '% solution can’t be made from these two: the algebra asks her to <b>take ' + Math.abs(sh.x2) + ' L of the ' + sh.lo + '% solution back out</b> of ' + sh.y2 + ' L of the ' + sh.hi + '% solution.', right: true },
              { html: 'Mix ' + Math.abs(sh.x2) + ' L of the ' + sh.lo + '% solution with ' + sh.y2 + ' L of the ' + sh.hi + '% solution.', why: 'That makes ' + (Math.abs(sh.x2) + sh.y2) + ' L, not ' + sh.V + ' L — and the mixture would be weaker than ' + sh.hi + '%, not stronger.' },
              { html: 'She needs ' + Math.abs(sh.x2) + ' L of water.', why: 'Water would dilute the mixture. The target is <b>stronger</b> than both solutions.' },
              { html: 'The algebra must have a mistake; negative answers never happen.', why: 'The algebra is right: a negative volume is its way of saying the recipe is impossible.' }],
              'A volume can’t be negative, and ' + sh.y2 + ' L can’t fit in a ' + sh.V + ' L batch. Read literally, the algebra asks her to remove ' + Math.abs(sh.x2) + ' L of the ' + sh.lo + '% solution — not mixing at all. ' + sh.c2 + '% is stronger than the stronger solution, so <b>it can’t be made</b>.', [], 'interpret negative');
          } },
          { id: 'e6d', sub: 'd', level: 'EMG', make: function (r, sh) {
            return amtP({ prompt: 'State the complete set of concentrations that <b>can</b> be made from these two solutions alone.', names: ['From', 'to'], units: ['%', '%'], vals: [sh.lo, sh.hi],
              swapHint: 'List the lower end first.', diag: function (u, v) { if (u > sh.lo && v < sh.hi) return { code: 'amt-cond', hint: 'You can go all the way to the ends: use only one of the solutions.' }; if (u < sh.lo || v > sh.hi) return { code: 'amt-cond', hint: 'A mixture can’t be weaker than its weakest ingredient or stronger than its strongest.' }; return null; },
              sol: 'The result is a weighted average of ' + sh.lo + '% and ' + sh.hi + '%, so it must land between them: <b>every concentration from ' + sh.lo + '% to ' + sh.hi + '% inclusive</b>. The ends use one solution only (' + sh.V + ' L of the ' + sh.lo + '% or ' + sh.V + ' L of the ' + sh.hi + '%). Since ' + sh.c2 + '% > ' + sh.hi + '%, it is out of reach.', hints: ['A mixture always lands between its two ingredients.'], text: 'possible range' });
          } }] },
      { num: '7', shared: function (r) { var c = r.pick(E7()); var targets = r.shuffle(['in', 'under', 'edge']); return Object.assign({}, c, { order: targets, under: c.lo - r.pick([2, 3]) }); },
        stem: function (sh) { return 'A fish hatchery has brine at ' + t(pc(sh.lo)) + ' and brine at ' + t(pc(sh.hi)) + '.'; },
        parts: [
          { id: 'e7a', sub: 'a–c', level: 'EMG', make: function (r, sh) {
            var val = { 'in': sh.a, under: sh.under, edge: sh.hi }, ans = { 'in': 'two', under: 'no', edge: 'one' }, L = ['a', 'b', 'c'];
            var rows = sh.order.map(function (k, i) { return { id: L[i], html: '(' + L[i] + ') ' + t(n(sh.V)) + ' L at ' + t(pc(val[k])) }; }), want = {};
            sh.order.forEach(function (k, i) { want[L[i]] = ans[k]; });
            return B.grid('For each order, decide <b>before calculating</b> whether it is possible.', rows, [{ id: 'two', html: 'Possible (both brines)' }, { id: 'one', html: 'Only with one brine' }, { id: 'no', html: 'Impossible' }], want, {
              why: function (row) { var k = sh.order[L.indexOf(row)], v = val[k]; return k === 'in' ? v + '% lies between ' + sh.lo + '% and ' + sh.hi + '%, so it needs both brines.' : k === 'under' ? v + '% is weaker than the weaker brine: nothing in the mix can dilute below ' + sh.lo + '%.' : v + '% is the stronger brine itself: ' + sh.V + ' L of it and none of the other.'; } },
              sh.order.map(function (k, i) { return '(' + L[i] + ') ' + val[k] + '%: ' + (k === 'in' ? '<b>possible</b> — between ' + sh.lo + '% and ' + sh.hi + '%.' : k === 'under' ? '<b>impossible</b> — weaker than both brines.' : '<b>only at the boundary</b> — all ' + sh.hi + '% brine, none of the other.'); }).join('<br>'), ['A mixture lands between its two ingredients, and reaches an end only if it uses one ingredient alone.'], 'possible orders');
          } },
          { id: 'e7d', sub: 'd', level: 'PRG', make: function (r, sh) {
            var C = rnd(sh.a * sh.V / 100);
            return amtP({ prompt: 'Solve the order for ' + t(n(sh.V)) + ' L at ' + t(pc(sh.a)) + '. How many litres of each brine are needed?', names: [sh.lo + '% brine', sh.hi + '% brine'], units: ['L', 'L'], vals: [sh.x, sh.y],
              conds: [amountConds(sh.V, 'L', 'the order'), contentConds(sh.lo / 100, sh.hi / 100, dp(sh.lo), dp(sh.hi), C, '\\text{ L}', 'salt')],
              sol: mixSol({ X: 'x', Y: 'y', M: sh.V, r1: sh.lo / 100, r2: sh.hi / 100, r1t: dp(sh.lo), r2t: dp(sh.hi), C: C, A: sh.x, Bv: sh.y, letTxt: 'Let ' + t('x') + ', ' + t('y') + ' = L of ' + sh.lo + '% and ' + sh.hi + '% brine.', amtName: 'Volume', conName: 'Salt', end: 'Mix ' + n(sh.x) + ' L of the ' + sh.lo + '% brine with ' + n(sh.y) + ' L of the ' + sh.hi + '% brine.' }), hints: H_PCT, text: 'brine amounts' });
          } },
          { id: 'e7e', sub: 'e', level: 'EMG', make: function (r, sh) {
            var moreHi = sh.y > sh.x, dl = sh.a - sh.lo, dh = sh.hi - sh.a, k = moreHi ? dl / dh : dh / dl;
            return mcP(r, 'The answer for ' + t(n(sh.V)) + ' L at ' + t(pc(sh.a)) + ' is ' + t(n(sh.x)) + ' L of ' + t(pc(sh.lo)) + ' brine and ' + t(n(sh.y)) + ' L of ' + t(pc(sh.hi)) + ' brine. Why does this agree with where ' + t(pc(sh.a)) + ' sits?', [
              { html: sh.a + '% is ' + dl + ' points above ' + sh.lo + '% and ' + dh + ' points below ' + sh.hi + '%, so it is ' + k + ' times as close to the ' + (moreHi ? sh.hi : sh.lo) + '% brine — and there is ' + k + ' times as much of it.', right: true },
              { html: 'The stronger brine always has the larger amount.', why: 'Not always — it depends on which end the target is closer to.' },
              { html: sh.a + '% is between the two, so the amounts should be equal.', why: 'Equal amounts give exactly halfway, ' + t(pc((sh.lo + sh.hi) / 2)) + '.' },
              { html: 'There is more of the ' + (moreHi ? sh.hi : sh.lo) + '% brine because ' + sh.a + '% is farther from it.', why: 'Backwards: a mixture lands <b>nearer</b> the ingredient there is more of.' }],
              sh.a + '% sits ' + dl + ' points above ' + sh.lo + '% and ' + dh + ' points below ' + sh.hi + '%. The mixture leans toward whichever ingredient there is more of, so the ' + (moreHi ? sh.hi : sh.lo) + '% brine should outweigh the other ' + k + ' to 1 — and ' + t(n(Math.max(sh.x, sh.y)) + '=' + k + '\\times ' + n(Math.min(sh.x, sh.y))) + ' ✓', [], 'ratio reasoning');
          } }] },

      /* ---------------- Part D — current ---------------- */
      { num: '8', section: 'Extra practice D — Moving with and against a current', shared: function (r) { return r.pick(E8()); },
        stem: function (sh) { return 'A freight barge travels ' + t(n(sh.D)) + ' km downstream in ' + hrs(sh.td) + ' and the same ' + t(n(sh.D)) + ' km back upstream in ' + hrs(sh.tu) + '. Let ' + t('b') + ' be its speed in still water and ' + t('c') + ' the speed of the current, in km/h.'; },
        parts: [
          { id: 'e8a', sub: 'a', level: 'BEG', make: function (r, sh) {
            return amtP({ prompt: 'Find the ground speed on each leg.', names: ['Downstream', 'Upstream'], units: ['km/h', 'km/h'], vals: [sh.S1, sh.S2],
              diag: function (u, v) { if (near(u, sh.D * sh.td) || near(u, sh.td / sh.D)) return { code: 'mot-dst', hint: 'Speed = distance ÷ time: ' + t('\\frac{' + n(sh.D) + '}{' + n(sh.td) + '}') + '.' }; return null; },
              swapHint: 'Downstream (with the current) is the <b>faster</b> leg, so it takes less time.',
              sol: 'Downstream: ' + t(n(sh.D) + '\\div ' + n(sh.td) + '=' + n(sh.S1)) + ' km/h. Upstream: ' + t(n(sh.D) + '\\div ' + n(sh.tu) + '=' + n(sh.S2)) + ' km/h.', hints: ['Speed = distance ÷ time.'], text: 'ground speeds' });
          } },
          { id: 'e8a2', sub: 'a ii', level: 'EMG', make: function (r, sh) {
            return sysP({ prompt: 'Write a system in ' + t('b') + ' and ' + t('c') + '.', vars: ['b', 'c'],
              eqs: [{ tex: 'b+c=' + sh.S1, name: 'downstream equation', tip: 'with the current the speed is ' + t('b+c') + ' = ' + t(n(sh.D) + '\\div ' + n(sh.td)) + '.' }, { tex: 'b-c=' + sh.S2, name: 'upstream equation', tip: 'against the current the speed is ' + t('b-c') + ' = ' + t(n(sh.D) + '\\div ' + n(sh.tu)) + '.' }],
              wrongs: [{ is: 'b+c=' + sh.S2, code: 'mot-legs-swapped', hint: 'Downstream the current helps: ' + t('b+c') + ' is the <b>faster</b> speed, ' + t(n(sh.S1)) + ' km/h.' }, { is: 'b-c=' + sh.S1, code: 'mot-legs-swapped', hint: 'Upstream the current hinders: ' + t('b-c') + ' is the <b>slower</b> speed, ' + t(n(sh.S2)) + ' km/h.' }],
              good: [[n(sh.td) + '(b+c)=' + sh.D, n(sh.tu) + '(b-c)=' + sh.D]],
              sol: t('b+c=' + n(sh.S1)) + ' (downstream) and ' + t('b-c=' + n(sh.S2)) + ' (upstream).', hints: H_STREAM, text: 'barge system' });
          } },
          { id: 'e8b', sub: 'b', level: 'PRG', make: function (r, sh) {
            return amtP({ prompt: 'Solve the system: find the barge’s speed in still water and the speed of the current.', names: ['Still water ' + t('b'), 'Current ' + t('c')], units: ['km/h', 'km/h'], vals: [sh.b, sh.c],
              diag: function (u, v) { if (near(u, sh.S1) || near(u, sh.S2)) return { code: 'mot-ground', hint: 'That is a ground speed. The still-water speed is halfway between the two ground speeds.' }; if (near(v, sh.S1 - sh.S2)) return { code: 'mot-not-halved', hint: 'Subtracting gives ' + t('2c=' + n(sh.S1 - sh.S2)) + ' — divide by 2.' }; return null; },
              conds: [{ f: function (u, v) { return u + v; }, v: sh.S1, code: 'amt-cond', hint: function (g) { return 'Check downstream: ' + t('b+c') + ' should be ' + t(n(sh.D) + '\\div ' + n(sh.td) + '=' + n(sh.S1)) + ', but yours is ' + t(n(rnd(g))) + '.'; } }, { f: function (u, v) { return u - v; }, v: sh.S2, code: 'amt-cond', hint: function (g) { return 'Check upstream: ' + t('b-c') + ' should be ' + t(n(sh.S2)) + ', but yours is ' + t(n(rnd(g))) + '.'; } }],
              sol: bcSol({ b: 'b', c: 'c', S1: sh.S1, S2: sh.S2, l1: 'Downstream: ' + t('b+c=' + n(sh.D) + '\\div ' + n(sh.td) + '=' + n(sh.S1)), l2: 'Upstream: ' + t('b-c=' + n(sh.D) + '\\div ' + n(sh.tu) + '=' + n(sh.S2)), end: 'The barge travels at ' + sh.b + ' km/h in still water and the current runs at ' + sh.c + ' km/h.' }), hints: H_STREAM, text: 'barge speeds' });
          } },
          { id: 'e8c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var x = sh.D / sh.b;
            return hoursP('The barge’s speed in still water is ' + t(n(sh.b)) + ' km/h. How long would the ' + t(n(sh.D)) + ' km take on still water?' + (isInt(x * 100) ? '' : ' (Nearest hundredth of an hour.)'), x, function (v) {
              if (near(v, (sh.td + sh.tu) / 2)) return { code: 'mot-avg-time', hint: 'The still-water time isn’t the average of the two times. Use time = distance ÷ still-water speed.' };
              if (near(v, sh.b / sh.D) || near(v, sh.b * sh.D)) return { code: 'mot-dst', hint: 'Time = distance ÷ speed.' }; return null; },
              t(n(sh.D) + '\\div ' + n(sh.b) + (isInt(x * 100) ? '=' + n(rnd(x)) : '\\approx ' + K.roundTo(x, 2).toFixed(2))) + ' h — between the ' + hrs(sh.td) + ' downstream and the ' + hrs(sh.tu) + ' upstream, where it must fall.', ['Time = distance ÷ speed.'], 'still-water time');
          } }] },
      { num: '9', shared: function (r) { return r.pick(E9()); },
        stem: function (sh) { return 'A cargo plane flies ' + t(n(sh.D)) + ' km with a steady tailwind in ' + hrs(sh.tw) + '. It returns the same ' + t(n(sh.D)) + ' km against that same wind in ' + hrs(sh.ta) + '. Let ' + t('p') + ' be the plane’s speed in still air and ' + t('w') + ' the wind speed, both in km/h.'; },
        parts: [
          { id: 'e9a', sub: 'a', level: 'PRG', make: function (r, sh) {
            return sysP({ prompt: 'Write the two equations using distance = speed × time.', vars: ['p', 'w'],
              eqs: [{ tex: n(sh.tw) + '(p+w)=' + sh.D, name: 'tailwind equation', tip: 'with the wind the ground speed is ' + t('p+w') + ', for ' + hrs(sh.tw) + '.' }, { tex: n(sh.ta) + '(p-w)=' + sh.D, name: 'headwind equation', tip: 'against the wind the ground speed is ' + t('p-w') + ', for ' + hrs(sh.ta) + '.' }],
              wrongs: [{ is: n(sh.tw) + '(p-w)=' + sh.D, code: 'mot-legs-swapped', hint: 'The ' + hrs(sh.tw) + ' trip is with the wind, the faster one: its ground speed is ' + t('p+w') + '.' }, { is: n(sh.ta) + '(p+w)=' + sh.D, code: 'mot-legs-swapped', hint: 'The ' + hrs(sh.ta) + ' trip is against the wind: ground speed ' + t('p-w') + '.' }, { is: 'p+w=' + n(sh.D * sh.tw), code: 'mot-dst', hint: 'Distance = speed × time, so speed = distance ÷ time: ' + t('p+w=\\frac{' + n(sh.D) + '}{' + n(sh.tw) + '}') + '.' }],
              good: [['p+w=' + sh.S1, 'p-w=' + sh.S2]],
              sol: t(n(sh.tw) + '(p+w)=' + n(sh.D)) + ' &nbsp; ' + t(n(sh.ta) + '(p-w)=' + n(sh.D)), hints: ['With the wind the ground speed is ' + t('p+w') + '; against it, ' + t('p-w') + '.'], text: 'cargo plane system' });
          } },
          { id: 'e9b', sub: 'b', level: 'ADV', make: function (r, sh) {
            return amtP({ prompt: 'Solve the system: find the plane’s speed in still air and the wind speed.', names: ['Still air ' + t('p'), 'Wind ' + t('w')], units: ['km/h', 'km/h'], vals: [sh.p, sh.w],
              diag: function (u, v) { if (near(u, sh.S1) || near(u, sh.S2)) return { code: 'mot-ground', hint: 'That is a ground speed (distance ÷ time). Solve ' + t('p+w=' + n(sh.S1)) + ', ' + t('p-w=' + n(sh.S2)) + '.' }; if (near(v, sh.S1 - sh.S2)) return { code: 'mot-not-halved', hint: 'Subtracting gives ' + t('2w=' + n(sh.S1 - sh.S2)) + ' — divide by 2.' }; return null; },
              conds: [{ f: function (u, v) { return u + v; }, v: sh.S1, code: 'amt-cond', hint: function (g) { return 'Check: ' + t('p+w') + ' should be ' + t(n(sh.D) + '\\div ' + n(sh.tw) + '=' + n(sh.S1)) + '.'; } }, { f: function (u, v) { return u - v; }, v: sh.S2, code: 'amt-cond', hint: function () { return 'Check: ' + t('p-w') + ' should be ' + t(n(sh.D) + '\\div ' + n(sh.ta) + '=' + n(sh.S2)) + '.'; } }],
              sol: bcSol({ b: 'p', c: 'w', S1: sh.S1, S2: sh.S2, l1: 'Divide each equation by its time: ' + t('p+w=' + n(sh.S1)), l2: t('p-w=' + n(sh.S2)), end: 'The plane flies at ' + sh.p + ' km/h in still air and the wind blows at ' + sh.w + ' km/h.' }), hints: ['Divide each equation by its time, then add the equations.'], text: 'cargo plane speeds' });
          } },
          { id: 'e9c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var nw = 2 * sh.D / sh.p;
            return mcP(r, 'The plane’s still-air speed is ' + t(n(sh.p)) + ' km/h and the wind is ' + t(n(sh.w)) + ' km/h. Why does the round trip take longer than it would with no wind at all, even though the wind helps on one leg?', [
              { html: 'The plane spends longer on the slow leg (' + hrs(sh.ta) + ') than on the fast one (' + hrs(sh.tw) + '), so the time lost against the wind is more than the time gained with it.', right: true },
              { html: 'It doesn’t: the wind’s help and hindrance cancel, so the times are equal.', why: 'Check: with no wind, ' + t('2\\times ' + n(sh.D) + '\\div ' + n(sh.p) + '\\approx ' + K.roundTo(nw, 2).toFixed(2)) + ' h, but the trip took ' + t(n(sh.tw + sh.ta)) + ' h.' },
              { html: 'Because the wind makes the distance longer on the way back.', why: 'The distance is the same both ways: ' + t(n(sh.D)) + ' km.' },
              { html: 'Because the wind speed is subtracted twice.', why: 'It is added on one leg and subtracted on the other — the speeds average out, but the <b>times</b> don’t.' }],
              'With no wind: ' + t('2\\times ' + n(sh.D) + '\\div ' + n(sh.p) + '\\approx ' + K.roundTo(nw, 2).toFixed(2)) + ' h; with the wind: ' + t(n(sh.tw) + '+' + n(sh.ta) + '=' + n(sh.tw + sh.ta)) + ' h. The plane spends <b>longer</b> on the slow leg than on the fast one, so the time lost fighting the wind is more than the time gained riding it.', [], 'why the round trip is longer');
          } }] },
      { num: '10', shared: function (r) {
          var a = r.pick(E10()), b = r.pick(E10B()), yes = r.int(0, 1) === 1, all = [0.1, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.8, 1, 1.2, 1.5, 2];
          var opts = all.filter(function (s) { return yes ? s * 1000 >= b.x : s * 1000 < b.x; });   // (b ii): “yes” and “no” about equally often
          return { a: a, b: b, shelf: r.pick(opts.length ? opts : all) }; },
        stem: 'In each part the numbers arrive in mismatched units. Reconcile the units <b>first</b>, then build and solve the system.',
        parts: [
          { id: 'e10a', sub: 'a i', level: 'ADV', make: function (r, sh) {
            var c = sh.a, s1 = [c.D, 60 * c.td], s2 = [c.D, 60 * c.tu], bq = [5 * c.bk, 18], cq = [5 * c.ck, 18], gb = gcd(bq[0], bq[1]), gc = gcd(cq[0], cq[1]);
            bq = [bq[0] / gb, bq[1] / gb]; cq = [cq[0] / gc, cq[1] / gc];
            var fT = function (q) { return q[1] === 1 ? String(q[0]) : '\\frac{' + q[0] + '}{' + q[1] + '}'; }, rT = function (p, q) { var g = gcd(p, q); return fT([p / g, q / g]); };
            return amtP({ prompt: 'A rowing shell covers ' + t(n(c.D)) + ' m downstream in ' + c.td + ' minutes and ' + t(n(c.D)) + ' m upstream in ' + c.tu + ' minutes. Find the shell’s speed in still water and the speed of the current in <b>m/s, as exact fractions</b>.', names: ['Still water ' + t('b'), 'Current ' + t('c')], units: ['m/s', 'm/s'], vals: [c.bk / 3.6, c.ck / 3.6], math: true, exact: true, keyTex: [fT(bq), fT(cq)], key: [fT(bq), fT(cq)],
              diag: function (u, v) { if (near(u, c.bk) && near(v, c.ck)) return { code: 'mot-units', hint: 'Those are km/h. This part asks for <b>m/s</b>.' }; if (near(u, c.D / c.td / 2 + c.D / c.tu / 2)) return { code: 'mot-minutes', hint: 'Convert the minutes to seconds first: ' + c.td + ' min = ' + (60 * c.td) + ' s.' }; return null; },
              conds: [{ f: function (u, v) { return u + v; }, v: c.D / (60 * c.td), code: 'amt-cond', hint: function () { return 'Check: ' + t('b+c') + ' should be ' + t(n(c.D) + '\\div ' + (60 * c.td) + '=' + rT(s1[0], s1[1])) + ' m/s.'; } }, { f: function (u, v) { return u - v; }, v: c.D / (60 * c.tu), code: 'amt-cond', hint: function () { return 'Check: ' + t('b-c') + ' should be ' + t(n(c.D) + '\\div ' + (60 * c.tu) + '=' + rT(s2[0], s2[1])) + ' m/s.'; } }],
              sol: t(c.td + '\\text{ min}=' + (60 * c.td) + '\\text{ s}') + ', ' + t(c.tu + '\\text{ min}=' + (60 * c.tu) + '\\text{ s}') + '.<br>Downstream: ' + t('b+c=' + n(c.D) + '\\div ' + (60 * c.td) + '=' + rT(s1[0], s1[1])) + ' &nbsp; Upstream: ' + t('b-c=' + n(c.D) + '\\div ' + (60 * c.tu) + '=' + rT(s2[0], s2[1])) +
                '<br>Add: ' + t('2b=' + rT(c.bk * 10, 18)) + ' so ' + t('b=' + fT(bq)) + ' m/s; then ' + t('c=' + rT(s1[0], s1[1]) + '-' + fT(bq) + '=' + fT(cq)) + ' m/s.', hints: ['Change the minutes to seconds first, then speed = distance ÷ time in m/s.', 'Add the two equations to find ' + t('b') + '; keep the fractions exact.'], text: 'shell m/s' });
          } },
          { id: 'e10a2', sub: 'a ii', level: 'PRG', make: function (r, sh) {
            var c = sh.a;
            return amtP({ prompt: 'A rowing shell covers ' + t(n(c.D)) + ' m downstream in ' + c.td + ' minutes and ' + t(n(c.D)) + ' m upstream in ' + c.tu + ' minutes. Give the shell’s speed in still water and the speed of the current in <b>km/h</b>.', names: ['Still water ' + t('b'), 'Current ' + t('c')], units: ['km/h', 'km/h'], vals: [c.bk, c.ck],
              diag: function (u, v) { if (near(u, c.bk / 3.6) && near(v, c.ck / 3.6)) return { code: 'mot-units', hint: 'Those are m/s. Convert to km/h: multiply by 3.6.' }; if (near(u, c.bk / 12.96) || near(u, c.bk / 3.6 / 3.6)) return { code: 'mot-convert', hint: 'To change m/s to km/h, <b>multiply</b> by 3.6.' }; return null; },
              conds: [{ f: function (u, v) { return u + v; }, v: c.bk + c.ck, code: 'amt-cond', hint: function () { return 'Check: downstream ' + t(n(c.D) + '\\text{ m in }' + c.td + '\\text{ min}') + ' is ' + t(n(c.D / 1000) + '\\text{ km in }' + frac60(c.td) + '\\text{ h}=' + (c.bk + c.ck)) + ' km/h ' + t('=b+c') + '.'; } }, { f: function (u, v) { return u - v; }, v: c.bk - c.ck, code: 'amt-cond', hint: function () { return 'Check: upstream is ' + t((c.bk - c.ck) + '\\text{ km/h}=b-c') + '.'; } }],
              sol: 'In km/h: downstream ' + t(n(c.D / 1000) + '\\text{ km}\\div ' + frac60(c.td) + '\\text{ h}=' + (c.bk + c.ck)) + ', upstream ' + t(n(c.D / 1000) + '\\div ' + frac60(c.tu) + '=' + (c.bk - c.ck)) + '.<br>' + t('b+c=' + (c.bk + c.ck)) + ', ' + t('b-c=' + (c.bk - c.ck)) + ' ⇒ ' + t('b=' + c.bk) + ', ' + t('c=' + c.ck) + '.<br>(Or convert the m/s answers: ' + t('\\times 3.6') + '.)<br><b>Still water ' + c.bk + ' km/h; current ' + c.ck + ' km/h.</b>', hints: ['Either work in km and hours from the start, or find the speeds in m/s and multiply by 3.6.'], text: 'shell km/h' });
          } },
          { id: 'e10b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var c = sh.b, C = rnd(c.c * c.M / 100);
            return amtP({ prompt: 'A technician has a ' + t(pc(c.lo)) + ' hydrogen peroxide solution and a ' + t(pc(c.hi)) + ' solution. She needs ' + t(n(c.M)) + ' mL of a ' + t(pc(c.c)) + ' solution. Find the volume of each solution required.', names: [c.lo + '% solution', c.hi + '% solution'], units: ['mL', 'mL'], vals: [c.x, c.y],
              diag: function (u, v) { if (near(u * 1000, c.x) && near(v * 1000, c.y)) return { form: true, code: 'mot-units', hint: 'Give the volumes in <b>mL</b>.' }; return null; },
              conds: [amountConds(c.M, 'mL', 'the order'), contentConds(c.lo / 100, c.hi / 100, dp(c.lo), dp(c.hi), C, '\\text{ mL}', 'peroxide')],
              sol: mixSol({ X: 'x', Y: 'y', M: c.M, r1: c.lo / 100, r2: c.hi / 100, r1t: dp(c.lo), r2t: dp(c.hi), C: C, A: c.x, Bv: c.y, letTxt: 'Let ' + t('x') + ', ' + t('y') + ' = mL of the ' + c.lo + '% and ' + c.hi + '% solutions.', amtName: 'Volume', conName: 'Peroxide', end: 'She needs ' + n(c.x) + ' mL of the ' + c.lo + '% solution and ' + n(c.y) + ' mL of the ' + c.hi + '% solution.' }), hints: H_PCT, text: 'peroxide amounts' });
          } },
          { id: 'e10b2', sub: 'b ii', level: 'BEG', make: function (r, sh) {
            var c = sh.b, mL = Math.round(sh.shelf * 1000), yes = mL >= c.x;
            return ynP(r, 'The ' + t(n(c.M)) + ' mL order needs ' + t(n(c.x)) + ' mL of the ' + t(pc(c.lo)) + ' solution, and she has only ' + t(n(sh.shelf)) + ' L of it on the shelf. Can the order be filled?', yes,
              t(n(sh.shelf)) + ' L = ' + t(n(mL)) + ' mL, which is enough for ' + t(n(c.x)) + ' mL. Convert before comparing.', t(n(sh.shelf)) + ' L is only ' + t(n(mL)) + ' mL — less than the ' + t(n(c.x)) + ' mL needed. Convert before comparing.',
              t(n(sh.shelf) + '\\text{ L}=' + n(mL) + '\\text{ mL}') + (yes ? ' ≥ ' : ' < ') + t(n(c.x) + '\\text{ mL}') + ', so the order <b>' + (yes ? 'can' : 'cannot') + '</b> be filled.', ['1 L = 1000 mL.'], 'can the order be filled');
          } },
          { id: 'e10c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var c = sh.a, cw = (c.D / c.td - c.D / c.tu) / 2, exact = isInt(cw * 100);   // cw = 50·ck/3: exact only when ck is a multiple of 3
            var fr = function (p, q) { var g = gcd(p, q); p /= g; q /= g; return q === 1 ? String(p) : '\\frac{' + p + '}{' + q + '}'; };
            var cwT = exact ? n(rnd(cw)) : fr(c.D * (c.tu - c.td), 2 * c.td * c.tu) + '\\approx ' + K.roundTo(cw, 1).toFixed(1);
            var dg = function (v) { if (near(v, 2 * cw) || near(v, K.roundTo(2 * cw, 1))) return { code: 'mot-not-halved', hint: 'Subtracting gives ' + t('2c') + ' — divide by 2.' }; if (near(v, c.ck)) return { code: 'mot-other', hint: 'That is the real current in km/h. Redo the calculation with ' + c.td + ' and ' + c.tu + ' as hours.' }; return null; };
            var pr = 'In the rowing problem (' + t(n(c.D)) + ' m downstream in ' + c.td + ' min, upstream in ' + c.tu + ' min), suppose ' + t(c.td) + ' and ' + t(c.tu) + ' had been used as though they were <b>hours</b>. What would the current have come out to, in metres per hour?' + (exact ? '' : ' (Nearest tenth.)');
            var sol = 'Treating them as hours: ' + t('b+c=' + n(c.D) + '\\div ' + c.td + '=' + fr(c.D, c.td)) + ' m/h and ' + t('b-c=' + n(c.D) + '\\div ' + c.tu + '=' + fr(c.D, c.tu)) + ' m/h, so ' + t('c=' + cwT) + ' m/h ' + t((exact ? '=' : '\\approx ') + (exact ? n(rnd(cw / 1000)) : K.roundTo(cw / 1000, 3).toFixed(3))) + ' km/h — sixty times smaller than the real ' + c.ck + ' km/h, far too slow for any river. The minutes had to be converted first.';
            var hs = ['Find ' + t('b+c') + ' and ' + t('b-c') + ' using the numbers as hours, then solve for ' + t('c') + '.'];
            if (exact) return numP(pr, rnd(cw), dg, sol, hs, 'units trap', { after: 'm/h' });
            var p = B.approx(pr, cw, 1, { after: 'm/h', diag: dg }, sol, hs, 'units trap');
            p.answer = t(K.roundTo(cw, 1).toFixed(1)) + ' m/h'; return p;
          } }] },

      /* ---------------- Part E — two-leg journeys ---------------- */
      { num: '11', section: 'Extra practice E — Two-leg journeys', shared: function (r) { var c = r.pick(E11()); return Object.assign({}, c, { stop: r.pick([10, 15, 20, 30]) }); },
        stem: function (sh) { return 'A driver covers ' + t(n(sh.D)) + ' km between two towns, part of it on gravel at ' + t(sh.sg) + ' km/h and the rest on pavement at ' + t(sh.sp) + ' km/h. The trip takes ' + hm(Math.round(sh.T * 60) + sh.stop) + ' in total, including one ' + sh.stop + '-minute stop.'; },
        parts: [
          { id: 'e11a', sub: 'a', level: 'BEG', make: function (r, sh) {
            var tot = Math.round(sh.T * 60) + sh.stop, wrongHm = Math.floor(sh.T) + (Math.round(sh.T * 60) % 60) / 100;
            return numP('Find the total <b>driving</b> time in hours.', sh.T, function (v) {
              if (near(v, rnd(tot / 60)) || near(v, K.roundTo(tot / 60, 2)) || near(v, K.roundTo(tot / 60, 1))) return { code: 'mot-stops', hint: 'Stopped time is not driving time: subtract the ' + sh.stop + '-minute stop first.' };
              if (!isInt(sh.T) && near(v, wrongHm)) return { code: 'mot-hm', hint: hm(Math.round(sh.T * 60)) + ' is not ' + t(n(wrongHm)) + ' h: ' + (Math.round(sh.T * 60) % 60) + ' min is ' + t(frac60(Math.round(sh.T * 60) % 60)) + ' of an hour.' };
              return null; }, t(hm(tot).replace(/ /g, '\\ ')) + ' = ' + tot + ' min. Remove the ' + sh.stop + '-minute stop: ' + (tot - sh.stop) + ' min of driving ' + t('=' + n(sh.T)) + ' h.', ['Change the total to minutes, subtract the stop, then divide by 60.'], 'driving time', { after: 'h' });
          } },
          { id: 'e11a2', sub: 'a ii', level: 'PRG', make: function (r, sh) {
            var tot = rnd((Math.round(sh.T * 60) + sh.stop) / 60);
            return sysP({ prompt: 'Write a system in ' + t('g') + ' (hours on gravel) and ' + t('p') + ' (hours on pavement).', vars: ['g', 'p'],
              eqs: [{ tex: 'g+p=' + n(sh.T), name: 'time equation', tip: 'the driving times add to the driving time, ' + t(n(sh.T)) + ' h (the stop removed).' }, { tex: sh.sg + 'g+' + sh.sp + 'p=' + sh.D, name: 'distance equation', tip: 'distance = speed × time on each surface, adding to ' + t(n(sh.D)) + ' km.' }],
              wrongs: [{ is: 'g+p=' + frac60(Math.round(sh.T * 60) + sh.stop), code: 'mot-stops', hint: 'Stopped time is not driving time: the times add to ' + t(n(sh.T)) + ' h, not the whole trip.' }, { is: 'g+p=' + K.roundTo(tot, 2), code: 'mot-stops', hint: 'Stopped time is not driving time: the times add to ' + t(n(sh.T)) + ' h, not the whole trip.' }, { is: 'g+p=' + tot, code: 'mot-stops', hint: 'Stopped time is not driving time: the times add to ' + t(n(sh.T)) + ' h, not the whole trip.' }, { is: sh.sp + 'g+' + sh.sg + 'p=' + sh.D, code: 'mot-speeds-swapped', hint: t('g') + ' is the time on gravel, at ' + sh.sg + ' km/h.' }, { is: 'g+p=' + sh.D, code: 'mot-dst', hint: t('g') + ' and ' + t('p') + ' are times; the distances are ' + t(sh.sg + 'g') + ' and ' + t(sh.sp + 'p') + '.' }],
              sol: 'Driving time: ' + t(n(sh.T)) + ' h.<br>Time: ' + t('g+p=' + n(sh.T)) + ' &nbsp; Distance: ' + t(sh.sg + 'g+' + sh.sp + 'p=' + n(sh.D)), hints: ['Subtract the stop before writing the time equation.', 'Distance = speed × time on each surface.'], text: 'gravel/pavement system' });
          } },
          { id: 'e11b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var k = rnd(sh.sg * sh.T), rhs = rnd(sh.D - k);
            return amtP({ prompt: 'Solve the system: how many hours were spent on each surface?', names: ['Gravel ' + t('g'), 'Pavement ' + t('p')], units: ['h', 'h'], vals: [sh.g, sh.p],
              conds: [{ f: function (u, v) { return u + v; }, v: sh.T, code: 'amt-total', hint: function (g) { return 'Your times add to ' + t(n(rnd(g))) + ' h, but the driving time is ' + t(n(sh.T)) + ' h (the stop removed).'; } }, { f: function (u, v) { return sh.sg * u + sh.sp * v; }, v: sh.D, code: 'amt-value', hint: function (g) { return 'Your times give ' + t(n(rnd(g))) + ' km, not ' + t(n(sh.D)) + ' km.'; } }],
              sol: 'From the time equation, ' + t('g=' + n(sh.T) + '-p') + ':<br>' + t(sh.sg + '(' + n(sh.T) + '-p)+' + sh.sp + 'p=' + n(sh.D) + '\\Rightarrow ' + n(k) + '+' + (sh.sp - sh.sg) + 'p=' + n(sh.D) + '\\Rightarrow p=' + n(sh.p)) + ', so ' + t('g=' + n(sh.g)) + '.<br>Check: ' + t(n(sh.g) + '+' + n(sh.p) + '=' + n(sh.T)) + ' ✓ &nbsp; ' + t(sh.sg + '(' + n(sh.g) + ')+' + sh.sp + '(' + n(sh.p) + ')=' + n(sh.D)) + ' ✓', hints: ['Driving time ' + t(n(sh.T)) + ' h. Time: ' + t('g+p') + '; distance: ' + t(sh.sg + 'g+' + sh.sp + 'p') + '.'], text: 'surface times' });
          } },
          { id: 'e11c', sub: 'c', level: 'BEG', make: function (r, sh) {
            return amtP({ prompt: 'The driver spent ' + t(n(sh.g)) + ' h on gravel and ' + t(n(sh.p)) + ' h on pavement. State the distance travelled on each surface.', names: ['Gravel', 'Pavement'], units: ['km', 'km'], vals: [rnd(sh.sg * sh.g), rnd(sh.sp * sh.p)],
              conds: [{ f: function (u, v) { return u + v; }, v: sh.D, code: 'amt-total', hint: function (g) { return 'The distances must add to ' + t(n(sh.D)) + ' km; yours add to ' + t(n(rnd(g))) + '.'; } }],
              sol: t(sh.sg + '(' + n(sh.g) + ')=' + n(rnd(sh.sg * sh.g))) + ' km and ' + t(sh.sp + '(' + n(sh.p) + ')=' + n(rnd(sh.sp * sh.p))) + ' km — they add to ' + t(n(sh.D)) + ' km ✓<br><b>' + n(rnd(sh.sg * sh.g)) + ' km on gravel and ' + n(rnd(sh.sp * sh.p)) + ' km on pavement.</b>', hints: ['Distance = speed × time.'], text: 'surface distances' });
          } }] },
      { num: '12', shared: function (r) { var c = r.pick(E12()); return Object.assign({}, c, { start: r.pick([6 * 60, 6 * 60 + 30, 7 * 60, 7 * 60 + 30, 8 * 60]) }); },
        stem: function (sh) { return 'A cyclist leaves a trailhead at ' + clock(sh.start) + ' riding at a steady ' + t(sh.v1) + ' km/h. A support car leaves the same trailhead along the same route at ' + clock(sh.start + Math.round(sh.h * 60)) + ' travelling at ' + t(sh.v2) + ' km/h. Let ' + t('t') + ' be the hours since ' + clock(sh.start) + ' and ' + t('d') + ' the distance from the trailhead in km.'; },
        parts: [
          { id: 'e12a', sub: 'a', level: 'PRG', make: function (r, sh) {
            return sysP({ prompt: 'Write one equation for each vehicle.', vars: ['t', 'd'], labels: ['Cyclist', 'Car'],
              eqs: [{ tex: 'd=' + sh.v1 + 't', name: 'cyclist’s equation', tip: 'the cyclist has ridden ' + t('t') + ' hours at ' + sh.v1 + ' km/h.' }, { tex: 'd=' + sh.v2 + '(t-' + n(sh.h) + ')', name: 'car’s equation', tip: 'the car leaves ' + hrs(sh.h) + ' later, so it has been moving for ' + t('t-' + n(sh.h)) + ' hours.' }],
              wrongs: [{ is: 'd=' + sh.v2 + 't', code: 'mot-head-start', hint: 'The car leaves ' + hrs(sh.h) + ' later: after ' + t('t') + ' hours it has driven only ' + t('t-' + n(sh.h)) + ' hours.' }, { is: 'd=' + sh.v2 + '(t+' + n(sh.h) + ')', code: 'mot-delay-sign', hint: 'The car has been driving for <b>less</b> time than the cyclist: ' + t('t-' + n(sh.h)) + ', not ' + t('t+' + n(sh.h)) + '.' }],
              sol: 'Cyclist: ' + t('d=' + sh.v1 + 't') + '<br>Car: ' + t('d=' + sh.v2 + '(t-' + n(sh.h) + ')') + ' — it has been moving ' + hrs(sh.h) + ' less than the cyclist.', hints: ['Distance = speed × (time moving). How long has the car been moving after ' + t('t') + ' hours?'], text: 'catch-up system' });
          } },
          { id: 'e12b', sub: 'b', level: 'PRG', make: function (r, sh) {
            var pp = B.point('Solve the system ' + t('d=' + sh.v1 + 't') + ', ' + t('d=' + sh.v2 + '(t-' + n(sh.h) + ')') + '. Give the solution as ' + t('(t,\\ d)') + '.', [sh.t, sh.d], { vars: ['t', 'd'], system: [[sh.v1, -1, 0], [sh.v2, -1, -sh.v2 * sh.h]], wrong: [{ is: [sh.d, sh.t], code: 'pt-swap', hint: 'Write ' + t('t') + ' first: ' + t('(t,\\ d)') + '.' }] },
              'Set the two expressions for ' + t('d') + ' equal: ' + t(sh.v1 + 't=' + sh.v2 + '(t-' + n(sh.h) + ')\\Rightarrow ' + sh.v1 + 't=' + sh.v2 + 't-' + n(rnd(sh.v2 * sh.h)) + '\\Rightarrow ' + (sh.v2 - sh.v1) + 't=' + n(rnd(sh.v2 * sh.h)) + '\\Rightarrow t=' + n(sh.t)) + '<br>' + t('d=' + sh.v1 + '(' + n(sh.t) + ')=' + n(sh.d)) + '. Check: ' + t(sh.v2 + '(' + n(sh.t) + '-' + n(sh.h) + ')=' + sh.v2 + '(' + n(rnd(sh.t - sh.h)) + ')=' + n(sh.d)) + ' ✓<br><b>' + t('(' + n(sh.t) + ',\\ ' + n(sh.d) + ')') + '</b>', ['Substitute: both equations are solved for ' + t('d') + ', so set them equal.'], 'catch-up point');
            pp.key = '(' + s(sh.t) + ', ' + s(sh.d) + ')'; pp.answer = t('(' + n(sh.t) + ',\\ ' + n(sh.d) + ')'); return pp;
          } },
          { id: 'e12c', sub: 'c', level: 'EMG', make: function (r, sh) {
            var cm = sh.start + Math.round(sh.t * 60), H = Math.floor(cm / 60), Mi = cm % 60, H12 = H % 12 === 0 ? 12 : H % 12, frac = Math.round((sh.t % 1) * 100);
            var o = { prompt: 'The solution of the system is ' + t('t=' + n(sh.t)) + ', ' + t('d=' + n(sh.d)) + '. At what time of day does the car catch the cyclist, and how far along the route?', names: ['Clock time: hour', 'minutes', 'Distance'], units: ['', H >= 12 ? 'p.m.' : 'a.m.', 'km'], vals: [H12, Mi, sh.d],
              diag: function (u, v, w) {
                if (near(u, H12) && Mi !== frac && near(v, frac) && frac > 0) return { code: 'mot-hm', hint: t(n(rnd(sh.t % 1))) + ' h is ' + t(n(rnd(sh.t % 1)) + '\\times 60=' + Math.round((sh.t % 1) * 60)) + ' minutes, not ' + frac + '.' };
                if (near(u, Math.floor(sh.t)) && u !== H12) return { code: 'mot-clock', hint: t('t') + ' counts hours <b>since ' + clock(sh.start) + '</b> — add it to the start time.' };
                return null; },
              conds: [{ f: function (u, v, w) { return w; }, v: sh.d, code: 'amt-cond', hint: function () { return 'Check the distance: it is ' + t('d') + ' in the solution.'; } }, { f: function (u, v) { return u * 60 + v; }, v: H12 * 60 + Mi, code: 'mot-clock', hint: function () { return t(n(sh.t)) + ' h = ' + hm(Math.round(sh.t * 60)) + ' after ' + clock(sh.start) + '.'; } }],
              sol: t('t=' + n(sh.t)) + ' h = ' + hm(Math.round(sh.t * 60)) + ' after ' + clock(sh.start) + ' → <b>' + clock(cm) + '</b>, ' + t(n(sh.d)) + ' km from the trailhead.<br>Check: the car has then been driving ' + hm(Math.round((sh.t - sh.h) * 60)) + ', and ' + t(sh.v2 + '\\times ' + n(rnd(sh.t - sh.h)) + '=' + n(sh.d)) + ' km ✓', hints: ['Change the decimal part of the hours to minutes (× 60), then add to the start time.'], text: 'time of day ' + clock(cm) };
            var p = amtP(o); p.key = [String(H12), String(Mi), s(sh.d)]; p.answer = clock(cm) + ', ' + t(n(sh.d)) + ' km'; return p;
          } },
          { id: 'e12d', sub: 'd', level: 'EMG', make: function (r, sh) {
            return mcP(r, 'Why does the car’s equation use ' + t('t-' + n(sh.h)) + ' rather than ' + t('t') + ', and what does the point where the two lines cross mean on a distance–time graph?', [
              { html: 'The car is parked until ' + t('t=' + n(sh.h)) + ', so it has moved for only ' + t('t-' + n(sh.h)) + ' hours; the crossing is the moment both are the same distance from the trailhead — when the car draws level.', right: true },
              { html: 'The car is slower at first; the crossing is where the two speeds are equal.', why: 'The speeds are constant and never equal. The car simply starts later; the crossing is where the <b>distances</b> are equal.' },
              { html: 'It should be ' + t('t+' + n(sh.h)) + ' because the car leaves later; the crossing is when the car arrives.', why: 'Leaving later means less time moving: ' + t('t-' + n(sh.h)) + '.' },
              { html: 'The ' + n(sh.h) + ' is the distance the cyclist is ahead; the crossing is where the car stops.', why: t(n(sh.h)) + ' is a time in hours (the head start). The crossing is where they are at the same place.' }],
              t('t') + ' counts hours since ' + clock(sh.start) + ', but the car doesn’t move until ' + t('t=' + n(sh.h)) + '; its travelling time is ' + t('t-' + n(sh.h)) + '. Using ' + t('t') + ' would credit it with ' + hrs(sh.h) + ' it never drove. On a distance–time graph the lines meet at ' + t('(' + n(sh.t) + ',\\ ' + n(sh.d) + ')') + ' — the moment both are the same distance from the trailhead.', [], 'meaning of t − h');
          } }] },

      /* ---------------- Part F — error analysis ---------------- */
      { num: '13', section: 'Extra practice F — Error analysis', shared: function (r) { return r.pick(E13()); },
        stem: function (sh) { return 'Asked to mix a ' + t(pc(sh.lo)) + ' and a ' + t(pc(sh.hi)) + ' solution to make ' + t(n(sh.M)) + ' mL of a ' + t(pc(sh.c)) + ' solution, a student wrote ' + t('x+y=' + n(sh.M)) + ' and ' + t(dp(sh.lo) + 'x+' + sh.hi + 'y=' + sh.c + '(' + n(sh.M) + ')') + '.'; },
        parts: [
          { id: 'e13a', sub: 'a', level: 'EMG', make: function (r, sh) {
            return mcP(r, 'What is the error in the student’s second equation?', [
              { html: 'It mixes two ways of writing a rate: ' + t(dp(sh.lo)) + ' is a decimal, but ' + t(sh.hi) + ' and ' + t(sh.c) + ' are whole-number percents.', right: true },
              { html: 'The percents should have been added: ' + t(sh.lo + '+' + sh.hi) + '.', why: 'Rates are never added. Each term is amount × rate.' },
              { html: 'The right side should be ' + t(n(sh.M)) + ', the total volume.', why: 'The total volume belongs in the amount equation; this one counts solute.' },
              { html: t('x') + ' and ' + t('y') + ' are in the wrong places.', why: 'The variables are fine — look at how each rate is written.' }],
              'The student mixed a decimal (' + t(dp(sh.lo)) + ') with whole-number percents (' + t(sh.hi) + ', ' + t(sh.c) + '), so the terms aren’t on the same scale — for it to be true, the ' + sh.hi + '% solution would have to be ' + sh.hi + ' times as concentrated as pure solute. Every rate in one equation must be written the same way.', [], 'error: mixed scales');
          } },
          { id: 'e13b', sub: 'b', level: 'EMG', make: function (r, sh) {
            var C = rnd(sh.c * sh.M / 100), L = [sh.lo / 100, sh.hi / 100, -C], V = ['x', 'y'];
            var studentL = [sh.lo / 100, sh.hi, -sh.c * sh.M];
            function one(wantDec) { return function (resp) {
              var str = String(resp == null ? '' : resp).trim(); if (!str) return form('empty', 'Write the equation.');
              var rr = LN.read(str, V); if (!rr.ok) return form('line-' + rr.why, 'Write an equation in ' + t('x') + ' and ' + t('y') + ' with an equals sign.');
              var S = [rr.a, rr.b, rr.c];
              if (LN.same(S, L)) { var hasDot = /\d\.\d|\.\d/.test(str); if (wantDec && !hasDot) return form('eq-form', 'Right equation — but write this one <b>entirely in decimals</b> (e.g. ' + t(dp(sh.lo) + 'x') + ').'); if (!wantDec && hasDot) return form('eq-form', 'Right equation — but write this one with <b>whole-number percents</b> only (no decimal points).'); return ok(); }
              if (LN.same(S, studentL)) return wrong('mix-pct-scale', 'That is the student’s equation — fix the scale so every rate is written the same way.');
              if (LN.same(S, [sh.lo, sh.hi, -C]) || LN.same(S, [sh.lo / 100, sh.hi / 100, -sh.c * sh.M])) return wrong('mix-pct-scale', 'Scale the right side the same way as the left: decimals give ' + t(n(C)) + '; whole-number percents give ' + t(n(C * 100)) + '.');
              if (LN.same(S, [1, 1, -sh.M])) return wrong('mix-value-rhs', 'That is the amount equation. Write the content (solute) equation.');
              return wrong('sys-eq', 'Each term is amount × rate: ' + t(dp(sh.lo) + 'x') + ', ' + t(dp(sh.hi) + 'y') + ', and the right side is ' + t(pc(sh.c)) + ' of ' + t(n(sh.M)) + '.');
            }; }
            var fields = [{ label: 'All decimals', mode: 'math', keys: 'eq', vars: V, placeholder: ' ' }, { label: 'All whole-number percents', mode: 'math', keys: 'eq', vars: V, placeholder: ' ' }];
            var k1 = dp(sh.lo) + 'x+' + dp(sh.hi) + 'y=' + n(C), k2 = sh.lo + 'x+' + sh.hi + 'y=' + s(C * 100);
            var p = B.fields('Write the content equation twice — once entirely in decimals, once entirely in whole-number percents.', fields, [one(true), one(false)], [k1, k2], t(k1) + '<br>' + t(k2),
              'All decimals: ' + t(dp(sh.lo) + 'x+' + dp(sh.hi) + 'y=' + dp(sh.c) + '(' + n(sh.M) + ')=' + n(C)) + '<br>All percents: ' + t(sh.lo + 'x+' + sh.hi + 'y=' + sh.c + '(' + n(sh.M) + ')=' + n(C * 100)) + '<br>The second is exactly 100 times the first — the same line, the same solutions.', ['Either every rate is a decimal (' + t(sh.lo + '\\%=' + dp(sh.lo)) + '), or every rate is a whole-number percent — including the right side.'], 'decimal vs percent forms');
            p.bad = [[k2, k1], [dp(sh.lo) + 'x+' + sh.hi + 'y=' + (sh.c * sh.M), k2]]; return p;
          } },
          { id: 'e13c', sub: 'c', level: 'PRG', make: function (r, sh) {
            var C = rnd(sh.c * sh.M / 100);
            return amtP({ prompt: 'Solve the system correctly: how many mL of each solution are needed?', names: [sh.lo + '% solution', sh.hi + '% solution'], units: ['mL', 'mL'], vals: [sh.x, sh.y],
              conds: [amountConds(sh.M, 'mL', 'the batch'), contentConds(sh.lo / 100, sh.hi / 100, dp(sh.lo), dp(sh.hi), C, '\\text{ mL}', 'solute')],
              sol: mixSol({ X: 'x', Y: 'y', M: sh.M, r1: sh.lo / 100, r2: sh.hi / 100, r1t: dp(sh.lo), r2t: dp(sh.hi), C: C, A: sh.x, Bv: sh.y, letTxt: 'Correct content equation: ' + t(dp(sh.lo) + 'x+' + dp(sh.hi) + 'y=' + n(C)) + '.', amtName: 'Amount', conName: 'Solute', end: n(sh.x) + ' mL of the ' + sh.lo + '% solution and ' + n(sh.y) + ' mL of the ' + sh.hi + '% solution.' }), hints: H_PCT, text: 'corrected mix' });
          } }] },
      { num: '14', shared: function (r) { return r.pick(E14()); },
        stem: function (sh) { return 'A jet boat covers ' + t(n(sh.D)) + ' km downstream in ' + hrs(sh.td) + ' and ' + t(n(sh.D)) + ' km upstream in ' + hrs(sh.tu) + '. A student wrote ' + t(n(sh.td) + '(b+c)=' + n(sh.D)) + ' and ' + t(n(sh.tu) + '(b+c)=' + n(sh.D)) + '.'; },
        parts: [
          { id: 'e14a', sub: 'a', level: 'EMG', make: function (r, sh) {
            return B.point('Solve the student’s system as written. How many solutions does it have?', 'none', { vars: ['b', 'c'], wrong: [{ is: 'inf', code: 'sys-none-inf', hint: 'Divide each equation by its time: ' + t('b+c=' + n(sh.S1)) + ' and ' + t('b+c=' + n(rnd(sh.D / sh.tu))) + '. Same left side, different right sides — that can never be true.' }] },
              'Dividing each equation by its time gives ' + t('b+c=' + n(sh.S1)) + ' and ' + t('b+c=' + n(rnd(sh.D / sh.tu))) + '. Subtracting: ' + t('0=' + n(rnd(sh.S1 - sh.D / sh.tu))) + ', never true, so there is <b>no solution</b>: the lines are parallel (same slope, different intercepts).', ['Divide each equation by its time and compare.'], 'student system: none');
          } },
          { id: 'e14b', sub: 'b', level: 'BEG', make: function (r, sh) {
            return mcP(r, 'Why must the second (upstream) equation use ' + t('b-c') + '?', [
              { html: 'Upstream the river pushes against the boat, so the current is subtracted from the boat’s own speed.', right: true },
              { html: 'Because the upstream trip is shorter.', why: 'Both trips are ' + n(sh.D) + ' km.' },
              { html: 'Because the boat goes backwards, so all speeds are negative.', why: 'The ground speed is still positive, just smaller: ' + t('b-c') + '.' },
              { html: 'It doesn’t matter — ' + t('b+c') + ' works for both directions.', why: 'Then the boat would have the same ground speed both ways — but the times are different.' }],
              'Upstream the current works against the boat, so its ground speed is ' + t('b-c') + '. Writing ' + t('b+c') + ' on both legs says the boat moves at the same speed in both directions — which contradicts ' + hrs(sh.td) + ' down and ' + hrs(sh.tu) + ' up.', [], 'why b − c');
          } },
          { id: 'e14c', sub: 'c', level: 'PRG', make: function (r, sh) {
            return amtP({ prompt: 'Fix the system and solve it: find the boat’s speed in still water and the speed of the current.', names: ['Still water ' + t('b'), 'Current ' + t('c')], units: ['km/h', 'km/h'], vals: [sh.b, sh.c],
              diag: function (u, v) { if (near(u, sh.S1) || near(u, sh.S2)) return { code: 'mot-ground', hint: 'That is a ground speed. Solve ' + t('b+c=' + n(sh.S1)) + ', ' + t('b-c=' + n(sh.S2)) + '.' }; if (near(v, sh.S1 - sh.S2)) return { code: 'mot-not-halved', hint: 'Subtracting gives ' + t('2c') + ' — divide by 2.' }; return null; },
              conds: [{ f: function (u, v) { return u + v; }, v: sh.S1, code: 'amt-cond', hint: function () { return 'Check: ' + t('b+c') + ' should be ' + t(n(sh.S1)) + ' km/h.'; } }, { f: function (u, v) { return u - v; }, v: sh.S2, code: 'amt-cond', hint: function () { return 'Check: ' + t('b-c') + ' should be ' + t(n(sh.S2)) + ' km/h.'; } }],
              sol: bcSol({ b: 'b', c: 'c', S1: sh.S1, S2: sh.S2, l1: t(n(sh.td) + '(b+c)=' + n(sh.D) + '\\Rightarrow b+c=' + n(sh.S1)), l2: t(n(sh.tu) + '(b-c)=' + n(sh.D) + '\\Rightarrow b-c=' + n(sh.S2)), end: 'The jet boat travels at ' + sh.b + ' km/h in still water and the current runs at ' + sh.c + ' km/h.' }), hints: H_STREAM, text: 'jet boat speeds' });
          } }] },
      { num: '15', shared: function (r) { return draw(r, function (r) { var c = r.pick(E15()), a = r.int(6, 14), d = r.pick([-6, -5, -4, -3, 3, 4, 5, 6]); return Object.assign({}, c, { sx: c.x + a, sy: c.y - (a - d) }); }, function (c) { return c.sy >= 3 && c.sx !== c.sy && c.sx <= c.M - 5; }, { hi: 30, lo: 18, M: 50, x: 20, y: 30, pm: 22.8, V: 1140, sx: 32, sy: 22 }); },
        stem: function (sh) { return 'A shop blends tea worth $' + sh.hi + '/kg with tea worth $' + sh.lo + '/kg to make ' + t(n(sh.M)) + ' kg of a blend worth ' + money(sh.pm) + '/kg. A student reports “' + sh.sx + ' kg of the $' + sh.hi + ' tea and ' + sh.sy + ' kg of the $' + sh.lo + ' tea.”'; },
        parts: [
          { id: 'e15a', sub: 'a', level: 'EMG', make: function (r, sh) {
            var dA = Math.abs(sh.sx + sh.sy - sh.M), sv = sh.hi * sh.sx + sh.lo * sh.sy, dV = rnd(Math.abs(sv - sh.V));
            var o = { prompt: 'Test the student’s answer in <b>both</b> equations. By how much does it miss each one?', names: ['Amount equation off by', 'Value equation off by'], units: ['kg', 'dollars'], vals: [dA, dV],
              diag: function (u, v) { if (near(Math.abs(u), dA) && near(Math.abs(v), dV)) return null; if (near(u, sh.sx + sh.sy)) return { code: 'amt', hint: 'That is the student’s total. How far is it from ' + n(sh.M) + ' kg?' }; if (near(v, sv)) return { code: 'amt', hint: 'That is the value of the student’s blend. How far is it from ' + money(sh.V) + '?' }; return null; },
              sol: 'Amount: ' + t((sh.sx) + '+' + sh.sy + '=' + (sh.sx + sh.sy)) + ', but the blend is ' + n(sh.M) + ' kg — <b>off by ' + dA + ' kg</b>.<br>Value: ' + t(sh.hi + '(' + sh.sx + ')+' + sh.lo + '(' + sh.sy + ')=' + n(sv)) + ', but the blend is worth ' + t(n2(sh.pm) + '(' + n(sh.M) + ')=' + n2(sh.V)) + ' — <b>off by ' + money(dV) + '</b>.<br>The amount equation fails first: it can be tested with one addition.', hints: ['Amount: add the two masses. Value: price × mass for each, added.'], text: 'test a wrong answer' };
            var p = amtP(o); var base = p.check; p.check = function (resp) { var u = (resp || []).map(numOf); if (u.length === 2 && u[0] != null && u[1] != null && near(Math.abs(u[0]), dA) && near(Math.abs(u[1]), dV)) return ok(); return base(resp); }; return p;
          } },
          { id: 'e15b', sub: 'b', level: 'LIM', make: function (r, sh) {
            return mcP(r, 'Why is the amount equation the faster check, and why should it be run first?', [
              { html: 'It is one addition of the two reported numbers — and an answer whose amounts don’t add to the total is already wrong, whatever its value.', right: true },
              { html: 'Because the value equation can never fail if the amounts are right.', why: 'It can: amounts that add to the total can still be the wrong split.' },
              { html: 'Because the amount equation is the only one that matters.', why: 'Both equations must hold; the amount one is just quicker.' },
              { html: 'Because the value equation uses decimals, which are less accurate.', why: 'Decimals are exact here. The reason is speed: one addition rejects a wrong answer.' }],
              'The amount equation is a single addition; the value equation needs two multiplications, an addition and the target total. Any answer whose parts don’t add to the stated total is wrong no matter what its value is, so the cheap check goes first.', [], 'which check first');
          } },
          { id: 'e15c', sub: 'c', level: 'PRG', make: function (r, sh) {
            return amtP({ prompt: 'Solve the system correctly: how many kg of each tea?', names: ['$' + sh.hi + '/kg tea', '$' + sh.lo + '/kg tea'], units: ['kg', 'kg'], vals: [sh.x, sh.y],
              diag: function (u, v) { if (near(u, sh.sx) && near(v, sh.sy)) return { code: 'amt-total', hint: 'That is the student’s answer — it fails the amount equation.' }; return null; },
              conds: [amountConds(sh.M, 'kg', 'the blend'), contentConds(sh.hi, sh.lo, String(sh.hi), String(sh.lo), sh.V, '', 'value in dollars')],
              sol: mixSol({ X: 'x', Y: 'y', M: sh.M, r1: sh.hi, r2: sh.lo, r1t: String(sh.hi), r2t: String(sh.lo), C: sh.V, A: sh.x, Bv: sh.y, cf: n2, letTxt: 'Value: ' + t(n2(sh.pm) + '(' + n(sh.M) + ')=' + n2(sh.V)) + '.', amtName: 'Amount', conName: 'Value', end: 'Blend ' + n(sh.x) + ' kg of the $' + sh.hi + '/kg tea with ' + n(sh.y) + ' kg of the $' + sh.lo + '/kg tea.' }), hints: H_MIX, text: 'tea amounts' });
          } }] },

      /* ---------------- Part G — stretch ---------------- */
      { num: '16', section: 'Extra practice G — Stretch', shared: function (r) { return r.pick(E16()); },
        stem: function (sh) { return 'A trail mix is made from almonds worth $' + sh.pa + '/kg, raisins worth $' + sh.pr + '/kg, and pretzels worth $' + sh.pz + '/kg. The finished mix weighs ' + t(n(sh.M)) + ' kg and is worth ' + money(sh.pm) + '/kg. The mix contains <b>equal masses</b> of raisins and pretzels.'; },
        parts: [
          { id: 'e16a', sub: 'a', level: 'EMG', make: function (r, sh) {
            return mcP(r, 'There are three ingredients but only two unknowns. How does the stated relationship make that work?', [
              { html: 'Raisins and pretzels have equal masses, so one variable ' + t('r') + ' stands for both; with ' + t('a') + ' for almonds, that is two unknowns.', right: true },
              { html: 'The pretzels can be ignored because they are the cheapest.', why: 'Every ingredient adds mass and value — none can be ignored.' },
              { html: 'The mixture price gives the third unknown.', why: 'The mixture price is known; it gives the total value, not an unknown.' },
              { html: 'Equal masses means each ingredient is one third of the mix.', why: 'Only the raisins and pretzels are equal; the almonds can be different.' }],
              'Let ' + t('a') + ' = kg of almonds and ' + t('r') + ' = kg of raisins; the pretzels also weigh ' + t('r') + ' kg. Three ingredients, two unknowns.', [], 'three ingredients, two unknowns');
          } },
          { id: 'e16b', sub: 'b', level: 'ADV', make: function (r, sh) {
            return sysP({ prompt: 'Let ' + t('a') + ' be the kg of almonds and ' + t('r') + ' the kg of raisins (= kg of pretzels). Write the amount equation and the value equation.', vars: ['a', 'r'],
              eqs: [{ tex: 'a+2r=' + sh.M, name: 'amount equation', tip: 'almonds + raisins + pretzels: ' + t('a+r+r=' + n(sh.M)) + '.' }, { tex: sh.pa + 'a+' + (sh.pr + sh.pz) + 'r=' + n(sh.V), name: 'value equation', tip: t(sh.pa + 'a+' + sh.pr + 'r+' + sh.pz + 'r') + ' = the value of the mix, ' + t(n2(sh.pm) + '(' + n(sh.M) + ')=' + n(sh.V)) + '.' }],
              wrongs: [{ is: 'a+r=' + sh.M, code: 'mix-three-two', hint: 'There are <b>three</b> masses: almonds, raisins <b>and</b> pretzels — ' + t('a+r+r') + '.' }, { is: sh.pa + 'a+' + sh.pr + 'r=' + n(sh.V), code: 'mix-three-two', hint: 'Don’t forget the pretzels’ value: ' + t(sh.pz + 'r') + '.' }, { is: sh.pa + 'a+' + (sh.pr + sh.pz) + 'r=' + n2(sh.pm), code: 'mix-content-rhs', hint: 'The right side is the total value: ' + t(n2(sh.pm) + '\\times ' + n(sh.M) + '=' + n(sh.V)) + '.' }],
              sol: 'Amount: ' + t('a+r+r=' + n(sh.M)) + ', i.e. ' + t('a+2r=' + n(sh.M)) + '<br>Value: ' + t(sh.pa + 'a+' + sh.pr + 'r+' + sh.pz + 'r=' + n2(sh.pm) + '(' + n(sh.M) + ')') + ', i.e. ' + t(sh.pa + 'a+' + (sh.pr + sh.pz) + 'r=' + n(sh.V)), hints: ['The pretzels weigh ' + t('r') + ' kg too.'], text: 'trail mix system' });
          } },
          { id: 'e16c', sub: 'c', level: 'ADV', make: function (r, sh) {
            var k = rnd(sh.pa * sh.M), cr = sh.pr + sh.pz - 2 * sh.pa;
            return amtP({ prompt: 'Find the mass of each ingredient.', names: ['Almonds', 'Raisins', 'Pretzels'], units: ['kg', 'kg', 'kg'], vals: [sh.a, sh.r, sh.r],
              diag: function (u, v, w) { if (!near(v, w)) return { code: 'amt-cond', hint: 'The raisins and pretzels have <b>equal</b> masses.' }; return null; },
              conds: [{ f: function (u, v, w) { return u + v + w; }, v: sh.M, code: 'amt-total', hint: function (g) { return 'The three masses add to ' + t(n(rnd(g))) + ' kg, but the mix is ' + t(n(sh.M)) + ' kg.'; } }, { f: function (u, v, w) { return sh.pa * u + sh.pr * v + sh.pz * w; }, v: sh.V, code: 'amt-value', hint: function (g) { return 'Check the value: yours is ' + money(g) + ', but the mix is worth ' + money(sh.V) + '.'; } }],
              sol: 'From the amount equation, ' + t('a=' + n(sh.M) + '-2r') + ':<br>' + t(sh.pa + '(' + n(sh.M) + '-2r)+' + (sh.pr + sh.pz) + 'r=' + n(sh.V) + '\\Rightarrow ' + n(k) + coef(cr).replace(/^(\d)/, '+$1') + 'r=' + n(sh.V) + '\\Rightarrow r=' + n(sh.r)) + ', ' + t('a=' + n(sh.M) + '-2(' + n(sh.r) + ')=' + n(sh.a)) +
                '<br>Check: ' + t(n(sh.a) + '+' + n(sh.r) + '+' + n(sh.r) + '=' + n(sh.M)) + ' ✓ &nbsp; ' + t(sh.pa + '(' + n(sh.a) + ')+' + sh.pr + '(' + n(sh.r) + ')+' + sh.pz + '(' + n(sh.r) + ')=' + n(sh.V)) + ' ✓<br><b>' + n(sh.a) + ' kg of almonds, ' + n(sh.r) + ' kg of raisins and ' + n(sh.r) + ' kg of pretzels.</b>', hints: ['Amount: ' + t('a+2r=' + n(sh.M)) + '. Value: ' + t(sh.pa + 'a+' + (sh.pr + sh.pz) + 'r=' + n(sh.V)) + '.'], text: 'trail mix masses' });
          } }] },
      { num: '17', shared: function (r) { return r.pick(E17()); },
        stem: function (sh) { return 'Two boats work the same stretch of river, which has one steady current. A motorboat travels ' + t(n(sh.D1)) + ' km downstream in ' + hrs(sh.td) + '. A second boat, whose speed in still water is ' + t(sh.k) + ' km/h <b>less</b> than the motorboat’s, travels ' + t(n(sh.D2)) + ' km upstream in ' + hrs(sh.tu) + '. Let ' + t('b') + ' be the motorboat’s still-water speed and ' + t('c') + ' the current, both in km/h.'; },
        parts: [
          { id: 'e17a', sub: 'a', level: 'ADV', make: function (r, sh) {
            return sysP({ prompt: 'Write the two equations (one for each boat).', vars: ['b', 'c'],
              eqs: [{ tex: n(sh.td) + '(b+c)=' + sh.D1, name: 'motorboat equation', tip: 'downstream the motorboat moves at ' + t('b+c') + ' for ' + hrs(sh.td) + '.' }, { tex: n(sh.tu) + '(b-' + sh.k + '-c)=' + sh.D2, name: 'second boat’s equation', tip: 'its still-water speed is ' + t('b-' + sh.k) + ', and upstream it also loses the current: ' + t('(b-' + sh.k + ')-c') + '.' }],
              wrongs: [{ is: n(sh.tu) + '(b-c)=' + sh.D2, code: 'mot-offset', hint: 'The second boat is ' + sh.k + ' km/h slower in still water: its speed is ' + t('b-' + sh.k) + ', so upstream it moves at ' + t('(b-' + sh.k + ')-c') + '.' }, { is: n(sh.tu) + '(b+' + sh.k + '-c)=' + sh.D2, code: 'mot-offset', hint: 'The second boat is ' + sh.k + ' km/h <b>less</b> than the motorboat: ' + t('b-' + sh.k) + '.' }, { is: n(sh.tu) + '(b-' + sh.k + '+c)=' + sh.D2, code: 'mot-legs-swapped', hint: 'The second boat goes <b>upstream</b>, so the current is subtracted.' }],
              sol: 'Second boat’s still-water speed: ' + t('b-' + sh.k) + '; upstream: ' + t('(b-' + sh.k + ')-c') + '.<br>' + t(n(sh.td) + '(b+c)=' + n(sh.D1)) + ' &nbsp; ' + t(n(sh.tu) + '\\big((b-' + sh.k + ')-c\\big)=' + n(sh.D2)), hints: ['Write the second boat’s still-water speed in terms of ' + t('b') + ' first.'], text: 'two boats system' });
          } },
          { id: 'e17b', sub: 'b', level: 'ADV', make: function (r, sh) {
            var S1 = sh.b + sh.c, S2 = sh.b - sh.c, g2 = sh.D2 / sh.tu;
            return amtP({ prompt: 'Solve the system: find the motorboat’s still-water speed and the current.', names: ['Motorboat ' + t('b'), 'Current ' + t('c')], units: ['km/h', 'km/h'], vals: [sh.b, sh.c],
              diag: function (u, v) { var bb = (S1 + g2) / 2; if (near(u, bb) && near(v, S1 - bb)) return { code: 'mot-offset', hint: 'You treated the second boat as the motorboat: its still-water speed is ' + t('b-' + sh.k) + ', so ' + t('b-c=' + n(g2) + '+' + sh.k) + '.' }; if (near(u, sh.b - sh.k)) return { code: 'mot-other', hint: 'That is the second boat’s still-water speed. The motorboat is ' + sh.k + ' km/h faster.' }; return null; },
              conds: [{ f: function (u, v) { return u + v; }, v: S1, code: 'amt-cond', hint: function () { return 'Check the motorboat: ' + t('b+c') + ' should be ' + t(n(sh.D1) + '\\div ' + n(sh.td) + '=' + n(S1)) + '.'; } }, { f: function (u, v) { return u - sh.k - v; }, v: g2, code: 'amt-cond', hint: function () { return 'Check the second boat: ' + t('(b-' + sh.k + ')-c') + ' should be ' + t(n(sh.D2) + '\\div ' + n(sh.tu) + '=' + n(g2)) + '.'; } }],
              sol: bcSol({ b: 'b', c: 'c', S1: S1, S2: S2, l1: 'Divide by the times: ' + t('b+c=' + n(S1)), l2: t('b-' + sh.k + '-c=' + n(g2)) + ', i.e. ' + t('b-c=' + n(S2)), end: 'The current runs at ' + sh.c + ' km/h; the motorboat does ' + sh.b + ' km/h in still water and the second boat ' + (sh.b - sh.k) + ' km/h.' }), hints: ['Divide each equation by its time, then add.'], text: 'two boats speeds' });
          } },
          { id: 'e17c', sub: 'c', level: 'MAS', make: function (r, sh) {
            var g = sh.b - sh.k + sh.c;
            return hoursP('How long would the second boat take to travel the same ' + t(n(sh.D2)) + ' km <b>downstream</b>? (Use the motorboat’s still-water speed ' + t(n(sh.b)) + ' km/h and the current ' + t(n(sh.c)) + ' km/h.)', sh.T2, function (v) {
              if (near(v, sh.D2 / (sh.b + sh.c))) return { code: 'mot-offset', hint: 'That uses the motorboat’s speed. The second boat’s still-water speed is ' + t(n(sh.b) + '-' + sh.k + '=' + n(sh.b - sh.k)) + '.' };
              if (near(v, sh.D2 / (sh.b - sh.k - sh.c))) return { code: 'mot-legs-swapped', hint: 'Downstream the current <b>helps</b>: ' + t('(b-' + sh.k + ')+c') + '.' };
              if (near(v, sh.tu)) return { code: 'mot-other', hint: 'That was its time upstream. Downstream is faster.' };
              return null; }, 'Second boat downstream: ' + t(n(sh.b - sh.k) + '+' + n(sh.c) + '=' + n(g)) + ' km/h, so ' + t(n(sh.D2) + '\\div ' + n(g) + '=' + n(sh.T2)) + ' h (' + hm(Math.round(sh.T2 * 60)) + ') — less than the ' + hrs(sh.tu) + ' upstream, as it must be.', ['Its downstream speed is its still-water speed plus the current.'], 'second boat downstream');
          } }] },

      /* ---------------- Part H — MC and NR ---------------- */
      { num: '18', section: 'Extra practice H — Multiple choice and numerical response', shared: function (r) { return r.pick(E18()); }, parts: [
        { id: 'e18', level: 'EMG', make: function (r, sh) {
          var cands = [sh.juice, sh.fin, sh.V - sh.w, Math.round(sh.V * (sh.j - sh.t) / 100), sh.w + Math.round(sh.V / 5), sh.w - 2, sh.w + 3].map(rnd).filter(function (v, i, a) { return v > 0 && !near(v, sh.w) && isInt(v) && a.indexOf(v) === i; }).slice(0, 3);   // rnd: 0.4·V and V − w can differ by float noise
          var why = function (v) { return near(v, sh.juice) ? 'That is the litres of <b>juice</b> in the drink — it stays the same when water is added.' : near(v, sh.fin) ? 'That is the <b>final</b> volume of the drink. Subtract the ' + sh.V + ' L you started with.' : 'Check: ' + sh.V + ' L + ' + v + ' L of water = ' + (sh.V + v) + ' L, and ' + n(sh.juice) + ' L of juice in it is ' + (isInt(sh.juice / (sh.V + v) * 1000) ? '' : 'about ') + n(K.roundTo(sh.juice / (sh.V + v) * 100, 1)) + '%, not ' + sh.t + '%.'; };
          var opts = [{ v: sh.w, right: true }].concat(cands.map(function (v) { return { v: v, why: why(v) }; })).sort(function (a, b) { return a.v - b.v; });
          return mcP(r, '<i>(Multiple choice)</i> A juice drink is ' + t(pc(sh.j)) + ' juice. Pure water is added to ' + t(n(sh.V)) + ' L of it to bring it down to ' + t(pc(sh.t)) + ' juice. The number of litres of water added is', opts.map(function (o) { return { html: t(n(o.v)), right: !!o.right, why: o.why }; }),
            'Adding water changes the volume but not the juice: ' + t(dp(sh.j) + '(' + n(sh.V) + ')=' + n(sh.juice)) + ' L of juice.<br>' + t(dp(sh.t) + '(' + n(sh.V) + '+w)=' + n(sh.juice) + '\\Rightarrow ' + n(sh.V) + '+w=' + n(sh.fin) + '\\Rightarrow w=' + n(sh.w)) + '<br>Check: ' + t(n(sh.juice) + '\\div ' + n(sh.fin) + '=' + pc(sh.t)) + ' ✓', ['The amount of juice doesn’t change when water is added.'], 'MC dilution');
        } }] },
      { num: '19', shared: function (r) { return r.pick(E19()); }, parts: [
        { id: 'e19', level: 'PRG', make: function (r, sh) {
          var g = gcd(sh.tu, sh.td), tr = (sh.tu / g) + ':' + (sh.td / g), right = sh.k + ':1';
          var cands = [tr, (sh.k + 1) + ':1', (sh.k - 1) + ':1', (2 * sh.k) + ':1', (sh.k + 2) + ':1', (sh.k + 3) + ':1', (3 * sh.k) + ':1'].filter(function (v, i, a) { return v !== right && v !== '1:1' && a.indexOf(v) === i; }).slice(0, 3);
          var why = function (v) { return v === tr ? 'That is the ratio of the <b>times</b>, upstream to downstream. Find the speeds: ' + t('b+c') + ' and ' + t('b-c') + ' are distance ÷ each time.' : 'Check with a stretch of ' + t('D') + ' km: ' + t('b+c=\\frac{D}{' + frac60(sh.td) + '}') + ' and ' + t('b-c=\\frac{D}{' + frac60(sh.tu) + '}') + '. Add and subtract to compare ' + t('b') + ' with ' + t('c') + '.'; };
          var opts = [{ s: right, right: true }].concat(cands.map(function (v) { return { s: v, why: why(v) }; })).sort(function (a, b) { return eval0(a.s) - eval0(b.s); });
          function eval0(x) { var p = x.split(':'); return p[0] / p[1]; }
          var a1 = sh.tu / g, b1 = sh.td / g;   // speeds proportional to 1/td : 1/tu = tu : td
          return mcP(r, '<i>(Multiple choice)</i> A canoeist paddles at a steady speed in still water. On a river she covers a stretch in ' + sh.td + ' minutes going downstream and the same stretch in ' + sh.tu + ' minutes going upstream. The ratio of her still-water speed to the speed of the current is', opts.map(function (o) { return { html: t(o.s), right: !!o.right, why: o.why }; }),
            'Speed is distance ÷ time, so for the same stretch the speeds are in the ratio of the <b>inverse</b> times: ' + t('(b+c):(b-c)=' + sh.tu + ':' + sh.td + '=' + a1 + ':' + b1) + '.<br>Take ' + t('b+c=' + a1 + 'u') + ' and ' + t('b-c=' + b1 + 'u') + ': adding, ' + t('2b=' + (a1 + b1) + 'u') + '; subtracting, ' + t('2c=' + (a1 - b1) + 'u') + '.<br>' + t('b:c=' + (a1 + b1) + ':' + (a1 - b1) + '=' + right) + '. <b>Her still-water speed is ' + sh.k + ' times the current.</b>', ['Let the stretch be ' + t('D') + ' km and write ' + t('b+c') + ' and ' + t('b-c') + ' in terms of ' + t('D') + '.'], 'MC canoe ratio');
        } }] },
      { num: '20', shared: function (r) { return r.pick(E20()); }, parts: [
        { id: 'e20', level: 'PRG', make: function (r, sh) {
          var V = sh.c * sh.M;
          var sol = mixSol({ X: 'x', Y: 'y', M: sh.M, r1: sh.lo, r2: sh.hi, r1t: String(sh.lo), r2t: String(sh.hi), C: V, A: sh.y, Bv: sh.x, letTxt: 'Let ' + t('x') + ', ' + t('y') + ' = kg of the $' + sh.lo + '/kg and $' + sh.hi + '/kg beans. Value: ' + t(sh.c + '(' + n(sh.M) + ')=' + n(V)) + '.', amtName: 'Amount', conName: 'Value', end: 'The blend contains ' + n(sh.y) + ' kg of the $' + sh.hi + '/kg beans' + (sh.y < 100 ? ' (recorded as ' + ('00' + sh.y).slice(-3) + ')' : '') + '.' });
          return B.nr('<i>(Numerical response)</i> Beans worth $' + sh.lo + '/kg are blended with beans worth $' + sh.hi + '/kg to make ' + t(n(sh.M)) + ' kg of a blend worth $' + sh.c + '/kg. The number of kilograms of the $' + sh.hi + '/kg beans in the blend is ____.', sh.y, function (v) {
            if (near(v, sh.x)) return { code: 'mix-other', hint: 'That is the amount of the $' + sh.lo + '/kg beans. The question asks for the $' + sh.hi + '/kg beans.' };
            if (near(v, sh.M / 2)) return { code: 'amt', hint: 'Half and half would give $' + ((sh.lo + sh.hi) / 2) + '/kg. Set up the value equation.' };
            return null;
          }, sol, H_MIX, 'NR beans ' + sh.y);
        } }] }
    ]
  });
})(window);
