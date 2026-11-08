import { dnsCommands } from "./commands/dns";
import { domainsCommands } from "./commands/domains";
import { nsCommands } from "./commands/ns";
import { sslCommands } from "./commands/ssl";
import { transferCommands } from "./commands/transfer";
import { usersCommands } from "./commands/users";
import { usersAddressCommands } from "./commands/users-address";
import { whoisGuardCommands } from "./commands/whoisguard";
import { group } from "./core/define";
import { createTransport } from "./core/transport";
import type { TransportConfig } from "./core/transport";

export default class Namecheap {
  readonly domains;
  readonly dns;
  readonly ns;
  readonly transfer;
  readonly ssl;
  readonly users;
  readonly usersAddress;
  readonly whoisGuard;

  constructor(config: TransportConfig) {
    const send = createTransport(config);
    this.domains = group(domainsCommands, send);
    this.dns = group(dnsCommands, send);
    this.ns = group(nsCommands, send);
    this.transfer = group(transferCommands, send);
    this.ssl = group(sslCommands, send);
    this.users = group(usersCommands, send);
    this.usersAddress = group(usersAddressCommands, send);
    this.whoisGuard = group(whoisGuardCommands, send);
  }
}
