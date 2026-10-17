/* Math 10C · Unit 5 · Lesson 2 — Describing Relationships Between Two Quantities (RF1, RF2)
 * Assignment questions 1–13 (u5_L02.tex) and the Lesson 2 Extra Practice (u5_EP02.tex).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible values) and changes the numbers / context. Levels: LIM BEG EMG PRG ADV MAS.
 * Outcome: RF1 by default (evaluating, solving, linear vs nonlinear, equations from situations, continuous vs
 * discrete, reading graphs); RF2 for independent/dependent variables, lists of inputs and outputs, ordered pairs and
 * mapping diagrams. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, PL = HW.poly, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'var-swap': 'Swapped independent and dependent variables', 'var-same': 'Gave the same variable twice', 'var-letter': 'Didn’t use the question’s letters',
    'io-swap': 'Listed outputs for inputs (or reverse)', 'io-mixed': 'Mixed inputs and outputs', 'io-extra': 'Extra value in the list', 'io-missing': 'Missed a value in the list', dup: 'Listed a value twice',
    'neg-mult': 'Sign error multiplying a negative input', 'const-sign': 'Wrong sign on the constant', 'no-const': 'Left out the constant', 'neg-square': 'Squared a negative to a negative', 'two-x': 'Used 2x for x²',
    'solve-sub-y': 'Substituted the output as the input', 'solve-inverse': 'Undid the constant the wrong way', 'solve-no-div': 'Didn’t divide by the coefficient',
    'sym-opp': 'Symmetry gives the same output, not the opposite', 'diff-rev': 'Subtracted in the wrong order', 'diff-unit': 'Divided the change by the x-step', 'said-linear': 'Called a nonlinear relation linear', 'said-nonlinear': 'Called a linear relation nonlinear', 'lin-word': 'Didn’t type linear/nonlinear',
    'eq-rate-const': 'Rate and starting value swapped', 'eq-sign': 'Added instead of subtracted (or reverse)', 'eq-no-start': 'Left out the starting amount / fee',
    'ctx-add': 'Added instead of subtracting', 'ctx-part': 'Stopped after one step', 'ctx-no-fee': 'Ignored the fixed fee', 'ctx-fee-times': 'Multiplied the fee by the months',
    'nr-step1': 'Treated the x-step as 1', 'nr-one-step': 'Went only one step further', 'nr-prop': 'Assumed the relation is proportional', 'nr-wrong-dir': 'Used the output as an input',
    'rate-total': 'Used the change over several days as the daily rate', 'rate-first': 'Used the first charge as the rate', 'fee-first': 'Used the 1-day charge as the fee', 'rate-sign': 'Gave a falling rate as negative',
    'sq-halved': 'Halved instead of taking the square root', 'sq-double': 'Thought doubling the side doubles the area', 'not-reversed': 'Didn’t reverse the pairs', 'only-positive': 'Missed the negative solution'
  });

  /* ---------- small helpers ---------- */
  function num(x) { return String(Math.round(x * 1e6) / 1e6); }
  function term(c, v, first) { var a = Math.abs(c), s = c < 0 ? '-' : (first ? '' : '+'); return s + (v ? (a === 1 ? '' : num(a)) + v : num(a)); }
  function lin(m, b, v) { return term(m, v || 'x', true) + (b ? term(b, '', false) : ''); }       // 2x-4
  function cfirst(b, m, v) { return num(b) + term(m, v, false); }                                  // 20-1.5t
  function quadTex(a, b, c) { return (a === 1 ? '' : num(a)) + 'x^{2}' + (b ? term(b, 'x', false) : '') + (c ? term(c, '', false) : ''); }
  function sorted(a) { return a.slice().sort(function (x, y) { return x - y; }); }
  function uniq(a) { return sorted(a).filter(function (x, i, s) { return i === 0 || s[i - 1] !== x; }); }
  function pt(p) { return '(' + num(p[0]) + ',\\ ' + num(p[1]) + ')'; }
  function ptsTex(ps) { return ps.map(pt).join(',\\ '); }
  function br(x) { return x < 0 ? '(' + num(x) + ')' : num(x); }
  function htable(h1, h2, xs, ys) { return HW.valueTable([[t(h1)].concat(xs), [t(h2)].concat(ys)]); }
  function vtable(h1, h2, xs, ys) {
    return '<table class="vtab"><tr><th>' + t(h1) + '</th><th>' + t(h2) + '</th></tr>' + xs.map(function (x, i) { return '<tr><td>' + t(num(x)) + '</td><td>' + t(num(ys[i])) + '</td></tr>'; }).join('') + '</table>';
  }
  function nbox(label, name, before) { return { label: label, name: name || label, mode: 'math', keys: 'fraction', before: before }; }
  function vchk(ans, diag) { return K.value(ans, { diag: diag || null }); }
  var mc = function (r, prompt, opts, sol, hints, text, keep) { return K.P.mc(r, prompt, opts, sol, hints, text, keep); };
  function cgraph(o) { // first-quadrant context graph with its own scales
    return HW.graph({ x: [0, o.X], y: [0, o.Y], firstQuadrant: true, unitX: (o.w || 200) / o.X, unitY: (o.h || 150) / o.Y, grid: o.gx, gridY: o.gy, labels: o.lx, labelsX: o.lx, labelsY: o.ly,
      xName: o.xn || 'x', yName: o.yn || 'y', xTitle: o.xt, yTitle: o.yt, points: o.points, segs: o.segs, fns: o.fns, max: o.max || 240 });
  }
  function seqTex(ys) { return ys.map(num).join(',\\ '); }

  /* ---------- independent / dependent variable (typed letters) ---------- */
  function varsPart(prompt, ind, dep, why, sol, text) {
    function clean(s) { return String(s == null ? '' : s).replace(/\\[a-zA-Z]+|[{}$\\()\s]/g, ''); }
    var cs = ind.toLowerCase() === dep.toLowerCase();
    function same(a, b) { return cs ? a === b : a.toLowerCase() === b.toLowerCase(); }
    return { prompt: prompt, text: text, solution: sol,
      input: { type: 'fields', fields: [{ label: 'Independent variable:', name: 'Independent', mode: 'text', placeholder: 'letter' }, { label: 'Dependent variable:', name: 'Dependent', mode: 'text', placeholder: 'letter' }] },
      key: [ind, dep], answer: 'Independent: ' + t(ind) + '; dependent: ' + t(dep), good: [[ind.toLowerCase() === ind ? ind : ind, dep]], bad: [[dep, ind], [ind, ind]],
      check: function (resp) {
        resp = resp || []; var a = clean(resp[0]), b = clean(resp[1]);
        if (!a || !b) return form('empty', 'Type one letter in each box.');
        if (same(a, ind) && same(b, dep)) return ok();
        if (same(a, dep) && same(b, ind)) return wrong('var-swap', why);
        if (same(a, b)) return wrong('var-same', 'The two boxes need two different variables: one is the input, the other the output.');
        if (!(same(a, ind) || same(a, dep)) || !(same(b, ind) || same(b, dep))) return form('var-letter', 'Use the letters from the question, ' + t(ind) + ' and ' + t(dep) + ' (one letter per box).');
        return wrong('value', null);
      },
      hints: ['The independent variable is the input — the one that changes on its own. The dependent variable is the output: its value is decided by the input.'] };
  }
  /* ---------- a list of inputs or outputs (whole numbers) ---------- */
  function listPart(prompt, want, other, kind, where, sol, text) {
    var W = uniq(want), O = uniq(other), kindOther = kind === 'inputs' ? 'outputs' : 'inputs';
    return { prompt: prompt, input: { type: 'list' }, key: W, answer: t(W.map(num).join(',\\ ')), solution: sol, text: text, bad: [O, W.concat(O)],
      check: function (resp) {
        if (!resp || !resp.length) return form('empty', 'Add the numbers one at a time.');
        var u = uniq(resp);
        if (u.length < resp.length) return form('dup', kind === 'outputs' ? 'List each output <b>once</b>, even if more than one arrow (or pair) leads to it.' : 'List each input once.');
        var extra = u.filter(function (x) { return W.indexOf(x) < 0; }), miss = W.filter(function (x) { return u.indexOf(x) < 0; });
        if (!extra.length && !miss.length) return ok();
        if (u.join() === O.join()) return wrong('io-swap', 'Those are the ' + kindOther + '. The ' + kind + ' are ' + where + '.');
        if (extra.length && extra.every(function (x) { return O.indexOf(x) >= 0; })) return wrong('io-mixed', t(num(extra[0])) + ' is one of the ' + kindOther + '. The ' + kind + ' are ' + where + '.');
        if (extra.length) return wrong('io-extra', t(num(extra[0])) + ' isn’t in the relation as one of the ' + kind + '.');
        return wrong('io-missing', 'You’re missing ' + (miss.length === 1 ? 'one value' : miss.length + ' values') + '. The ' + kind + ' are ' + where + '.');
      },
      hints: ['The ' + kind + ' are ' + where + '.', 'Write each value once.'] };
  }
  /* ---------- a table of values from an equation (one box per input) ---------- */
  function evalTable(prompt, xs, f, diag, sol, text) {
    var ys = xs.map(f), fields = xs.map(function (x) { return nbox(t('x=' + num(x)), t('x=' + num(x)), t('y=')); });
    return { prompt: prompt, input: { type: 'fields', fields: fields }, key: ys.map(num), answer: htable('x', 'y', xs, ys), solution: sol, text: text,
      check: K.fields(xs.map(function (x, i) { return vchk(ys[i], function (v) { return diag(x, v); }); }), { labels: fields.map(function (fd) { return fd.name; }) }),
      hints: ['Substitute each input for ' + t('x') + ' — put negative inputs in brackets — and follow the order of operations.'] };
  }
  /* ---------- first differences + linear or nonlinear ---------- */
  function linWord(isLin, ds) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).toLowerCase().replace(/\\text|[^a-z]/g, '');
      if (!s) return form('empty', 'Type <b>linear</b> or <b>nonlinear</b> in the last box.');
      var said = s === 'linear' ? true : (s === 'nonlinear' || s === 'notlinear') ? false : null;
      if (said === null) return form('lin-word', 'In the last box type <b>linear</b> or <b>nonlinear</b>.');
      if (said === isLin) return ok();
      return isLin ? wrong('said-nonlinear', 'Your changes are all the same (' + t(seqTex(ds)) + ') — a constant difference is exactly what makes a relation <b>linear</b>.')
        : wrong('said-linear', 'The changes ' + t(seqTex(ds)) + ' are not all the same, so the relation is <b>not</b> linear.');
    };
  }
  function diffsPart(prompt, xs, ys, text) {
    var ds = ys.slice(1).map(function (y, i) { return y - ys[i]; }), step = xs[1] - xs[0], isLin = ds.every(function (d) { return d === ds[0]; });
    var fields = ds.map(function (d, i) { return nbox(t(num(ys[i]) + '\\to ' + num(ys[i + 1])), 'Change ' + (i + 1)); })
      .concat([{ label: 'Linear or nonlinear?', name: 'Linear or nonlinear', mode: 'text', wide: true, placeholder: 'linear / nonlinear' }]);
    var checks = ds.map(function (d) { return vchk(d, function (v) {
      if (d !== 0 && v === -d) return { code: 'diff-rev', hint: 'Subtract in the order <b>next − previous</b>. When the output goes ' + (d < 0 ? 'down' : 'up') + ', the change is ' + (d < 0 ? 'negative' : 'positive') + '.' };
      if (step !== 1 && Math.abs(v - d / step) < 1e-9) return { code: 'diff-unit', hint: 'The question asks for the change in ' + t('y') + ' from one output to the next — don’t divide by the step in ' + t('x') + '.' };
      return null; }); }).concat([linWord(isLin, ds)]);
    return { prompt: prompt + htable('x', 'y', xs, ys), input: { type: 'fields', fields: fields }, key: ds.map(num).concat([isLin ? 'linear' : 'nonlinear']), text: text,
      answer: 'Changes ' + t(ds.map(function (d) { return (d > 0 ? '+' : '') + num(d); }).join(',\\ ')) + ': <b>' + (isLin ? 'linear' : 'nonlinear') + '</b>',
      good: [ds.map(num).concat([isLin ? 'Linear' : 'non-linear'])], bad: [ds.map(num).concat([isLin ? 'nonlinear' : 'linear'])],
      check: K.fields(checks, { labels: fields.map(function (f) { return f.name; }) }),
      solution: (step !== 1 ? 'The inputs go up in equal steps of ' + t(step) + '. ' : '') + 'Changes (next − previous): ' + ds.map(function (d, i) { return t(num(ys[i + 1]) + '-' + br(ys[i]) + '=' + num(d)); }).join(', ') + '. ' +
        (isLin ? 'The change is the same every step, so the relation is <b>linear</b>.' : 'The changes are not all equal, so the relation is <b>nonlinear</b>.'),
      hints: ['Subtract each output from the next one (next − previous).', 'Same change every step → linear. Different changes → nonlinear.'] };
  }

  /* ---------- question pools ---------- */
  var EQ4 = [
    { ind: 'h', dep: 'w', ks: [6.5, 15.5, 16, 17.5], s: function (k) { return 'A worker’s wages, ' + t('w') + ' (dollars), are related to the number of hours worked, ' + t('h') + ', by the equation ' + t('w=' + num(k) + 'h') + '.'; } },
    { ind: 'n', dep: 'C', ks: [12, 13.5, 14, 15], s: function (k) { return 'The cost, ' + t('C') + ' (dollars), of ' + t('n') + ' movie tickets is given by the equation ' + t('C=' + num(k) + 'n') + '.'; } },
    { ind: 't', dep: 'd', ks: [80, 90, 95, 110], s: function (k) { return 'The number of hours, ' + t('t') + ', a train travels and the distance it covers, ' + t('d') + ' (km), are related by ' + t('d=' + k + 't') + '.'; } },
    { ind: 'r', dep: 'A', ks: [3.14], s: function () { return 'The area, ' + t('A') + ' (cm²), of a circle is related to its radius, ' + t('r') + ' (cm), by the equation ' + t('A=3.14r^{2}') + '.'; } },
    { ind: 'm', dep: 'E', ks: [0.55, 0.65, 0.8], s: function (k) { return 'The number of minutes, ' + t('m') + ', a fan runs and the energy it uses, ' + t('E') + ' (kJ), are related by ' + t('E=' + num(k) + 'm') + '.'; } }];
  var CTX4 = [
    { ind: 't', dep: 'n', s: ['The number of bacteria, ' + t('n') + ', in a culture is related to the time, ' + t('t') + ' (in hours), since the culture began growing.', 'The time, ' + t('t') + ' (in hours), since a culture began growing is related to the number of bacteria, ' + t('n') + ', in the culture.'], why: 'The number of bacteria depends on how long the culture has been growing — the time doesn’t depend on the bacteria.' },
    { ind: 'd', dep: 'h', s: ['The height, ' + t('h') + ' (cm), of a bean plant is related to the number of days, ' + t('d') + ', since it sprouted.', 'The number of days, ' + t('d') + ', since a bean plant sprouted is related to its height, ' + t('h') + ' (cm).'], why: 'The plant’s height depends on how many days it has been growing.' },
    { ind: 's', dep: 't', s: ['The time, ' + t('t') + ' (hours), a drive from Calgary to Edmonton takes is related to the average speed, ' + t('s') + ' (km/h).', 'The average speed, ' + t('s') + ' (km/h), on a drive from Calgary to Edmonton is related to the time, ' + t('t') + ' (hours), the drive takes.'], why: 'The trip time depends on how fast you drive. Careful: ' + t('t') + ' is a time here, but it is the output.' },
    { ind: 'g', dep: 'B', s: ['A monthly phone bill, ' + t('B') + ' (dollars), is related to the number of gigabytes of data used, ' + t('g') + '.', 'The number of gigabytes of data used, ' + t('g') + ', is related to the monthly phone bill, ' + t('B') + ' (dollars).'], why: 'The bill is worked out from the data used — the data used doesn’t depend on the bill.' },
    { ind: 'b', dep: 'h', s: ['The number of hours, ' + t('h') + ', a phone battery lasts is related to the screen brightness setting, ' + t('b') + '.', 'The screen brightness setting, ' + t('b') + ', of a phone is related to the number of hours, ' + t('h') + ', its battery lasts.'], why: 'You choose the brightness; how long the battery lasts depends on that choice. Careful: here time is the output.' },
    { ind: 'v', dep: 'd', s: ['The stopping distance, ' + t('d') + ' (m), of a car is related to its speed, ' + t('v') + ' (km/h).', 'The speed, ' + t('v') + ' (km/h), of a car is related to its stopping distance, ' + t('d') + ' (m).'], why: 'A faster car needs more room to stop: the stopping distance depends on the speed.' }];
  var GR4 = [
    { x: 'distance', y: 'elevation', f: function (x) { return 0.3 * x * (7 - x); }, from: 0.1, to: 7 },
    { x: 'time', y: 'temperature', f: function (x) { return 2 * Math.sqrt(x); }, from: 0.3, to: 7.5 },
    { x: 'time', y: 'height of a ball', f: function (x) { return 0.36 * x * (7.5 - x); }, from: 0, to: 7.5 },
    { x: 'number of days', y: 'height of a plant', f: function (x) { return 0.65 * x + 0.4; }, from: 0, to: 7.5 },
    { x: 'speed', y: 'fuel used', f: function (x) { return 0.08 * (x - 4) * (x - 4) + 1.2; }, from: 0.3, to: 7.8 },
    { x: 'time', y: 'water in a tank', f: function (x) { return 5.5 - 0.7 * x; }, from: 0, to: 7.5 }];
  var MC10 = [
    { s: '“The temperature of a cup of coffee, ' + t('T') + ', is related to the time, ' + t('t') + ', since it was poured.”', ind: 'the time since it was poured', dep: 'the temperature of the coffee', ds: ['the rate of cooling', 'the room temperature'] },
    { s: '“The height of a sunflower, ' + t('h') + ', is related to the number of weeks, ' + t('w') + ', since it was planted.”', ind: 'the number of weeks since it was planted', dep: 'the height of the sunflower', ds: ['the type of soil', 'the amount of sunlight'] },
    { s: '“The cost of a taxi ride, ' + t('C') + ', is related to the distance travelled, ' + t('d') + '.”', ind: 'the distance travelled', dep: 'the cost of the ride', ds: ['the speed of the taxi', 'the number of passengers'] },
    { s: '“The volume of water in a draining bathtub, ' + t('V') + ', is related to the time, ' + t('t') + ', since the plug was pulled.”', ind: 'the time since the plug was pulled', dep: 'the volume of water in the tub', ds: ['the size of the drain', 'the temperature of the water'] },
    { s: '“The mass of a puppy, ' + t('m') + ', is related to its age, ' + t('a') + ', in weeks.”', ind: 'the age of the puppy', dep: 'the mass of the puppy', ds: ['the breed of the puppy', 'the amount of food it eats'] }];

  /* ---------- extra-practice helpers ---------- */
  var WORD = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
  function times(k) { return k === 1 ? '' : k === 2 ? 'twice ' : WORD[k] + ' times '; }
  function rule(m, b) { return WORD[Math.abs(b)] + (b > 0 ? ' more' : ' less') + ' than ' + times(m) + 'the input'; }
  function contMC(r, prompt, discrete, sitWhy, text) {
    var o = discrete ? [
      { html: 'No — only whole numbers make sense here, so the relation is <b>discrete</b>: leave the points unjoined.', right: true },
      { html: 'Yes — join them with a straight line, because the points line up.', why: 'Lining up isn’t enough. ' + sitWhy },
      { html: 'Yes — always join the points of a graph so the pattern is easy to see.', why: 'Joining the points claims that every value in between belongs to the relation. ' + sitWhy },
      { html: 'No — because the outputs are large numbers.', why: 'The size of the numbers doesn’t matter. Ask whether the in-between inputs make sense.' }] : [
      { html: 'Join them with a solid line: the inputs change continuously, so every value in between belongs to the relation (it is <b>continuous</b>).', right: true },
      { html: 'Leave them as separate dots: only whole numbers of minutes count.', why: sitWhy },
      { html: 'Join them with a dashed line, because a line is only an estimate.', why: 'Nothing is estimated here: with a steady rate every in-between point is exact. ' + sitWhy },
      { html: 'Draw a bar for each input.', why: 'Bars show separate categories. ' + sitWhy }];
    return mc(r, prompt, o, discrete ? 'The relation is <b>discrete</b>: ' + sitWhy + ' Joining the points would claim values that can’t happen.' : 'The relation is <b>continuous</b>: ' + sitWhy + ' Join the points with a solid line.', ['Does an input between two of the plotted ones (like ' + t('2.5') + ') make sense in the situation?'], text);
  }
  function pairsPart(prompt, ps, sol, text, extra) {
    var p = K.P.pairs(prompt, ps, {}, sol, ['Write each pair as ' + t('(\\text{input},\\ \\text{output})') + ' — independent variable first.'], text);
    p.bad = [ps.slice(1), '\\{' + ps.map(function (q) { return pt([q[1], q[0]]); }).join(',') + '\\}'];
    if (extra) { var c0 = p.check; p.check = function (resp) { var h = extra(resp); return h || c0(resp); }; }
    return p;
  }
  function arrowsFrom(ins, outs, pat) { return ins.map(function (x, i) { return [x, outs[pat[i]]]; }); }

  var DEP11A = [
    { ind: 'number of litres of fuel pumped', dep: 'cost of the fill-up', why: 'You pump the fuel first; the cost is worked out from the litres.' },
    { ind: 'number of weeks since a sunflower was planted', dep: 'height of the sunflower', why: 'The sunflower grows as the weeks pass — the weeks don’t depend on its height.' },
    { ind: 'number of hours worked', dep: 'pay earned', why: 'The pay is calculated from the hours worked.' },
    { ind: 'number of tickets sold', dep: 'money collected', why: 'The money collected is decided by how many tickets are sold.' },
    { ind: 'distance a taxi drives', dep: 'fare charged', why: 'The fare is calculated from the distance driven.' }];
  var DEP11B = [
    { ind: 'diameter of a round pizza', dep: 'area of the pizza', why: 'The area is calculated from the size of the pizza (' + t('A=\\pi r^{2}') + ', with ' + t('r') + ' half the diameter).' },
    { ind: 'average speed of a speed skater', dep: 'time the skater takes to finish 500 m', why: 'A faster skater finishes sooner: the time depends on the speed (time = 500 ÷ speed). Careful: time is the output here.' },
    { ind: 'number of people sharing a pizza bill equally', dep: 'amount each person pays', why: 'Each share is the bill divided by the number of people, so the share depends on how many people there are.' },
    { ind: 'temperature outside', dep: 'number of ice-cream cones sold', why: 'Hot days sell more cones; the number of cones sold can’t change the weather.' },
    { ind: 'age of a child in months', dep: 'mass of the child', why: 'The child’s mass changes as the child gets older; age doesn’t depend on mass.' }];
  function dependsMC(r, c, text) {
    var q = r.chance(0.5) ? [c.ind, c.dep] : [c.dep, c.ind];
    return mc(r, 'Quantities: the ' + q[0] + ', and the ' + q[1] + '. Which sentence is correct?', [
      { html: 'The ' + c.dep + ' depends on the ' + c.ind + '.', right: true },
      { html: 'The ' + c.ind + ' depends on the ' + c.dep + '.', why: c.why },
      { html: 'Neither quantity depends on the other.', why: 'When one of them changes, so does the other. Which one causes the change?' },
      { html: 'The quantity mentioned first is always the independent variable.', why: 'The order the quantities are written in doesn’t decide it — the situation does. ' + c.why }],
      c.why + ' So the <b>' + c.dep + '</b> (dependent) depends on the <b>' + c.ind + '</b> (independent).', ['Ask: which quantity is decided by the other one?'], text);
  }

  var EXTRA = [
    { num: '1', section: 'Extra practice A — One relation, several descriptions', stem: function (sh) { return 'A rain barrel holds ' + t(sh.V) + ' L of water. A soaker hose drains it at a steady rate of ' + t(sh.R) + ' L per minute. Let ' + t('t') + ' be the time in minutes and ' + t('V') + ' the volume left in litres.'; },
      shared: function (r) { var o = r.pick([[200, 25], [200, 25], [200, 20], [240, 30], [180, 20], [160, 20], [150, 25], [240, 40], [300, 50]]); return { V: o[0], R: o[1], T: o[0] / o[1] }; },
      parts: [
        { id: 'e1b', sub: 'b', level: 'BEG', make: function (r, sh) {
          var V = sh.V, R = sh.R, ts = [0, 1, 2, 3, 4], vs = ts.map(function (x) { return V - R * x; });
          var fields = ts.map(function (x) { return { label: t('t=' + x), name: t('t=' + x), before: t('V=') }; });
          return { prompt: 'Complete the table of values for ' + t('t=0,1,2,3,4') + '.', input: { type: 'fields', fields: fields }, key: vs.map(String), answer: htable('t', 'V', ts, vs), text: 'barrel table',
            bad: [ts.map(function (x) { return String(V + R * x); })],
            check: K.fields(ts.map(function (x, i) { return K.number(vs[i], function (v) {
              if (x > 0 && v === V + R * x) return { code: 'ctx-add', hint: 'The barrel is draining: <b>subtract</b> ' + t(R) + ' L each minute.' };
              if (v === V - R * (x + 1)) return { code: 'ctx-part', hint: 'At ' + t('t=0') + ' nothing has drained yet — the barrel is full.' };
              return null; }); }), { labels: fields.map(function (f) { return f.name; }) }),
            solution: 'Start at ' + t(V) + ' and subtract ' + t(R) + ' each minute: ' + t(seqTex(vs)) + '.', hints: ['At ' + t('t=0') + ' the barrel is full. Each minute, ' + t(R) + ' L drain away.'] };
        } },
        { id: 'e1c', sub: 'c', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          var ps = [0, 1, 2, 3, 4].map(function (x) { return [x, sh.V - sh.R * x]; });
          return pairsPart('Write the relation for ' + t('t=0,1,2,3,4') + ' as a set of ordered pairs ' + t('(t,V)') + '.', ps, 'Pair each ' + t('t') + ' with its ' + t('V') + ', input first: ' + t(ptsTex(ps)) + '.', 'barrel pairs');
        } },
        { id: 'e1d', sub: 'd', level: 'EMG', make: function (r, sh) { return contMC(r, 'The water level falls continuously, not in jumps. What should you do with the points after you plot them?', false, 'Water keeps draining between the whole minutes (at ' + t('t=1.5') + ' there is still a volume), so the in-between points belong to the relation too.', 'barrel continuous'); } },
        { id: 'e1e', sub: 'e', level: 'EMG', make: function (r, sh) {
          var V = sh.V, R = sh.R, T = sh.T, ly = [50, 60, 40, 30, 100].filter(function (x) { return V % x === 0 && V / x >= 3 && V / x <= 6; })[0], gy = ly / 2;
          var base = { X: T + 1, Y: V + gy, gx: 1, gy: gy, lx: T > 7 ? 2 : 1, ly: ly, xn: 't', yn: 'V', xt: 'Time (min)', yt: 'Volume (L)', w: 180, h: 130, max: 220 };
          var dots = [0, 1, 2, 3, 4].map(function (x) { return { x: x, y: V - R * x }; });
          function G(extra) { var o = Object.assign({}, base, extra); return cgraph(o); }
          var p = mc(r, 'Which graph shows this relation?', [
            { html: G({ segs: [{ pts: [[0, V], [T, 0]], start: 'closed', end: 'closed' }], points: dots }), right: true },
            { html: G({ points: dots }), why: 'Those are the right points, but the water drains continuously, so they should be joined with a line.' },
            { html: G({ segs: [{ pts: [[0, 0], [T, V]], start: 'closed', end: 'closed' }], points: [0, 1, 2, 3, 4].map(function (x) { return { x: x, y: R * x }; }) }), why: 'That volume goes <b>up</b> over time. The barrel is draining, so the volume goes down.' },
            { html: G({ segs: [{ pts: [[0, V], [T / 2, 0]], start: 'closed', end: 'closed' }], points: [0, 1, 2].filter(function (x) { return 2 * R * x <= V; }).map(function (x) { return { x: x, y: V - 2 * R * x }; }) }), why: 'Check ' + t('t=1') + ': the volume should be ' + t(V - R) + ' L, but this graph shows ' + t(V - 2 * R) + ' L.' }],
            'The graph starts at ' + t('(0,' + V + ')') + ', falls ' + t(R) + ' L each minute and is a solid line (continuous) that reaches the ' + t('t') + '-axis at ' + t('(' + T + ',0)') + '.', ['Where does the graph start? Does it go up or down? Is it joined?'], 'barrel graph');
          p.input.columns = 2; return p;
        } },
        { id: 'e1f', sub: 'f', level: 'EMG', make: function (r, sh) {
          return K.P.number('At what time is the barrel empty?', sh.T, function (v) {
            if (v === sh.V - sh.R) return { code: 'diag', hint: 'That’s the volume after one minute. Find the time when the volume reaches ' + t('0') + '.' };
            return null; }, 'Empty means ' + t('V=0') + ': ' + t(sh.V + '\\div ' + sh.R + '=' + sh.T) + '. The barrel is empty after <b>' + sh.T + ' min</b>.', ['How many minutes does it take to drain ' + t(sh.V) + ' L at ' + t(sh.R) + ' L per minute?'], 'barrel empty time', { after: 'min' });
        } },
        { id: 'e1g', sub: 'g', level: 'PRG', make: function (r, sh) {
          var V = sh.V, R = sh.R;
          var p = K.P.poly('Write an equation for ' + t('V') + ' in terms of ' + t('t') + '.', PL.parse(cfirst(V, -R, 't')), { before: t('V='), keyTex: cfirst(V, -R, 't'),
            wrong: [{ is: PL.parse(lin(R, -V, 't')), code: 'eq-sign', hint: 'At ' + t('t=0') + ' your equation gives ' + t('V=-' + V) + '. The barrel starts full and loses water.' },
              { is: PL.parse(lin(R, V, 't')), code: 'eq-sign', hint: 'The volume goes <b>down</b> by ' + t(R) + ' L each minute: subtract.' },
              { is: PL.parse(lin(V, -R, 't')), code: 'eq-rate-const', hint: 'The ' + t(V) + ' L is the starting amount (the constant); the rate ' + t(R) + ' multiplies ' + t('t') + '.' }] },
            'Starts at ' + t(V) + ' L and loses ' + t(R) + ' L each minute: ' + t('V=' + cfirst(V, -R, 't')) + '. Check ' + t('t=' + sh.T) + ': ' + t(V + '-' + R + '(' + sh.T + ')=0') + ' ✓', ['What is ' + t('V') + ' at ' + t('t=0') + '? How does it change each minute?'], 'barrel equation');
          p.good = [lin(-R, V, 't')]; return p;
        } }] },
    { num: '2', stem: function (sh) { return 'A tool shop rents out a pressure washer. The table shows the total charge ' + t('C') + ', in dollars, for ' + t('d') + ' days of rental. <b>The inputs do not go up by ' + t('1') + ' each time.</b>' + htable('d', 'C', sh.ds, sh.cs); },
      shared: function (r) {
        var F, R; do { F = r.pick([10, 15, 20, 20, 25, 30]); R = r.pick([20, 25, 30, 30, 35, 40]); } while (F === R);
        var ds = r.pick([[1, 2, 4, 6], [1, 2, 4, 6], [1, 3, 4, 6], [1, 2, 5, 7], [2, 3, 5, 8]]);
        return { F: F, R: R, ds: ds, cs: ds.map(function (d) { return F + R * d; }) };
      },
      parts: [
        { id: 'e2a', level: 'PRG', make: function (r, sh) {
          var F = sh.F, R = sh.R, ds = sh.ds, cs = sh.cs, j = [0, 1, 2].filter(function (i) { return ds[i + 1] - ds[i] > 1; })[0];
          var fields = [{ label: 'Charge per day:', name: 'Per day', before: t('\\$') }, { label: 'Up-front charge:', name: 'Up front', before: t('\\$') }];
          return { prompt: 'Describe the relation: what does the shop charge per day, and what does it charge up front?', input: { type: 'fields', fields: fields }, key: [String(R), String(F)], text: 'rental rate and fee',
            answer: t('\\$' + R) + ' per day plus ' + t('\\$' + F) + ' up front', bad: [[String(cs[j + 1] - cs[j]), String(F)], [String(R), String(cs[0])]],
            check: K.fields([K.number(R, function (v) {
              if (v === cs[j + 1] - cs[j]) return { code: 'rate-total', hint: 'From ' + t('d=' + ds[j]) + ' to ' + t('d=' + ds[j + 1]) + ' is ' + t(ds[j + 1] - ds[j]) + ' days, so ' + t('\\$' + (cs[j + 1] - cs[j])) + ' is the charge for ' + t(ds[j + 1] - ds[j]) + ' days. Divide.' };
              if (v === cs[0] || v * ds[0] === cs[0]) return { code: 'rate-first', hint: 'The first charge includes the up-front fee. Use how much the charge goes <b>up</b> per extra day.' };
              return null; }), K.number(F, function (v) {
              if (v === cs[0]) return { code: 'fee-first', hint: 'That’s the whole charge for ' + t(ds[0]) + ' day' + (ds[0] > 1 ? 's' : '') + '. Take off the daily charge' + (ds[0] > 1 ? 's' : '') + ' to find the up-front part.' };
              return null; })], { labels: ['Per day', 'Up front'] }),
            solution: 'From ' + t('d=' + ds[j]) + ' to ' + t('d=' + ds[j + 1]) + ' the charge rises ' + t(cs[j + 1] + '-' + cs[j] + '=' + (cs[j + 1] - cs[j])) + ' over ' + t(ds[j + 1] - ds[j]) + ' days: ' + t((cs[j + 1] - cs[j]) + '\\div ' + (ds[j + 1] - ds[j]) + '=' + R) + ' per day. Up front: ' + t(cs[0] + '-' + (ds[0] > 1 ? ds[0] + '\\times ' : '') + R + '=' + F) + '. The shop charges <b>' + t('\\$' + F) + ' up front plus ' + t('\\$' + R) + ' per day</b>.',
            hints: ['Pick two columns and divide the change in ' + t('C') + ' by the change in ' + t('d') + '.', 'Then take the daily charges off one of the totals.'] };
        } },
        { id: 'e2b', level: 'BEG', outcome: 'RF2', make: function (r, sh) { var ps = sh.ds.map(function (d, i) { return [d, sh.cs[i]]; }); return pairsPart('Write the relation as a set of ordered pairs ' + t('(d,C)') + '.', ps, 'Each column gives a pair, input first: ' + t(ptsTex(ps)) + '. The first coordinate is ' + t('d') + ' (days, independent); the second is ' + t('C') + ' (dollars, dependent).', 'rental pairs'); } },
        { id: 'e2d', sub: 'd', level: 'EMG', make: function (r, sh) { return contMC(r, 'The shop rents only in whole days. When you plot the ordered pairs, should you join the points with a line?', true, 'Only whole days can be rented — a line would claim a charge for ' + t('2.5') + ' days, which can’t happen.', 'rental discrete'); } },
        { id: 'e2e', sub: 'e', level: 'EMG', make: function (r, sh) {
          var F = sh.F, R = sh.R, d1 = r.pick([3, 5, 7].filter(function (d) { return sh.ds.indexOf(d) < 0; })), d2 = r.pick([9, 10, 12]);
          var fields = [{ label: t(d1) + ' days:', name: d1 + ' days', before: t('\\$') }, { label: t(d2) + ' days:', name: d2 + ' days', before: t('\\$') }];
          var diag = function (d) { return function (v) { if (v === R * d) return { code: 'ctx-no-fee', hint: 'Add the ' + t('\\$' + F) + ' up-front charge.' }; if (v === (F + R) * d) return { code: 'ctx-fee-times', hint: 'The up-front charge is paid once, not every day.' }; return null; }; };
          return { prompt: 'Determine the charge for ' + t(d1) + ' days and for ' + t(d2) + ' days.', input: { type: 'fields', fields: fields }, key: [String(F + R * d1), String(F + R * d2)], text: 'rental charges',
            answer: t('\\$' + (F + R * d1)) + ' and ' + t('\\$' + (F + R * d2)), bad: [[String(R * d1), String(R * d2)]],
            check: K.fields([K.number(F + R * d1, diag(d1)), K.number(F + R * d2, diag(d2))], { labels: [d1 + ' days', d2 + ' days'] }),
            solution: t('C=' + F + '+' + R + 'd') + '. ' + t('d=' + d1 + ':\\ ' + F + '+' + R + '(' + d1 + ')=' + (F + R * d1)) + '; ' + t('d=' + d2 + ':\\ ' + F + '+' + R + '(' + d2 + ')=' + (F + R * d2)) + '.', hints: ['Use ' + t('C=' + F + '+' + R + 'd') + ' (up-front charge plus the daily charge times the days).'] };
        } },
        { id: 'e2f', sub: 'f', level: 'PRG', make: function (r, sh) {
          var F = sh.F, R = sh.R, d = r.int(11, 16), C = F + R * d;
          return K.P.number('A customer is charged ' + t('\\$' + C) + '. How many days did they keep the washer?', d, function (v) {
            if (Math.abs(v - C / R) < 0.01) return { code: 'ctx-no-fee', hint: 'Part of the ' + t('\\$' + C) + ' is the ' + t('\\$' + F) + ' up-front charge. Take it off first.' };
            if (Math.abs(v - (C + F) / R) < 0.01) return { code: 'solve-inverse', hint: 'Solve ' + t(F + '+' + R + 'd=' + C) + ': <b>subtract</b> ' + t(F) + ' from both sides first.' };
            if (v === C - F) return { code: 'solve-no-div', hint: 'That’s the money spent on days. Divide by ' + t('\\$' + R) + ' per day.' };
            return null; }, t(F + '+' + R + 'd=' + C) + ' → ' + t(R + 'd=' + (C - F)) + ' → ' + t('d=' + d) + '. They kept it <b>' + d + ' days</b>.', ['Set ' + t(F + '+' + R + 'd') + ' equal to ' + t(C) + ' and solve.'], 'rental days for ' + C, { after: 'days' });
        } }] },
    { num: '3', stem: function (sh) { return 'A relation is given by the ordered pairs ' + t(ptsTex(sh.ps)) + '.'; },
      shared: function (r) {
        var m = r.pick([2, 2, 3, 4]), b = r.pick([-3, -2, -1, 1, 1, 2, 3].filter(function (x) { return Math.abs(x) !== m; }));
        return { m: m, b: b, ps: [-2, -1, 0, 1, 2].map(function (x) { return [x, m * x + b]; }) };
      },
      parts: [
        { id: 'e3d', sub: 'd', level: 'EMG', make: function (r, sh) {
          var m = sh.m, b = sh.b;
          var opts = [{ html: 'Each output is ' + rule(m, b) + '.', right: true },
            { html: 'Each output is ' + WORD[m] + (b > 0 ? ' more' : ' less') + ' than ' + times(Math.abs(b)) + 'the input.', why: 'Test it on ' + t(pt([0, b])) + ': your rule gives ' + t(b > 0 ? m : -m) + ', not ' + t(b) + '.' },
            { html: 'Each output is ' + times(m) + 'the number that is ' + WORD[Math.abs(b)] + (b > 0 ? ' more' : ' less') + ' than the input.', why: 'Test it on ' + t(pt([0, b])) + ': your rule gives ' + t(m * b) + ', not ' + t(b) + '. Multiply first, then add.' },
            { html: 'Each output is ' + WORD[Math.abs(b)] + (b > 0 ? ' less' : ' more') + ' than ' + times(m) + 'the input.', why: 'Test it on ' + t(pt([0, b])) + ': your rule gives ' + t(-b) + ', not ' + t(b) + '.' }];
          return mc(r, 'Describe the relation in words.', opts, 'As ' + t('x') + ' goes up by ' + t('1') + ', ' + t('y') + ' goes up by ' + t(m) + ', and ' + t('x=0') + ' gives ' + t('y=' + b) + '. Each output is <b>' + rule(m, b) + '</b>.', ['Look at the pair with input ' + t('0') + ', and at how much the output grows for each step of ' + t('1') + '.'], 'words for y=' + lin(m, b));
        } },
        { id: 'e3e', sub: 'e', level: 'EMG', make: function (r, sh) {
          var m = sh.m, b = sh.b;
          var p = K.P.poly('Write an equation for the relation.', PL.parse(lin(m, b)), { before: t('y='),
            wrong: [{ is: PL.parse(lin(b, m)), code: 'eq-rate-const', hint: 'Check with ' + t(pt([0, b])) + ': at ' + t('x=0') + ' the output is ' + t(b) + ', so the constant is ' + t(b) + '. The change per step, ' + t(m) + ', multiplies ' + t('x') + '.' },
              { is: PL.parse(lin(m, -b)), code: 'const-sign', hint: 'Check with ' + t(pt([0, b])) + ': at ' + t('x=0') + ' the output is ' + t(b) + '.' }] },
            t('y') + ' rises ' + t(m) + ' for every ' + t('1') + ' in ' + t('x') + ', and ' + t('y=' + b) + ' when ' + t('x=0') + ': ' + t('y=' + lin(m, b)) + '. Check ' + t(pt(sh.ps[4])) + ': ' + t(m + '(2)' + term(b, '', false) + '=' + sh.ps[4][1]) + ' ✓', ['How much does ' + t('y') + ' change for each step of ' + t('1') + ' in ' + t('x') + '? What is ' + t('y') + ' when ' + t('x=0') + '?'], 'equation from pairs');
          p.good = [num(b) + '+' + m + 'x']; return p;
        } },
        { id: 'e3f', sub: 'f', level: 'EMG', make: function (r, sh) {
          var m = sh.m, b = sh.b, X = r.int(5, 8), xi = r.pick([-7, -6, -5, -4, -3].filter(function (x) { return m * (m * x + b) + b !== x; })), Y = m * xi + b;
          var fields = [nbox('Output when the input is ' + t(X) + ':', 'Output'), nbox('Input that gives an output of ' + t(Y) + ':', 'Input')];
          return { prompt: 'Use your equation. Determine the output when the input is ' + t(X) + ', and the input that gives an output of ' + t(Y) + '.', input: { type: 'fields', fields: fields }, key: [String(m * X + b), String(xi)], text: 'evaluate and solve y=' + lin(m, b),
            answer: 'Output ' + t(m * X + b) + '; input ' + t(xi), bad: [[String(m * X + b), String(m * Y + b)]],
            check: K.fields([vchk(m * X + b), vchk(xi, function (v) {
              if (v === m * Y + b) return { code: 'solve-sub-y', hint: t(Y) + ' is the <b>output</b>: solve ' + t(lin(m, b) + '=' + Y) + '.' };
              if (Math.abs(v - (Y + b) / m) < 1e-9) return { code: 'solve-inverse', hint: 'To undo ' + t(term(b, '', false)) + ', ' + (b < 0 ? 'add ' + t(-b) : 'subtract ' + t(b)) + ' on both sides.' };
              return null; })], { labels: ['Output', 'Input'] }),
            solution: 'Input ' + t(X) + ': ' + t('y=' + m + '(' + X + ')' + term(b, '', false) + '=' + (m * X + b)) + '. Output ' + t(Y) + ': ' + t(lin(m, b) + '=' + Y) + ' → ' + t(m + 'x=' + (Y - b)) + ' → ' + t('x=' + xi) + '.', hints: ['Substitute for the first one; solve an equation for the second.'] };
        } }] },
    { num: '4', stem: function (sh) { return 'The graph below shows every ordered pair in a relation.' + HW.graph({ x: [-6, 6], y: [-6, 6], points: sh.ps.map(function (p) { return { x: p[0], y: p[1] }; }), max: 300 }); },
      shared: function (r) {
        for (var g = 0; g < 400; g++) {
          var m = r.pick([-1, -1, 1, -2, 2]), b = r.int(-2, 2), step = Math.abs(m) === 1 ? 2 : 1, x0 = r.pick([-4, -3, -2]);
          var ps = [0, 1, 2, 3, 4].map(function (i) { var x = x0 + i * step; return [x, m * x + b]; });
          if (ps.every(function (p) { return p[0] <= 5 && Math.abs(p[1]) <= 5; }) && b !== 0 && !ps.every(function (p) { return ps.some(function (q) { return q[0] === p[1] && q[1] === p[0]; }); })) return { m: m, b: b, step: step, ps: ps };
        }
        return { m: -1, b: 1, step: 2, ps: [[-3, 4], [-1, 2], [1, 0], [3, -2], [5, -4]] };
      },
      parts: [
        { id: 'e4a', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return pairsPart('Read the five ordered pairs off the graph.', sh.ps, 'Read across for ' + t('x') + ', then up or down for ' + t('y') + ': ' + t(ptsTex(sh.ps)) + '.', 'pairs from graph'); } },
        { id: 'e4d', sub: 'd', level: 'PRG', make: function (r, sh) {
          var m = sh.m, b = sh.b, s = sh.step, d = m * s;
          var w = [{ is: PL.parse(lin(-m, b)), code: 'sign', hint: 'As ' + t('x') + ' increases, does ' + t('y') + ' go up or down? That decides the sign of the ' + t('x') + ' term.' }];
          if (s > 1) w.push({ is: PL.parse(lin(d, b)), code: 'diff-unit', hint: 'The inputs go up by ' + t(s) + ', so ' + t(num(d)) + ' is the change in ' + t('y') + ' for ' + t(s) + ' steps of ' + t('x') + '. Per ' + t('1') + ' in ' + t('x') + ', it is ' + t(num(d) + '\\div ' + s + '=' + m) + '.' });
          var p = K.P.poly('Write an equation for the relation.', PL.parse(lin(m, b)), { before: t('y='), wrong: w },
            'As ' + t('x') + ' goes up by ' + t(s) + ', ' + t('y') + ' changes by ' + t(num(d)) + ', so by ' + t(m) + ' for each ' + t('1') + '. Following the pattern back to ' + t('x=0') + ' gives ' + t('y=' + b) + '. So ' + t('y=' + lin(m, b)) + '. Check ' + t(pt(sh.ps[0])) + ': ' + t(lin(m, b).replace('x', '(' + sh.ps[0][0] + ')') + '=' + sh.ps[0][1]) + ' ✓',
            ['How much does ' + t('y') + ' change for each increase of ' + t('1') + ' in ' + t('x') + '?', 'Continue the pattern to ' + t('x=0') + ' to find the constant.'], 'equation from graph points');
          p.good = [num(b) + term(m, 'x', false)]; return p;
        } },
        { id: 'e4e', sub: 'e', level: 'EMG', make: function (r, sh) {
          return mc(r, 'The points were left unjoined. What does that tell you about the relation?', [
            { html: 'It is <b>discrete</b>: only these five ordered pairs belong to it. Joining them would claim that inputs like ' + t('x=0.5') + ' also have outputs.', right: true },
            { html: 'It is <b>continuous</b>; the person drawing it just forgot to join the points.', why: 'The question says the graph shows <b>every</b> ordered pair — there are no others to join.' },
            { html: 'It is not a relation, because a relation must be a line.', why: 'Any set of ordered pairs is a relation — five separate points included.' },
            { html: 'It is nonlinear, because the points are not joined by a line.', why: 'Linear is about the pattern (equal changes), not whether the points are joined. These points do line up.' }],
            'The graph shows every ordered pair, so the relation is <b>discrete</b>: just the five points. Joining them would add points (like ' + t('x=0.5') + ') that were never given.', ['Are there any ordered pairs in the relation besides the five shown?'], 'discrete graph meaning');
        } }] },
    { num: '5', section: 'Extra practice B — Mapping diagrams, both directions', stem: function (sh) { return 'Use the mapping diagram.' + HW.arrowDiagram(sh.ins, sh.outs, sh.pairs, { leftTitle: 'X', rightTitle: 'Y' }); },
      shared: function (r) {
        var ins, outs, g = 0;
        do { ins = sorted([r.int(-5, -1)].concat(r.sample([0, 1, 2, 3, 4, 5, 6, 7, 8, 9], 3))); outs = sorted(r.sample([1, 5, 6, 10, 11, 12, 13, 14, 15], 3)); g++; } while (g < 100 && outs.some(function (y) { return ins.indexOf(y) >= 0; }));
        var pat = r.pick([[0, 1, 2, 2], [0, 1, 2, 2], [0, 0, 1, 2], [0, 1, 1, 2], [2, 0, 1, 2]]);
        return { ins: ins, outs: outs, pat: pat, pairs: arrowsFrom(ins, outs, pat) };
      },
      parts: [
        { id: 'e5b', sub: 'b', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return pairsPart('Write the relation as a set of ordered pairs.', sh.pairs, 'Read each arrow, input first: ' + t(ptsTex(sh.pairs)) + '.', 'pairs from mapping'); } },
        { id: 'e5c', sub: 'c', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var shared = sh.outs[[0, 1, 2].filter(function (j) { return sh.pat.filter(function (x) { return x === j; }).length === 2; })[0]], from = sh.pairs.filter(function (p) { return p[1] === shared; });
          return mc(r, 'One element of ' + t('Y') + ' has two arrows pointing at it. Which one, and what does that look like in the list of ordered pairs?', [
            { html: t(shared) + ' — it is the second coordinate of two pairs, ' + t(pt(from[0])) + ' and ' + t(pt(from[1])) + '.', right: true },
            { html: t(shared) + ' — it is the first coordinate of two pairs.', why: 'Outputs are <b>second</b> coordinates. Write the two pairs with arrows into ' + t(shared) + '.' },
            { html: t(from[0][0]) + ' — it has two arrows leaving it.', why: t(from[0][0]) + ' is in ' + t('X') + ' and has one arrow leaving it. Look in ' + t('Y') + ' for the value that two arrows point to.' },
            { html: t(shared) + ' — so there are only three ordered pairs.', why: 'Every arrow is one ordered pair: four arrows, four pairs. ' + t(shared) + ' is just written once in the oval.' }],
            'Arrows from ' + t(from[0][0]) + ' and ' + t(from[1][0]) + ' both point to ' + t(shared) + '. In the list, ' + t(shared) + ' is the second coordinate of ' + t(pt(from[0])) + ' and ' + t(pt(from[1])) + '. Two inputs can share an output.', ['Each arrow is one ordered pair (start, end).'], 'shared output in mapping');
        } }] },
    { num: '6', stem: function (sh) { return 'A relation is given by the ordered pairs ' + t(ptsTex(sh.ps)) + '.'; },
      shared: function (r) {
        var k = r.pick([3, 4, 4, 5]), a = r.pick([1, 2, 3, 3]), xs = [0, 1, 2, 3].map(function (i) { return a + 2 * i; }), ij = r.pick([[0, 2], [0, 2], [1, 3], [0, 3]]);
        var ys = xs.map(function (x) { return k * x; }); ys[ij[1]] = ys[ij[0]];
        return { xs: xs, ys: ys, ij: ij, ps: xs.map(function (x, i) { return [x, ys[i]]; }), outs: uniq(ys) };
      },
      parts: [
        { id: 'e6a', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var xs = sh.xs, outs = sh.outs, ps = sh.ps, i0 = sh.ij[1], wrongOut = outs.filter(function (y) { return y !== sh.ys[i0]; })[0];
          var twice = sh.ys.map(function (y, i) { return i === i0 ? y + ' ' : String(y); });
          var opts = [
            { html: HW.arrowDiagram(xs, outs, ps), right: true },
            { html: HW.arrowDiagram(xs, twice, xs.map(function (x, i) { return [x, twice[i]]; })), why: 'Each output is written <b>once only</b>: both arrows should point to the same ' + t(sh.ys[i0]) + '.' },
            { html: HW.arrowDiagram(outs, xs, ps.map(function (p) { return [p[1], p[0]]; })), why: 'The arrows go <b>from</b> the inputs (first coordinates) <b>to</b> the outputs. This diagram is backwards.' },
            { html: HW.arrowDiagram(xs, outs, ps.map(function (p, i) { return i === i0 ? [p[0], wrongOut] : p; })), why: 'Check the pair ' + t(pt(ps[i0])) + ': ' + t(xs[i0]) + ' must point to ' + t(sh.ys[i0]) + '.' }];
          var p = mc(r, 'Which mapping diagram shows this relation? (Each output should be written once only, in increasing order.)', opts,
            'Inputs ' + t(seqTex(xs)) + ' on the left; outputs ' + t(seqTex(outs)) + ' on the right, each written once. One arrow per pair: ' + ps.map(function (q) { return t(q[0] + '\\to ' + q[1]); }).join(', ') + '.', ['Draw one arrow for each ordered pair, from the first coordinate to the second.'], 'mapping from pairs');
          p.input.columns = 2; return p;
        } },
        { id: 'e6b', level: 'BEG', outcome: 'RF2', make: function (r, sh) {
          var fields = [{ label: 'Number of arrows:', name: 'Arrows' }, { label: 'Numbers in the right oval:', name: 'Right oval' }], n = sh.ps.length, o = sh.outs.length;
          return { prompt: 'In the correct mapping diagram, how many arrows are there, and how many numbers are written in the right oval?', input: { type: 'fields', fields: fields }, key: [String(n), String(o)], text: 'count arrows and outputs',
            answer: t(n) + ' arrows, ' + t(o) + ' numbers', bad: [[String(n), String(n)]],
            check: K.fields([K.number(n), K.number(o, function (v) { return v === n ? { code: 'dup', hint: 'One output belongs to two pairs. It gets two arrows, but it is written in the oval only <b>once</b>.' } : null; })], { labels: ['Arrows', 'Right oval'] }),
            solution: '<b>' + n + ' arrows</b> (one per ordered pair) but only <b>' + o + ' numbers</b> on the right (' + t(seqTex(sh.outs)) + '): the output ' + t(sh.ys[sh.ij[0]]) + ' belongs to two pairs, so it receives two arrows but is written once.', hints: ['One arrow per ordered pair. Each output value is written once.'] };
        } }] },
    { num: '7', stem: function (sh) { return 'Not every relation gives one output per input. Use the mapping diagram.' + HW.arrowDiagram(sh.ins, sh.outs, sh.pairs, { leftTitle: 'X', rightTitle: 'Y' }); },
      shared: function (r) {
        var ins, outs, g = 0;
        do { ins = sorted(r.sample([1, 2, 3, 4, 5, 6], 3)); outs = sorted(r.sample([4, 6, 7, 8, 9, 10, 12], 3)); g++; } while (g < 100 && outs.some(function (y) { return ins.indexOf(y) >= 0; }));
        var pat = r.pick([[[0, 0], [1, 1], [1, 2], [2, 2]], [[0, 0], [1, 1], [1, 2], [2, 2]], [[0, 0], [0, 1], [1, 1], [2, 2]], [[0, 1], [1, 0], [1, 2], [2, 2]]]);
        var pairs = pat.map(function (q) { return [ins[q[0]], outs[q[1]]]; }), two = ins.filter(function (x) { return pairs.filter(function (p) { return p[0] === x; }).length === 2; })[0];
        return { ins: ins, outs: outs, pairs: pairs, two: two };
      },
      parts: [
        { id: 'e7a', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return pairsPart('Write the relation as a set of ordered pairs.', sh.pairs, 'One pair per arrow: ' + t(ptsTex(sh.pairs)) + '. (' + t(sh.two) + ' has two arrows, so it is the first coordinate of two pairs.)', 'pairs from mapping (one-to-many)'); } },
        { id: 'e7b', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var two = sh.two, ys = sh.pairs.filter(function (p) { return p[0] === two; }).map(function (p) { return p[1]; }), sharedOut = sh.outs.filter(function (y) { return sh.pairs.filter(function (p) { return p[1] === y; }).length === 2; })[0];
          var o = [
            { html: t(two) + ' has two outputs (' + t(ys[0]) + ' and ' + t(ys[1]) + '). It is still a relation: a relation is any set of ordered pairs, and nothing requires one output per input.', right: true },
            { html: t(two) + ' has two outputs, so this is not a relation.', why: 'A relation is <b>any</b> set of ordered pairs. Having two outputs for one input is allowed (it just isn’t a <i>function</i>, which you will meet in Lesson 7).' },
            { html: t(two) + ' has two outputs, so you may write only one of the pairs ' + t(pt([two, ys[0]])) + ' or ' + t(pt([two, ys[1]])) + '.', why: 'Both pairs are in the relation, so both are written.' }];
          o.push(sharedOut != null ? { html: t(sharedOut) + ' has two arrows, so it is the input with two outputs.', why: t(sharedOut) + ' is in ' + t('Y') + ' — it is an output that two arrows point to. Look for a value in ' + t('X') + ' with two arrows <b>leaving</b> it.' }
            : { html: 'No input has two outputs; every arrow goes to a different number.', why: 'Count the arrows leaving each number in ' + t('X') + '.' });
          return mc(r, 'Which input has more than one output, and is this still a relation?', o, 'The input ' + t(two) + ' has two arrows, to ' + t(ys[0]) + ' and ' + t(ys[1]) + '. A relation is any set of ordered pairs comparing two sets, so it is still a relation — the input ' + t(two) + ' simply has no single output.', ['Look for a number in ' + t('X') + ' with two arrows leaving it.'], 'one input two outputs');
        } },
        { id: 'e7c', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var rev = sh.pairs.map(function (p) { return [p[1], p[0]]; }), orig = K.pairs(sh.pairs);
          return pairsPart('Reverse every arrow, so each old output becomes an input. Write the ordered pairs of the new relation.', rev, 'Swap the coordinates of every pair: ' + t(ptsTex(rev)) + '.', 'reversed relation', function (resp) {
            if (orig(resp).v === 'correct') return wrong('not-reversed', 'Those are the original pairs. Reversing every arrow swaps the coordinates: ' + t(pt(sh.pairs[0])) + ' becomes ' + t(pt(rev[0])) + '.');
            return null;
          });
        } }] },
    { num: '8', section: 'Extra practice C — Tables with no constant difference', stem: function (sh) { return 'A square patio has side length ' + t('s') + ' metres and area ' + t('A') + ' square metres.' + htable('s', 'A', sh.ss, sh.as); },
      shared: function (r) { var k = r.pick([1, 1, 2, 3]), ss = [0, 1, 2, 3, 4, 5].map(function (i) { return k + i; }); return { k: k, ss: ss, as: ss.map(function (s) { return s * s; }) }; },
      parts: [
        { id: 'e8a', level: 'BEG', make: function (r, sh) {
          var as = sh.as, ds = as.slice(1).map(function (a, i) { return a - as[i]; });
          var fields = ds.map(function (d, i) { return { label: t(as[i] + '\\to ' + as[i + 1]), name: 'Difference ' + (i + 1) }; });
          return { prompt: 'Find the <b>first differences</b>: each area minus the previous area.', input: { type: 'fields', fields: fields }, key: ds.map(String), answer: t(seqTex(ds)), text: 'first differences of squares',
            check: K.fields(ds.map(function (d) { return K.number(d, function (v) { return v === -d ? { code: 'diff-rev', hint: 'Subtract in the order <b>next − previous</b>.' } : null; }); }), { labels: fields.map(function (f) { return f.name; }) }),
            solution: ds.map(function (d, i) { return t(as[i + 1] + '-' + as[i] + '=' + d); }).join(', ') + '.', hints: ['Subtract each area from the next one.'] };
        } },
        { id: 'e8b', level: 'EMG', make: function (r, sh) {
          var ds = sh.as.slice(1).map(function (a, i) { return a - sh.as[i]; });
          return mc(r, 'In a linear relation the first differences are all equal. What do your first differences show?', [
            { html: 'They are not all equal (they grow by ' + t('2') + '), so the relation is <b>not linear</b>.', right: true },
            { html: 'The relation is linear, because the areas increase every time.', why: 'Increasing isn’t enough — a linear relation increases by the <b>same amount</b> each step. Yours go up by ' + t(seqTex(ds)) + '.' },
            { html: 'The relation is linear, because the side lengths go up in equal steps.', why: 'That’s the inputs. Linear depends on whether the <b>outputs</b> change by equal amounts.' },
            { html: 'The relation is not linear, because the first differences are odd numbers.', why: 'Odd or even doesn’t matter (a line can go up by 3 every time). What matters is whether they are all <b>equal</b>.' }],
            'First differences ' + t(seqTex(ds)) + ' are not all equal, so the relation is <b>not linear</b> — its graph is a curve.', ['Are the first differences all the same?'], 'squares not linear');
        } },
        { id: 'e8d', sub: 'd', level: 'EMG', make: function (r, sh) {
          var a = r.pick(sh.ss.filter(function (s) { return sh.ss.indexOf(2 * s) >= 0; })), A1 = a * a, A2 = 4 * a * a;
          return K.P.number('The side length doubles from ' + t(a) + ' m to ' + t(2 * a) + ' m. Use the table: the area is multiplied by what number?', 4, function (v) {
            if (v === 2) return { code: 'sq-double', hint: 'Check the table: ' + t('A=' + A1) + ' when ' + t('s=' + a) + ' and ' + t('A=' + A2) + ' when ' + t('s=' + 2 * a) + '. Divide.' };
            if (v === A2 - A1) return { code: 'diag', hint: 'That’s how much the area <b>increased</b>. The question asks what it was <b>multiplied</b> by: divide.' };
            return null; }, 'From the table, ' + t('s=' + a) + ' gives ' + t('A=' + A1) + ' and ' + t('s=' + 2 * a) + ' gives ' + t('A=' + A2) + '. ' + t(A2 + '\\div ' + A1 + '=4') + ': doubling the side multiplies the area by <b>4</b>, not by 2.', ['Divide the new area by the old area.'], 'double side area factor');
        } },
        { id: 'e8e', sub: 'e', level: 'BEG', make: function (r) {
          var n = r.int(11, 15);
          return K.P.number('Determine the area of a patio with side length ' + t(n) + ' m.', n * n, function (v) {
            if (v === 2 * n) return { code: 'two-x', hint: t('A=s^{2}') + ' means ' + t('s\\times s') + ', not ' + t('2s') + '.' };
            if (v === 4 * n) return { code: 'diag', hint: 'That’s the perimeter. The area is ' + t('s\\times s') + '.' };
            return null; }, t('A=' + n + '^{2}=' + n * n) + ' m².', ['Use ' + t('A=s^{2}') + '.'], 'area of square side ' + n, { after: 'm²' });
        } },
        { id: 'e8f', sub: 'f', level: 'EMG', make: function (r) {
          var n = r.pick([14, 16, 17, 18, 19, 21]), A = n * n;
          return K.P.number('A patio has area ' + t(A) + ' m². Determine its side length.', n, function (v) {
            if (v === A / 2) return { code: 'sq-halved', hint: 'Undoing a square means taking the <b>square root</b>, not dividing by 2.' };
            if (v === A / 4) return { code: 'diag', hint: 'Dividing by 4 undoes a perimeter. For an area, take the square root.' };
            return null; }, t('s^{2}=' + A) + ', so ' + t('s=\\sqrt{' + A + '}=' + n) + ' m (a length is positive).', ['Which number times itself gives ' + t(A) + '?'], 'side from area ' + A, { after: 'm' });
        } }] },
    { num: '9', stem: function (sh) { return 'A relation is given by the table below.' + htable('x', 'y', [0, 1, 2, 3, 4], [0, 1, 2, 3, 4].map(function (x) { return x * x + sh.c; })); },
      shared: function (r) { return { c: r.int(1, 9), X: r.int(6, 9) }; },
      parts: [
        { id: 'e9a', level: 'EMG', make: function (r, sh) { var p = diffsPart('Write out the first differences, then say whether the relation is linear.', [0, 1, 2, 3, 4], [0, 1, 2, 3, 4].map(function (x) { return x * x + sh.c; }), 'differences x^2+c'); p.prompt = 'Write out the first differences, then say whether the relation is linear.'; return p; } },
        { id: 'e9b', level: 'EMG', make: function (r, sh) {
          var c = sh.c;
          var p = K.P.poly('Each output is a fixed number more than the square of the input. Write the equation.', PL.parse('x^2+' + c), { before: t('y='),
            wrong: [{ is: PL.parse('2x+' + c), code: 'two-x', hint: 'The square of the input is ' + t('x^{2}') + ', not ' + t('2x') + '.' }, { is: PL.parse('x^2'), code: 'no-const', hint: 'At ' + t('x=0') + ' the output is ' + t(c) + ', so add ' + t(c) + '.' }, { is: PL.parse('x^2+' + (c + 1)), code: 'diag', hint: 'Check ' + t('x=0') + ': the table gives ' + t(c) + '.' }] },
            'At ' + t('x=0') + ', ' + t('y=' + c) + ', so the fixed number is ' + t(c) + ': ' + t('y=x^{2}+' + c) + '. Check ' + t('x=3') + ': ' + t('3^{2}+' + c + '=' + (9 + c)) + ' ✓', ['What is the output when the input is ' + t('0') + '?'], 'equation x^2+c');
          p.good = [c + '+x^2']; return p;
        } },
        { id: 'e9c', level: 'BEG', make: function (r, sh) {
          var c = sh.c, X = sh.X;
          return K.P.number('Determine ' + t('y') + ' when ' + t('x=' + X) + '.', X * X + c, function (v) {
            if (v === 2 * X + c) return { code: 'two-x', hint: t('x^{2}') + ' means ' + t('x\\times x') + ', not ' + t('2x') + '.' };
            if (v === X * X) return { code: 'no-const', hint: 'Don’t forget to add ' + t(c) + '.' };
            return null; }, t('y=' + X + '^{2}+' + c + '=' + X * X + '+' + c + '=' + (X * X + c)) + '.', ['Use ' + t('y=x^{2}+' + c) + '.'], 'evaluate x^2+c at ' + X);
        } },
        { id: 'e9e', sub: 'e', level: 'PRG', make: function (r, sh) {
          var c = sh.c, k = r.pick([5, 6, 7, 8, 9].filter(function (x) { return x !== sh.X; })), Y = k * k + c;
          var p = K.P.valueSet('Determine <b>every</b> input that produces an output of ' + t(Y) + '. (There are two.)', [k, -k], { diag: function (A) {
            if (A.length === 1 && A[0] === k) return { code: 'only-positive', hint: t('x=' + k) + ' works. A number and its opposite have the same square — try ' + t('x=-' + k) + '.' };
            if (A.some(function (x) { return Math.abs(x - (Y - c) / 2) < 1e-9; })) return { code: 'sq-halved', hint: 'From ' + t('x^{2}=' + (Y - c)) + ', take the <b>square root</b>, don’t divide by 2.' };
            if (A.some(function (x) { return x === Y - c; })) return { code: 'diag', hint: t('x^{2}=' + (Y - c)) + ' — now take the square root.' };
            return null; } },
            t('x^{2}+' + c + '=' + Y) + ' → ' + t('x^{2}=' + (Y - c)) + ' → ' + t('x=' + k) + ' or ' + t('x=-' + k) + '. Check: ' + t('(-' + k + ')^{2}+' + c + '=' + Y) + ' ✓', ['Subtract ' + t(c) + ', then think: which numbers squared give ' + t(Y - c) + '?'], 'inputs giving ' + Y);
          p.good = ['\\pm ' + k, '-' + k + ', ' + k]; p.bad = ['x=' + k]; return p;
        } },
        { id: 'e9f', sub: 'f', level: 'EMG', make: function (r) {
          return mc(r, 'Why can a squaring rule like this one give the same output for two different inputs, while a rule like ' + t('y=3x+2') + ' never does?', [
            { html: 'A number and its opposite have the same square, so ' + t('x') + ' and ' + t('-x') + ' share an output. For ' + t('y=3x+2') + ', different inputs always give different outputs.', right: true },
            { html: 'Squaring rules always give larger outputs than linear rules.', why: 'Size has nothing to do with it. Think about ' + t('6^{2}') + ' and ' + t('(-6)^{2}') + '.' },
            { html: 'Because ' + t('y=3x+2') + ' has a constant term and the squaring rule doesn’t.', why: 'Both rules here have a constant. The reason is that opposite numbers have the same square.' },
            { html: 'It is a coincidence that happens only for this particular output.', why: 'Try another output: every positive ' + t('x^{2}') + ' value comes from two inputs, ' + t('x') + ' and ' + t('-x') + '.' }],
            'Opposite numbers have the same square (' + t('6^{2}=(-6)^{2}=36') + '), so a squaring rule gives the same output for ' + t('x') + ' and ' + t('-x') + '. In ' + t('y=3x+2') + ' each increase in ' + t('x') + ' raises ' + t('y') + ' by the same amount, so two different inputs can never give the same output.', ['Compare ' + t('6^{2}') + ' and ' + t('(-6)^{2}') + '.'], 'why squaring repeats outputs');
        } }] },
    { num: '10', stem: function (sh) { return 'Two relations are given below. Exactly one of them is linear.<br><b>Relation ' + sh.nP + '</b>' + htable('x', 'y', [1, 2, 3, 4], sh.yP) + '<b>Relation ' + sh.nQ + '</b>' + htable('x', 'y', [1, 2, 3, 4], sh.yQ); },
      shared: function (r) {
        var m = r.int(3, 6), b = r.int(1, 4), a = r.int(2, 4), linFirst = r.chance(0.5), yl = [1, 2, 3, 4].map(function (x) { return m * x + b; }), yq = [1, 2, 3, 4].map(function (x) { return a * x * x; });
        return { m: m, b: b, a: a, nP: 'P', nQ: 'Q', yP: linFirst ? yl : yq, yQ: linFirst ? yq : yl, L: linFirst ? 'P' : 'Q', S: linFirst ? 'Q' : 'P', yl: yl, yq: yq };
      },
      parts: [
        { id: 'e10a', level: 'EMG', make: function (r, sh) {
          var dl = sh.yl.slice(1).map(function (y, i) { return y - sh.yl[i]; }), dq = sh.yq.slice(1).map(function (y, i) { return y - sh.yq[i]; });
          var oL = { html: 'Relation ' + sh.L, right: true }, oS = { html: 'Relation ' + sh.S, why: 'Find its first differences: ' + t(seqTex(dq)) + '. Are they all equal?' };
          return mc(r, 'Which relation is linear?', [ // kept in the order P, Q, Both, Neither; which of P/Q is linear varies
            sh.L === 'P' ? oL : oS, sh.L === 'P' ? oS : oL,
            { html: 'Both', why: 'The question says exactly one is linear. Compare the first differences of each.' }, { html: 'Neither', why: 'The question says exactly one is linear. Compare the first differences of each.' }],
            'Relation ' + sh.L + ': differences ' + t(seqTex(dl)) + ' (constant). Relation ' + sh.S + ': differences ' + t(seqTex(dq)) + ' (not constant). <b>Relation ' + sh.L + ' is linear.</b>', ['Find the first differences of each table.'], 'which table is linear', true);
        } },
        { id: 'e10b', sub: 'b i', level: 'PRG', make: function (r, sh) {
          var m = sh.m, b = sh.b;
          var p = K.P.poly('Write an equation for the linear relation (Relation ' + sh.L + ').', PL.parse(lin(m, b)), { before: t('y='),
            wrong: [{ is: PL.parse(lin(m, m + b)), code: 'diag', hint: 'At ' + t('x=1') + ' the output is ' + t(m + b) + ', but the constant is the output at ' + t('x=0') + ': go one step back, ' + t((m + b) + '-' + m + '=' + b) + '.' }, { is: PL.parse(lin(b, m)), code: 'eq-rate-const', hint: 'The change per step, ' + t(m) + ', multiplies ' + t('x') + '.' }] },
            'Up ' + t(m) + ' per step; going back one step to ' + t('x=0') + ' gives ' + t((m + b) + '-' + m + '=' + b) + '. So ' + t('y=' + lin(m, b)) + '.', ['How much does ' + t('y') + ' go up per step? What would ' + t('y') + ' be at ' + t('x=0') + '?'], 'linear equation from table');
          p.good = [b + '+' + m + 'x']; return p;
        } },
        { id: 'e10c', sub: 'b ii', level: 'PRG', make: function (r, sh) {
          var a = sh.a;
          var p = K.P.poly('Write an equation for the other relation (Relation ' + sh.S + '). It involves a square.', PL.parse(a + 'x^2'), { before: t('y='),
            wrong: [{ is: PL.parse('x^2'), code: 'diag', hint: 'Compare each output with ' + t('x^{2}') + ': ' + t('2^{2}=4') + ', but the table gives ' + t(4 * a) + '.' }, { is: PL.parse(a * a + 'x^2'), code: 'diag', hint: 'Check ' + t('x=1') + ': your rule gives ' + t(a * a) + ', but the table gives ' + t(a) + '.' }] },
            'Compare the outputs with ' + t('x^{2}') + ': ' + [1, 2, 3, 4].map(function (x) { return t(a * x * x + '=' + a + '(' + x + ')^{2}'); }).join(', ') + '. So ' + t('y=' + a + 'x^{2}') + '.', ['Divide each output by the square of its input. What do you notice?'], 'ax^2 from table');
          return p;
        } },
        { id: 'e10d', sub: 'c', level: 'EMG', make: function (r, sh) {
          var m = sh.m, b = sh.b, a = sh.a, fields = [{ label: 'Relation ' + sh.L + ':', name: 'Relation ' + sh.L, before: t('y=') }, { label: 'Relation ' + sh.S + ':', name: 'Relation ' + sh.S, before: t('y=') }];
          return { prompt: 'Determine the output of each relation when the input is ' + t('10') + '.', input: { type: 'fields', fields: fields }, key: [String(10 * m + b), String(100 * a)], text: 'outputs at 10',
            answer: 'Relation ' + sh.L + ': ' + t(10 * m + b) + '; Relation ' + sh.S + ': ' + t(100 * a), bad: [[String(10 * m + b), String(100 * a * a)]],
            check: K.fields([K.number(10 * m + b), K.number(100 * a, function (v) {
              if (v === 100 * a * a) return { code: 'diag', hint: 'Only ' + t('x') + ' is squared: ' + t(a + '(10)^{2}=' + a + '\\times 100') + '.' };
              if (v === 20 * a) return { code: 'two-x', hint: t('x^{2}') + ' means ' + t('x\\times x') + ': ' + t('10^{2}=100') + '.' };
              return null; })], { labels: ['Relation ' + sh.L, 'Relation ' + sh.S] }),
            solution: 'Relation ' + sh.L + ': ' + t('y=' + m + '(10)+' + b + '=' + (10 * m + b)) + '. Relation ' + sh.S + ': ' + t('y=' + a + '(10)^{2}=' + a + '(100)=' + 100 * a) + '.', hints: ['Substitute ' + t('x=10') + ' into each equation.'] };
        } }] },
    { num: '11', section: 'Extra practice D — Which variable depends on which', stem: 'Name the independent and the dependent variable by completing “the ___ depends on the ___.”', parts: [
      { id: 'e11a', level: 'BEG', outcome: 'RF2', make: function (r) { return dependsMC(r, r.pick(DEP11A), 'depends on (easy)'); } },
      { id: 'e11b', level: 'EMG', outcome: 'RF2', make: function (r) { return dependsMC(r, r.pick(DEP11B), 'depends on (careful)'); } }] },
    { num: '12', stem: 'Naming the independent variable is a decision about the <i>situation</i>, not about the letters.', parts: [
      { id: 'e12', level: 'PRG', outcome: 'RF2', make: function (r) {
        var clear = [['tickets sold at a school play', 'the total money collected', 'The money collected is determined by the tickets sold.'], ['a child’s age in months', 'the child’s mass', 'The mass changes as the child ages; age doesn’t depend on mass.'],
          ['the distance a taxi drives', 'the fare charged', 'The fare is calculated from the distance.'], ['the number of hours a pool is open', 'the cost of heating it', 'The heating cost depends on how long the pool is open.']];
        var amb = r.pick([['the number of lifeguards on duty', 'the number of swimmers in the pool', 'The pool may schedule lifeguards in response to how many swimmers come (lifeguards depend on swimmers) — or rules may cap swimmers per lifeguard (swimmers depend on lifeguards).'],
          ['the number of buses a city runs on a route', 'the number of riders on that route', 'The city may add buses because ridership grows (buses depend on riders) — or more frequent buses may attract more riders (riders depend on buses).']]);
        var picks = r.sample(clear.slice(0, 4), 3);
        return mc(r, 'For which pair could you reasonably argue that <b>either</b> quantity is the independent variable?', [{ html: amb[0] + ', and ' + amb[1], right: true }].concat(picks.map(function (c) { return { html: c[0] + ', and ' + c[1], why: 'This one goes only one way: ' + c[2] }; })),
          '<b>' + amb[0][0].toUpperCase() + amb[0].slice(1) + ', and ' + amb[1] + '.</b> ' + amb[2] + ' In the other pairs, one quantity clearly decides the other.', ['For each pair, ask whether a sensible story works in <b>both</b> directions.'], 'either-way independent');
      } }] },
    { num: '13', section: 'Extra practice E — Find the mistake', stem: function (sh) { return '<i>(Error analysis)</i> A summer job pays ' + t('\\$' + sh.R) + ' per hour. A student relates the hours worked, ' + t('h') + ', to the money earned, ' + t('m') + '. Their table is correct:' + htable('h', 'm', [1, 2, 3, 4], [1, 2, 3, 4].map(function (h) { return sh.R * h; })) + 'But they write the ordered pairs as ' + t(ptsTex([1, 2, 3, 4].map(function (h) { return [sh.R * h, h]; }))) + ' and draw this graph:' + cgraph({ X: 4.5 * sh.R, Y: 5, gx: sh.R / 2, gy: 1, lx: sh.R, ly: 1, xn: 'h', yn: 'm', w: 230, h: 120, points: [1, 2, 3, 4].map(function (h) { return { x: sh.R * h, y: h }; }) }); },
      shared: function (r) { return { R: r.pick([12, 16, 18, 20, 20, 24]) }; },
      parts: [
        { id: 'e13a', level: 'BEG', outcome: 'RF2', make: function (r, sh) { var ps = [1, 2, 3, 4].map(function (h) { return [h, sh.R * h]; }); return pairsPart('Write the four ordered pairs correctly.', ps, 'Money depends on hours, so each pair is ' + t('(h,m)') + ', with the independent variable first: ' + t(ptsTex(ps)) + '.', 'fix reversed pairs'); } },
        { id: 'e13b', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          var R = sh.R;
          return mc(r, 'Read the student’s graph literally, using its axis labels. What does the point closest to the ' + t('m') + '-axis claim about the job?', [
            { html: 'Working ' + t(R) + ' hours earns ' + t('\\$1') + '.', right: true },
            { html: 'Working ' + t(1) + ' hour earns ' + t('\\$' + R) + '.', why: 'That’s the real job — but read the graph literally: the point is at ' + t('h=' + R) + ' (across) and ' + t('m=1') + ' (up).' },
            { html: 'Working ' + t(R) + ' hours earns ' + t('\\$' + R) + '.', why: 'Read the vertical axis again: the point is at ' + t('m=1') + '.' },
            { html: 'Working ' + t(1) + ' hour earns ' + t('\\$1') + '.', why: 'Read the horizontal axis again: the point is at ' + t('h=' + R) + '.' }],
            'The point nearest the ' + t('m') + '-axis is at ' + t('h=' + R) + ', ' + t('m=1') + '. Read literally it claims that <b>working ' + R + ' hours earns $1</b> — the reverse of the real job. The pairs must be ' + t('(h,m)') + ' before plotting.', ['Read across for ' + t('h') + ' and up for ' + t('m') + '.'], 'read reversed graph');
        } }] },
    { num: '14', stem: function (sh) { return '<i>(Error analysis)</i> A banquet hall seats ' + t(sh.S) + ' people at every table. The mapping diagram relates the number of tables, ' + t('t') + ', to the number of chairs, ' + t('c') + '. A student says: “the number of tables depends on the number of chairs, so the ordered pairs are ' + t(ptsTex([1, 2, 3, 4].map(function (k) { return [sh.S * k, k]; }))) + '.”' + HW.arrowDiagram([1, 2, 3, 4], [1, 2, 3, 4].map(function (k) { return sh.S * k; }), [1, 2, 3, 4].map(function (k) { return [k, sh.S * k]; }), { leftTitle: 't', rightTitle: 'c' }); },
      shared: function (r) { return { S: r.pick([4, 4, 6, 8, 10]) }; },
      parts: [
        { id: 'e14a', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
          return mc(r, 'Which rule about mapping diagrams did the student ignore?', [
            { html: 'Arrows point <b>from</b> the independent variable <b>to</b> the dependent variable — here from ' + t('t') + ' to ' + t('c') + ', so ' + t('t') + ' is written first in each pair.', right: true },
            { html: 'The larger number always goes first in an ordered pair.', why: 'Size has nothing to do with it: the input (independent variable) goes first.' },
            { html: 'Arrows point from the dependent variable to the independent variable.', why: 'It’s the other way round: arrows start at the inputs.' },
            { html: 'A mapping diagram can be read in either direction.', why: 'The arrows give the direction — from input to output.' }],
            'The arrows run from the ' + t('t') + ' oval to the ' + t('c') + ' oval, so ' + t('t') + ' (tables) is the input and comes first. The chairs depend on the tables, not the reverse.', ['Which way do the arrows point?'], 'mapping arrow rule');
        } },
        { id: 'e14b', level: 'EMG', make: function (r, sh) {
          var S = sh.S;
          var p = K.P.poly('Write an equation for ' + t('c') + ' in terms of ' + t('t') + '.', PL.parse(S + 't'), { before: t('c='),
            wrong: [{ is: PL.parse('\\frac{1}{' + S + '}t'), code: 'var-swap', hint: 'That gives tables from chairs. Each table seats ' + t(S) + ', so the chairs are ' + t(S) + ' times the tables.' }, { is: PL.parse('t+' + S), code: 'diag', hint: 'Check ' + t('t=2') + ': two tables need ' + t(2 * S) + ' chairs. Multiply.' }] },
            'Each table seats ' + t(S) + ': ' + t('c=' + S + 't') + '. (Check: ' + t('t=3') + ' gives ' + t(3 * S) + ' chairs ✓.) The correct pairs are ' + t(ptsTex([1, 2, 3, 4].map(function (k) { return [k, S * k]; }))) + '.', ['How many chairs do 3 tables need?'], 'chairs equation');
          return p;
        } }] },
    { num: '15', section: 'Extra practice F — A stretch, and two for the test', stem: function (sh) {
        var X = sh.T + 1, Y = Math.ceil(sh.D + 0.5);
        return 'The graph shows the depth of water, ' + t('D') + ' (cm), in a leaking bucket ' + t('t') + ' minutes after the leak started. <b>The grid lines are ' + t('0.5') + ' units apart.</b>' +
          cgraph({ X: X, Y: Y, gx: 0.5, gy: 0.5, lx: 1, ly: Y > 6 ? 2 : 1, xn: 't', yn: 'D', xt: 'Time (min)', yt: 'Depth (cm)', w: Math.max(X * 36, 220), h: Y * 24, max: 300,
            segs: [{ pts: [[0, sh.D], [sh.T, 0]], start: 'closed', end: 'closed' }], points: range(sh.T).map(function (x) { return { x: x, y: sh.D - sh.rate * x }; }) });
      },
      shared: function (r) { var o = r.pick([[1.5, 5], [1.5, 5], [1.5, 4], [1.5, 6], [2.5, 3]]), tf = r.pick([0.5, 1.5, 2.5, 3.5].filter(function (x) { return x < o[1]; })); return { rate: o[0], T: o[1], D: o[0] * o[1], tf: tf }; },
      parts: [
        { id: 'e15a', level: 'EMG', make: function (r, sh) {
          var fields = [{ label: 'Depth when the leak started:', name: 'Starting depth', after: 'cm' }, { label: 'The depth falls by', name: 'Rate', after: 'cm per minute' }];
          var rateChk = function (resp) { var p = HW.parse.number(resp); if (p.ok && Math.abs(p.value + sh.rate) < 1e-9) return form('rate-sign', 'Right size — the box already says “falls by”, so give it as a positive number.'); return K.number(sh.rate, function (v) { return Math.abs(v - (sh.D - sh.rate)) < 1e-9 ? { code: 'diag', hint: 'That’s the depth after one minute. How much did it <b>drop</b>?' } : null; })(resp); };
          return { prompt: 'Describe the relation: how deep was the water when the leak started, and how fast is the depth falling?', input: { type: 'fields', fields: fields }, key: [num(sh.D), num(sh.rate)], text: 'bucket start and rate',
            answer: 'Starts at ' + t(num(sh.D)) + ' cm and falls ' + t(num(sh.rate)) + ' cm per minute', bad: [[num(sh.D), num(sh.D - sh.rate)]],
            check: K.fields([K.number(sh.D), rateChk], { labels: ['Starting depth', 'Rate'] }),
            solution: 'At ' + t('t=0') + ' the graph is at ' + t('D=' + num(sh.D)) + '; at ' + t('t=1') + ' it is at ' + t(num(sh.D - sh.rate)) + ', a drop of ' + t(num(sh.rate)) + '. The bucket starts <b>' + num(sh.D) + ' cm</b> deep and the depth falls steadily by <b>' + num(sh.rate) + ' cm per minute</b> until it is empty at ' + t('t=' + sh.T) + '.',
            hints: ['Read the depth at ' + t('t=0') + ' and at ' + t('t=1') + '. Remember each grid line is ' + t('0.5') + '.'] };
        } },
        { id: 'e15d', sub: 'd', level: 'PRG', make: function (r, sh) {
          var D = sh.D, R = sh.rate;
          var p = K.P.poly('Write an equation for ' + t('D') + ' in terms of ' + t('t') + '.', PL.parse(cfirst(D, -R, 't')), { before: t('D='), keyTex: cfirst(D, -R, 't'), dec: true,
            wrong: [{ is: PL.parse(lin(R, D, 't')), code: 'eq-sign', hint: 'The depth goes <b>down</b> as time passes: subtract.' }, { is: PL.parse(lin(D, -R, 't')), code: 'eq-rate-const', hint: 'The starting depth is the constant; the rate multiplies ' + t('t') + '.' }, { is: PL.parse(lin(R, -D, 't')), code: 'eq-sign', hint: 'At ' + t('t=0') + ' your equation gives a negative depth.' }] },
            'Start at ' + t(num(D)) + ', lose ' + t(num(R)) + ' per minute: ' + t('D=' + cfirst(D, -R, 't')) + '.', ['What is ' + t('D') + ' at ' + t('t=0') + '? How much does it drop each minute?'], 'bucket equation');
          p.good = [lin(-R, D, 't')]; return p;
        } },
        { id: 'e15e', sub: 'e', level: 'EMG', make: function (r, sh) {
          return mc(r, 'The graph stops at ' + t('t=' + sh.T) + '. Which reason comes from the <b>situation</b>?', [
            { html: 'At ' + t('t=' + sh.T) + ' the bucket is empty. The depth can’t fall below ' + t('0') + ' cm, so the relation ends there.', right: true },
            { html: 'The equation stops working after ' + t('t=' + sh.T) + '.', why: 'The equation would happily give negative depths after that. The reason comes from the situation: what is in the bucket at ' + t('t=' + sh.T) + '?' },
            { html: 'The grid isn’t big enough to show any more.', why: 'The grid could be extended. Look at the depth at ' + t('t=' + sh.T) + '.' },
            { html: 'The hole gets blocked at ' + t('t=' + sh.T) + '.', why: 'Nothing says the hole gets blocked. Look at the depth at ' + t('t=' + sh.T) + '.' }],
            'At ' + t('t=' + sh.T) + ', ' + t('D=0') + ': the bucket is <b>empty</b>. There is no water left to leak, so the depth can’t keep falling and the relation ends.', ['What is the depth at ' + t('t=' + sh.T) + '?'], 'why the graph stops');
        } },
        { id: 'e15f', sub: 'f', level: 'EMG', make: function (r, sh) {
          var D = sh.D, R = sh.rate, x = sh.tf, ans = D - R * x;
          return K.P.number('Use your equation to find ' + t('D') + ' when ' + t('t=' + num(x)) + '. (This value can’t be read exactly off the grid.)', ans, function (v) {
            if (Math.abs(v - (D + R * x)) < 1e-9) return { code: 'ctx-add', hint: 'The depth is falling: subtract.' };
            if (Math.abs(v - R * x) < 1e-9) return { code: 'ctx-part', hint: 'That’s how much the depth dropped. What depth is <b>left</b>?' };
            if (Math.abs(v - (D - R)) < 1e-9) return { code: 'ctx-part', hint: 'Multiply the rate by ' + t(num(x)) + ' minutes.' };
            return null; }, t('D=' + num(D) + '-' + num(R) + '(' + num(x) + ')=' + num(D) + '-' + num(R * x) + '=' + num(ans)) + ' cm. That lies between two grid lines, so it can’t be read exactly from the graph.', ['Substitute ' + t('t=' + num(x)) + ' into ' + t('D=' + cfirst(D, -R, 't')) + '.'], 'bucket depth at ' + x, { after: 'cm' });
        } }] },
    { num: '16', stem: '<i>(Multiple Choice)</i>', parts: [
      { id: 'e16', level: 'BEG', outcome: 'RF2', make: function (r) {
        var a = r.int(1, 4), d = r.pick([2, 3, 3, 4]), ins = [a, a + d, a + 2 * d], outs, g = 0;
        do { outs = sorted(r.sample([9, 10, 11, 12, 14, 15, 16, 18, 20, 22], 2)); g++; } while (g < 50 && outs.some(function (y) { return ins.indexOf(y) >= 0; }));
        var pats = [[0, 0, 1], [0, 1, 1], [1, 0, 0], [1, 1, 0], [0, 1, 0], [1, 0, 1]], pat = r.pick(pats.slice(0, 3)), others = r.sample(pats.filter(function (p) { return p.join() !== pat.join(); }), 2);
        var P0 = arrowsFrom(ins, outs, pat), show = function (ps) { return t(ps.map(pt).join(',\\ ')); };
        var p = mc(r, 'Which set of ordered pairs represents the relation shown in the mapping diagram?' + HW.arrowDiagram(ins, outs, P0, { leftTitle: 'X', rightTitle: 'Y' }), [
          { html: show(P0), right: true },
          { html: show(P0.map(function (q) { return [q[1], q[0]]; })), why: 'Those pairs are reversed. Arrows start at the inputs, and the input is written first.' }].concat(others.map(function (o) {
            var ps = arrowsFrom(ins, outs, o), bad = ps.filter(function (q, i) { return q[1] !== P0[i][1]; })[0];
            return { html: show(ps), why: 'Follow the arrow from ' + t(bad[0]) + ': it points to ' + t(P0[ins.indexOf(bad[0])][1]) + ', not ' + t(bad[1]) + '.' }; })),
          'Read each arrow, input first: ' + P0.map(function (q) { return t(q[0] + '\\to ' + q[1]); }).join(', ') + ', giving ' + show(P0) + '.', ['Follow each arrow from ' + t('X') + ' to ' + t('Y') + '.'], 'pairs from mapping MC');
        return p;
      } }] },
    { num: '17', stem: '<i>(Numerical Response)</i>', parts: [
      { id: 'e17', level: 'PRG', make: function (r) {
        var c = r.int(2, 9), p = r.int(5, 9), k = r.int(8, 12), A = p * p + c, Q = k * k + c, ans = A + k;
        return K.P.nr('A relation is described in words: “the output is ' + t(c) + ' more than the square of the input.” Let ' + t('A') + ' be the output when the input is ' + t(p) + ', and let ' + t('B') + ' be the <b>positive</b> input that produces an output of ' + t(Q) + '. The value of ' + t('A+B') + ' is ________.', ans, function (v) {
          if (v === A + Q - c) return { code: 'diag', hint: 'For ' + t('B') + ': ' + t('B^{2}=' + (Q - c)) + ', so ' + t('B') + ' is the <b>square root</b> of ' + t(Q - c) + '.' };
          if (v === A - k) return { code: 'only-positive', hint: t('B') + ' is the <b>positive</b> input.' };
          if (v === 2 * p + c + k) return { code: 'two-x', hint: 'The square of ' + t(p) + ' is ' + t(p + '\\times ' + p) + ', not ' + t('2\\times ' + p) + '.' };
          if (v === A + (Q - c) / 2) return { code: 'sq-halved', hint: 'Undo the square with a square root, not by dividing by 2.' };
          return null; }, 'Rule: output ' + t('=') + ' input' + t('^{2}+' + c) + '. ' + t('A=' + p + '^{2}+' + c + '=' + A) + '. ' + t('B^{2}+' + c + '=' + Q) + ' → ' + t('B^{2}=' + (Q - c)) + ' → ' + t('B=' + k) + ' (positive). ' + t('A+B=' + A + '+' + k + '=' + ans) + '.',
        ['Write the rule as an equation first: ' + t('y=x^{2}+' + c) + '.'], 'A+B square rule');
      } }] }
  ];
  function range(n) { var a = []; for (var i = 0; i <= n; i++) a.push(i); return a; }

  HW.defineLesson({
    id: 'u5l2', unit: 5, num: '2', title: 'Describing Relationships Between Two Quantities', outcome: 'RF1',
    blurb: 'Words, tables, ordered pairs, arrow diagrams, equations and graphs — which variable is the input, which is the output, and how to tell a linear relation from a nonlinear one.',
    questions: [
      { num: '1', section: 'Part A — Independent and dependent variables, inputs and outputs', stem: function (sh) { return 'For the relation shown in the arrow diagram:' + HW.arrowDiagram(sh.ins, sh.outs, sh.pairs, { leftTitle: sh.L, rightTitle: sh.R }); },
        shared: function (r) {
          var nm = r.pick([['X', 'Y'], ['X', 'Y'], ['A', 'B'], ['M', 'N']]), a, d, ins, outs, ok1 = false;
          for (var g = 0; g < 200 && !ok1; g++) {
            a = r.int(2, 8); d = r.pick([2, 3, 4, 5]); ins = [a, a + d, a + 2 * d];
            outs = sorted(r.sample([11, 13, 15, 18, 20, 22, 25, 28, 30, 32, 35, 40, 45, 48, 50, 55], 2));
            ok1 = outs[1] - outs[0] >= 5 && outs.every(function (y) { return ins.indexOf(y) < 0; });
          }
          var pat = r.pick([[0, 0, 1], [0, 1, 1], [0, 1, 0], [1, 0, 0]]);
          return { L: nm[0], R: nm[1], ins: ins, outs: outs, pairs: ins.map(function (x, i) { return [x, outs[pat[i]]]; }) };
        },
        parts: [
          { id: '1a', level: 'LIM', outcome: 'RF2', make: function (r, sh) { return varsPart('State (i) the independent variable and (ii) the dependent variable.', sh.L, sh.R, 'Look at the arrows: they point <b>from</b> the independent variable <b>to</b> the dependent variable.', 'The arrows run from ' + t(sh.L) + ' to ' + t(sh.R) + ', so ' + t(sh.L) + ' is the independent variable (inputs) and ' + t(sh.R) + ' is the dependent variable (outputs).', 'variables from arrow diagram'); } },
          { id: '1b', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return listPart('(iii) List the inputs.', sh.ins, sh.outs, 'inputs', 'in the oval the arrows start from', 'The inputs are the values in ' + t(sh.L) + ', where the arrows start: ' + t(seqTex(sh.ins)) + '.', 'inputs from arrow diagram'); } },
          { id: '1c', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return listPart('(iv) List the outputs.', sh.outs, sh.ins, 'outputs', 'in the oval the arrows point to', 'The outputs are the values in ' + t(sh.R) + ', where the arrows end: ' + t(seqTex(sh.outs)) + '. (' + t(num(sh.pairs.filter(function (p, i, a) { return a.filter(function (q) { return q[1] === p[1]; }).length > 1; })[0][1])) + ' is hit twice, but it is listed once.)', 'outputs from arrow diagram'); } }] },
      { num: '2', stem: function (sh) { return 'For the relation in the table:' + (sh.vert ? vtable(sh.L, sh.R, sh.xs, sh.ys) : htable(sh.L, sh.R, sh.xs, sh.ys)); },
        shared: function (r) {
          var nm = r.pick([['p', 'q'], ['p', 'q'], ['m', 'n'], ['r', 's'], ['u', 'v'], ['j', 'k']]), xs, ys, g = 0;
          do { var a = r.int(2, 6), d = r.int(3, 6), k = r.int(2, 4), c = r.pick([-3, -2, -1, 1, 2, 3, 5]); xs = [a, a + d, a + 2 * d]; ys = xs.map(function (x) { return k * x + c; }); g++; }
          while (g < 100 && ys.some(function (y) { return xs.indexOf(y) >= 0 || y <= 0; }));
          return { L: nm[0], R: nm[1], xs: xs, ys: ys, vert: r.chance(0.6) };
        },
        parts: [
          { id: '2a', level: 'LIM', outcome: 'RF2', make: function (r, sh) { return varsPart('State (i) the independent variable and (ii) the dependent variable.', sh.L, sh.R, 'In a table of values the independent variable is listed <b>first</b> — to the left of, or above, the dependent variable.', 'The independent variable is listed first (' + (sh.vert ? 'the left column' : 'the top row') + '), so ' + t(sh.L) + ' is independent and ' + t(sh.R) + ' is dependent.', 'variables from table'); } },
          { id: '2b', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return listPart('(iii) List the inputs.', sh.xs, sh.ys, 'inputs', 'the values of ' + t(sh.L) + ' (listed first in the table)', 'The inputs are the values of the independent variable ' + t(sh.L) + ': ' + t(seqTex(sh.xs)) + '.', 'inputs from table'); } },
          { id: '2c', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return listPart('(iv) List the outputs.', sh.ys, sh.xs, 'outputs', 'the values of ' + t(sh.R) + ' (listed second in the table)', 'The outputs are the values of the dependent variable ' + t(sh.R) + ': ' + t(seqTex(sh.ys)) + '.', 'outputs from table'); } }] },
      { num: '3', stem: function (sh) { return 'A relation is given by the ordered pairs ' + t('(' + sh.L + ',' + sh.R + ')') + ': ' + t(ptsTex(sh.ps)) + '.'; },
        shared: function (r) {
          var nm = r.pick([['a', 'b'], ['a', 'b'], ['c', 'd'], ['g', 'h'], ['s', 't'], ['v', 'w']]), xs, ys, g = 0;
          do { var a = r.int(2, 5), d = r.int(2, 4), k = r.int(2, 5), c = r.pick([-4, -2, -1, 1, 2, 3, 6]); xs = [0, 1, 2, 3].map(function (i) { return a + i * d; }); ys = xs.map(function (x) { return k * x + c; }); g++; }
          while (g < 100 && ys.some(function (y) { return xs.indexOf(y) >= 0 || y <= 0; }));
          return { L: nm[0], R: nm[1], ps: xs.map(function (x, i) { return [x, ys[i]]; }), xs: xs, ys: ys };
        },
        parts: [
          { id: '3a', level: 'LIM', outcome: 'RF2', make: function (r, sh) { return varsPart('State (i) the independent variable and (ii) the dependent variable.', sh.L, sh.R, 'In an ordered pair ' + t('(' + sh.L + ',' + sh.R + ')') + ' the <b>first</b> coordinate is the independent variable.', 'The first coordinate of ' + t('(' + sh.L + ',' + sh.R + ')') + ' is independent: ' + t(sh.L) + ' is independent and ' + t(sh.R) + ' is dependent.', 'variables from ordered pairs'); } },
          { id: '3b', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return listPart('(iii) List the inputs.', sh.xs, sh.ys, 'inputs', 'the first coordinates', 'The inputs are the first coordinates: ' + t(seqTex(sh.xs)) + '.', 'inputs from pairs'); } },
          { id: '3c', level: 'BEG', outcome: 'RF2', make: function (r, sh) { return listPart('(iv) List the outputs.', sh.ys, sh.xs, 'outputs', 'the second coordinates', 'The outputs are the second coordinates: ' + t(seqTex(sh.ys)) + '.', 'outputs from pairs'); } }] },
      { num: '4', stem: 'For each relation, state (i) the independent variable and (ii) the dependent variable.', parts: [
        { id: '4a', level: 'EMG', outcome: 'RF2', make: function (r) {
          var c = r.pick(EQ4), k = r.pick(c.ks);
          return varsPart(c.s(k), c.ind, c.dep, 'The equation is solved for ' + t(c.dep) + ' (' + t(c.dep + '=\\ldots') + '), so ' + t(c.dep) + ' is the output. ' + t(c.ind) + ' is the input inside the expression.', 'The equation is solved for ' + t(c.dep) + ', and ' + t(c.dep) + ' is worked out from ' + t(c.ind) + '. Independent: ' + t(c.ind) + '; dependent: ' + t(c.dep) + '.', 'variables from equation');
        } },
        { id: '4b', level: 'BEG', outcome: 'RF2', make: function (r) {
          var g = r.pick(GR4), rows = r.shuffle([{ id: 'h', html: g.x }, { id: 'v', html: g.y }]);
          var fig = HW.graph({ x: [0, 8], y: [0, 6], grid: 0, labels: 0, xName: ' ', yName: ' ', xTitle: g.x, yTitle: g.y, fns: [{ f: g.f, from: g.from, to: g.to }], max: 260, firstQuadrant: true, unit: 28 });
          return K.P.grid('Choose the independent and the dependent variable for the relation in the graph.' + fig, rows, [{ id: 'I', html: 'Independent' }, { id: 'D', html: 'Dependent' }], { h: 'I', v: 'D' },
            { tries: 2, why: function () { return { code: 'var-swap', hint: 'On a graph the independent variable is on the <b>horizontal</b> axis and the dependent variable is on the <b>vertical</b> axis.' }; } },
            'The horizontal axis shows ' + g.x + ', so ' + g.x + ' is the independent variable; ' + g.y + ', on the vertical axis, is the dependent variable.', ['Which quantity is on the horizontal axis?'], 'variables from graph: ' + g.x + ' / ' + g.y);
        } },
        { id: '4c', level: 'EMG', outcome: 'RF2', make: function (r) {
          var c = r.pick(CTX4), s = r.pick(c.s);
          return varsPart(s, c.ind, c.dep, c.why + ' So ' + t(c.dep) + ' is dependent.', c.why + ' Independent: ' + t(c.ind) + '; dependent: ' + t(c.dep) + '.', 'variables from words: ' + c.ind + ' / ' + c.dep);
        } }] },
      { num: '5', section: 'Part B — Linear and nonlinear relations', stem: function (sh) { return 'Consider the linear relation described by the equation ' + t('y=' + lin(sh.m, sh.b)) + '.'; },
        shared: function (r) {
          var m = r.pick([2, 2, 3, 4, -2, -3]), b = r.pick([-6, -5, -4, -3, -2, 1, 3, 5]);
          var xs = sorted(r.sample([-4, -3, -2, -1], 2).concat([0]).concat(r.sample([1, 2, 3, 4, 5, 6], 2)));
          var xt = r.pick([3, 4, 5, 6, 7, 8, 9].filter(function (x) { return xs.indexOf(x) < 0 && m * x + b !== 0 && m * x + b !== m * x; }));
          return { m: m, b: b, xs: xs, xt: xt, yt: m * xt + b };
        },
        parts: [
          { id: '5a', level: 'BEG', make: function (r, sh) {
            var m = sh.m, b = sh.b, f = function (x) { return m * x + b; };
            var p = evalTable('(a) Determine the value of ' + t('y') + ' for each input.', sh.xs, f, function (x, v) {
              if (x < 0 && v === -m * x + b) return { code: 'neg-mult', hint: 'Careful with the sign: ' + t(m + '\\times(' + x + ')=' + (m * x)) + '.' };
              if (x !== 0 && v === m * x - b) return { code: 'const-sign', hint: 'Check the constant: the equation has ' + t(term(b, '', false)) + '.' };
              if (x !== 0 && v === m * x) return { code: 'no-const', hint: 'Don’t forget the constant ' + t(term(b, '', false)) + '.' };
              return null; }, 'Substitute each input: ' + sh.xs.map(function (x) { return t('y=' + m + '(' + x + ')' + term(b, '', false) + '=' + f(x)); }).join(', ') + '.', 'table for y=' + lin(m, b));
            p.bad = [sh.xs.map(function (x) { return num(-m * x + b); })];
            return p;
          } },
          { id: '5b', level: 'EMG', make: function (r, sh) {
            var m = sh.m, b = sh.b, Y = sh.yt, X = sh.xt;
            return K.P.number('(b) Determine the value of ' + t('x') + ' that produces an output of ' + t('y=' + Y) + '.', X, function (v) {
              if (v === m * Y + b) return { code: 'solve-sub-y', hint: 'You substituted ' + t(Y) + ' for ' + t('x') + '. Here ' + t(Y) + ' is the <b>output</b>: solve ' + t(lin(m, b) + '=' + Y) + '.' };
              if (Math.abs(v - (Y + b) / m) < 1e-9) return { code: 'solve-inverse', hint: 'To undo ' + t(term(b, '', false)) + ', ' + (b < 0 ? 'add ' + t(-b) : 'subtract ' + t(b)) + ' on both sides.' };
              if (v === Y - b) return { code: 'solve-no-div', hint: 'You found ' + t(m + 'x=' + (Y - b)) + '. Now divide both sides by ' + t(m) + '.' };
              return null; }, t(lin(m, b) + '=' + Y) + ' → ' + t(m + 'x=' + (Y - b)) + ' → ' + t('x=' + X) + '. Check: ' + t(m + '(' + X + ')' + term(b, '', false) + '=' + Y) + ' ✓',
            ['Set the expression equal to ' + t(Y) + ' and solve for ' + t('x') + '.', 'Undo the constant first, then divide by ' + t(m) + '.'], 'solve ' + lin(m, b) + '=' + Y);
          } },
          { id: '5c', level: 'EMG', make: function (r, sh) {
            var m = sh.m, b = sh.b;
            return mc(r, '(c) Is this relation linear or nonlinear? Which explanation is correct?', [
              { html: '<b>Linear</b> — ' + t('x') + ' appears only to the first power (no ' + t('x^{2}') + '), so each increase of ' + t('1') + ' in ' + t('x') + ' changes ' + t('y') + ' by the same amount (' + t(m) + '). The graph is a straight line.', right: true },
              { html: '<b>Nonlinear</b> — the constant ' + t(num(b)) + ' makes the graph bend.', why: 'A constant only moves the graph up or down; it can’t bend it. Look at the power of ' + t('x') + '.' },
              { html: '<b>Linear</b> — because every output is a whole number.', why: 'Whole-number outputs don’t make a relation linear: ' + t('y=x^{2}') + ' gives whole numbers too. Look at the power of ' + t('x') + '.' },
              { html: '<b>Nonlinear</b> — some of the outputs are negative.', why: 'Negative outputs don’t matter. Check whether equal steps in ' + t('x') + ' give equal changes in ' + t('y') + '.' }],
              'The equation has ' + t('x') + ' only to the first power, so every increase of ' + t('1') + ' in ' + t('x') + ' changes ' + t('y') + ' by ' + t(m) + '. The relation is <b>linear</b>; its graph is a straight line.', ['Is there an ' + t('x^{2}') + ' (or any other power of ' + t('x') + ') in the equation?'], 'linear from equation');
          } }] },
      { num: '6', stem: function (sh) { return 'Consider the nonlinear relation described by the equation ' + t('y=x^{2}' + term(sh.c, '', false)) + '.'; },
        shared: function (r) {
          var c = r.pick([-9, -8, -6, -5, -5, -4, -3, -2, 2, 3, 4, 6]), k = r.pick([3, 4, 4, 5]);
          var negs = r.sample([-4, -3, -2, -1].filter(function (x) { return x !== -k; }), 2), pos = r.pick([1, 2, 3].filter(function (x) { return x < k; }));
          return { c: c, k: k, xs: sorted(negs.concat([0, pos, k])) };
        },
        parts: [
          { id: '6a', level: 'EMG', make: function (r, sh) {
            var c = sh.c, f = function (x) { return x * x + c; };
            var p = evalTable('(a) Determine the value of ' + t('y') + ' for each input.', sh.xs, f, function (x, v) {
              if (x < 0 && v === -x * x + c) return { code: 'neg-square', hint: 'A negative number squared is positive: ' + t(br(x) + '^{2}=' + br(x) + '\\times' + br(x) + '=' + x * x) + '.' };
              if (x !== 0 && x !== 2 && v === 2 * x + c) return { code: 'two-x', hint: t('x^{2}') + ' means ' + t('x\\times x') + ', not ' + t('2x') + '.' };
              if (v === x * x - c) return { code: 'const-sign', hint: 'Check the constant: the equation has ' + t(term(c, '', false)) + '.' };
              return null; }, 'Substitute each input: ' + sh.xs.map(function (x) { return t(br(x) + '^{2}' + term(c, '', false) + '=' + f(x)); }).join(', ') + '.', 'table for y=x^2' + term(c, '', false));
            p.bad = [sh.xs.map(function (x) { return num(x < 0 ? -x * x + c : x * x + c); })];
            return p;
          } },
          { id: '6b', level: 'EMG', make: function (r, sh) {
            var k = sh.k, v = k * k + sh.c;
            return K.P.number('(b) Given that the output is ' + t(v) + ' when ' + t('x=' + k) + ', use the symmetry of the graph to predict the output when ' + t('x=-' + k) + '.', v, function (w) {
              if (v !== 0 && w === -v) return { code: 'sym-opp', hint: 'The graph is symmetric about the ' + t('y') + '-axis: ' + t('x=-' + k) + ' and ' + t('x=' + k) + ' are mirror images, so they have the <b>same</b> output (not opposite outputs).' };
              if (w === -k * k + sh.c) return { code: 'neg-square', hint: 'Use the symmetry: opposite inputs give the same output here, because ' + t('(-' + k + ')^{2}=' + k + '^{2}') + '.' };
              return null; }, 'The graph of ' + t('y=x^{2}' + term(sh.c, '', false)) + ' is symmetric about the ' + t('y') + '-axis, so ' + t('x=-' + k) + ' gives the same output as ' + t('x=' + k) + ': ' + t('y=' + v) + '.', ['Opposite inputs, like ' + t(k) + ' and ' + t(-k) + ', have the same square.'], 'symmetry x=-' + k);
          } },
          { id: '6c', level: 'BEG', make: function (r, sh) {
            var k = sh.k, c = sh.c, v = k * k + c, C = term(c, '', false);
            return mc(r, '(c) Which substitution correctly verifies your answer to (b)?', [
              { html: t('y=(-' + k + ')^{2}' + C + '=' + (k * k) + C + '=' + v), right: true },
              { html: t('y=-' + k + '^{2}' + C + '=-' + (k * k) + C + '=' + (-k * k + c)), why: 'Without brackets only the ' + t(k) + ' is squared. Substitute ' + t('x=-' + k) + ' in brackets: ' + t('(-' + k + ')^{2}=' + k * k) + '.' },
              { html: t('y=2(-' + k + ')' + C + '=' + (-2 * k + c)), why: t('x^{2}') + ' means ' + t('x\\times x') + ', not ' + t('2x') + '.' },
              { html: t('y=(-' + k + ')^{2}' + C + '=' + (k * k) + term(-c, '', false) + '=' + (k * k - c)), why: 'Check the constant: the equation has ' + t(C) + '.' }],
              t('y=(-' + k + ')^{2}' + C + '=' + (k * k) + C + '=' + v) + ', the same as the prediction in (b). ✓', ['Put ' + t('-' + k) + ' in brackets before squaring.'], 'verify symmetry');
          } },
          { id: '6d', level: 'EMG', make: function (r, sh) {
            return mc(r, '(d) Is this relation linear or nonlinear? Which explanation is correct?', [
              { html: '<b>Nonlinear</b> — the equation has an ' + t('x^{2}') + ' term, so equal steps in ' + t('x') + ' do not give equal changes in ' + t('y') + '. The graph is a curve.', right: true },
              { html: '<b>Linear</b> — ' + t('x') + ' appears only once in the equation.', why: 'What matters is the <b>power</b> of ' + t('x') + ', not how many times it appears. ' + t('x^{2}') + ' is ' + t('x') + ' to the second power.' },
              { html: '<b>Nonlinear</b> — the constant ' + t(num(sh.c)) + ' makes the graph bend.', why: 'A constant only moves a graph up or down — ' + t('y=2x' + term(sh.c, '', false)) + ' has the same constant and is a straight line. The ' + t('x^{2}') + ' is what bends this one.' },
              { html: '<b>Linear</b> — the outputs keep going up as ' + t('x') + ' goes up.', why: 'Look at your table: for negative inputs the outputs go <b>down</b> as ' + t('x') + ' increases, and the changes are not equal.' }],
              'The ' + t('x^{2}') + ' term means equal steps in ' + t('x') + ' give unequal changes in ' + t('y') + ' (try your table). The relation is <b>nonlinear</b>; its graph is a curve (a parabola).', ['Look at the power of ' + t('x') + ' in the equation.'], 'nonlinear from equation');
          } }] },
      { num: '7', stem: 'In each table the inputs go up in equal steps. Find the change in ' + t('y') + ' from each output to the next, then state whether the relation is <b>linear</b> or <b>nonlinear</b>.', parts: [
        { id: '7a', level: 'BEG', make: function (r) {
          var m = r.int(2, 5), b = r.int(1, 9), xs = [0, 1, 2, 3, 4];
          return diffsPart('(a)', xs, xs.map(function (x) { return m * x + b; }), 'differences, linear up');
        } },
        { id: '7b', level: 'EMG', make: function (r) {
          var a = r.pick([1, 1, 2]), b = r.pick([0, 0, 1]), c = r.int(0, 6), xs = [0, 1, 2, 3, 4];
          return diffsPart('(b)', xs, xs.map(function (x) { return a * x * x + b * x + c; }), 'differences, nonlinear');
        } },
        { id: '7c', level: 'EMG', make: function (r) {
          var k, y0; do { k = r.pick([2, 3, 4]); y0 = r.int(6, 15); } while (y0 - 4 * k > -1 || y0 - 4 * k < -6);
          var s = r.pick([2, 2, 3]), xs = [0, 1, 2, 3, 4].map(function (i) { return i * s; });
          return diffsPart('(c)', xs, [0, 1, 2, 3, 4].map(function (i) { return y0 - k * i; }), 'differences, linear down, step ' + s);
        } }] },
      { num: '8', section: 'Part C — Relations in context', stem: function (sh) { return 'A candle is ' + t(sh.H) + ' cm tall when lit and burns down at a steady rate of ' + t(num(sh.R)) + ' cm per hour.'; },
        shared: function (r) {
          var opts = [[20, 1.5], [18, 1.5], [24, 1.5], [30, 2.5], [25, 2.5], [20, 2.5], [12, 0.5], [15, 0.5]], o = r.pick(opts), H = o[0], R = o[1], T = H / R;
          var tc = r.pick([2, 3, 4, 5, 6, 7, 8].filter(function (x) { return x < T - 1; }));
          var td = r.pick([4, 5, 6, 7, 8, 10, 12, 14, 16, 20].filter(function (x) { return x !== tc && x < T - 0.5 && Number.isInteger(H - R * x) && H - R * x > 0; }));
          return { H: H, R: R, tc: tc, td: td, hd: H - R * td };
        },
        parts: [
          { id: '8a', level: 'PRG', make: function (r, sh) {
            var H = sh.H, R = sh.R;
            var p = K.P.poly('(a) Write an equation for the height, ' + t('h') + ' (cm), of the candle after ' + t('t') + ' hours of burning.', PL.parse(cfirst(H, -R, 't')), { before: t('h='), keyTex: cfirst(H, -R, 't'), dec: true,
              wrong: [{ is: PL.parse(lin(R, -H, 't')), code: 'eq-sign', hint: 'At ' + t('t=0') + ' your equation gives ' + t('h=-' + H) + '. The candle starts at ' + t(H) + ' cm and gets shorter.' },
                { is: PL.parse(lin(R, H, 't')), code: 'eq-sign', hint: 'Burning makes the candle <b>shorter</b>, so the height goes down by ' + t(num(R)) + ' cm each hour: subtract.' },
                { is: PL.parse(lin(H, -R, 't')), code: 'eq-rate-const', hint: 'The ' + t(H) + ' cm is the starting height (the constant); the rate ' + t(num(R)) + ' multiplies ' + t('t') + '.' },
                { is: PL.parse(lin(-R, 0, 't')), code: 'eq-no-start', hint: 'Include the starting height: at ' + t('t=0') + ' the candle is ' + t(H) + ' cm tall.' }] },
              'Starts at ' + t(H) + ' cm and loses ' + t(num(R)) + ' cm each hour: ' + t('h=' + cfirst(H, -R, 't')) + '.', ['What is the height at ' + t('t=0') + '? How does it change each hour?'], 'candle equation');
            p.good = [lin(-R, H, 't'), H + '-\\frac{' + (R * 2) + '}{2}t']; p.bad = [lin(R, H, 't'), lin(R, -H, 't')];
            return p;
          } },
          { id: '8b', level: 'EMG', outcome: 'RF2', make: function (r, sh) { return varsPart('(b) Identify the independent variable and the dependent variable.', 't', 'h', 'The height depends on how long the candle has burned — the time doesn’t depend on the height.', 'The height depends on the burning time. Independent: ' + t('t') + '; dependent: ' + t('h') + '.', 'candle variables'); } },
          { id: '8c', level: 'BEG', make: function (r, sh) {
            var H = sh.H, R = sh.R, tc = sh.tc, ans = H - R * tc;
            return K.P.number('(c) Determine the height of the candle after ' + t(tc) + ' hours.', ans, function (v) {
              if (Math.abs(v - (H + R * tc)) < 1e-9) return { code: 'ctx-add', hint: 'The candle gets shorter as it burns — subtract.' };
              if (Math.abs(v - R * tc) < 1e-9) return { code: 'ctx-part', hint: 'That’s how much has burned away. How tall is the candle that is <b>left</b>?' };
              return null; }, t('h=' + H + '-' + num(R) + '(' + tc + ')=' + H + '-' + num(R * tc) + '=' + num(ans)) + ' cm.', ['Substitute ' + t('t=' + tc) + ' into your equation.'], 'candle height after ' + tc, { after: 'cm' });
          } },
          { id: '8d', level: 'PRG', make: function (r, sh) {
            var H = sh.H, R = sh.R, hd = sh.hd, td = sh.td;
            return K.P.number('(d) Determine how many hours it takes for the candle to burn down to a height of ' + t(hd) + ' cm.', td, function (v) {
              if (Math.abs(v - (H - hd)) < 1e-9) return { code: 'solve-no-div', hint: t(num(H - hd)) + ' cm have to burn away. At ' + t(num(R)) + ' cm per hour, how many hours is that? Divide.' };
              if (Math.abs(v - hd / R) < 0.01) return { code: 'ctx-part', hint: 'That’s the time to burn ' + t(hd) + ' cm. The candle has to go <b>down to</b> ' + t(hd) + ' cm, so ' + t(num(H - hd)) + ' cm burn away.' };
              if (Math.abs(v - H / R) < 0.01) return { code: 'ctx-part', hint: 'That’s when the candle burns out completely (' + t('h=0') + '). Solve ' + t(cfirst(H, -R, 't') + '=' + hd) + '.' };
              if (Math.abs(v - (H + hd) / R) < 0.01) return { code: 'solve-inverse', hint: 'Solve ' + t(cfirst(H, -R, 't') + '=' + hd) + ': subtract ' + t(H) + ' from both sides first.' };
              return null; }, t(cfirst(H, -R, 't') + '=' + hd) + ' → ' + t('-' + num(R) + 't=' + num(hd - H)) + ' → ' + t('t=' + td) + ' hours.', ['Set your equation equal to ' + t(hd) + ' and solve for ' + t('t') + '.'], 'candle time to ' + hd, { after: 'hours' });
          } }] },
      { num: '9', stem: function (sh) { return sh.ctx(sh.F, sh.M); },
        shared: function (r) {
          var ctx = r.pick([function (F, M) { return 'A gym charges a one-time ' + t('\\$' + F) + ' sign-up fee plus ' + t('\\$' + M) + ' per month of membership.'; },
            function (F, M) { return 'A music school charges a one-time ' + t('\\$' + F) + ' registration fee plus ' + t('\\$' + M) + ' per month of lessons.'; },
            function (F, M) { return 'A climbing club charges a one-time ' + t('\\$' + F) + ' joining fee plus ' + t('\\$' + M) + ' per month of membership.'; }]);
          var F, M; do { F = r.pick([25, 30, 35, 40, 40, 45, 50, 60]); M = r.pick([12, 15, 15, 18, 20, 25, 30]); } while (F === M || F === 2 * M);
          return { ctx: ctx, F: F, M: M };
        },
        parts: [
          { id: '9a', level: 'BEG', make: function (r, sh) {
            var F = sh.F, M = sh.M, ms = [1, 2, 3, 4], cs = ms.map(function (m) { return F + M * m; });
            var fields = ms.map(function (m) { return { label: t('m=' + m), name: t('m=' + m), before: t('C=\\$') }; });
            return { prompt: '(a) Determine the total cost, ' + t('C') + ', for ' + t('m=1,2,3,') + ' and ' + t('4') + ' months.', input: { type: 'fields', fields: fields }, key: cs.map(String), text: 'cost table ' + F + '+' + M + 'm',
              answer: htable('m', 'C', ms, cs), bad: [ms.map(function (m) { return String(M * m); }), ms.map(function (m) { return String(F * m + M); })],
              check: K.fields(ms.map(function (m, i) { return K.number(cs[i], function (v) {
                if (v === M * m) return { code: 'ctx-no-fee', hint: 'Don’t forget the one-time ' + t('\\$' + F) + ' fee.' };
                if (m > 1 && v === F * m + M) return { code: 'ctx-fee-times', hint: 'The ' + t('\\$' + F) + ' fee is paid only <b>once</b>; it’s the ' + t('\\$' + M) + ' that is paid every month.' };
                if (m > 1 && v === (F + M) * m) return { code: 'ctx-fee-times', hint: 'The fee is paid once, not every month: ' + t(F + '+' + M + '\\times ' + m) + '.' };
                return null; }); }), { labels: fields.map(function (f) { return f.name; }) }),
              solution: 'Cost ' + t('=' + F + '+' + M + 'm') + ': ' + ms.map(function (m, i) { return t(F + '+' + M + '(' + m + ')=' + cs[i]); }).join(', ') + ' dollars.',
              hints: ['One fee of ' + t('\\$' + F) + ', plus ' + t('\\$' + M) + ' for each month.'] };
          } },
          { id: '9b', level: 'EMG', make: function (r, sh) {
            var F = sh.F, M = sh.M;
            var p = K.P.poly('(b) Write an equation relating the total cost ' + t('C') + ' to the number of months ' + t('m') + '.', PL.parse(F + '+' + M + 'm'), { before: t('C='), keyTex: F + '+' + M + 'm',
              wrong: [{ is: PL.parse(F + 'm+' + M), code: 'eq-rate-const', hint: 'The ' + t('\\$' + F) + ' is paid once (the constant); the ' + t('\\$' + M) + ' is paid every month, so it multiplies ' + t('m') + '.' },
                { is: PL.parse((F + M) + 'm'), code: 'ctx-fee-times', hint: 'Test ' + t('m=2') + ': your equation charges the fee twice. The fee is paid once.' },
                { is: PL.parse(M + 'm'), code: 'eq-no-start', hint: 'Include the one-time ' + t('\\$' + F) + ' fee.' }] },
              'A fixed ' + t('\\$' + F) + ' plus ' + t('\\$' + M) + ' per month: ' + t('C=' + F + '+' + M + 'm') + '.', ['Check your equation with your table from (a).'], 'cost equation');
            p.good = [M + 'm+' + F]; p.bad = [F + 'm+' + M, M + 'm'];
            return p;
          } },
          { id: '9c', level: 'EMG', outcome: 'RF2', make: function (r, sh) {
            return mc(r, '(c) Identify the independent and the dependent variable. Which choice and explanation is correct?', [
              { html: 'Independent: ' + t('m') + '; dependent: ' + t('C') + ' — the total cost depends on the number of months.', right: true },
              { html: 'Independent: ' + t('C') + '; dependent: ' + t('m') + ' — the number of months depends on the total cost.', why: 'You choose how many months to stay; the cost is then worked out from that. The cost is the output.' },
              { html: 'Independent: ' + t('m') + '; dependent: ' + t('C') + ' — because the ' + t('\\$' + sh.F) + ' fee never changes.', why: 'The fee being fixed doesn’t decide which variable is which. Ask: which quantity is worked out from the other?' },
              { html: 'Independent: the ' + t('\\$' + sh.M) + ' monthly charge; dependent: ' + t('C') + '.', why: t('\\$' + sh.M) + ' is a fixed rate, not a variable. The two variables are ' + t('m') + ' and ' + t('C') + '.' }],
              'The total cost is calculated from the number of months, so ' + t('m') + ' is independent and ' + t('C') + ' is dependent.', ['Which quantity is worked out from the other?'], 'cost variables');
          } }] },
      { num: '10', section: 'Part D — Multiple choice and numerical response', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '10', level: 'BEG', outcome: 'RF2', make: function (r) {
          var c = r.pick(MC10), askInd = r.chance(0.75);
          return mc(r, c.s + ' The <b>' + (askInd ? 'independent' : 'dependent') + '</b> variable in this relation is', [
            { html: c.ind, right: askInd, why: askInd ? null : 'That’s the independent variable (the input). The question asks for the one that depends on it.' },
            { html: c.dep, right: !askInd, why: askInd ? 'That’s the dependent variable: it depends on ' + c.ind + '.' : null },
            { html: c.ds[0], why: 'That isn’t one of the two variables named in the relation.' },
            { html: c.ds[1], why: 'That isn’t one of the two variables named in the relation.' }],
            (askInd ? 'The independent variable is <b>' + c.ind + '</b>: ' : 'The dependent variable is <b>' + c.dep + '</b>: ') + c.dep + ' depends on ' + c.ind + '. (The other two choices are not variables in the relation.)', ['Which quantity depends on the other?'], 'independent/dependent MC');
        } }] },
      { num: '11', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '11', level: 'BEG', make: function (r) {
          var m, b, x0, y0, opts, g = 0;
          for (; g < 300; g++) {
            m = r.int(2, 5); b = r.int(-9, -2); x0 = r.int(1, 4); y0 = m * x0 + b;
            var x1 = r.pick([1, 2, 3, 4].filter(function (x) { return x !== x0; })), x3 = r.pick([1, 2, 3, 4, 5].filter(function (x) { return x !== x0 && x !== x1; }));
            var cands = [[x0, y0, true], [x1, m * x1 + b + r.pick([-1, 1]), false, 'off'], [0, -b, false, 'sign'], [x3, m * x3 + b + r.pick([-2, 2]), false, 'off']];
            if (r.chance(0.5) && y0 !== x0 && m * y0 + b !== x0) cands[3] = [y0, x0, false, 'rev'];
            var keys = cands.map(function (c) { return c[0] + ',' + c[1]; });
            if (keys.filter(function (k, i) { return keys.indexOf(k) === i; }).length === 4 && cands.slice(1).every(function (c) { return m * c[0] + b !== c[1]; })) { opts = cands; break; }
          }
          return mc(r, 'Which ordered pair belongs to the relation ' + t('y=' + lin(m, b)) + '?', opts.map(function (c) {
            var val = m * c[0] + b;
            return { html: t(pt(c)), right: c[2], why: c[2] ? null : 'Substitute ' + t('x=' + c[0]) + ': ' + t(m + '(' + c[0] + ')' + term(b, '', false) + '=' + val) + ', not ' + t(c[1]) + '.' + (c[3] === 'rev' ? ' (An ordered pair is ' + t('(x,y)') + ': the input comes first.)' : '') };
          }), opts.map(function (c) { var val = m * c[0] + b; return t(pt(c)) + ': ' + t(m + '(' + c[0] + ')' + term(b, '', false) + '=' + val) + (c[2] ? ' ✓' : ' ≠ ' + t(c[1])); }).join('<br>'),
          ['Substitute the ' + t('x') + '-coordinate of each pair and see whether you get its ' + t('y') + '-coordinate.'], 'pair on y=' + lin(m, b));
        } }] },
      { num: '12', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '12', level: 'PRG', make: function (r) {
          var a, d, y0, k, n, X, ans, g = 0;
          do { a = r.int(1, 4); d = r.pick([2, 3, 3, 4, 5]); y0 = r.int(3, 15); k = r.int(3, 9); n = r.pick([5, 6, 6, 7]); X = a + n * d; ans = y0 + n * k; g++; }
          while (g < 100 && (k === d || ans > 999 || (y0 * d) % a === 0 && y0 / a === k / d));
          var xs = [0, 1, 2, 3].map(function (i) { return a + i * d; }), ys = [0, 1, 2, 3].map(function (i) { return y0 + i * k; });
          return K.P.nr('The table below shows a linear relation. Determine the value of ' + t('y') + ' when ' + t('x=' + X) + '.' + htable('x', 'y', xs, ys), ans, function (v) {
            if (v === y0 + (X - a) * k) return { code: 'nr-step1', hint: 'The inputs go up by ' + t(d) + ' each step, not by ' + t('1') + '. How many steps of ' + t(d) + ' is it from ' + t(a) + ' to ' + t(X) + '?' };
            if (v === ys[3] + k) return { code: 'nr-one-step', hint: t('x=' + X) + ' is more than one step past the table. Keep going in steps of ' + t(d) + '.' };
            if (Math.abs(v - X * y0 / a) < 1e-9) return { code: 'nr-prop', hint: 'That assumes ' + t('y') + ' is always the same multiple of ' + t('x') + '. Check: is ' + t(ys[1] + '\\div' + xs[1]) + ' the same as ' + t(ys[0] + '\\div' + xs[0]) + '? Use the constant change instead.' };
            return null; }, 'The inputs go up by ' + t(d) + ' and the outputs by ' + t(k) + ' each step (linear). From ' + t('x=' + a) + ' to ' + t('x=' + X) + ' is ' + t('(' + X + '-' + a + ')\\div' + d + '=' + n) + ' steps, so ' + t('y=' + y0 + '+' + n + '\\times' + k + '=' + ans) + '.',
          ['Find the step in ' + t('x') + ' and the matching change in ' + t('y') + ', then continue the pattern.'], 'extend linear table to x=' + X);
        } }] },
      { num: '13', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '13', level: 'PRG', make: function (r) {
          var m, b, p, B, Q, A, ans, g = 0;
          do { m = r.int(2, 6); b = r.pick([-7, -5, -4, -3, -2, -1, 2, 3, 4, 6]); p = r.int(3, 9); B = r.int(4, 12); Q = m * B + b; A = m * p + b; ans = A + B; g++; } while (g < 100 && (B === p || Q <= 0 || A <= 0));
          return K.P.nr('For the relation ' + t('y=' + lin(m, b)) + ', let ' + t('A') + ' be the output when the input is ' + t(p) + ', and let ' + t('B') + ' be the input that produces an output of ' + t(Q) + '. The value of ' + t('A+B') + ' is ________.', ans, function (v) {
            if (v === A + m * Q + b) return { code: 'nr-wrong-dir', hint: 'For ' + t('B') + ', ' + t(Q) + ' is the <b>output</b>: solve ' + t(lin(m, b) + '=' + Q) + ' (don’t substitute it for ' + t('x') + ').' };
            if (Math.abs(v - (A + (Q + b) / m)) < 1e-9) return { code: 'solve-inverse', hint: 'Check ' + t('B') + ': to undo ' + t(term(b, '', false)) + ', ' + (b < 0 ? 'add ' + t(-b) : 'subtract ' + t(b)) + '.' };
            if (v === A + Q - b) return { code: 'solve-no-div', hint: 'Check ' + t('B') + ': after undoing the constant, divide by ' + t(m) + '.' };
            if (v === A - B || v === A * B) return { code: 'diag', hint: 'The question asks for the <b>sum</b> ' + t('A+B') + '.' };
            return null; }, t('A=' + m + '(' + p + ')' + term(b, '', false) + '=' + A) + '. ' + t(lin(m, b) + '=' + Q) + ' → ' + t(m + 'x=' + (Q - b)) + ' → ' + t('x=' + B) + ', so ' + t('B=' + B) + '. ' + t('A+B=' + A + '+' + B + '=' + ans) + '.',
          ['Find ' + t('A') + ' by substituting; find ' + t('B') + ' by solving an equation.'], 'A+B for y=' + lin(m, b));
        } }] }
    ],
    extra: EXTRA
  });
})(window);
