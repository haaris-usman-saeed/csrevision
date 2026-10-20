global.window = global;
const fs = require('fs'), vm = require('vm');
const files = ['core','labs-a','labs-b','labs-c','labs-d','content-a','content-b','content-c','questions','questions-b','formulas'];
for (const f of files) vm.runInThisContext(fs.readFileSync('js/'+f+'.js','utf8'), {filename:f+'.js'});
let errs = [], warns = [];
const L = APP.lessons;
// lessons
for (const id of APP.order) {
  const l = L[id];
  for (const k of ['title','pages','quick','learn','revise','prereq','next']) if (l[k]===undefined) errs.push(`${id}: missing ${k}`);
  (l.learn.match(/data-lab="([^"]+)"/g)||[]).forEach(m=>{const lab=m.slice(10,-1); if(!APP.labs[lab]) errs.push(`${id}: unknown lab ${lab}`);});
  (l.learn.match(/data-q="([^"]+)"/g)||[]).forEach(m=>{const q=m.slice(8,-1); if(!APP.qById[q]) errs.push(`${id}: unknown question ${q}`);});
  l.revise.formulas.forEach(f=>{ if(!APP.fById[f]) errs.push(`${id}: unknown formula ${f}`); });
  l.prereq.concat(l.next).forEach(p=>{ if(!L[p]) errs.push(`${id}: unknown prereq/next ${p}`); });
  const qs = APP.questions.filter(q=>q.lesson===id);
  if (qs.length < 3) warns.push(`${id}: only ${qs.length} questions`);
  if (!qs.some(q=>q.type!=='mcq')) warns.push(`${id}: no numeric/worked question`);
}
// questions
const ids = new Set();
for (const q of APP.questions) {
  if (ids.has(q.id)) errs.push(`duplicate question ${q.id}`); ids.add(q.id);
  if (!L[q.lesson]) errs.push(`${q.id}: unknown lesson ${q.lesson}`);
  if (q.type==='mcq') {
    const n = q.opts.filter(o=>o.ok).length; if (n!==1) errs.push(`${q.id}: ${n} correct options`);
    q.opts.forEach(o=>{ if(o.mis && !APP.mis[o.mis]) errs.push(`${q.id}: unknown mis ${o.mis}`); if(!o.why) errs.push(`${q.id}: option without why`); });
  }
  const checkNum = (label, ans, tol, wrong, sol) => {
    if (!isFinite(ans)) { errs.push(`${label}: answer not finite`); return; }
    (wrong||[]).forEach(w=>{ if(!APP.mis[w[1]]) errs.push(`${label}: unknown mis ${w[1]}`); if (closeEnough(w[0], ans, tol)) errs.push(`${label}: wrong value ${w[0]} within tolerance of answer ${ans}`); });
    const cands = new Set();
    [0,1,2,3,4].forEach(d=>{ cands.add(fmt(ans,d)); cands.add(fmt(ans,d).replace('−','-')); });
    [2,3,4].forEach(n=>{ cands.add(sig(ans,n)); });
    cands.add(String(Math.round(ans))); cands.add(thou(ans));
    const plain = sol.replace(/<[^>]+>/g,'');
    if (![...cands].some(c=>plain.includes(c))) warns.push(`${label}: solution text does not show answer ~${sig(ans,4)}`);
  };
  if (q.type==='numeric') checkNum(q.id, q.ans, q.tol, q.wrong, q.sol);
  if (q.type==='worked') { q.parts.forEach((p,k)=>checkNum(`${q.id} part ${k+1}`, p.ans, p.tol, p.wrong, p.sol)); if(!q.hints.length) warns.push(`${q.id}: no hints`); }
}
for (const m in APP.mis) if (!L[APP.mis[m].lesson]) errs.push(`mis ${m}: unknown lesson`);
// try-it questions referenced
APP.order.forEach(id=>{ if(!APP.qById[id+'-t']) errs.push(`${id}: missing try-it ${id}-t`); });
// render every lesson's math to collect unknown TeX commands
global.TEX_UNKNOWN = [];
APP.order.forEach(id=>{ /* learn already rendered at load */ });
APP.formulas.forEach(f=>MD(f.tex));
const unknown = [...new Set(global.TEX_UNKNOWN)];
if (unknown.length) errs.push('Unknown TeX commands: ' + unknown.join(', '));
// dashes in all source files
for (const f of fs.readdirSync('js').concat(['../index.html','../css/styles.css'].map(x=>x))) {
  const p = f.startsWith('..') ? f.slice(3) : 'js/'+f; const s = fs.readFileSync(p,'utf8');
  const m = s.match(/[\u2013\u2014]/g); if (m) errs.push(`${p}: ${m.length} en/em dashes`);
}
const modes = {}; APP.questions.forEach(q=>modes[q.mode]=(modes[q.mode]||0)+1);
console.log('lessons', APP.order.length, 'labs', Object.keys(APP.labs).length, 'questions', APP.questions.length, 'formulas', APP.formulas.length, 'comparisons', APP.comparisons.length, 'misconceptions', Object.keys(APP.mis).length);
console.log('by mode', JSON.stringify(modes), 'extra-labeled', APP.questions.filter(q=>q.src==='extra').length);
console.log('ERRORS', errs.length); errs.forEach(e=>console.log('  E', e));
console.log('WARNINGS', warns.length); warns.forEach(e=>console.log('  W', e));
