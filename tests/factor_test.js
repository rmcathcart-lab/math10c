// Checks js/factor.js (K.factored).  node tests/factor_test.js
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp, Error: Error };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js', 'js/poly.js', 'js/factor.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
var HW = ctx.HW, K = HW.kit, F = HW.factor, fails = 0, n = 0;
function eq(a, b, msg) { n++; if (JSON.stringify(a) !== JSON.stringify(b)) { fails++; console.log('FAIL', msg, '\n   got ', JSON.stringify(a), '\n   want', JSON.stringify(b)); } }
function chk(target, opt, cases) {
  var c = K.factored(target, opt);
  Object.keys(cases).forEach(function (resp) { var want = cases[resp], r = c(resp); var got = want.indexOf(':') > 0 ? r.v + ':' + r.code : r.v; eq(got, want, target + '  <-  ' + resp + '  ' + JSON.stringify(r).slice(0, 200)); });
}
eq(F.tex(['3x', 'x-4', 'x+4']), '3x(x-4)(x+4)', 'tex');
eq(F.tex([{ p: 'x+3', k: 2 }]), '(x+3)^{2}', 'tex power');
eq(F.tex(['-1', 'x+2', '6x-7']), '-(x+2)(6x-7)', 'tex negative');
eq(HW.poly.tex(F.product('2(2x+3)(x+1)')), '4x^{2}+10x+6', 'product');
chk('(x+3)(x-4)', {}, {
  '(x+3)(x-4)': 'correct', '(x-4)(x+3)': 'correct', '(x+3)\\left(x-4\\right)': 'correct', '-(x+3)(4-x)': 'correct', '(-x-3)(4-x)': 'correct',
  'x^2-x-12': 'form:not-factored', '(x-3)(x+4)': 'wrong:sign', '(x+2)(x-6)': 'wrong:middle', '(x+6)(x-2)': 'wrong', '(x+3)(x+4)': 'wrong'
});
chk('3x(x-4)(x+4)', {}, {
  '3x(x-4)(x+4)': 'correct', '3x(x+4)(x-4)': 'correct', 'x(3x-12)(x+4)': 'form:gcf-inside', '3x(x^2-16)': 'form:factor-more', '3(x^3-16x)': 'form:gcf-inside',
  '3x^3-48x': 'form:not-factored', '3x(x-4)^2': 'wrong', '3(x-4)(x+4)': 'wrong', '-3x(4-x)(x+4)': 'correct'
});
chk('2(2x+3)(x+1)', {}, { '2(2x+3)(x+1)': 'correct', '(4x+6)(x+1)': 'form:gcf-inside', '(2x+3)(2x+2)': 'form:gcf-inside', '(2x+3)(x+1)': 'wrong' });
chk('(2x-3)^{2}', {}, { '(2x-3)^2': 'correct', '(2x-3)(2x-3)': 'correct', '(3-2x)^2': 'correct', '(2x-3)(2x+3)': 'wrong', '4x^2-12x+9': 'form:not-factored' });
chk('-(x+2)(6x-7)', {}, { '-(x+2)(6x-7)': 'correct', '(x+2)(7-6x)': 'correct', '(-x-2)(6x-7)': 'correct', '(x+2)(6x-7)': 'wrong:sign-all' });
chk('(x^2+4)(x-2)(x+2)', {}, { '(x^2+4)(x-2)(x+2)': 'correct', '(x^2+4)(x^2-4)': 'form:factor-more', '(x^2-4)(x^2+4)': 'form:factor-more' });
chk('(2x+y)(3x+2y)', {}, { '(2x+y)(3x+2y)': 'correct', '(3x+2y)(2x+y)': 'correct', '(2x+2y)(3x+y)': 'wrong' });
chk('(a+b)(x+3)', {}, { '(x+3)(a+b)': 'correct', 'a(x+3)+b(x+3)': 'form:not-factored' });
chk('5x^{2}(2x-3)', {}, { '5x^2(2x-3)': 'correct', '5x(2x^2-3x)': 'form:gcf-inside', 'x^2(10x-15)': 'form:gcf-inside' });
chk('3x(x^{2}-16)', { gcfOnly: true }, { '3x(x^2-16)': 'correct', '3x(x-4)(x+4)': 'correct', 'x(3x^2-48)': 'form:gcf-inside' });
chk('(x+3)(x-4)', { wrong: [{ is: '(x-3)(x+4)', code: 'swap', hint: 'swapped' }] }, { '(x-3)(x+4)': 'wrong:swap', '': 'form:empty' });
var p = K.P.factored('Factor.', '(x+3)(x-4)', {}, 's', [], 't');
eq([p.key, p.input.keys, p.check(p.key).v], ['(x+3)(x-4)', 'poly', 'correct'], 'builder');
console.log(n + ' checks, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
