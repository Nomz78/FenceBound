# FenceboundCAD v5.4.0 deferred defect candidates

Recorded during the 5.3.1+feat port onto 5.3.8 release validation. These items were explicitly
excluded from the v5.4.0 closeout and require separate review.

1. **JSON rate-card import provenance guard.** The existing JSON price import clears
   `_pricingFromLoadedProject` and overwrites the saved company rate card without the confirmation
   used by manual save and CSV import. Decide and review this as an independent behavior change.
2. **Pale PDF accent contrast.** Estimate branding prints user-selected accent text on white.
   Very pale accents can make labels such as `ESTIMATE` difficult to read. Define an accessible
   contrast policy without changing the fixed validation-warning palette.
