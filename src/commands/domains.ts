import { defineCommand } from "../core/define";
import type { El } from "../core/element";
import { optionalField } from "../core/fields";
import { parsePaging } from "../core/paging";
import type { Paging } from "../core/paging";

// ---------------------------------------------------------------------------
// namecheap.domains.getList
// ---------------------------------------------------------------------------

export type DomainsListType = "ALL" | "EXPIRING" | "EXPIRED";

export type DomainsSortBy =
  "NAME" | "NAME_DESC" | "EXPIREDATE" | "EXPIREDATE_DESC" | "CREATEDATE" | "CREATEDATE_DESC";

export interface DomainsGetListParams {
  listType?: DomainsListType;
  /** Keyword to look for in the domain list. */
  searchTerm?: string;
  page?: number;
  /** Min 10, max 100. */
  pageSize?: number;
  sortBy?: DomainsSortBy;
}

export interface DomainsListItem {
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
  isOurDNS: boolean;
}

export interface DomainsGetListResult {
  domains: DomainsListItem[];
  paging: Paging;
}

function parseListItem(domain: El): DomainsListItem {
  return {
    id: domain.number("ID"),
    name: domain.string("Name"),
    user: domain.string("User"),
    created: domain.string("Created"),
    expires: domain.string("Expires"),
    isExpired: domain.boolean("IsExpired"),
    isLocked: domain.boolean("IsLocked"),
    autoRenew: domain.boolean("AutoRenew"),
    whoisGuard: domain.string("WhoisGuard"),
    isPremium: domain.boolean("IsPremium"),
    isOurDNS: domain.boolean("IsOurDNS"),
  };
}

const getList = /* @__PURE__ */ defineCommand<DomainsGetListParams, DomainsGetListResult>({
  name: "namecheap.domains.getList",
  parse: (cr) => ({
    domains: (cr.optional("DomainGetListResult")?.all("Domain") ?? []).map(parseListItem),
    paging: parsePaging(cr.one("Paging")),
  }),
});

// ---------------------------------------------------------------------------
// namecheap.domains.check
// ---------------------------------------------------------------------------

export interface DomainsCheckParams {
  /** Comma-separated list of domains to check (max 50). */
  domainList: string;
}

export interface DomainsCheckItem {
  domain: string;
  available: boolean;
  /** Present in recorded responses, not in the reference. */
  errorNo?: number;
  /** Present in recorded responses, not in the reference. */
  description?: string;
  isPremiumName: boolean;
  premiumRegistrationPrice: number;
  premiumRenewalPrice: number;
  premiumRestorePrice: number;
  premiumTransferPrice: number;
  icannFee: number;
  eapFee: number;
}

export type DomainsCheckResult = DomainsCheckItem[];

const check = /* @__PURE__ */ defineCommand<DomainsCheckParams, DomainsCheckResult>({
  name: "namecheap.domains.check",
  parse: (cr) =>
    cr.all("DomainCheckResult").map((item) => ({
      domain: item.string("Domain"),
      available: item.boolean("Available"),
      ...optionalField("errorNo", item.optionalNumber("ErrorNo")),
      ...optionalField("description", item.optionalString("Description")),
      isPremiumName: item.boolean("IsPremiumName"),
      premiumRegistrationPrice: item.number("PremiumRegistrationPrice"),
      premiumRenewalPrice: item.number("PremiumRenewalPrice"),
      premiumRestorePrice: item.number("PremiumRestorePrice"),
      premiumTransferPrice: item.number("PremiumTransferPrice"),
      icannFee: item.number("IcannFee"),
      eapFee: item.number("EapFee"),
    })),
});

// ---------------------------------------------------------------------------
// namecheap.domains.getRegistrarLock / setRegistrarLock
// ---------------------------------------------------------------------------

export interface DomainsGetRegistrarLockParams {
  domainName: string;
}

export interface DomainsGetRegistrarLockResult {
  domain: string;
  registrarLockStatus: boolean;
}

const getRegistrarLock = /* @__PURE__ */ defineCommand<
  DomainsGetRegistrarLockParams,
  DomainsGetRegistrarLockResult
>({
  name: "namecheap.domains.getRegistrarLock",
  parse: (cr) => {
    const result = cr.one("DomainGetRegistrarLockResult");
    return {
      domain: result.string("Domain"),
      registrarLockStatus: result.boolean("RegistrarLockStatus"),
    };
  },
});

export type DomainsLockAction = "LOCK" | "UNLOCK";

export interface DomainsSetRegistrarLockParams {
  domainName: string;
  /** Default: LOCK. */
  lockAction?: DomainsLockAction;
}

export interface DomainsSetRegistrarLockResult {
  domain: string;
  isSuccess: boolean;
}

const setRegistrarLock = /* @__PURE__ */ defineCommand<
  DomainsSetRegistrarLockParams,
  DomainsSetRegistrarLockResult
>({
  name: "namecheap.domains.setRegistrarLock",
  parse: (cr) => {
    const result = cr.one("DomainSetRegistrarLockResult");
    return { domain: result.string("Domain"), isSuccess: result.boolean("IsSuccess") };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.reactivate
// ---------------------------------------------------------------------------

/**
 * @remarks Billed: this command charges your Namecheap account.
 */
export interface DomainsReactivateParams {
  domainName: string;
  promotionCode?: string;
  /** Number of years to add after expiry. */
  yearsToAdd?: number;
  isPremiumDomain?: boolean;
  /** Reactivation price for a premium domain. */
  premiumPrice?: number | string;
}

export interface DomainsReactivateResult {
  domain: string;
  isSuccess: boolean;
  chargedAmount: number;
  orderID: number;
  transactionID: number;
}

const reactivate = /* @__PURE__ */ defineCommand<DomainsReactivateParams, DomainsReactivateResult>({
  name: "namecheap.domains.reactivate",
  parse: (cr) => {
    const result = cr.one("DomainReactivateResult");
    return {
      domain: result.string("Domain"),
      isSuccess: result.boolean("IsSuccess"),
      chargedAmount: result.number("ChargedAmount"),
      orderID: result.number("OrderID"),
      transactionID: result.number("TransactionID"),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.renew
// ---------------------------------------------------------------------------

/**
 * @remarks Billed: this command charges your Namecheap account.
 */
export interface DomainsRenewParams {
  domainName: string;
  years: number;
  promotionCode?: string;
  isPremiumDomain?: boolean;
  /** Renewal price for a premium domain. */
  premiumPrice?: number | string;
}

export interface DomainsRenewResult {
  domainName: string;
  domainID: number;
  renew: boolean;
  chargedAmount: number;
  orderID: number;
  transactionID: number;
  domainDetails: {
    /** Date and time as sent by the server, e.g. `12/14/2034 1:01:07 PM`. */
    expiredDate: string;
    numYears: number;
  };
}

const renew = /* @__PURE__ */ defineCommand<DomainsRenewParams, DomainsRenewResult>({
  name: "namecheap.domains.renew",
  parse: (cr) => {
    const result = cr.one("DomainRenewResult");
    const details = result.one("DomainDetails");
    return {
      domainName: result.string("DomainName"),
      domainID: result.number("DomainID"),
      renew: result.boolean("Renew"),
      chargedAmount: result.number("ChargedAmount"),
      orderID: result.number("OrderID"),
      transactionID: result.number("TransactionID"),
      domainDetails: {
        expiredDate: details.one("ExpiredDate").text(),
        numYears: details.one("NumYears").numberText(),
      },
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.setContacts
// ---------------------------------------------------------------------------

/**
 * One contact block of a request. Nested under `registrant`, `tech`, `admin` or
 * `auxBilling`, so `registrant.firstName` is sent as `RegistrantFirstName`.
 */
export interface DomainsContactParams {
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  /** Format +NNN.NNNNNNNNNN. */
  phone: string;
  emailAddress: string;
  organizationName?: string;
  jobTitle?: string;
  address2?: string;
}

export interface DomainsSetContactsParams {
  domainName: string;
  registrant: DomainsContactParams;
  tech: DomainsContactParams;
  admin: DomainsContactParams;
  auxBilling: DomainsContactParams;
}

export interface DomainsSetContactsResult {
  domain: string;
  isSuccess: boolean;
}

const setContacts = /* @__PURE__ */ defineCommand<
  DomainsSetContactsParams,
  DomainsSetContactsResult
>({
  name: "namecheap.domains.setContacts",
  parse: (cr) => {
    const result = cr.one("DomainSetContactResult");
    return { domain: result.string("Domain"), isSuccess: result.boolean("IsSuccess") };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.create
// ---------------------------------------------------------------------------

/**
 * @remarks Billed: this command charges your Namecheap account.
 */
export interface DomainsCreateParams {
  domainName: string;
  years: number;
  promotionCode?: string;
  registrant: DomainsContactParams;
  tech: DomainsContactParams;
  admin: DomainsContactParams;
  auxBilling: DomainsContactParams;
  /** Comma-separated custom nameservers. */
  nameservers?: string;
  /** Add free domain privacy, `Yes` or `No`. Default: Yes. */
  addFreeWhoisguard?: string;
  /** Enable domain privacy, `Yes` or `No`. Default: No. */
  wgEnabled?: string;
  isPremiumDomain?: boolean;
  /** Registration price for a premium domain. */
  premiumPrice?: number | string;
  /** Purchase fee for a premium domain during EAP. */
  eapFee?: number | string;
}

export interface DomainsCreateResult {
  domain: string;
  registered: boolean;
  chargedAmount: number;
  domainID: number;
  orderID: number;
  transactionID: number;
  /** Present in recorded responses, not in the reference's response table. */
  whoisguardEnable?: boolean;
  /** Present in recorded responses, not in the reference's response table. */
  nonRealTimeDomain?: boolean;
}

const create = /* @__PURE__ */ defineCommand<DomainsCreateParams, DomainsCreateResult>({
  name: "namecheap.domains.create",
  parse: (cr) => {
    const result = cr.one("DomainCreateResult");
    return {
      domain: result.string("Domain"),
      registered: result.boolean("Registered"),
      chargedAmount: result.number("ChargedAmount"),
      domainID: result.number("DomainID"),
      orderID: result.number("OrderID"),
      transactionID: result.number("TransactionID"),
      ...optionalField("whoisguardEnable", result.lenientBoolean("WhoisguardEnable")),
      ...optionalField("nonRealTimeDomain", result.lenientBoolean("NonRealTimeDomain")),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.getTldList
// ---------------------------------------------------------------------------

export interface DomainsTld {
  name: string;
  nonRealTimeDomain: boolean;
  minRegisterYears: number;
  maxRegisterYears: number;
  minRenewYears: number;
  maxRenewYears: number;
  minTransferYears: number;
  maxTransferYears: number;
  isApiRegisterable: boolean;
  isApiRenewable: boolean;
  isApiTransferable: boolean;
  isEppRequired: boolean;
  /** Text content of the `Tld` element, e.g. `.com domain`. */
  description: string;
}

export type DomainsGetTldListResult = DomainsTld[];

const getTldList = /* @__PURE__ */ defineCommand<Record<string, never>, DomainsGetTldListResult>({
  name: "namecheap.domains.getTldList",
  parse: (cr) =>
    (cr.optional("Tlds")?.all("Tld") ?? []).map((tld) => ({
      name: tld.string("Name"),
      // The live API sends NonRealTime; the reference (and older fixtures) say NonRealTimeDomain.
      nonRealTimeDomain: tld.optionalBoolean("NonRealTime") ?? tld.boolean("NonRealTimeDomain"),
      minRegisterYears: tld.number("MinRegisterYears"),
      maxRegisterYears: tld.number("MaxRegisterYears"),
      minRenewYears: tld.number("MinRenewYears"),
      maxRenewYears: tld.number("MaxRenewYears"),
      minTransferYears: tld.number("MinTransferYears"),
      maxTransferYears: tld.number("MaxTransferYears"),
      isApiRegisterable: tld.boolean("IsApiRegisterable"),
      isApiRenewable: tld.boolean("IsApiRenewable"),
      isApiTransferable: tld.boolean("IsApiTransferable"),
      isEppRequired: tld.boolean("IsEppRequired"),
      description: tld.text(),
    })),
});

// ---------------------------------------------------------------------------
// namecheap.domains.getContacts
// ---------------------------------------------------------------------------

export interface DomainsGetContactsParams {
  domainName: string;
}

/** A contact as returned by getContacts; the API omits fields it has no value for. */
export interface DomainsContact {
  organizationName?: string;
  jobTitle?: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  emailAddress?: string;
}

export interface DomainsGetContactsResult {
  domain: string;
  /** Sent as the lower-case attribute `domainnameid`. */
  domainnameid: number;
  /** Absent in live responses, which carry ReadOnly on each contact block instead. */
  readonly?: boolean;
  registrant?: DomainsContact;
  tech?: DomainsContact;
  admin?: DomainsContact;
  auxBilling?: DomainsContact;
}

function parseContact(contact: El): DomainsContact {
  const text = (name: string) => contact.optionalText(name);
  return {
    ...optionalField("organizationName", text("OrganizationName")),
    ...optionalField("jobTitle", text("JobTitle")),
    ...optionalField("firstName", text("FirstName")),
    ...optionalField("lastName", text("LastName")),
    ...optionalField("address1", text("Address1")),
    ...optionalField("address2", text("Address2")),
    ...optionalField("city", text("City")),
    ...optionalField("stateProvince", text("StateProvince")),
    ...optionalField("postalCode", text("PostalCode")),
    ...optionalField("country", text("Country")),
    ...optionalField("phone", text("Phone")),
    ...optionalField("emailAddress", text("EmailAddress")),
  };
}

const getContacts = /* @__PURE__ */ defineCommand<
  DomainsGetContactsParams,
  DomainsGetContactsResult
>({
  name: "namecheap.domains.getContacts",
  parse: (cr) => {
    const result = cr.one("DomainContactsResult");
    const contact = (name: string) => {
      const found = result.optional(name);
      return found === undefined ? undefined : parseContact(found);
    };
    return {
      domain: result.string("Domain"),
      domainnameid: result.number("domainnameid"),
      ...optionalField(
        "readonly",
        result.optionalBoolean("ReadOnly") ?? result.optionalBoolean("Readonly"),
      ),
      ...optionalField("registrant", contact("Registrant")),
      ...optionalField("tech", contact("Tech")),
      ...optionalField("admin", contact("Admin")),
      ...optionalField("auxBilling", contact("AuxBilling")),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.getInfo
// ---------------------------------------------------------------------------

export interface DomainsGetInfoParams {
  domainName: string;
  /** Hosted domain name for which domain info is requested. */
  hostName?: string;
}

export interface DomainsGetInfoResult {
  /** Documented as OK, Locked or Expired; absent from the recorded response. */
  status?: string;
  id: number;
  domainName: string;
  ownerName: string;
  isOwner: boolean;
  isPremium: boolean;
  domainDetails: {
    /** `MM/DD/YYYY`. */
    createdDate?: string;
    /** `MM/DD/YYYY`. */
    expiredDate?: string;
    numYears: number;
  };
  whoisguard: {
    /** `True`, `False` or `NotAlloted`. */
    enabled: string;
    /** 0 means not alloted. */
    id: number;
    expiredDate?: string;
    emailDetails?: {
      whoisGuardEmail: string;
      forwardedTo: string;
      lastAutoEmailChangeDate: string;
      autoEmailChangeFrequencyDays: number;
    };
  };
  premiumDnsSubscription: {
    useAutoRenew: boolean;
    /** -1 means no subscription. */
    subscriptionId: number;
    /** ISO without zone; `0001-01-01T00:00:00` means never. */
    createdDate: string;
    expirationDate: string;
    isActive: boolean;
  };
  dnsDetails: {
    providerType: string;
    isUsingOurDNS: boolean;
    hostCount: number;
    emailType: string;
    dynamicDNSStatus: boolean;
    isFailover: boolean;
    nameservers: string[];
  };
  modificationrights: {
    all?: boolean;
    rights: Array<{ type: string; value: string }>;
  };
}

function parseWhoisguard(whoisguard: El): DomainsGetInfoResult["whoisguard"] {
  const emailDetails = whoisguard.optional("EmailDetails");
  return {
    enabled: whoisguard.string("Enabled"),
    id: whoisguard.one("ID").numberText(),
    ...optionalField("expiredDate", whoisguard.optionalText("ExpiredDate")),
    ...optionalField(
      "emailDetails",
      emailDetails === undefined
        ? undefined
        : {
            whoisGuardEmail: emailDetails.string("WhoisGuardEmail"),
            forwardedTo: emailDetails.string("ForwardedTo"),
            lastAutoEmailChangeDate: emailDetails.string("LastAutoEmailChangeDate"),
            autoEmailChangeFrequencyDays: emailDetails.number("AutoEmailChangeFrequencyDays"),
          },
    ),
  };
}

const getInfo = /* @__PURE__ */ defineCommand<DomainsGetInfoParams, DomainsGetInfoResult>({
  name: "namecheap.domains.getInfo",
  parse: (cr) => {
    const result = cr.one("DomainGetInfoResult");
    const details = result.one("DomainDetails");
    const premiumDns = result.one("PremiumDnsSubscription");
    const dns = result.one("DnsDetails");
    const rights = result.one("Modificationrights");
    return {
      ...optionalField("status", result.optionalString("Status")),
      id: result.number("ID"),
      domainName: result.string("DomainName"),
      ownerName: result.string("OwnerName"),
      isOwner: result.boolean("IsOwner"),
      isPremium: result.boolean("IsPremium"),
      domainDetails: {
        ...optionalField("createdDate", details.optionalText("CreatedDate")),
        ...optionalField("expiredDate", details.optionalText("ExpiredDate")),
        numYears: details.one("NumYears").numberText(),
      },
      whoisguard: parseWhoisguard(result.one("Whoisguard")),
      premiumDnsSubscription: {
        useAutoRenew: premiumDns.one("UseAutoRenew").booleanText(),
        subscriptionId: premiumDns.one("SubscriptionId").numberText(),
        createdDate: premiumDns.one("CreatedDate").text(),
        expirationDate: premiumDns.one("ExpirationDate").text(),
        isActive: premiumDns.one("IsActive").booleanText(),
      },
      dnsDetails: {
        providerType: dns.string("ProviderType"),
        isUsingOurDNS: dns.boolean("IsUsingOurDNS"),
        hostCount: dns.number("HostCount"),
        emailType: dns.string("EmailType"),
        dynamicDNSStatus: dns.boolean("DynamicDNSStatus"),
        isFailover: dns.boolean("IsFailover"),
        nameservers: dns.all("Nameserver").map((nameserver) => nameserver.text()),
      },
      modificationrights: {
        ...optionalField("all", rights.optionalBoolean("All")),
        rights: rights.all("Rights").map((right) => ({
          type: right.string("Type"),
          value: right.text(),
        })),
      },
    };
  },
});

/**
 * The command table behind `client.domains`. Advanced use only: it is exported for custom
 * integrations and is not covered by semver stability.
 */
export const domainsCommands = {
  getList,
  check,
  getRegistrarLock,
  setRegistrarLock,
  reactivate,
  renew,
  setContacts,
  create,
  getTldList,
  getContacts,
  getInfo,
};

/**
 * Every command of this group as a standalone export (`<group><Method>`), for
 * tree-shaken use with `run(command, send, params)`; see the README.
 */
export {
  getList as domainsGetList,
  check as domainsCheck,
  getRegistrarLock as domainsGetRegistrarLock,
  setRegistrarLock as domainsSetRegistrarLock,
  reactivate as domainsReactivate,
  renew as domainsRenew,
  setContacts as domainsSetContacts,
  create as domainsCreate,
  getTldList as domainsGetTldList,
  getContacts as domainsGetContacts,
  getInfo as domainsGetInfo,
};
