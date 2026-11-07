interface DenoConfig {
  readonly imports?: Readonly<Record<string, string>>;
}

export function getPlaywrightSpecifier(config: DenoConfig): string {
  const specifier = config.imports?.playwright;
  if (!specifier?.match(/^npm:playwright@\d+\.\d+\.\d+$/)) {
    throw new Error("deno.json must pin imports.playwright to an exact npm version");
  }
  return specifier;
}

async function main(): Promise<void> {
  const config = JSON.parse(await Deno.readTextFile("deno.json")) as DenoConfig;
  const specifier = getPlaywrightSpecifier(config);
  const command = new Deno.Command(Deno.execPath(), {
    args: ["run", "-A", specifier, "install", "--with-deps", "chromium"],
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  const status = await command.spawn().status;
  if (!status.success) Deno.exit(status.code);
}

if (import.meta.main) await main();
