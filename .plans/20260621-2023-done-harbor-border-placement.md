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

- Reproduction: corrected the test mapping and confirmed `4:1:4-5` failed as inland.
- `deno test --allow-read tests/domain_behavior_test.ts --filter portFixtures`: passed.
- `just test`: passed with 27 domain tests.
- `just ci`: passed.
- `just test-honeycomb`: passed.

## Status

Done.
