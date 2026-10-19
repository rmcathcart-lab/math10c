"""Test mode edge cases against the mock (needs 8811 + a fresh tests/restart_mock.sh): see the printed lines."""
import asyncio, json, urllib.request, sys
sys.path.insert(0, '/home/claude/m10c-main/tests')
from playwright.async_api import async_playwright
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())
async def main():
    errs = []
    get('action=setroster&key=testkey&class=10c-b&label=Block%20B&names=Ava%20Brown%0ABen%20Lee%0ARyan%20Cathcart&mode=add')
    get('action=savetest&key=testkey&def=' + urllib.request.quote(json.dumps({'title': 'Extra', 'kind': 'test', 'minutes': 5, 'items': [{'l': 'u1l2', 'i': '1a'}, {'l': 'u1l2', 'i': '1b'}]})))
    tid = [t for t in get('action=tests&key=testkey')['tests'] if t['title'] == 'Extra'][0]['id']
    live = get('action=tlive&key=testkey&class=10c-b')['live']
    if live: get('action=tctl&key=testkey&class=10c-b&op=close')
    get('action=launch&key=testkey&class=10c-b&test=' + tid)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        r = await student(b, 'Ryan Cathcart', '3333', errs)
        await wait_view(r, 'pending'); await r.click('.tm-start'); s = await wait_view(r, 'test'); print('fs', s['fs'])
        await r.wait_for_timeout(1600)
        await r.evaluate("document.exitFullscreen()"); s = await wait_view(r, 'end', 5); print('exit fullscreen ->', s['st'], await r.evaluate("HW.TestMode._state().rec.why"))
        get('action=tctl&key=testkey&class=10c-b&op=unlock&name=Ryan%20Cathcart')
        await wait_view(r, 'unlocked', 20); await r.click('.tm-start'); await wait_view(r, 'test'); await r.wait_for_timeout(1600)
        # timer: pretend 5 min used
        await r.evaluate("HW.TestMode._state().rec.used = 5*60000 - 1500"); await r.wait_for_timeout(2500)
        s = await state(r); print('timer ->', s['st'])
        get('action=tctl&key=testkey&class=10c-b&op=unlock&name=Ryan%20Cathcart&mins=2')
        await wait_view(r, 'unlocked', 20); await r.click('.tm-start'); await wait_view(r, 'test')
        get('action=tctl&key=testkey&class=10c-b&op=end')
        s = await wait_view(r, 'end', 20); print('end for everyone ->', s['st'])
        rec = get('action=tlive&key=testkey&class=10c-b')['recs']['Ryan Cathcart']; print('server rec', rec['st'], rec['leaves'], rec['why'])
        get('action=tctl&key=testkey&class=10c-b&op=close')
        await r.wait_for_timeout(11000); s = await state(r); print('after close', s and s['view'])
        await r.click('.tm-splash .btn'); await r.wait_for_timeout(500); print('overlay gone:', await r.locator('#testmode').count() == 0)
        await r.wait_for_timeout(11000); print('stays gone:', await r.locator('#testmode').count() == 0)
        await b.close()
    print('errors', errs)
asyncio.run(main())
