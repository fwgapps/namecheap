import { NamecheapProps } from "@fwg/types/config.type";
import { request } from "@fwg/utils/service";
import { CommandsDomain } from "@fwg/utils/commands";
import type {
    CheckSuccess,
    CreateSuccess,
    GetContactSuccess,
    GetInfoSuccess,
    GetListSuccess,
    GetRegistrarLockSuccess,
    GetTldListSuccess,
    ReactiveSuccess,
    RenewSuccess,
    SetContactSuccess,
    SetRegistrarLockSuccess
} from "@fwg/types/methods/domains.type";
import type { NamecheapXMLParsedSuccess } from "@fwg/types/methods/base.type";
import type {
    ContactDomain,
    CreateDomain, GetInfo, GetList,
    ReactivateDomain,
    RenewDomain,
    SetRegistrarLock
} from "@fwg/types/methods/params.type";

/**
 * The `Domains` class provides methods to interact with domain-related functionalities
 * using the Namecheap API. It allows performing operations such as retrieving domain lists,
 * managing contacts, checking availability, and managing domain statuses.
 */
export class Domains {
    private readonly config: NamecheapProps;

    constructor(config: NamecheapProps) {
        this.config = config;
    }

    /**
     * Retrieves a list of domains or related items based on the specified parameters.
     *
     * @param {Object} params - The parameters to configure the list retrieval.
     * @param {string} [params.listType="ALL"] - The type of list to retrieve (e.g., ALL, EXPIRING, etc.).
     * @param {number} [params.page=1] - The page number of the results to retrieve.
     * @param {number} [params.pageSize=20] - The number of items to retrieve per page.
     * @return {Promise<NamecheapXMLParsedSuccess<GetListSuccess>>} A promise that resolves with the parsed response data.
     */
    getList(params: GetList = {
        listType: "ALL",
        page: 1,
        pageSize: 20
    }): Promise<NamecheapXMLParsedSuccess<GetListSuccess>> {
       return request(this.config, CommandsDomain.GetList, params);
    }

    /**
     * Retrieves the contact information associated with the given domain name.
     *
     * @param {string} domainName - The domain name for which to retrieve contact information.
     * @return {Promise<NamecheapXMLParsedSuccess<GetContactSuccess>>} A promise that resolves with the parsed response containing the contact details.
     */
    getContacts(domainName: string): Promise<NamecheapXMLParsedSuccess<GetContactSuccess>> {
        return request(this.config, CommandsDomain.GetContact, {
            domainName
        });
    }

    /**
     * Creates a new domain registration with the provided parameters.
     *
     * @param {string} domain - The domain name to be created.
     * @param {Omit<CreateDomain, "domainName">} params - The parameters required for domain creation, excluding the domain name.
     * @return {Promise<NamecheapXMLParsedSuccess<CreateSuccess>>} A promise that resolves with the result of the domain creation process.
     */
    create(domain: string, params: Omit<CreateDomain, "domainName">): Promise<NamecheapXMLParsedSuccess<CreateSuccess>> {
        return request(this.config, CommandsDomain.Create, {
            ...params,
            domainName: domain
        });
    }

    /**
     * Retrieves the list of top-level domains (TLDs) available from the Namecheap API.
     *
     * @return {Promise<NamecheapXMLParsedSuccess<GetTldListSuccess>>} A promise that resolves with the structured response data containing the details of available TLDs.
     */
    getTldList(): Promise<NamecheapXMLParsedSuccess<GetTldListSuccess>>{
       return request(this.config, CommandsDomain.GetTldList)
    }

    /**
     * Updates the contact details for a specific domain.
     *
     * @param {string} domain - The domain name for which the contact information will be updated.
     * @param {Omit<ContactDomain, "domainName">} params - The contact information to set, omitting the domain name property.
     * @return {Promise<NamecheapXMLParsedSuccess<SetContactSuccess>>} A promise that resolves to the result of the contact update operation.
     */
    setContacts(domain: string, params: Omit<ContactDomain, "domainName">): Promise<NamecheapXMLParsedSuccess<SetContactSuccess>> {
        return request(this.config, CommandsDomain.SetContact, {
            ...params,
            domainName: domain,
        });
    }

    /**
     * Checks the availability of the given list of domains.
     *
     * @param {Array<string>} domains - An array of domain names to check for availability.
     * @return {Promise<NamecheapXMLParsedSuccess<CheckSuccess>>} A promise that resolves to the parsed response indicating the availability status of each domain.
     */
    check(domains: Array<string>): Promise<NamecheapXMLParsedSuccess<CheckSuccess>>{
        return request(this.config, CommandsDomain.Check, {
            domainList: domains.join(),
        });
    }

    /**
     * Reactivates a previously expired or deactivated domain.
     *
     * @param {string} domain - The name of the domain to be reactivated.
     * @param {Omit<ReactivateDomain, "domainName">} [params={}] - Additional parameters for reactivation, excluding the domain name.
     * @return {Promise<NamecheapXMLParsedSuccess<ReactiveSuccess>>} A promise that resolves with the result of the domain reactivation.
     */
    reactivate(domain: string, params: Omit<ReactivateDomain, "domainName"> = {}): Promise<NamecheapXMLParsedSuccess<ReactiveSuccess>> {
        return request(this.config, CommandsDomain.Reactivate, {
            ...params,
            domainName: domain,
        });
    }

    /**
     * Renews the registration of a domain name with the specified parameters.
     *
     * @param {string} domain - The domain name to be renewed.
     * @param {Omit<RenewDomain, "domainName">} params - The parameters required for renewing the domain, excluding the domain name.
     * @return {Promise<NamecheapXMLParsedSuccess<RenewSuccess>>} A promise that resolves with the parsed response data indicating the success of the renewal.
     */
    renew(domain: string, params: Omit<RenewDomain, "domainName">): Promise<NamecheapXMLParsedSuccess<RenewSuccess>> {
        return request(this.config, CommandsDomain.Renew, {
            ...params,
            domainName: domain,
        });
    }

    /**
     * Retrieves the registrar lock status of the specified domain.
     *
     * @param {string} domain - The domain name for which the registrar lock status is being retrieved.
     * @return {Promise<NamecheapXMLParsedSuccess<GetRegistrarLockSuccess>>} A promise that resolves to the parsed success response containing the registrar lock status.
     */
    getRegistrarLock(domain: string): Promise<NamecheapXMLParsedSuccess<GetRegistrarLockSuccess>>{
        return request(this.config, CommandsDomain.GetRegistrarLock, {
            domainName: domain,
        });
    }

    /**
     * Sets the registrar lock status for a specified domain.
     *
     * @param {string} domain - The domain name for which the registrar lock status is being set.
     * @param {Object} params - Additional configuration options for the registrar lock action.
     *                          Defaults to `{ lockAction: "LOCK" }`. Excludes the "domainName" property.
     * @return {Promise<NamecheapXMLParsedSuccess<SetRegistrarLockSuccess>>} A promise that resolves with the parsed response
     *         indicating the success or failure of the operation.
     */
    setRegistrarLock(domain: string, params: Omit<SetRegistrarLock, "domainName"> = {
        lockAction: "LOCK"
    }): Promise<NamecheapXMLParsedSuccess<SetRegistrarLockSuccess>>{
        return request(this.config, CommandsDomain.SetRegistrarLock, {
            ...params,
            domainName: domain,
        });
    }

    /**
     * Retrieves information about a specific domain.
     *
     * @param {string} domain - The domain name for which information is to be retrieved.
     * @param {Omit<GetInfo, "domainName">} [params={}] - Additional parameters for the request, excluding the domain name.
     * @return {Promise<NamecheapXMLParsedSuccess<GetInfoSuccess>>} A promise that resolves to the parsed response containing domain information.
     */
    getInfo(domain: string, params: Omit<GetInfo, "domainName"> = {}): Promise<NamecheapXMLParsedSuccess<GetInfoSuccess>>{
        return request(this.config, CommandsDomain.GetInfo, {
            ...params,
            domainName: domain,
        });
    }
}
