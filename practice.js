// Practice: quizzes and timed mocks from QUESTIONS (questions.js), results review, weak-topic analysis,
// and the past-paper pattern report (patterns.js). Loaded before app.js; app.js merges PRACTICE.views/actions.
'use strict';

// AD MCQ pattern used for full mocks: 100 questions, 60 minutes.
const MOCK_MIX = [['Bangla', 20], ['English', 25], ['Math', 20], ['GK', 25], ['ICT / Mental ability', 10]];
const MOCK_MINS = 60;
const QUICK_N = 20;
const QBY = Object.fromEntries(QUESTIONS.map(q => [q.id, q]));
const QSUBJECTS = MOCK_MIX.map(m => m[0]);
const LETTERS = ['ক', 'খ', 'গ', 'ঘ'];

let pf = { s: 'All', t: '' }; // quick-quiz filter
let ptick = null;

function shuffle(a) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// How each question has gone across all finished tests: { id: { n, ok } }.
function qHistory() {
  const h = {};
  for (const t of S.attempts) for (const id of t.ids) {
    const x = (h[id] ||= { n: 0, ok: 0 });
    if (t.ans[id] === undefined) continue;
    x.n++; if (t.ans[id] === QBY[id]?.a) x.ok++;
  }
  return h;
}

// Accuracy per subject and per topic over all answered questions.
function topicStats() {
  const by = {};
  for (const t of S.attempts) for (const id of t.ids) {
    const q = QBY[id]; if (!q || t.ans[id] === undefined) continue;
    for (const k of [q.s, q.s + ' › ' + q.t]) {
      const x = (by[k] ||= { n: 0, ok: 0 }); x.n++; if (t.ans[id] === q.a) x.ok++;
    }
  }
  return by;
}

// Fresh questions first, then ones you got wrong, then the rest; within each group, frequently asked first.
function pick(pool, n) {
  const h = qHistory();
  const rank = q => { const x = h[q.id]; return !x ? 0 : x.ok < x.n ? 1 : 2; };
  return shuffle(pool).sort((a, b) => rank(a) - rank(b) || (b.r || 0) - (a.r || 0)).slice(0, n);
}

// 30-MCQ test after a subject session: 20 from this week's topics, 10 revising earlier weeks.
// Weeks 9–12 (empty topic list) draw from the whole subject, Assistant Director paper questions first.
const SUBJ_N = 30, SUBJ_MINS = 20;
const AD_RX = /সহকারী পরিচালক|উপ-?সহকারী পরিচালক|এনএসআই|প্রতিরক্ষা মন্ত্রণালয়|প্রধানমন্ত্রীর কার্যালয়|\bAD\b|NSI/;
const subjTestMode = (subj, week) => `${subj} 30-MCQ · week ${week}`;
function subjectTestIds(subj, week) {
  const inSubj = (q, topics) => topics.includes(q.t);
  const wk = WEEK_TOPICS[Math.min(week, WEEK_TOPICS.length) - 1]?.[subj] || [];
  const earlier = [...new Set(WEEK_TOPICS.slice(0, Math.max(0, week - 1)).flatMap(w => w[subj] || []))];
  const used = new Set();
  const take = (pool, n) => { const got = pick(pool.filter(q => !used.has(q.id)), n); got.forEach(q => used.add(q.id)); return got; };
  let qs;
  if (!wk.length) {
    const all = QUESTIONS.filter(q => q.s === subj);
    qs = [...take(all.filter(q => AD_RX.test(q.e || '')), 15)];
    qs.push(...take(all, SUBJ_N - qs.length));
  } else {
    qs = take(QUESTIONS.filter(q => inSubj(q, wk)), 20);
    if (earlier.length) qs.push(...take(QUESTIONS.filter(q => inSubj(q, earlier)), SUBJ_N - qs.length));
    qs.push(...take(QUESTIONS.filter(q => q.s === subj || wk.includes(q.t)), SUBJ_N - qs.length));
  }
  return shuffle(qs.map(q => q.id));
}

function startTest(mode, ids, mins) {
  const ord = Object.fromEntries(ids.map(id => [id, shuffle([0, 1, 2, 3])]));
  S.test = { id: uid(), mode, ids, ord, ans: {}, flag: {}, i: 0, start: Date.now(), limit: mins * 60 };
  save(); location.hash = 'practice/test';
}

function score(t) {
  let ok = 0, wrong = 0;
  for (const id of t.ids) {
    if (t.ans[id] === undefined) continue;
    t.ans[id] === QBY[id]?.a ? ok++ : wrong++;
  }
  const neg = S.neg ?? 0.25;
  return { ok, wrong, skip: t.ids.length - ok - wrong, marks: Math.round((ok - wrong * neg) * 100) / 100, total: t.ids.length };
}

function finishTest() {
  const t = S.test; if (!t) return;
  t.secs = Math.round((Date.now() - t.start) / 1000);
  t.date = TODAY;
  const sc = score(t);
  // every wrong answer becomes a Mistakes flashcard (once)
  let added = 0;
  for (const id of t.ids) {
    const q = QBY[id];
    if (!q || t.ans[id] === undefined || t.ans[id] === q.a || S.mistakes.some(m => m.qid === id)) continue;
    S.mistakes.push({ id: uid(), qid: id, subject: q.s === 'GK' ? 'GK' : q.s, q: q.q + '\n\n' + optOrder(t, id).map((i, k) => `${LETTERS[k]}) ${q.o[i]}`).join('\n'),
      a: `${letter(t, id, q.a)}) ${q.o[q.a]}`, note: q.e || '', box: 0, due: addDays(TODAY, 1), created: TODAY });
    added++;
  }
  S.attempts.push({ id: t.id, mode: t.mode, date: t.date, ids: t.ids, ord: t.ord, ans: t.ans, secs: t.secs });
  if (t.mode === 'Full mock') S.scores = S.scores.filter(x => x.date !== TODAY).concat({ date: TODAY, score: sc.marks });
  S.test = null; save();
  location.hash = 'practice/r-' + t.id;
  if (added) toast(`${added} wrong answer${added > 1 ? 's' : ''} added to Mistakes`);
}

// Letter shown for original option i in test t (options are shuffled per test).
const letter = (t, id, i) => LETTERS[t.ord?.[id] ? t.ord[id].indexOf(i) : i];
const optOrder = (t, id) => t.ord?.[id] || [0, 1, 2, 3];

const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
const mmss = s => `${pad(Math.floor(Math.max(0, s) / 60))}:${pad(Math.max(0, s) % 60)}`;

function practiceHome() {
  setHeader('Practice', `${QUESTIONS.length} questions`);
  const st = topicStats();
  const topics = [...new Set(QUESTIONS.filter(q => pf.s === 'All' || q.s === pf.s).map(q => q.t))].sort();
  const weak = Object.entries(st).filter(([k, x]) => k.includes(' › ') && x.n >= 3)
    .sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).slice(0, 5);
  const answered = Object.values(qHistory()).reduce((a, x) => a + x.n, 0);
  return `
    <div class="card accent">
      <h3>Full mock: 100 MCQ · ${MOCK_MINS} min</h3>
      <p class="small">${MOCK_MIX.map(([s, n]) => `${esc(s.split(' /')[0])} ${n}`).join(' · ')}. Negative marking ${S.neg ?? 0.25} per wrong answer.</p>
      <button class="primary" data-action="p-mock">Start full mock</button>
    </div>

    <div class="card"><h3>Quick quiz: ${QUICK_N} questions</h3>
      <div class="chips" style="margin-top:8px">${['All', ...QSUBJECTS].map(s =>
        `<button class="chip ${pf.s === s ? 'on' : ''}" data-action="p-subj" data-v="${esc(s)}">${esc(s.split(' /')[0])}</button>`).join('')}</div>
      <label class="field"><span>Topic</span><select id="p-topic"><option value="">All topics</option>${topics.map(t =>
        `<option ${pf.t === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></label>
      <div class="row"><button class="primary" data-action="p-quick">Start quiz</button>
        ${weak.length ? '<button data-action="p-weak">Weak topics quiz</button>' : ''}</div>
    </div>

    <h2>Your analysis</h2>
    ${answered ? `<div class="card">
      ${QSUBJECTS.map(s => { const x = st[s] || { n: 0, ok: 0 }; return `<div style="margin-bottom:10px">
        <div class="row between small"><span>${esc(s)}</span><span class="muted">${x.n ? pct(x.ok, x.n) + '% · ' + x.n + ' answered' : 'not tried'}</span></div>
        <div class="progress"><i style="width:${pct(x.ok, x.n)}%"></i></div></div>`; }).join('')}
      ${weak.length ? `<h3 style="margin-top:12px">Weakest topics</h3><ul class="plain small">${weak.map(([k, x]) =>
        `<li class="row between"><span>${esc(k)}</span><span class="tag warn">${pct(x.ok, x.n)}%</span></li>`).join('')}</ul>` : '<p class="muted small">Answer at least 3 questions in a topic to see your weak topics.</p>'}
    </div>` : '<p class="empty">Take a quiz or mock to see your accuracy by subject and topic.</p>'}

    <a class="btn" href="#practice/patterns" style="width:100%;justify-content:center;margin-bottom:12px">What comes up most in past papers</a>

    <h2>Past tests</h2>
    ${S.attempts.length ? `<div class="card"><ul class="plain">${S.attempts.slice().reverse().slice(0, 30).map(t => { const sc = score(t);
      return `<li><a class="row between" href="#practice/r-${esc(t.id)}" style="text-decoration:none;color:inherit">
        <span>${fmt(t.date)} · ${esc(t.mode)}</span><b>${sc.marks} / ${sc.total}</b></a></li>`; }).join('')}</ul></div>`
      : '<p class="empty">No tests yet.</p>'}
    <label class="field small"><span>Negative marking per wrong answer</span><select data-action="p-neg">
      ${[0, 0.25, 0.5].map(v => `<option value="${v}" ${(S.neg ?? 0.25) === v ? 'selected' : ''}>${v}</option>`).join('')}</select></label>`;
}

function testView() {
  const t = S.test;
  if (!t) { location.hash = 'practice'; return ''; }
  // drop questions removed from the bank since this test started
  if (t.ids.some(x => !QBY[x])) { t.ids = t.ids.filter(x => QBY[x]); t.i = Math.min(t.i, t.ids.length - 1); save(); }
  if (!t.ids.length) { S.test = null; save(); location.hash = 'practice'; return ''; }
  const id = t.ids[t.i], q = QBY[id];
  const left = t.limit - Math.round((Date.now() - t.start) / 1000);
  const done = Object.keys(t.ans).length;
  setHeader(t.mode, `${t.i + 1} / ${t.ids.length} · ${done} answered`);
  return `
    <div class="row between" style="margin-bottom:8px"><span id="ptimer" class="timer ${left <= 300 ? 'low' : ''}" style="font-size:1.4rem">${mmss(left)}</span>
      <span class="tag">${esc(q.s.split(' /')[0])} · ${esc(q.t)}</span></div>
    <div class="card"><p style="font-size:1.05rem;white-space:pre-wrap">${esc(q.q)}</p>
      ${optOrder(t, id).map((i, k) => `<label class="check"><input type="radio" name="opt" data-action="p-ans" data-v="${i}" ${t.ans[id] === i ? 'checked' : ''}>
        <span class="label">${LETTERS[k]}) ${esc(q.o[i])}</span></label>`).join('')}
      ${t.ans[id] !== undefined ? '<button class="ghost small" data-action="p-clear">Clear answer</button>' : ''}
    </div>
    <div class="row">
      <button data-action="p-go" data-v="${t.i - 1}" ${t.i === 0 ? 'disabled' : ''}>‹ Prev</button>
      <button data-action="p-flag">${t.flag[id] ? '★ Flagged' : '☆ Flag'}</button>
      <button class="primary grow" data-action="p-go" data-v="${t.i + 1}" style="justify-content:center" ${t.i === t.ids.length - 1 ? 'disabled' : ''}>Next ›</button>
    </div>
    <details class="card" style="margin-top:12px"><summary class="small">All questions</summary>
      <div class="qgrid">${t.ids.map((x, i) => `<button class="${t.ans[x] !== undefined ? 'on' : ''} ${t.flag[x] ? 'flag' : ''} ${i === t.i ? 'cur' : ''}" data-action="p-go" data-v="${i}">${i + 1}</button>`).join('')}</div>
    </details>
    <button class="primary" data-action="p-submit" style="width:100%;justify-content:center;margin-top:4px">Submit test</button>
    <button class="ghost danger small" data-action="p-quit" style="margin-top:8px">Quit without saving</button>`;
}

function resultView(rid) {
  const t = S.attempts.find(x => x.id === rid);
  if (!t) return '<p class="empty">Test not found.</p><a class="btn" href="#practice">Back</a>';
  const sc = score(t);
  setHeader('Result', `${fmt(t.date)} · ${t.mode}`);
  const subj = {};
  for (const id of t.ids) {
    const q = QBY[id]; if (!q) continue;
    const x = (subj[q.s] ||= { n: 0, ok: 0, wrong: 0 }); x.n++;
    if (t.ans[id] === q.a) x.ok++; else if (t.ans[id] !== undefined) x.wrong++;
  }
  const wrongIds = t.ids.filter(id => t.ans[id] !== undefined && t.ans[id] !== QBY[id]?.a);
  const skipIds = t.ids.filter(id => t.ans[id] === undefined);
  const qcard = (id, cls) => { const q = QBY[id]; if (!q) return ''; const mine = t.ans[id];
    return `<div class="card ${cls}"><span class="tag">${esc(q.s.split(' /')[0])} · ${esc(q.t)}</span>
      <p style="margin-top:8px;white-space:pre-wrap">${esc(q.q)}</p>
      ${mine !== undefined ? `<p class="small">Your answer: ${letter(t, id, mine)}) ${esc(q.o[mine])}</p>` : ''}
      <p class="small"><b>Correct: ${letter(t, id, q.a)}) ${esc(q.o[q.a])}</b></p>
      ${q.e ? `<p class="muted small">${esc(q.e)}</p>` : ''}</div>`; };
  return `
    <div class="stats">
      <div class="stat"><b>${sc.marks}</b><span>marks / ${sc.total}</span></div>
      <div class="stat"><b>${sc.ok}</b><span>right · ${sc.wrong} wrong</span></div>
      <div class="stat"><b>${mmss(t.secs)}</b><span>time · ${sc.skip} skipped</span></div>
    </div>
    <div class="card"><h3>By subject</h3>${Object.entries(subj).map(([s, x]) => `<div style="margin:8px 0">
      <div class="row between small"><span>${esc(s)}</span><span class="muted">${x.ok}/${x.n} right${x.wrong ? ` · ${x.wrong} wrong` : ''}</span></div>
      <div class="progress"><i style="width:${pct(x.ok, x.n)}%"></i></div></div>`).join('')}</div>
    ${wrongIds.length ? `<h2>Wrong (${wrongIds.length}), now in Mistakes</h2>${wrongIds.map(id => qcard(id, 'warn')).join('')}` : ''}
    ${skipIds.length ? `<details><summary>Skipped (${skipIds.length})</summary>${skipIds.map(id => qcard(id, '')).join('')}</details>` : ''}
    <div class="row" style="margin-top:12px"><a class="btn primary" href="#practice">Back to Practice</a>
      ${wrongIds.length ? `<button data-action="p-retry" data-id="${esc(t.id)}">Retry the wrong ones</button>` : ''}</div>`;
}

function patternsView() {
  setHeader('Patterns', PATTERNS.source);
  return `<p class="muted small">${esc(PATTERNS.note)}</p>
    ${PATTERNS.papers?.length ? `<h2>How the papers are made</h2>${PATTERNS.papers.map(p => { const tot = p.mix.reduce((a, m) => a + m[1], 0);
      return `<div class="card"><div class="row between"><h3>${esc(p.name)}</h3><span class="muted small">${esc(p.info)}</span></div>
        ${p.mix.map(([s, n]) => `<div style="margin-top:6px"><div class="row between small"><span>${esc(s)}</span><span class="muted">${n}</span></div>
        <div class="progress"><i style="width:${pct(n, tot)}%"></i></div></div>`).join('')}</div>`; }).join('')}` : ''}
    ${PATTERNS.insights?.length ? `<h2>What this means for you</h2><div class="card"><ul class="plain small">${PATTERNS.insights.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
    ${PATTERNS.subjects.length ? '<h2 style="margin-top:26px">Most-asked topics by subject</h2><p class="muted small">Number of BCS preliminary questions (10th–50th) on each topic, and its share of that subject.</p>' : ''}
    ${PATTERNS.subjects.map(s => `<details class="card"><summary>${esc(s.name)} <span class="muted small">${s.total ? s.total + ' questions' : ''}</span></summary>
      <div style="margin-top:8px"><p class="small muted">${esc(s.summary)}</p>
      <ul class="plain small">${s.topics.map(t => `<li><div class="row between"><b>${esc(t.name)}</b><span class="tag">${t.n ? t.n + ' Q · ' : ''}${t.share}%</span></div>
        <div class="progress" style="margin:4px 0"><i style="width:${Math.min(100, t.share * 3)}%"></i></div>
        ${t.tip ? `<span class="muted">${esc(t.tip)}</span>` : ''}</li>`).join('')}</ul></div></details>`).join('')}
    ${PATTERNS.repeats?.length ? `<h2>Asked again and again</h2><p class="muted small">The same question in several BCS papers. These are high-value: learn them all.</p><div class="card"><ul class="plain small">${PATTERNS.repeats.map(r =>
      `<li><div class="row between"><span>${esc(r.q)}</span><span class="tag">${r.n} BCS</span></div><span class="muted">${esc(r.a)}</span></li>`).join('')}</ul></div>` : ''}
    <a class="btn" href="#practice">Back to Practice</a>`;
}

const PRACTICE = {
  views: {
    practice(sub) {
      if (sub === 'test') return testView();
      if (sub === 'patterns') return patternsView();
      if (sub && sub.startsWith('r-')) return resultView(sub.slice(2));
      if (S.test) return `<div class="card accent"><h3>Test in progress</h3><p class="small">${esc(S.test.mode)} · ${Object.keys(S.test.ans).length} of ${S.test.ids.length} answered</p>
        <a class="btn primary" href="#practice/test">Continue</a></div>` + practiceHome();
      return practiceHome();
    },
  },
  actions: {
    'p-mock'() {
      if (S.test && !confirm('Discard the test in progress?')) return;
      const ids = MOCK_MIX.flatMap(([s, n]) => pick(QUESTIONS.filter(q => q.s === s), n).map(q => q.id));
      startTest('Full mock', ids, MOCK_MINS);
    },
    'p-subj'(el) { pf = { s: el.dataset.v, t: '' }; render(); },
    'p-quick'() {
      if (S.test && !confirm('Discard the test in progress?')) return;
      pf.t = $('#p-topic').value;
      const pool = QUESTIONS.filter(q => (pf.s === 'All' || q.s === pf.s) && (!pf.t || q.t === pf.t));
      if (!pool.length) return toast('No questions for that choice yet');
      const n = Math.min(QUICK_N, pool.length);
      startTest(pf.t || (pf.s === 'All' ? 'Quick quiz' : pf.s + ' quiz'), pick(pool, n).map(q => q.id), Math.ceil(n * 0.6));
    },
    'p-weak'() {
      const st = topicStats();
      const weak = Object.entries(st).filter(([k, x]) => k.includes(' › ') && x.n >= 3)
        .sort((a, b) => a[1].ok / a[1].n - b[1].ok / b[1].n).slice(0, 4).map(([k]) => k);
      const pool = QUESTIONS.filter(q => weak.includes(q.s + ' › ' + q.t));
      startTest('Weak topics', pick(pool, Math.min(QUICK_N, pool.length)).map(q => q.id), 12);
    },
    'p-ans'(el) { const t = S.test; t.ans[t.ids[t.i]] = +el.dataset.v; save(); render(); },
    'p-clear'() { const t = S.test; delete t.ans[t.ids[t.i]]; save(); render(); },
    'p-flag'() { const t = S.test, id = t.ids[t.i]; t.flag[id] = !t.flag[id]; save(); render(); },
    'p-go'(el) { const i = +el.dataset.v; if (i < 0 || i >= S.test.ids.length) return; S.test.i = i; save(); render(); window.scrollTo(0, 0); },
    'p-submit'() {
      const left = S.test.ids.length - Object.keys(S.test.ans).length;
      if (left && !confirm(`${left} question${left > 1 ? 's' : ''} not answered. Submit anyway?`)) return;
      finishTest();
    },
    'p-quit'() { if (!confirm('Quit this test? Nothing will be saved.')) return; S.test = null; save(); location.hash = 'practice'; },
    'p-retry'(el) {
      const t = S.attempts.find(x => x.id === el.dataset.id);
      const ids = t.ids.filter(id => t.ans[id] !== undefined && t.ans[id] !== QBY[id]?.a);
      startTest('Retry wrong', shuffle(ids), Math.max(5, Math.ceil(ids.length * 0.6)));
    },
    'p-neg'(el) { S.neg = +el.value; save(); render(); },
    'p-subj30'(el) {
      if (S.test && !confirm('Discard the test in progress?')) return;
      const subj = el.dataset.v, week = Math.max(1, planDay().week);
      startTest(subjTestMode(subj, week), subjectTestIds(subj, week), SUBJ_MINS);
    },
  },
};

// Running test clock; auto-submits at zero.
setInterval(() => {
  const el = document.getElementById('ptimer');
  if (!el || !S.test) return;
  const left = S.test.limit - Math.round((Date.now() - S.test.start) / 1000);
  el.textContent = mmss(left); el.classList.toggle('low', left <= 300);
  if (left <= 0) { toast("Time's up! Test submitted."); finishTest(); }
}, 1000);
