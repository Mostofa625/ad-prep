// AD Prep: single-file app logic. All user data is kept in localStorage under KEY.
'use strict';

const KEY = 'adprep.v1';
const BOXES = [1, 2, 4, 8, 16, 32]; // Leitner review intervals in days
const ESSAY_MINS = 30;

// ---------- storage ----------
function blank() {
  return { checks: {}, mistakes: [], essays: [], exams: DEFAULT_EXAMS.map(e => ({ ...e })), viva: {}, scores: [], draft: { prompt: 0, text: '' }, attempts: [], test: null, neg: 0.25 };
}
let S = load();
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...blank(), ...JSON.parse(raw) };
  } catch (e) { /* storage blocked or corrupt: start fresh */ }
  return blank();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { toast('Could not save. Is storage full or blocked?'); }
}

// ---------- dates ----------
const pad = n => String(n).padStart(2, '0');
const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const diff = (a, b) => Math.round((parse(b) - parse(a)) / 86400000); // days from a to b
const fmt = (s, opts = { day: 'numeric', month: 'short' }) => parse(s).toLocaleDateString('en-GB', opts);
// ?d=YYYY-MM-DD in the URL pretends it is that day (for checking the plan ahead).
const TODAY = (new URLSearchParams(location.search).get('d') || '').match(/^\d{4}-\d{2}-\d{2}$/)
  ? new URLSearchParams(location.search).get('d') : iso(new Date());

function planDay(date = TODAY) {
  const idx = diff(PLAN_START, date);
  const week = Math.floor(idx / 7) + 1;
  const phase = PHASES.find(p => week >= p.from && week <= p.to);
  return { idx, week, phase };
}

function nextExam(date = TODAY) {
  return S.exams.filter(e => e.date && e.date >= date).sort((a, b) => a.date.localeCompare(b.date))[0];
}

// What to do on a given date, and why.
function sessionsFor(date = TODAY) {
  const { idx, week } = planDay(date);
  const dow = parse(date).getDay(); // 0 Sun … 5 Fri, 6 Sat
  const exam = nextExam(date);
  const examSoon = exam && diff(date, exam.date) <= 14;
  if (idx >= 0 && (week >= 11 || examSoon)) {
    if (exam && diff(date, exam.date) === 0) return { kind: 'Exam day', list: [], note: `${exam.name}: good luck!` };
    if (exam && diff(date, exam.date) === 1) return { kind: 'Day before exam', list: [
      { id: 'light', label: 'Light revision only: formulas, GK notes, essay template', mins: 90 },
      { id: 'docs', label: 'Prepare admit card, pen, ID; check exam centre route', mins: 20 },
    ], note: 'No new topics. Sleep early.' };
    const why = examSoon ? `${exam.name} in ${diff(date, exam.date)} days` : week > PLAN_WEEKS ? 'Plan finished: keep the mock routine' : 'Weeks 11–12';
    return idx % 2 === 0
      ? { kind: 'Mock day', list: MOCK_DAY, note: why }
      : { kind: 'Review day', list: REVIEW_DAY, note: why };
  }
  if (dow === 5) return { kind: 'Friday mock', list: FRIDAY, note: 'Full timed paper, then log mistakes.' };
  if (dow === 6) return { kind: 'Written + revision', list: SATURDAY, note: 'Essay practice and weekly revision.' };
  return { kind: 'Study day', list: DAILY, note: '' };
}

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const $ = sel => document.querySelector(sel);
const words = t => (t.trim().match(/\S+/g) || []).length;
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast'; el.textContent = msg; el.setAttribute('role', 'status');
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2200);
}
const dueCards = () => S.mistakes.filter(m => m.due <= TODAY);
function streak() {
  let n = 0, d = TODAY;
  const doneOn = day => { const c = S.checks[day]; return c && Object.values(c).some(Boolean); };
  if (!doneOn(d)) d = addDays(d, -1); // today not started yet doesn't break the streak
  while (doneOn(d)) { n++; d = addDays(d, -1); }
  return n;
}

// After a subject session is ticked on a study day: offer its 30-MCQ test, or show today's score.
function subjTestRow(x, checks, week) {
  const subj = SESSION_SUBJECT[x.id];
  if (!subj || !checks[x.id] || sessionsFor().list !== DAILY) return '';
  const mode = subjTestMode(subj, Math.max(1, week));
  const done = S.attempts.filter(t => t.mode === mode && t.date === TODAY).pop();
  if (done) { const sc = score(done);
    return `<div class="subjtest small"><a href="#practice/r-${esc(done.id)}">30-MCQ test: ${sc.marks} / ${sc.total}</a>
      <button data-action="p-subj30" data-v="${esc(subj)}">Retake</button></div>`; }
  return `<div class="subjtest small"><span class="muted">${esc(subj)} done. Check yourself:</span>
    <button class="primary" data-action="p-subj30" data-v="${esc(subj)}">30-MCQ test</button></div>`;
}

// ---------- views ----------
const views = {};

views.today = () => {
  const { idx, week, phase } = planDay();
  const s = sessionsFor();
  const checks = S.checks[TODAY] || {};
  const total = s.list.reduce((a, x) => a + x.mins, 0);
  const done = s.list.filter(x => checks[x.id]).reduce((a, x) => a + x.mins, 0);
  const exam = nextExam();
  const due = dueCards().length;
  setHeader('Today', fmt(TODAY, { weekday: 'long', day: 'numeric', month: 'long' }));

  let html = '';
  if (idx < 0) {
    html += `<div class="card accent"><h3>Plan starts ${fmt(PLAN_START, { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
      <p class="small">${-idx} day${idx === -1 ? '' : 's'} to go. Add a few mistakes or try an essay to get familiar with the app.</p></div>`;
  } else if (week <= PLAN_WEEKS) {
    html += `<p class="muted">Week ${week} of ${PLAN_WEEKS} · ${esc(phase.name)} · ${esc(s.kind)}${s.note ? ' · ' + esc(s.note) : ''}</p>`;
  } else {
    html += `<p class="muted">12-week plan finished · ${esc(s.kind)}${s.note ? ' · ' + esc(s.note) : ''}</p>`;
  }

  html += `<div class="stats">
    <div class="stat"><b>${total ? Math.round(done / total * 100) : 0}%</b><span>today done</span></div>
    <a class="stat" href="#mistakes" style="text-decoration:none;color:inherit"><b>${due}</b><span>cards due</span></a>
    <div class="stat"><b>${exam ? diff(TODAY, exam.date) : '–'}</b><span>${exam ? 'days to ' + esc(exam.name.split(' – ')[0]) : 'no exam date yet'}</span></div>
  </div>`;

  if (idx >= 0 && s.list.length) {
    html += `<div class="card"><div class="row between"><h3>Sessions</h3><span class="muted">${Math.round(done / 60 * 10) / 10} / ${Math.round(total / 60 * 10) / 10} h</span></div>
      <div class="progress" style="margin:6px 0 4px"><i style="width:${total ? done / total * 100 : 0}%"></i></div>
      ${s.list.map(x => `<label class="check ${checks[x.id] ? 'done' : ''}">
        <input type="checkbox" data-action="check" data-id="${x.id}" ${checks[x.id] ? 'checked' : ''}>
        <span class="label">${esc(x.label)}</span><span class="mins">${x.mins}m</span></label>${subjTestRow(x, checks, week)}`).join('')}
    </div>`;
  } else if (s.kind === 'Exam day') {
    html += `<div class="card accent"><h3>Exam day</h3><p>${esc(s.note)}</p></div>`;
  }

  if (idx >= 0 && week <= PLAN_WEEKS && s.list === DAILY) {
    const t = WEEKS[week - 1];
    html += `<div class="card"><h3>This week's topics</h3><ul class="plain small">
      <li><b>English:</b> ${esc(t[0])}</li><li><b>Math:</b> ${esc(t[1])}</li>
      <li><b>GK:</b> ${esc(t[2])}</li><li><b>Bangla:</b> ${esc(t[3])}</li></ul>
      ${['English', 'Bangla'].flatMap(sub => notesFor(sub, WEEK_TOPICS[Math.min(week, WEEK_TOPICS.length) - 1][sub])).map(n => `<a class="btn" href="#study/${esc(n.id)}" style="margin:6px 6px 0 0">Note: ${esc(n.title)}</a>`).join('')}</div>`;
  }

  if (s.list.some(x => x.id === 'mock')) {
    const mine = S.scores.find(x => x.date === TODAY);
    html += `<div class="card"><h3>Mock score</h3><div class="row">
      <input type="text" inputmode="decimal" id="score" placeholder="e.g. 62.5" value="${mine ? mine.score : ''}" style="max-width:120px">
      <span class="muted">/ 100</span><button data-action="score">Save</button></div>
      <p class="muted small" style="margin-top:6px">Log every wrong answer in Mistakes before you finish.</p></div>`;
  }

  if (due) html += `<a class="btn primary" href="#mistakes/review" style="width:100%;justify-content:center">Review ${due} mistake card${due > 1 ? 's' : ''}</a>`;
  html += `<p class="muted small" style="margin-top:14px">Streak: ${streak()} day${streak() === 1 ? '' : 's'}</p>`;
  return html;
};

views.plan = () => {
  const { week } = planDay();
  setHeader('Plan', `${fmt(PLAN_START)} – ${fmt(addDays(PLAN_START, PLAN_WEEKS * 7 - 1), { day: 'numeric', month: 'short', year: 'numeric' })}`);
  let html = `<div class="card small">
    <p><b>Daily (Sun–Thu):</b> ${DAILY.map(x => `${esc(x.label.split(' (')[0])} ${x.mins}m`).join(' · ')}</p>
    <p><b>Friday:</b> full timed 100-MCQ mock, then mark it and log mistakes.</p>
    <p><b>Saturday:</b> written practice (argument essay, focus writing) + weekly revision.</p>
    <p style="margin:0"><b>Exam rule:</b> once an exam has a date (More tab), the 14 days before it switch to mock every other day.</p>
  </div>`;
  for (const p of PHASES) {
    html += `<h2>Weeks ${p.from}–${p.to}: ${esc(p.name)}</h2><p class="muted small">${esc(p.note)}</p><div class="card">`;
    for (let w = p.from; w <= p.to; w++) {
      const start = addDays(PLAN_START, (w - 1) * 7);
      const t = WEEKS[w - 1];
      const cls = w === week ? 'now' : w < week ? 'past' : '';
      html += `<div class="week ${cls}"><div class="num">W${w}${w === week ? '<br><span class="tag">now</span>' : ''}</div>
        <div><div class="muted small">${fmt(start)} – ${fmt(addDays(start, 6))}</div>
        <div class="small">${t[0] === t[1] ? esc(t[0]) : `<b>En</b> ${esc(t[0])}<br><b>Ma</b> ${esc(t[1])}<br><b>GK</b> ${esc(t[2])}<br><b>Bn</b> ${esc(t[3])}`}</div></div></div>`;
    }
    html += '</div>';
  }
  html += '<h2>Mock scores</h2>';
  html += S.scores.length
    ? `<div class="card"><ul class="plain">${[...S.scores].sort((a, b) => b.date.localeCompare(a.date)).map(x =>
        `<li class="row between"><span>${fmt(x.date, { weekday: 'short', day: 'numeric', month: 'short' })}</span><b>${x.score}</b></li>`).join('')}</ul></div>`
    : '<p class="empty">No mock scores yet. Log one on Friday.</p>';
  return html;
};

let filter = 'All';
let review = null; // { queue: [ids], shown: bool }
views.mistakes = (sub) => {
  const due = dueCards();
  if (sub === 'review') {
    if (!review) review = { queue: due.map(m => m.id), shown: false, done: 0 };
    return reviewView();
  }
  review = null;
  setHeader('Mistakes', `${S.mistakes.length} cards · ${due.length} due`);
  const list = S.mistakes.filter(m => filter === 'All' || m.subject === filter).sort((a, b) => a.due.localeCompare(b.due));
  return `
    ${due.length ? `<a class="btn primary" href="#mistakes/review" style="width:100%;justify-content:center;margin-bottom:12px">Review ${due.length} due card${due.length > 1 ? 's' : ''}</a>` : '<div class="card accent small">Nothing due. Add every wrong answer from practice and mocks here.</div>'}
    <details class="card" ${S.mistakes.length ? '' : 'open'}><summary>Add a mistake</summary>
      <label class="field"><span>Subject</span><select id="m-subject">${SUBJECTS.map(s => `<option>${esc(s)}</option>`).join('')}</select></label>
      <label class="field"><span>Question (what you got wrong)</span><textarea id="m-q"></textarea></label>
      <label class="field"><span>Correct answer</span><textarea id="m-a"></textarea></label>
      <label class="field"><span>Why I got it wrong / rule to remember (optional)</span><input type="text" id="m-note"></label>
      <button class="primary" data-action="add-mistake">Add card</button>
    </details>
    <div class="chips">${['All', ...SUBJECTS].map(s => `<button class="chip ${filter === s ? 'on' : ''}" data-action="filter" data-v="${esc(s)}">${esc(s)}</button>`).join('')}</div>
    ${list.length ? list.map(m => `<div class="card">
      <div class="row between"><span class="tag">${esc(m.subject)}</span>
        <span class="muted small">${m.due <= TODAY ? '<span class="tag warn">due</span>' : 'next ' + fmt(m.due)} · box ${m.box + 1}</span></div>
      <p style="margin-top:8px;white-space:pre-wrap">${esc(m.q)}</p>
      <details><summary class="small">Answer</summary><p style="white-space:pre-wrap">${esc(m.a)}</p>${m.note ? `<p class="muted small">${esc(m.note)}</p>` : ''}</details>
      <button class="ghost danger small" data-action="del-mistake" data-id="${m.id}">Delete</button></div>`).join('')
      : '<p class="empty">No cards here yet.</p>'}`;
};

function reviewView() {
  const left = review.queue.length;
  setHeader('Review', `${left} left`);
  if (!left) {
    return `<div class="card accent"><h3>Done</h3><p>${review.done} card${review.done === 1 ? '' : 's'} reviewed. Come back tomorrow.</p></div>
      <a class="btn" href="#mistakes">Back to Mistakes</a>`;
  }
  const m = S.mistakes.find(x => x.id === review.queue[0]);
  return `<div class="card flash"><span class="tag" style="align-self:flex-start;margin-bottom:10px">${esc(m.subject)}</span>
      <div class="q">${esc(m.q)}</div>
      ${review.shown ? `<div class="a"><b>${esc(m.a)}</b>${m.note ? `<p class="muted small" style="margin-top:6px">${esc(m.note)}</p>` : ''}</div>` : ''}
    </div>
    ${review.shown
      ? `<div class="row"><button class="grow" data-action="grade" data-v="0" style="justify-content:center">✗ Wrong again</button>
         <button class="grow primary" data-action="grade" data-v="1" style="justify-content:center">✓ Got it</button></div>`
      : `<button class="primary" data-action="reveal" style="width:100%;justify-content:center">Show answer</button>`}
    <p class="muted small" style="margin-top:12px">Answer in your head (or on paper) first, then check. Wrong cards come back at the end of this session and tomorrow.</p>
    <a class="btn ghost" href="#mistakes">Stop</a>`;
}

let timer = { end: 0, left: ESSAY_MINS * 60, running: false };
views.essays = () => {
  setHeader('Essays', `${S.essays.length} written`);
  const d = S.draft;
  const p = PROMPTS[d.prompt % PROMPTS.length];
  return `
    <details class="card"><summary>Argument essay template</summary>
      <div class="template small">${TEMPLATE.map(([h, t], i) => `<p><b>${i + 1}. ${esc(h)}:</b> ${esc(t)}</p>`).join('')}</div>
      <p class="small muted">${esc(NEGATION_TIP)}</p>
    </details>
    <div class="card accent">
      <div class="row between"><h3>Prompt ${d.prompt % PROMPTS.length + 1} of ${PROMPTS.length}</h3>
        <button class="ghost small" data-action="next-prompt">Next ↻</button></div>
      <p style="margin:6px 0 0">${esc(p)}</p>
    </div>
    <div class="card"><div class="row between">
      <span id="clock" class="timer">${clock()}</span>
      <div class="row"><button id="timer-btn" class="primary" data-action="timer">${timer.running ? 'Pause' : timer.left < ESSAY_MINS * 60 ? 'Resume' : 'Start ' + ESSAY_MINS + ' min'}</button>
      <button data-action="timer-reset">Reset</button></div></div>
    </div>
    <textarea class="essay" id="essay" placeholder="Write your essay here. It saves as you type.">${esc(d.text)}</textarea>
    <div class="row between" style="margin-top:8px"><span class="muted small" id="wc">${words(d.text)} words</span>
      <button class="primary" data-action="save-essay">Save essay</button></div>
    <h2>Saved essays</h2>
    ${S.essays.length ? S.essays.slice().reverse().map(e => `<details class="card"><summary>${fmt(e.date)} · ${e.words} words · ${e.mins} min</summary>
      <p class="muted small">${esc(e.prompt)}</p><p style="white-space:pre-wrap">${esc(e.text)}</p>
      <button class="ghost danger small" data-action="del-essay" data-id="${e.id}">Delete</button></details>`).join('')
      : '<p class="empty">No essays yet. Aim for one every Saturday.</p>'}
    <h2>Class material</h2>${linksHtml(LINKS.slice(0, 1))}`;
};

function clock() {
  const s = Math.max(0, timer.running ? Math.round((timer.end - Date.now()) / 1000) : timer.left);
  return `${pad(Math.floor(s / 60))}:${pad(s % 60)}`;
}
setInterval(() => {
  if (!timer.running) return;
  const el = $('#clock');
  const s = Math.round((timer.end - Date.now()) / 1000);
  if (el) { el.textContent = clock(); el.classList.toggle('low', s <= 300); }
  if (s <= 0) {
    timer = { end: 0, left: 0, running: false };
    if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
    toast("Time's up! Finish your sentence and save.");
    const b = $('#timer-btn'); if (b) b.textContent = 'Resume';
  }
}, 500);

function linksHtml(groups) {
  return groups.map(g => `<div class="card"><h3>${esc(g.group)}</h3><ul class="plain">${g.items.map(([t, u]) =>
    `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(t)}</a></li>`).join('')}</ul></div>`).join('');
}

views.more = () => {
  setHeader('More', '');
  return `
    <h2>Exams</h2>
    <p class="muted small">Add a date when it's announced. Today's plan switches to mocks 14 days before.</p>
    ${S.exams.map(e => `<div class="card">
      <div class="row between"><h3 class="grow">${esc(e.name)}</h3>${e.date && e.date >= TODAY ? `<span class="tag">${diff(TODAY, e.date)} days</span>` : ''}</div>
      <div class="row" style="margin-top:6px">
        <input type="date" data-action="exam-date" data-id="${e.id}" value="${esc(e.date)}" style="max-width:180px">
        <input type="text" class="grow" data-action="exam-status" data-id="${e.id}" value="${esc(e.status)}" placeholder="Status" style="width:auto">
      </div></div>`).join('')}
    <details class="card"><summary>Add another exam</summary>
      <label class="field"><span>Name</span><input type="text" id="x-name" placeholder="e.g. BIWTA – AD"></label>
      <button data-action="add-exam">Add</button></details>

    <h2>Viva practice</h2>
    <p class="muted small">Say each answer out loud. Keep notes short: points, not scripts.</p>
    ${VIVA.map((q, i) => `<details class="card"><summary>${esc(q)} ${S.viva[i] ? '<span class="tag">notes</span>' : ''}</summary>
      <textarea data-action="viva" data-i="${i}" placeholder="Key points…">${esc(S.viva[i] || '')}</textarea></details>`).join('')}

    <h2>Resources</h2>${linksHtml(LINKS)}

    <h2>Backup</h2>
    <div class="card"><p class="small">Your data stays on this device only. Export a backup now and then (e.g. to Google Drive), and import it on a new phone.</p>
      <div class="row"><button data-action="export">Export backup</button>
      <label class="btn">Import backup<input type="file" accept="application/json,.json" data-action="import" hidden></label></div></div>
    <details class="card"><summary class="small">Install on your phone</summary>
      <p class="small">Android (Chrome): menu ⋮ → <b>Add to Home screen</b>. iPhone (Safari): Share → <b>Add to Home Screen</b>. It works offline after the first visit.</p></details>
    <button class="ghost danger small" data-action="reset">Erase all data on this device</button>`;
};

// ---------- routing ----------
function setHeader(t, sub) { $('#title').textContent = t; $('#subtitle').textContent = sub; }
function render() {
  const [tab, sub] = (location.hash.slice(1) || 'today').split('/');
  const view = views[tab] ? tab : 'today';
  $('#view').innerHTML = views[view](sub);
  document.querySelectorAll('.tabs a').forEach(a => a.classList.toggle('active', a.dataset.tab === view));
}
window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });

// ---------- actions ----------
const actions = {
  check(el) {
    (S.checks[TODAY] ||= {})[el.dataset.id] = el.checked;
    save(); render();
  },
  score() {
    const v = parseFloat($('#score').value);
    if (isNaN(v) || v < 0 || v > 100) return toast('Enter a score from 0 to 100');
    S.scores = S.scores.filter(x => x.date !== TODAY).concat({ date: TODAY, score: v });
    save(); toast('Score saved');
  },
  'add-mistake'() {
    const q = $('#m-q').value.trim(), a = $('#m-a').value.trim();
    if (!q || !a) return toast('Add both the question and the answer');
    S.mistakes.push({ id: uid(), subject: $('#m-subject').value, q, a, note: $('#m-note').value.trim(), box: 0, due: addDays(TODAY, 1), created: TODAY });
    save(); render(); toast('Card added. First review tomorrow.');
    $('details.card').open = true; $('#m-q').focus();
  },
  'del-mistake'(el) {
    if (!confirm('Delete this card?')) return;
    S.mistakes = S.mistakes.filter(m => m.id !== el.dataset.id); save(); render();
  },
  filter(el) { filter = el.dataset.v; render(); },
  reveal() { review.shown = true; render(); },
  grade(el) {
    const m = S.mistakes.find(x => x.id === review.queue.shift());
    if (el.dataset.v === '1') {
      m.box = Math.min(m.box + 1, BOXES.length - 1);
      m.due = addDays(TODAY, BOXES[m.box]);
      review.done++;
    } else {
      m.box = 0; m.due = addDays(TODAY, 1);
      review.queue.push(m.id); // see it again this session
    }
    review.shown = false; save(); render();
  },
  'next-prompt'() { S.draft.prompt = (S.draft.prompt + 1) % PROMPTS.length; save(); render(); },
  timer() {
    if (timer.running) { timer.left = Math.max(0, Math.round((timer.end - Date.now()) / 1000)); timer.running = false; }
    else { if (timer.left <= 0) timer.left = ESSAY_MINS * 60; timer.end = Date.now() + timer.left * 1000; timer.running = true; }
    render();
  },
  'timer-reset'() { timer = { end: 0, left: ESSAY_MINS * 60, running: false }; render(); },
  'save-essay'() {
    const text = S.draft.text.trim();
    if (!text) return toast('Write something first');
    const used = ESSAY_MINS * 60 - (timer.running ? Math.round((timer.end - Date.now()) / 1000) : timer.left);
    S.essays.push({ id: uid(), date: TODAY, prompt: PROMPTS[S.draft.prompt % PROMPTS.length], text, words: words(text), mins: Math.max(0, Math.round(used / 60)) });
    S.draft = { prompt: (S.draft.prompt + 1) % PROMPTS.length, text: '' };
    timer = { end: 0, left: ESSAY_MINS * 60, running: false };
    save(); render(); toast('Essay saved');
  },
  'del-essay'(el) {
    if (!confirm('Delete this essay?')) return;
    S.essays = S.essays.filter(e => e.id !== el.dataset.id); save(); render();
  },
  'exam-date'(el) { S.exams.find(e => e.id === el.dataset.id).date = el.value; save(); render(); },
  'exam-status'(el) { S.exams.find(e => e.id === el.dataset.id).status = el.value; save(); },
  'add-exam'() {
    const name = $('#x-name').value.trim();
    if (!name) return toast('Enter the exam name');
    S.exams.push({ id: uid(), name, date: '', status: 'Applied' }); save(); render();
  },
  viva(el) { S.viva[el.dataset.i] = el.value; save(); },
  export() {
    const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `ad-prep-backup-${TODAY}.json`;
    a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  },
  import(el) {
    const f = el.files[0]; if (!f) return;
    f.text().then(t => {
      const data = JSON.parse(t);
      if (!data || !Array.isArray(data.mistakes)) throw new Error('bad');
      if (!confirm('Replace everything on this device with this backup?')) return;
      S = { ...blank(), ...data }; save(); render(); toast('Backup restored');
    }).catch(() => toast('That file is not an AD Prep backup'));
  },
  reset() {
    if (!confirm('Erase ALL progress, cards and essays on this device? Export a backup first.')) return;
    S = blank(); save(); render(); toast('Erased');
  },
};
Object.assign(views, PRACTICE.views, STUDY.views);
Object.assign(actions, PRACTICE.actions, STUDY.actions);

document.addEventListener('click', e => {
  const el = e.target.closest('[data-action]');
  if (!el || el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') return;
  actions[el.dataset.action]?.(el);
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.matches('input[type=checkbox], input[type=radio], input[type=date], input[type=file], select[data-action]')) actions[el.dataset.action]?.(el);
  else if (el.matches('[data-action=exam-status]')) actions['exam-status'](el);
});
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'essay') { S.draft.text = el.value; save(); $('#wc').textContent = `${words(el.value)} words`; }
  else if (el.dataset.action === 'viva') actions.viva(el);
});

render();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
