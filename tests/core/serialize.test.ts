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
  });

  it("leaves the rest of non-acronym words as written", () => {
    expect(toParamName("eMail")).toBe("EMail");
    expect(toParamName("Domain")).toBe("Domain");
  });

  it("exposes the acronym list", () => {
    expect(ACRONYMS).toEqual(["SLD", "TLD", "IP", "ID", "DNS"]);
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

  it("throws a TypeError naming the key for object array elements", () => {
    expect(() => serializeParams({ contacts: [{ a: 1 }] })).toThrow(TypeError);
    expect(() => serializeParams({ contacts: [{ a: 1 }] })).toThrow(/contacts/);
  });
});
