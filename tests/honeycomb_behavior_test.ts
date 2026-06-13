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
      await page.goto(baseUrl);
      await page.waitForSelector("#board-svg");

      // Act / Assert
      await assertBoardFits(page);

      await page.locator("#generate-btn").click();
      await page.waitForSelector("#board-svg");
      await assertBoardFits(page);

      await page.locator("#collapse-all-btn").click();
      assert.equal(await page.locator("#collapse-all-btn").textContent(), "Expand");
      await page.locator("#collapse-all-btn").click();
      assert.equal(await page.locator("#collapse-all-btn").textContent(), "Collapse");

      await page.locator("#mode-2").click();
      await page.locator("#variant-select").selectOption("compact-tight");
      await page.locator("#rule-preset-select").selectOption("balanced-neutral");
      await page.waitForSelector(".neutral-road");
      assert.ok(
        await page.locator("#setup-body").textContent().then((text) =>
          text?.includes("neutral roads")
        ),
      );

      await page.locator("#expansion-seafarers").check();
      await page.waitForFunction(() => location.search.includes("expansions=seafarers"));
      assert.ok(new URL(page.url()).searchParams.get("expansions")?.includes("seafarers"));
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

async function assertBoardFits(page: Page): Promise<void> {
  const wrapper = await page.locator("#zoom-wrapper").boundingBox();
  const board = await page.locator("#board-svg").boundingBox();
  assert.ok(wrapper);
  assert.ok(board);
  assert.ok(board.width <= wrapper.width + 2);
  assert.ok(board.height <= wrapper.height + 2);
  assert.ok(board.width >= wrapper.width * 0.5);
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
