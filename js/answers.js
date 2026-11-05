/* How a student's answer is shown: answerText (plain, for logs and lists) and answerHtml (typeset math, or the widget's own
 * drawing for graphs, number lines, tiles…). Shared by the practice site (app.js, testmode.js) and the Teacher Ledger. */
(function (root) {
  'use strict';
  var HW = root.HW, esc = HW.esc;
  function W(t) { return (HW.widgets || {})[t] || {}; } // widget renderers (graphs, number lines…) where loaded
  function stripTags(s) { return String(s).replace(/<[^>]+>/g, '').replace(/\\\(|\\\)/g, '').trim(); }
  function answerText(inst, resp) {
    var t = inst.input.type;
    try {
      if (t === 'list' || t === 'select') return (resp || []).join(', ');
      if (t === 'pairs') return (resp || []).map(function (p) { return '(' + p[0] + ', ' + p[1] + ')'; }).join(' ');
      if (t === 'classify') return resp ? resp.choice + (resp.choice === 'composite' ? ' ' + resp.a + '×' + resp.b : '') : '';
      if (t === 'mc') { var o = inst.input.options.filter(function (x) { return x.key === resp; })[0]; return resp ? resp + '. ' + (o ? stripTags(o.html) : '') : ''; }
      if (t === 'ladder' || t === 'tree') return resp ? String(resp.final || '') : '';
      if (t === 'order') { var byO = {}; inst.input.items.forEach(function (x) { byO[x.id] = stripTags(x.html) || x.id; }); return (resp || []).map(function (id) { return byO[id] || id; }).join(' , '); }
      if (t === 'grid') { var colN = {}; inst.input.cols.forEach(function (c) { colN[c.id] = c.label || stripTags(c.html); }); return inst.input.rows.map(function (r) { var g = (resp || {})[r.id]; return (r.label || stripTags(r.html)) + ': ' + (Array.isArray(g) ? g.map(function (c) { return colN[c]; }).join('+') || '–' : g == null ? '–' : colN[g]); }).join('; '); }
      if (t === 'fields') return (resp || []).join(' | ');
      if (W(t).text) return W(t).text(resp, inst.input);
      return String(resp == null ? '' : resp);
    } catch (e) { return ''; }
  }
  function answerHtml(inst, resp) {
    var t = inst.input.type, txt = answerText(inst, resp);
    if (W(t).html) { try { return W(t).html(resp, inst.input); } catch (e) {} }
    if (t === 'math' || t === 'ladder' || t === 'tree') { var v = t === 'math' ? resp : resp.final; var latex = /\\/.test(v) ? v : HW.parse.plain(v).replace(/\^\(?(\d+)\)?/g, '^{$1}').replace(/\*/g, '\\times '); return HW.k((inst.input.before ? stripTags(inst.input.before) : '') + latex); }
    if (t === 'number') return HW.k(String(resp).trim());
    if (t === 'mc') { var o = inst.input.options.filter(function (x) { return x.key === resp; })[0]; return o ? '<b>' + o.key + '.</b> ' + HW.tex(o.html) : esc(txt); }
    if (t === 'classify') return resp.choice === 'prime' ? 'Prime' : 'Composite: ' + HW.k(HW.fmt(inst.input.n) + '=' + resp.a + '\\times ' + resp.b);
    if (t === 'list' || t === 'select') return HW.k((resp || []).join(',\\ '));
    if (t === 'order') { var byH = {}; inst.input.items.forEach(function (x) { byH[x.id] = HW.tex(x.html); }); return (resp || []).map(function (id) { return byH[id] || esc(id); }).join(', '); }
    if (t === 'fields') return (resp || []).map(function (v, i) { var f = inst.input.fields[i] || {}; return (f.label ? HW.tex(f.label) + ' ' : '') + (f.before ? HW.tex(f.before) + ' ' : '') + (f.mode === 'math' && v !== 'none' ? HW.k(String(v)) : esc(v)); }).join(' &nbsp;·&nbsp; ');
    return esc(txt);
  }
  /* the answer box for a question (shared by the practice site, test mode and the Teacher Ledger's answer viewer) */
  function inputWidget(inst, onStep) {
    var I = inst.input, Wd = HW.widgets;
    switch (I.type) {
      case 'number': return Wd.number({ nr: I.nr, before: I.before, after: I.after });
      case 'list': return Wd.list({});
      case 'math': return Wd.math({ before: I.before, after: I.after, keys: I.keys, vars: I.vars, pi: I.pi, placeholder: I.placeholder });
      case 'mc': return Wd.mc({ options: I.options, columns: I.columns });
      case 'select': return Wd.select({ options: I.options, help: I.help });
      case 'classify': return Wd.classify({ n: I.n });
      case 'pairs': return Wd.pairs({ start: I.start, help: I.help });
      case 'ladder': return Wd.ladder({ n: I.n, exponent: I.exponent, onStep: onStep || function () {} });
      case 'tree': return Wd.tree({ n: I.n, exponent: I.exponent, onStep: onStep || function () {} });
    }
    if (Wd[I.type]) return Wd[I.type](I);
    throw new Error('unknown input ' + I.type);
  }
  /* the other way round, for the logged answers (answerText): the response the answer box would hold, or null when the
     text can't be turned back into one (graphs, factor trees…) */
  function answerFromText(inst, txt) {
    var t = inst.input.type, s = String(txt == null ? '' : txt);
    try {
      if (t === 'math' || t === 'number') return s;
      if (t === 'list' || t === 'select') return s.trim() ? s.split(/\s*,\s*/) : [];
      if (t === 'fields') return s.split(' | ');
      if (t === 'mc') {
        var k = s.split('. ')[0], ok = inst.input.options.some(function (o) { return o.key === k; });
        if (ok) return k;
        var m = inst.input.options.filter(function (o) { return stripTags(o.html).replace(/\s+/g, ' ') === s.replace(/\s+/g, ' ').trim(); })[0];
        return m ? m.key : null;
      }
      if (t === 'pairs') { var out = [], re = /\(\s*([^,()]+?)\s*,\s*([^,()]+?)\s*\)/g, mm; while ((mm = re.exec(s))) out.push([mm[1], mm[2]]); return out; }
      if (t === 'classify') { var c = /^(prime|composite)\b\s*(?:(\S+?)\s*×\s*(\S+))?/.exec(s.trim()); return c ? { choice: c[1], a: c[2] || '', b: c[3] || '' } : null; }
    } catch (e) {}
    return null;
  }
  HW.answerText = answerText; HW.answerHtml = answerHtml; HW.inputWidget = inputWidget; HW.answerFromText = answerFromText;
})(window);
