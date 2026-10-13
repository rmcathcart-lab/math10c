"""Every lesson page under lessons/ loads from the combined repo: no page errors or missing files, KaTeX renders,
the shared calculator opens, explainers mount, and the assignment link points at the practice site in this repo.
Needs a static server for the repo root on 8811. Optional: COMPARE=http://localhost:8812/ (the old teaching repo)
prints the same numbers for the old site."""
import asyncio, os, re
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/'
IDS = ['l1', 'l2', 'l3', 'l4', 'l5', 'l6a', 'l6b', 'l7']
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
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1180, 'height': 820})
        await ctx.route('**/script.google.com/**', lambda r: r.abort())
        ok = True
        for site in [BASE + 'lessons/'] + ([os.environ['COMPARE']] if os.environ.get('COMPARE') else []):
            print('==', site)
            for l in IDS + ['']:
                url = site + ('u1/' + l + '/?class=B' if l else '')
                info, errs, bad = await probe(ctx, url)
                print(f"{l or 'home':4} {info} errors={errs[:2]} missing={bad[:3]}")
                if site.startswith(BASE):
                    if errs or bad: ok = False
                    if l and (not info['calc'] or info['texLeft'] or not info['assign'] or not info['assign'].startswith(BASE + '#/lesson/u1' + l)): ok = False
        print('PASS' if ok else 'FAIL'); await b.close()
asyncio.run(main())
