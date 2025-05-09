import type { NamecheapProps } from "@fwg/types/config.type";
import {
    DomainDnsGetEmailForwardingResult,
    DomainDnsGetHostsResult,
    DomainDnsGetListResult
} from "@fwg/types/methods/response/domains-dns.type";
import {request, requestPost} from "@fwg/utils/service";
import { CommandsDomainDNS } from "@fwg/utils/commands";
import {
    Host,
    RecordType,
    SetDNSEmailForwardingParams,
    SetDNSHostsParams
} from "@fwg/types/methods/params/domains-dns-params.type";

export class DomainsDNS {
    private readonly config: NamecheapProps;

    constructor(config: NamecheapProps) {
        this.config = config;
    }

    async setDefault(sld: string, tld: string): Promise<string> {
        const response = await request(this.config, CommandsDomainDNS.SetDefault, {
            sld,
            tld
        });

        return response.commandResponse.domainDnsSetDefaultResult
    }

    async setCustom(sld: string, tld: string, nameservers: Array<string>): Promise<string> {
        const response = await request(this.config, CommandsDomainDNS.SetCustom, {
            sld,
            tld,
            nameservers
        });

        return response.commandResponse.domainDNSSetCustomResult
    }

    async getList(sld: string, tld: string): Promise<DomainDnsGetListResult> {
        const response = await request(this.config, CommandsDomainDNS.GetList, {
            sld,
            tld,
        });

        return response.commandResponse.domainDnsGetListResult
    }

    async getHosts(sld: string, tld: string): Promise<DomainDnsGetHostsResult> {
        const response = await request(this.config, CommandsDomainDNS.GetHosts, {
            sld,
            tld,
        });

        return response.commandResponse.domainDnsGetHostsResult
    }

    async getEmailForwarding(domain: string): Promise<DomainDnsGetEmailForwardingResult> {
        const response = await request(this.config, CommandsDomainDNS.GetEmailForwarding, {
            domainName: domain
        });

        return response.commandResponse.domainDnsGetEmailForwardingResult
    }

    async setEmailForwarding(
        domain: string,
        params: Omit<SetDNSEmailForwardingParams, "domainName">
    ): Promise<string> {
        const response = await request(this.config, CommandsDomainDNS.SetEmailForwarding, {
            ...params,
            domainName: domain
        });

        return response.commandResponse.domainDnsSetEmailForwardingResult
    }

    async setHosts(
        sld: string,
        tld: string,
        params: Omit<SetDNSHostsParams, "sld" | "tld"> & { hosts: Array<Host> }
    ): Promise<string> {
        const { hosts } = params;
        const paramsFormatted = hosts.reduce((acc, host, i) => {
            Object.entries(host).forEach(([key, value]) => {
               // @ts-ignore
                acc[key][i] = value
            });

            return acc;
        }, {
            hostname: [] as Array<string>,
            ttl: [] as Array<number>,
            address: [] as Array<string>,
            mxpref: [] as Array<string>,
            recordType: [] as Array<RecordType>,
        })
        let response;

        if(hosts.length > 10) {
            response = await requestPost(this.config, CommandsDomainDNS.SetHosts, {
                SLD: sld,
                TLD: tld,
            }, {
                ...paramsFormatted,
                tag: params.tag,
                flag: params.flag,
                emailType: params.emailType
            });
        } else {
            response = await request(this.config, CommandsDomainDNS.SetHosts, {
                ...paramsFormatted,
                sld,
                tld,
                tag: params.tag,
                flag: params.flag,
                emailType: params.emailType
            });
        }

       return response.commandResponse.domainDnsSetHostsResult
    }
}
