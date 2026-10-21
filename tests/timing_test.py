"""Tests and exit slips "until the end of class" (the default): the ledger sets endsAt to the end of the class period on the
bell schedule; the student sees "until the end of class (time)" and a countdown, and is submitted when the period ends.
Also: Settings → Class times saves (setbell) and the editor shows the three choices. Mock + static server."""
import asyncio, json, urllib.request, urllib.parse, time
from playwright.async_api import async_playwright
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())
async def main():
    errs = []
    # block B runs all day, every day (A, C, D squeezed into the corners)
    bell = {k: [['A', '00:00', '00:01'], ['B', '00:02', '23:56'], ['C', '23:57', '23:58'], ['D', '23:58', '23:59']] for k in ['day1', 'day2', 'fri']}
    r = get('action=setbell&key=testkey&bell=' + urllib.parse.quote(json.dumps(bell))); assert r['ok'], r
    bad = get('action=setbell&key=testkey&bell=' + urllib.parse.quote(json.dumps({'day1': [['A', '10:00', '09:00']], 'day2': [], 'fri': []}))); assert not bad['ok'], bad
    assert get('action=classes&key=testkey')['bellCustom'] is True
    get('action=setblock&key=testkey&class=10c-b&block=B')
    get('action=savetest&key=testkey&def=' + urllib.parse.quote(json.dumps({'title': 'Exit slip 2.2', 'kind': 'exit', 'calc': True, 'items': [{'l': 'u2l2', 'i': '1a'}]})))
    tests = get('action=tests&key=testkey')['tests']; t = [x for x in tests if x['title'] == 'Exit slip 2.2'][0]
    print('saved timing:', t['def'].get('timing')); assert t['def'].get('timing') == 'period'
    lv = get('action=launch&key=testkey&class=10c-b&test=' + t['id'])['live']; print('endsAt:', time.strftime('%H:%M', time.localtime(lv['endsAt'] / 1000)))
    assert time.strftime('%H:%M', time.localtime(lv['endsAt'] / 1000)) == '23:56', lv
    async with async_playwright() as p:
        b = await p.chromium.launch()
        a = await student(b, 'Ava Brown', '1111', errs)
        await wait_view(a, 'pending', 25)
        txt = await a.inner_text('#testmode'); print('rules:', [l for l in txt.split('\n') if 'question' in l][:1]); assert 'until the end of class (11:56' in txt, txt
        await a.click('.tm-start'); await wait_view(a, 'test')
        timer = await a.inner_text('#testmode .tm-timer'); print('timer:', timer)
        # teacher: the live header says when it ends; the editor's choices
        tctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        await tctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','exits');")
        tp = await tctx.new_page(); tp.on('pageerror', lambda e: errs.append('T ' + str(e))); tp.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.tt-live-head', timeout=15000)
        head = await tp.inner_text('.tt-live-head'); print('live head:', ' | '.join(head.split('\n')[:3])); assert 'until the end of class (11:56' in head
        left = await tp.evaluate("[...document.querySelectorAll('.tt-live tbody tr')].map(r => r.innerText.split('\\t').slice(0, 1).concat(r.cells[5] ? [r.cells[5].innerText] : []))"); print('time left:', left)
        # the period ends: the server clock moves past it, and Ava is submitted
        get_off = lv['endsAt'] - int(time.time() * 1000) + 90000
        urllib.request.urlopen(MOCK + '__set?__offset=' + str(get_off)).read()
        s = await wait_view(a, 'end', 40); print('after the bell:', s['st']); assert s['st'] == 'time', s
        urllib.request.urlopen(MOCK + '__set?__offset=0').read()
        # the editor: three choices, end of class by default
        await tp.click('.tt-live-head .btn-primary:has-text("Close")'); await tp.wait_for_selector('.tt-res', timeout=15000)
        await tp.click('.tt-back'); await tp.wait_for_selector('.tt-new-exit'); await tp.click('.tt-new-exit'); await tp.wait_for_selector('.tt-timing')
        opts = await tp.evaluate("[...document.querySelector('.tt-timing').options].map(o => (o.selected ? '*' : '') + o.text)"); print('timing choices:', opts); assert opts[0] == '*Ends at the end of class'
        assert await tp.locator('.tt-mins-w').is_hidden()
        await tp.select_option('.tt-timing', 'minutes'); assert await tp.locator('.tt-mins-w').is_visible()
        await tp.screenshot(path='/tmp/tm_timing_editor.png')
        # Settings → Class times
        await tp.click('.tabs .tab:has-text("Settings")'); await tp.wait_for_selector('.bell-panel')
        n = await tp.locator('.bell-panel input.bell-t').count(); print('class time inputs:', n); assert n == 24
        await tp.locator('.bell-panel input.bell-t').nth(1).fill('00:30'); await tp.click('.bell-panel .btn:has-text("Save class times")'); await tp.wait_for_timeout(1500)
        B = get('action=classes&key=testkey')['bell']; print('A on day 1 now:', B['day1'][0]); assert B['day1'][0] == ['A', '00:00', '00:30']
        await tp.locator('.bell-panel').screenshot(path='/tmp/tm_bell.png')
        await tp.click('.bell-panel .btn:has-text("Go back")') if await tp.locator('.bell-panel .btn:has-text("Go back")').count() else None
        await tp.wait_for_timeout(1200); B = get('action=classes&key=testkey'); print('after reset custom =', B['bellCustom'], B['bell']['day1'][0]); assert B['bellCustom'] is False
        await b.close()
    print('errors:', errs); assert not errs; print('PASS')
asyncio.run(main())
