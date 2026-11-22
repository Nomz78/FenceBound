# Next: Ship item 7 — Demo job + one-page guide

Owner directive 2026-11-22 (ship mode): plain language, one recommendation per decision, one ship item per
session, one developer-log line per session.

## Current state
- Items 1–5 done (see `handoffs/CLAUDE-NEXT-ship6.md`).
- Item 6 code done ("Ship item 6" commit): `scripts/build-site.js` (`npm run build:site`) publishes only
  `index.html` + `lib/` to `dist/`; steps in `Docs/HOSTING.md`; test `tests/hosting-build.spec.js` (2).
  **Open, owner action:** connect Cloudflare Pages to the repo (build `npm run build:site`, output `dist`,
  branch `main`) — needs this branch merged to `main` first. Decide whether to add Cloudflare Access.
- Gate: `npm ci`, then `PW_CHROMIUM=/opt/pw-browsers/chromium npx playwright test` (317 passed) and
  `PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/cad-persistence-matrix.js` (exit 0).
- Still open owner questions from ship6 handoff (walk gate "Included", cosmetics, phone check).

## Ship list
7. Demo job + one-page guide. Done when: a new user can load a demo job in one click and a one-page guide
   takes them from blank screen to a PDF quote. Read first (symbol search in `index.html`): the Quick Quote
   front door (`tests/quick-quote-front-door.spec.js`), Saved Jobs load, portable import.

## Branch
Start from and push to `claude/great-brown-fr03ka`.
