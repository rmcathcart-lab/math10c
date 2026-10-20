"""Write the minW values that tests/screen_fit_check.py found into the lesson JS files.
Usage: python3 tests/apply_minw.py results.json   (only explainers with status 'cramped')"""
import json, re, sys
res = json.load(open(sys.argv[1])); missing = []
for r in res:
    lid = 'u' + r['path'].replace('/l', 'l').lstrip('u')  # u2/l5a -> u2l5a
    p = 'lessons/js/lessons/%s.js' % lid
    try: s = open(p).read()
    except FileNotFoundError: missing.append((p, '*')); continue
    changed = False
    for e in r['explainers']:
        if e['status'] != 'cramped': continue
        name, w = e['name'], e['need']
        # the defs map may rename it: mountExplainers({ box: boxEx }) / const defs = { box: boxEx }
        ren = re.search(r'(?:mountExplainers\(\{|defs = \{)[^}]*\b%s\s*:\s*([A-Za-z_$][\w$]*)' % re.escape(name), s)
        if ren: name = ren.group(1)
        m = re.search(r'^(?:export )?const %s = \{\n' % re.escape(name), s, re.M)
        if not m:
            # a definition made by a factory: const name = factory(...);  ->  name.minW = w; on the next line
            f = re.search(r'^(?:export )?const %s = [^\n]*;\n' % re.escape(name), s, re.M)
            if not f: missing.append((p, name)); continue
            line = '%s.minW = %d; // drawn this wide and scaled to fit beside the sidebar\n' % (name, w)
            old = re.compile(r'^%s\.minW = \d+;.*\n' % re.escape(name), re.M)
            if old.search(s): s = old.sub(line, s, count=1)
            else: s = s[:f.end()] + line + s[f.end():]
            changed = True; continue
        # the definition's own top-level lines (two-space indent) up to its closing brace
        end = s.index('\n};', m.end())
        block = s[m.end():end]
        mm = re.search(r'^  minW: \d+,.*\n', block, re.M)
        line = '  minW: %d, // drawn this wide and scaled to fit beside the sidebar\n' % w
        if mm: block = block[:mm.start()] + line + block[mm.end():]
        else:
            hm = re.search(r'^  height: [^\n]*\n', block, re.M)
            block = (block[:hm.end()] + line + block[hm.end():]) if hm else (line + block)
        s = s[:m.end()] + block + s[end:]; changed = True
    if changed: open(p, 'w').write(s)
print('not found:', missing)
