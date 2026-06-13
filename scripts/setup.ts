async function main(): Promise<void> {
  const checks = [
    await commandVersion("deno", ["--version"]),
    await commandVersion("just", ["--version"]),
  ];
  for (const check of checks) {
    console.log(check);
  }
  console.log("Run `just ci` to match the pull request validation path.");
}

async function commandVersion(command: string, args: readonly string[]): Promise<string> {
  const output = await new Deno.Command(command, { args: [...args] }).output().catch(() => null);
  if (!output?.success) return `${command}: missing`;
  return `${command}: ${new TextDecoder().decode(output.stdout).split("\n")[0]}`;
}

if (import.meta.main) {
  await main();
}
