"""The PowerSchool tab with the demo class: score files (practice, the exit slip, the Unit 1 Test) in the template layout, the
zip, and report card comments (pronouns, IPP sentence, edits). Needs the static server (8811) and the mock (8765)."""
import asyncio, io, json, sys, zipfile, csv
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'; MOCK = 'http://localhost:8765/'
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '%s' };" % MOCK
OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp'
async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1400, 'height': 950}, accept_downloads=True)
        await ctx.add_init_script("localStorage.setItem('hw:tkey','testkey'); localStorage.setItem('hw:tclass','__demo__'); localStorage.setItem('hw:ttab','powerschool');")
        tp = await ctx.new_page(); tp.on('pageerror', lambda e: errs.append(str(e))); tp.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        await tp.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        await tp.goto(BASE + 'teacher/'); await tp.wait_for_selector('.ps-list', timeout=30000)
        rows = await tp.evaluate("[...document.querySelectorAll('.ps-list tbody tr')].map(r => r.classList.contains('ps-grp') ? '## ' + r.innerText.split('\\n')[0] : (r.querySelector('.ps-name')||{}).value + ' | ' + r.innerText.replace(/\\s+/g,' '))")
        print('\n'.join(rows))
        await tp.screenshot(path=OUT + '/ps_tab.png', full_page=False)
        # one file
        async with tp.expect_download() as dl:
            await tp.click('.ps-list tr:has(.ps-name) >> nth=0 >> .ps-act button:has-text("Download")')
        d = await dl.value; path = OUT + '/' + d.suggested_filename; await d.save_as(path)
        raw = open(path, 'rb').read(); print(d.suggested_filename, repr(raw[:260]))
        assert raw.startswith(b'Teacher Name:,') and b'\r\nStudent Num,Student Name,Score\r\n' in raw
        # the zip
        async with tp.expect_download() as dl:
            await tp.click('button:has-text("Download the checked files")')
        z = await dl.value; zp = OUT + '/' + z.suggested_filename; await z.save_as(zp)
        zf = zipfile.ZipFile(zp); assert zf.testzip() is None; names = zf.namelist(); print('zip:', names)
        for n in names:
            txt = zf.read(n).decode('utf-8'); lines = txt.split('\r\n')
            print(' ', n, '→', lines[2], '|', ' ; '.join(lines[8:12]))
        # comments
        await tp.wait_for_selector('.rc-tbl tbody tr')
        cm = await tp.evaluate("[...document.querySelectorAll('.rc-tbl tbody tr')].map(r => r.querySelector('.rc-name').innerText + ' [' + r.querySelector('.rc-s select').selectedOptions[0].text + ' / ' + r.querySelector('.rc-g select').selectedOptions[0].text + ']: ' + r.querySelector('.rc-text').value + ' (' + r.querySelector('.rc-meta').innerText + ')')")
        print('\n'.join(cm))
        await tp.locator('.rc-panel').screenshot(path=OUT + '/rc_panel.png')
        # set Jack's pronouns → his comment changes
        before = await tp.locator('.rc-tbl tr:has-text("Jack Thompson") .rc-text').input_value()
        await tp.locator('.rc-tbl tr:has-text("Jack Thompson") .rs-prosel').select_option('he'); await tp.wait_for_timeout(300)
        after = await tp.locator('.rc-tbl tr:has-text("Jack Thompson") .rc-text').input_value()
        print('Jack before:', before); print('Jack after: ', after)
        # an edit, then download
        await tp.locator('.rc-tbl tr:has-text("Ava Martin") .rc-text').fill('Ava wrote this herself.')
        async with tp.expect_download() as dl:
            await tp.click('button:has-text("Download comments")')
        c = await dl.value; cp = OUT + '/' + c.suggested_filename; await c.save_as(cp)
        rows = list(csv.reader(io.StringIO(open(cp, encoding='utf-8-sig').read())))
        print('comments csv:', rows[0]); print(rows[1][:3]); 
        sophie = [r for r in rows if r[1] == 'Sophie Nguyen'][0]; print('Sophie:', sophie[2])
        assert 'individual program plan (IPP)' in sophie[2]
        assert [r for r in rows if r[1] == 'Ava Martin'][0][2].startswith('Ava wrote this herself.')
        assert 'for her success' in sophie[2] and sophie[2].count('Sophie is on an individual program plan') == 1
        bad = [r[1] for r in rows[1:] if any(w in r[2] for w in ['finish the semester strong', 'look forward', 'this term'])]; assert not bad, bad
        await b.close()
    errs = [e for e in errs if 'ERR_TUNNEL' not in e and 'Failed to load resource' not in e]
    print('errors', errs); assert not errs; print('PASS')
asyncio.run(main())
