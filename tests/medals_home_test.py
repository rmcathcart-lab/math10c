"""Medals on the student home page (mock ledger): Unit 1's outcomes start at Rust (no pop-up); practice earns AN1 (shown quietly the first time);
a released exit slip (stubbed) adds AN3 and more practice adds AN2 → "New medals!" opens big; Esc closes; tapping a medal
opens the viewer with the seven levels. Needs the static server on 8811 and a fresh mock (tests/restart_mock.sh).
Screenshots /tmp/md_*.png."""
import asyncio
from playwright.async_api import async_playwright
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
FILL = """([lid, n]) => { const S = HW.App.state(), L = HW.lessons[lid]; S.lessons[lid] = S.lessons[lid] || { items: {}, qv: {}, cur: null, secs: 0, updated: 0 };
  L.items.filter(it => !it.extra).slice(0, n).forEach(it => { S.lessons[lid].items[it.id] = { s: 'done', v: 0, tv: 0, wrong: 0, steps: 0, forms: 0, reveals: 0, credit: 'first', secs: 30, at: Date.now(), prac: 0, done: Date.now() }; });
  HW.App.save(); return L.items.filter(it => !it.extra).slice(0, n).map(it => it.level).join(' '); }"""
async def medals(page): return await page.evaluate("[...document.querySelectorAll('.hh-medals .medal-btn')].map(b => b.title + (b.classList.contains('is-new') ? ' (new)' : ''))")
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        a = await student(b, 'Ava Brown', '1111', errs, medal_pops=True); a.set_default_timeout(120000)
        await a.wait_for_timeout(1500); m = await medals(a); print('start:', m)
        assert m == ['AN1 · Rust · Not meeting', 'AN2 · Rust · Not meeting'], m          # Unit 1 has started, no practice yet
        assert await a.locator('.medal-pop').count() == 0, 'Rust should not pop up'
        print('levels done:', await a.evaluate(FILL, ['u1l1', 12]))
        await a.evaluate("location.hash = '#/x'; location.hash = '#/'"); await a.wait_for_timeout(2500)
        m = await medals(a); print('after practice:', m); assert m[0].startswith('AN1 · Silver · Emerging') and m[1].startswith('AN2 · Rust'), m
        t = await a.inner_text('.medal-pop'); assert 'new medal!' in t.lower(), t   # her first medal (the device had seen none)
        await a.keyboard.press('Escape')
        # a device that has never shown medals (the feature arriving) just remembers what there is: no pop-up
        await a.evaluate("Object.keys(localStorage).filter(k => k.startsWith('hw:medals:')).forEach(k => localStorage.removeItem(k))")
        await a.evaluate("location.hash = '#/x'; location.hash = '#/'"); await a.wait_for_timeout(2500)
        assert await a.locator('.medal-pop').count() == 0, 'the first time on a device should be quiet'
        await a.wait_for_timeout(8000); await a.locator('.home-head').screenshot(path='/tmp/md_head.png')
        # a released exit slip on AN3 (stubbed), and practice on AN2
        print(await a.evaluate("""() => { const def = { title: 'Exit slip 2.1', kind: 'exit', items: [{ l: 'u2l1', i: '1a' }, { l: 'u2l1', i: '2a' }] };
          HW.TestMode.loadResults = () => Promise.resolve([{ id: 'X1', kind: 'exit', title: 'Exit slip 2.1', def, marks: 'cc', launched: Date.now() }]);
          return JSON.stringify(HW.TestCore.summary(def, 'cc').levels); }"""))
        print('AN2 levels:', await a.evaluate(FILL, ['u1l3', 10]))
        await a.evaluate("location.hash = '#/x'; location.hash = '#/'"); await a.wait_for_selector('.medal-pop', timeout=20000)
        m = await medals(a); print('now:', m)
        t = await a.inner_text('.medal-pop'); print('pop-up:', ' | '.join(t.split('\n')[:6]))
        assert 'new medals!' in t.lower(), t
        await a.wait_for_timeout(15000); await a.screenshot(path='/tmp/md_new.png')
        await a.keyboard.press('Escape'); assert await a.locator('.medal-pop').count() == 0
        await a.click('.hh-medals .medal-btn >> nth=0'); await a.wait_for_selector('.medal-pop .medal-ladder')
        got = await a.evaluate("[...document.querySelectorAll('.medal-rung')].map(r => r.className.includes('got') ? 1 : 0).join('')"); print('ladder:', got); assert got == '1111000', got
        # tap a level already passed: it becomes the big one
        await a.click('.medal-rung.got >> nth=1'); await a.wait_for_timeout(400)
        print('picked:', await a.inner_text('.medal-metal'), '|', await a.inner_text('.medal-level')); assert (await a.inner_text('.medal-metal')) == 'Steel'
        assert await a.evaluate("[...document.querySelectorAll('.medal-rung')].findIndex(r => r.classList.contains('here'))") == 1
        assert await a.locator('div.medal-rung').count() == 3   # the levels not reached can't be tapped
        xb = await a.evaluate("(() => { const b = document.querySelector('.medal-x').getBoundingClientRect(), s = document.querySelector('.medal-x svg').getBoundingClientRect(); return [Math.round((s.left + s.width / 2) - (b.left + b.width / 2)), Math.round((s.top + s.height / 2) - (b.top + b.height / 2))]; })()")
        print('X off centre by', xb); assert xb == [0, 0]
        await a.wait_for_timeout(9000); await a.locator('.medal-box').screenshot(path='/tmp/md_pick.png')
        await a.click('.medal-next'); await a.wait_for_timeout(500); print('next:', (await a.inner_text('.medal-metal')), await a.inner_text('.medal-level'))
        await a.wait_for_timeout(12000); await a.screenshot(path='/tmp/md_viewer.png')
        await a.click('.medal-x'); assert await a.locator('.medal-pop').count() == 0
        # back again: nothing new, no pop-up
        await a.evaluate("location.hash = '#/x'; location.hash = '#/'"); await a.wait_for_timeout(3000)
        assert await a.locator('.medal-pop').count() == 0
        await b.close()
    errs = [e for e in errs if 'favicon' not in e]
    print('errors:', errs); assert not errs; print('PASS')
asyncio.run(main())
