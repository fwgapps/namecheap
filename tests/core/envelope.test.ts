import { describe, expect, it } from "vitest";
import { readEnvelope } from "../../src/core/envelope";
import { NamecheapError, NamecheapParseError } from "../../src/core/errors";

const NS = 'xmlns="http://api.namecheap.com/xml.response"';

function ok(body: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="OK" ${NS}>
  <Errors />
  <Warnings />
  <RequestedCommand>namecheap.test</RequestedCommand>
  ${body}
  <Server>PHX01SBAPIEXT01</Server>
  <GMTTimeDifference>--4:00</GMTTimeDifference>
  <ExecutionTime>0.003</ExecutionTime>
</ApiResponse>`;
}

function caught(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  return undefined;
}

describe("readEnvelope", () => {
  it("returns the CommandResponse element of an OK envelope", () => {
    const response = readEnvelope(
      ok('<CommandResponse Type="namecheap.test"><Item Id="1" /></CommandResponse>'),
    );
    expect(response.name).toBe("CommandResponse");
    expect(response.string("Type")).toBe("namecheap.test");
    expect(response.one("Item").number("Id")).toBe(1);
  });

  it("throws NamecheapError with every Error element", () => {
    const xml = `<ApiResponse Status="ERROR"><Errors><Error Number="1">first</Error><Error Number="x">second</Error></Errors></ApiResponse>`;
    const error = caught(() => readEnvelope(xml));
    expect(error).toBeInstanceOf(NamecheapError);
    const api = error as NamecheapError;
    expect(api.errors).toHaveLength(2);
    expect(api.code).toBe(1);
    expect(api.errors[0]).toEqual({ code: 1, message: "first" });
    expect(api.errors[1]).toEqual({ code: -1, message: "second" });
  });

  it("handles a real error response and uses only the element text", () => {
    const xml = `<?xml version="1.0" encoding="utf-8"?>
<ApiResponse Status="ERROR" ${NS}>
  <Errors><Error Number="1011102">API Key is invalid or API access has not been enabled</Error></Errors>
  <Warnings />
  <RequestedCommand />
  <Server>PHX01SBAPIEXT01</Server>
  <GMTTimeDifference>--4:00</GMTTimeDifference>
  <ExecutionTime>0.003</ExecutionTime>
</ApiResponse>`;
    const error = caught(() => readEnvelope(xml)) as NamecheapError;
    expect(error).toBeInstanceOf(NamecheapError);
    expect(error.code).toBe(1011102);
    expect(error.message).toBe("API Key is invalid or API access has not been enabled");
  });

  it("trims error text and treats a missing Number as -1", () => {
    const xml = `<ApiResponse Status="ERROR"><Errors><Error>
      padded </Error></Errors></ApiResponse>`;
    const error = caught(() => readEnvelope(xml)) as NamecheapError;
    expect(error.errors).toEqual([{ code: -1, message: "padded" }]);
  });

  it("throws NamecheapError when an Error exists even if Status is OK", () => {
    const xml = `<ApiResponse Status="OK"><Errors><Error Number="5">boom</Error></Errors><CommandResponse /></ApiResponse>`;
    const error = caught(() => readEnvelope(xml));
    expect(error).toBeInstanceOf(NamecheapError);
    expect((error as NamecheapError).code).toBe(5);
  });

  it("throws NamecheapError for Status ERROR without Error elements", () => {
    const error = caught(() =>
      readEnvelope('<ApiResponse Status="ERROR"><Errors /></ApiResponse>'),
    );
    expect(error).toBeInstanceOf(NamecheapError);
    expect((error as NamecheapError).errors).toHaveLength(0);
  });

  it("throws NamecheapParseError for a root other than ApiResponse", () => {
    expect(() => readEnvelope("<html><body>Bad Gateway</body></html>")).toThrow(
      NamecheapParseError,
    );
  });

  it("throws NamecheapParseError for an empty string", () => {
    expect(() => readEnvelope("")).toThrow(NamecheapParseError);
  });

  it("throws NamecheapParseError for OK without CommandResponse", () => {
    expect(() => readEnvelope(ok(""))).toThrow(NamecheapParseError);
  });

  it("throws NamecheapParseError for an unknown Status without CommandResponse", () => {
    expect(() => readEnvelope("<ApiResponse><Errors /></ApiResponse>")).toThrow(
      NamecheapParseError,
    );
  });
});
