import { ConfigType, type NamecheapProps } from "./types/config.type";
import { getNamecheapHost } from "./utils/service";
import { Domains } from "./methods/domains";
import { DomainsDNS } from "@fwg/methods/domains/dns";
import { DomainsNS } from "@fwg/methods/domains/ns";
import { DomainsTransfer } from "@fwg/methods/domains/transfer";
import { SSL } from "@fwg/methods/ssl";
import { Users } from "@fwg/methods/users";
import { UsersAddress } from "@fwg/methods/users/address";
import { WhoIsGuard } from "src/methods/whois-guard";

export default class Namecheap {
  private readonly apiUrl: string;
  private readonly apiUser: string;
  private readonly apiKey: string;
  private readonly username: string;
  private readonly clientIp: string;

  public readonly domains: Domains;
  public readonly domainsDns: DomainsDNS;
  public readonly domainsNs: DomainsNS;
  public readonly domainsTransfer: DomainsTransfer;

  public readonly ssl: SSL;

  public readonly users: Users;
  public readonly usersAddress: UsersAddress;
  public readonly whoIsGuard: WhoIsGuard;

  public get domainPrivacy(): WhoIsGuard {
    return this.whoIsGuard;
  }

  constructor(config: ConfigType) {
    const { apiUser, apiKey, username, clientIp, sandbox } = config;

    this.apiUser = apiUser;
    this.apiKey = apiKey;
    this.username = username || apiUser;
    this.clientIp = clientIp;
    this.apiUrl = getNamecheapHost(sandbox);

    this.domains = new Domains(this.getConfig());
    this.domainsDns = new DomainsDNS(this.getConfig());
    this.domainsNs = new DomainsNS(this.getConfig());
    this.domainsTransfer = new DomainsTransfer(this.getConfig());
    this.ssl = new SSL(this.getConfig());
    this.users = new Users(this.getConfig());
    this.usersAddress = new UsersAddress(this.getConfig());
    this.whoIsGuard = new WhoIsGuard(this.getConfig());
  }

  private getConfig(): NamecheapProps {
    return {
      apiUser: this.apiUser,
      apiKey: this.apiKey,
      username: this.username,
      clientIp: this.clientIp,
      apiUrl: this.apiUrl,
    };
  }
}

export * from "./types/enum";
