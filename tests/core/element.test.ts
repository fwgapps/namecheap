import { describe, expect, it } from "vitest";
import { El } from "../../src/core/element";
import { NamecheapParseError } from "../../src/core/errors";
import { parseXml } from "../../src/core/xml";

function el(xml: string): El {
  return new El(parseXml(xml));
}

describe("El", () => {
  it("exposes name and text", () => {
    const root = el("<Root>hello</Root>");
    expect(root.name).toBe("Root");
    expect(root.text()).toBe("hello");
  });

  it("returns direct children by name, always as an array", () => {
    const root = el('<Root><Domain Name="a.com"/><Other/><Domain Name="b.com"/></Root>');
    expect(root.all("Domain")).toHaveLength(2);
    expect(root.all("Domain")[1]?.string("Name")).toBe("b.com");
    expect(root.all("Absent")).toEqual([]);
  });

  it("does not return grandchildren from all", () => {
    expect(el("<Root><A><Domain/></A></Root>").all("Domain")).toEqual([]);
  });

  it("one returns the first matching child and throws naming a missing one", () => {
    const root = el('<Root><Domain Name="a.com"/></Root>');
    expect(root.one("Domain").string("Name")).toBe("a.com");
    expect(() => root.one("Missing")).toThrow(NamecheapParseError);
    expect(() => root.one("Missing")).toThrow(/Missing/);
  });

  it("optional returns the child or undefined", () => {
    const root = el("<Root><Domain/></Root>");
    expect(root.optional("Domain")?.name).toBe("Domain");
    expect(root.optional("Missing")).toBeUndefined();
  });

  it("string keeps the exact value and throws when absent", () => {
    const d = el('<Domain ID="00123"/>');
    expect(d.string("ID")).toBe("00123");
    expect(() => d.string("Name")).toThrow(NamecheapParseError);
    expect(() => d.string("Name")).toThrow('Domain: missing attribute "Name"');
  });

  it("optionalString returns undefined when absent", () => {
    const d = el('<Domain ID="1"/>');
    expect(d.optionalString("ID")).toBe("1");
    expect(d.optionalString("Name")).toBeUndefined();
  });

  it("treats inherited property names as absent attributes", () => {
    const d = el('<Domain ID="1"/>');
    expect(() => d.string("constructor")).toThrow(NamecheapParseError);
    expect(() => d.string("toString")).toThrow(NamecheapParseError);
    expect(d.optionalString("constructor")).toBeUndefined();
    expect(d.optionalString("__proto__")).toBeUndefined();
    expect(d.optionalNumber("toString")).toBeUndefined();
    expect(d.optionalBoolean("hasOwnProperty")).toBeUndefined();
  });

  it("number parses numeric values and rejects the rest", () => {
    const d = el('<D Count="42" Neg="-1.5" Bad="abc" Empty="" Blank="  "/>');
    expect(d.number("Count")).toBe(42);
    expect(d.number("Neg")).toBe(-1.5);
    expect(() => d.number("Bad")).toThrow(NamecheapParseError);
    expect(() => d.number("Empty")).toThrow(NamecheapParseError);
    expect(() => d.number("Blank")).toThrow(NamecheapParseError);
    expect(() => d.number("Absent")).toThrow(NamecheapParseError);
    expect(() => d.optionalNumber("Bad")).toThrow(NamecheapParseError);
    expect(d.optionalNumber("Absent")).toBeUndefined();
    expect(d.optionalNumber("Count")).toBe(42);
  });

  it("number accepts only plain decimals", () => {
    const accepted: [string, number][] = [
      ["42", 42],
      ["-1.5", -1.5],
      ["+7", 7],
      ["0", 0],
      ["007", 7],
      ["10.88", 10.88],
    ];
    for (const [raw, expected] of accepted) {
      const d = new El({ name: "D", attrs: { N: raw }, text: "", children: [] });
      expect(d.number("N")).toBe(expected);
      expect(d.optionalNumber("N")).toBe(expected);
    }
    const rejected = [
      "0x10",
      "0b11",
      "0o7",
      " 42 ",
      "1e3",
      "Infinity",
      "NaN",
      "1e3x",
      "",
      "1.",
      ".5",
      "9".repeat(400),
    ];
    for (const raw of rejected) {
      const d = new El({ name: "D", attrs: { N: raw }, text: "", children: [] });
      expect(() => d.number("N"), JSON.stringify(raw)).toThrow(NamecheapParseError);
      expect(() => d.optionalNumber("N"), JSON.stringify(raw)).toThrow(NamecheapParseError);
    }
  });

  it("boolean accepts true/false case-insensitively and rejects the rest", () => {
    const d = el('<D A="True" B="false" C="yes" E=""/>');
    expect(d.boolean("A")).toBe(true);
    expect(d.boolean("B")).toBe(false);
    expect(() => d.boolean("C")).toThrow(NamecheapParseError);
    expect(() => d.boolean("E")).toThrow(NamecheapParseError);
    expect(() => d.boolean("Absent")).toThrow(NamecheapParseError);
    expect(() => d.optionalBoolean("C")).toThrow(NamecheapParseError);
    expect(d.optionalBoolean("Absent")).toBeUndefined();
    expect(d.optionalBoolean("A")).toBe(true);
  });

  it("error messages name the attribute but never leak values", () => {
    const d = el('<D Secret="s3cret" Count="abc"/>');
    let message = "";
    try {
      d.number("Count");
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain("Count");
    expect(message).not.toContain("s3cret");
  });

  it("attributes returns a copy of own entries", () => {
    const d = el('<D A="1" B="2"/>');
    const attrs = d.attributes();
    expect(attrs).toEqual({ A: "1", B: "2" });
    attrs.A = "changed";
    expect(d.string("A")).toBe("1");
  });
});
