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
        # the real iPad sequence: a finger touches and stays, then the Pencil's touches (Safari cancels its pointer events)
        await pg.mouse.move(x0, y0 + 40); await pg.mouse.down()
        for i in range(12): await pg.mouse.move(x0 + i * 15, y0 + 40 + (i % 3) * 6)
        await pg.mouse.up(); await pg.wait_for_timeout(700)
        n2 = await pg.evaluate("document.querySelectorAll('[data-ink] svg path').length")
        r2 = await pg.evaluate("""async ([x, y, fx, fy]) => { const Ink = await import('/lessons/js/ink.js'); const S = Ink.state();
          const t = document.elementFromPoint(x, y), ft = document.elementFromPoint(fx, fy);
          const finger = new Touch({ identifier: 1, target: ft, clientX: fx, clientY: fy, touchType: 'direct', radiusX: 10, radiusY: 10 });
          const fire = (type, changed, all) => t.dispatchEvent(new TouchEvent(type, { bubbles: true, cancelable: true, touches: all, changedTouches: changed, targetTouches: all }));
          ft.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, cancelable: true, touches: [finger], changedTouches: [finger], targetTouches: [finger] }));
          const held = S.held; await new Promise(r => setTimeout(r, 200));
          const pen = (cx) => { const q = new Touch({ identifier: 2, target: t, clientX: cx, clientY: y }); Object.defineProperty(q, 'touchType', { value: 'stylus' }); return q; }; // Chromium has no touchType; Safari does
          fire('touchstart', [pen(x)], [finger, pen(x)]); 
          for (let i = 1; i < 14; i++) fire('touchmove', [pen(x + i * 8)], [finger, pen(x + i * 8)]);
          fire('touchend', [pen(x + 110)], [finger]);
          ft.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], changedTouches: [finger], targetTouches: [] }));
          return { held, after: S.held, undo: S.undo.map(a => a.type), body: document.body.className }; }""", [x0 + 20, y0 + 43, x0 + 400, y0 + 250])
        await pg.wait_for_timeout(300)
        n3 = await pg.evaluate("document.querySelectorAll('[data-ink] svg path').length")
        print('touch path:', r2, 'paths', n2, '->', n3); assert r2['held'] == 1 and r2['after'] == 0 and r2['undo'][-1] == 'erase' and n3 < n2
        print('undo stack', r, 'paths before/after', n0, n1); assert r == ['add'] and n1 == n0 and fills[0] == '#7c3aed'  # with a finger held, the Pencil's pointer events don't draw (the touch events erase)
        await pg.click('[data-act=menu]'); await pg.wait_for_timeout(200); await pg.screenshot(path=SH + 'menu.png', clip={'x': 700, 'y': 0, 'width': 480, 'height': 600})
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
