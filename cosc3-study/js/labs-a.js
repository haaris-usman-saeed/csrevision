/* Labs for Lectures 2 to 5. Every lab resets to the lecture's own example. */
'use strict';

/* ===== Lecture 2: constant prediction under MAE and MSE ===== */
DEFLAB('constant', {
  title: 'Constant prediction and loss',
  question: 'Which single guess c minimizes MAE, which minimizes MSE, and why are they different?',
  mount: function (host) {
    const S = {c: 4, ys: [2, 3, 4, 5, 16]};
    host.innerHTML = '<div class="lab-body"><div class="lab-viz"><div data-v1></div><div data-v2></div></div><div class="lab-side">' +
      rangeCtl('c', 'Constant guess c (minutes)', 0, 18, 0.1, S.c, 1) +
      '<div class="ctl"><label for="ys-in"><span>Wait times y (comma separated)</span></label><input class="num-in" id="ys-in" value="2, 3, 4, 5, 16"></div>' +
      '<div class="btns"><button class="btn" data-a="median">c = median</button><button class="btn" data-a="mean">c = mean</button><button class="btn" data-a="drop">Remove the 16</button><button class="btn" data-a="even">Even count: 2, 3, 5, 16</button></div>' +
      '<div data-t></div></div></div><div class="lab-foot trace" data-f></div>';
    const ysIn = host.querySelector('#ys-in');
    bindCtls(host, S, draw);
    ysIn.addEventListener('input', function () {
      const v = ysIn.value.split(/[,\s]+/).map(parseNum).filter(isFinite);
      if (v.length >= 2) { S.ys = v; ysIn.removeAttribute('aria-invalid'); draw(); } else ysIn.setAttribute('aria-invalid', 'true');
    });
    host.querySelectorAll('[data-a]').forEach(function (b) {
      b.addEventListener('click', function () {
        const a = b.getAttribute('data-a');
        if (a === 'median') S.c = median(S.ys);
        if (a === 'mean') S.c = mean(S.ys);
        if (a === 'drop') { S.ys = [2, 3, 4, 5]; ysIn.value = '2, 3, 4, 5'; }
        if (a === 'even') { S.ys = [2, 3, 5, 16]; ysIn.value = '2, 3, 5, 16'; }
        setCtl(host, 'c', +S.c.toFixed(2)); draw();
      });
    });
    function draw() {
      const ys = S.ys, n = ys.length, c = S.c;
      const mae = function (k) { return mean(ys.map(function (y) { return Math.abs(y - k); })); };
      const mse = function (k) { return mean(ys.map(function (y) { return (y - k) * (y - k); })); };
      const lo = Math.min(0, Math.min.apply(null, ys) - 2), hi = Math.max.apply(null, ys) + 2;
      const r = host.querySelector('#r-c'); r.min = lo; r.max = hi;
      const mu = mean(ys), md = median(ys);
      const p1 = Plot({w: 560, h: 200, x: [lo, hi], y: [0, Math.max(mae(lo), mae(hi)) * 1.08], m: {b: 26}});
      p1.axes({yl: 'MAE(c), minutes'}).fn(mae, 'c-blue', 300);
      p1.seg(c, 0, c, p1.iy(p1.m.t), 'c-faint').dot(c, mae(c), 5, 'f-text').text(c, mae(c), 'MAE ' + fmt(mae(c), 2), 'ann', 'start', -10);
      p1.dot(md, mae(md), 4, 'f-green').text(md, 0, 'median ' + fmt(md, 2), 'lbl', 'middle', -6);
      const p2 = Plot({w: 560, h: 220, x: [lo, hi], y: [0, Math.max(mse(lo), mse(hi)) * 1.08]});
      p2.axes({yl: 'MSE(c), minutes²', xl: 'constant guess c'}).fn(mse, 'c-amber', 300);
      p2.seg(c, 0, c, p2.iy(p2.m.t), 'c-faint').dot(c, mse(c), 5, 'f-text').text(c, mse(c), 'MSE ' + fmt(mse(c), 2), 'ann', 'start', -10);
      p2.dot(mu, mse(mu), 4, 'f-green').text(mu, 0, 'mean ' + fmt(mu, 2), 'lbl', 'middle', -6);
      ys.forEach(function (y) { p2.raw('<line x1="' + p2.sx(y) + '" x2="' + p2.sx(y) + '" y1="' + (p2.h - p2.m.b - 7) + '" y2="' + (p2.h - p2.m.b) + '" stroke="var(--text-2)" stroke-width="2"/>'); });
      host.querySelector('[data-v1]').innerHTML = p1.svg('MAE as a function of the constant guess');
      host.querySelector('[data-v2]').innerHTML = p2.svg('MSE as a function of the constant guess');
      const absd = ys.map(function (y) { return Math.abs(y - c); }), sq = ys.map(function (y) { return (y - c) * (y - c); });
      let t = '<table class="readout"><thead><tr><th>y</th><th>|y − c|</th><th>(y − c)²</th></tr></thead><tbody>';
      ys.forEach(function (y, k) { t += '<tr><td>' + fmt(y, 1) + '</td><td>' + fmt(absd[k], 2) + '</td><td>' + fmt(sq[k], 2) + '</td></tr>'; });
      t += '<tr class="em"><td>Sum</td><td>' + fmt(sum(absd), 2) + '</td><td>' + fmt(sum(sq), 2) + '</td></tr><tr class="em"><td>Average (÷ ' + n + ')</td><td>' + fmt(mae(c), 3) + '</td><td>' + fmt(mse(c), 3) + '</td></tr></tbody></table>';
      const below = ys.filter(function (y) { return y < c; }).length, above = ys.filter(function (y) { return y > c; }).length;
      t += '<dl class="kv"><dt>Mean ȳ</dt><dd>' + fmt(mu, 3) + '</dd><dt>Median</dt><dd>' + fmt(md, 3) + '</dd>' +
        '<dt>MAE slope at c</dt><dd>(' + below + ' below − ' + above + ' above) ÷ ' + n + ' = ' + fmt((below - above) / n, 2) + '</dd>' +
        '<dt>MSE slope at c</dt><dd>2(c − ȳ) = ' + fmt(2 * (c - mu), 2) + '</dd></dl>';
      host.querySelector('[data-t]').innerHTML = t;
      const cs = fmt(c, 1).replace('−', '-');
      const absTerms = ys.map(function (y) { return '|' + fmt(y, 0).replace('−', '-') + '-' + cs + '|'; }).join('+');
      host.querySelector('[data-f]').innerHTML = 'Receipt for the current guess:' + MD('\\mathrm{MAE}(' + cs + ') = \\frac{' + absTerms + '}{' + n + '} = \\frac{' + fmt(sum(absd), 2).replace('−', '-') + '}{' + n + '} = ' + fmt(mae(c), 3).replace('−', '-')) +
        MD('\\mathrm{MSE}(' + cs + ') = \\frac{' + fmt(sum(sq), 2).replace('−', '-') + '}{' + n + '} = ' + fmt(mse(c), 3).replace('−', '-'));
    }
    draw();
  }
});

/* ===== Lecture 3: spread, covariance and correlation ===== */
DEFLAB('spread', {
  title: 'Spread, covariance and correlation',
  question: 'How do variance and SD measure spread, and what do covariance and r measure for pairs?',
  mount: function (host) {
    const PRE = {
      trend: [[1, 2], [2, 3], [3, 5], [4, 4], [5, 6], [6, 7]],
      square: [[-3, 9], [-2, 4], [-1, 1], [0, 0], [1, 1], [2, 4], [3, 9]],
      outlier: [[1, 2], [2, 3], [3, 5], [4, 4], [5, 6], [6, -3]]
    };
    const S = {mode: '1d', vals: [0, 4, 8], pts: PRE.trend.map(function (p) { return p.slice(); }), scale: 1};
    host.innerHTML = '<div style="padding:12px 16px 0">' + segCtl('mode', [['1d', 'One variable: spread'], ['2d', 'Two variables: covariance and r']], '1d') + '</div><div data-m></div>';
    bindSeg(host, S, render);
    function render() {
      const m = host.querySelector('[data-m]');
      if (S.mode === '1d') {
        m.innerHTML = '<div class="lab-body"><div class="lab-viz" data-v></div><div class="lab-side">' +
          '<div class="ctl"><label for="v-in"><span>Values (comma separated)</span></label><input class="num-in" id="v-in" value="' + S.vals.join(', ') + '"></div>' +
          '<div class="btns"><button class="btn" data-p="b">Server B: 0, 4, 8</button><button class="btn" data-p="a">Server A: 4, 4, 4</button><button class="btn" data-p="o">Add a 15 ms glitch</button></div><div data-t></div></div></div><div class="lab-foot trace" data-f></div>';
        const vin = m.querySelector('#v-in');
        vin.addEventListener('input', function () { const v = vin.value.split(/[,\s]+/).map(parseNum).filter(isFinite); if (v.length >= 2) { S.vals = v; draw1(); } });
        m.querySelectorAll('[data-p]').forEach(function (b) { b.addEventListener('click', function () { const p = b.getAttribute('data-p'); S.vals = p === 'b' ? [0, 4, 8] : p === 'a' ? [4, 4, 4] : S.vals.concat([15]); vin.value = S.vals.join(', '); draw1(); }); });
        draw1();
      } else {
        m.innerHTML = '<div class="lab-body"><div class="lab-viz" data-v></div><div class="lab-side">' +
          '<div class="btns"><button class="btn" data-p="trend">Upward trend</button><button class="btn" data-p="square">y = x² (exact dependence)</button><button class="btn" data-p="outlier">One outlier</button></div>' +
          segCtl('scale', [['1', 'x in original units'], ['10', 'x × 10']], String(S.scale)) +
          '<div data-t></div><p class="faint" style="font-size:13px">Drag any point. Blue quadrants add positive products; amber quadrants add negative products.</p></div></div><div class="lab-foot trace" data-f></div>';
        bindSeg(m, S, function (k) { if (k === 'scale') { S.scale = +S.scale; draw2(); } });
        m.querySelectorAll('[data-p]').forEach(function (b) { b.addEventListener('click', function () { S.pts = PRE[b.getAttribute('data-p')].map(function (p) { return p.slice(); }); draw2(); }); });
        let plot = null;
        enableDrag(m.querySelector('[data-v]'), function () { return plot; }, function (k, x, y) { S.pts[+k] = [Math.round(x * 10) / 10, Math.round(y * 10) / 10]; draw2(); });
        function draw2() {
          const xs = S.pts.map(function (p) { return p[0] * S.scale; }), ys = S.pts.map(function (p) { return p[1]; }), n = xs.length;
          const xb = mean(xs), yb = mean(ys);
          const prods = xs.map(function (x, k) { return (x - xb) * (ys[k] - yb); });
          const cov = sum(prods) / (n - 1);
          const sx = Math.sqrt(sum(xs.map(function (x) { return (x - xb) * (x - xb); })) / (n - 1));
          const sy = Math.sqrt(sum(ys.map(function (y) { return (y - yb) * (y - yb); })) / (n - 1));
          const r = cov / (sx * sy);
          const X0 = -4 * S.scale, X1 = 7 * S.scale;
          plot = Plot({w: 560, h: 360, x: [X0, X1], y: [-5, 10]});
          plot.rectD(xb, yb, X1, 10, 'q-pos').rectD(X0, -5, xb, yb, 'q-pos').rectD(X0, yb, xb, 10, 'q-neg').rectD(xb, -5, X1, yb, 'q-neg');
          plot.raw('<style>.q-pos{fill:rgba(127,166,207,.07)}.q-neg{fill:rgba(217,168,91,.07)}</style>');
          plot.axes({xl: 'x', yl: 'y'}).seg(xb, -5, xb, 10, 'c-faint').seg(X0, yb, X1, yb, 'c-faint');
          plot.text(xb, 10, 'x̄ = ' + fmt(xb, 2), 'lbl', 'middle', 12);
          S.pts.forEach(function (p, k) { plot.dot(p[0] * S.scale, p[1], 7, prods[k] >= 0 ? 'f-blue drag' : 'f-amber drag', 'data-drag="' + k + '" tabindex="0"'); });
          m.querySelector('[data-v]').innerHTML = plot.svg('Scatter of paired observations with quadrants');
          let t = '<table class="readout"><thead><tr><th>x</th><th>y</th><th>(x − x̄)(y − ȳ)</th></tr></thead><tbody>';
          xs.forEach(function (x, k) { t += '<tr><td>' + fmt(x, 1) + '</td><td>' + fmt(ys[k], 1) + '</td><td>' + fmt(prods[k], 2) + '</td></tr>'; });
          t += '<tr class="em"><td>Sum of products</td><td></td><td>' + fmt(sum(prods), 2) + '</td></tr></tbody></table>';
          t += '<dl class="kv"><dt>cov(x, y) = sum ÷ (n − 1)</dt><dd>' + fmt(cov, 3) + '</dd><dt>s_x</dt><dd>' + fmt(sx, 3) + '</dd><dt>s_y</dt><dd>' + fmt(sy, 3) + '</dd><dt>r = cov ÷ (s_x s_y)</dt><dd class="big">' + fmt(r, 3) + '</dd></dl>';
          m.querySelector('[data-t]').innerHTML = t;
          m.querySelector('[data-f]').innerHTML = MD('r = \\frac{\\mathrm{cov}(x,y)}{s_x s_y} = \\frac{' + fmt(cov, 3).replace('−', '-') + '}{' + fmt(sx, 3) + '\\times ' + fmt(sy, 3) + '} = ' + fmt(r, 3).replace('−', '-')) +
            '<span class="faint">Switch x to "× 10": covariance is multiplied by 10, s_x is multiplied by 10, and r does not move.</span>';
        }
        draw2();
      }
    }
    function draw1() {
      const m = host.querySelector('[data-m]');
      const v = S.vals, n = v.length, mu = mean(v);
      const dev = v.map(function (y) { return y - mu; });
      const ss = sum(dev.map(function (d) { return d * d; }));
      const mad = mean(dev.map(Math.abs));
      const lo = Math.min(0, Math.min.apply(null, v) - 1), hi = Math.max(10, Math.max.apply(null, v) + 1);
      const p = Plot({w: 560, h: 170, x: [lo, hi], y: [0, 1], m: {l: 16, b: 32}});
      p.axes({yt: [], grid: false, xl: 'latency (ms)'}).seg(mu, 0, mu, 1, 'c-green');
      p.text(mu, 1, 'mean ' + fmt(mu, 2), 'ann', 'middle', 14);
      const stack = {};
      v.forEach(function (y, k) { const key = y.toFixed(3); stack[key] = (stack[key] || 0) + 1; const yy = 0.18 + 0.14 * (stack[key] - 1); p.seg(mu, yy, y, yy, y >= mu ? 'c-blue' : 'c-amber').dot(y, yy, 6, 'f-text'); });
      m.querySelector('[data-v]').innerHTML = p.svg('Values on a line with deviations from the mean');
      let t = '<table class="readout"><thead><tr><th>y</th><th>y − ȳ</th><th>|y − ȳ|</th><th>(y − ȳ)²</th></tr></thead><tbody>';
      v.forEach(function (y, k) { t += '<tr><td>' + fmt(y, 2) + '</td><td>' + fmt(dev[k], 2) + '</td><td>' + fmt(Math.abs(dev[k]), 2) + '</td><td>' + fmt(dev[k] * dev[k], 2) + '</td></tr>'; });
      t += '<tr class="em"><td>Sum</td><td>' + fmt(sum(dev), 2) + '</td><td>' + fmt(sum(dev.map(Math.abs)), 2) + '</td><td>' + fmt(ss, 2) + '</td></tr></tbody></table>';
      t += '<dl class="kv"><dt>MAD = sum |y − ȳ| ÷ n</dt><dd>' + fmt(mad, 3) + '</dd><dt>Variance ÷ n</dt><dd>' + fmt(ss / n, 3) + ' ms²</dd><dt>Sample variance s² ÷ (n − 1)</dt><dd>' + fmt(ss / (n - 1), 3) + ' ms²</dd><dt>SD from ÷ n</dt><dd>' + fmt(Math.sqrt(ss / n), 3) + ' ms</dd><dt>Sample SD s</dt><dd class="big">' + fmt(Math.sqrt(ss / (n - 1)), 3) + ' ms</dd></dl>';
      m.querySelector('[data-t]').innerHTML = t;
      m.querySelector('[data-f]').innerHTML = 'The raw deviations always sum to zero (here ' + fmt(sum(dev), 3) + '), which is why we take absolute values or squares.' +
        MD('s^2 = \\frac{' + fmt(ss, 2) + '}{' + n + '-1} = ' + fmt(ss / (n - 1), 3) + ',\\quad s = \\sqrt{' + fmt(ss / (n - 1), 3) + '} = ' + fmt(Math.sqrt(ss / (n - 1)), 3));
    }
    render();
  }
});

/* ===== Lecture 4: least squares line on the cafe orders ===== */
function cafeMSE(t0, t1, xs, ys) { let s = 0; for (let k = 0; k < xs.length; k++) { const e = ys[k] - (t0 + t1 * xs[k]); s += e * e; } return s / xs.length; }
function olsFit(xs, ys) {
  const xb = mean(xs), yb = mean(ys);
  let sxy = 0, sxx = 0;
  for (let k = 0; k < xs.length; k++) { sxy += (xs[k] - xb) * (ys[k] - yb); sxx += (xs[k] - xb) * (xs[k] - xb); }
  const t1 = sxx === 0 ? 0 : sxy / sxx;
  return {xb: xb, yb: yb, sxy: sxy, sxx: sxx, t1: t1, t0: yb - t1 * xb};
}
function heat(plot, f, nx, ny, xr, yr) {
  let vals = [], mn = Infinity, mx = -Infinity;
  for (let a = 0; a < nx; a++) for (let b = 0; b < ny; b++) { const x = xr[0] + (a + 0.5) * (xr[1] - xr[0]) / nx, y = yr[0] + (b + 0.5) * (yr[1] - yr[0]) / ny; const v = Math.log(1 + f(x, y)); vals.push([a, b, v]); mn = Math.min(mn, v); mx = Math.max(mx, v); }
  const cw = (plot.sx(xr[1]) - plot.sx(xr[0])) / nx, ch = (plot.sy(yr[0]) - plot.sy(yr[1])) / ny;
  let out = '';
  vals.forEach(function (q) { const o = 0.55 * (1 - (q[2] - mn) / (mx - mn || 1)); out += '<rect x="' + (plot.sx(xr[0]) + q[0] * cw).toFixed(1) + '" y="' + (plot.sy(yr[0]) - (q[1] + 1) * ch).toFixed(1) + '" width="' + (cw + 0.5).toFixed(1) + '" height="' + (ch + 0.5).toFixed(1) + '" fill="rgba(127,166,207,' + o.toFixed(3) + ')"/>'; });
  plot.raw(out);
}
DEFLAB('regression', {
  title: 'Least squares on the café orders',
  question: 'Which line makes the total area of the squared residuals smallest?',
  mount: function (host) {
    const X = [1, 2, 3, 4], Y = [3, 4, 8, 9];
    const S = {t0: 1, t1: 2, ys: Y.slice(), sq: 'on'};
    host.innerHTML = '<div class="lab-body"><div class="lab-viz"><div data-v></div><div data-l></div></div><div class="lab-side">' +
      rangeCtl('t0', 'Intercept θ₀', -4, 4, 0.05, S.t0) + rangeCtl('t1', 'Slope θ₁', 0, 4, 0.05, S.t1) +
      '<div class="btns"><button class="btn primary" data-a="ols">Snap to least squares</button><button class="btn" data-a="alt">Try 1 + 2x</button></div>' +
      segCtl('sq', [['on', 'Show squared residuals'], ['off', 'Hide']], 'on') + '<div data-t></div></div></div><div class="lab-foot trace" data-f></div>';
    bindCtls(host, S, draw); bindSeg(host, S, draw);
    host.querySelector('[data-a="ols"]').addEventListener('click', function () { const f = olsFit(X, S.ys); S.t0 = Math.max(-4, Math.min(4, f.t0)); S.t1 = Math.max(0, Math.min(4, f.t1)); setCtl(host, 't0', S.t0); setCtl(host, 't1', S.t1); draw(); });
    host.querySelector('[data-a="alt"]').addEventListener('click', function () { S.t0 = 1; S.t1 = 2; setCtl(host, 't0', 1); setCtl(host, 't1', 2); draw(); });
    let plot = null;
    enableDrag(host.querySelector('[data-v]'), function () { return plot; }, function (k, x, y) { S.ys[+k] = Math.round(y * 10) / 10; draw(); });
    function draw() {
      const ys = S.ys, f = olsFit(X, ys);
      const pred = X.map(function (x) { return S.t0 + S.t1 * x; });
      const e = ys.map(function (y, k) { return y - pred[k]; });
      const rss = sum(e.map(function (v) { return v * v; }));
      const tss = sum(ys.map(function (y) { return (y - f.yb) * (y - f.yb); }));
      plot = Plot({w: 560, h: 330, x: [0, 5], y: [0, 12]});
      plot.axes({xl: 'items ordered x', yl: 'wait (min) y'});
      if (S.sq === 'on') e.forEach(function (v, k) { const side = Math.abs(plot.sy(0) - plot.sy(Math.abs(v))); const px = plot.sx(X[k]), py1 = plot.sy(Math.max(ys[k], pred[k])); plot.raw('<rect class="sq" x="' + px + '" y="' + py1 + '" width="' + side + '" height="' + side + '"/>'); });
      plot.fn(function (x) { return S.t0 + S.t1 * x; }, 'c-blue');
      e.forEach(function (v, k) { plot.seg(X[k], ys[k], X[k], pred[k], 'c-amber'); });
      ys.forEach(function (y, k) { plot.dot(X[k], y, 7, 'f-text drag', 'data-drag="' + k + '"'); plot.text(X[k], y, 'e=' + fmt(e[k], 2), 'lbl', 'end', -10); });
      plot.dot(f.xb, f.yb, 4, 'f-green').text(f.xb, f.yb, '(x̄, ȳ)', 'lbl', 'start', 16);
      host.querySelector('[data-v]').innerHTML = plot.svg('Café orders with candidate line and residuals');
      const L = Plot({w: 560, h: 230, x: [-4, 4], y: [0, 4], m: {b: 34}});
      heat(L, function (a, b) { return cafeMSE(a, b, X, ys); }, 48, 30, [-4, 4], [0, 4]);
      L.axes({xl: 'intercept θ₀', yl: 'slope θ₁'}).dot(f.t0, f.t1, 5, 'f-amber').text(f.t0, f.t1, 'OLS', 'lbl', 'start', -8).dot(S.t0, S.t1, 5, 'f-text');
      host.querySelector('[data-l]').innerHTML = '<div class="faint" style="font-size:12.5px;margin:6px 0 2px">Loss landscape: darker blue is lower MSE. White dot is your line; amber dot is the least-squares minimum.</div>' + L.svg('MSE over intercept and slope');
      let t = '<table class="readout"><thead><tr><th>x</th><th>y</th><th>ŷ</th><th>e = y − ŷ</th><th>e²</th></tr></thead><tbody>';
      X.forEach(function (x, k) { t += '<tr><td>' + x + '</td><td>' + fmt(ys[k], 1) + '</td><td>' + fmt(pred[k], 2) + '</td><td>' + fmt(e[k], 2) + '</td><td>' + fmt(e[k] * e[k], 3) + '</td></tr>'; });
      t += '<tr class="em"><td>Sum</td><td></td><td></td><td>' + fmt(sum(e), 2) + '</td><td>' + fmt(rss, 3) + '</td></tr></tbody></table>';
      t += '<dl class="kv"><dt>MSE = RSS ÷ 4</dt><dd class="big">' + fmt(rss / 4, 4) + '</dd><dt>R² = 1 − RSS ÷ TSS</dt><dd>' + fmt(1 - rss / tss, 3) + '</dd><dt>Least-squares θ₀*, θ₁*</dt><dd>' + fmt(f.t0, 3) + ', ' + fmt(f.t1, 3) + '</dd><dt>Least-squares MSE</dt><dd>' + fmt(cafeMSE(f.t0, f.t1, X, ys), 4) + '</dd></dl>';
      host.querySelector('[data-t]').innerHTML = t;
      host.querySelector('[data-f]').innerHTML = 'How the least-squares numbers come out of this data (drag a point and watch them change):' +
        MD('\\bar{x} = ' + fmt(f.xb, 2) + ',\\; \\bar{y} = ' + fmt(f.yb, 2) + ',\\; \\theta_1^* = \\frac{\\sum \\tilde{x}_i \\tilde{y}_i}{\\sum \\tilde{x}_i^2} = \\frac{' + fmt(f.sxy, 3).replace('−', '-') + '}{' + fmt(f.sxx, 2) + '} = ' + fmt(f.t1, 3).replace('−', '-') + ',\\; \\theta_0^* = ' + fmt(f.yb, 2) + ' - ' + fmt(f.t1, 3).replace('−', '-') + '\\times ' + fmt(f.xb, 2) + ' = ' + fmt(f.t0, 3).replace('−', '-'));
    }
    draw();
  }
});

/* ===== Lecture 5: search methods on the same landscape ===== */
function hillClimb(start, step, budget, f) {
  let cur = start.slice(), cv = f(cur[0], cur[1]);
  const tested = [cur.slice()], path = [cur.slice()];
  let evals = 1;
  while (evals < budget) {
    const nb = [[cur[0] - step, cur[1]], [cur[0] + step, cur[1]], [cur[0], cur[1] - step], [cur[0], cur[1] + step]];
    let best = null, bv = cv;
    for (let k = 0; k < nb.length && evals < budget; k++) { const v = f(nb[k][0], nb[k][1]); evals++; tested.push(nb[k]); if (v < bv - 1e-12) { bv = v; best = nb[k]; } }
    if (!best) break;
    cur = best; cv = bv; path.push(cur.slice());
  }
  return {best: cur, val: cv, tested: tested, path: path, evals: evals};
}
DEFLAB('search', {
  title: 'Search over intercept and slope',
  question: 'Without derivatives, how do grid, random and hill-climbing search find a good line, and when do they miss?',
  mount: function (host) {
    const X = [1, 2, 3, 4], Y = [3, 4, 8, 9];
    const f = function (a, b) { return cafeMSE(a, b, X, Y); };
    const S = {method: 'exhaustive', k: 3, B: 20, seed: 7, step: 0.5};
    host.innerHTML = '<div style="padding:12px 16px 0">' + segCtl('method', [['exhaustive', 'Exhaustive'], ['grid', 'Grid'], ['random', 'Random'], ['hill', 'Hill climbing']], S.method) + '</div>' +
      '<div class="lab-body"><div class="lab-viz" data-v></div><div class="lab-side"><div data-c></div><div data-t></div></div></div><div class="lab-foot trace" data-f></div>';
    bindSeg(host, S, render);
    function render() {
      const c = host.querySelector('[data-c]');
      if (S.method === 'exhaustive') c.innerHTML = '<p class="muted">Lecture setup: intercepts 0, 1, 2 and slopes 1, 2, 3. Every one of the 3 × 3 = 9 combinations is tested.</p>';
      if (S.method === 'grid') c.innerHTML = rangeCtl('k', 'Values per axis', 2, 15, 1, S.k, 0) + '<p class="muted">Evenly spaced over intercepts −4 to 4 and slopes 0 to 4. The lecture uses 3 per axis.</p>';
      if (S.method === 'random') c.innerHTML = rangeCtl('B', 'Budget B (draws)', 1, 200, 1, S.B, 0) + rangeCtl('seed', 'Random seed', 1, 50, 1, S.seed, 0);
      if (S.method === 'hill') c.innerHTML = rangeCtl('step', 'Step size γ', 0.05, 1, 0.05, S.step, 2) + rangeCtl('B', 'Budget B (evaluations)', 5, 400, 1, Math.max(S.B, 5), 0) + '<p class="muted">Starts at (1, 0) as in the lecture, tries ±γ on one coefficient at a time, and keeps the best improvement.</p>';
      bindCtls(c, S, draw);
      draw();
    }
    function draw() {
      let tested = [], path = null;
      if (S.method === 'exhaustive') [0, 1, 2].forEach(function (a) { [1, 2, 3].forEach(function (b) { tested.push([a, b]); }); });
      if (S.method === 'grid') { const k = Math.round(S.k); for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) tested.push([-4 + 8 * a / (k - 1), 4 * b / (k - 1)]); }
      if (S.method === 'random') { const r = rng(Math.round(S.seed) * 7919); for (let q = 0; q < Math.round(S.B); q++) tested.push([-4 + 8 * r(), 4 * r()]); }
      let hc = null;
      if (S.method === 'hill') { hc = hillClimb([1, 0], S.step, Math.round(Math.max(S.B, 5)), f); tested = hc.tested; path = hc.path; }
      let best = tested[0], bv = f(best[0], best[1]);
      tested.forEach(function (p) { const v = f(p[0], p[1]); if (v < bv) { bv = v; best = p; } });
      const P = Plot({w: 560, h: 330, x: [-4, 4], y: [0, 4]});
      heat(P, f, 56, 34, [-4, 4], [0, 4]);
      P.axes({xl: 'intercept θ₀', yl: 'slope θ₁'});
      if (path) P.line(path, 'c-text');
      tested.forEach(function (p) { P.dot(p[0], p[1], 3.2, 'f-blue'); });
      P.dot(0.5, 2.2, 5, 'f-amber').text(0.5, 2.2, 'OLS (0.5, 2.2)', 'lbl', 'start', -8);
      P.dot(best[0], best[1], 6, 'f-text').text(best[0], best[1], 'best found', 'ann', 'end', 18);
      host.querySelector('[data-v]').innerHTML = P.svg('Tested candidates on the MSE landscape');
      let t = '<dl class="kv"><dt>Candidates evaluated</dt><dd>' + (hc ? hc.evals : tested.length) + '</dd><dt>Best found (θ₀, θ₁)</dt><dd>(' + fmt(best[0], 3) + ', ' + fmt(best[1], 3) + ')</dd><dt>Its MSE</dt><dd class="big">' + fmt(bv, 4) + '</dd><dt>OLS minimum MSE</dt><dd>0.4500</dd></dl>';
      host.querySelector('[data-t]').innerHTML = t;
      let foot = '';
      if (S.method === 'random') { const B = Math.round(S.B); foot = 'If the best 5% of the box is the target, each independent draw misses it with probability 0.95, so B draws all miss with probability 0.95^B.' + MD('P(\\text{at least one hit}) = 1 - 0.95^{' + B + '} = 1 - ' + fmt(Math.pow(0.95, B), 4) + ' = ' + fmt(1 - Math.pow(0.95, B), 4)); }
      else if (S.method === 'hill') foot = 'Path: ' + hc.path.map(function (p) { return '(' + fmt(p[0], 2) + ', ' + fmt(p[1], 2) + ')'; }).join(' then ') + '. It stops when no ±γ move improves MSE. With γ = 0.5 it halts at (1, 2) with MSE 0.5, short of the OLS 0.45. Try γ = 0.05.';
      else foot = 'Only the tested points can win. The true minimum (0.5, 2.2) is not on this list, so the best tested line ' + (Math.abs(bv - 0.45) < 1e-9 ? 'happens to be optimal.' : 'is worse than OLS (MSE ' + fmt(bv, 4) + ' versus 0.4500).');
      host.querySelector('[data-f]').innerHTML = foot;
    }
    render();
  }
});

/* ===== Lecture 5: gradient descent and the learning rate ===== */
DEFLAB('gd', {
  title: 'Gradient descent and the learning rate',
  question: 'What does each update do, and what goes wrong when η is too small or too large?',
  mount: function (host) {
    const X = [1, 2, 3, 4], Y = [3, 4, 8, 9];
    const S = {mode: 'sq', eta: 0.1, c0: 2, steps: 6, eta2: 0.1, steps2: 40};
    host.innerHTML = '<div style="padding:12px 16px 0">' + segCtl('mode', [['sq', 'L(c) = c² (lecture)'], ['cafe', 'Café line MSE']], 'sq') + '</div><div data-m></div>';
    bindSeg(host, S, render);
    function render() {
      const m = host.querySelector('[data-m]');
      if (S.mode === 'sq') {
        m.innerHTML = '<div class="lab-body"><div class="lab-viz" data-v></div><div class="lab-side">' + rangeCtl('eta', 'Learning rate η', 0.01, 1.2, 0.01, S.eta) + rangeCtl('c0', 'Start c₀', -3, 3, 0.1, S.c0, 1) + rangeCtl('steps', 'Updates', 1, 15, 1, S.steps, 0) +
          '<div class="btns"><button class="btn" data-e="0.1">η = 0.1</button><button class="btn" data-e="0.5">η = 0.5</button><button class="btn" data-e="1.1">η = 1.1</button></div><div data-t></div></div></div><div class="lab-foot trace" data-f></div>';
        bindCtls(m, S, drawSq);
        m.querySelectorAll('[data-e]').forEach(function (b) { b.addEventListener('click', function () { S.eta = +b.getAttribute('data-e'); S.c0 = 2; setCtl(m, 'eta', S.eta); setCtl(m, 'c0', 2); drawSq(); }); });
        drawSq();
      } else {
        m.innerHTML = '<div class="lab-body"><div class="lab-viz" data-v></div><div class="lab-side">' + rangeCtl('eta2', 'Learning rate η', 0.005, 0.14, 0.005, S.eta2, 3) + rangeCtl('steps2', 'Updates', 1, 300, 1, S.steps2, 0) + '<div data-t></div></div></div><div class="lab-foot trace" data-f></div>';
        bindCtls(m, S, drawCafe);
        drawCafe();
      }
    }
    function drawSq() {
      const m = host.querySelector('[data-m]');
      const mult = 1 - 2 * S.eta, cs = [S.c0];
      for (let k = 0; k < Math.round(S.steps); k++) cs.push(cs[cs.length - 1] * mult);
      const lim = Math.max(3, Math.min(12, Math.max.apply(null, cs.map(Math.abs)) * 1.1));
      const P = Plot({w: 560, h: 320, x: [-lim, lim], y: [0, lim * lim]});
      P.axes({xl: 'c', yl: 'L(c) = c²'}).fn(function (c) { return c * c; }, 'c-blue');
      for (let k = 0; k + 1 < cs.length; k++) P.seg(cs[k], cs[k] * cs[k], cs[k + 1], cs[k + 1] * cs[k + 1], 'c-amber');
      cs.forEach(function (c, k) { P.dot(c, c * c, k === 0 ? 6 : 4, k === 0 ? 'f-text' : 'f-amber'); });
      m.querySelector('[data-v]').innerHTML = P.svg('Gradient descent steps on c squared');
      let t = '<table class="readout"><thead><tr><th>step</th><th>c</th><th>slope 2c</th><th>L(c)</th></tr></thead><tbody>';
      cs.forEach(function (c, k) { t += '<tr><td>' + k + '</td><td>' + sig(c, 4) + '</td><td>' + sig(2 * c, 4) + '</td><td>' + sig(c * c, 4) + '</td></tr>'; });
      m.querySelector('[data-t]').innerHTML = t + '</tbody></table>';
      const verdict = Math.abs(mult) < 1 ? (Math.abs(mult) < 0.05 ? 'lands on the minimum almost at once' : (mult < 0 ? 'converges while overshooting back and forth' : 'converges smoothly')) : (Math.abs(mult) === 1 ? 'bounces forever without improving' : 'diverges: each step overshoots further');
      m.querySelector('[data-f]').innerHTML = MD('c_{\\text{new}} = c - \\eta(2c) = (1 - 2\\eta)c = (1 - 2\\times ' + fmt(S.eta, 2) + ')c = ' + fmt(mult, 2).replace('−', '-') + 'c') + 'Each update multiplies c by ' + fmt(mult, 2) + ', so this run ' + verdict + '.';
    }
    function drawCafe() {
      const m = host.querySelector('[data-m]');
      let a = 0, b = 0;
      const path = [[a, b]];
      const first = {};
      for (let k = 0; k < Math.round(S.steps2); k++) {
        const e = X.map(function (x, q) { return Y[q] - (a + b * x); });
        const g0 = -2 / 4 * sum(e), g1 = -2 / 4 * sum(e.map(function (v, q) { return v * X[q]; }));
        if (k === 0) { first.g0 = g0; first.g1 = g1; }
        a = a - S.eta2 * g0; b = b - S.eta2 * g1;
        if (!isFinite(a) || Math.abs(a) > 1e6) break;
        path.push([a, b]);
      }
      const P = Plot({w: 560, h: 330, x: [-4, 4], y: [-1, 5]});
      heat(P, function (p, q) { return cafeMSE(p, q, X, Y); }, 56, 36, [-4, 4], [-1, 5]);
      P.axes({xl: 'intercept θ₀', yl: 'slope θ₁'}).line(path.map(function (p) { return [P.clampX(p[0]), P.clampY(p[1])]; }), 'c-amber');
      P.dot(0, 0, 5, 'f-text').dot(0.5, 2.2, 5, 'f-green').text(0.5, 2.2, 'OLS', 'lbl', 'start', -8);
      const last = path[path.length - 1];
      P.dot(P.clampX(last[0]), P.clampY(last[1]), 5, 'f-amber');
      m.querySelector('[data-v]').innerHTML = P.svg('Gradient descent path for the café line');
      const mse = cafeMSE(last[0], last[1], X, Y);
      m.querySelector('[data-t]').innerHTML = '<dl class="kv"><dt>Start</dt><dd>(0, 0), MSE 42.5</dd><dt>After ' + (path.length - 1) + ' updates</dt><dd>(' + sig(last[0], 4) + ', ' + sig(last[1], 4) + ')</dd><dt>MSE now</dt><dd class="big">' + (isFinite(mse) ? sig(mse, 4) : 'diverged') + '</dd><dt>OLS target</dt><dd>(0.5, 2.2), MSE 0.45</dd></dl><p class="faint" style="font-size:13px">For this data, η above about 0.12 makes the steps grow instead of shrink.</p>';
      m.querySelector('[data-f]').innerHTML = 'First update from (0, 0), both coefficients together:' + MD('g_0 = -\\tfrac{2}{4}\\sum e_i = ' + fmt(first.g0, 2).replace('−', '-') + ',\\quad g_1 = -\\tfrac{2}{4}\\sum x_i e_i = ' + fmt(first.g1, 2).replace('−', '-')) +
        MD('\\theta_0 = 0 - ' + fmt(S.eta2, 3) + '(' + fmt(first.g0, 2).replace('−', '-') + ') = ' + fmt(-S.eta2 * first.g0, 3).replace('−', '-') + ',\\quad \\theta_1 = 0 - ' + fmt(S.eta2, 3) + '(' + fmt(first.g1, 2).replace('−', '-') + ') = ' + fmt(-S.eta2 * first.g1, 3).replace('−', '-'));
    }
    render();
  }
});
