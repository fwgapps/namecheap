import type { Paging } from "../base.type";

export interface DomainGetListResult {
  id: number;
  name: string;
  user: string;
  created: string;
  expires: string;
  isExpired: boolean;
  isLocked: boolean;
  autoRenew: boolean;
  whoisGuard: string;
  isPremium: boolean;
  isOurDns: boolean;
}

export interface GetListSuccess {
  domainGetListResult: Array<DomainGetListResult>;
  paging: Paging;
}

export interface Contacts {
  registrant: ContactDetail;
  tech: ContactDetail;
  admin: ContactDetail;
  auxBilling: ContactDetail;
}

export interface ContactDetail {
  organizationName: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  stateProvince: string;
  stateProvinceChoice: string;
  postalCode: number;
  country: string;
  phone: number;
  fax: number;
  emailAddress: string;
  phoneExt: number;
  readOnly: boolean;
}

interface CurrentAttributes {
  registrantNexus: string;
  registrantPurpose: string;
}

export interface DomainContactsResult extends Contacts {
  currentAttributes: CurrentAttributes;
  whoisGuardContact: Contacts & {
    whoisGuardContact: boolean;
  };
  domain: string;
  domainnameid: number;
}

export interface GetContactSuccess {
  domainContactsResult: DomainContactsResult;
}

export interface DomainCreateResult {
  domain: string;
  registered: boolean;
  chargedAmount: number;
  domainID: number;
  orderID: number;
  transactionID: number;
  whoisguardEnable: boolean;
  nonRealTimeDomain: boolean;
}

export interface CreateSuccess {
  domainCreateResult: DomainCreateResult;
}

interface Category {
  name: string;
  sequenceNumber: number;
}

export interface TLD {
  name: string;
  nonRealTime: boolean;
  minRegisterYears: number;
  maxRegisterYears: number;
  minRenewYears: number;
  maxRenewYears: number;
  renewalMinDays: number;
  renewalMaxDays: number;
  reactivateMaxDays: number;
  minTransferYears: number;
  maxTransferYears: number;
  isApiRegisterable: boolean;
  isApiRenewable: boolean;
  isApiTransferable: boolean;
  isEppRequired: boolean;
  isDisableModContact: boolean;
  isDisableWGAllot: boolean;
  isIncludeInExtendedSearchOnly: boolean;
  sequenceNumber: number;
  type: string;
  subType: string;
  isSupportsIDN: boolean;
  category: string;
  supportsRegistrarLock: boolean;
  addGracePeriodDays: number;
  whoisVerification: boolean;
  providerApiDelete: boolean;
  tldState: string;
  searchGroup: string;
  registry: string;
  categories: Array<Category>;
}

export interface GetTldListSuccess {
  tlds: Array<TLD>;
}

export interface SetContactSuccess {
  domainSetContactResult: string;
}

export interface DomainCheckResult {
  domain: string;
  available: boolean;
  errorNo: number;
  isPremiumName: boolean;
  premiumRegistrationPrice: number;
  premiumRenewalPrice: number;
  premiumRestorePrice: number;
  premiumTransferPrice: number;
  icannFee: number;
  eapFee: number;
}

export interface CheckSuccess {
  domainCheckResult: DomainCheckResult;
}

export interface DomainReactivateResult {
  domain: string;
  isSuccess: boolean;
  chargedAmount: number;
  orderId: number;
  transactionId: number;
}

export interface ReactiveSuccess {
  domainReactivateResult: DomainReactivateResult;
}

export interface DomainRenewResult {
  domainDetails: {
    expiredDate: string;
    numYears: number;
    domainDetails: boolean;
  };
  domainName: string;
  domainId: number;
  renew: true;
  orderId: number;
  transactionId: number;
  chargedAmount: number;
}

export interface RenewSuccess {
  domainRenewResult: DomainRenewResult;
}

export interface DomainGetRegistrarLockResult {
  domain: string;
  registrarLockStatus: boolean;
  isClientUpdateProhibited: boolean;
  isClientDeleteProhibited: boolean;
  isClientHold: boolean;
}

export interface GetRegistrarLockSuccess {
  domainGetRegistrarLockResult: DomainGetRegistrarLockResult;
}

export interface DomainSetRegistrarLockResult {
  domain: string;
  isSuccess: boolean;
  registrarLockStatus: boolean;
  isRegistrarLockStatusUpdated: boolean;
  isClientUpdateProhibitedUpdated: boolean;
  isClientDeleteProhibitedUpdated: boolean;
  isClientHoldUpdated: boolean;
}

export interface SetRegistrarLockSuccess {
  domainSetRegistrarLockResult: DomainSetRegistrarLockResult;
}

export interface DomainGetInfoResult {
  domainDetails: {
    createdDate: string;
    expiredDate: string;
    numYears: number;
    domainDetails: boolean;
  };
  whoisguard: { id: number; enabled: string };
  premiumDnsSubscription: {
    useAutoRenew: boolean;
    subscriptionId: number;
    createdDate: string;
    expirationDate: string;
    isActive: boolean;
    premiumDnsSubscription: boolean;
  };
  dnsDetails: {
    nameserver: Array<string>;
    providerType: string;
    isUsingOurDns: boolean;
    hostCount: number;
    emailType: string;
    dynamicDnsStatus: boolean;
    isFailover: boolean;
  };
  modificationrights: { all: boolean };
  status: string;
  id: number;
  domainName: string;
  ownerName: string;
  isOwner: boolean;
  isPremium: boolean;
}

export interface GetInfoSuccess {
  domainGetInfoResult: DomainGetInfoResult;
}
