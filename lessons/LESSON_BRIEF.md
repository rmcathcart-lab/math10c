# Brief: build one Math 10C teaching lesson page

Ryan (high-school math teacher, Alberta) projects these pages from his iPad, writes on them with an Apple Pencil, and
steps through explainer animations while he teaches. He loves the existing lessons; **keep that calibre and the same
richness (6–10 explainers per lesson, fewer only for a genuinely short lesson)**. This brief is the lean version of the
process: read the little you need, reuse the shared blocks, test with the dump script, stay within the testing budget.

Repo `/home/claude/math10c` (pages in `lessons/`, live at https://rmcathcart-lab.github.io/math10c/lessons/). Serve the
REPO ROOT (a server is usually on http://localhost:8766/; else `cd /home/claude/math10c && nohup python3 -m http.server 8766 &`).
File paths below are relative to `lessons/`. Don't run git. Don't edit shared files (`js/*.js` except your lesson file,
`css/site.css`, `css/blocks.css`, `index.html`, other lessons, `../js/catalog.js`, `../tests/`); if you need a shared
change, describe it in your report.

## Read (in this order, nothing more unless you're stuck)
1. The unit addendum you were given (ids, outcomes, conventions, sources).
2. `BLOCKS.md` (180 lines) — the shared building blocks. Use them for graphs, number lines, tables, arrow diagrams,
   flowcharts, triangles, stamps/check cards, multiple choice (`.bk-mc`), numerical response (`.bk-nr`), guess-first polls,
   tap-to-reveal cells, flip cards and warm-up answer toggles. Copy patterns from `dev/blocks.html` + `js/dev/blocks-demo.js`.
3. ONE reference lesson for page anatomy and tone: the HTML of the page named in the addendum (skim; don't read its JS
   except one explainer to see the style). The anatomy is summarized below.
4. `js/explain.js` lines 1–140 only (the Explainer API) if BLOCKS.md doesn't answer a question.

## Page anatomy (copy the `<head>` and closing script block from the reference page)
- Hero card: kicker, title, lede, "I can…" list, outcome box. Warm-up card (interactive version of the bell-ringer: guess-first
  poll with reveal, tappable reveals). Section cards (`.sec-h` badge + heading) with `.def` callouts, explainers
  (`<div class="explainer" data-explainer="key">`), tips (`.tip.watch` "Watch out", `.tip.calc-tip` with "Show me"
  `data-keys` buttons), "Think" questions. Example cards: every booklet example, `.parts` grid of `.part`
  (`.pl` label, `.work` space with `--h`, `.ansrow` with `.reveal` button + `.ans`), "+ More space" button. Summary card
  ("Key ideas", 4 tiles), assignment link card `../../../#/lesson/<id>`, next-lesson card.
- Every card that takes ink has a unique `data-ink="<id>"`; cards in the ••• Jump menu have `data-section="<name>"`.
- Boot: `import { boot } from '../../js/ui.js'; import '../../js/lessons/<id>.js'; boot({ key: '<id>', homeHref: '../../', title: 'N.M Short Title' });`
- Optional lesson CSS `css/lessons/<id>.css` — prefix every class with your lesson id. Never style bare `span`
  descendants of anything that can contain KaTeX (it stacks/capitalises the math); use classes.

## Explainers — where the quality comes from
- Explainer API: `{ title, height, choices, custom, intro, make(stage, value, ex) → steps [{cap, run(c)}] }`; mount with
  `mountExplainers({ key: def, … })` (blocks.js) or the pattern in the reference lesson. Animate only via `c` (blocks take `c`).
- One explainer per idea that can be SEEN; captions short, plain, for the class to read on a projector, key words bold.
- Chips: concept demos plus "Example N check:" chips that replay the booklet example's own numbers (so Ryan can check the
  class's work after doing it by hand). **Never** use assignment questions in chips (homework would be given away).
- Fixed stage heights; nothing above a work area may change height when an explainer runs (ink must not shift).
- Captions are computed before their step runs: compute numbers in `make()`.
- Use the blocks wherever they fit, and write custom visuals whenever a concept needs something the blocks don't do —
  variety matters more than uniformity. Blocks expose their SVG layers/transforms so you can draw custom things on them.

## Content rules
- Recreate ALL the booklet's notes and examples (not the assignment). Every Answer matches the solutions file; recompute
  answers yourself (python/sympy/node). Report booklet errors; never fix them silently.
- Math always in KaTeX (`tex()` / `<span class="tex">`): never visible "x^2". Numbers ≥ 1000 with a thin space (`fmt()`).
- Projector-readable (≥ 17 px), fixed 1080 px layout (design for ~1000 px content). Interactive things are `<button>`s or
  have `data-tap` (finger AND Pencil).
- Calculator: the class scientific calculator is the TI-30XIIS (built into every page; `data-keys` demos; KEYMAP tokens:
  digits `÷ × + − ^ ( ) = √ ˣ√ x² x³ x⁻¹ π (−) F◂▸D ab/c d/e EE sin cos tan sin⁻¹ cos⁻¹ tan⁻¹`; use `(−)` for
  negatives; the emulator is in degree mode and `sin` opens a bracket like the real one, e.g. `8 × tan 40 ) =`). The emulator matches the real
  calculator (e.g. a negative base with a fractional exponent is a DOMAIN error unless the exponent is 1/odd).

## Testing (budget: aim for ≤ 3 dump runs and ≤ ~12 images viewed in total)
1. Teacher mode is automatic in the dump script. Run
   `cd /home/claude/math10c && python3 tests/explainer_dump.py <unit>/<lesson> --sheets --calc --out=/tmp/claude-0/<id>`
   It steps every explainer chip, writes `<out>/<unit>-<lesson>.txt` (every caption and visible stage text, math as LaTeX,
   calculator demo results) and one contact-sheet PNG per explainer, and lists problems (console errors, KaTeX problems,
   raw math text, caption/stage overflow, explainers that don't finish). Fix every listed problem.
2. LOOK at each contact sheet (one image per explainer) and fix anything ugly, overlapping, clipped or wrong. Take a few
   full-page screenshots at 1180×820 (all answers shown: add class `shown` to every `.part`) for the static cards.
3. Read the `.txt` once and check every number/expression in the captions against your own computation.
4. Re-run the dump after fixes. Only take extra step-by-step screenshots to debug a specific problem.

## Report back (concise)
Files created; explainers (one line each); how you verified answers; booklet errors/doubts with exact locations; shared
changes you'd recommend; anything you couldn't do.
