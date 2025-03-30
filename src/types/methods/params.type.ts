import {ContactDetail, Contacts} from "./domains.type";

export interface GetContactParams {
    domainName: string
}

export interface CreateDomain extends Contacts {
    domainName: string,
    years: number,
    promoCode?: string,
    billing?: Partial<ContactDetail>,
    idnCode?: string,
    extendedAttributes: string,
    nameservers?: string,
    addFreeWhoisguard?: string,
    WGEnabled?: string,
    isPremiumDomain?: boolean,
    premiumPrice?: number,
    eapPrice?: number
}

export interface ContactDomain extends Contacts {
    domainName: string,
    extendedAttributes: string
}

export interface EmptyParams {}
