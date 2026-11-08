/* eslint-disable @typescript-eslint/no-empty-object-type -- `{}` is a deliberate "no params" type */
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { defineCommand, run } from "../../src/core/define";
import type { El } from "../../src/core/element";
import { NamecheapParseError } from "../../src/core/errors";
import type { Send } from "../../src/core/transport";

const fakeEl = { tag: "CommandResponse" } as unknown as El;

function makeSend() {
  return vi.fn<Send>(async () => fakeEl);
}

describe("run", () => {
  it("serializes params, sends the command and resolves to parse's result", async () => {
    const send = makeSend();
    const check = defineCommand<{ domainName: string }, string>({
      name: "namecheap.x.y",
      parse: () => "parsed",
    });

    await expect(run(check, send, { domainName: "a.com" })).resolves.toBe("parsed");
    expect(send).toHaveBeenCalledWith({
      command: "namecheap.x.y",
      params: [["DomainName", "a.com"]],
    });
  });

  it("honors arrayStyle and keys like the grouped form", async () => {
    const send = makeSend();
    const cmd = defineCommand<{ nameservers: string[]; tokenId: string }, null>({
      name: "n",
      arrayStyle: "suffix",
      keys: { tokenId: "TokenId" },
      parse: () => null,
    });
    await run(cmd, send, { nameservers: ["a", "b"], tokenId: "t" });
    expect(send).toHaveBeenCalledWith({
      command: "n",
      params: [
        ["Nameservers1", "a"],
        ["Nameservers2", "b"],
        ["TokenId", "t"],
      ],
    });
  });

  it("calls validate before sending and does not send when it throws", async () => {
    const send = makeSend();
    const cmd = defineCommand<{ a: string }, null>({
      name: "n",
      validate: () => {
        throw new TypeError("nope");
      },
      parse: () => null,
    });
    await expect(run(cmd, send, { a: "x" })).rejects.toThrow(TypeError);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects reserved parameter names by name only, without sending", async () => {
    const send = makeSend();
    const cmd = defineCommand<{ apiKey: string }, null>({ name: "n", parse: () => null });
    const error = await run(cmd, send, { apiKey: "SECRET-VALUE" }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(TypeError);
    expect((error as Error).message).toContain("ApiKey");
    expect((error as Error).message).not.toContain("SECRET-VALUE");
    expect(send).not.toHaveBeenCalled();
  });

  it("wraps a parse failure after an OK response so the caller knows the outcome is unknown", async () => {
    const send = makeSend();
    const original = new NamecheapParseError("boom");
    const cmd = defineCommand<{}, null>({
      name: "namecheap.x.billed",
      parse: () => {
        throw original;
      },
    });
    const error = await run(cmd, send).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NamecheapParseError);
    expect((error as Error).message).toContain("namecheap.x.billed");
    expect((error as Error).cause).toBe(original);
  });

  it("leaves errors from send and non-parse errors from parse unchanged", async () => {
    const failing = vi.fn<Send>(async () => {
      throw new Error("from send");
    });
    const cmd = defineCommand<{}, null>({ name: "n", parse: () => null });
    await expect(run(cmd, failing)).rejects.toThrow("from send");

    const bad = defineCommand<{}, null>({
      name: "n",
      parse: () => {
        throw new RangeError("from parse");
      },
    });
    await expect(run(bad, makeSend())).rejects.toThrow(RangeError);
  });

  it("types the params argument like a grouped method", () => {
    const optional = defineCommand<{ page?: number }, null>({ name: "n", parse: () => null });
    const required = defineCommand<{ domainName: string }, null>({ name: "n", parse: () => null });
    const none = defineCommand<{}, null>({ name: "n", parse: () => null });
    const send = makeSend();

    expectTypeOf(run(optional, send)).toEqualTypeOf<Promise<null>>();
    expectTypeOf(run(none, send)).toEqualTypeOf<Promise<null>>();
    expectTypeOf(run(required, send, { domainName: "a.com" })).toEqualTypeOf<Promise<null>>();
    // @ts-expect-error a command with required params needs them
    void run(required, send).catch(() => undefined);
    // @ts-expect-error unknown params are rejected
    void run(required, send, { domainName: "a.com", extra: 1 }).catch(() => undefined);
  });
});
