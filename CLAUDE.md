# AD Prep

Offline study PWA for Mostofa's Grade 9 Assistant Director exam prep (MoD, BEPZA, Hi-Tech Park, NSI). Plain HTML/CSS/JS, no build step, hosted on GitHub Pages at https://mostofa625.github.io/ad-prep/.

## Files
- `data.js` – all study content: plan start date, daily/Friday/Saturday/mock sessions, phases, weekly topics, default exams, essay template, argument prompts, viva questions, links. Edit content here, not in app.js.
- `app.js` – views (today, plan, mistakes, essays, more), hash routing (`#tab/sub`), actions via `data-action` attributes, localStorage state under `adprep.v1`.
- `style.css` – light/dark via `prefers-color-scheme`, mobile-first.
- `sw.js` – network-first cache. **Bump `VERSION` whenever any cached file changes.**

## Behaviour worth knowing
- Plan starts Sunday 2026-10-18, 12 weeks (Sun–Sat). Fri = mock, Sat = written + revision.
- Weeks 11–12, or within 14 days of any exam with a date, switch to alternating mock/review days; the day before an exam is light revision.
- Mistakes use Leitner boxes (1, 2, 4, 8, 16, 32 days); "wrong" resets to box 1 and re-queues in-session.
- `?d=YYYY-MM-DD` in the URL fakes today's date for checking future days.
- All user text must go through `esc()` before being put in innerHTML.

## Testing
Serve with `python3 -m http.server <port>` (8765 is taken on this machine by Speedtest Tracker) and check at 390px width in both colour schemes.
