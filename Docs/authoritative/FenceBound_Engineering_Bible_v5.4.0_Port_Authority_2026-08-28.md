# FenceBound Engineering Bible supplement — v5.4.0 port authority

Ratified 2026-08-28. This supplement records owner-authorized doctrine and shipped behavior without
modifying the frozen Engineering Bible Edition 1.0.

## Product and architecture rulings

- FenceboundCAD remains a single self-contained HTML application with no server, account, login,
  phone-home, subscription, or license-key check. The commercial model is a one-time perpetual
  license with optional paid major-version upgrades.
- The target customer is a fence contractor with roughly 3–15 crew whose owner or salesperson
  still performs takeoffs. Multi-user and cloud synchronization remain outside this architecture.
- FenceScraper remains a separate product. Bid discovery is not a FenceboundCAD module.
- Prices travel with saved jobs so historical quotes retain their pricing. Company branding remains
  local to the device and never travels in saved or exported job files.
- Cost imports converge through normalization, validation, `COST_DB`, and `saveCostDB()`.
  `csvBuildPreview()` and `computePricing()` remain pure.
- Destructive replacement, rate-card reset, and job deletion require explicit confirmation.
- Fence-type colors are semantic material data. The BOM/takeoff engine is field-knowledge-critical
  and changes to it require material-list verification.

## v5.4.0 port specification — subsequently landed

This section was written as the implementation specification against the 5.3.1 feature artifact
and canonical 5.3.8 release-validation baseline. The specified behavior subsequently landed in
v5.4.0 at `0d3211c9436d3fc40d8d4f3f8ea0090c967b85a1`.

- CSV price-list import provides delimiter detection, quoted-field parsing, explicit column mapping,
  validation, unit normalization, and visible duplicate resolution. Duplicate material keys default
  to the highest cost. Borrowed project pricing requires confirmation, and failed persistence rolls
  back both memory and provenance.
- Company Profile stores local branding, contact data, accent, deposit percentage, estimate
  validity, and optional terms. Missing company identity participates in client validation and
  recipient-visible PDF warnings; it does not block export or affect internal plan validation.
  Terms default to empty. Guidance is opt-in through the profile editor's Reset control.
- Full backup/restore covers saved jobs, the persisted company rate card, and company profile.
  Backups never substitute borrowed live project pricing for the saved rate card. Restore exposes
  section choices, Merge/Replace semantics, collision counts, confirmation, rollback, and a 14-day
  staleness warning.
- Interface hierarchy now separates sans UI text from monospace data, emphasizes total and margin,
  demotes deposit details, restrains accent use, and uses cross-platform inline SVG icons.

## Deferred defect candidates

The five current deferred candidates are recorded in
`Docs/planning/FenceboundCAD_v5.4.0_deferred_defects.md`. None is authorized for correction by this
supplement.

## Owner field specification — chain-link posts and terminations

Ratified 2026-08-28 from owner-supplied field practice. This knowledge is authoritative, cannot be
derived from the current runtime, and supersedes contrary inference in code. Implement it as
overridable defaults rather than locked derivations because installers exercise judgment on custom
gates and systems. Merchants Metals specifications may be used as a cross-check; owner field
practice controls.

### Classification and post section

Post section derives from fence height and commercial classification, not gate span:

- Residential: 2.5 inches.
- Commercial below 8 feet: 3 inches.
- Fence height 8 feet and above: 4 inches.
- Any barbed-wire fence is commercial regardless of property type.
- At 6-foot fabric height, gate and terminal posts use the same post specification.

### Post lengths, holes, and concrete

- Terminal, corner, and gate posts: 10.5-foot length, made by cutting a full stick in half. The
  offcut is accepted waste because half sticks cost more than the loss.
- Line posts: 9-foot length.
- Terminal, corner, and gate posts: 30-inch hole and three 60-pound concrete bags per post.
- Line posts below 8 feet: dig 12–14 inches, drive with a pounder, then top with one 60-pound bag.
- Line posts at 8 feet and above: use the same method and two 60-pound bags per post.
- Concrete derivation is three-dimensional: post role, fence height, and bag size.
- Partial bags and usable offcuts carry to the next job; they are not recovered against the current
  job. Purchase quantities round up to whole bags and whole sticks.
- The cost database concrete entry must represent a 60-pound bag. An 80-pound unit is the wrong
  product and must be corrected at the unit level, not compensated for only in quantity.

### Fabric termination model

Termination hardware derives per fabric end, never per physical post. A corner carries two ends
and therefore twice every per-end quantity.

Per fabric end:

- One tension bar.
- Five tension bands for 6-foot fabric: one per foot of fabric height minus one.
- Two terminal-sized brace bands with rail-end cups for framing.
- One terminal-sized brace band for bottom tension wire.
- Three terminal-sized brace bands for barbed wire.
- One line-post-sized brace band with rail-end cup for the mid rail.

Terminal-sized and line-post-sized brace bands are distinct SKUs with separate BOM rows and
separate cost-database entries. They must not be collapsed.

### “6 plus 1” assembly

“6 plus 1” means 6-foot fabric with a 1-foot, three-strand barbed extension for 7 feet overall. It
requires three barbed strands, an arm on every post, longer terminal-class posts to carry the arms,
and zero post caps because each arm replaces a cap.

## D1–D5 regression reference job

The canonical fixture is a 168-linear-foot square backyard perimeter tying into the house at both
ends: commercial 6-plus-1 chain link with bottom tension wire, mid rail, truss rods, one 4-foot walk
gate, and one 12-foot double-drive gate.

Geometry and known-correct takeoff values:

- Four terminal/corner posts: two house terminals carrying one end each and two corners carrying
  two ends each.
- Four gate posts and ten fabric termination ends.
- Gross perimeter: 168 LF; billable fence excluding gate openings: 152 LF.
- Tension bars: 10; tension bands: 50.
- Terminal-sized brace bands: 60; line-post-sized brace bands: 10.
- Rail-end cups: 30; post caps: 0.
- Barbed wire: 456 LF.
- Gate-post concrete: 12 60-pound bags.
