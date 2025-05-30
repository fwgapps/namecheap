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
  TLD,
} from "@fwg/types/methods/response/domains.type";
import type {
  ContactDomainParams,
  CreateDomainParams,
  GetListParams,
  ReactivateDomainParams,
  RenewDomainParams,
} from "@fwg/types/methods/params/domains-params.type";
import { Paging } from "@fwg/types/methods/base.type";
import { DomainListType, LockAction } from "@fwg/types/enum";

export class Domains {
  private readonly config: NamecheapProps;

  constructor(config: NamecheapProps) {
    this.config = config;
  }

  /**
   * Returns a list of domains for the particular user
   * @note IMPORTANT: Namecheap API privacy service provider recently changed to WithheldforPrivacy. We want to avoid service interruption for namecheap API users, so please note that in some cases, you may still see Whoisguard in the API parameter names.
   */
  async getList(
    params: GetListParams = {
      listType: DomainListType.All,
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

  /**
   * Gets contact information for the requested domain
   * @note IMPORTANT: Namecheap API privacy service provider recently changed to WithheldforPrivacy. We want to avoid service interruption for our API users, so please note that in some cases, you may still see Whoisguard in the API parameter names.
   */
  async getContacts(domainName: string): Promise<DomainContactsResult> {
    const response = await request(this.config, CommandsDomain.GetContact, {
      domainName,
    });
    return response.commandResponse.domainContactsResult;
  }

  /**
   * Registers a new domain
   * @note IMPORTANT: Namecheap API privacy service provider recently changed to WithheldforPrivacy. We want to avoid service interruption for our API users, so please note that in some cases, you may still see Whoisguard in the API parameter names.
   * @note For successful registration of an IDN domain, you need to send the IdnCode parameter and provide the domain name in the Punycode format (Example: xn--sdkhjsdhfkdh.com), as we do not support native code.
   */
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

  /**
   * Returns a list of TLDs
   * @note IMPORTANT: Namecheap API privacy service provider recently changed to WithheldforPrivacy. We want to avoid service interruption for our API users, so please note that in some cases, you may still see Whoisguard in the API parameter names.
   * @note We strongly recommend that you cache this API response to avoid repeated calls.
   *
   */
  async getTldList(): Promise<Array<TLD>> {
    const response = await request(this.config, CommandsDomain.GetTldList);
    return response.commandResponse.tlds;
  }

  /**
   * Sets contact information for the requested domain
   */
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

  /**
   * Checks the availability of domains
   */
  async check(domains: Array<string>): Promise<Array<DomainCheckResult>> {
    const response = await request(this.config, CommandsDomain.Check, {
      domainList: domains.join(),
    });

    return response.commandResponse.domainCheckResult;
  }

  /**
   * Reactivates an expired domain
   */
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

  /**
   * Renews an expiring domain
   */
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

  /**
   * Gets the Registrar Lock status for the requested domain
   */
  async getRegistrarLock(domain: string): Promise<DomainGetRegistrarLockResult> {
    const response = await request(this.config, CommandsDomain.GetRegistrarLock, {
      domainName: domain,
    });

    return response.commandResponse.domainGetRegistrarLockResult;
  }

  /**
   * Sets the Registrar Lock status for a domain
   */
  async setRegistrarLock(
    domain: string,
    lockAction: LockAction = LockAction.Lock,
  ): Promise<string> {
    const response = await request(this.config, CommandsDomain.SetRegistrarLock, {
      domainName: domain,
      lockAction,
    });

    return response.commandResponse.domainSetRegistrarLockResult;
  }

  /**
   * Returns information about the requested domain
   * @note IMPORTANT: Namecheap API privacy service provider recently changed to WithheldforPrivacy. We want to avoid service interruption for Namecheap API users, so please note that in some cases, you may still see Whoisguard in the API parameter names.
   */
  async getInfo(domain: string, hostName?: string): Promise<DomainGetInfoResult> {
    const response = await request(this.config, CommandsDomain.GetInfo, {
      domainName: domain,
      hostName,
    });

    return response.commandResponse.domainGetInfoResult;
  }
}
