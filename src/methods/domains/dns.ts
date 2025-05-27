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

  /**
   * @constructor initial configuration to use global settings
   * @param {NamecheapProps} config Namecheap credentials
   */
  constructor(config: NamecheapProps) {
    this.config = config;
  }

  /**
   * Sets domain to use our default DNS servers.
   * Required for free services like Host record management, URL forwarding, email forwarding, dynamic dns and other value added services.
   * @param {string} sld SLD of the DomainName
   * @param {string} tld TLD of the DomainName
   * @returns {Promise<>string>} Returns the domain name that you are trying to set default nameservers for.
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
   * @param {string} sld SLD of the DomainName
   * @param {string} tld TLD of the DomainName
   * @param {Array<string>} nameservers A list of name servers to be associated with this domain
   * @returns {Promise<string>} Returns the domain name that you are trying to set custom nameservers for.
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
   * @param {string} sld SLD of the DomainName
   * @param {string} tld TLD of the DomainName
   * @returns List of DNS info (see {@link DomainDnsGetListResult})
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
   * @param {string} sld SLD of the DomainName
   * @param {string} tld TLD of the DomainName
   * @returns DNS host records info (see {@link DomainDnsGetHostsResult})
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
   * @param {string} domain Domain name to get settings
   * @returns Email forwarding info (see {@link DomainDnsGetEmailForwardingResult})
   */
  async getEmailForwarding(domain: string): Promise<DomainDnsGetEmailForwardingResult> {
    const response = await request(this.config, CommandsDomainDNS.GetEmailForwarding, {
      domainName: domain,
    });

    return response.commandResponse.domainDnsGetEmailForwardingResult;
  }

  /**
   * Sets email forwarding for a domain name.
   * @param {string} domain Domain name to set settings
   * @param {SetDNSEmailForwardingParams} params Set mailbox and forwards
   * - mailBox: for which you wish to set email forwarding.
   * - forwardTo: Email address to forward to
   * @example
   * setEmailForwarding("mydomain.com", {
   *    mailBox: ["example@namecheap.com"],
   *    forwardTo: ["example:example@gmail.com"]
   *  })
   *  @returns Return email affected
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
   * @param {string} sld
   * @param {string} tld
   * @param {Omit<
   *       SetDNSHostsParams,
   *       "sld" | "tld" | "address" | "hostname" | "mxpref" | "recordType" | "ttl"
   *     > & { hosts: Array<Host> }} params Host record configuration object:
   *  - emailType?: The type of email service to use.
   *    - MXE: to set up your custom MXE record.
   *    - MX: to set up custom MX records of your mail provider.
   *    - FWD: to set up MX records for our Free Email Forwarding service.
   *    - OX: to set up MX records for our Private Email service.
   *  - flag?: Is an unsigned integer between 0 and 255. The flag value is an 8-bit number, the most significant bit of which indicates the criticality of understanding of a record by a CA. It's recommended to use `0`
   *  - tag?: A non-zero sequence of US-ASCII letters and numbers in lower case. The tag value can be one of the following values:
   *    - issue — specifies the certification authority that is authorized to issue a certificate for the domain name or subdomain record used in the title.
   *    - issuewild — specifies the certification authority that is allowed to issue a wildcard certificate for the domain name or subdomain record used in the title. The certificate applies to the domain name or subdomain directly and to all its subdomains.
   *    - iodef — specifies the e-mail address or URL (compliant with RFC 5070) a CA should use to notify a client if any issuance policy violation spotted by this CA.
   * - hosts: Array with host properties
   *  - hostname: Sub-domain/hostname to create the record for
   *  - recordType: Record type to that host, possible values
   *    - A
   *    - AAAA
   *    - ALIAS
   *    - CAA
   *    - CNAME
   *    - MX
   *    - MXE
   *    - NS
   *    - TXT
   *    - URL
   *    - URL301
   *    - FRAME
   *  - address: The value for this parameter is based on RecordType. Possible values:
   *    - URL
   *    - IP address
   *  - mxpref?: MX preference for host. Applicable for MX records only.
   *  - ttl?: Time to live for all record types.
   *  @returns Return host list affected
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
