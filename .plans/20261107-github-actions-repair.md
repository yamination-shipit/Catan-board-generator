# GitHub Actions Repair

## Status

Implementation complete; final remote validation pending.

## Goal

Repair the current CI, Pages, Release Please, PR-title, and stale pull-request failures.

## Root Causes

- Workflows selected floating Deno 2.x, while local validation used Deno 2.8.3. Deno 2.9 formats
  embedded HTML styles differently.
- PR-title validation lived only in workflow shell code and could not be tested locally.
- Repository workflow permissions prevented Release Please from creating its pull request.
- PR #19 duplicated already-merged work and retained obsolete conflicting changes.
- Honeycomb installed Playwright 1.52.0 while tests imported the version pinned in `deno.json`, so
  the expected Chromium binary was absent. Playwright 1.64 also probes `/proc` during startup, which
  the previous fragmented Deno permission list rejected.

## Approach

- Pin local setup and GitHub Actions to the checked-in Deno version.
- Share one typed PR-title validator between local tests and GitHub Actions.
- Enable Release Please pull-request creation, repair PR metadata, and close the stale duplicate.
- Install Chromium with the exact Playwright package pinned in `deno.json` and run the isolated
  browser integration test with the full permissions its subprocess and platform probes require.
- Enforce the pinned toolchain and full local CI gate through pre-commit and pre-push checks.
- Run the full local CI gate, then verify CI, Pages, Release Please, PR titles, and Honeycomb
  remotely.
