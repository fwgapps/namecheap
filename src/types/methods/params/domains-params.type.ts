import type { ContactDetail, Contacts } from "../response/domains.type";

export type IdnCode =
  | "afr"
  | "alb"
  | "ara"
  | "arg"
  | "arm"
  | "asm"
  | "ast"
  | "ave"
  | "awa"
  | "aze"
  | "bak"
  | "bal"
  | "ban"
  | "baq"
  | "bas"
  | "bel"
  | "ben"
  | "bho"
  | "bos"
  | "bul"
  | "bur"
  | "car"
  | "cat"
  | "che"
  | "chi"
  | "chv"
  | "cop"
  | "cos"
  | "cze"
  | "dan"
  | "div"
  | "doi"
  | "dut"
  | "eng"
  | "est"
  | "fao"
  | "fij"
  | "fin"
  | "fre"
  | "fry"
  | "geo"
  | "ger"
  | "gla"
  | "gle"
  | "gon"
  | "gre"
  | "guj"
  | "heb"
  | "hin"
  | "hun"
  | "inc"
  | "ind"
  | "inh"
  | "isl"
  | "ita"
  | "jav"
  | "jpn"
  | "kas"
  | "kaz"
  | "khm"
  | "kir"
  | "kor"
  | "kur"
  | "lao"
  | "lav"
  | "lit"
  | "ltz"
  | "mal"
  | "mkd"
  | "mlt"
  | "mol"
  | "mon"
  | "mri"
  | "msa"
  | "nep"
  | "nor"
  | "ori"
  | "oss"
  | "pan"
  | "per"
  | "pol"
  | "por"
  | "pus"
  | "raj"
  | "rum"
  | "rus"
  | "san"
  | "scr"
  | "sin"
  | "slo"
  | "slv"
  | "smo"
  | "snd"
  | "som"
  | "spa"
  | "srd"
  | "srp"
  | "swa"
  | "swe"
  | "syr"
  | "tam"
  | "tel"
  | "tgk"
  | "tha"
  | "tib"
  | "tur"
  | "ukr"
  | "urd"
  | "uzb"
  | "vie"
  | "wel"
  | "yid";

export type ListType = "ALL" | "EXPIRING" | "EXPIRED";

export type SortBy =
  | "NAME"
  | "NAME_DESC"
  | "EXPIREDATE"
  | "EXPIREDATE_DESC"
  | "CREATEDATE"
  | "CREATEDATE_DESC";

export interface GetListParams {
  listType?: ListType;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: SortBy;
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
  extendedAttributes: string;
  nameservers?: string;
  addFreeWhoisguard?: string;
  WGEnabled?: string;
  isPremiumDomain?: boolean;
  premiumPrice?: number;
  eapPrice?: number;
}

export interface ContactDomainParams extends Contacts {
  domainName: string;
  extendedAttributes: string;
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

export type LockAction = "LOCK" | "UNLOCK";

export interface SetRegistrarLockParams {
  domainName: string;
  lockAction: LockAction;
}

export interface GetInfoParams {
  domainName: string;
  hostName?: string;
}
