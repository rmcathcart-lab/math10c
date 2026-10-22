/* Teacher Ledger — report card comments.
 * The school's guidelines (RVS): a comment speaks to the learning in the course and to the opportunities for growth that
 * assessment found. The usual shape: a course-content part (the same for the class) and a personal part with one area
 * of strength and one area for growth; students on an IPP also get the required IPP sentence, word for word.
 * Example the school gives: "In English 20-1 we have focused on … Our study of Macbeth was a highlight of the term and one
 * in which Philip showed particular interest and strength. In his formal writing, Philip organizes his thoughts well, but
 * at times does not provide the details required to fully explore a concept."
 * Not for comments: streaming recommendations.
 *
 * HW.Comments.course(courseName, units) → the course part.
 * HW.Comments.personal(st) → { text, strength, growth } where st = { name, pronouns: he | she | they | '', ipp,
 *   strength: { outcome, level, src: test | practice | exit, unit, skill (a lesson id) }, growth: { …, noWork } }
 * Wording is picked by the student's name, so neighbours in the list don't read the same. */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {}, C = HW.Comments = {};

  /* what each unit was about (the course part) */
  C.UNITS = { 1: ['prime factorization', 'irrational numbers'], 2: ['the exponent laws'], 3: ['multiplying polynomials'],
    4: ['factoring'], 5: ['graphs of relations', 'function notation'], 6: ['slope'], 7: ['equations of lines'], 8: ['linear systems'],
    9: ['right-triangle trigonometry'], 10: ['unit conversions', 'surface area', 'volume'] };
  /* each outcome as a parent would read it (Alberta Math 10 C program of studies) */
  C.TOPIC = {
    AN1: 'factors, multiples and roots of whole numbers',
    AN2: 'irrational numbers and radicals',
    AN3: 'powers and the exponent laws',
    AN4: 'multiplying polynomials',
    AN5: 'factoring polynomials',
    RF1: 'interpreting graphs of real-world situations',
    RF2: 'relations and functions, including domain and range',
    RF3: 'slope',
    RF4: 'representing linear relations with tables, graphs and equations',
    RF5: 'the characteristics of linear graphs, such as intercepts and slope',
    RF6: 'the different forms of a linear equation',
    RF7: 'determining the equation of a line',
    RF8: 'function notation',
    RF9: 'solving systems of linear equations',
    M1: 'linear measurement and estimation',
    M2: 'converting between SI and imperial units',
    M3: 'surface area and volume',
    M4: 'right-triangle trigonometry'
  };
  /* each lesson as one skill (review lessons have none: they mix everything) */
  C.SKILL = {
    u1l1: 'finding prime factorizations', u1l2: 'using prime factorization to find the GCF and LCM', u1l3: 'telling rational numbers from irrational numbers',
    u1l4: 'classifying numbers in the real number system', u1l5: 'finding square roots and cube roots', u1l6a: 'converting between entire and mixed radicals',
    u1l6b: 'simplifying cube roots and higher-index radicals',
    u2l1: 'applying the exponent laws', u2l2: 'simplifying expressions with several exponent laws', u2l3: 'working with negative exponents',
    u2l4: 'scientific notation', u2l5a: 'converting between rational exponents and radicals', u2l5b: 'simplifying expressions with rational exponents',
    u3l1: 'adding and subtracting polynomials', u3l2: 'multiplying monomials and binomials', u3l3: 'special products such as squaring a binomial',
    u3l4: 'multiplying a binomial by a trinomial', u3l5: 'using polynomial products to find area and volume',
    u4l1a: 'factoring out the greatest common factor', u4l1b: 'factoring by grouping', u4l2: 'factoring trinomials of the form x² + bx + c',
    u4l3: 'factoring a difference of squares', u4l4: 'factoring trinomials of the form ax² + bx + c', u4l5: 'factoring completely in more than one step',
    u4l6: 'choosing a factoring strategy', u4l7: 'solving polynomial equations by factoring',
    u5l1: 'describing patterns and variables on the Cartesian plane', u5l2: 'describing the relationship between two quantities', u5l3: 'finding where a graph meets the axes',
    u5l4: 'determining domain and range', u5l5: 'using a graphing calculator to study relations', u5l6: 'modelling real-world relations with a graphing calculator',
    u5l7a: 'deciding whether a relation is a function', u5l7b: 'using function notation', u5l8: 'using function notation with graphs and models',
    u5l9: 'interpreting and sketching graphs of real situations',
    u6l1: 'finding the length of a line segment', u6l2: 'using the distance and midpoint formulas', u6l3: 'finding the slope of a line segment',
    u6l4: 'using slope to identify parallel and perpendicular lines', u6l5: 'describing the characteristics of linear graphs',
    u7l1: 'graphing lines in slope-intercept form', u7l2: 'writing equations in the form y = mx + b', u7l3: 'working with the general form of a linear equation',
    u7l4: 'using slope-point form to write the equation of a line', u7l5: 'graphing linear equations in any form', u7l6: 'interpreting slope as a rate of change',
    u8l1a: 'solving systems of equations by graphing', u8l1b: 'deciding how many solutions a system has', u8l2: 'solving systems by substitution',
    u8l3: 'solving systems by elimination', u8l4: 'solving word problems with systems of equations', u8l5: 'solving mixture and motion problems with systems',
    u9l1: 'setting up the sine, cosine and tangent ratios', u9l2: 'finding trigonometric ratios with a calculator', u9l3: 'finding a missing side of a right triangle',
    u9l4: 'finding a missing angle of a right triangle', u9l5: 'solving right triangles completely', u9l6: 'solving problems with angles of elevation and depression',
    u9l7: 'solving problems that chain right triangles together',
    u10l1: 'rounding and substituting into formulas', u10l2: 'estimating lengths with personal referents', u10l3: 'reading precise measuring instruments',
    u10l4a: 'converting units within the metric system', u10l4b: 'converting between imperial and SI units', u10l5: 'converting square and cubic units',
    u10l6: 'finding the surface area and volume of prisms and cylinders', u10l7: 'finding the surface area and volume of pyramids and cones',
    u10l8: 'finding the surface area and volume of spheres'
  };
  var LADDER = ['NM', 'LIM', 'BEG', 'EMG', 'PRG', 'ADV', 'MAS'];
  var LNAME = { NM: 'Not Meeting', LIM: 'Limited', BEG: 'Beginning', EMG: 'Emerging', PRG: 'Progressing', ADV: 'Advancing', MAS: 'Mastery' };
  C.LADDER = LADDER; C.LNAME = LNAME;

  function hash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function list(xs) { return xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ' and ' + xs[xs.length - 1]; }
  C.firstName = function (name) { return String(name || '').trim().split(/\s+/)[0] || 'This student'; };

  /* pronoun forms; with none set, the student's first name stands in */
  C.forms = function (name, pr) {
    var f = C.firstName(name);
    if (pr === 'he') return { first: f, subj: 'he', obj: 'him', poss: 'his', s: true };
    if (pr === 'she') return { first: f, subj: 'she', obj: 'her', poss: 'her', s: true };
    if (pr === 'they') return { first: f, subj: 'they', obj: 'them', poss: 'their', s: false };
    return { first: f, subj: f, obj: f, poss: f + '’s', s: true, none: true };
  };
  /* a verb that agrees with the subject pronoun: v(P, 'find') → finds / find */
  function v(P, base) {
    if (!P.s) return base;
    if (base === 'be') return 'is'; if (base === 'have') return 'has'; if (base === 'do') return 'does';
    if (/(s|sh|ch|x|z)$/.test(base)) return base + 'es';
    if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + 'ies';
    return base + 's';
  }
  function be(P) { return P.s ? 'is' : 'are'; }

  C.course = function (courseName, units) {
    var t = []; (units || []).forEach(function (u) { (C.UNITS[u] || []).forEach(function (x) { if (t.indexOf(x) < 0) t.push(x); }); });
    var name = courseName || 'Mathematics 10C';
    if (!t.length) return 'In ' + name + ' this semester, we have built a foundation in number, algebra and measurement.';
    return 'In ' + name + ' this semester, we have focused on ' + list(t) + '.';
  };
  function group(lv) { var i = LADDER.indexOf(lv); return i >= 5 ? 'high' : i >= 3 ? 'mid' : 'low'; }
  function sgroup(lv) { var i = LADDER.indexOf(lv); return i >= 5 ? 'high' : i === 4 ? 'mid' : i === 3 ? 'emg' : 'low'; }

  /* ---- templates ----
   * {First} {first} the first name; {Subj} {subj} {obj} {poss} pronoun forms (the name when none is set); {v:verb} a verb
   * that agrees (handles / handle); {be} is / are; {have} has / have; {topic} the outcome; {skill} the lesson skill;
   * {esp} ", especially <skill>" (or nothing); {espc} the same with a closing comma; {what} the skill, else the outcome;
   * {L} the level name; {unit} the unit number (a test). A template that needs {skill}, {L} or {unit} is skipped when it
   * isn't known; one starting with ~ is skipped when the student has no pronouns set (it would repeat the name). */
  var STRENGTH = {
    high: [
      '{First} showed particular strength in {topic}{esp}, where {poss} work reached the {L} level.',
      '{First}’s strongest area this semester was {topic}{esp}. {Subj} {v:handle} even the more challenging questions with confidence.',
      'A highlight of the semester for {First} was {topic}{esp}, where {subj} consistently {v:work} at the {L} level.',
      '{First} showed real strength on the Unit {unit} test, where {poss} work with {topic} reached the {L} level.',
      '{First} has a strong command of {topic}{espc} and {v:solve} challenging problems accurately and independently.',
      '~{First} has excelled with {topic}; {subj} {v:apply} {poss} understanding of {skill} with skill and care.',
      'In {topic}, {first} {v:work} at the {L} level and {v:handle} multi-step problems with ease.',
      '{First} has been especially strong in {topic}{esp}, where {subj} can take on complex questions with confidence.'
    ],
    mid: [
      '{First} showed strength in {topic}{esp}, where {subj} {v:handle} most questions with confidence.',
      '{First}’s strongest area this semester was {topic}{espc} where {poss} work is at the {L} level.',
      '{First} has done well with {topic}{espc} and {be} working at the {L} level there.',
      '{First} is confident with {topic} and {v:solve} familiar problems accurately{esp}.',
      'One of {first}’s strengths this semester has been {topic}{esp}, where {subj} {v:show} a clear understanding.',
      'In {topic}, {first} {v:work} carefully and accurately{esp}.'
    ],
    emg: [
      '{First}’s strongest area this semester was {topic}{esp}, where {subj} {be} developing a solid understanding.',
      '{First} has made good progress with {topic}{espc} and {be} working at the {L} level there.',
      '{First} is building a good understanding of {topic}{esp}.',
      'In {topic}, {first} {v:show} a growing understanding and can complete many familiar questions{esp}.'
    ],
    low: [
      '{First}’s most secure work this semester has been in {topic}{esp}, where {subj} {be} building a good foundation.',
      '{First} has made the most progress with {topic}{esp}.',
      '{First} has shown the most confidence with {topic}{esp}.',
      'In {topic}, {first} is beginning to build a foundation{esp}.'
    ]
  };
  var GROWTH = {
    none: [
      '{First} has not yet completed the practice for {topic}; finishing it in class will help {obj} build these skills.',
      'A next step for {first} is completing the practice for {topic}, which {subj} {v:have} not started yet.',
      'Completing the class practice for {topic} is an important next step for {first}.',
      '{First} still needs to work through the practice for {topic}; doing so in class will make the unit test much more manageable.'
    ],
    low: [
      'An area for growth is {what}: {subj} {be} still building the basic skills here and would benefit from more practice with the class examples.',
      '{Subj} would benefit from more practice with {what}, where {poss} work is currently at the {L} level.',
      'Going forward, {first} should focus on {what}; reviewing the class examples and completing the practice will help build confidence.',
      '{First} still finds {what} challenging, and working through the practice questions in class will help.',
      'With {what}, {first} {v:need} more support; asking questions in class and using the worked examples will help.',
      '{First} can strengthen {poss} skills with {what} by completing the practice and checking each answer as {subj} {v:go}.'
    ],
    mid: [
      '{Subj} {v:complete} familiar questions on {topic} well but at times {v:find} multi-step problems{suchc} more difficult.',
      'A next step for {first} is more practice with {what}: {subj} {v:understand} the main ideas but at times {v:find} multi-step questions difficult.',
      'In {topic}, {first} {v:understand} the basic steps but at times {v:make} errors in more complex questions{esp}.',
      'With {what}, {first} is on the right track; slowing down and checking each step will help {obj} avoid small errors.',
      'An area for growth is {what}, where {first} {v:know} the process but would benefit from practising questions that combine several steps.',
      '{First} can take {poss} work with {what} to the next level by practising questions that are less familiar.'
    ],
    adv: [
      'To reach the Mastery level in {topic}, {subj} should keep practising complex, unfamiliar problems{esp}.',
      'A next step for {first} is applying {topic} to more complex, unfamiliar problems{such}.',
      'In {topic}, {first} is close to Mastery; showing every step clearly on harder problems will help {obj} get there.',
      '{First} can push further in {topic} by taking on the challenge questions{esp}.'
    ],
    mas: [
      'To keep growing, {first} can take on extension questions that apply {topic} in new ways.',
      '~A next step for {first} is to explain {poss} reasoning in {topic} as clearly as {subj} {v:solve} the problems.',
      '{First} is ready for enrichment in {topic} and would enjoy the extension questions in each lesson.'
    ]
  };
  /* one sentence for both, sometimes (for variety) */
  var JOINED = [
    '{First} has done well with {stopic}{sesp}, but at times {v:find} {gwhat} more challenging; more practice there will help.',
    'While {first} {v:show} real confidence with {stopic}, {subj} would benefit from more practice with {gwhat}.',
    '{First} {v:handle} {stopic} with confidence, and {poss} next step is building the same confidence with {gwhat}.',
    '~{First}’s work with {stopic} has been a strength this semester; {subj} would benefit from bringing that same care to {gwhat}.'
  ];
  var SIGNOFF = {
    strong: ['Overall, great work this semester, {first}!', 'Excellent work this semester, {first}!', 'Fantastic effort this semester, {first}. Keep it up!',
      'Well done this semester, {first}!', 'Keep up the excellent work, {first}!', 'It has been a pleasure having {first} in class. Great work this semester!',
      'Great job this semester, {first}!'],
    good: ['Nice job this semester, {first}.', 'Good work this semester, {first}. Keep it up!', 'Overall, a solid semester, {first}. Keep it up!',
      'Keep up the good work, {first}!', 'Nice work this semester, {first}; keep building on it.', 'Well done this semester, {first}. Keep it going!'],
    keep: ['Keep working hard, {first}; I know you can finish the semester strong.', 'Keep at it, {first}. Your effort will pay off!',
      'Keep asking questions and practising, {first}. You can do this!', 'I look forward to seeing you build on this, {first}.',
      'Keep going, {first}. Every bit of practice helps!']
  };
  C.SIGNOFF = SIGNOFF;

  function fill(t, P, x) {
    return t.replace(/\{(v:)?(\w+)\}/g, function (m, isV, k) {
      if (isV) return v(P, k);
      switch (k) {
        case 'First': return P.first; case 'first': return P.first;
        case 'Subj': return cap(P.subj); case 'subj': return P.subj; case 'obj': return P.obj; case 'poss': return P.poss;
        case 'be': return be(P); case 'have': return P.s ? 'has' : 'have';
        default: return x[k] != null ? x[k] : '';
      }
    });
  }
  function usable(t, P, x) {
    if (t.charAt(0) === '~') { if (P.none) return false; }
    if (/\{skill\}/.test(t) && !x.skill) return false;
    if (/\{L\}/.test(t) && !x.L) return false;
    if (/\{unit\}/.test(t) && !x.unit) return false;
    return true;
  }
  /* spread the templates over a class: rot keeps, per kind of sentence, the next template to hand out and which one each
     student already has (so redrawing one student keeps their wording) */
  C.rotation = function () { return { next: {}, got: {} }; };
  function choose(list, P, x, key, who, rot) {
    var T = list.filter(function (t) { return usable(t, P, x); }); if (!T.length) return '';
    var i;
    if (rot) {
      var ck = who + '|' + key;
      if (rot.got[ck] == null) { var n = rot.next[key] || 0; rot.next[key] = n + 1; rot.got[ck] = (n + hash(key)) % 997; }
      i = rot.got[ck] % T.length;
    } else i = hash(who + '|' + key) % T.length;
    return fill(T[i].replace(/^~/, ''), P, x);
  }
  function vars(e, prefix) {
    var sk = e.skill && C.SKILL[e.skill], topic = C.TOPIC[e.outcome] || e.outcome, x = {};
    x.topic = topic; x.skill = sk || ''; x.what = sk || topic; x.esp = sk ? ', especially ' + sk : ''; x.espc = sk ? ', especially ' + sk + ',' : '';
    x.such = sk ? ', such as ' + sk : ''; x.suchc = sk ? ', such as ' + sk + ',' : '';
    x.L = e.level === 'NM' ? '' : (LNAME[e.level] || ''); x.unit = e.src === 'test' && e.unit ? e.unit : '';
    return x;
  }
  C.ipp = function (name) { return name + ' is on an individual program plan (IPP) and accommodations have been provided for their success. Please see the IPP for details regarding goals and progress.'; };
  /* st = { name, pronouns, strength, growth } (see the top); rot = C.rotation() shared by the class (optional) */
  C.personal = function (st, rot) {
    var P = C.forms(st.name, st.pronouns), who = st.name, S = st.strength, G = st.growth;
    var sx = S ? vars(S) : null, gx = G ? vars(G) : null;
    // now and then one joined sentence, when both are ordinary (a level, not "no work", growth below Mastery)
    if (S && G && !G.noWork && S.outcome !== G.outcome && sgroup(S.level) !== 'low' && LADDER.indexOf(G.level) <= 4 && LADDER.indexOf(G.level) >= 1) {
      var shape = choose(['two', 'two', 'joined'], P, {}, 'shape', who, rot);
      if (shape === 'joined') {
        var jx = { stopic: sx.topic, sesp: sx.esp, gwhat: gx.what };
        return choose(JOINED, P, jx, 'joined', who, rot);
      }
    }
    var out = [];
    if (S) out.push(choose(STRENGTH[sgroup(S.level)], P, sx, 's-' + sgroup(S.level), who, rot));
    if (G) {
      var gk = G.noWork ? 'none' : G.level === 'MAS' ? 'mas' : G.level === 'ADV' ? 'adv' : group(G.level) === 'mid' ? 'mid' : 'low';
      out.push(choose(GROWTH[gk], P, gx, 'g-' + gk, who, rot));
    }
    return out.filter(Boolean).join(' ');
  };
  /* a closing line that fits how the student is doing overall (0–100, the average of their outcome scores; null = no work) */
  C.signoff = function (st, overall, rot) {
    var tier = overall == null ? 'keep' : overall >= 72 ? 'strong' : overall >= 55 ? 'good' : 'keep';
    return choose(SIGNOFF[tier], C.forms(st.name, st.pronouns), {}, 'o-' + tier, st.name, rot);
  };
  /* course part + personal part + the IPP sentence + the sign-off */
  C.full = function (course, personal, st, signoff) { return [course, personal, st && st.ipp ? C.ipp(st.name) : '', signoff || ''].filter(Boolean).join(' '); };

  /* choose the strength and the growth outcome from a student's evidence:
     ev = { outcome: { score (0–100), level, src, unit, noWork, good: [{ lesson, mean, n }], weak: [{ lesson, mean, n }] } } */
  C.choose = function (ev) {
    var outs = Object.keys(ev || {}); if (!outs.length) return { strength: null, growth: null };
    var worked = outs.filter(function (o) { return !ev[o].noWork; });
    var byHigh = worked.slice().sort(function (a, b) { return ev[b].score - ev[a].score || ev[b].tie - ev[a].tie; });
    var strength = byHigh[0] || null;
    var rest = outs.filter(function (o) { return o !== strength; });
    rest.sort(function (a, b) { return (ev[a].noWork ? -1 : 0) - (ev[b].noWork ? -1 : 0) || ev[a].score - ev[b].score || ev[a].tie - ev[b].tie; });
    var growth = rest[0] || strength; // one outcome only: the growth is a weaker lesson inside it
    return { strength: strength, growth: growth };
  };
})(window);
