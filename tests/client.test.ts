import { describe, expect, it } from "vitest";
import Default, {
  Namecheap,
  NamecheapError,
  NamecheapHttpError,
  NamecheapParseError,
} from "../src";
import { createTransport } from "../src/core/transport";
import { createFakeFetch, createTestClient } from "./helpers";

const OK_XML =
  '<?xml version="1.0" encoding="utf-8"?><ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response"><Errors /><RequestedCommand>x</RequestedCommand><CommandResponse Type="x" /></ApiResponse>';

describe("Namecheap client", () => {
  it("exposes the eight command groups and the public exports", () => {
    const client = new Namecheap({ apiUser: "u", apiKey: "k", clientIp: "1.1.1.1" });
    for (const name of [
      "domains",
      "dns",
      "ns",
      "transfer",
      "ssl",
      "users",
      "usersAddress",
      "whoisGuard",
    ] as const) {
      expect(client[name]).toBeDefined();
    }
    expect(Default).toBe(Namecheap);
    expect(new NamecheapError([{ code: 1, message: "x" }])).toBeInstanceOf(Error);
    expect(new NamecheapHttpError("x")).toBeInstanceOf(Error);
    expect(new NamecheapParseError("x")).toBeInstanceOf(Error);
  });

  it("createTestClient builds a client", () => {
    const { client, calls } = createTestClient(OK_XML);
    expect(client.domains).toBeDefined();
    expect(calls).toEqual([]);
  });

  it("createFakeFetch records calls and returns the xml", async () => {
    const { fetch, calls } = createFakeFetch(OK_XML);
    const send = createTransport({
      apiUser: "test-user",
      apiKey: "SECRET-KEY",
      clientIp: "127.0.0.1",
      sandbox: true,
      fetch,
    });
    const el = await send({ command: "namecheap.test.run", params: [] });
    expect(el.name).toBe("CommandResponse");
    expect(calls).toHaveLength(1);
    expect(calls[0]?.method).toBe("POST");
    expect(calls[0]?.body.get("Command")).toBe("namecheap.test.run");
    expect(calls[0]?.url).toContain("sandbox");
  });
});
