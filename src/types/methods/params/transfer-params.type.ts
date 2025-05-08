export enum ListType {
    ALL = "ALL",
    IN_PROGRESS = "INPROGRESS",
    CANCELLED = "CANCELLED",
    COMPLETED = "COMPLETED"
}

export enum SortBy {
    DOMAIN_NAME = "DOMAINNAME",
    DOMAIN_NAME_DESC = "DOMAINNAME_DESC",
    TRANSFER_DATE = "TRANSFERDATE",
    TRANSFER_DATE_DESC = "TRANSFERDATE_DESC",
    STATUS_DATE = "STATUSDATE",
    STATUS_DATE_DESC = "STATUSDATE_DESC"
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