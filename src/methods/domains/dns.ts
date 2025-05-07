import type { NamecheapProps } from "@fwg/types/config.type";
import type {NamecheapXMLParsedSuccess} from "@fwg/types/methods/base.type";
import {
    GetEmailForwardingSuccess,
    GetHostsSuccess,
    GetListSuccess,
    SetCustomSuccess,
    SetDefaultSuccess, SetEmailForwardingSuccess, SetHostsSuccess
} from "@fwg/types/methods/domains-dns.type";
import {request, requestPost} from "@fwg/utils/service";
import { CommandsDomainDNS } from "@fwg/utils/commands";
import {SetEmailForwarding, SetHosts} from "@fwg/types/methods/dns-params.type";

export class DomainsDNS {
    private readonly config: NamecheapProps;

    constructor(config: NamecheapProps) {
        this.config = config;
    }

    setDefault(sld: string, tld: string): Promise<NamecheapXMLParsedSuccess<SetDefaultSuccess>> {
        return request(this.config, CommandsDomainDNS.SetDefault, {
            sld,
            tld
        });
    }

    setCustom(sld: string, tld: string, nameservers: Array<string>): Promise<NamecheapXMLParsedSuccess<SetCustomSuccess>> {
        return request(this.config, CommandsDomainDNS.SetCustom, {
            sld,
            tld,
            nameservers
        });
    }

    getList(sld: string, tld: string): Promise<NamecheapXMLParsedSuccess<GetListSuccess>> {
        return request(this.config, CommandsDomainDNS.GetList, {
            sld,
            tld,
        });
    }

    getHosts(sld: string, tld: string): Promise<NamecheapXMLParsedSuccess<GetHostsSuccess>> {
        return request(this.config, CommandsDomainDNS.GetHosts, {
            sld,
            tld,
        });
    }

    getEmailForwarding(domain: string): Promise<NamecheapXMLParsedSuccess<GetEmailForwardingSuccess>> {
        return request(this.config, CommandsDomainDNS.GetEmailForwarding, {
            domainName: domain
        });
    }

    setEmailForwarding(
        domain: string,
        params: Omit<SetEmailForwarding, "domainName">
    ): Promise<NamecheapXMLParsedSuccess<SetEmailForwardingSuccess>> {
        return request(this.config, CommandsDomainDNS.SetEmailForwarding, {
            ...params,
            domainName: domain
        });
    }

    setHosts(
        sld: string,
        tld: string,
        params: Omit<SetHosts, "sld" | "tld">
    ): Promise<NamecheapXMLParsedSuccess<SetHostsSuccess>> {
        const { hosts } = params;
        const paramsFormatted = hosts.reduce((acc, host, i) => {
            Object.entries(host).forEach(([key, value]) => {
               acc[key][i] = value
            });

            return acc;
        }, {
            hostname: [],
            ttl: [],
            address: [],
            mxpref: [],
            recordType: []
        })

        if(hosts.length > 10) {
            return requestPost(this.config, CommandsDomainDNS.SetHosts, {
                SLD: sld,
                TLD: tld,
            }, {
                ...paramsFormatted,
                tag: params.tag,
                flag: params.flag,
                emailType: params.emailType
            });
        }

        return request(this.config, CommandsDomainDNS.SetHosts, {
            ...paramsFormatted,
            sld,
            tld,
            tag: params.tag,
            flag: params.flag,
            emailType: params.emailType
        });
    }
}
