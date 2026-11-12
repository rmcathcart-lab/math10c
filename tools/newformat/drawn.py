"""Drawn objects for the warm-up pictures and header strips (Ryan, 2026-11-12: the moving emoji felt lazy; he prefers
drawn animations). Plain SVG + SMIL, no emoji, no scripts. Each object is drawn around (0, 0) at roughly 40 x 40 units;
place it with at(x, y, obj, scale) and animate it with the wrappers below."""
INK, BLUE, RED, GREEN, AMBER, LINE, PAPER = '#4a4436', '#2b55a0', '#c93a33', '#12805a', '#e0a11b', '#d9d3c4', '#fffdf6'
SKY, PINK, BROWN, GREY, LEAF = '#9cc3ea', '#f3a6b5', '#a8732f', '#b9b2a3', '#5f9a3c'
W = f'stroke="{INK}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"'

# ---------------- placing and moving ----------------
def at(x, y, obj, s=1, rot=0):
    r = f' rotate({rot})' if rot else ''
    return f'<g transform="translate({x} {y}) scale({s}){r}">{obj}</g>'
def bob(obj, dy=5, dur=1.6, begin=0):
    return f'<g><animateTransform attributeName="transform" type="translate" values="0 0;0 {-dy};0 0" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>{obj}</g>'
def rock(obj, cx, cy, deg=10, dur=2.4, begin=0):
    return f'<g><animateTransform attributeName="transform" type="rotate" values="{-deg} {cx} {cy};{deg} {cx} {cy};{-deg} {cx} {cy}" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>{obj}</g>'
def spin(obj, cx, cy, dur=4, rev=False):
    a, b = ('360', '0') if rev else ('0', '360')
    return f'<g><animateTransform attributeName="transform" type="rotate" values="{a} {cx} {cy};{b} {cx} {cy}" dur="{dur}s" repeatCount="indefinite"/>{obj}</g>'
def slide(obj, x0, x1, dur=5, begin=0, y0=0, y1=None):
    y1 = y0 if y1 is None else y1
    return f'<g transform="translate({x0} {y0})"><animateTransform attributeName="transform" type="translate" values="{x0} {y0};{x1} {y1}" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>{obj}</g>'
def fade(obj, values='0;1;1;0', times='0;.15;.85;1', dur=3, begin=0):
    return f'<g opacity="0"><animate attributeName="opacity" values="{values}" keyTimes="{times}" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>{obj}</g>'
def pulse(obj, lo=1, hi=1.15, dur=1.4, begin=0):
    """Grow and shrink about the object's own origin (use inside at(...))."""
    return f'<g><animateTransform attributeName="transform" type="scale" values="{lo};{hi};{lo}" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>{obj}</g>'
def hop(obj, dx, h, dur=1.2, begin=0, n=1):
    """A jump: forward dx, up h at the middle (an arc), repeated."""
    return (f'<g><animateTransform attributeName="transform" type="translate" values="0 0;{dx/2} {-h};{dx} 0;{dx} 0" keyTimes="0;.35;.7;1" '
            f'keySplines=".2 .6 .4 1;.6 0 .8 .4;0 0 1 1" calcMode="spline" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/>{obj}</g>')
def strip(*els):
    return f'<svg viewBox="0 0 340 60" aria-hidden="true">{"".join(els)}</svg>'

# ---------------- objects ----------------
def phone(col=BLUE):
    return (f'<rect x="-11" y="-20" width="22" height="40" rx="4.5" fill="{PAPER}" {W}/><rect x="-7.5" y="-15" width="15" height="27" rx="1.5" fill="{col}" opacity=".18"/>'
            f'<circle cx="0" cy="16" r="1.8" fill="{INK}"/>')
def bubble(col=BLUE, w=34, flip=False):
    sx = -1 if flip else 1
    return (f'<g transform="scale({sx} 1)"><path d="M{-w/2} -11 H{w/2} Q{w/2+4} -11 {w/2+4} -7 V5 Q{w/2+4} 9 {w/2} 9 H{-w/2+10} L{-w/2+2} 15 L{-w/2+4} 9 H{-w/2} Q{-w/2-4} 9 {-w/2-4} 5 V-7 Q{-w/2-4} -11 {-w/2} -11 Z" fill="{PAPER}" stroke="{col}" stroke-width="2.5" stroke-linejoin="round"/>'
            f'<line x1="{-w/2+2}" y1="-4" x2="{w/2-2}" y2="-4" stroke="{col}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/><line x1="{-w/2+2}" y1="3" x2="{w/6}" y2="3" stroke="{col}" stroke-width="2.5" stroke-linecap="round" opacity=".55"/></g>')
def heart(col=RED):
    return f'<path d="M0 9 C-14 -2 -9 -14 0 -7 C9 -14 14 -2 0 9 Z" fill="{col}" stroke="{INK}" stroke-width="1.5" stroke-linejoin="round"/>'
def magnifier():
    return (f'<line x1="6" y1="6" x2="16" y2="16" stroke="{INK}" stroke-width="5.5" stroke-linecap="round"/>'
            f'<circle cx="-2" cy="-2" r="11" fill="{SKY}" fill-opacity=".35" {W} stroke-width="3"/><path d="M-8 -6 Q-6 -9 -2 -10" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>')
def card(label='?', col=BLUE, w=28, h=36, fs=22):
    return (f'<rect x="{-w/2}" y="{-h/2}" width="{w}" height="{h}" rx="5" fill="{PAPER}" stroke="{col}" stroke-width="2.8"/>'
            f'<text x="0" y="{fs*.36:.1f}" font-size="{fs}" font-weight="800" fill="{col}" text-anchor="middle" font-family="system-ui, sans-serif">{label}</text>')
def person(col=BLUE):
    return f'<circle cx="0" cy="-12" r="6.5" fill="{col}"/><path d="M-9 14 V4 Q-9 -4 0 -4 Q9 -4 9 4 V14 Z" fill="{col}"/>'
def runner(col=BLUE, dur=.5, begin=0):
    leg = lambda a, b: f'<line x1="0" y1="2" x2="0" y2="17" stroke="{col}" stroke-width="4" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="{a} 0 2;{b} 0 2;{a} 0 2" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/></line>'
    arm = lambda a, b: f'<line x1="0" y1="-8" x2="0" y2="4" stroke="{col}" stroke-width="3.5" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="{a} 0 -8;{b} 0 -8;{a} 0 -8" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/></line>'
    return (leg(35, -35) + leg(-35, 35) + arm(-40, 40) + arm(40, -40) +
            f'<line x1="0" y1="-10" x2="2" y2="3" stroke="{col}" stroke-width="5" stroke-linecap="round"/><circle cx="2" cy="-17" r="5.5" fill="{col}"/>')
def walker(col=BLUE, dur=.9):
    leg = lambda a, b: f'<line x1="0" y1="2" x2="0" y2="17" stroke="{col}" stroke-width="4" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="{a} 0 2;{b} 0 2;{a} 0 2" dur="{dur}s" repeatCount="indefinite"/></line>'
    return leg(22, -22) + leg(-22, 22) + f'<line x1="0" y1="-9" x2="0" y2="3" stroke="{col}" stroke-width="5" stroke-linecap="round"/><circle cx="0" cy="-16" r="5.5" fill="{col}"/>'
def wheel(x, y, r=5, dur=.5):
    return (f'<g><circle cx="{x}" cy="{y}" r="{r}" fill="{INK}"/><circle cx="{x}" cy="{y}" r="{r*.4}" fill="{GREY}"/>'
            f'<line x1="{x}" y1="{y-r*.85}" x2="{x}" y2="{y+r*.85}" stroke="{GREY}" stroke-width="1.5"><animateTransform attributeName="transform" type="rotate" values="0 {x} {y};360 {x} {y}" dur="{dur}s" repeatCount="indefinite"/></line></g>')
def car(col=RED, spin_dur=.5):
    return (f'<path d="M-12 -7 L-7 -16 H7 L13 -7 Z" fill="{SKY}" {W}/><line x1="0" y1="-16" x2="0" y2="-7" stroke="{INK}" stroke-width="2.5"/>'
            f'<rect x="-21" y="-8" width="42" height="13" rx="5" fill="{col}" {W}/><circle cx="17" cy="-3" r="1.8" fill="{AMBER}"/>' + wheel(-11, 6, 5.5, spin_dur) + wheel(11, 6, 5.5, spin_dur))
def taxi(spin_dur=.5):
    return (f'<rect x="-6" y="-22" width="12" height="6" rx="1.5" fill="{AMBER}" {W} stroke-width="2"/>' + car(AMBER, spin_dur) +
            ''.join(f'<rect x="{-16 + i*6}" y="-2" width="3" height="3" fill="{INK}"/>' for i in range(6)))
def truck(col=AMBER):
    return (f'<rect x="-22" y="-18" width="28" height="22" rx="2" fill="{col}" {W}/><path d="M6 -10 H15 L21 -2 V4 H6 Z" fill="{PAPER}" {W}/>'
            f'<path d="M9 -7 H14 L18 -2 H9 Z" fill="{SKY}"/>' + wheel(-13, 6, 5) + wheel(13, 6, 5))
def house(col=RED):
    return (f'<rect x="-14" y="-4" width="28" height="20" fill="{PAPER}" {W}/><path d="M-19 -2 L0 -19 L19 -2" fill="{col}" {W}/>'
            f'<rect x="-4" y="5" width="8" height="11" fill="{col}" opacity=".8"/><rect x="5" y="0" width="6" height="6" fill="{SKY}" stroke="{INK}" stroke-width="1.5"/>')
def frog(col=GREEN):
    eye = lambda x: f'<circle cx="{x}" cy="-9" r="5" fill="#fff" stroke="{col}" stroke-width="3"/><circle cx="{x}" cy="-9" r="2" fill="{INK}"/>'
    return (f'<path d="M-15 8 Q-21 12 -14 13 M15 8 Q21 12 14 13" fill="none" stroke="{col}" stroke-width="4" stroke-linecap="round"/>'
            f'<ellipse cx="0" cy="3" rx="14" ry="10" fill="{col}"/>' + eye(-7) + eye(7) + f'<path d="M-5 5 Q0 8 5 5" fill="none" stroke="{INK}" stroke-width="1.6" stroke-linecap="round"/>')
def lilypad(col=LEAF):
    return f'<path d="M0 0 L12 -3 A13 6 0 1 1 12 3 Z" fill="{col}" opacity=".75"/>'
def tortoise():
    legs = ''.join(f'<rect x="{x}" y="2" width="5" height="8" rx="2" fill="{LEAF}" stroke="{INK}" stroke-width="1.8"/>' for x in (-11, 6))
    return (legs + f'<circle cx="17" cy="-3" r="5" fill="{LEAF}" stroke="{INK}" stroke-width="1.8"/><circle cx="18.5" cy="-4.5" r="1.1" fill="{INK}"/>'
            f'<path d="M-16 4 Q-16 -14 0 -14 Q16 -14 16 4 Z" fill="#6f8f4e" {W}/><path d="M-8 4 L-5 -8 H5 L8 4 M-5 -8 L0 -14 L5 -8" fill="none" stroke="#4d6a32" stroke-width="1.8"/>')
def hare():
    return (f'<ellipse cx="-12" cy="-12" rx="3" ry="9" fill="{GREY}" stroke="{INK}" stroke-width="1.8" transform="rotate(-25 -12 -12)"/>'
            f'<ellipse cx="-6" cy="-13" rx="3" ry="9" fill="{GREY}" stroke="{INK}" stroke-width="1.8" transform="rotate(-10 -6 -13)"/>'
            f'<ellipse cx="4" cy="2" rx="15" ry="9" fill="#d8d2c4" {W}/><circle cx="-9" cy="-3" r="7" fill="#d8d2c4" {W}/><circle cx="-11" cy="-4" r="1.3" fill="{INK}"/>'
            f'<circle cx="19" cy="-1" r="3.5" fill="#fff" stroke="{INK}" stroke-width="1.6"/>')
def cookie(r=20):
    chips = ((-7, -6), (6, -9), (9, 4), (-3, 6), (-10, 5), (2, -1))
    return f'<circle cx="0" cy="0" r="{r}" fill="#d9a35b" stroke="{BROWN}" stroke-width="3"/>' + ''.join(f'<ellipse cx="{x*r/20:.1f}" cy="{y*r/20:.1f}" rx="{2.6*r/20:.1f}" ry="{2.1*r/20:.1f}" fill="#5a3a1e"/>' for x, y in chips)
def ticket(col=RED):
    return (f'<path d="M-20 -12 H20 V-5 A5 5 0 0 0 20 5 V12 H-20 V5 A5 5 0 0 0 -20 -5 Z" fill="{col}" {W}/>'
            f'<line x1="-9" y1="-12" x2="-9" y2="12" stroke="{PAPER}" stroke-width="2" stroke-dasharray="3 3"/><rect x="-4" y="-5" width="18" height="10" rx="2" fill="none" stroke="{PAPER}" stroke-width="2"/>')
def popcorn():
    puffs = ''.join(f'<circle cx="{x}" cy="{y}" r="5.5" fill="#fff4cf" stroke="{AMBER}" stroke-width="1.6"/>' for x, y in ((-10, -14), (-3, -17), (5, -16), (11, -12), (0, -11), (-7, -9), (8, -8)))
    stripes = ''.join(f'<path d="M{-13 + i*6.5} -7 L{-10.5 + i*5.3} 18 H{-7.5 + i*5.3} L{-9.5 + i*6.5} -7 Z" fill="{RED}"/>' for i in range(4))
    return puffs + f'<path d="M-15 -7 H15 L11 18 H-11 Z" fill="#fff" {W}/>' + stripes + f'<path d="M-15 -7 H15 L11 18 H-11 Z" fill="none" {W}/>'
def pencil():
    return (f'<g transform="rotate(-35)"><rect x="-22" y="-5" width="32" height="10" fill="{AMBER}" {W}/><line x1="-22" y1="0" x2="10" y2="0" stroke="#c98a10" stroke-width="1.5"/>'
            f'<path d="M10 -5 L22 0 L10 5 Z" fill="#f2d4a6" {W}/><path d="M18.5 -1.5 L22 0 L18.5 1.5 Z" fill="{INK}"/>'
            f'<rect x="-30" y="-5" width="8" height="10" rx="2" fill="{PINK}" {W}/><rect x="-24" y="-5" width="3" height="10" fill="{GREY}" stroke="{INK}" stroke-width="1.5"/></g>')
def eraser():
    return f'<g transform="rotate(-12)"><rect x="-17" y="-10" width="34" height="20" rx="4" fill="{PINK}" {W}/><rect x="-17" y="-10" width="12" height="20" rx="4" fill="#7fb0e6" {W}/></g>'
def apple(col=RED):
    return (f'<path d="M0 -8 C-6 -14 -17 -10 -16 1 C-15 12 -7 17 0 13 C7 17 15 12 16 1 C17 -10 6 -14 0 -8 Z" fill="{col}" {W}/>'
            f'<path d="M0 -8 Q1 -14 4 -17" fill="none" stroke="{BROWN}" stroke-width="2.5" stroke-linecap="round"/><path d="M3 -12 Q10 -17 13 -11 Q7 -9 3 -12 Z" fill="{LEAF}" stroke="{INK}" stroke-width="1.5"/>'
            f'<path d="M-9 -3 Q-10 2 -7 6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".7"/>')
def banana():
    return (f'<path d="M-17 -8 Q-12 14 15 10 Q18 9 17 6 Q-4 6 -11 -11 Q-14 -13 -17 -8 Z" fill="#f2cf3a" {W}/>'
            f'<path d="M-14 -11 L-12 -15" stroke="{BROWN}" stroke-width="3" stroke-linecap="round"/><path d="M-10 0 Q-2 7 10 7" fill="none" stroke="#d9ac16" stroke-width="1.6"/>')
def coconut():
    return (f'<circle cx="0" cy="0" r="15" fill="#8a5a2b" {W}/><path d="M-11 -6 Q-6 -1 -9 5 M7 -10 Q3 -3 8 3 M-2 8 Q2 12 6 10" fill="none" stroke="#6b4420" stroke-width="1.8" stroke-linecap="round"/>'
            f'<circle cx="-4" cy="-5" r="2" fill="#3e2610"/><circle cx="3" cy="-5" r="2" fill="#3e2610"/><circle cx="-0.5" cy="1" r="2" fill="#3e2610"/>')
def giftbag(col=BLUE):
    return (f'<path d="M-7 -12 Q-7 -20 0 -20 Q7 -20 7 -12" fill="none" stroke="{INK}" stroke-width="2.5"/><path d="M-14 -12 H14 L12 16 H-12 Z" fill="{col}" {W}/>'
            f'<path d="M-5 -2 L0 3 L5 -2" fill="none" stroke="{PAPER}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>')
def balloon(col=RED):
    return (f'<path d="M0 14 Q-4 22 2 30" fill="none" stroke="{INK}" stroke-width="1.5"/><ellipse cx="0" cy="0" rx="11" ry="13" fill="{col}" {W}/>'
            f'<path d="M-2 13 L2 13 L0 16 Z" fill="{col}" stroke="{INK}" stroke-width="1.5"/><path d="M-5 -6 Q-4 -9 -1 -10" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".8"/>')
def gear(r=14, teeth=8, col=GREY):
    import math
    pts = []
    for i in range(teeth * 4):
        a = 2 * math.pi * i / (teeth * 4)
        rr = r if (i % 4) in (1, 2) else r * .74
        pts.append(f'{rr*math.cos(a):.1f},{rr*math.sin(a):.1f}')
    return f'<polygon points="{" ".join(pts)}" fill="{col}" {W} stroke-width="2"/><circle cx="0" cy="0" r="{r*.3:.1f}" fill="{PAPER}" stroke="{INK}" stroke-width="2"/>'
def padlock(open_dur=2.4):
    return (f'<path d="M-8 -4 V-12 Q-8 -21 0 -21 Q8 -21 8 -12 V-4" fill="none" stroke="{GREY}" stroke-width="5" stroke-linecap="round">'
            f'<animateTransform attributeName="transform" type="translate" values="0 0;0 0;0 -6;0 -6;0 0" keyTimes="0;.4;.5;.85;1" dur="{open_dur}s" repeatCount="indefinite"/></path>'
            f'<rect x="-14" y="-6" width="28" height="22" rx="4" fill="{AMBER}" {W}/><circle cx="0" cy="3" r="3" fill="{INK}"/><rect x="-1.2" y="4" width="2.4" height="6" fill="{INK}"/>')
def key():
    return (f'<circle cx="-10" cy="0" r="7" fill="none" stroke="{AMBER}" stroke-width="4"/><line x1="-3" y1="0" x2="16" y2="0" stroke="{AMBER}" stroke-width="4" stroke-linecap="round"/>'
            f'<path d="M10 0 V6 M15 0 V5" stroke="{AMBER}" stroke-width="3.5" stroke-linecap="round"/>')
def flag():
    sq = ''.join(f'<rect x="{c*7}" y="{-20 + r*7}" width="7" height="7" fill="{INK if (r + c) % 2 == 0 else PAPER}"/>' for r in range(3) for c in range(4))
    return (f'<line x1="0" y1="-21" x2="0" y2="20" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>'
            f'<g>{sq}<rect x="0" y="-20" width="28" height="21" fill="none" stroke="{INK}" stroke-width="1.5"/>'
            f'<animateTransform attributeName="transform" type="skewY" values="0;-8;0;6;0" dur="1.6s" repeatCount="indefinite"/></g>')
def calculator(screen=''):
    keys = ''.join(f'<rect x="{-12 + c*8.5}" y="{-2 + r*7}" width="6.5" height="5" rx="1.2" fill="{[GREY, GREY, GREY, AMBER][c]}"/>' for r in range(3) for c in range(4))
    return (f'<rect x="-17" y="-21" width="34" height="42" rx="5" fill="#3d4652" {W}/><rect x="-12" y="-16" width="24" height="10" rx="1.5" fill="#cfe0c3"/>'
            f'<text x="10" y="-8.3" font-size="8" font-family="monospace" font-weight="700" fill="{INK}" text-anchor="end">{screen}</text>' + keys)
def stopwatch(dur=3):
    return (f'<rect x="-3" y="-21" width="6" height="5" rx="1" fill="{INK}"/><line x1="10" y1="-14" x2="13" y2="-17" stroke="{INK}" stroke-width="3" stroke-linecap="round"/>'
            f'<circle cx="0" cy="0" r="15" fill="{PAPER}" {W}/>' + ''.join(f'<line x1="0" y1="-12" x2="0" y2="-10" stroke="{INK}" stroke-width="1.8" transform="rotate({a})"/>' for a in range(0, 360, 45)) +
            f'<line x1="0" y1="0" x2="0" y2="-11" stroke="{RED}" stroke-width="2.5" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="0;360" dur="{dur}s" repeatCount="indefinite"/></line><circle r="2" fill="{INK}"/>')
def head_gears():
    return (f'<path d="M-15 18 V9 Q-21 -2 -14 -12 Q-6 -21 6 -18 Q16 -14 16 -3 L20 4 L16 6 V11 Q16 15 10 15 H5 V18" fill="{PAPER}" {W}/>'
            + at(-3, -5, spin(gear(7, 7, AMBER), 0, 0, 3), 1) + at(7, 3, spin(gear(5, 6, BLUE), 0, 0, 3, True), 1))
def thought(dots=True):
    cloud = f'<path d="M-14 4 Q-22 4 -20 -4 Q-22 -13 -12 -13 Q-9 -21 0 -19 Q9 -23 14 -14 Q23 -13 21 -4 Q24 5 14 5 Q8 11 0 7 Q-8 11 -14 4 Z" fill="{PAPER}" {W}/>'
    tail = f'<circle cx="-16" cy="13" r="3.2" fill="{PAPER}" {W} stroke-width="2"/><circle cx="-21" cy="19" r="2" fill="{PAPER}" {W} stroke-width="2"/>'
    d = ''.join(fade(f'<circle cx="{x}" cy="-5" r="2.8" fill="{BLUE}"/>', '0;1;1;0', '0;.2;.8;1', 2.4, i * .4) for i, x in enumerate((-8, 0, 8))) if dots else ''
    return tail + cloud + d
def crystal_ball():
    return (f'<defs><radialGradient id="vwg-ball" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#e4ecff"/><stop offset=".6" stop-color="#9b8de0"/><stop offset="1" stop-color="#5b4bb0"/></radialGradient></defs>'
            f'<path d="M-15 14 H15 L12 21 H-12 Z" fill="{BROWN}" {W}/><circle cx="0" cy="-2" r="16" fill="url(#vwg-ball)" {W}/>'
            + spin(f'<path d="M-8 -2 Q-4 -10 4 -6 Q9 -3 6 3" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>', 0, -2, 3) +
            f'<path d="M-9 -10 Q-6 -14 -1 -15" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".9"/>')
def sparkle(col=AMBER, s=1):
    return f'<path d="M0 {-8*s} L{2*s} {-2*s} L{8*s} 0 L{2*s} {2*s} L0 {8*s} L{-2*s} {2*s} L{-8*s} 0 L{-2*s} {-2*s} Z" fill="{col}"/>'
def twinkle(x, y, col=AMBER, s=1, dur=1.6, begin=0):
    return f'<g transform="translate({x} {y})"><g>{sparkle(col, s)}<animateTransform attributeName="transform" type="scale" values=".3;1;.3" dur="{dur}s" begin="{begin}s" repeatCount="indefinite"/></g></g>'
def rocket():
    return (f'<g><path d="M-22 -4 Q-34 0 -22 4 Z" fill="{AMBER}"><animate attributeName="d" values="M-22 -4 Q-34 0 -22 4 Z;M-22 -4 Q-40 0 -22 4 Z;M-22 -4 Q-34 0 -22 4 Z" dur=".3s" repeatCount="indefinite"/></path>'
            f'<path d="M-22 -3 Q-29 0 -22 3 Z" fill="{RED}"/></g><path d="M-22 -8 L-14 -8 L-12 -16 L-20 -16 Z M-22 8 L-14 8 L-12 16 L-20 16 Z" fill="{RED}" {W} stroke-width="2"/>'
            f'<path d="M-22 -8 H8 Q22 -8 26 0 Q22 8 8 8 H-22 Z" fill="{PAPER}" {W}/><circle cx="5" cy="0" r="4" fill="{SKY}" stroke="{INK}" stroke-width="2"/>')
def scale_beam(left='', right='', deg=8, dur=2.8):
    """A balance: the beam rocks, the pans hang level. left/right: objects drawn on the pans (around 0,0, ~20 wide)."""
    pan = lambda x, obj, sgn: (f'<g><animateTransform attributeName="transform" type="rotate" values="{deg*sgn} {x} -14;{-deg*sgn} {x} -14;{deg*sgn} {x} -14" dur="{dur}s" repeatCount="indefinite"/>'
                               f'<line x1="{x}" y1="-14" x2="{x-9}" y2="2" stroke="{INK}" stroke-width="1.5"/><line x1="{x}" y1="-14" x2="{x+9}" y2="2" stroke="{INK}" stroke-width="1.5"/>'
                               f'<path d="M{x-13} 2 H{x+13} Q{x} 10 {x-13} 2 Z" fill="{GREY}" {W} stroke-width="2"/>{at(x, -5, obj, .55)}</g>')
    beam = (f'<g><animateTransform attributeName="transform" type="rotate" values="{-deg} 0 -14;{deg} 0 -14;{-deg} 0 -14" dur="{dur}s" repeatCount="indefinite"/>'
            f'<line x1="-30" y1="-14" x2="30" y2="-14" stroke="{INK}" stroke-width="3.5" stroke-linecap="round"/>' + pan(-30, left, -1) + pan(30, right, 1) + '</g>')
    return f'<path d="M-9 22 H9 L4 16 H-4 Z" fill="{INK}"/><line x1="0" y1="-14" x2="0" y2="18" stroke="{INK}" stroke-width="3.5"/>' + beam + f'<circle cx="0" cy="-14" r="3" fill="{AMBER}" stroke="{INK}" stroke-width="1.5"/>'
def vending():
    items = ''.join(f'<rect x="{-13 + c*8.5}" y="{-17 + r*9}" width="6" height="6" rx="1.5" fill="{[RED, BLUE, GREEN][(r + c) % 3]}"/>' for r in range(3) for c in range(3))
    drop = f'<rect x="-4.5" width="6" height="6" rx="1.5" fill="{BLUE}"><animate attributeName="y" values="-8;-8;12;12" keyTimes="0;.45;.65;1" dur="2.6s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;.44;.46;.9;1" dur="2.6s" repeatCount="indefinite"/></rect>'
    return (f'<rect x="-18" y="-22" width="36" height="44" rx="3" fill="{RED}" {W}/><rect x="-15" y="-19" width="23" height="28" fill="{SKY}" fill-opacity=".45" stroke="{INK}" stroke-width="1.8"/>' + items +
            f'<rect x="10" y="-17" width="5" height="12" rx="1" fill="{PAPER}" stroke="{INK}" stroke-width="1.5"/><rect x="-15" y="12" width="23" height="7" fill="{INK}"/>' + drop)
def receipt(dur=3):
    lines = ''.join(f'<line x1="-10" y1="{-12 + i*6}" x2="{[8, 4, 9, 6][i]}" y2="{-12 + i*6}" stroke="{GREY}" stroke-width="2.4" stroke-linecap="round"/>' for i in range(4))
    return (f'<defs><clipPath id="vwc-rcpt"><rect x="-16" y="-20" width="32"><animate attributeName="height" values="4;42;42" keyTimes="0;.7;1" dur="{dur}s" repeatCount="indefinite"/></rect></clipPath></defs>'
            f'<g clip-path="url(#vwc-rcpt)"><path d="M-14 -20 H14 V18 L10 21 L6 18 L2 21 L-2 18 L-6 21 L-10 18 L-14 21 Z" fill="#fff" {W} stroke-width="2"/>{lines}'
            f'<line x1="-10" y1="12" x2="10" y2="12" stroke="{INK}" stroke-width="2.6" stroke-linecap="round"/></g>'
            f'<rect x="-19" y="-24" width="38" height="6" rx="2" fill="{INK}"/>')
def disguise():
    return (f'<rect x="-14" y="-24" width="28" height="12" rx="1" fill="{INK}"/><rect x="-20" y="-13" width="40" height="4" rx="2" fill="{INK}"/>'
            f'<circle cx="-8" cy="-1" r="7" fill="{SKY}" fill-opacity=".3" {W}/><circle cx="8" cy="-1" r="7" fill="{SKY}" fill-opacity=".3" {W}/><path d="M-1 -2 Q0 -4 1 -2" fill="none" {W}/>'
            f'<path d="M0 6 Q-4 3 -9 6 Q-13 10 -16 7 Q-12 14 -5 11 Q-2 10 0 9 Q2 10 5 11 Q12 14 16 7 Q13 10 9 6 Q4 3 0 6 Z" fill="{BROWN}" stroke="{INK}" stroke-width="1.5"/>'
            f'<path d="M-3 0 Q0 7 3 0" fill="#e8b48f" stroke="{INK}" stroke-width="1.5"/>')
def mask():
    return (f'<path d="M-20 -6 Q-12 -12 0 -6 Q12 -12 20 -6 Q22 4 12 6 Q4 7 0 1 Q-4 7 -12 6 Q-22 4 -20 -6 Z" fill="{BLUE}" {W}/>'
            f'<ellipse cx="-9" cy="-2" rx="4.5" ry="3" fill="{PAPER}"/><ellipse cx="9" cy="-2" rx="4.5" ry="3" fill="{PAPER}"/>'
            f'<path d="M-20 -4 Q-26 -8 -28 -2 M20 -4 Q26 -8 28 -2" fill="none" stroke="{INK}" stroke-width="1.8"/>')
def footprint(flip=False):
    sx = -1 if flip else 1
    return f'<g transform="scale({sx} 1)"><ellipse cx="0" cy="2" rx="3.6" ry="5.5" fill="{GREY}"/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="1.4" fill="{GREY}"/>' for x, y in ((-3, -6), (-1, -7.5), (1.3, -7.5), (3.4, -6))) + '</g>'
def pin(col=RED):
    return f'<path d="M0 18 Q-14 0 -11 -8 Q-8 -18 0 -18 Q8 -18 11 -8 Q14 0 0 18 Z" fill="{col}" {W}/><circle cx="0" cy="-7" r="4.5" fill="{PAPER}"/>'
def fence_post(h=34):
    return f'<path d="M-4 {h/2} V{-h/2 + 5} L0 {-h/2} L4 {-h/2 + 5} V{h/2} Z" fill="#c9a66b" {W} stroke-width="2"/>'
def bars(n=4, dur=2.4):
    return ''.join(f'<rect x="{-12 + i*7}" y="{8 - i*5}" width="5" height="{6 + i*5}" rx="1" fill="{GREEN}">'
                   f'<animate attributeName="opacity" values=".15;.15;1;1" keyTimes="0;{i/n*.7:.2f};{i/n*.7 + .08:.2f};1" dur="{dur}s" repeatCount="indefinite"/></rect>' for i in range(n))
def envelope():
    return f'<rect x="-12" y="-8" width="24" height="16" rx="2" fill="{PAPER}" {W} stroke-width="2"/><path d="M-12 -8 L0 2 L12 -8" fill="none" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/>'
def slide_toy():
    return (f'<g fill="none" stroke="{INK}" stroke-width="2.5" stroke-linecap="round"><line x1="-24" y1="20" x2="-24" y2="-16"/><line x1="-14" y1="20" x2="-14" y2="-16"/>'
            + ''.join(f'<line x1="-24" y1="{y}" x2="-14" y2="{y}"/>' for y in (12, 3, -6)) + '</g>'
            f'<path d="M-14 -16 Q4 -14 10 6 Q14 18 26 18" fill="none" stroke="{RED}" stroke-width="5" stroke-linecap="round"/><rect x="-26" y="-19" width="14" height="4" rx="1" fill="{INK}"/>')
def coaster_track():
    return 'M4 46 C30 46 40 10 70 10 S110 50 140 40 S180 8 210 14 S260 50 300 44 L336 44'
