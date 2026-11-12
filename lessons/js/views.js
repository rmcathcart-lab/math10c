/* Class view / Full notes (pilot, 2026-11-10; only the 4.8 preview page uses this so far).
 * Ryan: the lessons run too long and repeat too much to go through with a whole class, but the extra material is worth
 * keeping for a student reading the notes alone. So every card or block marked data-extra is hidden in Class view and
 * shown in Full notes. Nothing is removed from the page.
 *   <section class="card" data-extra …>   a whole card that is only in Full notes
 *   <div data-extra>…</div>               a block inside a card
 * Where the switch is (Ryan: not on the title card, it shows while he projects):
 *   - view-only pages (students; body.viewer): a small Class | Full notes switch in the header bar;
 *   - everyone: a "Lesson view" row in the ••• menu (the teacher's only switch).
 * A hidden card gives up its data-section so the ••• "Jump to" list only shows what is on the page. The choice is
 * remembered on the device. Call views() after boot(). views({ initial: 'class' | 'full' }) */
const KEY = 'm10c:lessonView';
const BTNS = '<button type="button" data-v="class">Class</button><button type="button" data-v="full">Full notes</button>';
export function views({ initial = 'class' } = {}) {
  let view = initial;
  try { view = localStorage.getItem(KEY) || initial; } catch (e) {}
  const extras = [...document.querySelectorAll('[data-extra]')];
  extras.forEach((el) => { if (el.dataset.section) el.dataset.sectionFull = el.dataset.section; });
  const hosts = [];
  function host(el) {
    el.innerHTML = BTNS; hosts.push(el);
    el.querySelectorAll('button').forEach((b) => b.addEventListener('click', (e) => { e.stopPropagation(); set(b.dataset.v, true); }));
    paint();
  }
  function paint() {
    for (let i = hosts.length - 1; i >= 0; i--) if (!hosts[i].isConnected) hosts.splice(i, 1);
    hosts.forEach((el) => el.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.v === view ? 'true' : 'false')));
  }
  function set(v, user) {
    // keep the reader's place: the card at the top of the screen stays at the top
    const top = user ? [...document.querySelectorAll('.card')].find((c) => c.offsetParent && c.getBoundingClientRect().bottom > 80) : null;
    const y0 = top ? top.getBoundingClientRect().top : 0;
    view = v === 'full' ? 'full' : 'class';
    document.body.classList.toggle('view-class', view === 'class');
    document.body.classList.toggle('view-full', view === 'full');
    extras.forEach((el) => {
      if (!el.dataset.sectionFull) return;
      if (view === 'class') el.removeAttribute('data-section'); else el.dataset.section = el.dataset.sectionFull;
    });
    paint();
    if (user) { try { localStorage.setItem(KEY, view); } catch (e) {} }
    dispatchEvent(new Event('resize'));
    if (top && top.offsetParent) scrollBy(0, top.getBoundingClientRect().top - y0);
  }
  // header bar (shown by CSS only on view-only pages)
  const badge = document.querySelector('#tb .share-badge');
  if (badge) { const sw = document.createElement('div'); sw.className = 'vw-hswitch'; sw.setAttribute('role', 'group'); sw.setAttribute('aria-label', 'Lesson view'); badge.after(sw); host(sw); }
  // ••• menu: the menu is rebuilt each time it opens, so add the row whenever it has none
  const menu = document.querySelector('.menu-pop');
  if (menu) {
    const addRow = () => {
      if (menu.classList.contains('hidden') || menu.querySelector('.vw-mrow')) return;
      const row = document.createElement('div'); row.className = 'mp-item vw-mrow'; row.innerHTML = '<span>Lesson view</span><span class="vw-hswitch in-menu"></span>';
      const sep = menu.querySelector('.mp-sep'); if (sep) sep.after(row); else menu.appendChild(row);
      host(row.querySelector('.vw-hswitch'));
    };
    new MutationObserver(addRow).observe(menu, { childList: true, attributes: true, attributeFilter: ['class'] });
  }
  // The warm-up pictures always loop, even when the device asks for reduced motion: Ryan wants them moving as students
  // come in, and with the pause in place they were completely still on his own device (2026-11-11).
  set(view, false);
  return { set, get: () => view };
}
