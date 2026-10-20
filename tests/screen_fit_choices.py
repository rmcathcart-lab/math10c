"""screen_fit_choices.py u2/l4 ...: every explainer, every choice, every step: caption overflow (text wider than the caption box)
and stage text clipped outside the stage, plus overlap counts at sidebar width vs at full width (966)."""
import asyncio, sys, importlib.util
from playwright.async_api import async_playwright
spec = importlib.util.spec_from_file_location('sfc', '/home/claude/m10c-main/tests/screen_fit_check.py')
src = open('/home/claude/m10c-main/tests/screen_fit_check.py').read()
MJ = src.split('METRICS_JS = r"""')[1].split('"""')[0]
JS = """async ([MJ, full]) => {
  const M = eval(MJ), out = [];
  for (const host of document.querySelectorAll('.ex')) {
    const ex = host._ex; if (!ex) continue;
    const name = host.dataset.explainer || host.id;
    const vals = (ex.def.choices || []).filter(c => !(c && c.sep)).map(c => typeof c === 'object' ? c.v : c);
    if (!vals.length) vals.push(ex.value);
    const keep = ex.def.minW, v0 = ex.value;
    for (const v of vals) {
      ex.value = v;
      const res = [];
      for (const mode of ['side', 'full']) {
        if (mode === 'full') { ex.def.minW = 966; } ex.lastW = 0; ex.fitStage(ex.hold.clientWidth);
        await ex.build(0); const n = ex.steps.length, r = [];
        for (let k = 0; k <= n; k++) { await ex.build(k); await new Promise(z => setTimeout(z, 20));
          const m = M(host); const cap = ex.cap; let co = 0;
          const C = cap.getBoundingClientRect();
          cap.querySelectorAll('.katex').forEach(e => { const b = e.getBoundingClientRect(); if (b.right > C.right + 2) co++; });
          r.push([m.clip, m.over, co]); }
        res.push(r); ex.def.minW = keep;
      }
      ex.lastW = 0; ex.fitStage(ex.hold.clientWidth);
      const bad = [];
      res[0].forEach((s, k) => { const f = res[1][k] || [0, 0, 0]; if (s[0] > f[0] || s[1] > f[1] || s[2]) bad.push(`step${k}:clip${s[0]}/${f[0]} over${s[1]}/${f[1]} cap${s[2]}`); });
      if (bad.length) out.push(name + ' [' + v + '] ' + bad.join(' '));
    }
    ex.value = v0; await ex.build(0);
  }
  return out;
}"""
async def main():
    async with async_playwright() as p:
        br = await p.chromium.launch(); ctx = await br.new_context(viewport={'width': 1180, 'height': 746}, service_workers='block')
        for path in sys.argv[1:]:
            pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto('http://localhost:8811/lessons/' + path + '/'); await pg.wait_for_timeout(1800)
            r = await pg.evaluate(JS, [MJ, 966])
            print(path, 'errors=', errs or '-'); [print('   ', x) for x in r]
            await pg.close()
        await br.close()
asyncio.run(main())
