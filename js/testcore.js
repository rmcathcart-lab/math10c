/* Test mode — shared by the student site (js/testmode.js) and the teacher dashboard (teacher/tests.js).
 * A test definition is { title, kind: 'exit'|'test', minutes, calc, shuffle, levels, items: [{ l: lessonId, i: itemId }] }.
 * Each student's numbers come from seeds built from the student, the launch (session) and the question, so they are the
 * same every time the question is shown (going back and forth, another device, the teacher's marking) and different for
 * every student and every launch. Marks are one letter per question: c correct, w wrong, f format (counts as wrong),
 * b blank; C / W are the teacher's overrides. */
(function (root) {
  'use strict';
  var HW = root.HW, TC = HW.TestCore = {};
  TC.skey = function (klass, name) { return String(klass || 'local').toLowerCase() + '|' + String(name).toLowerCase(); };
  TC.itemKey = function (x) { return x.l + ':' + x.i; };
  /* questions that cannot be written as a test question (they give step-by-step feedback as you go) */
  TC.NO_TEST = { ladder: 1, tree: 1 };
  TC.items = function (def) {
    var out = [];
    ((def && def.items) || []).forEach(function (x, pos) { // pos = place in the saved test: marks are stored by it, so a question that no longer exists doesn't shift the others
      var lesson = HW.lessons[x.l], it = lesson && lesson.byId[x.i];
      if (it) out.push({ key: TC.itemKey(x), lesson: lesson, it: it, pos: pos });
    });
    return out;
  };
  /* the parts of one booklet question that sit next to each other in the test go on one page together */
  function groupKeys(keys, byKey) {
    var groups = [], last = null;
    keys.forEach(function (k) { var x = byKey[k]; if (!x) return; var g = x.lesson.id + '#' + x.it.q.num; if (g !== last) groups.push([]); groups[groups.length - 1].push(k); last = g; });
    return groups;
  }
  function keyMap(def) { var m = {}; TC.items(def).forEach(function (x) { m[x.key] = x; }); return m; }
  /* question order for one student: shuffled question by question (parts stay together) when the test asks for it */
  TC.order = function (def, skey, sid) {
    var byKey = keyMap(def), keys = TC.items(def).map(function (x) { return x.key; });
    if (!(def && def.shuffle)) return keys;
    return [].concat.apply([], HW.rng(HW.hashStr(skey + '|' + sid + '|order')).shuffle(groupKeys(keys, byKey)));
  };
  /* a ready-made paper test keeps the paper's numbers and part letters; anything else is numbered 1, 2, 3… with the
     parts of a question lettered a, b, c (like the practice) */
  TC.paper = function (def) { var it = TC.items(def); return !(def && def.shuffle) && it.length > 0 && it.every(function (x) { return x.lesson.test && x.lesson.id === it[0].lesson.id; }); };
  /* pages: [{ num: '3', parts: [{ key, sub: 'a' | '' , label: '3a' }] }] in the given order */
  TC.pages = function (def, order) {
    var byKey = keyMap(def), paper = TC.paper(def);
    return groupKeys(order || TC.items(def).map(function (x) { return x.key; }), byKey).map(function (g, gi) {
      var x0 = byKey[g[0]], num = paper ? String(x0.it.q.num) : String(gi + 1);
      return { num: num, parts: g.map(function (k, pi) {
        var x = byKey[k], sub = '';
        if (paper) { if (x.it.q.parts.length > 1) sub = String(x.it.label).replace(/^.*?\(/, '').replace(/\)$/, ''); }
        else if (g.length > 1) sub = String.fromCharCode(97 + pi);
        return { key: k, sub: sub, label: num + (sub ? (/\s/.test(sub) ? '(' + sub + ')' : sub) : '') };
      }) };
    });
  };
  TC.labels = function (def, order) { var out = {}; TC.pages(def, order).forEach(function (p) { p.parts.forEach(function (q) { out[q.key] = q.label; }); }); return out; };
  TC.instance = function (skey, sid, lesson, it) {
    var seed = HW.hashStr(skey + '|' + sid + '|' + lesson.id + '|' + it.id), qseed = HW.hashStr(skey + '|' + sid + '|' + lesson.id + '|q' + it.q.num);
    var inst = HW.makeInstance(lesson, it, seed, qseed);
    return inst;
  };
  TC.inputType = function (lesson, it) { try { return HW.makeInstance(lesson, it, 1, 1).input.type; } catch (e) { return '?'; } };
  TC.blank = function blank(v) {
    if (v == null || v === '' || v === false) return true;
    if (typeof v === 'string') return !v.trim() || /^\s*(\\placeholder\{\})?\s*$/.test(v);
    if (typeof v === 'number') return false;
    if (Array.isArray(v)) return v.every(blank);
    if (typeof v === 'object') { var ks = Object.keys(v); return !ks.length || ks.every(function (k) { return blank(v[k]); }); }
    return false;
  };
  /* marks: c right · s small recognized mistake (keeps 2/3) · f right value, wrong form (2/3) · g bigger but reasonable
     mistake (1/3) · w wrong · b blank; the teacher's overrides are C (1) T (2/3) O (1/3) W (0). Multiple choice is right or
     wrong. Which recognized mistakes are small or bigger: js/partial.js (HW.PARTIAL). */
  TC.CREDIT = { c: 1, C: 1, s: 2 / 3, T: 2 / 3, f: 2 / 3, g: 1 / 3, O: 1 / 3, w: 0, W: 0, b: 0 };
  TC.credit = function (m) { return TC.CREDIT[m] || 0; };
  TC.grade = function (inst, resp) {
    if (TC.blank(resp)) return { m: 'b' };
    var res; try { res = inst.check(resp); } catch (e) { return { m: 'w', code: 'unreadable' }; }
    if (!res) return { m: 'w' };
    if (res.v === 'correct') return { m: 'c' };
    var mc = inst.input && inst.input.type === 'mc', P = HW.PARTIAL || {};
    if (res.v === 'form') return { m: mc ? 'w' : 'f', code: res.code || '' };
    var code = res.code || '';
    if (!mc && P.small && P.small[code]) return { m: 's', code: code };
    if (!mc && P.big && P.big[code]) return { m: 'g', code: code };
    return { m: 'w', code: code };
  };
  /* a short fingerprint of the question the student saw, saved with the answer: marking can tell if the question has changed since */
  TC.qhash = function (inst) { try { return HW.hashStr(String(inst.stem || '') + '|' + inst.prompt + '|' + inst.answer).toString(36); } catch (e) { return ''; } };
  TC.right = function (m) { return m === 'c' || m === 'C'; };
  TC.over = function (m) { return m === 'C' || m === 'T' || m === 'O' || m === 'W'; };
  TC.SYMBOL = { c: '✓', C: '✓', s: '⅔', T: '⅔', f: '⅔', g: '⅓', O: '⅓', w: '✗', W: '✗', b: '–' };
  TC.MARK_NAMES = { c: 'Correct', C: 'Correct (teacher)', s: 'Small mistake: keeps 2/3', T: '2/3 credit (teacher)', f: 'Not in the right form: keeps 2/3', g: 'Bigger mistake: keeps 1/3', O: '1/3 credit (teacher)', w: 'Wrong', W: 'Wrong (teacher)', b: 'Blank' };
  /* saved marks = one letter per question in the test's order, then "|AN1=PRG,AN2=ADV" for indicators the teacher set */
  TC.parseMarks = function (str) {
    str = String(str || ''); var i = str.indexOf('|'), fin = {};
    if (i >= 0) str.slice(i + 1).split(',').forEach(function (kv) { var p = kv.split('='); if (p[0] && p[1]) fin[p[0]] = p[1]; });
    return { m: i >= 0 ? str.slice(0, i) : str, fin: fin };
  };
  TC.packMarks = function (m, fin) { var k = Object.keys(fin || {}).filter(function (o) { return fin[o]; }); return m + (k.length ? '|' + k.map(function (o) { return o + '=' + fin[o]; }).join(',') : ''); };
  /* exit slips: the highest level answered correctly on each outcome, and the number right */
  TC.summary = function (def, marks) {
    marks = TC.parseMarks(marks).m;
    var items = TC.items(def), LV = HW.LEVELS, best = {}, outs = [], score = 0;
    items.forEach(function (x) {
      var o = x.it.outcome; if (outs.indexOf(o) < 0) outs.push(o);
      if (TC.right(marks.charAt(x.pos))) { score++; if (best[o] == null || LV.indexOf(x.it.level) > LV.indexOf(best[o])) best[o] = x.it.level; }
    });
    return { score: score, total: items.length, levels: best, outcomes: outs };
  };

  /* ---------------- tests: an indicator per outcome from its three boxes (Ryan's rule, 2026-10-19) ----------------
   * Each outcome's parts fall in a Beginning (LIM, BEG), Progressing (EMG, PRG) or Mastery (ADV, MAS) box. A box is
   * secure at 3/4 of its points and partial at 1/2. Ladder: NM < LIM (B partial) < BEG (B secure) < EMG (+P partial) <
   * PRG (+P secure) < ADV (+M partial) < MAS (+M secure). A harder box done well over a hole in an easier one: credit the
   * harder box, then one step down per partial easier box and two per box below half, flagged "Check this". The percent
   * sits in the indicator's band by progress toward the next rung (a stepped-down result: the band's middle). Mastery-box
   * multiple choice counts fully only when the student has at least half of the box's other points; otherwise half.
   * The unit grade is the average of the outcome percents (EXT outcomes left out). */
  TC.SECURE = 3 / 4; TC.PARTIAL = 1 / 2;
  TC.BANDS = { NM: [0, 25], LIM: [25, 45], BEG: [45, 55], EMG: [55, 65], PRG: [65, 75], ADV: [75, 85], MAS: [85, 100] };
  TC.LADDER = ['NM', 'LIM', 'BEG', 'EMG', 'PRG', 'ADV', 'MAS'];
  TC.indName = function (lv) { return (HW.LEVEL_NAMES && HW.LEVEL_NAMES[lv]) || (lv === 'NM' ? 'Not meeting' : lv); };
  TC.BOX = { LIM: 'B', BEG: 'B', EMG: 'P', PRG: 'P', ADV: 'M', MAS: 'M' };
  var typeMemo = {};
  function isMC(x) { var k = x.key; if (!(k in typeMemo)) typeMemo[k] = TC.inputType(x.lesson, x.it) === 'mc'; return typeMemo[k]; }
  function rung(b, p, m) { // [ladder index, progress 0..1 inside its band]
    var S = TC.SECURE, H = TC.PARTIAL;
    if (b < H) return [0, b / H]; if (b < S) return [1, (b - H) / (S - H)];
    if (p < H) return [2, p / H]; if (p < S) return [3, (p - H) / (S - H)];
    if (m < H) return [4, m / H]; if (m < S) return [5, (m - H) / (S - H)];
    return [6, (m - S) / (1 - S)];
  }
  function stepsFor(f) { return f >= TC.SECURE ? 0 : f >= TC.PARTIAL ? 1 : 2; }
  TC.indicator = function (b, p, m) {
    var r = rung(b, p, m), best = { i: r[0], prog: r[1], note: '' };
    var cands = [];
    if (m >= TC.PARTIAL) cands.push([rung(1, 1, m)[0], stepsFor(b) + stepsFor(p)]);
    if (p >= TC.PARTIAL) cands.push([rung(1, p, 0)[0], stepsFor(b)]);
    cands.forEach(function (c) { var f = c[0] - c[1]; if (f > best.i) best = { i: f, prog: 0.5, note: 'Check this: ' + c[1] + ' step' + (c[1] === 1 ? '' : 's') + ' down from ' + TC.LADDER[c[0]] + ' for a hole in an easier box' }; });
    var name = TC.LADDER[best.i], band = TC.BANDS[name];
    return { ind: name, pct: Math.round(band[0] + (band[1] - band[0]) * Math.max(0, Math.min(1, best.prog))), note: best.note };
  };
  TC.midPct = function (ind) { var b = TC.BANDS[ind]; return b ? Math.round((b[0] + b[1]) / 2) : 0; };
  TC.outcomeGrades = function (def, marksStr) {
    var pm = TC.parseMarks(marksStr), marks = pm.m, items = TC.items(def), by = {}, order = [];
    items.forEach(function (x) {
      var o = x.it.outcome; if (!by[o]) { by[o] = { B: [], P: [], M: [] }; order.push(o); }
      by[o][TC.BOX[x.it.level] || 'B'].push(x);
    });
    var outs = order.map(function (o) {
      var bx = by[o], box = {};
      ['B', 'P', 'M'].forEach(function (k) {
        var list = bx[k], total = list.length, earned = 0;
        if (k === 'M') {
          var other = list.filter(function (x) { return !isMC(x); }), oT = other.length, oE = 0;
          other.forEach(function (x) { oE += TC.credit(marks.charAt(x.pos)); });
          var agree = !oT || oE >= TC.PARTIAL * oT, mcE = 0;
          list.filter(isMC).forEach(function (x) { mcE += TC.credit(marks.charAt(x.pos)) * (agree ? 1 : 0.5); });
          earned = oE + mcE; box.mcHalved = !agree && list.some(isMC);
        } else list.forEach(function (x) { earned += TC.credit(marks.charAt(x.pos)); });
        box[k] = { earned: earned, total: total };
      });
      // a missing box: counts as done when a harder box is on the test (it can't penalize), else as empty (it caps)
      function frac(k, harder) { var t = box[k].total; if (t) return box[k].earned / t; return harder.some(function (h) { return box[h].total; }) ? 1 : 0; }
      var g = TC.indicator(frac('B', ['P', 'M']), frac('P', ['M']), frac('M', []));
      var fin = pm.fin[o];
      return { outcome: o, boxes: box, auto: g.ind, autoPct: g.pct, note: g.note, mcHalved: box.mcHalved, ind: fin || g.ind, pct: fin ? (fin === g.ind ? g.pct : TC.midPct(fin)) : g.pct, set: !!fin };
    });
    var counted = outs.filter(function (x) { return x.outcome !== 'EXT'; }), points = 0;
    items.forEach(function (x) { points += TC.credit(marks.charAt(x.pos)); });
    return { outcomes: outs, unit: counted.length ? Math.round(counted.reduce(function (a, x) { return a + x.pct; }, 0) / counted.length) : 0, points: Math.round(points * 100) / 100, total: items.length };
  };
  TC.fmtPoints = function (p) { var w = Math.floor(p + 1e-9), f = p - w; return (w || !f ? String(w) : '') + (Math.abs(f - 1 / 3) < 0.02 ? '⅓' : Math.abs(f - 2 / 3) < 0.02 ? '⅔' : Math.abs(f - 0.5) < 0.02 ? '½' : Math.abs(f - 1 / 6) < 0.02 ? '⅙' : Math.abs(f - 5 / 6) < 0.02 ? '⅚' : f > 0.02 ? '.' + Math.round(f * 100) : ''); };
})(window);
