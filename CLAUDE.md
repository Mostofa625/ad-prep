# AD Prep

Offline study PWA for Mostofa's Grade 9 Assistant Director exam prep (MoD, BEPZA, Hi-Tech Park, NSI). Plain HTML/CSS/JS, no build step, hosted on GitHub Pages at https://mostofa625.github.io/ad-prep/.

## Files
- `data.js` – all study content: plan start date, daily/Friday/Saturday/mock sessions, phases, weekly topics, default exams, essay template, argument prompts, viva questions, links. Edit content here, not in app.js.
- `app.js` – views (today, plan, mistakes, essays, more), hash routing (`#tab/sub`), actions via `data-action` attributes, localStorage state under `adprep.v1`.
- `style.css` – light/dark via `prefers-color-scheme`, mobile-first.
- `questions.js` – the MCQ bank, one `QUESTIONS` array (~5,800). Fields: `id`, `s` subject (must be one of `MOCK_MIX` in practice.js), `t` topic (match the names in `WEEK_TOPICS` so weekly tests find it), `q`, `o` (4 distinct options), `a` correct index 0–3, `e` explanation (name the exam if it is a past-paper question), `r` number of guide books it appears in (0 = not counted). Id prefixes show the source batch (`km` Khairul's Advanced Math, `ns*` NSI guide, `om` Oracle mental ability, `x*` gap-fill batch of 18 Oct 2026, etc.). Never reuse or rename an id: saved tests and mistakes refer to them. Probability and counting live under the topic `Series & sets`. Questions about Bangabandhu, Sheikh Mujib or the Awami League were removed on purpose; don't add them back.
- `practice.js` – Practice tab: quizzes, 100-question timed mocks (`MOCK_MIX`), 30-MCQ test after each subject session (`subjectTestIds`), weak-topic and most-repeated quizzes. Loaded before app.js, which merges `PRACTICE.views/actions`.
- `notes.js` (+ `notes-bn.js`, `notes-en.js`, `notes-lit.js`, `notes-ict.js`, same format, they `NOTES.push(...)`) / `study.js` – Study tab: `NOTES` (own-words topic notes: id, s, t matching the question-bank topic, sections, traps, quick) and its views/actions. Today's "This week's topics" card links to notes whose `t` is in that week's Bangla topics. Notes must be written in my own words, not copied from books. The Practice button on a note draws 20 questions from its `t`. Add the id to `NOTES` only; no other file needs editing. Read state is `S.read`.
- `patterns.js` – `PATTERNS`: topic counts from past BCS/AD papers, shown in the Practice tab.
- `sw.js` – network-first cache. **Bump `VERSION` whenever any cached file changes.**

## Behaviour worth knowing
- Plan starts Sunday 2026-10-18, 12 weeks (Sun–Sat). Fri = mock, Sat = written + revision.
- Weeks 11–12, or within 14 days of any exam with a date, switch to alternating mock/review days; the day before an exam is light revision.
- Mistakes use Leitner boxes (1, 2, 4, 8, 16, 32 days); "wrong" resets to box 1 and re-queues in-session.
- `?d=YYYY-MM-DD` in the URL fakes today's date for checking future days.
- All user text must go through `esc()` before being put in innerHTML.

## Testing
Serve with `python3 -m http.server <port>` (8765 is taken on this machine by Speedtest Tracker) and check at 390px width in both colour schemes.
Before adding questions, check them: 4 distinct options, valid `a`, no duplicate of an existing question, and for math, compute the answer rather than trusting the source.
