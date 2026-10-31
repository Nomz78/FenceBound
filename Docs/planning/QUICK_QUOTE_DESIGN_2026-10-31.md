# Quick quote (a quote without a drawing) — design (2026-10-31)

Status: **design for owner review. Not authorized for implementation.** Basis: `main` `4c25e95`. Source facts:
`handoffs/CODEX-RESULT-footage-survey1.md` (Codex, spot-checked by Claude Code).

## Why

Owner, 2026-10-31: owners quote from fence types and specs, footage, equipment and crew size; **the drawing
comes last, for the foreman**. FenceBound is drawing-first: footage, posts and price all come from drawn runs.
Labor is priced several ways in the trade (per foot, crew × days, multiplier); equipment is itemized until the
owner knows current rates and crew expectations. Target user: the owner-operator (one to three crews).

## The finding that shapes it

Typed totals don't fix the materials list. Codex's example (survey §4): a U-shaped 150 ft wood privacy yard with
one 4 ft walk gate. Moving that gate 2 ft along its side changes line posts from 5 to 4 and the rail order from
63 to 84 LF; one 150 ft run instead of three sides changes pickets from 502 to 501. The takeoff depends on
**where** gates sit and **how** the fence is split into sides. A typed quote is an estimate of a layout nobody has
drawn yet, and the design should say so instead of pretending otherwise.

## 1. Approach: typed sides build a schematic layout (survey option A)

The owner types **sides**, not a drawing:

| Field | Default |
|---|---|
| Fence type, height | last used; specs from the same height defaults the drawing uses (`applyHeightDrivenSpecs`) |
| Sides: length of each, in order | e.g. 50, 50, 50 |
| Shape | open (U/L, ends free or at the house) or closed loop |
| Gates: type, width, which side | centered on that side unless an offset is typed |

FenceBound then **generates ordinary fence, gate and post elements**: sides laid out at right angles in order,
gates placed, line posts generated with the existing auto-post rule. Everything after that is the code that
prices drawn jobs today (`getStats`, `calcAutoMaterials`, `computePricing`, validation, PDFs), unchanged.

Why this option: one pricing path (no second takeoff to drift, survey option B), no refactor (option C), and
labor/site adders keep working (option D loses them). It is also the drawing's starting point (§3).

The job carries `layout: 'typed'` until someone edits the geometry:
- the canvas shows a "Typed footage — not to scale" banner;
- the plan PDF is titled "Schematic — not to scale";
- validation adds a warning (not a block) "Gate positions and corners are assumed", so the estimate can still
  go out.

## 2. Pricing additions (pricing behavior change; needs owner authorization)

1. **Labor method per job:** per foot (today) · crew × days · multiplier (D6, later phase).
   Crew × days = crew size × days × hours per day × a person-hour rate. Today's `crewHourlyRate` (55, "used when
   hours-override is enabled") doesn't say whether it is per person or per crew hour (survey §2); the owner
   decides. The hours override drops per-gate labor (audit F13), and crew × days would hit the same path, so
   F13 needs an owner ruling first.
2. **Equipment lines:** job-level list {name, qty, per day | per job, rate}, shown as their own "Equipment"
   section on the estimate. Today they could be entered as manual material rows, but then they take material
   markup and sit among materials (survey §2). Owner decides the markup (none, material, or its own).
3. **Multiplier (D6):** sell price = cost × multiplier, or a sell price per LF. It changes how margin is shown
   (a price entered as cost shows 0% margin today), so it is its own phase.

## 3. Draw it for the foreman

The schematic **is** the starting drawing. The owner drags corners to real angles, moves gates to where they
go, adds the house line; the existing edit tools already do this. Run ids carry over, so field capture's run
taps (`FIELD_CAPTURE_DESIGN_2026-10-31.md` §3) work on the result.

When the first geometry edit happens, `layout` becomes `'drawn'` and the quote panel shows the change against
the last exported estimate: "Drawing changed the price: $X → $Y (posts +1, rails +21 LF)". Nothing re-prices
silently: a frozen quote keeps its rates (6b), and quantities changing after a signature already drop the
signature at the next export (6c). Whether a post-signature drawing difference becomes a change order is a
later decision (ranking #7, quote business rules).

Gates have no stable id today (survey §3); field capture P1 has to add one anyway.

## 4. Phases (each a PR; tests red before; Playwright full suite and matrix)

| Phase | Scope | Region | Done when |
|---|---|---|---|
| Q1 | Sides form, schematic generator, `layout` flag, banner, PDF title, validation warning | Claude (UI/state) | Codex's U-shaped fixture typed in (gate offset 20 ft) gives exactly the drawn fixture's BOM and total (parity test) |
| Q1t | Parity tests: typed vs drawn fixtures (U, L, loop, end gate, two types) | Codex (tests) | each fixture's normalized BOM, labor lines and cents equal |
| Q2 | Equipment lines; crew × days labor | Claude, after owner rulings | red-before tests; matrix covers equipment in save/load |
| Q3 | Multiplier pricing (D6) | design first | owner approves the margin display |

Q1 needs no pricing behavior change, so it can start as soon as it is authorized. Q2 needs the rulings below.

## Owner questions

1. Typed sides that build a schematic layout: is that the right entry? (Alternative: one LF total per type,
   which can't give an exact materials list.)
2. Is `crewHourlyRate` per person-hour or per crew-hour?
3. Equipment markup: none, same as materials, or its own?
4. F13: should crew/hours labor still add the per-gate install fee?
