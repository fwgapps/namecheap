import Namecheap from "./client";

export default Namecheap;
export { Namecheap };
export { NamecheapError, NamecheapHttpError, NamecheapParseError } from "./core/errors";
export type { TransportConfig as NamecheapConfig } from "./core/transport";
export * from "./commands/domains";
export * from "./commands/dns";
export * from "./commands/ns";
export * from "./commands/transfer";
export * from "./commands/ssl";
export * from "./commands/users";
export * from "./commands/users-address";
export * from "./commands/whoisguard";
