import { strict as assert } from "node:assert";
import { isConventionalPrTitle } from "../scripts/check_pr_title.ts";

Deno.test("isConventionalPrTitle_WhenTitleUsesSupportedFormat_ReturnsTrue", () => {
  // Arrange
  const titles = [
    "fix(ci): pin Deno formatter version",
    "feat!: change generated board contract",
    "chore(deps): bump playwright",
  ];

  // Act / Assert
  titles.forEach((title) => assert.equal(isConventionalPrTitle(title), true));
});

Deno.test("isConventionalPrTitle_WhenTitleIsGeneratedOrMisformatted_ReturnsFalse", () => {
  // Arrange
  const titles = [
    "Codex/repair harbour layouts",
    "Feat(smart-favicon) : smarter share quality favicon",
    "fix(ci) missing separator",
    "",
  ];

  // Act / Assert
  titles.forEach((title) => assert.equal(isConventionalPrTitle(title), false));
});
