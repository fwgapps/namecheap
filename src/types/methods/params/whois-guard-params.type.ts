export interface ChangeEmailAddressParams {
    whoIsGuardId: number
}

export interface EnableParams {
    whoIsGuardId: number
    forwardedToEmail: string
}

export interface DisableParams {
    whoIsGuardId: number
}

export enum ListType {
    All = "ALL",
    Alloted = "ALLOTED",
    Free = "FREE",
    Discard = "DISCARD",
}

export interface GetListParams {
    listType?: ListType,
    page?: number,
    pageSize?: number
}

export interface RenewParams {
    whoIsGuardId: string,
    year: number,
    promotionCode?: number
}