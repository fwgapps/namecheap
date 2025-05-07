import {CommandsDomain, CommandsDomainDNS} from "@fwg/utils/commands";
import type {
    CreateSuccess,
    GetContactSuccess,
    GetListSuccess,
    GetTldListSuccess,
    SetContactSuccess,
    CheckSuccess,
    ReactiveSuccess, RenewSuccess, GetRegistrarLockSuccess, SetRegistrarLockSuccess, GetInfoSuccess
} from "./domains.type";
import type {
    ContactDomain,
    CreateDomain,
    EmptyParams,
    GetContactParams, GetInfo, GetList,
    ReactivateDomain,
    RenewDomain,
    SetRegistrarLock
} from "./params.type";
import {
    SetCustomSuccess,
    SetDefaultSuccess,
    GetListSuccess as DNSGetListSuccess,
    GetHostsSuccess, GetEmailForwardingSuccess, SetEmailForwardingSuccess, SetHostsSuccess
} from "@fwg/types/methods/domains-dns.type";
import {
    SetCustom,
    SetDefault,
    GetList as DNSGetList,
    GetHosts,
    GetEmailForwarding, SetEmailForwarding, SetHosts
} from "@fwg/types/methods/dns-params.type";
import {
    SetHosts as SetHostsRoot
} from "@fwg/types/methods/dns-root-params.type";

/**
 * Represents a mapped collection of domain operation commands to their corresponding success response types.
 *
 * This interface serves as a mapping for domain-related operations, where each key represents
 * a specific domain command defined in CommandsDomain, and the values represent the expected
 * success response type for those commands.
 *
 * The keys of the object conform to the CommandsDomain enumeration, indicating the specific actions
 * or operations performed on a domain. The values are types that correspond to successful outcomes for
 * each command.
 *
 * The purpose of this interface is to provide a clear structure for handling the outcomes of domain-related
 * operations, improving type safety and ensuring accurate typing of responses.
 */
export interface MappedDomainSuccess {
    [CommandsDomain.GetList]: GetListSuccess
    [CommandsDomain.GetContact]: GetContactSuccess
    [CommandsDomain.Create]: CreateSuccess
    [CommandsDomain.GetTldList]: GetTldListSuccess
    [CommandsDomain.SetContact]: SetContactSuccess
    [CommandsDomain.Check]: CheckSuccess
    [CommandsDomain.Reactivate]: ReactiveSuccess
    [CommandsDomain.Renew]: RenewSuccess,
    [CommandsDomain.GetRegistrarLock]: GetRegistrarLockSuccess
    [CommandsDomain.SetRegistrarLock]: SetRegistrarLockSuccess
    [CommandsDomain.GetInfo]: GetInfoSuccess
}

export interface MappedDomainDNSSuccess {
    [CommandsDomainDNS.SetDefault]: SetDefaultSuccess
    [CommandsDomainDNS.SetCustom]: SetCustomSuccess
    [CommandsDomainDNS.GetList]: DNSGetListSuccess
    [CommandsDomainDNS.GetHosts]: GetHostsSuccess
    [CommandsDomainDNS.GetEmailForwarding]: GetEmailForwardingSuccess
    [CommandsDomainDNS.SetEmailForwarding]: SetEmailForwardingSuccess
    [CommandsDomainDNS.SetHosts]: SetHostsSuccess
}

export type MappedResponseSuccess = MappedDomainSuccess & MappedDomainDNSSuccess

export type NamecheapParamsDomainMap = {
    [CommandsDomain.GetList]: GetList
    [CommandsDomain.GetContact]: GetContactParams
    [CommandsDomain.Create]: CreateDomain
    [CommandsDomain.GetTldList]: EmptyParams
    [CommandsDomain.SetContact]: ContactDomain
    [CommandsDomain.Check]: EmptyParams
    [CommandsDomain.Reactivate]: ReactivateDomain,
    [CommandsDomain.Renew]: RenewDomain,
    [CommandsDomain.GetRegistrarLock]: EmptyParams,
    [CommandsDomain.SetRegistrarLock]: SetRegistrarLock,
    [CommandsDomain.GetInfo]: GetInfo
}

export type NamecheapParamsDomainDNSMap = {
    [CommandsDomainDNS.SetDefault]: SetDefault
    [CommandsDomainDNS.SetCustom]: SetCustom
    [CommandsDomainDNS.GetList]: DNSGetList
    [CommandsDomainDNS.GetHosts]: GetHosts
    [CommandsDomainDNS.GetEmailForwarding]: GetEmailForwarding
    [CommandsDomainDNS.SetEmailForwarding]: SetEmailForwarding
    [CommandsDomainDNS.SetHosts]: SetHosts
}


export type NamecheapRootParamsMap = {
    [CommandsDomainDNS.SetHosts]: SetHostsRoot

    // Only to keep compatible with GET method
    [CommandsDomainDNS.SetDefault]: EmptyParams
    [CommandsDomainDNS.SetCustom]: EmptyParams
    [CommandsDomainDNS.GetList]: EmptyParams
    [CommandsDomainDNS.GetHosts]: EmptyParams
    [CommandsDomainDNS.GetEmailForwarding]: EmptyParams
    [CommandsDomainDNS.SetEmailForwarding]: EmptyParams
    [CommandsDomain.GetList]: EmptyParams
    [CommandsDomain.GetContact]: EmptyParams
    [CommandsDomain.Create]: EmptyParams
    [CommandsDomain.GetTldList]: EmptyParams
    [CommandsDomain.SetContact]: EmptyParams
    [CommandsDomain.Check]: EmptyParams
    [CommandsDomain.Reactivate]: EmptyParams,
    [CommandsDomain.Renew]: EmptyParams,
    [CommandsDomain.GetRegistrarLock]: EmptyParams,
    [CommandsDomain.SetRegistrarLock]: EmptyParams,
    [CommandsDomain.GetInfo]: EmptyParams
}

/**
     }
 * Represents a mapping of Namecheap API command types to their respective parameter types.
 *
 * The `NamecheapParamsMap` type is an object where each key corresponds to a specific
 * Namecheap command within the `CommandsDomain` enumeration and the associated value
 * represents the required parameters for executing that command.
 */
export type NamecheapParamsMap = NamecheapParamsDomainMap & NamecheapParamsDomainDNSMap