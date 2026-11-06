/* Skill Drill "Solve by moving terms": the student isolates x by dragging pieces of the equation, in the right order
 * (in the spirit of Graspable Math).
 *   • Drag a term across the = sign → it lands on the other side with the opposite sign ("subtract 5 from both sides").
 *   • Drag a term onto a like term on the same side → they combine ("collect like terms").
 *   • Drag the number in front of x across → the other side is divided by it; drag the bottom of x/a across → multiplied.
 *   • With brackets: drag the number in front onto the brackets to distribute, or across to divide.
 *   • Tap a grey "work it out" box (like 12 ÷ 3) to simplify it.
 * Taps work too: tap a piece, then tap where it should go. Moves that are allowed in algebra but go the wrong way (a number
 * onto the x side, dividing before the + and − are undone, …) are stopped with a one-line reason and count as a slip.
 * Every move is written underneath as a line of working with what it did to both sides. Levels go up after 4 of the last 5
 * solved without a slip or a hint. Registers itself with HW.Drills (js/drills.js). Same file in math15 and math10c. */
(function (root) {
  'use strict';
  var HW = root.HW; if (!HW || !HW.Drills) return;
  var el = HW.el, esc = HW.esc;
  function K(l) { return HW.k(l); }
  function ri(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
  function nz(a, b) { var v; do { v = ri(a, b); } while (v === 0); return v; }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function m(n) { return String(n).replace('-', '−'); }
  function L(n) { return n < 0 ? '-' + Math.abs(n) : String(n); }

  /* ---------------- equation model ---------------- */
  // item: { t:'n', c } number · { t:'x', c, den } c·x (or x/den) · { t:'br', a, in:[items] } a(…) · { t:'calc', tex, v } a sum to work out
  function N(c) { return { t: 'n', c: c }; }
  function X(c, den) { var o = { t: 'x', c: c }; if (den) o.den = den; return o; }
  function BR(a, inner) { return { t: 'br', a: a, in: inner }; }
  function clone(e) { return JSON.parse(JSON.stringify(e)); }
  function other(s) { return s === 'L' ? 'R' : 'L'; }
  function hasX(side) { return side.some(function (it) { return it.t === 'x' || it.t === 'br'; }); }
  function hasCalc(eq) { return eq.L.concat(eq.R).some(function (it) { return it.t === 'calc'; }); }
  function termTex(it, first) {
    var sign = '', body;
    if (it.t === 'n') { sign = it.c < 0 ? '-' : (first ? '' : '+'); body = String(Math.abs(it.c)); }
    else if (it.t === 'x') {
      var a = Math.abs(it.c); sign = it.c < 0 ? '-' : (first ? '' : '+');
      body = it.den ? '\\frac{' + (a === 1 ? '' : a) + 'x}{' + it.den + '}' : (a === 1 ? '' : a) + 'x';
    } else if (it.t === 'br') { sign = it.a < 0 ? '-' : (first ? '' : '+'); body = (Math.abs(it.a) === 1 ? '' : Math.abs(it.a)) + '\\left(' + sideTex(it.in) + '\\right)'; }
    else { sign = first ? '' : '+'; body = '\\left(' + it.tex + '\\right)'; if (first) body = it.tex; }
    return (sign === '+' ? ' + ' : sign === '-' ? (first ? '-' : ' - ') : '') + body;
  }
  function sideTex(side) { return side.length ? side.map(function (it, i) { return termTex(it, i === 0); }).join('') : '0'; }
  function eqTex(eq) { return sideTex(eq.L) + ' = ' + sideTex(eq.R); }
  function solvedValue(eq) {
    var a = eq.L, b = eq.R;
    function isX(s) { return s.length === 1 && s[0].t === 'x' && s[0].c === 1 && !s[0].den; }
    function isN(s) { return s.length === 1 && s[0].t === 'n'; }
    if (isX(a) && isN(b)) return b[0].c; if (isX(b) && isN(a)) return a[0].c; return null;
  }
  function tidy(side) { var s = side.filter(function (it) { return !(it.t === 'n' && it.c === 0 && side.length > 1) && !(it.t === 'x' && it.c === 0); }); return s.length ? s : [N(0)]; }

  /* ---------------- moves: each returns { eq, note } or { no: 'why not' } ---------------- */
  var ORDER_MSG = 'Not yet — undo the + and − first (move the numbers away from x), then the × and ÷.';
  function moveAcross(eq, s, i) {
    var it = eq[s][i], o = other(s);
    if (hasCalc(eq)) return { no: 'Work out the grey box first (tap it).' };
    if (it.t === 'n') {
      if (!hasX(eq[s])) return { no: 'That number is on the side without x. Move things away from x, not toward it.' };
    } else if (it.t === 'x') {
      if (it.den) return { no: 'Move the other terms first; then drag the bottom number across to multiply.' };
      if (!hasX(eq[o])) return { no: 'Keep x where it is — move the other terms away from it.' };
    } else return { no: 'Drag the number in front of the brackets instead.' };
    var e = clone(eq); e[s].splice(i, 1); e[s] = tidy(e[s]);
    var moved = clone(it); moved.c = -moved.c;
    e[o] = e[o].length === 1 && e[o][0].t === 'n' && e[o][0].c === 0 ? [moved] : e[o].concat([moved]);
    var what = it.t === 'n' ? String(Math.abs(it.c)) : (Math.abs(it.c) === 1 ? '' : Math.abs(it.c)) + 'x';
    return { eq: e, note: (it.c > 0 ? 'subtract ' + what + ' from' : 'add ' + what + ' to') + ' both sides', move: 'across' };
  }
  function combine(eq, s, i, j) {
    var a = eq[s][i], b = eq[s][j];
    if (hasCalc(eq)) return { no: 'Work out the grey box first (tap it).' };
    if (!a || !b || a.t !== b.t || (a.t !== 'n' && a.t !== 'x') || a.den || b.den) return { no: 'Only like terms combine: numbers with numbers, x terms with x terms.' };
    var e = clone(eq), sum = a.c + b.c, k = Math.min(i, j), n2 = Math.max(i, j);
    e[s].splice(n2, 1); e[s][k] = a.t === 'n' ? N(sum) : X(sum); e[s] = tidy(e[s]);
    return { eq: e, note: 'collect like terms', move: 'combine' };
  }
  function divideByCoef(eq, s) {
    var o = other(s), it = eq[s][0];
    if (hasCalc(eq)) return { no: 'Work out the grey box first (tap it).' };
    if (eq[s].length !== 1) return { no: ORDER_MSG };
    if (hasX(eq[o])) return { no: 'Get all the x terms on one side first.' };
    if (eq[o].length !== 1) return { no: 'Combine the numbers on the other side first.' };
    var c = eq[o][0].c, a = it.c, e = clone(eq);
    e[s] = [X(1)]; e[o] = [{ t: 'calc', tex: '\\frac{' + L(c) + '}{' + L(a) + '}', v: c / a }];
    return { eq: e, note: 'divide both sides by ' + m(a), move: 'divide' };
  }
  function multiplyByDen(eq, s) {
    var o = other(s), it = eq[s][0];
    if (hasCalc(eq)) return { no: 'Work out the grey box first (tap it).' };
    if (eq[s].length !== 1) return { no: ORDER_MSG };
    if (eq[o].length !== 1 || hasX(eq[o])) return { no: 'Combine the numbers on the other side first.' };
    var c = eq[o][0].c, d = it.den, e = clone(eq);
    e[s] = [X(it.c)]; e[o] = [{ t: 'calc', tex: L(c) + '\\times ' + d, v: c * d }];
    return { eq: e, note: 'multiply both sides by ' + d, move: 'multiply' };
  }
  function bracketAcross(eq, s) {
    var o = other(s), br = eq[s][0];
    if (hasCalc(eq)) return { no: 'Work out the grey box first (tap it).' };
    if (eq[s].length !== 1) return { no: ORDER_MSG };
    if (hasX(eq[o])) return { no: 'With x on the other side too, distribute first: drag ' + m(br.a) + ' onto the brackets.' };
    if (eq[o].length !== 1) return { no: 'Combine the numbers on the other side first.' };
    var c = eq[o][0].c; if (c % br.a) return { no: 'That gives a fraction — distribute instead: drag ' + m(br.a) + ' onto the brackets.' };
    var e = clone(eq); e[s] = br.in; e[o] = [{ t: 'calc', tex: '\\frac{' + L(c) + '}{' + L(br.a) + '}', v: c / br.a }];
    return { eq: e, note: 'divide both sides by ' + m(br.a), move: 'divide' };
  }
  function distribute(eq, s, i) {
    if (hasCalc(eq)) return { no: 'Work out the grey box first (tap it).' };
    var br = eq[s][i], e = clone(eq), items = br.in.map(function (t) { var u = clone(t); u.c *= br.a; return u; });
    e[s].splice.apply(e[s], [i, 1].concat(items));
    return { eq: e, note: 'distribute ' + m(br.a), move: 'distribute' };
  }
  function evaluate(eq, s, i) { var e = clone(eq); e[s][i] = N(e[s][i].v); return { eq: e, note: 'work it out', move: 'calc' }; }

  /* the operation that undoes a piece when it is taken to the other side, and why any other choice is wrong */
  var OPS = { add: 'add', sub: 'subtract', mul: 'multiply', div: 'divide' };
  function undoOp(eq, s, i, kind) {
    var it = eq[s][i];
    if (kind === 'n' || kind === 'x') return it.c > 0 ? 'sub' : 'add';
    if (kind === 'coef' || kind === 'bra') return 'div';
    if (kind === 'den') return 'mul';
    return null;
  }
  function wrongOp(eq, s, i, kind, op) {
    var it = eq[s][i], want = undoOp(eq, s, i, kind), v;
    if (kind === 'n' || kind === 'x') {
      v = (kind === 'x' ? (Math.abs(it.c) === 1 ? '' : Math.abs(it.c)) + 'x' : String(Math.abs(it.c)));
      if (op === 'add' || op === 'sub') return v + ' is ' + (it.c > 0 ? 'added' : 'subtracted') + ' on this side, so ' + (op === 'add' ? 'adding' : 'subtracting') + ' it won’t cancel it. Do the opposite: ' + OPS[want] + '.';
      return v + ' is ' + (it.c > 0 ? 'added' : 'subtracted') + ', not multiplied or divided — undo it with ' + (want === 'sub' ? 'subtraction' : 'addition') + ' (drop it after the other side).';
    }
    if (kind === 'coef' || kind === 'bra') { v = m(kind === 'bra' ? it.a : it.c); return op === 'mul' ? (kind === 'bra' ? 'The brackets are' : 'x is') + ' already multiplied by ' + v + ' — multiplying again won’t undo it. Divide (drop it underneath).' : v + ' multiplies ' + (kind === 'bra' ? 'the brackets' : 'x') + ' — it isn’t added. Undo × with ÷ (drop it underneath).'; }
    if (kind === 'den') return op === 'div' ? 'x is already divided by ' + it.den + ' — dividing again won’t undo it. Multiply (drop it in front).' : 'x is divided by ' + it.den + ' — undo ÷ with × (drop it in front).';
    return 'That move doesn’t undo anything.';
  }

  /* the next good move, for the Hint button: { s, i, part, target } */
  function hint(eq) {
    var S = ['L', 'R'], k, s, i;
    for (k = 0; k < 2; k++) { s = S[k]; for (i = 0; i < eq[s].length; i++) if (eq[s][i].t === 'calc') return { s: s, i: i, tap: true, text: 'Tap the grey box to work it out.' }; }
    for (k = 0; k < 2; k++) {
      s = S[k];
      var ns = [], xs = [];
      eq[s].forEach(function (it, j) { if (it.t === 'n') ns.push(j); if (it.t === 'x' && !it.den) xs.push(j); });
      if (ns.length > 1 && !hasX(eq[s])) return { s: s, i: ns[1], target: { s: s, i: ns[0] }, text: 'Combine the numbers on this side: drag one onto the other.' };
      if (xs.length > 1) return { s: s, i: xs[1], target: { s: s, i: xs[0] }, text: 'Combine the x terms: drag one onto the other.' };
    }
    for (k = 0; k < 2; k++) { s = S[k]; if (eq[s].length === 1 && eq[s][0].t === 'br' && (hasX(eq[other(s)]) || eq[other(s)].length !== 1 || eq[other(s)][0].c % eq[s][0].a)) return { s: s, i: 0, part: 'a', target: { s: s, i: 0, br: true }, text: 'Distribute: drag the ' + m(eq[s][0].a) + ' onto the brackets.' }; }
    for (k = 0; k < 2; k++) { s = S[k]; if (eq[s].some(function (it) { return it.t === 'br'; }) && eq[s].length > 1) { i = eq[s].map(function (it) { return it.t; }).indexOf('br'); return { s: s, i: i, part: 'a', target: { s: s, i: i, br: true }, text: 'Distribute: drag the number in front onto the brackets.' }; } }
    var xL = hasX(eq.L), xR = hasX(eq.R);
    if (xL && xR) { s = 'R'; i = eq.R.map(function (it) { return it.t; }).indexOf('x'); var xi = eq.R[i]; return { s: s, i: i, target: { side: 'L', op: xi.c > 0 ? 'sub' : 'add' }, text: 'Get the x terms together: move this x term to the other side — ' + (xi.c > 0 ? 'it’s added, so subtract it.' : 'it’s subtracted, so add it.') }; }
    var xs2 = xL ? 'L' : 'R';
    for (i = 0; i < eq[xs2].length; i++) if (eq[xs2][i].t === 'n') return { s: xs2, i: i, target: { side: other(xs2), op: eq[xs2][i].c > 0 ? 'sub' : 'add' }, text: 'Undo the + or − first: this ' + m(Math.abs(eq[xs2][i].c)) + ' is ' + (eq[xs2][i].c > 0 ? 'added, so subtract it from both sides.' : 'subtracted, so add it to both sides.') };
    var o2 = other(xs2); if (eq[o2].length > 1) return { s: o2, i: 1, target: { s: o2, i: 0 }, text: 'Combine the numbers on this side: drag one onto the other.' };
    var it2 = eq[xs2][0];
    if (it2 && it2.t === 'br') return { s: xs2, i: 0, part: 'a', target: { side: o2, op: 'div' }, text: 'The brackets are multiplied by ' + m(it2.a) + ' — undo it by dividing both sides by ' + m(it2.a) + '.' };
    if (it2 && it2.den) return { s: xs2, i: 0, part: 'den', target: { side: o2, op: 'mul' }, text: 'x is divided by ' + it2.den + ' — undo it by multiplying both sides by ' + it2.den + '.' };
    if (it2 && it2.c !== 1) return { s: xs2, i: 0, part: 'coef', target: { side: o2, op: 'div' }, text: 'x is multiplied by ' + m(it2.c) + ' — undo it by dividing both sides by ' + m(it2.c) + '.' };
    return null;
  }

  /* ---------------- equations to solve ---------------- */
  function maybeSwap(eq, p) { return Math.random() < p ? { L: eq.R, R: eq.L } : eq; }
  var LEVELS = [
    { name: 'x + b = c', gen: function () { var x = nz(-10, 10), b = nz(-12, 12), eq = { L: Math.random() < .3 ? [N(b), X(1)] : [X(1), N(b)], R: [N(x + b)] }; return { eq: maybeSwap(eq, .25), x: x }; } },
    { name: 'ax = c and ax + b = c', gen: function () {
      var x = nz(-9, 9), a = ri(2, 9) * pick([1, 1, -1]), k = ri(0, 2);
      if (k === 0) return { eq: { L: [X(a)], R: [N(a * x)] }, x: x };
      if (k === 1) { var d = ri(2, 6), q = nz(-8, 8); return { eq: { L: [X(1, d)], R: [N(q)] }, x: q * d }; }
      var b = nz(-12, 12); return { eq: { L: [X(Math.abs(a)), N(b)], R: [N(Math.abs(a) * x + b)] }, x: x };
    } },
    { name: 'Two steps, with negatives', gen: function () {
      var x = nz(-9, 9), a = ri(2, 9) * pick([1, -1]), b = nz(-15, 15), k = ri(0, 2), eq;
      if (k === 0) eq = { L: [X(a), N(b)], R: [N(a * x + b)] };
      else if (k === 1) eq = { L: [N(b), X(a)], R: [N(a * x + b)] };
      else { var d = ri(2, 5), q = nz(-6, 6); x = q * d; eq = { L: [X(1, d), N(b)], R: [N(q + b)] }; }
      return { eq: maybeSwap(eq, .3), x: x };
    } },
    { name: 'x on both sides', gen: function () {
      var x = nz(-8, 8), a, c; do { a = nz(-7, 7); c = nz(-7, 7); } while (a === c);
      var b = nz(-12, 12), d = (a - c) * x + b; return { eq: { L: [X(a), N(b)], R: [X(c), N(d)] }, x: x };
    } },
    { name: 'Brackets', gen: function () {
      var x = nz(-8, 8), a = ri(2, 6) * pick([1, 1, -1]), b = nz(-9, 9);
      if (Math.random() < .6) return { eq: maybeSwap({ L: [BR(a, [X(1), N(b)])], R: [N(a * (x + b))] }, .2), x: x };
      var c; do { c = nz(-6, 6); } while (c === a); var d = a * (x + b) - c * x;
      return { eq: { L: [BR(a, [X(1), N(b)])], R: [X(c), N(d)] }, x: x };
    } }
  ];

  /* ---------------- the page ---------------- */
  function render(view, C) {
    var st = C.st; st.lvl = Math.min(st.lvl || 1, LEVELS.length); st.recent = st.recent || {};
    var A = { n: 0, r: 0 }; C.setActive(A);
    view.innerHTML = '';
    var page = el('div', 'dr-page dr-one mv-page');
    var back = el('a', 'dr-back', '← All skill drills'); back.href = '#/drills'; page.appendChild(back);
    page.appendChild(el('h1', '', 'Solve by moving terms'));
    page.appendChild(el('p', 'dr-lede', 'Get x by itself by <b>dragging</b> pieces of the equation (or tap a piece, then tap where it goes). Take a piece to the other side and <b>choose</b> what to do to both sides: drop it in front to multiply, after it to add or subtract, or underneath to divide. Undo + and − first, then × and ÷.'));
    var lvls = el('div', 'dr-levels'); page.appendChild(lvls);
    var card = el('div', 'dr-card-q mv-card'); page.appendChild(card);
    var stats = el('div', 'dr-stats'); page.appendChild(stats);
    var help = el('details', 'mv-help', '<summary>How the moves work</summary><ul>' +
      '<li><b>Across the =</b>: drag a piece to the other side and drop it in one of the boxes — <b>in front</b> (×), <b>after</b> (+ or −) or <b>underneath</b> (÷). You choose the operation that undoes it; it then disappears from its own side.</li>' +
      '<li><b>Onto a like term</b>: drag a number onto a number (or an x term onto an x term) on the same side to combine them.</li>' +
      '<li><b>The number in front of x</b>: once x’s side has nothing else, drag it across. x is multiplied by it, so pick the box that undoes multiplying. For x over a number, drag the bottom number.</li>' +
      '<li><b>Brackets</b>: drag the number in front onto the brackets to distribute, or across the = to undo it.</li>' +
      '<li><b>Grey boxes</b>: tap to work them out.</li></ul>');
    page.appendChild(help);
    view.appendChild(page);

    var P = null, sel = null, drag = null;   // P: { eq, x, hist:[{tex,note}], slips, hints, done }
    function drawLevels() {
      lvls.innerHTML = '';
      LEVELS.forEach(function (lv, i) { var b = el('button', 'dr-lvl' + (st.lvl === i + 1 ? ' on' : ''), '<b>' + (i + 1) + '</b> ' + esc(lv.name)); b.type = 'button'; b.addEventListener('click', function () { st.lvl = i + 1; C.save(); drawLevels(); fresh(); }); lvls.appendChild(b); });
    }
    function drawStats() {
      var rec = st.recent[st.lvl] || [];
      stats.innerHTML = '<span><b>' + A.r + '</b> solved this time</span><span>Clean solves in a row <b>' + (A.clean || 0) + '</b></span><span>Best <b>' + (st.best || 0) + '</b></span>' +
        (st.lvl < LEVELS.length ? '<span class="dr-next">Next level: 4 of your last 5 with no slips or hints <span class="dr-dots">' + rec.map(function (x) { return '<i class="' + (x ? 'y' : 'n') + '"></i>'; }).join('') + Array(6 - rec.length).join('<i></i>') + '</span></span>' : '<span class="dr-next">Top level</span>');
    }
    function fresh() { var g = LEVELS[st.lvl - 1].gen(); P = { eq: g.eq, x: g.x, hist: [{ tex: eqTex(g.eq), note: '' }], slips: 0, hints: 0, done: false }; sel = null; draw(); }

    function chip(cls, html, data) { var c = el('span', cls, html); Object.keys(data || {}).forEach(function (k) { c.dataset[k] = data[k]; }); return c; }
    function drawSide(s) {
      var side = el('div', 'mv-side'); side.dataset.side = s;
      var zm = el('div', 'mv-z mv-z-mul', '<b>×</b><span>multiply</span>'); zm.dataset.zone = 'mul';
      var box = el('div', 'mv-expr');
      var za = el('div', 'mv-zcol'), zp = el('div', 'mv-z', '<b>+</b><span>add</span>'), zs = el('div', 'mv-z', '<b>−</b><span>subtract</span>'); zp.dataset.zone = 'add'; zs.dataset.zone = 'sub'; za.appendChild(zp); za.appendChild(zs);
      var zd = el('div', 'mv-z mv-z-div', '<b>÷</b><span>divide</span>'); zd.dataset.zone = 'div';
      side.appendChild(zm); side.appendChild(box); side.appendChild(za); side.appendChild(zd);
      P.eq[s].forEach(function (it, i) {
        var first = i === 0, sg = it.t === 'calc' ? '' : (it.t === 'br' ? it.a : it.c) < 0 ? '−' : first ? '' : '+';
        var sgn = sg ? '<span class="mv-sg">' + sg + '</span>' : '';
        if (it.t === 'n') box.appendChild(chip('mv-t mv-drag', sgn + Math.abs(it.c), { s: s, i: i, kind: 'n' }));
        else if (it.t === 'x') {
          var t = chip('mv-t mv-drag mv-x', '', { s: s, i: i, kind: 'x' }), a = Math.abs(it.c), sole = P.eq[s].length === 1;
          // the number in front of x (and the bottom of x/a) is always its own handle, so students can try moving it
          // at any time; moving it before the + and − are undone is refused with the order message
          if (it.den) {
            t.innerHTML = sgn + '<span class="mv-frac"><span class="mv-num">' + (a === 1 ? '' : a) + '<i class="mv-var">x</i></span></span>';
            t.querySelector('.mv-frac').appendChild(chip('mv-den mv-drag', String(it.den), { s: s, i: i, kind: 'den' }));
          } else if (first && it.c !== 1) {
            t.innerHTML = ''; t.appendChild(chip('mv-coef mv-drag', it.c === -1 ? '−' : m(it.c), { s: s, i: i, kind: 'coef' })); t.appendChild(el('i', 'mv-var', 'x'));
          } else if (!first && a !== 1) {
            t.innerHTML = sgn; t.appendChild(chip('mv-coef mv-drag', String(a), { s: s, i: i, kind: 'coef' })); t.appendChild(el('i', 'mv-var', 'x'));
          } else t.innerHTML = sgn + (a === 1 ? '' : a) + '<i class="mv-var">x</i>';
          box.appendChild(t);
        } else if (it.t === 'br') {
          var b = chip('mv-br', '', { s: s, i: i, kind: 'br' });
          b.appendChild(chip('mv-coef mv-drag', m(it.a), { s: s, i: i, kind: 'bra' }));
          var inner = el('span', 'mv-in', '('); it.in.forEach(function (u, j) { inner.innerHTML += (j ? (u.c < 0 ? ' − ' : ' + ') : (u.c < 0 ? '−' : '')) + (u.t === 'x' ? (Math.abs(u.c) === 1 ? '' : Math.abs(u.c)) + '<i class="mv-var">x</i>' : Math.abs(u.c)); }); inner.innerHTML += ')';
          b.appendChild(inner); box.appendChild(b);
        } else box.appendChild(chip('mv-t mv-calc', (first ? '' : '<span class="mv-sg">+</span>') + K(it.tex) + '<span class="mv-tap">tap</span>', { s: s, i: i, kind: 'calc' }));
      });
      return side;
    }
    function draw(msg) {
      card.innerHTML = '';
      card.className = 'dr-card-q mv-card' + (P.done ? ' good' : '');
      card.appendChild(el('div', 'mv-task', P.done ? 'Solved!' : 'Get <i>x</i> by itself.'));
      var row = el('div', 'mv-eq');
      row.appendChild(drawSide('L')); row.appendChild(el('div', 'mv-eqs', '=')); row.appendChild(drawSide('R'));
      card.appendChild(row);
      var fb = el('div', 'mv-fb' + (msg && msg.bad ? ' bad' : ''), msg ? msg.text : '');
      card.appendChild(fb);
      var hist = el('div', 'mv-hist');
      P.hist.forEach(function (h, i) { hist.appendChild(el('div', 'mv-hrow', '<span class="mv-hn">' + (i ? '' : 'Start') + '</span><span>' + K(h.tex) + '</span><span class="mv-hnote">' + esc(h.note) + '</span>')); });
      card.appendChild(hist);
      var acts = el('div', 'mv-acts');
      if (!P.done) {
        var hb = el('button', 'btn', 'Hint'); hb.type = 'button'; hb.addEventListener('click', showHint); acts.appendChild(hb);
        var ub = el('button', 'btn', 'Undo'); ub.type = 'button'; ub.disabled = P.hist.length < 2; ub.addEventListener('click', undo); acts.appendChild(ub);
        var sk = el('button', 'btn btn-ghost', 'New equation'); sk.type = 'button'; sk.addEventListener('click', fresh); acts.appendChild(sk);
      } else {
        var nb = el('button', 'btn btn-primary', 'Next equation'); nb.type = 'button'; nb.addEventListener('click', fresh); acts.appendChild(nb); setTimeout(function () { try { nb.focus({ preventScroll: true }); } catch (e) {} }, 30);
      }
      card.appendChild(acts);
      wire(row);
      drawStats();
    }
    function apply(res) {
      if (!res) return;
      if (res.no) { P.slips++; sel = null; draw({ text: res.no, bad: true }); flash(); return; }
      P.eq = res.eq; P.hist.push({ tex: eqTex(res.eq), note: res.note }); sel = null;
      var v = solvedValue(P.eq);
      if (v != null) {
        P.done = true; A.n++; A.r++; st.n = (st.n || 0) + 1; st.right = (st.right || 0) + 1;
        var clean = !P.slips && !P.hints;
        A.clean = clean ? (A.clean || 0) + 1 : 0; if (A.clean > (st.best || 0)) st.best = A.clean;
        var rec = st.recent[st.lvl] = (st.recent[st.lvl] || []).concat(clean ? 1 : 0).slice(-5), up = false;
        if (rec.length >= 5 && rec.reduce(function (a, b) { return a + b; }, 0) >= 4 && st.lvl < LEVELS.length) { st.lvl++; st.recent[st.lvl] = []; up = true; }
        C.save(); C.log('move', 1, clean ? 1 : 0);
        draw({ text: K('x = ' + L(v)) + ' — ' + (clean ? 'clean solve, no slips!' : 'solved.') + ' <span class="muted">Check: put ' + m(v) + ' back into the first line — both sides match.</span>' + (up ? '<div class="dr-up">Level up! Now: <b>' + esc(LEVELS[st.lvl - 1].name) + '</b></div>' : '') });
        if (up) drawLevels();
        return;
      }
      draw({ text: res.note ? 'You did: ' + esc(res.note) + '.' : '' });
    }
    function undo() { if (P.hist.length < 2) return; P.hist.pop(); P.eq = P.prev && P.prev.length ? P.prev.pop() : P.eq; draw(); }
    function flash() { card.classList.remove('mv-shake'); void card.offsetWidth; card.classList.add('mv-shake'); }
    function showHint() {
      var h = hint(P.eq); if (!h) return; P.hints++;
      draw({ text: h.text });
      var src = card.querySelector('[data-s="' + h.s + '"][data-i="' + h.i + '"][data-kind="' + (h.part === 'coef' ? 'coef' : h.part === 'den' ? 'den' : h.part === 'a' ? 'bra' : h.tap ? 'calc' : (P.eq[h.s][h.i].t === 'x' ? 'x' : 'n')) + '"]');
      if (src) src.classList.add('mv-glow');
      if (h.target) {
        if (h.target.side) { card.classList.add('mv-choosing'); card.dataset.from = h.s; }
        var tg = h.target.op ? card.querySelector('.mv-side[data-side="' + h.target.side + '"] .mv-z[data-zone="' + h.target.op + '"]') : h.target.side ? card.querySelector('.mv-side[data-side="' + h.target.side + '"]') : h.target.br ? card.querySelector('.mv-br[data-s="' + h.target.s + '"]') : card.querySelector('.mv-t[data-s="' + h.target.s + '"][data-i="' + h.target.i + '"]');
        if (tg) tg.classList.add('mv-target');
      }
    }
    // remember earlier equations for Undo
    var _apply = apply; apply = function (res) { if (res && !res.no) { P.prev = P.prev || []; P.prev.push(clone(P.eq)); } _apply(res); };

    /* what happens when piece `src` ({s,i,kind}) is dropped on `tgt` ({side} | {s,i,kind}) */
    function act(src, tgt) {
      if (P.done || !src) return;
      var s = src.s, i = +src.i, k = src.kind;
      if (k === 'calc') return apply(evaluate(P.eq, s, i));
      if (!tgt) return;
      var toSide = tgt.side || null, sameSide = tgt.s === s;
      var across = (toSide && toSide !== s) || (tgt.s && !sameSide);
      if (across && k !== 'calc') {
        if (!tgt.zone) return draw({ text: 'Choose what to do to both sides: drop it <b>in front</b> to multiply, <b>after</b> it to add or subtract, or <b>underneath</b> to divide.' });
        if ((k === 'coef' || k === 'den' || k === 'bra') && P.eq[s].length !== 1) return apply({ no: ORDER_MSG });
        if (tgt.zone !== undoOp(P.eq, s, i, k)) return apply({ no: wrongOp(P.eq, s, i, k, tgt.zone) });
      }
      if (k === 'n' || k === 'x') {
        if (across) return apply(moveAcross(P.eq, s, i));
        if (tgt.s && sameSide && +tgt.i !== i && (tgt.kind === 'n' || tgt.kind === 'x' || tgt.kind === 'coef')) return apply(combine(P.eq, s, i, +tgt.i));
        return;
      }
      if (k === 'coef') { if (across) return apply(divideByCoef(P.eq, s)); return; }
      if (k === 'den') { if (across) return apply(multiplyByDen(P.eq, s)); return; }
      if (k === 'bra') {
        if (across) return apply(bracketAcross(P.eq, s));
        if (sameSide && (tgt.kind === 'br' || tgt.kind === 'bra' || toSide === s)) return apply(distribute(P.eq, s, i));
      }
    }
    function info(node) {
      if (!node) return null;
      var z = node.closest('.mv-z'), c = node.closest('[data-kind]'), sd = node.closest('.mv-side');
      if (z && card.contains(z)) return { side: z.closest('.mv-side').dataset.side, zone: z.dataset.zone };
      if (c && card.contains(c)) return { s: c.dataset.s, i: c.dataset.i, kind: c.dataset.kind };
      if (sd && card.contains(sd)) return { side: sd.dataset.side };
      return null;
    }
    function wire(row) {
      row.addEventListener('pointerdown', function (e) {
        if (P.done) return;
        var c = e.target.closest('.mv-drag, .mv-calc'); if (!c) return;
        var src = { s: c.dataset.s, i: c.dataset.i, kind: c.dataset.kind };
        if (c.classList.contains('mv-coef') || c.classList.contains('mv-den')) e.stopPropagation();
        drag = { src: src, node: c, x0: e.clientX, y0: e.clientY, moved: false, id: e.pointerId };
        try { row.setPointerCapture(e.pointerId); } catch (x) {}
        e.preventDefault();
      });
      row.addEventListener('pointermove', function (e) {
        if (!drag) return;
        var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
        if (!drag.moved && Math.hypot(dx, dy) > 6 && drag.src.kind !== 'calc') {
          drag.moved = true; var r = drag.node.getBoundingClientRect();
          drag.ghost = drag.node.cloneNode(true); drag.ghost.className += ' mv-ghost'; drag.ghost.style.width = r.width + 'px';
          drag.ox = drag.x0 - r.left; drag.oy = drag.y0 - r.top; document.body.appendChild(drag.ghost); drag.node.classList.add('mv-lifted');
          card.classList.add('mv-dragging'); card.dataset.from = drag.src.s;
        }
        if (drag.moved) {
          drag.ghost.style.left = (e.clientX - drag.ox) + 'px'; drag.ghost.style.top = (e.clientY - drag.oy) + 'px';
          var over = document.elementFromPoint(e.clientX, e.clientY), t = info(over);
          card.querySelectorAll('.mv-over').forEach(function (n) { n.classList.remove('mv-over'); });
          if (t) { var n2 = t.zone ? over.closest('.mv-z') : t.side ? card.querySelector('.mv-side[data-side="' + t.side + '"]') : over.closest('[data-kind]'); if (n2 && n2 !== drag.node) n2.classList.add('mv-over'); }
        }
      });
      function end(e) {
        if (!drag) return;
        var d = drag; drag = null;
        if (d.ghost) d.ghost.remove();
        var dropT = d.moved ? info(document.elementFromPoint(e.clientX, e.clientY)) : null;   // read before the zones hide
        card.classList.remove('mv-dragging');
        if (d.moved) { var before = P.hist.length; act(d.src, dropT); if (P.hist.length === before && card.contains(d.node)) d.node.classList.remove('mv-lifted'); return; }
        // a tap: select, or use the selected piece on this target
        if (d.src.kind === 'calc') { act(d.src); return; }
        if (sel) {
          var tgt = { s: d.src.s, i: d.src.i, kind: d.src.kind };
          if (sel.s === tgt.s && sel.i === tgt.i && sel.kind === tgt.kind) { sel = null; draw(); return; }
          var src = sel; sel = null; act(src, tgt); return;
        }
        sel = d.src; d.node.classList.add('mv-sel'); card.classList.add('mv-choosing'); card.dataset.from = d.src.s;
        var fb = card.querySelector('.mv-fb'); fb.className = 'mv-fb'; fb.textContent = 'Now tap what to do on the other side (in front ×, after + or −, underneath ÷), or a like term to combine with.';
      }
      row.addEventListener('pointerup', end);
      row.addEventListener('pointercancel', function () { if (drag && drag.ghost) drag.ghost.remove(); drag = null; card.classList.remove('mv-dragging'); });
      // tapping an empty part of a side with a piece selected
      row.querySelectorAll('.mv-side').forEach(function (sd) {
        sd.addEventListener('click', function (e) { if (!sel || e.target.closest('[data-kind]')) return; var z = e.target.closest('.mv-z'); var src = sel; sel = null; card.classList.remove('mv-choosing'); act(src, { side: sd.dataset.side, zone: z ? z.dataset.zone : null }); });
      });
    }
    A.cleanup = function () { var g = document.querySelector('.mv-ghost'); if (g) g.remove(); };
    drawLevels(); fresh();
  }

  HW.Drills.add({
    id: 'moves', group: 'Algebra skills', title: 'Solve by moving terms', render: render, levels: LEVELS,
    blurb: 'Drag pieces of the equation to get x by itself — in the right order.', helps: 'every equation you’ll solve'
  }, 'eq3');

  // for tests: solve n equations per level using the hint moves only; every one must finish with the right x
  HW.Drills.moveSelfTest = function (n) {
    var errs = [];
    LEVELS.forEach(function (lv, li) {
      for (var k = 0; k < (n || 100); k++) {
        var g = lv.gen(), eq = g.eq, steps = 0, v;
        while ((v = solvedValue(eq)) == null && steps < 20) {
          var h = hint(eq); if (!h) { errs.push('L' + (li + 1) + ' stuck at ' + eqTex(eq)); break; }
          var r;
          if (h.tap) r = evaluate(eq, h.s, h.i);
          else if (h.part === 'coef') { if (h.target.op !== 'div') errs.push('hint op coef'); r = divideByCoef(eq, h.s); }
          else if (h.part === 'den') r = multiplyByDen(eq, h.s);
          else if (h.part === 'a') r = h.target.br ? distribute(eq, h.s, h.i) : bracketAcross(eq, h.s);
          else if (h.target && h.target.side) { if (h.target.op !== undoOp(eq, h.s, h.i, eq[h.s][h.i].t === 'x' ? 'x' : 'n')) errs.push('L' + (li + 1) + ' hint op ' + h.target.op); r = moveAcross(eq, h.s, h.i); }
          else r = combine(eq, h.s, h.i, h.target.i);
          if (r.no) { errs.push('L' + (li + 1) + ' hint refused (' + r.no + ') at ' + eqTex(eq)); break; }
          eq = r.eq; steps++;
          eq.L.concat(eq.R).forEach(function (it) { if (it.t === 'calc' && Math.round(it.v) !== it.v) errs.push('L' + (li + 1) + ' fraction ' + it.tex); });
        }
        if (v == null && steps >= 20) errs.push('L' + (li + 1) + ' too many steps: ' + eqTex(g.eq));
        if (v != null && v !== g.x) errs.push('L' + (li + 1) + ' got ' + v + ' expected ' + g.x + ' for ' + eqTex(g.eq));
      }
    });
    return errs;
  };
})(window);
