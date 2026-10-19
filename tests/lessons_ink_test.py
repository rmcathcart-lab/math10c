"""Lesson toolbar: hold a pen colour to recolour that slot (new strokes take it), and a held finger turns the Pencil into the eraser. Needs 8811."""
import asyncio
from playwright.async_api import async_playwright
SH = '/tmp/ink_'
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1180, 'height': 820}); pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await ctx.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
        await pg.goto('http://localhost:8811/lessons/u4/l1a/'); await pg.wait_for_selector('#tb'); await pg.evaluate("localStorage.clear(); localStorage.setItem('ink:api', JSON.stringify(' '))"); await pg.reload(); await pg.wait_for_selector('#tb')
        await pg.screenshot(path=SH + 'tb.png', clip={'x': 0, 'y': 0, 'width': 1180, 'height': 70})
        sw = pg.locator('.sw[data-color=blue]'); bb = await sw.bounding_box()
        await pg.mouse.move(bb['x'] + 10, bb['y'] + 10); await pg.mouse.down(); await pg.wait_for_timeout(650); await pg.mouse.up()
        await pg.wait_for_selector('.cpick'); await pg.screenshot(path=SH + 'picker.png', clip={'x': 0, 'y': 0, 'width': 1180, 'height': 260})
        await pg.click('.cp-c[data-c="#7c3aed"]'); assert await pg.locator('.cpick').count() == 0
        print('slot', await pg.evaluate("getComputedStyle(document.querySelector('.sw[data-color=blue]')).getPropertyValue('--c')"), await pg.evaluate("JSON.parse(localStorage.getItem('ink:slots'))"))
        # draw with the mouse on the first ink surface
        box = await pg.evaluate("(() => { const r = document.querySelector('[data-ink]').getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; })()")
        x0, y0 = box[0] + 200, box[1] + 120
        await pg.mouse.move(x0, y0); await pg.mouse.down()
        for i in range(12): await pg.mouse.move(x0 + i * 15, y0 + (i % 3) * 6)
        await pg.mouse.up(); await pg.wait_for_timeout(700)
        fills = await pg.evaluate("[...document.querySelectorAll('[data-ink] svg path')].map(p => p.getAttribute('fill') || getComputedStyle(p).fill)")
        print('stroke fills', fills[:3])
        # finger held + pencil → erase
        n0 = await pg.evaluate("document.querySelectorAll('[data-ink] svg path').length")
        await pg.evaluate("""([x, y]) => { const t = document.elementFromPoint(x, y);
          window.__ink = null; }""", [x0 + 60, y0])
        r = await pg.evaluate("""async ([x, y]) => { const Ink = await import('/lessons/js/ink.js'); const S = Ink.state(); S.held = 1; S.heldAt = 0;
          const t = document.elementFromPoint(x, y); const o = { pointerId: 7, pointerType: 'pen', bubbles: true, cancelable: true, clientX: x, clientY: y, buttons: 1, pressure: .5 };
          t.dispatchEvent(new PointerEvent('pointerdown', o)); for (let i = 0; i < 10; i++) t.dispatchEvent(new PointerEvent('pointermove', Object.assign({}, o, { clientX: x + i * 8 })));
          t.dispatchEvent(new PointerEvent('pointerup', o)); S.held = 0; return S.undo.map(a => a.type); }""", [x0 + 20, y0 + 3])
        await pg.wait_for_timeout(300)
        n1 = await pg.evaluate("document.querySelectorAll('[data-ink] svg path').length")
        print('undo stack', r, 'paths before/after', n0, n1); assert r[-1] == 'erase' and n1 < n0 and fills[0] == '#7c3aed'
        await pg.click('[data-act=menu]'); await pg.wait_for_timeout(200); await pg.screenshot(path=SH + 'menu.png', clip={'x': 700, 'y': 0, 'width': 480, 'height': 600})
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
