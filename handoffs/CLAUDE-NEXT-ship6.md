# Next: Ship item 6 — Hosting

Owner directive 2026-11-22 (ship mode): 30 days to a version a contractor can use and buy. Plain language,
one recommendation per decision, one ship item per session, one developer-log line per session.

## Current state
- Items 1–4 done (`314b006`, `9940b1d`, `4c8457d`, `e1574dd`, `d849779`).
- Item 5 done (the "Ship item 5" commit on this branch): DEV INDEX shows only with `?dev=1` (`?dev=0` locks it);
  the Ctrl+Shift+D unlock was removed (`fb-dev-index-script` in `index.html`). Test
  `tests/hide-developer-content.spec.js` (3). Every side tab scanned: no other developer content shown.
- Gate: `npm ci`, then `PW_CHROMIUM=/opt/pw-browsers/chromium npx playwright test` (315 passed) and
  `PW_CHROMIUM=/opt/pw-browsers/chromium node scripts/cad-persistence-matrix.js` (exit 0).
- Still open, owner questions (do not change pricing): walk gate prints "incl. / Included" with no price.
  Cosmetic: "Privacy Installation" vs "Wood Privacy"; validation modal is dark on light theme. Not yet checked on a phone.

## Ship list
6. Hosting — the app is reachable at a URL a contractor can open, from a private repo. Done when: a static host
   (recommend Cloudflare Pages; Netlify is the alternative) serves `index.html` plus `lib/` (bundled jsPDF), with only
   the app files published (not Docs/, archive/, research/, tests/). Likely needs an owner account/decision; ask once,
   with one recommendation. Start by listing what `index.html` loads at runtime (symbol search for `src=`, `lib/`).
7. Demo job + one-page guide.

## Branch
Start from and push to `claude/great-brown-fr03ka`.
