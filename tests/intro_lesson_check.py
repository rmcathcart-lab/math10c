"""Day-one lesson (lessons/u1/l0): every card fits one iPad screen (684 px at 1180 × 746), the outline shows this class's
unit test dates from the mock calendar (block B), the class QR, medals, explainers step to the end, no page errors.
Needs the static server (8811) and the mock (8765). Screenshots go to argv[1]."""
import asyncio, json, sys, urllib.request, urllib.parse
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
def get(q): return json.load(urllib.request.urlopen(MOCK + '?key=testkey&' + q))
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1180, 'height': 746}, device_scale_factor=1, service_workers='block')
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: m.type == 'error' and 'Failed to load resource' not in m.text and errs.append(m.text))
        await pg.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await pg.route('**/fonts.googleapis.com/**', lambda r: r.abort()); await pg.route('**/fonts.gstatic.com/**', lambda r: r.abort())
        # a calendar for block B: day one Feb 1 2027, plus a cumulative exam
        await pg.goto(BASE + 'lessons/u1/l0/'); await pg.wait_for_selector('.u1l0-unit')
        cal = await pg.evaluate("() => { const c = HW.Cal.make('2027-02-01'); c.events = [{ id: 'e1', date: '2027-06-18', title: 'Final exam', kind: 'exam', takes: true }]; return c; }")
        get('action=setblock&' + urllib.parse.urlencode({'class': '10c-b', 'block': 'B'}))
        print(get('action=setcal&' + urllib.parse.urlencode({'class': '10c-b', 'cal': json.dumps(cal)}))['ok'])
        await pg.goto(BASE + 'lessons/u1/l0/?class=B'); await pg.wait_for_selector('.u1l0-ou')
        await pg.wait_for_function("/Feb/.test(document.getElementById('u1l0-outline').textContent)", timeout=20000)
        print('first:', await pg.inner_text('#u1l0-first')); print('note:', await pg.inner_text('#u1l0-cnote'))
        print('outline:', ' | '.join((await pg.inner_text('#u1l0-outline')).split('\n'))[:600])
        print('url:', await pg.inner_text('#u1l0-url'))
        # every explainer to the end
        for k in ['pathways', 'period', 'grade', 'testmode', 'retest']:
            n = 0
            for _ in range(20):
                done = await pg.evaluate("(k) => { const e = document.querySelector('[data-explainer=' + k + ']')._ex; return e.k >= (e.steps || []).length; }", k)
                if done: break
                await pg.evaluate("(k) => document.querySelector('[data-explainer=' + k + ']')._ex.next()", k); await pg.wait_for_timeout(1700); n += 1
            print('explainer', k, 'steps', n)
            await pg.locator('[data-explainer=%s]' % k).screenshot(path=OUT + '/ex_%s_end.png' % k)
        await pg.evaluate("document.querySelectorAll('[data-poll-reveal]').forEach(b => b.click())")
        hs = await pg.evaluate("[...document.querySelectorAll('main > section.card')].map(s => [s.dataset.section, Math.round(s.getBoundingClientRect().height)])")
        for s, hh in hs: print(('TOO TALL ' if hh > 684 else '         ') + str(hh), s)
        cards = await pg.query_selector_all('main > section.card')
        for i, c in enumerate(cards): await c.screenshot(path=OUT + '/card_%02d.png' % i)
        await pg.wait_for_timeout(1500)
        await pg.locator('.u1l0-medal-wrap').screenshot(path=OUT + '/medals.png')
        await b.close()
    print('errors', errs)
asyncio.run(main())
