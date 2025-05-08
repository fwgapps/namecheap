import type { ContactDetail, Contacts } from "../response/domains.type";

/**
 * Represents a type that defines a set of standardized language codes.
 * Each language code corresponds to a specific language or dialect typically defined
 * by their internationally recognized abbreviations. These codes follow conventions used
 * in software and internationalization frameworks for language identification.
 */
export type IdnCode =
    "afr"
    | "alb"
    | "ara"
    | "arg"
    | "arm"
    | "asm"
    | "ast"
    | "ave"
    | "awa"
    | "aze"
    | "bak"
    | "bal"
    | "ban"
    | "baq"
    | "bas"
    | "bel"
    | "ben"
    | "bho"
    | "bos"
    | "bul"
    | "bur"
    | "car"
    | "cat"
    | "che"
    | "chi"
    | "chv"
    | "cop"
    | "cos"
    | "cze"
    | "dan"
    | "div"
    | "doi"
    | "dut"
    | "eng"
    | "est"
    | "fao"
    | "fij"
    | "fin"
    | "fre"
    | "fry"
    | "geo"
    | "ger"
    | "gla"
    | "gle"
    | "gon"
    | "gre"
    | "guj"
    | "heb"
    | "hin"
    | "hun"
    | "inc"
    | "ind"
    | "inh"
    | "isl"
    | "ita"
    | "jav"
    | "jpn"
    | "kas"
    | "kaz"
    | "khm"
    | "kir"
    | "kor"
    | "kur"
    | "lao"
    | "lav"
    | "lit"
    | "ltz"
    | "mal"
    | "mkd"
    | "mlt"
    | "mol"
    | "mon"
    | "mri"
    | "msa"
    | "nep"
    | "nor"
    | "ori"
    | "oss"
    | "pan"
    | "per"
    | "pol"
    | "por"
    | "pus"
    | "raj"
    | "rum"
    | "rus"
    | "san"
    | "scr"
    | "sin"
    | "slo"
    | "slv"
    | "smo"
    | "snd"
    | "som"
    | "spa"
    | "srd"
    | "srp"
    | "swa"
    | "swe"
    | "syr"
    | "tam"
    | "tel"
    | "tgk"
    | "tha"
    | "tib"
    | "tur"
    | "ukr"
    | "urd"
    | "uzb"
    | "vie"
    | "wel"
    | "yid";


/**
 * Represents a predefined type of list used for categorization or filtering.
 *
 * "ALL" - Represents all items in the list without any filtering.
 * "EXPIRING" - Represents items that are nearing their expiration or due date.
 * "EXPIRED" - Represents items that have already passed their expiration or due date.
 */
export type ListType = "ALL" | "EXPIRING" | "EXPIRED"

/**
 * SortBy represents the sorting options for a collection of items.
 * Each option specifies an attribute to sort by and the sort order.
 *
 * - "NAME": Sort by name in ascending order.
 * - "NAME_DESC": Sort by name in descending order.
 * - "EXPIREDATE": Sort by expiration date in ascending order.
 * - "EXPIREDATE_DESC": Sort by expiration date in descending order.
 * - "CREATEDATE": Sort by creation date in ascending order.
 * - "CREATEDATE_DESC": Sort by creation date in descending order.
 */
export type SortBy = "NAME" | "NAME_DESC" | "EXPIREDATE" | "EXPIREDATE_DESC" | "CREATEDATE" | "CREATEDATE_DESC"

/**
 * Represents the parameters for obtaining a list with optional filters and pagination.
 *
 * @interface GetListParams
 *
 * @property {ListType} [listType] The type of list to retrieve; optional.
 * @property {string} [searchTerm] A search query to filter the list; optional.
 * @property {number} [page] The page number for paginated results; optional.
 * @property {number} [pageSize] The number of items per page for paginated results; optional.
 * @property {SortBy} [sortBy] The sorting criteria for the list; optional.
 */
export interface GetListParams {
    listType?: ListType,
    searchTerm?: string,
    page?: number,
    pageSize?: number,
    sortBy?: SortBy
}

/**
 * Represents the parameters required to fetch contact information for a specific domain.
 *
 * @interface GetContactParams
 * @property {string} domainName - The name of the domain for which contact information is being retrieved.
 */
export interface GetContactParams {
    domainName: string
}

/**
 * Represents the details required to create a new domain registration.
 *
 * This interface extends the `Contacts` interface, inheriting contact information properties.
 * It includes properties for specifying domain details, registration duration, billing information,
 * and other settings or attributes related to the domain.
 *
 * Properties:
 * - `domainName`: The name of the domain to be registered.
 * - `years`: The number of years for which the domain will be registered.
 * - `promoCode`: (Optional) A promotional code that might be applied during registration.
 * - `billing`: (Optional) Billing contact details provided as a partial contact detail object.
 * - `idnCode`: (Optional) Internationalized domain name code, if applicable.
 * - `extendedAttributes`: Attributes extended for domain registration based on requirements.
 * - `nameservers`: (Optional) Name servers assigned to the domain.
 * - `addFreeWhoisguard`: (Optional) Specifies if free WHOIS Guard should be added.
 * - `WGEnabled`: (Optional) Indicates if WHOIS Guard is enabled for the domain.
 * - `isPremiumDomain`: (Optional) Denotes whether the domain is a premium domain.
 * - `premiumPrice`: (Optional) The price of the premium domain, if applicable.
 * - `eapPrice`: (Optional) Early access pricing for the domain, if in an early access phase.
 */
export interface CreateDomainParams extends Contacts {
    domainName: string,
    years: number,
    promoCode?: string,
    billing?: Partial<ContactDetail>,
    idnCode?: IdnCode,
    extendedAttributes: string,
    nameservers?: string,
    addFreeWhoisguard?: string,
    WGEnabled?: string,
    isPremiumDomain?: boolean,
    premiumPrice?: number,
    eapPrice?: number
}

/**
 * Represents a contact domain that extends the base Contacts interface.
 * It includes additional attributes specific to domain-level contacts.
 *
 * @interface ContactDomainParams
 * @extends Contacts
 */
export interface ContactDomainParams extends Contacts {
    domainName: string,
    extendedAttributes: string
}

/**
 * Represents the details required to reactivate a domain.
 *
 * @interface ReactivateDomainParams
 * @property {string} domainName - The name of the domain to be reactivated.
 * @property {string} [promotionCode] - Optional promotion code to be applied during reactivation.
 * @property {number} [yearsToAdd] - Optional number of years to extend the domain registration upon reactivation.
 * @property {boolean} [isPremiumDomain] - Indicates if the domain is a premium domain.
 * @property {number} [premiumPrice] - The cost associated with reactivating a premium domain, if applicable.
 */
export interface ReactivateDomainParams {
    domainName: string,
    promotionCode?: string,
    yearsToAdd?: number,
    isPremiumDomain?: boolean,
    premiumPrice?: number
}

/**
 * Represents the data required to renew a domain.
 *
 * @interface RenewDomainParams
 *
 * @property {string} domainName - The name of the domain to be renewed.
 * @property {number} years - The number of years for which the domain should be renewed.
 * @property {string} [promotionCode] - An optional promotional code to apply during renewal.
 * @property {boolean} [isPremiumDomain] - Indicates if the domain is a premium domain.
 * @property {number} [premiumPrice] - The price of the premium domain, if applicable.
 */
export interface RenewDomainParams {
    domainName: string,
    years: number,
    promotionCode?: string,
    isPremiumDomain?: boolean,
    premiumPrice?: number
}

/**
 * Represents an action that can be performed to modify a lock state.
 *
 * The `LockAction` type can either be:
 * - "LOCK": Represents an action to lock.
 * - "UNLOCK": Represents an action to unlock.
 */
export type LockAction = "LOCK" | "UNLOCK"

/**
 * Represents the structure required to set or manage a registrar lock for a domain.
 * The registrar lock prevents unauthorized transfer or modification of the domain.
 *
 * @interface SetRegistrarLockParams
 *
 * @property {string} domainName - The fully qualified domain name (FQDN) to which the registrar lock action will be applied.
 *
 * @property {LockAction} lockAction - Specifies the action to be performed on the registrar lock, such as enabling or disabling it.
 */
export interface SetRegistrarLockParams {
    domainName: string,
    lockAction: LockAction
}

/**
 * Represents a structure to store information about a domain and its host.
 *
 * @interface GetInfoParams
 * @property {string} domainName - The name of the domain.
 * @property {string} [hostName] - The optional name of the host associated with the domain.
 */
export interface GetInfoParams {
    domainName: string
    hostName?: string
}