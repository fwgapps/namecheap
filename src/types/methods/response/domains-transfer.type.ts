import {Paging} from "@fwg/types/methods/base.type";

export interface DomainTransferCreateResult {
    domainname: string,
    transfer: boolean,
    transferId: number,
    statusId: number,
    orderId: number,
    transactionId: number,
    chargedAmount: number,
    statusCode: number
}

export interface DomainTransferCreateBaseResult {
    domainTransferCreateResult: DomainTransferCreateResult
}

export interface DomainTransferGetStatusResult {
    transferId: number,
    status: string,
    statusId: number
}

export interface DomainTransferGetStatusBaseResult {
    domainTransferGetStatusResult: DomainTransferGetStatusResult
}

export interface DomainTransferUpdateBaseStatus {
    domainTransferUpdateStatusResult: number
}

export interface TransferGetResult {
    id: number,
    domainname: string,
    user: string,
    transferDate: string,
    orderId: number,
    statusId: number,
    status: string,
    statusDate: string,
    statusDescription: string
}

export interface DomainTransferGetListBaseResult {
    transferGetListResult: Array<TransferGetResult>,
    paging: Paging
}
