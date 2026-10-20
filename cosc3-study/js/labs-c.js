/* Labs for Lecture 8: language as sequences. */
'use strict';

/* ===== Markov chains on vowel and consonant types ===== */
DEFLAB('markov', {
  title: 'A two-state Markov chain',
  question: 'How do pair counts become transition probabilities, how does sampling work, and where does the running vowel share settle?',
  mount: function (host) {
    const PRE = {onegin: [1104, 7534, 7534, 3827], chorus: [10, 47, 48, 32]};
    const S = {cnt: PRE.onegin.slice(), cur: 'V', u: 0.4, seq: 'V', N: 2000, seed: 3};
    host.innerHTML = '<div style="padding:12px 16px 0" class="btns"><button class="btn" data-p="onegin">Onegin, 20,000 letters</button><button class="btn" data-p="chorus">One chorus, 137 pairs</button></div><div class="lab-body"><div class="lab-viz"><div data-mat></div><div data-run></div></div><div class="lab-side"><h4 style="margin-top:0">Sample the next type by hand</h4><div class="ctl"><label><span>Current type</span></label>' + segCtl('cur', [['V', 'Vowel V'], ['C', 'Consonant C']], 'V') + '</div>' + rangeCtl('u', 'Uniform draw u in [0, 1]', 0, 1, 0.01, S.u) + '<div data-samp></div><div class="btns"><button class="btn" data-a="go">Use this draw and continue</button><button class="btn ghost" data-a="clr">Clear sequence</button></div><div data-seq></div></div></div><div class="lab-foot trace" data-f></div>';
    bindCtls(host, S, draw); bindSeg(host, S, draw);
    host.querySelectorAll('[data-p]').forEach(function (b) { b.addEventListener('click', function () { S.cnt = PRE[b.getAttribute('data-p')].slice(); draw(); }); });
    host.querySelector('[data-a="go"]').addEventListener('click', function () { const nx = next(S.cur, S.u); S.seq += nx; S.cur = nx; host.querySelectorAll('[data-seg="cur"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x.getAttribute('data-v') === nx)); }); draw(); });
    host.querySelector('[data-a="clr"]').addEventListener('click', function () { S.seq = S.cur; draw(); });
    function probs() { const c = S.cnt; const rv = c[0] + c[1], rc = c[2] + c[3]; return {vv: c[0] / rv, cv: c[1] / rv, vc: c[2] / rc, cc: c[3] / rc, rv: rv, rc: rc}; }
    function next(cur, u) { const p = probs(); return cur === 'V' ? (u < p.vv ? 'V' : 'C') : (u < p.vc ? 'V' : 'C'); }
    function draw() {
      const p = probs(), c = S.cnt;
      const pi = p.vc / (p.vc + p.cv);
      let mt = '<table class="mat"><thead><tr><th>Current type</th><th>Next V</th><th>Next C</th><th>Row total</th></tr></thead><tbody>';
      mt += '<tr><th>V</th><td><input aria-label="count V then V" data-c="0" value="' + c[0] + '"></td><td><input aria-label="count V then C" data-c="1" value="' + c[1] + '"></td><td>' + thou(p.rv) + '</td></tr>';
      mt += '<tr><th>C</th><td><input aria-label="count C then V" data-c="2" value="' + c[2] + '"></td><td><input aria-label="count C then C" data-c="3" value="' + c[3] + '"></td><td>' + thou(p.rc) + '</td></tr></tbody></table>';
      mt += '<table class="mat"><thead><tr><th>P(next ∣ current)</th><th>V</th><th>C</th></tr></thead><tbody><tr><th>V</th><td>' + fmt(p.vv, 4) + '</td><td>' + fmt(p.cv, 4) + '</td></tr><tr><th>C</th><td>' + fmt(p.vc, 4) + '</td><td>' + fmt(p.cc, 4) + '</td></tr></tbody></table>';
      host.querySelector('[data-mat]').innerHTML = mt;
      host.querySelectorAll('[data-c]').forEach(function (inp) { inp.addEventListener('change', function () { const v = parseNum(inp.value); if (isFinite(v) && v >= 0) { S.cnt[+inp.getAttribute('data-c')] = v; draw(); } }); });
      const r = rng(S.seed * 101), ind = rng(S.seed * 307);
      let st = 'V', v1 = 0, v2 = 0; const runM = [], runI = [];
      for (let k = 1; k <= S.N; k++) { st = next(st, r()); if (st === 'V') v1++; if (ind() < pi) v2++; if (k % 10 === 0 || k < 10) { runM.push([Math.log10(k), v1 / k]); runI.push([Math.log10(k), v2 / k]); } }
      const P = Plot({w: 560, h: 200, x: [0, Math.log10(S.N)], y: [0, 1], m: {b: 30}});
      P.axes({xl: 'generated letter types (log scale)', yl: 'running vowel share', xt: [0, 1, 2, 3], fx: function (v) { return Math.pow(10, v); }}).seg(0, pi, Math.log10(S.N), pi, 'c-faint').line(runI, 'c-text').line(runM, 'c-blue');
      P.text(Math.log10(S.N), pi, 'stationary ' + fmt(pi, 4), 'lbl', 'end', -6);
      host.querySelector('[data-run]').innerHTML = '<div class="faint" style="font-size:12.5px;margin-top:10px">Blue: Markov chain. Grey: independent draws with the same vowel probability. Both settle near the same share.</div>' + P.svg('Running vowel share');
      const pv = S.cur === 'V' ? p.vv : p.vc;
      host.querySelector('[data-samp]').innerHTML = '<p class="muted" style="font-size:14px">From ' + S.cur + ', the interval [0, ' + fmt(pv, 4) + ') means V and [' + fmt(pv, 4) + ', 1] means C. Draw u = ' + fmt(S.u, 2) + ' gives <b>' + next(S.cur, S.u) + '</b>.</p>';
      host.querySelector('[data-seq]').innerHTML = '<p class="mono" style="word-break:break-all">' + S.seq + '</p>';
      host.querySelector('[data-f]').innerHTML = MD('P(V \\mid V) = \\frac{' + thou(c[0]) + '}{' + thou(c[0]) + ' + ' + thou(c[1]) + '} = ' + fmt(p.vv, 4) + ',\\quad P(V \\mid C) = \\frac{' + thou(c[2]) + '}{' + thou(c[2]) + ' + ' + thou(c[3]) + '} = ' + fmt(p.vc, 4)) +
        MD('\\pi_V = \\frac{P(V \\mid C)}{P(V \\mid C) + P(C \\mid V)} = \\frac{' + fmt(p.vc, 4) + '}{' + fmt(p.vc, 4) + ' + ' + fmt(p.cv, 4) + '} = ' + fmt(pi, 4)) + '<span class="faint">The stationary-share formula is extra; the lecture reports the resulting share (0.4212 for the chorus).</span>';
    }
    draw();
  }
});

/* ===== Unigram, bigram and trigram probabilities ===== */
DEFLAB('ngram', {
  title: 'Counting n-grams',
  question: 'How much context does each model use, and how does that change the next-word probabilities?',
  mount: function (host) {
    const BASE = 'a cup of coffee\na cup of tea\na cup of coffee\na cup of water';
    const MORE = '\na slice of pizza\na slice of cake\na slice of bread';
    const S = {order: '3', text: BASE + MORE, ctx: 'cup of', phrase: 'a cup of coffee'};
    host.innerHTML = '<div class="lab-body"><div class="lab-viz"><div class="ctl"><label for="ng-t"><span>Corpus (one sentence per line; contexts never cross lines)</span></label><textarea id="ng-t" class="num-in" rows="7" style="font-family:var(--mono)">' + S.text + '</textarea></div><div class="btns"><button class="btn" data-p="base">Lecture sentences only</button><button class="btn" data-p="more">Add the "a slice of" lines</button></div><div data-tab></div></div><div class="lab-side">' +
      segCtl('order', [['1', 'Unigram'], ['2', 'Bigram'], ['3', 'Trigram']], '3') + '<div class="ctl"><label for="ng-c"><span>Context (previous words)</span></label><input id="ng-c" class="num-in" value="' + S.ctx + '"></div><div class="ctl"><label for="ng-ph"><span>Phrase to score</span></label><input id="ng-ph" class="num-in" value="' + S.phrase + '"></div><div data-sc></div></div></div><div class="lab-foot trace" data-f></div>';
    bindSeg(host, S, draw);
    const ta = host.querySelector('#ng-t');
    ta.addEventListener('input', function () { S.text = ta.value; draw(); });
    host.querySelector('#ng-c').addEventListener('input', function (e) { S.ctx = e.target.value; draw(); });
    host.querySelector('#ng-ph').addEventListener('input', function (e) { S.phrase = e.target.value; draw(); });
    host.querySelectorAll('[data-p]').forEach(function (b) { b.addEventListener('click', function () { S.text = b.getAttribute('data-p') === 'base' ? BASE : BASE + MORE; ta.value = S.text; draw(); }); });
    function lines() { return S.text.split('\n').map(function (l) { return l.toLowerCase().trim().split(/\s+/).filter(Boolean); }).filter(function (l) { return l.length; }); }
    function nextDist(order, ctxWords) {
      const L = lines(), counts = {}; let tot = 0;
      const k = order - 1;
      L.forEach(function (ws) { ws.forEach(function (w, t) { if (k === 0) { counts[w] = (counts[w] || 0) + 1; tot++; return; } if (t < k) return; const c = ws.slice(t - k, t).join(' '); if (c === ctxWords.slice(-k).join(' ')) { counts[w] = (counts[w] || 0) + 1; tot++; } }); });
      return {counts: counts, tot: tot};
    }
    function draw() {
      const order = +S.order, ctx = S.ctx.toLowerCase().trim().split(/\s+/).filter(Boolean);
      const need = order - 1;
      let html = '';
      if (need > ctx.length) html = '<p class="flag">A ' + (order === 2 ? 'bigram' : 'trigram') + ' needs ' + need + ' previous word' + (need > 1 ? 's' : '') + '. Type more context.</p>';
      else {
        const d = nextDist(order, ctx), keys = Object.keys(d.counts).sort(function (a, b) { return d.counts[b] - d.counts[a]; });
        const label = order === 1 ? 'P(w), no context' : 'P(w ∣ ' + ctx.slice(-need).join(' ') + ')';
        html = '<table class="readout"><thead><tr><th>next word w</th><th>count</th><th>' + label + '</th></tr></thead><tbody>' + (keys.length ? keys.map(function (k) { return '<tr><td>' + esc(k) + '</td><td>' + d.counts[k] + '</td><td>' + d.counts[k] + '/' + d.tot + ' = ' + fmt(d.counts[k] / d.tot, 3) + '</td></tr>'; }).join('') : '<tr><td colspan="3">This context never appears in the corpus, so every count is zero.</td></tr>') + '</tbody></table>';
      }
      host.querySelector('[data-tab]').innerHTML = html;
      const ph = S.phrase.toLowerCase().trim().split(/\s+/).filter(Boolean);
      let prob = 1, terms = [], ok = ph.length > 0;
      ph.forEach(function (w, t) {
        const o = Math.min(order, t + 1);
        const d = nextDist(o, ph.slice(0, t));
        const c = d.counts[w] || 0;
        terms.push({w: w, ctx: o === 1 ? '' : ph.slice(t - o + 1, t).join(' '), c: c, tot: d.tot});
        prob *= d.tot ? c / d.tot : 0;
      });
      host.querySelector('[data-sc]').innerHTML = ok ? '<table class="readout"><thead><tr><th>term</th><th>probability</th></tr></thead><tbody>' + terms.map(function (q) { return '<tr><td>P(' + esc(q.w) + (q.ctx ? ' ∣ ' + esc(q.ctx) : '') + ')</td><td>' + q.c + '/' + q.tot + '</td></tr>'; }).join('') + '<tr class="em"><td>Product</td><td>' + sig(prob, 4) + '</td></tr></tbody></table>' : '';
      host.querySelector('[data-f]').innerHTML = 'Chain rule with a ' + (order === 1 ? 'unigram' : order === 2 ? 'bigram' : 'trigram') + ' approximation: the first words use whatever shorter context exists.' + MD('P(x_1, \\dots, x_T) = \\prod_{t=1}^{T} P(x_t \\mid x_1, \\dots, x_{t-1}) \\approx \\prod_{t} P(x_t \\mid ' + (order === 1 ? '\\text{nothing}' : order === 2 ? 'x_{t-1}' : 'x_{t-2}, x_{t-1}') + ')') + '<span class="faint">The four "a cup of" lines are the lecture example (p. 36). The "a slice of" lines use the lecture\'s own words from p. 35 as extra practice.</span>';
    }
    draw();
  }
});

/* ===== Byte pair encoding ===== */
function bpePairs(words) {
  const counts = {}, first = {}; let idx = 0;
  words.forEach(function (w) { for (let k = 0; k + 1 < w.length; k++) { const key = w[k] + '\u0001' + w[k + 1]; counts[key] = (counts[key] || 0) + 1; if (first[key] === undefined) first[key] = idx++; } });
  return Object.keys(counts).map(function (k) { return {a: k.split('\u0001')[0], b: k.split('\u0001')[1], n: counts[k], f: first[k]}; }).sort(function (x, y) { return y.n - x.n || x.f - y.f; });
}
function bpeApply(tokens, a, b) { const out = []; for (let k = 0; k < tokens.length; k++) { if (k + 1 < tokens.length && tokens[k] === a && tokens[k + 1] === b) { out.push(a + b); k++; } else out.push(tokens[k]); } return out; }
DEFLAB('bpe', {
  title: 'Learning and applying BPE merges',
  question: 'Which pair merges next, and how do learned merges tokenize a word the tokenizer never saw?',
  mount: function (host) {
    const S = {corpus: 'play\nplayer\nplaying\nreplay', merges: [], word: 'replaying'};
    host.innerHTML = '<div class="lab-body"><div class="lab-viz"><div class="cols"><div><div class="ctl"><label for="bp-c"><span>Training words (one per line; repeat a line to repeat a word)</span></label><textarea id="bp-c" class="num-in" rows="6">' + S.corpus + '</textarea></div><div class="btns"><button class="btn primary" data-a="one">Merge most frequent pair</button><button class="btn" data-a="three">Learn 3 merges</button></div><div data-ml></div></div><div data-pairs></div></div><div data-toks></div></div><div class="lab-side"><h4 style="margin-top:0">Apply learned merges to a new word</h4><div class="ctl"><label for="bp-w"><span>New word</span></label><input id="bp-w" class="num-in" value="' + S.word + '"></div><div data-ap></div></div></div><div class="lab-foot" data-f></div>';
    const ta = host.querySelector('#bp-c');
    ta.addEventListener('input', function () { S.corpus = ta.value; S.merges = []; draw(); });
    host.querySelector('#bp-w').addEventListener('input', function (e) { S.word = e.target.value.trim(); draw(); });
    host.querySelector('[data-a="one"]').addEventListener('click', function () { learn(1); });
    host.querySelector('[data-a="three"]').addEventListener('click', function () { S.merges = []; learn(3); });
    function words() { return S.corpus.split('\n').map(function (w) { return w.trim().toLowerCase(); }).filter(Boolean); }
    function tokensAfter(ms) { return words().map(function (w) { let t = w.split(''); ms.forEach(function (m) { t = bpeApply(t, m[0], m[1]); }); return t; }); }
    function learn(k) { for (let q = 0; q < k; q++) { const ps = bpePairs(tokensAfter(S.merges)); if (!ps.length) break; S.merges.push([ps[0].a, ps[0].b]); } draw(); }
    function chips(t) { return t.map(function (x) { return '<span style="display:inline-block;border:1px solid var(--line-2);border-radius:4px;padding:1px 7px;margin:2px;font-family:var(--mono);font-size:13px;background:var(--bg)">' + esc(x) + '</span>'; }).join(''); }
    function draw() {
      const toks = tokensAfter(S.merges), ps = bpePairs(toks);
      host.querySelector('[data-ml]').innerHTML = '<h4>Learned merge rules, in order</h4>' + (S.merges.length ? '<ol>' + S.merges.map(function (m) { return '<li class="mono">' + esc(m[0]) + ' + ' + esc(m[1]) + ' → ' + esc(m[0] + m[1]) + '</li>'; }).join('') + '</ol>' : '<p class="faint">None yet. Every word starts as single characters.</p>');
      host.querySelector('[data-pairs]').innerHTML = '<h4 style="margin-top:0">Adjacent pair counts now</h4><table class="readout"><thead><tr><th>pair</th><th>count</th></tr></thead><tbody>' + ps.slice(0, 9).map(function (p, k) { return '<tr' + (k === 0 ? ' class="sel"' : '') + '><td class="mono">' + esc(p.a) + ' + ' + esc(p.b) + '</td><td>' + p.n + '</td></tr>'; }).join('') + '</tbody></table><p class="faint" style="font-size:13px">Highlighted row merges next. Equal counts: the pair that appears first in the training words wins (lecture rule, p. 108).</p>';
      host.querySelector('[data-toks]').innerHTML = '<h4>Training words after ' + S.merges.length + ' merge' + (S.merges.length === 1 ? '' : 's') + '</h4>' + toks.map(function (t, k) { return '<div style="margin:4px 0"><span class="faint" style="display:inline-block;width:80px">' + esc(words()[k]) + '</span>' + chips(t) + '</div>'; }).join('');
      let t = S.word.toLowerCase().split('');
      let steps = '<div style="margin:6px 0"><span class="faint">start </span>' + chips(t) + '</div>';
      S.merges.forEach(function (m) { const nt = bpeApply(t, m[0], m[1]); steps += '<div style="margin:6px 0"><span class="faint mono">' + esc(m[0]) + '+' + esc(m[1]) + ' </span>' + chips(nt) + (nt.length === t.length ? ' <span class="faint">(no match)</span>' : '') + '</div>'; t = nt; });
      host.querySelector('[data-ap]').innerHTML = steps + '<p class="muted" style="font-size:14px">Applying a trained tokenizer replays the merge list in order. It never recounts pairs in the new word.</p>';
      host.querySelector('[data-f]').innerHTML = 'Lecture result: the first three merges are p + l → pl, pl + a → pla, pla + y → play, and "replaying" becomes r e play i n g.';
    }
    draw();
  }
});

/* ===== Word vectors from contexts ===== */
DEFLAB('wordvec', {
  title: 'Word vectors from the next word',
  question: 'How do counts of following words turn each occupation into a vector, and which words end up close?',
  mount: function (host) {
    const BASE = 'doctor treated a fever\ndoctor treated an injury\ndoctor examined a patient\ndoctor checked the pulse\nnurse treated a wound\nnurse checked the pulse\nnurse checked the temperature\nnurse examined a patient\nmechanic checked an engine\nmechanic examined the brakes\nmechanic repaired an engine\nmechanic repaired a transmission';
    const ORDER = ['treated', 'checked', 'examined', 'repaired'];
    const S = {text: BASE, rep: 'freq'};
    host.innerHTML = '<div class="lab-body"><div class="lab-viz"><div class="ctl"><label for="wv-t"><span>Sentences (first word is the target; the next word is its context)</span></label><textarea id="wv-t" class="num-in" rows="8">' + S.text + '</textarea></div><div data-plot></div></div><div class="lab-side">' + segCtl('rep', [['count', 'Count rows'], ['freq', 'Relative frequency rows']], 'freq') + '<div data-tab></div></div></div><div class="lab-foot trace" data-f></div>';
    bindSeg(host, S, draw);
    host.querySelector('#wv-t').addEventListener('input', function (e) { S.text = e.target.value; draw(); });
    function draw() {
      const rows = {}, cols = ORDER.slice();
      S.text.split('\n').forEach(function (l) { const w = l.trim().toLowerCase().split(/\s+/); if (w.length < 2) return; if (cols.indexOf(w[1]) < 0) cols.push(w[1]); rows[w[0]] = rows[w[0]] || {}; rows[w[0]][w[1]] = (rows[w[0]][w[1]] || 0) + 1; });
      const names = Object.keys(rows);
      const vec = {};
      names.forEach(function (n) { const c = cols.map(function (k) { return rows[n][k] || 0; }); const tot = sum(c); vec[n] = S.rep === 'freq' ? c.map(function (v) { return tot ? v / tot : 0; }) : c; });
      let t = '<table class="mat"><thead><tr><th>word</th>' + cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>' + names.map(function (n) { return '<tr><th>' + esc(n) + '</th>' + vec[n].map(function (v) { return '<td>' + (S.rep === 'freq' ? fmt(v, 2) : v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table>';
      t += '<table class="readout"><thead><tr><th>pair</th><th>distance</th><th>cosine</th></tr></thead><tbody>';
      for (let a = 0; a < names.length; a++) for (let b = a + 1; b < names.length; b++) {
        const u = vec[names[a]], v = vec[names[b]];
        const d = Math.sqrt(sum(u.map(function (x, k) { return (x - v[k]) * (x - v[k]); })));
        const cs = sum(u.map(function (x, k) { return x * v[k]; })) / (Math.sqrt(sum(u.map(function (x) { return x * x; }))) * Math.sqrt(sum(v.map(function (x) { return x * x; }))) || 1);
        t += '<tr><td>' + esc(names[a]) + ', ' + esc(names[b]) + '</td><td>' + fmt(d, 3) + '</td><td>' + fmt(cs, 3) + '</td></tr>';
      }
      host.querySelector('[data-tab]').innerHTML = t + '</tbody></table>';
      const fv = {}; names.forEach(function (n) { const c = cols.map(function (k) { return rows[n][k] || 0; }); const tot = sum(c); fv[n] = c.map(function (v) { return tot ? v / tot : 0; }); });
      const P = Plot({w: 460, h: 300, x: [0, 0.6], y: [0, 0.6]});
      P.axes({xl: 'P(treated ∣ word)', yl: 'P(repaired ∣ word)', xt: [0, 0.2, 0.4, 0.6], yt: [0, 0.2, 0.4, 0.6]});
      names.forEach(function (n) { const ti = cols.indexOf('treated'), ri = cols.indexOf('repaired'); const x = fv[n][ti] || 0, y = fv[n][ri] || 0; P.dot(x, y, 6, 'f-blue').text(x, y, n, 'ann', 'start', -9); });
      host.querySelector('[data-plot]').innerHTML = P.svg('Words placed by two context probabilities');
      const d = vec.doctor, nv = vec.nurse;
      host.querySelector('[data-f]').innerHTML = (d && nv ? MD('d(\\text{doctor}, \\text{nurse}) = \\sqrt{' + d.map(function (x, k) { return '(' + fmt(x, 2) + ' - ' + fmt(nv[k], 2) + ')^2'; }).join(' + ') + '} = ' + fmt(Math.sqrt(sum(d.map(function (x, k) { return (x - nv[k]) * (x - nv[k]); }))), 3)) : '') + '<span class="faint">The count and frequency rows are the lecture\'s (pp. 116 to 119). The distances and cosines are computed here as extra practice.</span>';
    }
    draw();
  }
});
