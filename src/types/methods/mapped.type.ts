import {
    CommandsDomain,
    CommandsDomainDNS,
    CommandsDomainNS,
    CommandsDomainTransfer,
    CommandsSSL, CommandsUser, CommandsUserAddress
} from "@fwg/utils/commands";
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
} from "@fwg/types/methods/params/domains-dns-params.type";
import {
    SetDNSRootHostsParams
} from "@fwg/types/methods/params/domains-dns-root-params.type";
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
} from "@fwg/types/methods/params/domains-ns-params.type";
import {CreateTransferParams, GetListTransferParams} from "@fwg/types/methods/params/domains-transfer-params.type";
import {
    DomainTransferCreateBaseResult,
    DomainTransferGetListBaseResult,
    DomainTransferGetStatusBaseResult,
    DomainTransferUpdateBaseStatus,
} from "@fwg/types/methods/response/domains-transfer.type";
import {
    ActivateSSLParams,
    CreateSSLParams, EditDCVMethodParams,
    GetApproverEmailListSSLParams,
    GetListSSLParams,
    ParseCSRSSLParams, ReissueSSLParams, RenewSSLParams
} from "@fwg/types/methods/params/ssl-params.type";
import {
    RevokeCertificateBaseResult,
    SSLActivateBaseResult,
    SSLCreateBaseResult, SSLEditDcvMethodBaseResult,
    SSLGetApproverEmailListBaseResult,
    SSLGetInfoBaseResult,
    SSLGetListBaseResult,
    SSLParseCsrBaseResult,
    SSLPurchaseMoreSansBaseResult,
    SSLRenewBaseResult,
    SSLResendApproverEmailBaseResult,
    SSLResendFulfillmentEmailBaseResult
} from "@fwg/types/methods/response/ssl.type";
import {
    UserChangePasswordBaseResult,
    UserCreateAddFundsRequestBaseResult,
    UserCreateBaseResult,
    UserGetAddFundsStatusBaseResult,
    UserGetBalancesBaseResult,
    UserGetPricingBaseResult, UserLoginBaseResult, UserResetPasswordBaseResult,
    UserUpdateBaseResult
} from "@fwg/types/methods/response/users.type";
import {
    ChangePasswordParams,
    CreateAddFundsRequestParams, CreateUserParams, GetAddFundsStatusParams,
    GetPricingUserParams, LoginUserParams, ResetPasswordParams,
    UpdateParams
} from "@fwg/types/methods/params/users-params.type";
import {
    CreateUserAddressParams,
    DeleteUserAddressParams,
    GetUserAddressInfoParam, SetDefaultUserAddressParams, UpdateUserAddressParams
} from "@fwg/types/methods/params/users-address-params.type";
import {
    AddressCreateBaseResult,
    AddressDeleteBaseResult, AddressGetListBaseResult, AddressSetDefaultBaseResult, AddressUpdateBaseResult,
    GetAddressInfoBaseResult
} from "@fwg/types/methods/response/users-address.type";

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

export type NamecheapParamsSSLSuccess = {
    [CommandsSSL.Create]: SSLCreateBaseResult
    [CommandsSSL.GetList]: SSLGetListBaseResult
    [CommandsSSL.ParseCRS]: SSLParseCsrBaseResult
    [CommandsSSL.GetApproverEmailList]: SSLGetApproverEmailListBaseResult
    [CommandsSSL.Activate]: SSLActivateBaseResult
    [CommandsSSL.ResendApproverEmail]: SSLResendApproverEmailBaseResult
    [CommandsSSL.GetInfo]: SSLGetInfoBaseResult
    [CommandsSSL.Renew]: SSLRenewBaseResult
    [CommandsSSL.Reissue]: SSLActivateBaseResult
    [CommandsSSL.ResendFulfillmentEmail]: SSLResendFulfillmentEmailBaseResult
    [CommandsSSL.PurchaseMoreSANS]: SSLPurchaseMoreSansBaseResult
    [CommandsSSL.RevokeCertificate]: RevokeCertificateBaseResult
    [CommandsSSL.EditDCVMethod]: SSLEditDcvMethodBaseResult
}


export type NamecheapParamsUserSuccess = {
    [CommandsUser.GetPricing]: UserGetPricingBaseResult
    [CommandsUser.GetBalances]: UserGetBalancesBaseResult
    [CommandsUser.ChangePassword]: UserChangePasswordBaseResult
    [CommandsUser.Update]: UserUpdateBaseResult
    [CommandsUser.CreateAddFundsRequest]: UserCreateAddFundsRequestBaseResult
    [CommandsUser.GetAddFundsStatus]: UserGetAddFundsStatusBaseResult
    [CommandsUser.Create]: UserCreateBaseResult
    [CommandsUser.Login]: UserLoginBaseResult
    [CommandsUser.ResetPassword]: UserResetPasswordBaseResult
}

export type NamecheapParamsUserAddressSuccess = {
    [CommandsUserAddress.Create]: AddressCreateBaseResult
    [CommandsUserAddress.Delete]: AddressDeleteBaseResult
    [CommandsUserAddress.GetInfo]: GetAddressInfoBaseResult
    [CommandsUserAddress.GetList]: AddressGetListBaseResult
    [CommandsUserAddress.SetDefault]: AddressSetDefaultBaseResult
    [CommandsUserAddress.Update]: AddressUpdateBaseResult
}

export type MappedResponseSuccess = MappedDomainSuccess & MappedDomainDNSSuccess & MappedDomainNSSuccess & MappedDomainTransferSuccess & NamecheapParamsSSLSuccess & NamecheapParamsUserSuccess & NamecheapParamsUserAddressSuccess

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

export type NamecheapParamsUsersMap = {
    [CommandsUser.GetPricing]: GetPricingUserParams
    [CommandsUser.GetBalances]: EmptyParams
    [CommandsUser.ChangePassword]: ChangePasswordParams
    [CommandsUser.Update]: UpdateParams
    [CommandsUser.CreateAddFundsRequest]: CreateAddFundsRequestParams
    [CommandsUser.GetAddFundsStatus]: GetAddFundsStatusParams
    [CommandsUser.Create]: CreateUserParams
    [CommandsUser.Login]: LoginUserParams
    [CommandsUser.ResetPassword]: ResetPasswordParams
}

export type NamecheapParamsUsersAddressMap = {
    [CommandsUserAddress.Create]: CreateUserAddressParams
    [CommandsUserAddress.Delete]: DeleteUserAddressParams
    [CommandsUserAddress.GetInfo]: GetUserAddressInfoParam
    [CommandsUserAddress.GetList]: EmptyParams
    [CommandsUserAddress.SetDefault]: SetDefaultUserAddressParams
    [CommandsUserAddress.Update]: UpdateUserAddressParams
}

type AllCommands = CommandsDomain |
    CommandsDomainDNS |
    CommandsDomainNS |
    CommandsDomainTransfer |
    CommandsSSL |
    CommandsUser;

type NamecheapPostCommands =  Omit<{
    [K in AllCommands]: EmptyParams;
}, CommandsDomainDNS.SetHosts>;


export type NamecheapRootParamsMap = NamecheapPostCommands & {
    [CommandsDomainDNS.SetHosts]: SetDNSRootHostsParams;
    [CommandsSSL.ParseCRS]: ParseCSRSSLParams;
};

export type NamecheapPostParamsMap = NamecheapPostCommands & {
    [CommandsDomainDNS.SetHosts]: SetDNSHostsFormattedParams;
};

export type NamecheapParamsSSLMap = {
    [CommandsSSL.Create]: CreateSSLParams,
    [CommandsSSL.GetList]: GetListSSLParams,
    [CommandsSSL.ParseCRS]: EmptyParams,
    [CommandsSSL.GetApproverEmailList]: GetApproverEmailListSSLParams,
    [CommandsSSL.Activate]: ActivateSSLParams,
    [CommandsSSL.ResendApproverEmail]: EmptyParams,
    [CommandsSSL.GetInfo]: EmptyParams,
    [CommandsSSL.Renew]: RenewSSLParams,
    [CommandsSSL.Reissue]: ReissueSSLParams,
    [CommandsSSL.ResendFulfillmentEmail]: EmptyParams,
    [CommandsSSL.PurchaseMoreSANS]: EmptyParams,
    [CommandsSSL.RevokeCertificate]: EmptyParams,
    [CommandsSSL.EditDCVMethod]: EditDCVMethodParams,
}

/**
 * Represents a mapping of Namecheap API command types to their respective parameter types.
 *
 * The `NamecheapParamsMap` type is an object where each key corresponds to a specific
 * Namecheap command within the `CommandsDomain` enumeration and the associated value
 * represents the required parameters for executing that command.
 */
export type NamecheapParamsMap = NamecheapParamsDomainMap & NamecheapParamsDomainDNSMap & NamecheapParamsDomainNSMap & NamecheapParamsDomainTransferMap & NamecheapParamsSSLMap & NamecheapParamsUsersMap & NamecheapParamsUsersAddressMap