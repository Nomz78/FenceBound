# Next: Ship item 5 — Hide developer content

Owner directive 2026-11-22 (ship mode): 30 days to a version a contractor can use and buy. Plain language,
one recommendation per decision, one ship item per session, one developer-log line per session.

## Current state
- Items 1–3 done (`314b006`, `9940b1d`, `4c8457d`, `e1574dd`): bundled jsPDF, "Get set up" card, "Start a quote" card.
- Item 4 done (the "Ship item 4" commit on this branch): Clear and opening a saved job warn when the current job
  is not in Saved Jobs (`hasUnsavedWork`, `unsavedWorkNote`, next to `saveSession` in `index.html`); failed
  autosave / Save / job delete show an error toast pointing to Export .json. Test
  `tests/data-loss-protection.spec.js` (7). Closing the tab was already safe: the session autosaves on
  `pagehide`/`visibilitychange` and restores on open, so no `beforeunload` prompt was added.
- Gate: `npm ci`, then `PW_CHROMIUM=/opt/pw-browsers/chromium npx playwright test` (312 passed) and
  `PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/cad-persistence-matrix.js` (exit 0).
- Still open, owner questions (do not change pricing): walk gate prints "incl. / Included" with no price.
  Cosmetic: "Privacy Installation" vs "Wood Privacy"; validation modal is dark on light theme. Not yet checked on a phone.

## Ship list
5. Hide developer content — a contractor never sees developer tools. Done when: `fb-dev-btn` and the DEV INDEX
   are not shown in the normal app (still reachable for the owner, e.g. by a URL flag), with a test. Start by
   symbol search for `fb-dev-btn`, `DEV INDEX`.
6. Hosting (Cloudflare Pages/Netlify, private repo; ship `lib/`). 7. Demo job + one-page guide.

## Branch
Start from and push to `claude/great-brown-fr03ka`.
