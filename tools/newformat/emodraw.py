"""Drawn stand-ins for emoji in warm-up cards (2026-11-12). Ryan: moving emoji look lazy; drawn animations instead.
DRAW[emoji] is SVG drawn around (0, 0), about 40 x 40 units (the size of a 40 px emoji). convert(html) rewrites a
finished warm-up card: every emoji inside an SVG <text> becomes the drawn object at the same place, size and animation;
every emoji in ordinary text becomes a small inline drawing. Shared by the Math 15, 10C, 20-1 and 10-3 tools."""
import re
from drawn import *

SKIN, HAIR = '#e8b48f', '#5a3a1e'
def _face(mouth='smile', eyes='dot', extra='', col='#f6c945'):
    m = {'smile': 'M-7 4 Q0 11 7 4', 'grin': 'M-8 3 Q0 13 8 3 Z', 'flat': 'M-6 6 H6', 'o': '', 'side': 'M-6 7 Q2 9 7 4'}[mouth]
    mouth_svg = (f'<circle cx="0" cy="6" r="3" fill="{INK}"/>' if mouth == 'o' else
                 f'<path d="{m}" fill="{"#fff" if mouth == "grin" else "none"}" stroke="{INK}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>')
    e = {'dot': f'<circle cx="-6" cy="-4" r="2.2" fill="{INK}"/><circle cx="6" cy="-4" r="2.2" fill="{INK}"/>',
         'happy': f'<path d="M-9 -3 Q-6 -7 -3 -3 M3 -3 Q6 -7 9 -3" fill="none" stroke="{INK}" stroke-width="2.2" stroke-linecap="round"/>',
         'up': f'<circle cx="-5" cy="-6" r="2.2" fill="{INK}"/><circle cx="7" cy="-6" r="2.2" fill="{INK}"/>'}[eyes]
    return f'<circle cx="0" cy="0" r="17" fill="{col}" {W}/>' + e + mouth_svg + extra
def _kid(col=BLUE, hair=HAIR, long_hair=False, beard=False, grey=False):
    h = '#d9d6cf' if grey else hair
    lh = f'<path d="M-9 -16 Q-13 -4 -10 2 M9 -16 Q13 -4 10 2" stroke="{h}" stroke-width="5" stroke-linecap="round" fill="none"/>' if long_hair else ''
    bd = f'<path d="M-7 -11 Q0 -3 7 -11 Q6 -5 0 -4 Q-6 -5 -7 -11 Z" fill="{h}"/>' if beard else ''
    return (f'<path d="M-12 20 V12 Q-12 2 0 2 Q12 2 12 12 V20 Z" fill="{col}" {W} stroke-width="2"/>{lh}<circle cx="0" cy="-12" r="9" fill="{SKIN}" {W} stroke-width="2"/>'
            f'<path d="M-9 -14 Q-8 -23 0 -22 Q8 -23 9 -14 Q4 -18 -9 -14 Z" fill="{h}"/>{bd}<circle cx="-3" cy="-12" r="1.2" fill="{INK}"/><circle cx="3" cy="-12" r="1.2" fill="{INK}"/>'
            f'<path d="M-3 -8 Q0 -6 3 -8" fill="none" stroke="{INK}" stroke-width="1.4" stroke-linecap="round"/>')
def _glyph(t, col=RED, fs=34):
    return f'<text x="0" y="{fs*.36:.1f}" font-size="{fs}" font-weight="900" fill="{col}" text-anchor="middle" font-family="system-ui, sans-serif">{t}</text>'
def _arrow(rot=0, col=BLUE):
    return f'<g transform="rotate({rot})"><path d="M-14 -5 H3 V-12 L15 0 L3 12 V5 H-14 Z" fill="{col}" {W} stroke-width="2"/></g>'
def _sq(col):
    return f'<rect x="-14" y="-14" width="28" height="28" rx="4" fill="{col}" {W} stroke-width="2"/>'
def _clock(h=3, m=0):
    import math
    ha, ma = (h % 12 + m / 60) * 30, m * 6
    return (f'<circle r="16" fill="{PAPER}" {W}/>' + ''.join(f'<line x1="0" y1="-13" x2="0" y2="-11" stroke="{INK}" stroke-width="2" transform="rotate({a})"/>' for a in range(0, 360, 30)) +
            f'<line x1="0" y1="0" x2="0" y2="-8" stroke="{INK}" stroke-width="3" stroke-linecap="round" transform="rotate({ha})"/><line x1="0" y1="0" x2="0" y2="-12" stroke="{INK}" stroke-width="2" stroke-linecap="round" transform="rotate({ma})"/><circle r="1.8" fill="{INK}"/>')
def _medal(col, n):
    return (f'<path d="M-9 -20 L-2 -4 M9 -20 L2 -4" stroke="{BLUE}" stroke-width="5"/><circle cx="0" cy="6" r="12" fill="{col}" {W}/>'
            f'<text x="0" y="11" font-size="14" font-weight="800" fill="{INK}" text-anchor="middle" font-family="system-ui, sans-serif">{n}</text>')
def _fish(col):
    return f'<path d="M-16 0 Q-4 -12 10 0 Q-4 12 -16 0 Z M10 0 L18 -7 V7 Z" fill="{col}" {W} stroke-width="2"/><circle cx="-8" cy="-2" r="1.6" fill="{INK}"/>'
def _bird(col, beak=AMBER):
    return (f'<ellipse cx="0" cy="3" rx="14" ry="10" fill="{col}" {W} stroke-width="2"/><circle cx="10" cy="-8" r="7" fill="{col}" {W} stroke-width="2"/>'
            f'<path d="M16 -9 L22 -7 L16 -5 Z" fill="{beak}" stroke="{INK}" stroke-width="1.4"/><circle cx="11" cy="-9" r="1.4" fill="{INK}"/><path d="M-6 1 Q0 -6 6 2" fill="none" stroke="{INK}" stroke-width="1.6"/>')
def _camel(humps=1):
    hp = 'Q-8 -22 -2 -10 Q4 -22 10 -10' if humps == 2 else 'Q0 -26 10 -10'
    return (f'<g stroke="{INK}" stroke-width="2.5" stroke-linecap="round"><line x1="-10" y1="4" x2="-11" y2="20"/><line x1="-4" y1="4" x2="-4" y2="20"/><line x1="6" y1="4" x2="6" y2="20"/><line x1="11" y1="4" x2="12" y2="20"/></g>'
            f'<path d="M-14 6 Q-16 -10 -8 -10 {hp} Q14 -10 14 0 L18 -14 Q20 -20 25 -18 L24 -14 L20 -12 L17 6 Z" fill="#d1a265" {W} stroke-width="2"/><circle cx="22" cy="-16" r="1.2" fill="{INK}"/>')
def _car_side(col):
    return at(0, 4, car(col), .95)
def _cup(col=RED):
    return f'<path d="M-9 -12 H9 L7 16 H-7 Z" fill="{col}" {W} stroke-width="2"/><rect x="-11" y="-16" width="22" height="5" rx="2" fill="{PAPER}" {W} stroke-width="2"/><line x1="3" y1="-16" x2="8" y2="-24" stroke="{INK}" stroke-width="2.5" stroke-linecap="round"/>'
def _bottle(col=BLUE):
    return f'<rect x="-4" y="-21" width="8" height="6" rx="1" fill="{INK}"/><path d="M-4 -15 Q-11 -10 -11 -2 V17 Q-11 20 -8 20 H8 Q11 20 11 17 V-2 Q11 -10 4 -15 Z" fill="{col}" fill-opacity=".55" {W} stroke-width="2"/>'
def _tree():
    return f'<rect x="-3" y="4" width="6" height="16" fill="{BROWN}" {W} stroke-width="2"/><circle cx="0" cy="-6" r="14" fill="{LEAF}" {W} stroke-width="2"/><circle cx="-6" cy="-9" r="3" fill="#7db354"/>'
def _sun():
    return ''.join(f'<line x1="0" y1="-14" x2="0" y2="-20" stroke="{AMBER}" stroke-width="3" stroke-linecap="round" transform="rotate({a})"/>' for a in range(0, 360, 45)) + f'<circle r="10" fill="{AMBER}"/>'
def _box(col='#d8b98a'):
    return (f'<polygon points="-16,-6 4,-6 4,16 -16,16" fill="{col}" {W} stroke-width="2"/><polygon points="4,-6 16,-14 16,8 4,16" fill="#c4a06e" {W} stroke-width="2"/>'
            f'<polygon points="-16,-6 -4,-14 16,-14 4,-6" fill="#e6cfa6" {W} stroke-width="2"/><line x1="-6" y1="-6" x2="-6" y2="16" stroke="#b48c55" stroke-width="2"/>')
def _book(col=RED):
    return f'<rect x="-14" y="-17" width="26" height="34" rx="2" fill="{col}" {W}/><rect x="-10" y="-12" width="17" height="6" rx="1" fill="{PAPER}"/><line x1="12" y1="-15" x2="12" y2="15" stroke="{PAPER}" stroke-width="2"/>'
def _ball(col, seam='#fff'):
    return f'<circle r="15" fill="{col}" {W}/><path d="M-10 -11 Q-3 0 -10 11 M10 -11 Q3 0 10 11" fill="none" stroke="{seam}" stroke-width="2"/>'
def _cake(slice_=False):
    if slice_:
        return f'<path d="M-16 14 L16 14 L16 -2 L-16 6 Z" fill="#f3d9a4" {W}/><path d="M-16 6 L16 -2 L16 -8 L-16 0 Z" fill="{PINK}" {W} stroke-width="2"/><circle cx="8" cy="-10" r="3.5" fill="{RED}"/>'
    return (f'<rect x="-16" y="0" width="32" height="16" rx="2" fill="#f3d9a4" {W}/><path d="M-16 4 Q-12 8 -8 4 Q-4 8 0 4 Q4 8 8 4 Q12 8 16 4 V0 H-16 Z" fill="{PINK}"/>'
            f'<rect x="-2" y="-12" width="4" height="12" fill="{SKY}" stroke="{INK}" stroke-width="1.5"/><path d="M0 -20 Q4 -15 0 -12 Q-4 -15 0 -20 Z" fill="{AMBER}"/>')

DRAW = {
    # marks and symbols
    '❓': _glyph('?'), '❔': _glyph('?', GREY), '❗': _glyph('!'), '✅': f'<rect x="-15" y="-15" width="30" height="30" rx="6" fill="{GREEN}"/><path d="M-8 0 L-2 7 L9 -7" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>',
    '✨': sparkle(AMBER, 1.6) + at(11, -11, sparkle(AMBER, .7)) + at(-11, 12, sparkle(AMBER, .5)), '⭐': f'<path d="M0 -17 L5 -6 L17 -5 L8 3 L11 15 L0 9 L-11 15 L-8 3 L-17 -5 L-5 -6 Z" fill="{AMBER}" {W} stroke-width="2"/>',
    '➡️': _arrow(0), '⬇️': _arrow(90), '⬇': _arrow(90), '⬆': _arrow(-90), '↗': _arrow(-45), '🔟': f'<rect x="-16" y="-16" width="32" height="32" rx="6" fill="{BLUE}"/>' + _glyph('10', '#fff', 18),
    '🔢': f'<rect x="-18" y="-14" width="36" height="28" rx="5" fill="{BLUE}"/>' + _glyph('123', '#fff', 14), '🔺': f'<path d="M0 -15 L15 12 H-15 Z" fill="{RED}" {W} stroke-width="2"/>',
    '🟥': _sq(RED), '🟦': _sq(BLUE), '🟨': _sq(AMBER), '⚠️': f'<path d="M0 -17 L18 15 H-18 Z" fill="{AMBER}" {W}/>' + at(0, 4, _glyph('!', INK, 20)),
    '🌀': f'<path d="M0 0 Q6 -2 4 -7 Q0 -12 -6 -7 Q-12 0 -6 8 Q2 15 11 8 Q18 0 13 -10" fill="none" stroke="{BLUE}" stroke-width="4" stroke-linecap="round"/>',
    '💭': thought(False), '🗣️': f'<path d="M-16 18 V8 Q-20 -2 -13 -11 Q-5 -18 4 -15 Q11 -11 11 -2 L15 3 L11 5 V9 Q11 13 6 13 H2 V18" fill="{BLUE}" stroke="{INK}" stroke-width="2"/><path d="M16 -6 Q20 0 16 6 M20 -10 Q26 0 20 10" fill="none" stroke="{INK}" stroke-width="2" stroke-linecap="round"/>',
    # faces
    '🙂': _face('smile'), '😀': _face('grin'), '😄': _face('grin', 'happy'), '😊': _face('smile', 'happy', f'<circle cx="-10" cy="3" r="3" fill="{PINK}"/><circle cx="10" cy="3" r="3" fill="{PINK}"/>'),
    '😋': _face('smile', 'happy', f'<path d="M1 6 Q4 13 7 7" fill="{PINK}" stroke="{INK}" stroke-width="1.5"/>'),
    '😎': _face('smile', 'dot', f'<path d="M-15 -7 H15 M-13 -7 Q-13 1 -6 1 Q-2 1 -1 -6 M13 -7 Q13 1 6 1 Q2 1 1 -6" fill="{INK}" stroke="{INK}" stroke-width="2"/>'),
    '😇': _face('smile', 'happy', f'<ellipse cx="0" cy="-21" rx="11" ry="3.5" fill="none" stroke="{AMBER}" stroke-width="3"/>'),
    '🤥': _face('flat', 'dot', f'<path d="M0 0 L20 1 L0 4 Z" fill="#f6c945" stroke="{INK}" stroke-width="1.8" stroke-linejoin="round"/>'),
    '🤔': _face('side', 'up', f'<path d="M-4 22 Q-6 14 0 12 L6 11 Q9 12 6 14 L2 15" fill="#f6c945" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/>'),
    '🧐': _face('flat', 'dot', f'<circle cx="6" cy="-4" r="6" fill="none" stroke="{INK}" stroke-width="2"/><path d="M12 -2 Q15 8 12 14" fill="none" stroke="{INK}" stroke-width="1.2"/>'),
    '🤫': _face('o', 'dot'),
    # people
    '🧍': _kid(BLUE), '🧑': _kid(GREEN), '🧒': _kid(AMBER), '👦': _kid(BLUE), '👧': _kid(RED, long_hair=True), '👩': _kid(GREEN, long_hair=True), '🧔': _kid(BROWN, beard=True),
    '🧓': _kid(GREY, grey=True), '🧑‍🏫': _kid(GREEN) + f'<line x1="12" y1="6" x2="22" y2="-10" stroke="{BROWN}" stroke-width="2.5" stroke-linecap="round"/>',
    '🙋': _kid(AMBER) + f'<path d="M10 6 L18 -8 L18 -18" fill="none" stroke="{AMBER}" stroke-width="5" stroke-linecap="round"/><circle cx="18" cy="-19" r="3.5" fill="{SKIN}"/>',
    '🚶': walker(BLUE), '🚶‍♀️': walker(RED), '🏃': runner(BLUE), '🏃‍♀️': runner(RED),
    '🕵️': _kid('#7a6a4f') + f'<path d="M-13 -16 H13 M-9 -16 Q-9 -26 0 -26 Q9 -26 9 -16" fill="#7a6a4f" stroke="{INK}" stroke-width="2"/>' + at(13, 6, magnifier(), .55),
    '🏋️': f'<line x1="-20" y1="-14" x2="20" y2="-14" stroke="{INK}" stroke-width="3"/><rect x="-22" y="-20" width="5" height="12" rx="1" fill="{INK}"/><rect x="17" y="-20" width="5" height="12" rx="1" fill="{INK}"/>' + at(0, 4, _kid(RED), .8) + f'<path d="M-8 2 L-12 -14 M8 2 L12 -14" stroke="{SKIN}" stroke-width="4" stroke-linecap="round"/>',
    '🧞': f'<path d="M-8 20 Q0 10 -4 0 Q8 6 8 20 Z" fill="{SKY}" opacity=".7"/>' + at(0, -4, _kid(BLUE), .8),
    '💇': _kid(PINK, long_hair=True) + f'<path d="M14 -18 L22 -10 M14 -10 L22 -18" stroke="{GREY}" stroke-width="2.5" stroke-linecap="round"/><circle cx="13" cy="-19" r="2" fill="none" stroke="{GREY}" stroke-width="1.5"/>',
    # animals
    '🐪': _camel(1), '🐫': _camel(2), '🐈': (f'<path d="M12 10 Q22 6 20 -6" fill="none" stroke="{INK}" stroke-width="3" stroke-linecap="round"/><ellipse cx="0" cy="8" rx="13" ry="10" fill="{AMBER}" {W} stroke-width="2"/>'
                                         f'<circle cx="-8" cy="-8" r="9" fill="{AMBER}" {W} stroke-width="2"/><path d="M-15 -13 L-15 -21 L-10 -15 M-1 -13 L-1 -21 L-6 -15" fill="{AMBER}" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/>'
                                         f'<circle cx="-11" cy="-9" r="1.3" fill="{INK}"/><circle cx="-5" cy="-9" r="1.3" fill="{INK}"/>'),
    '🦆': _bird('#f2cf3a', '#e07b1b'), '🐦': _bird(SKY), '🕊️': _bird('#fff', GREY), '🦉': (f'<ellipse cx="0" cy="3" rx="14" ry="16" fill="{BROWN}" {W} stroke-width="2"/><circle cx="-6" cy="-4" r="6" fill="#fff" stroke="{INK}" stroke-width="1.5"/><circle cx="6" cy="-4" r="6" fill="#fff" stroke="{INK}" stroke-width="1.5"/>'
                                                                                    f'<circle cx="-6" cy="-4" r="2.5" fill="{INK}"/><circle cx="6" cy="-4" r="2.5" fill="{INK}"/><path d="M-2 2 L0 6 L2 2 Z" fill="{AMBER}"/><path d="M-12 -12 L-9 -20 L-5 -12 M12 -12 L9 -20 L5 -12" fill="{BROWN}" stroke="{INK}" stroke-width="1.5"/>'),
    '🐢': at(0, 2, tortoise(), .9), '🐸': frog(), '🐷': (f'<circle r="15" fill="{PINK}" {W}/><path d="M-12 -10 L-14 -19 L-5 -14 M12 -10 L14 -19 L5 -14" fill="{PINK}" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/>'
                                                       f'<ellipse cx="0" cy="4" rx="7" ry="5" fill="#f08aa0" stroke="{INK}" stroke-width="1.5"/><circle cx="-2.5" cy="4" r="1.3" fill="{INK}"/><circle cx="2.5" cy="4" r="1.3" fill="{INK}"/><circle cx="-6" cy="-5" r="1.6" fill="{INK}"/><circle cx="6" cy="-5" r="1.6" fill="{INK}"/>'),
    '🐌': f'<path d="M-18 12 H14 Q20 12 20 6 L18 -6 L16 6" fill="#b7a07a" {W} stroke-width="2"/><circle cx="-3" cy="0" r="11" fill="{AMBER}" {W}/><path d="M-3 0 Q2 -2 0 -5 Q-4 -7 -7 -2 Q-8 4 -2 6 Q6 6 6 -2" fill="none" stroke="{BROWN}" stroke-width="2"/>',
    '🐾': ''.join(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{BROWN}"/>' for x, y, rx, ry in ((0, 6, 9, 7), (-9, -5, 3.5, 4.5), (-3, -10, 3.5, 4.5), (4, -10, 3.5, 4.5), (10, -5, 3.5, 4.5))),
    '🐟': _fish(SKY), '🐠': _fish(AMBER), '🐇': at(0, 0, hare(), .95), '🐜': f'<g stroke="{INK}" stroke-width="1.8" stroke-linecap="round">' + ''.join(f'<line x1="{x}" y1="0" x2="{x + d}" y2="10"/><line x1="{x}" y1="0" x2="{x + d}" y2="-10"/>' for x, d in ((-4, -5), (1, 0), (6, 5))) + f'</g><ellipse cx="-11" cy="0" rx="6" ry="5" fill="{INK}"/><ellipse cx="1" cy="0" rx="5" ry="4" fill="{INK}"/><circle cx="12" cy="-1" r="4.5" fill="{INK}"/>',
    '🐁': at(0, 0, f'<path d="M14 4 Q24 6 22 14" fill="none" stroke="{PINK}" stroke-width="2"/><ellipse cx="2" cy="4" rx="14" ry="9" fill="{GREY}" {W} stroke-width="2"/><circle cx="-9" cy="-4" r="5" fill="{GREY}" {W} stroke-width="2"/><circle cx="-13" cy="3" r="1.5" fill="{INK}"/>'),
    '🐭': f'<circle cx="-11" cy="-10" r="7" fill="{GREY}" {W} stroke-width="2"/><circle cx="11" cy="-10" r="7" fill="{GREY}" {W} stroke-width="2"/><circle r="13" cy="3" fill="{GREY}" {W}/><circle cx="-4" cy="0" r="1.6" fill="{INK}"/><circle cx="4" cy="0" r="1.6" fill="{INK}"/><circle cx="0" cy="6" r="2.2" fill="{PINK}"/>',
    '🪰': f'<ellipse cx="-6" cy="-7" rx="8" ry="5" fill="{SKY}" fill-opacity=".6" stroke="{INK}" stroke-width="1.5" transform="rotate(-25 -6 -7)"/><ellipse cx="6" cy="-7" rx="8" ry="5" fill="{SKY}" fill-opacity=".6" stroke="{INK}" stroke-width="1.5" transform="rotate(25 6 -7)"/><ellipse cx="0" cy="3" rx="6" ry="9" fill="{INK}"/><circle cx="0" cy="-7" r="4" fill="{INK}"/>',
    '🦠': f'<circle r="12" fill="{GREEN}" fill-opacity=".75" {W} stroke-width="2"/>' + ''.join(f'<line x1="0" y1="-12" x2="0" y2="-17" stroke="{INK}" stroke-width="2" stroke-linecap="round" transform="rotate({a})"/>' for a in range(0, 360, 45)) + f'<circle cx="-4" cy="-3" r="3" fill="#0b5a3f"/><circle cx="4" cy="4" r="2" fill="#0b5a3f"/>',
    # food
    '🍕': f'<path d="M0 18 L-16 -12 Q0 -20 16 -12 Z" fill="#f2cf3a" {W}/><path d="M-16 -12 Q0 -20 16 -12 L14 -8 Q0 -15 -14 -8 Z" fill="#d18b3b"/><circle cx="-4" cy="-4" r="3" fill="{RED}"/><circle cx="5" cy="2" r="3" fill="{RED}"/><circle cx="0" cy="9" r="2.4" fill="{RED}"/>',
    '🍔': f'<path d="M-17 -2 Q-17 -17 0 -17 Q17 -17 17 -2 Z" fill="#d9a35b" {W}/><rect x="-18" y="-2" width="36" height="5" rx="2" fill="{LEAF}"/><rect x="-17" y="3" width="34" height="6" rx="3" fill="#6b3e1f"/><path d="M-17 9 H17 Q17 16 10 16 H-10 Q-17 16 -17 9 Z" fill="#d9a35b" {W}/>',
    '🌮': f'<path d="M-18 10 Q-18 -14 0 -14 Q18 -14 18 10 Z" fill="#f2cf3a" {W}/><path d="M-13 6 Q-13 -6 0 -8 Q13 -6 13 6" fill="none" stroke="{LEAF}" stroke-width="4"/><circle cx="-5" cy="0" r="2.5" fill="{RED}"/><circle cx="5" cy="-2" r="2.5" fill="{RED}"/>',
    '🍟': f'<g fill="#f2cf3a" stroke="{INK}" stroke-width="1.5">' + ''.join(f'<rect x="{x}" y="{y}" width="4" height="18" rx="1"/>' for x, y in ((-10, -18), (-5, -21), (0, -19), (5, -22), (9, -17))) + f'</g><path d="M-13 -4 H13 L10 18 H-10 Z" fill="{RED}" {W}/>',
    '🥤': _cup(RED), '🍎': apple(), '🍌': banana(), '🥥': coconut(), '🍐': f'<path d="M0 -10 Q-6 -10 -6 -3 Q-14 3 -12 11 Q-8 18 0 18 Q8 18 12 11 Q14 3 6 -3 Q6 -10 0 -10 Z" fill="#b5c94a" {W}/><path d="M0 -10 L2 -16" stroke="{BROWN}" stroke-width="2.5" stroke-linecap="round"/>',
    '🍫': f'<rect x="-12" y="-18" width="24" height="36" rx="3" fill="#6b3e1f" {W}/>' + ''.join(f'<rect x="{-9 + c*10}" y="{-15 + r*10}" width="8" height="8" rx="1.5" fill="#83502a"/>' for r in range(3) for c in range(2)) + f'<path d="M-12 8 H12 V18 H-12 Z" fill="{RED}" {W} stroke-width="2"/>',
    '🧀': f'<path d="M-18 12 V-2 L14 -14 L18 -2 V12 Z" fill="#f2cf3a" {W}/><path d="M-18 -2 L14 -14 L18 -2 Z" fill="#f7dd6a" stroke="{INK}" stroke-width="2"/><circle cx="-6" cy="5" r="3" fill="#d9ac16"/><circle cx="7" cy="3" r="2.2" fill="#d9ac16"/>',
    '🍩': f'<circle r="16" fill="#d9a35b" {W}/><path d="M-14 -3 Q-12 -15 0 -15 Q12 -15 14 -3 Q10 3 0 1 Q-10 3 -14 -3 Z" fill="{PINK}"/><circle r="5" fill="{PAPER}" {W} stroke-width="2"/>',
    '🍰': _cake(True), '🎂': _cake(False), '🥨': f'<path d="M-12 12 Q-20 0 -10 -10 Q0 -16 4 -6 Q8 6 -4 6 Q-16 6 -12 -6 M12 12 Q20 0 10 -10 Q0 -16 -4 -6" fill="none" stroke="#a8692b" stroke-width="5" stroke-linecap="round"/>',
    '🥜': f'<path d="M-6 -16 Q6 -18 6 -8 Q6 -2 3 0 Q8 4 7 12 Q4 20 -4 18 Q-12 16 -9 6 Q-6 0 -9 -6 Q-12 -14 -6 -16 Z" fill="#d9a35b" {W}/>',
    '🍇': ''.join(f'<circle cx="{x}" cy="{y}" r="5.5" fill="#7a4fb0" stroke="{INK}" stroke-width="1.5"/>' for x, y in ((-8, -6), (0, -6), (8, -6), (-4, 2), (4, 2), (0, 10))) + f'<path d="M0 -12 Q2 -18 6 -19" fill="none" stroke="{LEAF}" stroke-width="2.5"/>',
    '🥖': f'<path d="M-18 10 Q-20 2 -10 -4 L8 -14 Q18 -18 19 -10 Q20 -4 10 2 L-8 12 Q-16 16 -18 10 Z" fill="#d9a35b" {W}/><path d="M-8 2 L-4 6 M0 -3 L4 1 M8 -8 L12 -4" stroke="#a8692b" stroke-width="2" stroke-linecap="round"/>',
    '🍪': cookie(16), '🍬': f'<path d="M-18 -7 L-10 0 L-18 7 Z M18 -7 L10 0 L18 7 Z" fill="{PINK}" {W} stroke-width="1.8"/><ellipse cx="0" cy="0" rx="11" ry="8" fill="{RED}" {W} stroke-width="2"/>',
    '🍿': popcorn(), '🍚': f'<path d="M-17 -2 H17 Q17 16 0 16 Q-17 16 -17 -2 Z" fill="{BLUE}" {W}/><path d="M-15 -2 Q-12 -12 0 -12 Q12 -12 15 -2 Z" fill="#fff" stroke="{INK}" stroke-width="2"/>',
    '🥣': f'<path d="M-17 -4 H17 Q17 14 0 14 Q-17 14 -17 -4 Z" fill="{AMBER}" {W}/><path d="M-15 -4 Q-8 -10 0 -6 Q8 -10 15 -4" fill="#f3d9a4" stroke="{INK}" stroke-width="2"/><line x1="6" y1="-8" x2="16" y2="-20" stroke="{GREY}" stroke-width="3" stroke-linecap="round"/>',
    '🥫': f'<rect x="-12" y="-16" width="24" height="32" rx="3" fill="{GREY}" {W}/><rect x="-12" y="-8" width="24" height="16" fill="{RED}"/><ellipse cx="0" cy="-16" rx="12" ry="3" fill="#ddd" stroke="{INK}" stroke-width="2"/>',
    '🍴': f'<g stroke="{GREY}" stroke-width="3" stroke-linecap="round"><line x1="-6" y1="-16" x2="-6" y2="18"/><line x1="-10" y1="-16" x2="-10" y2="-6"/><line x1="-2" y1="-16" x2="-2" y2="-6"/><path d="M-10 -6 Q-6 -2 -2 -6"/></g><path d="M8 18 V-2 Q4 -6 4 -12 Q4 -18 8 -18 Q12 -18 12 -12 Q12 -6 8 -2" fill="{GREY}" stroke="{INK}" stroke-width="1.5"/>',
    # vehicles
    '🚗': _car_side(RED), '🚙': _car_side(BLUE), '🛻': at(0, 4, truck(GREEN), .9), '🚚': at(0, 4, truck(AMBER), .9), '🏎️': _car_side(RED), '🚕': at(0, 4, taxi(), .95),
    '🏍️': f'<circle cx="-12" cy="9" r="7" fill="none" stroke="{INK}" stroke-width="3.5"/><circle cx="13" cy="9" r="7" fill="none" stroke="{INK}" stroke-width="3.5"/><path d="M-12 9 L-2 -3 H8 L13 9 M8 -3 L5 -12 H11" fill="none" stroke="{RED}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><path d="M-6 -3 H6 L4 -8 H-4 Z" fill="{INK}"/>',
    '🚂': f'<rect x="-18" y="-6" width="30" height="16" rx="2" fill="{RED}" {W} stroke-width="2"/><rect x="2" y="-18" width="12" height="12" fill="{RED}" {W} stroke-width="2"/><rect x="-14" y="-14" width="5" height="8" fill="{INK}"/><path d="M12 10 L20 10 L16 2 Z" fill="{INK}"/>' + wheel(-11, 12, 5) + wheel(3, 12, 5),
    '⛴️': f'<path d="M-20 4 H20 L14 16 H-14 Z" fill="{RED}" {W} stroke-width="2"/><rect x="-12" y="-6" width="22" height="10" fill="{PAPER}" {W} stroke-width="2"/><rect x="-6" y="-14" width="10" height="8" fill="{PAPER}" {W} stroke-width="2"/>' + ''.join(f'<rect x="{x}" y="-3" width="4" height="4" fill="{SKY}"/>' for x in (-9, -3, 3)),
    '⛵': f'<path d="M-18 8 H18 L12 16 H-12 Z" fill="{BROWN}" {W} stroke-width="2"/><line x1="0" y1="8" x2="0" y2="-20" stroke="{INK}" stroke-width="2.5"/><path d="M2 -18 L16 4 H2 Z" fill="#fff" {W} stroke-width="2"/><path d="M-2 -12 L-14 4 H-2 Z" fill="{RED}" {W} stroke-width="2"/>',
    '🛹': f'<rect x="-20" y="-3" width="40" height="6" rx="3" fill="{BLUE}" {W} stroke-width="2"/>' + wheel(-12, 7, 4) + wheel(12, 7, 4),
    '🚀': at(0, 0, rocket(), .75, -45), '🎢': f'<path d="M-20 14 Q-10 -20 0 -6 Q8 8 20 -12" fill="none" stroke="{INK}" stroke-width="3"/><rect x="-6" y="-14" width="12" height="7" rx="2" fill="{RED}" stroke="{INK}" stroke-width="1.5" transform="rotate(-30)"/>',
    # things
    '💎': f'<path d="M-16 -6 L-9 -15 H9 L16 -6 L0 17 Z" fill="{SKY}" {W}/><path d="M-16 -6 H16 M-9 -15 L-4 -6 L0 17 M9 -15 L4 -6 L0 17 M-4 -6 L0 -15 L4 -6" fill="none" stroke="{INK}" stroke-width="1.5"/>',
    '🪙': f'<circle r="15" fill="{AMBER}" {W}/><circle r="10" fill="none" stroke="#b07d0c" stroke-width="2"/><text x="0" y="5" font-size="13" font-weight="800" fill="#8a5f05" text-anchor="middle" font-family="system-ui, sans-serif">$</text>',
    '💵': f'<rect x="-20" y="-11" width="40" height="22" rx="2" fill="#9ccf8f" {W}/><circle r="6" fill="none" stroke="{GREEN}" stroke-width="2"/><text x="0" y="4" font-size="9" font-weight="800" fill="{GREEN}" text-anchor="middle">$</text>',
    '💸': f'<rect x="-20" y="-11" width="40" height="22" rx="2" fill="#9ccf8f" {W} transform="rotate(-10)"/><path d="M-22 -8 Q-28 -16 -20 -18 M22 -8 Q28 -16 20 -18" fill="#fff" stroke="{INK}" stroke-width="2"/>',
    '💰': f'<path d="M-6 -14 L-10 -20 H10 L6 -14 Q18 -4 16 8 Q14 18 0 18 Q-14 18 -16 8 Q-18 -4 -6 -14 Z" fill="#d9b36b" {W}/><text x="0" y="10" font-size="16" font-weight="800" fill="{GREEN}" text-anchor="middle">$</text>',
    '💳': f'<rect x="-19" y="-12" width="38" height="24" rx="3" fill="{BLUE}" {W}/><rect x="-19" y="-6" width="38" height="5" fill="{INK}"/><rect x="-14" y="4" width="8" height="5" rx="1" fill="{AMBER}"/>',
    '⚙️': gear(15, 8), '☀️': _sun(), '☀': _sun(), '🌙': f'<path d="M4 -16 A16 16 0 1 0 14 10 A12 12 0 1 1 4 -16 Z" fill="#f2d66b" {W} stroke-width="2"/>',
    '☁️': f'<path d="M-14 10 Q-22 10 -20 2 Q-20 -6 -11 -5 Q-8 -14 2 -13 Q10 -12 11 -5 Q20 -6 20 3 Q20 10 12 10 Z" fill="#fff" {W}/>',
    '🧊': f'<polygon points="-12,-4 6,-4 6,14 -12,14" fill="#cfe8f7" {W} stroke-width="2"/><polygon points="6,-4 14,-12 14,6 6,14" fill="#a9d3ef" {W} stroke-width="2"/><polygon points="-12,-4 -4,-12 14,-12 6,-4" fill="#e5f3fb" {W} stroke-width="2"/>',
    '🤝': f'<path d="M-20 -4 L-8 -10 L0 -6 L8 -10 L20 -4 L20 6 L10 10 L0 12 L-10 10 L-20 6 Z" fill="{SKIN}" {W}/><path d="M-6 -2 L4 4 M-2 -6 L8 0 M-10 2 L0 8" fill="none" stroke="{INK}" stroke-width="1.6" stroke-linecap="round"/>',
    '🔍': magnifier(), '🎈': balloon(RED), '📱': phone(), '✏️': pencil(), '🌱': f'<path d="M0 18 V-2" stroke="{LEAF}" stroke-width="3"/><path d="M0 0 Q-16 -2 -14 -14 Q-2 -14 0 0 Z M0 -4 Q14 -6 13 -17 Q2 -17 0 -4 Z" fill="{LEAF}" {W} stroke-width="1.6"/><rect x="-10" y="14" width="20" height="5" rx="2" fill="{BROWN}"/>',
    '🎲': f'<rect x="-15" y="-15" width="30" height="30" rx="6" fill="#fff" {W}/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="2.8" fill="{INK}"/>' for x, y in ((-7, -7), (7, -7), (0, 0), (-7, 7), (7, 7))),
    '💡': f'<path d="M-6 8 Q-14 0 -12 -8 Q-9 -18 0 -18 Q9 -18 12 -8 Q14 0 6 8 Z" fill="#fff2a8" {W}/><rect x="-6" y="8" width="12" height="9" rx="2" fill="{GREY}" {W} stroke-width="2"/><path d="M-3 4 L-3 -4 L3 -4 L3 4" fill="none" stroke="{AMBER}" stroke-width="1.8"/>',
    '🎩': f'<rect x="-11" y="-18" width="22" height="26" rx="2" fill="{INK}"/><rect x="-11" y="2" width="22" height="5" fill="{RED}"/><rect x="-19" y="7" width="38" height="5" rx="2.5" fill="{INK}"/>',
    '🎁': f'<rect x="-15" y="-6" width="30" height="22" fill="{RED}" {W}/><rect x="-17" y="-12" width="34" height="8" fill="{RED}" {W}/><rect x="-3" y="-12" width="6" height="28" fill="{AMBER}"/><path d="M0 -12 Q-12 -22 -8 -12 M0 -12 Q12 -22 8 -12" fill="none" stroke="{AMBER}" stroke-width="3"/>',
    '🪑': f'<path d="M-10 -18 V4 H10" fill="none" stroke="{BROWN}" stroke-width="4" stroke-linejoin="round"/><rect x="-12" y="0" width="24" height="5" rx="1" fill="#c99a5b" stroke="{INK}" stroke-width="1.5"/><path d="M-10 5 V18 M10 5 V18" stroke="{BROWN}" stroke-width="3.5" stroke-linecap="round"/>',
    '🏁': flag(), '🚩': f'<line x1="-8" y1="-20" x2="-8" y2="20" stroke="{INK}" stroke-width="3" stroke-linecap="round"/><path d="M-8 -18 L14 -11 L-8 -4 Z" fill="{RED}" stroke="{INK}" stroke-width="2" stroke-linejoin="round"/>',
    '📍': pin(), '⚖️': at(0, 2, scale_beam('', '', 6), .6), '📐': f'<path d="M-16 16 V-16 L16 16 Z M-10 10 V0 L0 10 Z" fill="#9cd1c0" fill-rule="evenodd" {W} stroke-width="2"/>',
    '📏': f'<rect x="-20" y="-6" width="40" height="12" rx="1.5" fill="#f2cf3a" {W} stroke-width="2" transform="rotate(-20)"/>' + ''.join(f'<line x1="{x}" y1="-6" x2="{x}" y2="{-1 if i % 2 else 1}" stroke="{INK}" stroke-width="1.4" transform="rotate(-20)"/>' for i, x in enumerate(range(-16, 18, 4))),
    '📦': _box(), '🔮': crystal_ball(), '🧠': f'<path d="M-2 -16 Q-12 -18 -15 -9 Q-21 -3 -16 5 Q-17 14 -7 14 Q-2 18 0 12 Q2 18 8 14 Q17 14 16 5 Q21 -3 15 -9 Q12 -18 2 -16 Q0 -18 -2 -16 Z" fill="{PINK}" {W}/><path d="M0 -15 V12 M-10 -6 Q-5 -2 -9 4 M10 -6 Q5 -2 9 4" fill="none" stroke="#c9707f" stroke-width="2"/>',
    '⚡': f'<path d="M4 -19 L-11 3 H0 L-4 19 L11 -3 H0 Z" fill="{AMBER}" {W} stroke-width="2"/>', '🖌️': f'<path d="M14 -16 L-2 4" stroke="{BROWN}" stroke-width="5" stroke-linecap="round"/><path d="M-2 4 L-6 8 Q-10 12 -16 16 Q-14 8 -8 2 Z" fill="{BLUE}" {W} stroke-width="2"/>',
    '🪣': f'<path d="M-14 -8 H14 L11 16 H-11 Z" fill="{SKY}" {W}/><path d="M-14 -8 Q0 -26 14 -8" fill="none" stroke="{INK}" stroke-width="2.5"/>',
    '🫧': ''.join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{SKY}" fill-opacity=".25" stroke="{BLUE}" stroke-width="2"/>' for x, y, r in ((-6, 4, 11), (10, -8, 7), (11, 11, 4))),
    '🔦': f'<path d="M-18 -5 H4 V5 H-18 Z" fill="{GREY}" {W} stroke-width="2"/><path d="M4 -8 L12 -11 V11 L4 8 Z" fill="{INK}"/><path d="M12 -11 L20 -16 V16 L12 11 Z" fill="#fff2a8" opacity=".8"/>',
    '⏱️': stopwatch(), '🛎️': f'<path d="M-16 10 Q-16 -10 0 -10 Q16 -10 16 10 Z" fill="{AMBER}" {W}/><rect x="-19" y="10" width="38" height="5" rx="2" fill="{INK}"/><circle cx="0" cy="-13" r="3" fill="{INK}"/>',
    '🧳': f'<rect x="-16" y="-8" width="32" height="24" rx="4" fill="{BROWN}" {W}/><path d="M-6 -8 V-14 H6 V-8" fill="none" stroke="{INK}" stroke-width="2.5"/><line x1="-8" y1="-8" x2="-8" y2="16" stroke="#6b4420" stroke-width="2"/><line x1="8" y1="-8" x2="8" y2="16" stroke="#6b4420" stroke-width="2"/>',
    '🔑': key(), '📄': f'<path d="M-12 -17 H6 L13 -10 V17 H-12 Z" fill="#fff" {W} stroke-width="2"/><path d="M6 -17 V-10 H13" fill="none" stroke="{INK}" stroke-width="2"/>' + ''.join(f'<line x1="-7" y1="{y}" x2="8" y2="{y}" stroke="{GREY}" stroke-width="2"/>' for y in (-4, 2, 8)),
    '🎮': f'<path d="M-12 -8 H12 Q20 -8 20 4 Q20 14 14 14 Q10 14 8 8 H-8 Q-10 14 -14 14 Q-20 14 -20 4 Q-20 -8 -12 -8 Z" fill="{GREY}" {W}/><path d="M-13 0 H-5 M-9 -4 V4" stroke="{INK}" stroke-width="2.5"/><circle cx="8" cy="-1" r="2" fill="{RED}"/><circle cx="12" cy="3" r="2" fill="{BLUE}"/>',
    '⚾': _ball('#fff', RED), '🌵': f'<path d="M-4 18 V-14 Q0 -20 4 -14 V18 Z M4 4 H10 V-6 Q12 -10 14 -6 V8 H4 M-4 0 H-10 V-8 Q-12 -12 -14 -8 V4 H-4" fill="{LEAF}" {W} stroke-width="2"/>',
    '👟': f'<path d="M-18 4 V-6 Q-12 -4 -6 -10 L4 -2 Q16 0 18 6 V10 H-18 Z" fill="{RED}" {W}/><rect x="-18" y="8" width="36" height="5" rx="2" fill="#fff" {W} stroke-width="2"/>',
    '♞': f'<path d="M-10 16 H12 V12 H8 Q8 0 12 -6 Q12 -16 0 -18 L-4 -14 Q-12 -10 -12 -2 L-6 0 L0 -4 Q-2 4 -8 12 H-10 Z" fill="{INK}"/>',
    '♟️': f'<circle cy="-10" r="6" fill="{INK}"/><path d="M-5 -4 H5 L7 10 H-7 Z M-11 10 H11 V16 H-11 Z" fill="{INK}"/>', '♟': f'<circle cy="-10" r="6" fill="{INK}"/><path d="M-5 -4 H5 L7 10 H-7 Z M-11 10 H11 V16 H-11 Z" fill="{INK}"/>',
    '🖼️': f'<rect x="-18" y="-14" width="36" height="28" fill="{BROWN}" {W}/><rect x="-12" y="-8" width="24" height="16" fill="{SKY}"/><path d="M-12 8 L-4 -1 L2 5 L6 1 L12 8 Z" fill="{LEAF}"/>',
    '🌻': f'<line x1="0" y1="2" x2="0" y2="20" stroke="{LEAF}" stroke-width="3"/>' + ''.join(f'<ellipse cx="0" cy="-15" rx="4" ry="7" fill="{AMBER}" transform="rotate({a} 0 -5)"/>' for a in range(0, 360, 40)) + f'<circle cy="-5" r="6" fill="{BROWN}"/>',
    '🌳': _tree(), '🏠': house(), '📞': f'<path d="M-14 -10 Q-16 -16 -10 -18 L-6 -18 L-2 -9 L-7 -6 Q-4 2 4 6 L7 1 L16 5 L16 9 Q14 15 8 14 Q-10 8 -14 -10 Z" fill="{RED}" {W} stroke-width="2"/>',
    '🔌': f'<rect x="-10" y="-8" width="20" height="16" rx="3" fill="{GREY}" {W} stroke-width="2"/><path d="M-5 -8 V-17 M5 -8 V-17" stroke="{INK}" stroke-width="3" stroke-linecap="round"/><path d="M0 8 Q0 18 12 18" fill="none" stroke="{INK}" stroke-width="3"/>',
    '🚪': f'<rect x="-12" y="-19" width="24" height="38" rx="1" fill="{BROWN}" {W}/><rect x="-8" y="-15" width="16" height="12" fill="#c49a62"/><rect x="-8" y="0" width="16" height="15" fill="#c49a62"/><circle cx="7" cy="2" r="1.8" fill="{AMBER}"/>',
    '💧': f'<path d="M0 -18 Q14 0 12 8 Q9 18 0 18 Q-9 18 -12 8 Q-14 0 0 -18 Z" fill="{SKY}" {W}/>', '🧴': _bottle(BLUE),
    '⛺': f'<path d="M-20 16 L0 -18 L20 16 Z" fill="#d9a35b" {W}/><path d="M0 -18 L-6 16 H6 Z" fill="#8a5a2b"/><path d="M-3 -24 L0 -18 L3 -24" stroke="{INK}" stroke-width="2" fill="none"/>',
    '📋': f'<rect x="-14" y="-16" width="28" height="34" rx="2" fill="#c49a62" {W}/><rect x="-10" y="-10" width="20" height="24" fill="#fff"/><rect x="-6" y="-19" width="12" height="6" rx="1.5" fill="{GREY}" {W} stroke-width="1.8"/>' + ''.join(f'<line x1="-7" y1="{y}" x2="7" y2="{y}" stroke="{GREY}" stroke-width="2"/>' for y in (-4, 2, 8)),
    '📟': calculator(), '🥉': _medal('#c98a52', 3), '🥈': _medal('#c9cdd3', 2), '🥇': _medal(AMBER, 1),
    '✂️': f'<circle cx="-10" cy="10" r="5" fill="none" stroke="{RED}" stroke-width="3"/><circle cx="10" cy="10" r="5" fill="none" stroke="{RED}" stroke-width="3"/><path d="M-6 6 L8 -18 M6 6 L-8 -18" stroke="{GREY}" stroke-width="3.5" stroke-linecap="round"/>',
    '🎀': f'<path d="M0 0 L-16 -9 V9 Z M0 0 L16 -9 V9 Z" fill="{PINK}" {W} stroke-width="2"/><path d="M-3 2 L-8 18 M3 2 L8 18" stroke="{PINK}" stroke-width="4"/><circle r="4" fill="#f08aa0" stroke="{INK}" stroke-width="1.5"/>',
    '🎨': f'<path d="M0 -16 Q18 -16 18 0 Q18 8 10 8 Q4 8 6 14 Q6 18 0 18 Q-18 18 -18 0 Q-18 -16 0 -16 Z" fill="#f3e2bd" {W}/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="3.2" fill="{c}"/>' for x, y, c in ((-10, -2, RED), (-5, -10, BLUE), (5, -10, GREEN), (-8, 8, AMBER))),
    '🪚': f'<path d="M-18 4 L10 -8 L12 -4 L-16 8 Z" fill="{GREY}" {W} stroke-width="1.8"/><path d="M10 -8 L18 -12 L20 -4 L12 -4 Z" fill="{BROWN}" {W} stroke-width="1.8"/>',
    '🎉': f'<path d="M-16 16 L-6 -6 L6 6 Z" fill="{AMBER}" {W} stroke-width="2"/>' + ''.join(f'<circle cx="{x}" cy="{y}" r="2.2" fill="{c}"/>' for x, y, c in ((4, -10, RED), (10, -4, BLUE), (14, -14, GREEN), (-2, -16, PINK))) + f'<path d="M0 -6 Q6 -16 2 -20 M6 0 Q16 -4 18 2" fill="none" stroke="{RED}" stroke-width="2"/>',
    '⏰': _clock(7, 0) + f'<circle cx="-13" cy="-13" r="5" fill="{RED}" {W} stroke-width="1.5"/><circle cx="13" cy="-13" r="5" fill="{RED}" {W} stroke-width="1.5"/>',
    '🕒': _clock(3, 0), '🕘': _clock(9, 0), '🕛': _clock(12, 0), '🪵': f'<rect x="-18" y="-8" width="32" height="16" fill="#a8732f" {W}/><ellipse cx="14" cy="0" rx="5" ry="8" fill="#e3c08a" {W}/><ellipse cx="14" cy="0" rx="2" ry="3.5" fill="none" stroke="#a8732f" stroke-width="1.5"/>',
    '🧭': f'<circle r="16" fill="{PAPER}" {W}/><path d="M0 -12 L4 0 L0 12 L-4 0 Z" fill="{RED}"/><path d="M0 12 L4 0 L-4 0 Z" fill="{GREY}"/>',
    '⛩️': f'<path d="M-20 -14 Q0 -20 20 -14 V-10 H-20 Z" fill="{RED}" {W} stroke-width="2"/><rect x="-16" y="-4" width="32" height="4" fill="{RED}"/><rect x="-13" y="-10" width="5" height="28" fill="{RED}"/><rect x="8" y="-10" width="5" height="28" fill="{RED}"/>',
    '🧩': f'<path d="M-14 -14 H-4 Q-4 -20 0 -20 Q4 -20 4 -14 H14 V-4 Q20 -4 20 0 Q20 4 14 4 V14 H-14 Z" fill="{GREEN}" {W}/>',
    '🎒': f'<rect x="-14" y="-12" width="28" height="30" rx="8" fill="{BLUE}" {W}/><path d="M-6 -12 Q-6 -20 0 -20 Q6 -20 6 -12" fill="none" stroke="{INK}" stroke-width="2.5"/><rect x="-9" y="2" width="18" height="12" rx="3" fill="#4d78c0" {W} stroke-width="2"/>',
    '🧶': f'<circle r="15" fill="{PINK}" {W}/><path d="M-12 -8 Q0 0 10 -11 M-15 0 Q0 8 14 -4 M-10 11 Q2 4 14 6" fill="none" stroke="#c9707f" stroke-width="2"/><path d="M12 10 Q20 16 14 20" fill="none" stroke="{PINK}" stroke-width="2.5"/>',
    '🏆': f'<path d="M-12 -16 H12 V-6 Q12 6 0 6 Q-12 6 -12 -6 Z" fill="{AMBER}" {W}/><path d="M-12 -12 Q-20 -12 -18 -4 Q-16 2 -10 2 M12 -12 Q20 -12 18 -4 Q16 2 10 2" fill="none" stroke="{INK}" stroke-width="2.5"/><rect x="-3" y="6" width="6" height="7" fill="{AMBER}"/><rect x="-10" y="13" width="20" height="6" rx="1" fill="{BROWN}" {W} stroke-width="2"/>',
    '🏷️': f'<path d="M-18 -8 L-6 -18 H18 V2 H-6 Z" fill="{AMBER}" {W} transform="rotate(20)"/><circle cx="-8" cy="-6" r="2.5" fill="{PAPER}" stroke="{INK}" stroke-width="1.5"/>',
    '👑': f'<path d="M-18 12 L-16 -12 L-8 0 L0 -16 L8 0 L16 -12 L18 12 Z" fill="{AMBER}" {W}/><circle cx="0" cy="4" r="3" fill="{RED}"/><circle cx="-10" cy="5" r="2.2" fill="{BLUE}"/><circle cx="10" cy="5" r="2.2" fill="{BLUE}"/>',
    '🗓️': f'<rect x="-16" y="-14" width="32" height="30" rx="3" fill="#fff" {W}/><rect x="-16" y="-14" width="32" height="9" rx="3" fill="{RED}"/>' + ''.join(f'<rect x="{-12 + c*7}" y="{-1 + r*6}" width="4" height="3" fill="{GREY}"/>' for r in range(3) for c in range(4)),
    '⛽': f'<rect x="-14" y="-16" width="20" height="34" rx="2" fill="{RED}" {W}/><rect x="-10" y="-11" width="12" height="9" fill="#fff"/><path d="M6 -6 H12 V12 Q12 16 16 14 V-4 L12 -10" fill="none" stroke="{INK}" stroke-width="2.5"/>',
    '💻': f'<rect x="-15" y="-15" width="30" height="20" rx="2" fill="{INK}"/><rect x="-12" y="-12" width="24" height="14" fill="{SKY}"/><path d="M-20 8 H20 L17 13 H-17 Z" fill="{GREY}" {W} stroke-width="2"/>',
    '📺': f'<rect x="-19" y="-13" width="38" height="25" rx="3" fill="{INK}"/><rect x="-15" y="-9" width="30" height="17" fill="{SKY}"/><path d="M-6 12 L-9 18 M6 12 L9 18" stroke="{INK}" stroke-width="2.5"/>',
    '🗼': f'<path d="M-3 -20 H3 L5 -8 H-5 Z M-5 -8 H5 L8 18 H-8 Z" fill="{GREY}" {W} stroke-width="2"/><ellipse cx="0" cy="-8" rx="8" ry="3" fill="{GREY}" {W} stroke-width="2"/><line x1="0" y1="-26" x2="0" y2="-20" stroke="{INK}" stroke-width="2"/>',
}
DRAW['❤️'] = heart()
DRAW['🃏'] = (f'<rect x="-13" y="-18" width="26" height="36" rx="4" fill="#fff" {W}/><path d="M-7 -6 L-4 -12 L0 -7 L4 -12 L7 -6 Q0 -2 -7 -6 Z" fill="{RED}" stroke="{INK}" stroke-width="1.4"/>'
              f'<circle cx="0" cy="2" r="5" fill="{SKIN}" stroke="{INK}" stroke-width="1.4"/><path d="M-6 9 H6 L4 14 H-4 Z" fill="{BLUE}"/><text x="-8" y="-9" font-size="7" font-weight="800" fill="{RED}" text-anchor="middle">J</text>')

# ---------------- the converter ----------------
EMO = re.compile('(?:[\U0001F000-\U0001FAFF☀-➿⭐⬆⬇↔-↙⏰-⏺](?:️)?(?:‍[\U0001F300-\U0001FAFF☀-➿♀♂](?:️)?)*)')
KEEP_TEXT = {'✓', '✕', '✗', '✔', '★', '☆', '♪'}       # plain text marks: left alone
def _get(attrs, name, default=None):
    m = re.search(r'\b%s="([^"]*)"' % re.escape(name), attrs)
    return m.group(1) if m else default
def lookup(e):
    if e in DRAW: return DRAW[e]
    b = e.replace('️', '')
    for k, v in DRAW.items():
        if k.replace('️', '') == b: return v
    return None
MISSING = set()
def _svg_text(m):
    attrs, content = m.group(1), m.group(2)
    bare = re.sub(r'<[^>]+>', '', content).strip()
    es = EMO.findall(bare)
    if not es or bare in KEEP_TEXT: return m.group(0)
    if EMO.sub('', bare).strip():                      # emoji mixed with words: arrows become plain text arrows
        t = m.group(0).replace('\u2B06\uFE0F', '↑').replace('\u2B07\uFE0F', '↓').replace('\u2B06', '↑').replace('\u2B07', '↓')
        if EMO.findall(re.sub(r'<[^>]+>', '', t).replace('↗', '')): MISSING.add('mixed:' + bare)
        return t
    obj = ''.join(at(i * 40 - (len(es) - 1) * 20, 0, lookup(e) or '') for i, e in enumerate(es))
    for e in es:
        if not lookup(e): MISSING.add(e)
    fs = float(_get(attrs, 'font-size', '16')); s = fs / 40
    x = float(_get(attrs, 'x', '0') or 0); y = float(_get(attrs, 'y', '0') or 0)
    anchor = _get(attrs, 'text-anchor', 'start')
    cx = x if anchor == 'middle' else (x + fs * .55 * len(es) if anchor == 'start' else x - fs * .55 * len(es))
    dy = -.36 * fs
    anims = re.findall(r'<animate\b[^>]*/>', content)
    outer, moved = [], False
    for a in anims:
        an = _get(a, 'attributeName')
        if an in ('y', 'x'):
            vals = [float(v) for v in _get(a, 'values').split(';')]
            pts = ';'.join(f'{cx:.1f} {v + dy:.1f}' if an == 'y' else f'{v:.1f} {y + dy:.1f}' for v in vals)
            rest = re.sub(r'\b(attributeName|values)="[^"]*"', '', a).replace('<animate', '').replace('/>', '')
            outer.append(f'<animateTransform attributeName="transform" type="translate" values="{pts}"{rest}/>'); moved = True
        else:
            outer.append(a)
    op = _get(attrs, 'opacity'); opa = f' opacity="{op}"' if op else ''
    tr = _get(attrs, 'transform', '')
    rot = re.search(r'rotate\(([-\d.]+)', tr or '')
    inner = f'<g transform="scale({s:.3f}){" rotate(" + rot.group(1) + ")" if rot else ""}">{obj}</g>'
    if moved: return f'<g{opa}>{"".join(outer)}{inner}</g>'
    return f'<g{opa}>{"".join(outer)}<g transform="translate({cx:.1f} {y + dy:.1f})">{inner}</g></g>'
def _ico(e):
    d = lookup(e)
    if d is None: MISSING.add(e); return e
    return f'<svg class="vw-ico" viewBox="-20 -20 40 40" role="img" aria-label="" style="width:1.2em;height:1.2em;vertical-align:-.25em;overflow:visible">{d}</svg>'
def convert(html):
    """Rewrite one warm-up card: emoji in SVG text become drawings; emoji in ordinary text become inline drawings."""
    html = re.sub(r'<text\b([^>]*)>(.*?)</text>', _svg_text, html, flags=re.S)
    parts = re.split(r'(<svg\b.*?</svg>)', html, flags=re.S)
    for i in range(0, len(parts), 2):
        segs = re.split(r'(<[^>]+>)', parts[i])
        for j in range(0, len(segs), 2):
            segs[j] = EMO.sub(lambda m: m.group(0) if m.group(0) in KEEP_TEXT else _ico(m.group(0)), segs[j])
        parts[i] = ''.join(segs)
    return ''.join(parts)
def convert_page(page):
    """Convert only the warm-up card (data-ink="warmq") of a lesson page."""
    return re.sub(r'<section[^>]*data-ink="warmq".*?</section>', lambda m: convert(m.group(0)), page, count=1, flags=re.S)
