// Script properties hold at most 9 kB each: save_/list_ split a big value (TESTLIVE on a retest day) across several.
// node tests/props_split_test.js
var fs = require('fs'), vm = require('vm'), props = {};
var ctx = { PropertiesService: { getScriptProperties: function () { return {
  getProperty: function (k) { return k in props ? props[k] : null; },
  setProperty: function (k, v) { v = String(v); if (Buffer.byteLength(v) > 9216) throw new Error('too large'); props[k] = v; },
  setProperties: function (o) { Object.keys(o).forEach(function (k) { var v = String(o[k]); if (Buffer.byteLength(v) > 9216) throw new Error('too large'); props[k] = v; }); } }; } } };
vm.createContext(ctx); vm.runInContext(fs.readFileSync(__dirname + '/../backend/Code.gs', 'utf8'), ctx);
var fails = 0; function ok(c, m) { if (!c) { fails++; console.log('FAIL', m); } }
var small = { a: 1 }; ctx.save_('X', small); ok(JSON.stringify(ctx.list_('X')) === '{"a":1}', 'small'); ok(!('X#1' in props), 'small not split');
var big = {}; for (var i = 0; i < 80; i++) big['10c-b|student ' + i + ' éèü'] = { id: 'S' + i, test: 'B-u4test', title: 'Unit 4 Test (short) — retest', kind: 'test', launched: 1795000000000 + i, ending: false, extra: {}, unlock: {}, submit: {}, who: 'Student ' + i + ' Éàü' };
ctx.save_('TESTLIVE', big); var back = ctx.list_('TESTLIVE');
ok(JSON.stringify(back) === JSON.stringify(big), 'big round trip'); ok(/__parts/.test(props.TESTLIVE), 'split marker');
console.log('TESTLIVE size', JSON.stringify(big).length, 'chars in', JSON.parse(props.TESTLIVE).__parts, 'parts');
ctx.save_('TESTLIVE', small); ok(JSON.stringify(ctx.list_('TESTLIVE')) === '{"a":1}', 'shrinks back');
console.log(fails ? fails + ' failed' : 'PASS'); process.exit(fails ? 1 : 0);
