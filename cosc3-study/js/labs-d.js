/* Labs for Lecture 9: text features, regularization and evaluation. */
'use strict';
const DOCS = {
  dart: {name: 'Dartmouth College', c: [26, 11, 9], T: 296},
  brown: {name: 'Brown University', c: [30, 12, 0], T: 329},
  swift: {name: 'Taylor Swift', c: [33, 18, 0], T: 419}
};
const TERMS = ['the', 'and', 'dartmouth'];
const DF = [986, 977, 2], NDOC = 998;
function idf(n, df) { return 1 + Math.log((n + 1) / (df + 1)); }
function arrowDefs(id) { return '<defs><marker id="' + id + '" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>'; }

/* ===== Document-term matrix ===== */
DEFLAB('dtm', {
  title: 'Documents as rows of counts',
  question: 'What is a row, what is a column, and what is the difference between tokens and vocabulary terms?',
  mount: function (host) {
    const S = {k: 1, rows: {dart: DOCS.dart.c.slice(), brown: DOCS.brown.c.slice(), swift: DOCS.swift.c.slice()}};
    host.innerHTML = '<div class="lab-body"><div class="lab-viz"><div data-mat></div><div data-plot></div></div><div class="lab-side">' + rangeCtl('k', 'Repeat the Dartmouth text k times', 1, 4, 1, 1, 0) + '<div data-t></div></div></div><div class="lab-foot" data-f></div>';
    bindCtls(host, S, draw);
    function draw() {
      const k = S.k;
      let t = '<table class="mat"><thead><tr><th>article (row)</th>' + TERMS.map(function (w) { return '<th>' + w + '</th>'; }).join('') + '<th>⋯ 21,967 more columns</th><th>tokens T</th></tr></thead><tbody>';
      ['dart', 'brown', 'swift'].forEach(function (id) { const mult = id === 'dart' ? k : 1; t += '<tr><th>' + DOCS[id].name + (id === 'dart' && k > 1 ? ' × ' + k : '') + '</th>' + S.rows[id].map(function (v, j) { return '<td><input aria-label="' + DOCS[id].name + ' count of ' + TERMS[j] + '" data-r="' + id + '" data-j="' + j + '" value="' + v * mult + '"' + (mult > 1 ? ' disabled' : '') + '></td>'; }).join('') + '<td>⋯</td><td>' + DOCS[id].T * mult + '</td></tr>'; });
      t += '<tr><th>⋮ 995 more rows</th><td>⋮</td><td>⋮</td><td>⋮</td><td></td><td></td></tr></tbody></table>';
      host.querySelector('[data-mat]').innerHTML = '<p class="muted" style="font-size:14px;margin:0 0 6px">Full matrix: 998 documents × 21,970 terms. Three columns are shown. Edit a count to see the vector change.</p>' + t;
      host.querySelectorAll('[data-r]').forEach(function (inp) { inp.addEventListener('change', function () { const v = parseNum(inp.value); if (isFinite(v) && v >= 0) { S.rows[inp.getAttribute('data-r')][+inp.getAttribute('data-j')] = Math.round(v); draw(); } }); });
      const d = S.rows.dart.map(function (v) { return v * k; }), s = S.rows.swift;
      const P = Plot({w: 560, h: 260, x: [0, 120], y: [0, 40]});
      P.raw(arrowDefs('ad')).axes({xl: '"the" count', yl: '"dartmouth" count'});
      P.seg(0, 0, d[0], d[2], 'c-blue', 'marker-end="url(#ad)" stroke-width="2"').text(d[0], d[2], 'Dartmouth [' + d[0] + ', ' + d[2] + ']', 'ann', 'start', -8);
      P.seg(0, 0, s[0], s[2], 'c-amber', 'marker-end="url(#ad)" stroke-width="2"').text(s[0], s[2], 'Taylor Swift [' + s[0] + ', ' + s[2] + ']', 'ann', 'start', -8);
      host.querySelector('[data-plot]').innerHTML = P.svg('Two count coordinates of two articles');
      const nrm = Math.sqrt(sum(d.map(function (v) { return v * v; })));
      host.querySelector('[data-t]').innerHTML = '<dl class="kv"><dt>Dartmouth row (3 columns)</dt><dd>[' + d.join(', ') + ']</dd><dt>Word tokens T</dt><dd>' + 296 * k + '</dd><dt>Vector length of these 3</dt><dd>' + fmt(nrm, 2) + '</dd><dt>TF of "the" = count ÷ T</dt><dd>' + d[0] + ' ÷ ' + 296 * k + ' = ' + fmt(d[0] / (296 * k), 4) + '</dd></dl><p class="muted" style="font-size:14px">Tokens count every word occurrence in one document (the word "the" counted 26 times adds 26). Vocabulary terms are the distinct words across the whole collection: m = 21,970 columns.</p>';
      host.querySelector('[data-f]').innerHTML = 'Repeating the text multiplies every count and the length by k, so the arrow gets k times longer while its direction, and every TF, stays the same (lecture p. 30: [26, 11, 9] becomes [52, 22, 18]).';
    }
    draw();
  }
});

/* ===== TF and IDF ===== */
DEFLAB('tfidf', {
  title: 'TF, IDF and TF-IDF for the Dartmouth article',
  question: 'Why is TF unchanged by repetition, why does IDF fall as a word spreads, and why the logarithm?',
  mount: function (host) {
    const S = {term: '2', C: 9, T: 296, k: 1, df: 2, n: 998};
    host.innerHTML = '<div class="lab-body"><div class="lab-viz"><div data-p1></div><div data-tab></div></div><div class="lab-side"><div class="ctl"><label><span>Term</span></label>' + segCtl('term', [['0', 'the'], ['1', 'and'], ['2', 'dartmouth']], '2') + '</div><div data-c></div></div></div><div class="lab-foot trace" data-f></div>';
    bindSeg(host, S, function () { const j = +S.term; S.C = DOCS.dart.c[j]; S.df = DF[j]; S.T = 296; S.n = 998; S.k = 1; ctls(); draw(); });
    function ctls() {
      const c = host.querySelector('[data-c]');
      c.innerHTML = numCtl('C', 'Count C in this article', S.C) + numCtl('T', 'Article length T (all word tokens)', S.T) + rangeCtl('k', 'Repeat the article k times', 1, 5, 1, S.k, 0) + rangeCtl('df', 'Document frequency DF (articles containing it)', 0, S.n, 1, S.df, 0) + numCtl('n', 'Collection size n (articles)', S.n);
      bindCtls(c, S, function (key) { if (key === 'n') { const r = c.querySelector('#r-df'); r.max = S.n; if (S.df > S.n) { S.df = S.n; setCtl(c, 'df', S.n); } } draw(); });
    }
    ctls();
    function draw() {
      const tf = (S.C * S.k) / (S.T * S.k), id = idf(S.n, S.df), ratio = (S.n + 1) / (S.df + 1);
      const P = Plot({w: 560, h: 250, x: [0, S.n], y: [0, Math.max(8, idf(S.n, 0) + 0.5)], m: {b: 32}});
      P.axes({xl: 'DF: articles containing the term', yl: 'IDF'}).fn(function (d) { return idf(S.n, d); }, 'c-blue', 400, 0, S.n);
      if (S.n === 998) TERMS.forEach(function (w, j) { P.dot(DF[j], idf(998, DF[j]), 3.5, 'f-text').text(DF[j], idf(998, DF[j]), w, 'lbl', DF[j] > 500 ? 'end' : 'start', w === 'and' ? 16 : -7); });
      P.dot(S.df, id, 6, 'f-amber').text(S.df, id, 'IDF ' + fmt(id, 3), 'ann', S.df > S.n / 2 ? 'end' : 'start', 16);
      host.querySelector('[data-p1]').innerHTML = P.svg('IDF falls as document frequency rises');
      let t = '<table class="readout"><thead><tr><th>term</th><th>count</th><th>TF</th><th>DF</th><th>IDF</th><th>TF-IDF</th></tr></thead><tbody>';
      TERMS.forEach(function (w, j) { const Cj = j === +S.term ? S.C : DOCS.dart.c[j], dfj = j === +S.term ? S.df : DF[j]; const tfj = Cj / S.T, idj = idf(S.n, dfj); t += '<tr' + (j === +S.term ? ' class="sel"' : '') + '><td>' + w + '</td><td>' + Cj * S.k + '</td><td>' + fmt(tfj, 4) + '</td><td>' + dfj + '</td><td>' + fmt(idj, 3) + '</td><td>' + fmt(tfj * idj, 4) + '</td></tr>'; });
      t += '</tbody></table>';
      t += '<h4>Why take a logarithm? (extra intuition)</h4><table class="readout"><thead><tr><th></th><th>raw ratio (n+1)/(DF+1)</th><th>1 + ln(ratio)</th></tr></thead><tbody>' + TERMS.map(function (w, j) { const rr = (998 + 1) / (DF[j] + 1); return '<tr><td>' + w + '</td><td>' + fmt(rr, 3) + '</td><td>' + fmt(1 + Math.log(rr), 3) + '</td></tr>'; }).join('') + '</tbody></table><p class="faint" style="font-size:13px">Without the log, "dartmouth" would get about 329 times the weight of "the"; one rare word would swamp the whole vector. The log keeps rare words heavier (about 6.7 times) without drowning everything else.</p>';
      host.querySelector('[data-tab]').innerHTML = t;
      host.querySelector('[data-f]').innerHTML = MD('\\mathrm{TF} = \\frac{C}{T} = \\frac{' + (S.C * S.k) + '}{' + (S.T * S.k) + '} = ' + fmt(tf, 4) + '\\qquad \\mathrm{IDF} = 1 + \\ln\\frac{n+1}{\\mathrm{DF}+1} = 1 + \\ln\\frac{' + (S.n + 1) + '}{' + (S.df + 1) + '} = 1 + ' + fmt(Math.log(ratio), 3) + ' = ' + fmt(id, 3)) + MD('\\text{TF-IDF} = ' + fmt(tf, 4) + ' \\times ' + fmt(id, 3) + ' = ' + fmt(tf * id, 4)) + '<span class="faint">The denominator T is every word token in the article (296), not the number of distinct words and not just the three words shown.</span>';
    }
    draw();
  }
});

/* ===== Dot product and cosine similarity ===== */
DEFLAB('cosine', {
  title: 'Dot product, distance and cosine similarity',
  question: 'Which comparison ignores document length, and how does TF-IDF change which articles look similar?',
  mount: function (host) {
    const S = {rep: 'count', other: 'swift', k: 1};
    host.innerHTML = '<div class="lab-body"><div class="lab-viz" data-v></div><div class="lab-side">' + segCtl('rep', [['count', 'Raw counts'], ['tf', 'TF'], ['tfidf', 'TF-IDF']], 'count') + '<div class="ctl"><label><span>Compare Dartmouth College with</span></label>' + segCtl('other', [['swift', 'Taylor Swift'], ['brown', 'Brown University']], 'swift') + '</div>' + rangeCtl('k', 'Repeat the Dartmouth text k times', 1, 4, 1, 1, 0) + '<div data-t></div></div></div><div class="lab-foot trace" data-f></div>';
    bindSeg(host, S, draw); bindCtls(host, S, draw);
    function vecOf(id, k) {
      const d = DOCS[id], c = d.c.map(function (v) { return v * k; }), T = d.T * k;
      if (S.rep === 'count') return c;
      const tf = c.map(function (v) { return v / T; });
      if (S.rep === 'tf') return tf;
      return tf.map(function (v, j) { return v * idf(NDOC, DF[j]); });
    }
    function draw() {
      const u = vecOf('dart', S.k), v = vecOf(S.other, 1);
      const dot = sum(u.map(function (x, j) { return x * v[j]; }));
      const nu = Math.sqrt(sum(u.map(function (x) { return x * x; }))), nv = Math.sqrt(sum(v.map(function (x) { return x * x; })));
      const cos = dot / (nu * nv), dist = Math.sqrt(sum(u.map(function (x, j) { return (x - v[j]) * (x - v[j]); })));
      const mx = Math.max(u[0], u[2], v[0], v[2]) * 1.25;
      const P = Plot({w: 520, h: 360, x: [0, mx], y: [0, mx]});
      P.raw(arrowDefs('ac')).axes({xl: '"the" coordinate', yl: '"dartmouth" coordinate', fx: function (t) { return S.rep === 'count' ? t : +t.toFixed(3); }, fy: function (t) { return S.rep === 'count' ? t : +t.toFixed(3); }});
      P.seg(0, 0, u[0], u[2], 'c-blue', 'marker-end="url(#ac)" stroke-width="2"').text(u[0], u[2], 'Dartmouth', 'ann', 'start', -8);
      P.seg(0, 0, v[0], v[2], 'c-amber', 'marker-end="url(#ac)" stroke-width="2"').text(v[0], v[2], DOCS[S.other].name, 'ann', 'start', -8);
      host.querySelector('[data-v]').innerHTML = P.svg('Article vectors projected onto two coordinates') + '<p class="faint" style="font-size:12.5px">Picture shows two of the three coordinates; every number on the right uses all three (the, and, dartmouth).</p>';
      const f = function (x) { return S.rep === 'count' ? fmt(x, 0) : fmt(x, 4); };
      host.querySelector('[data-t]').innerHTML = '<dl class="kv"><dt>u (Dartmouth)</dt><dd>[' + u.map(f).join(', ') + ']</dd><dt>v (' + DOCS[S.other].name + ')</dt><dd>[' + v.map(f).join(', ') + ']</dd><dt>Dot product u·v</dt><dd>' + sig(dot, 4) + '</dd><dt>‖u‖, ‖v‖</dt><dd>' + sig(nu, 4) + ', ' + sig(nv, 4) + '</dd><dt>Euclidean distance</dt><dd>' + sig(dist, 4) + '</dd><dt>Cosine similarity</dt><dd class="big">' + fmt(cos, 3) + '</dd></dl>';
      host.querySelector('[data-f]').innerHTML = MD('\\cos(u, v) = \\frac{u^\\top v}{\\|u\\|\\,\\|v\\|} = \\frac{' + sig(dot, 4) + '}{' + sig(nu, 4) + ' \\times ' + sig(nv, 4) + '} = ' + fmt(cos, 3)) + '<span class="faint">Raw counts and TF give the same cosine (dividing a vector by its length T only rescales it). Repetition changes the dot product and the distance but never the cosine. TF-IDF changes the cosine because each coordinate gets a different multiplier. Lecture values: dot 1056 and cosine 0.948 for raw counts (pp. 52 to 53); the TF and TF-IDF cosines on these three coordinates are computed here.</span>';
    }
    draw();
  }
});

/* ===== Genre prediction for "Gorgeous" ===== */
DEFLAB('genre', {
  title: 'Predicting a genre for "Gorgeous", step by step',
  question: 'How do word counts become a Pop score, and why is the prediction the largest score rather than any positive score?',
  mount: function (host) {
    const D = {C: [35, 12, 16], T: 473, idf: [1.082, 1.083, 6.405], w: [0.796, 0.163, -0.114], b: 0.0494};
    const words = ['you', 'and', 'gorgeous'];
    const q0 = D.C.map(function (c, j) { return c / D.T * D.idf[j]; });
    const restSq = 0.3340 * 0.3340 - sum(q0.map(function (v) { return v * v; }));
    const restDot = 0.1043 * 0.3340;
    const OTHER = {Country: -4.125, Rap: -3.3, 'R&B': -2.943, Rock: 0.069};
    const S = {C: D.C.slice(), w: D.w.slice(), b: D.b};
    host.innerHTML = '<div class="lab-body stack"><div class="lab-viz" data-steps></div><div class="lab-side"><div class="cols"><div data-in></div><div data-bars></div></div></div></div><div class="lab-foot" data-f></div>';
    let ins = '<h4 style="margin-top:0">Inputs you can change</h4><table class="mat"><thead><tr><th>word</th><th>count</th><th>Pop coefficient</th></tr></thead><tbody>';
    words.forEach(function (wd, j) { ins += '<tr><th>' + wd + '</th><td><input aria-label="count of ' + wd + '" data-c="' + j + '" value="' + D.C[j] + '"></td><td><input aria-label="Pop coefficient for ' + wd + '" data-w="' + j + '" value="' + D.w[j] + '"></td></tr>'; });
    ins += '</tbody></table>' + numCtl('b', 'Pop intercept b', D.b);
    host.querySelector('[data-in]').innerHTML = ins;
    host.querySelectorAll('[data-c]').forEach(function (inp) { inp.addEventListener('input', function () { const v = parseNum(inp.value); if (isFinite(v) && v >= 0) { S.C[+inp.getAttribute('data-c')] = v; draw(); } }); });
    host.querySelectorAll('[data-w]').forEach(function (inp) { inp.addEventListener('input', function () { const v = parseNum(inp.value); if (isFinite(v)) { S.w[+inp.getAttribute('data-w')] = v; draw(); } }); });
    bindCtls(host.querySelector('[data-in]'), S, draw);
    function draw() {
      const tf = S.C.map(function (c) { return c / D.T; });
      const q = tf.map(function (v, j) { return v * D.idf[j]; });
      const norm = Math.sqrt(restSq + sum(q.map(function (v) { return v * v; })));
      const x = q.map(function (v) { return v / norm; });
      const contrib = x.map(function (v, j) { return v * S.w[j]; });
      const rest = restDot / norm;
      const pop = S.b + sum(contrib) + rest;
      const scores = Object.assign({Pop: pop}, OTHER);
      const order = ['Country', 'Pop', 'Rap', 'R&B', 'Rock'];
      const best = order.reduce(function (a, g) { return scores[g] > scores[a] ? g : a; }, 'Country');
      const row = function (label, vals, d) { return '<tr><td>' + label + '</td>' + vals.map(function (v) { return '<td>' + fmt(v, d) + '</td>'; }).join('') + '</tr>'; };
      let st = '<ol style="padding-left:20px">';
      st += '<li><b>Counts and length.</b> 473 word tokens in this lyrics version.<table class="readout"><thead><tr><th></th>' + words.map(function (w) { return '<th>' + w + '</th>'; }).join('') + '</tr></thead><tbody>' + row('count C', S.C, 0) + row('TF = C ÷ 473', tf, 4) + '</tbody></table></li>';
      st += '<li><b>Training IDF.</b> Computed once from training songs and reused for every new song.<table class="readout"><tbody>' + row('IDF', D.idf, 3) + row('q = TF × IDF', q, 4) + '</tbody></table></li>';
      st += '<li><b>Unit length.</b> Divide by the length of the full 10,000-coordinate vector, ‖q‖ = ' + fmt(norm, 4) + ' (0.3340 in the lecture). After this, the squared inputs sum to 1.<table class="readout"><tbody>' + row('x = q ÷ ‖q‖', x, 4) + '</tbody></table></li>';
      st += '<li><b>Coefficient times input.</b><table class="readout"><tbody>' + row('Pop coefficient', S.w, 3) + row('contribution', contrib, 4) + '</tbody></table>A large input with a negative coefficient (gorgeous) pulls the Pop score down.</li>';
      st += '<li><b>Add everything.</b> ' + M('z_{\\text{Pop}} = ' + fmt(S.b, 4).replace('−', '-') + ' + ' + fmt(sum(contrib), 4).replace('−', '-') + ' + ' + fmt(rest, 4).replace('−', '-') + ' = ' + fmt(pop, 4).replace('−', '-')) + ' (intercept, shown words, remaining words).</li>';
      st += '<li><b>Compare genres.</b> Each genre has its own one-vs-rest classifier. The predicted genre is the largest score: <b>' + best + '</b>.</li></ol>';
      host.querySelector('[data-steps]').innerHTML = st;
      const B = Plot({w: 380, h: 230, x: [0, 5], y: [-5, 1], m: {l: 40, b: 30}});
      B.axes({xt: [], yt: [-5, -4, -3, -2, -1, 0, 1]}).seg(0, 0, 5, 0, 'c-text');
      order.forEach(function (g, k) { const v = scores[g]; B.rectD(k + 0.2, 0, k + 0.8, Math.max(-5, v), g === best ? 'f-blue' : 'f-mute'); B.text(k + 0.5, -5, g, 'lbl', 'middle', 14); B.text(k + 0.5, Math.max(-5, v), fmt(v, 3), 'ann', 'middle', v >= 0 ? -5 : 14); });
      host.querySelector('[data-bars]').innerHTML = '<h4 style="margin-top:0">Genre scores z_k</h4>' + B.svg('Scores for the five genres') + '<p class="faint" style="font-size:13px">Pop and Rock are both positive: σ(z) = ' + fmt(sigmoid(pop), 3) + ' and ' + fmt(sigmoid(0.069), 3) + ', both above 0.5. Positivity is not the rule; the largest score is.</p>';
      host.querySelector('[data-f]').innerHTML = 'Lecture values (pp. 72 to 76): inputs 0.2398, 0.0823, 0.6488; contributions 0.1908, 0.0134, −0.0739; Pop score ≈ 0.284; Rock 0.069; other genres negative. The lab holds the other 9,997 coordinates fixed when you edit a count, and the four other genre scores fixed at the lecture values.';
    }
    draw();
  }
});

/* ===== Regularization on constructed data ===== */
function solve(A, b) {
  const n = b.length, M = A.map(function (r, i) { return r.concat([b[i]]); });
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    const tmp = M[c]; M[c] = M[p]; M[p] = tmp;
    for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
  return x;
}
function regData() {
  const r = rng(2026), g = function () { return Math.sqrt(-2 * Math.log(r() + 1e-12)) * Math.cos(2 * Math.PI * r()); };
  const tr = [], va = [];
  for (let k = 0; k < 12; k++) { const x = (k + 0.5) / 12; tr.push([x, Math.sin(2 * Math.PI * x) + 0.3 * g()]); }
  for (let k = 0; k < 60; k++) { const x = r(); va.push([x, Math.sin(2 * Math.PI * x) + 0.3 * g()]); }
  return {tr: tr, va: va};
}
function ridgeFit(pts, deg, lam) {
  const F = function (x) { const t = 2 * x - 1, f = []; for (let j = 0; j <= deg; j++) f.push(Math.pow(t, j)); return f; };
  const n = pts.length, d = deg + 1, A = [], b = new Array(d).fill(0);
  for (let i = 0; i < d; i++) A.push(new Array(d).fill(0));
  pts.forEach(function (p) { const f = F(p[0]); for (let i = 0; i < d; i++) { b[i] += f[i] * p[1] / n; for (let j = 0; j < d; j++) A[i][j] += f[i] * f[j] / n; } });
  for (let i = 0; i < d; i++) A[i][i] += lam;
  const th = solve(A, b);
  const pred = function (x) { const f = F(x); return sum(f.map(function (v, j) { return v * th[j]; })); };
  const mse = function (P) { return mean(P.map(function (p) { const e = p[1] - pred(p[0]); return e * e; })); };
  return {th: th, pred: pred, mse: mse};
}
DEFLAB('reg', {
  title: 'Choosing the penalty strength λ',
  question: 'Why does the training loss keep falling as λ shrinks while the validation loss does not?',
  mount: function (host) {
    const DATA = regData(), DEG = 9;
    const S = {ll: -3, w: 1.5, g: 0.4, eta: 0.1};
    const grid = []; for (let k = -7; k <= 1.0001; k += 0.2) { const f = ridgeFit(DATA.tr, DEG, Math.pow(10, k)); grid.push([k, f.mse(DATA.tr), f.mse(DATA.va)]); }
    const bestVal = grid.reduce(function (a, r) { return r[2] < a[2] ? r : a; }, grid[0]);
    host.innerHTML = '<div class="lab-body"><div class="lab-viz"><div data-c1></div><div data-c2></div></div><div class="lab-side">' + rangeCtl('ll', 'log₁₀ λ', -7, 1, 0.1, S.ll, 1) + '<div class="btns"><button class="btn" data-a="best">λ with lowest validation loss</button><button class="btn" data-a="min">Almost no penalty</button><button class="btn" data-a="max">Very strong penalty</button></div><div data-t></div><h4>One penalized update (lecture p. 70)</h4>' + rangeCtl('w', 'Current coefficient w_j', -3, 3, 0.1, S.w) + rangeCtl('g', 'Loss gradient ∂L/∂w_j', -2, 2, 0.05, S.g) + rangeCtl('eta', 'Learning rate η', 0.01, 0.5, 0.01, S.eta) + '<div data-u></div></div></div><div class="lab-foot" data-f></div>';
    bindCtls(host, S, draw);
    host.querySelector('[data-a="best"]').addEventListener('click', function () { S.ll = +bestVal[0].toFixed(1); setCtl(host, 'll', S.ll); draw(); });
    host.querySelector('[data-a="min"]').addEventListener('click', function () { S.ll = -7; setCtl(host, 'll', -7); draw(); });
    host.querySelector('[data-a="max"]').addEventListener('click', function () { S.ll = 1; setCtl(host, 'll', 1); draw(); });
    function draw() {
      const lam = Math.pow(10, S.ll), f = ridgeFit(DATA.tr, DEG, lam);
      const P = Plot({w: 560, h: 220, x: [0, 1], y: [-2, 2], m: {b: 30}});
      P.axes({xl: 'x', yl: 'y'}).fn(function (x) { return Math.sin(2 * Math.PI * x); }, 'c-faint').fn(f.pred, 'c-blue', 300);
      DATA.va.forEach(function (p) { P.dot(p[0], p[1], 2.2, 'f-text', 'opacity="0.35"'); });
      DATA.tr.forEach(function (p) { P.dot(p[0], p[1], 4.5, 'f-amber'); });
      host.querySelector('[data-c1]').innerHTML = '<div class="faint" style="font-size:12.5px">Amber: 12 training points. Faint: 60 validation points. Blue: degree-9 fit at the current λ. Dashed: the rule that generated the data.</div>' + P.svg('Fitted curve at the current penalty');
      const ymax = Math.max(0.6, Math.min(1.2, Math.max.apply(null, grid.map(function (r) { return r[2]; })) * 1.05));
      const C = Plot({w: 560, h: 220, x: [-7, 1], y: [0, ymax], m: {b: 32}});
      C.axes({xl: 'log₁₀ λ (stronger penalty to the right)', yl: 'mean squared error'}).line(grid.map(function (r) { return [r[0], r[1]]; }), 'c-amber').line(grid.map(function (r) { return [r[0], Math.min(ymax, r[2])]; }), 'c-blue');
      C.seg(S.ll, 0, S.ll, ymax, 'c-faint').dot(bestVal[0], bestVal[2], 4, 'f-green');
      C.text(-6.9, ymax * 0.93, 'blue: validation   amber: training', 'lbl');
      host.querySelector('[data-c2]').innerHTML = C.svg('Training and validation error across penalty strengths');
      const pen = lam * sum(f.th.map(function (t) { return t * t; }));
      host.querySelector('[data-t]').innerHTML = '<dl class="kv"><dt>λ</dt><dd>' + sig(lam, 3) + '</dd><dt>Training MSE</dt><dd>' + fmt(f.mse(DATA.tr), 4) + '</dd><dt>Validation MSE</dt><dd class="big">' + fmt(f.mse(DATA.va), 4) + '</dd><dt>Sum of squared coefficients</dt><dd>' + sig(sum(f.th.map(function (t) { return t * t; })), 4) + '</dd><dt>Penalty λ Σθ²</dt><dd>' + sig(pen, 4) + '</dd></dl>';
      const shrink = 1 - 2 * S.eta * lam, wn = shrink * S.w - S.eta * S.g;
      host.querySelector('[data-u]').innerHTML = MD('w_j^{\\text{new}} = (1 - 2\\eta\\lambda)w_j - \\eta\\frac{\\partial L}{\\partial w_j} = (1 - 2(' + fmt(S.eta, 2) + ')(' + sig(lam, 3) + '))(' + fmt(S.w, 2).replace('−', '-') + ') - ' + fmt(S.eta, 2) + '(' + fmt(S.g, 2).replace('−', '-') + ') = ' + fmt(wn, 4).replace('−', '-')) + '<p class="faint" style="font-size:13px">The factor ' + fmt(shrink, 4) + ' shrinks the coefficient toward zero on every step before the loss gradient acts. Larger λ means stronger shrinking.</p>';
      host.querySelector('[data-f]').innerHTML = 'Constructed regression data, computed live (extra practice). The lecture shows the same shape for Pop versus other genres with log loss: training loss keeps dropping as the penalty weakens, and a moderate penalty gave the lowest validation loss (p. 71). Choose λ on validation data, never on training loss. Following the lecture, the penalty here includes the intercept.';
    }
    draw();
  }
});

/* ===== Confusion matrix, accuracy, precision, recall, F1 ===== */
DEFLAB('confusion', {
  title: 'Confusion matrix explorer',
  question: 'Which cells are TP, FP, FN and TN for one class, and how do precision, recall and F1 respond?',
  mount: function (host) {
    const PRE = {
      genre: {labels: ['Country', 'Pop', 'Rap', 'R&B', 'Rock'], M: [[5, 101, 20, 0, 71], [0, 1146, 165, 21, 444], [0, 125, 1822, 10, 59], [0, 221, 110, 34, 37], [0, 533, 66, 4, 780]], sel: 3},
      penguin: {labels: ['Gentoo', 'Adélie'], M: [[32, 5], [2, 44]], sel: 0}
    };
    const S = {set: 'genre', labels: null, M: null, sel: 3};
    function load(k) { S.set = k; S.labels = PRE[k].labels.slice(); S.M = PRE[k].M.map(function (r) { return r.slice(); }); S.sel = PRE[k].sel; }
    load('genre');
    host.innerHTML = '<div style="padding:12px 16px 0">' + segCtl('set', [['genre', 'Genre validation (5,774 songs)'], ['penguin', 'Penguin test (83 birds)']], 'genre') + '</div><div class="lab-body"><div class="lab-viz" data-mat></div><div class="lab-side" data-t></div></div><div class="lab-foot trace" data-f></div>';
    bindSeg(host, S, function (k) { if (k === 'set') { load(S.set); draw(); } });
    function stats(k) {
      const n = S.labels.length, N = sum(S.M.map(sum));
      const TP = S.M[k][k], FN = sum(S.M[k]) - TP, FP = sum(S.M.map(function (r) { return r[k]; })) - TP, TN = N - TP - FP - FN;
      const P = TP + FP ? TP / (TP + FP) : 0, R = TP + FN ? TP / (TP + FN) : 0, F = (2 * TP + FP + FN) ? 2 * TP / (2 * TP + FP + FN) : 0;
      return {TP: TP, FP: FP, FN: FN, TN: TN, P: P, R: R, F: F, N: N, n: n};
    }
    function draw() {
      const k = S.sel, n = S.labels.length;
      let t = '<p class="muted" style="font-size:14px;margin:0 0 6px">Rows are the actual class; columns are the predicted class. Click a class name to make it the positive class. Counts are editable.</p><table class="mat"><thead><tr><th>actual \\ predicted</th>' + S.labels.map(function (l, j) { return '<th><button class="btn ghost" style="padding:2px 6px" data-sel="' + j + '" aria-pressed="' + (j === k) + '">' + l + '</button></th>'; }).join('') + '<th>row total</th></tr></thead><tbody>';
      S.M.forEach(function (r, i) { t += '<tr><th><button class="btn ghost" style="padding:2px 6px" data-sel="' + i + '" aria-pressed="' + (i === k) + '">' + S.labels[i] + '</button></th>' + r.map(function (v, j) { const cls = i === k && j === k ? 'tp' : (j === k ? 'fp' : (i === k ? 'fn' : 'tn')); return '<td class="' + cls + '"><input aria-label="actual ' + S.labels[i] + ' predicted ' + S.labels[j] + '" data-i="' + i + '" data-j="' + j + '" value="' + v + '"></td>'; }).join('') + '<td>' + thou(sum(r)) + '</td></tr>'; });
      t += '</tbody></table><p class="faint" style="font-size:13px">Green TP, amber FP (predicted ' + S.labels[k] + ' but wrong), blue FN (actually ' + S.labels[k] + ' but missed), grey TN.</p>';
      host.querySelector('[data-mat]').innerHTML = '<div class="scroll-x">' + t + '</div>';
      host.querySelectorAll('[data-sel]').forEach(function (b) { b.addEventListener('click', function () { S.sel = +b.getAttribute('data-sel'); draw(); }); });
      host.querySelectorAll('[data-i]').forEach(function (inp) { inp.addEventListener('change', function () { const v = parseNum(inp.value); if (isFinite(v) && v >= 0) { S.M[+inp.getAttribute('data-i')][+inp.getAttribute('data-j')] = Math.round(v); draw(); } }); });
      const s = stats(k);
      const diag = sum(S.M.map(function (r, i) { return r[i]; }));
      const all = S.labels.map(function (l, j) { return stats(j); });
      const macro = mean(all.map(function (x) { return x.F; }));
      const big = S.M.map(sum).indexOf(Math.max.apply(null, S.M.map(sum)));
      let side = '<dl class="kv"><dt>TP, FP, FN, TN</dt><dd>' + [s.TP, s.FP, s.FN, s.TN].map(thou).join(', ') + '</dd><dt>Precision TP ÷ (TP + FP)</dt><dd>' + s.TP + '/' + (s.TP + s.FP) + ' = ' + fmt(s.P, 3) + '</dd><dt>Recall TP ÷ (TP + FN)</dt><dd>' + s.TP + '/' + (s.TP + s.FN) + ' = ' + fmt(s.R, 3) + '</dd><dt>F1 = 2TP ÷ (2TP + FP + FN)</dt><dd class="big">' + fmt(s.F, 3) + '</dd><dt>Accuracy (all classes)</dt><dd>' + thou(diag) + '/' + thou(s.N) + ' = ' + fmt(diag / s.N, 3) + '</dd>';
      if (n > 2) side += '<dt>Macro F1</dt><dd>' + fmt(macro, 3) + '</dd><dt>Always-' + S.labels[big] + ' baseline accuracy</dt><dd>' + fmt(sum(S.M[big]) / s.N, 3) + '</dd>';
      side += '</dl>';
      if (n > 2) side += '<table class="readout"><thead><tr><th>class</th><th>P</th><th>R</th><th>F1</th></tr></thead><tbody>' + all.map(function (x, j) { return '<tr' + (j === k ? ' class="sel"' : '') + '><td>' + S.labels[j] + '</td><td>' + fmt(x.P, 3) + '</td><td>' + fmt(x.R, 3) + '</td><td>' + fmt(x.F, 3) + '</td></tr>'; }).join('') + '</tbody></table>';
      host.querySelector('[data-t]').innerHTML = side;
      host.querySelector('[data-f]').innerHTML = MD('P = \\frac{\\hlb{' + s.TP + '}}{\\hlb{' + s.TP + '} + \\hla{' + s.FP + '}} = ' + fmt(s.P, 3) + ',\\quad R = \\frac{\\hlb{' + s.TP + '}}{\\hlb{' + s.TP + '} + ' + s.FN + '} = ' + fmt(s.R, 3) + ',\\quad F_1 = \\frac{2(' + s.TP + ')}{2(' + s.TP + ') + ' + s.FP + ' + ' + s.FN + '} = ' + fmt(s.F, 3)) + '<span class="faint">Precision divides by the predicted column total. Recall divides by the actual row total.</span>';
    }
    draw();
  }
});
