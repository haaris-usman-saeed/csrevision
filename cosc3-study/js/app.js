/* Main application: routing, views, questions, sessions, progress. */
'use strict';
const $ = function (s, r) { return (r || document).querySelector(s); };
const $$ = function (s, r) { return Array.from((r || document).querySelectorAll(s)); };
const App = {session: null, timer: null, open: {}};
const MODE_LABEL = {concept: 'Concept', numeric: 'Numerical calculation', formula: 'Formula selection', mistake: 'Spot the mistake', prediction: 'Prediction', worked: 'Worked exam problem'};
const MODE_HELP = {concept: 'Test whether you understand the underlying idea.', numeric: 'Type the number; full worked solution after each attempt.', formula: 'A scenario: choose the formula or method that applies.', mistake: 'An incorrect student solution: find the error.', prediction: 'What changes when one quantity changes?', worked: 'Longer multi-step problems with hints revealed one at a time.'};
const TOOLS = [['#/', 'Home'], ['#/path', 'How it fits together'], ['#/practice', 'Practice'], ['#/midterm', 'Midterm mode'], ['#/rapid', '20-minute revision'], ['#/weak', 'Weak areas'], ['#/formulas', 'Formulas'], ['#/compare', 'Easily confused pairs'], ['#/coverage', 'Coverage map'], ['#/progress', 'Progress and data']];
const ESSENTIAL = ['mae', 'mse', 'sample-var', 'corr', 'ols-slope', 'ols-intercept', 'gd-update', 'sigmoid', 'logloss', 'logit-grad', 'tf', 'idf', 'cosine', 'unit-norm', 'l2-update', 'precision', 'recall', 'f1'];
const PRIORITY = ['l2-loss', 'l4-ols', 'l5-gd', 'l6-sigmoid', 'l6-gradient', 'l9-tf', 'l9-idf', 'l9-cosine', 'l9-genre', 'l9-prf'];

function lessonsOf(n) { return APP.order.filter(function (id) { return APP.lessons[id].lec === n; }); }
function lecture(n) { return APP.lectures.filter(function (l) { return l.n === n; })[0]; }
function qsFor(id) { return APP.questions.filter(function (q) { return q.lesson === id; }); }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }
function pct(v) { return v === null || v === undefined ? 'none yet' : Math.round(v * 100) + '%'; }
function shuffle(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = b[i]; b[i] = b[j]; b[j] = t; } return b; }
function misOf(q) {
  const s = new Set();
  (q.opts || []).forEach(function (o) { if (o.mis) s.add(o.mis); });
  (q.wrong || []).forEach(function (w) { s.add(w[1]); });
  (q.parts || []).forEach(function (p) { (p.wrong || []).forEach(function (w) { s.add(w[1]); }); });
  return Array.from(s);
}
function qsForMis(m) { return APP.questions.filter(function (q) { return misOf(q).indexOf(m) >= 0 || (APP.mis[m] && q.lesson === APP.mis[m].lesson); }); }
function labsIn(html) { const out = []; String(html).replace(/data-lab="([^"]+)"/g, function (_, id) { if (out.indexOf(id) < 0) out.push(id); }); return out; }
function view(html, wide) { $('#view').innerHTML = '<div class="page' + (wide ? ' wide' : '') + '">' + html + '</div>'; }
function rail(html) { $('#rail').innerHTML = html || ''; }
function crumbs(html) { $('#crumbs').innerHTML = html; }
function sdot(state) { return '<span class="dot ' + (state === 'none' ? '' : state) + '" title="' + STATE_LABEL[state] + '"></span>'; }

/* ---------- Navigation ---------- */
function renderNav(curLesson) {
  const hash = location.hash || '#/';
  let h = '<div class="nav-tools">' + TOOLS.map(function (t) { const on = t[0] === '#/' ? (hash === '#/' || hash === '#' || hash === '') : hash.indexOf(t[0]) === 0; return '<a href="' + t[0] + '"' + (on ? ' aria-current="page"' : '') + '>' + t[1] + '</a>'; }).join('') + '</div>';
  const curLec = curLesson ? APP.lessons[curLesson].lec : null;
  APP.lectures.forEach(function (L) {
    const open = App.open[L.n] !== undefined ? App.open[L.n] : L.n === curLec;
    h += '<div class="nav-group nav-lec' + (open ? ' open' : '') + '"><button type="button" data-lec="' + L.n + '" aria-expanded="' + open + '"><span class="num">' + L.num + '</span><span>' + L.title + '</span></button><div class="nav-lessons">' +
      lessonsOf(L.n).map(function (id) { return '<a href="#/lesson/' + id + '"' + (id === curLesson ? ' aria-current="page"' : '') + '><span>' + APP.lessons[id].title + '</span>' + sdot(mastery(id)) + '</a>'; }).join('') + '</div></div>';
  });
  $('#nav').innerHTML = h;
  $$('#nav [data-lec]').forEach(function (b) { b.addEventListener('click', function () { const n = +b.getAttribute('data-lec'); const g = b.parentElement; const open = !g.classList.contains('open'); g.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open)); App.open[n] = open; }); });
}

/* ---------- Question rendering ---------- */
function renderQ(q, host, opts) {
  opts = opts || {};
  const L = APP.lessons[q.lesson];
  const meta = '<div class="qmeta"><span>' + MODE_LABEL[q.mode] + '</span><span><a href="#/lesson/' + q.lesson + '/learn">' + (L ? L.title : '') + '</a></span><span>Difficulty ' + q.diff + ' of 3</span><span>' + (q.src === 'extra' ? 'Extra practice (constructed)' : 'Built on lecture numbers') + '</span></div>';
  const uid = 'q' + Math.random().toString(36).slice(2, 8);
  if (q.type === 'mcq') {
    const order = shuffle(q.opts.map(function (o, k) { return k; }));
    host.innerHTML = '<div class="qcard">' + meta + '<div class="qtext">' + q.q + '</div><div class="opts" role="group" aria-label="Answer options">' + order.map(function (k, i) { return '<button type="button" class="opt" data-k="' + k + '"><b>' + 'ABCD'[i] + '.</b> ' + q.opts[k].t + '</button>'; }).join('') + '</div><div data-fb aria-live="polite"></div></div>';
    $$('.opt', host).forEach(function (b) {
      b.addEventListener('click', function () {
        const k = +b.getAttribute('data-k'), o = q.opts[k];
        $$('.opt', host).forEach(function (x) { x.disabled = true; const kk = +x.getAttribute('data-k'); if (q.opts[kk].ok) x.classList.add('right'); });
        b.classList.add('picked'); if (!o.ok) b.classList.add('wrong');
        const res = finish(o.ok, o.ok ? null : o.mis);
        let fb = '<div class="fb ' + (o.ok ? 'ok' : 'no') + '"><span class="verdict">' + (o.ok ? 'Correct.' : 'Not quite.') + '</span>' + (o.ok ? q.opts[k].why : 'You chose: ' + o.why) + '<ul class="why-list">' + order.map(function (kk, i) { const oo = q.opts[kk]; return '<li><b>' + 'ABCD'[i] + (oo.ok ? ', correct' : '') + ':</b> ' + oo.why + '</li>'; }).join('') + '</ul>' + misNote(res) + '</div>';
        $('[data-fb]', host).innerHTML = fb;
      });
    });
  } else if (q.type === 'numeric') {
    host.innerHTML = '<div class="qcard">' + meta + '<div class="qtext">' + q.q + '</div><div class="answer-row"><label class="sr" for="' + uid + '">Your answer</label><input class="num-in" id="' + uid + '" inputmode="decimal" autocomplete="off" placeholder="e.g. 0.0878 or 26/296"><button type="button" class="btn primary" data-check>Check</button><span class="faint" style="font-size:13px">Give at least 3 significant figures.</span></div><div data-fb aria-live="polite"></div></div>';
    const inp = $('input', host), btn = $('[data-check]', host);
    function check() {
      const u = parseNum(inp.value.replace(/[≈~=]/g, ''));
      if (!isFinite(u)) { $('[data-fb]', host).innerHTML = '<div class="fb no"><span class="verdict">Enter a number.</span>Decimals (0.0878), fractions (26/296), percentages (8.78%) and negative values (−0.05) all work.</div>'; return; }
      const ok = closeEnough(u, q.ans, q.tol);
      let wmsg = '', wmis = null;
      if (!ok) (q.wrong || []).forEach(function (w) { if (!wmsg && closeEnough(u, w[0], q.tol)) { wmsg = w[2]; wmis = w[1]; } });
      inp.disabled = true; btn.disabled = true;
      const res = finish(ok, ok ? null : (wmis || primaryMis(q)), {u: u});
      $('[data-fb]', host).innerHTML = '<div class="fb ' + (ok ? 'ok' : 'no') + '"><span class="verdict">' + (ok ? 'Correct.' : 'Not quite.') + '</span>' + (ok ? '' : 'You entered ' + sig(u, 4) + '; the answer is about ' + sig(q.ans, 4) + '. ') + (wmsg ? '<b>' + wmsg + '</b>' : '') + '<div class="sol"><b>Worked solution.</b> ' + q.sol + '</div>' + (ok ? '' : misNote(res)) + '</div>';
    }
    btn.addEventListener('click', check);
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
  } else {
    let shown = 0;
    host.innerHTML = '<div class="qcard">' + meta + '<div class="qtext">' + q.q + '</div><div class="btns"><button type="button" class="btn ghost" data-hint>Show a hint (0 of ' + q.hints.length + ')</button></div><div data-hints></div>' +
      q.parts.map(function (p, k) { return '<div class="part" data-part="' + k + '"><p><b>Part ' + (k + 1) + '.</b> ' + p.q + '</p><div class="answer-row"><label class="sr" for="' + uid + 'p' + k + '">Answer to part ' + (k + 1) + '</label><input class="num-in" id="' + uid + 'p' + k + '" inputmode="decimal" autocomplete="off"><button type="button" class="btn primary" data-pcheck="' + k + '">Check</button></div><div data-pfb aria-live="polite"></div></div>'; }).join('') + '<div data-fb aria-live="polite"></div></div>';
    const hb = $('[data-hint]', host);
    hb.addEventListener('click', function () { if (shown >= q.hints.length) return; $('[data-hints]', host).insertAdjacentHTML('beforeend', '<div class="hint">' + q.hints[shown] + '</div>'); shown++; hb.textContent = shown >= q.hints.length ? 'All hints shown' : 'Show another hint (' + shown + ' of ' + q.hints.length + ')'; if (shown >= q.hints.length) hb.disabled = true; });
    const results = new Array(q.parts.length);
    q.parts.forEach(function (p, k) {
      const box = $('[data-part="' + k + '"]', host), inp = $('input', box), btn = $('button', box);
      function check() {
        const u = parseNum(inp.value.replace(/[≈~=]/g, ''));
        if (!isFinite(u)) { $('[data-pfb]', box).innerHTML = '<div class="fb no">Enter a number.</div>'; return; }
        const ok = closeEnough(u, p.ans, p.tol);
        let wmsg = '', wmis = null;
        if (!ok) (p.wrong || []).forEach(function (w) { if (!wmsg && closeEnough(u, w[0], p.tol)) { wmsg = w[2]; wmis = w[1]; } });
        results[k] = {ok: ok, mis: wmis};
        inp.disabled = true; btn.disabled = true;
        $('[data-pfb]', box).innerHTML = '<div class="fb ' + (ok ? 'ok' : 'no') + '"><span class="verdict">' + (ok ? 'Correct.' : 'Not quite: about ' + sig(p.ans, 4) + '.') + '</span>' + (wmsg ? '<b>' + wmsg + '</b> ' : '') + p.sol + '</div>';
        if (results.filter(Boolean).length === q.parts.length) {
          const nOk = results.filter(function (r) { return r.ok; }).length;
          const firstMis = results.filter(function (r) { return !r.ok; }).map(function (r) { return r.mis; }).filter(Boolean)[0] || null;
          const res = finish(nOk === q.parts.length, nOk === q.parts.length ? null : (firstMis || primaryMis(q)), {parts: nOk + '/' + q.parts.length, hints: shown});
          $('[data-fb]', host).innerHTML = '<div class="fb ' + (res.ok ? 'ok' : 'no') + '"><span class="verdict">' + nOk + ' of ' + q.parts.length + ' parts correct' + (shown ? ', with ' + shown + ' hint' + (shown > 1 ? 's' : '') : '') + '.</span>' + (res.ok ? 'Full marks on this problem.' : 'Review the parts marked "Not quite" above.') + (res.ok ? '' : misNote(res)) + '</div>';
        }
      }
      btn.addEventListener('click', check);
      inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    });
  }
  function finish(ok, mis, extra) {
    if (!opts.noRecord) Store.record(q, ok, mis, extra);
    const res = {q: q.id, lesson: q.lesson, ok: ok, mis: mis || null};
    if (opts.onDone) opts.onDone(res);
    refreshDots();
    return res;
  }
}
function primaryMis(q) { const m = misOf(q); return m.length === 1 ? m[0] : null; }
function misNote(res) {
  if (!res.mis || !APP.mis[res.mis]) return '';
  const m = APP.mis[res.mis];
  return '<div class="sol"><b>Trap: ' + m.name + '.</b> ' + m.fix + ' <a href="#/lesson/' + m.lesson + '/learn">Review the lesson</a> or <a href="#/trap/' + res.mis + '">practice this trap</a>.</div>';
}
function refreshDots() { const cur = (location.hash.match(/#\/lesson\/([^/]+)/) || [])[1]; renderNav(cur); }
function mountAll(root) {
  $$('[data-lab]', root).forEach(function (el) { mountLab(el, el.getAttribute('data-lab')); });
  $$('[data-q]', root).forEach(function (el) { const q = APP.qById[el.getAttribute('data-q')]; if (q) renderQ(q, el); else el.innerHTML = ''; });
}

/* ---------- Home ---------- */
function homeView() {
  crumbs('Home');
  const att = Store.data.attempts.length, due = dueReviews(), weak = weakLessons().slice(0, 3);
  let h = '<h1 tabindex="-1">COSC 3 midterm study</h1><p class="lede">Every lesson, number and example here comes from the eight lecture decks. Each topic has a 60-second version, a full interactive lesson, and a revision view with questions that track what you actually know.</p>';
  if (!Store.ok) h += '<div class="flag"><span class="tag">Progress will not be saved</span>This browser is blocking local storage, so answers reset when the page closes. Try another browser or open the site through the local server described in README.</div>';
  h += '<div class="cols" style="margin-top:28px"><div><h3 style="margin-top:0">Right now</h3>';
  if (!att) h += '<p class="muted">No answers recorded yet. Start with a lesson, or take a mixed set to find your weak spots.</p>';
  else h += '<p class="muted">' + att + ' answers recorded, ' + pct(Store.data.attempts.filter(function (a) { return a.ok; }).length / att) + ' correct overall. ' + (due.length ? due.length + ' topic' + (due.length > 1 ? 's are' : ' is') + ' due for spaced review.' : 'Nothing is due for review.') + '</p>' + (weak.length ? '<p class="muted">Weakest so far: ' + weak.map(function (w) { return '<a href="#/lesson/' + w.id + '/revise">' + APP.lessons[w.id].title + '</a>'; }).join(', ') + '.</p>' : '');
  h += '<div class="btns"><a class="btn primary" href="#/rapid" style="text-decoration:none">20-minute revision</a><a class="btn" href="#/midterm" style="text-decoration:none">Midterm practice</a>' + (due.length ? '<button class="btn" type="button" data-due>Review due topics</button>' : '') + '</div></div>';
  h += '<div><h3 style="margin-top:0">How the course fits together</h3><p class="muted">Raw data becomes numerical features, a linear score, fitted coefficients, a prediction, and finally an evaluation. Every lecture adds to one link of that chain.</p><a href="#/path">Follow the full path</a></div></div>';
  h += pipeline();
  h += '<h2>Lectures</h2>';
  APP.lectures.forEach(function (L) {
    const ids = lessonsOf(L.n), states = ids.map(mastery);
    const good = states.filter(function (s) { return s === 'confident' || s === 'mastered'; }).length;
    const first = ids[0];
    h += '<div class="list-row"><div class="t"><a href="#/lesson/' + first + '">' + L.num + '. ' + L.title + '</a> <span class="faint">(Lecture ' + L.n + ')</span><small>' + ids.length + ' lessons, ' + plural(labsIn(ids.map(function (i) { return APP.lessons[i].learn; }).join('')).length, 'lab') + ', ' + ids.reduce(function (s, i) { return s + qsFor(i).length; }, 0) + ' questions. ' + good + ' of ' + ids.length + ' confident or mastered.</small></div><div class="bar" aria-hidden="true"><i style="width:' + Math.round(100 * good / ids.length) + '%"></i></div></div>';
  });
  view(h);
  const d = $('[data-due]'); if (d) d.addEventListener('click', function () { startDue(); });
  rail('<div class="sec"><h5>Key</h5>' + ['none', 'learning', 'review', 'confident', 'mastered'].map(function (s) { return '<div style="display:flex;gap:8px;align-items:center;padding:3px 0">' + sdot(s) + STATE_LABEL[s] + '</div>'; }).join('') + '<p class="faint" style="margin-top:8px">States come only from your answers. Reading a lesson never marks it mastered.</p></div>');
}
function pipeline() {
  const st = [['Raw data', 'Waits, penguins, letters, lyrics', 'l2-baseline'], ['Features x', 'Item count, mass, TF-IDF', 'l4-features'], ['Score z', 'θ₀ + Σθⱼxⱼ', 'l7-multi'], ['Fitted coefficients', 'OLS, search, gradients', 'l5-gd'], ['Prediction', 'ŷ, p = σ(z), largest score', 'l6-sigmoid'], ['Evaluation', 'MSE, R², precision, recall, F1', 'l9-prf']];
  return '<div class="pipeline">' + st.map(function (s) { return '<a href="#/lesson/' + s[2] + '"><b>' + s[0] + '</b><small>' + s[1] + '</small></a>'; }).join('') + '</div>';
}

/* ---------- Path ---------- */
function pathView() {
  crumbs('<a href="#/">Home</a> › How it fits together');
  const stages = [
    ['A baseline and a scoreboard', 2, 'Before any features, predict one constant. A loss function scores mistakes; minimizing average loss (ERM) gives the mean for MSE, the median for MAE and the mode for 0-1 loss. Every later model must beat this baseline.'],
    ['Describing variation', 3, 'Variance is the leftover loss of the best constant. Covariance and correlation measure how two variables move together; correlation is the cosine of centered vectors, an idea that returns for documents.'],
    ['Features change the prediction', 4, 'Group means and then a line ŷ = θ₀ + θ₁x let the prediction depend on x. Least squares has a closed form: slope = cov ÷ var, line through the means, residuals orthogonal to x.'],
    ['When there is no formula: search', 5, 'MAE lines and most losses have no closed form. Grid, random and hill-climbing search compare candidates; gradient descent uses derivatives to step downhill with learning rate η.'],
    ['Classification with probabilities', 6, 'The same linear score passes through σ(z) to give a probability. Log loss scores probabilities, its gradient is p − y, and gradient descent fits b and w. Test errors become a confusion matrix.'],
    ['More and better features', 7, 'Several features give a weighted sum and decision boundaries. Units, standardization, polynomial terms and hand-built image and audio summaries decide what the linear model can see.'],
    ['Language as sequences', 8, 'Text becomes counts and conditional probabilities: Markov chains on letters, n-grams on words, BPE pieces, and word vectors from the company words keep.'],
    ['Text features, regularization, evaluation', 9, 'Counts become TF, IDF and TF-IDF vectors; cosine retrieves documents; unit-length vectors feed one-vs-rest genre classifiers; λ controls overfitting; precision, recall and macro F1 judge the result.']];
  let h = '<h1 tabindex="-1">How everything fits together</h1><p class="lede">One chain runs through the whole course: raw data → numerical features → model scores → fitted coefficients → predictions → evaluation.</p>' + pipeline();
  stages.forEach(function (s, k) { const L = lecture(s[1]); h += '<h2>' + (k + 1) + '. ' + s[0] + '</h2><p class="meta">Lecture ' + L.n + ', ' + L.title + '</p><p>' + s[2] + '</p><p class="muted">' + lessonsOf(s[1]).map(function (id) { return '<a href="#/lesson/' + id + '">' + APP.lessons[id].title + '</a>'; }).join(', ') + '</p>'; });
  h += '<h2>One example, end to end</h2><p>The song "Gorgeous" (Lecture 9) uses almost every idea: word counts (a document-term row), TF (count ÷ 473 tokens), training IDF (rarity across songs), unit-length normalization, a weighted sum with fitted coefficients (log loss and gradient descent with a λ penalty), one-vs-rest scores with the largest winning, and finally validation precision, recall and F1. <a href="#/lesson/l9-genre/learn">Walk through it</a>.</p>';
  view(h); rail('');
}

/* ---------- Lesson ---------- */
function lessonView(id, layer) {
  const L = APP.lessons[id];
  if (!L) { notFound(); return; }
  layer = ['quick', 'learn', 'revise'].indexOf(layer) >= 0 ? layer : (Store.data.prefs.layer || 'quick');
  Store.data.prefs.layer = layer; Store.data.prefs.last = id; Store.visit(id);
  const lec = lecture(L.lec), st = lessonStats(id);
  crumbs('<a href="#/">Home</a> › Lecture ' + lec.n + ' › ' + L.title);
  const idx = APP.order.indexOf(id), prev = APP.order[idx - 1], next = APP.order[idx + 1];
  let h = '<p class="meta">Lecture ' + lec.n + ', ' + lec.title + '. PDF pages ' + L.pages + ' of ' + lec.file + '.</p><h1 tabindex="-1">' + L.title + '</h1>' +
    '<span class="state-pill">' + sdot(st.state) + STATE_LABEL[st.state] + '<span class="faint">' + (st.n ? ', ' + st.n + ' answer' + (st.n > 1 ? 's' : '') + ', recent ' + pct(st.acc) : '') + '</span></span>' +
    '<div class="layers" role="tablist" aria-label="Lesson layers">' + [['quick', 'Understand in 60 seconds', '60 seconds'], ['learn', 'Learn it properly', 'Learn'], ['revise', 'Midterm revision', 'Revise']].map(function (t) { return '<button type="button" role="tab" aria-selected="' + (t[0] === layer) + '" data-layer="' + t[0] + '"><span class="long">' + t[1] + '</span><span class="short">' + t[2] + '</span></button>'; }).join('') + '</div><div id="panel" role="tabpanel"></div>' +
    '<hr><div class="list-row" style="border:0">' + (prev ? '<a href="#/lesson/' + prev + '/' + layer + '">Previous: ' + APP.lessons[prev].title + '</a>' : '<span></span>') + (next ? '<a href="#/lesson/' + next + '/' + layer + '" style="text-align:right">Next: ' + APP.lessons[next].title + '</a>' : '') + '</div>';
  view(h);
  $$('[data-layer]').forEach(function (b) { b.addEventListener('click', function () { location.hash = '#/lesson/' + id + '/' + b.getAttribute('data-layer'); }); });
  const panel = $('#panel');
  if (layer === 'quick') {
    const q = L.quick;
    panel.innerHTML = '<dl class="quick"><dt>What it is</dt><dd>' + q.what + '</dd><dt>Why it exists</dt><dd>' + q.why + '</dd><dt>Main idea</dt><dd>' + q.idea + '</dd><dt>Remember</dt><dd class="remember">' + q.remember + '</dd></dl>' +
      (L.prereq.length ? '<p class="muted" style="margin-top:18px">Builds on: ' + L.prereq.map(function (p) { return '<a href="#/lesson/' + p + '">' + APP.lessons[p].title + '</a>'; }).join(', ') + '</p>' : '') +
      (L.next.length ? '<p class="muted">Leads to: ' + L.next.map(function (p) { return '<a href="#/lesson/' + p + '">' + APP.lessons[p].title + '</a>'; }).join(', ') + '</p>' : '') +
      '<div class="btns"><a class="btn primary" style="text-decoration:none" href="#/lesson/' + id + '/learn">Learn it properly</a><a class="btn" style="text-decoration:none" href="#/lesson/' + id + '/revise">Go to midterm revision</a></div>';
  } else if (layer === 'learn') {
    panel.innerHTML = L.learn;
    mountAll(panel);
  } else {
    const R = L.revise, pool = qsFor(id);
    const pick = []; const used = {};
    function take(f) { const q = pool.filter(function (x) { return !used[x.id] && f(x); })[0]; if (q) { used[q.id] = 1; pick.push([q, labelOf(q)]); } }
    function labelOf(q) { return q.type === 'worked' ? 'Exam-style problem' : q.type === 'numeric' ? 'Numerical calculation' : (q.diff >= 2 || q.mode === 'mistake' || q.mode === 'formula') ? 'Transfer question' : 'Recall check'; }
    take(function (q) { return q.type === 'mcq' && (q.mode === 'concept' || q.mode === 'prediction'); });
    take(function (q) { return q.type === 'mcq' && (q.mode === 'mistake' || q.mode === 'formula' || q.diff >= 2); });
    take(function (q) { return q.type === 'numeric' && !q.tryIt; });
    take(function (q) { return q.type === 'numeric'; });
    take(function (q) { return q.type === 'worked'; });
    panel.innerHTML = '<h2 id="essential-formulas" style="margin-top:0">Essential formulas</h2>' + (R.formulas.map(function (f) { return formulaCompact(APP.fById[f]); }).join('') || '<p class="muted">This lesson is conceptual; no formula to memorize.</p>') +
      '<h2 id="when-to-use">When to apply them</h2><p>' + R.when + '</p><h2 id="typical-questions">Typical question formats</h2><ul>' + R.formats.map(function (f) { return '<li>' + f + '</li>'; }).join('') + '</ul><h2 id="traps">Common traps</h2>' + TRAPS(R.traps) +
      '<h2 id="test-yourself">Test yourself</h2>' + pick.map(function (p, k) { return '<h4>' + p[1] + '</h4><div data-rq="' + k + '"></div>'; }).join('') +
      '<div class="btns"><button type="button" class="btn" data-all>Practice all ' + pool.length + ' questions for this lesson</button></div>';
    pick.forEach(function (p, k) { renderQ(p[0], $('[data-rq="' + k + '"]', panel)); });
    $('[data-all]', panel).addEventListener('click', function () { startSession({title: L.title, ids: shuffle(pool.map(function (q) { return q.id; }))}); });
  }
  const heads = $$('#panel h2');
  rail((heads.length ? '<div class="sec"><h5>On this page</h5>' + heads.map(function (x) { return '<a href="#" data-scroll="' + x.id + '">' + x.textContent + '</a>'; }).join('') + '</div>' : '') +
    (L.revise.formulas.length ? '<div class="sec"><h5>Formulas</h5>' + L.revise.formulas.map(function (f) { return APP.fById[f] ? '<a href="#/formulas/' + f + '">' + APP.fById[f].name + '</a>' : ''; }).join('') + '</div>' : '') +
    (labsIn(L.learn).length ? '<div class="sec"><h5>Labs in this lesson</h5>' + labsIn(L.learn).map(function (l) { return '<a href="#/lesson/' + id + '/learn">' + APP.labs[l].title + '</a>'; }).join('') + '</div>' : ''));
  $$('#rail [data-scroll]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); const t = document.getElementById(a.getAttribute('data-scroll')); if (t) t.scrollIntoView({behavior: 'smooth', block: 'start'}); }); });
}
function formulaCompact(f) {
  if (!f) return '';
  return '<div class="formula"><h4 style="margin:0">' + f.name + '</h4>' + MD(f.tex) + '<dl><dt>In words</dt><dd>' + f.plain + '</dd><dt>Use when</dt><dd>' + f.when + '</dd><dt>Common mistake</dt><dd>' + f.mistake + '</dd></dl><p class="faint" style="font-size:13px;margin:6px 0 0"><a href="#/formulas/' + f.id + '">Full entry</a>, ' + f.src + '</p></div>';
}

/* ---------- Sessions (practice and midterm) ---------- */
function startSession(cfg) {
  if (!cfg.ids.length) return false;
  stopTimer();
  App.session = {title: cfg.title, queue: cfg.ids.slice(), i: 0, results: [], used: new Set(cfg.ids), inserted: 0, start: Date.now(), end: cfg.timer ? Date.now() + cfg.timer * 60000 : null, done: false, answered: false, note: ''};
  if (location.hash === '#/session') sessionView(); else location.hash = '#/session';
  return true;
}
function stopTimer() { if (App.timer) { clearInterval(App.timer); App.timer = null; } }
function sessionView() {
  const S = App.session;
  if (!S) { location.hash = '#/practice'; return; }
  crumbs('<a href="#/">Home</a> › Session › ' + esc(S.title));
  if (S.done) { summaryView(); return; }
  if (S.end && Date.now() >= S.end) { finishSession(); return; }
  const q = APP.qById[S.queue[S.i]];
  view('<p class="meta">' + esc(S.title) + '</p><h1 tabindex="-1" style="font-size:28px">Question ' + (S.i + 1) + ' of ' + S.queue.length + '</h1><div class="list-row" style="border:0;padding:0"><span class="muted">' + S.results.filter(function (r) { return r.ok; }).length + ' correct so far</span><span class="timer" data-timer></span></div><div data-note></div><div data-host></div><div class="btns"><button type="button" class="btn primary" data-next disabled>' + (S.i + 1 < S.queue.length ? 'Next question' : 'See results') + '</button><button type="button" class="btn ghost" data-end>Finish session now</button></div>');
  S.answered = false;
  if (S.note) { $('[data-note]').innerHTML = '<div class="hint">' + S.note + '</div>'; S.note = ''; }
  renderQ(q, $('[data-host]'), {onDone: function (res) {
    S.results.push(res); S.answered = true;
    if (!res.ok && S.inserted < 3) {
      const cand = (res.mis ? qsForMis(res.mis) : []).concat(qsFor(res.lesson)).filter(function (x) { return !S.used.has(x.id); });
      if (cand.length) { const pickQ = cand[0]; S.queue.splice(S.i + 1, 0, pickQ.id); S.used.add(pickQ.id); S.inserted++; S.note = 'Follow-up added on ' + (res.mis && APP.mis[res.mis] ? '"' + APP.mis[res.mis].name + '"' : APP.lessons[res.lesson].title) + ', because the last answer missed it.'; }
    }
    const nb = $('[data-next]'); nb.disabled = false; nb.textContent = S.i + 1 < S.queue.length ? 'Next question' : 'See results'; setTimeout(function () { nb.focus({preventScroll: true}); }, 0);
  }});
  $('[data-next]').addEventListener('click', function () { S.i++; if (S.i >= S.queue.length) finishSession(); else sessionView(); window.scrollTo(0, 0); });
  $('[data-end]').addEventListener('click', finishSession);
  stopTimer();
  if (S.end) { const t = $('[data-timer]'); const tick = function () { const left = Math.max(0, S.end - Date.now()); t.textContent = Math.floor(left / 60000) + ':' + String(Math.floor(left / 1000) % 60).padStart(2, '0') + ' left'; if (left <= 0) finishSession(); }; tick(); App.timer = setInterval(tick, 1000); }
  rail('<div class="sec"><h5>This session</h5><p class="faint">Wrong answers that match a known trap add a follow-up question on the same idea (up to three per session).</p></div>');
}
function finishSession() {
  const S = App.session; if (!S || S.done) return;
  S.done = true; stopTimer();
  const ok = S.results.filter(function (r) { return r.ok; }).length;
  Store.data.sessions.push({t: Date.now(), title: S.title, n: S.results.length, ok: ok}); Store.save();
  if (location.hash === '#/session') summaryView(); else location.hash = '#/session';
}
function summaryView() {
  const S = App.session, R = S.results;
  const ok = R.filter(function (r) { return r.ok; }), bad = R.filter(function (r) { return !r.ok; });
  const byLesson = {}; R.forEach(function (r) { const b = byLesson[r.lesson] = byLesson[r.lesson] || {ok: 0, bad: 0}; if (r.ok) b.ok++; else b.bad++; });
  const misC = {}; bad.forEach(function (r) { if (r.mis) misC[r.mis] = (misC[r.mis] || 0) + 1; });
  const weakIds = Object.keys(byLesson).filter(function (k) { return byLesson[k].bad; }).sort(function (a, b) { return byLesson[b].bad - byLesson[a].bad; });
  const fset = []; weakIds.forEach(function (k) { APP.lessons[k].revise.formulas.forEach(function (f) { if (fset.indexOf(f) < 0) fset.push(f); }); });
  const elapsed = Math.round((Date.now() - S.start) / 60000);
  let h = '<p class="meta">' + esc(S.title) + '</p><h1 tabindex="-1">Session results</h1><p class="lede">' + ok.length + ' of ' + R.length + ' correct' + (S.queue.length > R.length ? ' (' + (S.queue.length - R.length) + ' not answered)' : '') + ', about ' + elapsed + ' minute' + (elapsed === 1 ? '' : 's') + '.</p>';
  h += '<div class="cols"><div><h3>Answered correctly</h3>' + (Object.keys(byLesson).filter(function (k) { return !byLesson[k].bad; }).map(function (k) { return '<div class="list-row"><a href="#/lesson/' + k + '">' + APP.lessons[k].title + '</a><span class="faint">' + byLesson[k].ok + ' right</span></div>'; }).join('') || '<p class="muted">None yet.</p>') + '</div>';
  h += '<div><h3>Missed at least once</h3>' + (weakIds.map(function (k) { return '<div class="list-row"><a href="#/lesson/' + k + '/learn">' + APP.lessons[k].title + '</a><span class="faint">' + byLesson[k].bad + ' wrong, ' + byLesson[k].ok + ' right</span></div>'; }).join('') || '<p class="muted">Nothing missed.</p>') + '</div></div>';
  if (Object.keys(misC).length) h += '<h2>Errors grouped by misconception</h2>' + Object.keys(misC).sort(function (a, b) { return misC[b] - misC[a]; }).map(function (m) { const M0 = APP.mis[m]; return '<div class="list-row"><div class="t"><b>' + M0.name + '</b> <span class="faint">(' + misC[m] + ')</span><small>' + M0.fix + '</small></div><a href="#/lesson/' + M0.lesson + '/learn">Review</a></div>'; }).join('');
  else if (bad.length) h += '<h2>Errors grouped by misconception</h2><p class="muted">The missed answers did not match a catalogued trap; review the lessons listed above.</p>';
  if (fset.length) h += '<h2>Formulas to review</h2>' + fset.map(function (f) { return formulaCompact(APP.fById[f]); }).join('');
  const next = []; weakIds.forEach(function (k) { if (next.indexOf(k) < 0) next.push(k); APP.lessons[k].prereq.forEach(function (p) { const s = mastery(p); if ((s === 'review' || s === 'none' || s === 'learning') && next.indexOf(p) < 0) next.push(p); }); });
  h += '<h2>Suggested next</h2>' + (next.length ? '<ul>' + next.slice(0, 6).map(function (k) { return '<li><a href="#/lesson/' + k + '/learn">' + APP.lessons[k].title + '</a>' + (weakIds.indexOf(k) < 0 ? ' <span class="faint">(prerequisite)</span>' : '') + '</li>'; }).join('') + '</ul>' : '<p class="muted">No gaps found in this set. Try a harder or mixed session.</p>');
  h += '<div class="btns">' + (weakIds.length ? '<button type="button" class="btn primary" data-again>Practice the missed topics again</button>' : '') + '<a class="btn" style="text-decoration:none" href="#/midterm">New session</a><a class="btn ghost" style="text-decoration:none" href="#/weak">Weak areas</a></div>';
  view(h); rail('');
  const ag = $('[data-again]'); if (ag) ag.addEventListener('click', function () { const ids = []; weakIds.forEach(function (k) { qsFor(k).forEach(function (q) { if (!S.used.has(q.id)) ids.push(q.id); }); }); const fallback = []; weakIds.forEach(function (k) { qsFor(k).forEach(function (q) { fallback.push(q.id); }); }); startSession({title: 'Missed topics', ids: shuffle(ids.length ? ids : fallback).slice(0, 10)}); });
}
function pool(f) {
  return APP.questions.filter(function (q) {
    const L = APP.lessons[q.lesson];
    if (f.lec && L.lec !== +f.lec) return false;
    if (f.lesson && q.lesson !== f.lesson) return false;
    if (f.mode && q.mode !== f.mode) return false;
    if (f.diff && q.diff !== +f.diff) return false;
    return true;
  });
}
function mixed(qs, n) {
  const by = {}; shuffle(qs).forEach(function (q) { const k = APP.lessons[q.lesson].lec; (by[k] = by[k] || []).push(q); });
  const keys = shuffle(Object.keys(by)), out = [];
  while (out.length < n && keys.some(function (k) { return by[k].length; })) keys.forEach(function (k) { if (out.length < n && by[k].length) out.push(by[k].shift()); });
  return out.map(function (q) { return q.id; });
}
function weakLessons() {
  return APP.order.map(function (id) { const s = lessonStats(id); return {id: id, n: s.n, acc: s.acc, state: s.state}; }).filter(function (x) { return x.n > 0; })
    .sort(function (a, b) { const ra = a.state === 'review' ? 0 : 1, rb = b.state === 'review' ? 0 : 1; return ra - rb || a.acc - b.acc || b.n - a.n; })
    .filter(function (x) { return x.acc < 0.85 || x.state === 'review'; });
}
function startDue() { const ids = []; dueReviews().forEach(function (k) { shuffle(qsFor(k)).slice(0, 2).forEach(function (q) { ids.push(q.id); }); }); startSession({title: 'Spaced review', ids: shuffle(ids)}); }

function filterControls(prefix, withMode) {
  return '<div class="filters"><label>Lecture<select data-f="lec"><option value="">All eight</option>' + APP.lectures.map(function (L) { return '<option value="' + L.n + '">' + L.num + '. ' + L.title + '</option>'; }).join('') + '</select></label>' +
    '<label>Concept<select data-f="lesson"><option value="">All concepts</option></select></label>' +
    (withMode ? '<label>Question type<select data-f="mode"><option value="">All types</option>' + Object.keys(MODE_LABEL).map(function (m) { return '<option value="' + m + '">' + MODE_LABEL[m] + '</option>'; }).join('') + '</select></label>' : '') +
    '<label>Difficulty<select data-f="diff"><option value="">Any</option><option value="1">1 (recall)</option><option value="2">2 (apply)</option><option value="3">3 (transfer)</option></select></label>' +
    '<label>Questions<select data-f="n"><option>5</option><option selected>10</option><option>20</option><option value="999">All matching</option></select></label></div>';
}
function wireFilters(root, onChange) {
  const F = {};
  function fillLessons() { const sel = $('[data-f="lesson"]', root); const lec = $('[data-f="lec"]', root).value; sel.innerHTML = '<option value="">All concepts</option>' + APP.order.filter(function (id) { return !lec || APP.lessons[id].lec === +lec; }).map(function (id) { return '<option value="' + id + '">' + APP.lessons[id].title + '</option>'; }).join(''); }
  fillLessons();
  $$('[data-f]', root).forEach(function (s) { s.addEventListener('change', function () { if (s.getAttribute('data-f') === 'lec') fillLessons(); read(); onChange(F); }); });
  function read() { $$('[data-f]', root).forEach(function (s) { F[s.getAttribute('data-f')] = s.value; }); }
  read();
  return F;
}

/* ---------- Practice ---------- */
function practiceView() {
  crumbs('<a href="#/">Home</a> › Practice');
  let h = '<h1 tabindex="-1">Practice</h1><p class="lede">Six kinds of question. Filter by lecture, concept and difficulty, then start a set. Every attempt counts toward the concept\'s mastery state.</p>' + filterControls('p', false) + '<div data-modes></div><div class="btns"><button type="button" class="btn primary" data-mixed>Start a mixed set with these filters</button></div>';
  view(h, true);
  const F = wireFilters($('#view'), draw);
  function draw() {
    $('[data-modes]').innerHTML = '<div class="cols">' + Object.keys(MODE_LABEL).map(function (m) { const n = pool(Object.assign({}, F, {mode: m})).length; return '<div class="list-row"><div class="t"><b>' + MODE_LABEL[m] + '</b> <span class="faint">' + n + ' available</span><small>' + MODE_HELP[m] + '</small></div><button type="button" class="btn" data-mode="' + m + '"' + (n ? '' : ' disabled') + '>Start</button></div>'; }).join('') + '</div>';
    $$('[data-mode]').forEach(function (b) { b.addEventListener('click', function () { const m = b.getAttribute('data-mode'); startSession({title: MODE_LABEL[m] + ' practice', ids: shuffle(pool(Object.assign({}, F, {mode: m})).map(function (q) { return q.id; })).slice(0, +F.n)}); }); });
  }
  draw();
  $('[data-mixed]').addEventListener('click', function () { const qs = pool(F); if (!qs.length) { alertBox('No questions match these filters.'); return; } startSession({title: 'Mixed practice', ids: mixed(qs, +F.n)}); });
  rail('<div class="sec"><h5>Question bank</h5><p class="faint">' + APP.questions.length + ' questions across ' + APP.order.length + ' concepts. ' + APP.questions.filter(function (q) { return q.src === 'extra'; }).length + ' use constructed numbers and are labeled "Extra practice".</p></div>');
}
function alertBox(msg) { const v = $('#view .page'); const d = document.createElement('div'); d.className = 'flag'; d.innerHTML = msg; v.insertBefore(d, v.children[2] || null); setTimeout(function () { d.remove(); }, 5000); }

/* ---------- Midterm mode ---------- */
function midtermView() {
  crumbs('<a href="#/">Home</a> › Midterm mode');
  let h = '<h1 tabindex="-1">Midterm mode</h1><p class="lede">Build an exam-style session. Worked problems reveal hints one at a time; the results page groups your errors by misconception and links each back to its lesson.</p>' +
    '<div class="filters"><label>Build from<select data-src><option value="mixed">Mixed review, all eight lectures</option><option value="filter">The filters below</option><option value="weak">My weakest topics</option><option value="due">Topics due for spaced review</option></select></label><label>Timer<select data-timer><option value="0">Untimed</option><option value="10">10 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option></select></label></div>' +
    filterControls('m', true) + '<p class="muted" data-desc></p><div class="btns"><button type="button" class="btn primary" data-go>Start session</button></div>';
  if (App.session && !App.session.done) h += '<p class="muted">A session is in progress. <a href="#/session">Return to it</a>.</p>';
  view(h, true);
  const F = wireFilters($('#view'), desc);
  $('[data-src]').addEventListener('change', desc);
  function build() {
    const src = $('[data-src]').value, n = +F.n;
    if (src === 'mixed') return {title: 'Mixed midterm review', ids: mixed(APP.questions.filter(function (q) { return !F.diff || q.diff === +F.diff; }), n)};
    if (src === 'filter') return {title: 'Midterm practice', ids: shuffle(pool(F).map(function (q) { return q.id; })).slice(0, n)};
    if (src === 'weak') { const w = weakLessons().slice(0, 5).map(function (x) { return x.id; }); return {title: 'Weakest topics', ids: mixed(APP.questions.filter(function (q) { return w.indexOf(q.lesson) >= 0; }), n), empty: 'No weak topics yet: answer some questions first (mixed review is a good start).'}; }
    const d = dueReviews(); return {title: 'Spaced review', ids: mixed(APP.questions.filter(function (q) { return d.indexOf(q.lesson) >= 0; }), n), empty: 'Nothing is due for review right now.'};
  }
  function desc() { const b = build(); $('[data-desc]').textContent = b.ids.length ? b.ids.length + ' questions will be drawn.' : (b.empty || 'No questions match these filters.'); }
  desc();
  $('[data-go]').addEventListener('click', function () { const b = build(); if (!b.ids.length) { alertBox(b.empty || 'No questions match these filters.'); return; } b.timer = +$('[data-timer]').value; startSession(b); });
  rail('');
}

/* ---------- 20-minute revision ---------- */
function rapidView() {
  crumbs('<a href="#/">Home</a> › 20-minute revision');
  const w = weakLessons().slice(0, 5);
  let h = '<h1 tabindex="-1">20 minutes before the exam</h1><p class="lede">Three steps: glance at your weak topics, reread the essential formulas, then do a timed set of representative questions.</p><h2>1. Your weak topics</h2>';
  if (w.length) h += w.map(function (x) { return '<div class="list-row"><div class="t"><a href="#/lesson/' + x.id + '/quick">' + APP.lessons[x.id].title + '</a><small>' + STATE_LABEL[x.state] + ', recent accuracy ' + pct(x.acc) + '. ' + APP.lessons[x.id].quick.remember + '</small></div><a href="#/lesson/' + x.id + '/revise">Revise</a></div>'; }).join('');
  else h += '<p class="muted">No answers recorded yet, so here are the most calculation-heavy topics instead.</p>' + PRIORITY.map(function (id) { return '<div class="list-row"><div class="t"><a href="#/lesson/' + id + '/quick">' + APP.lessons[id].title + '</a><small>' + APP.lessons[id].quick.remember + '</small></div></div>'; }).join('');
  h += '<h2>2. Essential formulas</h2>' + ESSENTIAL.map(function (f) { const F0 = APP.fById[f]; return '<div class="formula" style="padding:12px 0"><b>' + F0.name + '</b>' + MD(F0.tex) + '<span class="muted" style="font-size:14.5px">' + F0.plain + ' Trap: ' + F0.mistake + '</span></div>'; }).join('');
  h += '<h2>3. Representative questions</h2><p class="muted">12 questions: one calculation from every lecture plus your weakest topics, with a 20-minute timer.</p><div class="btns"><button type="button" class="btn primary" data-go>Start the timed set</button></div>';
  view(h);
  $('[data-go]').addEventListener('click', function () {
    const ids = [];
    APP.lectures.forEach(function (L) { const c = shuffle(APP.questions.filter(function (q) { return APP.lessons[q.lesson].lec === L.n && (q.type === 'numeric' || q.type === 'worked'); })); if (c[0]) ids.push(c[0].id); });
    const wl = w.map(function (x) { return x.id; });
    shuffle(APP.questions.filter(function (q) { return (wl.length ? wl : PRIORITY).indexOf(q.lesson) >= 0 && ids.indexOf(q.id) < 0; })).slice(0, 12 - ids.length).forEach(function (q) { ids.push(q.id); });
    startSession({title: '20-minute revision', ids: shuffle(ids), timer: 20});
  });
  rail('');
}

/* ---------- Weak areas ---------- */
function weakView() {
  crumbs('<a href="#/">Home</a> › Weak areas');
  const att = Store.data.attempts;
  let h = '<h1 tabindex="-1">Weak areas</h1>';
  if (!att.length) { view(h + '<div class="empty">No answers yet, so there is nothing to diagnose. Take a <a href="#/midterm">mixed midterm set</a> and this page will show your lowest-scoring concepts, the traps you fall into, and what to review.</div>'); rail(''); return; }
  const w = weakLessons(), mc = misCounts(), due = dueReviews();
  h += '<p class="lede">Based on your ' + att.length + ' recorded answers. Recent accuracy uses each concept\'s last 8 answers.</p>';
  const tips = [];
  const fails = function (ids) { return att.filter(function (a) { return !a.ok && ids.indexOf(a.c) >= 0; }).length; };
  if (fails(['l5-gd', 'l6-gradient', 'l7-general', 'l2-mean']) >= 2) tips.push('Several gradient or derivative answers were wrong. Reread the derivative and update rule in <a href="#/lesson/l5-gd/learn">Gradient descent</a> and the chain-rule ledger in <a href="#/lesson/l2-mean/learn">Why squared error picks the mean</a>, then redo one update by hand in the <a href="#/lesson/l6-gradient/learn">one-update lab</a>.');
  if ((mc['precision-recall'] || 0) >= 2) tips.push('You have mixed up precision and recall ' + mc['precision-recall'] + ' times. In the <a href="#/lesson/l9-prf/learn">confusion matrix explorer</a>, precision divides by the predicted column (amber cells plus TP) and recall by the actual row (blue cells plus TP). <a href="#/trap/precision-recall">Practice the distinction</a>.');
  Object.keys(mc).filter(function (m) { return mc[m] >= 2 && m !== 'precision-recall'; }).forEach(function (m) { tips.push('"' + APP.mis[m].name + '" has caught you ' + mc[m] + ' times. ' + APP.mis[m].fix + ' <a href="#/lesson/' + APP.mis[m].lesson + '/learn">Review</a>.'); });
  if (tips.length) h += '<h2>What to do next</h2>' + tips.map(function (t) { return '<div class="hint">' + t + '</div>'; }).join('');
  h += '<h2>Lowest-performing concepts</h2>' + (w.length ? '<div class="scroll-x"><table class="tbl"><thead><tr><th>Concept</th><th>State</th><th class="r">Answers</th><th class="r">Recent accuracy</th><th></th></tr></thead><tbody>' + w.slice(0, 12).map(function (x) { return '<tr><td><a href="#/lesson/' + x.id + '/learn">' + APP.lessons[x.id].title + '</a></td><td>' + sdot(x.state) + ' ' + STATE_LABEL[x.state] + '</td><td class="r">' + x.n + '</td><td class="r">' + pct(x.acc) + '</td><td><button type="button" class="btn" data-pl="' + x.id + '">Practice</button></td></tr>'; }).join('') + '</tbody></table></div>' : '<p class="muted">Every concept you have answered is at 85% or better recently.</p>');
  const ms = Object.keys(mc).sort(function (a, b) { return mc[b] - mc[a]; });
  h += '<h2>Traps you have fallen into</h2>' + (ms.length ? ms.map(function (m) { return '<div class="list-row"><div class="t"><b>' + APP.mis[m].name + '</b> <span class="faint">(' + mc[m] + ')</span><small>' + APP.mis[m].fix + '</small></div><a class="btn" style="text-decoration:none" href="#/trap/' + m + '">Practice this trap</a></div>'; }).join('') : '<p class="muted">None of your wrong answers matched a catalogued trap yet.</p>');
  h += '<h2>Due for spaced review</h2>' + (due.length ? '<p class="muted">' + due.map(function (k) { return '<a href="#/lesson/' + k + '/revise">' + APP.lessons[k].title + '</a>'; }).join(', ') + '</p><div class="btns"><button type="button" class="btn primary" data-due>Start a review session</button></div>' : '<p class="muted">Nothing due. Correct answers push a topic\'s next review out (10 minutes, 1, 3, 7, then 14 days); a wrong answer brings it back in 10 minutes.</p>');
  view(h, true); rail('');
  $$('[data-pl]').forEach(function (b) { b.addEventListener('click', function () { const id = b.getAttribute('data-pl'); startSession({title: APP.lessons[id].title, ids: shuffle(qsFor(id).map(function (q) { return q.id; }))}); }); });
  const d = $('[data-due]'); if (d) d.addEventListener('click', startDue);
}
function trapView(m) {
  if (!APP.mis[m]) { notFound(); return; }
  const ids = shuffle(qsForMis(m).map(function (q) { return q.id; })).slice(0, 8);
  if (!startSession({title: 'Trap: ' + APP.mis[m].name, ids: ids})) { crumbs('Trap'); view('<h1 tabindex="-1">' + APP.mis[m].name + '</h1><p>' + APP.mis[m].fix + '</p><p><a href="#/lesson/' + APP.mis[m].lesson + '/learn">Review the lesson</a>.</p>'); rail(''); renderNav(); }
}

/* ---------- Formulas and comparisons ---------- */
function formulasView(focus) {
  crumbs('<a href="#/">Home</a> › Formulas');
  let h = '<h1 tabindex="-1">Formula library</h1><p class="lede">' + APP.formulas.length + ' formulas, each with its meaning, variables, when to use it, a small example, the usual mistake and its source page. See also <a href="#/compare">easily confused pairs</a>.</p><label class="search-box" style="display:block;max-width:420px"><span class="sr">Filter formulas</span><input type="search" data-ff placeholder="Filter, e.g. idf, recall, slope"></label><div data-fl></div>';
  view(h);
  function draw(qs) {
    const t = (qs || '').toLowerCase();
    const groups = {};
    APP.formulas.forEach(function (f) { if (t && (f.name + ' ' + f.plain + ' ' + f.group + ' ' + f.id + ' ' + f.when).toLowerCase().indexOf(t) < 0) return; (groups[f.group] = groups[f.group] || []).push(f); });
    $('[data-fl]').innerHTML = Object.keys(groups).map(function (g) { return '<h2>' + g + '</h2>' + groups[g].map(function (f) { return '<div class="formula" id="f-' + f.id + '"><h3>' + f.name + '</h3>' + MD(f.tex) + '<dl><dt>In words</dt><dd>' + f.plain + '</dd><dt>Variables</dt><dd>' + f.vars.map(function (v) { return '<span class="mono">' + v[0] + '</span>: ' + v[1]; }).join('; ') + '</dd><dt>Use when</dt><dd>' + f.when + '</dd><dt>Example</dt><dd>' + f.ex + '</dd><dt>Common mistake</dt><dd>' + f.mistake + '</dd><dt>Source</dt><dd>' + f.src + '</dd></dl></div>'; }).join(''); }).join('') || '<p class="muted">No formula matches.</p>';
  }
  draw('');
  $('[data-ff]').addEventListener('input', function (e) { draw(e.target.value); });
  rail('<div class="sec"><h5>Groups</h5>' + Array.from(new Set(APP.formulas.map(function (f) { return f.group; }))).map(function (g) { return '<a href="#" data-g="' + esc(g) + '">' + g + '</a>'; }).join('') + '</div>');
  $$('#rail [data-g]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); const t = $$('#view h2').filter(function (x) { return x.textContent === a.getAttribute('data-g'); })[0]; if (t) t.scrollIntoView({behavior: 'smooth'}); }); });
  if (focus) setTimeout(function () { const el = document.getElementById('f-' + focus); if (el) { el.scrollIntoView({block: 'start'}); el.style.boxShadow = 'inset 3px 0 0 var(--blue)'; el.style.paddingLeft = '14px'; } }, 30);
}
function compareView() {
  crumbs('<a href="#/">Home</a> › Easily confused pairs');
  let h = '<h1 tabindex="-1">Easily confused pairs</h1><p class="lede">Side by side, with the same lecture example in each column.</p>';
  APP.comparisons.forEach(function (c) { h += '<h2 id="' + c.id + '">' + c.title + '</h2><div class="scroll-x"><table class="cmp"><thead><tr><th></th>' + c.cols.map(function (x) { return '<th>' + x + '</th>'; }).join('') + '</tr></thead><tbody>' + c.rows.map(function (r) { return '<tr>' + r.map(function (x) { return '<td>' + x + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>'; });
  view(h, true);
  rail('<div class="sec"><h5>Comparisons</h5>' + APP.comparisons.map(function (c) { return '<a href="#" data-scroll="' + c.id + '">' + c.title + '</a>'; }).join('') + '</div>');
  $$('#rail [data-scroll]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); document.getElementById(a.getAttribute('data-scroll')).scrollIntoView({behavior: 'smooth'}); }); });
}

/* ---------- Coverage ---------- */
function coverageView() {
  crumbs('<a href="#/">Home</a> › Coverage map');
  const allLabs = labsIn(APP.order.map(function (id) { return APP.lessons[id].learn; }).join(''));
  let h = '<h1 tabindex="-1">Curriculum coverage</h1><p class="muted">Sidebar sections 01 to 08 are the course\'s Lectures 2 to 9. Everywhere else, Lecture N means the number on the PDF.</p><p class="lede">' + APP.order.length + ' lessons, ' + allLabs.length + ' labs, ' + APP.questions.length + ' questions and ' + APP.formulas.length + ' formulas built from 529 PDF pages. Page numbers are PDF pages, which differ from the slide numbers printed on some decks.</p>';
  APP.lectures.forEach(function (L) {
    h += '<h2>' + L.num + '. ' + L.title + '</h2><p class="meta">Lecture ' + L.n + ', ' + L.file + ', ' + L.pages + ' pages</p><div class="scroll-x"><table class="tbl"><thead><tr><th>Lesson</th><th>PDF pages</th><th>Labs</th><th class="r">Questions</th><th>Types</th></tr></thead><tbody>' +
      lessonsOf(L.n).map(function (id) { const Ls = APP.lessons[id], qs = qsFor(id); const types = Array.from(new Set(qs.map(function (q) { return MODE_LABEL[q.mode]; }))); return '<tr><td><a href="#/lesson/' + id + '">' + Ls.title + '</a></td><td>' + Ls.pages + '</td><td>' + (labsIn(Ls.learn).map(function (l) { return APP.labs[l].title; }).join('; ') || '<span class="faint">none</span>') + '</td><td class="r">' + qs.length + '</td><td>' + types.join(', ') + '</td></tr>'; }).join('') + '</tbody></table></div>';
  });
  h += '<h2>Pages not taught as lessons</h2><p>Title slides, logistics (assignment and quiz dates), and recap slides that repeat earlier lectures: L3 pp. 1 to 18, L5 pp. 1 to 11, L6 pp. 1 to 14, L7 pp. 1 to 8, L8 pp. 1 to 25 and L9 pp. 1 to 22 are mostly recaps of material taught in the earlier lessons. The recap true-or-false items are used as practice questions where they test something examinable.</p>';
  h += '<h2>Slide issues handled explicitly</h2><ul>' + [
    ['l3-sd', 'L3 p. 29 reports s² = 2.67 ms² and s ≈ 1.63 ms, which do not follow from Server B (0, 4, 8). Both correct versions are shown.'],
    ['l4-line', 'Residual sign: e = y − ŷ in Lecture 4, r = ŷ − y in Lecture 7.'],
    ['l7-scaling', 'Lecture 7 standardizes with 1/n; Lecture 3\'s sample SD uses 1/(n − 1).'],
    ['l6-sign', 'Labels switch from {−1, +1} (spam) to {0, 1} (penguins) within Lecture 6.'],
    ['l9-idf', 'The slides write "log" for IDF; the numbers match the natural log.'],
    ['l9-reg', 'The Lecture 9 penalty includes the intercept b_k; the regularization curves exist only as charts, so values read from them are marked approximate and the interactive lab uses constructed data.'],
    ['l8-bpe', 'BPE ties are broken by first appearance in the training words (lecture tool, p. 108).'],
    ['l8-chorus', 'Song material is limited to the lecture\'s counts and title words; no lyrics are reproduced.']].map(function (x) { return '<li><a href="#/lesson/' + x[0] + '/learn">' + APP.lessons[x[0]].title + '</a>: ' + x[1] + '</li>'; }).join('') + '</ul>';
  view(h, true); rail('');
}

/* ---------- Progress ---------- */
function progressView() {
  crumbs('<a href="#/">Home</a> › Progress and data');
  const att = Store.data.attempts;
  let h = '<h1 tabindex="-1">Progress and data</h1>';
  if (!Store.ok) h += '<div class="flag"><span class="tag">Storage unavailable</span>This browser is not allowing local storage, so progress lasts only until the tab closes.</div>';
  h += '<p class="lede">' + att.length + ' answers recorded' + (att.length ? ', ' + pct(att.filter(function (a) { return a.ok; }).length / att.length) + ' correct' : '') + '. Everything is stored only in this browser.</p>';
  h += '<div class="scroll-x"><table class="tbl"><thead><tr><th>Lecture</th>' + ['none', 'learning', 'review', 'confident', 'mastered'].map(function (s) { return '<th class="r">' + STATE_LABEL[s] + '</th>'; }).join('') + '</tr></thead><tbody>' + APP.lectures.map(function (L) { const st = lessonsOf(L.n).map(mastery); return '<tr><td>' + L.num + '. ' + L.title + '</td>' + ['none', 'learning', 'review', 'confident', 'mastered'].map(function (s) { return '<td class="r">' + st.filter(function (x) { return x === s; }).length + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
  h += '<h2>How mastery is decided</h2><p class="muted">Learning: visited or fewer than 3 answers. Needs review: the last answer was wrong with recent accuracy under 60%, or a spaced review is due. Confident: at least 3 answers and 70% recent accuracy. Mastered: at least 5 answers, 85% recent accuracy, the last 3 correct, and at least one correct numerical, worked or harder question. Reading never counts.</p>';
  h += '<h2>Recent sessions</h2>' + (Store.data.sessions.length ? Store.data.sessions.slice(-8).reverse().map(function (s) { return '<div class="list-row"><span>' + esc(s.title) + '</span><span class="faint">' + s.ok + ' of ' + s.n + ', ' + new Date(s.t).toLocaleString() + '</span></div>'; }).join('') : '<p class="muted">No sessions yet.</p>');
  h += '<h2>Export, import, reset</h2><div class="btns"><button type="button" class="btn" data-exp>Export progress (JSON)</button><label class="btn" style="cursor:pointer">Import progress<input type="file" accept=".json,application/json" data-imp class="sr"></label><button type="button" class="btn ghost" data-reset>Reset all progress</button></div><div data-msg></div>';
  view(h); rail('');
  $('[data-exp]').addEventListener('click', function () { const blob = new Blob([JSON.stringify(Store.data, null, 2)], {type: 'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'cosc3-progress-' + new Date().toISOString().slice(0, 10) + '.json'; document.body.appendChild(a); a.click(); a.remove(); });
  $('[data-imp]').addEventListener('change', function (e) { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = function () { try { const d = JSON.parse(r.result); if (d.v !== 1 || !Array.isArray(d.attempts)) throw new Error('format'); Store.data = Object.assign(Store.fresh(), d); Store.save(); progressView(); renderNav(); } catch (err) { $('[data-msg]').innerHTML = '<div class="flag">That file is not a progress export from this site.</div>'; } }; r.readAsText(f); });
  $('[data-reset]').addEventListener('click', function () { if (confirm('Delete every recorded answer, review schedule and session? This cannot be undone.')) { Store.reset(); App.session = null; progressView(); renderNav(); } });
}

/* ---------- Search ---------- */
function searchView(q) {
  crumbs('<a href="#/">Home</a> › Search');
  const t = (q || '').toLowerCase().trim(), words = t.split(/\s+/).filter(Boolean);
  function score(text) { text = text.toLowerCase(); return words.reduce(function (s, w) { return s + (text.indexOf(w) >= 0 ? 1 : 0); }, 0); }
  const ls = APP.order.map(function (id) { const L = APP.lessons[id]; return {id: id, s: score(L.title) * 3 + score(L.keys) * 2 + score(L.quick.what + ' ' + L.quick.idea)}; }).filter(function (x) { return x.s >= words.length; }).sort(function (a, b) { return b.s - a.s; });
  const fs = APP.formulas.map(function (f) { return {f: f, s: score(f.name) * 3 + score(f.plain + ' ' + f.id + ' ' + f.group)}; }).filter(function (x) { return x.s >= words.length; }).sort(function (a, b) { return b.s - a.s; });
  const labs = Object.keys(APP.labs).filter(function (k) { return score(APP.labs[k].title + ' ' + APP.labs[k].question) >= words.length; });
  let h = '<h1 tabindex="-1">Search' + (q ? ': ' + esc(q) : '') + '</h1>';
  if (!words.length) h += '<p class="muted">Type in the search box to find concepts, formulas and labs.</p>';
  else {
    h += '<h2>Concepts</h2>' + (ls.length ? ls.slice(0, 12).map(function (x) { const L = APP.lessons[x.id]; return '<div class="list-row"><div class="t"><a href="#/lesson/' + x.id + '">' + L.title + '</a><small>Lecture ' + L.lec + '. ' + L.quick.what + '</small></div></div>'; }).join('') : '<p class="muted">No concept matches.</p>');
    h += '<h2>Formulas</h2>' + (fs.length ? fs.slice(0, 10).map(function (x) { return '<div class="list-row"><div class="t"><a href="#/formulas/' + x.f.id + '">' + x.f.name + '</a><small>' + x.f.plain + '</small></div></div>'; }).join('') : '<p class="muted">No formula matches.</p>');
    if (labs.length) h += '<h2>Labs</h2>' + labs.map(function (k) { const host = APP.order.filter(function (id) { return labsIn(APP.lessons[id].learn).indexOf(k) >= 0; })[0]; return '<div class="list-row"><div class="t"><a href="#/lesson/' + host + '/learn">' + APP.labs[k].title + '</a><small>' + APP.labs[k].question + '</small></div></div>'; }).join('');
  }
  view(h); rail('');
}
function notFound() { crumbs('Not found'); view('<h1 tabindex="-1">Page not found</h1><p>That address does not match a lesson or tool. <a href="#/">Go home</a>.</p>'); rail(''); }

/* ---------- Router ---------- */
function router() {
  const parts = (location.hash || '#/').replace(/^#\/?/, '').split('/');
  const r = parts[0];
  if (r !== 'session') stopTimer();
  let cur = null;
  if (r === '' || r === 'home') homeView();
  else if (r === 'lesson') { cur = parts[1]; lessonView(parts[1], parts[2]); }
  else if (r === 'practice') practiceView();
  else if (r === 'midterm') midtermView();
  else if (r === 'session') sessionView();
  else if (r === 'rapid') rapidView();
  else if (r === 'weak') weakView();
  else if (r === 'trap') { trapView(parts[1]); return; }
  else if (r === 'formulas') formulasView(parts[1]);
  else if (r === 'compare') compareView();
  else if (r === 'coverage') coverageView();
  else if (r === 'path') pathView();
  else if (r === 'progress') progressView();
  else if (r === 'search') searchView(decodeURIComponent(parts.slice(1).join('/')));
  else notFound();
  renderNav(cur && APP.lessons[cur] ? cur : null);
  closeMenu();
  if (r !== 'formulas' || !parts[1]) window.scrollTo(0, 0);
  const h1 = $('#view h1'); if (h1) h1.focus({preventScroll: true});
}
function closeMenu() { $('#sidebar').classList.remove('open'); $('#scrim').classList.remove('show'); $('#menuBtn').setAttribute('aria-expanded', 'false'); }
function init() {
  Store.load();
  $('#menuBtn').addEventListener('click', function () { const o = !$('#sidebar').classList.contains('open'); $('#sidebar').classList.toggle('open', o); $('#scrim').classList.toggle('show', o); $('#menuBtn').setAttribute('aria-expanded', String(o)); });
  $('#scrim').addEventListener('click', closeMenu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  let st = null;
  $('#search').addEventListener('input', function (e) { clearTimeout(st); const v = e.target.value; st = setTimeout(function () { if (v.trim().length >= 2) location.hash = '#/search/' + encodeURIComponent(v.trim()); }, 250); });
  $('#search').addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.value.trim()) location.hash = '#/search/' + encodeURIComponent(e.target.value.trim()); });
  window.addEventListener('hashchange', router);
  router();
}
document.addEventListener('DOMContentLoaded', init);
