"""The demo class's Retests tab: two made-up requests (Ava Martin, Maya Patel, Unit 1); opening Ava's retest runs a simulated
one-student live test; closing it moves the request to "Written". Needs the static server and the mock (for saved tests)."""
import asyncio, json, urllib.request, urllib.parse
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
async def main():
    urllib.request.urlopen(MOCK + '?action=savetest&key=testkey&def=' + urllib.parse.quote(json.dumps({'title': 'Unit 1 Test', 'kind': 'test', 'unit': 1, 'minutes': 30, 'calc': True, 'items': [{'l': 'u1l2', 'i': x} for x in ['1a', '1b', '2a']]}))).read()
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        await ctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','__demo__'); localStorage.setItem('hw:ttab','retests');")
        tp = await ctx.new_page(); tp.on('pageerror', lambda e: errs.append(str(e))); tp.on('dialog', lambda d: (print('dialog:', d.message[:120]), asyncio.ensure_future(d.accept())))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.rt-tbl', timeout=20000)
        rows = await tp.evaluate("[...document.querySelectorAll('.rt-waiting .rt-tbl tbody tr')].map(r => r.innerText.replace(/\\s+/g, ' '))"); print('\n'.join(rows))
        assert len(rows) == 2 and 'Ava Martin' in ' '.join(rows), rows
        await tp.screenshot(path='/tmp/rt_demo.png', full_page=True)
        await tp.click('.rt-tbl tr:has-text("Ava Martin") .btn-primary:has-text("Open retest")'); await tp.wait_for_selector('.tt-live-head', timeout=15000)
        head = await tp.inner_text('.tt-live-head'); print('head:', head.replace('\n', ' | ')); assert 'Ava Martin' in head
        n = 0
        for _ in range(120):
            txt = await tp.inner_text('.tt-live'); n = await tp.locator('.tt-live tbody tr').count()
            if 'Submitted' in txt or 'Finished' in txt: break
            await tp.wait_for_timeout(1000)
        print('live rows', n); assert n == 1
        await tp.click('.tt-live-head .btn-primary:has-text("Close")'); await tp.wait_for_selector('.tt-res', timeout=15000)
        await tp.click('.tabs .tab:has-text("Retests")'); await tp.wait_for_selector('.rt-old', timeout=20000)   # (the demo lives in the page: no reload)
        await tp.click('.rt-old h3 button'); old = await tp.inner_text('.rt-old'); print('old:', ' '.join(old.split())[:300]); assert 'Retest written' in old
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
