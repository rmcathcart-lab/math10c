// Compares each unit test with its short version (def.short in js/lessons/uNtest.js → test 'uNtests').
// For every outcome: parts in the Beginning / Progressing / Mastery boxes, full → short, and a rough working time
// (Beginning part 1.5 min, Progressing 3, Mastery 5). Flags a box the full test has but the short one dropped, a
// Beginning or Progressing box left with one part where the full test had 3+ (a Mastery box may keep one part), and a short test far from half the time.
// node tests/short_report.js [testId] [--list]   (--list prints each question's text, level and lesson tag)
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, Date: Date, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js', 'js/poly.js', 'js/factor.js', 'js/relfn.js', 'js/draw.js', 'js/draw2.js', 'js/lines.js', 'js/geom.js'].forEach(function (f) { if (fs.existsSync(path.join(root, f))) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
fs.readdirSync(path.join(root, 'js/lessons')).filter(function (f) { return /test\.js$/.test(f); }).sort().forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, 'js/lessons', f), 'utf8'), ctx, { filename: f }); });
var HW = ctx.HW, only = process.argv[2] && process.argv[2][0] !== '-' ? process.argv[2] : null, list = process.argv.indexOf('--list') > 0;
var MIN = [1.5, 3, 5], problems = 0;
function tally(L) {
  var by = {}, t = 0;
  L.items.forEach(function (it) { var b = HW.BOX_OF[it.level], o = it.outcome; by[o] = by[o] || [0, 0, 0]; by[o][b]++; t += MIN[b]; });
  return { by: by, min: Math.round(t), parts: L.items.length, qs: L.questions.length };
}
Object.keys(HW.lessons).filter(function (k) { return HW.lessons[k].test && !HW.lessons[k].exit && !HW.lessons[k].shortOf && (!only || k === only); }).sort(function (a, b) { return HW.lessons[a].unit - HW.lessons[b].unit; }).forEach(function (id) {
  var F = HW.lessons[id], S = HW.lessons[id + 's'], f = tally(F);
  console.log('\n' + id + '  full: ' + f.qs + ' questions, ' + f.parts + ' parts, ~' + f.min + ' min');
  if (list) F.questions.forEach(function (q) {
    var st = q.stem || q.text || q.prompt || '', txt = String(typeof st === 'function' ? '(generated) ' + q.parts.map(function (p) { return typeof p.prompt === 'string' ? p.prompt : ''; }).join(' | ') : st).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 90);
    console.log('   Q' + q.num + ' [' + q.parts.map(function (p) { return p.level + '/' + (p.outcome || q.outcome || F.outcome); }).join(' ') + ']' + (q.lesson ? ' ' + q.lesson : '') + '  ' + txt);
  });
  if (!S) { console.log('   (no short version)'); return; }
  var s = tally(S);
  console.log('  short: ' + s.qs + ' questions, ' + s.parts + ' parts, ~' + s.min + ' min (' + Math.round(100 * s.min / f.min) + '% of the time)  keeps ' + F.short.join(', '));
  Object.keys(f.by).forEach(function (o) {
    var a = f.by[o], b = s.by[o] || [0, 0, 0], flag = [];
    [0, 1, 2].forEach(function (k) { if (a[k] && !b[k]) flag.push(HW.BOX_NAMES[k] + ' box dropped'); else if (k < 2 && a[k] >= 3 && b[k] < 2) flag.push(HW.BOX_NAMES[k] + ' box down to ' + b[k] + ' part'); });
    if (flag.length) problems++;
    console.log('   ' + o + '  B ' + a[0] + '→' + b[0] + '  P ' + a[1] + '→' + b[1] + '  M ' + a[2] + '→' + b[2] + (flag.length ? '   ⚠ ' + flag.join('; ') : ''));
  });
  var pct = s.min / f.min; if (pct < 0.38 || pct > 0.62) { problems++; console.log('   ⚠ short version is ' + Math.round(100 * pct) + '% of the full time (aim: about half)'); }
});
console.log('\n' + problems + ' problem(s)');
