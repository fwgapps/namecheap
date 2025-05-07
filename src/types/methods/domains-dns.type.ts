export interface SetDefaultSuccess {
    domainDnsSetDefaultResult: string
}

export interface SetCustomSuccess {
    domainDNSSetCustomResult: string
}

export interface GetListSuccess {
    domainDnsGetListResult: {
        nameserver: Array<string>,
        domain: string,
        isUsingOurDns: boolean
    }
}

interface Host {
    hostId: number,
    name: string,
    type: string,
    address: string,
    mxPref: number,
    ttl: number
}

export interface GetHostsSuccess {
    domainDnsGetHostsResult: {
        host: Array<Host>,
        domain: string,
        isUsingOurDns: boolean
    }
}

interface Forward {
    value: string,
    mailbox: string
}

export interface GetEmailForwardingSuccess {
    domainDnsGetEmailForwardingResult: {
        forward: Array<Forward>,
        domain: string,
    }
}

export interface SetEmailForwardingSuccess {
    domainDnsSetEmailForwardingResult: string
}

export interface SetHostsSuccess {
    domainDnsSetHostsResult: string
}