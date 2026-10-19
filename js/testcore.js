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
  TC.grade = function (inst, resp) {
    if (TC.blank(resp)) return { m: 'b' };
    var res; try { res = inst.check(resp); } catch (e) { return { m: 'f', code: 'unreadable' }; }
    if (!res) return { m: 'f' };
    return { m: res.v === 'correct' ? 'c' : res.v === 'form' ? 'f' : 'w', code: res.code || '' };
  };
  /* a short fingerprint of the question the student saw, saved with the answer: marking can tell if the question has changed since */
  TC.qhash = function (inst) { try { return HW.hashStr(String(inst.stem || '') + '|' + inst.prompt + '|' + inst.answer).toString(36); } catch (e) { return ''; } };
  TC.right = function (m) { return m === 'c' || m === 'C'; };
  /* score and the outcome levels (highest level answered correctly on each outcome) */
  TC.summary = function (def, marks) {
    var items = TC.items(def), LV = HW.LEVELS, best = {}, outs = [], score = 0;
    items.forEach(function (x) {
      var o = x.it.outcome; if (outs.indexOf(o) < 0) outs.push(o);
      if (TC.right(marks.charAt(x.pos))) { score++; if (best[o] == null || LV.indexOf(x.it.level) > LV.indexOf(best[o])) best[o] = x.it.level; }
    });
    return { score: score, total: items.length, levels: best, outcomes: outs };
  };
  TC.MARK_NAMES = { c: 'Correct', w: 'Wrong', f: 'Not in the right form', b: 'Blank', C: 'Correct (teacher)', W: 'Wrong (teacher)' };
})(window);
