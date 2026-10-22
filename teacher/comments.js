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
  function pick(list, seed) { return list[hash(seed) % list.length]; }
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
    if (!t.length) return 'In ' + name + ' this term, we have built a foundation in number, algebra and measurement.';
    return 'In ' + name + ' this term, we have focused on ' + list(t) + '.';
  };
  function group(lv) { var i = LADDER.indexOf(lv); return i >= 5 ? 'high' : i >= 3 ? 'mid' : 'low'; }
  function sgroup(lv) { var i = LADDER.indexOf(lv); return i >= 5 ? 'high' : i === 4 ? 'mid' : i === 3 ? 'emg' : 'low'; }

  function strengthSentence(st, P, seed) {
    var e = st.strength, topic = C.TOPIC[e.outcome] || e.outcome, sk = e.skill && C.SKILL[e.skill], L = LNAME[e.level] || '', g = sgroup(e.level);
    var esp = sk ? ', especially ' + sk : '';
    var onTest = e.src === 'test' && e.unit ? 'on the Unit ' + e.unit + ' test' : '';
    var T = {
      high: [
        P.first + ' showed particular strength in ' + topic + esp + ', where ' + P.poss + ' work reached the ' + L + ' level.',
        P.first + '’s strongest area this term was ' + topic + esp + '. ' + cap(P.subj) + ' ' + v(P, 'handle') + ' even the more challenging questions with confidence.',
        'A highlight of the term for ' + P.first + ' was ' + topic + esp + ', where ' + P.subj + ' consistently ' + v(P, 'work') + ' at the ' + L + ' level.',
        onTest ? P.first + ' showed real strength ' + onTest + ', where ' + P.poss + ' work with ' + topic + ' reached the ' + L + ' level.' : null
      ],
      mid: [
        P.first + ' showed strength in ' + topic + esp + ', where ' + P.subj + ' ' + v(P, 'handle') + ' most questions with confidence.',
        P.first + '’s strongest area this term was ' + topic + (sk ? ', particularly ' + sk + ',' : '') + ' where ' + P.poss + ' work is at the ' + L + ' level.',
        P.first + ' has done well with ' + topic + (sk ? esp + ',' : '') + ' and ' + be(P) + ' working at the ' + L + ' level there.'
      ],
      emg: [
        P.first + '’s strongest area this term was ' + topic + esp + ', where ' + P.subj + ' ' + be(P) + ' developing a solid understanding.',
        P.first + ' has made good progress with ' + topic + (sk ? esp + ',' : '') + ' and ' + be(P) + ' working at the ' + L + ' level there.'
      ],
      low: [
        P.first + '’s most secure work this term has been in ' + topic + esp + ', where ' + P.subj + ' ' + be(P) + ' building a good foundation.',
        P.first + ' has made the most progress with ' + topic + esp + '.'
      ]
    }[g].filter(function (t) { return t && (L || t.indexOf('the  level') < 0); });
    return pick(T, seed + '|s');
  }
  function growthSentence(st, P, seed) {
    var e = st.growth, topic = C.TOPIC[e.outcome] || e.outcome, sk = e.skill && C.SKILL[e.skill], what = sk || topic, L = e.level === 'NM' ? '' : LNAME[e.level] || '';
    var Subj = cap(P.subj);
    if (e.noWork) return pick([
      P.first + ' has not yet completed the practice for ' + topic + '; finishing it in class will help ' + P.obj + ' build these skills.',
      'A next step for ' + P.first + ' is completing the practice for ' + topic + ', which ' + P.subj + ' ' + v(P, 'have') + ' not started yet.'
    ], seed + '|g');
    var g = group(e.level), T;
    if (g === 'low') T = [
      'An area for growth is ' + what + ': ' + P.subj + ' ' + be(P) + ' still building the basic skills here and would benefit from more practice with the class examples.',
      Subj + ' would benefit from more practice with ' + what + ', where ' + P.poss + ' work is currently at the ' + L + ' level.',
      'Going forward, ' + P.first + ' should focus on ' + what + '; reviewing the class examples and completing the practice will help ' + (P.none ? '' : P.obj + ' ') + 'build confidence.'
    ];
    else if (g === 'mid') T = [
      Subj + ' ' + v(P, 'complete') + ' familiar questions on ' + topic + ' well but at times ' + v(P, 'find') + ' multi-step problems' + (sk ? ', such as ' + sk + ',' : '') + ' more difficult.',
      'A next step for ' + P.first + ' is more practice with ' + what + ': ' + P.subj + ' ' + v(P, 'understand') + ' the main ideas but at times ' + v(P, 'find') + ' multi-step questions difficult.',
      'In ' + topic + ', ' + P.first + ' ' + v(P, 'understand') + ' the basic steps but at times ' + v(P, 'make') + ' errors in more complex questions' + (sk ? ', especially ' + sk : '') + '.'
    ];
    else if (e.level === 'MAS') T = [
      'To keep growing, ' + P.first + ' can take on extension questions that apply ' + topic + ' in new ways.',
      P.none ? null : 'A next step for ' + P.first + ' is to explain ' + P.poss + ' reasoning in ' + topic + ' as clearly as ' + P.subj + ' ' + v(P, 'solve') + ' the problems.'
    ];
    else T = [
      'To reach the Mastery level in ' + topic + ', ' + P.subj + ' should keep practising complex, unfamiliar problems' + (sk ? ', especially ' + sk : '') + '.',
      'A next step for ' + P.first + ' is applying ' + topic + ' to more complex, unfamiliar problems' + (sk ? ', such as ' + sk : '') + '.'
    ];
    T = T.filter(function (t) { return t && (L || t.indexOf('the  level') < 0); });
    return pick(T, seed + '|g');
  }
  C.ipp = function (name) { return name + ' is on an individual program plan (IPP) and accommodations have been provided for their success. Please see the IPP for details regarding goals and progress.'; };
  C.personal = function (st) {
    var P = C.forms(st.name, st.pronouns), seed = st.name, out = [];
    if (st.strength) out.push(strengthSentence(st, P, seed));
    if (st.growth) out.push(growthSentence(st, P, seed));
    return out.join(' ');
  };
  /* course part + personal part (+ the IPP sentence) */
  C.full = function (course, personal, st) { return [course, personal, st && st.ipp ? C.ipp(st.name) : ''].filter(Boolean).join(' '); };

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
