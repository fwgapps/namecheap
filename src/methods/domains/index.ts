import {NamecheapProps} from "../../types/config.type";
import {request} from "../../utils/service";
import {CommandsDomain} from "../../utils/commands";
import type {
    CheckSuccess,
    CreateSuccess,
    GetContactSuccess,
    GetListSuccess,
    GetTldListSuccess,
    SetContactSuccess
} from "../../types/methods/domains.type";
import {NamecheapXMLParsedSuccess} from "../../types/methods/base.type";
import {ContactDomain, CreateDomain} from "../../types/methods/params.type";

export class Domains {
    private readonly config: NamecheapProps;

    constructor(config: NamecheapProps) {
        this.config = config;
    }

    getList(): Promise<NamecheapXMLParsedSuccess<GetListSuccess>> {
       return request(this.config, CommandsDomain.GetList);
    }

    getContacts(domainName: string): Promise<NamecheapXMLParsedSuccess<GetContactSuccess>> {
        return request(this.config, CommandsDomain.GetContact, {
            domainName
        });
    }

    create(domain: string, params: Omit<CreateDomain, "domainName">): Promise<NamecheapXMLParsedSuccess<CreateSuccess>> {
        return request(this.config, CommandsDomain.Create, {
            ...params,
            domainName: domain
        });
    }

    getTldList(): Promise<NamecheapXMLParsedSuccess<GetTldListSuccess>>{
       return request(this.config, CommandsDomain.GetTldList)
    }

    setContacts(domain: string, params: Omit<ContactDomain, "domainName">): Promise<NamecheapXMLParsedSuccess<SetContactSuccess>> {
        return request(this.config, CommandsDomain.SetContact, {
            ...params,
            domainName: domain,
        });
    }

    check(domains: Array<string>): Promise<NamecheapXMLParsedSuccess<CheckSuccess>>{
        return request(this.config, CommandsDomain.Check, {
            domainList: domains.join(),
        });
    }
}
