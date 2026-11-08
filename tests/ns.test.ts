import { describe, expect, it } from "vitest";
import { NamecheapError } from "../src";
import { nsCommands } from "../src/commands/ns";
import { createTestClient, loadFixture } from "./helpers";

describe("ns", () => {
  it("create sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ns", "create"));
    const result = await client.ns.create({
      sld: "domain",
      tld: "com",
      nameserver: "ns1.domain.com",
      ip: "1.1.1.1",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.ns.create");
    expect(calls[0]?.body.get("SLD")).toBe("domain");
    expect(calls[0]?.body.get("TLD")).toBe("com");
    expect(calls[0]?.body.get("Nameserver")).toBe("ns1.domain.com");
    expect(calls[0]?.body.get("IP")).toBe("1.1.1.1");
    expect(result).toEqual({
      domain: "domain.com",
      nameserver: "ns1.domain.com",
      ip: "1.1.1.1",
      isSuccess: true,
    });
  });

  it("delete sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ns", "delete"));
    const result = await client.ns.delete({
      sld: "domain",
      tld: "com",
      nameserver: "ns1.domain.com",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.ns.delete");
    expect(calls[0]?.body.get("SLD")).toBe("domain");
    expect(calls[0]?.body.get("TLD")).toBe("com");
    expect(calls[0]?.body.get("Nameserver")).toBe("ns1.domain.com");
    expect(result).toEqual({ domain: "domain.com", nameserver: "ns1.domain.com", isSuccess: true });
  });

  it("getInfo sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ns", "getInfo"));
    const result = await client.ns.getInfo({
      sld: "domain",
      tld: "com",
      nameserver: "ns1.domain.com",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.ns.getInfo");
    expect(calls[0]?.body.get("SLD")).toBe("domain");
    expect(calls[0]?.body.get("TLD")).toBe("com");
    expect(calls[0]?.body.get("Nameserver")).toBe("ns1.domain.com");
    expect(result).toEqual({
      domain: "domain.com",
      nameserver: "ns1.domain.com",
      ip: "12.23.23.23",
      nameserverStatuses: ["OK", "Linked"],
    });
  });

  it("getInfo omits nameserverStatuses when the element is absent and returns an array for one status", async () => {
    const wrap = (inner: string): string => `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
  <Errors />
  <RequestedCommand>namecheap.domains.ns.getInfo</RequestedCommand>
  <CommandResponse Type="namecheap.domains.ns.getInfo">
    <DomainNSInfoResult Domain="domain.com" Nameserver="ns1.domain.com" IP="12.23.23.23">${inner}</DomainNSInfoResult>
  </CommandResponse>
</ApiResponse>`;
    const params = { sld: "domain", tld: "com", nameserver: "ns1.domain.com" };

    const absent = await createTestClient(wrap("")).client.ns.getInfo(params);
    expect(absent).toEqual({
      domain: "domain.com",
      nameserver: "ns1.domain.com",
      ip: "12.23.23.23",
    });
    expect(Object.keys(absent)).not.toContain("nameserverStatuses");

    const single = await createTestClient(
      wrap("<NameserverStatuses><Status>OK</Status></NameserverStatuses>"),
    ).client.ns.getInfo(params);
    expect(single.nameserverStatuses).toEqual(["OK"]);
  });

  it("update sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("ns", "update"));
    const result = await client.ns.update({
      sld: "domain",
      tld: "com",
      nameserver: "ns1.domain.com",
      oldIP: "1.1.1.1",
      ip: "2.2.2.2",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.ns.update");
    expect(calls[0]?.body.get("SLD")).toBe("domain");
    expect(calls[0]?.body.get("TLD")).toBe("com");
    expect(calls[0]?.body.get("Nameserver")).toBe("ns1.domain.com");
    expect(calls[0]?.body.get("OldIP")).toBe("1.1.1.1");
    expect(calls[0]?.body.get("IP")).toBe("2.2.2.2");
    expect(result).toEqual({ domain: "domain.com", nameserver: "ns1.domain.com", isSuccess: true });
  });

  it("rejects with NamecheapError carrying the code and message of an error response", async () => {
    const { client } = createTestClient(loadFixture("ns", "error"));
    const error = await client.ns
      .create({ sld: "missing", tld: "com", nameserver: "ns1.missing.com", ip: "1.1.1.1" })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NamecheapError);
    expect((error as NamecheapError).code).toBe(2019166);
    expect((error as NamecheapError).message).toBe("Domain not found");
  });

  it("keeps every command key consistent with its Namecheap command name", () => {
    for (const [key, command] of Object.entries(nsCommands)) {
      expect(command.name.split(".").at(-1)?.toLowerCase()).toBe(key.toLowerCase());
    }
  });
});
