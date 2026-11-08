/* eslint-disable @typescript-eslint/no-empty-object-type -- `{}` is the intended "all params optional" check */
import type { El } from "./element";
import { NamecheapParseError } from "./errors";
import { serializeParams } from "./serialize";
import type { ArrayStyle } from "./serialize";
import type { Send } from "./transport";

/** Wire names the transport sets itself; a caller must never add a second copy. */
const RESERVED_NAMES = new Set(["apiuser", "apikey", "username", "clientip", "command"]);

export interface CommandDef<P, R> {
  /** Namecheap command name, e.g. `namecheap.domains.check`. */
  name: string;
  arrayStyle?: ArrayStyle;
  /** Maps a dotted camelCase path to an exact parameter name. */
  keys?: Readonly<Record<string, string>>;
  /** Runs before serializing; throw to reject the call without sending anything. */
  validate?: (params: P) => void;
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

/**
 * Runs one command: validates, serializes, sends and parses.
 *
 * This is the tree-shakeable entry point: importing only `createTransport`, one
 * standalone command (for example `domainsCheck`) and `run` bundles just those, not the
 * whole command catalog that `new Namecheap(...)` carries.
 */
export async function run<P, R>(
  command: Command<P, R>,
  send: Send,
  ...args: {} extends P ? [params?: P] : [params: P]
): Promise<R> {
  const params = (args[0] ?? {}) as P & object;
  command.validate?.(params);
  const options: { arrayStyle?: ArrayStyle; keys?: Readonly<Record<string, string>> } = {};
  if (command.arrayStyle !== undefined) options.arrayStyle = command.arrayStyle;
  if (command.keys !== undefined) options.keys = command.keys;
  const serialized = serializeParams(params, options);
  for (const [name] of serialized) {
    if (RESERVED_NAMES.has(name.toLowerCase())) {
      throw new TypeError(`Parameter "${name}" is reserved: the client sets it itself`);
    }
  }
  const el = await send({ command: command.name, params: serialized });
  try {
    return command.parse(el);
  } catch (error) {
    if (error instanceof NamecheapParseError) {
      throw new NamecheapParseError(
        `${command.name}: Namecheap reported success but the response could not be read; the action may have been performed, verify before retrying`,
        { cause: error },
      );
    }
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function group<C extends Record<string, Command<any, any>>>(
  commands: C,
  send: Send,
): Group<C> {
  const out: Record<string, (params?: object) => Promise<unknown>> = {};
  for (const [key, command] of Object.entries(commands)) {
    out[key] = (params) => run(command, send, params as never);
  }
  return out as Group<C>;
}
