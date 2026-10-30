# CODEX-NEXT — estimate PDF rebuild, round 1 (REDO 5)

## Current state

- Owner authorized all six REDO items on 2026-10-30. Your REDO 4 (plan PDF) is PR #43 on
  `feat/redo4-plan-pdf`, committed by the coordinator. Claude is on REDO 3 (mobile layout, CSS and panel
  layout); stay inside the PDF functions so the tracks don't conflict.
- Audit finding being fixed: the estimate PDF is "thin (no scope, drawing or terms)". Rebuild it as a real
  customer quote.
- `COMPANY.terms`, `depositPct` and `validityDays` already exist (`DEFAULT_COMPANY`, `index.html` about line 4220).
  Use them; don't add a new store and don't write new legal wording beyond what `DEFAULT_TERMS` already says.

## Read first

- `index.html`: `function exportEstimatePDF()` (symbol search) — the current estimate.
- `index.html`: your vector drawing code inside `exportPDF()` — extract it into one shared function both PDFs call.
- `tests/audit-repairs.spec.js` F4 (NOT FULLY VERIFIED stamp) and F7a (currency format), and
  `tests/customer-document-sections.spec.js` — these must stay green.

## Steps

1. **Scope of work:** a section listing each fence type with total LF, height, post count, and each gate (type,
   width), taken from the same counts the materials list uses (no new counting). Done when a strings test finds
   the types, LF and gates for a fixture job and they match `getStats()`.
2. **Drawing:** the shared vector drawing on the estimate (its own page or a half page), light, with the scale bar.
   Done when a test sees the drawing frame and the scale-bar label in the estimate.
3. **Terms and acceptance:** `COMPANY.terms`, deposit (`depositPct`), validity (`validityDays`) and a customer
   signature/date block. Done when a strings test finds the deposit amount, validity date and signature line.
4. Keep every existing price line, total, the F4 stamp and customer-money formatting unchanged.
5. New tests fail before and pass after; show both. Full `npm test` to a log file.
6. Append to `Docs/development/DEVELOPER_LOG.md`; write `handoffs/CODEX-RESULT-estimate-pdf1.md`. Leave the work
   uncommitted; the coordinator commits.

## Branches

Start: `feat/redo4-plan-pdf` (your REDO 4, committed). Push (coordinator): `feat/redo5-estimate-pdf`.
