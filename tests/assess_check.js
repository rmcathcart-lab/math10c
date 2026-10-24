// Checks ready-made tests and exit slips (HW.defineTest / HW.defineExit) the way Ryan's test mode will use them.
//   node tests/assess_check.js u2test [runs]          one test or exit slip (runs per part, default 400)
//   node tests/assess_check.js exits:u2 [runs]        every exit slip of a unit
//   node tests/assess_check.js all [runs]             every test and exit slip
// For every part, over many seeds: the key is marked correct; prompt/stem/answer/solution/hints render without KaTeX
// errors; the input type can be used in a test (no ladder / factor-tree widgets); outcome and level are set; the `bad`
// answers (if any) are not marked correct; how many different versions it makes (aim for 20+). Also: Beginning →
// Progressing → Mastery order, questions numbered 1…N, multiple choice above Progressing (flagged: Ryan caps MC at PRG
// unless it judges a reason), wrong-answer codes without a label (HW.CODES) and codes with no partial-credit decision
// (HW.PARTIAL small/big or explicitly none via HW.addPartial({code: 'n'})).
var fs = require('fs'), path = require('path'), vm = require('vm');
var root = path.join(__dirname, '..');
var ctx = { console: console, Math: Math, Date: Date, JSON: JSON, Number: Number, String: String, Array: Array, Object: Object, isFinite: isFinite, RegExp: RegExp };
ctx.window = ctx; ctx.globalThis = ctx; vm.createContext(ctx);
['assets/katex/katex.min.js', 'js/core.js', 'js/expr.js', 'js/kit.js', 'js/kitx.js', 'js/poly.js', 'js/factor.js', 'js/relfn.js', 'js/draw.js', 'js/draw2.js', 'js/lines.js', 'js/geom.js', 'js/testcore.js', 'js/partial.js'].forEach(function (f) { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); });
var files = fs.readdirSync(path.join(root, 'js/lessons')).filter(function (f) { return /\.js$/.test(f); }).sort().map(function (f) { return 'js/lessons/' + f; });
if (fs.existsSync(path.join(root, 'js/exits'))) files = files.concat(fs.readdirSync(path.join(root, 'js/exits')).filter(function (f) { return /\.js$/.test(f); }).sort().map(function (f) { return 'js/exits/' + f; }));
var loadErr = 0;
var loadMsgs = [];
files.forEach(function (f) { try { vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f }); } catch (e) { loadMsgs.push([f, e.message]); } });
var HW = ctx.HW, TC = HW.TestCore, arg = process.argv[2] || 'all', RUNS = Number(process.argv[3] || 400);
var ids = Object.keys(HW.lessons).filter(function (k) { var l = HW.lessons[k]; if (!l.test) return false; if (arg === 'all') return true; var m = /^exits:u(\d+)$/.exec(arg); if (m) return l.exit && l.unit === Number(m[1]); return k === arg; });
if (!ids.length) { console.log('nothing matches', arg); process.exit(1); }
// a file that doesn't load counts as an error only when it is one being checked (other files may be half-written)
loadMsgs.forEach(function (m) { var mine = ids.some(function (k) { var l = HW.lessons[k]; return m[0].indexOf(k.replace(/x$/, '')) >= 0 || (l && l.exit && m[0] === 'js/exits/u' + l.unit + '.js'); }) || /^exits:u(\d+)$/.test(arg) && m[0] === 'js/exits/u' + arg.slice(7) + '.js' || /lessons\/u\d+test\.js$/.test(m[0]) && m[0].indexOf(arg) >= 0;
  if (mine) loadErr++; console.log((mine ? 'LOAD ERROR ' : '(another file doesn’t load yet: ') + m[0] + ' ' + m[1] + (mine ? '' : ')')); });
var NONE = (HW.PARTIAL && HW.PARTIAL.none) || {};
var errors = 0, warns = 0, codeSeen = {};
function err(m) { errors++; console.log('  ERROR ' + m); }
function warn(m) { warns++; console.log('  warn  ' + m); }
ids.forEach(function (lid) {
  var L = HW.lessons[lid], BOX = HW.BOX_OF;
  console.log(lid + ' — ' + L.title + ' (' + L.questions.length + ' questions, ' + L.items.length + ' parts, ' + (L.calc === false ? 'no calculator' : 'calculator') + ')');
  var last = -1;
  L.questions.forEach(function (q, i) {
    if (String(q.num) !== String(i + 1)) err('Q' + q.num + ' should be numbered ' + (i + 1));
    var b = BOX[q.parts[0].level]; if (b < last) err('Q' + q.num + ' is out of Beginning → Progressing → Mastery order'); last = b;
  });
  if (L.exit && (L.items.length < 2 || L.items.length > 6)) warn('exit slip has ' + L.items.length + ' parts (aim: 2–4 questions)');
  var levels = {};
  L.items.forEach(function (it) {
    levels[it.level] = (levels[it.level] || 0) + 1;
    if (!it.outcome || !/^(AN|RF|M)\d$|^EXT$/.test(it.outcome)) err(it.id + ': outcome "' + it.outcome + '"');
    if (BOX[it.level] == null) err(it.id + ': level "' + it.level + '"');
    var seen = {}, type = null, fails = 0;
    for (var i = 0; i < RUNS; i++) {
      var inst;
      try { inst = HW.makeInstance(L, it, i * 7919 + 13, i * 104729 + 7); } catch (e) { if (fails++ < 2) err(it.id + ' seed ' + i + ': ' + e.message); continue; }
      try {
        type = inst.input && inst.input.type;
        if (!inst.prompt || !inst.solution || !inst.answer) throw new Error('missing prompt/solution/answer');
        ['prompt', 'solution', 'answer', 'stem'].forEach(function (k) { if (inst[k] && /katex-error/.test(HW.tex(inst[k]))) throw new Error('KaTeX error in ' + k + ': ' + String(inst[k]).slice(0, 160)); });
        (inst.hints || []).forEach(function (h) { if (/katex-error/.test(HW.tex(h))) throw new Error('KaTeX error in a hint'); });
        var r = inst.check(inst.key); if (!r || r.v !== 'correct') throw new Error('key not accepted: ' + JSON.stringify(inst.key) + ' → ' + JSON.stringify(r));
        (inst.bad || []).forEach(function (bd) { var rb = inst.check(bd); if (rb && rb.v === 'correct') throw new Error('a bad answer is marked correct: ' + JSON.stringify(bd)); if (rb && rb.v === 'wrong' && rb.code) codeSeen[rb.code] = codeSeen[rb.code] || lid + ':' + it.id; });
        if (type === 'mc') inst.input.options.forEach(function (o) { if (o.key !== inst.key) { var ro = inst.check(o.key); if (ro.v === 'correct') throw new Error('two MC options are right'); } });
        seen[(inst.stem || '') + '|' + inst.prompt] = 1;
      } catch (e) { if (fails++ < 2) err(it.id + ' seed ' + i + ': ' + e.message); }
    }
    var n = Object.keys(seen).length;
    if (TC.NO_TEST[type]) err(it.id + ': input type "' + type + '" can’t be used in a test');
    if (type === 'mc' && BOX[it.level] === 2) warn(it.id + ': multiple choice in the Mastery box (Ryan caps MC at Progressing unless the choice judges a reason)');
    if (n < 20 && RUNS >= 200) warn(it.id + ': only ' + n + ' different versions');
    console.log('  Q' + it.label.padEnd(8) + ' ' + it.outcome.padEnd(4) + it.level.padEnd(4) + String(type).padEnd(10) + n + ' versions');
  });
  console.log('  levels: ' + JSON.stringify(levels));
});
var P = HW.PARTIAL || { small: {}, big: {} }, unl = [], undec = [];
Object.keys(codeSeen).forEach(function (c) { if (!HW.CODES[c]) unl.push(c + ' (' + codeSeen[c] + ')'); if (!P.small[c] && !P.big[c] && !NONE[c] && !/^mc-/.test(c) && c !== 'value' && c !== 'wrong') undec.push(c); });
if (unl.length) warn('codes with no label in HW.CODES: ' + unl.join(', '));
if (undec.length) console.log('  info  codes from the bad answers with no partial-credit decision (no credit unless added): ' + undec.join(', '));
console.log((loadErr ? loadErr + ' load errors, ' : '') + errors + ' errors, ' + warns + ' warnings');
process.exit(errors || loadErr ? 1 : 0);
