import type { Paging } from "./base.type";

export interface GetListSuccess {
    domainGetListResult: Array<{
        id: number,
        name: string,
        user: string,
        created: string,
        expires: string,
        isExpired: boolean,
        isLocked: boolean,
        autoRenew: boolean,
        whoisGuard: string,
        isPremium: boolean,
        isOurDns: boolean
    }>,
    paging: Paging
}

export interface Contacts {
    registrant: ContactDetail,
    tech: ContactDetail,
    admin: ContactDetail,
    auxBilling: ContactDetail,
}

export interface ContactDetail {
    organizationName: string,
    jobTitle: string,
    firstName: string,
    lastName: string,
    address1: string,
    address2: string,
    city: string,
    stateProvince: string,
    stateProvinceChoice: string,
    postalCode: number,
    country: string,
    phone: number,
    fax: number,
    emailAddress: string,
    phoneExt: number,
    readOnly: boolean
}

interface CurrentAttributes {
    registrantNexus: string,
    registrantPurpose: string
}

export interface GetContactSuccess {
    domainContactsResult: Contacts & {
        currentAttributes: CurrentAttributes,
        whoisGuardContact: Contacts & {
            whoisGuardContact: boolean
        },
        domain: string,
        domainnameid: number
    }
}

export interface CreateSuccess {
    domain: string,
    registered: boolean,
    chargedAmount: number,
    domainID: number,
    orderID: number,
    transactionID: number,
    whoisguardEnable: boolean,
    nonRealTimeDomain: boolean
}

interface Category {
    name: string,
    sequenceNumber: number,
}

export interface GetTldListSuccess {
   tlds: Array<{
       name: string,
       nonRealTime: boolean,
       minRegisterYears: number,
       maxRegisterYears: number,
       minRenewYears: number,
       maxRenewYears: number,
       renewalMinDays: number,
       renewalMaxDays: number,
       reactivateMaxDays: number,
       minTransferYears: number,
       maxTransferYears: number,
       isApiRegisterable: boolean,
       isApiRenewable: boolean,
       isApiTransferable: boolean,
       isEppRequired: boolean,
       isDisableModContact: boolean,
       isDisableWGAllot: boolean,
       isIncludeInExtendedSearchOnly: boolean,
       sequenceNumber: number,
       type: string,
       subType: string,
       isSupportsIDN: boolean,
       category: string,
       supportsRegistrarLock: boolean,
       addGracePeriodDays: number,
       whoisVerification: boolean,
       providerApiDelete: boolean,
       tldState: string,
       searchGroup: string,
       registry: string
       categories: Array<Category>
   }>
}

export interface SetContactSuccess {
    domainSetContactResult: string
}

export interface CheckSuccess {
    domainCheckResult: {
        domain: string,
        available: boolean,
        errorNo: number,
        isPremiumName: boolean,
        premiumRegistrationPrice: number,
        premiumRenewalPrice: number,
        premiumRestorePrice: number,
        premiumTransferPrice: number,
        icannFee: number,
        eapFee: number
    }
}
