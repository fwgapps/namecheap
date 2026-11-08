import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));

/** Reads `tests/fixtures/<group>/<command>.xml`. */
export function loadFixture(group: string, command: string): string {
  const path = join(here, "fixtures", group, `${command}.xml`);
  if (!existsSync(path))
    throw new Error(`Fixture not found: tests/fixtures/${group}/${command}.xml`);
  return readFileSync(path, "utf8");
}
