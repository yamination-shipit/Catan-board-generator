const repoUrl = "https://github.com/yamination-shipit/Catan-board-generator";

async function main(): Promise<void> {
  const version = await readVersion();
  await emptyDir("dist");
  await ensureDir("dist/assets");

  const gitFullSha = await commandOutput(["git", "rev-parse", "HEAD"], "unknown");
  const gitSha = gitFullSha === "unknown" ? "unknown" : gitFullSha.slice(0, 7);
  const commitUrl = `${repoUrl}/commit/${gitFullSha}`;
  const releaseUrl = `${repoUrl}/releases/tag/v${version}`;

  await run([
    Deno.execPath(),
    "bundle",
    "--platform",
    "browser",
    "--check",
    "--no-remote",
    "-o",
    "dist/assets/app.js",
    "src/main.ts",
  ]);

  const html = await Deno.readTextFile("src/index.html");
  await Deno.writeTextFile(
    "dist/index.html",
    html
      .replaceAll("%APP_VERSION%", version)
      .replaceAll("%GIT_SHA%", gitSha)
      .replaceAll("%GIT_FULL_SHA%", gitFullSha)
      .replaceAll("%RELEASE_URL%", releaseUrl)
      .replaceAll("%COMMIT_URL%", commitUrl),
  );
  await Deno.copyFile("src/styles.css", "dist/assets/app.css");
}

async function readVersion(): Promise<string> {
  const manifest = JSON.parse(await Deno.readTextFile(".release-please-manifest.json")) as Record<
    string,
    string
  >;
  return manifest["."] ?? "0.1.0";
}

async function commandOutput(command: readonly string[], fallback: string): Promise<string> {
  const output = await new Deno.Command(command[0] ?? "", { args: command.slice(1) }).output();
  if (!output.success) return fallback;
  return new TextDecoder().decode(output.stdout).trim() || fallback;
}

async function run(command: readonly string[]): Promise<void> {
  const status = await new Deno.Command(command[0] ?? "", {
    args: command.slice(1),
    stdout: "inherit",
    stderr: "inherit",
  }).spawn().status;
  if (!status.success) {
    throw new Error(`Command failed: ${command.join(" ")}`);
  }
}

async function emptyDir(path: string): Promise<void> {
  await Deno.remove(path, { recursive: true }).catch((error) => {
    if (!(error instanceof Deno.errors.NotFound)) throw error;
  });
  await ensureDir(path);
}

async function ensureDir(path: string): Promise<void> {
  await Deno.mkdir(path, { recursive: true });
}

if (import.meta.main) {
  await main();
}
