// Study tab: short notes per topic (notes.js) with a practice button that draws from the question bank.
// Loaded after practice.js (uses startTest/pick) and before app.js, which merges STUDY.views/actions.
const NOTE_BY_ID = Object.fromEntries(NOTES.map(n => [n.id, n]));
const NOTE_Q = 20;
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

function notesFor(subj, topics) { return NOTES.filter(n => n.s === subj && topics.includes(n.t)); }

function studyHome() {
  setHeader('Study', 'Short notes, then practice');
  const subjects = ['Bangla', 'English', 'ICT / Mental ability', 'GK', 'Math'];
  const read = S.read || {};
  let html = '<p class="muted small">One note is about a phone screen. Read it, then take the 20-question practice on that topic.</p>';
  for (const subj of subjects) {
    const list = NOTES.filter(n => n.s === subj);
    html += `<h2>${esc(subj)}</h2>`;
    if (!list.length) { html += '<p class="muted small">Notes coming soon.</p>'; continue; }
    html += list.map(n => `<a class="card row between" href="#study/${esc(n.id)}" style="text-decoration:none;color:inherit">
      <span class="grow"><b>${esc(n.title)}</b><br><span class="muted small">${n.mins} min read</span></span>
      ${read[n.id] ? '<span class="tag">read</span>' : ''}</a>`).join('');
  }
  return html;
}

function noteView(n) {
  setHeader(n.title, `${n.s} · ${n.mins} min`);
  const read = !!(S.read || {})[n.id];
  const count = QUESTIONS.filter(q => q.s === n.s && q.t === n.t).length;
  return `<a class="muted small" href="#study">← All notes</a>
    ${n.sections.map(sec => `<div class="card"><h3>${esc(sec.h)}</h3><ul class="plain small">${sec.list.map(x => `<li>${rich(x)}</li>`).join('')}</ul></div>`).join('')}
    ${n.traps?.length ? `<div class="card accent"><h3>Exam traps</h3><ul class="plain small">${n.traps.map(x => `<li>${rich(x)}</li>`).join('')}</ul></div>` : ''}
    ${n.quick?.length ? `<div class="card"><h3>Quick revision</h3><ul class="plain small">${n.quick.map(([a, b]) => `<li><b>${esc(a)}</b> — ${esc(b)}</li>`).join('')}</ul></div>` : ''}
    <div class="row" style="gap:8px;margin-top:8px">
      <button class="primary grow" data-action="st-quiz" data-id="${esc(n.id)}">Practice ${Math.min(NOTE_Q, count)} questions</button>
      <button data-action="st-read" data-id="${esc(n.id)}">${read ? 'Mark unread' : 'Mark read'}</button>
    </div>`;
}

const STUDY = {
  views: {
    study(sub) {
      const n = NOTE_BY_ID[sub];
      return n ? noteView(n) : studyHome();
    },
  },
  actions: {
    'st-read'(el) { S.read = { ...(S.read || {}) }; S.read[el.dataset.id] = !S.read[el.dataset.id]; save(); render(); },
    'st-quiz'(el) {
      const n = NOTE_BY_ID[el.dataset.id]; if (!n) return;
      if (S.test && !confirm('Discard the test in progress?')) return;
      const pool = QUESTIONS.filter(q => q.s === n.s && q.t === n.t);
      if (!pool.length) return toast('No questions for this topic yet');
      const k = Math.min(NOTE_Q, pool.length);
      startTest('Topic: ' + n.title, pick(pool, k).map(q => q.id), Math.ceil(k * 0.6));
    },
  },
};
