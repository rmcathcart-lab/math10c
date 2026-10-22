"""Settings → class list: update a class from a PowerSchool scores template (a made-up one in tests/fixtures), the match
preview, student numbers / pronouns / IPP saved per student, and a new class made from a template. Needs 8811 + mock 8765."""
import asyncio, json, urllib.request
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
FIX = 'tests/fixtures/ps_template_sample.csv'
def get(q): return json.load(urllib.request.urlopen(MOCK + '?key=testkey&' + q))
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1300, 'height': 900})
        await ctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','10c-b'); localStorage.setItem('hw:ttab','settings'); localStorage.setItem('hw:nodemo','1');")
        tp = await ctx.new_page(); tp.on('pageerror', lambda e: errs.append(str(e)))
        tp.on('dialog', lambda d: asyncio.ensure_future(d.accept()))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.roster-tbl')
        await tp.set_input_files('.panel:has(.roster-tbl) .ps-file input', FIX); await tp.wait_for_selector('.ps-preview .ps-sum')
        pv = await tp.inner_text('.ps-preview'); print(pv)
        assert 'Ben Alexander Lee → Ben Lee' in pv and 'Cara New' in pv and 'Ryan Cathcart' in pv
        await tp.check('.ps-preview input[type=checkbox]')   # remove Ryan Cathcart
        await tp.click('.ps-preview button:has-text("Update the class list")'); await tp.wait_for_timeout(1500)
        d = get('action=dash&class=10c-b'); print([(r['name'], r['num']) for r in d['roster']], d['class'].get('ps'))
        assert sorted(r['name'] for r in d['roster']) == ['Ava Brown', 'Ben Lee', 'Cara New', 'Dee, Jr.']
        assert {r['name']: r['num'] for r in d['roster']}['Ben Lee'] == '11110002'
        await tp.wait_for_selector('.roster-tbl tr:has-text("Cara New")')
        await tp.locator('.roster-tbl tr:has-text("Cara New") .rs-prosel').select_option('they')
        await tp.locator('.roster-tbl tr:has-text("Cara New") .rs-ippl input').check()
        await tp.locator('.roster-tbl tr:has-text("Ava Brown") .rs-numin').fill('11119999'); await tp.locator('.roster-tbl tr:has-text("Ava Brown") .rs-numin').press('Tab')
        await tp.wait_for_timeout(1200)
        d = get('action=dash&class=10c-b'); R = {r['name']: r for r in d['roster']}; print(R['Cara New'], R['Ava Brown']['num'])
        assert R['Cara New']['pronouns'] == 'they' and R['Cara New']['ipp'] and R['Ava Brown']['num'] == '11119999'
        await tp.screenshot(path='/tmp/ps_roster.png', full_page=True)
        # a new class from the template
        await tp.set_input_files('.panel:has-text("New class") .ps-file input', FIX); await tp.wait_for_timeout(300)
        names = await tp.locator('.panel:has-text("New class") textarea').input_value(); print('names box:', names.replace('\n', ' / '))
        await tp.fill('.panel:has-text("New class") input[placeholder^="Class code"]', '10c-t')
        await tp.click('.panel:has-text("New class") button:has-text("Create class")'); await tp.wait_for_timeout(1500)
        d = get('action=dash&class=10c-t'); print([(r['name'], r['num']) for r in d['roster']], d['class'].get('label'))
        assert len(d['roster']) == 4 and all(r['num'] for r in d['roster']) and d['class']['label'] == 'Mathematics 10C'
        # its PowerSchool tab (no work yet)
        await tp.click('.tab:has-text("PowerSchool")'); await tp.wait_for_selector('.rc-tbl', timeout=20000)
        print(' '.join((await tp.inner_text('.ps-panel')).split())[:400])
        await b.close()
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
