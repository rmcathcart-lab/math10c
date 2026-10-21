"""Medal designs: every outcome's symbol, code and seven level dots must sit inside the enamel field (clear of the rim).
Prints the number of symbol pixels that cross into the rim for each outcome, and draws a contact sheet of every outcome at
Gold (front) to /tmp/medals_sheet.png. Needs the static server on 8811."""
import asyncio, sys
from playwright.async_api import async_playwright
JS = r"""() => {
  const M = HW.Medals, N = 512, C = N / 2, S = N / 1024, out = {};
  for (const o of Object.keys(M.DESIGNS)) {
    const d = M.DESIGNS[o], pts = M._outline(d.s);
    const f = document.createElement('canvas'); f.width = f.height = N; const fx = f.getContext('2d');
    const path = () => { fx.beginPath(); pts.forEach((p, i) => fx[i ? 'lineTo' : 'moveTo'](C + p[0] * C, C - p[1] * C)); fx.closePath(); };
    fx.fillStyle = '#fff'; path(); fx.fill(); fx.globalCompositeOperation = 'destination-out'; fx.lineWidth = 2 * 0.15 * C; path(); fx.stroke();
    const field = fx.getImageData(0, 0, N, N).data;
    const g = document.createElement('canvas'); g.width = g.height = N; const gx = g.getContext('2d'); gx.scale(S, S); gx.fillStyle = gx.strokeStyle = '#fff'; gx.lineCap = gx.lineJoin = 'round';
    if (M._icons[d.i]) M._icons[d.i](gx);
    gx.textAlign = 'center'; gx.textBaseline = 'middle'; gx.font = '800 236px "Barlow Condensed", "Arial Narrow", sans-serif'; gx.fillText(o, 512, 640);
    gx.setTransform(1, 0, 0, 1, 0, 0); M._dotSpots(o, 7).forEach(p => { gx.beginPath(); gx.arc(C + p[0] * C, C - p[1] * C, 0.036 * C + 2, 0, Math.PI * 2); gx.fill(); });
    const gd = gx.getImageData(0, 0, N, N).data; let bad = 0, n = 0;
    for (let i = 0; i < N * N; i++) if (gd[i * 4 + 3] > 128) { n++; if (field[i * 4 + 3] < 128) bad++; }
    out[o] = [bad, n];
  }
  return out;
}"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 1300, 'height': 900}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.set_default_timeout(240000)
        await pg.route('**/script.google.com/**', lambda r: r.abort())
        await pg.goto('http://localhost:8811/?class=none'); await pg.wait_for_timeout(1500)
        await pg.evaluate("document.fonts.load('800 100px \"Barlow Condensed\"')")
        r = await pg.evaluate(JS); bad = {k: v for k, v in r.items() if v[0] > 0}
        for k, v in r.items(): print('%-4s %5d of %6d symbol pixels in the rim' % (k, v[0], v[1]))
        if '--sheet' in sys.argv:
            tier = int(sys.argv[sys.argv.index('--sheet') + 1])
            await pg.evaluate("""(tier) => { document.body.innerHTML = '<div id=g style="display:grid;grid-template-columns:repeat(6,200px);gap:8px;padding:10px;background:#11151b"></div>';
              const gEl = document.getElementById('g'); Object.keys(HW.Medals.DESIGNS).forEach(o => { const c = HW.Medals.slot(o, tier); c.style.width = c.style.height = '200px'; gEl.appendChild(c); }); }""", tier)
            await pg.wait_for_timeout(150000)
            await pg.locator('#g').screenshot(path='/tmp/medals_sheet_%d.png' % tier)
        print('errors', errs); await b.close()
asyncio.run(main())
