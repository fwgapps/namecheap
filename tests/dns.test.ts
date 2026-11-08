import { describe, expect, it } from "vitest";
import { NamecheapError } from "../src";
import { dnsCommands } from "../src/commands/dns";
import type { DnsHostRecord } from "../src/commands/dns";
import { createTestClient, loadFixture } from "./helpers";

describe("dns", () => {
  it("setDefault sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "setDefault"));
    const result = await client.dns.setDefault({ sld: "domain", tld: "net" });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.dns.setDefault");
    expect(calls[0]?.body.get("SLD")).toBe("domain");
    expect(calls[0]?.body.get("TLD")).toBe("net");
    expect(result).toEqual({ domain: "domain.net", updated: true });
  });

  it("setCustom sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "setCustom"));
    const result = await client.dns.setCustom({
      sld: "domain",
      tld: "net",
      nameservers: "dns1.example.com,dns2.example.com",
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.dns.setCustom");
    expect(calls[0]?.body.get("SLD")).toBe("domain");
    expect(calls[0]?.body.get("TLD")).toBe("net");
    expect(calls[0]?.body.get("Nameservers")).toBe("dns1.example.com,dns2.example.com");
    expect(result).toEqual({ domain: "domain.net", updated: true });
  });

  it("getList sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "getList"));
    const result = await client.dns.getList({ sld: "domain", tld: "net" });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.dns.getList");
    expect(calls[0]?.body.get("SLD")).toBe("domain");
    expect(calls[0]?.body.get("TLD")).toBe("net");
    expect(result).toEqual({
      domain: "domain.net",
      isUsingOurDNS: true,
      isPremiumDNS: false,
      isUsingFreeDNS: false,
      nameservers: ["dns1.registrar-servers.com", "dns2.registrar-servers.com"],
    });
  });

  it("getList returns an array for a single nameserver and omits absent optional flags", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
  <Errors />
  <RequestedCommand>namecheap.domains.dns.getList</RequestedCommand>
  <CommandResponse Type="namecheap.domains.dns.getList">
    <DomainDNSGetListResult Domain="domain.net" IsUsingOurDNS="false">
      <Nameserver>ns1.example.com</Nameserver>
    </DomainDNSGetListResult>
  </CommandResponse>
</ApiResponse>`;
    const { client } = createTestClient(xml);
    const result = await client.dns.getList({ sld: "domain", tld: "net" });
    expect(result).toEqual({
      domain: "domain.net",
      isUsingOurDNS: false,
      nameservers: ["ns1.example.com"],
    });
    expect(Object.keys(result)).not.toContain("isPremiumDNS");
    expect(Object.keys(result)).not.toContain("isUsingFreeDNS");
  });

  it("getHosts sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "getHosts"));
    const result = await client.dns.getHosts({ sld: "domain", tld: "net" });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.dns.getHosts");
    expect(calls[0]?.body.get("SLD")).toBe("domain");
    expect(calls[0]?.body.get("TLD")).toBe("net");
    expect(result).toEqual({
      domain: "domain.net",
      emailType: "MX",
      isUsingOurDNS: true,
      hosts: [
        {
          hostId: 877748,
          name: "host33",
          type: "MX",
          address: "addr.domain.com.",
          mxPref: 10,
          ttl: 1800,
          associatedAppTitle: "",
          friendlyName: "",
          isActive: true,
          isDDNSEnabled: false,
        },
        {
          hostId: 877749,
          name: "@",
          type: "CNAME",
          address: "anotherdomain.com",
          mxPref: 10,
          ttl: 1800,
          associatedAppTitle: "",
          friendlyName: "",
          isActive: true,
          isDDNSEnabled: false,
        },
      ],
    });
  });

  it("getHosts returns an array for one host and tolerates absent fixture-only fields", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
  <Errors />
  <RequestedCommand>namecheap.domains.dns.getHosts</RequestedCommand>
  <CommandResponse Type="namecheap.domains.dns.getHosts">
    <DomainDNSGetHostsResult Domain="domain.net" IsUsingOurDNS="true">
      <host HostId="1" Name="@" Type="A" Address="1.2.3.4" MXPref="10" TTL="1800" />
    </DomainDNSGetHostsResult>
  </CommandResponse>
</ApiResponse>`;
    const { client } = createTestClient(xml);
    const result = await client.dns.getHosts({ sld: "domain", tld: "net" });
    expect(result).toEqual({
      domain: "domain.net",
      isUsingOurDNS: true,
      hosts: [{ hostId: 1, name: "@", type: "A", address: "1.2.3.4", mxPref: 10, ttl: 1800 }],
    });
  });

  it("getEmailForwarding sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "getEmailForwarding"));
    const result = await client.dns.getEmailForwarding({ domainName: "example.com" });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.dns.getEmailForwarding");
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    expect(result).toEqual({
      domain: "example.com",
      forwards: [
        { mailbox: "info", forwardTo: "user@gmail.com" },
        { mailbox: "support", forwardTo: "support@company.com" },
      ],
    });
  });

  it("getEmailForwarding returns an empty array when there are no forwards", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
  <Errors />
  <RequestedCommand>namecheap.domains.dns.getEmailForwarding</RequestedCommand>
  <CommandResponse Type="namecheap.domains.dns.getEmailForwarding">
    <DomainEmailForwardingResult Domain="example.com" />
  </CommandResponse>
</ApiResponse>`;
    const { client } = createTestClient(xml);
    expect(await client.dns.getEmailForwarding({ domainName: "example.com" })).toEqual({
      domain: "example.com",
      forwards: [],
    });
  });

  it("setEmailForwarding sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "setEmailForwarding"));
    const result = await client.dns.setEmailForwarding({
      domainName: "example.com",
      forwards: [{ mailBox: "info", forwardTo: "user@gmail.com" }],
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.dns.setEmailForwarding");
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    expect(calls[0]?.body.get("MailBox1")).toBe("info");
    expect(calls[0]?.body.get("ForwardTo1")).toBe("user@gmail.com");
    expect(result).toEqual({ domain: "example.com", isSuccess: true });
  });

  it("setEmailForwarding numbers three records on the wire", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "setEmailForwarding"));
    await client.dns.setEmailForwarding({
      domainName: "example.com",
      forwards: [
        { mailBox: "info", forwardTo: "a@gmail.com" },
        { mailBox: "support", forwardTo: "b@gmail.com" },
        { mailBox: "billing", forwardTo: "c@gmail.com" },
      ],
    });
    expect([...(calls[0]?.body.entries() ?? [])].filter(([k]) => /\d$/.test(k))).toEqual([
      ["MailBox1", "info"],
      ["ForwardTo1", "a@gmail.com"],
      ["MailBox2", "support"],
      ["ForwardTo2", "b@gmail.com"],
      ["MailBox3", "billing"],
      ["ForwardTo3", "c@gmail.com"],
    ]);
  });

  it("setHosts sends the documented request and parses the fixture", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "setHosts"));
    const result = await client.dns.setHosts({
      sld: "domain",
      tld: "net",
      emailType: "MX",
      hosts: [{ hostName: "@", recordType: "A", address: "1.2.3.4", mxPref: 10, ttl: 1800 }],
    });
    expect(calls[0]?.body.get("Command")).toBe("namecheap.domains.dns.setHosts");
    expect(calls[0]?.body.get("SLD")).toBe("domain");
    expect(calls[0]?.body.get("TLD")).toBe("net");
    expect(calls[0]?.body.get("EmailType")).toBe("MX");
    expect(calls[0]?.body.get("HostName1")).toBe("@");
    expect(calls[0]?.body.get("RecordType1")).toBe("A");
    expect(calls[0]?.body.get("Address1")).toBe("1.2.3.4");
    expect(calls[0]?.body.get("MXPref1")).toBe("10");
    expect(calls[0]?.body.get("TTL1")).toBe("1800");
    expect(result).toEqual({ domain: "domain.net", emailType: "MX", isSuccess: true });
  });

  it("setHosts numbers three records on the wire and omits absent optional fields", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "setHosts"));
    await client.dns.setHosts({
      sld: "domain",
      tld: "net",
      hosts: [
        { hostName: "@", recordType: "A", address: "1.2.3.4", ttl: 1800 },
        { hostName: "www", recordType: "CNAME", address: "domain.net." },
        { hostName: "@", recordType: "MX", address: "mail.domain.net.", mxPref: 20, ttl: 300 },
      ],
    });
    const body = calls[0]?.body;
    expect([...(body?.entries() ?? [])].filter(([k]) => /\d$/.test(k))).toEqual([
      ["HostName1", "@"],
      ["RecordType1", "A"],
      ["Address1", "1.2.3.4"],
      ["TTL1", "1800"],
      ["HostName2", "www"],
      ["RecordType2", "CNAME"],
      ["Address2", "domain.net."],
      ["HostName3", "@"],
      ["RecordType3", "MX"],
      ["Address3", "mail.domain.net."],
      ["MXPref3", "20"],
      ["TTL3", "300"],
    ]);
    expect(body?.has("EmailType")).toBe(false);
  });

  it("setHosts parses a response without EmailType", async () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">
  <Errors />
  <RequestedCommand>namecheap.domains.dns.setHosts</RequestedCommand>
  <CommandResponse Type="namecheap.domains.dns.setHosts">
    <DomainDNSSetHostsResult Domain="domain.net" IsSuccess="true" />
  </CommandResponse>
</ApiResponse>`;
    const { client } = createTestClient(xml);
    const result = await client.dns.setHosts({
      sld: "domain",
      tld: "net",
      hosts: [{ hostName: "@", recordType: "A", address: "1.2.3.4" }],
    });
    expect(result).toEqual({ domain: "domain.net", isSuccess: true });
  });

  it("setHosts rejects an empty or all-null host list without sending anything", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "setHosts"));
    // @ts-expect-error hosts must be a non-empty list
    const empty = client.dns.setHosts({ sld: "domain", tld: "net", hosts: [] });
    await expect(empty).rejects.toThrow(TypeError);
    await expect(empty).rejects.toThrow(/setHosts.*whole zone/);
    const nulls = client.dns.setHosts({
      sld: "domain",
      tld: "net",
      hosts: [null, undefined] as unknown as [DnsHostRecord],
    });
    await expect(nulls).rejects.toThrow(/setHosts/);
    expect(calls).toHaveLength(0);
  });

  it("setEmailForwarding with an empty list is allowed and sends no record fields", async () => {
    const { client, calls } = createTestClient(loadFixture("dns", "setEmailForwarding"));
    await client.dns.setEmailForwarding({ domainName: "example.com", forwards: [] });
    const names = [...(calls[0]?.body.keys() ?? [])];
    expect(calls[0]?.body.get("DomainName")).toBe("example.com");
    expect(names.some((k) => /^(MailBox|ForwardTo)/.test(k))).toBe(false);
  });

  it("rejects with NamecheapError carrying the code and message of an error response", async () => {
    const { client } = createTestClient(loadFixture("dns", "error"));
    const error = await client.dns.setDefault({ sld: "missing", tld: "com" }).catch((e) => e);
    expect(error).toBeInstanceOf(NamecheapError);
    expect((error as NamecheapError).code).toBe(2019166);
    expect((error as NamecheapError).message).toBe("Domain not found");
  });

  it("keeps every command key consistent with its Namecheap command name", () => {
    for (const [key, command] of Object.entries(dnsCommands)) {
      expect(command.name.split(".").at(-1)?.toLowerCase()).toBe(key.toLowerCase());
    }
    expect(Object.keys(dnsCommands).sort()).toEqual(
      [
        "getEmailForwarding",
        "getHosts",
        "getList",
        "setCustom",
        "setDefault",
        "setEmailForwarding",
        "setHosts",
      ].sort(),
    );
  });
});
