"""Open units + one retest at a time + opening several retests at once (2026-11-19), against the mock ledger.
The teacher ticks Units 1 and 2 under "Open units for retesting"; Ava (no practice done) gets "🔓 Request retest" on
Units 1-2 (Unit 4 stays locked), asks on Unit 1, and a second request (Unit 2) only shows a "one retest at a time" note.
Ben asks on Unit 2. The teacher selects both waiting requests and opens them together; both go to "Open now" and a
retest pops up on Ava's screen. Unticking a unit closes it; "All classes" ticks it in every class; an older stored form
of the open units still reads; a big TESTLIVE is split across script properties.
Needs python3 -m http.server <BASE port> (repo root) and a fresh mock (tests/restart_mock.sh). Screenshots /tmp/rto_*.png."""
import asyncio, json, urllib.request, urllib.parse, os, re
from playwright.async_api import async_playwright
exec(open(os.path.join(os.path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())
def stats(): return json.loads(urllib.request.urlopen(MOCK + '__stats').read())

async def rt_text(page, unit):
    return await page.evaluate("(u) => { const s = [...document.querySelectorAll('.unit')].find(x => (x.querySelector('.unit-num') || {}).textContent === 'Unit ' + u) || document.querySelectorAll('.unit')[u - 1]; const r = s && s.querySelector('.retest'); return r ? r.className + ' | ' + r.innerText.replace(/\\s+/g, ' ') : null; }", unit)
async def click_rt(page, unit):
    await page.evaluate("(u) => { const s = [...document.querySelectorAll('.unit')].find(x => (x.querySelector('.unit-num') || {}).textContent === 'Unit ' + u) || document.querySelectorAll('.unit')[u - 1]; s.querySelector('.rt-ask').click(); }", unit)
async def reload(page):
    await page.goto(BASE + '?class=10c-b'); await page.wait_for_selector('.lesson-row'); await page.wait_for_timeout(300)
async def wait_rt(page, unit, want, secs=15):
    for _ in range(secs * 4):
        t = await rt_text(page, unit)
        if t and want in t: return t
        await page.wait_for_timeout(250)
    raise AssertionError('Unit %d retest control never showed %r: %s' % (unit, want, await rt_text(page, unit)))

async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        a = await student(b, 'Ava Brown', '1111', errs)
        tok = await a.evaluate("HW.App.session().token")
        my = lambda: get('action=myretests&class=10c-b&name=Ava%20Brown&token=' + tok)
        for u in (1, 2, 4): t = await wait_rt(a, u, 'rt-locked'); assert '🔒' in t
        # ---- teacher ticks Units 1 and 2 ----
        tctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        nsf = os.path.join(os.path.dirname(__file__), '..', 'js', 'ns.js')   # js/ns.js prefixes this site's localStorage keys
        ns = (re.search(r"var P = '([^']*)'", open(nsf).read()) or [None, ''])[1] if os.path.exists(nsf) else ''
        await tctx.add_init_script("for (const [k, v] of [['hw:tkey','testkey'],['hw:tclass','10c-b'],['hw:ttab','retests']]) localStorage.setItem('%s' + k, v);" % ns)
        tp = await tctx.new_page(); tp.on('pageerror', lambda e: errs.append('teacher: ' + str(e)))
        dialogs = []
        def on_dialog(d): dialogs.append(d.message); asyncio.ensure_future(d.accept())
        tp.on('dialog', on_dialog)
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.rt-openings', timeout=15000)
        txt = await tp.inner_text('.rt-openings'); print('panel:', ' '.join(txt.split())); assert 'one retest' not in txt and 'Close' not in txt
        for u in (1, 2):
            await tp.click('.rt-opu:has-text("Unit %d") input' % u)
            await tp.wait_for_function("(u) => { const l = [...document.querySelectorAll('.rt-opu')].find(x => x.textContent.trim() === 'Unit ' + u); return l && !l.classList.contains('busy') && l.querySelector('input').checked; }", arg=u, timeout=10000)
        assert get('action=retests&key=testkey&class=10c-b')['open'] == [1, 2]
        await tp.screenshot(path='/tmp/rto_t_panel.png', clip={'x': 0, 'y': 0, 'width': 1400, 'height': 950})
        # ---- Ava: 🔓 Request retest on Units 1-2 ----
        await reload(a)
        for u in (1, 2): t = await wait_rt(a, u, 'rt-opened'); print('unit', u, ':', t); assert '🔓 Request retest' in t
        assert 'rt-locked' in await rt_text(a, 4)
        await a.evaluate("document.querySelector('.rt-ask-open').scrollIntoView({block: 'center'})"); await a.screenshot(path='/tmp/rto_s_open.png')
        await click_rt(a, 1); t = await wait_rt(a, 1, 'Retest requested'); print('asked unit 1:', t)
        assert 'rt-opened' in await rt_text(a, 2)   # still shows the button …
        await click_rt(a, 2)                            # … but only a note comes up
        await a.wait_for_selector('.rt-toast', timeout=3000); toast = await a.inner_text('.rt-toast'); print('toast:', toast)
        assert 'one retest at a time' in toast and 'Unit 1' in toast
        await a.screenshot(path='/tmp/rto_s_toast.png')
        await a.wait_for_selector('.rt-toast', state='detached', timeout=8000)
        m = my(); pend = [x for x in m['retests'] if x['status'] == 'requested']; assert len(pend) == 1 and pend[0]['grant'] == 'open' and m['open'] == [1, 2], m
        base = 'action=reqretest&class=10c-b&name=Ava%20Brown&token=' + tok
        r = get(base + '&unit=2&open=1'); assert r['error'] == 'pending' and r['unit'] == 1, r
        r = get(base + '&unit=4&open=1'); assert r['error'] == 'pending', r
        # ---- Ben asks on Unit 2 ----
        bn = await student(b, 'Ben Lee', '2222', errs)
        await wait_rt(bn, 2, 'rt-opened'); await click_rt(bn, 2); await wait_rt(bn, 2, 'Retest requested')
        # ---- the teacher opens both at once ----
        await tp.reload(); await tp.wait_for_selector('.rt-waiting .rt-ckone', timeout=15000)
        assert await tp.locator('.rt-waiting .rt-ckone').count() == 2
        rows = await tp.inner_text('.rt-waiting'); assert rows.count('Opened unit') == 2, rows
        await tp.click('.rt-selall'); await tp.wait_for_selector('.rt-bulk-go:has-text("Open 2 selected retests")')
        await tp.screenshot(path='/tmp/rto_t_bulk.png', full_page=True)
        await tp.click('.rt-bulk-go')
        await tp.wait_for_selector('.rt-open .rt-tbl', timeout=15000)
        print('confirm:', dialogs[-1].replace('\n', ' '))
        d = get('action=retests&key=testkey&class=10c-b'); st = {x['name']: x['status'] for x in d['retests']}; print('statuses:', st)
        assert st == {'Ava Brown': 'open', 'Ben Lee': 'open'}, st
        lv = d['live']; print('live keys:', sorted(lv)); assert sum(1 for k, v in lv.items() if v.get('who')) == 2
        await tp.screenshot(path='/tmp/rto_t_opened.png', full_page=True)
        await a.wait_for_selector('#tm-overlay, .tm-overlay, .tm-wrap, [class*="tm-"]', timeout=20000)
        print('Ava: the retest popped up')
        # ---- untick Unit 2: closed ----
        await tp.click('.rt-opu:has-text("Unit 2") input'); await tp.wait_for_timeout(1500)
        assert my()['open'] == [1]
        # ---- All classes ----
        get('action=setroster&key=testkey&class=10c-c&label=Block%20C&names=Cal%20Doe&mode=add')
        await tp.reload(); await tp.wait_for_selector('.rt-opall', timeout=15000)
        await tp.click('.rt-opall input'); await tp.click('.rt-opu:has-text("Unit 3") input'); await tp.wait_for_timeout(1500)
        assert get('action=retests&key=testkey&class=10c-c')['open'] == [3]
        assert get('action=retests&key=testkey&class=10c-b')['open'] == [1, 3]
        # ---- the older stored form still reads ----
        urllib.request.urlopen(MOCK + '__set?' + urllib.parse.urlencode({'RETESTOPEN': json.dumps({'10c-b': [{'id': 'Ox', 'units': [2, 3], 'at': 1}, {'id': 'Oy', 'units': [5], 'at': 2}]})}))
        assert my()['open'] == [2, 3, 5], my()['open']
        await b.close()
    errs = [e for e in errs if 'Cancel your retest' not in e]
    print('errors:', errs); assert not errs
    print('PASS')
asyncio.run(main())
