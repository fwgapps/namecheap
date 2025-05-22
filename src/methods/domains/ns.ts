import type { NamecheapProps } from "@fwg/types/config.type";
import { request } from "@fwg/utils/service";
import { CommandsDomainNS } from "@fwg/utils/commands";
import {
  DomainNsCreateResult,
  DomainNsDeleteResult,
  DomainNsInfoResult,
  DomainNsUpdateResult,
} from "@fwg/types/methods/response/domains-ns.type";

export class DomainsNS {
  private readonly config: NamecheapProps;

  constructor(config: NamecheapProps) {
    this.config = config;
  }

  async create(
    sld: string,
    tld: string,
    nameserver: string,
    ip: string,
  ): Promise<DomainNsCreateResult> {
    const response = await request(this.config, CommandsDomainNS.Create, {
      sld,
      tld,
      nameserver,
      ip,
    });

    return response.commandResponse.domainNsCreateResult;
  }

  async delete(sld: string, tld: string, nameserver: string): Promise<DomainNsDeleteResult> {
    const response = await request(this.config, CommandsDomainNS.Delete, {
      sld,
      tld,
      nameserver,
    });

    return response.commandResponse.domainNsDeleteResult;
  }

  async getInfo(sld: string, tld: string, nameserver: string): Promise<DomainNsInfoResult> {
    const response = await request(this.config, CommandsDomainNS.GetInfo, {
      sld,
      tld,
      nameserver,
    });

    return response.commandResponse.domainNsInfoResult;
  }

  async update(
    sld: string,
    tld: string,
    nameserver: string,
    ip: string,
    oldIp: string,
  ): Promise<DomainNsUpdateResult> {
    const response = await request(this.config, CommandsDomainNS.Update, {
      sld,
      tld,
      nameserver,
      ip,
      oldIp,
    });

    return response.commandResponse.domainNsUpdateResult;
  }
}
