"""The Teacher Ledger's quick start (teacher/fast.js + dash.js). Needs the static server and tests/restart_mock.sh (the same ports as tests/ledger_ui_test.py).
Checks, with a slow ledger (1.5 s an answer) and a slow question bank (3 s):
  1. first visit: the class list and the class are asked for at once, once each, and the Live tab is up before the
     question bank; the other tabs say they're loading and fill in when the bank arrives;
  2. next visit: this device's saved copy is on screen before the ledger answers, then the fresh data replaces it;
  3. the ledger can't be reached: the saved copy stays up and says so, then recovers;
  4. another class: its saved copy shows at once; a ?class= link is honoured;
  5. the demo class waits for the bank; "Forget the teacher key" and a bad key erase the saved copy."""
import asyncio, json, os, re, sys, time, urllib.request, urllib.parse
from playwright.async_api import async_playwright
# this course's own settings: the test ports (as in tests/ledger_ui_test.py), the storage prefix (js/ns.js) and the site name
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
def read(*a):
    try: return open(os.path.join(ROOT, *a), encoding='utf-8').read()
    except OSError: return ''
_ui = read('tests', 'ledger_ui_test.py')
BASE = (re.search(r"BASE = '([^']+)'", _ui) or [0, 'http://localhost:8811/'])[1]; MOCK = (re.search(r"MOCK = '([^']+)'", _ui) or [0, 'http://localhost:8765/'])[1]
NS = (re.search(r"var P = '([^']*)'", read('js', 'ns.js')) or [0, ''])[1]
SITE = (re.search(r"siteName: '([^']+)'", read('js', 'config.js')) or [0, 'Practice'])[1]
CONFIG = "var HW_CONFIG = { siteName: '%s', backend: '%s' };" % (SITE, MOCK)
API_DELAY, BANK_DELAY = 1.5, 3.0

def get(q): return json.loads(urllib.request.urlopen(MOCK + '?' + q).read())

async def main():
    # two classes on the mock ledger
    for code, names in (('10c-b', 'Ava Brown\nBen Lee\nRyan Cathcart'), ('10c-d', 'Cy Young\nDee Dee')):
        get('action=setroster&key=testkey&class=%s&label=%s&names=%s&mode=add' % (code, urllib.parse.quote('Block ' + code[-1].upper()), urllib.parse.quote(names)))
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1500, 'height': 950})
        # (runs before js/ns.js, so the keys are written with the course's prefix; window.name survives a reload)
        await ctx.add_init_script("if (!localStorage.getItem('%shw:tkey') && window.name !== 'nokey') { localStorage.setItem('%shw:tkey','testkey'); localStorage.setItem('%shw:tclass','10c-b'); localStorage.setItem('%shw:ttab','live'); }" % (NS, NS, NS, NS))
        pg = await ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        state = {'api': API_DELAY, 'bank': BANK_DELAY, 'down': False}; reqs = []
        await pg.route('**/js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        async def api(route):
            u = route.request.url; a = urllib.parse.parse_qs(urllib.parse.urlparse(u).query).get('action', ['?'])[0]
            reqs.append((a, time.time()))
            if state['down']: return await route.abort()
            await asyncio.sleep(state['api']); await route.continue_()
        await pg.route(MOCK + '**', api)
        async def bank(route): await asyncio.sleep(state['bank']); await route.continue_()
        await pg.route('**/js/lessons/**', bank); await pg.route('**/js/exits/**', bank)
        def count(a): return len([r for r in reqs if r[0] == a])
        async def js(s): return await pg.evaluate(s)

        # ---- 1. first visit on this device
        t0 = time.time(); await pg.goto(BASE + 'teacher/', wait_until='commit')
        await pg.wait_for_selector('.live-head', timeout=15000); t_live = time.time() - t0
        bank_in = await js("Object.keys(HW.lessons).length"); marks = await js("HW.Dash.timing()")
        print('1. Live tab after %.1f s; lessons loaded then: %d; marks %s' % (t_live, bank_in, marks))
        assert bank_in == 0, 'Live should be drawn before the question bank'
        assert t_live < API_DELAY + 1.2, 'class list and class should be asked for together (not one after the other)'
        first = {a: t for a, t in reversed(reqs)}; assert abs(first['classes'] - first['dash']) < 0.3 and abs(first['cal'] - first['dash']) < 0.3
        assert 'Ava Brown' in await pg.inner_text('.tab-body') and 'Updated' in await pg.inner_text('.top-upd')
        assert await pg.locator('.top-launch').count() == 0, 'header lesson buttons wait for the bank'
        await pg.click('.tab[data-tab="progress"]'); assert 'Loading the question bank' in await pg.inner_text('.tab-body')
        await pg.wait_for_selector('.tbl.prog', timeout=15000); t_bank = time.time() - t0
        assert await js("Object.keys(HW.lessons).length") > 20 and await pg.locator('.top-launch').count() == 1
        await pg.wait_for_timeout(2500)   # the background loads for the other tabs
        print('   Progress filled in after %.1f s; requests: %s' % (t_bank, {a: count(a) for a in sorted(set(r[0] for r in reqs))}))
        assert count('classes') == 1 and count('dash') == 1 and count('cal') == 1, 'no request should be made twice'
        await pg.click('.tab[data-tab="live"]')

        # ---- 2. next visit: the saved copy first
        reqs.clear(); state['api'] = 3.0; t0 = time.time(); await pg.goto(BASE + 'teacher/', wait_until='commit')
        await pg.wait_for_selector('.top-upd.is-saved', timeout=5000); t_saved = time.time() - t0
        txt = await pg.inner_text('.top-upd'); body = await pg.inner_text('.tab-body')
        print('2. saved copy after %.2f s: "%s"' % (t_saved, txt))
        assert t_saved < 1.5 and 'Saved copy from' in txt and 'updating' in txt and 'Ava Brown' in body
        assert await pg.locator('.class-pick option').count() >= 2
        await pg.wait_for_selector('.top-upd:not(.is-saved)', timeout=10000); t_fresh = time.time() - t0
        tip = await pg.get_attribute('.top-upd', 'title'); print('   fresh after %.1f s; tooltip: %s' % (t_fresh, tip.replace('\n', ' | ')))
        assert 'Updated' in await pg.inner_text('.top-upd') and 'saved copy shown after' in tip and 'Fresh data' in tip
        assert count('classes') == 1 and count('dash') == 1

        # ---- 3. the ledger can't be reached
        reqs.clear(); state['down'] = True; state['api'] = 0.2; await pg.goto(BASE + 'teacher/', wait_until='commit')
        await pg.wait_for_function("(document.querySelector('.top-upd') || {}).textContent && document.querySelector('.top-upd').textContent.includes('can’t reach')", timeout=15000)
        assert 'Ava Brown' in await pg.inner_text('.tab-body'); print('3. offline: "%s"' % await pg.inner_text('.top-upd'))
        state['down'] = False
        await pg.wait_for_selector('.top-upd:not(.is-saved)', timeout=40000); print('   recovered: "%s"' % await pg.inner_text('.top-upd'))

        # ---- 4. another class, then back (its copy shows while the fresh one is on its way); ?class= link
        state['api'] = 1.5
        await pg.select_option('.class-pick', '10c-d'); await pg.wait_for_function("document.querySelector('.tab-body').innerText.includes('Cy Young')", timeout=10000)
        await pg.wait_for_selector('.top-upd:not(.is-saved)'); await pg.wait_for_timeout(300)
        t0 = time.time(); await pg.select_option('.class-pick', '10c-b'); await pg.wait_for_function("document.querySelector('.tab-body').innerText.includes('Ava Brown')", timeout=10000); t_sw = time.time() - t0
        saved = await pg.locator('.top-upd.is-saved').count(); print('4. back to Block B after %.2f s (saved copy: %s)' % (t_sw, bool(saved))); assert t_sw < 1.0 and saved == 1
        await pg.wait_for_selector('.top-upd:not(.is-saved)', timeout=10000)
        reqs.clear(); t0 = time.time(); await pg.goto(BASE + 'teacher/?class=10c-d&tab=live', wait_until='commit')
        await pg.wait_for_function("document.querySelector('.tab-body') && document.querySelector('.tab-body').innerText.includes('Cy Young')", timeout=10000)
        print('   ?class=10c-d after %.2f s' % (time.time() - t0)); assert time.time() - t0 < 1.5
        await pg.wait_for_selector('.top-upd:not(.is-saved)', timeout=10000); assert count('dash') == 1

        # ---- 5. demo class (built from the bank); forget the key; bad key
        await pg.wait_for_selector('.top-launch', timeout=15000)   # the bank is in
        await pg.select_option('.class-pick', '__demo__'); await pg.wait_for_function("document.querySelector('.tab-body').innerText.includes('Ava Martin')", timeout=20000)
        reqs.clear(); await pg.goto(BASE + 'teacher/', wait_until='commit'); await pg.wait_for_function("document.querySelector('.tab-body') && document.querySelector('.tab-body').innerText.includes('Ava Martin')", timeout=20000)
        assert count('dash') == 0; print('5. demo class opens (after the bank), no dash request')
        await pg.select_option('.class-pick', '10c-b'); await pg.wait_for_selector('.top-upd:not(.is-saved)', timeout=10000)
        async def n_saved(): return await js("new Promise(res => { indexedDB.databases().then(async ds => { let n = 0; for (const d of ds) { if (!/^hw-ledger-fast/.test(d.name)) continue; await new Promise(r => { const o = indexedDB.open(d.name); o.onsuccess = () => { const c = o.result.transaction('kv').objectStore('kv').count(); c.onsuccess = () => { n += c.result; o.result.close(); r(); }; }; }); } res(n); }); })")
        n1 = await n_saved(); assert n1 >= 3, n1
        await pg.click('.tab[data-tab="settings"]'); await js("window.name = 'nokey'")
        await pg.click('button:has-text("Forget the teacher key")'); await pg.wait_for_selector('.signin-card'); await pg.wait_for_timeout(300)
        n2 = await n_saved(); print('   saved entries before/after "Forget the teacher key": %d / %d' % (n1, n2)); assert n2 == 0
        await pg.fill('.signin-card input', 'wrong'); await pg.click('.signin-card button'); await pg.wait_for_selector('.signin-card .notice'); assert await n_saved() == 0
        await pg.fill('.signin-card input', 'testkey'); await pg.click('.signin-card button'); await pg.wait_for_selector('.tabs', timeout=15000)
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
