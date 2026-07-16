# Preservation Header

- Investigation date: 2026-07-16
- Scope: read-only investigation; no production code changes
- Tested libraries: Central Letting and Division 10 Letting
- Manifest record count: 944

# NCDOT Archive Discovery Archaeology Report

Generated: 2026-07-16
Workspace changes: none. Files were written only under /tmp.

## Endpoints Found

Primary source is the anonymous SharePoint REST API under the NCDOT Connect /letting site.

- GET https://connect.ncdot.gov/letting/_api/web/lists
  - Parameters used: $select=Title,Id,ItemCount,BaseTemplate,Hidden,RootFolder/ServerRelativeUrl; $expand=RootFolder; $filter=Hidden eq false; $top=200
  - Purpose: discover document libraries and list titles.

- GET https://connect.ncdot.gov/letting/_api/web/lists/getbytitle('Central%20Letting')/fields
  - Parameters used: $select=Title,InternalName,TypeAsString,Hidden; $filter=Hidden eq false
  - Purpose: confirm internal field names.

- GET https://connect.ncdot.gov/letting/_api/web/lists/getbytitle('Division%2010%20Letting')/fields
  - Same parameters.

- GET https://connect.ncdot.gov/letting/_api/web/lists/getbytitle('{library}')/items
  - Parameters for candidate enumeration: $select=Id,Title,Project,FileLeafRef,FileRef,FileDirRef,FSObjType,Let_x0020_Date,Let_x0020_Status,Letting_x0020_Document_x0020_Type,lettingContract,LetDivision,Division,County,LetCounty; $filter=FSObjType eq 0 and (Letting_x0020_Document_x0020_Type eq 'Bid Tab Sheet' or Letting_x0020_Document_x0020_Type eq 'Bid Summary'); $orderby=Let_x0020_Date desc,Id asc; $top=5000
  - Purpose: enumerate bid-tab candidates and direct file URLs.

- GET https://connect.ncdot.gov/letting/_api/web/lists/getbytitle('{library}')/items
  - Parameters for letting enumeration: $select=Id,Title,FileLeafRef,FileRef,FSObjType,Let_x0020_Date,Let_x0020_Status,LetDivision,Division; $filter=FSObjType eq 1; $orderby=Let_x0020_Date desc,Id asc; $top=5000
  - Purpose: enumerate letting folders/document sets and statuses.

Relevant rendered pages:

- Central archive/details page: https://connect.ncdot.gov/letting/Pages/Central-Letting-Details.aspx
- Detail page used by Central and Divisions: https://connect.ncdot.gov/letting/Pages/Letting-Details.aspx?let_type={Central|divisionNumber}&let_date={YYYY-MM-DD%2000:00:00}
- Division 10 landing page: https://connect.ncdot.gov/letting/Pages/Division10Letting.aspx
- Main Bidding & Letting page iframe for division map: ../../divisions/Pages/map.aspx?s=med&d=https://connect.ncdot.gov/letting/Pages/

## Sample Sanitized Responses

List catalog item:

```json
{
  "Title": "Central Letting",
  "BaseTemplate": 101,
  "Hidden": false,
  "ItemCount": 7364,
  "RootFolder": { "ServerRelativeUrl": "/letting/Central Letting" }
}
```

Central bid-tab item:

```json
{
  "FileLeafRef": "L250218 XLS Bid Tabs.xls",
  "Let_x0020_Date": "2025-02-18T05:00:00Z",
  "Let_x0020_Status": "Awarded",
  "Letting_x0020_Document_x0020_Type": "Bid Tab Sheet",
  "LetDivision": "Central",
  "lettingContract": "ALL",
  "FileRef": "/letting/Central Letting/02-18-2025 Central Letting/L250218 XLS Bid Tabs.xls"
}
```

Division 10 bid-tab item:

```json
{
  "FileLeafRef": "DJ00589-BidTab_signed.pdf",
  "Let_x0020_Date": "2026-06-17T04:00:00Z",
  "Let_x0020_Status": "Let",
  "Letting_x0020_Document_x0020_Type": "Bid Tab Sheet",
  "Project": "WBS Element: 49291.3.8",
  "LetDivision": "10",
  "FileRef": "/letting/Division 10 Letting/06-17-2026/DJ00589-BidTab_signed.pdf"
}
```

## Authoritative Source

The SharePoint document libraries appear authoritative for Stage 1 discovery. Rendered pages are built from these lists, and the REST items expose the metadata needed for letting date, letting status, document type/title, project/WBS, contract-like IDs, and direct download path. Direct file URLs are formed by prefixing https://connect.ncdot.gov to URL-encoded FileRef path segments.

## Central Versus Division Differences

Central uses library title Central Letting and stores each letting as a document-set folder named like MM-DD-YYYY Central Letting. Awarded lettings normally expose two letting-wide Bid Tab Sheet candidates: a PDF and an XLS/XLSX/XLS/CSV-style tabulation file. Contract/project metadata is sparse for these bid-tab rows and often uses lettingContract=ALL.

Division pages use one document library per division, e.g. Division 10 Letting. Division letting folders are named by date only. Bid-tab candidates are usually contract-level signed PDFs and may be typed as Bid Tab Sheet or Bid Summary. Project contains WBS Element text; contract IDs often need to be parsed from filenames such as DJ00589 or MJ00095 because lettingContract is often ALL or null.

## Verification

Central awarded lettings verified through REST and HEAD checks:

- 2025-02-18 Awarded: Bid Tabs 250218.pdf and L250218 XLS Bid Tabs.xls found; XLS HEAD returned 200 OK with Excel content type.
- 2026-06-16 Awarded: Bid Tabs 260616 Post.pdf and L260616 XLS Bid Tabs.xls found; PDF HEAD returned 200 OK.

Division 10 completed/let lettings verified through REST and HEAD checks:

- 2026-06-17 Let: DJ00589-BidTab_signed.pdf found; HEAD returned 200 OK.
- 2026-07-01 Let: seven Bid_Tabs_Summary_signed MJ/MJ00095-MJ00101 PDFs found; representative HEAD returned 200 OK.

## Pagination and Ranges Tested

Filtered candidate queries returned no nextLink:

- Central candidates: 378 records, range 2013-01-15 to 2026-06-16, all status Awarded.
- Division 10 candidates: 566 records, range 2013-08-07 to 2026-07-01, all status Let.
- Central letting document sets: 206 records, range 2013-01-15 to 2026-08-18.
- Division 10 letting document sets: 389 records, range 2012-04-04 to 2026-08-05.

For unfiltered document libraries, item counts exceed 5,000 for Central and several divisions. Implementation must follow odata.nextLink or use ID/date-window paging, even though the filtered bid-tab candidate queries tested here did not page.

## Risks and Limitations

- The public /letting libraries appear to start around 2013 for Central and Division 10. Older Central archive content advertised as 2012 back through 2000 may live under a different site or archive library and needs separate Stage 1 follow-up.
- Document type values are mostly reliable, but Division bid-tab-like documents appear under both Bid Tab Sheet and Bid Summary. Some Bid Summary rows are generic bid-results summaries, so downstream parsing should retain type and filename signals rather than assume all are item-level bid tabs.
- Filenames are inconsistent: case changes, spaces/underscores, typos, backticks, Post suffixes, signed suffixes, .xls/.xlsx/.csv possibilities, and year/date folder typos exist.
- Metadata timezone is stored as UTC offset from local midnight. Normalize by date component only for lettingDate.
- Contract IDs are not always a clean SharePoint field. Central bid-tab rows often say ALL. Division rows often require filename/project parsing.
- Direct URLs contain spaces and punctuation. Build URLs by URL-encoding each FileRef path segment, not by encoding the whole URL at once.
- Anonymous REST access worked during investigation, but SharePoint throttling/auth policy could change. Discovery code should be rate-limited and retry conservatively.

## Smallest Safe Implementation Plan

1. Add a discovery-only module that reads SharePoint list metadata via REST and returns normalized document candidates. Keep it separate from bid-tab parsing, pricing logic, benchmark mapping, and Rate Card code.
2. Configure library discovery for Central Letting plus Division {1..14} Letting, with per-library field mapping and nextLink pagination.
3. Filter candidate rows where FSObjType=0 and Letting_x0020_Document_x0020_Type is Bid Tab Sheet or Bid Summary; preserve raw SharePoint fields in the manifest for auditability.
4. Normalize lettingDate, lettingType, division, status, documentTitle, fileType, sourcePageUrl, directDownloadUrl, contractId, WBS, and projectTitle. Parse contract/WBS only as supplemental fields, never as the primary key.
5. Add a dry-run CLI/report command that writes a manifest without downloading files. Add snapshot tests using sanitized JSON from the verified Central and Division 10 lettings.
6. Only after review, wire the manifest output into the existing parser/downloader flow behind an explicit opt-in flag.
