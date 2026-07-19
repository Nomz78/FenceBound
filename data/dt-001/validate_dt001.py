#!/usr/bin/env python3
import json
from pathlib import Path

p = Path(__file__).with_name("dt001_material_vocabulary_v0.1.json")
data = json.loads(p.read_text(encoding="utf-8"))

errors = []
ids = [m["materialId"] for m in data["materials"]]
if len(ids) != len(set(ids)):
    errors.append("Duplicate material IDs")
if any(not i.startswith("MAT-") for i in ids):
    errors.append("Unexpected material ID format")
if data["governingRules"].get("idsMayBeParsedForMeaning") is not False:
    errors.append("No-ID-parsing rule is not locked")

allowed_fixtures = set(data["governingRules"]["activeFixtureIds"])
for m in data["materials"]:
    unknown = set(m["fixtureCoverage"]) - allowed_fixtures
    if unknown:
        errors.append(f'{m["materialId"]}: out-of-scope fixtures {sorted(unknown)}')
    for key in ("unit", "roundingScope"):
        if not m["consumption"].get(key):
            errors.append(f'{m["materialId"]}: missing consumption.{key}')
    for key in ("basePurchaseUnit", "minimumPurchaseUnits", "conversionStatus"):
        if m["procurement"].get(key) in (None, ""):
            errors.append(f'{m["materialId"]}: missing procurement.{key}')

known_ids = set(ids)
for row in data["legacyMappings"]:
    if row["materialId"] not in known_ids:
        errors.append(f'Legacy mapping points to unknown ID: {row}')
for row in data["priceEvidence"]:
    if row["materialId"] not in known_ids:
        errors.append(f'Price evidence points to unknown ID: {row}')
    if row["evidenceType"] == "seeded_planning_estimate" and row["usableForFinalIssue"]:
        errors.append(f'Seeded price marked final-usable: {row["priceEvidenceId"]}')

if errors:
    print("DT-001 validation FAILED")
    for e in errors:
        print(" -", e)
    raise SystemExit(1)

print(f'DT-001 validation PASSED: {len(ids)} materials, '
      f'{len(data["legacyMappings"])} legacy mappings, '
      f'{len(data["priceEvidence"])} price-evidence records, '
      f'{len(data["fixtures"])} fixtures.')
