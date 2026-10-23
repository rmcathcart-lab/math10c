/* The Math 10C specific outcomes in the official wording (Alberta Education, Mathematics 10–12 Program of Studies,
 * 2008), and a small pop-out: any element with data-outcome="AN1" shows the outcome's wording when tapped. */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {};
  var AN = 'Algebra and Number', RF = 'Relations and Functions', M = 'Measurement';
  HW.OUTCOME_TEXT = {
    AN1: { strand: AN, text: 'Demonstrate an understanding of factors of whole numbers by determining the:', list: ['prime factors', 'greatest common factor', 'least common multiple', 'square root', 'cube root.'] },
    AN2: { strand: AN, text: 'Demonstrate an understanding of irrational numbers by:', list: ['representing, identifying and simplifying irrational numbers', 'ordering irrational numbers.'] },
    AN3: { strand: AN, text: 'Demonstrate an understanding of powers with integral and rational exponents.' },
    AN4: { strand: AN, text: 'Demonstrate an understanding of the multiplication of polynomial expressions (limited to monomials, binomials and trinomials), concretely, pictorially and symbolically.' },
    AN5: { strand: AN, text: 'Demonstrate an understanding of common factors and trinomial factoring, concretely, pictorially and symbolically.' },
    RF1: { strand: RF, text: 'Interpret and explain the relationships among data, graphs and situations.' },
    RF2: { strand: RF, text: 'Demonstrate an understanding of relations and functions.' },
    RF3: { strand: RF, text: 'Demonstrate an understanding of slope with respect to:', list: ['rise and run', 'line segments and lines', 'rate of change', 'parallel lines', 'perpendicular lines.'] },
    RF4: { strand: RF, text: 'Describe and represent linear relations, using:', list: ['words', 'ordered pairs', 'tables of values', 'graphs', 'equations.'] },
    RF5: { strand: RF, text: 'Determine the characteristics of the graphs of linear relations, including the:', list: ['intercepts', 'slope', 'domain', 'range.'] },
    RF6: { strand: RF, text: 'Relate linear relations expressed in:', list: ['slope–intercept form (<i>y</i> = <i>mx</i> + <i>b</i>)', 'general form (<i>Ax</i> + <i>By</i> + <i>C</i> = 0)', 'slope–point form (<i>y</i> – <i>y</i><sub>1</sub> = <i>m</i>(<i>x</i> – <i>x</i><sub>1</sub>))'], after: 'to their graphs.' },
    RF7: { strand: RF, text: 'Determine the equation of a linear relation, given:', list: ['a graph', 'a point and the slope', 'two points', 'a point and the equation of a parallel or perpendicular line'], after: 'to solve problems.' },
    RF8: { strand: RF, text: 'Represent a linear function, using function notation.' },
    RF9: { strand: RF, text: 'Solve problems that involve systems of linear equations in two variables, graphically and algebraically.' },
    M1: { strand: M, text: 'Solve problems that involve linear measurement, using:', list: ['SI and imperial units of measure', 'estimation strategies', 'measurement strategies.'] },
    M2: { strand: M, text: 'Apply proportional reasoning to problems that involve conversions between SI and imperial units of measure.' },
    M3: { strand: M, text: 'Solve problems, using SI and imperial units, that involve the surface area and volume of 3-D objects, including:', list: ['right cones', 'right cylinders', 'right prisms', 'right pyramids', 'spheres.'] },
    M4: { strand: M, text: 'Develop and apply the primary trigonometric ratios (sine, cosine, tangent) to solve problems that involve right triangles.' }
  };

  var pop = null, anchor = null;
  function close() { if (pop) { pop.remove(); pop = null; anchor = null; } }
  HW.showOutcome = function (code, el) {
    var o = HW.OUTCOME_TEXT[code]; if (!o) return;
    if (pop && anchor === el) { close(); return; }
    close(); anchor = el;
    pop = document.createElement('div'); pop.className = 'oc-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Outcome ' + code);
    pop.innerHTML = '<div class="oc-h"><b>' + code + '</b><span>' + o.strand + ' · Specific outcome ' + code.replace(/\D/g, '') + '</span>' +
      '<button type="button" class="oc-x" aria-label="Close">×</button></div>' +
      '<p class="oc-t">' + o.text + '</p>' + (o.list ? '<ul class="oc-l">' + o.list.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul>' : '') +
      (o.after ? '<p class="oc-t">' + o.after + '</p>' : '') + '<div class="oc-src">Alberta Education, Mathematics 10C Program of Studies</div>';
    document.body.appendChild(pop);
    pop.querySelector('.oc-x').addEventListener('click', close);
    var r = el.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth;
    var x = Math.max(8, Math.min(vw - w - 8, r.left)), y = r.bottom + 8;
    if (y + h > window.innerHeight - 8 && r.top - h - 8 > 8) y = r.top - h - 8;
    pop.style.left = x + window.scrollX + 'px'; pop.style.top = y + window.scrollY + 'px';
  };
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-outcome]');
    if (t && HW.OUTCOME_TEXT[t.dataset.outcome]) { e.preventDefault(); e.stopPropagation(); HW.showOutcome(t.dataset.outcome, t); return; }
    if (pop && !pop.contains(e.target)) close();
  }, true);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  root.addEventListener('scroll', function () { if (pop && anchor && !anchor.isConnected) close(); }, { passive: true });
  root.addEventListener('hashchange', close);
})(window);
