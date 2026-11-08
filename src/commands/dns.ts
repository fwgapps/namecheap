import { defineCommand } from "../core/define";
import type { El } from "../core/element";

/** Spreads `{ [key]: value }` only when the value is present. */
function optionalField<K extends string, V>(key: K, value: V | undefined): { [P in K]?: V } {
  return value === undefined ? {} : ({ [key]: value } as { [P in K]?: V });
}

// ---------------------------------------------------------------------------
// namecheap.domains.dns.setDefault
// ---------------------------------------------------------------------------

export interface DnsSetDefaultParams {
  /** SLD of the domain name. */
  sld: string;
  /** TLD of the domain name. */
  tld: string;
}

export interface DnsSetDefaultResult {
  domain: string;
  updated: boolean;
}

const setDefault = defineCommand<DnsSetDefaultParams, DnsSetDefaultResult>({
  name: "namecheap.domains.dns.setDefault",
  parse: (cr) => {
    const result = cr.one("DomainDNSSetDefaultResult");
    return { domain: result.string("Domain"), updated: result.boolean("Updated") };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.dns.setCustom
// ---------------------------------------------------------------------------

export interface DnsSetCustomParams {
  sld: string;
  tld: string;
  /** Comma-separated list of nameservers. */
  nameservers: string;
}

export interface DnsSetCustomResult {
  domain: string;
  updated: boolean;
}

const setCustom = defineCommand<DnsSetCustomParams, DnsSetCustomResult>({
  name: "namecheap.domains.dns.setCustom",
  parse: (cr) => {
    const result = cr.one("DomainDNSSetCustomResult");
    return { domain: result.string("Domain"), updated: result.boolean("Updated") };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.dns.getList
// ---------------------------------------------------------------------------

export interface DnsGetListParams {
  sld: string;
  tld: string;
}

export interface DnsGetListResult {
  domain: string;
  isUsingOurDNS: boolean;
  /** Present in recorded responses, not in the reference. */
  isPremiumDNS?: boolean;
  /** Present in recorded responses, not in the reference. */
  isUsingFreeDNS?: boolean;
  /** Present in recorded responses, not in the reference. */
  nameservers: string[];
}

const getList = defineCommand<DnsGetListParams, DnsGetListResult>({
  name: "namecheap.domains.dns.getList",
  parse: (cr) => {
    const result = cr.one("DomainDNSGetListResult");
    return {
      domain: result.string("Domain"),
      isUsingOurDNS: result.boolean("IsUsingOurDNS"),
      ...optionalField("isPremiumDNS", result.optionalBoolean("IsPremiumDNS")),
      ...optionalField("isUsingFreeDNS", result.optionalBoolean("IsUsingFreeDNS")),
      nameservers: result.all("Nameserver").map((ns) => ns.text()),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.dns.getHosts
// ---------------------------------------------------------------------------

export interface DnsGetHostsParams {
  sld: string;
  tld: string;
}

export interface DnsHost {
  /** The reference spells the attribute `HostID`; responses carry `HostId`. */
  hostId: number;
  name: string;
  type: string;
  address: string;
  mxPref: number;
  ttl: number;
  /** Present in recorded responses, not in the reference. */
  associatedAppTitle?: string;
  /** Present in recorded responses, not in the reference. */
  friendlyName?: string;
  /** Present in recorded responses, not in the reference. */
  isActive?: boolean;
  /** Present in recorded responses, not in the reference. */
  isDDNSEnabled?: boolean;
}

export interface DnsGetHostsResult {
  domain: string;
  /** Present in recorded responses, not in the reference. */
  emailType?: string;
  isUsingOurDNS: boolean;
  hosts: DnsHost[];
}

function parseHost(host: El): DnsHost {
  return {
    hostId: host.number("HostId"),
    name: host.string("Name"),
    type: host.string("Type"),
    address: host.string("Address"),
    mxPref: host.number("MXPref"),
    ttl: host.number("TTL"),
    ...optionalField("associatedAppTitle", host.optionalString("AssociatedAppTitle")),
    ...optionalField("friendlyName", host.optionalString("FriendlyName")),
    ...optionalField("isActive", host.optionalBoolean("IsActive")),
    ...optionalField("isDDNSEnabled", host.optionalBoolean("IsDDNSEnabled")),
  };
}

const getHosts = defineCommand<DnsGetHostsParams, DnsGetHostsResult>({
  name: "namecheap.domains.dns.getHosts",
  parse: (cr) => {
    const result = cr.one("DomainDNSGetHostsResult");
    return {
      domain: result.string("Domain"),
      ...optionalField("emailType", result.optionalString("EmailType")),
      isUsingOurDNS: result.boolean("IsUsingOurDNS"),
      hosts: result.all("host").map(parseHost),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.dns.getEmailForwarding
// ---------------------------------------------------------------------------

export interface DnsGetEmailForwardingParams {
  /** Domain name to get settings for. */
  domainName: string;
}

export interface DnsEmailForward {
  mailbox: string;
  /** Present in recorded responses, not in the reference. */
  forwardTo?: string;
}

export interface DnsGetEmailForwardingResult {
  domain: string;
  forwards: DnsEmailForward[];
}

const getEmailForwarding = defineCommand<DnsGetEmailForwardingParams, DnsGetEmailForwardingResult>({
  name: "namecheap.domains.dns.getEmailForwarding",
  parse: (cr) => {
    const result = cr.one("DomainEmailForwardingResult");
    return {
      domain: result.string("Domain"),
      forwards: result.all("Forward").map((forward) => ({
        mailbox: forward.string("mailbox"),
        ...optionalField("forwardTo", forward.optionalString("ForwardTo")),
      })),
    };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.dns.setEmailForwarding
// ---------------------------------------------------------------------------

/** One forwarding rule, sent as `MailBox<n>` and `ForwardTo<n>`. */
export interface DnsEmailForwardRecord {
  /** Mailbox for email forwarding (e.g. `example@domain.com`). */
  mailBox: string;
  /** Email address to forward to (e.g. `example@gmail.com`). */
  forwardTo: string;
}

export interface DnsSetEmailForwardingParams {
  domainName: string;
  forwards: DnsEmailForwardRecord[];
}

export interface DnsSetEmailForwardingResult {
  domain: string;
  isSuccess: boolean;
}

const setEmailForwarding = defineCommand<DnsSetEmailForwardingParams, DnsSetEmailForwardingResult>({
  name: "namecheap.domains.dns.setEmailForwarding",
  parse: (cr) => {
    const result = cr.one("DomainEmailForwardingResult");
    return { domain: result.string("Domain"), isSuccess: result.boolean("IsSuccess") };
  },
});

// ---------------------------------------------------------------------------
// namecheap.domains.dns.setHosts
// ---------------------------------------------------------------------------

export type DnsRecordType =
  | "A"
  | "AAAA"
  | "ALIAS"
  | "CAA"
  | "CNAME"
  | "MX"
  | "MXE"
  | "NS"
  | "TXT"
  | "URL"
  | "URL301"
  | "FRAME";

export type DnsEmailType = "NONE" | "MXE" | "MX" | "FWD" | "OX" | "GMAIL";

/** One host record, sent as `HostName<n>`, `RecordType<n>`, `Address<n>`, `MXPref<n>`, `TTL<n>`. */
export interface DnsHostRecord {
  /** Sub-domain/hostname for the record. */
  hostName: string;
  recordType: DnsRecordType;
  /** URL or IP address, depending on the record type. */
  address: string;
  /** MX preference (MX records only). Required by the reference, but optional on the wire. */
  mxPref?: number;
  /** Time to live (300-60000). */
  ttl?: number;
}

export interface DnsSetHostsParams {
  sld: string;
  tld: string;
  /** Omitted keeps the zone's current mode. */
  emailType?: DnsEmailType;
  /** Replaces the whole zone: records not listed are deleted. */
  hosts: DnsHostRecord[];
}

export interface DnsSetHostsResult {
  domain: string;
  /** Present in recorded responses, not in the reference. */
  emailType?: string;
  isSuccess: boolean;
}

const setHosts = defineCommand<DnsSetHostsParams, DnsSetHostsResult>({
  name: "namecheap.domains.dns.setHosts",
  parse: (cr) => {
    const result = cr.one("DomainDNSSetHostsResult");
    return {
      domain: result.string("Domain"),
      ...optionalField("emailType", result.optionalString("EmailType")),
      isSuccess: result.boolean("IsSuccess"),
    };
  },
});

export const dnsCommands = {
  setDefault,
  setCustom,
  getList,
  getHosts,
  getEmailForwarding,
  setEmailForwarding,
  setHosts,
};
