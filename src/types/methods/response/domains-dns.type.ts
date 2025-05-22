export interface SetDNSDefaultSuccess {
  domainDnsSetDefaultResult: string;
}

export interface SetDNSCustomSuccess {
  domainDNSSetCustomResult: string;
}

export interface DomainDnsGetListResult {
  nameserver: Array<string>;
  domain: string;
  isUsingOurDns: boolean;
}

export interface GetDNSListSuccess {
  domainDnsGetListResult: DomainDnsGetListResult;
}

interface Host {
  hostId: number;
  name: string;
  type: string;
  address: string;
  mxPref: number;
  ttl: number;
}

export interface DomainDnsGetHostsResult {
  host: Array<Host>;
  domain: string;
  isUsingOurDns: boolean;
}

export interface GetDNSHostsSuccess {
  domainDnsGetHostsResult: DomainDnsGetHostsResult;
}

interface Forward {
  value: string;
  mailbox: string;
}

export interface DomainDnsGetEmailForwardingResult {
  forward: Array<Forward>;
  domain: string;
}

export interface GetDNSEmailForwardingSuccess {
  domainDnsGetEmailForwardingResult: DomainDnsGetEmailForwardingResult;
}

export interface SetDNSEmailForwardingSuccess {
  domainDnsSetEmailForwardingResult: string;
}

export interface SetDNSHostsSuccess {
  domainDnsSetHostsResult: Array<string>;
}
