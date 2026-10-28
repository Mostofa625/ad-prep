// Exams tab: real past papers (PAST_PAPERS in pastpapers.js) as timed exams, in the original order, with the paper's
// own time and negative marking. Uses the Practice test engine (test screen, result, wrong answers to Mistakes).
// Loaded after practice.js and before app.js, which merges PRACTICE.views/actions.
(function () {
  const paperAttempts = p => S.attempts.filter(a => a.paper === p.id);
  PRACTICE.views.exams = function () {
    setHeader('Exams', 'Real past papers, timed');
    const neg = p => p.neg ?? (S.neg ?? 0.25);
    return `${S.test ? `<div class="card accent"><h3>Test in progress</h3><p class="small">${esc(S.test.mode)} · ${Object.keys(S.test.ans).length} of ${S.test.ids.length} answered</p>
        <a class="btn primary" href="#practice/test">Continue</a></div>` : ''}
      <p class="small muted">Sit each paper like the real exam: same questions and order, the same time, the same negative marking.
      Wrong answers go to Mistakes. Each question's explanation names the paper.</p>
      ${PAST_PAPERS.map(p => {
        const tries = paperAttempts(p).map(a => ({ a, sc: score(a) }));
        const best = tries.length ? Math.max(...tries.map(x => x.sc.marks)) : null;
        const last = tries[tries.length - 1];
        return `<div class="card">
          <h3>${esc(p.name)}</h3>
          <p class="small">${fmt(p.date, { day: 'numeric', month: 'short', year: 'numeric' })} · ${p.ids.length} MCQ · ${p.mins} min · −${neg(p)} per wrong answer</p>
          <p class="small muted">${esc(p.note)}</p>
          ${tries.length ? `<p class="small">Best <b>${best}</b> / ${p.ids.length} · ${tries.length} attempt${tries.length > 1 ? 's' : ''}
            · last <a href="#practice/r-${last.a.id}">${last.sc.marks} (${fmt(last.a.date)})</a></p>` : '<p class="small">Not attempted yet.</p>'}
          <button class="primary" data-action="ex-start" data-v="${p.id}" ${S.test ? 'disabled' : ''}>Start ${p.mins}-minute exam</button>
        </div>`;
      }).join('')}`;
  };
  PRACTICE.actions['ex-start'] = function (el) {
    const p = PAST_PAPERS.find(x => x.id === el.dataset.v); if (!p || S.test) return;
    if (!confirm(`Start ${p.name}? ${p.ids.length} questions, ${p.mins} minutes. The timer starts now.`)) return;
    startTest('Past paper: ' + p.name, p.ids.filter(id => QBY[id]), p.mins, { keepOrder: true, neg: p.neg ?? undefined, paper: p.id });
  };
})();
