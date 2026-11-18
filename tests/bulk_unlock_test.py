"""Unlocking several students at once in the live monitor (mock ledger; needs python3 -m http.server 8821 at the repo root
and a fresh tests/restart_mock.sh).
Three students leave full screen and are locked. The teacher ticks "Select all 3 locked" and presses "Unlock 3 selected":
one tctl request carries all three names; the rows say "Unlocking…" at once, then "waiting for them to press Continue";
every student gets the unlock splash within a few seconds, presses Continue and is writing again.
Then: the ledger busy (tryLock fails) is retried by itself, and an older backend without `names` gets one request each."""
import asyncio, json, time, urllib.request, urllib.parse, os
from playwright.async_api import async_playwright
exec(open(os.path.join(os.path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])

NAMES = ['Ava Brown', 'Ben Lee', 'Cara Diaz', 'Dev Shah']
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())

async def lock_out(page):
    await wait_view(page, 'pending', 25); await page.click('.tm-start'); await wait_view(page, 'test')
    await page.wait_for_timeout(1700)
    await page.evaluate("document.exitFullscreen()"); await wait_view(page, 'end', 8)

async def main():
    errs, fails = [], []
    def check(ok, msg):
        print(('ok   ' if ok else 'FAIL ') + msg)
        if not ok: fails.append(msg)
    get('action=setroster&key=testkey&class=10c-b&label=Block%20B&names=' + urllib.parse.quote('\n'.join(NAMES)) + '&mode=add')
    get('action=savetest&key=testkey&def=' + urllib.parse.quote(json.dumps({'title': 'Bulk', 'kind': 'test', 'timing': 'none', 'items': [{'l': 'u1l2', 'i': '1a'}, {'l': 'u1l2', 'i': '1b'}]})))
    tid = [t for t in get('action=tests&key=testkey')['tests'] if t['title'] == 'Bulk'][0]['id']
    if get('action=tlive&key=testkey&class=10c-b')['live']: get('action=tctl&key=testkey&class=10c-b&op=close')
    get('action=launch&key=testkey&class=10c-b&test=' + tid)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pages = {}
        for i, n in enumerate(NAMES[:3]): pages[n] = await student(b, n, str(4000 + i), errs)
        await asyncio.gather(*[lock_out(pg) for pg in pages.values()])
        recs = get('action=tlive&key=testkey&class=10c-b')['recs']
        check(all(recs[n]['st'] == 'left' for n in pages), 'three students locked on the ledger')

        tctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        ns = ''  # js/ns.js prefixes this site's localStorage keys (Math 15: 'm15/'); set them the way the page will read them
        nsf = os.path.join(os.path.dirname(__file__), '..', 'js', 'ns.js')
        if os.path.exists(nsf):
            import re; m = re.search(r"var P = '([^']*)'", open(nsf).read()); ns = m.group(1) if m else ''
        await tctx.add_init_script("for (const [k, v] of [['hw:tkey','testkey'],['hw:tclass','10c-b'],['hw:ttab','tests']]) localStorage.setItem('%s' + k, v);" % ns)
        tp = await tctx.new_page()
        tp.on('pageerror', lambda e: errs.append('teacher: ' + str(e)))
        tp.on('dialog', lambda d: (errs.append('teacher dialog: ' + d.message), asyncio.ensure_future(d.accept())))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        sent = []
        tp.on('request', lambda r: sent.append(r.url) if 'action=tctl' in r.url else None)
        await tp.goto(BASE + 'teacher/')
        # the Tests tab shows a LIVE banner; open the monitor
        await tp.wait_for_selector('.tt-live-banner, .tt-live', timeout=20000)
        if await tp.locator('.tt-live').count() == 0: await tp.click('.tt-live-banner .btn')
        await tp.wait_for_selector('.tt-bulk', timeout=15000)
        txt = await tp.inner_text('.tt-bulk'); check('3' in txt and 'locked' in txt, 'bulk bar: ' + txt.replace('\n', ' '))
        check(await tp.locator('.tt-ckone').count() == 3, 'a checkbox beside each locked student')
        check(await tp.locator('.tt-bulk-go').is_disabled(), 'Unlock selected is off with nothing ticked')
        # tick one, untick it, then the header box selects all
        await tp.click('tr:has-text("Ben Lee") .tt-ckone'); check((await tp.inner_text('.tt-bulk-go')) == 'Unlock 1 selected', 'one ticked')
        await tp.wait_for_timeout(5600)  # survives a refresh of the table
        check(await tp.locator('tr:has-text("Ben Lee") .tt-ckone').is_checked(), 'tick kept across the 5 s refresh')
        await tp.click('.tt-ckall'); check((await tp.inner_text('.tt-bulk-go')) == 'Unlock 3 selected', 'header box selects all 3: ' + await tp.inner_text('.tt-bulk-go'))
        await tp.screenshot(path='/tmp/bulk_unlock_ticked.png')
        sent.clear(); t0 = time.time()
        await tp.click('.tt-bulk-go')
        await tp.wait_for_selector('tr:has-text("Ava Brown"):has-text("Unlocking")', timeout=1500)
        check(True, 'rows say Unlocking… at once')
        await tp.wait_for_selector('tr:has-text("Cara Diaz"):has-text("waiting for them to press Continue")', timeout=8000)
        check(True, 'then "waiting for them to press Continue" (%.1f s)' % (time.time() - t0))
        un = [u for u in sent if 'op=unlock' in u]
        check(len(un) == 1 and 'names=' in un[0], 'one unlock request for all three (%d sent)' % len(un))
        await asyncio.gather(*[wait_view(pg, 'unlocked', 12) for pg in pages.values()])
        check(time.time() - t0 < 9, 'all three students see the unlock within %.1f s' % (time.time() - t0))
        for pg in pages.values(): await pg.click('.tm-start')
        await asyncio.gather(*[wait_view(pg, 'test', 8) for pg in pages.values()])
        await tp.wait_for_function("() => [...document.querySelectorAll('.tt-live tbody tr')].filter(r => /Writing/.test(r.textContent)).length === 3", timeout=12000)
        check(await tp.locator('.tt-bulk').count() == 0, 'all three writing again; the bulk bar is gone')

        # ---- busy ledger: the unlock tries again by itself ----
        await pages['Ava Brown'].wait_for_timeout(1700)
        await pages['Ava Brown'].evaluate("document.exitFullscreen()"); await wait_view(pages['Ava Brown'], 'end', 8)
        await pages['Ben Lee'].evaluate("document.exitFullscreen()"); await wait_view(pages['Ben Lee'], 'end', 8)
        await tp.wait_for_selector('.tt-ckone', timeout=12000)
        await tp.wait_for_function("() => document.querySelectorAll('.tt-ckone').length === 2", timeout=12000)
        urllib.request.urlopen(MOCK + '__set?__busy=2').read()
        sent.clear()
        await tp.click('tr:has-text("Ava Brown") .btn:has-text("Unlock")')
        await tp.click('tr:has-text("Ben Lee") .btn:has-text("Unlock")')
        await asyncio.gather(wait_view(pages['Ava Brown'], 'unlocked', 20), wait_view(pages['Ben Lee'], 'unlocked', 20))
        un = [u for u in sent if 'op=unlock' in u]
        check(len(un) >= 2, 'busy answers were retried (%d unlock requests for 2 clicks)' % len(un))
        for n in ('Ava Brown', 'Ben Lee'): await pages[n].click('.tm-start'); await wait_view(pages[n], 'test', 8)

        # ---- an older backend (no `names`): one request per student, in turn ----
        async def old_backend(route):
            u = route.request.url
            if 'op=unlock' in u and 'names=' in u:
                await route.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': False, 'error': 'no student'}))
            else: await route.continue_()
        await tp.route(MOCK + '**', old_backend)
        for n in ('Ava Brown', 'Ben Lee'):
            await pages[n].wait_for_timeout(1700); await pages[n].evaluate("document.exitFullscreen()"); await wait_view(pages[n], 'end', 8)
        await tp.wait_for_function("() => document.querySelectorAll('.tt-ckone').length === 2", timeout=12000)
        sent.clear()
        await tp.click('.tt-bulk .btn:has-text("Select all")'); await tp.click('.tt-bulk-go')
        await asyncio.gather(wait_view(pages['Ava Brown'], 'unlocked', 20), wait_view(pages['Ben Lee'], 'unlocked', 20))
        un = [u for u in sent if 'op=unlock' in u]
        check(len(un) == 3 and sum('names=' in u for u in un) == 1, 'old backend: tried names once, then one each (%d requests)' % len(un))
        await tp.screenshot(path='/tmp/bulk_unlock_waiting.png')
        await b.close()
    check(not errs, 'no page errors or dialogs: %s' % errs)
    print('FAILED %d' % len(fails) if fails else 'ALL PASSED')

asyncio.run(main())
