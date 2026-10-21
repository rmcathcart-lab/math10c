/* Outcome medals: a spinning 3D medal for each outcome, in seven levels.
 *   Rust (Not meeting) · Steel (Limited) · Bronze (Beginning) · Silver (Emerging) · Gold (Progressing) · Platinum (Advancing) · Diamond (Mastery)
 * Each outcome has its own shape, enamel colour and symbol (DESIGNS); the metal is the level, and the raised dots along the
 * bottom count the level (1 for Rust … 7 for Diamond). Mastery's enamel is cut crystal with glints, and its dots are gems.
 * The faces are drawn on a canvas as height maps (raised rim, symbol, code; the back is engraved) and rendered with three.js
 * (vendored in js/vendor/three, loaded only when a medal is first shown). One hidden WebGL canvas draws every medal and copies
 * it into each medal's own 2D canvas, so medals sit in the page like images (scrolling, pop-ups and stacking just work).
 *
 *   HW.Medals.row(list)          → an element with one small medal per item ({ o: 'AN1', tier: 4, src: 'practice' }); tap opens the viewer
 *   HW.Medals.open(list, i, opt) → the viewer: the medal big (drag to spin), its level, the outcome, and the seven levels for it
 *   HW.Medals.tierOf('PRG')      → 4   (NM 0 … MAS 6)
 * Preview of the design: the "Outcome Medals" artifact (2026-10-21). */
(function (root) {
  'use strict';
  var HW = root.HW = root.HW || {};
  var BASE = (document.currentScript && document.currentScript.src) || location.href;
  var THREE_URL = new URL('vendor/three/three.module.min.js', BASE).href, ROOM_URL = new URL('vendor/three/RoomEnvironment.js', BASE).href;
  var FONT = '"Barlow Condensed", "Arial Narrow", "Roboto Condensed", sans-serif';

  var TIERS = [
    { metal: 'Rust', lv: 'NM', name: 'Not meeting', color: '#7a4127', rough: 0.88, metalness: 0.35, rust: true },
    { metal: 'Steel', lv: 'LIM', name: 'Limited', color: '#7f878f', rough: 0.4, metalness: 1, brushed: true },
    { metal: 'Bronze', lv: 'BEG', name: 'Beginning', color: '#c07a46', rough: 0.3, metalness: 1 },
    { metal: 'Silver', lv: 'EMG', name: 'Emerging', color: '#e4e6e9', rough: 0.24, metalness: 1 },
    { metal: 'Gold', lv: 'PRG', name: 'Progressing', color: '#f3c14f', rough: 0.2, metalness: 1 },
    { metal: 'Platinum', lv: 'ADV', name: 'Advancing', color: '#c3cad3', rough: 0.05, metalness: 1, clearcoat: 1 },
    { metal: 'Diamond', lv: 'MAS', name: 'Mastery', color: '#eef2f7', rough: 0.1, metalness: 1, clearcoat: 1, iridescence: 1, gem: true }
  ];
  var TIER_OF = { NM: 0, LIM: 1, BEG: 2, EMG: 3, PRG: 4, ADV: 5, MAS: 6 };

  /* every outcome's medal: s = silhouette, c = enamel colour, i = symbol, w = words on the back */
  var R = Math.PI / 180;
  var DESIGNS = {
    AN1: { c: '#2563eb', s: { n: 6, r: 0.16, t: 90 }, i: 'tree', w: 'FACTORS & ROOTS' },
    AN2: { c: '#0369a1', s: { circle: 1 }, i: 'root', w: 'IRRATIONAL NUMBERS' },
    AN3: { c: '#ea580c', s: { n: 8, r: 0.12, t: 22.5 }, i: 'power', w: 'EXPONENTS' },
    AN4: { c: '#7c3aed', s: { n: 5, r: 0.17, t: 90 }, i: 'area', w: 'POLYNOMIALS' },
    AN5: { c: '#16a34a', s: { n: 4, r: 0.5, t: 45 }, i: 'parens', w: 'FACTORING' },
    RF1: { c: '#db2777', s: { wave: 12, d: 0.035 }, i: 'story', w: 'GRAPHS & STORIES' },
    RF2: { c: '#be185d', s: { n: 7, r: 0.16, t: 90 }, i: 'mapping', w: 'RELATIONS & FUNCTIONS' },
    RF8: { c: '#e11d48', s: { shield: 1 }, i: 'fx', w: 'FUNCTION NOTATION', dots: 0.6, step: 0.16 },
    RF3: { c: '#0d9488', s: { n: 10, r: 0.1, t: 90 }, i: 'slope', w: 'SLOPE' },
    RF4: { c: '#0891b2', s: { wave: 8, d: 0.05 }, i: 'line', w: 'LINEAR RELATIONS' },
    RF5: { c: '#0f766e', s: { n: 6, r: 0.16, t: 0 }, i: 'intercepts', w: 'INTERCEPTS & SLOPE' },
    RF6: { c: '#854d0e', s: { n: 4, r: 0.5, t: 0 }, i: 'ymxb', w: 'FORMS OF A LINE' },
    RF7: { c: '#b45309', s: { n: 9, r: 0.14, t: 90 }, i: 'parallel', w: 'EQUATIONS OF LINES' },
    RF9: { c: '#4338ca', s: { wave: 16, d: 0.022 }, i: 'system', w: 'LINEAR SYSTEMS' },
    M1: { c: '#8b5e34', s: { n: 12, r: 0.06, t: 90 }, i: 'ruler', w: 'MEASUREMENT' },
    M2: { c: '#65743a', s: { wave: 6, d: 0.06 }, i: 'convert', w: 'UNIT CONVERSIONS' },
    M3: { c: '#9a3412', s: { n: 6, r: 0.16, t: 90, sx: 0.9 }, i: 'cube', w: 'SURFACE AREA & VOLUME' },
    M4: { c: '#dc2626', s: { n: 8, r: 0.12, t: 0 }, i: 'trig', w: 'TRIGONOMETRY' }
  };
  function design(o) { return DESIGNS[o] || { c: '#475569', s: { circle: 1 }, i: '', w: '' }; }

  /* ---------------- silhouettes (points, radius ≤ 1, y up) ---------------- */
  function outline(sh) {
    var pts = [], i, a;
    if (sh.circle) { for (i = 0; i < 180; i++) { a = i / 180 * Math.PI * 2; pts.push([Math.cos(a), Math.sin(a)]); } return pts; }
    if (sh.wave) { for (i = 0; i < 360; i++) { a = i / 360 * Math.PI * 2; var rr = 1 - sh.d * (1 - Math.cos(sh.wave * a)); pts.push([rr * Math.cos(a + Math.PI / 2), rr * Math.sin(a + Math.PI / 2)]); } return pts; }
    if (sh.sq) { for (i = 0; i < 240; i++) { a = i / 240 * Math.PI * 2; var c = Math.cos(a), s = Math.sin(a), p = 2 / sh.sq; pts.push([0.94 * Math.sign(c) * Math.pow(Math.abs(c), p), 0.94 * Math.sign(s) * Math.pow(Math.abs(s), p)]); } return pts; }
    if (sh.shield) {                               // flat top with rounded corners, straight sides, curving to a point
      var seg = function (p0, p1, p2, n) { for (var k = 0; k < n; k++) { var t = k / n, u = 1 - t; pts.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]); } };
      seg([0, -1], [0.55, -0.72], [0.86, -0.2], 30); seg([0.86, -0.2], [0.86, 0.3], [0.86, 0.72], 12); seg([0.86, 0.72], [0.86, 0.94], [0.62, 0.94], 12);
      seg([0.62, 0.94], [0, 0.94], [-0.62, 0.94], 16); seg([-0.62, 0.94], [-0.86, 0.94], [-0.86, 0.72], 12); seg([-0.86, 0.72], [-0.86, 0.3], [-0.86, -0.2], 12);
      seg([-0.86, -0.2], [-0.55, -0.72], [0, -1], 30); return pts;
    }
    var n = sh.n, r = sh.r, half = Math.PI / n, Rv = 1 + r / Math.cos(half) - r, rc = Rv - r / Math.cos(half), sx = sh.sx || 1;
    for (var k = 0; k < n; k++) {
      var th = sh.t * R + k * 2 * half;
      for (var j = 0; j <= 12; j++) { a = th - half + j / 12 * 2 * half; pts.push([sx * (rc * Math.cos(th) + r * Math.cos(a)), rc * Math.sin(th) + r * Math.sin(a)]); }
    }
    return pts;
  }

  /* ---------------- symbols, drawn white on a 1024 canvas (scaled for smaller faces) ---------------- */
  function line(x, pts) { x.beginPath(); pts.forEach(function (p, i) { x[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); x.stroke(); }
  function dot(x, cx, cy, r) { x.beginPath(); x.arc(cx, cy, r, 0, Math.PI * 2); x.fill(); }
  function arrowHead(x, x1, y1, x2, y2, s) { var a = Math.atan2(y2 - y1, x2 - x1); line(x, [[x2 - s * Math.cos(a - 0.5), y2 - s * Math.sin(a - 0.5)], [x2, y2], [x2 - s * Math.cos(a + 0.5), y2 - s * Math.sin(a + 0.5)]]); }
  var ICONS = {
    tree: function (x) {                           // a factor tree, ending in circled primes
      var nodes = [[512, 222, 40], [410, 338, 33], [614, 338, 33], [344, 456, 25], [462, 456, 25], [562, 456, 25], [680, 456, 25]];
      x.lineWidth = 15; [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]].forEach(function (l) { line(x, [nodes[l[0]], nodes[l[1]]]); });
      nodes.forEach(function (n, i) { dot(x, n[0], n[1], n[2]); if (i >= 3) { x.lineWidth = 7; x.beginPath(); x.arc(n[0], n[1], n[2] + 12, 0, Math.PI * 2); x.stroke(); } });
    },
    root: function (x) { x.lineWidth = 30; line(x, [[330, 370], [380, 340], [440, 470], [505, 230], [700, 230]]); dot(x, 600, 360, 40); },
    power: function (x) { x.textAlign = 'center'; x.font = 'italic 800 230px ' + FONT; x.fillText('x', 470, 470); x.font = 'italic 800 130px ' + FONT; x.fillText('n', 600, 330); },
    area: function (x) {                           // an area model: (a + b)(c + d)
      x.lineWidth = 15; x.strokeRect(352, 210, 320, 262); line(x, [[472, 210], [472, 472]]); line(x, [[352, 312], [672, 312]]);
      x.globalAlpha = 0.55; x.fillRect(352, 210, 120, 102); x.fillRect(472, 312, 200, 160); x.globalAlpha = 1;
    },
    parens: function (x) { x.textAlign = 'center'; x.font = '800 210px ' + FONT; x.fillText('( )( )', 512, 420); },
    story: function (x) {                          // a graph that tells a story: rise, level off, fall
      x.lineWidth = 13; line(x, [[340, 200], [340, 474], [700, 474]]); arrowHead(x, 340, 474, 340, 200, 34); arrowHead(x, 340, 474, 700, 474, 34);
      x.lineWidth = 20; line(x, [[362, 450], [462, 290], [572, 290], [672, 420]]);
    },
    mapping: function (x) {                        // an arrow diagram from one set to another
      x.lineWidth = 12; [[392, 345], [632, 345]].forEach(function (c) { x.beginPath(); x.ellipse(c[0], c[1], 64, 128, 0, 0, Math.PI * 2); x.stroke(); });
      var L = [[392, 272], [392, 345], [392, 418]], Rr = [[632, 290], [632, 400]];
      L.concat(Rr).forEach(function (p) { dot(x, p[0], p[1], 15); });
      x.lineWidth = 9; [[0, 0], [1, 1], [2, 1]].forEach(function (m) { var a = L[m[0]], b = Rr[m[1]]; line(x, [[a[0] + 22, a[1]], [b[0] - 24, b[1]]]); arrowHead(x, a[0] + 22, a[1], b[0] - 24, b[1], 22); });
    },
    fx: function (x) { x.textAlign = 'center'; x.font = 'italic 800 200px ' + FONT; x.fillText('f(x)', 512, 420); },
    slope: function (x) {                          // a line with its rise and run
      x.lineWidth = 18; line(x, [[330, 470], [700, 220]]);
      x.lineWidth = 10; x.setLineDash([22, 14]); line(x, [[420, 409], [600, 409], [600, 288]]); x.setLineDash([]);
    },
    line: function (x) {
      x.lineWidth = 11; line(x, [[512, 200], [512, 486]]); line(x, [[340, 345], [690, 345]]);
      x.lineWidth = 18; line(x, [[370, 470], [660, 220]]); dot(x, 457, 395, 22); dot(x, 573, 295, 22);
    },
    intercepts: function (x) {
      x.lineWidth = 11; line(x, [[440, 196], [440, 486]]); line(x, [[330, 400], [700, 400]]);
      x.lineWidth = 18; line(x, [[386, 200], [650, 447]]); dot(x, 440, 250, 24); dot(x, 600, 400, 24);
    },
    ymxb: function (x) { x.textAlign = 'center'; x.font = 'italic 800 132px ' + FONT; x.fillText('y = mx + b', 512, 390); },
    parallel: function (x) {                       // two parallel lines and a perpendicular one
      x.lineWidth = 17; line(x, [[340, 330], [600, 200]]); line(x, [[420, 480], [690, 345]]);
      line(x, [[430, 240], [560, 500]]);
      x.lineWidth = 8; x.strokeRect(470, 300, 34, 34);
    },
    system: function (x) { x.lineWidth = 18; line(x, [[340, 450], [690, 240]]); line(x, [[350, 230], [680, 470]]); dot(x, 527, 338, 30); },
    ruler: function (x) {
      x.lineWidth = 14; x.strokeRect(318, 284, 388, 128);
      x.lineWidth = 9; for (var k = 0; k <= 8; k++) { var xx = 350 + k * 40.5; line(x, [[xx, 284], [xx, 284 + (k % 4 === 0 ? 70 : k % 2 === 0 ? 50 : 32)]]); }
    },
    convert: function (x) {
      x.textAlign = 'center'; x.font = '800 120px ' + FONT; x.fillText('in', 392, 380); x.fillText('cm', 640, 380);
      x.lineWidth = 12; line(x, [[466, 312], [556, 312]]); arrowHead(x, 466, 312, 556, 312, 26); line(x, [[556, 370], [466, 370]]); arrowHead(x, 556, 370, 466, 370, 26);
    },
    cube: function (x) {
      x.lineWidth = 14; x.lineJoin = 'round';
      var a = [400, 280], b = [580, 280], c = [580, 460], d = [400, 460], o = [70, -64];
      var sh = function (p) { return [p[0] + o[0], p[1] + o[1]]; };
      line(x, [a, b, c, d, a]); line(x, [a, sh(a), sh(b), sh(c), c]); line(x, [b, sh(b)]);
      x.setLineDash([18, 14]); x.lineWidth = 8; line(x, [d, sh(d), sh(a)]); line(x, [sh(d), sh(c)]); x.setLineDash([]);
    },
    trig: function (x) {
      x.lineWidth = 15; x.lineJoin = 'round'; line(x, [[340, 470], [690, 470], [690, 220], [340, 470]]);
      x.lineWidth = 8; x.strokeRect(650, 430, 40, 40);
      x.beginPath(); x.arc(340, 470, 92, -0.62, 0); x.stroke();
      x.textAlign = 'center'; x.font = 'italic 800 76px ' + FONT; x.fillText('θ', 476, 452);
    }
  };

  /* level dots: positions in face units */
  function dotSpots(o, n) { var d = design(o), r0 = d.dots || 0.645, st = d.step || 0.205, out = []; for (var i = 0; i < n; i++) { var a = Math.PI / 2 + (i - (n - 1) / 2) * st; out.push([r0 * Math.cos(a), -r0 * Math.sin(a)]); } return out; }

  /* ---------------- the 3D part (after three.js loads) ---------------- */
  var G = null, loading = null;
  function load() {
    if (!loading) loading = Promise.all([import(THREE_URL), import(ROOM_URL), document.fonts && document.fonts.load ? Promise.all([document.fonts.load('800 100px "Barlow Condensed"'), document.fonts.load('700 100px "Barlow Condensed"')]).catch(function () {}) : null])
      .then(function (m) { G = engine(m[0], m[1].RoomEnvironment); return G; });
    return loading;
  }

  function engine(THREE, RoomEnvironment) {
    var gl = document.createElement('canvas'), renderer;
    renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, alpha: true, preserveDrawingBuffer: false });
    renderer.setPixelRatio(1); renderer.setClearColor(0x000000, 0); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05; renderer.autoClear = false;
    var scene = new THREE.Scene(), pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.03).texture;
    var key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-2.5, 3, 4); scene.add(key);
    var rim = new THREE.DirectionalLight(0xbfd4ff, 1.4); rim.position.set(3, -1, -2); scene.add(rim);
    var camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20); camera.position.set(0, 0, 4.7);
    var CAP = 0.11, DISP = 0.075, FIELD = 0.16, ENAMEL_FROM = 0.142;

    var sstep = function (a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    function rimHeight(u) {
      var h;
      if (u < 0.016) h = 0.55 * sstep(0, 0.016, u);
      else if (u < 0.07) h = 0.55 + 0.2 * Math.sin(Math.PI * (u - 0.016) / 0.054);
      else h = 0.55 + (FIELD - 0.55) * sstep(0.07, 0.095, u);
      if (u > 0.118 && u < 0.138) h = Math.max(h, FIELD + 0.15 * Math.sin(Math.PI * (u - 0.118) / 0.02));
      return h;
    }
    function cv(N) { var c = document.createElement('canvas'); c.width = c.height = N; return c; }
    function alphaOf(c) { var N = c.width, d = c.getContext('2d').getImageData(0, 0, N, N).data, out = new Float32Array(N * N); for (var i = 0; i < N * N; i++) out[i] = d[i * 4 + 3] / 255; return out; }
    function soft(c, blur) { var o = cv(c.width), x = o.getContext('2d'); x.filter = 'blur(' + blur + 'px)'; x.drawImage(c, 0, 0); return alphaOf(o); }
    function distanceIn(mask, N) {
      var D = new Float32Array(N * N), INF = 1e9, s2 = Math.SQRT2, x, y, i;
      for (i = 0; i < N * N; i++) D[i] = mask[i] > 0.5 ? INF : 0;
      for (y = 1; y < N - 1; y++) for (x = 1; x < N - 1; x++) { i = y * N + x; if (!D[i]) continue; D[i] = Math.min(D[i], D[i - 1] + 1, D[i - N] + 1, D[i - N - 1] + s2, D[i - N + 1] + s2); }
      for (y = N - 2; y > 0; y--) for (x = N - 2; x > 0; x--) { i = y * N + x; if (!D[i]) continue; D[i] = Math.min(D[i], D[i + 1] + 1, D[i + N] + 1, D[i + N + 1] + s2, D[i + N - 1] + s2); }
      return D;
    }
    function tex(N, fill, color) {
      var c = cv(N), x = c.getContext('2d'), img = x.createImageData(N, N), d = img.data;
      for (var i = 0; i < N * N; i++) { var p = fill(i); d[i * 4] = p[0]; d[i * 4 + 1] = p[1]; d[i * 4 + 2] = p[2]; d[i * 4 + 3] = 255; }
      x.putImageData(img, 0, 0); var t = new THREE.CanvasTexture(c); t.anisotropy = 4; if (!color) t.colorSpace = THREE.NoColorSpace; return t;
    }
    function spaced(x, txt, cx, cy, sp, maxW) { x.letterSpacing = sp + 'px'; var w = x.measureText(txt).width; if (maxW && w > maxW) { x.save(); x.translate(cx, cy); x.scale(maxW / w, 1); x.fillText(txt, sp / 2, 0); x.restore(); } else x.fillText(txt, cx + sp / 2, cy); x.letterSpacing = '0px'; }

    /* one outcome's faces at size N (shared by all seven levels) */
    var faceCache = {};
    function faces(o, N) {
      var k = o + '|' + N; if (faceCache[k]) return faceCache[k];
      var d = design(o), pts = outline(d.s), C = N / 2, S = N / 1024;
      var mc = cv(N), mx = mc.getContext('2d'); mx.fillStyle = '#fff'; mx.beginPath(); pts.forEach(function (p, i) { mx[i ? 'lineTo' : 'moveTo'](C + p[0] * C, C - p[1] * C); }); mx.closePath(); mx.fill();
      var mask = alphaOf(mc), dist = distanceIn(mask, N);
      var gc = cv(N), gx = gc.getContext('2d'); gx.scale(S, S); gx.fillStyle = gx.strokeStyle = '#fff'; gx.lineCap = 'round'; gx.lineJoin = 'round'; gx.textBaseline = 'alphabetic';
      if (ICONS[d.i]) ICONS[d.i](gx);
      gx.textAlign = 'center'; gx.textBaseline = 'middle'; gx.font = '800 236px ' + FONT; gx.fillText(o, 512, 640);
      var sharp = alphaOf(gc), sf = soft(gc, 5 * S);
      var bc = cv(N), bx = bc.getContext('2d'); bx.scale(S, S); bx.fillStyle = '#fff'; bx.textAlign = 'center'; bx.textBaseline = 'middle';
      bx.font = '700 64px ' + FONT; spaced(bx, 'MATH 10C', 512, 300, 10);
      bx.font = '800 170px ' + FONT; bx.fillText(o, 512, 440);
      bx.fillRect(402, 540, 220, 8);
      bx.font = '700 60px ' + FONT; spaced(bx, d.w, 512, 616, 5, 600);
      var engr = soft(bc, 3 * S);
      var hF = new Float32Array(N * N), hB = new Float32Array(N * N), enamel = new Float32Array(N * N);
      for (var i = 0; i < N * N; i++) {
        if (mask[i] < 0.5) continue;
        var u = dist[i] / C, base = rimHeight(u);
        if (u > ENAMEL_FROM - 0.004) {
          hF[i] = Math.max(base, FIELD + 0.44 * Math.pow(sf[i], 0.75)); hB[i] = base - 0.09 * engr[i];
          if (u > ENAMEL_FROM && sharp[i] < 0.5) enamel[i] = 1;
        } else { hF[i] = base; hB[i] = base; }
      }
      function height(h) { return tex(N, function (i) { var v = Math.round(h[i] * 255); return [v, v, v]; }); }
      function normal(h) {
        var kk = DISP / (2 * 2 / N);
        return tex(N, function (i) {
          var x = i % N, y = (i / N) | 0; if (x < 1 || y < 1 || x > N - 2 || y > N - 2) return [128, 128, 255];
          var dx = (h[i + 1] - h[i - 1]) * kk, dy = (h[i - N] - h[i + N]) * kk, l = Math.hypot(dx, dy, 1);
          return [Math.round((0.5 - 0.5 * dx / l) * 255), Math.round((0.5 - 0.5 * dy / l) * 255), Math.round((0.5 + 0.5 / l) * 255)];
        });
      }
      function alpha(a) { return tex(N, function (i) { return [0, a[i] > 0.5 ? 255 : 0, 0]; }); }
      return faceCache[k] = { pts: pts, enamel: enamel, N: N, front: { height: height(hF), normal: normal(hF), alpha: alpha(mask), enamelAlpha: alpha(enamel) }, back: { height: height(hB), normal: normal(hB) } };
    }

    /* noise for rust, brushed steel and crystal */
    function noise2(seed) { var g = new Float32Array(66 * 66), s = seed; for (var i = 0; i < g.length; i++) { s = (s * 16807) % 2147483647; g[i] = s / 2147483647; } return g; }
    function vnoise(x, y, g) { var xi = Math.floor(x) & 63, yi = Math.floor(y) & 63, xf = x - Math.floor(x), yf = y - Math.floor(y), u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      var a = g[yi * 66 + xi], b = g[yi * 66 + xi + 1], c = g[(yi + 1) * 66 + xi], d = g[(yi + 1) * 66 + xi + 1]; return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
    function fbm(x, y, g) { var v = 0, a = 0.5, f = 1; for (var o = 0; o < 5; o++) { v += a * vnoise(x * f, y * f, g); f *= 2; a *= 0.5; } return v; }
    var shared = {};
    function rustMaps() {
      if (shared.rust) return shared.rust;
      var M = 256, g = noise2(7), cols = [[92, 46, 26], [118, 60, 33], [140, 74, 40], [162, 92, 52], [104, 92, 82]], col = [], rm = [];
      for (var j = 0; j < M; j++) for (var i = 0; i < M; i++) {
        var n = fbm(i / 24, j / 24, g), m = fbm(i / 4.5 + 30, j / 4.5, g), c = n < 0.38 ? cols[0] : n < 0.5 ? cols[1] : n < 0.62 ? cols[2] : cols[3], bare = n > 0.66 && m > 0.55;
        if (bare) c = cols[4]; var s = 0.82 + 0.3 * m; col.push([Math.min(255, c[0] * s), Math.min(255, c[1] * s), Math.min(255, c[2] * s)]); rm.push([255, bare ? 110 : 190 + 40 * m, bare ? 210 : 90]);
      }
      var mk = function (arr, color) { var t = tex(M, function (i) { return arr[i]; }, color); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (color) t.colorSpace = THREE.SRGBColorSpace; return t; };
      var a = mk(col, true), b = mk(rm, false), fa = a.clone(), fb = b.clone(); fa.repeat.set(2.5, 2.5); fb.repeat.set(2.5, 2.5);
      return shared.rust = { body: a, bodyR: b, face: fa, faceR: fb };
    }
    function brushMap() {
      if (shared.brush) return shared.brush;
      var g = noise2(3), M = 256, t = tex(M, function (i) { var x = i % M, y = (i / M) | 0, v = 0.7 + 0.3 * fbm(x / 80, y * 0.85, g); return [255, v * 255, 255]; });
      t.wrapS = t.wrapT = THREE.RepeatWrapping; return shared.brush = t;
    }
    function facets() {
      if (shared.facets) return shared.facets;
      var M = 512, Gn = 18, cell = M / Gn, seeds = [], rnd = noise2(5), q = 0, Rn = function () { return rnd[(q++) % rnd.length]; };
      for (var j = 0; j < Gn; j++) for (var i = 0; i < Gn; i++) seeds.push([(i + Rn()) * cell, (j + Rn()) * cell, (Rn() - 0.5) * 0.9, (Rn() - 0.5) * 0.9]);
      return shared.facets = tex(M, function (p) {
        var px = p % M, py = (p / M) | 0, ci = Math.floor(px / cell), cj = Math.floor(py / cell), best = 1e9, sec = 1e9, b = null;
        for (var dj = -1; dj <= 1; dj++) for (var di = -1; di <= 1; di++) { var ii = ci + di, jj = cj + dj; if (ii < 0 || jj < 0 || ii >= Gn || jj >= Gn) continue;
          var sd = seeds[jj * Gn + ii], dd = (sd[0] - px) * (sd[0] - px) + (sd[1] - py) * (sd[1] - py); if (dd < best) { sec = best; best = dd; b = sd; } else if (dd < sec) sec = dd; }
        var edge = Math.sqrt(sec) - Math.sqrt(best) < 1.5, nx = edge ? 0 : b[2], ny = edge ? 0 : b[3], l = Math.hypot(nx, ny, 1);
        return [(0.5 + 0.5 * nx / l) * 255, (0.5 + 0.5 * ny / l) * 255, (0.5 + 0.5 / l) * 255];
      });
    }
    function chipped(o, N) {
      var k = 'chip' + o + N; if (shared[k]) return shared[k];
      var F = faces(o, N), g = noise2(11), sc = 1024 / N;
      return shared[k] = tex(N, function (i) { var x = i % N, y = (i / N) | 0; return [0, F.enamel[i] > 0.5 && fbm(x * sc / 70, y * sc / 70, g) < 0.56 ? 255 : 0, 0]; });
    }

    function metalMat(t, extra) {
      var m = new THREE.MeshPhysicalMaterial(Object.assign({ color: t.color, roughness: t.rough, metalness: t.metalness, clearcoat: t.clearcoat || 0, clearcoatRoughness: 0.08 }, extra || {}));
      if (t.iridescence) { m.iridescence = t.iridescence; m.iridescenceIOR = 1.5; m.iridescenceThicknessRange = [180, 520]; }
      if (t.rust) { var r = rustMaps(); m.color.set('#ffffff'); m.map = r.body; m.roughness = 1; m.metalness = 1; m.roughnessMap = m.metalnessMap = r.bodyR; }
      if (t.brushed) { m.roughnessMap = brushMap(); m.roughness = 0.5; }
      return m;
    }
    var geo = {};
    function plane(seg) { return geo['p' + seg] || (geo['p' + seg] = new THREE.PlaneGeometry(2, 2, seg, seg)); }
    function stoneGeo() {
      if (geo.stone) return geo.stone;
      var prof = [[0, -0.16], [0.12, -0.03], [0.135, 0], [0.135, 0.012], [0.085, 0.07], [0, 0.07]].map(function (p) { return new THREE.Vector2(p[0], p[1]); });
      var g = new THREE.LatheGeometry(prof, 8); g.rotateX(Math.PI / 2); return geo.stone = g;
    }
    var gemM = null;
    function gemMat() { return gemM || (gemM = new THREE.MeshPhysicalMaterial({ color: '#ffffff', metalness: 1, roughness: 0.02, iridescence: 1, iridescenceIOR: 2.1, iridescenceThicknessRange: [100, 800], envMapIntensity: 4, emissive: '#cfe0ff', emissiveIntensity: 0.12, flatShading: true })); }
    var glintTex = null;
    function glints() {
      if (!glintTex) {
        var c = cv(128), x = c.getContext('2d'), rg = x.createRadialGradient(64, 64, 0, 64, 64, 64);
        rg.addColorStop(0, 'rgba(255,255,255,1)'); rg.addColorStop(0.12, 'rgba(220,235,255,0.8)'); rg.addColorStop(0.4, 'rgba(180,210,255,0.12)'); rg.addColorStop(1, 'rgba(180,210,255,0)');
        x.fillStyle = rg; x.fillRect(0, 0, 128, 128); x.fillStyle = 'rgba(255,255,255,0.9)';
        x.beginPath(); x.moveTo(64, 0); x.quadraticCurveTo(68, 60, 128, 64); x.quadraticCurveTo(68, 68, 64, 128); x.quadraticCurveTo(60, 68, 0, 64); x.quadraticCurveTo(60, 60, 64, 0); x.fill();
        glintTex = new THREE.CanvasTexture(c);
      }
      var grp = new THREE.Group(), list = [];
      for (var i = 0; i < 4; i++) {
        var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glintTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0 }));
        sp.userData = { t: i * 0.9, dur: 1.4 + i * 0.3 }; sp.position.set(0, 0, CAP + 0.05); grp.add(sp); list.push(sp);
      }
      grp.userData.tick = function (dt, front) {
        list.forEach(function (sp) {
          var u = sp.userData; u.t += dt;
          if (u.t > u.dur + 0.8) { u.t = 0; var a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random()) * 0.6; sp.position.set(r * Math.cos(a), r * Math.sin(a), CAP + FIELD * DISP + 0.05); }
          var p = Math.max(0, Math.min(1, u.t / u.dur)), k = Math.sin(Math.PI * p);
          sp.material.opacity = front ? k : 0; sp.scale.setScalar(0.06 + 0.2 * k * k); sp.material.rotation = p * 1.2;
        });
      };
      return grp;
    }

    var medals = {};
    function medal(o, tier, big) {
      var id = o + '|' + tier + '|' + (big ? 1 : 0); if (medals[id]) return medals[id];
      var d = design(o), t = TIERS[tier], N = big ? 1024 : 512, F = faces(o, N), seg = big ? 260 : 90, g = new THREE.Group();
      var shape = new THREE.Shape(F.pts.map(function (p) { return new THREE.Vector2(p[0], p[1]); }));
      var body = new THREE.ExtrudeGeometry(shape, { depth: 2 * CAP - 0.1, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.045, bevelSegments: big ? 8 : 4, curveSegments: 12 });
      body.translate(0, 0, -(CAP - 0.05));
      g.add(new THREE.Mesh(body, metalMat(t)));
      var relief = function (side) { return { displacementMap: side.height, displacementScale: DISP, normalMap: side.normal, alphaTest: 0.5, alphaToCoverage: true }; };
      var fm = metalMat(t, relief(F.front)); fm.alphaMap = F.front.alpha;
      var front = new THREE.Mesh(plane(seg), fm); front.position.z = CAP + 0.0006; g.add(front);
      var em = new THREE.MeshPhysicalMaterial(Object.assign({ color: new THREE.Color(d.c).lerp(new THREE.Color('#000000'), 0.32), roughness: 0.3, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 }, relief(F.front)));
      em.alphaMap = F.front.enamelAlpha;
      if (t.rust) { em.color.set('#41506a'); em.roughness = 0.8; em.clearcoat = 0; em.alphaMap = chipped(o, N); }
      if (t.gem) { em.color = new THREE.Color(d.c).lerp(new THREE.Color('#000000'), 0.1); em.metalness = 0.3; em.roughness = 0.04; em.normalMap = facets(); em.normalScale.set(0.8, 0.8); em.iridescence = 0.6; em.iridescenceIOR = 1.8; em.iridescenceThicknessRange = [150, 700]; }
      g.add(new THREE.Mesh(plane(seg), em));
      g.children[2].position.z = CAP + 0.0006;
      var bm = metalMat(t, relief(F.back)); bm.alphaMap = F.front.alpha;
      var back = new THREE.Mesh(plane(seg), bm); back.rotation.y = Math.PI; back.position.z = -(CAP + 0.0006); g.add(back);
      if (t.rust) { var rm = rustMaps(); [fm, bm].forEach(function (m) { m.map = rm.face; m.roughnessMap = m.metalnessMap = rm.faceR; }); }
      var dotG = geo.dot || (geo.dot = new THREE.SphereGeometry(0.036, 20, 10)), dm = metalMat(t);
      if (t.rust) { dm.map = null; dm.color.set('#8a4a2b'); }
      dotSpots(o, tier + 1).forEach(function (p) {
        [1, -1].forEach(function (side) {
          var m = t.gem ? new THREE.Mesh(stoneGeo(), gemMat()) : new THREE.Mesh(dotG, dm);
          if (t.gem) { m.scale.setScalar(0.3); if (side < 0) m.rotation.y = Math.PI; } else m.scale.set(1, 1, 0.7);
          m.position.set(p[0] * side, p[1], side * (CAP + FIELD * DISP + (t.gem ? 0.012 : 0.004))); g.add(m);
        });
      });
      if (t.gem) g.add(glints());
      g.visible = false; scene.add(g);
      return medals[id] = g;
    }

    /* draw one medal into a 2D canvas */
    var glW = 0, glH = 0;
    function draw(ctx, w, h, m, rx, ry, dt) {
      if (w > glW || h > glH) { glW = Math.max(glW, w, 256); glH = Math.max(glH, h, 256); renderer.setSize(glW, glH, false); }
      for (var k in medals) medals[k].visible = medals[k] === m;
      m.rotation.set(rx, ry, 0);
      m.children.forEach(function (c) { if (c.userData.tick) c.userData.tick(dt, Math.cos(ry) > 0.2); });
      renderer.setScissorTest(true); renderer.setViewport(0, 0, w, h); renderer.setScissor(0, 0, w, h); renderer.clear();
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.render(scene, camera);
      ctx.clearRect(0, 0, w, h); ctx.drawImage(gl, 0, glH - h, w, h, 0, 0, w, h);
    }
    // build faces a little at a time, so a page with many medals doesn't freeze
    function has(o, tier, big) { return !!medals[o + '|' + tier + '|' + (big ? 1 : 0)]; }
    return { draw: draw, medal: medal, has: has };
  }

  /* ---------------- slots: a 2D canvas per medal on the page ---------------- */
  var slots = [], running = false, last = 0;
  var reduced = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = 'IntersectionObserver' in root ? new IntersectionObserver(function (es) { es.forEach(function (e) { var s = e.target._medal; if (s) s.vis = e.isIntersecting; }); }) : null;
  function slot(o, tier, opt) {
    opt = opt || {};
    var c = document.createElement('canvas'); c.className = 'medal-c' + (opt.cls ? ' ' + opt.cls : '');
    var s = { el: c, o: o, tier: tier, big: !!opt.big, drag: !!opt.drag, ang: 0, vel: 0, phase: Math.random() * 6, vis: !io, intro: 0 };
    c._medal = s; slots.push(s); if (io) io.observe(c);
    if (s.drag) dragSpin(s);
    start(); return c;
  }
  function dragSpin(s) {
    var c = s.el; c.style.touchAction = 'pan-y'; c.style.cursor = 'grab';
    c.addEventListener('pointerdown', function (e) { s.dragging = true; s.intro = 0; s.lx = e.clientX; s.lt = performance.now(); s.vel = 0; try { c.setPointerCapture(e.pointerId); } catch (x) {} });
    c.addEventListener('pointermove', function (e) {
      if (!s.dragging) return; var now = performance.now(), dx = e.clientX - s.lx, dt = Math.max(1, now - s.lt), k = 2 * Math.PI / Math.max(240, c.clientWidth * 1.4);
      s.ang += dx * k; s.vel = 0.7 * s.vel + 0.3 * (dx * k / dt * 1000); s.lx = e.clientX; s.lt = now;
    });
    var up = function () { s.dragging = false; }; c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
  }
  function spinOnce(c) { var s = c && c._medal; if (s && !reduced) { s.intro = 1; s.introFrom = s.ang; s.vel = 0; } }
  function start() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); load().catch(function () { slots.forEach(function (s) { s.el.classList.add('medal-off'); }); running = false; }); }
  var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
  function frame(now) {
    slots = slots.filter(function (s) { if (s.el.isConnected) return true; if (io) io.unobserve(s.el); return false; });
    if (!slots.length) { running = false; return; }
    requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!G || document.hidden) return;
    var time = now / 1000, built = false, dpr = Math.min(root.devicePixelRatio || 1, 2);
    var cover = document.querySelector('.medal-pop');
    slots.forEach(function (s) {
      if (!s.vis || (cover && !cover.contains(s.el))) return;         // under the viewer: skip
      if (!G.has(s.o, s.tier, s.big)) { if (built) return; built = true; }   // build at most one new medal per frame
      var w = Math.round(s.el.clientWidth * dpr), h = Math.round(s.el.clientHeight * dpr); if (w < 4 || h < 4) return;
      if (s.el.width !== w || s.el.height !== h) { s.el.width = w; s.el.height = h; }
      if (s.drag) {
        if (s.intro > 0) { s.intro = Math.max(0, s.intro - dt / 1.1); var p = easeOut(1 - s.intro); s.ang = s.introFrom + (Math.round(s.introFrom / (2 * Math.PI)) * 2 * Math.PI + 2 * Math.PI - s.introFrom) * p; }
        else if (!s.dragging) {
          s.ang += s.vel * dt; s.vel *= Math.pow(0.18, dt);
          if (Math.abs(s.vel) < 1.2) { var target = Math.round(s.ang / Math.PI) * Math.PI + (reduced ? 0 : 0.28 * Math.sin(time * 0.6)); s.ang += (target - s.ang) * Math.min(1, dt * 2.2); s.vel *= 0.9; }
        }
      } else if (s.intro > 0) { s.intro = Math.max(0, s.intro - dt / 1.1); s.ang = 2 * Math.PI * easeOut(1 - s.intro); }
      else s.ang = reduced ? 0 : 0.42 * Math.sin(time * 0.7 + s.phase);
      G.draw(s.el.getContext('2d'), w, h, G.medal(s.o, s.tier, s.big), reduced ? 0 : 0.08 * Math.sin(time * 0.5 + s.phase), s.ang, reduced ? 0 : dt);
    });
  }

  /* ---------------- the row beside "Hi, …" ---------------- */
  function label(it) { var t = TIERS[it.tier]; return it.o + ' · ' + t.metal + ' · ' + t.name; }
  function row(list) {
    var box = document.createElement('div'); box.className = 'medal-row';
    list.forEach(function (it, i) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'medal-btn'; b.title = label(it); b.setAttribute('aria-label', label(it) + ' medal');
      var c = slot(it.o, it.tier); b.appendChild(c); if (it.fresh) b.classList.add('is-new');
      b.addEventListener('click', function () { open(list, i); });
      box.appendChild(b);
    });
    return box;
  }

  /* ---------------- the viewer ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function open(list, i, opt) {
    opt = opt || {}; close();
    var ov = document.createElement('div'); ov.className = 'medal-pop'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true');
    var box = document.createElement('div'); box.className = 'medal-box'; ov.appendChild(box);
    var x = document.createElement('button'); x.type = 'button'; x.className = 'medal-x'; x.setAttribute('aria-label', 'Close'); x.textContent = '×'; x.addEventListener('click', close);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    function show(k) {
      i = (k + list.length) % list.length; var it = list[i], t = TIERS[it.tier], d = design(it.o);
      box.innerHTML = ''; box.appendChild(x);
      box.style.setProperty('--mc', d.c);
      if (opt.title) box.appendChild(h('div', 'medal-new', esc(opt.title)));
      var hero = slot(it.o, it.tier, { big: true, drag: true, cls: 'medal-hero' }); hero.setAttribute('role', 'img'); hero.setAttribute('aria-label', label(it) + ' medal'); box.appendChild(hero); spinOnce(hero);
      box.appendChild(h('div', 'medal-metal', esc(t.metal)));
      box.appendChild(h('div', 'medal-level', '<b>' + esc(t.name) + '</b> on ' + esc(it.o) + (it.src ? ' <span class="medal-src">· ' + esc(it.src) + '</span>' : '')));
      if (HW.OUTCOMES && HW.OUTCOMES[it.o]) box.appendChild(h('div', 'medal-out', esc(it.o) + ' · ' + esc(HW.OUTCOMES[it.o])));
      var lad = h('div', 'medal-ladder', '');
      TIERS.forEach(function (tt, k2) {
        var got = k2 === it.tier || (k2 > 0 && k2 < it.tier);   // Rust is only lit when it's the level
        var cell = h('div', 'medal-rung' + (got ? ' got' : '') + (k2 === it.tier ? ' here' : ''), '');
        cell.appendChild(slot(it.o, k2)); cell.appendChild(h('div', 'medal-rung-m', esc(tt.metal))); cell.appendChild(h('div', 'medal-rung-l', esc(tt.name)));
        cell.title = tt.metal + ' · ' + tt.name + (got || k2 < it.tier ? '' : ' (not yet)'); lad.appendChild(cell);
      });
      box.appendChild(lad);
      box.appendChild(h('div', 'medal-hint', 'Drag or flick the medal to spin it.' + (list.length > 1 ? ' ' + (i + 1) + ' of ' + list.length + '.' : '')));
      if (list.length > 1) {
        var nav = h('div', 'medal-nav', '');
        var pv = h('button', 'btn btn-ghost medal-prev', '‹ Previous'), nx = h('button', 'btn btn-ghost medal-next', 'Next ›'); pv.type = nx.type = 'button';
        pv.addEventListener('click', function () { show(i - 1); }); nx.addEventListener('click', function () { show(i + 1); });
        nav.appendChild(pv); nav.appendChild(nx); box.appendChild(nav);
      }
    }
    function h(tag, cls, html) { var e = document.createElement(tag); e.className = cls; e.innerHTML = html; return e; }
    document.body.appendChild(ov); document.body.classList.add('medal-on');
    show(i || 0);
    setTimeout(function () { try { x.focus(); } catch (e) {} }, 30);
    ov._key = function (e) { if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight' && list.length > 1) show(i + 1); else if (e.key === 'ArrowLeft' && list.length > 1) show(i - 1); };
    document.addEventListener('keydown', ov._key);
    if (opt.onclose) ov._onclose = opt.onclose;
  }
  function close() {
    var ov = document.querySelector('.medal-pop'); if (!ov) return;
    document.removeEventListener('keydown', ov._key); ov.remove(); document.body.classList.remove('medal-on');
    if (ov._onclose) ov._onclose();
  }

  HW.Medals = { TIERS: TIERS, DESIGNS: DESIGNS, tierOf: function (lv) { return TIER_OF[lv] == null ? -1 : TIER_OF[lv]; }, row: row, open: open, close: close, slot: slot, load: load, _outline: outline, _icons: ICONS, _dotSpots: dotSpots };
})(window);
