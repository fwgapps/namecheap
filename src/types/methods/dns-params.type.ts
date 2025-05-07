export interface DNSGenericParams {
    sld: string
    tld: string
}

export type SetDefault = DNSGenericParams;

export interface SetCustom extends DNSGenericParams {
    nameservers: Array<string>
}

export type GetList = DNSGenericParams;
export type GetHosts = DNSGenericParams;

export interface GetEmailForwarding {
    domainName: string
};

export interface SetEmailForwarding {
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

interface Host {
    hostname: string,
    recordType: RecordType,
    address: string,
    mxpref?: string,
    ttl?: number,
}

export interface SetHosts {
    sld: string,
    tld: string,
    hosts: Array<Host>
    emailType?: EmailType,
    flag?: number,
    tag?: string
}