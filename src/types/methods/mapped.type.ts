import {CommandsDomain, CommandsDomainDNS, CommandsDomainNS, CommandsDomainTransfer} from "@fwg/utils/commands";
import type {
    CreateSuccess,
    GetContactSuccess,
    GetListSuccess,
    GetTldListSuccess,
    SetContactSuccess,
    CheckSuccess,
    ReactiveSuccess,
    RenewSuccess,
    GetRegistrarLockSuccess,
    SetRegistrarLockSuccess,
    GetInfoSuccess
} from "./response/domains.type";
import type {
    ContactDomainParams,
    CreateDomainParams,
    GetContactParams,
    GetInfoParams,
    GetListParams,
    ReactivateDomainParams,
    RenewDomainParams,
    SetRegistrarLockParams
} from "./params/domains-params.type";
import {
    SetDNSCustomSuccess,
    SetDNSDefaultSuccess,
    GetDNSListSuccess,
    GetDNSHostsSuccess,
    GetDNSEmailForwardingSuccess,
    SetDNSEmailForwardingSuccess,
    SetDNSHostsSuccess
} from "@fwg/types/methods/response/domains-dns.type";
import {
    SetDNSCustomParams,
    SetDNSDefaultParams,
    GetDNSListParams,
    GetDNSHostsParams,
    GetDNSEmailForwardingParams,
    SetDNSEmailForwardingParams,
    SetDNSHostsParams, SetDNSHostsFormattedParams
} from "@fwg/types/methods/params/dns-params.type";
import {
    SetDNSRootHostsParams
} from "@fwg/types/methods/params/dns-root-params.type";
import {
    CreateNSSuccess,
    GetNSInfoSuccess,
    DeleteNSSuccess,
    UpdateNSSuccess
} from "@fwg/types/methods/response/domains-ns.type";
import {
    CreateNSParams,
    DeleteNSParams,
    GetInfoNSParams,
    UpdateNSParams
} from "@fwg/types/methods/params/ns-params.type";
import {CreateTransferParams, GetListTransferParams} from "@fwg/types/methods/params/transfer-params.type";
import {
    DomainTransferCreateBaseResult,
    DomainTransferGetListBaseResult,
    DomainTransferGetStatusBaseResult,
    DomainTransferUpdateBaseStatus,
} from "@fwg/types/methods/response/domains-transfer.type";

interface EmptyParams {}
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
    [CommandsDomainDNS.SetDefault]: SetDNSDefaultSuccess
    [CommandsDomainDNS.SetCustom]: SetDNSCustomSuccess
    [CommandsDomainDNS.GetList]: GetDNSListSuccess
    [CommandsDomainDNS.GetHosts]: GetDNSHostsSuccess
    [CommandsDomainDNS.GetEmailForwarding]: GetDNSEmailForwardingSuccess
    [CommandsDomainDNS.SetEmailForwarding]: SetDNSEmailForwardingSuccess
    [CommandsDomainDNS.SetHosts]: SetDNSHostsSuccess
}

export interface MappedDomainNSSuccess {
    [CommandsDomainNS.Create]: CreateNSSuccess
    [CommandsDomainNS.GetInfo]: GetNSInfoSuccess
    [CommandsDomainNS.Update]: UpdateNSSuccess
    [CommandsDomainNS.Delete]: DeleteNSSuccess
}

export type MappedDomainTransferSuccess = {
    [CommandsDomainTransfer.Create]: DomainTransferCreateBaseResult
    [CommandsDomainTransfer.GetList]: DomainTransferGetListBaseResult
    [CommandsDomainTransfer.GetStatus]: DomainTransferGetStatusBaseResult
    [CommandsDomainTransfer.UpdateStatus]: DomainTransferUpdateBaseStatus
}

export type MappedResponseSuccess = MappedDomainSuccess & MappedDomainDNSSuccess & MappedDomainNSSuccess & MappedDomainTransferSuccess

export type NamecheapParamsDomainMap = {
    [CommandsDomain.GetList]: GetListParams
    [CommandsDomain.GetContact]: GetContactParams
    [CommandsDomain.Create]: CreateDomainParams
    [CommandsDomain.GetTldList]: EmptyParams
    [CommandsDomain.SetContact]: ContactDomainParams
    [CommandsDomain.Check]: EmptyParams
    [CommandsDomain.Reactivate]: ReactivateDomainParams,
    [CommandsDomain.Renew]: RenewDomainParams,
    [CommandsDomain.GetRegistrarLock]: EmptyParams,
    [CommandsDomain.SetRegistrarLock]: SetRegistrarLockParams,
    [CommandsDomain.GetInfo]: GetInfoParams
}

export type NamecheapParamsDomainDNSMap = {
    [CommandsDomainDNS.SetDefault]: SetDNSDefaultParams
    [CommandsDomainDNS.SetCustom]: SetDNSCustomParams
    [CommandsDomainDNS.GetList]: GetDNSListParams
    [CommandsDomainDNS.GetHosts]: GetDNSHostsParams
    [CommandsDomainDNS.GetEmailForwarding]: GetDNSEmailForwardingParams
    [CommandsDomainDNS.SetEmailForwarding]: SetDNSEmailForwardingParams
    [CommandsDomainDNS.SetHosts]: SetDNSHostsParams
}

export type NamecheapParamsDomainNSMap = {
    [CommandsDomainNS.Create]: CreateNSParams
    [CommandsDomainNS.Delete]: DeleteNSParams
    [CommandsDomainNS.Update]: UpdateNSParams
    [CommandsDomainNS.GetInfo]: GetInfoNSParams
}

export type NamecheapParamsDomainTransferMap = {
    [CommandsDomainTransfer.Create]: CreateTransferParams
    [CommandsDomainTransfer.GetList]: GetListTransferParams
    [CommandsDomainTransfer.GetStatus]: EmptyParams
    [CommandsDomainTransfer.UpdateStatus]: EmptyParams
}

type AllCommands = CommandsDomain | CommandsDomainDNS | CommandsDomainNS;
type NamecheapPostCommands =  Omit<{
    [K in AllCommands]: EmptyParams;
}, CommandsDomainDNS.SetHosts>;


export type NamecheapRootParamsMap = NamecheapPostCommands & {
    [CommandsDomainDNS.SetHosts]: SetDNSRootHostsParams;
};

export type NamecheapPostParamsMap = NamecheapPostCommands & {
    [CommandsDomainDNS.SetHosts]: SetDNSHostsFormattedParams;
};

/**
     }
 * Represents a mapping of Namecheap API command types to their respective parameter types.
 *
 * The `NamecheapParamsMap` type is an object where each key corresponds to a specific
 * Namecheap command within the `CommandsDomain` enumeration and the associated value
 * represents the required parameters for executing that command.
 */
export type NamecheapParamsMap = NamecheapParamsDomainMap & NamecheapParamsDomainDNSMap & NamecheapParamsDomainNSMap & NamecheapParamsDomainTransferMap