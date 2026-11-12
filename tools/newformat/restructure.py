"""New lesson format (Ryan, 2026-11-10): warm-up first (one clear question), Class view / Full notes, at most one
practice break. Usage: python3 restructure.py u4l9 [u5l1 ...]   (reads specs.py; always starts from the ORIGINAL page
kept in orig/<key>.html, so it can be re-run)."""
import re, sys, os, subprocess
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')); HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from specs import SPECS
T = lambda x: '<span class="tex">%s</span>' % x

def run(key):
    sp = SPECS[key]; u, l = re.match(r'u(\d+)l(\d+)', key).groups()
    path = f'{REPO}/lessons/u{u}/l{l}/index.html'; orig = f'{HERE}/orig/{key}.html'
    if not os.path.exists(orig):
        os.makedirs(f'{HERE}/orig', exist_ok=True); open(orig, 'w').write(open(path).read())
    s = open(orig).read()
    assert 'views.js' not in s, 'orig already converted'
    def rep(a, b, n=1):
        nonlocal s
        assert s.count(a) == n, (key, a[:80], s.count(a)); s = s.replace(a, b)
    # --- head + boot
    rep(f'<link rel="stylesheet" href="../../css/lessons/{key}.css">', f'<link rel="stylesheet" href="../../css/lessons/{key}.css">\n<link rel="stylesheet" href="../../css/views.css">')
    m = re.search(r"\n  boot\(\{[^\n]*\}\);\n", s); assert m, key
    s = s[:m.start()] + "\n  import { views } from '../../js/views.js';" + m.group(0) + "  views();\n" + s[m.end():]
    # --- sections
    def sec_span(ink):
        m = re.search(r'<section class="[^"]*"[^>]*data-ink="%s"[^>]*>' % re.escape(ink), s); assert m, (key, ink)
        return m.start(), s.index('</section>', m.start()) + len('</section>')
    def tag_card(ink):
        nonlocal s
        i, j = sec_span(ink); head_end = s.index('>', i)
        assert 'data-extra' not in s[i:head_end]
        s = s[:i] + s[i:head_end].replace('<section class="', '<section data-extra class="', 1) + s[head_end:]
    # explainers: wrap (optionally with the lead-in paragraph just before)
    for name in sp.get('extra_expl', []) + sp.get('extra_with_prev', []):
        ms = list(re.finditer(r'<div class="explainer[^"]*"[^>]*data-explainer="%s"[^>]*></div>' % re.escape(name), s)); assert len(ms) == 1, (key, name, len(ms))
        i, j = ms[0].start(), ms[0].end()
        if name in sp.get('extra_with_prev', []):
            before = s[:i].rstrip(); assert before.endswith('</p>'), (key, name, before[-80:])
            i = before.rindex('<p')
        s = s[:i] + '<div data-extra>' + s[i:j] + '</div>' + s[j:]
    for a in sp.get('extra_str', []):
        rep(a, '<div data-extra>' + a + '</div>')
    for a, b in sp.get('replace', []):
        rep(a, b)
    for a, b in sp.get('replace_all', []):
        assert a in s, (key, a[:60]); s = s.replace(a, b)
    for ink in sp.get('extra_cards', []):
        tag_card(ink)
    if sp.get('think', True):
        s = s.replace('<div class="part think', '<div data-extra class="part think')
    # --- warm-up: the old one becomes an extra just before the summary; the new one goes first
    w = sp['warm']
    i, j = sec_span('warm'); old = s[i:j]; s = s[:i] + s[j:]
    old = re.sub(r'data-section="Warm-up: ([^"]*)"', r'data-section="Extra: \1"', old, count=1)
    old = old.replace('<section class="', '<section data-extra class="', 1).replace('<span class="badge warm-b">Warm-up</span>', '<span class="badge warm-b">Extra</span>', 1)
    assert 'data-section="Extra: ' in old, key
    for ink in sp.get('move_with_warm', []):
        i2, j2 = sec_span(ink); old += '\n\n' + s[i2:j2].replace('<section class="', '<section data-extra class="', 1); s = s[:i2] + s[j2:]
    if not sp.get('drop_old_warm'):
        si, _ = sec_span('sum'); cm = s.rfind('<!--', 0, si); at = cm if cm != -1 and s[cm:si].count('<section') == 0 else si
        s = s[:at] + old + '\n\n' + s[at:]
    reveal = f'''
  <div class="bk-wq vw-rev"><div class="q-line"><div class="q-num">?</div><div>{w.get('nudge', 'Convince the person beside you.')}</div><button class="pill small" type="button" data-bk-toggle>Reveal</button></div>
    <div class="bk-ans">{w['reveal']}</div></div>'''
    pic = f'<div class="vw-art">{w["pic"]}</div>' if w.get('pic') else ''
    mq = re.match(r'<div class="vw-q">(.*)</div>$', w['body'], flags=re.S)
    if mq and w['rule'].rstrip().endswith('?'):
        # read in order: the situation first, then the question (Ryan: the question was small and above a big box)
        ctx = re.sub(r'<small[^>]*>(.*?)</small>', r'</p><p class="vw-ctx">\1', mq.group(1), flags=re.S)
        inner = f'<div class="vw-seq{" has-art" if pic else ""}"><div class="vw-txt"><p class="vw-ctx">{ctx}</p><p class="vw-ask">{w["rule"]}</p></div>{pic}</div>'
        head = ''
    else:
        inner = (f'<div class="vw-seq has-art"><div class="vw-txt">{w["body"]}</div>{pic}</div>' if pic else w['body'])
        head = f'\n  <p class="wf-rule vw-rule">{w["rule"]}</p>'
    from pics import STRIPS
    _st = w.get('strip') or STRIPS.get(key)
    stripx = f'\n  <div class="vw-strip">{_st}</div>' if _st else ''
    new = f'''<!-- ================= warm-up: one clear question, first thing on the screen ================= -->
<section class="card warm wf" data-ink="warmq" data-section="Warm-up: {w['title']}">{stripx}
  <div class="wf-head"><span class="badge warm-b">Warm-up</span><h2>{w['title']}</h2>{head}</div>
  {inner}{reveal}
</section>

'''
    hi, _ = sec_span('hero'); cm = s.rfind('<!--', 0, hi); at = cm if cm != -1 and s[cm:hi].count('<section') == 0 else hi
    s = s[:at] + new + s[at:]
    # --- one practice break
    pr = sp.get('practice')
    if pr:
        chips = ''.join(f'<span><b>{a}</b>{b}</span>' for a, b in pr['chips'])
        card = f'''

<!-- ================= practice break (one per lesson at most) ================= -->
<section class="card practice" data-ink="p1" data-section="Practice: Questions {pr['qs']}">
  <div class="pr-k">Your turn</div>
  <h2>Assignment {l} · Questions {pr['qs']}</h2>
  <p class="pr-t">{pr['line']}</p>
  <div class="pr-chips n{len(pr['chips'])}">{chips}</div>
  <div class="pr-foot"><span>{pr.get('note', 'We carry on when most of the class has finished.')}</span><a class="pill" href="../../../#/lesson/{key}">Open the Practice site</a></div>
</section>'''
        _, j = sec_span(pr['after']); s = s[:j] + card + s[j:]
        m = re.search(r'(<a class="assign" href="[^"]*">\s*<div><div class="kicker">Your turn</div><b>)Assignment %s — [^<]*((?:<span class="tex">[^<]*</span>[^<]*)*)(</b>)' % l, s); assert m, (key, 'assign')
        s = s[:m.start()] + m.group(1) + f"Assignment {l} · Questions {pr['rest']}" + m.group(3) + s[m.end():]
    open(path, 'w').write(s)
    secs = re.findall(r'<section ([^>]*)>', s)
    cls = [re.search(r'data-section="([^"]*)"', a).group(1) for a in secs if 'data-extra' not in a]
    nex = len(re.findall(r'data-explainer', s)); 
    print(f'{key}: {len(secs)} cards, {len(cls)} in Class view; class: ' + ' | '.join(cls))

for k in sys.argv[1:]: run(k)
