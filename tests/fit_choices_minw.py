"""For explainers that are cramped on some choice (tests/screen_fit_choices.py), find the smallest minW at which EVERY
choice at EVERY step has no more clipped / overlapping stage text than at full width (966 px).

Usage: python3 tests/fit_choices_minw.py out.json u1/l1 u1/l5 ...
Writes results in the format tests/apply_minw.py reads. Caption overflow can't be fixed by minW; those are listed.
"""
import asyncio, json, sys
from playwright.async_api import async_playwright
src = open(__file__.replace('fit_choices_minw.py', 'screen_fit_check.py')).read()
MJ = src.split('METRICS_JS = r"""')[1].split('"""')[0]
CAND = [780, 820, 860, 900, 940, 966]
JS = """async ([MJ, CAND]) => {
  const M = eval(MJ), out = [];
  const run = async (ex, host, vals, minw) => {   // [choice][step] -> [clip, over, cap]
    const keep = ex.def.minW; ex.def.minW = minw || undefined; ex.lastW = 0; ex.fitStage(ex.hold.clientWidth);
    const all = [];
    for (const v of vals) { ex.value = v; await ex.build(0); const n = ex.steps.length, r = [];
      for (let k = 0; k <= n; k++) { await ex.build(k); await new Promise(z => setTimeout(z, 15));
        const m = M(host), C = ex.cap.getBoundingClientRect(); let co = 0;
        ex.cap.querySelectorAll('.katex').forEach(e => { if (e.getBoundingClientRect().right > C.right + 2) co++; });
        r.push([m.clip, m.over, co]); }
      all.push(r); }
    ex.def.minW = keep; ex.lastW = 0; ex.fitStage(ex.hold.clientWidth); return all;
  };
  const worse = (a, b) => a.some((r, i) => r.some((s, k) => { const f = (b[i] || [])[k] || [0, 0, 0]; return s[0] > f[0] || s[1] > f[1]; }));
  for (const host of document.querySelectorAll('.ex')) {
    const ex = host._ex; if (!ex || !host.classList.contains('ex-side')) continue;
    const name = host.dataset.explainer || host.id;
    const vals = (ex.def.choices || []).filter(c => !(c && c.sep)).map(c => typeof c === 'object' ? c.v : c);
    if (!vals.length) vals.push(ex.value);
    const v0 = ex.value, cur = ex.def.minW || 0;
    const full = await run(ex, host, vals, 966), now = await run(ex, host, vals, cur);
    const caps = []; now.forEach((r, i) => r.forEach((s, k) => { if (s[2]) caps.push(vals[i] + '@' + k); }));
    let need = null;
    if (worse(now, full)) { need = 966; for (const w of CAND) { if (w <= cur) continue; if (!worse(await run(ex, host, vals, w), full)) { need = w; break; } } }
    ex.value = v0; await ex.build(0);
    if (need || caps.length) out.push({ name, cur, need, caps });
  }
  return out;
}"""
async def main():
    outf, paths = sys.argv[1], sys.argv[2:]; res = []
    async with async_playwright() as p:
        br = await p.chromium.launch(); ctx = await br.new_context(viewport={'width': 1180, 'height': 746}, service_workers='block')
        await ctx.route('**/script.google.com/**', lambda r: r.abort())
        for path in paths:
            pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('http://localhost:8811/lessons/' + path + '/'); await pg.wait_for_timeout(1800)
            r = await pg.evaluate(JS, [MJ, CAND]); await pg.close()
            for x in r: print(path, x['name'], 'minW', x['cur'] or '-', '->', x['need'] or '(ok)', ('captions: ' + ' '.join(x['caps'][:6])) if x['caps'] else '', flush=True)
            if errs: print(path, 'errors', errs)
            res.append({'path': path, 'explainers': [{'name': x['name'], 'status': 'cramped', 'need': x['need']} for x in r if x['need']]})
        await br.close()
    json.dump(res, open(outf, 'w'), indent=1)
asyncio.run(main())
