import asyncio, json, urllib.request
from playwright.async_api import async_playwright
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())
async def main():
    errs = []
    get('action=setroster&key=testkey&class=10c-b&label=B&names=Ava%20Brown&mode=add')
    async with async_playwright() as p:
        b = await p.chromium.launch()
        tctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        await tctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','tests');")
        tp = await tctx.new_page(); tp.on('pageerror', lambda e: errs.append('T ' + str(e))); tp.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.tt-card-ready', timeout=15000)
        card = tp.locator('.tt-card-ready:has(.tt-title:text-is("Unit 1 Test"))'); print('card', (await card.inner_text()).replace('\n', ' | '))
        a = await student(b, 'Ava Brown', '1111', errs)
        await card.locator('.btn-primary').click(); await wait_view(a, 'pending', 25)  # launching a built test saves it to the ledger first
        await a.click('.tm-start'); await wait_view(a, 'test')
        bad = []
        n = await a.locator('#testmode .tm-qn').count(); print('pages', n)
        for i in range(n):
            await a.click('#testmode .tm-qn >> nth=%d' % i); await a.wait_for_timeout(120)
            t = await a.evaluate("(()=>{const c=document.querySelector('#testmode .tm-card'); return [c.querySelectorAll('.katex-error').length, !!c.querySelector('.notice.warn'), c.querySelectorAll('.tm-part').length === c.querySelectorAll('.qinput').length && c.querySelectorAll('.qinput').length > 0]})()")
            if t[0] or t[1] or not t[2]: bad.append((i+1, t))
            if i in (0, 10, 13, 23): await a.screenshot(path='/tmp/tm_u1_q%d.png' % (i+1), full_page=False)
        print('bad', bad)
        await b.close()
    print('errors', errs)
asyncio.run(main())
