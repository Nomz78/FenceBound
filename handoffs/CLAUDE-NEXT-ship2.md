# Next: Ship item 2 — first-run setup

Owner directive 2026-11-22 (ship mode): 30 days to a version a contractor can use and buy. Plain language,
one recommendation per decision, one ship item per session, one developer-log line per session.

## Current state
- Item 1 done on `claude/great-brown-fr03ka`: jsPDF bundled at `vendor/`, Quick Quote auto-fits.
  Gate 299/299 + matrix 12/12 (run with `PW_CHROMIUM=/opt/pw-browsers/chromium` in cloud sessions).
- Owner answers: no customer lined up (contractors resist changing workflow, so the demo job matters);
  no past-job records, owner can vouch for job numbers; one device + backups is fine; repo stays private,
  host on a free service that deploys private repos (Cloudflare Pages or Netlify), not GitHub Pages.

## Walkthrough findings (fresh browser, Quick Quote 60/80/60, 6 ft wood privacy, one walk gate)
- Estimate PDF says "YOUR COMPANY NAME" and carries a NOT FULLY VERIFIED box until the profile and rate
  card are saved. → item 2.
- Walk gate prints as "incl. / Included" with no price. OWNER QUESTION, do not change pricing.
- Line reads "Privacy Installation", not "Wood Privacy". Cosmetic.
- Validation modal is dark on the light theme. Cosmetic.

## Ship list
1. Walkthrough + fixes — DONE.
2. First-run setup (company profile → own prices). Done when a new user reaches an unstamped PDF in <15 min.
3. Quick Quote as front door. 4. Data-loss protection. 5. Hide developer content (`fb-dev-btn`, DEV INDEX).
6. Hosting (Cloudflare Pages/Netlify, private repo; ship `vendor/`). 7. Demo job + one-page guide.

## Read first
`index.html`: `buildTypedLayoutFromForm`, `btn-company-profile` handler, `co-save`, `validateProject`.
Do not change pricing values; keep tests passing.
