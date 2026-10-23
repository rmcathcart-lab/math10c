// Checks js/geom.js (K.near and the figure builders render).  node tests/geom_test.js
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp, Error: Error };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js', 'js/geom.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
var HW = ctx.HW, K = HW.kit, T = HW.trig, fails = 0, n = 0;
function eq(a, b, msg) { n++; if (JSON.stringify(a) !== JSON.stringify(b)) { fails++; console.log('FAIL', msg, '\n   got ', JSON.stringify(a), '\n   want', JSON.stringify(b)); } }
var x = 15 * T.sin(35), c = K.near(x, 1, { alts: [{ v: 15 * T.cos(35), code: 'trig-ratio', hint: 'wrong ratio' }, { v: 15 * T.radSin(35), code: 'trig-rad', hint: 'radian mode' }] });
eq(c('8.6').v, 'correct', 'near right'); eq(c('12.3').code, 'trig-ratio', 'near alt'); eq(c(String((15 * Math.sin(35)).toFixed(1))).code, 'trig-rad', 'near radian'); eq(c('8.604').v, 'form', 'near not rounded'); eq(c('9').v, 'form', 'near places');
var p = K.P.near('Find x', x, 1, { unit: 'cm' }, 's', [], 't'); eq([p.check(p.key).v, p.input.after], ['correct', 'cm'], 'near builder');
eq(Math.round(T.asin(0.5) * 1e6) / 1e6, 30, 'asin degrees');
var svg = HW.tri({ w: 4, h: 3, sides: { a: '9 cm', c: '15 cm', b: 'x' }, angles: { A: 'θ' } }); eq([/<svg/.test(svg), /9 cm/.test(svg), /θ/.test(svg)], [true, true, true], 'tri svg');
['rectprism', 'cube', 'triprism', 'cylinder', 'cone', 'sqpyramid', 'rectpyramid', 'sphere', 'hemisphere'].forEach(function (k) { eq(/<svg/.test(HW.solid(k, { h: '3 cm', r: 'r = 2' })), true, 'solid ' + k); });
console.log(n + ' checks, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
