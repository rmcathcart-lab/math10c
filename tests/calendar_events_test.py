"""Calendar: make one with the month picker; add a cumulative exam (lessons that day move to the next class day, it shows on
the teacher's and students' calendars and counts as the next test); change it; Start over with the picker keeps it;
remove it. Undo has no icon. Mock + static server. Screenshots /tmp/ce_*.png."""
import asyncio, json, urllib.request
from playwright.async_api import async_playwright
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())
def cal(): return get('action=cal&class=10c-b')['cal']
async def cell(tp, d): return await tp.evaluate("(d) => { const c = document.querySelector('.kc-grid .calm-day[data-date=\"' + d + '\"]'); return c ? [...c.querySelectorAll('.calm-chip')].map(x => x.innerText.replace(/\\s+/g, ' ')) : null; }", d)
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        tctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        await tctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','calendar');")
        tp = await tctx.new_page(); tp.on('pageerror', lambda e: errs.append('T ' + str(e))); tp.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.kc-start .calp', timeout=15000)
        await tp.click('.kc-start .btn-primary:has-text("Make the calendar")'); await tp.wait_for_selector('.kc-grid')
        c0 = cal(); print('made, start', c0['start'])
        ub = await tp.inner_text('.kc-top .btn:has-text("Undo")'); assert ub.strip() == 'Undo', ub
        before = await cell(tp, '2026-10-22'); print('Oct 22 before:', before)
        # add a cumulative exam on Thu Oct 22
        await tp.click('.kc-add'); await tp.wait_for_selector('#kc-modal .calp')
        await tp.fill('.kc-ev-title', 'Cumulative exam')
        await tp.click('#kc-modal .calp-day[data-date="2026-10-22"]')
        await tp.screenshot(path='/tmp/ce_add.png')
        await tp.click('#kc-modal .kc-ok'); await tp.wait_for_timeout(1200)
        after = await cell(tp, '2026-10-22'); nxt = await cell(tp, '2026-10-23'); print('Oct 22 after:', after, '| Oct 23:', nxt)
        assert after == ['Cumulative exam Exam · no lesson'], after
        assert before and before[0].split(' ')[0:3] == nxt[0].split(' ')[0:3], (before, nxt)
        c1 = cal(); print('saved events:', c1.get('events')); assert c1['events'][0]['title'] == 'Cumulative exam' and c1['events'][0]['takes']
        await tp.locator('.kc-grid').screenshot(path='/tmp/ce_grid.png')
        # students: on the calendar, and the next test
        a = await student(b, 'Ava Brown', '1111', errs); await a.wait_for_timeout(1500)
        nt = await a.inner_text('.hh-test'); print('student next test:', nt); assert 'Cumulative exam' in nt
        await a.click('.hh-calbtn'); await a.wait_for_selector('.cal-pop .calm-ev')
        await a.screenshot(path='/tmp/ce_student.png')
        # change it: an event that doesn't take the class
        await tp.click('.kc-grid .kc-evchip'); await tp.wait_for_selector('#kc-modal')
        await tp.fill('.kc-ev-title', 'Assembly (short class)'); await tp.click('#kc-modal input[value="event"]'); await tp.uncheck('#kc-modal .kc-takes input')
        await tp.click('#kc-modal .kc-ok'); await tp.wait_for_timeout(1200)
        after2 = await cell(tp, '2026-10-22'); print('Oct 22 as an event:', after2); assert after2[0].startswith('Assembly (short class) Event') and len(after2) == 2, after2
        # start over from Sep 8 with the picker: the entry stays
        await tp.click('.kc-top .btn:has-text("Start over")'); await tp.wait_for_selector('#kc-modal .calp')
        for _ in range(3):
            if await tp.locator('#kc-modal .calp-day[data-date="2026-09-08"]').count(): break
            await tp.click('#kc-modal .calp-nav >> nth=0')
        await tp.click('#kc-modal .calp-day[data-date="2026-09-08"]'); await tp.click('#kc-modal .kc-ok'); await tp.wait_for_timeout(1200)
        c2 = cal(); print('start over:', c2['start'], 'events', len(c2.get('events', []))); assert c2['start'] == '2026-09-08' and len(c2['events']) == 1
        # remove it
        await tp.click('.kc-grid .kc-evchip'); await tp.click('#kc-modal .kc-del'); await tp.wait_for_timeout(1200)
        assert not cal().get('events'); print('removed')
        await b.close()
    print('errors:', errs); assert not errs; print('PASS')
asyncio.run(main())
