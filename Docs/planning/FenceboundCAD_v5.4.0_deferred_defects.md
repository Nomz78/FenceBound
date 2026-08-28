# FenceboundCAD v5.4.0 deferred defect candidates

Recorded during the 5.3.1+feat port onto 5.3.8 release validation. These items were explicitly
excluded from the v5.4.0 closeout and require separate review.

1. **Margin cannot represent price-first multiplier quoting (D6).** Entering a sell price as cost
   produces a 0.0% margin. FenceboundCAD cannot express the per-LF labor plus material-multiplier
   method used by much of its target market. This has the highest commercial significance of the
   deferred items and requires a product decision before implementation.
2. **“6 plus 1” is not first-class (D7).** The user must currently assemble the fabric height,
   three barbed strands, arms, longer terminal posts, and cap suppression through separate inputs.
   Consider a first-class assembly or preset after the underlying takeoff defects are repaired.
3. **Specification depth versus real installation depth.** Actual hole depth drives material cost,
   while a 36-inch specification depth promised to a general contractor belongs on submittals. The
   current model holds only one depth and cannot truthfully represent both.
4. **JSON rate-card import provenance guard.** The existing JSON price import clears
   `_pricingFromLoadedProject` and overwrites the saved company rate card without the confirmation
   used by manual save and CSV import. Decide and review this as an independent behavior change.
5. **Pale PDF accent contrast.** Estimate branding prints user-selected accent text on white.
   Very pale accents can make labels such as `ESTIMATE` difficult to read. Define an accessible
   contrast policy without changing the fixed validation-warning palette.
