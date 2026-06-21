# Harbor Border Placement Repair Plan

## Goal

Fix harbor tokens that render inland by aligning port fixture edge directions with the SVG hex
geometry.

## Implementation

- Reproduce the failure with a geometry-based coastal-edge check.
- Correct the edge-direction mapping used by tests for pointy-top SVG hex vertices.
- Move every affected port fixture to a real coastal edge for standard, 5-6, and Seafarers layouts.
- Keep harbor token rendering outside the referenced border edge.

## Validation

- `just test`
- `just ci`
- `just test-honeycomb`

## Status

Planned.
