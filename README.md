# Math 10C Teaching

Math 10C lessons built to be projected from an iPad and written on with an Apple Pencil.

**Site:** https://rmcathcart-lab.github.io/math10c-teaching/ (GitHub Pages builds from the `gh-pages` branch: push `main` to both `main` and `gh-pages`).

## What's on a lesson page

- **Ink everywhere.** Every card is a writing surface: the Apple Pencil writes, a finger scrolls, a Pencil tap on a button presses it. Pen (4 colours, 3 sizes, pressure-sensitive), highlighter, stroke eraser, laser pointer (fades), hand (Pencil scrolls). Undo/redo, or a two-finger tap to undo. Ink is saved on the device per lesson; clear it from the ••• menu.
- **Explainers** step through with Next / Back / Play, at the teacher's pace. Most let you pick the number (including the example's number, to check the work after doing it by hand).
- **Examples** have dotted work space for each part, an Answer button per part, and "+ More space".
- **Board** opens a blank grid page; **Calc** opens the TI-30XIIS-style calculator from the Math 10C Practice site. "Show me" buttons press the keys on the calculator one at a time.

## Code map

- `js/ink.js` — the Pencil ink engine (SVG layer per `[data-ink]` element, strokes stored in a 1000-unit-wide coordinate system so they scale with the page). Uses [perfect-freehand](https://github.com/steveruizok/perfect-freehand) (MIT) for pressure strokes.
- `js/ui.js` — toolbar, menu, board, calculator wiring and key-press demos (`data-keys="91 ÷ 7 ="`).
- `js/explain.js` — the step-through explainer framework (`Explainer`), the tap-to-split `FactorTree`, number helpers.
- `js/lessons/u1l1.js` — Unit 1 Lesson 1's explainers.
- `js/calc.js`, `css/calc.css` — copied from `math10C-practice`.
- `u1/l1/index.html` — the lesson page.

## Adding a lesson

1. Copy `u1/l1/index.html` to `uN/lM/index.html`; every card that should take ink gets a unique `data-ink` id and a `data-section` name for the Jump menu.
2. Write `js/lessons/uNlM.js` with explainer definitions (`{ title, height, choices, intro, make(stage, value, ex) → steps }`) and mount them on `[data-explainer]` elements.
3. Call `boot({ key: 'uNlM', title: '…' })` and add the lesson to `index.html`.
