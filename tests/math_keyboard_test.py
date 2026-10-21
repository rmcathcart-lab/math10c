"""On a phone, tapping a math answer box must not open MathLive's own keyboard (the site's keypad is under every
question). Uses a local MathLive (MATHLIVE=path to mathlive.min.js). Needs the static server on 8811 and the mock."""
import asyncio, os
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
ML = os.environ.get('MATHLIVE')
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(**p.devices['iPhone 13'])
        await ctx.route('**/mathlive@*/mathlive.min.js', lambda r: r.fulfill(path=ML, content_type='application/javascript'))
        await ctx.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        await ctx.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(BASE + '?class=10c-b'); await pg.wait_for_selector('.name-btn', timeout=15000)
        await pg.click('.name-btn:has-text("Ben Lee")'); pins = pg.locator('.field.pin'); await pins.nth(0).fill('2222'); await pins.nth(1).fill('2222')
        await pg.click('.btn-primary'); await pg.wait_for_selector('.lesson-row')
        assert await pg.evaluate("!!customElements.get('math-field')"), 'MathLive did not load'
        found = None
        for lid in ['u2l2', 'u2l3', 'u3l1', 'u2l1', 'u1l6a']:
            ids = await pg.evaluate("(l) => HW.lessons[l].items.filter(it => !it.extra).slice(0, 12).map(it => it.id)", lid)
            for i in ids:
                await pg.evaluate("([l, i]) => location.hash = '#/lesson/' + l + '/' + i", [lid, i]); await pg.wait_for_timeout(300)
                if await pg.locator('.qcard math-field').count(): found = (lid, i); break
            if found: break
        print('math question:', found); assert found
        await pg.tap('.qcard math-field'); await pg.wait_for_timeout(1200)
        vis = await pg.evaluate("(() => { const kb = window.mathVirtualKeyboard; const el = document.querySelector('.ML__keyboard'); return { visible: !!(kb && kb.visible), shown: !!(el && el.offsetHeight > 0) }; })()")
        print('keyboard:', vis); await pg.screenshot(path='/tmp/mk_phone.png')
        assert not vis['visible'] and not vis['shown'], vis
        await pg.click('.qcard .kp-key >> nth=0') if await pg.locator('.qcard .kp-key').count() else None
        print('errors', errs); assert not errs; print('PASS')
        await b.close()
asyncio.run(main())
