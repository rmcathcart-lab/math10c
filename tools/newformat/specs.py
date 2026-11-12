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

# ======================= Unit 4 =======================
SPECS['u4l1'] = dict(
    warm=dict(title='Tile the Floor', rule='What is the <b>biggest square tile</b> that covers the floor with no cutting? How many do you need?', strip=strip(ssquares(12)),
              body=BIG('A floor is <b>240 cm by 180 cm</b>.'),
              nudge='The tile has to fit exactly along both walls.',
              reveal='<b>60 cm tiles, and 12 of them.</b> 60 is the biggest number that divides both 240 and 180: 4 tiles along one wall, 3 along the other.'),
    extra_expl=['twoWay', 'columns', 'tileRect', 'pullB'],
    practice=PR('ex3', '1–8', '9–23', 'Find the GCF and take it out.', [('1–8', 'Monomial common factors')], 6))
SPECS['u4l2'] = dict(
    warm=dict(title='The Combo Receipt', rule='In your head. No calculator, no paper.', strip=strip(sb('🍔', 120, 0), sb('🍟', 180, .3), srock('🧾', 245, 7, 2.4, 38)),
              body=BIG(T(r'7\times98+3\times98')), nudge='What do the two parts share?',
              reveal=f'<b>980.</b> Both parts are “so many 98s”: 7 of them plus 3 of them is {T(r"10\times98")}.'),
    extra_cards=['s1b'], extra_expl=['tileGroup', 'rearrange'],
    practice=PR('ex2', '1–3', '4–9', 'Take out the common binomial factor.', [('1–3', 'Binomial common factors')], 2))
SPECS['u4l3'] = dict(
    warm=dict(title='The Census Taker’s Riddle', rule='How old are the three kids?', strip=strip(sb('🧒', 110, 0, 36), sb('👧', 160, .3, 36), sb('🧑', 210, .6, 40), srock('🎹', 275, 5, 2.4, 34)),
              body=BIG('“My three kids’ ages <b>multiply to 36</b>, and they <b>add up to the house number</b> next door.”<small>The census taker checks the house number and says, “I still can’t tell.” The parent adds, “My oldest plays piano.” Now the census taker knows.</small>'),
              nudge='Why wasn’t the house number enough?',
              reveal='<b>2, 2 and 9.</b> Only two sets of ages share the same sum: 1, 6, 6 and 2, 2, 9 both add to 13. “My oldest” rules out the twins being oldest.'),
    extra_cards=['s2b'], extra_expl=['inspectB', 'tileNeg', 'twoVar', 'inspectC'],
    practice=PR('ex5', '1–8', '9–23', 'Sum and product pairs, then factoring.', [('1–4', 'Algebra tiles and sum–product pairs'), ('5–8', 'Factoring ' + T('x^2+bx+c'))], 5))
SPECS['u4l4'] = dict(
    warm=dict(title='The Prime Suspect', rule='It isn’t even, it doesn’t end in 5, and 3 doesn’t divide it. <b>Is it prime?</b> No calculator.', strip=strip(sdrive('🔍', 6, size=36, flip=False), sb('🕵️', 300, 0, 40)),
              body=BIG('899'), nudge='What friendly number is it very close to?',
              reveal=f'<b>No.</b> {T(r"899=900-1=30^2-1^2=29\times31")}.'),
    extra_cards=['s1b', 's4c'], extra_expl=['zeroMiddle', 'cutMove', 'rink'],
    practice=PR('ex2', '1–4', '5–13', 'Factor each difference of squares.', [('1–4', 'The pattern ' + T('A^2-B^2'))], 3))
DOTS4 = strip(''.join(f'<circle cx="{95 + i*50}" cy="30" r="15" fill="{BLUE}">{blink(3.2, i * .8, .2)}</circle>' for i in range(4)))
LIE = strip(sb('😇', 90, 0), sb('😇', 170, .3), srock('🤥', 250))
SPECS['u4l5'] = dict(
    warm=dict(title='Who Are We?', rule='A riddle from two whole numbers.', strip=strip(sb('❓', 130, 0, 36), sb('❓', 190, .5, 36), sblink('🤝', 250, 0, 34, 2.2, lo=.4)),
              body=BIG('“We <b>multiply to 36</b> and <b>add to 13</b>.”<small>Who are we?</small>'),
              nudge='How did you find them?',
              reveal=f'<b>4 and 9.</b> {T(r"4\times9=36")} and {T("4+9=13")}. Listing the pairs that multiply to 36 finds them fast: 1 and 36, 2 and 18, 3 and 12, 4 and 9.'),
    replace=[(' It’s the warm-up’s rectangle, without drawing it to scale.', '<span data-extra> It’s the rectangle from “The Area Box Mystery”, without drawing it to scale.</span>')],
    extra_expl=['whyAC', 'fullRange'],
    practice=PR('ex3', '1–4', '5–16', 'Tiles, area boxes and grouping.', [('1–4', 'Tiles, area boxes and grouping')], 3))
SPECS['u4l6'] = dict(
    warm=dict(title='In Your Head', rule='No calculator, no paper.', strip=strip(sb('🧠', 150, 0, 42), sblink('💭', 205, 0, 34, 1.8, lo=.3)),
              body=BIG(T('31^2')), nudge='You know 30 squared.',
              reveal=f'<b>961.</b> {T(r"31^2=(30+1)^2=900+60+1")}. The 60 is {T(r"2\times30\times1")}, the part people forget.'),
    replace=[(' Like the warm-up dolls: keep opening until every doll is solid.', ' Like nesting dolls: keep opening until every doll is solid.')],
    extra_expl=['squareTiles', 'gapFill', 'decomp', 'disguiseExt'],
    practice=PR('ex4', '1–5', '6–16', 'Perfect squares and trinomials in disguise.', [('1–5', 'Perfect squares and disguised trinomials')], 4))
SPECS['u4l7'] = dict(
    warm=dict(title='Which One Doesn’t Belong?', rule='Which one is the odd one out? Pick one and be ready to say <b>why</b>.', strip=DOTS4,
              body=TILES(4, [('A', T('x^2-16')), ('B', T('x^2+16')), ('C', T('2x^2-32')), ('D', T('x^2-8x+16'))]),
              reveal=f'<b>Any of them can be right.</b> A is the only one that is a difference of squares straight away. B is the only one that can’t be factored. C is the only one with a number in front of {T("x^2")}. D is the only one with three terms.'),
    replace=[('<p class="small muted">(b) is warm-up traveller D without its common factor: Lane 3, then Lane 2 twice.</p>', '<p class="small muted" data-extra>(b) is traveller D from “Factoring Airport” without its common factor: Lane 3, then Lane 2 twice.</p>')],
    extra_cards=['s2c'], extra_expl=['expand'],
    practice=PR('ex3', '1–4', '5–9', 'Choose a strategy, then factor completely.', [('1–4', 'Choosing and using a strategy')], 3))
SPECS['u4l8'] = dict(
    warm=dict(title='Two Truths and a Lie', rule='Two of these are true. One is a lie. Which one?', strip=LIE,
              body=TILES(3, [('A', T('x^2-9=(x-3)(x+3)')), ('B', T('x^2+9=(x+3)^2')), ('C', T('x^2+6x+9=(x+3)^2'))], 27),
              nudge='How could you prove it?',
              reveal=f'<b>B is the lie.</b> Expand it: {T("(x+3)^2=x^2+6x+9")}, not {T("x^2+9")}. A sum of squares doesn’t factor.'),
    extra_cards=['tiles', 'box', 'bvals'])

# ======================= Unit 5 =======================
def _bath():
    pts = [(40, 215), (115, 125), (150, 125), (160, 95), (225, 95), (235, 125), (295, 215)]
    d = 'M' + ' L'.join(f'{x} {y}' for x, y in pts)
    labs = ''.join(f'<text x="{(a[0]+b[0])/2 + dx}" y="{(a[1]+b[1])/2 + dy}" font-size="19" font-weight="800" fill="{BLUE}" text-anchor="middle">{i+1}</text>'
                   for i, ((a, b), (dx, dy)) in enumerate(zip(zip(pts, pts[1:]), [(-14, -4), (0, -9), (-13, 2), (0, -9), (13, 2), (14, -4)])))
    return (f'<line x1="40" y1="30" x2="40" y2="215" stroke="{INK}" stroke-width="3"/><line x1="40" y1="215" x2="310" y2="215" stroke="{INK}" stroke-width="3"/>'
            f'<text x="175" y="240" font-size="15" fill="{INK}" text-anchor="middle">time</text><text x="18" y="125" font-size="15" fill="{INK}" text-anchor="middle" transform="rotate(-90 18 125)">water depth</text>'
            f'<path d="{d}" fill="none" stroke="{INK}" stroke-width="4" stroke-linejoin="round"/>{labs}'
            f'<circle r="7" fill="{RED}"><animateMotion dur="7s" repeatCount="indefinite" path="{d}"/></circle>')
BATH = svg(_bath(), 'A graph of water depth against time in six straight parts')

SPECS['u5l1'] = dict(
    warm=dict(title='The Fly on the Ceiling', rule='Using <b>only numbers</b>, how could you tell a friend exactly where the fly is?', strip=strip(sdrive('🪰', 7, 0, 30, 34, hop=10)),
              body=BIG('A fly lands on a ceiling covered in square tiles.<small>Your friend is on the phone and cannot see the ceiling.</small>'),
              nudge='How many numbers do you need?',
              reveal='<b>Two numbers.</b> Pick a corner to start from, then say how many tiles <b>across</b> and how many tiles <b>along</b>. That pair of numbers is the idea behind today’s grid.'),
    extra_cards=['s3b', 's3c'], extra_expl=['matchRule'],
    practice=PR('ex3', '1–6', '7–12', 'Plot and read points, then growing patterns.', [('1–3', 'The Cartesian plane'), ('4–6', 'Growing patterns: table, graph and equation')], 4))
SPECS['u5l2'] = dict(
    warm=dict(title='Ice Cream and Sharks', rule='Does eating ice cream cause shark attacks? What is really going on?', strip=strip(sb('🍦', 110, 0), sdrive('🦈', 6, 0, 40, 46), sb('🍦', 250, .5)),
              body=BIG('In a beach town, <b>ice cream sales</b> and <b>shark attacks</b> rise and fall together.<small>When one is high, so is the other. Every year.</small>'),
              reveal='<b>Neither one causes the other.</b> Both depend on a third thing: hot weather. Hot days sell more cones and put more swimmers in the water.'),
    extra_cards=['s3b'], extra_expl=['linOrNot'],
    practice=PR('ex2', '1–7', '8–17', 'One relation described several ways, then mapping diagrams.', [('1–4', 'One relation, several descriptions'), ('5–7', 'Mapping diagrams')], 5))
SPECS['u5l3'] = dict(
    warm=dict(title='The High Dive', rule='A graph shows her height against time. Which <b>two points</b> on the graph do you already know?', strip=strip(sfloat('🤸', 120, 2.6, 0, 34), sb('💦', 200, .4, 34), sb('🌊', 250, 0, 34, 3, 2.2)),
              body=BIG('A diver jumps from a <b>10 m</b> tower and hits the water <b>2 seconds</b> later.'),
              nudge='Write each one as (time, height).',
              reveal=f'{T("(0,\\ 10)")} and {T("(2,\\ 0)")}. At the jump, the <b>time</b> is zero. At the splash, the <b>height</b> is zero. Each point sits on an axis.'),
    extra_cards=['s2b'],
    practice=PR('ex3', '1–3', '4–11', 'Find the intercepts from each equation.', [('1–3', 'Intercepts from an equation')], 2))
SPECS['u5l4'] = dict(
    warm=dict(title='Ride Restrictions', rule='Which of the four friends may ride?', strip=strip(sroad(), sdrive('🎢', 5, 0, 40, 44)),
              body='<div class="vw-q">THE CYCLONE: riders must be <b>at least 120 cm</b> and <b>no taller than 195 cm</b>.</div>' + TILES(4, [('Ava', '118 cm'), ('Ben', '120 cm'), ('Cleo', '160 cm'), ('Dev', '196 cm')], 30),
              reveal='<b>Ben and Cleo.</b> “At least 120” includes exactly 120, so Ben is in. Ava is 2 cm too short and Dev is 1 cm too tall.'),
    extra_cards=['s3b'], extra_expl=['dots'],
    practice=PR('ex3', '1–4', '5–9', 'Domain and range from ordered pairs and graphs.', [('1–4', 'Domain and range')], 3))
SPECS['u5l5'] = dict(
    warm=dict(title='The Birthday Match', rule='What is the chance that at least two people in the room share a birthday?', strip=strip(sb('🎂', 130, 0), sfloat('🎈', 190, 3, 0), sfloat('🎈', 230, 3.6, .8), sb('🎂', 290, .5)),
              body='<div class="vw-q">A class has <b>30 students</b>.</div>' + TILES(4, [('A', 'about 8%'), ('B', 'about 30%'), ('C', 'about 50%'), ('D', 'about 70%')], 30),
              nudge='Guess first. Then check: does anyone in this room match?',
              reveal='<b>D, about 70%.</b> Every person has exactly one birthday, but one birthday can belong to many people. There are 435 different pairs of people in a class of 30.'),
    extra_cards=['wub', 's1d', 's3b'], extra_expl=['nested'],
    practice=PR('s2b', '1–2', '3–6', 'Is it a function? Give a reason.', [('1', 'Is it a function? Give a reason'), ('2', 'Function or not, in many forms')], 1))
SPECS['u5l6'] = dict(
    warm=dict(title='The Phone Keypad', rule='Which four digits do you press after 555?', strip=strip(srock('📞', 140, 14, .7, 40), sb('🌮', 210, 0, 40)),
              body=BIG('A sign says <b>CALL 555-TACO</b>.<small>2 ABC · 3 DEF · 4 GHI · 5 JKL · 6 MNO · 7 PQRS · 8 TUV · 9 WXYZ</small>'),
              nudge='Could another word give the same four digits?',
              reveal='<b>8226.</b> Each letter sits on exactly one key, so the letters decide the digits. Going backwards is not so tidy: 8226 could also spell VACO, TBAN and many more.'),
    extra_cards=['s2b', 's3c', 's4b'], extra_expl=['mapNote'],
    practice=PR('ex3', '1–10', '11–21', 'Function notation, then evaluating.', [('1–5', 'Function notation, tables and graphs'), ('6–10', 'Evaluating functions')], 7))
SPECS['u5l7'] = dict(
    warm=dict(title='Celsius and Fahrenheit', rule='Is there a temperature where both scales show the <b>same number</b>?', strip=strip(sb('❄️', 120, 0, 34), srock('🌡️', 185, 10, 2.4, 44), sb('🔥', 250, .5, 34)),
              body=BIG(f'{T("F=1.8C+32")}<small>Water freezes at 0 °C, which is 32 °F. It boils at 100 °C, which is 212 °F.</small>'),
              nudge='Try a few. Do the two numbers get closer going up, or going down?',
              reveal=f'<b>Yes: −40.</b> {T("1.8(-40)+32=-72+32=-40")}. At −40 it does not matter which scale you read.'),
    extra_expl=['exThree', 'cost'],
    practice=PR('ex3', '1–8', '9–16', 'Convert between notations, then read graphs both ways.', [('1–3', 'Converting between the two notations'), ('4–8', 'Reading a graph in both directions')], 5))
SPECS['u5l8'] = dict(
    warm=dict(title='The Bathtub Graph', rule='Which part of the graph shows Sam <b>getting into</b> the tub?', pic=BATH,
              body=BIG('Sam runs a bath, gets in, soaks, gets out and pulls the plug.<small>The graph shows the depth of the water the whole time.</small>'),
              reveal='<b>Part 3.</b> The tap is already off, but the water jumps up quickly because Sam’s body pushes it up. Part 5 is Sam getting out.'),
    replace=[('Watch the bath from the warm-up play out with its graph.', 'Watch the bath play out with its graph.'), ('<b>The drain rate in the warm-up.</b>', '<b>The drain rate for the bath.</b>')],
    extra_cards=['s1d'],
    practice=PR('ex1b', '1–5', '6–16', 'Read the story in each graph.', [('1–5', 'Reading the story in a graph')], 3))
SPECS['u5l9'] = dict(
    warm=dict(title='Which One Doesn’t Belong?', rule='Which one is the odd one out? Pick one and be ready to say <b>why</b>.', strip=strip(''.join(f'<circle cx="{95 + i*50}" cy="30" r="15" fill="{BLUE}">{blink(3.2, i * .8, .2)}</circle>' for i in range(4))),
              body=TILES(4, [('A', T(r'\{(1,2),\ (2,3),\ (3,4)\}')), ('B', T('y=2x+1')), ('C', T('x=3')), ('D', T('f(x)=x^2'))], 26),
              reveal='<b>Any of them can be right.</b> A is the only one made of separate points. B is the only slanted straight line. C is the only one that is not a function. D is the only curve.'),
    extra_cards=['s1b', 's1c', 's3b', 's3c'], extra_expl=['discCont', 'machine'])

# ======================= Unit 6 =======================
SPECS['u6l1'] = dict(
    warm=dict(title='Can You Get Wi-Fi?', rule='Does house C get Wi-Fi?', strip=strip(sblink('📶', 150, 0, 40, 1.4), sb('🏠', 215, .3, 38)),
              body=BIG('A Wi-Fi router reaches <b>5 units</b> in a straight line, in every direction.<small>House C is 4 units left and 4 units up from the router.</small>'),
              nudge='Both numbers are less than 5. Is that enough?',
              reveal=f'<b>No.</b> The straight-line distance is {T(r"\sqrt{4^2+4^2}=\sqrt{32}\approx5.66")} units, which is more than 5.'),
    extra_cards=['s2b', 's3b', 's4b'],
    practice=PR('ex4', '1–5', '6–11', 'Lengths of horizontal, vertical and slanted segments.', [('1–5', 'Lengths of segments')], 3))
SPECS['u6l2'] = dict(
    warm=dict(title='Ramp Rules', rule='How far out from the step must the ramp start?', strip=strip(sroad(), sdrive('🧑‍🦽', 6, 0, 38, 44, flip=False)),
              body=BIG('A ramp may rise at most <b>1 cm for every 12 cm</b> it goes across.<small>A café door sits on top of one 60 cm step.</small>'),
              reveal=f'<b>At least 720 cm, or 7.2 m.</b> Every 1 cm of rise needs 12 cm across, and {T(r"60\times12=720")}.'),
    extra_cards=['s7b'], extra_expl=['order'],
    practice=PR('ex4', '1–2', '3–18', 'Find the rise, the run and the slope.', [('1–2', 'Rise, run and slope')]))
SPECS['u6l3'] = dict(
    warm=dict(title='Trees in a Row', rule='The farmer says all five trees are in one perfect straight row. Which tree is out of line?', strip=strip(*[sb('🌳', 80 + i * 50, i * .2, 34) for i in range(5)]),
              body=TILES(5, [('Apple', T('(0,\\ 1)')), ('Cherry', T('(3,\\ 3)')), ('Plum', T('(6,\\ 5)')), ('Peach', T('(9,\\ 8)')), ('Pear', T('(12,\\ 9)'))], 24),
              nudge='How do you get from each tree to the next?',
              reveal='<b>Peach.</b> Each step should be 3 across and 2 up. Peach is 3 up from Plum, so it sits one unit too high. It should be at (9, 7).'),
    extra_cards=['s2b', 's5b', 's5c', 's5d'],
    practice=PR('ex4', '1–7', '8–25', 'The slope formula, then collinear points.', [('1–4', 'The slope formula'), ('5–7', 'Collinear points')], 5))
SPECS['u6l4'] = dict(
    warm=dict(title='Low Battery', rule='Neither of them has a charger. Whose phone dies first?', strip=strip(sbatt(120, GREEN, 4), sbatt(200, AMBER, 6)),
              body=BIG('At noon, Mia’s phone is at <b>90%</b> and loses <b>15%</b> every hour.<small>Leo’s phone is at 40% and loses 5% every hour.</small>'),
              nudge='When does each phone reach 0%?',
              reveal='<b>Mia’s.</b> Hers lasts 6 hours, until 6:00. Leo’s lasts 8 hours, until 8:00. Starting higher doesn’t help if you drain three times as fast.'),
    extra_cards=['s1b', 's2b', 's4b', 's4c', 's5b'],
    practice=PR('ex3', '1–5', '6–14', 'Linear tables, intercepts, domain and range.', [('1–2', 'Is it linear?'), ('3–4', 'Intercepts'), ('5', 'Domain and range')], 3))
SPECS['u6l5'] = dict(
    warm=dict(title='Two Truths and a Lie', rule='Two of these are true. One is a lie. Which one?', strip=LIE,
              body='<div class="vw-q">A line segment joins <b>A(0, 0)</b> and <b>B(6, 8)</b>.</div>' + TILES(3, [('A', 'Its length is 10'), ('B', 'Its midpoint is (3, 4)'), ('C', 'Its slope is ' + T(r'\tfrac34'))], 26),
              nudge='How could you prove it?',
              reveal=f'<b>C is the lie.</b> Rise 8 over run 6 gives a slope of {T(r"\tfrac86=\tfrac43")}. The length is {T(r"\sqrt{36+64}=10")} and the midpoint is halfway along each coordinate.'),
    replace=[(' That was Hunter B’s mistake in the warm-up.', '')],
    extra_expl=['stair', 'linear'])

# ======================= Unit 7 =======================
SPECS['u7l1'] = dict(
    warm=dict(title='Stacking Cups', rule='How many nested cups make a stack as tall as the door?', strip=strip(sb('🥤', 120, 0, 36), sb('🥤', 170, .3, 36), sb('🥤', 220, .6, 36), sb('🚪', 285, 0, 40, 2, 3)),
              body=BIG('One plastic cup is <b>12 cm</b> tall. Each extra cup nested on top adds <b>2 cm</b>.<small>The classroom door is about 200 cm tall.</small>'),
              nudge='How tall is a stack of 4 cups? Of 10?',
              reveal=f'<b>95 cups.</b> The first cup gives 12 cm, and the other 188 cm takes 94 more cups. As a rule: {T("h=2n+10")}.'),
    extra_cards=['s4c'], extra_expl=['intercepts'],
    practice=PR('ex5', '1–3', '4–14', 'Linear or not? Then read the slope and the y-intercept.', [('1–3', 'Linear or not? Reading ' + T('m') + ' and ' + T('b'))], 2))
SPECS['u7l2'] = dict(
    warm=dict(title='The Cricket Thermometer', rule='You count <b>100 chirps</b> in one minute. How warm is it?', strip=strip(sb('🦗', 140, 0, 38, 12, .6), srock('🌡️', 215, 10, 2.4, 42)),
              body=BIG('A cricket chirps faster when it is warmer, at a steady rate.<small>At 10 °C it chirps 20 times a minute. At 20 °C it chirps 60 times a minute.</small>'),
              nudge='How many extra chirps for each extra degree?',
              reveal='<b>30 °C.</b> 40 more chirps for 10 more degrees is 4 chirps per degree. From 60 chirps up to 100 is 40 more chirps, so 10 more degrees.'),
    extra_cards=['s2b', 's3b', 's3c'],
    practice=PR('ex2', '1–3', '4–14', 'Write the equation of each line.', [('1–3', 'Equations from ' + T('m') + ' and ' + T('b') + ', and from graphs')], 2))
SPECS['u7l3'] = dict(
    warm=dict(title='Concert Ticket Combos', rule='How many different combos spend <b>exactly $80</b>?', strip=strip(srock('🎟️', 130, 10, 1.8, 40), sb('🎸', 195, 0, 40), srock('🎟️', 260, 10, 1.8, 40)),
              body=BIG('Lawn tickets cost <b>$5</b>. Floor tickets cost <b>$8</b>.<small>You have an $80 gift card. Buying zero of one kind is allowed.</small>'),
              reveal=f'<b>Three.</b> 16 lawn and 0 floor, 8 lawn and 5 floor, or 0 lawn and 10 floor. They are the whole-number points on the line {T("5x+8y=80")}.'),
    extra_cards=['s1b', 's2b'], extra_expl=['judge'],
    practice=PR('ex2', '1–5', '6–18', 'Into general form, then out of it.', [('1–2', 'Into general form'), ('3–5', 'Out of general form')], 3))
SPECS['u7l4'] = dict(
    warm=dict(title='Hot Air Balloon', rule='If it keeps dropping at the same rate, at what time does it touch down?', strip=strip(sb('🎈', 170, 0, 44, 16, 3.5, 40), sb('☁️', 90, .5, 30, 3, 4, 30), sb('☁️', 260, 1.2, 30, 3, 4, 34)),
              body=BIG('At <b>10:05</b> a hot-air balloon is <b>800 m</b> up.<small>It is dropping a steady 40 m every minute.</small>'),
              nudge='How high was it at 10:00?',
              reveal='<b>10:25.</b> 800 m at 40 m a minute takes 20 minutes. One point and one rate were enough to know the whole flight.'),
    extra_expl=['toMxB', 'race', 'read', 'solve6', 'solve7', 'solve8'],
    practice=PR('ex4', '1–6', '7–24', 'Write and use slope–point form.', [('1–6', 'Slope–point form')], 4))
SPECS['u7l5'] = dict(
    warm=dict(title='Same Line in Disguise', rule='Two of these are secretly the <b>same line</b>. Which two?', strip=strip(sroad(), sdrive('🏎️', 3.2, 0, 36, 44), sdrive('🚗', 5, 1, 36, 44)),
              body=TILES(4, [('A', T(r'y=-\tfrac12x+3')), ('B', T('2x+3y-12=0')), ('C', T('y-1=2(x-3)')), ('D', T('4x-2y-10=0'))], 26),
              nudge='No need to rearrange everything. What can you read off each one?',
              reveal=f'<b>C and D.</b> Both are {T("y=2x-5")}: the same slope and the same y-intercept, written in different forms.'),
    extra_cards=['s3b', 's5c'],
    practice=PR('ex2', '1–4', '5–11', 'Graph each line without changing its form.', [('1–4', 'Graphing without changing the form')], 3))
SPECS['u7l6'] = dict(
    warm=dict(title='How Fast Does It Grow?', rule='The Atlantic Ocean gets about <b>2.5 cm wider every year</b>. Which of these is closest to that speed?', strip=strip(sspin('🌍', 150, 8, 38), sb('💅', 215, 0, 36)),
              body=TILES(3, [('Hair', 'about 1 cm<small>every month</small>'), ('Fingernails', 'about 3 mm<small>every month</small>'), ('A lawn', 'about 5 cm<small>every week</small>')], 28),
              nudge='Careful: the units are all different.',
              reveal='<b>Fingernails.</b> In centimetres per year: nails about 3.6, hair about 12 and a lawn about 260. Rates only compare when the units match.'),
    extra_cards=['s2b', 's3b', 's4b'],
    practice=PR('ex2', '1–3', '4–9', 'Read each rate of change and write the equation.', [('1–3', 'Rate of change and the equation')], 2))
SPECS['u7l7'] = dict(
    warm=dict(title='City Planner', rule='Which equation is the new road?', strip=strip(sroad(), sb('🏫', 60, 0, 34, 2, 3, 40), sdrive('🚧', 9, 0, 34, 44, flip=False)),
              body='<div class="vw-q">Main Street is the line ' + T('x-2y+4=0') + '. A new road must pass through the school at <b>(8, 1)</b> and meet Main Street at a <b>right angle</b>.</div>' + TILES(4, [('A', T(r'y=\tfrac12x-3')), ('B', T('y=-2x+17')), ('C', T('y=-2x+1')), ('D', T('y=2x-15'))], 26),
              nudge='What is the slope of Main Street?',
              reveal=f'<b>B.</b> Main Street has slope {T(r"\tfrac12")}, so the new road has slope {T("-2")}. Through (8, 1): {T("1=-2(8)+b")}, so {T("b=17")}.'),
    replace=[(' (traps B and C in the warm-up).', '.')],
    extra_expl=['dials', 'rate'])

# ======================= Unit 8 =======================
SPECS['u8l1'] = dict(
    warm=dict(title='Head Start', rule='Does Max catch Rosa before the finish line? If so, where?', strip=strip(sroad(), sdrive('🏃‍♀️', 6.5, 0, 34, 44), sdrive('🏃', 4.2, 1.2, 34, 44)),
              body=BIG('A 200 m race. Rosa gets a <b>30 m head start</b> and runs <b>4 m</b> every second.<small>Max starts on the line and runs 6 m every second.</small>'),
              nudge='Where is each runner after 5 seconds? After 10?',
              reveal=f'<b>Yes, at the 90 m mark.</b> Max closes the gap by 2 m every second, so 30 m takes 15 seconds. Check: {T("30+4(15)=90")} and {T("6(15)=90")}.'),
    extra_cards=['s2b', 's3b', 's3c', 's4b', 's5b', 'ex5c', 'ex7c'],
    practice=PR('ex2', '1–3', '4–10', 'Solve each system by graphing, then check.', [('1–3', 'Solving systems by graphing')], 2))
SPECS['u8l2'] = dict(
    warm=dict(title='The Coin Jar', rule='How many of the coins are dimes?', pic=JAR,
              body=BIG('A jar holds only <b>nickels</b> and <b>dimes</b>.<small>There are 20 coins, worth $1.40 altogether.</small>'),
              nudge='What if all 20 were nickels?',
              reveal='<b>8 dimes</b> and 12 nickels. Twenty nickels make $1.00. Each nickel you swap for a dime adds 5¢, and you need 40¢ more: 8 swaps.'),
    extra_cards=['s1e', 's3b'],
    practice=PR('ex3', '1–3', '4–11', 'Solve each system by substitution, then check.', [('1–3', 'Solving by substitution')], 2))
SPECS['u8l3'] = dict(
    warm=dict(title='Weigh the Pets', rule='All three pets on one big scale: what would it read?', strip=strip(sb('🐈', 110, 0, 38), sb('🐕', 170, .3, 38), sb('🐇', 230, .6, 38), srock('⚖️', 295, 8, 2.2, 38)),
              body='<div class="vw-q">The vet’s scale only works with <b>two pets</b> on it at a time.</div>' + TILES(3, [('Scale A', 'cat + dog<small>14 kg</small>'), ('Scale B', 'dog + rabbit<small>12 kg</small>'), ('Scale C', 'cat + rabbit<small>6 kg</small>')], 28),
              nudge='What happens if you add all three readings?',
              reveal='<b>16 kg.</b> The three readings add to 32 kg, and that total weighs every pet exactly twice. Half of 32 is 16.'),
    extra_cards=['warm2', 's2c', 's4b', 's5b'],
    practice=PR('ex5', '1–4', '5–14', 'Add or subtract directly, then scale first.', [('1–2', 'Adding or subtracting directly'), ('3–4', 'Scaling one or both equations')], 3))
SPECS['u8l4'] = dict(
    warm=dict(title='How Old Am I?', rule='How old is Sam right now?', strip=strip(sb('👨', 130, 0, 42), sb('👦', 190, .4, 34), sblink('🎂', 250, 0, 34, 2.4)),
              body=BIG('Sam’s dad says: “Right now I’m <b>4 times</b> your age.<small>In 20 years, I’ll be only twice your age.”</small>'),
              nudge='Try an age for Sam and test it.',
              reveal=f'<b>Sam is 10</b> and his dad is 40. In 20 years they are 30 and 60. As equations: {T("d=4s")} and {T("d+20=2(s+20)")}.'),
    extra_cards=['s1b', 'ex2c', 'ex3c', 'ex4c', 'ex5c'],
    practice=PR('ex3', '1–5', '6–15', 'Introduce variables, form a system, solve and check.', [('1–5', 'Word problems with systems')], 3))
SPECS['u8l5'] = dict(
    warm=dict(title='Upstream, Downstream', rule='How fast is the current?', strip=strip(sdrive('🛶', 4, 0, 38, 44), sb('🌊', 80, 0, 26, 3, 2, 52), sb('🌊', 260, .8, 26, 3, 2, 52)),
              body=BIG('Paddling just as hard both ways, a kayak goes <b>8 km/h downstream</b> and <b>4 km/h upstream</b>.'),
              nudge='And how fast would the kayak go on a still lake?',
              reveal=f'<b>2 km/h.</b> The kayak alone does 6 km/h. Downstream is {T("6+2")} and upstream is {T("6-2")}. The two speeds differ by two currents.'),
    extra_cards=['s1b', 's2c', 's2e'],
    practice=PR('ex3', '1–5', '6–9', 'Mixture and motion problems.', [('1–5', 'Mixture and motion problems')], 3))
SPECS['u8l6'] = dict(
    warm=dict(title='How Many Solutions?', rule='One of these systems has <b>no solution</b>. Which one?', strip=strip(srock('⚖️', 170, 10, 2.4, 44)),
              body=TILES(3, [('A', T(r'\begin{aligned}y&=2x+1\\y&=2x-3\end{aligned}')), ('B', T(r'\begin{aligned}y&=2x+1\\y&=-x+4\end{aligned}')), ('C', T(r'\begin{aligned}y&=2x+1\\2y&=4x+2\end{aligned}'))], 24),
              nudge='How many solutions do the other two have?',
              reveal='<b>A.</b> Same slope, different y-intercepts: parallel lines never meet. B crosses once, at (1, 3). C is the same line written twice, so it has infinitely many solutions.'),
    extra_cards=['ex1b', 'ex2b', 'ex3b'])

# ======================= Unit 9 =======================
SPECS['u9l1'] = dict(
    warm=dict(title='Shadow Height', rule='How tall is the flagpole?', strip=strip(sspin('☀️', 80, 10, 36), sb('🧍', 180, 0, 36, 2, 3), srock('🚩', 250, 6, 2.6, 42)),
              body=BIG('A student <b>1.6 m</b> tall casts a shadow <b>2 m</b> long.<small>At the same moment, the school flagpole’s shadow is 15 m long.</small>'),
              nudge='Right now, how does anything’s height compare with its shadow?',
              reveal=f'<b>12 m.</b> Everything is 0.8 times as tall as its shadow, because {T(r"1.6\div2=0.8")}. So the flagpole is {T(r"0.8\times15=12")} m.'),
    extra_cards=['s4b'],
    practice=PR('ex3', '1–5', '6–12', 'Name the sides, then write the ratios.', [('1–5', 'Naming sides and writing ratios')], 3))
SPECS['u9l2'] = dict(
    warm=dict(title='The 4-to-1 Ladder Rule', rule='A ladder that follows the rule makes what angle with the ground?', strip=strip(srock('🪜', 170, 8, 2.6, 46)),
              body='<div class="vw-q">Safety sticker: “For every <b>4 m up</b> the wall, put the foot <b>1 m out</b>.”</div>' + TILES(4, [('A', 'about 45°'), ('B', 'about 60°'), ('C', 'about 76°'), ('D', 'about 86°')], 30),
              nudge='Guess first. Does a longer ladder lean at a different angle?',
              reveal='<b>C, about 76°.</b> Every ladder that follows the rule leans at the same angle, long or short: the same ratio of sides always gives the same angle.'),
    extra_expl=['tan90'],
    practice=PR('ex3', '1–5', '6–12', 'Calculator values, then how the ratios change.', [('1', 'Calculator values'), ('2–4', 'Why the ratios grow or shrink'), ('5', 'Comparing ratios without a calculator')], 3))
SPECS['u9l3'] = dict(
    warm=dict(title='Kite Height', rule='About how high is the kite above your hand?', strip=strip(sfloat('🪁', 150, 3.4, 0, 36), sfloat('☁️', 240, 5, 1, 28)),
              body='<div class="vw-q">You let out all <b>50 m</b> of string. It makes a <b>40°</b> angle with the level ground.</div>' + TILES(4, [('A', 'about 22 m'), ('B', 'about 29 m'), ('C', 'about 32 m'), ('D', 'about 38 m')], 30),
              nudge='Guess first. It has to be less than 50 m. Why?',
              reveal=f'<b>C, about 32 m.</b> The string is the hypotenuse and the height is opposite the 40° angle: {T(r"h=50\sin40^\circ\approx32.1")} m.'),
    extra_cards=['warm2', 's2c', 's3b', 's3c', 's4b'],
    practice=PR('ex5', '1–6', '7–14', 'Find each missing side.', [('1–6', 'Finding a missing side')], 4))
SPECS['u9l4'] = dict(
    warm=dict(title='Roof Pitch', rule='A 24/12 roof is twice as steep. What angle does it make with the horizontal?', strip=strip(sb('🏠', 150, 0, 42, 3, 2.6), srock('📐', 215, 10, 2.2, 36)),
              body='<div class="vw-q">A <b>12/12</b> roof rises 12 for every 12 across. It makes a <b>45°</b> angle with the horizontal.</div>' + TILES(3, [('A', 'about 63°'), ('B', 'about 75°'), ('C', '90°')], 30),
              nudge='Sketch it: up 24, across 12.',
              reveal=f'<b>A, about 63°.</b> Doubling the steepness does not double the angle. Today’s tool finds it exactly: {T(r"\tan^{-1}(2)\approx63.4^\circ")}.'),
    extra_cards=['s1b'],
    practice=PR('ex2', '1–7', '8–16', 'Inverse ratios, then an angle from two sides.', [('1–2', 'Inverse trigonometric ratios'), ('3–7', 'An angle from two known sides')], 4))
SPECS['u9l5'] = dict(
    warm=dict(title='The Leaning Tower', rule='About how far sideways is the top shifted?', strip=strip(srock('🗼', 170, 5, 3.5, 48)),
              body='<div class="vw-q">The tower of Pisa is about <b>56 m</b> long and leans about <b>4°</b> from upright.</div>' + TILES(4, [('A', 'about 0.4 m'), ('B', 'about 2 m'), ('C', 'about 4 m'), ('D', 'about 10 m')], 30),
              nudge='Guess first. Then sketch the right triangle.',
              reveal=f'<b>C, about 4 m.</b> The tower is the hypotenuse and the shift is opposite the 4° angle: {T(r"56\sin4^\circ\approx3.9")} m.'),
    extra_cards=['s3e'],
    practice=PR('ex2', '1–6', '7–14', 'Choose the tool, then find each measure.', [('1–6', 'Choosing the right tool')], 3))
SPECS['u9l6'] = dict(
    warm=dict(title='Lighthouse Lookout', rule='Boat C is seen at <b>15°</b> down, one third of boat A’s angle. How far is C from the lighthouse?', strip=strip(sdrive('⛵', 9, 0, 34, 46), sblink('💡', 30, 0, 26, 1.8, 26)),
              body='<div class="vw-q">The keeper’s eyes are <b>40 m</b> above the water. Boat A is seen <b>45°</b> below the horizontal, so it is 40 m from the lighthouse.</div>' + TILES(3, [('A', '80 m'), ('B', '120 m'), ('C', 'about 149 m')], 30),
              nudge='One third of the angle. Three times the distance?',
              reveal=f'<b>C, about 149 m.</b> {T(r"\dfrac{40}{\tan15^\circ}\approx149")}. A third of the angle is not three times the distance.'),
    extra_cards=['s2b', 's3c', 's5b'],
    practice=PR('ex3', '1–5', '6–11', 'Eye level, elevation and depression.', [('1–5', 'Multi-step problems')], 3))
SPECS['u9l7'] = dict(
    warm=dict(title='The Unreachable Cliff', rule='Without ever crossing the river: how tall is the cliff?', strip=strip(sb('🏔️', 250, 0, 44, 2, 3), sdrive('🚶', 8, 0, 32, 46, x0=20, x1=190)),
              body=BIG('A river blocks the base of a cliff. From point A, the angle up to the top is <b>30°</b>.<small>You walk 40 m straight toward the cliff to point B. Now the angle up to the top is 60°.</small>'),
              nudge='Sketch it. What are the angles of the triangle A, B, top?',
              reveal=f'<b>About 34.6 m.</b> Triangle A, B, top has two 30° angles, so the sight line from B is also 40 m. Then {T(r"h=40\sin60^\circ\approx34.6")} m.'),
    extra_cards=['s2c', 's4b'],
    practice=PR('ex3', '1–3', '4–11', 'Two right triangles sharing a side.', [('1–3', 'Two right triangles sharing a side')], 2))
SPECS['u9l8'] = dict(
    warm=dict(title='The Great Pyramid', rule='What angle does a face make with the ground?', strip=strip(sroad(56), sdrive('🐫', 9, 0, 34, 44), sdrive('🐫', 9, 1.5, 28, 46)),
              body='<div class="vw-q">The Great Pyramid is about <b>146 m</b> tall. Its square base is about <b>230 m</b> wide.</div>' + TILES(4, [('A', 'about 32°'), ('B', 'about 38°'), ('C', '45°'), ('D', 'about 52°')], 30),
              nudge='Steeper or shallower than 45°? How can you tell without a calculator?',
              reveal=f'<b>D, about 52°.</b> The height is more than half the base (115 m), so it is steeper than 45°. {T(r"\tan^{-1}\left(\tfrac{146}{115}\right)\approx51.8^\circ")}.'),
    extra_cards=['s7'], extra_expl=['cofunction'])
