import { describe, expect, it } from "vitest";
import { NamecheapHttpError, NamecheapParseError } from "../../src/core/errors";
import { createTransport, type TransportConfig } from "../../src/core/transport";

const KEY = "SECRET-KEY";
const PROD = "https://api.namecheap.com/xml.response";
const SANDBOX = "https://api.sandbox.namecheap.com/xml.response";

const OK_BODY = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
  <Errors />
  <RequestedCommand>namecheap.test</RequestedCommand>
  <CommandResponse Type="namecheap.test"><Item Name="a" /></CommandResponse>
</ApiResponse>`;

type Call = { url: unknown; init: RequestInit | undefined };

function fakeFetch(respond: (call: Call) => Promise<Response>): {
  fetch: typeof fetch;
  calls: Call[];
} {
  const calls: Call[] = [];
  const impl = (url: unknown, init?: RequestInit): Promise<Response> => {
    const call = { url, init };
    calls.push(call);
    return respond(call);
  };
  return { fetch: impl as unknown as typeof fetch, calls };
}

function config(fetchImpl: typeof fetch, extra: Partial<TransportConfig> = {}): TransportConfig {
  return { apiUser: "alice", apiKey: KEY, clientIp: "1.2.3.4", fetch: fetchImpl, ...extra };
}

async function caught(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (error) {
    return error;
  }
  return undefined;
}

function expectNoKey(error: unknown, calls: Call[]): void {
  const e = error as Error;
  expect(e.message).not.toContain(KEY);
  expect(String(e.cause)).not.toContain(KEY);
  expect(e.stack ?? "").not.toContain(KEY);
  expect(JSON.stringify(Object.fromEntries(Object.entries(e)))).not.toContain(KEY);
  for (const call of calls) expect(String(call.url)).not.toContain(KEY);
}

describe("createTransport", () => {
  it("POSTs a form-encoded body to the production host without a query string", async () => {
    const f = fakeFetch(async () => new Response(OK_BODY, { status: 200 }));
    const send = createTransport(config(f.fetch));
    const el = await send({ command: "namecheap.test", params: [["Foo", "bar baz"]] });
    expect(el.name).toBe("CommandResponse");
    expect(f.calls).toHaveLength(1);
    const { url, init } = f.calls[0]!;
    expect(url).toBe(PROD);
    expect(String(url)).not.toContain("?");
    expect(init?.method).toBe("POST");
    expect(init?.headers).toEqual({ "Content-Type": "application/x-www-form-urlencoded" });
    const body = new URLSearchParams(init?.body as string);
    expect([...body.entries()]).toEqual([
      ["ApiUser", "alice"],
      ["ApiKey", KEY],
      ["UserName", "alice"],
      ["ClientIp", "1.2.3.4"],
      ["Command", "namecheap.test"],
      ["Foo", "bar baz"],
    ]);
  });

  it("uses the sandbox host when sandbox is true", async () => {
    const f = fakeFetch(async () => new Response(OK_BODY, { status: 200 }));
    await createTransport(config(f.fetch, { sandbox: true }))({ command: "c", params: [] });
    expect(f.calls[0]!.url).toBe(SANDBOX);
  });

  it("uses an explicit userName", async () => {
    const f = fakeFetch(async () => new Response(OK_BODY, { status: 200 }));
    await createTransport(config(f.fetch, { userName: "bob" }))({ command: "c", params: [] });
    expect(new URLSearchParams(f.calls[0]!.init?.body as string).get("UserName")).toBe("bob");
  });

  it("maps a 502 to NamecheapHttpError with status", async () => {
    const f = fakeFetch(
      async () => new Response("bad", { status: 502, statusText: "Bad Gateway" }),
    );
    const error = await caught(createTransport(config(f.fetch))({ command: "c", params: [] }));
    expect(error).toBeInstanceOf(NamecheapHttpError);
    expect((error as NamecheapHttpError).status).toBe(502);
    expect((error as NamecheapHttpError).statusText).toBe("Bad Gateway");
    expect((error as Error).message).toBe("Namecheap responded with HTTP 502");
    expectNoKey(error, f.calls);
  });

  it("maps a 405 to NamecheapHttpError with status 405", async () => {
    const f = fakeFetch(async () => new Response("", { status: 405 }));
    const error = await caught(createTransport(config(f.fetch))({ command: "c", params: [] }));
    expect(error).toBeInstanceOf(NamecheapHttpError);
    expect((error as NamecheapHttpError).status).toBe(405);
    expectNoKey(error, f.calls);
  });

  it("maps a rejecting fetch to NamecheapHttpError with cause and no status", async () => {
    const original = new TypeError("fetch failed");
    const f = fakeFetch(async () => {
      throw original;
    });
    const error = await caught(createTransport(config(f.fetch))({ command: "c", params: [] }));
    expect(error).toBeInstanceOf(NamecheapHttpError);
    expect((error as NamecheapHttpError).status).toBeUndefined();
    expect((error as Error).message).toBe("Request to Namecheap failed");
    expect((error as Error).cause).toBe(original);
    expectNoKey(error, f.calls);
  });

  it("aborts after timeoutMs", async () => {
    const f = fakeFetch(
      ({ init }) =>
        new Promise<Response>((_, reject) => {
          const signal = init?.signal;
          if (!signal) {
            reject(new Error("no signal passed to fetch"));
            return;
          }
          signal.addEventListener("abort", () => reject(signal.reason));
        }),
    );
    const error = await caught(
      createTransport(config(f.fetch, { timeoutMs: 5 }))({ command: "c", params: [] }),
    );
    expect(error).toBeInstanceOf(NamecheapHttpError);
    expect((error as NamecheapHttpError).status).toBeUndefined();
    expect((error as Error).cause).toBeDefined();
    expectNoKey(error, f.calls);
  });

  it("encodes special characters exactly in the body string", async () => {
    const f = fakeFetch(async () => new Response(OK_BODY, { status: 200 }));
    await createTransport(config(f.fetch))({
      command: "namecheap.test",
      params: [["Foo", "a&b=c +d ç 😀"]],
    });
    expect(f.calls[0]!.init?.body).toBe(
      "ApiUser=alice&ApiKey=SECRET-KEY&UserName=alice&ClientIp=1.2.3.4&Command=namecheap.test&Foo=a%26b%3Dc+%2Bd+%C3%A7+%F0%9F%98%80",
    );
  });

  it("refuses redirects", async () => {
    const f = fakeFetch(async () => new Response(OK_BODY, { status: 200 }));
    await createTransport(config(f.fetch))({ command: "c", params: [] });
    expect(f.calls[0]!.init?.redirect).toBe("error");
  });

  it("maps a redirect rejection to the generic NamecheapHttpError", async () => {
    const original = new TypeError("fetch failed");
    const f = fakeFetch(async () => {
      throw original;
    });
    const error = await caught(createTransport(config(f.fetch))({ command: "c", params: [] }));
    expect(error).toBeInstanceOf(NamecheapHttpError);
    expect((error as Error).message).toBe("Request to Namecheap failed");
    expect((error as Error).cause).toBe(original);
    expectNoKey(error, f.calls);
  });

  it("sets no signal without timeoutMs", async () => {
    const f = fakeFetch(async () => new Response(OK_BODY, { status: 200 }));
    await createTransport(config(f.fetch))({ command: "c", params: [] });
    expect(f.calls[0]!.init?.signal).toBeUndefined();
  });

  it("maps a failing body read to NamecheapHttpError with cause", async () => {
    const original = new Error("stream broke");
    const response = new Response("x", { status: 200 });
    response.text = () => Promise.reject(original);
    const f = fakeFetch(async () => response);
    const error = await caught(createTransport(config(f.fetch))({ command: "c", params: [] }));
    expect(error).toBeInstanceOf(NamecheapHttpError);
    expect((error as Error).cause).toBe(original);
    expectNoKey(error, f.calls);
  });

  it("rejects a 200 HTML body with NamecheapParseError", async () => {
    const f = fakeFetch(async () => new Response("<html>blocked</html>", { status: 200 }));
    const error = await caught(createTransport(config(f.fetch))({ command: "c", params: [] }));
    expect(error).toBeInstanceOf(NamecheapParseError);
    expectNoKey(error, f.calls);
  });

  describe("sandbox option validation", () => {
    const noop = fakeFetch(async () => new Response(OK_BODY)).fetch;

    it.each([["true"], ["false"], ["1"], [0], [1], [null]])(
      "throws a TypeError for the non-boolean value %j",
      (value) => {
        const attempt = () => createTransport(config(noop, { sandbox: value as never }));
        expect(attempt).toThrow(TypeError);
        expect(attempt).toThrow("NamecheapConfig.sandbox must be a boolean");
        try {
          attempt();
        } catch (error) {
          expect((error as Error).message).not.toContain(String(value));
        }
      },
    );

    it("selects the sandbox host for true", async () => {
      const f = fakeFetch(async () => new Response(OK_BODY));
      await createTransport(config(f.fetch, { sandbox: true }))({ command: "c", params: [] });
      expect(f.calls[0]?.url).toBe(SANDBOX);
    });

    it.each([[false], [undefined]])("selects production for %s", async (value) => {
      const f = fakeFetch(async () => new Response(OK_BODY));
      const extra: Partial<TransportConfig> = value === undefined ? {} : { sandbox: value };
      await createTransport(config(f.fetch, extra))({ command: "c", params: [] });
      expect(f.calls[0]?.url).toBe(PROD);
    });
  });
});
