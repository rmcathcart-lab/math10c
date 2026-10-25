"""Checks the Stand Up Break! card on lesson pages: each level's generator over many runs (no errors, LaTeX renders with
no KaTeX errors, enough different questions), then screenshots the card at the iPad size with one question per level
and every answer open, and checks nothing spills out of its box.
  python3 tests/standup_check.py u4/l3 [u5/l2 …]     (no ids: every lesson that has a Stand Up Break)
Needs the static server on 8811. Screenshots: /tmp/standup/<uN-lM>.png"""
import asyncio, os, re, sys, glob
from playwright.async_api import async_playwright
BASE = 'http://localhost:8811/lessons/'
ROOT = os.path.join(os.path.dirname(__file__), '..')
ids = sys.argv[1:] or sorted(re.sub(r'.*/lessons/(u\d+/l\d+)/index.html$', r'\1', f) for f in glob.glob(os.path.join(ROOT, 'lessons/u*/l*/index.html')) if 'data-standup=' in open(f).read())
OUT = '/tmp/standup'; os.makedirs(OUT, exist_ok=True)
JS = r"""async () => {
  const id = Object.keys(window.__standups || {})[0]; if (!id) return { err: 'no standup() call' };
  const def = window.__standups[id], { rnd } = await import('/lessons/js/standup.js'), out = { id, levels: {} };
  for (const lv of ['BEG', 'PRG', 'MAS']) {
    const g = def.levels[lv]; if (!g) { out.levels[lv] = { err: 'missing' }; continue; }
    const seen = new Set(); let errs = [];
    for (let i = 0; i < 300; i++) {
      let x; try { x = g(rnd()); } catch (e) { errs.push('throws: ' + e.message); continue; }
      if (!x || (!x.q && !x.text)) { errs.push('no question'); continue; }
      if (!x.a && !x.atext) { errs.push('no answer'); continue; }
      const html = [x.q, ...(Array.isArray(x.a) ? x.a : [x.a])].filter(Boolean).map((s) => window.katex.renderToString(String(s), { throwOnError: false, displayMode: true })).join('');
      if (/katex-error/.test(html)) errs.push('KaTeX: ' + String(x.q || x.text).slice(0, 80));
      if (/undefined|NaN|Infinity/.test(String(x.q) + (x.text || '') + JSON.stringify(x.a) + (x.atext || ''))) errs.push('undefined/NaN: ' + String(x.q || x.text).slice(0, 80));
      seen.add(String(x.q) + '|' + (x.text || '') + '|' + (x.fig || '').length);
    }
    out.levels[lv] = { distinct: seen.size, errs: [...new Set(errs)].slice(0, 4), nerr: errs.length };
  }
  return out;
}"""
async def main():
    bad = 0
    async with async_playwright() as p:
        b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 1180, 'height': 820}, service_workers='block')
        for pat in ('**/fonts.googleapis.com/**', '**/cdn.jsdelivr.net/**', '**/script.google.com/**'): await ctx.route(pat, lambda r: r.abort())
        await ctx.add_init_script("localStorage.setItem('ink:teacher', JSON.stringify('x'))")
        for lid in ids:
            pg = await ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(BASE + lid + '/'); await pg.wait_for_timeout(1800)
            if not await pg.locator('section.standup .su-cur').count(): print(lid, 'NO CARD', errs[:2]); bad += 1; await pg.close(); continue
            r = await pg.evaluate(JS)
            line = []
            for lv, v in (r.get('levels') or {}).items():
                ok = not v.get('err') and not v.get('nerr') and v.get('distinct', 0) >= 10
                if not ok: bad += 1
                line.append('%s %s%s' % (lv, v.get('distinct', '-'), '' if ok else ' !! ' + str(v.get('err') or v.get('errs'))))
            for lv in ['BEG', 'PRG', 'MAS']:
                await pg.click('.su-lv.su-lv-' + lv); await pg.click('.su-new')
            for i in range(await pg.locator('.su-ans-b').count()): await pg.locator('.su-ans-b').nth(i).click()
            spill = await pg.evaluate("""[...document.querySelectorAll('.su-old, .su-cur')].filter(o => { const R = o.getBoundingClientRect(); return [...o.querySelectorAll('.katex, svg, .su-qtext, .su-atext')].some(k => { const r = k.getBoundingClientRect(); const sc = k.closest('.su-q, .su-ans'); return r.right > R.right + 1 && !(sc && sc.scrollWidth > sc.clientWidth); }); }).length""")
            if spill: bad += 1
            pos = await pg.evaluate("""(() => { const all = [...document.querySelectorAll('section.card[data-section]')]; const i = all.findIndex(c => c.classList.contains('standup')); return (i + 1) + '/' + all.length + ' after “' + (all[i - 1] ? all[i - 1].dataset.section : '') + '”'; })()""")
            await pg.locator('section.standup').screenshot(path=os.path.join(OUT, lid.replace('/', '-') + '.png'))
            print(lid, '·', ' · '.join(line), '· card', pos, ('· SPILLS ' + str(spill)) if spill else '', ('· page errors ' + str(errs[:2])) if errs else '')
            if errs: bad += 1
            await pg.close()
        await b.close()
    print('problems:', bad); sys.exit(1 if bad else 0)
asyncio.run(main())
