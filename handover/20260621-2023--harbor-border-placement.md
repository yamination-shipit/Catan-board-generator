# Harbor Border Placement Repair

## Task

Fixed harbor fixtures that rendered some port tokens inland instead of outside the board border.

## Root Cause And Repair

- Root cause: the test helper mapped SVG vertex-edge indices to the wrong axial neighbor directions.
  The fixture check passed even when a port edge rendered across an inland side.
- Reproduced failure: after correcting the edge mapping, `4:1:4-5` failed as inland on the standard
  layout.
- Affected artifacts repaired: moved one standard, two 5-6, and one Seafarers harbor slot to real
  coastal edges in `src/domain/rules.ts`.
- Guardrail added: `portFixtures_WhenRenderedOnAnyLayout_AttachOnlyToCoastalEdges` now uses the
  pointy-top SVG edge directions used by rendering.
- Lesson: port fixture tests must validate the rendered edge geometry, not only the intended axial
  perimeter order.

## Validation

- `deno test --allow-read tests/domain_behavior_test.ts --filter portFixtures`: passed.
- `just test`: passed with 27 domain tests.
- `just ci`: passed.
- `just test-honeycomb`: passed.

## Plan

`.plans/20260621-2023-done-harbor-border-placement.md`
