"""The lessons home-screen app icon (the same script is in the Math 10C, Math 15 and Math 20-1 repos): a board on an
easel in the course colour, the course mark written large on the board, an amber pen stroke under it and a pencil.
Text is converted to paths (Inter Display ExtraBold) so the SVG renders the same everywhere.
Writes lessons/assets/icon.svg (square, full bleed: iPadOS rounds the corners itself), favicon.svg (rounded),
icon-180.png (apple-touch-icon), icon-192.png, icon-512.png (manifest) and favicon-32.png.
Run from anywhere: python3 lessons/dev/make_icons.py [math10c|math15|math20-1]  (default: this repo's folder name).
Needs fontTools, rsvg-convert and the Inter Display font (FONT below)."""
import os, subprocess, sys
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

FONT = TTFont('/usr/share/fonts/opentype/inter/InterDisplay-ExtraBold.otf')
GS = FONT.getGlyphSet(); CMAP = FONT.getBestCmap()
COURSES = {
    'math10c': dict(mark='10C', c='#0f5f5a', hi='#1c8a82', dk='#0a4743'),
    'math15': dict(mark='15', c='#1e3a6e', hi='#2f5aa3', dk='#152a51'),
    'math20-1': dict(mark='20-1', c='#7a1f3d', hi='#a33357', dk='#5a1229'),
}

def text_path(s, track=-0.02):
    """the string as one SVG path in font units (y down), and its bounding box"""
    upm = FONT['head'].unitsPerEm; x = 0; pen = SVGPathPen(GS); bp = BoundsPen(GS)
    for ch in s:
        g = CMAP[ord(ch)]
        t = (1, 0, 0, -1, x, 0)
        GS[g].draw(TransformPen(pen, t)); GS[g].draw(TransformPen(bp, t))
        x += GS[g].width + track * upm
    return pen.getCommands(), bp.bounds

def svg(course, rounded=False):
    C = COURSES[course]; d, (x0, y0, x1, y1) = text_path(C['mark'])
    # the text box on the board: centred at (240, 210) (clear of the pencil), at most 272 wide and 132 tall
    bw, bh = x1 - x0, y1 - y0; s = min(272 / bw, 132 / bh)
    tx, ty = 240 - (x0 + bw / 2) * s, 210 - (y0 + bh / 2) * s
    rx = ' rx="112"' if rounded else ''
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- {C['mark']} Lessons: the lesson-page web app. A board on an easel in the course colour, the course mark on it,
       an amber pen stroke and a pencil. (Practice site: plain {C['mark']} on the course colour; Teacher Ledger: {C['mark']} on dark navy.) -->
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{C['hi']}"/><stop offset="1" stop-color="{C['dk']}"/></linearGradient>
    <clipPath id="clip"><rect width="512" height="512"{rx}/></clipPath>
  </defs>
  <g clip-path="url(#clip)">
    <rect width="512" height="512" fill="url(#bg)"/>
    <!-- easel legs -->
    <g stroke="#ffffff" stroke-opacity=".5" stroke-width="20" stroke-linecap="round">
      <path d="M176 360 L124 470"/><path d="M336 360 L388 470"/><path d="M256 360 L256 448"/>
    </g>
    <!-- the board -->
    <rect x="50" y="78" width="412" height="290" rx="30" fill="#000" opacity=".18" transform="translate(0 8)"/>
    <rect x="50" y="78" width="412" height="290" rx="30" fill="#fbf8f1"/>
    <rect x="50" y="78" width="412" height="290" rx="30" fill="none" stroke="#ffffff" stroke-width="6"/>
    <!-- the course mark -->
    <path transform="translate({tx:.2f} {ty:.2f}) scale({s:.5f})" fill="{C['c']}" d="{d}"/>
    <!-- a pen stroke under it -->
    <path d="M112 318 C168 296 214 330 262 312 S 352 292 384 306" fill="none" stroke="#f2a516" stroke-width="20" stroke-linecap="round"/>
    <!-- the pencil, its tip at the end of the stroke -->
    <g transform="translate(392 306) rotate(-60)">
      <path d="M0 0 L28 -12 L28 12 Z" fill="#e2d6c2"/>
      <path d="M0 0 L9 -3.9 L9 3.9 Z" fill="#1c2230"/>
      <rect x="26" y="-13" width="118" height="26" rx="6" fill="#2b3242"/>
      <rect x="118" y="-13" width="26" height="26" rx="6" fill="#9aa1ae"/>
      <rect x="30" y="-13" width="112" height="7" rx="3" fill="#ffffff" opacity=".18"/>
    </g>
  </g>
</svg>
'''

def png(src, out, size):
    subprocess.run(['rsvg-convert', '-w', str(size), '-h', str(size), '-o', out, src], check=True)

if __name__ == '__main__':
    repo = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
    for r in sys.argv[1:] or [os.path.basename(repo)]:
        a = os.path.join(repo, 'lessons', 'assets') + os.sep
        open(a + 'icon.svg', 'w').write(svg(r))
        open(a + 'favicon.svg', 'w').write(svg(r, rounded=True))
        for n in (180, 192, 512): png(a + 'icon.svg', a + f'icon-{n}.png', n)
        png(a + 'favicon.svg', a + 'favicon-32.png', 32)
        print('wrote', a)
