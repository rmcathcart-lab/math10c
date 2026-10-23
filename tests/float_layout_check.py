"""Explainer layout check (chips above, caption below, controls floating right of the card) at the 11-inch iPad size
(1180 x 746): for every explainer on every page, the picture size now vs in the old sidebar layout (694 px column, or
full width for side:false), the tallest the whole explainer gets over every choice and step (it must fit 684 px), and
whether the controls float outside the card.

Usage: python3 tests/float_layout_check.py [--json out.json] u1/l1 u1/l2 ...   (no ids: all pages in lessons_smoke.py)
Needs a static server for the repo root on 8811."""
import asyncio, json, re, sys
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/lessons/'
ARGS = [a for a in sys.argv[1:] if not a.startswith('--') and not a.endswith('.json')]
OUT = next((a for a in sys.argv[1:] if a.endswith('.json')), None)
if not ARGS:
    ARGS = re.findall(r"'(u\d+/l\d+)'", open(__file__.replace('float_layout_check.py', 'lessons_smoke.py')).read())
JS = r"""async () => {
  const out = [];
  for (const host of document.querySelectorAll('.ex')) {
    const ex = host._ex; if (!ex) continue;
    const d = ex.def, H = d.height, m = d.minW || 0;
    const vals = (d.choices || []).filter(c => !(c && c.sep)).map(c => typeof c === 'object' ? c.v : c);
    if (!vals.length) vals.push(ex.value);
    const v0 = ex.value; let maxH = 0, capMax = 0, steps = 0;
    for (const v of vals) {
      ex.value = v; await ex.build(0); const n = ex.steps.length; steps = Math.max(steps, n);
      await ex.build(n);
      for (let i = -1; i < n; i++) { ex.showCap(i < 0 ? ex.intro() : ex.capOf(i)); capMax = Math.max(capMax, ex.cap.offsetHeight); maxH = Math.max(maxH, host.getBoundingClientRect().height); }
    }
    ex.value = v0; await ex.build(0);
    const S = ex.stage.getBoundingClientRect(), hold = ex.hold.clientWidth;
    const oldW = d.side === false ? hold : Math.min(hold, 694), oldS = m ? Math.min(1, oldW / m) : 1;
    out.push({ name: host.dataset.explainer || host.id || '?', H, minW: m, hold, w: Math.round(S.width), h: Math.round(S.height),
      scale: +(ex.scale || 1).toFixed(3), oldScale: +oldS.toFixed(3), maxH: Math.round(maxH), capMax, steps,
      out: !!host.querySelector('.ex-ctl-out'), top: host.querySelector('.ex-top') ? host.querySelector('.ex-top').offsetHeight : 0,
      inWarm: !!host.closest('.wf, .warm') });
  }
  return out;
}"""
async def page_check(ctx, pid, res):
    pg = await ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(BASE + pid + '/'); await pg.wait_for_timeout(2500)
    try: r = await pg.evaluate(JS)
    except Exception as e: r = []; errs.append(str(e)[:200])
    res[pid] = {'ex': r, 'errors': errs}; await pg.close()
async def main():
    res = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1180, 'height': 746}, service_workers='block')
        await ctx.route('**/script.google.com/**', lambda r: r.abort())
        q = list(ARGS)
        async def worker():
            while q: await page_check(ctx, q.pop(0), res)
        await asyncio.gather(*[worker() for _ in range(4)])
        await b.close()
    tall, smaller, inside = [], [], []
    for pid in ARGS:
        for e in res[pid]['ex']:
            ratio = e['scale'] / e['oldScale'] if e['oldScale'] else 1
            e['ratio'] = round(ratio, 2)
            if e['maxH'] > 684: tall.append((pid, e['name'], e['maxH'], e['capMax'], e['top']))
            if ratio < 0.98 and not e['inWarm']: smaller.append((pid, e['name'], e['oldScale'], e['scale'], e['top']))
            if not e['out'] and not e['inWarm']: inside.append((pid, e['name']))
        if res[pid]['errors']: print(pid, 'ERRORS', res[pid]['errors'][:2])
    n = sum(len(res[p]['ex']) for p in ARGS)
    print('%d explainers on %d pages' % (n, len(ARGS)))
    print('taller than 684 px (page, explainer, height, tallest caption, chips row):', len(tall)); [print('  ', *t) for t in tall]
    print('picture smaller than in the sidebar layout:', len(smaller)); [print('  ', *t) for t in smaller]
    print('controls not floating (outside warm-ups):', len(inside)); [print('  ', *t) for t in inside]
    if OUT: json.dump(res, open(OUT, 'w'), indent=1)
asyncio.run(main())
