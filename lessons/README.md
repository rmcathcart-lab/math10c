# Math 10C Teaching

Math 10C lessons built to be projected from an iPad and written on with an Apple Pencil.

**Site:** https://rmcathcart-lab.github.io/math10c/lessons/ — part of the combined `math10c` repo (practice site at the root, lesson pages here). GitHub Pages builds from the `gh-pages` branch: push `main` to both `main` and `gh-pages` (see the root README).

## What's on a lesson page

- **Ink everywhere.** Every card is a writing surface: the Apple Pencil writes, a finger scrolls, a Pencil tap on a button presses it. Pen (4 colours, 3 sizes, pressure-sensitive), highlighter, stroke eraser, laser pointer (fades), hand (Pencil scrolls). Undo/redo, or a two-finger tap to undo. Ink is saved on the device per lesson; clear it from the ••• menu.
- **Explainers** step through with Next / Back / Play, at the teacher's pace. Most let you pick the number (including the example's number, to check the work after doing it by hand).
- **Examples** have dotted work space for each part, an Answer button per part, and "+ More space".
- **Board** opens a blank grid page; **Calc** opens the TI-30XIIS-style calculator from the Math 10C Practice site. "Show me" buttons press the keys on the calculator one at a time.

## Live notes for students

With `inkApi` set in `js/config.js` (the /exec URL of `backend/Code.gs`, an Apps Script bound to a Google Sheet):

- The teacher signs in once per device (••• → Teacher → teacher key; `setup()` in the script prints it), then picks a class in the ••• menu. The page becomes `?class=B` and every stroke, erase, undo and "+ More space" is sent to that class's tab in the sheet. Unsent changes wait on the device until they're saved.
- Students open the class link (or scan the QR from ••• → Show the class link as a QR code). Their page is view only and checks for new ink every few seconds. Each class keeps its own notes; clearing the ink clears only that class.
- The lesson is laid out 1080 px wide and scaled to fit the screen, so ink lines up with the content on every device.
- Testing locally: `node backend/mock_server.js 8790` (teacher key TEST01) and in the browser console `localStorage.setItem('ink:api', JSON.stringify('http://localhost:8790/'))`.

## Code map

- `js/ink.js` — the Pencil ink engine (SVG layer per `[data-ink]` element, strokes stored in a 1000-unit-wide coordinate system so they scale with the page). Uses [perfect-freehand](https://github.com/steveruizok/perfect-freehand) (MIT) for pressure strokes.
- `js/share.js`, `js/config.js`, `backend/Code.gs` — live sharing (see above).
- `js/ui.js` — toolbar, menu, board, calculator wiring and key-press demos (`data-keys="91 ÷ 7 ="`).
- `js/explain.js` — the step-through explainer framework (`Explainer`), the tap-to-split `FactorTree`, number helpers.
- `js/lessons/u1l1.js` — Unit 1 Lesson 1's explainers.
- `css/calc.css` — calculator styles for lesson pages; the calculator itself is the practice site's `../js/calc.js` (shared), as is KaTeX (`../assets/katex`).
- `u1/l1/index.html` — the lesson page.

## Adding a lesson

See `LESSON_BRIEF.md` for the full checklist used to build Lessons 2–7.

1. Copy `u1/l1/index.html` to `uN/lM/index.html`; every card that should take ink gets a unique `data-ink` id and a `data-section` name for the Jump menu.
2. Write `js/lessons/uNlM.js` with explainer definitions (`{ title, height, choices, intro, make(stage, value, ex) → steps }`) and mount them on `[data-explainer]` elements.
3. Call `boot({ key: 'uNlM', title: '…' })` and add the lesson to `HW.CATALOG` / `HW.TEACHING.lessons` in `../js/catalog.js` (there is no lesson list page any more: `lessons/index.html` only redirects — students reach lessons from their assignments, the teacher from the Teacher Ledger).
4. Add the id to `HW.TEACHING.lessons` in the root `js/catalog.js`, so the practice site links to it.
