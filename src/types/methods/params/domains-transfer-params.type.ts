export enum ListType {
    ALL = "ALL",
    InProgress = "INPROGRESS",
    Cancelled = "CANCELLED",
    Completed = "COMPLETED"
}

export enum SortBy {
    DomainName = "DOMAINNAME",
    DomainNameDesc = "DOMAINNAME_DESC",
    TransferDate = "TRANSFERDATE",
    TransferDateDesc = "TRANSFERDATE_DESC",
    StatusDate = "STATUSDATE",
    StatusDateDesc = "STATUSDATE_DESC"
}

export interface CreateTransferParams  {
    domainName: string,
    years: number,
    eppCode: string,
    promotionCode: string,
    addFreeWhoisGuard: boolean,
    wGenable: boolean
}

export interface GetListTransferParams {
    listType?: ListType
    searchTerm?: string
    page?: number
    pageSize?: number
    sortBy?: SortBy
}