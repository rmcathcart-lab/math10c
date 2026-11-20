"""Results pages and the results grid (Ryan, 2026-11-19), against the mock ledger:
- student: the newest released result is a chip beside "Next test" ("New result" until opened); the name opens a menu
  (Your tests / Your exit slips / Your stats); "Your tests" lists it; the results page's crumb leads back to the list;
- teacher grid: the first 3 + outcome columns stay put when scrolling sideways; headings sort (Unit grade highest
  first, again to flip); a hovered row deepens its colours instead of going grey;
- tests list: no "Undo edits" button on a row; "Undo all edits" is in the editor and brings the original back.
Needs python3 -m http.server <BASE port> + a fresh mock (tests/restart_mock.sh). Screenshots /tmp/rui_*.png"""
import asyncio, json, os, re, urllib.request
from playwright.async_api import async_playwright
exec(open(os.path.join(os.path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())
FILL = """(frac) => { const T = HW.TestMode._state(); let n = 0;
  for (let p = 0; p < T.pages.length; p++) { document.querySelectorAll('#testmode .tm-qn')[p].click();
    T.widgets.forEach((sl, i) => { const x = T.byKey[sl.key]; n++; if ((n * 7919) % 100 < frac * 100) { try { sl.w.set(x.inst.key); } catch (e) {} } }); }
  document.querySelectorAll('#testmode .tm-qn')[0].click(); return n; }"""
async def main():
    errs = []
    get('action=setroster&key=testkey&class=10c-b&label=Block%20B&names=Ava%20Brown%0ABen%20Lee%0ACal%20Diaz&mode=add')
    nsf = os.path.join(os.path.dirname(__file__), '..', 'js', 'ns.js')
    ns = (re.search(r"var P = '([^']*)'", open(nsf).read()) or [None, ''])[1] if os.path.exists(nsf) else ''
    async with async_playwright() as p:
        b = await p.chromium.launch()
        a = await student(b, 'Ava Brown', '1111', errs); bn = await student(b, 'Ben Lee', '2222', errs)
        tid_lesson = await a.evaluate("Object.keys(HW.lessons).filter(k => HW.lessons[k].test && !HW.lessons[k].exit && HW.lessons[k].unit === 1).sort((x, y) => x.length - y.length)[0]")
        items = await a.evaluate("(k) => HW.lessons[k].items.slice(0, 14).map(it => ({ l: k, i: it.id }))", tid_lesson)
        get('action=savetest&key=testkey&def=' + urllib.request.quote(json.dumps({'title': 'Grid test', 'kind': 'test', 'unit': 1, 'minutes': 75, 'items': items})))
        tid = [t for t in get('action=tests&key=testkey')['tests'] if t['title'] == 'Grid test'][0]['id']
        sid = get('action=launch&key=testkey&class=10c-b&test=' + tid)['live']['id']
        for pg, frac in ((a, 0.4), (bn, 0.9)):
            await wait_view(pg, 'pending', 25); await pg.click('.tm-start'); await wait_view(pg, 'test')
            await pg.evaluate(FILL, frac); await pg.wait_for_timeout(500)
            await pg.click('#testmode .tm-submit'); await pg.click('.tm-modal .btn-primary'); await wait_view(pg, 'end')
        await a.wait_for_timeout(3000)
        get('action=tctl&key=testkey&class=10c-b&op=close')
        # ---- teacher: the grid ----
        tctx = await b.new_context(viewport={'width': 1100, 'height': 900})
        await tctx.add_init_script("for (const [k, v] of [['hw:tkey','testkey'],['hw:tclass','10c-b'],['hw:ttab','tests']]) localStorage.setItem('%s' + k, v);" % ns)
        await tctx.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        tp = await tctx.new_page(); tp.on('pageerror', lambda e: errs.append('T ' + str(e))); tp.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.tt-card', timeout=15000)
        await tp.click('.tt-card:has-text("Grid test") .tt-given'); await tp.wait_for_selector('.tt-res')
        order = lambda: tp.evaluate("[...document.querySelectorAll('.tt-res tbody tr:not(.tt-foot)')].map(r => r.cells[0].innerText.trim())")
        print('by name:', await order()); assert (await order())[:3] == ['Ava Brown', 'Ben Lee', 'Cal Diaz']
        await tp.click('.tt-res th[data-s="unit"]'); await tp.wait_for_timeout(200)
        o = await order(); print('by unit grade:', o); assert o[:3] == ['Ben Lee', 'Ava Brown', 'Cal Diaz'], o
        assert '▼' in await tp.inner_text('.tt-res th[data-s="unit"]')
        await tp.click('.tt-res th[data-s="unit"]'); await tp.wait_for_timeout(200)
        o = await order(); print('flipped:', o); assert o[:3] == ['Ava Brown', 'Ben Lee', 'Cal Diaz'], o
        await tp.eval_on_selector('.tt-res th[data-s="q:0"]', 'h => h.click()'); await tp.wait_for_timeout(200); print('by Q1:', await order())
        await tp.click('.tt-res th[data-s="name"]'); await tp.wait_for_timeout(200)
        # frozen columns
        x0 = await tp.evaluate("(() => { const r = document.querySelector('.tt-res tbody tr').cells; return [...r].slice(0, 4).map(c => Math.round(c.getBoundingClientRect().left)); })()")
        sw = await tp.evaluate("(() => { const w = document.querySelector('.tt-res-wrap'); w.scrollLeft = 400; return [w.scrollWidth, w.clientWidth, w.scrollLeft]; })()")
        await tp.wait_for_timeout(100)
        x1 = await tp.evaluate("(() => { const r = document.querySelector('.tt-res tbody tr').cells; return [...r].slice(0, 4).map(c => Math.round(c.getBoundingClientRect().left)); })()")
        q1 = await tp.evaluate("(() => { const c = document.querySelector('.tt-res tbody tr .tt-m'); return Math.round(c.getBoundingClientRect().left); })()")
        print('scroll', sw, 'frozen before', x0, 'after', x1, 'first mark at', q1); assert sw[2] > 0 and x0 == x1
        await tp.screenshot(path='/tmp/rui_t_scrolled.png')
        # hover: marks keep (deepen) their colour
        cell = '.tt-res tbody tr:has-text("Ben Lee") .tt-m.m-C, .tt-res tbody tr:has-text("Ben Lee") .tt-m.m-c'
        bg0 = await tp.eval_on_selector(cell, "c => getComputedStyle(c).backgroundColor")
        await tp.hover('.tt-res tbody tr:has-text("Ben Lee") td.tt-stk >> nth=1'); await tp.wait_for_timeout(100)
        bg1 = await tp.eval_on_selector(cell, "c => getComputedStyle(c).backgroundColor")
        print('right-answer cell:', bg0, '→ hovered', bg1); assert bg0 != bg1 and bg1 not in ('rgb(251, 250, 247)', 'rgb(241, 237, 228)')
        await tp.screenshot(path='/tmp/rui_t_hover.png')
        await tp.evaluate("document.querySelector('.tt-res-wrap').scrollLeft = 0")
        await tp.click('.tt-top .btn-primary:has-text("Release")'); await tp.wait_for_timeout(1500)
        # ---- student: chip, menu, list, crumb ----
        await bn.goto(BASE + '?class=10c-b'); await bn.wait_for_selector('.latest-res', timeout=15000)
        chip = await bn.inner_text('.latest-res'); print('chip:', chip); assert 'New result' in chip and 'Grid test' in chip
        assert await bn.locator('.tm-home-list').count() == 0
        await bn.screenshot(path='/tmp/rui_s_home.png')
        await bn.click('.who'); await bn.wait_for_selector('.who-menu:not([hidden])')
        menu = await bn.inner_text('.who-menu'); print('menu:', ' / '.join(menu.split('\n'))); assert 'Your tests' in menu and 'Your exit slips' in menu and 'Your stats' in menu
        await bn.screenshot(path='/tmp/rui_s_menu.png')
        await bn.keyboard.press('Escape'); assert await bn.locator('.who-menu[hidden]').count() == 1
        await bn.click('.who'); await bn.click('.who-item:has-text("Your tests")'); await bn.wait_for_selector('.rl-row')
        row = await bn.inner_text('.rl-row'); print('list row:', ' | '.join(row.split('\n'))); assert 'New' in row
        await bn.screenshot(path='/tmp/rui_s_list.png')
        await bn.click('.rl-row'); await bn.wait_for_selector('.tm-res-big')
        crumb = await bn.inner_text('.crumb'); print('crumb:', crumb); assert 'Your tests' in crumb
        await bn.click('.crumb a:has-text("Your tests")'); await bn.wait_for_selector('.rl-row'); assert 'New' not in await bn.inner_text('.rl-row')
        await bn.goto(BASE + '#/exits'); await bn.wait_for_selector('.rl-empty'); print('exit slips:', await bn.inner_text('.rl-empty'))
        await bn.goto(BASE + '#/'); await bn.wait_for_selector('.latest-res'); chip = await bn.inner_text('.latest-res'); print('chip now:', chip); assert 'Latest result' in chip
        await bn.click('.who'); await bn.click('.who-item:has-text("Your stats")'); await bn.wait_for_timeout(500); assert bn.url.endswith('#/me')
        # ---- tests list: Undo all edits lives in the editor ----
        await tp.click('.tt-back'); await tp.wait_for_selector('.tt-card')
        first = tp.locator('.tt-card.tt-card-ready').first; title = await first.locator('.tt-title').inner_text()
        await first.locator('.btn:has-text("Edit")').click(); await tp.wait_for_selector('.tt-settings')
        assert await tp.locator('.tt-undo').count() == 0
        await tp.click('.tt-chosen-list li .btn:has-text("✕") >> nth=0'); await tp.click('.tt-acts .btn-primary:has-text("Save")'); await tp.wait_for_selector('.tt-card')
        card = tp.locator('.tt-card:has(.tt-edited)').first; acts = await card.locator('.tt-card-acts').inner_text(); print('edited row buttons:', ' '.join(acts.split()))
        assert 'Undo' not in acts
        await card.locator('.btn:has-text("Edit")').click(); await tp.wait_for_selector('.tt-undo')
        await tp.screenshot(path='/tmp/rui_t_editor.png')
        await tp.click('.tt-undo'); await tp.wait_for_selector('.tt-card'); await tp.wait_for_timeout(500)
        assert await tp.locator('.tt-edited').count() == 0, 'still edited'
        print('undo all edits: back to the original', title.strip())
        await b.close()
    print('errors', errs); assert not errs
    print('PASS')
asyncio.run(main())
