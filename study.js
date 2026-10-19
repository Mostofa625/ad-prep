// Study tab: short notes per topic (notes.js) with a practice button that draws from the question bank.
// Loaded after practice.js (uses startTest/pick) and before app.js, which merges STUDY.views/actions.
const NOTE_BY_ID = Object.fromEntries(NOTES.map(n => [n.id, n]));
const NOTE_Q = 20;
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/==(.+?)==/g, '<mark>$1</mark>');
const stars = n => '★'.repeat(n) + '☆'.repeat(Math.max(0, 3 - n));

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
      <span class="grow"><b>${esc(n.title)}</b><br><span class="muted small">${n.mins} min read${n.weight?.asked != null ? ` · ${n.weight.asked} past questions` : ''}</span></span>
      ${n.weight?.priority === 'High' ? '<span class="tag warn">focus</span>' : ''}
      ${read[n.id] ? '<span class="tag">read</span>' : ''}</a>`).join('');
  }
  return html;
}


// v2 notes: weight, focus, typed parts with tables, memory tricks and a revision grid.
function noteViewV2(n) {
  setHeader(n.title, `${n.s} · ${n.mins} min`);
  const read = !!(S.read || {})[n.id];
  const count = QUESTIONS.filter(q => q.s === n.s && q.t === n.t).length;
  const w = n.weight || {};
  const max = Math.max(1, ...((w.parts || []).map(p => p[1])));
  const pri = { High: 'warn', Medium: '', Low: '' }[w.priority] ?? '';
  let html = `<a class="muted small" href="#study">← All notes</a>`;
  if (w.asked != null || w.why) {
    html += `<div class="card wt"><div class="row between"><b>How much is asked</b>${w.priority ? `<span class="tag ${pri}">${esc(w.priority)} priority</span>` : ''}</div>
      ${w.asked != null ? `<p class="wtnum"><span>${w.asked}</span> of ${w.of} questions <span class="muted">(${w.share}%) · ${esc(w.label)}</span></p>` : (w.label ? `<p class="muted small" style="margin:4px 0">${esc(w.label)}</p>` : '')}
      ${w.parts?.length ? `<div class="bars">${w.parts.map(([name, c]) => `<div class="bar"><span class="bl">${esc(name)}</span><span class="bt"><i style="width:${Math.max(4, c / max * 100)}%"></i></span><span class="bn">${c}</span></div>`).join('')}</div>` : ''}
      ${w.why ? `<p class="small" style="margin:8px 0 0">${rich(w.why)}</p>` : ''}</div>`;
  }
  if (n.focus?.length) html += `<div class="card focus"><h3>🎯 Where to focus</h3><ol class="small">${n.focus.map(x => `<li>${rich(x)}</li>`).join('')}</ol></div>`;
  for (const p of n.parts || []) {
    html += `<div class="card part"><div class="row between"><h3 class="grow">${esc(p.h)}</h3>${p.asked != null ? `<span class="tag">asked ${p.asked}×</span>` : ''}${p.stars ? `<span class="stars" title="importance">${stars(p.stars)}</span>` : ''}</div>`;
    if (p.intro) html += `<p class="small">${rich(p.intro)}</p>`;
    if (p.table) html += `<div class="tblwrap"><table class="nt${p.table[0].length >= 3 ? ' stack' : ''}"><thead><tr>${p.table[0].map(c => `<th>${rich(c)}</th>`).join('')}</tr></thead><tbody>${p.table.slice(1).map(r => `<tr>${r.map((c, i) => `<td data-l="${i ? esc(p.table[0][i]) : ''}">${rich(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
    if (p.points?.length) html += `<ul class="pts small">${p.points.map(x => `<li>${rich(x)}</li>`).join('')}</ul>`;
    if (p.examples?.length) html += `<div class="exs small">${p.examples.map(([a, b]) => `<div class="ex"><span class="ok">✔</span> ${rich(a)}${b ? `<span class="muted"> — ${rich(b)}</span>` : ''}</div>`).join('')}</div>`;
    if (p.wrong?.length) html += `<div class="exs small">${p.wrong.map(([a, b]) => `<div class="ex"><span class="bad">✘</span> <s>${rich(a)}</s> → ${rich(b)}</div>`).join('')}</div>`;
    if (p.memo) html += `<div class="memo small">💡 ${rich(p.memo)}</div>`;
    if (p.traps?.length) html += `<div class="trap small"><b>Watch out</b><ul>${p.traps.map(x => `<li>${rich(x)}</li>`).join('')}</ul></div>`;
    html += `</div>`;
  }
  if (n.revise?.length) html += `<div class="card"><h3>⚡ One-minute revision</h3><div class="rev">${n.revise.map(([a, b]) => `<div><b>${rich(a)}</b><span>${rich(b)}</span></div>`).join('')}</div></div>`;
  html += `<div class="row" style="gap:8px;margin-top:8px">
      <button class="primary grow" data-action="st-quiz" data-id="${esc(n.id)}">Practice ${Math.min(NOTE_Q, count)} questions</button>
      <button data-action="st-read" data-id="${esc(n.id)}">${read ? 'Mark unread' : 'Mark read'}</button></div>`;
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
      return n ? (n.v === 2 ? noteViewV2(n) : noteView(n)) : studyHome();
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
