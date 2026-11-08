import { build } from "esbuild";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Bundles tiny consumers of the library SOURCE (the same module graph the published
 * package ships) with tree shaking and checks that unused commands are really dropped.
 */
async function bundle(code: string): Promise<string> {
  const result = await build({
    stdin: { contents: code, resolveDir: here, loader: "ts" },
    bundle: true,
    minify: true,
    treeShaking: true,
    format: "esm",
    platform: "neutral",
    write: false,
    logLevel: "silent",
  });
  return result.outputFiles[0]?.text ?? "";
}

describe("tree shaking", () => {
  it("drops every command when only an error class is imported", async () => {
    const out = await bundle(
      `import { NamecheapError } from "../src"; console.log(NamecheapError.name);`,
    );
    expect(out).not.toContain("namecheap.");
    expect(out.length).toBeLessThan(2_000);
  });

  it("keeps only the used command when a single command is run standalone", async () => {
    const out = await bundle(`
      import { createTransport, domainsCheck, run } from "../src";
      const send = createTransport({ apiUser: "u", apiKey: "k", clientIp: "1.1.1.1" });
      run(domainsCheck, send, { domainList: "a.com" }).then(console.log);
    `);
    expect(out).toContain("namecheap.domains.check");
    for (const unused of [
      "namecheap.domains.create",
      "namecheap.dns.",
      "namecheap.ssl.",
      "namecheap.users.",
      "namecheap.whoisguard.",
      "namecheap.domains.transfer.",
    ]) {
      expect(out).not.toContain(unused);
    }
    expect(out.length).toBeLessThan(16_000);
  });

  it("the Namecheap class still brings every group (documented trade-off)", async () => {
    const out = await bundle(`
      import { Namecheap } from "../src";
      new Namecheap({ apiUser: "u", apiKey: "k", clientIp: "1.1.1.1" }).domains.check({ domainList: "a.com" });
    `);
    expect(out).toContain("namecheap.ssl.getList");
  });
});
