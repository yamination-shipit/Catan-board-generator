set shell := ["bash", "-uc"]

deno := if `command -v deno >/dev/null 2>&1; echo $?` == "0" { "deno" } else { "/root/.deno/bin/deno" }

setup:
    {{deno}} task setup

check:
    {{deno}} task check

test:
    {{deno}} task test

build:
    {{deno}} task build

ci:
    {{deno}} task ci

serve:
    {{deno}} task serve

release-status:
    git log --oneline --decorate -5
    git status --short --branch
