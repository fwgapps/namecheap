import type { DomainTransferListType, DomainTransferSortBy } from "@fwg/types/enum";

export interface CreateTransferParams {
  domainName: string;
  years: number;
  eppCode: string;
  promotionCode: string;
  addFreeWhoisGuard: boolean;
  wGenable: boolean;
}

export interface GetListTransferParams {
  listType?: DomainTransferListType;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: DomainTransferSortBy;
}
