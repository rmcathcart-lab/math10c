/* Skill Drills: unlimited practice of the prerequisite skills (integers, multiplication facts, order of operations,
 * fractions, powers and roots, factors, product-and-sum, like terms, distributing, substituting, equations,
 * rearranging formulas, plotting points). Opened from the "Skill Drills" button at the bottom of the home page (#/drills).
 *
 * Every drill makes a fresh question each time (no fixed bank), checks it instantly, and shows how it works when the
 * answer is wrong. Levels go up on their own: 9 right out of the last 10 at a level moves the student up (they can
 * pick any level themselves). Fact drills also have a 1-minute Sprint with a best score.
 * Progress is kept on this device (localStorage 'hw:drills'); a summary goes to the teacher's ledger as
 * { t:'event', type:'drill', drill, level, mode, n, right } every 10 answers and at the end of a sprint.
 *
 * API: HW.Drills.render(view, drillId?)  — the list when drillId is empty, else that drill.
 * Same file in math15 and math10c (only SITE text differs via HW_CONFIG). Needs core.js (HW.el, HW.k), poly.js. */
(function (root) {
  'use strict';
  var HW = root.HW, el = HW.el, esc = HW.esc;
  var KEY = 'hw:drills';
  function K(l, d) { return HW.k(l, d); }

  /* ---------------- small math helpers ---------------- */
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function nz(a, b) { var v; do { v = ri(a, b); } while (v === 0); return v; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function gcd(a, b) { a = Math.abs(a); b = Math.abs(b); while (b) { var t = a % b; a = b; b = t; } return a; }
  function m(n) { return String(n).replace('-', '−'); }                       // plain text with a real minus sign
  function L(n) { return n < 0 ? '-' + Math.abs(n) : String(n); }            // LaTeX number
  function P(n) { return n < 0 ? '(' + L(n) + ')' : String(n); }             // LaTeX number, brackets if negative
  function frac(p, q) { if (q < 0) { p = -p; q = -q; } var g = gcd(p, q) || 1; return [p / g, q / g]; }
  function fT(top, den) { return (top < 0 ? '-' : '') + '\\frac{' + Math.abs(top) + '}{' + den + '}'; }
  function fL(f) { return f[1] === 1 ? L(f[0]) : (f[0] < 0 ? '-' : '') + '\\frac{' + Math.abs(f[0]) + '}{' + f[1] + '}'; }
  function sgnTerm(c, body, first) {                                       // "+ 3x", "- x", "3x" (first)
    var a = Math.abs(c), s = (a === 1 && body) ? body : a + body;
    if (first) return (c < 0 ? '-' : '') + s;
    return (c < 0 ? ' - ' : ' + ') + s;
  }
  function lin(a, b, x) { x = x || 'x'; var s = a ? sgnTerm(a, x, true) : ''; if (b) s += s ? sgnTerm(b, '', false) : L(b); return s || '0'; }
  function eqRows(rows) {                                                 // [[latex, note], …] → aligned steps
    return '<div class="dr-steps">' + rows.map(function (r) { return '<div class="dr-step"><span>' + K(r[0]) + '</span><span class="dr-op">' + (r[1] || '') + '</span></div>'; }).join('') + '</div>';
  }

  /* number line for integer adding: start at a, hop by b */
  function numberLine(a, b) {
    var lo = Math.min(0, a, a + b) - 1, hi = Math.max(0, a, a + b) + 1, span = hi - lo, W = Math.min(520, Math.max(260, span * 34)), pad = 18;
    if (span > 44) return '';
    var x = function (v) { return pad + (v - lo) * (W - 2 * pad) / span; }, s = '<svg class="dr-nl" viewBox="0 0 ' + W + ' 74" style="max-width:' + W + 'px" role="img" aria-label="number line">';
    s += '<line x1="' + pad + '" y1="52" x2="' + (W - pad) + '" y2="52" stroke="#6a7182" stroke-width="1.5"/>';
    for (var v = lo; v <= hi; v++) {
      var big = v % 5 === 0;
      s += '<line x1="' + x(v) + '" y1="' + (big ? 45 : 48) + '" x2="' + x(v) + '" y2="' + (big ? 59 : 56) + '" stroke="#6a7182"/>';
      if (span <= 24 || big) s += '<text x="' + x(v) + '" y="72" font-size="11" text-anchor="middle" fill="' + (v === 0 ? '#1c2230' : '#6a7182') + '"' + (v === 0 ? ' font-weight="700"' : '') + '>' + m(v) + '</text>';
    }
    var x0 = x(a), x1 = x(a + b), mid = (x0 + x1) / 2, col = b >= 0 ? '#2f8a57' : '#c0504d';
    s += '<path d="M' + x0 + ' 50 Q' + mid + ' ' + (b === 0 ? 50 : 8) + ' ' + x1 + ' 50" fill="none" stroke="' + col + '" stroke-width="2.4"/>';
    s += '<path d="M' + x1 + ' 50 l' + (b >= 0 ? -7 : 7) + ' -6 l0 9 z" fill="' + col + '"/>';
    s += '<circle cx="' + x0 + '" cy="52" r="4.5" fill="#1e3a6e"/><circle cx="' + x1 + '" cy="52" r="5" fill="' + col + '"/>';
    s += '<text x="' + mid + '" y="' + (b === 0 ? 40 : 22) + '" font-size="12" text-anchor="middle" fill="' + col + '" font-weight="700">' + (b >= 0 ? '+' : '−') + Math.abs(b) + '</text>';
    return s + '</svg>';
  }

  /* ---------------- order of operations: a tiny tokenised evaluator that shows one step at a time ---------------- */
  function tokens(src, vals) {                                // 'a+b*c' with vals {a:3,…} → tokens
    var out = [];
    src.replace(/\s+/g, '').split('').forEach(function (ch) {
      if (/[a-z]/.test(ch)) out.push({ t: 'n', v: vals[ch] });
      else if (/[0-9]/.test(ch)) out.push({ t: 'n', v: +ch });
      else if (ch === '(' || ch === ')') out.push({ t: ch });
      else out.push({ t: 'op', v: ch });
    });
    return out;
  }
  function texOf(tk) {
    var s = '';
    tk.forEach(function (k, i) {
      var prev = tk[i - 1], next = tk[i + 1];
      if (k.t === 'n') {
        var neg = k.v < 0, wrap = neg && ((prev && (prev.t === 'op' || prev.t === '(')) || (next && next.t === 'op' && next.v === '^'));
        if (prev && prev.t === 'op' && prev.v === '^') s += '{' + L(k.v) + '}';
        else s += wrap ? '(' + L(k.v) + ')' : L(k.v);
      } else if (k.t === 'op') s += { '+': ' + ', '-': ' - ', '*': ' \\times ', '/': ' \\div ', '^': '^' }[k.v];
      else s += k.t === '(' ? '\\left(' : '\\right)';
    });
    return s;
  }
  function opName(o) { return { '^': 'Exponent first', '*': 'Multiply', '/': 'Divide', '+': 'Add', '-': 'Subtract' }[o]; }
  function bedmasStep(tk) {                                   // → { tk, note } or null when done; throws 'bad' on a non-integer
    var j = -1, i, k;
    for (k = 0; k < tk.length; k++) if (tk[k].t === ')') { j = k; break; }
    var lo = 0, hi = tk.length, inB = false;
    if (j >= 0) { for (i = j; i >= 0; i--) if (tk[i].t === '(') break; lo = i + 1; hi = j; inB = true; }
    if (inB && hi - lo === 1) { var c = tk.slice(); c.splice(j, 1); c.splice(lo - 1, 1); return bedmasStep(c) || { tk: c, note: '' }; }
    if (tk.length === 1) return null;
    var seg = tk.slice(lo, hi), at = -1, ops = [['^'], ['*', '/'], ['+', '-']];
    for (var g = 0; g < ops.length && at < 0; g++) for (k = 0; k < seg.length; k++) if (seg[k].t === 'op' && ops[g].indexOf(seg[k].v) >= 0) { at = k; break; }
    var a = seg[at - 1].v, b = seg[at + 1].v, o = seg[at].v, r;
    if (o === '^') r = Math.pow(a, b); else if (o === '*') r = a * b; else if (o === '/') { if (b === 0 || a % b) throw 'bad'; r = a / b; } else if (o === '+') r = a + b; else r = a - b;
    var out = tk.slice(); out.splice(lo + at - 1, 3, { t: 'n', v: r });
    // drop brackets that now hold one number
    for (k = 1; k < out.length - 1; k++) if (out[k - 1].t === '(' && out[k].t === 'n' && out[k + 1].t === ')') { out.splice(k + 1, 1); out.splice(k - 1, 1); k = 0; }
    return { tk: out, note: (inB ? 'inside the brackets: ' : '') + opName(o).toLowerCase() };
  }
  function bedmas(templates, ranges) {
    for (var tries = 0; tries < 400; tries++) {
      var src = pick(templates), vals = {};
      src.replace(/[a-z]/g, function (c) { if (vals[c] == null) vals[c] = ranges[c] ? ranges[c]() : ri(2, 9); return c; });
      var tk = tokens(src, vals), rows = [[texOf(tk), '']], cur = tk, ok = true, s;
      try { while ((s = bedmasStep(cur))) { cur = s.tk; rows.push([texOf(cur), s.note]); if (Math.abs(cur.length === 1 ? cur[0].v : 0) > 999) { ok = false; break; } } } catch (e) { ok = false; }
      if (!ok || cur.length !== 1 || Math.abs(cur[0].v) > 300 || rows.length < 3) continue;
      rows[0][1] = '';
      return { q: K(texOf(tk)), type: 'int', ans: cur[0].v, how: '<p>Brackets, then exponents, then × and ÷ left to right, then + and − left to right — one step at a time:</p>' + eqRows(rows.map(function (r, i) { return [(i ? '= ' : '') + r[0], r[1]]; })) };
    }
    return { q: K('3 + 4 \\times 2'), type: 'int', ans: 11, how: '' };
  }

  /* ---------------- drills ---------------- */
  var DRILLS = [];
  function drill(d) { DRILLS.push(d); return d; }

  // Integers: adding and subtracting
  drill({
    id: 'int-add', group: 'Number skills', title: 'Adding and subtracting integers', pad: 'int', sprint: true,
    blurb: 'Positive and negative numbers: −7 + 3, 5 − (−4), …', helps: 'every unit',
    levels: [
      { name: 'Within 10', gen: function () { return intAdd(10, false); } },
      { name: 'Subtracting negatives', gen: function () { return intAdd(12, true); } },
      { name: 'Within 50', gen: function () { return intAdd(50, Math.random() < .5); } },
      { name: 'Three numbers', gen: intAdd3 }
    ]
  });
  function intAdd(R, subNeg) {
    var a = nz(-R, R), b = nz(-R, R), op = Math.random() < .5 ? '+' : '-';
    if (subNeg) { op = '-'; b = -Math.abs(b); }
    var add = op === '+' ? b : -b, ans = a + add;
    var how = '<p>' + (op === '-' ? 'Subtracting ' + K(P(b)) + ' is the same as adding its opposite: ' + K(L(a) + ' - ' + P(b) + ' = ' + L(a) + ' + ' + P(-b)) + '.</p><p>' : '<p>') +
      (add >= 0 ? 'Start at ' + K(L(a)) + ' and move ' + Math.abs(add) + ' right.' : 'Start at ' + K(L(a)) + ' and move ' + Math.abs(add) + ' left.') +
      ' You land on ' + K(L(ans)) + '.</p>' + numberLine(a, add) + signRule(a, add);
    return { q: K(L(a) + ' ' + op + ' ' + P(b)), type: 'int', ans: ans, how: how, fact: L(a) + op + P(b) };
  }
  function signRule(a, b) {
    if (a === 0 || b === 0) return '';
    if ((a < 0) === (b < 0)) return '<p class="dr-rule">Same signs: add the sizes (' + Math.abs(a) + ' + ' + Math.abs(b) + ' = ' + (Math.abs(a) + Math.abs(b)) + ') and keep the sign.</p>';
    var big = Math.abs(a) > Math.abs(b) ? a : b;
    return '<p class="dr-rule">Different signs: subtract the sizes (' + Math.max(Math.abs(a), Math.abs(b)) + ' − ' + Math.min(Math.abs(a), Math.abs(b)) + ' = ' + Math.abs(Math.abs(a) - Math.abs(b)) + ') and keep the sign of the bigger size (' + m(big) + ').</p>';
  }
  function intAdd3() {
    var a = nz(-15, 15), b = nz(-15, 15), c = nz(-15, 15), o1 = pick(['+', '-']), o2 = pick(['+', '-']);
    var s1 = o1 === '+' ? b : -b, s2 = o2 === '+' ? c : -c, mid = a + s1, ans = mid + s2;
    return { q: K(L(a) + ' ' + o1 + ' ' + P(b) + ' ' + o2 + ' ' + P(c)), type: 'int', ans: ans,
      how: '<p>Work left to right, one pair at a time (subtracting = adding the opposite):</p>' + eqRows([[L(a) + ' ' + o1 + ' ' + P(b) + ' ' + o2 + ' ' + P(c), ''], ['= ' + L(mid) + ' ' + o2 + ' ' + P(c), K(L(a) + (s1 < 0 ? ' - ' : ' + ') + Math.abs(s1)) + ' = ' + m(mid)], ['= ' + L(ans), '']]) };
  }

  // Integers: multiplying and dividing
  drill({
    id: 'int-mul', group: 'Number skills', title: 'Multiplying and dividing integers', pad: 'int', sprint: true,
    blurb: 'The sign rules: (−6)(4), −36 ÷ (−9), …', helps: 'every unit',
    levels: [
      { name: 'Multiplying', gen: function () { return intMul(false); } },
      { name: 'Dividing', gen: function () { return intMul(true); } },
      { name: 'Mixed', gen: function () { return intMul(Math.random() < .5); } },
      { name: 'Three factors', gen: intMul3 }
    ]
  });
  function intMul(div) {
    var a = ri(2, 12) * pick([1, -1]), b = ri(2, 12) * pick([1, -1]); if (a > 0 && b > 0) { if (Math.random() < .5) a = -a; else b = -b; }
    var sameSign = (a < 0) === (b < 0), rule = '<p class="dr-rule">' + (sameSign ? 'Same signs → positive answer.' : 'Different signs → negative answer.') + '</p>';
    if (div) { var p = a * b; return { q: K(L(p) + ' \\div ' + P(a)), type: 'int', ans: b, how: '<p>' + Math.abs(p) + ' ÷ ' + Math.abs(a) + ' = ' + Math.abs(b) + '.</p><p class="dr-rule">' + m(p) + ' and ' + m(a) + ' have ' + ((p < 0) === (a < 0) ? 'the same sign → positive answer.' : 'different signs → negative answer.') + '</p>', fact: L(p) + '/' + P(a) }; }
    return { q: K(P(a) + '\\times' + P(b)), type: 'int', ans: a * b, how: '<p>' + Math.abs(a) + ' × ' + Math.abs(b) + ' = ' + Math.abs(a * b) + '.</p>' + rule, fact: P(a) + '*' + P(b) };
  }
  function intMul3() {
    var a = nz(-6, 6), b = nz(-6, 6), c = nz(-5, 5), negs = [a, b, c].filter(function (v) { return v < 0; }).length;
    return { q: K(P(a) + '\\times' + P(b) + '\\times' + P(c)), type: 'int', ans: a * b * c,
      how: '<p>Multiply the sizes: ' + Math.abs(a) + ' × ' + Math.abs(b) + ' × ' + Math.abs(c) + ' = ' + Math.abs(a * b * c) + '.</p><p class="dr-rule">Count the negatives: ' + negs + ' — ' + (negs % 2 ? 'an odd number, so the answer is negative.' : 'an even number, so the answer is positive.') + '</p>' };
  }

  // Multiplication and division facts (the student picks the tables)
  var TABLES = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  drill({
    id: 'times', group: 'Number skills', title: 'Multiplication and division facts', pad: 'int', sprint: true, facts: true,
    blurb: 'Pick your tables. Facts you miss come back until you know them.', helps: 'every unit, and factoring most of all',
    levels: [
      { name: '× facts', gen: function (st) { return timesQ(st, 'x'); } },
      { name: '÷ facts', gen: function (st) { return timesQ(st, 'd'); } },
      { name: '× and ÷ mixed', gen: function (st) { return timesQ(st, Math.random() < .5 ? 'x' : 'd'); } }
    ]
  });
  function timesQ(st, op) {
    var tabs = (st.tables && st.tables.length ? st.tables : TABLES), a, b;
    var due = (st.missed || []).filter(function (x) { return x.due <= (st.count || 0) && tabs.indexOf(x.a) >= 0; });
    if (due.length && Math.random() < .8) { var d = due[0]; st.missed.splice(st.missed.indexOf(d), 1); a = d.a; b = d.b; }
    else { a = pick(tabs); b = ri(1, 12); }
    var p = a * b, swap = Math.random() < .5, x1 = swap ? b : a, x2 = swap ? a : b;
    var near = a * (b - 1), tip = b > 1 ? '<p class="dr-rule">Build it from one you know: ' + a + ' × ' + (b - 1) + ' = ' + near + ', plus one more ' + a + ' is ' + p + '.</p>' : '';
    if (op === 'd') return { q: K(p + ' \\div ' + a), type: 'int', ans: b, how: '<p>' + p + ' ÷ ' + a + ' asks “' + a + ' times what is ' + p + '?” — ' + a + ' × ' + b + ' = ' + p + ', so the answer is ' + b + '.</p>' + tip, fact: a + 'x' + b, a: a, b: b };
    return { q: K(x1 + ' \\times ' + x2), type: 'int', ans: p, how: '<p>' + x1 + ' × ' + x2 + ' = ' + p + '.</p>' + tip, fact: a + 'x' + b, a: a, b: b };
  }

  // Order of operations
  var R9 = function () { return ri(2, 9); }, RN = function () { return nz(-9, 9); };
  drill({
    id: 'bedmas', group: 'Number skills', title: 'Order of operations (BEDMAS)', pad: 'int',
    blurb: 'Brackets, exponents, × ÷, + − — one step at a time.', helps: 'every unit',
    levels: [
      { name: '× ÷ before + −', gen: function () { return bedmas(['a+b*c', 'a-b*c', 'a*b+c*d', 'a+b/c', 'a*b-c', 'a-b/c+d', 'a*b/c'], {}); } },
      { name: 'Brackets', gen: function () { return bedmas(['(a+b)*c', 'a*(b-c)', '(a-b)/c', 'a-(b+c)', '(a+b)*(c-d)', 'a*(b+c)-d', 'a+(b-c)*d'], {}); } },
      { name: 'Exponents', gen: function () { return bedmas(['a+b^2', '(a-b)^2', 'a*b^2', 'a^2-b*c', '(a+b)^2/c', 'a^2+b^2', 'a-(b-c)^2'], { a: R9, b: function () { return ri(1, 6); }, c: R9 }); } },
      { name: 'With negatives', gen: function () { return bedmas(['a+b*c', 'a*(b-c)', 'a-b^2', '(a+b)*c', 'a*b-c*d', 'a^2+b*c', '(a-b)/c'], { a: RN, b: RN, c: RN, d: RN }); } }
    ]
  });

  // Fractions
  drill({
    id: 'fractions', group: 'Number skills', title: 'Fractions', pad: 'frac',
    blurb: 'Simplify, add, subtract, multiply and divide. Type answers like 3/4.', helps: 'slopes, equations and anywhere fractions show up',
    levels: [
      { name: 'Simplify', gen: fracSimplify },
      { name: 'Add and subtract', gen: function () { return fracAdd(false); } },
      { name: 'Multiply', gen: function () { return fracMul(false); } },
      { name: 'Divide', gen: function () { return fracMul(true); } },
      { name: 'Mixed, with negatives', gen: function () { var k = ri(0, 2); return k === 0 ? fracAdd(true) : fracMul(k === 2, true); } }
    ]
  });
  function rf(maxD) { var q = ri(2, maxD), p = ri(1, q - 1); return frac(p, q); }
  function fracSimplify() {
    var b = frac(ri(1, 9), ri(2, 12)); if (b[1] === 1) b = [1, ri(2, 9)]; b = frac(b[0], b[1]); var k = ri(2, 9), p = b[0] * k, q = b[1] * k, g = gcd(p, q);
    return { q: 'Simplify ' + K('\\frac{' + p + '}{' + q + '}'), type: 'frac', ans: b, simplest: true,
      how: '<p>The greatest common factor of ' + p + ' and ' + q + ' is ' + g + '. Divide the top and bottom by ' + g + ':</p>' + eqRows([['\\frac{' + p + '}{' + q + '} = \\frac{' + p + '\\div ' + g + '}{' + q + '\\div ' + g + '} = ' + fL(b), '']]) };
  }
  function fracAdd(neg) {
    var a = rf(Math.random() < .4 ? 9 : 12), b = rf(12), op = pick(['+', '-']);
    if (Math.random() < .35) b = frac(ri(1, a[1] - 1 || 1), a[1]);             // sometimes the same denominator
    if (neg) { if (Math.random() < .5) a = [-a[0], a[1]]; if (Math.random() < .5) b = [-b[0], b[1]]; }
    var l = a[1] * b[1] / gcd(a[1], b[1]), ka = l / a[1], kb = l / b[1], top = a[0] * ka + (op === '+' ? 1 : -1) * b[0] * kb, ans = frac(top, l);
    var rows = [[fL(a) + ' ' + op + ' ' + (b[0] < 0 ? '\\left(' + fL(b) + '\\right)' : fL(b)), '']];
    if (ka !== 1 || kb !== 1) rows.push(['= ' + fT(a[0] * ka, l) + ' ' + op + ' ' + (b[0] < 0 ? '\\left(' + fT(b[0] * kb, l) + '\\right)' : '\\frac{' + (b[0] * kb) + '}{' + l + '}'), 'common denominator ' + l]);
    rows.push(['= ' + fT(top, l), op === '+' ? 'add the tops' : 'subtract the tops']);
    if (ans[1] !== l) rows.push(['= ' + fL(ans), 'simplify']);
    return { q: K(rows[0][0]), type: 'frac', ans: ans, simplest: true, how: '<p>Get a common denominator, then ' + (op === '+' ? 'add' : 'subtract') + ' the numerators:</p>' + eqRows(rows) };
  }
  function fracMul(div, neg) {
    var a = rf(10), b = rf(10); if (neg) { if (Math.random() < .5) a = [-a[0], a[1]]; if (Math.random() < .6) b = [-b[0], b[1]]; }
    var bb = div ? frac(b[1], b[0]) : b, ans = frac(a[0] * bb[0], a[1] * bb[1]);
    var sb = b[0] < 0 ? '\\left(' + fL(b) + '\\right)' : fL(b), rows = [[fL(a) + (div ? ' \\div ' : ' \\times ') + sb, '']];
    if (div) rows.push(['= ' + fL(a) + ' \\times ' + (bb[0] < 0 ? '\\left(' + fL(bb) + '\\right)' : fL(bb)), 'flip the second fraction and multiply']);
    rows.push(['= ' + fT(a[0] * bb[0], a[1] * bb[1]), 'top × top, bottom × bottom']);
    if (!(ans[0] === a[0] * bb[0] && ans[1] === a[1] * bb[1])) rows.push(['= ' + fL(ans), 'simplify']);
    return { q: K(rows[0][0]), type: 'frac', ans: ans, simplest: true, how: eqRows(rows) };
  }

  // Squares, roots and powers
  drill({
    id: 'powers', group: 'Number skills', title: 'Squares, square roots and powers', pad: 'int', sprint: true,
    blurb: '7², √81, 2⁵, ∛64, …', helps: 'exponents, radicals and polynomials',
    levels: [
      { name: 'Squares to 12²', gen: function () { var n = ri(1, 12); return { q: K(n + '^2'), type: 'int', ans: n * n, how: '<p>' + K(n + '^2') + ' means ' + n + ' × ' + n + ' = ' + n * n + '.</p>', fact: n + '^2' }; } },
      { name: 'Square roots', gen: function () { var n = ri(1, 15); return { q: K('\\sqrt{' + n * n + '}'), type: 'int', ans: n, how: '<p>Which number times itself is ' + n * n + '? ' + n + ' × ' + n + ' = ' + n * n + ', so ' + K('\\sqrt{' + n * n + '} = ' + n) + '.</p>', fact: 'r' + n }; } },
      { name: 'Squares and roots to 20', gen: function () { var n = ri(11, 20); return Math.random() < .5 ? { q: K(n + '^2'), type: 'int', ans: n * n, how: '<p>' + n + ' × ' + n + ' = ' + n * n + '.</p>' } : { q: K('\\sqrt{' + n * n + '}'), type: 'int', ans: n, how: '<p>' + n + ' × ' + n + ' = ' + n * n + ', so ' + K('\\sqrt{' + n * n + '} = ' + n) + '.</p>' }; } },
      { name: 'Powers', gen: powerQ },
      { name: 'Cubes and cube roots', gen: function () { var n = ri(1, 6), neg = Math.random() < .3 ? -1 : 1, c = n * neg; return Math.random() < .5 ? { q: K(P(c) + '^3'), type: 'int', ans: c * c * c, how: '<p>' + K(P(c) + '^3') + ' = ' + m(c) + ' × ' + m(c) + ' × ' + m(c) + ' = ' + m(c * c * c) + '.</p>' } : { q: K('\\sqrt[3]{' + L(c * c * c) + '}'), type: 'int', ans: c, how: '<p>Which number times itself three times is ' + m(c * c * c) + '? ' + m(c) + ' × ' + m(c) + ' × ' + m(c) + ' = ' + m(c * c * c) + '.</p>' }; } }
    ]
  });
  function powerQ() {
    var b = pick([2, 2, 2, 3, 3, 4, 5, 10, -2, -3]), maxE = { 2: 8, '-2': 6, 3: 5, '-3': 4, 4: 4, 5: 4, 10: 6 }[b], e = ri(0, maxE), v = Math.pow(b, e);
    var rep = e === 0 ? 'Any (non-zero) number to the power 0 is 1.' : (e === 1 ? 'A power of 1 is just the base.' : Array(e + 1).join(m(b) + ' × ').replace(/ × $/, '') + ' = ' + m(v) + '.');
    return { q: K(P(b) + '^{' + e + '}'), type: 'int', ans: v, how: '<p>' + rep + '</p>' };
  }

  // Factors and GCF
  drill({
    id: 'gcf', group: 'Number skills', title: 'Greatest common factor', pad: 'expr',
    blurb: 'The biggest number (and variables) that goes into everything.', helps: 'factoring',
    levels: [
      { name: 'Two numbers', gen: function () { return gcfQ(2, 6, 2); } },
      { name: 'Bigger numbers', gen: function () { return gcfQ(2, 15, 2); } },
      { name: 'Three numbers', gen: function () { return gcfQ(3, 8, 2); } },
      { name: 'Terms with variables', gen: gcfMono }
    ]
  });
  function gcfQ(count, maxM, minM) {
    var g = ri(2, 12), ms, tries = 0;
    do { ms = []; for (var i = 0; i < count; i++) ms.push(ri(minM === 2 ? 1 : minM, maxM)); tries++; } while ((ms.reduce(gcd) !== 1 || new Set(ms).size < count) && tries < 200);
    var ns = ms.map(function (k) { return k * g; });
    return { q: 'GCF of ' + ns.map(function (n) { return K(String(n)); }).join(', '), type: 'int', ans: g,
      how: '<p>' + ns.map(function (n, i) { return n + ' = ' + g + ' × ' + ms[i]; }).join(', ') + '.</p><p>' + g + ' goes into all of them, and what is left (' + ms.join(', ') + ') shares no other factor, so the GCF is ' + g + '.</p>' };
  }
  function gcfMono() {
    var g = ri(2, 8), m1 = ri(1, 5), m2 = ri(1, 5); while (gcd(m1, m2) !== 1 || m1 === m2) { m1 = ri(1, 5); m2 = ri(1, 5); }
    var e1 = ri(1, 4), e2 = ri(1, 4), y = Math.random() < .4, f1 = ri(0, 2), f2 = ri(0, 2);
    var mono = function (c, e, f) { return c + (e ? 'x' + (e > 1 ? '^' + e : '') : '') + (y && f ? 'y' + (f > 1 ? '^' + f : '') : ''); };
    var a = mono(g * m1, e1, f1), b = mono(g * m2, e2, f2), ge = Math.min(e1, e2), gf = y ? Math.min(f1, f2) : 0, ans = mono(g, ge, gf);
    var tx = function (s) { return s.replace(/\^(\d)/g, '^{$1}'); };
    return { q: 'GCF of ' + K(tx(a)) + ' and ' + K(tx(b)), type: 'expr', ans: HW.poly.parse(ans), terms: 1,
      how: '<p>Numbers: the GCF of ' + g * m1 + ' and ' + g * m2 + ' is ' + g + '. Variables: take each letter to its <b>smallest</b> power that appears in both' + (ge ? ' (x to the ' + ge + ')' : '') + '.</p><p>GCF = ' + K(tx(ans)) + '</p>' };
  }

  // Product and sum (the factoring helper)
  drill({
    id: 'prodsum', group: 'Number skills', title: 'Product and sum', pad: 'pair', sprint: true,
    blurb: 'Find two numbers that multiply to one number and add to another — the key to factoring trinomials.', helps: 'factoring trinomials',
    levels: [
      { name: 'Both positive', gen: function () { return psQ(1, 9, 'pos'); } },
      { name: 'Sum negative', gen: function () { return psQ(1, 9, 'negsum'); } },
      { name: 'Product negative', gen: function () { return psQ(1, 9, 'negprod'); } },
      { name: 'Any signs, bigger', gen: function () { return psQ(1, 15, 'any'); } }
    ]
  });
  function psQ(lo, hi, kind) {
    var a = ri(lo, hi), b = ri(lo, hi);
    if (kind === 'negsum') { a = -a; b = -b; } else if (kind === 'negprod') { if (a === b) b++; if (Math.random() < .5) a = -a; else b = -b; } else if (kind === 'any') { if (Math.random() < .5) a = -a; if (Math.random() < .5) b = -b; }
    var p = a * b, s = a + b, list = [];
    for (var d = 1; d <= Math.abs(p); d++) if (p % d === 0 && d <= Math.abs(p) / d) list.push([d, p / d]);
    var rows = list.map(function (f) { return f[0] + ' × ' + f[1]; }).join(', ');
    return { q: 'Two numbers that <b>multiply</b> to ' + K(L(p)) + ' and <b>add</b> to ' + K(L(s)), type: 'pair', ans: [a, b], ordered: false, labels: ['', ''],
      how: '<p>' + (p < 0 ? 'The product is negative, so one number is negative and one is positive. ' : (s < 0 ? 'The product is positive and the sum is negative, so both are negative. ' : 'The product and sum are positive, so both are positive. ')) + 'List the factor pairs of ' + Math.abs(p) + ': ' + rows + '.</p><p>' + m(a) + ' × ' + m(b) + ' = ' + m(p) + ' and ' + m(a) + ' + ' + m(b) + ' = ' + m(s) + '.</p>' };
  }

  // Like terms
  drill({
    id: 'like', group: 'Algebra skills', title: 'Combining like terms', pad: 'expr',
    blurb: 'Collect x’s with x’s and numbers with numbers.', helps: 'polynomials, equations and everything after',
    levels: [
      { name: 'x and numbers', gen: function () { return likeQ(['x', ''], 4); } },
      { name: 'x² and x', gen: function () { return likeQ(['x^2', 'x', ''], 5); } },
      { name: 'Two variables', gen: function () { return likeQ(['x', 'y', ''], 5); } },
      { name: 'Mixed', gen: function () { return likeQ(pick([['x^2', 'x', ''], ['x', 'y', 'xy'], ['a', 'b', ''], ['x^2', 'xy', 'y^2']]), 6); } }
    ]
  });
  function likeQ(kinds, n) {
    for (var tries = 0; tries < 50; tries++) {
      var ts = [], used = {};
      for (var i = 0; i < n; i++) { var k = kinds[i % kinds.length]; if (i >= kinds.length) k = pick(kinds); ts.push({ k: k, c: nz(-9, 9) }); }
      ts = shuffle(ts); var sum = {}; ts.forEach(function (t) { sum[t.k] = (sum[t.k] || 0) + t.c; });
      var kinds2 = Object.keys(sum).filter(function (k) { return sum[k] !== 0; });
      if (kinds2.length < 2 || ts.filter(function (t, i) { return ts.findIndex(function (u) { return u.k === t.k; }) !== i; }).length < 2) continue;
      var expr = ts.map(function (t, i) { return sgnTerm(t.c, t.k, i === 0); }).join('');
      var ans = HW.poly.parse(expr.replace(/\{|\}/g, '')), groups = kinds.filter(function (k) { return ts.some(function (t) { return t.k === k; }); });
      var how = '<p>Group the like terms (same letters, same powers), then add their coefficients:</p>' + eqRows(groups.map(function (k) {
        var cs = ts.filter(function (t) { return t.k === k; }).map(function (t) { return t.c; }), s = cs.reduce(function (a, b) { return a + b; }, 0);
        var lab = k ? K(k) + ' terms' : 'numbers';
        if (cs.length === 1) return [sgnTerm(cs[0], k, true), lab + ' (only one — it stays)'];
        return [cs.map(function (c, i) { return sgnTerm(c, k, i === 0); }).join('') + ' = ' + (s ? sgnTerm(s, k, true) : '0'), lab];
      })) + '<p>Answer: ' + K(HW.poly.tex(ans)) + '</p>';
      return { q: 'Simplify ' + K(expr), type: 'expr', ans: ans, terms: HW.poly.count(ans), how: how };
    }
    return likeQ(kinds, n);
  }

  // Distributing
  drill({
    id: 'distribute', group: 'Algebra skills', title: 'The distributive property', pad: 'expr',
    blurb: 'Multiply the outside term by every term inside the brackets.', helps: 'polynomials, factoring and equations',
    levels: [
      { name: 'a(x + b)', gen: function () { var a = ri(2, 9), b = nz(-9, 9); return distQ(String(a), lin(1, b), a); } },
      { name: 'Negative outside', gen: function () { var a = -ri(1, 9), b = nz(-9, 9), c = nz(-9, 9); return distQ(a === -1 ? '-' : String(a), lin(b, c), a); } },
      { name: 'Variable outside', gen: function () { var a = nz(-6, 6), b = nz(-6, 6), c = nz(-9, 9); return distQ((a === 1 ? '' : a === -1 ? '-' : a) + 'x', lin(b, c), a, true); } },
      { name: 'Expand and collect', gen: distCollect }
    ]
  });
  function distQ(outTex, inTex, a, xOut) {
    var expr = outTex + '(' + inTex + ')', p = HW.poly.parse(expr), terms = HW.poly.terms(HW.poly.parse(inTex));
    var outP = HW.poly.parse(xOut ? (a === 1 ? 'x' : a === -1 ? '-x' : a + 'x') : String(a));
    var parts = terms.map(function (t) { var tp = {}; tp[t.key] = { c: t.c, v: t.v }; return K(HW.poly.btex(outP) + '\\times' + HW.poly.btex(tp)) + ' = ' + K(HW.poly.tex(HW.poly.mul(outP, tp))); });
    return { q: 'Expand ' + K(expr), type: 'expr', ans: p, terms: HW.poly.count(p), noBrackets: true,
      how: '<p>Multiply ' + K(HW.poly.tex(outP)) + ' by <b>each</b> term inside (watch the signs):</p><p>' + parts.join('<br>') + '</p><p>Answer: ' + K(HW.poly.tex(p)) + '</p>' };
  }
  function distCollect() {
    var a = nz(-5, 6), b = nz(-6, 6), c = nz(-5, 6), d = nz(-6, 6), s = (a === 1 ? '' : a === -1 ? '-' : a) + '(x' + sgnTerm(b, '', false) + ')' + (c < 0 ? ' - ' : ' + ') + (Math.abs(c) === 1 ? '' : Math.abs(c)) + '(x' + sgnTerm(d, '', false) + ')';
    var p = HW.poly.parse(s.replace(/\s/g, '')); if (HW.poly.count(p) < 2) return distCollect();
    var e1 = HW.poly.parse((a === 1 ? '' : a === -1 ? '-' : a) + '(x' + sgnTerm(b, '', false) + ')'), e2 = HW.poly.parse((c === -1 ? '-' : c) + '(x' + sgnTerm(d, '', false) + ')');
    return { q: 'Expand and simplify ' + K(s), type: 'expr', ans: p, terms: HW.poly.count(p), noBrackets: true,
      how: eqRows([[s, ''], ['= ' + HW.poly.tex(e1) + (HW.poly.lead(e2)[0] < 0 ? '' : ' + ') + HW.poly.tex(e2), 'distribute each bracket (the sign in front goes with it)'], ['= ' + HW.poly.tex(p), 'collect like terms']]) };
  }

  // Substituting
  drill({
    id: 'evaluate', group: 'Algebra skills', title: 'Substituting into expressions', pad: 'int',
    blurb: 'Replace the letter with its number — in brackets — and work it out.', helps: 'functions and linear relations',
    levels: [
      { name: 'ax + b', gen: function () { return evalQ(lin(nz(-9, 9), nz(-12, 12)), ri(1, 9)); } },
      { name: 'Negative values', gen: function () { return evalQ(lin(nz(-9, 9), nz(-12, 12)), nz(-9, -1)); } },
      { name: 'With x²', gen: function () { return evalQ(sgnTerm(nz(-4, 4), 'x^2', true) + sgnTerm(nz(-6, 6), 'x', false) + sgnTerm(nz(-9, 9), '', false), nz(-5, 5)); } },
      { name: 'Two variables', gen: evalXY }
    ]
  });
  function evalQ(expr, x) {
    var p = HW.poly.parse(expr), ts = HW.poly.sorted(p, { order: 'desc', var: 'x' }), val = HW.poly.at(p, { x: x });
    var sub = ts.map(function (t, i) {
      var c = t.c[0], e = t.v.x || 0, body = e === 0 ? String(Math.abs(c)) : (Math.abs(c) === 1 ? '' : Math.abs(c)) + P(x) + (e === 2 ? '^2' : '');
      if (e && Math.abs(c) !== 1) body = Math.abs(c) + '\\times ' + P(x) + (e === 2 ? '^2' : '');
      return (i === 0 ? (c < 0 ? '-' : '') : (c < 0 ? ' - ' : ' + ')) + body;
    }).join('');
    var vals = ts.map(function (t) { return t.c[0] * Math.pow(x, t.v.x || 0); });
    return { q: 'Find the value of ' + K(HW.poly.tex(p)) + ' when ' + K('x = ' + L(x)), type: 'int', ans: val,
      how: '<p>Put ' + K(P(x)) + ' in for every ' + K('x') + ' (brackets keep the sign with it)' + (ts.some(function (t) { return t.v.x === 2; }) ? ' and square before multiplying' : '') + ':</p>' + eqRows([[sub, ''], ['= ' + vals.map(function (v, i) { return i === 0 ? L(v) : (v < 0 ? ' - ' + Math.abs(v) : ' + ' + v); }).join(''), ''], ['= ' + L(val), '']]) };
  }
  function evalXY() {
    var a = nz(-6, 6), b = nz(-6, 6), c = nz(-9, 9), x = nz(-6, 6), y = nz(-6, 6), expr = sgnTerm(a, 'x', true) + sgnTerm(b, 'y', false) + sgnTerm(c, '', false), val = a * x + b * y + c;
    return { q: 'Find the value of ' + K(expr) + ' when ' + K('x = ' + L(x)) + ' and ' + K('y = ' + L(y)), type: 'int', ans: val,
      how: eqRows([[L(a) + '\\times ' + P(x) + (b < 0 ? ' - ' : ' + ') + Math.abs(b) + '\\times ' + P(y) + (c < 0 ? ' - ' : ' + ') + Math.abs(c), 'replace x and y'], ['= ' + L(a * x) + (b * y < 0 ? ' - ' : ' + ') + Math.abs(b * y) + (c < 0 ? ' - ' : ' + ') + Math.abs(c), 'multiply'], ['= ' + L(val), 'add and subtract']]) };
  }

  // Equations
  drill({
    id: 'eq1', group: 'Algebra skills', title: 'One-step equations', pad: 'int', sprint: true,
    blurb: 'Undo the operation: do the opposite to both sides.', helps: 'linear relations and equations',
    levels: [
      { name: 'x + a and ax', gen: function () { return eq1(false); } },
      { name: 'With negatives', gen: function () { return eq1(true); } },
      { name: 'Dividing and a − x', gen: eq1b }
    ]
  });
  function solveRows(rows, x) { var last = rows[rows.length - 1][0]; if (last !== 'x = ' + L(x)) rows = rows.concat([['x = ' + L(x), '']]); return eqRows(rows); }
  function eq1(neg) {
    var x = neg ? nz(-12, 12) : ri(1, 12), k = ri(0, 1);
    if (k === 0) { var a = neg ? nz(-15, 15) : ri(1, 15), op = a < 0 ? '-' : '+', c = x + a; return { q: K('x ' + op + ' ' + Math.abs(a) + ' = ' + L(c)), type: 'int', ans: x, eq: true, how: '<p>The opposite of ' + (op === '+' ? 'adding ' : 'subtracting ') + Math.abs(a) + ' is ' + (op === '+' ? 'subtracting ' : 'adding ') + Math.abs(a) + '. Do it to both sides:</p>' + solveRows([['x ' + op + ' ' + Math.abs(a) + ' = ' + L(c), ''], ['x = ' + L(c) + (op === '+' ? ' - ' : ' + ') + Math.abs(a), (op === '+' ? 'subtract ' : 'add ') + Math.abs(a) + (op === '+' ? ' from' : ' to') + ' both sides']], x) }; }
    var b = neg ? nz(-9, 9) : ri(2, 9); if (b === 1 || b === -1) b = neg ? -ri(2, 9) : ri(2, 9);
    return { q: K(b + 'x = ' + L(b * x)), type: 'int', ans: x, eq: true, how: '<p>' + K(b + 'x') + ' means ' + m(b) + ' times x. The opposite of multiplying is dividing:</p>' + solveRows([[b + 'x = ' + L(b * x), ''], ['x = \\frac{' + L(b * x) + '}{' + L(b) + '}', 'divide both sides by ' + m(b)]], x) };
  }
  function eq1b() {
    var x = nz(-10, 10), k = ri(0, 2);
    if (k === 0) { var d = pick([2, 3, 4, 5, -2, -3]), c = x; x = c * d; return { q: K('\\frac{x}{' + L(d) + '} = ' + L(c)), type: 'int', ans: x, eq: true, how: '<p>x is divided by ' + m(d) + '. The opposite is multiplying by ' + m(d) + ':</p>' + solveRows([['\\frac{x}{' + L(d) + '} = ' + L(c), ''], ['x = ' + L(c) + '\\times ' + P(d), 'multiply both sides by ' + m(d)]], x) }; }
    if (k === 1) { var a = ri(2, 15), r = a - x; return { q: K(a + ' - x = ' + L(r)), type: 'int', ans: x, eq: true, how: '<p>Get the x on its own first, then deal with its negative sign:</p>' + solveRows([[a + ' - x = ' + L(r), ''], ['-x = ' + L(r - a), 'subtract ' + a + ' from both sides'], ['x = ' + L(a - r), 'multiply (or divide) both sides by −1']], x) }; }
    return { q: K('-x = ' + L(-x)), type: 'int', ans: x, eq: true, how: '<p>' + K('-x') + ' means −1 times x. Divide both sides by −1 (it flips the sign):</p>' + solveRows([['-x = ' + L(-x), '']], x) };
  }
  drill({
    id: 'eq2', group: 'Algebra skills', title: 'Two-step equations', pad: 'int',
    blurb: 'Undo + and − first, then × and ÷.', helps: 'linear relations and equations',
    levels: [
      { name: 'ax + b = c', gen: function () { return eq2(false); } },
      { name: 'With negatives', gen: function () { return eq2(true); } },
      { name: 'Fractions and b − ax', gen: eq2b }
    ]
  });
  function eq2(neg) {
    var x = neg ? nz(-10, 10) : ri(1, 10), a = neg ? nz(-9, 9) : ri(2, 9), b = neg ? nz(-20, 20) : ri(1, 20); if (Math.abs(a) === 1) a = a * ri(2, 6);
    var c = a * x + b, lhs = lin(a, b);
    return { q: K(lhs + ' = ' + L(c)), type: 'int', ans: x, eq: true,
      how: '<p>Undo the ' + (b > 0 ? '+ ' + b : '− ' + Math.abs(b)) + ' first, then the × ' + m(a) + ':</p>' + solveRows([[lhs + ' = ' + L(c), ''], [a + 'x = ' + L(c - b), (b > 0 ? 'subtract ' + b + ' from' : 'add ' + Math.abs(b) + ' to') + ' both sides'], ['x = \\frac{' + L(c - b) + '}{' + L(a) + '}', 'divide both sides by ' + m(a)]], x) };
  }
  function eq2b() {
    var x, k = ri(0, 1);
    if (k === 0) { var d = pick([2, 3, 4, 5]), q = nz(-8, 8); x = q * d; var b = nz(-12, 12), c = q + b; return { q: K('\\frac{x}{' + d + '}' + sgnTerm(b, '', false) + ' = ' + L(c)), type: 'int', ans: x, eq: true, how: solveRows([['\\frac{x}{' + d + '}' + sgnTerm(b, '', false) + ' = ' + L(c), ''], ['\\frac{x}{' + d + '} = ' + L(q), (b > 0 ? 'subtract ' + b + ' from' : 'add ' + Math.abs(b) + ' to') + ' both sides'], ['x = ' + L(q) + '\\times ' + d, 'multiply both sides by ' + d]], x) }; }
    x = nz(-9, 9); var a = ri(2, 7), bb = ri(1, 20), cc = bb - a * x;
    return { q: K(bb + ' - ' + a + 'x = ' + L(cc)), type: 'int', ans: x, eq: true, how: solveRows([[bb + ' - ' + a + 'x = ' + L(cc), ''], ['-' + a + 'x = ' + L(cc - bb), 'subtract ' + bb + ' from both sides'], ['x = \\frac{' + L(cc - bb) + '}{-' + a + '}', 'divide both sides by −' + a]], x) };
  }
  drill({
    id: 'eq3', group: 'Algebra skills', title: 'Multi-step equations', pad: 'int',
    blurb: 'Brackets and x on both sides.', helps: 'equations of lines and systems',
    levels: [
      { name: 'a(x + b) = c', gen: function () { var x = nz(-9, 9), a = nz(-6, 6), b = nz(-9, 9); if (Math.abs(a) === 1) a = 2 * a; var c = a * (x + b), lhs = L(a) + '(x' + sgnTerm(b, '', false) + ')'; return { q: K(lhs + ' = ' + L(c)), type: 'int', ans: x, eq: true, how: solveRows([[lhs + ' = ' + L(c), ''], [lin(a, a * b) + ' = ' + L(c), 'distribute'], [a + 'x = ' + L(c - a * b), (a * b > 0 ? 'subtract ' + a * b + ' from' : 'add ' + Math.abs(a * b) + ' to') + ' both sides'], ['x = \\frac{' + L(c - a * b) + '}{' + L(a) + '}', 'divide both sides by ' + m(a)]], x) }; } },
      { name: 'x on both sides', gen: function () { return eqBoth(false); } },
      { name: 'Brackets and both sides', gen: function () { return eqBoth(true); } }
    ]
  });
  function eqBoth(br) {
    var x = nz(-9, 9), a, c, b, d, lhs, L1;
    do { a = nz(-9, 9); c = nz(-9, 9); } while (a === c || Math.abs(a - c) > 6);
    b = nz(-15, 15); d = (a - c) * x + b;
    if (br) { var k = pick([2, 3]); if (a % k || b % k) { a = a * k; b = b * k; if (a === c) c++; d = (a - c) * x + b; } lhs = k + '(' + lin(a / k, b / k) + ')'; L1 = lin(a, b); }
    else { lhs = lin(a, b); L1 = lhs; }
    var rhs = lin(c, d), rows = [[lhs + ' = ' + rhs, '']];
    if (br) rows.push([L1 + ' = ' + rhs, 'distribute']);
    rows.push([lin(a - c, b) + ' = ' + L(d), (c > 0 ? 'subtract ' + (c === 1 ? '' : c) + 'x from' : 'add ' + (c === -1 ? '' : Math.abs(c)) + 'x to') + ' both sides']);
    rows.push([lin(a - c, 0) + ' = ' + L(d - b), (b > 0 ? 'subtract ' + b + ' from' : 'add ' + Math.abs(b) + ' to') + ' both sides']);
    if (a - c !== 1) rows.push(['x = \\frac{' + L(d - b) + '}{' + L(a - c) + '}', 'divide both sides by ' + m(a - c)]);
    return { q: K(lhs + ' = ' + rhs), type: 'int', ans: x, eq: true, how: '<p>Get the x terms on one side and the numbers on the other:</p>' + solveRows(rows, x) };
  }

  // Rearranging formulas (multiple choice)
  var FORMULAS = [
    // [lvl, formula, solve-for, right, [wrong…], steps]
    [1, 'A = lw', 'w', '\\frac{A}{l}', ['A - l', 'Al', '\\frac{l}{A}'], [['A = lw', ''], ['\\frac{A}{l} = w', 'divide both sides by l']]],
    [1, 'd = st', 't', '\\frac{d}{s}', ['ds', '\\frac{s}{d}', 'd - s'], [['d = st', ''], ['\\frac{d}{s} = t', 'divide both sides by s']]],
    [1, 'a + b = c', 'b', 'c - a', ['c + a', 'a - c', '\\frac{c}{a}'], [['a + b = c', ''], ['b = c - a', 'subtract a from both sides']]],
    [1, 'V = lwh', 'h', '\\frac{V}{lw}', ['Vlw', 'V - lw', '\\frac{lw}{V}'], [['V = lwh', ''], ['\\frac{V}{lw} = h', 'divide both sides by lw']]],
    [1, 'C = 2\\pi r', 'r', '\\frac{C}{2\\pi}', ['2\\pi C', 'C - 2\\pi', '\\frac{2\\pi}{C}'], [['C = 2\\pi r', ''], ['\\frac{C}{2\\pi} = r', 'divide both sides by 2π']]],
    [1, 'I = Prt', 'r', '\\frac{I}{Pt}', ['IPt', 'I - Pt', '\\frac{Pt}{I}'], [['I = Prt', ''], ['\\frac{I}{Pt} = r', 'divide both sides by Pt']]],
    [1, 'y = x - k', 'x', 'y + k', ['y - k', 'k - y', 'yk'], [['y = x - k', ''], ['y + k = x', 'add k to both sides']]],
    [2, 'y = mx + b', 'b', 'y - mx', ['y + mx', 'mx - y', '\\frac{y}{mx}'], [['y = mx + b', ''], ['y - mx = b', 'subtract mx from both sides']]],
    [2, 'y = mx + b', 'x', '\\frac{y - b}{m}', ['\\frac{y + b}{m}', '\\frac{y}{m} - b', 'm(y - b)'], [['y = mx + b', ''], ['y - b = mx', 'subtract b from both sides'], ['\\frac{y - b}{m} = x', 'divide both sides by m']]],
    [2, 'y = mx + b', 'm', '\\frac{y - b}{x}', ['\\frac{y + b}{x}', '\\frac{y}{x} - b', 'x(y - b)'], [['y = mx + b', ''], ['y - b = mx', 'subtract b from both sides'], ['\\frac{y - b}{x} = m', 'divide both sides by x']]],
    [2, 'P = 2l + 2w', 'l', '\\frac{P - 2w}{2}', ['P - 2w', '\\frac{P + 2w}{2}', '\\frac{P}{2} - 2w'], [['P = 2l + 2w', ''], ['P - 2w = 2l', 'subtract 2w from both sides'], ['\\frac{P - 2w}{2} = l', 'divide both sides by 2']]],
    [2, 'A = \\frac{1}{2}bh', 'h', '\\frac{2A}{b}', ['\\frac{A}{2b}', '2Ab', '\\frac{b}{2A}'], [['A = \\frac{1}{2}bh', ''], ['2A = bh', 'multiply both sides by 2'], ['\\frac{2A}{b} = h', 'divide both sides by b']]],
    [2, 'S = 2r + h', 'r', '\\frac{S - h}{2}', ['\\frac{S + h}{2}', 'S - 2h', '\\frac{S}{2} - h'], [['S = 2r + h', ''], ['S - h = 2r', 'subtract h from both sides'], ['\\frac{S - h}{2} = r', 'divide both sides by 2']]],
    [3, 'F = \\frac{9}{5}C + 32', 'C', '\\frac{5}{9}(F - 32)', ['\\frac{5}{9}F - 32', '\\frac{9}{5}(F - 32)', '\\frac{5}{9}(F + 32)'], [['F = \\frac{9}{5}C + 32', ''], ['F - 32 = \\frac{9}{5}C', 'subtract 32 from both sides'], ['\\frac{5}{9}(F - 32) = C', 'multiply both sides by 5/9']]],
    [3, 'Ax + By = C', 'y', '\\frac{C - Ax}{B}', ['\\frac{C + Ax}{B}', 'C - \\frac{Ax}{B}', '\\frac{Ax - C}{B}'], [['Ax + By = C', ''], ['By = C - Ax', 'subtract Ax from both sides'], ['y = \\frac{C - Ax}{B}', 'divide both sides by B']]],
    [3, 'm = \\frac{y - b}{x}', 'y', 'mx + b', ['mx - b', '\\frac{m}{x} + b', 'm + b - x'], [['m = \\frac{y - b}{x}', ''], ['mx = y - b', 'multiply both sides by x'], ['mx + b = y', 'add b to both sides']]],
    [3, 'A = \\frac{a + b}{2}h', 'h', '\\frac{2A}{a + b}', ['\\frac{A}{2(a + b)}', '2A - (a + b)', '\\frac{2A}{a} + b'], [['A = \\frac{a + b}{2}h', ''], ['2A = (a + b)h', 'multiply both sides by 2'], ['\\frac{2A}{a + b} = h', 'divide both sides by (a + b)']]]
  ];
  var LETTERS = ['a', 'b', 'c', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w'];
  function genericFormula(lvl) {                       // letters chosen at random, so the practice never runs out
    var Ls = shuffle(LETTERS), A = Ls[0], B = Ls[1], C = Ls[2], D = Ls[3], k = ri(0, lvl === 1 ? 1 : 3);
    if (k === 0) return [lvl, A + ' = ' + B + C, C, '\\frac{' + A + '}{' + B + '}', [A + B, A + ' - ' + B, '\\frac{' + B + '}{' + A + '}'], [[A + ' = ' + B + C, ''], ['\\frac{' + A + '}{' + B + '} = ' + C, 'divide both sides by ' + B]]];
    if (k === 1) return [lvl, A + ' = ' + B + ' - ' + C, B, A + ' + ' + C, [A + ' - ' + C, C + ' - ' + A, '\\frac{' + A + '}{' + C + '}'], [[A + ' = ' + B + ' - ' + C, ''], [A + ' + ' + C + ' = ' + B, 'add ' + C + ' to both sides']]];
    if (k === 2) return [lvl, A + ' = ' + B + C + ' + ' + D, C, '\\frac{' + A + ' - ' + D + '}{' + B + '}', ['\\frac{' + A + ' + ' + D + '}{' + B + '}', '\\frac{' + A + '}{' + B + '} - ' + D, B + '(' + A + ' - ' + D + ')'], [[A + ' = ' + B + C + ' + ' + D, ''], [A + ' - ' + D + ' = ' + B + C, 'subtract ' + D + ' from both sides'], ['\\frac{' + A + ' - ' + D + '}{' + B + '} = ' + C, 'divide both sides by ' + B]]];
    return [lvl, A + ' = \\frac{' + B + '}{' + C + '}', B, A + C, ['\\frac{' + A + '}{' + C + '}', A + ' + ' + C, '\\frac{' + C + '}{' + A + '}'], [[A + ' = \\frac{' + B + '}{' + C + '}', ''], [A + C + ' = ' + B, 'multiply both sides by ' + C]]];
  }
  drill({
    id: 'formulas', group: 'Algebra skills', title: 'Isolating a variable in a formula', pad: 'mc',
    blurb: 'Rearrange a formula to get one letter on its own.', helps: 'slope and equations of lines',
    levels: [1, 2, 3].map(function (lv) { return { name: ['One step', 'Two steps', 'Harder'][lv - 1], gen: function () { return formulaQ(lv); } }; })
  });
  function formulaQ(lv) {
    var f = Math.random() < .55 ? pick(FORMULAS.filter(function (r) { return r[0] === lv; })) : genericFormula(Math.min(lv, 2));
    var opts = shuffle([f[3]].concat(f[4]));
    return { q: 'Solve ' + K(f[1]) + ' for ' + K(f[2]) + '.', type: 'mc', choices: opts.map(function (o) { return K(f[2] + ' = ' + o); }), ans: opts.indexOf(f[3]),
      how: '<p>Undo what is being done to ' + K(f[2]) + ', doing the same thing to both sides:</p>' + eqRows(f[5]) };
  }

  // Plotting points
  drill({
    id: 'coords', group: 'Graphing', title: 'Plotting and reading points', pad: 'grid',
    blurb: 'Across first (x), then up or down (y).', helps: 'graphing relations and lines',
    levels: [
      { name: 'Plot: first quadrant', gen: function () { return plotQ(0, 9); } },
      { name: 'Plot: all quadrants', gen: function () { return plotQ(-9, 9); } },
      { name: 'Name the point', gen: function () { return nameQ(); } },
      { name: 'Mixed, with axes', gen: function () { return Math.random() < .5 ? plotQ(-9, 9, true) : nameQ(true); } }
    ]
  });
  function onAxis(lo, hi) { var v = ri(lo, hi); return Math.random() < .5 ? [0, v] : [v, 0]; }
  function plotQ(lo, hi, axes) {
    var pt = axes && Math.random() < .4 ? onAxis(lo, hi) : [ri(lo, hi), ri(lo, hi)];
    return { q: 'Plot the point ' + K('(' + L(pt[0]) + ',\\ ' + L(pt[1]) + ')') + ' — tap the grid.', type: 'plot', ans: pt, how: moveHow(pt) };
  }
  function nameQ(axes) {
    var pt = axes && Math.random() < .4 ? onAxis(-9, 9) : [nz(-9, 9), nz(-9, 9)];
    return { q: 'What are the coordinates of point ' + K('A') + '?', type: 'pair', ans: pt, ordered: true, show: pt, labels: ['x', 'y'], how: moveHow(pt) };
  }
  function moveHow(pt) {
    var x = pt[0], y = pt[1];
    return '<p>Start at the origin ' + K('(0,\\ 0)') + '. ' + (x ? 'Go ' + Math.abs(x) + ' ' + (x > 0 ? 'right' : 'left') : 'Don’t move left or right') + ' (that’s x = ' + m(x) + '), then ' + (y ? Math.abs(y) + ' ' + (y > 0 ? 'up' : 'down') : 'don’t move up or down') + ' (that’s y = ' + m(y) + ').</p>';
  }
  function gridSvg(ans, mark, show, wrong) {
    var R = 10, W = 320, s = W / (2 * R + 2), X = function (v) { return (v + R + 1) * s; }, Y = function (v) { return (R + 1 - v) * s; };
    var g = '<svg class="dr-grid" viewBox="0 0 ' + W + ' ' + W + '" role="img" aria-label="coordinate grid">';
    for (var v = -R; v <= R; v++) {
      g += '<line x1="' + X(v) + '" y1="' + Y(-R) + '" x2="' + X(v) + '" y2="' + Y(R) + '" stroke="' + (v ? '#e2ded4' : '#3a4254') + '" stroke-width="' + (v ? 1 : 1.6) + '"/>';
      g += '<line x1="' + X(-R) + '" y1="' + Y(v) + '" x2="' + X(R) + '" y2="' + Y(v) + '" stroke="' + (v ? '#e2ded4' : '#3a4254') + '" stroke-width="' + (v ? 1 : 1.6) + '"/>';
      if (v && v % 2 === 0) { g += '<text x="' + X(v) + '" y="' + (Y(0) + 11) + '" font-size="8.5" text-anchor="middle" fill="#6a7182">' + m(v) + '</text><text x="' + (X(0) - 4) + '" y="' + (Y(v) + 3) + '" font-size="8.5" text-anchor="end" fill="#6a7182">' + m(v) + '</text>'; }
    }
    g += '<text x="' + (X(R) + 6) + '" y="' + (Y(0) + 4) + '" font-size="11" font-style="italic" fill="#3a4254">x</text><text x="' + (X(0) + 5) + '" y="' + (Y(R) - 3) + '" font-size="11" font-style="italic" fill="#3a4254">y</text>';
    if (wrong && ans) {           // show the path to the right point
      g += '<path d="M' + X(0) + ' ' + Y(0) + ' H' + X(ans[0]) + ' V' + Y(ans[1]) + '" fill="none" stroke="#2f8a57" stroke-width="2" stroke-dasharray="5 3"/>';
      g += '<circle cx="' + X(ans[0]) + '" cy="' + Y(ans[1]) + '" r="6" fill="#2f8a57"/>';
    }
    if (show) g += '<circle cx="' + X(show[0]) + '" cy="' + Y(show[1]) + '" r="6" fill="#1e3a6e"/><text x="' + (X(show[0]) + 8) + '" y="' + (Y(show[1]) - 7) + '" font-size="13" font-weight="700" fill="#1e3a6e">A</text>';
    if (mark) g += '<circle cx="' + X(mark[0]) + '" cy="' + Y(mark[1]) + '" r="6.5" fill="' + (wrong ? '#c0504d' : '#2b55a0') + '" stroke="#fff" stroke-width="2"/>';
    g += '<rect class="dr-hit" x="0" y="0" width="' + W + '" height="' + W + '" fill="transparent"/>';
    return g + '</svg>';
  }
  function gridPoint(svg, e) { var b = svg.getBoundingClientRect(), R = 10, s = b.width / (2 * R + 2); return [Math.round((e.clientX - b.left) / s - R - 1), Math.round(R + 1 - (e.clientY - b.top) / s)]; }

  /* ---------------- answers ---------------- */
  function normText(s) { return String(s || '').replace(/[−–—]/g, '-').replace(/×/g, '*').replace(/÷/g, '/').replace(/²/g, '^2').replace(/³/g, '^3').trim(); }
  function readInt(s) { s = normText(s).replace(/^[a-z]\s*=\s*/i, '').replace(/\s+/g, ''); return /^[-+]?\d+$/.test(s) ? parseInt(s, 10) : null; }
  function readFrac(s) { var t = normText(s).replace(/\s+/g, ''), r = /^([-+]?)(\d+)(?:\/(-?\d+))?$/.exec(t); if (!r) return null; var p = +r[2] * (r[1] === '-' ? -1 : 1), q = r[3] ? +r[3] : 1; if (!q) return null; return [p, q]; }
  function topTerms(s) { var d = 0, n = 1; s = normText(s).replace(/\s+/g, ''); for (var i = 0; i < s.length; i++) { var c = s[i]; if (c === '(') d++; else if (c === ')') d--; else if ((c === '+' || c === '-') && d === 0 && i > 0 && s[i - 1] !== '^' && s[i - 1] !== '(' && s[i - 1] !== '+' && s[i - 1] !== '-') n++; } return n; }
  // → { ok:true } | { ok:false } | { retry:'message' } (right value, wrong form: try again without penalty)
  function check(q, val) {
    if (q.type === 'int') { var n = readInt(val); if (n == null) return { retry: 'Type a whole number (use − for negative).' }; return { ok: n === q.ans }; }
    if (q.type === 'frac') {
      var f = readFrac(val); if (!f) return { retry: 'Type a fraction like 3/4, or a whole number.' };
      var right = f[0] * q.ans[1] === q.ans[0] * f[1]; if (!right) return { ok: false };
      var red = frac(f[0], f[1]); if (q.simplest && (Math.abs(f[0]) !== Math.abs(red[0]) || Math.abs(f[1]) !== Math.abs(red[1]))) return { retry: 'Right value — now simplify it.' };
      return { ok: true };
    }
    if (q.type === 'expr') {
      var t = normText(val); if (!t) return { retry: 'Type your answer.' };
      var r = HW.poly.read(t); if (!r.ok) return { retry: 'I can’t read that — check your signs and powers (use ^ for powers, like x^2).' };
      if (!HW.poly.eq(r.p, q.ans)) return { ok: false };
      if (q.noBrackets && /\(/.test(t)) return { retry: 'Right value — now multiply out the brackets.' };
      if (q.terms && topTerms(t) > q.terms) return { retry: 'Right value — now collect the like terms.' };
      return { ok: true };
    }
    if (q.type === 'pair') {
      var a = readInt(val[0]), b = readInt(val[1]); if (a == null || b == null) return { retry: 'Fill in both boxes with whole numbers.' };
      return { ok: q.ordered ? a === q.ans[0] && b === q.ans[1] : (a === q.ans[0] && b === q.ans[1]) || (a === q.ans[1] && b === q.ans[0]) };
    }
    if (q.type === 'mc') return { ok: val === q.ans };
    if (q.type === 'plot') return { ok: val && val[0] === q.ans[0] && val[1] === q.ans[1] };
    return { ok: false };
  }
  function answerTex(q) {
    if (q.type === 'int') return q.eq ? 'x = ' + L(q.ans) : L(q.ans);
    if (q.type === 'frac') return fL(q.ans);
    if (q.type === 'expr') return HW.poly.tex(q.ans);
    if (q.type === 'pair') return q.ordered ? '(' + L(q.ans[0]) + ',\\ ' + L(q.ans[1]) + ')' : L(q.ans[0]) + '\\text{ and }' + L(q.ans[1]);
    if (q.type === 'plot') return '(' + L(q.ans[0]) + ',\\ ' + L(q.ans[1]) + ')';
    return '';
  }

  /* ---------------- saved progress ---------------- */
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } }
  var S = load(); S.d = S.d || {};
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function stOf(id) { var s = S.d[id] = S.d[id] || {}; s.lvl = s.lvl || 1; s.recent = s.recent || {}; s.right = s.right || 0; s.n = s.n || 0; s.best = s.best || 0; s.sprint = s.sprint || {}; return s; }
  function logToLedger(d, st, mode, n, right) {
    try { if (HW.Ledger && HW.Ledger.push && n) HW.Ledger.push({ t: 'event', type: 'drill', drill: d.id, level: st.lvl, mode: mode, n: n, right: right }); } catch (e) {}
  }

  /* ---------------- the list page ---------------- */
  function renderList(view) {
    view.innerHTML = '';
    var page = el('div', 'dr-page');
    var head = el('div', 'dr-head');
    head.appendChild(el('h1', '', 'Skill Drills'));
    head.appendChild(el('p', 'dr-lede', 'Quick practice on the skills every unit is built on. The questions never run out, levels go up as you get better, and wrong answers show you how it works.'));
    page.appendChild(head);
    var groups = [];
    DRILLS.forEach(function (d) { if (groups.indexOf(d.group) < 0) groups.push(d.group); });
    groups.forEach(function (g) {
      page.appendChild(el('h2', 'dr-group', esc(g)));
      var grid = el('div', 'dr-cards');
      DRILLS.filter(function (d) { return d.group === g; }).forEach(function (d) {
        var st = S.d[d.id], a = el('a', 'dr-card'); a.href = '#/drills/' + d.id;
        a.appendChild(el('div', 'dr-card-t', esc(d.title)));
        a.appendChild(el('div', 'dr-card-b', esc(d.blurb)));
        var meta = st && st.n ? 'Level ' + st.lvl + ' of ' + d.levels.length + ' · ' + st.right + ' right' + (st.best ? ' · best streak ' + st.best : '') : 'Not started';
        a.appendChild(el('div', 'dr-card-m' + (st && st.n ? ' on' : ''), meta + (d.sprint ? '<span class="dr-sprint-tag">Sprint</span>' : '')));
        grid.appendChild(a);
      });
      page.appendChild(grid);
    });
    view.appendChild(page);
  }

  /* ---------------- one drill ---------------- */
  var active = null;   // { d, st, mode, timer, … } — stopped when another page opens
  function stopActive() {
    if (active) {
      if (active.cleanup) active.cleanup();
      if (active.timer) clearInterval(active.timer);
      var n = active.n - (active.loggedN || 0), r = active.r - (active.loggedR || 0);
      if (n > 0 && !active.sprintOnly) logToLedger(active.d, active.st, 'practice', n, r);
    }
    active = null;
  }
  root.addEventListener('hashchange', function () { if (!/^#\/drills\/./.test(location.hash)) stopActive(); });

  function renderDrill(view, d) {
    stopActive();
    var st = stOf(d.id), A = active = { d: d, st: st, n: 0, r: 0, streak: 0 };
    view.innerHTML = '';
    var page = el('div', 'dr-page dr-one');
    var back = el('a', 'dr-back', '← All skill drills'); back.href = '#/drills'; page.appendChild(back);
    page.appendChild(el('h1', '', esc(d.title)));
    page.appendChild(el('p', 'dr-lede', esc(d.blurb) + (d.helps ? ' <span class="muted">Helps with ' + esc(d.helps) + '.</span>' : '')));

    var bar = el('div', 'dr-bar'), lvls = el('div', 'dr-levels'), modes = el('div', 'dr-modes');
    bar.appendChild(lvls); if (d.sprint) bar.appendChild(modes); page.appendChild(bar);
    var opts = null;
    if (d.facts) { opts = el('div', 'dr-tables'); page.appendChild(opts); }
    var card = el('div', 'dr-card-q'); page.appendChild(card);
    var stats = el('div', 'dr-stats'); page.appendChild(stats);
    var mapBox = d.facts ? el('div', 'dr-map') : null; if (mapBox) page.appendChild(mapBox);
    view.appendChild(page);

    function drawLevels() {
      lvls.innerHTML = '';
      d.levels.forEach(function (lv, i) {
        var b = el('button', 'dr-lvl' + (st.lvl === i + 1 ? ' on' : ''), '<b>' + (i + 1) + '</b> ' + esc(lv.name)); b.type = 'button';
        b.title = 'Level ' + (i + 1) + ': ' + lv.name;
        b.addEventListener('click', function () { if (A.mode === 'sprint') return; st.lvl = i + 1; save(); drawLevels(); next(); });
        lvls.appendChild(b);
      });
      if (d.sprint) {
        modes.innerHTML = '';
        var sp = el('button', 'btn dr-sprint-btn', 'Sprint: 1 minute'); sp.type = 'button'; sp.title = 'As many as you can in 60 seconds';
        sp.addEventListener('click', startSprint); modes.appendChild(sp);
      }
    }
    function drawTables() {
      if (!opts) return;
      opts.innerHTML = '<span class="dr-tables-l">Tables:</span>';
      var sel = st.tables && st.tables.length ? st.tables : TABLES.slice();
      TABLES.forEach(function (t) {
        var b = el('button', 'dr-tab' + (sel.indexOf(t) >= 0 ? ' on' : ''), String(t)); b.type = 'button'; b.setAttribute('aria-pressed', sel.indexOf(t) >= 0);
        b.addEventListener('click', function () { var s2 = (st.tables && st.tables.length ? st.tables : TABLES).slice(), k = s2.indexOf(t); if (k >= 0) { if (s2.length > 1) s2.splice(k, 1); } else s2.push(t); s2.sort(function (a, b) { return a - b; }); st.tables = s2; save(); drawTables(); if (A.mode !== 'sprint') next(); });
        opts.appendChild(b);
      });
      var all = el('button', 'dr-tab dr-all', 'All'); all.type = 'button'; all.addEventListener('click', function () { st.tables = TABLES.slice(); save(); drawTables(); if (A.mode !== 'sprint') next(); }); opts.appendChild(all);
    }
    function drawStats() {
      var rec = st.recent[st.lvl] || [], got = rec.reduce(function (a, b) { return a + b; }, 0);
      var nextTxt = st.lvl < d.levels.length ? 'Next level: 9 of your last 10 right <span class="dr-dots">' + rec.map(function (x) { return '<i class="' + (x ? 'y' : 'n') + '"></i>'; }).join('') + Array(11 - rec.length).join('<i></i>') + '</span>' : 'Top level — keep it sharp';
      stats.innerHTML = '<span><b>' + A.streak + '</b> in a row</span><span><b>' + A.r + '</b> / ' + A.n + ' this time</span><span>Best streak <b>' + st.best + '</b></span><span class="dr-next">' + nextTxt + '</span>';
      if (mapBox) drawMap();
    }
    function drawMap() {
      var F = S.facts || {}, h = '<div class="dr-map-t">Facts you know <span class="muted">(green = right twice in a row)</span></div><table><tr><th>×</th>';
      for (var c = 1; c <= 12; c++) h += '<th>' + c + '</th>';
      h += '</tr>';
      for (var r = 2; r <= 12; r++) { h += '<tr><th>' + r + '</th>'; for (c = 1; c <= 12; c++) { var f = F[Math.min(r, c) + 'x' + Math.max(r, c)], cls = !f ? '' : f.k >= 2 ? 'k' : f.w && !f.k ? 'w' : 's'; h += '<td class="' + cls + '">' + r * c + '</td>'; } h += '</tr>'; }
      mapBox.innerHTML = h + '</table>';
    }
    function factMark(q, ok) {
      if (!q.a) return; S.facts = S.facts || {}; var k = Math.min(q.a, q.b) + 'x' + Math.max(q.a, q.b), f = S.facts[k] = S.facts[k] || { k: 0, w: 0 };
      if (ok) f.k = (f.k || 0) + 1; else { f.k = 0; f.w = (f.w || 0) + 1; st.missed = st.missed || []; st.missed.push({ a: q.a, b: q.b, due: (st.count || 0) + ri(2, 4) }); st.missed.push({ a: q.a, b: q.b, due: (st.count || 0) + ri(7, 10) }); }
    }

    var q = null, input = null, input2 = null, focus = null, done = false;
    function next() {
      done = false; st.count = (st.count || 0) + 1;
      q = d.levels[st.lvl - 1].gen(st);
      drawQuestion();
    }
    function drawQuestion(feedback) {
      card.innerHTML = '';
      card.className = 'dr-card-q';
      if (A.mode === 'sprint') { var tm = el('div', 'dr-timer', ''); card.appendChild(tm); A.timerEl = tm; tickSprint(); }
      card.appendChild(el('div', 'dr-q', q.q));
      var body = el('div', 'dr-a');
      input = input2 = null;
      if (q.type === 'mc') {
        var list = el('div', 'dr-mc');
        q.choices.forEach(function (c, i) { var b = el('button', 'dr-choice', '<span class="dr-key">' + (i + 1) + '</span>' + c); b.type = 'button'; b.addEventListener('click', function () { submit(i); }); list.appendChild(b); });
        body.appendChild(list);
      } else if (q.type === 'plot') {
        var gw = el('div', 'dr-gridwrap', gridSvg(q.ans, null)); body.appendChild(gw);
        gw.querySelector('svg').addEventListener('click', function (e) { if (done) return; var p = gridPoint(this, e); if (Math.abs(p[0]) > 10 || Math.abs(p[1]) > 10) return; q.mark = p; submit(p); });
      } else {
        if (q.show) body.appendChild(el('div', 'dr-gridwrap', gridSvg(null, null, q.show)));
        var row = el('div', 'dr-inrow');
        var mk = function (lab) {
          var w = el('label', 'dr-in-w'); if (lab) w.appendChild(el('span', 'dr-in-l', lab));
          var inp = el('input', 'dr-in'); inp.type = 'text'; inp.autocomplete = 'off'; inp.spellcheck = false; inp.setAttribute('autocapitalize', 'off');
          if (coarse()) inp.setAttribute('inputmode', 'none');
          inp.addEventListener('focus', function () { focus = inp; });
          inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (done) { next(); } else if (input2 && inp === input && !input2.value) input2.focus(); else submit(); } });
          inp.addEventListener('input', preview);
          w.appendChild(inp); row.appendChild(w); return inp;
        };
        if (q.type === 'pair') {
          if (q.ordered) row.appendChild(el('span', 'dr-paren', '('));
          input = mk(q.ordered ? '' : ''); if (q.ordered) row.appendChild(el('span', 'dr-paren', ','));
          else row.appendChild(el('span', 'dr-and', 'and'));
          input2 = mk(''); if (q.ordered) row.appendChild(el('span', 'dr-paren', ')'));
        } else { if (q.eq) row.appendChild(el('span', 'dr-x', K('x ='))); input = mk(''); }
        var go = el('button', 'btn btn-primary dr-go', 'Check'); go.type = 'button'; go.addEventListener('click', function () { if (done) next(); else submit(); }); row.appendChild(go);
        body.appendChild(row);
        if (q.type === 'expr') body.appendChild(el('div', 'dr-preview', ''));
        body.appendChild(keypad(d.pad === 'pair' || q.type === 'pair' ? 'int' : q.type === 'frac' ? 'frac' : q.type === 'expr' ? 'expr' : 'int'));
      }
      card.appendChild(body);
      var fb = el('div', 'dr-fb'); card.appendChild(fb); A.fb = fb;
      if (feedback) fb.innerHTML = feedback;
      focus = input;
      if (input && !coarse()) setTimeout(function () { try { input.focus({ preventScroll: true }); } catch (e) {} }, 30);
      drawStats();
    }
    function preview() {
      var pv = card.querySelector('.dr-preview'); if (!pv || !input) return;
      var t = normText(input.value); if (!t) { pv.innerHTML = ''; return; }
      var r = HW.poly.read(t); pv.innerHTML = r.ok ? 'You typed: ' + K(t.replace(/\*/g, '\\cdot ').replace(/\^(\d+)/g, '^{$1}')) : '<span class="muted">…</span>';
    }
    function keypad(kind) {
      var keys = kind === 'expr' ? ['7', '8', '9', 'x', 'y', '⌫', '4', '5', '6', '^', '(', ')', '1', '2', '3', '0', '+', '−']
        : kind === 'frac' ? ['7', '8', '9', '⌫', '4', '5', '6', '/', '1', '2', '3', '−', '0']
          : ['7', '8', '9', '⌫', '4', '5', '6', '−', '1', '2', '3', '0'];
      var pad = el('div', 'dr-pad dr-pad-' + kind);
      keys.forEach(function (k) {
        if (!k) { pad.appendChild(el('span', 'dr-pk-gap')); return; }
        var b = el('button', 'dr-pk' + (k === '⌫' ? ' bk' : /[0-9]/.test(k) ? '' : ' op') + (kind === 'frac' && k === '0' ? ' w4' : ''), k === '^' ? 'x<sup>□</sup>' : k); b.type = 'button';
        b.setAttribute('aria-label', { '⌫': 'Delete', '−': 'Minus', '^': 'Power', '/': 'Fraction bar' }[k] || k);
        b.addEventListener('pointerdown', function (e) { e.preventDefault(); });
        b.addEventListener('click', function () {
          var t = focus || input; if (!t || done) return;
          var s = t.selectionStart != null ? t.selectionStart : t.value.length, e2 = t.selectionEnd != null ? t.selectionEnd : s;
          if (k === '⌫') { if (s === e2 && s > 0) s--; t.value = t.value.slice(0, s) + t.value.slice(e2); }
          else { var ins = k === '−' ? '-' : k; t.value = t.value.slice(0, s) + ins + t.value.slice(e2); s += ins.length; }
          try { t.setSelectionRange(s, s); } catch (x) {}
          preview();
        });
        pad.appendChild(b);
      });
      return pad;
    }
    function value() { if (q.type === 'pair') return [input.value, input2.value]; return input ? input.value : null; }
    function submit(v) {
      if (done) return;
      var res = check(q, v != null ? v : value());
      if (res.retry) { A.fb.innerHTML = '<div class="dr-retry">' + esc(res.retry) + '</div>'; if (input) input.focus(); return; }
      done = true; A.n++; st.n++;
      if (res.ok) { A.r++; st.right++; A.streak++; if (A.streak > st.best) st.best = A.streak; }
      else A.streak = 0;
      if (A.mode === 'sprint') { A.sr += res.ok ? 1 : 0; A.sn++; if (!res.ok) A.missed.push(q); }
      else {
        var rec = st.recent[st.lvl] = (st.recent[st.lvl] || []).concat(res.ok ? 1 : 0).slice(-10);
        if (rec.length >= 10 && rec.reduce(function (a, b) { return a + b; }, 0) >= 9 && st.lvl < d.levels.length) { st.lvl++; st.recent[st.lvl] = []; A.levelUp = true; }
      }
      if (d.facts) factMark(q, res.ok);
      save();
      if (A.mode !== 'sprint' && A.n - (A.loggedN || 0) >= 10) { logToLedger(d, st, 'practice', A.n - (A.loggedN || 0), A.r - (A.loggedR || 0)); A.loggedR = A.r; A.loggedN = A.n; }
      card.classList.add(res.ok ? 'good' : 'bad');
      if (q.type === 'mc') { var bs = card.querySelectorAll('.dr-choice'); bs.forEach(function (b, i) { b.disabled = true; if (i === q.ans) b.classList.add('right'); else if (i === v) b.classList.add('wrong'); }); }
      if (q.type === 'plot') card.querySelector('.dr-gridwrap').innerHTML = gridSvg(q.ans, q.mark, null, !res.ok);
      if (input) { input.readOnly = true; if (input2) input2.readOnly = true; }
      var go = card.querySelector('.dr-go'); if (go) go.textContent = 'Next';
      if (A.mode === 'sprint') {
        A.fb.innerHTML = res.ok ? '<div class="dr-good">Right!</div>' : '<div class="dr-bad">It’s ' + K(answerTex(q)) + '</div>';
        setTimeout(function () { if (A.mode === 'sprint') next(); }, res.ok ? 350 : 1100);
        drawStats(); return;
      }
      if (res.ok) {
        var lvlMsg = A.levelUp ? '<div class="dr-up">Level up! You’re on <b>Level ' + st.lvl + ': ' + esc(d.levels[st.lvl - 1].name) + '</b>.</div>' : '';
        A.levelUp = false;
        A.fb.innerHTML = '<div class="dr-good">' + pick(['Right!', 'Correct!', 'Nice.', 'Yes!', 'Got it.']) + '</div>' + lvlMsg;
        if (lvlMsg) drawLevels();
        setTimeout(function () { if (done && active === A && !lvlMsg) next(); }, 650);
        if (lvlMsg) { var nb = el('button', 'btn btn-primary dr-nextq', 'Next question'); nb.type = 'button'; nb.addEventListener('click', next); A.fb.appendChild(nb); nb.focus(); }
      } else {
        A.fb.innerHTML = '<div class="dr-bad">Not quite' + (q.type !== 'mc' && q.type !== 'plot' ? ' — the answer is ' + K(answerTex(q)) : '') + '.</div><div class="dr-how"><div class="dr-how-t">How it works</div>' + q.how + '</div>';
        var nb2 = el('button', 'btn btn-primary dr-nextq', 'Next question'); nb2.type = 'button'; nb2.addEventListener('click', next); A.fb.appendChild(nb2);
        if (!input || coarse()) nb2.focus({ preventScroll: true }); else input.focus({ preventScroll: true });
      }
      drawStats();
    }
    // keyboard: number keys pick a multiple-choice answer; Enter moves on
    function onKey(e) {
      if (active !== A || !q) return;
      if (q.type === 'mc' && !done && /^[1-4]$/.test(e.key)) { submit(+e.key - 1); }
      else if (done && e.key === 'Enter' && (!input || document.activeElement !== input) && !(document.activeElement && document.activeElement.tagName === 'BUTTON')) { e.preventDefault(); next(); }
    }
    document.addEventListener('keydown', onKey);

    /* sprint: 60 seconds, as many as you can */
    function startSprint() {
      A.mode = 'sprint'; A.end = Date.now() + 60000; A.sn = 0; A.sr = 0; A.missed = []; A.streak = 0;
      page.classList.add('sprinting');
      A.timer = setInterval(tickSprint, 200);
      next();
    }
    function tickSprint() {
      var left = Math.max(0, A.end - Date.now());
      if (A.timerEl) { A.timerEl.innerHTML = '<span>' + Math.ceil(left / 1000) + ' s</span><span><b>' + A.sr + '</b> right</span>'; A.timerEl.style.setProperty('--p', (left / 600) + '%'); }
      if (!left) endSprint();
    }
    function endSprint() {
      clearInterval(A.timer); A.timer = null; A.mode = null; page.classList.remove('sprinting'); done = true;
      var key = d.facts ? 'f' + st.lvl + ':' + (st.tables || TABLES).join(',') : 'l' + st.lvl, prev = st.sprint[key] || 0, isBest = A.sr > prev;
      if (isBest) st.sprint[key] = A.sr; save();
      logToLedger(d, st, 'sprint', A.sn, A.sr); A.loggedN = (A.loggedN || 0) + A.sn; A.loggedR = (A.loggedR || 0) + A.sr;
      card.className = 'dr-card-q dr-sprint-end';
      var miss = A.missed.slice(0, 12).map(function (mq) { return '<li>' + mq.q + ' <span class="muted">→</span> ' + K(answerTex(mq)) + '</li>'; }).join('');
      card.innerHTML = '<div class="dr-sp-score"><b>' + A.sr + '</b> right in 1 minute</div>' +
        '<div class="dr-sp-best">' + (isBest ? (prev ? 'New best! (was ' + prev + ')' : 'Your first sprint at this level — that’s the score to beat.') : 'Your best here: ' + prev) + '</div>' +
        (miss ? '<div class="dr-sp-miss"><div class="dr-how-t">Ones to look at again</div><ul>' + miss + '</ul></div>' : '');
      var again = el('button', 'btn btn-primary', 'Sprint again'); again.type = 'button'; again.addEventListener('click', startSprint);
      var prac = el('button', 'btn', 'Back to practice'); prac.type = 'button'; prac.addEventListener('click', function () { next(); });
      var acts = el('div', 'dr-sp-acts'); acts.appendChild(again); acts.appendChild(prac); card.appendChild(acts);
      drawStats();
    }

    A.cleanup = function () { document.removeEventListener('keydown', onKey); };
    drawLevels(); drawTables(); next();
  }
  function coarse() { try { return root.matchMedia('(pointer: coarse)').matches; } catch (e) { return false; } }


  // what a plug-in drill page gets: its saved state, saving, ledger logging and the shared page header
  function ctx(d) {
    var st = stOf(d.id);
    return { st: st, save: save, log: function (mode, n, right) { logToLedger(d, st, mode, n, right); }, setActive: function (a) { active = a; a.d = d; a.st = st; a.n = a.n || 0; a.r = a.r || 0; a.sprintOnly = true; } };
  }
  HW.Drills = {
    list: DRILLS,
    render: function (view, id) {
      var d = DRILLS.filter(function (x) { return x.id === id; })[0];
      if (d && d.render) { stopActive(); d.render(view, ctx(d)); }
      else if (d) renderDrill(view, d); else { stopActive(); renderList(view); }
    },
    // a drill with its own page (e.g. js/drills-move.js): { id, group, title, blurb, helps, levels:[{name}], render(view, ctx) }
    add: function (d, afterId) { var i = DRILLS.map(function (x) { return x.id; }).indexOf(afterId); if (i >= 0) DRILLS.splice(i + 1, 0, d); else DRILLS.push(d); },
    // for tests: make n questions of every level of every drill, check the key answers itself
    selfTest: function (n) {
      var errs = [];
      DRILLS.forEach(function (d) {
        if (d.render) return;
        d.levels.forEach(function (lv, i) {
          var st = { tables: TABLES.slice(), count: 0 };
          for (var k = 0; k < (n || 50); k++) {
            var q; try { q = lv.gen(st); } catch (e) { errs.push(d.id + ' L' + (i + 1) + ': ' + e.message); continue; }
            if (!q || !q.q || !q.type) { errs.push(d.id + ' L' + (i + 1) + ': empty question'); continue; }
            var ans = q.type === 'int' ? String(q.ans) : q.type === 'frac' ? (q.ans[1] === 1 ? String(q.ans[0]) : q.ans[0] + '/' + q.ans[1]) : q.type === 'expr' ? HW.poly.tex(q.ans).replace(/[{}]/g, '') : q.type === 'pair' ? [String(q.ans[0]), String(q.ans[1])] : q.type === 'mc' ? q.ans : q.ans;
            var r = check(q, ans);
            if (!r.ok) errs.push(d.id + ' L' + (i + 1) + ': key not accepted — ' + JSON.stringify(ans) + ' ' + JSON.stringify(r) + ' for ' + q.q.replace(/<[^>]+>/g, '').slice(0, 80));
            if (q.type === 'int' && (!isFinite(q.ans) || Math.round(q.ans) !== q.ans)) errs.push(d.id + ' L' + (i + 1) + ': non-integer answer');
          }
        });
      });
      return errs;
    }
  };
})(window);
