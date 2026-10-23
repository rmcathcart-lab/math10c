/* Math 10C · Unit 10 · Lesson 2 — Converting Units Within and Between SI and Imperial (M2; micro/mega/giga/nano and
 * the speed-of-light questions are Extension → EXT)
 * Assignment questions 1–23 (u10_L02.tex) and the Lesson 2 Extra Practice (u10_EP02.tex, Parts A–G).
 * Every part is a generator: it keeps the idea and difficulty of the booklet question (the booklet's numbers are one
 * of the possible versions) and changes the numbers. Conversion answers go in a number box with the unit written after
 * it; mixed imperial measures (5 ft 7 in, 3 yd 1 ft 10 in) use one labelled box per unit. Conversion factors are the
 * booklet's (Section 4): 1 in = 2.54 cm, 1 ft = 0.3048 m, 1 yd = 0.9144 m, 1 mi = 1.6093 km, 1 km = 0.6214 mi,
 * 1 kg = 2.2 lb. Levels: LIM BEG EMG PRG ADV MAS. */
(function (root) {
  'use strict';
  var HW = root.HW, K = HW.kit, t = K.t, ok = K.ok, wrong = K.wrong, form = K.form;

  HW.addCodes({
    'unit-in-box': 'Typed the unit in the answer box',
    'conv-direction': 'Multiplied instead of divided (or the reverse)',
    'prefix-places': 'Decimal point moved the wrong number of places (prefix power off)',
    'conv-factor': 'Used the wrong conversion factor',
    'forgot-part': 'Left out part of a mixed measurement',
    'stopped-early': 'Stopped part-way through the conversion chain',
    'ft-in-decimal': 'Wrote feet and inches as a decimal of a foot (5 ft 8 in as 5.8 ft)',
    'dec-remainder': 'Read the decimal part as the smaller unit (5.77 ft as 5 ft 77 in)',
    'base-ten': 'Used 10 instead of 12 (or 3) for the smaller unit',
    'carry': 'Mixed measure: leftover not carried into the larger unit',
    'mixed-decimal': 'Gave a decimal of the larger unit instead of a mixed measure',
    'blank-box': 'Left a box empty',
    'exact-round': 'Rounded an answer that comes out exactly',
    'rate-time': 'Rate: time factor upside down or wrong',
    'rate-flip': 'Rate: used the rate the wrong way up (multiplied instead of divided)',
    'proportion-flip': 'Proportion set up with one ratio upside down',
    'no-convert': 'Compared or divided without first changing to one unit',
    'round-up': 'Rounded down (or to the nearest) when whole items must be rounded up',
    'rounded-early': 'Rounded an intermediate value too early',
    'rounded-factor': 'Used a rounded factor instead of the exact one',
    'quotient-off': 'Mixed measure: number of whole larger units wrong',
    'remainder-off': 'Mixed measure: leftover wrong',
    'round-off': 'Rounding slip in the last unit',
    'estimate': 'Estimate too far from the benchmark value',
    'borrow': 'Subtracted a mixed measure without regrouping',
    'scale-direction': 'Map scale used the wrong way',
    'percent-base': 'Percent of the wrong whole'
  });

  /* ---------------- numbers ---------------- */
  function cl(x) { return Number(Number(x).toPrecision(12)); }
  function dS(x) {   // plain decimal string, never exponent form
    x = cl(x); var s = String(x), m = /^(-?)(\d+)(?:\.(\d+))?e([+-]\d+)$/.exec(s); if (!m) return s;
    var digs = m[2] + (m[3] || ''), pt = m[2].length + Number(m[4]);
    if (pt <= 0) return m[1] + '0.' + new Array(1 - pt).join('0') + digs;
    if (pt >= digs.length) return m[1] + digs + new Array(pt - digs.length + 1).join('0');
    return m[1] + digs.slice(0, pt) + '.' + digs.slice(pt);
  }
  function grp(s) {  // booklet spacing: thin spaces in an integer part of 5+ digits and a decimal part of 5+ digits
    var neg = s.charAt(0) === '-'; if (neg) s = s.slice(1);
    var p = s.split('.'), i = p[0], d = p[1];
    if (i.length >= 5) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, '\\,');
    if (d && d.length >= 5) d = d.replace(/(\d{3})(?=\d)/g, '$1\\,');
    return (neg ? '-' : '') + i + (d ? '.' + d : '');
  }
  function dT(x) { return grp(dS(x)); }
  function rnd(x, dp) { return K.roundTo(x, dp); }
  function fx(x, dp) { return grp(rnd(x, dp).toFixed(dp)); }
  function plainSp(x) { return grp(dS(x)).replace(/\\,/g, ' '); }
  function near(a, b, rel) { return Math.abs(a - b) <= Math.max(1e-9, Math.abs(b) * (rel || 1e-9)); }
  function decs(x) { return (dS(x).split('.')[1] || '').length; }
  function bord(x, dp) { var f = Math.abs(x) * Math.pow(10, dp); f -= Math.floor(f); return Math.abs(f - 0.5) < 0.01; } // too close to a rounding boundary
  function uT(u) { return u.charAt(0) === 'µ' ? '\\mu\\text{' + u.slice(1) + '}' : '\\text{' + u + '}'; }
  function q(x, u) { return (typeof x === 'string' ? x : dT(x)) + (u.charAt(0) === 'µ' ? '\\ ' + uT(u) : '\\text{ ' + u + '}'); }
  function Q(x, u) { return t(q(x, u)); }
  function uH(u) { return t(uT(u)); }
  /* a unit-analysis chain: fs = [[num, numUnit, den, denUnit], …]; units that appear on top and bottom are cancelled */
  function chainT(fs) {
    var top = {}, bot = {}, ct = {}, cb = {};
    fs.forEach(function (f) { if (f[1]) top[f[1]] = (top[f[1]] || 0) + 1; if (f[3]) bot[f[3]] = (bot[f[3]] || 0) + 1; });
    Object.keys(top).forEach(function (u) { ct[u] = cb[u] = Math.min(top[u], bot[u] || 0); });
    function side(n, u, cnt) {
      var ut = u ? uT(u) : ''; if (u && cnt[u] > 0) { cnt[u]--; ut = '\\cancel{' + ut + '}'; }
      var nt = n == null ? '' : (typeof n === 'string' ? n : dT(n));
      return nt && ut ? nt + '\\ ' + ut : (nt || ut || '1');
    }
    return fs.map(function (f) { return '\\dfrac{' + side(f[0], f[1], ct) + '}{' + side(f[2], f[3], cb) + '}'; }).join('\\times ');
  }
  function disp(s) { return '\\[' + s + '\\]'; }

  /* ---------------- answer checkers ---------------- */
  function unitTyped(s) { s = String(s == null ? '' : s); if (!/[a-zA-Zµμ'"′″%]/.test(s)) return false; var rest = s.replace(/\\text\{[^}]*\}|\\mu|[a-zA-Zµμ'"′″%{}\\/²³]+/g, ' '); return HW.parse.number(rest).ok; }
  function wrapUnit(ch) {
    return function (resp) {
      var s = String(resp == null ? '' : resp);
      if (/^\s*\\?\$/.test(s) && HW.parse.number(s.replace(/^\s*\\?\$/, '')).ok) return form('unit-in-box', 'Leave out the ' + t('\\$') + ' sign — just type the number.');
      if (unitTyped(s)) return form('unit-in-box', 'Type just the number — the unit is already written after the box.');
      return ch(resp);
    };
  }
  function placesDefault(j) { var a = Math.abs(j); return 'The digits are right, but the decimal point is ' + a + ' place' + (a > 1 ? 's' : '') + ' off. Check how many powers of ten the conversion crosses.'; }
  /* an exact number. o.alts = [{v, code, hint, tol}]; o.places (default true) diagnoses a power-of-ten slip */
  function exactCheck(ans, o) {
    o = o || {};
    var alts = (o.alts || []).filter(function (a) { return isFinite(a.v) && !near(a.v, ans, 1e-9); }), dpA = decs(ans);
    var base = K.number(ans, function (v) {
      for (var i = 0; i < alts.length; i++) if (near(v, alts[i].v, alts[i].tol || 0.002)) return { code: alts[i].code, hint: alts[i].hint };
      if (o.places !== false && ans !== 0) for (var j = -9; j <= 9; j++) if (j && near(v, ans * Math.pow(10, j), 1e-6)) return { code: 'prefix-places', hint: (o.placesHint || placesDefault)(j) };
      return o.diag ? o.diag(v) : null;
    }, { nr: o.nr });
    return wrapUnit(function (resp) {
      var p = HW.parse.number(resp);
      if (p.ok && !o.nr && !near(p.value, ans, 1e-9)) { var d = decs(p.value); if (d < dpA && near(rnd(ans, d), p.value, 1e-9)) return form('exact-round', 'Close — but this conversion comes out <b>exactly</b>. Don’t round: give every decimal place.'); }
      return base(resp);
    });
  }
  function numPart(o) {
    return { prompt: o.prompt, input: { type: 'number', nr: !!o.nr, before: o.before, after: o.unit }, check: exactCheck(o.ans, o), key: dS(o.ans),
      answer: (o.pre || '') + t(dT(o.ans)) + (o.unit ? ' ' + o.unit : ''), solution: o.sol, hints: o.hints || [], text: o.text,
      good: o.good || (Math.abs(o.ans) >= 10000 ? [plainSp(o.ans)] : undefined), bad: o.bad };
  }
  /* a rounded answer with targeted alternatives (K.near) */
  function nearPart(o) {
    var want = rnd(o.x, o.dp);
    return { prompt: o.prompt, input: { type: 'number', nr: !!o.nr, before: o.before, after: o.unit }, check: wrapUnit(K.near(o.x, o.dp, { alts: o.alts || [], nr: o.nr })),
      key: want.toFixed(o.dp), answer: (o.pre || '') + t(fx(o.x, o.dp)) + (o.unit ? ' ' + o.unit : ''), solution: o.sol, hints: o.hints || [], text: o.text, bad: o.bad };
  }
  function alt(v, code, hint) { return { v: v, code: code, hint: hint }; }
  function mcPart(r, prompt, opts, sol, hints, text, keepOrder) { var p = K.P.mc(r, prompt, opts, sol, hints, text, keepOrder); if (opts.length === 2) { p.tries = 1; p.input.columns = 2; } return p; }

  /* ---------------- mixed measures (one box per unit) ---------------- */
  var FTIN = [{ u: 'ft', per: 12, name: 'feet', one: 'foot' }, { u: 'in', per: 1, name: 'inches', one: 'inch' }];
  var YDFT = [{ u: 'yd', per: 3, name: 'yards', one: 'yard' }, { u: 'ft', per: 1, name: 'feet', one: 'foot' }];
  var MIFT = [{ u: 'mi', per: 5280, name: 'miles', one: 'mile' }, { u: 'ft', per: 1, name: 'feet', one: 'foot' }];
  var YDFTIN = [{ u: 'yd', per: 36, name: 'yards', one: 'yard' }, { u: 'ft', per: 12, name: 'feet', one: 'foot' }, { u: 'in', per: 1, name: 'inches', one: 'inch' }];
  var DH = [{ u: 'days', per: 24, name: 'days', one: 'day' }, { u: 'h', per: 1, name: 'hours', one: 'hour' }];
  function decomp(total, U) { var rem = Math.round(total), out = []; U.forEach(function (u) { var k = Math.floor(rem / u.per + 1e-9); out.push(k); rem -= k * u.per; }); return out; }
  function mixT(vals, U) { return vals.map(function (v, i) { return v + '\\text{ ' + U[i].u + '}'; }).join('\\ '); }
  /* total = the answer in the smallest unit (whole number); opt.exact = the unrounded value when the answer is "to the
   * nearest inch"; opt.alts = [{total, code, hint}] (totals in the smallest unit) */
  function mixedCheck(total, U, opt) {
    opt = opt || {};
    var want = decomp(total, U), L = U.length, ex = opt.exact != null ? opt.exact : total, big = U[0], small = U[L - 1];
    return function (resp) {
      resp = resp || []; var vals = [];
      for (var i = 0; i < L; i++) {
        var s = String(resp[i] == null ? '' : resp[i]).trim();
        if (!s) return form('blank-box', 'Fill in every box — type ' + t('0') + ' if there are no ' + U[i].name + '.');
        if (unitTyped(s)) return form('unit-in-box', 'Type just the number in each box — the units are already written after the boxes.');
        var p = HW.parse.number(s); if (!p.ok) return form('notnumber', 'Each box takes a single number.');
        vals.push(p.value);
      }
      if (vals.every(function (v, i) { return v === want[i]; })) return ok();
      var sum = 0; vals.forEach(function (v, i) { sum += v * U[i].per; });
      var ints = vals.every(function (v) { return Number.isInteger(v); });
      if (!ints) {
        var lastOnly = vals.slice(0, -1).every(function (v) { return Number.isInteger(v); });
        if (lastOnly && Math.abs(sum - ex) < 0.6) return form('round', 'Nearly there — the ' + small.name + ' should be a whole number. Round the ' + small.name + ' to the nearest ' + small.one + '.');
        if (Math.abs(vals[0] * big.per - ex) < 0.6 && vals.slice(1).every(function (v) { return v === 0; })) return form('mixed-decimal', 'That’s a decimal number of ' + big.name + '. Write it as whole ' + big.name + ' and the leftover ' + U[1].name + '.');
        if (Math.abs(sum - ex) < 0.6) return form('mixed-decimal', 'Right size — but use whole numbers in the boxes: whole ' + big.name + ', then the leftover in ' + U[1].name + '.');
        return wrong('value', null);
      }
      if (sum === total) {
        for (var k = 1; k < L; k++) if (vals[k] * U[k].per >= U[k - 1].per) return form('carry', 'Right total — but ' + t(vals[k] + '\\text{ ' + U[k].u + '}') + ' is at least ' + t('1\\text{ ' + U[k - 1].one + '}') + '. Carry each whole ' + U[k - 1].one + ' into the ' + U[k - 1].name + ' box.');
        return wrong('value', null);
      }
      if (L === 2) {
        var dec = ex / big.per, qn = Math.floor(dec + 1e-9), fr = dec - qn, ratio = big.per / small.per;
        if (vals[0] === qn && fr > 1e-9) for (var j = 1; j <= 4; j++) { var dg = Math.round(fr * Math.pow(10, j)); if (dg > 0 && vals[1] === dg && dg !== want[1]) return wrong('dec-remainder', t(dS(rnd(dec, 4)) + '\\text{ ' + big.u + '}') + ' does not mean ' + qn + ' ' + big.name + ' and ' + dg + ' ' + small.name + ': the decimal part is a fraction of a <b>' + big.one + '</b>. Multiply the decimal part by ' + t(ratio) + ' (or find the remainder) to get the ' + small.name + '.'); }
        if (ratio !== 10 && ratio < 100 && vals[0] === Math.floor(total / 10) && vals[1] === total % 10) return wrong('base-ten', 'Careful: there are ' + t(ratio) + ' ' + small.name + ' in ' + t('1') + ' ' + big.one + ', not ' + t('10') + '. Divide by ' + t(ratio) + '.');
      }
      var al = opt.alts || [];
      for (var a = 0; a < al.length; a++) if (Math.round(al[a].total) !== total && Math.abs(sum - al[a].total) <= Math.max(0.51, Math.abs(al[a].total) * 0.002)) return wrong(al[a].code, al[a].hint);
      if (opt.exact != null && Math.abs(sum - total) === 1) return wrong('round-off', 'Very close — you are one ' + small.one + ' off. Keep full precision until the end and round only the ' + small.name + ', once.');
      if (vals[L - 1] === want[L - 1]) return wrong('quotient-off', 'The leftover ' + small.name + ' are right — recount how many whole ' + big.name + ' fit.');
      if (vals[0] === want[0]) return wrong('remainder-off', 'The number of ' + big.name + ' is right — check what is left over after you take them out.');
      return wrong('value', null);
    };
  }
  function mixedPart(o) {
    var want = decomp(o.total, o.U);
    return { prompt: o.prompt, input: { type: 'fields', fields: o.U.map(function (u) { return { name: u.name.charAt(0).toUpperCase() + u.name.slice(1), after: u.u }; }) },
      check: mixedCheck(o.total, o.U, o), key: want.map(String), answer: t(mixT(want, o.U)), solution: o.sol, hints: o.hints || [], text: o.text };
  }

  /* ---------------- the metric number line ---------------- */
  var PFX = { G: 9, M: 6, k: 3, h: 2, da: 1, '': 0, d: -1, c: -2, m: -3, 'µ': -6, n: -9 };
  var PNAME = { G: 'giga', M: 'mega', k: 'kilo', h: 'hecto', da: 'deca', '': 'base', d: 'deci', c: 'centi', m: 'milli', 'µ': 'micro', n: 'nano' };
  var UNAME = { km: 'kilometres', m: 'metres', cm: 'centimetres', mm: 'millimetres', 'µm': 'micrometres', nm: 'nanometres', Gm: 'gigametres', Mm: 'megametres', L: 'litres', kL: 'kilolitres', mL: 'millilitres', g: 'grams', kg: 'kilograms' };
  function pe(u) { return PFX[u.slice(0, -1)]; }
  function core(u) { return Math.abs(pe(u)) <= 3; }
  function p10(e) { e = Math.abs(e); return e <= 6 ? dT(Math.pow(10, e)) : '10^{' + e + '}'; }
  function metricLine(full) {
    var labs = full ? ['G', 'M', 'k', 'h', 'da', 'unit', 'd', 'c', 'm', 'µ', 'n'] : ['k', 'h', 'da', 'unit', 'd', 'c', 'm'];
    var pos = full ? [-9, -6, -3, -2, -1, 0, 1, 2, 3, 6, 9] : [-3, -2, -1, 0, 1, 2, 3];
    var W = 520, x0 = 30, sc = (W - 60) / (pos[pos.length - 1] - pos[0]), s = '';
    s += '<line x1="12" y1="34" x2="' + (W - 12) + '" y2="34" stroke="#2b3340" stroke-width="2"/><polygon points="' + (W - 6) + ',34 ' + (W - 16) + ',29 ' + (W - 16) + ',39" fill="#2b3340"/>';
    pos.forEach(function (p, i) {
      var x = x0 + (p - pos[0]) * sc, lab = labs[i];
      s += '<line x1="' + x.toFixed(1) + '" y1="' + (lab === 'unit' ? 26 : 29) + '" x2="' + x.toFixed(1) + '" y2="' + (lab === 'unit' ? 42 : 39) + '" stroke="#2b3340" stroke-width="' + (lab === 'unit' ? 2.6 : 1.6) + '"/>';
      s += '<text x="' + x.toFixed(1) + '" y="58" font-size="15" text-anchor="middle" fill="#2b3340"' + (lab === 'unit' ? ' font-weight="600"' : '') + '>' + lab + '</text>';
    });
    s += '<text x="' + (W - 14) + '" y="16" font-size="13" text-anchor="end" fill="#13807a">smaller units → × 10 per step</text>';
    s += '<text x="14" y="16" font-size="13" text-anchor="start" fill="#13807a">← bigger units: ÷ 10 per step</text>';
    return '<div class="fig"><svg viewBox="0 0 ' + W + ' 66" width="100%" style="max-width:520px" role="img" aria-label="metric number line">' + s + '</svg></div>';
  }
  function stepsTxt(from, to) {
    var d = pe(from) - pe(to), a = Math.abs(d);
    if (core(from) && core(to)) return 'From ' + uH(from) + ' to ' + uH(to) + ' is ' + a + ' step' + (a > 1 ? 's' : '') + ' to the <b>' + (d > 0 ? 'right' : 'left') + '</b> on the number line';
    return 'A ' + uH(from) + ' is ' + t('10^{' + pe(from) + '}') + ' of the base unit and a ' + uH(to) + ' is ' + t('10^{' + pe(to) + '}') + ', so the powers differ by ' + t(a);
  }
  function metricChain(v, from, to) {
    var b = from.slice(-1), fs = [[v, from, null, null]], ef = pe(from), et = pe(to);
    if (ef > 0) fs.push([p10(ef), b, 1, from]); else if (ef < 0) fs.push([1, b, p10(ef), from]);
    if (et > 0) fs.push([1, to, p10(et), b]); else if (et < 0) fs.push([p10(et), to, 1, b]);
    return fs;
  }
  function metricSol(v, from, to, ans, mode) {
    var d = pe(from) - pe(to), b = from.slice(-1);
    if (mode === 'chain') {
      var fs = metricChain(v, from, to), two = fs.length > 2;
      return 'Write each factor so the unwanted unit cancels' + (two ? ', going through the base unit (' + uH(b) + ')' : '') + ':' + disp(chainT(fs) + '=' + q(ans, to)) +
        uH(from) + ' cancels' + (two ? ', then ' + uH(b) + ' cancels' : '') + ', leaving ' + uH(to) + '. (' + (d > 0 ? 'A smaller unit gives a bigger number.' : 'A bigger unit gives a smaller number.') + ')';
    }
    return stepsTxt(from, to) + ' — ' + (d > 0 ? 'to a <b>smaller</b> unit, so <b>multiply</b>' : 'to a <b>bigger</b> unit, so <b>divide</b>') + ' by ' + t(p10(d)) + ' (move the decimal point ' + Math.abs(d) + ' place' + (Math.abs(d) > 1 ? 's' : '') + ' ' + (d > 0 ? 'right' : 'left') + '):<br>' +
      t(q(v, from) + '=' + dT(v) + (d > 0 ? '\\times ' : '\\div ') + p10(d) + '=' + q(ans, to));
  }
  function metricPart(v, from, to, mode, o) {
    o = o || {};
    var d = pe(from) - pe(to), ans = cl(v * Math.pow(10, d));
    var dir = d > 0 ? 'Check the direction: ' + uH(to) + ' is a <b>smaller</b> unit than ' + uH(from) + ', so there are more of them and the number must get <b>bigger</b>. Multiply by ' + t(p10(d)) + ' instead of dividing.'
      : 'Check the direction: ' + uH(to) + ' is a <b>bigger</b> unit than ' + uH(from) + ', so there are fewer of them and the number must get <b>smaller</b>. Divide by ' + t(p10(d)) + ' instead of multiplying.';
    return numPart({ prompt: o.prompt || 'Convert ' + Q(v, from) + ' to ' + (UNAME[to] || to) + '.', before: t(q(v, from) + '='), unit: to, ans: ans,
      alts: [alt(cl(v * Math.pow(10, -d)), 'conv-direction', dir)],
      placesHint: function (j) { var a = Math.abs(j); return 'Right direction, but the decimal point is ' + a + ' place' + (a > 1 ? 's' : '') + ' off. ' + stepsTxt(from, to) + ', so the decimal point moves ' + Math.abs(d) + ' places.' + (core(from) && core(to) ? '' : ' (Past milli and kilo, each named prefix is a step of ' + t('1000') + ', not ' + t('10') + '.)'); },
      sol: metricSol(v, from, to, ans, mode), text: dS(v) + ' ' + from + ' to ' + to,
      hints: [mode === 'chain' ? 'Write the given amount over ' + t('1') + ', then multiply by unit factors arranged so ' + uH(from) + ' cancels.' : 'Find both units on the metric number line and count the steps between them.', d > 0 ? 'Going to a smaller unit gives a bigger number.' : 'Going to a bigger unit gives a smaller number.'] });
  }
  /* scientific-notation answer, with the multiply/divide slip diagnosed before the kit's power-of-ten check */
  function sciPart(prompt, x, wrongDir, before, unit, sol, hints, text, dirHint) {
    var p = K.P.sci(prompt, x, { before: before }, sol, hints, text), base = p.check;
    p.input.after = unit; p.answer = t(K.sciTex(x)) + ' ' + unit;
    p.check = function (resp) { var a = K.read(resp); if (!a.res && isFinite(a.val) && near(a.val, wrongDir, 1e-6)) return wrong('conv-direction', dirHint); return base(resp); };
    return p;
  }

  /* ---------------- imperial and crossing helpers ---------------- */
  function ftin(F, I) { return F + '\\text{ ft }' + I + '\\text{ in}'; }
  function ftinH(F, I) { return t(ftin(F, I)); }
  function primes(F, I) { return F + '′' + I + '″'; }
  function decAsInch(F, I) { return 'Careful: ' + ftinH(F, I) + ' is <b>not</b> ' + t(F + '.' + I + '\\text{ ft}') + ' — a foot has ' + t('12') + ' inches, not ' + t('10') + '. Change the whole height to inches first.'; }
  /* feet and inches → metres, rounded */
  function ftinToM(prompt, F, I, dp, before, text) {
    var inch = 12 * F + I, x = inch * 0.0254, al = [alt(inch / 2.54 / 100, 'conv-direction', 'Check the direction: centimetres are smaller than inches, so multiply the inches by ' + t('2.54') + '.'),
      alt(inch * 0.3048, 'conv-factor', t('0.3048') + ' changes <b>feet</b> to metres, but you have inches. Use ' + t('1\\text{ in}=2.54\\text{ cm}') + '.'),
      alt(inch * 2.54, 'prefix-places', 'That’s the height in <b>centimetres</b>. Divide by ' + t('100') + ' for metres.')];
    if (I > 0 && I <= 9) al.push(alt((F + I / 10) * 0.3048, 'ft-in-decimal', decAsInch(F, I)));
    if (I > 0) al.push(alt(F * 0.3048, 'forgot-part', 'Don’t forget the ' + t(I + '\\text{ in}') + ' — include every part of the measurement.'));
    return nearPart({ prompt: prompt, before: before, x: x, dp: dp, unit: 'm', alts: al, text: text || (F + ' ft ' + I + ' in to m'),
      sol: 'Change it to one unit first: ' + t(ftin(F, I) + '=' + F + '\\times 12+' + I + '=' + inch + '\\text{ in}') + '.' + disp(chainT([[inch, 'in', null, null], [2.54, 'cm', 1, 'in'], [1, 'm', 100, 'cm']]) + '=' + q(cl(x), 'm') + '\\approx ' + q(fx(x, dp), 'm')),
      hints: ['Write the height in inches first (' + t('12\\text{ in}') + ' per foot).', 'Then use ' + t('1\\text{ in}=2.54\\text{ cm}') + ' and ' + t('1\\text{ m}=100\\text{ cm}') + '.'] });
  }
  /* metres → feet and inches to the nearest inch */
  function mToFtin(prompt, X, xs, text) {
    var ex = X * 100 / 2.54, tot = Math.round(ex), w = decomp(tot, FTIN);
    return mixedPart({ prompt: prompt, total: tot, U: FTIN, exact: ex, text: text || (xs + ' m to ft and in'),
      alts: [{ total: X * 100 * 2.54, code: 'conv-direction', hint: 'Check the direction: inches are bigger than centimetres, so there are fewer of them — divide the centimetres by ' + t('2.54') + '.' }, { total: X * 12, code: 'conv-factor', hint: 'Metres aren’t feet: change ' + Q(xs, 'm') + ' to centimetres, then use ' + t('1\\text{ in}=2.54\\text{ cm}') + '.' }],
      sol: disp(chainT([[xs, 'm', null, null], [100, 'cm', 1, 'm'], [1, 'in', 2.54, 'cm']]) + '=' + q(dS(rnd(ex, 4)) + '\\ldots', 'in') + '\\approx ' + q(tot, 'in')) +
        'Then ' + t(tot + '\\div 12=' + w[0] + '\\text{ R }' + w[1]) + ', so ' + Q(xs, 'm') + ' ' + t('\\approx ' + ftin(w[0], w[1])) + ' (' + primes(w[0], w[1]) + ').',
      hints: ['Change metres to centimetres, then centimetres to inches (' + t('\\div 2.54') + ').', 'Round to the nearest inch, then divide by ' + t('12') + ': the quotient is feet and the remainder is inches.'] });
  }
  function lbToKg(who, lb) {
    var x = lb / 2.2;
    return nearPart({ prompt: who + ', about ' + Q(lb, 'lb') + '.', before: t(q(lb, 'lb') + '\\approx'), x: x, dp: 0, unit: 'kg', text: lb + ' lb to kg',
      alts: [alt(lb * 2.2, 'conv-direction', 'Check the direction: a kilogram is <b>heavier</b> than a pound, so there are fewer kilograms. Divide by ' + t('2.2') + '.')],
      sol: disp(chainT([[lb, 'lb', null, null], [1, 'kg', 2.2, 'lb']]) + '=' + dS(rnd(x, 2)) + (near(x, rnd(x, 2), 1e-12) ? '' : '\\ldots') + '\\text{ kg}\\approx ' + q(rnd(x, 0), 'kg')),
      hints: ['Use ' + t('1\\text{ kg}\\approx 2.2\\text{ lb}') + '.', 'A kilogram is heavier than a pound, so the number of kilograms is smaller.'] });
  }
  function kgToLb(who, kg) {
    var x = kg * 2.2;
    return nearPart({ prompt: who + ', about ' + Q(kg, 'kg') + '.', before: t(q(kg, 'kg') + '\\approx'), x: x, dp: 0, unit: 'lb', text: kg + ' kg to lb',
      alts: [alt(kg / 2.2, 'conv-direction', 'Check the direction: a pound is <b>lighter</b> than a kilogram, so there are more pounds. Multiply by ' + t('2.2') + '.')],
      sol: disp(chainT([[kg, 'kg', null, null], [2.2, 'lb', 1, 'kg']]) + '=' + dT(cl(x)) + '\\text{ lb}' + (Number.isInteger(cl(x)) ? '' : '\\approx ' + q(rnd(x, 0), 'lb'))),
      hints: ['Use ' + t('1\\text{ kg}\\approx 2.2\\text{ lb}') + '.', 'A pound is lighter than a kilogram, so the number of pounds is bigger.'] });
  }
  /* estimate + exact (Question 13) */
  function estCheck(exact, dirEst, bench) {
    return wrapUnit(function (resp) {
      var p = HW.parse.number(resp); if (!p.ok) return form(p.code === 'empty' ? 'empty' : 'notnumber', p.code === 'empty' ? 'Type your estimate first.' : 'Enter a single number.');
      if (Math.abs(p.value - exact) <= 0.07 * Math.abs(exact)) return ok();
      if (Math.abs(p.value - dirEst) <= 0.15 * Math.abs(dirEst)) return wrong('conv-direction', 'Your estimate went the wrong way. ' + bench);
      return wrong('estimate', 'Use the benchmark: ' + bench);
    });
  }
  function estPart(prompt, unit, exact, dp, est, dirEst, bench, exAlts, sol, text) {
    return { prompt: prompt, input: { type: 'fields', fields: [{ name: 'Estimate', label: 'Estimate', before: t('\\approx'), after: unit }, { name: 'Exact', label: 'Exact', after: unit }] },
      check: K.fields([estCheck(exact, dirEst, bench), wrapUnit(K.near(exact, dp, { alts: exAlts }))], { labels: ['Estimate', 'Exact'] }),
      key: [dS(rnd(est, 3)), rnd(exact, dp).toFixed(dp)], answer: 'Estimate ' + t('\\approx ' + q(dS(rnd(est, 3)), unit)) + '; exact ' + t('\\approx ' + q(fx(exact, dp), unit)), solution: sol,
      hints: ['Estimate with the benchmark (mental math), then convert with the exact factor on your calculator.', 'The two should be close. If they are far apart, look for a multiply/divide mix-up.'], text: text };
  }
  /* race comparison (Questions 16, 17) */
  var RACES16 = [{ yd: 880, imp: 'the half-mile (880 yards)', m: 800 }, { yd: 440, imp: 'the quarter-mile (440 yards)', m: 400 }, { yd: 1760, imp: 'the mile (1760 yards)', m: 1500 }, { yd: 1760, imp: 'the mile (1760 yards)', m: 1600 }, { yd: 10560, imp: 'the 6-mile race (10 560 yards)', m: 10000 }];
  var RACES17 = [{ yd: 220, imp: 'the 220-yard dash', m: 200 }, { yd: 110, imp: 'the 110-yard race', m: 100 }, { yd: 100, imp: 'the 100-yard dash', m: 100 }, { yd: 5280, imp: 'the 3-mile race (5280 yards)', m: 5000 }];
  function raceStem(R, k) { var tail = ' Which distance is longer, and by how much? (Use ' + t('1\\text{ yd}=0.9144\\text{ m}') + '.)'; return (k === 16 ? 'Some track meets historically ran ' + R.imp + ', now replaced by the ' + F0(R.m) + ' metre race.' : R.imp.charAt(0).toUpperCase() + R.imp.slice(1) + ', a historical race distance, has been replaced by the ' + F0(R.m) + ' metre race.') + tail; }
  function F0(n) { return n >= 10000 ? HW.fmt(n, true) : String(n); }
  function raceLonger(r, R) {
    var ydm = R.yd * 0.9144, impL = ydm > R.m;
    return mcPart(r, 'Which distance is longer?', [
      { html: R.imp.charAt(0).toUpperCase() + R.imp.slice(1) + ' is longer', right: impL, why: impL ? null : 'Compare in one unit: ' + t(dT(R.yd) + '\\text{ yd}\\times 0.9144') + ' gives the yards in metres. Is that more or less than ' + Q(R.m, 'm') + '?' },
      { html: 'The ' + F0(R.m) + ' m race is longer', right: !impL, why: !impL ? null : (R.yd > R.m ? 'Change the yards to metres before comparing: ' + t('1\\text{ yd}=0.9144\\text{ m}') + '. A yard is a little <b>shorter</b> than a metre, so the bigger number of yards may or may not win.' : 'Change the yards to metres first: ' + t('1\\text{ yd}=0.9144\\text{ m}') + '.') },
      { html: 'They are exactly the same length', why: 'A yard is ' + t('0.9144\\text{ m}') + ', not ' + t('1\\text{ m}') + ', so the two races can’t be exactly equal. Convert and compare.' }],
      'In metres: ' + t(dT(R.yd) + '\\times 0.9144=' + dT(cl(ydm)) + '\\text{ m}') + ', so <b>' + (impL ? R.imp : 'the ' + F0(R.m) + ' m race') + '</b> is longer.', ['Change both distances to the same unit before comparing.'], 'longer: ' + R.yd + ' yd or ' + R.m + ' m', true);
  }
  function raceDiff(R) {
    var ydm = R.yd * 0.9144, dm = Math.abs(ydm - R.m), myd = R.m / 0.9144, dy = Math.abs(R.yd - myd), raw = Math.abs(R.yd - R.m);
    var nc = 'You subtracted the two numbers without converting. Change both distances to the same unit first (' + t('1\\text{ yd}=0.9144\\text{ m}') + ').';
    return { prompt: 'By how much? Give the difference in metres and in yards, to the nearest whole number.', input: { type: 'fields', fields: [{ name: 'In metres', label: 'In metres', after: 'm' }, { name: 'In yards', label: 'In yards', after: 'yd' }] },
      check: K.fields([wrapUnit(K.near(dm, 0, { alts: [alt(raw, 'no-convert', nc)] })), wrapUnit(K.near(dy, 0, { alts: [alt(raw, 'no-convert', nc)] }))], { labels: ['In metres', 'In yards'] }),
      key: [rnd(dm, 0).toFixed(0), rnd(dy, 0).toFixed(0)], answer: t('\\approx ' + q(rnd(dm, 0), 'm')) + ' and ' + t('\\approx ' + q(rnd(dy, 0), 'yd')),
      solution: 'In metres: ' + t(dT(R.yd) + '\\times 0.9144=' + dT(cl(ydm)) + '\\text{ m}') + ', and ' + t('|' + dT(cl(ydm)) + '-' + dT(R.m) + '|=' + dS(rnd(dm, 3)) + '\\approx ' + q(rnd(dm, 0), 'm')) + '.<br>In yards: ' + t(dT(R.m) + '\\div 0.9144=' + dS(rnd(myd, 2)) + '\\ldots\\text{ yd}') + ', and ' + t('|' + dT(R.yd) + '-' + dS(rnd(myd, 2)) + '|\\approx ' + q(rnd(dy, 0), 'yd')) + '.',
      hints: ['For metres: change the yards to metres (' + t('\\times 0.9144') + '), then subtract.', 'For yards: change the metres to yards (' + t('\\div 0.9144') + '), then subtract.'], text: 'difference ' + R.yd + ' yd vs ' + R.m + ' m' };
  }
  /* light: c = 299 792 458 m/s */
  var C = 299792458, CKM = 299792.458, YEAR_S = 365.25 * 24 * 3600;
  function sci2(x) { return K.sciTex(x, 2); }

  HW.defineLesson({
    id: 'u10l2', unit: 10, num: '2', title: 'Converting Units Within and Between SI and Imperial', outcome: 'M2',
    blurb: 'SI prefixes are powers of ten; imperial units each have their own multiplier. Convert with the metric number line, proportions and unit analysis — and check with a benchmark.',
    questions: [
      { num: '1', section: 'Part 1 — SI review: the metric number line, proportions and unit analysis', stem: 'Use the metric number line to convert each of the following to the indicated unit.' + metricLine(false), parts: [
        { id: '1a', level: 'BEG', make: function (r) { var v; do { v = r.chance(0.5) ? r.int(101, 999) * 10 : r.int(1001, 9999); } while (v % 100 === 0); return metricPart(v, 'cm', 'm', 'line'); } },
        { id: '1b', level: 'BEG', make: function (r) { return metricPart(r.int(12, 95), 'km', 'cm', 'line'); } },
        { id: '1c', level: 'LIM', make: function (r) { var v; do { v = r.int(11, 99); } while (v % 10 === 0); return metricPart(v, 'mm', 'cm', 'line'); } },
        { id: '1d', level: 'EMG', make: function (r) { var v = r.chance(0.6) ? cl(r.int(1, 9) / 100) : cl(r.int(11, 95) / 100); return metricPart(v, 'mm', 'm', 'line'); } },
        { id: '1e', level: 'EMG', make: function (r) { var v; do { v = r.int(11, 99); } while (v % 10 === 0); return metricPart(cl(v / 100), 'm', 'km', 'line'); } },
        { id: '1f', level: 'BEG', make: function (r) { var v; do { v = r.int(1001, 9999); } while (v % 100 === 0); return metricPart(cl(v / 100), 'cm', 'mm', 'line'); } }] },
      { num: '2', stem: 'Convert each of the following to the indicated unit.', parts: [
        { id: '2a', level: 'BEG', make: function (r) { return metricPart(r.int(12, 95), 'kL', 'L', 'line'); } },
        { id: '2b', level: 'BEG', make: function (r) { var v; do { v = r.int(101, 999); } while (v % 10 === 0); return metricPart(v, 'mL', 'L', 'line'); } },
        { id: '2c', level: 'BEG', make: function (r) { var v; do { v = r.int(1001, 9999); } while (v % 10 === 0); return metricPart(v, 'g', 'kg', 'line'); } }] },
      { num: '3', parts: [
        { id: '3', level: 'EMG', make: function (r) {
          var a, b, x, c, g = 0;
          do { a = r.pick([2, 3, 4, 5, 6]); b = r.int(30, 150); x = r.int(5, 30) / 2; c = cl(x * b / a); g++; } while ((!Number.isInteger(c) || c < 40 || c > 600 || x === a || c === b) && g < 800);
          var bk = a === 5 && b === 84 && c === 126, flip = 'One of your ratios is upside down. Keep matching units in matching positions: ' + t('\\dfrac{\\text{map cm}}{\\text{real km}}=\\dfrac{\\text{map cm}}{\\text{real km}}') + '.';
          return numPart({ prompt: (bk ? 'On a map of British Columbia, ' : 'On a road map, ') + Q(a, 'cm') + ' represents ' + Q(b, 'km') + '. If the actual distance between ' + (bk ? 'Kelowna and Kamloops' : 'two towns') + ' is ' + Q(c, 'km') + ', use proportional reasoning to calculate the distance between them on this map.',
            ans: cl(x), unit: 'cm', places: false, text: 'map ' + a + ' cm : ' + b + ' km, real ' + c + ' km',
            alts: [alt(a * b / c, 'proportion-flip', flip), alt(b * c / a, 'proportion-flip', flip), alt(c / b, 'stopped-early', 'You found how many times longer ' + Q(c, 'km') + ' is than ' + Q(b, 'km') + '. Now multiply by the ' + Q(a, 'cm') + ' it takes on the map.')],
            sol: t('\\dfrac{' + a + '\\text{ cm}}{' + b + '\\text{ km}}=\\dfrac{x}{' + c + '\\text{ km}}') + '<br>Cross-multiply: ' + t(b + 'x=' + a + '(' + c + ')=' + a * c) + ', so ' + t('x=\\dfrac{' + a * c + '}{' + b + '}=' + dT(x)) + ' cm.',
            hints: ['Set up ' + t('\\dfrac{\\text{map}}{\\text{real}}=\\dfrac{\\text{map}}{\\text{real}}') + ' with the same units in the same places.', 'Cross-multiply and solve for the unknown map distance.'] });
        } }] },
      { num: '4', stem: 'Convert each of the following using <b>unit analysis</b>.', parts: [
        { id: '4a', level: 'BEG', make: function (r) { return metricPart(r.int(12, 95), 'km', 'cm', 'chain'); } },
        { id: '4b', level: 'EMG', make: function (r) { var v; do { v = r.int(101, 999); } while (v % 10 === 0); return metricPart(v * 100, 'mm', 'km', 'chain'); } }] },
      { num: '5', stem: 'Convert each rate to the indicated unit using <b>unit analysis</b>.', parts: [
        { id: '5a', level: 'EMG', make: function (r) {
          var v = r.int(5, 60) * 10, ans = cl(v * 60 / 1000);
          return numPart({ prompt: 'Convert ' + Q(v, 'm/s') + ' to km/min.', before: t(q(v, 'm/s') + '='), unit: 'km/min', ans: ans, text: v + ' m/s to km/min',
            alts: [alt(v / 1000 / 60, 'rate-time', 'Check the time factor. Seconds are on the <b>bottom</b> of the rate, so the factor needs seconds on <b>top</b>: ' + t('\\dfrac{60\\text{ s}}{1\\text{ min}}') + '.'), alt(v * 1000 * 60, 'conv-direction', 'Check the distance factor: metres are on top, so ' + t('1000\\text{ m}') + ' must go on the bottom: ' + t('\\dfrac{1\\text{ km}}{1000\\text{ m}}') + '.'), alt(v * 1000 / 60, 'rate-flip', 'Both factors are upside down. Each unit you want to get rid of must sit on the opposite side of its factor.'), alt(v * 3600 / 1000, 'conv-factor', 'There are ' + t('60') + ' seconds in a minute (' + t('3600') + ' is the seconds in an hour).')],
            sol: disp(chainT([[v, 'm', null, 's'], [1, 'km', 1000, 'm'], [60, 's', 1, 'min']]) + '=\\dfrac{' + v + '\\times 60}{1000}=' + q(ans, 'km/min')) + 'm cancels and s cancels, leaving km/min.',
            hints: ['Two units change: metres → kilometres on top, seconds → minutes on the bottom. Each needs its own factor.', 'A unit on the bottom of the rate is cancelled by a factor with that unit on top.'] });
        } },
        { id: '5b', level: 'EMG', make: function (r) {
          var v; do { v = r.int(15, 150); } while (v % 10 === 0); v = cl(v / 10); var ans = cl(v * 3.6);
          return numPart({ prompt: 'Convert ' + Q(v, 'm/s') + ' to km/h.', before: t(q(v, 'm/s') + '='), unit: 'km/h', ans: ans, text: v + ' m/s to km/h',
            alts: [alt(v / 3.6, 'rate-flip', 'Both factors are upside down: m is on top of the rate (so ' + t('1000\\text{ m}') + ' goes on the bottom) and s is on the bottom (so ' + t('3600\\text{ s}') + ' goes on top).'), alt(v * 60 / 1000, 'conv-factor', 'An hour has ' + t('3600') + ' seconds (' + t('60\\times 60') + '), not ' + t('60') + '.'), alt(v / 1000 / 3600, 'rate-time', 'Check the time factor: seconds are on the bottom of the rate, so the factor needs seconds on top: ' + t('\\dfrac{3600\\text{ s}}{1\\text{ h}}') + '.')],
            sol: disp(chainT([[v, 'm', null, 's'], [1, 'km', 1000, 'm'], [3600, 's', 1, 'h']]) + '=\\dfrac{' + dT(v) + '\\times 3600}{1000}=' + q(ans, 'km/h')) + 'm cancels and s cancels, leaving km/h.',
            hints: ['Change the metres on top to kilometres and the seconds on the bottom to hours.', t('1\\text{ h}=3600\\text{ s}') + '.'] });
        } },
        { id: '5c', level: 'EMG', make: function (r) {
          var v = 9 * r.int(4, 14), ans = cl(v / 3.6);
          return numPart({ prompt: 'Convert ' + Q(v, 'km/h') + ' to m/s.', before: t(q(v, 'km/h') + '='), unit: 'm/s', ans: ans, text: v + ' km/h to m/s',
            alts: [alt(v * 3.6, 'rate-flip', 'Both factors are upside down: km on top of the rate needs ' + t('1\\text{ km}') + ' on the bottom of its factor, and h on the bottom needs ' + t('1\\text{ h}') + ' on top.'), alt(v * 1000 / 60, 'conv-factor', 'An hour has ' + t('3600') + ' seconds, not ' + t('60') + '.'), alt(v * 1000 * 3600, 'rate-time', 'Check the time factor: hours are on the bottom of the rate, so the factor needs hours on top: ' + t('\\dfrac{1\\text{ h}}{3600\\text{ s}}') + '.')],
            sol: disp(chainT([[v, 'km', null, 'h'], [1000, 'm', 1, 'km'], [1, 'h', 3600, 's']]) + '=\\dfrac{' + v + '\\times 1000}{3600}=' + q(ans, 'm/s')) + 'km cancels and h cancels, leaving m/s.',
            hints: ['Kilometres on top → metres; hours on the bottom → seconds.', 'A speed in m/s is a smaller number than the same speed in km/h.'] });
        } }] },
      { num: '6', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '6', level: 'BEG', make: function (r) {
          var p, N, L, g = 0;
          do { p = r.pick([4, 5, 6, 8, 10, 12, 15, 16, 20, 25]); N = r.int(30, 400); L = cl(N * p / 100); g++; } while ((L < 3 || L > 20 || !Number.isInteger(cl(L * 10)) || N % 10 === 0 && r.chance(0.5)) && g < 800);
          return numPart({ prompt: 'Meera buys a spool of ribbon ' + Q(L, 'm') + ' long for a craft project. The project requires the ribbon to be cut into ' + Q(p, 'cm') + ' lengths. The number of ' + Q(p, 'cm') + ' lengths she will have is ________.',
            ans: N, nr: true, places: false, text: L + ' m into ' + p + ' cm pieces',
            alts: [alt(L / p, 'no-convert', 'Work in one unit: change the ' + Q(L, 'm') + ' to centimetres before dividing.'), alt(L * 10 / p, 'prefix-places', t('1\\text{ m}=100\\text{ cm}') + ', not ' + t('10\\text{ cm}') + '.'), alt(L * 1000 / p, 'prefix-places', t('1\\text{ m}=100\\text{ cm}') + ', not ' + t('1000\\text{ cm}') + '.'), alt(L * 100 * p, 'conv-direction', 'Divide the total length by the length of one piece.')],
            sol: 'Work in one unit: ' + t(q(L, 'm') + '=' + dT(L) + '\\times 100=' + q(cl(L * 100), 'cm')) + '.<br>' + t(dT(cl(L * 100)) + '\\div ' + p + '=' + N) + ' lengths.',
            hints: ['Change the metres to centimetres first.', 'Then divide by the length of one piece.'] });
        } }] },
      { num: '7', stem: function (sh) { return 'A hiking map has a scale of ' + t('1:' + HW.fmt(sh.n)) + '.'; }, shared: function (r) { return { n: r.pick([20000, 25000, 50000, 50000, 100000, 250000]) }; }, parts: [
        { id: '7a', level: 'EMG', make: function (r, sh) {
          var n = sh.n, d, ans, g = 0; do { d = cl(r.int(12, 150) / 10); ans = cl(d * n / 100000); g++; } while ((ans < 0.5 || ans > 40) && g < 400);
          return numPart({ prompt: 'Two campsites are ' + Q(d, 'cm') + ' apart on the map. How far apart are they on the ground, in kilometres?', ans: ans, unit: 'km', text: d + ' cm on 1:' + n + ' map to km',
            alts: [alt(d / n, 'scale-direction', 'The ground is <b>bigger</b> than the map: multiply the map distance by ' + t(HW.fmt(n)) + '.')],
            placesHint: function (j) { return j === 5 ? 'That’s the ground distance in <b>centimetres</b>. Now change it to kilometres: ' + t('1\\text{ km}=100\\,000\\text{ cm}') + '.' : 'The digits are right, but the decimal point is ' + Math.abs(j) + ' place' + (Math.abs(j) > 1 ? 's' : '') + ' off. ' + t('1\\text{ km}=1000\\text{ m}=100\\,000\\text{ cm}') + '.'; },
            sol: t('\\dfrac{1}{' + HW.fmt(n) + '}=\\dfrac{' + dT(d) + '\\text{ cm}}{x}') + ', so ' + t('x=' + dT(d) + '\\times ' + HW.fmt(n) + '=' + q(cl(d * n), 'cm')) + '.' + disp(chainT([[cl(d * n), 'cm', null, null], [1, 'm', 100, 'cm'], [1, 'km', 1000, 'm']]) + '=' + q(ans, 'km')),
            hints: [t('1:' + HW.fmt(n)) + ' means ' + t('1\\text{ cm}') + ' on the map is ' + t(HW.fmt(n) + '\\text{ cm}') + ' on the ground.', 'Convert to kilometres only at the end.'] });
        } },
        { id: '7b', level: 'EMG', make: function (r, sh) {
          var n = sh.n, m, D, g = 0; do { m = r.int(3, 30) / 2; D = cl(m * n / 100000); g++; } while ((D < 0.5 || decs(D) > 2) && g < 400);
          return numPart({ prompt: 'A trail is ' + Q(D, 'km') + ' long. How long is it on the map, in centimetres?', ans: m, unit: 'cm', text: D + ' km on 1:' + n + ' map to cm',
            alts: [alt(cl(D * 100000 * n), 'scale-direction', 'The map is <b>smaller</b> than the ground: divide by ' + t(HW.fmt(n)) + ', don’t multiply.'), alt(cl(D * 100000), 'stopped-early', 'That’s the trail’s real length in centimetres. Now use the scale: divide by ' + t(HW.fmt(n)) + '.')],
            placesHint: function (j) { return 'The digits are right, but the decimal point is ' + Math.abs(j) + ' place' + (Math.abs(j) > 1 ? 's' : '') + ' off. Change the kilometres to centimetres first: ' + t('1\\text{ km}=100\\,000\\text{ cm}') + '.'; },
            sol: t(q(D, 'km') + '=' + dT(D) + '\\times 1000\\times 100=' + q(cl(D * 100000), 'cm')) + '.<br>' + t('\\dfrac{1}{' + HW.fmt(n) + '}=\\dfrac{x}{' + dT(cl(D * 100000)) + '}') + ', so ' + t('x=\\dfrac{' + dT(cl(D * 100000)) + '}{' + HW.fmt(n) + '}=' + dT(m)) + ' cm.',
            hints: ['Change the real length to centimetres first, so both parts of the scale are in the same unit.', 'Then divide by ' + t(HW.fmt(n)) + '.'] });
        } }] },
      { num: '8', section: 'Part 2 — Imperial units, and converting between imperial and SI', stem: 'Convert the following. (' + t('1\\text{ ft}=12\\text{ in}') + ', ' + t('1\\text{ yd}=3\\text{ ft}') + ', ' + t('1\\text{ mi}=5280\\text{ ft}=1760\\text{ yd}') + ')', parts: [
        { id: '8a', level: 'BEG', make: function (r) {
          var F = r.int(3, 9), I = r.int(1, 11), ans = 12 * F + I;
          return numPart({ prompt: ftinH(F, I) + ' to inches', before: t(ftin(F, I) + '='), unit: 'in', ans: ans, places: false, text: F + ' ft ' + I + ' in to in',
            alts: [alt(3 * F + I, 'conv-factor', t('1\\text{ ft}=12\\text{ in}') + ' (3 is feet per yard).'), alt(12 * F, 'forgot-part', 'Don’t forget to add the ' + t(I + '\\text{ in}') + '.'), alt(10 * F + I, 'base-ten', 'A foot has ' + t('12') + ' inches, not ' + t('10') + '.')],
            sol: t(ftin(F, I) + '=' + F + '\\times 12+' + I + '=' + 12 * F + '+' + I + '=' + ans + '\\text{ in}'), hints: ['Each foot is ' + t('12\\text{ in}') + '. Change the feet to inches, then add the extra inches.'] });
        } },
        { id: '8b', level: 'BEG', make: function (r) {
          var Y = r.int(3, 12), Fq = r.int(1, 2), ans = 3 * Y + Fq;
          return numPart({ prompt: t(Y + '\\text{ yd }' + Fq + '\\text{ ft}') + ' to feet', before: t(Y + '\\text{ yd }' + Fq + '\\text{ ft}='), unit: 'ft', ans: ans, places: false, text: Y + ' yd ' + Fq + ' ft to ft',
            alts: [alt(12 * Y + Fq, 'conv-factor', t('1\\text{ yd}=3\\text{ ft}') + ' (12 is inches per foot).'), alt(36 * Y + Fq, 'conv-factor', t('36') + ' is inches per yard; you want feet: ' + t('1\\text{ yd}=3\\text{ ft}') + '.'), alt(3 * Y, 'forgot-part', 'Don’t forget to add the ' + t(Fq + '\\text{ ft}') + '.')],
            sol: t(Y + '\\text{ yd }' + Fq + '\\text{ ft}=' + Y + '\\times 3+' + Fq + '=' + 3 * Y + '+' + Fq + '=' + ans + '\\text{ ft}'), hints: ['Each yard is ' + t('3\\text{ ft}') + '.'] });
        } },
        { id: '8c', level: 'BEG', make: function (r) {
          var M = r.int(2, 5), Y = r.int(10, 95) * 10, ans = 1760 * M + Y;
          return numPart({ prompt: t(M + '\\text{ mi }' + Y + '\\text{ yd}') + ' to yards', before: t(M + '\\text{ mi }' + Y + '\\text{ yd}='), unit: 'yd', ans: ans, places: false, text: M + ' mi ' + Y + ' yd to yd',
            alts: [alt(5280 * M + Y, 'conv-factor', t('5280') + ' is the number of <b>feet</b> in a mile. In yards, ' + t('1\\text{ mi}=1760\\text{ yd}') + '.'), alt(1760 * M, 'forgot-part', 'Don’t forget to add the ' + t(Y + '\\text{ yd}') + '.')],
            sol: t(M + '\\text{ mi }' + Y + '\\text{ yd}=' + M + '\\times 1760+' + Y + '=' + 1760 * M + '+' + Y + '=' + dT(ans) + '\\text{ yd}'), hints: [t('1\\text{ mi}=1760\\text{ yd}') + '.'] });
        } },
        { id: '8d', level: 'BEG', make: function (r) {
          var N; do { N = r.int(40, 140); } while (N % 12 === 0); var w = decomp(N, FTIN);
          return mixedPart({ prompt: Q(N, 'in') + ' to feet and inches', total: N, U: FTIN, text: N + ' in to ft and in', alts: [{ total: N * 144, code: 'conv-direction', hint: 'Feet are bigger than inches, so there are fewer of them: divide by ' + t('12') + '.' }],
            sol: t(N + '\\div 12=' + w[0] + '\\text{ R }' + w[1]) + ', so ' + Q(N, 'in') + ' ' + t('=' + ftin(w[0], w[1])) + '. (Check: ' + t(w[0] + '\\times 12+' + w[1] + '=' + N) + '.)', hints: ['Divide by ' + t('12') + ': the quotient is the feet and the remainder is the inches.'] });
        } },
        { id: '8e', level: 'BEG', make: function (r) {
          var N; do { N = r.int(40, 130); } while (N % 3 === 0); var w = decomp(N, YDFT);
          return mixedPart({ prompt: Q(N, 'ft') + ' to yards and feet', total: N, U: YDFT, text: N + ' ft to yd and ft', alts: [{ total: N * 9, code: 'conv-direction', hint: 'Yards are bigger than feet, so there are fewer of them: divide by ' + t('3') + '.' }, { total: Math.floor(N / 12) * 3 + N % 12, code: 'conv-factor', hint: t('1\\text{ yd}=3\\text{ ft}') + ' (12 is inches per foot).' }],
            sol: t(N + '\\div 3=' + w[0] + '\\text{ R }' + w[1]) + ', so ' + Q(N, 'ft') + ' ' + t('=' + mixT(w, YDFT)) + '.', hints: ['Divide by ' + t('3') + ': the quotient is the yards and the remainder is the feet.'] });
        } },
        { id: '8f', level: 'EMG', make: function (r) {
          var N; do { N = r.int(21, 60) * 500; } while (N % 5280 === 0 || N % 5280 < 100); var w = decomp(N, MIFT), q1 = Math.floor(N / 1760);
          return mixedPart({ prompt: Q(N, 'ft') + ' to miles and feet', total: N, U: MIFT, text: N + ' ft to mi and ft', alts: [{ total: q1 * 5280 + (N - 1760 * q1), code: 'conv-factor', hint: 'You used ' + t('1760') + ', the number of <b>yards</b> in a mile. In feet, ' + t('1\\text{ mi}=5280\\text{ ft}') + '.' }],
            sol: t(w[0] + '\\times 5280=' + dT(5280 * w[0])) + ' (the most whole miles that fit), and ' + t(dT(N) + '-' + dT(5280 * w[0]) + '=' + w[1]) + '.<br>So ' + Q(N, 'ft') + ' ' + t('=' + mixT(w, MIFT)) + '.', hints: ['How many whole miles (' + t('5280\\text{ ft}') + ' each) fit into ' + Q(N, 'ft') + '?', 'The feet left over are the remainder.'] });
        } },
        { id: '8g', level: 'EMG', make: function (r) {
          var Y = r.int(2, 8), Fq = r.int(1, 2), I = r.int(1, 11), ans = 36 * Y + 12 * Fq + I, lab = Y + '\\text{ yd }' + Fq + '\\text{ ft }' + I + '\\text{ in}';
          return numPart({ prompt: t(lab) + ' to inches', before: t(lab + '='), unit: 'in', ans: ans, places: false, text: Y + ' yd ' + Fq + ' ft ' + I + ' in to in',
            alts: [alt(12 * Y + 12 * Fq + I, 'conv-factor', 'A yard is ' + t('3\\text{ ft}=36\\text{ in}') + ', not ' + t('12\\text{ in}') + '.'), alt(3 * Y + 12 * Fq + I, 'conv-factor', t('3\\text{ ft}') + ' per yard gives feet — and each of those feet is ' + t('12\\text{ in}') + '.'), alt(36 * Y + Fq + I, 'forgot-part', 'The ' + t(Fq + '\\text{ ft}') + ' needs changing to inches too.'), alt(36 * Y + 12 * Fq, 'forgot-part', 'Don’t forget to add the ' + t(I + '\\text{ in}') + '.')],
            sol: t(Y + '\\text{ yd}=' + 3 * Y + '\\text{ ft}=' + 36 * Y + '\\text{ in}') + ', ' + t(Fq + '\\text{ ft}=' + 12 * Fq + '\\text{ in}') + '.<br>' + t(36 * Y + '+' + 12 * Fq + '+' + I + '=' + ans + '\\text{ in}') + '.', hints: ['Change each part to inches: ' + t('1\\text{ yd}=36\\text{ in}') + ', ' + t('1\\text{ ft}=12\\text{ in}') + '. Then add.'] });
        } },
        { id: '8h', level: 'EMG', make: function (r) {
          var N; do { N = r.int(80, 250); } while (N % 36 < 12 || N % 12 === 0); var w = decomp(N, YDFTIN);
          return mixedPart({ prompt: Q(N, 'in') + ' to yards, feet, and inches', total: N, U: YDFTIN, text: N + ' in to yd ft in',
            sol: t('1\\text{ yd}=36\\text{ in}') + '; ' + t(N + '\\div 36=' + w[0] + '\\text{ R }' + (N - 36 * w[0])) + '.<br>' + t((N - 36 * w[0]) + '\\div 12=' + w[1] + '\\text{ R }' + w[2]) + '.<br>So ' + Q(N, 'in') + ' ' + t('=' + mixT(w, YDFTIN)) + '.',
            hints: ['Take out the whole yards first (' + t('36\\text{ in}') + ' each), then the whole feet (' + t('12\\text{ in}') + ' each).'] });
        } }] },
      { num: '9', stem: 'Convert, using proportional reasoning or unit analysis.', parts: [
        { id: '9a', level: 'EMG', make: function (r) {
          var X; do { X = r.int(11, 59); } while (X % 10 === 0); X = cl(X / 10); var ans = cl(X * 63360);
          return numPart({ prompt: Q(X, 'mi') + ' to inches', before: t(q(X, 'mi') + '='), unit: 'in', ans: ans, places: false, text: X + ' mi to in',
            alts: [alt(X * 5280, 'stopped-early', 'That’s the distance in <b>feet</b>. One more factor: ' + t('1\\text{ ft}=12\\text{ in}') + '.'), alt(X * 1760, 'stopped-early', 'That’s the distance in <b>yards</b>. Keep going to inches.'), alt(X * 1760 * 12, 'conv-factor', t('1760') + ' gives yards, and a yard is ' + t('36\\text{ in}') + ', not ' + t('12') + '. (Or go through feet: ' + t('5280\\text{ ft}') + ' per mile.)'), alt(X * 5280 / 12, 'conv-direction', 'Inches are smaller than feet, so multiply by ' + t('12') + '.')],
            sol: disp(chainT([[X, 'mi', null, null], [5280, 'ft', 1, 'mi'], [12, 'in', 1, 'ft']]) + '=' + dT(X) + '\\times 5280\\times 12=' + q(ans, 'in')) + 'mi cancels, then ft cancels, leaving in.', hints: ['Go through feet: ' + t('1\\text{ mi}=5280\\text{ ft}') + ', ' + t('1\\text{ ft}=12\\text{ in}') + '.'] });
        } },
        { id: '9b', level: 'EMG', make: function (r) {
          var N, x; do { N = r.int(10, 40) * 10000 + r.pick([0, 5000]); x = N / 63360; } while (bord(x, 2));
          return nearPart({ prompt: Q(N, 'in') + ' to miles, to the nearest hundredth of a mile', before: t(q(N, 'in') + '\\approx'), x: x, dp: 2, unit: 'mi', text: N + ' in to mi',
            alts: [alt(N / 5280, 'conv-factor', 'Those are <b>inches</b>, not feet: a mile is ' + t('5280\\times 12=63\\,360\\text{ in}') + '.'), alt(N / 12, 'stopped-early', 'That’s the distance in <b>feet</b>. Divide by ' + t('5280') + ' to get miles.'), alt(N / 12 / 1760, 'conv-factor', 'After dividing by ' + t('12') + ' you have feet, and a mile is ' + t('5280\\text{ ft}') + ' (' + t('1760') + ' is yards).'), alt(N * 63360, 'conv-direction', 'Miles are much bigger than inches, so the number gets smaller: divide.')],
            sol: t('1\\text{ mi}=5280\\times 12=63\\,360\\text{ in}') + '.' + disp(chainT([[N, 'in', null, null], [1, 'mi', '63\\,360', 'in']]) + '=' + dS(rnd(x, 4)) + '\\ldots\\approx ' + q(fx(x, 2), 'mi')), hints: ['How many inches are in one mile? (' + t('5280\\text{ ft}') + ', each ' + t('12\\text{ in}') + ')', 'Miles are bigger, so divide.'] });
        } }] },
      { num: '10', stem: function (sh) { return 'The Iron Trail ultra-marathon is run over a distance of ' + Q(sh.M, 'miles') + ' and ' + Q(sh.Y, 'yards') + '. Convert this distance to'; },
        shared: function (r) { return { M: r.int(20, 45), Y: r.pick([110, 220, 330, 440, 550, 660, 880, 1100, 1320]) }; }, parts: [
        { id: '10a', level: 'EMG', make: function (r, sh) {
          var M = sh.M, Y = sh.Y, yd = 1760 * M + Y;
          return numPart({ prompt: 'yards', unit: 'yd', ans: yd, places: false, text: M + ' mi ' + Y + ' yd to yd',
            alts: [alt(5280 * M + Y, 'conv-factor', t('5280') + ' is feet per mile; in yards, ' + t('1\\text{ mi}=1760\\text{ yd}') + '.'), alt(1760 * M, 'forgot-part', 'Don’t forget to add the ' + t(Y + '\\text{ yd}') + '.')],
            sol: t(M + '\\times 1760+' + Y + '=' + dT(1760 * M) + '+' + Y + '=' + q(yd, 'yd')), hints: [t('1\\text{ mi}=1760\\text{ yd}') + '. Change the miles, then add the extra yards.'] });
        } },
        { id: '10b', level: 'EMG', make: function (r, sh) {
          var M = sh.M, Y = sh.Y, yd = 1760 * M + Y, ft = 3 * yd;
          return numPart({ prompt: 'feet', unit: 'ft', ans: ft, places: false, text: M + ' mi ' + Y + ' yd to ft',
            alts: [alt(5280 * M + Y, 'forgot-part', 'You changed the miles to feet but not the ' + t(Y + '\\text{ yd}') + ': each yard is ' + t('3\\text{ ft}') + '.'), alt(yd, 'stopped-early', 'That’s the distance in <b>yards</b>. Multiply by ' + t('3') + ' for feet.'), alt(yd / 3, 'conv-direction', 'Feet are smaller than yards, so multiply by ' + t('3') + '.'), alt(12 * yd, 'conv-factor', 'A yard is ' + t('3\\text{ ft}') + ' (' + t('12') + ' is inches per foot).')],
            sol: 'In yards: ' + t(M + '\\times 1760+' + Y + '=' + q(yd, 'yd')) + '.<br>' + t(dT(yd) + '\\times 3=' + q(ft, 'ft')) + '. (Or: ' + t(M + '\\times 5280+' + Y + '\\times 3') + '.)', hints: ['Find the distance in yards first, then use ' + t('1\\text{ yd}=3\\text{ ft}') + '.'] });
        } },
        { id: '10c', level: 'EMG', make: function (r, sh) {
          var M = sh.M, Y = sh.Y, yd = 1760 * M + Y, inch = 36 * yd;
          return numPart({ prompt: 'inches', unit: 'in', ans: inch, places: false, text: M + ' mi ' + Y + ' yd to in',
            alts: [alt(63360 * M + Y, 'forgot-part', 'You changed the miles to inches but not the ' + t(Y + '\\text{ yd}') + ': each yard is ' + t('36\\text{ in}') + '.'), alt(12 * yd, 'conv-factor', 'A yard is ' + t('36\\text{ in}') + ' (' + t('3\\text{ ft}\\times 12') + '), not ' + t('12\\text{ in}') + '.'), alt(3 * yd, 'stopped-early', 'That’s the distance in <b>feet</b>. Multiply by ' + t('12') + ' for inches.')],
            sol: 'In feet: ' + t('(' + M + '\\times 1760+' + Y + ')\\times 3=' + q(3 * yd, 'ft')) + '.<br>' + t(dT(3 * yd) + '\\times 12=' + q(inch, 'in')) + '.', hints: ['Find the distance in feet first (' + t('1\\text{ mi}=1760\\text{ yd}') + ', ' + t('1\\text{ yd}=3\\text{ ft}') + '), then use ' + t('1\\text{ ft}=12\\text{ in}') + '.'] });
        } }] },
      { num: '11', parts: [
        { id: '11', level: 'PRG', make: function (r) {
          var S = r.int(4, 16) * 5, x = S * 5280 / 3600;
          return nearPart({ prompt: 'Using unit analysis, convert a speed of ' + Q(S, 'miles per hour') + ' to feet per second (to the nearest tenth).', before: t(q(S, 'mi/h') + '\\approx'), x: x, dp: 1, unit: 'ft/s', text: S + ' mph to ft/s',
            alts: [alt(S * 5280 / 60, 'rate-time', 'That’s feet per <b>minute</b>. An hour is ' + t('3600') + ' seconds.'), alt(S * 5280 * 3600, 'rate-time', 'Check the time factor: hours are on the bottom of the rate, so ' + t('\\dfrac{1\\text{ h}}{3600\\text{ s}}') + ' needs h on top.'), alt(S * 1760 / 3600, 'conv-factor', t('1760') + ' gives yards. In feet, ' + t('1\\text{ mi}=5280\\text{ ft}') + '.'), alt(S / 5280 * 3600, 'rate-flip', 'Both factors are upside down. The unit you are cancelling must sit on the opposite side of its factor.')],
            sol: disp(chainT([[S, 'mi', 1, 'h'], [5280, 'ft', 1, 'mi'], [1, 'h', 3600, 's']]) + '=\\dfrac{' + dT(S * 5280) + '}{3600}\\approx ' + q(fx(x, 1), 'ft/s')) + 'mi cancels and h cancels, leaving ft/s.',
            hints: ['Miles on top → feet (' + t('5280') + '); hours on the bottom → seconds (' + t('3600') + ').', 'A factor that cancels hours on the bottom must have hours on top.'] });
        } }] },
      { num: '12', stem: 'Convert the following.', parts: [
        { id: '12a', level: 'PRG', make: function (r) { var F, I; do { F = r.int(8, 15); I = r.int(1, 11); } while (bord((12 * F + I) * 0.0254, 2)); return ftinToM(ftinH(F, I) + ' to metres (two decimal places)', F, I, 2, t(ftin(F, I) + '\\approx')); } },
        { id: '12b', level: 'PRG', make: function (r) {
          var X, ex; do { X = r.int(400, 800) / 100; ex = X * 100 / 2.54; } while (bord(ex, 0) || Math.round(ex) % 12 === 0);
          return mToFtin(Q(X.toFixed(2), 'm') + ' to feet and inches (nearest inch)', X, X.toFixed(2));
        } }] },
      { num: '13', stem: '<b>Estimate first, then convert.</b> Use a benchmark to estimate mentally (' + t('1\\text{ in}\\approx 2.5\\text{ cm}') + ', ' + t('1\\text{ m}\\approx 1.1\\text{ yd}') + ', ' + t('1\\text{ mi}\\approx 1.6\\text{ km}') + '), then convert exactly to the stated precision.', parts: [
        { id: '13a', level: 'PRG', make: function (r) {
          var F, I, inch, x; do { F = r.int(5, 6); I = r.int(1, 11); inch = 12 * F + I; x = inch * 0.0254; } while (bord(x, 2));
          var al = [alt(inch / 254, 'conv-direction', 'Centimetres are smaller than inches, so multiply by ' + t('2.54') + '.'), alt(inch * 0.3048, 'conv-factor', t('0.3048') + ' is metres per <b>foot</b>; you have inches.')]; if (I <= 9) al.push(alt((F + I / 10) * 0.3048, 'ft-in-decimal', decAsInch(F, I)));
          return estPart(ftinH(F, I) + ' to metres (two decimal places)', 'm', x, 2, inch * 2.5 / 100, inch / 2.5 / 100, t(inch + '\\text{ in}\\times 2.5\\approx ' + dS(inch * 2.5) + '\\text{ cm}') + ', a little under ' + t('2\\text{ m}') + '.', al,
            '<i>Estimate:</i> ' + t(ftin(F, I) + '=' + inch + '\\text{ in}') + ', and ' + t(inch + '\\times 2.5\\approx ' + dS(inch * 2.5) + '\\text{ cm}\\approx ' + dS(inch * 2.5 / 100) + '\\text{ m}') + '.<br><i>Exact:</i> ' + t(inch + '\\times 2.54=' + dS(cl(inch * 2.54)) + '\\text{ cm}\\approx ' + q(fx(x, 2), 'm')) + '. Reasonable ✓', F + ' ft ' + I + ' in to m (estimate)');
        } },
        { id: '13b', level: 'EMG', make: function (r) {
          var Km; do { Km = r.int(3, 30) * 10; } while (rnd(Km * 0.6214, 1) !== rnd(Km / 1.6093, 1) || bord(Km / 1.6093, 1));
          var x = Km / 1.6093;
          return estPart(Q(Km, 'km') + ' to miles (one decimal place)', 'mi', x, 1, Km / 1.6, Km * 1.6, t('1\\text{ mi}\\approx 1.6\\text{ km}') + ', so a mile is bigger and there are fewer miles: ' + t(Km + '\\div 1.6') + '.',
            [alt(Km * 1.6093, 'conv-direction', 'Miles are bigger than kilometres, so the number of miles is smaller: divide by ' + t('1.6093') + ' (or multiply by ' + t('0.6214') + ').')],
            '<i>Estimate:</i> ' + t(Km + '\\div 1.6=' + dS(Km / 1.6) + '\\text{ mi}') + '.<br><i>Exact:</i> ' + t(Km + '\\times 0.6214=' + dS(cl(Km * 0.6214)) + '\\approx ' + q(fx(x, 1), 'mi')) + ' (or ' + t(Km + '\\div 1.6093') + '). Reasonable ✓', Km + ' km to mi (estimate)');
        } },
        { id: '13c', level: 'BEG', make: function (r) {
          var N; do { N = r.int(3, 20); } while (N === 10); var x = N * 2.54;
          return estPart(Q(N, 'in') + ' to centimetres (one decimal place)', 'cm', x, 1, N * 2.5, N / 2.5, t('1\\text{ in}\\approx 2.5\\text{ cm}') + ', and a centimetre is smaller, so there are more of them: ' + t(N + '\\times 2.5') + '.',
            [alt(N / 2.54, 'conv-direction', 'Centimetres are smaller than inches, so the number gets bigger: multiply by ' + t('2.54') + '.')],
            '<i>Estimate:</i> ' + t(N + '\\times 2.5=' + dS(N * 2.5) + '\\text{ cm}') + '.<br><i>Exact:</i> ' + t(N + '\\times 2.54=' + dS(cl(x)) + '\\approx ' + q(fx(x, 1), 'cm')) + '. Reasonable ✓', N + ' in to cm (estimate)');
        } },
        { id: '13d', level: 'EMG', make: function (r) {
          var M; do { M = r.int(4, 40) * 5; } while (rnd(M / 0.9144, 1) !== rnd(M * 1.0936, 1) || bord(M / 0.9144, 1)); var x = M / 0.9144;
          return estPart(Q(M, 'm') + ' to yards (one decimal place)', 'yd', x, 1, M * 1.1, M / 1.1, t('1\\text{ m}\\approx 1.1\\text{ yd}') + ', so there are a few more yards than metres: ' + t(M + '\\times 1.1') + '.',
            [alt(M * 0.9144, 'conv-direction', 'A yard is shorter than a metre, so there are <b>more</b> yards: divide by ' + t('0.9144') + ' (or multiply by ' + t('1.0936') + ').')],
            '<i>Estimate:</i> ' + t(M + '\\times 1.1=' + dS(cl(M * 1.1)) + '\\text{ yd}') + '.<br><i>Exact:</i> ' + t(M + '\\div 0.9144=' + dS(rnd(x, 3)) + '\\ldots\\approx ' + q(fx(x, 1), 'yd')) + '. Reasonable ✓', M + ' m to yd (estimate)');
        } },
        { id: '13e', sub: 'e i', level: 'EMG', make: function (r, sh) {
          var N = sh.N, bad = fx(N / 2.54, 1);
          return mcPart(r, 'Jordan converted ' + Q(N, 'in') + ' to centimetres and got ' + Q(bad, 'cm') + '. Which benchmark explains why his answer can’t be right?', [
            { html: 'An inch is about ' + t('2.5\\text{ cm}') + ', so ' + Q(N, 'in') + ' should be about ' + Q(dS(N * 2.5), 'cm') + '. Centimetres are smaller, so the number must get bigger — he divided instead of multiplying.', right: true },
            { html: 'An inch is about ' + t('2.5\\text{ cm}') + ', so the answer should be about ' + t(dS(rnd(N / 2.5, 1)) + '\\text{ cm}') + ' — his answer is right.', why: 'Dividing by ' + t('2.5') + ' would make centimetres the bigger unit. A centimetre is <b>smaller</b> than an inch, so there are more of them.' },
            { html: 'A centimetre is about ' + t('0.39\\text{ in}') + ', so he should have multiplied by ' + t('0.3937') + '.', why: 'Multiplying by ' + t('0.3937') + ' changes centimetres to inches — the opposite direction. It would make the answer even smaller.' },
            { html: 'A foot is about ' + t('30\\text{ cm}') + ', so the answer should be about ' + Q(N * 30, 'cm') + '.', why: 'The measurement is in <b>inches</b>, not feet. Use the inch benchmark.' }],
            'An inch is about ' + t('2.5\\text{ cm}') + ', so ' + Q(N, 'in') + ' ' + t('\\approx ' + N + '\\times 2.5=' + dS(N * 2.5) + '\\text{ cm}') + '. Converting to a smaller unit must give a bigger number; ' + Q(bad, 'cm') + ' is far too small, so Jordan divided by ' + t('2.54') + ' instead of multiplying.', ['Which is smaller, an inch or a centimetre? So should the number get bigger or smaller?'], 'why ' + N + ' in ≠ ' + bad + ' cm');
        } },
        { id: '13e2', sub: 'e ii', level: 'BEG', make: function (r, sh) {
          var N = sh.N, ans = cl(N * 2.54);
          return numPart({ prompt: 'Jordan converted ' + Q(N, 'in') + ' and got ' + Q(fx(N / 2.54, 1), 'cm') + '. Find the correct value.', before: t(q(N, 'in') + '='), unit: 'cm', ans: ans, text: N + ' in to cm (correct Jordan)',
            alts: [alt(N / 2.54, 'conv-direction', 'That’s Jordan’s mistake: centimetres are smaller than inches, so multiply by ' + t('2.54') + '.'), alt(N * 0.3937, 'conv-direction', t('0.3937') + ' changes centimetres to inches. Here you go from inches to centimetres: multiply by ' + t('2.54') + '.')],
            sol: t(N + '\\times 2.54=' + q(ans, 'cm')) + ' (exact, since ' + t('1\\text{ in}=2.54\\text{ cm}') + ' exactly).', hints: ['Multiply by ' + t('2.54') + ': a centimetre is smaller, so the number gets bigger.'] });
        } }],
        shared: function (r) { var N; do { N = r.int(5, 20); } while (N === 10); return { N: N }; } },
      { num: '14', stem: 'Convert each height to the nearest hundredth of a metre, and each mass to the nearest kilogram. (' + t('1\\text{ in}=2.54\\text{ cm}') + ', ' + t('1\\text{ kg}\\approx 2.2\\text{ lb}') + ')', parts: [
        { id: '14a', level: 'PRG', make: function (r) { var h = r.pick([['Connor McDavid’s height', 6, 1], ['Sidney Crosby’s height', 5, 11], ['Nathan MacKinnon’s height', 6, 0], ['a hockey goalie’s height', 6, 4]]); return ftinToM(h[0] + ', ' + primes(h[1], h[2]), h[1], h[2], 2, t(primes(h[1], h[2]).replace('′', "'").replace('″', "''") + '\\approx'), h[1] + "'" + h[2] + '" to m'); } },
        { id: '14b', level: 'PRG', make: function (r) { var h = r.pick([['Yao Ming’s height', 7, 6], ['Shaquille O’Neal’s height', 7, 1], ['Manute Bol’s height', 7, 7], ['Zdeno Chara’s height', 6, 9]]); return ftinToM(h[0] + ', ' + primes(h[1], h[2]), h[1], h[2], 2, t(primes(h[1], h[2]).replace('′', "'").replace('″', "''") + '\\approx'), h[1] + "'" + h[2] + '" to m'); } },
        { id: '14c', level: 'PRG', make: function (r) { var h = r.pick([['Serena Williams’s height', 5, 9], ['Simone Biles’s height', 4, 8], ['Stephen Curry’s height', 6, 2], ['Michael Jordan’s height', 6, 6]]); return ftinToM(h[0] + ', ' + primes(h[1], h[2]), h[1], h[2], 2, t(primes(h[1], h[2]).replace('′', "'").replace('″', "''") + '\\approx'), h[1] + "'" + h[2] + '" to m'); } },
        { id: '14d', level: 'EMG', make: function (r) { var a = r.pick([['A bull bison', 2000], ['A polar bear', 1300], ['A draft horse', 1800], ['A bull elk', 700]]); return lbToKg(a[0], a[1]); } },
        { id: '14e', level: 'BEG', make: function (r) { var a = r.pick([['A large beaver', 44], ['A wolf', 88], ['A coyote', 33], ['A lynx', 22]]); return lbToKg(a[0], a[1]); } },
        { id: '14f', level: 'EMG', make: function (r) { var a = r.pick([['A bowling ball', 16], ['A turkey', 12], ['A bag of dog food', 20], ['A small bowling ball', 8]]); return lbToKg(a[0], a[1]); } }] },
      { num: '15', stem: 'Convert each height to feet and inches to the nearest inch, and each mass to the nearest pound. (' + t('1\\text{ in}=2.54\\text{ cm}') + ', ' + t('1\\text{ kg}\\approx 2.2\\text{ lb}') + ')', parts: [
        { id: '15a', level: 'PRG', make: function (r) { var h = r.pick([['Andre De Grasse’s height', 1.76], ['A sprinter’s height', 1.83], ['A swimmer’s height', 1.88], ['A figure skater’s height', 1.68]]); return mToFtin(h[0] + ', ' + Q(h[1].toFixed(2), 'm'), h[1], h[1].toFixed(2)); } },
        { id: '15b', level: 'PRG', make: function (r) { var h = r.pick([['Peter Crouch’s height', 2.01], ['A volleyball player’s height', 2.04], ['A basketball centre’s height', 2.13], ['A soccer goalkeeper’s height', 1.96]]); return mToFtin(h[0] + ', ' + Q(h[1].toFixed(2), 'm'), h[1], h[1].toFixed(2)); } },
        { id: '15c', level: 'PRG', make: function (r) { var h = r.pick([['Usain Bolt’s height', 1.95], ['A hockey defenceman’s height', 1.93], ['A rower’s height', 1.98], ['A high jumper’s height', 1.90]]); return mToFtin(h[0] + ', ' + Q(h[1].toFixed(2), 'm'), h[1], h[1].toFixed(2)); } },
        { id: '15d', level: 'BEG', make: function (r) { var a = r.pick([['A dairy cow', 680], ['A horse', 520], ['A bull moose', 450], ['A bison cow', 410]]); return kgToLb(a[0], a[1]); } },
        { id: '15e', level: 'BEG', make: function (r) { var a = r.pick([['A husky', 25], ['A golden retriever', 30], ['A beaver', 20], ['A wolf', 40]]); return kgToLb(a[0], a[1]); } },
        { id: '15f', level: 'BEG', make: function (r) { var a = r.pick([['A full hockey bag', 18], ['A checked suitcase', 23], ['A bag of dog food', 13], ['A bag of potatoes', 9]]); return kgToLb(a[0], a[1]); } }] },
      { num: '16', stem: function (sh) { return raceStem(sh.R, 16); }, shared: function (r) { return { R: r.pick(RACES16) }; }, parts: [
        { id: '16a', sub: 'i', level: 'EMG', make: function (r, sh) { return raceLonger(r, sh.R); } },
        { id: '16b', sub: 'ii', level: 'PRG', make: function (r, sh) { return raceDiff(sh.R); } }] },
      { num: '17', stem: function (sh) { return raceStem(sh.R, 17); }, shared: function (r) { return { R: r.pick(RACES17) }; }, parts: [
        { id: '17a', sub: 'i', level: 'EMG', make: function (r, sh) { return raceLonger(r, sh.R); } },
        { id: '17b', sub: 'ii', level: 'PRG', make: function (r, sh) { return raceDiff(sh.R); } }] },
      { num: '18', stem: '<i>(Multiple Choice)</i>', parts: [
        { id: '18', level: 'BEG', make: function (r) {
          var Y = r.int(2, 9), N = r.int(1, 11), a = 36 * Y + N;
          return mcPart(r, 'The number of inches in ' + t(Y + '\\text{ yards and }' + N + '\\text{ inches}') + ' is', [
            { html: t(a), right: true },
            { html: t(12 * Y + N), why: 'That treats the yards as feet. A yard is ' + t('3\\text{ ft}=36\\text{ in}') + '.' },
            { html: t(36 * Y), why: 'Don’t forget to add the extra ' + t(N + '\\text{ in}') + '.' },
            { html: t(3 * Y + N), why: t(Y + '\\times 3') + ' changes yards to <b>feet</b> — the inches still need ' + t('\\times 12') + '.' }],
            t('1\\text{ yd}=36\\text{ in}') + ', so ' + t(Y + '\\times 36=' + 36 * Y + '\\text{ in}') + ', and ' + t(36 * Y + '+' + N + '=' + a + '\\text{ in}') + '.', ['How many inches are in one yard?'], Y + ' yd ' + N + ' in to in (MC)');
        } }] },
      { num: '19', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '19', level: 'EMG', make: function (r) {
          var Km; do { Km = r.pick([50, 60, 70, 80, 90, 95, 100, 105, 110, 120]); } while (rnd(Km / 1.6093, 0) !== rnd(Km * 0.6214, 0)); var x = Km / 1.6093;
          return nearPart({ prompt: 'A car crosses the Canada–US border. Its speedometer reads ' + Q(Km, 'km/h') + '. To the nearest whole number, this speed in mph is ________.', x: x, dp: 0, nr: true, text: Km + ' km/h to mph',
            alts: [alt(Km * 1.6093, 'conv-direction', 'A mile is longer than a kilometre, so the number of miles per hour is <b>smaller</b>. Divide by ' + t('1.6093') + '.')],
            sol: disp(chainT([[Km, 'km', null, 'h'], [1, 'mi', 1.6093, 'km']]) + '=' + dS(rnd(x, 2)) + '\\ldots\\approx ' + q(rnd(x, 0), 'mph')) + 'km cancels, leaving mi/h.', hints: [t('1\\text{ mi}\\approx 1.6093\\text{ km}') + '. Should the number get bigger or smaller?'] });
        } }] },
      { num: '20', stem: '<i>(Numerical Response)</i>', parts: [
        { id: '20', level: 'EMG', make: function (r) {
          var S; do { S = r.pick([25, 30, 35, 40, 45, 50, 55, 60, 62, 65, 70, 75]); } while (rnd(S * 1.6093, 0) !== rnd(S / 0.6214, 0) || bord(S * 1.6093, 0)); var x = S * 1.6093;
          return nearPart({ prompt: 'A vehicle is travelling at ' + Q(S, 'mph') + '. To the nearest whole number, this speed in km/h is ________.', x: x, dp: 0, nr: true, text: S + ' mph to km/h',
            alts: [alt(S / 1.6093, 'conv-direction', 'A kilometre is shorter than a mile, so the number of kilometres per hour is <b>bigger</b>. Multiply by ' + t('1.6093') + '.')],
            sol: disp(chainT([[S, 'mi', null, 'h'], [1.6093, 'km', 1, 'mi']]) + '=' + dS(rnd(x, 2)) + '\\ldots\\approx ' + q(rnd(x, 0), 'km/h')) + 'mi cancels, leaving km/h.', hints: [t('1\\text{ mi}\\approx 1.6093\\text{ km}') + '. Should the number get bigger or smaller?'] });
        } }] },
      { num: '21', section: 'Extension — the speed of light (Questions 21–23)', stem: '<i>Use the following information to answer Questions 21–23.</i><br>In physics, the speed of light in a vacuum is denoted by the letter ' + t('c') + '. Its value is recorded as exactly ' + t('299\\,792\\,458\\text{ m/s}') + '.', parts: [
        { id: '21', level: 'EMG', outcome: 'EXT', make: function (r) {
          var P = r.pick([{ p: 100000, w: 'one hundred thousand' }, { p: 100000, w: 'one hundred thousand' }, { p: 1000, w: 'thousand' }, { p: 100, w: 'hundred' }, { p: 10, w: 'ten' }]), ans = Math.round(CKM / P.p) * P.p;
          var base = exactCheck(ans, { places: true, placesHint: function (j) { return j === 3 ? 'That’s still in <b>metres</b> per second. Divide by ' + t('1000') + ' for km/s.' : placesDefault(j); } });
          var p = numPart({ prompt: t('c') + ' is often approximated in kilometres per second. State the speed of light to the nearest ' + P.w + ' kilometres per second.', ans: ans, unit: 'km/s', text: 'c in km/s to nearest ' + P.p,
            sol: disp(chainT([['299\\,792\\,458', 'm', null, 's'], [1, 'km', 1000, 'm']]) + '=299\\,792.458\\text{ km/s}') + 'To the nearest ' + P.w + ': ' + t(q(ans, 'km/s')) + '.', hints: ['Change metres to kilometres (' + t('\\div 1000') + '), then round.'] });
          p.check = wrapUnit(function (resp) { var a = HW.parse.number(resp); if (a.ok && Math.abs(a.value - CKM) < 1 && a.value !== ans) return form('round', 'Right conversion — now round it to the nearest ' + P.w + ' km/s.'); return base(resp); });
          return p;
        } }] },
      { num: '22', stem: '<i>(Extension; Multiple Choice)</i> ' + t('c=299\\,792\\,458\\text{ m/s}') + '.', parts: [
        { id: '22', level: 'EMG', outcome: 'EXT', make: function (r) {
          var P = r.pick([{ p: 1000, w: 'thousand' }, { p: 1000, w: 'thousand' }, { p: 100, w: 'hundred' }, { p: 10000, w: 'ten thousand' }]), mi = CKM / 1.6093, f = function (x) { return t(HW.fmt(Math.round(x / P.p) * P.p)); };
          var ans = Math.round(mi / P.p) * P.p, opts = [{ html: f(mi), right: true }, { html: t(HW.fmt(ans * 10)), why: 'Check the place value: that is ten times too big.' }, { html: f(CKM), why: 'That is the speed in <b>kilometres</b> per second. Change km to miles: divide by ' + t('1.6093') + '.' }];
          if (P.p === 10000 || r.chance(0.3)) opts.push({ html: f(CKM * 1.6093), why: 'You multiplied by ' + t('1.6093') + '. A mile is longer than a kilometre, so there are <b>fewer</b> miles: divide.' });
          else opts.push({ html: t(HW.fmt(Number(String(ans).replace(/^(\d)(\d)(\d)/, '$1$3$2')))), why: 'Check the digits: ' + t(dS(rnd(mi, 1))) + ' rounds to ' + t(HW.fmt(ans)) + '.' });
          return mcPart(r, 'In the imperial system, ' + t('c') + ' is usually estimated in miles per second. Determine the speed of light to the nearest ' + P.w + ' miles per second.', opts,
            disp(chainT([['299\\,792.458', 'km', null, 's'], [1, 'mi', 1.6093, 'km']]) + '=' + grp(dS(rnd(mi, 2))) + '\\ldots\\text{ mi/s}\\approx ' + q(ans, 'mi/s')) + 'km cancels, leaving mi/s.', ['First change m/s to km/s, then km to miles (' + t('1\\text{ mi}\\approx 1.6093\\text{ km}') + ').'], 'c in mi/s (MC)');
        } }] },
      { num: '23', stem: '<i>(Extension; Multiple Choice)</i> ' + t('c=299\\,792\\,458\\text{ m/s}') + '.', parts: [
        { id: '23', level: 'PRG', outcome: 'EXT', make: function (r) {
          var G = r.pick([{ y: 70000, c: 'cross the Andromeda galaxy' }, { y: 70000, c: 'cross the Andromeda galaxy' }, { y: 100000, c: 'cross the Milky Way galaxy' }, { y: 26000, c: 'reach Earth from the centre of the Milky Way' }, { y: 2500000, c: 'reach Earth from the Andromeda galaxy' }]);
          var m = G.y * YEAR_S * C, km = m / 1000, mi = km / 1.6093;
          return mcPart(r, 'It takes light approximately ' + t(HW.fmt(G.y)) + ' years to ' + G.c + '. Assuming an average of ' + t('365.25') + ' days per year, the approximate distance in miles is', [
            { html: t(sci2(mi)), right: true },
            { html: t(sci2(km)), why: 'That is the distance in <b>kilometres</b>. One more factor: ' + t('\\dfrac{1\\text{ mi}}{1.6093\\text{ km}}') + '.' },
            { html: t(sci2(mi * 1000)), why: 'The speed is in <b>metres</b> per second: change metres to kilometres (' + t('\\div 1000') + ') before changing to miles.' },
            { html: t(sci2(km * 1.6093)), why: 'You multiplied by ' + t('1.6093') + '. Miles are longer than kilometres, so there are fewer of them: divide.' }],
            'Seconds in a year: ' + t('365.25\\times 24\\times 3600=31\\,557\\,600\\text{ s}') + '.<br>Distance: ' + t(HW.fmt(G.y) + '\\times 31\\,557\\,600\\times 299\\,792\\,458\\approx ' + sci2(m) + '\\text{ m}') + ', which is ' + t(sci2(km) + '\\text{ km}') + '.<br>' + t('\\dfrac{' + sci2(km) + '\\text{ km}}{1.6093}\\approx ' + sci2(mi) + '\\text{ mi}') + '.', ['Find the number of seconds in ' + t(HW.fmt(G.y)) + ' years, multiply by the speed, then change metres → kilometres → miles.'], 'light travel ' + G.y + ' years in miles (MC)');
        } }] }
    ],

    extra: [
      /* ---------- Part A: the unit factor ---------- */
      { num: '1', section: 'Extra practice A — The unit factor', stem: function (sh) { return 'Convert ' + Q(sh.v, 'km') + ' to millimetres using unit analysis, in two factors, through metres.'; },
        shared: function (r) { var v; do { v = r.int(101, 999); } while (v % 10 === 0); return { v: cl(v / 100) }; }, parts: [
        { id: 'e1a', sub: 'a', level: 'BEG', make: function (r, sh) {
          return mcPart(r, 'From ' + t('1\\text{ km}=1000\\text{ m}') + ' you can build two unit factors. Which one converts ' + Q(sh.v, 'km') + ' <b>into</b> metres, and why?', [
            { html: t('\\dfrac{1000\\text{ m}}{1\\text{ km}}') + ', because km is on the bottom, so it cancels the km in ' + Q(sh.v, 'km') + ' and leaves m.', right: true },
            { html: t('\\dfrac{1\\text{ km}}{1000\\text{ m}}') + ', because its km is on top, matching the km in ' + Q(sh.v, 'km') + '.', why: 'Units on the same side multiply — they don’t cancel. You would get ' + t('\\text{km}^2/\\text{m}') + '.' },
            { html: t('\\dfrac{1000\\text{ m}}{1\\text{ km}}') + ', because it makes the answer bigger.', why: 'Right factor, wrong reason. Choose it because of which unit has to <b>cancel</b>, not because of how the answer looks.' },
            { html: 'Either one — both are equal to ' + t('1') + ', so they give the same answer.', why: 'Both equal ' + t('1') + ', but only one of them cancels the km. The other leaves a unit that measures nothing.' }],
            'Both ' + t('\\dfrac{1000\\text{ m}}{1\\text{ km}}') + ' and ' + t('\\dfrac{1\\text{ km}}{1000\\text{ m}}') + ' equal ' + t('1') + '. The given measurement has km on <b>top</b>, so the factor must have km on the <b>bottom</b> to cancel it — that is ' + t('\\dfrac{1000\\text{ m}}{1\\text{ km}}') + ', which leaves metres.', ['Which unit has to disappear? It must sit on the opposite side of the factor.'], 'choose the unit factor km→m');
        } },
        { id: 'e1b', sub: 'b i', level: 'BEG', make: function (r, sh) { var p = metricPart(sh.v, 'km', 'mm', 'chain'); p.prompt = 'Write the full two-factor chain and evaluate it. Give the answer in standard notation.'; return p; } },
        { id: 'e1b2', sub: 'b ii', level: 'BEG', make: function (r, sh) {
          var x = cl(sh.v * 1e6);
          return sciPart('Give ' + Q(sh.v, 'km') + ' in millimetres in <b>scientific notation</b>.', x, cl(sh.v / 1e6), t(q(sh.v, 'km') + '='), 'mm', disp(chainT([[sh.v, 'km', null, null], [1000, 'm', 1, 'km'], [1000, 'mm', 1, 'm']]) + '=' + q(x, 'mm') + '=' + K.sciTex(x) + '\\text{ mm}'),
            ['Multiply by ' + t('1000') + ' twice, then write the result as ' + t('a\\times 10^{n}') + ' with ' + t('1\\le a<10') + '.'], sh.v + ' km to mm (sci)', 'Millimetres are smaller, so there are more of them: the power of ten should be positive.');
        } },
        { id: 'e1c', sub: 'c', level: 'EMG', make: function (r, sh) {
          return mcPart(r, 'A classmate started with ' + t('\\dfrac{' + dT(sh.v) + '\\text{ km}}{1}\\times\\dfrac{1\\text{ km}}{1000\\text{ m}}') + '. Nothing cancels. What unit does this product actually carry?', [
            { html: t('\\dfrac{\\text{km}^2}{\\text{m}}') + ' — a unit that measures nothing useful', right: true },
            { html: t('\\text{m}'), why: 'The m is on the <b>bottom</b> of the factor, so it can’t be what is left on top.' },
            { html: t('\\text{km}'), why: 'km is on top in <b>both</b> fractions, so the two multiply: km × km.' },
            { html: t('\\text{mm}'), why: 'There is no mm anywhere in this product yet.' }],
            'km is on top in both fractions, so they multiply instead of cancelling, and m is left on the bottom: ' + t('\\dfrac{\\text{km}\\times\\text{km}}{\\text{m}}=\\dfrac{\\text{km}^2}{\\text{m}}') + '. Spotting a nonsense unit warns you <b>before</b> doing any arithmetic.', ['Write out where each unit sits — top or bottom.'], 'unit of an upside-down chain');
        } }] },
      { num: '2', stem: 'Convert each measurement. Each crosses more than one prefix, so route every one through the base unit (the metre).' + metricLine(true), parts: [
        { id: 'e2a', sub: 'a', level: 'EMG', make: function (r) { var v; do { v = r.int(11, 99); } while (v % 10 === 0); return metricPart(v * 100, 'mm', 'km', 'chain'); } },
        { id: 'e2b', sub: 'b', level: 'EMG', outcome: 'EXT', make: function (r) { var v; do { v = r.int(11, 99); } while (v % 10 === 0); return metricPart(v * 10, 'µm', 'cm', 'chain'); } },
        { id: 'e2c', sub: 'c', level: 'EMG', outcome: 'EXT', make: function (r) { var v; do { v = r.int(11, 99); } while (v % 10 === 0); return metricPart(cl(v / 100), 'Gm', 'km', 'chain'); } },
        { id: 'e2d', sub: 'd', level: 'EMG', outcome: 'EXT', make: function (r) { return metricPart(r.int(11, 99), 'cm', 'nm', 'chain'); } }] },
      { num: '3', stem: 'Convert using unit factors and leave every answer in <b>scientific notation</b>, ' + t('a\\times 10^{n}') + ' with ' + t('1\\le a<10') + '.', parts: [
        { id: 'e3a', sub: 'a', level: 'EMG', outcome: 'EXT', make: function (r) {
          var v; do { v = r.int(11, 99); } while (v % 10 === 0); v = cl(v / 10); var x = cl(v * 1e-12);
          return sciPart('Convert ' + Q(v, 'nm') + ' to kilometres.', x, cl(v * 1e12), t(q(v, 'nm') + '='), 'km', disp(chainT([[v, 'nm', null, null], [1, 'm', '10^{9}', 'nm'], [1, 'km', 1000, 'm']]) + '=\\dfrac{' + dT(v) + '}{10^{12}}\\text{ km}=' + K.sciTex(x) + '\\text{ km}'),
            ['nano is ' + t('10^{-9}') + ' and kilo is ' + t('10^{3}') + ': the powers differ by ' + t('12') + '.', 'Kilometres are much bigger, so the power of ten is negative.'], v + ' nm to km', 'Kilometres are far <b>bigger</b> than nanometres, so the number must be far <b>smaller</b>: the power of ten should be negative.');
        } },
        { id: 'e3b', sub: 'b', level: 'EMG', outcome: 'EXT', make: function (r) {
          var v; do { v = r.int(11, 99); } while (v % 10 === 0); v = cl(v / 10); var x = cl(v * 1e9);
          return sciPart('Convert ' + Q(v, 'Mm') + ' to millimetres.', x, cl(v * 1e-9), t(q(v, 'Mm') + '='), 'mm', disp(chainT([[v, 'Mm', null, null], ['10^{6}', 'm', 1, 'Mm'], [1000, 'mm', 1, 'm']]) + '=' + dT(v) + '\\times 10^{9}\\text{ mm}'),
            ['mega is ' + t('10^{6}') + ' and milli is ' + t('10^{-3}') + ': the powers differ by ' + t('9') + '.'], v + ' Mm to mm', 'Millimetres are far <b>smaller</b> than megametres, so the number must be far <b>bigger</b>: the power of ten should be positive.');
        } },
        { id: 'e3c', sub: 'c', level: 'EMG', outcome: 'EXT', make: function (r) {
          var v; do { v = r.int(101, 999); } while (v % 10 === 0); var x = cl(v * 1e-9);
          return sciPart('Convert ' + Q(v, 'µm') + ' to kilometres.', x, cl(v * 1e9), t(q(v, 'µm') + '='), 'km', disp(chainT([[v, 'µm', null, null], [1, 'm', '10^{6}', 'µm'], [1, 'km', 1000, 'm']]) + '=' + v + '\\times 10^{-9}\\text{ km}=' + K.sciTex(x) + '\\text{ km}') + 'Rewrite with ' + t('1\\le a<10') + ' at the end.',
            ['micro is ' + t('10^{-6}') + ' and kilo is ' + t('10^{3}') + '.', 'The coefficient must be between ' + t('1') + ' and ' + t('10') + ': adjust the power of ten when you move the decimal point.'], v + ' µm to km', 'Kilometres are far <b>bigger</b> than micrometres, so the number must be far <b>smaller</b>: the power of ten should be negative.');
        } },
        { id: 'e3d', sub: 'd', level: 'EMG', outcome: 'EXT', make: function (r) {
          var b = cl(r.int(2, 8) / 10 + 0.01), Ls = [b, cl(b + 0.005), cl(b + 0.01)], us = r.shuffle(['µm', 'km', 'mm']);
          var rep = function (L, u) { return u === 'µm' ? K.sciTex(cl(L * 1e6)) + '\\ \\mu\\text{m}' : u === 'km' ? K.sciTex(cl(L / 1000)) + '\\text{ km}' : dT(cl(L * 1000)) + '\\text{ mm}'; };
          var items = Ls.map(function (L, i) { return { id: 'L' + i, tex: rep(L, us[i]), L: L, u: us[i] }; });
          var p = K.P.order(r, 'Arrange these three lengths from <b>shortest to longest</b>. (Convert them all to one unit first — the leading digits alone prove nothing.)', items, { first: 'shortest', last: 'longest' },
            'Change all three to metres:<br>' + items.map(function (it) { return t(it.tex + '=' + dS(it.L) + '\\text{ m}'); }).join('<br>') + '<br>Shortest to longest: ' + items.map(function (it) { return t(it.tex); }).join(', ') + '. Each original number counts a different-sized unit, so they can only be compared once they are in the same unit.',
            ['Convert every length to metres.', 'micro is ' + t('10^{-6}') + ', milli is ' + t('10^{-3}') + ', kilo is ' + t('10^{3}') + '.'], 'order lengths in µm, km, mm');
          return p;
        } }] },
      /* ---------- Part B: inside the imperial system ---------- */
      { num: '4', section: 'Extra practice B — Inside the imperial system', stem: 'Convert each of the following using unit factors. (' + t('1\\text{ ft}=12\\text{ in}') + ', ' + t('1\\text{ yd}=3\\text{ ft}') + ', ' + t('1\\text{ mi}=5280\\text{ ft}=1760\\text{ yd}') + ')', parts: [
        { id: 'e4a', sub: 'a', level: 'BEG', make: function (r) {
          var Y = r.int(3, 15), ans = 36 * Y;
          return numPart({ prompt: Q(Y, 'yd') + ' to inches (two factors)', before: t(q(Y, 'yd') + '='), unit: 'in', ans: ans, places: false, text: Y + ' yd to in',
            alts: [alt(12 * Y, 'conv-factor', 'A yard is ' + t('3\\text{ ft}') + ', and each foot is ' + t('12\\text{ in}') + ' — two factors.'), alt(3 * Y, 'stopped-early', 'That’s feet. One more factor: ' + t('\\dfrac{12\\text{ in}}{1\\text{ ft}}') + '.')],
            sol: disp(chainT([[Y, 'yd', null, null], [3, 'ft', 1, 'yd'], [12, 'in', 1, 'ft']]) + '=' + Y + '\\times 3\\times 12=' + q(ans, 'in')) + 'Factor 1 comes from ' + t('1\\text{ yd}=3\\text{ ft}') + '; factor 2 from ' + t('1\\text{ ft}=12\\text{ in}') + '.', hints: ['Yards → feet → inches.'] });
        } },
        { id: 'e4b', sub: 'b', level: 'BEG', make: function (r) {
          var X = cl(r.int(1, 19) * 0.05), ans = cl(X * 5280);
          return numPart({ prompt: Q(X, 'mi') + ' to feet', before: t(q(X, 'mi') + '='), unit: 'ft', ans: ans, places: false, text: X + ' mi to ft',
            alts: [alt(X * 1760, 'conv-factor', t('1760') + ' is yards per mile. In feet, ' + t('1\\text{ mi}=5280\\text{ ft}') + '.'), alt(X / 5280, 'conv-direction', 'Feet are smaller than miles, so multiply.')],
            sol: disp(chainT([[X, 'mi', null, null], [5280, 'ft', 1, 'mi']]) + '=' + q(ans, 'ft')) + 'From ' + t('1\\text{ mi}=5280\\text{ ft}') + '; mi cancels.', hints: [t('1\\text{ mi}=5280\\text{ ft}') + '.'] });
        } },
        { id: 'e4c', sub: 'c', level: 'EMG', make: function (r) {
          var N; do { N = r.int(1000, 6000); } while (N % 12 === 0); var w = decomp(N, FTIN);
          return mixedPart({ prompt: Q(N, 'in') + ' to feet and inches', total: N, U: FTIN, text: N + ' in to ft in', alts: [{ total: N * 144, code: 'conv-direction', hint: 'Feet are bigger than inches: divide by ' + t('12') + '.' }],
            sol: t(N + '\\div 12=' + w[0] + '\\text{ R }' + w[1]) + ': the quotient counts feet, the remainder is still inches.<br>' + Q(N, 'in') + ' ' + t('=' + ftin(w[0], w[1])) + '. Check: ' + t(w[0] + '\\times 12+' + w[1] + '=' + N) + ' ✓', hints: ['Divide with a remainder, not a decimal.'] });
        } },
        { id: 'e4d', sub: 'd', level: 'BEG', make: function (r) {
          var X; do { X = r.int(11, 59); } while (X % 10 === 0); X = cl(X / 10); var ans = cl(X * 1760);
          return numPart({ prompt: Q(X, 'mi') + ' to yards', before: t(q(X, 'mi') + '='), unit: 'yd', ans: ans, places: false, text: X + ' mi to yd',
            alts: [alt(X * 5280, 'conv-factor', t('5280') + ' is feet per mile. In yards, ' + t('1\\text{ mi}=1760\\text{ yd}') + '.'), alt(X / 1760, 'conv-direction', 'Yards are smaller than miles, so multiply.')],
            sol: disp(chainT([[X, 'mi', null, null], [1760, 'yd', 1, 'mi']]) + '=' + q(ans, 'yd')) + '(Through feet gives the same: ' + t(dT(X) + '\\times 5280\\div 3=' + dT(ans)) + '.)', hints: [t('1\\text{ mi}=1760\\text{ yd}') + '.'] });
        } }] },
      { num: '5', stem: function (sh) { return 'A surveyed fence line measures ' + Q(sh.N, 'inches') + '.'; }, shared: function (r) { var N; do { N = r.int(1000, 3000); } while (N % 12 === 0 || N % 36 < 12 && r.chance(0.5)); return { N: N }; }, parts: [
        { id: 'e5a', sub: 'a', level: 'EMG', make: function (r, sh) {
          var N = sh.N, w = decomp(N, FTIN);
          return mixedPart({ prompt: 'Express the length in <b>feet and inches</b>.', total: N, U: FTIN, text: N + ' in to ft in',
            sol: t(N + '\\div 12=' + w[0] + '\\text{ R }' + w[1]) + '. The quotient counts whole <b>feet</b>; the remainder is still in <b>inches</b>.<br>' + Q(N, 'in') + ' ' + t('=' + ftin(w[0], w[1])) + '.', hints: ['Divide by ' + t('12') + ' with a remainder.'] });
        } },
        { id: 'e5b', sub: 'b', level: 'EMG', make: function (r, sh) {
          var N = sh.N, w = decomp(N, YDFTIN), f = Math.floor(N / 12);
          return mixedPart({ prompt: 'Express the length in <b>yards, feet and inches</b>.', total: N, U: YDFTIN, text: N + ' in to yd ft in',
            sol: 'In feet and inches: ' + t(ftin(f, N % 12)) + '. The inches can’t become yards, so convert only the ' + t(f + '\\text{ ft}') + ': ' + t(f + '\\div 3=' + w[0] + '\\text{ R }' + w[1]) + '.<br>So ' + Q(N, 'in') + ' ' + t('=' + mixT(w, YDFTIN)) + '. Check: ' + t(w[0] + '\\times 36+' + w[1] + '\\times 12+' + w[2] + '=' + N) + ' ✓', hints: ['Find the feet and inches first, then change the whole feet into yards and feet.'] });
        } },
        { id: 'e5c', sub: 'c', level: 'EMG', make: function (r, sh) {
          var N = sh.N, x = N / 36;
          return nearPart({ prompt: 'Express the same length as a <b>decimal number of yards</b>, to four decimal places.', before: t(q(N, 'in') + '\\approx'), x: x, dp: 4, unit: 'yd', text: N + ' in to decimal yd',
            alts: [alt(N / 12, 'stopped-early', 'That’s feet. One more factor: ' + t('\\dfrac{1\\text{ yd}}{3\\text{ ft}}') + '.'), alt(N / 3, 'conv-factor', 'You divided by ' + t('3') + ' straight away, but these are inches: first ' + t('\\div 12') + ' for feet, then ' + t('\\div 3') + ' for yards.')],
            sol: disp(chainT([[N, 'in', null, null], [1, 'ft', 12, 'in'], [1, 'yd', 3, 'ft']]) + '=\\dfrac{' + N + '}{36}\\text{ yd}\\approx ' + q(fx(x, 4), 'yd')) + 'Carry full precision and round once, at the end.', hints: ['Two factors: inches → feet → yards.'] });
        } },
        { id: 'e5d', sub: 'd', level: 'EMG', make: function (r, sh) {
          var N = sh.N, w = decomp(N, YDFTIN), x = N / 36, fr = x - Math.floor(x), lft = N - 36 * w[0];
          return mcPart(r, 'In yards, feet and inches the fence is ' + t(mixT(w, YDFTIN)) + '; as a decimal it is about ' + Q(fx(x, 4), 'yd') + '. Why are the digits after the decimal point <b>not</b> the “feet and inches” part?', [
            { html: 'The decimal part, ' + t(dS(rnd(fr, 4)) + '\\ldots\\text{ yd}') + ', is a fraction of a <b>yard</b>. It is the same leftover ' + t(lft + '\\text{ in}') + ', just measured in a different unit.', right: true },
            { html: 'The decimal was rounded, so the feet and inches got lost.', why: 'Rounding only changes the last digit. Even unrounded, the decimal part counts <b>yards</b>, not feet and inches.' },
            { html: 'They should match — the decimal answer is wrong.', why: 'Both are right. ' + t(dS(rnd(fr, 4)) + '\\text{ yd}\\times 36') + ' is about ' + t(lft + '\\text{ in}') + ' — the same leftover in a different unit.' },
            { html: 'Yards can’t have decimals, so only the mixed measure is correct.', why: 'A decimal number of yards is perfectly valid; it just isn’t written in feet and inches.' }],
            'The decimal part is a fraction of a yard: ' + t(dS(rnd(fr, 4)) + '\\ldots\\text{ yd}\\times 36\\text{ in/yd}\\approx ' + lft + '\\text{ in}') + '. The decimal tail and the remainder describe the same length in different units, so their digits don’t look alike.', ['What unit does the decimal part of ' + Q(fx(x, 4), 'yd') + ' count?'], 'decimal yards vs yd ft in');
        } }] },
      { num: '6', stem: function (sh) { return 'A carpenter cuts three shelves of lengths ' + sh.L.map(function (l) { return ftinH(l[0], l[1]); }).join(', ') + ' from a single ' + t(sh.B + '\\text{-foot}') + ' board. Ignore the width of the saw cut.'; },
        shared: function (r) { var L, B, T, g = 0; if (r.chance(0.2)) return { L: [[4, 9], [3, 8], [5, 11]], T: 172, B: 16 }; do { L = [0, 1, 2].map(function () { return [r.int(2, 6), r.int(1, 11)]; }); T = L.reduce(function (m, l) { return m + 12 * l[0] + l[1]; }, 0); g++; } while (L.reduce(function (m, l) { return m + l[1]; }, 0) < 14 && g < 300); B = Math.ceil(T / 12) + r.int(1, 3); return { L: L, T: T, B: B }; }, parts: [
        { id: 'e6a', sub: 'a', level: 'EMG', make: function (r, sh) {
          var w = decomp(sh.T, FTIN), ins = sh.L.map(function (l) { return 12 * l[0] + l[1]; });
          return mixedPart({ prompt: 'Find the total length of the three shelves, in feet and inches.', total: sh.T, U: FTIN, text: 'add ' + sh.L.map(function (l) { return l[0] + "'" + l[1] + '"'; }).join(' + '),
            sol: 'Convert all three to inches: ' + sh.L.map(function (l, i) { return t(ftin(l[0], l[1]) + '=' + ins[i] + '\\text{ in}'); }).join(', ') + '.<br>Total ' + t(ins.join('+') + '=' + sh.T + '\\text{ in}') + ', and ' + t(sh.T + '\\div 12=' + w[0] + '\\text{ R }' + w[1]) + ', so the total is ' + t(ftin(w[0], w[1])) + '.', hints: ['Change every length to inches, add, then change back to feet and inches.'] });
        } },
        { id: 'e6a2', sub: 'a (why)', level: 'EMG', make: function (r, sh) {
          var sf = sh.L.reduce(function (m, l) { return m + l[0]; }, 0), si = sh.L.reduce(function (m, l) { return m + l[1]; }, 0);
          return mcPart(r, 'Adding “feet to feet and inches to inches” gives ' + t(ftin(sf, si)) + '. Why is converting all three lengths to one unit first safer?', [
            { html: 'The inches add up past ' + t('12') + ', so they must be carried into feet — working in one unit removes that base-12 carrying step.', right: true },
            { html: 'Feet and inches can never be added separately.', why: 'They can — ' + t(ftin(sf, si)) + ' is true — but it isn’t finished: the ' + t(si + '\\text{ in}') + ' must be carried.' },
            { html: 'Converting first makes the answer more precise.', why: 'Both ways give exactly the same length. The issue is the carrying step, not precision.' },
            { html: 'Inches are metric, so they have to be converted first.', why: 'Inches are an imperial unit, like feet.' }],
            t(ftin(sf, si)) + ' is true but not an answer: ' + t(si + '\\text{ in}') + ' is more than a foot and has to be carried (' + t(si + '\\text{ in}=' + ftin(Math.floor(si / 12), si % 12)) + '). Collapsing to one unit first removes the carrying step, which is where the base-12 slip happens.', ['What goes wrong with the inches column?'], 'why convert mixed measures first');
        } },
        { id: 'e6b', sub: 'b', level: 'EMG', make: function (r, sh) {
          var off = 12 * sh.B - sh.T, wt = decomp(sh.T, FTIN), w = decomp(off, FTIN);
          return mixedPart({ prompt: 'The shelves total ' + t(ftin(wt[0], wt[1])) + '. The board is long enough — how long is the offcut left over, in feet and inches?', total: off, U: FTIN, text: 'offcut ' + sh.B + ' ft − ' + sh.T + ' in',
            alts: [{ total: 12 * (sh.B - wt[0]) + wt[1], code: 'borrow', hint: 'You can’t take ' + t(wt[1] + '\\text{ in}') + ' away from ' + t('0\\text{ in}') + ' by adding it. Regroup (' + t(sh.B + '\\text{ ft}=' + ftin(sh.B - 1, 12)) + ') or work in inches.' }],
            sol: 'Board: ' + t(sh.B + '\\text{ ft}=' + 12 * sh.B + '\\text{ in}') + '. Shelves: ' + t(sh.T + '\\text{ in}') + '.<br>' + t(12 * sh.B + '-' + sh.T + '=' + off + '\\text{ in}') + ', and ' + t(off + '\\div 12=' + w[0] + '\\text{ R }' + w[1]) + ', so the offcut is ' + t(ftin(w[0], w[1])) + '.', hints: ['Compare and subtract in one unit (inches).'] });
        } }] },
      /* ---------- Part C: crossing between the systems ---------- */
      { num: '7', section: 'Extra practice C — Crossing between the systems', stem: 'Convert each measurement, using unit factors and rounding only at the end. (' + t('1\\text{ ft}=0.3048\\text{ m}=30.48\\text{ cm}') + ')', parts: [
        { id: 'e7a', sub: 'a', level: 'EMG', make: function (r) {
          var Fq; do { Fq = r.int(10, 40); } while (Fq % 5 === 0 && r.chance(0.6)); var x = Fq * 0.3048;
          return nearPart({ prompt: Q(Fq, 'ft') + ' to metres (nearest thousandth of a metre)', before: t(q(Fq, 'ft') + '\\approx'), x: x, dp: 3, unit: 'm', text: Fq + ' ft to m',
            alts: [alt(Fq / 0.3048, 'conv-direction', 'A metre is longer than a foot, so there are fewer metres: multiply by ' + t('0.3048') + '.'), alt(Fq * 30.48, 'prefix-places', 'That’s centimetres. Use ' + t('1\\text{ ft}=0.3048\\text{ m}') + ' for metres.')],
            sol: disp(chainT([[Fq, 'ft', null, null], [0.3048, 'm', 1, 'ft']]) + '=' + dT(cl(x)) + '\\text{ m}\\approx ' + q(fx(x, 3), 'm')), hints: ['Use ' + t('\\dfrac{0.3048\\text{ m}}{1\\text{ ft}}') + ' so the feet cancel.'] });
        } },
        { id: 'e7b', sub: 'b', level: 'PRG', make: function (r) {
          var F = r.int(5, 6), I = r.int(1, 11), inch = 12 * F + I, x = inch * 2.54, al = [alt(inch / 2.54, 'conv-direction', 'Centimetres are smaller than inches: multiply.'), alt(F * 30.48, 'forgot-part', 'Don’t forget the ' + t(I + '\\text{ in}') + '.')];
          if (I <= 9) al.push(alt((F + I / 10) * 30.48, 'ft-in-decimal', decAsInch(F, I)));
          return nearPart({ prompt: ftinH(F, I) + ' to centimetres (nearest tenth of a centimetre)', before: t(ftin(F, I) + '\\approx'), x: x, dp: 1, unit: 'cm', alts: al, text: F + ' ft ' + I + ' in to cm',
            sol: 'Collapse to one unit first: ' + t(ftin(F, I) + '=' + inch + '\\text{ in}') + '.' + disp(chainT([[inch, 'in', null, null], [1, 'ft', 12, 'in'], [30.48, 'cm', 1, 'ft']]) + '=' + dT(cl(x)) + '\\text{ cm}\\approx ' + q(fx(x, 1), 'cm')), hints: ['Change the measurement to one imperial unit before crossing to centimetres.'] });
        } },
        { id: 'e7c', sub: 'c', level: 'PRG', make: function (r) {
          var X, ex; do { X = r.int(150, 300) / 100; ex = X / 0.0254; } while (bord(ex, 0) || Math.round(ex) % 12 === 0);
          var p = mToFtin(Q(X.toFixed(2), 'm') + ' to feet and inches (nearest inch)', X, X.toFixed(2));
          var ft = X / 0.3048, w = decomp(Math.round(ex), FTIN);
          p.solution = disp(chainT([[X.toFixed(2), 'm', null, null], [1, 'ft', 0.3048, 'm']]) + '=' + dS(rnd(ft, 5)) + '\\ldots\\text{ ft}') + 'Whole feet: ' + t(Math.floor(ft)) + '. Remainder: ' + t(dS(rnd(ft - Math.floor(ft), 5)) + '\\ldots\\text{ ft}\\times 12=' + dS(rnd((ft - Math.floor(ft)) * 12, 3)) + '\\ldots\\text{ in}') + '.<br>Total to the nearest inch: ' + t(ftin(w[0], w[1])) + '.';
          return p;
        } },
        { id: 'e7d', sub: 'd', level: 'EMG', make: function (r) {
          var N, x; do { N = r.int(20, 200); x = N / 2.54; } while (bord(x, 1) || rnd(x, 1) !== rnd(N * 0.3937, 1));
          return nearPart({ prompt: Q(N, 'cm') + ' to inches (nearest tenth of an inch)', before: t(q(N, 'cm') + '\\approx'), x: x, dp: 1, unit: 'in', text: N + ' cm to in',
            alts: [alt(N * 2.54, 'conv-direction', 'An inch is longer than a centimetre, so there are fewer inches: divide by ' + t('2.54') + '.'), alt(N / 30.48, 'stopped-early', 'That’s feet. One more factor: ' + t('\\dfrac{12\\text{ in}}{1\\text{ ft}}') + '.')],
            sol: disp(chainT([[N, 'cm', null, null], [1, 'ft', 30.48, 'cm'], [12, 'in', 1, 'ft']]) + '=\\dfrac{' + N + '\\times 12}{30.48}\\approx ' + q(fx(x, 1), 'in')) + '(Same as ' + t(N + '\\div 2.54') + '.)', hints: ['Centimetres → feet → inches, or simply ' + t('\\div 2.54') + '.'] });
        } }] },
      { num: '8', stem: function (sh) { return 'A doorway is measured as ' + Q(sh.N, 'cm') + ' tall. Two crossing factors are available: ' + t('1\\text{ ft}=0.3048\\text{ m}') + ' and ' + t('1\\text{ ft}=30.48\\text{ cm}') + '.'; },
        shared: function (r) { var N; do { N = r.int(185, 240); } while (bord(N / 2.54, 0) || Math.round(N / 2.54) % 12 === 0); return { N: N }; }, parts: [
        { id: 'e8a', sub: 'a', level: 'EMG', make: function (r, sh) {
          var N = sh.N, x = N / 30.48;
          return nearPart({ prompt: 'Convert the height to feet, to four decimal places.', before: t(q(N, 'cm') + '\\approx'), x: x, dp: 4, unit: 'ft', text: N + ' cm to ft',
            alts: [alt(N * 30.48, 'conv-direction', 'A foot is longer than a centimetre, so there are fewer feet: divide by ' + t('30.48') + '.'), alt(N / 0.3048, 'prefix-places', t('0.3048') + ' is metres per foot — change the centimetres to metres first, or use ' + t('30.48\\text{ cm}') + '.'), alt(N / 2.54, 'stopped-early', 'That’s inches. Divide by ' + t('12') + ' for feet.')],
            sol: 'One factor does it, since the height is already in centimetres:' + disp(chainT([[N, 'cm', null, null], [1, 'ft', 30.48, 'cm']]) + '=' + dS(rnd(x, 7)) + '\\ldots\\approx ' + q(fx(x, 4), 'ft')) + '(Through metres: ' + t('\\dfrac{' + N + '}{100}\\div 0.3048') + ' gives the same value.)', hints: ['Write the factor so cm cancels.'] });
        } },
        { id: 'e8b', sub: 'b', level: 'BEG', make: function (r, sh) {
          return mcPart(r, 'Converting ' + Q(sh.N, 'cm') + ' with ' + t('1\\text{ ft}=30.48\\text{ cm}') + ' and with ' + t('1\\text{ ft}=0.3048\\text{ m}') + ' (through metres) gives exactly the same answer. Why?', [
            { html: t('30.48=0.3048\\times 100') + ' exactly — the extra factor ' + t('\\dfrac{1\\text{ m}}{100\\text{ cm}}') + ' supplies the ' + t('100') + '.', right: true },
            { html: t('30.48=0.3048\\times 10') + ', and the extra factor supplies the ' + t('10') + '.', why: 'Count the places: ' + t('0.3048\\times 10=3.048') + '. There are ' + t('100') + ' cm in a metre.' },
            { html: 'They only agree after rounding.', why: 'They agree exactly, at every decimal place. Both facts are exact.' },
            { html: 'Because a foot is about ' + t('30\\text{ cm}') + '.', why: 'That benchmark is only approximate; the agreement is exact, because of the relationship between the two factors.' }],
            t('1\\text{ ft}=0.3048\\text{ m}=0.3048\\times 100\\text{ cm}=30.48\\text{ cm}') + '. The route through metres just has the two factors multiplied in a different order.', ['How many centimetres are in ' + t('0.3048\\text{ m}') + '?'], '30.48 vs 0.3048');
        } },
        { id: 'e8c', sub: 'c', level: 'PRG', make: function (r, sh) {
          var p = mToFtin('Report the doorway height in feet and inches, to the nearest inch.', sh.N / 100, String(sh.N / 100)); var ex = sh.N / 2.54, w = decomp(Math.round(ex), FTIN), ft = sh.N / 30.48;
          p.solution = t(sh.N + '\\div 30.48=' + dS(rnd(ft, 5)) + '\\ldots\\text{ ft}') + ': ' + t(Math.floor(ft)) + ' whole feet, and ' + t(dS(rnd(ft - Math.floor(ft), 5)) + '\\ldots\\times 12=' + dS(rnd((ft - Math.floor(ft)) * 12, 2)) + '\\ldots\\text{ in}') + '.<br>To the nearest inch: ' + t(ftin(w[0], w[1])) + '.';
          p.text = sh.N + ' cm to ft in'; return p;
        } }] },
      { num: '9', stem: 'A conversion fact you were never given can be <b>built</b> from facts you were. Use only ' + t('1\\text{ ft}=0.3048\\text{ m}') + ', ' + t('1\\text{ ft}=12\\text{ in}') + ', ' + t('1\\text{ yd}=3\\text{ ft}') + ', ' + t('1\\text{ mi}=5280\\text{ ft}') + ', ' + t('1\\text{ m}=100\\text{ cm}') + ' and ' + t('1\\text{ km}=1000\\text{ m}') + '.', parts: [
        { id: 'e9a', sub: 'a', level: 'EMG', make: function (r) {
          var P = r.pick([{ f: '1 yd', to: 'm', a: 0.9144, ch: [[1, 'yd', null, null], [3, 'ft', 1, 'yd'], [0.3048, 'm', 1, 'ft']], d: 0.3048 / 3 }, { f: '1 yd', to: 'm', a: 0.9144, ch: [[1, 'yd', null, null], [3, 'ft', 1, 'yd'], [0.3048, 'm', 1, 'ft']], d: 0.3048 / 3 }, { f: '1 yd', to: 'cm', a: 91.44, ch: [[1, 'yd', null, null], [3, 'ft', 1, 'yd'], [0.3048, 'm', 1, 'ft'], [100, 'cm', 1, 'm']], d: 0.3048 / 3 * 100 }, { f: '1 in', to: 'cm', a: 2.54, ch: [[1, 'in', null, null], [1, 'ft', 12, 'in'], [0.3048, 'm', 1, 'ft'], [100, 'cm', 1, 'm']], d: 0.3048 * 12 * 100 }]);
          return numPart({ prompt: 'Build ' + t(P.f.replace(' ', '\\text{ ') + '}=?\\text{ ' + P.to + '}') + ' as an <b>exact</b> value.', before: t(P.f.replace(' ', '\\text{ ') + '}='), unit: P.to, ans: P.a, text: 'build ' + P.f + ' in ' + P.to,
            alts: [alt(P.d, 'conv-direction', 'One factor is upside down — check that every unit you don’t want cancels.')],
            sol: disp(chainT(P.ch) + '=' + q(P.a, P.to)) + 'Exact, because every fact used is exact.', hints: ['Chain the facts so each unwanted unit cancels.'] });
        } },
        { id: 'e9b', sub: 'b', level: 'PRG', make: function (r) {
          var P = r.pick([{ to: 'km', a: 1.609344, ch: [[1, 'mi', null, null], [5280, 'ft', 1, 'mi'], [0.3048, 'm', 1, 'ft'], [1, 'km', 1000, 'm']] }, { to: 'km', a: 1.609344, ch: [[1, 'mi', null, null], [5280, 'ft', 1, 'mi'], [0.3048, 'm', 1, 'ft'], [1, 'km', 1000, 'm']] }, { to: 'm', a: 1609.344, ch: [[1, 'mi', null, null], [5280, 'ft', 1, 'mi'], [0.3048, 'm', 1, 'ft']] }]);
          var p = numPart({ prompt: 'Build ' + t('1\\text{ mi}=?\\text{ ' + P.to + '}') + ' as an <b>exact</b> value.', before: t('1\\text{ mi}='), unit: P.to, ans: P.a, text: 'build 1 mi in ' + P.to,
            alts: [alt(P.to === 'km' ? 5280 / 0.3048 / 1000 : 5280 / 0.3048, 'conv-direction', 'The ' + t('0.3048') + ' factor is upside down: feet must cancel, so ' + t('1\\text{ ft}') + ' goes on the bottom.')],
            sol: disp(chainT(P.ch) + '=' + q(P.a, P.to)) + 'This is exact. (The table’s ' + t('1.6093') + ' is this value rounded.)', hints: ['Miles → feet → metres' + (P.to === 'km' ? ' → kilometres' : '') + '.'] });
          var base = p.check, tbl = P.to === 'km' ? 1.6093 : 1609.3;
          p.check = function (resp) { var a = HW.parse.number(resp); if (a.ok && near(a.value, tbl, 1e-9)) return form('exact-round', 'That’s the rounded table value. Build the fact from the exact facts and keep every digit.'); return base(resp); };
          return p;
        } },
        { id: 'e9c', sub: 'c', level: 'PRG', make: function (r) {
          var D = r.pick([{ d: 26.2, w: 'a 26.2-mile marathon' }, { d: 26.2, w: 'a 26.2-mile marathon' }, { d: 13.1, w: 'a 13.1-mile half-marathon' }, { d: 50, w: 'a 50-mile ultra-marathon' }, { d: 31.1, w: 'a 31.1-mile race' }, { d: 100, w: 'a 100-mile race' }]);
          var gap = D.d * (1.609344 - 1.6093) * 1000;
          return nearPart({ prompt: 'The table lists ' + t('1\\text{ mi}=1.6093\\text{ km}') + '; the exact value is ' + t('1\\text{ mi}=1.609\\,344\\text{ km}') + '. How far apart would the two factors place the finish line of ' + D.w + '? Answer in metres, to the nearest tenth.', x: gap, dp: 1, unit: 'm', text: 'factor gap over ' + D.d + ' mi',
            alts: [alt(gap / 1000, 'prefix-places', 'That’s the gap in kilometres. The question asks for metres (' + t('\\times 1000') + ').'), alt(0.044, 'stopped-early', 'That’s the difference for <b>one</b> mile (in metres). Multiply by the number of miles.'), alt(gap * 100, 'prefix-places', 'That’s centimetres. Give the answer in metres.')],
            sol: 'Difference per mile: ' + t('1.609\\,344-1.6093=0.000\\,044\\text{ km}=4.4\\text{ cm}') + '.<br>Over ' + t(dS(D.d)) + ' mi: ' + t(dS(D.d) + '\\times 0.000\\,044=' + dS(rnd(D.d * 0.000044, 8)) + '\\text{ km}=' + dS(rnd(gap, 4)) + '\\text{ m}\\approx ' + q(fx(gap, 1), 'm')) + '.', hints: ['Find the difference between the two factors, then multiply by the distance.', 'Change kilometres to metres at the end.'] });
        } }] },
      /* ---------- Part D: rates ---------- */
      { num: '10', section: 'Extra practice D — Rates: two units change', stem: 'A unit in the <b>denominator</b> of a rate is cancelled by a factor with that unit in its <b>numerator</b>.', parts: [
        { id: 'e10a', sub: 'a', level: 'EMG', make: function (r) {
          var v = 18 * r.int(3, 8), ans = cl(v / 3.6);
          return numPart({ prompt: 'A highway speed is posted as ' + Q(v, 'km/h') + '. Convert it to metres per second.', before: t(q(v, 'km/h') + '='), unit: 'm/s', ans: ans, text: v + ' km/h to m/s',
            alts: [alt(v * 3.6, 'rate-flip', 'Both factors are upside down. km sits on <b>top</b> of the rate (so km goes on the bottom of its factor); h sits on the <b>bottom</b> (so h goes on top of its factor).'), alt(v * 1000 / 60, 'conv-factor', 'An hour has ' + t('3600') + ' seconds, not ' + t('60') + '.'), alt(v * 1000 * 3600, 'rate-time', 'The time factor is upside down: h is on the bottom of the rate, so use ' + t('\\dfrac{1\\text{ h}}{3600\\text{ s}}') + '.')],
            sol: disp(chainT([[v, 'km', 1, 'h'], [1000, 'm', 1, 'km'], [1, 'h', 3600, 's']]) + '=\\dfrac{' + v + '\\times 1000}{3600}=' + q(ans, 'm/s')) + 'Factor 1 cancels km (on top of the rate); factor 2 cancels h (on the bottom), so h goes on <b>top</b> of that factor.', hints: ['km on top → m; h on the bottom → s.'] });
        } },
        { id: 'e10b', sub: 'b', level: 'EMG', make: function (r) {
          var v = r.int(8, 40), ans = cl(v * 3.6);
          return numPart({ prompt: 'Convert ' + Q(v, 'm/s') + ' to kilometres per hour.', before: t(q(v, 'm/s') + '='), unit: 'km/h', ans: ans, text: v + ' m/s to km/h',
            alts: [alt(v / 3.6, 'rate-flip', 'Both factors are now the other way up compared with km/h → m/s: m is on top (so ' + t('1000\\text{ m}') + ' goes on the bottom) and s is on the bottom (so ' + t('3600\\text{ s}') + ' goes on top).'), alt(v * 60 / 1000, 'conv-factor', 'An hour has ' + t('3600') + ' seconds, not ' + t('60') + '.'), alt(v / 1000 / 3600, 'rate-time', 'The time factor is upside down: s is on the bottom of the rate, so use ' + t('\\dfrac{3600\\text{ s}}{1\\text{ h}}') + '.')],
            sol: disp(chainT([[v, 'm', 1, 's'], [1, 'km', 1000, 'm'], [3600, 's', 1, 'h']]) + '=\\dfrac{' + v + '\\times 3600}{1000}=' + q(ans, 'km/h')) + 'Both factors are inverted compared with km/h → m/s: the facts are the same, but where the units sit has changed.', hints: ['m on top → km; s on the bottom → h.'] });
        } },
        { id: 'e10c', sub: 'c', level: 'EMG', make: function (r) {
          return mcPart(r, 'Without converting anything, why is a speed in m/s always a <b>smaller</b> number than the same speed in km/h?', [
            { html: 'Changing km → m makes the number ' + t('1000') + ' times bigger, but changing h → s makes it ' + t('3600') + ' times smaller. The denominator wins: divide by ' + t('3.6') + '.', right: true },
            { html: 'Metres are smaller than kilometres, so the number must get smaller.', why: 'A smaller unit gives a <b>bigger</b> count — that part pushes the number up. It’s the time unit that pulls it down.' },
            { html: 'Seconds are smaller than hours, so the number must get bigger.', why: 'You cover much less distance in one second than in one hour, so the number gets <b>smaller</b> — and that effect wins.' },
            { html: 'Only the distance unit matters in a speed.', why: 'Both units change, and both affect the number. Compare ' + t('1000') + ' with ' + t('3600') + '.' }],
            'Two effects pull in opposite directions. km → m multiplies by ' + t('1000') + '; h → s divides by ' + t('3600') + '. Since ' + t('3600\\div 1000=3.6') + ', the m/s figure is the km/h figure divided by ' + t('3.6') + ' — always smaller.', ['Think about the numerator unit and the denominator unit separately.'], 'why m/s < km/h');
        } }] },
      { num: '11', stem: function (sh) { return 'Trim moulding is advertised at ' + t('\\$' + sh.A.toFixed(2)) + ' per foot at Store A, and at ' + t('\\$' + sh.B.toFixed(2)) + ' per metre at Store B. (' + t('1\\text{ ft}=0.3048\\text{ m}') + ')'; },
        shared: function (r) { var A, per, B, g = 0; do { A = r.int(250, 500) / 100; per = A / 0.3048; B = rnd(per + r.pick([-1, 1]) * r.int(20, 120) / 100, 2); g++; } while ((rnd(per, 2) !== rnd(A * 3.2808, 2) || bord(per, 2) || bord(Math.abs(per - B), 2)) && g < 400); return { A: A, B: B, per: per }; }, parts: [
        { id: 'e11a', sub: 'a', level: 'EMG', make: function (r, sh) {
          return nearPart({ prompt: 'Convert Store A’s price to dollars per metre, to the nearest cent.', before: t('\\$'), x: sh.per, dp: 2, unit: 'per metre', pre: t('\\$'), text: '$' + sh.A + '/ft to $/m',
            alts: [alt(sh.A * 0.3048, 'conv-direction', 'The foot is on the <b>bottom</b> of the price, so the factor needs ft on <b>top</b>: ' + t('\\dfrac{1\\text{ ft}}{0.3048\\text{ m}}') + '. (A metre is longer, so it must cost more.)')],
            sol: disp('\\dfrac{\\$' + sh.A.toFixed(2) + '}{1\\ \\cancel{\\text{ft}}}\\times\\dfrac{1\\ \\cancel{\\text{ft}}}{0.3048\\text{ m}}=\\dfrac{' + sh.A.toFixed(2) + '}{0.3048}\\ \\$/\\text{m}\\approx\\$' + fx(sh.per, 2) + '\\text{ per metre}'), hints: ['The foot is in the denominator, so the factor must have ft on top.'] });
        } },
        { id: 'e11b', sub: 'b', level: 'PRG', make: function (r, sh) {
          var cheap = sh.per > sh.B ? 'B' : 'A', d = Math.abs(sh.per - sh.B), raw = sh.B - sh.A, inv = sh.B - sh.A * 0.3048, money = function (x) { return t('\\$' + Math.abs(rnd(x, 2)).toFixed(2)); };
          var opts = [{ html: 'Store ' + cheap + ' is cheaper, by ' + money(d) + ' per metre.', right: true }, { html: 'Store ' + (cheap === 'A' ? 'B' : 'A') + ' is cheaper, by ' + money(d) + ' per metre.', why: 'Compare per metre: Store A costs about ' + money(sh.per) + '/m and Store B costs ' + money(sh.B) + '/m.' }];
          var w1 = 'Store A is cheaper, by ' + money(raw) + ' per metre.', w2 = 'Store A is cheaper, by ' + money(inv) + ' per metre.';
          if (w1 !== opts[0].html && w1 !== opts[1].html) opts.push({ html: w1, why: 'That compares a price per <b>foot</b> with a price per <b>metre</b>. Convert Store A’s price to dollars per metre first.' });
          if (w2 !== opts[0].html && w2 !== opts[1].html && w2 !== w1) opts.push({ html: w2, why: 'Store A’s per-metre price was found with the factor upside down. A metre of moulding must cost <b>more</b> than a foot of it.' });
          return mcPart(r, 'Which store is cheaper, and by how much per metre?', opts,
            'Store A: ' + t('\\$' + sh.A.toFixed(2) + '\\div 0.3048\\approx\\$' + dS(rnd(sh.per, 4)) + '') + ' per metre. Store B: ' + t('\\$' + sh.B.toFixed(2)) + ' per metre.<br>Difference ' + t('\\approx\\$' + fx(d, 2)) + ', so <b>Store ' + cheap + '</b> is cheaper by about ' + money(d) + ' per metre.', ['Put both prices in dollars per metre before comparing.'], 'compare $/ft and $/m (MC)');
        } },
        { id: 'e11c', sub: 'c', level: 'EMG', make: function (r, sh) {
          return mcPart(r, 'Before calculating, a student predicted that the price per metre would be <b>larger</b> than the price per foot. Was the prediction right, and why?', [
            { html: 'Yes — a metre is longer than a foot (' + t('1\\text{ m}\\approx 3.28\\text{ ft}') + '), so a metre of moulding is more moulding and must cost more.', right: true },
            { html: 'Yes — a metre is shorter than a foot, so you need more of them.', why: 'A metre is <b>longer</b> than a foot: about ' + t('3.28\\text{ ft}') + '.' },
            { html: 'No — metric prices are always lower.', why: 'The unit of length is what matters, not the system. Compare how long a metre and a foot are.' },
            { html: 'You can’t tell without calculating.', why: 'Comparing the sizes of the units fixes the direction before any arithmetic: which is longer, a metre or a foot?' }],
            'The prediction was right. One metre is longer than one foot, so a metre of moulding costs more than a foot of it. Had the factor been written upside down you would get about ' + t('\\$' + fx(sh.A * 0.3048, 2)) + ' per metre, and the prediction would catch the error.', ['Which is longer, a foot or a metre?'], 'predict $/m vs $/ft');
        } }] },
      { num: '12', stem: function (sh) { return 'A conveyor belt at a gravel pit moves at ' + Q(sh.S, 'feet per minute') + '.'; }, shared: function (r) { var S; do { S = r.int(30, 120); } while (bord(S * 0.018288, 2)); return { S: S, H: r.pick([7.5, 7.5, 8, 6.5, 10, 12]) }; }, parts: [
        { id: 'e12a', sub: 'a', level: 'PRG', make: function (r, sh) {
          var S = sh.S, x = S * 0.3048 * 60 / 1000;
          return nearPart({ prompt: 'Convert the speed to kilometres per hour, to the nearest hundredth. (Three unit factors are needed.)', before: t(q(S, 'ft/min') + '\\approx'), x: x, dp: 2, unit: 'km/h', text: S + ' ft/min to km/h',
            alts: [alt(S * 0.3048 / 60 / 1000, 'rate-time', 'The time factor is upside down: min is on the bottom of the rate, so use ' + t('\\dfrac{60\\text{ min}}{1\\text{ h}}') + '.'), alt(S / 0.3048 * 60 / 1000, 'conv-direction', 'The crossing factor is upside down: ft is on top, so ' + t('1\\text{ ft}') + ' goes on the bottom: ' + t('\\dfrac{0.3048\\text{ m}}{1\\text{ ft}}') + '.'), alt(S * 0.3048 * 3600 / 1000, 'conv-factor', 'An hour has ' + t('60') + ' minutes (' + t('3600') + ' is seconds).'), alt(S * 0.3048 * 60, 'stopped-early', 'That’s metres per hour. One more factor: ' + t('\\dfrac{1\\text{ km}}{1000\\text{ m}}') + '.')],
            sol: disp(chainT([[S, 'ft', 1, 'min'], [0.3048, 'm', 1, 'ft'], [1, 'km', 1000, 'm'], [60, 'min', 1, 'h']]) + '=' + dS(cl(x)) + '\\text{ km/h}\\approx ' + q(fx(x, 2), 'km/h')) + 'ft → m crosses the systems, m → km resizes, and min (on the bottom) is cancelled by a factor with min on top.', hints: ['List the three factors first: ft → m, m → km, min → h.'] });
        } },
        { id: 'e12b', sub: 'b', level: 'PRG', make: function (r, sh) {
          var S = sh.S, H = sh.H, rate = S * 0.018288, x = rate * H, al = [alt(S * H, 'no-convert', 'That’s the number of feet per minute times hours — the units don’t match. Convert the rate to km/h first.'), alt(S * 60 * H, 'stopped-early', 'That’s the distance in <b>feet</b>. Convert to kilometres.')];
          if (rnd(rnd(rate, 2) * H, 1) !== rnd(x, 1)) al.push(alt(rnd(rate, 2) * H, 'rounded-early', 'You rounded the rate before multiplying. Use the unrounded ' + t(dS(cl(rate)) + '\\text{ km/h}') + '.'));
          return nearPart({ prompt: 'The belt runs for a ' + t(dS(H) + '\\text{-hour}') + ' shift. How far does a single stone on the belt travel, in kilometres, to the nearest tenth? Use the <b>unrounded</b> rate.', x: x, dp: 1, unit: 'km', alts: al, text: S + ' ft/min for ' + H + ' h',
            sol: 'Rate: ' + t(S + '\\times 0.3048\\times 60\\div 1000=' + dS(cl(rate)) + '\\text{ km/h}') + ' (unrounded).' + disp('\\dfrac{' + dS(cl(rate)) + '\\text{ km}}{1\\ \\cancel{\\text{h}}}\\times\\dfrac{' + dS(H) + '\\ \\cancel{\\text{h}}}{1}=' + dS(cl(x)) + '\\text{ km}\\approx ' + q(fx(x, 1), 'km')), hints: ['Find the rate in km/h first (don’t round it), then multiply by the hours.'] });
        } }] },
      /* ---------- Part E: comparisons ---------- */
      { num: '13', section: 'Extra practice E — Comparisons and decisions', stem: function (sh) { return 'Which is longer, ' + ftinH(sh.F, sh.I) + ' or ' + Q(sh.X.toFixed(2), 'm') + '?'; },
        shared: function (r) { var F, I, Lm, X, g = 0; do { F = r.pick([5, 5, 6]); I = F === 6 ? r.int(0, 4) : r.int(1, 11); Lm = (12 * F + I) * 0.0254; X = rnd(Lm + r.pick([-1, 1]) * r.int(1, 4) / 100, 2); g++; } while (Math.abs(X - Lm) < 0.005 && g < 300); return { F: F, I: I, Lm: cl(Lm), X: X }; }, parts: [
        { id: 'e13a', sub: 'a', level: 'PRG', make: function (r, sh) {
          var F = sh.F, I = sh.I, inch = 12 * F + I, al = [alt(inch / 254, 'conv-direction', 'Centimetres are smaller than inches, so multiply by ' + t('2.54') + '.')];
          if (I > 0 && I <= 9) al.push(alt((F + I / 10) * 0.3048, 'ft-in-decimal', decAsInch(F, I))); if (I > 0) al.push(alt(F * 0.3048, 'forgot-part', 'Include the ' + t(I + '\\text{ in}') + ' too.'));
          return numPart({ prompt: 'Convert ' + ftinH(F, I) + ' to metres, carrying full precision (the exact value).', before: t(ftin(F, I) + '='), unit: 'm', ans: sh.Lm, alts: al, text: F + ' ft ' + I + ' in to m (exact)',
            sol: t(ftin(F, I) + '=' + inch + '\\text{ in}') + '.' + disp(chainT([[inch, 'in', null, null], [1, 'ft', 12, 'in'], [0.3048, 'm', 1, 'ft']]) + '=' + q(sh.Lm, 'm')) + 'Exactly — no rounding anywhere.', hints: ['Collapse the mixed measure to inches first.'] });
        } },
        { id: 'e13b', sub: 'b', level: 'EMG', make: function (r, sh) {
          var F = sh.F, I = sh.I, d = Math.abs(sh.X - sh.Lm) * 100, Xl = sh.X > sh.Lm, nm = function (x) { return x ? Q(sh.X.toFixed(2), 'm') : ftinH(F, I); }, cm = function (v) { return Q(fx(v, 1), 'cm'); };
          var opts = [{ html: nm(Xl) + ' is longer, by ' + cm(d) + '.', right: true }, { html: nm(!Xl) + ' is longer, by ' + cm(d) + '.', why: 'Compare the metre values: ' + ftinH(F, I) + ' ' + t('=' + dS(sh.Lm) + '\\text{ m}') + '.' }, { html: nm(Xl) + ' is longer, by ' + cm(d * 10) + '.', why: t('1\\text{ m}=100\\text{ cm}') + ': multiply the difference in metres by ' + t('100') + '.' }];
          if (I > 0 && I <= 9) { var Ld = (F + I / 10) * 0.3048, w = nm(sh.X > Ld) + ' is longer, by ' + cm(Math.abs(sh.X - Ld) * 100) + '.'; if (opts.every(function (o) { return o.html !== w; })) opts.push({ html: w, why: decAsInch(F, I) }); }
          if (opts.length < 4) opts.push({ html: 'They are the same length to the nearest centimetre.', why: 'Find the difference: ' + t(dS(sh.X) + '-' + dS(sh.Lm)) + '. It is more than half a centimetre.' });
          return mcPart(r, 'Which is longer, and by how much? (nearest tenth of a centimetre)', opts,
            ftinH(F, I) + ' ' + t('=' + dS(sh.Lm) + '\\text{ m}') + '. Difference: ' + t('|' + sh.X.toFixed(2) + '-' + dS(sh.Lm) + '|=' + dS(rnd(Math.abs(sh.X - sh.Lm), 4)) + '\\text{ m}=' + dS(rnd(d, 2)) + '\\text{ cm}') + ', so ' + nm(Xl) + ' is longer by about ' + cm(d) + '.', ['Put both in metres, subtract, then change the difference to centimetres.'], 'compare ' + F + "'" + I + '" with ' + sh.X + ' m (MC)');
        } }] },
      { num: '14', stem: function (sh) { return 'One trailhead sign gives a loop as ' + Q(sh.K.toFixed(1), 'km') + '; an older sign on the same loop gives it as ' + Q(sh.M.toFixed(1), 'mi') + '. Use the booklet’s factor ' + t('1\\text{ mi}=1.6093\\text{ km}') + '.'; },
        shared: function (r) { var M, K2, conv, g = 0; do { M = r.int(30, 120) / 10; conv = M * 1.6093; K2 = rnd(rnd(conv, 1) + r.pick([-0.1, 0, 0.1]), 1); g++; } while ((Math.abs(K2 - conv) < 0.015 || Math.abs(K2 - conv) > 0.09 || bord(Math.abs(K2 - conv) * 1000, 1) || Number.isInteger(M)) && g < 500); return { M: M, K: K2, conv: conv }; }, parts: [
        { id: 'e14a', sub: 'a', level: 'PRG', make: function (r, sh) {
          var d = Math.abs(sh.K - sh.conv) * 1000, al = [alt(d / 1000, 'prefix-places', 'That’s the difference in kilometres. Give it in <b>metres</b> (' + t('\\times 1000') + ').')], ex = Math.abs(sh.K - sh.M * 1.609344) * 1000;
          if (rnd(ex, 1) !== rnd(d, 1)) al.push(alt(ex, 'conv-factor', 'Use the booklet’s factor ' + t('1\\text{ mi}=1.6093\\text{ km}') + ' for this one.'));
          return nearPart({ prompt: 'By how many <b>metres</b> do the two signs differ? (nearest tenth)', x: d, dp: 1, unit: 'm', alts: al, text: sh.M + ' mi vs ' + sh.K + ' km',
            sol: disp(chainT([[sh.M.toFixed(1), 'mi', null, null], [1.6093, 'km', 1, 'mi']]) + '=' + q(cl(sh.conv), 'km')) + t('|' + sh.K.toFixed(1) + '-' + dS(cl(sh.conv)) + '|=' + dS(rnd(d / 1000, 6)) + '\\text{ km}=' + dS(rnd(d, 3)) + '\\text{ m}\\approx ' + q(fx(d, 1), 'm')) + '.', hints: ['Convert the miles to kilometres, subtract, then change km to m.'] });
        } },
        { id: 'e14a2', sub: 'a (which)', level: 'BEG', make: function (r, sh) {
          var newer = sh.K > sh.conv;
          return mcPart(r, 'Which sign claims the longer loop?', [{ html: 'The newer sign (' + Q(sh.K.toFixed(1), 'km') + ')', right: newer, why: newer ? null : 'Convert the older sign: ' + t(sh.M.toFixed(1) + '\\times 1.6093') + ' km. Compare that with ' + Q(sh.K.toFixed(1), 'km') + '.' }, { html: 'The older sign (' + Q(sh.M.toFixed(1), 'mi') + ')', right: !newer, why: newer ? 'Convert the older sign: ' + t(sh.M.toFixed(1) + '\\times 1.6093') + ' km. Compare that with ' + Q(sh.K.toFixed(1), 'km') + '.' : null }],
            Q(sh.M.toFixed(1), 'mi') + ' ' + t('=' + dS(cl(sh.conv)) + '\\text{ km}') + ', which is ' + (newer ? 'less' : 'more') + ' than ' + Q(sh.K.toFixed(1), 'km') + ', so the ' + (newer ? 'newer' : 'older') + ' sign claims the longer loop.', ['Put both distances in kilometres.'], 'which sign longer', true);
        } },
        { id: 'e14b', sub: 'b', level: 'EMG', make: function (r, sh) {
          return mcPart(r, 'The difference is small. Which is a reason the two signs might disagree that has nothing to do with a conversion error?', [
            { html: 'Both values are rounded, each in its own unit: ' + Q(sh.M.toFixed(1), 'mi') + ' could be anywhere from ' + t((sh.M - 0.05).toFixed(2)) + ' to ' + t((sh.M + 0.05).toFixed(2) + '\\text{ mi}') + ' — a window about ' + t('161\\text{ m}') + ' wide.', right: true },
            { html: 'Miles and kilometres measure different things.', why: 'Both measure length — they are just different-sized units.' },
            { html: 'The factor ' + t('1.6093') + ' is wrong.', why: 'It is rounded, but the rounding causes only about ' + t('4.4\\text{ cm}') + ' per mile — much less than the difference.' },
            { html: 'One of the sign makers must have divided instead of multiplying.', why: 'The question asks for a reason that is <b>not</b> a conversion error. A multiply/divide slip would also give a far bigger difference.' }],
            'Each sign is rounded to the nearest tenth of its own unit. A tenth of a mile is about ' + t('161\\text{ m}') + ' and a tenth of a kilometre is ' + t('100\\text{ m}') + ', so a difference of a few tens of metres fits both signs describing the same loop. (A re-routed section would also explain it.)', ['How precise is a distance given to one decimal place?'], 'why the signs disagree');
        } }] },
      { num: '15', stem: function (sh) { return 'A garden plan drawn in metres calls for ' + Q(sh.T, 'm') + ' of wooden edging in total. The lumberyard sells that edging <b>only</b> in ' + t(sh.B + '\\text{-foot}') + ' boards. (' + t('1\\text{ ft}=0.3048\\text{ m}') + ')'; },
        shared: function (r) { var B, T, qn, fr, g = 0; do { B = r.pick([8, 10, 12, 12, 16]); T = r.int(100, 400) / 10; qn = T / (B * 0.3048); fr = qn - Math.floor(qn); g++; } while ((fr < 0.15 || fr > 0.85 || bord(qn, 2)) && g < 500); return { B: B, T: T, qn: qn, n: Math.ceil(qn), board: cl(B * 0.3048) }; }, parts: [
        { id: 'e15a', sub: 'a', level: 'ADV', make: function (r, sh) {
          var qn = sh.qn, n = sh.n, fr = qn - Math.floor(qn);
          var bAlts = [alt(Math.floor(qn), 'round-up', t(Math.floor(qn)) + ' boards give only ' + t(dS(cl(Math.floor(qn) * sh.board)) + '\\text{ m}') + ' — not enough. Part of a board still means buying a whole board: round <b>up</b>.')];
          return { prompt: 'Convert one board to metres, then find how many boards the plan needs: give the unrounded quotient (two decimal places) and the number of boards to buy.', input: { type: 'fields', fields: [{ name: 'Quotient', label: 'Quotient', before: t('\\approx'), after: 'boards' }, { name: 'Buy', label: 'Buy', after: 'boards' }] },
            check: K.fields([wrapUnit(K.near(qn, 2, { alts: [alt(sh.T / sh.B, 'no-convert', 'You divided metres by feet. Change one board to metres first (' + t(sh.B + '\\times 0.3048') + ').'), alt(sh.T * 0.3048 / sh.B, 'conv-direction', 'Check the board conversion: ' + t(sh.B + '\\text{ ft}=' + sh.B + '\\times 0.3048\\text{ m}') + '.')] })), exactCheck(n, { alts: bAlts, places: false })], { labels: ['Quotient', 'Buy'] }),
            key: [rnd(qn, 2).toFixed(2), String(n)], answer: t('\\approx ' + fx(qn, 2)) + '; buy ' + t(n) + ' boards',
            solution: 'One board: ' + t(sh.B + '\\times 0.3048=' + dS(sh.board) + '\\text{ m}') + ' exactly.<br>' + t(dS(sh.T) + '\\div ' + dS(sh.board) + '=' + dS(rnd(qn, 5)) + '\\ldots') + ' boards. Buy <b>' + n + '</b>: ' + Math.floor(qn) + ' boards are not enough, and the lumberyard doesn’t sell part of a board, so the count is rounded <b>up</b> no matter how small the decimal part is.',
            hints: ['Change one board to metres, then divide the total by one board.', 'You can’t buy part of a board.'], text: sh.T + ' m in ' + sh.B + '-ft boards' };
        } },
        { id: 'e15b', sub: 'b', level: 'EMG', make: function (r, sh) {
          var left = sh.n * sh.board - sh.T, al = [];
          if (rnd(sh.n * 3.66 - sh.T, 2) !== rnd(left, 2)) al.push(alt(sh.n * rnd(sh.board, 2) - sh.T, 'rounded-early', 'Use the exact board length ' + t(dS(sh.board) + '\\text{ m}') + ', not a rounded one.'));
          return nearPart({ prompt: 'The plan needs ' + t(sh.n) + ' boards. How much edging is left over, in metres to the nearest hundredth?', x: left, dp: 2, unit: 'm', alts: al.concat([alt(sh.n * sh.B - sh.T, 'no-convert', 'The boards are measured in feet: change the total bought to metres before subtracting.')]), text: 'leftover ' + sh.n + ' boards',
            sol: 'Bought: ' + t(sh.n + '\\times ' + dS(sh.board) + '=' + dS(cl(sh.n * sh.board)) + '\\text{ m}') + '. Used: ' + Q(sh.T, 'm') + '.<br>Left over: ' + t(dS(cl(sh.n * sh.board)) + '-' + dS(sh.T) + '=' + dS(cl(left)) + '\\approx ' + q(fx(left, 2), 'm')) + '.', hints: ['Find the total length bought in metres, then subtract what the plan uses.'] });
        } },
        { id: 'e15b2', sub: 'b (%)', level: 'EMG', make: function (r, sh) {
          var left = sh.n * sh.board - sh.T, pc = left / sh.board * 100, fr = sh.qn - Math.floor(sh.qn);
          return nearPart({ prompt: 'The leftover edging is ' + Q(fx(left, 2), 'm') + ' (unrounded ' + t(dS(rnd(left, 4))) + ' m). What percentage of one board (' + Q(dS(sh.board), 'm') + ') is that, to the nearest whole percent?', x: pc, dp: 0, unit: '%', text: 'leftover as % of a board',
            alts: [alt(left / sh.T * 100, 'percent-base', 'That’s a percentage of the whole plan. The question asks for a percentage of <b>one board</b>.'), alt(fr * 100, 'percent-base', 'That’s the part of the last board that gets <b>used</b>. The leftover is the rest of that board.')],
            sol: t('\\dfrac{' + dS(rnd(left, 4)) + '}{' + dS(sh.board) + '}\\times 100=' + dS(rnd(pc, 2)) + '\\ldots\\approx ' + rnd(pc, 0) + '\\%') + ' of a board. (Check: the quotient’s decimal part was ' + t(dS(rnd(fr, 4))) + ', and ' + t('1-' + dS(rnd(fr, 4)) + '=' + dS(rnd(1 - fr, 4))) + '.)', hints: ['Divide the leftover by the length of one board.'] });
        } },
        { id: 'e15c', sub: 'c', level: 'PRG', make: function (r, sh) {
          return mcPart(r, 'Part (a) assumed offcuts may be joined end to end. If instead each straight run of the border had to be one uncut piece, is ' + t(sh.n) + ' boards a lower bound, an upper bound, or neither?', [
            { html: 'A lower bound — joining offcuts is the most efficient use of the lumber, so forbidding it can only waste more, never less.', right: true },
            { html: 'An upper bound — uncut pieces are stronger, so fewer boards are needed.', why: 'Strength isn’t the question. Without joining, leftover pieces can be stranded, so you can only need the <b>same or more</b> boards.' },
            { html: 'Exactly ' + t(sh.n) + ' boards — the total length is still ' + Q(sh.T, 'm') + '.', why: 'The total is the same, but a short offcut can’t always be used for another run, so more boards may be needed.' },
            { html: 'Neither — it could be more or fewer.', why: 'Could it ever take <b>fewer</b> boards than the most efficient plan (joining offcuts)?' }],
            'It is still a <b>lower bound</b>: with joining allowed, every offcut can go wherever it fits. Forbidding that can only waste more wood, so the requirement becomes ' + t(sh.n) + ' boards <b>or more</b>, depending on the individual run lengths.', ['Which plan uses the lumber most efficiently?'], 'lower or upper bound');
        } }] },
      /* ---------- Part F: error analysis ---------- */
      { num: '16', section: 'Extra practice F — Error analysis', stem: function (sh) { return 'Asked to convert ' + Q(sh.v, 'mm') + ' to kilometres, a student wrote' + disp('\\dfrac{' + dT(sh.v) + '\\text{ mm}}{1}\\times\\dfrac{1000\\text{ mm}}{1\\text{ m}}\\times\\dfrac{1000\\text{ m}}{1\\text{ km}}=' + q(cl(sh.v * 1e6), 'km')); },
        shared: function (r) { var v; do { v = r.int(11, 99) * 100; } while (v % 1000 === 0); return { v: v }; }, parts: [
        { id: 'e16a', sub: 'a', level: 'EMG', make: function (r, sh) {
          return mcPart(r, 'Both factors are upside down. What unit does the student’s product actually carry?', [
            { html: t('\\dfrac{\\text{mm}^2}{\\text{km}}') + ' — not a length at all', right: true },
            { html: t('\\text{km}'), why: 'km is on the <b>bottom</b> of the last factor, so it can’t be left on top. The student wrote km out of habit.' },
            { html: t('\\text{mm}'), why: 'mm is on top in the given amount <b>and</b> in factor 1, so they multiply: mm × mm.' },
            { html: t('\\text{m}'), why: 'The m in factor 1 (bottom) cancels the m in factor 2 (top), so no m is left.' }],
            'mm is on top in the given amount and in factor 1, so they multiply. The m’s cancel, and km is left on the <b>bottom</b>: ' + t('\\dfrac{\\text{mm}\\times\\text{mm}}{\\text{km}}=\\dfrac{\\text{mm}^2}{\\text{km}}') + '.', ['Mark where each unit sits — top or bottom — and cancel only top-against-bottom pairs.'], 'unit of upside-down chain mm→km');
        } },
        { id: 'e16b', sub: 'b', level: 'EMG', make: function (r, sh) { var p = metricPart(sh.v, 'mm', 'km', 'chain'); p.prompt = 'Give the correct answer.'; return p; } },
        { id: 'e16c', sub: 'c', level: 'EMG', make: function (r, sh) {
          return mcPart(r, 'The student’s answer, ' + t(K.sciTex(cl(sh.v * 1e6)) + '\\text{ km}') + ', is about the distance from the Sun to Neptune. Which reasonableness check rules it out instantly?', [
            { html: 'A kilometre is a million times longer than a millimetre, so the number of km must be far <b>smaller</b> than ' + t(dT(sh.v)) + ' — not bigger.', right: true },
            { html: 'Re-do the multiplication ' + t(dT(sh.v) + '\\times 1000\\times 1000') + ' to check it.', why: 'The multiplication is actually correct! Re-checking the arithmetic only confirms the wrong quantity. Compare the sizes of the units.' },
            { html: 'Answers in km should always be less than ' + t('1') + '.', why: 'Not true in general: a road trip can be hundreds of km. The check is about the <b>relative size</b> of the two units.' },
            { html: 'A millimetre is bigger than a kilometre, so the number should shrink.', why: 'A millimetre is much <b>smaller</b> than a kilometre.' }],
            'A km is ' + t('10^{6}') + ' times longer than a mm, so the same length is a far smaller number of km than of mm. The answer had to be well below ' + t(dT(sh.v)) + '. This beats re-reading the arithmetic, because the arithmetic was never wrong — only the set-up was.', ['Which unit is bigger? So should the number get bigger or smaller?'], 'reasonableness check mm→km');
        } }] },
      { num: '17', stem: function (sh) { return 'Asked to convert ' + Q(sh.v, 'm') + ' to millimetres, a student reasoned: “metres to millimetres is three places on the number line,” moved the decimal three places, and wrote ' + Q(cl(sh.v / 1000), 'mm') + '.'; },
        shared: function (r) { var v; do { v = r.int(11, 99); } while (v % 10 === 0); return { v: cl(v / 100) }; }, parts: [
        { id: 'e17a', sub: 'a', level: 'BEG', make: function (r, sh) {
          return mcPart(r, 'The student’s count of three places was right. What was wrong?', [
            { html: 'The <b>direction</b>: millimetres are smaller, so the number must get bigger — the decimal moves right, not left.', right: true },
            { html: 'It should have been two places, not three.', why: 'Two places is m → cm. From m to mm is three places — the count was right.' },
            { html: 'It should have been six places.', why: 'Milli is ' + t('10^{-3}') + ': three places. Six would be micro.' },
            { html: 'Nothing — the answer is correct.', why: 'A millimetre is smaller than a metre, so there must be <b>more</b> millimetres than metres. ' + Q(cl(sh.v / 1000), 'mm') + ' is far too small.' }],
            'The count was right; the direction was wrong. A millimetre is smaller than a metre, so the number of millimetres is bigger: move the decimal three places to the <b>right</b>. ' + t(q(sh.v, 'm') + '=' + q(cl(sh.v * 1000), 'mm')) + '.', ['Is a millimetre bigger or smaller than a metre?'], 'what was wrong m→mm');
        } },
        { id: 'e17a2', sub: 'a (answer)', level: 'BEG', make: function (r, sh) { var p = metricPart(sh.v, 'm', 'mm', 'line'); p.prompt = 'Give the correct answer.'; return p; } },
        { id: 'e17b', sub: 'b', level: 'BEG', make: function (r, sh) {
          return mcPart(r, 'Which unit factor converts ' + Q(sh.v, 'm') + ' to millimetres, making the direction impossible to get wrong?', [
            { html: t('\\dfrac{1000\\text{ mm}}{1\\text{ m}}'), right: true },
            { html: t('\\dfrac{1\\text{ m}}{1000\\text{ mm}}'), why: 'With m on top, the metres can’t cancel. The unwanted unit (m) must be on the bottom.' },
            { html: t('\\dfrac{100\\text{ mm}}{1\\text{ m}}'), why: 'There are ' + t('1000') + ' mm in a metre (' + t('100') + ' is centimetres).' },
            { html: t('\\dfrac{1000\\text{ m}}{1\\text{ mm}}'), why: 'That says a millimetre is ' + t('1000') + ' metres — the fact is backwards.' }],
            t('\\dfrac{' + dT(sh.v) + '\\ \\cancel{\\text{m}}}{1}\\times\\dfrac{1000\\text{ mm}}{1\\ \\cancel{\\text{m}}}=' + q(cl(sh.v * 1000), 'mm')) + '. Because m must sit on the bottom to cancel, ' + t('1000\\text{ mm}') + ' is forced to the top — the only arithmetic left is multiplying by ' + t('1000') + '.', ['The unit you are getting rid of goes on the bottom.'], 'unit factor m→mm');
        } },
        { id: 'e17c', sub: 'c', level: 'EMG', make: function (r, sh) {
          return mcPart(r, 'How does the student’s answer, ' + Q(cl(sh.v / 1000), 'mm') + ', compare with the correct answer, ' + Q(cl(sh.v * 1000), 'mm') + '?', [
            { html: 'It is one <b>millionth</b> of the correct answer (' + t('10^{-6}') + ' times).', right: true },
            { html: 'It is one thousandth of the correct answer.', why: 'Moving three places the wrong way is three places too far left of where you started <b>and</b> three short of where you should be: six places in all.' },
            { html: 'It is ' + t('1000') + ' times the correct answer.', why: 'The student’s number is <b>smaller</b> than the correct one.' },
            { html: 'It is one hundredth of the correct answer.', why: 'Compare ' + t(dS(cl(sh.v / 1000))) + ' with ' + t(dT(cl(sh.v * 1000))) + ' — count the places between them.' }],
            t('\\dfrac{' + dS(cl(sh.v / 1000)) + '}{' + dT(cl(sh.v * 1000)) + '}=10^{-6}') + ': one millionth. Moving three places the wrong way misses by six places in total. The check: a smaller unit always gives a bigger number.', ['Divide the student’s answer by the correct one.'], 'ratio of wrong to right');
        } }] },
      { num: '18', stem: function (sh) { return 'Asked to convert ' + ftinH(sh.F, sh.I) + ' to metres, a student wrote ' + t(ftin(sh.F, sh.I) + '=' + sh.F + '.' + sh.I + '\\text{ ft}') + ', then ' + t(sh.F + '.' + sh.I + '\\times 0.3048=' + dS(cl(sh.s))) + ', and reported ' + Q(fx(sh.s, 3), 'm') + '.'; },
        shared: function (r) { var F = r.int(4, 6), I = r.int(4, 9); return { F: F, I: I, s: (F + I / 10) * 0.3048, c: cl((12 * F + I) * 0.0254) }; }, parts: [
        { id: 'e18a', sub: 'a', level: 'EMG', make: function (r, sh) {
          return mcPart(r, 'The second step is flawless. What is the error in the first step?', [
            { html: 'The inches were written as a decimal of a foot. A foot has ' + t('12') + ' inches, not ' + t('10') + ', so ' + t(sh.I + '\\text{ in}=\\tfrac{' + sh.I + '}{12}\\text{ ft}') + ', not ' + t('0.' + sh.I + '\\text{ ft}') + '.', right: true },
            { html: 'The student should have multiplied by ' + t('2.54') + ' instead of ' + t('0.3048') + '.', why: t('0.3048') + ' is the right factor for feet — the problem is that ' + t(sh.F + '.' + sh.I + '\\text{ ft}') + ' isn’t the right number of feet.' },
            { html: 'The student should have divided by ' + t('0.3048') + '.', why: 'A metre is longer than a foot, so multiplying by ' + t('0.3048') + ' is correct. The error is earlier.' },
            { html: 'The student rounded too early.', why: 'Nothing was rounded until the end. Look at how the inches became a decimal.' }],
            'A foot holds ' + t('12') + ' inches, not ' + t('10') + ', so ' + t(ftin(sh.F, sh.I) + '=' + sh.F + '\\tfrac{' + sh.I + '}{12}\\text{ ft}') + ', never ' + t(sh.F + '.' + sh.I + '\\text{ ft}') + '. Writing “' + sh.F + ' ft ' + sh.I + ' in” as “' + sh.F + '.' + sh.I + '” copies the digits instead of converting them.', ['How many inches are in a foot? How many tenths?'], 'error: ' + sh.F + ' ft ' + sh.I + ' in as ' + sh.F + '.' + sh.I + ' ft');
        } },
        { id: 'e18a2', sub: 'a (length)', level: 'EMG', make: function (r, sh) {
          var inch = cl(sh.I * 1.2);
          return { prompt: 'What length is “' + t(sh.F + '.' + sh.I + '\\text{ ft}') + '” really, in feet and inches? (The inches may be a decimal.)', input: { type: 'fields', fields: [{ name: 'Feet', after: 'ft' }, { name: 'Inches', after: 'in' }] },
            check: K.fields([exactCheck(sh.F, { places: false }), exactCheck(inch, { places: false, alts: [alt(sh.I, 'dec-remainder', t('0.' + sh.I + '\\text{ ft}') + ' is ' + sh.I + ' <b>tenths</b> of a foot, not ' + sh.I + ' inches. Multiply ' + t('0.' + sh.I) + ' by ' + t('12') + '.')] })], { labels: ['Feet', 'Inches'] }),
            key: [String(sh.F), dS(inch)], answer: t(sh.F + '\\text{ ft }' + dS(inch) + '\\text{ in}'),
            solution: t('0.' + sh.I + '\\times 12=' + dS(inch)) + ', so ' + t(sh.F + '.' + sh.I + '\\text{ ft}=' + sh.F + '\\text{ ft }' + dS(inch) + '\\text{ in}') + ' — a different measurement, ' + t(dS(cl(inch - sh.I)) + '\\text{ in}') + ' longer than the one given.', hints: ['Multiply the decimal part of a foot by ' + t('12') + ' to get inches.'], text: sh.F + '.' + sh.I + ' ft in ft and in' };
        } },
        { id: 'e18b', sub: 'b', level: 'PRG', make: function (r, sh) { return ftinToM('Give the correct conversion of ' + ftinH(sh.F, sh.I) + ' to metres, to the nearest thousandth.', sh.F, sh.I, 3, t(ftin(sh.F, sh.I) + '\\approx')); } },
        { id: 'e18b2', sub: 'b (error)', level: 'PRG', make: function (r, sh) {
          var e = (sh.s - sh.c) * 100;
          return nearPart({ prompt: 'The student got ' + t(dS(cl(sh.s)) + '\\text{ m}') + '; the correct value is ' + t(dS(sh.c) + '\\text{ m}') + '. How big is the student’s error, in centimetres, to the nearest tenth?', x: e, dp: 1, unit: 'cm', text: 'size of the decimal-feet error',
            alts: [alt(e / 100, 'prefix-places', 'That’s the error in metres. Give it in centimetres (' + t('\\times 100') + ').'), alt(e * 10, 'prefix-places', 'That’s millimetres. Give it in centimetres.')],
            sol: t(dS(cl(sh.s)) + '-' + dS(sh.c) + '=' + dS(rnd(e / 100, 6)) + '\\text{ m}=' + dS(rnd(e, 4)) + '\\text{ cm}\\approx ' + q(fx(e, 1), 'cm')) + '. The student’s figure is too <b>large</b>, because ' + t(sh.F + '.' + sh.I + '\\text{ ft}') + ' is longer than ' + ftinH(sh.F, sh.I) + '.', hints: ['Subtract, then change metres to centimetres.'] });
        } },
        { id: 'e18c', sub: 'c', level: 'PRG', make: function (r, sh) {
          var X = rnd((sh.s + sh.c) / 2, 2); if (!(X > sh.c + 0.002 && X < sh.s - 0.002)) X = rnd((sh.s + sh.c) / 2, 3);
          return mcPart(r, 'Suppose this student also had to decide which is longer, ' + ftinH(sh.F, sh.I) + ' or ' + Q(dS(X), 'm') + '. What would they conclude, and what does it show?', [
            { html: 'That ' + ftinH(sh.F, sh.I) + ' is longer — the <b>opposite</b> of the truth. An error this small looks perfectly reasonable, so only a correct method (change to inches first) prevents it.', right: true },
            { html: 'That ' + Q(dS(X), 'm') + ' is longer — the error is too small to change anything.', why: 'Compare: the student’s ' + t(dS(rnd(sh.s, 3))) + ' m is <b>more</b> than ' + t(dS(X)) + ' m, but the true ' + t(dS(rnd(sh.c, 3))) + ' m is less.' },
            { html: 'The student would notice the mistake because ' + t(dS(rnd(sh.s, 3)) + '\\text{ m}') + ' is an unreasonable height.', why: 'Both ' + t(dS(rnd(sh.c, 3))) + ' m and ' + t(dS(rnd(sh.s, 3))) + ' m are believable. No benchmark catches an error this small.' },
            { html: 'That the two are exactly equal.', why: 'Compare the student’s value, ' + t(dS(rnd(sh.s, 3)) + '\\text{ m}') + ', with ' + Q(dS(X), 'm') + '.' }],
            'True value ' + t(dS(rnd(sh.c, 3)) + '\\text{ m}<' + dS(X) + '\\text{ m}') + ', but the student’s ' + t(dS(rnd(sh.s, 3)) + '\\text{ m}>' + dS(X) + '\\text{ m}') + ', so they would pick the wrong one. The error is only a few centimetres — too small to look suspicious — which is why collapsing to inches first matters.', ['Compare ' + Q(dS(X), 'm') + ' with the student’s value and with the true value.'], 'consequence of the decimal-feet error');
        } }] },
      /* ---------- Part G: stretch ---------- */
      { num: '19', section: 'Extra practice G — Stretch: one chain, two systems, and a rate', stem: function (sh) { return 'A crew lays pipeline at a steady ' + Q(sh.R, 'feet per hour') + '. The pipeline is ' + Q(sh.L, 'km') + ' long. Use only ' + t('1\\text{ ft}=0.3048\\text{ m}') + ', ' + t('1\\text{ ft}=12\\text{ in}') + ', ' + t('1\\text{ yd}=3\\text{ ft}') + ' and ' + t('1\\text{ km}=1000\\text{ m}') + '.'; },
        shared: function (r) { var R, L, h, g = 0; do { R = r.int(250, 600); L = r.int(50, 250) / 10; h = L / (R * 0.0003048); g++; } while ((bord(h, 1) || bord(h - 24 * Math.floor(h / 24), 0) || Math.round(h) % 24 === 0) && g < 500); return { R: R, L: L, h: h, rate: cl(R * 0.0003048) }; }, parts: [
        { id: 'e19a', sub: 'a', level: 'EMG', make: function (r) {
          var P = r.pick([{ f: '1 km', to: 'ft', x: 1000 / 0.3048, ch: [[1, 'km', null, null], [1000, 'm', 1, 'km'], [1, 'ft', 0.3048, 'm']], w: 0.3048 * 1000 }, { f: '1 km', to: 'ft', x: 1000 / 0.3048, ch: [[1, 'km', null, null], [1000, 'm', 1, 'km'], [1, 'ft', 0.3048, 'm']], w: 0.3048 * 1000 }, { f: '1 m', to: 'ft', x: 1 / 0.3048, ch: [[1, 'm', null, null], [1, 'ft', 0.3048, 'm']], w: 0.3048 }, { f: '1 km', to: 'yd', x: 1000 / 0.3048 / 3, ch: [[1, 'km', null, null], [1000, 'm', 1, 'km'], [1, 'ft', 0.3048, 'm'], [1, 'yd', 3, 'ft']], w: 0.3048 * 1000 / 3 }, { f: '1 m', to: 'in', x: 12 / 0.3048, ch: [[1, 'm', null, null], [1, 'ft', 0.3048, 'm'], [12, 'in', 1, 'ft']], w: 0.3048 / 12 }]);
          var ft = P.f.replace(' ', '\\text{ ') + '}';
          return nearPart({ prompt: 'Build the factor ' + t(ft + '=?\\text{ ' + P.to + '}') + ', to four decimal places.', before: t(ft + '\\approx'), x: P.x, dp: 4, unit: P.to, text: 'build ' + P.f + ' in ' + P.to,
            alts: [alt(P.w, 'conv-direction', 'The ' + t('0.3048') + ' factor is upside down: metres must cancel, so ' + t('0.3048\\text{ m}') + ' goes on the bottom.')],
            sol: disp(chainT(P.ch) + '=' + dS(rnd(P.x, 7)) + '\\ldots\\approx ' + q(fx(P.x, 4), P.to)), hints: ['Chain the facts so every unit except ' + P.to + ' cancels.'] });
        } },
        { id: 'e19b', sub: 'b', level: 'EMG', make: function (r, sh) {
          return numPart({ prompt: 'Convert the crew’s rate to kilometres per hour. Give the <b>exact</b> value.', before: t(q(sh.R, 'ft/h') + '='), unit: 'km/h', ans: sh.rate, text: sh.R + ' ft/h to km/h (exact)',
            alts: [alt(sh.R / 0.3048 / 1000, 'conv-direction', 'The crossing factor is upside down: ft is on top of the rate, so ' + t('1\\text{ ft}') + ' goes on the bottom: ' + t('\\dfrac{0.3048\\text{ m}}{1\\text{ ft}}') + '.')],
            placesHint: function (j) { return j === 3 ? 'That’s metres per hour. One more factor: ' + t('\\dfrac{1\\text{ km}}{1000\\text{ m}}') + '.' : placesDefault(j); },
            sol: disp(chainT([[sh.R, 'ft', 1, 'h'], [0.3048, 'm', 1, 'ft'], [1, 'km', 1000, 'm']]) + '=' + q(sh.rate, 'km/h')) + 'Only the numerator unit changes; h stays on the bottom. Exact — nothing has been rounded.', hints: ['ft → m → km on top; the hours stay.'] });
        } },
        { id: 'e19c', sub: 'c', level: 'ADV', make: function (r, sh) {
          var al = [alt(sh.L * sh.rate, 'rate-flip', 'You multiplied by the rate. To get hours, km must cancel, so the rate goes in upside down: ' + t('\\dfrac{1\\text{ h}}{' + dS(sh.rate) + '\\text{ km}}') + '.'), alt(sh.L / sh.R, 'no-convert', 'You divided kilometres by feet per hour — the units don’t cancel. Convert the rate to km/h first.')];
          [2, 3].forEach(function (k) { var v = sh.L / rnd(sh.rate, k); if (rnd(v, 1) !== rnd(sh.h, 1)) al.push(alt(v, 'rounded-early', 'You rounded the rate before dividing. Use the exact ' + t(dS(sh.rate) + '\\text{ km/h}') + '.')); });
          return nearPart({ prompt: 'How many hours will the job take, to the nearest tenth? (Round only at the end.)', x: sh.h, dp: 1, unit: 'h', alts: al, text: sh.L + ' km at ' + sh.R + ' ft/h',
            sol: 'Rate in km/h: ' + t(sh.R + '\\times 0.3048\\div 1000=' + dS(sh.rate) + '\\text{ km/h}') + ' (exact).' + disp('\\dfrac{' + dT(sh.L) + '\\ \\cancel{\\text{km}}}{1}\\times\\dfrac{1\\text{ h}}{' + dS(sh.rate) + '\\ \\cancel{\\text{km}}}=' + dS(rnd(sh.h, 5)) + '\\ldots\\text{ h}\\approx ' + q(fx(sh.h, 1), 'h')) + 'The rate is used <b>inverted</b>, because km had to cancel.', hints: ['Change the rate to km/h first (ft → m → km), without rounding.', 'time = distance ÷ rate: write the rate so km cancels.'] });
        } },
        { id: 'e19c2', sub: 'c (days)', level: 'EMG', make: function (r, sh) {
          var tot = Math.round(sh.h), w = decomp(tot, DH);
          return mixedPart({ prompt: 'The job takes about ' + Q(dS(rnd(sh.h, 2)), 'h') + '. Express the time in <b>days and hours</b>, to the nearest hour.', total: tot, U: DH, exact: sh.h, text: dS(rnd(sh.h, 2)) + ' h to days and hours',
            sol: t(dS(rnd(sh.h, 2)) + '\\div 24') + ' gives ' + t(w[0]) + ' whole days, leaving ' + t(dS(rnd(sh.h - 24 * w[0], 2)) + '\\text{ h}\\approx ' + w[1] + '\\text{ h}') + '.<br>So about ' + t(w[0] + '\\text{ days }' + w[1] + '\\text{ h}') + '.', hints: ['Take out the whole days (' + t('24\\text{ h}') + ' each); the leftover is hours.'] });
        } },
        { id: 'e19d', sub: 'd', level: 'PRG', make: function (r, sh) {
          var L = sh.L, R = sh.R, c = function (fs) { return t(chainT(fs)); };
          return mcPart(r, 'Which single unit-factor chain, starting from ' + Q(L, 'km') + ', gives the time in hours?', [
            { html: c([[L, 'km', null, null], [1000, 'm', 1, 'km'], [1, 'ft', 0.3048, 'm'], [1, 'h', R, 'ft']]), right: true },
            { html: c([[L, 'km', null, null], [1000, 'm', 1, 'km'], [1, 'ft', 0.3048, 'm'], [R, 'ft', 1, 'h']]), why: 'The rate is the wrong way up: ft is already on top, so the rate must have ft on the bottom — and that puts h on top.' },
            { html: c([[L, 'km', null, null], [1000, 'm', 1, 'km'], [0.3048, 'm', 1, 'ft'], [1, 'h', R, 'ft']]), why: 'The crossing factor is upside down: m is on top, so ' + t('0.3048\\text{ m}') + ' must go on the bottom.' },
            { html: c([[L, 'km', null, null], [1, 'km', 1000, 'm'], [1, 'ft', 0.3048, 'm'], [1, 'h', R, 'ft']]), why: 'The first factor doesn’t cancel km: km is on top in both. Use ' + t('\\dfrac{1000\\text{ m}}{1\\text{ km}}') + '.' }],
            disp(chainT([[L, 'km', null, null], [1000, 'm', 1, 'km'], [1, 'ft', 0.3048, 'm'], [1, 'h', R, 'ft']]) + '\\approx ' + q(fx(sh.h, 1), 'h')) + 'km, m and ft all cancel; only h survives. Same answer as before, with nothing rounded part-way.', ['Check each factor: does the unit it should cancel sit on the opposite side?'], 'single chain km → h');
        } },
        { id: 'e19e', sub: 'e', level: 'EMG', make: function (r, sh) {
          return mcPart(r, 'In the single chain, the rate ' + Q(sh.R, 'ft/h') + ' appears as a unit factor. Which way up must it be written, and why?', [
            { html: t('\\dfrac{1\\text{ h}}{' + sh.R + '\\text{ ft}}') + ' — by then the chain has feet on top, so ft must be on the bottom to cancel, leaving hours.', right: true },
            { html: t('\\dfrac{' + sh.R + '\\text{ ft}}{1\\text{ h}}') + ' — a rate is always written the way it is quoted.', why: 'A rate is a conversion factor and can be written either way up. The unit that needs cancelling decides.' },
            { html: t('\\dfrac{' + sh.R + '\\text{ ft}}{1\\text{ h}}') + ' — the hours must be on the bottom because we want hours.', why: 'If hours are on the bottom, the answer would be in “per hour”. Hours must end up on <b>top</b>.' },
            { html: 'Either way — the number is the same.', why: 'The numbers are the same, but only one orientation makes ft cancel and leaves hours.' }],
            'The rate goes in as ' + t('\\dfrac{1\\text{ h}}{' + sh.R + '\\text{ ft}}') + ' — inverted from how it was quoted — because feet are on top at that point in the chain. <b>Rule:</b> a rate is a conversion factor between its two units, and like any unit factor it is written whichever way up cancels the unwanted unit.', ['Which unit needs to cancel at that point in the chain?'], 'which way up is the rate');
        } }] }
    ]
  });
})(window);
