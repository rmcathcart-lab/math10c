"""The demo class in the Teacher Ledger: every tab with made-up students, a marked test, a live test on a clock (unlock, close). Needs 8811 + tests/restart_mock.sh; waits ~75 s for the live test."""
import asyncio, json, time
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
SH = '/tmp/demo_'
async def main():
    import urllib.request
    d = {'title': 'Quiz 1.2', 'kind': 'test', 'minutes': 20, 'calc': True, 'items': [{'l': 'u1l2', 'i': x} for x in ['1a', '1b', '2a', '3a', '4a', '5']]}
    urllib.request.urlopen(MOCK + '?action=savetest&key=testkey&def=' + urllib.request.quote(json.dumps(d))).read()
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        await ctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','__demo__'); localStorage.setItem('hw:ttab','progress');")
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and 'ERR_' not in m.text and errs.append('console: ' + m.text))
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await pg.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        t0 = time.time(); await pg.goto(BASE + 'teacher/'); await pg.wait_for_selector('.tbl.prog', timeout=30000); print('load s', round(time.time() - t0, 1))
        print('chip', await pg.inner_text('#online-chip'))
        await pg.screenshot(path=SH + 'progress.png')
        await pg.click('tr.prow:has-text("Olivia Brown") td.uc[data-u="1"]'); await pg.click('tr.pdrop .pd-l >> nth=1'); await pg.wait_for_timeout(200)
        await pg.screenshot(path=SH + 'progress2.png')
        for tab in ['Live', 'Outcomes', 'Questions']:
            await pg.click('.tab:has-text("%s")' % tab); await pg.wait_for_timeout(400); await pg.screenshot(path=SH + tab.lower() + '.png', full_page=tab != 'Outcomes')
        await pg.click('.tbl.items tr.irow >> nth=2'); await pg.wait_for_timeout(200); await pg.screenshot(path=SH + 'questions2.png', full_page=True)
        await pg.click('.tab:has-text("Student")'); await pg.select_option('.opt-row select', 'Ethan Wilson'); await pg.wait_for_selector('.su'); await pg.click('.su-head >> nth=1'); await pg.wait_for_timeout(500)
        await pg.screenshot(path=SH + 'student.png', full_page=True)
        await pg.click('.tab:has-text("Tests")'); await pg.wait_for_selector('.tt-card-ready', timeout=15000)
        await pg.screenshot(path=SH + 'tests.png', full_page=True)
        await pg.click('.panel:has-text("Past tests") .btn:has-text("Results")'); await pg.wait_for_selector('.tt-res', timeout=15000); await pg.wait_for_timeout(500)
        await pg.screenshot(path=SH + 'results.png', full_page=True)
        await pg.click('text=All tests'); await pg.wait_for_timeout(300)
        await pg.click('.tab:has-text("Exit slips")'); await pg.wait_for_timeout(800)
        await pg.click('.panel:has-text("Past exit slips") .btn:has-text("Results")'); await pg.wait_for_selector('.tt-res', timeout=15000)
        await pg.screenshot(path=SH + 'exitres.png', full_page=True)
        await pg.click('text=All exit slips'); await pg.wait_for_timeout(300)
        await pg.click('.tab:has-text("Tests")'); await pg.wait_for_selector('.tt-card')
        await pg.click('.tt-card:not(.tt-card-ready) .btn-primary'); await pg.wait_for_selector('.tt-live-head', timeout=20000)
        await pg.wait_for_timeout(75000); await pg.screenshot(path=SH + 'tlive.png', full_page=True)
        live = await pg.inner_text('.tt-chips'); print('live:', live); assert '1\nlocked' in live or '1 locked' in live.replace('\n', ' ')
        await pg.click('.tt-live tr:has-text("Ethan Wilson") .btn:has-text("Unlock")'); await pg.wait_for_timeout(6000)
        print('after unlock:', await pg.inner_text('.tt-live tr:has-text("Ethan Wilson")'))
        await pg.click('.tt-live-head .btn-primary:has-text("Close")'); await pg.wait_for_selector('.tt-res', timeout=15000)
        await pg.screenshot(path=SH + 'tclosed.png', full_page=True)
        await pg.click('text=All tests'); await pg.wait_for_timeout(500)
        print('past:', await pg.inner_text('.panel:has-text("Past tests")'))
        await pg.click('.tab:has-text("Settings")'); await pg.wait_for_timeout(300); await pg.screenshot(path=SH + 'settings.png', full_page=True)
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
