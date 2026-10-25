"""Stand Up Break! (lessons/js/standup.js) on Lesson 4.3 against the mock ledger: new questions keep the old ones, levels,
answers, timer, random groups from the class list (away students left out, sizes within 1), and the ledger setting that
turns the card off for a class. Needs 8811 + tests/restart_mock.sh."""
import asyncio, json, urllib.request
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())
NAMES = ['Ava Brown', 'Ben Lee', 'Cara Diaz', 'Dev Patel', 'Eli Moore', 'Fay Chen', 'Gus Hall', 'Hana Kim', 'Ian Ross', 'Jo Wu', 'Kai Ng', 'Lia Ito', 'Ava Bell']
async def main():
    get('action=setroster&key=testkey&class=10c-b&label=Block%20B&mode=add&names=' + urllib.request.quote('\n'.join(NAMES)))
    get('action=setblock&key=testkey&class=10c-b&block=B')
    get('action=setlopts&key=testkey&class=10c-b&standup=1')
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1180, 'height': 820}, service_workers='block')
        for pat in ('**/fonts.googleapis.com/**', '**/cdn.jsdelivr.net/**', '**/script.google.com/**'): await ctx.route(pat, lambda r: r.abort())
        await ctx.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await ctx.add_init_script("localStorage.setItem('hw:tkey', 'testkey')")  # signed in to the Teacher Ledger only
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(BASE + 'lessons/u4/l3/?class=B'); await pg.wait_for_selector('.su-cur .su-q')
        for lv in ['PRG', 'MAS']: await pg.click('.su-lv.su-lv-' + lv); await pg.click('.su-new')
        n = await pg.locator('.su-old').count(); levels = await pg.evaluate("[...document.querySelectorAll('.su-chip')].map(e=>e.textContent)")
        print('earlier kept:', n, levels); assert n == 2 and levels[0] == 'Mastery'
        await pg.click('.su-cur .su-ans-b'); assert await pg.is_visible('.su-cur .su-ans')
        await pg.click('.su-btn:has-text("Timer")'); await pg.click('[data-m="3"]'); await pg.wait_for_timeout(1300)
        clock = await pg.inner_text('.su-tclock'); print('timer:', clock); assert clock in ('2:59', '2:58')
        await pg.click('.su-btn:has-text("Groups")'); await pg.wait_for_selector('.su-p')
        roll = await pg.evaluate("[...document.querySelectorAll('.su-p')].map(e=>e.textContent)"); print('roll:', ', '.join(roll))
        await pg.click('.su-p:has-text("Ben L.")'); await pg.click('.su-step [data-s="1"]')
        nst = int(await pg.inner_text('.su-step b')); await pg.click('.su-make')
        gs = await pg.evaluate("[...document.querySelectorAll('.su-g')].map(g=>[...g.querySelectorAll('div:not(.su-gn)')].map(d=>d.textContent))")
        sizes = [len(g) for g in gs]; flat = [x for g in gs for x in g]
        print('stations', nst, 'groups', gs); assert len(gs) == nst and max(sizes) - min(sizes) <= 1 and 'Ben L.' not in flat and len(flat) == len(roll) - 1
        await pg.wait_for_timeout(900); await pg.screenshot(path='/tmp/su_groups.png'); await pg.click('.su-mx')
        # a student viewing the lesson: questions, no timer or groups
        v = await b.new_context(service_workers='block'); vp = await v.new_page(); await v.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await vp.goto(BASE + 'lessons/u4/l3/?class=B'); await vp.wait_for_selector('.su-cur .su-q'); print('viewer tools:', await vp.locator('.su-btn').count()); assert await vp.locator('.su-btn').count() == 0
        # off in the ledger: the card goes away
        print(get('action=setlopts&key=testkey&class=10c-b&standup=0'))
        await vp.reload(); await vp.wait_for_timeout(2500); print('card after off:', await vp.locator('section.standup').count()); assert await vp.locator('section.standup').count() == 0
        get('action=setlopts&key=testkey&class=10c-b&standup=1')
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
