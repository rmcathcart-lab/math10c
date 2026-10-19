"""Needs python3 -m http.server 8811 and tests/restart_mock.sh. Ledger UI polish: scope toggle in tabs, Progress unit drill-down, Student collapsible units, grouped lesson picker, no tab scrollbar."""
import asyncio, json, time, random
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
SH = '/tmp/ledger_'
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        await ctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','progress');")
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        # build attempts from the real lesson items once the page has loaded the lessons
        await pg.goto(BASE + 'teacher/'); await pg.wait_for_selector('.tbl.prog', timeout=15000)
        items = await pg.evaluate("""() => { const o = []; ['u1l1','u1l2','u2l1'].forEach(id => { const l = HW.lessons[id]; l.items.forEach(it => o.push([id, it.id, it.outcome, it.level, it.extra ? 1 : 0])); }); return o; }""")
        now = int(time.time() * 1000); att = []
        random.seed(3)
        for name, frac in (('Ava Brown', .8), ('Ben Lee', .4)):
            for k, (l, i, o, lv, ex) in enumerate(items):
                r = random.random()
                if r > frac: continue
                t = now - 100000 + k * 10
                if random.random() < .3: att.append([t, name, l, i, o, lv, ex, 0, '', 'wrong', 'value', '', '999', '', 1])
                att.append([t + 1, name, l, i, o, lv, ex, 0, '', 'correct', '', '', '42', '', 1 if random.random() < .7 else 0])
        async def dash(route):
            resp = await route.fetch(); d = await resp.json()
            if d.get('ok') and 'attempts' in d: d['attempts'] = d['attempts'] + att
            await route.fulfill(status=200, content_type='application/json', body=json.dumps(d))
        await pg.route('**/localhost:8765/?action=dash*', dash)
        await pg.reload(); await pg.wait_for_selector('.tbl.prog')
        # header: no scope toggle, Teacher Ledger
        assert await pg.locator('#topbar .seg').count() == 0
        assert 'Teacher Ledger' in await pg.inner_text('#topbar') and await pg.title() == 'Teacher Ledger'
        # tabs: no vertical scroll
        sc = await pg.evaluate("(() => { const t = document.querySelector('.tabs'); return [t.scrollHeight, t.clientHeight, getComputedStyle(t).overflowY]; })()")
        print('tabs', sc); assert sc[2] == 'hidden'
        heads = await pg.evaluate("[...document.querySelectorAll('.tbl.prog thead th')].map(t => t.innerText.replace(/\\s+/g,' '))"); print(heads)
        assert any(h.upper().startswith('UNIT 1') for h in heads) and not any(h.upper().startswith('LESSON') for h in heads)
        await pg.screenshot(path=SH + 'p1.png')
        await pg.click('tr.prow:has-text("Ava Brown") td.uc[data-u="1"]'); await pg.wait_for_selector('tr.pdrop .pd-l')
        n = await pg.locator('tr.pdrop .pd-l').count(); print('unit 1 lessons', n)
        await pg.click('tr.pdrop .pd-l >> nth=0'); await pg.wait_for_selector('tr.pdrop .item-grid .ig')
        await pg.screenshot(path=SH + 'p2.png')
        # survives a refresh of the data
        await pg.evaluate("HW.Dash.render()"); assert await pg.locator('tr.pdrop .item-grid').count() == 1
        # scope toggle changes counts
        a1 = await pg.inner_text('tr.prow:has-text("Ava Brown") td.uc[data-u="1"] .pnum')
        await pg.click('.scope-seg button:has-text("All work")'); a2 = await pg.inner_text('tr.prow:has-text("Ava Brown") td.uc[data-u="1"] .pnum')
        print('in class', a1, '| all', a2)
        # questions
        await pg.click('.tab:has-text("Questions")'); await pg.wait_for_selector('.tbl.items')
        og = await pg.evaluate("[...document.querySelectorAll('.opt-row select optgroup')].map(g => g.label + ' (' + g.children.length + ')')"); print(og)
        assert len(og) >= 2 and await pg.locator('.opt-row .scope-seg').count() == 1
        await pg.screenshot(path=SH + 'p3.png')
        await pg.click('.tab:has-text("Outcomes")'); assert await pg.locator('.opt-row .scope-seg').count() == 1
        await pg.click('.tab:has-text("Tests")'); await pg.wait_for_timeout(500); assert await pg.locator('.scope-seg').count() == 0
        # student
        await pg.click('.tab:has-text("Student")'); await pg.select_option('.opt-row select', 'Ava Brown'); await pg.wait_for_selector('.su')
        await pg.screenshot(path=SH + 'p4.png', full_page=True)
        assert not await pg.locator('.su >> nth=0').evaluate("e => e.classList.contains('open')")
        await pg.click('.su-head >> nth=0'); assert await pg.locator('.su.open .sl').count() >= 1
        await pg.screenshot(path=SH + 'p5.png', full_page=True)
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
