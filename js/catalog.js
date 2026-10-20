/* The course: units and lessons in booklet order. A lesson with a lesson file (HW.lessons[id]) is open;
 * the rest show as "coming soon" (with their teaching-site lesson card). The class calendar (js/calendar.js) plans every
 * lesson listed here, plus a unit test after each unit. Titles match the revised booklets. */
(function (root) {
  'use strict';
  root.HW = root.HW || {};
  /* lessons that have a lesson page under lessons/ (examples + the teacher's class notes); the home page and the
   * lesson sidebar link to it as lessons/u1/l6a/?class=<block> */
  root.HW.TEACHING = { base: 'lessons/',
    lessons: ['u1l1', 'u1l2', 'u1l3', 'u1l4', 'u1l5', 'u1l6a', 'u1l6b', 'u1l7',
      'u2l1', 'u2l2', 'u2l3', 'u2l4', 'u2l5a', 'u2l5b', 'u2l6', 'u3l1', 'u3l2', 'u3l3', 'u3l4', 'u3l5', 'u3l6',
      'u4l1a', 'u4l1b', 'u4l2', 'u4l3', 'u4l4', 'u4l5', 'u4l6', 'u4l7', 'u4l8',
      'u5l1', 'u5l2', 'u5l3', 'u5l4', 'u5l5', 'u5l6', 'u5l7a', 'u5l7b', 'u5l8', 'u5l9', 'u5l10',
      'u6l1', 'u6l2', 'u6l3', 'u6l4', 'u6l5', 'u6l6',
      'u7l1', 'u7l2', 'u7l3', 'u7l4', 'u7l5', 'u7l6', 'u7l7',
      'u8l1a', 'u8l1b', 'u8l2', 'u8l3', 'u8l4', 'u8l5', 'u8l6',
      'u9l1', 'u9l2', 'u9l3', 'u9l4', 'u9l5', 'u9l6', 'u9l7', 'u9l8',
      'u10l1', 'u10l2', 'u10l3', 'u10l4a', 'u10l4b', 'u10l5', 'u10l6', 'u10l7', 'u10l8', 'u10l9'] };
  root.HW.CATALOG = [
    { unit: 1, title: 'Number', outcomes: 'AN1 · AN2', lessons: [
      { id: 'u1l1', num: '1', title: 'Prime Building Blocks of Numbers' },
      { id: 'u1l2', num: '2', title: 'Prime Factorization at Work: GCF, LCM, and Perfect Powers' },
      { id: 'u1l3', num: '3', title: 'Rational Numbers, Irrational Numbers, and Decimal Patterns' },
      { id: 'u1l4', num: '4', title: 'Classifying the Real Number System' },
      { id: 'u1l5', num: '5', title: 'Roots of Real Numbers' },
      { id: 'u1l6a', num: '6A', title: 'Entire and Mixed Radicals' },
      { id: 'u1l6b', num: '6B', title: 'Entire and Mixed Radicals: Index 3 and Higher' },
      { id: 'u1l7', num: '7', title: 'Cumulative Number Sense Check-Up' }] },
    { unit: 2, title: 'Exponents', outcomes: 'AN3', lessons: [
      { id: 'u2l1', num: '1', title: 'Understanding Powers and the Exponent Laws' },
      { id: 'u2l2', num: '2', title: 'Simplifying Expressions with Several Exponent Laws' },
      { id: 'u2l3', num: '3', title: 'Negative Exponents' },
      { id: 'u2l4', num: '4', title: 'Scientific Notation (Application / Extension)' },
      { id: 'u2l5a', num: '5A', title: 'Rational Exponents and Radicals' },
      { id: 'u2l5b', num: '5B', title: 'Simplifying with Rational Exponents' },
      { id: 'u2l6', num: '6', title: 'Exponent Laws in Review' }] },
    { unit: 3, title: 'Polynomial Operations', outcomes: 'AN4', lessons: [
      { id: 'u3l1', num: '1', title: 'Polynomials: Review and Preview' },
      { id: 'u3l2', num: '2', title: 'Multiplying Monomials and Binomials' },
      { id: 'u3l3', num: '3', title: 'Multiplying Polynomials I: Special Products' },
      { id: 'u3l4', num: '4', title: 'Multiplying Polynomials II: Binomial × Trinomial and Three Binomials' },
      { id: 'u3l5', num: '5', title: 'Applying Polynomial Products to Area, Volume, and Equations' },
      { id: 'u3l6', num: '6', title: 'Polynomial Operations: Comprehensive Review' }] },
    { unit: 4, title: 'Factoring Polynomial Expressions', outcomes: 'AN5', lessons: [
      { id: 'u4l1a', num: '1A', title: 'Common Factors: The GCF of Monomials and Polynomials' },
      { id: 'u4l1b', num: '1B', title: 'Common Factors: Binomial Common Factors and Grouping' },
      { id: 'u4l2', num: '2', title: 'Factoring Trinomials of the Form x² + bx + c' },
      { id: 'u4l3', num: '3', title: 'Difference of Squares' },
      { id: 'u4l4', num: '4', title: 'Factoring ax² + bx + c (where a ≠ 1)' },
      { id: 'u4l5', num: '5', title: 'Further Factoring' },
      { id: 'u4l6', num: '6', title: 'Choosing a Factoring Strategy' },
      { id: 'u4l7', num: '7', title: 'Extension: Solving Polynomial Equations by Factoring' },
      { id: 'u4l8', num: '8', title: 'Unit 4 Review: Factoring' }] },
    { unit: 5, title: 'Relations and Functions', outcomes: 'RF1 · RF2 · RF8', lessons: [
      { id: 'u5l1', num: '1', title: 'The Cartesian Plane, Growing Patterns, and Types of Variables' },
      { id: 'u5l2', num: '2', title: 'Describing Relationships Between Two Quantities' },
      { id: 'u5l3', num: '3', title: 'Where Graphs Meet the Axes' },
      { id: 'u5l4', num: '4', title: 'Determining the Domain and Range of a Relation' },
      { id: 'u5l5', num: '5', title: 'Graphing Calculator Techniques for Relations' },
      { id: 'u5l6', num: '6', title: 'Exploring Real-World Relations With a Graphing Calculator' },
      { id: 'u5l7a', num: '7A', title: 'What Is a Function?' },
      { id: 'u5l7b', num: '7B', title: 'Function Notation' },
      { id: 'u5l8', num: '8', title: 'Function Notation: Graphs, Conversions, and Real-World Models' },
      { id: 'u5l9', num: '9', title: 'Interpreting and Sketching Real-World Graphs' },
      { id: 'u5l10', num: '10', title: 'Relations and Functions Review: Domain, Range, and Function Notation' }] },
    { unit: 6, title: 'Characteristics of Linear Relations', outcomes: 'RF3 · RF4 · RF5', lessons: [
      { id: 'u6l1', num: '1', title: 'Extension: Measuring the Length of a Line Segment' },
      { id: 'u6l2', num: '2', title: 'Extension: The Distance and Midpoint Formulas' },
      { id: 'u6l3', num: '3', title: 'Rise Over Run: The Slope of a Line Segment' },
      { id: 'u6l4', num: '4', title: 'Slope Relationships: Collinearity, Parallel and Perpendicular Lines' },
      { id: 'u6l5', num: '5', title: 'Characteristics of Linear Graphs' },
      { id: 'u6l6', num: '6', title: 'Coordinate Geometry Review: Slope, Linear Graphs, Distance and Midpoint' }] },
    { unit: 7, title: 'Equations of Linear Relations', outcomes: 'RF4 · RF5 · RF6 · RF7', lessons: [
      { id: 'u7l1', num: '1', title: 'Slope–Intercept Form and the Graph of a Line' },
      { id: 'u7l2', num: '2', title: 'From Slope to Equation: Building Linear Equations with y = mx + b' },
      { id: 'u7l3', num: '3', title: 'The General Form of a Linear Equation' },
      { id: 'u7l4', num: '4', title: 'Using Slope–Point Form to Determine the Equation of a Line' },
      { id: 'u7l5', num: '5', title: 'Graphing Linear Equations: A Strategy for Every Form' },
      { id: 'u7l6', num: '6', title: 'Slope in Context: Interpreting Rates of Change' },
      { id: 'u7l7', num: '7', title: 'Equations of Lines Review: Slope, Intercepts, and Perpendicularity' }] },
    { unit: 8, title: 'Systems of Linear Equations', outcomes: 'RF9', lessons: [
      { id: 'u8l1a', num: '1A', title: 'Graphing Systems of Linear Equations' },
      { id: 'u8l1b', num: '1B', title: 'Classifying Systems: How Many Solutions?' },
      { id: 'u8l2', num: '2', title: 'Solving Systems of Equations by Substitution' },
      { id: 'u8l3', num: '3', title: 'Combining Equations: The Elimination Method' },
      { id: 'u8l4', num: '4', title: 'Solving Word Problems with Systems of Equations' },
      { id: 'u8l5', num: '5', title: 'Mixture and Motion: More Applications of Linear Systems' },
      { id: 'u8l6', num: '6', title: 'Systems of Linear Equations: Cumulative Review' }] },
    { unit: 9, title: 'Trigonometry', outcomes: 'M4', lessons: [
      { id: 'u9l1', num: '1', title: 'Right-Triangle Trigonometry: Sine, Cosine, and Tangent' },
      { id: 'u9l2', num: '2', title: 'Trig Ratios: Calculator Values and Angle Patterns' },
      { id: 'u9l3', num: '3', title: 'Finding a Missing Side Length in a Right Triangle' },
      { id: 'u9l4', num: '4', title: 'Finding the Measure of an Angle in a Right Triangle' },
      { id: 'u9l5', num: '5', title: 'Solving Right Triangles Completely' },
      { id: 'u9l6', num: '6', title: 'Multi-Step Trigonometry: Eye Level, Elevation and Depression' },
      { id: 'u9l7', num: '7', title: 'Chaining Right Triangles Together' },
      { id: 'u9l8', num: '8', title: 'Right Triangle Trigonometry: A Cumulative Review' }] },
    { unit: 10, title: 'Measurement', outcomes: 'M1 · M2 · M3', lessons: [
      { id: 'u10l1', num: '1', title: 'Rounding and Formula Substitution' },
      { id: 'u10l2', num: '2', title: 'Estimating Length with Personal Referents' },
      { id: 'u10l3', num: '3', title: 'Reading Precision Measuring Instruments' },
      { id: 'u10l4a', num: '4A', title: 'Converting Units Within the Metric (SI) System' },
      { id: 'u10l4b', num: '4B', title: 'Imperial Units and Converting Between Imperial and SI' },
      { id: 'u10l5', num: '5', title: 'Converting Square and Cubic Units: SI and Imperial Systems' },
      { id: 'u10l6', num: '6', title: 'Surface Area and Volume of Prisms and Cylinders' },
      { id: 'u10l7', num: '7', title: 'Surface Area and Volume of Pyramids and Cones' },
      { id: 'u10l8', num: '8', title: 'Surface Area and Volume of Spheres and Hemispheres' },
      { id: 'u10l9', num: '9', title: 'Measurement — A Cumulative Review' }] }
  ];
  /* a colour for each unit (class calendar, unit headings): neighbouring units contrast, so a unit change is easy to see.
     HW.unitStyle(u) gives CSS variables: --uc (the colour), --ucl (pale tint), --ucs (soft border), --ucd (dark text),
     --uct (solid fill for white text, e.g. a unit test day). */
  var UC = { 1: '#2563eb', 2: '#ea580c', 3: '#7c3aed', 4: '#16a34a', 5: '#db2777', 6: '#0d9488', 7: '#ca8a04', 8: '#4f46e5', 9: '#dc2626', 10: '#8b5e34' };
  function mix(a, b, t) { var x = parseInt(a.slice(1), 16), y = parseInt(b.slice(1), 16), out = '#'; [16, 8, 0].forEach(function (s) { var v = Math.round(((x >> s) & 255) * (1 - t) + ((y >> s) & 255) * t); out += ('0' + v.toString(16)).slice(-2); }); return out; }
  root.HW.UNIT_COLORS = UC;
  root.HW.unitColor = function (u) { var c = UC[u] || '#0f766e'; return { c: c, light: mix(c, '#ffffff', 0.87), soft: mix(c, '#ffffff', 0.55), dark: mix(c, '#000000', 0.38), solid: mix(c, '#000000', 0.12) }; };
  root.HW.unitStyle = function (u) { var x = root.HW.unitColor(u); return '--uc:' + x.c + ';--ucl:' + x.light + ';--ucs:' + x.soft + ';--ucd:' + x.dark + ';--uct:' + x.solid; };
  root.HW.OUTCOMES = {
    AN1: 'Factors of whole numbers: prime factors, GCF, LCM, square roots and cube roots',
    AN2: 'Irrational numbers: representing, identifying and simplifying; ordering real numbers',
    AN3: 'Powers with integral and rational exponents',
    AN4: 'Multiplication of polynomial expressions',
    AN5: 'Common factors and trinomial factoring',
    RF1: 'Interpreting and explaining relations', RF2: 'Relations and functions', RF3: 'Slope', RF4: 'Linear relations',
    RF5: 'Characteristics of linear relations', RF6: 'Forms of linear equations', RF7: 'Equations of linear relations',
    RF8: 'Function notation', RF9: 'Systems of linear equations', M1: 'SI and imperial measurement', M2: 'Converting units',
    M3: 'Surface area and volume', M4: 'Trigonometry', EXT: 'Extension (not part of a unit level)'
  };
})(window);
