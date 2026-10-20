"""Class calendar: the ledger's Calendar tab (make, drag earlier/later, skip by dragging to Skipped, put back, days off,
undo) on the mock class, then the student's home (Lessons / Class calendar toggle, next test, month view).
Needs python3 -m http.server 8811 (repo root) and a fresh mock (tests/restart_mock.sh)."""
import asyncio, json, urllib.request
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
SH = '/tmp/cal_'
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())
async def drag(pg, src, dst):
    a = await pg.locator(src).first.bounding_box(); b = await pg.locator(dst).first.bounding_box()
    await pg.mouse.move(a['x'] + 20, a['y'] + 10); await pg.mouse.down()
    await pg.mouse.move(a['x'] + 40, a['y'] + 30, steps=3); await pg.mouse.move(b['x'] + b['width'] / 2, b['y'] + b['height'] / 2, steps=8); await pg.mouse.up()
    await pg.wait_for_timeout(500)
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1400, 'height': 1500})
        await ctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','calendar');")
        tp = await ctx.new_page(); tp.on('pageerror', lambda e: errs.append('T ' + str(e)))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.kc-start', timeout=15000)
        await tp.fill('.kc-date', '2026-09-03'); await tp.click('.kc-start .btn-primary'); await tp.wait_for_selector('.kc-grid')
        await tp.wait_for_timeout(600)
        cal = get('action=cal&class=10c-b')['cal']; print('saved start', cal['start'], len(cal['items']), 'items')
        await tp.click('.kc-prev'); await tp.wait_for_timeout(200)
        while (await tp.inner_text('.cal-nav h2')) != 'September 2026': await tp.click('.kc-prev'); await tp.wait_for_timeout(150)
        await tp.screenshot(path=SH + 'sept.png', full_page=True)
        dateOf = lambda k: tp.evaluate("(k) => { const c = document.querySelector('.kc-grid .kc-chip[data-key=' + k + ']'); return c ? c.closest('.calm-day').dataset.date : null; }", k)
        keysOn = lambda d: tp.evaluate("(d) => [...document.querySelectorAll('.calm-day[data-date=\"' + d + '\"] .kc-chip')].map(c => c.dataset.key)", d)
        # drag Lesson 4 onto Lesson 3's day: two in one day, everything after moves up a day
        d3, d5 = await dateOf('u1l3'), await dateOf('u1l5')
        await drag(tp, '.kc-chip[data-key=u1l4]', '.calm-day[data-date="%s"]' % d3)
        print(d3, await keysOn(d3)); assert await keysOn(d3) == ['u1l3', 'u1l4']
        d5b = await dateOf('u1l5'); print('L5 moved from', d5, 'to', d5b); assert d5b < d5
        # drag Lesson 5 two class days later: the days between stay empty, what follows falls in line
        days = await tp.evaluate("[...document.querySelectorAll('.kc-grid .calm-day:not(.off):not(.out)')].map(c => c.dataset.date)")
        i5 = days.index(d5b); target = days[i5 + 2]
        await drag(tp, '.kc-chip[data-key=u1l5]', '.calm-day[data-date="%s"]' % target)
        assert await dateOf('u1l5') == target and await keysOn(days[i5]) == [] and await keysOn(days[i5 + 1]) == [] and await dateOf('u1l6a') == days[i5 + 3]
        # skip Lesson 2 by dragging it to Skipped
        await drag(tp, '.kc-chip[data-key=u1l2]', '.kc-tray')
        assert await tp.locator('.kc-tray .kc-chip[data-key=u1l2]').count() == 1
        d2 = '2026-09-04'; print('after skip,', d2, await keysOn(d2)); assert await keysOn(d2) == ['u1l3', 'u1l4']
        # put it back on Sept 4 (that day's lessons and everything after move back a day)
        await drag(tp, '.kc-tray .kc-chip[data-key=u1l2]', '.calm-day[data-date="2026-09-04"]')
        print('put back:', await keysOn(d2), await keysOn('2026-09-07'), await tp.inner_text('.kc-msg')); assert await keysOn(d2) == ['u1l2'] and await keysOn('2026-09-07') == ['u1l3', 'u1l4']
        assert await tp.locator('.kc-tray .kc-chip').count() == 0
        # undo puts it back in Skipped
        await tp.click('.kc-top .btn:has-text("Undo")'); await tp.wait_for_timeout(500); assert await tp.locator('.kc-tray .kc-chip[data-key=u1l2]').count() == 1
        # tap a chip: options
        await tp.click('.kc-grid .kc-chip[data-key=u1l1]'); await tp.wait_for_selector('.kc-pop'); await tp.screenshot(path=SH + 'pop.png')
        await tp.keyboard.press('Escape')
        # days off: Labour Day (Sept 7) — that day's lessons and everything after move along a day
        before = await dateOf('u1l6a')
        await tp.click('.kc-top .btn:has-text("Days off")'); await tp.click('.calm-day[data-date="2026-09-07"]'); await tp.wait_for_timeout(600)
        after = await dateOf('u1l6a'); print('L6A', before, '->', after)
        assert '2026-09-07' in get('action=classes&key=testkey')['noSchool'] and after > before and 'No school' in await tp.inner_text('.calm-day[data-date="2026-09-07"]')
        await tp.click('.kc-top .btn:has-text("Done with days off")'); await tp.wait_for_timeout(300)
        await tp.screenshot(path=SH + 'edited.png', full_page=True)
        cal = get('action=cal&class=10c-b')
        print('saved:', cal['cal']['items'][:8], cal['cal']['skipped'], cal['noSchool'])
        # ---- the student ----
        urllib.request.urlopen(MOCK + '?action=setroster&key=testkey&class=10c-b&label=Block%20B&names=Ava%20Brown&mode=add').read()
        sp = await (await b.new_context(viewport={'width': 1280, 'height': 900})).new_page(); sp.on('pageerror', lambda e: errs.append('S ' + str(e)))
        await sp.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
        await sp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await sp.goto(BASE + '?class=10c-b'); await sp.wait_for_selector('.name-btn', timeout=10000)
        await sp.click('.name-btn:has-text("Ava Brown")'); pins = sp.locator('.field.pin'); await pins.nth(0).fill('1111'); await pins.nth(1).fill('1111')
        await sp.click('.btn-primary'); await sp.wait_for_selector('.lesson-row'); await sp.wait_for_selector('.home-bar', timeout=10000)
        print('home bar:', await sp.inner_text('.home-bar'))
        await sp.screenshot(path=SH + 'student_home.png')
        await sp.click('.vtog a:has-text("Class calendar")'); await sp.wait_for_selector('.calm')
        await sp.screenshot(path=SH + 'student_cal.png', full_page=True)
        await sp.goto(BASE + '#/calendar/2026-09'); await sp.wait_for_selector('.calm'); await sp.wait_for_timeout(300)
        st4 = await sp.evaluate("[...document.querySelectorAll('.calm-day[data-date=\"2026-09-04\"] .calm-chip')].map(c => c.textContent)"); print('student Sept 4:', st4); assert len(st4) == 2
        assert 'No school' in await sp.inner_text('.calm-day[data-date="2026-09-07"]')
        await sp.screenshot(path=SH + 'student_sept.png', full_page=True)
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
