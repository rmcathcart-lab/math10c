// Checks js/draw2.js (number placement, set sorting, domain/range lines, area boxes, tapped points, take-away tiles).
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp, Error: Error };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js', 'js/poly.js', 'js/factor.js', 'js/relfn.js', 'js/draw.js', 'js/draw2.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
var HW = ctx.HW, K = HW.kit, D = HW.draw, fails = 0, n = 0;
function eq(a, b, msg) { n++; if (JSON.stringify(a) !== JSON.stringify(b)) { fails++; console.log('FAIL', msg, '\n   got ', JSON.stringify(a), '\n   want', JSON.stringify(b)); } }
function res(r) { return r.v === 'correct' ? 'correct' : r.v + ':' + r.code; }
// numplace
var T = { a: Math.sqrt(20), b: -2.5, c: 0.75 }, np = K.numplace(T, { min: -5, max: 5, tex: { a: '\\sqrt{20}', b: '-2.5', c: '\\frac{3}{4}' } });
eq(res(np({ a: 4.5, b: -2.5, c: 0.8 })), 'correct', 'np right');
eq(res(np({ a: 4.5, b: -2.5 })), 'form:np-unplaced', 'np unplaced');
eq(res(np({})), 'form:empty', 'np empty');
eq(res(np({ a: 4.5, b: 0.8, c: -2.5 })), 'wrong:np-order', 'np order');
eq(res(np({ a: 3.6, b: -2.5, c: 0.8 })), 'wrong:np-place', 'np place');
var pp = K.P.numplace('Place', { min: -5, max: 5, items: [{ id: 'a', tex: '\\sqrt{20}' }, { id: 'b', tex: '-2.5' }, { id: 'c', tex: '\\frac{3}{4}' }] }, T, 's', [], 't');
eq(res(pp.check(pp.key)), 'correct', 'np key'); eq(pp.bad.map(function (b) { return pp.check(b).v; }), ['wrong'], 'np bad');
eq(/√20/.test(pp.answer) && /3\/4/.test(pp.answer) && /−2.5/.test(pp.answer), true, 'np svg labels');
eq(D.texPlain('-\\sqrt[3]{9}'), '−∛9', 'texPlain cube root');
// setsort
eq([D.realSet(3), D.realSet(0), D.realSet(-4), D.realSet([2, 3]), D.realSet(2, true)], ['N', 'W', 'I', 'Q', 'Qbar'], 'realSet');
var ss = K.setsort({ z: 'W', n: 'I', h: 'Q', r: 'Qbar', s: 'N' }, { tex: { z: '0', n: '-3', h: '\\frac{1}{2}', r: '\\sqrt{7}', s: '\\sqrt{9}' } });
var good = { z: 'W', n: 'I', h: 'Q', r: 'Qbar', s: 'N' };
eq(res(ss(good)), 'correct', 'ss right');
eq(res(ss(Object.assign({}, good, { z: 'N' }))), 'wrong:ss-subset', 'ss 0 natural');
eq(res(ss(Object.assign({}, good, { s: 'Q' }))), 'wrong:ss-inner', 'ss not innermost');
eq(res(ss(Object.assign({}, good, { s: 'Qbar' }))), 'wrong:ss-rational', 'ss sqrt9 irrational');
eq(res(ss({ z: 'W' })), 'form:ss-unplaced', 'ss unplaced');
eq(/Irrational numbers/.test(D.setsortHtml({ items: [{ id: 'z', tex: '0' }] }, { z: 'W' })), true, 'ss html');
// domrange
var dr = K.domrange('\\{x\\mid -3\\le x\\le 4\\}', '\\{y\\mid -2\\le y<5\\}');
var nl = function (lo, lc, hi, hc) { return { dots: [{ x: lo, open: !lc }, { x: hi, open: !hc }], shade: [[lo, hi]] }; };
eq(res(dr({ domain: nl(-3, 1, 4, 1), range: nl(-2, 1, 5, 0) })), 'correct', 'dr right');
eq(res(dr({ domain: nl(-2, 1, 5, 0), range: nl(-3, 1, 4, 1) })), 'wrong:dr-swap', 'dr swap');
eq(res(dr({ domain: nl(-3, 1, 4, 1), range: nl(-2, 1, 5, 1) })), 'wrong:dr-nl-dot', 'dr range dot');
eq(res(dr({ domain: nl(-3, 1, 4, 1), range: { dots: [], shade: [] } })), 'form:dr-norange', 'dr no range');
var pdr = K.P.domrange('d', { graph: { x: [-6, 6], y: [-6, 6] } }, '\\{x\\mid -3\\le x\\le 4\\}', '\\{y\\mid -2\\le y<5\\}', 's', [], 't');
eq(res(pdr.check(pdr.key)), 'correct', 'dr key'); eq(pdr.bad.map(function (b) { return pdr.check(b).v === 'correct'; }), [false, false], 'dr bad');
// graphPoints
var gp = K.graphPoints([[-2, 0], [3, 0]], { what: 'x-intercept' });
eq(res(gp({ pts: [[3, 0], [-2, 0]] })), 'correct', 'gp right');
eq(res(gp({ pts: [[3, 0]] })), 'wrong:pts-missing', 'gp missing');
eq(res(gp({ pts: [[3, 0], [0, -6]] })), 'wrong:pts-extra', 'gp extra');
eq(res(gp({ pts: [[0, 3], [-2, 0]] })), 'wrong:graph-swap', 'gp swap');
eq(res(gp({ pts: [] })), 'form:empty', 'gp empty');
var gp2 = K.P.points('Tap', { x: [-6, 6], y: [-8, 8], bg: { fns: [] } }, [[-2, 0], [3, 0]], 's', [], 't', { what: 'x-intercept' });
eq([gp2.input.mode, res(gp2.check(gp2.key))], ['points', 'correct'], 'gp builder');
// take-away tiles
var ta = K.tileTakeaway({ x: 2, one: 1 }, { x: 3, one: -2 });
eq(res(ta({ raw: { mat: ['-x', '1', '1', '1'], away: ['x', 'x', 'x', '-1', '-1'] } })), 'correct', 'ta right');
eq(res(ta({ raw: { mat: [], away: ['x', 'x', 'x', '-1', '-1', '1', '-1'] } })), 'wrong:tile-away-zero', 'ta extra zero pair');
eq(res(ta({ raw: { mat: [], away: ['x', 'x'] } })), 'wrong:tile-away', 'ta wrong');
eq(res(ta({ raw: { mat: [], away: [] } })), 'form:empty', 'ta empty');
var pta = K.P.tiles('Take away', { takeaway: true, start: { x: 2, one: 1 } }, '3x-2', 's', [], 't', { x: -1, one: 3, away: { x: 3, one: -2 }, raw: { mat: ['-x', '1', '1', '1'], away: ['x', 'x', 'x', '-1', '-1'] } });
eq(res(pta.check(pta.key)), 'correct', 'ta builder'); eq(/Taken away/.test(pta.answer), true, 'ta svg');
// areabox: expansion with given heads
var ab = K.areabox({ product: '6x^2-5x-6' }), V = function (cells, rows, cols) { return { rows: rows || ['2x', '-3'], cols: cols || ['3x', '2'], cells: cells }; };
eq(res(ab(V([['6x^{2}', '4x'], ['-9x', '-6']]))), 'correct', 'ab right');
eq(res(ab(V([['6x^{2}', '4x'], ['9x', '-6']]))), 'wrong:ab-sign', 'ab sign (expansion: per box first)');
eq(res(K.areabox({})(V([['6x^{2}', '4x'], ['9x', '-6']]))), 'wrong:ab-sign', 'ab sign');
eq(res(K.areabox({})(V([['6x', '4x'], ['-9x', '-6']]))), 'wrong:ab-exp', 'ab exponent');
eq(res(K.areabox({})(V([['6x^{2}', '2x+2'], ['-9x', '-6']]))), 'wrong:ab-one-term', 'ab one term');
eq(res(K.areabox({})(V([['6x^{2}', '4x'], ['-9x', '']]))), 'form:empty', 'ab empty');
eq(res(K.areabox({})(V([['6x^{2}', '2\\times2x'], ['-9x', '-6']]))), 'form:ab-simplify', 'ab simplify');
// areabox: factoring with heads typed — any valid sign choice
var abf = K.areabox({ product: '6x^2-5x-6', factor: true });
eq(res(abf(V([['6x^{2}', '4x'], ['-9x', '-6']], ['-2x', '3'], ['-3x', '-2']))), 'correct', 'ab factor other signs');
eq(res(abf(V([['6x^{2}', '-9x'], ['4x', '-6']], ['3x', '2'], ['2x', '-3']))), 'correct', 'ab factor transposed');
eq(res(abf(V([['6x^{2}', '4x'], ['-9x', '-6']], ['2x', '3'], ['3x', '2']))), 'wrong:ab-sign', 'ab factor bad head sign');
eq(res(abf(V([['6x^{2}', '2x'], ['-9x', '-6']], ['2x', '-3'], ['3x', '1']))), 'wrong:ab-sum', 'ab factor wrong middle box');
var pab = K.P.areabox('Expand', { rows: ['2x', '-3'], cols: ['3x', '2'], cells: [[null, null], [null, null]] }, { product: '6x^2-5x-6' }, V([['6x^{2}', '4x'], ['-9x', '-6']]), 's', [], 't');
eq(res(pab.check(pab.key)), 'correct', 'ab builder'); eq(/ab-table/.test(pab.answer), true, 'ab html');
eq(res(abf(V([['6x^{2}', '4x'], ['-9x', '-6']], ['x', '-\\frac{3}{2}'], ['6x', '4']))), 'wrong:ab-frac', 'ab factor fractions rejected');
eq(res(K.tileRect('x^2-6x+8')({ top: { x: 1, one: 2 }, side: { x: 1, one: 4 } })), 'wrong:tile-signs', 'tile signs switched');
console.log(n + ' checks, ' + fails + ' failed');
process.exit(fails ? 1 : 0);
