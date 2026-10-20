"""Screenshots of the student home (desktop + phone) with a class calendar and some progress, for design review.
Needs python3 -m http.server 8811 and a fresh mock (tests/restart_mock.sh). Usage: python3 tests/home_shots.py [prefix]"""
import asyncio, sys
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
PRE = sys.argv[1] if len(sys.argv) > 1 else '/tmp/home_'
SEED = """(() => {
  const S = { v: 1, lessons: {} }, put = (lid, n, credit) => { const L = HW.lessons[lid]; if (!L) return; const l = S.lessons[lid] = S.lessons[lid] || { items: {}, qv: {}, cur: null, secs: 0, updated: Date.now() };
    L.required.slice(0, n).forEach((it, i) => l.items[it.id] = { s: 'done', v: 0, tv: 0, wrong: 0, steps: 0, forms: 0, reveals: 0, credit: i % 4 === 3 ? 'help' : credit, secs: 60, at: Date.now(), prac: 0 }); l.secs = 60 * n; };
  ['u1l1','u1l2','u1l3','u1l4','u1l5','u1l6a','u1l6b','u1l7'].forEach(l => put(l, 99, 'first'));
  put('u2l1', 99, 'first'); put('u2l2', 99, 'first'); put('u2l3', 4, 'first');
  localStorage.setItem('hw:v1:10c-b|ben lee', JSON.stringify(S));
})()"""
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1300, 'height': 950}, service_workers='block')
        await ctx.route('**/script.google.com/**', lambda r: r.abort())
        page = await ctx.new_page(); page.on('pageerror', lambda e: errs.append(str(e)))
        await page.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
        await page.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await page.goto(BASE + '?class=10c-b'); await page.wait_for_selector('.name-btn', timeout=10000)
        await page.evaluate("fetch('%s?action=setcal&key=testkey&class=10c-b&cal=' + encodeURIComponent(JSON.stringify(HW.Cal.make('2026-09-03'))))" % MOCK)
        await page.click('.name-btn:has-text("Ben Lee")')
        pins = page.locator('.field.pin'); await pins.nth(0).fill('4321'); await pins.nth(1).fill('4321')
        await page.click('.btn-primary'); await page.wait_for_selector('.unit-title')
        await page.evaluate(SEED); await page.reload(); await page.wait_for_selector('.unit-title'); await page.wait_for_timeout(1200)
        await page.screenshot(path=PRE + 'desk.png', full_page=True)
        await page.set_viewport_size({'width': 390, 'height': 844}); await page.wait_for_timeout(300)
        await page.screenshot(path=PRE + 'phone.png', full_page=True)
        print('errors:', errs)
        await b.close()
asyncio.run(main())
