"""Retests end to end against the mock ledger.
Student: Unit 1's retest is locked until every required question is done; one whose solution was shown has to be redone
without the solution; then "Request retest", cancel, request again. Teacher: the Retests tab lists the request (badge on the
tab), opens a one-student retest of the Unit 1 test while a class test is running; the student gets the retest pop-up (the
other student keeps the class test), writes and submits; the teacher closes it, the request moves to "Written", the student's
tests for the unit show with the best one starred; a second request needs the extra practice too.
Needs python3 -m http.server 8811 (repo root) and a fresh mock (tests/restart_mock.sh). Screenshots in /tmp/rt_*.png."""
import asyncio, json, urllib.request, urllib.parse
from playwright.async_api import async_playwright
exec(open(__import__('os').path.join(__import__('os').path.dirname(__file__), 'test_mode_e2e.py')).read().split('async def main')[0])
def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())

FILL = """([unit, shownOne]) => {   // every required question in the unit done (first try); one of them done after the solution was shown
  const S = HW.App.state(), lids = Object.keys(HW.lessons).filter(k => HW.lessons[k].unit === unit && !HW.lessons[k].test);
  let pick = null;
  lids.forEach(lid => { const L = HW.lessons[lid]; S.lessons[lid] = S.lessons[lid] || { items: {}, qv: {}, cur: null, secs: 0, updated: 0 };
    L.items.forEach(it => { if (it.extra) return;
      const r = { s: 'done', v: 0, tv: 0, wrong: 0, steps: 0, forms: 0, reveals: 0, credit: 'first', secs: 30, at: Date.now(), prac: 0, done: Date.now() };
      if (shownOne && !pick && lid === lids[0]) { pick = [lid, it.id]; r.credit = 'shown'; r.reveals = 1; }
      S.lessons[lid].items[it.id] = r; });
    S.lessons[lid].updated = Date.now(); HW.App.pushProgress(lid); });
  HW.App.save(); return pick;
}"""
EXTRAS = """(unit) => { const S = HW.App.state(); Object.keys(HW.lessons).filter(k => HW.lessons[k].unit === unit && !HW.lessons[k].test).forEach(lid => {
  HW.lessons[lid].items.forEach(it => { if (it.extra) S.lessons[lid].items[it.id] = { s: 'done', v: 0, tv: 0, wrong: 0, steps: 0, forms: 0, reveals: 0, credit: 'first', secs: 20, at: Date.now(), prac: 0, done: Date.now() }; });
  HW.App.pushProgress(lid); }); HW.App.save(); }"""

async def home(page):
    await page.evaluate("location.hash = '#/'; HW.App.route()"); await page.wait_for_timeout(300)

async def rt_text(page, unit=1):
    return await page.evaluate("(u) => { const s = [...document.querySelectorAll('.unit')].find(x => (x.querySelector('.unit-num') || {}).textContent === 'Unit ' + u) || document.querySelectorAll('.unit')[u - 1]; const r = s && s.querySelector('.retest'); return r ? r.className + ' | ' + r.innerText.replace(/\\s+/g, ' ') : null; }", unit)

async def wait_rt(page, want, secs=15):
    for _ in range(secs * 4):
        t = await rt_text(page)
        if t and want in t: return t
        await page.wait_for_timeout(250)
    raise AssertionError('retest control never showed %r: %s' % (want, await rt_text(page)))

async def main():
    errs = []
    # a short Unit 1 test, and a class test running while the retest happens
    get('action=savetest&key=testkey&def=' + urllib.parse.quote(json.dumps({'title': 'Unit 1 Test', 'kind': 'test', 'unit': 1, 'minutes': 30, 'calc': True, 'items': [{'l': 'u1l2', 'i': x} for x in ['1a', '1b', '2a']]})))
    tid = [t for t in get('action=tests&key=testkey')['tests'] if t['title'] == 'Unit 1 Test'][0]['id']
    async with async_playwright() as p:
        b = await p.chromium.launch()
        a = await student(b, 'Ava Brown', '1111', errs); bn = await student(b, 'Ben Lee', '2222', errs)
        a.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        # ---- locked ----
        t = await wait_rt(a, 'rt-locked'); print('start:', t)
        assert 'required question' in t, t
        await a.locator('.retest').first.scroll_into_view_if_needed(); await a.screenshot(path='/tmp/rt_s_locked.png')
        pick = await a.evaluate(FILL, [1, True]); print('shown item:', pick); assert pick
        await home(a); t = await rt_text(a); print('after practice:', t)
        assert 'rt-locked' in t and '1 to redo without the solution' in t and 'required question' not in t, t
        await a.locator('.retest').first.scroll_into_view_if_needed(); await a.screenshot(path='/tmp/rt_s_redo.png')
        # ---- the lock button goes to the question; redo it without the solution ----
        await a.click('.rt-locked-btn'); await a.wait_for_selector('.redo-note')
        assert pick[1] in await a.evaluate("location.hash"), await a.evaluate("location.hash")
        await a.screenshot(path='/tmp/rt_s_redo_card.png')
        await a.click('.btn-primary:has-text("Redo it without the solution")'); await a.wait_for_timeout(300)
        await a.evaluate("() => { const c = HW.App.cur(); c.widget.set(c.inst.key); }")
        await a.click('.btn-check'); await a.wait_for_timeout(300)
        fbt = await a.inner_text('.qcard .feedback'); print('redo feedback:', fbt.split('\n')[0:2])
        assert 'counts toward a unit retest' in fbt, fbt
        assert await a.evaluate("([l, i]) => !!HW.App.state().lessons[l].items[i].redo", pick)
        # ---- request, cancel, request again ----
        await home(a); t = await wait_rt(a, 'Request retest'); print('unlocked:', t)
        await a.locator('.retest').first.scroll_into_view_if_needed(); await a.screenshot(path='/tmp/rt_s_unlocked.png')
        await a.click('.rt-ask'); t = await wait_rt(a, 'Retest requested'); print('asked:', t)
        await a.screenshot(path='/tmp/rt_s_asked.png')
        await a.click('.rt-cancel'); t = await wait_rt(a, 'Request retest')
        await a.click('.rt-ask'); await wait_rt(a, 'Retest requested')
        mine = get('action=myretests&class=10c-b&name=Ava%20Brown&token=' + await a.evaluate("HW.App.session().token"))
        st = [x['status'] for x in mine['retests']]; print('requests:', st, mine['retests'][-1].get('info'))
        assert sorted(st) == ['cancelled', 'requested'], st
        # Ben: nothing done, locked; the class test starts for everyone
        assert 'rt-locked' in (await wait_rt(bn, 'rt-locked'))
        get('action=launch&key=testkey&class=10c-b&test=' + tid)
        await wait_view(bn, 'pending', 25); await wait_view(a, 'pending', 25)
        # ---- teacher: the Retests tab ----
        tctx = await b.new_context(viewport={'width': 1400, 'height': 950})
        await tctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','retests');")
        tp = await tctx.new_page(); tp.on('pageerror', lambda e: errs.append('teacher: ' + str(e))); tp.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/')
        try: await tp.wait_for_selector('.rt-tbl', timeout=15000)
        except Exception: await tp.screenshot(path='/tmp/rt_t_fail.png', full_page=True); print('TEACHER PAGE:', ' '.join((await tp.inner_text('body')).split())[:1500]); print(errs); raise
        badge = await tp.inner_text('.tab-badge'); print('badge:', badge); assert badge.strip() == '1', badge
        row = await tp.inner_text('.rt-tbl tr:has-text("Ava Brown")'); print('waiting row:', row.replace('\n', ' | '))
        assert 'Unit 1' in row, row
        await tp.screenshot(path='/tmp/rt_t_waiting.png', full_page=True)
        await tp.click('.rt-tbl tr:has-text("Ava Brown") .btn-primary:has-text("Open retest")')
        await tp.wait_for_selector('.tt-live-head', timeout=15000)
        head = await tp.inner_text('.tt-live-head'); print('live head:', head.replace('\n', ' | '))
        assert 'Ava Brown' in head and 'End for everyone' not in head, head
        # ---- Ava gets the retest (her own numbers), Ben keeps the class test ----
        for _ in range(60):
            s = await state(a)
            if s and s['view'] == 'pending' and await a.evaluate("HW.TestMode._state().live && HW.TestMode._state().live.who === 'Ava Brown' || /Retest/i.test((document.querySelector('#testmode') || {}).innerText || '')"): break
            await a.wait_for_timeout(250)
        live_a = await a.evaluate("(() => { const T = HW.TestMode._state(); return T && (T.live || {}).id; })()")
        live_b = await bn.evaluate("(() => { const T = HW.TestMode._state(); return T && (T.live || {}).id; })()")
        print('sessions: Ava', live_a, 'Ben', live_b); assert live_a and live_b and live_a != live_b
        await a.screenshot(path='/tmp/rt_s_pending.png')
        await a.click('.tm-start'); await wait_view(a, 'test')
        await answer(a, True, 0); await answer(a, True, 1); await a.wait_for_timeout(600)
        await a.click('#testmode .tm-submit'); await a.click('.tm-modal .btn-primary'); s = await wait_view(a, 'end'); assert s['st'] == 'submitted', s
        rows = 0
        for _ in range(40):
            txt = await tp.inner_text('.tt-live')
            if 'Submitted' in txt: break
            await tp.wait_for_timeout(500)
        rows = await tp.locator('.tt-live tbody tr').count(); print('live rows:', rows); assert rows == 1, rows
        await tp.screenshot(path='/tmp/rt_t_live.png')
        await tp.wait_for_timeout(5500)
        await tp.click('.tt-live-head .btn-primary:has-text("Close")'); await tp.wait_for_selector('.tt-res', timeout=15000)
        res = await tp.evaluate("[...document.querySelectorAll('.tt-res tbody tr')].map(r => r.innerText.replace(/\\s+/g, ' '))"); print('results:', res)
        people = [r for r in res if not r.startswith('Average')]; assert len(people) == 1 and people[0].startswith('Ava Brown Submitted'), res
        await tp.click('.tt-acts .btn:has-text("Save marks")'); await tp.wait_for_selector('.tt-acts .btn:has-text("Marks saved")', timeout=10000)
        # the class test is still live for Ben, and Ava now sees it too: she writes it as well (one right)
        assert (await state(bn))['view'] == 'pending'
        await wait_view(a, 'pending', 25)
        assert await a.evaluate("HW.TestMode._state().live.id") == live_b
        await a.click('.tm-start'); await wait_view(a, 'test'); await answer(a, True, 0); await a.wait_for_timeout(600)
        await a.click('#testmode .tm-submit'); await a.click('.tm-modal .btn-primary'); await wait_view(a, 'end')
        await a.wait_for_timeout(5500)
        cl = get('action=tctl&key=testkey&class=10c-b&op=close'); print('class test closed:', cl.get('closed'))
        await tp.evaluate("(sid) => HW.DashTests.openResults(sid)", live_b); await tp.wait_for_selector('.tt-res', timeout=15000)
        await tp.click('.tt-acts .btn:has-text("Save marks")'); await tp.wait_for_selector('.tt-acts .btn:has-text("Marks saved")', timeout=10000)
        mine = get('action=myretests&class=10c-b&name=Ava%20Brown&token=' + await a.evaluate("HW.App.session().token"))
        st = sorted(x['status'] for x in mine['retests']); print('requests now:', st); assert st == ['cancelled', 'done'], st
        # ---- back on the Retests tab ----
        await tp.evaluate("localStorage.setItem('hw:ttab','retests')"); await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.rt-tbl, .rt-empty, .panel', timeout=15000)
        await tp.wait_for_timeout(800)
        tog = tp.locator('.rt-old h3 button')
        if await tog.count(): await tog.first.click(); await tp.wait_for_timeout(300)
        body = await tp.inner_text('.rt-old'); print('retests tab:', ' '.join(body.split())[:900])
        assert 'Ava Brown' in body
        chips = await tp.evaluate("[...document.querySelectorAll('.rt-old tr:has(.tag) .rt-test')].slice(0, 2).map(b => b.className + ' | ' + b.innerText)"); print('tests chips:', chips)
        assert len(chips) == 2 and 'best' in chips[1] and 'Retest' in chips[1] and 'not marked' not in ' '.join(chips), chips
        await tp.screenshot(path='/tmp/rt_t_written.png', full_page=True)
        # ---- another retest needs the extra practice too ----
        await a.goto(BASE + '?class=10c-b'); await a.wait_for_selector('.lesson-row'); await a.wait_for_timeout(500)
        if await a.locator('#testmode .tm-start').count():  # the class test pops up: dismissing isn't possible, so just read the home page underneath
            pass
        t = await wait_rt(a, 'Another retest'); print('after one retest:', t); assert 'extra practice left' in t, t
        await a.evaluate(EXTRAS, 1); await home(a); t = await wait_rt(a, 'Request another retest'); print('with extras:', t)
        await b.close()
    errs = [e for e in errs if 'Cancel your retest request' not in e]   # the confirm is accepted
    print('errors:', errs)
    assert not errs
    print('PASS')
asyncio.run(main())
