"""Retest openings (2026-11-19) against the mock ledger. The teacher opens Units 1-3 for retesting in the Retests tab;
a student with no practice done sees "Request retest" on Units 1-3 (not Unit 4), asks on Unit 2, and Units 1 and 3 go
back to locked ("you used..."). One request at a time: the server refuses a second request (another unit, opened or
practice-earned). Cancelling gives the opening back; a dismissed request does too; restoring a dismissed request while
another is waiting is refused. Closing the opening locks the units again.
Needs python3 -m http.server 8821 (repo root) and a fresh mock (tests/restart_mock.sh). Screenshots in /tmp/rto_*.png."""
import asyncio, json, urllib.request, urllib.parse, os
from playwright.async_api import async_playwright
exec(open(os.path.join(os.path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())

async def rt_text(page, unit):
    return await page.evaluate("(u) => { const s = [...document.querySelectorAll('.unit')].find(x => (x.querySelector('.unit-num') || {}).textContent === 'Unit ' + u) || document.querySelectorAll('.unit')[u - 1]; const r = s && s.querySelector('.retest'); return r ? r.className + ' | ' + r.innerText.replace(/\\s+/g, ' ') : null; }", unit)
async def reload(page):
    await page.goto(BASE + '?class=10c-b'); await page.wait_for_selector('.lesson-row'); await page.wait_for_timeout(300)
async def wait_rt(page, unit, want, secs=15):
    for _ in range(secs * 4):
        t = await rt_text(page, unit)
        if t and want in t: return t
        await page.wait_for_timeout(250)
    raise AssertionError('Unit %d retest control never showed %r: %s' % (unit, want, await rt_text(page, unit)))

async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        a = await student(b, 'Ava Brown', '1111', errs)
        a.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        tok = await a.evaluate("HW.App.session().token")
        my = lambda: get('action=myretests&class=10c-b&name=Ava%20Brown&token=' + tok)
        for u in (1, 2, 4): t = await wait_rt(a, u, 'rt-locked'); print('before, unit', u, ':', t)
        # ---- teacher opens Units 1-3 in the Retests tab ----
        tctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        import re; nsf = os.path.join(os.path.dirname(__file__), '..', 'js', 'ns.js')   # js/ns.js prefixes this site's localStorage keys
        ns = (re.search(r"var P = '([^']*)'", open(nsf).read()) or [None, ''])[1] if os.path.exists(nsf) else ''
        await tctx.add_init_script("for (const [k, v] of [['hw:tkey','testkey'],['hw:tclass','10c-b'],['hw:ttab','retests']]) localStorage.setItem('%s' + k, v);" % ns)
        tp = await tctx.new_page(); tp.on('pageerror', lambda e: errs.append('teacher: ' + str(e))); tp.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.rt-openings', timeout=15000)
        for u in (1, 2, 3): await tp.click('.rt-opu:has-text("Unit %d") input' % u)
        await tp.screenshot(path='/tmp/rto_t_pick.png', full_page=True)
        await tp.click('.rt-op-open'); await tp.wait_for_selector('.rt-op', timeout=10000)
        op = await tp.inner_text('.rt-op'); print('opening:', op.replace('\n', ' ')); assert 'Units 1–3' in op and 'not used yet' in op, op
        await tp.screenshot(path='/tmp/rto_t_open.png', full_page=True)
        # ---- the student sees it ----
        await reload(a)
        for u in (1, 2, 3): t = await wait_rt(a, u, 'rt-opened'); print('opened, unit', u, ':', t); assert 'Request retest' in t
        t = await rt_text(a, 4); print('unit 4:', t); assert 'rt-locked' in t
        await a.evaluate("document.querySelector('.retest.rt-opened').scrollIntoView({block: 'center'})"); await a.screenshot(path='/tmp/rto_s_opened.png')
        await a.evaluate("() => { const s = [...document.querySelectorAll('.unit')].find(x => (x.querySelector('.unit-num') || {}).textContent === 'Unit 2'); s.querySelector('.rt-ask').click(); }")
        t = await wait_rt(a, 2, 'Retest requested'); print('asked unit 2:', t)
        for u in (1, 3): t = await rt_text(a, u); print('after, unit', u, ':', t); assert 'rt-locked' in t and 'You used the retest your teacher opened on Unit 2' in t, t
        await a.evaluate("document.querySelector('.retest.rt-asked').scrollIntoView({block: 'center'})"); await a.screenshot(path='/tmp/rto_s_asked.png')
        m = my(); x = [r for r in m['retests'] if r['status'] == 'requested'][0]; print('request:', x['unit'], x['grant'], x['info']); assert x['grant'] and x['unit'] == 2
        gid = x['grant']
        # ---- the server: one at a time, one per opening ----
        base = 'action=reqretest&class=10c-b&name=Ava%20Brown&token=' + tok
        r = get(base + '&unit=1&grant=' + gid); print('second (opened):', r.get('error'), r.get('unit')); assert not r['ok'] and r['error'] == 'pending' and r['unit'] == 2
        r = get(base + '&unit=4'); print('second (practice):', r.get('error')); assert not r['ok'] and r['error'] == 'pending'
        r = get(base + '&unit=2'); assert r['ok'] and r.get('already')
        # cancel: the opening comes back
        get(base + '&unit=2&cancel=1')
        r = get(base + '&unit=5&grant=' + gid); print('unit outside the opening:', r.get('error')); assert r['error'] == 'closed'
        r = get(base + '&unit=3&grant=' + gid); assert r['ok'], r
        r = get(base + '&unit=1&grant=' + gid); print('after cancel + new request, again:', r.get('error')); assert r['error'] == 'pending'
        # ---- teacher: the request shows the tag; dismiss it (the opening comes back), then a practice one, then restore is refused ----
        await tp.reload(); await tp.wait_for_selector('.rt-tbl tr:has-text("Ava Brown")', timeout=15000)
        row = await tp.inner_text('.rt-tbl tr:has-text("Ava Brown")'); print('row:', row.replace('\n', ' | ')); assert 'Opened unit' in row and 'Unit 3' in row
        op = await tp.inner_text('.rt-op'); print('opening now:', op.replace('\n', ' ')); assert 'used by 1 student' in op, op
        await tp.screenshot(path='/tmp/rto_t_row.png', full_page=True)
        await tp.click('.rt-tbl tr:has-text("Ava Brown") .rt-dismiss'); await tp.wait_for_timeout(1500)
        r = get(base + '&unit=1&grant=' + gid); assert r['ok'], r
        dismissed = [q for q in my()['retests'] if q['status'] == 'dismissed'][0]
        r = get('action=retestset&key=testkey&class=10c-b&status=requested&id=' + dismissed['id']); print('restore while waiting:', r); assert not r['ok'] and 'already has another' in r['error']
        get(base + '&unit=1&cancel=1')
        # ---- teacher closes the opening: locked again ----
        await tp.reload(); await tp.wait_for_selector('.rt-op-close', timeout=15000)
        await tp.click('.rt-op-close'); await tp.wait_for_function("!document.querySelector('.rt-op')", timeout=10000)
        await reload(a)
        for u in (1, 2, 3): t = await wait_rt(a, u, 'rt-locked'); assert 'rt-opened' not in t
        r = get(base + '&unit=1&grant=' + gid); assert r['error'] == 'closed', r
        # ---- all classes: a second class gets the opening too ----
        get('action=setroster&key=testkey&class=10c-c&label=Block%20C&names=Cal%20Doe&mode=add')
        await tp.reload(); await tp.wait_for_selector('.rt-opall', timeout=15000)
        await tp.click('.rt-opu:has-text("Unit 1") input'); await tp.click('.rt-opall input'); await tp.click('.rt-op-open'); await tp.wait_for_selector('.rt-op')
        o2 = get('action=retests&key=testkey&class=10c-c')['openings']; print('other class openings:', o2); assert len(o2) == 1 and o2[0]['units'] == [1]
        await b.close()
    errs = [e for e in errs if 'Use your one retest' not in e and 'Cancel your retest' not in e]   # confirms, accepted
    print('errors:', errs); assert not errs
    print('PASS')
asyncio.run(main())
