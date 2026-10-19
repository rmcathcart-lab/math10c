/* Partial credit for online tests (Test mode).
 *
 * Ryan's rule: a wrong answer that matches a recognized mistake earns part of the point.
 *   small  — the method and understanding are right, with one slip
 *            (arithmetic/copying slip, sign slip at the very end, one factor or term missing,
 *            rounding to the wrong place, one wrong entry, open/closed endpoint, forgot units or
 *            "x ∈ ℝ", one point mis-plotted). Take off a third: the student keeps 2/3 of the point.
 *   big    — real progress on the right method, with a significant error
 *            (one exponent law misapplied, radical not fully simplified, middle term wrong,
 *            run over rise, perpendicular slope with the right size but wrong sign,
 *            domain and range swapped, a step left unfinished). Take off two thirds: keeps 1/3.
 *   (none) — any other wrong answer: wrong concept or method, the answer to a different question,
 *            a reversed relationship, a guess, generic codes (value, wrong, other, …). No credit.
 *
 * Keys are the codes a checker returns with v: 'wrong' (labels in HW.CODES). When unsure,
 * the code went to the lower-credit group (small vs big → big; big vs none → none).
 * Not listed here on purpose:
 *   - v: 'form' results (right value, wrong form) — already credited like a small mistake;
 *   - 'mc-*' codes — multiple choice stays right-or-wrong.
 * The comment after each code is its label, so the list can be audited and moved between groups.
 */
(function (root) {
  var HW = root.HW;
  HW.PARTIAL = {
    small: {
      'ab-sign': 1, // Area box: sign of a product
      'abc-sum': 1, // Added instead of a − b − c
      'abs-minus-out': 1, // Dropped the minus sign outside the bars
      'ad-wrong-mom': 1, // Arrow diagram: paired a child with the wrong mother
      'ax-gcf-dropped': 1, // Dropped the common factor
      'ax-gcf-sign': 1, // Common factor with the wrong sign
      'ax-lost-negative': 1, // Lost the negative common factor
      'ax-no-y': 1, // Left out the second variable
      'ax-pair-product-sign': 1, // Pair product has the wrong sign
      'ax-pair-signs': 1, // Pair with both signs wrong
      'ax-sign': 1, // Sign slip solving (x − h)² = …
      'calc-dec': 1, // Decimal slip
      'calc-no-b': 1, // Left out the constant term
      'calc-noise': 1, // Copied the calculator’s approximation error
      'calc-sign': 1, // Sign of rise/run
      'chop': 1, // Chopped instead of rounding
      'cnt-extra': 1, // Counted one too many
      'cnt-zero': 1, // Forgot n = 0
      'const-lost': 1, // Dropped the constant factor
      'const-sign': 1, // Wrong sign on the constant
      'conv-name': 1, // Wrong function name
      'conv-still-fn': 1, // Kept function notation (asked for y = …)
      'conv-still-y': 1, // Kept y (asked for function notation)
      'corner-missing': 1, // Left out the corner square
      'count-minus': 1, // Missed an irrational number
      'count-plus': 1, // Counted a rational number as irrational
      'count-zero': 1, // Counted b = 0
      'cs-sign': 1, // Sign of p wrong
      'ct-sign': 1, // Dropped the sign of the constant term
      'ctx-as-percent': 1, // Rate not written as a percent
      'ctx-cents': 1, // Cents/dollars slip
      'ctx-hundreds': 1, // Forgot the units are hundreds
      'ctx-long': 1, // Line drawn past the situation
      'ctx-loss-sign': 1, // Sign of a loss
      'ctx-months': 1, // Wrong length of time interval
      'ctx-no-c': 1, // Left out the constant term
      'ctx-not-whole': 1, // Continuous set for a whole-number count
      'ctx-open': 1, // Open dot on a real end
      'ctx-rate-sign': 1, // Rate sign doesn’t match the situation
      'ctx-round-down': 1, // Rounded down where the count must round up
      'ctx-round-up': 1, // Rounded up where the count must round down
      'ctx-short': 1, // Line too short
      'ctx-year-round': 1, // Rounded the year up
      'cube-sign': 1, // Sign of the cube root
      'd-metres': 1, // Gave metres instead of kilometres
      'd-round-early': 1, // Rounded each segment before adding
      'd-sign': 1, // Distance: sign slip subtracting a negative coordinate
      'dec-place': 1, // Decimal-place slip in a root
      'decimal': 1, // Gave a decimal instead of exact form
      'decimal-place': 1, // Decimal point in the wrong place
      'dom-n': 1, // Natural numbers leave out 0
      'dom-real': 1, // Used ∈ R for a count
      'dos-sign': 1, // Sign error in the difference of squares
      'double-neg': 1, // Double negative slip in the slope formula
      'dr-centre-sign': 1, // Sign of the centre coordinate
      'dr-nl-dot': 1, // Domain/range: open vs solid dot
      'dr-open-side': 1, // Open dot attached to the wrong bound
      'dr-vertex': 1, // Excluded the vertex (it is on the graph)
      'draw-short': 1, // Segment does not cross both axes
      'drop-one': 1, // Dropped the 1 left by a term equal to the GCF
      'drop-var': 1, // Left the second variable out of the brackets
      'dup': 1, // Listed a value twice
      'end-sign': 1, // Rise/run sign in the endpoint
      'err-missed': 1, // Missed one of the errors
      'ev-sign': 1, // Sign error with a negative input
      'ex-order': 1, // Example: not in descending order
      'extra-term': 1, // Extra term that should cancel
      'fn-const': 1, // Left out the constant term
      'fn-const-sign': 1, // Wrong sign on the constant
      'fn-neg-sub': 1, // Sign slip substituting a negative
      'fn-sign': 1, // Sign slip
      'fn-solve-sign': 1, // Sign slip solving
      'forgot-1': 1, // Left out the pair 1 × c
      'gap-sign': 1, // Gap with the wrong sign
      'gcf-dropped': 1, // Dropped the common factor
      'gcf-lost': 1, // Lost the common factor taken out first
      'gcf-missing': 1, // Dropped the common factor
      'gcf-neg': 1, // Positive GCF when the leading term is negative
      'gcf-one': 1, // Dropped the 1 left when a term equal to the GCF is divided
      'gcf-sign': 1, // Wrong sign on the GCF
      'gf-k-sign': 1, // Value of k/a with the wrong sign
      'gf-nr-sign': 1, // Sign of the unknown coordinate
      'gf-sub-sign': 1, // Sign slip substituting a point
      'gf-sym-sign': 1, // Sign slip in px − y + q = 0
      'gr-b-sign': 1, // Graph: y-intercept sign wrong
      'graph-arrows': 1, // Arrows missing
      'graph-ends': 1, // Wrong end dots (open vs solid)
      'graph-length': 1, // Line too long / too short
      'graph-noarrow': 1, // Arrows where the graph stops
      'graph-points': 1, // Point misplaced
      'graph-xk': 1, // Graph: wrong x-value
      'halfway': 1, // Rounded the estimate the wrong way
      'has-var': 1, // Put a variable on a constant term
      'height-sign': 1, // Height across the axis (subtracting a negative)
      'int-sign': 1, // Intercept with the wrong sign
      'inv-neg': 1, // Lost the negative coefficient
      'k-sign': 1, // Sign slip solving for the unknown
      'l5-gr-bsign': 1, // Wrong sign on the y-intercept
      'l5-rise': 1, // Slope sign (cooling = negative)
      'l5-tab-sign': 1, // Sign slip in a table value
      'last-sign': 1, // Wrong sign on the product of the last terms
      'lc-pi': 1, // Left π out of the coefficient
      'lc-sign': 1, // Dropped the sign of the leading coefficient
      'line-b-sign': 1, // y-intercept sign
      'line-form-sign': 1, // General form: A negative
      'lost-gcf': 1, // Dropped the common factor
      'lost-half': 1, // Dropped the ½
      'lost-one': 1, // Dropped the hidden 1
      'mid-sign': 1, // Sign slip in a midpoint
      'min-not-h': 1, // Gave minutes where hours were asked
      'missing-term': 1, // Left out one group of terms
      'months': 1, // Wrong number of payments
      'n-not-n-1': 1, // Counted n remainders instead of n − 1
      'neg-a': 1, // Gave a negative value
      'neg-gcf': 1, // Took out a negative GCF
      'neg-length': 1, // Gave a negative length
      'neg-mixed': 1, // GCF: negative although the signs are mixed
      'neg-mult': 1, // Sign error multiplying a negative input
      'neg-rule': 1, // GCF: positive although every term is negative
      'neg-sub': 1, // Subtracting a negative (should add)
      'neg-times-neg': 1, // Negative × negative sign error
      'neighbour': 1, // Read the value at the wrong point
      'nl-dot': 1, // Open vs solid dot
      'no-corner': 1, // Left out the corner square
      'no-var': 1, // Left the variable off the term
      'not-subst': 1, // Substitution slip
      'np-place': 1, // Number placed too far off
      'nr-one-sign': 1, // Used a positive value for a negative intercept
      'nr-repeat': 1, // Counted a repeated value twice
      'nr-round-early': 1, // Rounded before the last step
      'nr-sign': 1, // Sign error
      'odd-neg': 1, // Dropped the negative sign under an odd power
      'odd-sign': 1, // Sign of a root of a negative base
      'off-by-one': 1, // Figure numbers off by one
      'off-one': 1, // One factor too many or too few
      'order': 1, // Terms in the wrong order
      'pair-sign': 1, // Sign of a coordinate wrong
      'pair-signs': 1, // Pair with the wrong signs
      'pct-dec': 1, // Grade as a decimal, not a percent
      'plot-value': 1, // Point plotted at the wrong value
      'ps-sign-x': 1, // Slope–point form: sign of x₁
      'ps-sign-y': 1, // Slope–point form: sign of y₁
      'pt-sign-x': 1, // Point: x sign
      'pt-sign-y': 1, // Point: y sign
      'pt-x': 1, // Point: x-coordinate wrong
      'pt-y': 1, // Point: y-coordinate wrong
      'rate-sign': 1, // Rate of change sign
      'round': 1, // Not rounded
      'round-first': 1, // Rounded before adding
      'round-up': 1, // Rounded up a count of whole items
      'rounded-early': 1, // Rounded too early
      'rr-rise': 1, // Miscounted the rise
      'rr-run': 1, // Miscounted the run
      'rr-sign': 1, // Rise or run with the wrong sign
      'scale-m': 1, // Answer in metres, not kilometres
      'set-endpoint': 1, // Endpoint included/excluded wrong
      'set-repeat': 1, // Wrote a value twice in a list
      'sets-zero-N': 1, // Called 0 a natural number
      'sign': 1, // Wrong sign
      'sign-exp': 1, // Sign slip when combining exponents
      'sk-after': 1, // Sketch: continued after landing
      'sk-arrow': 1, // Sketch: arrow where the model stops
      'sk-ends': 1, // Sketch: wrong end dots / arrows
      'sk-extra': 1, // Sketch: extra point off the graph
      'sk-point': 1, // Sketch: a plotted point is off the curve
      'sk-segment': 1, // Sketch: segment instead of a line (no arrows)
      'sk-start': 1, // Sketch: release point missing
      'sol-sign-one': 1, // One solution has the wrong sign
      'speed-sign': 1, // Gave a speed as a negative number
      'sq-decimal': 1, // Squared a decimal wrongly
      'sq-middle-sign': 1, // Wrong sign on the middle term of a square
      'stmt-name': 1, // Wrong function name in statement
      'story-end': 1, // Wrong ending value
      'story-start': 1, // Wrong starting value
      'sub-value': 1, // Substitution error
      'sub-wrong': 1, // Substitution arithmetic slip
      'swap-signs': 1, // Factor pair with both signs switched
      'term': 1, // One group of like terms wrong
      'tile-away-zero': 1, // Took away an extra zero pair
      'tile-neg-corner': 1, // Rectangle: corner sign wrong
      'tile-sign': 1, // Misread the sign of a tile
      'time-ampm': 1, // Wrong a.m./p.m.
      'tree-box': 1, // Factor tree: a box doesn’t multiply out
      'truncate': 1, // Chopped instead of rounding
      'units-cm': 1, // Answer in cm, not m
      'vx-sign': 1, // Turning point x with the wrong sign
      'win-neg-x': 1, // Negative Xmin for an input that can’t be negative
      'win-neg-y': 1, // Most of the window below zero for a quantity that can’t be negative
      'xint-sign': 1, // x-intercept sign error
      'zero-natural': 1 // Put 0 in N
    },
    big: {
      'a-b': 1, // Found a − b
      'ab-cell': 1, // Area box: wrong product
      'ab-exp': 1, // Area box: exponents
      'ab-frac': 1, // Area box: fraction in a row/column term
      'ab-gcf': 1, // Area box: row/column term not the GCF
      'ab-side': 1, // Area box: wrong side term (working backwards)
      'ab-zeros': 1, // Area box: dropped the zeros of tens
      'abs-added': 1, // Added instead of subtracting
      'abs-one-side': 1, // Graphed only one side of an absolute value inequality
      'abs-outer': 1, // Forgot the outer bars
      'abs-sub': 1, // Subtracted the constant instead of adding it
      'ac-c': 1, // Forgot to multiply the intercept by B
      'ac-wrong': 1, // Wrong value of ac
      'add-coef': 1, // Added coefficients instead of multiplying
      'add-den': 1, // Added numerators and denominators of the exponents
      'add-exp': 1, // Added the exponents when adding like terms
      'add-index': 1, // Added the indices of a root of a root
      'add-not-sub': 1, // Added instead of subtracting when solving
      'add-power': 1, // Added the outside exponent instead of multiplying
      'added-index': 1, // Added the indices instead of multiplying
      'added-middle': 1, // Added the outer and inner products wrongly
      'added-prod': 1, // Added instead of subtracting
      'adjust-direction': 1, // Adjusted the exponent the wrong way when renormalizing
      'all-cancel': 1, // Thought everything cancels
      'alt-extra': 1, // Extra line in the drawing
      'area-full': 1, // Used the whole base as the run
      'area-no-half': 1, // Forgot the ½ in the area
      'area-noh': 1, // Gave the height, not the area
      'arrows-extra': 1, // Extra arrow
      'arrows-missing': 1, // Arrow missing
      'ax-ac-wrong': 1, // Wrong value of ac
      'ax-cm': 1, // Did not convert cm to m
      'ax-collected': 1, // Collected the middle terms
      'ax-const-swap': 1, // Constant terms in the wrong brackets
      'ax-extra-b': 1, // A value of b that does not work
      'ax-group-sign': 1, // Sign error taking out the second group’s factor
      'ax-minus-first': 1, // Subtracted only the first term
      'ax-missing-b': 1, // Missing some values of b
      'ax-no-leg': 1, // Left out the other coordinate’s difference
      'ax-no-root': 1, // Didn’t take the square root
      'ax-one': 1, // Gave only one of two points
      'ax-one-side': 1, // Path added on one side only
      'ax-only-positive': 1, // Left out the negative values of b
      'ax-outer': 1, // Gave the outer area instead of the path
      'ax-outer-area': 1, // Used the outer area
      'ax-sign-swap': 1, // Signs of both constants switched
      'ax-sq-no-middle': 1, // Squared a binomial without its middle term
      'ax-tank': 1, // Gave the tank’s volume
      'axis-start': 1, // Horizontal axis not started at 0
      'backwards': 1, // Subtracted the exponents in the wrong order
      'bar-all': 1, // Repeated the digits before the bar too
      'bar-block': 1, // Bar over the wrong digits
      'bcf-sign': 1, // Wrong sign in the leftover bracket
      'bin-twice': 1, // Took the common bracket out twice
      'block-back': 1, // Put the wrong block back after substituting
      'bottom-only': 1, // Took the root of the denominator only
      'bounce-count': 1, // Miscounted the bounces
      'bounding-box': 1, // Used the bounding rectangle
      'box-dims': 1, // Box dimensions L − x instead of L − 2x
      'brackets': 1, // Left brackets (power not distributed)
      'c-sign': 1, // Ignored the sign of c
      'calc-coef-sq': 1, // Squared the coefficient as well
      'calc-flip': 1, // Used run over rise
      'calc-sq-neg': 1, // Squared a negative input as a negative
      'cancel-missed': 1, // Missed terms that cancel
      'circ-noSq': 1, // Didn’t square the radius
      'circ-radius': 1, // Used the diameter as the radius
      'clear-one-side': 1, // Cleared the fraction on one side only
      'coef': 1, // Wrong coefficient
      'coef-added': 1, // Added coefficients instead of multiplying
      'coef-flip': 1, // Coefficient fraction upside down
      'coef-flipped': 1, // Moved the coefficient to the denominator too
      'coef-forgot': 1, // Simplified the root but dropped the coefficient in front
      'coef-in': 1, // Moved the coefficient into the bracket before squaring
      'coef-lost': 1, // Forgot to multiply by the coefficient in front
      'coef-not-powered': 1, // Didn’t raise the coefficient to the power
      'coef-not-raised': 1, // Did not raise the coefficient to the power
      'coef-not-squared': 1, // Coefficient not squared
      'coef-outside': 1, // Left the bracketed coefficient outside the radical
      'coef-pos-power': 1, // Raised the coefficient to the positive power instead of the negative one
      'coef-power': 1, // Left the perfect square/cube outside instead of its root
      'coef-raise': 1, // Didn’t raise the coefficient to the power
      'coef-recip': 1, // Coefficient upside down (negative exponent)
      'coef-root': 1, // Didn’t take the root of the coefficient
      'coef-side': 1, // Number on the wrong side of the fraction bar (moved one with no negative exponent, or left one that has one)
      'coef-sign': 1, // Dropped the negative sign
      'coef-sub': 1, // Subtracted coefficients instead of dividing
      'coef-sum': 1, // Added the coefficients instead of multiplying
      'coef-times': 1, // Multiplied the coefficient by the exponent
      'coef-times-n': 1, // Multiplied the coefficient by the exponent
      'coef-zeroed': 1, // Applied the zero exponent to the coefficient too
      'composite': 1, // Composite number left in a prime factorization
      'conj-sign': 1, // Sum × difference written with +
      'const-add': 1, // Added constants instead of multiplying
      'const-both': 1, // Multiplied the constant factor into both brackets
      'const-zero': 1, // Treated a constant factor as giving a solution
      'conv-arg': 1, // Wrong variable in the brackets
      'conv-move-sign': 1, // Sign error moving terms across
      'conv-no-divide': 1, // Did not divide every term by the coefficient of y
      'conv-part-divide': 1, // Divided only some terms
      'conv-var': 1, // Changed the input variable
      'corner-twice': 1, // Counted the corner square twice
      'count': 1, // Run/rise off by one (counted lines, not spaces)
      'count-const': 1, // Counted a constant factor as giving a solution
      'count-pos': 1, // Counted only the positive values
      'count-repeat': 1, // Counted a repeated factor twice
      'count-tens': 1, // Wrong number of 10s in product form
      'counted-digits': 1, // Counted digits instead of places moved
      'cross': 1, // Counted cross terms wrongly
      'cross-not-doubled': 1, // Cross term not doubled
      'cross-once': 1, // Counted a cross product once
      'cs-half': 1, // Did not halve the x-coefficient
      'cs-q': 1, // Wrong q (constant adjustment)
      'ctx-add-b': 1, // Added the intercept instead of subtracting
      'ctx-area': 1, // Forgot the cross-section area
      'ctx-arrow': 1, // Arrows on a bounded situation
      'ctx-b-point': 1, // Used a data point’s value as the intercept
      'ctx-b-sign': 1, // Sign slip finding the intercept
      'ctx-change': 1, // Gave the change instead of the value
      'ctx-convert': 1, // Unit conversion the wrong way
      'ctx-days': 1, // Used days per week wrong
      'ctx-dist': 1, // Didn’t expand the brackets correctly
      'ctx-dom-breakeven': 1, // Domain started at break-even
      'ctx-dom-neg': 1, // Domain includes negative inputs
      'ctx-dom-open': 1, // Domain with no upper end
      'ctx-dom-table': 1, // Domain/range cut off at the table
      'ctx-dom-vertex': 1, // Domain stopped at the vertex
      'ctx-fee-times': 1, // Multiplied the fee by the months
      'ctx-flip': 1, // Rate units upside down
      'ctx-neg-time': 1, // Kept the negative root
      'ctx-no-b': 1, // Left out the intercept
      'ctx-no-fee': 1, // Left out the fixed amount
      'ctx-no-k': 1, // Left out the factor in front of the bracket
      'ctx-no-sub': 1, // Didn’t subtract the starting amount before dividing
      'ctx-noconv': 1, // Didn’t convert units
      'ctx-nr-m': 1, // Rate per metre, not per km
      'ctx-one-hour': 1, // Went back only one hour
      'ctx-part': 1, // Stopped after one step
      'ctx-per10': 1, // Slope per 10 minutes, not per minute
      'ctx-percent': 1, // Commission as a percent in the equation
      'ctx-platform': 1, // Gave the time back at platform height
      'ctx-points': 1, // Points misplaced
      'ctx-r-not-r2': 1, // Used r instead of r²
      'ctx-rate-n': 1, // Added the rate instead of multiplying
      'ctx-rate-step': 1, // Gave the change per table step, not per unit
      'ctx-reading': 1, // Used a reading instead of the change
      'ctx-revenue': 1, // Revenue instead of profit
      'ctx-rng-open': 1, // Range with a missing end
      'ctx-rng-start': 1, // Range started at the starting value, not 0
      'ctx-sign': 1, // Sign slip in the model
      'ctx-sign-sq': 1, // Lost the minus sign on the squared term
      'ctx-square-coef': 1, // Squared the coefficient too: (−5t)²
      'ctx-step': 1, // Didn’t divide by the step in x
      'ctx-steps': 1, // Counted table steps instead of minutes
      'ctx-swap-boxes': 1, // Two answers in each other’s boxes
      'ctx-t0': 1, // Wrong t = 0 (start of rain, not the peak)
      'ctx-table-end': 1, // Stopped at the end of the table
      'ctx-temp': 1, // Used a temperature, not the change
      'ctx-to-empty': 1, // Distance to empty instead of to the refuel level
      'ctx-total': 1, // Gave the total change, not the rate
      'ctx-two': 1, // Only one line drawn
      'ctx-used': 1, // Gave the amount used instead of the amount left
      'ctx-used-left': 1, // Used vs remaining mixed up
      'cube-in': 1, // Put the coefficient inside the root
      'cube-itself': 1, // Used the perfect cube instead of its cube root
      'd-half': 1, // Gave half the distance
      'd-no-neg': 1, // Treated west/south as positive
      'd-no-root': 1, // Distance: forgot the square root (gave d²)
      'd-not-squared': 1, // Didn’t square the distance from the middle number
      'd-scale-div': 1, // Divided by the scale instead of multiplying
      'd-units': 1, // Distance in grid units, not converted with the scale
      'dec-root': 1, // Wrong root of a decimal
      'decimal-cut': 1, // Converted the decimal as if it ended
      'decimal-hours': 1, // Read decimal hours as minutes
      'deg-hidden1': 1, // Forgot a hidden exponent of 1
      'deg-mult': 1, // Multiplied degrees instead of adding
      'deg-prod': 1, // Multiplied the exponents instead of adding
      'den-dropped': 1, // Lost the denominator
      'den-power': 1, // Raised only part of a fraction coefficient
      'den-root': 1, // Didn’t take the square root of the denominator
      'den-square': 1, // Didn’t square the coefficient’s denominator
      'diag-perim': 1, // Perimeter: not 4 sides
      'diam': 1, // Used the diameter as the radius
      'diameter': 1, // Used the diameter as the radius
      'diff-order': 1, // Subtracted in the other order
      'diff-rev': 1, // Subtracted in the wrong order
      'direction': 1, // Moved the decimal point the wrong way
      'dist-first': 1, // Multiplied only the first term in the bracket
      'div-exp': 1, // Divided exponents instead of subtracting (quotient law)
      'div-neg': 1, // Divided by a negative power instead of multiplying by the positive power
      'divided': 1, // Divided by a bracket and lost a root
      'divided-x': 1, // Divided by x and lost the root 0
      'dom-missing': 1, // Left a domain element without an output
      'dos-again': 1, // Didn’t split a difference of squares again
      'double-root': 1, // Repeated root not repeated in the equation
      'dr-centre': 1, // Ignored the centre of the circle
      'dr-context': 1, // Domain/range does not fit the situation
      'dr-diameter': 1, // Used the diameter instead of the radius
      'dr-from-zero': 1, // Started the context at 0
      'dr-half': 1, // Only half of the curve
      'dr-nl-noshade': 1, // Domain/range: open dot without shading
      'dr-nl-side': 1, // Domain/range: shaded the wrong side
      'dr-no-b': 1, // Forgot the constant term
      'dr-peak': 1, // Used an endpoint instead of the highest/lowest point
      'dr-range-match': 1, // Range does not match the domain
      'dr-scale': 1, // Misread the axis scale
      'dr-sh-arrow': 1, // Stopped the shading where the graph has an arrow
      'dr-sh-fill': 1, // Dots only for an unbroken graph
      'dr-sh-list': 1, // Shaded between separate points
      'dr-sh-stop': 1, // Shaded to the end where the graph stops
      'dr-swap': 1, // Domain and range swapped
      'dr-unhit': 1, // Included an output with no arrow
      'dr-values': 1, // Domain/range: wrong end values
      'dr-wrong-ends': 1, // Endpoints of the wrong segment
      'draw-noline': 1, // Plotted points instead of drawing
      'draw-point': 1, // Line misses the given point
      'draw-slope-flip': 1, // Drew run over rise
      'draw-slope-sign': 1, // Drew the slope with the wrong sign
      'drop-term': 1, // Dropped one partial product
      'drop-x': 1, // Dropped a variable from a product
      'dropped-rem': 1, // Dropped the leftover under the radical
      'dsq-sign': 1, // Sum × difference: wrong sign on the last term
      'dy-only': 1, // Used the change in y only (ignored the x-step)
      'each-prime-once': 1, // Root: used each prime once (didn’t divide the exponents)
      'end-double': 1, // Missing endpoint: doubled the midpoint but didn’t subtract
      'end-nostart': 1, // Forgot to start from the given point
      'end-swap': 1, // Added rise to x and run to y
      'eq-const': 1, // Wrong constant in the equation
      'eq-no-a': 1, // Forgot the factor a
      'eq-no-start': 1, // Left out the starting amount / fee
      'eq-sign': 1, // Added instead of subtracted (or reverse)
      'eq-slope-flip': 1, // Slope upside down (run over rise)
      'eq-slope-sign': 1, // Slope with the wrong sign
      'err-decoy': 1, // Picked a step that was actually fine
      'estimate-off': 1, // Estimate not close enough
      'even-neg': 1, // Kept a negative sign under an even power
      'ex-coef': 1, // Example: wrong coefficient
      'ex-const': 1, // Example: wrong constant term
      'ex-degree': 1, // Example: wrong degree
      'ex-eqlen': 1, // Example segments have equal lengths
      'ex-len': 1, // Example segments have different lengths
      'ex-notpar': 1, // Example segments not parallel
      'ex-other': 1, // Example misses a condition
      'ex-sameline': 1, // Example segments on the same line
      'ex-terms': 1, // Example: wrong number of terms
      'ex-vars': 1, // Example: wrong number of variables
      'exp': 1, // Wrong exponent
      'exp-dist': 1, // Didn’t multiply every term of the exponent
      'exp-mult': 1, // Multiplied exponents instead of adding
      'exp-sign': 1, // Exponent has the wrong sign
      'expand-sign': 1, // Expanded a sum × difference as a sum
      'exponent': 1, // Used a different exponent
      'ext-half': 1, // Stopped at a^(1/2)
      'ext-sign': 1, // Sign error solving for a
      'extra-costs': 1, // Left out extra costs
      'factor-const': 1, // Missing factor has the wrong constant
      'factor-degree': 1, // Missing factor has the wrong degree
      'factor-middle': 1, // Missing factor has a wrong middle term
      'factor-swap': 1, // Factors swapped (top/side)
      'fc-product': 1, // Multiplied the exponents (no +1)
      'fee-first': 1, // Used the 1-day charge as the fee
      'first-only': 1, // Multiplied only the first term in the bracket
      'first-term': 1, // Used the first value as the constant
      'fix-step2': 1, // Fixed only Step 3 (coefficient still wrong)
      'fix-step3': 1, // Fixed only Step 2 (exponent of a still wrong)
      'fl-total': 1, // Added only two of the four partial products
      'flat-time': 1, // Total time on flat segments wrong
      'flip': 1, // Fraction upside down
      'flip-99': 1, // Used 100 instead of 99 for the repeating block
      'flip-back': 1, // Didn’t move the negative power up from the denominator
      'flip-exp': 1, // Variable on the wrong side of the fraction bar
      'flip-ratio': 1, // Divided the wrong way round
      'fn-add-fns': 1, // Added instead of subtracting
      'fn-binom-sq': 1, // Squared a binomial as (a+b)² = a² + b²
      'fn-coef-in': 1, // Put the coefficient inside the square: 2(x+4)² as (2x+8)²
      'fn-coef-power': 1, // Squared the coefficient with the input: (3·2)²
      'fn-cube-neg': 1, // Cube of a negative given as positive
      'fn-dist': 1, // Didn’t multiply every term of the bracket
      'fn-dist-sign': 1, // Didn’t change the sign of the second term in the bracket
      'fn-drop': 1, // Dropped part of the input expression
      'fn-fee': 1, // Left out the fixed fee
      'fn-inner': 1, // Ignored the expression inside the brackets
      'fn-minus-square': 1, // Treated −x² as (−x)²
      'fn-neg-drop': 1, // Dropped the negative sign of an input
      'fn-neg-out': 1, // Gave −F(x) for F(−x)
      'fn-neg-square': 1, // Squared a negative and got a negative
      'fn-one-root': 1, // Used only one solution
      'fn-order': 1, // Subtracted before multiplying
      'fn-rad-add': 1, // Added instead of multiplying the coefficients
      'fn-rad-coef': 1, // Forgot the coefficient in front of the radical
      'fn-rad-noroot': 1, // Left the perfect square under the radical
      'fn-rad-square': 1, // Squared the radicand: (√2)² as 4
      'fn-reverse': 1, // Subtracted in the wrong order
      'fn-scale-out': 1, // Multiplied the whole output instead of the input
      'fn-solve-divide': 1, // Didn’t divide by the coefficient
      'fn-solve-inverse': 1, // Inverse-operation slip (added instead of subtracted)
      'fn-sq-coef': 1, // Squared only the letter: (2a)² as 2a²
      'fn-sqrt-not': 1, // Didn’t take the square root
      'fn-zero-all': 1, // Gave f(0) = 0
      'fn-zero-coef': 1, // Treated m·0 as m
      'foil-only': 1, // Only 4 partial products (FOIL) — missed the trinomial’s middle term
      'foot-wrong': 1, // Wrong foot of the perpendicular
      'forgot-a2': 1, // Forgot to subtract a²
      'forgot-centre': 1, // Forgot the fixed part of the pattern
      'forgot-m': 1, // Root of (mx − s) taken as s instead of s/m
      'formula': 1, // Substituted into the formula incorrectly
      'frac-add': 1, // Added numerators and denominators
      'frac-den': 1, // Forgot to divide by the coefficient’s denominator
      'frac-div': 1, // Divided by a fraction incorrectly
      'frac-num': 1, // Forgot to multiply by the coefficient’s numerator
      'ft-sign': 1, // Sign error substituting −t
      'ft-zero': 1, // Cancelled everything
      'full-diag': 1, // Used the whole diagonal
      'full-square': 1, // Squared the whole middle coefficient
      'game-I': 1, // Scored only the integer category
      'game-W': 1, // Scored a negative card as whole
      'game-noQ': 1, // Forgot that integers are rational
      'game-pos': 1, // Scored a negative card as natural/whole
      'game-tot': 1, // A card scored in the wrong categories
      'gave-base': 1, // Gave the base instead of the height
      'gave-j': 1, // Gave the number in the second bracket instead of the constant
      'gcf-coef': 1, // GCF coefficient doesn’t divide every coefficient
      'gcf-extra-prime': 1, // GCF: included a prime not in every number
      'gcf-high': 1, // GCF exponent too high
      'gcf-high-power': 1, // GCF: used the highest power of a shared prime
      'gcf-not-greatest': 1, // A common factor, but not the greatest
      'gcf-part': 1, // Took out only part of the GCF
      'gcf-power': 1, // Wrong power of the variable in the GCF
      'gcf-small': 1, // Took out a common factor that isn’t the greatest
      'gf-b-undivided': 1, // Didn’t divide the constant by B
      'gf-k-mixed': 1, // Matched the wrong characteristic
      'gf-no-const': 1, // Didn’t multiply the constant by the common denominator
      'gf-no-y': 1, // Didn’t multiply the y-term by the common denominator
      'gf-other-b': 1, // Used the y-intercept of the wrong line
      'gf-point-sign': 1, // Point read with the wrong sign from y − y₁ = m(x − x₁)
      'gf-x-undivided': 1, // Didn’t divide the constant by A
      'gf-y-sign': 1, // Moved y across without changing its sign
      'gf-zero-B': 1, // Wrote a coefficient for a missing term
      'given-slope-sign': 1, // Slope of Ax+By+C=0 taken as A/B
      'gr-b-xaxis': 1, // Graph: plotted b on the x-axis
      'gr-flip': 1, // Graph: rise and run swapped
      'gr-icpt': 1, // Graph: right slope, wrong y-intercept
      'gr-join': 1, // Graph: points not joined into a line
      'gr-sign': 1, // Graph: slope sign wrong
      'gr-slope': 1, // Graph: right y-intercept, wrong slope
      'gr-xint': 1, // Graph: wrong x-intercept
      'grade-whole': 1, // Used the percent as a whole number
      'graph-b-x': 1, // Graph: b plotted on the x-axis
      'graph-extra': 1, // Extra point
      'graph-flip': 1, // Graph: rise and run swapped
      'graph-int-sign': 1, // Graph: intercept signs
      'graph-int-swap': 1, // Graph: intercepts swapped
      'graph-joined': 1, // Joined discrete points
      'graph-left': 1, // Graph starts at the wrong place
      'graph-lines': 1, // Drew lines instead of points
      'graph-missing': 1, // Point missing
      'graph-not-joined': 1, // Did not join continuous points
      'graph-slope-sign': 1, // Graph: slope sign
      'grid-alt': 1, // Wrong method in the table
      'ground-h': 1, // Solved with the wrong value of h
      'group-sign': 1, // Wrong sign on a group’s common factor
      'half': 1, // Left out the ½ of the triangle area formula
      'half-k': 1, // Gave n instead of 2n
      'half-perim': 1, // Gave half the perimeter
      'half-root': 1, // Square-rooted only part of the fraction
      'half-wrong': 1, // Halved instead of doubling to clear the ½
      'height-minus': 1, // Wrote the height as base minus the difference
      'hidden-1': 1, // Missed the hidden coefficient 1 (or −1)
      'hidden-higher': 1, // Missed a higher-degree term written later
      'hidden-one': 1, // Forgot a hidden exponent of 1
      'hyp-added': 1, // Added the squares when the hypotenuse was given
      'ic-pt': 1, // Intercept point not on the axis
      'icpt-axis': 1, // Intercept written as a point on the wrong axis
      'ignored-power': 1, // Ignored the power of 10 already there
      'incomplete': 1, // Unfinished
      'index': 1, // Wrong index
      'index-power': 1, // Swapped the index and the power
      'inner-root': 1, // Didn’t apply the outer root to everything inside
      'inner-roots': 1, // Skipped the inner roots of a nested radical
      'inner-sign': 1, // Sign error with nested brackets
      'inside-first': 1, // Didn’t simplify inside the root first
      'int-bad-value': 1, // Wrong intercept value (written as a value)
      'int-extra': 1, // Extra intercept
      'int-missing': 1, // Missed an intercept
      'int-no-div': 1, // Didn’t divide by the coefficient
      'int-no-divide': 1, // Didn’t divide by the coefficient
      'int-no-root': 1, // Didn’t take the square root
      'int-off-axis': 1, // Point not on the axis
      'int-one-root': 1, // Gave only one of two x-intercepts
      'int-pt-flip': 1, // Intercept point with the coordinates swapped
      'int-zero': 1, // Dropped the constant term
      'inv-no-div': 1, // Didn’t divide by the coefficient
      'inv-sign': 1, // Moved the constant with the wrong sign
      'io-extra': 1, // Extra value in the list
      'io-missing': 1, // Missed a value in the list
      'k-all': 1, // Multiplied by every prime
      'k-both': 1, // Number in front multiplied into both brackets
      'k-first': 1, // Number in front multiplied into only one term
      'k-flip': 1, // Run over rise when working backwards
      'k-forgot': 1, // Forgot the number in front
      'k-four': 1, // Middle coefficient doubled twice
      'k-half': 1, // Middle coefficient not doubled
      'k-in-square': 1, // Number in front put inside the square
      'k-no-start': 1, // Forgot the starting coordinate
      'k-once': 1, // Multiplied by each missing prime only once
      'k-sum': 1, // Added the square roots instead of 2ab
      'k-twice': 1, // Multiplied the number into both brackets
      'k-yint': 1, // Gave the y-intercept instead of k
      'kept-exp': 1, // Kept the exponent instead of adding
      'kept-inside': 1, // Took a factor out but left it inside too
      'kept-neg': 1, // Kept the root that has no meaning
      'kept-sign': 1, // Said √(x²) = x for negative x
      'kept-var': 1, // Kept a letter that divides out
      'kits-total': 1, // Gave a total instead of the amount in each group
      'l5-b-table': 1, // Took b from a table value not at x = 0
      'l5-c-sign': 1, // Sign slip moving the constant
      'l5-dist': 1, // Didn’t distribute the slope
      'l5-gr-bx': 1, // Plotted b on the x-axis
      'l5-gr-flip': 1, // Graphed run over rise
      'l5-gr-half': 1, // Forgot to divide by the coefficient
      'l5-gr-isign': 1, // Intercept signs wrong
      'l5-gr-pt': 1, // Point signs not flipped (slope–point)
      'l5-gr-round': 1, // Rounded a fractional intercept
      'l5-gr-sign': 1, // Graphed with the slope sign wrong
      'l5-half-area': 1, // Forgot the ½ in the area
      'l5-line-missing': 1, // A line missing
      'l5-line-wrong': 1, // One of the lines wrong
      'l5-nodiv': 1, // Didn’t divide every term
      'l5-nr-dist': 1, // Slope not distributed
      'l5-pair-axes': 1, // Intercepts on the wrong axes
      'l5-point-off': 1, // Plotted a point not on the line
      'l5-points-only': 1, // Plotted points but no line
      'l5-ps-sign': 1, // Point read with the bracket signs
      'l5-run': 1, // Change in y not divided by the run
      'l5-shift': 1, // Right slope, wrong position
      'l5-slope': 1, // Right starting point, wrong slope
      'l5-step': 1, // Slope from y-change alone
      'l5-window-big': 1, // Window far too large
      'l5-window-x': 1, // Window misses an x-intercept
      'l5-window-y': 1, // Window misses a y-intercept
      'law-added': 1, // Added exponents where the law multiplies or subtracts
      'law-divided': 1, // Divided the exponents instead of subtracting
      'lcm-low-power': 1, // LCM: used a lower power of a prime
      'lcm-missing': 1, // Left a prime out of the LCM
      'lcm-missing-prime': 1, // LCM: left out a prime
      'lcm-not-least': 1, // Common multiple, but not the least
      'lcm-over-gcf': 1, // Divided LCM by GCF
      'lcm-product': 1, // Multiplied the numbers instead of finding the LCM
      'lcm-units': 1, // Converted seconds to minutes wrongly
      'lead-add': 1, // Added leading coefficients instead of multiplying
      'leftover-1': 1, // Leftover radicand of 1
      'leftover-4': 1, // Leftover radicand is a perfect square
      'leftover-b': 1, // Lost a term of the leftover bracket
      'leftover-dist': 1, // Leftover bracket not distributed correctly
      'leftover-sign': 1, // Sign error in the leftover bracket
      'leftover-var': 1, // Kept a variable that cancels (x ÷ x = 1)
      'len-no-root': 1, // Forgot the square root
      'line-intercept': 1, // Wrong y-intercept
      'line-point': 1, // Misses the given point
      'line-slope': 1, // Wrong slope
      'line-slope-flip': 1, // Run over rise
      'line-slope-sign': 1, // Slope sign
      'line-x': 1, // Vertical line: wrong x
      'lost-2ab': 1, // Lost the middle term 2ab
      'lost-zero': 1, // Lost the solution 0 (divided by the variable)
      'max-block': 1, // Gave the maximum block length, not the actual
      'max-exp': 1, // GCF: used the highest power instead of the lowest
      'mid-area': 1, // Used the wrong height
      'mid-coef': 1, // Gave the middle coefficient 2AB
      'mid-half': 1, // Didn’t halve the sums (midpoint)
      'mid-missing': 1, // Left out the middle piece (2Nd)
      'mid-no-halve': 1, // Midpoint: didn’t divide by 2
      'mid-not-doubled': 1, // Middle piece not doubled
      'mid-sum': 1, // Added the coordinates but didn’t halve
      'middle': 1, // Factor pair gives the wrong middle term
      'middle-once': 1, // Middle term of a square not doubled
      'minus-bracket': 1, // Minus sign not applied to every term of the block
      'minus-dist': 1, // Subtracted a bracket without changing every sign
      'minus-first': 1, // Minus sign applied only to the first term
      'minus-ignored': 1, // Added a product that is subtracted
      'missed': 1, // Missed one
      'missed-factor': 1, // Didn’t apply the power to every factor
      'missed-power': 1, // Forgot the outside exponent
      'missed-prime': 1, // Missed a prime with the wrong exponent
      'missed-q': 1, // Forgot that integers are rational
      'missed-qbar': 1, // Left out Q̄
      'missing-b': 1, // Missed some values of b
      'missing-r': 1, // Left out R
      'missing-var': 1, // GCF: included a letter missing from a term
      'mm-cm': 1, // Unit conversion (mm³ to cm³)
      'move-sign': 1, // Sign error moving a term across
      'mult': 1, // Multiplied exponents instead of adding
      'mult-coef': 1, // Multiplied the coefficients when dividing
      'mult-exp': 1, // Multiplied exponents (should add)
      'mult-index': 1, // Multiplied the index into the exponent
      'multi-var-deg': 1, // Missed the degree of a two-variable term
      'multiplied': 1, // Multiplied instead of dividing
      'n-squared': 1, // Treated (cⁿ)ⁿ as c²ⁿ
      'neg-base': 1, // Applied the exponent to the minus sign (−aⁿ read as (−a)ⁿ)
      'neg-brackets': 1, // Calculator: negative base not in brackets
      'neg-first': 1, // Negative monomial: sign applied to the first term only
      'neg-inside': 1, // Put the negative under an even root
      'neg-lead': 1, // Sign slip when multiplying through by −1
      'neg-one': 1, // Mishandled the exponent −1
      'neg-root': 1, // Kept the root before the throw
      'neg-signs': 1, // Negative factor: signs inside the bracket not all changed
      'neg-square': 1, // Squared a negative to a negative
      'neg-time': 1, // Kept the negative root for time
      'neg-whole': 1, // Put a negative number in W or N
      'neg-zero': 1, // Read −w⁰ as (−w)⁰
      'nest': 1, // Missed a set the number is nested in
      'nested-one-root': 1, // Took only one of the two roots
      'new-area': 1, // Gave the new area instead of the increase
      'nine-tenths': 1, // Treated the repeating 9 as a single digit
      'nl-side': 1, // Shaded the wrong side
      'no-3': 1, // Left out the 3s of the cube pattern
      'no-align': 1, // Added/subtracted without a common power of 10
      'no-back-sub': 1, // Left the substitution letter in the answer
      'no-bar': 1, // Didn’t show the repeating block
      'no-brackets': 1, // Calculator: exponent not in brackets
      'no-change': 1, // Added instead of subtracting (no signs changed)
      'no-coef': 1, // Forgot to multiply by the coefficient
      'no-const': 1, // Left out the constant
      'no-constant': 1, // Equation missing the constant term
      'no-cross': 1, // Left out the cross terms
      'no-dist': 1, // Did not distribute
      'no-divide': 1, // Didn’t divide by the coefficient
      'no-double': 1, // Middle term not doubled
      'no-ends': 1, // Left out the ends of the cylinder
      'no-fee': 1, // Left out the starting value
      'no-fixed': 1, // Left out the fixed fee
      'no-flip': 1, // Didn’t take the reciprocal (negative exponent)
      'no-group-middle': 1, // Squared the grouped binomial without its middle term
      'no-half': 1, // Forgot the ½ in the triangle area
      'no-halve': 1, // Didn’t halve the exponent when taking it out
      'no-height': 1, // Forgot the height of the box
      'no-lead-subtract': 1, // Forgot to subtract the lead
      'no-middle': 1, // Squared a binomial without the middle term
      'no-mult': 1, // Multiplied only one term
      'no-negatives': 1, // Forgot the negative values
      'no-one': 1, // Forgot the invisible exponent 1
      'no-pi': 1, // Left out π
      'no-platform': 1, // Ignored the starting height
      'no-power': 1, // Flipped the fraction but didn’t raise it to the power
      'no-radicand': 1, // Forgot to multiply by the radicand
      'no-rearrange': 1, // Didn’t move every term to one side first
      'no-recip': 1, // Forgot the reciprocal (negative exponent)
      'no-renorm': 1, // Did not renormalize the coefficient
      'no-root': 1, // Gave the squared distance (no square root)
      'no-sq-first': 1, // Rounded/compared before squaring
      'no-square': 1, // Didn’t square the legs
      'no-square-d': 1, // Did not square d
      'no-sub32': 1, // Did not subtract 32
      'no-subtract': 1, // Didn’t subtract the constant
      'no-whole': 1, // Lost the whole-number part
      'no-x': 1, // Left out the height factor x
      'no-zero-pairs': 1, // Did not cancel zero pairs
      'no-zeros': 1, // Left out the zeros for the lead
      'not-b': 1, // Listed a value that isn’t a pair sum
      'not-cube': 1, // Treated a prism as a cube
      'not-divided': 1, // Did not divide every term by the coefficient of y
      'not-doubled': 1, // Middle term of a perfect square not doubled
      'not-finished': 1, // Accepted an answer that is not factored completely
      'not-flipped': 1, // Treated opposite brackets as the same
      'not-greatest': 1, // A common factor, but not the greatest
      'not-halved': 1, // Didn’t halve the middle coefficient
      'not-increase': 1, // Gave the new area, not the increase
      'not-innermost': 1, // Chose an outer region, not the innermost
      'not-integer': 1, // Put a non-integer in I, W or N
      'not-largest': 1, // Gave a valid b that isn’t the largest
      'not-raised': 1, // Didn’t raise the coefficient to the power
      'not-reduced': 1, // Applied the denominator test before reducing
      'not-simplest': 1, // Radical not in simplest form
      'not-smallest': 1, // Correct kind, but not the smallest
      'not-sq': 1, // Did not square
      'not-squared': 1, // Didn’t square the root
      'not-subtracted': 1, // Did not subtract the old area
      'np-order': 1, // Numbers out of order on the line
      'np-root': 1, // Kept √(negative)
      'nr-12m': 1, // Left out b
      'nr-all-pairs': 1, // Counted repeated values
      'nr-centre': 1, // Left out the radius / centre
      'nr-coef': 1, // Coefficient not raised to the power
      'nr-flip': 1, // Slope as run over rise
      'nr-forgot-a': 1, // Left a out of a + b + c
      'nr-forgot-start': 1, // Forgot the hours already run
      'nr-neg-only': 1, // Changed the sign but didn’t take the reciprocal
      'nr-no-square': 1, // Forgot the final square
      'nr-noa': 1, // Left the coefficient out of the sum
      'nr-one-step': 1, // Went only one step further
      'nr-part': 1, // Left out a term
      'nr-partial-gcf': 1, // Used the squares instead of their roots
      'nr-perp-sign': 1, // Perpendicular slope sign
      'nr-pos-only': 1, // Multiplied only the positive intercepts
      'nr-slope': 1, // Gave the slope
      'nr-start-sign': 1, // Subtracted instead of added to find the start
      'nr-step': 1, // Used the change per column, not per unit
      'nr-step1': 1, // Treated the x-step as 1
      'nr-sum': 1, // Added instead of multiplying
      'nr-unsimp': 1, // Fraction not simplified before reading p
      'num-only': 1, // Raised only the numerator
      'one-base': 1, // Cylinder: only one circular base
      'one-bed': 1, // Subtracted only one of the beds
      'one-cut': 1, // Took only one cut off a side
      'one-die': 1, // Found one die instead of the container
      'one-dim': 1, // One dimension wrong
      'one-end': 1, // Only one end of the cylinder
      'one-end-border': 1, // Added the border at one end only
      'one-exp': 1, // Forgot that a bare base has exponent 1
      'one-middle': 1, // FOIL: one of the two middle products missing
      'one-num': 1, // Added 1 to the numerator only
      'one-pair': 1, // Only one pair
      'one-piece': 1, // Found only one of the pieces
      'one-root': 1, // Gave only one of two answers
      'one-root-dos': 1, // Only one root of a difference of squares
      'one-sol': 1, // Found only one of the two answers
      'one-solution': 1, // Found only one solution
      'one-stop': 1, // Counted only one of the stops
      'one-strip': 1, // Counted only one strip
      'only-a': 1, // Gave a (or b) instead of a + b
      'only-last': 1, // Multiplied the monomial into only one term
      'only-one-root': 1, // Took only one root
      'only-positive': 1, // Missed the negative solution
      'order-ops': 1, // Order of operations
      'other-gcf': 1, // Other number has the wrong GCF
      'other-lcm': 1, // Other number has the wrong LCM
      'other-ratio': 1, // Divided the LCM by the given number (forgot the GCF)
      'other-root': 1, // Gave the rejected root
      'outer-inner': 1, // Left out the outer and inner products
      'outer-only': 1, // Gave the outer area only
      'outputs-extra': 1, // Listed outputs that don’t belong to the input
      'outputs-missing': 1, // Left out some outputs of the input
      'outside-in': 1, // Multiplied a term that is outside the bracket
      'outside-lost': 1, // Dropped the factor in front of the radical
      'overlap': 1, // Composite area: pieces overlap
      'pair-gcf': 1, // A pair with the wrong GCF
      'pair-lcm': 1, // A pair with the wrong LCM
      'pair-missing': 1, // Missed a pair
      'pair-place': 1, // Numbers in the wrong brackets (middle term off)
      'pairs-missing': 1, // Missing ordered pairs
      'par-one-d': 1, // Found only one fourth vertex
      'part-div': 1, // Divided only some terms
      'partial': 1, // A partial product wrong
      'partial-miss': 1, // Missed a partial product
      'pct-as-coef': 1, // Percent used as the coefficient
      'pct-original': 1, // Took the percent of the original height every time
      'per-min': 1, // Rate per minute instead of per hour
      'per-side': 1, // Perimeter missing a side
      'per-two': 1, // Rate per 2 units instead of per 1
      'perim-half': 1, // Used L + W for the perimeter instead of 2(L + W)
      'perim-s': 1, // Added the two unknown sides only once
      'perim-side': 1, // Left a side out of the perimeter
      'perp-nosign': 1, // Took the reciprocal but didn’t change the sign
      'perp-recip-only': 1, // Perpendicular: took only the reciprocal
      'pf-coef': 1, // Prime factors multiply to the wrong number
      'pf-vars': 1, // Wrong letters in a prime factorization
      'photo-square': 1, // Squared a binomial as two squares
      'pi-inside': 1, // π left inside the bracket
      'place': 1, // Place value off by a power of 10
      'place-value': 1, // Right digit, wrong place value
      'places': 1, // Decimal point moved the wrong number of places
      'plot-count': 1, // Missing or extra point
      'plot-shift': 1, // Points shifted by one reading
      'plus-k': 1, // Substituted the wrong sign
      'pm-k': 1, // Found only one value of k
      'poly-edge': 1, // A segment of the figure is missing
      'poly-extra': 1, // Joined points out of order
      'poly-join': 1, // Plotted the points but didn’t join them
      'pos-only': 1, // Missed the negative answer
      'pos-root-only': 1, // Took only the positive square root
      'power-add': 1, // Added the exponent and the power instead of multiplying
      'power-not-root': 1, // Gave the perfect power instead of its root
      'power-off': 1, // Power of 10 off
      'profit-one': 1, // Left out one of the extra costs
      'ps-distribute': 1, // Didn’t multiply the slope into the bracket
      'ps-sign': 1, // Slope–point form: signs of the point not flipped
      'ps-signs': 1, // Slope–point form: added instead of subtracted
      'pst-half': 1, // Middle term is half of what a perfect square needs
      'pst-sign': 1, // Perfect square with the wrong sign in the bracket
      'pt-dir': 1, // West/south not written as negative
      'pt-extra': 1, // Extra point
      'pt-missing': 1, // Missed an intercept
      'pt-other': 1, // Point read wrongly
      'pt-signs': 1, // Point read with both signs wrong
      'pts-extra': 1, // A point that doesn’t work
      'pts-flip': 1, // Point stepped run-over-rise
      'pts-missing': 1, // Missed a point
      'pts-sign': 1, // Point stepped with the wrong slope sign
      'pyr-base': 1, // Used the whole base as the run
      'pyr-diag': 1, // Used the whole diagonal
      'pyr-half': 1, // Used half the side instead of half the diagonal
      'q-and-qbar': 1, // Checked both Q and Q̄
      'q-not-mult': 1, // Second term not multiplied through the trinomial
      'rate-dy': 1, // Used the change in the output only
      'rate-first': 1, // Used the first charge as the rate
      'rate-flip': 1, // Rate upside down
      'rate-no-run': 1, // Forgot to divide by the change in distance
      'rate-not-div': 1, // Rate: did not divide by the step in n
      'rate-point': 1, // Divided a coordinate instead of a change
      'rate-step': 1, // Didn’t divide by the step in x
      'rate-total': 1, // Used the change over several days as the daily rate
      'rate-unit': 1, // Rate in the wrong units
      'rate-units': 1, // Rate units upside down
      'read-scale': 1, // Ignored the axis scale
      'recip': 1, // Missed the reciprocal (negative exponent)
      'renorm-dir': 1, // Renormalized in the wrong direction
      'repeated': 1, // Counted a repeated solution twice
      'rev-order': 1, // Brackets give B² − A² (squares taken in the wrong order)
      'revenue': 1, // Gave the revenue, not the profit
      'reverse': 1, // Subtracted in the wrong order
      'rhs': 1, // Gave the right side instead of the left side’s value
      'right-side': 1, // Right side wrong
      'road-half': 1, // Gave the road to one town only
      'root-extra': 1, // Equation has an extra root
      'root-missing': 1, // Did not take the square root
      'root-of-k': 1, // Gave pk instead of its root
      'root-only': 1, // Took the root but not the power
      'root-sign': 1, // Root ↔ factor sign mix-up
      'root-value': 1, // Wrong root
      'row': 1, // A row of the table wrong
      'rr-swap': 1, // Rise and run swapped
      'rsq-coef': 1, // Squared only the radicand, not the coefficient
      'rule-avoid': 1, // Includes an excluded point
      'rule-domain': 1, // Wrong domain in sketch
      'rule-range': 1, // Wrong range in sketch
      'rule-through': 1, // Misses a required point
      'rule-xint': 1, // Sketch: wrong number of x-intercepts
      'rule-yint': 1, // Sketch: wrong number of y-intercepts
      'sa-face': 1, // Left out a pair of faces
      'sa-half': 1, // Surface area without the factor 2
      'scale': 1, // Ignored the grid scale
      'scale-none': 1, // Forgot the map scale
      'scale-squares': 1, // Counted squares instead of units
      'sd-middle': 1, // Stray middle term in sum × difference
      'sd-plus': 1, // Sum × difference gave a² + b²
      'second-added': 1, // Added the second bracket instead of subtracting it
      'second-partial': 1, // Second term of the binomial multiplied by only part of the trinomial
      'sel-missing': 1, // Missed a pair
      'set-arrow': 1, // Misread an arrow / end point
      'set-continuous': 1, // Listed values for a continuous set
      'set-discrete': 1, // Used an interval for separate points
      'set-extra': 1, // Extra values in the set
      'set-missing': 1, // Left values out of the set
      'set-segment': 1, // Gave a segment’s domain for a whole line
      'set-swap': 1, // Gave the range for the domain (or reverse)
      'set-xy': 1, // Used x-values for the range (or y for the domain)
      'sets-Q': 1, // Left out Q
      'sets-R': 1, // Left out R
      'sets-both': 1, // Ticked both rational and irrational
      'sets-frac': 1, // Put a non-integer in N, W or I
      'sets-irr': 1, // Missed that a number is irrational
      'sets-irr-int': 1, // Put an irrational number in N, W or I
      'sets-nat': 1, // Missed W or I for a natural number
      'sets-neg': 1, // Put a negative number in N or W
      'sets-negint': 1, // Missed I for a negative integer
      'sets-nonreal': 1, // Put a non-real number in a set
      'sets-zero': 1, // Missed W or I for 0
      'shared-time': 1, // Gave an arrival time instead of the difference
      'shift-sign': 1, // Moved the wrong way from the known coordinate
      'si-zero-b': 1, // Dropped the x-term when b = 0
      'side-not-x': 1, // Gave x instead of the requested length
      'side-only': 1, // Gave one side only
      'side-scaled': 1, // Multiplied the side instead of the area
      'sign-all': 1, // Every sign flipped
      'sign-k': 1, // Wrong sign in the model equation
      'sign-rate': 1, // Wrong sign on the rate
      'sign-swap': 1, // Signs in the wrong brackets (pair by product only)
      'six-faces': 1, // Forgot the cube has 6 faces
      'six-power': 1, // Raised a root to the 6th power wrongly
      'sk-endx': 1, // Sketch: domain ends at the wrong value
      'sk-endy': 1, // Sketch: wrong end value (rate)
      'sk-few': 1, // Sketch: too few points for a curve
      'sk-gap': 1, // Sketch: gap in the graph
      'sk-join': 1, // Sketch: joined points for a list domain
      'sk-k': 1, // Sketch: wrong intercept value
      'sk-land': 1, // Sketch: landing point missing
      'sk-lines': 1, // Sketch: more than one line / bent line
      'sk-points': 1, // Sketch: stray points
      'sk-shape': 1, // Sketch: curve falls fastest at the start
      'sk-sign': 1, // Sketch: intercept with the wrong sign
      'sk-slope-sign': 1, // Sketch: slope with the wrong sign
      'sk-startx': 1, // Sketch: domain starts at the wrong value
      'sk-starty': 1, // Sketch: wrong starting value
      'sk-straight': 1, // Sketch: not one straight segment (linear) / straight instead of a curve
      'sk-swap': 1, // Sketch: domain and range swapped
      'skip-root': 1, // Skipped the root inside the bracket
      'skipped': 1, // Skipped the next allowed value
      'slope-flip': 1, // Run over rise
      'slope-sign': 1, // Slope sign
      'smallest-sum': 1, // Used the smallest pair sum, not the largest
      'sol-extra': 1, // Extra solution
      'sol-flip': 1, // Solved ax + b = 0 upside down
      'sol-graph-missing': 1, // Stopped at the first crossing
      'sol-interval': 1, // Missed the flat piece of solutions
      'sol-missing': 1, // Missed a solution
      'sol-point-only': 1, // Missed the single solution
      'sol-sign': 1, // Solutions with the wrong sign
      'solve-inverse': 1, // Undid the constant the wrong way
      'solve-no-div': 1, // Didn’t divide by the coefficient
      'sort-irr': 1, // Missed an irrational number
      'sort-nr': 1, // Missed a non-real number
      'sort-rat': 1, // Missed a rational number
      'sq-coef': 1, // Squared the coefficient too
      'sq-full': 1, // Other diagonal twice too long
      'sq-last-neg': 1, // Made the last square negative
      'sq-neg': 1, // Squared a negative as negative
      'sq-no-middle': 1, // Perfect square written without its middle term
      'sq-not-doubled': 1, // Middle term of a square not doubled
      'sq-recip': 1, // Used the reciprocal slope (no sign change) for the other diagonal
      'sq-split': 1, // Squared a binomial without the middle term
      'square-middle': 1, // Squared a binomial without the middle term
      'square-only': 1, // Squared but did not multiply by the third factor
      'squared': 1, // Took two of each prime instead of one
      'squared-k': 1, // Squared the coefficient instead of doubling
      'squared-not-cubed': 1, // Squared instead of cubed
      'squared-only': 1, // Squared but didn’t take the root
      'ss-inner': 1, // Not the innermost set
      'ss-rational': 1, // Rational vs irrational
      'ss-subset': 1, // Put in a set it isn’t in
      'stair': 1, // Staircase steps wrong
      'step-skipped': 1, // Gave the final result instead of the step asked for
      'step-wrong': 1, // Wrong amount added per figure
      'stepback': 1, // Stepped back a whole column instead of to x = 0
      'stmt-scale': 1, // Counted grid squares instead of using the scale
      'story-bend': 1, // Stage drawn with the wrong bend (straight vs curved, steeper vs flatter)
      'story-count': 1, // Wrong number of stages
      'story-cycles': 1, // Cycles not identical
      'story-dir': 1, // A stage goes the wrong way
      'story-gap': 1, // Gap in story graph
      'story-height': 1, // Stage at the wrong values
      'story-lines': 1, // Points instead of a line
      'story-peaks': 1, // Peak heights wrong
      'story-rush': 1, // Rise / fall too slow for the story
      'story-speed': 1, // Speed change not shown
      'story-steep': 1, // Steepness wrong
      'story-time': 1, // Stage at the wrong times
      'story-when': 1, // A stage at the wrong time
      'story-zero': 1, // Graph reaches zero when it shouldn’t (or not when it should)
      'stretch-b': 1, // Wrong set of heights
      'sub-coef': 1, // Subtracted the coefficients instead of dividing
      'sub-exp': 1, // Subtracted exponents when multiplying
      'sub-first': 1, // Subtracted a bracket but changed only its first sign
      'sub-sign': 1, // Sign error solving for the constant
      'subtract-first': 1, // Subtracted before multiplying (order of operations)
      'sum-bracket': 1, // Wrong plus bracket in a repeated difference of squares
      'sum-own': 1, // Didn’t add own estimates
      'sum-sq': 1, // Added instead of squaring
      'swap-const': 1, // Constants in the wrong brackets
      'swapped-bounds': 1, // Smaller and larger swapped
      'tab-no-fee': 1, // Left out the flat fee
      'tab-rate': 1, // Multiplied the fee too
      'table-x': 1, // Plotted against 0, 1, 2, … instead of the table’s values
      'tails': 1, // Repeating tails don’t cancel
      'tap-off-graph': 1, // Tapped a point that is not on the graph
      'tb-gap': 1, // Did not split a gap of several steps
      'tb-sign': 1, // Table completed in the wrong direction
      'tb-step': 1, // Treated a step of 2 in x as a step of 1
      'terms-count': 1, // Wrong number of terms left in the bracket
      'third-partial': 1, // Third bracket only partly distributed
      'tile-all-pos': 1, // Rectangle: no negative tiles used
      'tile-away': 1, // Took away the wrong tiles
      'tile-colour': 1, // Ignored the colours (signs) of the tiles
      'tile-const-swap': 1, // Rectangle: unit tiles on the wrong sides
      'tile-count': 1, // Mixed up x-tiles and unit tiles
      'tile-one': 1, // Rectangle: wrong unit tiles
      'tile-one-side': 1, // Rectangle: all unit tiles on one side
      'tile-pair-product': 1, // Rectangle: x-tiles right, corner wrong
      'tile-sign-swap': 1, // Rectangle: negative tiles on the wrong side
      'tile-signs': 1, // Rectangle: signs switched on both sides
      'tile-x': 1, // Rectangle: wrong x-tiles
      'times-itself': 1, // Multiplied by the number itself (not smallest)
      'took-root-not': 1, // Didn’t take the root
      'top-only': 1, // Applied the outside exponent to only part of the bracket
      'tri-ab': 1, // Rise–run triangle for AB missing
      'tri-ad': 1, // Rise–run triangle for AD missing
      'tri-half': 1, // Triangle area: forgot the ½
      'tri-hyp': 1, // Perimeter: left out the hypotenuse
      'two-dims': 1, // Multiplied only two of the three dimensions
      'u72-b-given': 1, // Took b from the wrong line
      'u72-b-solve': 1, // Sign slip solving for b
      'u72-diff': 1, // Used the first difference as the slope
      'u72-dom-all': 1, // Domain of a vertical line as all reals
      'u72-fee': 1, // Forgot the fixed fee
      'u72-gr-endpoint': 1, // Perpendicular through an endpoint, not the midpoint
      'u72-gr-sign': 1, // Perpendicular slope with the wrong sign
      'u72-int-off': 1, // Intercept point not on the axis
      'u72-k-nodiv': 1, // Forgot to divide by the y-coefficient
      'u72-k-sign': 1, // Sign error solving for k
      'u72-mid': 1, // Midpoint error
      'u72-nr-b': 1, // NR: wrong y-intercept
      'u72-nr-perp': 1, // NR: perpendicular slope error
      'u72-origin': 1, // Through the origin: b not 0
      'u72-perp-nosign': 1, // Perpendicular: flipped but kept the sign
      'u72-pt-solve': 1, // Error solving for the coordinate
      'u72-range-all': 1, // Range of a horizontal line as all reals
      'unit-conv': 1, // Unit conversion slip
      'units-km': 1, // Did not convert km to m
      'unreduced': 1, // Didn’t reduce before b − a
      'used-endpoint': 1, // Used an endpoint instead of the midpoint
      'var-exp': 1, // Didn’t divide the variable exponent by the index
      'var-first': 1, // Variable of the monomial only on the first term
      'var-no-power': 1, // Didn’t multiply the variable exponent by the index
      'white-pos': 1, // Counted white (negative) tiles as positive
      'white-skip': 1, // Ignored the white (negative) tiles
      'whole-only': 1, // Used the whole rectangle (no piece removed)
      'width-circle': 1, // Treated the ring as a circle of radius t
      'win-big': 1, // Window far too large
      'win-cut': 1, // Window cuts off a feature that must show
      'win-cut-bottom': 1, // Window cuts off the bottom (Ymin too big)
      'win-cut-left': 1, // Window cuts off the start
      'win-cut-top': 1, // Window cuts off the top (Ymax too small)
      'win-cut-x': 1, // Window cuts off the end (Xmax too small)
      'win-edge': 1, // Feature exactly on the edge of the window
      'win-huge': 1, // Window far too large
      'win-miss': 1, // Window misses an intercept
      'wrong-power': 1, // Took out a perfect square (or wrong power) instead of the index’s power
      'x-one': 1, // Forgot the factor x = x¹
      'xint-flip': 1, // x-intercept: divided the wrong way
      'xint-recip': 1, // x-intercept: multiplied by the slope instead of its reciprocal
      'y-missing': 1, // Second variable missing from a bracket
      'year-t': 1, // Gave t instead of the year
      'zero-as-zero': 1, // Treated a zero exponent (x⁰) as 0
      'zero-coef': 1, // Applied a zero exponent to the variable only, not the whole bracket
      'zero-missed': 1, // Missed k = 0
      'zero-pairs': 1, // Miscounted zero pairs
      'zero-pow': 1, // Treated a power of 0 as 0
      'zero-power': 1 // Took a zero exponent to give 0
    }
  };
})(window);
