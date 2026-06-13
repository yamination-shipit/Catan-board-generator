# GitHub Actions Repair

## Status

Planned.

## Goal

Repair the failed Pages and PR title workflows after the seed-safe expansion merge, and update the
README with the live site link.

## Root Cause

- Pages failed because Release Please generated a `CHANGELOG.md` entry that `deno fmt --check`
  wants to wrap.
- PR title validation rejects existing title-case/generated titles for this repository.
- `deno.json` also contains a stale file-specific `.plans/` formatter include, which makes plan
  renames brittle.

## Implementation Notes

- Format the affected changelog entry.
- Replace the brittle `.plans/` formatter include with the folder.
- Relax PR title validation to allow current repository title style.
- Update the README live demo URL to the requested GitHub Pages link.

## Validation

- Pending: `deno fmt --check CHANGELOG.md README.md deno.json .github/workflows/pr-title.yml`
- Pending: PR title regex smoke checks
- Pending: `just ci`
