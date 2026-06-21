# ADR 0004: Automate Releases With Conservative Supply Chain Defaults

## Status

Accepted

## Context

The app needs semver releases, release notes, PR standards, and reduced dependency-update risk.

## Decision

Use Conventional Commits with Release Please for changelogs, release PRs, tags, and GitHub releases.
Use Renovate with cooldowns, no automerge, and grouped GitHub Actions updates. Avoid production
dependencies unless a clear need exists.

PR titles must use lowercase Conventional Commit prefixes. Generated branch-style titles are not
accepted because Release Please uses commit history to decide whether a release is needed. Changelog
sections are limited to `feat`, `fix`, and `perf` entries.

## Consequences

- The page footer reads its version from the Release Please manifest.
- Dependency and action updates wait through a cooldown before PRs.
- Release notes are generated from merged commit history.
