import { describe, expect, it } from "vitest";
import { NamecheapError, NamecheapHttpError, NamecheapParseError } from "../../src/core/errors";

describe("NamecheapError", () => {
  it("exposes the first error and keeps the full list", () => {
    const error = new NamecheapError([
      { code: 1011102, message: "API Key is invalid" },
      { code: 5, message: "second" },
    ]);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("NamecheapError");
    expect(error.code).toBe(1011102);
    expect(error.message).toBe("API Key is invalid");
    expect(error.errors).toHaveLength(2);
  });

  it("falls back to an unknown error when the list is empty", () => {
    const error = new NamecheapError([]);
    expect(error.code).toBe(-1);
    expect(error.message).toBe("Unknown Namecheap error");
    expect(error.errors).toHaveLength(0);
  });

  it.each(["", "   "])("falls back to the code when the first message is %j", (message) => {
    const error = new NamecheapError([{ code: 3, message }]);
    expect(error.message).toBe("Namecheap error 3");
    expect(error.code).toBe(3);
    expect(error.errors[0]?.message).toBe(message);
  });
});

describe("NamecheapHttpError", () => {
  it("keeps status and statusText", () => {
    const error = new NamecheapHttpError("boom", {
      status: 502,
      statusText: "Bad Gateway",
    });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("NamecheapHttpError");
    expect(error.message).toBe("boom");
    expect(error.status).toBe(502);
    expect(error.statusText).toBe("Bad Gateway");
  });

  it("defaults status to undefined and statusText to an empty string", () => {
    const error = new NamecheapHttpError("boom");
    expect(error.status).toBeUndefined();
    expect(error.statusText).toBe("");
  });

  it("keeps the cause", () => {
    const cause = new Error("socket hang up");
    expect(new NamecheapHttpError("boom", { cause }).cause).toBe(cause);
  });
});

describe("NamecheapParseError", () => {
  it("keeps the cause", () => {
    const cause = new Error("bad xml");
    const error = new NamecheapParseError("cannot parse", { cause });
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("NamecheapParseError");
    expect(error.cause).toBe(cause);
  });
});
