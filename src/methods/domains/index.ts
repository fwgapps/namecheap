import { NamecheapProps } from "@fwg/types/config.type";
import { request } from "@fwg/utils/service";
import { CommandsDomain } from "@fwg/utils/commands";
import {
    DomainCheckResult,
    DomainContactsResult,
    DomainCreateResult, DomainGetInfoResult,
    DomainGetListResult, DomainGetRegistrarLockResult,
    DomainReactivateResult, DomainRenewResult, DomainSetRegistrarLockResult,
    TLD
} from "@fwg/types/methods/response/domains.type";
import type {
    ContactDomainParams,
    CreateDomainParams, GetInfoParams, GetListParams,
    ReactivateDomainParams,
    RenewDomainParams,
    SetRegistrarLockParams
} from "@fwg/types/methods/params/domains-params.type";

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
    async getList(params: GetListParams = {
        listType: "ALL",
        page: 1,
        pageSize: 20
    }): Promise<Array<DomainGetListResult>> {
       const response = await request(this.config, CommandsDomain.GetList, params);
       return response.commandResponse.domainGetListResult
    }

    /**
     * Retrieves the contact information associated with the given domain name.
     *
     * @param {string} domainName - The domain name for which to retrieve contact information.
     * @return {Promise<NamecheapXMLParsedSuccess<GetContactSuccess>>} A promise that resolves with the parsed response containing the contact details.
     */
    async getContacts(domainName: string): Promise<DomainContactsResult> {
        const response = await request(this.config, CommandsDomain.GetContact, {
            domainName
        });
        return response.commandResponse.domainContactsResult
    }

    /**
     * Creates a new domain registration with the provided parameters.
     *
     * @param {string} domain - The domain name to be created.
     * @param {Omit<CreateDomainParams, "domainName">} params - The parameters required for domain creation, excluding the domain name.
     * @return {Promise<NamecheapXMLParsedSuccess<CreateSuccess>>} A promise that resolves with the result of the domain creation process.
     */
    async create(domain: string, params: Omit<CreateDomainParams, "domainName">): Promise<DomainCreateResult> {
        const response = await request(this.config, CommandsDomain.Create, {
            ...params,
            domainName: domain
        });

        return response.commandResponse.domainCreateResult
    }

    /**
     * Retrieves the list of top-level domains (TLDs) available from the Namecheap API.
     *
     * @return {Promise<NamecheapXMLParsedSuccess<GetTldListSuccess>>} A promise that resolves with the structured response data containing the details of available TLDs.
     */
    async getTldList(): Promise<Array<TLD>>{
       const response = await request(this.config, CommandsDomain.GetTldList)
       return response.commandResponse.tlds;
    }

    /**
     * Updates the contact details for a specific domain.
     *
     * @param {string} domain - The domain name for which the contact information will be updated.
     * @param {Omit<ContactDomainParams, "domainName">} params - The contact information to set, omitting the domain name property.
     * @return {Promise<NamecheapXMLParsedSuccess<SetContactSuccess>>} A promise that resolves to the result of the contact update operation.
     */
    async setContacts(domain: string, params: Omit<ContactDomainParams, "domainName">): Promise<string> {
        const response = await request(this.config, CommandsDomain.SetContact, {
            ...params,
            domainName: domain,
        });

        return response.commandResponse.domainSetContactResult
    }

    /**
     * Checks the availability of the given list of domains.
     *
     * @param {Array<string>} domains - An array of domain names to check for availability.
     * @return {Promise<NamecheapXMLParsedSuccess<CheckSuccess>>} A promise that resolves to the parsed response indicating the availability status of each domain.
     */
    async check(domains: Array<string>): Promise<DomainCheckResult>{
        const response = await request(this.config, CommandsDomain.Check, {
            domainList: domains.join(),
        });

        return response.commandResponse.domainCheckResult;
    }

    /**
     * Reactivates a previously expired or deactivated domain.
     *
     * @param {string} domain - The name of the domain to be reactivated.
     * @param {Omit<ReactivateDomainParams, "domainName">} [params={}] - Additional parameters for reactivation, excluding the domain name.
     * @return {Promise<NamecheapXMLParsedSuccess<ReactiveSuccess>>} A promise that resolves with the result of the domain reactivation.
     */
    async reactivate(domain: string, params: Omit<ReactivateDomainParams, "domainName"> = {}): Promise<DomainReactivateResult> {
        const response = await request(this.config, CommandsDomain.Reactivate, {
            ...params,
            domainName: domain,
        });

        return response.commandResponse.domainReactivateResult
    }

    /**
     * Renews the registration of a domain name with the specified parameters.
     *
     * @param {string} domain - The domain name to be renewed.
     * @param {Omit<RenewDomainParams, "domainName">} params - The parameters required for renewing the domain, excluding the domain name.
     * @return {Promise<NamecheapXMLParsedSuccess<RenewSuccess>>} A promise that resolves with the parsed response data indicating the success of the renewal.
     */
    async renew(domain: string, params: Omit<RenewDomainParams, "domainName">): Promise<DomainRenewResult> {
        const response = await request(this.config, CommandsDomain.Renew, {
            ...params,
            domainName: domain,
        });

        return response.commandResponse.domainRenewResult
    }

    /**
     * Retrieves the registrar lock status of the specified domain.
     *
     * @param {string} domain - The domain name for which the registrar lock status is being retrieved.
     * @return {Promise<NamecheapXMLParsedSuccess<GetRegistrarLockSuccess>>} A promise that resolves to the parsed success response containing the registrar lock status.
     */
    async getRegistrarLock(domain: string): Promise<DomainGetRegistrarLockResult>{
        const response = await request(this.config, CommandsDomain.GetRegistrarLock, {
            domainName: domain,
        });

        return response.commandResponse.domainGetRegistrarLockResult
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
    async setRegistrarLock(domain: string, params: Omit<SetRegistrarLockParams, "domainName"> = {
        lockAction: "LOCK"
    }): Promise<DomainSetRegistrarLockResult>{
        const response = await request(this.config, CommandsDomain.SetRegistrarLock, {
            ...params,
            domainName: domain,
        });

        return response.commandResponse.domainSetRegistrarLockResult
    }

    /**
     * Retrieves information about a specific domain.
     *
     * @param {string} domain - The domain name for which information is to be retrieved.
     * @param {Omit<GetInfoParams, "domainName">} [params={}] - Additional parameters for the request, excluding the domain name.
     * @return {Promise<NamecheapXMLParsedSuccess<GetInfoSuccess>>} A promise that resolves to the parsed response containing domain information.
     */
    async getInfo(domain: string, params: Omit<GetInfoParams, "domainName"> = {}): Promise<DomainGetInfoResult>{
        const response = await request(this.config, CommandsDomain.GetInfo, {
            ...params,
            domainName: domain,
        });

        return response.commandResponse.domainGetInfoResult
    }
}
