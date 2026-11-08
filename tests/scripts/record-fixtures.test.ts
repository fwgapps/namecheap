import { describe, expect, it } from "vitest";
import {
  SANDBOX_URL,
  buildRequest,
  main,
  maskSecrets,
  readEnv,
  resolveFixturePath,
  withSourceHeader,
} from "../../scripts/record-fixtures.mjs";

const env = {
  NAMECHEAP_API_USER: "fakeuser",
  NAMECHEAP_API_KEY: "sekret-key-123",
  NAMECHEAP_CLIENT_IP: "203.0.113.7",
};

describe("buildRequest", () => {
  it("always targets the sandbox host and cannot be overridden", () => {
    const entry = { fixture: "domains/getList", command: "namecheap.domains.getList" };
    const { url } = buildRequest(entry, {
      ...env,
      NAMECHEAP_HOST: "https://evil.example",
      HOST: "evil.example",
    });
    expect(SANDBOX_URL).toBe("https://api.sandbox.namecheap.com/xml.response");
    expect(url).toBe("https://api.sandbox.namecheap.com/xml.response");
  });

  it("builds a form-encoded POST with fields in order and encoded values", () => {
    const { init } = buildRequest(
      {
        fixture: "domains/getList",
        command: "namecheap.domains.getList",
        params: { SearchTerm: "a&b=c çé", Page: "1" },
      },
      env,
    );
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/x-www-form-urlencoded" });
    const params = new URLSearchParams(init.body);
    expect([...params.keys()]).toEqual([
      "ApiUser",
      "ApiKey",
      "UserName",
      "ClientIp",
      "Command",
      "SearchTerm",
      "Page",
    ]);
    expect(params.get("UserName")).toBe("fakeuser");
    expect(params.get("ApiKey")).toBe("sekret-key-123");
    expect(params.get("ClientIp")).toBe("203.0.113.7");
    expect(params.get("SearchTerm")).toBe("a&b=c çé");
    expect(init.body).not.toContain("a&b=c");
  });
});

describe("readEnv", () => {
  it("returns the three variables", () => {
    expect(readEnv(env)).toEqual({
      apiUser: "fakeuser",
      apiKey: "sekret-key-123",
      clientIp: "203.0.113.7",
    });
  });

  it.each(["NAMECHEAP_API_USER", "NAMECHEAP_API_KEY", "NAMECHEAP_CLIENT_IP"])(
    "names missing %s without leaking values",
    (name) => {
      const partial: Record<string, string> = { ...env };
      delete partial[name];
      let message = "";
      try {
        readEnv(partial);
      } catch (error) {
        message = (error as Error).message;
      }
      expect(message).toContain(name);
      for (const value of Object.values(partial)) expect(message).not.toContain(value);
    },
  );

  it("treats an empty value as missing", () => {
    expect(() => readEnv({ ...env, NAMECHEAP_API_KEY: "" })).toThrow(/NAMECHEAP_API_KEY/);
  });
});

describe("maskSecrets", () => {
  it("replaces every occurrence of the key but not the client IP", () => {
    const out = maskSecrets("a sekret-key-123 b sekret-key-123 from 203.0.113.7", env);
    expect(out).toBe("a *** b *** from 203.0.113.7");
  });

  it("does not mask everything when the key is empty or missing", () => {
    expect(maskSecrets("hello", { ...env, NAMECHEAP_API_KEY: "" })).toBe("hello");
    expect(maskSecrets("hello", {})).toBe("hello");
  });
});

describe("resolveFixturePath", () => {
  it("maps a fixture name below tests/fixtures", () => {
    expect(resolveFixturePath("domains/getList", "/repo")).toBe(
      "/repo/tests/fixtures/domains/getList.xml",
    );
  });

  it.each([
    "/etc/passwd",
    "/domains/getList",
    "../x/getList",
    "domains/../getList",
    "domains/..",
    "domains//getList",
    "domains/",
    "/getList",
    "",
    "getList",
    "a/b/c",
    "domains/get List",
    "domains\\getList",
    "do mains/getList",
    "domains/getList.xml/",
    "C:/x",
  ])("rejects %j", (fixture) => {
    expect(() => resolveFixturePath(fixture, "/repo")).toThrow(/fixture/i);
  });
});

describe("withSourceHeader", () => {
  const header = "<!-- source: sandbox -->";
  it("prepends the header", () => {
    expect(withSourceHeader("<ApiResponse/>")).toBe(`${header}\n<ApiResponse/>`);
  });
  it("replaces existing leading source/derived comment lines with one line", () => {
    const input = "<!-- source: derived from docs -->\n<!-- source: manual -->\n<ApiResponse/>";
    expect(withSourceHeader(input)).toBe(`${header}\n<ApiResponse/>`);
  });
  it("replaces leading `derived from` comment lines", () => {
    const input = "<!-- derived from the Namecheap docs -->\n<!-- source: x -->\n<ApiResponse/>";
    expect(withSourceHeader(input)).toBe(`${header}\n<ApiResponse/>`);
    expect(withSourceHeader("<!-- derived from docs -->\n<a/>")).toBe(`${header}\n<a/>`);
  });
  it("keeps other comments and the XML declaration after the header", () => {
    const input = '<?xml version="1.0"?>\n<!-- note -->\n<ApiResponse/>';
    expect(withSourceHeader(input)).toBe(`${header}\n${input}`);
  });
  it("is idempotent", () => {
    const once = withSourceHeader("<a/>");
    expect(withSourceHeader(once)).toBe(once);
  });
});

describe("main", () => {
  const okXml = '<?xml version="1.0"?><ApiResponse Status="OK"><CommandResponse/></ApiResponse>';
  const errXml = `<ApiResponse Status="ERROR"><Errors><Error Number="1">bad sekret-key-123</Error></Errors></ApiResponse>`;

  function setup(entries: unknown) {
    const written = new Map<string, string>();
    const logs: string[] = [];
    const bodies: Record<string, string> = {
      "namecheap.domains.getList": okXml,
      "namecheap.domains.check": errXml,
      "namecheap.domains.getInfo": errXml,
    };
    const calls: string[] = [];
    const fakeFetch = async (url: string | URL | Request, init?: RequestInit) => {
      calls.push(String(url));
      const command = new URLSearchParams(String(init?.body)).get("Command") ?? "";
      return new Response(bodies[command] ?? "", { status: 200 });
    };
    const deps = {
      argv: ["node", "record-fixtures.mjs", "req.json"],
      env,
      fetch: fakeFetch as typeof fetch,
      rootDir: "/repo",
      readFile: async () => JSON.stringify(entries),
      writeFile: async (path: string, content: string) => {
        written.set(path, content);
      },
      log: (line: string) => logs.push(line),
    };
    return { deps, written, logs, calls };
  }

  it("writes OK and allowError entries, skips unflagged errors, never leaks the key", async () => {
    const { deps, written, logs, calls } = setup([
      { fixture: "domains/getList", command: "namecheap.domains.getList", params: { Page: "1" } },
      { fixture: "domains/check", command: "namecheap.domains.check" },
      { fixture: "domains/getInfoError", command: "namecheap.domains.getInfo", allowError: true },
    ]);
    const code = await main(deps);
    expect(code).toBe(1); // one entry was skipped
    expect(calls).toEqual(Array(3).fill(SANDBOX_URL));
    expect([...written.keys()]).toEqual([
      "/repo/tests/fixtures/domains/getList.xml",
      "/repo/tests/fixtures/domains/getInfoError.xml",
    ]);
    for (const content of written.values()) {
      expect(content.split("\n")[0]).toBe("<!-- source: sandbox -->");
      expect(content).not.toContain("sekret-key-123");
    }
    expect(written.get("/repo/tests/fixtures/domains/getInfoError.xml")).toContain("bad ***");
    const output = logs.join("\n");
    expect(output).not.toContain("sekret-key-123");
    expect(output).toContain("domains/check");
    expect(output).toMatch(/skipped/i);
    expect(output).toMatch(/personal data/i);
  });

  it("rejects invalid entries before sending anything", async () => {
    const { deps, written, calls } = setup([
      { fixture: "domains/getList", command: "namecheap.domains.getList" },
      { fixture: "../evil", command: "namecheap.domains.getList" },
    ]);
    await expect(main(deps)).rejects.toThrow(/fixture/i);
    expect(calls).toHaveLength(0);
    expect(written.size).toBe(0);
  });

  it.each([
    [{ fixture: "domains/x" }],
    [{ fixture: "domains/x", command: "c", params: { Page: 1 } }],
    [{ fixture: "domains/x", command: "c", params: [] }],
    [{ fixture: "domains/x", command: "c", allowError: "yes" }],
    ["nope"],
  ])("rejects malformed entry %j", async (entry) => {
    const { deps } = setup([entry]);
    await expect(main(deps)).rejects.toThrow();
  });

  it("fails clearly without a requests file argument", async () => {
    const { deps } = setup([]);
    await expect(main({ ...deps, argv: ["node", "x"] })).rejects.toThrow(/usage/i);
  });

  it("masks the key in network errors", async () => {
    const { deps } = setup([{ fixture: "domains/a", command: "c" }]);
    const failing = async () => {
      throw new Error("connect failed for ApiKey=sekret-key-123");
    };
    const logs: string[] = [];
    const code = await main({
      ...deps,
      fetch: failing as unknown as typeof fetch,
      log: (l: string) => logs.push(l),
    });
    expect(code).toBe(1);
    expect(logs.join("\n")).not.toContain("sekret-key-123");
  });

  it("passes redirect: error to fetch", async () => {
    const { deps } = setup([{ fixture: "domains/getList", command: "namecheap.domains.getList" }]);
    const inits: (RequestInit | undefined)[] = [];
    const spy = async (_url: string | URL | Request, init?: RequestInit) => {
      inits.push(init);
      return new Response(okXml);
    };
    await main({ ...deps, fetch: spy as typeof fetch });
    expect(inits).toHaveLength(1);
    expect(inits[0]?.redirect).toBe("error");
  });

  it("ignores host overrides from argv, env and entry fields", async () => {
    const { deps, calls } = setup([
      {
        fixture: "domains/getList",
        command: "namecheap.domains.getList",
        host: "evil.example",
        url: "https://evil.example/x",
      },
    ]);
    await main({
      ...deps,
      argv: ["node", "x", "req.json", "--host", "evil.example"],
      env: { ...env, NAMECHEAP_HOST: "evil.example" },
    });
    expect(calls).toEqual([SANDBOX_URL]);
  });

  it.each([[false], [true]])(
    "does not write a non-envelope 2xx body (allowError=%s)",
    async (allowError) => {
      const { deps, written } = setup([
        { fixture: "domains/getList", command: "c", allowError },
        { fixture: "domains/empty", command: "e", allowError },
      ]);
      const html = async (_u: unknown, init?: RequestInit) =>
        new Response(
          new URLSearchParams(String(init?.body)).get("Command") === "e"
            ? ""
            : "<html>maintenance</html>",
        );
      const code = await main({ ...deps, fetch: html as unknown as typeof fetch });
      expect(code).toBe(1);
      expect(written.size).toBe(0);
    },
  );

  it("exits 0 when every entry is OK", async () => {
    const { deps, written } = setup([
      { fixture: "domains/getList", command: "namecheap.domains.getList" },
    ]);
    expect(await main(deps)).toBe(0);
    expect(written.size).toBe(1);
  });

  it.each([["ApiUser"], ["apikey"], ["USERNAME"], ["clientIp"], ["command"]])(
    "rejects reserved param %s without leaking env values",
    async (name) => {
      const { deps, calls } = setup([
        { fixture: "domains/getList", command: "c", params: { [name]: "x" } },
      ]);
      const error = await main(deps).catch((e: Error) => e);
      expect(error).toBeInstanceOf(Error);
      expect((error as Error).message).toMatch(/reserved/i);
      for (const value of Object.values(env)) expect((error as Error).message).not.toContain(value);
      expect(calls).toHaveLength(0);
    },
  );

  it("rejects duplicate fixture values before sending anything", async () => {
    const { deps, calls } = setup([
      { fixture: "domains/getList", command: "a" },
      { fixture: "domains/getList", command: "b" },
    ]);
    await expect(main(deps)).rejects.toThrow(/duplicate/i);
    expect(calls).toHaveLength(0);
  });
});
