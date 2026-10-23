"""One-screen check for lesson pages (main.lesson.screen) at the 11-inch iPad size (1180 x 746).

For each lesson: the warm-up height, and for every explainer, every step drawn at the sidebar width compared with the
same step drawn at the old full width (966 px). A step is "cramped" when, at the sidebar width, more text sits outside
the stage (clipped) or on top of other text than at full width. For cramped explainers it finds the smallest minW
(from CANDIDATES) that matches the full-width picture, i.e. the value to put in the explainer's definition.

Usage: python3 tests/screen_fit_check.py [--base http://localhost:8811/] [--json out.json] u2/l1 u2/l2 ...
Needs a static server for the repo root. Prints one line per lesson and a summary of explainers that need a minW.
"""
import asyncio, json, sys
from playwright.async_api import async_playwright

BASE = 'http://localhost:8811/'
CANDIDATES = [780, 820, 860, 900, 940, 966]
FULL = 966
BUDGET = 684  # lesson px visible under the toolbar
IGNORE = '--ignore-minw' in sys.argv  # check as if no explainer had a minW yet (to test the checker)

METRICS_JS = r"""
(host) => {
  const st = host.querySelector('.ex-stage'); if (!st) return null;
  const S = st.getBoundingClientRect();
  const vis = (e) => { try { return e.checkVisibility({ opacityProperty: true, visibilityProperty: true }); } catch (x) { return true; } };
  const leaves = [];
  const walk = (e) => {
    if (e.nodeType !== 1 || !vis(e)) return;
    if (e.classList && e.classList.contains('katex')) { leaves.push(e); return; }
    if (e.tagName && e.tagName.toLowerCase() === 'text') { leaves.push(e); return; }
    let txt = false; for (const n of e.childNodes) if (n.nodeType === 3 && n.textContent.trim()) txt = true;
    if (txt) leaves.push(e);
    for (const c of e.children) walk(c);
  };
  for (const c of st.children) walk(c);
  const R = leaves.map((e) => e.getBoundingClientRect()).map((r) => ({ l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }));
  let clip = 0, over = 0;
  R.forEach((r) => { if (r.w < 1 || r.h < 1) return; if (r.r > S.right + 2 || r.l < S.left - 2 || r.b > S.bottom + 2 || r.t < S.top - 2) clip++; });
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    const a = R[i], b = R[j]; if (a.w < 1 || b.w < 1) continue;
    if (leaves[i].contains(leaves[j]) || leaves[j].contains(leaves[i])) continue;
    const iw = Math.min(a.r, b.r) - Math.max(a.l, b.l), ih = Math.min(a.b, b.b) - Math.max(a.t, b.t);
    if (iw <= 0 || ih <= 0) continue;
    if (iw * ih > 0.25 * Math.min(a.w * a.h, b.w * b.h)) over++;
  }
  return { clip, over, n: leaves.length };
}
"""

async def measure(page, idx, minw):
    """metrics for every step of explainer #idx with def.minW = minw (None = native sidebar width)"""
    return await page.evaluate("""async ([idx, minw, MJ]) => {
      const host = document.querySelectorAll('.ex')[idx], ex = host._ex; if (!ex) return null;
      const M = eval(MJ);
      const keep = ex.def.minW; ex.def.minW = minw || undefined; ex.lastW = 0; ex.fitStage(ex.hold.clientWidth);
      await ex.build(0); const n = ex.steps.length, out = [];
      for (let k = 0; k <= n; k++) { await ex.build(k); await new Promise((r) => setTimeout(r, 30)); out.push(M(host)); }
      const h = Math.round(host.getBoundingClientRect().height);
      ex.def.minW = keep; ex.fitStage(ex.hold.clientWidth); await ex.build(0);
      return { steps: out, h, n };
    }""", [idx, minw, METRICS_JS])

def worse(a, b):
    """is step-metrics list a worse than baseline b?"""
    return any(x and y and (x['clip'] > y['clip'] or x['over'] > y['over']) for x, y in zip(a, b))

async def check_lesson(ctx, path, base):
    page = await ctx.new_page(); errs = []
    page.on('pageerror', lambda e: errs.append(str(e)))
    await page.goto(base + 'lessons/' + path + '/'); await page.wait_for_timeout(1800)
    info = await page.evaluate("""() => ({
      screen: !!document.querySelector('main.lesson.screen'),
      // the first screen: from the top of the warm-up card to the bottom of its grid (+ the card's bottom padding);
      // material placed after the grid (follow-ups that come after the big one) doesn't count
      warm: (() => { const w = document.querySelector('section.warm'); if (!w) return 0; const r = w.getBoundingClientRect();
        // a one-column warm-up (wf-one) ends at its big-one poll
        const g = w.querySelector(':scope > .wf-grid') || (w.classList.contains('wf-one') ? w.querySelector(':scope > .poll') : null);
        if (!g || g === w.lastElementChild) return Math.round(r.height);
        return Math.round(g.getBoundingClientRect().bottom - r.top + parseFloat(getComputedStyle(w).paddingBottom)); })(),
      ex: [...document.querySelectorAll('.ex')].map((e, i) => ({ i, name: e.dataset.explainer || e.id || '', side: e.classList.contains('ex-fl'), api: !!e._ex, minW: e._ex && e._ex.def.minW || null }))
    })""")
    res = []
    for e in info['ex']:
        if not e['api'] or not e['side']:
            h = await page.evaluate("(i) => Math.round(document.querySelectorAll('.ex')[i].getBoundingClientRect().height)", e['i'])
            res.append(dict(e, status='not-side' if e['api'] else 'widget', h=h)); continue
        try:
            full = await measure(page, e['i'], FULL)
            cur = await measure(page, e['i'], None if IGNORE else e['minW'])
            if not worse(cur['steps'], full['steps']):
                res.append(dict(e, status='ok', h=cur['h'], steps=cur['n'])); continue
            pick = None
            for w in CANDIDATES:
                if e['minW'] and not IGNORE and w <= e['minW']: continue
                m = await measure(page, e['i'], w)
                if not worse(m['steps'], full['steps']): pick = (w, m['h']); break
            res.append(dict(e, status='cramped', need=pick[0] if pick else FULL, h=pick[1] if pick else full['h'], steps=cur['n'],
                            worst=max(((x['clip'] - y['clip']) + (x['over'] - y['over']) for x, y in zip(cur['steps'], full['steps']) if x and y), default=0)))
        except Exception as ex:
            res.append(dict(e, status='error', error=str(ex)[:200]))
    await page.close()
    return dict(path=path, screen=info['screen'], warm=info['warm'], explainers=res, errors=errs)

async def main():
    args = [a for a in sys.argv[1:] if a != '--ignore-minw']; base = BASE; out = None
    if '--base' in args: i = args.index('--base'); base = args[i + 1]; del args[i:i + 2]
    if '--json' in args: i = args.index('--json'); out = args[i + 1]; del args[i:i + 2]
    allres = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': 1180, 'height': 746}, service_workers='block')
        await ctx.route('**/script.google.com/**', lambda r: r.abort())
        for path in args:
            r = await check_lesson(ctx, path, base); allres.append(r)
            bad = [x for x in r['explainers'] if x['status'] == 'cramped']
            tall = [x for x in r['explainers'] if x.get('h', 0) > BUDGET]
            print('%-8s screen=%s warm=%4d%s  explainers=%d  cramped=%s  tall=%s  errors=%d' % (
                path, r['screen'], r['warm'], ' (over)' if r['warm'] > BUDGET else '', len(r['explainers']),
                ', '.join('%s→minW %d' % (x['name'], x['need']) for x in bad) or '-',
                ', '.join('%s %d' % (x['name'], x['h']) for x in tall) or '-', len(r['errors'])))
            for e in r['errors']: print('   page error:', e)
            for x in r['explainers']:
                if x['status'] == 'error': print('   check error:', x['name'], x['error'])
        await b.close()
    if out: json.dump(allres, open(out, 'w'), indent=1)

asyncio.run(main())
