import { describe, expect, it } from "vitest";

import { optionalField } from "../../src/core/fields";

describe("optionalField", () => {
  it("includes a present value", () => {
    expect(optionalField("a", 1)).toEqual({ a: 1 });
    expect(optionalField("a", "")).toEqual({ a: "" });
    expect(optionalField("a", false)).toEqual({ a: false });
  });

  it("omits undefined", () => {
    expect(optionalField("a", undefined)).toEqual({});
    expect(Object.keys(optionalField("a", undefined))).toEqual([]);
  });

  it("keeps null as a value", () => {
    expect(optionalField("a", null)).toEqual({ a: null });
  });
});
