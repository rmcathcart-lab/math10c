# Brief: build one Math 10C teaching lesson page (Unit 1)

> **Repo:** these lesson pages now live in the combined repo **rmcathcart-lab/math10c**, folder `lessons/`
> (site: https://rmcathcart-lab.github.io/math10c/lessons/). The old `math10c-teaching` repo only redirects here.
> Publishing: push `main` to both `main` and `gh-pages` (Pages builds from `gh-pages`).
> After adding a lesson page, also add its id to `HW.TEACHING.lessons` in `js/catalog.js` (repo root) so the practice
> site shows its Lesson card and sidebar button.


You are building ONE lesson page for Ryan's (a high-school math teacher in Alberta) "Math 10C Teaching" site:
the `lessons/` folder of the `math10c` repo (clone at `/home/claude/math10c`; served live on GitHub Pages). Serve the
REPO ROOT, not `lessons/` (pages load the shared calculator and KaTeX from the root): `cd /home/claude/math10c && nohup python3 -m http.server 8765 &`,
then open http://localhost:8765/lessons/u1/lN/. File paths below are relative to `lessons/`.

Ryan projects these pages from his iPad, writes on them with an Apple Pencil, and steps through explainer animations
while he teaches. He loved Lesson 1 — "make sure you do them to the same calibre you did for lesson 1, because lesson 1
looks awesome". Lesson 1 is the reference for EVERYTHING: structure, tone, density, interactivity, visual polish.

## Study first (read these fully before writing anything)
- `u1/l1/index.html` — the page structure and every CSS class pattern (hero card with kicker/title/lede/"I can…"/outcome,
  warm-up card, section cards with `.sec-h` badge, `.def` callouts, `.explainer` blocks, `.tip.watch` and `.tip.calc-tip`
  with "Show me" `data-keys` buttons, example cards with `.parts` grids of `.part` (label `.pl`, `.work` space with
  `--h`, `.ansrow` with `.reveal` button + `.ans`), "+ More space" buttons, summary card with an assignment link).
- `js/lessons/u1l1.js` — how explainers are written (`{ title, height, choices, custom, intro, make(stage, value, ex) → steps }`),
  animation helpers (`c.anim`, `c.pop`, `c.fadeIn`, `c.shake`, `c.sleep`), positioning (`add`, `at`, class `c` = centered),
  and interactive widgets (warm-up gift boxes, FactorTree, poll reveal, fill-in blanks).
- `js/explain.js` — the `Explainer` stepper, `FactorTree`, helpers (`factors`, `isPrime`, `primeFactors`, `expHTML`, `fmt`, `decimal`…).
- `js/tex.js` — NEW: KaTeX math. `tex('\\sqrt[3]{54}')` returns HTML; any element with class `tex` (text = LaTeX) is typeset
  at page boot. Use it for radicals, fractions, repeating bars (`0.\\overline{36}`), exponents, set symbols (`\\mathbb{Q}`, `\\overline{Q}`)…
  To use KaTeX the page must include, in `<head>`:
  `<link rel="stylesheet" href="../../../assets/katex/katex.min.css">` and `<script src="../../../assets/katex/katex.min.js"></script>`
  (KaTeX and the calculator `../../../js/calc.js` are shared with the practice site at the repo root).
- `css/site.css` — all shared styles. `js/ui.js` — toolbar, calculator demo key spec (KEYMAP: digits, ÷ × + − ^ ( ) = √ ˣ√ x² x³ x⁻¹ π (−) F◂▸D ab/c d/e).
  Example: `data-keys="3 ˣ√ 64 ="` shows the TI-30XIIS x-th root. `data-keys="√ 50 ="`.
- `js/ink.js` — DON'T change. Every card is a writing surface via a unique `data-ink="<id>"`; every card that should be in
  the ••• Jump menu gets `data-section="<name>"`.

## Your sources (Ryan's own booklet, LaTeX)
- `/home/claude/src/u1/u1_L0X.tex` — the lesson (notes + examples). Recreate ALL of its notes and examples (not the assignment).
- `/home/claude/src/u1/u1_L0X_warmup.tex` — the bell-ringer warm-up (page 1 = board, page 2 = teacher notes). Turn it into an
  interactive warm-up card like Lesson 1's "Unwrap the Number" (guess-first poll with reveal, tappable reveals, etc.).
- `/home/claude/src/u1/solutions-source/u1_L0X_ann.tex` — the worked solutions. Every example part's "Answer" must match these.
  Recompute each answer yourself too (node/python) and fix nothing silently — if the booklet looks wrong, say so in your report.

## What to build
1. `u1/lN/index.html` (N = your lesson id: l2, l3, l4, l5, l6a, l6b, l7) — copy the `<head>` of `u1/l1/index.html` (fix the
   title/description; add the KaTeX link+script), same body structure, ending with:
   ```html
   <script type="module">
     import { boot } from '../../js/ui.js';
     import '../../js/lessons/u1lN.js';
     boot({ key: 'u1lN', homeHref: '../../', title: '1.N Short Title' });
   </script>
   ```
   (and the same service-worker line). Hero card: kicker "Math 10C · Unit 1 Number · Lesson N", the lesson title, a lede,
   "I can…" goals, and the outcome box. Outcomes (Alberta program of studies wording):
   - AN1 — Demonstrate an understanding of factors of whole numbers by determining the prime factors, greatest common factor,
     least common multiple, square root and cube root.
   - AN2 — Demonstrate an understanding of irrational numbers by representing, identifying and simplifying irrational
     numbers, and by ordering irrational numbers.
   (L2: AN1. L3, L4, L6A, L6B: AN2. L5: AN2 and AN1. L7: AN1 and AN2.)
2. `js/lessons/u1lN.js` — your explainers and widgets. Import from `../explain.js` and `../tex.js`.
3. Optional `css/lessons/u1lN.css` for lesson-specific styles (link it in the page head). Reuse site.css classes first.

## The calibre bar (what made Lesson 1 great — match or beat it)
- **Explainer animations wherever a concept can be SEEN**: Lesson 1 has ~7 (factor rectangles of tiles, factor rainbow arcs,
  Sieve of Eratosthenes, "Is it prime?" test up to √n with a verdict stamp, prime factors vs product of primes, division
  ladder, tap-to-split factor tree). Aim for 5–8 genuinely illuminating ones per lesson (fewer for a short lesson, but every
  key idea should have a visual). Ideas for your lesson are below — use them or better ones.
- Each explainer is teacher-paced (Next / Back / Play), has a caption per step written for the class to read on the projector
  (short, plain, bold the key words), and usually number chips including "Example N check:" chips that replay the example's
  own numbers so Ryan can check the class's work AFTER doing it by hand (examples themselves are for him to work by hand).
- **Every example from the booklet** gets an example card with all its parts, dotted `.work` space sized for the work
  (taller for multi-step), an Answer button per part (answers from the solutions TeX; short worked line + bold final answer),
  and "+ More space".
- Improve the lesson where it helps: "Watch out" tips for common mistakes, a "Think" question, quick-reference cards,
  calculator tips with "Show me" key demos wherever the TI-30XIIS is relevant (roots, decimals, F◂▸D fraction conversion, checking).
- Summary card ("Key ideas", 4 tiles) + an assignment link card to the practice site:
  `../../../#/lesson/u1lN` (the practice site is the root of the same repo) ("Assignment N — <title>", "Practice on the Math 10C Practice site"),
  and a "Next lesson →" link to the next lesson page if there is one (`../lM/`).
- Math must LOOK like math: use KaTeX (`tex`) for radicals, fractions, repeating bars, set names. Numbers ≥ 1000 use a thin
  space like the booklet ("3 432") — `fmt()` does this.
- Layout: the lesson is laid out at a fixed 1080 px width (scaled to fit smaller screens), so design for ~1000 px of content.
  Explainer stages have a FIXED height (ink must not shift), and nothing above a work area should change height when an
  explainer runs. Keep everything readable on a projector (≥ 17 px text; big numbers in stages).
- Interactions must work by finger AND Apple Pencil tap: interactive things are `<button>`s or have `data-tap`.
- No external network resources besides what's in the repo. No new dependencies.

## Rules
- Only create/edit YOUR files: `u1/lN/index.html`, `js/lessons/u1lN.js`, `css/lessons/u1lN.css`. Do NOT edit shared files
  (explain.js, ui.js, ink.js, share.js, tex.js, site.css, the home index.html, Lesson 1) and do NOT run any git commands.
  If you truly need a shared change, describe it in your report instead.
- Test in Playwright (python, `from playwright.async_api import async_playwright`; Chromium is preinstalled — never run
  `playwright install`). Before loading the page set teacher mode so the pen tools show:
  `localStorage.setItem('ink:teacher', JSON.stringify('X'))` then reload. Check: zero console errors; every explainer steps
  from 0 to the end (click Next with ~1.5 s waits, or click Next twice quickly — a click during an animation completes it);
  screenshot each explainer mid-way and at the end and LOOK at the screenshots (Read tool) and fix anything ugly, overlapping,
  clipped or wrong; screenshot the whole page in parts at 1180×820 and check it; check KaTeX renders.
  Put scratch files/screenshots in `/tmp/claude-0/<your lesson id>/`.
- Verify every number in captions and answers (compute them).

## Report back (concise)
Files created; list of explainers/interactive pieces; how you verified answers; any booklet errors or doubts; any shared-file
change you'd recommend; anything you couldn't do.
