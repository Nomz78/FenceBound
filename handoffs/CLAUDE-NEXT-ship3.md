# Next: Ship item 3 — Quick Quote as the front door

Owner directive 2026-11-22 (ship mode): 30 days to a version a contractor can use and buy. Plain language,
one recommendation per decision, one ship item per session, one developer-log line per session.

## Current state
- Item 1 done (`314b006`, `9940b1d`): jsPDF bundled at `lib/`, Quick Quote auto-fits.
- Item 2 done (`4c8457d`): "Get set up" card under the panel tabs (`renderSetupSteps`, called from `init`
  and `updatePricing`). Company profile Save from the card opens the price list; card hides when both saved.
  Test `tests/first-run-setup.spec.js`. Gate 301/301 + matrix 12/12 (`PW_CHROMIUM=/opt/pw-browsers/chromium`
  for both `npx playwright test` and `node scripts/cad-persistence-matrix.js`; run `npm ci` first).
- Still open, owner questions (do not change pricing): walk gate prints "incl. / Included" with no price.
  Cosmetic: line reads "Privacy Installation" not "Wood Privacy"; validation modal is dark on light theme.

## Ship list
3. Quick Quote as front door — a new user's first screen leads to typing the job (sides, height, gates) and
   customer, not a blank canvas. Done when, after setup, a new user gets from opening the app to an estimate
   PDF without touching the canvas or the panel tabs. Keep the "Get set up" card visible on that path.
4. Data-loss protection. 5. Hide developer content (`fb-dev-btn`, DEV INDEX).
6. Hosting (Cloudflare Pages/Netlify, private repo; ship `lib/`). 7. Demo job + one-page guide.

## Read first (symbol search in `index.html`)
`btn-jobinfo`, `updateDrawers` (JOB INFO drawer + Quick Quote form, `qq-*` ids), `buildTypedLayoutFromForm`,
end of `init` (`renderSetupSteps();` line), `renderSetupSteps`. Pattern for tests: `tests/first-run-setup.spec.js`.

## Branch
Start from and push to `claude/great-brown-fr03ka`.
