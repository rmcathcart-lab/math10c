# One-screen lessons (11-inch iPad)

Ryan presents from an **11-inch iPad in landscape in Safari**: about **684 px of lesson height** is visible under the
toolbar (viewport 1180 × 746, lesson at scale 1, 1080 px wide). Every lesson has `<main class="lesson screen">`.
Every unit has been converted (2026-10-20); Unit 1 (1.1–1.7) is the model — look at `lessons/u1/l2/`, `u1/l4/`, `u1/l5/` before starting.

## What `screen` does already (shared code — don't edit these files)
- `js/explain.js`: every explainer puts its number chips, caption and controls in a 268 px column to the right of the
  picture (the stage is ~735 px wide instead of ~966), and a finger tap on the picture does Next.
  - per explainer: `side: false` keeps the old layout; `tap: false` turns tap-to-next off (only needed when the picture
    has its own tap targets that aren't buttons / `[data-tap]`).
  - `minW: N` in an explainer's definition: the picture is drawn N px wide and the whole stage is scaled down to fit.
    For a definition made by a factory (`const vennG = vennDef(...)`), the line after it is `vennG.minW = N;`.
    Smallest value that works — text shrinks with the scale.
- `css/site.css`: the shared `.wf` warm-up layout (end of the file).

## The warm-up: fit the start state in 684 px
The class should see the visual **and** every question (Q1–Q3 and "The big one") at once while attendance is taken.

Markup pattern (see Unit 1):
```html
<section class="card warm wf" data-ink="warm" data-section="…" style="--wf-side: 300px">
  <div class="wf-head"><span class="badge warm-b">Warm-up</span><h2>Title</h2>
  <p class="wf-rule">The one-paragraph setup (was <p class="big">).</p></div>
  <div class="wf-grid"><div class="wf-main">
    … the visual / interactive …   (+ questions that fit under it)
  </div><div class="wf-side">
    … questions …
    <div class="poll wf-poll"> … The big one … </div>
  </div></div>
  … follow-up material that comes after the big one may sit here, below the first screen …
</section>
```
- Move existing elements; **don't change ids, data-* hooks or classes the lesson JS uses**, and keep all the content
  (wording may be tightened only if it's needed to fit — say so in your report).
- Shrink things in a "one screen" block at the end of the lesson's CSS file, every rule scoped with `.wf`
  (e.g. `.wf .lk { width: 27px }`). Typical sizes: question text 17–17.5 px, `.q-num` 28–30 px, poll options 4 across.
- A warm-up that fits in a single column can just be tightened: `class="card warm wf wf-one"` with no grid (1.6B).
- If the lesson JS hard-codes sizes for the warm-up visual (e.g. `const CW = 140`, `BW = 470`), make it read the
  size from the element (`el.offsetWidth`, `host.clientWidth`) so CSS can shrink it — see u1l5.js / u1l6a.js.
- **Ink must stay put.** Ink is stored per card by position, so revealing an answer must never move content above or
  beside it. Hidden question answers keep their space (`visibility: hidden`, as the lessons already do) — do NOT
  switch them to `display: none`. Only something at the very bottom of a column (usually the poll answer) may
  collapse while hidden, e.g. `.wf .wf-poll:not(.revealed) .poll-ans { display: none; }`. Wrong poll options stay.
- Revealed answers may make the card taller than one screen; that's fine (they come after attendance).

## Explainers
`tests/apply_minw.py` already added a `minW` to every explainer that `tests/screen_fit_check.py` found cramped
(text clipped or overlapping at the sidebar width but not at full width). Still look at every one:
`python3 tests/screen_shots.py ex OUT uN/lM` → contact sheets of each explainer at its first and last step.
Fix anything cut off, overlapping or unreadable: raise/add `minW`, or (better, when it's simple) make the drawing
use the width it's given. Explainers taller than 684 px ("TALL"): trim empty stage space (`height`) if there is any.

## Checking every choice
`screen_fit_check.py` only steps each explainer's first number choice. `python3 tests/fit_choices_minw.py out.json uN/lM …`
steps every choice at every step and prints the smallest minW that matches the full-width picture for each one that's
cramped (plus any caption maths too wide for the sidebar); `python3 tests/apply_minw.py out.json` writes those values in
(it follows renamed definitions and factory-made ones; it prints any it can't place, to set by hand).

## Checking
- `python3 tests/screen_fit_check.py uN/lM …` → warm-up height (start state) + cramped/tall explainers + page errors.
- `python3 tests/screen_shots.py warm OUT uN/lM …` → the warm-up as one screen (red line = bottom of the screen).
- Click through the warm-up's buttons once (reveals, toggles) and check nothing errors and nothing jumps.
- Static server: `python3 -m http.server 8811` from the repo root (one is usually running already).
