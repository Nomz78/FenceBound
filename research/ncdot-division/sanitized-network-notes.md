# Sanitized request notes

All requests were anonymous HTTPS GETs with redirects followed. Only `Accept: text/html` was explicitly sent by the standalone probe.

| Request | Status | Content type | Dependency |
| --- | ---: | --- | --- |
| `/letting/Pages/Division.aspx` | 200 | `text/html; charset=utf-8` | none |
| `/letting/Pages/Division12Letting.aspx` | 200 | `text/html; charset=utf-8` | none |
| `/letting/Pages/Letting-Details.aspx?let_type=12&let_date=2026-07-14%2000:00:00` | 200 | `text/html; charset=utf-8` | none |
| `/letting/Pages/Division10Letting.aspx` | 200 | `text/html; charset=utf-8` | none |
| `/letting/Pages/Letting-Details.aspx?let_type=10&let_date=2026-07-15%2000:00:00` | 200 | `text/html; charset=utf-8` | none |

The division is present in the division page path and `let_type` query parameter. The date is present in `let_date`. Detail responses contain contract/project group headings and official artifact URLs. The division pages currently show a bounded recent list and links to separate advertised/let list pages; connector pagination beyond that observed surface is not claimed.

Raw response headers and full pages were not retained because SharePoint responses include request IDs and form digest values irrelevant to anonymous GET reproduction. No cookies, authorization values, session IDs, personal headers, browser profiles, or raw HAR files are present.
