/* Labs for Lectures 6 and 7. */
'use strict';

/* ===== Lecture 6: score, sigmoid, odds, threshold, log loss ===== */
DEFLAB('logistic', {
  title: 'From penguin mass to Gentoo probability',
  question: 'How do the score, probability, odds, predicted class and log loss move when b, w or the mass changes?',
  mount: function (host) {
    const S = {b: -0.2, w: 1.4, mass: 4500, y: '1', t: 0.5};
    host.innerHTML = '<div class="lab-body"><div class="lab-viz"><div data-v1></div><div data-v2></div></div><div class="lab-side">' +
      rangeCtl('b', 'Intercept b', -3, 3, 0.05, S.b) + rangeCtl('w', 'Mass coefficient w', -3, 6, 0.05, S.w) + rangeCtl('mass', 'Body mass (g)', 2500, 6500, 10, S.mass, 0) + rangeCtl('t', 'Decision threshold', 0.05, 0.95, 0.01, S.t) +
      '<div class="ctl"><label><span>Recorded species</span></label>' + segCtl('y', [['1', 'Gentoo, y = 1'], ['0', 'Adélie, y = 0']], '1') + '</div>' +
      '<div class="btns"><button class="btn" data-a="fit">Use fitted b ≈ −1.639, w ≈ 4.002</button></div><div data-t></div></div></div><div class="lab-foot trace" data-f></div>';
    bindCtls(host, S, draw); bindSeg(host, S, draw);
    host.querySelector('[data-a="fit"]').addEventListener('click', function () { S.b = -1.639; S.w = 4.002; setCtl(host, 'b', S.b); setCtl(host, 'w', S.w); draw(); });
    function draw() {
      const x = (S.mass - 4000) / 1000, z = S.b + S.w * x, p = sigmoid(z), y = +S.y;
      const loss = y === 1 ? -Math.log(p) : -Math.log(1 - p);
      const P1 = Plot({w: 560, h: 240, x: [2500, 6500], y: [0, 1], m: {b: 30}});
      P1.axes({xl: 'body mass (g)', yl: 'Gentoo probability p', xt: [2500, 3500, 4500, 5500, 6500], yt: [0, 0.25, 0.5, 0.75, 1]});
      P1.fn(function (g) { return sigmoid(S.b + S.w * (g - 4000) / 1000); }, 'c-blue', 200);
      P1.seg(2500, S.t, 6500, S.t, 'c-faint').text(6500, S.t, 'threshold ' + fmt(S.t, 2), 'lbl', 'end', -5);
      P1.seg(S.mass, 0, S.mass, p, 'c-faint').dot(S.mass, p, 6, p >= S.t ? 'f-green' : 'f-amber').text(S.mass, p, 'p = ' + fmt(p, 3), 'ann', 'start', -10);
      host.querySelector('[data-v1]').innerHTML = P1.svg('Fitted probability curve over body mass');
      const P2 = Plot({w: 560, h: 200, x: [0, 1], y: [0, 4], m: {b: 30}});
      P2.axes({xl: 'predicted Gentoo probability p', yl: 'log loss', xt: [0, 0.2, 0.4, 0.6, 0.8, 1]});
      P2.fn(function (q) { return -Math.log(q); }, y === 1 ? 'c-blue' : 'c-faint', 200, 0.018, 1).fn(function (q) { return -Math.log(1 - q); }, y === 0 ? 'c-blue' : 'c-faint', 200, 0, 0.982);
      P2.dot(p, Math.min(4, loss), 6, 'f-text').text(p, Math.min(4, loss), 'ℓ = ' + fmt(loss, 3), 'ann', 'start', -10);
      P2.text(0.03, 3.6, y === 1 ? 'solid: y = 1 uses −ln p' : 'solid: y = 0 uses −ln(1 − p)', 'lbl');
      host.querySelector('[data-v2]').innerHTML = P2.svg('Log loss as a function of predicted probability');
      host.querySelector('[data-t]').innerHTML = '<dl class="kv"><dt>Feature x = (mass − 4000) ÷ 1000</dt><dd>' + fmt(x, 3) + '</dd><dt>Score z = b + wx</dt><dd>' + fmt(z, 3) + '</dd><dt>e^(−z)</dt><dd>' + sig(Math.exp(-z), 4) + '</dd><dt>p = 1 ÷ (1 + e^(−z))</dt><dd class="big">' + fmt(p, 3) + '</dd><dt>1 − p (Adélie)</dt><dd>' + fmt(1 - p, 3) + '</dd><dt>Odds p ÷ (1 − p)</dt><dd>' + sig(p / (1 - p), 3) + '</dd><dt>Log odds ln(odds)</dt><dd>' + fmt(Math.log(p / (1 - p)), 3) + ' = z</dd><dt>Predicted class</dt><dd>' + (p >= S.t ? 'Gentoo' : 'Adélie') + '</dd><dt>Log loss for recorded y</dt><dd>' + fmt(loss, 3) + '</dd><dt>dℓ/dz = p − y</dt><dd>' + fmt(p - y, 3) + '</dd></dl>';
      host.querySelector('[data-f]').innerHTML = MD('x = \\frac{' + S.mass + ' - 4000}{1000} = ' + fmt(x, 3).replace('−', '-') + ',\\quad z = ' + fmt(S.b, 2).replace('−', '-') + ' + ' + fmt(S.w, 2).replace('−', '-') + '(' + fmt(x, 3).replace('−', '-') + ') = ' + fmt(z, 3).replace('−', '-') + ',\\quad p = \\frac{1}{1 + e^{' + fmt(-z, 3).replace('−', '-') + '}} = ' + fmt(p, 3)) +
        MD('\\ell = ' + (y === 1 ? '-\\ln(' + fmt(p, 3) + ')' : '-\\ln(1 - ' + fmt(p, 3) + ')') + ' = ' + fmt(loss, 3)) +
        '<span class="faint">Moving the threshold changes only the predicted class. It never changes b, w, z or p.</span>';
    }
    draw();
  }
});

/* ===== Lecture 6: one simultaneous gradient update ===== */
DEFLAB('lgstep', {
  title: 'One gradient update for logistic regression',
  question: 'Where do g_b and g_w come from, and how do b and w change together?',
  mount: function (host) {
    const S = {xs: [-1, 0, 1], ys: [0, 0, 1], b: 0, w: 0, eta: 0.3, hist: []};
    host.innerHTML = '<div class="lab-body stack"><div class="lab-viz" data-tab></div><div class="lab-side"><div class="cols"><div>' + rangeCtl('eta', 'Learning rate η', 0.05, 2, 0.05, S.eta) + '<div class="ctl"><label for="lg-x"><span>Features x (comma separated)</span></label><input class="num-in" id="lg-x" value="-1, 0, 1"></div><div class="ctl"><label for="lg-y"><span>Labels y (0 or 1)</span></label><input class="num-in" id="lg-y" value="0, 0, 1"></div></div><div><div class="btns"><button class="btn primary" data-a="step">Apply this update</button><button class="btn" data-a="ten">Apply 10 updates</button></div><div data-h></div></div></div></div></div><div class="lab-foot trace" data-f></div>';
    bindCtls(host, S, draw);
    function readList(id) { return host.querySelector(id).value.split(/[,\s]+/).map(parseNum).filter(isFinite); }
    ['#lg-x', '#lg-y'].forEach(function (id) { host.querySelector(id).addEventListener('input', function () { const xs = readList('#lg-x'), ys = readList('#lg-y'); if (xs.length && xs.length === ys.length) { S.xs = xs; S.ys = ys.map(function (v) { return v >= 0.5 ? 1 : 0; }); S.b = 0; S.w = 0; S.hist = []; draw(); } }); });
    function grads() {
      const rows = S.xs.map(function (x, k) { const z = S.b + S.w * x, p = sigmoid(z); return {x: x, y: S.ys[k], z: z, p: p, e: p - S.ys[k], ex: (p - S.ys[k]) * x}; });
      const L = mean(rows.map(function (r) { return r.y ? -Math.log(r.p) : -Math.log(1 - r.p); }));
      return {rows: rows, gb: mean(rows.map(function (r) { return r.e; })), gw: mean(rows.map(function (r) { return r.ex; })), L: L};
    }
    host.querySelector('[data-a="step"]').addEventListener('click', function () { step(1); });
    host.querySelector('[data-a="ten"]').addEventListener('click', function () { step(10); });
    function step(k) { for (let q = 0; q < k; q++) { const g = grads(); S.hist.push({b: S.b, w: S.w, L: g.L}); S.b -= S.eta * g.gb; S.w -= S.eta * g.gw; } draw(); }
    function draw() {
      const g = grads();
      let t = '<table class="readout"><thead><tr><th>row</th><th>x</th><th>y</th><th>z = b + wx</th><th>p = σ(z)</th><th>p − y</th><th>(p − y)x</th></tr></thead><tbody>';
      g.rows.forEach(function (r, k) { t += '<tr><td>' + (k + 1) + '</td><td>' + fmt(r.x, 2) + '</td><td>' + r.y + '</td><td>' + fmt(r.z, 3) + '</td><td>' + fmt(r.p, 3) + '</td><td>' + fmt(r.e, 3) + '</td><td>' + fmt(r.ex, 3) + '</td></tr>'; });
      t += '<tr class="em"><td>Mean</td><td></td><td></td><td></td><td></td><td>g_b = ' + fmt(g.gb, 4) + '</td><td>g_w = ' + fmt(g.gw, 4) + '</td></tr></tbody></table>';
      host.querySelector('[data-tab]').innerHTML = t + '<dl class="kv"><dt>Current b, w</dt><dd>' + fmt(S.b, 4) + ', ' + fmt(S.w, 4) + '</dd><dt>Average log loss now</dt><dd>' + fmt(g.L, 4) + '</dd></dl>';
      host.querySelector('[data-h]').innerHTML = S.hist.length ? '<table class="readout"><thead><tr><th>update</th><th>b</th><th>w</th><th>loss before</th></tr></thead><tbody>' + S.hist.slice(-6).map(function (h, k) { return '<tr><td>' + (S.hist.length - Math.min(6, S.hist.length) + k + 1) + '</td><td>' + fmt(h.b, 4) + '</td><td>' + fmt(h.w, 4) + '</td><td>' + fmt(h.L, 4) + '</td></tr>'; }).join('') + '</tbody></table>' : '<p class="faint">No updates applied yet. The lecture starts at b = w = 0, so every p is 0.5.</p>';
      host.querySelector('[data-f]').innerHTML = 'Both new values use the same current gradients (a simultaneous update):' +
        MD('b_{\\text{new}} = ' + fmt(S.b, 4).replace('−', '-') + ' - ' + fmt(S.eta, 2) + '(' + fmt(g.gb, 4).replace('−', '-') + ') = ' + fmt(S.b - S.eta * g.gb, 4).replace('−', '-') + ',\\qquad w_{\\text{new}} = ' + fmt(S.w, 4).replace('−', '-') + ' - ' + fmt(S.eta, 2) + '(' + fmt(g.gw, 4).replace('−', '-') + ') = ' + fmt(S.w - S.eta * g.gw, 4).replace('−', '-'));
    }
    draw();
  }
});

/* ===== Lecture 7: linear and curved decision boundaries ===== */
DEFLAB('boundary', {
  title: 'Decision boundaries in two features',
  question: 'Where is z = 0, which way does the coefficient vector point, and what does changing b do?',
  mount: function (host) {
    const S = {mode: 'lin', b: -2, w1: 1, w2: 2, px: 0.5, py: 0.61, c0: 0, c1: 1, c2: -1};
    host.innerHTML = '<div style="padding:12px 16px 0">' + segCtl('mode', [['lin', 'Linear: z = b + w₁x₁ + w₂x₂'], ['quad', 'Degree 2: z = c₀ + c₁x₂ + c₂x₁²']], 'lin') + '</div><div class="lab-body"><div class="lab-viz" data-v></div><div class="lab-side"><div data-c></div><div data-t></div><p class="faint" style="font-size:13px">Click anywhere on the plane to move the test point.</p></div></div><div class="lab-foot trace" data-f></div>';
    bindSeg(host, S, render);
    let plot = null;
    host.querySelector('[data-v]').addEventListener('click', function (ev) { const svg = host.querySelector('svg'); if (!svg || !plot) return; const p = svgPoint(svg, ev); S.px = Math.round(plot.clampX(plot.ix(p.x)) * 100) / 100; S.py = Math.round(plot.clampY(plot.iy(p.y)) * 100) / 100; draw(); });
    function render() {
      const c = host.querySelector('[data-c]');
      if (S.mode === 'lin') c.innerHTML = rangeCtl('b', 'Intercept b', -6, 6, 0.1, S.b) + rangeCtl('w1', 'w₁', -3, 3, 0.1, S.w1) + rangeCtl('w2', 'w₂', -3, 3, 0.1, S.w2) + '<div class="btns"><button class="btn" data-p="lec">Lecture: x₁ + 2x₂ − 2</button><button class="btn" data-p="peng">Penguin: −0.2 + 1.4x₁ + x₂</button></div>';
      else c.innerHTML = rangeCtl('c0', 'c₀', -2, 2, 0.1, S.c0) + rangeCtl('c1', 'c₁ (on x₂)', -2, 2, 0.1, S.c1) + rangeCtl('c2', 'c₂ (on x₁²)', -2, 2, 0.1, S.c2) + '<p class="muted">Lecture example: z = x₂ − x₁², so the boundary is the parabola x₂ = x₁². The model is still a weighted sum, but of the features x₂ and x₁².</p>';
      bindCtls(c, S, draw);
      c.querySelectorAll('[data-p]').forEach(function (b) { b.addEventListener('click', function () { if (b.getAttribute('data-p') === 'lec') { S.b = -2; S.w1 = 1; S.w2 = 2; S.px = 2; S.py = 1; } else { S.b = -0.2; S.w1 = 1.4; S.w2 = 1; S.px = 0.5; S.py = 0.61; } ['b', 'w1', 'w2'].forEach(function (k) { setCtl(c, k, S[k]); }); draw(); }); });
      draw();
    }
    function zf(x1, x2) { return S.mode === 'lin' ? S.b + S.w1 * x1 + S.w2 * x2 : S.c0 + S.c1 * x2 + S.c2 * x1 * x1; }
    function draw() {
      plot = Plot({w: 520, h: 420, x: [-2, 4], y: [-2, 4]});
      let cells = '';
      const N = 60, cw = (plot.sx(4) - plot.sx(-2)) / N, ch = (plot.sy(-2) - plot.sy(4)) / N;
      for (let a = 0; a < N; a++) for (let q = 0; q < N; q++) { const x1 = -2 + (a + 0.5) * 6 / N, x2 = -2 + (q + 0.5) * 6 / N; const z = zf(x1, x2); cells += '<rect x="' + (plot.sx(-2) + a * cw).toFixed(1) + '" y="' + (plot.sy(-2) - (q + 1) * ch).toFixed(1) + '" width="' + (cw + 0.4).toFixed(1) + '" height="' + (ch + 0.4).toFixed(1) + '" fill="' + (z >= 0 ? 'rgba(127,166,207,0.16)' : 'rgba(255,255,255,0.015)') + '"/>'; }
      plot.raw(cells).axes({xl: 'feature x₁', yl: 'feature x₂'});
      if (S.mode === 'lin') {
        if (Math.abs(S.w2) > 1e-9) plot.fn(function (x1) { return -(S.b / S.w2) - (S.w1 / S.w2) * x1; }, 'c-amber', 2);
        else if (Math.abs(S.w1) > 1e-9) plot.seg(-S.b / S.w1, -2, -S.b / S.w1, 4, 'c-amber');
        const nrm = Math.hypot(S.w1, S.w2);
        if (nrm > 1e-9) {
          const t0 = -S.b / (nrm * nrm), ox = S.w1 * t0, oy = S.w2 * t0;
          if (ox > -2 && ox < 4 && oy > -2 && oy < 4) {
            plot.raw('<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--text)"/></marker></defs>');
            plot.seg(ox, oy, ox + S.w1 / nrm, oy + S.w2 / nrm, 'c-text', 'marker-end="url(#ar)" stroke-width="2"').text(ox + S.w1 / nrm, oy + S.w2 / nrm, 'w = (' + fmt(S.w1, 1) + ', ' + fmt(S.w2, 1) + ')', 'ann', 'start', -6);
          }
        }
      } else {
        if (Math.abs(S.c1) > 1e-9) plot.fn(function (x1) { return -(S.c0 + S.c2 * x1 * x1) / S.c1; }, 'c-amber', 200);
      }
      const z = zf(S.px, S.py), p = sigmoid(z);
      plot.dot(S.px, S.py, 6, z >= 0 ? 'f-blue' : 'f-amber').text(S.px, S.py, '(' + fmt(S.px, 2) + ', ' + fmt(S.py, 2) + ')', 'ann', 'start', -10);
      host.querySelector('[data-v]').innerHTML = plot.svg('Feature plane with decision boundary');
      let bnd = '';
      if (S.mode === 'lin' && Math.abs(S.w2) > 1e-9) bnd = MD('x_2 = -\\frac{b}{w_2} - \\frac{w_1}{w_2}x_1 = ' + fmt(-S.b / S.w2, 3).replace('−', '-') + ' ' + (S.w1 / S.w2 > 0 ? '-' : '+') + ' ' + fmt(Math.abs(S.w1 / S.w2), 3) + 'x_1');
      host.querySelector('[data-t]').innerHTML = '<dl class="kv"><dt>Test point z</dt><dd>' + fmt(z, 3) + '</dd><dt>p = σ(z)</dt><dd class="big">' + fmt(p, 3) + '</dd><dt>Predicted class</dt><dd>' + (z >= 0 ? '1 (z ≥ 0)' : '0 (z < 0)') + '</dd></dl>';
      host.querySelector('[data-f]').innerHTML = (S.mode === 'lin' ? 'Boundary z = 0:' + bnd + 'Changing b slides the line without turning it. The arrow w is perpendicular to the boundary and points toward z > 0.' : 'Boundary: ' + M('c_0 + c_1 x_2 + c_2 x_1^2 = 0') + '. Squaring x₁ bends the boundary even though the score is linear in the coefficients.') +
        MD('z = ' + (S.mode === 'lin' ? fmt(S.b, 2).replace('−', '-') + ' + ' + fmt(S.w1, 2).replace('−', '-') + '(' + fmt(S.px, 2).replace('−', '-') + ') + ' + fmt(S.w2, 2).replace('−', '-') + '(' + fmt(S.py, 2).replace('−', '-') + ')' : fmt(S.c0, 2).replace('−', '-') + ' + ' + fmt(S.c1, 2).replace('−', '-') + '(' + fmt(S.py, 2).replace('−', '-') + ') + ' + fmt(S.c2, 2).replace('−', '-') + '(' + fmt(S.px, 2).replace('−', '-') + ')^2') + ' = ' + fmt(z, 3).replace('−', '-'));
    }
    render();
  }
});

/* ===== Lecture 7: units and standardization ===== */
DEFLAB('scaling', {
  title: 'Units, coefficients and standardization',
  question: 'Why does changing units change the coefficient but not the prediction, and how is a standardized feature computed?',
  mount: function (host) {
    const S = {unit: 'mm', dth: 1, x: 193, mu: 202.15, sd: 15.23};
    host.innerHTML = '<div class="lab-body"><div class="lab-viz" data-a></div><div class="lab-side" data-b></div></div><div class="lab-foot trace" data-f></div>';
    host.querySelector('[data-a]').innerHTML = '<h4 style="margin-top:0">Same flipper, two units</h4>' + segCtl('unit', [['mm', 'Millimeters'], ['cm', 'Centimeters']], 'mm') + rangeCtl('dth', 'Coefficient step Δθ', 0, 5, 0.5, S.dth, 1) + '<div data-ua></div>';
    host.querySelector('[data-b]').innerHTML = '<h4 style="margin-top:0">Standardize with training statistics</h4>' + numCtl('x', 'New flipper length x (mm)', S.x) + numCtl('mu', 'Training mean μ (mm)', S.mu) + numCtl('sd', 'Training SD s (mm)', S.sd) + '<div data-ub></div>';
    bindCtls(host, S, draw); bindSeg(host, S, draw);
    function draw() {
      const mm = S.unit === 'mm', xv = mm ? 181 : 18.1, th = mm ? 26.37 : 263.7;
      host.querySelector('[data-ua]').innerHTML = '<dl class="kv"><dt>Input value</dt><dd>' + xv + ' ' + S.unit + '</dd><dt>Coefficient</dt><dd>' + th + ' g per ' + S.unit + '</dd><dt>Contribution θx</dt><dd class="big">' + fmt(th * xv, 1) + ' g</dd><dt>Change from step Δθ</dt><dd>Δŷ = x Δθ = ' + fmt(xv * S.dth, 1) + ' g</dd></dl>';
      const u = (S.x - S.mu) / S.sd;
      host.querySelector('[data-ub]').innerHTML = '<dl class="kv"><dt>u = (x − μ) ÷ s</dt><dd class="big">' + fmt(u, 2) + '</dd></dl><p class="muted" style="font-size:14px">' + (Math.abs(u) < 1e-9 ? 'At the training mean.' : fmt(Math.abs(u), 2) + ' standard deviations ' + (u < 0 ? 'below' : 'above') + ' the training mean.') + ' Test and new inputs reuse the training μ and s.</p>';
      host.querySelector('[data-f]').innerHTML = MD('\\theta_{\\text{cm}} = 10\\,\\theta_{\\text{mm}}:\\quad 26.37 \\times 181 = 263.7 \\times 18.1 \\approx 4773\\text{ g}') + MD('u = \\frac{' + fmt(S.x, 2) + ' - ' + fmt(S.mu, 2) + '}{' + fmt(S.sd, 2) + '} = ' + fmt(u, 3).replace('−', '-'));
    }
    draw();
  }
});

/* ===== Lecture 7: image and audio features ===== */
const DIGIT = [[0, 0, 0, 4, 15, 12, 0, 0], [0, 0, 3, 16, 15, 14, 0, 0], [0, 0, 8, 13, 8, 16, 0, 0], [0, 0, 1, 6, 15, 11, 0, 0], [0, 1, 8, 13, 15, 1, 0, 0], [0, 9, 16, 16, 5, 0, 0, 0], [0, 3, 13, 16, 16, 11, 5, 0], [0, 0, 0, 3, 11, 16, 9, 0]];
function imageFeatures(r) {
  const H = r.length, W = r[0].length; let tot = 0, cs = 0, rs = 0, L = 0, R = 0, diff = 0;
  for (let a = 0; a < H; a++) for (let b = 0; b < W; b++) {
    const w = r[a][b] / 16; tot += w;
    cs += (-1 + 2 * b / (W - 1)) * w; rs += (-1 + 2 * a / (H - 1)) * w;
    if (b < W / 2) L += w; else R += w;
    diff += Math.abs(w - r[a][W - 1 - b] / 16);
  }
  return {D: tot / (H * W), mc: tot ? cs / tot : 0, mr: tot ? rs / tot : 0, S: tot ? 1 - diff / (2 * tot) : 1, B: (L + R) ? (L - R) / (L + R) : 0, tot: tot, L: L, R: R, diff: diff};
}
DEFLAB('signal', {
  title: 'Features from an image and a recording',
  question: 'How do 64 pixels or thousands of samples become a few useful numbers?',
  mount: function (host) {
    const S = {mode: 'img', px: DIGIT.map(function (r) { return r.slice(); }), wave: [0.2, 0.5, 0.1, -0.4, -0.3, 0.2, 0.6, -0.1, -0.5, 0.3, 0.1, -0.2]};
    host.innerHTML = '<div style="padding:12px 16px 0">' + segCtl('mode', [['img', 'Image: lecture 8 × 8 digit'], ['aud', 'Audio: constructed samples']], 'img') + '</div><div data-m></div>';
    bindSeg(host, S, render);
    function render() { if (S.mode === 'img') drawImg(); else drawAud(); }
    function drawImg() {
      const m = host.querySelector('[data-m]');
      let g = '<div style="display:grid;grid-template-columns:repeat(8,1fr);gap:2px;max-width:340px" role="grid" aria-label="Pixel grid">';
      S.px.forEach(function (row, a) { row.forEach(function (v, b) { const c = Math.round(v / 16 * 235 + 12); g += '<button type="button" data-px="' + a + ',' + b + '" aria-label="row ' + a + ' column ' + b + ' value ' + v + '" style="aspect-ratio:1;border:0;border-radius:2px;background:rgb(' + c + ',' + c + ',' + c + ');color:' + (v > 9 ? '#111' : '#8fbf8a') + ';font:11px var(--mono);cursor:pointer">' + v + '</button>'; }); });
      g += '</div><p class="faint" style="font-size:13px">Click a pixel to raise it by 4 (wraps from 16 to 0).</p>';
      const f = imageFeatures(S.px);
      m.innerHTML = '<div class="lab-body"><div class="lab-viz">' + g + '</div><div class="lab-side"><dl class="kv"><dt>Total ink Σw</dt><dd>' + fmt(f.tot, 3) + '</dd><dt>Ink density D = Σw ÷ 64</dt><dd class="big">' + fmt(f.D, 3) + '</dd><dt>Column center μ_column</dt><dd>' + fmt(f.mc, 3) + '</dd><dt>Row center μ_row</dt><dd>' + fmt(f.mr, 3) + '</dd><dt>Reflection similarity S</dt><dd>' + fmt(f.S, 3) + '</dd><dt>Left-right balance B</dt><dd>' + fmt(f.B, 3) + '</dd></dl><div class="btns"><button class="btn" data-a="mirror">Mirror the image</button></div></div></div><div class="lab-foot trace">' +
        MD('w_{ab} = \\frac{r_{ab}}{16},\\quad D = \\frac{1}{HW}\\sum_{a,b} w_{ab} = \\frac{' + fmt(f.tot, 3) + '}{64} = ' + fmt(f.D, 3)) + MD('B = \\frac{L - R}{L + R} = \\frac{' + fmt(f.L, 3) + ' - ' + fmt(f.R, 3) + '}{' + fmt(f.L, 3) + ' + ' + fmt(f.R, 3) + '} = ' + fmt(f.B, 3).replace('−', '-')) + '<span class="faint">Positions run from −1 (top row, left column) to +1 (bottom row, right column). The pixel values are read from the lecture slide; the feature values are computed here.</span></div>';
      m.querySelectorAll('[data-px]').forEach(function (b) { b.addEventListener('click', function () { const ab = b.getAttribute('data-px').split(',').map(Number); S.px[ab[0]][ab[1]] = (S.px[ab[0]][ab[1]] + 4) > 16 ? 0 : S.px[ab[0]][ab[1]] + 4; drawImg(); }); });
      m.querySelector('[data-a="mirror"]').addEventListener('click', function () { S.px = S.px.map(function (r) { return r.slice().reverse(); }); drawImg(); });
    }
    function drawAud() {
      const m = host.querySelector('[data-m]');
      const a = S.wave, T = a.length, ab = mean(a), c = a.map(function (v) { return v - ab; });
      let zc = 0; for (let t = 1; t < T; t++) if (c[t] * c[t - 1] < 0) zc++;
      const e = c.map(function (v) { return v * v; }), E = sum(e), om = e.map(function (v) { return E ? v / E : 0; });
      const pos = c.map(function (v, t) { return T > 1 ? t / (T - 1) : 0; });
      const center = sum(om.map(function (o, t) { return o * pos[t]; }));
      const early = sum(om.slice(0, Math.ceil(T / 4)));
      const P = Plot({w: 560, h: 220, x: [0, T - 1], y: [-1, 1]});
      P.axes({xl: 'sample t', yl: 'centered amplitude', xt: a.map(function (v, t) { return t; })}).seg(0, 0, T - 1, 0, 'c-faint').line(c.map(function (v, t) { return [t, v]; }), 'c-blue');
      c.forEach(function (v, t) { P.dot(t, v, 4, (t > 0 && v * c[t - 1] < 0) ? 'f-amber' : 'f-text'); });
      m.innerHTML = '<div class="lab-body"><div class="lab-viz">' + P.svg('Centered audio samples') + '<p class="faint" style="font-size:13px">Amber dots mark a sign change from the previous sample.</p></div><div class="lab-side"><div class="ctl"><label for="wv"><span>Samples a_t (comma separated)</span></label><input class="num-in" id="wv" value="' + a.join(', ') + '"></div><dl class="kv"><dt>Sign changes</dt><dd>' + zc + '</dd><dt>Neighboring pairs T − 1</dt><dd>' + (T - 1) + '</dd><dt>Zero-crossing rate Z</dt><dd class="big">' + fmt(zc / (T - 1), 3) + '</dd><dt>Early-energy fraction</dt><dd>' + fmt(early, 3) + '</dd><dt>Energy center (0 to 1)</dt><dd>' + fmt(center, 3) + '</dd></dl></div></div><div class="lab-foot trace">' + MD('Z = \\frac{\\#\\{t : a_t a_{t-1} < 0\\}}{T - 1} = \\frac{' + zc + '}{' + (T - 1) + '} = ' + fmt(zc / (T - 1), 3)) + '<span class="faint">These 12 samples are constructed for practice. The lecture applies the same formulas to 64,000 samples (4 s × 16,000 samples per second).</span></div>';
      const inp = m.querySelector('#wv');
      inp.addEventListener('change', function () { const v = inp.value.split(/[,\s]+/).map(parseNum).filter(isFinite); if (v.length >= 3) { S.wave = v; drawAud(); } });
    }
    render();
  }
});
