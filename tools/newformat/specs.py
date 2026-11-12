"""Math 10C: one entry per lesson for tools/newformat/restructure.py (see that file). Same rules as Math 15."""
from pics import *
T = lambda x: '<span class="tex">%s</span>' % x
BIG = lambda html: f'<div class="vw-q">{html}</div>'
PIC = lambda inner, cap='': f'<div class="vw-pic">{inner}{("<p>" + cap + "</p>") if cap else ""}</div>'
TILES = lambda n, items, fs=None: f'<div class="vw-tiles" style="--n:{n}' + (f';--fs:{fs}px' if fs else '') + '">' + ''.join((f'<div class="lab"><b>{a}</b><span>{b}</span></div>' if len(a) > 2 else f'<div><b>{a}</b>{b}</div>') for a, b in items) + '</div>'
def PR(after, qs, rest, line, chips, upto=None):
    return dict(after=after, qs=qs, rest=rest, line=line, chips=chips, note=f'We carry on when most of the class has reached Question {upto}.' if upto else 'We carry on when most of the class has finished.')
SPECS = {}
NUM = lambda ch, x, begin=0, col=BLUE: f'<g>{bob(7, 1.5, begin)}<text x="{x}" y="44" font-size="38" font-weight="800" fill="{col}" text-anchor="middle">{ch}</text></g>'

# ======================= Unit 1 =======================
SPECS['u1l1'] = dict(
    warm=dict(title='Unwrap the Number', rule='Will everyone end up with the same pile of numbers?', strip=strip(sb('🎁', 110, 0), sb('🎁', 170, .3, 30), sb('🎁', 220, .6, 22)),
              body=BIG('Split <b>360</b> into two smaller numbers that multiply to it. Then split those, and keep going until nothing splits any more.<small>Everyone starts a different way: 36 × 10, 6 × 60, 2 × 180…</small>'),
              nudge='Try two different starts.',
              reveal=f'<b>Yes, always.</b> Every route ends at {T(r"2\times2\times2\times3\times3\times5")}. A number has only one set of prime building blocks.'),
    extra_expl=['rectangles', 'primeFilter'],
    practice=PR('ex3', '1–5', '6–16', 'Factors, primes and composites.', [('1–5', 'Factors, primes and composites')], 4))
SPECS['u1l2'] = dict(
    warm=dict(title='Hot Dogs and Buns', rule='What is the smallest number of hot dogs and buns you can buy with none left over?', strip=strip(sb('🌭', 110, 0), sb('🌭', 160, .3), sb('🍞', 220, .6), sb('🍞', 270, .9)),
              body=BIG('Hot dogs come in packs of <b>10</b>. Buns come in packs of <b>8</b>.'),
              nudge='How many packs of each?',
              reveal='<b>40 of each.</b> That is 4 packs of hot dogs and 5 packs of buns. 40 is the first number in both the 10 times table and the 8 times table.'),
    extra_cards=['s1b', 's1d', 's2b'], extra_expl=['bags'],
    replace=[('Back to the warm-up: the number of take-home bags had to divide into', 'Share 24 hot dogs and 32 buns into identical take-home bags with nothing left over. The number of bags has to divide into'), ('warm-up: 24 hot dogs, 32 buns', '24 hot dogs, 32 buns')],
    practice=PR('ex2', '1–4', '5–13', 'Find each greatest common factor.', [('1–4', 'Greatest common factor')], 3))
SPECS['u1l3'] = dict(
    warm=dict(title='The Locker Problem', rule='After all 100 students have had a turn, how many lockers are open?', strip=strip(ssquares(12)),
              body=BIG('A hallway has <b>100 closed lockers</b>. Student 1 opens every locker. Student 2 changes every 2nd locker. Student 3 changes every 3rd locker.<small>It carries on like that, all the way to student 100.</small>'),
              nudge='Which lockers get touched an odd number of times?',
              reveal='<b>10 lockers:</b> numbers 1, 4, 9, 16, 25, 36, 49, 64, 81 and 100. Only perfect squares have an odd number of factors.'),
    extra_cards=['s1w'], extra_expl=['cubes', 'sides'],
    practice=PR('ex3', '1–3', '4–14', 'Test for perfect squares, then perfect cubes.', [('1', 'Perfect squares'), ('2–3', 'Perfect cubes')], 2))
SPECS['u1l4'] = dict(
    warm=dict(title='The 100th Digit', rule=f'What is the <b>100th digit</b> after the decimal point in {T(r"\dfrac17")}?', strip=strip(sb('🧮', 150, 0, 42), sblink('❓', 210, 0, 32)),
              body=BIG(f'{T(r"\dfrac17=0.142857142857\ldots")}'),
              nudge='You don’t need to write out 100 digits.',
              reveal='<b>8.</b> The six digits 142857 repeat. 96 digits is 16 full blocks, so the 100th digit is the 4th digit of the block.'),
    extra_cards=['s2b', 's3b'], extra_expl=['denoms'],
    practice=PR('ex3', '1–8', '9–12', 'Decimal patterns, ordering and calculator conversions.', [('1–3', 'Rational or irrational?'), ('4–8', 'Ordering and calculator conversions')], 5))
SPECS['u1l5'] = dict(
    warm=dict(title='Which One Doesn’t Belong?', rule='Which one is the odd one out? Pick one and be ready to say <b>why</b>.', strip=strip(''.join(f'<circle cx="{95 + i*50}" cy="30" r="15" fill="{BLUE}">{blink(3.2, i * .8, .2)}</circle>' for i in range(4))),
              body=TILES(4, [('A', T(r'\sqrt{16}')), ('B', T('-3')), ('C', T('0.5')), ('D', T(r'\sqrt{7}'))]),
              reveal=f'<b>Any of them can be right.</b> A is a whole number in disguise. B is the only negative. C is the only one that is not a root or an integer. D is the only one whose decimal never ends or repeats.'),
    extra_cards=['s1b'], extra_expl=['tiles', 'exprSq', 'cubes', 'exprCb', 'ineq'],
    practice=PR('ex3', '1–12', '13–21', 'The real number system, then estimating square roots.', [('1–8', 'The real number system'), ('9–12', 'Estimating square roots')], 9))
SPECS['u1l6'] = dict(
    warm=dict(title='Error or Not?', rule='One of these makes a calculator show <b>ERROR</b>. Which one?', strip=strip(sb('📟', 150, 0, 40), sblink('⚠️', 205, 0, 34, 1.2)),
              body=TILES(4, [('A', T(r'\sqrt[3]{-8}')), ('B', T(r'\sqrt{-9}')), ('C', T(r'\sqrt{0}')), ('D', T(r'\sqrt[4]{16}'))]),
              nudge='What number, times itself, gives each one?',
              reveal=f'<b>B.</b> No real number times itself gives {T("-9")}. A is fine: {T(r"(-2)\times(-2)\times(-2)=-8")}.'),
    extra_cards=['s2b', 's5c'], extra_expl=['anatomy', 'area'],
    practice=PR('ex3', '1–7', '8–13', 'Evaluate radicals, then name their parts.', [('1–5', 'Evaluating radicals'), ('6–7', 'Radical vocabulary')], 5))
SPECS['u1l7'] = dict(
    warm=dict(title='Which Is Biggest?', rule='No calculator. Which one is the biggest?', strip=strip(sb('🥉', 100, 0), sb('🥈', 170, .3), sb('🥇', 240, .6)),
              body=TILES(3, [('A', T(r'2\sqrt{5}')), ('B', T(r'3\sqrt{2}')), ('C', T(r'\sqrt{19}'))]),
              reveal=f'<b>A.</b> Put each one under a single root: {T(r"2\sqrt5=\sqrt{20}")}, {T(r"3\sqrt2=\sqrt{18}")} and {T(r"\sqrt{19}")}.'),
    extra_cards=['s2b', 's3b'], extra_expl=['split', 'coef', 'numline', 'pyth'],
    practice=PR('ex4', '1–8', '9–16', 'Entire to mixed, and mixed to entire.', [('1–8', 'Entire and mixed radicals')], 6))
SPECS['u1l8'] = dict(
    warm=dict(title='Double the Cube', rule='About how many times as long are the edges of the 2-litre box?', strip=strip(sb('📦', 130, 0, 30), sb('📦', 210, .4, 46)),
              body=BIG('A cube-shaped box with <b>10 cm</b> edges holds <b>1 litre</b>.<small>Another cube-shaped box holds 2 litres.</small>'),
              nudge='Twice as long? Try it: how much would that box hold?',
              reveal=f'<b>About 1.26 times.</b> Doubling the edges would hold 8 litres, not 2. The edges only need to be {T(r"\sqrt[3]{2}\approx1.26")} times as long, about 12.6 cm.'),
    extra_cards=['s1c', 's1d', 's3c'], extra_expl=['cubeMeaning', 'signs', 'varToEntire'],
    practice=PR('ex2', '1–7', '8–11', 'Radicals with index 3 and higher.', [('1–7', 'Index 3 and higher')], 5))
SPECS['u1l9'] = dict(
    warm=dict(title='The Four Fours', rule=f'Use exactly <b>four 4s</b>, with {T("+")}, {T("-")}, {T(r"\times")}, {T(r"\div")} and brackets, to make <b>7</b>.', strip=strip(NUM('4', 110, 0), NUM('4', 150, .2, RED), NUM('4', 190, .4, GREEN), NUM('4', 230, .6, AMBER)),
              body=BIG(f'{T(r"4\ \ \square\ \ 4\ \ \square\ \ 4\ \ \square\ \ 4=7")}'),
              nudge='Can you find a second way?',
              reveal=f'One way: {T(r"4+4-4\div4=7")}. Another: {T(r"44\div4-4=7")}.'),
    extra_cards=['w4', 'w5', 'w9'], extra_expl=['ladder', 'venn', 'powers', 'decimals', 'sort', 'repFrac', 'compare'])

# ======================= Unit 2 =======================
SPECS['u2l1'] = dict(
    warm=dict(title='How Long to Crack It?', rule='Which lock has the <b>most</b> possible codes to try?', strip=strip(srock('🔒', 150, 9, .9, 42), sb('🔑', 215, 0, 34, 6, 1.8)),
              body=TILES(3, [('Lock A', '3 dials<small>each dial: 0 to 9</small>'), ('Lock B', '10 switches<small>each switch: on or off</small>'), ('Lock C', '2 dials<small>each dial: A to Z</small>')], 30),
              nudge='How many codes does each one have?',
              reveal=f'<b>Lock B.</b> {T("2^{10}=1024")} codes. Lock A has {T("10^3=1000")} and Lock C has {T("26^2=676")}.'),
    extra_cards=['s4b', 's5c'], extra_expl=['anatomy', 'fenceNeg'],
    practice=PR('ex4', '1–7', '8–19', 'Vocabulary, negative bases and zero exponents.', [('1–3', 'Vocabulary and repeated multiplication'), ('4–7', 'Evaluating, negative bases and zero exponents')], 5))
SPECS['u2l2'] = dict(
    warm=dict(title='The Photocopier', rule='The area of the third copy is how many times the area of the original?', strip=strip(sb('🖨️', 120, 0, 40), sblink('📄', 185, 0, 26, 2.4, lo=0), sblink('📄', 225, .8, 34, 2.4, lo=0), sblink('📄', 275, 1.6, 44, 2.4, lo=0)),
              body=BIG('A photocopier set to <b>200%</b> makes a picture twice as long and twice as wide.<small>You copy a picture at 200%, then copy the copy at 200%, then copy that copy at 200%.</small>'),
              nudge='What happens to the area on one copy?',
              reveal=f'<b>64 times.</b> Each copy has 4 times the area, and {T(r"4\times4\times4=4^3=64")}.'),
    extra_cards=['s1b'], extra_expl=['chain', 'check', 'signs', 'varExp'],
    practice=PR('ex3', '1–4', '5–13', 'Product and quotient laws with coefficients.', [('1–4', 'Product and quotient laws with coefficients')], 3))
SPECS['u2l3'] = dict(
    warm=dict(title='The Bouncing Ball', rule='Which bounce is the first one that rises <b>less than 1 cm</b>?', strip=strip(f'<g>{bob(34, .9)}<text x="170" y="56" font-size="26" text-anchor="middle">🏀</text></g>', '<line x1="110" y1="58" x2="230" y2="58" stroke="#4a4436" stroke-width="3" stroke-linecap="round"/>'),
              body=BIG('A ball is dropped from <b>100 cm</b>.<small>Every bounce rises to half the height of the one before: 50 cm, 25 cm, …</small>'),
              nudge='Does it ever stop bouncing?',
              reveal=f'<b>The 7th bounce.</b> 50, 25, 12.5, 6.25, 3.125, 1.5625, then about 0.78 cm. That is {T(r"100\times2^{-7}")}.'),
    extra_cards=['s2'], extra_expl=['hops', 'sorter', 'snmuldiv'],
    practice=PR('ex3', '1–7', '8–21', 'Use the negative exponent law.', [('1–7', 'The negative exponent law')], 5))
SPECS['u2l4'] = dict(
    warm=dict(pic=CUBE, title='One Million Cubes', rule='How tall is the giant cube?',
              body=BIG('A unit cube is <b>1 cm</b> on each edge.<small>Stack exactly one million of them into one giant cube.</small>'),
              nudge='Taller than you? Taller than the school?',
              reveal=f'<b>100 cm, just 1 metre.</b> {T(r"100\times100\times100=1\,000\,000")}, so each edge is 100 cubes long. That is {T(r"1\,000\,000^{1/3}")}.'),
    extra_expl=['whyRoot', 'minus', 'cube', 'conv2', 'toPow'],
    practice=PR('ex3', '1–7', '8–19', 'Evaluate powers with rational exponents.', [('1–7', 'Evaluating rational-exponent powers')], 5))
SPECS['u2l5'] = dict(
    warm=dict(title='The Earthquake Scale', rule='A magnitude 7 earthquake releases about how many times as much energy as a magnitude 5?', strip=strip(srock('🏚️', 130, 6, .35, 40), srock('🌳', 200, 5, .4, 38), sblink('💥', 255, 0, 28, .8)),
              body=BIG('Each step up the magnitude scale releases about <b>32 times</b> as much energy.'),
              nudge='Is it 64 times?',
              reveal=f'<b>About 1000 times.</b> Two steps up is {T(r"32\times32=1024")}, not {T(r"32\times2")}.'),
    extra_expl=['laws', 'machinesVar', 'rootFirst', 'lanes'],
    practice=PR('ex3', '1–4', '5–14', 'Simplify and convert.', [('1–4', 'Simplifying and converting')], 3))
SPECS['u2l6'] = dict(
    warm=dict(title='The Biggest One', rule='No calculator. Which is the biggest?', strip=strip(f'<g><animateTransform attributeName="transform" type="translate" values="-30 50;360 -40" dur="3.5s" repeatCount="indefinite"/><text x="0" y="30" font-size="40" text-anchor="middle">🚀</text></g>', sblink('✨', 60, 0, 22), sblink('✨', 250, .7, 22)),
              body=TILES(3, [('A', T('10^{100}')), ('B', T('100^{10}')), ('C', T('1000^{5}'))]),
              nudge='Can you write them all with the same base?',
              reveal=f'<b>A, by a huge amount.</b> {T("100^{10}=(10^2)^{10}=10^{20}")} and {T("1000^5=(10^3)^5=10^{15}")}. Both are tiny beside {T("10^{100}")}.'),
    extra_expl=['anatomy', 'expand', 'columns', 'flip', 'radical', 'distribute', 'sci', 'stack'],
    practice=PR('ex5', '1–6', '7–19', 'Vocabulary, then the product and quotient laws.', [('1–3', 'Vocabulary and repeated multiplication'), ('4–6', 'Product and quotient laws')], 4))

# ======================= Unit 3 =======================
GARDEN = svg(f'<rect x="40" y="60" fill="#cfe8c9" stroke="{GREEN}" stroke-width="4" stroke-dasharray="8 6"><animate attributeName="width" values="200;240;240;200" keyTimes="0;.4;.85;1" dur="4s" repeatCount="indefinite"/><animate attributeName="height" values="120;160;160;120" keyTimes="0;.4;.85;1" dur="4s" repeatCount="indefinite"/></rect><rect x="40" y="60" width="200" height="120" fill="#8fcf8a" stroke="{INK}" stroke-width="4"/><text x="140" y="128" font-size="26" text-anchor="middle">🌷 🥕 🌻</text><text x="140" y="48" font-size="20" fill="{INK}" text-anchor="middle">10 m</text><text x="22" y="126" font-size="20" fill="{INK}" text-anchor="middle">6 m</text>', 'A garden growing longer and wider')
SPECS['u3l1'] = dict(
    warm=dict(title='The Fruit Puzzle', rule='What is the last line worth?', strip=strip(sb('🍎', 90, 0), sb('🍌', 170, .3), sb('🥥', 250, .6)),
              body=BIG('🍎 + 🍎 + 🍎 = 30<br>🍎 + 🍌 + 🍌 = 18<br>🍌 − 🥥 = 2<small style="font-size:40px;color:inherit">🥥 + 🍎 + 🍌 = ?</small>'),
              nudge='What is each fruit worth?',
              reveal='<b>16.</b> An apple is 10, a banana is 4 and a coconut is 2, so the last line is 2 + 10 + 4.'),
    extra_cards=['s4b'], extra_expl=['polyCheck', 'degree', 'order', 'addTiles'],
    practice=PR('ex4', '1–5', '6–19', 'Vocabulary, terms and degree.', [('1–5', 'Vocabulary, terms and degree')], 4))
SPECS['u3l2'] = dict(
    warm=dict(pic=GARDEN, title='Grow the Garden', rule='How much garden area is added?',
              body=BIG('A <b>10 m by 6 m</b> garden gets <b>2 m longer</b> and <b>2 m wider</b>.'),
              nudge='Is it just 2 × 2?',
              reveal=f'<b>36 m².</b> The new garden is {T(r"12\times8=96")} m², and {T("96-60=36")}. That is two strips (12 and 20) plus a 2 by 2 corner.'),
    extra_cards=['s6c'], extra_expl=['distB', 'composite', 'digits', 'subCheck'],
    practice=PR('ex4', '1–10', '11–21', 'Area models and the distributive property.', [('1–10', 'Area models and the distributive property')], 7))
SPECS['u3l3'] = dict(
    warm=dict(title='The Squaring Trick', rule='No calculator, no paper.', strip=strip(sb('🧠', 150, 0, 42), sblink('💡', 205, 0, 34, 1.4)),
              body=BIG(T('105^2')), nudge='You know 100 squared.',
              reveal=f'<b>11 025.</b> {T(r"105^2=(100+5)^2=10\,000+1\,000+25")}. The 1 000 is {T(r"2\times100\times5")}, the part people forget.'),
    extra_cards=['s1c', 's1d'], extra_expl=['outside', 'combine', 'complete'],
    practice=PR('ex2', '1–2', '3–9', 'The two patterns, then a number out front.', [('1', 'Squares of binomials and sum × difference'), ('2', 'A number out front')], 1))
SPECS['u3l4'] = dict(
    warm=dict(pic=CUBE.replace('1 cm', ''), title='The Painted Cube', rule='How many of the small cubes have <b>no paint</b> on them?',
              body=BIG('A <b>10 by 10 by 10</b> cube is painted on the outside, then cut into 1000 small cubes.'),
              nudge='Where are the unpainted ones hiding?',
              reveal=f'<b>512.</b> Peel off the painted outer layer and an 8 by 8 by 8 cube is left: {T("8^3=512")}.'),
    extra_cards=['s1c', 's2c'], extra_expl=['box', 'check'],
    practice=PR('ex2', '1–4', '5–10', 'Binomial times trinomial.', [('1–4', 'Binomial × trinomial')], 3))
SPECS['u3l5'] = dict(
    warm=dict(title='Frame It', rule='How wide must the frame be so that the <b>frame’s area equals the photo’s area</b>?', strip=strip(sb('🖼️', 170, 0, 44, 5, 2.2), sblink('✨', 120, 0, 22), sblink('✨', 222, .6, 22)),
              body=BIG('A photo is <b>20 cm by 30 cm</b>.<small>A frame of the same width goes all the way around it.</small>'),
              nudge='Try a width and check.',
              reveal=f'<b>5 cm.</b> The outside is then {T(r"30\times40=1200")} cm², exactly double the photo’s 600 cm².'),
    extra_cards=['s1b'], extra_expl=['garden', 'box'])
SPECS['u3l6'] = dict(
    warm=dict(title='The Mind Reader', rule='Do each step in your head. Don’t tell anyone your number.', strip=strip(sb('🔮', 170, 0, 44, 5, 2.2), sblink('✨', 120, 0, 24), sblink('✨', 222, .6, 24)),
              body=BIG('Think of a number. <b>Add 3.</b> <b>Double it.</b> <b>Subtract 4.</b> <b>Halve it.</b><small>Now subtract the number you started with.</small>'),
              nudge='Compare answers with the person beside you.',
              reveal=f'<b>Everyone gets 1.</b> Start with {T("n")}: {T(r"n+3\to2n+6\to2n+2\to n+1")}, and taking away {T("n")} leaves 1.'),
    extra_expl=['classify', 'zeroPairs', 'tileMul', 'foil', 'audit', 'square', 'frame', 'groups', 'grid', 'three', 'complete', 'box'],
    practice=PR('ex7', '1–8', '9–13', 'Multiple choice from across the unit.', [('1–8', 'Multiple choice')], 6))
