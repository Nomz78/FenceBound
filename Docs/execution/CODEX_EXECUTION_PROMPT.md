# FenceBound Codex Execution Prompt
## Objective: Unlock the NCDOT Division Letting data path

You are the primary implementation agent for FenceBound in a live Codex CLI / terminal session.

Your mission is narrow:

> Identify and reproduce the real NCDOT Division Letting request path using a local browser session, then build the smallest deterministic probe and connector needed to produce normalized letting records with traceable artifact links.

Do not redesign FenceScraper. Do not touch CAD. Do not broaden scope.

---

# 1. Governing project rules

Read the repository documentation before editing code. The repo is authoritative. Chat memory is not.

At minimum, inspect the committed Engineering Bible and current status/punchlist files under `/docs`.

Carry these locked rules forward:

- `FenceboundCAD v5.3.4-embedded-project-index.html` is frozen.
- Maximum two active tracks.
- This session's active engineering track is NCDOT Division Letting.
- One writer per file between commits.
- Claude reviews committed diffs later; Claude does not co-edit this branch.
- Evidence and product judgment remain distinct.
- Unknown data is permitted; hidden uncertainty is not.
- Bid tabs are installed selling-price evidence, not supplier-cost evidence.
- Never commit cookies, session tokens, Authorization headers, personal browser data, or secrets.
- Never invent endpoint patterns when direct browser evidence is available.

---

# 2. Repository startup

Begin with:

```bash
cd /Users/altairus78/Developer/FenceBound
git status
git branch --show-current
git log -5 --oneline
```

If the worktree is not clean, stop and explain what is modified before proceeding.

Then:

```bash
git switch main
git pull --ff-only
git switch -c feat/ncdot-division-endpoint
```

Do not run `git init`. The repository already exists.

Create or use:

```text
research/ncdot-division/
  README.md
  browser-notes.md
  rendered-dom.html
  page-source.html
  sanitized-network-notes.md
```

A sanitized HAR may be retained only if it contains no secrets or personal browser data.

---

# 3. Read existing evidence first

Inspect:

- `FenceScraper_Division_Endpoint_Archaeology_Log_2026-07-16(1).md`
- Current FenceScraper source
- Existing bid-tab parser and tests
- Existing benchmark tests
- System Atlas / Engineering Bible FenceScraper sections
- Current punchlist

Extract the existing completion criteria. Do not repeat abandoned URL guessing unless browser evidence supports it.

---

# 4. Browser archaeology

Open Chrome or Chromium locally and navigate to:

```text
https://connect.ncdot.gov/letting/Pages/Division.aspx
```

Open DevTools before reloading.

## Network setup

- Enable **Preserve log**
- Disable cache while DevTools is open
- Clear requests
- Reload
- Inspect Document, Fetch/XHR, JS, Other, and Frames

Filter/search for:

```text
division
letting
_api
RenderListDataAsStream
Lists
WebPart
iframe
aspx
xls
xlsx
pdf
award
bid
proposal
plan
```

## DOM capture

Save:

- Original page source
- Fully rendered DOM
- Relevant iframe source
- Relevant JavaScript/configuration references

Search rendered content for:

```text
iframe
Division 1
Division 14
_api
RenderListDataAsStream
Lists
WebPart
letting
bidtab
.xls
.xlsx
.pdf
```

## Network evidence

For each likely request, record:

- Full URL
- HTTP method
- Status
- Initiator
- Query parameters or body
- Content type
- Required headers
- Cookie/session dependency
- Redirect chain
- Whether it works in a clean tab
- Whether division/date appears in path, query, payload, or response
- Pagination behavior

Do not copy authentication material into source files.

---

# 5. Trace one real artifact chain

Trace:

```text
Official Division Letting page
→ embedded source/list/endpoint
→ division and letting date
→ contract or letting detail
→ downloadable bid tab, award, proposal, or plan
```

Do not stop after finding an iframe.

Then reproduce with either:

- A second division, or
- A second letting date

This second reproduction is mandatory before integration.

---

# 6. Classify the data path

Classify the evidence as:

## A. Stable official endpoint
Reproducible official structured request without transient credentials.

Action: deterministic connector.

## B. Stable navigable HTML
Official pages can be traversed and parsed deterministically.

Action: isolated HTML parser with saved fixtures.

## C. Browser-assisted source
Browser-rendered state is required, but capture/import can be done without embedding secrets.

Action: honest browser-assisted capture/import workflow.

## D. Session-bound or unstable
Expiring tokens, private credentials, brittle invented URLs, or unreproducible state.

Action: preserve evidence, document blocker, and provide the smallest safe manual fallback. Do not pretend this is unattended automation.

State which classification is evidence-supported and why.

---

# 7. Build the smallest standalone probe

Do not integrate first.

Create:

```text
scripts/probe-ncdot-division.mjs
```

Target usage:

```bash
node scripts/probe-ncdot-division.mjs --division 10
node scripts/probe-ncdot-division.mjs --division 10 --date 2026-06-16
```

The probe must:

- Accept division
- Accept optional date/date range when supported
- Call only the observed official path
- Print normalized records
- Report source URL, status, and content type
- Fail visibly and specifically
- Avoid hard-coded cookies or transient tokens
- Avoid silently falling back to guessed URLs

Target normalized shape:

```json
{
  "sourceId": "ncdot_division_letting",
  "division": "10",
  "lettingDate": "2026-06-16",
  "contractId": "...",
  "projectId": "...",
  "detailUrl": "...",
  "artifacts": [{"type": "bid_tab", "url": "..."}],
  "retrievedAt": "...",
  "extractionMethod": "api|html|browser_assisted",
  "sourceUrl": "..."
}
```

Preserve missing fields as missing. Never fabricate values.

---

# 8. Save sanitized fixtures

Create the smallest useful fixture set:

```text
test/fixtures/ncdot-division/
  division-list-response.*
  letting-detail-response.*
  expected-records.json
```

Remove cookies, tokens, personal headers, session IDs, and irrelevant bulk where safe.

---

# 9. Tests before integration

Tests must cover:

- Division identity retained
- Letting date normalized
- Stable contract/project identity retained
- Relative links converted to correct official URLs
- Bid tabs distinguished from plans, proposals, and awards
- Duplicate links collapsed
- Unsupported artifacts ignored or labeled
- Malformed/changed structure fails visibly
- Second division/date reproduces
- No transient secret required by tests

Then run all existing FenceScraper parser and benchmark tests. Existing Central-style behavior must remain green.

---

# 10. Integrate only after probe success

Add an explicit source contract/connector:

```text
ncdot_division_letting
```

Keep fetching, parsing, normalization, and UI orchestration separated enough to test.

Do not bury Central and Division behavior in one conditional thicket.

Every record retains:

- Source system
- Official source URL
- Division
- Letting date
- Retrieval time
- Contract/project ID
- Artifact type
- Artifact URL
- Extraction method
- Validation/confidence state where appropriate

If browser-assisted capture is required, represent it honestly.

---

# 11. Security review before commit

Search new and modified files for:

```text
Cookie
Authorization
Bearer
token
session
FedAuth
rtFa
Set-Cookie
X-RequestDigest
```

Run:

```bash
git diff --check
git status --short
```

Do not commit raw HAR files until manually sanitized. Never commit browser profiles, cache, cookies, or personal data.

---

# 12. Definition of done

Complete only when:

1. Official request/navigation pattern is documented from browser evidence.
2. One Division letting is discovered.
3. One real bid-tab or award artifact is traced.
4. The process succeeds for a second division or date.
5. Automated tests cover normalized output.
6. Existing Central parser/benchmark tests remain green.
7. No secrets or personal browser data are committed.
8. The implementation states honestly whether it is API, HTML, or browser-assisted.

Optional:

9. The source is visible through existing FenceScraper orchestration without unrelated refactoring.

---

# 13. Commit discipline

Before committing:

```bash
git status
git diff --check
# run new tests
# run existing parser and benchmark tests
```

Use focused commits, for example:

```text
feat(fencescraper): add reproducible NCDOT Division Letting probe
feat(fencescraper): integrate NCDOT Division Letting connector
```

Do not mix evidence, connector work, and unrelated cleanup into one opaque commit.

After each commit:

```bash
git show --stat --oneline HEAD
```

---

# 14. End-of-session report

Return:

## Evidence-derived findings
- Actual request/navigation pattern
- Data-path classification
- Browser/session dependencies
- Artifact chain
- Second reproduction result

## Implementation
- Files added/modified
- Probe usage
- Connector behavior
- Fixtures/tests

## Test results
Exact commands and outcomes.

## Security
Whether tokens/cookies/session-bound values were found and how handled.

## Remaining blockers
Evidence-backed only.

## Commits
Hashes and subjects.

## Claude review package
Exactly which diff, notes, fixtures, and test outputs Claude should inspect.

---

# 15. Explicitly prohibited scope

Do not touch:

- Frozen CAD v5.3.4
- CAD v6.0 UI
- Design system
- Proposal generation
- DT-001 catalog expansion
- Supplier price invention
- Rate Card redesign
- Broad FenceScraper refactoring unrelated to Division Letting
- Another general audit
- Market evidence → supplier cost conversion

Proceed until the objective is completed or an evidence-backed hard blocker is documented.
