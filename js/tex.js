/* Math typesetting with KaTeX (assets/katex). Load katex.min.js + katex.min.css as classic tags in the page first.
 *   tex('\\sqrt[3]{54}')          → HTML string (inline)
 *   tex('\\frac{1}{3}', true)     → display style
 *   renderTex(root)               → typesets every element with class "tex" (its text is the LaTeX) inside root
 * Use it anywhere radicals, fractions, exponents or repeating bars (\overline{36}) need to look like real math. */
export function tex(src, display = false) {
  try { return window.katex.renderToString(String(src), { displayMode: display, throwOnError: false, output: 'html' }); }
  catch (e) { return String(src); }
}
export function renderTex(root = document) {
  root.querySelectorAll('.tex:not([data-tex-done])').forEach((el) => {
    const src = el.textContent; el.dataset.texDone = '1'; el.dataset.src = src;
    el.innerHTML = tex(src, el.classList.contains('display'));
  });
}
