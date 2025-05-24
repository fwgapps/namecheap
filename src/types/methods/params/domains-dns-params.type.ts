import type { EmailType, RecordType } from "@fwg/types/enum";

export type SetDNSDefaultParams = DNSGenericParams;
export type GetDNSListParams = DNSGenericParams;
export type GetDNSHostsParams = DNSGenericParams;

export interface DNSGenericParams {
  sld: string;
  tld: string;
}

export interface SetDNSCustomParams extends DNSGenericParams {
  nameservers: Array<string>;
}

export interface GetDNSEmailForwardingParams {
  domainName: string;
}

export interface SetDNSEmailForwardingParams {
  domainName: string;
  mailBox: Array<string>;
  forwardTo: Array<string>;
}

export interface Host {
  hostname: string;
  recordType: RecordType;
  address: string;
  mxpref?: string;
  ttl?: number;
}

export interface SetDNSHostsParams {
  sld: string;
  tld: string;
  emailType?: EmailType;
  flag?: number;
  tag?: string;
  hostname: Array<string>;
  ttl: Array<number>;
  address: Array<string>;
  mxpref: Array<string>;
  recordType: Array<RecordType>;
}

export interface SetDNSHostsFormattedParams {
  emailType?: EmailType;
  flag?: number;
  tag?: string;
  hostname: Array<string>;
  ttl: Array<number>;
  address: Array<string>;
  mxpref: Array<string>;
  recordType: Array<RecordType>;
}
