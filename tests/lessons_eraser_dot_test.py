"""Lesson pages: the floating eraser dot — tap = one stroke then back to the pen, double-tap = stays on, drag to move (remembered). Needs 8811."""
import asyncio
from playwright.async_api import async_playwright
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={'width': 1180, 'height': 820}); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
        await pg.goto('http://localhost:8811/lessons/u4/l1a/'); await pg.evaluate("localStorage.clear(); localStorage.setItem('ink:api', JSON.stringify(' '))"); await pg.reload(); await pg.wait_for_selector('.edot')
        tool = lambda: pg.evaluate("document.body.dataset.tool")
        box = await pg.evaluate("(() => { const r = document.querySelector('[data-ink]').getBoundingClientRect(); return [r.left, r.top]; })()")
        async def stroke(y):
            x0, y0 = box[0] + 250, box[1] + y
            await pg.mouse.move(x0, y0); await pg.mouse.down()
            for i in range(12): await pg.mouse.move(x0 + i * 15, y0 + (i % 3) * 6)
            await pg.mouse.up(); await pg.wait_for_timeout(300)
        count = lambda: pg.evaluate("document.querySelectorAll('[data-ink] svg path').length")
        await stroke(120); await stroke(180); n0 = await count()
        await pg.click('.edot'); assert await tool() == 'eraser' and await pg.evaluate("document.querySelector('.edot').classList.contains('once')")
        await stroke(122); assert await count() == n0 - 1, 'one stroke erased'; assert await tool() == 'pen', 'back to the pen after one stroke'
        await pg.wait_for_timeout(400)
        await pg.click('.edot'); await pg.wait_for_timeout(120); await pg.click('.edot')
        assert await tool() == 'eraser' and await pg.evaluate("document.querySelector('.edot').classList.contains('lock')"), 'double-tap locks'
        await stroke(182); assert await tool() == 'eraser', 'stays on'
        await pg.wait_for_timeout(400); await pg.click('.edot'); assert await tool() == 'pen', 'tap turns it off'
        await pg.screenshot(path='/tmp/edot.png', clip={'x': 0, 'y': 0, 'width': 400, 'height': 820})
        bb = await pg.locator('.edot').bounding_box()
        await pg.mouse.move(bb['x'] + 28, bb['y'] + 28); await pg.mouse.down(); await pg.mouse.move(bb['x'] + 200, bb['y'] - 150, steps=8); await pg.mouse.up()
        assert await tool() == 'pen', 'a drag is not a tap'
        saved = await pg.evaluate("localStorage.getItem('ink:edot')"); bb2 = await pg.locator('.edot').bounding_box(); print('moved to', bb2, saved)
        await pg.reload(); await pg.wait_for_selector('.edot'); bb3 = await pg.locator('.edot').bounding_box()
        assert abs(bb3['x'] - bb2['x']) < 3 and abs(bb3['y'] - bb2['y']) < 3, 'position remembered'
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
