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
- **The block comes from the schedule** (teacher only — students load nothing extra). The lesson page and the lessons home load the Teaching Hub's `teaching/js/courses.js` (`js/blockpick.js` has the rules) and use the schedule cached on the device, refreshed in the background. The chips (••• menu) and the home's "Open lessons for" buttons show only the blocks this course (`course` in `js/config.js`) has in the current semester, with "Show all blocks" as a fallback. The block that's on is used automatically — from the end of the period before it (or 10 minutes before its bell) until its bell — and the toolbar shows **Live · Block B** with an *Auto* tag. A block picked in the menu or on the home wins until the period that's on ends (outside class times: until this course's next class, or the end of the day); it's kept on the device (`ink:pick:<course>`). Outside this course's classes, with no pick: **Not live** (amber), nothing is sent. A page left open moves to the next block of this course when it starts. If the course isn't on the schedule, the `?class` in the URL decides as before; if `courses.js` can't load, the old A–D chips. The hub's semester schedule must list this course in each block it's taught in (Universal settings → Semesters). Test: `tests/lessons_block_test.py` (serve the folder holding the repos on 8860).
- Testing locally: `node backend/mock_server.js 8790` (teacher key TEST01) and in the browser console `localStorage.setItem('ink:api', JSON.stringify('http://localhost:8790/'))`.

## The lessons home (iPad home-screen app)

`index.html` is the lessons home, https://rmcathcart-lab.github.io/math10c/lessons/ — open it in Safari on the iPad, then
Share → **Add to Home Screen** ("10C Lessons"). Each course has its own app and icon.

- **What it shows:** a **Continue** button for the last lesson opened on this device, the course intro lesson (if the
  course has one), then every unit with its switched-on lessons (`HW.TEACHING.lessons` in `../js/catalog.js`) as big
  rows, a Units bar to jump to a unit, and units with no lessons yet listed at the end as coming soon. Quiet links: the
  practice site, and the Teacher Ledger on the teacher's device only.
- **Teacher only** (the device is signed in with the teacher key, `ink:teacher`, or to the ledger, `hw:tkey`): "Open
  lessons for Block A / B / C / D / No class" — the lesson links carry `?class=B` so the notes go to that class. It
  remembers the last class picked here or opened on a lesson page. Students never see it.
- **Fast:** inline CSS and script; the only scripts are `../js/catalog.js` (and `../js/ns.js`, the storage namespace,
  where the repo has one). No ledger, backend, MathLive or calculator.
- **Last lesson:** `boot()` in `js/ui.js` records it (`lessons:last`, and `lessons:class` for the teacher) — nothing to add
  to a lesson page. The toolbar's home button goes to this page for the teacher and inside the home-screen app (students
  in Safari still go to their assignments).
- **Web app:** `manifest.webmanifest` (`start_url` and `scope` = this folder, standalone), the `apple-mobile-web-app-*`
  metas here and on every lesson page. Lessons opened from the home stay inside the app; the practice site and ledger
  open in Safari.
- **Offline / instant:** `sw.js` serves the home, the catalog and the icons from the device first and refreshes them in
  the background (the home reloads itself, or shows "Lessons updated · tap to refresh", when a lesson is switched on).
  Lesson pages stay network first.
- **Icon:** `assets/icon.svg` (a board on an easel in the course colour, the course mark, an amber pen stroke and a
  pencil — different from the practice site's plain mark and the ledger's dark one), `icon-180/192/512.png`,
  `favicon.svg`, `favicon-32.png`; rebuild them with `python3 lessons/dev/make_icons.py`.
- Checked by `tests/lessons_smoke.py` (every switched-on lesson listed once, no broken links, no heavy scripts).

## Code map

- `index.html` — the lessons home (see above).
- `js/ink.js` — the Pencil ink engine (SVG layer per `[data-ink]` element, strokes stored in a 1000-unit-wide coordinate system so they scale with the page). Uses [perfect-freehand](https://github.com/steveruizok/perfect-freehand) (MIT) for pressure strokes.
- `js/share.js`, `js/blockpick.js`, `js/config.js`, `backend/Code.gs` — live sharing and which block it goes to (see above).
- `js/ui.js` — toolbar, menu, board, calculator wiring and key-press demos (`data-keys="91 ÷ 7 ="`).
- `js/explain.js` — the step-through explainer framework (`Explainer`), the tap-to-split `FactorTree`, number helpers.
- `js/lessons/u1l1.js` — Unit 1 Lesson 1's explainers.
- `css/calc.css` — calculator styles for lesson pages; the calculator itself is the practice site's `../js/calc.js` (shared), as is KaTeX (`../assets/katex`).
- `u1/l1/index.html` — the lesson page.

## Adding a lesson

See `LESSON_BRIEF.md` for the full checklist used to build Lessons 2–7.

1. Copy `u1/l1/index.html` to `uN/lM/index.html`; every card that should take ink gets a unique `data-ink` id and a `data-section` name for the Jump menu.
2. Write `js/lessons/uNlM.js` with explainer definitions (`{ title, height, choices, intro, make(stage, value, ex) → steps }`) and mount them on `[data-explainer]` elements.
3. Call `boot({ key: 'uNlM', title: '…' })` and add the lesson to `HW.CATALOG` / `HW.TEACHING.lessons` in `../js/catalog.js` (that puts it on the lessons home, `index.html`).
4. Add the id to `HW.TEACHING.lessons` in the root `js/catalog.js`, so the practice site links to it.
