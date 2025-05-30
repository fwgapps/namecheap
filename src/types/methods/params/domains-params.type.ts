import type { ContactDetail, Contacts } from "../response/domains.type";
import type { IdnCode, DomainListType, LockAction, DomainListSortBy } from "@fwg/types/enum";

export interface GetListParams {
  listType?: DomainListType;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: DomainListSortBy;
}

export interface GetContactParams {
  domainName: string;
}

export interface CreateDomainParams extends Contacts {
  domainName: string;
  years: number;
  promoCode?: string;
  billing?: Partial<ContactDetail>;
  idnCode?: IdnCode;
  extendedAttributes?: string;
  nameservers?: string;
  addFreeWhoisguard?: string;
  WGEnabled?: string;
  isPremiumDomain?: boolean;
  premiumPrice?: number;
  eapFee?: number;
}

export interface ContactDomainParams extends Contacts {
  domainName: string;
  extendedAttributes?: string;
}

export interface ReactivateDomainParams {
  domainName: string;
  promotionCode?: string;
  yearsToAdd?: number;
  isPremiumDomain?: boolean;
  premiumPrice?: number;
}

export interface RenewDomainParams {
  domainName: string;
  years: number;
  promotionCode?: string;
  isPremiumDomain?: boolean;
  premiumPrice?: number;
}

export interface SetRegistrarLockParams {
  domainName: string;
  lockAction: LockAction;
}

export interface GetInfoParams {
  domainName: string;
  hostName?: string;
}
