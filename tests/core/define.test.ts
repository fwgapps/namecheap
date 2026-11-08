/* eslint-disable @typescript-eslint/no-empty-object-type -- `{}` is a deliberate "no params" type */
import { describe, expect, expectTypeOf, it, vi } from "vitest";

import { defineCommand, group } from "../../src/core/define";
import type { El } from "../../src/core/element";
import type { Send } from "../../src/core/transport";

const fakeEl = { tag: "CommandResponse" } as unknown as El;

function makeSend() {
  return vi.fn<Send>(async () => fakeEl);
}

describe("group", () => {
  it("serializes params, sends the command and resolves to parse's result", async () => {
    const send = makeSend();
    const check = defineCommand<{ domainName: string }, string>({
      name: "namecheap.x.y",
      parse: () => "parsed",
    });
    const api = group({ check }, send);

    await expect(api.check({ domainName: "a.com" })).resolves.toBe("parsed");
    expect(send).toHaveBeenCalledWith({
      command: "namecheap.x.y",
      params: [["DomainName", "a.com"]],
    });
  });

  it("calls validate with the params before sending", async () => {
    const send = makeSend();
    const validate = vi.fn<(p: { a: string }) => void>();
    const api = group(
      { run: defineCommand<{ a: string }, null>({ name: "n", validate, parse: () => null }) },
      send,
    );
    await api.run({ a: "x" });
    expect(validate).toHaveBeenCalledWith({ a: "x" });
    expect(send).toHaveBeenCalledTimes(1);
  });

  it("rejects without sending when validate throws", async () => {
    const send = makeSend();
    const api = group(
      {
        run: defineCommand<{ a: string }, null>({
          name: "n",
          validate: () => {
            throw new TypeError("bad params");
          },
          parse: () => null,
        }),
      },
      send,
    );
    await expect(api.run({ a: "x" })).rejects.toThrow(TypeError);
    expect(send).not.toHaveBeenCalled();
  });

  it("passes the response element to parse", async () => {
    const parse = vi.fn<(cr: El) => number>(() => 1);
    const api = group(
      { run: defineCommand<{ a?: string }, number>({ name: "n", parse }) },
      makeSend(),
    );
    await api.run();
    expect(parse).toHaveBeenCalledWith(fakeEl);
  });

  it("honors arrayStyle and keys", async () => {
    const send = makeSend();
    const cmd = defineCommand<{ domainName: string; nameservers: string[] }, null>({
      name: "namecheap.z",
      arrayStyle: "suffix",
      keys: { domainName: "DN" },
      parse: () => null,
    });
    const api = group({ cmd }, send);
    await api.cmd({ domainName: "a.com", nameservers: ["ns1", "ns2"] });
    expect(send).toHaveBeenCalledWith({
      command: "namecheap.z",
      params: [
        ["DN", "a.com"],
        ["Nameservers1", "ns1"],
        ["Nameservers2", "ns2"],
      ],
    });
  });

  it("exposes only the command keys, as independent functions", () => {
    const a = defineCommand<{}, 1>({ name: "a", parse: () => 1 });
    const b = defineCommand<{}, 2>({ name: "b", parse: () => 2 });
    const api = group({ a, b }, makeSend());
    expect(Object.keys(api)).toEqual(["a", "b"]);
    const { a: detached } = api;
    expect(detached()).toBeInstanceOf(Promise);
  });

  it("propagates send and parse errors", async () => {
    const boom = new Error("boom");
    const api = group({ c: defineCommand<{}, number>({ name: "c", parse: () => 1 }) }, async () => {
      throw boom;
    });
    await expect(api.c()).rejects.toBe(boom);
  });
});

describe("group types", () => {
  const optional = defineCommand<{ page?: number }, string[]>({ name: "o", parse: () => [] });
  const required = defineCommand<{ domainName: string; page?: number }, boolean>({
    name: "r",
    parse: () => true,
  });
  const empty = defineCommand<{}, null>({ name: "e", parse: () => null });
  const api = group({ optional, required, empty }, makeSend());

  it("makes the argument optional when all params are optional", () => {
    expectTypeOf(api.optional).toEqualTypeOf<(params?: { page?: number }) => Promise<string[]>>();
    expectTypeOf(api.empty).toEqualTypeOf<(params?: {}) => Promise<null>>();
    expectTypeOf(api.optional).toBeCallableWith();
    expectTypeOf(api.empty).toBeCallableWith();
  });

  it("requires the argument when any param is required", () => {
    expectTypeOf(api.required).toEqualTypeOf<
      (params: { domainName: string; page?: number }) => Promise<boolean>
    >();
    expectTypeOf(api.required).toBeCallableWith({ domainName: "a.com" });
    // @ts-expect-error params are required
    void api.required();
    // @ts-expect-error domainName is required
    void api.required({ page: 1 });
    // @ts-expect-error domainName must be a string
    void api.required({ domainName: 1 });
  });
});
