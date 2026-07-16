# NCDOT Archive Discovery Expansion Report

Investigation date: 2026-07-16
Scope: metadata-only, read-only SharePoint REST discovery. No production code changes, no bid-tab file-body downloads, no commit.

## Libraries Tested

- Division 7 Letting
- Division 8 Letting
- Division 9 Letting
- Division 12 Letting

Each library was queried through anonymous SharePoint REST under:

```text
https://connect.ncdot.gov/letting/_api/web/lists/getbytitle('{library}')/...
```

## Schema Check

The libraries expose the same discovery-relevant fields:

- `FileLeafRef`
- `Title`
- `Project`
- `Let_x0020_Date`
- `Let_x0020_Status`
- `Letting_x0020_Document_x0020_Type`
- `lettingContract`
- `LetDivision`
- `LetCounty`
- `County`

`FileRef`, `FileDirRef`, and `FSObjType` are not returned by the visible fields query, but are available as SharePoint item properties and were returned successfully by each candidate query.

The only visible schema difference found was the division-specific workflow URL field:

- Division 7: `Division07LettinUpdateWF`
- Division 8: `Division08LettinUpdateWF`
- Division 9: `Division09LettinUpdateWF`
- Division 12: `Division12LettinUpdateWF`

These workflow fields are not needed for bid-tab discovery.

## Query Used

Candidate enumeration used:

```text
GET /letting/_api/web/lists/getbytitle('{library}')/items
Accept: application/json;odata=nometadata

$select=Id,Title,Project,FileLeafRef,FileRef,FileDirRef,FSObjType,
        Let_x0020_Date,Let_x0020_Status,
        Letting_x0020_Document_x0020_Type,
        lettingContract,LetDivision,LetCounty,County
$filter=FSObjType eq 0 and
        (Letting_x0020_Document_x0020_Type eq 'Bid Tab Sheet'
         or Letting_x0020_Document_x0020_Type eq 'Bid Summary')
$orderby=Let_x0020_Date desc,Id asc
$top=5000
```

No `odata.nextLink` pagination cursor was returned for any of the four filtered candidate queries. Implementation should still follow `nextLink` when present.

## Results

| Library | Records | Earliest lettingDate | Latest lettingDate | Status breakdown | File types | Document type breakdown |
|---|---:|---|---|---|---|---|
| Division 7 Letting | 340 | 2022-01-06 | 2026-07-16 | Advertised 25; Let 113; Archived 202 | pdf 339; xls 1 | Bid Summary 161; Bid Tab Sheet 179 |
| Division 8 Letting | 329 | 2013-10-22 | 2026-04-14 | Let 327; Advertised 2 | pdf 329 | Bid Tab Sheet 323; Bid Summary 6 |
| Division 9 Letting | 196 | 2016-10-12 | 2026-02-11 | Let 196 | pdf 196 | Bid Summary 196 |
| Division 12 Letting | 871 | 2012-10-24 | 2026-07-14 | Let 869; Advertised 2 | pdf 871 | Bid Summary 464; Bid Tab Sheet 407 |

Expansion manifest record count: 1,736.

Consolidated manifest record count, combining Central, Division 10, Division 7, Division 8, Division 9, and Division 12: 2,680.

## Missing or Inconsistent Fields

- `documentTitle` and `directDownloadUrl` were present for every normalized record.
- Division 7 has project titles for every record, but no normalized `contractId` or `wbs` could be derived from the selected fields or filenames.
- Division 8 has project titles for every record. `contractId` was derived for 74 records; `wbs` was derived for 2 records.
- Division 9 has project titles for every record, but no normalized `contractId` or `wbs` could be derived.
- Division 12 has one record without `projectTitle`. `contractId` and `wbs` were derived for 8 records.
- Contract identifiers are not consistently stored in `lettingContract`; many division records require filename parsing, and some divisions use local contract IDs that do not match the Central `C######` pattern.
- Division 7 includes one `.xls` candidate; the other expanded divisions returned only `.pdf` candidates.
- Division 7 includes `Archived` bid-tab candidates. Division 8 and Division 12 include a small number of `Advertised` candidates. Division 9 candidates were all `Let`.

## Representative HEAD Verification

Each representative URL was checked with `HEAD` only. All returned `200 OK` and `Content-Type: application/pdf`.

- Division 7: `https://connect.ncdot.gov/letting/Division%207%20Letting/03-19-2026/MG00498%20AS%20READ%20BID%20SUMMARY.pdf`
- Division 8: `https://connect.ncdot.gov/letting/Division%208%20Letting/4-14-2026/DH00603_HS-2008E_US74_NC144_RCI_Scotland_BID%20TABS.pdf`
- Division 9: `https://connect.ncdot.gov/letting/Division%209%20Letting/02-11-2026/MI00018%20-%20D9-PAINT-2026%20-%20Bid%20Summary.pdf`
- Division 12: `https://connect.ncdot.gov/letting/Division%2012%20Letting/07-14-2026/071426_DL00386_GAST_BIDSUMMARY.pdf`

## Files Created

- `Docs/research/ncdot/NCDOT_BidTab_Discovery_Manifest_Div7_8_9_12_2026-07-16.json`
- `Docs/research/ncdot/NCDOT_BidTab_Discovery_Manifest_CurrentMarket_2026-07-16.json`
- `Docs/research/ncdot/NCDOT_Archive_Discovery_Expansion_Report_2026-07-16.md`
