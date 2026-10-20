/* COSC 3 study site: core engine. Classic script so the site works from file://. */
'use strict';
window.APP = {lectures: [], lessons: {}, order: [], labs: {}, questions: [], qById: {}, formulas: [], fById: {}, comparisons: [], mis: {}};

/* ---------- Escaping and number formatting ---------- */
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
function fmt(v, d) {
  if (d === undefined) d = 3;
  if (!isFinite(v)) return v > 0 ? '∞' : (v < 0 ? '−∞' : 'undefined');
  let s = Number(v).toFixed(d);
  if (/^-0\.?0*$/.test(s)) s = s.slice(1);
  return s.replace('-', '−');
}
function sig(v, n) { if (n === undefined) n = 4; if (v === 0) return '0'; const d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(v)))); return fmt(v, Math.min(d, 8)); }
function thou(v) { return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
function parseNum(str) {
  if (str == null) return NaN;
  let s = String(str).trim().replace(/[\u2212\u2013]/g, '-').replace(/\s+/g, '').replace(/,(?=\d{3}(\D|$))/g, '');
  if (!s) return NaN;
  let pct = false;
  if (s.endsWith('%')) { pct = true; s = s.slice(0, -1); }
  let v;
  const frac = s.match(/^(-?[\d.]+(?:e-?\d+)?)\/(-?[\d.]+(?:e-?\d+)?)$/i);
  if (frac) v = parseFloat(frac[1]) / parseFloat(frac[2]);
  else if (/^-?(\d+\.?\d*|\.\d+)(e-?\d+)?$/i.test(s)) v = parseFloat(s);
  else return NaN;
  return pct ? v / 100 : v;
}
function closeEnough(u, a, tol) {
  if (!isFinite(u)) return false;
  const t = tol !== undefined ? tol : Math.max(0.0006, 0.004 * Math.abs(a));
  return Math.abs(u - a) <= t;
}

/* ---------- TeX subset to MathML ---------- */
const TeX = (function () {
  const GREEK = {alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',varepsilon:'ε',eta:'η',theta:'θ',lambda:'λ',mu:'μ',nu:'ν',pi:'π',rho:'ρ',sigma:'σ',tau:'τ',phi:'φ',varphi:'φ',chi:'χ',psi:'ψ',omega:'ω',Delta:'Δ',Sigma:'Σ',Theta:'Θ',Phi:'Φ',Omega:'Ω',Pi:'Π',Gamma:'Γ',Lambda:'Λ'};
  const IDENT = {partial:'∂', nabla:'∇', ell:'ℓ', infty:'∞'};
  const SYM = {cdot:'·',times:'×',div:'÷',pm:'±',approx:'≈',neq:'≠',ne:'≠',le:'≤',leq:'≤',ge:'≥',geq:'≥',to:'→',rightarrow:'→',leftarrow:'←',Rightarrow:'⇒',implies:'⟹',iff:'⟺',in:'∈',notin:'∉',mid:'∣',ldots:'…',dots:'…',cdots:'⋯',vdots:'⋮',top:'⊤',perp:'⊥',forall:'∀',lVert:'‖',rVert:'‖',langle:'⟨',rangle:'⟩',uparrow:'↑',downarrow:'↓',star:'⋆',ast:'∗',propto:'∝',sim:'∼',circ:'∘',lt:'<',gt:'>',colon:':',prime:'′',equiv:'≡',mapsto:'↦',lfloor:'⌊',rfloor:'⌋',setminus:'∖',cup:'∪',cap:'∩',subset:'⊂',emptyset:'∅'};
  const BIGOP = {sum:'∑', prod:'∏'};
  const FN = ['ln','log','exp','min','max','sign','median','sin','cos','lim','Var','Cov','arg','logit','cov','var','mean','med','corr'];
  const LIM = {min:1, max:1, lim:1, argmin:1, argmax:1};
  const ACC = {hat:'^', widehat:'^', bar:'¯', overline:'¯', tilde:'˜', widetilde:'˜', vec:'→', dot:'˙'};
  const SPACE = {',':'0.17em', ';':'0.28em', ':':'0.22em', ' ':'0.25em', quad:'1em', qquad:'2em'};
  const BB = {R:'ℝ', E:'𝔼', N:'ℕ', Z:'ℤ', P:'ℙ'};
  function bold(s) {
    return Array.from(s).map(function (ch) {
      const c = ch.codePointAt(0);
      if (c >= 65 && c <= 90) return String.fromCodePoint(0x1D400 + c - 65);
      if (c >= 97 && c <= 122) return String.fromCodePoint(0x1D41A + c - 97);
      if (ch === 'θ') return '𝛉';
      return ch;
    }).join('');
  }
  function parse(src, display) {
    let i = 0;
    const s = src;
    function peek() { return s[i]; }
    function ws() { while (i < s.length && /\s/.test(s[i])) i++; }
    function readName() { let n = ''; while (i < s.length && /[a-zA-Z]/.test(s[i])) n += s[i++]; return n; }
    function readRaw() { ws(); if (s[i] !== '{') { const c = s[i++]; return c; } let depth = 0, out = ''; i++; while (i < s.length) { const c = s[i]; if (c === '{') depth++; if (c === '}') { if (depth === 0) { i++; break; } depth--; } out += c; i++; } return out; }
    function arg() { ws(); if (s[i] === '{') { i++; const r = seq(['}']); i++; return wrap(r.nodes); } const a = atom(); return a ? a.m : '<mrow></mrow>'; }
    function wrap(nodes) { return nodes.length === 1 ? nodes[0] : '<mrow>' + nodes.join('') + '</mrow>'; }
    function mo(t, extra) { return '<mo' + (extra || '') + '>' + esc(t) + '</mo>'; }
    function delim() {
      ws();
      if (s[i] === '\\') { i++; if (s[i] === '|') { i++; return '‖'; } if (s[i] === '{' || s[i] === '}') return s[i++]; const n = readName(); return SYM[n] || ''; }
      const c = s[i++]; return c === '.' ? '' : c;
    }
    function env(name) {
      const rows = []; let cur = []; let done = false;
      while (i < s.length && !done) {
        const r = seq(['&', '\\\\', '\\end']);
        cur.push('<mtd>' + wrap(r.nodes) + '</mtd>');
        if (r.stop === '&') { i++; }
        else if (r.stop === '\\\\') { i += 2; rows.push(cur); cur = []; }
        else { i += 4; readRaw(); done = true; rows.push(cur); }
      }
      const isCases = name === 'cases';
      const table = '<mtable' + (isCases ? ' columnalign="left left"' : '') + '>' + rows.filter(function (r) { return r.join('') !== '<mtd><mrow></mrow></mtd>'; }).map(function (r) { return '<mtr>' + r.join('') + '</mtr>'; }).join('') + '</mtable>';
      if (isCases) return '<mrow>' + mo('{', ' stretchy="true"') + table + '</mrow>';
      if (name === 'bmatrix') return '<mrow>' + mo('[') + table + mo(']') + '</mrow>';
      if (name === 'pmatrix') return '<mrow>' + mo('(') + table + mo(')') + '</mrow>';
      return table;
    }
    function atom() {
      ws();
      if (i >= s.length) return null;
      const c = s[i];
      if (c === '{') { i++; const r = seq(['}']); i++; return {m: wrap(r.nodes)}; }
      if (c === '\\') {
        i++;
        const n0 = s[i];
        if (!/[a-zA-Z]/.test(n0)) {
          i++;
          if (SPACE[n0]) return {m: '<mspace width="' + SPACE[n0] + '"></mspace>'};
          if (n0 === '!') return {m: '<mspace width="-0.17em"></mspace>'};
          if (n0 === '|') return {m: mo('‖')};
          if (n0 === '{' || n0 === '}') return {m: mo(n0)};
          if (n0 === '%' || n0 === '#' || n0 === '&' || n0 === '$') return {m: mo(n0)};
          return {m: mo(n0)};
        }
        const name = readName();
        if (name === 'frac' || name === 'dfrac' || name === 'tfrac') { const a = arg(), b = arg(); return {m: '<mfrac>' + a + b + '</mfrac>'}; }
        if (name === 'sqrt') return {m: '<msqrt>' + arg() + '</msqrt>'};
        if (ACC[name]) return {m: '<mover accent="true">' + arg() + '<mo stretchy="false">' + ACC[name] + '</mo></mover>'};
        if (name === 'mathbf' || name === 'boldsymbol') { const raw = readRaw(); if (/^[a-zA-Zθ]+$/.test(raw)) return {m: '<mi>' + bold(raw) + '</mi>'}; return {m: '<mrow style="font-weight:bold">' + parse(raw, false) + '</mrow>'}; }
        if (name === 'mathcal') { const raw = readRaw(); const SC = {B: 'ℬ', E: 'ℰ', F: 'ℱ', H: 'ℋ', I: 'ℐ', L: 'ℒ', M: 'ℳ', R: 'ℛ'}; return {m: '<mi>' + Array.from(raw).map(function (ch) { return SC[ch] || (/[A-Z]/.test(ch) ? String.fromCodePoint(0x1D49C + ch.charCodeAt(0) - 65) : ch); }).join('') + '</mi>'}; }
        if (name === 'mathbb') { const raw = readRaw(); return {m: '<mi>' + (BB[raw] || raw) + '</mi>'}; }
        if (name === 'text' || name === 'textrm' || name === 'mbox') { const raw = readRaw(); return {m: '<mtext>' + esc(raw).replace(/^ /, '&#160;').replace(/ $/, '&#160;') + '</mtext>'}; }
        if (name === 'mathrm' || name === 'operatorname') { const raw = readRaw(); return {m: '<mi mathvariant="normal">' + esc(raw) + '</mi>', fn: true, lim: !!LIM[raw]}; }
        if (name === 'hl' || name === 'hlb' || name === 'hla' || name === 'hlg') { const cls = name === 'hla' ? 'hl-a' : (name === 'hlg' ? 'hl-g' : 'hl-b'); return {m: '<mrow class="' + cls + '">' + arg() + '</mrow>'}; }
        if (name === 'left' || name === 'right') { const d = delim(); return {m: d ? mo(d, ' stretchy="true"') : '<mrow></mrow>'}; }
        if (/^(big|Big|bigg|Bigg)[lr]?$/.test(name)) { const d = delim(); return {m: mo(d)}; }
        if (SPACE[name]) return {m: '<mspace width="' + SPACE[name] + '"></mspace>'};
        if (name === 'begin') { const e = readRaw(); return {m: env(e)}; }
        if (name === 'argmin' || name === 'argmax') return {m: mo(name === 'argmin' ? 'arg min' : 'arg max', ' movablelimits="true" lspace="0" rspace="0.17em"'), lim: true};
        if (GREEK[name]) return {m: '<mi>' + GREEK[name] + '</mi>'};
        if (IDENT[name]) return {m: '<mi>' + IDENT[name] + '</mi>'};
        if (BIGOP[name]) return {m: mo(BIGOP[name], ' largeop="true" movablelimits="true"'), lim: true};
        if (SYM[name]) return {m: mo(SYM[name])};
        if (FN.indexOf(name) >= 0) {
          if (LIM[name]) return {m: mo(name, ' movablelimits="true" lspace="0" rspace="0.17em"'), lim: true};
          return {m: '<mi>' + name + '</mi>', fn: true};
        }
        (window.TEX_UNKNOWN = window.TEX_UNKNOWN || []).push(name);
        return {m: '<mtext>' + esc(name) + '</mtext>'};
      }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(s[i + 1] || ''))) {
        let n = '';
        while (i < s.length) {
          const ch = s[i];
          if (/[0-9]/.test(ch)) { n += ch; i++; continue; }
          if (ch === '.' && /[0-9]/.test(s[i + 1] || '') && n.indexOf('.') < 0) { n += ch; i++; continue; }
          if (ch === ',' && /^[0-9]{3}(?![0-9])/.test(s.slice(i + 1, i + 5)) && n.indexOf('.') < 0) { n += ch; i++; continue; }
          break;
        }
        return {m: '<mn>' + n + '</mn>'};
      }
      if (/[a-zA-Z]/.test(c)) { i++; return {m: '<mi>' + c + '</mi>'}; }
      i++;
      if (c === '-') return {m: mo('−')};
      if (c === '*') return {m: mo('∗')};
      if (c === "'") return {m: mo('′'), prime: true};
      if (c === '~') return {m: '<mspace width="0.25em"></mspace>'};
      if (c === '(' || c === ')' || c === '[' || c === ']') return {m: mo(c, ' stretchy="false"')};
      if (c === '|') return {m: mo('|', ' stretchy="false"')};
      return {m: mo(c)};
    }
    function scripted() {
      const a = atom();
      if (!a) return null;
      let sub = null, sup = null;
      for (;;) {
        ws();
        const c = s[i];
        if (c === '_') { i++; sub = arg(); }
        else if (c === '^') { i++; sup = arg(); }
        else if (c === "'") { i++; sup = (sup || '') + '<mo>′</mo>'; }
        else break;
      }
      if (!sub && !sup) return a.m;
      const base = a.m;
      if (a.lim) {
        if (sub && sup) return '<munderover>' + base + sub + sup + '</munderover>';
        if (sub) return '<munder>' + base + sub + '</munder>';
        return '<mover>' + base + sup + '</mover>';
      }
      if (sub && sup) return '<msubsup>' + base + sub + wrapSup(sup) + '</msubsup>';
      if (sub) return '<msub>' + base + sub + '</msub>';
      return '<msup>' + base + wrapSup(sup) + '</msup>';
    }
    function wrapSup(x) { return x.indexOf('<mo>′</mo>') === 0 && x.length > 10 ? '<mrow>' + x + '</mrow>' : x; }
    function seq(stops) {
      const nodes = [];
      for (;;) {
        ws();
        if (i >= s.length) return {nodes: nodes, stop: null};
        for (let k = 0; k < stops.length; k++) { const st = stops[k]; if (s.substr(i, st.length) === st) return {nodes: nodes, stop: st}; }
        const m = scripted();
        if (m === null) return {nodes: nodes, stop: null};
        nodes.push(m);
      }
    }
    const r = seq([]);
    return wrap(r.nodes);
  }
  return {
    inline: function (t) { try { return '<math>' + parse(t, false) + '</math>'; } catch (e) { return '<code>' + esc(t) + '</code>'; } },
    block: function (t) { try { return '<math display="block">' + parse(t, true) + '</math>'; } catch (e) { return '<pre>' + esc(t) + '</pre>'; } }
  };
})();
function M(t) { return TeX.inline(t); }
function MD(t) { return TeX.block(t); }

/* ---------- Content helpers ---------- */
function SRC(page, html) { return '<div class="src"><span class="tag">From the lecture' + (page ? ', p. ' + page : '') + '</span>' + html + '</div>'; }
function XTRA(html, label) { return '<div class="xtra"><span class="tag">' + (label || 'Extra intuition') + '</span>' + html + '</div>'; }
function FLAG(html) { return '<div class="flag"><span class="tag">Check the slide carefully</span>' + html + '</div>'; }
function LEDGER(rows) {
  return '<div class="ledger">' + rows.map(function (r, k) {
    const isTotal = r[2] === 'total' || (k === rows.length - 1 && r[2] !== 'plain');
    const left = r[0].charAt(0) === '<' ? r[0] : MD(r[0]);
    return '<div class="row' + (isTotal ? ' total' : '') + '"><div>' + left + '</div><div class="why">' + r[1] + '</div></div>';
  }).join('') + '</div>';
}
function TRAPS(list) { return '<ul class="traps">' + list.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>'; }
function CHAIN(items, here) { return '<div class="chain">' + items.map(function (t, k) { return (k ? '<i>›</i>' : '') + '<span' + (k === here ? ' class="here"' : '') + '>' + t + '</span>'; }).join('') + '</div>'; }
function LAB(id) { return '<div data-lab="' + id + '"></div>'; }
function QREF(id) { return '<div data-q="' + id + '"></div>'; }
function SEC(title, html) { return '<h2 id="' + slug(title) + '">' + title + '</h2>' + html; }
function slug(t) { return String(t).toLowerCase().replace(/<[^>]+>/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
function TABLE(head, rows, opts) {
  opts = opts || {};
  return '<div class="scroll-x"><table class="tbl">' + (head ? '<thead><tr>' + head.map(function (h, k) { return '<th' + (k && opts.num ? ' class="r"' : '') + '>' + h + '</th>'; }).join('') + '</tr></thead>' : '') + '<tbody>' + rows.map(function (r) { return '<tr>' + r.map(function (c, k) { return '<td' + (k && opts.num ? ' class="r"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
}

/* ---------- Registries ---------- */
function LECTURE(o) { APP.lectures.push(o); }
function LESSON(o) { APP.lessons[o.id] = o; APP.order.push(o.id); }
function DEFLAB(id, def) { def.id = id; APP.labs[id] = def; }
function Q(o) { APP.questions.push(o); APP.qById[o.id] = o; }
function FORMULA(o) { APP.formulas.push(o); APP.fById[o.id] = o; }
function COMPARE(o) { APP.comparisons.push(o); }
function MIS(id, o) { APP.mis[id] = o; }

/* ---------- Storage and mastery ---------- */
const Store = {
  key: 'cosc3.midterm.v1',
  data: null,
  ok: true,
  fresh: function () { return {v: 1, attempts: [], visits: {}, review: {}, prefs: {}, sessions: [], tryState: {}}; },
  load: function () {
    try { const raw = localStorage.getItem(this.key); this.data = raw ? JSON.parse(raw) : null; } catch (e) { this.ok = false; this.data = null; }
    if (!this.data || this.data.v !== 1) this.data = this.fresh();
    const f = this.fresh();
    Object.keys(f).forEach(function (k) { if (Store.data[k] === undefined) Store.data[k] = f[k]; });
  },
  save: function () { try { localStorage.setItem(this.key, JSON.stringify(this.data)); this.ok = true; } catch (e) { this.ok = false; } },
  visit: function (lessonId) { this.data.visits[lessonId] = Date.now(); this.save(); },
  record: function (q, ok, mis, extra) {
    const a = {q: q.id, c: q.lesson, ok: !!ok, mis: ok ? null : (mis || null), t: Date.now(), type: q.type, mode: q.mode, d: q.diff || 1};
    if (extra) a.x = extra;
    this.data.attempts.push(a);
    if (this.data.attempts.length > 4000) this.data.attempts = this.data.attempts.slice(-4000);
    const r = this.data.review[q.lesson] || {step: 0};
    const STEPS = [10 * 60e3, 24 * 3600e3, 3 * 24 * 3600e3, 7 * 24 * 3600e3, 14 * 24 * 3600e3];
    r.step = ok ? Math.min((r.step || 0) + 1, STEPS.length - 1) : 0;
    r.due = Date.now() + STEPS[r.step];
    this.data.review[q.lesson] = r;
    this.save();
    return a;
  },
  attemptsFor: function (lessonId) { return this.data.attempts.filter(function (a) { return a.c === lessonId; }); },
  reset: function () { this.data = this.fresh(); this.save(); }
};

const STATE_LABEL = {none: 'Not started', learning: 'Learning', review: 'Needs review', confident: 'Confident', mastered: 'Mastered'};
function mastery(lessonId) {
  const at = Store.attemptsFor(lessonId);
  const visited = !!Store.data.visits[lessonId];
  if (!at.length) return visited ? 'learning' : 'none';
  const last5 = at.slice(-5);
  const acc5 = last5.filter(function (a) { return a.ok; }).length / last5.length;
  const last = at[at.length - 1];
  const rv = Store.data.review[lessonId];
  const due = rv && rv.due && rv.due < Date.now();
  if (!last.ok && acc5 < 0.6) return 'review';
  const hardOk = at.some(function (a) { return a.ok && (a.type === 'numeric' || a.type === 'worked' || a.d >= 2); });
  const last3 = at.slice(-3);
  if (at.length >= 5 && acc5 >= 0.85 && last3.length === 3 && last3.every(function (a) { return a.ok; }) && hardOk) return due ? 'review' : 'mastered';
  if (due && acc5 < 0.85) return 'review';
  if (at.length >= 3 && acc5 >= 0.7) return 'confident';
  return 'learning';
}
function lessonStats(lessonId) {
  const at = Store.attemptsFor(lessonId);
  const recent = at.slice(-8);
  return {n: at.length, acc: recent.length ? recent.filter(function (a) { return a.ok; }).length / recent.length : null, state: mastery(lessonId)};
}
function misCounts() {
  const c = {};
  Store.data.attempts.forEach(function (a) { if (!a.ok && a.mis) c[a.mis] = (c[a.mis] || 0) + 1; });
  return c;
}
function dueReviews() {
  const now = Date.now();
  return Object.keys(Store.data.review).filter(function (k) { const r = Store.data.review[k]; return r.due && r.due < now && APP.lessons[k]; });
}

/* ---------- SVG plot helper ---------- */
function niceTicks(a, b, n) {
  n = n || 5;
  const span = b - a; if (span <= 0) return [a];
  const raw = span / n, mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const out = [];
  for (let v = Math.ceil(a / step - 1e-9) * step; v <= b + 1e-9; v += step) out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  return out;
}
function Plot(o) {
  const w = o.w || 560, h = o.h || 320;
  const m = Object.assign({l: 46, r: 16, t: 16, b: 36}, o.m || {});
  const x0 = o.x[0], x1 = o.x[1], y0 = o.y[0], y1 = o.y[1];
  const P = [];
  const api = {
    w: w, h: h, m: m,
    sx: function (v) { return m.l + (v - x0) / (x1 - x0) * (w - m.l - m.r); },
    sy: function (v) { return h - m.b - (v - y0) / (y1 - y0) * (h - m.t - m.b); },
    ix: function (px) { return x0 + (px - m.l) / (w - m.l - m.r) * (x1 - x0); },
    iy: function (py) { return y0 + (h - m.b - py) / (h - m.t - m.b) * (y1 - y0); },
    clampX: function (v) { return Math.max(x0, Math.min(x1, v)); },
    clampY: function (v) { return Math.max(y0, Math.min(y1, v)); },
    axes: function (a) {
      a = a || {};
      const xt = a.xt || niceTicks(x0, x1, a.nx || 6), yt = a.yt || niceTicks(y0, y1, a.ny || 5);
      const fx = a.fx || function (v) { return +v.toFixed(6); }, fy = a.fy || function (v) { return +v.toFixed(6); };
      let g = '<g class="grid">';
      if (a.grid !== false) yt.forEach(function (v) { g += '<line x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + api.sy(v) + '" y2="' + api.sy(v) + '"/>'; });
      g += '</g><g class="ax">';
      g += '<line x1="' + m.l + '" x2="' + (w - m.r) + '" y1="' + (h - m.b) + '" y2="' + (h - m.b) + '"/>';
      g += '<line x1="' + m.l + '" x2="' + m.l + '" y1="' + m.t + '" y2="' + (h - m.b) + '"/>';
      xt.forEach(function (v) { const X = api.sx(v); g += '<line x1="' + X + '" x2="' + X + '" y1="' + (h - m.b) + '" y2="' + (h - m.b + 4) + '"/><text x="' + X + '" y="' + (h - m.b + 16) + '" text-anchor="middle">' + String(fx(v)).replace('-', '−') + '</text>'; });
      yt.forEach(function (v) { const Y = api.sy(v); g += '<text x="' + (m.l - 6) + '" y="' + (Y + 4) + '" text-anchor="end">' + String(fy(v)).replace('-', '−') + '</text>'; });
      if (a.xl) g += '<text class="lbl-2" x="' + (w - m.r) + '" y="' + (h - 4) + '" text-anchor="end">' + esc(a.xl) + '</text>';
      if (a.yl) g += '<text class="lbl-2" x="' + (m.l + 4) + '" y="' + (m.t + 2) + '" text-anchor="start" dominant-baseline="hanging">' + esc(a.yl) + '</text>';
      g += '</g>';
      P.push(g); return api;
    },
    line: function (pts, cls, extra) { if (!pts.length) return api; P.push('<polyline class="' + (cls || 'c-blue') + '" ' + (extra || '') + ' points="' + pts.map(function (p) { return api.sx(p[0]).toFixed(1) + ',' + api.sy(p[1]).toFixed(1); }).join(' ') + '"/>'); return api; },
    fn: function (f, cls, n, xa, xb) { n = n || 160; xa = xa === undefined ? x0 : xa; xb = xb === undefined ? x1 : xb; const pts = []; for (let k = 0; k <= n; k++) { const x = xa + (xb - xa) * k / n; const y = f(x); if (isFinite(y)) pts.push([x, Math.max(y0 - (y1 - y0), Math.min(y1 + (y1 - y0), y))]); } return api.line(pts, cls); },
    seg: function (a, b, c, d, cls, extra) { P.push('<line class="' + (cls || 'c-text') + '" x1="' + api.sx(a) + '" y1="' + api.sy(b) + '" x2="' + api.sx(c) + '" y2="' + api.sy(d) + '" ' + (extra || '') + '/>'); return api; },
    dot: function (x, y, r, cls, extra) { P.push('<circle cx="' + api.sx(x) + '" cy="' + api.sy(y) + '" r="' + (r || 4) + '" class="' + (cls || 'f-blue') + '" ' + (extra || '') + '/>'); return api; },
    text: function (x, y, t, cls, anchor, dy) { P.push('<text class="' + (cls || 'ann') + '" x="' + api.sx(x) + '" y="' + (api.sy(y) + (dy || 0)) + '" text-anchor="' + (anchor || 'start') + '">' + esc(t) + '</text>'); return api; },
    rectD: function (xa, ya, xb, yb, cls) { const X = Math.min(api.sx(xa), api.sx(xb)), Y = Math.min(api.sy(ya), api.sy(yb)); P.push('<rect class="' + (cls || 'sq') + '" x="' + X + '" y="' + Y + '" width="' + Math.abs(api.sx(xb) - api.sx(xa)) + '" height="' + Math.abs(api.sy(yb) - api.sy(ya)) + '"/>'); return api; },
    raw: function (str) { P.push(str); return api; },
    svg: function (label) { return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(label || 'chart') + '">' + P.join('') + '</svg>'; }
  };
  return api;
}
/* Convert a pointer event to data coordinates on a Plot inside svgEl. */
function svgPoint(svgEl, ev) {
  const pt = svgEl.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
  const r = pt.matrixTransform(svgEl.getScreenCTM().inverse());
  return {x: r.x, y: r.y};
}
function enableDrag(host, getPlot, onMove) {
  let active = null;
  host.addEventListener('pointerdown', function (ev) {
    const t = ev.target.closest('[data-drag]'); if (!t) return;
    active = t.getAttribute('data-drag'); ev.preventDefault();
    try { host.setPointerCapture(ev.pointerId); } catch (e) {}
  });
  host.addEventListener('pointermove', function (ev) {
    if (active === null) return;
    const svg = host.querySelector('svg'); if (!svg) return;
    const p = svgPoint(svg, ev), pl = getPlot();
    onMove(active, pl.clampX(pl.ix(p.x)), pl.clampY(pl.iy(p.y)));
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (e) { host.addEventListener(e, function () { active = null; }); });
}

/* ---------- Lab controls ---------- */
function rangeCtl(key, label, min, max, step, value, d) {
  return '<div class="ctl"><label for="r-' + key + '"><span>' + label + '</span><output data-out="' + key + '">' + fmt(value, d === undefined ? 2 : d) + '</output></label><input type="range" id="r-' + key + '" data-key="' + key + '" data-d="' + (d === undefined ? 2 : d) + '" min="' + min + '" max="' + max + '" step="' + step + '" value="' + value + '"></div>';
}
function numCtl(key, label, value) {
  return '<div class="ctl"><label for="n-' + key + '"><span>' + label + '</span></label><input class="num-in" id="n-' + key + '" data-num="' + key + '" value="' + value + '" inputmode="decimal"></div>';
}
function bindCtls(root, state, onChange) {
  root.querySelectorAll('input[data-key]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      const k = inp.getAttribute('data-key'); state[k] = parseFloat(inp.value);
      const o = root.querySelector('[data-out="' + k + '"]'); if (o) o.textContent = fmt(state[k], +inp.getAttribute('data-d'));
      onChange(k);
    });
  });
  root.querySelectorAll('input[data-num]').forEach(function (inp) {
    inp.addEventListener('input', function () {
      const v = parseNum(inp.value); if (!isFinite(v)) { inp.setAttribute('aria-invalid', 'true'); return; }
      inp.removeAttribute('aria-invalid'); state[inp.getAttribute('data-num')] = v; onChange(inp.getAttribute('data-num'));
    });
  });
}
function setCtl(root, key, v) {
  const r = root.querySelector('input[data-key="' + key + '"]');
  if (r) { r.value = v; const o = root.querySelector('[data-out="' + key + '"]'); if (o) o.textContent = fmt(v, +r.getAttribute('data-d')); }
  const n = root.querySelector('input[data-num="' + key + '"]'); if (n) n.value = v;
}
function segCtl(key, opts, cur) {
  return '<div class="seg" role="group">' + opts.map(function (o) { return '<button type="button" data-seg="' + key + '" data-v="' + o[0] + '" aria-pressed="' + (o[0] === cur) + '">' + o[1] + '</button>'; }).join('') + '</div>';
}
function bindSeg(root, state, onChange) {
  root.querySelectorAll('[data-seg]').forEach(function (b) {
    b.addEventListener('click', function () {
      const k = b.getAttribute('data-seg');
      root.querySelectorAll('[data-seg="' + k + '"]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      state[k] = b.getAttribute('data-v'); onChange(k);
    });
  });
}
/* Deterministic random numbers for labs that sample. */
function rng(seed) { let s = seed >>> 0 || 1; return function () { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function sigmoid(z) { return 1 / (1 + Math.exp(-z)); }
function sum(a) { return a.reduce(function (s, v) { return s + v; }, 0); }
function mean(a) { return sum(a) / a.length; }
function median(a) { const b = a.slice().sort(function (x, y) { return x - y; }); const n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; }

/* Mount a lab into a placeholder element. */
function mountLab(el, id) {
  const def = APP.labs[id];
  if (!def) { el.innerHTML = ''; return; }
  el.innerHTML = '<section class="lab" aria-label="' + esc(def.title) + '"><div class="lab-head"><div><h4>' + def.title + '</h4><div class="q">' + def.question + '</div></div><button class="btn ghost" type="button" data-reset>Reset to lecture example</button></div><div class="lab-mount"></div></section>';
  const host = el.querySelector('.lab-mount');
  function start() { host.innerHTML = ''; def.mount(host); }
  start();
  el.querySelector('[data-reset]').addEventListener('click', start);
}
