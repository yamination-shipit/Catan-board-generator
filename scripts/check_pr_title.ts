export const CONVENTIONAL_PR_TITLE =
  /^(feat|fix|docs|test|refactor|chore|build|ci|perf)(\([a-z0-9-]+\))?!?: .+/;

export function isConventionalPrTitle(title: string): boolean {
  return CONVENTIONAL_PR_TITLE.test(title);
}

if (import.meta.main) {
  const title = Deno.args.join(" ").trim();
  if (!isConventionalPrTitle(title)) {
    console.error(
      "PR title must be Conventional Commits, for example: feat(board): add typed generator",
    );
    console.error(`Actual: ${title || "<missing>"}`);
    Deno.exit(1);
  }
}
