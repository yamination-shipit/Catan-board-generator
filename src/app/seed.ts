export function createRandomSeed(now = Date.now(), random = Math.random()): string {
  const randomPart = Math.floor(random * 1e9).toString(36);
  return `${now.toString(36)}-${randomPart}`;
}
