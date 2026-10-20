"""Screenshots for reviewing one-screen lesson pages at the 11-inch iPad size (1180 x 746).

  python3 tests/screen_shots.py warm OUTDIR u5/l3 [u5/l4 ...]
      the warm-up as the class first sees it (OUTDIR/W_u5l3.png, cropped to one screen = 684 px below the top of the
      card, with a red line where the screen ends) and prints its full height.
  python3 tests/screen_shots.py ex OUTDIR u5/l3 [...]
      every explainer at its first step and its last step, two per row, on contact sheets OUTDIR/X_u5l3_N.png
      (4 explainers per sheet), each tile labelled with the explainer name, step and height.
Needs a static server for the repo root on http://localhost:8811/.
"""
import asyncio, os, sys
from playwright.async_api import async_playwright
from PIL import Image, ImageDraw

BASE = 'http://localhost:8811/'; SCREEN = 684

async def warm(ctx, path, out):
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(BASE + 'lessons/' + path + '/'); await pg.wait_for_timeout(1800)
    w = pg.locator('section.warm').first
    h = await w.evaluate("e => Math.round(e.getBoundingClientRect().height)")
    f = os.path.join(out, 'W_' + path.replace('/', '') + '.png')
    await w.screenshot(path=f)
    im = Image.open(f); d = ImageDraw.Draw(im)
    if im.height > SCREEN: d.line((0, SCREEN, im.width, SCREEN), fill=(220, 30, 30), width=3)
    im.save(f); await pg.close()
    print('%-8s warm-up %d px%s  %s  errors=%s' % (path, h, '  (taller than one screen)' if h > SCREEN else '', f, errs or '-'))

async def ex(ctx, path, out):
    pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
    await pg.goto(BASE + 'lessons/' + path + '/'); await pg.wait_for_timeout(1800)
    n = await pg.locator('.ex').count(); tiles = []
    for i in range(n):
        host = pg.locator('.ex').nth(i)
        name = await host.evaluate("e => e.dataset.explainer || e.id || 'ex'")
        api = await host.evaluate("e => !!e._ex")
        await host.evaluate("e => window.scrollTo(0, e.getBoundingClientRect().top + scrollY - 70)")
        ks = [0]
        if api:
            last = await host.evaluate("async e => { await e._ex.build(0); return e._ex.steps.length; }")
            ks = [0, last]
        for k in ks:
            if api: await host.evaluate("async (e, k) => { await e._ex.build(k); }", k)
            await pg.wait_for_timeout(250)
            hh = await host.evaluate("e => Math.round(e.getBoundingClientRect().height)")
            f = os.path.join(out, '_tile.png'); await host.screenshot(path=f)
            t = Image.open(f).convert('RGB'); tiles.append(('%s  step %s  h=%d%s' % (name, k, hh, '  TALL' if hh > SCREEN else ''), t))
        if api: await host.evaluate("async e => { await e._ex.build(0); }")
    await pg.close()
    base = path.replace('/', '')
    for s in range(0, len(tiles), 8):
        chunk = tiles[s:s + 8]; W = 1100; cw = W // 2
        rows = [chunk[r:r + 2] for r in range(0, len(chunk), 2)]
        hs = [max(int(t.height * (cw - 10) / t.width) for _, t in row) + 22 for row in rows]
        sheet = Image.new('RGB', (W, sum(hs)), 'white'); d = ImageDraw.Draw(sheet); y = 0
        for row, hgt in zip(rows, hs):
            for c, (lab, t) in enumerate(row):
                tt = t.resize((cw - 10, int(t.height * (cw - 10) / t.width))); x = c * cw
                d.rectangle((x, y, x + cw - 10, y + 18), fill='black'); d.text((x + 4, y + 3), lab, fill='white'); sheet.paste(tt, (x, y + 20))
            y += hgt
        f = os.path.join(out, 'X_%s_%d.png' % (base, s // 8 + 1)); sheet.save(f); print(f)
    if errs: print(path, 'page errors:', errs)

async def main():
    mode, out, paths = sys.argv[1], sys.argv[2], sys.argv[3:]; os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1180, 'height': 746}, service_workers='block')
        await ctx.route('**/script.google.com/**', lambda r: r.abort())
        for path in paths: await (warm if mode == 'warm' else ex)(ctx, path, out)
        await b.close()
asyncio.run(main())
