"""Teacher Ledger → Settings → Lesson notes → "Clear all lesson notes…": clears every lesson's notes on the ink
server (all classes) and this device's copies, and keeps the ink settings. Needs python3 -m http.server 8811, a fresh
practice mock (tests/restart_mock.sh) and the ink mock: node lessons/backend/mock_server.js 8790."""
import asyncio, json, urllib.request
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'; INK = 'http://localhost:8790/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
def push(lesson, cls):
    body = json.dumps({'op': 'push', 'key': 'TEST01', 'lesson': lesson, 'cls': cls, 'ops': [{'a': 'add', 's': 'warm', 'id': 'x1', 'p': [1, 2, 3]}]}).encode()
    return json.loads(urllib.request.urlopen(urllib.request.Request(INK, data=body, method='POST')).read())
def rows(lesson, cls): return len(json.loads(urllib.request.urlopen(INK + '?op=poll&lesson=%s&cls=%s&epoch=0&since=1' % (lesson, cls)).read())['ops'])
async def main():
    push('u1l1', 'B'); push('u2l3', 'C'); assert rows('u1l1', 'B') == 1 and rows('u2l3', 'C') == 1
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1300, 'height': 1000}, service_workers='block')
        await ctx.add_init_script("""if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1');
          localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','settings');
          localStorage.setItem('ink:api', JSON.stringify('%s')); localStorage.setItem('ink:teacher', JSON.stringify('TEST01'));
          localStorage.setItem('ink:u1l1:B', '{"v":1,"s":[]}'); localStorage.setItem('ink:u4l3', '{"v":1,"s":[]}'); localStorage.setItem('inkq:u1l1:B', '[]');
          localStorage.setItem('ink:settings', '{"tool":"pen"}'); localStorage.setItem('ink:slots', '{}'); }""" % INK)
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        answers = ['nope', 'CLEAR']
        pg.on('dialog', lambda d: asyncio.ensure_future(d.accept(answers.pop(0))))
        await pg.goto(BASE + 'teacher/'); await pg.wait_for_selector('text=Lesson notes', timeout=15000)
        btn = pg.locator('button:has-text("Clear all lesson notes")')
        await btn.click(); await pg.wait_for_timeout(500)
        assert rows('u1l1', 'B') == 1, 'a wrong word must not clear anything'
        await btn.click(); await pg.wait_for_timeout(1200)
        msg = await pg.locator('.panel.danger:has-text("Lesson notes") p.small').last.inner_text(); print('message:', msg)
        keys = await pg.evaluate("Object.keys(localStorage).filter(k => k.startsWith('ink'))"); print('ink keys left:', sorted(keys))
        await pg.locator('.panel.danger:has-text("Lesson notes")').screenshot(path='/tmp/clear_notes.png')
        assert rows('u1l1', 'B') == 0 and rows('u2l3', 'C') == 0, 'server notes cleared'
        assert sorted(keys) == ['ink:api', 'ink:settings', 'ink:slots', 'ink:teacher'], keys
        assert 'Cleared the notes on 2 lesson pages' in msg, msg
        print('errors:', errs); print('PASS' if not errs else 'FAIL')
        await b.close()
asyncio.run(main())
