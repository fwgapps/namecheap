export interface DNSGenericParams {
    sld: string
    tld: string
}

export type SetDNSDefaultParams = DNSGenericParams;

export interface SetDNSCustomParams extends DNSGenericParams {
    nameservers: Array<string>
}

export type GetDNSListParams = DNSGenericParams;
export type GetDNSHostsParams = DNSGenericParams;

export interface GetDNSEmailForwardingParams {
    domainName: string
};

export interface SetDNSEmailForwardingParams {
    domainName: string,
    MailBox: Array<string>,
    ForwardTo: Array<string>
}

export enum RecordType {
    A = "A",
    AAAA = "AAAA",
    ALIAS = "ALIAS",
    CAA = "CAA",
    CNAME = "CNAME",
    MX = "MX",
    MXE = "MXE",
    NS = "NS",
    TXT = "TXT",
    URL = "URL",
    URL301 = "URL301",
    FRAME = "FRAME"
}

export enum EmailType {
    MXE = "MXE",
    MX = "MX",
    FWD = "FWD",
    OX = "OX"
}

export interface Host {
    hostname: string,
    recordType: RecordType,
    address: string,
    mxpref?: string,
    ttl?: number,
}

export interface SetDNSHostsParams {
    sld: string,
    tld: string,
    emailType?: EmailType,
    flag?: number,
    tag?: string
    hostname: Array<string>,
    ttl: Array<number>,
    address: Array<string>,
    mxpref: Array<string>,
    recordType: Array<RecordType>
}

export interface SetDNSHostsFormattedParams {
    emailType?: EmailType,
    flag?: number,
    tag?: string
    hostname: Array<string>,
    ttl: Array<number>,
    address: Array<string>,
    mxpref: Array<string>,
    recordType: Array<RecordType>
}