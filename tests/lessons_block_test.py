"""The teacher's block chooser on the lesson pages (lessons/js/share.js): the blocks come from the Teaching Hub's schedule
(teaching/js/courses.js) and the block that's on is picked from the clock. The same file is in math10c, math15 and
math20-1; each copy tests its own repo (the folder it sits in).
Needs the folder holding the repos side by side (teaching, math10c, math15, math20-1) served on 8860
(cd /home/claude && python3 -m http.server 8860), so the lesson pages reach ../../../../teaching/js/courses.js.
Fake clock: page.clock.set_fixed_time, America/Edmonton. The hub's data is put in localStorage['teach/hub'] (TEACH_BACKEND
is '' so nothing goes to the real hub, except in the refresh check, which mocks it). The ink backend is mocked too."""
import asyncio, json, os, sys
from datetime import datetime
from zoneinfo import ZoneInfo
from urllib.parse import urlparse, parse_qs
from playwright.async_api import async_playwright

REPO = os.path.basename(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ROOT = os.environ.get('ROOT', 'http://localhost:8860/')
LESSON = ROOT + REPO + '/lessons/u1/l1/'
TZ = 'America/Edmonton'
OTHER = {'math10c': 'math15', 'math15': 'math10c', 'math20-1': 'math15'}[REPO]
NS = {'math10c': '', 'math15': 'm15/', 'math20-1': 'm201/'}[REPO]  # js/ns.js puts this prefix on the site's browser storage
NAME = {'math10c': 'Math 10C', 'math15': 'Math 15', 'math20-1': 'Math 20-1'}[REPO]
BELL = {'day1': [['A', '09:00', '10:28'], ['B', '10:33', '12:00'], ['C', '12:45', '14:13'], ['D', '14:18', '15:45']],
        'day2': [['B', '09:00', '10:28'], ['A', '10:33', '12:00'], ['D', '12:45', '14:13'], ['C', '14:18', '15:45']],
        'fri': [['A', '09:00', '10:07'], ['B', '10:11', '11:18'], ['C', '11:48', '12:55'], ['D', '12:58', '14:05']]}
def sems(course_in_b_and_d=True):
    me = REPO if course_in_b_and_d else 'robotics'
    return [{'id': 's1', 'name': 'Semester 1', 'start': '2026-09-02', 'end': '2027-01-29', 'blocks': {
        'A': {'c': OTHER, 'cls': 'x-a', 'label': 'Other - Block A'},
        'B': {'c': me, 'cls': 'k-b', 'label': NAME + ' - Block B'},
        'C': None,
        'D': {'c': me, 'cls': 'k-d', 'label': NAME + ' - Block D (Room 2997)'}}}]
def dt(s):  # local Edmonton time
    return datetime.fromisoformat(s).replace(tzinfo=ZoneInfo(TZ))
def ms(s):  # → epoch ms
    return int(dt(s).timestamp() * 1000)
MON = '2026-11-09'; FRI = '2026-11-13'
fails = []
def check(cond, what):
    print(('ok   ' if cond else 'FAIL ') + what)
    if not cond: fails.append(what)

async def context(b, teacher=True, hub=True, semesters=None, backend=''):
    ctx = await b.new_context(viewport={'width': 1180, 'height': 820}, timezone_id=TZ, service_workers='block')
    ctx.polls, ctx.pushes, ctx.courses_js = [], [], []
    async def ink(route):
        r = route.request
        if r.method == 'POST':
            body = json.loads(r.post_data or '{}'); ctx.pushes.append(body.get('cls'))
            return await route.fulfill(status=200, content_type='application/json', body='{"ok":true}')
        q = parse_qs(urlparse(r.url).query)
        if 'callback' in q:  # JSONP (the stand-up break's class info): nothing to say
            return await route.fulfill(status=200, content_type='application/javascript', body=q['callback'][0] + '({"ok":false})')
        if (q.get('op') or [''])[0] == 'poll': ctx.polls.append((q.get('cls') or [''])[0])
        await route.fulfill(status=200, content_type='application/json', body=json.dumps({'ok': True, 'ops': [], 'epoch': 'e1', 'last': 1, 'more': False}))
    await ctx.route('**/script.google.com/**', ink)
    await ctx.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
    ctx.blockpick = []
    ctx.on('request', lambda r: ctx.courses_js.append(r.url) if r.url.endswith('/teaching/js/courses.js') else ctx.blockpick.append(r.url) if r.url.endswith('/lessons/js/blockpick.js') else None)
    init = "window.TEACH_BACKEND = %s;" % json.dumps(backend)
    if teacher: init += "localStorage.setItem('%sink:teacher', JSON.stringify('TEST01'));" % NS  # runs before ns.js: the raw key
    if hub:
        cache = {'at': 0, 'data': {'bell': BELL, 'noSchool': [], 'semesters': semesters if semesters is not None else sems()}}
        init += "if (!sessionStorage.getItem('bk-hub')) { var c = %s; c.at = Date.now(); localStorage.setItem('teach/hub', JSON.stringify(c)); sessionStorage.setItem('bk-hub', '1'); }" % json.dumps(cache)
    await ctx.add_init_script(init)
    return ctx

async def open_page(ctx, when, url, errs):
    page = await ctx.new_page()
    page.on('pageerror', lambda e: errs.append(str(e)))
    await page.clock.set_fixed_time(dt(when))
    await page.goto(url); await page.wait_for_timeout(900)
    return page

async def state(page):
    return await page.evaluate("""() => ({ q: new URL(location.href).searchParams.get('class'), badge: (document.querySelector('.share-badge') || {}).textContent || '',
      badgeCls: (document.querySelector('.share-badge') || {}).className || '' })""")

async def menu(page):
    await page.click('[data-act=menu]'); await page.wait_for_timeout(150)
    return await page.evaluate("""() => ({ chips: [...document.querySelectorAll('.mp-classes .chip')].map(c => c.dataset.cls + (c.classList.contains('on') ? '*' : '') + (c.classList.contains('now') ? '!' : '')),
      live: (document.querySelector('.mp-live') || {}).textContent || '', more: !!document.querySelector('[data-m=allblocks]'),
      link: (document.querySelector('.mp-link b') || {}).textContent || '', subs: [...document.querySelectorAll('.mp-classes .chip small')].map(s => s.textContent) })""")

async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        print('==', REPO, LESSON)

        # 1. Monday (Day 1) 10:40: Block B is on → B automatically, even from a page left on ?class=D; only B and D chips
        ctx = await context(b)
        page = await open_page(ctx, MON + 'T10:40:00', LESSON + '?class=D', errs)
        s = await state(page); print('  ', s)
        check(s['q'] == 'B' and 'Live · Block B' in s['badge'] and 'Auto' in s['badge'], 'Mon 10:40 (?class=D in the URL) → Live · Block B, Auto')
        check(set(ctx.polls) == {'B'}, 'ink is loaded from Block B only: %s' % sorted(set(ctx.polls)))
        m = await menu(page); print('  ', m)
        check(m['chips'] == ['B*!', 'D', ''], 'chips: only this course’s blocks this semester (B, D) + Off')
        check(m['subs'] == [NAME + ' - Block D (Room 2997)'], 'the hub’s class label shows when it says more than the block')
        check(m['more'], 'a small "Show all blocks" button')
        check(m['link'].endswith('/lessons/u1/l1/?class=B'), 'student link / QR use Block B: ' + m['link'])
        check('picked for you' in m['live'] and '12:00 pm' in m['live'], 'menu says it was picked automatically, until 12:00 pm')
        await page.click('[data-m=allblocks]'); await page.wait_for_timeout(100)
        chips = await page.evaluate("[...document.querySelectorAll('.mp-classes .chip')].map(c => c.dataset.cls)")
        check(chips == ['A', 'B', 'C', 'D', ''], 'Show all blocks → A–D (menu stays open): %s' % chips)
        await page.keyboard.press('Escape')
        # next-lesson card (no ?class) keeps Block B
        await page.click('a.next-l'); await page.wait_for_timeout(1000)
        s = await state(page)
        check('/u1/l2/' in page.url and s['q'] == 'B' and 'Live · Block B' in s['badge'], 'next-lesson card → still Block B: %s %s' % (page.url, s['badge']))

        # 2. manual override to D during B's period: lasts until 12:00
        await page.goto(LESSON); await page.wait_for_timeout(800)
        await menu(page); await page.click('.mp-classes .chip[data-cls=D]'); await page.wait_for_timeout(1000)
        s = await state(page)
        check(s['q'] == 'D' and 'Live · Block D' in s['badge'] and 'Manual' in s['badge'], 'pick D at 10:40 → Live · Block D, Manual')
        pick = await page.evaluate("JSON.parse(localStorage.getItem('ink:pick:%s'))" % REPO)
        check(pick and pick['cls'] == 'D' and pick['until'] == ms(MON + 'T12:00:00'), 'override remembered until 12:00: %s' % pick)
        m = await menu(page); check('your choice until 12:00 pm' in m['live'] and 'Back to automatic' in m['live'], 'menu: your choice until 12:00 pm · Back to automatic')
        await page.close()
        page = await open_page(ctx, MON + 'T11:59:00', LESSON.replace('/l1/', '/l2/'), errs)
        s = await state(page); check(s['q'] == 'D' and 'Block D' in s['badge'], '11:59, another lesson without ?class → still D (override)')
        await page.close()
        page = await open_page(ctx, MON + 'T12:00:30', LESSON + '?class=D', errs)
        s = await state(page); print('  ', s)
        check(s['q'] is None and 'Not live' in s['badge'] and 'notlive' in s['badgeCls'], '12:00:30 → override over, Not live (?class=D dropped)')
        await page.close(); await ctx.close()

        # 3. 12:20 Monday (lunch, then C — not this course) → Not live, the chips to pick one
        ctx = await context(b)
        polls0 = len(ctx.polls)
        page = await open_page(ctx, MON + 'T12:20:00', LESSON + '?class=B', errs)
        s = await state(page); print('  ', s)
        check(s['q'] is None and 'Not live' in s['badge'], 'Mon 12:20 → Not live')
        check(len(ctx.polls) == polls0 and not ctx.pushes, 'no ink loaded or sent for any class')
        m = await menu(page); print('  ', m)
        check(m['chips'] == ['B', 'D', '*'] and 'Not live' in m['live'] and 'Block D' in m['live'] and '2:18 pm' in m['live'], 'menu: Not live, next Block D at 2:18 pm, chips B D Off')
        # picking B at lunch lasts until this course's next class (D's window opens at 14:13), then D is automatic
        await page.click('.mp-classes .chip[data-cls=B]'); await page.wait_for_timeout(900)
        pick = await page.evaluate("JSON.parse(localStorage.getItem('ink:pick:%s'))" % REPO)
        s = await state(page); check(s['q'] == 'B' and 'Manual' in s['badge'] and pick['until'] == ms(MON + 'T14:13:00'), 'pick B at lunch → B until 2:13 pm (D’s class is next)')
        # left open into D's class: moves to D by itself
        await page.clock.set_fixed_time(dt(MON + 'T14:15:00'))
        await page.evaluate("document.dispatchEvent(new Event('visibilitychange'))"); await page.wait_for_timeout(2200)
        s = await state(page); check(s['q'] == 'D' and 'Live · Block D' in s['badge'] and 'Auto' in s['badge'], 'page left open into Block D → switches to D automatically: %s' % s)
        await page.wait_for_timeout(1500); s2 = await state(page); check(s2['q'] == 'D', 'and stays there (no reload loop)')
        await page.close(); await ctx.close()

        # 4. Friday 13:10 → Block D (short periods)
        ctx = await context(b)
        page = await open_page(ctx, FRI + 'T13:10:00', LESSON, errs)
        s = await state(page); check(s['q'] == 'D' and 'Live · Block D' in s['badge'], 'Fri 13:10 → Block D: %s' % s)
        await page.close()
        # 10:25 Monday (Block A, another course) → Not live; 10:29 (A is over, B is next) → B
        page = await open_page(ctx, MON + 'T10:25:00', LESSON, errs)
        s = await state(page); check('Not live' in s['badge'], 'Mon 10:25 (Block A, another course) → Not live')
        await page.close()
        page = await open_page(ctx, MON + 'T10:29:00', LESSON, errs)
        s = await state(page); check(s['q'] == 'B', 'Mon 10:29 (between A and B) → Block B')
        await page.close(); await ctx.close()

        # 5. a day off → Not live
        ctx = await context(b, semesters=sems())
        await ctx.add_init_script("var c = JSON.parse(localStorage.getItem('teach/hub')); c.data.noSchool = ['2026-11-11']; localStorage.setItem('teach/hub', JSON.stringify(c));")
        page = await open_page(ctx, '2026-11-11T10:40:00', LESSON, errs)
        s = await state(page); check('Not live' in s['badge'], 'Remembrance Day (day off) 10:40 → Not live')
        await page.close(); await ctx.close()

        # 6. a course not on the schedule → the note + Show all blocks; ?class works as before
        ctx = await context(b, semesters=sems(False))
        page = await open_page(ctx, MON + 'T10:40:00', LESSON + '?class=C', errs)
        s = await state(page); check(s['q'] == 'C' and 'Live · Block C' in s['badge'], 'not on the schedule: ?class=C used as before')
        m = await menu(page); print('  ', m)
        check("isn’t on this semester’s schedule" in m['live'] and m['chips'] == ['C*', ''] and m['more'], 'note + only the current block + Off + Show all blocks')
        await page.click('[data-m=allblocks]'); await page.wait_for_timeout(100)
        chips = await page.evaluate("[...document.querySelectorAll('.mp-classes .chip')].map(c => c.dataset.cls)")
        check(chips == ['A', 'B', 'C', 'D', ''], 'Show all blocks → A–D')
        await page.close(); await ctx.close()
        # no schedule on the device at all
        ctx = await context(b, semesters=[])
        page = await open_page(ctx, MON + 'T10:40:00', LESSON, errs)
        m = await menu(page); check('No schedule from the Teaching Hub' in m['live'] and m['more'], 'no schedule yet → says so + Show all blocks')
        await page.close(); await ctx.close()

        # 7. courses.js can't load → the old A–D chips, ?class decides
        ctx = await context(b)
        await ctx.route('**/teaching/js/courses.js', lambda r: r.abort())
        page = await open_page(ctx, MON + 'T12:20:00', LESSON + '?class=C', errs)
        s = await state(page); check(s['q'] == 'C' and 'Live · Block C' in s['badge'], 'courses.js blocked → ?class=C as before')
        m = await menu(page); check(m['chips'] == ['A', 'B', 'C*', 'D', ''] and 'Couldn’t load your schedule' in m['live'], 'A–D chips + a note')
        await page.close(); await ctx.close()

        # 8. nothing cached yet: the hub is fetched (mocked backend) and Block B is picked
        ctx = await context(b, hub=False, backend='http://hub.test/exec')
        hubdata = {'ok': True, 'bell': BELL, 'noSchool': [], 'semesters': sems()}
        await ctx.route('http://hub.test/**', lambda r: r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body=json.dumps(hubdata)))
        page = await open_page(ctx, MON + 'T10:40:00', LESSON, errs)
        s = await state(page); check(s['q'] == 'B' and 'Live · Block B' in s['badge'], 'no cache → hub fetched → Block B: %s' % s)
        await page.close(); await ctx.close()

        # 9. the lessons home (lessons/index.html): the same blocks and rules for its "Open lessons for" buttons
        HOME = ROOT + REPO + '/lessons/'
        async def home(page):
            return await page.evaluate("""() => ({ btns: [...document.querySelectorAll('#cls button[data-c]')].map(b => b.dataset.c + (b.classList.contains('on') ? '*' : '') + (b.classList.contains('now') ? '!' : '')),
              st: (document.querySelector('#cls .st') || {}).textContent || '', all: !!document.querySelector('#cls [data-all]'),
              rows: [...document.querySelectorAll('a.row')].map(a => a.getAttribute('href')) })""")
        ctx = await context(b)
        await ctx.add_init_script("localStorage.setItem('%slessons:class', 'D');" % NS)   # a stale class from last time
        page = await open_page(ctx, MON + 'T10:40:00', HOME + '?class=D', errs)
        h = await home(page); print('  ', {k: h[k] for k in ('btns', 'st', 'all')}, h['rows'][:2])
        check(h['btns'] == ['B*!', 'D', ''] and h['all'], 'home 10:40: buttons B (on now, picked) and D + No class + Show all blocks')
        check('Block B is on now (until 12:00 pm)' in h['st'], 'home says Block B is on now, picked from the schedule')
        check(h['rows'] and all(r.endswith('/?class=B') for r in h['rows']), 'home: every lesson link opens for Block B (not the stale D)')
        await page.click('#cls button[data-c=D]'); await page.wait_for_timeout(150)
        h = await home(page)
        check(h['btns'][:2] == ['B!', 'D*'] and 'Your pick until 12:00 pm' in h['st'] and all(r.endswith('/?class=D') for r in h['rows']), 'home: pick D → links ?class=D, “Your pick until 12:00 pm”')
        await page.click('a.row >> nth=0'); await page.wait_for_timeout(1000)
        s = await state(page); check(s['q'] == 'D' and 'Manual' in s['badge'], 'a lesson opened from the home after picking D → Block D (manual), not overridden')
        await page.close()
        page = await open_page(ctx, MON + 'T12:20:00', HOME, errs)
        h = await home(page); print('  ', {k: h[k] for k in ('btns', 'st')})
        check(h['btns'] == ['B', 'D', '*'] and 'next: Block D at 2:18 pm' in h['st'] and all('?class' not in r for r in h['rows']), 'home 12:20: no class picked, “next: Block D at 2:18 pm”, links without ?class')
        await page.close(); await ctx.close()
        # home with nothing cached (e.g. the iPad home-screen app): the background refresh fills the buttons in
        ctx = await context(b, hub=False, backend='http://hub.test/exec')
        async def slow_hub(r):
            await asyncio.sleep(1.2)
            await r.fulfill(status=200, content_type='application/json', headers={'Access-Control-Allow-Origin': '*'}, body=json.dumps(hubdata))
        await ctx.route('http://hub.test/**', slow_hub)
        page = await open_page(ctx, MON + 'T10:40:00', HOME, errs)
        await page.wait_for_timeout(1500)
        h = await home(page); check(h['btns'] == ['B*!', 'D', ''], 'home, no cache: after the hub arrives → B (on now) and D: %s' % h['btns'])
        await page.close(); await ctx.close()
        # home when courses.js can't load: the A–D buttons as before
        ctx = await context(b)
        await ctx.route('**/teaching/js/courses.js', lambda r: r.abort())
        await ctx.add_init_script("localStorage.setItem('%slessons:class', 'C');" % NS)
        page = await open_page(ctx, MON + 'T10:40:00', HOME, errs)
        h = await home(page); check(h['btns'] == ['A', 'B', 'C*', 'D', ''] and not h['st'], 'home, courses.js blocked → A–D, last class (C) as before')
        await page.close(); await ctx.close()

        # 10. students: nothing extra loaded
        ctx = await context(b, teacher=False)
        page = await open_page(ctx, MON + 'T10:40:00', LESSON + '?class=D', errs)
        s = await state(page); t = await page.evaluate("typeof window.TEACH")
        check(not ctx.courses_js and not ctx.blockpick and t == 'undefined', 'student: courses.js / blockpick.js not loaded')
        check(s['q'] == 'D' and 'Live notes · Block D' in s['badge'] and set(ctx.polls) == {'D'}, 'student: sees ?class=D as before')
        await page.goto(HOME); await page.wait_for_timeout(700)
        check(not ctx.courses_js and not ctx.blockpick and not await page.evaluate("!!document.querySelector('#cls button')"), 'student on the home: no class buttons, nothing extra loaded')
        await page.close(); await ctx.close()
        await b.close()
    check(not errs, 'no page errors %s' % errs[:3])
    print('PASS' if not fails else 'FAIL (%d)' % len(fails))
    sys.exit(1 if fails else 0)
asyncio.run(main())
