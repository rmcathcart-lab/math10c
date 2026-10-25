"""Builds the official course outline PDF from assets/outline/outline.html (Chromium print, US Letter, page footer).
  python3 tests/build_outline.py            -> assets/outline/math10c-course-outline.pdf (+ page PNGs in /tmp/outline-pages)
The unit table and the outcome wording come from js/catalog.js and js/outcomes.js, so rebuild after changing those."""
import asyncio, os, sys
from playwright.async_api import async_playwright
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.join(ROOT, 'assets/outline/outline.html')
OUT = os.path.join(ROOT, 'assets/outline/math10c-course-outline.pdf')
SHOTS = '/tmp/outline-pages'
FOOT = ('<div style="width:100%;font:7.5pt Inter,sans-serif;color:#6a7182;padding:0 0.6in;display:flex;justify-content:space-between">'
        '<span>Mathematics 10C Course Outline · 2026–27 · Mr. Cathcart · W.H. Croxford High School</span>'
        '<span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page()
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + SRC)
        await pg.wait_for_selector('body[data-ready="1"]')
        await pg.evaluate('document.fonts.ready')
        await pg.pdf(path=OUT, format='Letter', print_background=True, prefer_css_page_size=True,
                     display_header_footer=True, header_template='<div></div>', footer_template=FOOT,
                     margin={'top': '0.55in', 'bottom': '0.6in', 'left': '0.6in', 'right': '0.6in'})
        await b.close()
    if errs: print('page errors:', errs); sys.exit(1)
    os.makedirs(SHOTS, exist_ok=True)
    os.system('pdftoppm -r 80 -png "%s" "%s/p" && pdfinfo "%s" | grep Pages' % (OUT, SHOTS, OUT))
    print('wrote', OUT)

asyncio.run(main())
