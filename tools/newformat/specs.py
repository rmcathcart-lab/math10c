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

# ======================= Warm-ups, second pass (2026-11-11) =======================
# Ryan: the old "big one" with less context doesn't work. Every warm-up must stand on its own: something every student
# can start on with nothing taught yet, with one clear question. These replace the warm-ups that reused the old big one.
DOTS4 = strip(''.join(f'<circle cx="{95 + i*50}" cy="30" r="15" fill="{BLUE}">{blink(3.2, i * .8, .2)}</circle>' for i in range(4)))
LIE = strip(sb('😇', 90, 0), sb('😇', 170, .3), srock('🤥', 250))
W = {}
W['u1l1'] = dict(title='Rows of Desks', rule='Which number of desks makes that impossible?', strip=strip(sb('🪑', 110, 0), sb('🪑', 160, .2), sb('🪑', 210, .4), sb('🧑‍🏫', 275, 0, 40)),
    body=BIG('A teacher wants to set up the desks in <b>equal rows</b>, with none left over.<small>More than one row, and more than one desk in each row.</small>') + TILES(4, [('A', '21 desks'), ('B', '23 desks'), ('C', '25 desks'), ('D', '27 desks')], 28),
    nudge='Try to make rows for each one.',
    reveal='<b>B, 23 desks.</b> 21 is 3 rows of 7, 25 is 5 rows of 5 and 27 is 3 rows of 9. 23 only splits as 1 × 23: one long row. A number like that is <b>prime</b>.')
W['u1l2'] = dict(title='Blinking Lights', rule='How many seconds until they blink together again?', strip=strip(sblink('💡', 140, 0, 40, 1.3), sblink('💡', 210, .3, 40, 1.7)),
    body=BIG('A red light blinks every <b>6 seconds</b>. A green light blinks every <b>8 seconds</b>.<small>They just blinked at the same moment.</small>'),
    nudge='List the times each one blinks.',
    reveal='<b>24 seconds.</b> Red blinks at 6, 12, 18, 24… Green blinks at 8, 16, 24… 24 is the first number in both lists: the <b>least common multiple</b> of 6 and 8.')
W['u1l3'] = dict(title='Square or Cube?', rule='Which pile can do both?', strip=strip(sb('🧊', 130, 0, 34), sb('🧊', 170, .3, 34), sb('🧊', 210, .6, 34)),
    body=BIG('You want to build a pile of sugar cubes into one <b>flat, solid square</b>. Then you want to rebuild the same pile into one <b>solid cube</b>.') + TILES(4, [('A', '16 cubes'), ('B', '27 cubes'), ('C', '36 cubes'), ('D', '64 cubes')], 28),
    nudge='Which piles make a square? Which make a cube?',
    reveal=f'<b>D, 64.</b> It makes an 8 by 8 square and a 4 by 4 by 4 cube. 16 and 36 only make squares, and 27 only makes a cube.')
W['u1l4'] = dict(title='Split the Bill', rule='Which share shows a decimal that never ends?', strip=strip(sb('🍕', 140), srock('💵', 210, 10, 2, 38)),
    body=BIG('A <b>$10</b> bill is split evenly between friends. Each share is worked out on a calculator.') + TILES(4, [('A', '4 friends'), ('B', '5 friends'), ('C', '6 friends'), ('D', '8 friends')], 28),
    reveal=f'<b>C, 6 friends:</b> {T(r"10\div6=1.666\ldots")} forever. 4, 5 and 8 friends give $2.50, $2 and $1.25. Dividing by 6 brings in a factor of 3, and that makes the decimal repeat.')
W['u1l8'] = dict(title='Bigger Puzzle Cubes', rule='Which of these can NOT be the number of small cubes in a bigger puzzle cube?', strip=strip(sspin('🎲', 170, 6, 40)),
    body=BIG('A normal Rubik’s cube is built from <b>27</b> small cubes: 3 by 3 by 3. Bigger puzzle cubes are built the same way.') + TILES(4, [('A', '64'), ('B', '125'), ('C', '200'), ('D', '343')], 32),
    nudge='Try 4 by 4 by 4, then 5 by 5 by 5…',
    reveal=f'<b>C, 200.</b> {T("4^3=64")}, {T("5^3=125")} and {T("7^3=343")}. But {T("6^3=216")}, so 200 falls between two cubes: it is not a perfect cube.')
W['u2l1'] = dict(title='Rice on a Chessboard', rule='Which is the first square with more than 1000 grains on it?', strip=strip(sb('🍚', 130, 0, 36), sb('♟️', 200, .4, 36)),
    body=BIG('Put <b>1</b> grain of rice on the first square of a chessboard, <b>2</b> on the second, <b>4</b> on the third, and keep <b>doubling</b>.<small>A chessboard has 64 squares.</small>'),
    nudge='Keep doubling, and count the squares as you go.',
    reveal=f'<b>Square 11:</b> {T("2^{10}=1024")} grains. Square 10 has only 512. The last square would hold {T("2^{63}")} grains, more rice than the whole world grows in hundreds of years.')
W['u2l2'] = dict(title='Odd One Out', rule='Three of these are the same number. Which one is different?', strip=DOTS4,
    body=TILES(4, [('A', T(r'2^3\times2^2')), ('B', T('2^5')), ('C', T(r'4^2\times2')), ('D', T(r'(2^2)^3'))]),
    nudge='Work each one out.',
    reveal=f'<b>D.</b> {T(r"(2^2)^3=4^3=64")}. The other three are all 32. Today: the shortcuts that tell you this without working anything out.')
W['u2l3'] = dict(title='Keep Going Down', rule='Each line is the one above divided by 10. What are the last two lines?', strip=strip(sb('⬇️', 150, 0, 36, 8, 1.2), sb('🔟', 210, .4, 36)),
    body=BIG(T(r'\begin{aligned}10^3&=1000\\10^2&=100\\10^1&=10\\10^0&=1\\10^{-1}&=\ ?\\10^{-2}&=\ ?\end{aligned}')),
    reveal=f'{T(r"10^{-1}=0.1=\tfrac1{10}")} and {T(r"10^{-2}=0.01=\tfrac1{100}")}. A negative exponent doesn’t make a negative number. It makes a small one.')
W['u2l5'] = dict(title='The Half-Hour Mystery', rule='What is that half-hour number?', strip=strip(sb('🦠', 120, 0, 28), sb('🦠', 165, .3, 36), sb('🦠', 220, .6, 44)),
    body=BIG('Every hour, a colony of bacteria <b>doubles</b>. It grows smoothly, so every half hour it is multiplied by the <b>same number</b>.') + TILES(4, [('A', '1'), ('B', 'about 1.41'), ('C', '1.5'), ('D', '2')], 32),
    nudge='Two half hours make an hour. Try 1.5, twice.',
    reveal=f'<b>B, about 1.41.</b> Two half hours must multiply to 2, so the number times itself is 2: that is {T(r"\sqrt2\approx1.414")}. ({T(r"1.5\times1.5=2.25")} is too big.) Today: {T(r"\sqrt2")} written as {T(r"2^{1/2}")}.')
W['u3l2'] = dict(title='The Bigger Screen', rule='How many more square centimetres of screen does the new phone have?', strip=strip(srock('📱', 170, 10, 2.2, 44)),
    body=BIG('A phone screen is <b>6 cm</b> by <b>12 cm</b>. The new model is <b>1 cm wider</b> and <b>1 cm longer</b>.'),
    nudge='Is it 2 cm²? Sketch it.',
    reveal='<b>19 cm².</b> 7 × 13 = 91 and 6 × 12 = 72. The new part is a 1 by 12 strip, a 1 by 6 strip and a 1 by 1 corner: 12 + 6 + 1.')
W['u3l3'] = dict(title='The Bigger Garden', rule=f'Kai says the area grows by {T("3^2=9")} m². By how much does it really grow?', strip=strip(sb('🌱', 120, 0, 34), sb('🌻', 180, .4, 40), sb('🌱', 240, .8, 34)),
    body=BIG('A square garden has sides of <b>5 m</b>. Each side gets <b>3 m</b> longer.'),
    nudge='Sketch the old square inside the new one.',
    reveal=f'<b>39 m².</b> {T("8^2=64")} and {T("5^2=25")}. Around the old square there is a 3 by 3 corner and two 5 by 3 strips: 9 + 15 + 15 = 39.')
W['u3l4'] = dict(title='Grow the Box', rule='How much volume is added?', strip=strip(sb('🎁', 140, 0, 34), sb('🎁', 205, .4, 46)),
    body=BIG('A gift box is <b>2 cm</b> by <b>3 cm</b> by <b>4 cm</b>. Every edge gets <b>1 cm</b> longer.'),
    nudge='Is it 3 cm³? Work out both boxes.',
    reveal='<b>36 cm³.</b> The new box is 3 × 4 × 5 = 60 cm³ and the old one is 2 × 3 × 4 = 24 cm³. Three growing edges multiply into a lot of new pieces.')
W['u3l5'] = dict(title='How Much Wood?', rule='How many square centimetres of wood is the frame?', strip=strip(srock('🖼️', 170, 8, 2.6, 44)),
    body=BIG('A photo is <b>20 cm</b> by <b>30 cm</b>. A wooden frame <b>5 cm</b> wide goes all the way around it.'),
    nudge='Careful at the corners.',
    reveal='<b>600 cm².</b> The photo and frame together are 30 by 40 = 1200 cm². Take away the 600 cm² photo. (Adding four strips gives 500: that misses the four 5 by 5 corners.)')
W['u4l1'] = dict(title='Ribbon Cutting', rule='What is the longest the pieces can be?', strip=strip(srock('✂️', 140, 14, 1.2, 38), sb('🎀', 210, .3, 38)),
    body=BIG('One ribbon is <b>48 cm</b> long and another is <b>36 cm</b> long. Cut both into pieces that are all the <b>same length</b>, with nothing left over.'),
    reveal='<b>12 cm.</b> 12 is the biggest number that divides both 48 and 36: 4 pieces from one ribbon and 3 from the other. It is their <b>greatest common factor</b>.')
W['u4l2'] = dict(title='The Four-Part Sum', rule='No calculator, no paper. What is the total?', strip=strip(sblink('⚡', 150, 0, 40, 1.2), sblink('⚡', 200, .4, 34, 1.2)),
    body=BIG(T(r'23\times7+23\times3+77\times7+77\times3')),
    nudge='Which parts share a number?',
    reveal=f'<b>1000.</b> The first two parts are {T(r"23\times10")} and the last two are {T(r"77\times10")}. Together that is {T(r"(23+77)\times10=100\times10")}.')
W['u4l3'] = dict(title='The Impossible Sum', rule='Which of these sums is impossible?', strip=strip(sb('🔢', 150, 0, 40), sblink('❓', 210, 0, 32)),
    body=BIG('Two whole numbers multiply to <b>24</b>.') + TILES(4, [('A', 'add to 10'), ('B', 'add to 11'), ('C', 'add to 12'), ('D', 'add to 14')], 30),
    nudge='List every pair that multiplies to 24.',
    reveal='<b>C, 12.</b> The pairs are 1 and 24, 2 and 12, 3 and 8, 4 and 6. Their sums are 25, 14, 11 and 10. Today: that list is the key to factoring.')
W['u5l2'] = dict(title='Which One Depends?', rule='In each pair, which quantity depends on the other?', strip=strip(sb('🔌', 110, 0, 34), sb('🌱', 175, .3, 34), sb('⛽', 240, .6, 34)),
    body=BIG('In each pair, one quantity <b>controls</b> the other.') + TILES(3, [('Phone', 'minutes plugged in<small>and</small>battery level'), ('Plant', 'height<small>and</small>days since planting'), ('Gas', 'cost<small>and</small>litres pumped')], 25),
    reveal='Battery level depends on minutes plugged in. Height depends on days. Cost depends on litres. The one you control is the <b>independent variable</b>; the one that responds is the <b>dependent variable</b>.')
W['u5l3'] = dict(title='Read the Battery Graph', rule='After how many hours does the phone die?', pic=BATTGRAPH, wide=True,
    body=BIG('The graph shows a phone’s battery from the moment you unplug it.'),
    nudge='How full was it at the start?',
    reveal='<b>4 hours</b>, where the line meets the time axis. It started at 80%, where the line meets the battery axis. Those two crossing points are today’s <b>intercepts</b>.')
W['u5l5'] = dict(title='Hey Phone, Call Mom', rule='In which contact list can the phone not tell which number to call?', strip=strip(srock('📱', 150, 14, .8, 40), sb('🗣️', 215, 0, 36)),
    body=BIG('You say: “Hey phone, call <b>Mom</b>.”') + TILES(3, [('List A', 'Mom: 555-0101<br>Dad: 555-0101'), ('List B', 'Mom: 555-0101<br>Mom: 555-0199'), ('List C', 'Mom: 555-0101<br>Dad: 555-0202')], 24),
    reveal='<b>List B.</b> One name with two numbers: the phone can’t decide. Two names sharing one number (a home phone) is fine. A <b>function</b> is a rule where every input has exactly one output.')
W['u5l7'] = dict(title='Pizza Math', rule='Your bill is $22. How many toppings did you get?', strip=strip(sspin('🍕', 170, 6, 40)),
    body=BIG(f'A pizza with {T("t")} toppings costs {T("C(t)=12+2t")} dollars.'),
    nudge=f'What is {T("C(1)")}? {T("C(2)")}?',
    reveal=f'<b>5 toppings.</b> {T("C(t)=22")}, so {T("12+2t=22")} and {T("t=5")}. Going from an output back to its input is <b>solving</b>.')
W['u5l8'] = dict(title='Walk to School', rule='Which graph shows your distance from home?', pic=WALK3, wide=True,
    body=BIG('You walk to school, wait at a red light, then <b>run</b> the rest of the way.'),
    reveal='<b>A.</b> It rises slowly (walking), goes flat (waiting: the distance doesn’t change), then rises steeply (running is faster). B ends slower than it started, and C stops at the end.')
W['u6l1'] = dict(title='Cut Across the Park', rule='How many metres do you save?', strip=strip(sb('🌳', 80, 0, 34), sdrive('🚶', 8, 0, 32, 46), sb('🌳', 270, .5, 34)),
    body=BIG('A rectangular park is <b>60 m</b> by <b>80 m</b>. The sidewalk goes along two sides to the far corner.<small>You cut straight across the grass instead.</small>'),
    nudge='Sketch the park. What shape does your shortcut make?',
    reveal=f'<b>40 m.</b> The sidewalk is 60 + 80 = 140 m. The shortcut is the long side of a right triangle: {T(r"\sqrt{60^2+80^2}=\sqrt{10\,000}=100")} m.')
W['u6l2'] = dict(title='Steepest Ramp', rule='Which ramp is the steepest?', strip=strip(sroad(), sdrive('🛹', 4, 0, 36, 44)),
    body=TILES(4, [('A', '1 m up<br>4 m across'), ('B', '2 m up<br>10 m across'), ('C', '3 m up<br>9 m across'), ('D', '4 m up<br>20 m across')], 26),
    nudge='How much does each one rise for every metre across?',
    reveal='<b>C.</b> For every metre across, A rises 0.25 m, B 0.2 m, C about 0.33 m and D 0.2 m. The tallest ramp is one of the gentlest. That “rise for every 1 across” is the <b>slope</b>.')
W['u6l3'] = dict(title='Quarter Turn', rule='After the turn, how far does it go left or right, and up or down?', strip=strip(sspin('➡️', 170, 4, 36)),
    body=BIG('On a grid, a stick goes <b>3 right</b> and <b>1 up</b>.<small>Turn it a quarter turn (90°) to the left, around its bottom end.</small>'),
    nudge='Try it with a pencil on grid paper.',
    reveal=f'<b>1 left and 3 up.</b> The two numbers swap places and one changes sign. Today: that is why the slopes of perpendicular lines, like {T(r"\tfrac13")} and {T("-3")}, are negative reciprocals.')
W['u6l4'] = dict(title='The Odd Table', rule='Which table is NOT a straight line?', strip=strip(sb('📋', 170, 0, 40)),
    body=TILES(3, [('A', 'x: 0, 1, 2, 3<br>y: 5, 8, 11, 14'), ('B', 'x: 0, 1, 2, 3<br>y: 1, 2, 4, 8'), ('C', 'x: 0, 1, 3, 4<br>y: 10, 8, 4, 2')], 25),
    nudge='Look closely at the x-values in C.',
    reveal='<b>B.</b> Its y-values double instead of changing by the same amount. A goes up 3 every step. C looks uneven, but it drops 2 for every 1 across, even across the gap from 1 to 3.')
W['u7l1'] = dict(title='The Gym Membership', rule='After how many months have you paid $150 in total?', strip=strip(sb('🏋️', 150, 0, 40), srock('💳', 215, 10, 2, 36)),
    body=BIG('A gym charges <b>$30</b> to sign up, then <b>$10</b> every month.'),
    reveal='<b>12 months.</b> 30 + 10 × 12 = 150. The $30 is where the cost starts; the $10 is how fast it climbs. Those two numbers are today’s <b>b</b> and <b>m</b>.')
W['u7l2'] = dict(title='Saving Up', rule=f'Which rule gives your savings {T("s")} after {T("w")} weeks?', strip=strip(sb('🐷', 150, 0, 42), sfloat('🪙', 215, 2.4, 0, 30)),
    body=BIG('You have <b>$40</b> saved. You add <b>$15</b> every week.') + TILES(4, [('A', T('s=40w+15')), ('B', T('s=15w+40')), ('C', T('s=55w')), ('D', T('s=15w'))], 28),
    nudge='How much do you have after 0 weeks?',
    reveal=f'<b>B.</b> At {T("w=0")} you have $40, and only B gives 40. Each week adds 15, so 15 multiplies {T("w")}.')
W['u7l3'] = dict(title='Exactly $24', rule='How many different orders are possible?', strip=strip(sb('🍔', 140, 0, 38), sb('🍟', 200, .4, 38)),
    body=BIG('Burgers cost <b>$4</b> and fries cost <b>$3</b>. You must spend <b>exactly $24</b>.<small>Buying none of one kind is allowed.</small>'),
    reveal=f'<b>3.</b> 6 burgers; 3 burgers and 4 fries; or 8 fries. They are the whole-number points on the line {T("4x+3y=24")}.')
W['u7l4'] = dict(title='Almost Home', rule='What time do you get home?', strip=strip(sroad(), sdrive('🚗', 5, 0, 38, 44), sb('🏠', 305, 0, 34, 2, 3, 40)),
    body=BIG('At <b>3:00 pm</b> you are <b>260 km</b> from home, driving toward home at <b>80 km/h</b>.'),
    reveal='<b>6:15 pm.</b> 260 ÷ 80 = 3.25 hours, which is 3 hours 15 minutes. One point (3:00, 260 km) and one rate (80 km/h) tell you the whole trip.')
W['u7l5'] = dict(title='Stepping Stones', rule='Which point is NOT on the line?', strip=strip(sdrive('🐸', 6, 0, 34, 46, hop=12)),
    body=BIG(f'A straight line goes through {T(r"(0,\ 6)")} and {T(r"(4,\ 0)")}.') + TILES(4, [('A', T(r'(2,\ 3)')), ('B', T(r'(1,\ 5)')), ('C', T(r'(6,\ -3)')), ('D', T(r'(8,\ -6)'))], 28),
    nudge='How do you step from one point to the other?',
    reveal=f'<b>B.</b> The line steps 2 right and 3 down: {T(r"(0,6),\ (2,3),\ (4,0),\ (6,-3),\ (8,-6)")}. At {T("x=1")} the line is at 4.5, not 5.')
W['u7l6'] = dict(title='Who Is Faster?', rule='Who is faster?', strip=strip(sroad(), sdrive('🏃‍♀️', 3.5, 0, 34, 44), sdrive('🏃', 4.5, .6, 34, 44)),
    body=BIG('Ava runs <b>100 m</b> in <b>20 seconds</b>. Ben runs <b>1 km</b> in <b>4 minutes</b>.'),
    nudge='How many metres does each one run in one second?',
    reveal='<b>Ava.</b> Ava: 100 ÷ 20 = 5 m every second. Ben: 1000 m ÷ 240 s ≈ 4.2 m every second. Rates only compare when the units match.')
W['u7l7'] = dict(title='Two Truths and a Lie', rule='Two of these are true. One is a lie. Which one?', strip=LIE,
    body=BIG(f'The line {T("2x+y-6=0")}') + TILES(3, [('A', 'its slope is 2'), ('B', 'its y-intercept is 6'), ('C', 'its x-intercept is 3')], 28),
    nudge='How could you prove it?',
    reveal=f'<b>A is the lie.</b> Solve for {T("y")}: {T("y=-2x+6")}, so the slope is {T("-2")}. Put {T("x=0")} to get 6, and {T("y=0")} to get 3.')
W['u8l1'] = dict(title='Same Price', rule='For how many GB do the two plans cost the same?', strip=strip(srock('📱', 150, 10, 1.6, 40), sb('💸', 215, .3, 36)),
    body=BIG('Plan A: <b>$30</b> a month plus <b>$5</b> per GB of data.<small>Plan B: $50 a month plus $1 per GB of data.</small>'),
    nudge='Make a table: 0 GB, 1 GB, 2 GB…',
    reveal='<b>5 GB:</b> both cost $55. Below 5 GB Plan A is cheaper, and above it Plan B is. On a graph, 5 GB is where the two lines cross.')
W['u8l2'] = dict(title='Sibling Ages', rule='How old is Leo?', strip=strip(sb('👧', 150, 0, 40), sb('👦', 205, .3, 34)),
    body=BIG('Mia is <b>3 years older</b> than her brother Leo. Their ages add to <b>25</b>.'),
    reveal=f'<b>11</b> (and Mia is 14). If Leo is {T("L")}, then Mia is {T("L+3")}, so {T("L+(L+3)=25")}. Swapping Mia’s age for {T("L+3")} is today’s trick: <b>substitution</b>.')
W['u8l3'] = dict(title='Two Orders', rule='How much is one shake?', strip=strip(sb('🍔', 140, 0, 38), sb('🥤', 200, .4, 38)),
    body=BIG('<b>2 burgers and 1 shake</b> cost $17.<small>2 burgers and 3 shakes cost $27.</small>'),
    nudge='What is different about the two orders?',
    reveal='<b>$5.</b> The second order is the first one plus 2 shakes, and it costs $10 more. Comparing the two orders makes the burgers disappear. (A burger is $6.)')
W['u8l4'] = dict(title='Wheels in the Lot', rule='How many motorbikes are there?', strip=strip(sroad(), sdrive('🚗', 5, 0, 36, 44), sdrive('🏍️', 3.6, 1, 32, 44)),
    body=BIG('A parking lot holds only <b>cars</b> and <b>motorbikes</b>. There are <b>20 vehicles</b> and <b>64 wheels</b>.'),
    nudge='What if all 20 were cars?',
    reveal='<b>8 motorbikes</b> (and 12 cars). 20 cars would have 80 wheels, 16 too many. Each motorbike in place of a car takes away 2 wheels, so 8 swaps.')
W['u8l5'] = dict(title='Trail Mix', rule='What should the trail mix cost per kilogram?', strip=strip(sb('🥜', 140, 0, 36), sb('🍇', 200, .4, 36)),
    body=BIG('Nuts cost <b>$12 per kg</b>. Raisins cost <b>$6 per kg</b>.<small>You mix 2 kg of nuts with 1 kg of raisins.</small>'),
    nudge='Is it $9, halfway between?',
    reveal='<b>$10 per kg.</b> The whole mix costs 2 × 12 + 1 × 6 = $30 for 3 kg. It isn’t $9 because there is more of the expensive part.')
W['u9l1'] = dict(title='How Tall Is the Tree?', rule='How tall is the tree?', pic=TREESHADOW, wide=True,
    body=BIG('A <b>2 m</b> post casts a <b>3 m</b> shadow.<small>At the same moment, a tree casts a 15 m shadow.</small>'),
    reveal='<b>10 m.</b> The tree’s shadow is 5 times as long, so the tree is 5 times as tall. The sun hits both at the same angle, so the two triangles are the same shape.')
W['u9l2'] = dict(title='Open the Laptop', rule='Which 10° raises the top edge more?', strip=strip(srock('💻', 170, 14, 2.8, 42)),
    body=BIG('Open a laptop from closed (0°) to straight up (90°). The top edge of the screen rises.') + TILES(3, [('A', 'from 0° to 10°'), ('B', 'from 80° to 90°'), ('C', 'the same')], 28),
    nudge='Try it with a book on your desk.',
    reveal='<b>A, by far.</b> The first 10° lifts the edge about 17% of the screen’s height. The last 10° lifts it only about 1.5%. Today: the sine of an angle climbs fast at first, then slows down.')
W['u9l3'] = dict(title='How Big Is the TV?', rule='How long is the diagonal?', strip=strip(sblink('📺', 170, 0, 44, 2.2, 46, .5)),
    body=BIG('A wide TV screen is <b>120 cm</b> wide and <b>50 cm</b> tall.<small>TVs are sold by the length of the diagonal.</small>'),
    reveal=f'<b>130 cm.</b> {T(r"\sqrt{120^2+50^2}=\sqrt{16\,900}=130")}. Two sides of a right triangle give the third. Today: what if you know one side and an <b>angle</b> instead?')
W['u9l4'] = dict(title='Guess the Angle', rule='What is the angle at the bottom of the ramp?', pic=RAMPANGLE, wide=True,
    body=BIG('No protractor allowed.<small>Everyone guesses. Closest guess wins.</small>'),
    reveal=f'<b>About 23°.</b> The ramp rises 5 for every 12 across. Today we turn two sides into the angle exactly: {T(r"\tan^{-1}\left(\tfrac5{12}\right)\approx22.6^\circ")}.')
W['u9l5'] = dict(title='Draw This Triangle', rule='Which clues are enough to draw exactly one right triangle?', strip=strip(srock('📐', 170, 10, 2.2, 40), sb('✏️', 230, .3, 32)),
    body=BIG('You must draw a <b>right triangle</b> from clues.<small>More than one answer can be right.</small>') + TILES(2, [('A', 'two angles: 30° and 60°'), ('B', 'one side: 5 cm'), ('C', 'the two shorter sides: 3 cm and 4 cm'), ('D', 'the longest side, 5 cm, and one angle, 40°')], 24),
    nudge='Could two people follow the clue and draw different triangles?',
    reveal='<b>C and D.</b> Two sides fix a right triangle, and so does one side with one acute angle. A gives the shape but no size. B gives a size but no shape.')
W['u9l6'] = dict(title='Looking Up, Looking Down', rule='From the boat, how many degrees up from level does someone look to see you?', pic=CLIFFZ, wide=True,
    body=BIG('From the top of a cliff, you look <b>30° down</b> from level to see a boat.'),
    reveal='<b>30°.</b> The two dashed level lines are parallel, so the angle down from the cliff equals the angle up from the boat. Angle of depression = angle of elevation.')
W['u9l7'] = dict(title='The Longest Pencil', rule='What is the longest straight pencil that fits inside, corner to corner?', strip=strip(srock('✏️', 150, 30, 2.4, 36), sb('📦', 215, 0, 40)),
    body=BIG('A box is <b>3 cm</b> by <b>4 cm</b> by <b>12 cm</b>.'),
    nudge='Start with the diagonal across the floor of the box.',
    reveal=f'<b>13 cm.</b> The floor diagonal is {T(r"\sqrt{3^2+4^2}=5")}. That 5 and the 12 cm height make a second right triangle: {T(r"\sqrt{5^2+12^2}=13")}. One triangle hands its side to the next.')
W['u9l8'] = dict(title='Two Truths and a Lie', rule='Two of these are true. One is a lie. Which one?', strip=LIE,
    body=BIG('A right triangle has sides <b>3</b>, <b>4</b> and <b>5</b>. Angle A is opposite the side of length 3.') + TILES(3, [('A', T(r'\sin A=\tfrac35')), ('B', T(r'\cos A=\tfrac45')), ('C', T(r'\tan A=\tfrac43'))]),
    nudge='Sketch it and label opp, adj and hyp.',
    reveal=f'<b>C is the lie.</b> {T(r"\tan A=\tfrac{\text{opp}}{\text{adj}}=\tfrac34")}. Sine and cosine are right.')
W['u10l1'] = dict(title='No Ruler Allowed', rule='About how tall is our classroom door, in centimetres?', strip=strip(sb('🚪', 140, 0, 44, 2, 3), sb('🙋', 210, .3, 38)),
    body=BIG('No ruler, no tape measure. You can use your own body.<small>Everyone guesses. Closest guess wins.</small>'),
    nudge='What part of you is about 1 m? About 10 cm?',
    reveal='Most doors are about <b>200 cm</b> tall (a standard door is 203 cm, or 6 ft 8 in). Something you know the size of, like your hand span or your height, is a <b>referent</b>.')
W['u10l2'] = dict(title='Longest Wins', rule='Which length is the longest?', strip=strip(srock('📏', 170, 10, 2.2, 40)),
    body=TILES(4, [('A', '2.5 m'), ('B', '240 cm'), ('C', '2&nbsp;600 mm'), ('D', '0.0023 km')], 30),
    reveal='<b>C, 2&nbsp;600 mm</b>, which is 2.6 m. The others are 2.5 m, 2.4 m and 2.3 m. A smaller unit gives a bigger number for the same length.')
W['u10l3'] = dict(title='Cereal Box Showdown', rule='Which box holds more cereal?', strip=strip(sb('🥣', 140, 0, 38), sb('📦', 205, .4, 40)),
    body=TILES(2, [('Tall box', '20 cm by 5 cm by 30 cm'), ('Cube box', '15 cm on every edge')], 28),
    reveal='<b>The cube box.</b> Tall: 20 × 5 × 30 = 3000 cm³. Cube: 15 × 15 × 15 = 3375 cm³. Tall, thin boxes look bigger on the shelf.')
W['u10l4'] = dict(title='Tipi Poles', rule='How long is a pole from the top down to the edge of the floor?', strip=strip(sb('⛺', 170, 0, 44, 4, 2.4)),
    body=BIG('A tipi is shaped like a cone. Its floor is a circle with radius <b>3 m</b>.<small>Its top is 4 m above the centre of the floor.</small>'),
    nudge='Sketch a slice straight down through the middle.',
    reveal=f'<b>5 m.</b> The height, the radius and the pole make a right triangle: {T(r"\sqrt{3^2+4^2}=5")}. That slanted length is a cone’s <b>slant height</b>.')
W['u10l5'] = dict(title='Ball in a Can', rule='How much of the can does the ball fill?', pic=BALLCAN,
    body=BIG('A ball fits snugly in a can. It touches the sides, the bottom and the lid.') + TILES(2, [('A', 'less than half'), ('B', 'about half'), ('C', 'about two thirds'), ('D', 'almost all of it')], 24),
    reveal='<b>C, exactly two thirds.</b> Archimedes proved it over 2200 years ago. Today: how that leads to the volume of a sphere.')
W['u10l6'] = dict(title='Which Holds the Least?', rule='Which one holds the least water?', strip=strip(sb('💧', 120, 0, 32), sb('🧴', 180, .3, 38), sb('🥫', 240, .6, 36)),
    body=TILES(3, [('A', 'a 1 litre bottle'), ('B', 'a cube, 10 cm on every edge'), ('C', 'a can 10 cm across and 10 cm tall')], 24),
    reveal=f'<b>C, the can.</b> The bottle and the cube both hold 1000 cm³ (1 L = 1000 cm³). The can holds {T(r"\pi\times5^2\times10\approx785")} cm³: it fits inside the cube with room to spare.')

# ======================= Unit 1 =======================
SPECS['u1l1'] = dict(
    warm=W['u1l1'],
    extra_expl=['rectangles', 'primeFilter'],
    practice=PR('ex3', '1–5', '6–16', 'Factors, primes and composites.', [('1–5', 'Factors, primes and composites')], 4))
SPECS['u1l2'] = dict(
    warm=W['u1l2'],
    extra_cards=['s1b', 's1d', 's2b'], extra_expl=['bags'],
    replace=[('Back to the warm-up: the number of take-home bags had to divide into', 'Share 24 hot dogs and 32 buns into identical take-home bags with nothing left over. The number of bags has to divide into'), ('warm-up: 24 hot dogs, 32 buns', '24 hot dogs, 32 buns')],
    practice=PR('ex2', '1–4', '5–13', 'Find each greatest common factor.', [('1–4', 'Greatest common factor')], 3))
SPECS['u1l3'] = dict(
    warm=W['u1l3'],
    extra_cards=['s1w'], extra_expl=['cubes', 'sides'],
    practice=PR('ex3', '1–3', '4–14', 'Test for perfect squares, then perfect cubes.', [('1', 'Perfect squares'), ('2–3', 'Perfect cubes')], 2))
SPECS['u1l4'] = dict(
    warm=W['u1l4'],
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
    warm=W['u1l8'],
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
    warm=W['u2l1'],
    extra_cards=['s4b', 's5c'], extra_expl=['anatomy', 'fenceNeg'],
    practice=PR('ex4', '1–7', '8–19', 'Vocabulary, negative bases and zero exponents.', [('1–3', 'Vocabulary and repeated multiplication'), ('4–7', 'Evaluating, negative bases and zero exponents')], 5))
SPECS['u2l2'] = dict(
    warm=W['u2l2'],
    extra_cards=['s1b'], extra_expl=['chain', 'check', 'signs', 'varExp'],
    practice=PR('ex3', '1–4', '5–13', 'Product and quotient laws with coefficients.', [('1–4', 'Product and quotient laws with coefficients')], 3))
SPECS['u2l3'] = dict(
    warm=W['u2l3'],
    extra_cards=['s2'], extra_expl=['hops', 'sorter', 'snmuldiv'], replace_all=[('is the tricky part, so picture the exponents on a number line:</p>', 'is the tricky part, so picture the exponents on a number line.</p>')],
    practice=PR('ex3', '1–7', '8–21', 'Use the negative exponent law.', [('1–7', 'The negative exponent law')], 5))
SPECS['u2l4'] = dict(
    warm=dict(pic=CUBE, title='One Million Cubes', rule='How tall is the giant cube?',
              body=BIG('A unit cube is <b>1 cm</b> on each edge.<small>Stack exactly one million of them into one giant cube.</small>'),
              nudge='Taller than you? Taller than the school?',
              reveal=f'<b>100 cm, just 1 metre.</b> {T(r"100\times100\times100=1\,000\,000")}, so each edge is 100 cubes long. That is {T(r"1\,000\,000^{1/3}")}.'),
    extra_expl=['whyRoot', 'minus', 'cube', 'conv2', 'toPow'],
    practice=PR('ex3', '1–7', '8–19', 'Evaluate powers with rational exponents.', [('1–7', 'Evaluating rational-exponent powers')], 5))
SPECS['u2l5'] = dict(
    warm=W['u2l5'],
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
    extra_cards=['s4b'], extra_expl=['polyCheck', 'degree', 'order'],
    practice=PR('ex4', '1–5', '6–19', 'Vocabulary, terms and degree.', [('1–5', 'Vocabulary, terms and degree')], 4))
SPECS['u3l2'] = dict(
    warm=W['u3l2'],
    extra_cards=['s6c'], extra_expl=['distB', 'composite', 'digits', 'subCheck'],
    practice=PR('ex4', '1–10', '11–21', 'Area models and the distributive property.', [('1–10', 'Area models and the distributive property')], 7))
SPECS['u3l3'] = dict(
    warm=W['u3l3'],
    extra_cards=['s1c', 's1d'], extra_expl=['outside', 'combine', 'complete'],
    practice=PR('ex2', '1–2', '3–9', 'The two patterns, then a number out front.', [('1', 'Squares of binomials and sum × difference'), ('2', 'A number out front')], 1))
SPECS['u3l4'] = dict(
    warm=W['u3l4'],
    extra_cards=['s1c', 's2c'], extra_expl=['box', 'check'],
    practice=PR('ex2', '1–4', '5–10', 'Binomial times trinomial.', [('1–4', 'Binomial × trinomial')], 3))
SPECS['u3l5'] = dict(
    warm=W['u3l5'],
    extra_cards=['s1b'], extra_expl=['garden', 'box'])
SPECS['u3l6'] = dict(
    warm=dict(title='The Mind Reader', rule='Do each step in your head. Don’t tell anyone your number.', strip=strip(sb('🔮', 170, 0, 44, 5, 2.2), sblink('✨', 120, 0, 24), sblink('✨', 222, .6, 24)),
              body=BIG('Think of a number. <b>Add 3.</b> <b>Double it.</b> <b>Subtract 4.</b> <b>Halve it.</b><small>Now subtract the number you started with.</small>'),
              nudge='Compare answers with the person beside you.',
              reveal=f'<b>Everyone gets 1.</b> Start with {T("n")}: {T(r"n+3\to2n+6\to2n+2\to n+1")}, and taking away {T("n")} leaves 1.'),
    extra_expl=['classify', 'zeroPairs', 'tileMul', 'foil', 'audit', 'square', 'frame', 'groups', 'grid', 'three', 'complete', 'box'], replace_all=[('four pieces, not two:</p>', 'four pieces, not two.</p>')],
    practice=PR('ex7', '1–8', '9–13', 'Multiple choice from across the unit.', [('1–8', 'Multiple choice')], 6))

# ======================= Unit 4 =======================
SPECS['u4l1'] = dict(
    warm=W['u4l1'],
    extra_expl=['twoWay', 'columns', 'tileRect', 'pullB'],
    practice=PR('ex3', '1–8', '9–23', 'Find the GCF and take it out.', [('1–8', 'Monomial common factors')], 6))
SPECS['u4l2'] = dict(
    warm=W['u4l2'],
    extra_cards=['s1b'], extra_expl=['tileGroup', 'rearrange'],
    practice=PR('ex2', '1–3', '4–9', 'Take out the common binomial factor.', [('1–3', 'Binomial common factors')], 2))
SPECS['u4l3'] = dict(
    warm=W['u4l3'],
    extra_cards=['s2b'], extra_expl=['inspectB', 'tileNeg', 'twoVar', 'inspectC'],
    practice=PR('ex5', '1–8', '9–23', 'Sum and product pairs, then factoring.', [('1–4', 'Algebra tiles and sum–product pairs'), ('5–8', 'Factoring ' + T('x^2+bx+c'))], 5))
SPECS['u4l4'] = dict(
    warm=dict(title='The Prime Suspect', rule='It isn’t even, it doesn’t end in 5, and 3 doesn’t divide it. <b>Is it prime?</b> No calculator.', strip=strip(sdrive('🔍', 6, size=36, flip=False), sb('🕵️', 300, 0, 40)),
              body=BIG('899'), nudge='What friendly number is it very close to?',
              reveal=f'<b>No.</b> {T(r"899=900-1=30^2-1^2=29\times31")}.'),
    extra_cards=['s1b', 's4c'], extra_expl=['zeroMiddle', 'cutMove', 'rink'],
    practice=PR('ex2', '1–4', '5–13', 'Factor each difference of squares.', [('1–4', 'The pattern ' + T('A^2-B^2'))], 3))
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
                   for i, ((a, b), (dx, dy)) in enumerate(zip(zip(pts, pts[1:]), [(-14, -4), (0, 22), (-14, 2), (0, -10), (14, 6), (14, -4)])))
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
    warm=W['u5l2'],
    extra_cards=['s3b'], extra_expl=['linOrNot'],
    practice=PR('ex2', '1–7', '8–17', 'One relation described several ways, then mapping diagrams.', [('1–4', 'One relation, several descriptions'), ('5–7', 'Mapping diagrams')], 5))
SPECS['u5l3'] = dict(
    warm=W['u5l3'],
    extra_cards=['s2b'],
    practice=PR('ex3', '1–3', '4–11', 'Find the intercepts from each equation.', [('1–3', 'Intercepts from an equation')], 2))
SPECS['u5l4'] = dict(
    warm=dict(title='Ride Restrictions', rule='Which of the four friends may ride?', strip=strip(sroad(), sdrive('🎢', 5, 0, 40, 44)),
              body='<div class="vw-q">THE CYCLONE: riders must be <b>at least 120 cm</b> and <b>no taller than 195 cm</b>.</div>' + TILES(4, [('Ava', '118 cm'), ('Ben', '120 cm'), ('Cleo', '160 cm'), ('Dev', '196 cm')], 30),
              reveal='<b>Ben and Cleo.</b> “At least 120” includes exactly 120, so Ben is in. Ava is 2 cm too short and Dev is 1 cm too tall.'),
    extra_cards=['s3b'], extra_expl=['dots'],
    practice=PR('ex3', '1–4', '5–9', 'Domain and range from ordered pairs and graphs.', [('1–4', 'Domain and range')], 3))
SPECS['u5l5'] = dict(
    warm=W['u5l5'],
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
    warm=W['u5l7'],
    extra_expl=['exThree', 'cost'],
    practice=PR('ex3', '1–8', '9–16', 'Convert between notations, then read graphs both ways.', [('1–3', 'Converting between the two notations'), ('4–8', 'Reading a graph in both directions')], 5))
SPECS['u5l8'] = dict(
    warm=W['u5l8'],
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
    warm=W['u6l1'],
    extra_cards=['s2b', 's3b', 's4b'],
    practice=PR('ex4', '1–5', '6–11', 'Lengths of horizontal, vertical and slanted segments.', [('1–5', 'Lengths of segments')], 3))
SPECS['u6l2'] = dict(
    warm=W['u6l2'],
    extra_cards=['s7b'], extra_expl=['order'],
    practice=PR('ex4', '1–2', '3–18', 'Find the rise, the run and the slope.', [('1–2', 'Rise, run and slope')]))
SPECS['u6l3'] = dict(
    warm=W['u6l3'],
    extra_cards=['s2b', 's5b', 's5c', 's5d'],
    practice=PR('ex4', '1–7', '8–25', 'The slope formula, then collinear points.', [('1–4', 'The slope formula'), ('5–7', 'Collinear points')], 5))
SPECS['u6l4'] = dict(
    warm=W['u6l4'],
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
    warm=W['u7l1'],
    extra_cards=['s4c'], extra_expl=['intercepts'],
    practice=PR('ex5', '1–3', '4–14', 'Linear or not? Then read the slope and the y-intercept.', [('1–3', 'Linear or not? Reading ' + T('m') + ' and ' + T('b'))], 2))
SPECS['u7l2'] = dict(
    warm=W['u7l2'],
    extra_cards=['s2b', 's3b', 's3c'],
    practice=PR('ex2', '1–3', '4–14', 'Write the equation of each line.', [('1–3', 'Equations from ' + T('m') + ' and ' + T('b') + ', and from graphs')], 2))
SPECS['u7l3'] = dict(
    warm=W['u7l3'],
    extra_cards=['s1b', 's2b'], extra_expl=['judge'],
    practice=PR('ex2', '1–5', '6–18', 'Into general form, then out of it.', [('1–2', 'Into general form'), ('3–5', 'Out of general form')], 3))
SPECS['u7l4'] = dict(
    warm=W['u7l4'],
    extra_expl=['toMxB', 'race', 'read', 'solve6', 'solve7', 'solve8'],
    practice=PR('ex4', '1–6', '7–24', 'Write and use slope–point form.', [('1–6', 'Slope–point form')], 4))
SPECS['u7l5'] = dict(
    warm=W['u7l5'],
    extra_cards=['s3b', 's5c'],
    practice=PR('ex2', '1–4', '5–11', 'Graph each line without changing its form.', [('1–4', 'Graphing without changing the form')], 3))
SPECS['u7l6'] = dict(
    warm=W['u7l6'],
    extra_cards=['s2b', 's3b', 's4b'],
    practice=PR('ex2', '1–3', '4–9', 'Read each rate of change and write the equation.', [('1–3', 'Rate of change and the equation')], 2))
SPECS['u7l7'] = dict(
    warm=W['u7l7'],
    replace=[(' (traps B and C in the warm-up).', '.')],
    extra_expl=['dials', 'rate'])

# ======================= Unit 8 =======================
SPECS['u8l1'] = dict(
    warm=W['u8l1'],
    extra_cards=['s2b', 's3b', 's3c', 's4b', 's5b', 'ex5c', 'ex7c'],
    practice=PR('ex2', '1–3', '4–10', 'Solve each system by graphing, then check.', [('1–3', 'Solving systems by graphing')], 2))
SPECS['u8l2'] = dict(
    warm=W['u8l2'],
    extra_cards=['s1e', 's3b'],
    practice=PR('ex3', '1–3', '4–11', 'Solve each system by substitution, then check.', [('1–3', 'Solving by substitution')], 2))
SPECS['u8l3'] = dict(
    warm=W['u8l3'],
    extra_cards=['warm2', 's2c', 's4b', 's5b'],
    practice=PR('ex5', '1–4', '5–14', 'Add or subtract directly, then scale first.', [('1–2', 'Adding or subtracting directly'), ('3–4', 'Scaling one or both equations')], 3))
SPECS['u8l4'] = dict(
    warm=W['u8l4'],
    extra_cards=['s1b', 'ex2c', 'ex3c', 'ex4c', 'ex5c'],
    practice=PR('ex3', '1–5', '6–15', 'Introduce variables, form a system, solve and check.', [('1–5', 'Word problems with systems')], 3))
SPECS['u8l5'] = dict(
    warm=W['u8l5'],
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
    warm=W['u9l1'],
    extra_cards=['s4b'],
    practice=PR('ex3', '1–5', '6–12', 'Name the sides, then write the ratios.', [('1–5', 'Naming sides and writing ratios')], 3))
SPECS['u9l2'] = dict(
    warm=W['u9l2'],
    extra_expl=['tan90'],
    practice=PR('ex3', '1–5', '6–12', 'Calculator values, then how the ratios change.', [('1', 'Calculator values'), ('2–4', 'Why the ratios grow or shrink'), ('5', 'Comparing ratios without a calculator')], 3))
SPECS['u9l3'] = dict(
    warm=W['u9l3'],
    extra_cards=['warm2', 's2c', 's3b', 's3c', 's4b'],
    practice=PR('ex5', '1–6', '7–14', 'Find each missing side.', [('1–6', 'Finding a missing side')], 4))
SPECS['u9l4'] = dict(
    warm=W['u9l4'],
    extra_cards=['s1b'],
    practice=PR('ex2', '1–7', '8–16', 'Inverse ratios, then an angle from two sides.', [('1–2', 'Inverse trigonometric ratios'), ('3–7', 'An angle from two known sides')], 4))
SPECS['u9l5'] = dict(
    warm=W['u9l5'],
    extra_cards=['s3e'],
    practice=PR('ex2', '1–6', '7–14', 'Choose the tool, then find each measure.', [('1–6', 'Choosing the right tool')], 3))
SPECS['u9l6'] = dict(
    warm=W['u9l6'],
    extra_cards=['s2b', 's3c', 's5b'],
    practice=PR('ex3', '1–5', '6–11', 'Eye level, elevation and depression.', [('1–5', 'Multi-step problems')], 3))
SPECS['u9l7'] = dict(
    warm=W['u9l7'],
    extra_cards=['s2c', 's4b'],
    practice=PR('ex3', '1–3', '4–11', 'Two right triangles sharing a side.', [('1–3', 'Two right triangles sharing a side')], 2))
SPECS['u9l8'] = dict(
    warm=W['u9l8'],
    extra_cards=['s7'], extra_expl=['cofunction'])

# ======================= Unit 10 =======================
SPECS['u10l1'] = dict(
    warm=W['u10l1'],
    extra_expl=['towel', 'shed', 'wheel', 'card', 'km'],
    practice=PR('ex3', '1–4', '5–18', 'Referents and estimating.', [('1–4', 'Referents and estimating')], 3))
SPECS['u10l2'] = dict(
    warm=W['u10l2'],
    extra_cards=['s4b'], extra_expl=['twoways', 'heights', 'roundup'],
    practice=PR('ex3', '1–7', '8–23', 'The metric number line, proportions and unit analysis.', [('1–7', 'SI review')], 4))
SPECS['u10l3'] = dict(
    warm=W['u10l3'],
    extra_cards=['s4c', 's7b'],
    practice=PR('ex4', '1–5', '6–16', 'Volume and capacity units, then surface area and volume.', [('1', 'Volume and capacity units'), ('2–5', 'Surface area and volume')], 3))
SPECS['u10l4'] = dict(
    warm=W['u10l4'],
    extra_cards=['ex1n'], extra_expl=['hex', 'scale', 'shed'],
    practice=PR('ex2', '1–6', '7–18', 'Pyramids and cones.', [('1–6', 'Pyramids and cones')], 4))
SPECS['u10l5'] = dict(
    warm=W['u10l5'],
    extra_cards=['s1b', 's1d', 's2b', 's2c', 's2e'],
    practice=PR('ex3', '1–4', '5–16', 'Spheres and hemispheres.', [('1–4', 'Spheres and hemispheres')], 3))
SPECS['u10l6'] = dict(
    warm=W['u10l6'],
    extra_expl=['sizeUp', 'wrench'])
