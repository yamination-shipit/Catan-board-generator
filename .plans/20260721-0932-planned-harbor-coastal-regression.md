# Harbour Coastal Regression Repair

## Summary

Fix harbour fixtures that attach to inland SVG edges and add geometry plus browser guardrails so
harbour tokens stay over water on every supported layout.

## Implementation

- Reproduce the defect with coordinate-based coastal-edge validation.
- Correct affected standard, 5-6, and Seafarers harbour fixture edges.
- Assert rendered harbour tokens do not overlap land polygons.
- Preserve harbour counts, types, seeded scrambling, URLs, and terrain generation.

## Validation

- `just test`
- `just test-honeycomb`
- `just ci`

## Status

Planned.
