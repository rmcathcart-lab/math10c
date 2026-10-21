# Math History boxes

Ryan likes to bring math history into lessons — **only** where there is a genuinely good, interesting piece of history (or
a real fun fact) that is relevant to the math of that lesson. Not every lesson gets one. Each one is a brown "old paper"
card with a short story, one question for the class, and a small animation. The model is Lesson 1.2 (`lessons/u1/l2/`,
the cicadas: 13 and 17 → LCM 221 → 1803, 2024, 2245) — read its card in `index.html` and `cicadaTimeline()` at the end
of `lessons/js/lessons/u1l2.js` before making one.

## The card (markup)
```html
<!-- ================= Math History box (brown) ================= -->
<section class="card history" data-ink="hist" data-section="Math History: <short name>">
  <div class="hist-head"><span class="hist-tag">Math History</span><span class="hist-dates">c. 300 BCE</span></div>
  <div class="hist-grid">
    <div class="hist-text">
      <h3 class="hist-title">A short, vivid title</h3>
      <p>Two or three short paragraphs: who, when, what they did, and how it is exactly this lesson's math.</p>
      <div class="part hist-q"><div class="pl">One question the class can answer with today's math.</div>
        <div class="ansrow"><button class="reveal">Answer</button><div class="ans">The worked answer.</div></div></div>
    </div>
    <figure class="hist-anim">
      <svg id="<lesson>-hist" viewBox="0 0 600 300" role="img" aria-label="What the animation shows"></svg>
      <figcaption><button class="hist-play" type="button">Replay</button><span>Tap the picture to play it again.</span></figcaption>
      <p class="hist-note">Optional: one more sentence (a source of doubt, a modern echo).</p>
    </figure>
  </div>
</section>
```
- `.card.history`, `.hist-*` styles are shared (end of `lessons/css/site.css`) — don't change them. Put the animation's own
  styles in the lesson's CSS file (`lessons/css/lessons/<id>.css`), with class names prefixed for that lesson.
- `data-ink="hist"` must be unique on the page (use `hist2` if a page ever has two). Don't change any other card.
- Place it right after the part of the lesson it belongs to (after the section/example that teaches that math), never
  inside the warm-up or between an example and its parts.
- **One screen:** the card must fit in 684 px of height at 1180 × 746 (the iPad), answer shown. Keep text tight.
- Ink stays put: the answer uses the shared `.part` / `.reveal` / `.ans` pattern (hidden answers keep their space).

## The animation
- An inline SVG drawn by a small function at the end of the lesson's JS file (`lessons/js/lessons/<id>.js`), like
  `cicadaTimeline()`: build the SVG with `createElementNS`, play once when the card scrolls half into view
  (IntersectionObserver), replay on a tap of the picture or the Replay button, and with `prefers-reduced-motion` show the
  finished picture without motion. 8–14 seconds is plenty; pause on the key moment. No libraries, no external files.
- Same palette: browns/parchment (`#7a4a26`, `#4a2c14`, `#b07a12` gold for the key moment, `#fffaf1` panel). Prime colours
  on Unit 1 pages match the lesson (2 `#3b78d8`, 3 `#e0841a`, 5 `#8a58c9`, 7 `#d0477a`, 13 `#0f8a8a`, 17 `#b0563a`).
- Text in the SVG: at least 12 px at viewBox scale; headings in Georgia/serif like `.ci-year`.

## Facts
- **Every fact must be checked** (web search) against good sources (encyclopedias, museums, universities, NASA, etc.).
  Keep the source URLs in a comment above the card: `<!-- sources: … -->`.
- Legends are told as legends ("The story goes…", "Legend says…"). Hypotheses are "one idea is…". No made-up quotes.
- Numbers in the box must be right (dates, values). If the history is shaky or only loosely tied to the lesson, skip it.
- Plain language a Grade 10 student reads easily; Canadian spelling.

## Where they are
| Lesson | Story |
|---|---|
| 1.1 | Euclid: multiply the primes and add 1, so the primes never run out (30 031 = 59 × 509) |
| 1.2 | Cicadas every 13 and 17 years meet every LCM = 221 years (1803, 2024, 2245) |
| 1.3 | Chasing π with fractions: Archimedes' 22/7, Zu Chongzhi's 355/113 |
| 1.5 | √2 on the Babylonian tablet YBC 7289 (base 60, right to 5 decimal places) |
| 2.1 | The chessboard full of wheat (legend): 2⁶³ on the last square, 2⁶⁴ − 1 in all |
| 2.4 | Archimedes' Sand Reckoner: at most 10⁶³ grains fill the universe |
| 3.3 | (a + b)² as a square: Euclid II.4 and al-Khwarizmi completing the square |
| 4.3 | Fermat's factoring by difference of squares (2 027 651 281 = 44 021 × 46 061) |
| 5.1 | Descartes, La Géométrie (1637) and the fly on the ceiling (legend) |
| 5.7B | Leibniz's word "function" (1673), Euler's f(x) (1734) |
| 6.4 | Recorde's equals sign (1557): two parallel lines of one length |
| 8.3 | The Nine Chapters: elimination with counting rods |
| 9.1 | How a bowstring became "sine" (jyā → jība → jayb → sinus) |
| 9.2 | Hipparchus, the first trig table (chords, radius 3438; sin 30° = 1719 ÷ 3438) |
| 9.3 | Aristarchus and the half-moon triangle: Sun ÷ Moon = 1 ÷ cos θ (87° → 19; 89.85° → 382) |
| 9.6 | Measuring Everest with angles of elevation (29 002 ft, 1856) |
| 10.2 | The Egyptian royal cubit: a forearm made official |
| 10.4B | The Gimli Glider (Air Canada 143, 1983): pounds instead of kilograms |
| 10.8 | Archimedes' sphere and cylinder on his tomb (2/3) |
