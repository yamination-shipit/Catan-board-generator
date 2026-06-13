---
name: catan-workflow
description: Work in the Catan Board Generator repository using CLAUDE.md as the canonical source of truth. Use when Codex is asked to change app behavior, repository workflow, plans, handover notes, skills, commits, pushes, or any non-trivial files in this repo.
---

# Catan Workflow

## Required Start

1. Read `CLAUDE.md` before changing files.
2. Run `git status --short --branch`.
3. If Git reports dubious ownership on Android/Termux, add this repo as a safe directory for both
   path aliases:
   - `/storage/self/primary/bridge/git/Catan-board-generator`
   - `/storage/emulated/0/bridge/git/Catan-board-generator`
4. If still on `master` or another base branch, create a task branch before editing tracked files.
5. For non-trivial work, create a `.plans/YYYYMMDD-HHMM-planned-<slug>.md` plan and commit it before
   implementation edits.
6. When implementation begins, rename the plan file from `planned` to `in-progress`.

## Source Of Truth

Treat `CLAUDE.md` as canonical. Do not duplicate its architecture, command, deployment, or workflow
rules into Codex files. Codex-specific files may add execution procedure only when they point back
to `CLAUDE.md`.

## Required Finish

1. Validate with the smallest meaningful checks for the change.
2. For UI changes, preview `index.html` on Android before pushing when the user asked for Android
   review.
3. Update the active `.plans/` file with validation, risks, and completion state.
4. Update `HANDOVER.md` and one dated `handover/` note when work changes workflow, app behavior,
   validation state, or leaves context future sessions need.
5. Commit logical slices using the repo/user commit convention.
6. Push completed work unless the user explicitly says not to.

## Guardrails

- Keep generated workflow docs concise.
- Do not make a landing page; this repo is a direct-use single-file app.
- Do not introduce a build system unless a future task explicitly requires it.
- Never use rebase in this repo. Pull remote changes with merge semantics, for example
  `git pull --no-rebase origin master` or `git merge origin/master`.
- Never force-push. If a push is rejected, fetch, merge, resolve, validate, and push normally.
