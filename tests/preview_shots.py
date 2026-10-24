"""Screenshots of a ready-made test or exit slip exactly as a student sees it in test mode (the dashboard's Preview):
every page, with the answers shown under each part, plus a list of problems (KaTeX errors, warnings, parts with no input).
  python3 tests/preview_shots.py u2test [--out /tmp/shots] [--version 3] [--no-answers] [--width 1280]
  python3 tests/preview_shots.py u2l3x
Needs the static server for the repo root on 8811 (python3 -m http.server 8811). Nothing is sent anywhere.
Prints one line per page: page number, parts, problems; screenshots are <out>/<id>_v<version>_p<page>.png."""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'
args = sys.argv[1:]
LID = args[0]
def opt(name, default):
    return args[args.index(name) + 1] if name in args else default
OUT = opt('--out', '/tmp/shots'); VER = int(opt('--version', '0')); W = int(opt('--width', '1280'))
ANS = '--no-answers' not in args
os.makedirs(OUT, exist_ok=True)
CONFIG = "var HW_CONFIG = { siteName: 'Math 10C Practice', backend: '' };"

async def main():
    errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': W, 'height': 860})
        for pat in ('**/fonts.googleapis.com/**', '**/script.google.com/**', '**/cdn.jsdelivr.net/**'):
            await ctx.route(pat, lambda r: r.abort())
        await ctx.route(BASE + 'js/config.js', lambda r: r.fulfill(status=200, content_type='application/javascript', body=CONFIG))
        pg = await ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(BASE + '#/')
        await pg.wait_for_function('window.HW && HW.lessons && HW.TestCore')
        ok = await pg.evaluate("""(lid) => { const l = HW.lessons[lid]; if (!l) return 'no such lesson: ' + lid;
          const TC = HW.TestCore, def = { title: l.title, kind: l.exit ? 'exit' : 'test', unit: l.unit, timing: 'none', calc: l.calc !== false, levels: true,
            items: l.items.filter(it => !TC.NO_TEST[TC.inputType(l, it)]).map(it => ({ l: l.id, i: it.id })) };
          localStorage.setItem('hw:tmpreview', JSON.stringify({ def, at: Date.now() })); return 'ok'; }""", LID)
        if ok != 'ok': print(ok); await b.close(); return
        await pg.goto(BASE + '#/preview'); await pg.reload()
        await pg.wait_for_selector('.tm-start', timeout=15000)
        for v in range(VER):
            await pg.click('.tm-start'); await pg.wait_for_selector('.tm-preview-bar')
            await pg.click('.tm-preview-bar .btn:has-text("New numbers")'); await pg.wait_for_selector('.tm-start')
        await pg.click('.tm-start'); await pg.wait_for_selector('.tm-preview-bar')
        if ANS:
            await pg.click('.tm-preview-bar .btn:has-text("Show answers")'); await pg.wait_for_timeout(200)
        n = await pg.locator('#testmode .tm-qn').count()
        print(LID, 'version', VER, '·', n, 'pages')
        for i in range(n):
            await pg.click('#testmode .tm-qn >> nth=%d' % i); await pg.wait_for_timeout(150)
            info = await pg.evaluate("""() => { const c = document.querySelector('#testmode .tm-card'), parts = c.querySelectorAll('.tm-part');
              const probs = [];
              if (c.querySelectorAll('.katex-error').length) probs.push('KaTeX error: ' + [...c.querySelectorAll('.katex-error')].map(e => e.title || e.textContent).join(' / ').slice(0, 200));
              if (c.querySelector('.notice.warn')) probs.push('warning: ' + c.querySelector('.notice.warn').textContent.slice(0, 120));
              if (c.querySelectorAll('.qinput').length < parts.length) probs.push('a part has no input');
              const r = c.getBoundingClientRect(); if (c.scrollWidth > c.clientWidth + 2) probs.push('wider than the card (sideways scroll)');
              return { parts: parts.length, label: (document.querySelector('#testmode .tm-nrow.on .tm-qn') || {}).textContent || '', probs, h: Math.round(r.height) }; }""")
            print('  page %d (Q%s): %d part(s)%s' % (i + 1, info['label'].strip(), info['parts'], ('  PROBLEMS: ' + ' | '.join(info['probs'])) if info['probs'] else ''))
            # the page scrolls inside the overlay: make the window tall enough to show all of it, then shoot the whole window
            need = await pg.evaluate("() => Math.max(...[document.scrollingElement, ...document.querySelectorAll('#testmode, #testmode *')].filter(e => e && e.scrollHeight > e.clientHeight + 4).map(e => e.scrollHeight - e.clientHeight), 0)")
            await pg.set_viewport_size({'width': W, 'height': min(6000, 860 + need)}); await pg.wait_for_timeout(120)
            await pg.screenshot(path=os.path.join(OUT, '%s_v%d_p%02d.png' % (LID, VER, i + 1)))
            await pg.set_viewport_size({'width': W, 'height': 860})
        await b.close()
    print('page errors:', errs or 'none')
asyncio.run(main())
