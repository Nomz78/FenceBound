# Changelog

User-visible changes to FenceboundCAD are recorded here. Release tags are
created only after merge and explicit owner confirmation.

## Unreleased — 2026-08-01

### Fixed

- Loading a saved job could later replace the company's saved prices when the
  cost editor was used.
- Editing the current job could unexpectedly change an internal Saved Job,
  including its prices, labels, manual materials, or drawing elements.
- Undo and redo could remove run add-ons and their material rows.
- Saving prices could report success when browser storage rejected the write.
- Loading a project without pricing could leave later pricing operations tied
  to an earlier project's prices.
- “Reload saved rate card” could report success when no saved card existed or
  when its stored data was unreadable.
- A failed attempt to save prices from a loaded job could suppress the warning
  on the next attempt.
- Some imported projects with unreadable pricing data could make Export produce
  no document.

### Changed

- Projects with missing or unverified information may be exported, but estimate
  PDFs, plan PDFs, and portable project JSON visibly identify what was not
  verified.
- Export warnings use plain customer-facing descriptions, remain compact, and
  no longer cover the fence drawing on plan PDFs.
- When pricing cannot be calculated, exported documents identify the unpriced
  materials, labor, and total instead of showing broken numbers or failing
  silently.
- Historical versioned HTML files moved from the repository root to `archive/`.
