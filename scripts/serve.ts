const root = "dist";
const port = 8080;
const contentTypes: Record<string, string> = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};

Deno.serve({ hostname: "127.0.0.1", port }, async (request) => {
  const url = new URL(request.url);
  const pathname = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = `${root}${decodeURIComponent(pathname)}`;
  if (!filePath.startsWith(`${root}/`)) return new Response("Not found", { status: 404 });

  try {
    const body = await Deno.readFile(filePath);
    return new Response(body, {
      headers: {
        "content-type": contentTypes[filePath.slice(filePath.lastIndexOf("."))] ??
          "application/octet-stream",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
});
