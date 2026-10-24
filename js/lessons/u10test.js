/* Math 10C · Unit 10 Test (M1, M2, M3) — the paper outcomes-based unit test (u10_test_A/B/C.tex) as generators.
 * The paper has one page per facet (M1; M2; M3 part 1 prisms/cylinders/pyramids/cones; M3 part 2 spheres/composites),
 * each in BEG / PRG / MAS boxes. Every question keeps its outcome, its box and its paper number (1–29); defineTest puts
 * them Beginning → Progressing → Mastery. Each part takes its numbers from the seed, inside the range Versions A, B and C
 * show (their numbers are possible values), with a key and a worked solution for every version.
 * Conversions from paper:
 *   - referent / unit table (Q1) → two tables (grid); instrument choice (Q8) → a table judging each instrument
 *     (best choice / not precise enough / can't measure this);
 *   - "explain" parts (Q7b, Q14a) → a table of statements to mark true or false, plus the number the paper asks for;
 *     "is the estimate reasonable" (Q6) and "will it hold" (Q29a) → the calculation in labelled boxes, then yes / no;
 *     "explain using the volume formula" (Q21) → the factor the volume is multiplied by, then the new volume;
 *     "which surface did you use" (Q22b) → the area itself (counting the base or floor gets its own hint);
 *   - Q6 states the "within 10%" rule the paper's key uses; Q7a asks for the nearest thousandth; Q14b, Q28b ask for
 *     the length / area as well as the count and cost the paper asks for.
 * Figures are drawn from the student's numbers: the ruler, micrometer and vernier caliper show the generated reading
 * (the booklet's true geometry, ported from u10l1.js), and the cylinder, cone, pyramid, silo and tank are drawn to scale.
 * Conversion factors (M2) and the formula sheet (M3) are given in each stem, as on the paper. */
(function (root) {
  'use strict';
  var HW = root.HW, F = HW.fmt, K = HW.kit, P = K.P, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;
  var PI = Math.PI;
  var IN_CM = 2.54, FT_M = 0.3048, MI_KM = 1.6093, KM_MI = 0.6214, GAL_L = 3.7854;

  HW.addCodes({
    'u10t-one-row': 'One row of the table wrong', 'u10t-rows': 'Two or more rows of the table wrong',
    'u10t-cm-not-m': 'Left the answer in centimetres (asked for metres)', 'u10t-conv-places': 'Wrong power of ten in a metric conversion',
    'u10t-conv-dir': 'Multiplied instead of dividing (or the reverse) in a conversion', 'u10t-no-convert': 'Didn’t change to the same unit first',
    'u10t-ruler-start': 'Ruler: read the end mark without subtracting the start', 'u10t-unit-slip': 'Gave the length in the other unit (cm / mm)',
    'u10t-read-slip': 'Ruler: misread by one millimetre mark', 'u10t-precision': 'Not written to the instrument’s precision', 'u10t-rounded': 'Rounded a value that comes out exactly',
    'u10t-mic-half': 'Micrometer: half-millimetre mark missed or added', 'u10t-mic-hidden': 'Micrometer: read a sleeve mark still under the thimble',
    'u10t-mic-tenths': 'Micrometer: used 0.1 mm per thimble division', 'u10t-mic-coarse': 'Micrometer: whole millimetres miscounted',
    'u10t-mic-neighbour': 'Micrometer: thimble mark beside the index line', 'u10t-mic-label': 'Micrometer: read the nearest numbered thimble mark',
    'u10t-no-fine': 'Gave only the coarse reading', 'u10t-no-coarse': 'Gave only the fine reading',
    'u10t-vern-aligned': 'Vernier: coarse reading taken where the lines meet, not at the index', 'u10t-vern-tenths': 'Vernier: used 0.1 or 0.01 mm per division instead of 0.05',
    'u10t-vern-coarse': 'Vernier: coarse (main-scale) reading off by 1 mm', 'u10t-vern-neighbour': 'Vernier: picked a neighbouring mark',
    'u10t-est-count': 'Gave the number of referents, not the length', 'u10t-ftin-dec': 'Treated inches (or feet) as a decimal part', 'u10t-ftin-noin': 'Left out part of a mixed measure',
    'u10t-ftin-rem': 'Feet and inches: leftover inches wrong', 'u10t-ftin-feet': 'Feet and inches: feet wrong',
    'u10t-pct-base': 'Percent difference divided by the estimate, not the measured value', 'u10t-pct-diff': 'Gave the difference, not the percent',
    'u10t-judge': 'Wrong yes / no conclusion', 'u10t-yn': 'Yes / no box not answered with yes or no',
    'u10t-stack-cm': 'Stack: didn’t change cm to mm', 'u10t-stack-flip': 'Stack: divided the wrong way', 'u10t-stack-whole': 'Gave the whole stack, not one sheet',
    'u10t-err-whole': 'Error for one sheet: gave the whole-stack error', 'u10t-err-times': 'Error for one sheet: multiplied instead of dividing',
    'u10t-rate-time': 'Speed: time converted wrongly (or not at all)', 'u10t-rate-part': 'Speed: one length conversion left out',
    'u10t-fuel-kmL': 'Fuel: gave km per litre, not litres per 100 km', 'u10t-fuel-gal': 'Fuel: left out the litres–gallons conversion', 'u10t-fuel-flip': 'Fuel: rate turned upside down',
    'u10t-exch-dir': 'Exchange rate used the wrong way', 'u10t-exch-none': 'Left out the exchange rate', 'u10t-cost-part': 'Cost: used the wrong amount of fuel',
    'u10t-perim-door': 'Didn’t subtract the doorway', 'u10t-perim-half': 'Perimeter: used only two sides', 'u10t-buy-down': 'Rounded the number to buy down',
    'u10t-v-sa': 'Used a surface-area formula for a volume', 'u10t-v-base': 'Base area only (didn’t multiply by the height)', 'u10t-v-r1': 'Used r instead of r²',
    'u10t-v-no3': 'Forgot the ⅓ in a cone or pyramid volume', 'u10t-half': 'Left out the ½ of a triangle’s area', 'u10t-sa-no-base': 'Left the base out of a surface area',
    'u10t-sa-one-face': 'Counted only one triangular face', 'u10t-diam': 'Used the diameter as the radius', 'u10t-sa-height': 'Used the perpendicular height where the slant height belongs',
    'u10t-slant-add': 'Added the lengths instead of using the Pythagorean theorem', 'u10t-cap-conv': 'Litres–millilitres conversion missed', 'u10t-h-area': 'Divided by the wrong area (not πr²)',
    'u10t-half-edge': 'Used the full base side, not half, in the slant-height triangle', 'u10t-scale-linear': 'Scaled the volume like a length (factor not squared)',
    'u10t-scale-h': 'Left out the change in height', 'u10t-scale-cube': 'Cubed the radius factor', 'u10t-sa-extra-base': 'Counted a base, floor or join that isn’t there',
    'u10t-early': 'Rounded part-way through', 'u10t-sa-circle': 'Used πr² (one circle) for a sphere', 'u10t-sa-two': 'Used 2πr² for a whole sphere',
    'u10t-v-no43': 'Forgot the 4/3 (or 2/3) in the volume', 'u10t-v-r2': 'Squared r instead of cubing it', 'u10t-hemi-whole': 'Used a whole sphere for a hemisphere',
    'u10t-l-conv': 'Left the volume in cm³ / mL (not litres)', 'u10t-no-root': 'Forgot to take the cube root', 'u10t-sqrt': 'Took a square root instead of a cube root',
    'u10t-comp-part': 'Left out part of the composite solid', 'u10t-no-pi': 'Left π out'
  });
  HW.addPartial({
    'u10t-one-row': 's', 'u10t-rows': 'n', 'u10t-cm-not-m': 's', 'u10t-conv-places': 'b', 'u10t-conv-dir': 'b', 'u10t-no-convert': 'b',
    'u10t-ruler-start': 'b', 'u10t-unit-slip': 's', 'u10t-read-slip': 's',
    'u10t-mic-half': 's', 'u10t-mic-hidden': 's', 'u10t-mic-tenths': 'b', 'u10t-mic-coarse': 's', 'u10t-mic-neighbour': 's', 'u10t-mic-label': 's',
    'u10t-no-fine': 'b', 'u10t-no-coarse': 'b', 'u10t-vern-aligned': 'b', 'u10t-vern-tenths': 'b', 'u10t-vern-coarse': 's', 'u10t-vern-neighbour': 's',
    'u10t-est-count': 'n', 'u10t-ftin-dec': 'b', 'u10t-ftin-noin': 's', 'u10t-ftin-rem': 's', 'u10t-ftin-feet': 's',
    'u10t-pct-base': 'b', 'u10t-pct-diff': 'b', 'u10t-judge': 'n',
    'u10t-stack-cm': 's', 'u10t-stack-flip': 'n', 'u10t-stack-whole': 'n', 'u10t-err-whole': 'n', 'u10t-err-times': 'n',
    'u10t-rate-time': 'b', 'u10t-rate-part': 's', 'u10t-fuel-kmL': 'b', 'u10t-fuel-gal': 'b', 'u10t-fuel-flip': 'b',
    'u10t-exch-dir': 'b', 'u10t-exch-none': 'b', 'u10t-cost-part': 'b', 'u10t-perim-door': 's', 'u10t-perim-half': 's', 'u10t-buy-down': 's',
    'u10t-v-sa': 'b', 'u10t-v-base': 'b', 'u10t-v-r1': 'b', 'u10t-v-no3': 'b', 'u10t-half': 'b', 'u10t-sa-no-base': 's', 'u10t-sa-one-face': 'b',
    'u10t-diam': 'b', 'u10t-sa-height': 'b', 'u10t-slant-add': 'n', 'u10t-cap-conv': 's', 'u10t-h-area': 'b', 'u10t-half-edge': 'b',
    'u10t-scale-linear': 'b', 'u10t-scale-h': 'b', 'u10t-scale-cube': 'n', 'u10t-sa-extra-base': 's', 'u10t-early': 's',
    'u10t-sa-circle': 'b', 'u10t-sa-two': 'b', 'u10t-v-no43': 'b', 'u10t-v-r2': 'b', 'u10t-hemi-whole': 'b', 'u10t-l-conv': 's',
    'u10t-no-root': 'b', 'u10t-sqrt': 'b', 'u10t-comp-part': 'b', 'u10t-no-pi': 'b'
  });

  /* ======================= numbers ======================= */
  function rd(x, dp) { return K.roundTo(x, dp); }
  function fx(x, dp) { return rd(x, dp).toFixed(dp); }                 // rounded, plain
  function FX(x, dp) { return F(fx(x, dp)); }                          // rounded, TeX
  function cl(x) { return +(+x).toPrecision(12); }
  function S(x) { return String(cl(x)); }                              // exact, plain
  function N(x) { return F(S(x)); }                                    // exact, TeX
  function dots(x, n) { return F((+x).toFixed(n == null ? 3 : n)) + '\\ldots'; }
  function near(a, b) { return Math.abs(a - b) < 1e-7 * Math.max(1, Math.abs(a), Math.abs(b)); }
  function num(resp) { var p = HW.parse.number(resp); return p.ok ? p.value : null; }
  function decs(resp) { var s = HW.parse.plain(String(resp == null ? '' : resp)).replace(/\s/g, ''); return (s.split('.')[1] || '').length; }
  function decsOf(x) { return (S(x).split('.')[1] || '').length; }
  function A(v, code, hint) { return { v: v, code: code, hint: hint }; }
  function bord(x, dp, w) { var f = Math.abs(x) * Math.pow(10, dp); f -= Math.floor(f); return Math.abs(f - 0.5) < (w || 0.04); } // too near a rounding boundary
  function find(gen, test, fallback) { for (var i = 0; i < 600; i++) { var v = gen(); if (v != null && test(v)) return v; } return fallback; }
  function step(r, lo, hi, st) { return cl(lo + st * r.int(0, Math.round((hi - lo) / st))); }
  function piC(c) { // coefficient of π as TeX
    if (near(c, Math.round(c))) return Math.round(c) === 1 ? '' : F(String(Math.round(c)));
    for (var q = 2; q <= 6; q++) if (near(c * q, Math.round(c * q))) return '\\tfrac{' + F(String(Math.round(c * q))) + '}{' + q + '}';
    return F((+c).toFixed(2)) + '\\ldots';
  }
  function U(u) { return '\\text{ ' + u + '}'; }
  function U2(u) { return '\\text{ ' + u + '}^{2}'; }
  function U3(u) { return '\\text{ ' + u + '}^{3}'; }
  function uH(u, p) { return t((p === 2 ? U2(u) : p === 3 ? U3(u) : U(u)).replace(/^\\text\{ /, '\\text{')); }
  function ap(x, dp, u, p) { return '\\approx\\mathbf{' + FX(x, dp) + '}' + (u ? (p === 2 ? U2(u) : p === 3 ? U3(u) : U(u)) : ''); }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ======================= checkers and part builders ======================= */
  /* exact value; alts = [{v, code, hint}] */
  function exactCk(x, alts, opt) {
    opt = opt || {};
    var base = K.number(x, null);
    return function (resp) {
      var p = HW.parse.number(resp);
      if (!p.ok) return base(resp);
      var v = p.value;
      if (near(v, x)) { if (opt.dp != null && decs(resp) < opt.dp) return form('u10t-precision', opt.precisionHint || ('Right value! Write it to ' + opt.dp + ' decimal places: ' + t(fx(x, opt.dp)) + '.')); return ok(); }
      for (var i = 0; i < (alts || []).length; i++) if (near(v, alts[i].v)) return wrong(alts[i].code, alts[i].hint);
      if (x !== 0 && Math.abs(v - x) <= 0.006 * Math.abs(x) && decs(resp) < decsOf(x)) return form('u10t-rounded', 'Close — but this value comes out exactly. Give it without rounding.');
      return wrong('value', null);
    };
  }
  /* rounded value (dp places): a response equal to the rounded value is right however many zeros it shows; opt.also =
     other values that are also accepted when rounded (e.g. worked from a rounded earlier answer) */
  function nearCk(x, dp, alts, opt) {
    opt = opt || {};
    var acc = [x].concat(opt.also || []), f = Math.pow(10, dp);
    var c = K.near(x, dp, { alts: (alts || []).filter(function (a) { return !acc.some(function (y) { return near(rd(a.v, dp), rd(y, dp)); }); }) });
    return function (resp) {
      var v = num(resp);
      if (v != null) for (var i = 0; i < acc.length; i++) {
        if (near(v, rd(acc[i], dp))) return ok();
        if (Math.abs(acc[i] * f - Math.floor(acc[i] * f + 1e-9) - 0.5) < 1e-6 && near(v, Math.floor(acc[i] * f + 1e-9) / f)) return ok(); // an exact half: either rounding
      }
      return c(resp);
    };
  }
  function keyOf(x, dp) { return dp == null ? S(x) : fx(x, dp); }
  function badOf(check, key, x, dp, alts) {
    var out = [];
    (alts || []).forEach(function (a) { if (!isFinite(a.v) || Math.abs(a.v) > 1e12) return; var s = keyOf(a.v, dp); if (s !== key && out.indexOf(s) < 0 && check(s).v !== 'correct') out.push(s); });
    return out.slice(0, 4);
  }
  /* one number box. unit = TeX unit shown after the box (e.g. U3('cm')), opt.before, opt.also, opt.exactDp */
  function numP(prompt, x, dp, unit, alts, sol, hints, text, opt) {
    opt = opt || {};
    var ck = dp == null ? exactCk(x, alts, { dp: opt.exactDp, precisionHint: opt.precisionHint }) : nearCk(x, dp, alts, opt);
    var key = dp == null && opt.exactDp != null ? fx(x, opt.exactDp) : keyOf(x, dp);
    var after = unit ? t(unit.replace(/^\\text\{ /, '\\text{')) : undefined;
    var p = { prompt: prompt, input: { type: 'number', after: after, before: opt.before }, check: ck, key: key,
      answer: (opt.before ? opt.before : '') + t(F(key) + (unit || '')), solution: sol, hints: hints || [], text: text };
    p.bad = badOf(ck, key, x, dp, alts);
    return p;
  }
  /* several boxes: specs [{ name, label, before, after (TeX unit), x, dp, alts, check, key, mode, placeholder, ans }] */
  function fieldsP(prompt, specs, sol, hints, text, extraBad) {
    var fields = specs.map(function (s) { return { name: s.name || s.label, label: s.label, before: s.before, after: s.after ? t(s.after.replace(/^\\text\{ /, '\\text{')) : s.afterHtml, mode: s.mode, placeholder: s.placeholder, wide: s.wide }; });
    var checks = specs.map(function (s) { return s.check || (s.dp == null ? exactCk(s.x, s.alts, { dp: s.exactDp }) : nearCk(s.x, s.dp, s.alts, { also: s.also })); });
    var keys = specs.map(function (s) { return s.key != null ? s.key : s.dp == null && s.exactDp != null ? fx(s.x, s.exactDp) : keyOf(s.x, s.dp); });
    var ans = specs.map(function (s, i) { return (s.label || s.name) + ' ' + (s.ans || ((s.before || '') + t(F(keys[i]) + (s.after || '')))); }).join('<br>');
    var p = P.fields(prompt, fields, checks, keys, ans, sol, hints, text);
    var bad = [];
    specs.forEach(function (s, i) { if (s.check) return; (s.alts || []).slice(0, 2).forEach(function (a) { var v = keyOf(a.v, s.dp); if (v === keys[i]) return; var b = keys.slice(); b[i] = v; bad.push(b); }); });
    (extraBad || []).forEach(function (b) { bad.push(b); });
    p.bad = bad.filter(function (b) { var r = p.check(b); return r.v !== 'correct'; }).slice(0, 5);
    return p;
  }
  /* a table, one choice per row; want[row] = colId or [accepted colIds]; why(rowId, got) -> hint. One wrong row is a small
     mistake (keeps 2/3); two or more get no credit. */
  function gridP(prompt, rows, cols, want, why, sol, hints, text, opt) {
    opt = opt || {};
    var acc = {}, key = {}, colName = {};
    cols.forEach(function (c) { colName[c.id] = c.name || c.html; });
    rows.forEach(function (rw) { acc[rw.id] = [].concat(want[rw.id]); key[rw.id] = acc[rw.id][0]; });
    var check = function (resp) {
      resp = resp || {};
      var miss = rows.filter(function (rw) { return resp[rw.id] == null; });
      if (miss.length === rows.length) return form('empty', 'Fill in the table first.');
      if (miss.length) return form('incomplete', 'Finish every row (' + (rows.length - miss.length) + ' of ' + rows.length + ' done).');
      var bad = rows.filter(function (rw) { return acc[rw.id].indexOf(resp[rw.id]) < 0; });
      if (!bad.length) return ok();
      var h = why ? why(bad[0].id, resp[bad[0].id]) : null;
      return wrong(bad.length === 1 ? 'u10t-one-row' : 'u10t-rows', (h || 'Check the row “' + bad[0].html + '”.') + (bad.length > 1 ? ' (' + bad.length + ' rows need another look.)' : ''));
    };
    var p = { prompt: prompt, input: { type: 'grid', rows: rows, cols: cols, multi: false, rowHead: opt.rowHead, help: opt.help }, check: check, key: key,
      answer: rows.map(function (rw) { return rw.html.replace(/\.$/, '') + ': <b>' + acc[rw.id].map(function (c) { return colName[c]; }).join(' or ') + '</b>'; }).join('<br>'),
      solution: sol, hints: hints || [], text: text, tries: 3 };
    var b1 = Object.assign({}, key), first = rows[0].id, other = cols.filter(function (c) { return acc[first].indexOf(c.id) < 0; })[0];
    if (other) { b1[first] = other.id; p.bad = [b1]; }
    return p;
  }
  /* yes / no typed in a box */
  function ynCk(yes, whyWrong) {
    return function (resp) {
      var s = String(resp == null ? '' : resp).trim().toLowerCase().replace(/[.!]$/, '');
      if (!s) return form('empty', 'Type yes or no.');
      var v = /^(y|yes|yep|yeah|it will|it does)\b/.test(s) ? true : /^(n|no|nope|it won.?t|it doesn.?t)\b/.test(s) ? false : null;
      if (v == null) return form('u10t-yn', 'Type <b>yes</b> or <b>no</b>.');
      return v === yes ? ok() : wrong('u10t-judge', whyWrong);
    };
  }
  /* feet + inches in two boxes; total = whole inches; diag(tot, ft, in) -> {code, hint} */
  function ftInCk(total, diag) {
    return function (resp) {
      resp = resp || [];
      var e0 = resp[0] == null || String(resp[0]).trim() === '', e1 = resp[1] == null || String(resp[1]).trim() === '';
      if (e0 && e1) return form('empty', 'Fill in the feet and the inches.');
      var a = num(resp[0]), b = num(resp[1]);
      if (a == null || b == null) return form('blank', 'Put a whole number in each box (use ' + t('0') + ' if there are no inches).');
      var h = diag ? diag(12 * a + b, a, b) : null;
      if (near(12 * a + b, total)) { if (b >= 12) return form('in-over-12', 'Right length — but ' + t('12') + ' in make a foot, so carry: the inches box should be less than ' + t('12') + '.'); if (b < 0 || a % 1 || b % 1) return form('blank', 'Write it as whole feet and whole inches.'); return ok(); }
      if (h) return wrong(h.code, h.hint);
      if (near(a, Math.floor(total / 12)) && !near(b, total % 12)) return wrong('u10t-ftin-rem', 'The feet are right; check the leftover inches: ' + t(Math.floor(total / 12) + '\\times12=' + 12 * Math.floor(total / 12)) + '.');
      if (near(b, total % 12)) return wrong('u10t-ftin-feet', 'The inches are right; check the feet.');
      return wrong('value', null);
    };
  }
  function ftinT(tot) { return Math.floor(tot / 12) + '\\text{ ft }' + (tot % 12) + '\\text{ in}'; }

  /* ======================= reference strips ======================= */
  var CONV = '<div style="border:1px solid #9aa3b2;border-radius:6px;padding:4px 8px;margin:2px 0 8px;font-size:0.88em;line-height:1.7">' +
    '<b>Conversion factors</b>&ensp;' + [t('1\\text{ cm}=10\\text{ mm}'), t('1\\text{ m}=100\\text{ cm}'), t('1\\text{ km}=1000\\text{ m}'), t('1\\text{ ft}=12\\text{ in}'), t('1\\text{ yd}=3\\text{ ft}'), t('1\\text{ mi}=5280\\text{ ft}=1760\\text{ yd}'), t('1\\text{ L}=1000\\text{ mL}')].join(' · ') + '<br>' +
    [t('1\\text{ in}=2.54\\text{ cm}'), t('1\\text{ ft}=0.3048\\text{ m}'), t('1\\text{ m}=3.2808\\text{ ft}'), t('1\\text{ yd}=0.9144\\text{ m}'), t('1\\text{ mi}=1.6093\\text{ km}'), t('1\\text{ km}=0.6214\\text{ mi}'), t('1\\text{ US gallon}=3.7854\\text{ L}')].join(' · ') + '</div>';
  var FORM_ROWS = [['Prism', 'SA = sum of all faces', t('V=A_{\\text{Base}}\\times h')], ['Cylinder', t('SA=2\\pi r^2+2\\pi rh'), t('V=\\pi r^2h')],
    ['Pyramid', t('SA=A_{\\text{Base}}+') + ' triangular faces (each ' + t('\\tfrac12bs') + ')', t('V=\\tfrac13Ah')], ['Cone', t('SA=\\pi r^2+\\pi rs') + ', ' + t('s^2=h^2+r^2'), t('V=\\tfrac13\\pi r^2h')],
    ['Sphere', t('SA=4\\pi r^2'), t('V=\\tfrac43\\pi r^3')], ['Hemisphere', t('SA=3\\pi r^2') + ' with flat base, ' + t('2\\pi r^2') + ' without', t('V=\\tfrac23\\pi r^3')]];
  var FORMULAS = '<details style="border:1px solid #9aa3b2;border-radius:6px;padding:3px 8px;margin:2px 0 8px;font-size:0.88em"><summary style="cursor:pointer"><b>Formula sheet</b> (tap to show)</summary>' +
    '<div style="margin:4px 0 2px">' + t('h') + ' = perpendicular height · ' + t('s') + ' = slant height · ' + t('r') + ' = radius · ' + t('A_{\\text{Base}}') + ' or ' + t('A') + ' = area of the base</div>' +
    '<table style="border-collapse:collapse;width:100%">' + FORM_ROWS.map(function (rw) { return '<tr><td style="padding:2px 6px;font-weight:700;white-space:nowrap">' + rw[0] + '</td><td style="padding:2px 6px">' + rw[1] + '</td><td style="padding:2px 6px;white-space:nowrap">' + rw[2] + '</td></tr>'; }).join('') + '</table></details>';

  /* ======================= SVG primitives ======================= */
  var INK = '#2b3340', GREY = '#6a7182', RED = '#b3261e', SOFT = '#f4faf9', COL = '#13807a';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function n1(v) { return (+v).toFixed(1); }
  function L(x1, y1, x2, y2, o) { o = o || {}; return '<line x1="' + n1(x1) + '" y1="' + n1(y1) + '" x2="' + n1(x2) + '" y2="' + n1(y2) + '" stroke="' + (o.c || INK) + '" stroke-width="' + (o.w || 1) + '"' + (o.dash ? ' stroke-dasharray="' + o.dash + '"' : '') + ' stroke-linecap="round"/>'; }
  function R(x, y, w, h, fill, o) { o = o || {}; return '<rect x="' + n1(x) + '" y="' + n1(y) + '" width="' + n1(Math.max(0, w)) + '" height="' + n1(Math.max(0, h)) + '"' + (o.rx ? ' rx="' + o.rx + '"' : '') + ' fill="' + fill + '" stroke="' + (o.stroke || 'none') + '" stroke-width="' + (o.sw || 1) + '"/>'; }
  function TX(x, y, s, o) { o = o || {}; return '<text x="' + n1(x) + '" y="' + n1(y) + '" font-size="' + (o.size || 13) + '" text-anchor="' + (o.anchor || 'middle') + '" dominant-baseline="central" fill="' + (o.c || INK) + '"' + (o.weight ? ' font-weight="' + o.weight + '"' : '') + (o.italic ? ' font-style="italic"' : '') + (o.halo ? ' paint-order="stroke" stroke="#fff" stroke-width="3" stroke-linejoin="round"' : '') + '>' + esc(s) + '</text>'; }
  function lab(x, y, s, o) { o = o || {}; o.halo = true; o.size = o.size || 14; return TX(x, y, s, o); }
  function pth(d, o) { o = o || {}; return '<path d="' + d + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w == null ? 2 : o.w) + '"' + (o.dash ? ' stroke-dasharray="5 4"' : '') + ' stroke-linejoin="round"/>'; }
  function ellF(cx, cy, rx, ry, o) { o = o || {}; return '<ellipse cx="' + n1(cx) + '" cy="' + n1(cy) + '" rx="' + n1(rx) + '" ry="' + n1(ry) + '" fill="' + (o.fill || 'none') + '" stroke="' + (o.stroke || INK) + '" stroke-width="' + (o.w || 2) + '"/>'; }
  function ellH(cx, cy, rx, ry, o) { // front (lower) half solid, back (upper) half dashed
    o = o || {};
    return pth('M' + n1(cx - rx) + ' ' + n1(cy) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 0 ' + n1(cx + rx) + ' ' + n1(cy)) + (o.noBack ? '' : pth('M' + n1(cx - rx) + ' ' + n1(cy) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 1 ' + n1(cx + rx) + ' ' + n1(cy), { w: 1.3, dash: 1 }));
  }
  function dimV(x, y1, y2, s, left) { return L(x, y1, x, y2, { w: 1.2 }) + L(x - 4, y1, x + 4, y1, { w: 1.2 }) + L(x - 4, y2, x + 4, y2, { w: 1.2 }) + (s ? lab(x + (left ? -7 : 7), (y1 + y2) / 2, s, { anchor: left ? 'end' : 'start' }) : ''); }
  function dimH(y, x1, x2, s, below) { return L(x1, y, x2, y, { w: 1.2 }) + L(x1, y - 4, x1, y + 4, { w: 1.2 }) + L(x2, y - 4, x2, y + 4, { w: 1.2 }) + (s ? lab((x1 + x2) / 2, y + (below ? 13 : -12), s) : ''); }
  function dot(x, y) { return '<circle cx="' + n1(x) + '" cy="' + n1(y) + '" r="2.4" fill="' + INK + '"/>'; }
  function svgFit(W, H, body, aria, maxW) { return '<svg class="fig-svg" viewBox="0 0 ' + Math.ceil(W) + ' ' + Math.ceil(H) + '" width="100%" style="max-width:' + Math.ceil(maxW || W) + 'px;display:block;margin:6px auto" role="img" aria-label="' + esc(aria) + '">' + body + '</svg>'; }
  function svgScroll(W, H, body, aria) {
    return '<div class="grid-scroll" style="margin:8px 0"><svg viewBox="0 0 ' + Math.ceil(W) + ' ' + Math.ceil(H) + '" style="display:block;width:100%;min-width:' + Math.ceil(W) + 'px;max-width:' + Math.ceil(W * 1.25) + 'px;height:auto" role="img" aria-label="' + esc(aria) + '">' + body + '</svg></div>' +
      '<div style="font-size:12px;color:' + GREY + ';margin:-2px 0 6px">On a small screen, swipe the scale sideways to see all of it.</div>';
  }

  /* ---------- vernier caliper (booklet \vernierScale{M}{N}: 20 divisions of 0.95 mm; reading M + 0.05N mm) ---------- */
  function vernSvg(M, Nf) {
    var u = 32, k = u / 0.74, lo = M - 3, hi = M + 21, padL = 20, W = (hi - lo) * u + 2 * padL;
    var X = function (m) { return padL + (m - lo) * u; };
    var top = 26, y0 = top + 1.05 * k, H = y0 + 1.0 * k + 30, p = M + 0.05 * Nf, xz = X(p), xe = xz + 19 * u, s = '';
    s += R(4, top, W - 8, 1.05 * k, '#f2f3f5', { stroke: '#b9bec6' });
    s += TX(padL, 12, 'Main scale (mm)', { weight: 700, size: 14, anchor: 'start' });
    for (var m = lo; m <= hi; m++) {
      var big = m % 5 === 0, x = X(m);
      s += L(x, y0, x, y0 - (big ? 0.55 : 0.32) * k, { w: big ? 1.5 : 1 });
      if (big) s += TX(x, y0 - 0.55 * k - 9, String(m), { size: 14 });
    }
    s += R(xz - 1.15 * k, y0, (xe - xz) + 1.7 * k, 1.0 * k, '#dcdfe4', { stroke: '#a3a9b2' });
    for (var n = 0; n <= 20; n++) {
      var xn = xz + 0.95 * n * u, bg = n % 5 === 0;
      s += L(xn, y0, xn, y0 + (bg ? 0.55 : 0.32) * k, { w: n === 0 ? 2.2 : bg ? 1.5 : 1, c: n === 0 ? RED : INK });
      if (bg) s += TX(xn, y0 + 0.55 * k + 9, String(n), { size: 14, c: n === 0 ? RED : INK });
    }
    s += L(4, y0, W - 4, y0, { w: 0.8, c: '#7d848e' });
    s += TX(xz - 7, y0 + 0.78 * k, 'index', { anchor: 'end', size: 13, c: RED });
    s += TX(Math.max(padL, xz - 1.15 * k + 4), H - 10, 'Vernier scale: 0.05 mm per division', { weight: 700, size: 14, anchor: 'start' });
    return svgScroll(W, H, s, 'vernier caliper scale');
  }
  /* ---------- micrometer (booklet \microScale{h}{f}: reading 0.5h + 0.01f mm; f >= 10 so the last sleeve mark shows) ---------- */
  function micSvg(h, f) {
    var k = 50, R0 = 0.5 * h + 0.01 * f, mlo = Math.max(0, Math.floor(R0 + 1e-9) - 6), mE = (R0 - mlo) * 0.55;
    var X = function (x) { return (x + 0.55) * k; }, Y = function (y) { return (1.45 - y) * k; };
    var W = X(mE + 3.05) + 4, H = Y(-1.35) + 52, s = '';
    s += R(X(-0.45), Y(0.86), X(mE) - X(-0.45), 1.48 * k, '#f2f3f5', { stroke: '#b9bec6' });
    for (var kk = 2 * mlo; kk <= h; kk++) {
      var x = X((kk * 0.5 - mlo) * 0.55);
      if (kk % 2) s += L(x, Y(-0.03), x, Y(-0.26), { w: 1.2 });
      else if ((kk / 2) % 5 === 0) { s += L(x, Y(0.03), x, Y(0.48), { w: 1.8 }); s += TX(x, Y(0.48) - 10, String(kk / 2), { size: 16 }); }
      else s += L(x, Y(0.03), x, Y(0.30), { w: 1.2 });
    }
    s += L(X(-0.38), Y(0), X(mE), Y(0), { w: 1.8 });
    s += R(X(mE), Y(1.35), 2.95 * k, 2.7 * k, '#d3d7dd', { stroke: '#a3a9b2' });
    s += L(X(mE), Y(1.35), X(mE), Y(-1.35), { w: 2 });
    for (var d = -6; d <= 6; d++) {
      var y = Y(-d * 0.22), v = ((f + d) % 50 + 50) % 50, maj = v % 5 === 0;
      s += L(X(mE + 0.12), y, X(mE + (maj ? 0.72 : 0.5)), y, { w: maj ? 1.6 : 1.1 });
      if (maj) s += TX(X(mE + 0.78), y, String(v), { anchor: 'start', size: 16 });
    }
    s += L(X(mE + 1.55), Y(0), X(mE + 3.0), Y(0), { c: RED, w: 1.6, dash: '5 4' });
    s += TX(X(mE + 2.95), Y(0) - 11, 'index line', { anchor: 'end', size: 14, c: RED });
    s += TX(W / 2, Y(-1.35) + 17, 'Sleeve: a mark every 0.5 mm', { weight: 700, size: 15 }); s += TX(W / 2, Y(-1.35) + 38, 'Thimble: 0.01 mm per division', { weight: 700, size: 15 });
    return svgFit(W, H, s, 'micrometer sleeve and thimble', Math.max(300, W));
  }
  /* ---------- centimetre ruler (0–7 cm, mm marks) with an object from a to b cm ---------- */
  function objShape(x1, x2, y, hh, kind) {
    var w = x2 - x1, s = '', hd = Math.min(10, w * 0.12);
    if (kind === 'screw' || kind === 'bolt') {
      s += R(x1, y + hh * 0.05, hd, hh * 0.9, '#c9ced6', { stroke: INK, sw: 1.3, rx: 2 });
      s += R(x1 + hd, y + hh * 0.3, w - hd - 6, hh * 0.4, '#dde1e7', { stroke: INK, sw: 1.3 });
      s += '<polygon points="' + n1(x2 - 6) + ',' + n1(y + hh * 0.3) + ' ' + n1(x2) + ',' + n1(y + hh * 0.5) + ' ' + n1(x2 - 6) + ',' + n1(y + hh * 0.7) + '" fill="#dde1e7" stroke="' + INK + '" stroke-width="1.3"/>';
      if (kind === 'screw') for (var i = x1 + 16; i < x2 - 8; i += 6) s += L(i, y + hh * 0.3, i + 3, y + hh * 0.7, { w: 0.8 });
    } else if (kind === 'nail') {
      s += R(x1, y + hh * 0.1, 4, hh * 0.8, '#c9ced6', { stroke: INK, sw: 1.3, rx: 1 });
      s += R(x1 + 4, y + hh * 0.38, w - 12, hh * 0.24, '#dde1e7', { stroke: INK, sw: 1.2 });
      s += '<polygon points="' + n1(x2 - 8) + ',' + n1(y + hh * 0.38) + ' ' + n1(x2) + ',' + n1(y + hh * 0.5) + ' ' + n1(x2 - 8) + ',' + n1(y + hh * 0.62) + '" fill="#dde1e7" stroke="' + INK + '" stroke-width="1.2"/>';
    } else {
      s += R(x1, y + hh * 0.15, w - 10, hh * 0.7, '#f3c66b', { stroke: INK, sw: 1.3, rx: 2 });
      s += '<polygon points="' + n1(x2 - 10) + ',' + n1(y + hh * 0.15) + ' ' + n1(x2) + ',' + n1(y + hh * 0.5) + ' ' + n1(x2 - 10) + ',' + n1(y + hh * 0.85) + '" fill="#f3c66b" stroke="' + INK + '" stroke-width="1.3"/>';
    }
    return s;
  }
  function rulerSvg(a, b, kind) {
    var from = 0, to = 7, W = 380, pad = 16, px = (W - 2 * pad) / (to - from), X = function (c) { return pad + (c - from) * px; };
    var oy = 14, oh = 26, ry = oy + oh + 6, s = '';
    s += objShape(X(a), X(b), oy, oh, kind);
    s += R(X(from) - 10, ry, (to - from) * px + 20, 44, '#fff8dc', { stroke: '#b8a46a', sw: 1.3, rx: 3 });
    for (var i = 0; i <= 70; i++) {
      var x = X(i / 10), isCm = i % 10 === 0, isHalf = i % 5 === 0;
      s += L(x, ry, x, ry + (isCm ? 20 : isHalf ? 13 : 8), { w: isCm ? 1.4 : 1 });
      if (isCm) s += TX(x, ry + 31, String(i / 10), { size: 13 });
    }
    s += TX(X(6.5), ry + 36, 'cm', { size: 11, c: GREY });
    [a, b].forEach(function (c) { s += L(X(c), oy - 4, X(c), ry + 22, { c: RED, w: 1.3, dash: '4 3' }); });
    return svgFit(W, ry + 50, s, 'object on a centimetre ruler', W * 1.35);
  }

  /* ---------- solids drawn to scale ---------- */
  function cylSvg(r, h, rLab, hLab) {
    var sc = Math.min(66 / r, 150 / h), rx = r * sc, ry = Math.max(7, rx * 0.26), H = h * sc, cx = 24 + rx, top = 30 + ry, bot = top + H, s = '';
    s += R(cx - rx, top, 2 * rx, H, SOFT) + pth('M' + n1(cx - rx) + ' ' + n1(bot) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 0 ' + n1(cx + rx) + ' ' + n1(bot), { fill: SOFT, w: 0 });
    s += ellF(cx, top, rx, ry, { fill: '#e3f1ef' }) + L(cx - rx, top, cx - rx, bot, { w: 2 }) + L(cx + rx, top, cx + rx, bot, { w: 2 }) + ellH(cx, bot, rx, ry);
    s += L(cx, top, cx + rx, top, { w: 1.5 }) + dot(cx, top) + lab(cx + rx / 2, top - ry - 11, rLab);
    s += dimV(cx + rx + 16, top, bot, hLab);
    return svgFit(cx + rx + 100, bot + ry + 10, s, 'cylinder, radius ' + rLab + ', height ' + hLab, 260);
  }
  function coneSvg(r, h, rLab, hLab) {
    var sc = Math.min(70 / r, 150 / h), rx = r * sc, ry = Math.max(7, rx * 0.26), H = h * sc, cx = 78 + rx, apex = 18, base = apex + H, s = '';
    s += '<polygon points="' + n1(cx) + ',' + apex + ' ' + n1(cx - rx) + ',' + n1(base) + ' ' + n1(cx + rx) + ',' + n1(base) + '" fill="' + SOFT + '"/>' + pth('M' + n1(cx - rx) + ' ' + n1(base) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 0 ' + n1(cx + rx) + ' ' + n1(base), { fill: SOFT, w: 0 });
    s += L(cx, apex, cx - rx, base, { w: 2 }) + L(cx, apex, cx + rx, base, { w: 2 }) + ellH(cx, base, rx, ry);
    s += L(cx, apex, cx, base, { w: 1.3, dash: '5 4' }) + L(cx, base, cx + rx, base, { w: 1.5 }) + dot(cx, base);
    s += '<polyline points="' + n1(cx) + ',' + n1(base - 9) + ' ' + n1(cx + 9) + ',' + n1(base - 9) + ' ' + n1(cx + 9) + ',' + n1(base) + '" fill="none" stroke="' + INK + '" stroke-width="1.2"/>';
    s += dimV(cx - rx - 14, apex, base, hLab, true) + L(cx - rx - 10, apex, cx - 4, apex, { w: 0.8, c: GREY, dash: '2 3' }) + lab(cx + rx / 2, base + ry + 12, rLab);
    return svgFit(cx + rx + 30, base + ry + 26, s, 'cone, radius ' + rLab + ', height ' + hLab, 250);
  }
  function pyrSvg(b, sl, bLab, sLab) {
    var h = Math.sqrt(sl * sl - b * b / 4), sc = Math.min(120 / b, 150 / h), B = b * sc, dd = B * 0.42, dx = dd * Math.cos(PI / 6), dy = dd * Math.sin(PI / 6), H = h * sc;
    var x0 = 26, yb = 16 + H + dy / 2, FL = [x0, yb], FR = [x0 + B, yb], BR = [x0 + B + dx, yb - dy], BL = [x0 + dx, yb - dy], C = [x0 + (B + dx) / 2, yb - dy / 2], T = [C[0], C[1] - H], M = [x0 + B / 2, yb], s = '';
    var pt = function (p) { return n1(p[0]) + ',' + n1(p[1]); };
    s += '<polygon points="' + [T, FL, FR, BR].map(pt).join(' ') + '" fill="' + SOFT + '"/>';
    s += L(FL[0], FL[1], FR[0], FR[1], { w: 2 }) + L(FR[0], FR[1], BR[0], BR[1], { w: 2 }) + L(T[0], T[1], FL[0], FL[1], { w: 2 }) + L(T[0], T[1], FR[0], FR[1], { w: 2 }) + L(T[0], T[1], BR[0], BR[1], { w: 2 });
    s += L(BR[0], BR[1], BL[0], BL[1], { w: 1.3, dash: '5 4' }) + L(BL[0], BL[1], FL[0], FL[1], { w: 1.3, dash: '5 4' }) + L(T[0], T[1], BL[0], BL[1], { w: 1.3, dash: '5 4' });
    s += L(T[0], T[1], M[0], M[1], { w: 1.4, dash: '2 3', c: COL });
    s += lab(M[0], yb + 14, bLab) + lab(M[0] + 0.32 * (T[0] - M[0]) + 5, M[1] + 0.32 * (T[1] - M[1]), sLab, { anchor: 'start', c: COL });
    return svgFit(x0 + B + dx + 26, yb + 26, s, 'square-based pyramid, base side ' + bLab + ', slant height ' + sLab, 250);
  }
  function sphereSvg(rLab) {
    var cx = 90, cy = 82, Rr = 64, s = '';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + Rr + '" fill="' + SOFT + '" stroke="' + INK + '" stroke-width="2"/>' + ellH(cx, cy, Rr, 15);
    var ex = cx + Rr * Math.cos(-0.7), ey = cy + Rr * Math.sin(-0.7);
    s += L(cx, cy, ex, ey, { w: 1.5 }) + dot(cx, cy) + lab((cx + ex) / 2 - 8, (cy + ey) / 2 - 10, rLab, { anchor: 'end' });
    return svgFit(180, 160, s, 'sphere, radius ' + rLab, 190);
  }
  function bowlSvg(rLab) {
    var cx = 95, cy = 34, Rr = 70, s = '';
    s += pth('M' + (cx - Rr) + ' ' + cy + ' A' + Rr + ' ' + Rr + ' 0 0 0 ' + (cx + Rr) + ' ' + cy + ' A' + Rr + ' 16 0 0 0 ' + (cx - Rr) + ' ' + cy, { fill: SOFT });
    s += ellF(cx, cy, Rr, 16, { fill: '#e3f1ef' }) + L(cx, cy, cx + Rr, cy, { w: 1.5 }) + dot(cx, cy) + lab(cx + Rr / 2, cy + 32, rLab);
    return svgFit(190, cy + Rr + 10, s, 'hemispherical bowl, radius ' + rLab, 200);
  }
  /* cylinder topped by a hemisphere (silo / observatory), to scale */
  function siloSvg(r, h, rLab, hLab) {
    var sc = Math.min(58 / r, 160 / (h + r)), rx = r * sc, ry = Math.max(7, rx * 0.24), H = h * sc, cx = 24 + rx, top = 12 + rx, bot = top + H, s = '';
    s += pth('M' + n1(cx - rx) + ' ' + n1(bot) + ' L' + n1(cx - rx) + ' ' + n1(top) + ' A' + n1(rx) + ' ' + n1(rx) + ' 0 0 1 ' + n1(cx + rx) + ' ' + n1(top) + ' L' + n1(cx + rx) + ' ' + n1(bot) + ' A' + n1(rx) + ' ' + n1(ry) + ' 0 0 1 ' + n1(cx - rx) + ' ' + n1(bot), { fill: SOFT });
    s += ellH(cx, top, rx, ry) + ellH(cx, bot, rx, ry);
    s += L(cx, bot, cx + rx, bot, { w: 1.5 }) + dot(cx, bot) + lab(cx + rx / 2, bot + ry + 12, rLab);
    s += dimV(cx + rx + 16, top, bot, hLab);
    return svgFit(cx + rx + 100, bot + ry + 26, s, 'cylinder with a hemispherical top', 250);
  }
  /* horizontal cylinder with a hemisphere on each end (propane tank), to scale */
  function capsuleSvg(r, len, rLab, lLab) {
    var sc = Math.min(150 / len, 50 / r, 230 / (len + 2 * r)), Rr = r * sc, Lx = len * sc, xL = 20 + Rr, xR = xL + Lx, cy = 30 + Rr, s = '';
    s += pth('M' + n1(xL) + ' ' + n1(cy - Rr) + ' L' + n1(xR) + ' ' + n1(cy - Rr) + ' A' + n1(Rr) + ' ' + n1(Rr) + ' 0 0 1 ' + n1(xR) + ' ' + n1(cy + Rr) + ' L' + n1(xL) + ' ' + n1(cy + Rr) + ' A' + n1(Rr) + ' ' + n1(Rr) + ' 0 0 1 ' + n1(xL) + ' ' + n1(cy - Rr), { fill: SOFT });
    [xL, xR].forEach(function (x) { s += pth('M' + n1(x) + ' ' + n1(cy - Rr) + ' A' + n1(Rr * 0.28) + ' ' + n1(Rr) + ' 0 0 0 ' + n1(x) + ' ' + n1(cy + Rr), { w: 1.3 }) + pth('M' + n1(x) + ' ' + n1(cy - Rr) + ' A' + n1(Rr * 0.28) + ' ' + n1(Rr) + ' 0 0 1 ' + n1(x) + ' ' + n1(cy + Rr), { w: 1.1, dash: 1 }); });
    s += L(xR, cy, xR + Rr, cy, { w: 1.5 }) + dot(xR, cy) + lab(xR + Rr * 0.62, cy - 11, rLab);
    s += dimH(cy + Rr + 14, xL, xR, lLab, true);
    return svgFit(xR + Rr + 20, cy + Rr + 36, s, 'cylinder with a hemisphere on each end', 300);
  }

  /* ======================= Q1: referents and units ======================= */
  var REF = {
    thumb: { name: 'thumb width', cm: 2.5, objs: ['smartphone width', 'credit card width', 'coin diameter', 'eraser length', 'sticky note width', 'USB stick length', 'paper clip length'] },
    hand: { name: 'hand width', cm: 10, objs: ['mug height', 'paperback book width', 'juice box height', 'pop can height', 'tissue box height', 'stapler length'] },
    span: { name: 'hand span', cm: 20, objs: ['student desk width', 'keyboard length', 'window width', 'computer monitor width', 'pillow length', 'backpack height'] },
    pace: { name: 'pace', cm: 90, objs: ['hallway length', 'classroom width', 'school bus length', 'gym length', 'driveway length', 'hockey rink length'] }
  };
  var REF_IDS = ['thumb', 'hand', 'span', 'pace'];
  var REF_LIST = '<span style="font-size:0.92em">thumb width ≈ ' + t('2.5') + ' cm (1 in) · hand width ≈ ' + t('10') + ' cm (4 in) · hand span ≈ ' + t('20') + ' cm · pace ≈ ' + t('90') + ' cm (1 yd)</span>';
  function q1Shared(r) {
    var cats = r.sample(REF_IDS, 3);
    return { rows: r.shuffle(cats.map(function (c) { return { cat: c, obj: r.pick(REF[c].objs) }; })) };
  }

  /* ======================= Q2: estimate with a referent ======================= */
  var EST = [
    { ref: 'pace', cm: 90, unit: 'paces', lo: 18, hi: 40, ctx: ['walks along the side of a basketball court', 'walks the length of the hallway', 'walks along one side of the parking lot', 'walks the length of the school gym'], what: ['court', 'hallway', 'parking lot', 'gym'] },
    { ref: 'hand span', cm: 20, unit: 'spans', lo: 8, hi: 25, ctx: ['measures the length of a whiteboard with her hand span', 'measures the length of a table with his hand span', 'measures the length of a couch with her hand span', 'measures the width of a bulletin board with his hand span'], what: ['whiteboard', 'table', 'couch', 'bulletin board'] },
    { ref: 'hand width', cm: 10, unit: 'hand widths', lo: 6, hi: 15, ctx: ['measures the width of a door with his hand width', 'measures the height of a chair seat with her hand width', 'measures the width of a desk with his hand width', 'measures the width of a window with her hand width'], what: ['door', 'chair seat', 'desk', 'window'] }];
  var NAMES = ['Ava', 'Ben', 'Noah', 'Maya', 'Leo', 'Zoe', 'Sam', 'Priya', 'Kai', 'Lena'];

  /* ======================= Q4 / Q5: instrument readings ======================= */
  function micAlts(h, f) {
    var c = 0.5 * h, x = c + 0.01 * f, half = h % 2 === 1, out = [];
    if (half) out.push(A(x - 0.5, 'u10t-mic-half', 'Look <b>below</b> the index line: a half-millimetre mark is showing past the last whole millimetre, so the coarse reading ends in ' + t('.5') + '.'));
    else out.push(A(x + 0.5, 'u10t-mic-half', 'No half-millimetre mark is showing past the last whole millimetre (the half marks are the short ones <b>below</b> the line), so don’t add ' + t('0.5') + ' mm.'));
    if (half) out.push(A(x + 0.5, 'u10t-mic-hidden', 'The thimble’s edge hasn’t uncovered that mark yet. Use the last sleeve mark that is fully visible.'));
    out.push(A(c + 0.1 * f, 'u10t-mic-tenths', 'Each thimble division is worth ' + t('0.01') + ' mm: fine reading ' + t('=\\text{division}\\times0.01') + '.'));
    out.push(A(c, 'u10t-no-fine', 'That is only the <b>coarse</b> (sleeve) reading. Add the fine reading from the thimble mark on the index line.'));
    out.push(A(0.01 * f, 'u10t-no-coarse', 'That is only the <b>fine</b> (thimble) reading. Add the coarse reading from the sleeve.'));
    out.push(A(x + 1, 'u10t-mic-coarse', 'Check the whole millimetres on the sleeve: count the marks above the line from the numbered one, and stop at the last one the thimble has uncovered.'));
    out.push(A(x - 1, 'u10t-mic-coarse', 'Check the whole millimetres on the sleeve: count the marks above the line from the numbered one again.'));
    out.push(A(x + 0.01, 'u10t-mic-neighbour', 'Very close — read the thimble mark that sits exactly <b>on</b> the index line, not the one beside it.'));
    out.push(A(x - 0.01, 'u10t-mic-neighbour', 'Very close — read the thimble mark that sits exactly <b>on</b> the index line, not the one beside it.'));
    var f5 = 5 * Math.round(f / 5) % 50; if (f5 !== f) out.push(A(c + 0.01 * f5, 'u10t-mic-label', 'You read the nearest <b>numbered</b> thimble mark. Count the small divisions from it to the mark on the index line.'));
    out.push(A(x / 10, 'u10t-unit-slip', 'That looks like centimetres. The reading is asked for in <b>millimetres</b>.'));
    return out.filter(function (a) { return !near(a.v, x); });
  }
  function vernAlts(M, Nf) {
    var x = M + 0.05 * Nf, out = [
      A(M + Nf, 'u10t-vern-aligned', 'You read the main-scale mark where the vernier line meets it. The <b>coarse reading</b> comes from the vernier’s own <b>0</b> mark (the red index): the last whole millimetre it has passed.'),
      A(M + Nf + 0.05 * Nf, 'u10t-vern-aligned', 'Your coarse reading came from the main-scale mark that the vernier line meets. Take the coarse reading at the vernier’s <b>0</b> (the red index) instead.'),
      A(M + 0.1 * Nf, 'u10t-vern-tenths', 'Each vernier division is worth ' + t('0.05') + ' mm, not ' + t('0.1') + ' mm: fine reading ' + t('=\\text{division number}\\times0.05') + '.'),
      A(M + 0.01 * Nf, 'u10t-vern-tenths', 'Each vernier division is worth ' + t('0.05') + ' mm, not ' + t('0.01') + ' mm: fine reading ' + t('=\\text{division number}\\times0.05') + '.'),
      A(M, 'u10t-no-fine', 'That is only the <b>coarse</b> reading. Add the fine reading: find the vernier mark that lines up with a main-scale mark.'),
      A(0.05 * Nf, 'u10t-no-coarse', 'That is only the <b>fine</b> reading. Add the coarse reading from the main scale (the last whole mm before the index).'),
      A(M + 1 + 0.05 * Nf, 'u10t-vern-coarse', 'Check the coarse reading: it is the last whole-millimetre mark <b>at or to the left of</b> the index, not the next one.'),
      A(M - 1 + 0.05 * Nf, 'u10t-vern-coarse', 'Check the coarse reading: count the millimetre marks from the numbered one up to the index again.'),
      A(M + 0.05 * (Nf + 1), 'u10t-vern-neighbour', 'Very close — look again for the vernier mark that lines up <b>best</b>. Compare it with the marks on either side.'),
      A(M + 0.05 * (Nf - 1), 'u10t-vern-neighbour', 'Very close — look again for the vernier mark that lines up <b>best</b>. Compare it with the marks on either side.'),
      A(x / 10, 'u10t-unit-slip', 'That looks like centimetres. The reading is asked for in <b>millimetres</b>.')];
    return out.filter(function (a) { return !near(a.v, x); });
  }

  /* ======================= Q6: was the estimate reasonable? ======================= */
  function q6Shared(r) {
    return find(function () {
      var kind = r.pick(['hand', 'pace', 'foot']), who = r.pick(NAMES), good = r.chance(0.6), s = { kind: kind, who: who };
      if (kind === 'hand') { s.n = r.int(10, 20); s.est = 4 * s.n; s.obj = r.pick(['height of a bookshelf', 'height of a fridge', 'length of a table', 'width of a bed', 'height of a door']); s.u = 'in'; s.refTxt = 'hand widths, using ' + s.who + '’s' + ' hand width (≈ ' + t('4') + ' in) as a referent'; s.tool = 'a tape measure'; }
      else if (kind === 'pace') { s.n = r.int(15, 40); s.est = 3 * s.n; s.obj = r.pick(['length of a hallway', 'length of the school gym', 'width of a parking lot', 'length of a driveway', 'length of a portable classroom']); s.u = 'ft'; s.refTxt = 'paces, using ' + s.who + '’s' + ' pace (≈ ' + t('1') + ' yd) as a referent'; s.tool = 'a trundle wheel'; }
      else { s.n = r.int(6, 15); s.est = 12 * s.n; s.obj = r.pick(['length of a rug', 'length of a bench', 'width of a bedroom', 'length of a garden bed', 'width of a stage']); s.u = 'in'; s.refTxt = 'foot-lengths, walking heel to toe and using ' + s.who + '’s' + ' foot (≈ ' + t('1') + ' ft) as a referent'; s.tool = 'a tape measure'; }
      var target = good ? r.int(2, 8) * (r.chance(0.5) ? 1 : -1) : r.int(13, 28) * (r.chance(0.5) ? 1 : -1);
      var meas = Math.round(s.est / (1 + target / 100));
      if (s.u === 'in') { s.mF = Math.floor(meas / 12); s.mI = meas % 12; if (s.mI === 0) return null; s.meas = meas; s.measTxt = t(s.mF + '\\text{ ft }' + s.mI + '\\text{ in}'); }
      else { s.meas = meas; s.measTxt = t(meas + '\\text{ ft}'); }
      s.pct = Math.abs(s.est - s.meas) / s.meas * 100; s.ok = s.pct <= 10;
      return s;
    }, function (s) { return s.est !== s.meas && !bord(s.pct, 0, 0.08) && (s.pct < 9 || s.pct > 12); }, { kind: 'hand', who: 'Leo', n: 17, est: 68, obj: 'height of a bookshelf', u: 'in', refTxt: 'hand widths, using his hand width (≈ \\(4\\) in) as a referent', tool: 'a tape measure', mF: 5, mI: 4, meas: 64, measTxt: t('5\\text{ ft }4\\text{ in}'), pct: 6.25, ok: true });
  }

  /* ======================= Q7: thickness from a stack ======================= */
  var STACKS = [
    { what: 'one sheet of paper', item: 'sheet', items: 'sheets', stack: 'a stack of', counts: [200, 250, 400, 500], tmm: [0.08, 0.12] },
    { what: 'one sheet in a novel', item: 'sheet', items: 'sheets', stack: 'the novel’s', tail: ', without the covers,', counts: [100, 125, 200, 250], tmm: [0.07, 0.12] },
    { what: 'one sheet of card stock', item: 'sheet', items: 'sheets', stack: 'a pack of', counts: [100, 125, 200, 250], tmm: [0.2, 0.3] },
    { what: 'one trading card', item: 'card', items: 'cards', stack: 'a box of', counts: [100, 125, 200, 250], tmm: [0.28, 0.36] }];
  var TEACH = ['Mr. Singh', 'Ms. Okafor', 'Mrs. Dube', 'Mr. Chen', 'Ms. Rivera', 'Mr. Haddad'];
  function q7Shared(r) {
    return find(function () {
      var c = r.pick(STACKS), n = r.pick(c.counts), mm = r.int(Math.ceil(n * c.tmm[0]), Math.floor(n * c.tmm[1]));
      return { c: c, n: n, mm: mm, cm: mm / 10, th: mm / n, who: r.pick(TEACH), err: 0.5 / n };
    }, function (s) { return s.mm % 10 !== 0 && !bord(s.th, 3, 0.05); }, { c: STACKS[0], n: 250, mm: 26, cm: 2.6, th: 0.104, who: 'Mr. Singh', err: 0.002 });
  }

  /* ======================= Q8: choose the instrument ======================= */
  var INSTR_ROWS = [{ id: 'ruler', html: 'Ruler (mm marks)' }, { id: 'vern', html: 'Vernier caliper (0.05 mm)' }, { id: 'mic', html: 'Micrometer (0.01 mm)' }];
  var INSTR_COLS = [{ id: 'best', html: 'Best choice' }, { id: 'coarse', html: 'Not precise enough' }, { id: 'cant', html: 'Can’t measure this' }];
  function q8Shared(r) {
    var kind = r.pick(['inside', 'thick', 'depth']), s = { kind: kind };
    if (kind === 'inside') {
      var o = r.pick([['A bike needs a new seat post. Posts come in diameters of', 'seat posts', 'the <em>inside</em> diameter of the seat tube'], ['A plumber needs a fitting for a pipe. Fittings come in diameters of', 'fittings', 'the <em>inside</em> diameter of the pipe'], ['A mechanic needs a new bushing. Bushings come in diameters of', 'bushings', 'the <em>inside</em> diameter of the housing'], ['A woodworker needs a dowel for a hole. Dowels come in diameters of', 'dowels', 'the <em>inside</em> diameter of the hole']]);
      var gap = r.pick([0.2, 0.25, 0.3]), base = step(r, 8, 30, 0.5);
      s.text = o[0] + ' ' + [base, base + gap, base + 2 * gap].map(function (v) { return t(fx(v, gap === 0.25 ? 2 : 1)) + ' mm'; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + ', so ' + o[2] + ' must be measured.';
      s.want = { ruler: 'coarse', vern: 'best', mic: 'cant' }; s.gap = gap; s.dim = 'an inside diameter';
    } else if (kind === 'thick') {
      var o2 = r.pick([['A jeweller is replacing a broken silver wire. Wire comes in thicknesses of', 'the <em>thickness</em> of the old wire'], ['A guitar tech is replacing a string. Strings come in thicknesses of', 'the <em>thickness</em> of the old string'], ['A machinist needs a shim. Shims come in thicknesses of', 'the <em>thickness</em> of the gap’s old shim'], ['A sign maker needs more aluminum sheet. Sheets come in thicknesses of', 'the <em>thickness</em> of the old sheet']]);
      var g2 = r.pick([0.05, 0.02, 0.04]), b2 = step(r, 0.4, 2.0, 0.1);
      s.text = o2[0] + ' ' + [b2, b2 + g2, b2 + 2 * g2].map(function (v) { return t(fx(v, 2)) + ' mm'; }).join(', ').replace(/, ([^,]*)$/, ' and $1') + ', so ' + o2[1] + ' must be measured.';
      s.want = { ruler: 'coarse', vern: 'coarse', mic: 'best' }; s.gap = g2; s.dim = 'a small thickness';
    } else {
      var o3 = r.pick([['A machinist drills a hole for a dowel. The hole must be', 'the <em>depth</em> of the hole'], ['A cabinet maker cuts a groove for a shelf. The groove must be', 'the <em>depth</em> of the groove'], ['A mechanic cuts a slot in a metal block. The slot must be', 'the <em>depth</em> of the slot'], ['A jeweller drills a hole for a gem setting. The hole must be', 'the <em>depth</em> of the hole']]);
      var tol = r.pick([0.1, 0.2, 0.15]), d3 = step(r, 6, 30, 0.5);
      s.text = o3[0] + ' ' + t(fx(d3, 1)) + ' mm deep, give or take ' + t(fx(tol, tol === 0.15 ? 2 : 1)) + ' mm, so ' + o3[1] + ' must be measured.';
      s.want = { ruler: 'coarse', vern: 'best', mic: 'cant' }; s.gap = tol; s.dim = 'a depth';
    }
    return s;
  }

  /* ======================= Q11 / Q13 / Q14 helpers ======================= */
  function chain(fs) { return fs.map(function (f) { return '\\dfrac{' + f[0] + '}{' + f[1] + '}'; }).join('\\times '); }

  /* ======================= Q21: scaling ======================= */
  var SOLIDS21 = {
    cone: { name: 'cone-shaped sand pile', short: 'cone', lin: 'radius', V: 'V=\\tfrac13\\pi r^2h', vars: 'r' },
    cyl: { name: 'cylindrical water tank', short: 'cylinder', lin: 'radius', V: 'V=\\pi r^2h', vars: 'r' },
    pyr: { name: 'square-based pyramid', short: 'pyramid', lin: 'base side', V: 'V=\\tfrac13b^2h', vars: 'b' }
  };
  var KW = { 2: 'doubled', 3: 'tripled', 0.5: 'halved' }, MW = { 1: 'stays the same', 2: 'is doubled', 3: 'is tripled', 4: 'is multiplied by ' + t('4'), 0.5: 'is halved', 0.25: 'is cut to one quarter' };
  var MW3 = 'is cut to one third';
  function fracT(x) { return near(x, 1 / 3) ? '\\tfrac13' : near(x, 0.25) ? '\\tfrac14' : near(x, 0.5) ? '\\tfrac12' : N(x); }

  /* ======================= the test ======================= */
  HW.defineTest({
    id: 'u10test', unit: 10, title: 'Unit 10 Test', outcome: 'M1', calc: true,
    blurb: 'The Unit 10 outcomes-based test: M1 (referents, rulers, micrometers and vernier calipers, measuring strategies), M2 (SI and imperial conversions, rates and costs) and M3 (surface area and volume of prisms, cylinders, pyramids, cones, spheres and composite solids), each at the BEG, PRG and MAS levels.',
    questions: [
      /* ======================= M1 · Beginning ======================= */
      { num: '1', outcome: 'M1', shared: q1Shared,
        stem: 'For each length, choose the <b>best referent</b> and a sensible <b>unit</b>.<br>' + REF_LIST,
        parts: [
          { id: '1a', outcome: 'M1', level: 'BEG', make: function (r, s) {
            var rows = s.rows.map(function (x, i) { return { id: 'r' + i, html: cap(x.obj), label: x.obj }; }), want = {};
            s.rows.forEach(function (x, i) { want['r' + i] = x.cat; });
            var cols = REF_IDS.map(function (c) { return { id: c, html: REF[c].name, label: REF[c].name }; });
            return gridP('Choose the best referent for each length: ' + s.rows.map(function (x) { return x.obj; }).join(', ') + '.', rows, cols, want, function (rid, got) {
              var x = s.rows[Number(rid.slice(1))], w = REF[x.cat], g = REF[got];
              return g.cm < w.cm ? 'A ' + g.name + ' is small next to the ' + x.obj + ': you would lay it down many times, and every placement adds error. Try a bigger referent.' : 'A ' + g.name + ' (about ' + t(g.cm) + ' cm) is bigger than the whole ' + x.obj + '. Pick a smaller referent.';
            }, s.rows.map(function (x) { return cap(x.obj) + ': <b>' + REF[x.cat].name + '</b> (about ' + t(REF[x.cat].cm) + ' cm)'; }).join('<br>') + '<br>Choose the referent closest in size to the length, so it is laid down only a few times.',
              ['Picture each length: is it a few centimetres, tens of centimetres, or several metres?', 'The best referent is the one you would lay down only a few times.'], 'referents: ' + s.rows.map(function (x) { return x.obj; }).join(', '), { rowHead: 'Length' });
          } },
          { id: '1b', outcome: 'M1', level: 'BEG', make: function (r, s) {
            var rows = s.rows.map(function (x, i) { return { id: 'r' + i, html: cap(x.obj), label: x.obj }; }), want = {};
            s.rows.forEach(function (x, i) { want['r' + i] = x.cat === 'pace' ? ['m', 'yd'] : ['cm', 'in']; });
            var cols = [{ id: 'cm', html: 'cm' }, { id: 'm', html: 'm' }, { id: 'in', html: 'in' }, { id: 'yd', html: 'yd' }];
            return gridP('Choose a sensible unit for each length: ' + s.rows.map(function (x) { return x.obj; }).join(', ') + '.', rows, cols, want, function (rid, got) {
              var x = s.rows[Number(rid.slice(1))];
              return x.cat === 'pace' ? 'The ' + x.obj + ' is several metres long: centimetres or inches would give a huge number. Use metres or yards.' : 'The ' + x.obj + ' is less than a metre: metres or yards would give a small decimal. Use centimetres or inches.';
            }, s.rows.map(function (x) { return cap(x.obj) + ': <b>' + (x.cat === 'pace' ? 'm or yd' : 'cm or in') + '</b>'; }).join('<br>') + '<br>Short lengths (less than a metre) suit centimetres or inches; lengths of several metres suit metres or yards.',
              ['Is the length less than a metre, or several metres?'], 'units: ' + s.rows.map(function (x) { return x.obj; }).join(', '), { rowHead: 'Length' });
          } }] },
      { num: '2', outcome: 'M1', stem: 'Estimate with a referent.', parts: [
        { id: '2', outcome: 'M1', level: 'BEG', make: function (r) {
          var e = r.pick(EST), k = r.int(0, e.ctx.length - 1), n = r.int(e.lo, e.hi), who = r.pick(NAMES), cm = n * e.cm, m = cl(cm / 100);
          return numP(who + ' ' + e.ctx[k].replace(/\b(his|her)\b/, 'a') + ' and counts ' + t(n) + ' ' + e.unit + '. ' + who + '’s ' + e.ref + ' is about ' + t(e.cm) + ' cm. Estimate the ' + (e.ref === 'pace' ? 'length' : /height/.test(e.ctx[k]) ? 'height' : /width/.test(e.ctx[k]) ? 'width' : 'length') + ' of the ' + e.what[k] + ', in metres.',
            m, null, U('m'), [A(cm, 'u10t-cm-not-m', 'That is the estimate in <b>centimetres</b>. Divide by ' + t('100') + ' to change it to metres.'), A(cm / 1000, 'u10t-conv-places', 'There are ' + t('100') + ' cm in a metre, not ' + t('1000') + '.'), A(cm / 10, 'u10t-conv-places', 'There are ' + t('100') + ' cm in a metre, not ' + t('10') + '.'), A(n, 'u10t-est-count', 'That is the number of ' + e.unit + '. Multiply by the size of one ' + e.ref + '.')],
            t(n + '\\times' + e.cm + '=' + F(cm) + '\\text{ cm}') + '<br>' + t(F(cm) + '\\text{ cm}\\div100=\\mathbf{' + N(m) + '}\\text{ m}'),
            ['Multiply the count by the size of the referent.', 'Then change centimetres to metres: divide by ' + t('100') + '.'], 'referent estimate ' + n + ' × ' + e.cm);
        } }] },
      { num: '3', outcome: 'M1', shared: function (r) {
          return find(function () { var a = r.pick([1, 2]), Lt = r.int(30, 59); return { a: a, Lt: Lt, len: Lt / 10, b: a + Lt / 10, obj: r.pick([['screw', 'screw'], ['bolt', 'bolt'], ['nail', 'nail'], ['crayon', 'crayon'], ['pencil stub', 'crayon']]) }; }, function (s) { return s.Lt % 10 !== 0 && s.b <= 6.9; }, { a: 1, Lt: 57, len: 5.7, b: 6.7, obj: ['screw', 'screw'] });
        },
        stem: function (s) { return 'The ' + s.obj[0] + ' lies on a centimetre ruler.' + rulerSvg(s.a, s.b, s.obj[1]); },
        parts: [
          { id: '3', outcome: 'M1', level: 'BEG', make: function (r, s) {
            var cm = cl(s.len), mm = Math.round(s.len * 10), b = cl(s.b);
            return fieldsP('Find the length of the ' + s.obj[0] + ' in centimetres and in millimetres.', [
              { name: 'Length in cm', label: 'Length:', after: U('cm'), x: cm, alts: [A(b, 'u10t-ruler-start', 'The ' + s.obj[0] + ' doesn’t start at ' + t('0') + '. Subtract the start mark from the end mark.'), A(mm, 'u10t-unit-slip', 'That is the length in millimetres. This box is centimetres.'), A(cm + 0.1, 'u10t-read-slip', 'Count the millimetre marks again at each end.'), A(cm - 0.1, 'u10t-read-slip', 'Count the millimetre marks again at each end.')] },
              { name: 'Length in mm', label: 'Length:', after: U('mm'), x: mm, alts: [A(cm, 'u10t-unit-slip', 'That is the length in centimetres. There are ' + t('10') + ' mm in a centimetre.'), A(Math.round(b * 10), 'u10t-ruler-start', 'Subtract the start mark: the ' + s.obj[0] + ' starts at ' + t(s.a) + ' cm.'), A(cm * 100, 'u10t-conv-places', 'There are ' + t('10') + ' mm in a centimetre, not ' + t('100') + '.')] }],
              'It starts at the ' + t(s.a) + ' cm mark and ends at ' + t(N(b)) + ' cm: ' + t(N(b) + '-' + s.a + '.0=\\mathbf{' + N(cm) + '}\\text{ cm}') + '.<br>' + t(N(cm) + '\\text{ cm}\\times10=\\mathbf{' + mm + '}\\text{ mm}') + '.',
              ['Read both ends: length = end mark − start mark.', 'Each small mark is ' + t('1') + ' mm; ' + t('1\\text{ cm}=10\\text{ mm}') + '.'], 'ruler ' + s.a + '–' + s.b);
          } }] },

      /* ======================= M1 · Progressing ======================= */
      { num: '4', outcome: 'M1', stem: '', parts: [
        { id: '4', outcome: 'M1', level: 'PRG', make: function (r) {
          var h = r.int(9, 25), f = r.int(10, 49), c = 0.5 * h, x = cl(c + 0.01 * f), half = h % 2 === 1;
          return numP('Read the micrometer, in millimetres.' + micSvg(h, f), x, null, U('mm'), micAlts(h, f),
            '<b>Coarse</b> (sleeve): the last mark the thimble has uncovered is ' + (half ? 'the half-millimetre mark below the line past ' + t(Math.floor(c)) + ', so ' + t(fx(c, 1) + '\\text{ mm}') : 'the whole-millimetre mark ' + t(c) + ' (no half mark is showing below the line), so ' + t(fx(c, 1) + '\\text{ mm}')) + '.<br><b>Fine</b> (thimble): the index line is on mark ' + t(f) + ', so ' + t(f + '\\times0.01=' + fx(0.01 * f, 2) + '\\text{ mm}') + '.<br>' + t(fx(c, 1) + '+' + fx(0.01 * f, 2) + '=\\mathbf{' + fx(x, 2) + '}\\text{ mm}') + '.',
            ['Coarse reading: the last sleeve mark the thimble has uncovered — whole millimetres above the line, half millimetres below it.', 'Fine reading: the thimble number on the index line, times ' + t('0.01') + ' mm.'], 'micrometer ' + fx(x, 2),
            { exactDp: 2, precisionHint: 'Right value! A micrometer reads to ' + t('0.01') + ' mm, so state the reading with two decimals: ' + t(fx(x, 2)) + ' mm.' });
        } }] },
      { num: '5', outcome: 'M1', stem: '', parts: [
        { id: '5', outcome: 'M1', level: 'PRG', make: function (r) {
          var M = r.int(12, 40), Nf = r.int(1, 19), x = cl(M + 0.05 * Nf);
          return numP('Read the vernier caliper, in millimetres.' + vernSvg(M, Nf), x, null, U('mm'), vernAlts(M, Nf),
            '<b>Coarse</b> (main scale): the index — the vernier’s 0 — has passed the ' + t(M) + ' mm mark, so the coarse reading is ' + t(M + '\\text{ mm}') + '.<br><b>Fine</b> (vernier): mark ' + t(Nf) + ' lines up with a main-scale mark, so ' + t(Nf + '\\times0.05=' + fx(0.05 * Nf, 2) + '\\text{ mm}') + '.<br>' + t(M + '+' + fx(0.05 * Nf, 2) + '=\\mathbf{' + fx(x, 2) + '}\\text{ mm}') + ', written to two decimals because the caliper reads to ' + t('0.05') + ' mm.',
            ['Coarse reading: the last whole millimetre on the main scale <b>at or before</b> the vernier’s 0 (the red index).', 'Fine reading: find the one vernier mark that lines up exactly with a main-scale mark; multiply its number by ' + t('0.05') + ' mm.'], 'vernier ' + fx(x, 2),
            { exactDp: 2, precisionHint: 'Right value! A caliper reads to ' + t('0.05') + ' mm, so state the reading with two decimals: ' + t(fx(x, 2)) + ' mm.' });
        } }] },
      { num: '6', outcome: 'M1', shared: q6Shared,
        stem: function (s) { return s.who + ' estimated the ' + s.obj + ' as ' + t(s.n) + ' ' + s.refTxt + '. With ' + s.tool + ', it measures ' + s.measTxt + '. Was the estimate reasonable?<br><span style="font-size:0.92em">Use: an estimate within ' + t('10\\%') + ' of the measured length is reasonable.<br>Percent difference ' + t('=\\dfrac{|\\text{estimate}-\\text{measured}|}{\\text{measured}}\\times100\\%') + '.</span>'; },
        parts: [
          { id: '6', outcome: 'M1', level: 'PRG', make: function (r, s) {
            var u = s.u, unitW = u === 'in' ? 'inches' : 'feet', estAlts = [A(s.n, 'u10t-est-count', 'That is the number of ' + s.refTxt.split(',')[0] + '. Multiply by the size of the referent.')];
            if (s.kind === 'pace') estAlts.push(A(s.n * 36, 'u10t-conv-dir', 'That is in inches. Give the estimate in <b>feet</b>: ' + t('1\\text{ yd}=3\\text{ ft}') + '.'));
            if (s.kind === 'foot') estAlts.push(A(s.n * 10, 'u10t-ftin-dec', 'A foot has ' + t('12') + ' inches, not ' + t('10') + '.'));
            if (s.kind === 'hand') estAlts.push(A(s.n * 10, 'u10t-conv-dir', 'Use the hand width in <b>inches</b> (' + t('4') + ' in), not centimetres.'));
            var measAlts = s.u === 'in' ? [A(s.mF * 10 + s.mI, 'u10t-ftin-dec', 'A foot has ' + t('12') + ' inches, not ' + t('10') + ': ' + t(s.mF + '\\text{ ft }' + s.mI + '\\text{ in}=' + s.mF + '(12)+' + s.mI) + '.'), A(s.mF * 12, 'u10t-ftin-noin', 'Add the ' + t(s.mI) + ' extra inches.'), A(s.mF + s.mI, 'u10t-ftin-dec', 'Change the feet to inches first: ' + t(s.mF + '\\times12') + '.')] : [];
            var diff = Math.abs(s.est - s.meas), pAlts = [A(diff / s.est * 100, 'u10t-pct-base', 'Divide by the <b>measured</b> (true) length, not the estimate.'), A(diff, 'u10t-pct-diff', 'That is the difference in ' + unitW + '. Divide it by the measured length and multiply by ' + t('100') + '.'), A(diff / s.meas, 'u10t-pct-diff', 'That is a decimal. Multiply by ' + t('100') + ' to make it a percent.')];
            var conc = s.ok ? 'Within ' + t('10\\%') + ', so the estimate <b>is reasonable</b>.' : 'More than ' + t('10\\%') + ', so the estimate is <b>not reasonable</b>' + (s.kind === 'foot' ? ' (the foot is about ' + t(dots(s.meas / s.n, 1).replace('\\ldots', '')) + ' in, not ' + t('12') + ' in)' : '') + '.';
            var p = fieldsP('Find the estimate and the measured length in ' + unitW + ', then the percent difference (to the nearest whole percent). Was the estimate reasonable? (yes or no)', [
              { name: 'Estimate', label: 'Estimate:', after: U(u), x: s.est, alts: estAlts },
              { name: 'Measured', label: 'Measured:', after: U(u), x: s.meas, alts: measAlts },
              { name: 'Percent difference', label: 'Percent difference:', afterHtml: '%', x: s.pct, dp: 0, alts: pAlts },
              { name: 'Reasonable?', label: 'Reasonable?', mode: 'text', wide: true, placeholder: 'yes or no', check: ynCk(s.ok, 'Compare your percent with ' + t('10\\%') + '.'), key: s.ok ? 'yes' : 'no', ans: '<b>' + (s.ok ? 'yes' : 'no') + '</b>' }],
              'Estimate: ' + t(s.n + '\\times' + (s.kind === 'hand' ? '4\\text{ in}' : s.kind === 'pace' ? '3\\text{ ft}' : '12\\text{ in}') + '=' + s.est + U(u)) + '.<br>Measured: ' + (u === 'in' ? t(s.mF + '(12)+' + s.mI + '=' + s.meas + '\\text{ in}') : t(s.meas + '\\text{ ft}')) + '.<br>Difference: ' + t('|' + s.est + '-' + s.meas + '|=' + diff + U(u)) + '; ' + t('\\dfrac{' + diff + '}{' + s.meas + '}\\times100\\%\\approx\\mathbf{' + fx(s.pct, 0) + '\\%}') + '.<br>' + conc,
              ['Change both lengths to the same unit (' + unitW + ').', 'Percent difference = difference ÷ measured × 100%. Then compare with ' + t('10\\%') + '.'], 'estimate check ' + s.kind + ' ' + s.est + ' vs ' + s.meas,
              [[String(s.est), String(s.meas), fx(s.pct, 0), s.ok ? 'no' : 'yes']]);
            return p;
          } }] },

      /* ======================= M1 · Mastery ======================= */
      { num: '7', outcome: 'M1', shared: q7Shared,
        stem: function (s) { return s.who + ' wants the thickness of ' + s.c.what + ', but the only tool is a ruler marked in millimetres. ' + cap(s.c.stack) + ' ' + t(s.n) + ' ' + s.c.items + (s.c.tail || '') + ' measures ' + t(N(s.cm)) + ' cm.'; },
        parts: [
          { id: '7a', sub: 'a', outcome: 'M1', level: 'MAS', make: function (r, s) {
            return numP('Find the thickness of one ' + s.c.item + ', in millimetres, to the nearest thousandth.', s.th, 3, U('mm'), [A(s.cm / s.n, 'u10t-stack-cm', 'Change the stack to millimetres first: ' + t(N(s.cm) + '\\text{ cm}=' + s.mm + '\\text{ mm}') + '.'), A(s.n / s.mm, 'u10t-stack-flip', 'Divide the stack’s thickness by the number of ' + s.c.items + ', not the other way round.'), A(s.mm, 'u10t-stack-whole', 'That is the whole stack. Share it among the ' + t(s.n) + ' ' + s.c.items + '.')],
              t(N(s.cm) + '\\text{ cm}=' + s.mm + '\\text{ mm}') + '<br>' + t(s.mm + '\\div' + s.n + '=' + N(s.th) + ap(s.th, 3, 'mm')),
              ['Change the stack’s thickness to millimetres.', 'Divide by the number of ' + s.c.items + '.'], 'stack ' + s.mm + '/' + s.n);
          } },
          { id: '7bi', sub: 'b i', outcome: 'M1', level: 'MAS', make: function (r, s) {
            var it = s.c.item, its = s.c.items, n = s.n;
            var T = [{ html: 'One ' + it + ' is thinner than ' + t('1') + ' mm, the smallest mark on the ruler, so it can’t be measured on its own.', v: 'T' },
              { html: 'Dividing the stack’s reading by ' + t(n) + ' also divides its reading error by ' + t(n) + '.', v: 'T' },
              { html: 'A stack with more ' + its + ' would give a more precise answer for one ' + it + '.', v: 'T' }];
            var Fs = [{ html: 'Measuring a stack removes the reading error completely.', v: 'F', why: 'The stack reading still has an error (up to ' + t('0.5') + ' mm); dividing by ' + t(n) + ' makes it tiny, not zero.' },
              { html: 'A ruler marked in millimetres can measure one ' + it + ' to the nearest ' + t('0.1') + ' mm.', v: 'F', why: 'A millimetre ruler reads only to about the nearest millimetre (or half millimetre), far coarser than one ' + it + '.' },
              { html: 'The error for one ' + it + ' is the same as the error for the whole stack.', v: 'F', why: 'Dividing the reading by ' + t(n) + ' divides its error by ' + t(n) + ' too.' },
              { html: 'Stacking makes each ' + it + ' thicker, so it is easier to see.', v: 'F', why: 'Each ' + it + ' stays the same; it is the <b>total</b> that becomes big enough to read.' }];
            var pick = r.shuffle(r.sample(T, 2).concat(r.sample(Fs, 2)));
            var rows = pick.map(function (x, i) { return { id: 's' + i, html: x.html, label: 'statement ' + (i + 1) }; }), want = {};
            pick.forEach(function (x, i) { want['s' + i] = x.v; });
            return gridP('Why is measuring the stack a better strategy than measuring one ' + it + '? Mark each statement <b>true</b> or <b>false</b>.', rows, [{ id: 'T', html: 'True' }, { id: 'F', html: 'False' }], want,
              function (rid) { var x = pick[Number(rid.slice(1))]; return x.v === 'T' ? '“' + x.html.replace(/<[^>]+>/g, '') + '” is true — think again about what dividing does to the measurement and its error.' : x.why; },
              pick.map(function (x) { return x.html + ' <b>' + (x.v === 'T' ? 'True' : 'False') + '.</b>' + (x.why ? ' ' + x.why : ''); }).join('<br>') + '<br>One ' + it + ' is far thinner than the smallest mark and can’t be read; the stack can. Dividing the reading by ' + t(n) + ' divides its error by ' + t(n) + ' too, so a big stack gives a precise result.',
              ['Compare one ' + it + ' with the smallest mark on the ruler.', 'What happens to a reading error of ' + t('0.5') + ' mm when the reading is divided by ' + t(n) + '?'], 'stack strategy statements', { rowHead: 'Statement' });
          } },
          { id: '7bii', sub: 'b ii', outcome: 'M1', level: 'MAS', make: function (r, s) {
            return numP('The stack reading could be off by up to ' + t('0.5') + ' mm. How far off could the answer for one ' + s.c.item + ' be, in millimetres?', s.err, null, U('mm'), [A(0.5, 'u10t-err-whole', 'That is the error for the whole stack. The answer for one ' + s.c.item + ' was found by dividing by ' + t(s.n) + ', so divide the error too.'), A(0.5 * s.n, 'u10t-err-times', 'Dividing the reading by ' + t(s.n) + ' divides the error by ' + t(s.n) + ' — it doesn’t multiply it.'), A(0.05 / s.n, 'u10t-unit-slip', 'The error is ' + t('0.5') + ' <b>mm</b>; no change of unit is needed.')],
              t('0.5\\text{ mm}\\div' + s.n + '=\\mathbf{' + N(s.err) + '}\\text{ mm}') + ': dividing the reading by ' + t(s.n) + ' also divides its error by ' + t(s.n) + '.',
              ['The one-' + s.c.item + ' answer is the stack reading ÷ ' + t(s.n) + '. Do the same to the error.'], 'stack error 0.5/' + s.n);
          } }] },
      { num: '8', outcome: 'M1', shared: q8Shared,
        stem: function (s) { return s.text; },
        parts: [
          { id: '8', outcome: 'M1', level: 'MAS', make: function (r, s) {
            var why = function (rid, got) {
              if (rid === 'ruler') return 'A ruler reads only to the nearest millimetre — far too coarse for a difference of ' + t(N(s.gap)) + ' mm.';
              if (rid === 'mic') return s.kind === 'thick' ? 'A micrometer measures small thicknesses to ' + t('0.01') + ' mm, much finer than the ' + t(N(s.gap)) + ' mm needed here.' : 'A micrometer is precise (' + t('0.01') + ' mm), but it measures only <b>outside</b> dimensions between its anvil and spindle: it can’t measure ' + s.dim + '.';
              return s.kind === 'thick' ? 'A vernier caliper reads to ' + t('0.05') + ' mm' + (s.gap <= 0.05 ? ', no finer than the ' + t(N(s.gap)) + ' mm between sizes: a one-division slip gives the wrong size.' : '.') : 'A vernier caliper ' + (s.kind === 'depth' ? 'has a depth rod for depths' : 'has inside jaws for inside diameters') + ' and reads to ' + t('0.05') + ' mm, finer than the ' + t(N(s.gap)) + ' mm needed.';
            };
            var nm = { best: 'best choice', coarse: 'not precise enough', cant: 'can’t measure this' };
            return gridP('Which instrument should be used? For each one, choose whether it is the <b>best choice</b>, <b>not precise enough</b>, or <b>can’t measure</b> this kind of dimension.', INSTR_ROWS, INSTR_COLS, s.want, why,
              INSTR_ROWS.map(function (rw) { return '<b>' + rw.html + ': ' + nm[s.want[rw.id]] + '.</b> ' + why(rw.id); }).join('<br>'),
              ['Which instruments can reach ' + s.dim + '?', 'Compare each instrument’s precision with the ' + t(N(s.gap)) + ' mm the job needs.'], 'instrument choice ' + s.kind + ' ' + s.gap, { rowHead: 'Instrument' });
          } }] },

      /* ======================= M2 · Beginning ======================= */
      { num: '9', outcome: 'M2', stem: 'Convert. Use the conversion factors.' + CONV, parts: [
        { id: '9a', sub: 'a', outcome: 'M2', level: 'BEG', make: function (r) {
          var km = r.chance(0.5), v = km ? step(r, 0.05, 9.95, 0.01) : step(r, 0.25, 9.95, 0.01), f = km ? 1000 : 100, x = cl(v * f), fu = km ? 'km' : 'm', tu = km ? 'm' : 'cm';
          return numP(t(N(v) + U(fu) + '=\\ ?' + U(tu)), x, null, U(tu), [A(v / f, 'u10t-conv-dir', 'A ' + (km ? 'metre' : 'centimetre') + ' is smaller than a ' + (km ? 'kilometre' : 'metre') + ', so the number must get <b>bigger</b>: multiply.'), A(v * f / 10, 'u10t-conv-places', 'Check the factor: ' + t('1' + U(fu) + '=' + f + U(tu)) + '.'), A(v * f * 10, 'u10t-conv-places', 'Check the factor: ' + t('1' + U(fu) + '=' + f + U(tu)) + '.')],
            t(N(v) + '\\times' + f + '=\\mathbf{' + N(x) + '}' + U(tu)) + ' (a smaller unit, so a bigger number).', ['A smaller unit needs a bigger number: multiply by ' + t(f) + '.'], 'convert ' + v + fu);
        } },
        { id: '9b', sub: 'b', outcome: 'M2', level: 'BEG', make: function (r) {
          var k = r.pick(['mm-m', 'mm-cm', 'cm-m']), v = k === 'mm-m' ? r.int(1050, 9990) : k === 'mm-cm' ? r.int(12, 98) : r.int(120, 950), f = k === 'mm-m' ? 1000 : k === 'mm-cm' ? 10 : 100, fu = k.split('-')[0], tu = k.split('-')[1], x = cl(v / f);
          if (v % 10 === 0 && k !== 'mm-cm') v += 3, x = cl(v / f);
          return numP(t(F(v) + U(fu) + '=\\ ?' + U(tu)), x, null, U(tu), [A(v * f, 'u10t-conv-dir', 'A ' + (tu === 'm' ? 'metre' : 'centimetre') + ' is bigger than a ' + (fu === 'mm' ? 'millimetre' : 'centimetre') + ', so the number must get <b>smaller</b>: divide.'), A(v / f * 10, 'u10t-conv-places', 'Check the factor: ' + t('1' + U(tu) + '=' + f + U(fu)) + '.'), A(v / f / 10, 'u10t-conv-places', 'Check the factor: ' + t('1' + U(tu) + '=' + f + U(fu)) + '.')],
            t(F(v) + '\\div' + F(f) + '=\\mathbf{' + N(x) + '}' + U(tu)) + (k === 'mm-m' ? ' (mm → cm → m: ' + t('\\div10') + ', then ' + t('\\div100') + ')' : '') + '.', ['A bigger unit needs a smaller number: divide by ' + t(F(f)) + '.'], 'convert ' + v + fu);
        } },
        { id: '9c', sub: 'c', outcome: 'M2', level: 'BEG', make: function (r) {
          var Fv = r.int(3, 9), I = r.int(1, 11), x = 12 * Fv + I;
          return numP(t(Fv + '\\text{ ft }' + I + '\\text{ in}=\\ ?\\text{ in}'), x, null, U('in'), [A(10 * Fv + I, 'u10t-ftin-dec', 'A foot has ' + t('12') + ' inches, not ' + t('10') + '.'), A(12 * Fv, 'u10t-ftin-noin', 'Add the extra ' + t(I) + ' in.'), A(Fv + I, 'u10t-no-convert', 'Change the feet to inches first: ' + t(Fv + '\\times12') + '.')],
            t(Fv + '\\times12+' + I + '=\\mathbf{' + x + '}\\text{ in}'), ['Change the feet to inches (' + t('\\times12') + '), then add the inches.'], 'ft-in to in ' + Fv + ',' + I);
        } },
        { id: '9d', sub: 'd', outcome: 'M2', level: 'BEG', make: function (r) {
          var k = r.pick(['yd-ft', 'mi-ft', 'ft-yd', 'ft-in']), v, x, f, fu, tu, mult;
          if (k === 'yd-ft') { v = r.int(5, 40); f = 3; mult = true; fu = 'yd'; tu = 'ft'; }
          else if (k === 'mi-ft') { v = r.int(2, 6); f = 5280; mult = true; fu = 'mi'; tu = 'ft'; }
          else if (k === 'ft-yd') { v = 3 * r.int(8, 30); f = 3; mult = false; fu = 'ft'; tu = 'yd'; }
          else { v = r.int(3, 15); f = 12; mult = true; fu = 'ft'; tu = 'in'; }
          x = mult ? v * f : v / f;
          return numP(t(F(v) + U(fu) + '=\\ ?' + U(tu)), x, null, U(tu), [A(mult ? v / f : v * f, 'u10t-conv-dir', mult ? 'The new unit is smaller, so the number must get <b>bigger</b>: multiply.' : 'The new unit is bigger, so the number must get <b>smaller</b>: divide.')],
            t(F(v) + (mult ? '\\times' : '\\div') + F(f) + '=\\mathbf{' + F(x) + '}' + U(tu)) + ' (' + t('1' + U(mult ? fu : tu) + '=' + F(f) + U(mult ? tu : fu)) + ').', ['Is the new unit bigger or smaller? A smaller unit needs a bigger number.'], 'convert ' + v + fu + ' to ' + tu);
        } },
        { id: '9e', sub: 'e', outcome: 'M2', level: 'BEG', make: function (r) {
          var tot = find(function () { return r.int(40, 140); }, function (v) { return v % 12 !== 0; }, 100), Fv = Math.floor(tot / 12), I = tot % 12, d = tot / 12;
          var ck = ftInCk(tot, function (T, a, b) {
            if (near(a, Math.floor(tot / 10)) && near(b, tot % 10)) return { code: 'u10t-ftin-dec', hint: 'A foot has ' + t('12') + ' inches, not ' + t('10') + '. Divide by ' + t('12') + '.' };
            if (near(a, Math.floor(d)) && (near(b, Math.round((d - Math.floor(d)) * 100)) || near(b, Math.round((d - Math.floor(d)) * 10)))) return { code: 'u10t-ftin-dec', hint: 'The decimal part of ' + t(fx(d, 2)) + ' ft is not inches. Find the remainder: ' + t(tot + '-' + Math.floor(d) + '\\times12') + '.' };
            return null;
          });
          var p = P.fields(t(tot + '\\text{ in}=\\ ?\\text{ ft }\\ ?\\text{ in}'), [{ name: 'feet', after: 'ft' }, { name: 'inches', after: 'in' }], [function (resp) { return ck(resp); }],
            [String(Fv), String(I)], t(ftinT(tot)), t(tot + '\\div12=' + Fv) + ' remainder ' + t(I) + ', so ' + t(tot + '\\text{ in}=\\mathbf{' + Fv + '}\\text{ ft }\\mathbf{' + I + '}\\text{ in}') + '.',
            ['Divide by ' + t('12') + ': the whole number is feet, the remainder is inches.'], 'in to ft-in ' + tot);
          p.check = ck;
          p.bad = [[String(Math.floor(tot / 10)), String(tot % 10)], [String(Fv), String(I + 1)]].filter(function (b) { return p.check(b).v !== 'correct'; });
          return p;
        } }] },
      { num: '10', outcome: 'M2', stem: 'Use the conversion factors.' + CONV, parts: [
        { id: '10', outcome: 'M2', level: 'BEG', make: function (r) {
          var it = r.pick([['A roll of ribbon', 'pieces'], ['A board', 'shelves'], ['A roll of tape', 'strips'], ['A rope', 'pieces'], ['A length of wire', 'pieces'], ['A roll of fabric', 'strips']]);
          var v = find(function () { var p = r.pick([20, 25, 30, 40, 45, 50, 60, 75, 80]), n = r.int(8, 30); return { p: p, n: n, Lm: n * p / 100 }; }, function (v) { return (v.n * v.p) % 10 === 0 && v.Lm >= 3 && v.Lm <= 12; }, { p: 45, n: 20, Lm: 9 });
          var Lc = v.n * v.p;
          return numP(it[0] + ' is ' + t(N(v.Lm)) + ' m long. How many ' + t(v.p) + ' cm ' + it[1] + ' can be cut from it?', v.n, null, '', [A(v.Lm / v.p, 'u10t-no-convert', 'Change the length to centimetres first: ' + t(N(v.Lm) + '\\text{ m}=' + F(Lc) + '\\text{ cm}') + '.'), A(v.Lm * 10 / v.p, 'u10t-conv-places', 'There are ' + t('100') + ' cm in a metre, not ' + t('10') + '.'), A(v.Lm * 1000 / v.p, 'u10t-conv-places', 'There are ' + t('100') + ' cm in a metre, not ' + t('1000') + '.'), A(v.p / v.Lm, 'u10t-conv-dir', 'Divide the whole length by the length of one piece.')],
            t(N(v.Lm) + '\\text{ m}=' + F(Lc) + '\\text{ cm}') + '<br>' + t(F(Lc) + '\\div' + v.p + '=\\mathbf{' + v.n + '}') + ' ' + it[1] + '.', ['Change metres to centimetres first.', 'Then divide by the length of one piece.'], 'pieces ' + v.Lm + ' m / ' + v.p);
        } }] },

      /* ======================= M2 · Progressing ======================= */
      { num: '11', outcome: 'M2', stem: 'Use a proportion or unit analysis. Show your work.' + CONV, parts: [
        { id: '11a', sub: 'a', outcome: 'M2', level: 'PRG', make: function (r) {
          var v = find(function () { return { F: r.int(4, 6), I: r.int(1, 11), who: r.pick(NAMES) }; }, function (v) { return !bord((12 * v.F + v.I) * IN_CM, 1) && 12 * v.F + v.I >= 54 && 12 * v.F + v.I <= 78; }, { F: 5, I: 6, who: 'Emma' });
          var inch = 12 * v.F + v.I, x = inch * IN_CM;
          return numP(v.who + ' is ' + t(v.F + '\\text{ ft }' + v.I + '\\text{ in}') + ' tall. Find this height in centimetres, to the nearest tenth.', x, 1, U('cm'), [A((v.F + v.I / 10) * 30.48, 'u10t-ftin-dec', t(v.F + '\\text{ ft }' + v.I + '\\text{ in}') + ' is not ' + t(v.F + '.' + v.I + '\\text{ ft}') + ': change it all to inches first.'), A(inch / IN_CM, 'u10t-conv-dir', 'A centimetre is smaller than an inch, so there are <b>more</b> centimetres: multiply by ' + t('2.54') + '.'), A(v.F * 12 * IN_CM, 'u10t-ftin-noin', 'Add the ' + t(v.I) + ' extra inches before converting.'), A(v.F * 30.48, 'u10t-ftin-noin', 'Include the ' + t(v.I) + ' inches.')],
            t(v.F + '\\text{ ft }' + v.I + '\\text{ in}=' + v.F + '(12)+' + v.I + '=' + inch + '\\text{ in}') + '<br>' + t(inch + '\\text{ in}\\times\\dfrac{2.54\\text{ cm}}{1\\text{ in}}=' + N(x) + ap(x, 1, 'cm')),
            ['Change the height to inches first.', 'Then use ' + t('1\\text{ in}=2.54\\text{ cm}') + '.'], 'ft-in to cm ' + v.F + "'" + v.I);
        } },
        { id: '11b', sub: 'b', outcome: 'M2', level: 'PRG', make: function (r) {
          var toMi = r.chance(0.5), v = find(function () { return toMi ? step(r, 5, 50, 0.1) : step(r, 3, 30, 0.1); }, function (v) { return !bord(v * (toMi ? KM_MI : MI_KM), 1) && Math.round(v * 10) % 10 !== 0 || (Math.round(v) % 5 === 0 && !bord(v * (toMi ? KM_MI : MI_KM), 1)); }, toMi ? 42.2 : 13.1);
          var x = v * (toMi ? KM_MI : MI_KM), what = r.pick(['A road race', 'A bike route', 'A hiking trail', 'A ski trail', 'A charity walk']);
          return numP(what + ' is ' + t(N(v) + (toMi ? '\\text{ km}' : '\\text{ mi}')) + ' long. Find its length in ' + (toMi ? 'miles' : 'kilometres') + ', to the nearest tenth.', x, 1, U(toMi ? 'mi' : 'km'), [A(v / (toMi ? KM_MI : MI_KM), 'u10t-conv-dir', toMi ? 'A mile is longer than a kilometre, so there are <b>fewer</b> miles: multiply by ' + t('0.6214') + ' (or divide by ' + t('1.6093') + ').' : 'A kilometre is shorter than a mile, so there are <b>more</b> kilometres: multiply by ' + t('1.6093') + '.'), A(v * (toMi ? MI_KM : KM_MI), 'u10t-conv-dir', 'Check the factor: use ' + t(toMi ? '1\\text{ km}=0.6214\\text{ mi}' : '1\\text{ mi}=1.6093\\text{ km}') + '.')],
            t(N(v) + (toMi ? '\\text{ km}\\times\\dfrac{0.6214\\text{ mi}}{1\\text{ km}}' : '\\text{ mi}\\times\\dfrac{1.6093\\text{ km}}{1\\text{ mi}}') + '=' + dots(x, 3) + ap(x, 1, toMi ? 'mi' : 'km')),
            ['Write the factor so the old unit cancels.'], (toMi ? 'km to mi ' : 'mi to km ') + v);
        } },
        { id: '11c', sub: 'c', outcome: 'M2', level: 'PRG', make: function (r) {
          var v = find(function () { return { m: step(r, 1.5, 1.95, 0.01), who: r.pick(NAMES) }; }, function (v) { return !bord(v.m * 100 / IN_CM, 0, 0.06); }, { m: 1.85, who: 'Jordan' });
          var inch = v.m * 100 / IN_CM, tot = Math.round(inch), d = v.m * 3.2808;
          var ck = ftInCk(tot, function (T, a, b) {
            if (near(a, Math.floor(d)) && (near(b, Math.round((d - Math.floor(d)) * 100)) || near(b, Math.round((d - Math.floor(d)) * 10)))) return { code: 'u10t-ftin-dec', hint: 'The decimal part of ' + t(fx(d, 2)) + ' ft is not inches. Change to inches first, then divide by ' + t('12') + '.' };
            if (near(T, Math.round(v.m * 100 * IN_CM))) return { code: 'u10t-conv-dir', hint: 'An inch is longer than a centimetre, so divide the centimetres by ' + t('2.54') + '.' };
            return null;
          });
          var p = P.fields(v.who + ' is ' + t(N(v.m) + '\\text{ m}') + ' tall. Find this height in feet and inches, to the nearest inch.', [{ name: 'feet', after: 'ft' }, { name: 'inches', after: 'in' }],
            [function (resp) { return ck(resp); }], [String(Math.floor(tot / 12)), String(tot % 12)], t(ftinT(tot)),
            t(N(v.m) + '\\text{ m}\\times\\dfrac{100\\text{ cm}}{1\\text{ m}}\\times\\dfrac{1\\text{ in}}{2.54\\text{ cm}}=' + FX(inch, 2) + '\\text{ in}\\approx' + tot + '\\text{ in}') + '<br>' + t(tot + '=' + Math.floor(tot / 12) + '(12)+' + (tot % 12)) + ', so ' + t('\\mathbf{' + Math.floor(tot / 12) + '}\\text{ ft }\\mathbf{' + (tot % 12) + '}\\text{ in}') + '.',
            ['Change metres to inches: ' + t('\\times100\\div2.54') + '. Round to the nearest inch.', 'Then divide by ' + t('12') + ': the remainder is the inches.'], 'm to ft-in ' + v.m);
          p.check = ck;
          var df = Math.floor(d), dIn = Math.round((d - df) * 100);
          p.bad = [[String(df), String(dIn)], [String(Math.floor(tot / 12)), String(tot % 12 + 1)]].filter(function (b) { return dIn < 100 && p.check(b).v !== 'correct'; });
          return p;
        } }] },
      { num: '12', outcome: 'M2', stem: 'Use unit analysis.' + CONV, parts: [
        { id: '12', outcome: 'M2', level: 'PRG', make: function (r) {
          var toMph = r.chance(0.55), c = toMph ? r.pick([['A cheetah can run at', 'mph'], ['A speed skater reaches', 'mph'], ['A racing pigeon can fly at', 'mph'], ['A sprinter reaches', 'mph'], ['A hockey puck travels at', 'mph']]) : r.pick([['The speed limit on a Montana highway is', 'm/s'], ['A car on a US interstate drives at', 'm/s'], ['A school bus in Ohio drives at', 'm/s'], ['A tornado’s winds reach', 'm/s']]);
          var v = find(function () { return toMph ? r.int(8, 40) : 5 * r.int(5, 16); }, function (v) { return !bord(toMph ? v * 3.6 * KM_MI : v * MI_KM / 3.6, 1); }, toMph ? 31 : 65);
          var x = toMph ? v * 3600 / 1000 * KM_MI : v * MI_KM * 1000 / 3600;
          var alts = toMph ? [A(v * 3.6, 'u10t-rate-part', 'That is in km/h. One more factor: change kilometres to miles.'), A(v * 60 / 1000 * KM_MI, 'u10t-rate-time', 'There are ' + t('3600') + ' seconds in an hour, not ' + t('60') + '.'), A(v / 1000 * KM_MI, 'u10t-rate-time', 'Change seconds to hours too: ' + t('\\times\\dfrac{3600\\text{ s}}{1\\text{ h}}') + '.'), A(v * 3.6 * MI_KM, 'u10t-conv-dir', 'Check the km–mi factor: use ' + t('1\\text{ km}=0.6214\\text{ mi}') + '.')]
            : [A(v * MI_KM, 'u10t-rate-part', 'That is in km/h. Change kilometres to metres and hours to seconds as well.'), A(v * MI_KM * 1000 / 60, 'u10t-rate-time', 'There are ' + t('3600') + ' seconds in an hour, not ' + t('60') + '.'), A(v * MI_KM * 1000, 'u10t-rate-time', 'Change hours to seconds too: ' + t('\\times\\dfrac{1\\text{ h}}{3600\\text{ s}}') + '.'), A(v * KM_MI * 1000 / 3600, 'u10t-conv-dir', 'Check the mi–km factor: use ' + t('1\\text{ mi}=1.6093\\text{ km}') + '.')];
          return numP(c[0] + ' ' + t(v + (toMph ? '\\text{ m/s}' : '\\text{ mph}')) + '. Use unit analysis to convert this speed to ' + (toMph ? 'miles per hour' : 'metres per second') + ', to the nearest tenth.', x, 1, U(c[1]), alts,
            t((toMph ? '\\dfrac{' + v + '\\text{ m}}{1\\text{ s}}\\times\\dfrac{3600\\text{ s}}{1\\text{ h}}\\times\\dfrac{1\\text{ km}}{1000\\text{ m}}\\times\\dfrac{0.6214\\text{ mi}}{1\\text{ km}}' : '\\dfrac{' + v + '\\text{ mi}}{1\\text{ h}}\\times\\dfrac{1.6093\\text{ km}}{1\\text{ mi}}\\times\\dfrac{1000\\text{ m}}{1\\text{ km}}\\times\\dfrac{1\\text{ h}}{3600\\text{ s}}')) + '<br>' + t('=' + dots(x, 3) + ap(x, 1, c[1])) + ' (' + (toMph ? 'm, s and km' : 'mi, km and h') + ' all cancel).',
            ['Change one unit at a time: write each factor so the unit you don’t want cancels.', 'There are ' + t('3600') + ' s in an hour.'], 'speed ' + v + (toMph ? ' m/s' : ' mph'));
        } }] },

      /* ======================= M2 · Mastery ======================= */
      { num: '13', outcome: 'M2', shared: function (r) {
          var k = r.pick(['mpg', 'l100', 'price']), s = { k: k, who: r.pick(['Jamal', 'Priya', 'Ella', 'Marco', 'Aisha', 'Tyler']) };
          if (k === 'mpg') s = find(function () { var mpg = r.int(25, 45), kmL = mpg * MI_KM / GAL_L, l = 100 / kmL; return { k: k, who: s.who, mpg: mpg, kmL: kmL, a: l, pr: step(r, 1.35, 1.79, 0.01), D: 10 * r.int(30, 90) }; }, function (v) { return !bord(v.a, 1) && !bord(v.D * v.a / 100 * v.pr, 2, 0.1) && !bord(v.D * rd(v.a, 1) / 100 * v.pr, 2, 0.1); }, null);
          else if (k === 'l100') s = find(function () { var l = step(r, 5.5, 11, 0.1), mpg = 100 / l * GAL_L * KM_MI; return { k: k, who: s.who, l: l, a: mpg, pr: step(r, 2.89, 3.99, 0.01), D: 10 * r.int(20, 60) }; }, function (v) { return !bord(v.a, 1) && !bord(v.D / v.a * v.pr, 2, 0.1) && !bord(v.D / rd(v.a, 1) * v.pr, 2, 0.1); }, null);
          else s = find(function () { var p = step(r, 2.89, 3.99, 0.01), ex = step(r, 1.30, 1.40, 0.01), c = p / GAL_L * ex, ab = step(r, 1.39, 1.69, 0.01); return { k: k, who: s.who, p: p, ex: ex, a: c, ab: ab, T: 5 * r.int(8, 16) }; }, function (v) { return v.ab - v.a > 0.08 && !bord(v.a, 2, 0.08) && !bord((v.ab - v.a) * v.T, 2, 0.1) && !bord((v.ab - rd(v.a, 2)) * v.T, 2, 0.1); }, null);
          return s || { k: 'mpg', who: 'Jamal', mpg: 36, kmL: 36 * MI_KM / GAL_L, a: 100 / (36 * MI_KM / GAL_L), pr: 1.55, D: 540 };
        },
        stem: function (s) {
          if (s.k === 'mpg') return s.who + '’s car, bought in the US, is rated at ' + t(s.mpg) + ' miles per US gallon (mpg).' + CONV;
          if (s.k === 'l100') return s.who + '’s Canadian car uses ' + t(N(s.l)) + ' L of fuel per ' + t('100') + ' km.' + CONV;
          return 'In Montana, gas costs US' + t('\\$' + fx(s.p, 2)) + ' per US gallon. The exchange rate is US' + t('\\$1=') + ' C' + t('\\$' + fx(s.ex, 2)) + '.' + CONV;
        },
        parts: [
          { id: '13a', sub: 'a', outcome: 'M2', level: 'MAS', make: function (r, s) {
            if (s.k === 'mpg') return numP('In Canada, fuel use is given in litres per ' + t('100') + ' km. Convert the rating to L/100 km, to the nearest tenth.', s.a, 1, U('L/100 km'), [A(s.kmL, 'u10t-fuel-kmL', 'That is kilometres per litre. Litres per ' + t('100') + ' km is the other way up: ' + t('100\\div' + FX(s.kmL, 3)) + '.'), A(100 / (s.mpg * KM_MI / GAL_L), 'u10t-conv-dir', 'Check the mile factor: ' + t('1\\text{ mi}=1.6093\\text{ km}') + '.'), A(100 / (s.mpg * MI_KM), 'u10t-fuel-gal', 'Change gallons to litres too: ' + t('1\\text{ gal}=3.7854\\text{ L}') + '.'), A(100 / (s.mpg * MI_KM * GAL_L), 'u10t-conv-dir', 'Check the gallon factor: a litre is smaller than a gallon, so there are fewer km per litre than per gallon.')],
              t('\\dfrac{' + s.mpg + '\\text{ mi}}{1\\text{ gal}}\\times\\dfrac{1.6093\\text{ km}}{1\\text{ mi}}\\times\\dfrac{1\\text{ gal}}{3.7854\\text{ L}}=' + dots(s.kmL, 3) + '\\text{ km/L}') + '<br>' + t('100\\div' + dots(s.kmL, 3) + '=' + dots(s.a, 3) + ap(s.a, 1, 'L/100 km')),
              ['First find km per litre with unit analysis.', 'Litres per 100 km = ' + t('100\\div') + ' (km per litre).'], 'mpg to L/100km ' + s.mpg);
            if (s.k === 'l100') return numP('In the US, fuel use is given in miles per US gallon (mpg). Convert the rating to mpg, to the nearest tenth.', s.a, 1, U('mpg'), [A(s.l / 100 * GAL_L * KM_MI, 'u10t-fuel-flip', 'The rating is litres per ' + t('100') + ' km; turn it over first: ' + t('\\dfrac{100\\text{ km}}{' + N(s.l) + '\\text{ L}}') + '.'), A(100 / s.l * KM_MI, 'u10t-fuel-gal', 'Change litres to gallons too: ' + t('1\\text{ gal}=3.7854\\text{ L}') + '.'), A(100 / s.l * GAL_L * MI_KM, 'u10t-conv-dir', 'Check the mile factor: ' + t('1\\text{ km}=0.6214\\text{ mi}') + '.'), A(100 / s.l / GAL_L * KM_MI, 'u10t-conv-dir', 'Check the gallon factor: a gallon is bigger than a litre, so multiply by ' + t('3.7854') + '.')],
              t('\\dfrac{100\\text{ km}}{' + N(s.l) + '\\text{ L}}\\times\\dfrac{3.7854\\text{ L}}{1\\text{ gal}}\\times\\dfrac{0.6214\\text{ mi}}{1\\text{ km}}=' + dots(s.a, 3) + ap(s.a, 1, 'mpg')),
              ['Turn the rating over so kilometres are on top: ' + t('\\dfrac{100\\text{ km}}{' + N(s.l) + '\\text{ L}}') + '.', 'Then change L to gallons and km to miles.'], 'L/100km to mpg ' + s.l);
            return numP('Convert the Montana price to Canadian dollars per litre, to the nearest cent.', s.a, 2, U('per L'), [A(s.p * GAL_L * s.ex, 'u10t-conv-dir', 'A litre is smaller than a gallon, so a litre costs <b>less</b>: divide by ' + t('3.7854') + '.'), A(s.p / GAL_L / s.ex, 'u10t-exch-dir', 'One US dollar is worth ' + t(fx(s.ex, 2)) + ' Canadian dollars, so multiply by ' + t(fx(s.ex, 2)) + '.'), A(s.p / GAL_L, 'u10t-exch-none', 'That is in US dollars. Change it to Canadian dollars with the exchange rate.')],
              t('\\dfrac{\\text{US}\\$' + fx(s.p, 2) + '}{1\\text{ gal}}\\times\\dfrac{1\\text{ gal}}{3.7854\\text{ L}}\\times\\dfrac{\\text{C}\\$' + fx(s.ex, 2) + '}{\\text{US}\\$1}=' + dots(s.a, 4)) + '<br>' + t('\\approx\\mathbf{\\text{C}\\$' + fx(s.a, 2) + '}\\text{ per L}'),
              ['Change gallons to litres, then US dollars to Canadian dollars.'], 'US$/gal to C$/L ' + s.p, { before: 'C$' });
          } },
          { id: '13b', sub: 'b', outcome: 'M2', level: 'MAS', make: function (r, s) {
            if (s.k === 'mpg') { var fuel = s.D * s.a / 100, cost = fuel * s.pr, c2 = s.D * rd(s.a, 1) / 100 * s.pr;
              return numP('Gas costs ' + t('\\$' + fx(s.pr, 2)) + '/L. What will the fuel cost for a ' + t(s.D) + ' km trip?', cost, 2, '', [A(s.D / s.a * s.pr, 'u10t-cost-part', 'The rating is litres for every ' + t('100') + ' km: fuel ' + t('=' + s.D + '\\times\\dfrac{' + FX(s.a, 3) + '}{100}') + '.'), A(s.D * s.a * s.pr, 'u10t-cost-part', 'The rating is per ' + t('100') + ' km — divide by ' + t('100') + '.'), A(s.D / s.kmL, 'u10t-cost-part', 'That is the fuel in litres. Multiply by the price per litre.')],
                'Fuel: ' + t(s.D + '\\times\\dfrac{' + FX(s.a, 3) + '}{100}=' + FX(fuel, 2) + '\\text{ L}') + '<br>Cost: ' + t(FX(fuel, 2) + '\\times' + fx(s.pr, 2) + '\\approx\\mathbf{\\$' + fx(cost, 2) + '}') + ' (' + t('\\$' + fx(c2, 2)) + ' from the rounded rating is also accepted).',
                ['Fuel used = distance × (litres per 100 km) ÷ 100.', 'Cost = litres × price per litre.'], 'trip cost ' + s.D + ' km', { before: '$', also: [c2] }); }
            if (s.k === 'l100') { var gal = s.D / s.a, cost2 = gal * s.pr, c3 = s.D / rd(s.a, 1) * s.pr;
              return numP('On a ' + t(s.D) + '-mile trip in the US, gas costs US' + t('\\$' + fx(s.pr, 2)) + ' per US gallon. What will the fuel cost, in US dollars?', cost2, 2, '', [A(s.D * s.a * s.pr, 'u10t-cost-part', 'Miles per gallon: the gallons used are ' + t('\\text{miles}\\div\\text{mpg}') + ', not times.'), A(s.D / s.a, 'u10t-cost-part', 'That is the fuel in gallons. Multiply by the price per gallon.'), A(s.D * s.l / 100 * s.pr, 'u10t-no-convert', 'The trip is in miles and the price is per gallon: use the mpg rating from part (a).')],
                'Fuel: ' + t(s.D + '\\div' + FX(s.a, 3) + '=' + FX(gal, 2) + '\\text{ gal}') + '<br>Cost: ' + t(FX(gal, 2) + '\\times' + fx(s.pr, 2) + '\\approx\\mathbf{\\$' + fx(cost2, 2) + '}') + ' (' + t('\\$' + fx(c3, 2)) + ' from the rounded rating is also accepted).',
                ['Gallons used = miles ÷ mpg.', 'Cost = gallons × price per gallon.'], 'trip cost ' + s.D + ' mi', { before: 'US$', also: [c3] }); }
            var save = (s.ab - s.a) * s.T, sv2 = (s.ab - rd(s.a, 2)) * s.T;
            return numP('Gas in Alberta costs C' + t('\\$' + fx(s.ab, 2)) + '/L. How much would ' + s.who + ' save, in Canadian dollars, by filling a ' + t(s.T) + ' L tank in Montana?', save, 2, '', [A(s.ab * s.T, 'u10t-cost-part', 'That is what the tank costs in Alberta. Find the <b>difference</b> per litre first.'), A(s.a * s.T, 'u10t-cost-part', 'That is what the tank costs in Montana. The saving is the difference between the two costs.'), A((s.ab - s.p / GAL_L) * s.T, 'u10t-exch-none', 'Use the Montana price in <b>Canadian</b> dollars from part (a).')],
              'Saving per litre: ' + t(fx(s.ab, 2) + '-' + FX(s.a, 4) + '=' + FX(s.ab - s.a, 4)) + '<br>' + t(FX(s.ab - s.a, 4) + '\\times' + s.T + '\\approx\\mathbf{\\$' + fx(save, 2) + '}') + ' (' + t('\\$' + fx(sv2, 2)) + ' from the rounded price is also accepted).',
              ['Find the difference in price per litre (both in C$).', 'Multiply by the litres in the tank.'], 'saving ' + s.T + ' L', { before: 'C$', also: [sv2] });
          } }] },
      { num: '14', outcome: 'M2', stem: 'Use the conversion factors.' + CONV, shared: function (r) {
          var k = r.pick(['ftdec', 'yddec', 'multdiv']), who = r.pick(['Kai', 'Rosa', 'Sam', 'Nadia', 'Owen', 'Jade']), s = { k: k, who: who };
          if (k === 'ftdec') { s.F = r.int(3, 7); s.I = r.pick([3, 4, 6, 8, 9]); s.x = s.F + s.I / 12; s.claim = t(s.F + '\\text{ ft }' + s.I + '\\text{ in}') + ' is ' + t(s.F + '.' + s.I + '\\text{ ft}'); }
          else if (k === 'yddec') { s.F = r.int(2, 9); s.I = r.int(1, 2); s.x = s.F + s.I / 3; s.claim = t(s.F + '\\text{ yd }' + s.I + '\\text{ ft}') + ' is ' + t(s.F + '.' + s.I + '\\text{ yd}'); }
          else { s.cm = 10 * r.int(10, 40); s.x = s.cm / IN_CM; if (bord(s.x, 1)) s.cm += 10, s.x = s.cm / IN_CM; s.claim = t(s.cm + '\\text{ cm}=' + s.cm + '\\times2.54=' + N(s.cm * IN_CM) + '\\text{ in}'); }
          var b = r.pick(['room', 'garden', 'board']); s.b = b;
          if (b === 'room') s.q = find(function () { var Lm = step(r, 3.6, 6.0, 0.1), Wm = step(r, 3.0, 4.5, 0.1), door = r.pick([0.8, 0.9]), len = r.pick([8, 10]), pr = r.pick([8.5, 9.75, 10.25, 11.5, 12.5, 13.75]), need = (2 * (Lm + Wm) - door) / FT_M; return { Lm: Lm, Wm: Wm, door: door, len: len, pr: pr, need: need }; }, function (q) { var f = q.need / q.len - Math.floor(q.need / q.len); return q.Wm < q.Lm && f > 0.12 && f < 0.88 && !bord(q.need, 2, 0.08); }, { Lm: 4.2, Wm: 3.6, door: 0.9, len: 8, pr: 12.5, need: 14.7 / FT_M });
          else if (b === 'garden') s.q = find(function () { var F1 = r.int(12, 24), I1 = r.pick([0, 3, 6, 9]), F2 = r.int(8, 14), len = r.pick([1.8, 2, 2.4]), pr = r.pick([29, 34, 38.5, 42, 47.5]), ft = 2 * (F1 + I1 / 12 + F2), need = ft * FT_M; return { F1: F1, I1: I1, F2: F2, len: len, pr: pr, ft: ft, need: need }; }, function (q) { var f = q.need / q.len - Math.floor(q.need / q.len); return q.I1 > 0 && q.F2 < q.F1 && f > 0.12 && f < 0.88 && !bord(q.need, 2, 0.08); }, { F1: 18, I1: 6, F2: 12, len: 2, pr: 34, ft: 61, need: 61 * FT_M });
          else s.q = find(function () { var Lm = step(r, 0.9, 2.4, 0.1), Wc = 10 * r.int(4, 9), len = r.pick([10, 12]), pr = r.pick([3.25, 4.75, 5.5, 6.25, 7.99]), cm = 2 * (Lm * 100 + Wc), need = cm / IN_CM / 12; return { Lm: Lm, Wc: Wc, len: len, pr: pr, cm: cm, need: need }; }, function (q) { var f = q.need / q.len - Math.floor(q.need / q.len); return q.Wc < q.Lm * 100 && f > 0.12 && f < 0.88 && !bord(q.need, 2, 0.08); }, { Lm: 1.2, Wc: 90, len: 12, pr: 4.75, cm: 420, need: 420 / IN_CM / 12 });
          s.q.n = Math.ceil(s.q.need / s.q.len); s.q.cost = s.q.n * s.q.pr;
          return s;
        },
        parts: [
          { id: '14ai', sub: 'a i', outcome: 'M2', level: 'MAS', make: function (r, s) {
            var T, Fs;
            if (s.k === 'ftdec') { T = [{ html: 'A foot has ' + t('12') + ' inches, not ' + t('10') + ', so ' + t(s.I) + ' in is ' + t('\\tfrac{' + s.I + '}{12}') + ' of a foot, not ' + t('0.' + s.I) + ' ft.' }, { html: t(s.F + '.' + s.I + '\\text{ ft}') + ' means ' + t(s.F) + ' ft plus ' + t(s.I) + ' <b>tenths</b> of a foot.' }];
              Fs = [{ html: s.who + ' is right: the inches can be written after the decimal point.', why: 'Decimal places are tenths, hundredths, … but an inch is a twelfth of a foot.' }, { html: 'The correct length is ' + t(s.F + '.0' + s.I + '\\text{ ft}') + ', because inches are hundredths of a foot.', why: 'An inch is a twelfth of a foot, not a hundredth.' }, { html: t(s.F + '\\text{ ft }' + s.I + '\\text{ in}') + ' is longer than ' + t(s.F + '.' + s.I + '\\text{ ft}') + '.', why: (s.I / 12 > s.I / 10 ? 'True only if a twelfth is bigger than a tenth.' : 'Compare: ' + t(s.I) + ' in ' + t('=' + fx(s.I / 12, 2)) + ' ft, which is less than ' + t('0.' + s.I) + ' ft.') }]; }
            else if (s.k === 'yddec') { T = [{ html: 'A yard has ' + t('3') + ' feet, not ' + t('10') + ', so ' + t(s.I) + ' ft is ' + t('\\tfrac{' + s.I + '}{3}') + ' of a yard, not ' + t('0.' + s.I) + ' yd.' }, { html: t(s.F + '.' + s.I + '\\text{ yd}') + ' means ' + t(s.F) + ' yd plus ' + t(s.I) + ' <b>tenths</b> of a yard.' }];
              Fs = [{ html: s.who + ' is right: the feet can be written after the decimal point.', why: 'Decimal places are tenths, but a foot is a third of a yard.' }, { html: 'The error is the units: the answer should be in feet, not yards.', why: 'Yards are fine; the problem is writing feet as tenths of a yard.' }, { html: t(s.F + '\\text{ yd }' + s.I + '\\text{ ft}') + ' is shorter than ' + t(s.F + '.' + s.I + '\\text{ yd}') + '.', why: t(s.I) + ' ft ' + t('\\approx' + fx(s.I / 3, 2)) + ' yd, which is more than ' + t('0.' + s.I) + ' yd.' }]; }
            else { T = [{ html: 'An inch is longer than a centimetre, so the number of inches must be <b>smaller</b> than ' + t(s.cm) + '.' }, { html: s.who + ' multiplied by ' + t('2.54') + ' but should have divided by ' + t('2.54') + '.' }];
              Fs = [{ html: 'A centimetre is longer than an inch, so the number of inches must be bigger.', why: t('1\\text{ in}\\approx2.5\\text{ cm}') + ': an inch is the longer unit.' }, { html: s.who + '’s method is right; only the rounding is wrong.', why: 'The method is wrong: changing to a bigger unit needs a smaller number.' }, { html: 'He should have multiplied by ' + t('0.3048') + ' instead.', why: t('0.3048') + ' changes feet to metres; inches and centimetres use ' + t('2.54') + '.' }]; }
            var pick = r.shuffle(T.concat(r.sample(Fs, 2)));
            var rows = pick.map(function (x, i) { return { id: 's' + i, html: x.html, label: 'statement ' + (i + 1) }; }), want = {};
            pick.forEach(function (x, i) { want['s' + i] = x.why ? 'F' : 'T'; });
            return gridP(s.who + ' says that ' + s.claim + '. Explain the error: mark each statement <b>true</b> or <b>false</b>.', rows, [{ id: 'T', html: 'True' }, { id: 'F', html: 'False' }], want,
              function (rid) { var x = pick[Number(rid.slice(1))]; return x.why || 'That statement is true: check it against the conversion factors.'; },
              pick.map(function (x) { return x.html + ' <b>' + (x.why ? 'False.' : 'True.') + '</b>' + (x.why ? ' ' + x.why : ''); }).join('<br>'),
              [s.k === 'multdiv' ? 'Which is longer, an inch or a centimetre? So should the number of inches be bigger or smaller?' : 'How many of the smaller unit make one of the bigger unit — ' + t('10') + '?'], 'explain error ' + s.k, { rowHead: 'Statement' });
          } },
          { id: '14aii', sub: 'a ii', outcome: 'M2', level: 'MAS', make: function (r, s) {
            if (s.k === 'ftdec') return numP('Give the correct length of ' + t(s.F + '\\text{ ft }' + s.I + '\\text{ in}') + ' in feet, to the nearest hundredth.', s.x, 2, U('ft'), [A(s.F + s.I / 10, 'u10t-ftin-dec', 'That is ' + s.who + '’s answer. ' + t(s.I) + ' in is ' + t('\\tfrac{' + s.I + '}{12}') + ' ft.'), A(s.F * 12 + s.I, 'u10t-no-convert', 'That is the length in inches. Divide by ' + t('12') + ' for feet.'), A(s.F + s.I / 100, 'u10t-ftin-dec', 'An inch is a twelfth of a foot: ' + t(s.I + '\\div12') + '.')],
              t(s.I + '\\text{ in}=\\tfrac{' + s.I + '}{12}\\text{ ft}=' + FX(s.I / 12, 3) + '\\text{ ft}') + ', so ' + t(s.F + '\\text{ ft }' + s.I + '\\text{ in}' + ap(s.x, 2, 'ft')) + ' (' + t('=' + (12 * s.F + s.I) + '\\text{ in}') + ').', ['Change the inches to a fraction of a foot: divide by ' + t('12') + '.'], 'ft-in to decimal ft ' + s.F + ',' + s.I);
            if (s.k === 'yddec') return numP('Give the correct length of ' + t(s.F + '\\text{ yd }' + s.I + '\\text{ ft}') + ' in yards, to the nearest hundredth.', s.x, 2, U('yd'), [A(s.F + s.I / 10, 'u10t-ftin-dec', 'That is ' + s.who + '’s answer. ' + t(s.I) + ' ft is ' + t('\\tfrac{' + s.I + '}{3}') + ' yd.'), A(s.F * 3 + s.I, 'u10t-no-convert', 'That is the length in feet. Divide by ' + t('3') + ' for yards.')],
              t(s.I + '\\text{ ft}=\\tfrac{' + s.I + '}{3}\\text{ yd}') + ', so ' + t(s.F + '\\text{ yd }' + s.I + '\\text{ ft}=' + s.F + '\\tfrac{' + s.I + '}{3}\\text{ yd}' + ap(s.x, 2, 'yd')) + ' (' + t('=' + (3 * s.F + s.I) + '\\text{ ft}') + ').', ['Change the feet to a fraction of a yard: divide by ' + t('3') + '.'], 'yd-ft to decimal yd ' + s.F + ',' + s.I);
            return numP('Give the correct length of ' + t(s.cm + '\\text{ cm}') + ' in inches, to the nearest tenth.', s.x, 1, U('in'), [A(s.cm * IN_CM, 'u10t-conv-dir', 'That is ' + s.who + '’s answer. Divide by ' + t('2.54') + '.'), A(s.cm / 25.4, 'u10t-conv-places', t('1\\text{ in}=2.54\\text{ cm}') + ' (' + t('25.4') + ' is millimetres).')],
              t(s.cm + '\\div2.54=' + dots(s.x, 3) + ap(s.x, 1, 'in')) + '. Check: ' + t(FX(s.x, 1)) + ' is less than ' + t(s.cm) + ', as it must be.', ['An inch is the bigger unit, so divide by ' + t('2.54') + '.'], 'cm to in ' + s.cm);
          } },
          { id: '14b', sub: 'b', outcome: 'M2', level: 'MAS', make: function (r, s) {
            var q = s.q, prompt, sol, needAlts, len = q.len, uN = s.b === 'garden' ? 'm' : 'ft';
            if (s.b === 'room') {
              prompt = 'Trim goes around a ' + t(N(q.Lm) + '\\text{ m}') + ' by ' + t(N(q.Wm) + '\\text{ m}') + ' room, except a ' + t(N(q.door) + '\\text{ m}') + ' doorway. It is sold in whole ' + t(len) + '-ft lengths at ' + t('\\$' + fx(q.pr, 2)) + ' each. Find the trim needed in feet (nearest hundredth), the number of lengths to buy, and the cost.';
              needAlts = [A(2 * (q.Lm + q.Wm) / FT_M, 'u10t-perim-door', 'Take the ' + t(N(q.door)) + ' m doorway off the perimeter.'), A((q.Lm + q.Wm - q.door) / FT_M, 'u10t-perim-half', 'The trim goes around all four walls: ' + t('2(' + N(q.Lm) + '+' + N(q.Wm) + ')') + '.'), A((2 * (q.Lm + q.Wm) - q.door) * FT_M, 'u10t-conv-dir', 'A foot is shorter than a metre, so there are <b>more</b> feet: divide by ' + t('0.3048') + '.'), A(2 * (q.Lm + q.Wm) - q.door, 'u10t-no-convert', 'That is in metres. Change it to feet.')];
              sol = 'Perimeter less the doorway: ' + t('2(' + N(q.Lm) + '+' + N(q.Wm) + ')-' + N(q.door) + '=' + N(2 * (q.Lm + q.Wm) - q.door) + '\\text{ m}') + '<br>' + t(N(2 * (q.Lm + q.Wm) - q.door) + '\\div0.3048' + ap(q.need, 2, 'ft'));
            } else if (s.b === 'garden') {
              prompt = 'A garden is ' + t(q.F1 + '\\text{ ft }' + q.I1 + '\\text{ in}') + ' by ' + t(q.F2 + '\\text{ ft}') + '. Fence panels are ' + t(N(len)) + ' m long, sold whole, at ' + t('\\$' + fx(q.pr, 2)) + ' each. Find the fence needed in metres (nearest hundredth), the number of panels to buy, and the cost.';
              needAlts = [A(2 * (q.F1 + q.I1 / 10 + q.F2) * FT_M, 'u10t-ftin-dec', t(q.F1 + '\\text{ ft }' + q.I1 + '\\text{ in}') + ' is ' + t(N(q.F1 + q.I1 / 12) + '\\text{ ft}') + ': an inch is a twelfth of a foot.'), A((q.F1 + q.I1 / 12 + q.F2) * FT_M, 'u10t-perim-half', 'The fence goes around all four sides: double the sum.'), A(q.ft / FT_M, 'u10t-conv-dir', 'A metre is longer than a foot, so there are <b>fewer</b> metres: multiply by ' + t('0.3048') + '.'), A(q.ft, 'u10t-no-convert', 'That is in feet. Change it to metres.')];
              sol = t(q.F1 + '\\text{ ft }' + q.I1 + '\\text{ in}=' + N(q.F1 + q.I1 / 12) + '\\text{ ft}') + '; perimeter ' + t('2(' + N(q.F1 + q.I1 / 12) + '+' + q.F2 + ')=' + N(q.ft) + '\\text{ ft}') + '<br>' + t(N(q.ft) + '\\times0.3048' + ap(q.need, 2, 'm'));
            } else {
              prompt = 'Trim for the edge of a ' + t(N(q.Lm) + '\\text{ m}') + ' by ' + t(q.Wc + '\\text{ cm}') + ' board is sold in whole ' + t(len) + '-ft rolls at ' + t('\\$' + fx(q.pr, 2)) + ' each. Find the trim needed in feet (nearest hundredth), the number of rolls to buy, and the cost.';
              needAlts = [A((q.Lm * 100 + q.Wc) / IN_CM / 12, 'u10t-perim-half', 'The trim goes around all four edges: double the sum.'), A(q.cm * IN_CM / 12, 'u10t-conv-dir', 'An inch is longer than a centimetre: divide by ' + t('2.54') + '.'), A(q.cm / IN_CM, 'u10t-no-convert', 'That is in inches. Divide by ' + t('12') + ' for feet.'), A(2 * (q.Lm + q.Wc) / IN_CM / 12, 'u10t-no-convert', 'Change the metres to centimetres before adding: ' + t(N(q.Lm) + '\\text{ m}=' + N(q.Lm * 100) + '\\text{ cm}') + '.')];
              sol = 'Perimeter: ' + t('2(' + N(q.Lm * 100) + '+' + q.Wc + ')=' + q.cm + '\\text{ cm}') + '<br>' + t(q.cm + '\\div2.54\\div12' + ap(q.need, 2, 'ft'));
            }
            var unitWord = s.b === 'garden' ? 'panels' : s.b === 'room' ? 'lengths' : 'rolls';
            sol += '<br>' + t(FX(q.need, 2) + '\\div' + N(len) + '=' + FX(q.need / len, 2)) + ', so buy <b>' + q.n + '</b> ' + unitWord + ' (round <b>up</b>: ' + (q.n - 1) + ' would be too short).<br>Cost: ' + t(q.n + '\\times\\$' + fx(q.pr, 2) + '=\\mathbf{\\$' + fx(q.cost, 2) + '}');
            var down = q.n - 1;
            return fieldsP(prompt, [
              { name: 'Needed', label: 'Needed:', after: U(uN), x: q.need, dp: 2, alts: needAlts },
              { name: cap(unitWord), label: cap(unitWord) + ' to buy:', x: q.n, alts: [A(down, 'u10t-buy-down', 'They are sold whole, and ' + t(down) + ' would be too short: round <b>up</b>.'), A(rd(q.need / len, 2), 'u10t-buy-down', 'They are sold whole: round up to a whole number.')] },
              { name: 'Cost', label: 'Cost:', before: '$', x: q.cost, dp: 2, alts: [A(down * q.pr, 'u10t-buy-down', 'That is the cost of ' + t(down) + ' — too short. Round the number up.'), A(q.need / len * q.pr, 'u10t-buy-down', 'You can only buy whole ' + unitWord + '.')] }],
              sol, ['Find the perimeter, then change it to the unit the ' + unitWord + ' are sold in.', 'They are sold whole: round the number <b>up</b>.'], 'buy ' + s.b + ' ' + q.n);
          } }] },

      /* ======================= M3 · Beginning (part 1) ======================= */
      { num: '15', outcome: 'M3', shared: function (r) { return find(function () { return { r: r.int(3, 7), h: r.int(6, 15), u: r.pick(['cm', 'cm', 'm']) }; }, function (s) { return !bord(PI * s.r * s.r * s.h, 1) && s.h !== 2 * s.r; }, { r: 4, h: 11, u: 'cm' }); },
        stem: function (s) { return FORMULAS + cylSvg(s.r, s.h, s.r + ' ' + s.u, s.h + ' ' + s.u); },
        parts: [
          { id: '15', outcome: 'M3', level: 'BEG', make: function (r, s) {
            var c = s.r * s.r * s.h, V = c * PI;
            return numP('Find the volume of the cylinder, to the nearest tenth.', V, 1, U3(s.u), [A(2 * PI * s.r * s.h, 'u10t-v-sa', t('2\\pi rh') + ' is the curved surface area. Volume is base area × height: ' + t('\\pi r^2h') + '.'), A(PI * s.r * s.h, 'u10t-v-r1', 'Square the radius: ' + t('\\pi r^2h') + '.'), A(PI * s.r * s.r, 'u10t-v-base', 'That is the area of the base. Multiply by the height.'), A(PI * 4 * s.r * s.r * s.h, 'u10t-diam', 'The ' + t(s.r) + ' is the radius — don’t double it.'), A(s.r * s.r * s.h, 'u10t-no-pi', 'The base is a circle: multiply by ' + t('\\pi') + '.')],
              t('V=\\pi r^2h=\\pi(' + s.r + ')^2(' + s.h + ')=' + c + '\\pi' + ap(V, 1, s.u, 3)), ['Volume of a cylinder: ' + t('V=\\pi r^2h') + '.'], 'cylinder V ' + s.r + ',' + s.h);
          } }] },
      { num: '16', outcome: 'M3', shared: function (r) { return find(function () { return { b: r.int(6, 14), sl: r.int(7, 16), u: r.pick(['cm', 'cm', 'm']) }; }, function (s) { return s.sl > s.b / 2 + 3 && s.sl !== s.b; }, { b: 10, sl: 13, u: 'cm' }); },
        stem: function (s) { return FORMULAS + pyrSvg(s.b, s.sl, s.b + ' ' + s.u, s.sl + ' ' + s.u); },
        parts: [
          { id: '16', outcome: 'M3', level: 'BEG', make: function (r, s) {
            var base = s.b * s.b, tri = s.b * s.sl / 2, SA = base + 4 * tri;
            return numP('Find the surface area of the square-based pyramid. The slant height is ' + t(s.sl) + ' ' + s.u + '.', SA, null, U2(s.u), [A(base + 4 * s.b * s.sl, 'u10t-half', 'Each triangle is ' + t('\\tfrac12bs') + ' — the ' + t('\\tfrac12') + ' is missing.'), A(4 * tri, 'u10t-sa-no-base', 'Add the square base: ' + t(s.b + '\\times' + s.b) + '.'), A(base + tri, 'u10t-sa-one-face', 'There are <b>four</b> triangular faces.'), A(base + 2 * tri, 'u10t-sa-one-face', 'There are <b>four</b> triangular faces.'), A(base * s.sl / 3, 'u10t-v-sa', 'That is a volume-style formula. Surface area adds the areas of the faces.')],
              'Base: ' + t(s.b + '\\times' + s.b + '=' + base + U2(s.u)) + '<br>Each triangle: ' + t('\\tfrac12(' + s.b + ')(' + s.sl + ')=' + N(tri) + U2(s.u)) + '<br>' + t('SA=' + base + '+4(' + N(tri) + ')=\\mathbf{' + N(SA) + '}' + U2(s.u)),
              ['Add the square base and the four triangles.', 'Each triangle: ' + t('\\tfrac12\\times\\text{base}\\times\\text{slant height}') + '.'], 'pyramid SA ' + s.b + ',' + s.sl);
          } }] },
      { num: '17', outcome: 'M3', shared: function (r) { return find(function () { return { r: r.int(3, 7), h: r.int(6, 12), u: r.pick(['cm', 'cm', 'm']) }; }, function (s) { return !bord(PI * s.r * s.r * s.h / 3, 1) && s.h !== s.r; }, { r: 6, h: 8, u: 'cm' }); },
        stem: function (s) { return FORMULAS + coneSvg(s.r, s.h, s.r + ' ' + s.u, s.h + ' ' + s.u); },
        parts: [
          { id: '17', outcome: 'M3', level: 'BEG', make: function (r, s) {
            var c = s.r * s.r * s.h / 3, V = c * PI;
            return numP('Find the volume of the cone, to the nearest tenth.', V, 1, U3(s.u), [A(PI * s.r * s.r * s.h, 'u10t-v-no3', 'A cone is ' + t('\\tfrac13') + ' of the cylinder with the same base and height.'), A(PI * s.r * s.r * s.h / 2, 'u10t-v-no3', 'A cone’s volume uses ' + t('\\tfrac13') + ', not ' + t('\\tfrac12') + '.'), A(PI * s.r * s.h / 3, 'u10t-v-r1', 'Square the radius: ' + t('\\tfrac13\\pi r^2h') + '.'), A(PI * s.r * s.r, 'u10t-v-base', 'That is the base area. Multiply by the height and by ' + t('\\tfrac13') + '.')],
              t('V=\\tfrac13\\pi r^2h=\\tfrac13\\pi(' + s.r + ')^2(' + s.h + ')=' + piC(c) + '\\pi' + ap(V, 1, s.u, 3)), ['Volume of a cone: ' + t('V=\\tfrac13\\pi r^2h') + '.'], 'cone V ' + s.r + ',' + s.h);
          } }] },

      /* ======================= M3 · Progressing (part 1) ======================= */
      { num: '18', outcome: 'M3', shared: function (r) {
          var T = r.pick([[6, 8], [8, 6], [9, 12], [12, 9], [12, 16], [16, 12], [15, 20], [5, 12], [12, 5], [10, 24], [8, 15], [15, 8], [7, 24], [20, 21], [21, 20], [9, 40], [6, 4.5], [7.5, 10]]);
          return { r: T[0], h: T[1], s: Math.sqrt(T[0] * T[0] + T[1] * T[1]), u: r.pick(['cm', 'cm', 'm']) };
        },
        stem: function (s) { return FORMULAS + 'A cone has a base <b>diameter</b> of ' + t(N(2 * s.r)) + ' ' + s.u + ' and a height of ' + t(N(s.h)) + ' ' + s.u + '.'; },
        parts: [
          { id: '18a', sub: 'a', outcome: 'M3', level: 'PRG', make: function (r, s) {
            return numP('Find the slant height of the cone.', s.s, null, U(s.u), [A(Math.sqrt(4 * s.r * s.r + s.h * s.h), 'u10t-diam', 'Use the <b>radius</b>, half the diameter, in the right triangle.'), A(s.r + s.h, 'u10t-slant-add', 'Use the Pythagorean theorem: ' + t('s^2=h^2+r^2') + '.'), A(Math.sqrt(s.h * s.h - s.r * s.r), 'u10t-slant-add', 'The slant height is the <b>hypotenuse</b>: add the squares.')],
              t('r=' + N(2 * s.r) + '\\div2=' + N(s.r) + U(s.u)) + '<br>' + t('s^2=h^2+r^2=' + N(s.h) + '^2+' + N(s.r) + '^2=' + N(s.s * s.s)) + ', ' + t('s=\\mathbf{' + N(s.s) + '}' + U(s.u)),
              ['Halve the diameter to get the radius.', 'The radius, the height and the slant height make a right triangle: ' + t('s^2=h^2+r^2') + '.'], 'cone slant ' + s.r + ',' + s.h);
          } },
          { id: '18b', sub: 'b', outcome: 'M3', level: 'PRG', make: function (r, s) {
            var c = s.r * s.r + s.r * s.s, SA = c * PI, d = 2 * s.r, sd = Math.sqrt(d * d + s.h * s.h);
            return numP('Find the surface area of the cone, to the nearest tenth.', SA, 1, U2(s.u), [A(PI * (d * d + d * sd), 'u10t-diam', 'Use the radius (half the diameter), not the diameter.'), A(PI * (d * d + d * s.s), 'u10t-diam', 'Use the radius (half the diameter), not the diameter.'), A(PI * s.r * s.s, 'u10t-sa-no-base', 'Add the circular base: ' + t('\\pi r^2') + '.'), A(PI * (s.r * s.r + s.r * s.h), 'u10t-sa-height', 'The curved surface uses the <b>slant</b> height: ' + t('\\pi rs') + '.'), A(PI * s.r * s.r * s.h / 3, 'u10t-v-sa', 'That is the volume. Surface area is ' + t('\\pi r^2+\\pi rs') + '.')],
              t('SA=\\pi r^2+\\pi rs=\\pi(' + N(s.r) + ')^2+\\pi(' + N(s.r) + ')(' + N(s.s) + ')') + '<br>' + t('=' + N(s.r * s.r) + '\\pi+' + N(s.r * s.s) + '\\pi=' + N(c) + '\\pi' + ap(SA, 1, s.u, 2)),
              ['A closed cone: the base ' + t('\\pi r^2') + ' plus the curved surface ' + t('\\pi rs') + '.', 'Use the radius and the slant height from part (a).'], 'cone SA ' + s.r + ',' + s.h);
          } }] },
      { num: '19', outcome: 'M3', stem: FORMULAS, parts: [
        { id: '19', outcome: 'M3', level: 'PRG', make: function (r) {
          var v = find(function () { var c = r.pick([['can', 355, 'mL'], ['can', 500, 'mL'], ['can', 540, 'mL'], ['can', 750, 'mL'], ['juice can', 1.2, 'L'], ['juice can', 1.36, 'L'], ['can of soup', 540, 'mL'], ['can of soup', 500, 'mL'], ['paint can', 3.78, 'L'], ['tin', 2, 'L'], ['can', 1, 'L']]); var rr = step(r, c[2] === 'L' && c[1] >= 2 ? 7 : 3, c[2] === 'L' && c[1] >= 2 ? 9.5 : 6, 0.1); var mL = c[2] === 'L' ? c[1] * 1000 : c[1]; return { c: c, r: rr, mL: mL, h: mL / (PI * rr * rr) }; }, function (v) { return v.h >= 6 && v.h <= 26 && !bord(v.h, 1) && Math.round(v.r * 10) % 10 !== 0; }, { c: ['can', 750, 'mL'], r: 4.2, mL: 750, h: 750 / (PI * 4.2 * 4.2) });
          var c = v.c, isL = c[2] === 'L';
          return numP('A cylindrical ' + c[0] + ' holds ' + t(N(c[1]) + '\\text{ ' + c[2] + '}') + ' and has a radius of ' + t(N(v.r)) + ' cm. Find the height of the ' + c[0] + ', to the nearest tenth of a centimetre. (' + t('1\\text{ cm}^3=1\\text{ mL}') + ')', v.h, 1, U('cm'), [A(c[1] / (PI * v.r * v.r), 'u10t-cap-conv', 'Change litres to millilitres first: ' + t('1\\text{ L}=1000\\text{ mL}=1000\\text{ cm}^3') + '.'), A(v.mL / (2 * PI * v.r), 'u10t-h-area', 'Divide by the base area, ' + t('\\pi r^2') + '.'), A(v.mL / (PI * v.r), 'u10t-h-area', 'Square the radius: divide by ' + t('\\pi r^2') + '.'), A(v.mL / (PI * 4 * v.r * v.r), 'u10t-diam', 'The ' + t(N(v.r)) + ' cm is the radius — don’t double it.'), A(v.mL / (v.r * v.r), 'u10t-no-pi', 'The base area is ' + t('\\pi r^2') + ': include ' + t('\\pi') + '.')].filter(function (a) { return isL || a.code !== 'u10t-cap-conv'; }),
            (isL ? t(N(c[1]) + '\\text{ L}=' + F(v.mL) + '\\text{ mL}=' + F(v.mL) + '\\text{ cm}^3') : t(v.mL + '\\text{ mL}=' + v.mL + '\\text{ cm}^3')) + '<br>' + t(F(v.mL) + '=\\pi(' + N(v.r) + ')^2h') + '<br>' + t('h=\\dfrac{' + F(v.mL) + '}{\\pi(' + N(v.r) + ')^2}=' + dots(v.h, 3) + ap(v.h, 1, 'cm')),
            ['Change the capacity to cubic centimetres: ' + t('1\\text{ mL}=1\\text{ cm}^3') + '.', 'Solve ' + t('V=\\pi r^2h') + ' for ' + t('h') + '.'], 'can height ' + c[1] + c[2] + ' r' + v.r);
        } }] },
      { num: '20', outcome: 'M3', shared: function (r) { return find(function () { var b = 2 * r.int(3, 10), h = r.int(5, 20); return { b: b, h: h, V: b * b * h / 3, u: r.pick(['m', 'cm']) }; }, function (s) { return s.V % 1 === 0 && !bord(Math.sqrt(s.h * s.h + s.b * s.b / 4), 1) && s.h !== s.b; }, { b: 14, h: 9, V: 588, u: 'm' }); },
        stem: function (s) { return FORMULAS + 'A square-based pyramid has a volume of ' + t(F(s.V) + U3(s.u)) + ' and a base side of ' + t(s.b) + ' ' + s.u + '.'; },
        parts: [
          { id: '20a', sub: 'a', outcome: 'M3', level: 'PRG', make: function (r, s) {
            return numP('Find its height.', s.h, null, U(s.u), [A(s.V / (s.b * s.b), 'u10t-v-no3', 'A pyramid’s volume has ' + t('\\tfrac13') + ': ' + t('h=\\dfrac{3V}{b^2}') + '.'), A(3 * s.V / s.b, 'u10t-v-r1', 'The base area is ' + t('b^2=' + s.b * s.b) + '.'), A(s.V / (3 * s.b * s.b), 'u10t-v-no3', 'Multiply the volume by ' + t('3') + ' (undo the ' + t('\\tfrac13') + '), don’t divide.')],
              t(F(s.V) + '=\\tfrac13(' + s.b + '^2)h') + '<br>' + t('h=\\dfrac{3(' + F(s.V) + ')}{' + s.b * s.b + '}=\\mathbf{' + s.h + '}' + U(s.u)), ['Substitute into ' + t('V=\\tfrac13Ah') + ' with ' + t('A=b^2') + '.', 'Multiply by ' + t('3') + ', then divide by the base area.'], 'pyramid h from V ' + s.V + ',' + s.b);
          } },
          { id: '20b', sub: 'b', outcome: 'M3', level: 'PRG', make: function (r, s) {
            var hb = s.b / 2, sl = Math.sqrt(s.h * s.h + hb * hb);
            return numP('Find its slant height, to the nearest tenth.', sl, 1, U(s.u), [A(Math.sqrt(s.h * s.h + s.b * s.b), 'u10t-half-edge', 'The slant height reaches the <b>middle</b> of a base edge: use half the base side, ' + t(hb) + '.'), A(s.h + hb, 'u10t-slant-add', 'Use the Pythagorean theorem: ' + t('s^2=h^2+\\left(\\tfrac b2\\right)^2') + '.'), A(Math.sqrt(Math.abs(s.h * s.h - hb * hb)), 'u10t-slant-add', 'The slant height is the hypotenuse: add the squares.')],
              'Half the base side: ' + t(hb + U(s.u)) + '. ' + t('s^2=' + s.h + '^2+' + hb + '^2=' + (s.h * s.h + hb * hb)) + '<br>' + t('s=\\sqrt{' + (s.h * s.h + hb * hb) + '}' + ap(sl, 1, s.u)),
              ['The height, half the base side and the slant height make a right triangle.'], 'pyramid slant ' + s.h + ',' + s.b);
          } }] },

      /* ======================= M3 · Mastery (part 1) ======================= */
      { num: '21', outcome: 'M3', shared: function (r) {
          var kind = r.pick(['cone', 'cyl', 'pyr']), V0 = r.pick([60, 80, 90, 120, 150, 180, 240, 300]);
          var A1 = r.pick([[2, 1], [3, 1], [2, 2], [0.5, 1]]);
          var B1 = r.pick([[3, 1 / 3], [0.5, 4], [3, 0.5], [2, 0.5], [2, 3], [0.5, 2], [3, 2], [2, 0.25]].filter(function (x) { return !(x[0] === A1[0] && x[1] === A1[1]); }));
          return { kind: kind, V0: V0, a: A1, b: B1, u: r.pick(['m', 'cm']) };
        },
        stem: function (s) { var S = SOLIDS21[s.kind]; return FORMULAS + 'A ' + S.name + ' has a volume of ' + t(s.V0 + U3(s.u)) + '. Use the volume formula to find the volume of each new ' + S.short + '.'; },
        parts: ['a', 'b'].map(function (pl) {
          return { id: '21' + pl, sub: pl, outcome: 'M3', level: 'MAS', make: function (r, s) {
            var S = SOLIDS21[s.kind], km = s[pl], k = km[0], m = km[1], f = k * k * m, V = s.V0 * f, lin = S.lin, v = S.vars;
            var desc = m === 1 ? 'The ' + lin + ' is ' + KW[k] + '; the height stays the same.' : (k === m ? 'The ' + lin + ' and the height are both ' + KW[k] + '.' : 'The ' + lin + ' is ' + KW[k] + ' and the height ' + (near(m, 1 / 3) ? MW3 : MW[m]) + '.');
            var fT = fracT(k), mT = fracT(m);
            var sol = t(S.V) + ': ' + t(v) + ' is <b>squared</b>, so ' + (k === 0.5 ? 'halving' : 'multiplying by ' + t(k)) + ' the ' + lin + ' multiplies ' + t('V') + ' by ' + t('(' + fT + ')^2=' + fracT(k * k)) + (m === 1 ? '' : '; ' + t('h') + ' appears once, so ' + t('V') + ' is also multiplied by ' + t(mT)) + '.<br>Overall: ' + t('V\\times' + (m === 1 ? fracT(k * k) : fracT(k * k) + '\\times' + mT + '=V\\times' + N(f))) + '.<br>New volume: ' + t(N(f) + '\\times' + s.V0 + '=\\mathbf{' + N(V) + '}' + U3(s.u)) + (near(k * m, f) ? '' : ' (not ' + t(N(k * m * s.V0)) + ')') + '.';
            var fAlts = [A(k * m, 'u10t-scale-linear', 'The ' + lin + ' is <b>squared</b> in ' + t(S.V) + ': ' + (k === 0.5 ? 'halving' : 'multiplying') + ' it multiplies the volume by ' + t('(' + fT + ')^2') + '.'), A(k * k * k * m, 'u10t-scale-cube', t(v) + ' is squared, not cubed, in this formula.')];
            if (m !== 1) fAlts.push(A(k * k, 'u10t-scale-h', 'The height changes too: multiply by ' + t(mT) + ' as well.'));
            return fieldsP(desc, [
              { name: 'Factor', label: 'The volume is multiplied by', x: f, alts: fAlts },
              { name: 'New volume', label: 'New volume:', after: U3(s.u), x: V, alts: fAlts.map(function (a) { return A(a.v * s.V0, a.code, a.hint); }) }],
              sol, ['Look at the formula ' + t(S.V) + ': what power is ' + t(v) + ' raised to? And ' + t('h') + '?', 'Multiply the factors together, then multiply the original volume.'], 'scale ' + s.kind + ' ' + k + ',' + m);
          } };
        }) },
      { num: '22', outcome: 'M3', shared: function (r) {
          var k = r.pick(['cup', 'funnel', 'tent']), s;
          if (k === 'tent') s = find(function () { var b = r.pick([1.8, 2.1, 2.4, 2.7, 3.0, 3.3]), h = step(r, 1.5, 2.8, 0.1), V = cl(b * b * h / 3); return { k: k, b: b, h: h, V: V, sl: Math.sqrt(h * h + b * b / 4) }; }, function (s) { return decsOf(s.V) <= 3 && !bord(2 * s.b * s.sl, 1); }, { k: 'tent', b: 2.4, h: 2.5, V: 4.8, sl: Math.sqrt(2.5 * 2.5 + 1.44) });
          else s = find(function () { var cup = k === 'cup', V = cup ? r.pick([150, 200, 250, 300, 350]) : r.pick([1, 1.5, 2, 2.5]), rr = cup ? r.int(3, 5) : r.int(7, 11), mL = cup ? V : V * 1000, h = 3 * mL / (PI * rr * rr), sl = Math.sqrt(h * h + rr * rr); return { k: k, V: V, mL: mL, r: rr, h: h, sl: sl, hr: rd(h, 1) }; }, function (s) { return s.h > s.r && s.h < 3.5 * s.r && !bord(s.h, 1) && !bord(PI * s.r * s.sl, 0, 0.1) && rd(PI * s.r * s.sl, 0) === rd(PI * s.r * Math.sqrt(s.hr * s.hr + s.r * s.r), 0); }, { k: k, V: 250, mL: 250, r: 4, h: 750 / (16 * PI), sl: Math.sqrt(Math.pow(750 / (16 * PI), 2) + 16), hr: 14.9 });
          return s;
        },
        stem: function (s) {
          if (s.k === 'tent') return FORMULAS + 'A tent is a square-based pyramid with <b>no floor</b>. Its base side is ' + t(N(s.b)) + ' m, and it must enclose ' + t(N(s.V) + '\\text{ m}^3') + ' of space.';
          return FORMULAS + 'A cone-shaped ' + (s.k === 'cup' ? 'paper cup' : 'metal funnel') + ', <b>open at the top</b>, must hold ' + t(N(s.V) + (s.k === 'cup' ? '\\text{ mL}' : '\\text{ L}')) + ' and have a radius of ' + t(s.r) + ' cm. (' + t('1\\text{ cm}^3=1\\text{ mL}') + ')';
        },
        parts: [
          { id: '22a', sub: 'a', outcome: 'M3', level: 'MAS', make: function (r, s) {
            if (s.k === 'tent') return numP('Find the height of the tent.', s.h, null, U('m'), [A(s.V / (s.b * s.b), 'u10t-v-no3', 'A pyramid’s volume has ' + t('\\tfrac13') + ': ' + t('h=\\dfrac{3V}{b^2}') + '.'), A(3 * s.V / s.b, 'u10t-v-r1', 'The base area is ' + t('b^2') + '.')],
              t(N(s.V) + '=\\tfrac13(' + N(s.b) + ')^2h') + '<br>' + t('h=\\dfrac{3(' + N(s.V) + ')}{' + N(s.b * s.b) + '}=\\mathbf{' + N(s.h) + '}\\text{ m}'), ['Solve ' + t('V=\\tfrac13b^2h') + ' for ' + t('h') + '.'], 'tent h ' + s.b + ',' + s.V);
            var w = s.k === 'cup' ? 'cup' : 'funnel';
            return numP('Find the height of the ' + w + ', to the nearest tenth of a centimetre.', s.h, 1, U('cm'), [A(s.mL / (PI * s.r * s.r), 'u10t-v-no3', 'A cone’s volume has ' + t('\\tfrac13') + ': ' + t('h=\\dfrac{3V}{\\pi r^2}') + '.'), A(3 * s.V / (PI * s.r * s.r), 'u10t-cap-conv', 'Change litres to millilitres (cm³) first.'), A(3 * s.mL / (PI * s.r), 'u10t-v-r1', 'Square the radius.')].filter(function (a) { return s.k === 'funnel' || a.code !== 'u10t-cap-conv'; }),
              (s.k === 'funnel' ? t(N(s.V) + '\\text{ L}=' + F(s.mL) + '\\text{ cm}^3') + '<br>' : '') + t(F(s.mL) + '=\\tfrac13\\pi(' + s.r + ')^2h') + '<br>' + t('h=\\dfrac{3(' + F(s.mL) + ')}{' + s.r * s.r + '\\pi}=' + dots(s.h, 3) + ap(s.h, 1, 'cm')),
              ['Use ' + t('V=\\tfrac13\\pi r^2h') + ' with ' + t('V') + ' in cm³ (' + t('1\\text{ mL}=1\\text{ cm}^3') + ').', 'Multiply by ' + t('3') + ', then divide by ' + t('\\pi r^2') + '.'], w + ' h ' + s.V + ',' + s.r);
          } },
          { id: '22b', sub: 'b', outcome: 'M3', level: 'MAS', make: function (r, s) {
            if (s.k === 'tent') { var Aw = 2 * s.b * s.sl;
              return numP('How much nylon is needed, to the nearest tenth of a square metre?', Aw, 1, U2('m'), [A(Aw + s.b * s.b, 'u10t-sa-extra-base', 'The tent has <b>no floor</b>: count only the four walls.'), A(2 * s.b * s.h, 'u10t-sa-height', 'Each wall’s height is the <b>slant</b> height, not the tent’s height. Find it first.'), A(4 * s.b * s.sl, 'u10t-half', 'Each wall is a triangle: ' + t('\\tfrac12bs') + '.'), A(2 * s.b * Math.sqrt(s.h * s.h + s.b * s.b), 'u10t-half-edge', 'In the slant-height triangle, use half the base side.')],
                'Slant height: ' + t('s=\\sqrt{' + N(s.h) + '^2+' + N(s.b / 2) + '^2}=' + dots(s.sl, 3) + '\\text{ m}') + '<br>No floor, so only the four walls: ' + t('4\\times\\tfrac12(' + N(s.b) + ')(' + FX(s.sl, 3) + ')' + ap(Aw, 1, 'm', 2)),
                ['Find the slant height of a wall first.', 'Which surfaces need nylon? There is no floor.'], 'tent nylon ' + s.b + ',' + s.h); }
            var Ac = PI * s.r * s.sl, A2 = PI * s.r * Math.sqrt(s.hr * s.hr + s.r * s.r);
            return numP('How much ' + (s.k === 'cup' ? 'paper' : 'metal') + ' is needed, to the nearest square centimetre?', Ac, 0, U2('cm'), [A(Ac + PI * s.r * s.r, 'u10t-sa-extra-base', 'The ' + (s.k === 'cup' ? 'cup' : 'funnel') + ' is open at the top: there is no circular base. Use only the curved surface ' + t('\\pi rs') + '.'), A(PI * s.r * s.h, 'u10t-sa-height', 'The curved surface uses the <b>slant</b> height, ' + t('s=\\sqrt{h^2+r^2}') + '.'), A(PI * s.r * s.r + PI * s.r * s.h, 'u10t-sa-height', 'Use the slant height, and leave out the base (the top is open).')],
              t('s=\\sqrt{' + FX(s.h, 3) + '^2+' + s.r + '^2}=' + dots(s.sl, 3) + '\\text{ cm}') + '<br>Open at the top, so only the curved surface: ' + t('\\pi rs=\\pi(' + s.r + ')(' + FX(s.sl, 3) + ')' + ap(Ac, 0, 'cm', 2)),
              ['Find the slant height with the height from part (a).', 'Which surface is made of ' + (s.k === 'cup' ? 'paper' : 'metal') + '? The top is open.'], 'cone material ' + s.V + ',' + s.r, { also: [A2] });
          } }] },

      /* ======================= M3 · Beginning (part 2) ======================= */
      { num: '23', outcome: 'M3', shared: function (r) { return find(function () { var o = r.pick([['A ball', 'cm'], ['A globe', 'cm'], ['A spherical lamp', 'cm'], ['A spherical water tank', 'm'], ['A spherical ornament', 'cm'], ['A spherical gas tank', 'm']]); return { r: r.int(4, 16), u: o[1], o: o[0] }; }, function (s) { return !bord(4 * PI * s.r * s.r, 1) && !bord(4 / 3 * PI * Math.pow(s.r, 3), 1); }, { r: 12, u: 'cm', o: 'A ball' }); },
        stem: function (s) { return FORMULAS + s.o + ' has a radius of ' + t(s.r) + ' ' + s.u + '. Round to the nearest tenth.' + sphereSvg(s.r + ' ' + s.u); },
        parts: [
          { id: '23a', sub: 'a', outcome: 'M3', level: 'BEG', make: function (r, s) {
            var SA = 4 * PI * s.r * s.r;
            return numP('Find its surface area.', SA, 1, U2(s.u), [A(PI * s.r * s.r, 'u10t-sa-circle', 'That is one circle. A sphere’s surface is ' + t('4\\pi r^2') + '.'), A(2 * PI * s.r * s.r, 'u10t-sa-two', 'That is half a sphere. A whole sphere is ' + t('4\\pi r^2') + '.'), A(4 * PI * s.r, 'u10t-v-r1', 'Square the radius: ' + t('4\\pi r^2') + '.'), A(4 / 3 * PI * Math.pow(s.r, 3), 'u10t-v-sa', 'That is the volume. Surface area is ' + t('4\\pi r^2') + '.')],
              t('SA=4\\pi r^2=4\\pi(' + s.r + ')^2=' + 4 * s.r * s.r + '\\pi' + ap(SA, 1, s.u, 2)), ['Surface area of a sphere: ' + t('SA=4\\pi r^2') + '.'], 'sphere SA ' + s.r);
          } },
          { id: '23b', sub: 'b', outcome: 'M3', level: 'BEG', make: function (r, s) {
            var V = 4 / 3 * PI * Math.pow(s.r, 3);
            return numP('Find its volume.', V, 1, U3(s.u), [A(4 * PI * Math.pow(s.r, 3), 'u10t-v-no43', 'The volume is ' + t('\\tfrac43\\pi r^3') + ': divide by ' + t('3') + '.'), A(4 / 3 * PI * s.r * s.r, 'u10t-v-r2', 'Cube the radius: ' + t('r^3') + '.'), A(PI * Math.pow(s.r, 3), 'u10t-v-no43', 'Multiply by ' + t('\\tfrac43') + '.'), A(4 * PI * s.r * s.r, 'u10t-v-sa', 'That is the surface area. Volume is ' + t('\\tfrac43\\pi r^3') + '.')],
              t('V=\\tfrac43\\pi r^3=\\tfrac43\\pi(' + s.r + ')^3=' + piC(4 * Math.pow(s.r, 3) / 3) + '\\pi' + ap(V, 1, s.u, 3)), ['Volume of a sphere: ' + t('V=\\tfrac43\\pi r^3') + '.'], 'sphere V ' + s.r);
          } }] },
      { num: '24', outcome: 'M3', shared: function (r) { return find(function () { var o = r.pick([['bowl', 'cm'], ['mixing bowl', 'cm'], ['planter', 'cm'], ['fountain basin', 'm'], ['soup pot', 'cm'], ['pond', 'm']]); return { r: r.int(5, 15), u: o[1], o: o[0] }; }, function (s) { return !bord(2 / 3 * PI * Math.pow(s.r, 3), 1); }, { r: 9, u: 'cm', o: 'bowl' }); },
        stem: function (s) { return FORMULAS + bowlSvg(s.r + ' ' + s.u); },
        parts: [
          { id: '24', outcome: 'M3', level: 'BEG', make: function (r, s) {
            var V = 2 / 3 * PI * Math.pow(s.r, 3);
            return numP('Find the volume of the hemispherical ' + s.o + ', to the nearest tenth.', V, 1, U3(s.u), [A(2 * V, 'u10t-hemi-whole', 'That is a whole sphere. A hemisphere is half: ' + t('\\tfrac23\\pi r^3') + '.'), A(2 * PI * Math.pow(s.r, 3), 'u10t-v-no43', 'The volume is ' + t('\\tfrac23\\pi r^3') + ': divide by ' + t('3') + '.'), A(2 / 3 * PI * s.r * s.r, 'u10t-v-r2', 'Cube the radius: ' + t('r^3') + '.'), A(2 * PI * s.r * s.r, 'u10t-v-sa', 'That is the curved surface area. Volume is ' + t('\\tfrac23\\pi r^3') + '.')],
              t('V=\\tfrac23\\pi r^3=\\tfrac23\\pi(' + s.r + ')^3=' + piC(2 * Math.pow(s.r, 3) / 3) + '\\pi' + ap(V, 1, s.u, 3)), ['A hemisphere is half a sphere: ' + t('V=\\tfrac23\\pi r^3') + '.'], 'hemisphere V ' + s.r);
          } }] },

      /* ======================= M3 · Progressing (part 2) ======================= */
      { num: '25', outcome: 'M3', stem: FORMULAS, parts: [
        { id: '25', outcome: 'M3', level: 'PRG', make: function (r) {
          var b = find(function () { var c = r.pick([['An exercise ball', [45, 55, 65, 75, 85]], ['A beach ball', [30, 36, 40, 45, 50, 60]], ['A soccer ball', [22]], ['A basketball', [24]], ['A volleyball', [21]], ['A playground ball', [18, 20, 25, 28, 32]], ['A giant inflatable ball', [90, 100, 120, 150]]]); var d = r.pick(c[1]), rr = d / 2, V = 4 / 3 * PI * rr * rr * rr; return { c: c[0], d: d, r: rr, V: V, L: V / 1000 }; }, function (b) { return !bord(b.L, 1); }, { c: 'An exercise ball', d: 65, r: 32.5, V: 4 / 3 * PI * Math.pow(32.5, 3), L: 4 / 3 * PI * Math.pow(32.5, 3) / 1000 });
          return numP(b.c + ' has a <b>diameter</b> of ' + t(b.d) + ' cm. How much air does it hold, in litres, to the nearest tenth? (' + t('1\\text{ cm}^3=1\\text{ mL}') + ')', b.L, 1, U('L'), [A(8 * b.L, 'u10t-diam', 'Use the radius, half the diameter: ' + t('r=' + N(b.r)) + ' cm.'), A(b.V, 'u10t-l-conv', 'That is in cm³ (mL). Divide by ' + t('1000') + ' for litres.'), A(b.V / 100, 'u10t-conv-places', 'There are ' + t('1000') + ' mL in a litre.'), A(4 * PI * b.r * b.r / 1000, 'u10t-v-sa', 'That uses the surface-area formula. Volume is ' + t('\\tfrac43\\pi r^3') + '.'), A(4 * PI * Math.pow(b.r, 3) / 1000, 'u10t-v-no43', 'The volume is ' + t('\\tfrac43\\pi r^3') + '.')],
            t('r=' + b.d + '\\div2=' + N(b.r) + '\\text{ cm}') + '<br>' + t('V=\\tfrac43\\pi(' + N(b.r) + ')^3=' + FX(b.V, 1) + '\\text{ cm}^3') + '<br>' + t('=' + FX(b.V, 1) + '\\text{ mL}' + ap(b.L, 1, 'L')),
            ['Halve the diameter.', 'Find the volume in cm³ = mL, then divide by ' + t('1000') + '.'], 'ball air d' + b.d);
        } }] },
      { num: '26', outcome: 'M3', stem: FORMULAS, parts: [
        { id: '26', outcome: 'M3', level: 'PRG', make: function (r) {
          var V = find(function () { return 50 * r.int(6, 60); }, function (V) { return !bord(Math.cbrt(3 * V / (4 * PI)), 1); }, 1150), r3 = 3 * V / (4 * PI), x = Math.cbrt(r3);
          return numP('A spherical storage tank holds ' + t(F(V) + '\\text{ m}^3') + '. Find its radius, to the nearest tenth of a metre.', x, 1, U('m'), [A(r3, 'u10t-no-root', 'That is ' + t('r^3') + '. Take the cube root.'), A(Math.sqrt(r3), 'u10t-sqrt', 'Undo a cube with a <b>cube</b> root, not a square root.'), A(Math.cbrt(V / (4 * PI)), 'u10t-v-no43', 'Undo the ' + t('\\tfrac43') + ' correctly: ' + t('r^3=\\dfrac{3V}{4\\pi}') + '.'), A(Math.cbrt(3 * V / 4), 'u10t-no-pi', 'Divide by ' + t('\\pi') + ' too.'), A(Math.sqrt(V / (4 * PI)), 'u10t-v-sa', 'That uses the surface-area formula. The tank’s capacity is its volume.')],
            t(F(V) + '=\\tfrac43\\pi r^3') + '<br>' + t('r^3=\\dfrac{3(' + F(V) + ')}{4\\pi}=' + FX(r3, 2)) + '<br>' + t('r=\\sqrt[3]{' + FX(r3, 2) + '}' + ap(x, 1, 'm')),
            ['Solve ' + t('V=\\tfrac43\\pi r^3') + ' for ' + t('r^3') + ' first.', 'Then take the cube root.'], 'sphere r from V ' + V);
        } }] },
      { num: '27', outcome: 'M3', stem: FORMULAS, parts: [
        { id: '27', outcome: 'M3', level: 'PRG', make: function (r) {
          var v = find(function () { return { d: 2 * r.int(3, 10), o: r.pick(['glass paperweight', 'wooden doorstop', 'rubber stress ball', 'marble bookend', 'soap bar', 'clay dome']) }; }, function (v) { return !bord(3 * PI * v.d * v.d / 4, 1); }, { d: 8, o: 'glass paperweight' });
          var rr = v.d / 2, SA = 3 * PI * rr * rr;
          return numP('A solid ' + v.o + ' is a hemisphere with a <b>diameter</b> of ' + t(v.d) + ' cm. Find its total surface area, including the flat base, to the nearest tenth.', SA, 1, U2('cm'), [A(2 * PI * rr * rr, 'u10t-sa-no-base', 'Add the flat circular base: ' + t('\\pi r^2') + '.'), A(4 * PI * rr * rr, 'u10t-hemi-whole', 'That is a whole sphere. A hemisphere’s curved part is ' + t('2\\pi r^2') + ', plus the flat base ' + t('\\pi r^2') + '.'), A(3 * PI * v.d * v.d, 'u10t-diam', 'Use the radius, half the diameter.'), A(2 * PI * v.d * v.d + PI * v.d * v.d, 'u10t-diam', 'Use the radius, half the diameter.')],
            t('r=' + rr) + ' cm. Curved: ' + t('2\\pi r^2=' + 2 * rr * rr + '\\pi') + '; flat base: ' + t('\\pi r^2=' + rr * rr + '\\pi') + '<br>' + t('SA=3\\pi r^2=' + 3 * rr * rr + '\\pi' + ap(SA, 1, 'cm', 2)),
            ['Halve the diameter.', 'Curved part ' + t('2\\pi r^2') + ' plus the flat base ' + t('\\pi r^2') + '.'], 'hemisphere SA d' + v.d);
        } }] },

      /* ======================= M3 · Mastery (part 2) ======================= */
      { num: '28', outcome: 'M3', shared: function (r) {
          var k = r.pick(['silo', 'obs', 'tank']);
          if (k === 'tank') return find(function () { var rr = r.pick([0.6, 0.8, 1, 1.2, 1.5]), L = r.int(3, 6), cov = r.pick([5, 8, 10, 12]); var V = PI * rr * rr * L + 4 / 3 * PI * Math.pow(rr, 3), Ar = 2 * PI * rr * L + 4 * PI * rr * rr; return { k: k, r: rr, h: L, cov: cov, V: V, A: Ar, n: Math.ceil(rd(Ar, 1) / cov) }; }, function (s) { var f = s.A / s.cov - Math.floor(s.A / s.cov); return f > 0.1 && f < 0.9 && !bord(s.V, 1) && !bord(s.A, 1) && s.n >= 2; }, null) || { k: 'tank', r: 1, h: 4, cov: 10, V: 16 / 3 * PI, A: 12 * PI, n: 4 };
          return find(function () { var rr = r.int(2, 6), h = k === 'silo' ? r.int(8, 14) : r.int(3, 6), cov = r.pick([20, 25, 35, 40]); var V = PI * rr * rr * h + 2 / 3 * PI * Math.pow(rr, 3), Ar = 2 * PI * rr * h + 2 * PI * rr * rr; return { k: k, r: rr, h: h, cov: cov, V: V, A: Ar, n: Math.ceil(rd(Ar, 1) / cov) }; }, function (s) { var f = s.A / s.cov - Math.floor(s.A / s.cov); return f > 0.1 && f < 0.9 && !bord(s.V, 1) && !bord(s.A, 1) && s.n >= 2; }, null) || { k: 'silo', r: 3, h: 10, cov: 40, V: 108 * PI, A: 78 * PI, n: 7 };
        },
        stem: function (s) {
          var u = 'm';
          if (s.k === 'tank') return FORMULAS + 'A propane tank is a cylinder (radius ' + t(N(s.r)) + ' m, length ' + t(s.h) + ' m) with a hemisphere on each end.' + capsuleSvg(s.r, s.h, N(s.r) + ' ' + u, s.h + ' ' + u);
          return FORMULAS + (s.k === 'silo' ? 'A grain silo is a cylinder (radius ' + t(s.r) + ' m, height ' + t(s.h) + ' m) with a hemispherical roof.' : 'An observatory is a cylinder (radius ' + t(s.r) + ' m, height ' + t(s.h) + ' m) with a hemispherical dome on top.') + siloSvg(s.r, s.h, s.r + ' ' + u, s.h + ' ' + u);
        },
        parts: [
          { id: '28a', sub: 'a', outcome: 'M3', level: 'MAS', make: function (r, s) {
            var cyl = PI * s.r * s.r * s.h, w = s.k === 'silo' ? 'silo' : s.k === 'obs' ? 'observatory' : 'tank';
            if (s.k === 'tank') { var sph = 4 / 3 * PI * Math.pow(s.r, 3);
              return numP('Find the volume of the tank, to the nearest tenth.', s.V, 1, U3('m'), [A(cyl, 'u10t-comp-part', 'Add the two hemispherical ends (together, one sphere).'), A(cyl + 2 * sph, 'u10t-hemi-whole', 'Each end is a <b>hemisphere</b>: the two together make one sphere, ' + t('\\tfrac43\\pi r^3') + '.'), A(cyl + sph / 2, 'u10t-comp-part', 'There are <b>two</b> hemispherical ends: together they make a whole sphere.')],
                t('V=\\pi r^2h+\\tfrac43\\pi r^3=\\pi(' + N(s.r) + ')^2(' + s.h + ')+\\tfrac43\\pi(' + N(s.r) + ')^3') + '<br>' + t('=' + FX(cyl, 3) + '+' + FX(sph, 3) + ap(s.V, 1, 'm', 3)) + ' (two hemispheres make one sphere).',
                ['Cylinder plus two hemispheres (one whole sphere).'], 'tank V ' + s.r + ',' + s.h); }
            var hem = 2 / 3 * PI * Math.pow(s.r, 3);
            return numP('Find the volume of the ' + w + ', to the nearest tenth.', s.V, 1, U3('m'), [A(cyl, 'u10t-comp-part', 'Add the hemispherical ' + (s.k === 'silo' ? 'roof' : 'dome') + '.'), A(cyl + 2 * hem, 'u10t-hemi-whole', 'The ' + (s.k === 'silo' ? 'roof' : 'dome') + ' is a <b>hemisphere</b>: ' + t('\\tfrac23\\pi r^3') + ', not a whole sphere.'), A(2 / 3 * PI * Math.pow(s.r, 3) + PI * s.r * s.r * s.h / 3, 'u10t-v-no3', 'The bottom part is a cylinder: ' + t('\\pi r^2h') + ', no ' + t('\\tfrac13') + '.')],
              t('V=\\pi r^2h+\\tfrac23\\pi r^3=\\pi(' + s.r + ')^2(' + s.h + ')+\\tfrac23\\pi(' + s.r + ')^3') + '<br>' + t('=' + piC(s.r * s.r * s.h) + '\\pi+' + piC(2 * Math.pow(s.r, 3) / 3) + '\\pi' + ap(s.V, 1, 'm', 3)),
              ['Volume of the cylinder plus volume of the hemisphere.'], w + ' V ' + s.r + ',' + s.h);
          } },
          { id: '28b', sub: 'b', outcome: 'M3', level: 'MAS', make: function (r, s) {
            var wall = 2 * PI * s.r * s.h, circ = PI * s.r * s.r, prompt, alts, sol;
            if (s.k === 'tank') {
              prompt = 'The whole outside is painted. One can of paint covers ' + t(s.cov + '\\text{ m}^2') + '. Find the area painted (nearest tenth) and the number of cans needed.';
              alts = [A(s.A + 2 * circ, 'u10t-sa-extra-base', 'Where the ends join the cylinder there is no flat surface to paint.'), A(wall + 8 * PI * s.r * s.r, 'u10t-hemi-whole', 'The two ends are hemispheres: together, one sphere, ' + t('4\\pi r^2') + '.'), A(wall, 'u10t-comp-part', 'Paint the two ends as well.'), A(wall + 2 * PI * s.r * s.r, 'u10t-comp-part', 'There are two hemispherical ends: ' + t('2\\times2\\pi r^2=4\\pi r^2') + '.')];
              sol = 'Wall: ' + t('2\\pi rh=2\\pi(' + N(s.r) + ')(' + s.h + ')=' + piC(2 * s.r * s.h) + '\\pi') + '; two ends = one sphere: ' + t('4\\pi r^2=' + piC(4 * s.r * s.r) + '\\pi') + '<br>Area ' + t('=' + piC(2 * s.r * s.h + 4 * s.r * s.r) + '\\pi' + ap(s.A, 1, 'm', 2));
            } else {
              var roof = s.k === 'silo' ? 'roof' : 'dome';
              prompt = 'Only the wall and the ' + roof + ' are painted. One can of paint covers ' + t(s.cov + '\\text{ m}^2') + '. Find the area painted (nearest tenth) and the number of cans needed.';
              alts = [A(s.A + circ, 'u10t-sa-extra-base', 'The floor isn’t painted, and there is no flat circle where the ' + roof + ' joins the wall.'), A(s.A + 2 * circ, 'u10t-sa-extra-base', 'Leave out the floor and the joint under the ' + roof + ': only the wall and the curved ' + roof + '.'), A(wall + 4 * PI * s.r * s.r, 'u10t-hemi-whole', 'The ' + roof + ' is a <b>hemisphere</b>: ' + t('2\\pi r^2') + ', not ' + t('4\\pi r^2') + '.'), A(wall, 'u10t-comp-part', 'Paint the ' + roof + ' as well.'), A(PI * s.r * s.h + 2 * PI * s.r * s.r, 'u10t-half', 'The wall is ' + t('2\\pi rh') + '.')];
              sol = 'Wall: ' + t('2\\pi rh=2\\pi(' + s.r + ')(' + s.h + ')=' + 2 * s.r * s.h + '\\pi') + '; ' + roof + ' (no flat base): ' + t('2\\pi r^2=' + 2 * s.r * s.r + '\\pi') + '<br>Area ' + t('=' + (2 * s.r * s.h + 2 * s.r * s.r) + '\\pi' + ap(s.A, 1, 'm', 2));
            }
            sol += '<br>' + t(FX(s.A, 1) + '\\div' + s.cov + '=' + FX(s.A / s.cov, 2)) + ', so <b>' + s.n + '</b> cans (round up: ' + (s.n - 1) + ' cans would not be enough).';
            return fieldsP(prompt, [
              { name: 'Area', label: 'Area painted:', after: U2('m'), x: s.A, dp: 1, alts: alts },
              { name: 'Cans', label: 'Cans needed:', x: s.n, alts: [A(s.n - 1, 'u10t-buy-down', t(s.n - 1) + ' cans cover only ' + t((s.n - 1) * s.cov + '\\text{ m}^2') + ': round <b>up</b>.'), A(rd(s.A / s.cov, 1), 'u10t-buy-down', 'Paint comes in whole cans: round up.')] }],
              sol, ['Which surfaces are painted? Add only those areas.', 'Divide by the coverage of one can and round <b>up</b>.'], 'paint ' + s.k + ' ' + s.r + ',' + s.h);
          } }] },
      { num: '29', outcome: 'M3', shared: function (r) {
          var k = r.pick(['cone', 'bowl', 'globe']);
          return find(function () {
            var s = { k: k };
            if (k === 'cone') { s.r = r.int(2, 4); s.h = r.int(8, 13); s.R = s.r + r.pick([0, 0, 0.5, -0.5]); s.src = 4 / 3 * PI * Math.pow(s.R, 3); s.dst = PI * s.r * s.r * s.h / 3; s.fill = Math.cbrt(s.r * s.r * s.h / 4); }
            else if (k === 'bowl') { s.R = r.int(6, 10); s.r = r.int(4, 7); s.h = r.int(6, 14); s.src = 2 / 3 * PI * Math.pow(s.R, 3); s.dst = PI * s.r * s.r * s.h; s.fill = Math.cbrt(1.5 * s.r * s.r * s.h); }
            else { s.R = r.int(4, 8); s.r = r.int(4, 7); s.h = r.int(8, 16); s.src = 4 / 3 * PI * Math.pow(s.R, 3); s.dst = PI * s.r * s.r * s.h; s.fill = Math.cbrt(0.75 * s.r * s.r * s.h); }
            s.holds = s.dst >= s.src;
            return s;
          }, function (s) { var q = s.src / s.dst; return q > 0.78 && q < 1.25 && Math.abs(q - 1) > 0.03 && !bord(s.src, 1) && !bord(s.dst, 1) && !bord(s.fill, 2, 0.06) && Math.abs(s.fill - s.R) > 0.05; }, { k: 'cone', r: 3, h: 10, R: 3, src: 36 * PI, dst: 30 * PI, fill: Math.cbrt(22.5), holds: false });
        },
        stem: function (s) {
          if (s.k === 'cone') return FORMULAS + 'An ice cream cone (radius ' + t(s.r) + ' cm, height ' + t(s.h) + ' cm) has a spherical scoop (radius ' + t(N(s.R)) + ' cm) on top.';
          if (s.k === 'bowl') return FORMULAS + 'A hemispherical bowl (radius ' + t(s.R) + ' cm) is full of soup. The soup is poured into a cylindrical container (radius ' + t(s.r) + ' cm, height ' + t(s.h) + ' cm).';
          return FORMULAS + 'A spherical snow globe (radius ' + t(s.R) + ' cm) is full of water. The water is poured into a cylindrical vase (radius ' + t(s.r) + ' cm, height ' + t(s.h) + ' cm).';
        },
        parts: [
          { id: '29a', sub: 'a', outcome: 'M3', level: 'MAS', make: function (r, s) {
            var nm = s.k === 'cone' ? ['scoop', 'cone', 'Will the cone hold the melted scoop?'] : s.k === 'bowl' ? ['bowl', 'container', 'Will the container hold the soup?'] : ['globe', 'vase', 'Will the vase hold the water?'];
            var srcAlts = s.k === 'bowl' ? [A(2 * s.src, 'u10t-hemi-whole', 'The bowl is a <b>hemisphere</b>: ' + t('\\tfrac23\\pi r^3') + '.'), A(2 * PI * Math.pow(s.R, 3), 'u10t-v-no43', 'A hemisphere’s volume is ' + t('\\tfrac23\\pi r^3') + '.')] : [A(4 * PI * Math.pow(s.R, 3), 'u10t-v-no43', 'A sphere’s volume is ' + t('\\tfrac43\\pi r^3') + '.'), A(4 / 3 * PI * s.R * s.R, 'u10t-v-r2', 'Cube the radius.'), A(s.src / 2, 'u10t-hemi-whole', 'The ' + nm[0] + ' is a whole sphere.')];
            var dstAlts = s.k === 'cone' ? [A(PI * s.r * s.r * s.h, 'u10t-v-no3', 'A cone is ' + t('\\tfrac13') + ' of a cylinder: ' + t('\\tfrac13\\pi r^2h') + '.')] : [A(PI * s.r * s.r * s.h / 3, 'u10t-v-no3', 'The ' + nm[1] + ' is a cylinder: ' + t('\\pi r^2h') + ', no ' + t('\\tfrac13') + '.'), A(2 * PI * s.r * s.h, 'u10t-v-sa', 'That is the curved surface. Volume is ' + t('\\pi r^2h') + '.')];
            var srcF = s.k === 'bowl' ? '\\tfrac23\\pi(' + s.R + ')^3' : '\\tfrac43\\pi(' + N(s.R) + ')^3', dstF = s.k === 'cone' ? '\\tfrac13\\pi(' + s.r + ')^2(' + s.h + ')' : '\\pi(' + s.r + ')^2(' + s.h + ')';
            var diff = Math.abs(s.dst - s.src);
            return fieldsP(nm[2] + ' Find both volumes (nearest tenth), then answer yes or no.', [
              { name: cap(nm[0]), label: cap(nm[0]) + ':', after: U3('cm'), x: s.src, dp: 1, alts: srcAlts },
              { name: cap(nm[1]), label: cap(nm[1]) + ':', after: U3('cm'), x: s.dst, dp: 1, alts: dstAlts },
              { name: 'Holds?', label: 'Will it hold?', mode: 'text', wide: true, placeholder: 'yes or no', check: ynCk(s.holds, 'Compare the two volumes: the ' + nm[1] + ' holds it only if its volume is at least the ' + nm[0] + '’s.'), key: s.holds ? 'yes' : 'no', ans: '<b>' + (s.holds ? 'yes' : 'no') + '</b>' }],
              cap(nm[0]) + ': ' + t(srcF + ap(s.src, 1, 'cm', 3)) + '<br>' + cap(nm[1]) + ': ' + t(dstF + ap(s.dst, 1, 'cm', 3)) + '<br>' + (s.holds ? '<b>Yes</b>: about ' + t(FX(diff, 1) + '\\text{ cm}^3') + ' of room is left over.' : '<b>No</b>: ' + t(FX(s.src, 1) + '>' + FX(s.dst, 1)) + ', so it overflows by about ' + t(FX(diff, 1) + '\\text{ cm}^3') + '.'),
              ['Find the volume of each solid.', 'Compare them: the container must be at least as big.'], 'will it hold ' + s.k, [[fx(s.src, 1), fx(s.dst, 1), s.holds ? 'no' : 'yes']]);
          } },
          { id: '29b', sub: 'b', outcome: 'M3', level: 'MAS', make: function (r, s) {
            var w = s.k === 'cone' ? 'scoop' : s.k === 'bowl' ? 'bowl' : 'globe', dst = s.k === 'cone' ? s.r * s.r * s.h / 3 : s.r * s.r * s.h, frac = s.k === 'bowl' ? '\\tfrac23' : '\\tfrac43', fk = s.k === 'bowl' ? 2 / 3 : 4 / 3, R3 = dst / fk;
            return numP('What ' + w + ' radius would exactly fill the ' + (s.k === 'cone' ? 'cone' : s.k === 'bowl' ? 'container' : 'vase') + '? Round to the nearest hundredth.', s.fill, 2, U('cm'), [A(R3, 'u10t-no-root', 'That is ' + t('R^3') + '. Take the cube root.'), A(Math.sqrt(R3), 'u10t-sqrt', 'Undo a cube with a <b>cube</b> root.'), A(Math.cbrt(dst), 'u10t-v-no43', 'Divide by ' + t(frac) + ' as well: ' + t('R^3=' + N(dst) + '\\div' + frac) + '.'), A(Math.cbrt(dst * fk), 'u10t-v-no43', 'Divide by ' + t(frac) + ', don’t multiply.')],
              t(frac + '\\pi R^3=' + piC(dst) + '\\pi') + ', so ' + t('R^3=' + piC(dst).replace(/\\ldots$/, '') + '\\div' + frac + '=' + N(R3)) + '<br>' + t('R=\\sqrt[3]{' + N(R3) + '}' + ap(s.fill, 2, 'cm')),
              ['Set the ' + w + '’s volume formula equal to the ' + (s.k === 'cone' ? 'cone' : 'container') + '’s volume.', 'The ' + t('\\pi') + ' cancels; solve for ' + t('R^3') + ', then take the cube root.'], 'fill radius ' + s.k);
          } }] }
    ]
  });
})(window);
