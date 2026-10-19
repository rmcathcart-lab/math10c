"""Test mode edge cases against the mock (needs 8811 + a fresh tests/restart_mock.sh): see the printed lines."""
import asyncio, json, urllib.request
from playwright.async_api import async_playwright
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())
def launch(title, items, minutes=10):
    get('action=savetest&key=testkey&def=' + urllib.request.quote(json.dumps({'title': title, 'kind': 'exit', 'minutes': minutes, 'items': items})))
    tid = [t for t in get('action=tests&key=testkey')['tests'] if t['title'] == title][0]['id']
    if get('action=tlive&key=testkey&class=10c-b')['live']: get('action=tctl&key=testkey&class=10c-b&op=close')
    return get('action=launch&key=testkey&class=10c-b&test=' + tid)['live']['id']
async def signin_again(b, name, pin, errs):
    ctx = await b.new_context(viewport={'width': 1280, 'height': 860}); page = await ctx.new_page()
    page.on('pageerror', lambda e: errs.append(name + '2: ' + str(e)))
    await page.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
    await page.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
    await page.goto(BASE + '?class=10c-b'); await page.wait_for_selector('.name-btn', timeout=10000)
    await page.click('.name-btn:has-text("%s")' % name); await page.locator('.field.pin').nth(0).fill(pin); await page.click('.btn-primary'); await page.wait_for_selector('.lesson-row')
    return page
async def main():
    errs = []
    get('action=setroster&key=testkey&class=10c-b&label=B&names=Ava%20Brown%0ABen%20Lee%0ARyan%20Cathcart&mode=add')
    async with async_playwright() as p:
        b = await p.chromium.launch()
        a = await student(b, 'Ava Brown', '1111', errs)
        # ---- 1: list typing with pauses
        sid = launch('List', [{'l': 'u1l1', 'i': '1a'}, {'l': 'u1l2', 'i': '1a'}])
        await wait_view(a, 'pending', 25); await a.click('.tm-start'); await wait_view(a, 'test')
        inp = a.locator('#testmode .chip-input'); await inp.click(); await inp.type('1'); await a.wait_for_timeout(1300); await inp.type('3'); await a.wait_for_timeout(1300)
        print('peek while typing:', await a.evaluate("JSON.stringify(HW.TestMode._state().rec.ans)"), 'chips:', await a.locator('#testmode .chip').count())
        await a.click('#testmode .qactions .btn-primary'); await a.wait_for_timeout(400)
        print('after Next:', await a.evaluate("JSON.stringify(HW.TestMode._state().rec.ans)"))
        # ---- 3: offline submit, teacher closes, back online
        await a.wait_for_timeout(4000)
        await a.context.set_offline(True)
        await answer(a, True); await a.wait_for_timeout(800)
        await a.click('#testmode .tm-submit'); await a.click('.tm-modal .btn-primary'); await wait_view(a, 'end')
        get('action=tctl&key=testkey&class=10c-b&op=close')
        await a.context.set_offline(False); await a.wait_for_timeout(13000)
        rows = get('action=tresults&key=testkey&session=' + sid)['rows']
        print('offline submit reached sheet:', [(r['name'], r['status'], sorted(r['answers'].keys())) for r in rows])
        # ---- 9: dismiss "ended, you didn't start" stays dismissed
        sid2 = launch('Ended0', [{'l': 'u1l1', 'i': '1a'}]); get('action=tctl&key=testkey&class=10c-b&op=end')
        bn = await student(b, 'Ben Lee', '2222', errs)
        await wait_view(bn, 'ended0', 25); await bn.click('.tm-splash .btn'); await bn.wait_for_timeout(12000)
        print('ended0 stays dismissed:', await bn.locator('#testmode').count() == 0)
        # ---- 8: leave right after Start is not lost
        sid3 = launch('Guard', [{'l': 'u1l1', 'i': '1a'}, {'l': 'u1l1', 'i': '1b'}])
        await wait_view(bn, 'pending', 25); await bn.click('.tm-start'); await wait_view(bn, 'test')
        await bn.evaluate("document.exitFullscreen()"); await bn.wait_for_timeout(2500)
        s = await state(bn); print('esc right after start ->', s['st'])
        # ---- 5/6/7: move to another device, submit now, reopen
        r1 = await student(b, 'Ryan Cathcart', '3333', errs)
        await wait_view(r1, 'pending', 25); await r1.click('.tm-start'); await wait_view(r1, 'test')
        await answer(r1, True); await r1.wait_for_timeout(4500)   # synced
        await r1.context.set_offline(True)                          # device "dies"
        r2 = await signin_again(b, 'Ryan Cathcart', '3333', errs)
        await wait_view(r2, 'elsewhere', 25); print('second device: elsewhere')
        get('action=tctl&key=testkey&class=10c-b&op=unlock&name=Ryan%20Cathcart')
        await wait_view(r2, 'unlocked', 25); await r2.click('.tm-start'); s = await wait_view(r2, 'test'); print('moved: answers on device 2 =', s['ans'])
        get('action=tctl&key=testkey&class=10c-b&op=submit&name=Ryan%20Cathcart')
        s = await wait_view(r2, 'end', 25); print('submit now ->', s['st'])
        get('action=tctl&key=testkey&class=10c-b&op=unlock&name=Ryan%20Cathcart')
        await wait_view(r2, 'unlocked', 25); await r2.click('.tm-start'); await wait_view(r2, 'test'); await r2.wait_for_timeout(12000)
        s = await state(r2); print('reopen after submit-now stays writing:', s['st'])
        await r1.context.set_offline(False); await r1.wait_for_timeout(12000)
        s = await state(r1); print('old device after coming back:', s and s['view'], s and s['st'])
        await b.close()
    print('errors', errs)
asyncio.run(main())
