"""Step every explainer on lesson pages and dump what students would see — cheap, scriptable QA.

Usage (server on the repo root, default http://localhost:8766/):
    python3 tests/explainer_dump.py u5/l1 [u5/l2 ...] [--out=DIR] [--base=URL] [--sheets] [--calc] [--fast]

For each page it writes DIR/<page>.json and DIR/<page>.txt:
  - every explainer, every chip, every step: caption text + visible stage text
  - problems: console/page errors, KaTeX parse errors, math restyled by lesson CSS (stacked/capitalised glyphs),
    raw "x^2"-style text outside KaTeX, captions taller than the reserved caption box, stage content overflowing
    the stage, explainers that never reach their last step
With --sheets it also saves DIR/<page>-ex<N>.png: one contact sheet per explainer (end state of every chip, plus
the middle step of the first chip), so you can LOOK at a whole explainer in one image instead of many screenshots.

With --calc it also presses every calculator "Show me" button and records the screen result next to the tip text.

Exit code 1 if any problem was found. The .txt file is the thing to read (or grep); checkers can verify every
caption's math from it without opening a browser.
"""
import asyncio, json, os, re, sys

from playwright.async_api import async_playwright

ARGS = [a for a in sys.argv[1:] if not a.startswith('--')]
OPT = {a.split('=')[0]: (a.split('=', 1)[1] if '=' in a else True) for a in sys.argv[1:] if a.startswith('--')}
BASE = OPT.get('--base', 'http://localhost:8766/lessons/')
OUT = OPT.get('--out', '/tmp/claude-0/dump')
SHEETS = bool(OPT.get('--sheets'))
CALC = bool(OPT.get('--calc'))
WAIT = 120 if OPT.get('--fast') else 260

VIS = r"""(root) => { const go = (el) => { if (el.nodeType === 3) return el.textContent; if (el.nodeType !== 1) return '';
    if (el.classList && el.classList.contains('katex')) { const t = el.getAttribute('data-tex') || (el.querySelector('annotation') || {}).textContent; return t ? ' $' + t + '$ ' : el.textContent; }
    if (el.classList && el.classList.contains('katex-mathml')) return '';
    const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return '';
    let s = ''; for (const c of el.childNodes) s += go(c);
    return /^(DIV|P|LI|TR|BR|H\d)$/.test(el.tagName) ? ' ' + s + ' ' : s; };
  return root ? go(root) : ''; }"""

PROBE = r"""(root) => {
  const out = { katex: [], raw: [], capOver: false, stageOver: [] };
  root.querySelectorAll('.katex-error').forEach(e => out.katex.push('PARSE: ' + (e.getAttribute('title') || e.textContent).slice(0, 80)));
  root.querySelectorAll('.katex .mord, .katex .mbin, .katex .mrel, .katex .mopen, .katex .mclose, .katex .mop').forEach(e => {
    if (!e.getClientRects().length) return; const cs = getComputedStyle(e);
    if (cs.display === 'block' || cs.textTransform !== 'none') { const k = e.closest('.katex'); out.katex.push('RESTYLED: ' + (k ? k.textContent.slice(0, 40) : '')); }
  });
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: (n) => n.parentElement && !n.parentElement.closest('.katex, script, style, .tex-src') ? 1 : 2 });
  for (let n; (n = walk.nextNode());) { const t = n.textContent; if (/[a-z0-9)]\^\{?-?[0-9a-z]/i.test(t) || /\\(frac|sqrt|times|cdot|left|right)\b/.test(t)) out.raw.push(t.trim().slice(0, 60)); }
  const cap = root.querySelector('.ex-cap'); if (cap && cap.scrollHeight > cap.clientHeight + 2) out.capOver = true;
  const st = root.querySelector('.ex-stage');
  if (st) { const sr = st.getBoundingClientRect();
    st.querySelectorAll('*').forEach(e => { if (e.closest('svg') && e.tagName !== 'svg') return; const r = e.getBoundingClientRect(); if (!r.width || !r.height) return;
      const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0) return;
      if (r.right > sr.right + 4 || r.bottom > sr.bottom + 4 || r.left < sr.left - 4 || r.top < sr.top - 4) out.stageOver.push((e.className && e.className.baseVal == null ? e.className : e.tagName) + ': ' + (e.textContent || '').trim().slice(0, 30)); });
    out.stageOver = [...new Set(out.stageOver)].slice(0, 4); }
  out.katex = [...new Set(out.katex)].slice(0, 4); out.raw = [...new Set(out.raw)].slice(0, 4);
  return out; }"""


def clean(s, n=400):
    return re.sub(r'\s+', ' ', s or '').strip()[:n]


async def dump_page(ctx, pid):
    pg = await ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)[:200]))
    pg.on('console', lambda m: errs.append('CONSOLE ' + m.text[:200]) if m.type == 'error' else None)
    await pg.goto(BASE + pid + '/')
    await pg.wait_for_timeout(1000)
    res = {'page': pid, 'explainers': [], 'problems': []}
    # whole page, all answers shown
    await pg.evaluate("document.querySelectorAll('.part').forEach(p => p.classList.add('shown'))")
    whole = await pg.evaluate("(r) => (" + PROBE + ")(r)", await pg.query_selector('body'))
    for k in whole['katex']: res['problems'].append('page: ' + k)
    for k in whole['raw']: res['problems'].append('page raw math text: ' + k)
    n = await pg.evaluate("document.querySelectorAll('.explainer').length")
    for i in range(n):
        ex = (await pg.query_selector_all('.explainer'))[i]
        await ex.scroll_into_view_if_needed()
        title = clean(await pg.evaluate("(e) => (e.querySelector('.ex-title, h4, .ex-head') || {}).textContent || ''", ex), 80)
        chips = await pg.evaluate("(e) => [...e.querySelectorAll('.ex-chips .chip:not(.go)')].map(c => c.textContent.trim())", ex)
        E = {'index': i, 'title': title, 'chips': []}
        shots = []
        for c in range(max(1, len(chips))):
            if chips:
                await pg.evaluate("([e, c]) => e.querySelectorAll('.ex-chips .chip:not(.go)')[c].click()", [ex, c])
            await pg.wait_for_timeout(WAIT)
            C = {'chip': chips[c] if chips else '(default)', 'steps': []}
            mid_taken = False
            for step in range(60):
                await pg.wait_for_timeout(WAIT)
                info = await pg.evaluate("(e) => { const V = " + VIS + "; return { cap: V(e.querySelector('.ex-cap')), stage: V(e.querySelector('.ex-stage')), count: (e.querySelector('.ex-count') || {}).textContent || '' }; }", ex)
                pr = await pg.evaluate("(r) => (" + PROBE + ")(r)", ex)
                C['steps'].append({'n': clean(info['count'], 12), 'cap': clean(info['cap']), 'stage': clean(info['stage'], 300)})
                tag = f"ex{i} '{title}' chip '{C['chip']}' step {clean(info['count'], 12)}"
                for k in pr['katex']: res['problems'].append(f'{tag}: {k}')
                for k in pr['raw']: res['problems'].append(f'{tag}: raw math text: {k}')
                if pr['capOver']: res['problems'].append(f'{tag}: caption taller than its box')
                if pr['stageOver']: res['problems'].append(f'{tag}: content outside the stage: {pr["stageOver"]}')
                if SHEETS and c == 0 and not mid_taken and step >= 2:
                    st = await ex.query_selector('.ex-stage')
                    if st: shots.append(('mid: ' + C['chip'], await st.screenshot())); mid_taken = True
                done = await pg.evaluate("(e) => { const b = e.querySelector('.exb.next'); if (!b || b.disabled) return true; b.click(); setTimeout(() => { if (!b.disabled) b.click(); }, 40); return false; }", ex)
                if done:
                    break
            else:
                res['problems'].append(f"ex{i} '{title}' chip '{C['chip']}': never reached the last step")
            await pg.wait_for_timeout(700)
            if SHEETS:
                st = await ex.query_selector('.ex-stage')
                if st: shots.append((C['chip'], await st.screenshot()))
            E['chips'].append(C)
        res['explainers'].append(E)
        if SHEETS and shots:
            make_sheet(shots, os.path.join(OUT, f"{pid.replace('/', '-')}-ex{i}.png"), f'{pid} ex{i}: {title}')
    if CALC:  # press every calculator "Show me" demo and record what the screen shows
        res['calc'] = []
        nk = await pg.evaluate("document.querySelectorAll('[data-keys]').length")
        for k in range(nk):
            spec = await pg.evaluate(f"document.querySelectorAll('[data-keys]')[{k}].dataset.keys")
            label = clean(await pg.evaluate(f"document.querySelectorAll('[data-keys]')[{k}].textContent"), 60)
            tip = clean(await pg.evaluate(f"(() => {{ const b = document.querySelectorAll('[data-keys]')[{k}]; const t = b.closest('.tip, .part, .card'); return t ? t.innerText : ''; }})()"), 300)
            await pg.evaluate(f"document.querySelectorAll('[data-keys]')[{k}].click()")
            await pg.wait_for_timeout(600 * (len(spec.split()) + 3))
            screen = clean(await pg.evaluate("(document.querySelector('.calc-screen') || {}).innerText || ''"), 120)
            res['calc'].append({'button': label, 'keys': spec, 'screen': screen, 'context': tip})
    res['problems'] = errs + res['problems']
    await pg.close()
    return res


def make_sheet(shots, path, title):
    from io import BytesIO
    from PIL import Image, ImageDraw, ImageFont
    try:
        font = ImageFont.truetype('DejaVuSans.ttf', 14)
    except OSError:
        font = None
    ims = [(lab, Image.open(BytesIO(b))) for lab, b in shots]
    W = 460
    th = [(lab, im.resize((W, max(1, int(im.height * W / im.width))))) for lab, im in ims]
    cols = 3 if len(th) > 4 else 2 if len(th) > 1 else 1
    rows = (len(th) + cols - 1) // cols
    rh = max(im.height for _, im in th) + 26
    sheet = Image.new('RGB', (cols * (W + 10) + 10, rows * rh + 34), 'white')
    d = ImageDraw.Draw(sheet)
    d.text((10, 8), title[:120], fill=(20, 20, 20), font=font)
    for k, (lab, im) in enumerate(th):
        x, y = 10 + (k % cols) * (W + 10), 30 + (k // cols) * rh
        d.text((x, y), lab[:70], fill=(19, 128, 122), font=font)
        sheet.paste(im, (x, y + 16))
    sheet.save(path)


def write_txt(res, path):
    L = [f"# {res['page']}", f"problems: {len(res['problems'])}"] + ['  ! ' + p for p in res['problems']]
    for c in res.get('calc', []):
        L.append(f"CALC [{c['button']}] keys: {c['keys']}  =>  screen: {c['screen']}\n      context: {c['context']}")
    for E in res['explainers']:
        L.append(f"\n## ex{E['index']}: {E['title']}")
        for C in E['chips']:
            L.append(f"### chip: {C['chip']}")
            for s in C['steps']:
                L.append(f"  [{s['n']}] {s['cap']}")
                if s['stage']:
                    L.append(f"        stage: {s['stage']}")
    open(path, 'w').write('\n'.join(L) + '\n')


async def main():
    os.makedirs(OUT, exist_ok=True)
    bad = 0
    async with async_playwright() as p:
        br = await p.chromium.launch()
        ctx = await br.new_context(viewport={'width': 1180, 'height': 820})
        await ctx.add_init_script("try{localStorage.setItem('ink:teacher', JSON.stringify('X'));localStorage.removeItem('page:zoom')}catch(e){}")
        for pid in ARGS:
            res = await dump_page(ctx, pid)
            stem = os.path.join(OUT, pid.replace('/', '-'))
            json.dump(res, open(stem + '.json', 'w'), indent=1)
            write_txt(res, stem + '.txt')
            nchips = sum(len(E['chips']) for E in res['explainers'])
            print(f"{pid}: {len(res['explainers'])} explainers, {nchips} chips, {len(res['problems'])} problems -> {stem}.txt")
            for q in res['problems'][:12]:
                print('   !', q)
            bad += len(res['problems'])
        await br.close()
    sys.exit(1 if bad else 0)


asyncio.run(main())
