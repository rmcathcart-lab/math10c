// Checks js/draw.js (drawing geometry and checkers).  node tests/draw_test.js
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp, Error: Error };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js', 'js/poly.js', 'js/factor.js', 'js/relfn.js', 'js/draw.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
var HW = ctx.HW, D = HW.draw, K = HW.kit, fails = 0, n = 0;
function eq(a, b, msg) { n++; if (JSON.stringify(a) !== JSON.stringify(b)) { fails++; console.log('FAIL', msg, '\n   got ', JSON.stringify(a), '\n   want', JSON.stringify(b)); } }
function seg(a, b, s, e) { return { v: [a, b], s: s || 'closed', e: e || 'closed' }; }
function g(pieces, pts, join) { return { pieces: pieces || [], pts: pts || [], join: join || 'none' }; }
function v(r) { return r.v + (r.code ? ':' + r.code : ''); }

// same point set, drawn differently
eq(D.same(g([seg([0, 0], [2, 2])]), g([seg([2, 2], [0, 0])])), true, 'reversed segment');
eq(D.same(g([seg([0, 0], [1, 1]), seg([1, 1], [3, 3])]), g([seg([0, 0], [3, 3])])), true, 'collinear pieces join');
eq(D.same(g([{ v: [[0, 0], [1, 1], [3, 3]], s: 'closed', e: 'closed' }]), g([seg([0, 0], [3, 3])])), true, 'polyline vertex on a line');
eq(D.same(g([seg([0, 1], [1, 3], 'arrow', 'arrow')]), g([seg([-2, -3], [2, 5], 'arrow', 'arrow')])), true, 'full line, any two points');
eq(D.same(g([seg([0, 0], [2, 2])]), g([seg([0, 0], [2, 2], 'closed', 'open')])), false, 'open end differs');
eq(D.same(g([seg([0, 0], [2, 2], 'closed', 'open')], [[2, 2]]), g([seg([0, 0], [2, 2])])), true, 'point fills open end');
eq(D.same(g([], [[1, 2], [3, 4]]), g([], [[3, 4], [1, 2]])), true, 'points any order');
eq(D.same(g([], [[1, 2], [3, 4]], 'curve'), g([seg([1, 2], [3, 4])])), true, 'joined points = line');
// domain / range / function
var s1 = g([seg([-4, 1], [2, 4], 'closed', 'open')]);
eq(D.partsTex(D.domain(s1).parts), '-4\\le x<2', 'domain');
eq(D.partsTex(D.range(s1).parts, 'y'), '1\\le y<4', 'range');
eq(D.partsTex(D.domain(g([seg([0, 0], [1, 2], 'closed', 'arrow')])).parts), 'x\\ge 0', 'domain with arrow');
eq(D.partsTex(D.range(g([seg([0, 3], [1, 1], 'arrow', 'arrow')])).parts, 'y'), 'y\\in\\mathbb{R}', 'range all reals');
eq(D.partsTex(D.domain(g([], [[1, 2], [3, 0], [1, 5]])).parts), '\\{1,\\ 3\\}', 'domain of points');
eq(D.notFunction(g([seg([1, 0], [1, 3])])) !== null, true, 'vertical segment not a function');
eq(D.notFunction(g([seg([0, 0], [2, 2]), seg([1, 5], [3, 5])])) !== null, true, 'overlapping x not a function');
eq(D.notFunction(g([seg([0, 0], [2, 2]), seg([2, 5], [4, 5])])) !== null, true, 'shared x both closed not a function');
eq(D.notFunction(g([seg([0, 0], [2, 2], 'closed', 'open'), seg([2, 5], [4, 5])])), null, 'open/closed at shared x is a function');
eq(D.notFunction(g([seg([0, 0], [2, 2]), seg([2, 2], [4, 0])])), null, 'connected V is a function');
eq(D.notFunction(g([], [[1, 2], [1, 3]])) !== null, true, 'points with same x');
// graphExact
var tgt = g([], [[1, 2], [3, -1], [-2, 4]]), ce = K.graphExact(tgt);
eq(v(ce(g([], [[3, -1], [1, 2], [-2, 4]]))), 'correct', 'points correct');
eq(v(ce(g([], [[2, 1], [-1, 3], [4, -2]]))), 'wrong:graph-swap', 'swapped coords');
eq(v(ce(g([], [[1, 2], [3, -1]]))), 'wrong:graph-missing', 'missing point');
eq(v(ce(g([], [[1, 2], [3, -1], [-2, 4], [0, 0]]))), 'wrong:graph-extra', 'extra point');
eq(v(ce(g())), 'form:empty', 'empty');
var cl = K.graphExact(g([seg([-3, -5], [3, 7], 'arrow', 'arrow')]));
eq(v(cl(g([seg([0, 1], [2, 5], 'arrow', 'arrow')]))), 'correct', 'line y=2x+1');
eq(v(cl(g([seg([-3, -5], [3, 7])]))), 'wrong:graph-arrows', 'line without arrows');
var cs = K.graphExact(g([seg([-4, 1], [2, 4], 'closed', 'open')]));
eq(v(cs(g([seg([-4, 1], [2, 4], 'open', 'closed')]))), 'wrong:graph-ends', 'ends swapped');
var cj = K.graphExact(g([], [[0, 0], [1, 3], [2, 6]], 'none'), { joinMatters: true });
eq(v(cj(g([], [[0, 0], [1, 3], [2, 6]], 'curve'))), 'wrong:graph-joined', 'discrete joined');
// graphRules
var cr = K.graphRules({ fn: true, domain: '\\{x\\mid -2\\le x<4\\}', range: '\\{y\\mid 1\\le y\\le 5\\}' });
eq(v(cr(g([seg([-2, 1], [4, 5], 'closed', 'open')]))), 'wrong:rule-range', 'range must include 5');
eq(v(cr(g([seg([-2, 1], [1, 5]), seg([1, 5], [4, 3], 'closed', 'open')]))), 'correct', 'a valid sketch');
eq(v(cr(g([seg([-2, 1], [1, 5]), seg([1, 5], [4, 3])]))), 'wrong:rule-domain', 'domain end closed');
eq(v(cr(g([seg([-2, 1], [-2, 5]), seg([-2, 5], [4, 3], 'closed', 'open')]))), 'wrong:rule-fn', 'vertical piece');
// story
var st = K.graphStory({ phases: [{ dir: 'up', text: 'walks to the store' }, { dir: 'flat', text: 'shops' }, { dir: 'down', text: 'walks home' }], start: 0, end: 0 });
eq(v(st(g([{ v: [[0, 0], [10, 6], [25, 6], [40, 0]], s: 'none', e: 'none' }]))), 'correct', 'story ok');
eq(v(st(g([{ v: [[0, 0], [10, 6], [25, 6], [40, 6]], s: 'none', e: 'none' }]))), 'wrong:story-count', 'story unfinished');
eq(v(st(g([{ v: [[0, 0], [10, 6], [40, 0]], s: 'none', e: 'none' }]))), 'wrong:story-dir', 'story missing stop');
var st2 = K.graphStory({ phases: [{ dir: 'up', text: 'runs' }, { dir: 'up', text: 'walks', gentler: true }] });
eq(v(st2(g([{ v: [[0, 0], [10, 6]], s: 'none', e: 'none' }]))), 'wrong:story-speed', 'speed change missing');
// number line
eq(D.partsTex(D.numlineParts({ dots: [{ x: -2, open: false }], shade: [[-2, null]] })), 'x\\ge -2', 'numline ray');
var cn = K.numline('\\{x\\mid -2\\le x<3\\}');
eq(v(cn({ dots: [{ x: -2, open: false }, { x: 3, open: true }], shade: [[-2, 3]] })), 'correct', 'numline ok');
eq(v(cn({ dots: [{ x: -2, open: true }, { x: 3, open: true }], shade: [[-2, 3]] })), 'wrong:nl-dot', 'numline dot');
eq(v(cn({ dots: [{ x: -2, open: false }, { x: 3, open: true }], shade: [[null, -2], [3, null]] })), 'wrong:nl-side', 'numline side');
eq(D.partsTex(D.numlineParts(D.numlineKey(D.setParts(HW.sets.parse('\\{x\\mid x<1\\}').set)))), 'x<1', 'numline key');
// arrows, tiles
var ca = K.arrows([['1', '4'], ['2', '7']]);
eq(v(ca([['2', '7'], ['1', '4']])), 'correct', 'arrows ok'); eq(v(ca([['1', '4']])), 'wrong:arrows-missing', 'arrow missing');
var ct = K.tileRect('2x^2+5x+2');
eq(v(ct({ top: { x: 2, one: 1 }, side: { x: 1, one: 2 } })), 'correct', 'tile rect'); eq(v(ct({ top: { x: 1, one: 2 }, side: { x: 2, one: 1 } })), 'correct', 'tile rect turned');
eq(v(ct({ top: { x: 2, one: 2 }, side: { x: 1, one: 1 } })), 'wrong:tile-x', 'tile rect wrong split');
var cp = K.tilePoly('x^2-3x+2'); eq(v(cp({ x2: 1, x: -3, one: 2 })), 'correct', 'tile poly'); eq(v(cp({ x2: 1, x: 3, one: 2 })), 'wrong:tile-count', 'tile colour');
// builders render
var p = K.P.graph('Plot.', { x: [-5, 5], y: [-5, 5], mode: 'points' }, ce, tgt, 's', [], 't');
eq([p.input.type, /<svg/.test(p.answer), p.check(p.key).v], ['graphpad', true, 'correct'], 'graph builder');
var q = K.P.numline('Show.', { min: -5, max: 5 }, '\\{x\\mid x\\ge 1\\}', 's', [], 't');
eq([q.input.type, q.check(q.key).v], ['numline', 'correct'], 'numline builder');
console.log(n + ' checks, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
