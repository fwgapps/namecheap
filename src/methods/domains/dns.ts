import type { NamecheapProps } from "@fwg/types/config.type";
import {
  DomainDnsGetEmailForwardingResult,
  DomainDnsGetHostsResult,
  DomainDnsGetListResult,
} from "@fwg/types/methods/response/domains-dns.type";
import { request, requestPost } from "@fwg/utils/service";
import { CommandsDomainDNS } from "@fwg/utils/commands";
import {
  Host,
  SetDNSEmailForwardingParams,
  SetDNSHostsParams,
} from "@fwg/types/methods/params/domains-dns-params.type";
import { RecordType } from "@fwg/types/enum";

export class DomainsDNS {
  private readonly config: NamecheapProps;

  constructor(config: NamecheapProps) {
    this.config = config;
  }

  /**
   * Sets domain to use namecheap api default DNS servers.
   * Required for free services like Host record management, URL forwarding, email forwarding, dynamic dns and other value added services.
   */
  async setDefault(sld: string, tld: string): Promise<string> {
    const response = await request(this.config, CommandsDomainDNS.SetDefault, {
      sld,
      tld,
    });

    return response.commandResponse.domainDnsSetDefaultResult;
  }

  /**
   * Sets domain to use custom DNS servers.
   * @note Services like URL forwarding, Email forwarding, Dynamic DNS will not work for domains using custom nameservers
   */
  async setCustom(sld: string, tld: string, nameservers: Array<string>): Promise<string> {
    const response = await request(this.config, CommandsDomainDNS.SetCustom, {
      sld,
      tld,
      nameservers,
    });

    return response.commandResponse.domainDNSSetCustomResult;
  }

  /**
   * Gets a list of DNS servers associated with the requested domain.
   */
  async getList(sld: string, tld: string): Promise<DomainDnsGetListResult> {
    const response = await request(this.config, CommandsDomainDNS.GetList, {
      sld,
      tld,
    });

    return response.commandResponse.domainDnsGetListResult;
  }

  /**
   * Retrieves DNS host record settings for the requested domain.
   */
  async getHosts(sld: string, tld: string): Promise<DomainDnsGetHostsResult> {
    const response = await request(this.config, CommandsDomainDNS.GetHosts, {
      sld,
      tld,
    });

    return response.commandResponse.domainDnsGetHostsResult;
  }

  /**
   * Gets email forwarding settings for the requested domain.
   */
  async getEmailForwarding(domain: string): Promise<DomainDnsGetEmailForwardingResult> {
    const response = await request(this.config, CommandsDomainDNS.GetEmailForwarding, {
      domainName: domain,
    });

    return response.commandResponse.domainDnsGetEmailForwardingResult;
  }

  /**
   * Sets email forwarding for a domain name.
   */
  async setEmailForwarding(
    domain: string,
    params: Omit<SetDNSEmailForwardingParams, "domainName">,
  ): Promise<string> {
    const response = await request(this.config, CommandsDomainDNS.SetEmailForwarding, {
      ...params,
      domainName: domain,
    });

    return response.commandResponse.domainDnsSetEmailForwardingResult;
  }

  /**
   * Sets DNS host records settings for the requested domain.
   * @note If you set more than 10 hosts the request will be done by POST method otherwise by GET method.
   * @note All host records that are not included into the API call will be deleted, so add them in addition to new host records.
   */
  async setHosts(
    sld: string,
    tld: string,
    params: Omit<
      SetDNSHostsParams,
      "sld" | "tld" | "address" | "hostname" | "mxpref" | "recordType" | "ttl"
    > & { hosts: Array<Host> },
  ): Promise<Array<string>> {
    const { hosts } = params;
    const paramsFormatted = hosts.reduce(
      (acc, host, i) => {
        Object.entries(host).forEach(([key, value]) => {
          // @ts-expect-error is a safe setter
          acc[key][i] = value;
        });

        return acc;
      },
      {
        hostname: [] as Array<string>,
        ttl: [] as Array<number>,
        address: [] as Array<string>,
        mxpref: [] as Array<string>,
        recordType: [] as Array<RecordType>,
      },
    );
    let response;

    if (hosts.length > 10) {
      response = await requestPost(
        this.config,
        CommandsDomainDNS.SetHosts,
        {
          SLD: sld,
          TLD: tld,
        },
        {
          ...paramsFormatted,
          tag: params.tag,
          flag: params.flag,
          emailType: params.emailType,
        },
      );
    } else {
      response = await request(this.config, CommandsDomainDNS.SetHosts, {
        ...paramsFormatted,
        sld,
        tld,
        tag: params.tag,
        flag: params.flag,
        emailType: params.emailType,
      });
    }

    return response.commandResponse.domainDnsSetHostsResult;
  }
}
