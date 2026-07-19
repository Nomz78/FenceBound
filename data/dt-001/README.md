# DT-001 First Slice

This folder is executable structured data, not a complete catalog.

## Scope
Only materials required by the three locked fixtures are included:
- FX-001 straight chain-link run
- FX-002 non-90-degree chain-link corner
- FX-003 mixed chain-link and wood

## Locked rules
- IDs are permanent opaque handles.
- No code may parse an ID for meaning.
- Attributes and labels may be corrected without changing IDs.
- Consumption unit, purchase unit, and rounding scope are first-class.
- Supplier packaging and price evidence remain separate.
- COST_DB keys migrate as aliases/mappings.
- COST_DB values remain seeded, unverified evidence.
- Unknown cost is allowed; hidden uncertainty is not.

## Files
- `dt001_material_vocabulary_v0.1.json`: canonical source for this slice
- `materials.csv`: reviewable material list
- `legacy_costdb_mappings.csv`: explicit old-key mappings
- `price_evidence_seeded.csv`: inherited values that have been admitted so far
- `FIELD_CAPTURE_TEMPLATE.md`: one-page field evidence note
- `validate_dt001.py`: structural validator

## Deliberate exclusions
- Complete supplier catalog
- Final dimensions, gauges, finishes, and package sizes not yet evidenced
- Gates
- Pricing engine
- Screen or UI design
- v5.3.4 modifications
