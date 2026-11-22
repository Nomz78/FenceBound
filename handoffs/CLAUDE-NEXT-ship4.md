# Next: Ship item 4 — Data-loss protection

Owner directive 2026-11-22 (ship mode): 30 days to a version a contractor can use and buy. Plain language,
one recommendation per decision, one ship item per session, one developer-log line per session.

## Current state
- Item 1 done (`314b006`, `9940b1d`): jsPDF bundled at `lib/`, Quick Quote auto-fits.
- Item 2 done (`4c8457d`): "Get set up" card (`renderSetupSteps`).
- Item 3 done (see the "Ship item 3" commit on this branch): "Start a quote" card `#front-door`
  (`renderFrontDoor`, right after `renderSetupSteps` in `index.html`). On an empty drawing it asks for
  customer, address, fence type, height, sides, shape, gates; "Price this job" builds via
  `buildTypedLayoutFromForm('fd')` (the builder now takes an id prefix; the JOB drawer passes `'qq'`), then
  the card shows "QUOTE READY — $total" with "Download estimate PDF". On first open the card is one line ("Start a quote", `#fd-start`) because the full form pushed panel buttons out of reach; "Draw it instead" / "Done" hide it
  for the session (`_fdState`, not persisted). Test `tests/quick-quote-front-door.spec.js` (4 tests).
  Gate: run `npm ci`, then `PW_CHROMIUM=/opt/pw-browsers/chromium npx playwright test` and
  `PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/cad-persistence-matrix.js`.
- Still open, owner questions (do not change pricing): walk gate prints "incl. / Included" with no price.
  Cosmetic: line reads "Privacy Installation" not "Wood Privacy"; validation modal is dark on light theme.
  Not yet eyeballed on a phone screen (screenshot was not permitted last session).

## Ship list
4. Data-loss protection — a contractor never loses a job by closing the tab, clearing, or a full
   browser store. Done when: Clear/New asks before discarding unsaved work, a failed save is shown
   (not silent), and the user is offered a file backup of saved jobs. Start by symbol search for
   `scheduleAutosave`, `STORAGE_KEY`, `btn-clear`, `beforeunload`.
5. Hide developer content (`fb-dev-btn`, DEV INDEX). 6. Hosting (Cloudflare Pages/Netlify, private repo;
   ship `lib/`). 7. Demo job + one-page guide.

## Branch
Start from and push to `claude/great-brown-fr03ka`.
