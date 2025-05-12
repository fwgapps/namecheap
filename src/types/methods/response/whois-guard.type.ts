import {Paging} from "@fwg/types/methods/base.type";

export interface WhoIsGuardChangeEmailAddressResult {
    id: number,
    isSuccess: boolean,
    wgEmail: string
    wgOldEmail: string
}
export interface WhoIsGuardChangeEmailAddressBaseResult {
    whoisguardChangeEmailAddressResult: WhoIsGuardChangeEmailAddressResult
}

export interface WhoIsGuardEnableBaseResult {
    whoisguardEnableResult: string
}

export interface WhoIsGuardDisableBaseResult {
    whoisguardDisableResult: string
}

export interface WhoIsGuardGetListResult {
    id: number,
    created: string
    expires: string
    status: string
}

export interface WhoIsGuardGetListBaseResult {
    whoisguardGetListResult: Array<WhoIsGuardGetListResult>,
    paging: Paging
}

export interface WhoIsGuardRenewResult {
    whoisguardId: number,
    years: number,
    renew: boolean,
    orderId: number,
    transactionId: number,
    chargedAmount: number
}

export interface WhoIsGuardRenewBaseResult {
    whoisguardRenewResult: WhoIsGuardRenewResult
}
