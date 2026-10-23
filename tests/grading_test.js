// Test grading rule (js/testcore.js): the indicator ladder, the step-down, band placement, partial credit,
// Mastery-box multiple choice, missing boxes, saved marks with teacher-set indicators.   node tests/grading_test.js
var fs = require('fs'), path = require('path'), vm = require('vm'), root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, Date: Date, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp }; ctx.window = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js', 'js/poly.js', 'js/factor.js', 'js/relfn.js', 'js/draw.js', 'js/draw2.js', 'js/lines.js', 'js/geom.js', 'js/lessons/u1l1.js', 'js/lessons/u1l2.js', 'js/lessons/u1test.js', 'js/testcore.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx); });
if (fs.existsSync(path.join(root, 'js/partial.js'))) vm.runInContext(fs.readFileSync(path.join(root, 'js/partial.js'), 'utf8'), ctx);
var TC = ctx.HW.TestCore, fails = 0;
function eq(name, got, want) { var g = JSON.stringify(got), w = JSON.stringify(want); if (g !== w) { fails++; console.log('FAIL', name, g, 'want', w); } else console.log('ok  ', name, g); }
// the worked examples in the proposal (AN1: 8 BEG, 6 PRG, 7 MAS)
[[8, 6, 7, 'MAS', 100], [8, 6, 5, 'ADV', 84], [7, 5, 2, 'PRG', 71], [7, 4, 0, 'EMG', 62], [6, 2, 0, 'BEG', 52], [5, 1, 0, 'LIM', 35], [1, 0, 0, 'NM', 6], [5, 6, 6, 'ADV', 80], [8, 3, 6, 'ADV', 80], [3, 5, 6, 'PRG', 70]].forEach(function (r) {
  var g = TC.indicator(r[0] / 8, r[1] / 6, r[2] / 7); eq('ladder ' + r.slice(0, 3).join('/'), [g.ind, g.pct], [r[3], r[4]]);
});
eq('step-down flagged', !!TC.indicator(5 / 8, 1, 6 / 7).note, true);
eq('no flag when clean', TC.indicator(1, 1, 6 / 7).note, '');
// marks on the Unit 1 Test: build a marks string by box
var L = ctx.HW.lessons.u1test, def = { kind: 'test', items: L.items.map(function (it) { return { l: 'u1test', i: it.id }; }) }, items = TC.items(def);
function marks(fn) { return items.map(function (x) { return fn(x); }).join(''); }
var all = TC.outcomeGrades(def, marks(function () { return 'c'; }));
eq('all right', all.outcomes.map(function (o) { return o.outcome + ' ' + o.ind + ' ' + o.pct; }), ['AN1 MAS 100', 'AN2 MAS 100']);
eq('unit grade', all.unit, 100);
var small = TC.outcomeGrades(def, marks(function (x) { return 's'; }));
eq('every part a small mistake: 2/3 everywhere = ADV from the Mastery box, two steps down', small.outcomes.map(function (o) { return o.ind; }), ['EMG', 'EMG']);
eq('points with partial credit', small.points, Math.round(items.length * 2 / 3 * 100) / 100);
// Mastery multiple choice: only counts fully when the rest of the box agrees
var mcKeys = items.filter(function (x) { return TC.BOX[x.it.level] === 'M' && TC.inputType(x.lesson, x.it) === 'mc'; }).map(function (x) { return x.key; });
console.log('Mastery MC parts:', mcKeys.join(' '));
var mcOnly = TC.outcomeGrades(def, marks(function (x) { return TC.BOX[x.it.level] !== 'M' ? 'c' : (mcKeys.indexOf(x.key) >= 0 ? 'c' : 'w'); }));
mcOnly.outcomes.forEach(function (o) { var b = o.boxes.M; eq(o.outcome + ' MC-only right is halved', [o.mcHalved || !b.total || mcKeys.every(function (k) { return k.indexOf(o.outcome) < 0; }), b.earned <= b.total / 2 + 1e-9], [true, true]); });
// teacher-set indicator is kept and gives the band middle
var packed = TC.packMarks(marks(function () { return 'c'; }), { AN2: 'ADV' });
var set = TC.outcomeGrades(def, packed);
eq('teacher-set indicator', [set.outcomes[1].ind, set.outcomes[1].pct, set.outcomes[1].auto], ['ADV', 80, 'MAS']);
eq('parse/pack round trip', TC.packMarks(TC.parseMarks(packed).m, TC.parseMarks(packed).fin), packed);
// a missing Mastery box caps at PRG; a missing Beginning box doesn't penalize
var d2 = { kind: 'test', items: [{ l: 'u1l2', i: '1a' }, { l: 'u1l2', i: '1b' }] }, i2 = TC.items(d2);
console.log('levels of the two parts:', i2.map(function (x) { return x.it.level; }).join(' '));
var g2 = TC.outcomeGrades(d2, 'cc'); eq('only lower boxes: capped', ['PRG', 'EMG', 'BEG', 'LIM', 'NM'].indexOf(g2.outcomes[0].ind) >= 0, true);
// partial credit letters from recognized codes
var P = ctx.HW.PARTIAL || { small: {}, big: {} };
console.log('partial.js codes: small ' + Object.keys(P.small || {}).length + ', big ' + Object.keys(P.big || {}).length);
eq('credit table', ['c', 's', 'f', 'g', 'w', 'b', 'C', 'T', 'O', 'W'].map(TC.credit).map(function (v) { return Math.round(v * 100) / 100; }), [1, 0.67, 0.67, 0.33, 0, 0, 1, 0.67, 0.33, 0]);
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
