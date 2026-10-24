"""Teacher Ledger results: an answer opens in a pop-up (arrow keys, Esc), typeset answers, and the tab switch from a test's results to Exit slips. Demo class; needs 8811 + tests/restart_mock.sh."""
import asyncio
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
SH = '/tmp/results_'
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        await ctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','__demo__'); localStorage.setItem('hw:ttab','tests');")
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await pg.goto(BASE + 'teacher/'); await pg.wait_for_selector('.tt-card-ready', timeout=20000)
        await pg.click('.panel:has-text("Past tests") .btn:has-text("Results")'); await pg.wait_for_selector('.tt-res')
        await pg.click('.tt-res tbody tr:nth-child(3) .tt-m >> nth=3'); await pg.wait_for_selector('.tt-dmodal')
        await pg.screenshot(path=SH + 'm1.png')
        await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('ArrowRight'); await pg.keyboard.press('ArrowDown'); await pg.wait_for_timeout(200)
        print('now:', await pg.inner_text('.tt-dtop h3'))
        await pg.click('.tt-dbox .btn:has-text("Small mistake")'); await pg.wait_for_timeout(200)
        print('after mark:', await pg.inner_text('.tt-dbox .tt-ans >> nth=2'))
        await pg.screenshot(path=SH + 'm2.png')
        # find graph-like answers: walk all cells, report types rendered
        kinds = await pg.evaluate("""() => { const T = []; return T; }""")
        for k in range(0, 49, 6):
            await pg.evaluate("(k) => { const c = document.querySelectorAll('.tt-res tbody tr:nth-child(1) .tt-m')[k]; c && c.click(); }", k); await pg.wait_for_timeout(150)
            print(k, (await pg.inner_text('.tt-dbox .tt-their')).replace('\n', ' ')[:90])
        await pg.screenshot(path=SH + 'm3.png')
        await pg.keyboard.press('Escape'); assert await pg.locator('.tt-dmodal').count() == 0
        await pg.click('.tab:has-text("Exit slips")'); await pg.wait_for_timeout(600)
        txt = await pg.inner_text('.tab-body'); print('exit tab shows:', txt[:80].replace('\n', ' | ')); assert 'Exit slip' in txt and 'Unit 1 Test' not in txt[:200]
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
