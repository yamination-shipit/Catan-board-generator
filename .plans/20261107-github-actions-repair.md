# GitHub Actions Repair

## Status

Implementation complete; remote Honeycomb validation pending.

## Goal

Repair the current CI, Pages, Release Please, PR-title, and stale pull-request failures.

## Root Causes

- Workflows selected floating Deno 2.x, while local validation used Deno 2.8.3. Deno 2.9 formats
  embedded HTML styles differently.
- PR-title validation lived only in workflow shell code and could not be tested locally.
- Repository workflow permissions prevented Release Please from creating its pull request.
- PR #19 duplicated already-merged work and retained obsolete conflicting changes.
- Honeycomb installed Playwright 1.52.0 while tests imported the version pinned in `deno.json`, so
  the expected Chromium binary was absent.

## Approach

- Pin local setup and GitHub Actions to the checked-in Deno version.
- Share one typed PR-title validator between local tests and GitHub Actions.
- Enable Release Please pull-request creation, repair PR metadata, and close the stale duplicate.
- Install Chromium with the exact Playwright package pinned in `deno.json`.
- Run the full local CI gate, then verify CI, Pages, Release Please, PR titles, and Honeycomb
  remotely.
