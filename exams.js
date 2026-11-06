// Exams tab: real past papers (PAST_PAPERS in pastpapers.js) as timed exams, in the original order, with the paper's
// own time and negative marking. Uses the Practice test engine (test screen, result, wrong answers to Mistakes).
// Loaded after practice.js and before app.js, which merges PRACTICE.views/actions.
(function () {
  const paperAttempts = p => S.attempts.filter(a => a.paper === p.id);
  PRACTICE.views.exams = function () {
    setHeader('Exams', 'Past papers and model tests, timed');
    const neg = p => p.neg ?? (S.neg ?? 0.25);
    return `${S.test ? `<div class="card accent"><h3>Test in progress</h3><p class="small">${esc(S.test.mode)} · ${Object.keys(S.test.ans).length} of ${S.test.ids.length} answered</p>
        <a class="btn primary" href="#practice/test">Continue</a></div>` : ''}
      <p class="small muted">Sit each paper like the real exam: same questions and order, the same time, the same negative marking.
      Wrong answers go to Mistakes. Each question's explanation names the paper.</p>
      ${[...PAST_PAPERS, ...(typeof MODEL_TESTS === 'undefined' ? [] : MODEL_TESTS)].map(p => {
        const tries = paperAttempts(p).map(a => ({ a, sc: score(a) }));
        const best = tries.length ? Math.max(...tries.map(x => x.sc.marks)) : null;
        const last = tries[tries.length - 1];
        return `${p.id === 'mt1' ? '<h2>Model tests</h2><p class="small muted">Six fixed 100-question tests in the MoD pattern, built from the checked bank with the topic mix of the real MoD and DGFI papers. No question repeats across them. One per day, then review.</p>' : ''}<div class="card">
          <h3>${esc(p.name)}</h3>
          <p class="small">${p.date ? fmt(p.date, { day: 'numeric', month: 'short', year: 'numeric' }) + ' · ' : ''}${p.ids.length} MCQ · ${p.mins} min · −${neg(p)} per wrong answer</p>
          <p class="small muted">${esc(p.note)}</p>
          ${tries.length ? `<p class="small">Best <b>${best}</b> / ${p.ids.length} · ${tries.length} attempt${tries.length > 1 ? 's' : ''}
            · last <a href="#practice/r-${last.a.id}">${last.sc.marks} (${fmt(last.a.date)})</a></p>` : '<p class="small">Not attempted yet.</p>'}
          <button class="primary" data-action="ex-start" data-v="${p.id}" ${S.test ? 'disabled' : ''}>Start ${p.mins}-minute exam</button>
        </div>`;
      }).join('')}`;
  };
  PRACTICE.actions['ex-start'] = function (el) {
    const p = [...PAST_PAPERS, ...(typeof MODEL_TESTS === 'undefined' ? [] : MODEL_TESTS)].find(x => x.id === el.dataset.v); if (!p || S.test) return;
    if (!confirm(`Start ${p.name}? ${p.ids.length} questions, ${p.mins} minutes. The timer starts now.`)) return;
    startTest((p.date ? 'Past paper: ' : '') + p.name, p.ids.filter(id => QBY[id]), p.mins, { keepOrder: true, neg: p.neg ?? undefined, paper: p.id });
  };
})();
