"""Grading in the results grid for a TEST (the Unit 1 Test): indicators per outcome, partial credit, a teacher-set
indicator, release, and the student's results page. Mock; needs 8811 + tests/restart_mock.sh. Screenshots /tmp/tm_g_*.png"""
import asyncio, json, os, urllib.request
from playwright.async_api import async_playwright
exec(open(os.path.join(os.path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())
FILL = """(frac) => { const T = HW.TestMode._state(); let n = 0;
  for (let p = 0; p < T.pages.length; p++) { document.querySelectorAll('#testmode .tm-qn')[p].click();
    T.widgets.forEach((sl, i) => { const x = T.byKey[sl.key]; n++; if ((n * 7919) % 100 < frac * 100) { try { sl.w.set(x.inst.key); } catch (e) {} } }); }
  document.querySelectorAll('#testmode .tm-qn')[0].click(); return n; }"""
async def main():
    errs = []
    get('action=setroster&key=testkey&class=10c-b&label=Block%20B&names=Ava%20Brown%0ABen%20Lee&mode=add')
    items = [{'l': 'u1test', 'i': i} for i in ['1a','1b','2','3','4a','4b','4c','4d','5','6','7a','7b','8a','8b','9','10','11ai','11aii','11bi','11bii','12','13','14a','14b','15','16a','16b','17a','17b','17c','18a','18b','19a','19b','19c','20a','20b','20c','21a','21b','21c','21d','22a','22b','23','24ia','24ib','24iia','24iib']]
    get('action=savetest&key=testkey&def=' + urllib.request.quote(json.dumps({'title': 'Unit 1 Test', 'kind': 'test', 'unit': 1, 'minutes': 75, 'items': items})))
    tid = [t for t in get('action=tests&key=testkey')['tests'] if t['title'] == 'Unit 1 Test'][0]['id']
    sid = get('action=launch&key=testkey&class=10c-b&test=' + tid)['live']['id']
    async with async_playwright() as p:
        b = await p.chromium.launch()
        a = await student(b, 'Ava Brown', '1111', errs); bn = await student(b, 'Ben Lee', '2222', errs)
        for pg, frac in ((a, 1.0), (bn, 0.6)):
            await wait_view(pg, 'pending', 25); await pg.click('.tm-start'); await wait_view(pg, 'test')
            print('filled', await pg.evaluate(FILL, frac))
            await pg.wait_for_timeout(600); print('state', await state(pg))
            await pg.click('#testmode .tm-submit'); await pg.click('.tm-modal .btn-primary'); await wait_view(pg, 'end')
        await a.wait_for_timeout(3000)
        get('action=tctl&key=testkey&class=10c-b&op=close')
        tctx = await b.new_context(viewport={'width': 1500, 'height': 1000})
        await tctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','tests');")
        await tctx.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        tp = await tctx.new_page(); tp.on('pageerror', lambda e: errs.append('T ' + str(e))); tp.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.tt-card', timeout=15000)
        await tp.click('.panel tr:has-text("Unit 1 Test") .btn:has-text("Results")'); await tp.wait_for_selector('.tt-res')
        rows = await tp.evaluate("[...document.querySelectorAll('.tt-res tbody tr')].map(r => [...r.querySelectorAll('td')].slice(0, 5).map(td => td.innerText.replace(/\\s+/g, ' ').trim()).join(' | '))")
        for r in rows: print('ROW', r)
        await tp.screenshot(path='/tmp/tm_g_results.png')
        # Ben: set AN2 by hand, mark one part as a small mistake
        await tp.select_option('.tt-res tr:has-text("Ben Lee") .tt-osel >> nth=1', 'PRG')
        await tp.click('.tt-res tr:has-text("Ben Lee") .tt-m.m-b >> nth=0'); await tp.click('#tt-detail .btn:has-text("Small mistake")')
        await tp.wait_for_timeout(300); await tp.keyboard.press('Escape')
        print('Ben after edits:', (await tp.inner_text('.tt-res tr:has-text("Ben Lee")')).replace('\n', ' ')[:200])
        await tp.click('.tt-top .btn-primary:has-text("Release")'); await tp.wait_for_timeout(1500)
        rows = get('action=tresults&key=testkey&session=' + sid)['rows']
        print('saved marks:', [(r['name'], r['marks'][-12:], r['score'], r['total']) for r in rows])
        await bn.goto(BASE + '?class=10c-b'); await bn.wait_for_selector('.tm-res-card', timeout=15000)
        print('home card:', (await bn.inner_text('.tm-res-card')).replace('\n', ' | '))
        await bn.click('.tm-res-card'); await bn.wait_for_selector('.tm-res-big')
        print('student sees:', (await bn.inner_text('.tm-res-head')).replace('\n', ' | '))
        await bn.screenshot(path='/tmp/tm_g_student.png')
        await b.close()
    print('errors', errs); assert not errs
asyncio.run(main())
