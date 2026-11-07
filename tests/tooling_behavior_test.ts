import { strict as assert } from "node:assert";
import { getPlaywrightSpecifier } from "../scripts/install_playwright.ts";

Deno.test("getPlaywrightSpecifier_WhenVersionIsPinned_ReturnsConfiguredPackage", () => {
  // Arrange
  const config = { imports: { playwright: "npm:playwright@1.64.1" } };

  // Act
  const specifier = getPlaywrightSpecifier(config);

  // Assert
  assert.equal(specifier, "npm:playwright@1.64.1");
});

Deno.test("getPlaywrightSpecifier_WhenVersionCanDrift_Throws", () => {
  // Arrange
  const config = { imports: { playwright: "npm:playwright" } };

  // Act / Assert
  assert.throws(() => getPlaywrightSpecifier(config), /must pin/);
});
