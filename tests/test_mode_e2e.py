"""Test mode end to end against the mock ledger: the teacher makes an exit slip in the dashboard and launches it; two signed-in
students get the pop-up, start it (full screen), answer, move back and forth (same numbers, answers kept); one leaves and is
locked, the teacher unlocks, the student carries on; both submit; the teacher closes, sees marks, releases; the student sees
the results on the home page. Then a no-calculator test (orange) for screenshots.
Needs python3 -m http.server 8811 (repo root) and a fresh mock (tests/restart_mock.sh). Screenshots in /tmp/tm_*.png."""
import asyncio, json, urllib.request
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
SHOTS = '/tmp/'

async def student(b, name, pin, errs, medal_pops=False):
    ctx = await b.new_context(viewport={'width': 1280, 'height': 860})
    if not medal_pops:   # "New medal!" pop-ups would cover the page these tests click on (tests/medals_home_test.py covers them)
        await ctx.add_init_script("addEventListener('DOMContentLoaded', () => { if (window.HW && HW.Medals) HW.Medals.open = function () {}; })")
    await ctx.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    await ctx.route('**/script.google.com/**', lambda r: r.abort())
    page = await ctx.new_page()
    page.on('pageerror', lambda e: errs.append(name + ': ' + str(e)))
    page.on('dialog', lambda d: errs.append(name + ': unexpected dialog ' + d.message))
    await page.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
    await page.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
    await page.goto(BASE + '?class=10c-b'); await page.wait_for_selector('.name-btn', timeout=10000)
    await page.click('.name-btn:has-text("%s")' % name)
    pins = page.locator('.field.pin'); await pins.nth(0).fill(pin); await pins.nth(1).fill(pin)
    await page.click('.btn-primary'); await page.wait_for_selector('.lesson-row')
    return page

async def state(page):
    return await page.evaluate("""() => { const T = HW.TestMode._state(); if (!T) return null;
      return { view: T.ui && T.ui.dataset.view, st: T.rec && T.rec.st, cur: T.cur, n: T.order && T.order.length, ans: T.rec ? Object.keys(T.rec.ans).length : 0,
        prompt: (document.querySelector('#testmode .qprompt') || {}).textContent || '', fs: !!document.fullscreenElement, kind: T.def.kind }; }""")

async def wait_view(page, view, secs=20):
    for _ in range(secs * 4):
        s = await state(page)
        if s and s['view'] == view: return s
        await page.wait_for_timeout(250)
    raise AssertionError('never reached view %s: %s' % (view, await state(page)))

async def answer(page, right, part=0):
    # a part on the current page: put the key (or a wrong answer) in through the widget itself
    return await page.evaluate("""([right, part]) => { const T = HW.TestMode._state(), sl = T.widgets[part], x = T.byKey[sl.key], w = sl.w;
      let v = x.inst.key; if (!right) { v = Array.isArray(v) ? [1, 999] : typeof v === 'string' ? '999' : (x.inst.input.type === 'mc' ? x.inst.input.options.map(o => o.key).find(k => k !== v) : v); }
      w.set(v); return { type: x.inst.input.type, key: JSON.stringify(x.inst.key) }; }""", [right, part])

async def main():
    urllib.request.urlopen(MOCK + '?action=setroster&key=testkey&class=10c-b&label=Block%20B&names=Ava%20Brown%0ABen%20Lee%0ARyan%20Cathcart&mode=add').read()
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # ---- teacher builds an exit slip in the dashboard ----
        tctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        await tctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','exits');")
        tp = await tctx.new_page()
        tp.on('pageerror', lambda e: errs.append('teacher: ' + str(e)))
        tp.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.tt-new-exit', timeout=15000)
        await tp.click('.tt-new-exit'); await tp.wait_for_selector('.tt-part')
        await tp.fill('.tt-settings input.field', 'Exit slip 1.1')
        boxes = tp.locator('.tt-part input[type=checkbox]:not([disabled])')
        for i in range(2): await boxes.nth(i).check()   # 1(a) and 1(b): one page
        k2 = await tp.evaluate("[...document.querySelectorAll('.tt-part')].findIndex(p => /^2\\b/.test(p.querySelector('.tt-part-meta b').textContent) && !p.querySelector('input').disabled)")
        await tp.locator('.tt-part input[type=checkbox]').nth(k2).check()   # a part of question 2: the next page
        assert await tp.locator('.tt-chosen-list li').count() == 3
        await tp.screenshot(path=SHOTS + 'tm_t_editor.png')
        await tp.click('.tt-top .btn-primary:has-text("Save")'); await tp.wait_for_selector('.tt-card')
        # students sign in and sit on the home page
        a = await student(b, 'Ava Brown', '1111', errs); bn = await student(b, 'Ben Lee', '2222', errs)
        await tp.click('.tt-card .btn-primary'); await tp.wait_for_selector('.tt-live-head', timeout=15000)
        # ---- the pop-up ----
        s = await wait_view(a, 'pending'); await wait_view(bn, 'pending')
        await a.screenshot(path=SHOTS + 'tm_s_pending.png')
        assert 'Ava Brown' in await a.inner_text('#testmode .tm-name')
        await a.click('.tm-start'); s = await wait_view(a, 'test')
        print('Ava started:', s)
        parts = await a.locator('#testmode .tm-part').count(); assert parts == 2, 'question 1 should show both parts: %d' % parts
        r1 = await answer(a, True, 0); await answer(a, False, 1); await a.wait_for_timeout(700)
        p1 = (await state(a))['prompt']
        await a.click('#testmode .qactions .btn-primary'); await a.wait_for_timeout(300)   # Next question
        await a.click('#testmode .tm-qn >> nth=0'); await a.wait_for_timeout(300)          # back to Q1
        s = await state(a); assert s['prompt'] == p1, 'numbers changed going back'
        kept = await a.evaluate("() => { const T = HW.TestMode._state(); return T.widgets.every(sl => JSON.stringify(sl.w.value()) === JSON.stringify(T.rec.ans[sl.key].r)); }")
        assert kept, 'answer not restored'
        assert s['ans'] == 2, s
        await a.screenshot(path=SHOTS + 'tm_s_writing.png')
        # ---- Ben starts, then leaves the window ----
        await bn.click('.tm-start'); await wait_view(bn, 'test')
        await answer(bn, True, 0); await bn.wait_for_timeout(1500)
        await bn.evaluate("HW.TestMode._leave('clicked out of the test window')")
        s = await wait_view(bn, 'end'); assert s['st'] == 'left', s
        await bn.screenshot(path=SHOTS + 'tm_s_locked.png')
        # ---- teacher sees it live and unlocks Ben ----
        for _ in range(40):
            txt = await tp.inner_text('.tt-live')
            if 'Locked' in txt and 'Writing' in txt: break
            await tp.wait_for_timeout(500)
        print('live table:\n' + txt)
        await tp.screenshot(path=SHOTS + 'tm_t_live.png')
        await tp.click('.tt-live tr:has-text("Ben Lee") .btn:has-text("Unlock")')
        await wait_view(bn, 'unlocked', 25); await bn.click('.tm-start'); s = await wait_view(bn, 'test')
        assert s['ans'] == 1, 'Ben lost his answer: %s' % s
        # ---- both submit ----
        for pg in (a, bn):
            await pg.click('#testmode .tm-submit'); await pg.click('.tm-modal .btn-primary'); s = await wait_view(pg, 'end'); assert s['st'] == 'submitted', s
        await a.screenshot(path=SHOTS + 'tm_s_submitted.png')
        await tp.wait_for_timeout(5500)
        await tp.click('.tt-live-head .btn-primary:has-text("Close")'); await tp.wait_for_selector('.tt-res', timeout=15000)
        res = await tp.evaluate("[...document.querySelectorAll('.tt-res tbody tr')].map(r => r.innerText.replace(/\\s+/g, ' '))")
        print('results:', res)
        ava = [r for r in res if r.startswith('Ava')][0]; assert '1 / 3' in ava and '✓ ✗ –' in ava, ava
        await tp.click('.tt-m >> nth=1'); await tp.wait_for_selector('#tt-detail .tt-dbox')   # the answer pop-up
        await tp.screenshot(path=SHOTS + 'tm_t_results.png', full_page=True)
        await tp.keyboard.press('Escape'); assert await tp.locator('#tt-detail').count() == 0
        await tp.click('.tt-top .btn-primary:has-text("Release")'); await tp.wait_for_timeout(1500)
        # ---- Ava sees her results ----
        await a.goto(BASE + '?class=10c-b'); await a.wait_for_selector('.tm-res-card', timeout=15000)
        await a.click('.tm-res-card'); await a.wait_for_selector('.tm-res-big')
        big = await a.inner_text('.tm-res-big'); assert big.strip() == '1 / 3', big
        await a.screenshot(path=SHOTS + 'tm_s_results.png', full_page=True)
        # ---- a no-calculator test (orange) for the picture ----
        urllib.request.urlopen(MOCK + '?action=savetest&key=testkey&def=' + urllib.request.quote(json.dumps({'title': 'Unit 1 Quiz', 'kind': 'test', 'minutes': 30, 'calc': False, 'items': [{'l': 'u1l2', 'i': x} for x in ['1a', '1b', '2a']]}))).read()
        tests = json.loads(urllib.request.urlopen(MOCK + '?action=tests&key=testkey').read())['tests']
        tid = [t for t in tests if t['title'] == 'Unit 1 Quiz'][0]['id']
        urllib.request.urlopen(MOCK + '?action=launch&key=testkey&class=10c-b&test=' + tid).read()
        await a.goto(BASE + '?class=10c-b'); await wait_view(a, 'pending', 25)
        await a.screenshot(path=SHOTS + 'tm_s_pending_test.png')
        await a.click('.tm-start'); await wait_view(a, 'test')
        has_calc = await a.locator('#testmode .tm-calc').count()
        assert has_calc == 0, 'calculator shown on a no-calculator test'
        await a.screenshot(path=SHOTS + 'tm_s_writing_test.png')
        await b.close()
    print('errors:', errs)
    assert not errs
    print('PASS')
asyncio.run(main())
