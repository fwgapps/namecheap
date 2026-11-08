/* eslint-disable @typescript-eslint/no-empty-object-type -- `{}` is the intended "all params optional" check */
import type { El } from "./element";
import { serializeParams } from "./serialize";
import type { ArrayStyle } from "./serialize";
import type { Send } from "./transport";

// `P` is unused here by design: it only carries the params type into `Command`.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface CommandDef<P, R> {
  /** Namecheap command name, e.g. `namecheap.domains.check`. */
  name: string;
  arrayStyle?: ArrayStyle;
  /** Maps a dotted camelCase path to an exact parameter name. */
  keys?: Readonly<Record<string, string>>;
  /** Receives the CommandResponse element returned by `send`. */
  parse: (cr: El) => R;
}

export interface Command<P, R> extends CommandDef<P, R> {
  /** Phantom field carrying the params type; never set at runtime. */
  readonly _params?: P;
}

export function defineCommand<P, R>(def: CommandDef<P, R>): Command<P, R> {
  return def;
}

export type Group<C> = {
  [K in keyof C]: C[K] extends Command<infer P, infer R>
    ? {} extends P
      ? (params?: P) => Promise<R>
      : (params: P) => Promise<R>
    : never;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function group<C extends Record<string, Command<any, any>>>(
  commands: C,
  send: Send,
): Group<C> {
  const out: Record<string, (params?: object) => Promise<unknown>> = {};
  for (const [key, def] of Object.entries(commands)) {
    out[key] = async (params) => {
      const options: { arrayStyle?: ArrayStyle; keys?: Readonly<Record<string, string>> } = {};
      if (def.arrayStyle !== undefined) options.arrayStyle = def.arrayStyle;
      if (def.keys !== undefined) options.keys = def.keys;
      const el = await send({
        command: def.name,
        params: serializeParams(params ?? {}, options),
      });
      return def.parse(el);
    };
  }
  return out as Group<C>;
}
