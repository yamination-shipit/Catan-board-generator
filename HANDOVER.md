# Handover

Current session state lives in dated files under `handover/`.

Before ending non-trivial work, update this file with the latest handover note and keep the active
`.plans/` file current.

Latest note: `handover/20260615-1716--expansion-generation.md`

Latest plan: `.plans/20260615-1612-done-expansion-generation.md`.

Current work implemented expansion-aware generation. 5-6 now generates a 30-hex island with 11
harbors, Seafarers generates a sea/gold scenario-style board, and Cities & Knights adds rules/setup
notes without changing terrain by itself. ADR 0006 documents the accepted seed compatibility break.
Because the expansion plan was created on top of `codex/ui-rules-port-fixes`, future continuation
work should branch from the existing expansion/UI branch stack or its merged successor, not from
plain `master` before that stack lands.
