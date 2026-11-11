"""Every lesson page under lessons/ (and the lessons home, lessons/index.html) loads from the combined repo: no page errors or missing files, KaTeX renders,
the shared calculator opens, explainers mount, and the assignment link points at the practice site in this repo.
Needs a static server for the repo root on 8811. Optional: COMPARE=http://localhost:8812/ (the old teaching repo)
prints the same numbers for the old site."""
import asyncio, os, re
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'
IDS = ['u1/l1', 'u1/l2', 'u1/l3', 'u1/l4', 'u1/l5', 'u1/l6', 'u1/l7', 'u1/l8', 'u1/l9', 'u2/l1',
       'u2/l2', 'u2/l3', 'u2/l4', 'u2/l5', 'u2/l6', 'u3/l1', 'u3/l2', 'u3/l3', 'u3/l4', 'u3/l5',
       'u3/l6', 'u4/l1', 'u4/l2', 'u4/l3', 'u4/l4', 'u4/l5', 'u4/l6', 'u4/l7', 'u4/l8', 'u5/l1',
       'u5/l2', 'u5/l3', 'u5/l4', 'u5/l5', 'u5/l6', 'u5/l7', 'u5/l8', 'u5/l9', 'u6/l1', 'u6/l2',
       'u6/l3', 'u6/l4', 'u6/l5', 'u7/l1', 'u7/l2', 'u7/l3', 'u7/l4', 'u7/l5', 'u7/l6', 'u7/l7',
       'u8/l1', 'u8/l2', 'u8/l3', 'u8/l4', 'u8/l5', 'u8/l6', 'u9/l1', 'u9/l2', 'u9/l3', 'u9/l4',
       'u9/l5', 'u9/l6', 'u9/l7', 'u9/l8', 'u10/l1', 'u10/l2', 'u10/l3', 'u10/l4', 'u10/l5', 'u10/l6']
async def probe(ctx, url):
    page = await ctx.new_page(); errs, bad = [], []
    page.on('pageerror', lambda e: errs.append(str(e)))
    page.on('console', lambda m: errs.append(m.text) if m.type == 'error' and 'script.google.com' not in m.text and 'Failed to load resource' not in m.text else None)
    page.on('response', lambda r: bad.append(str(r.status) + ' ' + r.url) if r.status >= 400 else None)
    await page.goto(url); await page.wait_for_timeout(1200)
    info = await page.evaluate("""() => ({ katex: document.querySelectorAll('.katex').length, texLeft: document.querySelectorAll('.tex:not(:has(.katex))').length,
      calc: !!(window.HW && HW.Calc), explainers: document.querySelectorAll('[data-explainer]').length,
      assign: (document.querySelector('a.assign') || {}).href || null, ink: document.querySelectorAll('[data-ink]').length })""")
    # open the calculator from the toolbar if there is a Calc button
    btn = await page.query_selector('button:has-text("Calc")')
    if btn: await btn.click(); await page.wait_for_timeout(300); info['calcOpen'] = await page.evaluate("!!document.querySelector('.calc') && getComputedStyle(document.querySelector('.calc')).display !== 'none'")
    await page.close()
    return info, errs, bad
async def home_check(ctx, url):
    """the lessons home (lessons/index.html) lists every switched-on lesson (HW.TEACHING.lessons) exactly once, loads
    nothing heavy, and every link, icon and manifest icon on it resolves (no 404s)"""
    page = await ctx.new_page(); scripts = []
    page.on('request', lambda q: scripts.append(q.url) if q.resource_type == 'script' else None)
    await page.goto(url); await page.wait_for_selector('#units a.row')
    r = await page.evaluate("""() => ({
      want: HW.TEACHING.lessons.map((id) => { const m = /^u(\\d+)l(\\w+)$/.exec(id); return 'u' + m[1] + '/l' + m[2] + '/'; }),
      got: [...document.querySelectorAll('#units a.row')].map((a) => a.getAttribute('href').split('?')[0]),
      links: [...new Set([...document.querySelectorAll('a[href]')].map((a) => a.href.split('#')[0]))],
      heads: [...document.querySelectorAll('link[rel~=icon], link[rel=apple-touch-icon], link[rel=manifest]')].map((l) => l.href),
      manifest: (document.querySelector('link[rel=manifest]') || {}).href })""")
    urls = r['links'] + r['heads']
    man = await (await ctx.request.get(r['manifest'])).json()
    urls += [r['manifest'].rsplit('/', 1)[0] + '/' + i['src'] for i in man.get('icons', [])]
    bad = []
    for u in urls:
        if u.startswith(BASE):
            st = (await ctx.request.get(u)).status
            if st >= 400: bad.append('%d %s' % (st, u))
    heavy = [u for u in scripts if not re.search(r'/js/(catalog|ns)\.js$', u)]
    await page.close()
    return dict(lessons=len(r['got']), missing=sorted(set(r['want']) - set(r['got'])), extra=sorted(set(r['got']) - set(r['want'])),
                dup=len(r['got']) - len(set(r['got'])), checked=len(urls), bad=bad, heavy=heavy,
                app=[man.get('short_name'), man.get('start_url'), man.get('scope'), man.get('display')])
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1180, 'height': 820})
        await ctx.route('**/script.google.com/**', lambda r: r.abort())
        ok = True
        for site in [BASE + 'lessons/'] + ([os.environ['COMPARE']] if os.environ.get('COMPARE') else []):
            print('==', site)
            for l in IDS + ['']:
                url = site + (l + '/?class=B' if l else '')
                info, errs, bad = await probe(ctx, url)
                print(f"{l or 'home':7} {info} errors={errs[:2]} missing={bad[:3]}")
                if not l and site.startswith(BASE):
                    hc = await home_check(ctx, url); print('        lessons home:', hc)
                    if hc['missing'] or hc['extra'] or hc['dup'] or hc['bad'] or hc['heavy'] or hc['app'] != [hc['app'][0], './', './', 'standalone']: ok = False
                if site.startswith(BASE):
                    if errs or bad: ok = False
                    if l and (not info['calc'] or info['texLeft'] or not info['assign'] or not info['assign'].startswith(BASE + '#/lesson/' + l.replace('/', ''))): ok = False
        print('PASS' if ok else 'FAIL'); await b.close()
asyncio.run(main())
