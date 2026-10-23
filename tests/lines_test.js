// Checks js/lines.js.  node tests/lines_test.js
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp, Error: Error };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js', 'js/poly.js', 'js/lines.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
var HW = ctx.HW, K = HW.kit, L = HW.lines, fails = 0, n = 0;
function eq(a, b, msg) { n++; if (JSON.stringify(a) !== JSON.stringify(b)) { fails++; console.log('FAIL', msg, '\n   got ', JSON.stringify(a), '\n   want', JSON.stringify(b)); } }
function chk(c, cases, label) { Object.keys(cases).forEach(function (r) { var res = c(r), want = cases[r]; eq(want.indexOf(':') > 0 ? res.v + ':' + res.code : res.v, want, label + ' <- ' + r); }); }
var T = { m: [2, 3], b: -4 };
eq(L.tex(T, 'slope-intercept'), 'y=\\frac{2}{3}x-4', 'si tex'); eq(L.tex(T, 'general'), '2x-3y-12=0', 'general tex');
eq(L.tex({ m: -2, point: [-1, 3] }, 'point-slope', [-1, 3]), 'y-3=-2(x+1)', 'ps tex'); eq(L.tex({ x: 4 }), 'x=4', 'vertical tex'); eq(L.tex({ x: 4 }, 'general'), 'x-4=0', 'vertical general'); eq(L.tex({ y: -3 }, 'general'), 'y+3=0', 'horizontal general'); eq(K.line({ x: 4 }, { form: 'general' })('x-4=0').v, 'correct', 'vertical general accepted'); eq(L.tex({ m: 0, b: 5 }, 'slope-intercept'), 'y=5', 'horizontal');
chk(K.line(T), { 'y=\\frac{2}{3}x-4': 'correct', '2x-3y-12=0': 'correct', 'y+4=\\frac{2}{3}x': 'correct', 'y=-\\frac{2}{3}x-4': 'wrong:line-slope-sign', 'y=\\frac{3}{2}x-4': 'wrong:line-slope-flip', 'y=-\\frac{3}{2}x-4': 'wrong:line-perp', 'y=\\frac{2}{3}x+4': 'wrong:line-b-sign', 'y=\\frac{2}{3}x+1': 'wrong:line-intercept', 'y=5x-4': 'wrong:line-slope', 'x=3': 'wrong:line-vertical', '2x-3y': 'form:line-no-eq', '': 'form:empty' }, 'any');
chk(K.line(T, { form: 'slope-intercept' }), { 'y=\\frac{2}{3}x-4': 'correct', '2x-3y-12=0': 'form:line-form-si', '\\frac{2}{3}x-4=y': 'form:line-form-si', 'y=\\frac{1}{3}(2x-12)': 'form:line-form-simplify', 'y=\\frac{2x}{3}-4': 'correct' }, 'si');
chk(K.line(T, { form: 'general' }), { '2x-3y-12=0': 'correct', '-2x+3y+12=0': 'form:line-form-sign', '4x-6y-24=0': 'form:line-form-gcd', '\\frac{2}{3}x-y-4=0': 'form:line-form-int', '2x-3y=12': 'form:line-form-zero', '-3y+2x-12=0': 'correct' }, 'general');
var Tp = { m: -2, point: [-1, 3] };
chk(K.line(Tp, { form: 'point-slope', point: [-1, 3] }), { 'y-3=-2(x+1)': 'correct', 'y-3=-2\\left(x+1\\right)': 'correct', 'y=-2x+1': 'form:line-form-ps', 'y-5=-2(x-(-2))': 'form:line-form-point', 'y-3=2(x+1)': 'wrong:line-slope-sign', 'y-3=-2(x-1)': 'wrong:line-point' }, 'ps');
chk(K.line({ x: 4 }), { 'x=4': 'correct', 'y=4': 'wrong:line-vh', 'x=-4': 'wrong:line-x' }, 'vertical');
chk(K.line({ m: 0, b: 5 }), { 'y=5': 'correct', 'x=5': 'wrong:line-vh' }, 'horizontal');
chk(K.line({ m: 3, b: 2 }, { vars: ['t', 'C'] }), { 'C=3t+2': 'correct', 'y=3x+2': 'form:line-vars' }, 'context vars');
chk(K.slope([2, 3]), { '\\frac{2}{3}': 'correct', '\\frac{4}{6}': 'form:slope-lowest', '-\\frac{2}{3}': 'wrong:slope-sign', '\\frac{3}{2}': 'wrong:slope-flip', '\\text{undefined}': 'wrong:slope-und', 'm=\\frac23': 'correct' }, 'slope');
chk(K.slope(null), { '\\text{undefined}': 'correct', 'undefined': 'correct', '0': 'wrong:slope-zero-und' }, 'slope undefined');
chk(K.slope(0), { '0': 'correct', '\\text{undefined}': 'wrong:slope-und' }, 'slope zero');
var p = K.P.line('Write it.', T, { form: 'general' }, 's', [], 't'); eq([p.key, p.check(p.key).v, p.input.keys], ['2x-3y-12=0', 'correct', 'eq'], 'builder');
eq(L.tex({ m: 1, point: [-6, -4] }, 'point-slope', [-6, -4]), 'y+4=x+6', 'ps m=1'); eq(K.line({ m: 1, point: [-6, -4] }, { form: 'point-slope' })('y+4=x+6').v, 'correct', 'ps m=1 accepted');
var p2 = K.P.line('w', { m: 2, b: 3 }, { form: 'point-slope' }, 's', [], 't'); eq(p2.check(p2.key).v, 'correct', 'ps key without point');
chk(K.slope([-1, 2]), { '\\frac{-4}{8}': 'form:slope-lowest', '-\\frac{4}{8}': 'form:slope-lowest', '\\frac{4}{-8}': 'form:slope-lowest', '-\\frac{1}{2}': 'correct', '-0.5': 'correct' }, 'slope lowest neg');
chk(K.line({ m: [1, 4], point: [0, -9] }, { form: 'point-slope', point: [0, -9] }), { 'y+9=\\frac{x}{4}': 'correct', 'y+9=\\frac{1}{4}x': 'correct' }, 'ps x/4');
chk(K.line({ m: [-5, 4], point: [-5, 2] }, { form: 'point-slope', point: [-5, 2] }), { 'y-2=-\\frac{5(x+5)}{4}': 'correct', 'y-2=-\\frac{5}{4}(x+5)': 'correct', 'y=-\\frac{5}{4}x-\\frac{17}{4}': 'form:line-form-ps' }, 'ps fraction of bracket');

// systems: points and two-equation answers
var S1 = [[2, 1, -7], [1, -1, -2]]; // 2x+y=7, x-y=2 -> (3, 1)
chk(K.point([3, 1], { system: S1 }), { '(3,1)': 'correct', '\\left(3, 1\\right)': 'correct', 'x=3, y=1': 'correct', 'y=1,x=3': 'correct', '\\{(3,1)\\}': 'correct', '(1,3)': 'wrong:pt-swap', '3,1': 'form:pt-brackets', '(3,-1)': 'wrong:pt-sign', '(3,4)': 'wrong:pt-y', '(2,3)': 'wrong:sys-one-eq', '\\text{no solution}': 'wrong:sys-count', '': 'form:empty', '(a,b)': 'form:pt-unreadable' }, 'point');
chk(K.point([[1, 2], [-5, 3]]), { '(\\frac{1}{2},-\\frac{5}{3})': 'correct', '(0.5,-\\frac{5}{3})': 'correct', '(\\frac{2}{4},-\\frac{5}{3})': 'form:pt-lowest', '(0.5,-1.667)': 'form:pt-exact' }, 'point fractions');
chk(K.point('none'), { '\\text{no solution}': 'correct', 'no solution': 'correct', '\\text{infinitely many}': 'wrong:sys-none-inf', '(1,2)': 'wrong:sys-count' }, 'none');
chk(K.point('inf'), { '\\text{infinitely many}': 'correct', 'infinitely many solutions': 'correct', '\\text{no solution}': 'wrong:sys-none-inf' }, 'inf');
chk(K.point([4, 6], { vars: ['a', 'c'] }), { 'a=4, c=6': 'correct', '(4,6)': 'correct' }, 'point letters');
var sy = K.system([{ A: 1, B: 1, C: -20 }, { A: 5, B: 10, C: -150 }], { vars: ['n', 'd'] }); // n+d=20, 5n+10d=150
chk(function (r) { return sy(r.split('|')); }, { 'n+d=20|5n+10d=150': 'correct', 'n+d-20=0|n+2d=30': 'correct', '5n+10d=150|d=20-n': 'correct', 'n+d=20|': 'form:sys-one', 'n+d=20|n+d=20': 'wrong:sys-same', 'n+d=20|10n+5d=150': 'wrong:line-slope-flip' }, 'system');
var ps = K.P.system('Write it', [{ A: 1, B: 1, C: -20 }, { A: 5, B: 10, C: -150 }], { vars: ['n', 'd'] }, 's', [], 't'); eq([ps.check(ps.key).v, ps.key], ['correct', ['n+d-20=0', 'n+2d-30=0']], 'system builder');
var pp = K.P.point('Solve', [3, 1], { system: S1 }, 's', [], 't'); eq([pp.key, pp.check(pp.key).v, pp.input.keys], ['(3,\\ 1)', 'correct', 'point'], 'point builder');
console.log(n + ' checks, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
