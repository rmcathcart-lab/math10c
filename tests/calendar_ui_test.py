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
    get('action=setroster&key=testkey&class=10c-d&label=Block%20D&names=Zed%20Q&mode=add')
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1400, 'height': 1700})
        await ctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','calendar');")
        tp = await ctx.new_page(); tp.on('pageerror', lambda e: errs.append('T ' + str(e)))
        tp.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.kc-start', timeout=15000)
        await tp.fill('.kc-date', '2026-09-03'); await tp.click('.kc-start .btn-primary'); await tp.wait_for_selector('.kc-grid')
        await tp.wait_for_timeout(600)
        cal = get('action=cal&class=10c-b')['cal']; print('saved start', cal['start'], len(cal['items']), 'items')
        await tp.evaluate("document.querySelector('.kc-grid').scrollToDate('2026-09-01')"); await tp.wait_for_timeout(200)
        # Today brings this week back
        await tp.click('.kc-grid .calv-today'); await tp.wait_for_timeout(800)
        assert await tp.evaluate("(() => { const b = document.querySelector('.kc-grid'), t = b.querySelector('.calm-day.calm-today'); if (!t) return true; const r = t.getBoundingClientRect(), q = b.getBoundingClientRect(); return r.top >= q.top && r.bottom <= q.bottom; })()"), 'today in view'
        await tp.evaluate("document.querySelector('.kc-grid').scrollToDate('2026-09-01')"); await tp.wait_for_timeout(200)
        assert await tp.locator('.calm-day.calm-we').count() > 0, 'weekends shown'
        await tp.screenshot(path=SH + 'sept.png', full_page=True)
        dateOf = lambda k: tp.evaluate("(k) => { const c = document.querySelector('.kc-grid .kc-chip[data-key=' + k + ']'); return c ? c.closest('.calm-day').dataset.date : null; }", k)
        keysOn = lambda d: tp.evaluate("(d) => [...document.querySelectorAll('.calm-day[data-date=\"' + d + '\"] .kc-chip')].map(c => c.dataset.key)", d)
        # drag Lesson 4 onto Lesson 3's day: two in one day, everything after moves up a day
        d3, d5 = await dateOf('u1l3'), await dateOf('u1l5')
        await drag(tp, '.kc-chip[data-key=u1l4]', '.calm-day[data-date="%s"]' % d3)
        print(d3, await keysOn(d3)); assert await keysOn(d3) == ['u1l3', 'u1l4']
        d5b = await dateOf('u1l5'); print('L5 moved from', d5, 'to', d5b); assert d5b < d5
        # drag Lesson 5 two class days later: the days between stay empty, what follows falls in line
        days = await tp.evaluate("[...document.querySelectorAll('.kc-grid .calm-day:not(.calm-off):not(.calm-blank):not(.calm-we)')].map(c => c.dataset.date)")
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
        # keep all classes the same: copies now, then every change goes to every class
        await tp.check('.kc-sync input[type=checkbox]'); await tp.wait_for_timeout(900)
        a, d = get('action=cal&class=10c-b'), get('action=cal&class=10c-d'); assert a['cal'] == d['cal'] and a['sync'], 'synced'
        await drag(tp, '.kc-grid .kc-chip[data-key=u1l6b]', '.calm-day[data-date="%s"]' % (await dateOf('u1l6a')))
        await tp.wait_for_timeout(600); assert get('action=cal&class=10c-b')['cal'] == get('action=cal&class=10c-d')['cal'], 'a change goes to every class'
        await tp.uncheck('.kc-sync input[type=checkbox]'); await tp.wait_for_timeout(600); assert not get('action=cal&class=10c-b')['sync']
        # ---- the student ----
        urllib.request.urlopen(MOCK + '?action=setroster&key=testkey&class=10c-b&label=Block%20B&names=Ava%20Brown&mode=add').read()
        sp = await (await b.new_context(viewport={'width': 1280, 'height': 900})).new_page(); sp.on('pageerror', lambda e: errs.append('S ' + str(e)))
        await sp.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
        await sp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await sp.goto(BASE + '?class=10c-b'); await sp.wait_for_selector('.name-btn', timeout=10000)
        await sp.click('.name-btn:has-text("Ava Brown")'); pins = sp.locator('.field.pin'); await pins.nth(0).fill('1111'); await pins.nth(1).fill('1111')
        await sp.click('.btn-primary'); await sp.wait_for_selector('.lesson-row'); await sp.wait_for_selector('.hh-calbtn', timeout=10000)
        print('beside the greeting:', (await sp.inner_text('.home-head .hh-cal')).replace('\n', ' ')); assert await sp.locator('.top-right .hh-calbtn').count() == 0
        assert await sp.locator('.vtog').count() == 0, 'no toggle on the student home'
        await sp.screenshot(path=SH + 'student_home.png')
        await sp.click('.hh-calbtn'); await sp.wait_for_selector('.cal-pop .calv'); await sp.wait_for_timeout(300)
        await sp.screenshot(path=SH + 'student_pop.png')
        hd = await sp.evaluate("[...document.querySelectorAll('.cal-pop .calm-hd div')].map(d => d.textContent)"); assert hd[0] == 'Sun' and hd[6] == 'Sat', hd
        await sp.evaluate("document.querySelector('.cal-pop .calv').scrollToDate('2026-09-04')"); await sp.wait_for_timeout(300)
        t1 = await sp.inner_text('.cal-pop .calv-title'); print('header:', t1); assert t1.startswith('September')
        await sp.evaluate("document.querySelector('.cal-pop .calv').scrollToDate('2026-11-16')"); await sp.wait_for_timeout(300)
        t2 = await sp.inner_text('.cal-pop .calv-title'); print('header:', t2); assert t2.startswith('November')
        assert await sp.locator('.cal-pop .calm-grid').count() == 1, 'one continuous grid'
        await sp.evaluate("document.querySelector('.cal-pop .calv').scrollToDate('2026-09-04')"); await sp.wait_for_timeout(300)
        st4 = await sp.evaluate("[...document.querySelectorAll('.calm-day[data-date=\"2026-09-04\"] .calm-chip')].map(c => c.textContent)"); print('student Sept 4:', st4); assert len(st4) == 2
        assert 'No school' in await sp.inner_text('.calm-day[data-date="2026-09-07"]')
        await sp.keyboard.press('Escape'); assert await sp.locator('.cal-pop').count() == 0
        # the teaching site's All lessons: Lessons / Class calendar toggle, by block (the mock class is block C)
        get('action=setblock&key=testkey&class=10c-b&block=C')
        lp = await (await b.new_context(viewport={'width': 1180, 'height': 820})).new_page(); lp.on('pageerror', lambda e: errs.append('L ' + str(e)))
        await lp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await lp.goto(BASE + 'lessons/?class=C'); await lp.wait_for_selector('.hc-tog')
        assert (await lp.get_attribute('a.lcard >> nth=0', 'href')).endswith('?class=C')
        await lp.click('.hc-tog button:has-text("Class calendar")'); await lp.wait_for_selector('.hc-cal .calv', timeout=10000)
        assert await lp.locator('section.unit:visible').count() == 0
        href = await lp.get_attribute('.hc-cal a.calm-chip >> nth=0', 'href'); print('teaching chip:', href); assert href.endswith('?class=C')
        await lp.screenshot(path=SH + 'teaching.png')
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
