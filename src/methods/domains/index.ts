import {NamecheapProps} from "../../types/config.type";
import {request} from "../../utils/service";
import {CommandsDomain} from "../../utils/commands";
import {formatGetListResponseSuccess} from "./formatResponse/getList";
import { formatResponseError } from "../../utils/format";
import {ContactDomain, CreateDomain, NamecheapResponseWithErrors} from "../../types/response.type";
import {formatGetContactResponseSuccess} from "./formatResponse/getContacts";
import {formatCreateResponseSuccess} from "./formatResponse/create";
import {formatGetTldtListResponseSuccess} from "./formatResponse/getTldList";
import {formatSetContactResponseSuccess} from "./formatResponse/setContacts";
import {formatCheckResponseSuccess} from "./formatResponse/check";

export class Domains {
    private readonly config: NamecheapProps;

    constructor(config: NamecheapProps) {
        this.config = config;
    }

    async getList() {
        try {
            const response =  await request(this.config, CommandsDomain.GetList);
            return formatGetListResponseSuccess(response)
        } catch (error) {
            throw formatResponseError(error as NamecheapResponseWithErrors)
        }
    }

    async getContacts(domainName: string) {
        try {
            const response =  await request(this.config, CommandsDomain.GetContact, {
                domainName
            });

            return formatGetContactResponseSuccess(response)
        } catch (error) {
            throw formatResponseError(error as NamecheapResponseWithErrors)
        }
    }

    async create(domain: string, params: Omit<CreateDomain, "domainName">) {
        try {
            const response =  await request(this.config, CommandsDomain.Create, {
                ...params,
                domainName: domain
            });
            return formatCreateResponseSuccess(response)
        } catch (error) {
            throw formatResponseError(error as NamecheapResponseWithErrors)
        }
    }

    async getTldList(){
        try {
            const response =  await request(this.config, CommandsDomain.GetTldList);
            return formatGetTldtListResponseSuccess(response)
        } catch (error) {
            throw formatResponseError(error as NamecheapResponseWithErrors)
        }
    }

    async setContacts(domain: string, params: Omit<ContactDomain, "domainName">) {
        try {
            const response =  await request(this.config, CommandsDomain.SetContact, {
                ...params,
                domainName: domain,
            });
            return formatSetContactResponseSuccess(response)
        } catch (error) {
            throw formatResponseError(error as NamecheapResponseWithErrors)
        }
    }

    async check(domains: Array<string>){
        try {
            const response =  await request(this.config, CommandsDomain.Check, {
                domainList: domains.join(),
            });
            return formatCheckResponseSuccess(response)
        } catch (error) {
            throw formatResponseError(error as NamecheapResponseWithErrors)
        }
    }
}
