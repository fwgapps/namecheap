import { describe, expect, it } from "vitest";

import * as api from "../src";
import { createTransport, domainsCheck, run } from "../src";
import {
  dnsCommands,
  domainsCommands,
  nsCommands,
  sslCommands,
  transferCommands,
  usersAddressCommands,
  usersCommands,
  whoisGuardCommands,
} from "../src";
import { createFakeFetch, createTestClient, loadFixture } from "./helpers";

const tables: Record<string, Record<string, unknown>> = {
  domains: domainsCommands,
  dns: dnsCommands,
  ns: nsCommands,
  transfer: transferCommands,
  ssl: sslCommands,
  users: usersCommands,
  usersAddress: usersAddressCommands,
  whoisGuard: whoisGuardCommands,
};

const standaloneName = (prefix: string, key: string) =>
  `${prefix}${key.charAt(0).toUpperCase()}${key.slice(1)}`;

const expected = Object.entries(tables).flatMap(([prefix, table]) =>
  Object.entries(table).map(([key, command]) => [standaloneName(prefix, key), command] as const),
);

describe("standalone commands", () => {
  it("covers all 59 commands", () => {
    expect(expected).toHaveLength(59);
  });

  it.each(expected)("%s is exported and is the command in its group table", (name, command) => {
    expect((api as Record<string, unknown>)[name]).toBe(command);
  });

  it("exports no other <group><Method> names than the ones derived from the tables", () => {
    const groupPrefix = /^(domains|dns|ns|transfer|ssl|users|usersAddress|whoisGuard)[A-Z]/;
    const standalone = Object.keys(api)
      .filter((name) => groupPrefix.test(name) && !name.endsWith("Commands"))
      .sort();
    expect(standalone).toEqual(expected.map(([name]) => name).sort());
  });

  it("run() with createTransport gives the same result as the client", async () => {
    const xml = loadFixture("domains", "check");
    const { fetch, calls } = createFakeFetch(xml);
    const send = createTransport({ apiUser: "u", apiKey: "k", clientIp: "127.0.0.1", fetch });

    const standalone = await run(domainsCheck, send, { domainList: "a.com" });
    const { client } = createTestClient(xml);
    const grouped = await client.domains.check({ domainList: "a.com" });

    expect(standalone).toEqual(grouped);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.check");
    expect(calls[0]?.body.get("DomainList")).toBe("a.com");
  });
});
