// Checks js/relfn.js: set notation, solution lists, ordered pairs, drawings.  node tests/relfn_test.js
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp, Error: Error, Infinity: Infinity };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js', 'js/poly.js', 'js/relfn.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
var HW = ctx.HW, K = HW.kit, S = HW.sets, fails = 0, n = 0;
function eq(a, b, msg) { n++; if (JSON.stringify(a) !== JSON.stringify(b)) { fails++; console.log('FAIL', msg, '\n   got ', JSON.stringify(a), '\n   want', JSON.stringify(b)); } }
function chk(c, label, cases) { Object.keys(cases).forEach(function (resp) { var want = cases[resp], r = c(resp); var got = want.indexOf(':') > 0 ? r.v + ':' + r.code : r.v; eq(got, want, label + '  <-  ' + resp + '  ' + JSON.stringify(r).slice(0, 160)); }); }
var same = function (a, b) { var x = S.parse(a), y = S.parse(b); return x.ok && y.ok && S.eq(x.set, y.set); };
// parsing equivalences
[['\\{x\\mid -2\\le x<5,\\ x\\in\\mathbb{R}\\}', '[-2, 5)'], ['-2<=x<5', '[-2,5)'], ['x\\ge -2', '[-2,\\infty)'], ['\\left\\lbrace y\\mid y\\le3, y\\in\\mathbb{R}\\right\\rbrace', '(-\\infty,3]'],
 ['\\mathbb{R}', '(-\\infty, \\infty)'], ['all real numbers', 'x\\in\\mathbb{R}'], ['\\{x|x in R\\}', 'R'], ['{x | -4 < x <= 3, x in R}', '(-4, 3]'], ['\\{-1, 1, 3, 5, 7\\}', '\\{7,5,3,1,-1\\}'],
 ['\\{n\\mid 0\\le n\\le 4,\\ n\\in W\\}', '\\{0,1,2,3,4\\}'], ['x\\ne 2', '(-\\infty,2)\\cup(2,\\infty)'], ['\\{3\\}', '3\\le y\\le 3'], ['D=\\{x\\mid x>-2,\\ x\\in\\mathbb{R}\\}', '(-2,\\infty)'],
 ['R = \\{2, 4\\}', '\\{4,2\\}'], ['5\\ge x>-1', '(-1,5]'], ['\\{\\frac12, 2\\}', '\\{0.5, 2\\}'], ['Domain: [-3, 5]', '-3\\le x\\le 5'], ['\\lbrack -2,5)', '[-2,5)'], ['\\left[-2,5\\right)', '[-2,5)']
].forEach(function (p) { eq(same(p[0], p[1]), true, 'same ' + p[0] + ' == ' + p[1]); });
eq(same('[-2,5]', '[-2,5)'), false, 'endpoint differs');
eq(S.parse('[5,-2]').why, 'backwards', 'backwards');
eq(S.parse('[-\\infty, 3]').why, 'inf-bracket', 'inf bracket');
// checker
var dom = K.set('\\{x\\mid -5\\le x\\le3,\\ x\\in\\mathbb{R}\\}', { other: '\\{y\\mid -3\\le y\\le4,\\ y\\in\\mathbb{R}\\}', otherName: 'range' });
chk(dom, 'domain', { '\\{x\\mid -5\\le x\\le 3,\\ x\\in\\mathbb{R}\\}': 'correct', '-5\\le x\\le 3': 'correct', '[-5,3]': 'correct', '\\{x\\mid -5\\le x\\le3\\}': 'form:set-tag', '\\{y\\mid -5\\le y\\le3, y\\in R\\}': 'form:set-letter',
  '-5<x<3': 'wrong:set-endpoint', '[-3,4]': 'wrong:set-swap', '\\{-5,-4,-3,-2,-1,0,1,2,3\\}': 'wrong:set-continuous', 'x\\ge-5': 'wrong:set-arrow', 'blah': 'form', '': 'form:empty' });
var list = K.set('\\{-3,-1,0,2,4,6\\}');
chk(list, 'list', { '\\{6,4,2,0,-1,-3\\}': 'correct', '\\{-3,-1,0,2,4\\}': 'wrong:set-missing', '\\{-3,-1,0,1,2,4,6\\}': 'wrong:set-extra', '-3\\le x\\le 6': 'wrong:set-discrete', '-3,-1,0,2,4,6': 'form:set-no-braces' });
var iv = K.set('(-\\infty, 3]', { forms: ['interval'] });
chk(iv, 'interval only', { '(-\\infty,3]': 'correct', 'x\\le3': 'form:set-form' });
// solutions
var vs = K.valueSet([5, -5]);
chk(vs, 'solutions', { 'x=5, x=-5': 'correct', '\\pm5': 'correct', 'x=\\pm 5': 'correct', '-5, 5': 'correct', 'x=-5\\text{ or }x=5': 'correct', 'x=5': 'wrong:sol-missing', 'x=5,x=-5,x=0': 'wrong:sol-extra' });
chk(K.valueSet([3, [-2, 5]]), 'solutions frac', { 'x=3, x=-\\frac{2}{5}': 'correct', 'x=-3, x=\\frac{2}{5}': 'wrong:sol-sign', 'x=3,x=-0.4': 'correct' });
// pairs
var pr = K.pairs([[0, -3], [1, 1], [2, 5]]);
chk(pr, 'pairs', { '\\{(0,-3),(1,1),(2,5)\\}': 'correct', '(2,5),(0,-3),(1,1)': 'correct', '\\{(-3,0),(1,1),(5,2)\\}': 'wrong:pairs-flip', '\\{(0,-3),(1,1)\\}': 'wrong:pairs-missing', '\\left\\lbrace\\left(0,-3\\right),\\left(1,1\\right),\\left(2,5\\right)\\right\\rbrace': 'correct' });
// drawings
eq(/<svg/.test(HW.graph({ points: [{ x: 1, y: 2 }], segs: [{ pts: [[-3, -1], [2, 4]], start: 'closed', end: 'arrow' }], fns: [{ f: function (x) { return x * x - 2; }, from: -3, to: 3, start: 'open', end: 'closed' }] })), true, 'graph');
eq(/<svg/.test(HW.arrowDiagram([1, 2, 3], [4, 5], [[1, 4], [2, 5], [3, 5]])), true, 'arrow diagram');
eq(/<table/.test(HW.valueTable([['x', 1, 2], ['y', 3, 4]])), true, 'table');
// alternate builder order, \middle, and lists with dots
(function () { var c = K.set('\\{x\\mid -5<x\\le 4, x\\in\\mathbb{R}\\}'); eq(c('\\{x\\in\\mathbb{R}\\mid -5<x\\le 4\\}').v, 'correct', 'x in R first'); eq(c('\\left\\{x\\middle|-5<x\\le4, x\\in R\\right\\}').v, 'correct', 'middle bar');
  var d = K.set('\\{n\\mid 0\\le n\\le 250, n\\in W\\}'); eq(d('\\{0, 1, 2, \\ldots, 250\\}').v, 'correct', 'dots list'); eq(d('{0, 1, 2, ..., 249}').v, 'wrong', 'dots list short'); })();
(function () { var c = K.set('(-\\infty,-4]\\cup[4,\\infty)'); eq(c('\\{x\\mid x\\le -4\\text{ or }x\\ge 4, x\\in\\mathbb{R}\\}').v, 'correct', 'or in builder'); eq(c('x\\le -4 or x\\ge 4').v, 'correct', 'or bare'); eq(c('x<-4 or x>4').v, 'wrong', 'or strict'); })();
console.log(n + ' checks, ' + fails + ' failed'); process.exit(fails ? 1 : 0);
