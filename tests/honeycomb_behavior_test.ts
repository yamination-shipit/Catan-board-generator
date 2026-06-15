import { strict as assert } from "node:assert";
import { type Browser, chromium, type Page } from "playwright";

const hostname = "127.0.0.1";
const port = 8091;
const baseUrl = `http://${hostname}:${port}`;

Deno.test({
  name: "honeycomb_WhenUsingCommonControls_KeepsBoardVisibleAndStateShareable",
  sanitizeOps: false,
  sanitizeResources: false,
  async fn() {
    // Arrange
    const server = startStaticServer();
    const browser = await chromium.launch({ headless: true });

    try {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      await page.addInitScript(() => {
        Object.defineProperty(navigator, "clipboard", {
          configurable: true,
          value: {
            writeText: (text: string) => {
              (globalThis as typeof globalThis & { __copiedText?: string }).__copiedText = text;
              return Promise.resolve();
            },
          },
        });
      });
      await page.goto(baseUrl);
      await page.waitForSelector("#board-svg");

      // Act / Assert
      await assertMobileLayoutFits(page);
      await assertBoardFits(page);
      await assertPointerPanMovesBoard(page);
      await assertTopCopyUsesFullUrl(page);
      await assertResourceHighlightingWorks(page);

      await page.locator("#generate-btn").click();
      await page.waitForSelector("#board-svg");
      await assertMobileLayoutFits(page);
      await assertBoardFits(page);

      await page.locator("#collapse-all-btn").click();
      assert.equal(await page.locator("#collapse-all-btn").textContent(), "Expand");
      await page.locator("#collapse-all-btn").click();
      assert.equal(await page.locator("#collapse-all-btn").textContent(), "Collapse");

      assert.equal(await page.locator("#variant-select").isDisabled(), true);
      assert.equal(await page.locator("#challenge-neutral").isDisabled(), true);
      assert.ok(
        await page.locator("#expansion-note").textContent().then((text) =>
          text?.replace(/\s+/g, " ").includes("do not change generation")
        ),
      );

      await page.locator("#mode-2").click();
      assert.equal(await page.locator("#variant-select").isEnabled(), true);
      assert.equal(await page.locator("#challenge-neutral").isEnabled(), true);
      await page.locator("#variant-select").selectOption("compact-tight");
      await page.locator("#rule-preset-select").selectOption("balanced-neutral");
      await page.waitForSelector(".neutral-road");
      assert.ok(
        await page.locator("#rules-body").textContent().then((text) =>
          text?.includes("neutral roads")
        ),
      );

      await page.locator("#expansion-seafarers").check();
      await page.waitForFunction(() => location.search.includes("expansions=seafarers"));
      assert.ok(new URL(page.url()).searchParams.get("expansions")?.includes("seafarers"));
      assert.ok(
        await page.locator("#rules-body").textContent().then((text) =>
          text?.includes("saved to share URLs and history only")
        ),
      );
      await assertMobileLayoutFits(page);
      await assertBoardFits(page);
    } finally {
      await closeBrowser(browser);
      await server.shutdown();
    }
  },
});

function startStaticServer(): Deno.HttpServer {
  return Deno.serve({ hostname, port, onListen: () => {} }, async (request) => {
    const url = new URL(request.url);
    const pathname = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    if (pathname.includes("..")) return new Response("Not found", { status: 404 });

    try {
      const body = await Deno.readFile(`dist${pathname}`);
      return new Response(body, {
        headers: { "content-type": contentType(pathname) },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  });
}

async function assertMobileLayoutFits(page: Page): Promise<void> {
  const viewport = page.viewportSize();
  assert.ok(viewport);
  const pageWidths = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(
    pageWidths.scroll <= pageWidths.client + 1,
    `expected page width ${pageWidths.scroll}px to fit viewport ${pageWidths.client}px`,
  );

  for (
    const selector of ["#board-panel", "main > section:nth-child(2)", "main > section:last-child"]
  ) {
    const box = await page.locator(selector).boundingBox();
    assert.ok(box);
    assert.ok(
      box.x >= -1 && box.x + box.width <= viewport.width + 1,
      `expected ${selector} to fit within ${viewport.width}px viewport`,
    );
  }
}

async function assertBoardFits(page: Page): Promise<void> {
  const wrapper = await page.locator("#zoom-wrapper").boundingBox();
  const board = await page.locator("#board-svg").boundingBox();
  assert.ok(wrapper);
  assert.ok(board);
  assert.ok(board.width <= wrapper.width + 2);
  assert.ok(board.height <= wrapper.height + 2);
  assert.ok(board.width >= wrapper.width * 0.5);
}

async function assertPointerPanMovesBoard(page: Page): Promise<void> {
  const wrapper = await page.locator("#zoom-wrapper").boundingBox();
  assert.ok(wrapper);
  const before = await page.locator("#zoom-content").evaluate((node) =>
    getComputedStyle(node).transform
  );

  await page.mouse.move(wrapper.x + wrapper.width / 2, wrapper.y + wrapper.height / 2);
  await page.mouse.down();
  await page.mouse.move(wrapper.x + wrapper.width / 2 + 40, wrapper.y + wrapper.height / 2 + 24);
  await page.mouse.up();

  const after = await page.locator("#zoom-content").evaluate((node) =>
    getComputedStyle(node).transform
  );
  assert.notEqual(after, before);
}

async function assertTopCopyUsesFullUrl(page: Page): Promise<void> {
  await page.locator("#copy-url-btn").click();
  await page.waitForFunction(() =>
    Boolean((globalThis as typeof globalThis & { __copiedText?: string }).__copiedText)
  );
  const copiedText = await page.evaluate(() =>
    (globalThis as typeof globalThis & { __copiedText?: string }).__copiedText
  );
  assert.equal(copiedText, page.url());
}

async function assertResourceHighlightingWorks(page: Page): Promise<void> {
  await page.locator('.stat-tile[data-resource="wheat"]').click();
  assert.ok(await page.locator('.stat-tile[data-resource="wheat"].is-selected-resource').count());
  assert.ok(await page.locator('.hex[data-resource="wheat"].is-selected-resource').count());

  await page.locator('.hex[data-resource="wood"]').first().click();
  assert.ok(await page.locator('.stat-tile[data-resource="wood"].is-selected-resource').count());
  assert.ok(await page.locator('.hex[data-resource="wood"].is-selected-resource').count());
}

async function closeBrowser(browser: Browser): Promise<void> {
  try {
    await browser.close();
  } catch {
    // Browser teardown should not mask the behavior failure above.
  }
}

function contentType(pathname: string): string {
  if (pathname.endsWith(".css")) return "text/css; charset=utf-8";
  if (pathname.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (pathname.endsWith(".html")) return "text/html; charset=utf-8";
  return "application/octet-stream";
}
