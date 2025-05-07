/**
 * Enumeration representing a collection of commands associated with domain operations in the Namecheap API.
 * Each member of the enum represents a specific operation that can be performed on a domain.
 *
 * Members:
 * - GetList: Represents the command to retrieve a list of domains associated with an account.
 * - GetContact: Represents the command to fetch contact details of a specific domain.
 * - Create: Represents the command to register a new domain.
 * - GetTldList: Represents the command to retrieve the list of supported TLDs (Top Level Domains).
 * - SetContact: Represents the command to set or update contact information for a domain.
 * - Check: Represents the command to check the availability of a specific domain.
 * - Reactivate: Represents the command to reactivate an expired domain.
 * - Renew: Represents the command to renew an active or expired domain.
 * - GetRegistrarLock: Represents the command to retrieve the current registrar lock status of a domain.
 * - SetRegistrarLock: Represents the command to set or modify the registrar lock status of a domain.
 * - GetInfo: Represents the command to retrieve detailed information and configuration details of a domain.
 */
export enum CommandsDomain {
    GetList = "namecheap.domains.getList",
    GetContact = "namecheap.domains.getContacts",
    Create = "namecheap.domains.create",
    GetTldList = "namecheap.domains.getTldList",
    SetContact = "namecheap.domains.setContacts",
    Check = "namecheap.domains.check",
    Reactivate = "namecheap.domains.reactivate",
    Renew = "namecheap.domains.renew",
    GetRegistrarLock = "namecheap.domains.getRegistrarLock",
    SetRegistrarLock = "namecheap.domains.setRegistrarLock",
    GetInfo = "namecheap.domains.getInfo",
}

export enum CommandsDomainDNS {
    SetDefault = "namecheap.domains.dns.setDefault",
    SetCustom = "namecheap.domains.dns.setCustom",
    GetList = "namecheap.domains.dns.getList",
    GetHosts = "namecheap.domains.dns.getHosts",
    GetEmailForwarding = "namecheap.domains.dns.getEmailForwarding",
    SetEmailForwarding = "namecheap.domains.dns.setEmailForwarding",
    SetHosts = "namecheap.domains.dns.setHosts",
}