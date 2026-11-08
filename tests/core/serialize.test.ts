import { describe, expect, it } from "vitest";

import { ACRONYMS, serializeParams, toParamName } from "../../src/core/serialize";

describe("toParamName", () => {
  it("capitalizes camelCase words", () => {
    expect(toParamName("domainName")).toBe("DomainName");
    expect(toParamName("registrantFirstName")).toBe("RegistrantFirstName");
    expect(toParamName("registrantEmailAddress")).toBe("RegistrantEmailAddress");
  });

  it("upper-cases listed acronyms", () => {
    expect(toParamName("sld")).toBe("SLD");
    expect(toParamName("tld")).toBe("TLD");
    expect(toParamName("nameserverIP")).toBe("NameserverIP");
    expect(toParamName("domainID")).toBe("DomainID");
    expect(toParamName("ipAddress")).toBe("IPAddress");
    expect(toParamName("IPAddress")).toBe("IPAddress");
    expect(toParamName("wgEnabled")).toBe("WGEnabled");
    expect(toParamName("mxPref")).toBe("MXPref");
    expect(toParamName("ttl")).toBe("TTL");
  });

  it("leaves the rest of non-acronym words as written", () => {
    expect(toParamName("eMail")).toBe("EMail");
    expect(toParamName("Domain")).toBe("Domain");
  });

  it("exposes the acronym list", () => {
    expect(ACRONYMS).toEqual(["SLD", "TLD", "IP", "ID", "DNS", "WG", "MX", "TTL"]);
  });
});

describe("serializeParams", () => {
  it("maps names and keeps insertion order", () => {
    expect(serializeParams({ domainName: "a.com", sld: "a", tld: "com" })).toEqual([
      ["DomainName", "a.com"],
      ["SLD", "a"],
      ["TLD", "com"],
    ]);
  });

  it("stringifies booleans and numbers and skips undefined and null", () => {
    expect(serializeParams({ page: 2, flag: true, skip: undefined, none: null })).toEqual([
      ["Page", "2"],
      ["Flag", "true"],
    ]);
  });

  it("serializes arrays in bracket style by default", () => {
    const expected = [
      ["Nameservers[1]", "a"],
      ["Nameservers[2]", "b"],
    ];
    expect(serializeParams({ nameservers: ["a", "b"] })).toEqual(expected);
    expect(serializeParams({ nameservers: ["a", "b"] }, { arrayStyle: "bracket" })).toEqual(
      expected,
    );
  });

  it("serializes arrays in suffix style", () => {
    expect(serializeParams({ nameservers: ["a", "b"] }, { arrayStyle: "suffix" })).toEqual([
      ["Nameservers1", "a"],
      ["Nameservers2", "b"],
    ]);
  });

  it("skips null and undefined array elements and numbers the rest", () => {
    expect(serializeParams({ ns: ["a", null, undefined, "b"] })).toEqual([
      ["Ns[1]", "a"],
      ["Ns[2]", "b"],
    ]);
  });

  it("concatenates nested object keys", () => {
    expect(serializeParams({ registrant: { firstName: "Ana" } })).toEqual([
      ["RegistrantFirstName", "Ana"],
    ]);
  });

  it("lets opts.keys override by dotted camelCase path", () => {
    expect(
      serializeParams({ domainName: "a.com" }, { keys: { domainName: "DomainName1" } }),
    ).toEqual([["DomainName1", "a.com"]]);
    expect(
      serializeParams(
        { registrant: { firstName: "Ana" } },
        { keys: { "registrant.firstName": "X" } },
      ),
    ).toEqual([["X", "Ana"]]);
  });

  it("applies opts.keys to array parameters", () => {
    expect(serializeParams({ ns: ["a"] }, { keys: { ns: "NameServers" } })).toEqual([
      ["NameServers[1]", "a"],
    ]);
  });

  it("returns values raw", () => {
    expect(serializeParams({ note: "a&b c=ç" })).toEqual([["Note", "a&b c=ç"]]);
  });

  it("reads own enumerable keys only", () => {
    const params = Object.create({ inherited: "x" }) as Record<string, unknown>;
    params.own = "y";
    expect(serializeParams(params)).toEqual([["Own", "y"]]);
    expect(serializeParams({}, { keys: { toString: "Bad" } })).toEqual([]);
    expect(serializeParams({ toString: "x" })).toEqual([["ToString", "x"]]);
  });

  it("serializes arrays of plain objects as <Field><index> in both array styles", () => {
    const hosts = [
      { hostName: "@", recordType: "A", address: "1.2.3.4", mxPref: 10, ttl: 1800 },
      { hostName: "www", recordType: "CNAME", address: "example.com." },
    ];
    const expected = [
      ["HostName1", "@"],
      ["RecordType1", "A"],
      ["Address1", "1.2.3.4"],
      ["MXPref1", "10"],
      ["TTL1", "1800"],
      ["HostName2", "www"],
      ["RecordType2", "CNAME"],
      ["Address2", "example.com."],
    ];
    expect(serializeParams({ sld: "a", hosts })).toEqual([["SLD", "a"], ...expected]);
    expect(serializeParams({ hosts }, { arrayStyle: "bracket" })).toEqual(expected);
    expect(serializeParams({ hosts }, { arrayStyle: "suffix" })).toEqual(expected);
  });

  it("numbers object array elements by position and skips undefined and null fields", () => {
    expect(
      serializeParams({
        hosts: [{ hostName: "a", ttl: undefined }, null, { hostName: "c", ttl: null, mxPref: 0 }],
      }),
    ).toEqual([
      ["HostName1", "a"],
      ["HostName3", "c"],
      ["MXPref3", "0"],
    ]);
  });

  it("throws a TypeError naming the key for nested arrays and non-plain objects", () => {
    expect(() => serializeParams({ rows: [["a"]] })).toThrow(TypeError);
    expect(() => serializeParams({ rows: [["a"]] })).toThrow(/rows/);
    expect(() => serializeParams({ when: [new Date(0)] })).toThrow(/when/);
  });

  it("throws a TypeError naming the key for arrays or objects inside array objects", () => {
    expect(() => serializeParams({ hosts: [{ address: ["a"] }] })).toThrow(TypeError);
    expect(() => serializeParams({ hosts: [{ address: ["a"] }] })).toThrow(/hosts.*address/);
    expect(() => serializeParams({ hosts: [{ address: { a: 1 } }] })).toThrow(/hosts.*address/);
  });

  it("throws a TypeError for arrays mixing scalars and objects", () => {
    expect(() => serializeParams({ mixed: ["a", { b: 1 }] })).toThrow(/mixed/);
  });
});
