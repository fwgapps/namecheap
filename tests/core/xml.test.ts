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
    ["constructor in text", "<A>&constructor;</A>"],
    ["toString in text", "<A>&toString;</A>"],
    ["__proto__ in text", "<A>&__proto__;</A>"],
    ["valueOf in an attribute", '<A v="&valueOf;"/>'],
  ])("rejects prototype names as entities: %s", (_label, input) => {
    expect(() => parseXml(input)).toThrow(NamecheapParseError);
  });

  it("truncates a huge unknown entity name in the error message", () => {
    const name = "x".repeat(500);
    let message = "";
    try {
      parseXml(`<A>&${name};</A>`);
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("unknown entity");
    expect(message).toContain("…");
    expect(message.length).toBeLessThan(100);
    expect(message).not.toContain("x".repeat(33));
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

describe("parseXml decoding", () => {
  it("keeps the text that follows the last entity", () => {
    expect(parseXml("<A>&amp; tail</A>").text).toBe("& tail");
    expect(parseXml("<A>a &lt; b &gt; c</A>").text).toBe("a < b > c");
    expect(parseXml('<A v="x &amp; y"/>').attrs).toEqual({ v: "x & y" });
  });

  it("decodes decimal and hexadecimal character references", () => {
    expect(parseXml("<A>&#65;&#x42;&#X43;</A>").text).toBe("ABC");
  });
});

describe("parseXml malformed input", () => {
  it.each<[string, string, string]>([
    ["an entity without a semicolon", "<A>&amp</A>", "unterminated entity"],
    ["a reference with non-hex digits", "<A>&#xZZ;</A>", "unknown entity"],
    ["an empty numeric reference", "<A>&#;</A>", "unknown entity"],
    ["a reference with too many digits", "<A>&#12345678;</A>", "unknown entity"],
    ["a reference above U+10FFFF", "<A>&#x110000;</A>", "unknown entity"],
    ["a surrogate reference", "<A>&#xD800;</A>", "unknown entity"],
    ["a tag that does not start with a name", "<1/>", "expected a name"],
    ["input that ends after <", "<A><", "expected a name"],
    ["an unterminated comment", "<A><!-- x</A>", "unterminated comment"],
    ["an unterminated processing instruction", "<A><?pi x</A>", "unterminated processing"],
    ["a start tag that is cut off", '<A b="1"', "unterminated start tag"],
    ["a slash not followed by >", "<A / >", "expected '>' after '/'"],
    ["attributes without whitespace", '<A b="1"c="2"/>', "expected whitespace"],
    ["an attribute without a value", "<A b/>", "has no value"],
    ["an unquoted attribute value", "<A b=1/>", "not quoted"],
    ["an unterminated attribute value", '<A b="1', "unterminated attribute value"],
    ["< inside an attribute value", '<A b="<"/>', "'<' in attribute value"],
    ["a duplicate attribute", '<A b="1" b="2"/>', "duplicate attribute b"],
    ["CDATA outside the root", "<![CDATA[x]]>", "CDATA outside the root"],
    ["an unterminated CDATA section", "<A><![CDATA[x</A>", "unterminated CDATA"],
    ["an end tag without a start tag", "</A>", "unexpected end tag"],
    ["an end tag without >", "<A></A", "expected '>' in end tag"],
    ["an unclosed element", "<A><B></B>", "unclosed element <A>"],
    ["text outside the root element", "x<A/>", "text outside the root"],
  ])("rejects %s", (_label, input, fragment) => {
    const error = (() => {
      try {
        parseXml(input);
      } catch (caught) {
        return caught;
      }
      return undefined;
    })();
    expect(error).toBeInstanceOf(NamecheapParseError);
    expect((error as Error).message).toContain(fragment);
  });
});
