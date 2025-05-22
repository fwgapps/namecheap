import { NamecheapProps } from "@fwg/types/config.type";
import { request } from "@fwg/utils/service";
import { CommandsDomain } from "@fwg/utils/commands";
import {
  DomainCheckResult,
  DomainContactsResult,
  DomainCreateResult,
  DomainGetInfoResult,
  DomainGetListResult,
  DomainGetRegistrarLockResult,
  DomainReactivateResult,
  DomainRenewResult,
  DomainSetRegistrarLockResult,
  TLD,
} from "@fwg/types/methods/response/domains.type";
import type {
  ContactDomainParams,
  CreateDomainParams,
  GetListParams,
  ReactivateDomainParams,
  RenewDomainParams,
  SetRegistrarLockParams,
} from "@fwg/types/methods/params/domains-params.type";
import { Paging } from "@fwg/types/methods/base.type";

export class Domains {
  private readonly config: NamecheapProps;

  constructor(config: NamecheapProps) {
    this.config = config;
  }

  async getList(
    params: GetListParams = {
      listType: "ALL",
      page: 1,
      pageSize: 20,
    },
  ): Promise<{
    data: Array<DomainGetListResult>;
    paging: Paging;
  }> {
    const response = await request(this.config, CommandsDomain.GetList, params);
    return {
      data: response.commandResponse.domainGetListResult,
      paging: response.commandResponse.paging,
    };
  }

  async getContacts(domainName: string): Promise<DomainContactsResult> {
    const response = await request(this.config, CommandsDomain.GetContact, {
      domainName,
    });
    return response.commandResponse.domainContactsResult;
  }

  async create(
    domain: string,
    params: Omit<CreateDomainParams, "domainName">,
  ): Promise<DomainCreateResult> {
    const response = await request(this.config, CommandsDomain.Create, {
      ...params,
      domainName: domain,
    });

    return response.commandResponse.domainCreateResult;
  }

  async getTldList(): Promise<Array<TLD>> {
    const response = await request(this.config, CommandsDomain.GetTldList);
    return response.commandResponse.tlds;
  }

  async setContacts(
    domain: string,
    params: Omit<ContactDomainParams, "domainName">,
  ): Promise<string> {
    const response = await request(this.config, CommandsDomain.SetContact, {
      ...params,
      domainName: domain,
    });

    return response.commandResponse.domainSetContactResult;
  }

  async check(domains: Array<string>): Promise<DomainCheckResult> {
    const response = await request(this.config, CommandsDomain.Check, {
      domainList: domains.join(),
    });

    return response.commandResponse.domainCheckResult;
  }

  async reactivate(
    domain: string,
    params: Omit<ReactivateDomainParams, "domainName"> = {},
  ): Promise<DomainReactivateResult> {
    const response = await request(this.config, CommandsDomain.Reactivate, {
      ...params,
      domainName: domain,
    });

    return response.commandResponse.domainReactivateResult;
  }

  async renew(
    domain: string,
    params: Omit<RenewDomainParams, "domainName">,
  ): Promise<DomainRenewResult> {
    const response = await request(this.config, CommandsDomain.Renew, {
      ...params,
      domainName: domain,
    });

    return response.commandResponse.domainRenewResult;
  }

  async getRegistrarLock(domain: string): Promise<DomainGetRegistrarLockResult> {
    const response = await request(this.config, CommandsDomain.GetRegistrarLock, {
      domainName: domain,
    });

    return response.commandResponse.domainGetRegistrarLockResult;
  }

  async setRegistrarLock(
    domain: string,
    params: Omit<SetRegistrarLockParams, "domainName"> = {
      lockAction: "LOCK",
    },
  ): Promise<DomainSetRegistrarLockResult> {
    const response = await request(this.config, CommandsDomain.SetRegistrarLock, {
      ...params,
      domainName: domain,
    });

    return response.commandResponse.domainSetRegistrarLockResult;
  }

  async getInfo(domain: string, hostName?: string): Promise<DomainGetInfoResult> {
    const response = await request(this.config, CommandsDomain.GetInfo, {
      domainName: domain,
      hostName,
    });

    return response.commandResponse.domainGetInfoResult;
  }
}
