# Browser and source archaeology notes

Date: 2026-07-19

The workstation has Firefox rather than Chrome/Chromium. The official page was inspected through an internet-capable browser fetch and independently through anonymous command-line HTTPS requests. The delivered HTML was sufficient; JavaScript rendering, iframe traversal, DevTools-only state, and session material were not needed.

The page does contain a Division Map iframe, but it is unrelated to the letting-record path. The actual Division List is a server-delivered `<select>` whose options name `Division1Letting.aspx` through `Division14Letting.aspx`. An adjacent script confirms the same navigation construction. This is direct page evidence, not an inferred endpoint convention.

Division 12 reproduction:

- Division page status: 200, `text/html; charset=utf-8`
- Detail page status: 200, `text/html; charset=utf-8`
- Letting: 2026-07-14
- Contract: DL00386
- Project/WBS: 44858.3.13
- Artifact types: award letter, bid summary, bid tab sheet, invitation to bid, plans, proposal

Division 10 reproduction:

- Division page status: 200, `text/html; charset=utf-8`
- Detail page status: 200, `text/html; charset=utf-8`
- Letting: 2026-07-15
- Project/WBS examples: `20S.1013N, 20S.1060N, 40.2.2` and `50982.3.11`
- Artifact types include bid results, bid roster, proposals, invitations, and plans

No iframe source was used for record discovery. No HAR was retained because the HTML route was reproducible without transient network state.
