// node tests/cap_levels_test.js — practice levels capped by the practice done (js/calendar.js C.capLevels, 2026-11-19)
global.window = global; global.HW = { LEVELS: ['LIM','BEG','EMG','PRG','ADV','MAS'], NO_LEVEL: { EXT: 1 } };
require('vm').runInThisContext(require('fs').readFileSync(require('path').join(__dirname, '..', 'js', 'calendar.js'), 'utf8'));
var C = HW.Cal, n = 0, f = 0;
function eq(a, b, m) { n++; if (JSON.stringify(a) !== JSON.stringify(b)) { f++; console.log('FAIL', m, JSON.stringify(a), '!=', JSON.stringify(b)); } }
// 2 lessons, outcome AN5: L1 has 8 required + 2 extra, L2 has 4 required (one MAS)
function items(n0, k, lv) { var a = []; for (var i = 0; i < k; i++) a.push({ id: n0 + i, outcome: 'AN5', level: lv || 'BEG', extra: false }); return a; }
HW.lessons = { l1: { id: 'l1', items: items('a', 8).concat([{ id: 'x1', outcome: 'AN5', level: 'MAS', extra: true }, { id: 'x2', outcome: 'AN5', level: 'MAS', extra: true }]) },
               l2: { id: 'l2', items: items('b', 3).concat([{ id: 'm', outcome: 'AN5', level: 'MAS' }]) },
               ext: { id: 'ext', items: [{ id: 'e', outcome: 'EXT', level: 'BEG' }] } };
HW.CATALOG = [{ unit: 4, lessons: [{ id: 'l1' }, { id: 'l2' }, { id: 'ext' }] }];
function run(best, taught, started, doneSet) { return C.capLevels(best, { taught: taught, started: function (l) { return started.indexOf(l) >= 0; }, done: function (l, id) { return doneSet.indexOf(l + ':' + id) >= 0; } }); }
// only did the Mastery question in l2 (started l2, nothing taught yet): 1/4 done = 25% → Emerging cap
var r = run({ AN5: 'MAS' }, {}, ['l2'], ['l2:m']); eq([r.AN5.level, r.AN5.done, r.AN5.req, r.AN5.need], ['EMG', 1, 4, 2], 'only the mastery q, l2 started');
// l1 taught too: 1/12 → under 25% → Beginning
r = run({ AN5: 'MAS' }, { l1: 1 }, ['l2'], ['l2:m']); eq([r.AN5.level, r.AN5.capped, r.AN5.req], ['BEG', true, 12], 'l1 taught');
// 9/12 = 75% → full
var d = ['l2:m', 'l2:b0', 'l2:b1', 'l2:b2', 'l1:a0', 'l1:a1', 'l1:a2', 'l1:a3', 'l1:a4']; r = run({ AN5: 'MAS' }, { l1: 1 }, ['l2'], d); eq([r.AN5.level, r.AN5.capped], ['MAS', false], '75%');
// 6/12 = 50% → Progressing
r = run({ AN5: 'MAS' }, { l1: 1 }, ['l2'], d.slice(0, 6)); eq(r.AN5.level, 'PRG', '50%');
// extra questions don't count; a lower level is never raised
r = run({ AN5: 'BEG' }, { l1: 1 }, ['l2'], ['l1:x1', 'l1:x2']); eq([r.AN5.level, r.AN5.capped, r.AN5.done], ['BEG', false, 0], 'extras, low level');
// LIM stays LIM under a BEG cap
r = run({ AN5: 'LIM' }, { l1: 1 }, [], []); eq(r.AN5.level, 'LIM', 'LIM');
// no practice counted (nothing taught/started): no cap
r = run({ AN5: 'ADV' }, {}, [], []); eq([r.AN5.level, r.AN5.req], ['ADV', 0], 'no req');
// taughtBefore: days before today only, skipped excluded
var cal = { v: 1, start: '2026-11-02', items: [['l1', 0], ['l2', 1], ['ext', 2]], skipped: ['l2'] };
eq(Object.keys(C.taughtBefore(cal, [], '2026-11-04')), ['l1'], 'taught before');
eq(Object.keys(C.taughtBefore(cal, [], '2026-11-02')), [], 'today not yet');
console.log(n + ' checks, ' + f + ' failed');
