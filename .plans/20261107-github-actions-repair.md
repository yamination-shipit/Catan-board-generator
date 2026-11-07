# GitHub Actions Repair

## Status

In progress.

## Goal

Repair the current CI, Pages, Release Please, PR-title, and stale pull-request failures.

## Root Causes

- Workflows selected floating Deno 2.x, while local validation used Deno 2.8.3. Deno 2.9 formats
  embedded HTML styles differently.
- PR-title validation lived only in workflow shell code and could not be tested locally.
- Repository workflow permissions prevented Release Please from creating its pull request.
- PR #19 duplicated already-merged work and retained obsolete conflicting changes.

## Approach

- Pin local setup and GitHub Actions to the checked-in Deno version.
- Share one typed PR-title validator between local tests and GitHub Actions.
- Enable Release Please pull-request creation, repair PR metadata, and close the stale duplicate.
- Run the full local CI gate, then verify the repair through a correctly titled pull request.
