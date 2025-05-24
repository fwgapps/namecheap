export const RecordType = {
  A: "A",
  AAAA: "AAAA",
  ALIAS: "ALIAS",
  CAA: "CAA",
  CNAME: "CNAME",
  MX: "MX",
  MXE: "MXE",
  NS: "NS",
  TXT: "TXT",
  URL: "URL",
  URL301: "URL301",
  FRAME: "FRAME",
} as const;
export type RecordType = (typeof RecordType)[keyof typeof RecordType];

export const EmailType = {
  MXE: "MXE",
  MX: "MX",
  FWD: "FWD",
  OX: "OX",
} as const;
export type EmailType = (typeof EmailType)[keyof typeof EmailType];

export const LockAction = {
  Lock: "LOCK",
  Unlock: "UNLOCK",
} as const;
export type LockAction = (typeof LockAction)[keyof typeof LockAction];

export const DomainListType = {
  All: "ALL",
  Expiring: "EXPIRING",
  Expired: "EXPIRED",
} as const;
export type DomainListType = (typeof DomainListType)[keyof typeof DomainListType];

export const DomainListSortBy = {
  NameAsc: "NAME",
  NameDesc: "NAME_DESC",
  ExpireDateAsc: "EXPIREDATE",
  ExpireDateDesc: "EXPIREDATE_DESC",
  CreateDateAsc: "CREATEDATE",
  CreateDateDesc: "CREATEDATE_DESC",
} as const;
export type DomainListSortBy = (typeof DomainListSortBy)[keyof typeof DomainListSortBy];

export const IdnCode = {
  AFR: "afr",
  ALB: "alb",
  ARA: "ara",
  ARG: "arg",
  ARM: "arm",
  ASM: "asm",
  AST: "ast",
  AVE: "ave",
  AWA: "awa",
  AZE: "aze",
  BAK: "bak",
  BAL: "bal",
  BAN: "ban",
  BAQ: "baq",
  BAS: "bas",
  BEL: "bel",
  BEN: "ben",
  BHO: "bho",
  BOS: "bos",
  BUL: "bul",
  BUR: "bur",
  CAR: "car",
  CAT: "cat",
  CHE: "che",
  CHI: "chi",
  CHV: "chv",
  COP: "cop",
  COS: "cos",
  CZE: "cze",
  DAN: "dan",
  DIV: "div",
  DOI: "doi",
  DUT: "dut",
  ENG: "eng",
  EST: "est",
  FAO: "fao",
  FIJ: "fij",
  FIN: "fin",
  FRE: "fre",
  FRY: "fry",
  GEO: "geo",
  GER: "ger",
  GLA: "gla",
  GLE: "gle",
  GON: "gon",
  GRE: "gre",
  GUJ: "guj",
  HEB: "heb",
  HIN: "hin",
  HUN: "hun",
  INC: "inc",
  IND: "ind",
  INH: "inh",
  ISL: "isl",
  ITA: "ita",
  JAV: "jav",
  JPN: "jpn",
  KAS: "kas",
  KAZ: "kaz",
  KHM: "khm",
  KIR: "kir",
  KOR: "kor",
  KUR: "kur",
  LAO: "lao",
  LAV: "lav",
  LIT: "lit",
  LTZ: "ltz",
  MAL: "mal",
  MKD: "mkd",
  MLT: "mlt",
  MOL: "mol",
  MON: "mon",
  MRI: "mri",
  MSA: "msa",
  NEP: "nep",
  NOR: "nor",
  ORI: "ori",
  OSS: "oss",
  PAN: "pan",
  PER: "per",
  POL: "pol",
  POR: "por",
  PUS: "pus",
  RAJ: "raj",
  RUM: "rum",
  RUS: "rus",
  SAN: "san",
  SCR: "scr",
  SIN: "sin",
  SLO: "slo",
  SLV: "slv",
  SMO: "smo",
  SND: "snd",
  SOM: "som",
  SPA: "spa",
  SRD: "srd",
  SRP: "srp",
  SWA: "swa",
  SWE: "swe",
  SYR: "syr",
  TAM: "tam",
  TEL: "tel",
  TGK: "tgk",
  THA: "tha",
  TIB: "tib",
  TUR: "tur",
  UKR: "ukr",
  URD: "urd",
  UZB: "uzb",
  VIE: "vie",
  WEL: "wel",
  YID: "yid",
} as const;
export type IdnCode = (typeof IdnCode)[keyof typeof IdnCode];

export const DomainTransferListType = {
  All: "ALL",
  InProgress: "INPROGRESS",
  Cancelled: "CANCELLED",
  Completed: "COMPLETED",
} as const;
export type DomainTransferListType =
  (typeof DomainTransferListType)[keyof typeof DomainTransferListType];

export const DomainTransferSortBy = {
  DomainName: "DOMAINNAME",
  DomainNameDesc: "DOMAINNAME_DESC",
  TransferDate: "TRANSFERDATE",
  TransferDateDesc: "TRANSFERDATE_DESC",
  StatusDate: "STATUSDATE",
  StatusDateDesc: "STATUSDATE_DESC",
} as const;
export type DomainTransferSortBy = (typeof DomainTransferSortBy)[keyof typeof DomainTransferSortBy];

export const SSLType = {
  PositiveSSL: "PositiveSSL",
  EssentialSSL: "EssentialSSL",
  InstantSSL: "InstantSSL",
  InstantSSLPro: "InstantSSL Pro",
  PremiumSSL: "PremiumSSL",
  EVSSL: "EV SSL",
  PositiveSSLWildcard: "PositiveSSL Wildcard",
  EssentialSSLWildcard: "EssentialSSL Wildcard",
  PremiumSSLWildcard: "PremiumSSL Wildcard",
  PositiveSSLMultiDomain: "PositiveSSL Multi Domain",
  MultiDomainSSL: "Multi Domain SSL",
  UnifiedCommunications: "Unified Communications",
  EVMultiDomainSSL: "EV Multi Domain SSL",
} as const;
export type SSLType = (typeof SSLType)[keyof typeof SSLType];

export const SSLListType = {
  ALL: "ALL",
  Processing: "Processing",
  EmailSent: "EmailSent",
  TechnicalProblem: "TechnicalProblem",
  InProgress: "InProgress",
  Completed: "Completed",
  Deactivated: "Deactivated",
  Active: "Active",
  Cancelled: "Cancelled",
  NewPurchase: "NewPurchase",
  NewRenewal: "NewRenewal",
} as const;
export type SSLListType = (typeof SSLListType)[keyof typeof SSLListType];

export const SSLListSortBy = {
  PurchaseDate: "PURCHASEDATE",
  PurchaseDateDesc: "PURCHASEDATE_DESC",
  SSLType: "SSLTYPE",
  SSLTypeDesc: "SSLTYPE_DESC",
  ExpireDateTime: "EXPIREDATETIME",
  ExpireDateTimeDesc: "EXPIREDATETIME_DESC",
  Hostname: "Host_Name",
  HostnameDesc: "Host_Name_DESC",
} as const;
export type SSLListSortBy = (typeof SSLListSortBy)[keyof typeof SSLListSortBy];

export const UserProductType = {
  Domain: "DOMAIN",
  SslCertificate: "SSLCERTIFICATE",
} as const;
export type UserProductType = (typeof UserProductType)[keyof typeof UserProductType];

export const UserProductCategory = {
  Domains: "DOMAINS",
  Comodo: "COMODO",
} as const;
export type UserProductCategory = (typeof UserProductCategory)[keyof typeof UserProductCategory];

export const UserActionName = {
  Register: "REGISTER",
  Renew: "RENEW",
  Reactivate: "REACTIVATE",
  Transfer: "TRANSFER",
  Purchase: "PURCHASE",
} as const;
export type UserActionName = (typeof UserActionName)[keyof typeof UserActionName];

export const UserProductName = {
  COM: "COM",
  InstantSsl: "INSTANTSSL",
} as const;
export type UserProductName = (typeof UserProductName)[keyof typeof UserProductName];

export const UserPaymentType = {
  CreditCard: "Creditcard",
} as const;
export type UserPaymentType = (typeof UserPaymentType)[keyof typeof UserPaymentType];

export const UserListFindBy = {
  EmailAddress: "EMAILADDRESS",
  DomainName: "DOMAINNAME",
  Username: "USERNAME",
} as const;
export type UserListFindBy = (typeof UserListFindBy)[keyof typeof UserListFindBy];

export const WhoIsListType = {
  All: "ALL",
  Alloted: "ALLOTED",
  Free: "FREE",
  Discard: "DISCARD",
} as const;
export type WhoIsListType = (typeof WhoIsListType)[keyof typeof WhoIsListType];

export const GetAddFundsStatus = {
  Created: "CREATED",
  Submitted: "SUBMITTED",
  Completed: "COMPLETED",
  Failed: "FAILED",
  Expired: "EXPIRED",
} as const;
export type GetAddFundsStatus = (typeof GetAddFundsStatus)[keyof typeof GetAddFundsStatus];

export const DomainDnsTag = {
  Issue: "issue",
  IssueWild: "issuewild",
  IODEF: "iodef",
};
export type DomainDnsTag = (typeof DomainDnsTag)[keyof typeof DomainDnsTag];
