# GitHub Actions Repair Handover

Plan: `.plans/20260613-1836-done-github-actions-repair.md`
Branch: `codex/fix-pages-pr-title`

## Summary

Repaired the failed Pages/PR-title workflow path and updated the README live demo link.

## Root Cause And Repair

| Area | Root Cause | Repair |
| --- | --- | --- |
| Pages | Release Please generated `CHANGELOG.md` text that `deno fmt --check` wanted to wrap. | Formatted current `CHANGELOG.md` and removed generated changelog content from Deno fmt scope. |
| Plans | `deno.json` referenced one stale `.plans/` filename. | Replaced it with `.plans/` and formatted existing plan docs. |
| PR title | Workflow rejected generated title-case PR titles. | Allowed Conventional Commit titles and generated human-readable GitHub titles. |
| README | Live demo still used a placeholder URL. | Added the requested GitHub Pages seed URL. |

## Validation

- `deno fmt --check CHANGELOG.md README.md deno.json .github/workflows/pr-title.yml` passed.
- PR title regex smoke checks passed for Conventional Commit, Codex/generated, and security-fix
  titles.
- `just ci` passed.

## Remaining Risk

GitHub Actions need to run after this branch is pushed to confirm the hosted runner path, but the
reported failing formatter condition now reproduces as passing locally.
