# NCDOT Division Letting evidence

Status: resolved as stable navigable HTML (classification B) on 2026-07-19.

The official page exposes division page names in its server-delivered HTML. Division pages expose letting-detail links, and detail pages expose grouped artifact links. Anonymous HTTPS GET requests reproduced the chain for Division 12 on 2026-07-14 and Division 10 on 2026-07-15. No cookie, session token, authorization header, request digest, or browser profile is required.

Observed chain:

1. `https://connect.ncdot.gov/letting/Pages/Division.aspx`
2. `https://connect.ncdot.gov/letting/Pages/Division12Letting.aspx`
3. `https://connect.ncdot.gov/letting/Pages/Letting-Details.aspx?let_type=12&let_date=2026-07-14%2000:00:00`
4. Contract `DL00386`, project/WBS `44858.3.13`
5. Official award, bid summary, bid tab, invitation, plan, and proposal PDFs under `/letting/Division 12 Letting/07-14-2026/`

Independent reproduction used Division 10 and the 2026-07-15 letting. See `browser-notes.md` and `sanitized-network-notes.md`.

Files in this directory are research evidence, not runtime source. The connector and sanitized test fixtures live at repository root and under `test/fixtures/ncdot-division/`.
