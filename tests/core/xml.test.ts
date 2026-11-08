import { describe, expect, it } from "vitest";
import { NamecheapParseError } from "../../src/core/errors";
import { parseXml } from "../../src/core/xml";

describe("parseXml", () => {
  it("skips the declaration and comments and builds the tree", () => {
    const root = parseXml(
      '<?xml version="1.0" encoding="UTF-8"?><!-- source: docs --><A x="1"><B/><B y="2">t</B></A>',
    );
    expect(root.name).toBe("A");
    expect(root.attrs).toEqual({ x: "1" });
    expect(root.children).toHaveLength(2);
    expect(root.children[0]?.name).toBe("B");
    expect(root.children[0]?.attrs).toEqual({});
    expect(root.children[1]?.attrs).toEqual({ y: "2" });
    expect(root.children[1]?.text).toBe("t");
  });

  it("decodes entities in text and attribute values", () => {
    const entities = "&amp; &lt; &gt; &quot; &apos; &#65; &#x41;";
    const decoded = `& < > " ' A A`;
    const root = parseXml(`<A v="${entities}">${entities}</A>`);
    expect(root.text).toBe(decoded);
    expect(root.attrs.v).toBe(decoded);
  });

  it("reads CDATA as literal text", () => {
    expect(parseXml("<A><![CDATA[a < b]]></A>").text).toBe("a < b");
  });

  it("keeps attribute values as strings", () => {
    expect(parseXml('<A n="007"/>').attrs.n).toBe("007");
  });

  it("keeps the case of names and accepts single-quoted attributes", () => {
    const root = parseXml("<ApiResponse fooBar='x'/>");
    expect(root.name).toBe("ApiResponse");
    expect(root.attrs).toEqual({ fooBar: "x" });
  });

  it("trims text and ignores whitespace between elements", () => {
    const root = parseXml("<A>\n\t<B> hi </B>\n</A>");
    expect(root.text).toBe("");
    expect(root.children[0]?.text).toBe("hi");
  });

  it("parses a realistic Namecheap response", () => {
    const root = parseXml(
      '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<ApiResponse Status="OK" xmlns="http://api.namecheap.com/xml.response">\n' +
        "\t<Errors />\n\t<Warnings />\n" +
        "\t<RequestedCommand>namecheap.domains.getList</RequestedCommand>\n" +
        '\t<CommandResponse Type="namecheap.domains.getList">\n' +
        "\t\t<DomainGetListResult>\n" +
        '\t\t\t<Domain ID="1" Name="a.com" Note="x &amp; y &quot;z&quot;" />\n' +
        "\t\t</DomainGetListResult>\n" +
        "\t</CommandResponse>\n" +
        "</ApiResponse>",
    );
    expect(root.attrs.Status).toBe("OK");
    expect(root.attrs.xmlns).toBe("http://api.namecheap.com/xml.response");
    expect(root.children.map((c) => c.name)).toEqual([
      "Errors",
      "Warnings",
      "RequestedCommand",
      "CommandResponse",
    ]);
    expect(root.children[2]?.text).toBe("namecheap.domains.getList");
    const domain = root.children[3]?.children[0]?.children[0];
    expect(domain?.name).toBe("Domain");
    expect(domain?.attrs).toEqual({ ID: "1", Name: "a.com", Note: 'x & y "z"' });
  });

  it.each([
    ["empty string", ""],
    ["unterminated markup", "<html><body>blocked</body></html"],
    ["mismatched tags", "<A><B></A>"],
    ["unknown entity", "<A>&nope;</A>"],
    ["DTD", '<!DOCTYPE a [<!ENTITY x "y">]><a>&x;</a>'],
    ["plain text", "just some text"],
    ["two roots", "<A/><B/>"],
  ])("throws NamecheapParseError for %s", (_label, input) => {
    expect(() => parseXml(input)).toThrow(NamecheapParseError);
  });
});
