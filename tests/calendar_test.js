// Class calendar logic (js/calendar.js): class days skip weekends and days off; move / skip / restore shift what follows.
// node tests/calendar_test.js
var fs = require('fs'), path = require('path'), vm = require('vm'), root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, Date: Date, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp };
ctx.window = ctx; vm.createContext(ctx);
['js/catalog.js', 'js/calendar.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx); });
var C = ctx.HW.Cal, fails = 0;
function eq(a, b, msg) { var A = JSON.stringify(a), B = JSON.stringify(b); if (A !== B) { fails++; console.log('FAIL', msg, A, '!==', B); } else console.log('ok  ', msg); }
var off = ['2026-09-07', '2026-10-12'];                        // Labour Day, Thanksgiving
eq(C.classDays('2026-09-03', off, 4), ['2026-09-03', '2026-09-04', '2026-09-08', '2026-09-09'], 'weekends and days off are skipped');
var cal = C.make('2026-09-03'), seq = C.sequence();
eq(seq.slice(0, 11), ['u1l0', 'u1l1', 'u1l2', 'u1l3', 'u1l4', 'u1l5', 'u1l6', 'u1l7', 'u1l8', 'u1l9', 't1'], 'day one, then a test after each unit');
eq(seq.length, 81, '70 lessons + the intro + 10 unit tests');
var L = C.layout(cal, off);
eq([L.dateOf.u1l1, L.dateOf.u1l4, L.dateOf.t1], ['2026-09-04', '2026-09-10', '2026-09-18'], 'dates');
// two lessons in one day: u1l5 onto u1l4's day; everything after moves up one day
var c2 = C.move(cal, 'u1l5', C.slotOf(cal, off, '2026-09-10')), L2 = C.layout(c2, off);
eq([L2.byDate['2026-09-10'], L2.dateOf.u1l6, L2.dateOf.t1], [['u1l4', 'u1l5'], '2026-09-11', '2026-09-17'], 'move earlier');
// later: u1l6 from Mon to Wed (2 class days later); what follows falls in line after it
var c3 = C.move(cal, 'u1l6', C.slotOf(cal, off, '2026-09-16')), L3 = C.layout(c3, off);
eq([L3.dateOf.u1l5, L3.dateOf.u1l6, L3.dateOf.u1l7, L3.byDate['2026-09-14'] || null], ['2026-09-11', '2026-09-16', '2026-09-17', null], 'move later leaves a gap');
// skip: everything after moves up a day
var c4 = C.skip(cal, 'u1l2'), L4 = C.layout(c4, off);
eq([L4.dateOf.u1l4, c4.skipped, L4.dateOf.u1l2 || null], ['2026-09-09', ['u1l2'], null], 'skip');
// skipping one of two on a shared day doesn't move anything
var c5 = C.skip(c2, 'u1l5'), L5 = C.layout(c5, off);
eq([L5.dateOf.u1l6], ['2026-09-11'], 'skip from a shared day');
// restore onto a busy day pushes that day back
var c6 = C.restore(c4, 'u1l2', C.slotOf(c4, off, '2026-09-08')), L6 = C.layout(c6, off);
eq([L6.dateOf.u1l2, L6.dateOf.u1l3], ['2026-09-08', '2026-09-09'], 'restore');
// adding a day off moves everything after it
var L7 = C.layout(cal, off.concat(['2026-09-09']));
eq([L7.dateOf.u1l4, L7.dateOf.u1l5], ['2026-09-11', '2026-09-14'], 'a new day off pushes lessons back');
eq(C.slotOf(cal, off, '2026-09-07'), -1, 'a day off is not a class day');
var nt = C.nextTest(cal, off, '2026-09-10'); eq([nt.key, nt.date, nt.inDays], ['t1', '2026-09-18', 6], 'next test');
var cl = C.clean({ v: 1, start: '2026-09-03', items: [['u1l1', 0], ['zzz', 1]], skipped: ['u1l2'] });
eq([cl.items[0], cl.items[1], cl.skipped, cl.items.length], [['u1l1', 0], ['u1l3', 1], ['u1l2', 'u1l0'], seq.length - 2], 'clean adds missing lessons (an old calendar skips the intro) and drops unknown ones');
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
