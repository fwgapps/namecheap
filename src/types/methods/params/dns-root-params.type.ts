import {EmailType, RecordType} from "@fwg/types/methods/params/dns-params.type";

interface Host {
    hostname: string,
    recordType: RecordType,
    address: string,
    mxpref?: string,
    ttl?: number,
}

export interface SetDNSRootHostsParams {
    hosts: Array<Host>
    emailType?: EmailType,
    flag?: number,
    tag?: string
}