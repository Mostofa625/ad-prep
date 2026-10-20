// DP World tab: CCAT-style timed mocks, practice by type, proofreading, work-fit sets and the guide.
// Data lives in dp-data.js. State is in S.dp (saved with the rest of the app's backup).
'use strict';

const DP_MOCK_N = 50, DP_MOCK_SECS = 15 * 60;
const DP_MIX = [['Verbal', 15], ['Maths', 15], ['Series & patterns', 10], ['Spatial', 6], ['Logic', 4]];
const DP_CATS = ['Verbal', 'Maths', 'Series & patterns', 'Spatial', 'Logic'];
const DPBY = Object.fromEntries(DPQ.map(q => [q.id, q]));
const DPL = ['A', 'B', 'C', 'D'];
let dpRun = null; // { mode, ids, i, ans, start, limit, timed, shown }
let dpTick = null, dpProof = null;

function dpState() { return (S.dp ||= { attempts: [], seen: {}, proof: {}, fit: {} }); }
function dpShuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// Unseen questions first.
function dpPick(pool, n) { const seen = dpState().seen; return dpShuffle(pool).sort((a, b) => (seen[a.id] || 0) - (seen[b.id] || 0)).slice(0, n); }
const dpMmss = s => `${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
const dpPct = (a, b) => b ? Math.round(a * 100 / b) : 0;

function dpStart(mode, ids, timed, limit) {
  dpRun = { mode, ids, i: 0, ans: {}, start: Date.now(), limit: limit || 0, timed, shown: false };
  clearInterval(dpTick);
  if (timed) dpTick = setInterval(dpTickFn, 1000);
  location.hash = '#dp/run';
}
function dpTickFn() {
  if (!dpRun || !dpRun.timed || location.hash !== '#dp/run') { clearInterval(dpTick); return; }
  const left = dpRun.limit - Math.round((Date.now() - dpRun.start) / 1000);
  const el = document.getElementById('dpclock');
  if (el) { el.textContent = dpMmss(left); el.classList.toggle('low', left <= 120); }
  if (left <= 0) DPACT['dp-submit']();
}

function dpHub() {
  setHeader('DP World', 'Criteria-style aptitude, proofreading, work-fit');
  const st = dpState();
  const mocks = st.attempts.filter(a => a.mode === 'mock');
  const last = mocks[mocks.length - 1];
  return `
    <div class="card accent"><p style="margin:0"><b>Online assessment deadline: Sun 25 Oct, 1:45 PM Dhaka.</b> Plan: a mock on Day 1, weak-type practice on Day 2, a second mock on Day 3.</p></div>
    <div class="dp-menu">
      <a class="dp-tile" href="#dp/guide"><b>☰ What to know</b><span>Test format, pace, tactics</span></a>
      <a class="dp-tile" href="#dp/mockintro"><b>◷ 50-Q timed mock</b><span>15 minutes, mixed, like CCAT</span></a>
      <a class="dp-tile" href="#dp/types"><b>✓ Practice by type</b><span>Verbal · Maths · Series · Spatial · Logic</span></a>
      <a class="dp-tile" href="#dp/proof"><b>✎ Proofreading</b><span>${DP_PROOF.length} passages, tap the mistakes</span></a>
      <a class="dp-tile" href="#dp/fit"><b>⚖ Work-fit sets</b><span>Sort statements into 5 groups</span></a>
      <a class="dp-tile" href="#dp/hist"><b>▤ My scores</b><span>${mocks.length ? `Last mock: ${last.ok}/${last.n}` : 'No mocks yet'}</span></a>
    </div>
    <p class="muted small">${DPQ.length} original questions. Wrong answers cost nothing in the real test, so always guess.</p>`;
}

function dpGuide() {
  setHeader('What to know', 'DP World assessment');
  return `${DP_GUIDE.map(g => `<div class="card part"><h3>${esc(g.h)}</h3><ul class="plain small">${g.items.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`).join('')}
    <a class="btn" href="#dp">Back</a>`;
}

function dpMockIntro() {
  setHeader('Timed mock', '50 questions · 15 minutes');
  return `<div class="card"><p>50 mixed questions in 15 minutes, no calculator. You can skip and come back. Score = right answers; a wrong answer costs nothing. Aim to answer every question, guessing when stuck.</p>
    <p class="small muted">Mix: ${DP_MIX.map(([c, n]) => `${esc(c)} ${n}`).join(' · ')}</p>
    <button class="primary" data-action="dp-mock" style="width:100%;justify-content:center">Start the mock</button></div>
    <a class="btn" href="#dp">Back</a>`;
}

function dpTypes() {
  setHeader('Practice by type', 'Instant feedback, 15 per round');
  const st = dpState().seen;
  return `<div class="card"><ul class="plain">${DP_CATS.map(c => { const pool = DPQ.filter(q => q.c === c); const done = pool.filter(q => st[q.id]).length;
    return `<li><div class="row between"><b>${esc(c)}</b><span class="muted small">${done}/${pool.length} seen</span></div>
      <div class="progress" style="margin:4px 0 8px"><i style="width:${dpPct(done, pool.length)}%"></i></div>
      <div class="row"><button data-action="dp-type" data-c="${esc(c)}" data-n="15">15 questions</button>
      <button data-action="dp-type" data-c="${esc(c)}" data-n="15" data-t="1">15 timed (5 min)</button></div></li>`; }).join('')}</ul></div>
    <a class="btn" href="#dp">Back</a>`;
}

function dpRunView() {
  const t = dpRun;
  if (!t) { location.hash = '#dp'; return ''; }
  const id = t.ids[t.i], q = DPBY[id];
  const left = t.limit - Math.round((Date.now() - t.start) / 1000);
  const done = Object.keys(t.ans).length;
  setHeader(t.mode === 'mock' ? 'Timed mock' : t.mode, `${t.i + 1} / ${t.ids.length} · ${done} answered`);
  const picked = t.ans[id];
  const instant = !t.timed || t.mode !== 'mock' ? t.shown : false;
  return `
    <div class="row between" style="margin-bottom:8px">${t.timed ? `<span id="dpclock" class="timer ${left <= 120 ? 'low' : ''}" style="font-size:1.4rem">${dpMmss(left)}</span>` : '<span></span>'}
      <span class="tag">${esc(q.c)}</span></div>
    <div class="card"><p style="font-size:1.05rem">${esc(q.q)}</p>
      ${q.o.map((o, i) => `<label class="check ${instant ? (i === q.a ? 'dp-right' : picked === i ? 'dp-wrong' : '') : ''}"><input type="radio" name="dpopt" data-action="dp-ans" data-v="${i}" ${picked === i ? 'checked' : ''} ${instant ? 'disabled' : ''}>
        <span class="label">${DPL[i]}) ${esc(o)}</span></label>`).join('')}
      ${instant ? `<p class="small" style="margin-top:8px"><b>${picked === q.a ? 'Correct.' : `Answer: ${DPL[q.a]}.`}</b> ${esc(q.e || '')}</p>` : ''}
    </div>
    <div class="row">
      <button data-action="dp-go" data-v="${t.i - 1}" ${t.i === 0 ? 'disabled' : ''}>‹ Prev</button>
      <button class="primary grow" data-action="dp-go" data-v="${t.i + 1}" style="justify-content:center" ${t.i === t.ids.length - 1 ? 'disabled' : ''}>${t.timed && t.mode === 'mock' && picked === undefined ? 'Skip ›' : 'Next ›'}</button>
    </div>
    <details class="card" style="margin-top:12px"><summary class="small">All questions</summary>
      <div class="qgrid">${t.ids.map((x, i) => `<button class="${t.ans[x] !== undefined ? 'on' : ''} ${i === t.i ? 'cur' : ''}" data-action="dp-go" data-v="${i}">${i + 1}</button>`).join('')}</div></details>
    <button class="primary" data-action="dp-submit" style="width:100%;justify-content:center;margin-top:4px">Finish</button>
    <button class="ghost danger small" data-action="dp-quit" style="margin-top:8px">Quit without saving</button>`;
}

function dpResult(rid) {
  const a = dpState().attempts.find(x => x.id === rid);
  if (!a) return '<p class="empty">Not found.</p><a class="btn" href="#dp">Back</a>';
  setHeader('Result', `${fmt(a.date)} · ${a.mode === 'mock' ? 'Timed mock' : a.mode}`);
  const wrong = a.ids.filter(id => a.ans[id] !== undefined && a.ans[id] !== DPBY[id]?.a);
  const skip = a.ids.filter(id => a.ans[id] === undefined);
  const card = (id, cls) => { const q = DPBY[id]; if (!q) return ''; const mine = a.ans[id];
    return `<div class="card ${cls}"><span class="tag">${esc(q.c)}</span><p style="margin-top:8px">${esc(q.q)}</p>
      ${mine !== undefined ? `<p class="small">Your answer: ${DPL[mine]}) ${esc(q.o[mine])}</p>` : ''}
      <p class="small"><b>Correct: ${DPL[q.a]}) ${esc(q.o[q.a])}</b></p><p class="muted small">${esc(q.e || '')}</p></div>`; };
  const by = {};
  for (const id of a.ids) { const q = DPBY[id]; if (!q) continue; const x = (by[q.c] ||= { n: 0, ok: 0 }); x.n++; if (a.ans[id] === q.a) x.ok++; }
  const verdict = a.mode !== 'mock' ? '' : a.ok >= 30 ? 'Excellent.' : a.ok >= 20 ? 'Solid.' : a.ok >= 15 ? 'Fair: practise speed and the weakest type below.' : 'Keep going: practise speed first, and guess instead of leaving blanks.';
  return `<div class="stats">
      <div class="stat"><b>${a.ok}</b><span>right / ${a.n}</span></div>
      <div class="stat"><b>${Object.keys(a.ans).length}</b><span>answered</span></div>
      <div class="stat"><b>${dpMmss(a.secs)}</b><span>time used</span></div></div>
    ${verdict ? `<p class="muted small">${verdict} Under 15 right: work on speed. 20–25: solid. 30+: excellent.</p>` : ''}
    <div class="card"><h3>By type</h3>${Object.entries(by).map(([c, x]) => `<div style="margin:8px 0"><div class="row between small"><span>${esc(c)}</span><span class="muted">${x.ok}/${x.n}</span></div>
      <div class="progress"><i style="width:${dpPct(x.ok, x.n)}%"></i></div></div>`).join('')}</div>
    ${wrong.length ? `<h2>Wrong (${wrong.length})</h2>${wrong.map(id => card(id, 'warn')).join('')}` : ''}
    ${skip.length ? `<details><summary>Not answered (${skip.length})</summary>${skip.map(id => card(id, '')).join('')}</details>` : ''}
    <div class="row" style="margin-top:12px"><a class="btn primary" href="#dp">Back</a><a class="btn" href="#dp/mockintro">Another mock</a></div>`;
}

function dpHist() {
  setHeader('My scores', 'DP World practice');
  const at = dpState().attempts.slice().reverse().slice(0, 40);
  return `${at.length ? `<div class="card"><ul class="plain">${at.map(a => `<li><a class="row between" href="#dp/r-${esc(a.id)}" style="text-decoration:none;color:inherit">
    <span>${fmt(a.date)} · ${esc(a.mode === 'mock' ? 'Timed mock' : a.mode)}</span><b>${a.ok} / ${a.n}</b></a></li>`).join('')}</ul></div>` : '<p class="empty">No practice yet.</p>'}
    <a class="btn" href="#dp">Back</a>`;
}

function dpProofList() {
  setHeader('Proofreading', 'Tap each word you think is wrong');
  const p = dpState().proof;
  return `<div class="card"><p class="small muted">Read slowly, tap the words that are wrong, then check. The real test is about 3 minutes for a short paragraph.</p>
    <ul class="plain">${DP_PROOF.map((x, i) => `<li><a class="row between" href="#dp/proof-${i}" style="text-decoration:none;color:inherit"><span>${i + 1}. ${esc(x.title)}</span><span class="tag">${p[i] != null ? 'best ' + p[i] : 'new'}</span></a></li>`).join('')}</ul></div>
    <a class="btn" href="#dp">Back</a>`;
}
function dpTokens(i) {
  return DP_PROOF[i].text.split(/\s+/).map(w => {
    const m = w.match(/^([^{]*)\{([^|}]*)\|([^}]*)\}(.*)$/);
    return m ? { pre: m[1], w: m[2], fix: m[3], post: m[4], err: true } : { pre: '', w, fix: '', post: '', err: false };
  });
}
function dpProofView(i) {
  const p = DP_PROOF[i]; if (!p) { location.hash = '#dp/proof'; return ''; }
  if (!dpProof || dpProof.i !== i) dpProof = { i, marked: new Set(), done: false };
  setHeader('Proofreading', p.title);
  const tk = dpTokens(i);
  const body = tk.map((t, k) => {
    const on = dpProof.marked.has(k);
    let cls = on ? 'on' : '';
    if (dpProof.done) cls = t.err ? (on ? 'ok' : 'miss') : (on ? 'bad' : '');
    return `${esc(t.pre)}<span class="dp-tok ${cls}" data-action="dp-tok" data-k="${k}" tabindex="0" role="button">${esc(t.w)}</span>${esc(t.post)}`;
  }).join(' ');
  let res = '';
  if (dpProof.done) {
    const errs = tk.map((t, k) => t.err ? k : -1).filter(k => k >= 0);
    const found = errs.filter(k => dpProof.marked.has(k)).length, fals = [...dpProof.marked].filter(k => !tk[k].err).length;
    res = `<div class="card ${found === errs.length && !fals ? 'accent' : 'warn'}"><h3>${found} of ${errs.length} found${fals ? `, ${fals} wrongly flagged` : ''}</h3>
      <ul class="plain small">${errs.map(k => `<li>${dpProof.marked.has(k) ? '✓' : '✗'} <s>${esc(tk[k].w)}</s> → <b>${esc(tk[k].fix)}</b></li>`).join('')}</ul>
      ${p.note ? `<p class="muted small">${esc(p.note)}</p>` : ''}</div>`;
  }
  return `<div class="card dp-para">${body}</div>
    ${res || `<button class="primary" data-action="dp-proof-check" style="width:100%;justify-content:center">Check my answers</button>`}
    <div class="row" style="margin-top:10px"><a class="btn" href="#dp/proof">All passages</a>${i + 1 < DP_PROOF.length ? `<a class="btn" href="#dp/proof-${i + 1}">Next ›</a>` : ''}</div>`;
}

function dpFitList() {
  setHeader('Work-fit sets', 'Sort statements into 5 groups');
  return `<div class="card"><p class="small muted">Some tests give about 20 workplace statements and ask you to sort them into five groups from least to most important to you, around four per group. There are no right answers, so be honest and consistent.</p>
    <ul class="plain">${DP_FIT.map((x, i) => `<li><a class="row between" href="#dp/fit-${i}" style="text-decoration:none;color:inherit"><span>${esc(x.title)}</span><span class="tag">${Object.keys(dpState().fit[i] || {}).length}/${x.items.length}</span></a></li>`).join('')}</ul></div>
    <a class="btn" href="#dp">Back</a>`;
}
function dpFitView(i) {
  const f = DP_FIT[i]; if (!f) { location.hash = '#dp/fit'; return ''; }
  setHeader('Work-fit', f.title);
  const a = dpState().fit[i] || {};
  const cnt = [0, 0, 0, 0, 0, 0]; Object.values(a).forEach(g => cnt[g]++);
  const placed = Object.keys(a).length;
  const warn = placed === f.items.length && cnt.slice(1).some(c => c > 6 || c < 2);
  return `<div class="card"><p class="small muted">1 = least important to me, 5 = most important. Aim for about four in each group.</p>
    ${f.items.map((t, k) => `<div class="row" style="align-items:center;margin:8px 0;gap:8px"><span class="small grow">${k + 1}. ${esc(t)}</span>
      <select data-action="dp-fit" data-set="${i}" data-k="${k}" aria-label="Group for statement ${k + 1}"><option value="">–</option>${[1, 2, 3, 4, 5].map(g => `<option ${a[k] === g ? 'selected' : ''}>${g}</option>`).join('')}</select></div>`).join('')}</div>
    <div class="card ${warn ? 'warn' : ''}"><div class="row between small"><span>Group sizes</span><span>${[1, 2, 3, 4, 5].map(g => `${g}: <b>${cnt[g]}</b>`).join(' · ')}</span></div>
      ${warn ? '<p class="small" style="margin:6px 0 0">Your groups are uneven. Real tests often want them roughly equal, so move a few statements.</p>' : ''}
      ${placed === f.items.length && !warn ? '<p class="small" style="margin:6px 0 0">Balanced. Now ask: does the top group show what I truly care about (accuracy, fairness, confidentiality, procedure), without contradicting the bottom group?</p>' : ''}</div>
    <div class="row"><a class="btn" href="#dp/fit">All sets</a><button class="ghost" data-action="dp-fit-reset" data-set="${i}">Clear</button></div>`;
}

const DPVIEWS = {
  dp(sub) {
    const [s, arg] = (sub || '').split(/-(.*)/s);
    if (!sub) return dpHub();
    if (sub === 'guide') return dpGuide();
    if (sub === 'mockintro') return dpMockIntro();
    if (sub === 'types') return dpTypes();
    if (sub === 'run') return dpRunView();
    if (sub === 'hist') return dpHist();
    if (sub === 'proof') return dpProofList();
    if (sub === 'fit') return dpFitList();
    if (s === 'proof') return dpProofView(+arg);
    if (s === 'fit') return dpFitView(+arg);
    if (s === 'r') return dpResult(arg);
    return dpHub();
  },
};

const DPACT = {
  'dp-mock'() {
    const ids = dpShuffle(DP_MIX.flatMap(([c, n]) => dpPick(DPQ.filter(q => q.c === c), n)).map(q => q.id));
    dpStart('mock', ids, true, DP_MOCK_SECS);
  },
  'dp-type'(el) {
    const ids = dpPick(DPQ.filter(q => q.c === el.dataset.c), +el.dataset.n).map(q => q.id);
    const timed = !!el.dataset.t;
    dpStart(`${el.dataset.c}${timed ? ' · timed' : ''}`, ids, timed, timed ? 300 : 0);
  },
  'dp-ans'(el) {
    const t = dpRun; if (!t) return;
    t.ans[t.ids[t.i]] = +el.dataset.v;
    if (t.mode !== 'mock') t.shown = true;
    render();
  },
  'dp-go'(el) { const t = dpRun; if (!t) return; const v = +el.dataset.v; if (v < 0 || v >= t.ids.length) return; t.i = v; t.shown = t.mode !== 'mock' && t.ans[t.ids[v]] !== undefined; render(); },
  'dp-submit'() {
    const t = dpRun; if (!t) return;
    clearInterval(dpTick);
    const st = dpState(), id = 'dp' + Date.now().toString(36);
    const ok = t.ids.filter(x => t.ans[x] === DPBY[x]?.a).length;
    t.ids.forEach(x => { if (t.ans[x] !== undefined) st.seen[x] = (st.seen[x] || 0) + 1; });
    st.attempts.push({ id, date: TODAY, mode: t.mode, ids: t.ids, ans: t.ans, n: t.ids.length, ok, secs: Math.min(Math.round((Date.now() - t.start) / 1000), t.limit || 99999) });
    dpRun = null; save(); location.hash = '#dp/r-' + id;
  },
  'dp-quit'() { if (!confirm('Quit without saving?')) return; clearInterval(dpTick); dpRun = null; location.hash = '#dp'; },
  'dp-tok'(el) { if (!dpProof || dpProof.done) return; const k = +el.dataset.k; dpProof.marked.has(k) ? dpProof.marked.delete(k) : dpProof.marked.add(k); el.classList.toggle('on'); },
  'dp-proof-check'() {
    if (!dpProof) return; dpProof.done = true;
    const tk = dpTokens(dpProof.i), errs = tk.map((t, k) => t.err ? k : -1).filter(k => k >= 0);
    const found = errs.filter(k => dpProof.marked.has(k)).length;
    const p = dpState().proof; p[dpProof.i] = `${Math.max(parseInt(p[dpProof.i]) || 0, found)}/${errs.length}`;
    save(); render();
  },
  'dp-fit'(el) {
    const f = (dpState().fit[el.dataset.set] ||= {});
    if (el.value) f[el.dataset.k] = +el.value; else delete f[el.dataset.k];
    save(); render();
  },
  'dp-fit-reset'(el) { delete dpState().fit[el.dataset.set]; save(); render(); },
};
const DP = { views: DPVIEWS, actions: DPACT };
