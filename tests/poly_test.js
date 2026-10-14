// Checks js/poly.js: polynomial algebra, the K.poly checker (right / form nudge / wrong with diagnosis) and drawings.
// node tests/poly_test.js
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp, Error: Error };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js', 'js/poly.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
var HW = ctx.HW, P = HW.poly, K = HW.kit, fails = 0, n = 0;
function eq(a, b, msg) { n++; if (JSON.stringify(a) !== JSON.stringify(b)) { fails++; console.log('FAIL', msg, '\n   got ', JSON.stringify(a), '\n   want', JSON.stringify(b)); } }
function chk(target, opt, cases) {
  var c = K.poly(target, opt);
  Object.keys(cases).forEach(function (resp) { var want = cases[resp], r = c(resp); var got = typeof want === 'string' && want.indexOf(':') > 0 ? r.v + ':' + r.code : r.v; eq(got, want, target + '  <-  ' + resp + '  ' + JSON.stringify(r).slice(0, 160)); });
}
// algebra
eq(P.tex(P.mul('x+4', 'x+6')), 'x^{2}+10x+24', 'product');
eq(P.tex(P.mul('3x+2', '2x+5')), '6x^{2}+19x+10', 'product 2');
eq(P.tex(P.pow('3a-2b', 2)), '9a^{2}-12ab+4b^{2}', 'square two letters');
eq(P.tex(P.sub('x^2-5', '3x^2+2x+3')), '-2x^{2}-2x-8', 'subtract');
eq(P.tex(P.parse('\\frac{1}{3}y-5+\\frac{5}{3}y+20')), '2y+15', 'fractions');
eq(P.tex(P.parse('\\frac{1}{5}a^2-\\frac{3}{4}a^3-2-a')), '-\\frac{3}{4}a^{3}+\\frac{1}{5}a^{2}-a-2', 'desc fractions');
eq(P.tex(P.parse('4x^2-3x^6-5x^5-3x^4+7x-9'), { order: 'asc' }), '-9+7x+4x^{2}-3x^{4}-5x^{5}-3x^{6}', 'ascending');
eq(P.tex(P.parse('0.3s^3-0.2s^2+0.5s-0.4'), { dec: true }), '0.3s^{3}-0.2s^{2}+0.5s-0.4', 'decimals');
eq(P.degree(P.parse('2a^2b^3-7ab+4b^4')), 5, 'degree');
eq(P.count(P.mul('2x-1', 'x+3')), 3, 'count');
eq(P.atExact(P.parse('(x+2)(x-3)(2x+1)'), { x: 2 }), [-20, 1], 'atExact');
eq(P.read('x^{-2}+1').why, 'not-poly', 'neg exp not poly');
eq(P.read('\\frac{9}{x^4}').why, 'not-poly', 'var in denominator');
eq(P.read('\\sqrt{7}-x^5').why, 'irrational', 'root coefficient');
eq(P.tex(P.parse('(x-3)(x^{2}+2x-1)')), 'x^{3}-x^{2}-7x+3', 'binomial x trinomial');
// checker
chk('x^2+10x+24', {}, {
  'x^2+10x+24': 'correct', 'x^{2}+10x+24': 'correct', '24+10x+x^2': 'correct', 'x^2 + 10 x + 24': 'correct', 'x\\cdot x+10x+24': 'form:combine',
  '(x+4)(x+6)': 'form:brackets', 'x^2+4x+6x+24': 'form:like-terms', 'x^2+10x+20+4': 'form:like-terms', 'x^2+2\\times5x+24': 'form:coef',
  'x^2+24': 'wrong:missing-term', 'x^2+10x-24': 'wrong:sign', 'x^2+10x+10': 'wrong:term', '-x^2-10x-24': 'wrong:sign-all', 'x^2+10x': 'wrong:missing-term',
  'x^2+10x+24+0x': 'form:zero-term', 'x^{2+10x+24}': 'form:exp-box', 'x^{2}+10x^{1}+24': 'correct', 'x^{2}+10x+24x^{0}': 'form:zero-exp'
});
chk('2y+15', {}, { '2y+15': 'correct', '\\frac{6}{3}y+15': 'form:lowest', '\\frac{2y}{1}+15': 'correct' });
chk('-\\frac{3}{4}a^{3}+\\frac{1}{5}a^{2}-a-2', { order: 'desc', var: 'a' }, {
  '-\\frac{3}{4}a^3+\\frac{1}{5}a^2-a-2': 'correct', '-\\frac{3a^3}{4}+\\frac{a^2}{5}-a-2': 'correct', '\\frac{1}{5}a^2-\\frac{3}{4}a^3-a-2': 'wrong:order', '-0.75a^3+0.2a^2-a-2': 'correct'
});
chk('-9+7x+4x^{2}-3x^{4}-5x^{5}-3x^{6}', { order: 'asc', var: 'x' }, { '-9+7x+4x^2-3x^4-5x^5-3x^6': 'correct', '-3x^6-5x^5-3x^4+4x^2+7x-9': 'wrong:order' });
chk('6x^2-7x-20', { wrong: [{ is: '6x^2-20', code: 'outer-inner', hint: 'middle' }] }, { '6x^2-20': 'wrong:outer-inner', '6x^2-7x-20': 'correct', '6x^2+7x-20': 'wrong:sign' });
chk('x^2-49', {}, { 'x^2-49': 'correct', 'x^2+49': 'wrong:sign', '(x+7)(x-7)': 'form:brackets', 'x^2-7x+7x-49': 'form:like-terms' });
chk('2m+2n', {}, { '2m+2n': 'correct', '2n+2m': 'correct', '2(m+n)': 'form:brackets' });
chk('2m+2n', { expanded: false }, { '2(m+n)': 'correct' });
chk('9a^2-12ab+4b^2', {}, { '9a^2-12ab+4b^2': 'correct', '9a^2+4b^2': 'wrong:missing-term', '9a^2-6ab+4b^2': 'wrong:term', '3a^2-12ab+4b^2': 'wrong:term', 'a^{-1}': 'wrong:not-poly', '': 'form:empty' });
chk('3x^3+6x', {}, { '3x^2+6x': 'wrong:exponent', '3x^3+6x': 'correct' });
chk('x^3+8', {}, { 'x^3+8': 'correct', 'x^3+0x^2+8': 'form:zero-term', 'x^3+4x+8': 'wrong:extra-term' });
chk('5x^2-4x-6', {}, { '5x^2-4x-6': 'correct', '5x^{2}-4x-6': 'correct', '5x^2-10x+4': 'wrong:value' });
// key renders
var part = K.P.poly('Expand.', P.mul('2x-5', '3x+4'), {}, 'sol', [], 'txt');
eq([part.key, part.input.keys, part.input.vars], ['6x^{2}-7x-20', 'poly', ['x']], 'part builder');
eq(part.check(part.key).v, 'correct', 'part key graded correct');
// drawings
eq(/<svg/.test(HW.tiles.row(HW.tiles.count({ x2: 2, x: -1, one: 3 }))), true, 'tile row');
eq(/<svg/.test(HW.tiles.frame(['x', 'x', '-1'], ['x', '1', '1', '1'], { fill: true })), true, 'tile frame');
eq(/am-grid/.test(HW.areaModel(['x', '6'], ['2x'], [['2x^{2}', '12x']])), true, 'area model');
console.log(n + ' checks, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
