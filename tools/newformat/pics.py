"""Small looping pictures for the warm-up cards (Ryan, 2026-11-11: a fun visual that moves, to pull eyes to the screen
as students come in). Plain SVG with SMIL animation, viewBox 330 x 250, no scripts. A picture must never give the
answer away. They are not paused for reduced motion (Ryan's choice, 2026-11-11)."""
INK, BLUE, RED, GREEN, AMBER, LINE = '#4a4436', '#2b55a0', '#c93a33', '#12805a', '#e0a11b', '#d9d3c4'
def svg(inner, label, vb='0 0 330 250'):
    return f'<svg viewBox="{vb}" role="img" aria-label="{label}">{inner}</svg>'
def bob(dy=8, dur=1.6, begin=0):
    return f'<animateTransform attributeName="transform" type="translate" values="0 0;0 {-dy};0 0" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>'
def blink(dur=1.6, begin=0, lo=.25):
    return f'<animate attributeName="opacity" values="1;{lo};1" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>'
def emo(ch, x, y, size=70, dy=10, dur=1.6, begin=0):
    return f'<g>{bob(dy, dur, begin)}<text x="{x}" y="{y}" font-size="{size}" text-anchor="middle">{ch}</text></g>'
def qmark(x, y, size=40, col=BLUE):
    return f'<g>{bob(7, 1.4)}<text x="{x}" y="{y}" font-size="{size}" font-weight="800" fill="{col}" text-anchor="middle">?</text></g>'
def die(x, y, s, pips):
    r = s * .16; pr = s * .085
    pos = {'c': (.5, .5), 'tl': (.27, .27), 'tr': (.73, .27), 'bl': (.27, .73), 'br': (.73, .73)}
    return f'<rect x="{x}" y="{y}" width="{s}" height="{s}" rx="{r}" fill="#fffdf6" stroke="{INK}" stroke-width="{max(2.5, s*.03):.1f}"/>' + ''.join(f'<circle cx="{x + s*pos[k][0]:.1f}" cy="{y + s*pos[k][1]:.1f}" r="{pr:.1f}" fill="{RED}"/>' for k in pips)
def bracket(x, y1, y2, col=BLUE, w=3):
    return f'<g stroke="{col}" stroke-width="{w}" stroke-linecap="round"><line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}"/><line x1="{x-8}" y1="{y1}" x2="{x+8}" y2="{y1}"/><line x1="{x-8}" y1="{y2}" x2="{x+8}" y2="{y2}"/></g>'
def grid(cols, rows, cell, ox=20, oy=20):
    W, H = cols * cell, rows * cell
    return f'<g stroke="{LINE}" stroke-width="1.5">' + ''.join(f'<line x1="{ox+c*cell}" y1="{oy}" x2="{ox+c*cell}" y2="{oy+H}"/>' for c in range(cols + 1)) + ''.join(f'<line x1="{ox}" y1="{oy+r*cell}" x2="{ox+W}" y2="{oy+r*cell}"/>' for r in range(rows + 1)) + '</g>'

DICE = svg(f'<g>{bob(5, 2.2)}{die(20, 172, 58, ["tl", "c", "br"])}</g>' + die(120, 40, 190, ['tl', 'tr', 'c', 'bl', 'br']) + bracket(104, 42, 228) + qmark(84, 148), 'A small die beside a much bigger die')
SUPER = svg(f'<g>{bob(5, 2.2)}{die(14, 190, 40, ["c"])}</g>' + die(100, 30, 200, ['tl', 'tr', 'bl', 'br']) + f'<text x="56" y="130" font-size="30" font-weight="800" fill="{BLUE}" text-anchor="middle">×10</text><text x="56" y="158" font-size="16" fill="{INK}" text-anchor="middle">each way</text>', 'A normal die and a giant die')
COOKIE = svg(emo('🍪', 240, 190, 90, 6, 2.4) + f'<g><animateTransform attributeName="transform" type="rotate" values="0 120 150;-28 120 150;0 120 150" dur="2.4s" repeatCount="indefinite"/><path d="M60 110 H150 L140 180 H70 Z" fill="#fffdf6" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/><path d="M150 122 H186" stroke="{INK}" stroke-width="7" stroke-linecap="round"/><text x="105" y="158" font-size="30" font-weight="800" fill="{BLUE}" text-anchor="middle">⅓</text></g>', 'A one-third measuring cup and a cookie')
def _bug(x, col, label, dur):
    return (f'<g><animateTransform attributeName="transform" type="translate" values="0 62;0 0;0 0;0 62;0 62" keyTimes="0;.25;.6;.85;1" dur="{dur}s" repeatCount="indefinite"/>'
            f'<ellipse cx="{x}" cy="120" rx="22" ry="34" fill="{col}"/><ellipse cx="{x-22}" cy="128" rx="14" ry="30" fill="{col}" opacity=".35" transform="rotate(-18 {x-22} 128)"/><ellipse cx="{x+22}" cy="128" rx="14" ry="30" fill="{col}" opacity=".35" transform="rotate(18 {x+22} 128)"/>'
            f'<circle cx="{x-9}" cy="98" r="5" fill="{RED}"/><circle cx="{x+9}" cy="98" r="5" fill="{RED}"/></g>'
            f'<text x="{x}" y="232" font-size="22" font-weight="800" fill="{INK}" text-anchor="middle">{label}</text>')
CICADA = svg(_bug(95, '#5b7a3a', 'every 13', 2.6) + _bug(235, '#7a5a3a', 'every 17', 3.4) + f'<rect x="0" y="160" width="330" height="46" fill="#e9dcc3"/><line x1="0" y1="160" x2="330" y2="160" stroke="{INK}" stroke-width="3"/>', 'Two cicadas coming out of the ground at different times')
PHOTOS = svg(''.join(f'<rect x="{60 + c*30}" y="{30 + r*30}" width="26" height="26" rx="3" fill="{[BLUE, AMBER, GREEN, RED][(c*3 + r*5) % 4]}" opacity=".85">{blink(3.2, ((c*7 + r*3) % 9) * .35, .2)}</rect>' for r in range(6) for c in range(7)) + f'<g stroke="{INK}" stroke-width="3" stroke-linecap="round"><line x1="60" y1="226" x2="266" y2="226"/><line x1="60" y1="218" x2="60" y2="234"/><line x1="266" y1="218" x2="266" y2="234"/></g>' + qmark(292, 236, 34), 'A wall of photos')
def _tree():
    pts = [[(165, 30)], [(75, 105), (165, 105), (255, 105)], [(45 + i*30, 190) for i in range(9)]]
    out = ''
    for lvl in (1, 2):
        op = f'<animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;{.2*lvl};{.2*lvl+.1};.92;1" dur="4.5s" repeatCount="indefinite"/>'
        g = ''
        for i, (x, y) in enumerate(pts[lvl]):
            px, py = pts[lvl-1][i // 3 if lvl == 2 else 0]
            g += f'<line x1="{px}" y1="{py}" x2="{x}" y2="{y}" stroke="{LINE}" stroke-width="3"/><circle cx="{x}" cy="{y}" r="{16 if lvl == 1 else 11}" fill="{[BLUE, GREEN][lvl-1]}"/>'
        out += f'<g opacity="0">{op}{g}</g>'
    return out + f'<circle cx="165" cy="30" r="20" fill="{RED}"/><text x="165" y="238" font-size="26" font-weight="800" fill="{INK}" text-anchor="middle">…</text>'
TREE = svg(_tree(), 'One person sends to three, who each send to three more')
NEST = svg(''.join(f'<rect x="{35 + i*32}" y="{15 + i*27}" width="{260 - i*64}" height="{220 - i*54}" rx="12" fill="none" stroke="{[INK, BLUE, GREEN, AMBER][i]}" stroke-width="5">{blink(2.8, i * .5, .25)}</rect>' for i in range(4)) + ''.join(f'<circle cx="{150 + dx}" cy="{120 + dy}" r="6" fill="{RED}"/>' for dx, dy in ((0, 0), (16, 8), (-14, 10), (6, -12), (-8, -8))), 'Candies in a bag, in a box, in a crate, in a truck')
MOON = svg(f'<circle cx="250" cy="52" r="40" fill="#f4e6a6" stroke="{AMBER}" stroke-width="3"/><circle cx="238" cy="42" r="8" fill="#e6d48a"/><circle cx="262" cy="64" r="11" fill="#e6d48a"/><circle cx="258" cy="36" r="5" fill="#e6d48a"/>'
           f'<rect x="60" width="90" fill="#fffdf6" stroke="{INK}" stroke-width="3"><animate attributeName="height" values="4;8;16;32;64;128;128" dur="5s" calcMode="discrete" repeatCount="indefinite"/><animate attributeName="y" values="226;222;214;198;166;102;102" dur="5s" calcMode="discrete" repeatCount="indefinite"/></rect>'
           f'<line x1="20" y1="232" x2="310" y2="232" stroke="{INK}" stroke-width="4" stroke-linecap="round"/><text x="105" y="60" font-size="22" font-weight="800" fill="{BLUE}" text-anchor="middle">×2 ×2 ×2…</text>', 'A stack of paper doubling toward the Moon')
MOULD = svg(f'<rect x="40" y="40" width="250" height="170" rx="40" fill="#f3e2bd" stroke="#c9a66b" stroke-width="5"/><circle cx="165" cy="125" fill="#6f8f4e" opacity=".9"><animate attributeName="r" values="4;8;14;24;42;72;72" dur="5s" calcMode="discrete" repeatCount="indefinite"/></circle><text x="165" y="242" font-size="22" font-weight="800" fill="{BLUE}" text-anchor="middle">×3 every hour</text>', 'A spot of mould growing on a slice of bread')
CUBE = svg(f'<g stroke="{INK}" stroke-width="3.5" stroke-linejoin="round"><polygon points="110,80 230,80 230,200 110,200" fill="#fffdf6"/><polygon points="110,80 150,45 270,45 230,80" fill="#f3ecd9"/><polygon points="230,80 270,45 270,165 230,200" fill="#e6dcc3"/></g>'
           + f'<g stroke="{LINE}" stroke-width="1.5">' + ''.join(f'<line x1="{110 + i*20}" y1="80" x2="{110 + i*20}" y2="200"/><line x1="110" y1="{80 + i*20}" x2="230" y2="{80 + i*20}"/>' for i in range(1, 6)) + '</g>' + bracket(88, 80, 200) + qmark(62, 152) + f'<g>{bob(5, 2)}<rect x="24" y="214" width="18" height="18" fill="#fffdf6" stroke="{INK}" stroke-width="2.5"/></g><text x="52" y="230" font-size="16" fill="{INK}">1 cm</text>', 'One unit cube beside a giant cube')
TRUNK = svg(f'<rect x="40" y="70" width="250" height="104" rx="6" fill="#f3ecd9" stroke="{INK}" stroke-width="4"/><text x="165" y="200" font-size="20" fill="{INK}" text-anchor="middle">120 cm</text><text x="22" y="128" font-size="20" fill="{INK}" text-anchor="middle" transform="rotate(-90 22 128)">50 cm</text>'
            f'<line x1="48" y1="166" x2="282" stroke="{RED}" stroke-width="8" stroke-linecap="round"><animate attributeName="y2" values="166;166;78;78;166" keyTimes="0;.15;.5;.85;1" dur="4.5s" repeatCount="indefinite"/></line>' + qmark(165, 52, 34, RED), 'A rod turning to lie corner to corner in a car trunk')
def _elev():
    fl = lambda n: 222 - (n + 3) * 24
    out = f'<rect x="120" y="14" width="110" height="222" fill="#f3ecd9" stroke="{INK}" stroke-width="4"/>'
    for n in range(-3, 6):
        out += f'<line x1="120" y1="{fl(n) + 12}" x2="230" y2="{fl(n) + 12}" stroke="{LINE}" stroke-width="1.5"/><text x="104" y="{fl(n) + 6}" font-size="17" font-weight="{800 if n in (-3, 5) else 500}" fill="{RED if n < 0 else INK}" text-anchor="end">{("−" + str(-n)) if n < 0 else n}</text>'
    out += f'<rect x="152" width="46" height="22" rx="4" fill="{BLUE}"><animate attributeName="y" values="{fl(-3) - 11};{fl(-3) - 11};{fl(5) - 11};{fl(5) - 11};{fl(-3) - 11}" keyTimes="0;.12;.55;.85;1" dur="5s" repeatCount="indefinite"/></rect>'
    return out + f'<line x1="232" y1="{fl(0) + 12}" x2="262" y2="{fl(0) + 12}" stroke="{INK}" stroke-width="3"/><text x="268" y="{fl(0) + 18}" font-size="15" fill="{INK}">ground</text>'
ELEVATOR = svg(_elev(), 'An elevator riding from floor negative 3 up to floor 5')
DRONE = svg(grid(12, 5, 22, 30, 60) + f'<path id="vwtr" d="M30 170 H294 V60" fill="none" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/><line x1="30" y1="170" x2="294" y2="60" stroke="{BLUE}" stroke-width="3" stroke-dasharray="7 7"/>'
            f'<text x="294" y="50" font-size="30" text-anchor="middle">🏠</text>'
            f'<text font-size="26" text-anchor="middle" dy="9">🚚<animateMotion dur="5s" repeatCount="indefinite" path="M30 170 H294 V60"/></text>'
            f'<circle r="9" fill="{BLUE}"><animateMotion dur="5s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.76;1" calcMode="linear" path="M30 170 L294 60"/></circle>'
            f'<text x="162" y="196" font-size="17" fill="{INK}" text-anchor="middle">12 blocks</text><text x="312" y="120" font-size="17" fill="{INK}" text-anchor="middle">5</text>', 'A truck driving around the corner while a drone flies straight')
def _half():
    X = lambda x: 30 + x * 27; Y = lambda y: 200 - y * 27
    mv = lambda x1, y1, x2, y2: f'<animate attributeName="cx" values="{X(x1)};{X(x1 + (x2-x1)*.22)};{X(x1)}" dur="3s" repeatCount="indefinite"/><animate attributeName="cy" values="{Y(y1)};{Y(y1 + (y2-y1)*.22)};{Y(y1)}" dur="3s" repeatCount="indefinite"/>'
    return (grid(10, 6, 27, 30, 38) + f'<line x1="{X(2)}" y1="{Y(1)}" x2="{X(8)}" y2="{Y(5)}" stroke="{LINE}" stroke-width="3" stroke-dasharray="6 6"/>'
            f'<circle r="11" fill="{BLUE}" cx="{X(2)}" cy="{Y(1)}">{mv(2, 1, 8, 5)}</circle><circle r="11" fill="{RED}" cx="{X(8)}" cy="{Y(5)}">{mv(8, 5, 2, 1)}</circle>'
            f'<text x="{X(2) - 6}" y="{Y(1) + 34}" font-size="18" font-weight="800" fill="{BLUE}" text-anchor="middle">Ava</text><text x="{X(8) + 4}" y="{Y(5) - 18}" font-size="18" font-weight="800" fill="{RED}" text-anchor="middle">Dev</text>')
HALFWAY = svg(_half(), 'Ava and Dev starting to walk toward each other on a grid')
ZIP = svg(f'<line x1="40" y1="40" x2="40" y2="230" stroke="{INK}" stroke-width="6" stroke-linecap="round"/><line x1="40" y1="52" x2="170" y2="130" stroke="{INK}" stroke-width="3.5"/><line x1="170" y1="130" x2="235" y2="169" stroke="{INK}" stroke-width="3.5" stroke-dasharray="7 8" opacity=".5"/>'
          f'<circle cx="170" cy="130" r="8" fill="{AMBER}"/><text x="176" y="118" font-size="20" font-weight="800" fill="{INK}">M</text><text x="52" y="42" font-size="20" font-weight="800" fill="{INK}">S</text>'
          f'<g><animateMotion dur="3.2s" repeatCount="indefinite" keyPoints="0;1;1" keyTimes="0;.7;1" calcMode="linear" path="M40 52 L170 130"/><line x1="0" y1="0" x2="0" y2="22" stroke="{RED}" stroke-width="3"/><circle cx="0" cy="30" r="10" fill="{RED}"/></g>' + qmark(280, 200, 44), 'A rider sliding down a zip-line whose far end is hidden')
def _corner():
    X = lambda x: 60 + x * 36; Y = lambda y: 220 - y * 36
    P = [(1, 1), (4, 2), (3, 5)]
    return (grid(6, 6, 36, 60, 4) + f'<polyline points="{" ".join(f"{X(x)},{Y(y)}" for x, y in P)}" fill="none" stroke="{BLUE}" stroke-width="4" stroke-linejoin="round"/>'
            + ''.join(f'<circle cx="{X(x)}" cy="{Y(y)}" r="10" fill="{RED}">{blink(2.4, i * .6, .3)}</circle>' for i, (x, y) in enumerate(P)))
CORNER = svg(_corner(), 'Three corners of a square joined on a grid', '40 0 250 250')
TAXI = svg(f'<line x1="0" y1="178" x2="330" y2="178" stroke="{INK}" stroke-width="4"/><line x1="0" y1="200" x2="330" y2="200" stroke="{LINE}" stroke-width="4" stroke-dasharray="26 18"><animate attributeName="stroke-dashoffset" values="0;-44" dur=".8s" repeatCount="indefinite"/></line>'
           f'<g>{bob(3, .5)}<text x="150" y="170" font-size="96" text-anchor="middle" transform="translate(300 0) scale(-1 1)">🚕</text></g>'
           f'<text x="165" y="52" font-size="30" font-weight="800" fill="{GREEN}" text-anchor="middle">$4 + $2 + $2 + …</text>', 'A taxi driving along')
def _jar():
    out = f'<path d="M110 60 H220 V84 Q250 96 250 130 V214 Q250 232 232 232 H98 Q80 232 80 214 V130 Q80 96 110 84 Z" fill="#fffdf6" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>'
    out += f'<rect x="88" width="154" rx="6" fill="{AMBER}" opacity=".55"><animate attributeName="height" values="20;36;52;68;84;84" dur="5s" calcMode="discrete" repeatCount="indefinite"/><animate attributeName="y" values="206;190;174;158;142;142" dur="5s" calcMode="discrete" repeatCount="indefinite"/></rect>'
    out += f'<circle cx="165" r="13" fill="{AMBER}" stroke="#a87410" stroke-width="3"><animate attributeName="cy" values="-10;150" dur="1s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;1;0" keyTimes="0;.8;1" dur="1s" repeatCount="indefinite"/></circle>'
    return out
JAR = svg(_jar(), 'Coins dropping into a jar that slowly fills')
CANDLE = svg(f'<rect x="135" width="60" rx="6" fill="#f6efe0" stroke="{INK}" stroke-width="4"><animate attributeName="y" values="70;150;70" keyTimes="0;.85;1" dur="7s" repeatCount="indefinite"/><animate attributeName="height" values="150;70;150" keyTimes="0;.85;1" dur="7s" repeatCount="indefinite"/></rect>'
             f'<g><animateTransform attributeName="transform" type="translate" values="0 0;0 80;0 0" keyTimes="0;.85;1" dur="7s" repeatCount="indefinite"/><line x1="165" y1="70" x2="165" y2="56" stroke="{INK}" stroke-width="3"/><ellipse cx="165" cy="40" rx="11" fill="{AMBER}"><animate attributeName="ry" values="18;22;16;21;18" dur=".7s" repeatCount="indefinite"/></ellipse><ellipse cx="165" cy="45" rx="5" ry="9" fill="{RED}"/></g>'
             f'<ellipse cx="165" cy="222" rx="70" ry="10" fill="{LINE}"/>' + bracket(232, 70, 220) + qmark(262, 156), 'A candle burning down')
def _ship():
    X = lambda x: 50 + x * 40; Y = lambda y: 220 - y * 40
    out = grid(6, 5, 40, 50, 20) + f'<line x1="50" y1="20" x2="50" y2="220" stroke="{INK}" stroke-width="3"/><line x1="50" y1="220" x2="290" y2="220" stroke="{INK}" stroke-width="3"/>'
    out += ''.join(f'<text x="{X(i)}" y="240" font-size="15" fill="{INK}" text-anchor="middle">{i}</text>' for i in range(1, 7)) + ''.join(f'<text x="38" y="{Y(i) + 5}" font-size="15" fill="{INK}" text-anchor="end">{i}</text>' for i in range(1, 6))
    return out + ''.join(f'<circle cx="{X(3)}" cy="{Y(y)}" r="12" fill="{RED}">{blink(2.4, (y - 1) * .4, .25)}</circle>' for y in range(1, 5))
SHIP = svg(_ship(), 'Four points on a grid, all in one column')
TWOQ = svg(''.join(f'<g>{bob(10, 1.8, i * .5)}<rect x="{45 + i*135}" y="60" width="105" height="130" rx="14" fill="#fffdf6" stroke="{[BLUE, RED][i]}" stroke-width="5"/><text x="{97 + i*135}" y="150" font-size="70" font-weight="800" fill="{[BLUE, RED][i]}" text-anchor="middle">?</text></g>' for i in range(2)), 'Two mystery number cards')
MOVIE = svg(emo('🎟️', 100, 150, 96, 10, 1.8) + emo('🍿', 230, 150, 96, 10, 1.8, .6), 'A movie ticket and popcorn')
STORE = svg(emo('✏️', 105, 150, 96, 10, 1.8) + f'<g>{bob(10, 1.8, .6)}<rect x="185" y="92" width="96" height="58" rx="12" fill="#f3a6b5" stroke="{INK}" stroke-width="4" transform="rotate(-12 233 121)"/><rect x="185" y="92" width="34" height="58" rx="12" fill="#7fb0e6" stroke="{INK}" stroke-width="4" transform="rotate(-12 233 121)"/></g>', 'A pencil and an eraser')
CAGE = svg(emo('🐓', 105, 160, 92, 12, 1.4) + emo('🐇', 235, 160, 92, 12, 1.4, .5) + f'<g stroke="{INK}" stroke-width="4" stroke-linecap="round">' + ''.join(f'<line x1="{30 + i*30}" y1="40" x2="{30 + i*30}" y2="200"/>' for i in range(10)) + '<line x1="20" y1="40" x2="310" y2="40"/><line x1="20" y1="200" x2="310" y2="200"/></g>', 'A pheasant and a rabbit in a cage')

# ---------------- header strips: a tiny moving scene in the white space at the top right of a warm-up card ----------------
# viewBox 340 x 60. Purely for fun; a strip never carries information the puzzle needs. Emoji that move are flipped so
# they face the way they travel (most emoji face left).
def strip(*els, label=''):
    return f'<svg viewBox="0 0 340 60" aria-hidden="true">{"".join(els)}</svg>'
def sb(ch, x, begin=0, size=40, dy=7, dur=1.5, y=46):
    return f'<g>{bob(dy, dur, begin)}<text x="{x}" y="{y}" font-size="{size}" text-anchor="middle">{ch}</text></g>'
def sblink(ch, x, begin=0, size=40, dur=1.6, y=46, lo=.15):
    return f'<text x="{x}" y="{y}" font-size="{size}" text-anchor="middle">{ch}{blink(dur, begin, lo)}</text>'
def sspin(ch, x, dur=4, size=40, y=30, rev=False):
    return f'<g><animateTransform attributeName="transform" type="rotate" values="{"360" if rev else "0"} {x} {y};{"0" if rev else "360"} {x} {y}" dur="{dur}s" repeatCount="indefinite"/><text x="{x}" y="{y}" font-size="{size}" text-anchor="middle" dominant-baseline="central">{ch}</text></g>'
def srock(ch, x, deg=12, dur=2.2, size=44, y=46):
    return f'<g><animateTransform attributeName="transform" type="rotate" values="{-deg} {x} {y};{deg} {x} {y};{-deg} {x} {y}" dur="{dur}s" repeatCount="indefinite"/><text x="{x}" y="{y}" font-size="{size}" text-anchor="middle">{ch}</text></g>'
def sdrive(ch, dur=5, begin=0, size=40, y=46, x0=-40, x1=380, flip=True, hop=0):
    inner = f'<text x="0" y="{y}" font-size="{size}" text-anchor="middle"{" transform=" + chr(34) + "scale(-1 1)" + chr(34) if flip else ""}>{ch}</text>'
    if hop: inner = f'<g>{bob(hop, .5)}{inner}</g>'
    return f'<g transform="translate({x0} 0)"><animateTransform attributeName="transform" type="translate" values="{x0} 0;{x1} 0" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>{inner}</g>'
def sroad(y=52):
    return f'<line x1="0" y1="{y}" x2="340" y2="{y}" stroke="{LINE}" stroke-width="3" stroke-dasharray="16 12"><animate attributeName="stroke-dashoffset" values="0;-28" dur=".7s" repeatCount="indefinite"/></line>'
def sfloat(ch, x, dur=3, begin=0, size=30):
    return f'<text x="{x}" font-size="{size}" text-anchor="middle">{ch}<animate attributeName="y" values="64;-6" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.15;.8;1" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/></text>'
def sbatt(x, col, dur):
    return (f'<rect x="{x}" y="14" width="92" height="36" rx="7" fill="#fffdf6" stroke="{INK}" stroke-width="3.5"/><rect x="{x+92}" y="24" width="7" height="16" rx="2" fill="{INK}"/>'
            f'<rect x="{x+6}" y="20" height="24" rx="3" fill="{col}"><animate attributeName="width" values="80;4;80" keyTimes="0;.9;1" dur="{dur}s" repeatCount="indefinite"/></rect>')
def sclock(x=170):
    hand = lambda L, w, dur: f'<line x1="{x}" y1="30" x2="{x}" y2="{30 - L}" stroke="{INK}" stroke-width="{w}" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="0 {x} 30;360 {x} 30" dur="{dur}s" repeatCount="indefinite"/></line>'
    return f'<circle cx="{x}" cy="30" r="27" fill="#fffdf6" stroke="{INK}" stroke-width="3.5"/>' + ''.join(f'<line x1="{x}" y1="6" x2="{x}" y2="10" stroke="{INK}" stroke-width="2.5" transform="rotate({a} {x} 30)"/>' for a in range(0, 360, 30)) + hand(14, 4.5, 48) + hand(22, 3, 4) + f'<circle cx="{x}" cy="30" r="3" fill="{RED}"/>'
def ssquares(n=12):
    return ''.join(f'<rect x="{30 + i*24}" y="20" width="20" height="20" rx="3" fill="{[BLUE, AMBER, GREEN, RED][i % 4]}">{blink(2.4, i * .2, .2)}</rect>' for i in range(n))

STRIPS = {}
